"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { deepQuestionnaireSteps } from "@/lib/questionnaire-deep-data";
import Link from "next/link";

type TokenStatus = "checking" | "valid" | "invalid" | "used" | "expired";

export default function DiagnosticPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("checking");
  const [contactName, setContactName] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string>("");

  // 驗證 token
  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid");
      return;
    }
    fetch(`/api/diagnostic/token?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setTokenStatus("valid");
          setContactName(data.contactName || "");
        } else {
          setTokenStatus(
            data.reason === "used" ? "used" :
            data.reason === "expired" ? "expired" : "invalid"
          );
        }
      })
      .catch(() => setTokenStatus("invalid"));
  }, [token]);

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckbox = (questionId: string, value: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      if (checked) return { ...prev, [questionId]: [...current, value] };
      return { ...prev, [questionId]: current.filter((v) => v !== value) };
    });
  };

  const currentStepData = deepQuestionnaireSteps[currentStep];
  const totalSteps = deepQuestionnaireSteps.length;

  const isStepValid = () => {
    return currentStepData.questions
      .filter((q) => q.required)
      .every((q) => {
        const val = answers[q.id];
        if (!val) return false;
        if (Array.isArray(val)) return val.length > 0;
        return val.trim() !== "";
      });
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, token }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissionId(data.id);
        setSubmitted(true);
        router.push(`/diagnostic/result/${data.id}`);
      }
    } catch {
      alert("提交失敗，請重試");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Token 驗證中 ──
  if (tokenStatus === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">驗證連結中...</p>
        </div>
      </div>
    );
  }

  // ── Token 無效 ──
  if (tokenStatus !== "valid") {
    const messages = {
      used: { title: "此健診連結已使用", desc: "每個連結只能使用一次。如需重做或有疑問，請聯繫我們。" },
      expired: { title: "此連結已過期", desc: "健診連結有效期為 30 天。如需重新取得連結，請聯繫我們。" },
      invalid: { title: "連結無效", desc: "請確認連結是否正確，或聯繫我們重新取得。" },
    };
    const msg = messages[tokenStatus as keyof typeof messages] || messages.invalid;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{msg.title}</h1>
          <p className="text-gray-500 mb-8">{msg.desc}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/plans/social-audit" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
              重新購買健診
            </Link>
            <Link href="/contact" className="px-6 py-3 border-2 border-gray-300 text-gray-600 font-semibold rounded-xl hover:border-gray-400 transition-colors">
              聯繫我們
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── 問卷主體 ──
  const progress = ((currentStep) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-indigo-600">惠邦行銷</Link>
          <span className="text-sm text-gray-400">深度社群健診</span>
        </div>
        {/* 進度條 */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {/* 開場說明（第一步才顯示） */}
        {currentStep === 0 && (
          <div className="mb-8 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
            <p className="text-indigo-700 text-sm leading-relaxed">
              {contactName ? `${contactName}，你好！` : "你好！"}
              你已完成基礎品牌健檢，現在這份問卷會專注在你的社群帳號深挖，
              大約需要 <strong>10 分鐘</strong>。填完後 AI 會立即產出你的專屬健診報告。
            </p>
          </div>
        )}

        {/* 步驟標題 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{currentStepData.icon}</span>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                第 {currentStep + 1} 部分，共 {totalSteps} 部分
              </p>
              <h2 className="text-xl font-bold text-gray-900">{currentStepData.title}</h2>
            </div>
          </div>
          <p className="text-gray-500 text-sm ml-12">{currentStepData.subtitle}</p>
        </div>

        {/* 題目 */}
        <div className="space-y-8">
          {currentStepData.questions.map((question) => (
            <div key={question.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <label className="block text-base font-semibold text-gray-900 mb-1">
                {question.label}
                {question.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {question.helpText && (
                <p className="text-xs text-gray-400 mb-4">{question.helpText}</p>
              )}

              {/* Radio */}
              {question.type === "radio" && question.options && (
                <div className="space-y-2">
                  {question.options.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        answers[question.id] === opt.value
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-100 hover:border-indigo-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={opt.value}
                        checked={answers[question.id] === opt.value}
                        onChange={() => handleAnswer(question.id, opt.value)}
                        className="accent-indigo-600"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Checkbox */}
              {question.type === "checkbox" && question.options && (
                <div className="space-y-2">
                  {question.options.map((opt) => {
                    const checked = ((answers[question.id] as string[]) || []).includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          checked ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-indigo-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={opt.value}
                          checked={checked}
                          onChange={(e) => handleCheckbox(question.id, opt.value, e.target.checked)}
                          className="accent-indigo-600"
                        />
                        <span className="text-sm text-gray-700">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Text / URL */}
              {(question.type === "text" || question.type === "url") && (
                <input
                  type={question.type}
                  placeholder={question.placeholder}
                  value={(answers[question.id] as string) || ""}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors"
                />
              )}

              {/* Textarea */}
              {question.type === "textarea" && (
                <textarea
                  placeholder={question.placeholder}
                  value={(answers[question.id] as string) || ""}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors resize-none"
                />
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-5 py-3 text-sm text-gray-500 font-medium disabled:opacity-0 hover:text-gray-800 transition-colors"
          >
            ← 上一步
          </button>

          {currentStep < totalSteps - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl disabled:opacity-40 hover:shadow-lg hover:shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
            >
              下一步 →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !isStepValid()}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl disabled:opacity-40 hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI 分析中...
                </>
              ) : "提交，產出我的報告 🎯"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

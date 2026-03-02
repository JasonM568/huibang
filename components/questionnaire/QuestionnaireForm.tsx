"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  questionnaireSteps,
  QuestionnaireAnswers,
} from "@/lib/questionnaire-data";
import ProgressBar from "./ProgressBar";
import QuestionField from "./QuestionField";

export default function QuestionnaireForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const step = questionnaireSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === questionnaireSteps.length - 1;

  // Update answer
  const handleChange = useCallback(
    (id: string, value: string | string[]) => {
      setAnswers((prev) => ({ ...prev, [id]: value }));
      // Clear error when user types
      if (errors[id]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    },
    [errors]
  );

  // Validate current step
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    step.questions.forEach((q) => {
      if (q.required) {
        const val = answers[q.id];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          newErrors[q.id] = "此欄位為必填";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Scroll to form area (not page top)
  const scrollToForm = () => {
    const el = document.getElementById("questionnaire-form");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // Next step
  const handleNext = () => {
    if (!validateStep()) return;
    setCurrentStep((prev) => Math.min(prev + 1, questionnaireSteps.length - 1));
    scrollToForm();
  };

  // Previous step
  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    scrollToForm();
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "提交失敗");
      }

      // 觸發 Meta Pixel 自訂轉換事件
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "CompleteRegistration", {
          content_name: "品牌健檢問卷",
          status: true,
        });
      }

      // 觸發 GA4 自訂事件
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "questionnaire_complete", {
          event_category: "engagement",
          event_label: "品牌健檢問卷完成",
        });
      }

      // Redirect to result page
      router.push(`/result/${data.id}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "提交失敗，請稍後再試"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <ProgressBar
          currentStep={currentStep}
          totalSteps={questionnaireSteps.length}
          stepTitles={questionnaireSteps.map((s) => s.title)}
        />
      </div>

      {/* Step card */}
      <div id="questionnaire-form" className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {/* Step header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{step.icon}</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {step.title}
              </h2>
              <p className="text-sm text-gray-500">{step.subtitle}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            步驟 {currentStep + 1} / {questionnaireSteps.length}
          </p>
        </div>

        {/* Questions */}
        <div>
          {step.questions.map((question) => (
            <QuestionField
              key={question.id}
              question={question}
              answers={answers}
              onChange={handleChange}
              error={errors[question.id]}
            />
          ))}
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {submitError}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handlePrev}
            disabled={isFirstStep}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isFirstStep
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            ← 上一步
          </button>

          {isLastStep ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  AI 分析中...
                </span>
              ) : (
                "提交問卷 →"
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow hover:shadow-lg"
            >
              下一步 →
            </button>
          )}
        </div>
      </div>

      {/* Privacy notice */}
      <p className="text-center text-xs text-gray-400 mt-6">
        你提供的資料僅用於品牌健檢分析，不會用於其他商業用途。
      </p>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Submission {
  id: string;
  brandName: string | null;
  industry: string | null;
  mainProducts: string | null;
  website: string | null;
  answers: Record<string, string | string[]>;
  analysis: { summary?: string } | null;
}

const toneOptions = [
  { value: "fun", label: "🔥 活潑有趣", desc: "輕鬆幽默、表情符號豐富" },
  { value: "pro", label: "💼 專業權威", desc: "數據導向、建立信任" },
  { value: "warm", label: "💝 溫暖感性", desc: "情感連結、引發共鳴" },
  { value: "inspire", label: "✨ 啟發勵志", desc: "正能量、激勵行動" },
];

export default function ContentStudioPage() {
  // Step control
  const [step, setStep] = useState<"form" | "chat">("form");

  // Brand selection
  const [brandSource, setBrandSource] = useState<"questionnaire" | "manual">("manual");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loadingSubs, setLoadingSubs] = useState(false);

  // Form fields
  const [form, setForm] = useState({
    brandName: "",
    industry: "",
    products: "",
    topic: "",
    audience: "",
    message: "",
    tone: "fun",
    promo: "",
  });

  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load questionnaire submissions for brand picker
  useEffect(() => {
    if (brandSource === "questionnaire") {
      setLoadingSubs(true);
      fetch("/api/admin/submissions?limit=50")
        .then((res) => res.json())
        .then((data) => setSubmissions(data.data || []))
        .catch(console.error)
        .finally(() => setLoadingSubs(false));
    }
  }, [brandSource]);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Select brand from questionnaire
  const selectBrand = (sub: Submission) => {
    setSelectedSubmission(sub);
    setForm({
      ...form,
      brandName: sub.brandName || "",
      industry: sub.industry || "",
      products: sub.mainProducts || (sub.answers?.a4 as string) || "",
    });
  };

  // Build brand context for AI
  const buildBrandContext = () => {
    const parts = [];
    if (form.brandName) parts.push(`品牌名稱：${form.brandName}`);
    if (form.industry) parts.push(`產業：${form.industry}`);
    if (form.products) parts.push(`主要產品/服務：${form.products}`);

    if (selectedSubmission) {
      const a = selectedSubmission.answers || {};
      if (a.a14) parts.push(`目標客群：${a.a14}`);
      if (a.a13) parts.push(`核心優勢：${a.a13}`);
      if (a.a5) parts.push(`官網：${a.a5}`);
      if (a.a6) parts.push(`社群平台：${Array.isArray(a.a6) ? a.a6.join("、") : a.a6}`);
      if (selectedSubmission.analysis?.summary) {
        parts.push(`品牌分析摘要：${selectedSubmission.analysis.summary}`);
      }
    }

    return parts.join("\n");
  };

  // Build initial prompt from form
  const buildInitialPrompt = () => {
    const toneLabel = toneOptions.find((t) => t.value === form.tone)?.label || form.tone;
    let prompt = `請幫我為以下品牌創作社群貼文：

品牌名稱：${form.brandName}
產業：${form.industry}
主要產品/服務：${form.products}

貼文主題：${form.topic}
目標受眾：${form.audience}
核心訊息：${form.message}
語調風格：${toneLabel}`;

    if (form.promo) {
      prompt += `\n促銷/活動資訊：${form.promo}`;
    }

    return prompt;
  };

  // Generate initial posts
  const handleGenerate = async () => {
    if (!form.brandName || !form.topic || !form.audience || !form.message) {
      alert("請填寫必要欄位");
      return;
    }

    const userMessage = buildInitialPrompt();
    const newMessages: Message[] = [{ role: "user", content: userMessage }];

    setMessages(newMessages);
    setStep("chat");
    setGenerating(true);

    try {
      const res = await fetch("/api/admin/content-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          brandContext: buildBrandContext(),
        }),
      });
      const data = await res.json();
      if (data.content) {
        setMessages([...newMessages, { role: "assistant", content: data.content }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: "生成失敗，請重試。" }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "發生錯誤，請重試。" }]);
    } finally {
      setGenerating(false);
    }
  };

  // Send follow-up message
  const handleSend = async () => {
    if (!input.trim() || generating) return;

    const newMessages: Message[] = [...messages, { role: "user", content: input.trim() }];
    setMessages(newMessages);
    setInput("");
    setGenerating(true);

    try {
      const res = await fetch("/api/admin/content-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          brandContext: buildBrandContext(),
        }),
      });
      const data = await res.json();
      if (data.content) {
        setMessages([...newMessages, { role: "assistant", content: data.content }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Copy to clipboard
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("已複製到剪貼簿！");
  };

  // Reset
  const handleReset = () => {
    setStep("form");
    setMessages([]);
    setInput("");
    setSelectedSubmission(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">✨ 社群貼文產生器</h1>
          <p className="text-sm text-gray-500 mt-1">
            AI 幫你快速產出多平台社群貼文
          </p>
        </div>
        {step === "chat" && (
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            ← 重新開始
          </button>
        )}
      </div>

      {step === "form" ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Brand source */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">品牌來源</h2>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setBrandSource("manual")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    brandSource === "manual"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-gray-50 text-gray-500 border border-gray-200"
                  }`}
                >
                  ✏️ 手動輸入
                </button>
                <button
                  onClick={() => setBrandSource("questionnaire")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    brandSource === "questionnaire"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-gray-50 text-gray-500 border border-gray-200"
                  }`}
                >
                  📋 從問卷帶入
                </button>
              </div>

              {brandSource === "questionnaire" ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {loadingSubs ? (
                    <div className="text-center py-8 text-gray-400">載入中...</div>
                  ) : submissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      尚無問卷資料
                    </div>
                  ) : (
                    submissions.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => selectBrand(sub)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedSubmission?.id === sub.id
                            ? "bg-blue-50 border-blue-300"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <p className="font-medium text-sm text-gray-900">
                          {sub.brandName || "未命名"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sub.industry || "未分類"} · {sub.mainProducts || ""}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">品牌名稱 *</label>
                    <input
                      type="text"
                      value={form.brandName}
                      onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：惠邦行銷"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">產業</label>
                    <input
                      type="text"
                      value={form.industry}
                      onChange={(e) => setForm({ ...form, industry: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：數位行銷"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">主要產品/服務</label>
                    <input
                      type="text"
                      value={form.products}
                      onChange={(e) => setForm({ ...form, products: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例如：品牌策略、廣告投放"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Post settings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">貼文設定</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">貼文主題 *</label>
                  <input
                    type="text"
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：新服務上線、週年慶活動、品牌理念分享"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">目標受眾 *</label>
                  <input
                    type="text"
                    value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：中小企業主、25-35歲上班族"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">核心訊息 *</label>
                  <input
                    type="text"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：用數據驅動成長、省時省力"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 mb-2">語調風格</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {toneOptions.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setForm({ ...form, tone: t.value })}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          form.tone === t.value
                            ? "bg-blue-50 border-blue-300"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <p className="text-sm font-medium">{t.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">
                    促銷/活動資訊（選填）
                  </label>
                  <textarea
                    value={form.promo}
                    onChange={(e) => setForm({ ...form, promo: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：限時 8 折、前 100 名送好禮、免費諮詢名額"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI 生成中...
                  </span>
                ) : (
                  "✨ 產生貼文"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Chat interface */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-50 text-gray-800 border border-gray-200"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div>
                      <div
                        className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: formatMarkdown(msg.content),
                        }}
                      />
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => copyText(msg.content)}
                          className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
                        >
                          📋 複製全部
                        </button>
                        {extractSections(msg.content).map((section, j) => (
                          <button
                            key={j}
                            onClick={() => copyText(section.content)}
                            className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
                          >
                            📋 {section.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {generating && (
              <div className="flex justify-start">
                <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    AI 正在生成...
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="輸入微調要求，例如：「語氣再活潑一點」「加上限時優惠」「幫我改成英文」..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={generating}
              />
              <button
                onClick={handleSend}
                disabled={generating || !input.trim()}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                送出
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              {["語氣再活潑一點", "幫我加上限時優惠", "再簡短一些", "換成專業語調"].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                    }}
                    className="text-xs px-3 py-1 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple markdown to HTML
function formatMarkdown(text: string): string {
  return text
    .replace(/### (.*?)$/gm, '<h4 class="text-base font-bold mt-4 mb-2">$1</h4>')
    .replace(/## (.*?)$/gm, '<h3 class="text-lg font-bold mt-5 mb-2">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n- /g, "\n• ")
    .replace(/\n/g, "<br />");
}

// Extract IG/FB and Threads sections for individual copy
function extractSections(text: string): { label: string; content: string }[] {
  const sections: { label: string; content: string }[] = [];

  const igMatch = text.match(
    /### 📱 Instagram \/ Facebook 版本\n([\s\S]*?)(?=###|$)/
  );
  if (igMatch) {
    sections.push({ label: "IG/FB", content: igMatch[1].trim() });
  }

  const threadsMatch = text.match(
    /### 🧵 Threads \/ 小紅書 版本\n([\s\S]*?)(?=###|$)/
  );
  if (threadsMatch) {
    sections.push({ label: "Threads", content: threadsMatch[1].trim() });
  }

  return sections;
}

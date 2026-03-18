"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import PixelViewContent from "@/components/PixelViewContent";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const painPoints = [
  {
    icon: "📍",
    title: "Google 地圖找不到",
    desc: "客人搜尋你的餐廳類型，卻看不到你的店",
  },
  {
    icon: "⭐",
    title: "評論沒人管",
    desc: "負評沒回覆、好評沒經營，潛在客人看了就走",
  },
  {
    icon: "💸",
    title: "廣告錢白花",
    desc: "Google Ads 每月燒錢，但訂位電話沒增加",
  },
  {
    icon: "📊",
    title: "數據看不懂",
    desc: "CTR、CPC、轉換率一堆數字，不知道怎麼優化",
  },
];

const serviceFeatures = [
  {
    icon: "🏪",
    title: "商家檔案全面優化",
    desc: "名稱、類別、說明欄位、圖片、Q&A、貼文策略，九大重點逐一優化",
  },
  {
    icon: "📊",
    title: "廣告策略規劃",
    desc: "定主題、鎖地區（3-5公里）、選時段、打活動，四大策略精準投放",
  },
  {
    icon: "🗺️",
    title: "消費者旅程設計",
    desc: "引流→考慮→收網三階段廣告設計，從陌生人到回頭客的完整路徑",
  },
  {
    icon: "✍️",
    title: "廣告文案撰寫",
    desc: "15 個標題 + 4 個說明，Google 自動組合出最佳版本",
  },
  {
    icon: "📈",
    title: "數據判讀與優化",
    desc: "每週追蹤 CTR/CPC/轉換率，持續優化廣告表現",
  },
];

const planFeatures = [
  "Google 商家檔案建立與優化",
  "Google Ads 廣告帳戶建立",
  "每月廣告策略規劃與調整",
  "廣告文案撰寫（每月更新）",
  "每週廣告數據追蹤與優化",
  "每月成效報告",
  "評論回覆策略指導",
  "專屬 LINE 群組即時溝通",
];

const processSteps = [
  {
    step: "01",
    title: "商家健檢",
    desc: "分析現有 Google 商家檔案，找出優化空間",
  },
  {
    step: "02",
    title: "策略規劃",
    desc: "根據餐廳特色制定廣告策略與關鍵字佈局",
  },
  {
    step: "03",
    title: "檔案優化",
    desc: "完成商家九大欄位優化，建立廣告帳戶",
  },
  {
    step: "04",
    title: "廣告上線",
    desc: "啟動三階段廣告投放，持續監測成效",
  },
  {
    step: "05",
    title: "數據優化",
    desc: "每週調整，每月報告，持續提升 ROI",
  },
];

const faqs = [
  {
    q: "合約期間是多久？",
    a: "最低合作期間為三個月。三個月後可選擇續約或調整。Google 商家優化需要持續經營，通常 3 個月開始看到明顯成效。",
  },
  {
    q: "廣告費包含在方案費用裡嗎？",
    a: "不包含。方案費用為策略規劃與執行管理費，Google Ads 廣告費由你直接支付給 Google，建議每月 NT$9,000-15,000。",
  },
  {
    q: "我的店不是餐飲業也可以嗎？",
    a: "可以！我們的服務適用於所有需要提升 Google 地圖排名的在地店家，包括美容美髮、診所、健身房、零售門市等。",
  },
  {
    q: "多久可以看到效果？",
    a: "商家檔案優化通常 2-4 週開始反映在搜尋排名，廣告效果 1-2 週即可看到初步數據，3 個月後整體效果最為顯著。",
  },
  {
    q: "可以只做商家優化不投廣告嗎？",
    a: "可以討論客製化方案，但我們強烈建議搭配廣告投放，效果會更顯著。單純商家優化的報價歡迎聯繫洽詢。",
  },
  {
    q: "免費商家健檢有什麼限制嗎？",
    a: "完全免費，沒有任何限制。AI 會根據你填寫的資訊即時分析，產出包含商家優化、廣告策略、文案建議的完整報告。",
  },
];

interface DiagnosticForm {
  businessName: string;
  businessType: string;
  location: string;
  email: string;
  phone: string;
  problems: string;
  currentAds: string;
  monthlyBudget: string;
}

interface DiagnosticResult {
  title: string;
  content: string;
}

export default function GoogleBusinessPlanPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [expandedResults, setExpandedResults] = useState<Record<number, boolean>>({});
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState<DiagnosticForm>({
    businessName: "",
    businessType: "",
    location: "",
    email: "",
    phone: "",
    problems: "",
    currentAds: "",
    monthlyBudget: "",
  });

  const handleSubmitDiagnostic = async () => {
    if (!formData.email.trim()) {
      setFormError("請填寫 Email 以接收完整報告");
      return;
    }
    setFormError("");
    setLoading(true);
    setResults([]);
    setStep(3);
    try {
      const res = await fetch("/api/gmb-diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.businessName,
          email: formData.email,
          phone: formData.phone,
          type: formData.businessType,
          location: formData.location,
          budget: formData.monthlyBudget || "尚未規劃",
          channels: "尚未確認",
          problem: formData.problems,
          adsData: formData.currentAds,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setResults([{ title: "提示", content: data.error }]);
      } else if (data.result) {
        const parsed = parseResults(data.result);
        setResults(parsed);
        setExpandedResults(
          parsed.reduce(
            (acc: Record<number, boolean>, _, i: number) => ({ ...acc, [i]: i === 0 }),
            {} as Record<number, boolean>
          )
        );
      }
    } catch {
      setResults([{ title: "錯誤", content: "分析過程中發生錯誤，請稍後再試或聯繫我們。" }]);
    } finally {
      setLoading(false);
    }
  };

  const parseResults = (text: string): DiagnosticResult[] => {
    const sections = text.split(/===\s*(.+?)\s*===/);
    const parsed: DiagnosticResult[] = [];
    for (let i = 1; i < sections.length; i += 2) {
      const title = sections[i]?.trim();
      const content = sections[i + 1]?.trim();
      if (title && content) {
        parsed.push({ title, content });
      }
    }
    if (parsed.length === 0 && text.trim()) {
      parsed.push({ title: "分析結果", content: text.trim() });
    }
    return parsed;
  };

  const toggleResult = (index: number) => {
    setExpandedResults((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const canProceedStep1 =
    formData.businessName && formData.businessType && formData.location;
  const canProceedStep2 = formData.problems && formData.email;

  return (
    <div className="min-h-screen">
      <PixelViewContent
        contentName="Google商家導流方案"
        contentCategory="服務方案"
        contentType="product"
        contentIds={["google-business"]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.08),transparent)]" />
        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <motion.div {...fadeUp}>
            <span className="inline-block px-4 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-full text-sm font-medium mb-6">
              Google 商家導流方案
            </span>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              讓附近的客人
              <br />
              <span className="text-gradient">都能找到你</span>
            </h1>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto mb-8">
              Google 我的商家優化 + Google Ads 精準投放，讓你的店家在地圖搜尋中脫穎而出，
              <br className="hidden sm:block" />
              3 個月見證成效。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                立即諮詢方案 →
              </Link>
              <a
                href="#diagnostic"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-dark-600 text-dark-300 font-semibold rounded-xl hover:border-dark-400 hover:text-white transition-all duration-300"
              >
                免費商家健檢 ↓
              </a>
            </div>
          </motion.div>

          {/* Google icons */}
          <motion.div
            className="flex justify-center gap-8 mt-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {[
              { name: "Google Maps", icon: "🗺️", color: "from-green-500 to-green-600" },
              { name: "Google Ads", icon: "💰", color: "from-blue-500 to-blue-600" },
              { name: "Google Search", icon: "🔍", color: "from-yellow-500 to-orange-500" },
            ].map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-2">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-2xl shadow-lg`}
                >
                  {p.icon}
                </div>
                <span className="text-dark-500 text-xs">{p.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              你的店家是不是也遇到這些問題？
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {painPoints.map((item, i) => (
              <motion.div
                key={item.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-5 p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300"
              >
                <div className="text-4xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-dark-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Features */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">我們幫你做什麼</h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              從商家檔案到廣告投放，一條龍服務
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {serviceFeatures.map((item, i) => (
              <motion.div
                key={item.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-5 p-6 rounded-2xl border border-gray-100 bg-white hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300"
              >
                <div className="text-4xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-dark-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="plans" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">方案費用</h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              包含 Google 商家優化 + 廣告策略執行，三個月一期
            </p>
          </motion.div>

          <motion.div
            {...stagger}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl p-8 bg-gradient-to-b from-dark-900 to-dark-800 text-white shadow-2xl shadow-dark-900/20 ring-2 ring-brand-500 max-w-lg mx-auto"
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-500 text-white text-xs font-bold rounded-full">
              3個月一期
            </span>

            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold mb-1">Google 商家導流方案</h3>
              <p className="text-sm text-dark-400">
                商家優化 + 廣告投放全包服務
              </p>
            </div>

            <div className="mb-8 text-center">
              <span className="text-sm text-dark-400">NT$</span>
              <span className="text-5xl font-black mx-1">18,800</span>
              <span className="text-sm text-dark-400">/ 月</span>
            </div>

            <ul className="space-y-3 mb-8">
              {planFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs mt-0.5">
                    ✓
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/contact"
              className="block text-center py-3 rounded-xl font-semibold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300"
            >
              立即諮詢
            </Link>
          </motion.div>

          <p className="text-center text-sm text-dark-400 mt-8">
            * 廣告費另計，建議每月 NT$9,000-15,000
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">合作流程</h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              從健檢到優化，每一步都透明清晰
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-6">
            {processSteps.map((s, i) => (
              <motion.div
                key={s.step}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
                  {s.step}
                </div>
                <h4 className="font-bold mb-2">{s.title}</h4>
                <p className="text-dark-500 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Diagnostic Tool */}
      <section id="diagnostic" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">免費 AI 商家健檢</h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              填寫你的店家資訊，AI 立即分析並提供優化建議
            </p>
          </motion.div>

          <motion.div {...fadeUp}>
            <div className="rounded-2xl bg-gradient-to-b from-dark-900 to-dark-800 p-8 shadow-2xl">
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-10">
                {[
                  { n: 1, label: "店家資訊" },
                  { n: 2, label: "問題描述" },
                  { n: 3, label: "分析報告" },
                ].map((s) => (
                  <div key={s.n} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          step >= s.n
                            ? "bg-brand-500 text-white"
                            : "bg-dark-700 text-dark-500"
                        }`}
                      >
                        {s.n}
                      </div>
                      <span className="text-xs text-dark-500 hidden sm:block">{s.label}</span>
                    </div>
                    {s.n < 3 && (
                      <div
                        className={`w-10 sm:w-16 h-0.5 mx-1 mb-5 sm:mb-5 transition-colors ${
                          step > s.n ? "bg-brand-500" : "bg-dark-700"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Business Info */}
              {step === 1 && (
                <div className="space-y-5">
                  <h3 className="text-white text-lg font-bold mb-4">
                    步驟 1：店家資訊
                  </h3>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1.5">
                      店家名稱 *
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) =>
                        setFormData({ ...formData, businessName: e.target.value })
                      }
                      placeholder="例：小王牛肉麵"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1.5">
                      業種類型 *
                    </label>
                    <input
                      type="text"
                      value={formData.businessType}
                      onChange={(e) =>
                        setFormData({ ...formData, businessType: e.target.value })
                      }
                      placeholder="例：餐廳、咖啡廳、美容院、診所"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1.5">
                      店家地址 / 所在地區 *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="例：高雄市前鎮區中華路 123 號"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    下一步 →
                  </button>
                </div>
              )}

              {/* Step 2: Problem + Contact */}
              {step === 2 && (
                <div className="space-y-5">
                  <h3 className="text-white text-lg font-bold mb-4">
                    步驟 2：問題描述與聯絡資訊
                  </h3>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1.5">
                      目前遇到的主要問題 *
                    </label>
                    <textarea
                      value={formData.problems}
                      onChange={(e) =>
                        setFormData({ ...formData, problems: e.target.value })
                      }
                      rows={4}
                      placeholder="例：客人搜尋「附近牛肉麵」找不到我們，評論很少，不知道怎麼經營 Google 商家..."
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1.5">
                      是否目前有投放 Google 廣告？
                    </label>
                    <input
                      type="text"
                      value={formData.currentAds}
                      onChange={(e) =>
                        setFormData({ ...formData, currentAds: e.target.value })
                      }
                      placeholder="例：有，每月花約 5000 元 / 沒有"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1.5">
                      每月預算範圍
                    </label>
                    <select
                      value={formData.monthlyBudget}
                      onChange={(e) =>
                        setFormData({ ...formData, monthlyBudget: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                    >
                      <option value="">請選擇</option>
                      <option value="5000以下">NT$5,000 以下</option>
                      <option value="5000-10000">NT$5,000 - 10,000</option>
                      <option value="10000-15000">NT$10,000 - 15,000</option>
                      <option value="15000-30000">NT$15,000 - 30,000</option>
                      <option value="30000以上">NT$30,000 以上</option>
                    </select>
                  </div>
                  <div className="border-t border-dark-700 pt-5">
                    <p className="text-dark-400 text-sm mb-4">填寫聯絡資訊以接收完整分析報告</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-dark-400 mb-1.5">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-dark-400 mb-1.5">
                          電話（選填）
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="0912-345-678"
                          className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  {formError && (
                    <p className="text-red-400 text-sm">{formError}</p>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 rounded-xl font-semibold border-2 border-dark-600 text-dark-300 hover:border-dark-400 hover:text-white transition-all duration-300"
                    >
                      ← 上一步
                    </button>
                    <button
                      onClick={handleSubmitDiagnostic}
                      disabled={!canProceedStep2 || loading}
                      className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          AI 分析中...
                        </span>
                      ) : (
                        "免費取得分析報告 →"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Results */}
              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="text-white text-lg font-bold mb-4">
                    分析報告
                  </h3>
                  {loading ? (
                    <div className="text-center py-12">
                      <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-brand-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <p className="text-dark-300 font-medium">AI 正在分析你的店家資訊...</p>
                      <p className="text-dark-500 text-sm mt-2">預計需要 20-30 秒</p>
                    </div>
                  ) : results.length > 0 ? (
                    <div className="space-y-3">
                      {results.map((result, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-dark-600 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleResult(i)}
                            className="w-full flex items-center justify-between px-5 py-4 text-left text-white font-semibold hover:bg-dark-700 transition-colors"
                          >
                            <span>{result.title}</span>
                            <span
                              className={`text-dark-400 transition-transform duration-200 text-xl ${
                                expandedResults[i] ? "rotate-45" : ""
                              }`}
                            >
                              +
                            </span>
                          </button>
                          {expandedResults[i] && (
                            <div className="px-5 pb-5 text-sm text-dark-300 leading-relaxed whitespace-pre-wrap border-t border-dark-700">
                              <div className="pt-4">{result.content}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-dark-400 text-center py-8">
                      正在載入分析結果...
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      onClick={() => {
                        setStep(1);
                        setResults([]);
                        setFormData({
                          businessName: "",
                          businessType: "",
                          location: "",
                          email: "",
                          phone: "",
                          problems: "",
                          currentAds: "",
                          monthlyBudget: "",
                        });
                      }}
                      className="flex-1 py-3 rounded-xl font-semibold border-2 border-dark-600 text-dark-300 hover:border-dark-400 hover:text-white transition-all duration-300"
                    >
                      重新健檢
                    </button>
                    <Link
                      href="/contact"
                      className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 text-center"
                    >
                      諮詢完整方案 →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">常見問題</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                {...stagger}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-semibold text-gray-900 hover:text-brand-600 transition-colors">
                  {faq.q}
                  <span className="text-dark-400 group-open:rotate-45 transition-transform duration-200 text-xl">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 text-sm text-dark-500 leading-relaxed">
                  {faq.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-bold mb-4">
              準備好讓更多客人找到你了嗎？
            </h2>
            <p className="text-dark-400 mb-8 max-w-xl mx-auto">
              預約免費諮詢，我們會根據你的店家需求，提供最適合的 Google 導流方案
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                立即諮詢方案 →
              </Link>
              <a
                href="tel:07-2810889"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-dark-600 text-dark-300 font-semibold rounded-xl hover:border-dark-400 hover:text-white transition-all duration-300"
              >
                撥打電話 07-2810889
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

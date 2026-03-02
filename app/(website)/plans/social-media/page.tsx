"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const workflow = [
  {
    step: "01",
    icon: "🎯",
    title: "品牌策略建檔",
    desc: "深入了解品牌人設、受眾輪廓、核心價值，建立專屬的品牌聲量策略",
  },
  {
    step: "02",
    icon: "📋",
    title: "內容企劃",
    desc: "根據黃金比例策略，規劃一個月的內容主題、類型與排程日曆",
  },
  {
    step: "03",
    icon: "✍️",
    title: "產出執行",
    desc: "專業文案 + 視覺設計，打造符合品牌人設的高品質社群內容",
  },
  {
    step: "04",
    icon: "📤",
    title: "發布管理",
    desc: "最佳時段發布、社群互動回覆、粉絲經營與危機處理",
  },
  {
    step: "05",
    icon: "📊",
    title: "數據優化",
    desc: "每月成效覆盤，分析哪類內容表現好，持續優化下個月策略",
  },
];

const contentTypes = [
  {
    type: "價值型",
    ratio: 40,
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    text: "text-blue-700",
    desc: "教學、知識分享、解決痛點",
    detail: "讓受眾覺得「追蹤你有用」，建立專業信任感",
  },
  {
    type: "互動型",
    ratio: 25,
    color: "from-purple-500 to-purple-600",
    bg: "bg-purple-50",
    text: "text-purple-700",
    desc: "投票、問答、迷因、UGC",
    detail: "提升互動率和觸及率，讓演算法幫你推內容",
  },
  {
    type: "品牌型",
    ratio: 20,
    color: "from-brand-500 to-brand-600",
    bg: "bg-orange-50",
    text: "text-brand-700",
    desc: "幕後花絮、團隊故事、品牌理念",
    detail: "讓受眾認識品牌背後的人，建立情感連結",
  },
  {
    type: "轉換型",
    ratio: 15,
    color: "from-green-500 to-green-600",
    bg: "bg-green-50",
    text: "text-green-700",
    desc: "產品推薦、促銷活動、CTA 導購",
    detail: "有前三種內容打底，轉換才不會讓人反感",
  },
];

const differentiators = [
  {
    icon: "🧠",
    title: "品牌人設先行",
    desc: "先搞清楚品牌要用什麼人格跟受眾溝通，內容才有靈魂，不是套模板發文",
  },
  {
    icon: "📐",
    title: "黃金比例內容策略",
    desc: "40/25/20/15 科學配比，讓你的社群不只有廣告感，粉絲真的願意追蹤",
  },
  {
    icon: "📈",
    title: "數據驅動優化",
    desc: "每月覆盤報告，用數據告訴你什麼有效、什麼該調整，不憑感覺做事",
  },
  {
    icon: "🔄",
    title: "持續進化循環",
    desc: "策略 → 執行 → 分析 → 優化，每個月都比上個月更懂你的受眾",
  },
];

const plans = [
  {
    name: "基礎方案",
    price: "18,000",
    desc: "適合剛起步的品牌，建立穩定的社群存在感",
    features: [
      "3 平台經營（IG + FB + Threads）",
      "每月 12 篇貼文",
      "靜態圖 + 輪播圖設計",
      "基礎社群互動回覆",
      "品牌人設建檔",
    ],
    highlight: false,
  },
  {
    name: "品牌成長方案",
    price: "32,000",
    desc: "最多客戶選擇，完整的社群經營體驗",
    features: [
      "3 平台經營（IG + FB + Threads）",
      "每月 24 篇貼文",
      "靜態圖 + 輪播圖 + 動態圖卡",
      "完整社群互動經營",
      "品牌人設 + 受眾輪廓建檔",
      "內容日曆規劃",
      "月度成效報告",
    ],
    highlight: true,
  },
  {
    name: "旗艦方案",
    price: "55,000",
    desc: "全方位品牌社群管理，適合追求快速成長的品牌",
    features: [
      "3 平台經營（IG + FB + Threads）",
      "每月 36 篇貼文（多格式）",
      "動態圖卡 + 限時動態設計",
      "深度社群互動 + 危機處理",
      "完整品牌策略建檔",
      "內容日曆 + 節慶企劃",
      "月度成效報告 + 策略顧問會議",
      "競品社群監測",
    ],
    highlight: false,
  },
];

const processSteps = [
  { step: "1", title: "免費品牌健檢", desc: "了解品牌現況與行銷痛點" },
  { step: "2", title: "策略提案", desc: "量身打造品牌人設與社群策略" },
  { step: "3", title: "內容企劃", desc: "規劃第一個月的內容日曆" },
  { step: "4", title: "執行發布", desc: "專業團隊開始產出與發布" },
  { step: "5", title: "數據優化", desc: "每月覆盤，持續優化策略" },
];

const faqs = [
  {
    q: "社群經營多久可以看到成效？",
    a: "通常 1-2 個月可以看到互動率和觸及率的提升，3-6 個月會有明顯的粉絲成長和品牌聲量變化。社群經營是長期累積的過程，越早開始越好。",
  },
  {
    q: "你們會幫我們拍影片嗎？",
    a: "社群方案中的內容以靜態圖、輪播圖和動態圖卡為主。如果需要專業的短影音拍攝與剪輯，我們有獨立的影音行銷服務，歡迎另外洽詢。",
  },
  {
    q: "可以只經營一個平台嗎？",
    a: "可以，我們會根據你的目標受眾和預算，建議最適合的平台組合。單平台經營的價格可以另外討論。",
  },
  {
    q: "內容需要我們自己審核嗎？",
    a: "我們會在每月初提供完整的內容日曆和文案初稿供您確認。您可以提出修改意見，我們會調整到您滿意為止才發布。",
  },
  {
    q: "合約期間是多久？",
    a: "建議至少合作 3 個月以上，才能完整執行策略循環看到成效。我們提供月付方案，沒有綁長約的壓力。",
  },
  {
    q: "已經有在做社群了，也適合嗎？",
    a: "非常適合！我們會先分析你目前的社群狀況，找出可以優化的地方，讓現有的社群表現更上一層樓。",
  },
];

export default function SocialMediaPlanPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="max-w-3xl">
            <p className="text-brand-400 font-semibold mb-4">
              SOCIAL MEDIA MANAGEMENT
            </p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              一次搞定三平台
              <br />
              <span className="text-gradient">讓品牌每天都在線</span>
            </h1>
            <p className="text-dark-400 text-lg leading-relaxed mb-8">
              我們不只是幫你發文。從品牌人設定義、受眾輪廓分析到內容策略規劃，用系統化的方法經營社群，讓每一篇貼文都有目的、有策略、有成效。
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/questionnaire"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                免費品牌健檢 →
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-dark-600 text-dark-300 font-semibold rounded-xl hover:border-dark-400 hover:text-white transition-all duration-300"
              >
                直接聯絡我們
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5-Step Workflow */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-brand-500 font-semibold mb-4">OUR METHODOLOGY</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              五步驟系統化經營流程
            </h2>
            <p className="text-dark-500 max-w-2xl mx-auto">
              不是想到什麼發什麼，每一步都有方法論支撐
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-6">
            {workflow.map((w, i) => (
              <motion.div
                key={w.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-brand-500/20">
                  {w.icon}
                </div>
                <div className="text-xs text-brand-500 font-bold mb-1">
                  STEP {w.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{w.title}</h3>
                <p className="text-dark-500 text-sm leading-relaxed">
                  {w.desc}
                </p>
                {/* Arrow connector */}
                {i < workflow.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-3 text-brand-300 text-xl">
                    →
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Loop indicator */}
          <motion.div
            {...fadeUp}
            className="mt-10 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-full text-brand-600 text-sm font-medium">
              <span>🔄</span>
              <span>每月循環優化，越做越精準</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Golden Ratio Content Strategy */}
      <section className="py-24 bg-dark-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-brand-500 font-semibold mb-4">
              CONTENT STRATEGY
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              黃金比例內容策略
            </h2>
            <p className="text-dark-500 max-w-2xl mx-auto">
              不是每天都在賣東西，科學配比讓粉絲真的願意追蹤你
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contentTypes.map((c, i) => (
              <motion.div
                key={c.type}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Ratio badge */}
                <div
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm font-bold bg-gradient-to-r ${c.color} mb-4`}
                >
                  {c.ratio}%
                </div>
                <h3 className="text-xl font-bold mb-1">{c.type}</h3>
                <p className={`text-sm font-medium ${c.text} mb-3`}>
                  {c.desc}
                </p>
                <p className="text-dark-500 text-sm leading-relaxed">
                  {c.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-brand-500 font-semibold mb-4">WHY US</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              我們跟別人不一樣
            </h2>
            <p className="text-dark-500 max-w-2xl mx-auto">
              不是接案做做就好，我們用系統和數據幫你的品牌長期成長
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {differentiators.map((d, i) => (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-5 p-6 rounded-2xl border border-dark-100 hover:border-brand-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl">
                  {d.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{d.title}</h3>
                  <p className="text-dark-500 text-sm leading-relaxed">
                    {d.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-brand-400 font-semibold mb-4">PRICING</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              選擇適合你的方案
            </h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              所有方案皆含品牌人設建檔，確保每篇內容都符合品牌調性
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`relative rounded-2xl p-8 ${
                  p.highlight
                    ? "bg-gradient-to-br from-brand-500 to-brand-600 shadow-xl shadow-brand-500/20 scale-[1.02]"
                    : "bg-dark-800 border border-dark-700"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-brand-600 text-sm font-bold rounded-full shadow-lg">
                    最多人選擇
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                <p
                  className={`text-sm mb-6 ${p.highlight ? "text-white/80" : "text-dark-400"}`}
                >
                  {p.desc}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-black">
                    NT$ {p.price}
                  </span>
                  <span
                    className={`text-sm ${p.highlight ? "text-white/70" : "text-dark-500"}`}
                  >
                    {" "}
                    /月
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs mt-0.5 ${
                          p.highlight
                            ? "bg-white/20 text-white"
                            : "bg-brand-500/20 text-brand-400"
                        }`}
                      >
                        ✓
                      </span>
                      <span
                        className={`text-sm ${p.highlight ? "text-white/90" : "text-dark-300"}`}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/questionnaire"
                  className={`block text-center py-3 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                    p.highlight
                      ? "bg-white text-brand-600 hover:shadow-lg"
                      : "bg-brand-500 text-white hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25"
                  }`}
                >
                  免費品牌健檢 →
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.p
            {...fadeUp}
            className="text-center text-dark-500 text-sm mt-8"
          >
            以上為參考價格，實際費用將根據品牌需求和規模調整
          </motion.p>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-brand-500 font-semibold mb-4">
              HOW TO GET STARTED
            </p>
            <h2 className="text-3xl font-bold">合作流程</h2>
          </motion.div>
          <div className="grid md:grid-cols-5 gap-6">
            {processSteps.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-brand-500 text-white flex items-center justify-center text-lg font-black">
                  {p.step}
                </div>
                <h3 className="font-bold mb-2">{p.title}</h3>
                <p className="text-dark-500 text-sm">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-dark-50">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-brand-500 font-semibold mb-4">FAQ</p>
            <h2 className="text-3xl font-bold">常見問題</h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <h3 className="font-bold text-lg mb-3 flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold">
                    Q
                  </span>
                  {faq.q}
                </h3>
                <p className="text-dark-500 leading-relaxed pl-10">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 bg-gradient-to-br from-brand-50 to-brand-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            準備好讓品牌社群動起來了嗎？
          </h2>
          <p className="text-dark-500 mb-8">
            先做免費品牌健檢，讓我們了解你的品牌，再為你量身規劃社群策略
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/questionnaire"
              className="inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl text-lg hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              免費品牌健檢 →
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-10 py-4 border-2 border-dark-300 text-dark-600 font-semibold rounded-xl text-lg hover:border-dark-500 transition-all duration-300"
            >
              直接聯絡我們
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

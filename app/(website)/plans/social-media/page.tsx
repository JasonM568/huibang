"use client";

import Link from "next/link";
import { motion } from "framer-motion";

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

const plans = [
  {
    name: "基礎經營方案",
    subtitle: "適合剛起步的品牌",
    price: "18,000",
    period: "月",
    highlight: false,
    features: [
      { text: "FB + IG + Threads 三平台經營", included: true },
      { text: "每月 12 篇貼文（每平台 4 篇）", included: true },
      { text: "基礎圖片設計", included: true },
      { text: "內容企劃 / 每月排程表", included: true },
      { text: "社群數據月報", included: false },
      { text: "專屬品牌顧問", included: false },
    ],
  },
  {
    name: "品牌成長方案",
    subtitle: "最受客戶歡迎的選擇",
    price: "32,000",
    period: "月",
    highlight: true,
    badge: "推薦",
    features: [
      { text: "FB + IG + Threads 三平台經營", included: true },
      { text: "每月 24 篇貼文（每平台 8 篇）", included: true },
      { text: "專業圖片設計 + 品牌視覺統一", included: true },
      { text: "內容企劃 / 每月排程表", included: true },
      { text: "社群數據月報", included: true },
      { text: "專屬品牌顧問", included: false },
    ],
  },
  {
    name: "全方位旗艦方案",
    subtitle: "給想要全力衝刺的品牌",
    price: "55,000",
    period: "月",
    highlight: false,
    features: [
      { text: "FB + IG + Threads 三平台經營", included: true },
      { text: "每月 36 篇貼文（每平台 12 篇）", included: true },
      { text: "專業圖片設計 + 品牌視覺統一", included: true },
      { text: "內容企劃 / 每月排程表", included: true },
      { text: "社群數據月報 + 策略建議", included: true },
      { text: "專屬品牌顧問（即時溝通）", included: true },
    ],
  },
];

const deliverables = [
  {
    icon: "📝",
    title: "三平台貼文",
    desc: "FB、IG、Threads 量身打造不同風格的文案，不是一文多發，而是真正符合各平台特性的內容。",
  },
  {
    icon: "🎨",
    title: "專業圖片設計",
    desc: "每篇貼文搭配品牌風格一致的視覺圖片，提升品牌識別度與貼文觸及率。",
  },
  {
    icon: "📅",
    title: "內容企劃排程表",
    desc: "每月提前規劃完整的內容日曆，主題分配、發文時間、節慶行銷一目了然。",
  },
];

const process_steps = [
  {
    step: "01",
    title: "品牌訪談",
    desc: "深入了解品牌故事、目標客群、競品與行銷目標",
  },
  {
    step: "02",
    title: "策略規劃",
    desc: "制定內容方向、視覺風格、主題企劃與排程表",
  },
  {
    step: "03",
    title: "內容製作",
    desc: "文案撰寫、圖片設計、內容排版",
  },
  {
    step: "04",
    title: "審核上線",
    desc: "內容送審確認後，按排程準時發布各平台",
  },
  {
    step: "05",
    title: "數據優化",
    desc: "追蹤成效數據，持續調整策略提升表現",
  },
];

const faqs = [
  {
    q: "合約期間是多久？",
    a: "最低合作期間為三個月，讓我們有足夠的時間了解品牌並建立穩定的社群經營節奏。三個月後可選擇續約或調整方案。",
  },
  {
    q: "貼文需要我們自己審核嗎？",
    a: "是的，每月的內容會提前 5-7 天交付審核，你可以提出修改意見，我們會在發布前完成調整。",
  },
  {
    q: "可以只選一個平台嗎？",
    a: "可以！我們也提供單一平台的經營方案，歡迎聯繫我們取得客製化報價。",
  },
  {
    q: "圖片素材需要我們提供嗎？",
    a: "不需要。我們會根據品牌風格進行設計製作，但如果有產品照或品牌素材，提供給我們可以讓內容更豐富。",
  },
];

export default function SocialMediaPlanPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.08),transparent)]" />
        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <motion.div {...fadeUp}>
            <span className="inline-block px-4 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-full text-sm font-medium mb-6">
              社群經營方案
            </span>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              一次搞定三平台
              <br />
              <span className="text-gradient">讓品牌每天都在線</span>
            </h1>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto mb-8">
              FB、IG、Threads 三平台同步經營，從文案到圖片設計全包。
              <br className="hidden sm:block" />
              你只需要專心做好產品，社群的事交給我們。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                立即諮詢方案 →
              </Link>
              <a
                href="#plans"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-dark-600 text-dark-300 font-semibold rounded-xl hover:border-dark-400 hover:text-white transition-all duration-300"
              >
                查看方案內容
              </a>
            </div>
          </motion.div>

          {/* Platform icons */}
          <motion.div
            className="flex justify-center gap-8 mt-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {[
              { name: "Facebook", color: "from-blue-500 to-blue-600" },
              { name: "Instagram", color: "from-pink-500 to-purple-600" },
              { name: "Threads", color: "from-gray-100 to-gray-300" },
            ].map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-2">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                >
                  {p.name[0]}
                </div>
                <span className="text-dark-500 text-xs">{p.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">你會得到什麼？</h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              不只是發發貼文，而是一套完整的社群經營系統
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {deliverables.map((item, i) => (
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

      {/* Pricing */}
      <section id="plans" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">選擇適合的方案</h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              所有方案皆包含 FB、IG、Threads 三平台經營，參考價格如下
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`relative rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlight
                    ? "bg-gradient-to-b from-dark-900 to-dark-800 text-white shadow-2xl shadow-dark-900/20 ring-2 ring-brand-500"
                    : "bg-white border border-gray-200 hover:shadow-xl"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-500 text-white text-xs font-bold rounded-full">
                    {plan.badge}
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p
                    className={`text-sm ${
                      plan.highlight ? "text-dark-400" : "text-dark-500"
                    }`}
                  >
                    {plan.subtitle}
                  </p>
                </div>

                <div className="mb-8">
                  <span
                    className={`text-sm ${
                      plan.highlight ? "text-dark-400" : "text-dark-500"
                    }`}
                  >
                    NT$
                  </span>
                  <span className="text-4xl font-black mx-1">
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.highlight ? "text-dark-400" : "text-dark-500"
                    }`}
                  >
                    / {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-3 text-sm">
                      {f.included ? (
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs mt-0.5">
                          ✓
                        </span>
                      ) : (
                        <span
                          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs mt-0.5 ${
                            plan.highlight
                              ? "bg-dark-700 text-dark-500"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          —
                        </span>
                      )}
                      <span
                        className={
                          f.included
                            ? ""
                            : plan.highlight
                            ? "text-dark-500"
                            : "text-gray-400"
                        }
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className={`block text-center py-3 rounded-xl font-semibold transition-all duration-300 ${
                    plan.highlight
                      ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:shadow-lg hover:shadow-brand-500/25"
                      : "bg-dark-900 text-white hover:bg-dark-800"
                  }`}
                >
                  聯繫我們
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-dark-400 mt-8">
            * 以上為參考價格，實際方案內容與費用會依品牌需求調整
          </p>
        </div>
      </section>

      {/* Social Audit Promo */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-100">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100/60 to-transparent rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-100/40 to-transparent rounded-tr-full" />

              <div className="relative p-8 sm:p-12">
                {/* Badge */}
                <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold mb-6">
                  🔍 簽約前推薦先做
                </span>

                <div className="grid md:grid-cols-2 gap-10 items-center">
                  {/* Left: Content */}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                      深度社群帳號分析健診
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      在選擇方案之前，先透過專業分析了解你的社群現況。
                      我們會實際分析你的 FB、IG、Threads 帳號數據，
                      找出真正的問題和機會，讓你選對方案、錢花在刀口上。
                    </p>

                    <div className="space-y-3 mb-6">
                      {[
                        "各平台帳號現況與互動率分析",
                        "競品社群比較（2~3 個競品）",
                        "受眾輪廓解析 + 具體改善建議",
                        "5~15 頁 PDF 報告 + 30 分鐘說明會議",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs mt-0.5">
                            ✓
                          </span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Pricing card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-6 sm:p-8 text-center">
                    <p className="text-sm text-gray-500 mb-3">深度健診費用</p>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-4xl font-black text-indigo-600">
                        NT$ 5,000
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      填寫品牌問卷可享 5 折優惠
                    </p>

                    <div className="bg-green-50 rounded-xl p-3 mb-6">
                      <p className="text-xs text-green-700 font-medium">
                        ✨ 簽約社群經營方案，健診費用可全額折抵第一個月費用
                      </p>
                    </div>

                    <div className="space-y-3">
                      <a
                        href="https://p.ecpay.com.tw/9227750"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
                      >
                        放棄優惠直接健診
                      </a>
                      <Link
                        href="/questionnaire"
                        className="block w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        先填品牌問卷享 5 折 →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Bottom info */}
                <div className="mt-8 pt-6 border-t border-indigo-100">
                  <Link
                    href="/plans/social-audit"
                    className="inline-flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                  >
                    了解深度健診完整內容 →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">合作流程</h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              從了解品牌到內容上線，每一步都透明清晰
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-6">
            {process_steps.map((s, i) => (
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
                <p className="text-dark-500 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
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
              準備好讓品牌在社群上發光了嗎？
            </h2>
            <p className="text-dark-400 mb-8 max-w-xl mx-auto">
              預約免費諮詢，我們會根據你的品牌需求，提供最適合的社群經營方案
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                立即預約諮詢 →
              </Link>
              <Link
                href="/questionnaire"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-dark-600 text-dark-300 font-semibold rounded-xl hover:border-dark-400 hover:text-white transition-all duration-300"
              >
                先做品牌健檢
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

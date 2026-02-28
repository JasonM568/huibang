"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const services = [
  {
    icon: "🎯",
    title: "品牌定位策略",
    tagline: "找到你的品牌在市場中的最佳位置",
    desc: "透過系統化的市場分析、競品研究與消費者洞察，協助品牌找到獨特的市場定位與價值主張。我們會深入了解你的產品優勢、目標客群的痛點與需求，梳理出清晰的品牌故事與核心訊息，讓你的品牌在眾多競爭者中脫穎而出。",
    features: [
      "市場分析與競品研究",
      "品牌核心價值梳理",
      "目標客群定義與分析",
      "品牌故事與訊息策略",
    ],
  },
  {
    icon: "📣",
    title: "廣告投放優化",
    tagline: "精準觸及目標客群，最大化廣告效益",
    desc: "在 Facebook、Instagram、Google、LINE 等主流平台進行精準的廣告投放，從受眾設定、素材測試到出價策略，以數據分析持續優化投放成效。不論你的目標是提升品牌曝光、增加網站流量還是直接帶動銷售轉換，我們都能制定最合適的投放策略。",
    features: [
      "Facebook / Instagram 廣告",
      "Google 搜尋與多媒體廣告",
      "LINE 官方帳號廣告",
      "數據分析與成效優化",
    ],
  },
  {
    icon: "📱",
    title: "社群經營管理",
    tagline: "打造有溫度的品牌社群",
    desc: "從內容策略、視覺設計到社群互動，全方位管理品牌社群平台。我們擅長用貼近受眾的語言和風格創作內容，持續累積粉絲信任感與品牌好感度，讓你的社群不只是發貼文，而是成為品牌與消費者溝通的重要橋樑。",
    features: [
      "社群內容策略規劃",
      "貼文文案與視覺設計",
      "社群互動與粉絲經營",
      "成效追蹤與策略調整",
    ],
  },
  {
    icon: "✍️",
    title: "內容行銷",
    tagline: "用好內容建立品牌信任與長期流量",
    desc: "透過高品質的內容創作，幫助品牌建立專業形象、累積自然搜尋流量，並轉化為長期的品牌資產。從 SEO 策略文章、品牌故事到電子報行銷，我們用內容為你的品牌說好故事，吸引潛在客戶主動上門。",
    features: [
      "SEO 內容策略",
      "部落格與專欄文章",
      "影音內容企劃",
      "EDM 電子報行銷",
    ],
  },
];

const process_steps = [
  { step: "01", title: "需求訪談", desc: "深入了解品牌現況、目標與挑戰" },
  { step: "02", title: "策略規劃", desc: "量身打造行銷策略與執行計畫" },
  { step: "03", title: "執行落地", desc: "專業團隊全力執行行銷方案" },
  { step: "04", title: "優化迭代", desc: "以數據為基礎持續優化成效" },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="max-w-3xl">
            <p className="text-brand-400 font-semibold mb-4">OUR SERVICES</p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              從策略到執行的
              <br />
              <span className="text-gradient">完整行銷方案</span>
            </h1>
            <p className="text-dark-400 text-lg leading-relaxed">
              惠邦行銷提供從品牌定位、廣告投放到社群經營的一站式數位行銷服務。我們深耕旅遊活動、電商零售、餐飲美食與教育課程四大產業，用實戰經驗為你的品牌量身打造最有效的成長策略。
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Detail */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="space-y-24">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className={`flex flex-col ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-12 items-center`}
              >
                {/* Visual */}
                <div className="md:w-1/2">
                  <div className="aspect-[4/3] bg-gradient-to-br from-brand-50 to-brand-100 rounded-3xl flex items-center justify-center">
                    <span className="text-8xl">{s.icon}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="md:w-1/2">
                  <p className="text-brand-500 font-semibold text-sm mb-2">
                    {s.tagline}
                  </p>
                  <h2 className="text-3xl font-bold mb-4">{s.title}</h2>
                  <p className="text-dark-500 leading-relaxed mb-6">{s.desc}</p>
                  <ul className="space-y-3">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                        <span className="text-dark-600">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-dark-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-brand-500 font-semibold mb-4">HOW WE WORK</p>
            <h2 className="text-3xl font-bold">合作流程</h2>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-8">
            {process_steps.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-500 text-white flex items-center justify-center text-xl font-black">
                  {p.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                <p className="text-dark-500 text-sm">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-brand-50 to-brand-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">不確定哪個服務適合你？</h2>
          <p className="text-dark-500 mb-8">
            先做免費品牌健檢，了解你的品牌現況，我們再為你推薦最適合的方案
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

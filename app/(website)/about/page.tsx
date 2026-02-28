"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const values = [
  {
    icon: "📊",
    title: "數據驅動",
    desc: "每一次投放、每一則貼文，我們都用數據說話。從廣告成效到受眾行為，用科學方法持續優化，讓每一分預算發揮最大效益。",
  },
  {
    icon: "🤝",
    title: "夥伴關係",
    desc: "我們不只是接案的廣告代操公司，而是與客戶站在同一陣線的策略夥伴。你的品牌成長，就是我們最大的成就感。",
  },
  {
    icon: "🎯",
    title: "結果導向",
    desc: "不做華而不實的行銷包裝，專注在能帶來實際營收的策略。每月定期檢視 KPI，確保每個行動都在推進目標。",
  },
  {
    icon: "💡",
    title: "持續創新",
    desc: "從 AI 行銷分析到最新廣告投放技術，我們持續學習並導入新工具，讓客戶的行銷策略永遠走在市場前端。",
  },
];

const milestones = [
  { year: "2020", event: "惠邦行銷正式成立，從 Facebook 廣告代操起步" },
  { year: "2021", event: "拓展 Google 關鍵字廣告與 LINE 行銷服務" },
  { year: "2023", event: "服務客戶橫跨旅遊、電商、餐飲、教育四大產業" },
  { year: "2025", event: "導入 AI 品牌分析系統，打造智慧行銷顧問服務" },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="max-w-3xl">
            <p className="text-brand-400 font-semibold mb-4">ABOUT US</p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              關於<span className="text-gradient">惠邦行銷</span>
            </h1>
            <p className="text-dark-400 text-lg leading-relaxed">
              惠邦行銷成立於 2020 年，專注於協助中小企業與品牌主建立清晰的品牌定位，並透過精準的數位廣告投放觸及目標客群。我們相信，每個認真經營的品牌都有獨特的價值，值得被對的人看見。
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
            <p className="text-brand-500 font-semibold mb-4">OUR MISSION</p>
            <h2 className="text-3xl font-bold mb-6">我們的使命</h2>
            <p className="text-dark-500 text-lg leading-relaxed">
              讓每一個認真經營的品牌，都能透過精準的行銷策略被對的客群看見。不論是剛起步的新品牌，還是希望突破瓶頸的成熟企業，惠邦行銷都能根據品牌的產業特性與成長階段，提供量身打造的數位行銷解決方案，陪伴品牌走過從 0 到 1、從 1 到 100 的每一步。
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-dark-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-brand-500 font-semibold mb-4">OUR VALUES</p>
            <h2 className="text-3xl font-bold">核心價值</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="text-lg font-bold mb-3">{v.title}</h3>
                <p className="text-dark-500 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-brand-500 font-semibold mb-4">OUR JOURNEY</p>
            <h2 className="text-3xl font-bold">發展歷程</h2>
          </motion.div>
          <div className="space-y-8">
            {milestones.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="w-20 shrink-0 text-right">
                  <span className="text-brand-500 font-black text-lg">{m.year}</span>
                </div>
                <div className="w-3 h-3 mt-2 rounded-full bg-brand-500 shrink-0" />
                <p className="text-dark-600">{m.event}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-dark-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-brand-500 font-semibold mb-4">OUR TEAM</p>
            <h2 className="text-3xl font-bold">我們的團隊</h2>
            <p className="text-dark-500 mt-4">
              一群熱愛行銷、深耕數位領域的專業團隊，涵蓋策略、企劃與設計，為你的品牌全方位加速。
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { role: "創辦人 / 策略總監", name: "Jason", desc: "10 年以上數位行銷經驗，擅長品牌策略與廣告投放" },
              { role: "行銷企劃", name: "行銷企劃團隊", desc: "3 位資深企劃，專精社群經營、內容策略與活動規劃" },
              { role: "視覺設計", name: "設計團隊", desc: "2 位設計師，負責品牌視覺、廣告素材與社群圖文" },
            ].map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="h-48 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                  <span className="text-6xl">{i === 0 ? "👨‍💼" : i === 1 ? "👩‍💻" : "🎨"}</span>
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                  <p className="text-brand-500 text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-dark-500 text-sm">{member.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-brand-50 to-brand-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">想進一步了解我們？</h2>
          <p className="text-dark-500 mb-8">歡迎預約免費諮詢，讓我們聊聊如何幫助你的品牌成長</p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl text-lg hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            聯絡我們 →
          </a>
        </div>
      </section>
    </div>
  );
}

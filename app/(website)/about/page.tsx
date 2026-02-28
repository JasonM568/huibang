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
    desc: "【待補】每個決策都以數據為依據，用科學方法優化行銷成效。",
  },
  {
    icon: "🤝",
    title: "夥伴關係",
    desc: "【待補】不只是代理商，我們是品牌成長路上的策略夥伴。",
  },
  {
    icon: "🎯",
    title: "結果導向",
    desc: "【待補】不做表面功夫，專注在能帶來實際營收的行銷策略。",
  },
  {
    icon: "💡",
    title: "持續創新",
    desc: "【待補】掌握最新行銷趨勢與工具，讓客戶永遠領先一步。",
  },
];

const milestones = [
  { year: "20XX", event: "【待補】惠邦行銷成立" },
  { year: "20XX", event: "【待補】服務客戶突破 XX 家" },
  { year: "20XX", event: "【待補】擴展至 XX 產業" },
  { year: "20XX", event: "【待補】導入 AI 行銷分析系統" },
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
              【待補：公司簡介，約 2-3 句話。例如：惠邦行銷成立於 20XX 年，專注於協助中小企業建立品牌定位與數位行銷策略。我們相信，每個品牌都有獨特的價值，值得被對的人看見。】
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
              【待補：公司使命宣言，約 3-4 句話。例如：我們的使命是讓每一個認真經營的品牌，都能透過精準的行銷策略被對的客群看見。不論是剛起步的新創品牌，或是希望轉型升級的成熟企業，惠邦行銷都能提供量身打造的解決方案。】
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
              【待補：團隊簡介，約 1-2 句話】
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { role: "創辦人 / 策略總監", name: "【待補】" },
              { role: "行銷企劃", name: "【待補】" },
              { role: "設計師", name: "【待補】" },
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
                  <span className="text-6xl">👤</span>
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                  <p className="text-dark-500 text-sm">{member.role}</p>
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

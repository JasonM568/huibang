"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const categories = ["全部", "旅遊活動", "電商零售", "餐飲美食", "教育課程"];

const cases = [
  {
    category: "旅遊活動",
    title: "印度朝聖旅遊品牌推廣",
    result: "年度報名人數突破 700 人",
    desc: "協助印度朝聖旅遊服務品牌，針對 45-65 歲目標族群精準投放 Facebook 廣告，搭配故事性內容行銷，成功建立品牌信任感，讓報名轉換率大幅提升。",
    tags: ["品牌定位", "Facebook 廣告", "內容行銷"],
    gradient: "from-blue-100 to-blue-200",
    emoji: "✈️",
  },
  {
    category: "電商零售",
    title: "生活選品電商營收成長",
    result: "廣告 ROAS 達 5.2 倍",
    desc: "為生活風格選品電商規劃完整的數位廣告策略，透過 Google 購物廣告與 Facebook 再行銷組合拳，有效降低獲客成本，並持續優化商品頁轉換率。",
    tags: ["Google 廣告", "社群經營", "數據分析"],
    gradient: "from-green-100 to-green-200",
    emoji: "🛍️",
  },
  {
    category: "餐飲美食",
    title: "連鎖餐飲品牌社群經營",
    result: "門市來客數提升 60%",
    desc: "為連鎖餐飲品牌打造 LINE 官方帳號行銷策略，結合社群內容經營與限時優惠活動，成功提升顧客回訪率，並帶動新客到店消費。",
    tags: ["社群經營", "LINE 行銷", "口碑行銷"],
    gradient: "from-orange-100 to-orange-200",
    emoji: "🍽️",
  },
  {
    category: "教育課程",
    title: "線上課程品牌招生專案",
    result: "單月報名數成長 180%",
    desc: "協助線上教育品牌重新定位目標受眾，規劃從品牌認知到報名轉換的完整行銷漏斗，透過精準廣告投放與內容行銷組合，大幅提升招生成效。",
    tags: ["品牌定位", "內容行銷", "廣告投放"],
    gradient: "from-purple-100 to-purple-200",
    emoji: "📚",
  },
];

export default function CasesPage() {
  const [active, setActive] = useState("全部");

  const filtered =
    active === "全部" ? cases : cases.filter((c) => c.category === active);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="max-w-3xl">
            <p className="text-brand-400 font-semibold mb-4">CASE STUDIES</p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              用成果說話的
              <br />
              <span className="text-gradient">成功案例</span>
            </h1>
            <p className="text-dark-400 text-lg leading-relaxed">
              每一個案例都是我們與客戶共同創造的成果。以下是部分合作案例，展示我們如何幫助不同產業的品牌實現實際成長。
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-b border-dark-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "50+", label: "服務品牌數" },
              { number: "85%", label: "客戶續約率" },
              { number: "2,000+", label: "累計廣告操作金額(萬)" },
              { number: "4", label: "產業覆蓋" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-black text-brand-500">
                  {s.number}
                </p>
                <p className="text-dark-500 text-sm mt-2">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter + Cases */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-16">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  active === cat
                    ? "bg-brand-500 text-white"
                    : "bg-dark-100 text-dark-500 hover:bg-dark-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Case Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {filtered.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="rounded-3xl overflow-hidden border border-dark-100 hover:shadow-xl transition-shadow duration-300 group"
              >
                {/* Image Area */}
                <div
                  className={`h-56 bg-gradient-to-br ${c.gradient} flex items-center justify-center`}
                >
                  <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                    {c.emoji}
                  </span>
                </div>

                {/* Content */}
                <div className="p-8">
                  <span className="text-xs font-semibold text-brand-500 bg-brand-50 px-3 py-1 rounded-full">
                    {c.category}
                  </span>
                  <h3 className="text-xl font-bold mt-4 mb-2">{c.title}</h3>
                  <p className="text-brand-600 font-bold text-lg mb-3">
                    {c.result}
                  </p>
                  <p className="text-dark-500 text-sm leading-relaxed mb-4">
                    {c.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 bg-dark-100 text-dark-500 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-brand-50 to-brand-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">想成為下一個成功案例？</h2>
          <p className="text-dark-500 mb-8">
            先透過免費品牌健檢了解你的品牌現況，讓我們一起規劃成長策略
          </p>
          <Link
            href="/questionnaire"
            className="inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl text-lg hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            免費品牌健檢 →
          </Link>
        </div>
      </section>
    </div>
  );
}

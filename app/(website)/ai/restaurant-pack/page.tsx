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

const painPoints = [
  { emoji: "😩", text: "每天想破頭今天要發什麼貼文" },
  { emoji: "🏃", text: "節慶活動總是最後一刻才想" },
  { emoji: "😰", text: "收到負評不知道怎麼回才得體" },
  { emoji: "🤔", text: "新菜命名想半天沒靈感" },
  { emoji: "📝", text: "找不到人還要自己寫徵人文" },
  { emoji: "💸", text: "每月到底賺了還是虧了搞不清楚" },
];

const gpts = [
  {
    id: 1,
    name: "今日社群貼文機",
    role: "行銷企劃",
    freq: "每天",
    freqColor: "bg-red-100 text-red-700",
    desc: "今天要發什麼？幫你寫好配好圖文建議",
    emoji: "📱",
  },
  {
    id: 2,
    name: "活動企劃師",
    role: "行銷企劃",
    freq: "每月",
    freqColor: "bg-blue-100 text-blue-700",
    desc: "節慶活動、促銷方案、集點企劃一條龍",
    emoji: "🎉",
  },
  {
    id: 3,
    name: "菜單設計顧問",
    role: "產品經理",
    freq: "每季",
    freqColor: "bg-purple-100 text-purple-700",
    desc: "新菜命名、菜單排版建議、定價策略",
    emoji: "📋",
  },
  {
    id: 4,
    name: "Google 評論回覆手",
    role: "外場經理",
    freq: "每週",
    freqColor: "bg-orange-100 text-orange-700",
    desc: "好評感謝、負評滅火，語氣拿捏到位",
    emoji: "⭐",
  },
  {
    id: 5,
    name: "LINE/客服訊息管家",
    role: "客服人員",
    freq: "每天",
    freqColor: "bg-red-100 text-red-700",
    desc: "訂位確認、常見問題、客訴處理模板",
    emoji: "💬",
  },
  {
    id: 6,
    name: "食材成本計算機",
    role: "會計",
    freq: "每週",
    freqColor: "bg-orange-100 text-orange-700",
    desc: "這道菜成本多少、毛利率夠不夠",
    emoji: "🧮",
  },
  {
    id: 7,
    name: "徵人文案+面試題庫",
    role: "人資",
    freq: "不定期",
    freqColor: "bg-gray-100 text-gray-700",
    desc: "找人難，至少貼文要吸引人、面試要問對問題",
    emoji: "👥",
  },
  {
    id: 8,
    name: "廣告投放教練",
    role: "行銷投手",
    freq: "每月",
    freqColor: "bg-blue-100 text-blue-700",
    desc: "FB/IG 廣告怎麼設、預算怎麼分",
    emoji: "📣",
  },
  {
    id: 9,
    name: "每月營運覆盤師",
    role: "營運主管",
    freq: "每月",
    freqColor: "bg-blue-100 text-blue-700",
    desc: "這個月哪裡做得好、哪裡要調整",
    emoji: "📊",
  },
  {
    id: 10,
    name: "老闆決策顧問",
    role: "經營顧問",
    freq: "不定期",
    freqColor: "bg-gray-100 text-gray-700",
    desc: "要不要開分店、要不要加外送、該不該換地點",
    emoji: "🧠",
  },
];

const steps = [
  {
    step: "01",
    title: "購買個體包",
    desc: "完成付款，立即開通你的 10 位 AI 專家",
    emoji: "💳",
  },
  {
    step: "02",
    title: "選擇 AI 專家",
    desc: "10 個客製化 GPTs 隨你需求自由使用",
    emoji: "🤖",
  },
  {
    step: "03",
    title: "直接開工",
    desc: "輸入你的需求，AI 即時產出專業結果",
    emoji: "🚀",
  },
];

const faqs = [
  {
    q: "什麼是「AI 個體包」？",
    a: "AI 個體包是 10 個專為餐飲業老闆設計的客製化 GPTs（AI 助理）。每個 GPT 都針對餐飲經營的特定場景優化，不需要學任何技術，直接用中文跟 AI 對話就能完成工作。",
  },
  {
    q: "我不會用 ChatGPT，能用嗎？",
    a: "完全沒問題！每個 GPT 都已經預設好指令和情境，你只要像跟員工講話一樣，告訴它你的需求就好。我們也會提供使用教學，讓你快速上手。",
  },
  {
    q: "購買後可以用多久？",
    a: "購買後即可永久使用這 10 個 GPTs，不限次數。只要你有 ChatGPT 帳號（免費版即可使用部分功能，Plus 版體驗最佳），就能隨時使用。",
  },
  {
    q: "可以跟員工一起用嗎？",
    a: "可以！你可以將 GPTs 連結分享給你的團隊成員，讓店長、外場、行銷人員各自使用對應的 AI 助理，提升整體營運效率。",
  },
  {
    q: "除了餐飲業，其他行業能用嗎？",
    a: "目前這組 AI 個體包是專為餐飲業（餐廳、咖啡廳、飲料店、烘焙坊、小吃店等）打造的。如果你是其他行業，歡迎聯繫我們，我們可以為你的產業客製化一組 AI 個體包。",
  },
  {
    q: "跟直接用 ChatGPT 有什麼不同？",
    a: "直接用 ChatGPT 你需要自己想 prompt、給背景資料、調整語氣。我們的客製化 GPTs 已經內建餐飲業的專業知識、台灣在地用語和最佳實踐，打開就能直接用，省去大量摸索時間。",
  },
];

export default function RestaurantAIPackPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.08),transparent)]" />
        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <motion.div {...fadeUp}>
            <span className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-6">
              AI 應用
            </span>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              餐飲老闆的
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                AI 行銷軍團
              </span>
            </h1>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto mb-4">
              一次擁有 10 位 AI 專家，從每日貼文到經營決策，全面支援你的餐飲事業。
              <br className="hidden sm:block" />
              不用請人、不用學技術，打開就能用。
            </p>
            <p className="text-dark-500 text-sm mb-8">
              適用於 — 餐廳、咖啡廳、飲料店、烘焙坊、小吃店
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                立即諮詢方案 →
              </Link>
              <Link
                href="/questionnaire"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-dark-600 text-dark-300 font-semibold rounded-xl hover:border-dark-400 hover:text-white transition-all duration-300"
              >
                免費品牌健檢
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              餐飲老闆，這些場景你一定很熟
            </h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              開店已經夠忙了，行銷、管理、企劃樣樣都要自己來
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {painPoints.map((p, i) => (
              <motion.div
                key={i}
                {...stagger}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 bg-gray-50"
              >
                <span className="text-3xl flex-shrink-0">{p.emoji}</span>
                <p className="text-dark-700 font-medium leading-relaxed">
                  {p.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 GPTs Showcase */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              10 位 AI 專家，隨時待命
            </h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              按照使用頻率排序，解決你每天、每週、每月的經營難題
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gpts.map((gpt, i) => (
              <motion.div
                key={gpt.id}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{gpt.emoji}</span>
                    <span className="text-xs font-bold text-dark-400 bg-dark-100 px-2 py-0.5 rounded">
                      #{gpt.id}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${gpt.freqColor}`}
                  >
                    {gpt.freq}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-lg font-bold mb-2">{gpt.name}</h3>

                {/* Role tag */}
                <p className="text-xs text-dark-400 mb-3">
                  取代{" "}
                  <span className="font-semibold text-dark-600">
                    {gpt.role}
                  </span>
                </p>

                {/* Description */}
                <p className="text-dark-500 text-sm leading-relaxed">
                  {gpt.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <motion.div {...fadeUp} className="mt-12 text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-3 text-sm">
              <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full font-medium">
                🔴 每天用
              </span>
              <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                🟠 每週用
              </span>
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                🔵 每月用
              </span>
              <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                🟣 每季用
              </span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full font-medium">
                ⚪ 不定期
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              三步驟，啟動你的 AI 行銷軍團
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  {s.step}
                </div>
                <h4 className="text-lg font-bold mb-2">{s.title}</h4>
                <p className="text-dark-500 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
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
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
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
              讓 AI 幫你分擔，專心做好料理
            </h2>
            <p className="text-dark-400 mb-8 max-w-xl mx-auto">
              10 位 AI 專家隨時待命，餐飲經營不再只靠你一個人
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                聯繫我們諮詢方案 →
              </Link>
              <Link
                href="/questionnaire"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-dark-600 text-dark-300 font-semibold rounded-xl hover:border-dark-400 hover:text-white transition-all duration-300"
              >
                先做免費品牌健檢
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

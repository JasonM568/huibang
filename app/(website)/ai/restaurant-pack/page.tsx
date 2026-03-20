"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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

const painCards = [
  {
    scenario: "晚上 11 點還在想明天貼文...",
    quote: "每天關店後還要花一小時想文案，真的快崩潰",
    solution: "社群文案機器人 30 秒搞定，還附圖文建議",
    emoji: "😩",
    solutionEmoji: "📱",
    image: "/images/ai-pack/Picture_1.jpg",
  },
  {
    scenario: "又收到一星負評，回也不是不回也不是",
    quote: "怕回太硬得罪人，回太軟又顯得沒誠意",
    solution: "Google 評論回覆手幫你專業回應，語氣拿捏到位",
    emoji: "😰",
    solutionEmoji: "⭐",
    image: "/images/ai-pack/Picture_2.jpg",
  },
  {
    scenario: "月底了，到底這個月賺還是虧？",
    quote: "食材漲價後根本不知道哪道菜還有賺",
    solution: "食材成本計算機即時算給你，毛利一目瞭然",
    emoji: "💸",
    solutionEmoji: "🧮",
    image: "/images/ai-pack/Picture_3.jpg",
  },
  {
    scenario: "員工又離職了，徵人文寫了 3 小時",
    quote: "寫出來的徵人文沒人要看，投履歷的都不對",
    solution: "徵人文案機器人 1 分鐘產出吸睛徵才文",
    emoji: "🏃",
    solutionEmoji: "👥",
    image: "/images/ai-pack/Picture_4.jpg",
  },
];

const gpts = [
  {
    id: 1,
    name: "社群文案機器人",
    role: "行銷企劃",
    freq: "每天",
    freqColor: "bg-red-100 text-red-700",
    desc: "今天要發什麼？幫你寫好配好圖文建議",
    emoji: "📱",
    isTrial: true,
    example: "「幫我寫一篇週五晚餐推薦貼文」→ 30 秒產出完整圖文建議",
  },
  {
    id: 2,
    name: "活動企劃師",
    role: "行銷企劃",
    freq: "每月",
    freqColor: "bg-blue-100 text-blue-700",
    desc: "節慶活動、促銷方案、集點企劃一條龍",
    emoji: "🎉",
    isTrial: false,
    example: "「中秋節想辦活動，預算 5000」→ 完整企劃書含文宣建議",
  },
  {
    id: 3,
    name: "菜單設計顧問",
    role: "產品經理",
    freq: "每季",
    freqColor: "bg-purple-100 text-purple-700",
    desc: "新菜命名、菜單排版建議、定價策略",
    emoji: "📋",
    isTrial: false,
    example: "「新推出抹茶甜點系列，幫我想名字」→ 10 個創意命名＋定價建議",
  },
  {
    id: 4,
    name: "Google 評論回覆手",
    role: "外場經理",
    freq: "每週",
    freqColor: "bg-orange-100 text-orange-700",
    desc: "好評感謝、負評滅火，語氣拿捏到位",
    emoji: "⭐",
    isTrial: false,
    example: "「收到一星負評說等太久」→ 專業又誠懇的回覆，化危機為轉機",
  },
  {
    id: 5,
    name: "LINE/客服訊息管家",
    role: "客服人員",
    freq: "每天",
    freqColor: "bg-red-100 text-red-700",
    desc: "訂位確認、常見問題、客訴處理模板",
    emoji: "💬",
    isTrial: false,
    example: "「客人問能不能帶寵物」→ 親切又專業的回覆模板",
  },
  {
    id: 6,
    name: "食材成本計算機",
    role: "會計",
    freq: "每週",
    freqColor: "bg-orange-100 text-orange-700",
    desc: "這道菜成本多少、毛利率夠不夠",
    emoji: "🧮",
    isTrial: false,
    example: "「牛肉麵用料成本 85 元，賣 220 元」→ 毛利率分析＋調整建議",
  },
  {
    id: 7,
    name: "徵人文案+面試題庫",
    role: "人資",
    freq: "不定期",
    freqColor: "bg-gray-100 text-gray-700",
    desc: "找人難，至少貼文要吸引人、面試要問對問題",
    emoji: "👥",
    isTrial: false,
    example: "「徵晚班外場，時薪 190」→ 吸睛徵人文＋面試問題清單",
  },
  {
    id: 8,
    name: "廣告投放教練",
    role: "行銷投手",
    freq: "每月",
    freqColor: "bg-blue-100 text-blue-700",
    desc: "FB/IG 廣告怎麼設、預算怎麼分",
    emoji: "📣",
    isTrial: false,
    example: "「預算 3000 想推新菜」→ 廣告受眾設定＋素材建議＋投放策略",
  },
  {
    id: 9,
    name: "每月營運覆盤師",
    role: "營運主管",
    freq: "每月",
    freqColor: "bg-blue-100 text-blue-700",
    desc: "這個月哪裡做得好、哪裡要調整",
    emoji: "📊",
    isTrial: false,
    example: "「這個月營業額 80 萬，人事 25 萬」→ 完整覆盤報告＋改善方向",
  },
  {
    id: 10,
    name: "老闆決策顧問",
    role: "經營顧問",
    freq: "不定期",
    freqColor: "bg-gray-100 text-gray-700",
    desc: "要不要開分店、要不要加外送、該不該換地點",
    emoji: "🧠",
    isTrial: false,
    example: "「考慮加入 UberEats，值得嗎？」→ 利弊分析＋實際數字試算",
  },
];

// 全配方案：9 位（不含免費試用的社群文案機器人）
const FULL_PACK_IDS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const testimonials = [
  {
    name: "王老闆",
    store: "日式拉麵店",
    quote:
      "以前每天花 1 小時想貼文，現在 30 秒就搞定，而且品質比我寫的還好！光這一個機器人就值回票價了。",
  },
  {
    name: "陳姐",
    store: "早午餐咖啡廳",
    quote:
      "收到負評以前都很焦慮，現在丟給 Google 評論回覆手，回得又專業又有溫度，客人反而變回頭客。",
  },
  {
    name: "林老闆",
    store: "手搖飲料店",
    quote:
      "最驚豔的是食材成本計算機，才發現有兩款飲料根本在虧錢賣。調整後一個月多賺了快兩萬。",
  },
];

const faqs = [
  {
    q: "什麼是「AI 個體包」？",
    a: "AI 個體包是 9 個專為餐飲業老闆設計的客製化 GPTs（AI 助理）。每個 GPT 都針對餐飲經營的特定場景優化，不需要學任何技術，直接用中文跟 AI 對話就能完成工作。",
  },
  {
    q: "我不會用 ChatGPT，能用嗎？",
    a: "完全沒問題！每個 GPT 都已經預設好指令和情境，你只要像跟員工講話一樣，告訴它你的需求就好。我們也會提供使用教學，讓你快速上手。",
  },
  {
    q: "購買後可以用多久？",
    a: "購買後即可永久使用這 9 個 GPTs，不限次數。只要你有 ChatGPT 帳號（免費版即可使用部分功能，Plus 版體驗最佳），就能隨時使用。",
  },
  {
    q: "可以跟員工一起用嗎？",
    a: "可以！你可以將 GPTs 連結分享給你的團隊成員，讓店長、外場、行銷人員各自使用對應的 AI 助理，提升整體營運效率。",
  },
  {
    q: "免費試用的「社群文案機器人」和付費方案的差別？",
    a: "社群文案機器人專門負責每日社群貼文，免費提供體驗。付費的全配方案另外包含 9 位 AI 專家，涵蓋活動企劃、評論回覆、成本計算、廣告投放、人資招募等餐飲經營的各個面向。",
  },
  {
    q: "NT$1,299 包含什麼？",
    a: "NT$1,299 一次買斷，包含 9 位 AI Agent（加上免費的社群文案機器人共 10 位），永久使用不限次數。等於每天不到 $3.6，比一杯超商咖啡還便宜。",
  },
  {
    q: "跟直接用 ChatGPT 有什麼不同？",
    a: "直接用 ChatGPT 你需要自己想 prompt、給背景資料、調整語氣。我們的客製化 GPTs 已經內建餐飲業的專業知識、台灣在地用語和最佳實踐，打開就能直接用，省去大量摸索時間。",
  },
  {
    q: "購買後有什麼售後服務？",
    a: "購買後我們提供使用教學和操作指引，確保你能順利上手。如果遇到任何問題，隨時可以聯繫我們的客服團隊協助。",
  },
];

export default function RestaurantAIPackPage() {
  const [trialForm, setTrialForm] = useState({ name: "", email: "", phone: "" });
  const [trialSubmitting, setTrialSubmitting] = useState(false);
  const [trialError, setTrialError] = useState("");
  const [trialAgentUrl, setTrialAgentUrl] = useState<string | null>(null);
  const [trialDone, setTrialDone] = useState(false);

  // Countdown timer: days remaining until end of month
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calcRemaining = () => {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      const diff = endOfMonth.getTime() - now.getTime();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };
    setCountdown(calcRemaining());
    const timer = setInterval(() => setCountdown(calcRemaining()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialForm.name.trim()) { setTrialError("請填寫姓名"); return; }
    if (!trialForm.email.trim()) { setTrialError("請填寫 Email"); return; }
    setTrialSubmitting(true);
    setTrialError("");

    try {
      const res = await fetch("/api/trial-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trialForm),
      });
      const data = await res.json();
      if (!res.ok) { setTrialError(data.error || "提交失敗，請稍後再試"); setTrialSubmitting(false); return; }
      setTrialAgentUrl(data.agentUrl);
      setTrialDone(true);
    } catch {
      setTrialError("網路錯誤，請稍後再試");
      setTrialSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <PixelViewContent
        contentName="AI 個體包 — 全配方案"
        contentCategory="AI 產品"
        contentType="product"
        contentIds={["ai-pack"]}
        value={1299}
        currency="TWD"
      />

      {/* ===== 1. Hero ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.08),transparent)]" />
        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              已有 50+ 間餐飲店使用
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              你的餐廳不需要再多請一個人
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                需要的是 AI 行銷軍團
              </span>
            </h1>
            <p className="text-dark-400 text-lg md:text-xl max-w-2xl mx-auto mb-4">
              10 位 AI 專家 24 小時待命，從每日貼文到經營決策
              <br className="hidden sm:block" />
              月薪不到一杯咖啡的錢
            </p>
            <p className="text-dark-500 text-sm mb-8">
              適用於 — 餐廳、咖啡廳、飲料店、烘焙坊、小吃店
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#trial"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 text-lg"
              >
                免費試用社群文案機器人 →
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-dark-600 text-dark-300 font-semibold rounded-xl hover:border-dark-400 hover:text-white transition-all duration-300"
              >
                查看方案 NT$1,299
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 2. Pain Points (Story-Style Cards) ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              這些場景，是不是每天都在上演？
            </h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              開店已經夠忙了，行銷、管理、企劃樣樣都要自己來
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {painCards.map((card, i) => (
              <motion.div
                key={i}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.scenario}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{card.emoji}</span>
                      <h3 className="text-lg font-bold text-white drop-shadow-lg">{card.scenario}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <blockquote className="text-dark-500 text-sm italic border-l-2 border-gray-200 pl-4 mb-5">
                    「{card.quote}」
                  </blockquote>
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-xl flex-shrink-0">{card.solutionEmoji}</span>
                    <p className="text-emerald-700 text-sm font-semibold">
                      AI 解法 → {card.solution}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. Cost Comparison ===== */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              請一個行銷人 vs AI 行銷軍團
            </h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              同樣的事情，成本差了 27 倍
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* 行銷人員 */}
            <motion.div
              {...stagger}
              transition={{ duration: 0.5, delay: 0 }}
              className="bg-white rounded-2xl border-2 border-gray-200 p-8"
            >
              <div className="text-center mb-6">
                <span className="text-4xl">👤</span>
                <h3 className="text-xl font-bold mt-3 text-gray-900">請一個行銷人員</h3>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold text-gray-400">NT$ 35,000+</span>
                  <span className="text-gray-400 text-sm">/月</span>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "只能做 1-2 件事",
                  "需要培訓 1-3 個月",
                  "會請假、會離職",
                  "上班 8 小時",
                  "不一定懂餐飲業",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-dark-500">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs flex-shrink-0">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* AI 行銷軍團 */}
            <motion.div
              {...stagger}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-gradient-to-br from-dark-900 to-dark-800 rounded-2xl border-2 border-emerald-500 p-8 text-white ring-2 ring-emerald-500/30 shadow-xl shadow-emerald-500/10 relative"
            >
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold rounded-full">
                推薦
              </span>
              <div className="text-center mb-6">
                <span className="text-4xl">🤖</span>
                <h3 className="text-xl font-bold mt-3">AI 行銷軍團</h3>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">NT$ 1,299</span>
                  <span className="text-dark-400 text-sm">/一次買斷</span>
                </div>
              </div>
              <ul className="space-y-3">
                {[
                  "10 位專家全包",
                  "買了就能用，零學習成本",
                  "24 小時不請假、不離職",
                  "隨時待命，秒回應",
                  "專為餐飲業量身打造",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-dark-300">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== 4. 10 GPTs Showcase ===== */}
      <section className="py-24 bg-white">
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
                className={`relative bg-white p-6 rounded-2xl border transition-all duration-300 ${
                  gpt.isTrial
                    ? "border-emerald-300 ring-2 ring-emerald-200 shadow-lg shadow-emerald-500/10"
                    : "border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5"
                }`}
              >
                {gpt.isTrial && (
                  <span className="absolute -top-3 left-4 px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold rounded-full">
                    免費試用
                  </span>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{gpt.emoji}</span>
                    <span className="text-xs font-bold text-dark-400 bg-dark-100 px-2 py-0.5 rounded">
                      #{gpt.id}
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${gpt.freqColor}`}>
                    {gpt.freq}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2">{gpt.name}</h3>
                <p className="text-xs text-dark-400 mb-3">
                  取代{" "}
                  <span className="font-semibold text-dark-600">{gpt.role}</span>
                </p>
                <p className="text-dark-500 text-sm leading-relaxed mb-3">{gpt.desc}</p>
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-dark-400 leading-relaxed">
                    <span className="text-emerald-600 font-semibold">使用情境：</span>{gpt.example}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="mt-12 text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-3 text-sm">
              <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full font-medium">每天用</span>
              <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full font-medium">每週用</span>
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium">每月用</span>
              <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full font-medium">每季用</span>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full font-medium">不定期</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 5. GPT Preview Screenshots ===== */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">實際畫面搶先看</h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              每位 AI Agent 都有專屬頭像與角色設定，打開 ChatGPT 即可使用
            </p>
          </motion.div>

          <motion.div {...fadeUp} className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <Image
                src="/images/ai-pack/gpts-preview-1.png"
                alt="AI Agent 實際畫面 — LINE/客服訊息管家、商家評論回覆手、菜單設計顧問、活動企劃師、社群貼文機"
                width={800}
                height={800}
                className="w-full h-auto"
              />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <Image
                src="/images/ai-pack/gpts-preview-2.png"
                alt="AI Agent 實際畫面 — 老闆決策顧問、營運覆盤師、廣告投放教練、徵人文案+面試官、食材成本計算機"
                width={800}
                height={800}
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 6. Social Proof / Testimonials ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">老闆們怎麼說</h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              來自真實餐飲業者的回饋
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="bg-gray-50 rounded-2xl border border-gray-100 p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-amber-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-dark-600 text-sm leading-relaxed mb-6">
                  「{t.quote}」
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-dark-400 text-xs">{t.store}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7. Free Trial Section ===== */}
      <section id="trial" className="py-24 bg-gradient-to-br from-emerald-50 to-cyan-50 scroll-mt-20">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 rounded-full text-sm font-semibold mb-4">
              限時免費領取
            </span>
            <h2 className="text-3xl font-bold mb-4">
              先免費體驗，再決定升級
            </h2>
            <p className="text-dark-500 max-w-lg mx-auto">
              填寫資料，立即領取「<strong>社群文案機器人</strong>」<br />
              每天幫你產出餐飲社群貼文，用了才知道有多省事
            </p>
          </motion.div>

          <motion.div {...fadeUp} className="bg-white rounded-3xl shadow-xl shadow-emerald-500/10 border border-emerald-100 overflow-hidden">
            {!trialDone ? (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-3xl">📱</span>
                  <div>
                    <p className="font-bold text-gray-900">社群文案機器人</p>
                    <p className="text-sm text-emerald-700 font-medium">客製化 ChatGPT Agent｜免費領取</p>
                  </div>
                  <span className="ml-auto px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">免費</span>
                </div>

                <div className="flex items-center justify-center gap-2 mb-6 py-2 px-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-amber-600 text-sm font-semibold">本月已有 21 人領取</span>
                </div>

                <form onSubmit={handleTrialSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      姓名 <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={trialForm.name}
                      onChange={(e) => setTrialForm({ ...trialForm, name: e.target.value })}
                      placeholder="你的姓名"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={trialForm.email}
                      onChange={(e) => setTrialForm({ ...trialForm, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      手機號碼 <span className="text-gray-400 font-normal">(選填)</span>
                    </label>
                    <input
                      type="tel"
                      value={trialForm.phone}
                      onChange={(e) => setTrialForm({ ...trialForm, phone: e.target.value.replace(/\D/g, "") })}
                      placeholder="0912345678"
                      maxLength={10}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>

                  {trialError && (
                    <p className="text-red-500 text-sm font-medium">{trialError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={trialSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 text-base"
                  >
                    {trialSubmitting ? "處理中..." : "免費領取社群文案機器人 →"}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    填寫後連結會寄到你的 Email 信箱
                  </p>
                </form>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center text-3xl">
                  🎉
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">已成功領取！</h3>
                <p className="text-gray-500 mb-6">感謝你，{trialForm.name}！你的社群文案機器人已準備好了</p>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-4">
                  <p className="text-emerald-800 text-sm font-medium">
                    使用連結已寄送至 <strong>{trialForm.email}</strong>，請查收信箱
                  </p>
                  <p className="text-emerald-600 text-xs mt-1">沒收到？請檢查垃圾郵件資料夾，或確認 Email 是否正確</p>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
                  <p className="text-amber-800 font-semibold text-sm mb-1">覺得好用嗎？</p>
                  <p className="text-amber-700 text-sm mb-3">升級全配包，一次解鎖 9 位 AI 專家，只要 NT$1,299</p>
                  <a
                    href="#pricing"
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors text-sm"
                  >
                    查看限時方案 →
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ===== 8. Pricing ===== */}
      <section id="pricing" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-700 rounded-full text-sm font-semibold mb-4">
              限時優惠
            </span>
            <h2 className="text-3xl font-bold mb-4">升級全配包</h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              試用後覺得好用？一次解鎖剩下 9 位 AI 專家，限時特價搶先鎖定
            </p>
          </motion.div>

          <motion.div {...fadeUp} className="relative bg-dark-900 text-white rounded-3xl p-10 ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/10 max-w-xl mx-auto">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black rounded-full tracking-wide uppercase">
              限時優惠
            </span>

            {/* Countdown Timer */}
            <div className="mb-6 p-4 bg-dark-800 rounded-2xl border border-dark-700">
              <p className="text-dark-400 text-xs font-semibold text-center mb-3">限時優惠倒數</p>
              <div className="flex items-center justify-center gap-3">
                {[
                  { value: countdown.days, label: "天" },
                  { value: countdown.hours, label: "時" },
                  { value: countdown.minutes, label: "分" },
                  { value: countdown.seconds, label: "秒" },
                ].map((unit, i) => (
                  <div key={i} className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-extrabold text-emerald-400 tabular-nums">
                        {String(unit.value).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="text-dark-500 text-xs mt-1 block">{unit.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-1">AI 個體包 全配方案</h3>
              <p className="text-dark-400 text-sm">9 位 AI Agent，餐飲經營全面覆蓋</p>
            </div>

            <div className="mb-6">
              <span className="text-dark-500 line-through text-sm">NT$ 9,880</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  NT$ 1,299
                </span>
                <span className="text-emerald-400 font-semibold text-sm">省 NT$ 8,581</span>
              </div>
              <p className="text-dark-400 text-sm mt-2">= 每天不到 $3.6，比一杯超商咖啡還便宜</p>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold text-dark-400 mb-3">包含的 9 位 AI Agent：</p>
              <ul className="space-y-2.5">
                {gpts.filter(g => FULL_PACK_IDS.includes(g.id)).map((gpt) => (
                  <li key={gpt.id} className="flex items-center gap-2.5 text-sm">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs flex-shrink-0">✓</span>
                    <span className="text-white">{gpt.emoji} {gpt.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4">
              <p className="text-emerald-300 text-xs font-medium">
                另附贈「社群文案機器人」（可先免費試用）<br />
                合計共 10 位 AI 專家，一次擁有完整行銷軍團
              </p>
            </div>

            {/* Support Badge */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6 text-center">
              <p className="text-amber-400 text-sm font-bold">
                💬 專屬客服支援，使用問題隨時問
              </p>
              <p className="text-amber-400/70 text-xs mt-0.5">購買後提供完整教學 + 一對一操作指導</p>
            </div>

            <Link
              href="/checkout/ai-pack?plan=3"
              className="block w-full py-4 rounded-xl font-bold text-center bg-gradient-to-r from-emerald-500 to-cyan-600 text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 text-lg"
            >
              立即搶購 NT$1,299 →
            </Link>

            <p className="text-center text-xs text-dark-500 mt-4">
              付款後立即開通，永久使用不限次數
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== 9. How It Works ===== */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">三步驟，啟動你的 AI 行銷軍團</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "免費領取試用", desc: "填寫資料，立即領取「社群文案機器人」，零門檻體驗 AI 幫你寫貼文" },
              { step: "02", title: "體驗滿意再升級", desc: "用過覺得好用？一次解鎖 9 位 AI 專家，涵蓋餐飲經營所有場景" },
              { step: "03", title: "NT$1,299 立即開工", desc: "一次買斷永久使用，今天就讓 AI 幫你分擔行銷、管理、企劃大小事" },
            ].map((s, i) => (
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
                <p className="text-dark-500 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 10. FAQ ===== */}
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
                  <span className="text-dark-400 group-open:rotate-45 transition-transform duration-200 text-xl">+</span>
                </summary>
                <div className="px-6 pb-5 text-sm text-dark-500 leading-relaxed">{faq.a}</div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 11. Final CTA ===== */}
      <section className="py-24 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              今天開始，讓 AI 幫你打理行銷大小事
            </h2>
            <p className="text-dark-400 mb-8 max-w-xl mx-auto">
              不用再一個人扛所有事，10 位 AI 專家隨時待命
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#trial"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 text-lg"
              >
                免費試用 →
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-dark-600 text-dark-300 font-semibold rounded-xl hover:border-dark-400 hover:text-white transition-all duration-300"
              >
                查看 NT$1,299 方案
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

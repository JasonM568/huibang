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

const reportContents = [
  {
    icon: "📊",
    title: "帳號現況總覽",
    desc: "FB、IG、Threads 三平台的粉絲數、成長趨勢、帳號完整度檢核，一眼看清你的社群起跑點。",
  },
  {
    icon: "📈",
    title: "內容表現分析",
    desc: "近期貼文的觸及率、互動率、分享率排行，找出哪類主題和格式最能打動你的受眾。",
  },
  {
    icon: "👥",
    title: "受眾輪廓解析",
    desc: "分析你的粉絲組成（年齡、性別、活躍時段），確認是否與你的目標客群吻合。",
  },
  {
    icon: "🔍",
    title: "競品社群比較",
    desc: "挑選 2~3 個競品，比較發文頻率、互動表現、內容策略差異，找出你的機會點。",
  },
  {
    icon: "🎯",
    title: "問題診斷與建議",
    desc: "指出目前最大的社群經營瓶頸，提供 3~5 項可立即執行的改善建議。",
  },
  {
    icon: "📋",
    title: "推薦行動計畫",
    desc: "根據分析結果，建議最適合你的社群經營方向與方案選擇。",
  },
];

const comparisons = [
  { item: "分析方式", free: "AI 自動分析問卷回答", paid: "人工深度分析實際社群帳號" },
  { item: "報告頁數", free: "1 頁摘要", paid: "5~15 頁完整報告" },
  { item: "數據來源", free: "你填寫的自我評估", paid: "你的真實社群數據" },
  { item: "競品分析", free: "❌ 無", paid: "✅ 2~3 個競品比較" },
  { item: "受眾分析", free: "❌ 無", paid: "✅ 粉絲輪廓解析" },
  { item: "內容分析", free: "❌ 無", paid: "✅ 貼文表現排行" },
  { item: "具體建議", free: "3 項通用建議", paid: "3~5 項客製化建議" },
  { item: "行動計畫", free: "❌ 無", paid: "✅ 推薦方案 + 執行方向" },
];

const steps = [
  {
    step: "01",
    title: "填寫資料",
    desc: "提供你的 FB、IG、Threads 帳號連結，以及想分析的 2~3 個競品",
  },
  {
    step: "02",
    title: "深度分析",
    desc: "我們的分析師會花 2~3 個工作天，深入分析你的社群表現",
  },
  {
    step: "03",
    title: "報告交付",
    desc: "你會收到一份 5~15 頁的 PDF 報告 + 30 分鐘線上報告說明會議",
  },
];

const faqs = [
  {
    q: "需要提供什麼資料？",
    a: "你的 FB 粉絲專頁、IG 帳號、Threads 帳號的連結，以及 2~3 個你認為的競品帳號。如果有 Meta Business Suite 後台權限，分析會更深入。",
  },
  {
    q: "報告多久可以收到？",
    a: "付款確認後 3~5 個工作天內會交付完整報告，並安排 30 分鐘的線上會議為你說明報告內容。",
  },
  {
    q: "如果我之後簽約社群經營方案呢？",
    a: "健診費用 NT$ 2,500 可以全額折抵社群經營方案的第一個月費用，等於這次分析完全免費。",
  },
  {
    q: "沒有某個平台的帳號也可以嗎？",
    a: "可以！我們會針對你有的平台進行分析，並在報告中建議是否需要開設其他平台。",
  },
  {
    q: "只有一個平台也能做嗎？",
    a: "可以，不過我們建議至少有兩個平台以上，分析的比較效果會更完整。單一平台也同樣價格。",
  },
];

export default function SocialAuditPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.08),transparent)]" />
        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <motion.div {...fadeUp}>
            <span className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium mb-6">
              深度社群帳號分析健診
            </span>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              你的社群帳號
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                真正的問題在哪裡？
              </span>
            </h1>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto mb-8">
              免費健檢看的是你的「自我評估」，深度健診看的是「真實數據」。
              <br className="hidden sm:block" />
              一份 5~15 頁的專業報告，讓你真正看見社群經營的盲點和機會。
            </p>

            {/* Pricing hero */}
            <div className="inline-flex flex-col items-center bg-white/5 backdrop-blur border border-white/10 rounded-2xl px-10 py-6 mb-8">
              <span className="text-dark-400 text-sm line-through mb-1">
                原價 NT$ 5,000
              </span>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-white">
                  NT$ 2,500
                </span>
              </div>
              <span className="text-indigo-400 text-sm font-medium mt-2">
                🎉 品牌健檢問卷專屬優惠價
              </span>
              <span className="text-green-400 text-xs mt-1">
                ✨ 簽約社群方案可全額折抵第一個月費用
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://p.ecpay.com.tw/120B010"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                立即購買深度健診 →
              </a>
              <a
                href="#compare"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-dark-600 text-dark-300 font-semibold rounded-xl hover:border-dark-400 hover:text-white transition-all duration-300"
              >
                跟免費健檢差在哪？
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              免費健檢 vs 深度健診
            </h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              免費品牌健檢是「自我評估」，深度健診是「實際數據分析」
            </p>
          </motion.div>

          <motion.div {...fadeUp} className="overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-6 py-4 font-medium text-gray-500">
                    項目
                  </th>
                  <th className="text-center px-6 py-4 font-medium text-gray-500">
                    免費品牌健檢
                  </th>
                  <th className="text-center px-6 py-4 font-medium text-indigo-600 bg-indigo-50">
                    深度社群健診 ⭐
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, i) => (
                  <tr
                    key={row.item}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {row.item}
                    </td>
                    <td className="px-6 py-3 text-center text-gray-500">
                      {row.free}
                    </td>
                    <td className="px-6 py-3 text-center text-indigo-700 font-medium bg-indigo-50/50">
                      {row.paid}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">價格</td>
                  <td className="px-6 py-4 text-center font-bold text-green-600">
                    免費
                  </td>
                  <td className="px-6 py-4 text-center bg-indigo-50/50">
                    <span className="text-gray-400 line-through text-xs">
                      $5,000
                    </span>{" "}
                    <span className="font-bold text-indigo-600">$2,500</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Report Contents */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">報告包含什麼？</h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              一份 5~15 頁的專業 PDF 報告 + 30 分鐘線上說明會議
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportContents.map((item, i) => (
              <motion.div
                key={item.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-dark-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">怎麼進行？</h2>
            <p className="text-dark-500">簡單三步，3~5 個工作天拿到報告</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
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

      {/* Funnel explanation */}
      <section className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-bold mb-6">
              健診費用可全額折抵
            </h2>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-indigo-100">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
                    🔍
                  </div>
                  <p className="font-bold text-sm">深度健診</p>
                  <p className="text-indigo-600 font-bold">$2,500</p>
                </div>
                <div className="text-2xl text-gray-300">→</div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                    ✅
                  </div>
                  <p className="font-bold text-sm">簽約社群方案</p>
                  <p className="text-green-600 font-bold">折抵 $2,500</p>
                </div>
                <div className="text-2xl text-gray-300">=</div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
                    🎉
                  </div>
                  <p className="font-bold text-sm">健診等於</p>
                  <p className="text-orange-600 font-bold">完全免費</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                如果你在收到報告後決定簽約社群經營方案，
                健診費用 $2,500 會直接從第一個月的方案費用中扣除，
                等於深度健診完全免費。
              </p>
            </div>
          </motion.div>
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
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
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
              準備好看見社群的真實面貌了嗎？
            </h2>
            <p className="text-dark-400 mb-3 max-w-xl mx-auto">
              一份報告，讓你不再憑感覺經營社群
            </p>
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="text-dark-500 line-through">NT$ 5,000</span>
              <span className="text-3xl font-black text-white">
                NT$ 2,500
              </span>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-bold">
                省 50%
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://p.ecpay.com.tw/120B010"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                立即購買深度健診 →
              </a>
              <Link
                href="/plans/social-media"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-dark-600 text-dark-300 font-semibold rounded-xl hover:border-dark-400 hover:text-white transition-all duration-300"
              >
                先看社群經營方案
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

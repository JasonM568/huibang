import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.15),transparent)]" />
        <div className="relative max-w-6xl mx-auto px-6 py-32 text-center">
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
            讓每個品牌
            <br />
            <span className="text-gradient">都找到對的人</span>
          </h1>
          <p className="text-dark-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            惠邦行銷以數據驅動的品牌策略，協助企業在數位時代建立清晰定位、精準觸及目標客群。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/questionnaire"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              免費品牌健檢 →
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-dark-600 text-dark-300 font-semibold rounded-xl hover:border-dark-400 hover:text-white transition-all duration-300"
            >
              了解服務
            </Link>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">我們的服務</h2>
          <p className="text-dark-500 text-center mb-16 max-w-xl mx-auto">
            從品牌策略到執行落地，提供完整的數位行銷解決方案
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🎯", title: "品牌定位", desc: "找到品牌獨特的市場定位與價值主張" },
              { icon: "📣", title: "廣告投放", desc: "FB / Google / LINE 全平台精準投放" },
              { icon: "📱", title: "社群經營", desc: "打造有溫度的品牌社群與內容策略" },
              { icon: "✍️", title: "內容行銷", desc: "用好內容建立品牌信任與長期流量" },
            ].map((s) => (
              <div
                key={s.title}
                className="p-6 rounded-2xl border border-dark-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 group"
              >
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-brand-600 transition-colors">
                  {s.title}
                </h3>
                <p className="text-dark-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-brand-50 to-brand-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">想知道你的品牌健康嗎？</h2>
          <p className="text-dark-500 mb-8">
            花 20 分鐘填寫品牌自我檢測問卷，免費獲得 AI 品牌健檢報告
          </p>
          <Link
            href="/questionnaire"
            className="inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl text-lg hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            立即免費檢測 →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 text-dark-400 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="font-bold text-white text-lg mb-2">惠邦行銷</p>
          <p className="text-sm">讓每個品牌都找到對的人</p>
          <p className="text-xs mt-6">
            © {new Date().getFullYear()} 惠邦行銷. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

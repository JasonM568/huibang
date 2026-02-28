import Link from "next/link";
import { getBlogPosts } from "@/lib/notion";

const categoryColors: Record<string, string> = {
  "品牌策略": "bg-blue-50 text-blue-600",
  "行銷知識": "bg-green-50 text-green-600",
  "AI 應用": "bg-purple-50 text-purple-600",
};

export const revalidate = 60; // ISR: 每 60 秒重新抓取

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-brand-400 font-semibold mb-4">BLOG</p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              行銷<span className="text-gradient">知識庫</span>
            </h1>
            <p className="text-dark-400 text-lg leading-relaxed">
              品牌策略、廣告投放、AI 行銷應用⋯⋯我們把實戰經驗寫成文章，幫助你做出更好的行銷決策。
            </p>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-6xl mb-6">📝</p>
              <p className="text-dark-400 text-lg">文章準備中，敬請期待！</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-2xl border border-dark-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Cover */}
                  <div className="h-48 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center relative overflow-hidden">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-6xl">
                        {post.category === "品牌策略" ? "🎯" : post.category === "行銷知識" ? "📣" : "🤖"}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[post.category] || "bg-dark-100 text-dark-500"}`}>
                        {post.category}
                      </span>
                      <span className="text-xs text-dark-400">
                        {post.publishDate}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold mb-2 group-hover:text-brand-500 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-dark-500 text-sm leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>
                    <div className="mt-4 text-brand-500 text-sm font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      閱讀更多 →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-brand-50 to-brand-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">想了解你的品牌現況？</h2>
          <p className="text-dark-500 mb-8">
            免費品牌健檢，AI 在 3 分鐘內給你一份完整的品牌健康報告
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

import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/notion";
import { notFound } from "next/navigation";
import PixelViewContent from "@/components/PixelViewContent";

export const revalidate = 60;

// 預先產生已知的路徑
export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// 動態 metadata：每篇文章有獨立的標題、描述、og:image
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) return {};

  const ogImages = post.coverImage
    ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }]
    : [{ url: "/og-default.png", width: 1200, height: 630, alt: post.title }];

  return {
    title: post.title,
    description: post.summary || `${post.title} — 惠邦行銷行銷知識庫`,
    openGraph: {
      title: post.title,
      description: post.summary || `${post.title} — 惠邦行銷行銷知識庫`,
      type: "article",
      url: `https://huibang.com.tw/blog/${post.slug}`,
      publishedTime: post.publishDate,
      authors: [post.author],
      tags: [post.category],
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary || `${post.title} — 惠邦行銷行銷知識庫`,
      images: ogImages.map((i) => i.url),
    },
  };
}

const categoryColors: Record<string, string> = {
  "品牌策略": "bg-blue-50 text-blue-600",
  "行銷知識": "bg-green-50 text-green-600",
  "AI 應用": "bg-purple-50 text-purple-600",
};

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <PixelViewContent
        contentName={post.title}
        contentCategory={post.category}
        contentType="article"
        contentIds={[post.slug]}
      />
      {/* Hero */}
      <section className="bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <Link
            href="/blog"
            className="inline-flex items-center text-dark-400 hover:text-white text-sm mb-8 transition-colors"
          >
            ← 回到文章列表
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[post.category] || "bg-dark-700 text-dark-300"}`}>
              {post.category}
            </span>
            <span className="text-dark-400 text-sm">{post.publishDate}</span>
            <span className="text-dark-400 text-sm">· {post.author}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black leading-tight">
            {post.title}
          </h1>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <article
            className="prose prose-lg max-w-none text-dark-600"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-dark-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-2xl p-8 md:p-12 text-center shadow-sm">
            <p className="text-4xl mb-4">💡</p>
            <h3 className="text-2xl font-bold mb-3">覺得這篇文章有幫助？</h3>
            <p className="text-dark-500 mb-6">
              免費做品牌健檢，看看你的品牌在哪些地方可以做得更好
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/questionnaire"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300"
              >
                免費品牌健檢 →
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-dark-200 text-dark-600 font-semibold rounded-xl hover:border-dark-400 transition-all duration-300"
              >
                看更多文章
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

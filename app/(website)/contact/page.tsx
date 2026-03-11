"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const contactInfo = [
  {
    icon: "📍",
    title: "地址",
    content: "高雄市三民區九如一路61號5F-2",
  },
  {
    icon: "📞",
    title: "電話",
    content: "07-2810889",
  },
  {
    icon: "✉️",
    title: "Email",
    content: "service@huibang.com.tw",
  },
  {
    icon: "💬",
    title: "LINE",
    content: "@213dtnty",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("送出失敗");
      setSubmitted(true);
    } catch (err) {
      setError("送出失敗，請稍後再試或直接來電聯繫");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="max-w-3xl">
            <p className="text-brand-400 font-semibold mb-4">CONTACT US</p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              讓我們開始
              <br />
              <span className="text-gradient">聊聊吧</span>
            </h1>
            <p className="text-dark-400 text-lg leading-relaxed">
              不管是品牌定位、廣告投放還是行銷策略，都歡迎跟我們聊聊。我們會在 1-2 個工作天內回覆您。
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-16">
            {/* Contact Info */}
            <motion.div {...fadeUp} className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-8">聯絡資訊</h2>
              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <div key={info.title} className="flex gap-4">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <p className="font-semibold text-sm text-dark-400 mb-1">
                        {info.title}
                      </p>
                      <p className="text-dark-700">{info.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Business Hours */}
              <div className="mt-10 p-6 bg-dark-50 rounded-2xl">
                <h3 className="font-bold mb-3">營業時間</h3>
                <p className="text-dark-500 text-sm">
                  週一至週五 09:00 - 18:00
                </p>
                <p className="text-dark-400 text-sm mt-1">
                  （國定假日休息）
                </p>
              </div>

              {/* LINE QR Code + Add Friend */}
              <div className="mt-8 p-6 bg-brand-50 rounded-2xl text-center">
                <p className="font-bold mb-3">加入 LINE 官方帳號</p>
                <div className="w-40 h-40 mx-auto">
                  <img src="/line-qrcode.png" alt="LINE 官方帳號 QR Code" className="w-full h-full object-contain rounded-xl" />
                </div>
                <div className="mt-4">
                  <a
                    href="https://lin.ee/6Cibkgs"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.dataLayer = window.dataLayer || [];
                        window.dataLayer.push({
                          event: "add_line_friend",
                          event_category: "engagement",
                          event_label: "contact_page",
                          link_url: "https://lin.ee/6Cibkgs",
                        });
                      }
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://scdn.line-apps.com/n/line_add_friends/btn/zh-Hant.png" alt="加入好友" height="36" style={{ height: 36, display: "inline-block" }} />
                  </a>
                </div>
                <p className="text-sm text-dark-500 mt-3">掃描或點擊加入，即時諮詢</p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-3"
            >
              {submitted ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-6">🎉</div>
                    <h2 className="text-2xl font-bold mb-4">
                      感謝您的來信！
                    </h2>
                    <p className="text-dark-500">
                      我們已收到您的訊息，會在 1-2 個工作天內回覆您。
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-8">寫信給我們</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-dark-600 mb-2">
                          姓名 *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                          placeholder="您的姓名"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-600 mb-2">
                          公司 / 品牌名稱
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              company: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                          placeholder="您的公司或品牌"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-dark-600 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark-600 mb-2">
                          電話
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                          placeholder="09XX-XXX-XXX"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-600 mb-2">
                        您感興趣的服務
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) =>
                          setFormData({ ...formData, service: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-dark-600"
                      >
                        <option value="">請選擇</option>
                        <option value="brand">品牌定位策略</option>
                        <option value="ads">廣告投放優化</option>
                        <option value="social">社群經營管理</option>
                        <option value="content">內容行銷</option>
                        <option value="other">其他 / 不確定</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-600 mb-2">
                        訊息內容 *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-dark-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all resize-none"
                        placeholder="請簡述您的需求或問題..."
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl text-lg hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "送出中..." : "送出訊息 →"}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

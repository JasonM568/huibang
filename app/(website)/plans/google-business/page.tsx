"use client";

import { useState } from "react";
import Link from "next/link";
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

const painPoints = [
  {
    icon: "\ud83d\udccd",
    title: "Google \u5730\u5716\u627e\u4e0d\u5230",
    desc: "\u5ba2\u4eba\u641c\u5c0b\u4f60\u7684\u9910\u5ef3\u985e\u578b\uff0c\u537b\u770b\u4e0d\u5230\u4f60\u7684\u5e97",
  },
  {
    icon: "\u2b50",
    title: "\u8a55\u8ad6\u6c92\u4eba\u7ba1",
    desc: "\u8ca0\u8a55\u6c92\u56de\u8986\u3001\u597d\u8a55\u6c92\u7d93\u71df\uff0c\u6f5b\u5728\u5ba2\u4eba\u770b\u4e86\u5c31\u8d70",
  },
  {
    icon: "\ud83d\udcb8",
    title: "\u5ee3\u544a\u9322\u767d\u82b1",
    desc: "Google Ads \u6bcf\u6708\u71d2\u9322\uff0c\u4f46\u8a02\u4f4d\u96fb\u8a71\u6c92\u589e\u52a0",
  },
  {
    icon: "\ud83d\udcca",
    title: "\u6578\u64da\u770b\u4e0d\u61c2",
    desc: "CTR\u3001CPC\u3001\u8f49\u63db\u7387\u4e00\u5806\u6578\u5b57\uff0c\u4e0d\u77e5\u9053\u600e\u9ebc\u512a\u5316",
  },
];

const serviceFeatures = [
  {
    icon: "\ud83c\udfea",
    title: "\u5546\u5bb6\u6a94\u6848\u5168\u9762\u512a\u5316",
    desc: "\u540d\u7a31\u3001\u985e\u5225\u3001\u8aaa\u660e\u6b04\u4f4d\u3001\u5716\u7247\u3001Q&A\u3001\u8cbc\u6587\u7b56\u7565\uff0c\u4e5d\u5927\u91cd\u9ede\u9010\u4e00\u512a\u5316",
  },
  {
    icon: "\ud83d\udcca",
    title: "\u5ee3\u544a\u7b56\u7565\u898f\u5283",
    desc: "\u5b9a\u4e3b\u984c\u3001\u9396\u5730\u5340\uff083-5\u516c\u91cc\uff09\u3001\u9078\u6642\u6bb5\u3001\u6253\u6d3b\u52d5\uff0c\u56db\u5927\u7b56\u7565\u7cbe\u6e96\u6295\u653e",
  },
  {
    icon: "\ud83d\uddfa\ufe0f",
    title: "\u6d88\u8cbb\u8005\u65c5\u7a0b\u8a2d\u8a08",
    desc: "\u5f15\u6d41\u2192\u8003\u616e\u2192\u6536\u7db2\u4e09\u968e\u6bb5\u5ee3\u544a\u8a2d\u8a08\uff0c\u5f9e\u964c\u751f\u4eba\u5230\u56de\u982d\u5ba2\u7684\u5b8c\u6574\u8def\u5f91",
  },
  {
    icon: "\u270d\ufe0f",
    title: "\u5ee3\u544a\u6587\u6848\u64b0\u5beb",
    desc: "15 \u500b\u6a19\u984c + 4 \u500b\u8aaa\u660e\uff0cGoogle \u81ea\u52d5\u7d44\u5408\u51fa\u6700\u4f73\u7248\u672c",
  },
  {
    icon: "\ud83d\udcc8",
    title: "\u6578\u64da\u5224\u8b80\u8207\u512a\u5316",
    desc: "\u6bcf\u9031\u8ffd\u8e64 CTR/CPC/\u8f49\u63db\u7387\uff0c\u6301\u7e8c\u512a\u5316\u5ee3\u544a\u8868\u73fe",
  },
];

const planFeatures = [
  "Google \u5546\u5bb6\u6a94\u6848\u5efa\u7acb\u8207\u512a\u5316",
  "Google Ads \u5ee3\u544a\u5e33\u6236\u5efa\u7acb",
  "\u6bcf\u6708\u5ee3\u544a\u7b56\u7565\u898f\u5283\u8207\u8abf\u6574",
  "\u5ee3\u544a\u6587\u6848\u64b0\u5beb\uff08\u6bcf\u6708\u66f4\u65b0\uff09",
  "\u6bcf\u9031\u5ee3\u544a\u6578\u64da\u8ffd\u8e64\u8207\u512a\u5316",
  "\u6bcf\u6708\u6210\u6548\u5831\u544a",
  "\u8a55\u8ad6\u56de\u8986\u7b56\u7565\u6307\u5c0e",
  "\u5c08\u5c6c LINE \u7fa4\u7d44\u5373\u6642\u6e9d\u901a",
];

const processSteps = [
  {
    step: "01",
    title: "\u5546\u5bb6\u5065\u6aa2",
    desc: "\u5206\u6790\u73fe\u6709 Google \u5546\u5bb6\u6a94\u6848\uff0c\u627e\u51fa\u512a\u5316\u7a7a\u9593",
  },
  {
    step: "02",
    title: "\u7b56\u7565\u898f\u5283",
    desc: "\u6839\u64da\u9910\u5ef3\u7279\u8272\u5236\u5b9a\u5ee3\u544a\u7b56\u7565\u8207\u95dc\u9375\u5b57\u4f48\u5c40",
  },
  {
    step: "03",
    title: "\u6a94\u6848\u512a\u5316",
    desc: "\u5b8c\u6210\u5546\u5bb6\u4e5d\u5927\u6b04\u4f4d\u512a\u5316\uff0c\u5efa\u7acb\u5ee3\u544a\u5e33\u6236",
  },
  {
    step: "04",
    title: "\u5ee3\u544a\u4e0a\u7dda",
    desc: "\u555f\u52d5\u4e09\u968e\u6bb5\u5ee3\u544a\u6295\u653e\uff0c\u6301\u7e8c\u76e3\u6e2c\u6210\u6548",
  },
  {
    step: "05",
    title: "\u6578\u64da\u512a\u5316",
    desc: "\u6bcf\u9031\u8abf\u6574\uff0c\u6bcf\u6708\u5831\u544a\uff0c\u6301\u7e8c\u63d0\u5347 ROI",
  },
];

const faqs = [
  {
    q: "\u5408\u7d04\u671f\u9593\u662f\u591a\u4e45\uff1f",
    a: "\u6700\u4f4e\u5408\u4f5c\u671f\u9593\u70ba\u4e09\u500b\u6708\u3002\u4e09\u500b\u6708\u5f8c\u53ef\u9078\u64c7\u7e8c\u7d04\u6216\u8abf\u6574\u3002Google \u5546\u5bb6\u512a\u5316\u9700\u8981\u6301\u7e8c\u7d93\u71df\uff0c\u901a\u5e38 3 \u500b\u6708\u958b\u59cb\u770b\u5230\u660e\u986f\u6210\u6548\u3002",
  },
  {
    q: "\u5ee3\u544a\u8cbb\u5305\u542b\u5728\u65b9\u6848\u8cbb\u7528\u88e1\u55ce\uff1f",
    a: "\u4e0d\u5305\u542b\u3002\u65b9\u6848\u8cbb\u7528\u70ba\u7b56\u7565\u898f\u5283\u8207\u57f7\u884c\u7ba1\u7406\u8cbb\uff0cGoogle Ads \u5ee3\u544a\u8cbb\u7531\u4f60\u76f4\u63a5\u652f\u4ed8\u7d66 Google\uff0c\u5efa\u8b70\u6bcf\u6708 NT$9,000-15,000\u3002",
  },
  {
    q: "\u6211\u7684\u5e97\u4e0d\u662f\u9910\u98f2\u696d\u4e5f\u53ef\u4ee5\u55ce\uff1f",
    a: "\u53ef\u4ee5\uff01\u6211\u5011\u7684\u670d\u52d9\u9069\u7528\u65bc\u6240\u6709\u9700\u8981\u63d0\u5347 Google \u5730\u5716\u6392\u540d\u7684\u5728\u5730\u5e97\u5bb6\uff0c\u5305\u62ec\u7f8e\u5bb9\u7f8e\u9aee\u3001\u8a3a\u6240\u3001\u5065\u8eab\u623f\u3001\u96f6\u552e\u9580\u5e02\u7b49\u3002",
  },
  {
    q: "\u591a\u4e45\u53ef\u4ee5\u770b\u5230\u6548\u679c\uff1f",
    a: "\u5546\u5bb6\u6a94\u6848\u512a\u5316\u901a\u5e38 2-4 \u9031\u958b\u59cb\u53cd\u6620\u5728\u641c\u5c0b\u6392\u540d\uff0c\u5ee3\u544a\u6548\u679c 1-2 \u9031\u5373\u53ef\u770b\u5230\u521d\u6b65\u6578\u64da\uff0c3 \u500b\u6708\u5f8c\u6574\u9ad4\u6548\u679c\u6700\u70ba\u986f\u8457\u3002",
  },
  {
    q: "\u53ef\u4ee5\u53ea\u505a\u5546\u5bb6\u512a\u5316\u4e0d\u6295\u5ee3\u544a\u55ce\uff1f",
    a: "\u53ef\u4ee5\u8a0e\u8ad6\u5ba2\u88fd\u5316\u65b9\u6848\uff0c\u4f46\u6211\u5011\u5f37\u70c8\u5efa\u8b70\u642d\u914d\u5ee3\u544a\u6295\u653e\uff0c\u6548\u679c\u6703\u66f4\u986f\u8457\u3002\u55ae\u7d14\u5546\u5bb6\u512a\u5316\u7684\u5831\u50f9\u6b61\u8fce\u806f\u7e6b\u6d3d\u8a62\u3002",
  },
  {
    q: "\u514d\u8cbb\u5546\u5bb6\u5065\u6aa2\u6709\u4ec0\u9ebc\u9650\u5236\u55ce\uff1f",
    a: "\u5b8c\u5168\u514d\u8cbb\uff0c\u6c92\u6709\u4efb\u4f55\u9650\u5236\u3002AI \u6703\u6839\u64da\u4f60\u586b\u5beb\u7684\u8cc7\u8a0a\u5373\u6642\u5206\u6790\uff0c\u7522\u51fa\u5305\u542b\u5546\u5bb6\u512a\u5316\u3001\u5ee3\u544a\u7b56\u7565\u3001\u6587\u6848\u5efa\u8b70\u7684\u5b8c\u6574\u5831\u544a\u3002",
  },
];

interface DiagnosticForm {
  businessName: string;
  businessType: string;
  location: string;
  email: string;
  phone: string;
  problems: string;
  currentAds: string;
  monthlyBudget: string;
}

interface DiagnosticResult {
  title: string;
  content: string;
}

export default function GoogleBusinessPlanPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [expandedResults, setExpandedResults] = useState<Record<number, boolean>>({});
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState<DiagnosticForm>({
    businessName: "",
    businessType: "",
    location: "",
    email: "",
    phone: "",
    problems: "",
    currentAds: "",
    monthlyBudget: "",
  });

  const handleSubmitDiagnostic = async () => {
    if (!formData.email.trim()) {
      setFormError("請填寫 Email 以接收完整報告");
      return;
    }
    setFormError("");
    setLoading(true);
    setResults([]);
    setStep(3);
    try {
      const res = await fetch("/api/gmb-diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.businessName,
          email: formData.email,
          phone: formData.phone,
          type: formData.businessType,
          location: formData.location,
          budget: formData.monthlyBudget || "尚未規劃",
          channels: "尚未確認",
          problem: formData.problems,
          adsData: formData.currentAds,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setResults([{ title: "提示", content: data.error }]);
      } else if (data.result) {
        const parsed = parseResults(data.result);
        setResults(parsed);
        setExpandedResults(
          parsed.reduce(
            (acc: Record<number, boolean>, _, i: number) => ({ ...acc, [i]: i === 0 }),
            {} as Record<number, boolean>
          )
        );
      }
    } catch {
      setResults([{ title: "錯誤", content: "分析過程中發生錯誤，請稍後再試或聯繫我們。" }]);
    } finally {
      setLoading(false);
    }
  };

  const parseResults = (text: string): DiagnosticResult[] => {
    const sections = text.split(/===\s*(.+?)\s*===/);
    const parsed: DiagnosticResult[] = [];
    for (let i = 1; i < sections.length; i += 2) {
      const title = sections[i]?.trim();
      const content = sections[i + 1]?.trim();
      if (title && content) {
        parsed.push({ title, content });
      }
    }
    if (parsed.length === 0 && text.trim()) {
      parsed.push({ title: "分析結果", content: text.trim() });
    }
    return parsed;
  };

  const toggleResult = (index: number) => {
    setExpandedResults((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const canProceedStep1 =
    formData.businessName && formData.businessType && formData.location;
  const canProceedStep2 = formData.problems && formData.email;

  return (
    <div className="min-h-screen">
      <PixelViewContent
        contentName="Google\u5546\u5bb6\u5c0e\u6d41\u65b9\u6848"
        contentCategory="\u670d\u52d9\u65b9\u6848"
        contentType="product"
        contentIds={["google-business"]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.08),transparent)]" />
        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <motion.div {...fadeUp}>
            <span className="inline-block px-4 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-full text-sm font-medium mb-6">
              Google \u5546\u5bb6\u5c0e\u6d41\u65b9\u6848
            </span>
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              \u8b93\u9644\u8fd1\u7684\u5ba2\u4eba
              <br />
              <span className="text-gradient">\u90fd\u80fd\u627e\u5230\u4f60</span>
            </h1>
            <p className="text-dark-400 text-lg max-w-2xl mx-auto mb-8">
              Google \u6211\u7684\u5546\u5bb6\u512a\u5316 + Google Ads \u7cbe\u6e96\u6295\u653e\uff0c\u8b93\u4f60\u7684\u5e97\u5bb6\u5728\u5730\u5716\u641c\u5c0b\u4e2d\u812b\u7a4e\u800c\u51fa\uff0c
              <br className="hidden sm:block" />
              3 \u500b\u6708\u898b\u8b49\u6210\u6548\u3002
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                \u7acb\u5373\u8aee\u8a62\u65b9\u6848 \u2192
              </Link>
              <a
                href="#diagnostic"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-dark-600 text-dark-300 font-semibold rounded-xl hover:border-dark-400 hover:text-white transition-all duration-300"
              >
                \u514d\u8cbb\u5546\u5bb6\u5065\u6aa2 \u2193
              </a>
            </div>
          </motion.div>

          {/* Google icons */}
          <motion.div
            className="flex justify-center gap-8 mt-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {[
              { name: "Google Maps", icon: "\ud83d\uddfa\ufe0f", color: "from-green-500 to-green-600" },
              { name: "Google Ads", icon: "\ud83d\udcb0", color: "from-blue-500 to-blue-600" },
              { name: "Google Search", icon: "\ud83d\udd0d", color: "from-yellow-500 to-orange-500" },
            ].map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-2">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-2xl shadow-lg`}
                >
                  {p.icon}
                </div>
                <span className="text-dark-500 text-xs">{p.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              \u4f60\u7684\u5e97\u5bb6\u662f\u4e0d\u662f\u4e5f\u9047\u5230\u9019\u4e9b\u554f\u984c\uff1f
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {painPoints.map((item, i) => (
              <motion.div
                key={item.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-5 p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300"
              >
                <div className="text-4xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-dark-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Features */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">\u6211\u5011\u5e6b\u4f60\u505a\u4ec0\u9ebc</h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              \u5f9e\u5546\u5bb6\u6a94\u6848\u5230\u5ee3\u544a\u6295\u653e\uff0c\u4e00\u689d\u9f8d\u670d\u52d9
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {serviceFeatures.map((item, i) => (
              <motion.div
                key={item.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-5 p-6 rounded-2xl border border-gray-100 bg-white hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300"
              >
                <div className="text-4xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-dark-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="plans" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">\u65b9\u6848\u8cbb\u7528</h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              \u5305\u542b Google \u5546\u5bb6\u512a\u5316 + \u5ee3\u544a\u7b56\u7565\u57f7\u884c\uff0c\u4e09\u500b\u6708\u4e00\u671f
            </p>
          </motion.div>

          <motion.div
            {...stagger}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl p-8 bg-gradient-to-b from-dark-900 to-dark-800 text-white shadow-2xl shadow-dark-900/20 ring-2 ring-brand-500 max-w-lg mx-auto"
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-500 text-white text-xs font-bold rounded-full">
              3\u500b\u6708\u4e00\u671f
            </span>

            <div className="mb-6 text-center">
              <h3 className="text-xl font-bold mb-1">Google \u5546\u5bb6\u5c0e\u6d41\u65b9\u6848</h3>
              <p className="text-sm text-dark-400">
                \u5546\u5bb6\u512a\u5316 + \u5ee3\u544a\u6295\u653e\u5168\u5305\u670d\u52d9
              </p>
            </div>

            <div className="mb-8 text-center">
              <span className="text-sm text-dark-400">NT$</span>
              <span className="text-5xl font-black mx-1">18,800</span>
              <span className="text-sm text-dark-400">/ \u6708</span>
            </div>

            <ul className="space-y-3 mb-8">
              {planFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs mt-0.5">
                    \u2713
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/contact"
              className="block text-center py-3 rounded-xl font-semibold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300"
            >
              \u7acb\u5373\u8aee\u8a62
            </Link>
          </motion.div>

          <p className="text-center text-sm text-dark-400 mt-8">
            * \u5ee3\u544a\u8cbb\u53e6\u8a08\uff0c\u5efa\u8b70\u6bcf\u6708 NT$9,000-15,000
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">\u5408\u4f5c\u6d41\u7a0b</h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              \u5f9e\u5065\u6aa2\u5230\u512a\u5316\uff0c\u6bcf\u4e00\u6b65\u90fd\u900f\u660e\u6e05\u6670
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-6">
            {processSteps.map((s, i) => (
              <motion.div
                key={s.step}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
                  {s.step}
                </div>
                <h4 className="font-bold mb-2">{s.title}</h4>
                <p className="text-dark-500 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Diagnostic Tool */}
      <section id="diagnostic" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">\u514d\u8cbb AI \u5546\u5bb6\u5065\u6aa2</h2>
            <p className="text-dark-500 max-w-xl mx-auto">
              \u586b\u5beb\u4f60\u7684\u5e97\u5bb6\u8cc7\u8a0a\uff0cAI \u7acb\u5373\u5206\u6790\u4e26\u63d0\u4f9b\u512a\u5316\u5efa\u8b70
            </p>
          </motion.div>

          <motion.div {...fadeUp}>
            <div className="rounded-2xl bg-gradient-to-b from-dark-900 to-dark-800 p-8 shadow-2xl">
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-10">
                {[
                  { n: 1, label: "店家資訊" },
                  { n: 2, label: "問題描述" },
                  { n: 3, label: "分析報告" },
                ].map((s) => (
                  <div key={s.n} className="flex items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          step >= s.n
                            ? "bg-brand-500 text-white"
                            : "bg-dark-700 text-dark-500"
                        }`}
                      >
                        {s.n}
                      </div>
                      <span className="text-xs text-dark-500 hidden sm:block">{s.label}</span>
                    </div>
                    {s.n < 3 && (
                      <div
                        className={`w-10 sm:w-16 h-0.5 mx-1 mb-5 sm:mb-5 transition-colors ${
                          step > s.n ? "bg-brand-500" : "bg-dark-700"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Business Info */}
              {step === 1 && (
                <div className="space-y-5">
                  <h3 className="text-white text-lg font-bold mb-4">
                    \u6b65\u9a5f 1\uff1a\u5e97\u5bb6\u8cc7\u8a0a
                  </h3>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1.5">
                      \u5e97\u5bb6\u540d\u7a31 *
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) =>
                        setFormData({ ...formData, businessName: e.target.value })
                      }
                      placeholder="\u4f8b\uff1a\u5c0f\u738b\u725b\u8089\u9eb5"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1.5">
                      \u696d\u7a2e\u985e\u578b *
                    </label>
                    <input
                      type="text"
                      value={formData.businessType}
                      onChange={(e) =>
                        setFormData({ ...formData, businessType: e.target.value })
                      }
                      placeholder="\u4f8b\uff1a\u9910\u5ef3\u3001\u5496\u5561\u5ef3\u3001\u7f8e\u5bb9\u9662\u3001\u8a3a\u6240"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1.5">
                      \u5e97\u5bb6\u5730\u5740 / \u6240\u5728\u5730\u5340 *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="\u4f8b\uff1a\u9ad8\u96c4\u5e02\u524d\u93ae\u5340\u4e2d\u83ef\u8def 123 \u865f"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                    className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    \u4e0b\u4e00\u6b65 \u2192
                  </button>
                </div>
              )}

              {/* Step 2: Problem + Contact */}
              {step === 2 && (
                <div className="space-y-5">
                  <h3 className="text-white text-lg font-bold mb-4">
                    步驟 2：問題描述與聯絡資訊
                  </h3>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1.5">
                      目前遇到的主要問題 *
                    </label>
                    <textarea
                      value={formData.problems}
                      onChange={(e) =>
                        setFormData({ ...formData, problems: e.target.value })
                      }
                      rows={4}
                      placeholder="例：客人搜尋「附近牛肉麵」找不到我們，評論很少，不知道怎麼經營 Google 商家..."
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1.5">
                      是否目前有投放 Google 廣告？
                    </label>
                    <input
                      type="text"
                      value={formData.currentAds}
                      onChange={(e) =>
                        setFormData({ ...formData, currentAds: e.target.value })
                      }
                      placeholder="例：有，每月花約 5000 元 / 沒有"
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1.5">
                      每月預算範圍
                    </label>
                    <select
                      value={formData.monthlyBudget}
                      onChange={(e) =>
                        setFormData({ ...formData, monthlyBudget: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                    >
                      <option value="">請選擇</option>
                      <option value="5000以下">NT$5,000 以下</option>
                      <option value="5000-10000">NT$5,000 - 10,000</option>
                      <option value="10000-15000">NT$10,000 - 15,000</option>
                      <option value="15000-30000">NT$15,000 - 30,000</option>
                      <option value="30000以上">NT$30,000 以上</option>
                    </select>
                  </div>
                  <div className="border-t border-dark-700 pt-5">
                    <p className="text-dark-400 text-sm mb-4">填寫聯絡資訊以接收完整分析報告</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-dark-400 mb-1.5">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-dark-400 mb-1.5">
                          電話（選填）
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="0912-345-678"
                          className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  {formError && (
                    <p className="text-red-400 text-sm">{formError}</p>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 rounded-xl font-semibold border-2 border-dark-600 text-dark-300 hover:border-dark-400 hover:text-white transition-all duration-300"
                    >
                      ← 上一步
                    </button>
                    <button
                      onClick={handleSubmitDiagnostic}
                      disabled={!canProceedStep2 || loading}
                      className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          AI 分析中...
                        </span>
                      ) : (
                        "免費取得分析報告 →"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Results */}
              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="text-white text-lg font-bold mb-4">
                    分析報告
                  </h3>
                  {loading ? (
                    <div className="text-center py-12">
                      <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-brand-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <p className="text-dark-300 font-medium">AI 正在分析你的店家資訊...</p>
                      <p className="text-dark-500 text-sm mt-2">預計需要 20-30 秒</p>
                    </div>
                  ) : results.length > 0 ? (
                    <div className="space-y-3">
                      {results.map((result, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-dark-600 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleResult(i)}
                            className="w-full flex items-center justify-between px-5 py-4 text-left text-white font-semibold hover:bg-dark-700 transition-colors"
                          >
                            <span>{result.title}</span>
                            <span
                              className={`text-dark-400 transition-transform duration-200 text-xl ${
                                expandedResults[i] ? "rotate-45" : ""
                              }`}
                            >
                              +
                            </span>
                          </button>
                          {expandedResults[i] && (
                            <div className="px-5 pb-5 text-sm text-dark-300 leading-relaxed whitespace-pre-wrap border-t border-dark-700">
                              <div className="pt-4">{result.content}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-dark-400 text-center py-8">
                      \u6b63\u5728\u8f09\u5165\u5206\u6790\u7d50\u679c...
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      onClick={() => {
                        setStep(1);
                        setResults([]);
                        setFormData({
                          businessName: "",
                          businessType: "",
                          location: "",
                          email: "",
                          phone: "",
                          problems: "",
                          currentAds: "",
                          monthlyBudget: "",
                        });
                      }}
                      className="flex-1 py-3 rounded-xl font-semibold border-2 border-dark-600 text-dark-300 hover:border-dark-400 hover:text-white transition-all duration-300"
                    >
                      \u91cd\u65b0\u5065\u6aa2
                    </button>
                    <Link
                      href="/contact"
                      className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 text-center"
                    >
                      \u8aee\u8a62\u5b8c\u6574\u65b9\u6848 \u2192
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">\u5e38\u898b\u554f\u984c</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                {...stagger}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-semibold text-gray-900 hover:text-brand-600 transition-colors">
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
              \u6e96\u5099\u597d\u8b93\u66f4\u591a\u5ba2\u4eba\u627e\u5230\u4f60\u4e86\u55ce\uff1f
            </h2>
            <p className="text-dark-400 mb-8 max-w-xl mx-auto">
              \u9810\u7d04\u514d\u8cbb\u8aee\u8a62\uff0c\u6211\u5011\u6703\u6839\u64da\u4f60\u7684\u5e97\u5bb6\u9700\u6c42\uff0c\u63d0\u4f9b\u6700\u9069\u5408\u7684 Google \u5c0e\u6d41\u65b9\u6848
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                \u7acb\u5373\u8aee\u8a62\u65b9\u6848 \u2192
              </Link>
              <a
                href="tel:07-2810889"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-dark-600 text-dark-300 font-semibold rounded-xl hover:border-dark-400 hover:text-white transition-all duration-300"
              >
                \u64a5\u6253\u96fb\u8a71 07-2810889
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

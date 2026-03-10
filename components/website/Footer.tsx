import Link from "next/link";

const footerLinks = [
  {
    title: "服務",
    links: [
      { href: "/services", label: "品牌定位" },
      { href: "/services", label: "廣告投放" },
      { href: "/plans/social-media", label: "社群方案" },
      { href: "/services", label: "內容行銷" },
    ],
  },
  {
    title: "公司",
    links: [
      { href: "/about", label: "關於惠邦" },
      { href: "/cases", label: "成功案例" },
      { href: "/blog", label: "專欄文章" },
      { href: "/contact", label: "聯絡我們" },
      { href: "/questionnaire", label: "品牌健檢" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-dark-400 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <p className="text-xl font-black text-white mb-3">
              惠邦<span className="text-brand-500">行銷</span>
            </p>
            <p className="text-sm leading-relaxed max-w-sm">
              讓每個品牌都找到對的人。以數據驅動的品牌策略，協助企業在數位時代建立清晰定位、精準觸及目標客群。
            </p>
            <div className="flex gap-4 mt-6">
              <a href="https://www.facebook.com/huibang.889" target="_blank" rel="noopener noreferrer" className="text-dark-500 hover:text-brand-500 transition-colors text-sm">
                Facebook
              </a>
              <a href="https://www.instagram.com/huibang.889" target="_blank" rel="noopener noreferrer" className="text-dark-500 hover:text-brand-500 transition-colors text-sm">
                Instagram
              </a>
              <a href="https://lin.ee/6Cibkgs" target="_blank" rel="noopener noreferrer" className="text-dark-500 hover:text-brand-500 transition-colors text-sm">
                LINE
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-white font-semibold mb-4 text-sm">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">
            © {new Date().getFullYear()} 惠邦行銷. All rights reserved.
          </p>
          <p className="text-xs">
            📍 高雄市三民區九如一路61號5F-2 ｜ 📞 07-2810889 ｜ ✉️ service@huibang.com.tw
          </p>
        </div>
      </div>
    </footer>
  );
}

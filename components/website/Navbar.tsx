"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "首頁" },
  { href: "/about", label: "關於惠邦" },
  { href: "/services", label: "服務項目" },
  { href: "/plans/social-media", label: "社群方案" },
  { href: "/ai/restaurant-pack", label: "AI 應用" },
  { href: "/cases", label: "成功案例" },
  { href: "/blog", label: "專欄文章" },
  { href: "/contact", label: "聯絡我們" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black text-white">
            惠邦<span className="text-brand-500">行銷</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-dark-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/questionnaire"
            className="px-5 py-2 bg-brand-500 text-white text-sm font-semibold rounded-lg hover:bg-brand-600 transition-colors"
          >
            免費品牌健檢
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="選單"
        >
          <span
            className={`w-5 h-0.5 bg-white transition-transform ${isOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`w-5 h-0.5 bg-white transition-opacity ${isOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`w-5 h-0.5 bg-white transition-transform ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-900 border-t border-dark-800 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-dark-300 hover:text-white transition-colors py-2"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/questionnaire"
                onClick={() => setIsOpen(false)}
                className="px-5 py-3 bg-brand-500 text-white font-semibold rounded-lg text-center hover:bg-brand-600 transition-colors"
              >
                免費品牌健檢
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

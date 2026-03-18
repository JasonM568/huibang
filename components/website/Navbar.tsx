"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const planLinks = [
  { href: "/plans/social-media", label: "社群媒體代操" },
  { href: "/plans/google-business", label: "Google 商家導流" },
  { href: "/plans/social-audit", label: "社群帳號健診" },
];

const navLinks = [
  { href: "/", label: "首頁" },
  { href: "/about", label: "關於惠邦" },
  { href: "/services", label: "服務項目" },
  { href: "/ai/restaurant-pack", label: "AI 行銷" },
  { href: "/cases", label: "成功案例" },
  { href: "/blog", label: "專欄文章" },
  { href: "/contact", label: "聯絡我們" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [mobilePlanOpen, setMobilePlanOpen] = useState(false);
  const planRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (planRef.current && !planRef.current.contains(e.target as Node)) {
        setPlanOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          {navLinks.slice(0, 3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-dark-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* Plans Dropdown */}
          <div ref={planRef} className="relative">
            <button
              onClick={() => setPlanOpen(!planOpen)}
              onMouseEnter={() => setPlanOpen(true)}
              className="text-sm text-dark-400 hover:text-white transition-colors flex items-center gap-1"
            >
              行銷方案
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${planOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <AnimatePresence>
              {planOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  onMouseLeave={() => setPlanOpen(false)}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-dark-800 border border-dark-700 rounded-xl shadow-xl overflow-hidden"
                >
                  {planLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setPlanOpen(false)}
                      className="block px-4 py-3 text-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navLinks.slice(3).map((link) => (
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
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-dark-300 hover:text-white transition-colors py-2"
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Plans Accordion */}
              <div>
                <button
                  onClick={() => setMobilePlanOpen(!mobilePlanOpen)}
                  className="w-full flex items-center justify-between text-dark-300 hover:text-white transition-colors py-2"
                >
                  行銷方案
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${mobilePlanOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {mobilePlanOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 border-l-2 border-dark-700 ml-2 mt-1 flex flex-col gap-3">
                        {planLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => { setIsOpen(false); setMobilePlanOpen(false); }}
                            className="text-dark-400 hover:text-white transition-colors py-1 text-sm"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.slice(3).map((link) => (
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

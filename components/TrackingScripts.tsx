"use client";

import Script from "next/script";
import { useEffect } from "react";

interface TrackingScriptsProps {
  gtm: string;
  ga4: string;
  googleAds: string;
  metaPixel: string;
  lineTag: string;
}

export default function TrackingScripts({
  gtm,
  ga4,
  googleAds,
  metaPixel,
  lineTag,
}: TrackingScriptsProps) {
  // Meta Pixel — 用 useEffect 確保只執行一次
  useEffect(() => {
    if (!metaPixel) return;
    if ((window as Record<string, unknown>).__fb_pixel_inited) return;
    (window as Record<string, unknown>).__fb_pixel_inited = true;

    /* eslint-disable */
    (function (f: any, b: any, e: any, v: any) {
      if (f.fbq) return;
      const n: any = (f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      const t = b.createElement(e); t.async = !0; t.src = v;
      const s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", metaPixel);
    window.fbq("track", "PageView");
    /* eslint-enable */
  }, [metaPixel]);

  return (
    <>
      {/* Google Tag Manager */}
      {gtm && (
        <>
          <Script id="gtm-init" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtm}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {/* Google Analytics 4 + Google Ads (共用 gtag.js) */}
      {ga4 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${ga4}');
              ${googleAds ? `gtag('config', '${googleAds}');` : ""}
            `}
          </Script>
        </>
      )}

      {/* Google Ads 獨立載入（僅在沒有 GA4 但有 Ads ID 時） */}
      {!ga4 && googleAds && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAds}`}
            strategy="afterInteractive"
          />
          <Script id="gads-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${googleAds}');
            `}
          </Script>
        </>
      )}

      {/* Meta Pixel noscript fallback */}
      {metaPixel && (
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${metaPixel}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}

      {/* LINE Tag */}
      {lineTag && (
        <Script id="line-tag-init" strategy="afterInteractive">
          {`
            (function(g,d,o){
              g._ltq=g._ltq||[];g._lt=g._lt||function(){g._ltq.push(arguments)};
              var h=d.getElementsByTagName(o)[0];
              var j=d.createElement(o);j.async=1;
              j.src='https://d.line-scdn.net/n/line_tag/public/release/v1/lt.js';
              h.parentNode.insertBefore(j,h);
            })(window,document,'script');
            _lt('init', {
              customerType: 'lap',
              tagId: '${lineTag}'
            });
            _lt('send', 'pv', ['${lineTag}']);
          `}
        </Script>
      )}
    </>
  );
}

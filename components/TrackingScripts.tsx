import Script from "next/script";

interface TrackingScriptsProps {
  ga4: string;
  googleAds: string;
  metaPixel: string;
  lineTag: string;
}

export default function TrackingScripts({
  ga4,
  googleAds,
  metaPixel,
  lineTag,
}: TrackingScriptsProps) {
  return (
    <>
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
              gtag('js', new Date());
              gtag('config', '${googleAds}');
            `}
          </Script>
        </>
      )}

      {/* Meta Pixel (Facebook) */}
      {metaPixel && (
        <>
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixel}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixel}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
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

'use client'
// ============================================================
//  WordwallEmbed.tsx — إطار عرض موحّد لأنشطة Wordwall المضمَّنة
//  المكان: src/components/WordwallEmbed.tsx
//
//  مكوّن عام: يستقبل رابط تضمين (src) من كود الـ iframe الذي
//  تنسخه من حسابك على Wordwall، ويعرضه بإطار متناسق مع هوية
//  عربيتي بدل نافذة معزولة بلا شكل. لا يحمل أي محتوى ثابت بنفسه.
// ============================================================

const BRAND = { navy: '#0F3D73', gold: '#B08D51', cream: '#F9F6EE', white: '#FFFFFF', soft: '#6b6459' }

export default function WordwallEmbed({
  src,
  title,
  aspectRatio = 380 / 500, // نسبة العرض إلى الارتفاع الافتراضية لأنشطة Wordwall (500×380)
}: {
  src: string
  title: string
  aspectRatio?: number
}) {
  return (
    <div
      dir="rtl"
      style={{
        background: BRAND.white,
        borderRadius: 18,
        overflow: 'hidden',
        border: `1px solid ${BRAND.gold}33`,
        boxShadow: '0 4px 18px rgba(15,61,115,0.08)',
        fontFamily: 'system-ui, Tahoma, Arial, sans-serif',
      }}
    >
      <div
        style={{
          background: BRAND.navy,
          color: BRAND.white,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 18 }}>🎮</span>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
        <span
          style={{
            marginRight: 'auto',
            background: BRAND.gold,
            color: BRAND.white,
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 20,
          }}
        >
          Wordwall
        </span>
      </div>

      <div style={{ position: 'relative', width: '100%', paddingBottom: `${aspectRatio * 100}%` }}>
        <iframe
          src={src}
          title={title}
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
        />
      </div>

      <p style={{ margin: 0, padding: '8px 16px', fontSize: 12, color: BRAND.soft, background: BRAND.cream, textAlign: 'center' }}>
        نشاط تفاعلي من منصة Wordwall — يُلعب هنا مباشرة داخل عربيتي
      </p>
    </div>
  )
}
'use client'
// ============================================================
//  ألعابي التربوية — معرض الألعاب + تشغيلها + مكافأة نقاط
//  المكان: src/app/dashboard/student/games/page.tsx
// ============================================================
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { eduGames, EduGame } from '@/lib/eduGames'
import WordwallEmbed from '@/components/WordwallEmbed'

const BRAND = { navy: '#0F3D73', gold: '#B08D51', cream: '#F9F6EE', white: '#FFFFFF', text: '#1a2b3c', soft: '#6b6459' }

function startOfTodayISO() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export default function EduGamesPage() {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [selected, setSelected] = useState<EduGame | null>(null)
  const [playedToday, setPlayedToday] = useState<Set<string>>(new Set())
  const [awarding, setAwarding] = useState(false)
  const [justAwarded, setJustAwarded] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { window.location.href = '/auth/login'; return }
      setUserId(session.user.id)

      const { data } = await supabase
        .from('points')
        .select('game_id')
        .eq('user_id', session.user.id)
        .gte('created_at', startOfTodayISO())
        .not('game_id', 'is', null)

      const played = new Set<string>()
      ;(data || []).forEach((row: any) => {
        if (row.game_id) played.add(row.game_id)
      })
      setPlayedToday(played)
      setLoading(false)
    }
    load()
  }, [])

  const openGame = (game: EduGame) => {
    setSelected(game)
    setJustAwarded(false)
  }

  const backToGallery = () => {
    setSelected(null)
    setJustAwarded(false)
  }

  const claimReward = async () => {
    if (!selected || playedToday.has(selected.id) || awarding) return
    setAwarding(true)
    // ⚠️ لا نُدخل النقاط مباشرة من المتصفّح — نستدعي دالة آمنة
    // (security definer) تحدّد القيمة الصحيحة من كتالوج الألعاب
    // في القاعدة نفسها، فلا يستطيع أحد التلاعب بالرقم من الطرف الآخر.
    const { data, error } = await supabase.rpc('claim_game_points', { p_game_id: selected.id })
    const result = Array.isArray(data) ? data[0] : data
    if (!error && result && !result.already_claimed) {
      setPlayedToday((prev) => new Set(prev).add(selected.id))
      setJustAwarded(true)
    } else if (!error && result?.already_claimed) {
      setPlayedToday((prev) => new Set(prev).add(selected.id))
    }
    setAwarding(false)
  }

  if (loading) {
    return (
      <div dir="rtl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial' }}>
        <p style={{ fontSize: 18, color: BRAND.soft }}>جارٍ التحميل...</p>
      </div>
    )
  }

  return (
    <main dir="rtl" style={{ minHeight: '100vh', background: BRAND.cream, fontFamily: 'system-ui, Tahoma, Arial, sans-serif' }}>
      <nav style={{ background: BRAND.white, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(15,61,115,0.08)', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <img src="/images/logo-mark.png" alt="عربيتي" style={{ height: 38, objectFit: 'contain' }} />
          <h1 style={{ color: BRAND.navy, fontSize: 20, fontWeight: 800, margin: 0 }}>🎮 ألعابي التربوية</h1>
        </div>
        <a href="/dashboard/student" style={{ background: '#f3f4f6', color: BRAND.soft, padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
          رجوع للوحتي
        </a>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px' }}>
        {!selected ? (
          // ---------- المعرض ----------
          <>
            <p style={{ color: BRAND.soft, textAlign: 'center', marginBottom: 22, fontSize: 14 }}>
              اختر لعبة لتبدأ. إنهاء اللعبة أول مرة كل يوم يمنحك نقاطاً إضافية!
            </p>
            {eduGames.length === 0 ? (
              <div style={{ background: BRAND.white, borderRadius: 16, padding: 40, textAlign: 'center', color: BRAND.soft }}>
                لا توجد ألعاب بعد. سيضيف أستاذك ألعاباً قريباً.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
                {eduGames.map((g) => {
                  const done = playedToday.has(g.id)
                  return (
                    <button
                      key={g.id}
                      onClick={() => openGame(g)}
                      style={{
                        background: BRAND.white,
                        border: `2px solid ${done ? '#2e7d32' : BRAND.gold + '55'}`,
                        borderRadius: 16,
                        padding: '22px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        position: 'relative',
                        boxShadow: '0 3px 12px rgba(15,61,115,0.06)',
                      }}
                    >
                      {done && (
                        <span style={{ position: 'absolute', top: 8, left: 8, background: '#2e7d32', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                          ✓ اليوم
                        </span>
                      )}
                      <span style={{ fontSize: 38 }}>{g.icon}</span>
                      <span style={{ fontWeight: 700, color: BRAND.text, fontSize: 14, textAlign: 'center' }}>{g.title}</span>
                      <span style={{ background: BRAND.cream, color: BRAND.gold, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
                        ⭐ {g.points} نقطة
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          // ---------- تشغيل اللعبة ----------
          <>
            <button
              onClick={backToGallery}
              style={{ background: '#f3f4f6', color: BRAND.soft, border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, marginBottom: 16 }}
            >
              → كل الألعاب
            </button>

            <WordwallEmbed src={selected.embedSrc} title={selected.title} />

            <div style={{ marginTop: 18, background: BRAND.white, borderRadius: 14, padding: 18, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              {playedToday.has(selected.id) ? (
                <p style={{ margin: 0, color: '#2e7d32', fontWeight: 700, fontSize: 14 }}>
                  ✓ حصلتَ على نقاط هذه اللعبة اليوم. عد غداً لتكسب المزيد!
                </p>
              ) : (
                <>
                  <p style={{ margin: '0 0 12px', color: BRAND.soft, fontSize: 13 }}>
                    انتهيتَ من اللعب؟ اضغط الزرّ لتحصل على نقاطك
                  </p>
                  <button
                    onClick={claimReward}
                    disabled={awarding}
                    style={{ background: BRAND.gold, color: 'white', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                  >
                    {awarding ? '...' : `✓ أنهيتُ اللعبة (+${selected.points} نقطة)`}
                  </button>
                </>
              )}
              {justAwarded && (
                <p style={{ marginTop: 10, color: BRAND.gold, fontWeight: 800, fontSize: 16 }}>🎉 +{selected.points} نقطة!</p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
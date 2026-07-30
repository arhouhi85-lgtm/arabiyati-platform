'use client'
// ============================================================
//  بوابة العرض بالمسلاط — نسخة منظَّمة هرمياً
//  المكان: src/app/dev-preview/projector-demo/page.tsx
//  ⚠️ صفحة معزولة تماماً — لا تمسّ أي ملف آخر في المنصة.
//
//  التسلسل: السنة ← الوحدة ← المكوّن ← [اختيار النص إن كانت
//  قراءة] ← عرض الشرائح المتسلسل لذلك الدرس بالذات فقط.
//  يحلّ هذا محلّ نسخة "المبدّل" السابقة المربكة.
// ============================================================
import { useState, useRef, useEffect } from 'react'
import { grammarTexts, GrammarLesson } from '@/lib/grammarTexts'
import { readingTexts, ReadingText } from '@/lib/readingTexts'
import TeacherNav from '@/components/TeacherNav'

const BRAND = { navy: '#0F3D73', gold: '#B08D51', cream: '#F9F6EE', white: '#FFFFFF' }
// نمط دفتر القسم: السؤال بالأخضر، وكل ما عداه بالأسود، بلا أي أزرق
const PROJ = {
  bg: '#F5EFE3',        // بيج فاتح — خلفية شاشة الشرائح
  text: '#1f2937',       // أسود (اختيارات، إجابات، القاعدة، كل شيء عدا السؤال)
  question: '#15803d',   // أخضر — السؤال فقط
  correct: '#16a34a',
  wrong: '#6b7280',
}

const YEAR_NAMES: {[k:string]:string} = { "1":"الأولى","2":"الثانية","3":"الثالثة","4":"الرابعة","5":"الخامسة","6":"السادسة" }
const UNIT_NAMES: {[k:string]:string} = { "1":"الأولى","2":"الثانية","3":"الثالثة","4":"الرابعة","5":"الخامسة","6":"السادسة" }
const YEAR_COLORS: {[k:string]:string} = { "1":"#2563eb","2":"#16a34a","3":"#9333ea","4":"#ea580c","5":"#0891b2","6":"#be185d" }

const COMPONENTS = [
  { id: "1", title: "القراءة", icon: "📖", color: "#2563eb" },
  { id: "2", title: "الصرف", icon: "🔤", color: "#16a34a" },
  { id: "3", title: "التراكيب", icon: "📝", color: "#9333ea" },
  { id: "4", title: "الإملاء", icon: "✏️", color: "#ea580c" },
  { id: "5", title: "التعبير الكتابي", icon: "✍️", color: "#0891b2" },
  { id: "6", title: "التواصل الشفهي", icon: "🗣️", color: "#be185d" },
]

const TYPE_ICON: {[k:string]: string} = { mcq: '☑️', multi: '🔢', match: '🔗', blank: '✏️', open: '💬', order: '🔀' }

type Screen = 'year' | 'unit' | 'component' | 'textPick' | 'slides'

type Slide =
  | { kind: 'intro'; title: string; text: string; images?: { src: string; label: string }[] }
  | { kind: 'rule'; title: string; items: string[] }
  | { kind: 'paragraph'; text: string; audioSrc?: string; isPoem?: boolean }
  | { kind: 'question'; q: any }

function grammarLessonFor(year: string, unit: string, component: string): GrammarLesson | null {
  const list = grammarTexts[`${year}-${unit}`] || []
  return list.find(l => l.component === component) || null
}
function readingListFor(year: string, unit: string): ReadingText[] {
  return readingTexts[`${year}-${unit}`] || []
}
function unitHasAnyContent(year: string, unit: string): boolean {
  const key = `${year}-${unit}`
  return !!(grammarTexts[key]?.length) || !!(readingTexts[key]?.length)
}
function yearHasAnyContent(year: string): boolean {
  for (let u = 1; u <= 6; u++) if (unitHasAnyContent(year, String(u))) return true
  return false
}

function buildGrammarSlides(lesson: GrammarLesson): Slide[] {
  return [
    { kind: 'intro', title: lesson.title, text: lesson.observationText },
    { kind: 'rule', title: 'أستنتج', items: lesson.ruleBox },
    ...lesson.questions.map(q => ({ kind: 'question' as const, q })),
  ]
}
function buildReadingSlides(text: ReadingText): Slide[] {
  return [
    { kind: 'intro', title: text.title, text: text.subtitle, images: text.images },
    ...text.paragraphs.map((p: any) => ({ kind: 'paragraph' as const, text: p.text, audioSrc: text.audio?.src, isPoem: p.isPoem })),
    ...text.questions.map((q: any) => ({ kind: 'question' as const, q })),
  ]
}

export default function ProjectorGatewayPage() {
  const [screen, setScreen] = useState<Screen>('year')
  const [year, setYear] = useState('')
  const [unit, setUnit] = useState('')
  const [component, setComponent] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [slides, setSlides] = useState<Slide[]>([])

  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [mcqPicked, setMcqPicked] = useState<string | null>(null)
  const [blankValue, setBlankValue] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [a11y, setA11y] = useState({ bigText: false, readAloud: false })
  const containerRef = useRef<HTMLDivElement>(null)
  const clapAudioRef = useRef<HTMLAudioElement>(null)
  const playClap = () => {
    if (!clapAudioRef.current) return
    clapAudioRef.current.currentTime = 0
    clapAudioRef.current.play().catch(() => {})
  }

  const resetSlideState = () => { setRevealed(false); setMcqPicked(null); setBlankValue('') }

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) await containerRef.current?.requestFullscreen?.()
    else await document.exitFullscreen?.()
  }

  const exitToGateway = async () => {
    if (document.fullscreenElement) await document.exitFullscreen?.()
    setScreen('component')
    setIdx(0); resetSlideState()
  }

  const goNext = () => { if (idx < slides.length - 1) { setIdx(idx + 1); resetSlideState() } }
  const goPrev = () => { if (idx > 0) { setIdx(idx - 1); resetSlideState() } }

  useEffect(() => {
    if (screen !== 'slides') return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goNext()
      else if (e.key === 'ArrowRight') goPrev()
      else if (e.key === 'Escape') exitToGateway()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idx, slides.length, screen])

  useEffect(() => {
    if (screen !== 'slides' || !a11y.readAloud) return
    const slide = slides[idx]
    if (!slide) return
    let text = ''
    if (slide.kind === 'intro') text = `${slide.title}. ${slide.text}`
    else if (slide.kind === 'rule') text = `${slide.title}: ${slide.items.join('. ')}`
    else if (slide.kind === 'paragraph') text = slide.text
    else if (slide.kind === 'question') text = slide.q.question
    if (!text) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ar'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  }, [idx, a11y.readAloud, screen])

  const answerText = (q: any): string => {
    if (q.type === 'mcq') return q.correct
    if (q.type === 'blank') return q.correct
    if (q.type === 'multi') return (q.correct as string[]).join('، ')
    if (q.type === 'order') return (q.correct as string[]).join(' ')
    if (q.type === 'open') return q.sample
    return ''
  }

  const chooseYear = (y: string) => { setYear(y); setUnit(''); setScreen('unit') }
  const chooseUnit = (u: string) => { setUnit(u); setComponent(''); setScreen('component') }

  const chooseComponent = (c: string) => {
    setComponent(c)
    if (c === '1') {
      const list = readingListFor(year, unit)
      if (list.length === 0) return
      setScreen('textPick')
      return
    }
    const lesson = grammarLessonFor(year, unit, c)
    if (!lesson) return
    setLessonTitle(lesson.title)
    setSlides(buildGrammarSlides(lesson))
    setIdx(0); resetSlideState()
    setScreen('slides')
  }

  const chooseReadingText = (t: ReadingText) => {
    setLessonTitle(t.title)
    setSlides(buildReadingSlides(t))
    setIdx(0); resetSlideState()
    setScreen('slides')
  }

  const bigMul = a11y.bigText ? 1.25 : 1
  const slide = slides[idx]

  if (screen !== 'slides') {
    return (
      <>
      <TeacherNav active="projector" />
      <main dir="rtl" style={{ minHeight: '100vh', background: BRAND.cream, fontFamily: 'system-ui, Tahoma, Arial, sans-serif', padding: '32px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{ color: BRAND.navy, fontSize: 24, fontWeight: 800, margin: 0 }}>🖥️ بوابة العرض بالمسلاط</h1>
            <p style={{ color: '#6b7280', fontSize: 14, marginTop: 8 }}>
              {screen === 'year' && 'اختر السنة الدراسية'}
              {screen === 'unit' && `السنة ${YEAR_NAMES[year]} — اختر الوحدة`}
              {screen === 'component' && `السنة ${YEAR_NAMES[year]} — الوحدة ${UNIT_NAMES[unit]} — اختر المكوّن`}
              {screen === 'textPick' && `القراءة — اختر النص`}
            </p>
          </div>

          {screen !== 'year' && (
            <button
              onClick={() => {
                if (screen === 'unit') setScreen('year')
                else if (screen === 'component') setScreen('unit')
                else if (screen === 'textPick') setScreen('component')
              }}
              style={{ background: '#f3f4f6', color: '#6b7280', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13, marginBottom: 20 }}>
              → رجوع
            </button>
          )}

          {screen === 'year' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16 }}>
              {["1","2","3","4","5","6"].map(y => {
                const has = yearHasAnyContent(y)
                return (
                  <button key={y} onClick={() => has && chooseYear(y)} disabled={!has}
                    style={{
                      background: BRAND.white, border: `2px solid ${has ? YEAR_COLORS[y] : '#e5e7eb'}`, borderRadius: 14,
                      padding: '24px 12px', cursor: has ? 'pointer' : 'default', textAlign: 'center', opacity: has ? 1 : 0.5,
                    }}>
                    <div style={{ fontSize: 30, marginBottom: 8 }}>🏫</div>
                    <div style={{ fontWeight: 700, color: has ? YEAR_COLORS[y] : '#9ca3af', fontSize: 15 }}>السنة {YEAR_NAMES[y]}</div>
                    {!has && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>🚧 قيد التطوير</div>}
                  </button>
                )
              })}
            </div>
          )}

          {screen === 'unit' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16 }}>
              {["1","2","3","4","5","6"].map(u => {
                const has = unitHasAnyContent(year, u)
                return (
                  <button key={u} onClick={() => has && chooseUnit(u)} disabled={!has}
                    style={{
                      background: BRAND.white, border: `2px solid ${has ? BRAND.gold : '#e5e7eb'}`, borderRadius: 14,
                      padding: '24px 12px', cursor: has ? 'pointer' : 'default', textAlign: 'center', opacity: has ? 1 : 0.5,
                    }}>
                    <div style={{ fontSize: 30, marginBottom: 8 }}>📗</div>
                    <div style={{ fontWeight: 700, color: has ? BRAND.gold : '#9ca3af', fontSize: 15 }}>الوحدة {UNIT_NAMES[u]}</div>
                    {!has && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>🚧 قيد التطوير</div>}
                  </button>
                )
              })}
            </div>
          )}

          {screen === 'component' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
              {COMPONENTS.map(c => {
                const has = c.id === '1' ? readingListFor(year, unit).length > 0 : !!grammarLessonFor(year, unit, c.id)
                return (
                  <button key={c.id} onClick={() => has && chooseComponent(c.id)} disabled={!has}
                    style={{
                      background: BRAND.white, border: `2px solid ${has ? c.color : '#e5e7eb'}`, borderRadius: 14,
                      padding: '24px 12px', cursor: has ? 'pointer' : 'default', textAlign: 'center', opacity: has ? 1 : 0.5,
                    }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>{c.icon}</div>
                    <div style={{ fontWeight: 700, color: has ? c.color : '#9ca3af', fontSize: 15 }}>{c.title}</div>
                    {!has && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>🚧 قيد التطوير</div>}
                  </button>
                )
              })}
            </div>
          )}

          {screen === 'textPick' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
              {readingListFor(year, unit).map(t => (
                <button key={t.id} onClick={() => chooseReadingText(t)}
                  style={{ background: BRAND.white, border: `2px solid #2563eb`, borderRadius: 14, padding: '20px 14px', cursor: 'pointer', textAlign: 'center' }}>
                  {t.images?.[0] && <img src={t.images[0].src} alt={t.title} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />}
                  <div style={{ fontWeight: 700, color: '#1e3a8a', fontSize: 15 }}>{t.title}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      </>
    )
  }

  return (
    <div ref={containerRef} style={{ background: PROJ.bg, height: '100vh', overflowY: 'auto' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;700&display=swap');
        .projector-arabic { font-family: 'Noto Naskh Arabic', 'Segoe UI', Tahoma, sans-serif; }
      `}</style>
      <audio ref={clapAudioRef} src="/audio/TASSFIK.mp3" preload="auto" />

      <main dir="rtl" className="projector-arabic" style={{ minHeight: '100%', background: PROJ.bg, color: PROJ.text, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${BRAND.gold}55`, position: 'sticky', top: 0, background: BRAND.white, zIndex: 20, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={exitToGateway} title="الخروج والعودة لاختيار درس آخر"
              style={{ background: 'transparent', border: '2px solid #1f293755', color: PROJ.text, borderRadius: '50%', width: 38, height: 38, fontSize: 18, cursor: 'pointer' }}>
              ✕
            </button>
            <span style={{ fontSize: 18, fontWeight: 700, color: BRAND.gold }}>🖥️ {lessonTitle}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => setA11y(s => ({ ...s, bigText: !s.bigText }))}
              style={{ background: a11y.bigText ? BRAND.gold : 'transparent', color: a11y.bigText ? BRAND.navy : PROJ.text, border: `2px solid ${BRAND.gold}`, borderRadius: 10, padding: '7px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              🔍 قراءة مريحة
            </button>
            <button onClick={() => setA11y(s => ({ ...s, readAloud: !s.readAloud }))}
              style={{ background: a11y.readAloud ? BRAND.gold : 'transparent', color: a11y.readAloud ? BRAND.navy : PROJ.text, border: `2px solid ${BRAND.gold}`, borderRadius: 10, padding: '7px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              🔊 استمع
            </button>
            <button onClick={toggleFullscreen}
              style={{ background: 'transparent', border: `2px solid ${BRAND.gold}`, color: PROJ.text, borderRadius: 10, padding: '8px 16px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              {isFullscreen ? '🡼 إنهاء الشاشة الكاملة' : '⛶ شاشة كاملة'}
            </button>
            <span dir="ltr" style={{ fontSize: 16, opacity: 0.8 }}>{idx + 1} / {slides.length}</span>
          </div>
        </div>

        <button onClick={goPrev} disabled={idx === 0}
          style={{ position: 'fixed', top: '50%', left: 18, transform: 'translateY(-50%)', zIndex: 30, background: 'rgba(15,61,115,0.85)', border: `2px solid ${BRAND.gold}`, color: idx === 0 ? '#ffffff40' : BRAND.white, borderRadius: '50%', width: 56, height: 56, fontSize: 28, cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.4 : 1, boxShadow: '0 4px 14px rgba(0,0,0,0.4)' }}>‹</button>
        <button onClick={goNext} disabled={idx === slides.length - 1}
          style={{ position: 'fixed', top: '50%', right: 18, transform: 'translateY(-50%)', zIndex: 30, background: BRAND.gold, border: 'none', color: BRAND.navy, borderRadius: '50%', width: 56, height: 56, fontSize: 28, cursor: idx === slides.length - 1 ? 'default' : 'pointer', opacity: idx === slides.length - 1 ? 0.4 : 1, boxShadow: '0 4px 14px rgba(0,0,0,0.4)' }}>›</button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 100px' }}>
          <div style={{ maxWidth: 980, width: '100%', textAlign: 'center' }}>

            {slide?.kind === 'intro' && (
              <>
                {slide.images && slide.images.length > 0 ? (
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
                    {slide.images.map((img, i) => (<img key={i} src={img.src} alt={img.label} style={{ height: 160, borderRadius: 12, objectFit: 'cover' }} />))}
                  </div>
                ) : (<div style={{ fontSize: 64, marginBottom: 14 }}>📖</div>)}
                <h1 style={{ fontSize: 34 * bigMul, fontWeight: 800, color: BRAND.gold, marginBottom: 28 }}>{slide.title}</h1>
                <p style={{ fontSize: 32 * bigMul, lineHeight: 2, textAlign: 'justify' }}>{slide.text}</p>
              </>
            )}

            {slide?.kind === 'rule' && (
              <>
                <div style={{ fontSize: 64, marginBottom: 14 }}>📌</div>
                <h1 style={{ fontSize: 34 * bigMul, fontWeight: 800, color: BRAND.gold, marginBottom: 28 }}>{slide.title}</h1>
                <div style={{ textAlign: 'right', display: 'inline-block' }}>
                  {slide.items.map((r, i) => (<p key={i} style={{ fontSize: 32 * bigMul, lineHeight: 2.1, marginBottom: 14 }}>- {r}</p>))}
                </div>
              </>
            )}

            {slide?.kind === 'paragraph' && (
              <>
                <div style={{ fontSize: 50, marginBottom: 14 }}>{slide.isPoem ? '🎵' : '📄'}</div>
                <p style={{ fontSize: (slide.isPoem ? 34 : 32) * bigMul, lineHeight: 2.2, textAlign: slide.isPoem ? 'center' : 'justify', fontStyle: slide.isPoem ? 'italic' : 'normal', fontWeight: slide.isPoem ? 700 : 400 }}>
                  {slide.text}
                </p>
                {slide.audioSrc && <audio controls src={slide.audioSrc} style={{ marginTop: 24 }} />}
              </>
            )}

            {slide?.kind === 'question' && (
              <>
                <div style={{ fontSize: 60, marginBottom: 8 }}>{TYPE_ICON[slide.q.type] || '❓'}</div>
                <span style={{ background: BRAND.gold, color: BRAND.navy, padding: '5px 16px', borderRadius: 20, fontSize: 16, fontWeight: 700 }}>{slide.q.section}</span>
                <p style={{ fontSize: 32 * bigMul, fontWeight: 700, lineHeight: 1.9, margin: '26px 0 26px', color: PROJ.question }}>{slide.q.question}</p>

                {slide.q.type === 'mcq' && (
                  <div style={{ display: 'grid', gap: 14, maxWidth: 640, margin: '0 auto' }}>
                    {slide.q.options.map((opt: string) => {
                      const isPicked = mcqPicked === opt
                      const isCorrect = opt === slide.q.correct
                      return (
                        <button key={opt} onClick={() => { setMcqPicked(opt); if (opt === slide.q.correct) playClap() }}
                          style={{ padding: '16px 20px', borderRadius: 12, fontSize: 32 * bigMul, fontWeight: 700, cursor: 'pointer',
                            border: `2px solid ${mcqPicked ? (isCorrect ? '#22c55e' : isPicked ? '#94a3b8' : '#1f293733') : '#1f293755'}`,
                            background: mcqPicked ? (isCorrect ? '#16a34a20' : isPicked ? '#6b728020' : BRAND.white) : BRAND.white, color: PROJ.text }}>
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                )}

                {slide.q.type === 'blank' && (
                  <div style={{ maxWidth: 480, margin: '0 auto' }}>
                    <input value={blankValue} onChange={e => {
                        const v = e.target.value
                        const wasCorrect = blankValue.trim() === slide.q.correct || slide.q.correct.includes(blankValue.trim())
                        const nowCorrect = v.trim() === slide.q.correct || slide.q.correct.includes(v.trim())
                        if (nowCorrect && !wasCorrect) playClap()
                        setBlankValue(v)
                      }} placeholder="اكتب الإجابة..."
                      style={{ width: '100%', padding: 16, borderRadius: 12, border: `2px solid ${BRAND.gold}`, fontSize: 32 * bigMul, textAlign: 'center', background: BRAND.white, color: PROJ.text, outline: 'none' }} />
                    {blankValue.trim() && (
                      <p style={{ marginTop: 14, fontSize: 22, color: blankValue.trim() === slide.q.correct || slide.q.correct.includes(blankValue.trim()) ? '#16a34a' : '#6b7280' }}>
                        {blankValue.trim() === slide.q.correct || slide.q.correct.includes(blankValue.trim()) ? '✓ صحيح' : 'حاول مرة أخرى'}
                      </p>
                    )}
                  </div>
                )}

                {slide.q.type === 'match' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 720, margin: '0 auto' }}>
                    {slide.q.pairs.map((p: any, i: number) => (
                      <span key={i} style={{ background: BRAND.white, border: `2px solid ${BRAND.gold}`, borderRadius: 12, padding: '10px 20px', fontSize: 32 * bigMul, fontWeight: 700, color: PROJ.text }}>{p.item}</span>
                    ))}
                  </div>
                )}

                {slide.q.type === 'multi' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 720, margin: '0 auto' }}>
                    {slide.q.options.map((opt: string, i: number) => (
                      <span key={i} style={{ background: BRAND.white, border: `2px solid ${BRAND.gold}`, borderRadius: 12, padding: '12px 16px', fontSize: 32 * bigMul, fontWeight: 700, color: PROJ.text }}>{opt}</span>
                    ))}
                  </div>
                )}

                {slide.q.type === 'order' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {slide.q.words.map((w: string, i: number) => (
                      <span key={i} style={{ background: BRAND.white, border: `2px solid ${BRAND.gold}`, borderRadius: 12, padding: '10px 20px', fontSize: 32 * bigMul, fontWeight: 700, color: PROJ.text }}>{w}</span>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 26 }}>
                  {!revealed ? (
                    <button onClick={() => setRevealed(true)}
                      style={{ background: BRAND.gold, color: BRAND.navy, border: 'none', padding: '14px 36px', borderRadius: 12, fontSize: 22, fontWeight: 700, cursor: 'pointer' }}>
                      🔍 إظهار الجواب
                    </button>
                  ) : slide.q.type === 'match' ? (
                    <div style={{ display: 'grid', gap: 12, maxWidth: 640, margin: '0 auto' }}>
                      {slide.q.pairs.map((p: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                          <span style={{ background: '#16653420', border: '2px solid #22c55e', borderRadius: 10, padding: '10px 18px', fontSize: 28, fontWeight: 700, flex: 1, textAlign: 'center', color: PROJ.text }}>{p.item}</span>
                          <span style={{ color: BRAND.gold, fontSize: 26 }}>⇦</span>
                          <span style={{ background: BRAND.white, border: `2px solid ${BRAND.gold}`, borderRadius: 10, padding: '10px 18px', fontSize: 26, flex: 1, textAlign: 'center', color: PROJ.text }}>{p.answer}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 28, background: BRAND.white, border: `1px solid ${BRAND.gold}55`, borderRadius: 12, padding: 20, textAlign: 'right', whiteSpace: 'pre-line', color: PROJ.text }}>{answerText(slide.q)}</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: '18px 0 26px', display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', maxWidth: '80%', margin: '0 auto' }}>
          {slides.map((_, i) => (<span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === idx ? BRAND.gold : '#ffffff40' }} />))}
        </div>
      </main>
    </div>
  )
}
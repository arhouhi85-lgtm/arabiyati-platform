'use client'
// ============================================================
//  منشئ الجذاذات — عربيتي
//  المكان: src/app/dashboard/teacher/jadhada/page.tsx
//
//  السنة ← الوحدة ← المكوّن ← الدرس (جاهز أو مُدخَل يدوياً) ←
//  الحصة ← معاينة قابلة للتعديل ← طباعة أو تحميل Word.
//  المحتوى الحقيقي (ملاحظة/قاعدة/تمارين/نص) يُحقَن في مراحل
//  الجذاذة تلقائياً، للدروس الجاهزة والمُدخَلة يدوياً معاً.
// ============================================================
import { useState, useEffect } from 'react'
import { readingTexts, ReadingText } from '@/lib/readingTexts'
import { grammarTexts, GrammarLesson } from '@/lib/grammarTexts'
import { oralListFor, writingListFor, applicationListFor } from '@/lib/otherComponents'
import {
  COMPONENTS, componentMeta, ComponentKey, SessionTemplate,
  detectReadingKind, readingSessions,
  PROJECT_SESSIONS,
  absoluteWeek, weeksForSession,
  enrichPhenomenonSessions, enrichOralSessions, enrichWritingSessions, enrichApplicationSessions,
  enrichReadingSessions, ReadingKind,
} from '@/lib/jadhadaTemplates'
import {
  getCustomLessons, saveCustomLesson, newLessonId,
  CustomComponentKey, CustomPhenomenon, CustomOral, CustomWriting, CustomApplication, CustomReading,
} from '@/lib/customLessons'
import TeacherNav from '@/components/TeacherNav'
import { useTeacherGuard } from '@/lib/useTeacherGuard'

const UI = { navy: '#0F3D73', gold: '#B08D51', cream: '#F9F6EE' }
const YEARS: {[k:string]:string} = { "1":"الأولى","2":"الثانية","3":"الثالثة","4":"الرابعة","5":"الخامسة","6":"السادسة" }
const UNITS = YEARS
const SEASON = '2026 / 2027'

type Screen = 'year' | 'unit' | 'component' | 'lesson' | 'entry' | 'build'
type Lesson = { id: string; title: string; domain: string; custom: boolean; extra?: any }

const PHEN_COMPS: ComponentKey[] = ['sarf', 'tarakib', 'imla']
const CUSTOM_CAPABLE: ComponentKey[] = ['reading', 'sarf', 'tarakib', 'imla', 'oral', 'writing', 'applications']

export default function JadhadaPage() {
  const { loading: guardLoading } = useTeacherGuard()

  const [screen, setScreen] = useState<Screen>('year')
  const [year, setYear] = useState('')
  const [unit, setUnit] = useState('')
  const [comp, setComp] = useState<ComponentKey>('reading')
  const [lessonIdx, setLessonIdx] = useState(0)
  const [sessionNo, setSessionNo] = useState(1)
  const [refreshTick, setRefreshTick] = useState(0) // يُجبر إعادة قراءة الدروس المُدخَلة يدوياً

  const [teacherName, setTeacherName] = useState('')
  const [jadhadaNo, setJadhadaNo] = useState(1)
  const [bookPage, setBookPage] = useState('')
  const [domainOverride, setDomainOverride] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    try { const s = localStorage.getItem('arabiyati_teacher_name'); if (s) setTeacherName(s) } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem('arabiyati_teacher_name', teacherName) } catch {}
  }, [teacherName])

  // ---------- جمع دروس كل مكوّن (جاهزة + مُدخَلة يدوياً) ----------
  const lessonsFor = (c: ComponentKey, y: string, u: string): Lesson[] => {
    if (!y || !u) return []
    const key = `${y}-${u}`
    const built: Lesson[] = (() => {
      if (c === 'reading') {
        return (readingTexts[key] || []).map((t: ReadingText) => ({
          id: t.id, title: t.title, domain: (t.subtitle || '').split('—')[0]?.trim() || '', custom: false, extra: t,
        }))
      }
      if (PHEN_COMPS.includes(c)) {
        const codeMap: {[k:string]:string} = { sarf: '2', tarakib: '3', imla: '4' }
        return (grammarTexts[key] || [])
          .filter((l: GrammarLesson) => l.component === codeMap[c])
          .map((l: GrammarLesson) => ({ id: l.id, title: l.title, domain: l.domain, custom: false, extra: l }))
      }
      if (c === 'oral') {
        return oralListFor(y, u).map(t => ({ id: t.id, title: t.title, domain: 'مجال الحضارة المغربية', custom: false, extra: t }))
      }
      if (c === 'writing') {
        return writingListFor(y, u).map(s => ({ id: s.id, title: s.title, domain: 'مجال الحضارة المغربية', custom: false, extra: s }))
      }
      if (c === 'applications') {
        const g = grammarTexts[key] || []
        const trio = g.filter(l => ['2','3','4'].includes(l.component)).map(l => l.title)
        return applicationListFor(y, u).map(t => ({
          id: t.id, title: trio.join(' ـ ') || 'التطبيقات الكتابية', domain: 'مجال الحضارة المغربية', custom: false, extra: t,
        }))
      }
      if (c === 'project') return [{ id: 'project', title: 'مشروع الوحدة', domain: 'مجال الحضارة المغربية', custom: false }]
      return []
    })()

    const custom: Lesson[] = CUSTOM_CAPABLE.includes(c)
      ? getCustomLessons<any>(c as CustomComponentKey, y, u).map(l => ({
          id: l.id, title: l.title, domain: l.domain || 'مجال الحضارة المغربية', custom: true, extra: l,
        }))
      : []

    return [...built, ...custom]
  }

  const compHas = (c: ComponentKey, y: string, u: string) => lessonsFor(c, y, u).length > 0
  const unitHas = (y: string, u: string) => COMPONENTS.some(c => compHas(c.key, y, u))
  const yearHas = (y: string) => [1,2,3,4,5,6].some(u => unitHas(y, String(u)))

  const lessons = lessonsFor(comp, year, unit)
  const lesson = lessons[lessonIdx]

  useEffect(() => {
    setDomainOverride(lesson?.domain || '')
  }, [lesson?.id, comp])
  const meta = componentMeta(comp)

  // ---------- بناء حصص الدرس المختار (بمحتواه الحقيقي مزروعاً) ----------
  const sessions: SessionTemplate[] = (() => {
    if (!lesson) return []
    if (comp === 'reading') {
      if (!lesson.extra) return []
      if (lesson.custom) {
        const c = lesson.extra as CustomReading
        return enrichReadingSessions(c.kind, c.paragraphs)
      }
      return readingSessions(detectReadingKind(lesson.extra.subtitle || ''))
    }
    if (PHEN_COMPS.includes(comp)) {
      const l = lesson.extra
      if (!l) return []
      const content = lesson.custom
        ? { observation: l.observation, rule: l.rule, exercises: l.exercises || [] }
        : {
            observation: l.observationText,
            rule: (l.ruleBox || []).join(' '),
            exercises: (l.questions || []).filter((q: any) => q.section === 'أطبّق').map((q: any) => q.question).slice(0, 3),
          }
      return enrichPhenomenonSessions(content)
    }
    if (comp === 'oral') {
      const paragraphs = lesson.custom ? (lesson.extra?.paragraphs || []) : (lesson.extra?.paragraphs || [])
      return enrichOralSessions(paragraphs)
    }
    if (comp === 'writing') {
      const l = lesson.extra
      return l ? enrichWritingSessions(unit, {
        subjectText: l.subjectText, helperLexicon: l.helperLexicon, connectors: l.connectors,
      }) : []
    }
    if (comp === 'applications') {
      const l = lesson.extra
      return l ? enrichApplicationSessions({
        text: l.text, shakl: l.shakl, exercisesWeek1: l.exercisesWeek1, exercisesWeek2: l.exercisesWeek2,
      }) : []
    }
    if (comp === 'project') return PROJECT_SESSIONS
    return []
  })()

  const session = sessions.find(s => s.session === sessionNo) || sessions[0]
  const weekInUnit = lesson ? weeksForSession(comp, unit, lessonIdx, sessionNo) : 1
  const compLabel = meta.family ? `${meta.family} — ${meta.title}` : meta.title

  const meansText = () => {
    if (!bookPage) return meta.means
    return meta.means
      .replace('كتاب المتعلم(ة)', `كتاب المتعلم(ة) ص: ${bookPage}`)
      .replace('الكتاب المدرسي (المفيد في اللغة العربية)', `الكتاب المدرسي (المفيد في اللغة العربية) ص: ${bookPage}`)
  }

  const objectivesHtml = () => {
    if (!session) return ''
    const items = session.objectives.map(o => `- ${o}`).join('<br/>')
    return meta.objectivesStyle === 'able' ? `<b>يكون المتعلم(ة) قادرا على:</b><br/>${items}` : items
  }

  // ============================================================
  //  بناء HTML الجذاذة
  // ============================================================
  const B = '1px solid #000'
  const td = (content: string, style = '', attrs = '') => `<td style="border:${B};padding:5px 8px;vertical-align:top;${style}" ${attrs}>${content}</td>`
  const lb = (content: string, style = '', attrs = '') => `<td style="border:${B};padding:5px 8px;text-align:center;font-weight:bold;vertical-align:middle;${style}" ${attrs}>${content}</td>`

  const buildHtml = () => {
    if (!lesson || !session) return '<p style="text-align:center;padding:30px">لا يوجد محتوى لهذا الاختيار</p>'
    const head = `
      <tr>${lb('المملكة المغربية<br/>وزارة التربية الوطنية','width:25%')}${lb('<span style="font-size:18pt">جُذاذَة</span>','width:50%','colspan="2"')}${lb(`الموسم الدراسي<br/>${SEASON}`,'width:25%')}</tr>
      <tr>${lb('المادة','width:25%')}${td('اللغة العربية','width:25%;text-align:center')}${lb('المستوى','width:25%')}${td(`${YEARS[year]} ابتدائي`,'width:25%;text-align:center')}</tr>
      <tr>${lb('المكون')}${td(compLabel,'text-align:center')}${lb('الأستاذ(ة)')}${td(teacherName || '............................','text-align:center')}</tr>
      <tr>${lb('المجال')}${td(domainOverride || '............','text-align:center')}${lb('العنوان')}${td(lesson.title,'text-align:center')}</tr>
      <tr>${lb('الوحدة')}${td(UNITS[unit] || '','text-align:center')}${lb('الأسبوع')}${td(String(absoluteWeek(unit, weekInUnit)),'text-align:center')}</tr>
      <tr>${lb('الحصة')}${td(`${session.session} — ${session.label}`,'text-align:center')}${lb('المدة')}${td(`${session.duration} دقيقة`,'text-align:center')}</tr>
      <tr>${lb('رقم الجذاذة')}${td(String(jadhadaNo),'text-align:center')}${lb('عدد الحصص')}${td(String(sessions.length),'text-align:center')}</tr>
    `
    const boxes = `
      <tr>${lb('الأهداف','width:25%')}${td(objectivesHtml(),'width:75%;line-height:1.9','colspan="3"')}</tr>
      <tr>${lb('الوسائل')}${td(meansText(),'line-height:1.9','colspan="3"')}</tr>
      ${meta.workModesLabel ? `<tr>${lb(meta.workModesLabel)}${td(meta.workModes || '','line-height:1.9','colspan="3"')}</tr>` : ''}
    `
    const stagesHead = `<tr>${lb('المراحل','width:14%')}${lb('أنشطة الأستاذ(ة)','width:35%')}${lb('أنشطة المتعلم(ة)','width:35%')}${lb('الوسائل','width:16%')}</tr>`
    const stageRows = session.stages.map(s => `<tr>
      ${lb(s.stage)}
      ${td(s.teacher.map(t => `- ${t}`).join('<br/>'), 'line-height:1.7')}
      ${td(s.learner.map(t => `- ${t}`).join('<br/>'), 'line-height:1.7')}
      ${td(s.means || 'الكتاب المدرسي — السبورة', 'text-align:center;vertical-align:middle')}
    </tr>`).join('')
    const tbl = (rows: string, mt = 12) => `<table dir="rtl" style="width:100%;border-collapse:collapse;font-family:Arial;font-size:10.5pt;margin-top:${mt}px">${rows}</table>`
    return `${tbl(head,0)}${tbl(boxes)}${tbl(stagesHead+stageRows)}${tbl(`<tr>${lb('ملاحظات','width:25%')}${td(notes?notes.replace(/\n/g,'<br/>'):'<br/><br/>','width:75%')}</tr>`)}`
  }

  const downloadWord = () => {
    const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>جذاذة</title>
      <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
      <style>@page{size:A4;margin:1.2cm}body{font-family:Arial}</style></head><body dir="rtl">${buildHtml()}</body></html>`
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `جذاذة-${meta.title}-${lesson?.title || ''}-ح${sessionNo}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (guardLoading) {
    return (<><TeacherNav active="jadhada" />
      <div dir="rtl" style={{minHeight:'60vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Arial'}}>
        <p style={{fontSize:20,color:'#6b7280'}}>جارٍ التحميل...</p></div></>)
  }

  // ============================================================
  //  شاشة إدخال درس جديد
  // ============================================================
  if (screen === 'entry') {
    return (
      <EntryForm
        comp={comp as CustomComponentKey}
        year={year} unit={unit}
        onCancel={() => setScreen('lesson')}
        onSaved={() => { setRefreshTick(t => t + 1); setScreen('lesson') }}
      />
    )
  }

  // ============================================================
  //  شاشات الاختيار
  // ============================================================
  if (screen !== 'build') {
    const Card = ({ onClick, has, icon, label, sub }: any) => (
      <button onClick={() => has && onClick()} disabled={!has}
        style={{background:'#fff',border:`2px solid ${has?UI.gold:'#e5e7eb'}`,borderRadius:14,padding:'22px 12px',cursor:has?'pointer':'default',textAlign:'center',opacity:has?1:0.5,width:'100%'}}>
        <div style={{fontSize:32,marginBottom:8}}>{icon}</div>
        <div style={{fontWeight:700,color:has?UI.navy:'#9ca3af',fontSize:15}}>{label}</div>
        {sub && has && <div style={{fontSize:11,color:'#6b7280',marginTop:6}}>{sub}</div>}
        {!has && <div style={{fontSize:11,color:'#9ca3af',marginTop:6}}>🚧 بانتظار المحتوى</div>}
      </button>
    )

    return (
      <>
        <TeacherNav active="jadhada" />
        <main dir="rtl" style={{minHeight:'100vh',background:UI.cream,fontFamily:'system-ui,Tahoma,Arial',padding:'30px 20px'}}>
          <div style={{maxWidth:920,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:24}}>
              <h1 style={{color:UI.navy,fontSize:24,fontWeight:800,margin:0}}>📄 منشئ الجذاذات</h1>
              <p style={{color:'#6b7280',fontSize:14,marginTop:8}}>
                {screen==='year' && 'اختر السنة الدراسية'}
                {screen==='unit' && `السنة ${YEARS[year]} — اختر الوحدة`}
                {screen==='component' && `الوحدة ${UNITS[unit]} — اختر المكوّن`}
                {screen==='lesson' && `${meta.title} — اختر الدرس`}
              </p>
            </div>

            {screen!=='year' && (
              <button onClick={() => setScreen(screen==='unit'?'year':screen==='component'?'unit':'component')}
                style={{background:'#f3f4f6',color:'#6b7280',border:'none',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:13,marginBottom:18}}>
                → رجوع
              </button>
            )}

            {screen==='year' && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:14}}>
                {["1","2","3","4","5","6"].map(y => <Card key={y} has={true} icon="🏫" label={`السنة ${YEARS[y]}`} onClick={() => { setYear(y); setScreen('unit') }}/>)}
              </div>
            )}

            {screen==='unit' && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:14}}>
                {["1","2","3","4","5","6"].map(u => <Card key={u} has={true} icon="📗" label={`الوحدة ${UNITS[u]}`} onClick={() => { setUnit(u); setScreen('component') }}/>)}
              </div>
            )}

            {screen==='component' && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:14}}>
                {COMPONENTS.map(c => {
                  const n = lessonsFor(c.key, year, unit).length
                  return <Card key={c.key} has={n>0 || CUSTOM_CAPABLE.includes(c.key)} icon={c.icon} label={c.title}
                    sub={n>0 ? (n>1?`${n} دروس`:'درس واحد') : (CUSTOM_CAPABLE.includes(c.key) ? 'أدخل درساً' : undefined)}
                    onClick={() => {
                      setComp(c.key); setLessonIdx(0); setSessionNo(1)
                      const l = lessonsFor(c.key, year, unit)
                      setScreen(l.length === 1 ? 'build' : l.length > 1 ? 'lesson' : (CUSTOM_CAPABLE.includes(c.key) ? 'entry' : 'component'))
                    }}/>
                })}
              </div>
            )}

            {screen==='lesson' && (
              <>
                {CUSTOM_CAPABLE.includes(comp) && (
                  <button onClick={() => setScreen('entry')}
                    style={{background:UI.navy,color:'#fff',border:'none',padding:'12px 22px',borderRadius:10,fontWeight:700,fontSize:14,cursor:'pointer',marginBottom:18}}>
                    ➕ أدخل درساً جديداً
                  </button>
                )}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14}}>
                  {lessons.map((l, i) => (
                    <button key={l.id} onClick={() => { setLessonIdx(i); setSessionNo(1); setScreen('build') }}
                      style={{background:'#fff',border:`2px solid ${l.custom?'#16a34a':UI.gold}`,borderRadius:14,padding:'20px 14px',cursor:'pointer',textAlign:'center',position:'relative'}}>
                      {l.custom && <span style={{position:'absolute',top:8,left:8,background:'#16a34a',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20}}>مُدخَل يدوياً</span>}
                      <div style={{fontWeight:700,color:UI.navy,fontSize:15}}>{l.title}</div>
                      <div style={{fontSize:11,color:'#6b7280',marginTop:6}}>الدرس {i+1}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </>
    )
  }

  // ============================================================
  //  شاشة البناء والمعاينة
  // ============================================================
  return (
    <>
      <div className="no-print"><TeacherNav active="jadhada" /></div>
      <style>{`@media print{.no-print{display:none!important}body{background:#fff}}`}</style>
      <main dir="rtl" style={{minHeight:'100vh',background:UI.cream,fontFamily:'system-ui,Tahoma,Arial',padding:'22px 20px 60px'}}>
        <div style={{maxWidth:1040,margin:'0 auto'}}>
          <div className="no-print" style={{background:'#fff',borderRadius:14,padding:18,marginBottom:18,boxShadow:'0 2px 10px rgba(0,0,0,.06)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:10}}>
              <h2 style={{color:UI.navy,fontSize:17,fontWeight:800,margin:0}}>{meta.icon} {compLabel} — {lesson?.title}</h2>
              <button onClick={() => setScreen(lessons.length > 0 ? 'lesson' : 'component')}
                style={{background:'#f3f4f6',color:'#6b7280',border:'none',padding:'8px 14px',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:13}}>
                → تغيير الاختيار
              </button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12}}>
              <div><label style={lbl}>الحصة</label>
                <select value={sessionNo} onChange={e => setSessionNo(Number(e.target.value))} style={inp}>
                  {sessions.map(s => <option key={s.session} value={s.session}>الحصة {s.session} — {s.label}</option>)}
                </select></div>
              <div><label style={lbl}>المجال</label>
                <input value={domainOverride} onChange={e => setDomainOverride(e.target.value)} placeholder="مثال: مجال الحضارة المغربية" style={inp}/></div>
              <div><label style={lbl}>الأستاذ(ة)</label>
                <input value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="اسمك الكامل" style={inp}/></div>
              <div><label style={lbl}>رقم الجذاذة</label>
                <input type="number" value={jadhadaNo} onChange={e => setJadhadaNo(Number(e.target.value))} style={inp}/></div>
              <div><label style={lbl}>صفحة الكتاب</label>
                <input value={bookPage} onChange={e => setBookPage(e.target.value)} placeholder="مثال: 13" style={inp}/></div>
            </div>
            <div style={{marginTop:12}}>
              <label style={lbl}>ملاحظات</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="ملاحظات حول تدبير الحصة، الفوارق الفردية، الدعم..." style={{...inp,resize:'vertical'}}/>
            </div>
            <div style={{display:'flex',gap:10,marginTop:16,flexWrap:'wrap',alignItems:'center'}}>
              <button onClick={() => window.print()}
                style={{background:UI.navy,color:'#fff',border:'none',padding:'11px 22px',borderRadius:10,fontWeight:700,fontSize:15,cursor:'pointer'}}>🖨 طباعة مباشرة</button>
              <button onClick={downloadWord}
                style={{background:'#2b579a',color:'#fff',border:'none',padding:'11px 22px',borderRadius:10,fontWeight:700,fontSize:15,cursor:'pointer'}}>⬇ تحميل Word</button>
              <span style={{fontSize:12,color:'#6b7280'}}>الأسبوع {weekInUnit} من الوحدة (= الأسبوع {absoluteWeek(unit, weekInUnit)} في السنة)</span>
            </div>
          </div>
          <div style={{background:'#fff',padding:22,borderRadius:6,boxShadow:'0 2px 12px rgba(0,0,0,.08)'}} dangerouslySetInnerHTML={{ __html: buildHtml() }}/>
        </div>
      </main>
    </>
  )
}

const lbl: React.CSSProperties = { display:'block', fontSize:12, fontWeight:700, color:'#374151', marginBottom:5 }
const inp: React.CSSProperties = { width:'100%', padding:'9px 11px', borderRadius:8, border:'1px solid #d1d5db', fontSize:14, fontFamily:'inherit', direction:'rtl', boxSizing:'border-box', background:'#fff' }
const ta: React.CSSProperties = { ...inp, resize:'vertical' as const }

// ============================================================
//  نموذج إدخال درس جديد — حقول تختلف حسب المكوّن
// ============================================================
function EntryForm({ comp, year, unit, onCancel, onSaved }: {
  comp: CustomComponentKey; year: string; unit: string
  onCancel: () => void; onSaved: () => void
}) {
  const meta = componentMeta(comp as ComponentKey)
  const [title, setTitle] = useState('')
  const [domain, setDomain] = useState('')

  // حقول الظواهر اللغوية
  const [observation, setObservation] = useState('')
  const [rule, setRule] = useState('')
  const [ex1, setEx1] = useState(''); const [ex2, setEx2] = useState(''); const [ex3, setEx3] = useState('')

  // حقول التواصل الشفهي
  const [paragraphs, setParagraphs] = useState('')

  // حقول التعبير الكتابي
  const [subjectText, setSubjectText] = useState('')
  const [helperLexicon, setHelperLexicon] = useState('')
  const [connectors, setConnectors] = useState('')

  // حقول التطبيقات الكتابية
  const [appText, setAppText] = useState('')
  const [shakl, setShakl] = useState('')
  const [appEx1, setAppEx1] = useState('')
  const [appEx2, setAppEx2] = useState('')

  // حقول القراءة
  const [readingKind, setReadingKind] = useState<ReadingKind>('functional')
  const [readingParagraphs, setReadingParagraphs] = useState('')

  const canSave = title.trim().length > 0

  const save = () => {
    if (!canSave) return
    const id = newLessonId()
    const d = domain.trim() || undefined
    if (comp === 'reading') {
      const lesson: CustomReading = {
        id, title: title.trim(), domain: d, kind: readingKind,
        paragraphs: readingParagraphs.split('\n').map(p => p.trim()).filter(Boolean),
      }
      saveCustomLesson<CustomReading>(comp, year, unit, lesson)
    } else if (PHEN_COMPS.includes(comp as ComponentKey)) {
      const lesson: CustomPhenomenon = {
        id, title: title.trim(), domain: d, observation: observation.trim(), rule: rule.trim(),
        exercises: [ex1, ex2, ex3].map(e => e.trim()).filter(Boolean),
      }
      saveCustomLesson<CustomPhenomenon>(comp, year, unit, lesson)
    } else if (comp === 'oral') {
      const lesson: CustomOral = {
        id, title: title.trim(), domain: d,
        paragraphs: paragraphs.split('\n').map(p => p.trim()).filter(Boolean),
      }
      saveCustomLesson<CustomOral>(comp, year, unit, lesson)
    } else if (comp === 'writing') {
      const lesson: CustomWriting = {
        id, title: title.trim(), domain: d, subjectText: subjectText.trim(),
        helperLexicon: helperLexicon.trim() || undefined,
        connectors: connectors.trim() ? connectors.split('،').map(c => c.trim()).filter(Boolean) : undefined,
      }
      saveCustomLesson<CustomWriting>(comp, year, unit, lesson)
    } else if (comp === 'applications') {
      const lesson: CustomApplication = {
        id, title: title.trim(), domain: d, text: appText.trim(),
        shakl: shakl.trim() ? shakl.split('،').map(s => s.trim()).filter(Boolean) : undefined,
        exercisesWeek1: appEx1.trim() ? appEx1.split('\n').map(e => e.trim()).filter(Boolean) : undefined,
        exercisesWeek2: appEx2.trim() ? appEx2.split('\n').map(e => e.trim()).filter(Boolean) : undefined,
      }
      saveCustomLesson<CustomApplication>(comp, year, unit, lesson)
    }
    onSaved()
  }

  return (
    <>
      <TeacherNav active="jadhada" />
      <main dir="rtl" style={{minHeight:'100vh',background:UI.cream,fontFamily:'system-ui,Tahoma,Arial',padding:'30px 20px'}}>
        <div style={{maxWidth:720,margin:'0 auto'}}>
          <button onClick={onCancel}
            style={{background:'#f3f4f6',color:'#6b7280',border:'none',padding:'8px 16px',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:13,marginBottom:18}}>
            → إلغاء
          </button>
          <div style={{background:'#fff',borderRadius:14,padding:22,boxShadow:'0 2px 10px rgba(0,0,0,.06)'}}>
            <h2 style={{color:UI.navy,fontSize:19,fontWeight:800,marginTop:0}}>➕ إدخال درس جديد — {meta.title}</h2>
            <p style={{color:'#6b7280',fontSize:13,marginBottom:20}}>
              يُحفظ هذا الدرس في متصفّحك فقط، ويظهر بعدها في قائمة الدروس لتولّد منه جذاذته كاملة في أي وقت.
            </p>

            <Field label="عنوان الدرس *"><input value={title} onChange={e=>setTitle(e.target.value)} style={inp} placeholder="مثال: التاء المبسوطة"/></Field>
            <Field label="المجال"><input value={domain} onChange={e=>setDomain(e.target.value)} style={inp} placeholder="مثال: مجال الحضارة المغربية"/></Field>

            {comp === 'reading' && (
              <>
                <Field label="نوع النص">
                  <select value={readingKind} onChange={e=>setReadingKind(e.target.value as ReadingKind)} style={inp}>
                    <option value="functional">نص وظيفي (4 حصص)</option>
                    <option value="poetic">نص شعري (4 حصص، إنشاد وتذوّق)</option>
                    <option value="serial">نص مسترسل (جزء أسبوعياً)</option>
                  </select>
                </Field>
                <Field label={readingKind === 'serial' ? 'أجزاء النص (كل جزء في سطر — حتى 4 أجزاء)' : 'فقرات النص (كل فقرة في سطر — تُستعمل فقرة لكل حصة)'}>
                  <textarea value={readingParagraphs} onChange={e=>setReadingParagraphs(e.target.value)} rows={8} style={ta}
                    placeholder={readingKind==='serial' ? 'الجزء الأول...\nالجزء الثاني...' : 'الفقرة الأولى...\nالفقرة الثانية...'}/>
                </Field>
              </>
            )}

            {PHEN_COMPS.includes(comp as ComponentKey) && (
              <>
                <Field label="نص الملاحظة أو الأمثلة"><textarea value={observation} onChange={e=>setObservation(e.target.value)} rows={3} style={ta} placeholder="الجملة أو الأمثلة التي ينطلق منها الدرس..."/></Field>
                <Field label="القاعدة (الاستنتاج)"><textarea value={rule} onChange={e=>setRule(e.target.value)} rows={3} style={ta} placeholder="القاعدة كما في الكتاب..."/></Field>
                <Field label="تمرين التطبيق الأول"><input value={ex1} onChange={e=>setEx1(e.target.value)} style={inp}/></Field>
                <Field label="تمرين التطبيق الثاني"><input value={ex2} onChange={e=>setEx2(e.target.value)} style={inp}/></Field>
                <Field label="تمرين التطبيق الثالث"><input value={ex3} onChange={e=>setEx3(e.target.value)} style={inp}/></Field>
              </>
            )}

            {comp === 'oral' && (
              <Field label="فقرات النص السماعي (كل فقرة في سطر)">
                <textarea value={paragraphs} onChange={e=>setParagraphs(e.target.value)} rows={8} style={ta} placeholder={'الفقرة الأولى...\nالفقرة الثانية...'}/>
              </Field>
            )}

            {comp === 'writing' && (
              <>
                <Field label="نصّ الموضوع"><textarea value={subjectText} onChange={e=>setSubjectText(e.target.value)} rows={3} style={ta}/></Field>
                <Field label="الرصيد المساعد (اختياري)"><textarea value={helperLexicon} onChange={e=>setHelperLexicon(e.target.value)} rows={2} style={ta}/></Field>
                <Field label="الروابط المقترَحة (مفصولة بفاصلة، اختياري)"><input value={connectors} onChange={e=>setConnectors(e.target.value)} style={inp} placeholder="وَ، فَـ، ثُمَّ..."/></Field>
              </>
            )}

            {comp === 'applications' && (
              <>
                <Field label="النص التطبيقي (للحصة الثانية)"><textarea value={appText} onChange={e=>setAppText(e.target.value)} rows={3} style={ta}/></Field>
                <Field label="الكلمات المطلوب ضبطها بالشكل (مفصولة بفاصلة، اختياري)"><input value={shakl} onChange={e=>setShakl(e.target.value)} style={inp}/></Field>
                <Field label="تمارين الحصة الأولى (كل تمرين في سطر)"><textarea value={appEx1} onChange={e=>setAppEx1(e.target.value)} rows={4} style={ta}/></Field>
                <Field label="تمارين الحصة الثانية (كل تمرين في سطر)"><textarea value={appEx2} onChange={e=>setAppEx2(e.target.value)} rows={4} style={ta}/></Field>
              </>
            )}

            <button onClick={save} disabled={!canSave}
              style={{background:canSave?UI.navy:'#9ca3af',color:'#fff',border:'none',padding:'12px 28px',borderRadius:10,fontWeight:700,fontSize:15,cursor:canSave?'pointer':'not-allowed',marginTop:10}}>
              ✓ حفظ الدرس وتوليد الجذاذة
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{marginBottom:14}}><label style={lbl}>{label}</label>{children}</div>
}
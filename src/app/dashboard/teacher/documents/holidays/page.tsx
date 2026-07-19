'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// لائحة العطل الرسمية — المقرر الوزاري المنظم للسنة الدراسية 2026/2027 (ملحق رقم 1)
const HOLIDAYS = [
  { n:1,  name:"الفترة البينية الأولى",        dates:"من يوم الأحد 18 أكتوبر 2026 إلى يوم الأحد 25 أكتوبر 2026", days:"8",     type:"بينية" },
  { n:2,  name:"عيد الوحدة",                   dates:"السبت 31 أكتوبر 2026",                                     days:"1",     type:"وطنية" },
  { n:3,  name:"ذكرى المسيرة الخضراء",         dates:"الجمعة 6 نونبر 2026",                                      days:"1",     type:"وطنية" },
  { n:4,  name:"عيد الاستقلال",                dates:"الأربعاء 18 نونبر 2026",                                   days:"1",     type:"وطنية" },
  { n:5,  name:"الفترة البينية الثانية",       dates:"من يوم الأحد 6 دجنبر 2026 إلى يوم الأحد 13 دجنبر 2026",    days:"8",     type:"بينية" },
  { n:6,  name:"فاتح السنة الميلادية",         dates:"الجمعة فاتح يناير 2027",                                   days:"1",     type:"سنوية" },
  { n:7,  name:"ذكرى تقديم وثيقة الاستقلال",   dates:"الإثنين 11 يناير 2027",                                    days:"1",     type:"وطنية" },
  { n:8,  name:"فاتح السنة الأمازيغية",        dates:"يوم الخميس 14 يناير 2027",                                 days:"1",     type:"سنوية" },
  { n:9,  name:"عطلة منتصف السنة الدراسية",    dates:"من يوم الأحد 24 يناير 2027 إلى يوم الأحد 31 يناير 2027",   days:"8",     type:"بينية" },
  { n:10, name:"عيد الفطر",                    dates:"من 29 رمضان إلى 2 شوال 1448",                              days:"3 أو 4", type:"دينية" },
  { n:11, name:"الفترة البينية الثالثة",       dates:"من يوم الأحد 21 مارس 2027 إلى يوم الأحد 28 مارس 2027",     days:"8",     type:"بينية" },
  { n:12, name:"عيد الشغل",                    dates:"يوم السبت فاتح ماي 2027",                                  days:"1",     type:"وطنية" },
  { n:13, name:"الفترة البينية الرابعة",       dates:"من يوم الأحد 9 ماي 2027 إلى يوم الأحد 16 ماي 2027",        days:"8",     type:"بينية" },
  { n:14, name:"عيد الأضحى المبارك",           dates:"من 9 إلى 11 ذي الحجة 1448",                                days:"3",     type:"دينية" },
  { n:15, name:"فاتح محرم",                    dates:"يوم 1 محرم 1449",                                          days:"1",     type:"دينية" },
]

const TYPE_STYLE: {[k:string]:{bg:string,color:string}} = {
  "بينية": {bg:"#dbeafe", color:"#1d4ed8"},
  "وطنية": {bg:"#fee2e2", color:"#b91c1c"},
  "دينية": {bg:"#dcfce7", color:"#15803d"},
  "سنوية": {bg:"#f3e8ff", color:"#7c3aed"},
}

export default function HolidaysDocPage() {
  const [teacherName, setTeacherName] = useState('')
  const [info, setInfo] = useState({taj:'', academy:'', direction:'', school:'', unit:'', level:'', season:'2026/2027'})

  useEffect(() => {
    try {
      const saved = localStorage.getItem('arabiyati_school_info')
      if (saved) setInfo(prev => ({ ...prev, ...JSON.parse(saved) }))
    } catch (e) {}
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { window.location.href = '/auth/login'; return }
      const { data: me } = await supabase.from('users').select('name').eq('id', session.user.id).single()
      setTeacherName(me?.name || '')
    })
  }, [])

  const updateInfo = (key: string, value: string) => {
    setInfo(prev => {
      const next = { ...prev, [key]: value }
      try { localStorage.setItem('arabiyati_school_info', JSON.stringify(next)) } catch (e) {}
      return next
    })
  }

  const infoInput = (key: keyof typeof info) => (
    <input value={info[key]} onChange={e => updateInfo(key, e.target.value)}
      style={{border:"none",outline:"none",width:"100%",fontSize:"12px",fontFamily:"Arial",textAlign:"center",background:"transparent",fontWeight:"bold",color:"#1e293b"}}/>
  )

  const labelCell: any = {background:"#1e3a8a",color:"white",padding:"6px 8px",fontSize:"12px",fontWeight:"bold",textAlign:"center",border:"1px solid #1e3a8a"}
  const valueCell: any = {border:"1px solid #cbd5e1",padding:"5px 8px",background:"white"}

  const totalDays = HOLIDAYS.reduce((sum, h) => {
    const n = parseInt(h.days)
    return sum + (isNaN(n) ? 0 : n)
  }, 0)

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          main { background: white !important; padding: 0 !important; }
          .doc-wrap { max-width: none !important; margin: 0 !important; padding: 0 !important; }
          .print-area { box-shadow: none !important; border-radius: 0 !important; margin: 0 !important; padding: 9mm !important; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>

      <nav className="no-print" style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",flexWrap:"wrap",gap:"8px"}}>
        <h1 style={{color:"#7c3aed",fontSize:"20px",fontWeight:"bold",margin:0}}>🏖️ لائحة العطل الرسمية</h1>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          <button onClick={() => window.print()}
            style={{background:"#2563eb",color:"white",border:"none",padding:"10px 20px",borderRadius:"8px",fontSize:"14px",fontWeight:"bold",cursor:"pointer"}}>
            🖨️ طباعة
          </button>
          <a href="/dashboard/teacher/documents" style={{background:"#f5f3ff",color:"#7c3aed",padding:"10px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold",fontSize:"14px"}}>
            📚 الوثائق
          </a>
        </div>
      </nav>

      <div className="doc-wrap" style={{maxWidth:"850px",margin:"0 auto",padding:"20px"}}>
        <div className="print-area" style={{background:"white",borderRadius:"14px",padding:"22px",boxShadow:"0 3px 14px rgba(0,0,0,0.08)"}}>

          {/* الترويسة: شعار الوزارة */}
          <div style={{textAlign:"center",marginBottom:"14px"}}>
            <img src="/images/ministry-logo.png" alt="وزارة التربية الوطنية والتعليم الأولي والرياضة" style={{height:"105px",objectFit:"contain"}}/>
          </div>

          {/* شريط العنوان الأنيق */}
          <div style={{background:"linear-gradient(135deg,#1e3a8a,#2563eb)",borderRadius:"12px",padding:"12px 18px",textAlign:"center",marginBottom:"14px",boxShadow:"0 3px 10px rgba(30,58,138,0.25)"}}>
            <h2 style={{color:"white",fontSize:"21px",fontWeight:"bold",margin:"0 0 4px 0"}}>لائحة العطل الرسمية</h2>
            <p style={{color:"#bfdbfe",fontSize:"12px",margin:0}}>الموسم الدراسي 2026/2027 — طبقاً للمقرر الوزاري المنظم للسنة الدراسية (ملحق رقم 1)</p>
          </div>

          {/* شريط المعلومات */}
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"16px"}}>
            <tbody>
              <tr>
                <td style={labelCell}>الأستاذ(ة)</td>
                <td style={labelCell}>رقم التأجير</td>
                <td style={labelCell}>الأكاديمية</td>
                <td style={labelCell}>المديرية الإقليمية</td>
                <td style={labelCell}>المؤسسة</td>
                <td style={labelCell}>المستوى</td>
              </tr>
              <tr>
                <td style={valueCell}><span style={{fontWeight:"bold",fontSize:"12px",display:"block",textAlign:"center"}}>{teacherName}</span></td>
                <td style={valueCell}>{infoInput('taj')}</td>
                <td style={valueCell}>{infoInput('academy')}</td>
                <td style={valueCell}>{infoInput('direction')}</td>
                <td style={valueCell}>{infoInput('school')}</td>
                <td style={valueCell}>{infoInput('level')}</td>
              </tr>
            </tbody>
          </table>

          {/* جدول العطل */}
          <table style={{width:"100%",borderCollapse:"separate",borderSpacing:0,fontSize:"13px",borderRadius:"10px",overflow:"hidden",border:"1px solid #cbd5e1"}}>
            <thead>
              <tr style={{background:"#1e3a8a"}}>
                <th style={{color:"white",padding:"9px 6px",fontSize:"12px",width:"34px"}}>ر.ت</th>
                <th style={{color:"white",padding:"9px 10px",fontSize:"13px",textAlign:"right"}}>العطلة المدرسية</th>
                <th style={{color:"white",padding:"9px 10px",fontSize:"13px",textAlign:"right"}}>تواريخها</th>
                <th style={{color:"white",padding:"9px 6px",fontSize:"12px",width:"60px"}}>عدد الأيام</th>
                <th style={{color:"white",padding:"9px 6px",fontSize:"12px",width:"58px"}}>النوع</th>
              </tr>
            </thead>
            <tbody>
              {HOLIDAYS.map((h, i) => (
                <tr key={h.n} style={{background: i % 2 === 0 ? "white" : "#f8fafc"}}>
                  <td style={{padding:"7px 6px",textAlign:"center",color:"#6b7280",borderTop:"1px solid #e2e8f0",fontWeight:"bold"}}>{h.n}</td>
                  <td style={{padding:"7px 10px",fontWeight:"bold",color:"#1e293b",borderTop:"1px solid #e2e8f0"}}>{h.name}</td>
                  <td style={{padding:"7px 10px",color:"#374151",borderTop:"1px solid #e2e8f0"}}>{h.dates}</td>
                  <td style={{padding:"7px 6px",textAlign:"center",fontWeight:"bold",color:"#1e3a8a",borderTop:"1px solid #e2e8f0"}}>{h.days}</td>
                  <td style={{padding:"7px 6px",textAlign:"center",borderTop:"1px solid #e2e8f0"}}>
                    <span style={{background:TYPE_STYLE[h.type].bg,color:TYPE_STYLE[h.type].color,padding:"2px 8px",borderRadius:"12px",fontSize:"11px",fontWeight:"bold"}}>{h.type}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{color:"#6b7280",fontSize:"11px",marginTop:"10px",lineHeight:"1.8"}}>
            📌 يُراعى إدخال اليوم الأول والأخير من تواريخ الفترات البينية. — مجموع أيام العطل (دون احتساب عيد الفطر بيوم متغير): حوالي {totalDays} يوماً.
          </p>

          {/* التوقيعات */}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:"22px",fontSize:"13px",fontWeight:"bold",color:"#1e293b",flexWrap:"wrap",gap:"10px"}}>
            <span>الأستاذ(ة):</span>
            <span>السيد(ة) المدير(ة):</span>
            <span>السيد(ة) المفتش(ة) التربوي(ة):</span>
          </div>
        </div>
      </div>
    </main>
  )
}

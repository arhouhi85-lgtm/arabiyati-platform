'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// المقرر الوزاري المنظم للسنة الدراسية 2026/2027 — ملحق رقم 2 (السلك الابتدائي)
const SEMESTER_1 = [
  { op:"إجراء آخر فروض المراقبة المستمرة", date:"من 4 إلى 9 يناير 2027" },
  { op:"انتهاء مسك نقط آخر فروض المراقبة المستمرة", date:"يوم 16 يناير 2027" },
  { op:"إجراء الامتحان الموحد المحلي لنيل شهادة الدروس الابتدائية", date:"يومي 18 و19 يناير 2027", star:true },
  { op:"انتهاء مسك نقط الامتحان الموحد المحلي لنيل شهادة الدروس الابتدائية", date:"يوم 20 يناير 2027" },
  { op:"استصدار بيانات النقط عبر منظومة مسار", date:"ابتداء من 21 يناير 2027" },
  { op:"عقد مجالس الأقسام", date:"يومي 21 و22 يناير 2027" },
  { op:"توزيع بيانات النقط", date:"يوم 23 يناير 2027" },
]

const SEMESTER_2 = [
  { op:"إجراء آخر فروض المراقبة المستمرة", date:"ما بين 14 و19 يونيو 2027" },
  { op:"انتهاء مسك نقط آخر فروض المراقبة المستمرة", date:"يوم 22 يونيو 2027" },
  { op:"الإعداد الجماعي للامتحان الموحد الإقليمي لنيل شهادة الدروس الابتدائية", date:"من 21 إلى 24 يونيو 2027" },
  { op:"إجراء الامتحان الموحد الإقليمي لنيل شهادة الدروس الابتدائية", date:"يومي 25 و26 يونيو 2027", star:true },
  { op:"انتهاء مسك نقط الامتحان الموحد الإقليمي لنيل شهادة الدروس الابتدائية", date:"يوم 30 يونيو 2027" },
  { op:"استصدار بيانات النقط عبر منظومة مسار", date:"ابتداء من 1 يوليوز 2027" },
  { op:"عقد مجالس الأقسام", date:"ما بين 1 و2 يوليوز 2027" },
  { op:"توزيع بيانات النقط", date:"يوم 3 يوليوز 2027" },
]

export default function ExamsDocPage() {
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

  const SemesterTable = ({title, color, rows}: {title:string, color:string, rows:any[]}) => (
    <div style={{marginBottom:"18px"}}>
      <div style={{background:color,borderRadius:"10px 10px 0 0",padding:"8px 14px"}}>
        <h3 style={{color:"white",fontSize:"16px",fontWeight:"bold",margin:0}}>{title}</h3>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px",border:"1px solid #cbd5e1"}}>
        <thead>
          <tr style={{background:"#f1f5f9"}}>
            <th style={{padding:"7px 10px",textAlign:"right",color:"#1e3a8a",fontSize:"12px",border:"1px solid #e2e8f0"}}>العملية</th>
            <th style={{padding:"7px 10px",textAlign:"right",color:"#1e3a8a",fontSize:"12px",border:"1px solid #e2e8f0",width:"210px"}}>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{background: r.star ? "#fef9c3" : (i % 2 === 0 ? "white" : "#f8fafc")}}>
              <td style={{padding:"7px 10px",color:"#1e293b",border:"1px solid #e2e8f0",fontWeight: r.star ? "bold" : "normal"}}>
                {r.star && "⭐ "}{r.op}
              </td>
              <td style={{padding:"7px 10px",fontWeight:"bold",color: r.star ? "#b45309" : "#1e3a8a",border:"1px solid #e2e8f0"}}>{r.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

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
        <h1 style={{color:"#7c3aed",fontSize:"20px",fontWeight:"bold",margin:0}}>📝 المراقبة المستمرة والامتحانات الموحدة</h1>
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

          <div style={{textAlign:"center",marginBottom:"14px"}}>
            <img src="/images/ministry-logo.png" alt="وزارة التربية الوطنية والتعليم الأولي والرياضة" style={{height:"105px",objectFit:"contain"}}/>
          </div>

          <div style={{background:"linear-gradient(135deg,#1e3a8a,#2563eb)",borderRadius:"12px",padding:"12px 18px",textAlign:"center",marginBottom:"14px",boxShadow:"0 3px 10px rgba(30,58,138,0.25)"}}>
            <h2 style={{color:"white",fontSize:"20px",fontWeight:"bold",margin:"0 0 4px 0"}}>المراقبة المستمرة والامتحانات الموحدة — السلك الابتدائي</h2>
            <p style={{color:"#bfdbfe",fontSize:"12px",margin:0}}>الموسم الدراسي 2026/2027 — طبقاً للمقرر الوزاري المنظم للسنة الدراسية (ملحق رقم 2)</p>
          </div>

          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"18px"}}>
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

          <SemesterTable title="🟦 الأسدس الأول" color="#1e3a8a" rows={SEMESTER_1} />
          <SemesterTable title="🟩 الأسدس الثاني" color="#166534" rows={SEMESTER_2} />

          <p style={{color:"#6b7280",fontSize:"11px",marginTop:"4px",lineHeight:"1.8"}}>
            ⭐ الصفوف المميزة باللون الأصفر: مواعيد إجراء الامتحانين الموحدين (المحلي والإقليمي) لنيل شهادة الدروس الابتدائية.
          </p>

          <div style={{display:"flex",justifyContent:"space-between",marginTop:"20px",fontSize:"13px",fontWeight:"bold",color:"#1e293b",flexWrap:"wrap",gap:"10px"}}>
            <span>الأستاذ(ة):</span>
            <span>السيد(ة) المدير(ة):</span>
            <span>السيد(ة) المفتش(ة) التربوي(ة):</span>
          </div>
        </div>
      </div>
    </main>
  )
}

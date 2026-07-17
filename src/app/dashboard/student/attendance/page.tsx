'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const STATUS_CONFIG: {[key:string]:{label:string,icon:string,bg:string,color:string,border:string}} = {
  late:             {label:"متأخر",          icon:"⏰", bg:"#fef9c3", color:"#ca8a04", border:"#fbbf24"},
  absent_excused:   {label:"غياب مبرَّر",     icon:"📝", bg:"#eff6ff", color:"#2563eb", border:"#93c5fd"},
  absent_unexcused: {label:"غياب غير مبرَّر", icon:"❌", bg:"#fee2e2", color:"#dc2626", border:"#fca5a5"},
}

const DAYS = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"]

function formatDate(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return `${DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`
}

export default function StudentAttendancePage() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { window.location.href = '/auth/login'; return }
      const { data } = await supabase
        .from('attendance')
        .select('date, session, status')
        .eq('student_id', session.user.id)
        .order('date', { ascending: false })
      setRecords(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const counts = {
    late: records.filter(r => r.status === 'late').length,
    absent_excused: records.filter(r => r.status === 'absent_excused').length,
    absent_unexcused: records.filter(r => r.status === 'absent_unexcused').length,
  }
  const totalAbsences = counts.absent_excused + counts.absent_unexcused

  if (loading) return (
    <div dir="rtl" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
      <p style={{fontSize:"20px",color:"#6b7280"}}>جارٍ التحميل...</p>
    </div>
  )

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",flexWrap:"wrap",gap:"8px"}}>
        <h1 style={{color:"#16a34a",fontSize:"22px",fontWeight:"bold",margin:0}}>📋 غياباتي</h1>
        <a href="/dashboard/student" style={{background:"#f3f4f6",color:"#6b7280",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
          العودة للوحة
        </a>
      </nav>

      <div style={{maxWidth:"700px",margin:"0 auto",padding:"24px"}}>

        {/* ملخص */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"24px"}}>
          {Object.keys(STATUS_CONFIG).map(k => (
            <div key={k} style={{background:STATUS_CONFIG[k].bg,border:`1px solid ${STATUS_CONFIG[k].border}`,borderRadius:"14px",padding:"16px",textAlign:"center"}}>
              <div style={{fontSize:"30px",fontWeight:"bold",color:STATUS_CONFIG[k].color}}>{(counts as any)[k]}</div>
              <div style={{fontSize:"13px",color:STATUS_CONFIG[k].color,fontWeight:"bold"}}>{STATUS_CONFIG[k].icon} {STATUS_CONFIG[k].label}</div>
            </div>
          ))}
        </div>

        {/* رسالة تشجيعية */}
        {totalAbsences === 0 && counts.late === 0 ? (
          <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"16px",padding:"32px",textAlign:"center",marginBottom:"24px"}}>
            <div style={{fontSize:"48px",marginBottom:"8px"}}>🌟</div>
            <p style={{color:"#15803d",fontSize:"18px",fontWeight:"bold",margin:0}}>ممتاز! لا يوجد أي غياب أو تأخر مسجَّل. واظب على حضورك!</p>
          </div>
        ) : counts.absent_unexcused >= 3 ? (
          <div style={{background:"#fef9c3",border:"1px solid #fbbf24",borderRadius:"12px",padding:"14px",textAlign:"center",marginBottom:"24px",color:"#92400e",fontWeight:"bold"}}>
            ⚠️ لديك {counts.absent_unexcused} غيابات غير مبرَّرة — احرص على تبريرها عند أستاذك والمواظبة على الحضور
          </div>
        ) : null}

        {/* قائمة السجلات */}
        {records.length > 0 && (
          <div style={{background:"white",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
            <h2 style={{color:"#1e3a8a",fontSize:"18px",fontWeight:"bold",marginBottom:"16px"}}>سجل الغيابات والتأخرات</h2>
            {records.map((r, idx) => {
              const cfg = STATUS_CONFIG[r.status]
              if (!cfg) return null
              return (
                <div key={idx} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 8px",
                  borderBottom: idx < records.length-1 ? "1px solid #f3f4f6" : "none",flexWrap:"wrap",gap:"8px"}}>
                  <div>
                    <div style={{fontWeight:"bold",color:"#1e293b",fontSize:"15px"}}>{formatDate(r.date)}</div>
                    <div style={{fontSize:"13px",color:"#9ca3af"}}>{r.session === 'morning' ? '🌅 الحصة الصباحية' : '🌇 الحصة المسائية'}</div>
                  </div>
                  <span style={{background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`,padding:"6px 14px",borderRadius:"20px",fontWeight:"bold",fontSize:"13px"}}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
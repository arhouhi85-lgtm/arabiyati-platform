'use client'
import { useState } from 'react'
import { getUpcomingEvents, daysUntil, fmtRange, TYPE_LABELS, TYPE_COLORS, CalendarEvent } from '@/lib/calendarEvents'

export default function StudentAgendaPage() {
  const [filter, setFilter] = useState<'all'|'holiday'|'exam'|'day'>('all')
  const allEvents = getUpcomingEvents(new Date(), 200)
  const items = filter === 'all' ? allEvents : allEvents.filter(e => e.type === filter)
  const nextItem = items[0]

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",flexWrap:"wrap",gap:"8px"}}>
        <h1 style={{color:"#0891b2",fontSize:"22px",fontWeight:"bold",margin:0}}>📅 المفكرة</h1>
        <a href="/dashboard/student" style={{background:"#f3f4f6",color:"#6b7280",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
          العودة للوحة
        </a>
      </nav>

      <div style={{maxWidth:"800px",margin:"0 auto",padding:"24px"}}>

        {nextItem && (
          <div style={{background:"linear-gradient(135deg,#0891b2,#0e7490)",borderRadius:"16px",padding:"22px",marginBottom:"20px",color:"white",boxShadow:"0 4px 16px rgba(8,145,178,0.3)"}}>
            <p style={{margin:"0 0 6px 0",fontSize:"13px",opacity:0.9}}>⏳ المحطة القادمة</p>
            <h2 style={{margin:"0 0 6px 0",fontSize:"22px",fontWeight:"bold"}}>{nextItem.icon} {nextItem.title}</h2>
            <p style={{margin:0,fontSize:"14px",opacity:0.95}}>
              {fmtRange(nextItem as CalendarEvent)} — {daysUntil(nextItem.date) === 0 ? 'اليوم!' : daysUntil(nextItem.date) === 1 ? 'غداً' : `بعد ${daysUntil(nextItem.date)} يوماً`}
            </p>
          </div>
        )}

        <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"16px"}}>
          {[["all","الكل"],["holiday","العطل"],["exam","الامتحانات"],["day","المناسبات"]].map(([k,l]) => (
            <button key={k} onClick={()=>setFilter(k as any)}
              style={{padding:"7px 14px",borderRadius:"20px",border:"none",cursor:"pointer",fontWeight:"bold",fontSize:"13px",
                background: filter===k ? "#0891b2" : "white", color: filter===k ? "white" : "#374151",
                boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
              {l}
            </button>
          ))}
        </div>

        <div style={{background:"white",borderRadius:"16px",padding:"8px",boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
          {items.length === 0 ? (
            <p style={{textAlign:"center",color:"#9ca3af",padding:"30px",fontSize:"15px"}}>لا توجد أحداث في هذا التصنيف</p>
          ) : items.map((item, idx) => {
            const colors = TYPE_COLORS[item.type]
            const dleft = daysUntil(item.date)
            return (
              <div key={idx} style={{display:"flex",alignItems:"center",gap:"12px",padding:"13px 14px",
                borderBottom: idx < items.length-1 ? "1px solid #f3f4f6" : "none"}}>
                <span style={{fontSize:"26px",flexShrink:0}}>{item.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:"bold",color:"#1e293b",fontSize:"15px"}}>
                    {item.title}
                    {item.approx && <span style={{color:"#ca8a04",fontSize:"11px",fontWeight:"normal"}}> (⚠️ تاريخ تقريبي)</span>}
                  </div>
                  <div style={{color:"#9ca3af",fontSize:"12.5px"}}>{fmtRange(item)}</div>
                </div>
                <span style={{background:colors.bg,color:colors.color,border:`1px solid ${colors.border}`,padding:"4px 10px",borderRadius:"14px",fontSize:"11px",fontWeight:"bold",flexShrink:0}}>
                  {dleft === 0 ? "اليوم" : dleft === 1 ? "غداً" : `${dleft} يوم`}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
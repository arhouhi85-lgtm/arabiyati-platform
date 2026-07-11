'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { lessonsData } from '@/lib/lessonsData'
import { supabase } from '@/lib/supabase'

const subjectBadges: {[key:string]:{name:string, icon:string, color:string, min:number}} = {
  "1": { name: "قارئ متميز", icon: "📖", color: "#2563eb", min: 50 },
  "2": { name: "نجم الصرف", icon: "⭐", color: "#ca8a04", min: 50 },
  "3": { name: "بطل التراكيب", icon: "🏆", color: "#16a34a", min: 50 },
  "4": { name: "خبير الإملاء", icon: "✏️", color: "#9333ea", min: 50 },
  "5": { name: "متفوق المستوى", icon: "🌟", color: "#ec4899", min: 50 },
  "6": { name: "أستاذ اللغة", icon: "👑", color: "#f97316", min: 50 },
}

export default function LessonPage() {
  const params = useParams()
  const year = params.year as string
  const unit = params.unit as string
  const lesson = params.lesson as string
  const [answers, setAnswers] = useState<{[key:number]:string}>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [pointsSaved, setPointsSaved] = useState(false)
  const [newBadge, setNewBadge] = useState<any>(null)

  const lessonNames: {[key:string]:string} = {
    "1":"القراءة","2":"الصرف","3":"التراكيب",
    "4":"الاملاء","5":"التعبير الكتابي","6":"التواصل الشفهي"
  }
  const lessonIcons: {[key:string]:string} = {
    "1":"📖","2":"🔤","3":"📝","4":"✏️","5":"✍️","6":"🗣️"
  }
  const lessonColors: {[key:string]:string} = {
    "1":"#2563eb","2":"#16a34a","3":"#9333ea",
    "4":"#ea580c","5":"#0891b2","6":"#be185d"
  }
  const yearNames: {[key:string]:string} = {
    "1":"الاولى","2":"الثانية","3":"الثالثة",
    "4":"الرابعة","5":"الخامسة","6":"السادسة"
  }
  const unitNames: {[key:string]:string} = {
    "1":"الاولى","2":"الثانية","3":"الثالثة",
    "4":"الرابعة","5":"الخامسة","6":"السادسة"
  }
  const color = lessonColors[lesson] || "#2563eb"
  const currentContent = lessonsData[year]?.[lesson] || lessonsData["1"]["1"]

  const handleSubmit = async () => {
    let s = 0
    currentContent.questions.forEach((q:any) => {
      if (answers[q.id] === q.correct) s += 20
    })
    setScore(s)
    setSubmitted(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const subjectName = lessonNames[lesson]

        const { data: existingPoints } = await supabase
          .from('points')
          .select('points, lesson')
          .eq('user_id', session.user.id)

        const oldSubjectTotal = (existingPoints || [])
          .filter((p: any) => p.lesson && p.lesson.includes(subjectName))
          .reduce((sum: number, p: any) => sum + p.points, 0)
        const newSubjectTotal = oldSubjectTotal + s

        const { error: insertError } = await supabase.from('points').insert({
          user_id: session.user.id,
          points: s,
          lesson: `السنة ${yearNames[year]} - الوحدة ${unitNames[unit]} - ${subjectName}`
        })

        if (!insertError) {
          setPointsSaved(true)
          const badge = subjectBadges[lesson]
          if (badge && oldSubjectTotal < badge.min && newSubjectTotal >= badge.min) {
            setNewBadge(badge)
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
      {newBadge && (
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"white",borderRadius:"24px",padding:"40px",textAlign:"center",maxWidth:"360px",boxShadow:"0 20px 60px rgba(0,0,0,0.3)",animation:"badgePop 0.5s ease"}}>
            <div style={{fontSize:"80px",marginBottom:"16px"}}>{newBadge.icon}</div>
            <h2 style={{color:"#ca8a04",fontSize:"24px",fontWeight:"bold",marginBottom:"8px"}}>🎉 شارة جديدة! 🎉</h2>
            <p style={{color:newBadge.color,fontSize:"22px",fontWeight:"bold",marginBottom:"8px"}}>{newBadge.name}</p>
            <p style={{color:"#6b7280",marginBottom:"24px"}}>تميزت في هذا الموضوع، استمر في التقدم!</p>
            <button onClick={()=>setNewBadge(null)}
              style={{background:newBadge.color,color:"white",border:"none",padding:"12px 32px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"16px"}}>
              رائع! 🎊
            </button>
          </div>
          <style>{`
            @keyframes badgePop {
              0% { transform: scale(0.5); opacity: 0; }
              60% { transform: scale(1.05); }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
        <h1 style={{color:color,fontSize:"22px",fontWeight:"bold",margin:0}}>
          {lessonIcons[lesson]} {lessonNames[lesson]}
        </h1>
        <a href={`/levels/primary/${year}/unit/${unit}`} style={{color:"#6b7280",textDecoration:"none",fontWeight:"bold"}}>رجوع</a>
      </nav>
      <div style={{maxWidth:"800px",margin:"0 auto",padding:"24px"}}>
        <div style={{background:"white",borderRadius:"16px",padding:"24px",marginBottom:"24px",borderRight:`6px solid ${color}`,boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
          <h2 style={{color:"#1e3a8a",fontSize:"22px",fontWeight:"bold",marginBottom:"8px",textAlign:"center"}}>
            {currentContent.title}
          </h2>
          <p style={{color:"#6b7280",textAlign:"center",marginBottom:"16px",fontSize:"14px"}}>
            السنة {yearNames[year]} — الوحدة {unitNames[unit]}
          </p>
          <p style={{color:"#374151",fontSize:"18px",lineHeight:"2.5",textAlign:"justify"}}>
            {currentContent.text}
          </p>
          <button onClick={() => {
            const u = new SpeechSynthesisUtterance(currentContent.text)
            u.lang = 'ar'
            window.speechSynthesis.speak(u)
          }} style={{background:"#dbeafe",color:"#2563eb",border:"none",padding:"10px 20px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",marginTop:"16px"}}>
            🔊 استمع
          </button>
        </div>
        <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
          <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"24px"}}>اسئلة التقييم</h3>
          {currentContent.questions.map((q:any) => (
            <div key={q.id} style={{marginBottom:"24px",padding:"16px",border:"2px solid #e5e7eb",borderRadius:"12px"}}>
              <p style={{color:"#374151",fontSize:"18px",fontWeight:"bold",marginBottom:"12px"}}>
                {q.id}. {q.question}
              </p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"8px"}}>
                {q.options.map((opt:string) => (
                  <button key={opt} onClick={() => !submitted && setAnswers({...answers,[q.id]:opt})}
                    style={{padding:"12px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"15px",textAlign:"right",
                      border:`2px solid ${submitted ? opt===q.correct ? "#22c55e" : answers[q.id]===opt ? "#ef4444" : "#e5e7eb" : answers[q.id]===opt ? color : "#e5e7eb"}`,
                      background:submitted ? opt===q.correct ? "#dcfce7" : answers[q.id]===opt ? "#fee2e2" : "white" : answers[q.id]===opt ? "#dbeafe" : "white",
                      color:"#374151"}}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {!submitted ? (
            <button onClick={handleSubmit}
              style={{width:"100%",background:color,color:"white",border:"none",padding:"14px",borderRadius:"8px",fontSize:"18px",fontWeight:"bold",cursor:"pointer"}}>
              تصحيح الاجابات
            </button>
          ) : (
            <div style={{background:"#dcfce7",borderRadius:"12px",padding:"24px",textAlign:"center"}}>
              <div style={{fontSize:"48px"}}>🏆</div>
              <h3 style={{color:"#16a34a",fontSize:"24px",fontWeight:"bold"}}>نتيجتك: {score} / 100</h3>
              <p style={{color:"#15803d",fontSize:"18px"}}>{score===100?"ممتاز!":score>=60?"جيد جدا!":"حاول مرة اخرى"}</p>
              <div style={{display:"flex",gap:"12px",justifyContent:"center",marginTop:"12px"}}>
                <button onClick={()=>{setAnswers({});setSubmitted(false);setScore(0)}}
                  style={{background:color,color:"white",border:"none",padding:"10px 24px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold"}}>
                  اعادة المحاولة
                </button>
                <a href={`/levels/primary/${year}/unit/${unit}`}>
                  <button style={{background:"#6b7280",color:"white",border:"none",padding:"10px 24px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold"}}>
                    العودة
                  </button>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
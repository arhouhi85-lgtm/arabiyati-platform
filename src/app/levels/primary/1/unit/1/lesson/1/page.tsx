'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { lessonsData } from '@/lib/lessonsData'

export default function LessonPage() {
  const params = useParams()
  const year = params.year as string
  const unit = params.unit as string
  const lesson = params.lesson as string

  const [answers, setAnswers] = useState<{[key:number]:string}>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const lessonNames: {[key:string]:string} = {
    "1":"القراءة","2":"الصرف","3":"التراكيب",
    "4":"الإملاء","5":"التعبير الكتابي","6":"التواصل الشفهي"
  }
  const lessonIcons: {[key:string]:string} = {
    "1":"📖","2":"🔤","3":"📝","4":"✏️","5":"✍️","6":"🗣️"
  }
  const lessonColors: {[key:string]:string} = {
    "1":"#2563eb","2":"#16a34a","3":"#9333ea",
    "4":"#ea580c","5":"#0891b2","6":"#be185d"
  }
  const yearNames: {[key:string]:string} = {
    "1":"الأولى","2":"الثانية","3":"الثالثة",
    "4":"الرابعة","5":"الخامسة","6":"السادسة"
  }
  const unitNames: {[key:string]:string} = {
    "1":"الأولى","2":"الثانية","3":"الثالثة",
    "4":"الرابعة","5":"الخامسة","6":"السادسة"
  }

  const color = lessonColors[lesson] || "#2563eb"
  const currentContent = lessonsData[lesson]?.[unit] || lessonsData["1"]["1"]

  const handleSubmit = () => {
    let s = 0
    currentContent.questions.forEach((q:any) => {
      if (answers[q.id] === q.correct) s += 20
    })
    setScore(s)
    setSubmitted(true)
  }

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
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
          <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"24px"}}>أسئلة التقييم</h3>
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
              تصحيح الإجابات ✅
            </button>
          ) : (
            <div style={{background:"#dcfce7",borderRadius:"12px",padding:"24px",textAlign:"center"}}>
              <div style={{fontSize:"48px"}}>🏆</div>
              <h3 style={{color:"#16a34a",fontSize:"24px",fontWeight:"bold"}}>نتيجتك: {score} / 100</h3>
              <p style={{color:"#15803d",fontSize:"18px"}}>{score===100?"ممتاز! 🌟":score>=60?"جيد جدا! 👍":"حاول مرة أخرى 💪"}</p>
              <div style={{display:"flex",gap:"12px",justifyContent:"center",marginTop:"12px"}}>
                <button onClick={()=>{setAnswers({});setSubmitted(false);setScore(0)}}
                  style={{background:color,color:"white",border:"none",padding:"10px 24px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold"}}>
                  إعادة المحاولة 🔄
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
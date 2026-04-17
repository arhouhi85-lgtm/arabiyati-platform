'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'

export default function LessonPage() {
  const params = useParams()
  const year = params.year
  const unit = params.unit
  const lesson = params.lesson

  const lessonNames: {[key:string]:string} = {
    "1": "القراءة",
    "2": "الصرف",
    "3": "التراكيب",
    "4": "الإملاء",
    "5": "التعبير الكتابي",
    "6": "التواصل الشفهي"
  }

  const lessonIcons: {[key:string]:string} = {
    "1": "📖",
    "2": "🔤",
    "3": "📝",
    "4": "✏️",
    "5": "✍️",
    "6": "🗣️"
  }

  const yearNames: {[key:string]:string} = {
    "1": "الأولى",
    "2": "الثانية",
    "3": "الثالثة",
    "4": "الرابعة",
    "5": "الخامسة",
    "6": "السادسة"
  }

  const unitNames: {[key:string]:string} = {
    "1": "الأولى",
    "2": "الثانية",
    "3": "الثالثة",
    "4": "الرابعة",
    "5": "الخامسة",
    "6": "السادسة"
  }

  const [answers, setAnswers] = useState<{[key:number]:string}>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const questions = [
    {
      id: 1,
      question: "ما موضوع هذا الدرس؟",
      options: [lessonNames[lesson as string] || "", "الحساب", "الرسم", "التاريخ"],
      correct: lessonNames[lesson as string] || ""
    },
    {
      id: 2,
      question: "في أي وحدة نحن؟",
      options: ["الوحدة الأولى", "الوحدة الثانية", "الوحدة الثالثة", `الوحدة ${unitNames[unit as string]}`],
      correct: `الوحدة ${unitNames[unit as string]}`
    },
    {
      id: 3,
      question: "في أي سنة دراسية نحن؟",
      options: ["السنة الأولى", "السنة الثانية", `السنة ${yearNames[year as string]}`, "السنة الرابعة"],
      correct: `السنة ${yearNames[year as string]}`
    }
  ]

  const handleSubmit = () => {
    let s = 0
    questions.forEach(q => {
      if (answers[q.id] === q.correct) s += 10
    })
    setScore(s)
    setSubmitted(true)
  }

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
        <h1 style={{color:"#2563eb",fontSize:"22px",fontWeight:"bold",margin:0}}>
          {lessonIcons[lesson as string]} {lessonNames[lesson as string]}
        </h1>
        <a href={`/levels/primary/${year}/unit/${unit}`} style={{color:"#6b7280",textDecoration:"none",fontWeight:"bold"}}>رجوع</a>
      </nav>

      <div style={{maxWidth:"800px",margin:"0 auto",padding:"40px 20px"}}>

        <div style={{background:"white",borderRadius:"16px",padding:"32px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:"32px",borderRight:"6px solid #2563eb"}}>
          <h2 style={{color:"#1e3a8a",fontSize:"24px",fontWeight:"bold",marginBottom:"16px",textAlign:"center"}}>
            السنة {yearNames[year as string]} — الوحدة {unitNames[unit as string]}
          </h2>
          <p style={{color:"#374151",fontSize:"18px",lineHeight:"2.5",textAlign:"justify"}}>
            هَذَا دَرْسُ {lessonNames[lesson as string]} لِلسَّنَةِ {yearNames[year as string]} ابْتِدَائِي. سَيَتِمُّ إِضَافَةُ المُحْتَوَى الكَامِلِ قَرِيبًا مِنْ كِتَابِ المُفِيدِ فِي اللُّغَةِ العَرَبِيَّةِ.
          </p>
          <button
            onClick={() => {
              const utterance = new SpeechSynthesisUtterance(`درس ${lessonNames[lesson as string]} للسنة ${yearNames[year as string]}`)
              utterance.lang = 'ar'
              window.speechSynthesis.speak(utterance)
            }}
            style={{background:"#dbeafe",color:"#2563eb",border:"none",padding:"10px 20px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",marginTop:"16px",fontSize:"16px"}}>
            🔊 استمع
          </button>
        </div>

        <div style={{background:"white",borderRadius:"16px",padding:"32px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
          <h3 style={{color:"#1e3a8a",fontSize:"22px",fontWeight:"bold",marginBottom:"24px"}}>أسئلة التقييم</h3>

          {questions.map(q => (
            <div key={q.id} style={{marginBottom:"24px"}}>
              <p style={{color:"#374151",fontSize:"18px",fontWeight:"bold",marginBottom:"12px"}}>
                {q.id}. {q.question}
              </p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"8px"}}>
                {q.options.map(opt => (
                  <button key={opt} onClick={() => !submitted && setAnswers({...answers,[q.id]:opt})}
                    style={{
                      padding:"12px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"16px",color:"#374151",
                      border:`2px solid ${submitted ? opt === q.correct ? "#22c55e" : answers[q.id] === opt ? "#ef4444" : "#e5e7eb" : answers[q.id] === opt ? "#2563eb" : "#e5e7eb"}`,
                      background:submitted ? opt === q.correct ? "#dcfce7" : answers[q.id] === opt ? "#fee2e2" : "white" : answers[q.id] === opt ? "#dbeafe" : "white"
                    }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {!submitted ? (
            <button onClick={handleSubmit}
              style={{background:"#2563eb",color:"white",border:"none",padding:"14px 32px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"18px",width:"100%",marginTop:"16px"}}>
              تصحيح الإجابات
            </button>
          ) : (
            <div style={{background:"#dcfce7",borderRadius:"12px",padding:"24px",textAlign:"center",marginTop:"16px"}}>
              <div style={{fontSize:"48px",marginBottom:"8px"}}>🏆</div>
              <h3 style={{color:"#16a34a",fontSize:"24px",fontWeight:"bold"}}>نتيجتك: {score} / 30</h3>
              <p style={{color:"#15803d",fontSize:"18px"}}>
                {score === 30 ? "ممتاز! أحسنت 🌟" : score >= 20 ? "جيد جدا! استمر 👍" : "حاول مرة أخرى 💪"}
              </p>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
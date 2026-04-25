'use client'
import { useState } from 'react'

export default function ExercisesPage() {
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<{[key:number]:string}>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState('السنة الرابعة ابتدائي')
  const [unit, setUnit] = useState('الوحدة الأولى')
  const [lesson, setLesson] = useState('القراءة')

  const generateExercises = async () => {
    setLoading(true)
    setAnswers({})
    setSubmitted(false)
    setScore(0)
    setQuestions([])
    try {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, unit, lesson })
      })
      const data = await res.json()
      setQuestions(data.questions || [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleSubmit = () => {
    let s = 0
    questions.forEach(q => {
      if (answers[q.id] === q.correct) s += 20
    })
    setScore(s)
    setSubmitted(true)
  }

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
        <h1 style={{color:"#2563eb",fontSize:"22px",fontWeight:"bold",margin:0}}>عربيتي — التمارين الذكية</h1>
        <a href="/" style={{color:"#6b7280",textDecoration:"none",fontWeight:"bold"}}>الرئيسية</a>
      </nav>

      <div style={{maxWidth:"800px",margin:"0 auto",padding:"24px"}}>

        <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:"24px"}}>
          <h2 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"16px"}}>اختر التمرين</h2>

          <div style={{marginBottom:"16px"}}>
            <label style={{display:"block",marginBottom:"8px",fontWeight:"bold"}}>المستوى</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)}
              style={{width:"100%",border:"2px solid #e5e7eb",borderRadius:"8px",padding:"10px",fontSize:"16px"}}>
              <option>السنة الأولى ابتدائي</option>
              <option>السنة الثانية ابتدائي</option>
              <option>السنة الثالثة ابتدائي</option>
              <option>السنة الرابعة ابتدائي</option>
              <option>السنة الخامسة ابتدائي</option>
              <option>السنة السادسة ابتدائي</option>
              <option>السنة الأولى إعدادي</option>
              <option>السنة الثانية إعدادي</option>
              <option>السنة الثالثة إعدادي</option>
            </select>
          </div>

          <div style={{marginBottom:"16px"}}>
            <label style={{display:"block",marginBottom:"8px",fontWeight:"bold"}}>الوحدة</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)}
              style={{width:"100%",border:"2px solid #e5e7eb",borderRadius:"8px",padding:"10px",fontSize:"16px"}}>
              <option>الوحدة الأولى</option>
              <option>الوحدة الثانية</option>
              <option>الوحدة الثالثة</option>
              <option>الوحدة الرابعة</option>
              <option>الوحدة الخامسة</option>
              <option>الوحدة السادسة</option>
            </select>
          </div>

          <div style={{marginBottom:"16px"}}>
            <label style={{display:"block",marginBottom:"8px",fontWeight:"bold"}}>الدرس</label>
            <select value={lesson} onChange={(e) => setLesson(e.target.value)}
              style={{width:"100%",border:"2px solid #e5e7eb",borderRadius:"8px",padding:"10px",fontSize:"16px"}}>
              <option>القراءة</option>
              <option>الصرف</option>
              <option>التراكيب</option>
              <option>الإملاء</option>
              <option>التعبير الكتابي</option>
              <option>التواصل الشفهي</option>
            </select>
          </div>

          <button onClick={generateExercises} disabled={loading}
            style={{width:"100%",background:"#2563eb",color:"white",border:"none",padding:"14px",borderRadius:"8px",fontSize:"18px",fontWeight:"bold",cursor:"pointer"}}>
            {loading ? 'جارٍ توليد التمارين...' : 'ولّد تمارين جديدة 🚀'}
          </button>
        </div>

        {questions.length > 0 && (
          <div style={{background:"white",borderRadius:"16px",padding:"32px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
            <h2 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",marginBottom:"24px"}}>
              التمارين — {level} — {lesson}
            </h2>
            {questions.map(q => (
              <div key={q.id} style={{marginBottom:"24px",padding:"16px",border:"2px solid #e5e7eb",borderRadius:"12px"}}>
                <p style={{color:"#374151",fontSize:"18px",fontWeight:"bold",marginBottom:"12px"}}>
                  {q.id}. {q.question}
                </p>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"8px"}}>
                  {q.options?.map((opt: string) => (
                    <button key={opt} onClick={() => !submitted && setAnswers({...answers,[q.id]:opt})}
                      style={{padding:"12px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",fontSize:"16px",textAlign:"right",
                        border:`2px solid ${submitted ? opt === q.correct ? "#22c55e" : answers[q.id] === opt ? "#ef4444" : "#e5e7eb" : answers[q.id] === opt ? "#2563eb" : "#e5e7eb"}`,
                        background:submitted ? opt === q.correct ? "#dcfce7" : answers[q.id] === opt ? "#fee2e2" : "white" : answers[q.id] === opt ? "#dbeafe" : "white",
                        color:"#374151"}}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!submitted ? (
              <button onClick={handleSubmit}
                style={{width:"100%",background:"#16a34a",color:"white",border:"none",padding:"14px",borderRadius:"8px",fontSize:"18px",fontWeight:"bold",cursor:"pointer"}}>
                تصحيح الإجابات
              </button>
            ) : (
              <div style={{background:"#dcfce7",borderRadius:"12px",padding:"24px",textAlign:"center"}}>
                <div style={{fontSize:"48px"}}>🏆</div>
                <h3 style={{color:"#16a34a",fontSize:"24px",fontWeight:"bold"}}>نتيجتك: {score} / 100</h3>
                <p style={{color:"#15803d",fontSize:"18px"}}>{score === 100 ? "ممتاز! 🌟" : score >= 60 ? "جيد جدا! 👍" : "حاول مرة أخرى 💪"}</p>
                <button onClick={generateExercises}
                  style={{background:"#2563eb",color:"white",border:"none",padding:"10px 24px",borderRadius:"8px",cursor:"pointer",fontWeight:"bold",marginTop:"12px",fontSize:"16px"}}>
                  تمارين جديدة 🔄
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
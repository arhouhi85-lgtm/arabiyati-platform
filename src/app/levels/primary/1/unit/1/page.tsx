export default function UnitPage() {
  const lessons = [
    { id: 1, title: "القراءة", icon: "📖", color: "#2563eb", bg: "#dbeafe" },
    { id: 2, title: "الصرف", icon: "🔤", color: "#16a34a", bg: "#dcfce7" },
    { id: 3, title: "التراكيب", icon: "📝", color: "#9333ea", bg: "#f3e8ff" },
    { id: 4, title: "الإملاء", icon: "✏️", color: "#ea580c", bg: "#ffedd5" },
    { id: 5, title: "التعبير الكتابي", icon: "✍️", color: "#0891b2", bg: "#cffafe" },
    { id: 6, title: "التواصل الشفهي", icon: "🗣️", color: "#be185d", bg: "#fce7f3" },
  ]

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial"}}>
      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
        <h1 style={{color:"#2563eb",fontSize:"22px",fontWeight:"bold",margin:0}}>عربيتي — الوحدة الأولى</h1>
        <a href="/levels/primary" style={{color:"#6b7280",textDecoration:"none",fontWeight:"bold"}}>رجوع</a>
      </nav>
      <div style={{maxWidth:"900px",margin:"0 auto",padding:"40px 20px"}}>
        <h2 style={{color:"#1e3a8a",fontSize:"28px",fontWeight:"bold",textAlign:"center",marginBottom:"8px"}}>
          السنة الأولى — الوحدة الأولى
        </h2>
        <p style={{color:"#6b7280",textAlign:"center",marginBottom:"40px"}}>
          اختر الدرس الذي تريد تعلمه
        </p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"20px"}}>
          {lessons.map(lesson => (
            <a key={lesson.id} href={`/levels/primary/1/unit/1/lesson/${lesson.id}`} style={{textDecoration:"none"}}>
              <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",borderTop:`4px solid ${lesson.color}`,cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:"48px",marginBottom:"12px"}}>{lesson.icon}</div>
                <h3 style={{color:lesson.color,fontSize:"18px",fontWeight:"bold",marginBottom:"8px"}}>{lesson.title}</h3>
                <div style={{background:lesson.bg,color:lesson.color,padding:"6px 12px",borderRadius:"20px",fontSize:"14px",fontWeight:"bold"}}>
                  ابدأ الدرس
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
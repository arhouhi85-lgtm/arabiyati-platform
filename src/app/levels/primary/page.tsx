export default function PrimaryPage() {
  const years = [
    { num: 1, name: "الأولى", color: "#ef4444", bg: "#fee2e2", border: "#ef4444" },
    { num: 2, name: "الثانية", color: "#f97316", bg: "#ffedd5", border: "#f97316" },
    { num: 3, name: "الثالثة", color: "#eab308", bg: "#fef9c3", border: "#eab308" },
    { num: 4, name: "الرابعة", color: "#22c55e", bg: "#dcfce7", border: "#22c55e" },
    { num: 5, name: "الخامسة", color: "#2563eb", bg: "#dbeafe", border: "#2563eb" },
    { num: 6, name: "السادسة", color: "#9333ea", bg: "#f3e8ff", border: "#9333ea" },
  ]

  return (
    <main dir="rtl" style={{minHeight:"100vh", background:"#f0f9ff", fontFamily:"Arial"}}>
      <nav style={{background:"white", padding:"16px", display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
        <h1 style={{color:"#2563eb", fontSize:"24px", fontWeight:"bold", margin:0}}>عربيتي — المرحلة الابتدائية</h1>
        <a href="/" style={{color:"#6b7280", textDecoration:"none", fontWeight:"bold"}}>الرئيسية</a>
      </nav>

      <div style={{maxWidth:"1200px", margin:"0 auto", padding:"40px 20px"}}>
        <h2 style={{color:"#1e3a8a", fontSize:"32px", fontWeight:"bold", textAlign:"center", marginBottom:"40px"}}>
          اختر السنة الدراسية
        </h2>

        <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"24px"}}>
          {years.map(year => (
            <div key={year.num} style={{background:"white", borderRadius:"16px", padding:"24px", boxShadow:"0 4px 12px rgba(0,0,0,0.1)", borderTop:`4px solid ${year.border}`}}>
              <h3 style={{color:year.color, fontSize:"20px", fontWeight:"bold", marginBottom:"16px", textAlign:"center"}}>
                السنة {year.name}
              </h3>
              <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
                {[1,2,3,4,5,6].map(u => (
                  <a key={u} href={`/levels/primary/${year.num}/unit/${u}`} style={{textDecoration:"none"}}>
                    <div style={{background:year.bg, color:year.color, padding:"10px 16px", borderRadius:"8px", fontWeight:"bold", cursor:"pointer", textAlign:"center", transition:"opacity 0.2s"}}>
                      الوحدة {u === 1 ? "الأولى" : u === 2 ? "الثانية" : u === 3 ? "الثالثة" : u === 4 ? "الرابعة" : u === 5 ? "الخامسة" : "السادسة"}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
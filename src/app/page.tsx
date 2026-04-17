export default function Home() {
  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#eff6ff"}}>
      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
        <h1 style={{color:"#2563eb",fontSize:"28px",fontWeight:"bold"}}>عربيتي</h1>
        <div style={{display:"flex",gap:"12px"}}>
          <a href="/auth/login"><button style={{background:"#ec4899",color:"white",padding:"8px 16px",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"bold"}}>تسجيل الدخول</button></a>
          <a href="/auth/signup"><button style={{background:"#2563eb",color:"white",padding:"8px 16px",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"bold"}}>انشاء حساب</button></a>
        </div>
      </nav>
      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"40px 20px",textAlign:"center"}}>
        <h2 style={{color:"#1e3a8a",fontSize:"40px",fontWeight:"bold",marginBottom:"16px"}}>مرحبا بك في عربيتي</h2>
        <p style={{color:"#6b7280",fontSize:"20px",marginBottom:"40px"}}>منصة تعليمية شاملة للغة العربية لجميع المستويات</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"24px"}}>
          <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",borderTop:"4px solid #60a5fa"}}>
            <div style={{fontSize:"48px"}}>🏫</div>
            <h3 style={{color:"#1d4ed8",fontSize:"22px",fontWeight:"bold"}}>الابتدائي</h3>
            <p style={{color:"#6b7280"}}>السنوات من الاولى الى السادسة</p>
          </div>
          <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",borderTop:"4px solid #f472b6"}}>
            <div style={{fontSize:"48px"}}>🎓</div>
            <h3 style={{color:"#be185d",fontSize:"22px",fontWeight:"bold"}}>الاعدادي</h3>
            <p style={{color:"#6b7280"}}>السنوات من الاولى الى الثالثة</p>
          </div>
          <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",borderTop:"4px solid #c084fc"}}>
            <div style={{fontSize:"48px"}}>🏛️</div>
            <h3 style={{color:"#7e22ce",fontSize:"22px",fontWeight:"bold"}}>الثانوي</h3>
            <p style={{color:"#6b7280"}}>السنوات من الاولى الى الثالثة</p>
          </div>
        </div>
      </div>
    </main>
  )
}
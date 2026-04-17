export default function Home() {
  return (
    <main dir="rtl" style={{minHeight:'100vh', background:'#eff6ff', fontFamily:'Arial'}}>
      
      <nav style={{background:'white', padding:'16px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
        <h1 style={{color:'#2563eb', fontSize:'28px', fontWeight:'bold', margin:0}}>عربيتي</h1>
        <div style={{display:'flex', gap:'12px'}}>
          <a href="/auth/login">
            <button style={{background:'#ec4899', color:'white', padding:'8px 16px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'bold', fontSize:'16px'}}>تسجيل الدخول</button>
          </a>
          <a href="/auth/signup">
            <button style={{background:'#2563eb', color:'white', padding:'8px 16px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'bold', fontSize:'16px'}}>إنشاء حساب</button>
          </a>
        </div>
      </nav>

      <div style={{maxWidth:'1100px', margin:'0 auto', padding:'40px 20px', textAlign:'center'}}>
        <h2 style={{color:'#1e3a8a', fontSize:'40px', fontWeight:'bold', marginBottom:'16px'}}>مرحبا بك في عربيتي</h2>
        <p style={{color:'#6b7280', fontSize:'20px', marginBottom:'40px'}}>منصة تعليمية شاملة للغة العربية لجميع المستويات</p>

        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'24px', marginBottom:'40px'}}>
          
          <div style={{background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', borderTop:'4px solid #60a5fa'}}>
            <div style={{fontSize:'48px', marginBottom:'12px'}}>🏫</div>
            <h3 style={{color:'#1d4ed8', fontSize:'22px', fontWeight:'bold', marginBottom:'8px'}}>الابتدائي</h3>
            <p style={{color:'#6b7280', marginBottom:'16px'}}>السنوات من الأولى إلى السادسة</p>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'8px'}}>
              {[1,2,3,4,5,6].map(n => (
                <button key={n} style={{background:'#dbeafe', color:'#1d4ed8', borderRadius:'8px', padding:'8px', fontWeight:'bold', border:'none', cursor:'pointer'}}>س{n}</button>
              ))}
            </div>
          </div>

          <div style={{background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', borderTop:'4px solid #f472b6'}}>
            <div style={{fontSize:'48px', marginBottom:'12px'}}>🎓</div>
            <h3 style={{color:'#be185d', fontSize:'22px', fontWeight:'bold', marginBottom:'8px'}}>الإعدادي</h3>
            <p style={{color:'#6b7280', marginBottom:'16px'}}>السنوات من الأولى إلى الثالثة</p>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'8px'}}>
              {[1,2,3].map(n => (
                <button key={n} style={{background:'#fce7f3', color:'#be185d', borderRadius:'8px', padding:'8px', fontWeight:'bold', border:'none', cursor:'pointer'}}>س{n}</button>
              ))}
            </div>
          </div>

          <div style={{background:'white', borderRadius:'16px', padding:'24px', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', borderTop:'4px solid #c084fc'}}>
            <div style={{fontSize:'48px', marginBottom:'12px'}}>🏛️</div>
            <h3 style={{color:'#7e22ce', fontSize:'22px', fontWeight:'bold', marginBottom:'8px'}}>الثانوي</h3>
            <p style={{color:'#6b7280', marginBottom:'16px'}}>السنوات من الأولى إلى الثالثة</p>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'8px'}}>
              {[1,2,3].map(n => (
                <button key={n} style={{background:'#f3e8ff', color:'#7e22ce', borderRadius:'8px', padding:'8px', fontWeight:'bold', border:'none', cursor:'pointer'}}>س{n}</button>
              ))}
            </div>
          </div>

        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px'}}>
          <div style={{background:'white', borderRadius:'16px', padding:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
            <div style={{color:'#2563eb', fontSize:'32px', fontWeight:'bold'}}>12</div>
            <div style={{color:'#6b7280'}}>مستوى دراسي</div>
          </div>
          <div style={{background:'white', borderRadius:'16px', padding:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
            <div style={{color:'#ec4899', fontSize:'32px', fontWeight:'bold'}}>+100</div>
            <div style={{color:'#6b7280'}}>درس تفاعلي</div>
          </div>
          <div style={{background:'white', borderRadius:'16px', padding:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}>
            <div style={{color:'#7e22ce', fontSize:'32px', fontWeight:'bold'}}>+500</div>
            <div style={{color:'#6b7280'}}>تمرين متنوع</div>
          </div>
        </div>

      </div>
    </main>
  )
}
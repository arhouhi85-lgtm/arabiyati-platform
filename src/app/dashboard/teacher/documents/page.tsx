'use client'

const DOCS = [
  { id:"teacher-card", title:"بطاقة الأستاذ(ة)", icon:"👤", desc:"المعلومات الشخصية والإدارية والمهنية والشواهد الجامعية" },
  { id:"student-card", title:"بطاقة المتعلم(ة)", icon:"🎒", desc:"معلومات المتعلم وأسرته وسنوات دراسته مع إطار الصورة" },
  { id:"class-rules", title:"القانون الداخلي للقسم", icon:"📜", desc:"قواعد التوقيت والمؤسسة والساحة والقسم وطريقة العمل" },
  { id:"anthem", title:"النشيد الوطني", icon:"🇲🇦", desc:"النشيد الوطني المغربي كاملاً بتنسيق أنيق للطباعة" },
  { id:"census", title:"إحصاء المتعلمين", icon:"📊", desc:"الجدد والمكررون والمجموع وتوزيع المتعلمين حسب العمر" },
  { id:"study-years", title:"جدول سنوات الدراسة", icon:"📅", desc:"لائحة 36 متعلماً مع سنوات الدراسة من 1 إلى 6" },
  { id:"social-survey", title:"البحث الاجتماعي", icon:"🏠", desc:"معلومات أسر المتعلمين: الأبوان ومهنتاهما وعدد الإخوة" },
  { id:"cooperative", title:"تعاونية القسم", icon:"🤲", desc:"محضر التأسيس وانتخاب المكتب وأنشطة التعاونية" },
  { id:"monthly-attendance", title:"المواظبة الشهرية", icon:"📈", desc:"نسب الحضور والغياب شهراً بشهر مع جدول التتبع" },
  { id:"leaves", title:"جدول الرخص", icon:"📄", desc:"تتبع الرخص: نوعها ومدتها وتاريخا بدايتها ونهايتها" },
  { id:"meetings", title:"جدول اللقاءات التربوية", icon:"🤝", desc:"تواريخ اللقاءات وساعاتها وأماكنها ونبذة عنها" },
  { id:"references", title:"عناوين المراجع المعتمدة", icon:"📖", desc:"المراجع المعتمدة لكل مادة مع الطبعة" },
  { id:"memos", title:"مذكرات ومراسلات", icon:"✉️", desc:"سجل المذكرات: رقمها وتاريخها ومصدرها وموضوعها" },
  { id:"holidays", title:"لائحة العطل الرسمية", icon:"🏖️", desc:"العطل المدرسية 2026/2027 معبأة من المقرر الوزاري", official:true },
  { id:"exams", title:"المراقبة المستمرة والامتحانات", icon:"📝", desc:"تواريخ الفروض والامتحانات الموحدة 2026/2027 من المقرر الوزاري", official:true },
  { id:"national-days", title:"الأيام الوطنية والعالمية", icon:"🌍", desc:"لائحة المناسبات الوطنية والعالمية على مدار السنة" },
]

const UPCOMING = [
  { title:"جدول المحطات والعمليات", icon:"🗓️" },
  { title:"تنظيم أسابيع السنة الدراسية", icon:"📆" },
]

export default function DocumentsHubPage() {
  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)",fontFamily:"Arial"}}>
      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",flexWrap:"wrap",gap:"8px"}}>
        <h1 style={{color:"#7c3aed",fontSize:"22px",fontWeight:"bold",margin:0}}>📚 الوثائق التربوية</h1>
        <a href="/dashboard/teacher" style={{background:"#f3f4f6",color:"#6b7280",padding:"8px 16px",borderRadius:"8px",textDecoration:"none",fontWeight:"bold"}}>
          العودة للوحة
        </a>
      </nav>

      <div style={{maxWidth:"1050px",margin:"0 auto",padding:"28px 20px"}}>

        <div style={{textAlign:"center",marginBottom:"26px"}}>
          <img src="/images/ministry-logo.png" alt="وزارة التربية الوطنية" style={{height:"110px",objectFit:"contain"}}/>
          <p style={{color:"#6b7280",fontSize:"15px",marginTop:"10px",lineHeight:"1.9"}}>
            وثائقك التربوية للموسم الدراسي 2026/2027 — افتح الوثيقة، <b>اكتب في خاناتها مباشرة</b> (تُحفظ تلقائياً)، ثم اطبعها 🖨️
          </p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:"16px"}}>
          {DOCS.map(doc => (
            <a key={doc.id} href={`/dashboard/teacher/documents/${doc.id}`} style={{textDecoration:"none"}}>
              <div style={{background:"white",borderRadius:"16px",padding:"18px",boxShadow:"0 3px 14px rgba(0,0,0,0.08)",
                height:"100%",boxSizing:"border-box",cursor:"pointer",
                border: doc.official ? "2px solid #fbbf24" : "2px solid transparent",transition:"all 0.2s"}}
                onMouseOver={e=>{(e.currentTarget as HTMLElement).style.transform="translateY(-3px)"}}
                onMouseOut={e=>{(e.currentTarget as HTMLElement).style.transform="none"}}>
                <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"8px"}}>
                  <span style={{fontSize:"30px"}}>{doc.icon}</span>
                  <h3 style={{color:"#1e3a8a",fontSize:"16px",fontWeight:"bold",margin:0,flex:1}}>{doc.title}</h3>
                </div>
                {doc.official && (
                  <span style={{background:"#fef9c3",color:"#a16207",padding:"3px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:"bold",display:"inline-block",marginBottom:"6px"}}>
                    🏛️ معبأة بمعطيات المقرر الوزاري
                  </span>
                )}
                <p style={{color:"#6b7280",fontSize:"13px",margin:"0 0 12px 0",lineHeight:"1.7"}}>{doc.desc}</p>
                <span style={{background:"#f0fdf4",color:"#16a34a",padding:"4px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"bold"}}>
                  ✍️ افتح واملأ واطبع
                </span>
              </div>
            </a>
          ))}

          {UPCOMING.map(doc => (
            <div key={doc.title} style={{background:"#fafafa",borderRadius:"16px",padding:"18px",border:"2px dashed #e5e7eb",opacity:0.75}}>
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"10px"}}>
                <span style={{fontSize:"30px",filter:"grayscale(0.5)"}}>{doc.icon}</span>
                <h3 style={{color:"#6b7280",fontSize:"16px",fontWeight:"bold",margin:0}}>{doc.title}</h3>
              </div>
              <span style={{background:"#fef9c3",color:"#ca8a04",padding:"4px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"bold"}}>
                🚧 قيد الإعداد — بانتظار صفحات المقرر الوزاري
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

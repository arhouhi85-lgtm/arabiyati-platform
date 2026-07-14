'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const subjectBadges: {[key:string]:{name:string,icon:string,color:string,min:number}} = {
  "1":{name:"قارئ متميز",icon:"📖",color:"#2563eb",min:50},
  "2":{name:"نجم الصرف",icon:"⭐",color:"#ca8a04",min:50},
  "3":{name:"بطل التراكيب",icon:"🏆",color:"#16a34a",min:50},
  "4":{name:"خبير الإملاء",icon:"✏️",color:"#9333ea",min:50},
  "5":{name:"متفوق المستوى",icon:"🌟",color:"#ec4899",min:50},
  "6":{name:"أستاذ اللغة",icon:"👑",color:"#f97316",min:50},
}

const AUDIO_START = 200 // 3 دقائق و20 ثانية = 200 ثانية
const AUDIO_END = 344   // 5 دقائق و44 ثانية = 344 ثانية
const AUDIO_DURATION = AUDIO_END - AUDIO_START // 144 ثانية

const maatirText = "كان أبي في غرفة الجلوس حين ناداني قائلاً اجلسي يا زينب بقربي وتابعي المشاهد التي تتوالى على شاشة التلفاز وأنصتي جيداً لما يقوله المذيع كانت مشاهد لمآثر بلادي تتناوب على الظهور والمذيع يعلق ويقول تعتز كل أمة بمآثر أجدادها تصونها من التلف وتحفظها من العبث المغرب مليء بآثار عزه وعظمته فحيثما وليت وجهك وجدت أثراً ناطقاً وفناً شامخاً فإذا جلت في فاس وقصدت جامع القرويين وقفت مندهشاً أمام روعة صوره وإذا انتقلت إلى الرباط لفت نظرك صومعة حسان وفي الدار البيضاء نتوقف أمام روعة مسجد الحسن الثاني أمام البحر بزخارفه البديعة"

const maatirLesson = {
  title: "مآثر بلادي",
  text: "كان أبي في غرفة الجلوس حين ناداني قائلاً: اجلسي يا زينب بقربي، وتابعي المشاهد التي تتوالى على شاشة التلفاز، وأنصتي جيداً لما يقوله المذيع. كانت مشاهد لمآثر بلادي تتناوب على الظهور، والمذيع يعلق ويقول: تعتز كل أمة بمآثر أجدادها، تصونها من التلف وتحفظها من العبث. المغرب مليء بآثار عزه وعظمته، فحيثما وليت وجهك، وجدت أثراً ناطقاً وفناً شامخاً. فإذا جلت في فاس وقصدت جامع القرويين، وقفت مندهشاً أمام روعة صوره. وإذا انتقلت إلى الرباط لفت نظرك صومعة حسان. وفي الدار البيضاء نتوقف أمام روعة مسجد الحسن الثاني أمام البحر بزخارفه البديعة.",
  images: [
    {src:"/images/qarawiyyin.jpg", label:"جامع القرويين — فاس"},
    {src:"/images/hassan.jpg", label:"صومعة حسان — الرباط"},
    {src:"/images/hassan2.jpg", label:"مسجد الحسن الثاني — الدار البيضاء"},
  ],
  questions: [
    {id:1,type:"mcq",color:"#2563eb",icon:"🔵",question:"من الذي دعا زينب للجلوس ومتابعة التلفاز؟",options:["أمها","أخوها","أبوها","جدها"],correct:"أبوها",hint:"فكر في أفراد العائلة الذين ذُكروا في النص"},
    {id:2,type:"tf",color:"#16a34a",icon:"✅",question:"جامع القرويين يوجد في مدينة الرباط",correct:false,hint:"تذكر المدن التي ذكرها النص"},
    {id:3,type:"blank",color:"#9333ea",icon:"✏️",question:"أكمل الجملة: المغرب مليء بآثار ___ وعظمته",correct:"عزه",hint:"ابحث عن هذه الجملة في النص"},
    {id:4,type:"mcq",color:"#2563eb",icon:"🔵",question:"ما موضوع البرنامج التلفزيوني الذي شاهدته زينب؟",options:["برامج الطبخ","مآثر المغرب وحضارته","برامج الرياضة","نشرة الأخبار"],correct:"مآثر المغرب وحضارته",hint:"عنوان الدرس يساعدك"},
    {id:5,type:"tf",color:"#16a34a",icon:"✅",question:"مسجد الحسن الثاني يقع في مدينة الدار البيضاء أمام البحر",correct:true,hint:"اقرأ الجملة الأخيرة في النص"},
    {id:6,type:"blank",color:"#9333ea",icon:"✏️",question:"أكمل: تعتز كل أمة بمآثر ___",correct:"أجدادها",hint:"هذه الجملة قالها المذيع في النص"},
    {id:7,type:"mcq",color:"#2563eb",icon:"🔵",question:"في أي مدينة توجد صومعة حسان؟",options:["فاس","مكناس","الدار البيضاء","الرباط"],correct:"الرباط",hint:"انظر للصورة الثانية"},
    {id:8,type:"order",color:"#ea580c",icon:"🔀",question:"رتّب الكلمات لتكوّن جملة صحيحة من النص:",words:["أجدادها","بمآثر","كل أمة","تعتز"],correct:["تعتز","كل أمة","بمآثر","أجدادها"],hint:"ابدأ بالفعل"},
  ]
}

function playClap() {
  try {
    const ctx = new (window.AudioContext||(window as any).webkitAudioContext)()
    const buf = ctx.createBuffer(1,ctx.sampleRate*0.3,ctx.sampleRate)
    const data = buf.getChannelData(0)
    for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*0.05))
    const src = ctx.createBufferSource()
    src.buffer=buf; src.connect(ctx.destination); src.start()
    setTimeout(()=>{const s2=ctx.createBufferSource();s2.buffer=buf;s2.connect(ctx.destination);s2.start()},150)
  } catch(e){}
}

// مكوّن الكاراوكي مع الملف الصوتي الحقيقي
function KaraokeReader({text}: {text: string}) {
  const words = text.split(' ')
  const [currentWord, setCurrentWord] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement|null>(null)
  const intervalRef = useRef<NodeJS.Timeout|null>(null)
  const cleanWords = maatirText.split(' ')

  const startAudio = () => {
    if(!audioRef.current) return
    audioRef.current.currentTime = AUDIO_START
    audioRef.current.play()
    setIsPlaying(true)
    setCurrentWord(0)

    // حساب توقيت كل كلمة بناءً على مدة الأوديو
    const timePerWord = AUDIO_DURATION / cleanWords.length

    let wordIdx = 0
    intervalRef.current = setInterval(() => {
      if(!audioRef.current) return
      const elapsed = audioRef.current.currentTime - AUDIO_START
      const newIdx = Math.floor(elapsed / timePerWord)
      if(newIdx !== wordIdx && newIdx < cleanWords.length) {
        wordIdx = newIdx
        setCurrentWord(newIdx)
      }
      setProgress(Math.min((elapsed/AUDIO_DURATION)*100, 100))
      if(audioRef.current.currentTime >= AUDIO_END) {
        stopAudio()
      }
    }, 100)
  }

  const stopAudio = () => {
    if(audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = AUDIO_START }
    if(intervalRef.current) clearInterval(intervalRef.current)
    setIsPlaying(false)
    setCurrentWord(-1)
    setProgress(0)
  }

  useEffect(() => { return () => { if(intervalRef.current) clearInterval(intervalRef.current) } }, [])

  return (
    <div>
      <audio ref={audioRef} src="/audio/maatir.mp3" preload="auto"/>

      <p style={{color:"#1e293b",fontSize:"17px",lineHeight:"2.8",textAlign:"justify",marginBottom:"20px"}}>
        {words.map((word, i) => (
          <span key={i} style={{
            background: currentWord === i ? "#fef08a" : "transparent",
            borderRadius: "4px",
            padding: "2px 4px",
            transition: "background 0.1s",
            fontWeight: currentWord === i ? "bold" : "normal",
            color: currentWord === i ? "#1e3a8a" : "#1e293b",
            fontSize: currentWord === i ? "18px" : "17px",
          }}>{word}{' '}</span>
        ))}
      </p>

      {/* شريط التقدم */}
      {isPlaying && (
        <div style={{background:"#e5e7eb",borderRadius:"100px",height:"6px",marginBottom:"12px"}}>
          <div style={{background:"linear-gradient(90deg,#2563eb,#1e3a8a)",borderRadius:"100px",height:"6px",
            width:`${progress}%`,transition:"width 0.1s"}}/>
        </div>
      )}

      <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
        {!isPlaying ? (
          <button onClick={startAudio}
            style={{background:"linear-gradient(135deg,#2563eb,#1e3a8a)",color:"white",border:"none",
              padding:"12px 24px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px",
              display:"flex",alignItems:"center",gap:"8px",boxShadow:"0 4px 12px rgba(37,99,235,0.3)"}}>
            🔊 استمع مع التظليل
          </button>
        ) : (
          <button onClick={stopAudio}
            style={{background:"linear-gradient(135deg,#ef4444,#b91c1c)",color:"white",border:"none",
              padding:"12px 24px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px",
              display:"flex",alignItems:"center",gap:"8px"}}>
            ⏹️ إيقاف
          </button>
        )}
        {isPlaying && (
          <div style={{display:"flex",gap:"4px",alignItems:"center"}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{width:"6px",height:"6px",borderRadius:"50%",background:"#2563eb",
                animation:"bounce 0.6s ease-in-out infinite",animationDelay:`${i*0.15}s`}}/>
            ))}
            <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LessonPage() {
  const params = useParams()
  const year = params.year as string
  const unit = params.unit as string
  const lesson = params.lesson as string

  const isMaatir = year==="4" && lesson==="1" && unit==="1"

  const [mounted, setMounted] = useState(false)
  const [shuffledQs, setShuffledQs] = useState(maatirLesson.questions)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [qAnswers, setQAnswers] = useState<{[id:number]:{correct:boolean,attempts:number}}>({})
  const [orderSelected, setOrderSelected] = useState<string[]>([])
  const [blankValue, setBlankValue] = useState("")
  const [showHint, setShowHint] = useState(false)
  const [showStars, setShowStars] = useState(false)
  const [newBadge, setNewBadge] = useState<any>(null)
  const [finished, setFinished] = useState(false)
  const [correctFlash, setCorrectFlash] = useState(false)
  const [wrongFlash, setWrongFlash] = useState(false)
  const [savedPoints, setSavedPoints] = useState(false)
  const [shuffledWords, setShuffledWords] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    setShuffledQs([...maatirLesson.questions].sort(()=>Math.random()-0.5))
  }, [])

  const yearNames: {[key:string]:string} = {"1":"الأولى","2":"الثانية","3":"الثالثة","4":"الرابعة","5":"الخامسة","6":"السادسة"}
  const unitNames: {[key:string]:string} = {"1":"الأولى","2":"الثانية","3":"الثالثة","4":"الرابعة","5":"الخامسة","6":"السادسة"}
  const lessonNames: {[key:string]:string} = {"1":"القراءة","2":"الصرف","3":"التراكيب","4":"الإملاء","5":"التعبير الكتابي","6":"التواصل الشفهي"}
  const lessonColors: {[key:string]:string} = {"1":"#2563eb","2":"#16a34a","3":"#9333ea","4":"#ea580c","5":"#0891b2","6":"#be185d"}
  const color = lessonColors[lesson] || "#2563eb"
  const currentQ = shuffledQs[currentIdx]
  const totalQ = shuffledQs.length

  useEffect(() => {
    if(currentQ?.type==="order") {
      setShuffledWords([...(currentQ as any).words].sort(()=>Math.random()-0.5))
    }
  }, [currentIdx, currentQ])

  const handleCorrect = () => {
    playClap()
    setCorrectFlash(true)
    setTimeout(()=>setCorrectFlash(false), 800)
    const newAnswers = {...qAnswers, [currentQ.id]:{correct:true,attempts:(qAnswers[currentQ.id]?.attempts||0)+1}}
    setQAnswers(newAnswers)
    setShowHint(false); setBlankValue(""); setOrderSelected([])
    setTimeout(()=>{
      if(currentIdx < totalQ-1) setCurrentIdx(i=>i+1)
      else finishLesson(newAnswers)
    }, 1200)
  }

  const handleWrong = () => {
    setWrongFlash(true)
    setTimeout(()=>setWrongFlash(false), 600)
    const attempts = (qAnswers[currentQ.id]?.attempts||0)+1
    setQAnswers(prev=>({...prev,[currentQ.id]:{correct:false,attempts}}))
    if(attempts >= 2) setShowHint(true)
  }

  const finishLesson = async (answers: any) => {
    const correctCount = Object.values(answers).filter((a:any)=>a.correct).length
    const score = Math.round((correctCount/totalQ)*100)
    setFinished(true)
    if(score>=60){ setShowStars(true); setTimeout(()=>setShowStars(false),2500) }
    if(!savedPoints) {
      try {
        const {data:{session}} = await supabase.auth.getSession()
        if(session?.user){
          const subjectName = lessonNames[lesson]
          const {data:ep} = await supabase.from('points').select('points,lesson').eq('user_id',session.user.id)
          const oldTotal = (ep||[]).filter((p:any)=>p.lesson?.includes(subjectName)).reduce((s:number,p:any)=>s+p.points,0)
          const newTotal = oldTotal+score
          await supabase.from('points').insert({user_id:session.user.id,points:score,
            lesson:`السنة ${yearNames[year]} - الوحدة ${unitNames[unit]} - ${subjectName}`})
          setSavedPoints(true)
          const badge = subjectBadges[lesson]
          if(badge && oldTotal<badge.min && newTotal>=badge.min) setNewBadge(badge)
        }
      } catch(e){console.error(e)}
    }
  }

  const restartLesson = () => {
    setShuffledQs([...maatirLesson.questions].sort(()=>Math.random()-0.5))
    setCurrentIdx(0); setQAnswers({}); setOrderSelected([]); setBlankValue("")
    setShowHint(false); setFinished(false); setShowStars(false); setSavedPoints(false)
  }

  if(!mounted) return (
    <div dir="rtl" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
      <p style={{fontSize:"20px",color:"#6b7280"}}>جارٍ التحميل...</p>
    </div>
  )

  if(!isMaatir) return (
    <main dir="rtl" style={{minHeight:"100vh",background:"#f0f9ff",fontFamily:"Arial",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"64px",marginBottom:"16px"}}>🚧</div>
        <p style={{fontSize:"20px",color:"#6b7280"}}>هذا الدرس قيد التطوير</p>
        <a href={`/levels/primary/${year}/unit/${unit}`}>
          <button style={{background:color,color:"white",border:"none",padding:"12px 24px",borderRadius:"8px",cursor:"pointer",marginTop:"16px",fontSize:"16px",fontWeight:"bold"}}>العودة</button>
        </a>
      </div>
    </main>
  )

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)",fontFamily:"Arial"}}>

      {showStars && (
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:9999}}>
          {Array.from({length:15}).map((_,i)=>(
            <div key={i} style={{position:'absolute',left:`${5+Math.random()*90}%`,top:`${10+Math.random()*50}%`,
              fontSize:`${18+Math.random()*20}px`,opacity:0,animation:`star 1.5s ease-out forwards`,animationDelay:`${i*0.08}s`}}>
              {['⭐','🌟','✨','🎉','💫'][i%5]}
            </div>
          ))}
          <style>{`@keyframes star{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-300px) rotate(30deg) scale(0.2);opacity:0}}`}</style>
        </div>
      )}

      {newBadge && (
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"white",borderRadius:"24px",padding:"40px",textAlign:"center",maxWidth:"360px"}}>
            <div style={{fontSize:"80px",marginBottom:"12px"}}>{newBadge.icon}</div>
            <h2 style={{color:"#ca8a04",fontSize:"24px",fontWeight:"bold",marginBottom:"8px"}}>🎉 شارة جديدة!</h2>
            <p style={{color:newBadge.color,fontSize:"22px",fontWeight:"bold",marginBottom:"24px"}}>{newBadge.name}</p>
            <button onClick={()=>setNewBadge(null)} style={{background:newBadge.color,color:"white",border:"none",padding:"12px 32px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"16px"}}>رائع! 🎊</button>
          </div>
        </div>
      )}

      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
        <h1 style={{color:color,fontSize:"22px",fontWeight:"bold",margin:0}}>📖 القراءة</h1>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{background:"#fef9c3",color:"#ca8a04",padding:"6px 14px",borderRadius:"20px",fontWeight:"bold",fontSize:"14px"}}>السنة الرابعة — الوحدة الأولى</span>
          <a href={`/levels/primary/${year}/unit/${unit}`} style={{color:"#6b7280",textDecoration:"none",fontWeight:"bold",background:"#f3f4f6",padding:"8px 14px",borderRadius:"8px"}}>رجوع</a>
        </div>
      </nav>

      <div style={{maxWidth:"860px",margin:"0 auto",padding:"24px"}}>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"20px"}}>
          {maatirLesson.images.map((img,i)=>(
            <div key={i} style={{borderRadius:"12px",overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.12)"}}>
              <img src={img.src} alt={img.label} style={{width:"100%",height:"120px",objectFit:"cover",display:"block"}}/>
              <div style={{background:"rgba(30,58,138,0.85)",color:"white",padding:"6px 10px",fontSize:"12px",textAlign:"center",fontWeight:"bold"}}>{img.label}</div>
            </div>
          ))}
        </div>

        <div style={{background:"white",borderRadius:"16px",padding:"24px",marginBottom:"20px",borderRight:`5px solid ${color}`,boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
          <h2 style={{color:"#1e3a8a",fontSize:"22px",fontWeight:"bold",marginBottom:"6px",textAlign:"center"}}>{maatirLesson.title}</h2>
          <p style={{color:"#6b7280",textAlign:"center",marginBottom:"20px",fontSize:"13px"}}>السنة الرابعة — الوحدة الأولى</p>
          <KaraokeReader text={maatirLesson.text} />
        </div>

        {!finished ? (
          <div style={{background:"white",borderRadius:"16px",padding:"24px",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
              <span style={{fontWeight:"bold",color:"#1e3a8a",fontSize:"15px"}}>📝 السؤال {currentIdx+1} من {totalQ}</span>
              <span style={{background:"#f0fdf4",color:"#16a34a",padding:"4px 12px",borderRadius:"20px",fontWeight:"bold",fontSize:"13px"}}>
                ✅ {Object.values(qAnswers).filter((a:any)=>a.correct).length} صحيح
              </span>
            </div>
            <div style={{background:"#e5e7eb",borderRadius:"100px",height:"8px",marginBottom:"24px"}}>
              <div style={{background:`linear-gradient(90deg,${color},#1e3a8a)`,borderRadius:"100px",height:"8px",
                width:`${Math.round((currentIdx/totalQ)*100)}%`,transition:"width 0.5s"}}/>
            </div>

            <div style={{padding:"20px",border:`2px solid ${correctFlash?"#22c55e":wrongFlash?"#ef4444":currentQ.color+"40"}`,
              borderRadius:"16px",background:correctFlash?"#f0fdf4":wrongFlash?"#fef2f2":"white",transition:"all 0.3s"}}>

              <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px"}}>
                <span style={{fontSize:"22px"}}>{currentQ.icon}</span>
                <span style={{background:currentQ.color,color:"white",padding:"3px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"bold"}}>
                  {currentQ.type==="mcq"?"اختيار من متعدد":currentQ.type==="tf"?"صح أم خطأ":currentQ.type==="blank"?"ملء الفراغ":"ترتيب الكلمات"}
                </span>
              </div>

              <p style={{color:"#1e293b",fontSize:"17px",fontWeight:"bold",marginBottom:"16px",lineHeight:"1.8"}}>{currentQ.question}</p>

              {currentQ.type==="mcq" && (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                  {(currentQ as any).options.map((opt:string)=>(
                    <button key={opt} onClick={()=>{
                      if(qAnswers[currentQ.id]?.correct) return
                      if(opt===(currentQ as any).correct) handleCorrect()
                      else handleWrong()
                    }} style={{padding:"14px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px",textAlign:"right",
                      border:`2px solid ${currentQ.color}40`,background:"white",color:"#1e293b",transition:"all 0.2s"}}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type==="tf" && (
                <div style={{display:"flex",gap:"12px"}}>
                  {[{label:"✅ صح",val:true,bg:"#f0fdf4",border:"#16a34a",text:"#15803d"},
                    {label:"❌ خطأ",val:false,bg:"#fef2f2",border:"#ef4444",text:"#b91c1c"}].map(btn=>(
                    <button key={String(btn.val)} onClick={()=>{
                      if(qAnswers[currentQ.id]?.correct) return
                      if(btn.val===(currentQ as any).correct) handleCorrect()
                      else handleWrong()
                    }} style={{flex:1,padding:"16px",borderRadius:"12px",border:`2px solid ${btn.border}`,
                      background:btn.bg,cursor:"pointer",fontSize:"18px",fontWeight:"bold",color:btn.text}}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type==="blank" && (
                <div>
                  <input value={blankValue} onChange={e=>setBlankValue(e.target.value)}
                    onKeyDown={e=>{
                      if(e.key==="Enter"){
                        const ans=blankValue.trim(); const correct=(currentQ as any).correct
                        if(ans===correct||ans.includes(correct)||correct.includes(ans)) handleCorrect()
                        else handleWrong()
                      }
                    }}
                    placeholder="اكتب الإجابة هنا..."
                    style={{width:"100%",padding:"14px",borderRadius:"10px",border:`2px solid ${currentQ.color}60`,
                      fontSize:"16px",fontFamily:"Arial",direction:"rtl",marginBottom:"12px",outline:"none",background:"#f9fafb"}}/>
                  <button onClick={()=>{
                    const ans=blankValue.trim(); const correct=(currentQ as any).correct
                    if(ans===correct||ans.includes(correct)||correct.includes(ans)) handleCorrect()
                    else handleWrong()
                  }} style={{background:currentQ.color,color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px"}}>
                    تأكيد ✓
                  </button>
                </div>
              )}

              {currentQ.type==="order" && (
                <div>
                  <p style={{fontSize:"13px",color:"#6b7280",marginBottom:"8px"}}>اضغط على الكلمات بالترتيب الصحيح:</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"12px"}}>
                    {shuffledWords.map((word,i)=>(
                      <button key={i} onClick={()=>{
                        if(orderSelected.includes(word)) setOrderSelected(prev=>prev.filter(w=>w!==word))
                        else setOrderSelected(prev=>[...prev,word])
                      }} style={{padding:"10px 18px",borderRadius:"8px",
                        border:`2px solid ${orderSelected.includes(word)?currentQ.color:"#e5e7eb"}`,
                        background:orderSelected.includes(word)?currentQ.color:"white",
                        color:orderSelected.includes(word)?"white":"#1e293b",
                        cursor:"pointer",fontWeight:"bold",fontSize:"15px",transition:"all 0.2s"}}>
                        {word}
                      </button>
                    ))}
                  </div>
                  {orderSelected.length>0 && (
                    <div style={{border:"1px dashed #9ca3af",borderRadius:"10px",padding:"12px",marginBottom:"12px",display:"flex",flexWrap:"wrap",gap:"6px",minHeight:"48px"}}>
                      {orderSelected.map((w,i)=>(
                        <span key={i} style={{background:"#dbeafe",color:"#1d4ed8",padding:"6px 14px",borderRadius:"6px",fontWeight:"bold",fontSize:"14px"}}>{w}</span>
                      ))}
                    </div>
                  )}
                  <div style={{display:"flex",gap:"10px"}}>
                    <button onClick={()=>{
                      const correct=(currentQ as any).correct as string[]
                      if(JSON.stringify(orderSelected)===JSON.stringify(correct)) handleCorrect()
                      else{handleWrong();setOrderSelected([])}
                    }} style={{background:currentQ.color,color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px"}}>
                      تأكيد ✓
                    </button>
                    <button onClick={()=>setOrderSelected([])}
                      style={{background:"#f3f4f6",color:"#6b7280",border:"none",padding:"12px 20px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px"}}>
                      مسح 🗑️
                    </button>
                  </div>
                </div>
              )}

              {showHint && (
                <div style={{marginTop:"16px",background:"#fef9c3",border:"1px solid #fbbf24",borderRadius:"10px",padding:"12px",fontSize:"14px",color:"#92400e"}}>
                  💡 {(currentQ as any).hint}
                </div>
              )}

              {qAnswers[currentQ.id]?.correct && (
                <div style={{marginTop:"16px",background:"#f0fdf4",border:"1px solid #86efac",borderRadius:"10px",padding:"12px",textAlign:"center",fontSize:"16px",color:"#15803d",fontWeight:"bold"}}>
                  🎉 أحسنت! إجابة صحيحة!
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{background:"white",borderRadius:"16px",padding:"32px",boxShadow:"0 4px 16px rgba(0,0,0,0.08)",textAlign:"center"}}>
            {(()=>{
              const correct=Object.values(qAnswers).filter((a:any)=>a.correct).length
              const score=Math.round((correct/totalQ)*100)
              return (
                <>
                  <div style={{fontSize:"64px",marginBottom:"12px"}}>{score===100?"🏆":score>=75?"🌟":score>=50?"👍":"💪"}</div>
                  <h3 style={{color:score>=60?"#16a34a":"#dc2626",fontSize:"28px",fontWeight:"bold",marginBottom:"8px"}}>
                    {correct} / {totalQ} إجابة صحيحة
                  </h3>
                  <div style={{background:"#f3f4f6",borderRadius:"12px",padding:"12px",marginBottom:"16px",display:"inline-block"}}>
                    <span style={{fontSize:"24px",fontWeight:"bold",color:score>=60?"#16a34a":"#dc2626"}}>{score}</span>
                    <span style={{color:"#6b7280",fontSize:"16px"}}> / 100 نقطة</span>
                  </div>
                  <p style={{color:"#6b7280",fontSize:"16px",marginBottom:"24px"}}>
                    {score===100?"ممتاز! أنت نجم الفصل! 🌟":score>=75?"جيد جداً! استمر في التقدم! 👍":score>=50?"جيد! حاول مرة أخرى 💪":"لا بأس! التكرار طريق النجاح 📚"}
                  </p>
                  <div style={{display:"flex",gap:"12px",justifyContent:"center"}}>
                    <button onClick={restartLesson}
                      style={{background:"#2563eb",color:"white",border:"none",padding:"14px 24px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px"}}>
                      🔄 إعادة بترتيب جديد
                    </button>
                    <a href={`/levels/primary/${year}/unit/${unit}`}>
                      <button style={{background:"#6b7280",color:"white",border:"none",padding:"14px 24px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px"}}>
                        العودة
                      </button>
                    </a>
                  </div>
                </>
              )
            })()}
          </div>
        )}
      </div>
    </main>
  )
}
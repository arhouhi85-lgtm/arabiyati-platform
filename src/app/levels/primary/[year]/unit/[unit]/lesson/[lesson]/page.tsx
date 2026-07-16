'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { readingTexts, ReadingText } from '@/lib/readingTexts'

const subjectBadges: {[key:string]:{name:string,icon:string,color:string,min:number}} = {
  "1":{name:"قارئ متميز",icon:"📖",color:"#2563eb",min:50},
  "2":{name:"نجم الصرف",icon:"⭐",color:"#ca8a04",min:50},
  "3":{name:"بطل التراكيب",icon:"🏆",color:"#16a34a",min:50},
  "4":{name:"خبير الإملاء",icon:"✏️",color:"#9333ea",min:50},
  "5":{name:"متفوق المستوى",icon:"🌟",color:"#ec4899",min:50},
  "6":{name:"أستاذ اللغة",icon:"👑",color:"#f97316",min:50},
}

const yearNames: {[key:string]:string} = {"1":"الأولى","2":"الثانية","3":"الثالثة","4":"الرابعة","5":"الخامسة","6":"السادسة"}
const unitNames: {[key:string]:string} = {"1":"الأولى","2":"الثانية","3":"الثالثة","4":"الرابعة","5":"الخامسة","6":"السادسة"}
const lessonNames: {[key:string]:string} = {"1":"القراءة","2":"الصرف","3":"التراكيب","4":"الإملاء","5":"التعبير الكتابي","6":"التواصل الشفهي"}
const lessonColors: {[key:string]:string} = {"1":"#2563eb","2":"#16a34a","3":"#9333ea","4":"#ea580c","5":"#0891b2","6":"#be185d"}

// شريط إمكانية الوصول الشامل
function AccessibilityBar({settings, setSettings}: any) {
  const toggle = (key: string) => setSettings((prev: any) => ({...prev, [key]: !prev[key]}))
  const buttons = [
    { key: "bigText", icon: "🔍", label: "قراءة مريحة" },
    { key: "highContrast", icon: "🌗", label: "إضاءة مريحة" },
    { key: "readAloud", icon: "🔊", label: "استمع للأسئلة" },
  ]
  return (
    <div style={{
      display:"flex", gap:"8px", justifyContent:"center", flexWrap:"wrap",
      background: settings.highContrast ? "#000" : "white",
      padding:"10px 16px", borderRadius:"12px", marginBottom:"16px",
      boxShadow:"0 2px 10px rgba(0,0,0,0.08)"
    }}>
      {buttons.map(b => (
        <button key={b.key} onClick={()=>toggle(b.key)}
          aria-label={b.label}
          style={{
            display:"flex", alignItems:"center", gap:"6px",
            padding:"8px 14px", borderRadius:"10px", cursor:"pointer",
            border: settings[b.key] ? "2px solid #2563eb" : "2px solid #e5e7eb",
            background: settings[b.key] ? "#dbeafe" : (settings.highContrast ? "#1f2937" : "#f9fafb"),
            color: settings[b.key] ? "#1e40af" : (settings.highContrast ? "#f3f4f6" : "#374151"),
            fontWeight:"bold", fontSize: settings.bigText ? "16px" : "14px",
            transition:"all 0.2s"
          }}>
          <span style={{fontSize:"18px"}}>{b.icon}</span>
          <span>{b.label}</span>
        </button>
      ))}
    </div>
  )
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

function formatTime(s: number) { return `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}` }

// عارض النص: مع مشغّل صوتي إن وُجد ملف صوتي، أو نص فقط إن لم يوجد
function TextReader({text, textColor, fontSize, highContrast}: {text: ReadingText, textColor?: string, fontSize?: string, highContrast?: boolean}) {
  const audioRef = useRef<HTMLAudioElement|null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [activePara, setActivePara] = useState(-1)
  const intervalRef = useRef<any>(null)

  const hasAudio = !!text.audio
  const AUDIO_START = text.audio?.start ?? 0
  const AUDIO_END = text.audio?.end ?? 0
  const AUDIO_DURATION = AUDIO_END - AUDIO_START

  const play = () => {
    if(!audioRef.current) return
    if(audioRef.current.currentTime < AUDIO_START || audioRef.current.currentTime >= AUDIO_END)
      audioRef.current.currentTime = AUDIO_START
    audioRef.current.play(); setIsPlaying(true)
    intervalRef.current = setInterval(()=>{
      if(!audioRef.current) return
      const t = audioRef.current.currentTime
      if(t >= AUDIO_END){ pause(); return }
      const e = t - AUDIO_START; const ratio = e / AUDIO_DURATION
      setElapsed(e)
      setActivePara(text.paragraphs.findIndex(p => ratio >= p.start && ratio < p.end))
    }, 100)
  }
  const pause = () => { audioRef.current?.pause(); setIsPlaying(false); if(intervalRef.current) clearInterval(intervalRef.current) }
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if(!audioRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = AUDIO_START + ratio * AUDIO_DURATION
    setElapsed(ratio * AUDIO_DURATION)
  }
  useEffect(()=>()=>{if(intervalRef.current) clearInterval(intervalRef.current)},[])

  return (
    <div>
      {hasAudio && <audio ref={audioRef} src={text.audio!.src} preload="auto"/>}
      <div style={{marginBottom: hasAudio ? "20px" : "0"}}>
        {text.paragraphs.map((p, i) => (
          <div key={i} style={{background: activePara === i ? "#fef9c3" : "transparent",borderRadius:"8px",
            padding: activePara === i ? "10px 14px" : "4px 0",marginBottom:"10px",
            borderRight: activePara === i ? "4px solid #2563eb" : "4px solid transparent",transition:"all 0.3s"}}>
            {(p as any).isPoem ? (
              <p style={{color: highContrast ? "#fbbf24" : "#1e3a8a",fontSize: fontSize || "16px",fontWeight:"bold",textAlign:"center",fontStyle:"italic",margin:0}}>{p.text}</p>
            ) : (
              <p style={{color: activePara===i ? (highContrast ? "#fbbf24" : "#1e3a8a") : (textColor || "#1e293b"),fontSize: fontSize || "16px",lineHeight:"2.6",
                textAlign:"justify",margin:0,fontWeight: activePara===i ? "bold" : "normal"}}>
                {typeof p.num === 'number' && (
                  <span style={{background:"#2563eb",color:"white",borderRadius:"50%",width:"22px",height:"22px",
                    display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:"12px",marginLeft:"8px"}}>{p.num}</span>
                )}
                {p.text}
              </p>
            )}
          </div>
        ))}
      </div>
      {hasAudio && (
        <div style={{background:"#f8fafc",borderRadius:"14px",padding:"16px",border:"1px solid #e2e8f0"}}>
          <div onClick={seek} style={{background:"#e2e8f0",borderRadius:"100px",height:"10px",marginBottom:"10px",cursor:"pointer",position:"relative"}}>
            <div style={{background:"linear-gradient(90deg,#2563eb,#1e3a8a)",borderRadius:"100px",height:"10px",
              width:`${Math.min((elapsed/AUDIO_DURATION)*100,100)}%`,transition:"width 0.1s",position:"relative"}}>
              <div style={{position:"absolute",left:"-7px",top:"-3px",width:"16px",height:"16px",borderRadius:"50%",
                background:"#2563eb",boxShadow:"0 2px 6px rgba(37,99,235,0.5)"}}/>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",color:"#6b7280",marginBottom:"12px"}}>
            <span>{formatTime(elapsed)}</span><span>{formatTime(AUDIO_DURATION)}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"10px"}}>
            <button onClick={()=>{if(audioRef.current){audioRef.current.currentTime=AUDIO_START;setElapsed(0);setActivePara(-1)}}}
              style={{background:"#f1f5f9",border:"none",borderRadius:"50%",width:"38px",height:"38px",cursor:"pointer",fontSize:"16px"}}>⏮️</button>
            <button onClick={()=>{if(audioRef.current){const t=Math.max(AUDIO_START,audioRef.current.currentTime-10);audioRef.current.currentTime=t;setElapsed(t-AUDIO_START)}}}
              style={{background:"#f1f5f9",border:"none",borderRadius:"50%",width:"38px",height:"38px",cursor:"pointer",fontSize:"13px",fontWeight:"bold",color:"#374151"}}>-10</button>
            <button onClick={isPlaying ? pause : play}
              style={{background:"linear-gradient(135deg,#2563eb,#1e3a8a)",border:"none",borderRadius:"50%",width:"54px",height:"54px",
                cursor:"pointer",fontSize:"22px",color:"white",boxShadow:"0 4px 14px rgba(37,99,235,0.4)"}}>{isPlaying ? "⏸️" : "▶️"}</button>
            <button onClick={()=>{if(audioRef.current){const t=Math.min(AUDIO_END,audioRef.current.currentTime+10);audioRef.current.currentTime=t;setElapsed(t-AUDIO_START)}}}
              style={{background:"#f1f5f9",border:"none",borderRadius:"50%",width:"38px",height:"38px",cursor:"pointer",fontSize:"13px",fontWeight:"bold",color:"#374151"}}>+10</button>
            <button onClick={()=>{pause();if(audioRef.current){audioRef.current.currentTime=AUDIO_START;setElapsed(0);setActivePara(-1)}}}
              style={{background:"#f1f5f9",border:"none",borderRadius:"50%",width:"38px",height:"38px",cursor:"pointer",fontSize:"16px"}}>⏹️</button>
          </div>
          {isPlaying && (
            <div style={{display:"flex",justifyContent:"center",gap:"3px",marginTop:"10px",alignItems:"center"}}>
              {[0,1,2,3].map(i=>(<div key={i} style={{width:"4px",borderRadius:"2px",background:"#2563eb",
                animation:"wave 0.8s ease-in-out infinite",animationDelay:`${i*0.15}s`,height:"16px"}}/>))}
              <style>{`@keyframes wave{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1.2)}}`}</style>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MatchQuestion({q, onCorrect, onWrong}: any) {
  const [selected, setSelected] = useState<{[key:string]:string}>({})
  const [checked, setChecked] = useState(false)
  const answers = [...new Set(q.pairs.map((p: any) => p.answer))] as string[]

  const allFilled = q.pairs.every((p: any) => selected[p.item] && selected[p.item] !== "")

  const handleCheck = () => {
    setChecked(true)
    const allCorrect = q.pairs.every((p: any) => selected[p.item] === p.answer)
    if(allCorrect) onCorrect()
    else { onWrong(); setTimeout(()=>{setChecked(false); setSelected({})}, 1500) }
  }

  return (
    <div>
      {q.pairs.map((p: any) => (
        <div key={p.item} style={{marginBottom:"10px",display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{flex:1,background:"#f0f9ff",border:"1px solid #bfdbfe",borderRadius:"8px",
            padding:"10px 12px",fontSize:"14px",fontWeight:"bold",color:"#1e40af"}}>{p.item}</div>
          <span style={{color:"#9ca3af"}}>←</span>
          <select
            value={selected[p.item] || ""}
            onChange={e=>setSelected(prev=>({...prev,[p.item]:e.target.value}))}
            disabled={checked}
            style={{flex:1,padding:"10px",borderRadius:"8px",
              border:`2px solid ${checked?(selected[p.item]===p.answer?"#22c55e":"#ef4444"):"#e5e7eb"}`,
              fontSize:"13px",background:checked?(selected[p.item]===p.answer?"#f0fdf4":"#fee2e2"):"white",
              direction:"rtl",cursor:"pointer"}}>
            <option value="">-- اختر --</option>
            {answers.map((a:string) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      ))}
      {!checked && (
        <button onClick={handleCheck} disabled={!allFilled}
          style={{background:q.color,color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",
            cursor:allFilled?"pointer":"not-allowed",fontWeight:"bold",fontSize:"15px",opacity:allFilled ? 1 : 0.5}}>
          تأكيد ✓
        </button>
      )}
    </div>
  )
}

function MultiQuestion({q, onCorrect, onWrong}: any) {
  const [selected, setSelected] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [opts] = useState(() => [...q.options].sort(() => Math.random() - 0.5))

  const toggle = (opt: string) => {
    if(checked) return
    setSelected(prev => prev.includes(opt) ? prev.filter(o=>o!==opt) : [...prev, opt])
  }

  const handleCheck = () => {
    setChecked(true)
    const correct = q.correct as string[]
    const isCorrect = selected.length===correct.length && selected.every(s=>correct.includes(s))
    if(isCorrect) onCorrect()
    else { onWrong(); setTimeout(()=>{setChecked(false)}, 1500) }
  }

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"14px"}}>
        {opts.map((opt:string)=>{
          const isSel = selected.includes(opt)
          const correct = (q.correct as string[]).includes(opt)
          return (
            <button key={opt} onClick={()=>toggle(opt)}
              style={{padding:"12px",borderRadius:"10px",cursor:checked?"default":"pointer",fontWeight:"bold",
                fontSize:"14px",textAlign:"right",
                border:`2px solid ${checked?(correct?"#22c55e":isSel?"#ef4444":"#e5e7eb"):(isSel?q.color:"#e5e7eb")}`,
                background:checked?(correct?"#dcfce7":isSel?"#fee2e2":"white"):(isSel?q.color+"15":"white"),
                color:"#1e293b"}}>
              {isSel && !checked && "☑️ "}{opt}
            </button>
          )
        })}
      </div>
      {!checked && (
        <button onClick={handleCheck} disabled={selected.length===0}
          style={{background:q.color,color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",
            cursor:"pointer",fontWeight:"bold",fontSize:"15px",opacity:selected.length===0?0.5:1}}>
          تأكيد ✓
        </button>
      )}
    </div>
  )
}

function OpenQuestion({q, onDone}: any) {
  const [text, setText] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const canSubmit = text.trim().length >= 3

  return (
    <div>
      <textarea value={text} onChange={e=>setText(e.target.value)} disabled={submitted}
        placeholder="اكتب إجابتك هنا بحرية..." rows={3}
        style={{width:"100%",padding:"14px",borderRadius:"10px",border:`2px solid ${q.color}40`,
          fontSize:"15px",fontFamily:"Arial",direction:"rtl",marginBottom:"12px",outline:"none",
          background:"#f9fafb",resize:"vertical"}}/>
      {!submitted && (
        <button
          onClick={()=>{ if(!canSubmit) return; setSubmitted(true); setTimeout(onDone, 1500) }}
          style={{background:q.color,color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",
            cursor: canSubmit ? "pointer" : "not-allowed",fontWeight:"bold",fontSize:"15px",
            opacity: canSubmit ? 1 : 0.5, display:"inline-block"}}>
          إنهاء ✓
        </button>
      )}
      {submitted && (
        <div style={{background:"#f0f9ff",border:"1px solid #bfdbfe",borderRadius:"10px",padding:"12px",fontSize:"13px",color:"#1e40af"}}>
          💡 {q.sample}
        </div>
      )}
    </div>
  )
}

// ================= مكوّن الدرس التفاعلي (لأي نص) =================
function LessonContent({text, year, unit, lesson, onBackToSelection, showBackToSelection}: {
  text: ReadingText, year: string, unit: string, lesson: string,
  onBackToSelection: () => void, showBackToSelection: boolean
}) {
  const questions = text.questions
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
  const [shuffledOpts, setShuffledOpts] = useState<string[]>([])
  const [a11y, setA11y] = useState({bigText:false, highContrast:false, readAloud:false})

  const color = lessonColors[lesson] || "#2563eb"
  const bgMain = a11y.highContrast ? "#000000" : "linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)"
  const cardBg = a11y.highContrast ? "#111827" : "white"
  const textColor = a11y.highContrast ? "#f9fafb" : "#1e293b"
  const fontSize = a11y.bigText ? "20px" : "17px"
  const questionFontSize = a11y.bigText ? "20px" : "17px"
  const currentQ = questions[currentIdx]
  const totalQ = questions.length

  useEffect(() => {
    if(currentQ?.type==="order") setShuffledWords([...(currentQ as any).words].sort(()=>Math.random()-0.5))
    if(currentQ?.type==="mcq" || currentQ?.type==="multi") setShuffledOpts([...(currentQ as any).options].sort(()=>Math.random()-0.5))
    setBlankValue(""); setOrderSelected([]); setShowHint(false)
  }, [currentIdx, currentQ])

  useEffect(() => {
    if(a11y.readAloud && currentQ) {
      const u = new SpeechSynthesisUtterance(currentQ.question)
      u.lang = 'ar'
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    }
  }, [currentIdx, a11y.readAloud])

  const handleCorrect = () => {
    playClap(); setCorrectFlash(true); setTimeout(()=>setCorrectFlash(false), 800)
    const newAnswers = {...qAnswers, [currentQ.id]:{correct:true,attempts:(qAnswers[currentQ.id]?.attempts||0)+1}}
    setQAnswers(newAnswers)
    setTimeout(()=>{
      if(currentIdx < totalQ-1) setCurrentIdx(i=>i+1)
      else finishLesson(newAnswers)
    }, 1200)
  }

  const handleWrong = () => {
    setWrongFlash(true); setTimeout(()=>setWrongFlash(false), 600)
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
            lesson:`السنة ${yearNames[year]} - الوحدة ${unitNames[unit]} - ${subjectName} (${text.title})`})
          setSavedPoints(true)
          const badge = subjectBadges[lesson]
          if(badge && oldTotal<badge.min && newTotal>=badge.min) setNewBadge(badge)
        }
      } catch(e){console.error(e)}
    }
  }

  const restartLesson = () => {
    setCurrentIdx(0); setQAnswers({}); setOrderSelected([]); setBlankValue("")
    setShowHint(false); setFinished(false); setShowStars(false); setSavedPoints(false)
  }

  return (
    <main dir="rtl" style={{minHeight:"100vh",background:bgMain,fontFamily:"Arial",transition:"background 0.3s"}}>
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

      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.08)",flexWrap:"wrap",gap:"8px"}}>
        <h1 style={{color:color,fontSize:"22px",fontWeight:"bold",margin:0}}>📖 القراءة — {text.title}</h1>
        <div style={{display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
          <span style={{background:"#fef9c3",color:"#ca8a04",padding:"6px 14px",borderRadius:"20px",fontWeight:"bold",fontSize:"14px"}}>السنة {yearNames[year]} — الوحدة {unitNames[unit]}</span>
          {showBackToSelection && (
            <button onClick={onBackToSelection} style={{color:"#1e40af",background:"#dbeafe",border:"none",fontWeight:"bold",padding:"8px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"14px"}}>📚 نص آخر</button>
          )}
          <a href={`/levels/primary/${year}/unit/${unit}`} style={{color:"#6b7280",textDecoration:"none",fontWeight:"bold",background:"#f3f4f6",padding:"8px 14px",borderRadius:"8px"}}>رجوع</a>
        </div>
      </nav>

      <div style={{maxWidth:"900px",margin:"0 auto",padding:"24px"}}>
        <AccessibilityBar settings={a11y} setSettings={setA11y} />
        {text.images.length > 0 && (
          <div style={{display:"grid",gridTemplateColumns:`repeat(${text.images.length},1fr)`,gap:"12px",marginBottom:"20px"}}>
            {text.images.map((img,i)=>(
              <div key={i} style={{borderRadius:"12px",overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.12)"}}>
                <img src={img.src} alt={img.label} style={{width:"100%",height:"120px",objectFit:"cover",display:"block"}}/>
                <div style={{background:"rgba(30,58,138,0.85)",color:"white",padding:"6px 10px",fontSize:"12px",textAlign:"center",fontWeight:"bold"}}>{img.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{background:cardBg,borderRadius:"16px",padding:"24px",marginBottom:"20px",borderRight:`5px solid ${color}`,boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
          <h2 style={{color: a11y.highContrast ? "#fbbf24" : "#1e3a8a",fontSize: a11y.bigText ? "26px" : "22px",fontWeight:"bold",marginBottom:"4px",textAlign:"center"}}>{text.title}</h2>
          <p style={{color: a11y.highContrast ? "#d1d5db" : "#6b7280",textAlign:"center",marginBottom:"20px",fontSize:"13px"}}>السنة {yearNames[year]} ابتدائي — الوحدة {unitNames[unit]} — {text.subtitle}</p>
          <TextReader text={text} textColor={textColor} fontSize={fontSize} highContrast={a11y.highContrast} />
        </div>

        {!finished ? (
          <div style={{background:cardBg,borderRadius:"16px",padding:"24px",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px",flexWrap:"wrap",gap:"8px"}}>
              <div>
                <span style={{background:currentQ.color,color:"white",padding:"4px 14px",borderRadius:"20px",fontSize:"13px",fontWeight:"bold"}}>{(currentQ as any).section}</span>
                <span style={{marginRight:"10px",fontWeight:"bold",color:"#1e3a8a",fontSize:"15px"}}>السؤال {currentIdx+1} من {totalQ}</span>
              </div>
              <span style={{background:"#f0fdf4",color:"#16a34a",padding:"4px 12px",borderRadius:"20px",fontWeight:"bold",fontSize:"13px"}}>
                ✅ {Object.values(qAnswers).filter((a:any)=>a.correct).length} صحيح
              </span>
            </div>
            <div style={{background:"#e5e7eb",borderRadius:"100px",height:"8px",marginBottom:"20px"}}>
              <div style={{background:`linear-gradient(90deg,${color},#1e3a8a)`,borderRadius:"100px",height:"8px",width:`${Math.round((currentIdx/totalQ)*100)}%`,transition:"width 0.5s"}}/>
            </div>

            <div style={{padding:"20px",border:`2px solid ${correctFlash?"#22c55e":wrongFlash?"#ef4444":currentQ.color+"40"}`,
              borderRadius:"16px",background:correctFlash?"#f0fdf4":wrongFlash?"#fef2f2":"white",transition:"all 0.3s"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px"}}>
                <span style={{fontSize:"22px"}}>{currentQ.icon}</span>
                <span style={{background:currentQ.color+"20",color:currentQ.color,padding:"3px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"bold"}}>
                  {currentQ.type==="mcq"?"اختيار من متعدد":currentQ.type==="multi"?"اختيار متعدد الإجابات":currentQ.type==="blank"?"ملء الفراغ":currentQ.type==="match"?"وصل":currentQ.type==="open"?"كتابة حرة":"ترتيب الكلمات"}
                </span>
              </div>
              <p style={{color:textColor,fontSize:questionFontSize,fontWeight:"bold",marginBottom:"16px",lineHeight:"1.8"}}>{currentQ.question}</p>

              {currentQ.type==="mcq" && (
                <div style={{display:"grid",gridTemplateColumns:"1fr",gap:"10px"}}>
                  {shuffledOpts.map((opt:string)=>(
                    <button key={opt} onClick={()=>{
                      if(qAnswers[currentQ.id]?.correct) return
                      if(opt===(currentQ as any).correct) handleCorrect(); else handleWrong()
                    }} style={{padding:"14px 18px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px",textAlign:"right",border:`2px solid ${currentQ.color}40`,background:"white",color:"#1e293b"}}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type==="multi" && <MultiQuestion key={currentQ.id} q={currentQ} onCorrect={handleCorrect} onWrong={handleWrong}/>}
              {currentQ.type==="match" && <MatchQuestion key={currentQ.id} q={currentQ} onCorrect={handleCorrect} onWrong={handleWrong}/>}
              {currentQ.type==="open" && <OpenQuestion key={currentQ.id} q={currentQ} onDone={handleCorrect}/>}

              {currentQ.type==="blank" && (
                <div>
                  <input value={blankValue} onChange={e=>setBlankValue(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter"){ const ans=blankValue.trim(); const correct=(currentQ as any).correct
                      if(ans===correct||correct.includes(ans)) handleCorrect(); else handleWrong() }}}
                    placeholder="اكتب الإجابة هنا..."
                    style={{width:"100%",padding:"14px",borderRadius:"10px",border:`2px solid ${currentQ.color}60`,fontSize:"16px",fontFamily:"Arial",direction:"rtl",marginBottom:"12px",outline:"none",background:"#f9fafb"}}/>
                  <button onClick={()=>{ const ans=blankValue.trim(); const correct=(currentQ as any).correct
                    if(ans===correct||correct.includes(ans)) handleCorrect(); else handleWrong() }}
                    style={{background:currentQ.color,color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px"}}>تأكيد ✓</button>
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
                      }} style={{padding:"10px 18px",borderRadius:"8px",border:`2px solid ${orderSelected.includes(word)?currentQ.color:"#e5e7eb"}`,
                        background:orderSelected.includes(word)?currentQ.color:"white",color:orderSelected.includes(word)?"white":"#1e293b",cursor:"pointer",fontWeight:"bold",fontSize:"15px"}}>
                        {word}
                      </button>
                    ))}
                  </div>
                  {orderSelected.length>0 && (
                    <div style={{border:"1px dashed #9ca3af",borderRadius:"10px",padding:"12px",marginBottom:"12px",display:"flex",flexWrap:"wrap",gap:"6px",minHeight:"48px"}}>
                      {orderSelected.map((w,i)=>(<span key={i} style={{background:"#dbeafe",color:"#1d4ed8",padding:"6px 14px",borderRadius:"6px",fontWeight:"bold",fontSize:"14px"}}>{w}</span>))}
                    </div>
                  )}
                  <div style={{display:"flex",gap:"10px"}}>
                    <button onClick={()=>{
                      const correct=(currentQ as any).correct as string[]
                      if(JSON.stringify(orderSelected)===JSON.stringify(correct)) handleCorrect()
                      else{handleWrong();setOrderSelected([])}
                    }} style={{background:currentQ.color,color:"white",border:"none",padding:"12px 28px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px"}}>تأكيد ✓</button>
                    <button onClick={()=>setOrderSelected([])} style={{background:"#f3f4f6",color:"#6b7280",border:"none",padding:"12px 20px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px"}}>مسح 🗑️</button>
                  </div>
                </div>
              )}

              {showHint && currentQ.type!=="open" && (
                <div style={{marginTop:"16px",background:"#fef9c3",border:"1px solid #fbbf24",borderRadius:"10px",padding:"12px",fontSize:"14px",color:"#92400e"}}>
                  💡 {(currentQ as any).hint}
                </div>
              )}

              {qAnswers[currentQ.id]?.correct && currentQ.type!=="open" && (
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
                  <h3 style={{color:score>=60?"#16a34a":"#dc2626",fontSize:"28px",fontWeight:"bold",marginBottom:"8px"}}>{correct} / {totalQ} نشاط مكتمل</h3>
                  <div style={{background:"#f3f4f6",borderRadius:"12px",padding:"12px",marginBottom:"16px",display:"inline-block"}}>
                    <span style={{fontSize:"24px",fontWeight:"bold",color:score>=60?"#16a34a":"#dc2626"}}>{score}</span>
                    <span style={{color:"#6b7280",fontSize:"16px"}}> / 100 نقطة</span>
                  </div>
                  <p style={{color:"#6b7280",fontSize:"16px",marginBottom:"24px"}}>
                    {score===100?`ممتاز! أكملت كل الأنشطة الـ ${totalQ}! 🌟`:"جيد! استمر في التقدم! 👍"}
                  </p>
                  <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
                    <button onClick={restartLesson} style={{background:"#2563eb",color:"white",border:"none",padding:"14px 24px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px"}}>🔄 إعادة المحاولة</button>
                    {showBackToSelection && (
                      <button onClick={onBackToSelection} style={{background:"#16a34a",color:"white",border:"none",padding:"14px 24px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px"}}>📚 نص آخر</button>
                    )}
                    <a href={`/levels/primary/${year}/unit/${unit}`}>
                      <button style={{background:"#6b7280",color:"white",border:"none",padding:"14px 24px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px"}}>العودة</button>
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

// ================= الصفحة الرئيسية للدرس =================
export default function LessonPage() {
  const params = useParams()
  const year = params.year as string
  const unit = params.unit as string
  const lesson = params.lesson as string

  const [mounted, setMounted] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  // نصوص القراءة متاحة فقط لمكوّن القراءة (lesson = 1)
  const texts: ReadingText[] = lesson === "1" ? (readingTexts[`${year}-${unit}`] || []) : []
  const selectedText = texts.find(t => t.id === selectedId) || null
  const color = lessonColors[lesson] || "#2563eb"

  if(!mounted) return (
    <div dir="rtl" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial"}}>
      <p style={{fontSize:"20px",color:"#6b7280"}}>جارٍ التحميل...</p>
    </div>
  )

  // لا توجد نصوص لهذا الدرس بعد
  if(texts.length === 0) return (
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

  // نص واحد فقط: ادخل مباشرة بدون شاشة اختيار
  if(texts.length === 1) return (
    <LessonContent key={texts[0].id} text={texts[0]} year={year} unit={unit} lesson={lesson}
      onBackToSelection={()=>{}} showBackToSelection={false} />
  )

  // تم اختيار نص: اعرض الدرس التفاعلي
  if(selectedText) return (
    <LessonContent key={selectedText.id} text={selectedText} year={year} unit={unit} lesson={lesson}
      onBackToSelection={()=>setSelectedId(null)} showBackToSelection={true} />
  )

  // شاشة اختيار النص
  return (
    <main dir="rtl" style={{minHeight:"100vh",background:"linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)",fontFamily:"Arial"}}>
      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
        <h1 style={{color:color,fontSize:"22px",fontWeight:"bold",margin:0}}>📖 القراءة — اختر النص</h1>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{background:"#fef9c3",color:"#ca8a04",padding:"6px 14px",borderRadius:"20px",fontWeight:"bold",fontSize:"14px"}}>السنة {yearNames[year]} — الوحدة {unitNames[unit]}</span>
          <a href={`/levels/primary/${year}/unit/${unit}`} style={{color:"#6b7280",textDecoration:"none",fontWeight:"bold",background:"#f3f4f6",padding:"8px 14px",borderRadius:"8px"}}>رجوع</a>
        </div>
      </nav>

      <div style={{maxWidth:"900px",margin:"0 auto",padding:"32px 24px"}}>
        <h2 style={{color:"#1e3a8a",fontSize:"24px",fontWeight:"bold",textAlign:"center",marginBottom:"8px"}}>📚 نصوص القراءة المتاحة</h2>
        <p style={{color:"#6b7280",textAlign:"center",marginBottom:"28px",fontSize:"15px"}}>اختر النص الذي تريد قراءته والتفاعل مع أنشطته</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"20px"}}>
          {texts.map(t => (
            <div key={t.id} style={{background:"white",borderRadius:"16px",overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.1)",display:"flex",flexDirection:"column"}}>
              {t.images[0] && (
                <img src={t.images[0].src} alt={t.title} style={{width:"100%",height:"150px",objectFit:"cover",display:"block"}}/>
              )}
              <div style={{padding:"20px",display:"flex",flexDirection:"column",flex:1}}>
                <h3 style={{color:"#1e3a8a",fontSize:"20px",fontWeight:"bold",margin:"0 0 6px 0"}}>{t.title}</h3>
                <p style={{color:"#6b7280",fontSize:"13px",margin:"0 0 12px 0",flex:1}}>{t.subtitle}</p>
                <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"16px"}}>
                  <span style={{background:"#dbeafe",color:"#1e40af",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"bold"}}>✏️ {t.questions.length} نشاطاً</span>
                  {t.audio && <span style={{background:"#f0fdf4",color:"#16a34a",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"bold"}}>🎧 قراءة صوتية</span>}
                </div>
                <button onClick={()=>setSelectedId(t.id)}
                  style={{background:`linear-gradient(135deg,${color},#1e3a8a)`,color:"white",border:"none",padding:"14px",borderRadius:"10px",
                    cursor:"pointer",fontWeight:"bold",fontSize:"16px",width:"100%"}}>
                  ابدأ الدرس ←
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
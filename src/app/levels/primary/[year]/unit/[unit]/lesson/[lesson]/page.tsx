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

const AUDIO_START = 200
const AUDIO_END = 344
const AUDIO_DURATION = AUDIO_END - AUDIO_START

const paragraphs = [
  { num: 1, text: "كَانَ أَبِي فِي غُرْفَةِ الْجُلُوسِ حِينَ نَادَانِي قَائِلاً: «اِجْلِسِي يَا زَيْنَبُ بِقُرْبِي، وَتَابِعِي الْمَشَاهِدَ الَّتِي تَتَوَالَى عَلَى شَاشَةِ التِّلْفَازِ، وَأَنْصِتِي جَيِّداً لِمَا يَقُولُهُ الْمُذِيعُ.» كَانَتْ مَشَاهِدُ لِمَآثِرِ بِلادِي تَتَنَاوَبُ عَلَى الظُّهُورِ، وَالْمُذِيعُ يُعَلِّقُ وَيَقُولُ: «تَعْتَزُّ كُلُّ أُمَّةٍ بِمَآثِرِ أَجْدَادِهَا، تَصُونُهَا مِنَ التَّلَفِ وَتَحْفَظُهَا مِنَ الْعَبَثِ، وَتَعْرِضُهَا أَمَامَ الزُّوَّارِ مِنْ أَبْنَائِهَا لِيُشَاهِدُوا فِيهَا صُوَراً لِحَيَاةِ أَجْدَادِهِمْ، وَرُمُوزاً لِمَجْدِهِمْ وَحَضَارَتِهِمْ، وَدَلِيلاً نَاطِقاً بِعَظَمَتِهِمْ، وَلِتَكُونَ لِسَانَ حَالِهِمُ الَّذِي يُرَدِّدُ مَعَ الشَّاعِرِ:", start: 0, end: 0.28 },
  { num: "شعر", text: "تِلْكَ آثَارُنَا تَدُلُّ عَلَيْنَا — فَانْظُرُوا بَعْدَنَا إِلَى الآثَارِ", start: 0.28, end: 0.33, isPoem: true },
  { num: 2, text: "الْمَغْرِبُ مَلِيءٌ بِآثَارِ عِزِّهِ وَعَظَمَتِهِ، فَحَيْثُمَا وَلَّيْتَ وَجْهَكَ، وَجَدْتَ أَثَراً نَاطِقاً، وَفَنّاً خَالِداً، وَبُنْيَاناً شَامِخاً، يَشْهَدُ عَلَى ازْدِهَارِ حَضَارَةِ أَبْنَائِهِ، وَيَدُلُّ عَلَى مَبْلَغِ رُقِيِّهِمْ وَتَقَدُّمِهِمْ. فَإِذَا جُلْتَ فِي فَاسَ، وَقَصَدْتَ جَامِعَ الْقَرَوِيِّينَ بِهَا، أَوْ مَدْرَسَةَ «أَبِي عِنَانٍ»، أَوْ ضَرِيحَ مُؤَسِّسِ الْمَدِينَةِ الْمَوْلَى إِدْرِيسَ الأَزْهَرَ، فَسَتُشَاهِدُ الْفَنَّ فِي أَرْوَعِ صُوَرِهِ، وَتَقِفُ مُنْدَهِشاً أَمَامَ إِتْقَانِهِ وَمَهَارَةِ مُنْشِئِيهِ.", start: 0.33, end: 0.58 },
  { num: 3, text: "وَإِذَا دَخَلْتَ إِلَى قُصُورِ مَكْنَاسَ وَمَسَاجِدِهَا، أَوْ شَاهَدْتَ فِي مُرَّاكُشَ الْحَمْرَاءِ صَوْمَعَةَ الْكُتُبِيَّةِ وَقَصْرَ الْبَدِيعِ وَصِهْرِيجَ الْمَنَارَةِ، فَسَتَجِدُ فِيهَا مَا يَرْفَعُ رَأْسَكَ، وَيُحَفِّزُكَ عَلَى الاقْتِدَاءِ بِسِيرَةِ أُولَئِكَ الأَجْدَادِ الْعُظَمَاءِ. وَإِذَا انْتَقَلْتَ إِلَى الرِّبَاطِ، فَسَتَنْدَهِشُ وَأَنْتَ تَنْظُرُ إِلَى صَوْمَعَةِ حَسَّانَ الْمُنْتَصِبَةِ جَانِبَ ضَرِيحِ مُحَمَّدٍ الْخَامِسِ، يَشْهَدَانِ عَلَى مَجْدِ بَلَدِكَ وَعَظَمَتِهِ فِي الْمَاضِي وَالْحَاضِرِ. وَفِي الْعَاصِمَةِ الاقْتِصَادِيَّةِ الدَّارِ الْبَيْضَاءِ، سَتَتَوَقَّفُ طَوِيلاً أَمَامَ رَوْعَةِ مَسْجِدِ الْحَسَنِ الثَّانِي الَّذِي تُدَاعِبُهُ أَمْوَاجُ الْبَحْرِ، وَسَتَنْبَهِرُ بِزَخَارِفِهِ وَفُسَيْفِسَائِهِ، وَالْخَزَفِ الْمُلَوَّنِ عَلَى سَوَارِيهِ وَجُدْرَانِهِ، وَنُقُوشِهِ الْبَدِيعَةِ عَلَى الْجِبْسِ وَالْخَشَبِ.»", start: 0.58, end: 0.88 },
  { num: 4, text: "كُنْتُ أَوَدُّ أَنْ يَطُولَ الْبَرْنَامَجُ التِّلْفَازِيُّ، لأَنَّهُ شَيِّقٌ وَمُفِيدٌ، لَكِنْ سَرْعَانَ مَا قَالَ الْمُذِيعُ: «إِلَى اللِّقَاءِ فِي حَلْقَةٍ قَادِمَةٍ مَعَ مَآثِرَ أُخْرَى مِنْ بِلادِي.» — الْمُؤَلِّفُونَ", start: 0.88, end: 1 }
]

// كل الأنشطة الـ 12 من الكتاب بدون استثناء
const questions = [
  // أنمي معجمي - 1: وصل المعلمة بالمدينة
  { id:1, type:"match", color:"#16a34a", icon:"🔗", section:"أنمّي معجمي",
    question:"أصل كل معلمة باسم المدينة التي توجد بها:",
    pairs:[
      {item:"جامع القرويين", answer:"فاس"},
      {item:"قصر البديع", answer:"مراكش"},
      {item:"مسجد الحسن الثاني", answer:"الدار البيضاء"},
      {item:"ضريح محمد الخامس", answer:"الرباط"},
    ], hint:"راجع الصور في بداية الدرس 💡" },

  // أنمي معجمي - 2: شبكة مفردات (كتابة حرة)
  { id:2, type:"open", color:"#16a34a", icon:"✍️", section:"أنمّي معجمي",
    question:"أكمل شبكة مفردات كلمة «حضارة»: اكتب كلمتين مرتبطتين بها (مثل: صوامع):",
    sample:"أمثلة: مآثر، تاريخ، آثار، فن، معالم، تراث" },

  // أفهم - 3: اختيار من متعدد
  { id:3, type:"mcq", color:"#2563eb", icon:"🔵", section:"أفهم",
    question:"طلب الأب من ابنته الجلوس بجانبه لـ:",
    options:["متابعة حلقة جديدة من المسلسل","متابعة برنامج تلفزي","متابعة نشرة الأخبار"],
    correct:"متابعة برنامج تلفزي", hint:"ماذا كان يعرض التلفاز؟ 💡" },

  // أفهم - 4: إكمال الجدول (3 عناصر) - وصل
  { id:4, type:"match", color:"#9333ea", icon:"📋", section:"أفهم",
    question:"أصل كل أثر بوصفه المناسب من النص:",
    pairs:[
      {item:"صومعة حسان", answer:"منتصبة جانب ضريح محمد الخامس"},
      {item:"مسجد الحسن الثاني", answer:"تداعبه أمواج البحر"},
      {item:"جامع القرويين", answer:"شاهد على مهارة منشئيه"},
    ], hint:"راجع الفقرتين 2 و3 💡" },

  // أفهم - 5: ملء فراغ
  { id:5, type:"blank", color:"#9333ea", icon:"✏️", section:"أفهم",
    question:"أستخرج من النص ما يدل على إعجاب زينب ببرنامج «مآثر بلادي» (أكمل: كنت أود أن ___ البرنامج):",
    correct:"يطول", hint:"انظر الفقرة الأخيرة من النص 💡" },

  // أفهم - 6: سؤال مفتوح
  { id:6, type:"open", color:"#2563eb", icon:"✍️", section:"أفهم",
    question:"علام يدل تنوع مآثر المغرب؟",
    sample:"نموذج إجابة: يدل تنوع مآثر المغرب على عراقة حضارته وازدهارها عبر العصور، وعلى مهارة وإبداع أبنائه." },

  // أحلل - 7: عنوان الفقرة 1
  { id:7, type:"mcq", color:"#ea580c", icon:"📝", section:"أحلل",
    question:"اقترح عنواناً للفقرة الأولى:",
    options:["برنامج عن مآثر بلادي","رحلة إلى فاس","صومعة حسان","المدرسة"],
    correct:"برنامج عن مآثر بلادي", hint:"عن ماذا تتحدث الفقرة الأولى؟ 💡" },

  { id:8, type:"mcq", color:"#ea580c", icon:"📝", section:"أحلل",
    question:"اقترح عنواناً للفقرة الثانية:",
    options:["مآثر فاس","مآثر مراكش","مسجد الحسن الثاني","نهاية البرنامج"],
    correct:"مآثر فاس", hint:"عن أي مدينة تتحدث الفقرة الثانية؟ 💡" },

  { id:9, type:"mcq", color:"#ea580c", icon:"📝", section:"أحلل",
    question:"اقترح عنواناً للفقرة الثالثة:",
    options:["مآثر مكناس ومراكش والرباط والدار البيضاء","مآثر فاس فقط","المدرسة العتيقة","برنامج تلفزي"],
    correct:"مآثر مكناس ومراكش والرباط والدار البيضاء", hint:"كم مدينة ذكرت في الفقرة الثالثة؟ 💡" },

  { id:10, type:"mcq", color:"#ea580c", icon:"📝", section:"أحلل",
    question:"اقترح عنواناً للفقرة الرابعة:",
    options:["نهاية البرنامج","بداية القصة","وصف مسجد","وصف مدرسة"],
    correct:"نهاية البرنامج", hint:"ماذا حدث في آخر الفقرة؟ 💡" },

  // أحلل - 8: استخراج الآثار (اختيار متعدد - إجابات متعددة)
  { id:11, type:"multi", color:"#ea580c", icon:"☑️", section:"أحلل",
    question:"استخرج من النص الآثار التاريخية التي تبرز عظمة حضارة المغرب (اختر جميع الإجابات الصحيحة):",
    options:["جامع القرويين","مسجد الحسن الثاني","برج إيفل","صومعة حسان","تمثال الحرية","قصر البديع"],
    correct:["جامع القرويين","مسجد الحسن الثاني","صومعة حسان","قصر البديع"],
    hint:"كل الآثار المغربية المذكورة في النص 💡" },

  // أركب وأقوم - 9: عنوان آخر (مفتوح)
  { id:12, type:"open", color:"#be185d", icon:"✍️", section:"أركب وأقوّم",
    question:"اقترح عنواناً آخر للنص:",
    sample:"أمثلة: كنوز بلادي، رحلة في حضارة المغرب، مآثر خالدة" },

  // أركب وأقوم - 10: تلخيص (مفتوح)
  { id:13, type:"open", color:"#be185d", icon:"✍️", section:"أركب وأقوّم",
    question:"استعن بعناوين الفقرات لتلخص النص في جملتين:",
    sample:"نموذج: تحكي زينب عن برنامج تلفزي شاهدته مع والدها عن مآثر المغرب، حيث تجولا عبر الشاشة بين فاس ومراكش والرباط والدار البيضاء، مستمتعين بروعة الآثار التاريخية." },

  // أركب وأقوم - 11: الرأي (مفتوح)
  { id:14, type:"open", color:"#be185d", icon:"✍️", section:"أركب وأقوّم",
    question:"أبدِ رأيك في معلمة من معالم بلادك:",
    sample:"اكتب رأيك الشخصي بحرية عن أي معلمة تاريخية تعرفها" },

  // أركب وأقوم - ترتيب (تمرين إضافي تفاعلي)
  { id:15, type:"order", color:"#be185d", icon:"🔀", section:"أركب وأقوّم",
    question:"رتّب الكلمات لتكوّن جملة صحيحة من النص:",
    words:["أجدادها","بمآثر","كل أمة","تعتز"],
    correct:["تعتز","كل أمة","بمآثر","أجدادها"], hint:"ابدأ بالفعل 💡" },

  // أركب وأقوم - 12: مشروع شخصي (مفتوح)
  { id:16, type:"open", color:"#be185d", icon:"🏠", section:"في المنزل",
    question:"في المنزل: اكتب بأسلوبك الخاص ما تعلمته من هذا النص، لتستثمره في إعداد مشروعك:",
    sample:"هذا نشاط منزلي — اكتب إجابتك وشاركها مع أستاذك غداً" },
]

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
function shuffleArr<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

function AudioPlayer({textColor, fontSize, highContrast}: {textColor?: string, fontSize?: string, highContrast?: boolean}) {
  const audioRef = useRef<HTMLAudioElement|null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [activePara, setActivePara] = useState(-1)
  const intervalRef = useRef<any>(null)

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
      setActivePara(paragraphs.findIndex(p => ratio >= p.start && ratio < p.end))
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
      <audio ref={audioRef} src="/audio/maatir.mp3" preload="auto"/>
      <div style={{marginBottom:"20px"}}>
        {paragraphs.map((p, i) => (
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

export default function LessonPage() {
  const params = useParams()
  const year = params.year as string
  const unit = params.unit as string
  const lesson = params.lesson as string
  const isMaatir = year==="4" && lesson==="1" && unit==="1"

  const [mounted, setMounted] = useState(false)
  const [shuffledQs, setShuffledQs] = useState(questions)
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

  useEffect(() => { setMounted(true); setShuffledQs(questions) }, [])

  const yearNames: {[key:string]:string} = {"1":"الأولى","2":"الثانية","3":"الثالثة","4":"الرابعة","5":"الخامسة","6":"السادسة"}
  const unitNames: {[key:string]:string} = {"1":"الأولى","2":"الثانية","3":"الثالثة","4":"الرابعة","5":"الخامسة","6":"السادسة"}
  const lessonNames: {[key:string]:string} = {"1":"القراءة","2":"الصرف","3":"التراكيب","4":"الإملاء","5":"التعبير الكتابي","6":"التواصل الشفهي"}
  const lessonColors: {[key:string]:string} = {"1":"#2563eb","2":"#16a34a","3":"#9333ea","4":"#ea580c","5":"#0891b2","6":"#be185d"}
  const color = lessonColors[lesson] || "#2563eb"
  const bgMain = a11y.highContrast ? "#000000" : "linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)"
  const cardBg = a11y.highContrast ? "#111827" : "white"
  const textColor = a11y.highContrast ? "#f9fafb" : "#1e293b"
  const fontSize = a11y.bigText ? "20px" : "17px"
  const questionFontSize = a11y.bigText ? "20px" : "17px"
  const currentQ = shuffledQs[currentIdx]
  const totalQ = shuffledQs.length

  useEffect(() => {
    if(currentQ?.type==="order") setShuffledWords([...(currentQ as any).words].sort(()=>Math.random()-0.5))
    if(currentQ?.type==="mcq" || currentQ?.type==="multi") setShuffledOpts([...(currentQ as any).options].sort(()=>Math.random()-0.5))
    setBlankValue(""); setOrderSelected([]); setShowHint(false)
  }, [currentIdx, currentQ])

  useEffect(() => {
    if(a11y.readAloud && currentQ && mounted) {
      const u = new SpeechSynthesisUtterance(currentQ.question)
      u.lang = 'ar'
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    }
  }, [currentIdx, a11y.readAloud, mounted])

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
            lesson:`السنة ${yearNames[year]} - الوحدة ${unitNames[unit]} - ${subjectName}`})
          setSavedPoints(true)
          const badge = subjectBadges[lesson]
          if(badge && oldTotal<badge.min && newTotal>=badge.min) setNewBadge(badge)
        }
      } catch(e){console.error(e)}
    }
  }

  const restartLesson = () => {
    setShuffledQs(questions); setCurrentIdx(0); setQAnswers({}); setOrderSelected([]); setBlankValue("")
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

      <nav style={{background:"white",padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.08)"}}>
        <h1 style={{color:color,fontSize:"22px",fontWeight:"bold",margin:0}}>📖 القراءة — مآثر بلادي</h1>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{background:"#fef9c3",color:"#ca8a04",padding:"6px 14px",borderRadius:"20px",fontWeight:"bold",fontSize:"14px"}}>السنة الرابعة — الوحدة الأولى</span>
          <a href={`/levels/primary/${year}/unit/${unit}`} style={{color:"#6b7280",textDecoration:"none",fontWeight:"bold",background:"#f3f4f6",padding:"8px 14px",borderRadius:"8px"}}>رجوع</a>
        </div>
      </nav>

      <div style={{maxWidth:"900px",margin:"0 auto",padding:"24px"}}>
        <AccessibilityBar settings={a11y} setSettings={setA11y} />
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"12px",marginBottom:"20px"}}>
          {[
            {src:"/images/qarawiyyin.jpg", label:"جامع القرويين — فاس"},
            {src:"/images/hassan.jpg", label:"صومعة حسان — الرباط"},
            {src:"/images/hassan2.jpg", label:"مسجد الحسن الثاني — الدار البيضاء"},
          ].map((img,i)=>(
            <div key={i} style={{borderRadius:"12px",overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.12)"}}>
              <img src={img.src} alt={img.label} style={{width:"100%",height:"120px",objectFit:"cover",display:"block"}}/>
              <div style={{background:"rgba(30,58,138,0.85)",color:"white",padding:"6px 10px",fontSize:"12px",textAlign:"center",fontWeight:"bold"}}>{img.label}</div>
            </div>
          ))}
        </div>

        <div style={{background:cardBg,borderRadius:"16px",padding:"24px",marginBottom:"20px",borderRight:`5px solid ${color}`,boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}}>
          <h2 style={{color: a11y.highContrast ? "#fbbf24" : "#1e3a8a",fontSize: a11y.bigText ? "26px" : "22px",fontWeight:"bold",marginBottom:"4px",textAlign:"center"}}>مآثر بلادي</h2>
          <p style={{color: a11y.highContrast ? "#d1d5db" : "#6b7280",textAlign:"center",marginBottom:"20px",fontSize:"13px"}}>السنة الرابعة ابتدائي — الوحدة الأولى — مجال الحضارة المغربية</p>
          <AudioPlayer textColor={textColor} fontSize={fontSize} highContrast={a11y.highContrast} />
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
                    {score===100?"ممتاز! أكملت كل الأنشطة الـ 16! 🌟":"جيد! استمر في التقدم! 👍"}
                  </p>
                  <div style={{display:"flex",gap:"12px",justifyContent:"center"}}>
                    <button onClick={restartLesson} style={{background:"#2563eb",color:"white",border:"none",padding:"14px 24px",borderRadius:"10px",cursor:"pointer",fontWeight:"bold",fontSize:"15px"}}>🔄 إعادة المحاولة</button>
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
// ============================================================
//  eduGames.ts — سجلّ الألعاب التربوية
//  المكان: src/lib/eduGames.ts
//
//  لإضافة لعبة جديدة: أضف كائناً جديداً في المصفوفة أدناه.
//  لا حاجة لتعديل أي صفحة أخرى — تظهر تلقائياً في "ألعابي التربوية".
// ============================================================

export type EduGame = {
  id: string          // معرّف فريد وثابت (لا يتكرّر ولا يتغيّر بعد النشر)
  title: string        // الاسم الظاهر للتلميذ
  icon: string          // رمز تعبيري يمثّل اللعبة
  subject?: string      // المادة (اختياري، للعرض فقط): القراءة، الصرف...
  gradeLevel?: string   // السنة الدراسية المستهدفة (اختياري): "4"
  embedSrc: string      // رابط src من كود Embed الذي نسخته من Wordwall
  points: number        // النقاط الممنوحة أول مرة يُنهي فيها التلميذ اللعبة يومياً
}

export const eduGames: EduGame[] = [
  {
    id: "biladi-wheel",
    title: "عجلة مآثر بلادي",
    icon: "🎡",
    subject: "القراءة",
    gradeLevel: "4",
    embedSrc: "https://wordwall.net/ar/embed/d4f0879681e6429fb4da47fbef314cdd?themeId=1&templateId=8&fontStackId=0",
    points: 10,
  },
  {
    id: "mudun-game",
    title: "لعبة مدن مغربية",
    icon: "🗺️",
    subject: "القراءة",
    gradeLevel: "4",
    embedSrc: "https://wordwall.net/ar/embed/c39ac88abe154f46a13e22890bf002d1?themeId=1&templateId=5&fontStackId=0",
    points: 10,
  },
  {
    id: "ziyara-game",
    title: "لعبة زيارة مشهودة",
    icon: "🕌",
    subject: "القراءة",
    gradeLevel: "4",
    embedSrc: "https://wordwall.net/ar/embed/9aa0db3ff2814c43a6fe9f73be35d8e8?themeId=50&templateId=30&fontStackId=0",
    points: 10,
  },
  {
    id: "game-4",
    title: "لعبة إضافية 4",
    icon: "🎯",
    subject: "القراءة",
    gradeLevel: "4",
    embedSrc: "https://wordwall.net/ar/embed/4d96f64bc699464198b8d429dc6e29da?themeId=1&templateId=5&fontStackId=0",
    points: 10,
  },
  {
    id: "game-5",
    title: "لعبة إضافية 5",
    icon: "🧩",
    subject: "القراءة",
    gradeLevel: "4",
    embedSrc: "https://wordwall.net/ar/embed/8a9ad7ddbb7447d4a30c1009ddb444c1?themeId=1&templateId=5&fontStackId=0",
    points: 10,
  },
  {
    id: "game-6",
    title: "لعبة إضافية 6",
    icon: "🎲",
    subject: "القراءة",
    gradeLevel: "4",
    embedSrc: "https://wordwall.net/ar/embed/d064acc9e1e346d3b0bc297c8e18f0ad?themeId=1&templateId=5&fontStackId=0",
    points: 10,
  },
  {
    id: "game-7",
    title: "لعبة إضافية 7",
    icon: "🃏",
    subject: "القراءة",
    gradeLevel: "4",
    embedSrc: "https://wordwall.net/ar/embed/8b30027d28db4b74a64152f7a47f422d?themeId=1&templateId=5&fontStackId=0",
    points: 10,
  },
  {
    id: "game-8",
    title: "لعبة إضافية 8",
    icon: "🔤",
    subject: "القراءة",
    gradeLevel: "4",
    embedSrc: "https://wordwall.net/ar/embed/a1030cff2e01415e95d8ad473f1cc645?themeId=52&templateId=72&fontStackId=2",
    points: 10,
  },
]
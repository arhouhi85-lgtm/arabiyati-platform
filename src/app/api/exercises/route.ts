import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const apiKey = process.env.GEMINI_API_KEY

    const prompt = `أنت مساعد تربوي للمنهج المغربي. أنشئ 5 أسئلة اختيار من متعدد للمستوى ${body.level} درس ${body.lesson}. أجب بـ JSON فقط: {"questions":[{"id":1,"question":"السؤال","options":["أ","ب","ج","د"],"correct":"أ"}]}`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    const data = await res.json()

    if (!res.ok) {
      console.error('Gemini error:', data)
      return NextResponse.json({ questions: [] })
    }

    const text = data.candidates[0].content.parts[0].text
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean)
    return NextResponse.json(parsed)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ questions: [] })
  }
}
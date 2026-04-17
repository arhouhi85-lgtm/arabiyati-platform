export default function Home() {
  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-b from-blue-50 to-pink-50">

      {/* الشريط العلوي */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600">
          عَرَبِيَّتِي
        </h1>
        <div className="flex gap-3">
          <a href="/auth/login">
            <button className="bg-pink-500 text-white px-4 py-2 rounded-lg font-bold">
              تسجيل الدخول
            </button>
          </a>
          <a href="/auth/signup">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold">
              إنشاء حساب
            </button>
          </a>
        </div>
      </nav>

      {/* القسم الرئيسي */}
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-5xl font-bold text-blue-800 mb-4">
          مَرْحَباً بِكَ فِي عَرَبِيَّتِي
        </h2>
        <p className="text-xl text-gray-600 mb-2">
          مَنْصَةٌ تَعْلِيمِيَّةٌ شَامِلَةٌ لِلُّغَةِ الْعَرَبِيَّةِ
        </p>
        <p className="text-lg text-gray-500 mb-8">
          لِجَمِيعِ الْمُسْتَوَيَاتِ — الِابْتِدَائِي وَالْإِعْدَادِي وَالثَّانَوِي
        </p>

        {/* المستويات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-t-4 border-blue-400">
            <div className="text-5xl mb-4">🏫</div>
            <h3 className="text-2xl font-bold text-blue-700 mb-2">الِابْتِدَائِي</h3>
            <p className="text-gray-500 mb-4">السنوات من الأولى إلى السادسة</p>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6].map(n => (
                <button key={n} className="bg-blue-100 text-blue-700 rounded-lg p-2 font-bold hover:bg-blue-200 transition">
                  س{n}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-t-4 border-pink-400">
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-2xl font-bold text-pink-700 mb-2">الْإِعْدَادِي</h3>
            <p className="text-gray-500 mb-4">السنوات من الأولى إلى الثالثة</p>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3].map(n => (
                <button key={n} className="bg-pink-100 text-pink-700 rounded-lg p-2 font-bold hover:bg-pink-200 transition">
                  س{n}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-t-4 border-purple-400">
            <div className="text-5xl mb-4">🏛️</div>
            <h3 className="text-2xl font-bold text-purple-700 mb-2">الثَّانَوِي</h3>
            <p className="text-gray-500 mb-4">السنوات من الأولى إلى الثالثة</p>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3].map(n => (
                <button key={n} className="bg-purple-100 text-purple-700 rounded-lg p-2 font-bold hover:bg-purple-200 transition">
                  س{n}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-3 gap-4 mt-12">
          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="text-3xl font-bold text-blue-600">١٢</div>
            <div className="text-gray-500">مستوى دراسي</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="text-3xl font-bold text-pink-600">+١٠٠</div>
            <div className="text-gray-500">درس تفاعلي</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="text-3xl font-bold text-purple-600">+٥٠٠</div>
            <div className="text-gray-500">تمرين متنوع</div>
          </div>
        </div>

      </div>

    </main>
  )
}
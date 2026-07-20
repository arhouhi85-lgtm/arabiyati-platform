// الهوية البصرية لمنصة عربيتي — ARBIYATI
// مصدر واحد للألوان والشعار تسحب منه كل صفحات المنصة
// أي تعديل هنا ينعكس تلقائياً في كل مكان

export const BRAND = {
  navy: '#0F3D73',        // اللون الأساسي (مستخرج من الشعار)
  navyDark: '#0A2C54',    // درجة أغمق (تدرجات، أزرار عند التحويم)
  navyLight: '#2C5C99',   // درجة أفتح (نصوص ثانوية على خلفية فاتحة)
  gold: '#B08D51',        // اللون الثانوي/المرافق (مستخرج من الشعار)
  goldDark: '#8C6F3D',    // ذهبي أغمق (نصوص على خلفية فاتحة)
  goldLight: '#D4B888',   // ذهبي فاتح (خلفيات شارات)
  cream: '#F9F6EE',       // خلفية المنصة الدافئة
  creamDark: '#F0EBDC',   // كريمي أغمق قليلاً (تباين خفيف بين الأقسام)
  white: '#FFFFFF',
}

// تدرجات جاهزة للاستخدام في style={{background: ...}}
export const GRADIENTS = {
  navy: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.navyDark})`,
  navyGold: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.gold})`,
  gold: `linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldDark})`,
}
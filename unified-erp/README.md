# Unified ERP - نظام إدارة الموارد المؤسسية الموحد

نظام إدارة شامل للعقارات والخزينة مبني على Next.js 14 مع TypeScript.

## المميزات

### 🏢 إدارة العقارات
- إدارة المشاريع العقارية
- إدارة الوحدات (متاحة، مباعة، مرتجعة)
- إدارة العملاء والشركاء
- إدارة العقود والأقساط
- إدارة المرتجعات

### 💰 إدارة المحاسبة
- قيود اليومية
- إدارة الخزن والبنوك
- سندات القبض والصرف
- إدارة الفواتير
- تحويلات الخزن
- كشوفات البنك

### 🏗️ إدارة المشاريع والمقاولات
- إدارة المشاريع
- إدارة المراحل
- إدارة المواد
- حركة المواد

### 📊 التقارير
- تقارير الأقساط
- تصدير PDF و Excel
- تقارير مالية شاملة

### 🔐 الأمان
- نظام مصادقة متقدم مع NextAuth.js
- إدارة الأدوار والصلاحيات
- حماية المسارات

## التقنيات المستخدمة

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: PostgreSQL مع Prisma ORM
- **Authentication**: NextAuth.js v5
- **Forms**: React Hook Form مع Zod validation
- **Tables**: TanStack Table
- **PDF**: PDFMake
- **Excel**: ExcelJS
- **Testing**: Vitest

## متطلبات النظام

- Node.js 18+ 
- PostgreSQL 12+
- npm أو yarn

## التثبيت والإعداد

### 1. استنساخ المشروع
```bash
git clone <repository-url>
cd unified-erp
```

### 2. تثبيت التبعيات
```bash
npm install
```

### 3. إعداد متغيرات البيئة
```bash
cp .env.example .env.local
```

قم بتعديل ملف `.env.local` وإضافة:
- `DATABASE_URL`: رابط قاعدة البيانات PostgreSQL
- `NEXTAUTH_SECRET`: مفتاح سري قوي (يمكن إنشاؤه بـ `openssl rand -base64 32`)
- `NEXTAUTH_URL`: رابط التطبيق

### 4. إعداد قاعدة البيانات
```bash
# إنشاء جداول قاعدة البيانات
npm run db:migrate

# إنشاء بيانات تجريبية
npm run seed
```

### 5. تشغيل التطبيق
```bash
# وضع التطوير
npm run dev

# أو بناء وتشغيل الإنتاج
npm run build
npm start
```

## هيكل المشروع

```
unified-erp/
├── app/                    # Next.js App Router
│   ├── (auth)/            # صفحات المصادقة
│   ├── (protected)/       # الصفحات المحمية
│   ├── api/               # API Routes
│   └── globals.css        # الأنماط العامة
├── components/            # مكونات React
│   ├── ui/               # مكونات UI الأساسية
│   ├── forms/            # نماذج الإدخال
│   └── datatable/        # مكونات الجداول
├── lib/                  # مكتبات مساعدة
│   ├── auth.ts          # إعدادات المصادقة
│   ├── prisma.ts        # إعداد Prisma
│   ├── pdf.ts           # إنشاء PDF
│   └── excel.ts         # إنشاء Excel
├── prisma/              # إعدادات قاعدة البيانات
│   ├── schema.prisma    # مخطط قاعدة البيانات
│   └── seed.ts          # بيانات تجريبية
├── services/            # خدمات الأعمال
│   ├── accounting/      # خدمات المحاسبة
│   ├── real-estate/     # خدمات العقارات
│   └── reporting/       # خدمات التقارير
└── tests/               # اختبارات الوحدة
```

## الأوامر المتاحة

```bash
# التطوير
npm run dev              # تشغيل خادم التطوير
npm run build            # بناء التطبيق للإنتاج
npm run start            # تشغيل خادم الإنتاج

# التحقق من الكود
npm run lint             # فحص ESLint
npm run typecheck        # فحص TypeScript
npm run format           # تنسيق الكود

# قاعدة البيانات
npm run db:generate      # إنشاء Prisma Client
npm run db:migrate       # تشغيل الهجرات
npm run db:studio        # فتح Prisma Studio
npm run seed             # إنشاء بيانات تجريبية

# الاختبارات
npm run test             # تشغيل الاختبارات

# النسخ الاحتياطي
npm run backup:run       # تشغيل النسخ الاحتياطي
```

## بيانات تسجيل الدخول الافتراضية

بعد تشغيل `npm run seed`، يمكنك تسجيل الدخول بـ:
- **البريد الإلكتروني**: `admin@unified.erp`
- **كلمة المرور**: `password123`

## النشر على Vercel

### 1. إعداد متغيرات البيئة في Vercel
- `DATABASE_URL`: رابط قاعدة البيانات
- `NEXTAUTH_SECRET`: مفتاح سري قوي
- `NEXTAUTH_URL`: رابط التطبيق
- `AUTH_TRUST_HOST`: `true`

### 2. ربط المشروع بـ Vercel
```bash
npm install -g vercel
vercel
```

### 3. تشغيل الهجرات
```bash
vercel env pull .env.local
npm run db:migrate
npm run seed
```

## المساهمة

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى الفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

إذا واجهت أي مشاكل أو لديك أسئلة، يرجى فتح issue في GitHub أو التواصل مع فريق التطوير.

## التحديثات القادمة

- [ ] نظام إشعارات متقدم
- [ ] تطبيق موبايل
- [ ] تكامل مع أنظمة خارجية
- [ ] تحليلات متقدمة
- [ ] نظام النسخ الاحتياطي السحابي

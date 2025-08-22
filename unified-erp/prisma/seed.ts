import { PrismaClient, Role, AccountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Create Admin User
  const adminEmail = 'admin@unified.erp';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        passwordHash: hashedPassword,
        role: Role.ADMIN,
        emailVerified: new Date(),
      },
    });
    console.log('Admin user created.');
  } else {
    console.log('Admin user already exists.');
  }

  // 2. Create Chart of Accounts (COA)
  console.log('Seeding Chart of Accounts...');

  const accounts = [
    // Assets (1000)
    { code: '1000', name: 'الأصول', type: AccountType.asset, parentCode: null },
    { code: '1100', name: 'الأصول المتداولة', type: AccountType.asset, parentCode: '1000' },
    { code: '1110', name: 'النقدية وما في حكمها', type: AccountType.asset, parentCode: '1100' },
    { code: '1111', name: 'صندوق الإدارة', type: AccountType.asset, parentCode: '1110' },
    { code: '1120', name: 'البنوك', type: AccountType.asset, parentCode: '1100' },
    { code: '1130', name: 'العملاء (الذمم المدينة)', type: AccountType.asset, parentCode: '1100' },
    { code: '1200', name: 'الأصول غير المتداولة', type: AccountType.asset, parentCode: '1000' },
    { code: '1210', name: 'المشاريع تحت التنفيذ', type: AccountType.asset, parentCode: '1200' },

    // Liabilities (2000)
    { code: '2000', name: 'الخصوم', type: AccountType.liability, parentCode: null },
    { code: '2100', name: 'الخصوم المتداولة', type: AccountType.liability, parentCode: '2000' },
    { code: '2110', name: 'الموردون (الذمم الدائنة)', type: AccountType.liability, parentCode: '2100' },
    { code: '2120', name: 'المقاولون', type: AccountType.liability, parentCode: '2100' },

    // Equity (3000)
    { code: '3000', name: 'حقوق الملكية', type: AccountType.equity, parentCode: null },
    { code: '3100', name: 'رأس المال', type: AccountType.equity, parentCode: '3000' },
    { code: '3200', name: 'محفظة الشركاء', type: AccountType.equity, parentCode: '3000' },

    // Revenue (4000)
    { code: '4000', name: 'الإيرادات', type: AccountType.revenue, parentCode: null },
    { code: '4100', name: 'إيرادات بيع الوحدات', type: AccountType.revenue, parentCode: '4000' },

    // Expenses (5000)
    { code: '5000', name: 'المصروفات', type: AccountType.expense, parentCode: null },
    { code: '5100', name: 'تكاليف المشاريع', type: AccountType.expense, parentCode: '5000' },
    { code: '5200', name: 'مصروفات عمومية وإدارية', type: AccountType.expense, parentCode: '5000' },
  ];

  const createdAccounts = new Map<string, string>();

  for (const acc of accounts) {
    const existingAccount = await prisma.accountGL.findUnique({ where: { code: acc.code } });
    if (!existingAccount) {
      const parentId = acc.parentCode ? createdAccounts.get(acc.parentCode) : null;
      const newAccount = await prisma.accountGL.create({
        data: {
          code: acc.code,
          name: acc.name,
          type: acc.type,
          parentAccountId: parentId,
        },
      });
      createdAccounts.set(newAccount.code, newAccount.id);
      console.log(`Created account: ${newAccount.name}`);
    }
  }

  console.log('Chart of Accounts seeded.');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

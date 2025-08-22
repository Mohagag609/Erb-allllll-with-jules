export type Locale = 'ar' | 'en';

const dict = {
  ar: {
    common: {
      search: 'بحث',
      actions: 'إجراءات',
      export: 'تصدير',
      print: 'طباعة',
    },
  },
  en: {
    common: {
      search: 'Search',
      actions: 'Actions',
      export: 'Export',
      print: 'Print',
    },
  },
} as const;

export function t(key: keyof typeof dict['ar']['common'], locale: Locale = 'ar') {
  return dict[locale].common[key];
}
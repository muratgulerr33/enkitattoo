import {defineRouting} from 'next-intl/routing';

export const locales = ['tr', 'sq', 'sr', 'en'] as const;

export const routing = defineRouting({
  locales,
  defaultLocale: 'tr',
  localePrefix: 'always'
});

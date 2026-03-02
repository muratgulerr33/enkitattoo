import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

function isSupportedLocale(locale: string): locale is (typeof routing.locales)[number] {
  return routing.locales.includes(locale as (typeof routing.locales)[number]);
}

export default getRequestConfig(async ({requestLocale}) => {
  const requestedLocale = await requestLocale;

  const locale =
    requestedLocale && isSupportedLocale(requestedLocale)
      ? requestedLocale
      : routing.defaultLocale;

  let localeMessages;
  let reviewsMessages;

  // Use explicit imports for predictable bundling across build targets.
  switch (locale) {
    case 'en':
      localeMessages = (await import('../../messages/en.json')).default;
      reviewsMessages = (await import('../content/enki/reviews.en.json')).default;
      break;
    case 'sq':
      localeMessages = (await import('../../messages/sq.json')).default;
      reviewsMessages = (await import('../content/enki/reviews.sq.json')).default;
      break;
    case 'sr':
      localeMessages = (await import('../../messages/sr.json')).default;
      reviewsMessages = (await import('../content/enki/reviews.sr.json')).default;
      break;
    case 'tr':
    default:
      localeMessages = (await import('../../messages/tr.json')).default;
      reviewsMessages = (await import('../content/enki/reviews.tr.json')).default;
      break;
  }

  return {
    locale,
    timeZone: "Europe/Istanbul",
    messages: {
      ...localeMessages,
      reviews: reviewsMessages
    }
  };
});

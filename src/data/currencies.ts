export interface CurrencyType {
  code: string;
  symbol: string;
  country: string;
  locale: string;
}

const currencies: readonly CurrencyType[] = [
  { code: 'INR', symbol: '₹', country: 'India', locale: 'en-IN' },
  { code: 'USD', symbol: '$', country: 'United States', locale: 'en-US' },
  { code: 'EUR', symbol: '€', country: 'European Union', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', country: 'United Kingdom', locale: 'en-GB' },
  { code: 'AED', symbol: 'د.إ', country: 'United Arab Emirates', locale: 'ar-AE' },
  { code: 'SAR', symbol: 'ر.س', country: 'Saudi Arabia', locale: 'ar-SA' },
  { code: 'QAR', symbol: 'ر.ق', country: 'Qatar', locale: 'ar-QA' },
  { code: 'KWD', symbol: 'د.ك', country: 'Kuwait', locale: 'ar-KW' },
  { code: 'BHD', symbol: '.د.ب', country: 'Bahrain', locale: 'ar-BH' },
  { code: 'OMR', symbol: 'ر.ع.', country: 'Oman', locale: 'ar-OM' },
  { code: 'PKR', symbol: '₨', country: 'Pakistan', locale: 'en-PK' },
  { code: 'BDT', symbol: '৳', country: 'Bangladesh', locale: 'bn-BD' },
  { code: 'LKR', symbol: 'Rs', country: 'Sri Lanka', locale: 'en-LK' },
  { code: 'NPR', symbol: 'Rs', country: 'Nepal', locale: 'en-NP' },
  { code: 'AUD', symbol: 'A$', country: 'Australia', locale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', country: 'Canada', locale: 'en-CA' },
  { code: 'SGD', symbol: 'S$', country: 'Singapore', locale: 'en-SG' },
  { code: 'JPY', symbol: '¥', country: 'Japan', locale: 'ja-JP' },
  { code: 'CNY', symbol: '¥', country: 'China', locale: 'zh-CN' },
  { code: 'HKD', symbol: 'HK$', country: 'Hong Kong', locale: 'en-HK' },
  { code: 'MYR', symbol: 'RM', country: 'Malaysia', locale: 'ms-MY' },
  { code: 'THB', symbol: '฿', country: 'Thailand', locale: 'th-TH' },
  { code: 'IDR', symbol: 'Rp', country: 'Indonesia', locale: 'id-ID' },
  { code: 'PHP', symbol: '₱', country: 'Philippines', locale: 'en-PH' },
  { code: 'VND', symbol: '₫', country: 'Vietnam', locale: 'vi-VN' },
  { code: 'KRW', symbol: '₩', country: 'South Korea', locale: 'ko-KR' },
  { code: 'ZAR', symbol: 'R', country: 'South Africa', locale: 'en-ZA' },
  { code: 'NGN', symbol: '₦', country: 'Nigeria', locale: 'en-NG' },
  { code: 'KES', symbol: 'KSh', country: 'Kenya', locale: 'en-KE' },
  { code: 'EGP', symbol: 'E£', country: 'Egypt', locale: 'ar-EG' },
  { code: 'TRY', symbol: '₺', country: 'Turkey', locale: 'tr-TR' },
  { code: 'RUB', symbol: '₽', country: 'Russia', locale: 'ru-RU' },
  { code: 'BRL', symbol: 'R$', country: 'Brazil', locale: 'pt-BR' },
  { code: 'MXN', symbol: 'Mex$', country: 'Mexico', locale: 'es-MX' },
  { code: 'CHF', symbol: 'CHF', country: 'Switzerland', locale: 'de-CH' },
  { code: 'SEK', symbol: 'kr', country: 'Sweden', locale: 'sv-SE' },
  { code: 'NOK', symbol: 'kr', country: 'Norway', locale: 'nb-NO' },
  { code: 'DKK', symbol: 'kr', country: 'Denmark', locale: 'da-DK' },
  { code: 'NZD', symbol: 'NZ$', country: 'New Zealand', locale: 'en-NZ' },
  { code: 'JOD', symbol: 'د.ا', country: 'Jordan', locale: 'ar-JO' },
  { code: 'ILS', symbol: '₪', country: 'Israel', locale: 'he-IL' }
];

export const DEFAULT_CURRENCY: CurrencyType = currencies.find((c) => c.code === 'INR') || currencies[0];

export const getCurrency = (code?: string): CurrencyType => currencies.find((c) => c.code === code) || DEFAULT_CURRENCY;

export default currencies;

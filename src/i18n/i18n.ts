import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import et from './locales/et.json'

export const resources = {
  et: {
    translation: et,
  },
} as const

i18n.use(initReactI18next).init({
  resources: {
    et: { translation: et },
    en: { translation: en },
  },
  lng: 'et',
  fallbackLng: 'et',
  interpolation: { escapeValue: false },
  ignoreJSONStructure: true,
  keySeparator: '.',
  nsSeparator: '.',
  returnNull: false,
})

export default i18n

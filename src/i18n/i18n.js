import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const allTranslations = {};

i18n
	.use(initReactI18next)
	.init({
		resources: allTranslations,
		fallbackLng: 'default',
		debug: false,
		interpolation: { escapeValue: false }
	});

export default i18n;

export function setLocale(locale = 'en_US') {
	'en_GB' === locale ? i18n.changeLanguage('en_US') : i18n.changeLanguage(locale);
}
// TODO FIX TRANSLATIONS
export function getTranslationByPath(id) {
	if (!allTranslations[i18n.language]) console.warn('Missing translations for', i18n.language, id);
	// return allTranslations[i18n.language] ? allTranslations[i18n.language].translation[id] : allTranslations.en_US.translation[id];
	return id;
}
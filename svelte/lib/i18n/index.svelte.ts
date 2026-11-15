import * as en_US from "./metadata/en-US";
import * as id_ID from "./metadata/id-ID";

const locales = {
  "en-US": en_US,
  "id-ID": id_ID,
} as const;

const localesShortform = {
  "en": locales["en-US"],
  "id": locales["id-ID"],
}

function _detectLocale() {
  const preferences: readonly string[] = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const preferred of preferences) {
    if (preferred in locales) {
      return locales[preferred as Locale];
    }
  }

  for (const preferred of preferences) {
    const preferredShortform = preferred.split("-")[0];

    if (preferredShortform in localesShortform) {
      return localesShortform[preferredShortform as LocaleShortform];
    }
  }

  return fallbackLocale;
}

let activeLocale = $state(_detectLocale());

export type Locale = keyof typeof locales;
export type LocaleShortform = keyof typeof localesShortform;
export const fallbackLocale = locales["en-US"];
export const locale = {
  get active() {
    return activeLocale;
  },

  get message() {
    return activeLocale.message;
  },

  set(value: string) {
    if (value in locales) {
      activeLocale = locales[value as Locale];
    } else if(value in localesShortform) {
      activeLocale = localesShortform[value as LocaleShortform];
    }
  },
};

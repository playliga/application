/**
 * Provides translated strings.
 *
 * @module
 */
import * as TemplatesEn from './en/templates';
import * as TemplatesEs from './es/templates';
import TranslationsEn from './en/translations.json';
import TranslationsEs from './es/translations.json';
import { Constants } from '@liga/shared';

/**
 * Exports this module.
 *
 * @exports
 */
export default {
  [Constants.LocaleIdentifier.EN]: {
    templates: TemplatesEn,
    translations: TranslationsEn,
  },
  [Constants.LocaleIdentifier.ES]: {
    templates: TemplatesEs,
    translations: TranslationsEs,
  },
};

/**
 * Internationalization (i18n) Module
 * Poli International - Studio Consultation Form Builder
 * Supports: English (en), French (fr), Italian (it), German (de), Spanish (es), Dutch (nl), Portuguese (pt)
 */

(function () {
    'use strict';

    // Resolve i18n.json next to this script's own directory rather than against
    // the page URL, so the identical file works whether the tool is served from
    // /tools/form-builder/ on the website or from a bare checkout of the repo.
    var I18N_URL = new URL('../i18n.json', document.currentScript.src).href;

    class I18nManager {
        constructor() {
            this.currentLanguage = 'en';
            this.storageKey = 'poli_form_builder_lang';
            this.supportedLanguages = ['en', 'fr', 'it', 'de', 'es', 'nl', 'pt'];
            this.translations = {};
            this.isLoaded = false;
        }

        async init() {
            // Determine initial language
            const storedLang = localStorage.getItem(this.storageKey);
            if (storedLang && this.supportedLanguages.includes(storedLang)) {
                this.currentLanguage = storedLang;
            } else {
                this.currentLanguage = this.detectBrowserLanguage();
            }

            // Load translations from i18n.json or embedded fallback
            await this.loadTranslations();

            // Set HTML lang attribute
            document.documentElement.lang = this.currentLanguage;

            // Bind language switcher dropdown
            this.bindLanguageSwitcher();

            // Apply translations to DOM
            this.translateDOM();

            this.isLoaded = true;

            // FormBuilder is constructed at script-parse time (bottom of
            // drag-drop-builder.js), i.e. before this async load resolves, so its
            // palette was rendered with raw key paths. Re-render it now.
            if (window.FormBuilderApp) {
                if (typeof window.FormBuilderApp.renderPalette === 'function') {
                    window.FormBuilderApp.renderPalette();
                }
                if (typeof window.FormBuilderApp.renderRecommendedFields === 'function') {
                    window.FormBuilderApp.renderRecommendedFields();
                }
                if (typeof window.FormBuilderApp.renderPropertiesEditor === 'function') {
                    window.FormBuilderApp.renderPropertiesEditor();
                }
            }

            // Dispatch initialized event
            document.dispatchEvent(new CustomEvent('i18nInitialized', {
                detail: { language: this.currentLanguage }
            }));
        }

        detectBrowserLanguage() {
            try {
                const navLang = (navigator.language || (navigator.languages && navigator.languages[0]) || 'en').toLowerCase();
                const code = navLang.split('-')[0];
                if (this.supportedLanguages.includes(code)) {
                    return code;
                }
            } catch (e) {
                console.warn('Language detection failed:', e);
            }
            return 'en';
        }

        async loadTranslations() {
            try {
                const response = await fetch(I18N_URL);
                if (response.ok) {
                    this.translations = await response.json();
                } else {
                    console.warn('Could not load i18n.json, falling back to embedded map');
                }
            } catch (err) {
                console.warn('Fetch i18n.json error:', err);
            }
        }

        bindLanguageSwitcher() {
            const select = document.getElementById('global-language-select');
            if (!select) return;

            select.value = this.currentLanguage;
            select.addEventListener('change', (e) => {
                const newLang = e.target.value;
                this.setLanguage(newLang);
            });
        }

        setLanguage(lang) {
            if (!this.supportedLanguages.includes(lang)) return;
            this.currentLanguage = lang;
            localStorage.setItem(this.storageKey, lang);
            document.documentElement.lang = lang;

            const select = document.getElementById('global-language-select');
            if (select && select.value !== lang) {
                select.value = lang;
            }

            this.translateDOM();

            // Translate form schema fields, placeholders, labels, and options
            if (window.FormTranslator && window.FormBuilderApp && window.FormBuilderApp.currentForm) {
                window.FormTranslator.translateForm(window.FormBuilderApp.currentForm, lang);
                if (typeof window.FormBuilderApp.renderCanvas === 'function') {
                    window.FormBuilderApp.renderCanvas();
                }
                if (typeof window.FormBuilderApp.triggerAutoSave === 'function') {
                    window.FormBuilderApp.triggerAutoSave();
                }
            }

            // Notify rest of the app
            document.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: lang }
            }));

            // Notify FormBuilder and Preview if active
            if (window.FormBuilderApp) {
                if (typeof window.FormBuilderApp.renderPalette === 'function') {
                    window.FormBuilderApp.renderPalette();
                }
                if (typeof window.FormBuilderApp.renderPropertiesEditor === 'function') {
                    window.FormBuilderApp.renderPropertiesEditor();
                }
                if (typeof window.FormBuilderApp.showToast === 'function') {
                    const msg = this.t('messages.language_changed') || `Language changed to ${lang.toUpperCase()}`;
                    window.FormBuilderApp.showToast(msg, 'info');
                }
            }

            if (window.FormPreviewApp && typeof window.FormPreviewApp.render === 'function') {
                if (document.getElementById('preview-interface') && document.getElementById('preview-interface').style.display !== 'none') {
                    window.FormPreviewApp.render();
                }
                const resultsModal = document.getElementById('results-dashboard-modal');
                if (resultsModal && resultsModal.style.display !== 'none' && typeof window.FormPreviewApp.openResultsDashboard === 'function') {
                    window.FormPreviewApp.openResultsDashboard();
                }
            }

            // Update template selector option titles if present
            this.updateTemplateSelectOptions();
        }

        updateTemplateSelectOptions() {
            const tmplSelect = document.getElementById('template-select');
            if (!tmplSelect || !window.FormTemplates || !window.FormTemplates.TemplateManager) return;

            const templates = window.FormTemplates.TemplateManager.getAllTemplates();
            const currentVal = tmplSelect.value;
            tmplSelect.innerHTML = '';

            templates.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                // Check if translation exists in template map
                let trTitle = this.t(`templates.${t.id}`);
                if (!trTitle || trTitle === `templates.${t.id}`) trTitle = t.name || t.title || t.id;
                
                let trCat = t.category || '';
                if (trCat) {
                    const catKey = trCat.toLowerCase();
                    const catTr = this.t(`template_categories.${catKey}`);
                    if (catTr && catTr !== `template_categories.${catKey}`) {
                        trCat = catTr;
                    }
                }
                opt.textContent = `📋 ${trTitle}${trCat ? ` (${trCat})` : ''}`;
                tmplSelect.appendChild(opt);
            });

            if (currentVal) {
                tmplSelect.value = currentVal;
            }
        }

        t(keyPath, params = {}, fallback = null) {
            if (!keyPath) return fallback || '';

            // Allow flexible calling signatures:
            // 1. t('key', 'Fallback String')
            // 2. t('key', { count: 3 }, 'Fallback String')
            // 3. t('key', 'Fallback String', { count: 3 })
            let actualParams = params;
            let actualFallback = fallback;

            if (typeof params === 'string') {
                actualFallback = params;
                actualParams = (typeof fallback === 'object' && fallback !== null) ? fallback : {};
            } else if (typeof params !== 'object' || params === null) {
                actualParams = {};
            }

            const keys = keyPath.split('.');
            let val = this.translations[this.currentLanguage];

            for (const k of keys) {
                if (val && typeof val === 'object' && k in val) {
                    val = val[k];
                } else {
                    val = null;
                    break;
                }
            }

            // Fallback to English
            if (val === null || val === undefined) {
                let fallbackTranslation = this.translations['en'];
                for (const k of keys) {
                    if (fallbackTranslation && typeof fallbackTranslation === 'object' && k in fallbackTranslation) {
                        fallbackTranslation = fallbackTranslation[k];
                    } else {
                        fallbackTranslation = null;
                        break;
                    }
                }
                val = fallbackTranslation;
            }

            if (val === null || val === undefined) {
                return (actualFallback !== null && actualFallback !== undefined && actualFallback !== '') ? actualFallback : keyPath;
            }

            if (typeof val === 'string' && actualParams && Object.keys(actualParams).length > 0) {
                let result = val;
                for (const [pKey, pVal] of Object.entries(actualParams)) {
                    result = result.replace(new RegExp(`\\{${pKey}\\}`, 'g'), pVal);
                }
                return result;
            }

            return val;
        }

        translateDOM(container = document) {
            // Text content
            const elements = container.querySelectorAll('[data-i18n]');
            elements.forEach(el => {
                const key = el.getAttribute('data-i18n');
                const translation = this.t(key);
                if (translation && translation !== key) {
                    // Check if element has icon span or child elements that need preservation
                    const iconSpan = el.querySelector('span:first-child');
                    if (iconSpan && (iconSpan.textContent.match(/^[^\w\s]/) || iconSpan.classList.contains('icon'))) {
                        // Preserves icon
                        const iconHtml = iconSpan.outerHTML;
                        el.innerHTML = `${iconHtml} ${translation}`;
                    } else if (typeof translation === 'string' && translation.includes('<') && translation.includes('>')) {
                        el.innerHTML = translation;
                    } else {
                        el.textContent = translation;
                    }
                }
            });

            // HTML content
            const htmlElements = container.querySelectorAll('[data-i18n-html]');
            htmlElements.forEach(el => {
                const key = el.getAttribute('data-i18n-html');
                const translation = this.t(key);
                if (translation && translation !== key) {
                    el.innerHTML = translation;
                }
            });

            // Placeholders
            const placeholders = container.querySelectorAll('[data-i18n-placeholder]');
            placeholders.forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                const translation = this.t(key);
                if (translation && translation !== key) {
                    el.placeholder = translation;
                }
            });

            // Titles / Tooltips
            const titles = container.querySelectorAll('[data-i18n-title], [data-i18n-tooltip]');
            titles.forEach(el => {
                const key = el.getAttribute('data-i18n-title') || el.getAttribute('data-i18n-tooltip');
                const translation = this.t(key);
                if (translation && translation !== key) {
                    el.title = translation;
                }
            });

            // Aria Labels
            const ariaLabels = container.querySelectorAll('[data-i18n-aria-label]');
            ariaLabels.forEach(el => {
                const key = el.getAttribute('data-i18n-aria-label');
                const translation = this.t(key);
                if (translation && translation !== key) {
                    el.setAttribute('aria-label', translation);
                }
            });

            // Values (inputs)
            const valueElements = container.querySelectorAll('[data-i18n-value]');
            valueElements.forEach(el => {
                const key = el.getAttribute('data-i18n-value');
                const translation = this.t(key);
                if (translation && translation !== key) {
                    el.value = translation;
                }
            });

            // Update template selector options
            this.updateTemplateSelectOptions();
        }
    }

    // Instantiate and expose globally
    window.i18n = new I18nManager();
    window.t = (key, params, fallback) => window.i18n.t(key, params, fallback);

    // Initialize as soon as DOM is interactive.
    // `ready` resolves once i18n.json is loaded; app boot must await it, otherwise
    // everything rendered by JS bakes in raw key paths (init() is async and its
    // DOMContentLoaded listener returns before the fetch resolves).
    if (document.readyState === 'loading') {
        window.i18n.ready = new Promise((resolve) => {
            document.addEventListener('DOMContentLoaded', () => resolve(window.i18n.init()));
        });
    } else {
        window.i18n.ready = window.i18n.init();
    }
})();

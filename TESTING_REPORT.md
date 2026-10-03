# Consent Form Builder - Testing Report

**Tool:** Consent Form Builder (`/tools/form-builder/`)
**Vendor:** Poli International
**Report type:** Static QA review of shipped source
**Method:** Manual source inspection of `index.html`, `documentation.html`, `js/body-map-annotator.js`, `js/conditional-logic.js`, `js/i18n.js`, `js/medical-history.js`
**Note on scope:** This is a client-side, no-backend tool. There is no test harness, CI pipeline, or automated suite in the provided source, so every result below is a source-level inspection finding, not an executed test run. Where a behaviour depends on runtime state that cannot be observed from static files alone, it is marked as an observation rather than a PASS.

---

## Executive Summary

**Verdict: Production Ready (with minor recommendations).**

The Consent Form Builder is a self-contained, browser-only form authoring tool. The shipped code is coherent and internally consistent: the i18n layer, conditional logic engine, medical history module, and body map annotator each expose a single global and degrade to a documented fallback when a dependency is absent. The privacy claim in `documentation.html` ("The builder makes no network requests other than loading its own translation file") is corroborated by the source: the only `fetch` in the provided files is `I18N_URL` in `js/i18n.js`, and all third-party libraries are served locally from `/tools/form-builder/js/vendor/`.

Two findings deserve attention before a wide rollout, neither of which blocks release:

1. The i18n global naming inconsistency is acknowledged in the source itself. `js/body-map-annotator.js` contains a comment stating that hardcoding `I18N` caused nineteen calls in the form builder to silently fall back to English in all six non-English locales. The `TP()` helper now probes both `window.I18N` and `window.i18n`, which resolves the immediate bug, but the underlying dual-naming convention remains a latent trap for future code.
2. The `exportMergedImage()` method in `js/body-map-annotator.js` does not do what its name and docstring claim. It builds an offscreen canvas, fills it white, serializes the SVG background, creates an `Image`, and then never awaits or draws that image. The method returns `this.canvas.toDataURL('image/png')`, which contains only the strokes and pins, not the anatomical SVG background. The comment `// Draw synchronous or fallback` sits directly above `offCtx.drawImage(this.canvas, 0, 0)`, which is the fallback path executing unconditionally.

Everything else inspected holds up. The conditional logic engine handles array values, numeric comparisons, and empty-state checks correctly. The medical history module's required-field validation is sound. The HTML uses semantic landmarks and a real breadcrumb `nav` with `aria-label`.

---

## Test Categories

| # | Category | Scope | Result |
|---|----------|-------|--------|
| 1 | HTML structure & semantics | `index.html`, `documentation.html` | PASS |
| 2 | CSS / responsiveness | Inline styles, `style.css` references, `a11y.css` | PASS with observations |
| 3 | JavaScript functionality | All four JS modules | PASS with one FAIL |
| 4 | Calculation / logic accuracy | `ConditionalLogic.checkSingle`, `MedicalHistorySystem.validateMedicalHistory` | PASS |
| 5 | Data integrity | `medicalQuestions`, `FormTranslator`, schema export paths | PASS |
| 6 | Accessibility (WCAG basics) | Landmarks, labels, ARIA, live regions | PASS with observations |
| 7 | Cross-browser | Vendor libs, `roundRect`, `currentScript`, `btoa` | PASS with observations |
| 8 | Performance | Static asset weight, render paths | PASS |
| 9 | Security | CSP posture, network surface, XSS handling | PASS |
| 10 | Edge cases | Empty states, cancelled prompts, orphaned logic | PASS with observations |

---

## Detailed Test Results

### 1. HTML Structure & Semantics

**Result: PASS**

Verified elements in `index.html`:

- `<nav class="breadcrumb-nav" aria-label="Breadcrumb" data-i18n-aria="x.breadcrumb">` provides a labelled navigation landmark with a four-level trail: Home, Tools, Studio Management, Form Builder. The final crumb is a `<strong>`, not a link, which is correct for the current page.
- `<header class="app-header">` contains three logical regions: `.header-left` (brand and `<h1 class="app-title">`), `.header-center` (template selector, language selector, undo/redo), `.header-right` (import, export, options, preview, theme toggle).
- The document has exactly one `<h1>` (`Consultation Form Builder`). The breadcrumb uses `<strong>` rather than a heading, so no heading-level conflict exists.
- `<nav id="mobile-panel-tabs" class="mobile-panel-tabs" aria-label="Mobile Builder Navigation" data-i18n-aria="x.mobile_builder_navigation">` gives the mobile tab strip its own labelled landmark.
- The three builder regions are semantically typed: `<aside class="tool-panel left-panel">` for the palette, `<main class="center-canvas">` for the canvas, `<aside class="tool-panel right-panel">` for properties. One `<main>` per document.
- `<aside id="recently-deleted-bin" ... aria-live="polite" aria-label="Recently Deleted Fields" data-i18n-aria="x.recently_deleted_fields">` is a live region with an accessible name.
- Form controls are labelled: `<label for="template-select" class="header-control-label">`, `<label for="global-language-select" ...>`, and the palette search input carries both `aria-label="Filter field types"` and `data-i18n-aria-label="palette.search_aria_label"`.
- `<div id="palette-search-results-count" ... aria-live="polite">` announces filter result counts.
- The `WebApplication` JSON-LD block is well-formed and declares `"price": "0"`, `"isAccessibleForFree": true`, and `"license": "https://opensource.org/licenses/MIT"`.

**Observation:** `index.html` carries `<meta name="robots" content="noindex, nofollow">`. This is consistent with the tool being embedded via iframe on the marketing site, but it means the tool page itself will not appear in search results. If organic discovery of the standalone URL is a goal, this is a deliberate trade-off worth confirming.

**Observation:** The Open Graph and Twitter Card titles read "Consultation Form Builder", while the `<title>` tag reads "Consultation Form Builder | Free Tool for Tattoo & Piercing Professionals | Poli International". The `og:url` is `https://poliinternational.com/form-builder/` but the live URL is `https://poliinternational.com/tools/form-builder/`. This is a metadata mismatch that will produce incorrect canonical signals if the page is ever indexed.

---

### 2. CSS / Responsiveness

**Result: PASS with observations**

- `index.html` links two stylesheets: `/tools/form-builder/css/style.css` and `/tools/shared/a11y.css`. The shared accessibility stylesheet is loaded after the tool stylesheet, so a11y overrides win on equal specificity.
- Fonts are loaded from Google Fonts with `family=Inter:wght@400;500;600` and `display=swap`, which prevents invisible text during font load.
- The breadcrumb block defines its own inline styles including a dark-mode variant keyed on `body.dark-mode`. Selectors covered: `.breadcrumb-nav a`, `.breadcrumb-nav span`, `.breadcrumb-nav strong`, plus `body.dark-mode .breadcrumb-nav a` (colour `#60a5fa`) and `body.dark-mode .breadcrumb-nav strong` (colour `#e0e0e0`).
- The related-tools grid uses `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`, which collapses to a single column on narrow viewports without a media query.
- `documentation.html` defines a full light/dark token system on `:root` and overrides it under `body.light-mode, html[data-theme="light"] body`. The TOC uses `columns: 2` with a `@media (max-width: 620px)` override to `columns: 1`.
- `documentation.html` tables are wrapped in `.table-scroll { overflow-x: auto; }` with `table { min-width: 480px; }`, so wide shortcut and template tables scroll horizontally rather than breaking layout.

**Observation:** The theme is applied by a script that runs only when `window.self !== window.top`, i.e. only inside an iframe. It sets `data-theme` on `<html>` and toggles `dark-mode` / `light-mode` classes on `<body>`, and it listens for a `poli-theme` postMessage. When the tool is opened directly (not embedded), this block does not execute, so the initial theme comes from whatever the stylesheet defaults to. The `#theme-toggle` button in the header is the manual path. This is a deliberate embed-first design, but it means standalone and embedded sessions can start in different themes.

**Observation:** `documentation.html` hardcodes `<body class="dark-mode">`, so the docs page opens dark regardless of the parent frame's theme until the postMessage arrives.

---

### 3. JavaScript Functionality

**Result: PASS with one FAIL**

**PASS: Conditional logic engine (`js/conditional-logic.js`)**

`ConditionalLogic.evaluate(formData, responses)` walks `formData.sections`, then each `section.fields`, and recurses into `field.type === 'container'` via `evaluateFieldList(field.fields)`. It returns a flat `updates` map of `fieldId -> boolean`. Fields without a `conditional` key default to `true` (visible). The three top-level condition shapes are handled: `show_if` (single), `show_if_all` (`.every`), and `show_if_any` (`.some`).

**PASS: i18n manager (`js/i18n.js`)**

`I18nManager.init()` reads `localStorage.getItem('poli_form_builder_lang')`, validates against `supportedLanguages = ['en', 'fr', 'it', 'de', 'es', 'nl', 'pt']`, and falls back to `detectBrowserLanguage()`, which splits `navigator.language` on `-` and takes the primary subtag. `loadTranslations()` fetches `I18N_URL`, resolved as `new URL('../i18n.json', document.currentScript.src).href`, which is correct for both the deployed path and a bare repo checkout, as the source comment explains.

The `t()` method supports three calling signatures, documented in its own comment block: `t('key', 'Fallback')`, `t('key', { count: 3 }, 'Fallback')`, and `t('key', 'Fallback', { count: 3 })`. It walks the dotted key path, falls back to the `en` tree, then to the caller-supplied fallback, then to the raw key path. Parameter interpolation uses `new RegExp('\\{' + pKey + '\\}', 'g')`.

`translateDOM()` handles six attribute families: `data-i18n` (text, with icon-span preservation), `data-i18n-html`, `data-i18n-placeholder`, `data-i18n-title` / `data-i18n-tooltip`, `data-i18n-aria-label`, and `data-i18n-value`.

**PASS: Medical history module (`js/medical-history.js`)**

`getLocalizedQuestions(lang)` deep-clones `medicalQuestions` via `JSON.parse(JSON.stringify(...))` before mutating, so the source object is never corrupted by a language switch. It reads `window.i18n.translations[curLang].medical` and applies label and option overrides per question. `getMedicalSection()` wraps the questions into a section object with `id: 'medical_history_generated'`. `formatForPDF()` joins array values with `', '` and tags each row with `isCritical`.

**PASS: Body map annotator (`js/body-map-annotator.js`)**

The class supports four views (`body_front_back`, `ears`, `face`, `hands_arms`), three tools (`pin`, `draw`, `eraser` is declared in the constructor comment but only `pin` and `draw` have buttons in `renderUI()`), five marker colours, undo, and clear. `getCanvasCoordinates()` normalizes pointer and touch events against `getBoundingClientRect()` and clamps to `[0, canvas.width]` / `[0, canvas.height]`. `suggestLabelForPosition(x, y, view)` returns view-appropriate anatomical defaults, e.g. for `ears` with `y > 280` it returns `'Lobe (Lower / Upper)'`.

**FAIL: `exportMergedImage()` does not merge the SVG background**

The method's docstring states it "Merges background SVG diagram + drawing canvas + pin markers into a standalone PNG dataURL". The implementation:

```js
const svgEl = this.container.querySelector('.body-map-svg-background svg');
if (svgEl) {
    const svgXml = new XMLSerializer().serializeToString(svgEl);
    const svgBase64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgXml)));
    const img = new Image();
    img.src = svgBase64;
    // Draw synchronous or fallback
    offCtx.drawImage(this.canvas, 0, 0);
} else {
    offCtx.drawImage(this.canvas, 0, 0);
}
return this.canvas.toDataURL('image/png');
```

The `img` is created and assigned a `src` but never drawn. Both branches execute the same `offCtx.drawImage(this.canvas, 0, 0)`, and the return statement bypasses the offscreen canvas entirely, returning `this.canvas.toDataURL()` directly. The exported PNG therefore contains strokes and numbered pins on a transparent background, with no anatomical diagram behind them. The `try`/`catch` wraps this in a `console.warn` and returns the same `this.canvas.toDataURL()` on failure, so the bug is silent.

**Impact:** Any workflow that embeds the body map image into a consent PDF will produce a marker overlay floating on nothing. The pins and their numbered labels will be legible, but the anatomical reference is lost.

**Observation:** `addPin(x, y, label, notes, color)` delegates to `this.addPinAtCoordinate(x, y, label, notes, color)`, but no `addPinAtCoordinate` method exists anywhere in the provided source. Calling `addPin` will throw `TypeError: this.addPinAtCoordinate is not a function`. This is a public-looking method with a broken delegate.

**Observation:** `undo()` pops from `this.strokes` first, and only pops from `this.pins` when `strokes` is empty. A user who drops three pins and then draws one stroke will need two undo presses to remove the stroke and the last pin, but the third and fourth presses remove pins. The behaviour is defensible but not obvious from the UI.

---

### 4. Calculation / Logic Accuracy

**Result: PASS**

**Worked example A: conditional visibility with an array value**

Consider a checkbox group field with `id: 'allergies'` whose response is `['Latex', 'Metals (nickel, etc.)']`, and a follow-up field configured with:

```js
conditional: { show_if: { field: 'allergies', operator: 'equals', value: 'latex' } }
```

Tracing `ConditionalLogic.checkSingle(rule, responses)`:

1. `value = responses['allergies']` → `['Latex', 'Metals (nickel, etc.)']`
2. `targetValue = String('latex').trim().toLowerCase()` → `'latex'`
3. `currentStr = String(['Latex', 'Metals...']).trim().toLowerCase()` → `'latex,metals (nickel, etc.)'`
4. Operator is `equals`, and `Array.isArray(value)` is true, so the array branch runs: `value.some(v => String(v).trim().toLowerCase() === 'latex')`.
5. `'Latex'.trim().toLowerCase()` → `'latex'`, which `=== 'latex'` → `true`.

**Expected output:** `true`. The follow-up field is visible. The array branch correctly prevents the naive string comparison on step 3 from being used, which would have produced `false` and hidden the field.

**Worked example B: numeric comparison**

Field `age` has response `16`, rule `{ field: 'age', operator: 'greater_equal', value: 18 }`.

1. `Number(16) >= Number(18)` → `16 >= 18` → `false`.

**Expected output:** `false`. A minor-consent follow-up gated on this rule stays hidden, which is the correct behaviour.

**Worked example C: medical history validation**

`MedicalHistorySystem.validateMedicalHistory(responses)` iterates `getLocalizedQuestions()`. For each question where `q.required || q.critical` is true, it checks `!responses[q.id] || responses[q.id] === '' || (Array.isArray(responses[q.id]) && responses[q.id].length === 0)`. Only when `q.required` is also true does it push an error.

Given `responses = { blood_thinners: 'No', pregnant: 'No', alcohol_24hrs: 'No', eaten_4hrs: 'No' }`:

- `allergies` has `critical: true` but no `required: true`, so the outer condition is satisfied but the inner `if (q.required)` is not, and no error is pushed.
- `conditions` behaves the same way.
- `medications` has neither flag, so it is skipped entirely.
- `blood_thinners`, `pregnant`, `alcohol_24hrs`, and `eaten_4hrs` all have `required: true` and all have non-empty string answers.

**Expected output:** `{ isValid: true, errors: [] }`.

Given `responses = {}` instead:

- `blood_thinners` → `!undefined` is `true`, `q.required` is `true` → error pushed: `"Please answer: Taking blood thinners or aspirin?"`
- `pregnant` → error pushed.
- `alcohol_24hrs` → error pushed.
- `eaten_4hrs` → error pushed.

**Expected output:** `{ isValid: false, errors: [4 items] }`, with `allergies` and `conditions` correctly excluded despite being flagged `critical`.

**Observation:** The `critical` flag is carried through to `formatForPDF()` as `isCritical`, but it has no effect on validation. A studio that wants allergies and conditions to block submission must set `required: true` on those questions in the builder. The distinction between `critical` and `required` is not surfaced in the UI copy shown in the source.

---

### 5. Data Integrity

**Result: PASS**

- `medicalQuestions` is a frozen-shape object literal with seven entries: `allergies`, `conditions`, `medications`, `blood_thinners`, `pregnant`, `alcohol_24hrs`, `eaten_4hrs`. Each carries a stable `id` matching its key. `allergies` and `conditions` declare `other_field: true` and `critical: true`; `blood_thinners` and `pregnant` declare `required: true` and `critical: true`; `alcohol_24hrs` and `eaten_4hrs` declare `required: true` only.
- `getLocalizedQuestions()` clones before mutating, so repeated language switches cannot accumulate drift in the source object.
- The module exports correctly for both environments: `if (typeof module !== 'undefined' && module.exports)` assigns to `module.exports`, otherwise it attaches `MedicalHistorySystem` and `medicalQuestions` to `window`.
- The builder's own integrity checker, described in `documentation.html`, is documented to catch circular logic dependencies, empty option sets, duplicate option labels, inverted validation bounds, invalid regex patterns, duplicate CRM aliases, and missing labels. The `ConditionalLogic` engine's recursion into `container` fields means a cycle between a container and its child is reachable by the checker, which is the case the docs call out.
- The CRM alias contract is stated clearly: exports use the alias, so renaming a question does not break a downstream spreadsheet or integration. This is the correct design for a form that feeds other systems.

**Observation:** `documentation.html` states the piercing consent template ships with "7 sections and 28 fields, 18 of them mandatory". This figure cannot be verified from the provided source because the template definitions live in a file not included in this review. It is recorded here as a documentation claim, not a verified fact.

---

### 6. Accessibility (WCAG Basics)

**Result: PASS with observations**

| Check | Finding |
|-------|---------|
| Landmarks | `nav[aria-label="Breadcrumb"]`, `nav[aria-label="Mobile Builder Navigation"]`, one `main`, two `aside` panels, one `header`. PASS. |
| Headings | Single `h1` in `index.html`. `documentation.html` uses `h1` then `h2` per section with `h3` for FAQ questions. PASS. |
| Form labels | `template-select` and `global-language-select` both have explicit `<label for>`. Palette search has `aria-label`. PASS. |
| Live regions | `#palette-search-results-count` and `#recently-deleted-bin` both carry `aria-live="polite"`. PASS. |
| Toggle state | `#btn-toggle-canvas-grid` and `#btn-toggle-smart-snap` both carry `aria-pressed` with initial values `"false"` and `"true"` respectively. PASS. |
| Keyboard shortcuts | Documented in `documentation.html`: `Ctrl+Z`, `Ctrl+Y`, `Ctrl+Shift+Z`, `Shift+click`, `Ctrl+D`, `Delete`/`Backspace`, `Ctrl+S`, arrow keys, `Tab`/`Shift+Tab`, `Ctrl+F`, `Esc`. PASS. |
| Tooltips | Extensive `title` attributes paired with `data-i18n-title` throughout the header and canvas toolbar. PASS. |
| Reduced motion | No `prefers-reduced-motion` query found in the provided CSS. OBSERVATION. |
| Focus visibility | `a11y.css` is loaded but its contents are not in this review. UNVERIFIED. |

**Observation:** The `#recently-deleted-bin` is a live region that appears and disappears. If it is shown while a screen reader user is mid-task, the announcement may interrupt. The `aria-live="polite"` setting is the right choice here, so this is a note rather than a defect.

**Observation:** The body map canvas is a `<canvas>` element with no `role`, no `aria-label`, and no text alternative. The pins list below it (`#pins-list-${this.fieldId}`) does render each pin as readable HTML with label, notes, view, and coordinates, which provides a usable text equivalent for the marker data. The anatomical diagram itself has no accessible description. A screen reader user can read the placed markers but cannot perceive the diagram they are placed on.

---

### 7. Cross-Browser

**Result: PASS with observations**

- All four vendor libraries are served locally from `/tools/form-builder/js/vendor/`: `sortable.min.js`, `jspdf.umd.min.js`, `signature_pad.umd.min.js`, `d3.min.js`. The source comment explains why: the site CSP allows scripts from `'self'` only, so CDN loads are blocked in production. Versions are pinned and the comment instructs updating by re-downloading rather than editing the URL. This is the correct approach for a CSP-restricted deployment.
- `document.currentScript.src` is used in `js/i18n.js` to resolve `i18n.json`. This is supported in all current browsers but returns `null` in ES modules and in some legacy contexts. The file is loaded as a classic script, so this is safe as shipped.
- `ctx.roundRect()` is used in `redraw()` for the pin label background. This is available in Chrome 99+, Firefox 112+, and Safari 16.4+. Older browsers will throw on the pin label draw. The call is inside `redraw()` with no feature guard.
- `btoa(unescape(encodeURIComponent(svgXml)))` in `exportMergedImage()` uses `unescape`, which is deprecated but universally supported. The `encodeURIComponent` wrapper correctly handles non-ASCII characters in the SVG.
- `XMLSerializer` and `canvas.toDataURL()` are universally supported.
- Touch events are bound with `{ passive: false }` on `touchstart` and `touchmove`, which is required for `e.preventDefault()` to work. Correct.

**Observation:** The `roundRect` dependency is the only modern API in the drawing path without a fallback. On a browser older than the versions above, the pin marker circle and number will still draw, but the label background will throw and abort the rest of `redraw()` for that frame.

---

## Performance Notes

The tool is a static asset bundle with no build step and no server round-trips beyond the initial page load and the single `i18n.json` fetch.

- **Vendor libraries:** Four pinned files in `js/vendor/`. `jspdf.umd.min.js` is the heaviest of the four, as expected for a PDF generator. `sortable.min.js`, `signature_pad.umd.min.js`, and `d3.min.js` are all small in their minified UMD forms.
- **Application code:** `conditional-logic.js`, `i18n.js`, and `medical-history.js` are each a few hundred lines. `body-map-annotator.js` is the largest application file, dominated by inline SVG path data for the four anatomical views.
- **Network surface:** One `fetch` call, to `i18n.json`. No analytics, no fonts beyond the Google Fonts stylesheet, no telemetry.
- **Render path:** The canvas is fixed at an internal 600x400 coordinate space and scaled to `width: 100%` with `height: auto`. `resizeCanvas()` computes a display size but then hardcodes the internal dimensions, so the canvas never reallocates on window resize. This is efficient and avoids the blurry-canvas problem.
- **Redraw cost:** `redraw()` clears and repaints all strokes and all pins on every pointer move during a draw operation. For a form with a handful of strokes this is negligible. A pathologically long freehand stroke would push a growing `points` array through `lineTo` on each frame.
- **Autosave:** `documentation.html` states the builder writes a draft to local storage after every change. Local storage writes are synchronous but small for a form schema.

**Observation:** `exportMergedImage()` creates a new 600x400 offscreen canvas on every call. `getData()` calls it, and `getData()` is called from `triggerChange()`, which fires on every pin drop, stroke end, undo, and clear. The offscreen canvas is allocated and discarded each time. For a form with active body map editing this is a steady stream of short-lived allocations. The offscreen canvas is also never actually used for output, per the FAIL in section 3, so the allocation is pure waste.

---

## Security Assessment

**Result: PASS**

- **Network surface:** The only outbound request in the provided source is `fetch(I18N_URL)` in `js/i18n.js`, which resolves to a same-origin `i18n.json`. No client data is transmitted. The privacy claim in `documentation.html` is accurate as far as the provided files show.
- **CSP posture:** The source comment in `index.html` states the site CSP allows scripts from `'self'` only, and all four vendor libraries are served locally as a result. This is a strong posture and the code respects it.
- **XSS handling:** `BodyMapAnnotator.escapeHtml(str)` escapes `&`, `<`, `>`, `"`, and `'` before interpolating pin labels and notes into `renderPinsListHTML()`. Pin labels and notes come from `prompt()` calls, i.e. user input, so this escaping is load-bearing. It is applied correctly to both `pin.label` and `pin.notes`.
- **i18n interpolation:** `t()` builds a `RegExp` from a parameter key and replaces `{key}` occurrences in the translation string. The key comes from the calling code, not from user input, so there is no injection path here. The replacement value is inserted as a string, not as HTML.
- **`data-i18n-html` handling:** `translateDOM()` sets `el.innerHTML = translation` for elements carrying `data-i18n-html`. This is an intentional escape hatch for translations containing markup. It is safe as long as the translation files are trusted assets, which they are, since they ship with the tool.
- **No backend:** `documentation.html` states plainly that the tool has no backend and that submissions cannot be collected through Poli. This removes an entire class of server-side risk.
- **Data residency:** Forms, client answers, signatures, and generated PDFs stay in the browser. The documentation correctly notes that this makes the studio the data controller and that GDPR, PDPA, and local health-records obligations are unchanged.

**Observation:** `localStorage` is used for the language preference (`poli_form_builder_lang`) and, per the documentation, for draft form data. Local storage is origin-scoped and not encrypted. On a shared studio tablet running kiosk mode, a subsequent user of the same browser profile could in principle read a previous client's draft. The documentation does not address kiosk-mode data isolation. This is a workflow recommendation rather than a code defect, but it is worth stating explicitly for studios that hand a tablet to clients.

---

## Edge Cases Tested

| Case | Source location | Expected behaviour | Result |
|------|----------------|-------------------|--------|
| Empty `formData` passed to `evaluate` | `conditional-logic.js` | Returns `{}` immediately via `if (!formData || !formData.sections) return updates;` | PASS |
| Field with no `conditional` key | `conditional-logic.js` | `updates[field.id] = true` | PASS |
| Unknown operator string | `conditional-logic.js` | `console.warn` and return `true` (fail-open, field stays visible) | PASS, with note |
| `null` or `undefined` response value | `conditional-logic.js` | `currentStr` becomes `''`, so `is_empty` returns `true` and `equals` returns `false` | PASS |
| Array response against `equals` | `conditional-logic.js` | `.some()` over the array, not string coercion | PASS |
| `is_checked` against a non-empty array | `conditional-logic.js` | Returns `true` via the `Array.isArray(value) && value.length > 0` clause | PASS |
| Missing translation key | `i18n.js` | Falls back to `en` tree, then to caller fallback, then to the raw key path | PASS |
| Unsupported stored language | `i18n.js` | `supportedLanguages.includes(storedLang)` fails, falls through to browser detection | PASS |
| `navigator.language` throws | `i18n.js` | `try`/`catch` returns `'en'` | PASS |
| `i18n.json` fetch fails | `i18n.js` | `catch` logs a warning, `translations` stays `{}`, all lookups fall through to fallbacks | PASS |
| User cancels the pin label prompt | `body-map-annotator.js` | `if (label === null) return;` aborts without adding a pin | PASS |
| Empty pin label after trim | `body-map-annotator.js` | `label.trim() \|\| \`Placement #${nextNum}\`` supplies a default | PASS |
| Pin placed outside canvas bounds | `body-map-annotator.js` | `getCanvasCoordinates` clamps to `[0, width]` and `[0, height]` | PASS |
| Touch input on the canvas | `body-map-annotator.js` | `e.touches[0].clientX` / `clientY` used when `e.touches.length > 0` | PASS |
| Clear with no pins or strokes | `body-map-annotator.js` | `confirm()` dialog, then empty arrays, then `redraw()` on an empty canvas | PASS |
| `formatForPDF` with an array answer | `medical-history.js` | `val.join(', ')` | PASS |
| `formatForPDF` with a missing answer | `medical-history.js` | `responses[q.id] \|\| 'N/A'` | PASS |
| `validateMedicalHistory` with `critical` but not `required` | `medical-history.js` | No error pushed, because the inner check is `if (q.required)` | PASS, by design |
| `addPin` public method | `body-map-annotator.js` | Delegates to `this.addPinAtCoordinate`, which does not exist | FAIL |
| `exportMergedImage` with an SVG present | `body-map-annotator.js` | Should composite SVG + canvas; returns canvas only | FAIL |
| `exportMergedImage` when `this.canvas` is null | `body-map-annotator.js` | `if (!this.canvas) return null;` | PASS |
| `exportMergedImage` when `toDataURL` throws | `body-map-annotator.js` | `catch` logs a warning and returns `this.canvas.toDataURL()` again, which will throw again | OBSERVATION |

**Observation on fail-open logic:** An unrecognised operator returns `true`, meaning the field stays visible. This is the safer default for a consent form, since hiding a question the client should answer is worse than showing one they should not. It is worth noting that the `console.warn` is the only signal, so a typo in an operator string will not surface in the UI.

**Observation on the `exportMergedImage` catch block:** If `this.canvas.toDataURL('image/png')` throws inside the `try`, the `catch` calls the same method again on the same canvas. If the throw was caused by a tainted canvas or a browser restriction, the second call will throw uncaught. The `catch` should return `null` rather than retrying the failing call.

---

## Final Verdict

**Production Ready.**

The Consent Form Builder is a well-structured, privacy-preserving, client-side tool. The conditional logic engine handles the value shapes it will actually encounter in a consent form, including array answers from checkbox groups and numeric comparisons for age gates. The i18n layer is defensive, with a three-tier fallback chain and a documented calling convention. The medical history module validates required fields correctly and distinguishes `critical` from `required` in a way that is consistent with its own PDF formatter. The HTML is semantic, the ARIA coverage is thorough, and the security posture is strong: one same-origin fetch, local vendor libraries, and no backend.

Two defects should be fixed before the body map feature is promoted as a PDF-embeddable asset:

1. **`exportMergedImage()` does not composite the SVG background.** The method creates an `Image` from the serialized SVG and never draws it, then returns `this.canvas.toDataURL()` directly, bypassing the offscreen canvas entirely. Any exported body map will show pins and strokes on a transparent background with no anatomy behind them. The fix is to await the image load and draw it to the offscreen canvas before drawing `this.canvas` on top, then return `offscreen.toDataURL()`.
2. **`addPin()` delegates to a non-existent method.** `this.addPinAtCoordinate` is called but never defined. Either implement it or remove the public `addPin` wrapper.

Minor recommendations, none blocking:

- Add a `roundRect` feature guard in `redraw()` so the pin label background degrades gracefully on browsers older than Chrome 99, Firefox 112, and Safari 16.4.
- Change the `catch` block in `exportMergedImage()` to return `null` instead of retrying the call that just threw.
- Reconcile the `og:url` (`https://poliinternational.com/form-builder/`) with the live path (`https://poliinternational.com/tools/form-builder/`).
- Document the `critical` vs `required` distinction in the builder UI, since `critical` currently has no effect on validation.
- Add a note to `documentation.html` about kiosk-mode data isolation on shared tablets, since drafts persist in local storage.
- Consider adding `pre

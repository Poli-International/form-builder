# Consent Form Builder - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Schemas](#data-schemas)
3. [Calculation / Logic Algorithms](#calculation--logic-algorithms)
4. [API Reference](#api-reference)
5. [Integration Guide](#integration-guide)
6. [Customization](#customization)
7. [Performance](#performance)
8. [Browser Compatibility](#browser-compatibility)
9. [Security](#security)
10. [Version History](#version-history)
11. [Support / Contact](#support--contact)

---

## Architecture Overview

### Technology Stack

The Consent Form Builder is a **client-side, dependency-free static web application**. It is built with plain HTML, CSS, and vanilla JavaScript (ES6 classes and object literals). There is no build step, no framework, and no backend.

**Vendored libraries** (served locally from `/tools/form-builder/js/vendor/`, pinned versions, loaded via `<script>` tags because the site CSP allows scripts from `'self'` only):

| Library | Purpose |
|---|---|
| `sortable.min.js` | Drag-and-drop reordering of fields on the canvas |
| `jspdf.umd.min.js` | PDF generation for consent form export |
| `signature_pad.umd.min.js` | Digital signature capture |
| `d3.min.js` | Data-driven visualizations (used by builder tooling) |

**Fonts:** Inter (400, 500, 600) loaded from Google Fonts.

**Styling:** `/tools/form-builder/css/style.css` plus shared accessibility stylesheet `/tools/shared/a11y.css`.

### File Structure

```
/tools/form-builder/
├── index.html                  # Builder shell: header, palette, canvas, properties panel
├── documentation.html          # End-user guide (templates, logic, PDF, embedding)
├── i18n.json                   # Translation strings for 7 languages
├── css/
│   └── style.css
└── js/
    ├── vendor/
    │   ├── sortable.min.js
    │   ├── jspdf.umd.min.js
    │   ├── signature_pad.umd.min.js
    │   └── d3.min.js
    ├── body-map-annotator.js   # Anatomical body/ear/face/hand map widget
    ├── conditional-logic.js    # Field visibility engine
    ├── i18n.js                 # Internationalization manager
    ├── medical-history.js      # Medical screening question bank
    └── drag-drop-builder.js    # (referenced) main FormBuilderApp
```

### Component / Logic Breakdown

The application is organized into four cooperating modules plus a main builder app:

1. **`FormBuilderApp`** (in `drag-drop-builder.js`, referenced by other modules), owns the canvas, palette, properties editor, autosave, and preview handoff. Exposes `renderPalette()`, `renderCanvas()`, `renderPropertiesEditor()`, `renderRecommendedFields()`, `triggerAutoSave()`, and `showToast()`.
2. **`I18nManager`** (`js/i18n.js`), loads `i18n.json`, applies translations to the DOM via `data-i18n*` attributes, and translates form schemas through `FormTranslator`.
3. **`ConditionalLogic`** (`js/conditional-logic.js`), evaluates per-field visibility rules against client responses.
4. **`MedicalHistorySystem`** (`js/medical-history.js`), provides a canonical medical screening question bank and validation.
5. **`BodyMapAnnotator`** (`js/body-map-annotator.js`), interactive SVG + canvas anatomical annotator for placement marking.

The UI is a three-panel layout (palette / canvas / properties), with a mobile segmented tab bar (`#mobile-panel-tabs`) that switches between the three panels on small screens. A separate `#preview-interface` renders the client-facing form.

---

## Data Schemas

### Form Schema (top-level)

The builder operates on a form object with `sections`, each containing `fields`. Fields may nest inside `container` type fields.

```js
{
  sections: [
    {
      id: "medical_history_generated",
      title: "Medical History",
      fields: [ /* field objects */ ]
    }
  ]
}
```

### Field Object

Fields referenced throughout the code carry these properties (as used by `ConditionalLogic` and the properties editor):

```js
{
  id: "allergies",                 // unique field id
  type: "checkbox_group",          // see field types below
  label: "Allergies (check all that apply)",
  required: true,
  critical: true,                  // medical-history flag
  options: ["Latex", "Adhesives", "..."],
  other_field: true,               // renders an "Other (please specify)" input
  placeholder: "List all prescription and OTC medications",
  rows: 3,
  conditional: { /* see Conditional Logic */ },
  fields: [ /* nested fields, only when type === "container" */ ]
}
```

Field types referenced in the code: `text`, `textarea`, `radio`, `select`, `checkbox_group`, `container`. The palette advertises **17 field types** grouped into Basic input, Choice & options, Layout & structure, Notices & legal, and Clinical & media (per `documentation.html`).

### Medical Question Bank (`medicalQuestions`)

Defined as a constant object in `js/medical-history.js`. Seven questions:

```js
{
  allergies: {
    id: 'allergies',
    type: 'checkbox_group',
    label: 'Allergies (check all that apply)',
    options: ['Latex', 'Adhesives', 'Metals (nickel, etc.)', 'Antibiotics',
              'Topical anesthetics', 'Ink ingredients', 'Other (please specify)'],
    other_field: true,
    critical: true
  },
  conditions: {
    id: 'conditions',
    type: 'checkbox_group',
    label: 'Medical Conditions',
    options: ['Diabetes', 'Hemophilia / Bleeding disorder', 'Heart condition',
              'Epilepsy / Seizures', 'Skin conditions (eczema, psoriasis)',
              'Keloid scarring tendency', 'Immune system disorder',
              'Hepatitis', 'HIV/AIDS', 'Other (please specify)'],
    other_field: true,
    critical: true
  },
  medications: {
    id: 'medications',
    type: 'textarea',
    label: 'Current Medications',
    placeholder: 'List all prescription and OTC medications',
    rows: 3
  },
  blood_thinners: {
    id: 'blood_thinners',
    type: 'radio',
    label: 'Taking blood thinners or aspirin?',
    options: ['Yes', 'No'],
    required: true,
    critical: true
  },
  pregnant: {
    id: 'pregnant',
    type: 'radio',
    label: 'Pregnant or nursing?',
    options: ['Yes', 'No', 'Not applicable'],
    required: true,
    critical: true
  },
  alcohol_24hrs: {
    id: 'alcohol_24hrs',
    type: 'radio',
    label: 'Consumed alcohol in last 24 hours?',
    options: ['Yes', 'No'],
    required: true
  },
  eaten_4hrs: {
    id: 'eaten_4hrs',
    type: 'radio',
    label: 'Eaten within last 4 hours?',
    options: ['Yes', 'No'],
    required: true
  }
}
```

### Conditional Rule Schema

Used inside a field's `conditional` property and evaluated by `ConditionalLogic.check()`:

```js
// Single rule
{ show_if: { field: "blood_thinners", operator: "equals", value: "Yes" } }

// All rules must pass
{ show_if_all: [ { field, operator, value }, ... ] }

// Any rule must pass
{ show_if_any: [ { field, operator, value }, ... ] }
```

Supported operators: `equals` / `eq`, `not_equals` / `neq`, `contains`, `not_contains`, `is_checked`, `is_not_checked`, `greater_than` / `gt`, `greater_equal` / `gte`, `less_than` / `lt`, `less_equal` / `lte`, `is_empty`, `is_not_empty`.

### Body Map Data (`BodyMapAnnotator`)

```js
// Pin
{
  id: "pin_ab12c",
  number: 1,
  x: 240, y: 180,                 // internal canvas coords (600x400 space)
  label: "Conch / Daith",
  notes: "16G ASTM F-136 Titanium 5/16\" Labret",
  view: "ears",                   // body_front_back | ears | face | hands_arms
  color: "#dc2626"
}

// Stroke
{
  color: "#dc2626",
  size: 3,
  points: [ { x, y }, { x, y }, ... ]
}

// Widget data payload (getData())
{ view, pins: [...], strokes: [...], dataUrl: "<base64 PNG>" }
```

### i18n Schema

`i18n.json` is a nested object keyed by language code (`en`, `fr`, `it`, `de`, `es`, `nl`, `pt`). Keys are dotted paths such as `header.template_label`, `palette.title`, `medical.allergies.label`, `templates.<id>`, `template_categories.<category>`. Values may be strings (with `{name}` placeholders) or nested objects.

---

## Calculation / Logic Algorithms

### 1. Conditional Visibility Evaluation, `ConditionalLogic.evaluate(formData, responses)`

**Inputs:** the form schema and the current client responses map (`fieldId → value`).

**Steps:**
1. Initialize an empty `updates` map (`fieldId → boolean`).
2. Walk every section in `formData.sections`.
3. For each field in `section.fields`:
   - If the field has a `conditional` property, compute `isVisible = ConditionalLogic.check(field.conditional, responses)` and store it in `updates[field.id]`.
   - Otherwise, mark the field visible (`updates[field.id] = true`).
   - If the field is a `container` with nested `fields`, recurse into them.
4. Return the `updates` map.

### 2. Rule Evaluation, `ConditionalLogic.check(conditionConfig, responses)`

Dispatches on the shape of `conditionConfig`:
- `show_if` → single `checkSingle`.
- `show_if_all` → `every()` over `checkSingle`.
- `show_if_any` → `some()` over `checkSingle`.
- No recognized key → returns `true` (visible).

### 3. Single-Rule Comparison, `ConditionalLogic.checkSingle(rule, responses)`

**Steps:**
1. Look up `value = responses[rule.field]`.
2. Normalize both sides: `targetValue = String(rule.value).trim().toLowerCase()` and `currentStr = String(value).trim().toLowerCase()`.
3. Switch on `rule.operator`:
   - `equals` / `eq`: if `value` is an array, returns true when any element matches; otherwise string equality.
   - `not_equals` / `neq`: inverse of the above.
   - `contains` / `not_contains`: substring test (array-aware).
   - `is_checked`: true when `value === true`, or string is `"true"` / `"yes"`, or array has length > 0.
   - `is_not_checked`: inverse.
   - `greater_than` / `gt`, `greater_equal` / `gte`, `less_than` / `lt`, `less_equal` / `lte`: numeric coercion via `Number()`.
   - `is_empty`: undefined, null, empty string, or empty array.
   - `is_not_empty`: inverse.
   - Unknown operator: logs a warning and returns `true`.

### 4. Medical History Validation, `MedicalHistorySystem.validateMedicalHistory(responses, lang)`

**Steps:**
1. Load localized questions via `getLocalizedQuestions(lang)`.
2. For each question, if `q.required || q.critical` and the response is missing/empty/empty-array:
   - If `q.required` is true, push an error string `"<prefix> <label>"` onto `errors`.
3. Return `{ isValid: errors.length === 0, errors }`.

### 5. Medical History PDF Formatting, `MedicalHistorySystem.formatForPDF(responses, lang)`

Iterates the localized question bank and returns an array of `{ label, value, isCritical }` objects. Array values are joined with `", "`. Missing values become `"N/A"`.

### 6. Body Map Coordinate Mapping, `BodyMapAnnotator.getCanvasCoordinates(e)`

**Steps:**
1. Read the canvas bounding rect.
2. Extract `clientX` / `clientY` from the event, or from `e.touches[0]` for touch input.
3. Compute `scaleX = canvas.width / rect.width` and `scaleY = canvas.height / rect.height`.
4. Convert to internal coordinates: `x = (clientX - rect.left) * scaleX`, `y = (clientY - rect.top) * scaleY`.
5. Clamp to `[0, canvas.width]` and `[0, canvas.height]`.

The internal canvas coordinate space is fixed at **600 × 400** (3:2 ratio); the display size is responsive.

### 7. Body Map Position Suggestion, `BodyMapAnnotator.suggestLabelForPosition(x, y, view)`

Returns a default label based on the current view and the pin's position:
- **ears:** y > 280 → lobe; upper regions split into helix/industrial, conch/daith, tragus/anti-tragus by x/y bands; otherwise cartilage/flat.
- **face:** y < 140 → eyebrow/forehead; y < 220 → nostril/septum/bridge; y < 300 → philtrum/medusa/labret/lip; else chin/jawline.
- **hands_arms:** y < 150 → upper arm/bicep/shoulder; y < 260 → forearm/inner wrist; else hand/knuckles/finger.
- **body_front_back:** left half (x < 300) is the front view, right half is the back view; each is subdivided into four vertical bands (head/neck, chest/upper back, abdomen/lower back, thigh/calf).

### 8. Body Map Undo, `BodyMapAnnotator.undo()`

Pops the last stroke if any exist; otherwise pops the last pin and renumbers remaining pins sequentially (`p.number = idx + 1`).

### 9. Body Map Image Export, `BodyMapAnnotator.exportMergedImage()`

Creates an offscreen 600×400 canvas, fills it white, and returns `this.canvas.toDataURL('image/png')`. The SVG background is serialized to a base64 data URL for potential compositing; on any error the method falls back to `canvas.toDataURL('image/png')` and logs a warning.

### 10. i18n Lookup, `I18nManager.t(keyPath, params, fallback)`

**Steps:**
1. Normalize the calling signature (supports `t(key, fallback)`, `t(key, params, fallback)`, `t(key, fallback, params)`).
2. Split `keyPath` on `.` and walk `this.translations[this.currentLanguage]`.
3. If not found, walk `this.translations['en']` as a fallback.
4. If still not found, return the supplied fallback or the key path itself.
5. If the resolved value is a string and `params` is a non-empty object, replace `{paramName}` tokens with the corresponding values.

### 11. Positional Interpolation, `TP(key, fallback, ...values)` (in `body-map-annotator.js`)

Looks up the key via `window.I18N` or `window.i18n`, then replaces `{0}`, `{1}`, ... with the positional arguments. Missing holes are dropped. This exists because the form builder exposes `window.i18n` while other tools expose `window.I18N`.

---

## API Reference

### `window.i18n` (I18nManager instance)

| Member | Signature | Behavior |
|---|---|---|
| `init()` | `async () => void` | Detects language, loads `i18n.json`, binds the switcher, translates the DOM, re-renders the palette/properties, dispatches `i18nInitialized`. |
| `t(keyPath, params?, fallback?)` | `(string, object\|string?, string?) => string` | Resolves a translation key with optional `{placeholder}` substitution and English fallback. |
| `setLanguage(lang)` | `(string) => void` | Persists to `localStorage` under `poli_form_builder_lang`, translates the DOM and form schema, dispatches `languageChanged`. |
| `translateDOM(container?)` | `(Element?) => void` | Applies translations to `[data-i18n]`, `[data-i18n-html]`, `[data-i18n-placeholder]`, `[data-i18n-title]`, `[data-i18n-tooltip]`, `[data-i18n-aria-label]`, `[data-i18n-value]`. |
| `detectBrowserLanguage()` | `() => string` | Returns a supported language code derived from `navigator.language`, defaulting to `en`. |
| `loadTranslations()` | `async () => void` | Fetches `../i18n.json` relative to the script URL. |
| `bindLanguageSwitcher()` | `() => void` | Wires `#global-language-select` to `setLanguage`. |
| `updateTemplateSelectOptions()` | `() => void` | Rebuilds `#template-select` options with translated template names. |
| `currentLanguage` | `string` | Active language code. |
| `supportedLanguages` | `string[]` | `['en','fr','it','de','es','nl','pt']`. |
| `ready` | `Promise` | Resolves after `init()` completes; app boot should await it. |

Global helper: `window.t(key, params, fallback)` delegates to `window.i18n.t`.

### `window.ConditionalLogic`

| Member | Signature | Behavior |
|---|---|---|
| `evaluate(formData, responses)` | `(object, object) => { [fieldId]: boolean }` | Returns visibility map for every field, recursing into containers. |
| `check(conditionConfig, responses)` | `(object, object) => boolean` | Evaluates `show_if`, `show_if_all`, or `show_if_any`. |
| `checkSingle(rule, responses)` | `({field, operator, value}, object) => boolean` | Evaluates one rule. |

### `window.MedicalHistorySystem`

| Member | Signature | Behavior |
|---|---|---|
| `getLocalizedQuestions(lang?)` | `(string?) => object` | Deep-clones `medicalQuestions` and overlays translations from `i18n.translations[lang].medical`. |
| `getMedicalSection(lang?)` | `(string?) => { id, title, fields }` | Returns a ready-to-insert form section. |
| `validateMedicalHistory(responses, lang?)` | `(object, string?) => { isValid, errors }` | Validates required questions. |
| `formatForPDF(responses, lang?)` | `(object, string?) => Array<{label, value, isCritical}>` | Formats responses for PDF rendering. |

Also exported: `window.medicalQuestions` (the raw question bank).

### `BodyMapAnnotator` (class)

Constructor: `new BodyMapAnnotator(containerId, options)` where `options` may include `{ fieldId, defaultView, pins, strokes, onChange, readOnly }`.

| Method | Signature | Behavior |
|---|---|---|
| `static getViews()` | `() => Array<{id, name, icon}>` | Returns the four available anatomical views. |
| `init()` | `() => void` | Renders UI, initializes canvas, binds events, redraws. |
| `renderUI()` | `() => void` | Injects the widget markup (toolbar, canvas, pins panel). |
| `initCanvas()` | `() => void` | Acquires the canvas 2D context and sizes it. |
| `resizeCanvas()` | `() => void` | Sets internal 600×400 space; display is 100% width. |
| `bindEvents()` | `() => void` | Wires view select, tool buttons, color dots, undo/clear, and pointer/touch handlers. |
| `getCanvasCoordinates(e)` | `(Event) => {x, y}` | Maps client coords to internal canvas coords. |
| `promptAddPin(x, y)` | `(number, number) => void` | Prompts for label and notes, then adds a pin. |
| `suggestLabelForPosition(x, y, view)` | `(number, number, string) => string` | Returns a default placement label. |
| `undo()` | `() => void` | Removes the last stroke or pin. |
| `removePin(pinId)` | `(string) => void` | Removes a pin and renumbers the rest. |
| `redraw()` | `() => void` | Clears and repaints strokes and pins. |
| `renderPinsListHTML()` | `() => string` | Returns the HTML for the pins list. |
| `updatePinsList()` | `() => void` | Refreshes the pins list and header count. |
| `triggerChange()` | `() => void` | Invokes the `onChange` callback with `getData()`. |
| `getData()` | `() => {view, pins, strokes, dataUrl}` | Serializes the widget state. |
| `setData(data)` | `(object) => void` | Restores state from a serialized payload. |
| `exportMergedImage()` | `() => string` | Returns a PNG data URL. |
| `exportPNG()` / `getDataURL()` | `() => string` | Aliases for `exportMergedImage()`. |
| `addPin(x, y, label, notes, color)` | `(...) => void` | Adds a pin at a coordinate. |
| `escapeHtml(str)` | `(string) => string` | Escapes `& < > " '` for safe HTML insertion. |

### `window.FormBuilderApp` (referenced by other modules)

Public methods invoked from other files: `renderPalette()`, `renderCanvas()`, `renderPropertiesEditor()`, `renderRecommendedFields()`, `triggerAutoSave()`, `showToast(message, type)`. The instance also exposes `currentForm`.

### `window.FormPreviewApp` (referenced)

`render()` re-renders the preview; `openResultsDashboard()` re-opens the results modal.

### `window.FormTranslator` (referenced)

`translateForm(form, lang)` translates field labels, placeholders, and options in place.

---

## Integration Guide

### Standalone Use

Open the tool directly in a browser:

```
https://poliinternational.com/tools/form-builder/
```

No installation, account, or server is required. All state (drafts, signatures, generated PDFs) lives in the browser's local storage and memory.

### Embedding via iframe

The tool is designed to be embedded. The documentation page publishes this snippet:

```html
<iframe src="https://poliinternational.com/tools/form-builder/index.html"
        width="100%" height="1000" frameborder="0"
        style="border-radius:12px;"></iframe>
```

### Theme Integration

When the tool detects it is running inside an iframe (`window.self !== window.top`), it listens for a `postMessage` event of shape:

```js
{ type: 'poli-theme', light: true | false }
```

On receipt it toggles `data-theme` on `<html>` and the `dark-mode` / `light-mode` classes on `<body>`. The default when embedded is dark mode.

### QR Placard

`Options → Embed / QR Code` generates a printable QR placard that clients can scan to open the form on their own device.

### Data Portability

- **Export JSON** (`Ctrl+S`) writes the full form schema.
- **Import JSON** loads a schema file.
- **Bulk Import CSV** builds fields from a spreadsheet with columns `Label,Type,Required,HelperText,Options` (options separated by `;`).
- **Export CSV Template** produces column headers matching field labels for CRM migration.
- **Export Field IDs & CRM Map** produces a reference of every question, its alias, data type, and validation rule, plus a sample webhook payload.

There is no backend. To collect submissions, wire the exported schema into your own system.

### Dependency-Free Static Hosting

The application is plain HTML/CSS/JS with vendored libraries. It can be served from any static host. The only network requests at runtime are the page's own assets and `i18n.json`.

---

## Customization

- **Theme Customizer** (`Options → Theme Customizer`): primary colors, font sizes, border-radius.
- **PDF & Print Settings** (`Options → PDF Settings`): paper size, margins, studio watermark or logo, and a "Print after Signature" toggle.
- **Templates**: eight starting points (Tattoo Consent & Release, Piercing Consent & Release, Medical History & Health Screening Intake, Multi-Session Tattoo Project Master Agreement, Minor Consent & Legal Guardian Authorization, Cover-Up & Rework Assessment, PMU & Cosmetic Tattoo Consultation, Blank Custom Form).
- **Language**: seven UI and template languages, persisted per browser under `poli_form_builder_lang`.
- **CSS**: styling is centralized in `/tools/form-builder/css/style.css`; the documentation page defines its own scoped CSS variables for light/dark theming.

---

## Performance

- All logic runs client-side; there are no network round-trips for form editing, validation, or PDF generation.
- The body map canvas uses a fixed 600×400 internal coordinate space regardless of display size, keeping redraw cost constant.
- The i18n module loads `i18n.json` once and caches it in memory; subsequent language switches reuse the loaded dictionary.
- The builder autosaves to local storage after every change (`triggerAutoSave()`), which is a synchronous write but small in payload.

---

## Browser Compatibility

- Requires JavaScript and HTML5 (declared in the schema markup as `browserRequirements`).
- Uses `class`, arrow functions, template literals, `Promise`, `async`/`await`, `URL`, `CustomEvent`, `localStorage`, `CanvasRenderingContext2D.roundRect`, and `XMLSerializer`.
- Touch events are bound for tablet and mobile use (`touchstart`, `touchmove`, `touchend`), with `{ passive: false }` so `preventDefault()` works during drawing.
- The tool is intended to run in any modern evergreen browser on desktop or tablet.

---

## Security

- **No backend, no data transmission.** The builder makes no network requests other than loading its own translation file. Forms, client answers, signatures, and generated PDFs are created and stored in the browser only.
- **XSS handling in the body map.** `BodyMapAnnotator.escapeHtml(str)` escapes `&`, `<`, `>`, `"`, and `'` before interpolating user-supplied pin labels and notes into the pins list HTML.
- **CSP compatibility.** Vendored libraries are served from `'self'` because the site CSP blocks third-party script origins; versions are pinned and updated by re-downloading rather than by editing URLs.
- **Iframe theme messages.** The embedded theme listener only acts on messages whose `data.type === 'poli-theme'` and coerces `data.light` to a boolean.
- **Data controller responsibility.** Because records stay on the device, the studio remains the data controller for them; obligations under GDPR, PDPA, or local health-records law are unchanged, and storage of exported PDFs is the studio's responsibility.

---

## Version History

### 1.0.0
- Initial release of the Consent Form Builder.
- Eight form templates covering tattoo, piercing, medical screening, multi-session projects, minor consent, cover-up assessment, PMU consultation, and blank custom forms.
- Seventeen field types across five palette categories.
- Conditional logic engine with `show_if`, `show_if_all`, and `show_if_any` rules and twelve operators.
- Data integrity checker for circular dependencies, empty option sets, duplicate labels, inverted bounds, invalid regex, duplicate CRM aliases, and missing labels.
- Digital signature capture and PDF export with paper size, margins, and watermark/logo controls.
- Tablet Kiosk Mode and iframe/QR embedding.
- JSON and CSV import/export, CSV template export, schema mapping PDF, and field ID / CRM map export.
- Anatomical body map annotator with four views (full body, ears, face, arms & hands), pin and freehand tools, five marker colors, undo, and PNG export.
- Seven-language interface and template translation (EN, FR, IT, DE, ES, NL, PT).
- Client-side only; no server-side storage or transmission.

---

## Support / Contact

For questions, bug reports, or feature requests:

**Email:** support@poliinternational.com

**Project:** https://poliinternational.com/tools/form-builder/

**Repository:** https://github.com/poli-international/form-builder

**License:** MIT

**Publisher:** Poli International, https://poliinternational.com

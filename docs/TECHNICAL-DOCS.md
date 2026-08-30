# Technical Architecture & Developer Reference

The **Poli International Studio Consultation Form Builder (Tool #13)** is an enterprise client-side Single Page Application (SPA) built with pure vanilla TypeScript/JavaScript, CSS3 design tokens, HTML5 canvas, SortableJS, and jsPDF. It runs entirely client-side without requiring a backend database or remote API keys, guaranteeing 100% privacy and zero health data leakage (GDPR compliant by design).

---

## 🏗️ Architecture Overview

```
├── index.html                    # Builder interface, modal dialogs, script/style entry point
├── documentation.html            # Standalone user manual (also linked from Options -> Documentation)
├── i18n.json                     # 7-language dictionary, 1,159 leaf keys per language
├── css/
│  └── style.css                  # Single stylesheet: tokens, layout, components, dark mode, print
├── js/
│  ├── vendor/                    # Pinned third-party libraries, served locally rather than from a CDN
│  │  ├── sortable.min.js         # SortableJS 1.15.6 - drag and drop
│  │  ├── jspdf.umd.min.js        # jsPDF 2.5.1 - vector PDF export
│  │  ├── signature_pad.umd.min.js# signature_pad 4.1.7 - canvas signature capture
│  │  └── d3.min.js               # D3 7.9.0 - submission trend chart
│  ├── i18n.js                    # I18nManager: dictionary load, DOM localization, language switch
│  ├── form-translator.js         # Schema translator for labels, options and waiver text
│  ├── templates.js               # 8 pre-configured studio intake schemas
│  ├── medical-history.js         # Clinical question set, contraindication and safety callouts
│  ├── body-map-annotator.js      # Anatomical body map placement marker
│  ├── drag-drop-builder.js       # Core builder engine, SortableJS coordinator, integrity checker
│  ├── pdf-generator.js           # jsPDF renderer with watermark and print automation
│  ├── signature-capture.js       # High-DPI canvas wrapper for touch/stylus signatures
│  ├── conditional-logic.js       # Conditional visibility graph evaluator (show_if)
│  ├── multisession-planner.js    # Version engine, diff analyzer, auto-checkpoint manager
│  ├── form-preview.js            # Client intake preview, kiosk mode, results dashboard
│  └── common.js                  # Shared utilities, toasts, debounce, modal helpers
└── docs/
   ├── USER-GUIDE.md              # Feature manual
   ├── TECHNICAL-DOCS.md          # This file
   ├── TEMPLATE-GUIDE.md          # Template schema reference
   └── screenshots/               # Real captures of the running tool
```

Script order in `index.html` matters. The four vendor libraries load first, then
`i18n.js`, then the feature modules, then `common.js` last: `common.js` owns the
DOMContentLoaded boot and awaits `window.i18n.ready` before anything renders.

---

## 📦 Core Modules & System Design

### 1. `drag-drop-builder.js` (Core Engine)
- **Form Schema State**: Maintains the canonical `currentForm` JSON tree with nested sections and field arrays.
- **SortableJS Integration**: Manages multiple connected drop zones across section containers with smooth drag-and-drop animations.
- **Data Integrity Engine (`runDataIntegrityCheck`)**:
 - Validates options for `select`, `radio`, and `checkbox_group`.
 - Builds a dependency graph to detect circular logic loops (A → B → A).
 - Verifies minimum/maximum numerical constraints and string length boundaries.
 - Automatically identifies missing labels and placeholder-only configurations.
- **Property Search & Category Filtering (`jumpToProperty`)**: Real-time attribute filtering with instant keyboard focus.
- **Canvas Keyboard HUD & 5px Nudging**: Captures `keydown` events when fields are selected, calculating boundary-safe offsets and dispatching visual feedback.

### 2. `i18n.js` & `form-translator.js` (Multilingual Engine)
- **`I18nManager`**: Recursively scans the DOM for `data-i18n`, `data-i18n-title`, `data-i18n-placeholder`, and `data-i18n-aria-label` attributes.
- **`FormTranslator`**: Translates form schemas on the fly when switching languages (EN, FR, IT, DE, ES, NL, PT), preserving user modifications while mapping studio legal consent terms.

### 3. `multisession-planner.js` (Versioning & Diffing)
- **Snapshot Storage**: Persists named versions and automatic checkpoints to `localStorage` with full JSON schemas and field metadata.
- **Diff Engine**: Computes schema additions, deletions, and property modifications between any two historical snapshots.

### 4. `pdf-generator.js` (PDF Vector Generation)
- **jsPDF Renderer**: Generates crisp, multi-page vector PDFs formatted for A4 and US Letter.
- **Watermark Engine**: Computes alpha-blended studio logo watermarks centered across each page.
- **Layout Densities**: Supports Standard (16mm margins) and Compact (10mm margins) for variable page count optimization.

### 5. `signature-capture.js` (Digital Signatures)
- **High-DPI Canvas**: Automatically scales canvas buffer dimensions based on `window.devicePixelRatio` for razor-sharp stylus and finger signatures.
- **Timestamping & Audit Trails**: Embeds UTC ISO timestamps and legal sound mind declarations directly into signature metadata.

---

## 📊 Form Schema Specification

```json
{
 "id": "tattoo_consent",
 "name": "Tattoo Consent & Release Agreement",
 "language": "en",
 "category": "Tattoo",
 "description": "Comprehensive studio consultation, medical safety disclosure, and legal waiver.",
 "sections": [
  {
   "id": "studio_artist_info",
   "title": "Studio & Tattooist Information",
   "collapsed": false,
   "hidden": false,
   "fields": [
    {
     "id": "studio_name",
     "type": "text",
     "label": "Studio Name",
     "required": true,
     "value": "Poli International Tattoo Studio",
     "placeholder": "Studio / Shop Name",
     "labelAlign": "top",
     "validation": "text"
    },
    {
     "id": "requires_doctor_clearance",
     "type": "radio",
     "label": "Do you have any medical condition requiring physician clearance?",
     "options": ["No - I have no high-risk conditions", "Yes - I have doctor clearance"],
     "required": true
    },
    {
     "id": "doctor_details",
     "type": "text",
     "label": "Physician Name & Clinic",
     "required": false,
     "conditional": {
      "show_if": {
       "field": "requires_doctor_clearance",
       "operator": "contains",
       "value": "Yes"
      }
     }
    }
   ]
  }
 ]
}
```

---

## 🧪 Testing & Quality Assurance

Run the automated test runner in your CLI:

```bash
```

Or open the browser console on `index.html` and run:

```javascript
window.TestSuite.runAll();
```

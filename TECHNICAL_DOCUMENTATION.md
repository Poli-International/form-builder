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

## Architecture Overview

### Technology Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom stylesheets) |
| JavaScript | Vanilla JS (ES6) |
| Drag-and-Drop | SortableJS (CDN) |
| PDF Generation | jsPDF 2.5.1 (CDN) |
| Signature Capture | Signature Pad 4.1.7 (CDN) |
| Fonts | Google Fonts (Inter) |

The tool is a standalone static HTML/CSS/JS application. No server-side dependencies, no build tools, no database. All processing occurs client-side.

### File Structure

```
form-builder/
├── index.html                  # Main tool page with tabs (Tool, Documentation, Embed)
├── documentation.html          # Inline documentation (loaded in iframe)
├── embed.html                  # Standalone embeddable version
├── css/
│   ├── poli-standard.css       # Standard Poli styles
│   └── style.css               # Tool-specific styles
└── js/
    ├── common.js               # Theme toggle, iframe resizing, embed modal
    ├── templates.js            # Form template definitions (6 templates)
    ├── medical-history.js      # Medical history questions and validation
    ├── drag-drop-builder.js    # FormBuilder class (drag-and-drop canvas)
    ├── conditional-logic.js    # ConditionalLogic engine
    ├── form-preview.js         # FormPreview class (renders live preview)
    ├── signature-capture.js    # SignatureManager class (Signature Pad wrapper)
    ├── pdf-generator.js        # PDFGenerator (jsPDF wrapper)
    └── tests/
        └── test-suite.js       # Automated test suite
```

### Component / Logic Breakdown

```
┌─────────────────────────────────────────────────────┐
│                    index.html                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Tab: Tool  │  │ Tab: Docs    │  │ Tab: Embed │ │
│  │  (default)  │  │ (iframe)     │  │ (code)     │ │
│  └──────┬──────┘  └──────────────┘  └────────────┘ │
│         │                                            │
│  ┌──────┴──────────────────────────────────────────┐ │
│  │              Builder Interface                   │ │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────┐   │ │
│  │  │ Palette │  │  Canvas  │  │ Properties   │   │ │
│  │  │ (left)  │  │ (center) │  │ (right)      │   │ │
│  │  └─────────┘  └────┬─────┘  └──────────────┘   │ │
│  │                     │                            │ │
│  │              ┌──────┴──────┐                     │ │
│  │              │ FormPreview │                     │ │
│  │              │ (preview)   │                     │ │
│  │              └──────┬──────┘                     │ │
│  │                     │                            │ │
│  │              ┌──────┴──────┐                     │ │
│  │              │ PDFGenerator│                     │ │
│  │              └─────────────┘                     │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Data Schemas

### Form Template Structure

Defined in `js/templates.js` as `formTemplates` object.

```javascript
{
  id: "tattoo_standard",          // string - unique identifier
  name: "Standard Tattoo Consultation", // string - display name
  category: "Tattoo",             // string - grouping category
  description: "Comprehensive...", // string - short description
  sections: [                     // array of section objects
    {
      id: "client_info",          // string - unique section ID
      title: "Client Information", // string - section heading
      type: "medical_section",    // optional string - triggers special handling
      fields: [                   // array of field objects
        {
          id: "full_name",        // string - unique field ID
          type: "text",           // string - field type
          label: "Full Legal Name", // string - display label
          required: true,         // boolean - is mandatory
          placeholder: "John Smith", // optional string
          validation: "text",     // optional string - validation rule
          rows: 2,                // optional number - for textarea
          options: ["Yes", "No"], // optional array - for radio/select/checkbox_group
          critical: true,         // optional boolean - for medical fields
          helpText: "string",     // optional string - helper text
          conditional: {          // optional object - visibility rules
            show_if: { field: "x", operator: "equals", value: "y" },
            show_if_all: [ ... ],
            show_if_any: [ ... ]
          }
        }
      ]
    }
  ]
}
```

### Available Field Types

| Type | Description | Properties |
|---|---|---|
| `text` | Single-line text input | placeholder |
| `email` | Email input | placeholder |
| `tel` | Telephone input | placeholder |
| `number` | Numeric input | placeholder |
| `date` | Date picker |, |
| `textarea` | Multi-line text | placeholder, rows |
| `checkbox` | Single checkbox |, |
| `checkbox_group` | Multiple checkboxes | options |
| `radio` | Radio button group | options |
| `select` | Dropdown menu | options |
| `signature` | Signature pad canvas |, |
| `header` | Section header (palette only) |, |

### Medical History Questions

Defined in `js/medical-history.js` as `medicalQuestions` object.

```javascript
{
  allergies: {
    id: "allergies",
    type: "checkbox_group",
    label: "Allergies (check all that apply)",
    options: [
      "Latex", "Adhesives", "Metals (nickel, etc.)",
      "Antibiotics", "Topical anesthetics",
      "Ink ingredients", "Other (please specify)"
    ],
    other_field: true,
    critical: true
  },
  conditions: {
    id: "conditions",
    type: "checkbox_group",
    label: "Medical Conditions",
    options: [
      "Diabetes", "Hemophilia / Bleeding disorder",
      "Heart condition", "Epilepsy / Seizures",
      "Skin conditions (eczema, psoriasis)",
      "Keloid scarring tendency",
      "Immune system disorder", "Hepatitis",
      "HIV/AIDS", "Other (please specify)"
    ],
    other_field: true,
    critical: true
  },
  medications: {
    id: "medications",
    type: "textarea",
    label: "Current Medications",
    placeholder: "List all prescription and OTC medications",
    rows: 3
  },
  blood_thinners: {
    id: "blood_thinners",
    type: "radio",
    label: "Taking blood thinners or aspirin?",
    options: ["Yes", "No"],
    required: true,
    critical: true
  },
  pregnant: {
    id: "pregnant",
    type: "radio",
    label: "Pregnant or nursing?",
    options: ["Yes", "No", "Not applicable"],
    required: true,
    critical: true
  },
  alcohol_24hrs: {
    id: "alcohol_24hrs",
    type: "radio",
    label: "Consumed alcohol in last 24 hours?",
    options: ["Yes", "No"],
    required: true
  },
  eaten_4hrs: {
    id: "eaten_4hrs",
    type: "radio",
    label: "Eaten within last 4 hours?",
    options: ["Yes", "No"],
    required: true
  }
}
```

### Conditional Logic Rule

Defined in `js/conditional-logic.js`.

```javascript
{
  show_if: {                    // single condition
    field: "blood_thinners",    // string - field ID to check
    operator: "equals",         // string - comparison operator
    value: "Yes"                // any - value to compare against
  },
  // OR
  show_if_all: [ ... ],        // array - all must be true (AND)
  // OR
  show_if_any: [ ... ]         // array - any must be true (OR)
}
```

### Supported Operators

| Operator | Description |
|---|---|
| `equals` / `eq` | Loose equality (==) |
| `not_equals` / `neq` | Loose inequality (!=) |
| `contains` | String inclusion |
| `not_contains` | String exclusion |
| `greater_than` / `gt` | Numeric greater than |
| `less_than` / `lt` | Numeric less than |
| `is_checked` | Boolean true |
| `is_not_checked` | Boolean false |

### Responses Object

```javascript
{
  full_name: "Jane Doe",
  email: "jane@example.com",
  phone: "555-0123",
  allergies: ["Latex", "Nickel"],
  blood_thinners: "No",
  pregnant: "No",
  age_verify: true,
  risk_consent: true
}
```

## Calculation / Logic Algorithms

### FormBuilder Class (`js/drag-drop-builder.js`)

**Constructor:**
```javascript
new FormBuilder()
```
- Initializes SortableJS on palette (clone source) and canvas (drop target).
- Calls `renderPalette()` to populate the left panel.

**`renderPalette()`**
- Iterates over 10 field types (text, email, tel, date, textarea, checkbox, radio, select, header, signature).
- Creates palette-item divs with icon and label.
- Appends to `#field-palette`.

**`handleFieldDrop(evt)`**
- Extracts `type` from `evt.item.dataset.type`.
- Removes the dragged clone element.
- Calls `addField(type, newIndex)`.

**`addField(type, index)`**
- Creates a new field object with `id: field_${Date.now()}`.
- Sets default `label: New ${type}` and `required: false`.
- For text/email/tel types, adds `placeholder: "Enter value..."`.
- Inserts into the first section's fields array at the specified index.
- Calls `renderCanvas()` and `selectField(newField.id)`.

**`renderCanvas()`**
- Clears `#form-canvas`.
- Iterates over `currentForm.sections`.
- For each section, creates a `form-section-preview` div with section title.
- Creates a `section-fields-container` div and initializes SortableJS on it.
- For each field, creates a `form-field-wrapper` with label, preview input, and delete button.
- Appends all to the canvas.

**`selectField(fieldId)`**
- Sets `this.selectedFieldId`.
- Removes `selected` class from all field wrappers.
- Adds `selected` class to the clicked field.
- Finds the field data in the form structure.
- Calls `renderProperties(fieldData)`.

**`renderProperties(field)`**
- Populates `#properties-editor` with label input, placeholder input, required checkbox, and Update button.
- On Update button click, saves values back to the field object and calls `renderCanvas()`.

### ConditionalLogic Engine (`js/conditional-logic.js`)

**`evaluate(formData, responses)`**
- Iterates over all sections and fields in `formData`.
- For each field with a `conditional` property, calls `check()`.
- Returns a map of `{ fieldId: boolean }` indicating visibility.

**`check(conditionConfig, responses)`**
- Routes to `checkSingle()` for `show_if`, or iterates for `show_if_all` (AND) and `show_if_any` (OR).

**`checkSingle(rule, responses)`**
- Retrieves the response value for `rule.field`.
- Compares against `rule.value` using the specified `rule.operator`.
- Returns boolean.

### FormPreview Class (`js/form-preview.js`)

**`render(formData)`**
- Builds HTML string for the entire form:
  - Form title and description.
  - For each section: section title, fields (using `renderField()`).
  - Medical sections inject fields from `MedicalHistorySystem.getMedicalSection()`.
  - Submit button labeled "Generate PDF".
- Sets `innerHTML` of the container.
- Calls `attachListeners()`, `initSignatures()`, `runLogic()`.

**`renderField(field)`**
- Generates HTML for a single field based on its type.
- Handles: text, email, tel, number, date, textarea, checkbox, checkbox_group, radio, signature.
- Adds `required` attribute and asterisk for mandatory fields.
- Wraps in `form-field-group` with `data-field-id` for conditional logic targeting.

**`attachListeners()`**
- Listens for `change` events on all inputs to update `this.responses`.
- Listens for `input` events on text fields.
- Listens for click on "Generate PDF" button to call `handleExport()`.

**`updateData(target)`**
- For checkbox groups (`name[]`), collects all checked values into an array.
- For single checkboxes, stores boolean.
- For all other inputs, stores the value.

**`runLogic()`**
- Calls `ConditionalLogic.evaluate(this.formData, this.responses)`.
- Sets `display: none` or `block` on each field wrapper based on visibility map.

**`handleExport()`**
- Optionally validates medical history.
- Gets signature image from `SignatureManager`.
- Calls `PDFGenerator.generateFormPDF()`.

### PDFGenerator (`js/pdf-generator.js`)

**`generateFormPDF(formData, responses, signatureImage, options)`**
- Creates a new `jsPDF` instance.
- Renders header with form name and date.
- Iterates over sections:
  - Draws section header with light gray background.
  - For each field, draws label and response value.
  - Handles page breaks when content exceeds page height.
  - For `medical_section` type, uses `MedicalHistorySystem.getMedicalSection()` fields.
- If signature image provided, adds it to the PDF.
- Adds page numbers to footer.
- Saves the PDF with filename `{formName}_{timestamp}.pdf`.

### SignatureManager (`js/signature-capture.js`)

**`init()`**
- Initializes `SignaturePad` on the specified canvas element.
- Sets background color to transparent, pen color to black.
- Attaches window resize handler.
- Binds clear button to `clear()` method.

**`resizeCanvas()`**
- Adjusts canvas dimensions to match CSS size multiplied by device pixel ratio.
- Scales context accordingly.
- Clears existing signature (standard Signature Pad behavior).

**`getSignatureImage()`**
- Returns base64 PNG data URL if signature is not empty.
- Returns `null` if empty.

### MedicalHistorySystem (`js/medical-history.js`)

**`getMedicalSection()`**
- Returns a section object with `id: 'medical_history_generated'`, `title: 'Medical History'`, and fields from `medicalQuestions`.

**`validateMedicalHistory(responses)`**
- Checks all required and critical fields for non-empty values.
- Returns `{ isValid: boolean, errors: string[] }`.

**`formatForPDF(responses)`**
- Converts responses into an array of `{ label, value, isCritical }` objects for PDF rendering.

## API Reference

### Global Classes and Functions

#### `FormBuilder` (window.FormBuilderApp)

| Method | Parameters | Description |
|---|---|---|
| `constructor()` |, | Initializes SortableJS, renders palette |
| `init()` |, | Sets up drag-and-drop, calls renderPalette |
| `initSortable()` |, | Creates Sortable instances for palette and canvas |
| `renderPalette()` |, | Populates field palette with 10 field types |
| `handleFieldDrop(evt)` | SortableJS event | Processes dropped field, calls addField |
| `handleReorder(evt)` | SortableJS event | Reorders fields within active section |
| `loadForm(formTemplate)` | object | Deep copies template, renders canvas |
| `addField(type, index)` | string, number | Creates field object, inserts into section |
| `deleteField(fieldId)` | string | Removes field from all sections |
| `selectField(fieldId)` | string | Highlights field, shows properties editor |
| `renderCanvas()` |, | Rebuilds canvas DOM from currentForm |
| `renderProperties(field)` | object | Shows and binds properties editor |
| `closeProperties()` |, | Resets properties panel to default text |

#### `FormPreview`

| Method | Parameters | Description |
|---|---|---|
| `constructor(containerId)` | string | Stores container element reference |
| `render(formData)` | object | Builds and injects form HTML |
| `renderField(field)` | object | Returns HTML string for a field |
| `initSignatures()` |, | Initializes SignaturePad on all signature canvases |
| `attachListeners()` |, | Binds change/input/submit event handlers |
| `updateData(target)` | DOM element | Updates this.responses from input |
| `runLogic()` |, | Evaluates conditional logic, shows/hides fields |
| `handleExport()` |, | Validates, gets signature, generates PDF |

#### `ConditionalLogic`

| Method | Parameters | Description |
|---|---|---|
| `evaluate(formData, responses)` | object, object | Returns visibility map for all fields |
| `check(conditionConfig, responses)` | object, object | Evaluates single or compound conditions |
| `checkSingle(rule, responses)` | object, object | Evaluates one condition rule |

#### `PDFGenerator`

| Method | Parameters | Description |
|---|---|---|
| `generateFormPDF(formData, responses, signatureImage, options)` | object, object, string, object | Generates and downloads PDF |

#### `SignatureManager`

| Method | Parameters | Description |
|---|---|---|
| `constructor(canvasId, clearBtnId)` | string, string | Stores element IDs |
| `init()` |, | Initializes SignaturePad, binds events |
| `resizeCanvas()` |, | Handles responsive canvas sizing |
| `clear()` |, | Clears signature pad |
| `isEmpty()` |, | Returns boolean |
| `getSignatureImage()` |, | Returns base64 PNG or null |

#### `MedicalHistorySystem`

| Method | Parameters | Description |
|---|---|---|
| `getMedicalSection()` |, | Returns section object with medical fields |
| `validateMedicalHistory(responses)` | object | Returns validation result |
| `formatForPDF(responses)` | object | Returns formatted array for PDF |

#### `TemplateManager`

| Method | Parameters | Description |
|---|---|---|
| `getTemplate(id)` | string | Returns deep copy of template or null |
| `getAllTemplates()` |, | Returns array of template summaries |
| `cloneTemplate(id)` | string | Returns deep copy with new ID |

### Available Templates

| ID | Name | Category |
|---|---|---|
| `tattoo_standard` | Standard Tattoo Consultation | Tattoo |
| `piercing_standard` | Standard Piercing Consultation | Piercing |
| `large_piece` | Large Piece / Multi-Session | Tattoo |
| `minor_consent` | Minor Consent Form | Legal |
| `cover_up` | Cover-Up Consultation | Tattoo |
| `touch_up` | Touch-Up Consultation | Tattoo |
| `blank` | Blank Template | Custom |

### Global Functions (common.js)

| Function | Description |
|---|---|
| `setTheme(theme, save)` | Toggles dark/light mode |
| `sendHeight()` | Posts iframe height to parent window |
| `copyEmbedCode()` | Copies embed iframe code to clipboard |

## Integration Guide

### Standalone Embedding

The tool can be embedded in any website using an iframe:

```html
<iframe 
  src="https://poliinternational.com/tools/form-builder/index.html" 
  width="100%" 
  height="1000" 
  frameborder="0" 
  style="border-radius:12px;">
</iframe>
```

### Embed with Template Parameter

The embeddable version (`embed.html`) accepts a `template` URL parameter:

```html
<iframe 
  src="https://poliinternational.com/tools/form-builder/embed.html?template=piercing_standard" 
  width="100%" 
  height="1000" 
  frameborder="0">
</iframe>
```

Available template values: `tattoo_standard`, `piercing_standard`, `large_piece`, `minor_consent`, `cover_up`, `touch_up`, `blank`.

### Iframe Communication

The tool posts its height to the parent window for responsive embedding:

```javascript
window.parent.postMessage({ height: document.body.scrollHeight + 50 }, '*');
```

The tool listens for theme messages from the parent:

```javascript
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'poli-theme') {
    // Apply light or dark theme
  }
});
```

### Dependencies

The tool loads the following CDN resources:

- SortableJS: `https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js`
- jsPDF: `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`
- Signature Pad: `https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js`
- Google Fonts (Inter): `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap`

All dependencies are loaded via CDN in `embed.html`. The main `index.html` does not load these scripts directly (they are loaded dynamically by the embed version).

## Customization

### Adding Custom Templates

Templates are defined in `js/templates.js` as entries in the `formTemplates` object. To add a new template:

1. Add a new object to `formTemplates` following the schema.
2. Ensure the `id` is unique.
3. The template will automatically appear in the template selection dropdown.

### Styling Overrides

The tool uses two stylesheets:
- `css/poli-standard.css` - Standard Poli branding styles
- `css/style.css` - Tool-specific styles

To customize appearance when embedding, override CSS classes:
- `.tool-main-content` - Main tool container
- `.tool-panel` - Left and right panels
- `.center-canvas` - Center canvas area
- `.form-field-wrapper` - Individual field containers
- `.preview-form-wrapper` - Preview mode container

### Theme Support

The tool supports dark and light modes. When embedded, the parent can send a theme message:

```javascript
document.querySelector('iframe').contentWindow.postMessage({
  type: 'poli-theme',
  light: true  // or false for dark mode
}, '*');
```

## Performance

- All processing is client-side with no network requests after initial page load.
- PDF generation uses jsPDF, which runs entirely in the browser.
- Signature capture uses canvas-based Signature Pad, which is hardware-accelerated.
- Drag-and-drop uses SortableJS, which uses hardware-accelerated CSS transforms.
- No database queries, no API calls, no server-side processing.
- The tool is suitable for use on low-bandwidth connections once loaded.

## Browser Compatibility

| Browser | Support |
|---|---|
| Chrome 60+ | Full |
| Firefox 55+ | Full |
| Safari 12+ | Full |
| Edge 79+ | Full |
| Opera 47+ | Full |
| iOS Safari 12+ | Full (with touch support for signatures) |
| Android Chrome 60+ | Full |

The tool uses:
- ES6 classes and arrow functions (no transpilation)
- CSS Grid and Flexbox for layout
- Canvas API for signatures
- `fetch` is not used (no API calls)
- `localStorage` for theme persistence

## Security

### Input Handling

- All form data entered by users is stored only in JavaScript memory (`this.responses` object).
- No data is transmitted to any server.
- No cookies are set by the tool.
- No user data is persisted beyond the current browser session.

### XSS Prevention

- The tool uses `textContent` and `innerHTML` with controlled content.
- User input is rendered via form controls (input, textarea, select) which do not execute scripts.
- Field labels and placeholders are set via `value` property, not raw HTML injection.
- The PDF generator uses `doc.text()` which escapes text content.
- Template data is hardcoded in `templates.js` and not user-modifiable.

### Iframe Security

- The main page (`index.html`) includes `<meta name="robots" content="noindex, nofollow">` to prevent search indexing of the tool interface.
- The tool detects if it is loaded in an iframe and adjusts theme behavior accordingly.
- No cross-origin communication except height posting and theme messages.

### Data Privacy

- No form data is stored on any server.
- PDF files are generated and downloaded directly to the user's device.
- No analytics or tracking scripts are included.
- No third-party services receive any form data.

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2025-01 | Initial release |

## Support / Contact

For technical support, integration assistance, or custom development:

- Email: support@poliinternational.com
- Contact Form: https://poliinternational.com/contact-us/
- Tool Home: https://poliinternational.com/tools/form-builder/
- Documentation: https://poliinternational.com/form-builder-documentation/

---

*Technical Standard provided by Poli International Engineering*

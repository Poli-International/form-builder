# Technical Documentation

## Architecture
The Form Builder is a **Client-Side Only** Single Page Application (SPA). It uses no backend and requires no API keys.

### Core Modules
- **`templates.js`**: Contains the JSON definition of all 7 templates.
- **`drag-drop-builder.js`**: Manages the SortableJS instances and internal form state.
- **`medical-history.js`**: Specialized module for generating and validating medical questions.
- **`pdf-generator.js`**: Uses `jsPDF` to render the JSON form state + User Responses into a PDF.
- **`signature-capture.js`**: Wrapper around `signature_pad` for high-DPI canvas handling.
- **`conditional-logic.js`**: Evaluates visibility rules (`show_if`) in real-time.

### Data Structure
**Form Schema:**
```json
{
  "id": "template_id",
  "name": "Form Name",
  "sections": [
    {
      "id": "section_id",
      "title": "Section Title",
      "fields": [
        {
          "id": "field_id",
          "type": "text|checkbox|signature|etc",
          "label": "Field Label",
          "required": true,
          "conditional": { ... }
        }
      ]
    }
  ]
}
```

### Dependencies
- **SortableJS**: Drag and drop functionality.
- **jsPDF**: PDF generation.
- **Signature Pad**: Drawing canvas.

### Embedding
The tool supports an `embed.html` view which strips the builder interface and renders the form directly. 
Usage: `embed.html?template=tattoo_standard`

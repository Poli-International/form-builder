/**
 * Form Builder Drag & Drop Logic
 * Poli International - Tool #13
 * 
 * Dependencies: SortableJS
 */

class FormBuilder {
    constructor() {
        this.currentForm = null;
        this.selectedFieldId = null;
        this.dom = {
            palette: document.getElementById('field-palette'),
            canvas: document.getElementById('form-canvas'),
            properties: document.getElementById('properties-editor')
        };

        this.init();
    }

    init() {
        if (!this.dom.palette || !this.dom.canvas) {
            console.warn('Form Builder: DOM elements not found. Initialization skipped.');
            return;
        }

        this.initSortable();
        this.renderPalette();
    }

    initSortable() {
        // Palette - source of clones
        Sortable.create(this.dom.palette, {
            group: {
                name: 'fields',
                pull: 'clone',
                put: false
            },
            sort: false,
            animation: 150,
            onClone: (evt) => {
                // Style the clone if needed
                evt.clone.classList.add('field-clone');
            }
        });

        // Canvas - drop target
        Sortable.create(this.dom.canvas, {
            group: 'fields',
            animation: 150,
            ghostClass: 'field-ghost',
            onAdd: (evt) => this.handleFieldDrop(evt),
            onUpdate: (evt) => this.handleReorder(evt)
        });
    }

    renderPalette() {
        const fieldTypes = [
            { type: 'text', icon: '📝', label: 'Text Input' },
            { type: 'email', icon: '📧', label: 'Email' },
            { type: 'tel', icon: '📱', label: 'Phone' },
            { type: 'date', icon: '📅', label: 'Date' },
            { type: 'textarea', icon: '📄', label: 'Text Area' },
            { type: 'checkbox', icon: '☑️', label: 'Checkbox' },
            { type: 'radio', icon: '🔘', label: 'Radio Group' },
            { type: 'select', icon: '📋', label: 'Dropdown' }, // "select" or "dropdown", using standard html name often better
            { type: 'header', icon: '📌', label: 'Section Header' },
            { type: 'signature', icon: '✍️', label: 'Signature' }
        ];

        this.dom.palette.innerHTML = '';
        fieldTypes.forEach(ft => {
            const el = document.createElement('div');
            el.className = 'palette-item';
            el.dataset.type = ft.type;
            el.innerHTML = `<span class="icon">${ft.icon}</span> ${ft.label}`;
            this.dom.palette.appendChild(el);
        });
    }

    handleFieldDrop(evt) {
        const item = evt.item;
        const type = item.dataset.type;

        // Remove the dragged element provided by Sortable (we'll render properly from state)
        item.parentNode.removeChild(item);

        const newIndex = evt.newIndex;
        this.addField(type, newIndex);
    }

    handleReorder(evt) {
        if (!this.currentForm) return;

        // This is tricky because the canvas usually represents ONE section or the flattened sections.
        // For simplicity in this version, we might assume the canvas renders the currently selected section,
        // or the whole form is flat. Based on templates, it has sections. 
        // We need a clearer UI strategy for sections. 
        // Strategy: Canvas renders one section at a time OR the canvas IS the section.
        // Let's assume for MVP drag-drop works within the ACTIVE section being edited.

        if (this.activeSectionId) {
            const section = this.currentForm.sections.find(s => s.id === this.activeSectionId);
            if (section) {
                const movedItem = section.fields.splice(evt.oldIndex, 1)[0];
                section.fields.splice(evt.newIndex, 0, movedItem);
                this.renderCanvas(); // Re-render to ensure DOM matches state perfectly
            }
        }
    }

    loadForm(formTemplate) {
        this.currentForm = JSON.parse(JSON.stringify(formTemplate)); // Deep copy
        // For now, default to editing the first section or create a view mode
        // Let's assume we render all sections and drag drop is within them or simplistic for now.
        // To strictly follow the "Canvas" idea, let's render the whole form flat-ish or with section containers.
        // Re-read requirements: "Center Panel - Form Canvas".
        // Better approach: Render sections as containers, and fields inside them. 
        // BUT Sortable usually needs flat lists or nested sortables.
        // Let's stick to: Canvas displays list of Sections. Each Section is a Sortable list of Fields.

        this.renderCanvas();
    }

    addField(type, index) {
        if (!this.currentForm) return;

        // Simplified: Add to first section if nothing specialized, or active section
        let targetSection = this.currentForm.sections[0]; // Default

        // Determine active section if we have that logic, else append to last or first
        // For MVP, we will assume we are adding to the currently focused area, but "index" from Sortable
        // usually implies where it was dropped. If we drop ON the canvas, and the canvas has sections...
        // IMPLEMENTATION DETAIL: We need nested Sortables (Sections -> Fields).

        // Let's create a new field object
        const newField = {
            id: `field_${Date.now()}`,
            type: type,
            label: `New ${type}`,
            required: false
        };

        if (["text", "email", "tel"].includes(type)) {
            newField.placeholder = "Enter value...";
        }

        if (targetSection) {
            if (typeof index === 'number') {
                targetSection.fields.splice(index, 0, newField);
            } else {
                targetSection.fields.push(newField);
            }
        }

        this.renderCanvas();
        this.selectField(newField.id);
    }

    deleteField(fieldId) {
        if (!this.currentForm) return;

        for (const section of this.currentForm.sections) {
            const idx = section.fields.findIndex(f => f.id === fieldId);
            if (idx !== -1) {
                section.fields.splice(idx, 1);
                this.renderCanvas();
                this.closeProperties();
                return;
            }
        }
    }

    selectField(fieldId) {
        this.selectedFieldId = fieldId;
        // Highlight in UI
        const allFields = this.dom.canvas.querySelectorAll('.form-field-wrapper');
        allFields.forEach(el => el.classList.remove('selected'));

        const selectedEl = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (selectedEl) selectedEl.classList.add('selected');

        // Find field data
        let fieldData = null;
        for (const section of this.currentForm.sections) {
            const f = section.fields.find(f => f.id === fieldId);
            if (f) { fieldData = f; break; }
        }

        if (fieldData) {
            this.renderProperties(fieldData);
        }
    }

    renderCanvas() {
        if (!this.currentForm) return;
        this.dom.canvas.innerHTML = '';

        // We will render sections, and make EACH section's field list a sortable target?
        // Or flattish for this specific "drag field to canvas" requirement.
        // Let's render sections as headers, and a big list? No, structure matters.
        // Let's assume the Canvas contains Sections.

        this.currentForm.sections.forEach(section => {
            const secEl = document.createElement('div');
            secEl.className = 'form-section-preview';
            secEl.innerHTML = `<h3>${section.title}</h3>`;

            const fieldList = document.createElement('div');
            fieldList.className = 'section-fields-container';
            // Enable sorting within this section
            Sortable.create(fieldList, {
                group: 'fields',
                animation: 150,
                onAdd: (evt) => { /* Handle drop logic specific to section */ },
                onUpdate: (evt) => { /* Handle reorder specific to section */ }
                // Note: Complex nested sorting might need more robust event handling
            });

            if (section.fields) {
                section.fields.forEach(field => {
                    const fEl = document.createElement('div');
                    fEl.className = 'form-field-wrapper';
                    fEl.dataset.fieldId = field.id;
                    fEl.innerHTML = `
                        <label>${field.label} ${field.required ? '*' : ''}</label>
                        <div class="field-preview-input">${field.type}</div>
                        <button class="delete-btn" onclick="window.FormBuilderApp.deleteField('${field.id}')">🗑️</button>
                    `;
                    fEl.onclick = (e) => {
                        if (e.target.tagName === 'BUTTON') return; // Don't select if deleting
                        this.selectField(field.id);
                    }
                    fieldList.appendChild(fEl);
                });
            }
            secEl.appendChild(fieldList);
            this.dom.canvas.appendChild(secEl);
        });
    }

    renderProperties(field) {
        if (!this.dom.properties) return;
        this.dom.properties.innerHTML = `
            <h3>Edit Field</h3>
            <div class="prop-group">
                <label>Label</label>
                <input type="text" id="prop-label" value="${field.label}">
            </div>
            <div class="prop-group">
                <label>Placeholder</label>
                <input type="text" id="prop-placeholder" value="${field.placeholder || ''}">
            </div>
            <div class="prop-group">
                <label>Required</label>
                <input type="checkbox" id="prop-required" ${field.required ? 'checked' : ''}>
            </div>
            <button id="save-props">Update</button>
        `;

        document.getElementById('save-props').onclick = () => {
            field.label = document.getElementById('prop-label').value;
            field.placeholder = document.getElementById('prop-placeholder').value;
            field.required = document.getElementById('prop-required').checked;
            this.renderCanvas(); // Refresh view
        };
    }

    closeProperties() {
        if (this.dom.properties) this.dom.properties.innerHTML = '<p class="text-muted">Select a field to edit properties</p>';
    }
}

// Global instance 
window.FormBuilderApp = new FormBuilder();

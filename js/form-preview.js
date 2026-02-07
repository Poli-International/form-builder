/**
 * Form Preview & Testing Engine
 * Poli International - Tool #13
 */

class FormPreview {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.formData = null;
        this.responses = {}; // Live data
        this.signatureManager = null;
    }

    render(formData) {
        this.formData = formData;
        if (!this.container) return;

        let html = `<div class="preview-form-wrapper">`;

        // Form Title
        html += `<h2 class="form-title">${formData.name}</h2>`;
        if (formData.description) {
            html += `<p class="form-description">${formData.description}</p>`;
        }

        // Sections
        formData.sections.forEach(section => {
            html += `<div class="preview-section" id="section-${section.id}">`;
            html += `<h3 class="section-title">${section.title}</h3>`;

            // Handle Fields
            let fields = section.fields;

            // Medical Section Injection
            if (section.type === 'medical_section' && window.MedicalHistorySystem) {
                const medSection = window.MedicalHistorySystem.getMedicalSection();
                // We use the fields from the medical system
                fields = medSection.fields;
                html += `<div class="medical-notice-box">Please answer all medical questions truthfully for your safety.</div>`;
            }

            if (fields) {
                fields.forEach(field => {
                    html += this.renderField(field);
                });
            }

            html += `</div>`;
        });

        // Submit / Export Buttons
        html += `
            <div class="form-actions">
                <button type="button" id="preview-submit" class="btn-primary">Generate PDF</button>
            </div>
        `;

        html += `</div>`;
        this.container.innerHTML = html;

        this.attachListeners();
        this.initSignatures();

        // Initial Logic Check
        this.runLogic();
    }

    renderField(field) {
        let html = `<div class="form-field-group" data-field-id="${field.id}" id="field-wrapper-${field.id}">`;

        const requiredMark = (field.required || field.critical) ? '<span class="required-star">*</span>' : '';
        html += `<label for="${field.id}">${field.label} ${requiredMark}</label>`;

        if (field.helpText) {
            html += `<small class="help-text">${field.helpText}</small>`;
        }

        const commonAttrs = `name="${field.id}" data-id="${field.id}" ${field.required ? 'required' : ''}`;

        switch (field.type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'number':
                html += `<input type="${field.type}" ${commonAttrs} placeholder="${field.placeholder || ''}" class="form-input">`;
                break;

            case 'date':
                html += `<input type="date" ${commonAttrs} class="form-input">`;
                break;

            case 'textarea':
                html += `<textarea ${commonAttrs} rows="${field.rows || 3}" placeholder="${field.placeholder || ''}" class="form-input"></textarea>`;
                break;

            case 'checkbox':
                html += `
                    <div class="checkbox-wrapper">
                        <label>
                            <input type="checkbox" ${commonAttrs}>
                            <span>${field.label} (Yes)</span>
                        </label>
                    </div>`;
                break;

            case 'checkbox_group':
                html += `<div class="checkbox-group-container">`;
                if (field.options) {
                    field.options.forEach(opt => {
                        const optId = `${field.id}_${opt.replace(/\s+/g, '_')}`;
                        html += `
                            <label class="checkbox-item">
                                <input type="checkbox" name="${field.id}[]" value="${opt}">
                                <span>${opt}</span>
                            </label>
                        `;
                    });
                }
                html += `</div>`;
                break;

            case 'radio':
                html += `<div class="radio-group-container">`;
                if (field.options) {
                    field.options.forEach(opt => {
                        html += `
                            <label class="radio-item">
                                <input type="radio" name="${field.id}" value="${opt}" data-id="${field.id}">
                                <span>${opt}</span>
                            </label>
                        `;
                    });
                }
                html += `</div>`;
                break;

            case 'signature':
                html += `
                    <div class="signature-wrapper">
                        <canvas id="sig-canvas-${field.id}" class="signature-pad" width=400 height=200></canvas>
                        <button type="button" class="btn-text" id="clear-sig-${field.id}">Clear Signature</button>
                    </div>
                `;
                break;

            default:
                html += `<div class="unknown-field">Unknown field type: ${field.type}</div>`;
        }

        html += `</div>`;
        return html;
    }

    initSignatures() {
        // Find all signature fields in current formData
        // For MVP, handling one main client signature is common, but loop all sections
        // We need to support multiple if needed.

        // This is a bit complex if we have multiple signatures. 
        // We'll look for canvases.
        const canvases = this.container.querySelectorAll('canvas.signature-pad');
        canvases.forEach(canvas => {
            const id = canvas.id.replace('sig-canvas-', '');
            // We only support one active signature manager in the global scope? 
            // Ideally we need multiple instances.
            // Let's create a manager for this specific canvas.
            if (window.SignatureManager) {
                // We track the MAIN signature for PDF export usually. 
                // Let's store this instance.
                this.signatureManager = new window.SignatureManager(canvas.id, `clear-sig-${id}`);
                this.signatureManager.init();
            }
        });
    }

    attachListeners() {
        // Input change listener for logic and data binding
        this.container.addEventListener('change', (e) => {
            this.updateData(e.target);
            this.runLogic();
        });

        // Input event for text fields (realtime)
        this.container.addEventListener('input', (e) => {
            this.updateData(e.target);
            // Debounce logic run if heavy?
        });

        document.getElementById('preview-submit').addEventListener('click', () => {
            this.handleExport();
        });
    }

    updateData(target) {
        if (!target.name) return;

        // Handle checkbox groups
        if (target.type === 'checkbox' && target.name.endsWith('[]')) {
            const realName = target.name.replace('[]', '');
            // gather all checked
            const checked = Array.from(document.querySelectorAll(`input[name="${target.name}"]:checked`)).map(el => el.value);
            this.responses[realName] = checked;
        } else if (target.type === 'checkbox') {
            this.responses[target.name] = target.checked;
        } else {
            this.responses[target.name] = target.value;
        }
    }

    runLogic() {
        if (window.ConditionalLogic && this.formData) {
            const visibilityMap = window.ConditionalLogic.evaluate(this.formData, this.responses);

            for (const fieldId in visibilityMap) {
                const wrapper = document.getElementById(`field-wrapper-${fieldId}`);
                if (wrapper) {
                    wrapper.style.display = visibilityMap[fieldId] ? 'block' : 'none';
                }
            }
        }
    }

    handleExport() {
        // Validate?
        if (window.MedicalHistorySystem) {
            const valResult = window.MedicalHistorySystem.validateMedicalHistory(this.responses);
            // We can check other required fields too
            // For now, let's just alert if medical issues
            // or validation logic here
        }

        // Get signature
        let sigImg = null;
        if (this.signatureManager) {
            sigImg = this.signatureManager.getSignatureImage();
        }

        if (window.PDFGenerator) {
            window.PDFGenerator.generateFormPDF(this.formData, this.responses, sigImg);
        } else {
            alert('PDF Generator not loaded.');
        }
    }
}

window.FormPreview = FormPreview;

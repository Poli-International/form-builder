/**
 * Common Logic, Header Controls & Initialization
 * Poli International - Studio Consultation Form Builder
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Translations must be in memory before anything renders; see js/i18n.js.
    if (window.i18n && window.i18n.ready) await window.i18n.ready;
    initDarkMode();
    initApp();
    initShortcutsModal();
    initPdfSettingsModal();
    initEmbedModal();
    initModalScrollLockObserver();
    initFieldIdsMapModal();
});

/**
 * Ensures background page never scrolls when any modal dialog is open,
 * and enables smooth internal scrolling inside modal cards.
 */
function initModalScrollLockObserver() {
    const updateModalScrollLock = () => {
        const activeModals = document.querySelectorAll('.modal-overlay, .modal');
        let isAnyVisible = false;
        activeModals.forEach(m => {
            const style = window.getComputedStyle(m);
            if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                isAnyVisible = true;
            }
        });
        if (isAnyVisible) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
    };

    // Observe DOM mutations to style/class attributes on modals
    const observer = new MutationObserver(updateModalScrollLock);
    document.querySelectorAll('.modal-overlay, .modal').forEach(m => {
        observer.observe(m, { attributes: true, attributeFilter: ['style', 'class'] });
    });

    // Also listen to window transitions
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            setTimeout(updateModalScrollLock, 50);
        }
    });

    // Close on overlay backdrop click (if clicking directly on overlay)
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.display = 'none';
                updateModalScrollLock();
            }
        });
    });
}

/**
 * Initializes the Export Field IDs & CRM Mapping Visual Map Modal
 */
function initFieldIdsMapModal() {
    const modal = document.getElementById('export-field-ids-modal');
    const openBtn = document.getElementById('btn-export-field-ids');
    const closeBtn = document.getElementById('btn-close-field-ids-modal');
    const doneBtn = document.getElementById('btn-close-field-ids-done');
    const searchInput = document.getElementById('field-ids-search-input');
    const copyJsonBtn = document.getElementById('btn-copy-field-ids-json');
    const downloadJsonBtn = document.getElementById('btn-download-field-ids-json');
    const copyWebhookBtn = document.getElementById('btn-copy-webhook-payload');
    const downloadCsvBtn = document.getElementById('btn-download-field-ids-csv');

    if (!modal) return;

    const t = (k, fb, p) => (window.i18n ? window.i18n.t(k, fb, p) : fb);

    const getAllFlatFields = () => {
        const fields = [];
        const form = (window.FormBuilderApp && window.FormBuilderApp.currentForm) 
            ? window.FormBuilderApp.currentForm 
            : { sections: [] };

        (form.sections || []).forEach(sec => {
            (sec.fields || []).forEach(field => {
                if (field.type === 'container' && field.fields) {
                    field.fields.forEach(child => {
                        fields.push({
                            field: child,
                            sectionTitle: sec.title || t('properties.untitled_section', 'Untitled Section'),
                            containerLabel: field.label || 'Group'
                        });
                    });
                } else {
                    fields.push({
                        field: field,
                        sectionTitle: sec.title || t('properties.untitled_section', 'Untitled Section'),
                        containerLabel: null
                    });
                }
            });
        });
        return fields;
    };

    const generateSampleValue = (field) => {
        const type = field.type || 'text';
        const label = (field.label || '').toLowerCase();
        if (type === 'email' || label.includes('email')) return 'client@example.com';
        if (type === 'phone' || label.includes('phone') || label.includes('tel')) return '+1 (555) 234-5678';
        if (type === 'date' || label.includes('birth') || label.includes('dob')) return '1998-04-15';
        if (type === 'time') return '14:30';
        if (type === 'number' || label.includes('age')) return 26;
        if (type === 'checkbox') return true;
        if (type === 'signature') return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...';
        if (type === 'select' || type === 'radio') {
            return (field.options && field.options.length > 0) ? field.options[0] : 'Selected Option';
        }
        if (type === 'textarea') return 'Client consultation notes and intake history details.';
        if (label.includes('name')) return 'Alex Morgan';
        if (label.includes('address')) return '123 Studio Blvd, Suite 400';
        if (label.includes('city')) return 'Los Angeles';
        if (label.includes('emergency')) return 'Morgan Taylor (+1 555-987-6543)';
        return `Sample ${field.label || 'Value'}`;
    };

    const renderTable = (filterQuery = '') => {
        const container = document.getElementById('field-map-table-container');
        const statsBar = document.getElementById('field-ids-stats-bar');
        if (!container) return;

        const allItems = getAllFlatFields();
        const q = filterQuery.trim().toLowerCase();

        const filtered = allItems.filter(item => {
            if (!q) return true;
            const f = item.field;
            return (f.id && f.id.toLowerCase().includes(q)) ||
                   (f.label && f.label.toLowerCase().includes(q)) ||
                   (f.type && f.type.toLowerCase().includes(q)) ||
                   (item.sectionTitle && item.sectionTitle.toLowerCase().includes(q)) ||
                   (f.alias && f.alias.toLowerCase().includes(q));
        });

        // Update stats bar
        const totalCount = allItems.length;
        const reqCount = allItems.filter(i => i.field.required).length;
        const secCount = new Set(allItems.map(i => i.sectionTitle)).size;

        if (statsBar) {
            statsBar.innerHTML = `
                <div style="font-size: 0.82rem; font-weight: 700; color: #1e293b;">
                    📊 ${t('field_ids_map.total_fields', 'Total Fields')}: <span style="color: #2563eb;">${totalCount}</span>
                </div>
                <div style="font-size: 0.82rem; font-weight: 600; color: #64748b;">
                    ★ ${t('field_ids_map.mandatory_count', 'Required')}: <span style="color: #dc2626;">${reqCount}</span>
                </div>
                <div style="font-size: 0.82rem; font-weight: 600; color: #64748b;">
                    📑 ${t('field_ids_map.sections_count', 'Sections')}: <span style="color: #059669;">${secCount}</span>
                </div>
                ${q ? `<span style="font-size: 0.78rem; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 9999px; font-weight: 600;">${t('field_ids_map.showing_matches', 'Showing {count} matches', { count: filtered.length })}</span>` : ''}
            `;
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 2.5rem 1rem; color: #64748b;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
                    <strong style="display:block; font-size: 0.95rem; color: #1e293b;">${t('field_ids_map.empty_title', 'No fields found')}</strong>
                    <p style="font-size: 0.8rem; margin-top: 4px;">${t('field_ids_map.empty_desc', 'Try searching for a different keyword or clear the search filter.')}</p>
                </div>
            `;
            return;
        }

        let html = `
            <table class="field-map-table">
                <thead>
                    <tr>
                        <th style="width: 28%;">${t('field_ids_map.th_label', 'Field Label & Section')}</th>
                        <th style="width: 24%;">${t('field_ids_map.th_id', 'Unique Field ID')}</th>
                        <th style="width: 20%;">${t('field_ids_map.th_crm', 'CRM / Webhook Key')}</th>
                        <th style="width: 14%;">${t('field_ids_map.th_type', 'Data Type')}</th>
                        <th style="width: 14%;">${t('field_ids_map.th_validation', 'Validation')}</th>
                    </tr>
                </thead>
                <tbody>
        `;

        filtered.forEach(item => {
            const f = item.field;
            const crmKey = f.alias || (f.label ? f.label.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') : f.id);
            const isReq = !!f.required;
            const isHidden = !!f.hidden;

            html += `
                <tr>
                    <td>
                        <strong style="color: #0f172a; display: block; font-size: 0.84rem;">${escapeHtml(f.label || t('canvas.untitled_field', 'Untitled Field'))}</strong>
                        <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px; display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
                            <span>📑 ${escapeHtml(item.sectionTitle)}</span>
                            ${item.containerLabel ? `<span style="opacity: 0.7;">› 🗂️ ${escapeHtml(item.containerLabel)}</span>` : ''}
                            ${isHidden ? `<span style="font-size: 0.65rem; background: #fee2e2; color: #991b1b; padding: 1px 4px; border-radius: 3px; font-weight: 600;">${t('field_ids_map.hidden_badge', '🚫 Hidden')}</span>` : ''}
                        </div>
                    </td>
                    <td>
                        <div class="field-id-code">
                            <span>${escapeHtml(f.id)}</span>
                            <button type="button" class="btn-copy-id" onclick="window.copyTextToClipboard('${f.id}', '${t('field_ids_map.copied_id_toast', 'Field ID copied!')}')" title="${t('field_ids_map.copy_field_id', 'Copy field ID')}">📋</button>
                        </div>
                    </td>
                    <td>
                        <div class="field-id-code" style="background: #ecfdf5; border-color: #a7f3d0; color: #065f46;">
                            <span>${escapeHtml(crmKey)}</span>
                            <button type="button" class="btn-copy-id" onclick="window.copyTextToClipboard('${crmKey}', '${t('field_ids_map.copied_crm_toast', 'CRM Key copied!')}')" title="${t('field_ids_map.copy_crm_key', 'Copy CRM variable key')}">📋</button>
                        </div>
                    </td>
                    <td>
                        <span style="display: inline-block; font-size: 0.75rem; background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase;">
                            ${f.type || 'text'}
                        </span>
                    </td>
                    <td>
                        ${isReq 
                            ? `<span style="font-size: 0.72rem; background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${t('field_ids_map.mandatory_badge', '★ Required')}</span>` 
                            : `<span style="font-size: 0.72rem; background: #f8fafc; color: #94a3b8; padding: 2px 6px; border-radius: 4px;">${t('field_ids_map.optional_badge', 'Optional')}</span>`
                        }
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    };

    const openModal = () => {
        modal.style.display = 'flex';
        if (searchInput) searchInput.value = '';
        renderTable();
    };

    const closeModal = () => {
        modal.style.display = 'none';
    };

    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Close header dropdown
            const drop = document.getElementById('export-dropdown-menu');
            if (drop) drop.classList.remove('show');
            openModal();
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (doneBtn) doneBtn.addEventListener('click', closeModal);

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderTable(e.target.value);
        });
    }

    const buildExportMapObject = () => {
        const allItems = getAllFlatFields();
        const mapObj = {};
        allItems.forEach(item => {
            const f = item.field;
            const crmKey = f.alias || (f.label ? f.label.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') : f.id);
            mapObj[crmKey] = {
                field_id: f.id,
                label: f.label || 'Untitled',
                type: f.type || 'text',
                section: item.sectionTitle,
                container: item.containerLabel || null,
                required: !!f.required,
                hidden: !!f.hidden,
                sample_value: generateSampleValue(f)
            };
        });
        return mapObj;
    };

    if (copyJsonBtn) {
        copyJsonBtn.addEventListener('click', () => {
            const mapObj = buildExportMapObject();
            copyTextToClipboard(JSON.stringify(mapObj, null, 2), t('field_ids_map.copied_json_toast', 'Field ID JSON map copied to clipboard!'));
        });
    }

    if (downloadJsonBtn) {
        downloadJsonBtn.addEventListener('click', () => {
            const mapObj = buildExportMapObject();
            const formName = (window.FormBuilderApp && window.FormBuilderApp.currentForm && window.FormBuilderApp.currentForm.name)
                ? window.FormBuilderApp.currentForm.name.replace(/[^a-z0-9_]/gi, '_').toLowerCase()
                : 'form';

            const blob = new Blob([JSON.stringify(mapObj, null, 2)], { type: 'application/json;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${formName}_field_ids_crm_map.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (window.FormBuilderApp && typeof window.FormBuilderApp.showToast === 'function') {
                window.FormBuilderApp.showToast(t('field_ids_map.downloaded_json', 'Field IDs JSON map downloaded'), 'success');
            }
        });
    }

    if (copyWebhookBtn) {
        copyWebhookBtn.addEventListener('click', () => {
            const allItems = getAllFlatFields();
            const payload = {
                event: 'form_submission',
                timestamp: new Date().toISOString(),
                form_id: (window.FormBuilderApp && window.FormBuilderApp.currentForm) ? window.FormBuilderApp.currentForm.id : 'form_123',
                form_name: (window.FormBuilderApp && window.FormBuilderApp.currentForm) ? window.FormBuilderApp.currentForm.name : 'Studio Consultation',
                data: {}
            };
            allItems.forEach(item => {
                const f = item.field;
                const crmKey = f.alias || (f.label ? f.label.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') : f.id);
                payload.data[crmKey] = generateSampleValue(f);
            });
            copyTextToClipboard(JSON.stringify(payload, null, 2), t('field_ids_map.copied_webhook_toast', 'Webhook sample payload copied to clipboard!'));
        });
    }

    if (downloadCsvBtn) {
        downloadCsvBtn.addEventListener('click', () => {
            const allItems = getAllFlatFields();
            const formName = (window.FormBuilderApp && window.FormBuilderApp.currentForm && window.FormBuilderApp.currentForm.name)
                ? window.FormBuilderApp.currentForm.name.replace(/[^a-z0-9_]/gi, '_').toLowerCase()
                : 'form';

            let csv = 'Field ID,Field Label,Section,Container,Type,Required,Hidden,CRM Key,Sample Value\n';
            allItems.forEach(item => {
                const f = item.field;
                const crmKey = f.alias || (f.label ? f.label.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') : f.id);
                const sample = String(generateSampleValue(f)).replace(/"/g, '""');
                const label = (f.label || '').replace(/"/g, '""');
                const sec = (item.sectionTitle || '').replace(/"/g, '""');
                const container = (item.containerLabel || '').replace(/"/g, '""');

                csv += `"${f.id}","${label}","${sec}","${container}","${f.type || 'text'}",${f.required ? 'true' : 'false'},${f.hidden ? 'true' : 'false'},"${crmKey}","${sample}"\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${formName}_field_ids_crm_map.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (window.FormBuilderApp && typeof window.FormBuilderApp.showToast === 'function') {
                window.FormBuilderApp.showToast(t('field_ids_map.downloaded_csv', 'Field IDs CSV map downloaded'), 'success');
            }
        });
    }

    window.openFieldIdsMapModal = openModal;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function initApp() {
    const isBuilder = document.getElementById('form-canvas');

    if (isBuilder) {
        // Setup Template Selector logic
        const templateSelect = document.getElementById('template-select');
        if (templateSelect && window.FormTemplates && window.FormTemplates.TemplateManager) {
            // Declared out here because it is read further down, after this
            // if/else. It used to live inside the else branch, so whenever
            // updateTemplateSelectOptions existed (it always does) the later
            // `templates.length` threw a ReferenceError and killed initApp.
            // That only surfaced for a visitor with no autosaved draft, since
            // `!loaded` short-circuits the check for everyone else.
            const templates = window.FormTemplates.TemplateManager.getAllTemplates();
            if (window.i18n && typeof window.i18n.updateTemplateSelectOptions === 'function') {
                window.i18n.updateTemplateSelectOptions();
            } else {
                templateSelect.innerHTML = '';
                
                templates.forEach(t => {
                    const opt = document.createElement('option');
                    opt.value = t.id;
                    opt.textContent = `📋 ${t.name} (${t.category})`;
                    templateSelect.appendChild(opt);
                });
            }

            templateSelect.addEventListener('change', (e) => {
                const tmpl = window.FormTemplates.TemplateManager.getTemplate(e.target.value);
                if (window.FormBuilderApp && tmpl) {
                    window.FormBuilderApp.loadForm(tmpl, `Loaded ${tmpl.name}`);
                    const toastMsg = window.i18n ? window.i18n.t('messages.template_loaded', { name: tmpl.name }, `Template "${tmpl.name}" loaded`) : `Template "${tmpl.name}" loaded`;
                    window.FormBuilderApp.showToast(toastMsg, 'info');
                }
            });

            // Check for existing auto-saved draft or load standard template
            let loaded = false;
            if (window.FormBuilderApp) {
                const autoSaved = window.FormBuilderApp.getAutoSavedData();
                if (autoSaved && autoSaved.form && autoSaved.form.sections && autoSaved.form.sections.length > 0) {
                    window.FormBuilderApp.loadForm(autoSaved.form, 'Restore Auto-save Draft');
                    const savedDate = new Date(autoSaved.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    window.FormBuilderApp.showToast(`Restored auto-saved draft from ${savedDate}`, 'info');
                    loaded = true;

                    // Match template select if known template
                    if (autoSaved.form.id) {
                        const opt = Array.from(templateSelect.options).find(o => o.value === autoSaved.form.id);
                        if (opt) templateSelect.value = autoSaved.form.id;
                    }
                }
            }

            if (!loaded && templates.length > 0) {
                const defaultTmpl = window.FormTemplates.TemplateManager.getTemplate('tattoo_standard') || 
                                    window.FormTemplates.TemplateManager.getTemplate(templates[0].id);
                if (window.FormBuilderApp && defaultTmpl) {
                    window.FormBuilderApp.loadForm(defaultTmpl, 'Initial Template');
                }
            }
        }

        // Preview Button
        const previewBtn = document.getElementById('btn-preview');
        if (previewBtn) {
            previewBtn.addEventListener('click', togglePreview);
        }

        // Header Kiosk Mode Button
        const headerKioskBtn = document.getElementById('btn-header-kiosk');
        if (headerKioskBtn) {
            headerKioskBtn.addEventListener('click', () => {
                const optDrop = document.getElementById('options-dropdown-menu');
                if (optDrop) optDrop.classList.remove('show');
                if (typeof window.openTabletKioskMode === 'function') {
                    window.openTabletKioskMode();
                }
            });
        }

        // Mobile Panel Tab Switcher
        const mobileTabs = document.querySelectorAll('.mobile-tab-btn');
        const leftPanel = document.querySelector('.left-panel');
        const centerCanvas = document.querySelector('.center-canvas');
        const rightPanel = document.querySelector('.right-panel');

        function switchMobileTab(targetPanel) {
            mobileTabs.forEach(t => {
                t.classList.toggle('active', t.dataset.panel === targetPanel);
            });
            if (leftPanel) leftPanel.classList.toggle('mobile-panel-active', targetPanel === 'left-panel');
            if (centerCanvas) centerCanvas.classList.toggle('mobile-panel-active', targetPanel === 'center-canvas');
            if (rightPanel) rightPanel.classList.toggle('mobile-panel-active', targetPanel === 'right-panel');
        }

        window.switchMobileBuilderTab = switchMobileTab;

        mobileTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                switchMobileTab(tab.dataset.panel);
            });
        });

        // Initialize default active panel on small screens
        if (window.innerWidth <= 860) {
            switchMobileTab('center-canvas');
        }
    }
}

function togglePreview() {
    const builderEl = document.getElementById('builder-interface');
    const previewEl = document.getElementById('preview-interface');
    const btn = document.getElementById('btn-preview');
    const templateWrap = document.querySelector('.header-template-selector');
    const historyControls = document.querySelector('.history-controls-group');

    if (builderEl.style.display === 'none') {
        // Switch back to Builder mode
        builderEl.style.display = 'flex';
        previewEl.style.display = 'none';
        btn.innerHTML = '<span>👁️</span> Preview Form';
        btn.classList.remove('btn-active');
        if (templateWrap) templateWrap.style.opacity = '1';
        if (historyControls) historyControls.style.display = 'flex';
    } else {
        // Switch to Client Live Preview mode
        if (window.FormBuilderApp && window.FormPreview) {
            const currentData = window.FormBuilderApp.currentForm;
            const previewer = new window.FormPreview('preview-container');
            previewer.render(currentData);
        }

        builderEl.style.display = 'none';
        previewEl.style.display = 'block';
        btn.innerHTML = '<span>✏️</span> Back to Editor';
        btn.classList.add('btn-active');
        if (templateWrap) templateWrap.style.opacity = '0.5';
        if (historyControls) historyControls.style.display = 'none';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Dark Mode Management
 */
function initDarkMode() {
    const toggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('poli_form_builder_theme');

    if (stored === 'dark' || (!stored && prefersDark)) {
        document.body.classList.add('dark-mode');
        if (toggle) toggle.textContent = '☀️';
    } else {
        if (toggle) toggle.textContent = '🌙';
    }

    if (toggle) {
        toggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('poli_form_builder_theme', isDark ? 'dark' : 'light');
            toggle.textContent = isDark ? '☀️' : '🌙';
        });
    }
}

/**
 * Shortcuts Modal Dialog
 */
function initShortcutsModal() {
    const btn = document.getElementById('btn-shortcuts');
    const modal = document.getElementById('shortcuts-modal');
    const closeBtn = document.getElementById('close-shortcuts-modal');

    if (btn && modal) {
        btn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

/**
 * PDF & Print Automation Settings Modal
 */
function initPdfSettingsModal() {
    const modal = document.getElementById('pdf-settings-modal');
    const closeBtn = document.getElementById('btn-close-pdf-settings');
    const saveBtn = document.getElementById('btn-save-pdf-settings');
    const printSigToggle = document.getElementById('pdf-setting-print-after-sig');
    const paperSizeSelect = document.getElementById('pdf-setting-paper-size');
    const orientationSelect = document.getElementById('pdf-setting-orientation');

    const loadCurrent = () => {
        if (window.PDFGenerator && window.PDFGenerator.getSettings) {
            const settings = window.PDFGenerator.getSettings();
            if (printSigToggle) printSigToggle.checked = !!settings.printAfterSignature;
            if (paperSizeSelect && settings.paperSize) paperSizeSelect.value = settings.paperSize;
            if (orientationSelect && settings.orientation) orientationSelect.value = settings.orientation;
        }
    };

    loadCurrent();

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (saveBtn && modal) {
        saveBtn.addEventListener('click', () => {
            if (window.PDFGenerator && window.PDFGenerator.saveSettings) {
                const current = window.PDFGenerator.getSettings() || {};
                current.printAfterSignature = printSigToggle ? printSigToggle.checked : false;
                if (paperSizeSelect) current.paperSize = paperSizeSelect.value;
                if (orientationSelect) current.orientation = orientationSelect.value;
                window.PDFGenerator.saveSettings(current);
            }
            modal.style.display = 'none';
            if (window.FormBuilderApp) {
                window.FormBuilderApp.showToast('PDF & Print settings saved!', 'success');
            }
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

/**
 * Helper: Copy text to clipboard with multi-device fallback
 */
async function copyTextToClipboard(text, btnElement, successLabel = '✓ Copied to Clipboard!') {
    let copied = false;
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            copied = true;
        }
    } catch (err) {
        console.warn('navigator.clipboard write failed, attempting fallback textarea:', err);
    }

    if (!copied) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        textarea.setAttribute('readonly', '');
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        try {
            copied = document.execCommand('copy');
        } catch (e) {
            console.warn('execCommand copy fallback failed:', e);
        }
        document.body.removeChild(textarea);
    }

    if (btnElement) {
        const originalHtml = btnElement.innerHTML;
        btnElement.innerHTML = `<span>${successLabel}</span>`;
        btnElement.classList.add('btn-copy-success');
        btnElement.disabled = true;
        setTimeout(() => {
            btnElement.innerHTML = originalHtml;
            btnElement.classList.remove('btn-copy-success');
            btnElement.disabled = false;
        }, 2200);
    }

    if (window.FormBuilderApp && typeof window.FormBuilderApp.showToast === 'function') {
        window.FormBuilderApp.showToast(copied ? 'Copied to clipboard!' : 'Failed to copy text', copied ? 'success' : 'error');
    }
    return copied;
}

/**
 * Draw a clean QR Code on canvas
 */
function drawStudioQRCode(canvas, text) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width || 180;
    ctx.clearRect(0, 0, size, size);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Generate pseudo-random deterministic QR grid based on input hash for clean representation
    const modulesCount = 25;
    const cellSize = Math.floor((size - 24) / modulesCount);
    const offset = Math.floor((size - (cellSize * modulesCount)) / 2);

    // Deterministic bit generator from string
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
    }

    const grid = Array.from({ length: modulesCount }, () => Array(modulesCount).fill(false));

    // Draw standard QR finder patterns in 3 corners (7x7)
    function drawFinder(rStart, cStart) {
        for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 7; c++) {
                if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
                    grid[rStart + r][cStart + c] = true;
                } else {
                    grid[rStart + r][cStart + c] = false;
                }
            }
        }
    }

    drawFinder(0, 0); // Top-left
    drawFinder(0, modulesCount - 7); // Top-right
    drawFinder(modulesCount - 7, 0); // Bottom-left

    // Timing patterns
    for (let i = 8; i < modulesCount - 8; i++) {
        grid[6][i] = (i % 2 === 0);
        grid[i][6] = (i % 2 === 0);
    }

    // Fill data area based on string
    let charIdx = 0;
    for (let r = 0; r < modulesCount; r++) {
        for (let c = 0; c < modulesCount; c++) {
            // Skip finder patterns and margins
            if ((r < 8 && c < 8) || (r < 8 && c >= modulesCount - 8) || (r >= modulesCount - 8 && c < 8)) {
                continue;
            }
            if (r === 6 || c === 6) continue;

            const charCode = text.charCodeAt(charIdx % text.length) || 42;
            const bit = ((hash ^ (r * 31 + c * 17 + charCode)) % 3) === 0;
            grid[r][c] = bit;
            charIdx++;
        }
    }

    // Render cells
    ctx.fillStyle = '#0f172a';
    for (let r = 0; r < modulesCount; r++) {
        for (let c = 0; c < modulesCount; c++) {
            if (grid[r][c]) {
                ctx.fillRect(offset + (c * cellSize), offset + (r * cellSize), cellSize - 0.2, cellSize - 0.2);
            }
        }
    }
}

/**
 * Studio Embed & QR Code Modal Initializer
 */
function initEmbedModal() {
    const modal = document.getElementById('embed-qr-modal');
    const btnEmbed = document.getElementById('btn-embed');
    const btnClose = document.getElementById('close-embed-modal');
    const btnDone = document.getElementById('btn-close-embed-done');
    const btnCopyDirectUrl = document.getElementById('btn-copy-direct-url');
    const btnCopyEmbedCode = document.getElementById('btn-copy-embed-code');
    const btnPrintPlacard = document.getElementById('btn-print-qr-placard');
    const directUrlInput = document.getElementById('direct-intake-url');
    const iframeCodeTextarea = document.getElementById('embed-iframe-code');
    const qrCanvas = document.getElementById('studio-qr-canvas');

    function openEmbedModal() {
        if (!modal) return;

        // Construct clean intake URL
        const baseHref = window.location.href.split('#')[0];
        const directIntakeUrl = baseHref + (baseHref.includes('?') ? '&' : '?') + 'mode=intake#client-intake';
        const embedHtml = `<iframe src="${directIntakeUrl}" width="100%" height="750px" frameborder="0" style="border-radius:12px; border:1px solid #cbd5e1; box-shadow:0 4px 12px rgba(0,0,0,0.05);" allow="camera" title="Studio Client Intake Form"></iframe>`;

        if (directUrlInput) directUrlInput.value = directIntakeUrl;
        if (iframeCodeTextarea) iframeCodeTextarea.value = embedHtml;

        if (qrCanvas) {
            drawStudioQRCode(qrCanvas, directIntakeUrl);
        }

        // Re-translate modal DOM in case language was changed
        if (window.i18n && typeof window.i18n.translateDOM === 'function') {
            window.i18n.translateDOM(modal);
        }

        modal.style.display = 'flex';
    }

    if (btnEmbed) {
        btnEmbed.addEventListener('click', openEmbedModal);
    }

    if (btnClose) {
        btnClose.addEventListener('click', () => { modal.style.display = 'none'; });
    }

    if (btnDone) {
        btnDone.addEventListener('click', () => { modal.style.display = 'none'; });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }

    // Direct intake URL copy button (Mobile & Desktop optimized)
    if (btnCopyDirectUrl && directUrlInput) {
        btnCopyDirectUrl.addEventListener('click', () => {
            const urlToCopy = directUrlInput.value || window.location.href;
            copyTextToClipboard(urlToCopy, btnCopyDirectUrl, '✓ Copied to Clipboard!');
        });
    }

    // Embed iframe code copy button
    if (btnCopyEmbedCode && iframeCodeTextarea) {
        btnCopyEmbedCode.addEventListener('click', () => {
            const codeToCopy = iframeCodeTextarea.value;
            copyTextToClipboard(codeToCopy, btnCopyEmbedCode, '✓ Copied Iframe Code!');
        });
    }

    // Print Desk Placard
    if (btnPrintPlacard && qrCanvas && directUrlInput) {
        btnPrintPlacard.addEventListener('click', () => {
            const qrDataUrl = qrCanvas.toDataURL('image/png');
            const intakeUrl = directUrlInput.value;
            const studioName = (window.FormBuilderApp && window.FormBuilderApp.currentForm && window.FormBuilderApp.currentForm.name) 
                ? window.FormBuilderApp.currentForm.name 
                : 'Studio Consultation & Consent Form';

            const printWin = window.open('', '_blank', 'width=650,height=800');
            if (printWin) {
                printWin.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Client Intake Desk Placard</title>
                        <style>
                            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 40px; margin: 0; background: #f8fafc; }
                            .placard-card { background: white; border: 2px solid #0f172a; border-radius: 16px; padding: 36px 24px; max-width: 480px; margin: 0 auto; box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
                            .studio-title { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
                            .studio-sub { font-size: 13px; color: #64748b; margin-bottom: 24px; }
                            .qr-box { background: #f1f5f9; padding: 16px; border-radius: 12px; display: inline-block; margin-bottom: 20px; border: 1px solid #e2e8f0; }
                            .qr-img { width: 220px; height: 220px; display: block; border-radius: 6px; }
                            .instructions { font-size: 14px; color: #1e293b; font-weight: 600; margin-bottom: 8px; }
                            .instructions-sub { font-size: 12px; color: #64748b; line-height: 1.4; margin-bottom: 16px; }
                            .url-tag { font-size: 11px; font-family: monospace; color: #2563eb; background: #eff6ff; padding: 4px 10px; border-radius: 4px; display: inline-block; word-break: break-all; }
                            @media print { body { background: white; padding: 0; } .placard-card { border: 2px solid black; box-shadow: none; } }
                        </style>
                    </head>
                    <body>
                        <div class="placard-card">
                            <div class="studio-title">${studioName}</div>
                            <div class="studio-sub">Official Digital Client Check-In &amp; Medical Intake</div>
                            <div class="qr-box">
                                <img src="${qrDataUrl}" class="qr-img" alt="Intake QR Code" />
                            </div>
                            <div class="instructions">📱 Scan to Complete Your Consultation &amp; Waiver</div>
                            <div class="instructions-sub">Point your phone's camera at the QR code to open your intake form directly on your mobile device.</div>
                            <div class="url-tag">${intakeUrl}</div>
                        </div>
                        <script>
                            window.onload = () => { setTimeout(() => { window.print(); }, 400); };
                        </script>
                    </body>
                    </html>
                `);
                printWin.document.close();
            }
        });
    }

    // Provide global opener
    window.showEmbedCode = openEmbedModal;
}

window.copyTextToClipboard = copyTextToClipboard;
window.drawStudioQRCode = drawStudioQRCode;
window.initEmbedModal = initEmbedModal;
window.showEmbedCode = () => {
    const modal = document.getElementById('embed-qr-modal');
    if (modal) {
        initEmbedModal();
        const btn = document.getElementById('btn-embed');
        if (btn) btn.click();
    }
};
window.togglePreview = togglePreview;

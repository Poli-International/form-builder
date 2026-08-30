/**
 * Form Builder Drag & Drop Logic, State Engine & Property Editor
 * Poli International - Studio Consultation Form Builder
 * Dependencies: SortableJS
 */

class FormBuilder {
    constructor() {
        this.currentForm = null;
        this.selectedFieldId = null;
        this.selectedSectionId = null;
        this.selectedFieldIds = new Set(); // Multi-selection Set
        this.activeValidationErrors = new Map(); // Map<fieldId, string[]>
        
        // Smart Snap State
        this.smartSnapEnabled = localStorage.getItem('poli_smart_snap_enabled') !== 'false'; // Default enabled
        
        // Recently Deleted Bin (60-second recovery window)
        this.recentlyDeleted = [];
        this.deletedBinTimer = null;
        this.isDeletedBinExpanded = true;

        // Undo / Redo History Stack
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        this.isPerformingHistoryAction = false;

        // Auto-save debounce timer
        this.autoSaveTimer = null;
        this.autoSaveKey = 'poli_form_builder_autosave';

        this.dom = {
            palette: document.getElementById('field-palette'),
            canvas: document.getElementById('form-canvas'),
            properties: document.getElementById('properties-editor'),
            undoBtn: document.getElementById('btn-undo'),
            redoBtn: document.getElementById('btn-redo'),
            exportBtn: document.getElementById('btn-export-json'),
            importInput: document.getElementById('file-import-json'),
            importBtn: document.getElementById('btn-import-json')
        };

        this.init();
    }

    init() {
        if (!this.dom.palette || !this.dom.canvas) {
            console.warn('Form Builder: DOM elements not found. Initialization skipped.');
            return;
        }

        this.renderPalette();
        this.initSmartSuggestToggle();
        this.renderRecommendedFields();
        this.initPaletteSearch();
        this.initSortablePalette();
        this.initKeyboardShortcuts();
        this.initMarqueeSelection();
        this.initToolbarHandlers();
        this.initCanvasToolbarFeatures();
        this.initBulkCSVImport();
        this.initCanvasGridToggle();
        this.initSmartSnapToggle();
        this.initRecentlyDeletedBin();
        this.initAutoSaveUI();
        this.initThemeCustomizer();
        this.initPDFSettingsModal();
        this.initDataIntegrityCheckerModal();
        this.initCanvasNudgeHUD();
    }

    // ==========================================
    // CANVAS UTILITY TOOLBAR FEATURES
    // ==========================================

    initCanvasToolbarFeatures() {
        // Auto-Sort Button
        const autoSortBtn = document.getElementById('btn-auto-sort-fields');
        if (autoSortBtn) {
            autoSortBtn.addEventListener('click', () => this.autoSortFields());
        }

        // Validate Form / Data Integrity Checker Button
        const validateBtn = document.getElementById('btn-validate-form');
        if (validateBtn) {
            validateBtn.addEventListener('click', () => this.openDataIntegrityModal());
        }

        // Setup MutationObserver on #form-canvas to dynamically calculate child field count
        this.initCanvasMutationObserver();

        // Initial Field Count Calculation
        this.updateCanvasFieldCount();
    }

    initCanvasMutationObserver() {
        const canvas = this.dom.canvas || document.getElementById('form-canvas');
        if (!canvas) return;

        if (this.canvasMutationObserver) {
            this.canvasMutationObserver.disconnect();
        }

        this.canvasMutationObserver = new MutationObserver(() => {
            this.updateCanvasFieldCount();
        });

        this.canvasMutationObserver.observe(canvas, {
            childList: true,
            subtree: true
        });
    }

    getTotalFieldCount() {
        const canvas = this.dom.canvas || document.getElementById('form-canvas');
        if (canvas) {
            const domFields = canvas.querySelectorAll('.form-field-wrapper');
            if (domFields.length > 0) {
                return domFields.length;
            }
        }

        if (!this.currentForm || !Array.isArray(this.currentForm.sections)) return 0;
        let count = 0;
        this.currentForm.sections.forEach(section => {
            if (Array.isArray(section.fields)) {
                section.fields.forEach(f => {
                    count++;
                    if ((f.type === 'container' || f.type === 'section_group') && Array.isArray(f.fields)) {
                        count += f.fields.length;
                    }
                });
            }
        });
        return count;
    }

    updateCanvasFieldCount() {
        const countTextEl = document.getElementById('canvas-field-count-text');
        const countBadgeEl = document.getElementById('canvas-field-count-badge');
        if (!countTextEl) return;
        const total = this.getTotalFieldCount();
        countTextEl.textContent = `${total} Field${total === 1 ? '' : 's'} Placed`;
        if (countBadgeEl) {
            countBadgeEl.title = `Total: ${total} field${total === 1 ? '' : 's'} currently placed across all form sections`;
        }
    }

    autoSortFields() {
        if (!this.currentForm || !Array.isArray(this.currentForm.sections)) return;

        let totalFieldsCount = 0;
        this.currentForm.sections.forEach(section => {
            if (Array.isArray(section.fields) && section.fields.length > 1) {
                section.fields.sort((a, b) => {
                    const labelA = (a.label || a.type || '').trim().toLowerCase();
                    const labelB = (b.label || b.type || '').trim().toLowerCase();
                    return labelA.localeCompare(labelB, undefined, { numeric: true, sensitivity: 'base' });
                });
                totalFieldsCount += section.fields.length;
            }

            // Also sort nested questions inside container/section_groups
            if (Array.isArray(section.fields)) {
                section.fields.forEach(f => {
                    if ((f.type === 'container' || f.type === 'section_group') && Array.isArray(f.fields) && f.fields.length > 1) {
                        f.fields.sort((a, b) => {
                            const labelA = (a.label || a.type || '').trim().toLowerCase();
                            const labelB = (b.label || b.type || '').trim().toLowerCase();
                            return labelA.localeCompare(labelB, undefined, { numeric: true, sensitivity: 'base' });
                        });
                        totalFieldsCount += f.fields.length;
                    }
                });
            }
        });

        this.recordState('Auto-Sort Fields Alphabetically');
        this.renderCanvas();
        this.showToast('Form fields auto-sorted alphabetically by label (A-Z)!', 'success');
    }

    async copyFieldJson(fieldOrData, buttonEl = null) {
        if (!fieldOrData) return;
        try {
            const jsonStr = JSON.stringify(fieldOrData, null, 2);
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(jsonStr);
            } else {
                const ta = document.createElement('textarea');
                ta.value = jsonStr;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }

            if (buttonEl) {
                const originalHtml = buttonEl.innerHTML;
                buttonEl.innerHTML = '✓ Copied JSON!';
                buttonEl.classList.add('copied-success');
                setTimeout(() => {
                    if (buttonEl) {
                        buttonEl.innerHTML = originalHtml;
                        buttonEl.classList.remove('copied-success');
                    }
                }, 2000);
            }

            const label = Array.isArray(fieldOrData)
                ? `${fieldOrData.length} selected fields`
                : `"${fieldOrData.label || fieldOrData.id || 'Field'}"`;
            this.showToast(`JSON metadata for ${label} copied to clipboard!`, 'success');
        } catch (err) {
            console.error('Failed to copy JSON metadata to clipboard:', err);
            this.showToast('Failed to copy metadata to clipboard', 'warning');
        }
    }

    // ==========================================
    // CANVAS ALIGNMENT GRID SYSTEM
    // ==========================================

    initCanvasGridToggle() {
        const gridBtn = document.getElementById('btn-toggle-canvas-grid');
        const gridText = document.getElementById('grid-toggle-text');
        const canvas = this.dom.canvas;

        if (!gridBtn || !canvas) return;

        // Restore saved grid state
        const isGridActive = localStorage.getItem('poli_form_canvas_grid') === 'true';
        if (isGridActive) {
            canvas.classList.add('canvas-grid-pattern');
            gridBtn.classList.add('active');
            gridBtn.setAttribute('aria-pressed', 'true');
            if (gridText) gridText.textContent = 'Grid: On';
        } else {
            canvas.classList.remove('canvas-grid-pattern');
            gridBtn.classList.remove('active');
            gridBtn.setAttribute('aria-pressed', 'false');
            if (gridText) gridText.textContent = 'Grid: Off';
        }

        gridBtn.addEventListener('click', () => {
            const nowActive = canvas.classList.toggle('canvas-grid-pattern');
            gridBtn.classList.toggle('active', nowActive);
            gridBtn.setAttribute('aria-pressed', nowActive ? 'true' : 'false');
            if (gridText) gridText.textContent = nowActive ? 'Grid: On' : 'Grid: Off';
            localStorage.setItem('poli_form_canvas_grid', nowActive ? 'true' : 'false');
            this.showToast(nowActive ? 'Canvas alignment grid enabled' : 'Canvas alignment grid disabled', 'info');
        });
    }

    // ==========================================
    // SMART SNAP MAGNETIC AXIS ALIGNMENT
    // ==========================================

    initSmartSnapToggle() {
        const snapBtn = document.getElementById('btn-toggle-smart-snap');
        const snapText = document.getElementById('smart-snap-toggle-text');
        if (!snapBtn) return;

        const updateSnapUI = () => {
            snapBtn.classList.toggle('btn-smart-snap-active', this.smartSnapEnabled);
            snapBtn.setAttribute('aria-pressed', this.smartSnapEnabled ? 'true' : 'false');
            if (snapText) {
                const onLabel = window.i18n ? window.i18n.t('canvas.smart_snap_on') : 'Smart Snap: ON';
                const offLabel = window.i18n ? window.i18n.t('canvas.smart_snap_off') : 'Smart Snap: OFF';
                snapText.textContent = this.smartSnapEnabled ? onLabel : offLabel;
            }
        };

        updateSnapUI();

        snapBtn.addEventListener('click', () => {
            this.smartSnapEnabled = !this.smartSnapEnabled;
            localStorage.setItem('poli_smart_snap_enabled', this.smartSnapEnabled ? 'true' : 'false');
            updateSnapUI();
            const msg = this.smartSnapEnabled
                ? 'Smart Snap alignment enabled (magnetic axis guidelines active)'
                : 'Smart Snap alignment disabled';
            this.showToast(msg, 'info');
        });
    }

    handleSmartSnapMove(evt) {
        if (!this.smartSnapEnabled) {
            this.clearSmartSnapGuides();
            return;
        }

        const targetEl = evt.related;
        const canvas = this.dom.canvas || document.getElementById('form-canvas');
        if (!canvas || !targetEl) {
            this.clearSmartSnapGuides();
            return;
        }

        const canvasRect = canvas.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();

        let guideX = document.getElementById('smart-snap-guide-x');
        let guideY = document.getElementById('smart-snap-guide-y');
        let snapBadge = document.getElementById('smart-snap-badge');

        if (!guideX) {
            guideX = document.createElement('div');
            guideX.id = 'smart-snap-guide-x';
            guideX.className = 'smart-snap-guide smart-snap-guide-x';
            canvas.appendChild(guideX);
        }
        if (!guideY) {
            guideY = document.createElement('div');
            guideY.id = 'smart-snap-guide-y';
            guideY.className = 'smart-snap-guide smart-snap-guide-y';
            canvas.appendChild(guideY);
        }
        if (!snapBadge) {
            snapBadge = document.createElement('div');
            snapBadge.id = 'smart-snap-badge';
            snapBadge.className = 'smart-snap-axis-badge';
            canvas.appendChild(snapBadge);
        }

        const relativeTop = targetRect.top - canvasRect.top + canvas.scrollTop;
        const relativeLeft = targetRect.left - canvasRect.left + canvas.scrollLeft;

        guideX.style.top = `${relativeTop}px`;
        guideX.style.left = `${relativeLeft}px`;
        guideX.style.width = `${targetRect.width}px`;
        guideX.style.display = 'block';

        guideY.style.top = `${Math.max(0, relativeTop - 8)}px`;
        guideY.style.left = `${relativeLeft}px`;
        guideY.style.height = `${targetRect.height + 16}px`;
        guideY.style.display = 'block';

        snapBadge.style.top = `${Math.max(2, relativeTop - 20)}px`;
        snapBadge.style.left = `${relativeLeft + 8}px`;
        snapBadge.innerHTML = '🧲 Smart Snap Aligned';
        snapBadge.style.display = 'block';
    }

    clearSmartSnapGuides() {
        const guideX = document.getElementById('smart-snap-guide-x');
        const guideY = document.getElementById('smart-snap-guide-y');
        const snapBadge = document.getElementById('smart-snap-badge');
        if (guideX) guideX.remove();
        if (guideY) guideY.remove();
        if (snapBadge) snapBadge.remove();
    }

    // ==========================================
    // RECENTLY DELETED RECOVERY BIN SYSTEM
    // ==========================================

    initRecentlyDeletedBin() {
        const binEl = document.getElementById('recently-deleted-bin');
        const headerEl = document.getElementById('recently-deleted-header');
        const clearBtn = document.getElementById('btn-clear-deleted-bin');
        const toggleBtn = document.getElementById('btn-toggle-deleted-bin');

        if (!binEl || !headerEl) return;

        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearRecentlyDeleted();
            });
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.isDeletedBinExpanded = !this.isDeletedBinExpanded;
                binEl.classList.toggle('is-minimized', !this.isDeletedBinExpanded);
                toggleBtn.textContent = this.isDeletedBinExpanded ? '▼' : '▲';
            });
        }

        headerEl.addEventListener('click', (e) => {
            if (e.target !== clearBtn && e.target !== toggleBtn) {
                this.isDeletedBinExpanded = !this.isDeletedBinExpanded;
                binEl.classList.toggle('is-minimized', !this.isDeletedBinExpanded);
                if (toggleBtn) toggleBtn.textContent = this.isDeletedBinExpanded ? '▼' : '▲';
            }
        });
    }

    addRecentlyDeleted(item) {
        if (!item) return;
        this.recentlyDeleted.unshift(item);
        if (this.recentlyDeleted.length > 20) {
            this.recentlyDeleted.pop();
        }

        const binEl = document.getElementById('recently-deleted-bin');
        if (binEl) {
            binEl.style.display = 'flex';
            this.isDeletedBinExpanded = true;
            binEl.classList.remove('is-minimized');
            const toggleBtn = document.getElementById('btn-toggle-deleted-bin');
            if (toggleBtn) toggleBtn.textContent = '▼';
        }

        this.startDeletedBinTimer();
        this.renderRecentlyDeletedBin();
    }

    startDeletedBinTimer() {
        if (this.deletedBinTimer) return;

        this.deletedBinTimer = setInterval(() => {
            const now = Date.now();
            const prevLen = this.recentlyDeleted.length;
            this.recentlyDeleted = this.recentlyDeleted.filter(item => item.expiresAt > now);

            if (this.recentlyDeleted.length === 0) {
                clearInterval(this.deletedBinTimer);
                this.deletedBinTimer = null;
                const binEl = document.getElementById('recently-deleted-bin');
                if (binEl) binEl.style.display = 'none';
                return;
            }

            if (this.recentlyDeleted.length !== prevLen) {
                this.renderRecentlyDeletedBin();
            } else {
                this.updateDeletedBinCountdowns();
            }
        }, 1000);
    }

    updateDeletedBinCountdowns() {
        const now = Date.now();
        this.recentlyDeleted.forEach(item => {
            const secondsLeft = Math.max(0, Math.ceil((item.expiresAt - now) / 1000));
            const timerEl = document.getElementById(`del-timer-${item.id}`);
            const progressEl = document.getElementById(`del-progress-${item.id}`);
            if (timerEl) {
                timerEl.textContent = `⏳ ${secondsLeft}s left`;
            }
            if (progressEl) {
                const percent = Math.max(0, Math.min(100, (secondsLeft / 60) * 100));
                progressEl.style.width = `${percent}%`;
            }
        });
    }

    renderRecentlyDeletedBin() {
        const binEl = document.getElementById('recently-deleted-bin');
        const listEl = document.getElementById('recently-deleted-list');
        const countBadge = document.getElementById('deleted-bin-count');

        if (!binEl || !listEl) return;

        if (this.recentlyDeleted.length === 0) {
            binEl.style.display = 'none';
            if (countBadge) countBadge.textContent = '0';
            return;
        }

        binEl.style.display = 'flex';
        if (countBadge) countBadge.textContent = this.recentlyDeleted.length;

        const now = Date.now();
        listEl.innerHTML = this.recentlyDeleted.map(item => {
            const secondsLeft = Math.max(0, Math.ceil((item.expiresAt - now) / 1000));
            const percent = Math.max(0, Math.min(100, (secondsLeft / 60) * 100));
            const icon = item.type === 'section' ? '📑' : (item.type === 'multiple_fields' ? '📦' : this.getFieldTypeIcon(item.fieldType || 'text'));
            const typeLabel = item.type === 'section' ? 'Section' : (item.type === 'multiple_fields' ? `${item.count} Fields Block` : (item.fieldType || 'Field'));
            const originInfo = item.type === 'section' ? 'Top-level Canvas Section' : `From: ${this.escapeHtml(item.sectionTitle || 'Section')}`;

            return `
                <div class="deleted-bin-item" id="del-card-${item.id}">
                    <div class="deleted-item-top">
                        <div class="deleted-item-info">
                            <span class="deleted-item-icon">${icon}</span>
                            <strong class="deleted-item-label" title="${this.escapeHtml(item.label)}">${this.escapeHtml(item.label)}</strong>
                            <span class="deleted-item-tag">${typeLabel}</span>
                        </div>
                        <button type="button" class="btn-dismiss-deleted-item" onclick="window.FormBuilderApp.dismissRecentlyDeleted('${item.id}')" title="Dismiss from recovery bin">✕</button>
                    </div>
                    <div class="deleted-item-meta">
                        <span class="deleted-item-origin" title="${this.escapeHtml(originInfo)}">${this.escapeHtml(originInfo)}</span>
                        <span class="deleted-item-timer" id="del-timer-${item.id}">⏳ ${secondsLeft}s left</span>
                    </div>
                    <div class="deleted-item-actions">
                        <button type="button" class="btn-restore-item" onclick="window.FormBuilderApp.restoreRecentlyDeleted('${item.id}')" title="Restore back to canvas">
                            ↩️ Restore
                        </button>
                    </div>
                    <div class="deleted-item-progress-track">
                        <div class="deleted-item-progress-bar" id="del-progress-${item.id}" style="width: ${percent}%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    restoreRecentlyDeleted(deleteId) {
        if (!this.currentForm || !this.currentForm.sections) return;

        const itemIdx = this.recentlyDeleted.findIndex(i => i.id === deleteId);
        if (itemIdx === -1) return;

        const item = this.recentlyDeleted[itemIdx];

        if (item.type === 'field') {
            // Find destination section
            let targetSection = this.currentForm.sections.find(s => s.id === item.sectionId);
            if (!targetSection) {
                targetSection = this.currentForm.sections[0];
            }

            if (targetSection) {
                if (item.parentContainerId) {
                    const findCont = (fields) => {
                        for (const f of fields) {
                            if (f.id === item.parentContainerId && Array.isArray(f.fields)) return f;
                        }
                        return null;
                    };
                    const container = findCont(targetSection.fields || []);
                    if (container) {
                        const insertIdx = Math.min(item.index || 0, container.fields.length);
                        container.fields.splice(insertIdx, 0, item.data);
                    } else {
                        if (!targetSection.fields) targetSection.fields = [];
                        const insertIdx = Math.min(item.index || 0, targetSection.fields.length);
                        targetSection.fields.splice(insertIdx, 0, item.data);
                    }
                } else {
                    if (!targetSection.fields) targetSection.fields = [];
                    const insertIdx = Math.min(item.index || 0, targetSection.fields.length);
                    targetSection.fields.splice(insertIdx, 0, item.data);
                }
                this.selectField(item.data.id);
            }
        } else if (item.type === 'multiple_fields') {
            const restoredIds = [];
            if (Array.isArray(item.items)) {
                item.items.forEach(fieldSnapshot => {
                    let sec = this.currentForm.sections.find(s => s.id === fieldSnapshot.sectionId) || this.currentForm.sections[0];
                    if (sec) {
                        if (fieldSnapshot.parentContainerId) {
                            const container = (sec.fields || []).find(f => f.id === fieldSnapshot.parentContainerId);
                            if (container && Array.isArray(container.fields)) {
                                const ins = Math.min(fieldSnapshot.index || 0, container.fields.length);
                                container.fields.splice(ins, 0, fieldSnapshot.data);
                            } else {
                                if (!sec.fields) sec.fields = [];
                                const ins = Math.min(fieldSnapshot.index || 0, sec.fields.length);
                                sec.fields.splice(ins, 0, fieldSnapshot.data);
                            }
                        } else {
                            if (!sec.fields) sec.fields = [];
                            const ins = Math.min(fieldSnapshot.index || 0, sec.fields.length);
                            sec.fields.splice(ins, 0, fieldSnapshot.data);
                        }
                        restoredIds.push(fieldSnapshot.data.id);
                    }
                });
            }
            this.selectedFieldIds = new Set(restoredIds);
        } else if (item.type === 'section') {
            const insertIdx = Math.min(item.index || 0, this.currentForm.sections.length);
            this.currentForm.sections.splice(insertIdx, 0, item.data);
            this.selectSection(item.data.id);
        }

        // Remove restored item from bin
        this.recentlyDeleted.splice(itemIdx, 1);
        this.recordState(`Restore "${item.label}"`);
        this.renderCanvas();
        this.renderRecentlyDeletedBin();
        const toastMsg = window.i18n ? window.i18n.t('bin.restored_toast', { label: item.label }) : `Restored "${item.label}" back to canvas`;
        this.showToast(toastMsg, 'success');
    }

    dismissRecentlyDeleted(deleteId) {
        this.recentlyDeleted = this.recentlyDeleted.filter(i => i.id !== deleteId);
        this.renderRecentlyDeletedBin();
    }

    clearRecentlyDeleted() {
        this.recentlyDeleted = [];
        if (this.deletedBinTimer) {
            clearInterval(this.deletedBinTimer);
            this.deletedBinTimer = null;
        }
        const binEl = document.getElementById('recently-deleted-bin');
        if (binEl) binEl.style.display = 'none';
        const toastMsg = window.i18n ? window.i18n.t('bin.cleared_toast') : 'Recently deleted recovery bin cleared';
        this.showToast(toastMsg, 'info');
    }

    // ==========================================
    // FIELD CONFIGURATION VALIDATION & ISSUES
    // ==========================================

    getAllFieldIds() {
        const ids = new Set();
        if (!this.currentForm || !Array.isArray(this.currentForm.sections)) return ids;
        this.currentForm.sections.forEach(sec => {
            if (Array.isArray(sec.fields)) {
                sec.fields.forEach(f => {
                    if (f && f.id) {
                        ids.add(f.id);
                        if ((f.type === 'container' || f.type === 'section_group') && Array.isArray(f.fields)) {
                            f.fields.forEach(cf => {
                                if (cf && cf.id) ids.add(cf.id);
                            });
                        }
                    }
                });
            }
        });
        return ids;
    }

    getFieldConfigurationIssues(field, allFieldIds = null) {
        const issues = [];
        if (!field) return issues;

        // 1. Missing or blank label / question
        if (!field.label || !String(field.label).trim()) {
            if (field.required) {
                issues.push('Required field is missing a label / question text');
            } else {
                issues.push('Missing field label / question text');
            }
        }

        // 2. Orphaned or invalid conditional logic branches
        if (field.conditional) {
            const showIf = field.conditional.show_if;
            if (!showIf || !showIf.field || !String(showIf.field).trim()) {
                issues.push('Orphaned logic branch: No trigger field selected');
            } else {
                if (showIf.field === field.id) {
                    issues.push('Orphaned logic branch: Field cannot depend on itself (circular deadlock)');
                } else {
                    const fieldIds = allFieldIds || this.getAllFieldIds();
                    if (fieldIds.size > 0 && !fieldIds.has(showIf.field)) {
                        issues.push(`Orphaned logic branch: Parent trigger field (#${showIf.field}) was deleted or does not exist`);
                    }
                }
            }
        }

        // 3. Choice fields with no options or blank choices
        if (['select', 'radio', 'checkbox_group'].includes(field.type)) {
            if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
                issues.push('No options defined (must configure at least 1 selectable choice)');
            } else {
                const validOptions = field.options.filter(o => o && String(o).trim().length > 0);
                if (validOptions.length === 0) {
                    issues.push('All option values are blank');
                }
            }
        }

        // 4. Container / Section Group with 0 child questions
        if ((field.type === 'container' || field.type === 'section_group') && (!field.fields || field.fields.length === 0)) {
            issues.push('Empty group: No child questions added');
        }

        // 5. Number validation bounds
        if (field.type === 'number') {
            if (field.min !== undefined && field.max !== undefined && field.min !== '' && field.max !== '') {
                if (parseFloat(field.min) > parseFloat(field.max)) {
                    issues.push(`Min value (${field.min}) cannot exceed Max value (${field.max})`);
                }
            }
        }

        // 6. Text length bounds
        if (['text', 'textarea', 'email', 'tel'].includes(field.type)) {
            if (field.minLength !== undefined && field.maxLength !== undefined && field.minLength !== '' && field.maxLength !== '') {
                if (parseInt(field.minLength, 10) > parseInt(field.maxLength, 10)) {
                    issues.push(`Min length (${field.minLength}) exceeds Max length (${field.maxLength})`);
                }
            }
        }

        // 7. Custom Regex Validation Pattern
        if (field.validation === 'custom' && field.customRegex) {
            try {
                new RegExp(field.customRegex);
            } catch (err) {
                issues.push(`Invalid regular expression syntax: ${err.message}`);
            }
        }

        return issues;
    }

    // ==========================================
    // DATA INTEGRITY CHECKER & LOGIC AUDIT ENGINE
    // ==========================================

    runDataIntegrityCheck() {
        if (!this.currentForm) {
            return { score: 100, issues: [], stats: { total: 0, critical: 0, error: 0, warning: 0, info: 0 } };
        }

        const issues = [];
        const allFieldMap = new Map(); // id -> { field, section, parentContainer }
        const aliasMap = new Map(); // alias -> fieldId[]

        // 1. Index all fields across standard sections and container groups
        (this.currentForm.sections || []).forEach(section => {
            if (!section.fields) return;
            section.fields.forEach(field => {
                allFieldMap.set(field.id, { field, section, parentContainer: null });
                if (field.alias) {
                    const norm = field.alias.trim().toLowerCase();
                    if (!aliasMap.has(norm)) aliasMap.set(norm, []);
                    aliasMap.get(norm).push(field.id);
                }
                if ((field.type === 'container' || field.type === 'section_group') && Array.isArray(field.fields)) {
                    field.fields.forEach(cf => {
                        allFieldMap.set(cf.id, { field: cf, section, parentContainer: field });
                        if (cf.alias) {
                            const norm = cf.alias.trim().toLowerCase();
                            if (!aliasMap.has(norm)) aliasMap.set(norm, []);
                            aliasMap.get(norm).push(cf.id);
                        }
                    });
                }
            });
        });

        // 2. Circular Logic Dependency Cycle Detection (DFS Loop Detector)
        const dependencyMap = new Map(); // fieldId -> parentTriggerFieldId
        allFieldMap.forEach(({ field }, fieldId) => {
            if (field.conditional && field.conditional.show_if && field.conditional.show_if.field) {
                dependencyMap.set(fieldId, field.conditional.show_if.field);
            }
        });

        const detectedCycles = [];
        const fieldsInCycles = new Set();

        dependencyMap.forEach((parentTrigger, startFieldId) => {
            if (fieldsInCycles.has(startFieldId)) return;
            const visited = [];
            const visitedSet = new Set();
            let curr = startFieldId;

            while (curr && dependencyMap.has(curr)) {
                if (visitedSet.has(curr)) {
                    const cycleStartIndex = visited.indexOf(curr);
                    const loop = visited.slice(cycleStartIndex);
                    loop.push(curr);
                    detectedCycles.push(loop);
                    loop.forEach(id => fieldsInCycles.add(id));
                    break;
                }
                visited.push(curr);
                visitedSet.add(curr);
                curr = dependencyMap.get(curr);
            }
        });

        // Helper for i18n localization
        const t = (key, params = {}, fallback = '') => {
            if (window.i18n && typeof window.i18n.t === 'function') {
                const res = window.i18n.t(key, params);
                if (res && res !== key) return res;
            }
            return fallback || key;
        };

        // Report Circular Logic Issues
        detectedCycles.forEach(cycle => {
            const cycleLabels = cycle.map(id => {
                const item = allFieldMap.get(id);
                return item ? (item.field.label || item.field.id) : `#${id}`;
            });
            const firstFieldId = cycle[0];
            const firstFieldInfo = allFieldMap.get(firstFieldId);

            issues.push({
                id: 'cycle_' + cycle.join('_'),
                fieldId: firstFieldId,
                sectionId: firstFieldInfo?.section?.id,
                fieldName: firstFieldInfo?.field?.label || firstFieldId,
                fieldType: firstFieldInfo?.field?.type || 'field',
                category: 'logic',
                severity: 'CRITICAL',
                title: t('integrity.issue_cycle_title', {}, 'Circular Logic Dependency Deadlock'),
                description: t('integrity.issue_cycle_desc', { count: cycle.length - 1 }, `Infinite dependency loop found between ${cycle.length - 1} questions. Fields trapped in this loop can never be triggered or shown to clients.`),
                cycleChain: cycleLabels,
                recommendation: t('integrity.issue_cycle_rec', {}, 'Remove or reassign the conditional logic parent on one of the looped fields to break the deadlock.'),
                quickFix: 'break_cycle_rule',
                targetProperty: 'logic'
            });
        });

        // 3. Missing Mandatory Options in Choice Fields (select, radio, checkbox_group)
        allFieldMap.forEach(({ field, section }) => {
            if (['select', 'radio', 'checkbox_group'].includes(field.type)) {
                const typeStr = field.type === 'select' ? t('integrity.type_dropdown', {}, 'Dropdown Menu') :
                                field.type === 'radio' ? t('integrity.type_radio', {}, 'Radio Choice') :
                                t('integrity.type_checkbox_group', {}, 'Checkbox Group');

                if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
                    issues.push({
                        id: `opts_empty_${field.id}`,
                        fieldId: field.id,
                        sectionId: section.id,
                        fieldName: field.label || ('Untitled ' + field.type),
                        fieldType: field.type,
                        category: 'options',
                        severity: 'ERROR',
                        title: t('integrity.issue_opts_empty_title', {}, 'Missing Mandatory Options List'),
                        description: t('integrity.issue_opts_empty_desc', { fieldType: typeStr }, `This ${typeStr} has 0 options configured. Clients will have nothing to select.`),
                        recommendation: t('integrity.issue_opts_empty_rec', {}, 'Add at least 1-2 selectable options (e.g. "Yes / No" or custom choices).'),
                        quickFix: 'add_default_options',
                        targetProperty: 'options'
                    });
                } else {
                    const validOptions = field.options.filter(o => o && String(o).trim().length > 0);
                    if (validOptions.length === 0) {
                        issues.push({
                            id: `opts_blank_${field.id}`,
                            fieldId: field.id,
                            sectionId: section.id,
                            fieldName: field.label || ('Untitled ' + field.type),
                            fieldType: field.type,
                            category: 'options',
                            severity: 'ERROR',
                            title: t('integrity.issue_opts_blank_title', {}, 'All Option Choices Are Blank'),
                            description: t('integrity.issue_opts_blank_desc', {}, 'Options exist in the list but contain only empty whitespace.'),
                            recommendation: t('integrity.issue_opts_blank_rec', {}, 'Provide readable names for each option choice.'),
                            quickFix: 'fill_default_option_names',
                            targetProperty: 'options'
                        });
                    } else {
                        // Check for duplicate option names
                        const seenOpts = new Set();
                        const dupes = [];
                        field.options.forEach(o => {
                            const trimmed = String(o).trim();
                            if (trimmed) {
                                if (seenOpts.has(trimmed.toLowerCase())) dupes.push(trimmed);
                                seenOpts.add(trimmed.toLowerCase());
                            }
                        });
                        if (dupes.length > 0) {
                            issues.push({
                                id: `opts_dupe_${field.id}`,
                                fieldId: field.id,
                                sectionId: section.id,
                                fieldName: field.label || ('Untitled ' + field.type),
                                fieldType: field.type,
                                category: 'options',
                                severity: 'WARNING',
                                title: t('integrity.issue_opts_dupe_title', {}, 'Duplicate Option Labels'),
                                description: t('integrity.issue_opts_dupe_desc', { opt: dupes[0] }, `Option "${dupes[0]}" appears multiple times in the list, which can cause ambiguous client responses.`),
                                recommendation: t('integrity.issue_opts_dupe_rec', {}, 'Ensure each option choice has a distinct, unique label.'),
                                quickFix: 'deduplicate_options',
                                targetProperty: 'options'
                            });
                        }
                    }
                }
            }
        });

        // 4. Orphaned Conditional Logic Branches & Self-Dependencies
        allFieldMap.forEach(({ field, section }) => {
            if (field.conditional && field.conditional.show_if) {
                const parentId = field.conditional.show_if.field;
                if (!parentId || !String(parentId).trim()) {
                    issues.push({
                        id: `orphan_nofield_${field.id}`,
                        fieldId: field.id,
                        sectionId: section.id,
                        fieldName: field.label || field.id,
                        fieldType: field.type,
                        category: 'logic',
                        severity: 'WARNING',
                        title: t('integrity.issue_orphan_nofield_title', {}, 'Orphaned Conditional Logic: No Trigger Selected'),
                        description: t('integrity.issue_orphan_nofield_desc', {}, 'Conditional logic is turned ON, but no parent trigger question is selected.'),
                        recommendation: t('integrity.issue_orphan_nofield_rec', {}, 'Select a valid preceding question or disable the conditional toggle.'),
                        quickFix: 'remove_conditional_toggle',
                        targetProperty: 'logic'
                    });
                } else if (!allFieldMap.has(parentId)) {
                    issues.push({
                        id: `orphan_deleted_${field.id}`,
                        fieldId: field.id,
                        sectionId: section.id,
                        fieldName: field.label || field.id,
                        fieldType: field.type,
                        category: 'logic',
                        severity: 'WARNING',
                        title: t('integrity.issue_orphan_missing_title', {}, 'Orphaned Logic: Missing Trigger Question'),
                        description: t('integrity.issue_orphan_missing_desc', { parentId }, `This field depends on question (#${parentId}) which no longer exists in the form.`),
                        recommendation: t('integrity.issue_orphan_missing_rec', {}, 'Re-assign condition to an existing question or remove the rule.'),
                        quickFix: 'remove_conditional_toggle',
                        targetProperty: 'logic'
                    });
                } else if (parentId === field.id) {
                    issues.push({
                        id: `self_dep_${field.id}`,
                        fieldId: field.id,
                        sectionId: section.id,
                        fieldName: field.label || field.id,
                        fieldType: field.type,
                        category: 'logic',
                        severity: 'CRITICAL',
                        title: t('integrity.issue_self_dep_title', {}, 'Invalid Self-Dependency Deadlock'),
                        description: t('integrity.issue_self_dep_desc', {}, 'Field is set to trigger based on its own value, causing it to never appear.'),
                        recommendation: t('integrity.issue_self_dep_rec', {}, 'Select a different preceding field as the trigger or disable conditional logic.'),
                        quickFix: 'remove_conditional_toggle',
                        targetProperty: 'logic'
                    });
                }
            }
        });

        // 5. Missing Field / Section Labels
        allFieldMap.forEach(({ field, section }) => {
            if (!field.label || !String(field.label).trim()) {
                issues.push({
                    id: `label_missing_${field.id}`,
                    fieldId: field.id,
                    sectionId: section.id,
                    fieldName: 'Untitled Field (#' + field.id + ')',
                    fieldType: field.type,
                    category: 'label',
                    severity: field.required ? 'ERROR' : 'WARNING',
                    title: field.required ? t('integrity.issue_label_req_title', {}, 'Required Field Has No Label') : t('integrity.issue_label_missing_title', {}, 'Missing Field Label'),
                    description: t('integrity.issue_label_missing_desc', { type: field.type }, `Field of type "${field.type}" has no prompt or question text.`),
                    recommendation: t('integrity.issue_label_missing_rec', {}, 'Enter a clear, descriptive question or instructions for the client.'),
                    quickFix: 'set_default_label',
                    targetProperty: 'label'
                });
            }
        });

        // 6. Validation Bounds & Regex Inversions
        allFieldMap.forEach(({ field, section }) => {
            if (field.type === 'number' && field.min !== undefined && field.max !== undefined && field.min !== '' && field.max !== '') {
                if (parseFloat(field.min) > parseFloat(field.max)) {
                    issues.push({
                        id: `num_bounds_${field.id}`,
                        fieldId: field.id,
                        sectionId: section.id,
                        fieldName: field.label || field.id,
                        fieldType: field.type,
                        category: 'validation',
                        severity: 'ERROR',
                        title: t('integrity.issue_num_bounds_title', {}, 'Inverted Numeric Min / Max Limits'),
                        description: t('integrity.issue_num_bounds_desc', { min: field.min, max: field.max }, `Min value (${field.min}) is greater than Max value (${field.max}). No input can satisfy this constraint.`),
                        recommendation: t('integrity.issue_num_bounds_rec', {}, 'Adjust min to be less than or equal to max.'),
                        quickFix: 'swap_num_bounds',
                        targetProperty: 'validation'
                    });
                }
            }

            if (['text', 'textarea', 'email', 'tel'].includes(field.type)) {
                if (field.minLength !== undefined && field.maxLength !== undefined && field.minLength !== '' && field.maxLength !== '') {
                    if (parseInt(field.minLength, 10) > parseInt(field.maxLength, 10)) {
                        issues.push({
                            id: `len_bounds_${field.id}`,
                            fieldId: field.id,
                            sectionId: section.id,
                            fieldName: field.label || field.id,
                            fieldType: field.type,
                            category: 'validation',
                            severity: 'ERROR',
                            title: t('integrity.issue_len_bounds_title', {}, 'Inverted Character Length Limits'),
                            description: t('integrity.issue_len_bounds_desc', { min: field.minLength, max: field.maxLength }, `Min length (${field.minLength}) exceeds Max length (${field.maxLength}). Form validation will fail on all client entries.`),
                            recommendation: t('integrity.issue_len_bounds_rec', {}, 'Adjust min character length to be smaller than max.'),
                            quickFix: 'swap_len_bounds',
                            targetProperty: 'validation'
                        });
                    }
                }
            }

            if (field.validation === 'custom' && field.customRegex) {
                try {
                    new RegExp(field.customRegex);
                } catch (err) {
                    issues.push({
                        id: `regex_invalid_${field.id}`,
                        fieldId: field.id,
                        sectionId: section.id,
                        fieldName: field.label || field.id,
                        fieldType: field.type,
                        category: 'validation',
                        severity: 'CRITICAL',
                        title: t('integrity.issue_regex_invalid_title', {}, 'Invalid Custom Regex Pattern'),
                        description: t('integrity.issue_regex_invalid_desc', { error: err.message }, `Regular expression pattern has syntax error: ${err.message}`),
                        recommendation: t('integrity.issue_regex_invalid_rec', {}, 'Correct the regular expression syntax.'),
                        quickFix: 'reset_regex',
                        targetProperty: 'validation'
                    });
                }
            }
        });

        // 7. Duplicate CRM Internal Aliases
        aliasMap.forEach((ids, alias) => {
            if (ids.length > 1) {
                issues.push({
                    id: `alias_dupe_${alias}`,
                    fieldId: ids[0],
                    sectionId: allFieldMap.get(ids[0])?.section?.id,
                    fieldName: `Alias: #${alias}`,
                    fieldType: 'alias',
                    category: 'alias',
                    severity: 'WARNING',
                    title: t('integrity.issue_alias_dupe_title', {}, 'Duplicate CRM Internal Alias'),
                    description: t('integrity.issue_alias_dupe_desc', { alias, count: ids.length, fields: ids.map(id => allFieldMap.get(id)?.field?.label || id).join(', ') }, `Alias "${alias}" is shared by ${ids.length} fields (${ids.map(id => allFieldMap.get(id)?.field?.label || id).join(', ')}). This causes field collisions upon CRM export.`),
                    recommendation: t('integrity.issue_alias_dupe_rec', {}, 'Assign unique aliases to each field.'),
                    quickFix: 'auto_uniquify_aliases',
                    targetProperty: 'alias'
                });
            }
        });

        // 8. Empty Sections / Groups
        (this.currentForm.sections || []).forEach(section => {
            if ((!section.fields || section.fields.length === 0) && section.type !== 'medical_section') {
                issues.push({
                    id: `sec_empty_${section.id}`,
                    fieldId: null,
                    sectionId: section.id,
                    fieldName: section.title || 'Untitled Section',
                    fieldType: 'section',
                    category: 'layout',
                    severity: 'INFO',
                    title: t('integrity.issue_sec_empty_title', {}, 'Empty Form Section'),
                    description: t('integrity.issue_sec_empty_desc', { title: section.title || 'Untitled' }, `Section "${section.title || 'Untitled'}" has no fields placed inside it.`),
                    recommendation: t('integrity.issue_sec_empty_rec', {}, 'Add questions into this section or delete the empty section.'),
                    quickFix: 'delete_empty_section',
                    targetProperty: 'label'
                });
            }
        });

        // Compute Health Score (0-100)
        const stats = {
            total: issues.length,
            critical: issues.filter(i => i.severity === 'CRITICAL').length,
            error: issues.filter(i => i.severity === 'ERROR').length,
            warning: issues.filter(i => i.severity === 'WARNING').length,
            info: issues.filter(i => i.severity === 'INFO').length
        };

        let penalty = (stats.critical * 25) + (stats.error * 12) + (stats.warning * 5) + (stats.info * 2);
        let healthScore = Math.max(0, 100 - penalty);
        if (issues.length === 0) healthScore = 100;

        return { score: healthScore, issues, stats };
    }

    initDataIntegrityCheckerModal() {
        const closeBtn = document.getElementById('btn-close-integrity-modal');
        const doneBtn = document.getElementById('btn-close-integrity-done');
        const recheckBtn = document.getElementById('btn-recheck-integrity');
        const autoFixBtn = document.getElementById('btn-auto-fix-integrity');
        const copyReportBtn = document.getElementById('btn-copy-integrity-report');

        if (closeBtn) closeBtn.addEventListener('click', () => this.closeDataIntegrityModal());
        if (doneBtn) doneBtn.addEventListener('click', () => this.closeDataIntegrityModal());
        if (recheckBtn) recheckBtn.addEventListener('click', () => this.openDataIntegrityModal(this.currentIntegrityFilter || 'all'));
        if (autoFixBtn) autoFixBtn.addEventListener('click', () => this.autoFixIntegrityIssues());
        if (copyReportBtn) copyReportBtn.addEventListener('click', () => this.copyIntegrityReport());
    }

    openDataIntegrityModal(filterCategory = 'all') {
        const modal = document.getElementById('data-integrity-modal');
        if (!modal) return;

        if (window.i18n && typeof window.i18n.translateDOM === 'function') {
            window.i18n.translateDOM(modal);
        }

        this.currentIntegrityFilter = filterCategory;
        this.renderIntegrityModalContent(filterCategory);
        modal.style.display = 'flex';
    }

    closeDataIntegrityModal() {
        const modal = document.getElementById('data-integrity-modal');
        if (modal) modal.style.display = 'none';
        this.updateCanvasValidationStatus();
    }

    renderIntegrityModalContent(filterCategory = 'all') {
        const audit = this.runDataIntegrityCheck();
        const summaryEl = document.getElementById('integrity-health-summary');
        const tabsEl = document.getElementById('integrity-filter-tabs');
        const issuesEl = document.getElementById('integrity-issues-container');

        if (!summaryEl || !tabsEl || !issuesEl) return;

        const t = (key, params = {}, fallback = '') => {
            if (window.i18n && typeof window.i18n.t === 'function') {
                const res = window.i18n.t(key, params);
                if (res && res !== key) return res;
            }
            return fallback || key;
        };

        // 1. Render Health Score Meter
        const score = audit.score;
        let scoreClass = 'score-perfect';
        let scoreLabel = t('integrity.score_perfect', {}, 'Perfect Health');
        if (score < 50) {
            scoreClass = 'score-critical';
            scoreLabel = t('integrity.score_critical', {}, 'Critical Action Required');
        } else if (score < 80) {
            scoreClass = 'score-warning';
            scoreLabel = t('integrity.score_warning', {}, 'Issues Found');
        } else if (score < 100) {
            scoreClass = 'score-good';
            scoreLabel = t('integrity.score_good', {}, 'Good Standing');
        }

        summaryEl.innerHTML = `
            <div class="integrity-score-box">
                <span class="integrity-score-number ${scoreClass}">${score}%</span>
                <span class="integrity-score-label ${scoreClass}">${scoreLabel}</span>
            </div>
            <div class="integrity-stats-grid">
                <div class="integrity-stat-pill" style="border-left: 3px solid #ef4444;">
                    <span class="integrity-stat-num" style="color: #ef4444;">${audit.stats.critical}</span>
                    <span class="integrity-stat-name">${t('integrity.stat_critical', {}, 'Critical Logic')}</span>
                </div>
                <div class="integrity-stat-pill" style="border-left: 3px solid #f97316;">
                    <span class="integrity-stat-num" style="color: #f97316;">${audit.stats.error}</span>
                    <span class="integrity-stat-name">${t('integrity.stat_error', {}, 'Missing Options')}</span>
                </div>
                <div class="integrity-stat-pill" style="border-left: 3px solid #f59e0b;">
                    <span class="integrity-stat-num" style="color: #f59e0b;">${audit.stats.warning}</span>
                    <span class="integrity-stat-name">${t('integrity.stat_warning', {}, 'Warnings')}</span>
                </div>
                <div class="integrity-stat-pill" style="border-left: 3px solid #3b82f6;">
                    <span class="integrity-stat-num" style="color: #3b82f6;">${audit.stats.total}</span>
                    <span class="integrity-stat-name">${t('integrity.stat_total', {}, 'Total Diagnostics')}</span>
                </div>
            </div>
        `;

        // 2. Render Category Filter Tabs
        const categories = [
            { id: 'all', label: `${t('integrity.tab_all', {}, 'All Issues')} (${audit.stats.total})` },
            { id: 'logic', label: `🔀 ${t('integrity.tab_logic', {}, 'Circular & Logic')} (${audit.issues.filter(i => i.category === 'logic').length})` },
            { id: 'options', label: `📋 ${t('integrity.tab_options', {}, 'Option Lists')} (${audit.issues.filter(i => i.category === 'options').length})` },
            { id: 'validation', label: `🛡️ ${t('integrity.tab_validation', {}, 'Validation')} (${audit.issues.filter(i => i.category === 'validation').length})` },
            { id: 'label', label: `🏷️ ${t('integrity.tab_label', {}, 'Missing Labels')} (${audit.issues.filter(i => i.category === 'label').length})` },
            { id: 'alias', label: `🔑 ${t('integrity.tab_alias', {}, 'CRM Aliases')} (${audit.issues.filter(i => i.category === 'alias').length})` }
        ];

        tabsEl.innerHTML = categories.map(cat => `
            <button type="button" class="integrity-tab-btn ${filterCategory === cat.id ? 'active' : ''}" onclick="window.FormBuilderApp.renderIntegrityModalContent('${cat.id}')">
                ${cat.label}
            </button>
        `).join('');

        // 3. Render Issue Diagnostic Cards
        const filteredIssues = filterCategory === 'all' 
            ? audit.issues 
            : audit.issues.filter(i => i.category === filterCategory);

        if (filteredIssues.length === 0) {
            if (audit.issues.length === 0) {
                issuesEl.innerHTML = `
                    <div class="integrity-perfect-state">
                        <div class="integrity-perfect-icon">🎉</div>
                        <h4 class="integrity-perfect-title">${t('integrity.perfect_title', {}, 'Form Data Integrity 100% Verified')}</h4>
                        <p class="integrity-perfect-desc">${t('integrity.perfect_desc', {}, 'No circular logic dependencies, missing options, inverted validation limits, or duplicate CRM aliases detected. Your form is production ready for client intake and PDF exports!')}</p>
                    </div>
                `;
            } else {
                issuesEl.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #64748b;">
                        ${t('integrity.empty_category', {}, 'No issues found in this specific category. Select "All Issues" above to view other diagnostics.')}
                    </div>
                `;
            }
            return;
        }

        const deadlockLabel = t('integrity.deadlock_chain', {}, 'DEADLOCK CHAIN:');
        const recommendationLabel = t('integrity.recommendation_label', {}, 'Recommendation:');
        const jumpBtnLabel = t('integrity.btn_jump_to_field', {}, 'Jump to Field & Fix');
        const quickFixBtnLabel = t('integrity.btn_quick_fix', {}, 'Quick-Fix');

        issuesEl.innerHTML = filteredIssues.map(issue => {
            const cardClass = issue.severity === 'CRITICAL' ? 'integrity-card-critical' :
                              issue.severity === 'ERROR' ? 'integrity-card-error' :
                              issue.severity === 'WARNING' ? 'integrity-card-warning' : 'integrity-card-info';

            const badgeClass = issue.severity === 'CRITICAL' ? 'badge-integrity-critical' :
                               issue.severity === 'ERROR' ? 'badge-integrity-error' : 'badge-integrity-warning';

            let loopChainHtml = '';
            if (issue.cycleChain && Array.isArray(issue.cycleChain)) {
                loopChainHtml = `
                    <div class="integrity-loop-chain">
                        <strong style="font-size: 0.72rem; color: #ef4444; width: 100%; margin-bottom: 2px;">${deadlockLabel}</strong>
                        ${issue.cycleChain.map((node, nIdx) => `
                            <span class="integrity-loop-node">${this.escapeHtml(node)}</span>
                            ${nIdx < issue.cycleChain.length - 1 ? '<span class="integrity-loop-arrow">➔</span>' : ''}
                        `).join('')}
                    </div>
                `;
            }

            return `
                <div class="integrity-issue-card ${cardClass}" id="card-${issue.id}">
                    <div class="integrity-card-header">
                        <div class="integrity-card-title-wrap">
                            <span class="${badgeClass}">${issue.severity}</span>
                            <strong style="font-size: 0.9rem;">${this.escapeHtml(issue.title)}</strong>
                            <span style="font-size: 0.75rem; color: #64748b; background: #e2e8f0; padding: 1px 6px; border-radius: 4px;">${this.escapeHtml(issue.fieldName)}</span>
                        </div>
                    </div>
                    <div class="integrity-card-desc">
                        ${this.escapeHtml(issue.description)}
                    </div>
                    ${loopChainHtml}
                    <div class="integrity-card-recommendation" style="font-size: 0.78rem; padding: 6px 10px; border-radius: 4px;">
                        💡 <strong>${recommendationLabel}</strong> ${this.escapeHtml(issue.recommendation)}
                    </div>
                    <div class="integrity-card-actions">
                        ${issue.fieldId ? `
                            <button type="button" class="btn-integrity-jump" onclick="window.FormBuilderApp.jumpToFieldAndFix('${issue.fieldId}', '${issue.targetProperty || 'label'}')">
                                🔍 ${jumpBtnLabel}
                            </button>
                        ` : ''}
                        ${issue.quickFix ? `
                            <button type="button" class="btn-integrity-quickfix" onclick="window.FormBuilderApp.quickFixSingleIssue('${issue.id}')">
                                ⚡ ${quickFixBtnLabel}
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    quickFixSingleIssue(issueId) {
        const audit = this.runDataIntegrityCheck();
        const issue = audit.issues.find(i => i.id === issueId);
        if (!issue) return;

        let fixApplied = false;

        if (issue.fieldId) {
            const loc = this.findField(issue.fieldId);
            if (loc && loc.field) {
                const field = loc.field;

                // Fix missing options
                if (issue.quickFix === 'add_default_options' || issue.quickFix === 'fill_default_option_names') {
                    field.options = ['Option 1', 'Option 2', 'Option 3'];
                    fixApplied = true;
                }
                // Fix duplicate options
                else if (issue.quickFix === 'deduplicate_options') {
                    if (Array.isArray(field.options)) {
                        const seen = new Set();
                        field.options = field.options.map((opt, idx) => {
                            const str = String(opt).trim();
                            if (seen.has(str.toLowerCase())) {
                                return `${str} (${idx + 1})`;
                            }
                            seen.add(str.toLowerCase());
                            return str;
                        });
                        fixApplied = true;
                    }
                }
                // Fix circular logic or self-dependency or orphaned condition
                else if (issue.quickFix === 'break_cycle_rule' || issue.quickFix === 'remove_conditional_toggle') {
                    delete field.conditional;
                    fixApplied = true;
                }
                // Fix inverted number bounds
                else if (issue.quickFix === 'swap_num_bounds') {
                    const temp = field.min;
                    field.min = field.max;
                    field.max = temp;
                    fixApplied = true;
                }
                // Fix inverted length bounds
                else if (issue.quickFix === 'swap_len_bounds') {
                    const temp = field.minLength;
                    field.minLength = field.maxLength;
                    field.maxLength = temp;
                    fixApplied = true;
                }
                // Reset invalid regex
                else if (issue.quickFix === 'reset_regex') {
                    field.validation = 'none';
                    delete field.customRegex;
                    fixApplied = true;
                }
                // Set default label
                else if (issue.quickFix === 'set_default_label') {
                    field.label = this.capitalize(field.type.replace(/_/g, ' ')) + ' Question';
                    fixApplied = true;
                }
                // Auto uniquify aliases
                else if (issue.quickFix === 'auto_uniquify_aliases') {
                    field.alias = `${field.alias}_${Math.random().toString(36).substr(2, 4)}`;
                    fixApplied = true;
                }
            }
        } else if (issue.sectionId && issue.quickFix === 'delete_empty_section') {
            this.currentForm.sections = this.currentForm.sections.filter(s => s.id !== issue.sectionId);
            fixApplied = true;
        }

        if (fixApplied) {
            this.recordState(`Auto-fixed integrity issue: ${issue.title}`);
            this.renderCanvas();
            this.renderIntegrityModalContent(this.currentIntegrityFilter || 'all');
            this.showToast(`✨ Resolved "${issue.title}" successfully!`, 'success');
        }
    }

    autoFixIntegrityIssues() {
        const audit = this.runDataIntegrityCheck();
        if (audit.issues.length === 0) {
            this.showToast('✓ No issues to fix! Form is 100% valid.', 'success');
            return;
        }

        let fixedCount = 0;
        audit.issues.forEach(issue => {
            if (issue.fieldId) {
                const loc = this.findField(issue.fieldId);
                if (loc && loc.field) {
                    const f = loc.field;
                    if (['select', 'radio', 'checkbox_group'].includes(f.type) && (!f.options || f.options.length === 0 || f.options.every(o => !o || !String(o).trim()))) {
                        f.options = ['Option 1', 'Option 2', 'Option 3'];
                        fixedCount++;
                    }
                    if (f.conditional && f.conditional.show_if) {
                        if (issue.category === 'logic' && (issue.severity === 'CRITICAL' || issue.quickFix === 'remove_conditional_toggle' || issue.quickFix === 'break_cycle_rule')) {
                            delete f.conditional;
                            fixedCount++;
                        }
                    }
                    if (f.type === 'number' && f.min !== undefined && f.max !== undefined && parseFloat(f.min) > parseFloat(f.max)) {
                        const temp = f.min;
                        f.min = f.max;
                        f.max = temp;
                        fixedCount++;
                    }
                    if (['text', 'textarea', 'email', 'tel'].includes(f.type) && f.minLength && f.maxLength && parseInt(f.minLength, 10) > parseInt(f.maxLength, 10)) {
                        const temp = f.minLength;
                        f.minLength = f.maxLength;
                        f.maxLength = temp;
                        fixedCount++;
                    }
                    if (!f.label || !String(f.label).trim()) {
                        f.label = this.capitalize(f.type.replace(/_/g, ' ')) + ' Question';
                        fixedCount++;
                    }
                }
            }
        });

        if (fixedCount > 0) {
            this.recordState(`Auto-fixed ${fixedCount} data integrity issue(s)`);
            this.renderCanvas();
            this.renderIntegrityModalContent(this.currentIntegrityFilter || 'all');
            this.showToast(`✨ Automatically repaired ${fixedCount} issue${fixedCount === 1 ? '' : 's'}!`, 'success');
        } else {
            this.showToast('Remaining issues require manual review in the property editor.', 'info');
        }
    }

    jumpToFieldAndFix(fieldId, targetPropertyKeyword = '') {
        this.closeDataIntegrityModal();
        this.selectField(fieldId, true);
        if (targetPropertyKeyword) {
            setTimeout(() => {
                this.jumpToProperty(targetPropertyKeyword);
            }, 150);
        }
    }

    copyIntegrityReport() {
        const audit = this.runDataIntegrityCheck();
        let report = `### Form Data Integrity Diagnostic Report\n`;
        report += `**Form:** ${this.currentForm?.name || 'Untitled Form'}\n`;
        report += `**Health Score:** ${audit.score}%\n`;
        report += `**Status:** ${audit.stats.total} total issue(s) (${audit.stats.critical} Critical, ${audit.stats.error} Errors, ${audit.stats.warning} Warnings)\n\n`;

        if (audit.issues.length === 0) {
            report += `✓ 100% Passed. All choice options, labels, and conditional logic dependencies are valid.\n`;
        } else {
            audit.issues.forEach((issue, idx) => {
                report += `${idx + 1}. [${issue.severity}] ${issue.title} (Field: "${issue.fieldName}" [${issue.fieldType}])\n`;
                report += `   - Problem: ${issue.description}\n`;
                report += `   - Recommendation: ${issue.recommendation}\n\n`;
            });
        }

        navigator.clipboard.writeText(report).then(() => {
            this.showToast('📋 Data Integrity Report copied to clipboard!', 'success');
        }).catch(() => {
            this.showToast('Report generated in console log.', 'info');
            console.log(report);
        });
    }

    validateForm(userInitiated = true) {
        const audit = this.runDataIntegrityCheck();
        const canvas = this.dom.canvas || document.getElementById('form-canvas');
        if (!canvas) return;

        this.activeValidationErrors.clear();
        audit.issues.forEach(issue => {
            if (issue.fieldId) {
                if (!this.activeValidationErrors.has(issue.fieldId)) {
                    this.activeValidationErrors.set(issue.fieldId, []);
                }
                this.activeValidationErrors.get(issue.fieldId).push(`${issue.severity}: ${issue.title}`);
            }
        });

        this.renderCanvas();

        if (userInitiated) {
            this.openDataIntegrityModal();
        }

        this.updateCanvasValidationStatus();
    }

    updateCanvasValidationStatus() {
        const statusEl = document.getElementById('canvas-validation-status');
        if (!statusEl || !this.currentForm) return;

        const audit = this.runDataIntegrityCheck();

        if (audit.stats.total > 0) {
            const hasCriticalOrError = audit.stats.critical > 0 || audit.stats.error > 0;
            statusEl.className = `canvas-validation-status-pill ${hasCriticalOrError ? 'val-warning' : 'val-info'}`;
            statusEl.title = `Data Integrity: ${audit.stats.total} diagnostic issue(s) detected. Click to inspect.`;
            statusEl.innerHTML = `
                <span class="val-status-icon">${hasCriticalOrError ? '⚠️' : 'ℹ️'}</span>
                <span class="val-status-text">Health: ${audit.score}% (${audit.stats.total} Issue${audit.stats.total === 1 ? '' : 's'})</span>
            `;
            statusEl.onclick = () => {
                this.openDataIntegrityModal();
            };
        } else {
            statusEl.className = 'canvas-validation-status-pill val-ok';
            statusEl.title = 'Form Integrity 100%: All choice lists, labels, and logic dependencies are valid';
            statusEl.innerHTML = `
                <span class="val-status-icon">🛡️</span>
                <span class="val-status-text">Health: 100% (All Valid)</span>
            `;
            statusEl.onclick = () => {
                this.openDataIntegrityModal();
            };
        }
    }

    // ==========================================
    // AUTO-SAVE SYSTEM (localStorage)
    // ==========================================

    initAutoSaveUI() {
        // Create or locate autosave indicator in header center
        let indicator = document.getElementById('autosave-indicator');
        if (!indicator) {
            const headerCenter = document.querySelector('.header-center');
            if (headerCenter) {
                indicator = document.createElement('div');
                indicator.id = 'autosave-indicator';
                indicator.className = 'autosave-badge';
                indicator.innerHTML = '<span class="autosave-dot"></span> <span class="autosave-text">Ready</span>';
                indicator.title = 'Changes are automatically saved to your browser local storage';
                headerCenter.appendChild(indicator);
            }
        }
    }

    triggerAutoSave() {
        if (!this.currentForm) return;

        const indicator = document.getElementById('autosave-indicator');
        if (indicator) {
            indicator.className = 'autosave-badge autosave-saving';
            indicator.innerHTML = '<span class="autosave-dot pulse"></span> <span class="autosave-text">Saving...</span>';
        }

        if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);

        this.autoSaveTimer = setTimeout(() => {
            try {
                const payload = {
                    timestamp: Date.now(),
                    form: this.currentForm
                };
                localStorage.setItem(this.autoSaveKey, JSON.stringify(payload));
                
                if (indicator) {
                    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    indicator.className = 'autosave-badge autosave-saved';
                    indicator.innerHTML = `<span class="autosave-dot green"></span> <span class="autosave-text">Auto-saved ${timeStr}</span>`;
                }

                this.showAutoSaveToast();
            } catch (err) {
                console.warn('Auto-save to localStorage failed:', err);
                if (indicator) {
                    indicator.className = 'autosave-badge autosave-error';
                    indicator.innerHTML = '<span class="autosave-dot red"></span> <span class="autosave-text">Save error</span>';
                }
            }
        }, 500);
    }

    showAutoSaveToast() {
        let toast = document.getElementById('autosave-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'autosave-toast';
            toast.className = 'autosave-toast';
            document.body.appendChild(toast);
        }

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        toast.innerHTML = `<span class="autosave-toast-icon">💾</span> <span>Auto-saved <small style="opacity:0.75; font-size:0.75rem; margin-left:3px;">${timeStr}</small></span>`;
        toast.classList.add('show');

        if (this.autoSaveToastTimeout) clearTimeout(this.autoSaveToastTimeout);
        this.autoSaveToastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }

    getAutoSavedData() {
        try {
            const raw = localStorage.getItem(this.autoSaveKey);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    clearAutoSave() {
        localStorage.removeItem(this.autoSaveKey);
        const indicator = document.getElementById('autosave-indicator');
        if (indicator) {
            indicator.className = 'autosave-badge';
            indicator.innerHTML = '<span class="autosave-dot"></span> <span class="autosave-text">Ready</span>';
        }
        this.showToast('Auto-save cache cleared', 'info');
    }

    // ==========================================
    // HISTORY (UNDO / REDO) MANAGEMENT
    // ==========================================

    recordState(actionName = 'Edit') {
        if (this.isPerformingHistoryAction || !this.currentForm) return;

        // Truncate forward history if after an undo
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        const snapshot = {
            action: actionName,
            timestamp: Date.now(),
            form: JSON.parse(JSON.stringify(this.currentForm)),
            selectedFieldId: this.selectedFieldId,
            selectedSectionId: this.selectedSectionId
        };

        this.history.push(snapshot);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex = this.history.length - 1;
        }

        this.updateUndoRedoUI();
        this.triggerAutoSave();

        // Multi-Session Auto-Checkpoint trigger (every 10 consecutive edits)
        this.consecutiveChangesCount = (this.consecutiveChangesCount || 0) + 1;
        if (this.consecutiveChangesCount >= 10) {
            this.consecutiveChangesCount = 0;
            if (window.MultiSessionPlanner && typeof window.MultiSessionPlanner.saveAutoCheckpoint === 'function') {
                window.MultiSessionPlanner.saveAutoCheckpoint(this.currentForm, actionName);
            }
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.isPerformingHistoryAction = true;
            this.historyIndex--;
            const previous = this.history[this.historyIndex];
            this.currentForm = JSON.parse(JSON.stringify(previous.form));
            this.selectedFieldId = previous.selectedFieldId;
            this.selectedSectionId = previous.selectedSectionId;

            this.renderCanvas();
            if (this.selectedFieldId) {
                this.selectField(this.selectedFieldId, false);
            } else if (this.selectedSectionId) {
                this.selectSection(this.selectedSectionId);
            } else {
                this.renderFormProperties();
            }

            this.isPerformingHistoryAction = false;
            this.updateUndoRedoUI();
            this.triggerAutoSave();
            this.showToast(`Undone: ${previous.action || 'Change'}`, 'info');
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.isPerformingHistoryAction = true;
            this.historyIndex++;
            const next = this.history[this.historyIndex];
            this.currentForm = JSON.parse(JSON.stringify(next.form));
            this.selectedFieldId = next.selectedFieldId;
            this.selectedSectionId = next.selectedSectionId;

            this.renderCanvas();
            if (this.selectedFieldId) {
                this.selectField(this.selectedFieldId, false);
            } else if (this.selectedSectionId) {
                this.selectSection(this.selectedSectionId);
            } else {
                this.renderFormProperties();
            }

            this.isPerformingHistoryAction = false;
            this.updateUndoRedoUI();
            this.triggerAutoSave();
            this.showToast(`Redone: ${next.action || 'Change'}`, 'info');
        }
    }

    updateUndoRedoUI() {
        const undoBtn = document.getElementById('btn-undo');
        const redoBtn = document.getElementById('btn-redo');

        const canUndo = this.historyIndex > 0;
        const canRedo = this.historyIndex < this.history.length - 1;

        if (undoBtn) {
            undoBtn.disabled = !canUndo;
            undoBtn.classList.toggle('disabled', !canUndo);
            undoBtn.title = canUndo ? `Undo (Ctrl+Z): ${this.history[this.historyIndex]?.action || ''}` : 'Nothing to undo';
        }
        if (redoBtn) {
            redoBtn.disabled = !canRedo;
            redoBtn.classList.toggle('disabled', !canRedo);
            redoBtn.title = canRedo ? `Redo (Ctrl+Y): ${this.history[this.historyIndex + 1]?.action || ''}` : 'Nothing to redo';
        }
    }

    // ==========================================
    // JSON IMPORT & EXPORT
    // ==========================================

    exportJSON(skipIntegrityPrompt = false) {
        if (!this.currentForm) {
            this.showToast('No form to export', 'error');
            return;
        }

        if (!skipIntegrityPrompt) {
            const audit = this.runDataIntegrityCheck();
            if (audit.stats.critical > 0 || audit.stats.error > 0) {
                const proceed = confirm(`⚠️ Data Integrity Notice: Your form has ${audit.stats.critical} critical and ${audit.stats.error} error diagnostic(s) (such as circular logic deadlock or missing select/radio choices).\n\nClick "Cancel" to inspect with the Data Integrity Checker, or "OK" to proceed with export anyway.`);
                if (!proceed) {
                    this.openDataIntegrityModal();
                    return;
                }
            }
        }

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.currentForm, null, 2));
        const downloadAnchor = document.createElement('a');
        const fileName = `${(this.currentForm.name || 'consultation-form').toLowerCase().replace(/[^a-z0-9]/gi, '_')}_config.json`;

        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", fileName);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        this.showToast(`Exported "${fileName}"`, 'success');
    }

    importJSONFile(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                this.loadFormFromJSON(parsed);
            } catch (err) {
                console.error('JSON Import error:', err);
                alert('Invalid JSON file. Please ensure the file contains valid form configuration JSON.');
            }
        };
        reader.readAsText(file);
    }

    loadFormFromJSON(formData) {
        if (!formData || typeof formData !== 'object') {
            alert('Invalid form data format.');
            return;
        }

        // Validate basic structure
        if (!Array.isArray(formData.sections)) {
            if (Array.isArray(formData.fields)) {
                formData = {
                    id: formData.id || `custom_${Date.now()}`,
                    name: formData.name || 'Imported Form',
                    category: formData.category || 'Custom',
                    description: formData.description || '',
                    sections: [{
                        id: 'section_1',
                        title: 'General',
                        collapsed: false,
                        fields: formData.fields
                    }]
                };
            } else {
                alert('Imported JSON must contain a "sections" or "fields" array.');
                return;
            }
        }

        // Normalize section and field attributes
        formData.sections.forEach((sec, sIdx) => {
            if (!sec.id) sec.id = `sec_${Date.now()}_${sIdx}`;
            if (!sec.title) sec.title = `Section ${sIdx + 1}`;
            if (sec.collapsed === undefined) sec.collapsed = false;
            if (sec.hidden === undefined) sec.hidden = false;
            if (!Array.isArray(sec.fields) && sec.type !== 'medical_section') {
                sec.fields = [];
            }
            if (Array.isArray(sec.fields)) {
                sec.fields.forEach((f, fIdx) => {
                    if (!f.id) f.id = `field_${Date.now()}_${sIdx}_${fIdx}`;
                    if (!f.type) f.type = 'text';
                    if (!f.label) f.label = `Field ${fIdx + 1}`;
                    if (f.required === undefined) f.required = false;
                    if (!f.labelAlign) f.labelAlign = 'top';
                });
            }
        });

        this.loadForm(formData, 'Import JSON');
        this.showToast(`Form "${formData.name || 'Imported'}" loaded successfully!`, 'success');
    }

    // ==========================================
    // KEYBOARD SHORTCUTS & CANVAS NAVIGATION
    // ==========================================

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Focus Palette Search: Ctrl+F / Cmd+F (or '/' when not editing text)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
                // If a field is currently selected, focus the Field Property Editor Search
                if (this.selectedFieldId || (this.selectedFieldIds && this.selectedFieldIds.size > 0)) {
                    const propSearch = document.getElementById('prop-search-filter-input');
                    if (propSearch) {
                        e.preventDefault();
                        propSearch.focus();
                        propSearch.select();
                        propSearch.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        this.showToast('🔍 Field Property Search focused (Ctrl+F)', 'info');
                        return;
                    }
                }

                const searchInput = document.getElementById('palette-search-input');
                if (searchInput) {
                    e.preventDefault();
                    searchInput.focus();
                    searchInput.select();
                    searchInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    this.showToast('Palette filter search focused (Ctrl+F)', 'info');
                    return;
                }
            }

            // Don't intercept when user is actively typing inside an input/textarea/select
            const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
            const isEditingText = (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') &&
                                  !document.activeElement.classList.contains('form-preview-interactive');

            // Quick search with '/' key when not editing text
            if (e.key === '/' && !isEditingText) {
                const searchInput = document.getElementById('palette-search-input');
                if (searchInput) {
                    e.preventDefault();
                    searchInput.focus();
                    searchInput.select();
                    return;
                }
            }

            // Canvas Arrow Key 5px Nudge / Alt Reorder
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !isEditingText) {
                const hasSelection = this.selectedFieldId || (this.selectedFieldIds && this.selectedFieldIds.size > 0);
                if (hasSelection) {
                    e.preventDefault();
                    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                        this.moveSelectedFieldOrder(e.key === 'ArrowUp' ? -1 : 1);
                    } else {
                        const step = e.shiftKey ? 20 : 5;
                        let dx = 0;
                        let dy = 0;
                        if (e.key === 'ArrowLeft') dx = -step;
                        if (e.key === 'ArrowRight') dx = step;
                        if (e.key === 'ArrowUp') dy = -step;
                        if (e.key === 'ArrowDown') dy = step;
                        this.nudgeSelectedFields(dx, dy);
                    }
                    return;
                }
            }

            // Reset Nudge Offset to 0 with '0' or 'r' key
            if ((e.key === '0' || e.key === 'r' || e.key === 'R') && !isEditingText) {
                if (this.selectedFieldId || (this.selectedFieldIds && this.selectedFieldIds.size > 0)) {
                    e.preventDefault();
                    this.resetFieldNudgeOffset();
                    return;
                }
            }

            // Tab Navigation: Canvas Field to Property Editor Focus
            if (e.key === 'Tab') {
                const isInsidePropEditor = document.activeElement && this.dom.properties && this.dom.properties.contains(document.activeElement);
                if (!isEditingText || isInsidePropEditor) {
                    if (!isInsidePropEditor && (this.selectedFieldId || (this.selectedFieldIds && this.selectedFieldIds.size > 0))) {
                        e.preventDefault();
                        this.focusPropertyEditor();
                        return;
                    }
                }
            }

            // Field Selection Cycling: '[' / ']' or 'j' / 'k'
            if ((e.key === ']' || e.key === 'j') && !isEditingText) {
                e.preventDefault();
                this.cycleSelectedField(1);
                return;
            }
            if ((e.key === '[' || e.key === 'k') && !isEditingText) {
                e.preventDefault();
                this.cycleSelectedField(-1);
                return;
            }

            // Undo: Ctrl+Z / Cmd+Z (without Shift)
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
                if (!isEditingText) {
                    e.preventDefault();
                    this.undo();
                }
            }

            // Redo: Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z
            if (((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))) {
                if (!isEditingText) {
                    e.preventDefault();
                    this.redo();
                }
            }

            // Duplicate Field: Ctrl+D / Cmd+D (supports single & multi-selection)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
                if (!isEditingText) {
                    if (this.selectedFieldIds && this.selectedFieldIds.size > 1) {
                        e.preventDefault();
                        this.duplicateMultipleFields([...this.selectedFieldIds]);
                    } else if (this.selectedFieldId) {
                        e.preventDefault();
                        this.duplicateField(this.selectedFieldId);
                    }
                }
            }

            // Delete Field: Delete or Backspace key (supports single & multi-selection)
            if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditingText) {
                if (this.selectedFieldIds && this.selectedFieldIds.size > 1) {
                    e.preventDefault();
                    this.deleteMultipleFields([...this.selectedFieldIds]);
                } else if (this.selectedFieldId) {
                    e.preventDefault();
                    this.deleteField(this.selectedFieldId);
                }
            }

            // Export JSON: Ctrl+S / Cmd+S
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                this.exportJSON();
            }

            // Escape: Return focus to canvas or deselect
            if (e.key === 'Escape') {
                const isInsidePropEditor = document.activeElement && this.dom.properties && this.dom.properties.contains(document.activeElement);
                if (isInsidePropEditor && this.selectedFieldId) {
                    e.preventDefault();
                    const canvasItem = this.dom.canvas.querySelector(`[data-field-id="${this.selectedFieldId}"]`);
                    if (canvasItem) {
                        canvasItem.focus();
                        this.showToast('🎯 Focus returned to canvas field', 'info');
                    }
                } else {
                    this.deselectField();
                }
            }
        });
    }

    initCanvasNudgeHUD() {
        let hud = document.getElementById('canvas-nudge-hud');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'canvas-nudge-hud';
            hud.className = 'canvas-nudge-hud';
            hud.innerHTML = `
                <div class="canvas-nudge-coords">
                    <span id="canvas-nudge-info">📐 Pos: X: 0px, Y: 0px</span>
                    <span style="color: rgba(255,255,255,0.6); font-size: 0.72rem; margin-left: 8px;">(Arrow Keys: ±5px | Shift: ±20px | 0: Reset)</span>
                </div>
            `;
            document.body.appendChild(hud);
        }
    }

    showCanvasNudgeHUD(fieldLabel, x, y) {
        const hud = document.getElementById('canvas-nudge-hud');
        const info = document.getElementById('canvas-nudge-info');
        if (!hud || !info) return;

        info.innerHTML = `<strong>${this.escapeHtml(fieldLabel)}</strong> ➔ X: ${x > 0 ? '+' : ''}${x}px, Y: ${y > 0 ? '+' : ''}${y}px`;
        hud.classList.add('show');

        clearTimeout(this._nudgeHudTimeout);
        this._nudgeHudTimeout = setTimeout(() => {
            if (hud) hud.classList.remove('show');
        }, 2200);
    }

    nudgeSelectedFields(dx, dy) {
        const targetIds = (this.selectedFieldIds && this.selectedFieldIds.size > 0)
            ? [...this.selectedFieldIds]
            : (this.selectedFieldId ? [this.selectedFieldId] : []);

        if (targetIds.length === 0) return;

        let primaryFieldLabel = '';
        let finalX = 0;
        let finalY = 0;

        targetIds.forEach(fieldId => {
            const loc = this.findField(fieldId);
            if (loc && loc.field) {
                const f = loc.field;
                if (!f.customOffset) {
                    f.customOffset = { x: 0, y: 0 };
                }
                f.customOffset.x = (f.customOffset.x || 0) + dx;
                f.customOffset.y = (f.customOffset.y || 0) + dy;

                if (!primaryFieldLabel) primaryFieldLabel = f.label || 'Field';
                finalX = f.customOffset.x;
                finalY = f.customOffset.y;

                // Update DOM directly for smooth real-time response
                const domEl = this.dom.canvas.querySelector(`[data-field-id="${fieldId}"]`);
                if (domEl) {
                    domEl.style.transform = `translate(${f.customOffset.x}px, ${f.customOffset.y}px)`;
                    domEl.classList.add('field-custom-offset');
                }
            }
        });

        this.showCanvasNudgeHUD(targetIds.length > 1 ? `${targetIds.length} Selected Fields` : primaryFieldLabel, finalX, finalY);

        clearTimeout(this._nudgeDebounceTimer);
        this._nudgeDebounceTimer = setTimeout(() => {
            this.recordState(`Nudge ${targetIds.length} Field(s)`);
        }, 500);
    }

    resetFieldNudgeOffset() {
        const targetIds = (this.selectedFieldIds && this.selectedFieldIds.size > 0)
            ? [...this.selectedFieldIds]
            : (this.selectedFieldId ? [this.selectedFieldId] : []);

        if (targetIds.length === 0) return;

        targetIds.forEach(fieldId => {
            const loc = this.findField(fieldId);
            if (loc && loc.field) {
                delete loc.field.customOffset;
                const domEl = this.dom.canvas.querySelector(`[data-field-id="${fieldId}"]`);
                if (domEl) {
                    domEl.style.transform = '';
                    domEl.classList.remove('field-custom-offset');
                }
            }
        });

        this.recordState('Reset Field Position Offset');
        this.showToast('📐 Field position offset reset to standard layout', 'info');
        this.showCanvasNudgeHUD(targetIds.length > 1 ? `${targetIds.length} Fields` : 'Field', 0, 0);
    }

    cycleSelectedField(direction = 1) {
        if (!this.currentForm || !this.currentForm.sections) return;

        const allFieldIds = [];
        this.currentForm.sections.forEach(sec => {
            if (sec.fields) {
                sec.fields.forEach(f => {
                    allFieldIds.push(f.id);
                    if ((f.type === 'container' || f.type === 'section_group') && Array.isArray(f.fields)) {
                        f.fields.forEach(cf => allFieldIds.push(cf.id));
                    }
                });
            }
        });

        if (allFieldIds.length === 0) return;

        let currentIndex = allFieldIds.indexOf(this.selectedFieldId);
        let nextIndex = 0;

        if (currentIndex === -1) {
            nextIndex = direction > 0 ? 0 : allFieldIds.length - 1;
        } else {
            nextIndex = (currentIndex + direction + allFieldIds.length) % allFieldIds.length;
        }

        const nextId = allFieldIds[nextIndex];
        this.selectField(nextId, true);
        this.showToast(`Selected: ${nextIndex + 1} of ${allFieldIds.length} fields (Tab to edit)`, 'info');
    }

    focusPropertyEditor() {
        if (!this.dom.properties) return;
        const searchInput = document.getElementById('prop-search-filter-input');
        const firstInput = this.dom.properties.querySelector('input:not([type="hidden"]), select, textarea, button.btn-prop-action');
        const target = searchInput || firstInput;
        if (target) {
            target.focus();
            if (target.select) target.select();
            target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            this.showToast('⌨️ Property Editor focused. Use Tab to cycle settings, Esc to return.', 'info');
        }
    }

    moveSelectedFieldOrder(delta = 1) {
        if (!this.selectedFieldId) return;
        const loc = this.findField(this.selectedFieldId);
        if (!loc || !loc.section) return;

        const fieldsList = loc.parentContainer ? loc.parentContainer.fields : loc.section.fields;
        const currIdx = fieldsList.findIndex(f => f.id === this.selectedFieldId);
        if (currIdx === -1) return;

        const newIdx = currIdx + delta;
        if (newIdx < 0 || newIdx >= fieldsList.length) return;

        const moved = fieldsList.splice(currIdx, 1)[0];
        fieldsList.splice(newIdx, 0, moved);

        this.recordState(`Move Field ${delta < 0 ? 'Up' : 'Down'} in Section`);
        this.renderCanvas();
        this.selectField(moved.id, false);
        this.showToast(`↕️ Moved "${moved.label || 'Field'}" ${delta < 0 ? 'Up' : 'Down'}`, 'info');
    }

    initToolbarHandlers() {
        const undoBtn = document.getElementById('btn-undo');
        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());

        const redoBtn = document.getElementById('btn-redo');
        if (redoBtn) redoBtn.addEventListener('click', () => this.redo());

        const exportBtn = document.getElementById('btn-export-json');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const exportDropdown = document.getElementById('export-dropdown-menu');
                if (exportDropdown) exportDropdown.classList.remove('show');
                this.exportJSON();
            });
        }

        const exportCsvTemplateBtn = document.getElementById('btn-export-csv-template');
        if (exportCsvTemplateBtn) {
            exportCsvTemplateBtn.addEventListener('click', () => {
                const exportDropdown = document.getElementById('export-dropdown-menu');
                if (exportDropdown) exportDropdown.classList.remove('show');
                this.downloadCSVTemplate();
            });
        }

        const schemaPdfBtn = document.getElementById('btn-export-schema-mapping');
        if (schemaPdfBtn) {
            schemaPdfBtn.addEventListener('click', () => {
                const exportDropdown = document.getElementById('export-dropdown-menu');
                if (exportDropdown) exportDropdown.classList.remove('show');
                if (window.PDFGenerator && typeof window.PDFGenerator.generateSchemaMappingPDF === 'function') {
                    window.PDFGenerator.generateSchemaMappingPDF(this.currentForm);
                    this.showToast('Generating Client Schema Mapping Guide...', 'info');
                }
            });
        }

        const openPdfSettingsBtn = document.getElementById('btn-open-pdf-settings');
        if (openPdfSettingsBtn) {
            openPdfSettingsBtn.addEventListener('click', () => {
                const modal = document.getElementById('pdf-settings-modal');
                if (modal) modal.style.display = 'flex';
            });
        }

        // Import, Export, & Options Dropdown Menu Handling
        const importMenuBtn = document.getElementById('btn-import-menu');
        const importDropdown = document.getElementById('import-dropdown-menu');
        const exportMenuBtn = document.getElementById('btn-export-menu');
        const exportDropdown = document.getElementById('export-dropdown-menu');
        const optionsMenuBtn = document.getElementById('btn-options-menu');
        const optionsDropdown = document.getElementById('options-dropdown-menu');

        const closeAllHeaderDropdowns = () => {
            if (importDropdown) importDropdown.classList.remove('show');
            if (exportDropdown) exportDropdown.classList.remove('show');
            if (optionsDropdown) optionsDropdown.classList.remove('show');
        };

        if (importMenuBtn && importDropdown) {
            importMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (exportDropdown) exportDropdown.classList.remove('show');
                if (optionsDropdown) optionsDropdown.classList.remove('show');
                importDropdown.classList.toggle('show');
            });
        }

        if (exportMenuBtn && exportDropdown) {
            exportMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (importDropdown) importDropdown.classList.remove('show');
                if (optionsDropdown) optionsDropdown.classList.remove('show');
                exportDropdown.classList.toggle('show');
            });
        }

        if (optionsMenuBtn && optionsDropdown) {
            optionsMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (importDropdown) importDropdown.classList.remove('show');
                if (exportDropdown) exportDropdown.classList.remove('show');
                optionsDropdown.classList.toggle('show');
            });
        }

        // Close options dropdown items when clicked
        if (optionsDropdown) {
            optionsDropdown.querySelectorAll('.dropdown-item-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    optionsDropdown.classList.remove('show');
                });
            });
        }

        document.addEventListener('click', (e) => {
            if (importMenuBtn && importDropdown && !importMenuBtn.contains(e.target) && !importDropdown.contains(e.target)) {
                importDropdown.classList.remove('show');
            }
            if (exportMenuBtn && exportDropdown && !exportMenuBtn.contains(e.target) && !exportDropdown.contains(e.target)) {
                exportDropdown.classList.remove('show');
            }
            if (optionsMenuBtn && optionsDropdown && !optionsMenuBtn.contains(e.target) && !optionsDropdown.contains(e.target)) {
                optionsDropdown.classList.remove('show');
            }
        });

        const importJsonActionBtn = document.getElementById('btn-import-json-action');
        const importInput = document.getElementById('file-import-json');

        if (importJsonActionBtn && importInput) {
            importJsonActionBtn.addEventListener('click', () => {
                if (importDropdown) importDropdown.classList.remove('show');
                importInput.click();
            });
        }

        const importCsvActionBtn = document.getElementById('btn-import-csv-action');
        if (importCsvActionBtn) {
            importCsvActionBtn.addEventListener('click', () => {
                if (importDropdown) importDropdown.classList.remove('show');
                this.openBulkCSVModal();
            });
        }

        const legacyImportBtn = document.getElementById('btn-import-json');
        if (legacyImportBtn && importInput) {
            legacyImportBtn.addEventListener('click', () => importInput.click());
        }

        if (importInput) {
            importInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.importJSONFile(e.target.files[0]);
                    e.target.value = '';
                }
            });
        }
    }

    // ==========================================
    // PALETTE & SEARCH FILTER SETUP
    // ==========================================

        getAllFieldTypeDefinitions() {
        const t = (key, fallback) => (window.i18n ? window.i18n.t(key, fallback) : fallback);
        return [
            { 
                type: 'text', 
                icon: '📝', 
                badgeClass: 'badge-type-text', 
                label: t('palette.field_labels.text', 'Short Text'), 
                desc: t('palette.field_descriptions.text', 'Single-line text input'),
                useCase: t('palette.field_use_cases.text', 'Best for single-line responses like client names, job titles, or short answers.') 
            },
            { 
                type: 'textarea', 
                icon: '📄', 
                badgeClass: 'badge-type-text', 
                label: t('palette.field_labels.textarea', 'Paragraph / Long Text'), 
                desc: t('palette.field_descriptions.textarea', 'Multi-line notes and details'),
                useCase: t('palette.field_use_cases.textarea', 'Best for detailed medical notes, consultation concerns, or long explanations.') 
            },
            { 
                type: 'email', 
                icon: '📧', 
                badgeClass: 'badge-type-contact', 
                label: t('palette.field_labels.email', 'Email Address'), 
                desc: t('palette.field_descriptions.email', 'Email validation pattern'),
                useCase: t('palette.field_use_cases.email', 'Best for capturing client email with automatic syntax validation and copy delivery.') 
            },
            { 
                type: 'tel', 
                icon: '📱', 
                badgeClass: 'badge-type-contact', 
                label: t('palette.field_labels.tel', 'Phone Number'), 
                desc: t('palette.field_descriptions.tel', 'Phone format validation'),
                useCase: t('palette.field_use_cases.tel', 'Best for emergency contact numbers, mobile phone, or SMS reminder opt-ins.') 
            },
            { 
                type: 'date', 
                icon: '📅', 
                badgeClass: 'badge-type-datetime', 
                label: t('palette.field_labels.date', 'Date Picker'), 
                desc: t('palette.field_descriptions.date', 'Date picker calendar'),
                useCase: t('palette.field_use_cases.date', 'Best for client date of birth, consultation date, or procedure scheduling.') 
            },
            { 
                type: 'number', 
                icon: '🔢', 
                badgeClass: 'badge-type-number', 
                label: t('palette.field_labels.number', 'Number / Quantity'), 
                desc: t('palette.field_descriptions.number', 'Numeric values'),
                useCase: t('palette.field_use_cases.number', 'Best for client age, quantitative pain scales, or treatment session count.') 
            },
            { 
                type: 'checkbox', 
                icon: '☑️', 
                badgeClass: 'badge-type-choice', 
                label: t('palette.field_labels.checkbox', 'Checkbox'), 
                desc: t('palette.field_descriptions.checkbox', 'Single confirmation toggle'),
                useCase: t('palette.field_use_cases.checkbox', 'Best for single agreement toggles, terms acceptance, or waiver opt-in.') 
            },
            { 
                type: 'checkbox_group', 
                icon: '📑', 
                badgeClass: 'badge-type-choice', 
                label: t('palette.field_labels.checkbox_group', 'Checkbox Group'), 
                desc: t('palette.field_descriptions.checkbox_group', 'Multi-choice checklist'),
                useCase: t('palette.field_use_cases.checkbox_group', 'Best when clients need to select multiple applicable options or medical symptoms.') 
            },
            { 
                type: 'radio', 
                icon: '🔘', 
                badgeClass: 'badge-type-choice', 
                label: t('palette.field_labels.radio', 'Radio Choices'), 
                desc: t('palette.field_descriptions.radio', 'Single choice selector'),
                useCase: t('palette.field_use_cases.radio', 'Best when client must choose exactly one option from a mutually exclusive list.') 
            },
            { 
                type: 'select', 
                icon: '📋', 
                badgeClass: 'badge-type-choice', 
                label: t('palette.field_labels.select', 'Dropdown Menu'), 
                desc: t('palette.field_descriptions.select', 'Dropdown select menu'),
                useCase: t('palette.field_use_cases.select', 'Best for compact dropdown selection among many options like states or services.') 
            },
            { 
                type: 'section_header', 
                icon: '📑', 
                badgeClass: 'badge-type-layout', 
                label: t('palette.field_labels.section_header', 'Section Header'), 
                desc: t('palette.field_descriptions.section_header', 'Visual group header with title & description'),
                useCase: t('palette.field_use_cases.section_header', 'Best for dividing form into distinct themed subsections with instructions.') 
            },
            { 
                type: 'container', 
                icon: '🗂️', 
                badgeClass: 'badge-type-layout', 
                label: t('palette.field_labels.container', 'Container / Panel'), 
                desc: t('palette.field_descriptions.container', 'Group fields inside a box'),
                useCase: t('palette.field_use_cases.container', 'Best for grouping related questions into a bordered panel box or intake card.') 
            },
            { 
                type: 'section_group', 
                icon: '📦', 
                badgeClass: 'badge-type-layout', 
                label: t('palette.field_labels.section_group', 'Section / Group'), 
                desc: t('palette.field_descriptions.section_group', 'Group & toggle canvas sections'),
                useCase: t('palette.field_use_cases.section_group', 'Best for organizing complex intake blocks into collapsible, manageable section groups.') 
            },
            { 
                type: 'header', 
                icon: '📌', 
                badgeClass: 'badge-type-notice', 
                label: t('palette.field_labels.header', 'Notice / Header'), 
                desc: t('palette.field_descriptions.header', 'Important notice & instructions'),
                useCase: t('palette.field_use_cases.header', 'Best for prominent alerts, clinical warnings, preparation steps, or studio notices.') 
            },
            { 
                type: 'signature', 
                icon: '✍️', 
                badgeClass: 'badge-type-legal', 
                label: t('palette.field_labels.signature', 'Digital Signature'), 
                desc: t('palette.field_descriptions.signature', 'Digital drawing pad'),
                useCase: t('palette.field_use_cases.signature', 'Best for legally binding client drawing pad signature on consent and waivers.') 
            },
            { 
                type: 'body_map', 
                icon: '🗺️', 
                badgeClass: 'badge-type-clinical', 
                label: t('palette.field_labels.body_map', 'Anatomical Placement Map'), 
                desc: t('palette.field_descriptions.body_map', 'Interactive body, ear & face placement diagram'),
                useCase: t('palette.field_use_cases.body_map', 'Best for marking exact anatomical locations, piercing spots, and tattoo sizing on body & ear charts.') 
            },
            { 
                type: 'photo_id', 
                icon: '🪪', 
                badgeClass: 'badge-type-contact', 
                label: t('palette.field_labels.photo_id', 'Photo ID & Reference Upload'), 
                desc: t('palette.field_descriptions.photo_id', 'Client ID & reference photo upload zone'),
                useCase: t('palette.field_use_cases.photo_id', 'Best for verifying client government-issued ID and attaching tattoo/piercing reference art.') 
            }
        ];
    }

    highlightMatch(text, query) {
        if (!text) return '';
        if (!query) return this.escapeHtml(text);
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        const parts = String(text).split(regex);
        return parts.map(part => {
            if (part.toLowerCase() === query.toLowerCase()) {
                return `<mark class="palette-search-highlight">${this.escapeHtml(part)}</mark>`;
            }
            return this.escapeHtml(part);
        }).join('');
    }

    initSmartSuggestToggle() {
        const toggle = document.getElementById('toggle-smart-suggest-palette');
        const recSection = document.getElementById('recommended-fields-section');
        if (!toggle || !recSection) return;

        // Restore saved user preference (defaults to true)
        const saved = localStorage.getItem('formBuilder_showSmartSuggest');
        const isEnabled = saved !== null ? saved === 'true' : true;
        toggle.checked = isEnabled;
        recSection.style.display = isEnabled ? 'block' : 'none';

        toggle.addEventListener('change', () => {
            const active = toggle.checked;
            recSection.style.display = active ? 'block' : 'none';
            localStorage.setItem('formBuilder_showSmartSuggest', active ? 'true' : 'false');
            if (active) {
                this.renderRecommendedFields();
                this.showToast('Smart Suggest recommended fields enabled', 'info');
            } else {
                this.showToast('Smart Suggest section hidden', 'info');
            }
        });
    }

    togglePaletteCategory(catKey) {
        if (!this.paletteCollapsedCategories) this.paletteCollapsedCategories = new Set();
        if (this.paletteCollapsedCategories.has(catKey)) {
            this.paletteCollapsedCategories.delete(catKey);
        } else {
            this.paletteCollapsedCategories.add(catKey);
        }
        const accordion = document.querySelector('.palette-category-accordion[data-category="' + catKey + '"]');
        if (accordion) {
            accordion.classList.toggle('is-collapsed', this.paletteCollapsedCategories.has(catKey));
        }
    }

    renderPalette(filterQuery = '') {
        const allTypes = this.getAllFieldTypeDefinitions();
        const query = (filterQuery || '').toLowerCase().trim();

        if (!this.paletteCollapsedCategories) {
            this.paletteCollapsedCategories = new Set();
        }

        // Categorize field definitions
        const categories = [
            {
                key: 'basic',
                title: window.i18n ? window.i18n.t('palette.categories.basic') : 'Basic Input Fields',
                icon: '✏️',
                types: ['text', 'email', 'tel', 'number', 'date', 'textarea']
            },
            {
                key: 'choices',
                title: window.i18n ? window.i18n.t('palette.categories.choices') : 'Choice & Options',
                icon: '☑️',
                types: ['checkbox', 'checkbox_group', 'radio', 'select']
            },
            {
                key: 'layout',
                title: window.i18n ? window.i18n.t('palette.categories.layout') : 'Layout & Structure',
                icon: '📐',
                types: ['section_header', 'container', 'section_group']
            },
            {
                key: 'legal',
                title: window.i18n ? window.i18n.t('palette.categories.legal') : 'Notices & Legal',
                icon: '⚖️',
                types: ['header', 'signature']
            },
            {
                key: 'clinical_media',
                title: window.i18n ? window.i18n.t('palette.categories.clinical_media', 'Anatomy & Media Upload') : 'Anatomy & Media Upload',
                icon: '🗺️',
                types: ['body_map', 'photo_id']
            }
        ];

        let totalMatching = 0;
        const matchedCategories = [];

        categories.forEach(cat => {
            const catFields = allTypes.filter(ft => cat.types.includes(ft.type));
            const matchingFields = query ? catFields.filter(ft =>
                ft.label.toLowerCase().includes(query) ||
                ft.desc.toLowerCase().includes(query) ||
                ft.type.toLowerCase().includes(query)
            ) : catFields;

            totalMatching += matchingFields.length;
            matchedCategories.push({
                ...cat,
                fields: matchingFields,
                totalCount: catFields.length
            });
        });

        // Update total badge count
        const countBadge = document.getElementById('palette-count-badge');
        if (countBadge) {
            countBadge.textContent = String(totalMatching);
        }

        // Update search results count indicator beneath search input
        const resultsCountEl = document.getElementById('palette-search-results-count');
        if (resultsCountEl) {
            if (query) {
                resultsCountEl.style.display = 'block';
                const foundText = window.i18n ? window.i18n.t('palette.matches_found', { count: totalMatching }) : (totalMatching + ' fields found');
                resultsCountEl.textContent = foundText;
            } else {
                resultsCountEl.style.display = 'none';
                resultsCountEl.textContent = '';
            }
        }

        this.dom.palette.innerHTML = '';

        if (totalMatching === 0) {
            const noMatchesText = window.i18n ? window.i18n.t('palette.no_matches', { query: this.escapeHtml(query) }) : ('No fields match "' + this.escapeHtml(query) + '"');
            const clearSearchText = window.i18n ? window.i18n.t('palette.clear_search', 'Clear search') : 'Clear search';
            this.dom.palette.innerHTML = '<div class="palette-empty-search"><p>' + noMatchesText + '</p><button type="button" class="btn-secondary" id="btn-palette-clear-empty" style="font-size:0.75rem; padding:0.25rem 0.6rem;">' + clearSearchText + '</button></div>';
            const clearEmptyBtn = document.getElementById('btn-palette-clear-empty');
            if (clearEmptyBtn) {
                clearEmptyBtn.addEventListener('click', () => {
                    const inp = document.getElementById('palette-search-input');
                    if (inp) inp.value = '';
                    const clearBtn = document.getElementById('btn-palette-search-clear');
                    if (clearBtn) clearBtn.style.display = 'none';
                    this.renderPalette('');
                });
            }
            return;
        }

        matchedCategories.forEach(cat => {
            if (cat.fields.length === 0 && query) {
                return; // Hide empty category during search
            }

            // If searching, auto-expand categories with matching fields
            const isCategoryCollapsed = query ? false : this.paletteCollapsedCategories.has(cat.key);

            const catEl = document.createElement('div');
            catEl.className = 'palette-category-accordion ' + (isCategoryCollapsed ? 'is-collapsed' : '');
            catEl.dataset.category = cat.key;

            const countText = query ? (cat.fields.length + ' ' + (cat.fields.length === 1 ? 'match' : 'matches')) : String(cat.fields.length);

            catEl.innerHTML = '<div class="palette-category-header" onclick="window.FormBuilderApp.togglePaletteCategory(\'' + cat.key + '\')"><div class="palette-category-title-left"><span class="palette-category-toggle-icon">▼</span><span>' + cat.icon + ' ' + this.escapeHtml(cat.title) + '</span></div><span class="palette-category-count">' + countText + '</span></div><div class="palette-category-items"></div>';

            const itemsContainer = catEl.querySelector('.palette-category-items');

            cat.fields.forEach(ft => {
                const el = document.createElement('div');
                el.className = 'palette-item';
                el.dataset.type = ft.type;
                el.title = 'Click, duplicate, or drag to add ' + ft.label;

                const labelHtml = query ? this.highlightMatch(ft.label, query) : this.escapeHtml(ft.label);
                const descHtml = query ? this.highlightMatch(ft.desc, query) : this.escapeHtml(ft.desc);
                const useCaseHtml = this.escapeHtml(ft.useCase || ft.desc || '');
                const addLabel = window.i18n ? window.i18n.t('palette.add_btn') : 'Add';
                const quickAddTitle = window.i18n ? window.i18n.t('palette.quick_add_title', { label: ft.label }) : ('Quick add / Duplicate ' + ft.label + ' to form');
                const tooltipHint = window.i18n ? window.i18n.t('palette.tooltip_hint') : '💡 Hover icon for use case • Click / Drag to add';

                el.innerHTML = '<div class="palette-icon-wrapper"><div class="palette-icon-badge ' + (ft.badgeClass || '') + '" tabindex="0" role="img" aria-label="' + ft.label + ' use case: ' + useCaseHtml + '" title="💡 ' + ft.label + ' — ' + useCaseHtml + '"><span class="palette-icon-symbol">' + ft.icon + '</span><div class="palette-icon-tooltip" role="tooltip"><div class="palette-tooltip-header"><span class="palette-tooltip-icon">' + ft.icon + '</span><span class="palette-tooltip-title">' + this.escapeHtml(ft.label) + '</span></div><div class="palette-tooltip-usecase">' + useCaseHtml + '</div><div class="palette-tooltip-hint">' + tooltipHint + '</div></div></div></div><div class="palette-info"><span class="palette-label">' + labelHtml + '</span><span class="palette-desc">' + descHtml + '</span></div><button type="button" class="palette-duplicate-btn" title="' + quickAddTitle + '" data-action="quick-add" aria-label="' + quickAddTitle + '"><span class="palette-dup-icon">＋</span><span class="palette-dup-label">' + addLabel + '</span></button>';

                const dupBtn = el.querySelector('.palette-duplicate-btn');
                if (dupBtn) {
                    dupBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.addField(ft.type, null, this.selectedSectionId);
                        this.showToast('Added ' + ft.label + ' to form', 'info');
                    });
                }

                el.addEventListener('click', () => {
                    this.addField(ft.type, null, this.selectedSectionId);
                    this.showToast('Added ' + ft.label, 'info');
                });

                itemsContainer.appendChild(el);
            });

            this.dom.palette.appendChild(catEl);
        });
    }

    // ==========================================
    // RECOMMENDED FIELDS ENGINE
    // ==========================================

    getRecommendedFields() {
        if (!this.currentForm) return [];

        const allFields = [];
        const processFieldList = (fields) => {
            if (!Array.isArray(fields)) return;
            fields.forEach(f => {
                allFields.push(f);
                if (f.type === 'container' && Array.isArray(f.fields)) {
                    processFieldList(f.fields);
                }
            });
        };

        if (Array.isArray(this.currentForm.sections)) {
            this.currentForm.sections.forEach(sec => {
                if (sec.type === 'medical_section') {
                    if (window.MedicalHistorySystem && typeof window.MedicalHistorySystem.getMedicalSection === 'function') {
                        processFieldList(window.MedicalHistorySystem.getMedicalSection().fields);
                    }
                } else {
                    processFieldList(sec.fields);
                }
            });
        }

        const fieldTypes = new Set(allFields.map(f => f.type));
        const labelsLower = allFields.map(f => (f.label || '').toLowerCase());
        const hasFieldMatching = (predicate) => labelsLower.some(predicate);

        const hasName = hasFieldMatching(l => l.includes('name') || l.includes('client') || l.includes('full name'));
        const hasEmail = fieldTypes.has('email') || hasFieldMatching(l => l.includes('email') || l.includes('e-mail'));
        const hasPhone = fieldTypes.has('tel') || hasFieldMatching(l => l.includes('phone') || l.includes('cell') || l.includes('mobile') || l.includes('tel'));
        const hasDOB = fieldTypes.has('date') || hasFieldMatching(l => l.includes('birth') || l.includes('dob') || l.includes('date of birth') || l.includes('age'));
        const hasSignature = fieldTypes.has('signature') || hasFieldMatching(l => l.includes('signature') || l.includes('sign'));
        const hasAddress = hasFieldMatching(l => l.includes('address') || l.includes('street') || l.includes('residence'));
        const hasZip = hasFieldMatching(l => l.includes('zip') || l.includes('postal') || l.includes('postcode'));
        const hasEmergency = hasFieldMatching(l => l.includes('emergency') || l.includes('guardian') || l.includes('parent'));
        const hasMedical = hasFieldMatching(l => l.includes('allerg') || l.includes('medical') || l.includes('condition') || l.includes('medication'));
        const hasConsent = hasFieldMatching(l => l.includes('agree') || l.includes('consent') || l.includes('terms') || l.includes('waiver') || l.includes('acknowledge'));

        const recommendations = [];

        // Co-occurrence rules based on consultation form best practices
        if (hasName && !hasDOB) {
            recommendations.push({
                type: 'date',
                icon: '📅',
                label: 'Date of Birth',
                reason: 'Commonly paired with Full Name',
                required: true,
                helperText: 'Required for client identification and age verification'
            });
        }

        if (hasName && !hasPhone) {
            recommendations.push({
                type: 'tel',
                icon: '📱',
                label: 'Phone Number',
                reason: 'Commonly paired with Full Name',
                required: true,
                helperText: 'Direct telephone contact for appointment reminders'
            });
        }

        if (hasName && !hasEmail) {
            recommendations.push({
                type: 'email',
                icon: '📧',
                label: 'Email Address',
                reason: 'Commonly paired with Full Name',
                required: true,
                helperText: 'For appointment confirmations and digital receipt delivery'
            });
        }

        if ((hasEmail || hasPhone) && !hasName) {
            recommendations.push({
                type: 'text',
                icon: '📝',
                label: 'Full Legal Name',
                reason: 'Core Identity Requirement',
                required: true,
                helperText: 'As printed on government-issued photo ID'
            });
        }

        if (allFields.length > 0 && !hasSignature) {
            recommendations.push({
                type: 'signature',
                icon: '✍️',
                label: 'Digital Client Signature',
                reason: 'Essential for Legal Consent',
                required: true,
                helperText: 'Legally binding digital touch/stylus signature attestation'
            });
        }

        if ((hasDOB || hasName) && !hasEmergency) {
            recommendations.push({
                type: 'text',
                icon: '🚨',
                label: 'Emergency Contact (Name & Phone)',
                reason: 'Pairs with Intake Profile',
                required: false,
                helperText: 'Designated contact person in case of a medical emergency'
            });
        }

        if (hasAddress && !hasZip) {
            recommendations.push({
                type: 'text',
                icon: '📍',
                label: 'Postal / Zip Code',
                reason: 'Pairs with Street Address',
                required: false,
                helperText: 'Postal area code'
            });
        }

        if (allFields.length > 2 && !hasMedical) {
            recommendations.push({
                type: 'checkbox_group',
                icon: '🩺',
                label: 'Known Medical Conditions & Allergies',
                reason: 'Safety Best Practice',
                required: true,
                options: ['Latex Allergy', 'Blood Thinning Medications', 'Skin Conditions / Eczema', 'Fainting / Vasovagal Episodes', 'None'],
                helperText: 'Check all conditions that apply to ensure safe procedure execution'
            });
        }

        if (allFields.length > 1 && !hasConsent) {
            recommendations.push({
                type: 'checkbox',
                icon: '☑️',
                label: 'I confirm all information provided is accurate and agree to studio policies.',
                reason: 'Legal Consent Shield',
                required: true,
                helperText: 'Mandatory declaration before procedure commencement'
            });
        }

        // Fallbacks if form is empty or all top rules met
        if (recommendations.length === 0 || allFields.length === 0) {
            if (!hasName) {
                recommendations.push({
                    type: 'text',
                    icon: '📝',
                    label: 'Full Legal Name',
                    reason: 'Intake Essential',
                    required: true,
                    helperText: 'As shown on government ID'
                });
            }
            if (!hasDOB) {
                recommendations.push({
                    type: 'date',
                    icon: '📅',
                    label: 'Date of Birth',
                    reason: 'Intake Essential',
                    required: true,
                    helperText: 'Client date of birth'
                });
            }
            if (!hasSignature) {
                recommendations.push({
                    type: 'signature',
                    icon: '✍️',
                    label: 'Digital Client Signature',
                    reason: 'Consent Essential',
                    required: true,
                    helperText: 'Digital signature capture'
                });
            }
        }

        return recommendations.slice(0, 3);
    }

    renderRecommendedFields() {
        const container = document.getElementById('recommended-fields-container');
        const recSection = document.getElementById('recommended-fields-section');
        const toggle = document.getElementById('toggle-smart-suggest-palette');
        if (!container) return;

        const isEnabled = toggle ? toggle.checked : (localStorage.getItem('formBuilder_showSmartSuggest') !== 'false');
        if (recSection) {
            recSection.style.display = isEnabled ? 'block' : 'none';
        }
        if (!isEnabled) return;

        const recs = this.getRecommendedFields();
        container.innerHTML = '';

        if (recs.length === 0) {
            const allIncludedText = window.i18n ? window.i18n.t('palette.all_standard_included') : '✓ All recommended standard fields included!';
            container.innerHTML = `
                <div style="font-size:0.72rem; color:#94a3b8; text-align:center; padding:0.4rem 0;">
                    ${allIncludedText}
                </div>
            `;
            return;
        }

        const lang = window.i18n ? window.i18n.currentLanguage : 'en';
        const addBtnText = window.i18n ? window.i18n.t('palette.add_btn_plus') : '+ Add';

        recs.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'recommended-card';
            const translatedLabel = window.FormTranslator ? window.FormTranslator.translateText(rec.label, lang) : rec.label;
            const translatedReason = window.FormTranslator ? window.FormTranslator.translateText(rec.reason, lang) : rec.reason;
            const clickToAddTitle = window.i18n ? window.i18n.t('palette.click_to_add', { label: translatedLabel }) : `Click to add "${translatedLabel}" to current section`;
            const addThisTitle = window.i18n ? window.i18n.t('palette.add_this_field', { label: translatedLabel }) : 'Add this field';

            card.title = clickToAddTitle;
            card.innerHTML = `
                <div class="rec-card-top">
                    <div class="rec-card-label-wrap">
                        <span class="rec-card-icon">${rec.icon || '➕'}</span>
                        <span class="rec-card-label">${this.escapeHtml(translatedLabel)}</span>
                    </div>
                    <button type="button" class="rec-card-add-btn" title="${addThisTitle}">${addBtnText}</button>
                </div>
                <div class="rec-card-meta">
                    <span class="rec-card-reason">${this.escapeHtml(translatedReason || 'Recommended')}</span>
                    <span class="rec-card-type">${rec.type}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                this.addRecommendedField(rec);
            });

            container.appendChild(card);
        });
    }

    addRecommendedField(rec) {
        if (!this.currentForm) return;

        let targetSection = null;
        if (this.selectedSectionId) {
            targetSection = this.currentForm.sections.find(s => s.id === this.selectedSectionId);
        }
        if (!targetSection && this.currentForm.sections.length > 0) {
            targetSection = this.currentForm.sections[0];
            this.selectedSectionId = targetSection.id;
        }
        if (!targetSection) {
            this.addSection();
            targetSection = this.currentForm.sections[0];
        }

        const lang = window.i18n ? window.i18n.currentLanguage : 'en';
        const translatedLabel = window.FormTranslator ? window.FormTranslator.translateText(rec.label, lang) : rec.label;
        const translatedHelper = rec.helperText ? (window.FormTranslator ? window.FormTranslator.translateText(rec.helperText, lang) : rec.helperText) : '';
        const translatedPlaceholder = rec.placeholder ? (window.FormTranslator ? window.FormTranslator.translateText(rec.placeholder, lang) : rec.placeholder) : '';

        const newField = {
            id: `fld_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            type: rec.type,
            label: translatedLabel,
            required: !!rec.required,
            helperText: translatedHelper,
            placeholder: translatedPlaceholder,
            labelAlign: 'top'
        };

        if (rec.options && Array.isArray(rec.options)) {
            newField.options = [...rec.options];
        } else if (['select', 'radio', 'checkbox_group'].includes(rec.type)) {
            newField.options = ['Option 1', 'Option 2', 'Option 3'];
        }

        if (!Array.isArray(targetSection.fields)) targetSection.fields = [];
        targetSection.fields.push(newField);

        this.selectedFieldId = newField.id;
        this.selectedFieldIds.clear();
        this.selectedFieldIds.add(newField.id);

        this.recordState(`Add Recommended Field: ${rec.label}`);
        this.renderCanvas();
        this.selectField(newField.id);
        this.renderRecommendedFields();
        this.triggerAutoSave();
        this.showToast(`Added recommended field: "${rec.label}"`, 'success');
    }

    // ==========================================
    // BULK CSV IMPORT ENGINE
    // ==========================================

    initBulkCSVImport() {
        const modal = document.getElementById('bulk-csv-import-modal') || document.getElementById('bulk-csv-modal');
        if (!modal) return;

        const closeBtn = document.getElementById('btn-close-csv-modal');
        const cancelBtn = document.getElementById('btn-cancel-bulk-csv') || document.getElementById('btn-cancel-csv-import');
        const fileInput = document.getElementById('bulk-csv-file-input') || document.getElementById('csv-file-input');
        const dropzone = document.getElementById('csv-import-dropzone') || document.getElementById('csv-dropzone');
        const toggleRawBtn = document.getElementById('btn-toggle-raw-csv');
        const rawContainer = document.getElementById('raw-csv-paste-container') || document.getElementById('raw-csv-container');
        const rawTextarea = document.getElementById('raw-csv-textarea') || document.getElementById('csv-raw-textarea');
        const parseRawBtn = document.getElementById('btn-parse-pasted-csv') || document.getElementById('btn-parse-raw-csv');
        const downloadSampleBtn = document.getElementById('btn-download-sample-csv') || document.getElementById('btn-download-csv-sample');
        const executeBtn = document.getElementById('btn-execute-bulk-import') || document.getElementById('btn-execute-csv-import');

        this.parsedCSVFields = [];

        if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
        if (cancelBtn) cancelBtn.addEventListener('click', () => modal.style.display = 'none');

        if (downloadSampleBtn) {
            downloadSampleBtn.addEventListener('click', () => this.downloadCSVTemplate());
        }

        if (toggleRawBtn && rawContainer) {
            toggleRawBtn.addEventListener('click', () => {
                const isHidden = rawContainer.style.display === 'none';
                rawContainer.style.display = isHidden ? 'block' : 'none';
                toggleRawBtn.textContent = isHidden ? 'Hide Raw CSV' : '✍️ Paste Raw CSV';
            });
        }

        if (dropzone && fileInput) {
            dropzone.addEventListener('click', (e) => {
                fileInput.click();
            });

            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('dragover');
            });

            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('dragover');
            });

            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('dragover');
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    this.handleCSVFile(e.dataTransfer.files[0]);
                }
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    this.handleCSVFile(e.target.files[0]);
                    e.target.value = '';
                }
            });
        }

        if (parseRawBtn && rawTextarea) {
            parseRawBtn.addEventListener('click', () => {
                const text = rawTextarea.value.trim();
                if (!text) {
                    alert('Please paste CSV content into the box before clicking Parse.');
                    return;
                }
                const fields = this.parseCSV(text);
                this.parsedCSVFields = fields;
                this.renderCSVPreview(fields, 'Pasted Raw CSV Text');
            });
        }

        if (executeBtn) {
            executeBtn.addEventListener('click', () => {
                this.executeCSVImport();
            });
        }
    }

    openBulkCSVModal() {
        const modal = document.getElementById('bulk-csv-import-modal') || document.getElementById('bulk-csv-modal');
        if (!modal) return;

        this.resetCSVModalState();
        this.populateCSVTargetSectionSelect();
        modal.style.display = 'flex';
    }

    resetCSVModalState() {
        this.parsedCSVFields = [];
        const countBadge = document.getElementById('csv-parsed-count-badge');
        const filename = document.getElementById('csv-parse-filename');
        const emptyState = document.getElementById('csv-preview-empty-state');
        const table = document.getElementById('csv-preview-table');
        const tbody = document.getElementById('csv-preview-tbody');
        const executeBtn = document.getElementById('btn-execute-bulk-import') || document.getElementById('btn-execute-csv-import');
        const rawTextarea = document.getElementById('raw-csv-textarea') || document.getElementById('csv-raw-textarea');

        if (countBadge) countBadge.textContent = '0 Fields Ready';
        if (filename) filename.textContent = '';
        if (emptyState) emptyState.style.display = 'block';
        if (table) table.style.display = 'none';
        if (tbody) tbody.innerHTML = '';
        if (executeBtn) {
            executeBtn.disabled = true;
            executeBtn.textContent = 'Import 0 Fields into Form';
        }
        if (rawTextarea) rawTextarea.value = '';
    }

    populateCSVTargetSectionSelect() {
        const select = document.getElementById('csv-target-section-select');
        if (!select || !this.currentForm) return;

        select.innerHTML = '';

        if (Array.isArray(this.currentForm.sections)) {
            this.currentForm.sections.forEach((sec, idx) => {
                if (sec.type === 'medical_section') return;
                const opt = document.createElement('option');
                opt.value = sec.id;
                opt.textContent = `Append to: ${sec.title || `Section ${idx + 1}`} (${(sec.fields || []).length} fields)`;
                if (sec.id === this.selectedSectionId) {
                    opt.selected = true;
                }
                select.appendChild(opt);
            });
        }

        const newSecOpt = document.createElement('option');
        newSecOpt.value = 'new_section';
        newSecOpt.textContent = '➕ Create New Section ("Imported CSV Fields")';
        if (select.options.length === 0) newSecOpt.selected = true;
        select.appendChild(newSecOpt);
    }

    handleCSVFile(file) {
        if (!file) return;
        if (!file.name.endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
            alert('Please select a valid CSV (.csv) file.');
            return;
        }

        const fileInfo = document.getElementById('csv-file-info');
        const filename = document.getElementById('csv-filename');
        if (fileInfo) fileInfo.style.display = 'flex';
        if (filename) filename.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

        const reader = new FileReader();
        reader.onload = (e) => {
            const csvText = e.target.result;
            const fields = this.parseCSV(csvText);
            this.parsedCSVFields = fields;
            this.renderCSVPreview(fields, file.name);
        };
        reader.readAsText(file);
    }

    parseCSV(csvText) {
        if (!csvText || typeof csvText !== 'string') return [];

        // Parse rows taking quoted values and embedded newlines into account
        const rows = [];
        let currentRow = [];
        let currentCell = '';
        let insideQuotes = false;

        for (let i = 0; i < csvText.length; i++) {
            const char = csvText[i];
            const nextChar = csvText[i + 1];

            if (char === '"') {
                if (insideQuotes && nextChar === '"') {
                    currentCell += '"';
                    i++; // skip escaped quote
                } else {
                    insideQuotes = !insideQuotes;
                }
            } else if (char === ',' && !insideQuotes) {
                currentRow.push(currentCell.trim());
                currentCell = '';
            } else if ((char === '\r' || char === '\n') && !insideQuotes) {
                if (char === '\r' && nextChar === '\n') {
                    i++;
                }
                currentRow.push(currentCell.trim());
                if (currentRow.some(cell => cell.length > 0)) {
                    rows.push(currentRow);
                }
                currentRow = [];
                currentCell = '';
            } else {
                currentCell += char;
            }
        }

        if (currentCell.length > 0 || currentRow.length > 0) {
            currentRow.push(currentCell.trim());
            if (currentRow.some(cell => cell.length > 0)) {
                rows.push(currentRow);
            }
        }

        if (rows.length === 0) return [];

        // Extract header row
        const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, ''));
        const labelIdx = headers.findIndex(h => ['label', 'name', 'fieldname', 'field_name', 'title', 'question', 'header'].includes(h));
        const typeIdx = headers.findIndex(h => ['type', 'fieldtype', 'field_type', 'inputtype', 'input_type', 'kind'].includes(h));
        const reqIdx = headers.findIndex(h => ['required', 'mandatory', 'req', 'isrequired', 'is_required'].includes(h));
        const helperIdx = headers.findIndex(h => ['helpertext', 'helper_text', 'helper', 'help', 'helptext', 'help_text', 'subtext', 'description', 'desc'].includes(h));
        const optionsIdx = headers.findIndex(h => ['options', 'choices', 'values', 'selectoptions', 'items'].includes(h));
        const placeholderIdx = headers.findIndex(h => ['placeholder', 'hint'].includes(h));

        const supportedTypes = ['text', 'textarea', 'email', 'tel', 'date', 'number', 'checkbox', 'checkbox_group', 'radio', 'select', 'section_header', 'signature', 'container', 'header'];

        const normalizeType = (rawType) => {
            if (!rawType) return 'text';
            const t = rawType.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
            if (['text', 'string', 'shorttext', 'input'].includes(t)) return 'text';
            if (['textarea', 'longtext', 'paragraph', 'notes', 'multiline'].includes(t)) return 'textarea';
            if (['email', 'mail'].includes(t)) return 'email';
            if (['tel', 'phone', 'mobile', 'cell', 'telephone'].includes(t)) return 'tel';
            if (['date', 'datetime', 'dob', 'calendar', 'datepicker'].includes(t)) return 'date';
            if (['number', 'numeric', 'integer', 'int', 'qty', 'quantity', 'amount'].includes(t)) return 'number';
            if (['checkbox', 'boolean', 'bool', 'toggle', 'check'].includes(t)) return 'checkbox';
            if (['checkbox_group', 'checkboxgroup', 'multi', 'checklist', 'checkboxes'].includes(t)) return 'checkbox_group';
            if (['radio', 'radios', 'radiochoice', 'singlechoice'].includes(t)) return 'radio';
            if (['select', 'dropdown', 'choice', 'menu'].includes(t)) return 'select';
            if (['section_header', 'sectionheader', 'subheading', 'subhead'].includes(t)) return 'section_header';
            if (['signature', 'sign', 'signaturepad', 'digital_signature'].includes(t)) return 'signature';
            if (['container', 'panel', 'box', 'group'].includes(t)) return 'container';
            if (['header', 'notice', 'instruction', 'banner'].includes(t)) return 'header';
            return supportedTypes.includes(t) ? t : 'text';
        };

        const parsedFields = [];

        for (let r = 1; r < rows.length; r++) {
            const row = rows[r];
            if (!row || row.length === 0 || row.every(cell => !cell)) continue;

            const rawLabel = labelIdx !== -1 && row[labelIdx] ? row[labelIdx] : (row[0] || `Imported Field ${r}`);
            const rawType = typeIdx !== -1 && row[typeIdx] ? row[typeIdx] : (row[1] || 'text');
            const rawReq = reqIdx !== -1 && row[reqIdx] ? row[reqIdx] : (row[2] || '');
            const rawHelper = helperIdx !== -1 && row[helperIdx] ? row[helperIdx] : (row[3] || '');
            const rawOptions = optionsIdx !== -1 && row[optionsIdx] ? row[optionsIdx] : (row[4] || '');
            const rawPlaceholder = placeholderIdx !== -1 && row[placeholderIdx] ? row[placeholderIdx] : '';

            const finalType = normalizeType(rawType);
            const isReq = ['true', 'yes', '1', 'y', 'required'].includes(rawReq.toLowerCase().trim());

            let optionsList = [];
            if (['select', 'radio', 'checkbox_group'].includes(finalType)) {
                if (rawOptions) {
                    optionsList = rawOptions.split(/[;|]/).map(o => o.trim()).filter(Boolean);
                }
                if (optionsList.length === 0) {
                    optionsList = ['Option 1', 'Option 2', 'Option 3'];
                }
            }

            parsedFields.push({
                id: `csv_fld_${Date.now()}_${r}_${Math.random().toString(36).substr(2, 4)}`,
                label: rawLabel,
                type: finalType,
                required: isReq,
                helperText: rawHelper,
                placeholder: rawPlaceholder,
                options: optionsList.length > 0 ? optionsList : undefined,
                labelAlign: 'top'
            });
        }

        return parsedFields;
    }

    renderCSVPreview(fields, sourceName = '') {
        const countBadge = document.getElementById('csv-parsed-count-badge');
        const filename = document.getElementById('csv-parse-filename');
        const emptyState = document.getElementById('csv-preview-empty-state');
        const table = document.getElementById('csv-preview-table');
        const tbody = document.getElementById('csv-preview-tbody');
        const executeBtn = document.getElementById('btn-execute-bulk-import') || document.getElementById('btn-execute-csv-import');

        if (!tbody) return;

        if (!fields || fields.length === 0) {
            alert('No valid field rows found in the CSV. Please ensure your CSV has header columns (Field Name, Type, Required, Helper Text).');
            return;
        }

        if (countBadge) countBadge.textContent = `${fields.length} Fields Ready`;
        if (filename) filename.textContent = sourceName ? `Source: ${sourceName}` : '';
        if (emptyState) emptyState.style.display = 'none';
        if (table) table.style.display = 'table';
        tbody.innerHTML = '';

        fields.forEach((f, idx) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #f1f5f9';
            const optDesc = f.options ? f.options.join('; ') : '—';
            tr.innerHTML = `
                <td style="padding: 6px 10px; color:#94a3b8; font-weight:600;">${idx + 1}</td>
                <td style="padding: 6px 10px;"><strong>${this.escapeHtml(f.label)}</strong></td>
                <td style="padding: 6px 10px;"><span class="field-type-tag" style="background:#e0e7ff; color:#4338ca; padding:1px 6px; border-radius:4px; font-size:0.75rem; font-weight:600;">${f.type}</span></td>
                <td style="padding: 6px 10px;"><span class="${f.required ? 'badge-required' : ''}" style="font-size:0.75rem; color:${f.required ? '#dc2626' : '#64748b'}; font-weight:${f.required ? '700' : '400'};">${f.required ? 'Yes *' : 'No'}</span></td>
                <td style="padding: 6px 10px; color:#64748b; font-size:0.75rem; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${this.escapeHtml(f.helperText || '—')}</td>
                <td style="padding: 6px 10px; color:#64748b; font-size:0.75rem; max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${this.escapeHtml(optDesc)}</td>
            `;
            tbody.appendChild(tr);
        });

        if (executeBtn) {
            executeBtn.disabled = false;
            const tFunc = window.i18n ? (k, fb) => window.i18n.t(k, {}, fb) : (k, d) => d;
            const labelPattern = tFunc('bulk_csv.import_btn', 'Import {count} Fields into Form');
            executeBtn.textContent = labelPattern.replace('{count}', fields.length);
        }
    }

    executeCSVImport() {
        if (!this.parsedCSVFields || this.parsedCSVFields.length === 0) {
            alert('No fields to import.');
            return;
        }

        const targetSelect = document.getElementById('csv-target-section-select');
        const targetValue = targetSelect ? targetSelect.value : 'new_section';

        let targetSection = null;
        if (targetValue === 'new_section' || targetValue === '__new_section__' || !this.currentForm.sections || this.currentForm.sections.length === 0) {
            const newSection = {
                id: `sec_csv_${Date.now()}`,
                title: 'Imported CSV Fields',
                collapsed: false,
                hidden: false,
                fields: []
            };
            if (!Array.isArray(this.currentForm.sections)) this.currentForm.sections = [];
            this.currentForm.sections.push(newSection);
            targetSection = newSection;
            this.selectedSectionId = newSection.id;
        } else if (targetValue === 'current') {
            targetSection = this.currentForm.sections.find(s => s.id === this.selectedSectionId) || this.currentForm.sections[0];
            this.selectedSectionId = targetSection.id;
        } else {
            targetSection = this.currentForm.sections.find(s => s.id === targetValue);
            if (!targetSection) {
                targetSection = this.currentForm.sections[0];
            }
            this.selectedSectionId = targetSection.id;
        }

        if (!Array.isArray(targetSection.fields)) targetSection.fields = [];
        this.parsedCSVFields.forEach(f => {
            targetSection.fields.push(f);
        });

        this.recordState(`Bulk Import ${this.parsedCSVFields.length} Fields via CSV`);
        this.renderCanvas();
        this.renderRecommendedFields();
        this.triggerAutoSave();

        const modal = document.getElementById('bulk-csv-import-modal') || document.getElementById('bulk-csv-modal');
        if (modal) modal.style.display = 'none';

        this.showToast(`Successfully imported ${this.parsedCSVFields.length} fields into "${targetSection.title}"!`, 'success');
    }

    downloadCSVTemplate() {
        const sampleCsv = `Field Name,Type,Required,Helper Text,Options
Full Legal Name,text,true,As printed on government-issued photo identification,
Date of Birth,date,true,Must be 18+ or accompanied by legal guardian,
Email Address,email,true,Where your consultation summary and receipt will be sent,
Contact Telephone,tel,true,Best mobile number for appointment reminders,
Service Type,select,true,Select requested studio service,Custom Tattoo Design;Flash Tattoo;Body Piercing;Jewelry Consultation
Preferred Placement Area,textarea,false,Describe desired placement location on the body,
Do you have known allergies or medical conditions?,radio,true,Safety disclosure before procedure commencement,No known conditions;Yes - detailed in medical section
Emergency Contact Name & Phone,text,false,Designated contact in the event of an emergency,
Digital Client Signature,signature,true,Legally binding digital signature attestation,`;

        const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'form_fields_bulk_import_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.showToast('Downloaded sample CSV template', 'info');
    }

    initPaletteSearch() {
        const searchInput = document.getElementById('palette-search-input');
        const clearBtn = document.getElementById('btn-palette-search-clear');

        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const q = e.target.value;
            if (clearBtn) {
                clearBtn.style.display = q ? 'block' : 'none';
            }
            this.renderPalette(q);
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                clearBtn.style.display = 'none';
                this.renderPalette('');
                searchInput.focus();
            });
        }
    }

    initSortablePalette() {
        Sortable.create(this.dom.palette, {
            group: {
                name: 'form-builder-fields',
                pull: 'clone',
                put: false
            },
            sort: false,
            animation: 150,
            onClone: (evt) => {
                evt.clone.classList.add('field-clone');
            }
        });
    }

    // ==========================================
    // SECTION & GROUP COLLAPSE PERSISTENCE
    // ==========================================

    getPersistentCollapseStates() {
        try {
            const raw = localStorage.getItem('poli_section_group_collapse_states');
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    saveCollapseState(id, isCollapsed) {
        if (!id) return;
        try {
            const states = this.getPersistentCollapseStates();
            states[id] = !!isCollapsed;
            localStorage.setItem('poli_section_group_collapse_states', JSON.stringify(states));
        } catch (e) {
            console.warn('Could not save section group collapse state to localStorage:', e);
        }
    }

    applyPersistentCollapseStates(form) {
        if (!form || !Array.isArray(form.sections)) return;
        const states = this.getPersistentCollapseStates();
        form.sections.forEach(sec => {
            if (states[sec.id] !== undefined) {
                sec.collapsed = !!states[sec.id];
            }
            if (Array.isArray(sec.fields)) {
                sec.fields.forEach(f => {
                    if (f.type === 'container' || f.type === 'section_group') {
                        if (states[f.id] !== undefined) {
                            f.collapsed = !!states[f.id];
                        } else if (f.collapsed === undefined && f.defaultCollapsed) {
                            f.collapsed = true;
                        }
                    }
                });
            }
        });
    }

    // ==========================================
    // FORM & CANVAS RENDERING
    // ==========================================

    loadForm(formTemplate, initialAction = 'Load Form') {
        this.currentForm = JSON.parse(JSON.stringify(formTemplate));

        // Automatically translate template into currently selected language
        if (window.i18n && window.i18n.currentLanguage && window.FormTranslator) {
            window.FormTranslator.translateForm(this.currentForm, window.i18n.currentLanguage);
        }

        if (this.currentForm.theme) {
            this.applyTheme(this.currentForm.theme);
        }
        
        // Restore persistent expanded/collapsed state for Section Groups & Sections across sessions
        this.applyPersistentCollapseStates(this.currentForm);

        this.selectedFieldId = null;
        this.selectedSectionId = this.currentForm.sections?.[0]?.id || null;

        // Reset history on new template load
        this.history = [];
        this.historyIndex = -1;
        this.recordState(initialAction);

        this.renderCanvas();
        this.renderFormProperties();
    }

    renderCanvas() {
        if (!this.dom.canvas || !this.currentForm) return;
        this.dom.canvas.innerHTML = '';

        const t = (k, fb, p) => (window.i18n ? window.i18n.t(k, fb, p) : fb);

        // Multi-selection floating action banner
        if (this.selectedFieldIds && this.selectedFieldIds.size > 1) {
            const multiBar = document.createElement('div');
            multiBar.className = 'canvas-multi-action-bar';
            multiBar.innerHTML = `
                <div class="canvas-multi-action-bar-info">
                    <span class="palette-count-badge multi-badge">${this.selectedFieldIds.size}</span>
                    <span>${t('canvas.multi_fields_selected', 'Fields Selected (Shift+Click Block)', { count: this.selectedFieldIds.size })}</span>
                </div>
                <div class="canvas-multi-action-bar-buttons">
                    <button type="button" class="btn-secondary btn-sm" id="canvas-btn-multi-req" title="${t('canvas.toggle_required_title', 'Toggle required status for selected fields')}">★ ${t('canvas.toggle_required', 'Toggle Required')}</button>
                    <button type="button" class="btn-secondary btn-sm" id="canvas-btn-multi-hide" title="${t('canvas.toggle_hidden_title', 'Toggle hidden visibility for selected fields')}">🚫 ${t('canvas.toggle_hidden', 'Toggle Hidden')}</button>
                    <button type="button" class="btn-secondary btn-sm" id="canvas-btn-multi-dup" title="Duplicate selected fields block (Ctrl+D)">📋 ${t('canvas.duplicate_block', 'Duplicate Block')}</button>
                    <button type="button" class="btn-danger btn-sm" id="canvas-btn-multi-del" title="Delete selected fields (Delete)">🗑️ ${t('canvas.delete', 'Delete')} (${this.selectedFieldIds.size})</button>
                    <button type="button" class="btn-icon" id="canvas-btn-multi-close" title="Clear Selection (Esc)" style="color:white; font-size:1rem; padding:2px 6px;">✕</button>
                </div>
            `;

            multiBar.querySelector('#canvas-btn-multi-req')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMultipleFieldsRequired([...this.selectedFieldIds]);
            });

            multiBar.querySelector('#canvas-btn-multi-hide')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMultipleFieldsHidden([...this.selectedFieldIds]);
            });

            multiBar.querySelector('#canvas-btn-multi-dup')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.duplicateMultipleFields([...this.selectedFieldIds]);
            });

            multiBar.querySelector('#canvas-btn-multi-del')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteMultipleFields([...this.selectedFieldIds]);
            });

            multiBar.querySelector('#canvas-btn-multi-close')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deselectField();
            });

            this.dom.canvas.appendChild(multiBar);
        }

        // Form Title Card (Editable)
        const formHeader = document.createElement('div');
        formHeader.className = 'form-header-card';
        formHeader.innerHTML = `
            <div class="form-header-title-row">
                <input type="text" class="form-title-input" id="form-name-input" value="${this.escapeHtml(this.currentForm.name || 'Untitled Form')}" placeholder="Form Title...">
                <span class="form-category-badge">${this.escapeHtml(this.currentForm.category || 'Studio')}</span>
            </div>
            <textarea class="form-desc-input" id="form-desc-input" placeholder="Form description or client instructions (optional)...">${this.escapeHtml(this.currentForm.description || '')}</textarea>
        `;
        
        // Listeners for title/desc edits
        const titleInput = formHeader.querySelector('#form-name-input');
        titleInput.addEventListener('change', (e) => {
            this.currentForm.name = e.target.value;
            this.recordState('Change Form Title');
        });

        const descInput = formHeader.querySelector('#form-desc-input');
        descInput.addEventListener('change', (e) => {
            this.currentForm.description = e.target.value;
            this.recordState('Change Form Description');
        });

        formHeader.addEventListener('click', (e) => {
            if (e.target !== titleInput && e.target !== descInput) {
                this.deselectField();
            }
        });

        this.dom.canvas.appendChild(formHeader);

        // Convert selectedFieldIds to Array for index ordering
        const selectedIdsArr = this.selectedFieldIds ? [...this.selectedFieldIds] : [];
        const isMultiActive = selectedIdsArr.length > 1;

        // Canvas Section Bulk Controls (Expand/Collapse All)
        if (this.currentForm.sections && this.currentForm.sections.length > 0) {
            const bulkControlsEl = document.createElement('div');
            bulkControlsEl.className = 'canvas-section-bulk-controls';
            const expandAllText = t('section.expand_all', 'Expand All');
            const collapseAllText = t('section.collapse_all', 'Collapse All');
            const sectionsCountText = this.currentForm.sections.length + ' ' + (this.currentForm.sections.length === 1 ? 'section' : 'sections');

            bulkControlsEl.innerHTML = '<span style="font-weight: 700; color: #475569; font-size: 0.78rem; display: flex; align-items: center; gap: 4px;">📑 Sections:</span><button type="button" class="btn-canvas-section-toggle" onclick="window.FormBuilderApp.expandAllSections()" title="Expand all sections on canvas">▼ ' + expandAllText + '</button><button type="button" class="btn-canvas-section-toggle" onclick="window.FormBuilderApp.collapseAllSections()" title="Collapse all sections on canvas">▶ ' + collapseAllText + '</button><span style="margin-left: auto; font-size: 0.74rem; color: #94a3b8;">' + sectionsCountText + '</span>';
            this.dom.canvas.appendChild(bulkControlsEl);
        }

        // Render Sections
        if (this.currentForm.sections && this.currentForm.sections.length > 0) {
            const sectionGroupingTooltip = t('section.grouping_tooltip', 'Section Container: Groups related consultation fields together. Drag to reorder, collapse for compact view, or hide to toggle section visibility in the client preview.');
            const sectionDragTooltip = t('section.drag_tooltip', 'Drag handle: Reorder this entire section on the canvas');
            const sectionCollapseTooltip = t('section.collapse_tooltip', 'Toggle collapse: Collapse or expand this section');
            const sectionHideTooltip = t('section.hide_tooltip', 'Toggle visibility: Show or hide this section in client preview');
            const sectionShowTooltip = t('section.show_tooltip', 'Show this section in client preview');
            const sectionDuplicateTooltip = t('section.duplicate_tooltip', 'Duplicate section and all contained fields (clone entire group)');
            const sectionDeleteTooltip = t('section.delete_tooltip', 'Delete section and all contained fields');
            const duplicateText = t('canvas.duplicate', 'Duplicate');

            this.currentForm.sections.forEach((section, sIdx) => {
                const isMedical = section.type === 'medical_section';
                const isCollapsed = !!section.collapsed;
                const isHidden = !!section.hidden;

                const secEl = document.createElement('div');
                secEl.className = `form-section-preview ${this.selectedSectionId === section.id ? 'active-section' : ''} ${isCollapsed ? 'is-collapsed' : ''} ${isHidden ? 'is-hidden-section' : ''}`;
                secEl.dataset.sectionId = section.id;
                secEl.setAttribute('title', sectionGroupingTooltip);
                secEl.setAttribute('data-section-tooltip', sectionGroupingTooltip);

                const fieldCount = section.fields ? section.fields.length : (isMedical ? 'Auto (7)' : 0);

                secEl.innerHTML = `
                    <div class="section-header-bar" onclick="window.FormBuilderApp.selectSection('${section.id}')" title="${sectionGroupingTooltip}">
                        <div class="section-title-wrap">
                            <button type="button" class="btn-toggle-collapse" title="${sectionCollapseTooltip}" onclick="event.stopPropagation(); window.FormBuilderApp.toggleSectionCollapse('${section.id}')">
                                ${isCollapsed ? '▶' : '▼'}
                            </button>
                            <span class="section-drag-handle" title="${sectionDragTooltip}">⠿</span>
                            <span class="section-group-icon-badge" title="${sectionGroupingTooltip}">📦</span>
                            <input type="text" class="section-title-input" value="${this.escapeHtml(section.title)}" placeholder="Section Title..." ${isMedical ? 'readonly' : ''} onclick="event.stopPropagation(); window.FormBuilderApp.selectSection('${section.id}')">
                            ${isMedical ? '<span class="medical-badge" title="Auto-injected medical safety check module">⚕️ Medical Safety Module</span>' : ''}
                            ${isHidden ? '<span class="badge-hidden-section" title="This section is currently hidden from client preview">🚫 Hidden</span>' : ''}
                            <span class="section-field-counter" title="${fieldCount} fields contained in this section">${fieldCount} fields</span>
                            ${isCollapsed ? ('<span class="section-collapsed-summary" onclick="event.stopPropagation(); window.FormBuilderApp.toggleSectionCollapse(\'' + section.id + '\')">📦 ' + (window.i18n ? window.i18n.t('section.collapsed_summary', { count: fieldCount }) : (fieldCount + ' fields collapsed (Click to expand)')) + '</span>') : ''}
                        </div>
                        <div class="section-actions" onclick="event.stopPropagation()">
                            <button type="button" class="btn-sec-action ${isHidden ? 'btn-sec-active' : ''}" onclick="window.FormBuilderApp.toggleSectionVisibility('${section.id}')" title="${isHidden ? sectionShowTooltip : sectionHideTooltip}">
                                ${isHidden ? '👁️ Show' : '👁️ Hide'}
                            </button>
                            ${!isMedical ? `
                                <button type="button" class="btn-sec-action" onclick="window.FormBuilderApp.duplicateSection('${section.id}')" title="${sectionDuplicateTooltip}">📋 ${duplicateText}</button>
                                <button type="button" class="btn-sec-action" onclick="window.FormBuilderApp.moveSection(${sIdx}, -1)" title="Move section up" ${sIdx === 0 ? 'disabled' : ''}>⬆️</button>
                                <button type="button" class="btn-sec-action" onclick="window.FormBuilderApp.moveSection(${sIdx}, 1)" title="Move section down" ${sIdx === this.currentForm.sections.length - 1 ? 'disabled' : ''}>⬇️</button>
                                <button type="button" class="btn-sec-action btn-danger" onclick="window.FormBuilderApp.deleteSection('${section.id}')" title="${sectionDeleteTooltip}">🗑️</button>
                            ` : ''}
                        </div>
                    </div>
                `;

                // Title inline edit
                const secTitleInput = secEl.querySelector('.section-title-input');
                if (secTitleInput && !isMedical) {
                    secTitleInput.addEventListener('change', (e) => {
                        section.title = e.target.value;
                        this.recordState('Rename Section');
                    });
                }

                // Section Fields Container
                const fieldList = document.createElement('div');
                fieldList.className = `section-fields-container ${isCollapsed ? 'fields-collapsed' : ''}`;
                fieldList.dataset.sectionId = section.id;

                if (isMedical) {
                    const medTitle = t('medical.standard_module_title', '⚕️ Standardized Medical Questions Module');
                    const medDesc = t('medical.standard_module_desc', 'Allergies, Blood Thinners, Chronic Conditions, Pregnancy, and Alcohol/Food check are dynamically validated and rendered here.');
                    fieldList.innerHTML = `
                        <div class="medical-module-notice">
                            <strong>${this.escapeHtml(medTitle)}</strong>
                            <p>${this.escapeHtml(medDesc)}</p>
                        </div>
                    `;
                } else {
                    if (section.fields && section.fields.length > 0) {
                        section.fields.forEach((field) => {
                            const isSingleSelected = this.selectedFieldId === field.id && !isMultiActive;
                            const isMultiSelected = isMultiActive && this.selectedFieldIds.has(field.id);
                            const multiIdx = isMultiSelected ? selectedIdsArr.indexOf(field.id) + 1 : 0;

                            // Handle Container or Section Group Field Type
                            if (field.type === 'container' || field.type === 'section_group') {
                                const containerEl = document.createElement('div');
                                containerEl.className = `canvas-field-card canvas-container-field ${isSingleSelected ? 'selected' : ''} ${isMultiSelected ? 'multi-selected' : ''} container-style-${field.containerStyle || 'bordered'}`;
                                containerEl.dataset.fieldId = field.id;
                                containerEl.dataset.fieldType = field.type;

                                const childCount = field.fields ? field.fields.length : 0;
                                const isGroup = field.type === 'section_group';
                                const defaultGroupLabel = isGroup ? t('canvas.section_group', 'Section Group') : t('canvas.grouped_panel', 'Grouped Panel');
                                const questionsCountText = t('canvas.questions_count', { count: childCount }, `${childCount} questions`);
                                const addQText = t('canvas.add_question', '+ Add Question');
                                const dragGroupTooltip = t('canvas.drag_reorder_group', 'Drag to reorder group');
                                const dupGroupTooltip = t('canvas.duplicate_group', 'Duplicate Group');
                                const delGroupTooltip = t('canvas.delete_group', 'Delete Group');

                                containerEl.innerHTML = `
                                    <div class="container-header-bar" onclick="event.stopPropagation(); window.FormBuilderApp.selectField('${field.id}', false, event.shiftKey)">
                                        <div class="container-header-title-wrap">
                                            <span class="field-drag-handle" title="${this.escapeHtml(dragGroupTooltip)}">⠿</span>
                                            ${isMultiSelected ? `<span class="multi-select-badge" title="${this.escapeHtml(t('canvas.selected_multi_block', 'Selected in multi-block'))}">${multiIdx}</span>` : ''}
                                            <span class="container-badge-icon">${isGroup ? '📦' : '🗂️'}</span>
                                            <strong class="container-name">${this.escapeHtml(field.label || defaultGroupLabel)}</strong>
                                            <span class="container-child-count">${this.escapeHtml(questionsCountText)}</span>
                                            ${field.alias ? `<span class="badge-alias" title="CRM Mapping: ${this.escapeHtml(field.alias)}">${this.escapeHtml(field.alias)}</span>` : ''}
                                        </div>
                                        <div class="field-actions" onclick="event.stopPropagation()">
                                            <button type="button" class="btn-field-action" onclick="window.FormBuilderApp.addField('text', '${section.id}', '${field.id}')" title="${this.escapeHtml(t('canvas.add_question_into_group', 'Add question into this group'))}">${this.escapeHtml(addQText)}</button>
                                            <button type="button" class="btn-field-action" onclick="window.FormBuilderApp.duplicateField('${field.id}')" title="${this.escapeHtml(dupGroupTooltip)}">📋</button>
                                            <button type="button" class="btn-field-action btn-field-delete" onclick="window.FormBuilderApp.deleteField('${field.id}')" title="${this.escapeHtml(delGroupTooltip)}">🗑️</button>
                                        </div>
                                    </div>
                                    ${field.helperText || field.helpText ? `<div class="container-help-text">${this.escapeHtml(field.helperText || field.helpText)}</div>` : ''}
                                    <div class="container-fields-dropzone" data-container-id="${field.id}" data-section-id="${section.id}"></div>
                                `;

                                const dropzone = containerEl.querySelector('.container-fields-dropzone');
                                if (field.fields && field.fields.length > 0) {
                                    field.fields.forEach((childField) => {
                                        const isChildSingle = this.selectedFieldId === childField.id && !isMultiActive;
                                        const isChildMulti = isMultiActive && this.selectedFieldIds.has(childField.id);
                                        const childMultiIdx = isChildMulti ? selectedIdsArr.indexOf(childField.id) + 1 : 0;

                                        const childEl = document.createElement('div');
                                        childEl.className = `canvas-field-card ${isChildSingle ? 'selected' : ''} ${isChildMulti ? 'multi-selected' : ''} ${childField.hidden ? 'is-field-hidden' : ''}`;
                                        childEl.dataset.fieldId = childField.id;
                                        childEl.dataset.fieldType = childField.type;
                                        childEl.dataset.parentContainerId = field.id;

                                        childEl.innerHTML = `
                                            <div class="field-card-content" onclick="event.stopPropagation(); window.FormBuilderApp.selectField('${childField.id}', false, event.shiftKey)">
                                                <div class="field-card-main">
                                                    <span class="field-drag-handle" title="${this.escapeHtml(t('canvas.drag_to_reorder', 'Drag to reorder'))}">⠿</span>
                                                    ${isChildMulti ? `<span class="multi-select-badge">${childMultiIdx}</span>` : ''}
                                                    <span class="field-type-icon">${this.getFieldTypeIcon(childField.type)}</span>
                                                    <span class="field-type-tag">${childField.type}</span>
                                                    <span class="field-label-text">${this.escapeHtml(childField.label || t('canvas.untitled_field', 'Untitled Field'))}</span>
                                                    ${childField.required ? `<span class="required-asterisk" title="${this.escapeHtml(t('canvas.required_field', 'Required field'))}">*</span>` : ''}
                                                    ${childField.hidden ? `<span class="badge-hidden-field" title="${this.escapeHtml(t('canvas.hidden_from_client', 'Hidden from client intake'))}">${this.escapeHtml(t('canvas.badge_hidden', '🚫 Hidden'))}</span>` : ''}
                                                    ${childField.conditional ? `<span class="conditional-indicator" title="${this.escapeHtml(t('canvas.conditional_logic_enabled', 'Conditional logic enabled'))}">🔀</span>` : ''}
                                                    ${childField.alias ? `<span class="badge-alias">${this.escapeHtml(childField.alias)}</span>` : ''}
                                                </div>
                                                <div class="field-actions" onclick="event.stopPropagation()">
                                                    <button type="button" class="btn-field-action" onclick="window.FormBuilderApp.duplicateField('${childField.id}')" title="${this.escapeHtml(t('canvas.duplicate', 'Duplicate'))}">📋</button>
                                                    <button type="button" class="btn-field-action btn-field-delete" onclick="window.FormBuilderApp.deleteField('${childField.id}')" title="${this.escapeHtml(t('canvas.delete', 'Delete'))}">🗑️</button>
                                                </div>
                                            </div>
                                        `;
                                        dropzone.appendChild(childEl);
                                    });
                                }

                                fieldList.appendChild(containerEl);
                            } else if (field.type === 'section_header') {
                                const headerEl = document.createElement('div');
                                headerEl.className = `canvas-field-card canvas-section-header-field ${isSingleSelected ? 'selected' : ''} ${isMultiSelected ? 'multi-selected' : ''} ${field.hidden ? 'is-field-hidden' : ''}`;
                                headerEl.dataset.fieldId = field.id;
                                headerEl.dataset.fieldType = field.type;

                                headerEl.innerHTML = `
                                    <div class="field-card-content" onclick="event.stopPropagation(); window.FormBuilderApp.selectField('${field.id}', false, event.shiftKey)">
                                        <div class="field-card-main">
                                            <span class="field-drag-handle" title="${this.escapeHtml(t('canvas.drag_to_reorder_header', 'Drag to reorder header'))}">⠿</span>
                                            ${isMultiSelected ? `<span class="multi-select-badge">${multiIdx}</span>` : ''}
                                            <span class="field-type-icon">📑</span>
                                            <span class="field-type-tag">${this.escapeHtml(t('canvas.header_tag', 'Header'))}</span>
                                            <strong class="canvas-section-header-title">${this.escapeHtml(field.label || t('canvas.section_header', 'Section Header'))}</strong>
                                            ${field.hidden ? `<span class="badge-hidden-field" title="${this.escapeHtml(t('canvas.hidden_from_client', 'Hidden from client intake'))}">${this.escapeHtml(t('canvas.badge_hidden', '🚫 Hidden'))}</span>` : ''}
                                            ${field.collapsible ? `<span class="badge-collapsible-pill">${this.escapeHtml(t('canvas.collapsible_badge', '📂 Collapsible'))}</span>` : ''}
                                            ${field.alias ? `<span class="badge-alias">${this.escapeHtml(field.alias)}</span>` : ''}
                                        </div>
                                        <div class="field-actions" onclick="event.stopPropagation()">
                                            <button type="button" class="btn-field-action" onclick="window.FormBuilderApp.duplicateField('${field.id}')" title="${this.escapeHtml(t('canvas.duplicate', 'Duplicate'))}">📋</button>
                                            <button type="button" class="btn-field-action btn-field-delete" onclick="window.FormBuilderApp.deleteField('${field.id}')" title="${this.escapeHtml(t('canvas.delete', 'Delete'))}">🗑️</button>
                                        </div>
                                    </div>
                                    ${field.helpText ? `<div class="section-header-desc-preview">${this.escapeHtml(field.helpText)}</div>` : ''}
                                `;

                                fieldList.appendChild(headerEl);
                            } else {
                                const fieldEl = document.createElement('div');
                                fieldEl.className = `canvas-field-card ${isSingleSelected ? 'selected' : ''} ${isMultiSelected ? 'multi-selected' : ''} ${field.hidden ? 'is-field-hidden' : ''}`;
                                fieldEl.dataset.fieldId = field.id;
                                fieldEl.dataset.fieldType = field.type;

                                fieldEl.innerHTML = `
                                    <div class="field-card-content" onclick="event.stopPropagation(); window.FormBuilderApp.selectField('${field.id}', false, event.shiftKey)">
                                        <div class="field-card-main">
                                            <span class="field-drag-handle" title="${this.escapeHtml(t('canvas.drag_to_reorder_field', 'Drag to reorder field'))}">⠿</span>
                                            ${isMultiSelected ? `<span class="multi-select-badge">${multiIdx}</span>` : ''}
                                            <span class="field-type-icon">${this.getFieldTypeIcon(field.type)}</span>
                                            <span class="field-type-tag">${field.type}</span>
                                            <span class="field-label-text">${this.escapeHtml(field.label || t('canvas.untitled_field', 'Untitled Field'))}</span>
                                            ${field.required ? `<span class="required-asterisk" title="${this.escapeHtml(t('canvas.required_field', 'Required field'))}">*</span>` : ''}
                                            ${field.hidden ? `<span class="badge-hidden-field" title="${this.escapeHtml(t('canvas.hidden_from_client', 'Hidden from client intake'))}">${this.escapeHtml(t('canvas.badge_hidden', '🚫 Hidden'))}</span>` : ''}
                                            ${field.conditional ? `<span class="conditional-indicator" title="${this.escapeHtml(t('canvas.conditional_logic_enabled', 'Conditional logic enabled'))}">🔀</span>` : ''}
                                            ${field.alias ? `<span class="badge-alias">${this.escapeHtml(field.alias)}</span>` : ''}
                                        </div>
                                        <div class="field-actions" onclick="event.stopPropagation()">
                                            <button type="button" class="btn-field-action" onclick="window.FormBuilderApp.duplicateField('${field.id}')" title="${this.escapeHtml(t('canvas.duplicate', 'Duplicate'))}">📋</button>
                                            <button type="button" class="btn-field-action btn-field-delete" onclick="window.FormBuilderApp.deleteField('${field.id}')" title="${this.escapeHtml(t('canvas.delete', 'Delete'))}">🗑️</button>
                                        </div>
                                    </div>
                                `;

                                fieldList.appendChild(fieldEl);
                            }
                        });
                    }
                }

                // Add Field Button at bottom of section
                if (!isMedical) {
                    const addFieldBtn = document.createElement('div');
                    addFieldBtn.className = 'section-add-field-row';
                    addFieldBtn.innerHTML = `
                        <button type="button" class="btn-add-section-field" onclick="window.FormBuilderApp.addField('text', '${section.id}')">
                            + ${t('canvas.add_question_btn', 'Add Question to Section')}
                        </button>
                    `;
                    fieldList.appendChild(addFieldBtn);
                }

                secEl.appendChild(fieldList);
                this.dom.canvas.appendChild(secEl);
            });
        }

        // Add Section button at bottom of canvas
        const addSecBtnWrap = document.createElement('div');
        addSecBtnWrap.className = 'canvas-add-section-wrap';
        addSecBtnWrap.innerHTML = `
            <button type="button" class="btn-add-new-section" onclick="window.FormBuilderApp.addSection()">
                ➕ ${t('canvas.add_new_section', 'Add New Section')}
            </button>
        `;
        this.dom.canvas.appendChild(addSecBtnWrap);

        // Initialize Sortables for canvas
        this.initCanvasSortables();

        // Update properties panel based on current selection
        if (this.selectedFieldId) {
            const found = this.findFieldAndSection(this.selectedFieldId);
            if (found) {
                this.renderFieldProperties(found.field, found.section, found.parentContainer);
            } else {
                this.selectedFieldId = null;
                this.renderFormProperties();
            }
        } else if (this.selectedSectionId) {
            const sec = this.currentForm.sections?.find(s => s.id === this.selectedSectionId);
            if (sec) {
                this.renderSectionProperties(sec);
            } else {
                this.selectedSectionId = null;
                this.renderFormProperties();
            }
        } else {
            this.renderFormProperties();
        }

        this.updateCanvasFieldCount();
        this.updateCanvasValidationStatus();
    }

    initCanvasSortables() {
        if (!window.Sortable) return;

        // 1. Sortable for sections
        Sortable.create(this.dom.canvas, {
            animation: 150,
            handle: '.section-drag-handle',
            draggable: '.form-section-preview',
            ghostClass: 'sortable-ghost',
            onEnd: (evt) => {
                const { oldIndex, newIndex } = evt;
                const secElements = [...this.dom.canvas.querySelectorAll('.form-section-preview')];
                const newSections = [];
                secElements.forEach(el => {
                    const sId = el.dataset.sectionId;
                    const sec = this.currentForm.sections.find(s => s.id === sId);
                    if (sec) newSections.push(sec);
                });
                if (newSections.length === this.currentForm.sections.length) {
                    this.currentForm.sections = newSections;
                    this.recordState('Reorder Sections');
                    this.renderCanvas();
                }
            }
        });

        // 2. Sortable for section fields
        const fieldContainers = this.dom.canvas.querySelectorAll('.section-fields-container');
        fieldContainers.forEach(container => {
            Sortable.create(container, {
                group: 'canvas-fields',
                animation: 150,
                handle: '.field-drag-handle',
                draggable: '.canvas-field-card',
                ghostClass: 'sortable-ghost',
                onEnd: (evt) => {
                    this.syncCanvasFieldOrder();
                }
            });
        });

        // 3. Sortable for container dropzones
        const dropzones = this.dom.canvas.querySelectorAll('.container-fields-dropzone');
        dropzones.forEach(dz => {
            Sortable.create(dz, {
                group: 'canvas-fields',
                animation: 150,
                handle: '.field-drag-handle',
                draggable: '.canvas-field-card',
                ghostClass: 'sortable-ghost',
                onEnd: (evt) => {
                    this.syncCanvasFieldOrder();
                }
            });
        });
    }

    syncCanvasFieldOrder() {
        this.currentForm.sections.forEach(section => {
            if (section.type === 'medical_section') return;
            const secContainer = this.dom.canvas.querySelector(`.section-fields-container[data-section-id="${section.id}"]`);
            if (!secContainer) return;

            const newFields = [];
            const directCards = [...secContainer.children].filter(c => c.classList.contains('canvas-field-card'));
            directCards.forEach(card => {
                const fId = card.dataset.fieldId;
                const field = this.findFieldById(fId);
                if (field) {
                    if (field.type === 'container' || field.type === 'section_group') {
                        const dz = card.querySelector('.container-fields-dropzone');
                        if (dz) {
                            const childCards = [...dz.children].filter(cc => cc.classList.contains('canvas-field-card'));
                            const childFields = [];
                            childCards.forEach(cc => {
                                const cfId = cc.dataset.fieldId;
                                const cField = this.findFieldById(cfId);
                                if (cField) childFields.push(cField);
                            });
                            field.fields = childFields;
                        }
                    }
                    newFields.push(field);
                }
            });
            section.fields = newFields;
        });

        this.recordState('Reorder Fields');
        this.renderCanvas();
    }

    findFieldById(fieldId) {
        if (!this.currentForm?.sections) return null;
        for (const sec of this.currentForm.sections) {
            if (sec.fields) {
                for (const f of sec.fields) {
                    if (f.id === fieldId) return f;
                    if (f.type === 'container' && Array.isArray(f.fields)) {
                        for (const cf of f.fields) {
                            if (cf.id === fieldId) return cf;
                        }
                    }
                }
            }
        }
        return null;
    }

    findFieldAndSection(fieldId) {
        if (!this.currentForm?.sections) return null;
        for (const sec of this.currentForm.sections) {
            if (sec.fields) {
                for (const f of sec.fields) {
                    if (f.id === fieldId) {
                        return { field: f, section: sec, parentContainer: null };
                    }
                    if (f.type === 'container' && Array.isArray(f.fields)) {
                        for (const cf of f.fields) {
                            if (cf.id === fieldId) {
                                return { field: cf, section: sec, parentContainer: f };
                            }
                        }
                    }
                }
            }
        }
        return null;
    }

    getFieldTypeIcon(type) {
        const icons = {
            text: '📝',
            email: '📧',
            tel: '📱',
            date: '📅',
            number: '🔢',
            textarea: '📄',
            checkbox: '☑️',
            checkbox_group: '☑️☑️',
            radio: '🔘',
            select: '📋',
            section_header: '📑',
            container: '🗂️',
            section_group: '📦',
            header: '📌',
            signature: '✍️',
            body_map: '🗺️',
            photo_id: '🪪'
        };
        return icons[type] || '📝';
    }

    selectField(fieldId, isMulti = false, isShift = false) {
        if (isShift) {
            if (this.selectedFieldIds.has(fieldId)) {
                this.selectedFieldIds.delete(fieldId);
            } else {
                this.selectedFieldIds.add(fieldId);
            }
            if (this.selectedFieldIds.size === 1) {
                this.selectedFieldId = [...this.selectedFieldIds][0];
                this.selectedSectionId = null;
                const found = this.findFieldAndSection(this.selectedFieldId);
                if (found) {
                    this.renderFieldProperties(found.field, found.section, found.parentContainer);
                }
            } else if (this.selectedFieldIds.size > 1) {
                this.selectedFieldId = null;
                this.selectedSectionId = null;
                this.renderMultiFieldProperties([...this.selectedFieldIds]);
            } else {
                this.deselectField();
                return;
            }
            this.renderCanvas();
            return;
        }

        this.selectedFieldIds.clear();
        this.selectedFieldId = fieldId;
        this.selectedSectionId = null;

        const found = this.findFieldAndSection(fieldId);
        if (found) {
            this.renderFieldProperties(found.field, found.section, found.parentContainer);
            this.dom.canvas.querySelectorAll('.canvas-field-card').forEach(el => {
                if (el.dataset.fieldId === fieldId) {
                    el.classList.add('selected');
                } else {
                    el.classList.remove('selected');
                }
            });
            this.dom.canvas.querySelectorAll('.form-section-preview').forEach(el => el.classList.remove('active-section'));
            if (window.innerWidth <= 860 && typeof window.switchMobileBuilderTab === 'function') {
                window.switchMobileBuilderTab('right-panel');
            }
        }
    }

    deselectField() {
        this.selectedFieldId = null;
        this.selectedSectionId = null;
        this.selectedFieldIds.clear();
        this.dom.canvas?.querySelectorAll('.canvas-field-card').forEach(el => el.classList.remove('selected', 'multi-selected'));
        this.dom.canvas?.querySelectorAll('.form-section-preview').forEach(el => el.classList.remove('active-section'));
        this.renderFormProperties();
    }

    selectSection(sectionId) {
        this.selectedSectionId = sectionId;
        this.selectedFieldId = null;
        this.selectedFieldIds.clear();

        const sec = this.currentForm.sections?.find(s => s.id === sectionId);
        if (sec) {
            this.renderSectionProperties(sec);
            this.dom.canvas.querySelectorAll('.form-section-preview').forEach(el => {
                if (el.dataset.sectionId === sectionId) {
                    el.classList.add('active-section');
                } else {
                    el.classList.remove('active-section');
                }
            });
            this.dom.canvas.querySelectorAll('.canvas-field-card').forEach(el => el.classList.remove('selected', 'multi-selected'));
        }
    }

    addField(type, sectionId = null, parentContainerId = null, targetFieldId = null) {
        const uniqueId = 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        const t = (k, fb) => (window.i18n ? window.i18n.t(k, fb) : fb);

        const newField = {
            id: uniqueId,
            type: type,
            label: t('palette.field_labels.' + type, (type.charAt(0).toUpperCase() + type.slice(1)).replace(/_/g, ' ') + ' Question'),
            required: false
        };

        if (['select', 'radio', 'checkbox_group'].includes(type)) {
            newField.options = [
                t('properties.default_opt_1', 'Option 1'),
                t('properties.default_opt_2', 'Option 2'),
                t('properties.default_opt_3', 'Option 3')
            ];
        }

        if (type === 'container' || type === 'section_group') {
            newField.fields = [];
            newField.collapsible = true;
            newField.containerStyle = 'bordered';
            newField.label = type === 'section_group' ? 'Section Group Block' : 'Grouped Intake Panel';
        }

        if (type === 'section_header') {
            newField.collapsible = false;
            newField.helpText = '';
            newField.label = 'Section Header';
        }

        if (type === 'textarea') {
            newField.rows = 3;
        }

        if (type === 'body_map') {
            newField.label = 'Anatomical Placement & Mapping';
            newField.defaultView = 'body_front';
            newField.allowDraw = true;
            newField.allowPins = true;
            newField.helperText = 'Mark placement locations, piercings, or tattoo dimensions on the anatomical diagram';
        }

        if (type === 'photo_id') {
            newField.label = 'Client Photo ID & Reference Art';
            newField.photoCategory = 'id';
            newField.maxFiles = 3;
            newField.helperText = 'Upload government-issued identification or reference art photos';
        }

        let targetSec = null;
        if (sectionId) {
            targetSec = this.currentForm.sections?.find(s => s.id === sectionId);
        }
        if (!targetSec && this.selectedSectionId) {
            targetSec = this.currentForm.sections?.find(s => s.id === this.selectedSectionId);
        }
        if (!targetSec && this.currentForm.sections?.length > 0) {
            targetSec = this.currentForm.sections[0];
        }

        if (!targetSec) {
            targetSec = { id: 'sec_' + Date.now(), title: 'General Information', fields: [] };
            this.currentForm.sections = [targetSec];
        }

        if (!targetSec.fields) targetSec.fields = [];

        if (parentContainerId) {
            const container = targetSec.fields.find(f => f.id === parentContainerId);
            if (container) {
                if (!container.fields) container.fields = [];
                container.fields.push(newField);
            } else {
                targetSec.fields.push(newField);
            }
        } else if (targetFieldId) {
            const fIdx = targetSec.fields.findIndex(f => f.id === targetFieldId);
            if (fIdx !== -1) {
                targetSec.fields.splice(fIdx + 1, 0, newField);
            } else {
                targetSec.fields.push(newField);
            }
        } else {
            targetSec.fields.push(newField);
        }

        this.recordState('Add ' + type + ' Field');
        this.renderCanvas();
        this.selectField(newField.id);
    }

    duplicateField(fieldId) {
        const found = this.findFieldAndSection(fieldId);
        if (!found) return;

        const { field, section, parentContainer } = found;
        const clone = JSON.parse(JSON.stringify(field));
        clone.id = 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        clone.label = (clone.label || 'Untitled') + ' (Copy)';

        if (clone.type === 'container' && Array.isArray(clone.fields)) {
            clone.fields.forEach(cf => {
                cf.id = 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            });
        }

        if (parentContainer && Array.isArray(parentContainer.fields)) {
            const idx = parentContainer.fields.findIndex(f => f.id === fieldId);
            parentContainer.fields.splice(idx + 1, 0, clone);
        } else if (section && Array.isArray(section.fields)) {
            const idx = section.fields.findIndex(f => f.id === fieldId);
            section.fields.splice(idx + 1, 0, clone);
        }

        this.recordState('Duplicate Field');
        this.renderCanvas();
        this.selectField(clone.id);
    }

    duplicateMultipleFields(fieldIds) {
        if (!Array.isArray(fieldIds) || fieldIds.length === 0) return;
        fieldIds.forEach(id => {
            this.duplicateField(id);
        });
        this.recordState('Duplicate Multiple Fields');
        this.renderCanvas();
    }

    toggleMultipleFieldsRequired(fieldIds) {
        if (!Array.isArray(fieldIds) || fieldIds.length === 0) return;
        const t = (k, fb, p) => (window.i18n ? window.i18n.t(k, fb, p) : fb);
        
        const fields = fieldIds.map(id => this.findFieldAndSection(id)?.field).filter(Boolean);
        const hasUnrequired = fields.some(f => !f.required);
        const targetState = hasUnrequired;

        fields.forEach(f => {
            f.required = targetState;
        });

        const actionName = targetState ? 'Bulk Set Required' : 'Bulk Set Optional';
        this.recordState(actionName);
        this.renderCanvas();
        if (this.selectedFieldIds.size > 1) {
            this.renderMultiFieldProperties([...this.selectedFieldIds]);
        }
        this.showToast(targetState ? t('canvas.bulk_required_toast', 'Selected fields set to Required') : t('canvas.bulk_optional_toast', 'Selected fields set to Optional'), 'success');
    }

    toggleMultipleFieldsHidden(fieldIds) {
        if (!Array.isArray(fieldIds) || fieldIds.length === 0) return;
        const t = (k, fb, p) => (window.i18n ? window.i18n.t(k, fb, p) : fb);

        const fields = fieldIds.map(id => this.findFieldAndSection(id)?.field).filter(Boolean);
        const hasVisible = fields.some(f => !f.hidden);
        const targetState = hasVisible;

        fields.forEach(f => {
            f.hidden = targetState;
        });

        const actionName = targetState ? 'Bulk Hide Fields' : 'Bulk Show Fields';
        this.recordState(actionName);
        this.renderCanvas();
        if (this.selectedFieldIds.size > 1) {
            this.renderMultiFieldProperties([...this.selectedFieldIds]);
        }
        this.showToast(targetState ? t('canvas.bulk_hidden_toast', 'Selected fields hidden from client preview') : t('canvas.bulk_visible_toast', 'Selected fields set to visible in client preview'), 'success');
    }

    renderMultiFieldProperties(fieldIds) {
        if (!this.dom.properties || !Array.isArray(fieldIds) || fieldIds.length === 0) return;
        const t = (k, fb, p) => (window.i18n ? window.i18n.t(k, fb, p) : fb);

        const items = fieldIds.map(id => this.findFieldAndSection(id)).filter(Boolean);
        const total = items.length;
        const reqCount = items.filter(i => i.field.required).length;
        const hiddenCount = items.filter(i => i.field.hidden).length;

        this.dom.properties.innerHTML = `
            <div class="properties-header">
                <div class="prop-title-row">
                    <h3>${t('canvas.multi_properties_title', 'Multi-Field Selection')}</h3>
                    <span class="prop-type-badge multi-badge">${total} ${t('canvas.selected_badge', 'Selected')}</span>
                </div>
                <p class="prop-subtitle">${t('canvas.multi_properties_subtitle', 'Perform bulk operations across all {count} selected questions', { count: total })}</p>
            </div>

            <div class="prop-body">
                <div class="form-stats-grid" style="margin: 14px 0;">
                    <div class="stat-card">
                        <span class="stat-number">${total}</span>
                        <span class="stat-label">${t('overview.total_fields', 'Total Fields')}</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${reqCount}</span>
                        <span class="stat-label">${t('overview.required', 'Required')}</span>
                    </div>
                </div>

                <div class="prop-group" style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
                    <label style="font-weight: 700; color: #1e293b;">${t('canvas.bulk_actions_heading', 'Bulk Actions')}</label>
                    <button type="button" id="prop-btn-bulk-toggle-req" class="btn-secondary" style="width: 100%; justify-content: flex-start;">
                        <span>★</span> <span>${reqCount === total ? t('canvas.set_all_optional', 'Set All Optional') : t('canvas.set_all_required', 'Set All Required')}</span>
                    </button>
                    <button type="button" id="prop-btn-bulk-toggle-hide" class="btn-secondary" style="width: 100%; justify-content: flex-start;">
                        <span>👁️</span> <span>${hiddenCount === total ? t('canvas.set_all_visible', 'Show All in Client Intake') : t('canvas.set_all_hidden', 'Hide All from Client Intake')}</span>
                    </button>
                    <button type="button" id="prop-btn-bulk-dup" class="btn-secondary" style="width: 100%; justify-content: flex-start;">
                        <span>📋</span> <span>${t('canvas.duplicate_block', 'Duplicate Block')} (${total})</span>
                    </button>
                    <button type="button" id="prop-btn-bulk-del" class="btn-danger" style="width: 100%; justify-content: flex-start;">
                        <span>🗑️</span> <span>${t('canvas.delete', 'Delete')} (${total})</span>
                    </button>
                </div>

                <div class="prop-group" style="margin-top: 16px;">
                    <label style="font-weight: 600; color: #475569; font-size: 0.8rem;">${t('canvas.selected_fields_list', 'Selected Fields')}</label>
                    <div class="multi-selected-fields-list" style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px; max-height: 260px; overflow-y: auto;">
                        ${items.map((it, idx) => `
                            <div style="display:flex; justify-content:space-between; align-items:center; background:white; padding:6px 10px; border-radius:6px; border:1px solid #e2e8f0; font-size:0.8rem;">
                                <div style="display:flex; align-items:center; gap:6px; overflow:hidden;">
                                    <span style="font-weight:700; color:#64748b; font-size:0.75rem;">#${idx + 1}</span>
                                    <span style="white-space:nowrap; text-overflow:ellipsis; overflow:hidden; max-width:140px; font-weight:600; color:#1e293b;">${this.escapeHtml(it.field.label || 'Untitled')}</span>
                                </div>
                                <div style="display:flex; gap:4px; align-items:center;">
                                    ${it.field.required ? '<span style="font-size:0.68rem; background:#fee2e2; color:#b91c1c; padding:1px 4px; border-radius:3px; font-weight:700;">* Req</span>' : ''}
                                    ${it.field.hidden ? '<span style="font-size:0.68rem; background:#f1f5f9; color:#64748b; padding:1px 4px; border-radius:3px;">Hidden</span>' : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('prop-btn-bulk-toggle-req')?.addEventListener('click', () => {
            this.toggleMultipleFieldsRequired(fieldIds);
        });

        document.getElementById('prop-btn-bulk-toggle-hide')?.addEventListener('click', () => {
            this.toggleMultipleFieldsHidden(fieldIds);
        });

        document.getElementById('prop-btn-bulk-dup')?.addEventListener('click', () => {
            this.duplicateMultipleFields(fieldIds);
        });

        document.getElementById('prop-btn-bulk-del')?.addEventListener('click', () => {
            this.deleteMultipleFields(fieldIds);
        });
    }

    deleteField(fieldId) {
        const found = this.findFieldAndSection(fieldId);
        if (!found) return;

        const { field, section, parentContainer } = found;
        this.addRecentlyDeleted({
            id: 'del_' + Date.now(),
            type: 'field',
            data: field,
            sectionId: section.id,
            parentContainerId: parentContainer ? parentContainer.id : null,
            timestamp: Date.now()
        });

        if (parentContainer && Array.isArray(parentContainer.fields)) {
            parentContainer.fields = parentContainer.fields.filter(f => f.id !== fieldId);
        } else if (section && Array.isArray(section.fields)) {
            section.fields = section.fields.filter(f => f.id !== fieldId);
        }

        this.recordState('Delete Field');
        this.deselectField();
        this.renderCanvas();
    }

    deleteMultipleFields(fieldIds) {
        if (!Array.isArray(fieldIds) || fieldIds.length === 0) return;
        fieldIds.forEach(id => {
            this.deleteField(id);
        });
        this.recordState('Delete Multiple Fields');
        this.deselectField();
        this.renderCanvas();
    }

    addSection() {
        const t = (k, fb) => (window.i18n ? window.i18n.t(k, fb) : fb);
        const newSec = {
            id: 'sec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            title: t('section.new_section_title', '[Section Title]'),
            fields: []
        };

        if (!this.currentForm.sections) this.currentForm.sections = [];
        this.currentForm.sections.push(newSec);

        this.recordState('Add Section');
        this.renderCanvas();
        this.selectSection(newSec.id);
    }

    deleteSection(sectionId) {
        const idx = this.currentForm.sections?.findIndex(s => s.id === sectionId);
        if (idx === -1 || idx === undefined) return;

        const sec = this.currentForm.sections[idx];
        this.addRecentlyDeleted({
            id: 'del_' + Date.now(),
            type: 'section',
            data: sec,
            index: idx,
            timestamp: Date.now()
        });

        this.currentForm.sections.splice(idx, 1);
        this.recordState('Delete Section');
        this.deselectField();
        this.renderCanvas();
    }

    duplicateSection(sectionId) {
        const sec = this.currentForm.sections?.find(s => s.id === sectionId);
        if (!sec) return;

        const clone = JSON.parse(JSON.stringify(sec));
        clone.id = 'sec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        clone.title = (clone.title || 'Untitled Section') + ' (Copy)';

        if (clone.fields) {
            clone.fields.forEach(f => {
                f.id = 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
                if (f.type === 'container' && Array.isArray(f.fields)) {
                    f.fields.forEach(cf => {
                        cf.id = 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
                    });
                }
            });
        }

        const idx = this.currentForm.sections.indexOf(sec);
        this.currentForm.sections.splice(idx + 1, 0, clone);

        this.recordState('Duplicate Section');
        this.renderCanvas();
        this.selectSection(clone.id);
    }

    moveSection(index, delta) {
        const targetIdx = index + delta;
        if (targetIdx < 0 || targetIdx >= this.currentForm.sections.length) return;

        const item = this.currentForm.sections.splice(index, 1)[0];
        this.currentForm.sections.splice(targetIdx, 0, item);

        this.recordState('Move Section');
        this.renderCanvas();
    }

    toggleSectionCollapse(sectionId) {
        const sec = this.currentForm.sections?.find(s => s.id === sectionId);
        if (!sec) return;

        sec.collapsed = !sec.collapsed;
        this.saveCollapseState(sectionId, sec.collapsed);
        this.renderCanvas();
    }

    toggleSectionVisibility(sectionId) {
        const sec = this.currentForm.sections?.find(s => s.id === sectionId);
        if (!sec) return;

        sec.hidden = !sec.hidden;
        this.recordState('Toggle Section Visibility');
        this.renderCanvas();
    }

    expandAllSections() {
        if (!this.currentForm?.sections) return;
        this.currentForm.sections.forEach(s => {
            s.collapsed = false;
            this.saveCollapseState(s.id, false);
        });
        this.renderCanvas();
    }

    collapseAllSections() {
        if (!this.currentForm?.sections) return;
        this.currentForm.sections.forEach(s => {
            s.collapsed = true;
            this.saveCollapseState(s.id, true);
        });
        this.renderCanvas();
    }

    copyFieldJson(field, targetBtn) {
        if (!field) return;
        const jsonStr = JSON.stringify(field, null, 2);
        navigator.clipboard.writeText(jsonStr).then(() => {
            if (targetBtn) {
                const orig = targetBtn.textContent;
                targetBtn.textContent = '✅ Copied!';
                setTimeout(() => { targetBtn.textContent = orig; }, 1500);
            }
            this.showToast('Field configuration JSON copied to clipboard.', 'success');
        }).catch(() => {
            this.showToast('Failed to copy to clipboard.', 'error');
        });
    }

    renderPropertySearchFilterBar(title = 'Properties') {
        const t = (k, fb) => (window.i18n ? window.i18n.t(k, fb) : fb);
        return `
            <div class="prop-search-filter-box" style="padding: 8px 16px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                <input type="text" id="prop-filter-input" class="prop-filter-input" placeholder="🔍 ${t('properties.search_props_placeholder', 'Search ' + title + '...')}" style="width:100%; font-size:0.78rem; padding:5px 10px; border-radius:6px; border:1px solid #cbd5e1; background:white;">
            </div>
        `;
    }

    initPropertySearchListeners() {
        const input = document.getElementById('prop-filter-input');
        if (!input) return;

        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const groups = this.dom.properties.querySelectorAll('.prop-body .prop-group, .prop-body .char-length-box, .prop-body .validation-box, .prop-body .conditional-box, .prop-body .options-editor-group, .prop-body .form-stats-grid');
            
            groups.forEach(group => {
                if (!query) {
                    group.style.display = '';
                    return;
                }
                const text = group.textContent.toLowerCase();
                const keywords = (group.getAttribute('data-prop-keywords') || '').toLowerCase();
                const category = (group.getAttribute('data-prop-category') || '').toLowerCase();
                
                if (text.includes(query) || keywords.includes(query) || category.includes(query)) {
                    group.style.display = '';
                } else {
                    group.style.display = 'none';
                }
            });
        });
    }

    renderSectionProperties(section) {
        if (!this.dom.properties || !section) return;

        const t = (k, fb) => (window.i18n ? window.i18n.t(k, fb) : fb);
        const fieldCount = section.fields ? section.fields.length : (section.type === 'medical_section' ? 7 : 0);
        const requiredCount = section.fields ? section.fields.filter(f => f.required).length : (section.type === 'medical_section' ? 7 : 0);

        this.dom.properties.innerHTML = `
            <div class="properties-header">
                <div class="prop-title-row">
                    <h3>${t('properties.section_properties', 'Section Properties')}</h3>
                    <span class="prop-type-badge">📑 Section</span>
                </div>
                <p class="prop-subtitle">${t('properties.section_subtitle', 'Configure section title, visibility, and group settings')}</p>
            </div>

            ${this.renderPropertySearchFilterBar('Section Properties')}

            <div class="prop-body">
                <div class="prop-group" data-prop-category="label" data-prop-keywords="section title name heading label">
                    <label for="prop-sec-title">${t('properties.section_title', 'Section Title')}</label>
                    <input type="text" id="prop-sec-title" class="prop-input" value="${this.escapeHtml(section.title || '')}" placeholder="e.g. Client Medical History">
                </div>

                <div class="form-stats-grid" style="margin: 14px 0;">
                    <div class="stat-card">
                        <span class="stat-number">${fieldCount}</span>
                        <span class="stat-label">${t('overview.total_fields', 'Total Fields')}</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${requiredCount}</span>
                        <span class="stat-label">${t('overview.required', 'Required')}</span>
                    </div>
                </div>

                <!-- Hidden Toggle -->
                <div class="prop-group toggle-group" data-prop-category="visibility" data-prop-keywords="hidden hide show visibility client preview">
                    <div class="toggle-info">
                        <label for="prop-sec-hidden" class="toggle-label">${t('properties.hide_section', 'Hide Section from Client Preview')}</label>
                        <small class="toggle-desc">${t('properties.hide_section_desc', 'Temporarily exclude this section from client intake')}</small>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="prop-sec-hidden" ${section.hidden ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Collapsed by Default -->
                <div class="prop-group toggle-group" data-prop-category="layout" data-prop-keywords="collapsed collapse accordion start closed">
                    <div class="toggle-info">
                        <label for="prop-sec-collapsed" class="toggle-label">${t('properties.start_collapsed_default', 'Start Collapsed by Default')}</label>
                        <small class="toggle-desc">${t('properties.start_collapsed_sec_desc', 'Initially collapse this section on the canvas and preview')}</small>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="prop-sec-collapsed" ${section.collapsed ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- Section Actions -->
                <div class="prop-actions-bar" style="margin-top:20px;">
                    <button type="button" class="btn-prop-action" id="btn-prop-sec-dup" title="Duplicate entire section">📋 ${t('canvas.duplicate', 'Duplicate')}</button>
                    <button type="button" class="btn-prop-action btn-danger" id="btn-prop-sec-del" title="Delete section">🗑️ ${t('canvas.delete', 'Delete')}</button>
                </div>
            </div>
        `;

        this.initPropertySearchListeners();

        // Listeners
        const titleInput = document.getElementById('prop-sec-title');
        if (titleInput) {
            titleInput.addEventListener('input', (e) => {
                section.title = e.target.value;
                const canvasTitle = this.dom.canvas.querySelector(`[data-section-id="${section.id}"] .section-title-input`);
                if (canvasTitle) canvasTitle.value = section.title;
            });
            titleInput.addEventListener('change', () => {
                this.recordState('Rename Section');
                this.renderCanvas();
                this.selectSection(section.id);
            });
        }

        const hiddenToggle = document.getElementById('prop-sec-hidden');
        if (hiddenToggle) {
            hiddenToggle.addEventListener('change', (e) => {
                section.hidden = e.target.checked;
                this.recordState('Toggle Section Visibility');
                this.renderCanvas();
                this.selectSection(section.id);
            });
        }

        const collapsedToggle = document.getElementById('prop-sec-collapsed');
        if (collapsedToggle) {
            collapsedToggle.addEventListener('change', (e) => {
                section.collapsed = e.target.checked;
                this.saveCollapseState(section.id, section.collapsed);
                this.recordState('Toggle Section Collapse Default');
                this.renderCanvas();
                this.selectSection(section.id);
            });
        }

        const dupBtn = document.getElementById('btn-prop-sec-dup');
        if (dupBtn) {
            dupBtn.addEventListener('click', () => this.duplicateSection(section.id));
        }

        const delBtn = document.getElementById('btn-prop-sec-del');
        if (delBtn) {
            delBtn.addEventListener('click', () => this.deleteSection(section.id));
        }
    }

    renderFieldProperties(field, section, parentContainer) {
        if (!this.dom.properties || !field) return;

        const t = (k, fb, p) => (window.i18n ? window.i18n.t(k, fb, p) : fb);

        // 1. CONTAINER / SECTION GROUP PROPERTIES PANEL
        if (field.type === 'container' || field.type === 'section_group') {
            const isGroup = field.type === 'section_group';
            const childCount = field.fields ? field.fields.length : 0;

            this.dom.properties.innerHTML = `
                <div class="properties-header">
                    <div class="prop-title-row">
                        <h3>${isGroup ? t('properties.section_group_block', 'Section Group Block') : t('properties.container_properties', 'Container Properties')}</h3>
                        <span class="prop-type-badge">${isGroup ? t('properties.section_group_badge', '📦 Section Group') : t('properties.container_panel_badge', '🗂️ Container Panel')}</span>
                    </div>
                    <p class="prop-subtitle">${isGroup ? t('properties.section_group_subtitle', 'Move, duplicate, or delete logical blocks of related questions as a single unit') : t('properties.container_panel_subtitle', 'Group related fields into a structured section box')}</p>
                </div>

                ${this.renderPropertySearchFilterBar('Container Properties')}

                <div class="prop-body">
                    <!-- Container Label -->
                    <div class="prop-group" data-prop-category="label" data-prop-keywords="label title name header container group heading">
                        <label for="prop-container-label">${isGroup ? t('properties.section_group_title', 'Section Group Title') : t('properties.container_title', 'Container Title')}</label>
                        <input type="text" id="prop-container-label" class="prop-input" value="${this.escapeHtml(field.label || '')}" placeholder="${isGroup ? 'e.g. Emergency Contact & Guardian Info' : 'e.g. Emergency Contact & Physician'}">
                    </div>

                    <!-- Container Internal Field Alias -->
                    <div class="prop-group" data-prop-category="alias" data-prop-keywords="alias crm key identifier internal api mapping">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <label for="prop-container-alias" style="margin-bottom:0;">${t('properties.internal_alias', 'Internal Field Alias (CRM / API Key)')}</label>
                            <span style="font-size:0.68rem; color:#6366f1; background:#e0e7ff; padding:1px 6px; border-radius:4px; font-weight:600;">CRM MAPPING</span>
                        </div>
                        <input type="text" id="prop-container-alias" class="prop-input" value="${this.escapeHtml(field.alias || '')}" placeholder="e.g. group_guardian_info">
                        <small style="color:#64748b; font-size:0.75rem; display:block; margin-top:3px;">${t('properties.internal_alias_container_desc', 'Unique internal identifier for exporting group data without changing title')}</small>
                    </div>

                    <!-- Container Help / Description -->
                    <div class="prop-group" data-prop-category="label" data-prop-keywords="help helper text guidance description subtitle instructions">
                        <label for="prop-container-help">${t('properties.container_help_guidance', 'Helper Text / Guidance')}</label>
                        <input type="text" id="prop-container-help" class="prop-input" value="${this.escapeHtml(field.helperText || field.helpText || '')}" placeholder="e.g. Please provide primary contact in case of medical need">
                        <small style="color:#64748b; font-size:0.75rem; display:block; margin-top:3px;">${t('properties.container_help_desc', 'Instructional sub-text rendered directly below the group title')}</small>
                    </div>

                    <!-- Collapsible Container Toggles -->
                    <div class="prop-group toggle-group" data-prop-category="hidden" data-prop-keywords="collapsible collapse toggle accordion expand hide show">
                        <div class="toggle-info">
                            <label for="prop-container-collapsible" class="toggle-label">${t('properties.collapsible_section_toggle', 'Collapsible Section Toggle')}</label>
                            <small class="toggle-desc">${t('properties.collapsible_section_desc', 'Allow studio staff and clients to collapse/expand this group')}</small>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="prop-container-collapsible" ${field.collapsible !== false ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>

                    <div class="prop-group toggle-group" id="group-container-default-collapsed" data-prop-category="hidden" data-prop-keywords="default collapsed start closed accordion hidden hide" style="display: ${field.collapsible !== false ? 'flex' : 'none'};">
                        <div class="toggle-info">
                            <label for="prop-container-default-collapsed" class="toggle-label">${t('properties.start_collapsed_default', 'Start Collapsed by Default')}</label>
                            <small class="toggle-desc">${t('properties.start_collapsed_desc', 'Initially hide nested questions until expanded during intake')}</small>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="prop-container-default-collapsed" ${field.defaultCollapsed ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>

                    <!-- Container Box Visual Style -->
                    <div class="prop-group" data-prop-category="layout" data-prop-keywords="style visual theme card border muted accent look appearance">
                        <label for="prop-container-style">${t('properties.group_box_style', 'Group Visual Box Style')}</label>
                        <select id="prop-container-style" class="prop-input">
                            <option value="bordered" ${(field.containerStyle || 'bordered') === 'bordered' ? 'selected' : ''}>${t('properties.style_bordered', 'Standard Bordered Box')}</option>
                            <option value="card" ${field.containerStyle === 'card' ? 'selected' : ''}>${t('properties.style_card', 'Elevated Card with Shadow')}</option>
                            <option value="muted" ${field.containerStyle === 'muted' ? 'selected' : ''}>${t('properties.style_muted', 'Subtle Slate Muted Background')}</option>
                            <option value="accent" ${field.containerStyle === 'accent' ? 'selected' : ''}>${t('properties.style_accent', 'Blue Brand Accent Border')}</option>
                        </select>
                    </div>

                    <div class="form-stats-grid" style="margin: 14px 0;">
                        <div class="stat-card">
                            <span class="stat-number">${childCount}</span>
                            <span class="stat-label">${t('properties.child_questions', 'Child Questions')}</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number">${field.fields ? field.fields.filter(f => f.required).length : 0}</span>
                            <span class="stat-label">${t('canvas.required_badge', 'Mandatory')}</span>
                        </div>
                    </div>

                    <!-- Add Child Field Quick Actions -->
                    <div class="prop-group" data-prop-category="layout" data-prop-keywords="add child questions insert field elements">
                        <label>${t('properties.quick_add_group_title', 'Quick Add Field into this Group')}</label>
                        <div class="quick-add-grid">
                            <button type="button" class="btn-quick-add" onclick="window.FormBuilderApp.addField('text', null, '${field.id}')">📝 ${t('palette.field_labels.text', 'Text')}</button>
                            <button type="button" class="btn-quick-add" onclick="window.FormBuilderApp.addField('tel', null, '${field.id}')">📱 ${t('palette.field_labels.tel', 'Phone')}</button>
                            <button type="button" class="btn-quick-add" onclick="window.FormBuilderApp.addField('email', null, '${field.id}')">📧 ${t('palette.field_labels.email', 'Email')}</button>
                            <button type="button" class="btn-quick-add" onclick="window.FormBuilderApp.addField('date', null, '${field.id}')">📅 ${t('palette.field_labels.date', 'Date')}</button>
                            <button type="button" class="btn-quick-add" onclick="window.FormBuilderApp.addField('number', null, '${field.id}')">🔢 ${t('palette.field_labels.number', 'Number')}</button>
                            <button type="button" class="btn-quick-add" onclick="window.FormBuilderApp.addField('select', null, '${field.id}')">📋 ${t('palette.field_labels.select', 'Select')}</button>
                            <button type="button" class="btn-quick-add" onclick="window.FormBuilderApp.addField('checkbox', null, '${field.id}')">☑️ ${t('palette.field_labels.checkbox', 'Checkbox')}</button>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="prop-actions-bar" style="margin-top:16px;">
                        <button type="button" class="btn-prop-action btn-copy-json" id="btn-prop-copy-json" title="${t('properties.copy_json_title', 'Copy field JSON configuration metadata')}">${t('properties.copy_json_btn', '📋 Copy JSON')}</button>
                        <button type="button" class="btn-prop-action" id="btn-prop-dup" title="${t('properties.dup_group_block', 'Duplicate Group Block')}">${t('properties.dup_group_block', '📋 Duplicate Group Block')}</button>
                        <button type="button" class="btn-prop-action btn-danger" id="btn-prop-del" title="${t('properties.del_group_block', 'Delete Group Block')}">${t('properties.del_group_block', '🗑️ Delete Group Block')}</button>
                    </div>
                </div>
            `;

            this.initPropertySearchListeners();

            const labelInp = document.getElementById('prop-container-label');
            if (labelInp) {
                labelInp.addEventListener('input', (e) => {
                    field.label = e.target.value;
                    const cTitle = this.dom.canvas.querySelector(`[data-field-id="${field.id}"] .container-name`);
                    if (cTitle) cTitle.textContent = field.label || 'Grouped Intake Panel';
                });
                labelInp.addEventListener('change', () => {
                    this.recordState('Rename Container');
                    this.renderCanvas();
                    this.selectField(field.id, false);
                });
            }

            const cAliasInp = document.getElementById('prop-container-alias');
            if (cAliasInp) {
                cAliasInp.addEventListener('change', (e) => {
                    const val = e.target.value.trim();
                    if (val) {
                        field.alias = val;
                    } else {
                        delete field.alias;
                    }
                    this.recordState('Set Container Alias');
                    this.renderCanvas();
                    this.selectField(field.id, false);
                });
            }

            const helpInp = document.getElementById('prop-container-help');
            if (helpInp) {
                helpInp.addEventListener('change', (e) => {
                    field.helperText = e.target.value;
                    field.helpText = e.target.value;
                    this.recordState('Change Container Helper Text');
                    this.renderCanvas();
                    this.selectField(field.id, false);
                });
            }

            const styleSelect = document.getElementById('prop-container-style');
            if (styleSelect) {
                styleSelect.addEventListener('change', (e) => {
                    field.containerStyle = e.target.value;
                    this.recordState('Change Container Style');
                    this.renderCanvas();
                    this.selectField(field.id, false);
                });
            }

            const collapsibleToggle = document.getElementById('prop-container-collapsible');
            const defaultCollapsedGroup = document.getElementById('group-container-default-collapsed');
            const defaultCollapsedToggle = document.getElementById('prop-container-default-collapsed');

            if (collapsibleToggle) {
                collapsibleToggle.addEventListener('change', (e) => {
                    field.collapsible = e.target.checked;
                    if (defaultCollapsedGroup) {
                        defaultCollapsedGroup.style.display = field.collapsible ? 'flex' : 'none';
                    }
                    this.recordState(field.collapsible ? 'Enable Container Collapse' : 'Disable Container Collapse');
                    this.renderCanvas();
                    this.selectField(field.id, false);
                });
            }

            if (defaultCollapsedToggle) {
                defaultCollapsedToggle.addEventListener('change', (e) => {
                    field.defaultCollapsed = e.target.checked;
                    this.recordState(field.defaultCollapsed ? 'Set Container Default Collapsed' : 'Set Container Default Expanded');
                    this.renderCanvas();
                    this.selectField(field.id, false);
                });
            }

            const copyJsonBtn = document.getElementById('btn-prop-copy-json');
            if (copyJsonBtn) {
                copyJsonBtn.addEventListener('click', (e) => this.copyFieldJson(field, e.currentTarget));
            }

            const dupBtn = document.getElementById('btn-prop-dup');
            if (dupBtn) {
                dupBtn.addEventListener('click', () => this.duplicateField(field.id));
            }

            const delBtn = document.getElementById('btn-prop-del');
            if (delBtn) {
                delBtn.addEventListener('click', () => this.deleteField(field.id));
            }
            return;
        }

        // 2. SECTION HEADER FIELD PROPERTIES PANEL
        if (field.type === 'section_header') {
            this.dom.properties.innerHTML = `
                <div class="properties-header">
                    <div class="prop-title-row">
                        <h3>${t('properties.section_header_title', 'Section Header')}</h3>
                        <span class="prop-type-badge">${t('properties.section_header_badge', '📑 Section Header')}</span>
                    </div>
                    <p class="prop-subtitle">${t('properties.section_header_subtitle', 'Visual group header with a bold title and guidance description')}</p>
                </div>

                ${this.renderPropertySearchFilterBar('Section Header')}

                <div class="prop-body">
                    <!-- Header Title -->
                    <div class="prop-group" data-prop-category="label" data-prop-keywords="label title header section name heading text">
                        <label for="prop-header-label">${t('properties.header_title', 'Header Title')}</label>
                        <input type="text" id="prop-header-label" class="prop-input" value="${this.escapeHtml(field.label || '')}" placeholder="e.g. Health & Safety Consultation">
                    </div>

                    <!-- Header Internal Alias -->
                    <div class="prop-group" data-prop-category="alias" data-prop-keywords="alias crm mapping key identifier internal">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <label for="prop-header-alias" style="margin-bottom:0;">${t('properties.internal_alias', 'Internal Field Alias (CRM / API Key)')}</label>
                            <span style="font-size:0.68rem; color:#6366f1; background:#e0e7ff; padding:1px 6px; border-radius:4px; font-weight:600;">CRM MAPPING</span>
                        </div>
                        <input type="text" id="prop-header-alias" class="prop-input" value="${this.escapeHtml(field.alias || '')}" placeholder="e.g. section_health_safety_header">
                        <small style="color:#64748b; font-size:0.75rem; display:block; margin-top:3px;">${t('properties.internal_alias_header_desc', 'Optional unique identifier for mapping form structure')}</small>
                    </div>

                    <!-- Description / Guidance -->
                    <div class="prop-group" data-prop-category="label" data-prop-keywords="description guidance help helper instructions text">
                        <label for="prop-header-help">${t('properties.header_guidance', 'Description / Guidance')}</label>
                        <textarea id="prop-header-help" class="prop-input" rows="3" placeholder="${t('properties.header_guidance_placeholder', 'Provide instructions or background context for this section...')}">${this.escapeHtml(field.helpText || '')}</textarea>
                    </div>

                    <!-- Collapsible Section Toggle -->
                    <div class="prop-group toggle-group" data-prop-category="hidden" data-prop-keywords="collapsible collapse expand toggle accordion hide show" style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 12px; border-radius: 8px;">
                        <div class="toggle-info">
                            <label for="prop-header-collapsible" class="toggle-label" style="font-weight: 700;">${t('properties.expand_collapse_toggle', 'Expand/Collapse Toggle')}</label>
                            <small class="toggle-desc">${t('properties.expand_collapse_desc', 'Allow clients to click this header in preview/live form to expand or collapse nested fields')}</small>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="prop-header-collapsible" ${field.collapsible ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>

                    <!-- Default Collapsed Option -->
                    <div class="prop-group toggle-group" id="group-header-default-collapsed" data-prop-category="hidden" data-prop-keywords="default collapsed start closed hidden accordion hide" style="display: ${field.collapsible ? 'flex' : 'none'}; background: #fffbeb; border: 1px solid #fde68a; padding: 10px 12px; border-radius: 8px;">
                        <div class="toggle-info">
                            <label for="prop-header-default-collapsed" class="toggle-label" style="color: #92400e; font-weight: 700;">${t('properties.header_start_collapsed', 'Start Collapsed by Default')}</label>
                            <small class="toggle-desc" style="color: #b45309;">${t('properties.header_start_collapsed_desc', 'Initially hide nested fields until expanded by client to reduce scrolling')}</small>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="prop-header-default-collapsed" ${field.defaultCollapsed ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>

                    <!-- Actions -->
                    <div class="prop-actions-bar" style="margin-top:16px;">
                        <button type="button" class="btn-prop-action btn-copy-json" id="btn-prop-copy-json" title="${t('properties.copy_json_title', 'Copy header JSON configuration metadata')}">${t('properties.copy_json_btn', '📋 Copy JSON')}</button>
                        <button type="button" class="btn-prop-action" id="btn-prop-dup" title="${t('properties.duplicate_title', 'Duplicate Field')}">${t('properties.duplicate_btn', '📋 Duplicate')}</button>
                        <button type="button" class="btn-prop-action btn-danger" id="btn-prop-del" title="${t('properties.delete_title', 'Delete Field')}">${t('properties.delete_btn', '🗑️ Delete')}</button>
                    </div>
                </div>
            `;

            this.initPropertySearchListeners();

            const labelInp = document.getElementById('prop-header-label');
            if (labelInp) {
                labelInp.addEventListener('input', (e) => {
                    field.label = e.target.value;
                    const hTitle = this.dom.canvas.querySelector(`[data-field-id="${field.id}"] .canvas-section-header-title`);
                    if (hTitle) hTitle.textContent = field.label || 'Section Header';
                });
                labelInp.addEventListener('change', () => {
                    this.recordState('Rename Section Header');
                    this.renderCanvas();
                    this.selectField(field.id, false);
                });
            }

            const aliasInp = document.getElementById('prop-header-alias');
            if (aliasInp) {
                aliasInp.addEventListener('change', (e) => {
                    const val = e.target.value.trim();
                    if (val) {
                        field.alias = val;
                    } else {
                        delete field.alias;
                    }
                    this.recordState('Set Header Alias');
                    this.renderCanvas();
                    this.selectField(field.id, false);
                });
            }

            const helpInp = document.getElementById('prop-header-help');
            if (helpInp) {
                helpInp.addEventListener('change', (e) => {
                    field.helpText = e.target.value;
                    this.recordState('Change Header Guidance');
                    this.renderCanvas();
                    this.selectField(field.id, false);
                });
            }

            const collToggle = document.getElementById('prop-header-collapsible');
            const defCollGroup = document.getElementById('group-header-default-collapsed');
            const defCollToggle = document.getElementById('prop-header-default-collapsed');

            if (collToggle) {
                collToggle.addEventListener('change', (e) => {
                    field.collapsible = e.target.checked;
                    if (defCollGroup) {
                        defCollGroup.style.display = e.target.checked ? 'flex' : 'none';
                    }
                    if (!e.target.checked) {
                        delete field.defaultCollapsed;
                        if (defCollToggle) defCollToggle.checked = false;
                    }
                    this.recordState('Toggle Section Header Collapsible');
                    this.renderCanvas();
                    this.selectField(field.id, false);
                });
            }

            if (defCollToggle) {
                defCollToggle.addEventListener('change', (e) => {
                    field.defaultCollapsed = e.target.checked;
                    this.recordState('Toggle Header Default Collapsed');
                    this.renderCanvas();
                    this.selectField(field.id, false);
                });
            }

            const copyJsonBtn = document.getElementById('btn-prop-copy-json');
            if (copyJsonBtn) {
                copyJsonBtn.addEventListener('click', (e) => this.copyFieldJson(field, e.currentTarget));
            }

            const dupBtn = document.getElementById('btn-prop-dup');
            if (dupBtn) {
                dupBtn.addEventListener('click', () => this.duplicateField(field.id));
            }

            const delBtn = document.getElementById('btn-prop-del');
            if (delBtn) {
                delBtn.addEventListener('click', () => this.deleteField(field.id));
            }
            return;
        }

        // 3. STANDARD FIELD PROPERTIES PANEL
        const hasOptions = ['select', 'radio', 'checkbox_group'].includes(field.type);
        const hasPlaceholder = ['text', 'email', 'tel', 'number', 'textarea', 'select'].includes(field.type);
        const hasRows = field.type === 'textarea';
        const hasValidation = ['text', 'email', 'tel', 'date', 'number', 'textarea'].includes(field.type);
        const supportsCharLength = ['text', 'textarea', 'email', 'tel', 'number'].includes(field.type);

        // Gather list of other fields for conditional logic
        const otherFields = [];
        this.currentForm.sections.forEach(s => {
            if (s.fields) {
                s.fields.forEach(f => {
                    if (f.id !== field.id && f.type !== 'header' && f.type !== 'container') {
                        otherFields.push({ id: f.id, label: f.label || f.id, type: f.type, options: f.options || [] });
                    }
                    if (f.type === 'container' && Array.isArray(f.fields)) {
                        f.fields.forEach(cf => {
                            if (cf.id !== field.id && cf.type !== 'header') {
                                otherFields.push({ id: cf.id, label: `${f.label}: ${cf.label || cf.id}`, type: cf.type, options: cf.options || [] });
                            }
                        });
                    }
                });
            }
        });

        // Determine if currently selected dependency parent has options
        const currentCondFieldObj = otherFields.find(of => of.id === field.conditional?.show_if?.field);
        const condOptions = currentCondFieldObj?.options || [];

        let html = `
            <div class="properties-header">
                <div class="prop-title-row">
                    <h3>${t('properties.field_properties', 'Field Properties')}</h3>
                    <span class="prop-type-badge">${this.getFieldTypeIcon(field.type)} ${field.type}</span>
                </div>
                <p class="prop-subtitle">${parentContainer ? t('properties.field_subtitle_inside', 'Inside container: ' + parentContainer.label, { container: '<strong>' + this.escapeHtml(parentContainer.label) + '</strong>' }) : t('properties.field_subtitle', 'Configure validation, constraints, and attributes')}</p>
            </div>

            ${this.renderPropertySearchFilterBar('Field Properties')}

            <div class="prop-body">
                <!-- Field Type -->
                <div class="prop-group" data-prop-category="layout" data-prop-keywords="type input field selector date text email phone select radio checkbox signature">
                    <label for="prop-field-type">${t('properties.field_type', 'Field Type')}</label>
                    <select id="prop-field-type" class="prop-input">
                        <option value="text" ${field.type === 'text' ? 'selected' : ''}>${t('palette.field_labels.text', 'Text Input')}</option>
                        <option value="email" ${field.type === 'email' ? 'selected' : ''}>${t('palette.field_labels.email', 'Email')}</option>
                        <option value="tel" ${field.type === 'tel' ? 'selected' : ''}>${t('palette.field_labels.tel', 'Phone (Tel)')}</option>
                        <option value="date" ${field.type === 'date' ? 'selected' : ''}>${t('palette.field_labels.date', 'Date')}</option>
                        <option value="number" ${field.type === 'number' ? 'selected' : ''}>${t('palette.field_labels.number', 'Number')}</option>
                        <option value="textarea" ${field.type === 'textarea' ? 'selected' : ''}>${t('palette.field_labels.textarea', 'Text Area')}</option>
                        <option value="checkbox" ${field.type === 'checkbox' ? 'selected' : ''}>${t('palette.field_labels.checkbox', 'Checkbox')}</option>
                        <option value="checkbox_group" ${field.type === 'checkbox_group' ? 'selected' : ''}>${t('palette.field_labels.checkbox_group', 'Checkbox Group')}</option>
                        <option value="radio" ${field.type === 'radio' ? 'selected' : ''}>${t('palette.field_labels.radio', 'Radio Choices')}</option>
                        <option value="select" ${field.type === 'select' ? 'selected' : ''}>${t('palette.field_labels.select', 'Dropdown Select')}</option>
                        <option value="section_header" ${field.type === 'section_header' ? 'selected' : ''}>${t('palette.field_labels.section_header', 'Section Header')}</option>
                        <option value="container" ${field.type === 'container' ? 'selected' : ''}>${t('palette.field_labels.container', 'Container / Panel')}</option>
                        <option value="header" ${field.type === 'header' ? 'selected' : ''}>${t('palette.field_labels.header', 'Section Header / Notice')}</option>
                        <option value="signature" ${field.type === 'signature' ? 'selected' : ''}>${t('palette.field_labels.signature', 'Signature Pad')}</option>
                    </select>
                </div>

                <!-- Label -->
                <div class="prop-group" data-prop-category="label" data-prop-keywords="label title name question prompt heading text">
                    <label for="prop-label">${t('properties.field_label', 'Field Label')}</label>
                    <input type="text" id="prop-label" class="prop-input" value="${this.escapeHtml(field.label || '')}" placeholder="${t('properties.field_label_placeholder', 'Label shown to user...')}">
                </div>

                <!-- Internal Field Alias (CRM / API Key) -->
                <div class="prop-group" data-prop-category="alias" data-prop-keywords="alias crm mapping key api identifier internal export webhook">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <label for="prop-field-alias" style="margin-bottom:0;">${t('properties.internal_alias', 'Internal Field Alias (CRM / API Key)')}</label>
                        <span style="font-size:0.68rem; color:#6366f1; background:#e0e7ff; padding:1px 6px; border-radius:4px; font-weight:600;">CRM MAPPING</span>
                    </div>
                    <input type="text" id="prop-field-alias" class="prop-input" value="${this.escapeHtml(field.alias || '')}" placeholder="e.g. client_allergies_list">
                    <small style="color:#64748b; font-size:0.75rem; display:block; margin-top:3px;">${t('properties.internal_alias_desc', 'Unique internal identifier for mapping data to third-party CRM systems while keeping label friendly')}</small>
                </div>

                <!-- REQUIRED TOGGLE -->
                <div class="prop-group toggle-group" data-prop-category="validation" data-prop-keywords="required mandatory validation rule asterisk must fill required field">
                    <div class="toggle-info">
                        <label for="prop-required" class="toggle-label">${t('properties.required_field', 'Required Field')}</label>
                        <small class="toggle-desc">${t('properties.required_desc', 'Mandatory before submitting or generating PDF')}</small>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="prop-required" ${field.required ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- HIDDEN VISIBILITY TOGGLE -->
                <div class="prop-group toggle-group" data-prop-category="visibility" data-prop-keywords="hidden hide show visibility client preview intake draft">
                    <div class="toggle-info">
                        <label for="prop-field-hidden" class="toggle-label">${t('properties.hide_field', 'Hide Question from Client Intake')}</label>
                        <small class="toggle-desc">${t('properties.hide_field_desc', 'Temporarily exclude this question from client-facing intake and preview')}</small>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="prop-field-hidden" ${field.hidden ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>

                <!-- CHARACTER LENGTH RESTRICTIONS (MIN / MAX) -->
                ${supportsCharLength ? `
                    <div class="prop-group char-length-box" data-prop-category="validation" data-prop-keywords="length min max character characters limit bounds restrictions size count validation">
                        <label>${t('properties.char_length_title', 'Character Length Validation')}</label>
                        <div class="char-length-grid">
                            <div>
                                <label for="prop-min-length" style="font-size:0.75rem; color:#64748b;">${t('properties.min_chars', 'Min Characters')}</label>
                                <input type="number" id="prop-min-length" class="prop-input" min="0" value="${field.minLength !== undefined && field.minLength !== null ? field.minLength : ''}" placeholder="${t('properties.min_chars_placeholder', 'No minimum')}">
                            </div>
                            <div>
                                <label for="prop-max-length" style="font-size:0.75rem; color:#64748b;">${t('properties.max_chars', 'Max Characters')}</label>
                                <input type="number" id="prop-max-length" class="prop-input" min="1" value="${field.maxLength !== undefined && field.maxLength !== null ? field.maxLength : ''}" placeholder="${t('properties.max_chars_placeholder', 'No maximum')}">
                            </div>
                        </div>
                        <small style="color:#64748b; font-size:0.75rem; display:block; margin-top:4px;">${t('properties.char_length_desc', 'Enforces minimum & maximum text length before form submission')}</small>
                    </div>
                ` : ''}

                <!-- CUSTOM ERROR MESSAGE -->
                <div class="prop-group" data-prop-category="validation" data-prop-keywords="custom error message validation alert feedback prompt text warning">
                    <label for="prop-custom-err-msg">${t('properties.custom_err_msg', 'Custom Error Message (Validation & Required)')}</label>
                    <input type="text" id="prop-custom-err-msg" class="prop-input" value="${this.escapeHtml(field.customErrorMessage || field.validationMessage || '')}" placeholder="${t('properties.custom_err_msg_placeholder', 'e.g. Please provide a valid, complete entry (min 3 characters)')}">
                    <small style="color:#64748b; font-size:0.75rem; display:block; margin-top:4px;">${t('properties.custom_err_msg_desc', 'Custom message shown when required field is empty or fails validation rules')}</small>
                </div>

                <!-- LABEL ALIGNMENT -->
                <div class="prop-group" data-prop-category="layout" data-prop-keywords="alignment label align top left right layout format horizontal">
                    <label for="prop-label-align">${t('properties.label_align', 'Label Alignment')}</label>
                    <div class="alignment-btn-group">
                        <button type="button" class="btn-align ${(field.labelAlign || 'top') === 'top' ? 'active' : ''}" data-align="top" title="${t('properties.align_top_title', 'Top Aligned (Standard)')}">
                            ⬆️ ${t('properties.align_top', 'Top')}
                        </button>
                        <button type="button" class="btn-align ${field.labelAlign === 'left' ? 'active' : ''}" data-align="left" title="${t('properties.align_left_title', 'Left Aligned (Horizontal)')}">
                            ⬅️ ${t('properties.align_left', 'Left')}
                        </button>
                        <button type="button" class="btn-align ${field.labelAlign === 'right' ? 'active' : ''}" data-align="right" title="${t('properties.align_right_title', 'Right Aligned (Horizontal)')}">
                            ➡️ ${t('properties.align_right', 'Right')}
                        </button>
                    </div>
                </div>

                <!-- VALIDATION PATTERNS -->
                ${hasValidation ? `
                    <div class="prop-group validation-box" data-prop-category="validation" data-prop-keywords="validation rule pattern email phone date postal zip numeric regex custom alphanumeric">
                        <label for="prop-validation-pattern">${t('properties.validation_pattern', 'Validation Rule / Pattern')}</label>
                        <select id="prop-validation-pattern" class="prop-input">
                            <option value="none" ${(field.validation || 'none') === 'none' ? 'selected' : ''}>${t('properties.val_none', 'None (Standard Text)')}</option>
                            <option value="email" ${field.validation === 'email' ? 'selected' : ''}>${t('properties.val_email', '📧 Email Address Format')}</option>
                            <option value="phone" ${field.validation === 'phone' ? 'selected' : ''}>${t('properties.val_phone', '📱 Phone Number Format')}</option>
                            <option value="date" ${field.validation === 'date' ? 'selected' : ''}>${t('properties.val_date', '📅 Date (YYYY-MM-DD)')}</option>
                            <option value="alphanumeric" ${field.validation === 'alphanumeric' ? 'selected' : ''}>${t('properties.val_alphanumeric', '🔤 Alphanumeric (Letters & Numbers)')}</option>
                            <option value="numeric" ${field.validation === 'numeric' ? 'selected' : ''}>${t('properties.val_numeric', '🔢 Numeric Only')}</option>
                            <option value="postal" ${field.validation === 'postal' ? 'selected' : ''}>${t('properties.val_postal', '📮 Postal / ZIP Code')}</option>
                            <option value="custom" ${field.validation === 'custom' ? 'selected' : ''}>${t('properties.val_custom', '⚙️ Custom Regex Pattern')}</option>
                        </select>

                        <div id="custom-regex-wrap" style="display: ${field.validation === 'custom' ? 'block' : 'none'}; margin-top: 8px;">
                            <label for="prop-custom-regex" style="font-size:0.75rem;">${t('properties.custom_regex_label', 'Custom Regex Pattern')}</label>
                            <input type="text" id="prop-custom-regex" class="prop-input" value="${this.escapeHtml(field.customRegex || '')}" placeholder="e.g. ^[A-Z]{2}-\\d{4}$">
                        </div>
                    </div>
                ` : ''}

                <!-- Placeholder (if applicable) -->
                ${hasPlaceholder ? `
                    <div class="prop-group" data-prop-category="label" data-prop-keywords="placeholder hint ghost text default value prompt">
                        <label for="prop-placeholder">${t('properties.placeholder_text', 'Placeholder Text')}</label>
                        <input type="text" id="prop-placeholder" class="prop-input" value="${this.escapeHtml(field.placeholder || '')}" placeholder="${t('properties.placeholder_input', 'e.g. Enter full name...')}">
                    </div>
                ` : ''}

                <!-- Helper Text / Instructional Sub-text -->
                <div class="prop-group" data-prop-category="label" data-prop-keywords="help helper text instructional guidance subtitle note">
                    <label for="prop-help">${t('properties.helper_text', 'Helper Text (Instructional Sub-text)')}</label>
                    <input type="text" id="prop-help" class="prop-input" value="${this.escapeHtml(field.helperText || field.helpText || '')}" placeholder="${t('properties.helper_text_placeholder', 'e.g. Please include area code or legal full name')}">
                    <small style="color:#64748b; font-size:0.75rem; display:block; margin-top:3px;">${t('properties.helper_text_desc', 'Instructional sub-text rendered directly beneath the field label')}</small>
                </div>

                <!-- Textarea Rows (if applicable) -->
                ${hasRows ? `
                    <div class="prop-group" data-prop-category="layout" data-prop-keywords="rows height size textarea lines dimension">
                        <label for="prop-rows">${t('properties.rows_label', 'Rows (Height: 1-10)')}</label>
                        <input type="number" id="prop-rows" class="prop-input" min="1" max="10" value="${field.rows || 3}">
                    </div>
                ` : ''}

                <!-- Options Editor (for select, radio, checkbox_group) -->
                ${hasOptions ? `
                    <div class="prop-group options-editor-group" data-prop-category="options" data-prop-keywords="options choices dropdown radio checkbox items list values choices add reorder">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <label style="margin-bottom:0;">${t('properties.options_list_order', 'Options List & Order')}</label>
                            <span style="font-size:0.7rem; color:#64748b;">${t('properties.options_reorder_hint', 'Drag ⋮⋮ or use ▲▼ to reorder')}</span>
                        </div>
                        <div id="options-list-container" class="options-list">
                            ${(field.options || []).map((opt, oIdx) => `
                                <div class="option-item-row" data-opt-idx="${oIdx}">
                                    <span class="opt-drag-handle" title="${t('properties.drag_to_reorder', 'Drag to reorder')}">⋮⋮</span>
                                    <button type="button" class="btn-icon btn-move-opt-up" title="${t('properties.move_option_up', 'Move option up')}" ${oIdx === 0 ? 'disabled' : ''}>▲</button>
                                    <button type="button" class="btn-icon btn-move-opt-down" title="${t('properties.move_option_down', 'Move option down')}" ${oIdx === (field.options || []).length - 1 ? 'disabled' : ''}>▼</button>
                                    <input type="text" class="prop-input opt-val-input" value="${this.escapeHtml(opt)}">
                                    <button type="button" class="btn-icon btn-remove-opt" title="${t('properties.remove_option_title', 'Remove option')}">✕</button>
                                </div>
                            `).join('')}
                        </div>
                        <div class="add-option-row">
                            <input type="text" id="new-opt-val" class="prop-input" placeholder="${t('properties.new_option_placeholder', 'New option name...')}">
                            <button type="button" id="btn-add-option" class="btn-secondary">${t('properties.add_option_btn', '+ Add Option')}</button>
                        </div>
                    </div>
                ` : ''}

                <!-- Dependency & Conditional Logic Accordion -->
                <div class="prop-group conditional-box" data-prop-category="logic" data-prop-keywords="conditional logic dependency dependency show if rules branch visible hidden trigger parent equals">
                    <label class="conditional-header">
                        <input type="checkbox" id="prop-conditional-toggle" ${field.conditional ? 'checked' : ''}>
                        <span>${t('properties.conditional_logic', '🔀 Dependency & Conditional Logic')}</span>
                    </label>
                    
                    <div id="conditional-config-panel" style="display: ${field.conditional ? 'block' : 'none'}; margin-top: 10px;">
                        <small style="display:block; margin-bottom:6px; color:#64748b;">${t('properties.conditional_desc', 'Show this field based on a preceding Radio or Select selection:')}</small>
                        <div class="prop-group" data-prop-category="logic" data-prop-keywords="preceding parent field conditional dependency">
                            <label for="prop-cond-field" style="font-size:0.75rem;">${t('properties.preceding_field', 'Preceding / Parent Field')}</label>
                            <select id="prop-cond-field" class="prop-input">
                                <option value="">${t('properties.choose_preceding_field', '-- Choose Preceding Field --')}</option>
                                ${otherFields.map(of => `
                                    <option value="${of.id}" ${field.conditional?.show_if?.field === of.id ? 'selected' : ''}>${this.escapeHtml(of.label)} (${of.type})</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="prop-group" data-prop-category="logic" data-prop-keywords="condition rule operator equals checked contains">
                            <label for="prop-cond-operator" style="font-size:0.75rem;">${t('properties.condition_rule', 'Condition Rule')}</label>
                            <select id="prop-cond-operator" class="prop-input">
                                <option value="equals" ${field.conditional?.show_if?.operator === 'equals' ? 'selected' : ''}>${t('properties.rule_equals', 'Equals Selection')}</option>
                                <option value="not_equals" ${field.conditional?.show_if?.operator === 'not_equals' ? 'selected' : ''}>${t('properties.rule_not_equals', 'Does Not Equal')}</option>
                                <option value="is_checked" ${field.conditional?.show_if?.operator === 'is_checked' ? 'selected' : ''}>${t('properties.rule_is_checked', 'Is Checked (Yes)')}</option>
                                <option value="is_not_checked" ${field.conditional?.show_if?.operator === 'is_not_checked' ? 'selected' : ''}>${t('properties.rule_is_not_checked', 'Is Not Checked (No)')}</option>
                                <option value="contains" ${field.conditional?.show_if?.operator === 'contains' ? 'selected' : ''}>${t('properties.rule_contains', 'Contains text')}</option>
                            </select>
                        </div>
                        <div class="prop-group" id="prop-cond-val-group" data-prop-category="logic" data-prop-keywords="matching target value conditional rule preset">
                            <label for="prop-cond-value" style="font-size:0.75rem;">${t('properties.matching_value', 'Matching Value')}</label>
                            ${condOptions.length > 0 ? `
                                <div style="display: flex; gap: 4px; margin-bottom: 4px;">
                                    <select id="prop-cond-preset" class="prop-input" style="font-size: 0.78rem; padding: 4px 6px;">
                                        <option value="">${t('properties.quick_select_options', '-- Quick Select from Field Options --')}</option>
                                        ${condOptions.map(opt => `<option value="${this.escapeHtml(opt)}">${this.escapeHtml(opt)}</option>`).join('')}
                                    </select>
                                </div>
                            ` : ''}
                            <input type="text" id="prop-cond-value" class="prop-input" value="${this.escapeHtml(field.conditional?.show_if?.value || '')}" placeholder="${t('properties.target_value_placeholder', 'Target value (e.g. Yes, Option 1)')}">
                        </div>
                    </div>
                </div>

                <!-- Field Action Buttons -->
                <div class="prop-actions-bar">
                    <button type="button" class="btn-prop-action btn-copy-json" id="btn-prop-copy-json" title="${t('properties.copy_json_title', 'Copy field JSON configuration metadata for debugging or re-use')}">${t('properties.copy_json_btn', '📋 Copy JSON')}</button>
                    <button type="button" class="btn-prop-action" id="btn-prop-dup" title="${t('properties.duplicate_title', 'Duplicate Field (Ctrl+D)')}">${t('properties.duplicate_btn', '📋 Duplicate')}</button>
                    <button type="button" class="btn-prop-action btn-danger" id="btn-prop-del" title="${t('properties.delete_title', 'Delete Field (Delete)')}">${t('properties.delete_btn', '🗑️ Delete')}</button>
                </div>
            </div>
        `;

        this.dom.properties.innerHTML = html;

        this.initPropertySearchListeners();

        // Attach property change listeners
        const typeSelect = document.getElementById('prop-field-type');
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                field.type = e.target.value;
                this.recordState(`Change field type to ${field.type}`);
                this.renderCanvas();
                this.selectField(field.id, false);
            });
        }

        // Label & Alias Listeners
        const labelInput = document.getElementById('prop-label');
        if (labelInput) {
            labelInput.addEventListener('input', (e) => {
                field.label = e.target.value;
                const canvasItem = this.dom.canvas.querySelector(`[data-field-id="${field.id}"] .field-label-text`);
                if (canvasItem) canvasItem.textContent = field.label || 'Untitled Field';
            });
            labelInput.addEventListener('change', () => {
                this.recordState('Rename Field');
                this.renderCanvas();
                this.selectField(field.id, false);
            });
        }

        const aliasInput = document.getElementById('prop-field-alias');
        if (aliasInput) {
            aliasInput.addEventListener('change', (e) => {
                const val = e.target.value.trim();
                if (val) {
                    field.alias = val;
                } else {
                    delete field.alias;
                }
                this.recordState('Set Field Alias');
                this.renderCanvas();
                this.selectField(field.id, false);
            });
        }

        const reqCheckbox = document.getElementById('prop-required');
        if (reqCheckbox) {
            reqCheckbox.addEventListener('change', (e) => {
                field.required = e.target.checked;
                this.recordState(field.required ? 'Set Required' : 'Set Optional');
                this.renderCanvas();
                this.selectField(field.id, false);
            });
        }

        const hiddenCheckbox = document.getElementById('prop-field-hidden');
        if (hiddenCheckbox) {
            hiddenCheckbox.addEventListener('change', (e) => {
                field.hidden = e.target.checked;
                this.recordState(field.hidden ? 'Hide Field' : 'Show Field');
                this.renderCanvas();
                this.selectField(field.id, false);
            });
        }

        // Min / Max Length Listeners
        const minLenInput = document.getElementById('prop-min-length');
        if (minLenInput) {
            minLenInput.addEventListener('change', (e) => {
                const val = e.target.value.trim();
                if (val !== '' && !isNaN(val)) {
                    field.minLength = parseInt(val, 10);
                } else {
                    delete field.minLength;
                }
                this.recordState('Set Min Length');
                this.renderCanvas();
                this.selectField(field.id, false);
            });
        }

        const maxLenInput = document.getElementById('prop-max-length');
        if (maxLenInput) {
            maxLenInput.addEventListener('change', (e) => {
                const val = e.target.value.trim();
                if (val !== '' && !isNaN(val)) {
                    field.maxLength = parseInt(val, 10);
                } else {
                    delete field.maxLength;
                }
                this.recordState('Set Max Length');
                this.renderCanvas();
                this.selectField(field.id, false);
            });
        }

        // Custom Error Message Listener
        const customErrMsgInput = document.getElementById('prop-custom-err-msg');
        if (customErrMsgInput) {
            customErrMsgInput.addEventListener('change', (e) => {
                const val = e.target.value.trim();
                if (val) {
                    field.customErrorMessage = val;
                    field.validationMessage = val;
                } else {
                    delete field.customErrorMessage;
                    delete field.validationMessage;
                }
                this.recordState('Set Custom Error Message');
            });
        }

        // Label Alignment Buttons
        const alignBtns = this.dom.properties.querySelectorAll('.btn-align');
        alignBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const align = e.currentTarget.dataset.align;
                field.labelAlign = align;
                this.recordState(`Set label alignment to ${align}`);
                this.renderCanvas();
                this.selectField(field.id, false);
            });
        });

        // Validation Rule Listeners
        const valSelect = document.getElementById('prop-validation-pattern');
        const customRegexWrap = document.getElementById('custom-regex-wrap');
        const customRegexInput = document.getElementById('prop-custom-regex');

        if (valSelect) {
            valSelect.addEventListener('change', (e) => {
                field.validation = e.target.value;
                if (customRegexWrap) {
                    customRegexWrap.style.display = field.validation === 'custom' ? 'block' : 'none';
                }
                if (field.validation !== 'custom') {
                    delete field.customRegex;
                }
                this.recordState(`Set validation pattern to ${field.validation}`);
                this.renderCanvas();
                this.selectField(field.id, false);
            });
        }

        if (customRegexInput) {
            customRegexInput.addEventListener('change', (e) => {
                field.customRegex = e.target.value;
                this.recordState('Set Custom Regex');
                this.renderCanvas();
                this.selectField(field.id, false);
            });
        }

        // Placeholder Listener
        const placeholderInput = document.getElementById('prop-placeholder');
        if (placeholderInput) {
            placeholderInput.addEventListener('input', (e) => {
                field.placeholder = e.target.value;
            });
            placeholderInput.addEventListener('change', () => {
                this.recordState('Change Placeholder');
                this.renderCanvas();
                this.selectField(field.id, false);
            });
        }

        // Helper Text Listener
        const helpInput = document.getElementById('prop-help');
        if (helpInput) {
            helpInput.addEventListener('input', (e) => {
                field.helperText = e.target.value;
                field.helpText = e.target.value;
            });
            helpInput.addEventListener('change', () => {
                this.recordState('Change Helper Text');
                this.renderCanvas();
                this.selectField(field.id, false);
            });
        }

        // Rows Listener
        const rowsInput = document.getElementById('prop-rows');
        if (rowsInput) {
            rowsInput.addEventListener('change', (e) => {
                field.rows = parseInt(e.target.value, 10) || 3;
                this.recordState('Change Textarea Rows');
                this.renderCanvas();
                this.selectField(field.id, false);
            });
        }

        // Options List Management & Sortable
        if (hasOptions) {
            const optListContainer = document.getElementById('options-list-container');
            if (optListContainer && window.Sortable) {
                Sortable.create(optListContainer, {
                    handle: '.opt-drag-handle',
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    onEnd: (evt) => {
                        const { oldIndex, newIndex } = evt;
                        if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex && field.options) {
                            const moved = field.options.splice(oldIndex, 1)[0];
                            field.options.splice(newIndex, 0, moved);
                            this.recordState('Reorder Options (Drag)');
                            this.renderCanvas();
                            this.selectField(field.id, false);
                        }
                    }
                });
            }

            const moveUpBtns = this.dom.properties.querySelectorAll('.btn-move-opt-up');
            moveUpBtns.forEach((btn, idx) => {
                btn.addEventListener('click', () => {
                    if (idx > 0 && field.options && field.options.length > idx) {
                        const moved = field.options.splice(idx, 1)[0];
                        field.options.splice(idx - 1, 0, moved);
                        this.recordState('Reorder Option Up');
                        this.renderCanvas();
                        this.selectField(field.id, false);
                    }
                });
            });

            const moveDownBtns = this.dom.properties.querySelectorAll('.btn-move-opt-down');
            moveDownBtns.forEach((btn, idx) => {
                btn.addEventListener('click', () => {
                    if (field.options && idx < field.options.length - 1) {
                        const moved = field.options.splice(idx, 1)[0];
                        field.options.splice(idx + 1, 0, moved);
                        this.recordState('Reorder Option Down');
                        this.renderCanvas();
                        this.selectField(field.id, false);
                    }
                });
            });

            const optInputs = this.dom.properties.querySelectorAll('.opt-val-input');
            optInputs.forEach((inp, idx) => {
                inp.addEventListener('change', (e) => {
                    if (field.options && field.options[idx] !== undefined) {
                        field.options[idx] = e.target.value;
                        this.recordState('Edit Option');
                        this.renderCanvas();
                    }
                });
            });

            const removeOptBtns = this.dom.properties.querySelectorAll('.btn-remove-opt');
            removeOptBtns.forEach((btn, idx) => {
                btn.addEventListener('click', () => {
                    if (field.options && field.options.length > 1) {
                        field.options.splice(idx, 1);
                        this.recordState('Remove Option');
                        this.renderCanvas();
                        this.selectField(field.id, false);
                    } else {
                        alert('Field must have at least one option.');
                    }
                });
            });

            const addOptBtn = document.getElementById('btn-add-option');
            const newOptInp = document.getElementById('new-opt-val');
            if (addOptBtn && newOptInp) {
                const addOptHandler = () => {
                    const val = newOptInp.value.trim();
                    if (val) {
                        if (!field.options) field.options = [];
                        field.options.push(val);
                        this.recordState('Add Option');
                        this.renderCanvas();
                        this.selectField(field.id, false);
                    }
                };
                addOptBtn.addEventListener('click', addOptHandler);
                newOptInp.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addOptHandler();
                    }
                });
            }
        }

        // Conditional Logic Listeners
        const condToggle = document.getElementById('prop-conditional-toggle');
        const condPanel = document.getElementById('conditional-config-panel');
        const condField = document.getElementById('prop-cond-field');
        const condOp = document.getElementById('prop-cond-operator');
        const condVal = document.getElementById('prop-cond-value');
        const condPreset = document.getElementById('prop-cond-preset');

        if (condPreset && condVal) {
            condPreset.addEventListener('change', (e) => {
                if (e.target.value) {
                    condVal.value = e.target.value;
                    updateConditional();
                }
            });
        }

        if (condToggle && condPanel) {
            condToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    condPanel.style.display = 'block';
                    field.conditional = {
                        show_if: {
                            field: condField ? condField.value : '',
                            operator: condOp ? condOp.value : 'equals',
                            value: condVal ? condVal.value : ''
                        }
                    };
                } else {
                    condPanel.style.display = 'none';
                    delete field.conditional;
                }
                this.recordState('Toggle Conditional Logic');
                this.renderCanvas();
            });
        }

        const updateConditional = () => {
            if (field.conditional && field.conditional.show_if) {
                field.conditional.show_if.field = condField ? condField.value : '';
                field.conditional.show_if.operator = condOp ? condOp.value : 'equals';
                field.conditional.show_if.value = condVal ? condVal.value : '';
                this.recordState('Configure Conditional Rule');
                this.renderCanvas();
            }
        };

        if (condField) {
            condField.addEventListener('change', () => {
                updateConditional();
                this.renderFieldProperties(field, section, parentContainer);
            });
        }
        if (condOp) condOp.addEventListener('change', updateConditional);
        if (condVal) condVal.addEventListener('change', updateConditional);

        // Action Buttons
        const copyJsonBtn = document.getElementById('btn-prop-copy-json');
        if (copyJsonBtn) {
            copyJsonBtn.addEventListener('click', (e) => this.copyFieldJson(field, e.currentTarget));
        }

        const dupBtn = document.getElementById('btn-prop-dup');
        if (dupBtn) {
            dupBtn.addEventListener('click', () => this.duplicateField(field.id));
        }

        const delBtn = document.getElementById('btn-prop-del');
        if (delBtn) {
            delBtn.addEventListener('click', () => this.deleteField(field.id));
        }
    }

    renderFormProperties() {
        if (!this.dom.properties || !this.currentForm) return;

        const t = (k, fb) => (window.i18n ? window.i18n.t(k, fb) : fb);

        const totalFields = (this.currentForm.sections || []).reduce((acc, sec) => acc + (sec.fields ? sec.fields.length : (sec.type === 'medical_section' ? 7 : 0)), 0);
        const requiredCount = (this.currentForm.sections || []).reduce((acc, sec) => acc + (sec.fields ? sec.fields.filter(f => f.required).length : 0), 0);

        this.dom.properties.innerHTML = `
            <div class="properties-header">
                <h3>${t('overview.title', 'Form Overview')}</h3>
                <p class="prop-subtitle">${t('overview.subtitle', 'Select any field or section on the canvas to configure')}</p>
            </div>

            <div class="prop-body">
                <div class="form-stats-grid">
                    <div class="stat-card">
                        <span class="stat-number">${this.currentForm.sections?.length || 0}</span>
                        <span class="stat-label">${t('overview.sections_count', 'Sections')}</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${totalFields}</span>
                        <span class="stat-label">${t('overview.total_fields', 'Total Fields')}</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${requiredCount}</span>
                        <span class="stat-label">${t('overview.required', 'Required')}</span>
                    </div>
                </div>

                <div class="prop-group">
                    <label>${t('overview.form_name', 'Form Name')}</label>
                    <input type="text" id="prop-form-name" class="prop-input" value="${this.escapeHtml(this.currentForm.name || '')}">
                </div>

                <div class="prop-group">
                    <label>${t('overview.form_category', 'Form Category')}</label>
                    <select id="prop-form-cat" class="prop-input">
                        <option value="Tattoo" ${this.currentForm.category === 'Tattoo' ? 'selected' : ''}>${t('overview.category_tattoo', 'Tattoo')}</option>
                        <option value="Piercing" ${this.currentForm.category === 'Piercing' ? 'selected' : ''}>${t('overview.category_piercing', 'Piercing')}</option>
                        <option value="Legal" ${this.currentForm.category === 'Legal' ? 'selected' : ''}>${t('overview.category_legal', 'Legal / Waiver')}</option>
                        <option value="Custom" ${this.currentForm.category === 'Custom' ? 'selected' : ''}>${t('overview.category_custom', 'Custom')}</option>
                    </select>
                </div>

                <div class="prop-group">
                    <label>${t('overview.form_description', 'Description / Instructions')}</label>
                    <textarea id="prop-form-desc" class="prop-input" rows="3">${this.escapeHtml(this.currentForm.description || '')}</textarea>
                </div>

                <!-- PDF & Automation Settings -->
                <div class="prop-group toggle-group" style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px 12px; border-radius: 8px; margin-top: 14px;">
                    <div class="toggle-info">
                        <label for="prop-form-print-after-sig" class="toggle-label" style="color: #166534; font-weight: 700;">${t('overview.print_after_sig', '🖨️ Print after Signature')}</label>
                        <small class="toggle-desc" style="color: #15803d;">${t('overview.print_after_sig_desc', "Automatically trigger the browser's print dialog once a client completes their signature capture")}</small>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="prop-form-print-after-sig" ${this.currentForm.printAfterSignature ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>

                <div class="quick-tips-card">
                    <h4>${t('overview.studio_tips_title', '💡 Professional Studio Tips')}</h4>
                    <ul>
                        <li><strong>${t('overview.tip_validation_title', 'Validation:')}</strong> ${t('overview.tip_validation', 'Configure email, phone, and date checks to prevent client input mistakes.')}</li>
                        <li><strong>${t('overview.tip_logic_title', 'Dependency Logic:')}</strong> ${t('overview.tip_logic', 'Show/hide fields conditionally when a preceding radio or select option is chosen.')}</li>
                        <li><strong>${t('overview.tip_containers_title', 'Containers:')}</strong> ${t('overview.tip_containers', 'Group fields into collapsible panels for clean client intake navigation.')}</li>
                        <li><strong>${t('overview.tip_autoprint_title', 'Auto-Print:')}</strong> ${t('overview.tip_autoprint', 'Enable \'Print after Signature\' to streamline immediate physical paper filing.')}</li>
                        <li><strong>${t('overview.tip_autosave_title', 'Auto-Save:')}</strong> ${t('overview.tip_autosave', 'All modifications are saved to local storage continuously.')}</li>
                    </ul>
                </div>
            </div>
        `;

        const nameInp = document.getElementById('prop-form-name');
        if (nameInp) {
            nameInp.addEventListener('change', (e) => {
                this.currentForm.name = e.target.value;
                this.recordState('Change Form Name');
                this.renderCanvas();
            });
        }

        const catSelect = document.getElementById('prop-form-cat');
        if (catSelect) {
            catSelect.addEventListener('change', (e) => {
                this.currentForm.category = e.target.value;
                this.recordState('Change Form Category');
                this.renderCanvas();
            });
        }

        const descInp = document.getElementById('prop-form-desc');
        if (descInp) {
            descInp.addEventListener('change', (e) => {
                this.currentForm.description = e.target.value;
                this.recordState('Change Form Description');
                this.renderCanvas();
            });
        }

        const printSigToggle = document.getElementById('prop-form-print-after-sig');
        if (printSigToggle) {
            printSigToggle.addEventListener('change', (e) => {
                this.currentForm.printAfterSignature = e.target.checked;
                this.recordState(this.currentForm.printAfterSignature ? 'Enable Print after Signature' : 'Disable Print after Signature');
            });
        }
    }
    // ==========================================
    // SECTION HEADER NESTED FIELD COUNT
    // ==========================================

    getSectionHeaderNestedCount(section, headerFieldId) {
        if (!section || !section.fields) return 0;
        const headerIndex = section.fields.findIndex(f => f.id === headerFieldId);
        if (headerIndex === -1) return 0;
        let count = 0;
        for (let i = headerIndex + 1; i < section.fields.length; i++) {
            const nextField = section.fields[i];
            if (nextField.type === 'section_header') break;
            count++;
            if (nextField.type === 'container' && Array.isArray(nextField.fields)) {
                count += nextField.fields.length;
            }
        }
        return count;
    }

    // ==========================================
    // PDF & PRINT AUTOMATION SETTINGS MODAL
    // ==========================================

    initPDFSettingsModal() {
        const modal = document.getElementById('pdf-settings-modal');
        if (!modal) return;

        const openBtn = document.getElementById('btn-open-pdf-settings');
        const closeBtn = document.getElementById('btn-close-pdf-settings-modal');
        const cancelBtn = document.getElementById('btn-cancel-pdf-settings');
        const saveBtn = document.getElementById('btn-save-pdf-settings');

        const watermarkEnable = document.getElementById('pdf-setting-watermark-enable');
        const logoInput = document.getElementById('pdf-setting-logo-input');
        const logoDropzone = document.getElementById('pdf-logo-dropzone');
        const logoEmptyView = document.getElementById('pdf-logo-empty-view');
        const logoPreviewView = document.getElementById('pdf-logo-preview-view');
        const logoPreviewImg = document.getElementById('pdf-logo-preview-img');
        const logoFilename = document.getElementById('pdf-logo-filename');
        const changeLogoBtn = document.getElementById('btn-change-pdf-logo');
        const removeLogoBtn = document.getElementById('btn-remove-pdf-logo');
        const watermarkControls = document.getElementById('pdf-watermark-controls-wrap');
        const watermarkOpacity = document.getElementById('pdf-setting-watermark-opacity');
        const watermarkSize = document.getElementById('pdf-setting-watermark-size');
        const printAfterSig = document.getElementById('pdf-setting-print-after-sig');
        const paperSize = document.getElementById('pdf-setting-paper-size');
        const orientation = document.getElementById('pdf-setting-orientation');
        const densityRadios = document.querySelectorAll('input[name="pdf-setting-density"]');
        const densityCardStandard = document.getElementById('label-density-standard');
        const densityCardCompact = document.getElementById('label-density-compact');

        let currentLogoData = null;
        let currentLogoName = '';

        const updateDensityCardUI = (densityValue) => {
            const isCompact = densityValue === 'compact';
            if (densityCardStandard) {
                densityCardStandard.classList.toggle('active', !isCompact);
                densityCardStandard.style.borderColor = !isCompact ? '#2563eb' : '#cbd5e1';
                densityCardStandard.style.background = !isCompact ? '#eff6ff' : '#ffffff';
            }
            if (densityCardCompact) {
                densityCardCompact.classList.toggle('active', isCompact);
                densityCardCompact.style.borderColor = isCompact ? '#2563eb' : '#cbd5e1';
                densityCardCompact.style.background = isCompact ? '#eff6ff' : '#ffffff';
            }
            const radioToSelect = Array.from(densityRadios).find(r => r.value === densityValue);
            if (radioToSelect) radioToSelect.checked = true;
        };

        densityRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                updateDensityCardUI(e.target.value);
            });
        });

        const loadSettingsIntoModal = () => {
            let settings = {
                paperSize: 'a4',
                orientation: 'portrait',
                watermarkEnabled: true,
                watermarkOpacity: 0.15,
                watermarkDiameter: 80,
                watermarkLogoData: null,
                watermarkLogoName: '',
                printAfterSignature: false,
                layoutDensity: 'standard'
            };

            try {
                const saved = localStorage.getItem('poli_pdf_generator_settings');
                if (saved) {
                    settings = Object.assign(settings, JSON.parse(saved));
                }
            } catch (e) {
                console.warn('Could not read PDF settings:', e);
            }

            if (this.currentForm?.printAfterSignature !== undefined) {
                settings.printAfterSignature = this.currentForm.printAfterSignature;
            }

            if (watermarkEnable) watermarkEnable.checked = settings.watermarkEnabled !== false;
            if (watermarkOpacity) watermarkOpacity.value = String(settings.watermarkOpacity || 0.15);
            if (watermarkSize) watermarkSize.value = String(settings.watermarkDiameter || 80);
            if (printAfterSig) printAfterSig.checked = !!settings.printAfterSignature;
            if (paperSize) paperSize.value = settings.paperSize || 'a4';
            if (orientation) orientation.value = settings.orientation || 'portrait';

            updateDensityCardUI(settings.layoutDensity || 'standard');

            currentLogoData = settings.watermarkLogoData || null;
            currentLogoName = settings.watermarkLogoName || '';

            updateWatermarkViews();
        };

        const updateWatermarkViews = () => {
            const isEnabled = watermarkEnable ? watermarkEnable.checked : true;
            if (logoDropzone) logoDropzone.style.display = isEnabled ? 'block' : 'none';
            if (watermarkControls) watermarkControls.style.display = isEnabled ? 'grid' : 'none';

            if (currentLogoData) {
                if (logoEmptyView) logoEmptyView.style.display = 'none';
                if (logoPreviewView) logoPreviewView.style.display = 'flex';
                if (logoPreviewImg) logoPreviewImg.src = currentLogoData;
                if (logoFilename) logoFilename.textContent = currentLogoName || 'studio_logo.png';
            } else {
                if (logoEmptyView) logoEmptyView.style.display = 'block';
                if (logoPreviewView) logoPreviewView.style.display = 'none';
                if (logoPreviewImg) logoPreviewImg.src = '';
                if (logoFilename) logoFilename.textContent = '';
            }
        };

        if (watermarkEnable) {
            watermarkEnable.addEventListener('change', updateWatermarkViews);
        }

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                loadSettingsIntoModal();
                modal.style.display = 'flex';
            });
        }

        if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
        if (cancelBtn) cancelBtn.addEventListener('click', () => modal.style.display = 'none');

        const handleLogoFile = (file) => {
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert('Please upload a valid image file (PNG, JPEG, WebP, SVG).');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                currentLogoData = e.target.result;
                currentLogoName = file.name;
                updateWatermarkViews();
            };
            reader.readAsDataURL(file);
        };

        if (logoDropzone) {
            logoDropzone.addEventListener('click', (e) => {
                if (e.target.closest('#btn-change-pdf-logo') || e.target.closest('#btn-remove-pdf-logo')) return;
                if (logoInput) logoInput.click();
            });

            logoDropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                logoDropzone.style.borderColor = 'var(--primary-color, #2563eb)';
                logoDropzone.style.background = '#eff6ff';
            });

            logoDropzone.addEventListener('dragleave', () => {
                logoDropzone.style.borderColor = '#cbd5e1';
                logoDropzone.style.background = '#ffffff';
            });

            logoDropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                logoDropzone.style.borderColor = '#cbd5e1';
                logoDropzone.style.background = '#ffffff';
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleLogoFile(e.dataTransfer.files[0]);
                }
            });
        }

        if (logoInput) {
            logoInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    handleLogoFile(e.target.files[0]);
                    e.target.value = '';
                }
            });
        }

        if (changeLogoBtn) {
            changeLogoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (logoInput) logoInput.click();
            });
        }

        if (removeLogoBtn) {
            removeLogoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentLogoData = null;
                currentLogoName = '';
                updateWatermarkViews();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const selectedDensityRadio = document.querySelector('input[name="pdf-setting-density"]:checked');
                const densityVal = selectedDensityRadio ? selectedDensityRadio.value : 'standard';

                const settings = {
                    paperSize: paperSize ? paperSize.value : 'a4',
                    orientation: orientation ? orientation.value : 'portrait',
                    watermarkEnabled: watermarkEnable ? watermarkEnable.checked : true,
                    watermarkOpacity: watermarkOpacity ? parseFloat(watermarkOpacity.value) : 0.15,
                    watermarkDiameter: watermarkSize ? parseInt(watermarkSize.value, 10) : 80,
                    watermarkLogoData: currentLogoData,
                    watermarkLogoName: currentLogoName,
                    printAfterSignature: printAfterSig ? printAfterSig.checked : false,
                    layoutDensity: densityVal
                };

                try {
                    localStorage.setItem('poli_pdf_generator_settings', JSON.stringify(settings));
                } catch (e) {
                    console.warn('Could not save PDF settings to localStorage:', e);
                }

                if (this.currentForm) {
                    this.currentForm.printAfterSignature = settings.printAfterSignature;
                }

                modal.style.display = 'none';
                this.showToast('PDF & Print Automation settings saved successfully', 'success');
            });
        }
    }

    // ==========================================
    // MARQUEE RECTANGULAR SELECTION
    // ==========================================

    initMarqueeSelection() {
        const canvas = this.dom.canvas;
        if (!canvas) return;

        let isMarqueeActive = false;
        let startX = 0;
        let startY = 0;
        let marqueeEl = null;

        canvas.addEventListener('mousedown', (e) => {
            // Only trigger marquee on primary left click
            if (e.button !== 0) return;

            // Do not trigger marquee if clicking inside an interactive element or field control button
            const isControl = e.target.closest('button, input, select, textarea, a, .field-control-action, .field-move-btn, .drag-handle, .sortable-handle, .custom-control, .form-field-card-header');
            if (isControl) return;

            // If clicking directly on a field wrapper and no modifier key is pressed, let normal field selection handle it
            const targetField = e.target.closest('.form-field-wrapper');
            if (targetField && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                return;
            }

            startX = e.clientX;
            startY = e.clientY;

            const onMouseMove = (moveEvent) => {
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (!isMarqueeActive && dist > 5) {
                    isMarqueeActive = true;
                    if (!marqueeEl) {
                        marqueeEl = document.createElement('div');
                        marqueeEl.className = 'marquee-selection-box';
                        document.body.appendChild(marqueeEl);
                    }
                }

                if (isMarqueeActive && marqueeEl) {
                    const left = Math.min(startX, moveEvent.clientX);
                    const top = Math.min(startY, moveEvent.clientY);
                    const width = Math.abs(dx);
                    const height = Math.abs(dy);

                    marqueeEl.style.left = `${left}px`;
                    marqueeEl.style.top = `${top}px`;
                    marqueeEl.style.width = `${width}px`;
                    marqueeEl.style.height = `${height}px`;

                    const marqueeRect = {
                        left,
                        top,
                        right: left + width,
                        bottom: top + height
                    };

                    const fieldEls = canvas.querySelectorAll('.form-field-wrapper');
                    const newlySelected = new Set();

                    fieldEls.forEach(fEl => {
                        const fRect = fEl.getBoundingClientRect();
                        const intersects = !(
                            fRect.right < marqueeRect.left ||
                            fRect.left > marqueeRect.right ||
                            fRect.bottom < marqueeRect.top ||
                            fRect.top > marqueeRect.bottom
                        );

                        const fId = fEl.getAttribute('data-field-id');
                        if (fId) {
                            if (intersects) {
                                newlySelected.add(fId);
                                fEl.classList.add('multi-selected');
                            } else if (!moveEvent.shiftKey) {
                                fEl.classList.remove('multi-selected');
                            }
                        }
                    });

                    if (moveEvent.shiftKey) {
                        newlySelected.forEach(id => this.selectedFieldIds.add(id));
                    } else {
                        this.selectedFieldIds = newlySelected;
                    }

                    if (this.selectedFieldIds.size === 1) {
                        this.selectedFieldId = [...this.selectedFieldIds][0];
                    } else if (this.selectedFieldIds.size > 1) {
                        this.selectedFieldId = null;
                    }
                }
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);

                if (marqueeEl && marqueeEl.parentNode) {
                    marqueeEl.parentNode.removeChild(marqueeEl);
                    marqueeEl = null;
                }

                if (isMarqueeActive) {
                    isMarqueeActive = false;
                    this.renderCanvas();
                    this.updatePropertiesPanel();
                }
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    // ==========================================
    // THEME CUSTOMIZER & STYLING
    // ==========================================

    initThemeCustomizer() {
        const modal = document.getElementById('theme-customizer-modal');
        if (!modal) return;

        const openBtn = document.getElementById('btn-theme-customizer');
        const closeBtn = document.getElementById('btn-close-theme-modal');
        const cancelBtn = document.getElementById('btn-cancel-theme-modal');
        const applyBtn = document.getElementById('btn-apply-theme-modal');
        const resetBtn = document.getElementById('btn-reset-theme-defaults');

        const colorSwatches = document.querySelectorAll('#theme-color-swatches .theme-swatch-btn');
        const customColorPicker = document.getElementById('theme-custom-color-picker');
        const customColorText = document.getElementById('theme-custom-color-text');
        const fontSizeBtns = document.querySelectorAll('#theme-font-size-group .theme-pill-btn');
        const radiusBtns = document.querySelectorAll('#theme-radius-group .theme-pill-btn');
        const previewBox = document.getElementById('theme-live-preview-box');

        let selectedColor = '#2563eb';
        let selectedFontSize = '16px';
        let selectedRadius = '8px';

        const updatePreview = () => {
            if (previewBox) {
                previewBox.style.setProperty('--preview-sample-primary', selectedColor);
                previewBox.style.setProperty('--preview-sample-radius', selectedRadius);
                previewBox.style.setProperty('--preview-sample-font-size', selectedFontSize);
            }
            if (customColorPicker) customColorPicker.value = selectedColor;
            if (customColorText) customColorText.value = selectedColor;

            colorSwatches.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-color') === selectedColor);
            });
            fontSizeBtns.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-size') === selectedFontSize);
            });
            radiusBtns.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-radius') === selectedRadius);
            });
        };

        const loadThemeSettings = () => {
            let theme = this.currentForm?.theme || {};
            try {
                const saved = localStorage.getItem('poli_builder_theme_customization');
                if (saved) theme = { ...JSON.parse(saved), ...theme };
            } catch (e) {}

            selectedColor = theme.primaryColor || '#2563eb';
            selectedFontSize = theme.fontSize || '16px';
            selectedRadius = theme.borderRadius || '8px';
            updatePreview();
        };

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                loadThemeSettings();
                modal.style.display = 'flex';
            });
        }

        const closeModal = () => {
            modal.style.display = 'none';
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

        colorSwatches.forEach(btn => {
            btn.addEventListener('click', () => {
                selectedColor = btn.getAttribute('data-color') || '#2563eb';
                updatePreview();
            });
        });

        if (customColorPicker) {
            customColorPicker.addEventListener('input', (e) => {
                selectedColor = e.target.value;
                updatePreview();
            });
        }

        if (customColorText) {
            customColorText.addEventListener('input', (e) => {
                const val = e.target.value.trim();
                if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                    selectedColor = val;
                    updatePreview();
                }
            });
        }

        fontSizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                selectedFontSize = btn.getAttribute('data-size') || '16px';
                updatePreview();
            });
        });

        radiusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                selectedRadius = btn.getAttribute('data-radius') || '8px';
                updatePreview();
            });
        });

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                selectedColor = '#2563eb';
                selectedFontSize = '16px';
                selectedRadius = '8px';
                updatePreview();
                this.showToast(window.i18n ? window.i18n.t('messages.theme_reset_toast', 'Reset theme to system defaults') : 'Reset theme to system defaults', 'info');
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const theme = {
                    primaryColor: selectedColor,
                    fontSize: selectedFontSize,
                    borderRadius: selectedRadius
                };

                if (this.currentForm) {
                    this.currentForm.theme = theme;
                }

                try {
                    localStorage.setItem('poli_builder_theme_customization', JSON.stringify(theme));
                } catch (e) {}

                this.applyTheme(theme);
                this.recordState('Updated Form Styling & Theme');
                this.renderCanvas();
                closeModal();
                this.showToast(window.i18n ? window.i18n.t('messages.theme_applied_toast', 'Theme styling applied to consultation form!') : 'Theme styling applied to consultation form!', 'success');
            });
        }

        // Apply theme on initialization
        loadThemeSettings();
        this.applyTheme({
            primaryColor: selectedColor,
            fontSize: selectedFontSize,
            borderRadius: selectedRadius
        });
    }

    applyTheme(theme) {
        if (!theme) return;
        const root = document.documentElement;
        if (theme.primaryColor) {
            root.style.setProperty('--color-primary', theme.primaryColor);
            root.style.setProperty('--brand-primary', theme.primaryColor);
            root.style.setProperty('--primary-500', theme.primaryColor);
            root.style.setProperty('--primary-600', theme.primaryColor);
        }
        if (theme.borderRadius) {
            root.style.setProperty('--brand-border-radius', theme.borderRadius);
            root.style.setProperty('--radius-base', theme.borderRadius);
        }
        if (theme.fontSize) {
            root.style.setProperty('--brand-font-size', theme.fontSize);
            root.style.setProperty('--font-size-base', theme.fontSize);
        }
    }

    // ==========================================
    // FIELD LOOKUP & UTILITY HELPERS
    // ==========================================

    findField(fieldId) {
        return this.findFieldAndSection(fieldId);
    }

    capitalize(str) {
        if (!str) return '';
        const s = String(str);
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    jumpToProperty(keyword) {
        if (!keyword || !this.dom.properties) return;
        const search = String(keyword).toLowerCase();
        const elements = this.dom.properties.querySelectorAll('.prop-group, .form-group, label, input, select, textarea');
        let target = null;
        for (const el of elements) {
            const text = ((el.textContent || '') + ' ' + (el.getAttribute('name') || '') + ' ' + (el.getAttribute('id') || '')).toLowerCase();
            if (text.includes(search)) {
                target = el;
                break;
            }
        }
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.classList.add('prop-highlight-pulse');
            setTimeout(() => target.classList.remove('prop-highlight-pulse'), 1800);
            if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
                target.focus();
            }
        }
    }

    updatePropertiesPanel() {
        if (this.selectedFieldId) {
            const found = this.findFieldAndSection(this.selectedFieldId);
            if (found && found.field) {
                this.renderFieldProperties(found.field, found.section, found.parentContainer);
            } else {
                this.selectedFieldId = null;
                this.renderFormProperties();
            }
        } else if (this.selectedSectionId) {
            const sec = this.currentForm?.sections?.find(s => s.id === this.selectedSectionId);
            if (sec) {
                this.renderSectionProperties(sec);
            } else {
                this.selectedSectionId = null;
                this.renderFormProperties();
            }
        } else {
            this.renderFormProperties();
        }
    }

    // ==========================================
    // UTILITY & TOAST NOTIFICATIONS
    // ==========================================

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    showToast(message, type = 'info') {
        let toast = document.getElementById('app-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'app-toast';
            document.body.appendChild(toast);
        }

        toast.className = `app-toast toast-${type} toast-show`;
        toast.textContent = message;

        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('toast-show');
        }, 2600);
    }
}

// Global instance 
window.FormBuilderApp = new FormBuilder();

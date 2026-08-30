/**
 * Multi-Session Planner & Versioning Engine
 * Poli International - Studio Consultation Form Builder
 * Allows saving, restoring, switching, and archiving multiple draft versions and project iterations.
 */

const MultiSessionPlanner = {
    STORAGE_KEY: 'poli_multisession_versions',

    init: () => {
        MultiSessionPlanner.bindEvents();
        MultiSessionPlanner.ensureSeedVersions();
    },

    bindEvents: () => {
        // Planner Header Button
        const triggerBtn = document.getElementById('btn-multisession-planner');
        if (triggerBtn) {
            triggerBtn.addEventListener('click', () => MultiSessionPlanner.openModal());
        }

        // Modal Close Buttons
        const closeBtn = document.getElementById('close-multisession-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => MultiSessionPlanner.closeModal());
        }

        const doneBtn = document.getElementById('btn-close-multisession-done');
        if (doneBtn) {
            doneBtn.addEventListener('click', () => MultiSessionPlanner.closeModal());
        }

        // Save Current Version Button
        const saveBtn = document.getElementById('btn-save-new-version');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => MultiSessionPlanner.handleSaveCurrent());
        }

        // Filter / Search Input
        const searchInput = document.getElementById('multisession-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                MultiSessionPlanner.renderVersionList(e.target.value);
            });
        }

        // Open Compare Modal
        const compareBtn = document.getElementById('btn-open-multisession-compare');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => MultiSessionPlanner.openCompareModal());
        }

        const closeCompareBtn = document.getElementById('btn-close-compare-modal');
        if (closeCompareBtn) {
            closeCompareBtn.addEventListener('click', () => MultiSessionPlanner.closeCompareModal());
        }

        const doneCompareBtn = document.getElementById('btn-close-compare-done');
        if (doneCompareBtn) {
            doneCompareBtn.addEventListener('click', () => MultiSessionPlanner.closeCompareModal());
        }

        const backToListBtn = document.getElementById('btn-compare-back-to-list');
        if (backToListBtn) {
            backToListBtn.addEventListener('click', () => {
                MultiSessionPlanner.closeCompareModal();
                MultiSessionPlanner.openModal();
            });
        }

        const selectA = document.getElementById('compare-version-a');
        const selectB = document.getElementById('compare-version-b');
        if (selectA) {
            selectA.addEventListener('change', () => MultiSessionPlanner.renderDiff());
        }
        if (selectB) {
            selectB.addEventListener('change', () => MultiSessionPlanner.renderDiff());
        }
    },

    ensureSeedVersions: () => {
        const existing = MultiSessionPlanner.getAllVersions();
        if (existing.length === 0 && window.FormTemplates) {
            const tmpl = window.FormTemplates.TemplateManager.getTemplate('multisession_project') || 
                         window.FormTemplates.TemplateManager.getTemplate('tattoo_consent');
            if (tmpl) {
                const now = Date.now();
                const defaultVersions = [
                    {
                        id: `ver_${now - 86400000 * 2}`,
                        versionName: 'Session 1 - Concept, Consultation & Linework',
                        versionNameKey: 'multisession.session_1_name',
                        timestamp: now - 86400000 * 2,
                        dateFormatted: new Date(now - 86400000 * 2).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
                        formId: tmpl.id || 'tattoo_consent',
                        formName: tmpl.name,
                        category: tmpl.category || 'Tattoo',
                        notes: 'Initial client intake, medical screening, and outline stencil approval.',
                        notesKey: 'multisession.session_1_notes',
                        fieldCount: MultiSessionPlanner.countFields(tmpl),
                        sectionCount: (tmpl.sections || []).length,
                        formData: JSON.parse(JSON.stringify(tmpl))
                    },
                    {
                        id: `ver_${now - 86400000}`,
                        versionName: 'Session 2 - Black & Grey Shading / Wash Pass',
                        versionNameKey: 'multisession.session_2_name',
                        timestamp: now - 86400000,
                        dateFormatted: new Date(now - 86400000).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
                        formId: tmpl.id || 'tattoo_consent',
                        formName: tmpl.name,
                        category: tmpl.category || 'Tattoo',
                        notes: 'Secondary session check-in, updated skin healing verification, and shading.',
                        notesKey: 'multisession.session_2_notes',
                        fieldCount: MultiSessionPlanner.countFields(tmpl),
                        sectionCount: (tmpl.sections || []).length,
                        formData: JSON.parse(JSON.stringify(tmpl))
                    }
                ];
                localStorage.setItem(MultiSessionPlanner.STORAGE_KEY, JSON.stringify(defaultVersions));
            }
        }
    },

    countFields: (formObj) => {
        if (!formObj || !formObj.sections) return 0;
        let count = 0;
        formObj.sections.forEach(s => {
            if (s.fields) count += s.fields.length;
            if (s.type === 'medical_section') count += 15;
        });
        return count;
    },

    
    currentFilterTab: 'all',
    autoCheckpointSeq: 0,

    saveAutoCheckpoint: (formData, lastAction = 'Edit') => {
        if (!formData) return null;
        try {
            const now = Date.now();
            MultiSessionPlanner.autoCheckpointSeq++;
            const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const finalName = '⏱️ Checkpoint (Auto #' + MultiSessionPlanner.autoCheckpointSeq + ' - ' + timeStr + ')';
            const notes = 'Automatic checkpoint saved after 10 consecutive edits. (Last edit: ' + lastAction + ')';

            const newVersion = {
                id: 'chk_' + now + '_' + Math.random().toString(36).substr(2, 5),
                versionName: finalName,
                isAutoCheckpoint: true,
                timestamp: now,
                dateFormatted: new Date(now).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
                formId: formData.id || 'custom_form',
                formName: formData.name || 'Studio Form',
                category: formData.category || 'Custom',
                notes: notes,
                fieldCount: MultiSessionPlanner.countFields(formData),
                sectionCount: (formData.sections || []).length,
                formData: JSON.parse(JSON.stringify(formData))
            };

            const versions = MultiSessionPlanner.getAllVersions();
            const manualVersions = versions.filter(v => !v.isAutoCheckpoint);
            const autoVersions = versions.filter(v => v.isAutoCheckpoint);
            autoVersions.unshift(newVersion);
            const trimmedAutos = autoVersions.slice(0, 15);
            
            const combined = [...trimmedAutos, ...manualVersions].sort((a, b) => b.timestamp - a.timestamp);
            localStorage.setItem(MultiSessionPlanner.STORAGE_KEY, JSON.stringify(combined));

            if (window.FormBuilderApp) {
                const toastMsg = window.i18n ? window.i18n.t('multisession.checkpoint_saved') : '⏱️ Auto-checkpoint saved (10 consecutive changes)';
                window.FormBuilderApp.showToast(toastMsg, 'info');
            }

            const modal = document.getElementById('multisession-modal');
            if (modal && modal.style.display !== 'none') {
                MultiSessionPlanner.renderVersionList();
            }

            return newVersion;
        } catch (e) {
            console.warn('Failed to save auto-checkpoint:', e);
            return null;
        }
    },

    getAllVersions: () => {
        try {
            const raw = localStorage.getItem(MultiSessionPlanner.STORAGE_KEY);
            if (!raw) return [];
            const list = JSON.parse(raw);
            return Array.isArray(list) ? list.sort((a, b) => b.timestamp - a.timestamp) : [];
        } catch (e) {
            console.error('Failed to read multisession versions from localStorage:', e);
            return [];
        }
    },

    saveVersion: (versionName, notes = '', explicitFormData = null) => {
        const currentForm = explicitFormData || (window.FormBuilderApp && window.FormBuilderApp.currentForm);
        if (!currentForm) {
            if (typeof window !== 'undefined' && typeof window.alert === 'function') {
                window.alert('No active form configuration available to save.');
            }
            return null;
        }

        const now = Date.now();
        const finalName = (versionName && versionName.trim()) ? versionName.trim() : `Session Iteration ${new Date(now).toLocaleDateString()}`;

        const newVersion = {
            id: `ver_${now}_${Math.random().toString(36).substr(2, 5)}`,
            versionName: finalName,
            timestamp: now,
            dateFormatted: new Date(now).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
            formId: currentForm.id || 'custom_form',
            formName: currentForm.name || 'Studio Form',
            category: currentForm.category || 'Custom',
            notes: (notes || '').trim(),
            fieldCount: MultiSessionPlanner.countFields(currentForm),
            sectionCount: (currentForm.sections || []).length,
            formData: JSON.parse(JSON.stringify(currentForm))
        };

        const versions = MultiSessionPlanner.getAllVersions();
        versions.unshift(newVersion);
        localStorage.setItem(MultiSessionPlanner.STORAGE_KEY, JSON.stringify(versions));

        if (window.FormBuilderApp && typeof window.FormBuilderApp.showToast === 'function') {
            const toastMsg = window.i18n ? window.i18n.t('multisession.toast_saved', { name: finalName }, `Saved version "${finalName}" to Multi-Session Planner!`) : `Saved version "${finalName}" to Multi-Session Planner!`;
            window.FormBuilderApp.showToast(toastMsg, 'success');
        }

        return newVersion;
    },

    restoreVersion: (versionId) => {
        const versions = MultiSessionPlanner.getAllVersions();
        const target = versions.find(v => v.id === versionId);
        if (!target || !target.formData) {
            const notFoundMsg = window.i18n ? window.i18n.t('multisession.alert_not_found', 'Selected version could not be found.') : 'Selected version could not be found.';
            if (typeof window !== 'undefined' && typeof window.alert === 'function') {
                window.alert(notFoundMsg);
            }
            return;
        }

        if (window.FormBuilderApp) {
            const dispName = (target.versionNameKey && window.i18n) ? window.i18n.t(target.versionNameKey, target.versionName) : target.versionName;
            window.FormBuilderApp.loadForm(target.formData, `Restored Version: ${dispName}`);
            const toastMsg = window.i18n ? window.i18n.t('multisession.toast_switched', { name: dispName }, `Switched to "${dispName}"`) : `Switched to "${dispName}"`;
            window.FormBuilderApp.showToast(toastMsg, 'success');
            MultiSessionPlanner.closeModal();

            // Update template selector to custom or match ID
            const sel = document.getElementById('template-select');
            if (sel && target.formData.id) {
                const opt = Array.from(sel.options).find(o => o.value === target.formData.id);
                if (opt) sel.value = target.formData.id;
            }
        }
    },

    switchVersion: (versionId) => {
        return MultiSessionPlanner.restoreVersion(versionId);
    },

    deleteVersion: (versionId) => {
        const versions = MultiSessionPlanner.getAllVersions();
        const target = versions.find(v => v.id === versionId);
        if (!target) return;

        const dispName = (target.versionNameKey && window.i18n) ? window.i18n.t(target.versionNameKey, target.versionName) : target.versionName;
        const confirmMsg = window.i18n ? window.i18n.t('multisession.confirm_delete', { name: dispName }, `Are you sure you want to delete "${dispName}"?`) : `Are you sure you want to delete "${dispName}"?`;
        const userConfirmed = (typeof window !== 'undefined' && typeof window.confirm === 'function') ? window.confirm(confirmMsg) : true;
        if (userConfirmed) {
            const updated = versions.filter(v => v.id !== versionId);
            localStorage.setItem(MultiSessionPlanner.STORAGE_KEY, JSON.stringify(updated));
            MultiSessionPlanner.renderVersionList();
            if (window.FormBuilderApp && typeof window.FormBuilderApp.showToast === 'function') {
                const toastMsg = window.i18n ? window.i18n.t('multisession.toast_deleted', { name: dispName }, `Deleted version "${dispName}"`) : `Deleted version "${dispName}"`;
                window.FormBuilderApp.showToast(toastMsg, 'info');
            }
        }
    },

    duplicateVersion: (versionId) => {
        const versions = MultiSessionPlanner.getAllVersions();
        const target = versions.find(v => v.id === versionId);
        if (!target) return;

        const dispName = (target.versionNameKey && window.i18n) ? window.i18n.t(target.versionNameKey, target.versionName) : target.versionName;
        const copyName = window.i18n ? window.i18n.t('multisession.copy_of_prefix', { name: dispName }, `Copy of ${dispName}`) : `Copy of ${dispName}`;
        const now = Date.now();
        const clone = JSON.parse(JSON.stringify(target));
        clone.id = `ver_${now}_${Math.random().toString(36).substr(2, 5)}`;
        clone.versionName = copyName;
        delete clone.versionNameKey;
        delete clone.notesKey;
        clone.timestamp = now;
        clone.dateFormatted = new Date(now).toLocaleString(window.i18n && window.i18n.currentLanguage ? window.i18n.currentLanguage : 'en', { dateStyle: 'medium', timeStyle: 'short' });

        versions.unshift(clone);
        localStorage.setItem(MultiSessionPlanner.STORAGE_KEY, JSON.stringify(versions));
        MultiSessionPlanner.renderVersionList();

        if (window.FormBuilderApp && typeof window.FormBuilderApp.showToast === 'function') {
            const toastMsg = window.i18n ? window.i18n.t('multisession.toast_duplicated', { name: dispName }, `Duplicated "${dispName}"`) : `Duplicated "${dispName}"`;
            window.FormBuilderApp.showToast(toastMsg, 'success');
        }
    },

    renameVersion: (versionId) => {
        const versions = MultiSessionPlanner.getAllVersions();
        const target = versions.find(v => v.id === versionId);
        if (!target) return;

        const currentDisp = (target.versionNameKey && window.i18n) ? window.i18n.t(target.versionNameKey, target.versionName) : target.versionName;
        const promptMsg = window.i18n ? window.i18n.t('multisession.prompt_rename', 'Enter updated name for this project version:') : 'Enter updated name for this project version:';
        const newName = (typeof window !== 'undefined' && typeof window.prompt === 'function') ? window.prompt(promptMsg, currentDisp) : null;
        if (newName && newName.trim() && newName.trim() !== currentDisp) {
            target.versionName = newName.trim();
            delete target.versionNameKey;
            localStorage.setItem(MultiSessionPlanner.STORAGE_KEY, JSON.stringify(versions));
            MultiSessionPlanner.renderVersionList();
            if (window.FormBuilderApp && typeof window.FormBuilderApp.showToast === 'function') {
                const toastMsg = window.i18n ? window.i18n.t('multisession.toast_renamed', { name: target.versionName }, `Renamed to "${target.versionName}"`) : `Renamed to "${target.versionName}"`;
                window.FormBuilderApp.showToast(toastMsg, 'success');
            }
        }
    },

    exportVersionJSON: (versionId) => {
        const versions = MultiSessionPlanner.getAllVersions();
        const target = versions.find(v => v.id === versionId);
        if (!target || !target.formData) return;

        const jsonStr = JSON.stringify(target.formData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const cleanName = (target.versionName || 'session_form').toLowerCase().replace(/[^a-z0-9]/gi, '_');
        const filename = `${cleanName}_${new Date().toISOString().slice(0, 10)}.json`;

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    },

    handleSaveCurrent: () => {
        const nameInput = document.getElementById('new-version-name-input');
        const notesInput = document.getElementById('new-version-notes-input');

        const nameVal = nameInput ? nameInput.value : '';
        const notesVal = notesInput ? notesInput.value : '';

        if (!nameVal.trim()) {
            alert('Please enter a descriptive version or session name (e.g. "Session 1: Initial Linework").');
            if (nameInput) nameInput.focus();
            return;
        }

        MultiSessionPlanner.saveVersion(nameVal, notesVal);

        if (nameInput) nameInput.value = '';
        if (notesInput) notesInput.value = '';

        MultiSessionPlanner.renderVersionList();
    },

    openModal: () => {
        const modal = document.getElementById('multisession-modal');
        if (modal) {
            modal.style.display = 'flex';

            // Auto-populate default version name suggestion based on current form
            const nameInput = document.getElementById('new-version-name-input');
            if (nameInput && window.FormBuilderApp && window.FormBuilderApp.currentForm) {
                const currentName = window.FormBuilderApp.currentForm.name || 'Project';
                const count = MultiSessionPlanner.getAllVersions().length + 1;
                nameInput.value = `Session ${count} - ${currentName} (Iteration)`;
                nameInput.select();
            }

            MultiSessionPlanner.renderVersionList();
        }
    },

    closeModal: () => {
        const modal = document.getElementById('multisession-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    
    setFilterTab: (tab) => {
        MultiSessionPlanner.currentFilterTab = tab;
        const searchInput = document.getElementById('multisession-search-input');
        const query = searchInput ? searchInput.value : '';
        MultiSessionPlanner.renderVersionList(query);
    },

    renderVersionList: (query = '') => {
        const container = document.getElementById('multisession-versions-container');
        const countBadge = document.getElementById('multisession-count-badge');
        if (!container) return;

        const allVersions = MultiSessionPlanner.getAllVersions();
        const autoCount = allVersions.filter(v => v.isAutoCheckpoint).length;
        const manualCount = allVersions.filter(v => !v.isAutoCheckpoint).length;

        let filtered = allVersions;

        if (MultiSessionPlanner.currentFilterTab === 'checkpoints') {
            filtered = filtered.filter(v => v.isAutoCheckpoint);
        } else if (MultiSessionPlanner.currentFilterTab === 'manual') {
            filtered = filtered.filter(v => !v.isAutoCheckpoint);
        }

        if (countBadge) {
            const countStr = window.i18n ? window.i18n.t('multisession.saved_versions_count', { count: allVersions.length }) : (allVersions.length + ' Saved Version' + (allVersions.length === 1 ? '' : 's'));
            countBadge.textContent = countStr;
        }

        if (query && query.trim()) {
            const q = query.toLowerCase().trim();
            filtered = filtered.filter(v => 
                (v.versionName && v.versionName.toLowerCase().includes(q)) ||
                (v.formName && v.formName.toLowerCase().includes(q)) ||
                (v.notes && v.notes.toLowerCase().includes(q)) ||
                (v.category && v.category.toLowerCase().includes(q))
            );
        }

        const tabAllText = window.i18n ? window.i18n.t('multisession.tab_all', { count: allVersions.length }) : ('All Versions (' + allVersions.length + ')');
        const tabAutoText = window.i18n ? window.i18n.t('multisession.tab_auto_checkpoints', { count: autoCount }) : ('⏱️ Auto-Checkpoints (' + autoCount + ')');
        const tabManualText = window.i18n ? window.i18n.t('multisession.tab_manual_drafts', { count: manualCount }) : ('📌 Manual Drafts (' + manualCount + ')');

        let html = '<div class="multisession-tab-filter-bar">';
        html += '<button type="button" class="multisession-tab-btn ' + (MultiSessionPlanner.currentFilterTab === 'all' ? 'active' : '') + '" onclick="MultiSessionPlanner.setFilterTab(\'all\')">' + tabAllText + '</button>';
        html += '<button type="button" class="multisession-tab-btn ' + (MultiSessionPlanner.currentFilterTab === 'checkpoints' ? 'active' : '') + '" onclick="MultiSessionPlanner.setFilterTab(\'checkpoints\')">' + tabAutoText + '</button>';
        html += '<button type="button" class="multisession-tab-btn ' + (MultiSessionPlanner.currentFilterTab === 'manual' ? 'active' : '') + '" onclick="MultiSessionPlanner.setFilterTab(\'manual\')">' + tabManualText + '</button>';
        html += '</div>';

        if (filtered.length === 0) {
            const emptyTitle = window.i18n ? window.i18n.t('multisession.no_versions_title', 'No Matching Versions or Checkpoints Found') : 'No Matching Versions or Checkpoints Found';
            const emptyDesc = MultiSessionPlanner.currentFilterTab === 'checkpoints'
                ? (window.i18n ? window.i18n.t('multisession.no_checkpoints_desc', 'Checkpoints are automatically created every 10 changes as you edit your form.') : 'Checkpoints are automatically created every 10 changes as you edit your form.')
                : (window.i18n ? window.i18n.t('multisession.no_versions_desc', 'Use the form above to snapshot your current form layout as a multi-session checkpoint or draft iteration.') : 'Use the form above to snapshot your current form layout as a multi-session checkpoint or draft iteration.');

            html += '<div class="multisession-empty-state" style="text-align: center; padding: 2.5rem 1rem; color: #64748b; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px;">';
            html += '<div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📁</div>';
            html += '<h4 style="margin: 0 0 0.35rem 0; color: #334155; font-size: 1.05rem;">' + MultiSessionPlanner.escapeHtml(emptyTitle) + '</h4>';
            html += '<p style="font-size: 0.85rem; max-width: 420px; margin: 0 auto 1rem auto; line-height: 1.4;">' + MultiSessionPlanner.escapeHtml(emptyDesc) + '</p>';
            html += '</div>';
            container.innerHTML = html;
            return;
        }

        html += '<div class="multisession-grid" style="display: flex; flex-direction: column; gap: 0.85rem;">';

        filtered.forEach(v => {
            const isCheckpoint = !!v.isAutoCheckpoint;

            // Localized Category Badge
            let displayCategory = v.category || 'Tattoo';
            if (window.i18n) {
                const catKey = (v.category || 'tattoo').toLowerCase();
                const trCat = window.i18n.t(`template_categories.${catKey}`);
                if (trCat && trCat !== `template_categories.${catKey}`) {
                    displayCategory = trCat;
                }
            }

            const autoBadgeText = window.i18n ? window.i18n.t('multisession.auto_checkpoint_badge', '⏱️ Auto-Checkpoint') : '⏱️ Auto-Checkpoint';
            const badgeHtml = isCheckpoint
                ? '<span class="badge-auto-checkpoint" style="background: #f3e8ff; color: #6b21a8; font-weight: 700; font-size: 0.72rem; padding: 0.15rem 0.6rem; border-radius: 12px; border: 1px solid #d8b4fe;">' + autoBadgeText + '</span>'
                : '<span class="badge-table-section" style="background: #e0f2fe; color: #0369a1; font-weight: 700; font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 4px;">' + MultiSessionPlanner.escapeHtml(displayCategory) + '</span>';

            // Localized Version Name
            let displayName = v.versionName || '';
            if (v.versionNameKey && window.i18n) {
                displayName = window.i18n.t(v.versionNameKey);
            } else if (window.i18n) {
                if (displayName.includes('Session 1 - Concept, Consultation & Linework')) {
                    displayName = window.i18n.t('multisession.session_1_name');
                } else if (displayName.includes('Session 2 - Black & Grey Shading / Wash Pass')) {
                    displayName = window.i18n.t('multisession.session_2_name');
                }
            }

            // Localized Date Formatted
            let formattedDate = v.dateFormatted || '';
            if (v.timestamp && window.i18n) {
                try {
                    formattedDate = new Date(v.timestamp).toLocaleString(window.i18n.currentLanguage || 'en', { dateStyle: 'medium', timeStyle: 'short' });
                } catch (e) {
                    formattedDate = v.dateFormatted || '';
                }
            }

            // Localized Base Form Name
            let displayFormName = v.formName || '';
            if (v.formId && window.i18n) {
                const trTmpl = window.i18n.t(`templates.${v.formId}`);
                if (trTmpl && trTmpl !== `templates.${v.formId}`) {
                    displayFormName = trTmpl;
                }
            }
            const baseLabel = window.i18n ? window.i18n.t('multisession.base_label', 'Base:') : 'Base:';

            // Localized Sections and Fields Count
            const secCount = v.sectionCount || 0;
            const fldCount = v.fieldCount || 0;
            const sectionsFieldsStr = window.i18n 
                ? window.i18n.t('multisession.sections_fields_count', { sections: secCount, fields: fldCount })
                : `${secCount} Sections • ${fldCount} Fields`;

            // Localized Notes
            let displayNotes = v.notes || '';
            if (v.notesKey && window.i18n) {
                displayNotes = window.i18n.t(v.notesKey);
            } else if (window.i18n) {
                if (displayNotes.includes('Initial client intake, medical screening, and outline stencil approval')) {
                    displayNotes = window.i18n.t('multisession.session_1_notes');
                } else if (displayNotes.includes('Secondary session check-in, updated skin healing verification, and shading')) {
                    displayNotes = window.i18n.t('multisession.session_2_notes');
                }
            }

            // Localized Tooltips & Button Labels
            const restoreText = isCheckpoint 
                ? (window.i18n ? window.i18n.t('multisession.restore_checkpoint', '🔄 Restore Checkpoint') : '🔄 Restore Checkpoint')
                : (window.i18n ? window.i18n.t('multisession.switch_to_version', '🔄 Switch to Version') : '🔄 Switch to Version');
            const compareText = window.i18n ? window.i18n.t('multisession.compare_btn_text', '🔍 Compare') : '🔍 Compare';
            const loadTooltip = window.i18n ? window.i18n.t('multisession.load_version_tooltip', 'Load this version into the editor') : 'Load this version into the editor';
            const compareTooltip = window.i18n ? window.i18n.t('multisession.compare_tooltip', 'Compare this iteration with another version or active editor') : 'Compare this iteration with another version or active editor';
            const renameTooltip = window.i18n ? window.i18n.t('multisession.rename_tooltip', 'Rename Version') : 'Rename Version';
            const duplicateTooltip = window.i18n ? window.i18n.t('multisession.duplicate_tooltip', 'Duplicate Version') : 'Duplicate Version';
            const exportTooltip = window.i18n ? window.i18n.t('multisession.export_json_tooltip', 'Export this version as JSON') : 'Export this version as JSON';
            const deleteTooltip = window.i18n ? window.i18n.t('multisession.delete_tooltip', 'Delete Version') : 'Delete Version';

            html += '<div class="multisession-card ' + (isCheckpoint ? 'card-auto-checkpoint' : '') + '" style="background: ' + (isCheckpoint ? '#faf5ff' : 'white') + '; border: 1px solid ' + (isCheckpoint ? '#e9d5ff' : '#e2e8f0') + '; border-radius: 10px; padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03); transition: transform 0.15s ease, border-color 0.15s ease;">';
            html += '<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap;">';
            html += '<div>';
            html += '<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">';
            html += badgeHtml;
            html += '<h4 style="margin: 0; font-size: 1.05rem; font-weight: 700; color: #0f172a;">' + MultiSessionPlanner.escapeHtml(displayName) + '</h4>';
            html += '</div>';
            html += '<div style="display: flex; align-items: center; gap: 0.85rem; font-size: 0.78rem; color: #64748b;">';
            html += '<span>🕒 ' + MultiSessionPlanner.escapeHtml(formattedDate) + '</span>';
            html += '<span>📋 ' + MultiSessionPlanner.escapeHtml(baseLabel) + ' <strong>' + MultiSessionPlanner.escapeHtml(displayFormName) + '</strong></span>';
            html += '<span>🔢 ' + MultiSessionPlanner.escapeHtml(sectionsFieldsStr) + '</span>';
            html += '</div>';
            html += '</div>';

            html += '<div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">';
            html += '<button type="button" class="btn-primary" style="font-size: 0.82rem; padding: 0.35rem 0.85rem; display: flex; align-items: center; gap: 0.35rem; ' + (isCheckpoint ? 'background: #7c3aed;' : '') + '" onclick="MultiSessionPlanner.restoreVersion(\'' + v.id + '\')" title="' + MultiSessionPlanner.escapeHtml(loadTooltip) + '">';
            html += restoreText;
            html += '</button>';
            html += '<button type="button" class="btn-secondary" style="font-size: 0.8rem; padding: 0.35rem 0.65rem;" onclick="MultiSessionPlanner.openCompareModal(\'' + v.id + '\')" title="' + MultiSessionPlanner.escapeHtml(compareTooltip) + '">' + compareText + '</button>';
            html += '<button type="button" class="btn-secondary" style="font-size: 0.8rem; padding: 0.35rem 0.6rem;" onclick="MultiSessionPlanner.renameVersion(\'' + v.id + '\')" title="' + MultiSessionPlanner.escapeHtml(renameTooltip) + '">✏️</button>';
            html += '<button type="button" class="btn-secondary" style="font-size: 0.8rem; padding: 0.35rem 0.6rem;" onclick="MultiSessionPlanner.duplicateVersion(\'' + v.id + '\')" title="' + MultiSessionPlanner.escapeHtml(duplicateTooltip) + '">📋</button>';
            html += '<button type="button" class="btn-secondary" style="font-size: 0.8rem; padding: 0.35rem 0.6rem;" onclick="MultiSessionPlanner.exportVersionJSON(\'' + v.id + '\')" title="' + MultiSessionPlanner.escapeHtml(exportTooltip) + '">📥</button>';
            html += '<button type="button" class="btn-secondary" style="font-size: 0.8rem; padding: 0.35rem 0.6rem; color: #dc2626;" onclick="MultiSessionPlanner.deleteVersion(\'' + v.id + '\')" title="' + MultiSessionPlanner.escapeHtml(deleteTooltip) + '">🗑️</button>';
            html += '</div>';
            html += '</div>';

            if (displayNotes) {
                html += '<div style="background: ' + (isCheckpoint ? '#f3e8ff' : '#f8fafc') + '; border-left: 3px solid ' + (isCheckpoint ? '#9333ea' : '#0284c7') + '; padding: 0.4rem 0.75rem; border-radius: 4px; font-size: 0.82rem; color: #334155;">💬 ' + MultiSessionPlanner.escapeHtml(displayNotes) + '</div>';
            }
            html += '</div>';
        });

        html += '</div>';
        container.innerHTML = html;
    },


    openCompareModal: (defaultIdA = null, defaultIdB = null) => {
        const modal = document.getElementById('multisession-compare-modal');
        const selectA = document.getElementById('compare-version-a');
        const selectB = document.getElementById('compare-version-b');
        if (!modal || !selectA || !selectB) return;

        const versions = MultiSessionPlanner.getAllVersions();
        const activeDraftLabel = window.i18n ? window.i18n.t('multisession.active_editor_draft', 'Active Editor Form (Current Working Draft)') : 'Active Editor Form (Current Working Draft)';
        
        let optionsHtmlA = `<option value="__current__">${MultiSessionPlanner.escapeHtml(activeDraftLabel)}</option>`;
        let optionsHtmlB = `<option value="__current__">${MultiSessionPlanner.escapeHtml(activeDraftLabel)}</option>`;

        versions.forEach(v => {
            let name = v.versionName || '';
            if (v.versionNameKey && window.i18n) {
                name = window.i18n.t(v.versionNameKey);
            } else if (window.i18n) {
                if (name.includes('Session 1 - Concept, Consultation & Linework')) {
                    name = window.i18n.t('multisession.session_1_name');
                } else if (name.includes('Session 2 - Black & Grey Shading / Wash Pass')) {
                    name = window.i18n.t('multisession.session_2_name');
                }
            }

            let dateStr = v.dateFormatted || 'Saved';
            if (v.timestamp && window.i18n) {
                try {
                    dateStr = new Date(v.timestamp).toLocaleString(window.i18n.currentLanguage || 'en', { dateStyle: 'medium', timeStyle: 'short' });
                } catch (e) {}
            }

            optionsHtmlA += `<option value="${v.id}">${MultiSessionPlanner.escapeHtml(name)} (${MultiSessionPlanner.escapeHtml(dateStr)})</option>`;
            optionsHtmlB += `<option value="${v.id}">${MultiSessionPlanner.escapeHtml(name)} (${MultiSessionPlanner.escapeHtml(dateStr)})</option>`;
        });

        selectA.innerHTML = optionsHtmlA;
        selectB.innerHTML = optionsHtmlB;

        if (defaultIdA) {
            selectA.value = defaultIdA;
            if (defaultIdB) {
                selectB.value = defaultIdB;
            } else if (versions.length > 0) {
                const other = versions.find(v => v.id !== defaultIdA);
                selectB.value = other ? other.id : '__current__';
            }
        } else {
            if (versions.length > 1) {
                selectA.value = versions[0].id;
                selectB.value = versions[1].id;
            } else if (versions.length === 1) {
                selectA.value = versions[0].id;
                selectB.value = '__current__';
            }
        }

        MultiSessionPlanner.closeModal();
        modal.style.display = 'flex';
        MultiSessionPlanner.renderDiff();
    },

    closeCompareModal: () => {
        const modal = document.getElementById('multisession-compare-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    getFormModelForCompare: (key) => {
        if (key === '__current__') {
            if (window.FormBuilderApp && window.FormBuilderApp.currentForm) {
                return JSON.parse(JSON.stringify(window.FormBuilderApp.currentForm));
            }
            return null;
        }
        const v = MultiSessionPlanner.getVersion(key);
        return v && v.formData ? JSON.parse(JSON.stringify(v.formData)) : null;
    },

    flattenFields: (formObj) => {
        const list = [];
        if (!formObj || !formObj.sections) return list;

        formObj.sections.forEach(sec => {
            if (sec.type === 'medical_section') {
                list.push({
                    id: `${sec.id}_med_screening`,
                    sectionTitle: sec.title || 'Medical History',
                    label: 'Medical Health Screening Questionnaire',
                    type: 'medical_screening',
                    required: true,
                    container: false
                });
            } else if (sec.fields) {
                sec.fields.forEach(f => {
                    if (f.type === 'container') {
                        list.push({
                            id: f.id,
                            sectionTitle: sec.title || 'Section',
                            label: f.label || 'Grouped Container',
                            type: 'container',
                            required: false,
                            collapsible: f.collapsible !== false,
                            defaultCollapsed: !!f.defaultCollapsed,
                            containerStyle: f.containerStyle || 'bordered',
                            childCount: f.fields ? f.fields.length : 0
                        });

                        if (f.fields) {
                            f.fields.forEach(cf => {
                                list.push({
                                    id: cf.id,
                                    sectionTitle: `${sec.title || 'Section'} > ${f.label || 'Container'}`,
                                    label: cf.label || 'Child Field',
                                    type: cf.type || 'text',
                                    required: !!cf.required,
                                    minLength: cf.minLength,
                                    maxLength: cf.maxLength,
                                    options: cf.options ? [...cf.options] : [],
                                    conditional: cf.conditional ? JSON.stringify(cf.conditional) : null,
                                    parentContainer: f.label || f.id
                                });
                            });
                        }
                    } else {
                        list.push({
                            id: f.id,
                            sectionTitle: sec.title || 'Section',
                            label: f.label || 'Field',
                            type: f.type || 'text',
                            required: !!f.required,
                            minLength: f.minLength,
                            maxLength: f.maxLength,
                            options: f.options ? [...f.options] : [],
                            conditional: f.conditional ? JSON.stringify(f.conditional) : null
                        });
                    }
                });
            }
        });
        return list;
    },

    renderDiff: () => {
        const selectA = document.getElementById('compare-version-a');
        const selectB = document.getElementById('compare-version-b');
        const statsEl = document.getElementById('compare-diff-stats');
        const resultsEl = document.getElementById('compare-diff-results');

        if (!selectA || !selectB || !statsEl || !resultsEl) return;

        const formA = MultiSessionPlanner.getFormModelForCompare(selectA.value);
        const formB = MultiSessionPlanner.getFormModelForCompare(selectB.value);

        if (!formA || !formB) {
            resultsEl.innerHTML = '<div style="padding: 2rem; text-align: center; color: #64748b;">Unable to load one or both form versions for comparison.</div>';
            return;
        }

        const fieldsA = MultiSessionPlanner.flattenFields(formA);
        const fieldsB = MultiSessionPlanner.flattenFields(formB);

        const mapA = new Map(fieldsA.map(f => [f.id, f]));
        const mapB = new Map(fieldsB.map(f => [f.id, f]));

        const added = [];
        const removed = [];
        const modified = [];
        const unchanged = [];

        // Check for additions and modifications in B
        fieldsB.forEach(fB => {
            const fA = mapA.get(fB.id);
            if (!fA) {
                added.push(fB);
            } else {
                const diffs = [];
                if (fA.label !== fB.label) diffs.push(`Label changed from "${fA.label}" to "${fB.label}"`);
                if (fA.type !== fB.type) diffs.push(`Type changed from "${fA.type}" to "${fB.type}"`);
                if (fA.required !== fB.required) diffs.push(fB.required ? 'Changed to Mandatory (Required)' : 'Changed to Optional');
                if (fA.minLength !== fB.minLength) diffs.push(`Min length: ${fA.minLength ?? 'none'} → ${fB.minLength ?? 'none'}`);
                if (fA.maxLength !== fB.maxLength) diffs.push(`Max length: ${fA.maxLength ?? 'none'} → ${fB.maxLength ?? 'none'}`);
                if (fA.conditional !== fB.conditional) diffs.push('Dependency & conditional rule updated');
                if (fA.collapsible !== fB.collapsible) diffs.push(`Collapsible toggle: ${fA.collapsible} → ${fB.collapsible}`);
                if (fA.defaultCollapsed !== fB.defaultCollapsed) diffs.push(`Default collapsed: ${fA.defaultCollapsed} → ${fB.defaultCollapsed}`);
                
                const optA = (fA.options || []).join(', ');
                const optB = (fB.options || []).join(', ');
                if (optA !== optB) diffs.push(`Options updated: [${optB || 'none'}]`);

                if (diffs.length > 0) {
                    modified.push({ before: fA, after: fB, diffs });
                } else {
                    unchanged.push(fB);
                }
            }
        });

        // Check for removals from A
        fieldsA.forEach(fA => {
            if (!mapB.has(fA.id)) {
                removed.push(fA);
            }
        });

        // Form-level metadata differences
        const metaDiffs = [];
        if (formA.name !== formB.name) metaDiffs.push(`Form Title: "${formA.name || 'Untitled'}" → "${formB.name || 'Untitled'}"`);
        if (formA.category !== formB.category) metaDiffs.push(`Category: "${formA.category || 'Tattoo'}" → "${formB.category || 'Tattoo'}"`);
        if (formA.printAfterSignature !== formB.printAfterSignature) metaDiffs.push(`Print after Signature: ${!!formA.printAfterSignature} → ${!!formB.printAfterSignature}`);

        // Render Diff Stats
        const addedLabel = window.i18n ? window.i18n.t('multisession.diff_added', '+ ADDED') : '+ ADDED';
        const removedLabel = window.i18n ? window.i18n.t('multisession.diff_removed', '- REMOVED') : '- REMOVED';
        const modifiedLabel = window.i18n ? window.i18n.t('multisession.diff_modified', '~ MODIFIED') : '~ MODIFIED';
        const unchangedLabel = window.i18n ? window.i18n.t('multisession.diff_unchanged', 'Unchanged') : 'Unchanged';

        const addedFieldsText = `+ ${added.length} ${addedLabel.replace('+', '').trim()}`;
        const removedFieldsText = `- ${removed.length} ${removedLabel.replace('-', '').trim()}`;
        const modifiedFieldsText = `~ ${modified.length} ${modifiedLabel.replace('~', '').trim()}`;
        const unchangedFieldsText = `= ${unchanged.length} ${unchangedLabel.replace('=', '').trim()}`;

        statsEl.innerHTML = `
            <span style="background: #dcfce7; color: #166534; font-weight: 700; font-size: 0.8rem; padding: 0.3rem 0.75rem; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.35rem;">
                ${MultiSessionPlanner.escapeHtml(addedFieldsText)}
            </span>
            <span style="background: #fee2e2; color: #991b1b; font-weight: 700; font-size: 0.8rem; padding: 0.3rem 0.75rem; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.35rem;">
                ${MultiSessionPlanner.escapeHtml(removedFieldsText)}
            </span>
            <span style="background: #fef3c7; color: #92400e; font-weight: 700; font-size: 0.8rem; padding: 0.3rem 0.75rem; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.35rem;">
                ${MultiSessionPlanner.escapeHtml(modifiedFieldsText)}
            </span>
            <span style="background: #f1f5f9; color: #475569; font-weight: 600; font-size: 0.8rem; padding: 0.3rem 0.75rem; border-radius: 9999px;">
                ${MultiSessionPlanner.escapeHtml(unchangedFieldsText)}
            </span>
        `;

        if (added.length === 0 && removed.length === 0 && modified.length === 0 && metaDiffs.length === 0) {
            const identicalTitle = window.i18n ? window.i18n.t('multisession.diff_identical_title', 'Identical Form Configurations') : 'Identical Form Configurations';
            const identicalDesc = window.i18n ? window.i18n.t('multisession.diff_identical_desc', 'Both selected iterations contain identical field structures, validation rules, and layout sections.') : 'Both selected iterations contain identical field structures, validation rules, and layout sections.';

            resultsEl.innerHTML = `
                <div style="padding: 2.5rem 1rem; text-align: center; color: #16a34a; background: #f0fdf4; border-radius: 8px;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">✨</div>
                    <h4 style="margin: 0 0 0.25rem 0; font-weight: 700; color: #15803d;">${MultiSessionPlanner.escapeHtml(identicalTitle)}</h4>
                    <p style="margin: 0; font-size: 0.86rem; color: #166534;">${MultiSessionPlanner.escapeHtml(identicalDesc)}</p>
                </div>
            `;
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 0.25rem;">';

        if (metaDiffs.length > 0) {
            const metaTitle = window.i18n ? window.i18n.t('multisession.diff_metadata_title', '📋 Form Metadata Updates:') : '📋 Form Metadata Updates:';
            html += `
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 0.75rem 1rem;">
                    <strong style="color: #1e40af; font-size: 0.86rem; display: block; margin-bottom: 0.3rem;">${MultiSessionPlanner.escapeHtml(metaTitle)}</strong>
                    <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.82rem; color: #1e3a8a;">
                        ${metaDiffs.map(md => `<li>${MultiSessionPlanner.escapeHtml(md)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Added items (Green)
        added.forEach(f => {
            html += `
                <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 6px; padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
                            <span style="background: #22c55e; color: white; font-weight: 800; font-size: 0.68rem; padding: 0.1rem 0.45rem; border-radius: 4px;">${MultiSessionPlanner.escapeHtml(addedLabel)}</span>
                            <strong style="color: #14532d; font-size: 0.92rem;">${MultiSessionPlanner.escapeHtml(f.label)}</strong>
                            <span style="font-size: 0.75rem; color: #15803d; background: #dcfce7; padding: 0.1rem 0.4rem; border-radius: 4px;">${f.type}</span>
                            ${f.required ? '<span style="font-size: 0.7rem; color: #b91c1c; font-weight: 700;">* Required</span>' : ''}
                        </div>
                        <div style="font-size: 0.78rem; color: #166534;">
                            Section: <strong>${MultiSessionPlanner.escapeHtml(f.sectionTitle)}</strong>
                            ${f.minLength || f.maxLength ? ` • Length: [${f.minLength ?? 'none'} - ${f.maxLength ?? 'none'}]` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        // Removed items (Red)
        removed.forEach(f => {
            html += `
                <div style="background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 6px; padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
                            <span style="background: #ef4444; color: white; font-weight: 800; font-size: 0.68rem; padding: 0.1rem 0.45rem; border-radius: 4px;">${MultiSessionPlanner.escapeHtml(removedLabel)}</span>
                            <strong style="color: #7f1d1d; font-size: 0.92rem; text-decoration: line-through;">${MultiSessionPlanner.escapeHtml(f.label)}</strong>
                            <span style="font-size: 0.75rem; color: #991b1b; background: #fee2e2; padding: 0.1rem 0.4rem; border-radius: 4px;">${f.type}</span>
                        </div>
                        <div style="font-size: 0.78rem; color: #991b1b;">
                            Section was: <strong>${MultiSessionPlanner.escapeHtml(f.sectionTitle)}</strong>
                        </div>
                    </div>
                </div>
            `;
        });

        // Modified items (Amber)
        modified.forEach(m => {
            html += `
                <div style="background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 0.75rem 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
                        <span style="background: #f59e0b; color: white; font-weight: 800; font-size: 0.68rem; padding: 0.1rem 0.45rem; border-radius: 4px;">${MultiSessionPlanner.escapeHtml(modifiedLabel)}</span>
                        <strong style="color: #78350f; font-size: 0.92rem;">${MultiSessionPlanner.escapeHtml(m.after.label)}</strong>
                        <span style="font-size: 0.75rem; color: #92400e; background: #fef3c7; padding: 0.1rem 0.4rem; border-radius: 4px;">${m.after.type}</span>
                    </div>
                    <div style="font-size: 0.78rem; color: #451a03; margin-bottom: 0.35rem;">
                        Section: <strong>${MultiSessionPlanner.escapeHtml(m.after.sectionTitle)}</strong>
                    </div>
                    <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.8rem; color: #92400e;">
                        ${m.diffs.map(d => `<li>${MultiSessionPlanner.escapeHtml(d)}</li>`).join('')}
                    </ul>
                </div>
            `;
        });

        html += '</div>';
        resultsEl.innerHTML = html;
    },

    escapeHtml: (str) => {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};

window.MultiSessionPlanner = MultiSessionPlanner;

document.addEventListener('DOMContentLoaded', () => {
    MultiSessionPlanner.init();
});

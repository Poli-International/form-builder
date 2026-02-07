/**
 * Common Logic & Initialization
 * Poli International - Tool #13
 */

document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    initApp();
});

function initApp() {
    // Check which page we are on
    const isBuilder = document.getElementById('form-canvas');
    const isEmbed = document.body.classList.contains('embed-view');

    if (isBuilder) {
        // Initialize Form Builder
        if (window.FormBuilderApp) {
            // Load default template?
            // window.FormBuilderApp.loadForm(window.FormTemplates.formTemplates.tattoo_standard);
        }

        // Setup Template Selector logic (if UI exists)
        const templateSelect = document.getElementById('template-select');
        if (templateSelect && window.FormTemplates) {
            // Populate
            const templates = window.FormTemplates.TemplateManager.getAllTemplates();
            templates.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.name;
                templateSelect.appendChild(opt);
            });

            templateSelect.addEventListener('change', (e) => {
                const tmpl = window.FormTemplates.TemplateManager.getTemplate(e.target.value);
                if (window.FormBuilderApp) {
                    window.FormBuilderApp.loadForm(tmpl);
                }
            });

            // Trigger first load
            if (templates.length > 0) {
                const tmpl = window.FormTemplates.TemplateManager.getTemplate(templates[0].id);
                window.FormBuilderApp.loadForm(tmpl);
            }
        }

        // Preview Button
        const previewBtn = document.getElementById('btn-preview');
        if (previewBtn) {
            previewBtn.addEventListener('click', togglePreview);
        }
    }
}

function togglePreview() {
    const builderEl = document.getElementById('builder-interface');
    const previewEl = document.getElementById('preview-interface');
    const btn = document.getElementById('btn-preview');

    if (builderEl.style.display === 'none') {
        // Switch back to Builder
        builderEl.style.display = 'flex';
        previewEl.style.display = 'none';
        btn.textContent = 'Preview Form';
    } else {
        // Switch to Preview
        if (window.FormBuilderApp && window.FormPreview) {
            const currentData = window.FormBuilderApp.currentForm;
            const previewer = new window.FormPreview('preview-container');
            previewer.render(currentData);
        }

        builderEl.style.display = 'none';
        previewEl.style.display = 'block';
        btn.textContent = 'Back to Editor';
    }
}

/**
 * Dark Mode Management
 * Consistent with System
 */
function initDarkMode() {
    const toggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('theme');

    // Set initial
    if (stored === 'dark' || (!stored && prefersDark)) {
        document.body.classList.add('dark-mode');
        if (toggle) toggle.textContent = '☀️';
    } else {
        if (toggle) toggle.textContent = '🌙';
    }

    // Listener
    if (toggle) {
        toggle.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            toggle.textContent = isDark ? '☀️' : '🌙';
        });
    }
}

/**
 * Embed Code Generator
 */
function showEmbedCode() {
    const code = `<iframe src="${window.location.href.replace('index.html', 'embed.html')}" width="100%" height="600px" frameborder="0"></iframe>`;
    prompt("Copy this code to embed the tool:", code);
}
// Expose global for button
window.showEmbedCode = showEmbedCode;

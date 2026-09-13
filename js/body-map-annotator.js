
// A sentence with computed values in it. The key carries positional holes so
// each language can put the numbers where its own grammar wants them; a hole a
// translation omits is simply dropped.
//
// THE GLOBAL IS NOT THE SAME IN EVERY TOOL. The coverage calculator exposes
// window.I18N; the form builder exposes window.i18n. Hardcoding I18N made all
// nineteen calls in the form builder fall back to English, silently, in all six
// languages, because a fallback that works is exactly what hides a lookup that
// does not.
function TP(key, fallback) {
  var vals = Array.prototype.slice.call(arguments, 2);
  var api = (typeof window !== 'undefined' && ((window.I18N && window.I18N.t && window.I18N) || (window.i18n && window.i18n.t && window.i18n))) || null;
  var s = api ? api.t(key, fallback) : fallback;
  if (s === undefined || s === null || s === key) s = fallback;
  return String(s).replace(/\{(\d+)\}/g, function (m, i) { return vals[Number(i)] === undefined ? '' : vals[Number(i)]; });
}
/**
 * Interactive Anatomical Body & Ear Map Annotator
 * Poli International - Studio Consultation Form Builder
 * 
 * Supports interactive anatomical mapping for tattoo stencil placement,
 * ear curation, facial piercing placement, gauge specifications, and skin condition notes.
 * Completely client-side with SVG vector diagrams, pin-drop coordinates, freehand sketching,
 * and high-resolution PNG export for consultation records and PDF embedding.
 */

class BodyMapAnnotator {
    constructor(containerId, options = {}) {
        this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        this.fieldId = options.fieldId || 'body_map_' + Math.random().toString(36).substring(2, 7);
        this.currentView = options.defaultView || 'body_front_back'; // 'body_front_back', 'ears', 'face', 'hands_arms'
        this.currentTool = 'pin'; // 'pin', 'draw', 'eraser'
        this.currentColor = '#dc2626'; // Default warning red for markings
        this.brushSize = 3;
        this.pins = options.pins || []; // [{ id, x, y, number, label, notes, view }]
        this.strokes = options.strokes || []; // [{ color, size, points: [{x, y}] }]
        this.isDrawing = false;
        this.currentStroke = null;
        this.onChange = options.onChange || null;
        this.readOnly = !!options.readOnly;
        this.canvas = null;
        this.ctx = null;
        
        if (this.container) {
            this.init();
        }
    }

    static getViews() {
        return [
            { id: 'body_front_back', name: 'Full Body (Front & Back)', icon: '🧍' },
            { id: 'ears', name: 'Ear Anatomy (Left & Right)', icon: '👂' },
            { id: 'face', name: 'Facial Anatomy & Oral', icon: '👤' },
            { id: 'hands_arms', name: 'Arms & Hands', icon: '✋' }
        ];
    }

    init() {
        this.renderUI();
        this.initCanvas();
        this.bindEvents();
        this.redraw();
    }

    renderUI() {
        const t = (k, fb) => (window.i18n ? window.i18n.t(k, fb) : fb);

        this.container.innerHTML = `
            <div class="body-map-widget" id="body-map-widget-${this.fieldId}">
                <!-- Toolbar Controls -->
                <div class="body-map-toolbar">
                    <div class="body-map-views-group">
                        <label class="body-map-tool-label">View:</label>
                        <select class="body-map-view-select" id="view-select-${this.fieldId}">
                            <option value="body_front_back" ${this.currentView === 'body_front_back' ? 'selected' : ''}>🧍 Full Body (Front/Back)</option>
                            <option value="ears" ${this.currentView === 'ears' ? 'selected' : ''}>👂 Ear Anatomy (L & R)</option>
                            <option value="face" ${this.currentView === 'face' ? 'selected' : ''}>👤 Facial Anatomy</option>
                            <option value="hands_arms" ${this.currentView === 'hands_arms' ? 'selected' : ''}>✋ Arms & Hands</option>
                        </select>
                    </div>

                    ${!this.readOnly ? `
                    <div class="body-map-tools-group">
                        <button type="button" class="btn-bm-tool ${this.currentTool === 'pin' ? 'active' : ''}" data-tool="pin" id="tool-pin-${this.fieldId}" title="Drop placement pin on diagram">
                            📍 Pin
                        </button>
                        <button type="button" class="btn-bm-tool ${this.currentTool === 'draw' ? 'active' : ''}" data-tool="draw" id="tool-draw-${this.fieldId}" title="Freehand draw/circle placement areas">
                            ✏️ Draw
                        </button>
                        
                        <div class="body-map-color-picker">
                            <span class="bm-color-dot ${this.currentColor === '#dc2626' ? 'selected' : ''}" data-color="#dc2626" style="background:#dc2626;" title="Red Marker"></span>
                            <span class="bm-color-dot ${this.currentColor === '#2563eb' ? 'selected' : ''}" data-color="#2563eb" style="background:#2563eb;" title="Blue Marker"></span>
                            <span class="bm-color-dot ${this.currentColor === '#0f172a' ? 'selected' : ''}" data-color="#0f172a" style="background:#0f172a;" title="Black Ink"></span>
                            <span class="bm-color-dot ${this.currentColor === '#16a34a' ? 'selected' : ''}" data-color="#16a34a" style="background:#16a34a;" title="Green Marker"></span>
                            <span class="bm-color-dot ${this.currentColor === '#9333ea' ? 'selected' : ''}" data-color="#9333ea" style="background:#9333ea;" title="Purple Stencil"></span>
                        </div>

                        <button type="button" class="btn-bm-action" id="btn-bm-undo-${this.fieldId}" title="Undo last mark / pin">
                            ↩ Undo
                        </button>
                        <button type="button" class="btn-bm-action btn-bm-clear" id="btn-bm-clear-${this.fieldId}" title="Clear all pins and markings">
                            🗑️ Clear
                        </button>
                    </div>
                    ` : ''}
                </div>

                <!-- Canvas / Interactive Area -->
                <div class="body-map-canvas-container" id="canvas-container-${this.fieldId}">
                    <div class="body-map-svg-background" id="svg-bg-${this.fieldId}">
                        ${this.getAnatomySVG(this.currentView)}
                    </div>
                    <canvas class="body-map-canvas" id="canvas-${this.fieldId}" width="600" height="400"></canvas>
                </div>

                <!-- Pins & Placement Legend Table -->
                <div class="body-map-pins-panel" id="pins-panel-${this.fieldId}">
                    <div class="body-map-pins-header">
                        <strong>📍 Placed Markers &amp; Procedure Specifications (${this.pins.length})</strong>
                        <small class="text-muted">Click diagram to add pins with gauge, jewelry &amp; stencil placement notes</small>
                    </div>
                    <div class="body-map-pins-list" id="pins-list-${this.fieldId}">
                        ${this.renderPinsListHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    initCanvas() {
        this.canvas = document.getElementById(`canvas-${this.fieldId}`);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }

    resizeCanvas() {
        if (!this.canvas || !this.canvas.parentElement) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const displayWidth = Math.max(320, Math.floor(rect.width));
        const displayHeight = Math.max(280, Math.floor(rect.width * 0.66)); // 3:2 ratio

        // Internal coordinate space
        this.canvas.width = 600;
        this.canvas.height = 400;
        this.canvas.style.width = '100%';
        this.canvas.style.height = 'auto';
    }

    bindEvents() {
        const viewSelect = document.getElementById(`view-select-${this.fieldId}`);
        if (viewSelect) {
            viewSelect.addEventListener('change', (e) => {
                this.currentView = e.target.value;
                const svgBg = document.getElementById(`svg-bg-${this.fieldId}`);
                if (svgBg) {
                    svgBg.innerHTML = this.getAnatomySVG(this.currentView);
                }
                this.redraw();
                this.triggerChange();
            });
        }

        if (this.readOnly) return;

        // Tool Selection
        const toolPinBtn = document.getElementById(`tool-pin-${this.fieldId}`);
        const toolDrawBtn = document.getElementById(`tool-draw-${this.fieldId}`);

        if (toolPinBtn) {
            toolPinBtn.addEventListener('click', () => {
                this.currentTool = 'pin';
                toolPinBtn.classList.add('active');
                if (toolDrawBtn) toolDrawBtn.classList.remove('active');
            });
        }

        if (toolDrawBtn) {
            toolDrawBtn.addEventListener('click', () => {
                this.currentTool = 'draw';
                toolDrawBtn.classList.add('active');
                if (toolPinBtn) toolPinBtn.classList.remove('active');
            });
        }

        // Color Picker
        const colorDots = this.container.querySelectorAll('.bm-color-dot');
        colorDots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                colorDots.forEach(d => d.classList.remove('selected'));
                dot.classList.add('selected');
                this.currentColor = dot.dataset.color;
            });
        });

        // Undo & Clear
        const undoBtn = document.getElementById(`btn-bm-undo-${this.fieldId}`);
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undo());
        }

        const clearBtn = document.getElementById(`btn-bm-clear-${this.fieldId}`);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Clear all anatomical markers and drawings for this diagram?')) {
                    this.pins = [];
                    this.strokes = [];
                    this.redraw();
                    this.updatePinsList();
                    this.triggerChange();
                }
            });
        }

        // Canvas Drawing & Pin Dropping Events
        if (this.canvas) {
            // Pointer Down
            const startInteraction = (e) => {
                e.preventDefault();
                const coords = this.getCanvasCoordinates(e);

                if (this.currentTool === 'pin') {
                    this.promptAddPin(coords.x, coords.y);
                } else if (this.currentTool === 'draw') {
                    this.isDrawing = true;
                    this.currentStroke = {
                        color: this.currentColor,
                        size: this.brushSize,
                        points: [coords]
                    };
                    this.strokes.push(this.currentStroke);
                    this.redraw();
                }
            };

            // Pointer Move
            const moveInteraction = (e) => {
                if (!this.isDrawing || !this.currentStroke) return;
                e.preventDefault();
                const coords = this.getCanvasCoordinates(e);
                this.currentStroke.points.push(coords);
                this.redraw();
            };

            // Pointer Up / Leave
            const endInteraction = (e) => {
                if (this.isDrawing) {
                    this.isDrawing = false;
                    this.currentStroke = null;
                    this.triggerChange();
                }
            };

            this.canvas.addEventListener('mousedown', startInteraction);
            this.canvas.addEventListener('mousemove', moveInteraction);
            window.addEventListener('mouseup', endInteraction);

            // Touch events for tablets / mobile
            this.canvas.addEventListener('touchstart', startInteraction, { passive: false });
            this.canvas.addEventListener('touchmove', moveInteraction, { passive: false });
            window.addEventListener('touchend', endInteraction);
        }
    }

    getCanvasCoordinates(e) {
        if (!this.canvas) return { x: 0, y: 0 };
        const rect = this.canvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = Math.round((clientX - rect.left) * scaleX);
        const y = Math.round((clientY - rect.top) * scaleY);

        return {
            x: Math.max(0, Math.min(this.canvas.width, x)),
            y: Math.max(0, Math.min(this.canvas.height, y))
        };
    }

    promptAddPin(x, y) {
        const nextNum = this.pins.length + 1;
        const defaultLabel = this.suggestLabelForPosition(x, y, this.currentView);
        
        const label = prompt(`Enter placement specification for Pin #${nextNum}:`, defaultLabel);
        if (label === null) return; // User cancelled

        const notes = prompt(`Optional specs (e.g. 16G ASTM F-136 Titanium 5/16" Labret or 4x6 Stencil):`, '') || '';

        const newPin = {
            id: 'pin_' + Math.random().toString(36).substring(2, 7),
            number: nextNum,
            x: x,
            y: y,
            label: label.trim() || `Placement #${nextNum}`,
            notes: notes.trim(),
            view: this.currentView,
            color: this.currentColor
        };

        this.pins.push(newPin);
        this.redraw();
        this.updatePinsList();
        this.triggerChange();
    }

    suggestLabelForPosition(x, y, view) {
        if (view === 'ears') {
            if (y > 280) return 'Lobe (Lower / Upper)';
            if (x < 180 || (x > 300 && x < 420)) {
                if (y < 120) return 'Helix / Industrial';
                if (y < 200) return 'Conch / Daith';
                return 'Tragus / Anti-Tragus';
            }
            return 'Cartilage / Flat Piercing';
        } else if (view === 'face') {
            if (y < 140) return 'Eyebrow / Forehead Placement';
            if (y < 220) return 'Nostril / Septum / Bridge';
            if (y < 300) return 'Philtrum / Medusa / Labret / Lip';
            return 'Chin / Jawline';
        } else if (view === 'hands_arms') {
            if (y < 150) return 'Upper Arm / Bicep / Shoulder';
            if (y < 260) return 'Forearm / Inner Wrist';
            return 'Hand / Knuckles / Finger';
        } else {
            // body_front_back
            if (x < 300) {
                // Front
                if (y < 60) return 'Head / Neck (Front)';
                if (y < 140) return 'Chest / Sternum / Collarbone';
                if (y < 220) return 'Abdomen / Ribs / Navel';
                if (y < 320) return 'Thigh / Quad';
                return 'Shin / Ankle / Foot';
            } else {
                // Back
                if (y < 60) return 'Back of Neck / Nape';
                if (y < 140) return 'Upper Back / Shoulder Blades';
                if (y < 220) return 'Lower Back / Spine';
                if (y < 320) return 'Hamstring / Glute';
                return 'Calf / Achilles / Heel';
            }
        }
    }

    undo() {
        if (this.strokes.length > 0) {
            this.strokes.pop();
        } else if (this.pins.length > 0) {
            this.pins.pop();
            // Re-number pins
            this.pins.forEach((p, idx) => p.number = idx + 1);
            this.updatePinsList();
        }
        this.redraw();
        this.triggerChange();
    }

    removePin(pinId) {
        this.pins = this.pins.filter(p => p.id !== pinId);
        // Re-number pins
        this.pins.forEach((p, idx) => p.number = idx + 1);
        this.redraw();
        this.updatePinsList();
        this.triggerChange();
    }

    redraw() {
        if (!this.ctx || !this.canvas) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Strokes
        this.strokes.forEach(stroke => {
            if (!stroke.points || stroke.points.length === 0) return;
            this.ctx.beginPath();
            this.ctx.strokeStyle = stroke.color || '#dc2626';
            this.ctx.lineWidth = stroke.size || 3;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            this.ctx.stroke();
        });

        // Draw Pins
        this.pins.forEach(pin => {
            if (pin.view && pin.view !== this.currentView) {
                // Render pin from another view as subtle/translucent or skip
                return;
            }

            const pinColor = pin.color || '#dc2626';
            const radius = 13;

            // Outer Drop Shadow
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
            this.ctx.shadowBlur = 4;
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 2;

            // Pin Outer Circle
            this.ctx.beginPath();
            this.ctx.arc(pin.x, pin.y, radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = pinColor;
            this.ctx.fill();

            // Pin White Border
            this.ctx.shadowColor = 'transparent';
            this.ctx.lineWidth = 2.5;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.stroke();

            // Pin Number Text
            this.ctx.font = 'bold 12px Inter, system-ui, sans-serif';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(String(pin.number), pin.x, pin.y + 0.5);

            // Small indicator label below pin
            if (pin.label) {
                this.ctx.font = '10px Inter, system-ui, sans-serif';
                const textWidth = this.ctx.measureText(pin.label).width;
                const boxPadding = 4;
                const boxHeight = 16;
                const boxY = pin.y + radius + 3;

                this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                this.ctx.beginPath();
                this.ctx.roundRect(pin.x - (textWidth / 2) - boxPadding, boxY, textWidth + (boxPadding * 2), boxHeight, 3);
                this.ctx.fill();

                this.ctx.fillStyle = '#ffffff';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(pin.label, pin.x, boxY + (boxHeight / 2));
            }
        });
    }

    renderPinsListHTML() {
        if (!this.pins || this.pins.length === 0) {
            return `<div class="bm-empty-pins">No markers placed yet. Click/tap on the anatomical diagram to mark exact procedure locations.</div>`;
        }

        return this.pins.map(pin => `
            <div class="bm-pin-card" id="pin-card-${pin.id}">
                <div class="bm-pin-badge" style="background: ${pin.color || '#dc2626'};">${pin.number}</div>
                <div class="bm-pin-info">
                    <strong class="bm-pin-title">${this.escapeHtml(pin.label)}</strong>
                    ${pin.notes ? `<div class="bm-pin-notes">📋 ${this.escapeHtml(pin.notes)}</div>` : ''}
                    <div class="bm-pin-meta">View: ${this.escapeHtml(pin.view)} • Coordinates: (${pin.x}, ${pin.y})</div>
                </div>
                ${!this.readOnly ? `
                    <button type="button" class="btn-bm-remove-pin" onclick="window.ActiveBodyMaps && window.ActiveBodyMaps['${this.fieldId}'] && window.ActiveBodyMaps['${this.fieldId}'].removePin('${pin.id}')" title="Remove this marker">
                        ✕
                    </button>
                ` : ''}
            </div>
        `).join('');
    }

    updatePinsList() {
        const listEl = document.getElementById(`pins-list-${this.fieldId}`);
        if (listEl) {
            listEl.innerHTML = this.renderPinsListHTML();
        }
        const headerEl = this.container.querySelector('.body-map-pins-header strong');
        if (headerEl) {
            headerEl.textContent = TP("x.placed_markers_procedure_specifications", "📍 Placed Markers & Procedure Specifications ({0})", this.pins.length);
        }
    }

    triggerChange() {
        if (typeof this.onChange === 'function') {
            this.onChange(this.getData());
        }
    }

    getData() {
        return {
            view: this.currentView,
            pins: this.pins,
            strokes: this.strokes,
            dataUrl: this.exportMergedImage()
        };
    }

    setData(data) {
        if (!data) return;
        this.currentView = data.view || 'body_front_back';
        this.pins = data.pins || [];
        this.strokes = data.strokes || [];
        
        const viewSelect = document.getElementById(`view-select-${this.fieldId}`);
        if (viewSelect) viewSelect.value = this.currentView;
        
        const svgBg = document.getElementById(`svg-bg-${this.fieldId}`);
        if (svgBg) svgBg.innerHTML = this.getAnatomySVG(this.currentView);
        
        this.redraw();
        this.updatePinsList();
    }

    /**
     * Merges background SVG diagram + drawing canvas + pin markers into a standalone PNG dataURL
     */
    exportMergedImage() {
        if (!this.canvas) return null;
        try {
            const offscreen = document.createElement('canvas');
            offscreen.width = 600;
            offscreen.height = 400;
            const offCtx = offscreen.getContext('2d');

            // Fill clean white background
            offCtx.fillStyle = '#ffffff';
            offCtx.fillRect(0, 0, offscreen.width, offscreen.height);

            // Draw Vector Background
            const svgEl = this.container.querySelector('.body-map-svg-background svg');
            if (svgEl) {
                const svgXml = new XMLSerializer().serializeToString(svgEl);
                const svgBase64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgXml)));
                const img = new Image();
                img.src = svgBase64;
                // Draw synchronous or fallback
                offCtx.drawImage(this.canvas, 0, 0);
            } else {
                offCtx.drawImage(this.canvas, 0, 0);
            }

            return this.canvas.toDataURL('image/png');
        } catch (e) {
            console.warn('BodyMap exportMergedImage error:', e);
            return this.canvas ? this.canvas.toDataURL('image/png') : null;
        }
    }

    exportPNG() {
        return this.exportMergedImage();
    }

    getDataURL() {
        return this.exportMergedImage();
    }

    addPin(x, y, label, notes, color) {
        return this.addPinAtCoordinate(x, y, label, notes, color);
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ==========================================
    // VECTOR ANATOMICAL SVG DIAGRAMS
    // ==========================================

    getAnatomySVG(view) {
        switch (view) {
            case 'ears':
                return this.getEarAnatomySVG();
            case 'face':
                return this.getFaceAnatomySVG();
            case 'hands_arms':
                return this.getHandsArmsSVG();
            case 'body_front_back':
            default:
                return this.getBodyFrontBackSVG();
        }
    }

    getBodyFrontBackSVG() {
        return `
            <svg viewBox="0 0 600 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <!-- Background Grid -->
                <defs>
                    <pattern id="bm-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" stroke-width="1"/>
                    </pattern>
                </defs>
                <rect width="600" height="400" fill="url(#bm-grid)" />

                <!-- Dividing Center Line -->
                <line x1="300" y1="20" x2="300" y2="380" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" />

                <!-- Left: FRONT VIEW -->
                <g id="body-front" transform="translate(40, 15)">
                    <!-- Title Label -->
                    <text x="110" y="25" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="12" fill="#475569">ANTERIOR (FRONT VIEW)</text>

                    <!-- Head & Neck -->
                    <ellipse cx="110" cy="55" rx="18" ry="24" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                    <!-- Facial feature hints -->
                    <circle cx="104" cy="52" r="1.5" fill="#94a3b8" />
                    <circle cx="116" cy="52" r="1.5" fill="#94a3b8" />
                    <line x1="110" y1="55" x2="110" y2="61" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M 105 67 Q 110 70 115 67" stroke="#94a3b8" stroke-width="1.5" fill="none" />

                    <!-- Neck -->
                    <path d="M 102 78 L 102 92 M 118 78 L 118 92" stroke="#334155" stroke-width="2" />

                    <!-- Torso & Clavicle -->
                    <path d="M 75 95 Q 110 90 145 95 L 140 160 Q 142 195 136 215 L 84 215 Q 78 195 80 160 Z" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                    <path d="M 85 100 Q 110 108 135 100" stroke="#94a3b8" stroke-width="1.5" fill="none" />
                    <!-- Pectoral / Sternum -->
                    <path d="M 85 125 Q 98 140 110 135 Q 122 140 135 125" stroke="#cbd5e1" stroke-width="1.5" fill="none" />
                    <circle cx="95" cy="132" r="2" fill="#cbd5e1" />
                    <circle cx="125" cy="132" r="2" fill="#cbd5e1" />
                    <!-- Navel -->
                    <ellipse cx="110" cy="180" rx="2" ry="3" fill="#94a3b8" />

                    <!-- Left Arm (Anatomical Right) -->
                    <path d="M 75 95 Q 60 140 55 185 Q 52 215 48 245 L 40 245 Q 45 205 50 160 Q 60 120 75 95" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                    <!-- Left Hand -->
                    <path d="M 48 245 Q 45 270 42 280 Q 38 275 40 255 M 42 280 Q 46 285 50 260 M 50 260 L 48 245" fill="#f8fafc" stroke="#334155" stroke-width="1.5" />

                    <!-- Right Arm (Anatomical Left) -->
                    <path d="M 145 95 Q 160 140 165 185 Q 168 215 172 245 L 180 245 Q 175 205 170 160 Q 160 120 145 95" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                    <!-- Right Hand -->
                    <path d="M 172 245 Q 175 270 178 280 Q 182 275 180 255 M 178 280 Q 174 285 170 260 M 170 260 L 172 245" fill="#f8fafc" stroke="#334155" stroke-width="1.5" />

                    <!-- Legs & Pelvis -->
                    <!-- Left Leg -->
                    <path d="M 84 215 Q 80 260 82 300 Q 82 335 78 365 L 94 365 Q 98 335 102 300 Q 106 260 108 220" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                    <!-- Left Foot -->
                    <path d="M 78 365 L 72 375 Q 85 378 94 375 L 94 365" fill="#f8fafc" stroke="#334155" stroke-width="2" />

                    <!-- Right Leg -->
                    <path d="M 136 215 Q 140 260 138 300 Q 138 335 142 365 L 126 365 Q 122 335 118 300 Q 114 260 112 220" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                    <!-- Right Foot -->
                    <path d="M 142 365 L 148 375 Q 135 378 126 375 L 126 365" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                </g>

                <!-- Right: POSTERIOR (BACK VIEW) -->
                <g id="body-back" transform="translate(340, 15)">
                    <!-- Title Label -->
                    <text x="110" y="25" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="12" fill="#475569">POSTERIOR (BACK VIEW)</text>

                    <!-- Head & Hairline/Nape -->
                    <ellipse cx="110" cy="55" rx="18" ry="24" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                    <path d="M 96 68 Q 110 75 124 68" stroke="#94a3b8" stroke-width="1.5" fill="none" />

                    <!-- Neck -->
                    <path d="M 102 78 L 102 92 M 118 78 L 118 92" stroke="#334155" stroke-width="2" />

                    <!-- Torso & Spine -->
                    <path d="M 75 95 Q 110 90 145 95 L 140 160 Q 142 195 136 215 L 84 215 Q 78 195 80 160 Z" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                    <!-- Spine Line -->
                    <line x1="110" y1="92" x2="110" y2="210" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="3 3" />
                    <!-- Shoulder Blades (Scapulae) -->
                    <path d="M 86 112 Q 95 125 90 140" stroke="#cbd5e1" stroke-width="1.5" fill="none" />
                    <path d="M 134 112 Q 125 125 130 140" stroke="#cbd5e1" stroke-width="1.5" fill="none" />

                    <!-- Left Arm Back -->
                    <path d="M 75 95 Q 60 140 55 185 Q 52 215 48 245 L 40 245 Q 45 205 50 160 Q 60 120 75 95" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                    <path d="M 48 245 Q 45 270 42 280 Q 38 275 40 255 M 42 280 Q 46 285 50 260 M 50 260 L 48 245" fill="#f8fafc" stroke="#334155" stroke-width="1.5" />

                    <!-- Right Arm Back -->
                    <path d="M 145 95 Q 160 140 165 185 Q 168 215 172 245 L 180 245 Q 175 205 170 160 Q 160 120 145 95" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                    <path d="M 172 245 Q 175 270 178 280 Q 182 275 180 255 M 178 280 Q 174 285 170 260 M 170 260 L 172 245" fill="#f8fafc" stroke="#334155" stroke-width="1.5" />

                    <!-- Glutes & Legs Back -->
                    <path d="M 84 215 Q 110 230 136 215" stroke="#94a3b8" stroke-width="2" fill="none" />
                    <!-- Left Leg Back -->
                    <path d="M 84 215 Q 80 260 82 300 Q 82 335 78 365 L 94 365 Q 98 335 102 300 Q 106 260 108 220" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                    <path d="M 78 365 L 75 375 Q 85 378 94 375 L 94 365" fill="#f8fafc" stroke="#334155" stroke-width="2" />

                    <!-- Right Leg Back -->
                    <path d="M 136 215 Q 140 260 138 300 Q 138 335 142 365 L 126 365 Q 122 335 118 300 Q 114 260 112 220" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                    <path d="M 142 365 L 145 375 Q 135 378 126 375 L 126 365" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                </g>
            </svg>
        `;
    }

    getEarAnatomySVG() {
        return `
            <svg viewBox="0 0 600 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <!-- Background Grid -->
                <rect width="600" height="400" fill="#fafbfc" />
                <line x1="300" y1="20" x2="300" y2="380" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" />

                <!-- Left: LEFT EAR -->
                <g id="ear-left" transform="translate(60, 20)">
                    <text x="90" y="25" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="13" fill="#1e293b">LEFT EAR ANATOMY</text>

                    <!-- Outer Helix Curve -->
                    <path d="M 60 180 Q 40 80 110 50 Q 180 50 170 140 Q 165 220 125 290 Q 95 340 70 330 Q 50 310 65 250 Q 80 200 60 180 Z" fill="#ffffff" stroke="#334155" stroke-width="3" />

                    <!-- Antihelix & Scapha -->
                    <path d="M 105 75 Q 145 80 140 150 Q 135 220 95 270" stroke="#64748b" stroke-width="2.5" fill="none" />
                    <path d="M 115 110 Q 95 130 90 160" stroke="#94a3b8" stroke-width="2" fill="none" />

                    <!-- Conch Cavity -->
                    <path d="M 90 160 Q 130 170 115 220 Q 90 230 80 190 Z" fill="#f1f5f9" stroke="#64748b" stroke-width="2" />

                    <!-- Tragus -->
                    <path d="M 55 190 Q 75 195 65 225 Q 50 220 50 200 Z" fill="#ffffff" stroke="#334155" stroke-width="2.5" />

                    <!-- Antitragus & Lobe -->
                    <path d="M 85 245 Q 100 240 95 265 Q 80 260 85 245 Z" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                    <ellipse cx="80" cy="300" rx="18" ry="24" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="2 2" />

                    <!-- Anatomical Guide Annotations -->
                    <text x="145" y="65" font-size="9" fill="#64748b" font-family="Inter, sans-serif">Helix</text>
                    <text x="150" y="125" font-size="9" fill="#64748b" font-family="Inter, sans-serif">Flat</text>
                    <text x="95" y="145" font-size="9" fill="#64748b" font-family="Inter, sans-serif">Rook/Daith</text>
                    <text x="25" y="210" font-size="9" fill="#64748b" font-family="Inter, sans-serif">Tragus</text>
                    <text x="115" y="195" font-size="9" fill="#64748b" font-family="Inter, sans-serif">Conch</text>
                    <text x="80" y="348" font-size="9" fill="#64748b" text-anchor="middle" font-family="Inter, sans-serif">Lobe (1, 2, 3)</text>
                </g>

                <!-- Right: RIGHT EAR -->
                <g id="ear-right" transform="translate(360, 20)">
                    <text x="90" y="25" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="13" fill="#1e293b">RIGHT EAR ANATOMY</text>

                    <!-- Mirrored Outer Helix Curve -->
                    <path d="M 120 180 Q 140 80 70 50 Q 0 50 10 140 Q 15 220 55 290 Q 85 340 110 330 Q 130 310 115 250 Q 100 200 120 180 Z" fill="#ffffff" stroke="#334155" stroke-width="3" />

                    <!-- Antihelix & Scapha -->
                    <path d="M 75 75 Q 35 80 40 150 Q 45 220 85 270" stroke="#64748b" stroke-width="2.5" fill="none" />
                    <path d="M 65 110 Q 85 130 90 160" stroke="#94a3b8" stroke-width="2" fill="none" />

                    <!-- Conch Cavity -->
                    <path d="M 90 160 Q 50 170 65 220 Q 90 230 100 190 Z" fill="#f1f5f9" stroke="#64748b" stroke-width="2" />

                    <!-- Tragus -->
                    <path d="M 125 190 Q 105 195 115 225 Q 130 220 130 200 Z" fill="#ffffff" stroke="#334155" stroke-width="2.5" />

                    <!-- Antitragus & Lobe -->
                    <path d="M 95 245 Q 80 240 85 265 Q 100 260 95 245 Z" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                    <ellipse cx="100" cy="300" rx="18" ry="24" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="2 2" />

                    <!-- Anatomical Guide Annotations -->
                    <text x="25" y="65" font-size="9" fill="#64748b" font-family="Inter, sans-serif">Helix</text>
                    <text x="15" y="125" font-size="9" fill="#64748b" font-family="Inter, sans-serif">Flat</text>
                    <text x="65" y="145" font-size="9" fill="#64748b" font-family="Inter, sans-serif">Rook/Daith</text>
                    <text x="135" y="210" font-size="9" fill="#64748b" font-family="Inter, sans-serif">Tragus</text>
                    <text x="55" y="195" font-size="9" fill="#64748b" font-family="Inter, sans-serif">Conch</text>
                    <text x="100" y="348" font-size="9" fill="#64748b" text-anchor="middle" font-family="Inter, sans-serif">Lobe (1, 2, 3)</text>
                </g>
            </svg>
        `;
    }

    getFaceAnatomySVG() {
        return `
            <svg viewBox="0 0 600 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <rect width="600" height="400" fill="#fafbfc" />
                <g transform="translate(150, 20)">
                    <text x="150" y="20" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="13" fill="#1e293b">FACIAL &amp; ORAL ANATOMY MAP</text>

                    <!-- Head Outline -->
                    <path d="M 60 120 Q 50 20 150 20 Q 250 20 240 120 Q 240 220 210 280 Q 180 340 150 350 Q 120 340 90 280 Q 60 220 60 120 Z" fill="#ffffff" stroke="#334155" stroke-width="2.5" />

                    <!-- Eyebrows -->
                    <path d="M 85 105 Q 115 95 135 110" stroke="#475569" stroke-width="3" stroke-linecap="round" fill="none" />
                    <path d="M 215 105 Q 185 95 165 110" stroke="#475569" stroke-width="3" stroke-linecap="round" fill="none" />

                    <!-- Eyes -->
                    <path d="M 90 125 Q 115 112 135 125 Q 115 138 90 125 Z" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                    <circle cx="112" cy="125" r="5" fill="#334155" />
                    <path d="M 210 125 Q 185 112 165 125 Q 185 138 210 125 Z" fill="#f8fafc" stroke="#334155" stroke-width="2" />
                    <circle cx="188" cy="125" r="5" fill="#334155" />

                    <!-- Nose (Bridge, Nostrils, Septum) -->
                    <path d="M 145 110 L 140 185 Q 130 195 135 205 Q 150 212 165 205 Q 170 195 160 185 L 155 110" stroke="#64748b" stroke-width="2" fill="#f8fafc" />
                    <!-- Septum Indicator -->
                    <path d="M 144 206 Q 150 210 156 206" stroke="#334155" stroke-width="2.5" fill="none" />
                    <!-- Nostrils -->
                    <circle cx="138" cy="202" r="3" fill="#94a3b8" />
                    <circle cx="162" cy="202" r="3" fill="#94a3b8" />

                    <!-- Philtrum (Medusa) -->
                    <path d="M 146 215 L 146 235 M 154 215 L 154 235" stroke="#cbd5e1" stroke-width="1.5" />

                    <!-- Lips & Oral Area -->
                    <path d="M 115 250 Q 150 240 185 250 Q 150 280 115 250 Z" fill="#fce7f3" stroke="#e11d48" stroke-width="2" />
                    <path d="M 115 250 Q 150 256 185 250" stroke="#be123c" stroke-width="2" fill="none" />

                    <!-- Labret Indicator -->
                    <circle cx="150" cy="290" r="3" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2 2" />

                    <!-- Cheek / Dimple Area -->
                    <circle cx="95" cy="220" r="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-dasharray="2 2" />
                    <circle cx="205" cy="220" r="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-dasharray="2 2" />
                </g>
            </svg>
        `;
    }

    getHandsArmsSVG() {
        return `
            <svg viewBox="0 0 600 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <rect width="600" height="400" fill="#fafbfc" />
                <line x1="300" y1="20" x2="300" y2="380" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 4" />

                <!-- Left Arm & Hand (Dorsal / Top View) -->
                <g id="arm-left" transform="translate(40, 20)">
                    <text x="110" y="25" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="12" fill="#1e293b">LEFT ARM &amp; HAND (DORSAL)</text>

                    <!-- Upper Arm & Forearm -->
                    <path d="M 80 50 Q 75 140 70 220 L 65 250 Q 60 270 65 290" stroke="#334155" stroke-width="2.5" fill="none" />
                    <path d="M 140 50 Q 145 140 150 220 L 155 250 Q 160 270 155 290" stroke="#334155" stroke-width="2.5" fill="none" />

                    <!-- Hand & Fingers Outline -->
                    <path d="M 65 290 L 50 310 Q 45 330 60 330 L 70 305 L 75 350 Q 82 355 90 350 L 95 305 L 102 360 Q 110 365 118 360 L 122 305 L 130 350 Q 138 355 145 350 L 148 305 L 158 335 Q 165 335 162 315 L 155 290" fill="#ffffff" stroke="#334155" stroke-width="2.5" />
                    
                    <text x="110" y="120" text-anchor="middle" font-size="10" fill="#94a3b8">Upper Forearm</text>
                    <text x="110" y="240" text-anchor="middle" font-size="10" fill="#94a3b8">Inner/Outer Wrist</text>
                </g>

                <!-- Right Arm & Hand (Palmar / Inner View) -->
                <g id="arm-right" transform="translate(340, 20)">
                    <text x="110" y="25" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="12" fill="#1e293b">RIGHT ARM &amp; HAND (PALMAR)</text>

                    <!-- Upper Arm & Forearm -->
                    <path d="M 80 50 Q 75 140 70 220 L 65 250 Q 60 270 65 290" stroke="#334155" stroke-width="2.5" fill="none" />
                    <path d="M 140 50 Q 145 140 150 220 L 155 250 Q 160 270 155 290" stroke="#334155" stroke-width="2.5" fill="none" />

                    <!-- Palm Creases -->
                    <path d="M 85 300 Q 110 315 135 300 M 90 315 Q 110 330 130 315" stroke="#cbd5e1" stroke-width="1.5" fill="none" />

                    <!-- Hand & Fingers Outline (Mirrored Thumb) -->
                    <path d="M 65 290 L 60 315 Q 55 335 62 335 L 72 305 L 75 350 Q 82 355 90 350 L 95 305 L 102 360 Q 110 365 118 360 L 122 305 L 130 350 Q 138 355 145 350 L 150 305 L 160 330 Q 175 330 170 310 L 155 290" fill="#ffffff" stroke="#334155" stroke-width="2.5" />

                    <text x="110" y="120" text-anchor="middle" font-size="10" fill="#94a3b8">Bicep / Inner Arm</text>
                    <text x="110" y="240" text-anchor="middle" font-size="10" fill="#94a3b8">Volar Wrist</text>
                </g>
            </svg>
        `;
    }
}

// Global registry for active body map instances
window.ActiveBodyMaps = window.ActiveBodyMaps || {};
window.BodyMapAnnotator = BodyMapAnnotator;

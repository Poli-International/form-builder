/**
 * Digital Signature Capture
 * Poli International - Studio Consultation Form Builder
 * Dependencies: Signature Pad (https://github.com/szimek/signature_pad)
 */

class SignatureManager {
    constructor(canvasId, clearBtnId) {
        this.canvasId = canvasId;
        this.clearBtnId = clearBtnId;
        this.signaturePad = null;
        this.resizeHandler = null;
        this.signedAt = null;
        this.onChangeCallback = null;
        this.onSignatureCompleteCallback = null;
    }

    init() {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) {
            console.warn(`SignatureManager: Canvas #${this.canvasId} not found.`);
            return;
        }

        if (typeof SignaturePad === 'undefined') {
            console.error('SignaturePad library not loaded.');
            return;
        }

        // Retrieve ink color and thickness from PDFGenerator settings or defaults
        const pdfSettings = (window.PDFGenerator && typeof window.PDFGenerator.getSettings === 'function')
            ? window.PDFGenerator.getSettings()
            : {};

        let penColor = 'rgb(29, 78, 216)'; // Studio Blue default
        if (pdfSettings.signatureInkColor === 'black') penColor = 'rgb(15, 23, 42)';
        else if (pdfSettings.signatureInkColor === 'red') penColor = 'rgb(220, 38, 38)';
        else if (pdfSettings.signatureInkColor === 'blue') penColor = 'rgb(29, 78, 216)';

        let minWidth = 1.2;
        let maxWidth = 2.8;
        if (pdfSettings.signatureThickness === 'thin') {
            minWidth = 0.7;
            maxWidth = 1.6;
        } else if (pdfSettings.signatureThickness === 'bold') {
            minWidth = 2.0;
            maxWidth = 4.2;
        }

        // Initialize SignaturePad with high fidelity settings
        this.signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgba(255, 255, 255, 1)', // White background for clean PDF rendering
            penColor: penColor,
            minWidth: minWidth,
            maxWidth: maxWidth,
            velocityFilterWeight: 0.7
        });

        // Resize canvas to actual display dimensions with Device Pixel Ratio
        this.resizeCanvas(false);

        // Attach Debounced Resize Listener
        this.resizeHandler = () => {
            if (this.resizeTimer) clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => this.resizeCanvas(true), 200);
        };
        window.addEventListener('resize', this.resizeHandler);

        // Setup Clear button
        const clearBtn = document.getElementById(this.clearBtnId);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clear();
                this.updateVerificationBadge();
                if (typeof this.onChangeCallback === 'function') {
                    this.onChangeCallback();
                }
            });
        }

        // Setup draw/stroke completion callback
        if (this.signaturePad) {
            const handleStrokeEnd = () => {
                const wasEmpty = !this.signedAt;
                if (!this.isEmpty()) {
                    if (!this.signedAt) {
                        this.signedAt = new Date();
                    }
                } else {
                    this.signedAt = null;
                }
                this.updateVerificationBadge();
                if (typeof this.onChangeCallback === 'function') {
                    this.onChangeCallback();
                }
                if (!this.isEmpty() && typeof this.onSignatureCompleteCallback === 'function') {
                    this.onSignatureCompleteCallback(this.canvasId, this.signedAt);
                }
            };

            this.signaturePad.addEventListener('afterUpdateStroke', handleStrokeEnd);
            this.signaturePad.addEventListener('endStroke', handleStrokeEnd);
        }
    }

    updateVerificationBadge() {
        const fieldId = this.canvasId.replace('sig-canvas-', '');
        const badgeEl = document.getElementById(`sig-verification-${fieldId}`);
        if (!badgeEl) return;

        if (!this.isEmpty() && this.signedAt) {
            const timeStr = this.signedAt.toLocaleString([], {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
            badgeEl.style.display = 'inline-flex';
            badgeEl.innerHTML = `<span class="sig-verified-icon">✓</span> Digitally Signed &amp; Timestamped: <strong>${timeStr}</strong>`;
        } else {
            badgeEl.style.display = 'none';
            badgeEl.innerHTML = '';
        }
    }

    setOnChange(callback) {
        this.onChangeCallback = callback;
    }

    setOnSignatureComplete(callback) {
        this.onSignatureCompleteCallback = callback;
    }

    getSignedAt() {
        return this.signedAt ? this.signedAt.toISOString() : null;
    }

    getFormattedTimestamp() {
        return this.signedAt ? this.signedAt.toLocaleString() : null;
    }

    resizeCanvas(preserveData = true) {
        if (!this.signaturePad) return;

        const canvas = this.signaturePad.canvas;
        const parent = canvas.parentElement;
        if (!parent) return;

        const width = parent.clientWidth || 500;
        const height = 160;

        // If dimensions haven't changed, skip
        if (canvas.offsetWidth === width && canvas.offsetHeight === height && canvas.width > 0) {
            return;
        }

        // Save existing stroke data if we want to preserve on resize
        let data = null;
        if (preserveData && !this.signaturePad.isEmpty()) {
            data = this.signaturePad.toData();
        }

        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d');
        ctx.scale(ratio, ratio);

        this.signaturePad.clear();
        if (data) {
            this.signaturePad.fromData(data);
        }
    }

    clear() {
        if (this.signaturePad) {
            this.signaturePad.clear();
        }
    }

    applyStyleSettings() {
        if (!this.signaturePad) return;
        const pdfSettings = (window.PDFGenerator && typeof window.PDFGenerator.getSettings === 'function')
            ? window.PDFGenerator.getSettings()
            : {};

        let penColor = 'rgb(29, 78, 216)';
        if (pdfSettings.signatureInkColor === 'black') penColor = 'rgb(15, 23, 42)';
        else if (pdfSettings.signatureInkColor === 'red') penColor = 'rgb(220, 38, 38)';
        else if (pdfSettings.signatureInkColor === 'blue') penColor = 'rgb(29, 78, 216)';

        let minWidth = 1.2;
        let maxWidth = 2.8;
        if (pdfSettings.signatureThickness === 'thin') {
            minWidth = 0.7;
            maxWidth = 1.6;
        } else if (pdfSettings.signatureThickness === 'bold') {
            minWidth = 2.0;
            maxWidth = 4.2;
        }

        this.signaturePad.penColor = penColor;
        this.signaturePad.minWidth = minWidth;
        this.signaturePad.maxWidth = maxWidth;
    }

    isEmpty() {
        return this.signaturePad ? this.signaturePad.isEmpty() : true;
    }

    getSignatureImage() {
        if (this.isEmpty()) {
            return null;
        }
        return this.signaturePad.toDataURL('image/png');
    }

    destroy() {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        if (this.signaturePad) {
            this.signaturePad.off();
        }
    }
}

window.SignatureManager = SignatureManager;

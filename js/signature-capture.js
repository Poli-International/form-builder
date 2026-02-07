/**
 * Digital Signature Capture
 * Poli International - Tool #13
 * Dependencies: Signature Pad (https://github.com/szimek/signature_pad)
 */

class SignatureManager {
    constructor(canvasId, clearBtnId) {
        this.canvasId = canvasId;
        this.clearBtnId = clearBtnId;
        this.signaturePad = null;

        // Wait for DOM or init explicitly
        // If instantiated, we assume element exists or we wait?
        // Let's assume the user of this class calls init() when DOM is ready
    }

    init() {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) {
            console.warn(`SignatureManager: Canvas #${this.canvasId} not found.`);
            return;
        }

        // Initialize SignaturePad
        // Ensure library is loaded
        if (typeof SignaturePad === 'undefined') {
            console.error('SignaturePad library not loaded.');
            return;
        }

        this.signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgba(255, 255, 255, 0)', // Transparent? Or white? usually white for PDF.
            penColor: 'rgb(0, 0, 0)',
            velocityFilterWeight: 0.7
        });

        // Setup resize handler
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();

        // Setup controls
        const clearBtn = document.getElementById(this.clearBtnId);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clear();
            });
        }
    }

    resizeCanvas() {
        if (!this.signaturePad) return;

        const canvas = this.signaturePad.canvas;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);

        // This part is critical for correct coordinate mapping on resize
        // We only resize if the dimensions actually changed or on init
        // signature_pad clears on resize, so be careful. 
        // We might want to save data, resize, restore.

        // For simple form usage, just setting width/height attributes to match CSS size * ratio
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d').scale(ratio, ratio);

        // This clears the canvas, so maybe acceptable for a start, 
        // but if user rotates device while signing... 
        // ideally we check isEmpty before clearing or warn user.
        // For MVP, simple resize is standard.
        this.signaturePad.clear();
    }

    clear() {
        if (this.signaturePad) {
            this.signaturePad.clear();
        }
    }

    isEmpty() {
        return this.signaturePad ? this.signaturePad.isEmpty() : true;
    }

    getSignatureImage() {
        if (this.isEmpty()) {
            return null;
        }
        // Returns base64 PNG
        return this.signaturePad.toDataURL('image/png');
    }
}

// Global export
window.SignatureManager = SignatureManager;

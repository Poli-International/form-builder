/**
 * PDF Generation Engine
 * Poli International - Tool #13
 * Dependencies: jsPDF (v2.5.1+)
 */

const PDFGenerator = {
    generateFormPDF: async (formData, responses, signatureImage, options = {}) => {
        // Ensure jsPDF is loaded
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            console.error('jsPDF library not found');
            alert('PDF Library not loaded. Please refresh and try again.');
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let yPos = margin;

        // --- Header ---
        // Logo (if provided in options or hardcoded for Poli Tools context)
        // For this tool, we might let users upload a studio logo, or use a default.
        // options.logoUrl

        doc.setFontSize(18);
        doc.text(formData.name || 'Consultation Form', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        doc.setFontSize(10);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPos);
        yPos += 10;

        // Line break
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // --- Sections ---
        for (const section of formData.sections) {
            // Check for page break needed for Section Header
            if (yPos > pageHeight - 30) {
                doc.addPage();
                yPos = margin;
            }

            // Section Header
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setFillColor(240, 240, 240); // Light gray background
            doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 8, 'F');
            doc.text(section.title, margin + 2, yPos);
            yPos += 12;

            // Fields
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);

            // Special handling for generated medical history if it's that type
            let fieldsToRender = section.fields;

            // Note: If using the medical history generator, the "medical_section" type 
            // might have been replaced by real fields in the UI, but here we process the raw form data.
            // We need to handle specific types. 
            // Ideally formData passed here is the "live" one, or we re-generate medical fields just for PDF.
            // For now, let's assume the passed formData has the fields, or handle the 'medical_section' type.

            if (section.type === 'medical_section') {
                // Import dependency if needed, or assume data structure is handled
                // We'll rely on the responses having the keys.
                // We need the LABELs for the keys.
                if (window.MedicalHistorySystem) {
                    const medicalFields = window.MedicalHistorySystem.getMedicalSection().fields;
                    fieldsToRender = medicalFields;
                }
            }

            if (fieldsToRender) {
                fieldsToRender.forEach(field => {
                    // Skip if conditional logic hid this field (need to check if response exists?)
                    // If response is undefined/null and field wasn't required, maybe skip?
                    // Or show "N/A"? Let's show N/A for completeness.

                    let respValue = responses[field.id];

                    // Format value
                    let displayValue = 'N/A';
                    if (respValue !== undefined && respValue !== null && respValue !== '') {
                        if (Array.isArray(respValue)) {
                            displayValue = respValue.join(', ');
                        } else if (typeof respValue === 'boolean') {
                            displayValue = respValue ? 'Yes' : 'No';
                        } else {
                            displayValue = String(respValue);
                        }
                    }

                    // Check page break
                    // We need enough space for Label + Value (potentially multi-line)
                    const splitTitle = doc.splitTextToSize(`${field.label}:`, (pageWidth - (margin * 2)) * 0.4);
                    const splitValue = doc.splitTextToSize(displayValue, (pageWidth - (margin * 2)) * 0.55);
                    const heightNeeded = Math.max(splitTitle.length, splitValue.length) * 5 + 4;

                    if (yPos + heightNeeded > pageHeight - margin) {
                        doc.addPage();
                        yPos = margin;
                    }

                    // Draw
                    doc.text(splitTitle, margin, yPos);
                    doc.text(splitValue, margin + 70, yPos); // Align value column

                    yPos += heightNeeded;
                });
            }

            yPos += 5; // Space between sections
        }

        // --- Signature ---
        if (signatureImage) {
            if (yPos > pageHeight - 60) {
                doc.addPage();
                yPos = margin;
            }

            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;
            doc.setFontSize(12);
            doc.text('Client Signature:', margin, yPos);
            yPos += 5;

            // Add image
            // aspect ratio?
            doc.addImage(signatureImage, 'PNG', margin, yPos, 60, 30);
            yPos += 35;
            doc.setFontSize(8);
            doc.text(`Signed digitally on ${new Date().toLocaleString()}`, margin, yPos);
        }

        // --- Footer ---
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Page ${i} of ${pageCount} - Generated by Poli Form Builder`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        // Save
        const filename = `${formData.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        doc.save(filename);
    }
};

window.PDFGenerator = PDFGenerator;

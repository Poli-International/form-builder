/**
 * PDF Generation Engine
 * Poli International - Studio Consultation Form Builder
 * Dependencies: jsPDF (v2.5.1+)
 * Produces crisp, standardized studio consent forms with professional margins,
 * dedicated studio branding header, formatted field sections, and an official signature block.
 */

const PDFGenerator = {
    generateFormPDF: async (formData, responses = {}, signatureImage = null, options = {}) => {
        // Ensure jsPDF is loaded
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            console.error('jsPDF library not found');
            alert('PDF Library not loaded. Please ensure jsPDF script is loaded.');
            return;
        }

        const settings = PDFGenerator.getSettings();
        const isCompact = (settings.layoutDensity === 'compact' || options.layoutDensity === 'compact');

        const doc = new jsPDF({
            orientation: settings.orientation || 'portrait',
            unit: 'mm',
            format: settings.paperSize || 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Dynamic Margins based on layout density (Compact: 10mm, Standard: 16mm)
        const margin = isCompact ? 10 : 16;
        const contentWidth = pageWidth - (margin * 2);
        let yPos = margin;

        // Resolve Studio and Practitioner Details
        let studioName = 'POLI INTERNATIONAL TATTOO & BODY PIERCING STUDIO';
        let studioAddress = '104 Studio Plaza, Suite B | (555) 019-2834 | contact@poli-studio.com';
        let practitionerName = responses['practitioner_name'] || 'Licensed Studio Practitioner';
        let clientName = responses['full_name'] || responses['client_name'] || responses['minor_name'] || 'Client Record';
        let formDocId = `REC-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Look for studio fields in form definition or responses
        if (responses['studio_name']) studioName = responses['studio_name'].toUpperCase();
        if (responses['studio_address'] || responses['studio_contact']) {
            studioAddress = responses['studio_address'] || responses['studio_contact'];
        }

        // =========================================================
        // 1. STANDARD PROFESSIONAL STUDIO HEADER WRAPPER
        // =========================================================
        
        // Top Brand Accent Bar (Navy & Blue)
        const barHeight = isCompact ? 2.2 : 3;
        doc.setFillColor(15, 23, 42); // Slate 900
        doc.rect(margin, yPos, contentWidth, barHeight, 'F');
        doc.setFillColor(37, 99, 235); // Blue 600
        doc.rect(margin + (contentWidth * 0.7), yPos, contentWidth * 0.3, barHeight, 'F');
        yPos += isCompact ? 5.5 : 7;

        // Studio Main Brand Heading
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(isCompact ? 11.5 : 13);
        doc.setTextColor(15, 23, 42);
        doc.text(studioName, margin, yPos);

        // Document Reference Number & Date (Right Aligned)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(isCompact ? 8 : 8.5);
        doc.setTextColor(37, 99, 235);
        doc.text(`DOC ID: ${formDocId}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += isCompact ? 3.8 : 4.5;

        // Studio Address / Permit Sub-line
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(isCompact ? 7.5 : 8);
        doc.setTextColor(100, 116, 139);
        doc.text(studioAddress, margin, yPos);

        const dateStr = `Date: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;
        doc.text(dateStr, pageWidth - margin, yPos, { align: 'right' });
        yPos += isCompact ? 4.5 : 5.5;

        // Form Title Banner Box
        const bannerHeight = isCompact ? 9.5 : 12;
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, yPos, contentWidth, bannerHeight, 1, 1, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(isCompact ? 9.5 : 11);
        doc.setTextColor(15, 23, 42);
        doc.text((formData.name || 'CLIENT INTAKE & CONSENT RECORD').toUpperCase(), margin + 3.5, yPos + (isCompact ? 4.2 : 5));

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(isCompact ? 7.2 : 8);
        doc.setTextColor(71, 85, 105);
        const metaLine = `Client: ${clientName}  •  Practitioner: ${practitionerName}  •  Category: ${formData.category || 'Studio Consultation'} • Layout: ${isCompact ? 'Compact' : 'Standard'}`;
        doc.text(metaLine, margin + 3.5, yPos + (isCompact ? 7.8 : 9.5));
        yPos += isCompact ? 12 : 16;

        // Description if present
        if (formData.description) {
            doc.setFontSize(isCompact ? 7.8 : 8.5);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 116, 139);
            const descLines = doc.splitTextToSize(formData.description, contentWidth);
            doc.text(descLines, margin, yPos);
            yPos += (descLines.length * (isCompact ? 3.2 : 3.8)) + (isCompact ? 2 : 3);
        }

        // =========================================================
        // 2. FORM SECTIONS & RESPONSES RENDERING
        // =========================================================
        if (formData.sections && formData.sections.length > 0) {
            for (const section of formData.sections) {
                if (section.hidden) continue; // Skip builder-hidden sections

                // Check page break for section header
                if (yPos > pageHeight - (isCompact ? 25 : 35)) {
                    doc.addPage();
                    yPos = margin;
                }

                // Section Header Ribbon
                const secRibbonH = isCompact ? 5.5 : 7;
                doc.setFillColor(241, 245, 249);
                doc.setDrawColor(226, 232, 240);
                doc.setLineWidth(0.2);
                doc.roundedRect(margin, yPos - (isCompact ? 3.8 : 4.5), contentWidth, secRibbonH, 1, 1, 'FD');

                // Accent Tag on left of section header
                doc.setFillColor(37, 99, 235);
                doc.rect(margin, yPos - (isCompact ? 3.8 : 4.5), 2.2, secRibbonH, 'F');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(isCompact ? 8.5 : 9.5);
                doc.setTextColor(15, 23, 42);
                doc.text(section.title.toUpperCase(), margin + 4.5, yPos + 0.2);
                yPos += isCompact ? 5.5 : 7.5;

                // Resolve Fields
                let fieldsToRender = section.fields;
                if (section.type === 'medical_section') {
                    if (window.MedicalHistorySystem && typeof window.MedicalHistorySystem.getMedicalSection === 'function') {
                        fieldsToRender = window.MedicalHistorySystem.getMedicalSection().fields;
                    } else if (window.medicalQuestions) {
                        fieldsToRender = Object.values(window.medicalQuestions);
                    }
                }

                if (fieldsToRender && fieldsToRender.length > 0) {
                    const renderSingleField = (field, isNested = false) => {
                        if (field.type === 'section_header' || field.type === 'header') {
                            if (yPos > pageHeight - 20) {
                                doc.addPage();
                                yPos = margin;
                            }
                            doc.setFillColor(248, 250, 252);
                            doc.setDrawColor(226, 232, 240);
                            doc.setLineWidth(0.2);
                            doc.roundedRect(margin + (isNested ? 4 : 0), yPos - 3, contentWidth - (isNested ? 4 : 0), isCompact ? 5 : 6.5, 0.5, 0.5, 'FD');

                            doc.setFont('helvetica', 'bold');
                            doc.setFontSize(isCompact ? 8 : 9);
                            doc.setTextColor(30, 41, 59);
                            doc.text(field.label || 'Section Header', margin + (isNested ? 6 : 3), yPos + 0.6);
                            yPos += isCompact ? 4.8 : 6;

                            if (field.helpText || field.helperText) {
                                const hText = field.helpText || field.helperText;
                                doc.setFont('helvetica', 'italic');
                                doc.setFontSize(isCompact ? 6.8 : 7.5);
                                doc.setTextColor(100, 116, 139);
                                const hLines = doc.splitTextToSize(hText, contentWidth - (isNested ? 8 : 4));
                                doc.text(hLines, margin + (isNested ? 6 : 3), yPos);
                                yPos += (hLines.length * (isCompact ? 2.8 : 3.5)) + (isCompact ? 1.5 : 2.5);
                            }
                            return;
                        }

                        if (field.type === 'container') {
                            if (yPos > pageHeight - 25) {
                                doc.addPage();
                                yPos = margin;
                            }
                            doc.setFont('helvetica', 'bold');
                            doc.setFontSize(isCompact ? 8 : 9);
                            doc.setTextColor(15, 23, 42);
                            doc.text(field.label || 'Grouped Panel', margin + 2, yPos);
                            yPos += isCompact ? 3.8 : 4.5;

                            if (field.helpText || field.helperText) {
                                const cText = field.helpText || field.helperText;
                                doc.setFont('helvetica', 'italic');
                                doc.setFontSize(isCompact ? 6.8 : 7.5);
                                doc.setTextColor(100, 116, 139);
                                const cLines = doc.splitTextToSize(cText, contentWidth - 4);
                                doc.text(cLines, margin + 2, yPos);
                                yPos += (cLines.length * (isCompact ? 2.8 : 3.5)) + (isCompact ? 1.5 : 2);
                            }

                            if (Array.isArray(field.fields)) {
                                field.fields.forEach(cf => renderSingleField(cf, true));
                            }
                            yPos += isCompact ? 1.5 : 2;
                            return;
                        }

                        // Skip standalone signature field in main body (rendered in dedicated signature block)
                        if (field.type === 'signature') return;

                        // Feature 1: Body Map Anatomical Diagram in PDF
                        if (field.type === 'body_map') {
                            const mapData = responses[field.id];
                            const imgUrl = typeof mapData === 'string' ? mapData : (mapData && (mapData.imageDataUrl || mapData.image));
                            if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('data:image')) {
                                const mapH = isCompact ? 38 : 46;
                                const mapW = isCompact ? 48 : 58;
                                if (yPos + mapH + 10 > pageHeight - margin - 15) {
                                    doc.addPage();
                                    yPos = margin;
                                }
                                doc.setFont('helvetica', 'bold');
                                doc.setFontSize(isCompact ? 7.8 : 8.5);
                                doc.setTextColor(71, 85, 105);
                                doc.text(`${field.label || 'Anatomical Placement Diagram'}:`, margin + 2 + (isNested ? 4 : 0), yPos);
                                yPos += 4;
                                try {
                                    doc.addImage(imgUrl, 'PNG', margin + 2 + (isNested ? 4 : 0), yPos, mapW, mapH);
                                    yPos += mapH + (isCompact ? 2 : 4);
                                } catch (e) {
                                    console.warn('PDFGenerator: Could not embed body map image', e);
                                }
                                return;
                            }
                        }

                        // Feature 3: Photo ID & Reference Art in PDF
                        if (field.type === 'photo_id') {
                            const photoList = responses[field.id];
                            const photos = Array.isArray(photoList) ? photoList : (photoList && photoList.dataUrl ? [photoList] : []);
                            if (photos.length > 0) {
                                const thumbH = isCompact ? 24 : 30;
                                const thumbW = isCompact ? 32 : 40;
                                if (yPos + thumbH + 12 > pageHeight - margin - 15) {
                                    doc.addPage();
                                    yPos = margin;
                                }
                                doc.setFont('helvetica', 'bold');
                                doc.setFontSize(isCompact ? 7.8 : 8.5);
                                doc.setTextColor(71, 85, 105);
                                doc.text(`${field.label || 'Photo ID & Reference Art'} (${photos.length} item${photos.length > 1 ? 's' : ''}):`, margin + 2 + (isNested ? 4 : 0), yPos);
                                yPos += 4;
                                let currentX = margin + 2 + (isNested ? 4 : 0);
                                for (const p of photos) {
                                    const imgData = p.dataUrl || (typeof p === 'string' ? p : null);
                                    if (imgData && typeof imgData === 'string' && imgData.startsWith('data:image')) {
                                        if (currentX + thumbW > pageWidth - margin) {
                                            currentX = margin + 2 + (isNested ? 4 : 0);
                                            yPos += thumbH + 4;
                                            if (yPos + thumbH > pageHeight - margin - 15) {
                                                doc.addPage();
                                                yPos = margin;
                                            }
                                        }
                                        try {
                                            doc.addImage(imgData, 'JPEG', currentX, yPos, thumbW, thumbH);
                                            currentX += thumbW + 4;
                                        } catch (e) {
                                            console.warn('PDFGenerator: Could not embed photo', e);
                                        }
                                    }
                                }
                                yPos += thumbH + (isCompact ? 2 : 4);
                                return;
                            }
                        }

                        // Get response
                        let respValue = responses[field.id];
                        let displayValue = '—';

                        if (respValue !== undefined && respValue !== null && respValue !== '') {
                            if (Array.isArray(respValue)) {
                                displayValue = respValue.length > 0 ? respValue.join(', ') : 'None selected';
                            } else if (typeof respValue === 'boolean') {
                                displayValue = respValue ? 'Yes / Agreed & Acknowledged' : 'No / Unchecked';
                            } else {
                                displayValue = String(respValue);
                            }
                        }

                        // Feature 2: If date of birth, calculate and append age in PDF
                        if (field.type === 'date' && respValue && typeof respValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(respValue)) {
                            const dob = new Date(respValue);
                            if (!isNaN(dob.getTime())) {
                                const today = new Date();
                                let age = today.getFullYear() - dob.getFullYear();
                                const m = today.getMonth() - dob.getMonth();
                                if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                                    age--;
                                }
                                if (age >= 0 && age <= 120) {
                                    displayValue += age < 18 ? ` (Age: ${age} - Minor, Guardian Consent Attached)` : ` (Age: ${age} - Adult)`;
                                }
                            }
                        }

                        // Text dimensions
                        const offsetLeft = isNested ? 4 : 0;
                        const availWidth = contentWidth - offsetLeft;
                        const labelWidth = availWidth * 0.42;
                        const valueWidth = availWidth * 0.55;

                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(isCompact ? 7.8 : 8.5);
                        doc.setTextColor(71, 85, 105);
                        const labelLines = doc.splitTextToSize(`${field.label}${field.required ? ' *' : ''}:`, labelWidth);

                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(isCompact ? 7.8 : 8.5);
                        doc.setTextColor(15, 23, 42);
                        const valueLines = doc.splitTextToSize(displayValue, valueWidth);

                        const rowMultiplier = isCompact ? 2.9 : 3.8;
                        const rowPadding = isCompact ? 1.4 : 2.2;
                        const rowHeight = Math.max(labelLines.length, valueLines.length) * rowMultiplier + rowPadding;

                        // Page Overflow check
                        if (yPos + rowHeight > pageHeight - margin - 15) {
                            doc.addPage();
                            yPos = margin;
                        }

                        // Draw label and value
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(71, 85, 105);
                        doc.text(labelLines, margin + 2 + offsetLeft, yPos);

                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(15, 23, 42);
                        doc.text(valueLines, margin + labelWidth + 3 + offsetLeft, yPos);

                        // Subtle row border
                        doc.setDrawColor(241, 245, 249);
                        doc.setLineWidth(0.15);
                        doc.line(margin + 2 + offsetLeft, yPos + rowHeight - 0.8, pageWidth - margin - 2, yPos + rowHeight - 0.8);

                        yPos += rowHeight;
                    };

                    for (const field of fieldsToRender) {
                        renderSingleField(field, false);
                    }
                }

                yPos += isCompact ? 2.0 : 3.5; // Spacing after section
            }
        }

        // =========================================================
        // 3. DEDICATED OFFICIAL SIGNATURE & CERTIFICATION BLOCK
        // =========================================================
        const sigBlockHeight = isCompact ? 44 : 54;
        if (yPos > pageHeight - (sigBlockHeight + 12)) {
            doc.addPage();
            yPos = margin;
        }

        yPos += isCompact ? 2 : 3;
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, yPos, contentWidth, sigBlockHeight, 1.5, 1.5, 'FD');

        // Header for signature block
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(isCompact ? 8.5 : 9.5);
        doc.setTextColor(15, 23, 42);
        doc.text('LEGAL CERTIFICATION & SIGNATURE ATTESTATION', margin + 3.5, yPos + (isCompact ? 4.8 : 6));

        // Legal Declaration Clause
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(isCompact ? 6.8 : 7.5);
        doc.setTextColor(71, 85, 105);
        const legalDisclaimer = 'I solemnly certify under penalty of false statement that all information and medical disclosures provided in this form are true, accurate, and complete. I confirm that I am in full capacity of reflection and sound mind, and freely authorize the studio practitioner to proceed with the requested service.';
        const legalLines = doc.splitTextToSize(legalDisclaimer, contentWidth - 7);
        doc.text(legalLines, margin + 3.5, yPos + (isCompact ? 8.5 : 10.5));

        const sigBlockY = yPos + (isCompact ? 14 : 18);

        // Left Side: Client Digital Signature
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text('Client Signature & Verification:', margin + 4, sigBlockY);

        if (signatureImage) {
            try {
                const sigWidth = 48;
                const sigHeight = 18;
                doc.setFillColor(255, 255, 255);
                doc.rect(margin + 4, sigBlockY + 2, sigWidth, sigHeight, 'F');
                doc.setDrawColor(203, 213, 225);
                doc.rect(margin + 4, sigBlockY + 2, sigWidth, sigHeight, 'D');
                doc.addImage(signatureImage, 'PNG', margin + 5, sigBlockY + 3, sigWidth - 2, sigHeight - 2);
            } catch (err) {
                console.warn('Signature image embed fallback:', err);
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(8);
                doc.text('[Digitally Verified On-Screen]', margin + 4, sigBlockY + 10);
            }
        } else {
            // Signature placeholder line
            doc.setDrawColor(15, 23, 42);
            doc.setLineWidth(0.4);
            doc.line(margin + 4, sigBlockY + 16, margin + 65, sigBlockY + 16);
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7.5);
            doc.setTextColor(148, 163, 184);
            doc.text('X Sign above or capture on tablet', margin + 4, sigBlockY + 20);
        }

        // Right Side: Practitioner Counter-Signature & Audit Timestamp
        const rightColX = margin + (contentWidth * 0.52);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text('Studio Practitioner Acknowledgment:', rightColX, sigBlockY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`Practitioner: ${practitionerName}`, rightColX, sigBlockY + 5);
        doc.text(`Verification ID: ${formDocId}`, rightColX, sigBlockY + 9);
        doc.text(`Timestamp: ${new Date().toLocaleString()}`, rightColX, sigBlockY + 13);

        // Counter-signature line
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.3);
        doc.line(rightColX, sigBlockY + 24, pageWidth - margin - 4, sigBlockY + 24);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text('Practitioner Counter-Signature & Health Permit Record', rightColX, sigBlockY + 28);

        // =========================================================
        // 4. APPLY STUDIO WATERMARK & FOOTER ON ALL PAGES
        // =========================================================
        PDFGenerator.applyWatermark(doc, settings);

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // Subtle footer top line
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.2);
            doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(148, 163, 184);
            
            // Left footer
            doc.text('Confidential Studio Consultation Record • Poli Tools', margin, pageHeight - 7);
            
            // Right footer: page number
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
        }

        // Trigger Download
        const cleanName = (formData.name || 'consultation_form').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${cleanName}_${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(filename);
    },

    applyWatermark: (doc, settings) => {
        if (!settings || !settings.watermarkEnabled || !settings.logoDataUrl) return;
        try {
            const totalPages = doc.internal.getNumberOfPages();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const size = parseFloat(settings.watermarkSize || 80);
            const opacity = parseFloat(settings.watermarkOpacity || 0.15);

            for (let p = 1; p <= totalPages; p++) {
                doc.setPage(p);
                let hasGState = false;
                if (typeof doc.GState === 'function' && typeof doc.setGState === 'function') {
                    doc.setGState(new doc.GState({ opacity: opacity }));
                    hasGState = true;
                }

                const x = (pageWidth - size) / 2;
                const y = (pageHeight - size) / 2;
                const format = (settings.logoDataUrl.includes('image/jpeg') || settings.logoDataUrl.includes('image/jpg')) ? 'JPEG' : 'PNG';
                
                doc.addImage(settings.logoDataUrl, format, x, y, size, size, undefined, 'FAST');

                if (hasGState) {
                    doc.setGState(new doc.GState({ opacity: 1.0 }));
                }
            }
        } catch (err) {
            console.warn('Watermark render error:', err);
        }
    },

    generateSchemaMappingPDF: async (formData) => {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            console.error('jsPDF library not found');
            alert('PDF Library not loaded. Please ensure jsPDF script is loaded.');
            return;
        }

        if (!formData) {
            alert('No form data available to export schema mapping.');
            return;
        }

        const settings = PDFGenerator.getSettings();
        const doc = new jsPDF({
            orientation: settings.orientation || 'portrait',
            unit: 'mm',
            format: settings.paperSize || 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 16;
        const contentWidth = pageWidth - (margin * 2);
        let yPos = margin;

        // Top Brand Accent Bar (Slate Navy & Royal Blue)
        doc.setFillColor(15, 23, 42);
        doc.rect(margin, yPos, contentWidth, 3, 'F');
        doc.setFillColor(37, 99, 235);
        doc.rect(margin + (contentWidth * 0.7), yPos, contentWidth * 0.3, 3, 'F');
        yPos += 7;

        // Studio Specification Heading
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12.5);
        doc.setTextColor(15, 23, 42);
        doc.text('FORM SCHEMA MAPPING & VALIDATION SPECIFICATION GUIDE', margin, yPos);

        const docId = `SPEC-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        doc.setFontSize(8.5);
        doc.setTextColor(37, 99, 235);
        doc.text(`GUIDE ID: ${docId}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 4.5;

        // Subtitle line
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('POLI INTERNATIONAL • Client Architecture, CRM Key Mapping & Field Validation Reference', margin, yPos);
        const dateStr = `Exported: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;
        doc.text(dateStr, pageWidth - margin, yPos, { align: 'right' });
        yPos += 5.5;

        // Form Title Banner Box
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, yPos, contentWidth, 19, 1, 1, 'FD');

        let totalSections = formData.sections ? formData.sections.filter(s => !s.hidden).length : 0;
        let totalFields = 0;
        let requiredFields = 0;
        let conditionalRules = 0;

        const countStats = (fields) => {
            if (!fields) return;
            fields.forEach(f => {
                if (f.type !== 'section_header' && f.type !== 'header') totalFields++;
                if (f.required || f.critical) requiredFields++;
                if (f.conditional && f.conditional.show_if) conditionalRules++;
                if (f.type === 'container' && Array.isArray(f.fields)) countStats(f.fields);
            });
        };

        if (formData.sections) {
            formData.sections.forEach(s => {
                if (!s.hidden) {
                    if (s.type === 'medical_section') {
                        totalFields += 7;
                        requiredFields += 7;
                    } else {
                        countStats(s.fields);
                    }
                }
            });
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text((formData.name || 'CUSTOM CONSULTATION FORM').toUpperCase(), margin + 4, yPos + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.8);
        doc.setTextColor(71, 85, 105);
        doc.text(`Category: ${formData.category || 'Studio Consultation'}  •  Schema Version: 1.0 (Production Schema)`, margin + 4, yPos + 9);

        // Metric badges row
        const badgeW = (contentWidth - 10) / 4;
        const badgeY = yPos + 11.5;
        const metrics = [
            { label: 'Active Sections', val: `${totalSections} Sections` },
            { label: 'Input Fields', val: `${totalFields} Fields` },
            { label: 'Required Data', val: `${requiredFields} Mandatory` },
            { label: 'Logic Rules', val: `${conditionalRules} Conditional` }
        ];

        metrics.forEach((m, idx) => {
            const bx = margin + 4 + (idx * (badgeW + 2));
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(226, 232, 240);
            doc.roundedRect(bx, badgeY, badgeW, 5.5, 0.5, 0.5, 'FD');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(37, 99, 235);
            doc.text(m.val, bx + 2, badgeY + 3.8);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6.5);
            doc.setTextColor(100, 116, 139);
            doc.text(`(${m.label})`, bx + badgeW - 2, badgeY + 3.8, { align: 'right' });
        });

        yPos += 23;

        // Executive Schema Guidance
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text('Client Integration & Field Validation Specification:', margin, yPos);
        yPos += 4;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        const guideText = 'This schema guide provides a complete blueprint of the consultation document for administrative, CRM, and technical onboarding. It defines field mapping keys (aliases), data types, required constraints, option sets, and conditional visibility triggers.';
        const gLines = doc.splitTextToSize(guideText, contentWidth);
        doc.text(gLines, margin, yPos);
        yPos += (gLines.length * 3.4) + 4;

        // Section & Field Tables
        if (formData.sections && formData.sections.length > 0) {
            formData.sections.forEach((section, sIdx) => {
                if (section.hidden) return;

                if (yPos > pageHeight - 35) {
                    doc.addPage();
                    yPos = margin;
                }

                // Section Ribbon
                doc.setFillColor(241, 245, 249);
                doc.setDrawColor(226, 232, 240);
                doc.setLineWidth(0.2);
                doc.roundedRect(margin, yPos - 3.5, contentWidth, 6.5, 1, 1, 'FD');
                doc.setFillColor(37, 99, 235);
                doc.rect(margin, yPos - 3.5, 2.5, 6.5, 'F');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(15, 23, 42);
                const isMed = section.type === 'medical_section';
                doc.text(`SECTION ${sIdx + 1}: ${section.title.toUpperCase()}${isMed ? ' (AUTO-INJECTED MEDICAL MODULE)' : ''}`, margin + 5, yPos + 1);
                yPos += 6.5;

                // Table Column Header
                doc.setFillColor(226, 232, 240);
                doc.rect(margin, yPos - 2.5, contentWidth, 5, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(7);
                doc.setTextColor(51, 65, 85);
                
                const c1 = margin + 2;
                const c2 = margin + 56;
                const c3 = margin + 84;
                const c4 = margin + 110;
                
                doc.text('FIELD LABEL & CRM ALIAS', c1, yPos + 1);
                doc.text('TYPE', c2, yPos + 1);
                doc.text('REQUIRED', c3, yPos + 1);
                doc.text('VALIDATIONS, OPTIONS & LOGIC', c4, yPos + 1);
                yPos += 5;

                let fieldsToProcess = section.fields || [];
                if (isMed) {
                    if (window.MedicalHistorySystem && typeof window.MedicalHistorySystem.getMedicalSection === 'function') {
                        fieldsToProcess = window.MedicalHistorySystem.getMedicalSection().fields;
                    } else if (window.medicalQuestions) {
                        fieldsToProcess = Object.values(window.medicalQuestions);
                    }
                }

                const renderSchemaRow = (field, indent = false) => {
                    if (yPos > pageHeight - 20) {
                        doc.addPage();
                        yPos = margin;
                    }

                    const offset = indent ? 3 : 0;
                    const fieldAlias = field.alias ? ` [#${field.alias}]` : ` [ID: ${field.id}]`;
                    const labelFull = (indent ? '↳ ' : '') + (field.label || 'Untitled Field') + fieldAlias;
                    const fieldType = (field.type || 'text').toUpperCase();
                    const isReq = !!(field.required || field.critical);
                    const reqStr = isReq ? 'MANDATORY *' : 'Optional';
                    
                    let rules = [];
                    if (field.validation && field.validation !== 'none') rules.push(`Format: ${field.validation}`);
                    if (field.minLength || field.maxLength) rules.push(`Length: ${field.minLength || 0}-${field.maxLength || '∞'}`);
                    if (field.options && field.options.length > 0) rules.push(`Options (${field.options.length}): [${field.options.slice(0, 3).join(', ')}${field.options.length > 3 ? '...' : ''}]`);
                    if (field.conditional && field.conditional.show_if) {
                        rules.push(`Conditional: Show when #${field.conditional.show_if.field} ${field.conditional.show_if.operator} "${field.conditional.show_if.value}"`);
                    }
                    if (field.type === 'section_header') {
                        rules.push(field.collapsible ? 'Collapsible Header Group' : 'Static Group Header');
                    }
                    if (field.type === 'container') {
                        const childLen = field.fields ? field.fields.length : 0;
                        rules.push(`Nested container (${childLen} child fields, ${field.containerStyle || 'bordered'} style)`);
                    }
                    if (rules.length === 0) rules.push('Standard input formatting');

                    const rulesStr = rules.join('  •  ');

                    const col1Lines = doc.splitTextToSize(labelFull, 52 - offset);
                    const col4Lines = doc.splitTextToSize(rulesStr, contentWidth - 112);
                    const rowH = Math.max(col1Lines.length, col4Lines.length) * 3.2 + 2;

                    doc.setFont('helvetica', (field.type === 'section_header' || field.type === 'container') ? 'bold' : 'normal');
                    doc.setFontSize(6.8);
                    doc.setTextColor((field.type === 'section_header' || field.type === 'container') ? 30 : 15, 23, 42);
                    doc.text(col1Lines, c1 + offset, yPos + 0.5);

                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(6.5);
                    doc.setTextColor(71, 85, 105);
                    doc.text(fieldType, c2, yPos + 0.5);

                    doc.setFont('helvetica', isReq ? 'bold' : 'normal');
                    doc.setTextColor(isReq ? 220 : 100, isReq ? 38 : 116, isReq ? 38 : 139);
                    doc.text(reqStr, c3, yPos + 0.5);

                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(51, 65, 85);
                    doc.text(col4Lines, c4, yPos + 0.5);

                    // Row divider line
                    doc.setDrawColor(241, 245, 249);
                    doc.setLineWidth(0.2);
                    doc.line(margin, yPos + rowH - 1, pageWidth - margin, yPos + rowH - 1);

                    yPos += rowH;

                    if (field.type === 'container' && Array.isArray(field.fields)) {
                        field.fields.forEach(childF => renderSchemaRow(childF, true));
                    }
                };

                if (fieldsToProcess && fieldsToProcess.length > 0) {
                    fieldsToProcess.forEach(f => renderSchemaRow(f, false));
                } else {
                    doc.setFont('helvetica', 'italic');
                    doc.setFontSize(7);
                    doc.setTextColor(148, 163, 184);
                    doc.text('No fields configured in this section.', c1, yPos + 2);
                    yPos += 5;
                }
                yPos += 4;
            });
        }

        // Apply watermark on all pages
        PDFGenerator.applyWatermark(doc, settings);

        // Add page footers
        const totalPages = doc.internal.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
            doc.setPage(p);
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.2);
            doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(148, 163, 184);
            doc.text('Confidential Schema Mapping & Validation Reference • Poli International', margin, pageHeight - 7);
            doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
        }

        const cleanName = (formData.name || 'form_schema').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        doc.save(`${cleanName}_schema_mapping_guide.pdf`);
    },

    getSettings: () => {
        try {
            const saved = localStorage.getItem('poli_pdf_generator_settings');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn('Failed to load PDF settings:', e);
        }
        return {
            printAfterSignature: false,
            autoDownloadPdf: true,
            layoutDensity: 'standard',
            paperSize: 'a4',
            orientation: 'portrait',
            watermarkEnabled: true,
            watermarkOpacity: '0.15',
            watermarkSize: '80',
            logoDataUrl: null,
            logoFilename: null,
            signatureInkColor: 'blue',
            signatureThickness: 'standard'
        };
    },

    saveSettings: (settings) => {
        try {
            localStorage.setItem('poli_pdf_generator_settings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to save PDF settings:', e);
        }
    },

    initModal: () => {
        const modal = document.getElementById('pdf-settings-modal');
        if (!modal) return;

        const closeBtn = document.getElementById('btn-close-pdf-settings');
        const saveBtn = document.getElementById('btn-save-pdf-settings');
        const watermarkEnable = document.getElementById('pdf-setting-watermark-enable');
        const logoInput = document.getElementById('pdf-setting-logo-input');
        const logoDropzone = document.getElementById('pdf-logo-dropzone');
        const logoEmptyView = document.getElementById('pdf-logo-empty-view');
        const logoPreviewView = document.getElementById('pdf-logo-preview-view');
        const logoPreviewImg = document.getElementById('pdf-logo-preview-img');
        const logoFilename = document.getElementById('pdf-logo-filename');
        const btnChangeLogo = document.getElementById('btn-change-pdf-logo');
        const btnRemoveLogo = document.getElementById('btn-remove-pdf-logo');
        const watermarkOpacity = document.getElementById('pdf-setting-watermark-opacity');
        const watermarkSize = document.getElementById('pdf-setting-watermark-size');
        const printAfterSig = document.getElementById('pdf-setting-print-after-sig');
        const paperSize = document.getElementById('pdf-setting-paper-size');
        const orientation = document.getElementById('pdf-setting-orientation');
        const standardRadio = document.getElementById('pdf-density-standard');
        const compactRadio = document.getElementById('pdf-density-compact');
        const standardLabel = document.getElementById('label-density-standard');
        const compactLabel = document.getElementById('label-density-compact');

        // Signature styling controls
        const inkBlueRadio = document.getElementById('sig-ink-blue');
        const inkBlackRadio = document.getElementById('sig-ink-black');
        const inkRedRadio = document.getElementById('sig-ink-red');
        const labelInkBlue = document.getElementById('label-ink-blue');
        const labelInkBlack = document.getElementById('label-ink-black');
        const labelInkRed = document.getElementById('label-ink-red');

        const thickThinRadio = document.getElementById('sig-thick-thin');
        const thickStandardRadio = document.getElementById('sig-thick-standard');
        const thickBoldRadio = document.getElementById('sig-thick-bold');
        const labelThickThin = document.getElementById('label-thick-thin');
        const labelThickStandard = document.getElementById('label-thick-standard');
        const labelThickBold = document.getElementById('label-thick-bold');

        const sigSampleRender = document.getElementById('sig-sample-stroke-render');

        let tempLogoDataUrl = null;
        let tempLogoFilename = null;
        let selectedInk = 'blue';
        let selectedThickness = 'standard';

        const updateSigSamplePreview = () => {
            if (!sigSampleRender) return;
            let colorHex = '#1d4ed8';
            if (selectedInk === 'black') colorHex = '#0f172a';
            else if (selectedInk === 'red') colorHex = '#dc2626';

            let strokeFontWeight = '500';
            let strokeShadow = 'none';
            if (selectedThickness === 'thin') {
                strokeFontWeight = '400';
            } else if (selectedThickness === 'bold') {
                strokeFontWeight = '800';
                strokeShadow = `0 0 1px ${colorHex}`;
            }

            sigSampleRender.style.color = colorHex;
            sigSampleRender.style.fontWeight = strokeFontWeight;
            sigSampleRender.style.textShadow = strokeShadow;
        };

        const syncInkVisuals = (ink) => {
            selectedInk = ink || 'blue';
            const inkMap = {
                blue: { radio: inkBlueRadio, label: labelInkBlue },
                black: { radio: inkBlackRadio, label: labelInkBlack },
                red: { radio: inkRedRadio, label: labelInkRed }
            };

            Object.keys(inkMap).forEach(key => {
                const item = inkMap[key];
                if (item.radio) item.radio.checked = (key === selectedInk);
                if (item.label) {
                    if (key === selectedInk) {
                        item.label.style.border = '2px solid #2563eb';
                        item.label.style.background = '#eff6ff';
                    } else {
                        item.label.style.border = '2px solid #cbd5e1';
                        item.label.style.background = '#ffffff';
                    }
                }
            });
            updateSigSamplePreview();
        };

        const syncThicknessVisuals = (thickness) => {
            selectedThickness = thickness || 'standard';
            const thickMap = {
                thin: { radio: thickThinRadio, label: labelThickThin },
                standard: { radio: thickStandardRadio, label: labelThickStandard },
                bold: { radio: thickBoldRadio, label: labelThickBold }
            };

            Object.keys(thickMap).forEach(key => {
                const item = thickMap[key];
                if (item.radio) item.radio.checked = (key === selectedThickness);
                if (item.label) {
                    if (key === selectedThickness) {
                        item.label.style.border = '2px solid #2563eb';
                        item.label.style.background = '#eff6ff';
                    } else {
                        item.label.style.border = '2px solid #cbd5e1';
                        item.label.style.background = '#ffffff';
                    }
                }
            });
            updateSigSamplePreview();
        };

        const syncDensityVisuals = (density) => {
            if (density === 'compact') {
                if (compactRadio) compactRadio.checked = true;
                if (compactLabel) {
                    compactLabel.style.border = '2px solid #2563eb';
                    compactLabel.style.background = '#eff6ff';
                }
                if (standardLabel) {
                    standardLabel.style.border = '2px solid #cbd5e1';
                    standardLabel.style.background = '#ffffff';
                }
            } else {
                if (standardRadio) standardRadio.checked = true;
                if (standardLabel) {
                    standardLabel.style.border = '2px solid #2563eb';
                    standardLabel.style.background = '#eff6ff';
                }
                if (compactLabel) {
                    compactLabel.style.border = '2px solid #cbd5e1';
                    compactLabel.style.background = '#ffffff';
                }
            }
        };

        const loadCurrentSettingsToUI = () => {
            const s = PDFGenerator.getSettings();
            if (watermarkEnable) watermarkEnable.checked = s.watermarkEnabled !== false;
            if (watermarkOpacity) watermarkOpacity.value = s.watermarkOpacity || '0.15';
            if (watermarkSize) watermarkSize.value = s.watermarkSize || '80';
            if (printAfterSig) printAfterSig.checked = !!s.printAfterSignature;
            if (paperSize) paperSize.value = s.paperSize || 'a4';
            if (orientation) orientation.value = s.orientation || 'portrait';

            syncDensityVisuals(s.layoutDensity || 'standard');
            syncInkVisuals(s.signatureInkColor || 'blue');
            syncThicknessVisuals(s.signatureThickness || 'standard');

            tempLogoDataUrl = s.logoDataUrl || null;
            tempLogoFilename = s.logoFilename || null;

            if (tempLogoDataUrl && logoPreviewView && logoEmptyView) {
                logoEmptyView.style.display = 'none';
                logoPreviewView.style.display = 'flex';
                if (logoPreviewImg) logoPreviewImg.src = tempLogoDataUrl;
                if (logoFilename) logoFilename.textContent = tempLogoFilename || 'studio_logo.png';
            } else if (logoPreviewView && logoEmptyView) {
                logoEmptyView.style.display = 'block';
                logoPreviewView.style.display = 'none';
            }
        };

        const handleLogoFile = (file) => {
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                tempLogoDataUrl = e.target.result;
                tempLogoFilename = file.name;
                if (logoPreviewImg) logoPreviewImg.src = tempLogoDataUrl;
                if (logoFilename) logoFilename.textContent = tempLogoFilename;
                if (logoEmptyView) logoEmptyView.style.display = 'none';
                if (logoPreviewView) logoPreviewView.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        };

        if (logoDropzone && logoInput) {
            logoDropzone.addEventListener('click', (e) => {
                if (e.target.closest('#btn-remove-pdf-logo') || e.target.closest('#btn-change-pdf-logo')) return;
                logoInput.click();
            });
            logoDropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                logoDropzone.style.borderColor = '#2563eb';
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
            logoInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    handleLogoFile(e.target.files[0]);
                    e.target.value = '';
                }
            });
        }

        if (btnChangeLogo && logoInput) {
            btnChangeLogo.addEventListener('click', (e) => {
                e.stopPropagation();
                logoInput.click();
            });
        }

        if (btnRemoveLogo) {
            btnRemoveLogo.addEventListener('click', (e) => {
                e.stopPropagation();
                tempLogoDataUrl = null;
                tempLogoFilename = null;
                if (logoEmptyView) logoEmptyView.style.display = 'block';
                if (logoPreviewView) logoPreviewView.style.display = 'none';
                if (logoPreviewImg) logoPreviewImg.src = '';
            });
        }

        if (labelInkBlue) labelInkBlue.addEventListener('click', () => syncInkVisuals('blue'));
        if (labelInkBlack) labelInkBlack.addEventListener('click', () => syncInkVisuals('black'));
        if (labelInkRed) labelInkRed.addEventListener('click', () => syncInkVisuals('red'));
        if (inkBlueRadio) inkBlueRadio.addEventListener('change', () => syncInkVisuals('blue'));
        if (inkBlackRadio) inkBlackRadio.addEventListener('change', () => syncInkVisuals('black'));
        if (inkRedRadio) inkRedRadio.addEventListener('change', () => syncInkVisuals('red'));

        if (labelThickThin) labelThickThin.addEventListener('click', () => syncThicknessVisuals('thin'));
        if (labelThickStandard) labelThickStandard.addEventListener('click', () => syncThicknessVisuals('standard'));
        if (labelThickBold) labelThickBold.addEventListener('click', () => syncThicknessVisuals('bold'));
        if (thickThinRadio) thickThinRadio.addEventListener('change', () => syncThicknessVisuals('thin'));
        if (thickStandardRadio) thickStandardRadio.addEventListener('change', () => syncThicknessVisuals('standard'));
        if (thickBoldRadio) thickBoldRadio.addEventListener('change', () => syncThicknessVisuals('bold'));

        if (standardLabel) {
            standardLabel.addEventListener('click', () => syncDensityVisuals('standard'));
        }
        if (compactLabel) {
            compactLabel.addEventListener('click', () => syncDensityVisuals('compact'));
        }
        if (standardRadio) {
            standardRadio.addEventListener('change', () => syncDensityVisuals('standard'));
        }
        if (compactRadio) {
            compactRadio.addEventListener('change', () => syncDensityVisuals('compact'));
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const density = compactRadio && compactRadio.checked ? 'compact' : 'standard';
                const newSettings = {
                    printAfterSignature: printAfterSig ? printAfterSig.checked : false,
                    autoDownloadPdf: true,
                    layoutDensity: density,
                    paperSize: paperSize ? paperSize.value : 'a4',
                    orientation: orientation ? orientation.value : 'portrait',
                    watermarkEnabled: watermarkEnable ? watermarkEnable.checked : true,
                    watermarkOpacity: watermarkOpacity ? watermarkOpacity.value : '0.15',
                    watermarkSize: watermarkSize ? watermarkSize.value : '80',
                    logoDataUrl: tempLogoDataUrl,
                    logoFilename: tempLogoFilename,
                    signatureInkColor: selectedInk,
                    signatureThickness: selectedThickness
                };

                PDFGenerator.saveSettings(newSettings);
                modal.style.display = 'none';

                // Reapply settings to any live signature pads
                if (window.formPreview && window.formPreview.signatureManagers) {
                    Object.values(window.formPreview.signatureManagers).forEach(mgr => {
                        if (mgr && typeof mgr.applyStyleSettings === 'function') {
                            mgr.applyStyleSettings();
                        }
                    });
                }

                if (window.formBuilder && typeof window.formBuilder.showToast === 'function') {
                    window.formBuilder.showToast(`PDF settings saved! Layout: ${density}, Ink: ${selectedInk}.`, 'success');
                } else if (window.FormBuilderApp && typeof window.FormBuilderApp.showToast === 'function') {
                    window.FormBuilderApp.showToast(`PDF settings saved! Layout: ${density}, Ink: ${selectedInk}.`, 'success');
                }
            });
        }

        // Populate when open button is clicked
        const openBtn = document.getElementById('btn-open-pdf-settings');
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                loadCurrentSettingsToUI();
                if (window.i18n && typeof window.i18n.translateDOM === 'function') {
                    window.i18n.translateDOM(modal);
                }
                modal.style.display = 'flex';
            });
        }

        loadCurrentSettingsToUI();
    }
};

window.PDFGenerator = PDFGenerator;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PDFGenerator.initModal());
} else {
    PDFGenerator.initModal();
}

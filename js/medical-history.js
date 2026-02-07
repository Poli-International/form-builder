/**
 * Medical History System
 * Poli International - Tool #13
 */

const medicalQuestions = {
    allergies: {
        id: 'allergies',
        type: 'checkbox_group',
        label: 'Allergies (check all that apply)',
        options: [
            'Latex',
            'Adhesives',
            'Metals (nickel, etc.)',
            'Antibiotics',
            'Topical anesthetics',
            'Ink ingredients',
            'Other (please specify)'
        ],
        other_field: true,
        critical: true
    },
    conditions: {
        id: 'conditions',
        type: 'checkbox_group',
        label: 'Medical Conditions',
        options: [
            'Diabetes',
            'Hemophilia / Bleeding disorder',
            'Heart condition',
            'Epilepsy / Seizures',
            'Skin conditions (eczema, psoriasis)',
            'Keloid scarring tendency',
            'Immune system disorder',
            'Hepatitis',
            'HIV/AIDS',
            'Other (please specify)'
        ],
        other_field: true,
        critical: true
    },
    medications: {
        id: 'medications',
        type: 'textarea',
        label: 'Current Medications',
        placeholder: 'List all prescription and OTC medications',
        rows: 3
    },
    blood_thinners: {
        id: 'blood_thinners',
        type: 'radio',
        label: 'Taking blood thinners or aspirin?',
        options: ['Yes', 'No'],
        required: true,
        critical: true
    },
    pregnant: {
        id: 'pregnant',
        type: 'radio',
        label: 'Pregnant or nursing?',
        options: ['Yes', 'No', 'Not applicable'],
        required: true,
        critical: true
    },
    alcohol_24hrs: {
        id: 'alcohol_24hrs',
        type: 'radio',
        label: 'Consumed alcohol in last 24 hours?',
        options: ['Yes', 'No'],
        required: true
    },
    eaten_4hrs: {
        id: 'eaten_4hrs',
        type: 'radio',
        label: 'Eaten within last 4 hours?',
        options: ['Yes', 'No'],
        required: true
    }
};

const MedicalHistorySystem = {
    getMedicalSection: () => {
        // Return a section structure compatible with the Form Builder sections
        return {
            id: 'medical_history_generated',
            title: 'Medical History',
            fields: Object.values(medicalQuestions)
        };
    },

    validateMedicalHistory: (responses) => {
        const errors = [];
        // Check critical fields
        for (const key in medicalQuestions) {
            const q = medicalQuestions[key];
            if (q.required || q.critical) {
                if (!responses[q.id] || responses[q.id] === '' || (Array.isArray(responses[q.id]) && responses[q.id].length === 0)) {
                    // It's empty. Is it allowed?
                    if (q.required) {
                        errors.push(`Please answer: ${q.label}`);
                    }
                }
            }
        }
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // Helper to format for PDF usage
    // Returns an array of lines or objects { label, value }
    formatForPDF: (responses) => {
        const formatted = [];
        for (const key in medicalQuestions) {
            const q = medicalQuestions[key];
            let val = responses[q.id] || 'N/A';

            if (Array.isArray(val)) {
                val = val.join(', ');
            }

            formatted.push({
                label: q.label,
                value: val,
                isCritical: q.critical || false
            });
        }
        return formatted;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { medicalQuestions, MedicalHistorySystem };
} else {
    window.MedicalHistorySystem = { medicalQuestions, MedicalHistorySystem };
}

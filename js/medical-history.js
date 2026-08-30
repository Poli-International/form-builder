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
    getLocalizedQuestions: (lang = null) => {
        const cloned = JSON.parse(JSON.stringify(medicalQuestions));
        const curLang = lang || (window.i18n ? window.i18n.currentLanguage : 'en');
        const medDict = (window.i18n && window.i18n.translations) ? (window.i18n.translations[curLang]?.medical) : null;

        if (medDict) {
            if (medDict.allergies) {
                if (medDict.allergies.label) cloned.allergies.label = medDict.allergies.label;
                if (Array.isArray(medDict.allergies.options)) cloned.allergies.options = medDict.allergies.options;
            }
            if (medDict.conditions) {
                if (medDict.conditions.label) cloned.conditions.label = medDict.conditions.label;
                if (Array.isArray(medDict.conditions.options)) cloned.conditions.options = medDict.conditions.options;
            }
            if (medDict.medications) {
                if (medDict.medications.label) cloned.medications.label = medDict.medications.label;
                if (medDict.medications.placeholder) cloned.medications.placeholder = medDict.medications.placeholder;
            }
            if (medDict.blood_thinners) {
                if (medDict.blood_thinners.label) cloned.blood_thinners.label = medDict.blood_thinners.label;
                if (Array.isArray(medDict.blood_thinners.options)) cloned.blood_thinners.options = medDict.blood_thinners.options;
            }
            if (medDict.pregnant) {
                if (medDict.pregnant.label) cloned.pregnant.label = medDict.pregnant.label;
                if (Array.isArray(medDict.pregnant.options)) cloned.pregnant.options = medDict.pregnant.options;
            }
            if (medDict.alcohol_24hrs) {
                if (medDict.alcohol_24hrs.label) cloned.alcohol_24hrs.label = medDict.alcohol_24hrs.label;
                if (Array.isArray(medDict.alcohol_24hrs.options)) cloned.alcohol_24hrs.options = medDict.alcohol_24hrs.options;
            }
            if (medDict.eaten_4hrs) {
                if (medDict.eaten_4hrs.label) cloned.eaten_4hrs.label = medDict.eaten_4hrs.label;
                if (Array.isArray(medDict.eaten_4hrs.options)) cloned.eaten_4hrs.options = medDict.eaten_4hrs.options;
            }
        }
        return cloned;
    },

    getMedicalSection: (lang = null) => {
        const questions = MedicalHistorySystem.getLocalizedQuestions(lang);
        const curLang = lang || (window.i18n ? window.i18n.currentLanguage : 'en');
        const title = (window.i18n && window.i18n.translations && window.i18n.translations[curLang]?.medical?.title)
            ? window.i18n.translations[curLang].medical.title
            : (window.i18n ? window.i18n.t('medical.title', 'Medical History') : 'Medical History');
        return {
            id: 'medical_history_generated',
            title: title,
            fields: Object.values(questions)
        };
    },

    validateMedicalHistory: (responses, lang = null) => {
        const errors = [];
        const questions = MedicalHistorySystem.getLocalizedQuestions(lang);
        const prefix = (window.i18n ? window.i18n.t('medical.validation_prefix', 'Please answer:') : 'Please answer:');

        // Check critical fields
        for (const key in questions) {
            const q = questions[key];
            if (q.required || q.critical) {
                if (!responses[q.id] || responses[q.id] === '' || (Array.isArray(responses[q.id]) && responses[q.id].length === 0)) {
                    if (q.required) {
                        errors.push(`${prefix} ${q.label}`);
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
    formatForPDF: (responses, lang = null) => {
        const formatted = [];
        const questions = MedicalHistorySystem.getLocalizedQuestions(lang);
        for (const key in questions) {
            const q = questions[key];
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
    window.MedicalHistorySystem = MedicalHistorySystem;
    window.medicalQuestions = medicalQuestions;
}

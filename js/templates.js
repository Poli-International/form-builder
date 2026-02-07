/**
 * Form Builder Template Library
 * Poli International - Tool #13
 */

const formTemplates = {
    tattoo_standard: {
        id: 'tattoo_standard',
        name: 'Standard Tattoo Consultation',
        category: 'Tattoo',
        description: 'Comprehensive consultation form for standard tattoo appointments.',
        sections: [
            {
                id: 'client_info',
                title: 'Client Information',
                fields: [
                    { id: 'full_name', type: 'text', label: 'Full Legal Name', required: true, placeholder: 'John Smith', validation: 'text' },
                    { id: 'dob', type: 'date', label: 'Date of Birth', required: true },
                    { id: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'john@example.com' },
                    { id: 'phone', type: 'tel', label: 'Phone Number', required: true, placeholder: '(555) 123-4567' },
                    { id: 'address', type: 'textarea', label: 'Home Address', required: true, rows: 2 },
                    { id: 'emergency_contact', type: 'text', label: 'Emergency Contact (Name & Phone)', required: true }
                ]
            },
            {
                id: 'medical_history',
                title: 'Medical History',
                type: 'medical_section' // Special type to trigger medical history injection
            },
            {
                id: 'design_details',
                title: 'Design Details',
                fields: [
                    { id: 'design_desc', type: 'textarea', label: 'Description of Tattoo Design', required: true, rows: 4, placeholder: 'Describe your idea...' },
                    { id: 'placement', type: 'text', label: 'Placement on Body', required: true, placeholder: 'e.g., Left forearm' },
                    { id: 'size', type: 'text', label: 'Approximate Size', required: true, placeholder: 'e.g., 4x4 inches' },
                    { id: 'style', type: 'text', label: 'Style Preference', required: false, placeholder: 'e.g., Traditional, Realism, Blackwork' },
                    { id: 'budget', type: 'text', label: 'Budget Range', required: false },
                    { id: 'timeline', type: 'text', label: 'Preferred Timing', required: false }
                ]
            },
            {
                id: 'consents',
                title: 'Waiver & Consent',
                fields: [
                    { id: 'age_verify', type: 'checkbox', label: 'I certify that I am at least 18 years of age.', required: true },
                    { id: 'med_verify', type: 'checkbox', label: 'I certify that the medical information above is accurate and complete.', required: true },
                    { id: 'risk_consent', type: 'checkbox', label: 'I understand the risks involved including infection, allergic reaction, and permanence.', required: true },
                    { id: 'no_refund', type: 'checkbox', label: 'I understand that deposits and services are non-refundable.', required: true },
                    { id: 'photo_consent', type: 'checkbox', label: 'I consent to photographs being taken of my tattoo for portfolio use.', required: false }
                ]
            },
            {
                id: 'signature_section',
                title: 'Signature',
                fields: [
                    { id: 'client_sig', type: 'signature', label: 'Client Signature', required: true }
                ]
            }
        ]
    },
    piercing_standard: {
        id: 'piercing_standard',
        name: 'Standard Piercing Consultation',
        category: 'Piercing',
        description: 'Standard consent and information form for body piercing.',
        sections: [
            {
                id: 'client_info',
                title: 'Client Information',
                fields: [
                    { id: 'full_name', type: 'text', label: 'Full Legal Name', required: true },
                    { id: 'dob', type: 'date', label: 'Date of Birth', required: true },
                    { id: 'email', type: 'email', label: 'Email Address', required: true },
                    { id: 'phone', type: 'tel', label: 'Phone Number', required: true }
                ]
            },
            {
                id: 'medical_history',
                title: 'Medical History',
                type: 'medical_section'
            },
            {
                id: 'piercing_details',
                title: 'Piercing Details',
                fields: [
                    { id: 'piercing_location', type: 'text', label: 'Piercing Location', required: true },
                    { id: 'jewelry_pref', type: 'text', label: 'Jewelry Preference', required: false }
                ]
            },
            {
                id: 'consents',
                title: 'Consent',
                fields: [
                    { id: 'age_verify', type: 'checkbox', label: 'I certify that I am at least 18 years of age.', required: true },
                    { id: 'risk_consent', type: 'checkbox', label: 'I understand the risks involved with body piercing.', required: true },
                    { id: 'aftercare_agree', type: 'checkbox', label: 'I agree to follow the provided aftercare instructions.', required: true }
                ]
            },
            {
                id: 'signature_section',
                title: 'Signature',
                fields: [
                    { id: 'client_sig', type: 'signature', label: 'Client Signature', required: true }
                ]
            }
        ]
    },
    large_piece: {
        id: 'large_piece',
        name: 'Large Piece / Multi-Session',
        category: 'Tattoo',
        description: 'Consultation for extensive work requiring multiple sessions.',
        sections: [
            {
                id: 'client_info',
                title: 'Client Information',
                fields: [ /* Basic info same as standard */
                    { id: 'full_name', type: 'text', label: 'Full Name', required: true },
                    { id: 'email', type: 'email', label: 'Email', required: true },
                    { id: 'phone', type: 'tel', label: 'Phone', required: true }
                ]
            },
            {
                id: 'medical_history',
                title: 'Medical History',
                type: 'medical_section'
            },
            {
                id: 'project_details',
                title: 'Project Scope',
                fields: [
                    { id: 'design_desc', type: 'textarea', label: 'Detailed Design Description', required: true, rows: 6 },
                    { id: 'sessions_est', type: 'text', label: 'Estimated Number of Sessions', required: false },
                    { id: 'deposit_policy', type: 'checkbox', label: 'I understand the deposit policy for large scale work.', required: true }
                ]
            },
            {
                id: 'signature_section',
                title: 'Signature',
                fields: [
                    { id: 'client_sig', type: 'signature', label: 'Client Signature', required: true }
                ]
            }
        ]
    },
    minor_consent: {
        id: 'minor_consent',
        name: 'Minor Consent Form',
        category: 'Legal',
        description: 'Consent form for services on a minor, requiring guardian signature.',
        sections: [
            {
                id: 'minor_info',
                title: 'Minor Information',
                fields: [
                    { id: 'minor_name', type: 'text', label: 'Minor Name', required: true },
                    { id: 'minor_dob', type: 'date', label: 'Minor Date of Birth', required: true }
                ]
            },
            {
                id: 'guardian_info',
                title: 'Parent/Guardian Information',
                fields: [
                    { id: 'guardian_name', type: 'text', label: 'Guardian Name', required: true },
                    { id: 'relationship', type: 'text', label: 'Relationship to Minor', required: true },
                    { id: 'guardian_id', type: 'text', label: 'ID Number / Type', required: true }
                ]
            },
            {
                id: 'consents',
                title: 'Guardian Consent',
                fields: [
                    { id: 'legal_guardian', type: 'checkbox', label: 'I certify that I am the legal guardian of the minor named above.', required: true },
                    { id: 'consent_procedure', type: 'checkbox', label: 'I consent to the procedure being performed on the minor.', required: true }
                ]
            },
            {
                id: 'signatures',
                title: 'Signatures',
                fields: [
                    { id: 'guardian_sig', type: 'signature', label: 'Guardian Signature', required: true },
                    { id: 'minor_sig', type: 'signature', label: 'Minor Signature (if applicable)', required: false }
                ]
            }
        ]
    },
    cover_up: {
        id: 'cover_up',
        name: 'Cover-Up Consultation',
        category: 'Tattoo',
        description: 'Specific form for clients seeking to cover an existing tattoo.',
        sections: [
            {
                id: 'client_info',
                title: 'Client Information',
                fields: [
                    { id: 'full_name', type: 'text', label: 'Full Name', required: true },
                    { id: 'email', type: 'email', label: 'Email', required: true }
                ]
            },
            {
                id: 'existing_tattoo',
                title: 'Existing Tattoo Details',
                fields: [
                    { id: 'current_desc', type: 'textarea', label: 'Description of Current Tattoo', required: true },
                    { id: 'age_tattoo', type: 'text', label: 'Age of Current Tattoo', required: false },
                    { id: 'challenges', type: 'textarea', label: 'What do you dislike about it?', required: false }
                ]
            },
            {
                id: 'cover_up_goals',
                title: 'Cover-Up Goals',
                fields: [
                    { id: 'new_idea', type: 'textarea', label: 'Ideas for Cover-Up', required: true },
                    { id: 'flexibility', type: 'checkbox', label: 'I am flexible with size and placement to ensure coverage.', required: true }

                ]
            }
        ]
    },
    touch_up: {
        id: 'touch_up',
        name: 'Touch-Up Consultation',
        category: 'Tattoo',
        description: 'Request form for touching up a previous tattoo.',
        sections: [
            {
                id: 'client_info',
                title: 'Client Information',
                fields: [
                    { id: 'full_name', type: 'text', label: 'Full Name', required: true },
                    { id: 'email', type: 'email', label: 'Email', required: true }
                ]
            },
            {
                id: 'original_work',
                title: 'Original Tattoo Info',
                fields: [
                    { id: 'artist_name', type: 'text', label: 'Original Artist', required: false },
                    { id: 'date_done', type: 'date', label: 'Date Originally Done', required: false }
                ]
            },
            {
                id: 'touch_up_needs',
                title: 'Touch-Up Needs',
                fields: [
                    { id: 'issue_desc', type: 'textarea', label: 'describe areas needing touch-up', required: true }
                ]
            }
        ]
    },
    blank: {
        id: 'blank',
        name: 'Blank Template',
        category: 'Custom',
        description: 'Start from scratch.',
        sections: []
    }
};

const TemplateManager = {
    getTemplate: (id) => {
        const template = formTemplates[id];
        if (!template) return null;
        return JSON.parse(JSON.stringify(template)); // Return Deep copy
    },

    getAllTemplates: () => {
        return Object.values(formTemplates).map(t => ({
            id: t.id,
            name: t.name,
            category: t.category,
            description: t.description
        }));
    },

    cloneTemplate: (id) => {
        const template = TemplateManager.getTemplate(id);
        if (template) {
            template.id = `custom_${Date.now()}`;
            template.name = `Copy of ${template.name}`;
        }
        return template;
    }
};

// Export for module use if using modules, or global if simple script inclusion
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formTemplates, TemplateManager };
} else {
    window.FormTemplates = { formTemplates, TemplateManager };
}

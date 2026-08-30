/**
 * Form Builder Template Library
 * Poli International - Studio Consultation Form Builder
 * Fully compliant with Health Department, Physician Authorization & Legal Declarations
 */

const formTemplates = {
    tattoo_consent: {
        id: 'tattoo_consent',
        name: 'Tattoo Consent & Release Agreement',
        category: 'Tattoo',
        description: 'Comprehensive studio consultation, medical safety disclosure, doctor authorization clause, and legal consent waiver for professional tattoo appointments.',
        sections: [
            {
                id: 'studio_artist_info',
                title: 'Studio & Tattooist Information',
                collapsed: false,
                fields: [
                    { id: 'studio_name', type: 'text', label: 'Studio Name', required: true, value: 'Poli International Tattoo & Piercing Studio', placeholder: 'Studio / Shop Name', labelAlign: 'top' },
                    { id: 'studio_address', type: 'text', label: 'Studio Address & Contact', required: true, value: '104 Studio Plaza, Suite B | (555) 019-2834 | contact@poli-studio.com', placeholder: 'Address, Phone, Email & Permit #', labelAlign: 'top' },
                    { id: 'practitioner_name', type: 'text', label: 'Tattooist (Artist) Name', required: true, placeholder: 'Name of licensed tattoo artist', validation: 'text', labelAlign: 'top' },
                    { id: 'workstation_id', type: 'text', label: 'Workstation / Sterilization Lot #', required: false, placeholder: 'e.g. Station 3 - Autoclave Lot #2026-A', labelAlign: 'top' }
                ]
            },
            {
                id: 'client_info',
                title: 'Client Personal Information',
                collapsed: false,
                fields: [
                    { id: 'full_name', type: 'text', label: 'Full Legal Name', required: true, placeholder: 'Jane Doe', validation: 'text', labelAlign: 'top' },
                    { id: 'dob', type: 'date', label: 'Date of Birth', required: true, validation: 'date', labelAlign: 'top' },
                    { id: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'jane.doe@example.com', validation: 'email', labelAlign: 'top' },
                    { id: 'phone', type: 'tel', label: 'Phone Number', required: true, placeholder: '(555) 432-8765', validation: 'phone', labelAlign: 'top' },
                    { id: 'address', type: 'textarea', label: 'Residential Address', required: true, rows: 2, placeholder: 'Street, City, State, ZIP', labelAlign: 'top' },
                    { id: 'emergency_contact', type: 'text', label: 'Emergency Contact (Name & Relationship & Phone)', required: true, placeholder: 'e.g. Mark Doe (Spouse) - (555) 987-6543', labelAlign: 'top' },
                    { id: 'gov_id_number', type: 'text', label: 'Government ID (Driver License / Passport #)', required: true, placeholder: 'ID Type and Number', labelAlign: 'top' }
                ]
            },
            {
                id: 'medical_history',
                title: 'Medical History & Health Disclosures',
                type: 'medical_section',
                collapsed: false
            },
            {
                id: 'doctor_authorization_section',
                title: 'Mandatory Physician / Doctor Clearance',
                collapsed: false,
                fields: [
                    {
                        id: 'physician_notice',
                        type: 'header',
                        label: 'Health Condition Physician Clearance Notice',
                        helpText: 'IMPORTANT: Clients with conditions such as cardiovascular disease, diabetes, epilepsy, bleeding disorders/hemophilia, hepatitis, compromised immune system, or active skin conditions are legally required to obtain written authorization from their physician prior to procedure.'
                    },
                    {
                        id: 'requires_doctor_clearance',
                        type: 'radio',
                        label: 'Do you have any medical condition that requires physician clearance before tattooing?',
                        options: ['No - I have no high-risk contraindicating conditions', 'Yes - I have obtained written clearance from my doctor', 'Yes - Pending doctor consultation'],
                        required: true,
                        labelAlign: 'top'
                    },
                    {
                        id: 'doctor_details',
                        type: 'text',
                        label: 'Physician Name, Clinic & Clearance Date',
                        placeholder: 'Dr. Smith, City Medical Clinic, Clearance dated MM/DD/YYYY',
                        required: false,
                        labelAlign: 'top',
                        conditional: {
                            show_if: {
                                field: 'requires_doctor_clearance',
                                operator: 'contains',
                                value: 'Yes'
                            }
                        }
                    }
                ]
            },
            {
                id: 'design_details',
                title: 'Tattoo Design & Procedure Specifications',
                collapsed: false,
                fields: [
                    { id: 'design_desc', type: 'textarea', label: 'Description of Tattoo Design / Concept', required: true, rows: 3, placeholder: 'Subject matter, symbols, references, text/lettering, style details...', labelAlign: 'top' },
                    { id: 'placement', type: 'text', label: 'Exact Anatomical Placement', required: true, placeholder: 'e.g. Left outer forearm, 2 inches above wrist', labelAlign: 'top' },
                    { id: 'size', type: 'text', label: 'Approximate Dimensions (Width x Height)', required: true, placeholder: 'e.g. 4 inches x 6 inches (10cm x 15cm)', labelAlign: 'top' },
                    { id: 'color_scheme', type: 'select', label: 'Color Palette Preference', options: ['Solid Black & Grey Shading', 'Full Color', 'Blackwork / Linework Only', 'Watercolor / Painterly', 'Fine Line Single Needle', 'Other Custom Blend'], required: true, labelAlign: 'top' },
                    { id: 'stencil_approval', type: 'checkbox', label: 'I confirm that I will inspect and approve the placement, size, and spelling of the stencil before ink application begins.', required: true, labelAlign: 'top' }
                ]
            },
            {
                id: 'consents',
                title: 'Legal Waiver, Capacity of Reflection & Aftercare Agreement',
                collapsed: false,
                fields: [
                    { id: 'age_verify', type: 'checkbox', label: 'I certify that I am at least 18 years of age and have provided valid government-issued photographic identification.', required: true, labelAlign: 'top' },
                    { id: 'capacity_declaration', type: 'checkbox', label: 'DECLARATION OF CAPACITY: I declare and affirm that I am in full capacity of my own mental reflection, judgment, and free will, and that I am NOT under the influence of alcohol, drugs, or mind-altering medications.', required: true, labelAlign: 'top' },
                    { id: 'aftercare_prior_advice', type: 'checkbox', label: 'PRE-PROCEDURE AFTERCARE CONFIRMATION: I confirm that prior to this procedure, I have received comprehensive verbal and written advice on aftercare, hygiene, and healing instructions from the artist.', required: true, labelAlign: 'top' },
                    { id: 'risk_consent', type: 'checkbox', label: 'I understand the inherent risks of tattooing including temporary swelling, redness, infection, allergic reaction, scarring, and permanent skin alteration.', required: true, labelAlign: 'top' },
                    { id: 'photo_consent', type: 'checkbox', label: 'I grant permission for photographs of the completed artwork to be taken and used for studio portfolio, educational, or promotional purposes.', required: false, labelAlign: 'top' }
                ]
            },
            {
                id: 'signature_section',
                title: 'Formal Client Signature & Date',
                collapsed: false,
                fields: [
                    { id: 'client_sig', type: 'signature', label: 'Client Signature (Sound Mind & Legal Acknowledgment)', required: true, labelAlign: 'top' },
                    { id: 'sig_date', type: 'date', label: 'Signature Date', required: true, validation: 'date', labelAlign: 'top' }
                ]
            }
        ]
    },

    piercing_consent: {
        id: 'piercing_consent',
        name: 'Piercing Consent & Release',
        category: 'Piercing',
        description: 'Comprehensive consent form for body piercing compliant with professional body piercing standards, qualified professional piercer sterilization protocols, physician clearance, sound mind declaration, and pre-procedure aftercare.',
        sections: [
            {
                id: 'studio_piercer_info',
                title: 'Studio & qualified professional piercer Information',
                collapsed: false,
                fields: [
                    { id: 'studio_name', type: 'text', label: 'Studio Name', required: true, value: 'Poli International Body Piercing Studio', placeholder: 'Studio Name', labelAlign: 'top' },
                    { id: 'studio_contact', type: 'text', label: 'Studio Address, Phone & Health Permit', required: true, value: '104 Studio Plaza, Suite B | (555) 019-2834 | Permit #PB-8841', placeholder: 'Address & Contact', labelAlign: 'top' },
                    { id: 'practitioner_name', type: 'text', label: 'qualified professional piercer Name', required: true, placeholder: 'qualified professional piercer Name', validation: 'text', labelAlign: 'top' },
                    { id: 'autoclave_lot', type: 'text', label: 'Needle & Jewelry Sterilization Lot # / Autoclave Cycle', required: false, placeholder: 'e.g. Lot #NV-2026-44, Statim Cycle 12 (Biological Spore Tested)', labelAlign: 'top' }
                ]
            },
            {
                id: 'client_info',
                title: 'Client Information',
                collapsed: false,
                fields: [
                    { id: 'full_name', type: 'text', label: 'Full Legal Name', required: true, placeholder: 'Jane Doe', validation: 'text', labelAlign: 'top' },
                    { id: 'dob', type: 'date', label: 'Date of Birth', required: true, validation: 'date', labelAlign: 'top' },
                    { id: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'jane@example.com', validation: 'email', labelAlign: 'top' },
                    { id: 'phone', type: 'tel', label: 'Phone Number', required: true, placeholder: '(555) 432-8765', validation: 'phone', labelAlign: 'top' },
                    { id: 'emergency_contact', type: 'text', label: 'Emergency Contact Name & Phone', required: true, placeholder: 'Contact person & phone number', labelAlign: 'top' }
                ]
            },
            {
                id: 'medical_history',
                title: 'Medical History & Health Check',
                type: 'medical_section',
                collapsed: false
            },
            {
                id: 'doctor_clearance_piercing',
                title: 'Physician Authorization Disclosure',
                collapsed: false,
                fields: [
                    {
                        id: 'piercing_physician_notice',
                        type: 'header',
                        label: 'Medical Clearance Requirements',
                        helpText: 'Certain health conditions (including heart murmurs, hemophilia/blood clotting disorders, diabetes, immune disorders, pregnancy, or keloid scarring history) may mandate prior doctor authorization under professional body piercing standards.'
                    },
                    {
                        id: 'physician_authorized',
                        type: 'radio',
                        label: 'Do any of your medical conditions require doctor authorization?',
                        options: ['No medical clearance required', 'Yes - Doctor authorization obtained and on file', 'Yes - Cleared by treating physician'],
                        required: true,
                        labelAlign: 'top'
                    }
                ]
            },
            {
                id: 'piercing_details',
                title: 'Piercing Location & Objective Material / Gauge Specifications',
                collapsed: false,
                fields: [
                    { id: 'piercing_location', type: 'select', label: 'Piercing Anatomy / Location', options: ['Lobe (Single / Double / Triple)', 'Helix / Cartilage', 'Conch / Tragus / Rook / Daith', 'Nostril / Septum', 'Navel', 'Eyebrow / Bridge', 'Lip / Labret / Medusa', 'Tongue / Oral', 'Nipple', 'Surface / Microdermal', 'Other Piercing Location'], required: true, labelAlign: 'top' },
                    { id: 'piercing_side', type: 'radio', label: 'Side / Placement', options: ['Left', 'Right', 'Center / Bilateral', 'N/A'], required: true, labelAlign: 'top' },
                    { id: 'jewelry_material', type: 'select', label: 'Initial Jewelry Material & Certified Alloy Grade', options: ['Implant Grade ASTM F-136 Titanium (Ti6Al4V ELI)', 'Implant Grade ASTM F-138 Stainless Steel (316LVM)', '14k / 18k Solid Nickel-Free Gold (Biocompatible)', 'Unalloyed ASTM F-67 Titanium', 'High Purity Niobium (ASTM B392 / 99.9%)', 'Biocompatible Polymers (PTFE ASTM F754 / Medical Grade)'], required: true, labelAlign: 'top' },
                    { id: 'jewelry_gauge_length', type: 'text', label: 'Wire Gauge (AWG / Metric) & Post Length / Diameter', required: false, placeholder: 'e.g. 16G (1.2mm) x 5/16" (8mm) Threadless Labret', labelAlign: 'top' }
                ]
            },
            {
                id: 'consents',
                title: 'Consent, Capacity of Reflection & Aftercare Acknowledgment',
                collapsed: false,
                fields: [
                    { id: 'age_verify', type: 'checkbox', label: 'I certify that I am at least 18 years of age (or legal guardian present with ID).', required: true, labelAlign: 'top' },
                    { id: 'capacity_declaration', type: 'checkbox', label: 'DECLARATION OF CAPACITY: I declare that I am in full capacity of my own reflection, judgment, and sound mind, and am not under the influence of drugs, alcohol, or narcotics.', required: true, labelAlign: 'top' },
                    { id: 'aftercare_prior_advice', type: 'checkbox', label: 'PRE-PROCEDURE AFTERCARE ADVICE: I confirm that I have been provided with detailed verbal and written aftercare instructions conforming to professional body piercing standards (sterile saline spray 0.9% USP, non-touch technique, downsizing timeline) prior to the piercing.', required: true, labelAlign: 'top' },
                    { id: 'risk_consent', type: 'checkbox', label: 'I understand the risks including localized swelling, jewelry rejection/migration, infection if improperly cleaned, and scarring.', required: true, labelAlign: 'top' }
                ]
            },
            {
                id: 'signature_section',
                title: 'Client Signature',
                collapsed: false,
                fields: [
                    { id: 'client_sig', type: 'signature', label: 'Client Signature', required: true, labelAlign: 'top' },
                    { id: 'sig_date', type: 'date', label: 'Date', required: true, labelAlign: 'top' }
                ]
            }
        ]
    },

    medical_history_intake: {
        id: 'medical_history_intake',
        name: 'Medical History & Health Screening Intake',
        category: 'Medical',
        description: 'Comprehensive health disclosure and clinical intake form covering cardiovascular conditions, blood thinners, communicable diseases, allergies, fainting history, physician authorizations, and legal certifications.',
        sections: [
            {
                id: 'studio_clinical_info',
                title: 'Studio & Clinical Practitioner Information',
                collapsed: false,
                fields: [
                    { id: 'studio_name', type: 'text', label: 'Studio / Practice Name', required: true, value: 'Poli International Tattoo & Body Art Studio', placeholder: 'Studio Name', labelAlign: 'top' },
                    { id: 'studio_permit', type: 'text', label: 'Health Facility Permit # & Location', required: true, value: 'Facility Permit #HL-4492-B | 104 Studio Plaza, Suite B', placeholder: 'Permit & Location', labelAlign: 'top' },
                    { id: 'practitioner_name', type: 'text', label: 'Consulting Artist / Practitioner Name', required: true, placeholder: 'Licensed Practitioner Name', validation: 'text', labelAlign: 'top' }
                ]
            },
            {
                id: 'client_identity',
                title: 'Client Identity & Emergency Details',
                collapsed: false,
                fields: [
                    { id: 'full_name', type: 'text', label: 'Client Full Legal Name', required: true, placeholder: 'Jane Elizabeth Doe', validation: 'text', labelAlign: 'top' },
                    { id: 'dob', type: 'date', label: 'Date of Birth', required: true, validation: 'date', labelAlign: 'top' },
                    { id: 'phone', type: 'tel', label: 'Mobile Telephone', required: true, placeholder: '(555) 432-8765', validation: 'phone', labelAlign: 'top' },
                    { id: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'jane.doe@example.com', validation: 'email', labelAlign: 'top' },
                    { id: 'emergency_contact', type: 'text', label: 'Emergency Contact (Name, Relationship & Phone)', required: true, placeholder: 'e.g. John Doe (Spouse) - (555) 987-6543', labelAlign: 'top' },
                    { id: 'pcp_info', type: 'text', label: 'Primary Care Physician / Clinic Name & Phone', required: false, placeholder: 'e.g. Dr. Robert Vance, Metro Health - (555) 234-5678', labelAlign: 'top' }
                ]
            },
            {
                id: 'medical_history',
                title: 'Comprehensive Health & Medical Disclosures',
                type: 'medical_section',
                collapsed: false
            },
            {
                id: 'physician_clearance_intake',
                title: 'Physician Authorization & Clearance Clause',
                collapsed: false,
                fields: [
                    {
                        id: 'physician_warning',
                        type: 'header',
                        label: 'Clinical Clearance Notice',
                        helpText: 'Clients with severe chronic ailments, artificial heart valves, bleeding disorders, compromised immunity, or active skin lesions require written authorization from their attending medical doctor before undergoing invasive body modification procedures.'
                    },
                    {
                        id: 'requires_doctor_clearance',
                        type: 'radio',
                        label: 'Do you require or have you received physician clearance for body modification?',
                        options: ['No medical clearance required', 'Yes - Doctor authorization obtained and on file', 'Yes - Pending medical evaluation'],
                        required: true,
                        labelAlign: 'top'
                    },
                    {
                        id: 'doctor_details',
                        type: 'text',
                        label: 'Physician Name, Clinic & Clearance Date (if applicable)',
                        placeholder: 'Dr. John Doe, City Medical Center, (555) 123-4567',
                        required: false,
                        labelAlign: 'top',
                        conditional: {
                            show_if: {
                                field: 'requires_doctor_clearance',
                                operator: 'contains',
                                value: 'Yes'
                            }
                        }
                    }
                ]
            },
            {
                id: 'medication_disclosures',
                title: 'Current Medications, Anticoagulants & Sensitivities',
                collapsed: false,
                fields: [
                    { id: 'current_rx', type: 'textarea', label: 'List all prescribed medications, over-the-counter drugs, or vitamins taken in the past 14 days', required: false, rows: 2, placeholder: 'e.g. Blood pressure medication, multivitamins, occasional ibuprofen...', labelAlign: 'top' },
                    { id: 'fainting_history', type: 'radio', label: 'Do you have a history of vasovagal fainting, lightheadedness, or dizziness during medical procedures or injections?', options: ['No history of fainting', 'Yes - Occasionally prone to lightheadedness', 'Yes - Known vasovagal syncope history'], required: true, labelAlign: 'top' },
                    { id: 'skin_integrity', type: 'radio', label: 'Is the intended skin area free of active sunburn, rashes, eczema, cuts, or infections?', options: ['Yes - Skin is fully healthy and unbroken', 'No - Skin has active redness, irritation, or trauma'], required: true, labelAlign: 'top' }
                ]
            },
            {
                id: 'client_legal_declaration',
                title: 'Legal Disclaimer, Sound Mind & Health Certification',
                collapsed: false,
                fields: [
                    { id: 'truthful_disclosure', type: 'checkbox', label: 'TRUTHFUL DISCLOSURE CERTIFICATION: I solemnly declare under penalty of false statement that all medical disclosures made in this form are accurate, complete, and true to the best of my knowledge.', required: true, labelAlign: 'top' },
                    { id: 'capacity_declaration', type: 'checkbox', label: 'CAPACITY OF REFLECTION: I affirm that I am of sound mind, in full mental capacity of my decisions, and not under the influence of any drugs, alcohol, or narcotics.', required: true, labelAlign: 'top' },
                    { id: 'waiver_undisclosed', type: 'checkbox', label: 'RELEASE OF LIABILITY: I release the studio, practitioner, and staff from any liability resulting from undisclosed, concealed, or misrepresented medical conditions or allergies.', required: true, labelAlign: 'top' },
                    { id: 'aftercare_prior_advice', type: 'checkbox', label: 'PRE-PROCEDURE AFTERCARE CONFIRMATION: I confirm that prior to this procedure, I have received comprehensive verbal and written advice on aftercare, hygiene, and healing instructions.', required: true, labelAlign: 'top' }
                ]
            },
            {
                id: 'signatures',
                title: 'Client Signature & Date',
                collapsed: false,
                fields: [
                    { id: 'client_sig', type: 'signature', label: 'Client Signature (Legal Health Certification)', required: true, labelAlign: 'top' },
                    { id: 'sig_date', type: 'date', label: 'Date', required: true, validation: 'date', labelAlign: 'top' }
                ]
            }
        ]
    },

    multisession_project: {
        id: 'multisession_project',
        name: 'Multi-Session Tattoo Project Master Agreement',
        category: 'Tattoo',
        description: 'Comprehensive agreement for back pieces, sleeves, body suits, and multi-session projects covering studio details, multi-day scheduling, physician releases, deposit structures, and continuous health disclosures.',
        sections: [
            {
                id: 'studio_master_info',
                title: 'Studio & Lead Tattooist Information',
                collapsed: false,
                fields: [
                    { id: 'studio_name', type: 'text', label: 'Studio Name', required: true, value: 'Poli International Custom Tattoo Studio', labelAlign: 'top' },
                    { id: 'studio_contact', type: 'text', label: 'Studio Address & Business Contact', required: true, value: '104 Studio Plaza, Suite B | (555) 019-2834', labelAlign: 'top' },
                    { id: 'practitioner_name', type: 'text', label: 'Lead Tattooist / Master Artist', required: true, placeholder: 'Lead Artist Name', validation: 'text', labelAlign: 'top' }
                ]
            },
            {
                id: 'client_info',
                title: 'Client Profile',
                collapsed: false,
                fields: [
                    { id: 'full_name', type: 'text', label: 'Full Legal Name', required: true, placeholder: 'Jane Doe', validation: 'text', labelAlign: 'top' },
                    { id: 'dob', type: 'date', label: 'Date of Birth', required: true, labelAlign: 'top' },
                    { id: 'email', type: 'email', label: 'Email Address', required: true, validation: 'email', labelAlign: 'top' },
                    { id: 'phone', type: 'tel', label: 'Mobile Phone', required: true, validation: 'phone', labelAlign: 'top' },
                    { id: 'emergency_contact', type: 'text', label: 'Emergency Contact Name & Telephone', required: true, labelAlign: 'top' }
                ]
            },
            {
                id: 'medical_history',
                title: 'Medical Assessment & High-Endurance Screening',
                type: 'medical_section',
                collapsed: false
            },
            {
                id: 'doctor_clearance',
                title: 'Physician Authorization & Physical Readiness',
                collapsed: false,
                fields: [
                    {
                        id: 'physician_statement',
                        type: 'header',
                        label: 'Multi-Session Medical Prerequisite',
                        helpText: 'Extended tattoo sessions place significant physical stress on the circulatory, endocrine, and immune systems. Clients with chronic conditions must be formally cleared by their physician.'
                    },
                    {
                        id: 'physician_authorized',
                        type: 'checkbox',
                        label: 'I confirm that I am in suitable physical health for long multi-hour tattoo sessions and have disclosed all medical conditions or obtained required physician clearance.',
                        required: true,
                        labelAlign: 'top'
                    }
                ]
            },
            {
                id: 'project_details',
                title: 'Project Scope & Multi-Session Structure',
                collapsed: false,
                fields: [
                    { id: 'design_desc', type: 'textarea', label: 'Complete Project Concept & Subject Scope', required: true, rows: 4, placeholder: 'Detailed description of large scale theme, motifs, background elements, flow...', labelAlign: 'top' },
                    { id: 'placement_area', type: 'text', label: 'Body Anatomy Coverage', required: true, placeholder: 'e.g. Full Back (neck to gluteal fold) and Rib panels', labelAlign: 'top' },
                    { id: 'sessions_est', type: 'text', label: 'Estimated Total Sessions & Hours', required: true, placeholder: 'e.g. 5-7 sessions (~30-35 total hours)', labelAlign: 'top' },
                    { id: 'hourly_rate', type: 'text', label: 'Hourly Rate / Day Rate & Deposit Structure', required: false, placeholder: 'e.g. $180/hr or $1,200/day rate, $300 holding deposit', labelAlign: 'top' },
                    { id: 'deposit_policy', type: 'checkbox', label: 'I agree to the multi-session cancellation and deposit rollover policy (minimum 48hr notice for reschedule).', required: true, labelAlign: 'top' }
                ]
            },
            {
                id: 'consents',
                title: 'Capacity, Reflection & Pre-Procedure Aftercare Agreement',
                collapsed: false,
                fields: [
                    { id: 'capacity_declaration', type: 'checkbox', label: 'DECLARATION OF REFLECTION: I affirm that I am of sound mind, in full capacity of reflection, not under the influence of any drugs/alcohol, and fully committed to completing this extensive project.', required: true, labelAlign: 'top' },
                    { id: 'aftercare_commitment', type: 'checkbox', label: 'PRE-PROCEDURE AFTERCARE: I confirm that the artist has provided comprehensive verbal and written aftercare advice prior to commencing work, and I commit to rigorous healing hygiene between sessions.', required: true, labelAlign: 'top' },
                    { id: 'artistic_license', type: 'checkbox', label: 'I grant the artist professional creative liberty to adapt anatomical composition for optimum aesthetic longevity.', required: true, labelAlign: 'top' }
                ]
            },
            {
                id: 'signature_section',
                title: 'Master Agreement Signature',
                collapsed: false,
                fields: [
                    { id: 'client_sig', type: 'signature', label: 'Client Signature', required: true, labelAlign: 'top' },
                    { id: 'sig_date', type: 'date', label: 'Date Signed', required: true, labelAlign: 'top' }
                ]
            }
        ]
    },

    minor_consent: {
        id: 'minor_consent',
        name: 'Minor Consent & Legal Guardian Authorization Form',
        category: 'Legal',
        description: 'Legally required consent form for minor services (earlobes/piercings), requiring legal guardian identification, relationship verification, physician authorization review, capacity of reflection, and dual signatures.',
        sections: [
            {
                id: 'studio_practitioner_info',
                title: 'Studio & Practitioner Information',
                collapsed: false,
                fields: [
                    { id: 'studio_name', type: 'text', label: 'Studio Name', required: true, value: 'Poli International Certified Studio', labelAlign: 'top' },
                    { id: 'studio_contact', type: 'text', label: 'Studio Address, Telephone & Permit', required: true, value: '104 Studio Plaza, Suite B | (555) 019-2834 | Permit #MD-9021', labelAlign: 'top' },
                    { id: 'practitioner_name', type: 'text', label: 'Practitioner (Piercer / Artist) Name', required: true, placeholder: 'Name of practitioner executing procedure', validation: 'text', labelAlign: 'top' }
                ]
            },
            {
                id: 'minor_info',
                title: 'Minor Client Information',
                collapsed: false,
                fields: [
                    { id: 'minor_name', type: 'text', label: 'Minor Full Legal Name', required: true, placeholder: 'Minor first and last name', validation: 'text', labelAlign: 'top' },
                    { id: 'minor_dob', type: 'date', label: 'Minor Date of Birth', required: true, validation: 'date', labelAlign: 'top' },
                    { id: 'minor_age', type: 'number', label: 'Minor Current Age', required: true, placeholder: 'e.g. 15', labelAlign: 'top' },
                    { id: 'minor_id_type', type: 'text', label: 'Minor Identification (Birth Certificate / School ID / Passport)', required: true, placeholder: 'ID Type and document number', labelAlign: 'top' }
                ]
            },
            {
                id: 'guardian_info',
                title: 'Parent / Legal Guardian Information',
                collapsed: false,
                fields: [
                    { id: 'guardian_name', type: 'text', label: 'Parent / Legal Guardian Full Legal Name', required: true, placeholder: 'Guardian first and last name', validation: 'text', labelAlign: 'top' },
                    { id: 'relationship', type: 'select', label: 'Legal Relationship to Minor', options: ['Biological Mother', 'Biological Father', 'Legal Court-Appointed Guardian', 'Adoptive Parent', 'Other Authorized Legal Custodian'], required: true, labelAlign: 'top' },
                    { id: 'guardian_gov_id', type: 'text', label: 'Guardian Government ID (Driver License / Passport #)', required: true, placeholder: 'State/Country & ID Number', labelAlign: 'top' },
                    { id: 'guardian_phone', type: 'tel', label: 'Guardian Contact Telephone', required: true, validation: 'phone', labelAlign: 'top' },
                    { id: 'guardian_email', type: 'email', label: 'Guardian Email Address', required: true, validation: 'email', labelAlign: 'top' }
                ]
            },
            {
                id: 'medical_history',
                title: 'Minor Medical History & Health Disclosures',
                type: 'medical_section',
                collapsed: false
            },
            {
                id: 'doctor_clearance_minor',
                title: 'Mandatory Physician Authorization Clause',
                collapsed: false,
                fields: [
                    {
                        id: 'physician_minor_header',
                        type: 'header',
                        label: 'Physician Clearance Warning for Minors',
                        helpText: 'Minors experiencing allergies, hemophilia/bleeding tendencies, diabetes, cardiac conditions, or fainting history require a formal written authorization letter from a licensed pediatrician/doctor prior to undergoing procedures.'
                    },
                    {
                        id: 'minor_doctor_status',
                        type: 'radio',
                        label: 'Physician Authorization Status for Minor',
                        options: ['Minor has no underlying medical contraindications', 'Written doctor authorization has been verified and provided', 'Doctor authorization not applicable'],
                        required: true,
                        labelAlign: 'top'
                    }
                ]
            },
            {
                id: 'procedure_details',
                title: 'Authorized Procedure Specifications',
                collapsed: false,
                fields: [
                    { id: 'procedure_desc', type: 'text', label: 'Exact Authorized Procedure & Location', required: true, placeholder: 'e.g. Standard bilateral earlobe piercing', labelAlign: 'top' },
                    { id: 'jewelry_used', type: 'text', label: 'Sterilized Jewelry Material & Wire Gauge (AWG/Metric)', required: false, placeholder: 'e.g. ASTM F-136 Implant Grade Titanium Studs (18G / 1.0mm)', labelAlign: 'top' }
                ]
            },
            {
                id: 'consents',
                title: 'Guardian Consent, Capacity of Reflection & Aftercare Acknowledgment',
                collapsed: false,
                fields: [
                    { id: 'legal_guardian_cert', type: 'checkbox', label: 'LEGAL CUSTODY CERTIFICATION: I solemnly certify under penalty of perjury that I am the biological parent or court-appointed legal guardian with legal custody of the minor named above.', required: true, labelAlign: 'top' },
                    { id: 'guardian_capacity', type: 'checkbox', label: 'CAPACITY OF REFLECTION: I affirm that I am in full capacity of my own reflection and sound judgment, not impaired by any substance, and freely authorize this procedure.', required: true, labelAlign: 'top' },
                    { id: 'aftercare_guardian_agree', type: 'checkbox', label: 'PRE-PROCEDURE AFTERCARE: I certify that both the minor and I have received thorough verbal and written pre-procedure aftercare instructions adhering to professional body piercing standards, and I will supervise the minor\'s healing protocol.', required: true, labelAlign: 'top' },
                    { id: 'presence_during_service', type: 'checkbox', label: 'I agree to remain present in the studio facility during the entire duration of the procedure.', required: true, labelAlign: 'top' }
                ]
            },
            {
                id: 'signatures',
                title: 'Signatures & Dual Identity Verification',
                collapsed: false,
                fields: [
                    { id: 'guardian_sig', type: 'signature', label: 'Parent / Legal Guardian Signature', required: true, labelAlign: 'top' },
                    { id: 'minor_sig', type: 'signature', label: 'Minor Client Signature (Assent)', required: false, labelAlign: 'top' },
                    { id: 'sig_date', type: 'date', label: 'Date of Authorization', required: true, labelAlign: 'top' }
                ]
            }
        ]
    },

    coverup_rework: {
        id: 'coverup_rework',
        name: 'Cover-Up & Rework Assessment Form',
        category: 'Tattoo',
        description: 'Specialized consultation form for covering up or reworking existing tattoo work with skin condition disclosures, laser lightening history, physician release, and design flexibility terms.',
        sections: [
            {
                id: 'studio_artist_info',
                title: 'Studio & Tattooist Information',
                collapsed: false,
                fields: [
                    { id: 'studio_name', type: 'text', label: 'Studio Name', required: true, value: 'Poli International Tattoo Studio', labelAlign: 'top' },
                    { id: 'practitioner_name', type: 'text', label: 'Tattooist Name', required: true, placeholder: 'Cover-up specialist artist name', validation: 'text', labelAlign: 'top' }
                ]
            },
            {
                id: 'client_info',
                title: 'Client Information',
                collapsed: false,
                fields: [
                    { id: 'full_name', type: 'text', label: 'Full Legal Name', required: true, placeholder: 'Jane Doe', validation: 'text', labelAlign: 'top' },
                    { id: 'email', type: 'email', label: 'Email Address', required: true, validation: 'email', labelAlign: 'top' },
                    { id: 'phone', type: 'tel', label: 'Phone Number', required: true, validation: 'phone', labelAlign: 'top' }
                ]
            },
            {
                id: 'medical_history',
                title: 'Medical History & Scar Tissue Evaluation',
                type: 'medical_section',
                collapsed: false
            },
            {
                id: 'existing_tattoo',
                title: 'Existing Tattoo Details & Laser History',
                collapsed: false,
                fields: [
                    { id: 'current_desc', type: 'textarea', label: 'Description of Existing Tattoo to Cover', required: true, rows: 2, placeholder: 'Color intensity, darkness, motifs...', labelAlign: 'top' },
                    { id: 'age_tattoo', type: 'text', label: 'Age of Existing Tattoo (Years/Months)', required: false, placeholder: 'e.g. Done 5 years ago', labelAlign: 'top' },
                    { id: 'laser_lightening', type: 'radio', label: 'Has this area undergone laser tattoo removal / lightening treatments?', options: ['No laser treatments', 'Yes - Completed laser sessions (skin healed >8 weeks)', 'Yes - Active laser treatments ongoing'], required: true, labelAlign: 'top' }
                ]
            },
            {
                id: 'cover_up_goals',
                title: 'Cover-Up Design Goals & Agreements',
                collapsed: false,
                fields: [
                    { id: 'new_idea', type: 'textarea', label: 'Ideas & Preferred Imagery for Cover-Up', required: true, rows: 3, placeholder: 'Dark motifs, florals, koi, biomech, dark shading...', labelAlign: 'top' },
                    { id: 'flexibility', type: 'checkbox', label: 'DESIGN FLEXIBILITY: I understand that successful cover-ups require significant flexibility in size, darker tones, and placement expansion.', required: true, labelAlign: 'top' },
                    { id: 'capacity_declaration', type: 'checkbox', label: 'CAPACITY OF REFLECTION: I declare that I am in full capacity of reflection and sound mind, making this decision freely.', required: true, labelAlign: 'top' },
                    { id: 'aftercare_confirmation', type: 'checkbox', label: 'PRE-PROCEDURE AFTERCARE: I confirm that I have been provided with aftercare instructions prior to the procedure.', required: true, labelAlign: 'top' }
                ]
            },
            {
                id: 'signatures',
                title: 'Client Signature',
                collapsed: false,
                fields: [
                    { id: 'client_sig', type: 'signature', label: 'Client Signature', required: true, labelAlign: 'top' },
                    { id: 'sig_date', type: 'date', label: 'Date', required: true, labelAlign: 'top' }
                ]
            }
        ]
    },

    pmu_cosmetic: {
        id: 'pmu_cosmetic',
        name: 'PMU & Cosmetic Tattoo Consultation',
        category: 'Cosmetic',
        description: 'Specialized consultation and consent agreement for cosmetic tattooing (microblading, powder brows, lip blushing, permanent eyeliner) including contraindication screening, pigment patch testing, sound mind declaration, and aftercare advice.',
        sections: [
            {
                id: 'studio_pmu_info',
                title: 'Studio & PMU Practitioner Information',
                collapsed: false,
                fields: [
                    { id: 'studio_name', type: 'text', label: 'Studio / Aesthetic Clinic Name', required: true, value: 'Poli International PMU & Aesthetic Studio', labelAlign: 'top' },
                    { id: 'practitioner_name', type: 'text', label: 'Certified PMU Practitioner Name', required: true, placeholder: 'Practitioner Name', validation: 'text', labelAlign: 'top' },
                    { id: 'pigment_lot', type: 'text', label: 'Pigment Brand, Shade & Lot Number', required: false, placeholder: 'e.g. Tina Davies I Love Ink - Dark Brown Lot #5821', labelAlign: 'top' }
                ]
            },
            {
                id: 'client_info',
                title: 'Client Profile',
                collapsed: false,
                fields: [
                    { id: 'full_name', type: 'text', label: 'Full Legal Name', required: true, placeholder: 'Jane Doe', validation: 'text', labelAlign: 'top' },
                    { id: 'dob', type: 'date', label: 'Date of Birth', required: true, validation: 'date', labelAlign: 'top' },
                    { id: 'email', type: 'email', label: 'Email Address', required: true, validation: 'email', labelAlign: 'top' },
                    { id: 'phone', type: 'tel', label: 'Phone Number', required: true, validation: 'phone', labelAlign: 'top' }
                ]
            },
            {
                id: 'medical_history',
                title: 'Cosmetic Medical Screening & Contraindications',
                type: 'medical_section',
                collapsed: false
            },
            {
                id: 'pmu_contraindications',
                title: 'Cosmetic Contraindications & Physician Release',
                collapsed: false,
                fields: [
                    {
                        id: 'pmu_warning',
                        type: 'header',
                        label: 'Cosmetic Tattoo Contraindications',
                        helpText: 'Accutane (within 12 months), Retin-A/Retinol (within 14 days), chemical peels, botox/fillers (within 3 weeks), pregnancy/nursing, or active cold sores (lip blush) require prior medical consultation or procedure postponement.'
                    },
                    {
                        id: 'retinol_accutane_check',
                        type: 'radio',
                        label: 'Have you used Accutane, Retin-A, or had chemical peels recently?',
                        options: ['No - None in contraindicated timeframe', 'Yes - Over 12 months ago for Accutane / 4 weeks for Retinol', 'Yes - Currently using (Requires rescheduling)'],
                        required: true,
                        labelAlign: 'top'
                    },
                    {
                        id: 'pmu_service_type',
                        type: 'select',
                        label: 'PMU Treatment Type',
                        options: ['Microblading Eyebrows', 'Ombré / Powder Brows', 'Combo Brows (Blade & Shade)', 'Lip Blush / Full Lip Tint', 'Lash Enhancement / Permanent Eyeliner', 'Freckles / Beauty Marks', 'Areola Restorative Tattoo'],
                        required: true,
                        labelAlign: 'top'
                    }
                ]
            },
            {
                id: 'consents',
                title: 'Capacity, Reflection & Pre-Procedure Aftercare Agreement',
                collapsed: false,
                fields: [
                    { id: 'capacity_declaration', type: 'checkbox', label: 'CAPACITY OF REFLECTION: I affirm that I am in full capacity of reflection, sound judgment, and entering into this aesthetic procedure of my own free will.', required: true, labelAlign: 'top' },
                    { id: 'aftercare_prior_advice', type: 'checkbox', label: 'PRE-PROCEDURE AFTERCARE ADVICE: I confirm that I have been provided with comprehensive verbal and written aftercare instructions (dry/wet healing protocol, sun avoidance, touch-up schedule) prior to procedure.', required: true, labelAlign: 'top' },
                    { id: 'shape_approval', type: 'checkbox', label: 'I agree to thoroughly inspect and approve the facial mapping, symmetry, and color swatch before pigment implantation.', required: true, labelAlign: 'top' }
                ]
            },
            {
                id: 'signatures',
                title: 'PMU Client Signature',
                collapsed: false,
                fields: [
                    { id: 'client_sig', type: 'signature', label: 'Client Signature', required: true, labelAlign: 'top' },
                    { id: 'sig_date', type: 'date', label: 'Date', required: true, labelAlign: 'top' }
                ]
            }
        ]
    },

    blank: {
        id: 'blank',
        name: 'Blank Custom Form',
        category: 'Custom',
        description: 'Start from scratch to build custom forms for your studio.',
        sections: [
            {
                id: 'section_general',
                title: 'Studio & Client Details',
                collapsed: false,
                fields: [
                    { id: 'studio_name', type: 'text', label: 'Studio Name', required: true, value: 'Poli International Studio', labelAlign: 'top' },
                    { id: 'client_name', type: 'text', label: 'Client Full Name', required: true, placeholder: 'Client legal name', validation: 'text', labelAlign: 'top' },
                    { id: 'client_sig', type: 'signature', label: 'Client Signature', required: true, labelAlign: 'top' }
                ]
            }
        ]
    }
};

// Aliases mapping for backward compatibility
const templateAliases = {
    'tattoo_standard': 'tattoo_consent',
    'piercing_standard': 'piercing_consent',
    'large_piece': 'multisession_project',
    'cover_up': 'coverup_rework',
    'medical_intake': 'medical_history_intake'
};

const TemplateManager = {
    getTemplate: (id) => {
        const resolvedId = templateAliases[id] || id;
        const template = formTemplates[resolvedId] || formTemplates[id];
        if (!template) return null;
        return JSON.parse(JSON.stringify(template)); // Return deep copy
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

if (typeof window !== 'undefined') {
    window.FormTemplates = { formTemplates, TemplateManager };
    window.TemplateManager = TemplateManager;
    window.formTemplates = formTemplates;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { formTemplates, TemplateManager };
}

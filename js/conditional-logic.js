/**
 * Conditional & Dependency Logic Engine
 * Poli International - Studio Consultation Form Builder
 * Evaluates field visibility and dependencies based on client responses and preceding selections (radio, select, checkbox, text).
 */

const ConditionalLogic = {
    // Main function to run on form change
    evaluate: (formData, responses) => {
        const updates = {}; // Map of fieldId -> visible (boolean)
        if (!formData || !formData.sections) return updates;

        const evaluateFieldList = (fields) => {
            if (!Array.isArray(fields)) return;
            fields.forEach(field => {
                if (field.conditional) {
                    const isVisible = ConditionalLogic.check(field.conditional, responses);
                    updates[field.id] = isVisible;
                } else {
                    updates[field.id] = true; // Default visible
                }

                // Check nested fields inside container
                if (field.type === 'container' && Array.isArray(field.fields)) {
                    evaluateFieldList(field.fields);
                }
            });
        };

        formData.sections.forEach(section => {
            if (section.fields) {
                evaluateFieldList(section.fields);
            }
        });

        return updates;
    },

    check: (conditionConfig, responses) => {
        if (!conditionConfig) return true;

        if (conditionConfig.show_if) {
            return ConditionalLogic.checkSingle(conditionConfig.show_if, responses);
        }

        if (conditionConfig.show_if_all && Array.isArray(conditionConfig.show_if_all)) {
            return conditionConfig.show_if_all.every(cond => ConditionalLogic.checkSingle(cond, responses));
        }

        if (conditionConfig.show_if_any && Array.isArray(conditionConfig.show_if_any)) {
            return conditionConfig.show_if_any.some(cond => ConditionalLogic.checkSingle(cond, responses));
        }

        return true;
    },

    checkSingle: (rule, responses) => {
        if (!rule || !rule.field) return true;

        const value = responses ? responses[rule.field] : undefined;
        const targetValue = rule.value !== undefined ? String(rule.value).trim().toLowerCase() : '';
        const currentStr = (value !== undefined && value !== null) ? String(value).trim().toLowerCase() : '';

        switch (rule.operator) {
            case 'equals':
            case 'eq':
                if (Array.isArray(value)) {
                    return value.some(v => String(v).trim().toLowerCase() === targetValue);
                }
                return currentStr === targetValue;

            case 'not_equals':
            case 'neq':
                if (Array.isArray(value)) {
                    return !value.some(v => String(v).trim().toLowerCase() === targetValue);
                }
                return currentStr !== targetValue;

            case 'contains':
                if (Array.isArray(value)) {
                    return value.some(v => String(v).toLowerCase().includes(targetValue));
                }
                return currentStr.includes(targetValue);

            case 'not_contains':
                if (Array.isArray(value)) {
                    return !value.some(v => String(v).toLowerCase().includes(targetValue));
                }
                return !currentStr.includes(targetValue);

            case 'is_checked':
                return value === true || currentStr === 'true' || currentStr === 'yes' || (Array.isArray(value) && value.length > 0);

            case 'is_not_checked':
                return !value || currentStr === 'false' || currentStr === 'no' || (Array.isArray(value) && value.length === 0);

            case 'greater_than':
            case 'gt':
                return Number(value) > Number(rule.value);

            case 'greater_equal':
            case 'gte':
                return Number(value) >= Number(rule.value);

            case 'less_than':
            case 'lt':
                return Number(value) < Number(rule.value);

            case 'less_equal':
            case 'lte':
                return Number(value) <= Number(rule.value);

            case 'is_empty':
                return value === undefined || value === null || currentStr === '' || (Array.isArray(value) && value.length === 0);

            case 'is_not_empty':
                return value !== undefined && value !== null && currentStr !== '' && (!Array.isArray(value) || value.length > 0);

            default:
                console.warn(`Unknown conditional operator: ${rule.operator}`);
                return true;
        }
    }
};

window.ConditionalLogic = ConditionalLogic;


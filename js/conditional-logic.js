/**
 * Conditional Logic Engine
 * Poli International - Tool #13
 */

const ConditionalLogic = {
    // Main function to run on form change
    evaluate: (formData, responses) => {
        const updates = {}; // Map of fieldId -> visible (boolean)

        formData.sections.forEach(section => {
            if (section.fields) {
                section.fields.forEach(field => {
                    if (field.conditional) {
                        const isVisible = ConditionalLogic.check(field.conditional, responses);
                        updates[field.id] = isVisible;
                    } else {
                        updates[field.id] = true; // Default visible
                    }
                });
            }
        });

        return updates;
    },

    check: (conditionConfig, responses) => {
        // Normalize to array of conditions for complex logic
        if (conditionConfig.show_if) {
            return ConditionalLogic.checkSingle(conditionConfig.show_if, responses);
        }

        if (conditionConfig.show_if_all) {
            return conditionConfig.show_if_all.every(cond => ConditionalLogic.checkSingle(cond, responses));
        }

        if (conditionConfig.show_if_any) {
            return conditionConfig.show_if_any.some(cond => ConditionalLogic.checkSingle(cond, responses));
        }

        return true; // No recognized condition, show by default?
    },

    checkSingle: (rule, responses) => {
        if (!rule.field) return true;

        const value = responses[rule.field];
        const targetValue = rule.value;

        switch (rule.operator) {
            case 'equals':
            case 'eq':
                return value == targetValue; // Loose equality for numbers/strings match

            case 'not_equals':
            case 'neq':
                return value != targetValue;

            case 'contains':
                return value && value.includes && value.includes(targetValue);

            case 'not_contains':
                return !value || !value.includes || !value.includes(targetValue);

            case 'greater_than':
            case 'gt':
                return Number(value) > Number(targetValue);

            case 'less_than':
            case 'lt':
                return Number(value) < Number(targetValue);

            case 'is_checked':
                return !!value; // boolean true check

            case 'is_not_checked':
                return !value;

            default:
                console.warn(`Unknown operator: ${rule.operator}`);
                return true;
        }
    }
};

window.ConditionalLogic = ConditionalLogic;

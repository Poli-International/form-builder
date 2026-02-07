/**
 * Automated Test Suite
 * Poli International - Tool #13
 */

const TestSuite = {
    results: { passed: 0, failed: 0 },

    assert: (condition, message) => {
        if (condition) {
            console.log(`%c[PASS] ${message}`, 'color: green');
            TestSuite.results.passed++;
        } else {
            console.error(`[FAIL] ${message}`);
            TestSuite.results.failed++;
        }
    },

    runAll: async () => {
        console.group('🚀 Starting Test Suite');

        await TestSuite.testTemplates();
        await TestSuite.testMedicalHistory();
        await TestSuite.testConditionalLogic();
        await TestSuite.testSignatureManager();

        console.log('-----------------------------------');
        console.log(`Tests Completed. Passed: ${TestSuite.results.passed}, Failed: ${TestSuite.results.failed}`);
        console.groupEnd();

        return TestSuite.results;
    },

    testTemplates: async () => {
        console.group('Templates');
        if (!window.FormTemplates) {
            console.error('Templates module not loaded');
            return;
        }

        const all = window.FormTemplates.TemplateManager.getAllTemplates();
        TestSuite.assert(all.length >= 7, 'Should have at least 7 templates');

        const tattoo = window.FormTemplates.TemplateManager.getTemplate('tattoo_standard');
        TestSuite.assert(tattoo && tattoo.id === 'tattoo_standard', 'Standard Tattoo template loads');
        TestSuite.assert(tattoo.sections.length > 0, 'Template has sections');

        console.groupEnd();
    },

    testMedicalHistory: async () => {
        console.group('Medical History');
        if (!window.MedicalHistorySystem) {
            console.error('Medical module not loaded');
            return;
        }

        const section = window.MedicalHistorySystem.getMedicalSection();
        TestSuite.assert(section.title === 'Medical History', 'Medical section generated');
        TestSuite.assert(section.fields.some(f => f.id === 'allergies'), 'Contains allergies question');

        const validation = window.MedicalHistorySystem.validateMedicalHistory({});
        TestSuite.assert(validation.isValid === false, 'Validation fails on empty data');

        console.groupEnd();
    },

    testConditionalLogic: async () => {
        console.group('Conditional Logic');
        if (!window.ConditionalLogic) {
            console.error('Logic module not loaded');
            return;
        }

        const rule = { field: 'test', operator: 'equals', value: 'yes' };
        TestSuite.assert(window.ConditionalLogic.checkSingle(rule, { test: 'yes' }) === true, 'Equals operator true');
        TestSuite.assert(window.ConditionalLogic.checkSingle(rule, { test: 'no' }) === false, 'Equals operator false');

        console.groupEnd();
    },

    testSignatureManager: async () => {
        console.group('Signature');
        // Hard to test canvas without DOM, but checking class existence
        TestSuite.assert(window.SignatureManager !== undefined, 'SignatureManager class exists');
        console.groupEnd();
    }
};

window.TestSuite = TestSuite;

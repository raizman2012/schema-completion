var schema_completion = require('../index');

describe("completion", function () {
    it("should complete required fields", function () {
        var schema = schema_completion.complete("student",
            {"required": ["total_amount", "contact_info", "active"]});

        expect(schema.properties['total_amount']).not.toBe(undefined);
        expect(schema.properties['active']).not.toBe(undefined);
        expect(schema.properties['active'].type).toBe("boolean");
    });


});

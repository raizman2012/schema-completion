var schema_completion = require('../index');

describe("local file system loader", function () {
    it("should create loader", function () {
        var schemaLoader = new schema_completion.schema_loaders.localFilesystemSchemaLoader('http://www.mycollege.org/', [], []);
        expect(schemaLoader).not.toBe(undefined);
    });

    it("should find files by name", function () {
        var schemaLoader = new schema_completion.schema_loaders.localFilesystemSchemaLoader('http://www.mycollege.org/', ['test/testfiles/'], []);

        var schema = schemaLoader.getSchemaByName('empty');
        expect(schema).not.toBe(undefined);
        expect(schema.name).toBe("empty");


    });
});


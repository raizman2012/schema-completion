var YAML = require('yamljs');
var glob = require("glob");
var fs = require('fs');
var path = require('path');

var schema_completion = require('../index');
var mongoose_generator = require('../lib/mongoose_schema_generator');

var _ = require('underscore');

describe("mongoose", function () {
    var outputDir = 'test/testfiles/domains/college_mongoose/';


    it("should create schema for each schema", function () {
        //var files2delete = glob.sync('test/testfiles/domains/college/_*.json');
        //_.each(files2delete, function(file) {
        //    fs.unlinkSync(file);
        //});

        //var files = glob.sync('test/testfiles/domains/college/*.json');
        //expect(files.length).not.toBe(0);
        //
        //_.each(files, function(file) {
        //    var baseName = path.basename(file, '.json');
        //    console.log(baseName);
        //
        //    var schemaJson = JSON.parse(fs.readFileSync(file, 'utf8'));
        //    var mongoose_schema = mongoose_generator.generate(schemaJson);
        //
        //    console.log(mongoose_schema);
        //
        //});
    });

});
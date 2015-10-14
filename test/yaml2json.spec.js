var YAML = require('yamljs');
var glob = require("glob");
var fs = require('fs');
var path = require('path');

var schema_completion = require('../index');
var _ = require('underscore');

var mongoose_generator = require('../lib/mongoose_schema_generator');
var mock_data_generator = require('../lib/mock_data_generator');
var domain_generator = require('../lib/domain_generator');

describe("yaml2json", function () {
    var outputDir = 'test/testfiles/domains/college/';

    it("should convert YAML to json", function () {
        var schema = YAML.load('test/testfiles/domains/college_yaml/student.yaml');


        expect(schema.required).not.toBe(undefined);
    });

    it("should ensure json for every yaml", function () {


        var files = glob.sync('test/testfiles/domains/college_yaml/*.yaml');
        expect(files.length).not.toBe(0);

        _.each(files, function(file) {
            var baseName = path.basename(file, '.yaml');
            try {
                var jsonSchemaFile = outputDir+'/'+baseName+'.json';
                //if (!fs.existsSync(jsonSchemaFile)) {
                    var schema = YAML.load(file);
                    fs.writeFileSync(jsonSchemaFile, JSON.stringify(schema, null, 2));
                //}

            }
            catch (e) {
                console.log(e);
            }
        });
    });

    it("should complete every schema", function () {
        var baseDir = 'test/testfiles/domains/college/';


        var files = glob.sync(baseDir+'/*.json');
        expect(files.length).not.toBe(0);
        var schemaLoader = new schema_completion.schema_loaders.localFilesystemSchemaLoader('http://www.mycollege.org', [baseDir], []);

        _.each(files, function(file) {
            var baseName = path.basename(file, '.json');
            //console.log(baseName);
            var schema = schemaLoader.getSchemaByName(baseName);
            expect(schema).not.toBe(undefined);

            // complete
            schema_completion.complete(baseName,schema, schemaLoader);

            var outputFilename = baseDir + '/' + baseName+'.json';
            fs.writeFileSync(outputFilename, JSON.stringify(schema, null, 2));
            console.log("JSON saved to " + outputFilename);
        });

    });

    it("should load json after completion", function () {
        var str = fs.readFileSync('test/testfiles/domains/college/address.json', 'utf8');

        var schemaJson = JSON.parse(str);
        expect(schemaJson).not.toBe(undefined);
    });


    it("should create mongoose schema for each schema", function () {
        // place to store mongoose files
        var baseDir = 'test/testfiles/domains/college_mongoose/';

        var files = glob.sync('test/testfiles/domains/college/*.json');
        expect(files.length).not.toBe(0);

        _.each(files, function(file) {
            var baseName = path.basename(file, '.json');
            console.log('file:', file,' baseName:'+baseName);

            var str = fs.readFileSync(file, 'utf8');
            //console.log('str:'+str);
            var schemaJson = JSON.parse(str);
            var mongoose_schema = mongoose_generator.generate(schemaJson);



            var outputFilename = baseDir + '/' + baseName+'.json';
            //fs.writeFileSync(outputFilename, mongoose_schema);
            //console.log("MONGOOSE JSON saved to " + outputFilename);

            var outputFilename = baseDir + '/' + baseName+'.js';

            var js = mongoose_generator.generateJsSchema(baseName, mongoose_schema);
            fs.writeFileSync(outputFilename, js);
            console.log("MONGOOSE JS saved to " + outputFilename);
        });
    });

    it("should have mock function predefined", function () {
        var schema = YAML.load('test/testfiles/domains/mock_types.yaml');

        expect(schema).not.toBe(undefined);
    });

    it("should have mock data cod gen", function () {
        var baseDir = 'test/testfiles/domains/college/';
        var mockDir = 'test/testfiles/domains/college_mock/';
        var mock_fields = YAML.load('test/testfiles/domains/mock_fields.yaml');
        var mock_types = YAML.load('test/testfiles/domains/mock_types.yaml');

        console.log(mock_fields, mock_types);
        expect(mock_fields).not.toBe(undefined);
        expect(mock_types).not.toBe(undefined);

        var files = glob.sync(baseDir + '/*.json');
        var allMocks = mock_data_generator.generateFromFiles(files, mock_fields, mock_types);

        var result = domain_generator.generateFromDir(baseDir);
        _.each(result.all, function(nn) {
            if (!path.existsSync(mockDir+nn)) {
                fs.mkdirSync(mockDir + nn);
            }
            var mocks = allMocks[nn];
            //console.log(mocks.length);

            var outputDirName = mockDir + '/' + nn;
            console.log(outputDirName);
            _.each(mocks, function(json, index) {
                var outputFilename = outputDirName+'/'+index+'.json';
                fs.writeFileSync(outputFilename, JSON.stringify(json, null, 2));
                //console.log("JSON saved to " + outputFilename);
            });

        });
    });


});

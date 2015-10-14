var YAML = require('yamljs');
var glob = require("glob");
var fs = require('fs');
var path = require('path');

var domain_generator = require('../lib/domain_generator');

var _ = require('underscore');

describe("domain", function () {
    var baseDirForDomain = 'test/testfiles/domains/';
    var baseDir = 'test/testfiles/domains/college';


    it("should create metadata for domain", function () {
        var result = domain_generator.generateFromDir(baseDir);

        expect(result).not.toBe(undefined);
        expect(result.all.length).not.toBe(0);
        expect(result.oneToMany.student).not.toBe(undefined);

        console.log('', result);
        var outputFilename = baseDirForDomain + '/college_domain.json';
        fs.writeFileSync(outputFilename, JSON.stringify(result, null, 2));
    });

});
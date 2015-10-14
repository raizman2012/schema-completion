var fs = require('fs');
var path = require('path');
var glob = require("glob");

var _ = require('underscore');
var jsongen = require('jsongen');

function generateFromFiles(files, mock_fields, mock_types) {
    console.log('', jsongen.commands);

    var allMocks = {};
    //var files = glob.sync(dir + '/*.json');
    _.each(files, function (file) {
        var baseName = path.basename(file, '.json');

        var schema = JSON.parse(fs.readFileSync(file, 'utf8'));
        //console.log(schema);
        var mockArray = [
            '{{repeat(5)}}'
        ];

        var mock = {};
        mockArray.push(mock);
        for (var pname in schema.properties) {
            var property = schema.properties[pname];

            if (property.type !== undefined) {

                if (mock_fields[property.name] !== undefined) {
                    mock[property.name] = '{{'+mock_fields[property.name]+'}}'
                } else if (jsongen.commands[property.name] !== undefined) {
                    mock[property.name] = '{{'+property.name+'()}}'
                } else if (mock_types[property.type] !== undefined) {
                    mock[property.name] = '{{'+mock_types[property.type]+'}}'
                } else {
                    if (property.type === 'string') {
                        mock[property.name] = '{{lorem(10)}}'
                    }
                    if (property.type === 'int') {
                        mock[property.name] = '{{num(100)}}'
                    }
                    if (property.type === 'number') {
                        mock[property.name] = '{{num(100, 1000)}}'
                    }
                    if (property.type === 'boolean') {
                        mock[property.name] = '{{bool()}}'
                    }
                    if (property.type === 'date') {
                        mock[property.name] = '{{date()}}'
                    }
                }
            } else if (property.$ref !== undefined) {

            } else if (property.type === 'array') {
                mock[property.name] = [];
                if (property.items.$ref !== undefined) {

                } else {
                }

            }
        }

        //console.log(mock);
        var result = jsongen(mockArray);

        //console.log('--- mock ', baseName);
        //console.log(result);

        allMocks[baseName] = result;
    });

    return allMocks;
}
exports.generateFromFiles = generateFromFiles;

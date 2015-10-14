var fs = require('fs');
var path = require('path');
var glob = require("glob");
var _ = require('underscore');

function addValue(obj, pname, value) {
    if (obj[pname] === undefined) {
        obj[pname] = [];
    }
    obj[pname].push(value);
}
function generateFromDir(dir) {

    var result = {
        all : [],

        all_fields : {},

        primitives: {

        },

        oneToMany : {

        },

        manyToMany : {

        }

    };


    var files = glob.sync(dir+'/*.json');
    _.each(files, function(file) {
        var baseName = path.basename(file, '.json');

        var schema = JSON.parse(fs.readFileSync(file, 'utf8'));

        result.all.push(baseName);

        var primitive = true;
        for (var pname in schema.properties) {
            var property = schema.properties[pname];

            if (property.$ref !== undefined) {
                //this is one2many
                var partner = path.basename(property.$ref, '.json');

                //result.oneToMany[baseName] = partner;
                addValue(result.oneToMany, baseName, partner);
                primitive = false;
            }

            if (property.type === 'array') {
                if (property.items.$ref !== undefined) {
                    //this is many2many
                    var partner = path.basename(property.items.$ref, '.json');

                    //result.manyToMany[baseName] = partner;
                    addValue(result.manyToMany, baseName, partner);
                    primitive = false;
                }
            }

            result.all_fields[pname] = property.type;
        }
        if (primitive) {
            result.primitives[baseName] = true;
        } else {
            result.primitives[baseName] = false;
        }
    });
    return result;
}

exports.generateFromDir = generateFromDir;
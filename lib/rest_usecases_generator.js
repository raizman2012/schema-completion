var fs = require('fs');

function generate(schema) {

    var result = {
        generator : '0.1',
        info : {
            description : 'some description'
        },
        "paths": {

        }
    };


    var listOfActors = [];
    for (var pname in schema.properties) {
        var property = schema.properties[pname];


    }
}
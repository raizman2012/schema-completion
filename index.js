var fs = require('fs');
var schema_loaders = require('./lib/schema_loaders');

var config = {
    "separator": "_",
    "suffix": ".json",
    "encoding": "utf8",
    "overwrite": {
        "replace_inline_with_reference": true,
        "replace_inner_with_reference": true,
        "replace_primitive_type_by_hint": false,
        "add_description_in_inline": false,
        "remove_not_related": true
    },

    "$schema": "http://json-schema.org/draft-04/schema#",

    "type_hints": {
        "boolean": ["completed", "modified", "active", "enabled", "disabled", "selected", "passed", "approved"],
        "date": ["date"],
        "string": ["id", "refid"],
        "int": ["count", "order", "level", "age", "amount", "number", "hours", "minutes", "days"],
        "number": ["price", "length", "size", "weight", "distance"]
    },

    "structure_hint": {
        "array": ["array", "list", "values", "objects"],
        "object": ["data", "info"]
    },

    "dirForNewSchemas" : ''

};


if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}


function generatePropertyFromName(name, parentSchema, schema, schemaLoader) {
    var res = {
        "name": name
    };

    // first, try to figure out primitive type
    for (var type in config.type_hints) {
        var hints = config.type_hints[type];

        for (var j = 0; j < hints.length; j++) {
            var hint = config.separator + hints[j];

            if (name.endsWith(hint)) {
                res.type = type;
            }
            if (name ===  hints[j]) {
                res.type = type;
            }
        }
    }

    // second, check if hint is for sub object are array
    if (res.type === undefined) {

        for (var type in config.structure_hint) {
            var hints = config.structure_hint[type];

            for (var j = 0; j < hints.length; j++) {
                var hint = config.separator + hints[j];

                if (name.endsWith(hint)) {
                    res.type = type;

                    // for different types, different schema
                    if (res.type === 'object') {
                        res.properties = {};
                        res.required = [];
                    }
                    if (res.type === 'array') {
                        var name_without_prefix = name.slice(0, -1 * hint.length);
                        var property = generatePropertyFromNameWithReferenceCheck(name_without_prefix, parentSchema, schema, schemaLoader);
                        //console.log('property:', property);
                        res['items'] = property;
                    }
                }
            }
        }
    }

    // third, check inner definitions
    if (parentSchema.definitions !== undefined && parentSchema.definitions[name] !== undefined) {
        res = { $ref : '#/definitions/'+name};
        return res;
    }

    if (res.type === undefined) {
        res.type = "string";
    }

    return res;
}

/**
 * Complete definitions in schema
 * adds definitions, $schema, type
 * @param name
 * @param schema
 * @param schemaLoader
 * @returns {*}
 */
function complete(name, schema, schemaLoader) {
    if (schema === undefined || schema === null) {
        schema = {};
    }

    schema['$schema'] = config.$schema;

    if (schema['definitions'] === undefined) {
        schema.definitions = {};
    }

    if (schema['required'] === undefined) {
        schema.required = [];
    }

    if (schema['type'] === undefined) {
        schema.type = 'object';
    }

    // complete definitions
    for (var prop in schema.definitions) {
        if (schema.definitions[prop] === undefined || schema.definitions[prop] === null) {
            schema.definitions[prop] = generatePropertyFromName(prop, schema, schema, schemaLoader);
        } else {
            completeProperty(prop, schema, schema.definitions[prop], schemaLoader);
        }
    }

    completeProperty(name, schema, schema, schemaLoader);

    return schema;
}


function generatePropertyFromNameWithReferenceCheck(pname, parentSchema, schema, schemaLoader) {
    var res = {};
    // look for predefined schema first in local (inner)
    // then in global, and only if not found create new one
    var splitted = pname.split('_');
    var lastSegment = splitted[splitted.length - 1];
    //console.log('lastSegment:'+lastSegment);
    if (parentSchema.definitions[lastSegment] !== undefined) {
        res = {
            "$ref": "#/definitions/" + lastSegment
        }
    } else {
        var schemaFromloader = schemaLoader !== undefined ? schemaLoader.getSchemaByName(lastSegment) : undefined;

        if (schemaFromloader !== undefined) {
            res = {
                "$ref": schemaLoader.domain+"/" + lastSegment
            }
        } else {
            res = generatePropertyFromName(pname, parentSchema, schema, schemaLoader);
        }
    }
    return res;
}


function completeOrCreateProperty(pname, parentSchema, schema, schemaLoader) {

    if (schema.properties[pname] === undefined || schema.properties[pname] === null) {
        schema.properties[pname] = generatePropertyFromNameWithReferenceCheck(pname, parentSchema, schema, schemaLoader);
    } else {
        completeProperty(pname, parentSchema, schema.properties[pname], schemaLoader);
    }
}

function completeProperty(name, parentSchema, schema, schemaLoader) {

    if (schema['$ref'] !== undefined) {
        var fullName = schema['$ref'];

        if (fullName.indexOf(schemaLoader.domain) === 0) {
            // auto create new schema?
            var nameWithoutDomain = fullName.slice(schemaLoader.domain.length);
            //var existingSchema = schemaLoader.getSchemaByName(nameWithoutDomain);
            //if (existingSchema === undefined) {
            //    //??
            //}
        }

        // this is reference to another schema
        return;
    }

    var prototype = {
        "title": "title for " + name,
        "description": "description for " + name
    };

    if (schema.properties !== undefined || schema.required !== undefined) {
        schema.type = 'object';
    }

    // object should have 'properties' and 'require'
    if (schema.type === 'object') {
        prototype.properties = {};
        prototype.required = []
    }

    // 'array' has different
    if (schema.type === 'array') {
        prototype.minItems = 0;

        prototype.uniqueItems = true;
    }

    // complete top level properties, by copy them from prototype
    for (var prop in prototype) {
        if (schema[prop] === undefined) {
            schema[prop] = prototype[prop];
        }
    }

    if (schema.type === 'object') {

        // complete properties from required
        if (schema.required !== undefined) {
            for (var i = 0; i < schema.required.length; i++) {
                var requiredName = schema.required[i];
                completeOrCreateProperty(requiredName, parentSchema, schema, schemaLoader);
            }
        }

        if (schema.properties !== undefined) {
            for (var prop in schema.properties) {
                completeOrCreateProperty(prop, parentSchema, schema, schemaLoader);
            }
        }
    }

    if (schema.type === 'array') {
        //console.log('array,', schema);
        if (schema.items === undefined || schema.items === null) {
            schema.items = generatePropertyFromNameWithReferenceCheck(pname, parentSchema, schema, schemaLoader);
        }

    }
    return schema;
}

exports.schema_loaders = schema_loaders;
exports.complete = complete;


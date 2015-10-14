var fs = require('fs');

// by default, relationships is many2many
function createRefFromSchemaRef(ref) {
    var n = ref.lastIndexOf("/");
    return ref.substring(n+1);
}

function mongooseTypeFromJsonSchemaType(type) {
    var mType = undefined;

    // first, primitives

    if (type === 'string') {
        mType = 'String';
    }
    if (type === 'int') {
        mType = 'Number';
    }
    if (type === 'number') {
        mType = 'Number';
    }
    if (type === 'boolean') {
        mType = 'Boolean';
    }
    if (type === 'date') {
        mType = 'Date';
    }
    return mType;
}
function generateInner(schema, offset) {


    var result = '';



    for (var pname in schema.properties) {
        var property = schema.properties[pname];

        var mType = mongooseTypeFromJsonSchemaType(property.type);

        //console.log('property.type:',property.type, ' mType:', mType);
        if (mType !== undefined) {
            result += offset+''+pname+' : '+mType+',\n';
        } else {
            // then, deal with 'object'

            if (property.type === 'object'  && property.$ref === undefined) {
                // inner (sub doc
                var inner = generate(property);
                result += offset+''+property.name+' : {'+
                    generateInner(property, offset+'\t')+
                    '},\n';
            }

            if (property.type === undefined && property.$ref !== undefined) {
                var refSchema = createRefFromSchemaRef(property.$ref);
                result += ''+offset+pname+' : { type : ObjectId, ref : \''+refSchema+'\'},\n';
            }

            // finally, create relationships
            if (property.type === 'array') {
               // console.log('property:',property);
                var ref = property.items.$ref;
                if (ref !== undefined) {
                    var refSchema = createRefFromSchemaRef(property.items.$ref);
                    result += offset+''+pname+' : [{ type : ObjectId, ref : \''+refSchema+'\'}],\n';
                } else {
                    var mTypeForItem = mongooseTypeFromJsonSchemaType(property.items.type);
                    result += offset+''+pname+' : ['+mTypeForItem+'],\n';
                }

            }
        }

    }

    // cut last ','
    var n = result.lastIndexOf(',\n');

    result = result.substr(0, n);

    return result+'\n';
}

function generate(schema) {
    //var resultWrapper = '{\n'+
    //    '\tid: ObjectId,\n';
    var resultWrapper = '{\n';

    resultWrapper += generateInner(schema, '\t');

    resultWrapper += '}\n';

    //console.log(resultWrapper);
    //return JSON.parse(resultWrapper);
    return resultWrapper;
}

function generateJsSchema(name, schemaAsString) {
    var res = "var mongoose = require('mongoose');\n";
    res += "var Schema = mongoose.Schema;\n";
    res += "var ObjectId = Schema.ObjectId;\n";
    //res += "var String = Schema.String;\n";
    //res += "var Number = Schema.Number;\n";
    //res += "var Date = Schema.Date;\n";
    res += "var "+name+" = new mongoose.schema(";
    res += schemaAsString;
    res += ");\n";
    res += "exports.schema_"+name+" = "+name+";\n";
    return res;
}

exports.generate = generate;
exports.generateJsSchema = generateJsSchema;
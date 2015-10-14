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

    result.paths['/'+schema.name] = {
        post : {
            "description": "Add a new "+schema.name,

            "parameters": [
                {
                    "in": "body",
                    "schema": {"$ref": schema.$schema}
                }
            ],
            "responses": {"405": {"description": "Invalid input"}}
        },
        put : {
            "description": "Update existing "+schema.name,

            "parameters": [
                {
                    "in": "body",
                    "schema": {"$ref": schema.$schema}
                }
            ],
            "responses": {"405": {"description": "Invalid input"}}
        },
        delete : {
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "description": schema.name+" id to delete",
                    "required": true
                }
            ],
            "responses": {"400": {"description": "Invalid id"}}
        }
    };

    result.paths['/'+schema.name+'/{'+schema.name+'}Id'] = {
        get : {
            "description": "Returns a single "+schema.name,
            "responses": {
                "200": {
                    "description": "successful operation, return "+schema.name,
                    "schema": {"$ref": schema.$schema}
                },
                "400": {"description": "Invalid ID supplied"},
                "404": {"description": schema.name+" not found"}
            }
        }
    };

    result.paths['/find_'+schema.name+'_by'] = {
        get : {
            "description": "Returns list of "+schema.name,
            "parameters": [
                {
                    "name": "paramname",
                    "in": "query",
                    "description": "name of parameter to use",
                    "required": false,
                    "type": "string"
                },
                {
                    "name": "paramvalue",
                    "in": "query",
                    "description": "Tvalue for exact match",
                    "required": false,
                    "type": "string"
                }
            ],
            "responses": {
                "200": {
                    "description": "successful operation, return list of "+schema.name,
                    "schema": {
                        "type": "array",
                        "items": {"$ref": schema.$schema}
                    }
                },
                "400": {"description": "Invalid ID supplied"},
                "404": {"description": schema.name+" not found"}
            }
        }
    };

    // add relationships for every references

    for (var pname in schema.properties) {
        var property = schema.properties[pname];
        if (property.$ref !== undefined) {
            // we have a reason to add API
            result.paths['/'+schema.name+'/{'+schema.name+'}Id/'+pname] = {
                get : {
                    "description": "Returns a "+pname,
                    "responses": {
                        "200": {
                            "description": "successful operation, return "+schema.name,
                            "schema": {"$ref": schema.$schema}
                        },
                        "400": {"description": "Invalid ID supplied"},
                        "404": {"description": schema.name+" not found"}
                    }
                },
                post : {
                    "description": "assign value "+pname,
                    "parameters": [
                        {
                            "in": "body",
                            "schema": {"$ref": property.$ref}
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "successful operation, return "+schema.name,
                            "schema": {"$ref": schema.$schema}
                        },
                        "400": {"description": "Invalid ID supplied"},
                        "404": {"description": schema.name+" not found"}
                    }
                }
            };
        }
        if (property.type === 'array') {
            // we have a reason to add API for relationship
            // with paging
            result.paths['/'+schema.name+'/{'+schema.name+'}Id/'+pname] = {
                get : {
                    "description": "Returns a "+pname,

                    "responses": {
                        "200": {
                            "description": "successful operation, return "+schema.name,
                            "schema": {"$ref": schema.$schema}
                        },
                        "400": {"description": "Invalid ID supplied"},
                        "404": {"description": schema.name+" not found"}
                    }
                },
                post : {
                    "description": "add to "+pname,
                    "parameters": [
                        {
                            "in": "body",
                            "schema": {"$ref": property.items}
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "successful operation, return "+schema.name,
                            "schema": {"$ref": schema.$schema}
                        },
                        "400": {"description": "Invalid ID supplied"},
                        "404": {"description": schema.name+" not found"}
                    }
                }
            };
        }
    }
}
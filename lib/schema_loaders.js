var fs = require('fs');

var config = {
    "suffix": ".json",
    "encoding" : "utf8"
}
function localFilesystemSchemaLoader(domain, schemaPath, schemaLoaders) {
    var schemaPath = schemaPath;
    var schemaLoaders = schemaLoaders;
    var domain = domain;

    var cache = {};

    // return schema by name 'domain/name'
    function getSchemaByFullName(name) {
        if (name.indexOf(domain) === 0) {
            var nameWithoutDomain = name.slice(domain.length);
            return getSchemaByName(nameWithoutDomain);
        }
        return null;
        // go for ourt loaders?
    }

    function getSchemaByName(name) {
        if (cache[name] !== undefined) {
            return cache[name];
        }

        for (var i = 0; i < schemaPath.length; i++) {
            var dir = schemaPath[i];
            try {
                // Query the entry
                var fileName = dir+name+config.suffix;
                if (!fs.existsSync(fileName)) {
                    continue;
                }

                var stats = fs.lstatSync(fileName);

                // Is it a directory?
                if (stats.isFile()) {
                    //
                    try {
                        var schemaJson = JSON.parse(fs.readFileSync(fileName, config.encoding));
                        cache[name] = schemaJson;
                        return schemaJson;
                    }
                    catch (e) {
                        console.log('problem during schema loading, filename:', fileName, ' ex:', e);
                    }
                } else {
                    console.log('problem during schema loading, this is not a file:', fileName);
                }
            }
            catch (e) {
                console.log('problem during schema loading, dir:', dir, ' ex:', e);
            }


        }

        // if not found, try in other schemaloaders
        for (var i = 0; i < schemaLoaders.length; i++) {
            var loader = schemaLoaders[i];

        }
    }

    this.getSchemaByName = getSchemaByName;
    this.getSchemaByFullName = getSchemaByFullName;
    this.domain = domain;

}

exports.localFilesystemSchemaLoader = localFilesystemSchemaLoader;
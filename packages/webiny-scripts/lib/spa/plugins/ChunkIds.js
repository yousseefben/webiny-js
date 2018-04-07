"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _NormalModule = require("webpack/lib/NormalModule");

var _NormalModule2 = _interopRequireDefault(_NormalModule);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

class ChunkIds {
    constructor(options) {
        this.options = options || {};
    }

    apply(compiler) {
        this.compiler = compiler;
        compiler.plugin("compilation", compilation => {
            // Generate chunk IDs
            compilation.plugin("before-chunk-ids", chunks => {
                chunks.forEach((chunk, index) => {
                    if (!chunk.hasEntryModule() && chunk.id === null) {
                        if (process.env.NODE_ENV === "production") {
                            chunk.id = this.createChunkIdHash(chunk);
                        } else {
                            // ID must contain the name of the app to avoid ID clashes between multiple apps
                            chunk.id = "chunk-" + index;
                            // Name is only used in development for easier debugging
                            const chunkData = this.generateChunkName(chunk);
                            chunk.name = chunkData.unique
                                ? chunkData.name
                                : chunkData.name + "-" + index;
                        }
                    }
                });
            });
        });
    }

    generateChunkName(chunk) {
        if (chunk.filenameTemplate) {
            return { name: chunk.filenameTemplate.replace(".js", ""), unique: true };
        }
        const chunkModules = chunk
            .mapModules(m => m)
            .filter(this.filterJsModules)
            .sort(this.sortByIndex);
        const filteredModules = chunkModules.filter(m => !m.resource.includes("node_modules"));
        let chunkName = _lodash2.default
            .get(
                filteredModules,
                "[0].resource",
                _lodash2.default.get(chunkModules, "0.resource", "undefined")
            )
            .split(this.options.projectRoot + _path2.default.sep)
            .pop();
        chunkName = chunkName
            .replace(`${_path2.default.sep}index.js`, "")
            .replace(/\//g, "_")
            .replace(/\\/g, "_")
            .replace(/\.jsx?/, "");
        chunkName = chunkName
            .split("_")
            .slice(-3)
            .join("_");
        return { name: chunkName };
    }

    sortByIndex(a, b) {
        return a.index - b.index;
    }

    filterJsModules(m) {
        if (m instanceof _NormalModule2.default) {
            return m.resource.endsWith(".js") || m.resource.endsWith(".jsx");
        }

        return false;
    }

    createChunkIdHash(chunk) {
        // We are generating chunk id based on containing modules (their `resource` path relative to `Apps` folder).
        // That way chunk id does not change as long as it contains the same modules (no matter the content).
        const paths = chunk
            .mapModules(m => this.getRelativeModulePath(m))
            .sort((a, b) => a.index - b.index)
            .join("\n");
        return _crypto2.default
            .createHash("md5")
            .update(paths)
            .digest("hex")
            .substr(0, 10);
    }

    getRelativeModulePath(module) {
        if (!module || !module.resource) {
            return "";
        }

        return module.resource.split(this.options.projectRoot + _path2.default.sep).pop();
    }
}

exports.default = ChunkIds;
//# sourceMappingURL=ChunkIds.js.map
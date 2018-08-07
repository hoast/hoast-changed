// Node modules.
const assert = require('assert'),
	  { readFile, writeFile } = require('fs'),
	  { dirname, join } = require('path');
// If debug available require it.
let debug; try { debug = require('debug')('hoast-changed'); } catch(error) { debug = function() {}; }
// Dependency modules.
const nanomatch = require('nanomatch');

/**
 * Validates the module options.
 * @param {Object} options The options.
 */
const validateOptions = function(options) {
	if (!options) {
		return; // Since no option is required.
	}
	
	assert(typeof(options) === 'object', 'hoast-changed: options must be of type object.');
	if (options.file) {
		assert(typeof(options.file) === 'string', 'hoast-changed: file must be of type string.');
	}
	if (options.patterns) {
		assert(typeof(options.patterns) === 'string' || (Array.isArray(options.patterns) && options.patterns.length > 0 && typeof(options.patterns[0] === 'string')), 'hoast-changed: patterns must be of type string or an array of strings.');
	}
};

/**
 * Reads the file from storage.
 * @param {String} path File path.
 */
const read = function(path) {
	return new Promise(function(resolve, reject) {
		readFile(path, 'utf8', function(error, data) {
			if (error) {
				return reject(error);
			}
			resolve(JSON.parse(data));
		});
	});
};

/**
 * Writes JS object to storage.
 * @param {Object} hoast Hoast instance.
 * @param {String} path File path.
 * @param {Object} content Object to write to storage.
 */
const write = function(hoast, path, content) {
	return new Promise(function(resolve, reject) {
		hoast.helper.createDirectory(dirname(path))
			.then(function() {
				writeFile(path, JSON.stringify(content), 'utf8', function(error) {
					if (error) {
						return reject(error);
					}
					resolve();
				})
			})
			.catch(function(error) {
				reject(error);
			});
	});
};

/**
 * Convert the content of files.
 * @param {Object} options The module options.
 */
module.exports = function(options) {
	debug(`Initializing module.`);
	
	validateOptions(options);
	debug(`Validated options.`);
	options = Object.assign({
		file: 'hoast-changed'
	}, options);
	
	return async function(hoast, files) {
		debug(`Running module.`);
		
		const path = join(hoast.options.destination, options.file).concat('.json');
		// Read changed list from storage.
		// This is done each batch as it is otherwise retained in memory even across multiple process calls.
		let list;
		try {
			list = await read(path);
			debug(`Read changed list from '${path}'`);
		} catch(error) {
			list = {};
			debug(`Unable to read changed list from '${path}', created new list instead.`);
		}
		
		debug(`Start filtering files`);
		// Loop through the files.
		const filtered = files.filter(function(file) {
			debug(`Filtering file '${file.path}'.`);
			
			// If it matches any of the patterns always process.
			if (options.patterns && nanomatch.any(file.path, options.patterns)) {
				debug(`File path matched patterns.`);
				return true;
			}
			// If it is in the list and not changed since the last time do not process.
			if (list[file.path] && file.stats.ctimeMs <= list[file.path]) {
				debug(`File no change since last process.`);
				return false;
			}
			debug(`File never processed before.`);
			// Update changed time and process.
			list[file.path] = file.stats.ctimeMs;
			return true;
		});
		debug(`Finished filtering files.`);
		
		// Write list to storage.
		try {
			await write(hoast, path, list);
		} catch(error) {
			throw error;
		}
		debug(`Wrote changed list to '${path}'.`);
		
		// Return filtered files.
		return filtered;
	};
};
// If debug available require it.
let debug; try { debug = require(`debug`)(`hoast-changed`); } catch(error) { debug = function() {}; }
// Node modules.
const assert = require(`assert`),
	fs = require(`fs`),
	path = require(`path`);
// Dependency modules.
const parse = require(`planckmatch/parse`),
	match = require(`planckmatch/match`);

/**
 * Validates the module options.
 * @param {Object} options The options.
 */
const validateOptions = function(options) {
	if (!options) {
		return; // Since no option is required.
	}
	assert(
		typeof(options) === `object`,
		`hoast-changed: options must be of type object.`
	);
	
	if (options.file) {
		assert(
			typeof(options.file) === `string`,
			`hoast-changed: file must be of type string.`
		);
	}
	
	if (options.patterns) {
		assert(
			typeof(options.patterns) === `string` || (Array.isArray(options.patterns) && options.patterns.length > 0 && typeof(options.patterns[0] === `string`)),
			`hoast-changed: patterns must be of type string or an array of string.`
		);
	}
	if (options.patternOptions) {
		assert(
			typeof(options.patternOptions) === `object`,
			`hoast-changed: patternOptions must be of type object.`
		);
		if (options.patternOptions.all) {
			assert(
				typeof(options.patternOptions.all) === `boolean`,
				`hoast-changed: patternOptions.all must be of type boolean.`
			);
		}
	}
};

/**
 * Check if expressions match with the given value.
 * @param {String} value The string to match with the expressions.
 * @param {RegExps|Array} expressions The regular expressions to match with.
 * @param {Boolean} all Whether all patterns need to match.
 */
const isMatch = function(value, expressions, all) {
	const result = match(value, expressions);
	
	// If results is a boolean check if it is true.
	if (typeof(result) === `boolean` && result) {
		return true;
	}
	// If results is an array check whether everything needs to be true or any will be enough.
	if (Array.isArray(result) && (all ? !result.includes(false) : result.includes(true))) {
		return true;
	}
	
	// Otherwise it is no match.
	return false;
};

/**
 * Reads the file from storage.
 * @param {String} path File path.
 */
const read = function(filePath) {
	return new Promise(function(resolve, reject) {
		fs.readFile(filePath, `utf8`, function(error, data) {
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
 * @param {String} filePath File path.
 * @param {Object} content Object to write to storage.
 */
const write = function(hoast, filePath, content) {
	return new Promise(function(resolve, reject) {
		hoast.helper.createDirectory(path.dirname(filePath))
			.then(function() {
				fs.writeFile(filePath, JSON.stringify(content), `utf8`, function(error) {
					if (error) {
						return reject(error);
					}
					resolve();
				});
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
		file: `hoast-changed`,
		patternOptions: {}
	}, options);
	
	// Main module method.
	const mod = function(hoast, files) {
		debug(`Running module.`);
		
		// Loop through the files.
		const filtered = files.filter(function(file) {
			debug(`Filtering file '${file.path}'.`);
			
			// If it does not match
			if (this.expressions && isMatch(file.path, this.expressions, options.patternOptions.all)) {
				debug(`File path valid for skipping.`);
				return true;
			}
			
			// If it is in the list and not changed since the last time do not process.
			if (this.list[file.path] && this.list[file.path] >= file.stats.mtimeMs) {
				debug(`File not changed since last process.`);
				return false;
			}
			
			debug(`File changed or not processed before.`);
			// Update changed time and process.
			this.list[file.path] = file.stats.mtimeMs;
			return true;
		}, mod);
		debug(`Finished filtering files.`);
		
		// Return filtered files.
		return filtered;
	};
	
	mod.before = async function(hoast) {
		debug(`Running module before.`);
		
		// Parse glob patterns into regular expressions.
		if (options.patterns) {
			this.expressions = parse(options.patterns, options.patternOptions);
		}
		
		// Construct file path.
		this.filePath = path.join(hoast.options.destination, options.file).concat(`.json`);
		// Try to read the changed list from storage.
		try {
			this.list = await read(this.filePath);
			debug(`Read changed list from '${this.filePath}'`);
		} catch (error) {
			this.list = {};
			debug(`Unable to read changed list from '${this.filePath}', created new list instead.`);
		}
	};
	
	mod.after = async function(hoast) {
		debug(`Running module after.`);
		
		// Write list to storage.
		try {
			await write(hoast, this.filePath, this.list);
		} catch(error) {
			throw error;
		}
		debug(`Wrote changed list to '${this.filePath}'.`);
		
		this.filePath = undefined;
		this.list = undefined;
	};
	
	return mod;
};
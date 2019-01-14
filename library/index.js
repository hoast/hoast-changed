// If debug available require it.
let debug; try { debug = require(`debug`)(`hoast-changed`); } catch(error) { debug = function() {}; }
// Node modules.
const fs = require(`fs`),
	path = require(`path`);

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
 * @param {Object} hoast hoast instance.
 * @param {String} filePath File path.
 * @param {Object} content Object to write to storage.
 */
const write = function(hoast, filePath, content) {
	return new Promise(function(resolve, reject) {
		hoast.helpers.createDirectory(path.dirname(filePath))
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
			if (this.expressions && hoast.helpers.matchExpressions(file.path, this.expressions, options.patternOptions.all)) {
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
			this.expressions = hoast.helpers.parsePatterns(options.patterns, options.patternOptions, true);
			debug(`Patterns parsed into expressions: ${this.expressions}.`);
		}
		
		// Construct file path.
		this.filePath = path.join(hoast.directory, hoast.options.destination, options.file).concat(`.json`);
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
			debug(`Wrote changed list to '${this.filePath}'.`);
		} catch(error) {
			debug(`Unable to write changed list to '${this.filePath}'.`);
		}
		
		this.filePath = undefined;
		this.list = undefined;
	};
	
	return mod;
};
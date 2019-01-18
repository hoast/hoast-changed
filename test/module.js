// Node modules.
const fs = require(`fs`),
	path = require(`path`);
// Dependency modules.
const test = require(`ava`);
const emulateHoast = require(`./helpers/emulateHoast`);
// Library modules.
const Changed = require(`../library`);

// Module options.
const options = {
	file: `test-changed`,
	patterns: `a.md`
};
// Dummy changed file data.
const list = {
	'a.txt': 1,
	'b.md': 1,
	'c.md': 2,
	'd.md': 3
};
const directoryPath = __filename.substring(0, __filename.indexOf(`.`));
const fileName = `module`; // TODO: Dynamically retrieve file name.
const filePath = path.join(directoryPath, options.file.concat(`.json`));

test.before(`set-up`, async function(t) {
	// Write changed file to storage.
	await new Promise(function(resolve, reject) {
		fs.mkdir(directoryPath, function(error) {
			if (error) {
				return reject(error);
			}
			
			fs.writeFile(filePath, JSON.stringify(list), function(error) {
				if (error) {
					return reject(error);
				}
				
				resolve();
			});
		});
	});
	
	t.pass();
});

test.after.always(`clean-up`, async function(t) {
	// Remove changed file from storage.
	await new Promise(function(resolve, reject) {
		fs.unlink(filePath, function(error) {
			if (error) {
				return reject(error);
			}
			
			fs.rmdir(directoryPath, function(error) {
				if (error) {
					return reject(error);
				}
				
				resolve();
			});
		});
	});
	
	t.pass();
});

test.serial(`compare files`, async function(t) {
	// Create dummy files data.
	let files = [{
		path: `a.md`,
		stats: {
			mtimeMs: 0
		}
	}, {
		path: `b.md`,
		stats: {
			mtimeMs: 2
		}
	}, {
		path: `c.md`,
		stats: {
			mtimeMs: 2
		}
	}, {
		path: `d.md`,
		stats: {
			mtimeMs: 2
		}
	}, {
		path: `e.md`,
		stats: {
			mtimeMs: 2
		}
	}];
	
	// Test module.
	files = await emulateHoast(__dirname, { destination: fileName }, Changed(options), files);
	
	// Expected outcome.
	const filesOutcome = [{
		path: `a.md`,
		stats: {
			mtimeMs: 0
		}
	}, {
		path: `b.md`,
		stats: {
			mtimeMs: 2
		}
	}, {
		path: `e.md`,
		stats: {
			mtimeMs: 2
		}
	}];
	// Check files array.
	t.deepEqual(files, filesOutcome);
});

test.serial(`compare file`, async function(t) {
	// Read list from storage.
	const listSaved = JSON.parse(fs.readFileSync(filePath, `utf8`));
	// Expected outcome.
	const listOutcome = {
		'a.txt': 1,
		'b.md': 2,
		'c.md': 2,
		'd.md': 3,
		'e.md': 2
	};
	// Check changed file in storage.
	t.deepEqual(listSaved, listOutcome);
});
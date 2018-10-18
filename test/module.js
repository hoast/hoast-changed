// Node modules.
const fs = require(`fs`),
	path = require(`path`);
// Dependency modules.
const Hoast = require(`hoast`),
	test = require(`ava`);
// Custom module.
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

/**
 * Emulates a simplified Hoast process for testing purposes.
 * @param {Object} options Hoast options.
 * @param {Function} mod Module function.
 * @param {Array of objects} files The files to process and return.
 */
const emulateHoast = async function(options, mod, files) {
	const hoast = Hoast(__dirname, options);
	
	if (mod.before) {
		await mod.before(hoast);
	}
	
	const temp = await mod(hoast, files);
	if (temp) {
		files = temp;
	}
	
	if (mod.after) {
		await mod.after(hoast);
	}
	
	return files;
};

test.before(`set-up`, async function(t) {
	// Write changed file to storage.
	fs.writeFileSync(path.join(__dirname, options.file.concat(`.json`)), JSON.stringify(list), `utf8`);
	
	t.pass();
});

test.after.always(`clean-up`, async function(t) {
	// Remove changed file from storage.
	await new Promise(function(resolve, reject) {
		fs.unlink(path.join(__dirname, options.file.concat(`.json`)), function(error) {
			if (error) {
				reject(error);
			}
			resolve();
		});
	});
	
	t.pass();
});

test(`changed`, async function(t) {
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
	files = await emulateHoast({
		destination: `test`
	}, Changed(options), files);
	
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
	
	// Read list from storage.
	const listSaved = JSON.parse(fs.readFileSync(path.join(__dirname, options.file.concat(`.json`)), `utf8`));
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
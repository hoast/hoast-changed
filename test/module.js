// Node modules.
const fs = require(`fs`),
	path = require(`path`);
// Dependency modules.
const test = require(`ava`);
// Custom module.
const Changed = require(`../library`);

test(`changed`, async function(t) {
	// Set options.
	const options = {
		file: `test-changed`,
		patterns: `*.md`
	};
	
	// Create dummy changed file data.
	const list = {
		'a.txt': 1,
		'b.md': 1,
		'c.md': 2,
		'd.md': 3
	};
	// Write changed file to storage.
	fs.writeFileSync(options.file.concat(`.json`), JSON.stringify(list), `utf8`);
	
	// Create dummy hoast data.
	const hoast = {
		helper: {
			createDirectory: async function() {}
		},
		options: {
			destination: ``
		}
	};
	
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
		path: `b.txt`,
		stats: {
			mtimeMs: 3
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
	const changed = Changed(options);
	await changed.before(hoast);
	// Check read changed file.
	t.deepEqual(changed.list, list);
	
	files = await changed(hoast, files);
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
	
	await changed.after(hoast);
	// Read list from storage.
	const listSaved = JSON.parse(fs.readFileSync(path.join(__dirname, `..`, options.file.concat(`.json`)), `utf8`));
	// Expected outcome.
	const listOutcome = {
		'a.md': 0,
		'a.txt': 1,
		'b.md': 2,
		'c.md': 2,
		'd.md': 3,
		'e.md': 2
	};
	// Check changed file in storage.
	t.deepEqual(listSaved, listOutcome);
	
	// Remove changed file from storage.
	await new Promise(function(resolve, reject) {
		fs.unlink(options.file.concat(`.json`), function(error) {
			if (error) {
				reject(error);
			}
			resolve();
		});
	});
});
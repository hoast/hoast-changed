<div align="center">
  <a title="Version master branch" href="https://github.com/hoast/hoast-changed#readme" target="_blank" rel="noopener">
    <img src="https://img.shields.io/github/package-json/v/hoast/hoast-changed.svg?label=master&style=flat-square"/>
  </a>
  <a title="Version npm package" href="https://npmjs.com/package/hoast-changed" target="_blank" rel="noopener">
    <img src="https://img.shields.io/npm/v/hoast-changed.svg?label=npm&style=flat-square"/>
  </a>
  <a title="License agreement" href="https://github.com/hoast/hoast-changed/blob/master/LICENSE" target="_blank" rel="noopener">
    <img src="https://img.shields.io/github/license/hoast/hoast-changed.svg?style=flat-square"/>
  </a>
  <a title="Travis-ci build statis" href="https://travis-ci.org/hoast/hoast-changed" target="_blank" rel="noopener">
    <img src="https://img.shields.io/travis-ci/hoast/hoast-changed.svg?branch=master&style=flat-square"/>
  </a>
  <a title="Open issues on GitHub" href="https://github.com/hoast/hoast-changed/issues" target="_blank" rel="noopener">
    <img src="https://img.shields.io/github/issues/hoast/hoast-changed.svg?style=flat-square"/>
  </a>
</div>

# hoast-changed

Filter out files which have not been changed since the last build.

> As the name suggest this is a [hoast](https://github.com/hoast/hoast#readme) module.

> Do note this module can only be used if `remove` property of the hoast options is **NOT** set to `true`.

## Usage

Install [hoast-changed](https://npmjs.com/package/hoast-changed) using [npm](https://npmjs.com).

```
$ npm install hoast-changed
```

### Parameters

* `file` **{{String}}**: The file path where the update times are stored.
	* Default: `hoast-changed`
* `patterns` **{Array|strings}**: A string or an array of strings which gets used to match files using glob patterns. If the file path matches one of the patterns it will never be filtered out regardless of the last update time. See [nanomatch](https://github.com/micromatch/nanomatch#readme) for more details on the patterns.
	* Required: `no`

### Example

**CLI**

```json
{
  "modules": {
	"hoast-changed": {
    "patterns": "**/index.md"
	},
	"read": {}
  }
}
```

> All the files will be checked for their changed time except the `index.md` files which will always be processed.

**Script**

```javascript
const Hoast = require(`hoast`);
const read = Hoast.read,
      changed = require(`hoast-changed`);

Hoast(__dirname)
  .use(changed({
    patterns: `**/index.md`
  }))
  .use(read())
  .process();
```

> All the files will be checked for their changed time except the `index.md` files which will always be processed.

## License

[ISC license](https://github.com/hoast/hoast-changed/blob/master/LICENSE)
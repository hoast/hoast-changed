<div align="center">
  
  [![npm package @latest](https://img.shields.io/npm/v/hoast-changed.svg?label=npm@latest&style=flat-square&maxAge=3600)](https://npmjs.com/package/hoast-changed)
  [![npm package @next](https://img.shields.io/npm/v/hoast-changed/next.svg?label=npm@next&style=flat-square&maxAge=3600)](https://npmjs.com/package/hoast-changed/v/next)
  
  [![Travis-ci status](https://img.shields.io/travis-ci/hoast/hoast-changed.svg?branch=master&label=test%20status&style=flat-square&maxAge=3600)](https://travis-ci.org/hoast/hoast-changed)
  [![CodeCov coverage](https://img.shields.io/codecov/c/github/hoast/hoast-changed/master.svg?label=test%20coverage&style=flat-square&maxAge=3600)](https://codecov.io/gh/hoast/hoast-changed)
  
  [![License agreement](https://img.shields.io/github/license/hoast/hoast-changed.svg?style=flat-square&maxAge=86400)](https://github.com/hoast/hoast-changed/blob/master/LICENSE)
  [![Open issues on GitHub](https://img.shields.io/github/issues/hoast/hoast-changed.svg?style=flat-square&maxAge=86400)](https://github.com/hoast/hoast-changed/issues)
  
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

* `file`: The file path where the update times are stored.
  * Type: `String`
  * Default: `hoast-changed`
* `patterns`: Glob patterns to match file paths with. If the file path matches the patterns it will be skipped and continue to be processed.
  * Type: `String` or `Array of strings`
  * Required: `no`
* `patternOptions`: Options for the glob pattern matching. See [planckmatch options](https://github.com/redkenrok/node-planckmatch#options) for more details on the pattern options.
  * Type: `Object`
  * Default: `{}`
* `patternOptions.all`: This options is added to `patternOptions`, and determines whether all patterns need to match instead of only one.
  * Type: `Boolean`
  * Default: `false`

### Example

**CLI**

```json
{
  "modules": {
    "hoast-changed": {
      "patterns": "**/index.md",
      "patternOptions": {
        "globstar": true
      }
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
    patterns: `**/index.md`,
    patternOptions: {
      globstar: true
    }
  }))
  .use(read())
  .process();
```

> All the files will be checked for their changed time except the `index.md` files which will always be processed.

## License

[ISC license](https://github.com/hoast/hoast-changed/blob/master/LICENSE)
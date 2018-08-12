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
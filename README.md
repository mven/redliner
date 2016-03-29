# redliner

redliner is a Mocha test utility that determines if an element is obeying style requirements set by a design guide when it's rendered by a browser. This is still very much a work in progress, so if you run into any issues, please [submit them](https://github.com/mven/redliner/issues).

#### Requirements
Node 0.12+

#### Dependencies

- [PhantomJS for Node](https://www.npmjs.com/package/phantom)
- [Mocha](https://www.npmjs.com/package/mocha)
- [Chai](https://www.npmjs.com/package/chai)
- [color-props](https://www.npmjs.com/package/color-props)

## How does it work?

1. Usage of PhantomJS to "headlessly" load a local resource that contains a full list of HTML elements*
2. Performs a scan of the `computedStyles` for that element
3. Compare the `computedStyles` to the properties set in `.yml` files and spit out any discrepancies

\* This HTML page should contain all the elements you want to redline that will also use the CSS you want to test. For instance, if you have a redline for `.btn` and `.btn-sm`, then the HTML page should have an element with a `.btn` class and an element with a `.btn-sm`.

## How to use redliner

### Quick
- `npm install redliner --save-dev`
- Create `.yml` redlines in `/test/` (see `.yml` example below)
- Create a test file in `/test/` (see `redliner-test.js` example below)
- Create HTML page with elements (see HTML example below)
- `mocha test/redliner-test.js`

### Details


#### Creating redlines
In order to use redliner, you'll need at least one `.yml` file that is structured like the example below (filename is unimportant):

**Example: `btn.yml`**

```yaml
formalName: Default Buttons
className: .btn
tests:
  - testGroup:
      testName: Padding
      paddingTop: 12px
      paddingRight: 35px
      paddingBottom: 12px
      paddingLeft: 35px
  - testGroup:
      testName: Fonts
      fontSize: 14px
      fontWeight: bold
  - testGroup:
      testName: Colors
      color: 'rgb(255, 255, 255)'
      backgroundColor: '#5596E6'
      fontWeight: bold
```

Each `testGroup` is a group of tests that will be run by Mocha. `testGroup` is composed of a `testName` and CSS properties that match the DOM API properties.

Requirements for `testGroup`:
- `testName` must be set (this will be the `describe` of your test)
-  There must be at least one CSS property to test


#### Creating the test file
All `.yml` files should be placed inside a dedicated folder which will then be referenced in your test file. A common way to do this is to place a `redlines` folder in the `test` folder within the root directory of your app.

**Example: `redliner-test.js`**
```javascript
var redliner = require('redliner'),
    path = require('path');

var config = {
  redlines: path.resolve(__dirname, 'redlines/'),
  resource: path.resolve(__dirname, '../all-elements.html')
};

redliner(config);
```

The `config` object has two properties:
- `redlines` is the resolved path to where the `.yml` files are located
- `resource` is the resolved path to where the local HTML file is located

Example directory structure of `test` folder:

```bash
app.js
node_modules
...
test
├── index.js
├── redliner-test.js
└── redlines
    ├── btn.yml
    ├── btnExtraSmall.yml
    └── btnSmall.yml
```


#### Creating the HTML page

Create an HTML page that contains the elements you want to redline. This page can be located anywhere in the project, but must be properly resolved in the `config` object.

**Example: `all-elements.html`**

```markup
<!DOCTYPE html>
<html>
  <head>
    ...
    <link rel="stylesheet" type="text/css" href="path/to/main.css">
    ...
  </head>
  <body>
    <button class="btn">Default Button</button>
    <button class="btn btn-sm">Small Button</button>
  </body>
</html>
```

#### TODOs
- Add unit tests
- Work on making things more modular



# SuperWall Titanium Module 

An iOS Titanium module integrating SuperWall API functionality.

## Quick Start TLDR;

- Add module zip `ti.superwall.tambitsoftware.com-iphone-1.0.0.zip` to root of your Titanium project
- Add a new entry in tiapp.xml modules section:
```xml
<modules>
    <module platform="ios">ti.superwall.tambitsoftware.com</module>
</modules>
```
- Go to https://superwall.com/ | Settings | Keys to get your Public API key
- Check out example for how to use superwall
- Note that setting the superwall.apikey="somekey" configures SuperWall with that key. It calls: `Superwall.configure(apiKey: apikey)`
- Quick start:
```js

let superwall = require("ti.superwall.tambitsoftware.com");

superwall.apikey = "pk_fill_in_your_superwall_apiKey_here";

function onDismissListener(e) {
	Ti.API.info("onDismissListener, e: " + JSON.stringify(e));
}

function onPresentListener(e) {
	Ti.API.info("onPresentListener, e: " + JSON.stringify(e));
}

function onErrorListener(e) {
	Ti.API.info("onErrorListener, e: " + JSON.stringify(e));
}

function onSkipListener(e) {
	Ti.API.info("onSkipListener, e: " + JSON.stringify(e));
	// skipped if user has already paid
}

function onFeatureLaunchedListener(e) {
	Ti.API.info("onFeatureLaunchedListener, e: " + JSON.stringify(e));
	// This is where the app feature should be launched. Executes when:
	// Gated and paid
	// Non-gated
}

superwall.showFeature({ eventName: "campaign_trigger",
    onDismiss: onDismissListener, onPresent: onPresentListener,
    onError: onErrorListener, onSkip: onSkipListener,
    onFeatureLaunched: onFeatureLaunchedListener
});

```


## Documentation
-----------------------------

## Example

The `example` directory contains a sample application and module tests. The api key needs to be updated

## Building

Run `ti build -b -p ios` which will compile and package the module.

## Install

To use your module locally inside an app you can copy the zip file into the app root folder and build the app.
The file will automatically be extracted and copied into the correct `modules/` folder.

## Project Usage

Register your module with your application by editing `tiapp.xml` and adding your module.
Example:

<modules>
    <module platform="ios">ti.superwall.tambitsoftware.com</module>
</modules>

When you run your project, the compiler will combine your module along with its dependencies
and assets into the application.

The hooks in ios/hooks/ti.swiftsupport.js will dynamically add the SuperWall SPM package into the Xcode project file at build

## Example Usage

To use your module in code, you will need to require it.

### ES6+ (recommended)

```js
import superwall from 'ti.superwall.tambitsoftware.com';
superwall.apiKey = "pk_fill_in_your_superwall_apiKey_here";
```

### ES5

```js
var superwall = require('ti.superwall.tambitsoftware.com');
superwall.apiKey = "pk_fill_in_your_superwall_apiKey_here";
```

## Testing

To test the ti.superwall module with the provided example, update app.js with your API key and use:

```js
ti build -p ios
```

This will execute the app.js in the example/ folder as a Titanium application.


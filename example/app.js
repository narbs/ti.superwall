/**
 * Create a new tab group.
 * @see https://titaniumsdk.com/api/titanium/ui/tabgroup.html
 */

global.should = require('should');

const tabGroup = Ti.UI.createTabGroup();

let superwall = require("ti.superwall.tambitsoftware.com");

// Change this to true to run tests
let testingEnabled = true;

/**
 * Add the two created tabs to the tabGroup object.
 */
tabGroup.addTab(createTab('Tab 1', '', 'assets/images/tab1.png'));
tabGroup.addTab(createTab('Tab 2', '', 'assets/images/tab2.png'));

/**
 * Open the tab group
 */
tabGroup.open();

function subscriptionStatusCallback(e) {
	Ti.API.info("subscriptionStatusCallback: " + JSON.stringify(e));
	// status: ["unknown", "active", "inactive"];
	Ti.API.info("subscriptionStatusCallback, status: " + e.status);
	Ti.API.info("subscriptionStatusCallback, message: " + e.message);

}

function initializeSuperwall() {
	
	if (!superwall) {
		return;
	}

	// Setting the apikey calls: Superwall.configure(apiKey: apikey)
	superwall.apikey = "pk_fill_in_your_superwall_apiKey_here";

	superwall.userId = "someuser@example.com";

	superwall.updateUserAttributes({"firstName":"Some User"});

	superwall.subscriptionStatus({callback: subscriptionStatusCallback});

	Ti.API.info('userId: ' + superwall.userId + ', loggedIn: ' + superwall.isLoggedIn);

}

// callback handlers: onDismiss, onPresent, onError, onSkip, onFeatureLaunched

function onDismissListener2(e) {
	Ti.API.info("onDismissListener2, e: " + JSON.stringify(e));
}

function onPresentListener2(e) {
	Ti.API.info("onPresentListener2, e: " + JSON.stringify(e));
}

function onErrorListener2(e) {
	Ti.API.info("onErrorListener2, e: " + JSON.stringify(e));
}

function onSkipListener2(e) {
	Ti.API.info("onSkipListener2, e: " + JSON.stringify(e));
	// skipped if user has already paid
}

function onFeatureLaunchedListener2(e) {
	Ti.API.info("onFeatureLaunchedListener2, e: " + JSON.stringify(e));
	// This is where the app feature should be launched. Executes when:
	// Gated and paid
	// Non-gated
}


function showSecondChance() {

	superwall.showFeature({
			eventName: "second_chance",
			onDismiss: onDismissListener2,
			onPresent: onPresentListener2,
			onError: onErrorListener2,
			onSkip: onSkipListener2,
			onFeatureLaunched: onFeatureLaunchedListener2
	});


}

function onDismissListener(e) {
	Ti.API.info("onDismissListener, e: " + JSON.stringify(e));
	// Can only show one paywall a time so have to make sure previous is dismissed first
	setTimeout(function() {
		showSecondChance();
	}, 500);
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

/**
 * Creates a new tab and configures it
 *
 * @param  {String} title The title used in the `Ti.UI.Tab` and it's included `Ti.UI.Window`
 * @param  {String} message The title displayed in the `Ti.UI.Label`
 * @return {String} icon The icon used in the `Ti.UI.Tab`
 */
function createTab(title, message, icon) {
    const window = Ti.UI.createWindow({
        backgroundColor: 'white',
        title: title
    });

    const label = Ti.UI.createLabel({
        text: message,
        color: 'black'
    });

    window.add(label);

	var button = Ti.UI.createButton({
		top: 200,
		title: "Show Superwall",
		font: { fontWeight: 'bold', fontSize: 22 },
		width: Ti.UI.SIZE,
	});

	window.add(button);

	button.addEventListener('click', function(e) {
		if (superwall) {
			// Show the feature
			// callback handlers:
			// onDismiss, onPresent, onError, onSkip
			// onFeatureLaunched
			superwall.showFeature({
				eventName: "campaign_trigger",
				onDismiss: onDismissListener,
				onPresent: onPresentListener,
				onError: onErrorListener,
				onSkip: onSkipListener,
				onFeatureLaunched: onFeatureLaunchedListener
			});

			// Get the apikey being used by the module
			Ti.API.info('apikey: ' + superwall.apikey);
		}
	});

    return Ti.UI.createTab({
        title: title,
        icon: icon,
        window: window
    });
}


// ------------------------------------------------------------------------
// TESTING - START
// ------------------------------------------------------------------------

function loadTests() {

	// create the test suite

	describe('ti-mocha', function() {

		describe('suite 1', function() {

			var closureApp = {};

			require('superwall.test.js')(closureApp, superwall);
			
		});

	});

	// run the tests
	var runner = mocha.run(function() {
		// print the stats from the runner after the test completes
		if (runner != null) {
			console.log(JSON.stringify(runner.stats));
		}
	});

}

function runTiMochaCITests() {

	setTimeout(function () {

		Ti.API.info('Running superwall tests...');

		require('ti-mocha');

		var outputFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'test-results.xml');
		if (outputFile.exists()) {
			outputFile.deleteFile();
		}
		outputFile.createFile();

		mocha.setup({ 
			reporter: 'xunit',    // the reporter to use with your tests
			outputFile: outputFile, // write results to the given Ti.Filesystem.File file
			quiet: false, // if true, suppress all console logging
			timeout: 20000, // test timeout
		});

		loadTests();

	}, 1000);

}


if (testingEnabled) {
	runTiMochaCITests();
}

initializeSuperwall();

// ------------------------------------------------------------------------
// TESTING - END
// ------------------------------------------------------------------------




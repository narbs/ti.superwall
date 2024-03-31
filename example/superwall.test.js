module.exports = function(app, superwallRef) {

    Ti.API.info('superwall.test...');

	var superwall = superwallRef;

	describe("#superwall-module", function() {

		it('superwall is not null', function() {
			should.exist(superwall);
		});

		it('apiKey inits successfully and can be read', function() {
			superwall.apiKey = "pk_fill_in_your_superwall_apiKey_here";
			should.exist(superwall.apiKey);
			superwall.apiKey.should.equal("pk_fill_in_your_superwall_apiKey_here");
		});

		it('reset logged in and user attributes', function() {
			superwall.logout();
			superwall.userId = "";
		});

		it('is logged in status can be read', function() {
			superwall.isLoggedIn.should.equal(false);
		});

		it('set and get userId property', function() {
			superwall.isLoggedIn.should.equal(false);
			superwall.userId.should.equal("");
			superwall.userId = "someuser@example.com";
			superwall.userId.should.equal("someuser@example.com");
		});

		it('check is logged in property after setting userId', function() {
			superwall.userId.should.equal("someuser@example.com");
			superwall.isLoggedIn.should.equal(true);
		});

		it('check setting user attributes', function() {
			superwall.updateUserAttributes({"firstName":"Some Name"});
			superwall.updateUserAttributes({"apnsToken":"apns_token"});
			superwall.updateUserAttributes({"email":"someuser@example.com"});
			superwall.updateUserAttributes({"username":"some_username"});
			superwall.updateUserAttributes({"profilePic":"https://example.com/profile/1234"});
			superwall.updateUserAttributes({"attribute2_int":42});
			superwall.updateUserAttributes({"attribute3_null":null});
			superwall.updateUserAttributes({
				"attribute4":"A",
				"attribute5":"B"
			});
		});

		it('subscriptionStatus', function(done) {

			function subscriptionStatusListener(e) {
				Ti.API.info("subscriptionStatusListener: " + JSON.stringify(e));
				// status: ["unknown", "active", "inactive"];
				should.exist(e);
				should.exist(e.status);
				should.exist(e.message);

				return done();
			}

			superwall.subscriptionStatus({callback: subscriptionStatusListener});
			
		});

	});

};

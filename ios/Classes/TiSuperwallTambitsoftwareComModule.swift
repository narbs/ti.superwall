//
//  TiSuperwallTambitsoftwareComModule.swift
//  ti.superwall
//
//  Created by Christian Clare
//  Copyright (c) 2024 Tambit Software. All rights reserved.
//

import UIKit
import TitaniumKit
import SuperwallKit
import Combine

/**
 
 Titanium Swift Module Requirements
 ---
 
 1. Use the @objc annotation to expose your class to Objective-C (used by the Titanium core)
 2. Use the @objc annotation to expose your method to Objective-C as well.
 3. Method arguments always have the "[Any]" type, specifying a various number of arguments.
 Unwrap them like you would do in Swift, e.g. "guard let arguments, let message = arguments.first"
 4. You can use any public Titanium API like before, e.g. TiUtils. Remember the type safety of Swift, like Int vs Int32
 and NSString vs. String.
 
 */

enum RestorePurchaseError: Error {
	case someError
}

enum PurchaseError: Error {
	case verificationFailed
}

@objc(TiSuperwallTambitsoftwareComModule)
class TiSuperwallTambitsoftwareComModule: TiModule {
	
	private var cachedAPIKey: String = ""
	private var identifyUserId: String = ""
	
	private var subscribedCancellable: AnyCancellable?
	
	// MARK: Module interface required methods
	func moduleGUID() -> String {
		return "f1a0e73c-5792-445a-9a74-f009df3f3f16"
	}
	
	override func moduleId() -> String! {
		return "ti.superwall.tambitsoftware.com"
	}
	
	override func startup() {
		super.startup()
		print("[DEBUG] \(self) loaded")
	}
	
	// MARK: Superwall module properties
	
	@objc public var isLoggedIn: Bool {
		get {
			return isSuperwallLoggedIn()
		}
	}
	
	@objc public var apikey: String {
		get {
			return cachedAPIKey
		}
		set {
			cachedAPIKey = newValue
			self.replaceValue(newValue, forKey: "apikey", notification: false)
			Superwall.configure(apiKey: cachedAPIKey)
		}
	}
	
	@objc public var userId: String {
		get {
			return identifyUserId
		}
		set {
			identifyUserId = newValue
			self.replaceValue(newValue, forKey: "userId", notification: false)
			Superwall.shared.identify(userId: newValue)
		}
	}
	
	// MARK: Superwall module functions
	
	@objc(logout:)
	func logout(arguments: [Any]) {
		superwallLogout()
	}
	
	@objc(updateUserAttributes:)
	func updateUserAttributes(arguments: [Any]) {
		print("updateUserAttributes...")
		print("arguments: \(arguments)")
		guard let params = arguments.first as? [String: Any] else { return }
		print("params: \(params)")
		for (key, value) in params {
			print("key: \(key), value: \(value)")
			setSuperwallUserAttribute(attributeName: key as String, value: value)
		}
	}
	
	static func mapPayWallInfoToDict(paywallInfo: PaywallInfo) -> [String:Any] {
		return [
			"identifier": paywallInfo.identifier,
			   "name": paywallInfo.name,
			   "presentedBy": paywallInfo.presentedBy,
			   "presentedByEventWithName": paywallInfo.presentedByEventWithName ?? "",
			   "isFreeTrialAvailable": paywallInfo.isFreeTrialAvailable,
			   "productIds": paywallInfo.productIds,
			   "presentedByEventAt": paywallInfo.presentedByEventAt ?? "",
			   "presentedByEventWithId": paywallInfo.presentedByEventWithId ?? "",
			   "url": paywallInfo.url.absoluteString,
			   "triggerSessionId": paywallInfo.triggerSessionId ?? "",
				"products": paywallInfo.products.map{ $0.id }
			   // "paywalljsVersion": paywallInfo.paywalljsVersion ?? "",
			   // "presentationSourceType": paywallInfo.presentationSourceType ?? "",
			   // "surveys": paywallInfo.surveys,
			   // "closeReason": paywallInfo.closeReason,
			   // "experiment": paywallInfo.experiment ?? [:],
			   // "featureGatingBehavior": paywallInfo.featureGatingBehavior,
			   // "localNotifications": paywallInfo.localNotifications,
			   // "responseLoadFailTime": paywallInfo.responseLoadFailTime ?? "",
			   // "webViewLoadFailTime": paywallInfo.webViewLoadFailTime ?? ""
		]
	}
	
	@objc(showFeature:)
	func showFeature(arguments: [Any]) {
		
		guard let params = arguments.first as? [String: Any] else { return }
		let eventName = params["eventName"] as? String
		let onDismiss = params["onDismiss"] as? KrollCallback
		let onPresent = params["onPresent"] as? KrollCallback
		let onError = params["onError"] as? KrollCallback
		let onSkip = params["onSkip"] as? KrollCallback
		let onFeatureLaunched = params["onFeatureLaunched"] as? KrollCallback
		
		var featureDict: [String:Any] = [:]
		
		guard let eventName else {
			return
		}
		
		if cachedAPIKey.isEmpty { return }
		
		// callback handlers: onDismiss, onPresent, onError, onSkip, onFeatureLaunched
		let handler = PaywallPresentationHandler()
		
		handler.onDismiss { [weak self] paywallInfo in
			print("Paywall onDismiss");
			featureDict["message"] = String(format: "The paywall dismissed")
			featureDict["paywallInfo"] = Self.mapPayWallInfoToDict(paywallInfo: paywallInfo)
			print("message: \(featureDict["message"] as? String ?? "")")
			print("payWallInfo: \(featureDict["paywallInfo"] as? String ?? "")")
			onDismiss?.call([featureDict], thisObject: self)
		}
		handler.onPresent { [weak self] paywallInfo in
			print("Paywall onPresent");
			featureDict["message"] = String(format: "The paywall presented")
			featureDict["paywallInfo"] = Self.mapPayWallInfoToDict(paywallInfo: paywallInfo)
			print("message: \(featureDict["message"] as? String ?? "")")
			print("payWallInfo: \(featureDict["paywallInfo"] as? String ?? "")")
			onPresent?.call([featureDict], thisObject: self)
		}
		handler.onError { [weak self] error in
			print("Paywall onError");
			featureDict["message"] = String(format: "The paywall presentation failed with error \(error)")
			print(featureDict["message"] as? String ?? "")
			onError?.call([featureDict], thisObject: self)
		}
		handler.onSkip { [weak self] reason in
			print("Paywall onSkip");
			switch reason {
			case .userIsSubscribed:
				featureDict["reason"] = "userIsSubscribed"
				featureDict["message"] = String(format: "Paywall not shown because user is subscribed.")
			case .holdout(let experiment):
				featureDict["reason"] = "holdout"
				featureDict["message"] = String(format: "Paywall not shown because user is in a holdout group in Experiment: \(experiment.id)")
				featureDict["experiment"] = ["id":experiment.id, "groupid": experiment.groupId, "description": experiment.description]
			case .noRuleMatch:
				featureDict["reason"] = "noRuleMatch"
				featureDict["message"] = String(format: "Paywall not shown because user doesn't match any rules.")
			case .eventNotFound:
				featureDict["reason"] = "eventNotFound"
				featureDict["message"] = String(format: "Paywall not shown because this event isn't part of a campaign.")
			}
			onSkip?.call([featureDict], thisObject: self)
		}
		
		// Superwall.shared.register(event:params:handler:feature:).
		Superwall.shared.register(event: eventName, handler: handler) { [weak self] in
			
			guard let self else {
				return;
			}
			
			// code in here can be remotely configured to execute. Either
			// (1) always after presentation or
			// (2) only if the user pays
			// code is always executed if no paywall is configured to show
			
			var featureLaunchedDict: [String:Any] = [:]
			// featureLaunchedDict["message"] = String(format: "Wrap your awesome features in register calls like this to remotely paywall your app. You can remotely decide whether these are paid features.")
			featureLaunchedDict["message"] = String(format: "Feature launched for event named: \(eventName)")
			featureLaunchedDict["eventName"] = String("\(eventName)")
			print(featureLaunchedDict["message"] as? String ?? "")
			onFeatureLaunched?.call([featureLaunchedDict], thisObject: self)
		}
	}
	
	@objc(subscriptionStatus:)
	private func superwallSubscriptionStatus(arguments: [Any]) {
		
		guard let params = arguments.first as? [String: Any],
			  let callback = params["callback"] as? KrollCallback else { return }
		
		subscribedCancellable = Superwall.shared.$subscriptionStatus
			.receive(on: DispatchQueue.main)
			.sink { [weak self] status in
				guard let self else {
					return
				}
				var subscriptionStatusDict: [String:Any] = [:]
				switch status {
				case .unknown:
					subscriptionStatusDict["status"] = "unknown"
					subscriptionStatusDict["message"] = "Loading subscription status (1)."
					print(subscriptionStatusDict["message"] as? String ?? "")
				case .active:
					subscriptionStatusDict["status"] = "active"
					subscriptionStatusDict["message"] = "Subscription is active"
					print(subscriptionStatusDict["message"] as? String ?? "")
				case .inactive:
					subscriptionStatusDict["status"] = "inactive"
					subscriptionStatusDict["message"] = "You do not have an active subscription so the paywall will show when clicking the button."
					print(subscriptionStatusDict["message"] as? String ?? "")
				@unknown default:
					subscriptionStatusDict["status"] = "unknown"
					subscriptionStatusDict["message"] = "Loading subscription status (2)."
					print(subscriptionStatusDict["message"] as? String ?? "")
				}
				callback.call([subscriptionStatusDict], thisObject: self)
			}
	}
	
	// MARK:  Superwall functions
	
	private func superwallLogout() {
		print("superwallLogout...")
		Superwall.shared.reset()
	}
	
	private func setSuperwallUserAttribute(attributeName: String, value: Any?) {
		Superwall.shared.setUserAttributes([attributeName: value])
	}
	
	private func isSuperwallLoggedIn() -> Bool {
		return Superwall.shared.isLoggedIn
	}
	
}

/**
 * Ti.SwiftSupport
 * Copyright TiDev, Inc. 04/07/2022-Present. All Rights Reserved.
 * All Rights Reserved.
 */

'use strict';

exports.id = 'ti.swiftsupport';
exports.cliVersion = '>=3.2';
exports.init = init;

/**
 * A function to inject SPM packages into the Xcode project.
 * The 24 char UUIDs should be random.
 * Each UUID should be uppercase (by convention) and each of the 3 UUID params unique.
 *
 * @param {Object} xobjs - the Xcode plist object graph 
 * @param String swiftPackageFrameworkName Swift package framework name, e.g. MyPackage.
 * @param String swiftPackageProductName Swift package product name, e.g. MyPackageKit
 * @param String spmRemotePackageReference Swift package remote package reference name, e.g. MyPackage-iOS
 * @param String spmRepositoryURL SPM repository URL, e.g. https://github.com/some-company/MyPackage-iOS
 * @param String spmRepositoryVersionKind SPM repository kind, e.g. upToNextMajorVersion
 * @param String spmRepositoryMinVersion SPM repository minimum version, e.g. 3.0.0 
 * @param String swiftProductUUID Swift product UUID, 24 char Xcode UUID, e.g. SWIFTPACKGEMANAGERTEST01
 * @param String pbxBuildFileUUID PBX build file UUID, 24 char Xcode UUID, e.g. SWIFTPACKGEMANAGERTEST02
 * @param String spmRemotePackageUUID SPM remote package UUID, 24 char Xcode UUID, e.g. SWIFTPACKGEMANAGERTEST03
 *
 */
function injectSPMPackage(xobjs,
		swiftPackageFrameworkName, swiftPackageProductName,
		spmRemotePackageReference,
		spmRepositoryURL, spmRepositoryVersionKind, spmRepositoryMinVersion,
		swiftProductUUID, pbxBuildFileUUID, spmRemotePackageUUID) {

	// PBXBuildFile
	xobjs.PBXBuildFile[pbxBuildFileUUID + " \/* " +
		swiftPackageFrameworkName + " in Frameworks *\/"] = {
			"isa":"PBXBuildFile",
			"productRef":swiftProductUUID,
			"fileRef_comment":swiftPackageProductName + " in Frameworks"
		};

	// PBXFrameworksBuildPhase
	Object.keys(xobjs.PBXFrameworksBuildPhase).forEach(function (buildPhaseUUID) {
		var buildPhase = xobjs.PBXFrameworksBuildPhase[buildPhaseUUID];
		if (buildPhase && typeof buildPhase === 'object') {
			buildPhase.files.push({
				"value":pbxBuildFileUUID,
				"comment":swiftPackageProductName + " in Frameworks"
			});
		}
	});

	// PBXNativeTarget
	Object.keys(xobjs.PBXNativeTarget).forEach(function (nativeTargetUUID) {
		var nativeTarget = xobjs.PBXNativeTarget[nativeTargetUUID];
		if (nativeTarget && typeof nativeTarget === 'object') {
			nativeTarget["packageProductDependencies"] =
				"(\n\t\t\t\t" + swiftProductUUID + " \/* " +
				swiftPackageProductName + " *\/,\n\t\t\t)";
		}
	});

	// PBXProject
	// xobjs.PBXProject
	Object.keys(xobjs.PBXProject).forEach(function (pbxProjUUID) {
		var pbxProj = xobjs.PBXProject[pbxProjUUID];
		if (pbxProj && typeof pbxProj === 'object') {
			pbxProj["packageReferences"] =
				"(\n\t\t\t\t" + spmRemotePackageUUID +
				" \/* XCRemoteSwiftPackageReference \"" +
				spmRemotePackageReference + "\" *\/,\n\t\t\t)";

		}
	});

	// XCRemoteSwiftPackageReference
	const remoteSwiftPackageReferenceID = spmRemotePackageUUID +
		" \/* XCRemoteSwiftPackageReference \"" +
		spmRemotePackageReference + "\" *\/";

	var xcRSPR = xobjs["XCRemoteSwiftPackageReference"] = {};
	xcRSPR[remoteSwiftPackageReferenceID] = 
		{"isa":"XCRemoteSwiftPackageReference",
		 "repositoryURL":"\"" + spmRepositoryURL + "\"",
			"requirement":{"kind":spmRepositoryVersionKind,
			"minimumVersion":spmRepositoryMinVersion}
		}

	// XCSwiftPackageProductDependency
	const swiftPackageProductDependencyID = swiftProductUUID + " \/* " +
			swiftPackageProductName + " *\/";
	var xcSPPD = xobjs["XCSwiftPackageProductDependency"] = {};
	xcSPPD[swiftPackageProductDependencyID] = {
		"isa":"XCSwiftPackageProductDependency",
		"package":spmRemotePackageUUID + " \/* XCRemoteSwiftPackageReference \"" +
		spmRemotePackageReference + "\" *\/","productName":swiftPackageProductName
	}

}

/**
 * Main entry point for our plugin which looks for the platform specific
 * plugin to invoke.
 *
 * @param {Object} logger The logger instance.
 * @param {Object} config The hook config.
 * @param {Object} cli The Titanium CLI instance.
 * @param {Object} appc The Appcelerator CLI instance.
 */
// eslint-disable-next-line no-unused-vars
function init(logger, config, cli, appc) {
	cli.on('build.ios.xcodeproject', {
		pre: function (data) {

			var xobjs = data.args[0].hash.project.objects;

			injectSPMPackage(xobjs, 
				"Superwall", "SuperwallKit",
				"Superwall-iOS",
				"https://github.com/superwall-me/Superwall-iOS", "upToNextMajorVersion", "3.0.0",
				"SUPERWALL0101SUPERWALL01", "SUPERWALL0101SUPERWALL02", "SUPERWALL0101SUPERWALL03");

			// PBXNativeTarget
			Object.keys(xobjs.PBXNativeTarget).forEach(function (targetUuid) {
				var target = xobjs.PBXNativeTarget[targetUuid];
				if (target && typeof target === 'object') {
					xobjs.XCConfigurationList[target.buildConfigurationList].buildConfigurations.forEach(function (buildConf) {
						var buildSettings = xobjs.XCBuildConfiguration[buildConf.value].buildSettings;
						buildSettings.ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES = 'YES';
					});
				}
			});
		}
	});
}


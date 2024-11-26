/*global QUnit*/

sap.ui.define([
	"z_barcodescan/controller/ViewBarcode.controller"
], function (Controller) {
	"use strict";

	QUnit.module("ViewBarcode Controller");

	QUnit.test("I should test the ViewBarcode controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});

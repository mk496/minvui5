sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.smartStore.controller.AddMaterial", {

		onInit: function () {
			var oViewModel = new JSONModel({});
			this.getView().setModel(oViewModel, "addMaterialView");

			/* Initialize User Info for displaying User Name, Last Name and ID */
			this.initUserInfo();
		},

		onAddSave: function () {
			var desc = this.byId("addMaterialDesc").getValue().toString(),
				days = parseInt(this.byId("addMaterialExpDays").getValue(), 10),
				type = this.byId("addMaterialType").getSelectedItem().getText().toString(),
				order = parseInt(this.byId("addMaterialOrdering").getValue(), 10);
			if (desc && days && type) {
				var oData = {
					MaterialDescription: desc,
					ExpirationDays: days,
					ExpirationType: type,
					Treshold: order
				};
				this.getModel().create("/MaterialSet", oData, {
					success: function () {},
					error: function () {}
				});
				this.clear();
				this.onNavBack();
				MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("SaveMessage"));
			} else {
				MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("CompleteMaterial"));
			}
		},

		clear: function () {
			this.getView().byId("addMaterialDesc").setValue("");
			this.getView().byId("addMaterialExpDays").setValue("");
			this.getView().byId("addMaterialOrdering").setValue("");
		},

		onAddReject: function () {
			MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("RejectMessage"));
			this.onNavBack();
		}

	});

});
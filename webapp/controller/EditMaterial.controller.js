sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.smartStore.controller.EditMaterial", {

		onInit: function () {
			var oViewModel = new JSONModel({});

			this.getRouter().getRoute("EditMaterial").attachPatternMatched(this._onObjectMatched, this);
			this.getView().setModel(oViewModel, "editMaterialView");

			/* Initialize User Info for displaying User Name, Last Name and ID */
			this.initUserInfo();
		},

		_onObjectMatched: function (oEvent) {
			var itemId = oEvent.getParameter("arguments").Id,
				that = this;

			this.getView().bindElement({
				path: "/MaterialSet(" + itemId + ")",
				events: {
					dataRequested: function () {
						that.getView().setBusy(true);
					},
					dataReceived: function () {
						that.getView().setBusy(false);
					}
				}
			});
		},

		onEditSave: function () {
			MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("SaveMessage"));

			var sPath = this.getView().getBindingContext().sPath,
				oModel = this.getModel(),
				sMaterialDesc = this.byId("editMaterial").getValue(),
				iExpDays = this.byId("editExpDays").getValue(),
				sExpType = this.byId("editMaterialType").getSelectedItem().getText(),
				iOrdering = this.byId("editOrdering").getValue();
			oModel.setProperty(sPath + "/MaterialDescription", sMaterialDesc.toString());
			oModel.setProperty(sPath + "/ExpirationDays",iExpDays.toString());
			oModel.setProperty(sPath + "/ExpirationType", sExpType.toString());
			oModel.setProperty(sPath + "/Treshold", iOrdering.toString());
			oModel.submitChanges();
			this.onNavBack();
		},
		onEditReject: function () {
			MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("RejectMessage"));

			this.getModel().resetChanges();
			this.onNavBack();
		}

	});

});
sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.smartStore.controller.EditLocations", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.sap.build.standard.smartStore.view.Locations
		 */
		onInit: function () {
			this.getRouter().getRoute("EditLocations").attachPatternMatched(this._onObjectMatched, this);
			
			/* Initialize User Info for displaying User Name, Last Name and ID */
			this.initUserInfo();

			// Model used to manipulate control states
			var oViewModel = new JSONModel({});
			this.getView().setModel(oViewModel, "editLocationsView");
		},
		
		_onObjectMatched: function (oEvent) {
			var itemId =  oEvent.getParameter("arguments").Id;
			this.getView().bindElement("/LocationsSet("+ itemId +")");
		},
		
		onEditSave: function () {
			this.getModel().submitChanges();
			
			MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("SaveMessage"));
			this.onNavBack();
		},

		_createNewLocation: function () {
			return {
				Id: "0",
				LocationDescription: this.byId("addLocationDescription").getValue(),
				Building: this.byId("addLocationBuilding").getValue(),
				Floor: this.byId("addLocationFloor").getValue(),
				Room: this.byId("addLocationRoom").getValue()
			};
		},
		
		onEditReject: function () {
			MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("RejectMessage"));
			this.getModel().resetChanges();
			this.onNavBack();
		},
		
		_handleDeleteLocation : function (sProductId, bSuccess, iRequestNumber, iTotalRequests){
				if (iRequestNumber === iTotalRequests) {
					if (iRequestNumber > 1) {
						MessageToast.show(this.getModel("i18n").getResourceBundle().getText("ProductsDeleteSuccessMsg", [iTotalRequests]));
					} else {
						MessageToast.show(this.getModel("i18n").getResourceBundle().getText("ProductDeleteSuccessMsg", [iTotalRequests]));
					}
					
				}
			},
	});

});
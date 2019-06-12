sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/model/json/JSONModel"
], function(BaseController, MessageBox, Utilities, JSONModel) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.smartStore.controller.ProductInfo", {
		onInit: function() {
			var	oViewModel = new JSONModel({});

			this.getRouter().getRoute("ProductInfo").attachPatternMatched(this._onObjectMatched, this);
			this.getView().setModel(oViewModel, "productView");
			
			var oUserModel = new sap.ui.model.json.JSONModel("/services/userapi/currentUser");
			this.getView().setModel(oUserModel, "userapi");
		},

		_onObjectMatched : function (oEvent) {
			var sObjectId =  oEvent.getParameter("arguments").itemId;
			this.getView().getModel().metadataLoaded().then( function() {
				var sObjectPath = this.getView().getModel().createKey("InventorySet", {
					Id :  sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		_bindView : function (sObjectPath) {
			this.getView().bindElement({
				path: sObjectPath
			});
		},

		_onBindingChange : function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}
		}
	});
}, /* bExport= */ true);

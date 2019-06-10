sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.smartStore.controller.Requisition", {

		onInit: function () {
			var	oViewModel = new JSONModel({
				orderItemsCount: 0
			});

			this.getRouter().getRoute("Requisition").attachPatternMatched(this._onObjectMatched, this);
			this.getView().setModel(oViewModel, "requisitionView");
		},
		
		onUpdateFinished: function (oEvent) {
				var iTotalItems = oEvent.getParameter("total"),
					oModel = this.getView().getModel("requisitionView");
				
				if (oEvent.getSource().getId() === "container-SmartStore---Requisition--orderItems") {
					oModel.setProperty("/orderItemsCount", iTotalItems);
				}
			},
		
		_onObjectMatched : function (oEvent) {
			var sObjectId =  oEvent.getParameter("arguments").requisitionId;
			this.getView().getModel().metadataLoaded().then( function() {
				var sObjectPath = this.getView().getModel().createKey("RequisitionHeaderSet", {
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

});
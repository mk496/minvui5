sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.smartStore.controller.AddInventory", {
		onInit: function () {
			var oViewModel = new JSONModel({});

			this.getView().setModel(oViewModel, "addInventoryView");

			/* Initialize User Info for displaying User Name, Last Name and ID */
			this.initUserInfo();
		},

		_bindView: function (sObjectPath) {
			this.getView().bindElement({
				path: sObjectPath
			});
		},

		onAddSave: function () {
			MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("SaveMessage"));

			var oData = this._createNewItem();

			this.getModel().create("/InventorySet", oData, {
				success: function () {
					
				},
				error: function () {}
			});
			
			this.clearScreenInventory();
			this.onNavBack();
		},

		_createNewItem: function () {
			var sStatus = this.byId("addStatus").getSelectedItem().getProperty("text");
			return {
				Id: null,
				ProductDescription: this.byId("addMaterial").getSelectedItem().getProperty("text"),
				Price: this.byId("addPrice").getValue(),
				Currency: this.byId("addCurrency").getSelectedItem().getProperty("text"),
				ShelfStock: this.byId("addShelfStock").getValue().toString(),
				Location: this.byId("addLocation").getSelectedItem().getProperty("text"),
				Status: sStatus,
				StatusColor: (sStatus === "In-Stock") ? sap.ui.core.ValueState.Success : sap.ui.core.ValueState.Error,
				InStock: this.byId("addInStock").getValue().toString(),
				Unit: this.byId("addUnit").getSelectedItem().getProperty("text"),
				StoringInstruction: this.byId("addInstructions").getValue(),
				LifeRemaining: this.byId("addLifeValue").getValue(),
				LifeRemainingTreshold: "Success",
				ItemType: this.byId("addItemType").getValue(),
				OrderingTreshold: this.byId("addOrderingTreshold").getValue()
			};
		},

		onAddReject: function () {
			MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("RejectMessage"));
			this.onNavBack();
		},
		
		clearScreenInventory: function () {
			this.byId("addMaterial").getSelectedItem().setKey("");
			this.byId("addPrice").setValue("");
			this.byId("addCurrency").getSelectedItem().setKey("1");
			this.byId("addShelfStock").setValue("0");
			this.byId("addLocation").getSelectedItem().setKey("");
			this.byId("addStatus").getSelectedItem().setKey("1");
			this.byId("addInStock").setValue("0");
			this.byId("addUnit").getSelectedItem().setKey("1");
			this.byId("addInstructions").setValue("");
			this.byId("addLifeValue").setValue("");
			//this.byId("addLifeType").setValue("");
			//this.byId("addTreshold").getSelectedItem().setKey("1");
			this.byId("addItemType").setValue("");
			this.byId("addOrderingTreshold").setValue("");
		},
		
		onMaterialSelect: function (oEvent) {
			var sKey = oEvent.getSource().getSelectedKey(),
				iLifeValue = this.getModel().oData["MaterialSet(" + sKey + "l)"].ExpirationDays,
				iOrderingTreshold = this.getModel().oData["MaterialSet(" + sKey + "l)"].Treshold,
				sItemType = this.getModel().oData["MaterialSet(" + sKey + "l)"].ExpirationType;
				
			//There should be another, more prettier way to get this data, but currently cannot find out how
				
			this.byId("addLifeValue").setValue(iLifeValue);
			this.byId("addItemType").setValue(sItemType);
			this.byId("addOrderingTreshold").setValue(iOrderingTreshold);

		}
	});

});
sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.smartStore.controller.EditInventory", {
		onInit: function () {
			var oViewModel = new JSONModel({});

			this.getRouter().getRoute("EditInventory").attachPatternMatched(this._onObjectMatched, this);
			this.getView().setModel(oViewModel, "editInventoryView");

			/* Initialize User Info for displaying User Name, Last Name and ID */
			this.initUserInfo();
		},

		_onObjectMatched: function (oEvent) {
			var itemId =  oEvent.getParameter("arguments").Id,
				that = this;

			this.getView().bindElement({
				path: "/InventorySet("+ itemId +")",
				events : {
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
				dPrice = this.byId("editPrice").getValue(),
				iShelfStock = this.byId("editShelfStock").getValue(),
				iInStock = this.byId("editInStock").getValue(),
				sLocation = this.byId("editLocation").getSelectedItem().getProperty("text"),
				sMaterial = this.byId("editMaterial").getSelectedItem().getProperty("text");
			
			oModel.setProperty(sPath + "/ProductDescription", sMaterial);
			oModel.setProperty(sPath + "/Price", dPrice.toString());
			oModel.setProperty(sPath + "/ShelfStock", iShelfStock.toString());
			oModel.setProperty(sPath + "/InStock", iInStock.toString());
			oModel.setProperty(sPath + "/Location", sLocation);
			
			oModel.submitChanges();
			this.onNavBack();
			    
			    // Saved for further purposes - maybe?
				//sProductDescription = this.byId("editMaterial").getValue(),
				//sCurrency = this.byId("editCurrency").getSelectedItem().getProperty("text"),
				/*sUnit = this.byId("editUnit").getSelectedItem().getProperty("text"),
				sStatus = this.byId("editStatus").getSelectedItem().getProperty("text"),
				sItemType = this.byId("editItemType").getSelectedItem().getProperty("text"),
				sStoringInstruction = this.byId("editInstructions").getValue(),
				sLifeRemaining = this.byId("editLifeValue").getValue() + " " + this.byId("editLifeType").getSelectedItem().getProperty("text"),
				sLifeRemainingTreshold = this.byId("editTreshold").getSelectedItem().getProperty("text"),
				sOrderingTreshold = this.byId("editOrderingTreshold").getSelectedItem().getProperty("text");*/
				
			    //oModel.setProperty(sPath + "/ProductDescription", sProductDescription);
			    //oModel.setProperty(sPath + "/Currency", sCurrency);
			    /*oModel.setProperty(sPath + "/Unit", sUnit);
			    oModel.setProperty(sPath + "/Status", sStatus);
			    oModel.setProperty(sPath + "/ItemType", sItemType);
			    oModel.setProperty(sPath + "/StoringInstruction", sStoringInstruction);
			    oModel.setProperty(sPath + "/LifeRemaining", sLifeRemaining);
			    oModel.setProperty(sPath + "/LifeRemainingTreshold", sLifeRemainingTreshold);
			    oModel.setProperty(sPath + "/OrderingTreshold", sOrderingTreshold);*/
		},

		onEditReject: function () {
			MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("RejectMessage"));
			
			this.getModel().resetChanges();
			this.onNavBack();
		},
		
		onMaterialSelect: function (oEvent) {
			var sKey = oEvent.getSource().getSelectedKey(),
				iLifeValue = this.getModel().oData["MaterialSet(" + sKey + "l)"].ExpirationDays,
				iOrderingTreshold = this.getModel().oData["MaterialSet(" + sKey + "l)"].Treshold,
				sItemType = this.getModel().oData["MaterialSet(" + sKey + "l)"].ExpirationType;
				
			//There should be another, more prettier way to get this data, but currently cannot find out how
				
			this.byId("editLifeValue").setValue(iLifeValue);
			this.byId("editItemType").setValue(sItemType);
			this.byId("editOrderingTreshhold").setValue(iOrderingTreshold);

		}
	});

});
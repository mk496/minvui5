sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.smartStore.controller.Locations", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.sap.build.standard.smartStore.view.Locations
		 */
		onInit: function () {
			/* Initialize User Info for displaying User Name, Last Name and ID */
			this.initUserInfo();

			// Model used to manipulate control states
			var oViewModel = new JSONModel({
				allItemsCount: 0,
				ordersCount: 0
			});

			this.getView().setModel(oViewModel, "locationsView");
		},

		onEdit: function () {
			if ((this._checkHasSelected()) === true ) {
					
					// Get first selected item
					var oSelectedItem = this.byId("tableLocations").getSelectedItems()[0];
					
					this.getRouter().navTo("EditLocations", {
						Id: oSelectedItem.getBindingContext().getProperty("Id")
					});
				}
		},

		onAdd: function () {
			this.getRouter().navTo("AddLocations");
		},

		onDelete: function () {
			var aSelectedProducts, i, sPath, oProduct, oProductId,
				oTable = this.byId("tableLocations"),
				oModel = this.getModel(),
				that = this;

			aSelectedProducts = oTable.getSelectedItems();
			if (aSelectedProducts.length) {
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.warning(
					that.getModel("i18n").getResourceBundle().getText("dialogDeleteWarning"), {
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "OK") {
								for (i = 0; i < aSelectedProducts.length; i++) {
									oProduct = aSelectedProducts[i];
									oProductId = oProduct.getBindingContext().getProperty("Id");
									sPath = oProduct.getBindingContext().getPath();
									oModel.remove(sPath, {
										success: that._handleDeleteLocation.bind(that, oProductId, true, i + 1, aSelectedProducts.length),
										error: that._handleDeleteLocation.bind(that, oProductId, false, i + 1, aSelectedProducts.length)
									});
								}
							} else {
								that.byId("tableLocations").removeSelections();
							}
						}
					}
				);
			} else {
				MessageToast.show(this.getModel("i18n").getResourceBundle().getText("TableSelectAtLEastOneProductMsg"));
			}
		},

		onAddSave: function () {
			MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("SaveMessage"));

			var oData = this._createNewLocation();

			this.getModel().create("/LocationsSet", oData, {
				success: function () {},
				error: function () {}
			});

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

		onAddReject: function () {
			MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("RejectMessage"));
			this.onNavBack();
		},

		_handleDeleteLocation: function (sProductId, bSuccess, iRequestNumber, iTotalRequests) {
			if (iRequestNumber === iTotalRequests) {
				if (iRequestNumber > 1) {
					MessageToast.show(this.getModel("i18n").getResourceBundle().getText("ProductsDeleteSuccessMsg", [iTotalRequests]));
				} else {
					MessageToast.show(this.getModel("i18n").getResourceBundle().getText("ProductDeleteSuccessMsg", [iTotalRequests]));
				}

			}
		},

		_checkHasSelected: function () {
			var oTable = this.byId("tableLocations"),
				oSelectedItems = oTable.getSelectedItems();

			if (oSelectedItems.length > 0) {
				return true;
			} else {
				MessageToast.show(this.getModel("i18n").getResourceBundle().getText("TableSelectAtLEastOneProductMsg"));
				return false;
			}
		},
	});

});
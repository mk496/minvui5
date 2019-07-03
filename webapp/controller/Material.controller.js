
sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (BaseController, MessageBox, MessageToast) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.smartStore.controller.Material", {

		onInit: function () {},

		onSelectionChange: function () {
			this.byId("btnMaterialEdit").setEnabled();
			this.byId("btnMaterialDel").setEnabled();
		},

		onDelete: function () {
			var sPath, oProduct,
				oTable = this.byId("tableMaterials"),
				oModel = this.getModel(),
				that = this;
			oProduct = oTable.getSelectedItem();
			if (oProduct !== null || typeof (oProduct) !== 'undefined') {
				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.warning(
					that.getModel("i18n").getResourceBundle().getText("dialogDeleteWarning"), {
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === "OK") {
								sPath = oProduct.getBindingContext().getPath();
								oModel.remove(sPath, {
									success: that._handleDeleteProduct.bind(that),
									error: that._handleDeleteProduct.bind(that)
								});
								that.getModel().refresh();
							} else {
								that.byId("tableMaterials").removeSelections();
							}
						}
					}
				);
			} else {
				MessageToast.show(this.getModel("i18n").getResourceBundle().getText("TableSelectMaterial"));
			}
		},
		_handleDeleteProduct: function () {
			MessageToast.show(this.getModel("i18n").getResourceBundle().getText("MaterialDeleteSuccessMsg"));
		},
		
		onEdit: function(){
			var oSelectedItem = this.byId("tableMaterials").getSelectedItem();
					
			this.getRouter().navTo("EditMaterial", {
				Id: oSelectedItem.getBindingContext().getProperty("Id")
			});
		},
		onAdd: function(){
			this.getRouter().navTo("AddMaterial");
		}

	});

});
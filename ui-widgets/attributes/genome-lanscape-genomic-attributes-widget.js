/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

ExpressionGenomicAttributesWidget.prototype.draw = GenomicAttributesWidget.prototype.draw;
ExpressionGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
ExpressionGenomicAttributesWidget.prototype.drawKaryotype = GenomicAttributesWidget.prototype.drawKaryotype;
ExpressionGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
ExpressionGenomicAttributesWidget.prototype.makeGrid = GenomicAttributesWidget.prototype.makeGrid;
ExpressionGenomicAttributesWidget.prototype.getKaryotypePanelId = GenomicAttributesWidget.prototype.getKaryotypePanelId;
ExpressionGenomicAttributesWidget.prototype.dataChange = GenomicAttributesWidget.prototype.dataChange;


function ExpressionGenomicAttributesWidget(targetId, widgetId, args){
	GenomicAttributesWidget.prototype.constructor.call(this, targetId, widgetId, args);
    this.karyotypeWidget = new KaryotypePanel(this.getKaryotypePanelId(), this.getKaryotypePanelId(), {"top":10, "width":1000, "height": 300, "trackWidth":15});
};


ExpressionGenomicAttributesWidget.prototype.dataChange = function (items){
	try{
				console.log(items);
				var _this = this;
				this.karyotypePanel.setLoading("Connecting to Database");
				this.karyotypeWidget.unmark();
				var _this=this;
				var externalNames = [];
				
				if (items.length > 0){
					for (var i = 0; i < items.length; i++) {
						externalNames.push(items[i].data[0]);
					}	
					
					
					var cellBaseDataAdapter = new CellBaseDataAdapter();
					cellBaseDataAdapter.successed.addEventListener(function(sender){		
						_this.karyotypePanel.setLoading("Retrieving data");
						for (var i = 0; i < cellBaseDataAdapter.dataset.toJSON().length; i++) {
								_this.karyotypeWidget.mark(cellBaseDataAdapter.dataset.toJSON()[i]);
						}
						_this.karyotypePanel.setLoading(false);
					});
					cellBaseDataAdapter.fill("feature", "gene", externalNames.toString(), "info");
				}
	}
	catch(e){
		alert(e);
		this.panel.setLoading(false);
	}
};



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
ExpressionGenomicAttributesWidget.prototype.getMainPanel = GenomicAttributesWidget.prototype.getMainPanel;
ExpressionGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
ExpressionGenomicAttributesWidget.prototype.drawKaryotype = GenomicAttributesWidget.prototype.drawKaryotype;
ExpressionGenomicAttributesWidget.prototype.makeGrid = GenomicAttributesWidget.prototype.makeGrid;
ExpressionGenomicAttributesWidget.prototype.getKaryotypePanelId = GenomicAttributesWidget.prototype.getKaryotypePanelId;
ExpressionGenomicAttributesWidget.prototype.onAdditionalInformationClick = GenomicAttributesWidget.prototype.onAdditionalInformationClick;


function ExpressionGenomicAttributesWidget(species, args){
	if (args == null){
		args = new Object();
	}
	args.columnsCount = 2;
	args.title = "Expression";
	args.tags = ["expression"];
	args.featureType = 'gene';
	args.listWidgetArgs = {title:"Filter",action:'filter'};
	GenomicAttributesWidget.prototype.constructor.call(this, species, args);
};

ExpressionGenomicAttributesWidget.prototype.fill = function (queryNames){
	var _this = this;
	
	var normalized = Normalizer.normalizeArray(values);
	var colors = [];
	for ( var i = 0; i < normalized.length; i++) {
		if (!isNaN(parseFloat(values[i]))){
			colors.push( Colors.getColorByScoreValue(normalized[i]).HexString());
		}
		else{
			colors.push( "#000000");
		}
	}
	
	if(this.cbResponse==null){
		var cellBaseManager = new CellBaseManager(this.species);
		var featureDataAdapter = new FeatureDataAdapter(null,{species:this.species});
		cellBaseManager.success.addEventListener(function(sender,data){
			_this.karyotypePanel.setLoading("Retrieving data");
			for (var i = 0; i < data.result.length; i++) {
				if(data.result[i].length>0){
					_this.attributesPanel.store.data.items[i].data.cellBase = true;
				}else{
					_this.attributesPanel.store.data.items[i].data.cellBase = false;
				}
				for (var j = 0; j < data.result[i].length; j++) {
					var feature = data.result[i][j];
					feature.featureType = "gene";
					_this.karyotypeWidget.addMark(feature,  colors[i]);
					featureDataAdapter.addFeatures(feature);
				}
			}

			_this.adapter = featureDataAdapter;
//			_this.query = {"dataset": cellBaseManager.dataset, "resource":queryNames }; 
//			_this.features=cellBaseManager.dataset.toJSON();
			_this.filtersButton.enable();
			_this.addTrackButton.enable();
			_this.karyotypePanel.setLoading(false);

			_this.cbResponse = data;
			_this.karyotypePanel.setLoading(false);
		});
		this.karyotypePanel.setLoading("Connecting to Database");
		cellBaseManager.get("feature", "gene", queryNames.toString(), "info");
		
	}
};

ExpressionGenomicAttributesWidget.prototype.dataChange = function (items){
	try{
				var _this = this;
				var externalNames = [];
				values = [];
				
				for (var i = 0; i < items.length; i++) {
					externalNames.push(items[i].data[0]);
					values.push(items[i].data[1]);
					
				}	
				
				if (items.length > 0){
					this.fill(externalNames, values);
				}
	}
	catch(e){
		alert(e);
		this.panel.setLoading(false);
	}
};
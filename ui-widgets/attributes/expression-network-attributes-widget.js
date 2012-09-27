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

ExpressionNetworkAttributesWidget.prototype.draw = NetworkAttributesWidget.prototype.draw;
ExpressionNetworkAttributesWidget.prototype.render = NetworkAttributesWidget.prototype.render;
ExpressionNetworkAttributesWidget.prototype.render = NetworkAttributesWidget.prototype.render;
ExpressionNetworkAttributesWidget.prototype.makeGrid = NetworkAttributesWidget.prototype.makeGrid;

ExpressionNetworkAttributesWidget.prototype.getDetailPanel = NetworkAttributesWidget.prototype.getDetailPanel;
ExpressionNetworkAttributesWidget.prototype.getNetworkPanelId = NetworkAttributesWidget.prototype.getNetworkPanelId;
ExpressionNetworkAttributesWidget.prototype.drawNetwork = NetworkAttributesWidget.prototype.drawNetwork;
ExpressionNetworkAttributesWidget.prototype.dataChanged = NetworkAttributesWidget.prototype.dataChanged;
ExpressionNetworkAttributesWidget.prototype.getFoundVertices = NetworkAttributesWidget.prototype.getFoundVertices;
ExpressionNetworkAttributesWidget.prototype.getVertexAttributesByName = NetworkAttributesWidget.prototype.getVertexAttributesByName;
//ExpressionNetworkAttributesWidget.prototype.getButtons = NetworkAttributesWidget.prototype.getButtons;


function ExpressionNetworkAttributesWidget(args){
	if (args == null){
		args = new Object();
	}
	this.id = "ExpressionNetworkAttributes_" + Math.random();
	args.columnsCount = 2;
	args.title = "Expression";
	args.tags = ["expression"];
	NetworkAttributesWidget.prototype.constructor.call(this, args);
	
	/** EVENTS **/
	this.applyColors = new Event();
};

ExpressionNetworkAttributesWidget.prototype.getButtons = function (){
	var _this = this;
	

	this.rescaleCheckBox =  Ext.create('Ext.form.field.Checkbox', {
        boxLabel : 'Rescale',
        padding:'0 0 5 5',
        disabled:true,
        listeners: {
		       scope: this,
		       change: function(sender, newValue, oldValue){
		       			_this.onDataChanged(_this.attributesPanel.grid.store.getRange());
		       		}
     	}
	});
	
	this.attributesPanel.barInfo.insert(0,this.rescaleCheckBox);
	
	this.attributesPanel.onFileRead.addEventListener(function(){
		_this.rescaleCheckBox.enable();
	});
	
	return [
		    {text:'Apply Colors', handler: function(){_this.applyColors.notify(); _this.panel.close();}},
		    {text:'Close', handler: function(){_this.panel.close();}}];
	
};

ExpressionNetworkAttributesWidget.prototype.onDataChanged = function (data){

	var rescale = this.rescaleCheckBox.getValue();
	this.verticesSelected.notify(this.getFoundVertices());
	this.networkWidget.deselectNodes();
	this.networkWidget.selectVerticesByName(this.getFoundVertices());
	
	var values = new Array();
	var ids = new Array();
	for(var i=0; i< data.length; i++){
		var node = this.graphDataset.getVertexByName(data[i].data["0"]);
		var value = data[i].data["1"];
		if ((node != null)&& (!isNaN(parseFloat(value)))){
			if (rescale){
				if (parseFloat(value) < 0){
					value = Math.log(Math.abs(value))/Math.log(2)* -1;
				}
				else{
					value = Math.log(Math.abs(value))/Math.log(2);
				}
				values.push(value);
			}
			else{
				values.push(value);
			}
			ids.push(data[i].data["0"]);
		}
	}

//	console.log(values);
	
	
	var normalized = Normalizer.normalizeArray(values);
	
//	console.log(normalized);
	
	var colors = [];
	for ( var i = 0; i < normalized.length; i++) {
		if (!isNaN(parseFloat(values[i]))){
			colors.push( Colors.getColorByScoreValue(normalized[i]).HexString());
		}
		else{
			colors.push( "#000000");
		}
	}
	
	for ( var vertexId in ids) {
		var vertices = this.dataset.getVertexByName(ids[vertexId]);
		for ( var i = 0; i < vertices.length; i++) {
			this.formatter.getVertexById(vertices[i].getId()).getDefault().setFill(colors[vertexId]);
		}
		
	}
	
};
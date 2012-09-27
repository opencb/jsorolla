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

NetworkAttributesWidget.prototype.render = AttributesWidget.prototype.render;
NetworkAttributesWidget.prototype.getButtons = AttributesWidget.prototype.getButtons;

function NetworkAttributesWidget(args){
	if(args == null){
		var args={};
	};
	var height = args.height*0.5;
	var width = args.width*0.5;
	args.borderCls="";
	args.tags = ["sif|json"];
//	AttributesWidget.prototype.constructor.call(this, {height:675, width:800, title:args.title});
	AttributesWidget.prototype.constructor.call(this, {height:height+325+75, width:width+24, title:args.title});
//	this.width=800;
//	this.height=675;
	this.networkHeigth = height;
	this.networkWidth = width;
	this.networkPanelId = "NetworkAttributesWidget_" + Math.ceil(Math.random()*1000);
};



NetworkAttributesWidget.prototype.getNetworkPanelId = function (){
	return this.networkPanelId;
};

NetworkAttributesWidget.prototype.getDetailPanel = function (){
//	return   Ext.create('Ext.panel.Panel', {
//		height:285,
////		maxHeight:350,
//		border:0,
////		bodyPadding: 15,
//		padding:'0 0 0 0',
//		html:'<div id="' + this.getNetworkPanelId() +'" ><div>'
//	});
	
	return Ext.create('Ext.container.Container', {
		padding:5,
		flex:1,
		height:this.networkHeigth,
		style:"background: #eee;",
		cls:'x-unselectable',
		html:'<div id="' + this.getNetworkPanelId() +'" style="border:1px solid #bbb;" ><div>'
	});
	
};

NetworkAttributesWidget.prototype.drawNetwork = function (targetId, dataset, formatter, layout){
	this.dataset =	dataset.clone();

	this.formatter = new NetworkDataSetFormatter({width:400, height:200});
	this.formatter.loadFromJSON(this.dataset, formatter.toJSON());
	
	var vertices = this.dataset.getVertices();
	for ( var vertex in vertices) {
		var size = this.formatter.getVertexById(vertex).getDefault().getSize();
		this.formatter.getVertexById(vertex).getDefault().setSize(size*0.3);
	}
	
	var edges = this.dataset.getEdges();
	for ( var edge in edges) {
		var size = this.formatter.getEdgeById(edge).getDefault().getStrokeWidth();
		this.formatter.getEdgeById(edge).getDefault().setStrokeWidth(size*0.3);
	}
	
	var dsLayout = new LayoutDataset();
	dsLayout.loadFromJSON(this.dataset, layout.toJSON());
	
	this.networkWidget = new NetworkWidget(null, {targetId: targetId, label:false});
	this.networkWidget.draw(this.dataset, this.formatter, dsLayout);
	this.networkWidget.getFormatter().resize(this.networkWidth, this.networkHeigth);
};

NetworkAttributesWidget.prototype.draw = function (graphDataset, formatter, layout){
	var _this=this;
	this.render();
	
	/** Data for search in attributes **/
	this.attributes = new Object();
	
	/** Events **/
	this.verticesSelected = new Event(this);

	this.graphDataset = graphDataset;
	
	this.found = Ext.create('Ext.button.Button', {
		 text: 'Nodes found',
		 hidden:true,
		 listeners: {
		 	scope: this,
		 	click: function(){
		 		new InputListWidget({title:"Features found", headerInfo:"This nodes were found in the Graph"}).draw(this.foundNodes.join('\n'));
			}
	    }
	});
	this.notFound = Ext.create('Ext.button.Button', {
		 text: 'nodes not found',
		 hidden:true,
		 listeners: {
		 	scope: this,
		 	click: function(){
		 		new InputListWidget({title:"Features not found", headerInfo:"This nodes were not found in the grpah"}).draw(this.notFoundNodes.join('\n'));
			}
	    }
	});
	
	this.attributesPanel.barInfo.insert(2, this.notFound);
	this.attributesPanel.barInfo.insert(2, this.found);
	
	this.attributesPanel.onDataChange.addEventListener(function (sender, data){
		_this.dataChanged(data);
	});	
	
	
	this.drawNetwork(this.getNetworkPanelId(), graphDataset, formatter, layout);
};

NetworkAttributesWidget.prototype.getVertexAttributesByName = function (name){
	var attributes = this.attributesPanel.getData();
	var results = new Array();
	if(attributes != null){
		for ( var i = 0; i < attributes.length; i++) {
			if (attributes[i][0] == name){
				results.push(attributes[i]);
			}
		}
		return results;
	}
	else{
		return name;
	}
};


NetworkAttributesWidget.prototype.dataChanged = function (data){
	this.foundNodes=[];
	this.notFoundNodes=[];
	for(var i=0; i< data.length; i++){
		var node = this.graphDataset.getVertexByName(data[i].data["0"]);
		if(node==null){
			this.notFoundNodes.push(data[i].data["0"]);
		}else{
			this.foundNodes.push(data[i].data["0"]);
		}
	}
	this.found.setText('<span class="dis">' + this.foundNodes.length + ' results found </span> ');
	this.found.show();
	if (this.notFoundNodes.length > 0){
		this.notFound.setText('<span class="err">'  + this.notFoundNodes.length +' features not found</span>');
		this.notFound.show();
	}
	
	this.onDataChanged(data);
	
};

NetworkAttributesWidget.prototype.onDataChanged = function (data){
	this.verticesSelected.notify(this.getFoundVertices());
	this.networkWidget.deselectNodes();
	this.networkWidget.selectVerticesByName(this.getFoundVertices());
};

NetworkAttributesWidget.prototype.getFoundVertices = function (){
	return this.foundNodes;
};

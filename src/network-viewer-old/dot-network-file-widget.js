/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
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

DOTNetworkFileWidget.prototype.draw = NetworkFileWidget.prototype.draw;

function DOTNetworkFileWidget(args){
	if(args == null) {
		var args={};
	}
	else {
		this.networkData = args.networkData;
	}
	args.title='Import a Network DOT file';
	NetworkFileWidget.prototype.constructor.call(this, args);
};


DOTNetworkFileWidget.prototype.getFileUpload = function(){
	var _this = this;
	this.fileUpload = Ext.create('Ext.form.field.File', {
		msgTarget: 'side',
		allowBlank: false,
		emptyText: 'DOT network file',
		flex:1,
		buttonText: 'Browse local',
		listeners: {
			change: function(){
				_this.panel.setLoading(true);
				var file = document.getElementById(_this.fileUpload.fileInputEl.id).files[0];				
				var dotDataAdapter = new DOTDataAdapter(new FileDataSource(file), {"networkData":_this.networkData});
				dotDataAdapter.onLoad.addEventListener(function(sender,data){
					try{
						_this.content = dotDataAdapter.getNetworkData(); //para el onOK.notify event
						
						var numNodes = _this.content.metaInfo.numNodes;
						var numEdges = _this.content.metaInfo.numEdges;
						
						var edges = _this.content.edges;
						for (var id in edges) {
							var link = "--";
							if(_this.content.edges[id].type = "directed") link = "->";
							_this.gridStore.loadData([[_this.content.edges[id].source, link, _this.content.edges[id].target]], true);
						}
						
						_this.infoLabel.setText('<span class="ok">File loaded sucessfully</span>',false);
						_this.countLabel.setText('nodes:<span class="info">'+numNodes+'</span> edges:<span class="info">'+numEdges+'</span>',false);
					
					}catch(e) {
						_this.infoLabel.setText('<span class="err">File not valid </span>'+e,false);
					};
					_this.panel.setLoading(false);
				});
			}
		}
	});
	
	return this.fileUpload;
};

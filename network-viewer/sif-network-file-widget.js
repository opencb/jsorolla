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

SIFNetworkFileWidget.prototype.draw = NetworkFileWidget.prototype.draw;

function SIFNetworkFileWidget(args){
	if(args == null){
		var args={};
	}
	else {
		this.networkData = args.networkData;
	}
	
	args.title='Import a Network SIF file';
	NetworkFileWidget.prototype.constructor.call(this, args);
};


SIFNetworkFileWidget.prototype.getFileUpload = function(){
	var _this = this;
	this.fileUpload = Ext.create('Ext.form.field.File', {
		msgTarget: 'side',
		allowBlank: false,
		emptyText:'SIF network file',
		flex:1,
		buttonText: 'Browse local',
		listeners: {
			change: function(){
				var file = document.getElementById(_this.fileUpload.fileInputEl.id).files[0];				
				var sifDataAdapter = new SIFDataAdapter(new FileDataSource(file), {"networkData":_this.networkData});
				sifDataAdapter.onLoad.addEventListener(function(sender,data){
					_this.content = sifDataAdapter.getNetworkData(); //para el onOK.notify event
				});
				
//				var sifdataadapter = new InteractomeSIFFileDataAdapter();
//				var file = document.getElementById(_this.fileUpload.fileInputEl.id).files[0];				
//				sifdataadapter.loadFromFile(file);
//				sifdataadapter.onRead.addEventListener(function (sender, id){
//					try{
//						
//						_this.content = sender; //para el onOK.notify event
//
//						var vertices = sender.dataset.getVerticesCount();
//						var edges = sender.dataset.getEdgesCount();
//
//						var sif = new SIFFileDataAdapter().toSIF(sender.dataset);
//						var tabularFileDataAdapter = new TabularFileDataAdapter();
//						tabularFileDataAdapter.parse(sif);
//						_this.gridStore.loadData(tabularFileDataAdapter.getLines());
//
//						_this.infoLabel.setText('<span class="ok">File loaded sucessfully</span>',false);
//						_this.countLabel.setText('vertices:<span class="info">'+vertices+'</span> edges:<span class="info">'+edges+'</span>',false);
//
//					}catch(e){
//						_this.infoLabel.setText('<span class="err">File not valid </span>'+e,false);
//					};
//
//				}); 

			}
		}
	});
	
	return this.fileUpload;
};

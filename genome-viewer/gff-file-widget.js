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

GFFFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
GFFFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
GFFFileWidget.prototype.draw = FileWidget.prototype.draw;
GFFFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
GFFFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;
GFFFileWidget.prototype.getChartItems = FileWidget.prototype.getChartItems;
GFFFileWidget.prototype._loadChartInfo = FileWidget.prototype._loadChartInfo;

function GFFFileWidget(args){
	if (args == null){
		args = new Object();
	}
	this.version = "2";
    if (args.version!= null){
    	this.version = args.version;       
    }
	args.title = "GFF"+this.version;
	args.tags = ["gff"];
	FileWidget.prototype.constructor.call(this, args);
};



GFFFileWidget.prototype.loadFileFromLocal = function(file){
	var _this = this;
	this.file = file;
	
	switch(this.version){
	case "2":
		this.adapter = new GFF2DataAdapter(new FileDataSource(file),{species:this.viewer.species});
		break;
	case "3":
		this.adapter = new GFF3DataAdapter(new FileDataSource(file),{species:this.viewer.species});
		break;
	default :
		this.adapter = new GFF2DataAdapter(new FileDataSource(file),{species:this.viewer.species});
		break;
	}
	
	this.adapter.onLoad.addEventListener(function(sender){
		_this._loadChartInfo();
	});
	_this.btnOk.enable();
};


GFFFileWidget.prototype.loadFileFromServer = function(data){
	this.file = {name:data.filename};
	switch(this.version){
	case "2":
		this.adapter = new GFF2DataAdapter(new StringDataSource(data.data),{async:false,species:this.viewer.species});
		break;
	case "3":
		this.adapter = new GFF3DataAdapter(new StringDataSource(data.data),{async:false,species:this.viewer.species});
		break;
	default :
		this.adapter = new GFF2DataAdapter(new StringDataSource(data.data),{async:false,species:this.viewer.species});
		break;
	}
	
	this._loadChartInfo();
	this.btnOk.enable();
};

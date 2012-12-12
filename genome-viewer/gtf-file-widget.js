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

GTFFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
GTFFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
GTFFileWidget.prototype.draw = FileWidget.prototype.draw;
GTFFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
GTFFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;
GTFFileWidget.prototype.getChartItems = FileWidget.prototype.getChartItems;
GTFFileWidget.prototype._loadChartInfo = FileWidget.prototype._loadChartInfo;

function GTFFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "GTF";
	args.tags = ["gtf"];
	FileWidget.prototype.constructor.call(this, args);
	
};

GTFFileWidget.prototype.loadFileFromLocal = function(file){
	var _this = this;
	this.file = file;
	this.adapter = new GTFDataAdapter(new FileDataSource(file),{species:this.viewer.species});
	this.adapter.onLoad.addEventListener(function(sender){
		console.log(_this.adapter.featuresByChromosome);
		_this._loadChartInfo();
	});
	_this.btnOk.enable();
};


GTFFileWidget.prototype.loadFileFromServer = function(data){
	this.file = {name:data.filename};
	this.adapter = new GTFDataAdapter(new StringDataSource(data.data),{async:false,species:this.viewer.species});
	this._loadChartInfo();
	this.btnOk.enable();
};


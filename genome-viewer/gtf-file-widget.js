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
		_this.btnOk.enable();
	});
};


GTFFileWidget.prototype.loadFileFromServer = function(data){
	this.file = {name:data.filename};
	this.adapter = new GTFDataAdapter(new StringDataSource(data.data),{async:false,species:this.viewer.species});
	this._loadChartInfo();
	this.btnOk.enable();
};


TestBEDFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
TestBEDFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
TestBEDFileWidget.prototype.draw = FileWidget.prototype.draw;
TestBEDFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
TestBEDFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;

function TestBEDFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "BED";
	args.tags = ["bed"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
    this.chartWidgetQuality = new ChartWidget({height:300});
    
    this.onComplete = new Event();
};

TestBEDFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"])];
};


TestBEDFileWidget.prototype.loadFileFromLocal = function(file){
	var _this = this;
	this.file = file;
	this.adapter = new BEDDataAdapter(new FileDataSource(file));
	this.adapter.onLoad.addEventListener(function(sender){
		_this.onComplete.notify(file);
		_this.btnOk.enable();
	});
};
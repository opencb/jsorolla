TestVCFFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
TestVCFFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
TestVCFFileWidget.prototype.draw = FileWidget.prototype.draw;
TestVCFFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
TestVCFFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;

function TestVCFFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "VCF";
	args.tags = ["vcf"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
    this.chartWidgetQuality = new ChartWidget({height:300});
    
    this.onComplete = new Event();
};

TestVCFFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"]),
	        this.chartWidgetQuality.getChart(["features","quality"])];
};



TestVCFFileWidget.prototype.loadFileFromLocal = function(file){
	var _this = this;
	this.file = file;
	this.adapter = new VCFDataAdapter(new FileDataSource(file));
	this.adapter.onLoad.addEventListener(function(sender){
		_this.onComplete.notify(file);
		_this.btnOk.enable();
	});
};

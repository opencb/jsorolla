TestGFFFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
TestGFFFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
TestGFFFileWidget.prototype.draw = FileWidget.prototype.draw;
TestGFFFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
TestGFFFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;

function TestGFFFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "GFF";
	args.tags = ["gff"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
    this.chartWidgetQuality = new ChartWidget({height:300});
};

TestGFFFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"])];
};


TestGFFFileWidget.prototype.loadFileFromLocal = function(file){
	console.log(file);
	var _this = this;

	var gffAdapter = new GFFDataAdapter(new FileDataSource());
	
	gffAdapter.completed.addEventListener(function(sender, data){
		console.log(data);
	});
	
	gffAdapter.getData(file);
};
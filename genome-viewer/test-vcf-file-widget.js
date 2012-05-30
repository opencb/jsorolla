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
};

TestVCFFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"]),
	        this.chartWidgetQuality.getChart(["features","quality"])];
};



TestVCFFileWidget.prototype.loadFileFromLocal = function(file){
	console.log(file);
	var _this = this;

	var vcfAdapter = new VCFDataAdapter(new FileDataSource());
//	var vcfAdapter = new VCFDataAdapter(new UrlDataSource());
	
	vcfAdapter.completed.addEventListener(function(sender, data){
		console.log(data);
//		_this.trackDataList.addTrack({id:"snp",resource:"snp"});
	});
	
	vcfAdapter.getData(file);
//	vcfAdapter.getData("http://rsanchez/example.vcf");
};

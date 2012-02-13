VCFFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
VCFFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
VCFFileWidget.prototype.draw = FileWidget.prototype.draw;
VCFFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
VCFFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;

function VCFFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "VCF";
	args.tags = ["vcf"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
    this.chartWidgetQuality = new ChartWidget({height:300});
};

VCFFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"]),
	        this.chartWidgetQuality.getChart(["features","quality"])];
};



VCFFileWidget.prototype.loadFileFromLocal = function(file){
	var vcfAdapter = new VCFFileDataAdapter();
	this._fileLoad(vcfAdapter);
	vcfAdapter.loadFromFile(file);
};

VCFFileWidget.prototype._fileLoad = function(vcfAdapter){
	var _this = this;
	vcfAdapter.onRead.addEventListener(function(sender, id) {
		_this.dataAdapter = new VCFLocalRegionDataAdapter();
		_this.dataAdapter.loadFromFileDataAdapter(sender);
		
		var datastore = new Array();
	 	for ( var chromosome in _this.dataAdapter.featuresByChromosome) {
			datastore.push({ features: _this.dataAdapter.featuresByChromosome[chromosome].length, chromosome: chromosome });
		}
		
		var qualityStore = new Array();
		for ( var range in _this.dataAdapter.qualitycontrol) {
		
			qualityStore.push({features: _this.dataAdapter.qualitycontrol[range],  quality:range });
		}
		
	 	_this.chartWidgetByChromosome.getStore().loadData(datastore);
	 	_this.chartWidgetQuality.getStore().loadData(qualityStore);
	 	
	 	
	 	_this.panel.setLoading(false);
	 	_this.featureCountLabel.setText("Features count: " + _this.dataAdapter.features.length, false);
	 	_this.btnOk.enable();
	});
};

VCFFileWidget.prototype.loadFileFromServer = function(data){
	var vcfAdapter = new VCFFileDataAdapter();
	this._fileLoad(vcfAdapter);
	vcfAdapter.loadFromContent(data.data);
};
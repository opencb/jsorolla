GFFFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
GFFFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
GFFFileWidget.prototype.draw = FileWidget.prototype.draw;
GFFFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
GFFFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;

function GFFFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "GFF";
	args.tags = ["gff"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
};

GFFFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"])];
};

GFFFileWidget.prototype.loadFileFromLocal = function(file){
	var gffAdapter = new GFFFileDataAdapter();
	this._fileLoad(gffAdapter);
	gffAdapter.loadFromFile(file);
};

GFFFileWidget.prototype._fileLoad = function(gffAdapter){
	var _this = this;
	gffAdapter.onRead.addEventListener(function(sender, id) {
		_this.dataAdapter = new GFFLocalRegionDataAdapter();
		_this.dataAdapter.loadFromFileDataAdapter(sender);
		
		var datastore = new Array();
	 	for ( var chromosome in _this.dataAdapter.featuresByChromosome) {
			datastore.push({ features: _this.dataAdapter.featuresByChromosome[chromosome].length, chromosome: chromosome });
		}
		
	 	_this.chartWidgetByChromosome.getStore().loadData(datastore);
	 	_this.panel.setLoading(false);
	 	_this.featureCountLabel.setText("Features count: " + _this.dataAdapter.features.length, false);
	 	_this.btnOk.enable();
	});
};

GFFFileWidget.prototype.loadFileFromServer = function(data){
	var gffAdapter = new GFFFileDataAdapter();
	this._fileLoad(gffAdapter);
	gffAdapter.loadFromContent(data.data);
};
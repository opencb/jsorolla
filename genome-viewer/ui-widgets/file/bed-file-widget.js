BEDFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
BEDFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
BEDFileWidget.prototype.draw = FileWidget.prototype.draw;
BEDFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
BEDFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;;

function BEDFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "BED";
	args.tags = ["bed"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
};

BEDFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"])];
};

BEDFileWidget.prototype.loadFileFromLocal = function(file){
	var bedAdapter = new BEDFileDataAdapter();
	this._fileLoad(bedAdapter);
	bedAdapter.loadFromFile(file);
};

BEDFileWidget.prototype._fileLoad = function(bedAdapter){
	var _this = this;
	bedAdapter.onRead.addEventListener(function(sender, id) {
		_this.dataAdapter = new BEDLocalRegionDataAdapter();
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

BEDFileWidget.prototype.loadFileFromServer = function(data){
	var bedAdapter = new BEDFileDataAdapter();
	this._fileLoad(bedAdapter);
	bedAdapter.loadFromContent(data.data);
};

LocalRegionDataAdapter.prototype.toJSON = DataAdapter.prototype.toJSON;


function LocalRegionDataAdapter(args){
	DataAdapter.prototype.constructor.call(this);
	
	/** DataSet hashMaps **/
	this.datasets = new Object();
	this.autoFill = true;
	
	if (args != null){
		if (args.autoFill != null){
			this.autoFill = args.autoFill;
		}
		
	}
	this.features = new Array();
	this.dataset = new DataSet();
	this.resource = "bed";
	
	/** Optimizadores **/
	this.featuresByChromosome = new Object();
	
	/** Flag loaded from features **/
	this.loadedFromFeatures = false;
	
	/** Events **/
	this.preloadSuccess = new Event(this);
	this.successed = new Event();
};

LocalRegionDataAdapter.prototype.loadFromFeatures = function(features){
	
	for ( var i = 0; i < features.length; i++) {
		var feature = features[i];
		if ((feature.chromosome != null)&&(feature.start != null)&&(feature.end != null)){
			var chromosome = feature.chromosome;
			var formatter = new GenericFeatureFormatter(features[i]);
			this.features.push(chromosome);
			if (this.featuresByChromosome[chromosome] == null){
				this.featuresByChromosome[chromosome] = new Array();
			}
			this.featuresByChromosome[chromosome].push(formatter);
		}
	}
	this.loadedFromFeatures = true;
};

LocalRegionDataAdapter.prototype._getHashMapKey = function(chromosome, start, end){
	return chromosome + "-" + start + "-" + end;
};

LocalRegionDataAdapter.prototype.isRegionAvalaible = function(chromosome, start, end){
	return this.datasets[this._getHashMapKey(chromosome, start, end)] != null;
};

LocalRegionDataAdapter.prototype.fill = function(chromosome, start, end, callbackFunction){
	var _this = this;
	if ((chromosome == null)|| (start == null) || (end == null)){
		throw "Missing value in a not optional parameter: chromosome, start or end";
	}
	else{
		if (!this.isRegionAvalaible(chromosome, start, end)){
				
				var retrieved = new Array();
				var data = new Array();
			
				if(this.featuresByChromosome[chromosome] != null){
					for ( var i = 0; i < this.featuresByChromosome[chromosome].length; i++) {
						if ((this.featuresByChromosome[chromosome][i].start <  parseFloat(end))&&(this.featuresByChromosome[chromosome][i].end > parseFloat(start))){
							data.push(this.featuresByChromosome[chromosome][i]);
						}
					}
				}
				
					if (this.loadedFromFeatures){ 
						retrieved = data;
					}
					else{
						retrieved[0] = data;
					}
					
					if (!_this.lockSuccessEventNotify){
						_this.getFinished(retrieved, chromosome, start, end);
					}
					else{
						_this.anticipateRegionRetrieved(retrieved, chromosome, start, end);
					}
		}else{
				this.lockSuccessEventNotify = false;
		}
	}
	
};

LocalRegionDataAdapter.prototype.getFinished = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
	this.successed.notify();
};

LocalRegionDataAdapter.prototype.anticipateRegionRetrieved = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = data;
	this.lockSuccessEventNotify = false;
	this.preloadSuccess.notify();
};


LocalRegionDataAdapter.prototype.setIntervalView = function(chromosome,  middleView){
	if (this.autoFill && !this.lockSuccessEventNotify){
		for ( var iterable_element in this.datasets) {
			var id = (iterable_element.split("-"));
			var chromosome = id[0];
			var start = id[1];
			var end = id[2];
			
			if ((start < middleView) && (middleView < end)){
				var tier = (end - start)/3;
				
				if (end - middleView <= tier){
					this.lockSuccessEventNotify = true;
					var newEnd = parseInt(end) + parseInt(end -start);
					this.fill(chromosome, end, newEnd , this.resource);
					return;
				}
				
				if(middleView - start <= tier){
					this.lockSuccessEventNotify = true;
					var newstart = parseInt(start) - parseInt(end -start);
					this.fill(chromosome, newstart, start, this.resource);
					return;
					
				}
				
			}
			
			
		}
	}
};




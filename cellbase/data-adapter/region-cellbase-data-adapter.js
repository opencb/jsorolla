RegionCellBaseDataAdapter.prototype.setVersion = CellBaseDataAdapter.prototype.setVersion;
RegionCellBaseDataAdapter.prototype.setSpecies = CellBaseDataAdapter.prototype.setSpecies;
RegionCellBaseDataAdapter.prototype.toJSON = CellBaseDataAdapter.prototype.toJSON;

function RegionCellBaseDataAdapter(species, args){
	CellBaseDataAdapter.prototype.constructor.call(this, species);
	this.dataset = new FeatureDataSet();
	this.category = "genomic";
	this.subcategory = "region";
	this.resource = null;
	this.lockSuccessEventNotify = false;
	
	this.checkDuplicates = false;
	/** DataSet hashMaps **/
	this.datasets = new Object();
	this.autoFill = true;
	
	if (args != null){
		if (args.autoFill != null){
			this.autoFill = args.autoFill;
		}
		
//		if (args.checkDuplicates != null){
//			this.checkDuplicates = args.checkDuplicates;
//		}
		
		if (args.resource != null){
			this.resource = args.resource;
		}
	}
	this.preloadSuccess = new Event(this);
};

RegionCellBaseDataAdapter.prototype._getHashMapKey = function(chromosome, start, end){
	return chromosome + "-" + start + "-" + end;
//	return start;
};

RegionCellBaseDataAdapter.prototype.isRegionAvalaible = function(chromosome, start, end){
	return this.datasets[this._getHashMapKey(chromosome, start, end)] != null;
};

RegionCellBaseDataAdapter.prototype.fill = function(chromosome, start, end, resource, callbackFunction){
	var _this = this;
	this.resource = resource;
	if ((chromosome == null)|| (start == null) || (end == null)){
		throw "Missing value in a not optional parameter: chromosome, start or end";
	}
		if (!this.isRegionAvalaible(chromosome, start, end)){
//				console.log("Recovering " + resource+"  from server: " + chromosome + ":" + start + "-" + end);
				this.cellBaseManager.successed = new Event(this);
				this.cellBaseManager.successed.addEventListener(function (evt, data){
					if (!_this.lockSuccessEventNotify){
						_this.getFinished(data, chromosome, start, end);
					}
					else{
						_this.anticipateRegionRetrieved(data, chromosome, start, end);
					}
				});
				this.cellBaseManager.get(this.category, this.subcategory, chromosome + ":" + Math.ceil(start) + "-" + Math.ceil(end), resource);
		}else{
//				console.log("No need to go to the server: " + chromosome + ":" + start + "-" + end);
				this.lockSuccessEventNotify = false;
//				return this.datasets[this._getHashMapKey(chromosome, start, end)];
		}
};

RegionCellBaseDataAdapter.prototype.getFinished = function(data, chromosome, start, end){
//	debugger
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
	this.successed.notify();
};

RegionCellBaseDataAdapter.prototype.anticipateRegionRetrieved = function(data, chromosome, start, end){
	
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = data;
	this.lockSuccessEventNotify = false;
	this.preloadSuccess.notify();
};


RegionCellBaseDataAdapter.prototype.getFeaturesByPosition = function(position){
	var features =  new Array();
	var featuresKey = new Object();
	for (var dataset in this.datasets){
		var features = this.datasets[dataset].toJSON();
		for ( var g = 0; g < features.length; g++) {
			var feature = features[g];
			
			if ((feature.start <= position)&&(feature.end >= position)&&(featuresKey[feature.id]==null)){
				features.push(feature);
				featuresKey[feature.id] = true;
			}
		}
	}
	console.log(features.length);
	return features;
};


RegionCellBaseDataAdapter.prototype.setIntervalView = function(chromosome,  middleView){
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
					if (newstart < 0){ newstart = 1;}
					this.fill(chromosome, newstart, start, this.resource);
					return;
					
				}
				
			}
			
			
		}
	}
};




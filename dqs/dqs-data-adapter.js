DqsDataAdapter.prototype.toJSON = DataAdapter.prototype.toJSON;


function DqsDataAdapter(args){
	DataAdapter.prototype.constructor.call(this);
	this.dqsManager = null;
	
	this.dataset = new FeatureDataSet();
	
	this.resource = null;
	this.autoFill = true;
	if (args != null){
		if (args.autoFill != null){
			this.autoFill = args.autoFill;
		}
		if (args.resource != null){
			this.resource = args.resource;
		}
	}
	
	this.preloadSuccess = new Event(this);
	this.successed = new Event();
	
	
	/** DataSet hashMaps **/
	this.datasets = new Object();
	
	this.lockSuccessEventNotify = false;
	
	this.chunkSize = 1000;
};

DqsDataAdapter.prototype._getHashMapKey = function(chromosome, start, end){
	return chromosome + "-" + start + "-" + end;
};
DqsDataAdapter.prototype.isRegionAvalaible = function(chromosome, start, end){
	return this.datasets[this._getHashMapKey(chromosome, start, end)] != null;
};

DqsDataAdapter.prototype.fill = function(chromosome, start, end, resource, callbackFunction){
	var _this = this;
	this.resource = resource;
	if (chromosome == null|| start == null || end == null || resource == null){
		throw "Missing value in a not optional parameter: chromosome, start or end";
	}
		if (!this.isRegionAvalaible(chromosome, start, end)){
				this.dqsManager = new DqsManager();
				this.dqsManager.onBamRegion.addEventListener(function (evt, data){
					if (!_this.lockSuccessEventNotify){
						_this.getFinished(data, chromosome, start, end);
					}
					else{
						_this.anticipateRegionRetrieved(data, chromosome, start, end);
					}
				});
				this.dqsManager.bamRegion(resource, chromosome + ":" + Math.ceil(start) + "-" + Math.ceil(end));
		}else{
//				console.log("No need to go to the server: " + chromosome + ":" + start + "-" + end);
				this.lockSuccessEventNotify = false;
//				return this.datasets[this._getHashMapKey(chromosome, start, end)];
		}
};


DqsDataAdapter.prototype.getFinished = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
//	this.datasets[this._getHashMapKey(chromosome, start, end)] = true;
	da=this.datasets;
	this.successed.notify(data);
};

DqsDataAdapter.prototype.anticipateRegionRetrieved = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = data;
//	this.datasets[this._getHashMapKey(chromosome, start, end)] = true;
	this.lockSuccessEventNotify = false;
	this.preloadSuccess.notify();
};



DqsDataAdapter.prototype.getFeaturesByPosition = function(position){
	var features =  new Array();
	var featuresKey = new Object();
	console.log(this.datasets);
	for (var dataset in this.datasets){
		features = this.datasets[dataset].toJSON();
		for ( var g = 0; g < features.length; g++) {
			var feature = features[g];
			
			if ((feature.start <= position)&&(feature.end >= position)&&(featuresKey[feature.id]==null)){
				features.push(feature);
				featuresKey[feature.id] = true;
			}
		}
	}
//	console.log(features.length);
	return features;
};


DqsDataAdapter.prototype.setIntervalView = function(chromosome,  middleView, obj){
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

//DqsDataAdapter.prototype.arrayToString = function(array, separator){
//	var str = new StringBuffer();
//	for(var i = 0; i < array.length; i++){
//		if(i != array.length-1)
//			str.append(array[i]+separator);
//		else
//			str.append(array[i]);
//	}
//	return str.toString();
//};

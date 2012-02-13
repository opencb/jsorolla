RuleRegionDataAdapter.prototype.toJSON = DataAdapter.prototype.toJSON;

function RuleRegionDataAdapter(args){
	DataAdapter.prototype.constructor.call(this);
	this.resource = "rule";
	this.lockSuccessEventNotify = false;
	
	/** DataSet hashMaps **/
	this.datasets = new Object();
	this.autoFill = true;
	
	/** Parametros compartidos con el track **/
	this.pixelRatio = 0.000005;
	this.space = 100;
	this.maxChromosomeSize = 260000000;
	
	if (args != null){
		if (args.autoFill != null){
			this.autoFill = args.autoFill;
		}
		if (args.pixelRatio != null){
			this.pixelRatio = args.pixelRatio;
		}
		
	}
	
	this.dataset = new DataSet();
	this.resource = "rule";
	this.ratio = this.space / this.pixelRatio; 
	
	/** Events **/
	this.preloadSuccess = new Event(this);
	this.successed = new Event();
	
	this.preloadSuccess = new Event(this);
};

RuleRegionDataAdapter.prototype._getHashMapKey = function(chromosome, start, end){
	return chromosome + "-" + start + "-" + end;
};


RuleRegionDataAdapter.prototype.isRegionAvalaible = function(chromosome, start, end){
	return this.datasets[this._getHashMapKey(chromosome, start, end)] != null;
};

RuleRegionDataAdapter.prototype._getFeaturesFromRegion = function(start, end){
	var features = new Array();

	for (var i = start ; i < end ; i = parseFloat(i) + parseFloat(this.ratio) ){
			if ((i >=0)&&(i<this.maxChromosomeSize)){
			
				
				for ( var j = 2; j < 9; j = j + 2) {
					var start = parseFloat(i) + parseFloat(j* this.ratio/10);
					features.push({"start":  start, "end": i + start, "label":false});
				}
				if (Math.ceil(this.pixelRatio) == 1){
					i = Math.ceil(i/1000) * 1000;
				}
				features.push({"start":  i, "end": i, "label":true});
				
			}
	}
	return features;
};


RuleRegionDataAdapter.prototype.fill = function(chromosome, start, end, resource, callbackFunction){
	var _this = this;
	this.resource = resource;
	if ((chromosome == null)|| (start == null) || (end == null)){
		throw "Missing value in a not optional parameter: chromosome, start or end";
	}
	else{
		if (!this.isRegionAvalaible(chromosome, start, end)){
					var result = new Array();
					var data = new Array();
					result = this._getFeaturesFromRegion(start, end);
					data.push(result);
					
					if (!_this.lockSuccessEventNotify){
						_this.getFinished(data, chromosome, start, end);
					}
					else{
						_this.anticipateRegionRetrieved(data, chromosome, start, end);
					}
		}
		else{
			this.lockSuccessEventNotify = false;
			
		}
	}
};

RuleRegionDataAdapter.prototype.getFinished = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
	this.successed.notify();
};

RuleRegionDataAdapter.prototype.anticipateRegionRetrieved = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = data;
	this.lockSuccessEventNotify = false;
	this.preloadSuccess.notify();
};


RuleRegionDataAdapter.prototype.setIntervalView = function(chromosome,  middleView){
	if (this.autoFill && !this.lockSuccessEventNotify){
		for ( var iterable_element in this.datasets) {
			var id = (iterable_element.split("-"));
			var start = id[1];
			var end = id[2];
			
			if ((start < middleView) && (middleView < end)){
				
				var window = end - start;
				var quarter = window/3;
			
				if (( (start -1) < 0 ) || ((parseFloat(end) + 1) > this.maxChromosomeSize ))
				{
					return;
				}

				if ((middleView - start) < quarter){
					this.lockSuccessEventNotify = true;
					var newStart = parseFloat(parseFloat(start) - parseFloat(window));
					this.fill(chromosome, newStart, start , this.resource);
					return;
				}
				
				if ((end - middleView) < quarter){
					this.lockSuccessEventNotify = true;
					var newEnd = parseFloat(parseFloat(end) + parseFloat(window));
					this.fill(chromosome, end, newEnd , this.resource);
					return;
				}
			}
			
		}
	}
};




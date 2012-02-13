GeneRegionCellBaseDataAdapter.prototype.setVersion = RegionCellBaseDataAdapter.prototype.setVersion;
GeneRegionCellBaseDataAdapter.prototype.setSpecies = RegionCellBaseDataAdapter.prototype.setSpecies;
GeneRegionCellBaseDataAdapter.prototype.toJSON = RegionCellBaseDataAdapter.prototype.toJSON;
//GeneRegionCellBaseDataAdapter.prototype.anticipateRegionRetrieved = RegionCellBaseDataAdapter.prototype.anticipateRegionRetrieved;
GeneRegionCellBaseDataAdapter.prototype.setIntervalView = RegionCellBaseDataAdapter.prototype.setIntervalView;
GeneRegionCellBaseDataAdapter.prototype.getFinished = RegionCellBaseDataAdapter.prototype.getFinished;		
GeneRegionCellBaseDataAdapter.prototype._getHashMapKey = RegionCellBaseDataAdapter.prototype._getHashMapKey;
GeneRegionCellBaseDataAdapter.prototype.isRegionAvalaible = RegionCellBaseDataAdapter.prototype.isRegionAvalaible;

function GeneRegionCellBaseDataAdapter(species,args){
//	console.log(species);
	this.species = species;
	this.geneDataAdapter = new CellBaseManager(this.species);
	this.transcriptDataAdapter = null;//new CellBaseManager();
	this.exonDataAdapter = null;//new CellBaseManager();
	this.dataset = new FeatureDataSet();
	
	// 3 nothing retrieved yet and 0 everything retrieved lauch the event
	this.done = 3;
	this.geneData = null;
	
	
	this.obtainTranscripts = true;
	
	/** DataSet hashMaps **/
	this.datasets = new Object();
	this.autoFill = true;
	
	if (args != null){
		if (args.autoFill != null){
			this.autoFill = args.autoFill;
		}
		if (args.obtainTranscripts != null){
			this.obtainTranscripts = args.obtainTranscripts;
		}
	}
	
	this.lockSuccessEventNotify = false;
	this.preloadSuccess = new Event(this);
	this.successed = new Event();
};

GeneRegionCellBaseDataAdapter.prototype.partialRetrieveDone = function(type, data){
	this.done --;
	
	if (type == "transcript"){
		for ( var i = 0; i < this.geneData.length; i++) {
			this.geneData[i].transcript = new Array();
			this.geneData[i].transcript = data[i];
		}
	}

};


GeneRegionCellBaseDataAdapter.prototype.fill = function(chromosome, start, end, callbackFunction){
		var _this = this;
		this.chromosome = chromosome;
		start = Math.ceil(start);
		end = Math.ceil(end);
		this.start = start;
		this.end = end;

		this.geneDataAdapter = new CellBaseManager(this.species);
		
		if (!this.isRegionAvalaible(chromosome, start, end)){
					this.geneDataAdapter.successed = new Event(this);
					this.geneDataAdapter.successed.addEventListener(function (evt, data){
							_this.retrievedGene(data, chromosome, start, end);
					});
			
					this.geneDataAdapter.get("genomic", "region", chromosome + ":" + start + "-" + end, "gene");
			}
			else{
				this.lockSuccessEventNotify = false;
			}
};

GeneRegionCellBaseDataAdapter.prototype.retrieveExonInformation = function(query){
		this.exonDataAdapter = new CellBaseManager(this.species);
		var _this = this;
		
		if (query.length == 0) {
			if (!_this.lockSuccessEventNotify){
				_this.getFinished({}, this.chromosome, this.start, this.end );
			}
			else{
				_this.anticipateRegionRetrieved({},this.chromosome, this.start, this.end );
			}
			return;
		}
		
		this.exonDataAdapter.successed.addEventListener(function (evt, data){
				var index = 0;
				for ( var i = 0; i < _this.transcriptData.length; i++) {
					for ( var j = 0; j < _this.transcriptData[i].length; j++) {
						_this.transcriptData[i][j].exon = data[index];
						index ++;
					}
				}
				for ( var i = 0; i < _this.geneData.length; i++) {
					_this.geneData[i].transcript = _this.transcriptData[i];
				}
				if (!_this.lockSuccessEventNotify){
					_this.getFinished(_this.geneData, _this.chromosome, _this.start, _this.end );
				}
				else{
					_this.anticipateRegionRetrieved(_this.geneData,_this.chromosome, _this.start, _this.end );
				}
		});
		this.exonDataAdapter.get("feature", "transcript", query, "exon");
};

GeneRegionCellBaseDataAdapter.prototype.retrieveTranscriptInformation = function(query){
	this.transcriptDataAdapter = new CellBaseManager(this.species);
	
	var _this = this;
	if (query.length == 0) {
		_this.retrieveExonInformation(query);
		return;
	}
	
	this.transcriptDataAdapter.successed.addEventListener(function (evt, data){
		_this.transcriptData = data[0];
		for ( var i = 0; i < _this.geneData.length; i++) {
			_this.geneData[i].transcript = _this.transcriptData[i];
		}
		
		var query = "";
		var tCount = 0;
		
		for ( var i = 0; i < _this.geneData.length; i++) {
			if (_this.geneData[i].transcript != null){
				for ( var j = 0; j < _this.geneData[i].transcript.length; j++) {
					query = query + "," + _this.transcriptData[i][j].stableId ; 
					tCount ++;
				}
			}
		}
		query = query.substr(1, query.length );
		_this.retrieveExonInformation(query);
	});
	this.transcriptDataAdapter.get("feature", "gene", query, "transcript");
};

GeneRegionCellBaseDataAdapter.prototype.getFinished = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
	this.successed.notify();
};

GeneRegionCellBaseDataAdapter.prototype.anticipateRegionRetrieved = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
	this.lockSuccessEventNotify = false;
	this.preloadSuccess.notify();
};

GeneRegionCellBaseDataAdapter.prototype.getFeaturesByPosition = function(position){
	var features =  new Array();
	var featuresKey = new Object();
	for (var dataset in this.datasets){
		var genes = this.datasets[dataset].toJSON();
		for ( var g = 0; g < genes.length; g++) {
			var gene = genes[g];
			
			if ((gene.start <= position)&&(gene.end >= position)&&(featuresKey[gene.id]==null)){
				features.push(gene);
				featuresKey[gene.id] = true;
				var transcripts = gene.transcript;
				if (transcripts != null){
					for ( var i = 0; i < transcripts.length; i++) {
						var transcript = transcripts[i];
						if ((transcript.start <= position)&&(transcript.end >= position)){
							features.push(transcript);
							var exons = transcript.exon;
							if (exons != null){
								for ( var j = 0; j < exons.length; j++) {
									var exon = exons[j];
									if ((exon.start <= position)&&(exon.end >= position)){
										features.push(exon);
									}
								}
							}
						}
					}
				}
			}
		}
	}
	return features;
};

GeneRegionCellBaseDataAdapter.prototype.retrievedGene = function(data, chromosome, start, end){
	this.geneData = data[0];
	var query = new String();
	for ( var i = 0; i < data[0].length; i++) {
		query = query + "," + data[0][i].stableId ; 
		
	}
	if (this.obtainTranscripts){
			this.retrieveTranscriptInformation(query.substr(1, query.length));
	}else{
		if (!this.lockSuccessEventNotify){
			this.getFinished(data[0], chromosome, start, end);
		}
		else{
			this.anticipateRegionRetrieved(data[0], chromosome, start, end);
		}
	}
};

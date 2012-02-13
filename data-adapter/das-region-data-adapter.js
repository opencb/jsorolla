DasRegionDataAdapter.prototype.toJSON = DataAdapter.prototype.toJSON;


function DasRegionDataAdapter(args){
	DataAdapter.prototype.constructor.call(this);
	

	/** DataSet hashMaps **/
	this.datasets = new Object();
	this.autoFill = true;
	
	if (args != null){
		if (args.autoFill != null){
			this.autoFill = args.autoFill;
		}
		if (args.url != null){
			this.url = args.url;
		}
		
	}
	
	this.features = new Array();
	this.xml = null;
	
	this.dataset = new DataSet();
	this.resource = "das";
	
	
//	/** Optimizadores **/
//	this.featuresByChromosome = new Object();
	
	/** Events **/
	this.preloadSuccess = new Event(this);
	this.successed = new Event();
	this.onError = new Event();
};

//DasRegionDataAdapter.prototype.getLabel = function(line){
//	return  line[2] + " " +line[3] + "/" + line[4] + " Q:" + line[1];
//};
//DasRegionDataAdapter.prototype.loadFromVCFFileDataAdapter = function(fileDataAdapter){
//	
//	for ( var i = 0; i < fileDataAdapter.lines.length; i++) {
//		var feature = {"chromosome": fileDataAdapter.lines[i][0], "start": parseFloat(fileDataAdapter.lines[i][1]), "end": parseFloat(fileDataAdapter.lines[i][1]) + 1, "label": this.getLabel(fileDataAdapter.lines[i])} ;
//		this.features.push(feature);
//		if (this.featuresByChromosome[fileDataAdapter.lines[i][0]] == null){
//			this.featuresByChromosome[fileDataAdapter.lines[i][0]] = new Array();
//		}
//		this.featuresByChromosome[fileDataAdapter.lines[i][0]].push(feature);
//	}
//};

DasRegionDataAdapter.prototype._getHashMapKey = function(chromosome, start, end){
	return chromosome + "-" + start + "-" + end;
};

DasRegionDataAdapter.prototype.isRegionAvalaible = function(chromosome, start, end){
	return this.datasets[this._getHashMapKey(chromosome, start, end)] != null;
};

DasRegionDataAdapter.prototype.fill = function(chromosome, start, end, callbackFunction){
	var _this = this;
	if ((chromosome == null)|| (start == null) || (end == null)){
		throw "Missing value in a not optional parameter: chromosome, start or end";
	}
	else{
		var fullURL = this.url + "?segment=" + chromosome + ":" + start + "," + end; 
		if (!this.isRegionAvalaible(chromosome, start, end)){
			
				$.ajax({
					  url: fullURL,
					  type: 'GET',
					  dataType:"xml",
					  error: function(){
							alert("error");
							_this.onError.notify("It is not allowed by Access-Control-Allow-Origin " );
					  },
					  
					  success: function(data){
						  
						  		try{
								_this.xml =   (new XMLSerializer()).serializeToString(data);
								var xmlStringified =  (new XMLSerializer()).serializeToString(data); //data.childNodes[2].nodeValue;
								var data = xml2json.parser(xmlStringified);
								var result = new Array();
								if (data.dasgff.gff.segment.feature != null){
									for ( var i = 0; i < array.length; i++) {
										data.dasgff.gff.segment.feature[i]["chromosome"] = chromosome;
									}
									result.push(data.dasgff.gff.segment.feature);
								}
								else{
									result.push([]);
								}
					
					
								/** Esto funciona **/
//								console.log("Con jquery");
//								console.log(new Date())
//								var result = new Array();
								//result.push($.xmlToJSON(data).GFF[0].SEGMENT[0].FEATURE);
//								console.log(new Date())
//								console.log(result)
								
								if (!_this.lockSuccessEventNotify){
									_this.getFinished(result, chromosome, start, end);
								}
								else{
									_this.anticipateRegionRetrieved(result, chromosome, start, end);
								}
						  		}
						  		catch(e){
						  			alert("There was a problem parsing the xml: " + e);
						  			console.log(data);
						  			
						  		}
					  }
					});
				
		}else{
				this.lockSuccessEventNotify = false;
				return this.datasets[this._getHashMapKey(chromosome, start, end)];
		}
	}
	
};

DasRegionDataAdapter.prototype.getFinished = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
	this.successed.notify();
};

DasRegionDataAdapter.prototype.anticipateRegionRetrieved = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = data;
	this.lockSuccessEventNotify = false;
	this.preloadSuccess.notify();
};


DasRegionDataAdapter.prototype.setIntervalView = function(chromosome,  middleView){
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




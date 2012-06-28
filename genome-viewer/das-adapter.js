function DasAdapter(args){
	this.gzip = true;
	
	this.proxy = "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v1/utils/proxy?url=";
	
	if (args != null){
		if (args.url != null){
			this.url = args.url;
		}
		if(args.species != null){
			this.species = args.species;
		}
		if(args.featureCache != null){
			var argsFeatureCache = args.featureCache;
		}
		if(args.params != null){
			var params = args.params;
		}
	}
	this.featureCache =  new FeatureCache(argsFeatureCache);
	this.onGetData = new Event();
};

DasAdapter.prototype.getData = function(args){
	console.time("all");
	var _this = this;
	//region check
	if(args.start<1){
		args.start=1;
	}
	if(args.end>300000000){
		args.end=300000000;
	}
	
	var type = "data";
	if(args.histogram){
		type = "histogram"+args.interval;
	}
	
	var firstChunk = this.featureCache._getChunk(args.start);
	var lastChunk = this.featureCache._getChunk(args.end);

	var chunks = [];
	var itemList = [];
	for(var i=firstChunk; i<=lastChunk; i++){
		var key = args.chromosome+":"+i;
		if(this.featureCache.cache[key] == null || this.featureCache.cache[key][type] == null) {
			chunks.push(i);
		}else{
			var items = this.featureCache.getFeaturesByChunk(key, type);
//			console.time("concat");
			itemList = itemList.concat(items);
//			console.timeEnd("concat");
		}
	}
//	//notify all chunks
	if(itemList.length>0){
		this.onGetData.notify({data:itemList,cached:true});
	}
	
	
	//data process
	var updateStart = true;
	var updateEnd = true;
	if(chunks.length > 0){
//		console.log(chunks);
		
		for ( var i = 0; i < chunks.length; i++) {
			var query = null;
			
			if(updateStart){
				var chunkStart = parseInt(chunks[i] * this.featureCache.chunkSize);
				updateStart = false;
			}
			if(updateEnd){
				var chunkEnd = parseInt((chunks[i] * this.featureCache.chunkSize) + this.featureCache.chunkSize-1);
				updateEnd = false;
			}
			
			if(chunks[i+1]!=null){
				if(chunks[i]+1==chunks[i+1]){
					updateEnd =true;
				}else{
					query = args.chromosome+":"+chunkStart+","+chunkEnd;
					updateStart = true;
					updateEnd = true;
				}
			}else{
				query = args.chromosome+":"+chunkStart+","+chunkEnd;
				updateStart = true;
				updateEnd = true;
			}

			if(query){
				var fullURL = this.proxy + this.url + "?segment=" + query;
				console.log("fullURL: "+fullURL);

				$.ajax({
					url: fullURL,
					type: 'GET',
					dataType:"xml",
					error: function(){
						alert("error");
						_this.onError.notify("It is not allowed by Access-Control-Allow-Origin " );
					},

					success: function(data){
						_this.xml =   (new XMLSerializer()).serializeToString(data);
						var xmlStringified =  (new XMLSerializer()).serializeToString(data); //data.childNodes[2].nodeValue;
						var data = xml2json.parser(xmlStringified);
						var result = new Array();

						if (typeof(data.dasgff.gff.segment)  != 'undefined'){
							if (typeof(data.dasgff.gff.segment.feature)  != 'undefined'){	  
								result = data.dasgff.gff.segment.feature;	
							}
							else if (typeof(data.dasgff.gff.segment[0])  != 'undefined'){
								if (data.dasgff.gff.segment[0].feature != null){
									for ( var i = 0; i < data.dasgff.gff.segment.length; i++) {
										for ( var j = 0; j < data.dasgff.gff.segment[i].feature.length; j++) {
											data.dasgff.gff.segment[i].feature[j]["chromosome"] = args.chromosome;
											result.push(data.dasgff.gff.segment[i].feature[j]);
										}
									}
								}
								else{
									result.push([]);
								}
							}
						}
						var region = {chromosome:args.chromosome, start:chunkStart, end:chunkEnd};
						var resource = "das";
						_this.featureCache.putFeaturesByRegion(result, region, resource, type);
						console.log(_this.featureCache.cache);
						var items = _this.featureCache.getFeaturesByRegion(region, type);
						console.log(items);
						_this.onGetData.notify({data:items,cached:false});
					}
				});
			}
		}
	}
};

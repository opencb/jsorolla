function DasAdapter(args){
	this.host = null;
	this.gzip = true;
	
	this.proxy = "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v1/utils/proxy?url=";
	this.params={};
	
	if (args != null){
		if (args.url != null){
			this.url = args.url;
		}
		if(args.host != null){
			this.host = args.host;
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
//	var cellBaseManager = new CellBaseManager(this.species,{host: this.host});

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
	
	
	//CellBase data process
//	cellBaseManager.success.addEventListener(function(sender,data){
//		var type = "data";
//		console.log();
//		if(data.params.histogram){
//			type = "histogram"+data.params.interval;
//		}
//		
//		//XXX quitar cuando este arreglado el ws
//		if(data.params.histogram == true){
//			data.result = [data.result];
//		}
//		//XXX
//		
////		debugger
//		var queryList = [];
//		console.log("query length "+data.query.length);
//		console.log("data length "+data.result.length);
////		console.log("data "+data.result);
//		for(var i = 0; i < data.query.length; i++) {
//			var splitDots = data.query[i].split(":");
//			var splitDash = splitDots[1].split("-");
//			queryList.push({chromosome:splitDots[0],start:splitDash[0],end:splitDash[1]});
//		}
////		console.log(_this.featureCache.cache);
//
//		
//		for(var i = 0; i < data.result.length; i++) {
//			_this.featureCache.putRegion(data.result[i], queryList[i], type);
//			var items = _this.featureCache.getFeaturesByRegion(queryList[i], type);
//			_this.onGetData.notify({data:items,cached:false});
//		}
//	});

	var querys = [];
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
//					querys.push(query);
					updateStart = true;
					updateEnd = true;
				}
			}else{
				query = args.chromosome+":"+chunkStart+","+chunkEnd;
//				querys.push(query);
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
											data.dasgff.gff.segment[i].feature[j]["chromosome"] = chromosome;
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
						_this.featureCache.putFeaturesByRegion(result, region, type);
						console.log(_this.featureCache.cache);
						var items = _this.featureCache.getFeaturesByRegion(region, type);
						console.log(items);
//						_this.onGetData.notify({data:items,cached:false});
					}
				});
			}
		}
//		console.log(querys);
//		this.params["histogram"] = args.histogram;
//		this.params["interval"] = args.interval;
//		this.params["transcript"] = args.transcript;
//		cellBaseManager.get(this.category, this.subCategory, querys, this.resource, this.params);
		
		
	}
};

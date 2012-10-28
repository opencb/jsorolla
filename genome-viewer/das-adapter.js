/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

function DasAdapter(args){
	this.gzip = true;
	
	this.proxy = CELLBASE_HOST+"/latest/utils/proxy?url=";
	
	this.params = {};
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
			this.params = args.params;
		}
	}
	this.featureCache =  new FeatureCache(argsFeatureCache);
	this.onGetData = new Event();
	this.onCheckUrl = new Event();
	this.onError = new Event();
};

DasAdapter.prototype.getData = function(args){
//	console.time("all");
	var _this = this;
	//region check
	
	this.params["histogram"] = args.histogram;
	this.params["interval"] = args.interval;
	this.params["transcript"] = args.transcript;
	
	if(args.start<1){
		args.start=1;
	}
	if(args.end>300000000){
		args.end=300000000;
	}
	
	var dataType = "data";
	if(args.histogram){
		dataType = "histogram"+args.interval;
	}

	this.params["dataType"] = dataType;
	
	var firstChunk = this.featureCache._getChunk(args.start);
	var lastChunk = this.featureCache._getChunk(args.end);

	var chunks = [];
	var itemList = [];
	for(var i=firstChunk; i<=lastChunk; i++){
		var key = args.chromosome+":"+i;
		if(this.featureCache.cache[key] == null || this.featureCache.cache[key][dataType] == null) {
			chunks.push(i);
		}else{
			var item = this.featureCache.getFeatureChunk(key);
//			console.time("concat");
			itemList.push(item);
//			console.timeEnd("concat");
		}
	}
//	//notify all chunks
	if(itemList.length>0){
		this.onGetData.notify({items:itemList, params:this.params, cached:true});
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

						if(data.dasgff != null){//Some times DAS server does not respond
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
							_this.featureCache.putFeaturesByRegion(result, region, resource, dataType);
							console.log(_this.featureCache.cache);
							var items = _this.featureCache.getFeatureChunksByRegion(region);
							if(items != null){
								_this.onGetData.notify({items:items, params:_this.params, cached:false});
							}
						}
					}
				});
			}
		}
	}
};

DasAdapter.prototype.checkUrl = function(){
	var _this = this;
	var fullURL = this.proxy + this.url + "?segment=1:1,1";
	console.log("Checking URL: "+fullURL);

	$.ajax({
		url: fullURL,
		type: 'GET',
		dataType:"xml",
		error: function(){
			alert("error");
			_this.onError.notify("It is not allowed by Access-Control-Allow-Origin " );
		},
		success: function(data){
			_this.xml = (new XMLSerializer()).serializeToString(data);
			_this.onCheckUrl.notify({data:_this.xml});
		}
	});
};

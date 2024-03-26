/*
 * Copyright 2015-2024 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function DasAdapter(args){

    var _this=this;

    _.extend(this, Backbone.Events);

    this.id = Utils.genId('DasAdapter');

	this.gzip = true;
	this.proxy = CELLBASE_HOST+"/latest/utils/proxy?url=";
	this.url;
	this.species;
	this.featureCache;
	this.params = {};

    _.extend(this, args);

    this.on(this.handlers);

	this.featureCache =  new FeatureCache(this.featureCache);
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
		this.trigger('data:ready',{items:itemList, params:this.params, cached:true});
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
						_this.trigger('error',"It is not allowed by Access-Control-Allow-Origin " );
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
								_this.trigger('data:ready',{items:items, params:_this.params, cached:false});
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
			_this.trigger('error',"It is not allowed by Access-Control-Allow-Origin " );
		},
		success: function(data){
			_this.xml = (new XMLSerializer()).serializeToString(data);
			_this.trigger('url:check',{data:_this.xml});
		}
	});
};

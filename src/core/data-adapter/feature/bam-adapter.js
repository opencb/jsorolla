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

function BamAdapter(args){

    _.extend(this, Backbone.Events);

    if(typeof args != 'undefined'){
        this.host = args.host || this.host;
        this.category = args.category || this.category;
		this.resource = args.resource || this.resource;
		this.params = args.params || this.params;
		this.filters = args.filters || this.filters;
		this.options = args.options || this.options;
        this.species = args.species || this.species;
        var argsFeatureCache = args.featureCache || {};
    }
	if (args != null){
		if(args.featureConfig != null){
			if(args.featureConfig.filters != null){
				this.filtersConfig = args.featureConfig.filters;
			}
			if(args.featureConfig.options != null){//apply only check boxes
				this.optionsConfig = args.featureConfig.options;
				for(var i = 0; i < this.optionsConfig.length; i++){
					if(this.optionsConfig[i].checked == true){
						this.options[this.optionsConfig[i].name] = true;
						this.params[this.optionsConfig[i].name] = true;
					}
				}
			}
		}
	}

	this.featureCache = new BamCache(argsFeatureCache);
//	this.onGetData = new Event();
}

BamAdapter.prototype = {
    host : null,
    gzip : true,
    params : {}
};

BamAdapter.prototype.clearData = function(){
	this.featureCache.clear();
};

BamAdapter.prototype.setFilters = function(filters){
	this.clearData();
	this.filters = filters;
	for(filter in filters){
		var value = filters[filter].toString();
		delete this.params[filter];
		if(value != ""){
			this.params[filter] = value;
		}
	}
};
BamAdapter.prototype.setOption = function(opt, value){
	if(opt.fetch){
		this.clearData();
	}
	this.options[opt.name] = value;
	for(option in this.options){
		if(this.options[opt.name] != null){
			this.params[opt.name] = this.options[opt.name];
		}else{
			delete this.params[opt.name];
		}
	}
};


BamAdapter.prototype.getData = function(args){
	var _this = this;
	//region check
	this.params["histogram"] = args.histogram;
	this.params["histogramLogarithm"] = args.histogramLogarithm;
	this.params["histogramMax"] = args.histogramMax;
	this.params["interval"] = args.interval;
	this.params["transcript"] = args.transcript;
	this.params["chromosome"] = args.chromosome;
	this.params["resource"] = this.resource.id;
	this.params["category"] = this.category;
	this.params["species"] = Utils.getSpeciesCode(this.species.text);


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
			itemList.push(item);
		}
	}

    var regionSuccess = function (data) {
		var splitDots = data.query.split(":");
		var splitDash = splitDots[1].split("-");
		var query = {chromosome:splitDots[0],start:splitDash[0],end:splitDash[1]};


		var dataType = "data";
		if(data.params.histogram){
			dataType = "histogram"+data.params.interval;
		    _this.featureCache.putHistogramFeaturesByRegion(data.result, query, data.resource, dataType);
		}else{
		    _this.featureCache.putFeaturesByRegion(data.result, query, data.resource, dataType);
        }

		var items = _this.featureCache.getFeatureChunksByRegion(query, dataType);
		itemList = itemList.concat(items);
		if(itemList.length > 0){
            _this.trigger('data:ready',{items:itemList, params:_this.params, cached:false, sender:_this});
//			_this.onGetData.notify({items:itemList, params:_this.params, cached:false});
		}
	};

	var querys = [];
	var updateStart = true;
	var updateEnd = true;
	if(chunks.length > 0){//chunks needed to retrieve
//		console.log(chunks);

		for ( var i = 0; i < chunks.length; i++) {

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
					var query = args.chromosome+":"+chunkStart+"-"+chunkEnd;
					querys.push(query);
					updateStart = true;
					updateEnd = true;
				}
			}else{
				var query = args.chromosome+":"+chunkStart+"-"+chunkEnd;
				querys.push(query);
				updateStart = true;
				updateEnd = true;
			}
		}
//		console.log(querys);
		for ( var i = 0, li = querys.length; i < li; i++) {
			console.time("dqs");
			//accountId, sessionId, bucketname, objectname, region,
            var cookie = $.cookie("bioinfo_sid");
            cookie = ( cookie != '' && cookie != null ) ?  cookie : 'dummycookie';
            OpencgaManager.region({
                accountId: this.resource.account,
                sessionId: cookie,
                bucketId: this.resource.bucketId,
                objectId: this.resource.oid,
                region: querys[i],
                queryParams: this.params,
                success:regionSuccess
            });
		}
	}else{//no server call
		if(itemList.length > 0){
            _this.trigger('data:ready',{items:itemList, params:this.params, cached:false, sender:this});
//			this.onGetData.notify({items:itemList, params:this.params});
		}
	}
};

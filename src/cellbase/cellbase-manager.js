/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
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

function CellBaseManager(species, args) {
//	console.log(species);
	
	this.host = CELLBASE_HOST;
	this.version = CELLBASE_VERSION;

    //species can be the species code or an object with text attribute
    if(typeof species === 'string'){
	    this.species = species;
    }else if(species != null){
        this.species = Utils.getSpeciesCode(species.text);
    }

	this.category = null;
	this.subcategory = null;

	// commons query params
	this.contentformat = "json";
	this.fileformat = "";
	this.outputcompress = false;
	this.dataType = "script";

	this.query = null;
	this.originalQuery = "";
	this.resource = "";

	this.params = {};
	
	this.async = true;
	
	//Queue of queries
	this.maxQuery = 30;
	this.numberQueries = 0;
	this.results = new Array();
	this.resultsCount = new Array();
	this.batching = false;
	
	
	if (args != null){
		if(args.host != null){
			this.host = args.host;
		}
		if(args.async != null){
			this.async = args.async;
		}
	}
	
	
	
	//Events
	this.completed = new Event();
	this.success = new Event();
	this.batchSuccessed = new Event();
	this.error = new Event();

	this.setVersion = function(version){
		this.version = version;
	},
	
	this.setSpecies = function(specie){
		this.species = specie;
	},
	
	this.getVersion = function(){
		return this.version;
	},
	
	this.getSpecies = function(){
		return this.species;
	},
	
	
	
	/** Cross-domain requests and dataType: "jsonp" requests do not support synchronous operation. 
	 * Note that synchronous requests may temporarily lock the browser, disabling any actions while the request is active. **/
	this.setAsync = function(async){
		this.async = async;
	};

	this.getUrl = function() {
		if (this.query != null) {
			return this.host + "/" + this.version + "/" + this.species + "/"+ this.category + "/" + this.subcategory + "/" + this.query+ "/" + this.resource; // + "?contentformat=" + this.contentformat;
		} else {
			return this.host + "/" + this.version + "/" + this.species + "/"+ this.category + "/" + this.subcategory + "/"+ this.resource; // + "?contentformat=" +;
		}

	};

	this.get = function(category, subcategory, query, resource, params, callbackFunction) {
		if(params!=null){
			this.params = params;
		}
//		if(query instanceof Array){
//				this.originalQuery = query;
//				this.batching = true;
//				this.results= new Array();
//				return this.getMultiple(category, subcategory, query, resource);
//		}else{
//				query = new String(query);
//				query = query.replace(/\s/g, "");
//				var querySplitted = query.split(",");
//				this.originalQuery = querySplitted;
//				if (this.maxQuery <querySplitted.length){
//					this.batching = true;
//					this.getMultiple(category, subcategory, querySplitted, resource, callbackFunction);
//				}
//				else{
//					this.batching = false;
//					return this.getSingle(category, subcategory, query, resource, callbackFunction);
//				}
//		}

        if(query != null){
            var querys;
            if(query instanceof Array){
                querys = query;
            }else{
                querys = query.split(',');
            }
            this.originalQuery = querys;
            if(querys.length > 1){
                this.batching = true;
                this.results= new Array();
                return this.getMultiple(category, subcategory, querys, resource);
            }else{
                if (this.maxQuery < querys.length){
                    this.batching = true;
                    this.getMultiple(category, subcategory, querys, resource, callbackFunction);
                } else{
                    this.batching = false;
                    return this.getSingle(category, subcategory, querys[0], resource, callbackFunction);
                }
            }
        }else{
            return this.getSingle(category, subcategory, query, resource, callbackFunction);
        }

	},
//	this.getAllSpecies = function() {
//		
//		//Este código todavía no funciona xq el this._callServer(url) cellBase no tiene una respuesta preparada para this._callServer(url)
//		//es decir, no devuelve jsonp, cuando este todo implementado ya merecerá la pena hacerlo bien
//		var url = this.host + "/" + this.version + "/species";
//		this._callServer(url);
//	},
	this._joinToResults = function(response){
		this.resultsCount.push(true);
		this.results[response.id] = response.data;
		if (this.numberQueries == this.resultsCount.length){
			var result = [];
			
			for (var i = 0; i< this.results.length; i++){
				for (var j = 0; j< this.results[i].length; j++){
					result.push(this.results[i][j]);
				}
			}
			this.success.notify({
				"result": result, 
				"category":  this.category, 
				"subcategory": this.subcategory, 
				"query": this.originalQuery, 
				"resource":this.resource, 
				"params":this.params, 
				"error": ''
			});
		}
	},
	
	this.getSingle = function(category, subcategory, query, resource, batchID, callbackFunction) {
		this.category = category;
		this.subcategory = subcategory;
		this.query = query;
		this.resource = resource;
		var url = this.getUrl();
		return this._callServer(url, batchID, callbackFunction);
	},
	
	this.getMultiple = function(category, subcategory, queryArray, resource, callbackFunction) {
		var pieces = new Array();
		//Primero dividimos el queryArray en trocitos tratables
		if (queryArray.length > this.maxQuery){
			for (var i = 0; i < queryArray.length; i=i+this.maxQuery){
				pieces.push(queryArray.slice(i, i+(this.maxQuery)));
			}
		}else{
			pieces.push(queryArray);
		}
		
		this.numberQueries = pieces.length;
		var _this = this;
		
		this.batchSuccessed.addEventListener(function (evt, response){
			_this._joinToResults(response);
		});	
		
		for (var i = 0; i < pieces.length; i++){
		//	this.get(category, subcategory, pieces[i].toString(), resource);
			this.results.push(new Array());
			this.getSingle(category, subcategory, pieces[i].toString(), resource, i);
		}
	},


	this._callServer = function(url, batchID, callbackFunction) {
		var _this = this;
		this.params["of"] = this.contentformat;
//			jQuery.support.cors = true;
			url = url + this.getQuery(this.params,url);
			console.log(url);
			if(this.async == true){
				$.ajax({
					type : "GET",
					url : url,
                    dataType: 'json',//still firefox 20 does not auto serialize JSON, You can force it to always do the parsing by adding dataType: 'json' to your call.
					async : this.async,
					success : function(data, textStatus, jqXHR) {
//							if(data==""){console.log("data is empty");data="[]";}
//							var jsonResponse = JSON.parse(data);
							var jsonResponse = data;

							if (_this.batching){
								_this.batchSuccessed.notify({data:jsonResponse, id:batchID});
							}else{
								//TODO no siempre el resource coincide con el featureType, ejemplo: mirna es el featureType del resource mirna_targets
								_this.success.notify({
									"result": jsonResponse, 
									"category":  _this.category, 
									"subcategory": _this.subcategory, 
									"query": _this.originalQuery, 
									"resource":_this.resource, 
									"params":_this.params, 
									"error": ''
								});
							}
						
					},
					complete : function() {
						_this.completed.notify();
						
					},
					error : function(jqXHR, textStatus, errorThrown) {
						console.log("CellBaseManager: Ajax call returned : "+errorThrown+'\t'+textStatus+'\t'+jqXHR.statusText+" END");
						_this.error.notify();
						
					}
				});
			}else{
				var response = null;
				$.ajax({
					type : "GET",
					url : url,
                    dataType: 'json',
					async : this.async,
					success : function(data, textStatus, jqXHR) {
//							if(data==""){console.log("data is empty");data="[]";}
							var jsonResponse = data;
							response =  {
									"result": jsonResponse,
									"category":  _this.category,
									"subcategory": _this.subcategory,
									"query": _this.originalQuery,
									"resource":_this.resource,
									"params":_this.params,
									"error": ''
							}
					},
					error : function(jqXHR, textStatus, errorThrown) {
					}
				});
				return response;
			}
	};
}

CellBaseManager.prototype.getQuery = function(paramsWS,url){
	var chr = "?";
	if(url.indexOf("?")!=-1){
		chr = "&";
	}
	var query = "";
	for ( var key in paramsWS) {
		if(paramsWS[key]!=null)
			query+=key+"="+paramsWS[key].toString()+"&";
	}
	if(query!="")
		query = chr+query.substring(0, query.length-1);
	return query;
};

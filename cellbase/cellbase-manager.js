function CellBaseManager(species, args) {
//	console.log(species);
	
	
	//This line never changes
	this.host = "http://ws.bioinfo.cipf.es/cellbase/rest";
	
	if(window.location.host.indexOf("fsalavert")!=-1 ||
	   window.location.host.indexOf("rsanchez")!=-1 ||
	   window.location.host.indexOf("imedina")!=-1 ||
	   window.location.href.indexOf("http://bioinfo.cipf.es/apps-beta")!=-1
	){
		this.host = "http://ws-beta.bioinfo.cipf.es/cellbase/rest";
//		this.host = "http://fsalavert:8080/cellbase/rest";
//		this.host = "http://rsanchez:8080/cellbase/rest";
//		this.host = "http://imedina:8080/cellbase/rest";
	}
	
	if (args != null){
		if(args.host != null){
			this.host = args.host;
		}
	}
	
	this.version = "latest";
	this.species = species;
	
//		this.host = 'http://localhost:8080/celldb/rest';
	CELLBASEHOST=this.host;
	
	this.category = null;
	this.subcategory = null;

	// commons query params
	this.contentformat = "json";
	this.fileformat = "";
	this.outputcompress = false;
	this.dataType = "script";

	this.query = "";
	this.originalQuery = "";
	this.resource = "";

	this.async = true;
	
	//Queue of queries
	this.maxQuery = 30;
	this.numberQueries = 0;
	this.results = new Array();
	this.resultsCount = new Array();
	this.batching = false;
	
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

	this.get = function(category, subcategory, query, resource, callbackFunction) {
		if(query instanceof Array){
				this.originalQuery = query;
				this.batching = true;
				this.results= new Array();
				this.getMultiple(category, subcategory, query, resource);
		}
		else{
				query = new String(query);
				query = query.replace(/\s/g, "");
				var querySplitted = query.split(",");
				this.originalQuery = querySplitted;
				if (this.maxQuery <querySplitted.length){
					this.batching = true;
					this.getMultiple(category, subcategory, querySplitted, resource, callbackFunction);
				}
				else{
					this.batching = false;
					this.getSingle(category, subcategory, query, resource, callbackFunction);
				}
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
			var result = new Array();
			
			for (var i = 0; i< this.results.length; i++){
				for (var j = 0; j< this.results[i].length; j++){
					result.push(this.results[i][j]);
				}
			}
			this.success.notify({result: result, query: this.originalQuery, error: ''});
		}
	},
	
	this.getSingle = function(category, subcategory, query, resource, batchID, callbackFunction) {
		this.category = category;
		this.subcategory = subcategory;
		this.query = query;
		this.resource = resource;
		var url = this.getUrl();
		this._callServer(url, batchID, callbackFunction);
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
		var params  = {
				of : this.contentformat,
				outputcompress : this.outputcompress
			};

//			jQuery.support.cors = true;
			url = url + this.getQuery(params,url);
			$.ajax({
				type : "GET",
				url : url,
				async : this.async,
				success : function(data, textStatus, jqXHR) {
//					try{
						if(data==""){console.log("data is empty");data="[]";}
						var jsonResponse = JSON.parse(data);
//					console.log(jsonResponse);
						if (_this.batching){
							_this.batchSuccessed.notify({data:jsonResponse, id:batchID});
						}else{
							_this.success.notify({result: jsonResponse, query: _this.originalQuery, error: ''});
						}
//					}
//					catch(e){
//						console.log("CellBaseManager: data returned was not json: "+url+" :");
//						console.log(data+" END");
//					}
					
				},
				complete : function() {
					_this.completed.notify();
					
				},
				error : function(jqXHR, textStatus, errorThrown) {
					console.log("CellBaseManager: Ajax call returned : "+errorThrown+'\t'+textStatus+'\t'+jqXHR.statusText+" END");
					_this.error.notify();
					
				}
			});
			
		
//		$.ajax({
//			type : "GET",
//			url : url,
//			async : this.async,
////			dataType : this.dataType,
//			data : params,
////			jsonp : "callback",
//			success : function() {
//				if( typeof( response ) != 'undefined'  ){
////					if (callbackFunction!=null){
////						callbackFunction(response);
////					}
//					
//					if (_this.batching){
//						_this.batchSuccessed.notify({data:response, id:batchID});
//					}else{
//						_this.successed.notify(response);
//					}
//				}
//				else{
//					_this.error.notify();
//				}
//			},
//			complete : function() {
//				_this.completed.notify();
//				
//			},
//			error : function() {
//				_this.error.notify();
//				
//			}
//		});
		
		console.log(url);
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
			query+=key+"="+paramsWS[key]+"&";
	}
	if(query!="")
		query = chr+query.substring(0, query.length-1);
	return query;
};

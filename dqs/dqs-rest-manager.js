function DqsRestManager (){
	
	//This line never changes
	this.host = "http://ws.bioinfo.cipf.es/dqs/rest";
	
	if(window.location.host.indexOf("fsalavert")!=-1 ||
	   window.location.host.indexOf("rsanchez")!=-1 ||
	   window.location.host.indexOf("imedina")!=-1 ||
	   window.location.href.indexOf("http://bioinfo.cipf.es/apps")!=-1
	){
		this.host = "http://ws-beta.bioinfo.cipf.es/dqs/rest";
//		this.host = "http://fsalavert:8080/dqs/rest";
//		this.host = "http://rsanchez:8080/dqs/rest";
//		this.host = "http://imedina:8080/dqs/rest";
	}
	DQSHOST = this.host;
	
	/** Events **/
	/** BAM **/
	this.onBamList = new Event(this);
	this.onRegion = new Event(this);
	
	this.onError = new Event(this);
};

/**BAM**/
DqsRestManager.prototype.bamList = function(queryParams){
	var _this=this;
	var url = this.getHost()+'/bam/list'+this.getQuery(queryParams);;
	
	function success(data){
		_this.onBamList.notify(JSON.parse(data));
	}
	
	function error(data){
		console.log("ERROR: " + data);
		console.log(data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
	
};

DqsRestManager.prototype.region = function(category, filename, region, queryParams){
	var _this=this;
	var url = this.getHost()+'/'+category+'/'+filename+'/'+region+'/region'+this.getQuery(queryParams);
	console.log(url);
	function success(data){
		_this.onRegion.notify({resource:category,result:JSON.parse(data),filename:filename,query:region,params:queryParams});
	}
	
	function error(data){
		console.log("ERROR: " + data);
		console.log(data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

DqsRestManager.prototype.getQuery = function(paramsWS){
	var query = "";
	for ( var key in paramsWS) {
		if(paramsWS[key]!=null)
			query+=key+"="+paramsWS[key]+"&";
	}
	if(query!="")
		query = "?"+query.substring(0, query.length-1);
	return query;
};


DqsRestManager.prototype.doGet = function (url, successCallback, errorCallback, enctype){
	if(!enctype) enctype = "application/x-www-form-urlencoded";
	$.ajax({
		type: "GET",
		url: url,
		dataType: "text",
		cache: false,
		success: successCallback,
		error: errorCallback,
		contentType: enctype
	});
};

DqsRestManager.prototype.getHost = function(){
	return this.host;
};

DqsRestManager.prototype.setHost = function(hostUrl){
	 this.host = hostUrl;
};
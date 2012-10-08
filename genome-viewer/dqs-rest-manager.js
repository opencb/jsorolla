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

function DqsRestManager (){


	//deprecated
	//this.host = "http://bioinfo.cipf.es/dqs-naranjoma-ws/rest";
	//if(window.location.host.indexOf("ralonso")!=-1){
		//this.host = "http://ralonso:8080/dqs-naranjoma-ws/rest";
	//}

	this.host = DQS_HOST;
	
	/** Events **/
	/** BAM **/
	this.onBamList = new Event(this);
	this.onRegion = new Event(this);
	
	this.onError = new Event(this);
};

/**General**/
DqsRestManager.prototype.experimentList = function(queryParams){
	var _this=this;
	var url = this.getHost()+'/experiment'+this.getQuery(queryParams);
	
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

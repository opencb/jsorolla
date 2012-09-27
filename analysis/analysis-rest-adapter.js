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

function AnalysisRestAdapter (){

	//This line never changes
	this.host = "http://ws.bioinfo.cipf.es/analysis/rest";
	
	if(window.location.host.indexOf("fsalavert")!=-1 ||
	   window.location.host.indexOf("rsanchez")!=-1 ||
	   window.location.host.indexOf("imedina")!=-1 ||
	   window.location.href.indexOf("http://bioinfo.cipf.es/apps-beta")!=-1
	){
		this.host = "http://ws-beta.bioinfo.cipf.es/analysis/rest";
//		this.host = "http://fsalavert:8080/analysis/rest";
//		this.host = "http://rsanchez:8080/analysis/rest";
//		this.host = "http://imedina:8080/analysis/rest";
//		this.host = "http://gen29:8080/analysis/rest";
	}
	
	var url = $.url();
	var prod = url.param('p');
	if(prod != null) {
		this.host = "http://ws.bioinfo.cipf.es/analysis/rest";
	}
	
	ANALYSISHOST = this.host;
	/** Events **/
	/** Data **/
	this.onEnrichmentAnalysis = new Event(this);
	this.onVariantAnalysis = new Event(this);
	this.onUNTBgenAnalysis = new Event(this);
	this.onLabsAnalysis = new Event(this);
	
	this.onError = new Event(this);
};

AnalysisRestAdapter.prototype.variantAnalysis = function(paramsWS){
	var _this=this;
	var query = this.getQuery(paramsWS);
	var url = this.getHost()+'/variation/variant?'+query;
	function success(data){
		_this.onVariantAnalysis.notify(data);
	}
	function error(data){
		console.log("ERROR: " + data);
	}
	this.doGet(url, success, error);
	console.log(url);
};

AnalysisRestAdapter.prototype.enrichmentAnalysis = function(paramsWS){
	var _this=this;
	var query = this.getQuery(paramsWS);
	var url = this.getHost()+'/functional/renato?'+query;
	function success(data){
		_this.onEnrichmentAnalysis.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
	console.log(url);
	
};

AnalysisRestAdapter.prototype.untbgenAnalysis = function(paramsWS){
	var _this=this;
	var query = this.getQuery(paramsWS);
	var url = this.getHost()+'/comparative/untbgen?'+query;
	function success(data){
		_this.onUNTBgenAnalysis.notify(data);
	}
	function error(data){
		console.log("ERROR: " + data);
	}
	this.doGet(url, success, error);
//	console.log(url);
};

AnalysisRestAdapter.prototype.labsAnalysis = function(tool, paramsWS, method){
	var _this=this;

	function success(data){
		_this.onLabsAnalysis.notify(data);
	}
	function error(data){
		console.log("ERROR: " + data);
	}
	
	if(method == "POST"){
		var url = this.getHost()+'/sequence/'+tool;
		
		this.doPost(url, paramsWS, success, error);
		console.log("post executed");
	}
	else{
		var query = this.getQuery(paramsWS);
		var url = this.getHost()+'/sequence/'+tool+'?'+query;
		
		this.doGet(url, success, error);
		console.log("get executed");
	}
	
//	console.log(url);
};

AnalysisRestAdapter.prototype.getQuery = function(paramsWS){
	var query = "";
	for ( var key in paramsWS) {
		if(paramsWS[key]!=null)
			query+=key+"="+paramsWS[key]+"&";
	}
	if(query!="")
		query = query.substring(0, query.length-1);
	return query;
};

//AnalysisRestAdapter.prototype.enrichmentAnalysis = function(sessionId,fileId,annotationfileId,fisher,duplicates,jobname){
//	var _this=this;
//	var url = this.getHost()+'/functional/renato?sessionid='+sessionId+'&list1-fileid='+fileId+'&databases='+annotationfileId+'&fisher='+fisher+'&duplicates='+duplicates+'&jobname='+jobname;
//	function success(data){
//		_this.onEnrichmentAnalysis.notify(data);
//	}
//	
//	function error(data){
//		console.log("ERROR: " + data);
//	}
//	
//	this.doGet(url, success, error);
////	console.log(url);
//	
//};

/***************************************************************************************/

AnalysisRestAdapter.prototype.doGet = function (url, successCallback, errorCallback, enctype){
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

AnalysisRestAdapter.prototype.doPost = function (url, paramsWS, successCallback, errorCallback, enctype){
	if(!enctype) enctype = "application/x-www-form-urlencoded";
	$.ajax({
		type: "POST",
		url: url,  
		data: paramsWS,
		success: successCallback,
		error: errorCallback,
		processData: false,
		contentType: false
	});
};

AnalysisRestAdapter.prototype.getHost = function(){
	return this.host;
};

AnalysisRestAdapter.prototype.setHost = function(hostUrl){
	 this.host = hostUrl;
};

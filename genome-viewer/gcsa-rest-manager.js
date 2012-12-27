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

function GcsaRestManager (){

	//deprecated
	//this.host = "http://bioinfo.cipf.es/dqs-naranjoma-ws/rest";
	//if(window.location.host.indexOf("ralonso")!=-1){
		//this.host = "http://ralonso:8080/dqs-naranjoma-ws/rest";
	//}

	this.host = GCSA_HOST;
	
	/** Events **/
	/*ACCOUNT*/
	this.onGetAccountInfo = new Event(this);
	this.onLogin = new Event(this);
	this.onRegister = new Event(this);
	this.onResetPassword = new Event(this);
	this.onChangePassword = new Event(this);
	this.onChangeEmail = new Event(this);
	this.onLogout = new Event(this);

	/*Bucket*/
	this.onCreateBucket = new Event(this);
	this.onUploadDataToProject = new Event(this);
	this.onDeleteDataFromProject = new Event(this);
	this.onCreateDirectory = new Event(this);

	/*Jobs*/
	this.onJobStatus = new Event(this);
	this.onJobResult = new Event(this);
	this.onTable = new Event(this);
	this.onPoll = new Event(this);

	/*ANALYSIS*/
	this.onRunAnalysis = new Event(this);
	
	/*BAM*/
	this.onBamList = new Event(this);
	this.onGetAccountInfo = new Event(this);
	this.onRegion = new Event(this);
	
	this.onError = new Event(this);
};

/*ACCOUNT*/
GcsaRestManager.prototype.getAccountInfo = function(accountId, sessionId, lastActivity){
	var _this=this;
	var url = this.getHost()+'/account/'+accountId+'/info?sessionid='+sessionId+'&lastactivity='+lastActivity;
	function success(data){
		if(data.indexOf("ERROR") == -1){
			_this.onGetAccountInfo.notify(JSON.parse(data));
		}else{
			console.log(data);
		}
	}
	
	function error(data){
		console.log("ERROR: " + data);
		console.log(data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
	
};

GcsaRestManager.prototype.login = function(accountId, password, suiteId){
	var _this=this;
	var url = this.getHost()+'/account/'+accountId+'/login?password='+password+'&suiteid='+suiteId;
	console.log(url);
	
	function success(data){
		if(data.indexOf("ERROR") == -1){
			_this.onLogin.notify(JSON.parse(data));
		}else{
			_this.onLogin.notify({errorMessage:data});
		}
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	this.doGet(url, success, error);
};

GcsaRestManager.prototype.register = function(accountId, email, name, password, suiteId){
	var _this = this;
	//http://fsalavert:8080/gcsa/rest/account/fsalavert/create?password=hola&accountName=paco&email=fsalavert@cipf.es
	var url =  this.getHost()+'/account/'+accountId+'/create?accountname='+name+'&email='+email+'&password='+password+'&suiteid='+suiteId;
	
	function success(data){
		_this.onRegister.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

GcsaRestManager.prototype.resetPassword = function(accountId, email){
	var _this=this;
	var url = this.getHost() + '/account/'+accountId+'/resetpassword?email='+email;
	
	function success(data){
		_this.onResetPassword.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

GcsaRestManager.prototype.changePassword = function(accountId, sessionId, password, nPassword1, nPassword2){
	var _this=this;
	var url = this.getHost() + '/account/'+accountId+'/changepassword?password='+password+'&npassword1='+nPassword1+'&npassword2='+nPassword2+'&sessionid='+sessionId;
	function success(data){
		_this.onChangePassword.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};
GcsaRestManager.prototype.changeEmail = function(accountId, sessionId, nEmail){
	var _this=this;
	var url = this.getHost() + '/account/'+accountId+'/changeemail?nemail='+nEmail+'&sessionid='+sessionId;
	function success(data){
		_this.onChangeEmail.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

GcsaRestManager.prototype.logout = function(accountId, sessionId){
	var _this=this;
	var url = this.getHost() + '/account/'+accountId+'/logout?sessionid='+sessionId;
	function success(data){
		_this.onLogout.notify(data);
	}
	
	function error(data){
		$.cookie('bioinfo_sid', null);
		$.cookie('bioinfo_sid', null, {path: '/'});
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};
/*END ACCOUNT*/

/*project management*/
GcsaRestManager.prototype.createBucket = function(bucketname, description, accountId, sessionId){
	debugger
	var _this=this;
	var url = this.getHost()+'/account/'+accountId+'/'+bucketname+'/create?description='+description+'&sessionid='+sessionId;
	
	function success(data){
		_this.onCreateBucket.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};
GcsaRestManager.prototype.uploadDataToProject = function(accountId, sessionId, bucketname, objectname, formData, parents){
	objectname = objectname.replace(new RegExp("/", "gi"),":");
	var _this=this;
	var url = this.getHost()+'/'+accountId+'/'+bucketname+'/'+objectname+'/upload?sessionid='+sessionId+'&parents='+(parents || false);
	
	function success(data){
		console.log(data);
		_this.onUploadDataToProject.notify({status:"done",data:data});
	}
	
	function error(data){
		_this.onUploadDataToProject.notify({status:"fail",data:data});
	}
	
	this.doPost(url, formData, success, error);
//	console.log(url);
};
GcsaRestManager.prototype.deleteDataFromProject = function(accountId, sessionId, bucketname, objectname){
	objectname = objectname.replace(new RegExp("/", "gi"),":");
	var _this=this;
	var url = this.getHost()+'/'+accountId+'/'+bucketname+'/'+objectname+'/delete?sessionid='+sessionId;
	
	function success(data){
		console.log(data);
		_this.onDeleteDataFromProject.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

GcsaRestManager.prototype.createDirectory = function(accountId, sessionId, bucketname, objectname, parents){
	objectname = objectname.replace(new RegExp("/", "gi"),":");
	var _this=this;
	var url = this.getHost()+'/'+accountId+'/'+bucketname+'/'+objectname+'/createdirectory?sessionid='+sessionId+'&parents='+(parents || false);
	
	function success(data){
		console.log(data);
		_this.onCreateDirectory.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};


GcsaRestManager.prototype.jobResult = function(accountId, sessionId, bucketname, jobId, format){
	var _this=this;
	//@Path("/{accountid}/{bucketname}/job/{jobid}/result.{format}")
	var url = this.getHost()+'/'+accountId+'/'+bucketname+'/job/'+jobId+'/result.'+format+'?sessionid='+sessionId;
	//var url = this.getHost() + '/job/'+jobId+'/result.'+format+'?incvisites=true&sessionid='+sessionId;
	function success(data){
		_this.onJobResult.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

GcsaRestManager.prototype.jobStatus = function(accountId, sessionId, bucketname, jobId){
	var _this=this;
	var url = this.getHost()+'/'+accountId+'/'+bucketname+'/job/'+jobId+'/status?sessionid='+sessionId;
	function success(data){
		_this.onJobStatus.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

GcsaRestManager.prototype.table = function(accountId, sessionId, bucketname, jobId, filename, colNames, colVisibilty){
	var _this=this;
	var url = this.getHost()+'/'+accountId+'/'+bucketname+'/job/'+jobId+'/table?sessionid='+sessionId+'&filename='+filename+'&colNames='+colNames+'&colVisibility='+colVisibilty;
		function success(data){
			_this.onTable.notify(data);
		}
	
		function error(data){
			console.log("ERROR: " + data);
		}
		
		this.doGet(url, success, error);
//	console.log(url);
};
GcsaRestManager.prototype.tableurl = function(accountId, sessionId, bucketname, jobId, filename, colNames, colVisibilty){
	return this.getHost()+'/'+accountId+'/'+bucketname+'/job/'+jobId+'/table?sessionid='+sessionId+'&filename='+filename+'&colNames='+colNames+'&colVisibility='+colVisibilty;
};

GcsaRestManager.prototype.poll = function(accountId, sessionId, bucketname, jobId, filename, zip){
	//debugger
	var _this=this;
	if(zip==true){
		var url = this.getHost() +'/'+accountId+'/'+bucketname+'/job/'+jobId+'/poll?sessionid='+sessionId+'&filename='+filename;
		open(url);
	}else{
		var url = this.getHost() +'/'+accountId+'/'+bucketname+'/job/'+jobId+'/poll?sessionid='+sessionId+'&filename='+filename+'&zip=false';
		function success(data){
			_this.onPoll.notify(data);
		}
	
		function error(data){
			console.log("ERROR: " + data);
		}
		
		this.doGet(url, success, error);
	}
//	console.log(url);
};

GcsaRestManager.prototype.pollurl = function(accountId, sessionId, bucketname, jobId, filename){
	//debugger
	return this.getHost() +'/'+accountId+'/'+bucketname+'/job/'+jobId+'/poll?sessionid='+sessionId+'&filename='+filename+'&zip=false';
};




GcsaRestManager.prototype.region = function(accountId, sessionId, bucketname, objectname, region, queryParams){
	var _this=this;
	queryParams["sessionid"]=sessionId;
	var url = this.getHost()+'/'+accountId+'/'+bucketname+'/'+objectname+'/'+region+'/region'+this.getQuery(queryParams);
	console.log(url);
	function success(data){
		_this.onRegion.notify({resource:queryParams["category"],result:JSON.parse(data),filename:objectname,query:region,params:queryParams});
	}
	
	function error(data){
		console.log("ERROR: " + data);
		console.log(data);
	}
	
	this.doGet(url, success, error);
	console.log(url);
};

/**/

/* Analysis */
GcsaRestManager.prototype.runAnalysis = function(analysis, paramsWS){
	var _this=this;
	var url = this.getHost()+'/analysis/'+analysis+'/run';
	console.log(url);
	console.log(paramsWS);
	
	function success(data){
		_this.onRunAnalysis.notify({status:"done",data:data});
	}
	
	function error(data){
		_this.onRunAnalysis.notify({status:"fail",data:data});
	}
	
	$.ajax({type:"POST", url:url, data:paramsWS, success:success, error:error});
};
/**/

/**General**/
GcsaRestManager.prototype.experimentList = function(queryParams){
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
GcsaRestManager.prototype.bamList = function(queryParams){
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



//old
//GcsaRestManager.prototype.region = function(category, filename, region, queryParams){
	//var _this=this;
	//var url = this.getHost()+'/'+category+'/'+filename+'/'+region+'/region'+this.getQuery(queryParams);
	//console.log(url);
	//function success(data){
		//_this.onRegion.notify({resource:category,result:JSON.parse(data),filename:filename,query:region,params:queryParams});
	//}
	//
	//function error(data){
		//console.log("ERROR: " + data);
		//console.log(data);
	//}
	//
	//this.doGet(url, success, error);
	//console.log(url);
//};

GcsaRestManager.prototype.getQuery = function(paramsWS){
	var query = "";
	for ( var key in paramsWS) {
		if(paramsWS[key]!=null)
			query+=key+"="+paramsWS[key]+"&";
	}
	if(query!="")
		query = "?"+query.substring(0, query.length-1);
	return query;
};


GcsaRestManager.prototype.doGet = function (url, successCallback, errorCallback, enctype){
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

GcsaRestManager.prototype.doPost = function (url, formData, successCallback, errorCallback){
	$.ajax({
		type: "POST",
		url: url,
		data: formData,
		processData: false,  // tell jQuery not to process the data
		contentType: false,  // tell jQuery not to set contentType
		success: successCallback,
		error: errorCallback
	});
};

GcsaRestManager.prototype.getHost = function(){
	return this.host;
};

GcsaRestManager.prototype.setHost = function(hostUrl){
	 this.host = hostUrl;
};

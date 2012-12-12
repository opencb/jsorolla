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

function WumRestAdapter (){

	//This line never changes
	this.host = "http://ws.bioinfo.cipf.es/wum/rest";
	
	if(window.location.host.indexOf("fsalavert")!=-1 ||
	   window.location.host.indexOf("rsanchez")!=-1 ||
	   window.location.host.indexOf("imedina")!=-1 ||
	   window.location.href.indexOf("http://bioinfo.cipf.es/apps-beta")!=-1
	){
		this.host = "http://ws-beta.bioinfo.cipf.es/wum/rest";
//		this.host = "http://fsalavert:8080/wum/rest";
//		this.host = "http://rsanchez:8080/wum/rest";
//		this.host = "http://imedina:8080/wum/rest";
//		this.host = "http://gen29:8080/wum/rest";
	}
	
	var url = $.url();
	var prod = url.param('p');
	if(prod != null) {
		this.host = "http://ws.bioinfo.cipf.es/wum/rest";
	}

	WUMHOST = this.host;

	if(WUM_HOST != null){
		this.host = WUM_HOST;
	}

	/** Events **/
	/**Data**/
	this.onGetData = new Event(this);
	this.onReadData = new Event(this);
	
	/**Job**/
	this.onGetJobs = new Event(this);
	this.onJobResult = new Event(this);
	this.onPoll = new Event(this);
	this.onDownload = new Event(this);
	this.onDeleteJob = new Event(this);
	this.onTable = new Event(this);
	this.onGrep = new Event(this);
	
	/**Project**/
	this.onActiveProject = new Event(this);
	this.onCreateProject = new Event(this);
	this.onDeleteProject = new Event(this);
	this.onRenameProject = new Event(this);
	this.onListProject = new Event(this);
	
	/**Suite**/
	this.onSuiteList = new Event(this);
	
	/**User**/
	this.onGetUserInfo = new Event(this);
	this.onLogin = new Event(this);
	this.onLoginError = new Event(this);
	this.onRegister = new Event(this);
	this.onRegisterError = new Event(this);
	this.onReset = new Event(this);
	this.onResetError = new Event(this);
	this.onEditPassword = new Event(this);
	this.onLogout = new Event(this);

	
	this.onError = new Event(this);
	
};
/**Data**/
WumRestAdapter.prototype.getData = function(sessionId,suiteId){
	var _this=this;
	var url = this.getHost()+'/data/list?sessionid='+sessionId+'&suiteid='+suiteId;
	
	function success(data){
		_this.onGetData.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
		console.log(data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
	
};
WumRestAdapter.prototype.readData = function(sessionId,fileId,filename){
	var _this=this;
	var url = this.getHost()+'/data/'+fileId+'/read?sessionid='+sessionId+'&filename='+filename;
	this.filename = filename;
	function success(data){
		_this.onReadData.notify({data:data,filename:_this.filename});
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
	
};


/**Job**/
WumRestAdapter.prototype.getJobs = function(sessionId){
	var _this=this;
	var url = this.getHost()+'/job/list?sessionid='+sessionId;
	
	function success(data){
		_this.onGetJobs.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
	
};

WumRestAdapter.prototype.jobResult = function(jobId, format, sessionId){
	var _this=this;	
	var url = this.getHost() + '/job/'+jobId+'/result.'+format+'?incvisites=true&sessionid='+sessionId;
	function success(data){
		_this.onJobResult.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

WumRestAdapter.prototype.download = function(jobId, sessionId){
	var _this=this;
	var url = this.getHost() + '/job/'+jobId+'/download?sessionid='+sessionId;
	open(url);
//	console.log(url);
};

WumRestAdapter.prototype.deleteJob = function(jobId, sessionId){
	var _this=this;
	var url = this.getHost() + '/job/'+jobId+'/delete?sessionid='+sessionId;
	function success(data){
		_this.onDeleteJob.notify({response:data,jobId:jobId});
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

WumRestAdapter.prototype.poll = function(jobId, filename, zip, sessionId){
	var _this=this;
	if(zip==true){
		var url = this.getHost() + '/job/'+jobId+'/poll?sessionid='+sessionId+'&filename='+filename;
		open(url);
	}else{
		var url = this.getHost() + '/job/'+jobId+'/poll?sessionid='+sessionId+'&filename='+filename+'&zip=false';
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
WumRestAdapter.prototype.pollurl = function(jobId, filename, sessionId){
	return this.getHost() + '/job/'+jobId+'/poll?sessionid='+sessionId+'&filename='+filename+'&zip=false';
};

WumRestAdapter.prototype.table = function(jobId, filename, colNames, colVisibilty, sessionId){
	var _this=this;
	var url = this.getHost()+'/job/'+jobId+'/table?sessionid='+sessionId+'&filename='+filename+'&colNames='+colNames+'&colVisibility='+colVisibilty;
		function success(data){
			_this.onTable.notify(data);
		}
	
		function error(data){
			console.log("ERROR: " + data);
		}
		
		this.doGet(url, success, error);
//	console.log(url);
};
WumRestAdapter.prototype.tableurl = function(jobId, filename, colNames, colVisibilty, sessionId){
	return this.getHost()+'/job/'+jobId+'/table?sessionid='+sessionId+'&filename='+filename+'&colNames='+colNames+'&colVisibility='+colVisibilty;
};

WumRestAdapter.prototype.grep = function(jobId, filename, pattern, ignorecase, sessionId){
	var _this=this;	
	var url = this.getHost() + '/job/'+jobId+'/grep?&filename='+filename+'&pattern='+pattern+'&ignorecase='+ignorecase+'&sessionid='+sessionId;
	function success(data){
		_this.onGrep.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};



/**Project**/
WumRestAdapter.prototype.activeProject = function(projectId, sessionId){
	var _this=this;
	var url = this.getHost()+'/project/'+projectId+'/active?sessionid='+sessionId;
	
	function success(data){
		_this.onActiveProject.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

WumRestAdapter.prototype.createProject = function(projectname, description, sessionId){
	var _this=this;
	var url = this.getHost()+'/project/create?projectname='+projectname+'&description='+description+'&sessionid='+sessionId;
	
	function success(data){
		_this.onCreateProject.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

WumRestAdapter.prototype.deleteProject = function(projectId, sessionId, suiteId){
	var _this=this;
	var url = this.getHost()+'/project/'+projectId+'/delete?sessionid='+sessionId+'&suiteid='+suiteId;
	
	function success(data){
		_this.onDeleteProject.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

WumRestAdapter.prototype.renameProject = function(projectid, projectname, sessionId){
	var _this=this;
	var url = this.getHost()+'/project/'+projectid+'/rename?projectname='+projectname+'&sessionid='+sessionId;
	
	function success(data){
		_this.onRenameProject.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

WumRestAdapter.prototype.listProject = function(sessionId,suiteId){
	var _this=this;
	var url = this.getHost()+'/project/list?sessionid='+sessionId+'&suiteid='+suiteId;
	
	function success(data){
		_this.onListProject.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

/**Suite**/
WumRestAdapter.prototype.getSuiteList = function(){
	var _this=this;	
	var url = this.getHost()+'/suite/list';
	function success(data){
		_this.onSuiteList.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

/**User**/
WumRestAdapter.prototype.getUserInfo = function(sessionId){
	var _this=this;
	var url = this.getHost()+'/user/info?sessionid='+sessionId;
//	console.log("/rest/user/info?sessionid= -> Envia todos los datos incluidos los jobs y el data, información repetida");
	function success(data){
		_this.onGetUserInfo.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

WumRestAdapter.prototype.login = function(email, password, suiteId){
	var _this=this;
	var url = this.getHost()+'/user/login?email='+email+'&password='+password+'&suiteid='+suiteId;
	console.log(url);
	
	function success(data){
		_this.onLogin.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	this.doGet(url, success, error);
};

WumRestAdapter.prototype.register = function(email, password, suiteId){
	var _this = this;
	var url =  this.getHost()+'/user/register?email='+email+'&password='+password+'&suiteid='+suiteId;
	
	function success(data){
		_this.onRegister.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

WumRestAdapter.prototype.reset = function(email){
	var _this=this;
	var url = this.getHost() + '/user/password/reset?email='+email;
	
	function success(data){
		_this.onReset.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

WumRestAdapter.prototype.editPassword = function(oldPass,newPass,sessionId){
	var _this=this;
	var url = this.getHost() + '/user/password/change?sessionid='+sessionId+'&password='+oldPass+'&newpass='+newPass;
	function success(data){
		_this.onEditPassword.notify(data);
	}
	
	function error(data){
		console.log("ERROR: " + data);
	}
	
	this.doGet(url, success, error);
//	console.log(url);
};

WumRestAdapter.prototype.logout = function(sessionId){
	var _this=this;
	var url = this.getHost() + '/user/logout?sessionid='+sessionId;
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



/***************************************************************************************/

WumRestAdapter.prototype.doGet = function (url, successCallback, errorCallback, enctype){
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

WumRestAdapter.prototype.getHost = function(){
	return this.host;
};

WumRestAdapter.prototype.setHost = function(hostUrl){
	 this.host = hostUrl;
};

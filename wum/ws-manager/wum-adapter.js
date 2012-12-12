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

function WumAdapter(){
	
	this.adapter = new WumRestAdapter();
	
	this.onGetJobs = this.adapter.onGetJobs;
	this.onGetData = this.adapter.onGetData;
	this.onReadData = this.adapter.onReadData;
	this.onGetUserInfo = this.adapter.onGetUserInfo;
	
	this.onActiveProject = this.adapter.onActiveProject;
	this.onCreateProject = this.adapter.onCreateProject;
	this.onDeleteProject = this.adapter.onDeleteProject;
	this.onRenameProject = this.adapter.onRenameProject;
	this.onListProject = this.adapter.onListProject;
	
	this.onLogin = this.adapter.onLogin;
	this.onLoginError = this.adapter.onLoginError;
	
	this.onRegister = this.adapter.onRegister;
	this.onRegisterError = this.adapter.onRegisterError;

	this.onReset = this.adapter.onReset;
	this.onResetError = this.adapter.onResetError;
	
	this.onEditPassword = this.adapter.onEditPassword;
	this.onLogout = this.adapter.onLogout;
	this.onJobResult = this.adapter.onJobResult;
	this.onDownload = this.adapter.onDownload;
	this.onDeleteJob = this.adapter.onDeleteJob;
	this.onPoll = this.adapter.onPoll;
	this.onTable =this.adapter.onTable;
	this.onGrep =this.adapter.onGrep;
	
	this.onSuiteList = this.adapter.onSuiteList;
	
	this.onError = this.adapter.onError;
}

WumAdapter.prototype.getJobs = function (sessionId) {
	this.adapter.getJobs(sessionId);
};

WumAdapter.prototype.getData = function (sessionId,suiteId) {
	this.adapter.getData(sessionId,suiteId);
};

WumAdapter.prototype.readData = function (sessionId,fileId,filename) {
	this.adapter.readData(sessionId,fileId,filename);
};

WumAdapter.prototype.getUserInfo = function (sessionId) {
	this.adapter.getUserInfo(sessionId);
};

WumAdapter.prototype.activeProject = function (projectId, sessionId) {
	this.adapter.activeProject(projectId, sessionId);
};

WumAdapter.prototype.createProject = function(projectname, description, sessionId){
	this.adapter.createProject(projectname, description, sessionId);
};

WumAdapter.prototype.deleteProject = function (projectId, sessionId, suiteId) {
	this.adapter.deleteProject(projectId, sessionId, suiteId);
};

WumAdapter.prototype.renameProject = function(projectId, projectname, sessionId){
	this.adapter.renameProject(projectId, projectname, sessionId);
};

WumAdapter.prototype.listProject = function(sessionId,suiteId){
	this.adapter.listProject(sessionId,suiteId);
};

WumAdapter.prototype.login = function (email, password, suiteId) {
	this.adapter.login(email, password, suiteId);
};

WumAdapter.prototype.register = function (email, password, suiteId) {
	this.adapter.register(email, password, suiteId);
};

WumAdapter.prototype.reset = function (email) {
	this.adapter.reset(email);
};

WumAdapter.prototype.editPassword = function (oldPass,newPass,sessionId) {
	this.adapter.editPassword(oldPass,newPass,sessionId);
};

WumAdapter.prototype.logout = function (sessionId) {
	this.adapter.logout(sessionId);
};

WumAdapter.prototype.jobResult = function (jobId, format, sessionId) {
	this.adapter.jobResult(jobId, format, sessionId);
};

WumAdapter.prototype.download = function (jobId, sessionId) {
	this.adapter.download(jobId, sessionId);
};

WumAdapter.prototype.deleteJob = function (jobId, sessionId) {
	this.adapter.deleteJob(jobId, sessionId);
};

WumAdapter.prototype.poll = function (jobId, filename, zip, sessionId) {
	this.adapter.poll(jobId, filename, zip, sessionId);
};

WumAdapter.prototype.pollurl = function(jobId, filename, sessionId){
	return this.adapter.pollurl(jobId, filename, sessionId);
};


WumAdapter.prototype.table = function (jobId, filename, colNames, colVisibilty, sessionId){
	this.adapter.table(jobId, filename, colNames, colVisibilty, sessionId);
};
WumAdapter.prototype.tableurl = function (jobId, filename, colNames, colVisibilty, sessionId){
	return this.adapter.tableurl(jobId, filename, colNames, colVisibilty, sessionId);
};
WumAdapter.prototype.grep = function(jobId, filename, pattern, ignorecase, sessionId){
	return this.adapter.grep(jobId, filename, pattern, ignorecase, sessionId);
};


WumAdapter.prototype.getSuiteList = function () {
	this.adapter.getSuiteList();
};
/****/
//WumAdapter.prototype.getProxy = function(){
//	return this.adapter.getProxy();
//};
//WumAdapter.prototype.setProxy = function(proxyUrl){
//	return this.adapter.setProxy(proxyUrl);
//};
WumAdapter.prototype.getHost = function(){
	return this.adapter.getHost();
};
WumAdapter.prototype.setHost = function(hostUrl){
	 return this.adapter.setHost(hostUrl);
};

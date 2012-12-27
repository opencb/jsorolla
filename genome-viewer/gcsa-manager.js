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

function GcsaManager(){
	
	this.manager = new GcsaRestManager();


	/*account management*/
	this.onGetAccountInfo = this.manager.onGetAccountInfo;
	this.onLogin = this.manager.onLogin;
	this.onRegister = this.manager.onRegister;
	this.onResetPassword = this.manager.onResetPassword;
	this.onChangePassword = this.manager.onChangePassword;
	this.onChangeEmail = this.manager.onChangeEmail;
	this.onLogout = this.manager.onLogout;
	/**/

	/*bucket management*/
	this.onCreateBucket = this.manager.onCreateBucket;
	this.onUploadDataToProject = this.manager.onUploadDataToProject;
	this.onDeleteDataFromProject = this.manager.onDeleteDataFromProject;
	this.onCreateDirectory = this.manager.onCreateDirectory;
	/**/

	/*Jobs*/
	this.onJobStatus = this.manager.onJobStatus;
	this.onJobResult = this.manager.onJobResult;
	this.onTable = this.manager.onTable;
	this.onPoll = this.manager.onPoll;
	
	/*ANALYSIS*/
	this.onRunAnalysis = new Event(this);
		
	this.onBamList = this.manager.onBamList;
	this.onRegion = this.manager.onRegion;

	this.onError = this.manager.onError;
}

GcsaManager.prototype = new GcsaRestManager();

///*account management*/
//GcsaManager.prototype.getAccountInfo = function (accountId, sessionId, lastActivity) {
//	this.manager.getAccountInfo(accountId, sessionId, lastActivity);
//};
//GcsaManager.prototype.login = function (email, password, suiteId) {
//	this.manager.login(email, password, suiteId);
//};
//GcsaManager.prototype.register = function (accountId, email, name, password, suiteId) {
//	this.manager.register(accountId, email, name, password, suiteId);
//};
//GcsaManager.prototype.resetPassword = function (accountId, email) {
//	this.manager.resetPassword(accountId, email);
//};
//GcsaManager.prototype.changePassword = function (accountId, sessionId, password, nPassword1,nPassword2) {
//	this.manager.changePassword(accountId, sessionId, password, nPassword1,nPassword2);
//};
//GcsaManager.prototype.changeEmail = function (accountId, sessionId, nEmail) {
//	this.manager.changeEmail(accountId, sessionId, nEmail);
//};
//GcsaManager.prototype.logout = function (accountId, sessionId) {
//	this.manager.logout(accountId, sessionId);
//};
///**/
//
///*project management*/
//GcsaManager.prototype.createProject = function(projectname, description, accountId, sessionId){
//	this.manager.createProject(projectname, description, accountId, sessionId);
//};
//GcsaManager.prototype.uploadDataToProject = function(accountId, sessionId, projectname, objectname, formData){
//	this.manager.uploadDataToProject(accountId, sessionId, projectname, objectname, formData);
//};
///**/
//
///*Analysis*/
//GcsaManager.prototype.runAnalysis = function(analysis, paramsWS){
//	this.manager.runAnalysis(analysis, paramsWS);
//};
///**/
//
//GcsaManager.prototype.bamList = function (queryParams) {
//	this.manager.bamList(queryParams);
//};
//
//GcsaManager.prototype.region = function (category, filename, region, queryParams) {
//	this.manager.region(category, filename, region, queryParams);
//};
//
//
//
//GcsaManager.prototype.getHost = function(){
//	return this.manager.getHost();
//};
//GcsaManager.prototype.setHost = function(hostUrl){
//	 return this.manager.setHost(hostUrl);
//};

function DqsManager(){
	
	this.manager = new DqsRestManager();
	
	this.onBamList = this.manager.onBamList;
	this.onRegion = this.manager.onRegion;

	this.onError = this.manager.onError;
}

DqsManager.prototype.bamList = function (queryParams) {
	this.manager.bamList(queryParams);
};
DqsManager.prototype.region = function (category, filename, region, queryParams) {
	this.manager.region(category, filename, region, queryParams);
};



DqsManager.prototype.getHost = function(){
	return this.manager.getHost();
};
DqsManager.prototype.setHost = function(hostUrl){
	 return this.manager.setHost(hostUrl);
};
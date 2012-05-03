function DqsManager(){
	
	this.manager = new DqsRestManager();
	
	this.onBamList = this.manager.onBamList;
	this.onBamRegion = this.manager.onBamRegion;

	this.onError = this.manager.onError;
}

DqsManager.prototype.bamList = function (queryParams) {
	this.manager.bamList(queryParams);
};
DqsManager.prototype.bamRegion = function (filename, region, queryParams) {
	this.manager.bamRegion(filename, region, queryParams);
};



DqsManager.prototype.getHost = function(){
	return this.manager.getHost();
};
DqsManager.prototype.setHost = function(hostUrl){
	 return this.manager.setHost(hostUrl);
};
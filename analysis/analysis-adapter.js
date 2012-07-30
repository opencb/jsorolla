function AnalysisAdapter(){
	
	this.adapter = new AnalysisRestAdapter();
	
	this.onEnrichmentAnalysis = this.adapter.onEnrichmentAnalysis;
	this.onUNTBgenAnalysis = this.adapter.onUNTBgenAnalysis;
	this.onLabsAnalysis = this.adapter.onLabsAnalysis;
	
	
	this.onError = this.adapter.onError;
}

AnalysisAdapter.prototype.enrichmentAnalysis = function (paramsWS) {
	this.adapter.enrichmentAnalysis(paramsWS);
};
//AnalysisAdapter.prototype.enrichmentAnalysis = function (sessionId,fileId,annotationfileId,fisher,duplicates,jobname) {
//	this.adapter.enrichmentAnalysis(sessionId,fileId,annotationfileId,fisher,duplicates,jobname);
//};
AnalysisAdapter.prototype.variantAnalysis = function (paramsWS) {
	this.adapter.variantAnalysis(paramsWS);
};

AnalysisAdapter.prototype.untbgenAnalysis = function (paramsWS) {
	this.adapter.untbgenAnalysis(paramsWS);
};

AnalysisAdapter.prototype.labsAnalysis = function (tool, paramsWS, method) {
	this.adapter.labsAnalysis(tool, paramsWS, method);
};

AnalysisAdapter.prototype.getHost = function(){
	return this.adapter.getHost();
};
AnalysisAdapter.prototype.setHost = function(hostUrl){
	 return this.adapter.setHost(hostUrl);
};
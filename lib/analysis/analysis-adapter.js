/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
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
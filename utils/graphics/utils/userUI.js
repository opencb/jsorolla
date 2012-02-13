var userUI = new function()
{
	this.clientMessages =  { info:[], warning:[], error:[]};
	
	this.getUser = function() {
		return  wc_getFullUser();
	};
	
	this.getUserInfo = function() {
		return  wc_getUserInfo();
	};
	
	this.getServerMessages  = function() {
		return wc_getMessages();
	};
	
	this.getClientMessages  = function() {
		return this.clientMessages;
	};
	
	this.addWarningMessage  = function(message) {
		this.clientMessages.warning.push(message);
	};
	
	this.addErrorMessage  = function(message) {
		this.clientMessages.error.push(message);
	};
	
	this.addInfoMessage  = function(message) {
		this.clientMessages.info.push(message);
	};
	
	this.clearAllClientMessages = function()
	{
		this.clientMessages = { info:[], warning:[], error:[]};	
	};
	
	this.getData = function()
	{
			return wc_getOwnedDataList();
	};
	
	this.getJobData = function(jobId)
	{
			var datalist = wc_getOwnedDataList();
			var dataInJob= new Array();
			
			if (datalist==null ) return dataInJob;
			
			for (var i = 0; i< datalist.length; i++)
			{
					if (datalist[i].jobId == jobId)
					{
						dataInJob.push(datalist[i]);	
					}
			}
			return dataInJob;
	};
};

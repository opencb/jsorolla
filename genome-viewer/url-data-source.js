UrlDataSource.prototype.fetch = DataSource.prototype.fetch;

function UrlDataSource() {
	DataAdapter.prototype.constructor.call(this);
	
	this.url = null;
	this.success = new Event();
	this.error = new Event();
};

UrlDataSource.prototype.fetch = function(url){
	this.url = url;
	var _this = this;
	if(url){
		$.ajax({
			type : "GET",
			url : url,
			async : true,
			success : function(data, textStatus, jqXHR) {
//				try{
					if(data==""){console.log("data is empty");data="[]";}
					var jsonResponse = JSON.parse(data);
					_this.success.notify(jsonResponse);
//				}
//				catch(e){
//					console.log("UrlDataSource: data returned was not json: "+url+" :");
//					console.log(data+" END");
//				}
				
			},
//			complete : function() {
//				
//			},
			error : function(jqXHR, textStatus, errorThrown) {
				console.log("URL Data source: Ajax call returned : "+errorThrown+'\t'+textStatus+'\t'+jqXHR.statusText+" END");
				_this.error.notify();
				
			}
		});
	}
};

UrlDataSource.prototype.fetch = DataSource.prototype.fetch;

function UrlDataSource(url) {
	DataSource.prototype.constructor.call(this);
	
	this.url = url;
	this.success = new Event();
	this.error = new Event();
};

UrlDataSource.prototype.fetch = function(async){
	var _this = this;
	
	var datos = null;
	
	if(this.url){
		$.ajax({
			type : "GET",
			url : this.url,
			async : async,
			success : function(data, textStatus, jqXHR) {
				if(async){
					_this.success.notify(data);
				}else{
//					console.log(data)
					datos = data;
				}
			},
			error : function(jqXHR, textStatus, errorThrown){
				console.log("URL Data source: Ajax call returned : "+errorThrown+'\t'+textStatus+'\t'+jqXHR.statusText+" END");
				_this.error.notify();
			}
		});
		
		return datos;
	}
};

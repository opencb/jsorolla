UrlDataSource.prototype.fetch = DataSource.prototype.fetch;

function UrlDataSource(url) {
	DataAdapter.prototype.constructor.call(this);
	
	this.url = url;
	this.success = new Event();
	this.error = new Event();
};

UrlDataSource.prototype.fetch = function(){
	var _this = this;
	if(this.url){
		$.ajax({
			type : "GET",
			url : this.url,
			async : true,
			success : function(data, textStatus, jqXHR) {
				_this.success.notify(data);
			},
			error : function(jqXHR, textStatus, errorThrown) {
				console.log("URL Data source: Ajax call returned : "+errorThrown+'\t'+textStatus+'\t'+jqXHR.statusText+" END");
				_this.error.notify();

			}
		});
	}
};

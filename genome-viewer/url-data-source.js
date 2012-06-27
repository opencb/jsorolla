UrlDataSource.prototype.fetch = DataSource.prototype.fetch;

function UrlDataSource(url, args) {
	DataSource.prototype.constructor.call(this);
	
	this.url = url;
	this.proxy = "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v1/utils/proxy?url=";
	if(args != null){
		if(args.proxy != null){
			if(typeof(args.proxy) == "boolean"){
				if(args.proxy == false){
					this.proxy = false;
				}
				else{
					this.url = this.proxy + url;
				}
			}else if(typeof(args.proxy) == "string"){
				this.url = args.proxy + url;
			}
		}
	}
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

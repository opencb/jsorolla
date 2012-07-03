StringDataSource.prototype.fetch = DataSource.prototype.fetch;

function StringDataSource(str) {
	DataSource.prototype.constructor.call(this);
	
	this.str = str;
	this.success = new Event();
};

StringDataSource.prototype.fetch = function(async){
	if(async){
		_this.success.notify(this.str);
	}else{
		return this.str;
	}
};

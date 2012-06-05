FileDataSource.prototype.fetch = DataSource.prototype.fetch;

function FileDataSource(file) {
	DataAdapter.prototype.constructor.call(this);
	
	this.file = file;
	this.success = new Event();
	this.error = new Event();
};

FileDataSource.prototype.error = function(){
	alert("File is too big. Max file size is 50 Mbytes.");
};


FileDataSource.prototype.fetch = function(file){
	var _this = this;
	if(this.file){
		var  reader = new FileReader();
		reader.onload = function(evt) {
			if(evt.target.result.length>52428800){
				_this.error();
				_this.error.notify();
			}else{
				_this.success.notify(evt.target.result);
			}
		};
		reader.readAsText(this.file, "UTF-8");
	}
};

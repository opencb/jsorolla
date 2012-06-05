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

FileDataSource.prototype.fetch = function(async){
	var _this = this;
	if(this.file.size <= 52428800){
		if(async){
			var  reader = new FileReader();
			reader.onload = function(evt) {
				_this.success.notify(evt.target.result);
			};
			reader.readAsText(this.file, "UTF-8");
		}else{
			var reader = new FileReaderSync();
			return reader.readAsText(this.file, "UTF-8");
		}
	}else{
		_this.error();
		_this.error.notify();
	}
};

FileDataSource.prototype.fetch = DataSource.prototype.fetch;

function FileDataSource() {
	DataAdapter.prototype.constructor.call(this);
	
	this.file = null;
	this.success = new Event();
	this.error = new Event();
};

FileDataSource.prototype.error = function(){
	alert("File is too big. Max file size is 50 Mbytes.");
};


FileDataSource.prototype.fetch = function(file){
	this.file = file;
	var _this = this;
	if(file){
		var  reader = new FileReader();
		reader.onload = function(evt) {
			if(evt.target.result.length>52428800){
				_this.error();
				_this.error.notify();
			}else{
				_this.success.notify(evt.target.result);
			}
		};
		reader.readAsText(file, "UTF-8");
	}
};

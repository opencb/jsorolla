FileDataAdapter.prototype.toJson = DataAdapter.prototype.toJSON;
FileDataAdapter.prototype.getDataset = DataAdapter.prototype.getDataset;


function FileDataAdapter(){
	DataAdapter.prototype.constructor.call(this);
	
	this.file = null;
	this.content = null;
	this.onRead = new Event(this);
};


FileDataAdapter.prototype.loadFromFile = function(file){
	//Not implemented yet. HTML5 reader to get the string of a file --> Ralonso rules!!
	this.file = file;
	var _this = this;
	 if(file){
		var  reader = new FileReader();
		reader.readAsText(file, "UTF-8");
		reader.onload = function(evt) {
			_this.loadFromContent(evt.target.result);
		};
	 }
};


FileDataAdapter.prototype.loadFromContent = function(content){
	this.content = content;
	this.parse(this.content);
	this.onRead.notify(this);
};

FileDataAdapter.prototype.read = function(file){
	//Not implemented yet. HTML5 reader to get the string of a file --> Ralonso rules!!
	var _this = this;
	 if(file){
		var  reader = new FileReader();
		reader.readAsText(file, "UTF-8");
		reader.onload = function(evt) {
			this.content =  evt.target.result;
			_this.onRead.notify(this);
		};
	 }
};


FileDataAdapter.prototype.parse = function(text){
	//here we parse the text
};










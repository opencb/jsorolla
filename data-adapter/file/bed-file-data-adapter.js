BEDFileDataAdapter.prototype.loadFromFile = FileDataAdapter.prototype.loadFromFile;
BEDFileDataAdapter.prototype.loadFromContent = FileDataAdapter.prototype.loadFromContent;
BEDFileDataAdapter.prototype.read = FileDataAdapter.prototype.read;
BEDFileDataAdapter.prototype.getDataset = FileDataAdapter.prototype.getDataset;


function BEDFileDataAdapter(){
	FileDataAdapter.prototype.constructor.call(this);
	
	this.dataset = null;
	this.content = null;
	
	this.lines = new Array();
};

BEDFileDataAdapter.prototype.getLines = function(content){
	return this.lines;
};


BEDFileDataAdapter.prototype.parse = function(content){
	this.content = content;
	var lineBreak = content.split("\n");
	var sifFieldsString  = new Array();
	for (var i = 0; i < lineBreak.length; i++){
		var trimmed = lineBreak[i].replace(/^\s+|\s+$/g,"");
		if ((trimmed != null)&&(trimmed.length > 0)){
			var field = trimmed.replace(/\s+/g,'**%**').split("**%**");
			if (field[0].substr(0,1) != "#"){
				this.lines.push(field);
			}
		}
	}
};
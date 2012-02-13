TabularFileDataAdapter.prototype.loadFromFile = FileDataAdapter.prototype.loadFromFile;
TabularFileDataAdapter.prototype.loadFromContent = FileDataAdapter.prototype.loadFromContent;
TabularFileDataAdapter.prototype.read = FileDataAdapter.prototype.read;
TabularFileDataAdapter.prototype.getDataset = FileDataAdapter.prototype.getDataset;


function TabularFileDataAdapter(args){
	FileDataAdapter.prototype.constructor.call(this);
	
	this.dataset = null;
	this.content = null;
	
	this.comment = null;
		 
	if (args != null){
		if (args.comment != null){
			this.comment = args.comment;
		}
		
		
	}
	this.lines = new Array();
};

TabularFileDataAdapter.prototype.getLines = function(content){
	return this.lines;
};

TabularFileDataAdapter.prototype.getLinesCount = function(){
	return this.lines.length;
};

TabularFileDataAdapter.prototype.getValuesByColumnIndex = function(columnIndex){
	var result = new Array();
	for (var i = 0; i < this.getLinesCount(); i++) {
		if (this.getLines()[i][columnIndex] != null){
			result.push(this.getLines()[i][columnIndex]);
		}
	}
	return result;
};

/** Returns: 'numeric' || 'string **/
TabularFileDataAdapter.prototype.getHeuristicTypeByColumnIndex = function(columnIndex){
	return this.getHeuristicTypeByValues(this.getValuesByColumnIndex(columnIndex));
};

TabularFileDataAdapter.prototype.getHeuristicTypeByValues = function(values){
	var regExp = /^[-+]?[0-9]*\.?[0-9]+$/;
	for (var i = 0; i < values.length; i++) {
		if(!regExp.test(new String(values[i]).replace(",", "."))){
			return 'string';
		}
	}
	return 'numeric';
};


TabularFileDataAdapter.prototype.parse = function(content){
	this.content = content;
	var lineBreak = content.split("\n");
	var sifFieldsString  = new Array();
	for (var i = 0; i < lineBreak.length; i++){
		var trimmed = lineBreak[i].replace(/^\s+|\s+$/g,"");
		trimmed = trimmed.replace(/\//gi,"");//TODO DONE   /  is not allowed in the call
				
		if ((trimmed != null)&&(trimmed.length > 0)){
			var field =trimmed.replace(/\t/g,'**%**').split("**%**");
			if (this.comment == null){
				this.lines.push(field);
			}
			else{
				if (trimmed.substring(0,1) != "#"){
					this.lines.push(field);
				}
			}
			
		}
	}
	
//	this.dataset = new AttributesDataset();
//	this.dataset.load(this.lines);
};













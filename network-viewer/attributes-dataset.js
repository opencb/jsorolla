function AttributesDataset(){
	this.keys = new Object();
	this.lines = null;
	
	this.columnNames = new Array();
	this.columnType = new Array();
	this.types = ["Categorical", "Numerical"];
	
	this.attributeNameChanged = new Event(this);
};

AttributesDataset.prototype.getColumnsCount = function(){
	return this.columnNames.length;
};
//
//AttributesDataset.prototype.setDataset = function(dataset){
//	this.dataset = dataset;
//	
//	var _this = this;
////	this.dataset.newVertex.addEventListener(function (){
////		console.log("New vertex added from attributes");
////	});
//	
//	this.dataset.vertexNameChanged.addEventListener(function (sender, args){
//	
//		if (_this.keys[args.previousName] != null){
//			_this.keys[args.item.getName()] = _this.keys[args.previousName];
//			delete _this.keys[args.previousName];
//			for ( var i = 0; i < _this.lines.length; i++) {
//				console.log(_this.lines[i][0].replace(/^\s+|\s+$/g,""));
//				console.log(args.previousName.replace(/^\s+|\s+$/g,""));
//				if(_this.lines[i][0].replace(/^\s+|\s+$/g,"") == args.previousName.replace(/^\s+|\s+$/g,"")){
//					_this.lines[i][0] = args.item.getName();
//					_this.attributeNameChanged.notify();
//				}
//			}
//		}
//	});
//};


AttributesDataset.prototype.load = function(attributesArray){
	this.lines = attributesArray;
	for ( var i = 0; i < this.lines.length; i++) {
		this.keys[this.lines[i][0].replace(/^\s+|\s+$/g,"")] = this.lines[i].slice(1, this.lines[i].length);
	}
	
	for ( var i = 1; i < this.lines[0].length; i++) {
		this.columnNames.push(new String(i).toString());
		this.columnType.push(this.types[0]);
	}
};

AttributesDataset.prototype.getNoMatchedNodes = function(){
	var unknown = new Array();
	for ( var name in this.keys) {
		if (this.dataset.getVertexByName(name) == null){
			unknown.push(name);
		}
	}
	return unknown;
};




AttributesDataset.prototype.getAttributesByName = function(name){
	return this.keys[name];
};

AttributesDataset.prototype.getLines = function(){
	return this.lines;
};

AttributesDataset.prototype.getLinesByValue = function(columName, value){
	var array = new Array();
	
	for ( var i = 0; i < this.lines.length; i++) {
		if (this.lines[i][columName] == value){
			array.push(this.lines[i]);
		}
	}
	return array;
};

AttributesDataset.prototype.getColumnNames = function(){
	return this.columnNames;
};

AttributesDataset.prototype.getTypes = function(){
	return this.types;
};

AttributesDataset.prototype._getColumnIndex = function(columnName){
	for ( var i = 0; i < this.columnNames.length; i++) {
		if (this.columnNames[i] == columnName){
			return i;
		}
	}
};

AttributesDataset.prototype.getColumnType = function(columnName){
	return this.columnType[this._getColumnIndex(columnName)];
};

AttributesDataset.prototype.setColumnType = function(columnName, columnType){
	for ( var i = 0; i < this.columnNames.length; i++) {
		if (this.columnNames[i] == columnName){
			this.columnType[i] = columnType;
			return;
		}
	}
};

AttributesDataset.prototype.getColumnValues = function(columnName){
	var index = this._getColumnIndex(columnName);
	var aux = new Object();
	var values = new Array();
	for ( var key in this.keys) {
		if (aux[this.keys[key][index]] == null){
			aux[this.keys[key][index]] = true;
			values.push(this.keys[key][index]);
		}
	}
	return values;
};

AttributesDataset.prototype.getVerticesIndexByValue = function(columnName, value){
	var index = this._getColumnIndex(columnName);
	var aux = new Object();
	var vertices = new Array();
	
	for ( var key in this.keys) {
		if (this.keys[key][index] == value){
			vertices.push(key);
		}
		
		
//		if (this.dataset.getVertexByName(key) != null){
//			if (this.keys[key][index] == value){
//				vertices.push(this.dataset.getVertexByName(key).getId());
//			}
//		}
	}
	return vertices;
};
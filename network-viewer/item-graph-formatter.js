
function ItemGraphFormatter(id, defaultFormat, selectedFormat, overFormat, draggingFormat){
	this.id = id;
	this.args = new Object();
	
	this.defaultFormat = new ItemFormat(defaultFormat);
	
	if(selectedFormat != null){
		this.selected = new ItemFormat(selectedFormat);
	}
	else{
		this.selected = new ItemFormat(defaultFormat);
	}
	
	if(overFormat != null){
		this.over = new ItemFormat(overFormat);
	}
	else{
		this.over = new ItemFormat(defaultFormat);
	}
	
	if(draggingFormat != null){
		this.dragging = new ItemFormat(draggingFormat);
	}
	else{
		this.dragging = new ItemFormat(defaultFormat);
	}
	
	//Events
	this.stateChanged  = new Event(this);

	
	//Attaching events
	var _this = this;
	this._setEvents();
};

ItemGraphFormatter.prototype.getType = function(){
	return this.args.type;
};


ItemGraphFormatter.prototype.toJSON = function(){
	var json = this.args;
	json.defaultFormat = this.getDefault().toJSON();
	json.over = this.getOver().toJSON();
	json.selected = this.getSelected().toJSON();
	json.dragging = this.getDragging().toJSON();
	json.id = this.id;
	return json;
};

ItemGraphFormatter.prototype.loadFromJSON = function(json){
	this.args = json;
	this.defaultFormat = new ItemFormat(json.defaultFormat);
	this.over = new ItemFormat(json.over);
	this.selected = new ItemFormat(json.selected);
	this.dragging = new ItemFormat(json.dragging);
	this._setEvents();
};

ItemGraphFormatter.prototype._setEvents = function(){
	//Attaching events
	var _this = this;
	
	this.defaultFormat.changed.addEventListener(function (sender, item){
		_this.over.setSize(_this.defaultFormat.getSize());
		_this.selected.setSize(_this.defaultFormat.getSize());
		_this.dragging.setSize(_this.defaultFormat.getSize());
		_this.stateChanged.notify(_this);
	});
	
	this.selected.changed.addEventListener(function (sender, item){
		_this.stateChanged.notify(_this);
	});
	
	this.over.changed.addEventListener(function (sender, item){
		_this.stateChanged.notify(_this);
	});
	
	this.dragging.changed.addEventListener(function (sender, item){
		_this.stateChanged.notify(_this);
	});
};

/** Getters **/
ItemGraphFormatter.prototype.getId = function(){return this.id;};
ItemGraphFormatter.prototype.getDefault = function(){return this.defaultFormat;};
ItemGraphFormatter.prototype.getSelected = function(){return this.selected;};
ItemGraphFormatter.prototype.getOver = function(){return this.over;};
ItemGraphFormatter.prototype.getDragging = function(){return this.dragging;};

function ItemFormat(args){
	this.defaultFormat = new Object();
	this.args = new Object();
	this.args.title = new Object();
	//Defult properties
	this.args.visible = true;
	this.args.hidden = false;
	this.args.stroke = "#000000";
	this.args.strokeOpacity = 0.8;
	this.args["stroke-width"] = 1;
	this.args.fill = "#000000";
	this.args.size = 1;
	this.args.opacity = 1;
	this.args.fontSize = "8";
	this.args.fontColor = "#000000";
	
	/** For directed edge with arrow **/ 
	//this.args.arrowSize = 1;
	
	
	if (args != null){
		if (args.visible != null){
			this.args.visible = args.visible;
		}
		if (args.opacity != null){
			this.args.opacity = args.opacity;
		}
		if (args.size != null){
			this.args.size = args.size;
		}
		if (args.hidden != null){
			this.args.hidden = args.hidden;
		}
		if (args.stroke != null){
			this.args.stroke = this._fixColor(args.stroke);
		}
		if (args.strokeOpacity != null){
			this.args.strokeOpacity = args.strokeOpacity;
		}
		if (args["stroke-width"]!=null){
			this.args["stroke-width"] = args["stroke-width"];
		}
		if (args.shape!=null){
			this.args.shape = args.shape;
		}
		if (args.fill!=null){
				this.args.fill = this._fixColor(args.fill);
		}
		
		
		if (args.title!=null){
			if (args.title.fontSize!=null){
				this.args.title.fontSize = args.title.fontSize;
			}
			if (args.title.fill!=null){
				this.args.title.fill = this._fixColor(args.title.fill);
			}
		}
		
		/** For directed edge with arrow **/
		/*if (args.arrowSize!=null){
			this.args.arrowSize = args.arrowSize;
		}*/
	
	}
	
	this.changed = new Event();
};

ItemFormat.prototype._fixColor = function(color){
	var fixed = color;
	if (color.indexOf("green") != -1){
		fixed = '#04B431';
	}
	
	if (color.indexOf("blue") != -1){
		fixed = '#045FB4';
	}
	
	if (color.indexOf("red") != -1){
		fixed = '#DF0101';
	}
	
	if (color.indexOf("black") != -1){
		fixed = '#000000';
	}
	
	if (color.indexOf("white") != -1){
		fixed = '#FFFFFF';
	}
	
	if (color.indexOf("#") == -1){
		fixed = "#" + color;
	}
	return fixed;
};

ItemFormat.prototype.toJSON = function(){
	if(this.args.strokeOpacity != null){
		this.args["stroke-opacity"] = this.args.strokeOpacity;
		delete this.args.strokeOpacity;
	}
	
//	if(this.args.strokeWidth != null){
//		this.args["stroke-width"] = this.args.strokeWidth;
//		delete this.args["stroke-width"];
//	}

	if(this.args.title.fontColor != null){
		this.args.title["font-color"] = this.args.title.fontColor;
	}
	else{
		this.args.title["font-color"] = this.args.fontColor;//;this.args.title.fontColor;
	}
	
	if(this.args.title.fontSize != null){
		this.args.title["font-size"] = this.args.title.fontSize;//;this.args.title.fontColor;
	}
	else{ 
		this.args.title["font-size"] = this.args.fontSize;//;this.args.title.fontColor;
	}
	//return this.args;
	return this.args;
};

ItemFormat.prototype.getAttribute = function(name){return this.args[name];};

//Getters and Setters
ItemFormat.prototype.setVisible = function(visible){
	if (this.args.visible != visible){
		this.args.visible = visible;
		this.changed.notify(this);
	}
};

ItemFormat.prototype.getVisible = function(){return this.args.visible;};

ItemFormat.prototype.setHidden = function(hidden){
	if (this.args.hidden != hidden){
		this.args.hidden = hidden;
		this.changed.notify(this);
	}
};

ItemFormat.prototype.getHidden = function(){return this.args.hidden;};


ItemFormat.prototype.setStroke = function(stroke){
	if (this.args.stroke != stroke){
		this.args.stroke = stroke;
		this.changed.notify(this);
	}
};

ItemFormat.prototype.getStroke = function(){return this.args.stroke;};

ItemFormat.prototype.setStrokeOpacity = function(strokeOpacity){
	if (this.args.strokeOpacity != strokeOpacity){
		this.args.strokeOpacity = strokeOpacity;
		this.changed.notify(this);
	}
};

ItemFormat.prototype.getStrokeOpacity = function(){return this.args["stroke-opacity"];};

ItemFormat.prototype.setStrokeWidth = function(strokeWidth){
	if (this.args["stroke-width"] != strokeWidth){
		this.args["stroke-width"] = strokeWidth;
		this.changed.notify(this);
	}
};

ItemFormat.prototype.getStrokeWidth = function(){
	return this.args["stroke-width"];
};

ItemFormat.prototype.setFill = function(fill){
	if (this.args.fill != fill){
		this.args.fill = fill;
		this.changed.notify(this);
	}
};

ItemFormat.prototype.getFill = function(){return this.args.fill;};

ItemFormat.prototype.setSize = function(size){
	if (this.args.size != size){
		this.args.size = size;
		this.changed.notify(this);
	}
};

ItemFormat.prototype.getSize = function(){return this.args.size;};

ItemFormat.prototype.setOpacity = function(opacity){
	if (this.args.opacity != opacity){
		this.args.opacity = opacity;
		this.changed.notify(this);
	}
};

ItemFormat.prototype.getOpacity = function(){return this.args.opacity;};

ItemFormat.prototype.getArrowSize = function(){return this.args.arrowSize;};

ItemFormat.prototype.setArrowSize = function(arrowSize){
	if (this.args.arrowSize != arrowSize){
		this.args.arrowSize = arrowSize;
		this.changed.notify(this);
	}
};

ItemFormat.prototype.getFontSize = function(){return this.args.title.fontSize;};

ItemFormat.prototype.setFontSize = function(fontSize){

	if (this.args.title.fontSize != fontSize){
		this.args.title.fontSize = fontSize;
		this.changed.notify(this);
	}
};





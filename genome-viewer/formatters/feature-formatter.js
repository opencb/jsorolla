function FeatureFormatter(id, defaultFormat, selectedFormat, overFormat, draggingFormat){
	this.id =  id;
	this.internalId =  Math.random();
	
	this.args = new Object();
	
	this.defaultFormat = new ItemFeatureFormat(defaultFormat);
	
	if(selectedFormat != null){
		this.selected = new ItemFeatureFormat(selectedFormat);
	}
	else{
		this.selected = new ItemFeatureFormat(defaultFormat);
	}
	
	if(overFormat != null){
		this.over = new ItemFeatureFormat(overFormat);
	}
	else{
		this.over = new ItemFeatureFormat(defaultFormat);
	}
	
	if(draggingFormat != null){
		this.dragging = new ItemFeatureFormat(draggingFormat);
	}
	else{
		this.dragging = new ItemFeatureFormat(defaultFormat);
	}
	
	//Events
	this.stateChanged  = new Event(this);

	
	//Attaching events
	var _this = this;
	this._setEvents();
};

FeatureFormatter.prototype.getType = function(){
	return this.args.type;
};


FeatureFormatter.prototype.toJSON = function(){
	var json = this.args;
	json.defaultFormat = this.getDefault().toJSON();
	json.over = this.getOver().toJSON();
	json.selected = this.getSelected().toJSON();
	json.dragging = this.getDragging().toJSON();
	json.id = this.id;
	return json;
};

FeatureFormatter.prototype.loadFromJSON = function(json){
	this.args = json;
	this.defaultFormat = new ItemFeatureFormat(json.defaultFormat);
	this.over = new ItemFeatureFormat(json.over);
	this.selected = new ItemFeatureFormat(json.selected);
	this.dragging = new ItemFeatureFormat(json.dragging);
	this._setEvents();
};

FeatureFormatter.prototype._setEvents = function(){
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
FeatureFormatter.prototype.getId = function(){return this.id;};
FeatureFormatter.prototype.getDefault = function(){return this.defaultFormat;};
FeatureFormatter.prototype.getSelected = function(){return this.selected;};
FeatureFormatter.prototype.getOver = function(){return this.over;};
FeatureFormatter.prototype.getDragging = function(){return this.dragging;};

function ItemFeatureFormat(args){
	this.defaultFormat = new Object();
	this.args = new Object();
	this.args.title = new Object();
	//Defult properties
	this.args.hidden = false;
	this.args.stroke = "black";
	this.args.strokeOpacity = 0.8;
	this.args.strokeWidth = 1;
	this.args.fill = "white";
	this.args.size = 1;
	this.args.opacity = 1;
	this.args.fontSize = "8";
	this.args.fontColor = "black";
	
	/** For directed edge with arrow **/ 
	//this.args.arrowSize = 1;
	
	if (args != null){
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
			this.args.stroke = args.stroke;
		}
		if (args.strokeOpacity != null){
			this.args.strokeOpacity = args.strokeOpacity;
		}
		if (args.strokeWidth!=null){
			this.args.strokeWidth = args.strokeWidth;
		}
		if (args.shape!=null){
			this.args.shape = args.shape;
		}
		if (args.fill!=null){
			this.args.fill = args.fill;
		}
//		if (args.title!=null){
			if (args.fontSize!=null){
				this.args.fontSize = args.fontSize;
			}
//			if (args.title.fill!=null){
//				this.args.fill = args.fill;
//			}
//		}
	
	}
	
	this.changed = new Event();
};

ItemFeatureFormat.prototype.toJSON = function(){
	if(this.args.strokeOpacity != null){
		this.args["stroke-opacity"] = this.args.strokeOpacity;
		delete this.args.strokeOpacity;
	}
	if(this.args.strokeWidth != null){
		this.args["stroke-width"] = this.args.strokeWidth;
		delete this.args.strokeWidth;
	}

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

ItemFeatureFormat.prototype.getAttribute = function(name){return this.args[name];};

//Getters and Setters
ItemFeatureFormat.prototype.setVisible = function(visible){
	if (this.args.visible != visible){
		this.args.visible = visible;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getVisible = function(){return this.args.visible;};

ItemFeatureFormat.prototype.setHidden = function(hidden){
	if (this.args.hidden != hidden){
		this.args.hidden = hidden;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getHidden = function(){return this.args.hidden;};


ItemFeatureFormat.prototype.setStroke = function(stroke){
	if (this.args.stroke != stroke){
		this.args.stroke = stroke;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getStroke = function(){return this.args.stroke;};

ItemFeatureFormat.prototype.setStrokeOpacity = function(strokeOpacity){
	if (this.args.strokeOpacity != strokeOpacity){
		this.args.strokeOpacity = strokeOpacity;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getStrokeOpacity = function(){return this.args["stroke-opacity"];};

ItemFeatureFormat.prototype.setStrokeWidth = function(strokeWidth){
	if (this.args.strokeWidth != strokeWidth){
		this.args.strokeWidth = strokeWidth;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getStrokeWidth = function(){return this.args.strokeWidth;};

ItemFeatureFormat.prototype.setFill = function(fill){
	if (this.args.fill != fill){
		this.args.fill = fill;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getFill = function(){return this.args.fill;};

ItemFeatureFormat.prototype.setSize = function(size){
	if (this.args.size != size){
		this.args.size = size;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getSize = function(){return this.args.size;};

ItemFeatureFormat.prototype.setOpacity = function(opacity){
	if (this.args.opacity != opacity){
		this.args.opacity = opacity;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getOpacity = function(){return this.args.opacity;};

ItemFeatureFormat.prototype.getArrowSize = function(){return this.args.arrowSize;};

ItemFeatureFormat.prototype.setArrowSize = function(arrowSize){
	if (this.args.arrowSize != arrowSize){
		this.args.arrowSize = arrowSize;
		this.changed.notify(this);
	}
};

ItemFeatureFormat.prototype.getFontSize = function(){return this.args.title.fontSize;};

ItemFeatureFormat.prototype.setFontSize = function(fontSize){

	if (this.args.title.fontSize != fontSize){
		this.args.title.fontSize = fontSize;
		this.changed.notify(this);
	}
};





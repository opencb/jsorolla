VertexGraphFormatter.prototype.getDefault = ItemGraphFormatter.prototype.getDefault;
VertexGraphFormatter.prototype.getSelected = ItemGraphFormatter.prototype.getSelected;
VertexGraphFormatter.prototype.getOver = ItemGraphFormatter.prototype.getOver;
VertexGraphFormatter.prototype.getDragging = ItemGraphFormatter.prototype.getDragging; 
VertexGraphFormatter.prototype.getId = ItemGraphFormatter.prototype.getId; 
VertexGraphFormatter.prototype.toJSON = ItemGraphFormatter.prototype.toJSON; 
VertexGraphFormatter.prototype.loadFromJSON = ItemGraphFormatter.prototype.loadFromJSON; 
VertexGraphFormatter.prototype._setEvents = ItemGraphFormatter.prototype._setEvents; 


function VertexGraphFormatter(defaultFormat, selectedFormat, overFormat, draggingFormat){
	ItemGraphFormatter.prototype.constructor.call(this, defaultFormat, selectedFormat, overFormat, draggingFormat);
};


CircleVertexGraphFormatter.prototype.getDefault = VertexGraphFormatter.prototype.getDefault;
CircleVertexGraphFormatter.prototype.getSelected = VertexGraphFormatter.prototype.getSelected;
CircleVertexGraphFormatter.prototype.getOver = VertexGraphFormatter.prototype.getOver;
CircleVertexGraphFormatter.prototype.getDragging = VertexGraphFormatter.prototype.getDragging; 
CircleVertexGraphFormatter.prototype.getId = VertexGraphFormatter.prototype.getId; 
CircleVertexGraphFormatter.prototype.toJSON = VertexGraphFormatter.prototype.toJSON; 
CircleVertexGraphFormatter.prototype.loadFromJSON = VertexGraphFormatter.prototype.loadFromJSON;
CircleVertexGraphFormatter.prototype._setEvents = VertexGraphFormatter.prototype._setEvents;

function CircleVertexGraphFormatter(id, defaultFormat, selectedFormat, overFormat, draggingFormat){
	VertexGraphFormatter.prototype.constructor.call(this, id, defaultFormat, selectedFormat, overFormat, draggingFormat);
	this.args.type = "CircleVertexGraphFormatter";
	if (defaultFormat != null){
		if (defaultFormat.radius != null){
			this.defaultFormat.args.radius = defaultFormat.radius;
		}
	}
	
	if (selectedFormat != null){
		if (selectedFormat.radius != null){
			this.selected.args.radius = selectedFormat.radius;
		}
	}
	
	if (overFormat != null){
		if (overFormat.radius != null){
			this.over.args.radius = overFormat.radius;
		}
	}
	
	if (draggingFormat != null){
		if (draggingFormat.radius != null){
			this.dragging.args.draggingFormat = draggingFormat.radius;
		}
	}
};



SquareVertexGraphFormatter.prototype.getDefault = VertexGraphFormatter.prototype.getDefault;
SquareVertexGraphFormatter.prototype.getSelected = VertexGraphFormatter.prototype.getSelected;
SquareVertexGraphFormatter.prototype.getOver = VertexGraphFormatter.prototype.getOver;
SquareVertexGraphFormatter.prototype.getDragging = VertexGraphFormatter.prototype.getDragging; 
SquareVertexGraphFormatter.prototype.getId = VertexGraphFormatter.prototype.getId; 
SquareVertexGraphFormatter.prototype.toJSON = VertexGraphFormatter.prototype.toJSON; 
SquareVertexGraphFormatter.prototype.loadFromJSON = VertexGraphFormatter.prototype.loadFromJSON;
SquareVertexGraphFormatter.prototype._setEvents = VertexGraphFormatter.prototype._setEvents;

function SquareVertexGraphFormatter(id, defaultFormat, selectedFormat, overFormat, draggingFormat){
	VertexGraphFormatter.prototype.constructor.call(this, id, defaultFormat, selectedFormat, overFormat, draggingFormat);
	this.args.type =  "SquareVertexGraphFormatter";
	if (defaultFormat != null){
		if (defaultFormat.radius != null){
			this.defaultFormat.args.radius = defaultFormat.radius;
		}
	}
	
	if (selectedFormat != null){
		if (selectedFormat.radius != null){
			this.selected.args.radius = selectedFormat.radius;
		}
	}
	
	if (overFormat != null){
		if (overFormat.radius != null){
			this.over.args.radius = overFormat.radius;
		}
	}
	
	if (draggingFormat != null){
		if (draggingFormat.radius != null){
			this.dragging.args.draggingFormat = draggingFormat.radius;
		}
	}
};


EllipseVertexGraphFormatter.prototype.getDefault = VertexGraphFormatter.prototype.getDefault;
EllipseVertexGraphFormatter.prototype.getSelected = VertexGraphFormatter.prototype.getSelected;
EllipseVertexGraphFormatter.prototype.getOver = VertexGraphFormatter.prototype.getOver;
EllipseVertexGraphFormatter.prototype.getDragging = VertexGraphFormatter.prototype.getDragging; 
EllipseVertexGraphFormatter.prototype.getId = VertexGraphFormatter.prototype.getId; 
EllipseVertexGraphFormatter.prototype.toJSON = VertexGraphFormatter.prototype.toJSON; 
EllipseVertexGraphFormatter.prototype.loadFromJSON = VertexGraphFormatter.prototype.loadFromJSON;
EllipseVertexGraphFormatter.prototype._setEvents = VertexGraphFormatter.prototype._setEvents;

function EllipseVertexGraphFormatter(id, defaultFormat, selectedFormat, overFormat, draggingFormat){
	VertexGraphFormatter.prototype.constructor.call(this, id, defaultFormat, selectedFormat, overFormat, draggingFormat);
	this.args.type  = "EllipseVertexGraphFormatter";
	if (defaultFormat != null){
		if (defaultFormat.radius != null){
			this.defaultFormat.args.radius = defaultFormat.radius;
		}
	}
	
	if (selectedFormat != null){
		if (selectedFormat.radius != null){
			this.selected.args.radius = selectedFormat.radius;
		}
	}
	
	if (overFormat != null){
		if (overFormat.radius != null){
			this.over.args.radius = overFormat.radius;
		}
	}
	
	if (draggingFormat != null){
		if (draggingFormat.radius != null){
			this.dragging.args.draggingFormat = draggingFormat.radius;
		}
	}
};



RectangleVertexGraphFormatter.prototype.getDefault = ItemGraphFormatter.prototype.getDefault;
RectangleVertexGraphFormatter.prototype.getSelected = ItemGraphFormatter.prototype.getSelected;
RectangleVertexGraphFormatter.prototype.getOver = ItemGraphFormatter.prototype.getOver;
RectangleVertexGraphFormatter.prototype.getDragging = ItemGraphFormatter.prototype.getDragging; 
RectangleVertexGraphFormatter.prototype.getId = ItemGraphFormatter.prototype.getId; 
RectangleVertexGraphFormatter.prototype.toJSON = ItemGraphFormatter.prototype.toJSON; 
RectangleVertexGraphFormatter.prototype.loadFromJSON = ItemGraphFormatter.prototype.loadFromJSON; 
RectangleVertexGraphFormatter.prototype._setEvents = ItemGraphFormatter.prototype._setEvents; 

function RectangleVertexGraphFormatter(id, defaultFormat, selectedFormat, overFormat, draggingFormat){
	VertexGraphFormatter.prototype.constructor.call(this, id, defaultFormat, selectedFormat, overFormat, draggingFormat);
	this.args.type = "RectangleVertexGraphFormatter";
	if (defaultFormat != null){
		if (defaultFormat.radius != null){
			this.defaultFormat.args.radius = defaultFormat.radius;
		}
	}
	
	if (selectedFormat != null){
		if (selectedFormat.radius != null){
			this.selected.args.radius = selectedFormat.radius;
		}
	}
	
	if (overFormat != null){
		if (overFormat.radius != null){
			this.over.args.radius = overFormat.radius;
		}
	}
	
	if (draggingFormat != null){
		if (draggingFormat.radius != null){
			this.dragging.args.draggingFormat = draggingFormat.radius;
		}
	}
};



RoundedVertexGraphFormatter.prototype.getDefault = ItemGraphFormatter.prototype.getDefault;
RoundedVertexGraphFormatter.prototype.getSelected = ItemGraphFormatter.prototype.getSelected;
RoundedVertexGraphFormatter.prototype.getOver = ItemGraphFormatter.prototype.getOver;
RoundedVertexGraphFormatter.prototype.getDragging = ItemGraphFormatter.prototype.getDragging; 
RoundedVertexGraphFormatter.prototype.getId = ItemGraphFormatter.prototype.getId; 
RoundedVertexGraphFormatter.prototype.toJSON = ItemGraphFormatter.prototype.toJSON; 
RoundedVertexGraphFormatter.prototype.loadFromJSON = ItemGraphFormatter.prototype.loadFromJSON; 
RoundedVertexGraphFormatter.prototype._setEvents = ItemGraphFormatter.prototype._setEvents; 

function RoundedVertexGraphFormatter(id, defaultFormat, selectedFormat, overFormat, draggingFormat){
	VertexGraphFormatter.prototype.constructor.call(this, id, defaultFormat, selectedFormat, overFormat, draggingFormat);
	this.args.type = "RoundedVertexGraphFormatter";
	if (defaultFormat != null){
		if (defaultFormat.radius != null){
			this.defaultFormat.args.radius = defaultFormat.radius;
		}
	}
	
	if (selectedFormat != null){
		if (selectedFormat.radius != null){
			this.selected.args.radius = selectedFormat.radius;
		}
	}
	
	if (overFormat != null){
		if (overFormat.radius != null){
			this.over.args.radius = overFormat.radius;
		}
	}
	
	if (draggingFormat != null){
		if (draggingFormat.radius != null){
			this.dragging.args.draggingFormat = draggingFormat.radius;
		}
	}
};



OctagonVertexGraphFormatter.prototype.getDefault = ItemGraphFormatter.prototype.getDefault;
OctagonVertexGraphFormatter.prototype.getSelected = ItemGraphFormatter.prototype.getSelected;
OctagonVertexGraphFormatter.prototype.getOver = ItemGraphFormatter.prototype.getOver;
OctagonVertexGraphFormatter.prototype.getDragging = ItemGraphFormatter.prototype.getDragging; 
OctagonVertexGraphFormatter.prototype.getId = ItemGraphFormatter.prototype.getId; 
OctagonVertexGraphFormatter.prototype.toJSON = ItemGraphFormatter.prototype.toJSON; 
OctagonVertexGraphFormatter.prototype.loadFromJSON = ItemGraphFormatter.prototype.loadFromJSON; 
OctagonVertexGraphFormatter.prototype._setEvents = ItemGraphFormatter.prototype._setEvents; 

function OctagonVertexGraphFormatter(id, defaultFormat, selectedFormat, overFormat, draggingFormat){
	VertexGraphFormatter.prototype.constructor.call(this, id, defaultFormat, selectedFormat, overFormat, draggingFormat);
	this.args.type = "OctagonVertexGraphFormatter";
	if (defaultFormat != null){
		if (defaultFormat.radius != null){
			this.defaultFormat.args.radius = defaultFormat.radius;
		}
	}
	
	if (selectedFormat != null){
		if (selectedFormat.radius != null){
			this.selected.args.radius = selectedFormat.radius;
		}
	}
	
	if (overFormat != null){
		if (overFormat.radius != null){
			this.over.args.radius = overFormat.radius;
		}
	}
	
	if (draggingFormat != null){
		if (draggingFormat.radius != null){
			this.dragging.args.draggingFormat = draggingFormat.radius;
		}
	}
};


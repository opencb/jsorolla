
EdgeGraphFormatter.prototype.setProperties = ItemGraphFormatter.prototype.setProperties;
EdgeGraphFormatter.prototype.getDefault = ItemGraphFormatter.prototype.getDefault;
EdgeGraphFormatter.prototype.getSelected = ItemGraphFormatter.prototype.getSelected;
EdgeGraphFormatter.prototype.getOver = ItemGraphFormatter.prototype.getOver;
EdgeGraphFormatter.prototype.getDragging = ItemGraphFormatter.prototype.getDragging; 
EdgeGraphFormatter.prototype.getId = ItemGraphFormatter.prototype.getId; 
EdgeGraphFormatter.prototype.toJSON = ItemGraphFormatter.prototype.toJSON; 
EdgeGraphFormatter.prototype.loadFromJSON = ItemGraphFormatter.prototype.loadFromJSON; 
EdgeGraphFormatter.prototype._setEvents = ItemGraphFormatter.prototype._setEvents; 

function EdgeGraphFormatter(id, defaultFormat, selectedFormat, overFormat, dragginFormat){
	ItemGraphFormatter.prototype.constructor.call(this, id, defaultFormat, selectedFormat, overFormat, dragginFormat);
	
	this.getDefault().args.type = "EdgeGraphFormatter";
};




LineEdgeGraphFormatter.prototype.setProperties = EdgeGraphFormatter.prototype.setProperties;
LineEdgeGraphFormatter.prototype.getDefault = EdgeGraphFormatter.prototype.getDefault;
LineEdgeGraphFormatter.prototype.getSelected = EdgeGraphFormatter.prototype.getSelected;
LineEdgeGraphFormatter.prototype.getOver = EdgeGraphFormatter.prototype.getOver;
LineEdgeGraphFormatter.prototype.getDragging = EdgeGraphFormatter.prototype.getDragging; 
LineEdgeGraphFormatter.prototype.getId = EdgeGraphFormatter.prototype.getId; 
LineEdgeGraphFormatter.prototype.toJSON = EdgeGraphFormatter.prototype.toJSON; 
LineEdgeGraphFormatter.prototype.loadFromJSON = EdgeGraphFormatter.prototype.loadFromJSON; 
LineEdgeGraphFormatter.prototype._setEvents = EdgeGraphFormatter.prototype._setEvents; 

function LineEdgeGraphFormatter(id, defaultFormat, selectedFormat, overFormat, dragginFormat){
	EdgeGraphFormatter.prototype.constructor.call(this, id, defaultFormat, selectedFormat, overFormat, dragginFormat);
	this.args.type = "LineEdgeGraphFormatter";
};

/** DIRECTED **/
DirectedLineEdgeGraphFormatter.prototype.setProperties = EdgeGraphFormatter.prototype.setProperties;
DirectedLineEdgeGraphFormatter.prototype.getDefault = EdgeGraphFormatter.prototype.getDefault;
DirectedLineEdgeGraphFormatter.prototype.getSelected = EdgeGraphFormatter.prototype.getSelected;
DirectedLineEdgeGraphFormatter.prototype.getOver = EdgeGraphFormatter.prototype.getOver;
DirectedLineEdgeGraphFormatter.prototype.getDragging = EdgeGraphFormatter.prototype.getDragging; 
DirectedLineEdgeGraphFormatter.prototype.getId = EdgeGraphFormatter.prototype.getId; 
DirectedLineEdgeGraphFormatter.prototype.toJSON = EdgeGraphFormatter.prototype.toJSON; 
DirectedLineEdgeGraphFormatter.prototype.loadFromJSON = EdgeGraphFormatter.prototype.loadFromJSON; 
DirectedLineEdgeGraphFormatter.prototype._setEvents = EdgeGraphFormatter.prototype._setEvents; 

function DirectedLineEdgeGraphFormatter(id, defaultFormat, selectedFormat, overFormat, dragginFormat){
	EdgeGraphFormatter.prototype.constructor.call(this, id, defaultFormat, selectedFormat, overFormat, dragginFormat);
	this.args.type = "DirectedLineEdgeGraphFormatter";
	this.args.arrowSize = "3";
};
DirectedLineEdgeGraphFormatter.prototype.getArrowSize = function(){
	return this.args.arrowSize;
};

OdirectedLineEdgeGraphFormatter.prototype.setProperties = EdgeGraphFormatter.prototype.setProperties;
OdirectedLineEdgeGraphFormatter.prototype.getDefault = EdgeGraphFormatter.prototype.getDefault;
OdirectedLineEdgeGraphFormatter.prototype.getSelected = EdgeGraphFormatter.prototype.getSelected;
OdirectedLineEdgeGraphFormatter.prototype.getOver = EdgeGraphFormatter.prototype.getOver;
OdirectedLineEdgeGraphFormatter.prototype.getDragging = EdgeGraphFormatter.prototype.getDragging; 
OdirectedLineEdgeGraphFormatter.prototype.getId = EdgeGraphFormatter.prototype.getId; 
OdirectedLineEdgeGraphFormatter.prototype.toJSON = EdgeGraphFormatter.prototype.toJSON; 
OdirectedLineEdgeGraphFormatter.prototype.loadFromJSON = EdgeGraphFormatter.prototype.loadFromJSON; 
OdirectedLineEdgeGraphFormatter.prototype._setEvents = EdgeGraphFormatter.prototype._setEvents; 

function OdirectedLineEdgeGraphFormatter(id, defaultFormat, selectedFormat, overFormat, dragginFormat){
	EdgeGraphFormatter.prototype.constructor.call(this, id, defaultFormat, selectedFormat, overFormat, dragginFormat);
	this.args.type = "DirectedLineEdgeGraphFormatter";
	this.args.arrowSize = "3";
};

OdirectedLineEdgeGraphFormatter.prototype.getArrowSize = function(){
	return this.args.arrowSize;
};


/** CUT (inhibition) **/
CutDirectedLineEdgeGraphFormatter.prototype.setProperties = EdgeGraphFormatter.prototype.setProperties;
CutDirectedLineEdgeGraphFormatter.prototype.getDefault = EdgeGraphFormatter.prototype.getDefault;
CutDirectedLineEdgeGraphFormatter.prototype.getSelected = EdgeGraphFormatter.prototype.getSelected;
CutDirectedLineEdgeGraphFormatter.prototype.getOver = EdgeGraphFormatter.prototype.getOver;
CutDirectedLineEdgeGraphFormatter.prototype.getDragging = EdgeGraphFormatter.prototype.getDragging; 
CutDirectedLineEdgeGraphFormatter.prototype.getId = EdgeGraphFormatter.prototype.getId; 
CutDirectedLineEdgeGraphFormatter.prototype.toJSON = EdgeGraphFormatter.prototype.toJSON; 
CutDirectedLineEdgeGraphFormatter.prototype.loadFromJSON = EdgeGraphFormatter.prototype.loadFromJSON; 
CutDirectedLineEdgeGraphFormatter.prototype._setEvents = EdgeGraphFormatter.prototype._setEvents; 

function CutDirectedLineEdgeGraphFormatter(id, defaultFormat, selectedFormat, overFormat, dragginFormat){
	EdgeGraphFormatter.prototype.constructor.call(this, id, defaultFormat, selectedFormat, overFormat, dragginFormat);
	this.args.type = "CutDirectedLineEdgeGraphFormatter";
};




BezierEdgeGraphFormatter.prototype.setProperties = EdgeGraphFormatter.prototype.setProperties;
BezierEdgeGraphFormatter.prototype.setProperties = EdgeGraphFormatter.prototype.setProperties;
BezierEdgeGraphFormatter.prototype.getDefault = EdgeGraphFormatter.prototype.getDefault;
BezierEdgeGraphFormatter.prototype.getSelected = EdgeGraphFormatter.prototype.getSelected;
BezierEdgeGraphFormatter.prototype.getOver = EdgeGraphFormatter.prototype.getOver;
BezierEdgeGraphFormatter.prototype.getDragging = EdgeGraphFormatter.prototype.getDragging; 
BezierEdgeGraphFormatter.prototype.getId = EdgeGraphFormatter.prototype.getId; 
BezierEdgeGraphFormatter.prototype.toJSON = EdgeGraphFormatter.prototype.toJSON; 
BezierEdgeGraphFormatter.prototype.loadFromJSON = EdgeGraphFormatter.prototype.loadFromJSON; 
BezierEdgeGraphFormatter.prototype._setEvents = EdgeGraphFormatter.prototype._setEvents; 

function BezierEdgeGraphFormatter(id, defaultFormat, selectedFormat, overFormat, dragginFormat){
	EdgeGraphFormatter.prototype.constructor.call(this, id, defaultFormat, selectedFormat, overFormat, dragginFormat);
	this.args.type = "BezierEdgeGraphFormatter";
};



DotDirectedLineEdgeGraphFormatter.prototype.setProperties = EdgeGraphFormatter.prototype.setProperties;
DotDirectedLineEdgeGraphFormatter.prototype.getDefault = EdgeGraphFormatter.prototype.getDefault;
DotDirectedLineEdgeGraphFormatter.prototype.getSelected = EdgeGraphFormatter.prototype.getSelected;
DotDirectedLineEdgeGraphFormatter.prototype.getOver = EdgeGraphFormatter.prototype.getOver;
DotDirectedLineEdgeGraphFormatter.prototype.getDragging = EdgeGraphFormatter.prototype.getDragging; 
DotDirectedLineEdgeGraphFormatter.prototype.getId = EdgeGraphFormatter.prototype.getId; 
DotDirectedLineEdgeGraphFormatter.prototype.toJSON = EdgeGraphFormatter.prototype.toJSON; 
DotDirectedLineEdgeGraphFormatter.prototype.loadFromJSON = EdgeGraphFormatter.prototype.loadFromJSON; 
DotDirectedLineEdgeGraphFormatter.prototype._setEvents = EdgeGraphFormatter.prototype._setEvents; 

function DotDirectedLineEdgeGraphFormatter(id, defaultFormat, selectedFormat, overFormat, dragginFormat){
	EdgeGraphFormatter.prototype.constructor.call(this, id, defaultFormat, selectedFormat, overFormat, dragginFormat);
	this.args.type = "DotDirectedLineEdgeGraphFormatter";
};


OdotDirectedLineEdgeGraphFormatter.prototype.setProperties = EdgeGraphFormatter.prototype.setProperties;
OdotDirectedLineEdgeGraphFormatter.prototype.getDefault = EdgeGraphFormatter.prototype.getDefault;
OdotDirectedLineEdgeGraphFormatter.prototype.getSelected = EdgeGraphFormatter.prototype.getSelected;
OdotDirectedLineEdgeGraphFormatter.prototype.getOver = EdgeGraphFormatter.prototype.getOver;
OdotDirectedLineEdgeGraphFormatter.prototype.getDragging = EdgeGraphFormatter.prototype.getDragging; 
OdotDirectedLineEdgeGraphFormatter.prototype.getId = EdgeGraphFormatter.prototype.getId; 
OdotDirectedLineEdgeGraphFormatter.prototype.toJSON = EdgeGraphFormatter.prototype.toJSON; 
OdotDirectedLineEdgeGraphFormatter.prototype.loadFromJSON = EdgeGraphFormatter.prototype.loadFromJSON; 
OdotDirectedLineEdgeGraphFormatter.prototype._setEvents = EdgeGraphFormatter.prototype._setEvents; 

function OdotDirectedLineEdgeGraphFormatter(id, defaultFormat, selectedFormat, overFormat, dragginFormat){
	EdgeGraphFormatter.prototype.constructor.call(this, id, defaultFormat, selectedFormat, overFormat, dragginFormat);
	this.args.type = "OdotDirectedLineEdgeGraphFormatter";
};



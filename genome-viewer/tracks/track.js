// JavaScript Document
function Track(trackerID, targetNode,  args) {
	this.args = args;
	
	/** Groups and layers */
	this.trackNodeGroup = null;
	this.mainNodeGroup = null;
	this.labelNodeGroup = null;
	
	this.internalId = Math.round(Math.random()*10000000); // internal id for this class
	
	/** target */
    if(targetNode != null){
            this.targetID = targetNode.id;
    }

	
    
	/** Coordenates with default Setting */
	this.top = 0;
	this.left = 100;
	this.right = 900;
	this.width = 1100;
	this.height = 50;
	this.originalTop = this.top;
	this.originalHeight = this.height;
	
	/** Max height para los tracks que aunmentan el height dinamicamente cargando las features **/
	this.maxHeight = this.height;
	
	/** real start and end */
	if (args != null){
		this.start = args.start;
		this.end = args.end;
	}
	else{
		this.start = 0;
	}

	/** pixelPerposition **/
	this.pixelRatio = 5; /** it means 1 position it is represented using 5 pixels **/
	
	/** Optional parameters */
	this.backgroundColor = "#FFFFFF";
	this.titleColor = "#000000";
	this.overflow = false;
	
	/** Optional parameters: title */
	this.title  = null;
	this.titleName = null;
	this.titleFontSize = 10;
	this.titleWidth = 50;
	this.titleHeight = 12;
	this.floating = false;
	this.repeatLabel = null; /** es un float que indica cada cuantos pixeles se va a repetir la label sobre el track **/
	
	this.isAvalaible = true; /** Si el track no puede mostrarse a cierta resolucion isAvalaible pasa a ser falso y dibujariamos solamnente el titulo**/
	this.isNotAvalaibleMessage = "This level of zoom isn't appropiate for this track";
	
	
	this.labelFontSize = null;
	
	/** Processing optional parameters */
	if (args!=null){
		if (args.left!=null){
			this.left = args.left;		
		}
		
		if (args.top!=null){
			this.top = args.top;	
			this.originalTop = this.top;
		}
		if (args.left!=null){
			this.left = args.left;		
		}
		
		if (args.right!=null){
			this.right = args.right;		
		}
		if (args.width!=null){
			this.width = args.width;		
		}
		if (args.floating!=null){
			this.floating = args.floating;		
		}
		if (args.height!=null){
			this.height = args.height;	
			this.originalHeight = args.height;
			this.maxHeight = args.height;
		}
		if (args.backgroundColor!=null){
			this.backgroundColor = args.backgroundColor;		
		}
		
		if (args.titleWidth!=null){
			this.titleWidth = args.titleWidth;		
		}
		if (args.titleFontSize!=null){
			this.titleFontSize = args.titleFontSize;		
		}
		if (args.titleHeight!=null){
			this.titleHeight = args.titleHeight;		
		}
		if (args.titleColor != null){
			this.titleColor = args.titleColor;	
		}
		if (args.title != null){
			this.title = true;
			this.titleName = args.title;
		}
		if (args.overflow != null){
			this.overflow = args.overflow;
		}
		if (args.pixelRatio != null){
			this.pixelRatio = args.pixelRatio;
		}
		if (args.labelFontSize != null){
			this.labelFontSize = args.labelFontSize;
		}
		
		if (args.repeatLabel != null){
			this.repeatLabel = args.repeatLabel;
		}
		
		if (args.isAvalaible!=null){
			this.isAvalaible = args.isAvalaible;		
		}
		if (args.isNotAvalaibleMessage!=null){
			this.isNotAvalaibleMessage = args.isNotAvalaibleMessage;		
		}
	}
	
	/** id manage */
	this.id = trackerID;	
	this.idTrack = this.id + "_Features";
	this.idNames = this.id + "_Names";
	this.idMain = this.id + "_Main";
	this.idBackground = this.id + "_background";
	this.idTitleGroup = this.id + "_title_group";
	/** Events */
	this.click = new Event(this);
	
};

//Track.prototype._getViewBoxCoordenates = function() {
//	return 0 +" " +  "10 " + this.width + " " + this.height;
//};
//
//Track.prototype._goToCoordinate = function(start) {
//	var viewBox =   (start * this.pixelRatio) +" " +  "10 " + this.width + " " + this.height;
//	this._svg.setAttribute("viewBox", viewBox);108,447,501

//};

Track.prototype._getViewBoxCoordenates  = function(id, width, height, backgroundColor ) {
	return "0 10 " + this.width  + " " + this.height;
};

Track.prototype.createSVGDom = function(id, width, height, backgroundColor ) {
	/** Si es null es porque estamos usando el track en modo standalone sin trackCanvas **/
	if (this._svg == null){
		this._svg = SVG.createSVGCanvas(DOM.select(this.targetID), [["viewBox", this._getViewBoxCoordenates()],["preserveAspectRatio", "none"],["id", id], ["height", this.height], ["width", this.width]]);
	}
	
	/** Creating groupds **/
	this.mainNodeGroup = SVG.drawGroup(this._svg, [["id", this.idMain]]);
	this.backgroundNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idBackground]]);
	this.trackNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idTrack]]);
	this.labelNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idNames]]);
	this.titleNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idTitleGroup]]);
	
	/** background rectangle for giving colors **/
//	var rect = SVG.drawRectangle(0, this.top, this.width , this.height, this.backgroundNodeGroup, [["fill", backgroundColor],[id, id + "_background"]]);
	this.drawBackground();
	return this._svg;
};

Track.prototype.drawBackground = function() {
//	var rect = SVG.drawRectangle(0, this.top, this.width , this.height, this.backgroundNodeGroup, [["fill", this.backgroundColor],[id, id + "_background"]]);
//	this.backgroundNode =  SVG.drawRectangle(0, this.top, this.viewBoxModule , this.height, this.backgroundNodeGroup, [["stroke", "#000000"],["opacity", 0.5],["fill", this.backgroundColor],[id, id + "_background"]]);
};

Track.prototype.getBackgroundNode = function() {
	return this.backgroundNode;
};


Track.prototype.init = function(){
	this._svg = this.createSVGDom(this.id, this.width, this.height, this.backgroundColor);
	
	/** SVG Events listener */
	var _this = this;

};

Track.prototype.clear = function(){
	if(this.mainNodeGroup != null){
		 while (this.mainNodeGroup.childNodes.length>0){
		 	this.mainNodeGroup.removeChild(this.mainNodeGroup.childNodes[0]);
	    }
	}
};

/** SVG COORDENATES **/
Track.prototype._getSVGCoordenates = function(evt){
	var p = this._svg.createSVGPoint();
    p.x = evt.clientX;
    p.y = evt.clientY;
    
    var m = this._svg.getScreenCTM(document.documentElement);
    p = p.matrixTransform(m.inverse());
    return p;
};


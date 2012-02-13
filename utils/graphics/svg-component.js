function SVGComponent (componentID, targetNode,  args) {

	/** Groups and layers */
	this.SVGComponentNodeGroup = null;
	this.mainNodeGroup = null;
	this.labelNodeGroup = null;
	
	/** target */
	this.targetID = targetNode.id;
	
	/** Coordenates with default Setting */
	this.bottom = 30;
	this.top = 0;
	this.left = 100;
	this.right = 900;
	this.width = 1100;
	this.height = 50;
	this.svgHeight = this.height;
	
	
	
	/** Optional parameters */
	this.backgroundColor = "#FFFFFF";
	this.titleColor = "#000000";
	this.overflow = false;
	
	/** Optional parameters: title */
	this.title  = false;
	this.titleName = null;
	this.titleFontSize = 10;
	
	/** Processing optional parameters */
	if (args!=null){
		if (args.bottom!=null){
			this.bottom = args.bottom;		
		}
		if (args.top!=null){
			this.top = args.top;		
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
		if (args.height!=null){
			this.height = args.height;	
			this.svgHeight = args.height;		
		}
		if (args.svgHeight!=null){
			this.svgHeight = args.svgHeight;		
		}
		
		if (args.backgroundColor!=null){
			this.backgroundColor = args.backgroundColor;		
		}
		if (args.titleFontSize!=null){
			this.titleFontSize = args.titleFontSize;		
		}
		if (args.titleColor!=null){
			this.titleColor = args.titleColor;	
		}
		if (args.title!=null){
			this.title = true;
			this.titleName = args.title;
		}
		if (args.overflow!=null){
			this.overflow = args.overflow;
		}
	}
	
	/** id manage */
	this.id = SVGComponenterID;	
	this.idSVGComponent = this.id + "_Features";
	this.namesID = this.id + "_Names";
	this.idMain = this.id + "_Main";
	
	/** Events */
	this.click = new Event(this);
	
};




SVGComponent.prototype.createSVGDom = function(targetID, id, width, height, backgroundColor ) {
	var container = document.getElementById(targetID);
	if (this.overflow){
		container.setAttribute("overflow-y", "auto");
	}
	
	this._svg = SVG.createSVGCanvas(container, [["id", id], ["height", this.svgHeight], ["width", this.right]]);
	var rect = SVG.drawRectangle(this.left, 0, this.right - this.left , this.svgHeight, this._svg, [["fill", backgroundColor],[id, id + "_background"]]);
	
	return this._svg;
};



SVGComponent.prototype.mouseClick = function(event){};
SVGComponent.prototype.mouseMove = function(event){};
SVGComponent.prototype.mouseDown = function(event){};
SVGComponent.prototype.mouseUp = function(event){};


SVGComponent.prototype.init = function(){
	this._svg = this.createSVGDom(this.targetID, this.id, this.width, this.height, this.backgroundColor);
	this.mainNodeGroup = SVG.drawGroup(this._svg, [["id", this.idMain]]);
	this.SVGComponentNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idSVGComponent]]);
	this.labelNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idLabels]]);
	
	/** SVG Events listener */
	var _this = this;
	this._svg.addEventListener("click", function(event) {_this.mouseClick(event); }, false);
    this._svg.addEventListener("mousemove", function(event) { _this.mouseMove(event, _this); }, false);
    this._svg.addEventListener("mousedown", function(event) { _this.mouseDown(event, _this); }, false);
    this._svg.addEventListener("mouseup", function(event) { _this.mouseUp(event, _this); }, false);

};

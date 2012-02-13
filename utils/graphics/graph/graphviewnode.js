function GraphViewNode(graphView, node, coordenates, size, color, shape, opacity, noseStrokeWidth) {
	
   this.node = node;
   this._graphView = graphView;
   	this.cx = Math.ceil(coordenates[0]);
   	this.cy = Math.ceil(coordenates[1]);
   	
   
   this.r = size;

   this.color = "black";
   if (color!=null){
	   	this.color = color;   
   }
   this.size= size;
   this.shape = "ci";
   
   if (shape!=null){
		this.shape=shape;   
   }

   this.opacity = opacity;
   this.svgNode = null;
   this.svgLabel = null;

   this.noseStrokeWidth = "1";
   if (noseStrokeWidth!=null){
	   	this.noseStrokeWidth = noseStrokeWidth;   
  }
   this.over = new Event(this);
   this.mouseout = new Event(this);
   this.mousedown = new Event(this);
   this.mouseup = new Event(this);
   this.click = new Event(this);
   this.dblclick = new Event(this);
   this.moving = new Event(this);


     //Attributes for dragging and grop
    this.TrueCoords = null;
    this.GrabPoint = null;

    this.targetElement = null;
   
};

GraphViewNode.prototype = {

    getRadio: function(){
		return this._graphView._controller.getNodeSize(this.node.getId());
    },
    
    render : function (svg){
			this.svg = svg;
			if (this.shape == 'sq'){
	            var lado = this.r*2;
	            var posX = this.cx - this.r;
	            var posY = this.cy - this.r;
	            var attributes = [['id', this.node.id], ['class', 'NODE'],['fill', this.color],['z-index','10'], ['opacity', this.opacity], ['x', posX], ['y', posY], ['width', lado], ['height', lado], ['stroke', 'black' ], ['stroke-width',  this.noseStrokeWidth]];
	            this.svgNode = SVG.drawRectangle(posX, posY, lado, lado, this.getCanvas(), attributes);
	        }
	        
	        if (this.shape == 'ci'){
	            var attributes = [['id', this.node.id], ['class', 'NODE'],['fill', this.color],['z-index','10'], ['opacity', this.opacity],  ['stroke', 'black' ], ['stroke-width',  this.noseStrokeWidth]];
	            this.svgNode = SVG.drawCircle(this.cx, this.cy, this.r, this.getCanvas(), attributes);
	            //SVG.drawCircle(this.cx, this.cy, this.r, this.getCanvas(), attributes);
	            
	        }
	        this.attachEvents(document.getElementById(this.node.id));
	       
    },
    
    renderLabel : function (){
    	var x = this.cx-this.r;
    	var y = 0;
    	
    	if (this.shape == 'ci'){
    		y = parseFloat(this.cy)+parseFloat(this.r)+10;
		}
    	if (this.shape == 'sq'){
    		y = parseFloat(this.cy)+parseFloat(this.r)+17;
        }

    	this.svgLabel = SVG.drawText(x, y, this.node.title,  this.getLabelCanvas(), [['opacity', this.opacity],["id", "label_" + this.node.id],["font-size", "10"],["class", "label"]]);
    	return this.svgLabel;
    	
    	//drawText(x, y, this.node.id,  this.getLabelCanvas(), [["id", "label_" + this.node.id],["font-size", "10"],["class", "label"],["pointers", "none"],['opacity', this.opacity]]);
        
			
    },
    
    clearLabel : function ( ){

    	if (this.svgLabel!=null){
    		this._graphView.clearLabel("label_" + this.node.id);
    		
    	}
    	
    },
    
    init : function(){
		this.TrueCoords = this.svg.createSVGPoint();
		this.GrabPoint = this.svg.createSVGPoint();
    },
    
    getCanvas : function(){
	for (j=0; j<this.svg.childNodes.length; j++){
		if (this.svg.childNodes[j].id == "canvas"){
			  return ( this.svg.childNodes[j]);
		}	
	}
    },
    
    getLabelCanvas : function(){
	for (j=0; j<this.svg.childNodes.length; j++){
		if (this.svg.childNodes[j].id == "labels"){
			  return ( this.svg.childNodes[j]);
		}	
	}
    },
    
    attachEvents : function(object){
	var _this = this;
	object.onclick = (function (evt) {
		_this._graphView.selectedNodeEvent(evt.target.id);
	});
	
	object.ondblclick = (function (evt){
		_this._graphView.selectedNode = evt.target.id;
		_this._graphView._controller.nodeDblClicked(evt.target.id);    
	});
	
	/*object.onmouseover = (function (evt) {
	      document.getElementById( evt.target.id).setAttribute("stroke", "white");
	      document.getElementById( evt.target.id).setAttribute("cursor", "pointer");
	});*/
    }
};

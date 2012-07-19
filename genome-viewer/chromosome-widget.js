function ChromosomeWidget(parent, args) {
	
	this.id = Math.round(Math.random()*10000000);
	if(args != null){
		if(args.width != null){
			this.width = args.width;
		}
		if(args.height != null){
			this.height = args.height;
		}
		if(args.species != null){
			this.species = args.species;
		}
		if(args.chromosome != null){
			this.chromosome = args.chromosome;
		}
		if(args.zoom != null){
			this.zoom = args.zoom;
		}
		if(args.position != null){
			this.position = args.position;
		}
	}

	this._createPixelsbyBase();//create pixelByBase array
	this.tracksViewedRegion = this.width/this._getPixelsbyBase(this.zoom);
	
	this.onClick = new Event();
	
	this.svg = SVG.init(parent,{
		"width":this.width,
		"height":this.height
	});
	
	this.colors = {gneg:"white", stalk:"#666666", gvar:"#CCCCCC", gpos25:"silver", gpos33:"lightgrey", gpos50:"gray", gpos66:"dimgray", gpos75:"darkgray", gpos100:"black", gpos:"gray", acen:"blue"};
	
	this.data = null;
};

ChromosomeWidget.prototype.setWidth = function(width){
	this.width=width;
	this.svg.setAttribute("width",width);
	this.tracksViewedRegion = width/this._getPixelsbyBase(this.zoom);
	while (this.svg.firstChild) {
		this.svg.removeChild(this.svg.firstChild);
	}
	this._drawSvg(this.data);
};

ChromosomeWidget.prototype.drawChromosome = function(){
	var _this = this;
	
	var cellBaseManager = new CellBaseManager(this.species);
 	cellBaseManager.success.addEventListener(function(sender,data){
 		_this.data = data;
 		_this._drawSvg(data);
 	});
 	cellBaseManager.get("genomic", "region", this.chromosome,"cytoband");
};
ChromosomeWidget.prototype._drawSvg = function(data){
	var _this = this;
	
	_this.pixelBase = (_this.width -40) / data.result[0][data.result[0].length-1].end;
	var x = 20;
	var y = 10;
	var firstCentromere = true;

	var offset = 20;
	var pointerPosition = (_this.position * _this.pixelBase) + offset;

	var group = SVG.addChild(_this.svg,"g",{"cursor":"pointer"});
	$(group).click(function(event){
		var clickPosition = parseInt((event.clientX - offset)/_this.pixelBase);
		var positionBoxWidth = parseFloat(_this.positionBox.getAttribute("width"));

		_this.positionBox.setAttribute("x",event.clientX-(positionBoxWidth/2));
		_this.onClick.notify(clickPosition);
	});

	for (var i = 0; i < data.result[0].length; i++) {
		var width = _this.pixelBase * (data.result[0][i].end - data.result[0][i].start);
		var height = 18;
		var color = _this.colors[data.result[0][i].stain];
		if(color == null) color = "purple";
		var cytoband = data.result[0][i].cytoband;
		var middleX = x+width/2;
		var endY = y+height;

		if(data.result[0][i].stain == "acen"){
			var points = "";
			var middleY = y+height/2;
			var endX = x+width;
			if(firstCentromere){
				points = x+","+y+" "+middleX+","+y+" "+endX+","+middleY+" "+middleX+","+endY+" "+x+","+endY;
				firstCentromere = false;
			}else{
				points = x+","+middleY+" "+middleX+","+y+" "+endX+","+y+" "+endX+","+endY+" "+middleX+","+endY;
			}
			SVG.addChild(group,"polyline",{
				"points":points,
				"stroke":"black",
				"opacity":0.8,
				"fill":color
			});
		}else{
			SVG.addChild(group,"rect",{
				"x":x,
				"y":y,
				"width":width,
				"height":height,
				"stroke":"black",
				"opacity":0.8,
				"fill":color
			});
		}

		var textY = endY+2;
		var text = SVG.addChild(_this.svg,"text",{
			"x":middleX,
			"y":textY,
			"font-size":10,
			"transform": "rotate(90, "+middleX+", "+textY+")",
			"fill":"black"
		});
		text.textContent = cytoband;

		x = x + width;
	}

	var positionBoxWidth = _this.tracksViewedRegion*_this.pixelBase;
	_this.positionBox = SVG.addChild(group,"rect",{
		"x":pointerPosition-(positionBoxWidth/2),
		"y":2,
		"width":positionBoxWidth,
		"height":_this.height-2,
		"stroke":"orangered",
		"stroke-width":2,
		"opacity":0.5,
		"fill":"orange"
	});
};


ChromosomeWidget.prototype.setLocation = function(item){//item.chromosome, item.position, item.species
	var needDraw = false;
	if(item.species!=null){
		this.species = item.species;
		needDraw = true;
	}
	if(item.chromosome!=null){
		this.chromosome = item.chromosome;
		needDraw = true;
	}
	if(item.position!=null){
		this.position = item.position;

		var pointerPosition = this.position*this.pixelBase+20;
		var positionBoxWidth = parseFloat(this.positionBox.getAttribute("width"));
		this.positionBox.setAttribute("x",pointerPosition-(positionBoxWidth/2));
	}
	if(needDraw){
//		$(this.svg).empty();
		while (this.svg.firstChild) {
			this.svg.removeChild(this.svg.firstChild);
		}
		this.drawChromosome();
	}
};

ChromosomeWidget.prototype.setZoom = function(zoom){
	this.zoom=zoom;
	this.tracksViewedRegion = this.width/this._getPixelsbyBase(this.zoom);
	var width = this.tracksViewedRegion*this.pixelBase;
	this.positionBox.setAttribute("width",width);
	var pointerPosition = this.position*this.pixelBase+20;
	this.positionBox.setAttribute("x",pointerPosition-(width/2));
};

ChromosomeWidget.prototype._getPixelsbyBase = function(zoom){
	return this.zoomLevels[zoom];
};

ChromosomeWidget.prototype._createPixelsbyBase = function(){
	this.zoomLevels = new Array();
	var pixelsByBase = 10;
	for ( var i = 100; i >= -40; i-=5) {
		this.zoomLevels[i] = pixelsByBase;
		pixelsByBase = pixelsByBase / 2;
	}
};

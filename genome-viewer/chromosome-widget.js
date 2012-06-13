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

//	this.zoom = 20;
	this._createPixelsbyBase();//create pixelByBase array
	this.tracksViewedRegion = this.width/this._getPixelsbyBase(this.zoom);
	
	this.onClick = new Event();
	
	this.svg = SVG.init(parent,{
		"width":this.width,
		"height":this.height
	});
	
};

ChromosomeWidget.prototype.setLocation = function(item){//item.chromosome, item.position, item.species
	this.positionBox.setAttribute("x",item.position*this.pixelBase);
};

ChromosomeWidget.prototype.setZoom = function(zoom){
	console.log("setting zoom")
	this.zoom=zoom;
	this.tracksViewedRegion = this.width/this._getPixelsbyBase(this.zoom);
	this.positionBox.setAttribute("width",this.tracksViewedRegion*this.pixelBase);
};


ChromosomeWidget.prototype.drawHorizontal = function(){
	var _this = this;

	var colors = {gneg:"white", stalk:"#666666", gvar:"#CCCCCC", gpos25:"silver", gpos33:"lightgrey", gpos50:"gray", gpos66:"dimgray", gpos75:"darkgray", gpos100:"black", gpos:"gray", acen:"blue"};
	
	var cellBaseManager = new CellBaseManager(this.species);
 	cellBaseManager.success.addEventListener(function(sender,data){
 		_this.pixelBase = (_this.width -40) / data.result[0][data.result[0].length-1].end;
 		var x = 20;
 		var y = 10;
 		var firstCentromero = true;
 		
 		var offset = 20;
 		var pointerPosition = (_this.position * _this.pixelBase) + offset;

 		
//		var cp = SVG.addChild(svg,"clipPath",{
//			"id":"chromosomecp"
//		});
//		SVG.addChild(cp,"rect",{
//			"rx":"4",
//			"ry":"4",
//			"x":20,
//			"y":20,
//			"width":_this.width,
//			"height":18
//		});
		
// 		var rect = SVG.addChild(svg,"rect",{
////			"rx":"4",
////			"ry":"4",
//			"x":20,
//			"y":0,
//			"width":_this.width-40,
//			"fill":"transparent",
////			"clip-path":"url(#chromosomecp)",
//			"height":18
//		});
 		
 		var group = SVG.addChild(_this.svg,"g",{});
		
		$(group).click(function(event){
			clickPosition = parseInt((event.clientX - offset)/_this.pixelBase);
			
			_this.onClick.notify(clickPosition);
		});
		
		for (var i = 0; i < data.result[0].length; i++) {
//			console.log(data.result[0][i])
			var width = _this.pixelBase * (data.result[0][i].end - data.result[0][i].start);
			var height = 18;
			var color = colors[data.result[0][i].stain];
			if(color == null) color = "purple";
			var cytoband = data.result[0][i].cytoband;
			var middleX = x+width/2;
			var endY = y+height;
			
			if(data.result[0][i].stain == "acen"){
				var points = "";
				var middleY = y+height/2;
				var endX = x+width;
				if(firstCentromero){
					points = x+","+y+" "+middleX+","+y+" "+endX+","+middleY+" "+middleX+","+endY+" "+x+","+endY;
					firstCentromero = false;
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
//					"rx":"4",
//					"ry":"4",
					"x":x,
					"y":y,
					"width":width,
					"height":height,
					"stroke":"black",
					"opacity":0.8,
					"fill":color
				});
//				var p = function (x,y){
//					return x+" "+y+" ";
//				};
//
//				var w=width;
//				var h=height;
//				var r1=10;
//				var r2=0;
//				var r3=0;
//				var r4=10;
//				var strPath = "M"+p(x+r1,y); //A
//				  strPath+="L"+p(x+w-r2,y)+"Q"+p(x+w,y)+p(x+w,y+r2); //B
//				  strPath+="L"+p(x+w,y+h-r3)+"Q"+p(x+w,y+h)+p(x+w-r3,y+h); //C
//				  strPath+="L"+p(x+r4,y+h)+"Q"+p(x,y+h)+p(x,y+h-r4); //D
//				  strPath+="L"+p(x,y+r1)+"Q"+p(x,y)+p(x+r1,y); //A
//				  strPath+="Z";
//				SVG.addChild(svg,"path",{
//					"d":strPath,
//					"stroke":"black",
//					"opacity":0.8,
//					"fill":color
//				});
				
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
		
 		_this.positionBox = SVG.addChild(group,"rect",{
 			"x":pointerPosition,
			"y":2,
			"width":_this.tracksViewedRegion*_this.pixelBase,
			"height":_this.height-2,
			"stroke":"black",
			"opacity":0.3,
 			"fill":"red"
 		});
 	});
 	cellBaseManager.get("genomic", "region", this.chromosome+":1-260000000","cytoband");
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

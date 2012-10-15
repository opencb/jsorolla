/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

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
		if(args.region != null){
			this.region = args.region;
		}
		if(args.zoom != null){
			this.zoom = args.zoom;
		}
	}

	this.lastChromosome = "";

	this.tracksViewedRegion = this.width/Compbio.getPixelBaseByZoom(this.zoom);
	
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
 	cellBaseManager.get("genomic", "region", this.region.chromosome,"cytoband");
 	this.lastChromosome = this.region.chromosome;
};
ChromosomeWidget.prototype._drawSvg = function(data){
	var _this = this;
	
	_this.pixelBase = (_this.width -40) / data.result[0][data.result[0].length-1].end;
	var x = 20;
	var y = 10;
	var firstCentromere = true;

	var offset = 20;
	var centerPosition = Compbio.centerPosition(_this.region);
	
	var pointerPosition = (centerPosition * _this.pixelBase) + offset;

	var group = SVG.addChild(_this.svg,"g",{"cursor":"pointer"});
	$(group).click(function(event){
		var clickPosition = parseInt((event.clientX - offset)/_this.pixelBase);
		var positionBoxWidth = parseFloat(_this.positionBox.getAttribute("width"));

		_this.positionBox.setAttribute("x",event.clientX-(positionBoxWidth/2));

		_this.region.start = clickPosition;
		_this.region.end = clickPosition;
		_this.onClick.notify(_this.region);
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


ChromosomeWidget.prototype.setRegion = function(item){//item.chromosome, item.region
	var needDraw = false;
	if(item.species!=null){
		this.species = item.species;
		needDraw = true;
	}
	if(this.lastChromosome != this.region.chromosome){
		needDraw = true;
	}
	
	var centerPosition = Compbio.centerPosition(this.region);
	if(!isNaN(centerPosition)){
		var pointerPosition = centerPosition*this.pixelBase+20;
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
	this.tracksViewedRegion = this.width/Compbio.getPixelBaseByZoom(this.zoom);
	var width = this.tracksViewedRegion*this.pixelBase;
	this.positionBox.setAttribute("width",width);

	var centerPosition = Compbio.centerPosition(this.region);
	var pointerPosition = centerPosition*this.pixelBase+20;
	this.positionBox.setAttribute("x",pointerPosition-(width/2));
};

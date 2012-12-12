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

function KaryotypeWidget(parent, args) {
	
	this.parent = parent;
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
	}

	this.onClick = new Event();
	this.afterRender = new Event();
	
	this.rendered=false;
	
	this.svg = SVG.init(parent,{
		"width":this.width,
		"height":this.height
	});
	this.markGroup = SVG.addChild(this.svg,"g",{"cursor":"pointer"});
	
	this.colors = {gneg:"white", stalk:"#666666", gvar:"#CCCCCC", gpos25:"silver", gpos33:"lightgrey", gpos50:"gray", gpos66:"dimgray", gpos75:"darkgray", gpos100:"black", gpos:"gray", acen:"blue"};

	this.chromosomeList = null;
	this.data2 = null;
};

KaryotypeWidget.prototype.setWidth = function(width){
	this.width=width;
	this.svg.setAttribute("width",width);
	while (this.svg.firstChild) {
		this.svg.removeChild(this.svg.firstChild);
	}
	this._drawSvg(this.chromosomeList,this.data2);
};

KaryotypeWidget.prototype.drawKaryotype = function(){
	var _this = this;

	var sortfunction = function(a, b) {
		var IsNumber = true;
		for (var i = 0; i < a.length && IsNumber == true; i++) {
			if (isNaN(a[i])) {
				IsNumber = false;
			}
		}
		if (!IsNumber) return 1;
		return (a - b);
	};
	
	var cellBaseManager = new CellBaseManager(this.species);
 	cellBaseManager.success.addEventListener(function(sender,data){
 		_this.chromosomeList = data.result;
 		_this.chromosomeList.sort(sortfunction);
 		var cellBaseManager2 = new CellBaseManager(_this.species);
 		cellBaseManager2.success.addEventListener(function(sender,data2){
 			_this.data2 = data2;
 			_this._drawSvg(_this.chromosomeList,data2);
 		});
 		cellBaseManager2.get("genomic", "region", _this.chromosomeList.toString(),"cytoband");
 	});
 	cellBaseManager.get("feature", "karyotype", "none", "chromosome");
	
};
KaryotypeWidget.prototype._drawSvg = function(chromosomeList, data2){
	var _this = this;

	var x = 20;
	var xOffset = _this.width/chromosomeList.length;
	var yMargin = 2;

	///////////
	var biggerChr = 0;
	for(var i=0, len=chromosomeList.length; i<len; i++){
		var size = data2.result[i][data2.result[i].length-1].end;
		if(size > biggerChr) biggerChr = size;
	}
	_this.pixelBase = (_this.height - 10) / biggerChr;
	_this.chrOffsetY = {};
	_this.chrOffsetX = {};

	for(var i=0, len=chromosomeList.length; i<len; i++){ //loop over chromosomes
		var chr = data2.result[i][0].chromosome;
		chrSize = data2.result[i][data2.result[i].length-1].end * _this.pixelBase;
		var y = yMargin + (biggerChr * _this.pixelBase) - chrSize;
		_this.chrOffsetY[chr] = y;
		var firstCentromere = true;
		
		var centerPosition = _this.region.center();
		var pointerPosition = (centerPosition * _this.pixelBase);

		var group = SVG.addChild(_this.svg,"g",{"cursor":"pointer","chr":chromosomeList[i]});
		$(group).click(function(event){
			var chrClicked = this.getAttribute("chr");
//			for ( var k=0, len=chromosomeList.length; k<len; k++) {
//			var offsetX = (event.pageX - $(_this.svg).offset().left);
//			if(offsetX > _this.chrOffsetX[chromosomeList[k]]) chrClicked = chromosomeList[k];
//			}

			var offsetY = (event.pageY - $(_this.svg).offset().top);
//			var offsetY = event.originalEvent.layerY - 3;

			_this.positionBox.setAttribute("x1",_this.chrOffsetX[chrClicked]-10);
			_this.positionBox.setAttribute("x2",_this.chrOffsetX[chrClicked]+23);
			_this.positionBox.setAttribute("y1",offsetY);
			_this.positionBox.setAttribute("y2",offsetY);

			var clickPosition = parseInt((offsetY - _this.chrOffsetY[chrClicked])/_this.pixelBase);
			_this.region.chromosome = chrClicked;
			_this.region.start = clickPosition;
			_this.region.end = clickPosition;
			
			_this.onClick.notify(_this.region);
		});

		for ( var j=0, lenJ=data2.result[i].length; j<lenJ; j++){ //loop over chromosome objects
			var height = _this.pixelBase * (data2.result[i][j].end - data2.result[i][j].start);
			var width = 13;

			var color = _this.colors[data2.result[i][j].stain];
			if(color == null) color = "purple";

			if(data2.result[i][j].stain == "acen"){
				var points = "";
				var middleX = x+width/2;
				var middleY = y+height/2;
				var endX = x+width;
				var endY = y+height;
				if(firstCentromere){
					points = x+","+y+" "+endX+","+y+" "+endX+","+middleY+" "+middleX+","+endY+" "+x+","+middleY;
					firstCentromere = false;
				}else{
					points = x+","+endY+" "+x+","+middleY+" "+middleX+","+y+" "+endX+","+middleY+" "+endX+","+endY;
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
					"stroke":"grey",
					"opacity":0.8,
					"fill":color
				});
			}

			y += height;
		}
		var text = SVG.addChild(_this.svg,"text",{
			"x":x+1,
			"y":_this.height,
			"font-size":9,
			"fill":"black"
		});
		text.textContent = chr;

		_this.chrOffsetX[chr] = x;
		x += xOffset;
	}
	_this.positionBox = SVG.addChild(_this.svg,"line",{
		"x1":_this.chrOffsetX[_this.region.chromosome]-10,
		"y1":pointerPosition + _this.chrOffsetY[_this.region.chromosome],
		"x2":_this.chrOffsetX[_this.region.chromosome]+23,
		"y2":pointerPosition + _this.chrOffsetY[_this.region.chromosome],
		"stroke":"orangered",
		"stroke-width":2,
		"opacity":0.5
	});

	_this.rendered=true;
	_this.afterRender.notify();
};


KaryotypeWidget.prototype.setRegion = function(item){//item.chromosome, item.position, item.species
	var needDraw = false;
	if(item.species!=null){
		this.species = item.species;
		needDraw = true;
	}
	if(item.species==null){
		this.positionBox.setAttribute("x1",this.chrOffsetX[this.region.chromosome]-10);
		this.positionBox.setAttribute("x2",this.chrOffsetX[this.region.chromosome]+23);
	}
	
	var centerPosition = this.region.center();
	if(!isNaN(centerPosition)){
		if(item.species==null){
			var pointerPosition = centerPosition * this.pixelBase + this.chrOffsetY[this.region.chromosome];
			this.positionBox.setAttribute("y1", pointerPosition);
			this.positionBox.setAttribute("y2", pointerPosition);
		}
	}
	if(needDraw){
//		$(this.svg).empty();
		while (this.svg.firstChild) {
			this.svg.removeChild(this.svg.firstChild);
		}
		this.drawKaryotype();
	}
};


KaryotypeWidget.prototype.updatePositionBox = function(){
	this.positionBox.setAttribute("x1",this.chrOffsetX[this.region.chromosome]-10);
	this.positionBox.setAttribute("x2",this.chrOffsetX[this.region.chromosome]+23);

	var centerPosition = Compbio.centerPosition(this.region);
	var pointerPosition = centerPosition * this.pixelBase + this.chrOffsetY[this.region.chromosome];
	this.positionBox.setAttribute("y1",pointerPosition);
	this.positionBox.setAttribute("y2",pointerPosition);
};	
	
KaryotypeWidget.prototype.addMark = function(item){//item.chromosome, item.position
	var _this = this;
	
	var mark = function (){

		if(item.chromosome!=null && item.start!=null){
			if(_this.chrOffsetX[item.chromosome]!= null){
				var x1 = _this.chrOffsetX[item.chromosome]-10;
				var x2 = _this.chrOffsetX[item.chromosome];
				var y1 = (item.start * _this.pixelBase + _this.chrOffsetY[item.chromosome]) - 4;
				var y2 = item.start * _this.pixelBase + _this.chrOffsetY[item.chromosome];
				var y3 = (item.start * _this.pixelBase + _this.chrOffsetY[item.chromosome]) + 4;
				var points = x1+","+y1+" "+x2+","+y2+" "+x1+","+y3+" "+x1+","+y1;
				SVG.addChild(_this.markGroup,"polyline",{
					"points":points,
					"stroke":"black",
					"opacity":0.8,
					"fill":"#33FF33"
				});
			}
		}
	};
	
	if(this.rendered){
		mark();
	}else{
		this.afterRender.addEventListener(function(sender,data){
			mark();
		});
	}
};

KaryotypeWidget.prototype.unmark = function(){
//	$(this.markGroup).empty();
	while (this.markGroup.firstChild) {
		this.markGroup.removeChild(this.markGroup.firstChild);
	}
};

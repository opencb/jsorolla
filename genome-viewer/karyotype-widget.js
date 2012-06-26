function KaryotypeWidget(parent, args) {
	
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
		if(args.position != null){
			this.position = args.position;
		}
	}

	this.onClick = new Event();
	
	this.svg = SVG.init(parent,{
		"width":this.width,
		"height":this.height
	});
	
	this.colors = {gneg:"white", stalk:"#666666", gvar:"#CCCCCC", gpos25:"silver", gpos33:"lightgrey", gpos50:"gray", gpos66:"dimgray", gpos75:"darkgray", gpos100:"black", gpos:"gray", acen:"blue"};
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
 		var chromosomeList = data.result;
 		chromosomeList.sort(sortfunction);
 		var x = 20;
 		var xOffset = _this.width/chromosomeList.length;
 		var yMargin = 2;
 		
 		var cellBaseManager2 = new CellBaseManager(_this.species);
 		cellBaseManager2.success.addEventListener(function(sender,data2){
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
 		 		var pointerPosition = (_this.position * _this.pixelBase);
 		 		
 				var group = SVG.addChild(_this.svg,"g",{"cursor":"pointer"});
 				$(group).click(function(event){
 					var chrClicked;
 					for ( var k=0, len=chromosomeList.length; k<len; k++) {
						if(event.clientX > _this.chrOffsetX[chromosomeList[k]]) chrClicked = chromosomeList[k];
					}
 					
 					var offsetY = event.originalEvent.layerY - 3;
 					
 					_this.positionBox.setAttribute("x1",_this.chrOffsetX[chrClicked]-10);
 					_this.positionBox.setAttribute("x2",_this.chrOffsetX[chrClicked]+23);
 					_this.positionBox.setAttribute("y1",offsetY);
 					_this.positionBox.setAttribute("y2",offsetY);
 					
 					var clickPosition = parseInt((offsetY - _this.chrOffsetY[chrClicked])/_this.pixelBase);
 					_this.chromosome = chrClicked;
 					_this.onClick.notify({chromosome:chrClicked, position:clickPosition});
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
 				"x1":_this.chrOffsetX[_this.chromosome]-10,
 				"y1":pointerPosition + _this.chrOffsetY[_this.chromosome],
 				"x2":_this.chrOffsetX[_this.chromosome]+23,
 				"y2":pointerPosition + _this.chrOffsetY[_this.chromosome],
 				"stroke":"orangered",
 				"stroke-width":2,
 				"opacity":0.5
 			});
 		});
 		cellBaseManager2.get("genomic", "region", chromosomeList.toString(),"cytoband");
 	});
 	cellBaseManager.get("feature", "karyotype", "none", "chromosome");
	
};

KaryotypeWidget.prototype.setLocation = function(item){//item.chromosome, item.position, item.species
	var needDraw = false;
	if(item.species!=null){
		this.species = item.species;
		needDraw = true;
	}
	if(item.chromosome!=null){
		this.chromosome = item.chromosome;
		
		if(item.species==null){
			this.positionBox.setAttribute("x1",this.chrOffsetX[this.chromosome]-10);
			this.positionBox.setAttribute("x2",this.chrOffsetX[this.chromosome]+23);
		}
	}
	if(item.position!=null){
		this.position = item.position;
		
		if(item.species==null){
			var pointerPosition = this.position * this.pixelBase + this.chrOffsetY[this.chromosome];
			this.positionBox.setAttribute("y1",pointerPosition);
			this.positionBox.setAttribute("y2",pointerPosition);
		}
	}
	if(needDraw){
		$(this.svg).empty();
		this.drawKaryotype();
	}
};

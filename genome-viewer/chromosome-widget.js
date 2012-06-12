function ChromosomeWidget(parent, args) {
	
	this.id = Math.round(Math.random()*10000000);
	if(args != null){
		if(args.width != null){
			this.width = args.width;
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
		"height":65
	});
	
};

ChromosomeWidget.prototype.drawHorizontal = function(){
	var _this = this;

	var colors = {gneg:"white", stalk:"#666666", gvar:"#CCCCCC", gpos25:"silver", gpos33:"lightgrey", gpos50:"gray", gpos66:"dimgray", gpos75:"darkgray", gpos100:"black", gpos:"gray", acen:"blue"};
	
	var cellBaseManager = new CellBaseManager(this.species);
 	cellBaseManager.success.addEventListener(function(sender,data){
 		var pixelBase = (_this.width -40) / data.result[0][data.result[0].length-1].end;
 		var x = 20;
 		var y = 10;
 		var firstCentromero = true;
 		
 		var offset = 20;
 		var pointer = (_this.position * pixelBase) + offset;

 		
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
			clickPosition = parseInt((event.clientX - offset)/pixelBase);
			
			//XXX
			//hacer un notify para cambiar la posicion con el valor clickPosition
			_this.onClick.notify(clickPosition);
		});
		
		for (var i = 0; i < data.result[0].length; i++) {
//			console.log(data.result[0][i])
			var width = pixelBase * (data.result[0][i].end - data.result[0][i].start);
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
		
		var c1 = pointer+5;
 		var c2 = pointer-5;
 		var points = pointer+",25 "+c1+",13 "+c1+",1 "+c2+",1 "+c2+",13 "+pointer+",25";
 		SVG.addChild(_this.svg,"polyline",{
 			"points":points,
 			"stroke":"black",
// 			"opacity":0.8,
 			"fill":"red"
 		});
 	});
 	cellBaseManager.get("genomic", "region", this.chromosome+":1-260000000","cytoband");
};

function TrackSvg(parent, args) {
	this.args = args;
//	this.id = Math.round(Math.random()*10000000); // internal id for this class
	this.parent = parent;

	this.y = 25;
	this.height = 200;
	this.width = 200;
	this.title = "track";
	if (args != null){
		if(args.title != null){
			this.title = args.title;
		}
		if(args.id != null){
			this.id = args.id;
		}
		if(args.clase != null){
			this.clase = args.clase;
		}
		if(args.width != null){
			this.width = args.width;
		}
		if(args.height != null){
			this.height = args.height;
		}
		if(args.position != null){
			this.position = args.position;
		}
		if(args.zoom != null){
			this.zoom = args.zoom;
		}
		if(args.pixelBase != null){
			this.pixelBase = args.pixelBase;
		}
	}
	
	//flags
	this.rendered = false;
	
};
TrackSvg.prototype.setY = function(value){
	this.y = value;
};
TrackSvg.prototype.getHeight = function(){
	return this.height;
};
TrackSvg.prototype.setHeight = function(height){
	this.height=height;
	if(this.rendered){
		this.main.setAttribute("height",height);
	}
};
TrackSvg.prototype.draw = function(){
	var main = SVG.addChild(this.parent,"svg",{
//		"style":"border:1px solid #e0e0e0;",
		"id":this.id,
		"x":0,
		"y":this.y,
		"width":this.width,
		"height":this.height
	});
	var features = SVG.addChild(main,"svg",{
		"x":-3500000,
		"width":7000000,
		"height":this.height
	});
	var over = SVG.addChild(main,"rect",{
		"x":0,
		"y":0,
		"width":this.width,
		"height":this.height,
		"opacity":"0",
		"stroke":"330000",
		"stroke-width":"1",
		"fill":"deepskyblue"
	});
	var titlebar = SVG.addChild(main,"rect",{
		"x":0,
		"y":0,
		"width":24,
		"height":this.height,
		"opacity":"1",
//		"stroke":"goldenrod",
//		"stroke-width":"1",
		"fill":"white"
	});
	var upRect = SVG.addChild(main,"rect",{
		"id":this.id+"upRect",
		"x":4,
		"y":4,
		"width":16,
		"height":16,
		"fill":"palegreen"
	});
	var downRect = SVG.addChild(main,"rect",{
		"x":4,
		"y":25,
		"width":16,
		"height":16,
		"fill":"skyblue"
	});
	var hideRect = SVG.addChild(main,"rect",{
		"x":4,
		"y":46,
		"width":16,
		"height":16,
		"fill":"plum"
	});
	
////XXX
//	
//	for ( var i = 0; i < 150; i++) {
//		var rect = SVG.addChild(features,"line",{
//			"x1":80+i,
//			"y1":10+i,
//			"x2":80+i+200,
//			"y2":10+i,
////			"width":200,
////			"height":1,
//			"stroke-width":"1",
//			"stroke":"black"
//		});
//		var rect = SVG.addChild(features,"rect",{
//			"x":80+i,
//			"y":i,
//			"width":200,
//			"height":1,
//			"fill":"black"
//		});
//	}
//
////XXX	
	
	var text = SVG.addChild(main,"text",{
		"x":15,
		"y":100,
		"fill":"black",
		"transform":"rotate(-90 15,100)"
	});
	text.textContent = this.id;
	
	
	//XXX para mañana
//	$(titlebar).mousedown(function(event){
//		main.parentNode.appendChild(main); 
////		var x = parseInt(main.getAttribute("x")) - event.offsetX;
//		var y = parseInt(main.getAttribute("y")) - event.clientY;
//		$(this.parentNode).mousemove(function(event){
////			main.setAttribute("x",x + event.offsetX);
//			main.setAttribute("y",y + event.clientY);
//		});
//	});
//	$(main).mouseup(function(event){
//		$(this).off('mousemove');
//	});
	

	
	
	$(main).mouseenter(function(event){
		over.setAttribute("opacity","0.1");
		titlebar.setAttribute("fill","orange");
	});
	$(main).mouseleave(function(event){
		over.setAttribute("opacity","0");
		titlebar.setAttribute("fill","white");
	});

	$(upRect).mouseenter(function(event){
		this.setAttribute("fill","red");
	});
	$(upRect).mouseleave(function(event){
		this.setAttribute("fill","palegreen");
	});
	
	$(downRect).mouseenter(function(event){
		this.setAttribute("fill","red");
	});
	$(downRect).mouseleave(function(event){
		this.setAttribute("fill","skyblue");
	});
	
	$(hideRect).mouseenter(function(event){
		this.setAttribute("fill","red");
	});
	$(hideRect).mouseleave(function(event){
		this.setAttribute("fill","plum");
	});
	
	
	
	
//	$(this.parent).mousedown(function(event) {
//		var x = parseInt(features.getAttribute("x")) - event.clientX;
//		$(this).mousemove(function(event){
//			features.setAttribute("x",x + event.clientX);
//		});
//	});
//	$(this.parent).mouseup(function(event) {
//		$(this).off('mousemove');
//	});
	
	
	
	
	
//	$(upRect).click(function(event){
//		main.setAttribute("y",0);
//	});
//	$(upRect).click(function(event){
//		main.setAttribute("y",500);
//	});
	
	
	this.main = main;
	this.upRect = upRect;
	this.downRect = downRect;
	this.hideRect = hideRect;
	this.features = features;
	
	this.rendered = true;
};
TrackSvg.prototype.addFeatures = function(featureList){
//	console.log(this.position);
//	console.log(featureList)
	
	var _this=this;
	var middle = _this.width/2;
	
//	console.log(featureList)
	for ( var i = 0; i < featureList.length; i++) {
		var width = (featureList[i].end-featureList[i].start)+1;
//		console.log(width)
		var color = "blue";

		//snps can be negative
		if(width<0){
			width=Math.abs(width);
			color = "red";
		}
		//snps with same start - end
		if(width==0){
			width=1;
			color = "orangered";
		}
		width= width*this.pixelBase;

		var x = 3500000+middle-((this.position-featureList[i].start)*this.pixelBase);
		var rect = SVG.addChild(this.features,"rect",{
			"x":x,
			"y":0,
			"width":width,
			"height":12,
			"z-index":20000,
			"fill":color
		});
		
		var text = SVG.addChild(this.features,"text",{
			"x":x,
			"y":10,
			"z-index":21000,
			"fill":"white"
		});
		text.textContent = featureList[i].externalName;
	}
};
function TrackSvg(parent, args) {
	this.args = args;
//	this.id = Math.round(Math.random()*10000000); // internal id for this class
	this.parent = parent;
	
	this.y = 25;
	this.height = 50;
	this.width = 200;
	this.title = "track";
	this.type = "generic";
	this.renderedArea = {};
	
	this.lienzo=7000000;//mesa
	this.pixelPosition=this.lienzo/2;
	
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
		if(args.type != null){
			this.type = args.type;
		}
		if(args.renderFeatures != null){
			switch(args.renderFeatures){
				case "GeneRender": this.renderFeatures = this.GeneRender; break;
				case "SequenceRender": this.renderFeatures = this.SequenceRender; break;
				default: this.renderFeatures = this.GeneRender;
			}
		}
	}
	
	//flags
	this.rendered = false;//svg structure already draw, svg elements can be used from now
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
		"x":-this.pixelPosition,
		"width":this.lienzo,
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
		"width":150,
		"height":24,
		"opacity":"1",
//		"stroke":"goldenrod",
//		"stroke-width":"1",
		"opacity":"0.1",
		"fill":"orange"
	});
//	var upRect = SVG.addChild(main,"rect",{
//		'id':this.id+"upRect",
//		"x":4,
//		"y":4,
//		"width":16,
//		"height":16,
//		"opacity":"0",
//		"fill":"blue"
//	});
	
	
//	var upRect = SVG.addChild(main,"svg",{
//		"xmlns":"http://www.w3.org/2000/svg",
//		"version":"1.1"
//	});
	
	
	var upRect = SVG.addChildImage(main,{
		"xlink:href":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAD9JREFUOI1jYKAhEGBgYJgPxWSB+QwMDP+hmGRDkDWTbAg2zUQbgk8zQUOI0Uyyd2AacAImYk0aNWAwG0AxAABRBSdztC0IxQAAAABJRU5ErkJggg==",
		"x":4,
		"y":4,
	    "width":16,
	    "height":16,
	    "opacity":"0"
	});
	
	var downRect = SVG.addChildImage(main,{
		"xlink:href":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAERJREFUOI1jYKAx+A/FOAETpTaMGjDYDJjPgIh39PhHF5+Py0BshhCtmRhDCGrGZwjRmrEZQrJmZEPmMzAwCJBrAEEAANCqJXdWrFuyAAAAAElFTkSuQmCC",
		"x":20,
		"y":4,
		"width":16,
		"height":16,
		"opacity":"0"
	});
	var hideRect = SVG.addChildImage(main,{
		"xlink:href":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAJFJREFUOI2tks0NgzAMhb+wAFP05FM2aCdjtDBCLjkxBRO4F4JoAONIfVKkyHk/sl4CQIyRFqpKzvk0/zvCMRSYgU9LEpH9XkpJwFtEgqr+8NJmkozAR45F2N+WcTQyrk3c4lYwbadLXFGFCkx34sHr9lrXrvTLFXrFx509Fd+K3SaeqkwTb1XV5Axvz73/wcQXYitIjMzG550AAAAASUVORK5CYII=",
		"x":36,
		"y":4,
		"width":16,
		"height":16,
		"opacity":"0"
	});
	var settingsRect = SVG.addChildImage(main,{
		"xlink:href":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAABHNCSVQICAgIfAhkiAAAAPJJREFUOI2llD0OgkAQhb/QExuPQGWIB/A63IAbGLwG0dNQWxPt6GmoELMWzuJk3IUYJ5mQnXlv/nYWnHOEFCgAp7SIYRPiclg5f0SyJkCmqtgBrankBuwVJwMS59xsKAV4Bc7AwwTwOgEXwTmgFD5boI+QnkAn35C/Fz7HSMYTkErXqZynAPYIkAN346giI6wM7g7kfiYbYFAtpJYtuFS1NggPvRejODtLNvvTCW60GaKVmADhSpZmEqgiPBNWbkdVsHg7/+/Jjxv7EP+8sXqwCe+34CX0dlqxe8mE9zV9LbUJUluAl+CvQAI2xtxYjE/8Ak/JC4Cb6l5eAAAAAElFTkSuQmCC",
		"x":55,
		"y":3,
		"width":17,
		"height":17,
		"opacity":"0"
	});
	
	var text = SVG.addChild(main,"text",{
		"x":75,
		"y":16,
		"opacity":"0.4",
		"fill":"black"
//		"transform":"rotate(-90 50,50)"
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
		text.setAttribute("opacity","1.0");
		upRect.setAttribute("opacity","1.0");
		downRect.setAttribute("opacity","1.0");
		hideRect.setAttribute("opacity","1.0");
		settingsRect.setAttribute("opacity","1.0");
		titlebar.setAttribute("opacity","0.7");
	});
	$(main).mouseleave(function(event){
		over.setAttribute("opacity","0.0");
		text.setAttribute("opacity","0.4");
		upRect.setAttribute("opacity","0.0");
		downRect.setAttribute("opacity","0.0");
		hideRect.setAttribute("opacity","0.0");
		settingsRect.setAttribute("opacity","0.0");
		titlebar.setAttribute("opacity","0.2");
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
	this.settingsRect = settingsRect;
	this.features = features;
	
	this.rendered = true;
};


//RENDERS for Gene, Snp, Histogram
TrackSvg.prototype.GeneRender = function(featureList){
	var middle = this.width/2;
	
	for ( var i = 0; i < featureList.length; i++) {
		var width = (featureList[i].end-featureList[i].start)+1;
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

		
		var x = this.pixelPosition+middle-((this.position-featureList[i].start)*this.pixelBase);
		var y = 0;
		var textY = y+23;
		
		var rect = SVG.addChild(this.features,"rect",{
			"x":x,
			"y":y,
			"width":width,
			"height":12,
			"z-index":20000,
			"fill":color
		});
		
		var text = SVG.addChild(this.features,"text",{
			"x":x,
			"y":textY,
			"z-index":21000,
			"fill":"black"
		});
		text.textContent = featureList[i].externalName;
		
		// avoid overlapping while moving!!!
		var maxWidth = Math.max(width, text.getComputedTextLength());
		var maxY = 200;
		var failDraw = false;
		for(var newY=y; newY<maxY; newY+=30){
			if(this.renderedArea[newY] == null){
				this.renderedArea[newY] = [];
			}
			if(!this.checkAvailableArea(x, x+maxWidth-1, newY)){
				failDraw = true;
			}else{
				if(newY != y && failDraw){
					rect.setAttribute("y", newY);
					text.setAttribute("y", newY+23);
					y = newY;
				}
				break;
			}
		}
		this.renderedArea[y].push({start:x ,end:x+maxWidth-1});
	}
};

TrackSvg.prototype.SequenceRender = function(featureList){
	var middle = this.width/2;
	
	if(featureList.length > 0){
		var seqString = featureList[0].sequence;
		var width = 1*this.pixelBase;
		var color = new Object();
		color["A"] = "#90EE90";
		color["C"] = "#B0C4DE";
		color["G"] = "#FFEC8B";
		color["T"] = "#E066FF";
		color["N"] = "#aaaaaa";
		
		var start = featureList[0].start;
		
		for ( var i = 0; i < seqString.length; i++) {
			var x = this.pixelPosition+middle-((this.position-start)*this.pixelBase);
			start++;
			var rect = SVG.addChild(this.features,"rect",{
				"x":x,
				"y":0,
				"width":width,
				"height":12,
				"stroke":"black",
				"opacity":0.8,
				"fill":color[seqString.charAt(i)]
			});
			
			var text = SVG.addChild(this.features,"text",{
				"x":x+1,
				"y":10,
				"font-size":10,
				"fill":"black"
			});
			text.textContent = seqString.charAt(i);
		}
	}
};

TrackSvg.prototype.SnpRender = function(featureList){
	
};

TrackSvg.prototype.HistogramRender = function(featureList){
	
};

TrackSvg.prototype.checkAvailableArea = function(featureStart, featureEnd, targetY){
	for(var i = 0; i < this.renderedArea[targetY].length; i++){
		if(featureStart < this.renderedArea[targetY][i].end && featureEnd > this.renderedArea[targetY][i].start){
			return false;
		}
	}
	return true;
};
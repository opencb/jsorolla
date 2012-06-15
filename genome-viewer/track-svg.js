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
		if(args.featuresRender != null){
			switch(args.featuresRender){
				case "MultiFeatureRender": this.featuresRender = this.MultiFeatureRender; break;
				case "SequenceRender": this.featuresRender = this.SequenceRender; break;
				default: this.featuresRender = this.GeneRender;
			}
		}
	}
	
	this.tooltip = document.createElement('div');
	$(this.tooltip).css({
		'position':'absolute',
		'padding':'5px',
		'border':'1px solid deepSkyBlue',
		'background':'honeydew',
		'z-index':'50000'
	}).corner("5px");
	
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
		this.features.setAttribute("height",height);
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
	
	var titleGroup = SVG.addChild(main,"g");
	var titlebar = SVG.addChild(titleGroup,"rect",{
		"x":0,
		"y":0,
		"width":56,
		"height":22,
		"stroke":"deepSkyBlue",
		"stroke-width":"1",
		"opacity":"0.6",
		"fill":"honeydew"
	});
	var text = SVG.addChild(titleGroup,"text",{
		"x":4,
		"y":14,
		"font-size": 10,
		"opacity":"0.4",
		"fill":"black"
//		"transform":"rotate(-90 50,50)"
	});
	text.textContent = this.id;
	textWidth = 56;

	var settingsRect = SVG.addChildImage(titleGroup,{
		"xlink:href":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAABHNCSVQICAgIfAhkiAAAAPJJREFUOI2llD0OgkAQhb/QExuPQGWIB/A63IAbGLwG0dNQWxPt6GmoELMWzuJk3IUYJ5mQnXlv/nYWnHOEFCgAp7SIYRPiclg5f0SyJkCmqtgBrankBuwVJwMS59xsKAV4Bc7AwwTwOgEXwTmgFD5boI+QnkAn35C/Fz7HSMYTkErXqZynAPYIkAN346giI6wM7g7kfiYbYFAtpJYtuFS1NggPvRejODtLNvvTCW60GaKVmADhSpZmEqgiPBNWbkdVsHg7/+/Jjxv7EP+8sXqwCe+34CX0dlqxe8mE9zV9LbUJUluAl+CvQAI2xtxYjE/8Ak/JC4Cb6l5eAAAAAElFTkSuQmCC",
		"x":4+textWidth,
		"y":3,
		"width":17,
		"height":17,
		"opacity":"0.6",
		"visibility":"hidden"
	});
	
	var upRect = SVG.addChildImage(titleGroup,{
		"xlink:href":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAD9JREFUOI1jYKAhEGBgYJgPxWSB+QwMDP+hmGRDkDWTbAg2zUQbgk8zQUOI0Uyyd2AacAImYk0aNWAwG0AxAABRBSdztC0IxQAAAABJRU5ErkJggg==",
		"x":22+textWidth,
		"y":4,
	    "width":16,
	    "height":16,
	    "opacity":"0.6",
	    "visibility":"hidden"
	});
	
	var downRect = SVG.addChildImage(titleGroup,{
		"xlink:href":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAERJREFUOI1jYKAx+A/FOAETpTaMGjDYDJjPgIh39PhHF5+Py0BshhCtmRhDCGrGZwjRmrEZQrJmZEPmMzAwCJBrAEEAANCqJXdWrFuyAAAAAElFTkSuQmCC",
		"x":36+textWidth,
		"y":4,
		"width":16,
		"height":16,
		"opacity":"0.6",
		"visibility":"hidden"
	});
	var hideRect = SVG.addChildImage(titleGroup,{
		"xlink:href":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAJFJREFUOI2tks0NgzAMhb+wAFP05FM2aCdjtDBCLjkxBRO4F4JoAONIfVKkyHk/sl4CQIyRFqpKzvk0/zvCMRSYgU9LEpH9XkpJwFtEgqr+8NJmkozAR45F2N+WcTQyrk3c4lYwbadLXFGFCkx34sHr9lrXrvTLFXrFx509Fd+K3SaeqkwTb1XV5Axvz73/wcQXYitIjMzG550AAAAASUVORK5CYII=",
		"x":52+textWidth,
		"y":4,
		"width":16,
		"height":16,
		"opacity":"0.6",
		"visibility":"hidden"
	});
	
	
	//XXX para mañana, arrastrar para ordenar verticalmente
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
	

//	var over = SVG.addChild(main,"rect",{
//		"x":0,
//		"y":0,
//		"width":this.width,
//		"height":this.height,
//		"opacity":"0",
//		"stroke":"330000",
//		"stroke-width":"1",
//		"fill":"deepskyblue"
//	});
	
	
	
	$(titleGroup).mouseenter(function(event){
//		over.setAttribute("opacity","0.1");
		titlebar.setAttribute("width",74+textWidth);
		titlebar.setAttribute("opacity","1.0");
		text.setAttribute("opacity","1.0");
		upRect.setAttribute("visibility","visible");
		downRect.setAttribute("visibility","visible");
		hideRect.setAttribute("visibility","visible");
		settingsRect.setAttribute("visibility","visible");
	});
	$(titleGroup).mouseleave(function(event){
////	over.setAttribute("opacity","0.0");
		titlebar.setAttribute("width",textWidth);
		titlebar.setAttribute("opacity","0.6");
		text.setAttribute("opacity","0.4");
		upRect.setAttribute("visibility","hidden");
		downRect.setAttribute("visibility","hidden");
		hideRect.setAttribute("visibility","hidden");
		settingsRect.setAttribute("visibility","hidden");
	});
	
	$(upRect).mouseover(function(event){
		this.setAttribute("opacity","1.0");
	});
	$(downRect).mouseover(function(event){
		this.setAttribute("opacity","1.0");
	});
	$(hideRect).mouseover(function(event){
		this.setAttribute("opacity","1.0");
	});
	$(settingsRect).mouseover(function(event){
		this.setAttribute("opacity","1.0");
	});
	$(upRect).mouseleave(function(event){
		this.setAttribute("opacity","0.6");
	});
	$(downRect).mouseleave(function(event){
		this.setAttribute("opacity","0.6");
	});
	$(hideRect).mouseleave(function(event){
		this.setAttribute("opacity","0.6");
	});
	$(settingsRect).mouseleave(function(event){
		this.setAttribute("opacity","0.6");
	});
	
	//set initial values when hide due mouseleave event not fires when hideTrack from TrackSvgLayout
	$(hideRect).click(function(event){
		titlebar.setAttribute("width",textWidth);
		titlebar.setAttribute("opacity","0.6");
		text.setAttribute("opacity","0.4");
		upRect.setAttribute("visibility","hidden");
		downRect.setAttribute("visibility","hidden");
		hideRect.setAttribute("visibility","hidden");
		settingsRect.setAttribute("visibility","hidden");
	});
	
	//ya no se usa, es track svg layout el q captura el evento de click y arrastrar
//	$(this.parent).mousedown(function(event) {
//		var x = parseInt(features.getAttribute("x")) - event.clientX;
//		$(this).mousemove(function(event){
//			features.setAttribute("x",x + event.clientX);
//		});
//	});
//	$(this.parent).mouseup(function(event) {
//		$(this).off('mousemove');
//	});
	
	
	this.main = main;
	this.titleGroup = titleGroup;
	this.upRect = upRect;
	this.downRect = downRect;
	this.hideRect = hideRect;
	this.settingsRect = settingsRect;
	this.features = features;
	
	this.rendered = true;
};


//RENDERS for MultiFeatureRender, sequence, Snp, Histogram

TrackSvg.prototype.MultiFeatureRender = function(featureList){
	var _this = this;
//	console.log(featureList.length);
	
	var middle = this.width/2;
	
	for ( var i = 0, len = featureList.length; i < len; i++) {
		var feature = featureList[i];
		var width = (featureList[i].end-featureList[i].start)+1;
		var color = "#a00000";
		
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
		width = width * this.pixelBase;
		
		var x = this.pixelPosition+middle-((this.position-featureList[i].start)*this.pixelBase);
		
		try{
			var maxWidth = Math.max(width, featureList[i].externalName.length*8); //text.getComputedTextLength()
		}catch(e){
			var maxWidth = 72;
		}
		
		var rowHeight = 24;
		var rowY = 0;
		var textY = 16;
		
		while(true){
			if(this.renderedArea[rowY] == null){
				this.renderedArea[rowY] = new FeatureBinarySearchTree();
			}
			var enc = this.renderedArea[rowY].add({start: x, end: x+maxWidth-1});
			
			if(enc){
				var rect = SVG.addChild(this.features,"rect",{
					"i":i,
					"x":x,
					"y":rowY,
					"width":width,
					"height":4,
					"stroke": "#3B0B0B",
					"stroke-width": 0.5,
					"fill": color,
					"cursor": "pointer"
				});
				rect.textContent = featureList[i].externalName;
				
				var text = SVG.addChild(this.features,"text",{
					"i":i,
					"x":x,
					"y":textY,
					"font-size":10,
					"opacity":null,
					"fill":"black",
					"cursor": "pointer"
				});
				text.textContent = featureList[i].externalName;
				
				//feature events
				$(rect).mouseenter(function(event){
					var feature = featureList[this.getAttribute("i")];
					$(_this.tooltip).css({'left':event.pageX,'top':event.pageY,display:'block'}).html(_this.formatTooltip(feature));
					$("body").append(_this.tooltip);
				});
				$(rect).mouseleave(function(event){
					$(_this.tooltip).fadeOut(function (){ $(this).remove(); });
				});
				$(text).mouseenter(function(event){
					var feature = featureList[this.getAttribute("i")];
					$(_this.tooltip).css({'left':event.pageX,'top':event.pageY,display:'block'}).html(_this.formatTooltip(feature));
					$("body").append(_this.tooltip);
				});
				$(text).mouseleave(function(event){
					$(_this.tooltip).fadeOut('fast',function (){ $(this).remove(); });
				});
				$(text).click(function(event){
					var feature = featureList[this.getAttribute("i")];
					console.log(feature);
				});
				$(rect).click(function(event){
					var feature = featureList[this.getAttribute("i")];
					console.log(feature);
				});
				break;
			}
			rowY += rowHeight;
			textY += rowHeight;
		}
	}
	var newHeight = Object.keys(this.renderedArea).length*24;
	if(newHeight>0){
		this.setHeight(newHeight+/*margen entre tracks*/10);
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
		color["N"] = "#AAAAAA";
		
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
//	{"start":1,"end":409601,"interval":0,"absolute":0,"value":0.0}
	var middle = this.width/2;
	
	for ( var i = 0, len = featureList.length; i < len; i++) {
		var feature = featureList[i];
		var width = (featureList[i].end-featureList[i].start)+1;
		console.log(width);
	}
};

TrackSvg.prototype.formatTooltip = function(feature){
	var str = 'start: <span class="emph">'+feature.start+'</span><br>'+
	'end:  <span class="emph">'+feature.end+'</span><br>'+
	'length: <span class="info">'+(feature.end-feature.start+1)+'</span><br>';
	return str;
};

//TrackSvg.prototype.checkAvailableArea = function(featureStart, featureEnd, targetY){
//	console.time("checkAvailableArea, elems: "+this.renderedArea[targetY].length);
//	for(var i = 0; i < this.renderedArea[targetY].length; i++){
//		if(featureStart < this.renderedArea[targetY][i].end && featureEnd > this.renderedArea[targetY][i].start){
//			return false;
//		}
//	}
//	console.timeEnd("checkAvailableArea, elems: "+this.renderedArea[targetY].length);
//	return true;
//};

function TrackSvg(parent, args) {
	this.args = args;
//	this.id = Math.round(Math.random()*10000000); // internal id for this class
	this.parent = parent;
	
	this.y = 25;
	this.height = 50;
	this.width = 200;
	this.title = "track";
//	this.type = "generic";
	this.renderedArea = {};
	
	this.lienzo=7000000;//mesa
	this.pixelPosition=this.lienzo/2;
	
	this.histogramZoom = -1000;//no histogram by default
	
	this.titleVisibility = 'visible';	
	
	this.closable = true;
	this.types = FEATURE_TYPES;
	
	this.customField=false;
	
	this.labelZoom = -1;
	
	if (args != null){
		if(args.title != null){
			this.title = args.title;
		}
		if(args.id != null){
			this.id = args.id;
		}
		if(args.trackSvgLayout != null){
			this.trackSvgLayout = args.trackSvgLayout;
		}
		if(args.trackData != null){
			this.trackData = args.trackData;
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
//		if(args.type != null){
//			this.type = args.type;
//		}
		if(args.closable != null){
			this.closable = args.closable;
		}
		if(args.labelZoom != null){
			this.labelZoom = args.labelZoom;
		}
		if(args.histogramZoom != null){
			this.histogramZoom = args.histogramZoom;
		}
		if(args.transcriptZoom != null){//gene only
			this.transcriptZoom = args.transcriptZoom;
		}
		if(args.featureTypes != null){
			this.featureTypes = args.featureTypes;
		}
		if(args.titleVisibility != null){
			this.titleVisibility = args.titleVisibility;
		}
		if(args.customField != null){
			this.customField = args.customField;
		}
		if(args.featuresRender != null){
			switch(args.featuresRender){
				case "MultiFeatureRender": this.featuresRender = this.MultiFeatureRender; break;
				case "SequenceRender": this.featuresRender = this.SequenceRender; break;
				case "GeneTranscriptRender": this.featuresRender = this.GeneTranscriptRender; break;
				case "BamRender": this.featuresRender = this.BamRender; break;
				default: this.featuresRender = this.MultiFeatureRender;
			}
			this.defaultRender = this.featuresRender;
		}
	}
	
	//flags
	this.rendered = false;//svg structure already draw, svg elements can be used from now
	
	
	this.interval=null;
	this.histogram=null;
	this.transcript=null;
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

TrackSvg.prototype.setWidth = function(width){
	this.width=width;
	if(this.rendered){
		this.main.setAttribute("width",width);
	}
};


TrackSvg.prototype.draw = function(){
	var _this = this;
	
	var main = SVG.addChild(this.parent,"svg",{
//		"style":"border:1px solid #e0e0e0;",
		"id":this.id,
		"x":0,
		"y":this.y,
		"width":this.width,
		"height":this.height
	});
	var features = SVG.addChild(main,"svg",{
		"class":"features",
		"x":-this.pixelPosition,
		"width":this.lienzo,
		"height":this.height
	});
	
	var titleGroup = SVG.addChild(main,"g",{
		visibility:this.titleVisibility	
	});
	
	var textWidth = 15+this.id.length*6;
	var titlebar = SVG.addChild(titleGroup,"rect",{
		"x":0,
		"y":0,
		"width":textWidth,
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
	
	
////	XXX para mañana, arrastrar para ordenar verticalmente
//	$(titleGroup).mousedown(function(event){
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
		if(_this.closable == true){ hideRect.setAttribute("visibility","visible"); }
//		settingsRect.setAttribute("visibility","visible");//TODO not implemented yet, hidden for now...
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
	
	$([upRect,downRect,hideRect,settingsRect]).mouseover(function(event){
		this.setAttribute("opacity","1.0");
	});
	$([upRect,downRect,hideRect,settingsRect]).mouseleave(function(event){
		this.setAttribute("opacity","0.6");
	});

	$(settingsRect).mouseover(function(event){
		titlebar.setAttribute("height",22+22);
	});
	$(settingsRect).mouseleave(function(event){
		titlebar.setAttribute("height",22);
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
	
	
	this.invalidZoomText = SVG.addChild(main,"text",{
		"x":154,
		"y":14,
		"font-size": 10,
		"opacity":"0.6",
		"fill":"black",
		"visibility":"hidden"
	});
	this.invalidZoomText.textContent = "This level of zoom isn't appropiate for this track";
	
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
	
	if(this.customField = true){
		this.customSvgField = SVG.addChild(main,"text",{
			"x":this.width/2,
			"y":0,
			"font-size": 10,
			"fill":"black"
		});
	}
	
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
	console.time("Multirender "+featureList.length);
//	console.log(featureList.length);
	var draw = function(feature){
		var start = feature.start;
		var end = feature.end;
		var width = (end-start)+1;
		
		var middle = _this.width/2;
		
		if(width<0){//snps can be negative
			width=Math.abs(width);
		}
		if(width==0){//snps with same start - end
			width=1;
		}
		
		//get type settings object
		var settings = _this.types[feature.featureType];
		try {
			var color = settings.getColor(feature);
		} catch (e) {
			//Uncaught TypeError: Cannot call method 'getColor' of undefined 
			console.log(e)
			debugger
			
		}
		
		
		
		//transform to pixel position
		width = width * _this.pixelBase;
		var x = _this.pixelPosition+middle-((_this.position-start)*_this.pixelBase);
		
		var textHeight = 12;
		if(_this.zoom > _this.labelZoom){
			try{
				var maxWidth = Math.max(width, settings.getLabel(feature).length*8); //XXX cuidado : text.getComputedTextLength()
			}catch(e){
				var maxWidth = 72;
			}
		}else{
			var maxWidth = Math.max(width,10);
			textHeight = 0;
		}
		
		
		var rowHeight = textHeight+12;
		var rowY = 0;
		var textY = textHeight+settings.height;
		
		while(true){
			if(_this.renderedArea[rowY] == null){
				_this.renderedArea[rowY] = new FeatureBinarySearchTree();
			}
			var enc = _this.renderedArea[rowY].add({start: x, end: x+maxWidth-1});
			
			if(enc){
				var featureGroup = SVG.addChild(_this.features,"g");
				var rect = SVG.addChild(featureGroup,"rect",{
					"x":x,
					"y":rowY,
					"width":width,
					"height":settings.height,
					"stroke": "#3B0B0B",
					"stroke-width": 0.5,
					"fill": color,
					"cursor": "pointer"
				});
				if(_this.zoom > _this.labelZoom){
					var text = SVG.addChild(featureGroup,"text",{
						"i":i,
						"x":x,
						"y":textY,
						"font-size":10,
						"opacity":null,
						"fill":"black",
						"cursor": "pointer"
					});
					text.textContent = settings.getLabel(feature);
				}
				
				$(featureGroup).qtip({
					content: {text:settings.getTipText(feature), title:settings.getTipTitle(feature)},
					position: {target:  "mouse", adjust: {x:15, y:15},  viewport: $(window), effect: false},
					style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'}
				});
				
				$(featureGroup).click(function(event){
					_this.showInfoWidget({query:feature[settings.infoWidgetId], feature:feature, featureType:feature.featureType, adapter:_this.trackData.adapter});
				});
				break;
			}
			rowY += rowHeight;
			textY += rowHeight;
		}
	};
	
	//process features
	for ( var i = 0, leni = featureList.length; i < leni; i++) {
		draw(featureList[i]);
	}
	var newHeight = Object.keys(this.renderedArea).length*24;
	if(newHeight>0){
		this.setHeight(newHeight+/*margen entre tracks*/10);
	}
	console.timeEnd("Multirender "+featureList.length);
};

TrackSvg.prototype.BamRender = function(chunkList){
	var _this = this;
	var middle = this.width/2;
	console.log(chunkList.length);
	var drawCoverage = function(chunk){
		var coverageList = chunk.coverage;
		var readList = chunk.reads;
		var start = parseInt(chunk.region.start);
		var width = 1*_this.pixelBase;
		console.log(coverageList)
		var points = "";
		
		var baseMid = (_this.pixelBase/2)-0.5;//4.5 cuando pixelBase = 10
		var x,y;
		for ( var i = 0; i < coverageList.length; i++) {
			x = _this.pixelPosition+middle-((_this.position-start)*_this.pixelBase)+baseMid;
//			var text = SVG.addChild(_this.features,"text",{
//				"x":x+4,
//				"y":12,
//				"font-size":12,
//				"style":"writing-mode: tb; glyph-orientation-vertical: 0;",
//				"fill":"teal"
//			});
//			text.textContent = coverageList[i].toString();
//			var text = SVG.addChild(_this.features,"rect",{
//				"x":x,
//				"y":12,
//				"width":1,
//				"height":10,
////				"stroke": "#3B0B0B",
////				"stroke-width": 0.5,
//				"fill": "teal",
//				"cursor": "pointer"
//			});
			y = coverageList[i]/200*50;
			points += x+","+y+" ";
//			points += (x+(width/2))+","+(histogramHeight - height)+" ";
			start++;
			
//			$(text).qtip({
//				content:(parseInt(chunk.region.start)+i).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
//				position: {target: 'mouse', adjust: {x:15, y:15}, viewport: $(window), effect: false},
//				style: { width:true, classes: 'ui-tooltip-light ui-tooltip-shadow'}
//			});
		}
//		console.log(points)
		var pol2 = SVG.addChild(_this.features,"g");
		var pol = SVG.addChild(pol2,"polyline",{
			"points":points,
			"stroke": "black",
			"stroke-width": 3,
			"opacity": 0.4,
			"fill": "gray",
			"cursor": "pointer"
		});
//		$(pol).onmouseover(function(e){
//			console.log(e);
//		});
		_this.customSvgField.setAttribute("y","60");
		_this.customSvgField.textContent = "AAAAAAAA";
//		var overPol = false;
//		$(pol).mouseenter(function(){
//			console.log("enter");
//			overPol = true;
//		});
		
//		console.log(pol.onmouseover)
		_this.customSvgField.onmouseover = function(){
			console.log("enter");
		};
		$(pol).mouseleave(function(){
			console.log("leave");
			overPol = false;
		});
//		$(pol).qtip({
//			content:"asdf",
//			position: {target: 'mouse', adjust: {x:15, y:15}, viewport: $(window), effect: false},
//			style: { width:true, classes: 'ui-tooltip-light ui-tooltip-shadow'}
//		});
		
		
//		_this.trackSvgLayout.onMousePosition.addEventListener(function(sender,mousePos){
//			if(overPol){
//				_this.customSvgField.textContent = coverageList[mousePos-parseInt(chunk.region.start)];
//			}
//		});
		
		for ( var i = 0, li = readList.length; i < li; i++) {
			draw(readList[i]);
		}
	};
	
	var draw = function(feature){
		var start = feature.start;
		var end = feature.end;
		var width = (end-start)+1;
		
		var middle = _this.width/2;
		
		//get type settings object
		var settings = _this.types[feature.featureType];
		var color = settings.getColor(feature);
		
		//transform to pixel position
		width = width * _this.pixelBase;
		var x = _this.pixelPosition+middle-((_this.position-start)*_this.pixelBase);
		
		try{
			var maxWidth = Math.max(width, settings.getLabel(feature).length*8); //XXX cuidado : text.getComputedTextLength()
		}catch(e){
			var maxWidth = 72;
		}
		
		var rowHeight = 12;
		var rowY = 70;
//		var textY = 12+settings.height;
		
		while(true){
			if(_this.renderedArea[rowY] == null){
				_this.renderedArea[rowY] = new FeatureBinarySearchTree();
			}
			var enc = _this.renderedArea[rowY].add({start: x, end: x+maxWidth-1});
			
			if(enc){
				var rect = SVG.addChild(_this.features,"rect",{
					"x":x,
					"y":rowY,
					"width":width,
					"height":settings.height,
					"stroke": "black",
					"stroke-width": 0.2,
					"fill": color,
					"cursor": "pointer"
				});
				
//				var text = SVG.addChild(_this.features,"text",{
//					"i":i,
//					"x":x,
//					"y":textY,
//					"font-size":10,
//					"opacity":null,
//					"fill":"black",
//					"cursor": "pointer"
//				});
//				text.textContent = settings.getLabel(feature);
				
				$([rect]).qtip({
					content: {text:settings.getTipText(feature), title:settings.getTipTitle(feature)},
					position: {target:  "mouse", adjust: {x:15, y:15},  viewport: $(window), effect: false},
					style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'}
				});
				
				$([rect]).click(function(event){
					_this.showInfoWidget({query:feature[settings.infoWidgetId], feature:feature, featureType:feature.featureType, adapter:_this.trackData.adapter});
				});
				break;
			}
			rowY += rowHeight;
//			textY += rowHeight;
		}
	};
	
	//process features
	console.time("BamRender");
	for ( var i = 0, li = chunkList.length; i < li; i++) {
		drawCoverage(chunkList[i]);
	}
	console.timeEnd("BamRender");
	var newHeight = Object.keys(this.renderedArea).length*24;
	if(newHeight>0){
		this.setHeight(newHeight+/*margen entre tracks*/10+70);
	}
};

TrackSvg.prototype.GeneTranscriptRender = function(featureList){
	var _this = this;
	console.time("GeneTranscriptRender");
//	console.log(featureList.length);
	var draw = function(feature){
		var start = feature.start;
		var end = feature.end;
		var width = (end-start)+1;
		
		var middle = _this.width/2;
		
		//get type settings object
		var settings = _this.types[feature.featureType];
		var color = settings.getColor(feature);
		
		//transform to pixel position
		width = width * _this.pixelBase;
		var x = _this.pixelPosition+middle-((_this.position-start)*_this.pixelBase);
		
		try{
			var maxWidth = Math.max(width, settings.getLabel(feature).length*8); //XXX cuidado : text.getComputedTextLength()
		}catch(e){
			var maxWidth = 72;
		}
		
		var rowHeight = 24;
		var rowY = 0;
		var textY = 12+settings.height;
		
		
		while(true){
			if(_this.renderedArea[rowY] == null){
				_this.renderedArea[rowY] = new FeatureBinarySearchTree();
			}

			var enc;//if true, i can paint
			
			//check if transcripts can be painted
			var checkRowY = rowY;
			if(feature.transcripts!=null){
				for ( var i = 0, leni = feature.transcripts.length+1; i < leni; i++) {
					if(_this.renderedArea[checkRowY] == null){
						_this.renderedArea[checkRowY] = new FeatureBinarySearchTree();
					}
					enc = !_this.renderedArea[checkRowY].contains({start: x, end: x+maxWidth-1});
					if(enc == false){
						break;
					}
					checkRowY += rowHeight;
				}
			}else{
				enc = _this.renderedArea[rowY].add({start: x, end: x+maxWidth-1});
			}

			if(enc){//paint genes
				var rect = SVG.addChild(_this.features,"rect",{
					"x":x,
					"y":rowY,
					"width":width,
					"height":settings.height,
					"stroke": "#3B0B0B",
					"stroke-width": 0.5,
					"fill": color,
					"cursor": "pointer"
				});

				var text = SVG.addChild(_this.features,"text",{
					"i":i,
					"x":x,
					"y":textY,
					"font-size":10,
					"opacity":null,
					"fill":"black",
					"cursor": "pointer"
				});
				text.textContent = settings.getLabel(feature);

				$([rect,text]).qtip({
					content: {text:settings.getTipText(feature), title:settings.getTipTitle(feature)},
					position: {target:  "mouse", adjust: {x:15, y:15},  viewport: $(window), effect: false},
					style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'}
				});

				$([rect,text]).click(function(event){
					_this.showInfoWidget({query:feature[settings.infoWidgetId], feature:feature, featureType:feature.featureType , adapter:_this.trackData.adapter});
				});


				//paint transcripts
				var checkRowY = rowY+rowHeight;
				var checkTextY = textY+rowHeight;
				if(feature.transcripts!=null){
					for(var i = 0, leni = feature.transcripts.length; i < leni; i++){//XXX loop over transcripts
						if(_this.renderedArea[checkRowY] == null){
							_this.renderedArea[checkRowY] = new FeatureBinarySearchTree();
						}
						var transcript = feature.transcripts[i];
						var transcriptX = _this.pixelPosition+middle-((_this.position-transcript.start)*_this.pixelBase);
						var transcriptWidth = (transcript.end-transcript.start+1) * ( _this.pixelBase);

						//get type settings object
						var settings = _this.types[transcript.featureType];
						var color = settings.getColor(transcript);

						try{
							//se resta el trozo del final del gen hasta el principio del transcrito y se le suma el texto del transcrito
							var maxWidth = Math.max(width, width-((feature.end-transcript.start)* ( _this.pixelBase))+settings.getLabel(transcript).length*7);
						}catch(e){
							var maxWidth = 72;
						}

						//add to the tree the transcripts size
						_this.renderedArea[checkRowY].add({start: x, end: x+maxWidth-1});

						
						var transcriptGroup = SVG.addChild(_this.features,"g",{
							"widgetId":transcript[settings.infoWidgetId]
						});
						
						
						var rect = SVG.addChild(transcriptGroup,"rect",{//this rect its like a line
							"x":transcriptX,
							"y":checkRowY+2,
							"width":transcriptWidth,
							"height":settings.height-3,
							"fill": "gray",
							"cursor": "pointer"
						});
						var text = SVG.addChild(transcriptGroup,"text",{
							"x":transcriptX,
							"y":checkTextY,
							"font-size":10,
							"opacity":null,
							"fill":"black",
							"cursor": "pointer"
						});
						text.textContent = settings.getLabel(transcript);


						$(transcriptGroup).qtip({
							content: {text:settings.getTipText(transcript), title:settings.getTipTitle(transcript)},
							position: {target: 'mouse', adjust: {x:15, y:15}, viewport: $(window), effect: false},
							style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'}
						});
						$(transcriptGroup).click(function(event){
							var query = this.getAttribute("widgetId");
							_this.showInfoWidget({query:query, feature:transcript, featureType:transcript.featureType, adapter:_this.trackData.adapter});
						});

						//paint exons
						for(var e = 0, lene = feature.transcripts[i].exonToTranscripts.length; e < lene; e++){//XXX loop over exons
							var e2t = feature.transcripts[i].exonToTranscripts[e];
							var exonSettings = _this.types[e2t.exon.featureType];
							var exonStart = parseInt(e2t.exon.start);
							var exonEnd =  parseInt(e2t.exon.end);

							var exonX = _this.pixelPosition+middle-((_this.position-exonStart)*_this.pixelBase);
							var exonWidth = (exonEnd-exonStart+1) * ( _this.pixelBase);

							var exonGroup = SVG.addChild(_this.features,"g");
							
							$(exonGroup).qtip({
								content: {text:exonSettings.getTipText(e2t,transcript), title:exonSettings.getTipTitle(e2t)},
								position: {target: 'mouse', adjust: {x:15, y:15}, viewport: $(window), effect: false},
								style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'}
							});
							
							var eRect = SVG.addChild(exonGroup,"rect",{//paint exons in white without coding region
								"i":i,
								"x":exonX,
								"y":checkRowY-1,
								"width":exonWidth,
								"height":exonSettings.height+3,
								"stroke": "gray",
								"stroke-width": 1,
								"fill": "white",
								"cursor": "pointer"
							});

							//XXX now paint coding region
							var	codingStart = 0;
							var codingEnd = 0;
							// 5'-UTR
							if(transcript.codingRegionStart > exonStart && transcript.codingRegionStart < exonEnd){
								codingStart = parseInt(transcript.codingRegionStart);
								codingEnd = exonEnd;
							}else {
								// 3'-UTR
								if(transcript.codingRegionEnd > exonStart && transcript.codingRegionEnd < exonEnd){
									codingStart = exonStart;		
									codingEnd = parseInt(transcript.codingRegionEnd);		
								}else
									// all exon is transcribed
									if(transcript.codingRegionStart < exonStart && transcript.codingRegionEnd > exonEnd){
										codingStart = exonStart;		
										codingEnd = exonEnd;	
									}
//									else{
//										if(exonEnd < transcript.codingRegionStart){
//										
//									}
							}
							var coding = codingEnd-codingStart;
							var codingX = _this.pixelPosition+middle-((_this.position-codingStart)*_this.pixelBase);
							var codingWidth = (coding+1) * ( _this.pixelBase);

							if(coding > 0 ){
								var cRect = SVG.addChild(exonGroup,"rect",{
									"i":i,
									"x":codingX,
									"y":checkRowY-1,
									"width":codingWidth,
									"height":exonSettings.height+3,
									"stroke": color,
									"stroke-width": 1,
									"fill": color,
									"cursor": "pointer"
								});
								//XXX draw phase only at zoom 100, where this.pixelBase=10
								for(var p = 0, lenp = 3 - e2t.phase; p < lenp && _this.pixelBase==10 && e2t.phase!=-1; p++){//==10 for max zoom only
									SVG.addChild(exonGroup,"rect",{
										"i":i,
										"x":codingX+(p*10),
										"y":checkRowY-1,
										"width":_this.pixelBase,
										"height":settings.height+3,
										"stroke": color,
										"stroke-width": 1,
										"fill": 'white',
										"cursor": "pointer"
									});
								}
							}


						}

						checkRowY += rowHeight;
						checkTextY += rowHeight;
					}
				}// if transcrips != null
				break;
			}
			rowY += rowHeight;
			textY += rowHeight;
		}
	};
	
	//process features
	for ( var i = 0, leni = featureList.length; i < leni; i++) {
		draw(featureList[i]);
	}
	var newHeight = Object.keys(this.renderedArea).length*24;
	if(newHeight>0){
		this.setHeight(newHeight+/*margen entre tracks*/10);
	}
	console.timeEnd("GeneTranscriptRender");
};

TrackSvg.prototype.SequenceRender = function(featureList){
	var middle = this.width/2;
	
	if(featureList.length > 0){
		var seqString = featureList[0].sequence;
		var seqStart = featureList[0].start;
		var width = 1*this.pixelBase;
		
//		if(!this.settings.color){
//			this.settings.color = {A:"#009900", C:"#0000FF", G:"#857A00", T:"#aa0000", N:"#555555"};
//		}
		
		var start = featureList[0].start;
		
		if(jQuery.browser.mozilla){
			var x = this.pixelPosition+middle-((this.position-start)*this.pixelBase);
			var text = SVG.addChild(this.features,"text",{
				"x":x+1,
				"y":13,
				"font-size":16,
				"font-family": "monospace"
			});
			text.textContent = seqString;
		}else{
			for ( var i = 0; i < seqString.length; i++) {
				var x = this.pixelPosition+middle-((this.position-start)*this.pixelBase);
				start++;
				var text = SVG.addChild(this.features,"text",{
					"x":x+1,
					"y":12,
					"font-size":12,
					"fill":SEQUENCE_COLORS[seqString.charAt(i)]
				});
				text.textContent = seqString.charAt(i);
				
				$(text).qtip({
					content:(seqStart+i).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
					position: {target: 'mouse', adjust: {x:15, y:15}, viewport: $(window), effect: false},
					style: { width:true, classes: 'ui-tooltip-light ui-tooltip-shadow'}
				});
			}
			
		}
	}
	console.timeEnd("all");
};


TrackSvg.prototype.HistogramRender = function(featureList){
	console.time("histogramRender");
	var middle = this.width/2;
//	console.log(featureList);
	var histogramHeight = 50;
	var points = "";
	if(featureList.length>0) {
		var firstx = this.pixelPosition+middle-((this.position-featureList[0].start)*this.pixelBase);
		points = firstx+",50 ";
		
	}
	for ( var i = 0, len = featureList.length; i < len; i++) {
		var feature = featureList[i];
		var width = (feature.end-feature.start);
		//get type settings object
		var settings = this.types[feature.featureType];
		var color = settings.histogramColor;
		
		width = width * this.pixelBase;
		var x = this.pixelPosition+middle-((this.position-feature.start)*this.pixelBase);
		var height = histogramHeight * featureList[i].value;
		
		//
		if(featureList[i].value==null){
			console.log(featureList[i]);
		}

		//TODO FOR POLYLINE Width/2 to center the point
		points += (x+(width/2))+","+(histogramHeight - height)+" ";
		
//		var rect = SVG.addChild(this.features,"rect",{
//			"x":x,
//			"y":histogramHeight - height,
//			"width":width,
//			"height":height,
//			"stroke": "#3B0B0B",
//			"stroke-width": 0.5,
//			"fill": color,
//			"cursor": "pointer"
//		});
	}
	if(featureList.length>0) {
		var firstx = this.pixelPosition+middle-((this.position-featureList[featureList.length-1].start)*this.pixelBase);
		points += firstx+",50 ";
		
	}
//	console.log(points);
	var pol = SVG.addChild(this.features,"polyline",{
		"points":points,
		"stroke": "#000000",
		"stroke-width": 0.2,
		"fill": color,
		"cursor": "pointer"
	});
	this.setHeight(histogramHeight+/*margen entre tracks*/10);
	console.timeEnd("histogramRender");
};


TrackSvg.prototype.showInfoWidget = function(args){
	console.log(args);
	if(this.trackData.adapter.species=="orange"){
		//data.resource+="orange";
		if(args.featureType.indexOf("gene")!=-1)
			args.featureType="geneorange";
		if(args.featureType.indexOf("transcript")!=-1)
			args.featureType="transcriptorange";
	}
	
	switch (args.featureType) {
	case "gene": new GeneInfoWidget(null,this.trackData.adapter.species).draw(args); break;
	case "geneorange": new GeneOrangeInfoWidget(null,this.trackData.adapter.species).draw(args); break;
	case "transcriptorange": new TranscriptOrangeInfoWidget(null,this.trackData.adapter.species).draw(args); break;
	case "transcript": new TranscriptInfoWidget(null,this.trackData.adapter.species).draw(args); break;
	case "snp" : new SnpInfoWidget(null,this.trackData.adapter.species).draw(args); break;	
	case "vcf" : new VCFVariantInfoWidget(null,this.trackData.adapter.species).draw(args); break;
	default: break;
	}
};

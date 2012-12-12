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

function TrackSvg(parent, args) {
	this.args = args;
//	this.id = Math.round(Math.random()*10000000); // internal id for this class
	this.parent = parent;
	
	this.y = 0;
	this.height = 25;
	this.width = 200;
	this.title = "track";
//	this.type = "generic";
	this.renderedArea = {};//used for renders to store binary trees
	
	this.lienzo=500000;//mesa
	this.pixelPosition=this.lienzo/2;
	
	this.histogramZoom = -1000;//no histogram by default
	
	this.titleVisibility = 'visible';	
	
	this.closable = true;
	this.types = FEATURE_TYPES;
	
	
	this.labelZoom = -1;
	
	if (args != null){
		if(args.title != null){
			this.title = args.title;
		}
		if(args.id != null){
			this.id = args.id;
		}
		if(args.type != null){
			this.type = args.type;
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
		if(args.region != null){
			this.region = args.region;
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
		if(args.visibleRange != null){
			this.visibleRange = args.visibleRange;
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

	this.position = this.region.center();
	
	//flags
	this.rendered = false;//svg structure already draw, svg elements can be used from now
	this.status = null;
	
	this.interval=null;
	this.histogram=null;
	this.transcript=null;

	//diplayed boolean object
	this.chunksDisplayed = {};
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
		this.titlebar.setAttribute("height",height);
	}
};

TrackSvg.prototype.setWidth = function(width){
	this.width=width;
	if(this.rendered){
		this.main.setAttribute("width",width);
	}
};

TrackSvg.prototype.setLoading = function(bool){
	if(bool){
		//this.titleGroup.setAttribute("transform","translate(40)");
		this.loading.setAttribute("visibility", "visible");
		this.status = "rendering";
	}else{
		//this.titleGroup.setAttribute("transform","translate(0)");
		this.loading.setAttribute("visibility", "hidden");
		this.status = "ready";
	}
};

TrackSvg.prototype.setFilters = function(filters){
	this.trackData.setFilters(filters);
	this.regionChange();
};
TrackSvg.prototype.getFilters = function(){
	return this.trackData.adapter.filters;
};
TrackSvg.prototype.getFiltersConfig = function(){
	return this.trackData.adapter.filtersConfig;
};
TrackSvg.prototype.setOption = function(option, value){
	this.trackData.setOption(option, value);
	this.regionChange();
};
TrackSvg.prototype.getOptions = function(){
	return this.trackData.adapter.options;
};
TrackSvg.prototype.getOptionsConfig = function(){
	return this.trackData.adapter.optionsConfig;
};

TrackSvg.prototype.cleanSvg = function(filters){
		console.time("-----------------------------------------empty");
		//$(this.features).empty();
//		this.features.textContent = "";
		while (this.features.firstChild) {
			this.features.removeChild(this.features.firstChild);
		}
		console.timeEnd("-----------------------------------------empty");
		//deprecated, diplayed object is now in trackSvg class
		//this.adapter.featureCache.chunksDisplayed = {};
		this.chunksDisplayed = {};
		this.renderedArea = {};
};

TrackSvg.prototype.setTitle = function(title){
	this.titleText.textContent =  title;
	//this.titlebar.setAttribute("width", (15+title.length*6));
};

TrackSvg.prototype.getTitle = function(){
	return this.titleText.textContent;
};

TrackSvg.prototype.draw = function(){
	var _this = this;
	var main = SVG.addChild(this.parent,"svg",{
//		"style":"border:1px solid #e0e0e0;",
		"id":this.id,
		"class":"trackSvg",
		"x":0,
		"y":this.y,
		"width":this.width,
		"height":this.height
	});
	

	
	var titleGroup = SVG.addChild(main,"g",{
		"class":"trackTitle"
		//visibility:this.titleVisibility	
	});


	var text = this.title;
	var textWidth = 15+text.length*6;
	var titlebar = SVG.addChild(titleGroup,"rect",{
		"x":0,
		"y":0,
		//"width":textWidth,
		"width":this.width,
		//"height":22,
		"height":this.getHeight(),
		//"stroke":"lightgray",
		//"stroke":"deepSkyBlue",
		//"stroke-width":"1",
		"opacity":"0.6",
		//"fill":"honeydew"
		"fill":"transparent"
	});
	var titleText = SVG.addChild(titleGroup,"text",{
		"x":4,
		"y":14,
		"font-size": 10,
		"opacity":"0.4",
		"fill":"black"
//		"transform":"rotate(-90 50,50)"
	});
	titleText.textContent =  text;

	var features = SVG.addChild(titleGroup,"svg",{
		"class":"features",
		"x":-this.pixelPosition,
		"width":this.lienzo,
		"height":this.height
	});
	//var settingsRect = SVG.addChildImage(titleGroup,{
		//"xlink:href":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAABHNCSVQICAgIfAhkiAAAAPJJREFUOI2llD0OgkAQhb/QExuPQGWIB/A63IAbGLwG0dNQWxPt6GmoELMWzuJk3IUYJ5mQnXlv/nYWnHOEFCgAp7SIYRPiclg5f0SyJkCmqtgBrankBuwVJwMS59xsKAV4Bc7AwwTwOgEXwTmgFD5boI+QnkAn35C/Fz7HSMYTkErXqZynAPYIkAN346giI6wM7g7kfiYbYFAtpJYtuFS1NggPvRejODtLNvvTCW60GaKVmADhSpZmEqgiPBNWbkdVsHg7/+/Jjxv7EP+8sXqwCe+34CX0dlqxe8mE9zV9LbUJUluAl+CvQAI2xtxYjE/8Ak/JC4Cb6l5eAAAAAElFTkSuQmCC",
		//"x":4+textWidth,
		//"y":3,
		//"width":17,
		//"height":17,
		//"opacity":"0.6",
		//"visibility":"hidden"
	//});
	//
	//var upRect = SVG.addChildImage(titleGroup,{
		//"xlink:href":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAD9JREFUOI1jYKAhEGBgYJgPxWSB+QwMDP+hmGRDkDWTbAg2zUQbgk8zQUOI0Uyyd2AacAImYk0aNWAwG0AxAABRBSdztC0IxQAAAABJRU5ErkJggg==",
		//"x":22+textWidth,
		//"y":4,
	    //"width":16,
	    //"height":16,
	    //"opacity":"0.6",
	    //"visibility":"hidden"
	//});
	//
	//var downRect = SVG.addChildImage(titleGroup,{
		//"xlink:href":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAERJREFUOI1jYKAx+A/FOAETpTaMGjDYDJjPgIh39PhHF5+Py0BshhCtmRhDCGrGZwjRmrEZQrJmZEPmMzAwCJBrAEEAANCqJXdWrFuyAAAAAElFTkSuQmCC",
		//"x":36+textWidth,
		//"y":4,
		//"width":16,
		//"height":16,
		//"opacity":"0.6",
		//"visibility":"hidden"
	//});
	//var hideRect = SVG.addChildImage(titleGroup,{
		//"xlink:href":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAJFJREFUOI2tks0NgzAMhb+wAFP05FM2aCdjtDBCLjkxBRO4F4JoAONIfVKkyHk/sl4CQIyRFqpKzvk0/zvCMRSYgU9LEpH9XkpJwFtEgqr+8NJmkozAR45F2N+WcTQyrk3c4lYwbadLXFGFCkx34sHr9lrXrvTLFXrFx509Fd+K3SaeqkwTb1XV5Axvz73/wcQXYitIjMzG550AAAAASUVORK5CYII=",
		//"x":52+textWidth,
		//"y":4,
		//"width":16,
		//"height":16,
		//"opacity":"0.6",
		//"visibility":"hidden"
	//});
	
	//bamStrandPatt
//	var bamStrandPatt = SVG.addChild(main,"pattern",{
//		"id":this.id+"bamStrandPatt",
//		"patternUnits":"userSpaceOnUse",
//		"x":0,
//		"y":0,
//		"width":30,
//		"height":10
//	});
//	
//	var bamStrandPattArrow = SVG.addChild(bamStrandPatt,"path",{
//		"d":"M 1 1 L 8 5 L 1 9 Z",
//	});

	/*GRADIENT*/
	//var bamStrandForward = SVG.addChild(main,"linearGradient",{
		//"id":this.id+"bamStrandForward"
	//});
	//var bamStrandReverse = SVG.addChild(main,"linearGradient",{
		//"id":this.id+"bamStrandReverse"
	//});
	//var stop1 = SVG.addChild(bamStrandForward,"stop",{
		//"offset":"5%",
		//"stop-color":"#666"
	//});
	//var stop2 = SVG.addChild(bamStrandForward,"stop",{
		//"offset":"95%",
		//"stop-color":"#BBB"
	//});
	//var stop1 = SVG.addChild(bamStrandReverse,"stop",{
		//"offset":"5%",
		//"stop-color":"#BBB"
	//});
	//var stop2 = SVG.addChild(bamStrandReverse,"stop",{
		//"offset":"95%",
		//"stop-color":"#666"
	//});
	/*GRADIENT*/
	
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
	
	this.fnTitleMouseEnter = function(){
//		over.setAttribute("opacity","0.1");
		//titlebar.setAttribute("width",74+textWidth);
		titlebar.setAttribute("opacity","0.1");
		titlebar.setAttribute("fill","gray");
		titleText.setAttribute("opacity","1.0");
		//upRect.setAttribute("visibility","visible");
		//downRect.setAttribute("visibility","visible");
		//if(_this.closable == true){ hideRect.setAttribute("visibility","visible"); }
//		settingsRect.setAttribute("visibility","visible");//TODO not implemented yet, hidden for now...
	};
	this.fnTitleMouseLeave = function(){
////	over.setAttribute("opacity","0.0");
		//titlebar.setAttribute("width",textWidth);
		titlebar.setAttribute("opacity","0.6");
		titlebar.setAttribute("fill","transparent");
		titleText.setAttribute("opacity","0.4");
		//upRect.setAttribute("visibility","hidden");
		//downRect.setAttribute("visibility","hidden");
		//hideRect.setAttribute("visibility","hidden");
		//settingsRect.setAttribute("visibility","hidden");
	};

	$(titleGroup).off("mouseenter");
	$(titleGroup).off("mouseleave");
	$(titleGroup).mouseenter(this.fnTitleMouseEnter);
	$(titleGroup).mouseleave(this.fnTitleMouseLeave);
	
	//$([upRect,downRect,hideRect,settingsRect]).mouseover(function(event){
		//this.setAttribute("opacity","1.0");
	//});
	//$([upRect,downRect,hideRect,settingsRect]).mouseleave(function(event){
		//this.setAttribute("opacity","0.6");
	//});
//
	//$(settingsRect).mouseover(function(event){
		//titlebar.setAttribute("height",22+22);
	//});
	//$(settingsRect).mouseleave(function(event){
		//titlebar.setAttribute("height",22);
	//});
	//
	//set initial values when hide due mouseleave event not fires when hideTrack from TrackSvgLayout
	//$(hideRect).click(function(event){
		//titlebar.setAttribute("width",textWidth);
		//titlebar.setAttribute("opacity","0.6");
		//titleText.setAttribute("opacity","0.4");
		//upRect.setAttribute("visibility","hidden");
		//downRect.setAttribute("visibility","hidden");
		//hideRect.setAttribute("visibility","hidden");
		//settingsRect.setAttribute("visibility","hidden");
	//});
	
	
	this.invalidZoomText = SVG.addChild(titleGroup,"text",{
		"x":154,
		"y":24,
		"font-size": 10,
		"opacity":"0.6",
		"fill":"black",
		"visibility":"hidden"
	});
	this.invalidZoomText.textContent = "This level of zoom isn't appropiate for this track";


	var loadingImg = '<?xml version="1.0" encoding="utf-8"?>'+
	'<svg version="1.1" width="22px" height="22px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'+
	'<defs>'+
		'<g id="pair">'+
			'<ellipse cx="7" cy="0" rx="4" ry="1.7" style="fill:#ccc; fill-opacity:0.5;"/>'+
			'<ellipse cx="-7" cy="0" rx="4" ry="1.7" style="fill:#aaa; fill-opacity:1.0;"/>'+
		'</g>'+
	'</defs>'+
	'<g transform="translate(11,11)">'+
		'<g>'+
			'<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="1.5s" repeatDur="indefinite"/>'+
			'<use xlink:href="#pair"/>'+
			'<use xlink:href="#pair" transform="rotate(45)"/>'+
			'<use xlink:href="#pair" transform="rotate(90)"/>'+
			'<use xlink:href="#pair" transform="rotate(135)"/>'+
		'</g>'+
	'</g>'+
	'</svg>';
	
	this.loading = SVG.addChildImage(main,{
		"xlink:href":"data:image/svg+xml,"+encodeURIComponent(loadingImg),
		"x":10,
		"y":0,
		"width":22,
		"height":22,
		"visibility":"hidden"
	});
	
	//ya no se usa, es track svg layout el q captura el evento de click y arrastrar
	//$(this.parent).mousedown(function(event) {
		//var x = parseInt(features.getAttribute("x")) - event.clientX;
		//$(this).mousemove(function(event){
			//features.setAttribute("x",x + event.clientX);
		//});
	//});
	//$(this.parent).mouseup(function(event) {
		//$(this).off('mousemove');
	//});
	
	
	this.main = main;
	this.titleGroup = titleGroup;
	this.titlebar = titlebar;
	this.titleText = titleText;
	//this.upRect = upRect;
	//this.downRect = downRect;
	//this.hideRect = hideRect;
	//this.settingsRect = settingsRect;
	this.features = features;
	
	this.rendered = true;
	this.status = "ready";
};


//RENDERS for MultiFeatureRender, sequence, Snp, Histogram

TrackSvg.prototype.MultiFeatureRender = function(response){//featureList
	var featureList = this._getFeaturesByChunks(response);
	//here we got features array
	var _this = this;
	console.time("Multirender ["+featureList.length+"] "+ response.params.resource);
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
		
		var textHeight = 9;
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
		
		
		var rowHeight = textHeight+10;
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
					position: {target:  "mouse", adjust: {x:15, y:0},  viewport: $(window), effect: false},
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
	console.timeEnd("Multirender ["+featureList.length+"] "+ response.params.resource);
};

TrackSvg.prototype.BamRender = function(response){
	var _this = this;

	//CHECK VISUALIZATON MODE
	var viewAsPairs = false;
	if(response.params["view_as_pairs"] != null){
		viewAsPairs = true;
	}
	console.log("viewAsPairs "+viewAsPairs);
	var insertSizeMin = 0;
	var insertSizeMax = 0;
	var variantColor = "orangered";
	if(response.params["insert_size_interval"] != null){
		insertSizeMin = response.params["insert_size_interval"].split(",")[0];
		insertSizeMax = response.params["insert_size_interval"].split(",")[1];
	}
	console.log("insertSizeMin "+insertSizeMin);
	console.log("insertSizeMin "+insertSizeMax);

	//Prevent browser context menu
	$(this.features).contextmenu(function(e) {
		console.log("click derecho")
		//e.preventDefault();
	});
	
	console.time("BamRender "+ response.params.resource);
	
	response = this._removeDisplayedChunks(response);
	var chunkList = response.items;

	var middle = this.width/2;
	
	var bamCoverGroup = SVG.addChild(_this.features,"g",{
		"class":"bamCoverage",
		"cursor": "pointer"
	});
	var bamReadGroup = SVG.addChild(_this.features,"g",{
		"class":"bamReads",
		"cursor": "pointer"
	});

	var drawCoverage = function(chunk){
		//var coverageList = chunk.coverage.all;
		var coverageList = chunk.coverage.all;
		var coverageListA = chunk.coverage.a;
		var coverageListC = chunk.coverage.c;
		var coverageListG = chunk.coverage.g;
		var coverageListT = chunk.coverage.t;
		var start = parseInt(chunk.start);
		var end = parseInt(chunk.end);
		var pixelWidth = (end-start+1)*_this.pixelBase;
		
		var points = "", pointsA = "", pointsC = "", pointsG = "", pointsT = "";
		var baseMid = (_this.pixelBase/2)-0.5;//4.5 cuando pixelBase = 10
		
		var x,y, p = parseInt(chunk.start);
		var lineA = "", lineC = "", lineG = "", lineT = "";
		var coverageNorm = 200, covHeight = 50;
		for ( var i = 0; i < coverageList.length; i++) {
			//x = _this.pixelPosition+middle-((_this.position-p)*_this.pixelBase)+baseMid;
			x = _this.pixelPosition+middle-((_this.position-p)*_this.pixelBase);
            xx = _this.pixelPosition+middle-((_this.position-p)*_this.pixelBase)+_this.pixelBase;
			
			lineA += x+","+coverageListA[i]/coverageNorm*covHeight+" ";
			lineA += xx+","+coverageListA[i]/coverageNorm*covHeight+" ";
			lineC += x+","+(coverageListC[i]+coverageListA[i])/coverageNorm*covHeight+" ";
			lineC += xx+","+(coverageListC[i]+coverageListA[i])/coverageNorm*covHeight+" ";
			lineG += x+","+(coverageListG[i]+coverageListC[i]+coverageListA[i])/coverageNorm*covHeight+" ";
			lineG += xx+","+(coverageListG[i]+coverageListC[i]+coverageListA[i])/coverageNorm*covHeight+" ";
			lineT += x+","+(coverageListT[i]+coverageListG[i]+coverageListC[i]+coverageListA[i])/coverageNorm*covHeight+" ";
			lineT += xx+","+(coverageListT[i]+coverageListG[i]+coverageListC[i]+coverageListA[i])/coverageNorm*covHeight+" ";
			
			p++;
		}

		//reverse to draw the polylines(polygons) for each nucleotid
		var rlineC = lineC.split(" ").reverse().join(" ").trim();
		var rlineG = lineG.split(" ").reverse().join(" ").trim();
		var rlineT = lineT.split(" ").reverse().join(" ").trim();
		
		var firstPoint = _this.pixelPosition+middle-((_this.position-parseInt(chunk.start))*_this.pixelBase)+baseMid;
		var lastPoint = _this.pixelPosition+middle-((_this.position-parseInt(chunk.end))*_this.pixelBase)+baseMid;
        var polA = SVG.addChild(bamCoverGroup,"polyline",{
			"points":firstPoint+",0 "+lineA+lastPoint+",0",
			//"opacity":"1",
			//"stroke-width":"1",
			//"stroke":"gray",
			"fill":"green"
		});
        var polC = SVG.addChild(bamCoverGroup,"polyline",{
			"points":lineA+" "+rlineC,
			//"opacity":"1",
			//"stroke-width":"1",
			//"stroke":"black",
			"fill":"blue"
		});
        var polG = SVG.addChild(bamCoverGroup,"polyline",{
			"points":lineC+" "+rlineG,
			//"opacity":"1",
			//"stroke-width":"1",
			//"stroke":"black",
			"fill":"gold"
		});
        var polT = SVG.addChild(bamCoverGroup,"polyline",{
			"points":lineG+" "+rlineT,
			//"opacity":"1",
			//"stroke-width":"1",
			//"stroke":"black",
			"fill":"red"
		});
		
		var dummyRect = SVG.addChild(bamCoverGroup,"rect",{
			"x":_this.pixelPosition+middle-((_this.position-start)*_this.pixelBase),
			"y":0,
			"width":pixelWidth,
			"height":covHeight,
			"opacity":"0.5",
			"fill": "lightgray",
			"cursor": "pointer"
		});
		$(dummyRect).qtip({
			content:" ",
			position: {target: 'mouse', adjust: {x:15, y:0}, viewport: $(window), effect: false},
			style: { width:true, classes: 'ui-tooltip-shadow'}
		});
		_this.trackSvgLayout.onMousePosition.addEventListener(function(sender,obj){
			var pos = obj.mousePos-parseInt(chunk.start);
			//if(coverageList[pos]!=null){
				var str = 'depth: <span class="ssel">'+coverageList[pos]+'</span><br>'+
						'<span style="color:green">A</span>: <span class="ssel">'+chunk.coverage.a[pos]+'</span><br>'+
						'<span style="color:blue">C</span>: <span class="ssel">'+chunk.coverage.c[pos]+'</span><br>'+
						'<span style="color:darkgoldenrod">G</span>: <span class="ssel">'+chunk.coverage.g[pos]+'</span><br>'+
						'<span style="color:red">T</span>: <span class="ssel">'+chunk.coverage.t[pos]+'</span><br>';
				$(dummyRect).qtip('option', 'content.text', str ); 
			//}
		});
	};
	
	var drawSingleRead = function(feature){
		//var start = feature.start;
		//var end = feature.end;
		var start = feature.unclippedStart;
		var end = feature.unclippedEnd;
		var diff = feature.diff;
		/*get type settings object*/
		var settings = _this.types[feature.featureType];
		var strand = settings.getStrand(feature);
		var color = settings.getColor(feature, _this.region.chromosome);
		
		if(insertSizeMin != 0 && insertSizeMax != 0 && !settings.getMateUnmappedFlag(feature)){
			if(Math.abs(feature.inferredInsertSize) > insertSizeMax){
				color = 'maroon';
			}
			if(Math.abs(feature.inferredInsertSize) < insertSizeMin){
				color = 'navy';
			}
		}

		/*transform to pixel position*/
		var width = ((end-start)+1)*_this.pixelBase;
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
				var readEls = [];
				var points = {
					"Reverse":x+","+(rowY+(settings.height/2))+" "+(x+5)+","+rowY+" "+(x+width-5)+","+rowY+" "+(x+width-5)+","+(rowY+settings.height)+" "+(x+5)+","+(rowY+settings.height),
					"Forward":x+","+rowY+" "+(x+width-5)+","+rowY+" "+(x+width)+","+(rowY+(settings.height/2))+" "+(x+width-5)+","+(rowY+settings.height)+" "+x+","+(rowY+settings.height)
				}
				var poly = SVG.addChild(bamReadGroup,"polygon",{
					"points":points[strand],
					"stroke": settings.getStrokeColor(feature),
					"stroke-width": 1,
					"fill": color,
					"cursor": "pointer"
				});
				readEls.push(poly);

				//var rect = SVG.addChild(bamReadGroup,"rect",{
					//"x":x+offset[strand],
					//"y":rowY,
					//"width":width-4,
					//"height":settings.height,
					//"stroke": "white",
					//"stroke-width":1,
					//"fill": color,
					//"clip-path":"url(#"+_this.id+"cp)",
					//"fill": 'url(#'+_this.id+'bamStrand'+strand+')',
				//});
				//readEls.push(rect);
				
				if(diff != null && _this.zoom > 95){
					//var	t = SVG.addChild(bamReadGroup,"text",{
						//"x":x+1,
						//"y":rowY+settings.height-1,
						//"font-size":13,
						//"fill":"darkred",
						//"textLength":width,
						//"cursor": "pointer",
						//"font-family": "Ubuntu Mono"
					//});
					//t.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
					//t.textContent = diff;
					//readEls.push(t);
					var path = SVG.addChild(bamReadGroup,"path",{
						"d":Compbio.genBamVariants(diff, _this.pixelBase, x, rowY),
						"fill":variantColor
					});
					readEls.push(path);
				}
				
				$(readEls).qtip({
					content: {text:settings.getTipText(feature), title:settings.getTipTitle(feature)},
					position: {target:  "mouse", adjust: {x:15, y:0},  viewport: $(window), effect: false},
					style: { width:280,classes: 'ui-tooltip ui-tooltip-shadow'}
				});
				$(readEls).click(function(event){
					console.log(feature);
					_this.showInfoWidget({query:feature[settings.infoWidgetId], feature:feature, featureType:feature.featureType, adapter:_this.trackData.adapter});
				});
				break;
			}
			rowY += rowHeight;
//			textY += rowHeight;
		}
	};

	var drawPairedReads = function(read, mate){
		var readStart = read.unclippedStart;
		var readEnd = read.unclippedEnd;
		var mateStart = mate.unclippedStart;
		var mateEnd = mate.unclippedEnd;
		var readDiff = read.diff;
		var mateDiff = mate.diff;
		/*get type settings object*/
		var readSettings = _this.types[read.featureType];
		var mateSettings = _this.types[mate.featureType];
		var readColor = readSettings.getColor(read, _this.region.chromosome);
		var mateColor = mateSettings.getColor(mate, _this.region.chromosome);
		var readStrand = readSettings.getStrand(read);
		var matestrand = mateSettings.getStrand(mate);

		if(insertSizeMin != 0 && insertSizeMax != 0){
			if(Math.abs(read.inferredInsertSize) > insertSizeMax){
				readColor = 'maroon';
				mateColor = 'maroon';
			}
			if(Math.abs(read.inferredInsertSize) < insertSizeMin){
				readColor = 'navy';
				mateColor = 'navy';
			}
		}

		var pairStart = readStart;
		var pairEnd = mateEnd;
		if(mateStart <= readStart){
			pairStart = mateStart;
		}
		if(readEnd >= mateEnd){
			pairEnd = readEnd;
		}
		
		/*transform to pixel position*/
		var pairWidth = ((pairEnd-pairStart)+1)*_this.pixelBase;
		var pairX = _this.pixelPosition+middle-((_this.position-pairStart)*_this.pixelBase);
		
		var readWidth = ((readEnd-readStart)+1)*_this.pixelBase;
		var readX = _this.pixelPosition+middle-((_this.position-readStart)*_this.pixelBase);
		
		var mateWidth = ((mateEnd-mateStart)+1)*_this.pixelBase;
		var mateX = _this.pixelPosition+middle-((_this.position-mateStart)*_this.pixelBase);

		var rowHeight = 12;
		var rowY = 70;
//		var textY = 12+settings.height;

		while(true){
			if(_this.renderedArea[rowY] == null){
				_this.renderedArea[rowY] = new FeatureBinarySearchTree();
			}
			var enc = _this.renderedArea[rowY].add({start: pairX, end: pairX+pairWidth-1});
			if(enc){
				var readEls = [];
				var mateEls = [];
				var readPoints = {
					"Reverse":readX+","+(rowY+(readSettings.height/2))+" "+(readX+5)+","+rowY+" "+(readX+readWidth-5)+","+rowY+" "+(readX+readWidth-5)+","+(rowY+readSettings.height)+" "+(readX+5)+","+(rowY+readSettings.height),
					"Forward":readX+","+rowY+" "+(readX+readWidth-5)+","+rowY+" "+(readX+readWidth)+","+(rowY+(readSettings.height/2))+" "+(readX+readWidth-5)+","+(rowY+readSettings.height)+" "+readX+","+(rowY+readSettings.height)
				}
				var readPoly = SVG.addChild(bamReadGroup,"polygon",{
					"points":readPoints[readStrand],
					"stroke": readSettings.getStrokeColor(read),
					"stroke-width": 1,
					"fill": readColor,
					"cursor": "pointer"
				});
				readEls.push(readPoly);
				var matePoints = {
					"Reverse":mateX+","+(rowY+(mateSettings.height/2))+" "+(mateX+5)+","+rowY+" "+(mateX+mateWidth-5)+","+rowY+" "+(mateX+mateWidth-5)+","+(rowY+mateSettings.height)+" "+(mateX+5)+","+(rowY+mateSettings.height),
					"Forward":mateX+","+rowY+" "+(mateX+mateWidth-5)+","+rowY+" "+(mateX+mateWidth)+","+(rowY+(mateSettings.height/2))+" "+(mateX+mateWidth-5)+","+(rowY+mateSettings.height)+" "+mateX+","+(rowY+mateSettings.height)
				}
				var matePoly = SVG.addChild(bamReadGroup,"polygon",{
					"points":matePoints[matestrand],
					"stroke": mateSettings.getStrokeColor(mate),
					"stroke-width": 1,
					"fill": mateColor,
					"cursor": "pointer"
				});
				mateEls.push(matePoly);

				var line = SVG.addChild(bamReadGroup,"line",{
					"x1":(readX+readWidth),
					"y1":(rowY+(readSettings.height/2)),
					"x2":mateX,
					"y2":(rowY+(readSettings.height/2)),
					"stroke-width": "1",
					"stroke": "gray",
					//"stroke-color": "black",
					"cursor": "pointer"
				});
				
				if(_this.zoom > 95){
					if(readDiff != null){
						var readPath = SVG.addChild(bamReadGroup,"path",{
							"d":Compbio.genBamVariants(readDiff, _this.pixelBase, readX, rowY),
							"fill":variantColor
						});
						readEls.push(readPath);
					}
					if(mateDiff != null){
						var matePath = SVG.addChild(bamReadGroup,"path",{
							"d":Compbio.genBamVariants(mateDiff, _this.pixelBase, mateX, rowY),
							"fill":variantColor
						});
						mateEls.push(matePath);
					}
				}
				
				$(readEls).qtip({
					content: {text:readSettings.getTipText(read), title:readSettings.getTipTitle(read)},
					position: {target:  "mouse", adjust: {x:15, y:0},  viewport: $(window), effect: false},
					style: { width:280,classes: 'ui-tooltip ui-tooltip-shadow'}
				});
				$(readEls).click(function(event){
					console.log(read);
					_this.showInfoWidget({query:read[readSettings.infoWidgetId], feature:read, featureType:read.featureType, adapter:_this.trackData.adapter});
				});
				$(mateEls).qtip({
					content: {text:mateSettings.getTipText(mate), title:mateSettings.getTipTitle(mate)},
					position: {target:  "mouse", adjust: {x:15, y:0},  viewport: $(window), effect: false},
					style: { width:280,classes: 'ui-tooltip ui-tooltip-shadow'}
				});
				$(mateEls).click(function(event){
					console.log(mate);
					_this.showInfoWidget({query:mate[mateSettings.infoWidgetId], feature:mate, featureType:mate.featureType, adapter:_this.trackData.adapter});
				});
				break;
			}
			rowY += rowHeight;
//			textY += rowHeight;
		}
	};

	var drawChunk = function(chunk){
		drawCoverage(chunk);
		var readList = chunk.data;
		for ( var i = 0, li = readList.length; i < li; i++) {
			var read = readList[i];
			if(viewAsPairs){
				var nextRead = readList[i+1];
				if(nextRead!=null){
					if(read.name == nextRead.name){
						drawPairedReads(read,nextRead);
						i++;
					}else{
						drawSingleRead(read);
					}
				}
			}else{
				drawSingleRead(read);
			}
		}
	};
	
	//process features
	if(chunkList.length>0){
		for ( var i = 0, li = chunkList.length; i < li; i++) {
					if(chunkList[i].data.length > 0){
						drawChunk(chunkList[i]);
					}
		}
		var newHeight = Object.keys(this.renderedArea).length*24;
		if(newHeight>0){
			this.setHeight(newHeight+/*margen entre tracks*/10+70);
		}
	}
	console.timeEnd("BamRender "+ response.params.resource);
};

TrackSvg.prototype.GeneTranscriptRender = function(response){
	var featureList = this._getFeaturesByChunks(response);
	//here we got features array
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
		
		var rowHeight = 20;
		var rowY = 0;
		var textY = 10+settings.height;
		
		
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
					position: {target:  "mouse", adjust: {x:15, y:0},  viewport: $(window), effect: false},
					style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'}
				});

				$([rect,text]).click(function(event){
					_this.showInfoWidget({query:feature[settings.infoWidgetId], feature:feature, featureType:feature.featureType , adapter:_this.trackData.adapter});
				});


				//paint transcripts
				var checkRowY = rowY+rowHeight;
				var checkTextY = textY+rowHeight;
				if(feature.transcripts!=null){
					for(var i = 0, leni = feature.transcripts.length; i < leni; i++){/*Loop over transcripts*/
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
							"y":checkRowY+1,
							"width":transcriptWidth,
							"height":settings.height,
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
							position: {target: 'mouse', adjust: {x:15, y:0}, viewport: $(window), effect: false},
							style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'}
						});
						$(transcriptGroup).click(function(event){
							var query = this.getAttribute("widgetId");
							_this.showInfoWidget({query:query, feature:transcript, featureType:transcript.featureType, adapter:_this.trackData.adapter});
						});

						//paint exons
						for(var e = 0, lene = feature.transcripts[i].exonToTranscripts.length; e < lene; e++){/* loop over exons*/
							var e2t = feature.transcripts[i].exonToTranscripts[e];
							var exonSettings = _this.types[e2t.exon.featureType];
							var exonStart = parseInt(e2t.exon.start);
							var exonEnd =  parseInt(e2t.exon.end);

							var exonX = _this.pixelPosition+middle-((_this.position-exonStart)*_this.pixelBase);
							var exonWidth = (exonEnd-exonStart+1) * ( _this.pixelBase);

							var exonGroup = SVG.addChild(_this.features,"g");
							
							$(exonGroup).qtip({
								content: {text:exonSettings.getTipText(e2t,transcript), title:exonSettings.getTipTitle(e2t)},
								position: {target: 'mouse', adjust: {x:15, y:0}, viewport: $(window), effect: false},
								style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'}
							});
							
							var eRect = SVG.addChild(exonGroup,"rect",{//paint exons in white without coding region
								"i":i,
								"x":exonX,
								"y":checkRowY-1,
								"width":exonWidth,
								"height":exonSettings.height,
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
									"height":exonSettings.height,
									"stroke": color,
									"stroke-width": 1,
									"fill": color,
									"cursor": "pointer"
								});
								//XXX draw phase only at zoom 100, where this.pixelBase=10
								for(var p = 0, lenp = 3 - e2t.phase; p < lenp && Math.round(_this.pixelBase)==10 && e2t.phase!=-1; p++){//==10 for max zoom only
									SVG.addChild(exonGroup,"rect",{
										"i":i,
										"x":codingX+(p*10),
										"y":checkRowY-1,
										"width":_this.pixelBase,
										"height":exonSettings.height,
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

TrackSvg.prototype.SequenceRender = function(response){
	//var featureList = this._getFeaturesByChunks(response);
	//here we got features array
	console.time("Sequence render "+response.items.sequence.length);
		var chromeFontSize = "16";
		var firefoxFontSize = "19";
		var chromeFontOff = "16";
		var fontOff = 1;
		if(this.zoom == 95){
			chromeFontSize = "10";
			firefoxFontSize = "10";
			fontOff = 0;
		}

		
		this.invalidZoomText.setAttribute("visibility", "hidden");
		var middle = this.width/2;

		
		//if(featureList.length > 0){//???
		//for ( var j = 0; j < featureList.length; j++) {
			//var seqString = featureList[j].sequence;
			//var seqStart = featureList[j].start;
			var width = 1*this.pixelBase;
			
	//		if(!this.settings.color){
	//			this.settings.color = {A:"#009900", C:"#0000FF", G:"#857A00", T:"#aa0000", N:"#555555"};
	//		}
			
			var start = response.items.start;
			var seqStart = response.items.start;
			var seqString = response.items.sequence;

			if(jQuery.browser.mozilla){
				var x = this.pixelPosition+middle-((this.position-start)*this.pixelBase);
				var text = SVG.addChild(this.features,"text",{
					"x":x+fontOff,
					"y":13,
					"font-size":firefoxFontSize,
					"style":"letter-spacing:8;",//not implemented in firefox, https://developer.mozilla.org/en-US/docs/SVG_in_Firefox
					"font-family": "Ubuntu Mono"
				});
				text.textContent = seqString;
			}else{
				for ( var i = 0; i < seqString.length; i++) {
					var x = this.pixelPosition+middle-((this.position-start)*this.pixelBase);
					start++;
					var text = SVG.addChild(this.features,"text",{
						"x":x+fontOff,
						"y":12,
						"font-size":chromeFontSize,
						"font-family": "Ubuntu Mono",
						"fill":SEQUENCE_COLORS[seqString.charAt(i)]
					});
					text.textContent = seqString.charAt(i);
					
					$(text).qtip({
						content:seqString.charAt(i)+" "+(seqStart+i).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
						position: {target: 'mouse', adjust: {x:15, y:0}, viewport: $(window), effect: false},
						style: { width:true, classes: 'ui-tooltip-light ui-tooltip-shadow'}
					});
				}
				
			}
		//}
			
		//}
		console.timeEnd("Sequence render "+response.items.sequence.length);
		this.trackSvgLayout.setNucleotidPosition(this.position);
};


TrackSvg.prototype.HistogramRender = function(response){
	var featureList = this._getFeaturesByChunks(response);
	//here we got features array
	
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
};


TrackSvg.prototype.showInfoWidget = function(args){
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

TrackSvg.prototype._getFeaturesByChunks = function(response, filters){
	//Returns an array avoiding already drawn features in this.chunksDisplayed
	var chunks = response.items;
	var dataType = response.params.dataType;
	var chromosome = response.params.chromosome;
	var features = [];
	
	var feature, displayed, featureFirstChunk, featureLastChunk, features = [];
	for ( var i = 0, leni = chunks.length; i < leni; i++) {
		if(this.chunksDisplayed[chunks[i].key+dataType]!=true){//check if any chunk is already displayed and skip it

			for ( var j = 0, lenj = chunks[i][dataType].length; j < lenj; j++) {
				feature = chunks[i][dataType][j];

					//check if any feature has been already displayed by another chunk
					displayed = false;
					featureFirstChunk = this.trackData.adapter.featureCache._getChunk(feature.start);
					featureLastChunk = this.trackData.adapter.featureCache._getChunk(feature.end);
					for(var f=featureFirstChunk; f<=featureLastChunk; f++){
						var fkey = chromosome+":"+f;
						if(this.chunksDisplayed[fkey+dataType]==true){
							displayed = true;
							break;
						}
					}
					if(!displayed){
						//apply filter
						// if(filters != null) {
						//		var pass = true;
						// 		for(filter in filters) {
						// 			pass = pass && filters[filter](feature);
						//			if(pass == false) {
						//				break;
						//			}				
						// 		}
						//		if(pass) features.push(feature);
						// } else {
						features.push(feature);
					}
			}
			this.chunksDisplayed[chunks[i].key+dataType]=true;
		}
	}
	return features;

	
	//we only get those features in the region AND check if chunk has been already displayed
	//if(feature.end > region.start && feature.start < region.end){

	//}
}

TrackSvg.prototype._removeDisplayedChunks = function(response){
	//Returns an array avoiding already drawn features in this.chunksDisplayed
	var chunks = response.items;
	var newChunks = []; 
	var dataType = response.params.dataType;
	var chromosome = response.params.chromosome;
	var features = [];
	
	var feature, displayed, featureFirstChunk, featureLastChunk, features = [];
	for ( var i = 0, leni = chunks.length; i < leni; i++) {//loop over chunks
		if(this.chunksDisplayed[chunks[i].key+dataType] != true){//check if any chunk is already displayed and skip it
		
			features = []; //initialize array, will contain features not drawn by other drawn chunks
			for ( var j = 0, lenj = chunks[i][dataType].length; j < lenj; j++) {
				feature = chunks[i][dataType][j];

					//check if any feature has been already displayed by another chunk
					displayed = false;
					featureFirstChunk = this.trackData.adapter.featureCache._getChunk(feature.start);
					featureLastChunk = this.trackData.adapter.featureCache._getChunk(feature.end);
					for(var f=featureFirstChunk; f<=featureLastChunk; f++){//loop over chunks touched by this feature
						var fkey = chromosome+":"+f;
						if(this.chunksDisplayed[fkey+dataType]==true){
							displayed = true;
							break;
						}
					}
					if(!displayed){
						features.push(feature);
					}
			}
			this.chunksDisplayed[chunks[i].key+dataType]=true;
			chunks[i][dataType] = features;//update features array
			newChunks.push(chunks[i]);
		}
	}
	response.items = newChunks;
	return response;
}

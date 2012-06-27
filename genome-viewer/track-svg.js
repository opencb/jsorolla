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
	
	this.settings = {};
	
	
	this.interval=null;
	this.histogram=null;
	this.transcript=null;
	
	if (args != null){
		if(args.title != null){
			this.title = args.title;
		}
		if(args.id != null){
			this.id = args.id;
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
		if(args.histogramZoom != null){
			this.histogramZoom = args.histogramZoom;
		}
		if(args.transcriptZoom != null){//gene only
			this.transcriptZoom = args.transcriptZoom;
		}
		if(args.settings != null){
			this.settings = args.settings;
		}
		if(args.titleVisibility != null){
			this.titleVisibility = args.titleVisibility;
		}
		if(args.featuresRender != null){
			switch(args.featuresRender){
				case "MultiFeatureRender": this.featuresRender = this.MultiFeatureRender; break;
				case "SequenceRender": this.featuresRender = this.SequenceRender; break;
				default: this.featuresRender = this.MultiFeatureRender;
			}
			this.defaultRender = this.featuresRender;
		}
	}
	
	if(this.settings.closable == null){
		this.settings.closable = true;
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
		this.features.setAttribute("height",height);
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
		"x":-this.pixelPosition,
		"width":this.lienzo,
		"height":this.height
	});
	
	var titleGroup = SVG.addChild(main,"g",{
		visibility:this.titleVisibility	
	});
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
		if(_this.settings.closable){ hideRect.setAttribute("visibility","visible"); }
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
	
	$([upRect,downRect,hideRect,settingsRect]).mouseover(function(event){
		this.setAttribute("opacity","1.0");
	});
	$([upRect,downRect,hideRect,settingsRect]).mouseleave(function(event){
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
	console.log(featureList.length);
	console.log(featureList);
	
	var middle = this.width/2;
	
	var draw = function(feature){
		var width = (feature.end-feature.start)+1;
		var color = _this.settings.color[feature[_this.settings.colorField]];
		
		//snps can be negative
		if(width<0){
			width=Math.abs(width);
		}
		//snps with same start - end
		if(width==0){
			width=1;
		}
		width = width * _this.pixelBase;
		
		var x = _this.pixelPosition+middle-((_this.position-feature.start)*_this.pixelBase);
		
		try{
			var maxWidth = Math.max(width, feature[_this.settings.label].length*8); //XXX cuidado : text.getComputedTextLength()
		}catch(e){
			var maxWidth = 72;
		}
		
		var rowHeight = 24;
		var rowY = 0;
		var textY = 12+_this.settings.height;
		
		
		
		while(true){
			if(_this.renderedArea[rowY] == null){
				_this.renderedArea[rowY] = new FeatureBinarySearchTree();
			}
			var enc = _this.renderedArea[rowY].add({start: x, end: x+maxWidth-1});
			
			if(enc){
				var rect = SVG.addChild(_this.features,"rect",{
					"i":i,
					"x":x,
					"y":rowY,
					"width":width,
					"height":_this.settings.height,
					"stroke": "#3B0B0B",
					"stroke-width": 0.5,
					"fill": color,
					"cursor": "pointer"
				});
				rect.textContent = feature[_this.settings.label];
				
				var text = SVG.addChild(_this.features,"text",{
					"i":i,
					"x":x,
					"y":textY,
					"font-size":10,
					"opacity":null,
					"fill":"black",
					"cursor": "pointer"
				});
				text.textContent = feature[_this.settings.label];
				
				$([rect,text]).qtip({
					content: _this.formatTooltip({feature:feature, resource:feature.resource }),
					position: {target: 'mouse',adjust: { mouse: true,screen: true }},
					 style: { 
					      background: 'honeydew',
					      border: {
					         width: 1,
					         radius: 1,
					         color: 'deepskyblue'
					      }
					   }
				});
				
				$([rect,text]).click(function(event){
					var feature = featureList[this.getAttribute("i")];
					_this.showInfoWidget({query:feature[_this.settings.infoWidgetId], feature:feature, resource:feature.resource });
				});
				
				
				break;
			}
			rowY += rowHeight;
			textY += rowHeight;
		}
	};
	
	
	//process features and check transcripts
	for ( var i = 0, leni = featureList.length; i < leni; i++) {
		var feature = featureList[i];
		draw(feature);
		if(feature.transcripts != null){
			console.log(feature.transcripts.length);
			for ( var j = 0, lenj = feature.transcripts.length; j < lenj; j++) {
				var transcript = feature.transcripts[j];
//				console.log(transcript);
				draw(transcript);
			}
//			for ( var j = 0; j < feature.transcripts.length; j++) {
//				
//			}
		}
	}
	var newHeight = Object.keys(this.renderedArea).length*24;
	if(newHeight>0){
		this.setHeight(newHeight+/*margen entre tracks*/10);
	}
	console.timeEnd("all");
};

TrackSvg.prototype.SequenceRender = function(featureList){
	var middle = this.width/2;
	
	if(featureList.length > 0){
		var seqString = featureList[0].sequence;
		var seqStart = featureList[0].start;
		var width = 1*this.pixelBase;
		
		if(!this.settings.color){
			this.settings.color = {A:"#009900", C:"#0000FF", G:"#857A00", T:"#aa0000", N:"#555555"};
		}
		
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
					"fill":this.settings.color[seqString.charAt(i)]
				});
				text.textContent = seqString.charAt(i);
				
				$(text).qtip({
					content:(seqStart+i).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"),
					position: {target: 'mouse',adjust: { mouse: true,screen: true }},
					style: { color: 'dodgerblue' }
				});
			}
			
		}
	}
	console.timeEnd("all");
};


TrackSvg.prototype.HistogramRender = function(featureList){
	var middle = this.width/2;
//	console.log(featureList);
	histogramHeight = 50;
	for ( var i = 0, len = featureList.length; i < len; i++) {
		var feature = featureList[i];
		var width = (feature.end-feature.start);
		var color = this.settings.histogramColor;
		
		width = width * this.pixelBase;
		var x = this.pixelPosition+middle-((this.position-feature.start)*this.pixelBase);
		var height = histogramHeight * featureList[i].value;
		if(featureList[i].value==null){
			console.log(featureList[i]);
		}
		var rect = SVG.addChild(this.features,"rect",{
			"x":x,
			"y":histogramHeight - height,
			"width":width,
			"height":height,
			"stroke": "#3B0B0B",
			"stroke-width": 0.5,
			"fill": color,
			"cursor": "pointer"
		});
	}
	this.setHeight(histogramHeight+/*margen entre tracks*/10);
	console.timeEnd("all");
};

TrackSvg.prototype.SnpRender = function(featureList){
	
};

TrackSvg.prototype.formatTooltip = function(args){
	var str="";
	switch (args.type) {
	case "snp":
		str +='<span class="ok">'+args.feature.name+'</span><br>'+ 
		'alleles:&nbsp;<span class="ssel">'+args.feature.alleleString+'</span><br>'+
		'SO:&nbsp;<span class="emph" style="color:'+this.settings.color[args.feature[this.settings.colorField]]+';">'+args.feature.displaySoConsequence+'</span><br>';
		break;
	case "gene":
		str += '<span class="ok">'+args.feature.externalName+'</span><br>'+
		'Ensembl&nbsp;ID:&nbsp;<span class="ssel">'+args.feature.stableId+'</span><br>'+
		'biotype:&nbsp;<span class="emph" style="color:'+this.settings.color[args.feature[this.settings.colorField]]+';">'+args.feature.biotype+'</span><br>';
		break;
	default: break;
	}
	
	str += 'start:&nbsp;<span class="emph">'+args.feature.start+'</span><br>'+
	'end:&nbsp;<span class="emph">'+args.feature.end+'</span><br>'+
	'strand:&nbsp;<span class="emph">'+args.feature.strand+'</span><br>'+
	'length:&nbsp;<span class="info">'+(args.feature.end-args.feature.start+1)+'</span><br>';
	return str;
};

TrackSvg.prototype.showInfoWidget = function(args){
	switch (args.resource) {
	case "gene": new GeneInfoWidget(null,this.trackData.adapter.species).draw(args); break;
	case "snp" : new SnpInfoWidget(null,this.trackData.adapter.species).draw(args); break;	
	default: console.log("No infowidget associated to "+args.resource); break;
	}
};

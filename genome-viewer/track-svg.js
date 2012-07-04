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
	
	this.closable = true;
	this.types = FEATURE_TYPES;
	
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
		if(this.closable != null){
			this.closable = args.closable;
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
	
	var textWidth = 25+this.id.length*5;
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
		if(_this.closable == true){ hideRect.setAttribute("visibility","visible"); }
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
	
	var draw = function(feature, start, end){
		var width = (end-start)+1;
		//snps can be negative
		if(width<0){
			width=Math.abs(width);
		}
		//snps with same start - end
		if(width==0){
			width=1;
		}
		
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
			
			var enc;
			
			
			//XXX  TRANSCRIPTS DETECTION
			var rowAvailable=false;
//			debugger
			if(feature.featureType == "gene" && feature.transcripts != null){
//				console.log(_this.renderedArea);
				var checkRowY = rowY;
				rowAvailable = true;
				
				for ( var i = 0, leni = feature.transcripts.length+1; i < leni; i++) {
					if(_this.renderedArea[checkRowY] == null){
						_this.renderedArea[checkRowY] = new FeatureBinarySearchTree();
					}
					rowAvailable = !_this.renderedArea[checkRowY].contains({start: x, end: x+maxWidth-1});
					if(rowAvailable == false){
						enc = false;
						break;
					}
					checkRowY += rowHeight;
				}
				if(rowAvailable == true){
//					console.log(feature.transcripts);
					enc = true;
				}
			}else{
				enc = _this.renderedArea[rowY].add({start: x, end: x+maxWidth-1});
			}
			//XXX
			
			
			if(enc){
				var rect = SVG.addChild(_this.features,"rect",{
					"i":i,
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
//				console.log(settings.getLabel(feature));
				
				$([rect,text]).qtip({
					content: {text:_this.formatTip({feature:feature}), title:_this.formatTitleTip({feature:feature})},
					position: {target:  "mouse", adjust: {x:15, y:15},  viewport: $(window), effect: false},
					style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'},
				});
				
				$([rect,text]).click(function(event){
					_this.showInfoWidget({query:feature[settings.infoWidgetId], feature:feature, featureType:feature.featureType });
				});
				
				
				
				
//				//XXX
				if(rowAvailable == true){
					var checkRowY = rowY+rowHeight;
					var checkTextY = textY+rowHeight;
					for(var i = 0, leni = feature.transcripts.length; i < leni; i++){
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
						
						
						
						enc = _this.renderedArea[checkRowY].add({start: x, end: x+maxWidth-1});
						
						
//						//line to test
//						SVG.addChild(_this.features,"rect",{
//							"i":i,
//							"x":x,
//							"y":checkRowY+1,
//							"width":width,
//							"height":settings.height-3,
//							"fill": color,
//							"cursor": "pointer"
//						});
						
						// transcript width
//						if(transcriptWidth<0){
//							debugger
//						}
						var rect = SVG.addChild(_this.features,"rect",{
							"widgetId":transcript[settings.infoWidgetId],
							"x":transcriptX,
							"y":checkRowY+2,
							"width":transcriptWidth,
							"height":settings.height-3,
							"fill": "gray",
							"cursor": "pointer"
						});
						var text = SVG.addChild(_this.features,"text",{
							"widgetId":transcript[settings.infoWidgetId],
							"x":transcriptX,
							"y":checkTextY,
							"font-size":10,
							"opacity":null,
							"fill":"black",
							"cursor": "pointer"
						});
						text.textContent = settings.getLabel(transcript);
						
						
						$([rect,text]).qtip({
							content: {text:_this.formatTip({feature:transcript}), title: _this.formatTitleTip({feature:transcript})},
							position: {target: 'mouse', adjust: {x:15, y:15}, viewport: $(window), effect: false},
							style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'},
						});
						$([rect,text]).click(function(event){
							var query = this.getAttribute("widgetId");
							_this.showInfoWidget({query:query, /*feature:transcript,*/ featureType:transcript.featureType });
						});
						
						for(var e = 0, lene = feature.transcripts[i].exonToTranscripts.length; e < lene; e++){
							var e2t = feature.transcripts[i].exonToTranscripts[e];
							var settings = _this.types[e2t.exon.featureType];
							var exonStart = parseInt(e2t.exon.start);
							var exonEnd =  parseInt(e2t.exon.end);
							
							var exonX = _this.pixelPosition+middle-((_this.position-exonStart)*_this.pixelBase);
							var exonWidth = (exonEnd-exonStart+1) * ( _this.pixelBase);
							
							SVG.addChild(_this.features,"rect",{
								"i":i,
								"x":exonX,
								"y":checkRowY-1,
								"width":exonWidth,
								"height":settings.height+3,
								"stroke": "gray",
								"stroke-width": 1,
								"fill": "white",
								"cursor": "pointer"
							});
							
							var codingStart, codingEnd;
							codingStart = parseInt(e2t.genomicCodingStart);
							codingEnd = parseInt(e2t.genomicCodingEnd);
							
//							if(transcript.strand == 1) {
								if(transcript.codingRegionStart > exonStart && transcript.codingRegionStart < exonEnd) {
									codingStart = parseInt(transcript.codingRegionStart);
								}else {
									if(transcript.codingRegionEnd > exonStart && transcript.codingRegionEnd < exonEnd) {										
										codingEnd = parseInt(transcript.codingRegionEnd);										
									}
								}
//							}else {
								//se supone que la negativa la hace bien
//							}
							
							
							var codingX = _this.pixelPosition+middle-((_this.position-codingStart)*_this.pixelBase);
							var codingWidth = (codingEnd-codingStart+1) * ( _this.pixelBase);
							//XXX patch
							codingWidth = Math.max(0, codingWidth);
							
							if(codingWidth > 0){
								SVG.addChild(_this.features,"rect",{
									"i":i,
									"x":codingX,
									"y":checkRowY-1,
									"width":codingWidth,
									"height":settings.height+3,
									"stroke": color,
									"stroke-width": 1,
									"fill": color,
									"cursor": "pointer"
								});
							}
							for(var p = 0, lenp = 3 - e2t.phase; p < lenp && _this.pixelBase==10 && e2t.phase!=-1; p++){//==10 for max zoom only
								SVG.addChild(_this.features,"rect",{
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
						
						checkRowY += rowHeight;
						checkTextY += rowHeight;
					}
				}
//				//XXX
//				
				
				
				
				
				break;
			}
			rowY += rowHeight;
			textY += rowHeight;
		}
	};
	
	
	//process features and check transcripts
	for ( var i = 0, leni = featureList.length; i < leni; i++) {
		var feature = featureList[i];
//		if(feature.featureType==null){
//			feature.featureType = "feature";
//		}
		draw(feature,feature.start,feature.end);
	}
	var newHeight = Object.keys(this.renderedArea).length*24;
	if(newHeight>0){
		this.setHeight(newHeight+/*margen entre tracks*/10);
	}
//	console.timeEnd("all");
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
					style: { width:true, classes: 'ui-tooltip-light ui-tooltip-shadow'},
				});
			}
			
		}
	}
	console.timeEnd("all");
};


TrackSvg.prototype.HistogramRender = function(featureList){
	var middle = this.width/2;
//	console.log(featureList);
	var histogramHeight = 50;
	console.log(featureList.length);
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
	var rect = SVG.addChild(this.features,"polyline",{
		"points":points,
		"stroke": "#000000",
		"stroke-width": 0.2,
		"fill": color,
		"cursor": "pointer"
	});
	this.setHeight(histogramHeight+/*margen entre tracks*/10);
	console.timeEnd("all");
};

TrackSvg.prototype.SnpRender = function(featureList){
	
};

TrackSvg.prototype.formatTip = function(args){
	var settings = this.types[args.feature.featureType];
	var str="";
	switch (args.feature.featureType) {
	case "snp":
		str +=
		'alleles:&nbsp;<span class="ssel">'+args.feature.alleleString+'</span><br>'+
		'SO:&nbsp;<span class="emph" style="color:'+settings.getColor(args.feature)+';">'+args.feature.displaySoConsequence+'</span><br>';
		break;
	case "gene":
		str += 
		'Ensembl&nbsp;ID:&nbsp;<span class="ssel">'+args.feature.stableId+'</span><br>'+
		'biotype:&nbsp;<span class="emph" style="color:'+settings.getColor(args.feature)+';">'+args.feature.biotype+'</span><br>';
		break;
	case "transcript":
		str += 
		'Ensembl&nbsp;ID:&nbsp;<span class="ssel">'+args.feature.stableId+'</span><br>'+
		'biotype:&nbsp;<span class="emph" style="color:'+settings.getColor(args.feature)+';">'+args.feature.biotype+'</span><br>';
		break;
	default: break;
	}
	
	str += 'start:&nbsp;<span class="emph">'+args.feature.start+'</span><br>'+
	'end:&nbsp;<span class="emph">'+args.feature.end+'</span><br>'+
	'strand:&nbsp;<span class="emph">'+args.feature.strand+'</span><br>'+
	'length:&nbsp;<span class="info">'+(args.feature.end-args.feature.start+1)+'</span><br>';
	return str;
};

TrackSvg.prototype.formatTitleTip = function(args){
	var str="";
	switch (args.feature.featureType) {
	case "snp":
		str += args.feature.featureType.toUpperCase() +
		' - <span class="ok">'+args.feature.name+'</span>';
		break;
	case "gene":
		str += args.feature.featureType.charAt(0).toUpperCase() + args.feature.featureType.slice(1) +
		' - <span class="ok">'+args.feature.externalName+'</span>';
		break;
	case "transcript":
		str += args.feature.featureType.charAt(0).toUpperCase() + args.feature.featureType.slice(1) +
		' - <span class="ok">'+args.feature.externalName+'</span>';	
		break;
	case undefined:
		str += "Feature";
		break;
	default: str += args.feature.featureType.charAt(0).toUpperCase() + args.feature.featureType.slice(1); break;
	}
	return str;
};

TrackSvg.prototype.showInfoWidget = function(args){
	console.log(args);
	switch (args.featureType) {
	case "gene": new GeneInfoWidget(null,this.trackData.adapter.species).draw(args); break;
	case "transcript": new TranscriptInfoWidget(null,this.trackData.adapter.species).draw(args); break;
	case "snp" : new SnpInfoWidget(null,this.trackData.adapter.species).draw(args); break;	
	default: break;
	}
};

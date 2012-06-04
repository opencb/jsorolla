function TrackSvg(parent, args) {
	this.args = args;
//	this.id = Math.round(Math.random()*10000000); // internal id for this class
	this.parent = parent;

	this.y = 25;
	this.height = 50;
	this.width = 200;
	this.title = "track";
	this.type = "generic";
	
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
	}
	
	//flags
	this.rendered = false;
	
	//~ this.prototype.addFeatures = args.render;
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
		"opacity":"0",
		"fill":"orange"
	});
	var upRect = SVG.addChild(main,"rect",{
		'id':this.id+"upRect",
		"x":4,
		"y":4,
		"width":16,
		"height":16,
		"opacity":"0",
		"fill":"palegreen"
	});
	var downRect = SVG.addChild(main,"rect",{
		"x":25,
		"y":4,
		"width":16,
		"height":16,
		"opacity":"0",
		"fill":"skyblue"
	});
	var hideRect = SVG.addChild(main,"rect",{
		"x":46,
		"y":4,
		"width":16,
		"height":16,
		"opacity":"0",
		"fill":"plum"
	});
	
//   var hideRect = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 48 48"><title>Gnome window close</title><desc>http://svn.gnome.org/viewvc/gnome-icon-theme/</desc><radialGradient id="SVGID_1_" cx="-66.1006" cy="-1047.4805" r="1.6055" gradientTransform="matrix(13.7819 0 0 -2.4587 934.9918 -2541.4377)" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:#000"/><stop offset="1" style="stop-color:#000;stop-opacity:0"/></radialGradient><path style="opacity:.092;fill:url(#SVGID_1_)" d="M46.127,33.979c0,2.182-9.906,3.947-22.127,3.947c-12.22,0-22.126-1.768-22.126-3.947c0-2.179,9.906-3.946,22.126-3.946C36.222,30.032,46.127,31.8,46.127,33.979z"/><radialGradient id="SVGID_2_" cx="148.2012" cy="-1029.5996" r="1.6036" gradientTransform="matrix(5.3381 0 0 -2.4944 -778.1038 -2532.8325)" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:#000"/><stop offset="1" style="stop-color:#000;stop-opacity:0"/></radialGradient><path style="opacity:.2031;fill:url(#SVGID_2_)" d="M22,35.392c0,2.322-4.029,4.205-9,4.205s-9-1.883-9-4.205s4.029-4.205,9-4.205S22,33.069,22,35.392z"/><radialGradient id="SVGID_3_" cx="127.0596" cy="-1016.3906" r="1.6066" gradientTransform="matrix(5.4059 0 0 -2.5259 -652.8704 -2531.8577)" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:#000"/><stop offset="1" style="stop-color:#000;stop-opacity:0"/></radialGradient><path style="opacity:.2031;fill:url(#SVGID_3_)" d="M43,35.392c0,2.322-4.028,4.205-9,4.205c-4.971,0-9-1.883-9-4.205s4.029-4.205,9-4.205C38.972,31.187,43,33.069,43,35.392z"/><radialGradient id="SVGID_4_" cx="-18.3965" cy="-229.4829" r="1.4931" gradientTransform="matrix(10.1125 0 0 -10.104 209.6891 -2299.3503)" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:#9C9E99"/><stop offset="1" style="stop-color:#868883"/></radialGradient><path style="fill:url(#SVGID_4_);stroke:#555753;stroke-width:.8125;stroke-linecap:round;stroke-linejoin:round" d="M13.102,8.405c-1.456-0.01-2.788,0.879-3.339,2.227c-0.551,1.348-0.212,2.883,0.834,3.896l8.013,8.013l-8.013,8.013c-1.398,1.398-1.398,3.666,0,5.064c1.398,1.398,3.666,1.398,5.064,0l8.014-8.014l8.013,8.014c0.898,0.924,2.204,1.277,3.45,0.945c1.245-0.332,2.241-1.313,2.561-2.561c0.318-1.249-0.067-2.563-1.002-3.45l-8.014-8.014l8.014-8.013c1.056-1.021,1.4-2.6,0.834-3.951c-0.563-1.354-1.928-2.205-3.396-2.17c-0.93,0.037-1.809,0.437-2.447,1.111l-8.013,8.014l-8.014-8.014C14.995,8.815,14.069,8.413,13.102,8.405z"/><path xlink:href="#path4262" style="opacity:.3621;fill:none;stroke:#FFFFFF;stroke-width:.8125;stroke-linecap:round;stroke-linejoin:round" d="M13.126,9.405c-1.037-0.008-2.03,0.654-2.423,1.615s-0.147,2.03,0.615,2.771c0.013,0,0.025,0,0.039,0l8,8.038c0.199,0.191,0.311,0.455,0.311,0.73s-0.112,0.541-0.311,0.731l-8,8c-1.009,1.009-1.009,2.605,0,3.615c1.008,1.009,2.606,1.009,3.615,0l8-8.039c0.191-0.198,0.455-0.313,0.731-0.313c0.275,0,0.539,0.112,0.73,0.313l8,8.039c0,0.013,0,0.023,0,0.037c0.637,0.656,1.55,0.896,2.461,0.654c0.904-0.242,1.581-0.957,1.809-1.847c0.228-0.896-0.021-1.823-0.693-2.462c-0.012,0-0.024,0-0.037,0l-8-8c-0.198-0.191-0.313-0.455-0.313-0.73s0.113-0.541,0.313-0.73l8-8.038c0.013,0,0.025,0,0.037,0c0.76-0.733,1.015-1.896,0.615-2.847c-0.399-0.959-1.354-1.563-2.422-1.539c-0.664,0.025-1.315,0.328-1.77,0.809c0,0.014,0,0.025,0,0.039l-8,8.001c-0.191,0.198-0.455,0.312-0.73,0.312c-0.276,0-0.54-0.112-0.731-0.312l-8-8.001c0-0.014,0-0.025,0-0.039C14.501,9.715,13.819,9.411,13.126,9.405z"/><radialGradient id="SVGID_5_" cx="46.3672" cy="-666" r="1.8958" gradientTransform="matrix(7.5973 0 0 -3.8245 -329.7393 -2524.8076)" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:#555753"/><stop offset="1" style="stop-color:#555753;stop-opacity:0"/></radialGradient><path style="opacity:.3;fill:url(#SVGID_5_)" d="M19.454,22.559c5.222-1.522,3.882,0.164,8.507,0.164l8.506,8.506l-4.704,3.64l-8-8.068l-8,7.798L11.58,30.5L19.454,22.559z"/></svg>';
//   main.appendChild(hideRect);

	
	
	var text = SVG.addChild(main,"text",{
		"x":75,
		"y":16,
		"opacity":"0",
		"fill":"black",
//		"transform":"rotate(-90 15,100)"
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
		titlebar.setAttribute("opacity","0.7");
	});
	$(main).mouseleave(function(event){
		over.setAttribute("opacity","0");
		text.setAttribute("opacity","0");
		upRect.setAttribute("opacity","0.0");
		downRect.setAttribute("opacity","0.0");
		hideRect.setAttribute("opacity","0.0");
		titlebar.setAttribute("opacity","0.0");
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
//	console.log(featureList);
	
	var _this=this;
	var middle = _this.width/2;
	
	if(this.type == "sequence"){
		var seqString = featureList[0].sequence;
		var width = 1*this.pixelBase;
		var color = new Object();
		color["A"] = "#90EE90";
		color["C"] = "#B0C4DE";
		color["G"] = "#FFEC8B";
		color["T"] = "#E066FF";
		
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
	else{
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
	}
};

//~ function GeneRender ()

function SvgTrack(parent, args) {
	this.args = args;
	this.id = Math.round(Math.random()*10000000); // internal id for this class
	this.parent = parent;

	this.y = 0;
	this.height = 80+Math.round(Math.random()*100);
	this.title = "track";
	if (args != null){
		if(args.title != null){
			this.title = args.title;
		}
		if(args.clase != null){
			this.clase = args.clase;
		}
	}
};
SvgTrack.prototype.setY = function(value){
	this.y = value;
};
SvgTrack.prototype.getHeight = function(){
	return this.height;
};
SvgTrack.prototype.draw = function(){
	var main = SVG.addChild(this.parent,"svg",{
//		"style":"border:1px solid #e0e0e0;",
		"id":this.id,
		"x":0,
		"y":this.y,
		"width":1000,
		"height":this.height
	});
	var features = SVG.addChild(main,"svg",{
		"x":0,
		"width":1000,
		"height":this.height,
		"class":this.clase
	});
	var over = SVG.addChild(main,"rect",{
		"x":0,
		"y":0,
		"width":1000,
		"height":this.height,
		"opacity":"0",
		"stroke":"330000",
		"stroke-width":"1",
		"fill":"orange"
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
	
//XXX
	var rect = SVG.addChild(features,"rect",{
//		"class":this.clase,
		"x":80,
		"y":20,
		"width":200,
		"height":10,
		"fill":"red"
	});
	var rect2 = SVG.addChild(features,"rect",{
//		"class":this.clase,
		"x":90,
		"y":40,
		"width":200,
		"height":10,
		"fill":"blue"
	});
	var rect3 = SVG.addChild(features,"rect",{
//		"class":this.clase,
		"x":100,
		"y":60,
		"width":200,
		"height":10,
		"fill":"green"
	});

//XXX	
	
	var text = SVG.addChild(main,"text",{
		"x":15,
		"y":80,
		"fill":"black",
		"transform":"rotate(-90 15,80)"
	});
	text.textContent = this.title;
	
	
	
	$(titlebar).mousedown(function(event){
		main.parentNode.appendChild(main); 
//		var x = parseInt(main.getAttribute("x")) - event.offsetX;
		var y = parseInt(main.getAttribute("y")) - event.clientY;
		$(this.parentNode).mousemove(function(event){
//			main.setAttribute("x",x + event.offsetX);
			main.setAttribute("y",y + event.clientY);
		});
	});
	$(main).mouseup(function(event){
		$(this).off('mousemove');
	});
	
	
	
	
	
	
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
	
	
	
	
	
	$(this.parent).mousedown(function(event) {
		var x = parseInt(features.getAttribute("x")) - event.clientX;
		console.log(event);
		$(this).mousemove(function(event){
			features.setAttribute("x",x + event.clientX);
		});
	});
	$(this.parent).mouseup(function(event) {
		$(this).off('mousemove');
	});
	
//	$(upRect).click(function(event){
//		main.setAttribute("y",0);
//	});
//	$(upRect).click(function(event){
//		main.setAttribute("y",500);
//	});
	
	
	this.main = main;
	this.upRect = upRect;
	this.downRect = downRect;
};

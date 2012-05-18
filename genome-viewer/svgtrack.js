function SvgTrack(parentNode, args) {
	this.args = args;
	this.id = Math.round(Math.random()*10000000); // internal id for this class
	this.parentNode = parentNode;

	this.y = 0;
	this.height = 100+Math.round(Math.random()*200);
	
	
};
SvgTrack.prototype.setY = function(value){
	this.y = value;
};
SvgTrack.prototype.getHeight = function(){
	return this.height;
};
SvgTrack.prototype.draw = function(){
	var main = this.parentNode.addChildSVG("svg",{
//		"style":"border:1px solid #e0e0e0;",
		"id":this.id,
		"x":0,
		"y":this.y,
		"width":1000,
		"height":this.height
	});
		
	var cont = main.addChildSVG("rect",{
		"x":0,
		"y":0,
		"width":1000,
		"height":this.height,
		"opacity":"0",
		"stroke":"330000",
		"stroke-width":"1",
		"fill":"orange"
	});
	var title = main.addChildSVG("rect",{
		"x":0,
		"y":0,
		"width":24,
		"height":this.height,
		"opacity":"0",
		"stroke":"goldenrod",
		"stroke-width":"1",
		"fill":"orange"
	});
	var upRect = main.addChildSVG("rect",{
		"id":this.id+"upRect",
		"x":4,
		"y":4,
		"width":16,
		"height":16,
		"fill":"palegreen"
	});
	var downRect = main.addChildSVG("rect",{
		"x":4,
		"y":25,
		"width":16,
		"height":16,
		"fill":"skyblue"
	});
	var rect = main.addChildSVG("rect",{
		"x":80,
		"y":20,
		"width":200,
		"height":10,
		"fill":"red"
	});
	var rect2 = main.addChildSVG("rect",{
		"x":90,
		"y":40,
		"width":200,
		"height":10,
		"fill":"blue"
	});
	var rect3 = main.addChildSVG("rect",{
		"x":100,
		"y":60,
		"width":200,
		"height":10,
		"fill":"green"
	});
	$(title).mousedown(function(event){
		main.parentNode.appendChild(main); 
//		var x = parseInt(track.getAttribute("x")) - event.offsetX;
		var y = parseInt(main.getAttribute("y")) - event.offsetY;
		$(this.parentNode).mousemove(function(event){
//			track.setAttribute("x",x + event.offsetX);
			main.setAttribute("y",y + event.offsetY);
		});
	});
	$(main).mouseup(function(event){
		$(main).off('mousemove');
	});
	$(this.parentNode).mouseup(function(event){
		$(this.parentNode).off('mousemove');
	});
	$(main).mouseenter(function(event){
		cont.setAttribute("opacity","0.1");
		title.setAttribute("opacity","1");
	});
	$(main).mouseleave(function(event){
		cont.setAttribute("opacity","0");
		title.setAttribute("opacity","0");
	});

	$(upRect).mouseenter(function(event){
		upRect.setAttribute("fill","red");
	});
	$(upRect).mouseleave(function(event){
		upRect.setAttribute("fill","palegreen");
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




function RuleTrack (rulerID,targetID,  args) {
	
	//Groups and layers
	this.ruleNodeGroup = null;
	this.mainNodeGroup = null;
	this.labelNodeGroup = null;
	
	//target
	this.targetID = targetID;
	
	//Coordenates
	this.top = args.coords.top;
	this.left = args.coords.left;
	this.right = args.coords.right;
	this.width = args.coords.width;
	this.height = args.coords.height;
	
	
	this.start = args.rule.start;
	this.end = args.rule.end;
	
	// ruler
	this.inc = args.rule.inc;
	this.mediumDivisionInterval = args.rule.mediumDivisionInterval;
	this.bigDivisionInterval =  args.rule.bigDivisionInterval;
	
	
	//ruler size
	this.rulerLabelsTop = this.top + 18;
	this.topRule = this.top + 20;
	this.rulerTraceSmall = 4;
	this.rulerTraceMedium = 8;
	this.rulerTraceBig = 10;
	

	//Optional parameters
	this.backgroundColor = "#FFFFFF";
	this.linecolor =  "#000000";
	this.textcolor = "#000000";
	
	
	this.labelBigIntervals = true;
	this.labelMediumIntervals = false;

	//Processing optional parameters
	if (args.optional!=null)
	{
		if (args.optional.backgroundcolor!=null)
		{
			this.backgroundColor = args.optional.backgroundcolor;		
		}
		if (args.optional.linecolor!=null)
		{
			this.linecolor = args.optional.linecolor;		
		}
		if (args.optional.textcolor!=null)
		{
			this.textcolor = args.optional.textcolor;	
		}
		if (args.optional.labelBigIntervals!=null)
		{
			this.labelBigIntervals = args.optional.labelBigIntervals;	
		}
		if (args.optional.labelMediumIntervals!=null)
		{
			this.labelMediumIntervals = args.optional.labelMediumIntervals;	
		}

	}

	//id manage
	this.id = rulerID;	
	this.rulerID = null;
	this.namesID = null;
	this.idMain =null;
	
	
	//Events
	this.click = new Event(this);
};

RuleTrack.prototype.createSVGDom = function(targetID, id, width, height, backgroundColor )
{
	var container = document.getElementById(targetID);
	this._svg = SVG.createSVGCanvas(container, [["id", id]]);
	var rect = SVG.drawRectangle(0, 0, width, height, this._svg, [["fill", backgroundColor],[id, id + "_background"]]);
	this.idMain = this._svg.getAttribute("id") + "_Main";
	this.idRule = this._svg.getAttribute("id") + "_Rule";
	this.idLabels = this._svg.getAttribute("id") + "_Names";
	return this._svg;
};

RuleTrack.prototype.changeView = function(start, end)
{
	this.start = start;
	this.end = end;
};

RuleTrack.prototype.init = function()
{
		
	this._svg = this.createSVGDom(this.targetID, this.id, this.width, this.height, this.backgroundColor);
	this.mainNodeGroup = SVG.drawGroup(this._svg, [["id", this.idMain]]);
	
	this.ruleNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idRule]]);
	this.labelNodeGroup = SVG.drawGroup(this.mainNodeGroup, [["id", this.idLabels]]);
	
	var _this = this;
    this._svg.addEventListener("mousemove", function(event) { _this.mouseMove(event, _this); }, false);
    this._svg.addEventListener("mousedown", function(event) { _this.mouseDown(event, _this); }, false);
    this._svg.addEventListener("mouseup", function(event) { _this.mouseUp(event, _this); }, false);
};


RuleTrack.prototype.mouseMove = function(){
	//console.log("mouse move");
};
RuleTrack.prototype.mouseDown = function(){

	//console.log("mouse mouseDown");
};
RuleTrack.prototype.mouseUp = function(){

	//console.log("mouse mouseUp");
};


RuleTrack.prototype.render = function() 
{
	this.init();
	var count = 0;
	
	var steps = ((this.end - this.start)/this.inc);
	var realWidth = this.right - this.left;
	var pixInc = realWidth/((this.end - this.start)/this.inc);
      
	for (var i = 0; i <= steps; i=i+1)
	{
		var x1 = x2 = this.left + i * pixInc;
		var y1 = this.topRule;
		
		var topInc = this.rulerTraceSmall;
		var realNumber = parseFloat(this.start) + parseFloat(i*this.inc);
		var alreadyLabeled = false;
		var label = Math.ceil(realNumber/1000)+ " Kb";
		
		if (i%(this.bigDivisionInterval) == 0)
		{
			topInc = this.rulerTraceBig;
			if (this.labelBigIntervals)
			{
				SVG.drawText(x1, this.rulerLabelsTop, label , this.labelNodeGroup, [["font-size", 12], ["fill", this.textcolor]]); 
				SVG.drawRectangle(x1 - 2, this.rulerLabelsTop-12, 50 , 15, this._svg, [["fill", this.textcolor], ["opacity", "0.2"], ["rx", "5"], ["ry", "5"]]);
				alreadyLabeled = true;
			}
		}

		if (i%(this.mediumDivisionInterval) == 0){
			if (this.labelMediumIntervals){
				if (!alreadyLabeled){
					topInc = this.rulerTraceMedium;
					SVG.drawRectangle(x1 - 2, this.rulerLabelsTop-12, 50 , 15, this._svg, [["fill", this.textcolor], ["opacity", "0.1"], ["rx", "5"], ["ry", "3"]]);
					SVG.drawText(x1, this.rulerLabelsTop, label, this.labelNodeGroup, [["font-size", 10], ["fill", this.textcolor]]); 
				}
			}
		}
	
		var y2 = this.topRule + topInc;
		SVG.drawLine(x1, y1, x2, y2,  this.ruleNodeGroup, [["stroke", this.linecolor]]);
		count ++;
	}
	
	//draw horizontal line
	SVG.drawLine(this.left, y1,this.right, y1,  this.ruleNodeGroup, [["stroke", this.linecolor]]);
  
};

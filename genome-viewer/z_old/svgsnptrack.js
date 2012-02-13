/*
function svgsnptrack (id,targetID,  args) {
	featureTrack.prototype.constructor.call(this, id,targetID,  args);
	
	this.drawBlocks = true;
	this.sizeBetweenBlocks = 80;
	
	this.consecuenceTypes = new Object();
	this.consecuenceTypesNames = new Array();
	

}


svgsnptrack.prototype = featureTrack;
svgsnptrack.prototype.constructor= featureTrack;

svgsnptrack.prototype.changeView =         featureTrack.prototype.changeView;
svgsnptrack.prototype.render =             featureTrack.prototype.render;
svgsnptrack.prototype.init =               featureTrack.prototype.init;
svgsnptrack.prototype.createSVGDom =       featureTrack.prototype.createSVGDom;
svgsnptrack.prototype._getTopText =        featureTrack.prototype._getTopText;
svgsnptrack.prototype._getTopFeatures = featureTrack.prototype._getTopFeatures;
svgsnptrack.prototype._searchSpace = featureTrack.prototype._searchSpace;
//svgsnptrack.prototype._overlapBlocks = featureTrack.prototype._overlapBlocks;
svgsnptrack.prototype.drawTitle = featureTrack.prototype.drawTitle;
svgsnptrack.prototype.mouseMove = featureTrack.prototype.mouseMove;
svgsnptrack.prototype.mouseclick = featureTrack.prototype.mouseclick;
svgsnptrack.prototype.getById = featureTrack.prototype.getById;

//True si dos bloques se solapan
svgsnptrack.prototype.addConsequenceType = function(consequenceType){
	for (var i = 0; i< this.consecuenceTypesNames.length; i++){
		if (consequenceType == this.consecuenceTypesNames[i]){
			
			//me quedo aqui
		}
		
	}
};


//True si dos bloques se solapan
svgsnptrack.prototype._overlapBlocks = function(block1, block2){
	var pixelInc = (this.right - this.left)/(this.end - this.start);
	if ( Math.abs(block1.start - block2.start) * pixelInc < this.sizeBetweenBlocks){
		return true;
	}
	return false;
};

//Si una feature se encuentra entre un start y un end
svgsnptrack.prototype.contains = function(feature, start, end){
	if ((feature.start > start)&& (feature.end < end)){
		return true;
	}
	return false;
};




svgsnptrack.prototype.drawFeatures = function(){
	
	var pixelInc = (this.right - this.left)/(this.end - this.start);
	var strokewidth = 0.1;
	var stroke = "white";

	this.queues = new Array();
	this.queues.push(new Array());
	
	

	
	//if ((this.featuresView[start+"-" +end].length) > ((this.right - this.left)/1000)){
	if (this.drawBlocks){
		
		var numberOfDivisions = 80;
		var divisions = new Array();
		var clusters = new Array();
		var start = this.start;
		var end = this.end;
		
		var interval = Math.ceil(((this.end - this.start)/numberOfDivisions));
		for (var i = 0; i < numberOfDivisions; i++){
			
			var x = ( parseFloat(this.start)+ parseFloat(i*interval))+ parseFloat(1);
			var y = parseFloat(this.start) + parseFloat((i+1)*interval);
			divisions.push([x, y]);
			clusters.push(new Array());
		}
		
		
		//si ya habiamos calculado los bloques
		if(this.blocksView[this.start+"-" +this.end]!=null){
			clusters = this.blocksView[start+"-" +end];
		}else{
			for (var i = 0; i < this.featuresView[start+"-" +end].length;  i++){
				for(var j = 0; j < divisions.length; j++){
					if (this.contains(this.featuresView[start+"-" +end][i], divisions[j][0],  divisions[j][1])){
						clusters[j].push(this.featuresView[start+"-" +end][i]);
					}
				}
			}
			
		}
		var max = 0;
		for(var j = 0; j < divisions.length; j++){
				if (clusters[j].length>max){
					max=clusters[j].length;
				}
		}
		
		this.blocksView[start+"-" +end] = clusters;
		for (var i = 0; i < numberOfDivisions; i++){
			var startInterval = divisions[i][0];
			var endInterval = divisions[i][1];
			var relativeSize = (clusters[i].length*100)/max;
			var relativeHeight = (relativeSize*this.maxBlockFeatureHeight)/100;
			var startPoint = this.left + pixelInc * (startInterval - this.start);
			exonWidth = pixelInc * (endInterval - startInterval);
			
			
			var attributes = [["fill", "blue"],["cursor", "pointer"],["id", this.id+"_block_"+start+"-"+end+"_index_"+i] ,["stroke-width", strokewidth],["opacity", 0.3], ["stroke", stroke]];
			SVG.drawRectangle( startPoint, this.top + (this.maxBlockFeatureHeight - relativeHeight)  , exonWidth, relativeHeight, this.trackNodeGroup, attributes);
		}
		
		
	}
	
	
	
	var featuresToDraw = new Array();
	var attributes = [["fill", color],["id",] ,["stroke-width", strokewidth], ["stroke", stroke]];
	
	//Dibujo todas las features
	for (var i = 0; i < this.featuresView[start+"-" +end].length;  i++)
	{
		var feature = this.featuresView[start+"-" +end][i];
		var color =  feature.color;
		//Actualizar esta varible antes
		this.sizeBetweenBlocks = 80;
		var queueToDraw = this._searchSpace(feature); 
		
		//Insertamos en la cola para marcar el espacio reservado
		this.queues[queueToDraw].push(feature);
		
		var _this = this;
		var exonWidth = 1;
		var startPoint = 0;
		var top = 0;
		
		if ((parseFloat(feature.start) >= parseFloat(this.start)) && (parseFloat(feature.end) <= parseFloat(this.end))){
			startPoint = this.left + pixelInc * (feature.start - this.start);
			top = this._getTopFeatures()+ (queueToDraw*this.queueHeight);
			attributes.push(["opacity", "1"]);
		}	
		
		var topTodraw = top ;
		if (this.drawBlocks){
			topTodraw = topTodraw + this.maxBlockFeatureHeight;
		}
		
		featuresToDraw.push({"startPoint": Math.ceil(startPoint), "topTodraw":topTodraw, "exonWidth":exonWidth,"height": this.featureHeight, "id": feature.name});
		//SVG.drawRectangle( startPoint, topTodraw, exonWidth, this.featureHeight, this.trackNodeGroup, attributes);
		
	//	var topTodraw = topTodraw + 7 ;
		
	//	var textAttr = [["fill", "black"],["id", this.id+ "_" + feature.name] , ["opacity", "1"], ["font-size", 10], ["style", "cursor:pointer"]];
	//	SVG.drawText( startPoint+2, topTodraw  , feature.id, this.labelNodeGroup, textAttr);
	}
	

	if (this.queues.length<40){
		for (var i = 0; i < featuresToDraw.length; i++){
			
			var attributes = [["fill", color],["id", this.id+ "_" + featuresToDraw[i].id] ,["stroke-width", strokewidth], ["stroke", stroke]];
			SVG.drawRectangle( featuresToDraw[i].startPoint, featuresToDraw[i].topTodraw, featuresToDraw[i].exonWidth, featuresToDraw[i].height, this.trackNodeGroup, attributes);
			
			var textAttr = [["fill", "black"],["id", this.id+ "_" + featuresToDraw[i].id] , ["opacity", "1"], ["font-size", 10], ["style", "cursor:pointer"]];
			SVG.drawText( featuresToDraw[i].startPoint+2, featuresToDraw[i].topTodraw +7 , featuresToDraw[i].id, this.labelNodeGroup, textAttr);
		}
		
		this.drawTitle(this._getTopFeatures()+ (this.queues.length*this.queueHeight) + this.maxBlockFeatureHeight);
		
	}
	else{
		
		this.queues = new Array();
		this.queues.push(new Array());
		for (var i = 0; i < featuresToDraw.length; i++){
			top = this._getTopFeatures()+ (this.queueHeight)  + this.maxBlockFeatureHeight;
			var attributes = [["fill", color],["id", this.id+ "_" + featuresToDraw[i].id] ,["stroke-width", strokewidth], ["stroke", stroke]];
			SVG.drawRectangle( featuresToDraw[i].startPoint, top, featuresToDraw[i].exonWidth, featuresToDraw[i].height, this.trackNodeGroup, attributes);
		}
		
		this.drawTitle(this._getTopFeatures()+ this.maxBlockFeatureHeight +  this._getTopFeatures()+ (this.queueHeight) + 10  );
		
	}
	
};
*/
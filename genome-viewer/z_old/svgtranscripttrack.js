// JavaScript Document
function svgtranscripttrack (trackerID,targetID,  args) {
		featureTrack.prototype.constructor.call(this, trackerID,targetID,  args);
		
		this.drawBlocks = true;
		this.sizeBetweenBlocks = 80;
		
		this.consecuenceTypes = new Object();
		this.consecuenceTypesNames = new Array();
		

}


	svgtranscripttrack.prototype.constructor=featureTrack;

	svgtranscripttrack.prototype.changeView = featureTrack.prototype.changeView;
	svgtranscripttrack.prototype.render = featureTrack.prototype.render;
	svgtranscripttrack.prototype.init = featureTrack.prototype.init;
	svgtranscripttrack.prototype.createSVGDom = featureTrack.prototype.createSVGDom;
	svgtranscripttrack.prototype._getTopText = featureTrack.prototype._getTopText;
	svgtranscripttrack.prototype._getTopFeatures = featureTrack.prototype._getTopFeatures;
	svgtranscripttrack.prototype._searchSpace = featureTrack.prototype._searchSpace;
	svgtranscripttrack.prototype._overlapBlocks = featureTrack.prototype._overlapBlocks;
	svgtranscripttrack.prototype.drawTitle = featureTrack.prototype.drawTitle;
	svgtranscripttrack.prototype.mouseMove = featureTrack.prototype.mouseMove;
	svgtranscripttrack.prototype.mouseclick = featureTrack.prototype.mouseclick;
	svgtranscripttrack.prototype.getById = featureTrack.prototype.getById;



	svgtranscripttrack.prototype.drawFeatures = function(){
		
		var pixelInc = (this.right - this.left)/(this.end - this.start);
		var strokewidth = 0.4;
		var stroke = "white";
		
		var startView = this.start;
		var endView = this.end;
		
		this.queues = new Array();
		this.queues.push(new Array());
		
		
		for (var i = 0; i < this.featuresView[startView +"-" +endView].length;  i++)
		{
			var feature = this.featuresView[startView +"-"+endView][i];
			var color =  feature.color;
			var queueToDraw = this._searchSpace(feature); 
			//Insertamos en la cola para marcar el espacio reservado
			this.queues[queueToDraw].push(feature);
			var attributes = [["fill", color],["id", this.id+"_" + feature.name] ,["stroke-width", strokewidth], ["stroke", stroke], ["style", "cursor:hand"]];
			
			var id = JSON.stringify(feature);
			var _this = this;
			var exonWidth = 1;
			var startPoint = 0;
			var top = 0;
			
			//Encontramos la feature dentro del espacio que estamos visualizando
			if ((parseFloat(feature.start) >= parseFloat(startView)) && (parseFloat(feature.end) <= parseFloat(endView))){
				exonWidth = pixelInc * (feature.end - feature.start);
				
				startPoint = this.left + pixelInc * (feature.start - startView);
				top = this.top+ (queueToDraw*this.queueHeight);
			}	
			
			//La feature empieza fuera del margen derecho pero acaba dentro
			if ((feature.start < startView) && (feature.end < endView)&& (feature.end > startView)){
				exonWidth = pixelInc * (feature.end - startView);//(this.features[i].start + this.left));
				startPoint = this.left;
				top =  this.top+ (queueToDraw*this.queueHeight);
			
			}
			
			//La feature que empieza dentro pero se sale del margen izquierdo
			if ((feature.start > startView) && (feature.end > endView) && (feature.start < endView)){
				
				startPoint = this.left + pixelInc * (feature.start - startView);
				exonWidth = this.right -startPoint;
				top = this.top+ (queueToDraw*this.queueHeight);
			}
			
			//La feature es mas grande que todo el espacio que visualizamos
			if ((feature.start < startView) && (feature.end > endView)){
				exonWidth =  this.right - this.left;
				startPoint = this.left;
				top = this.top+ (queueToDraw*this.queueHeight);
				
			}
			
			attributes.push(["opacity", "1"]);
			exonWidth =  Math.ceil(exonWidth);
			var node = SVG.drawRectangle( startPoint, top, exonWidth, this.featureHeight, this.trackNodeGroup, attributes);
		}
		
		
		//Dibujamos las uniones
		
		for (var i = 0; i < this.featuresView[startView +"-" +endView].length - 1;  i++)
		{
			var unionNode1 = this.featuresView[startView +"-" +endView][i];
			var unionNode2 = this.featuresView[startView +"-" +endView][i + 1];
			
			var start = unionNode1.end;
			var end = unionNode2.start;
			var middle = (end - start)/2;
		
			startPoint = this.left + pixelInc * (start - startView);
			middlePoint =  pixelInc * (end - start);
			
			var attributes = [["fill", color],["id", this.id+"_" + feature.name] ,["stroke-width", 1],["opacity", "0.5"], ["stroke", color]];
			
			//Encontramos la feature dentro del espacio que estamos visualizando
			if ((parseFloat(unionNode1.start) >= parseFloat(startView)) && (parseFloat(unionNode1.end) <= parseFloat(endView))){
				if ((parseFloat(unionNode2.start) >= parseFloat(startView)) && (parseFloat(unionNode2.end) <= parseFloat(endView))){
					var node = SVG.drawLine( startPoint, top + (this.featureHeight/2), startPoint + (middlePoint)/2, top + this.featureHeight, this.trackNodeGroup, attributes);
					var node = SVG.drawLine( startPoint + (middlePoint)/2, top + this.featureHeight, startPoint + (middlePoint), top + (this.featureHeight/2), this.trackNodeGroup, attributes);
				}
			}	
		}
		
		this.drawTitle(this.top+ (this.queues.length*this.queueHeight));
};

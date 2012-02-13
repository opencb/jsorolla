// JavaScript Document
function KaryotypePanel(targetID, species, args){
	this.id = targetID+Math.round(Math.random()*10000);
	this.targetId = targetID;
	
	this.species=species;
	
	this.width = 500;
	this.height = 300;
	
	
	if (args!=null){
		if (args.height!=null){
			this.height = args.height;
		}
		if (args.width!=null){
			this.width = args.width;
		}
		
		if (args.trackWidth!=null){
			this.trackWidth = args.trackWidth;
		}
		
	}
	
	//Events 
	this.onClick = new Event(this);
	this.onRendered = new Event(this);
	this.onMarkerClicked = new Event(this);
};


KaryotypePanel.prototype.getTrackId = function(index){
	return this.id + "_track_" + index;
};


KaryotypePanel.prototype.init = function(){
	
	this.containerTable = DOM.createNewElement("table", DOM.select(this.targetId), [["id", this.id+"_table"], ["width", this.width], ["height", this.height]]);
	tr = DOM.createNewElement("tr", this.containerTable, [["width", this.width],["style", "vertical-align:bottom"]]);
	for ( var i = 0; i < this.features.length; i++) {
		var td = DOM.createNewElement("td", tr, [["style", "vertical-align:bottom"],["id", this.getTrackId(i)]]);
	}
};

KaryotypePanel.prototype.drawFeatures = function(){
	var _this = this;
	var size = this.width/this.features.length;
	
		this.panels = new Object();
		for ( var i = 0; i < this.features.length; i++) {
				var bottom = (this.chromosomeSize[i] * this.height) - 10;
				
				var verticalTrack =  new ChromosomeFeatureTrack(this.id + "chr" + this.chromosomesNames[i], document.getElementById( this.getTrackId(i)), this.species,{
					top:10, 
					bottom:bottom, 
					left:12, 
					right:25,  
					width: size, 
					height: this.chromosomeSize[i] * this.height,
					 "labelChromosome":true, 
					 label:true, 
					 "vertical":true, 
					 "rounded":2,
					 "backgroundcolor":"yellow"	
				});	
				_this.panels[this.chromosomesNames[i]] = verticalTrack;
				
				var dataset = new DataSet();
				dataset.loadFromJSON([this.features[i]]);
				verticalTrack.draw(dataset);
				
				_this.panels[this.chromosomesNames[i]].click.addEventListener(function (evt, cytoband){
					var position = (cytoband.end - cytoband.start)/2 + cytoband.start;
					_this.select(cytoband.chromosome, position, position + 2000000 );
					_this.onClick.notify(cytoband);
				});
				
				_this.panels[this.chromosomesNames[i]].onMarkerClicked.addEventListener(function (evt, feature){
					_this.onMarkerClicked.notify(feature);
				});
				
		}
		this.onRendered.notify();
};

KaryotypePanel.prototype.select = function(chromosome, start, end){
	for ( var i = 0; i < this.chromosomesNames.length; i++) {
		this.panels[this.chromosomesNames[i]].deselect();
	}
	
	this.panels[chromosome].select(start, end);
};

KaryotypePanel.prototype.mark = function(features, color){
	
	for ( var i = 0; i < features.length; i++) {
		if (this.panels[features[i].chromosome] != null){
			this.panels[features[i].chromosome].mark(features[i], color);
		}
	}
};

KaryotypePanel.prototype.unmark = function(){
	for (var panel in this.panels){
		this.panels[panel].unmark();
	}
		
};


KaryotypePanel.prototype.draw = function(names, chromosomes){
	this.features = chromosomes;
	this.chromosomesNames = names;
	
	this.chromosomeSize = new Array();
	this.maxChromosomeSize = 0;
	for ( var i = 0; i < this.features.length; i++) {
		this.chromosomeSize.push(this.features[i][this.features[i].length-1].end);
		if (this.maxChromosomeSize < this.features[i][this.features[i].length-1].end){
			this.maxChromosomeSize = this.features[i][this.features[i].length-1].end;
		}
	}
	
	for ( var i = 0; i < this.features.length; i++) {
		this.chromosomeSize[i] = (this.chromosomeSize[i] / this.maxChromosomeSize);
	}
	
	this.init();
	this.drawFeatures();
};


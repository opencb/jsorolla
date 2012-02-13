
GeneFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
GeneFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
GeneFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
GeneFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
GeneFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
GeneFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
GeneFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
GeneFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
GeneFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function GeneFeatureFormatter(gene){
	if (gene != null){
		this.feature = gene;
		this.start = gene.start;
		this.end = gene.end;
		this.label = this.getLabel();
		this.args = new Object();
		this.args.object = gene;
		this.args.title = new Object();
		this.args.stroke = "#000000";
//		this.args.strokeOpacity = 0.8;
		this.args.strokeWidth = 0.5;
		this.args.fill = "#"+this._getColor(gene);
		this.args.opacity = 1;
		FeatureFormatter.prototype.constructor.call(this, this.getId(), this.args);
	}
};

GeneFeatureFormatter.prototype.getId = function(){
	return this.feature.stableId + "_" + this.feature.start + "_" + this.feature.end;
};

GeneFeatureFormatter.prototype.getName = function(){
	return this.feature.stableId;
};

GeneFeatureFormatter.prototype.getLabel = function(){
	var label = this.feature.externalName;
	
//	if (GENOMEMAPS_CONFIG.showFeatureStableId != null){
//		if (GENOMEMAPS_CONFIG.showFeatureStableId == true){
//			label = this.feature.stableId;
//		}
//		
//	}

	if (this.feature.strand == -1){
		label = "< " +label;
	}
	
	if (this.feature.strand == 1){
		label = label + " >";
	}
	return label;
};

GeneFeatureFormatter.prototype.getDetailLabel = function(){
	//Remove "_" and UpperCase first letter
	var name = this.feature.biotype.replace(/_/gi, " ");
	name = name.charAt(0).toUpperCase() + name.slice(1);
	return this.getLabel() + " [" + name + "] ";// + this.feature.start; 
};

GeneFeatureFormatter.prototype.getBioTypeColors = function(){
	var colors = new Object();

	//TODO buscar los colores en ensembl!
	colors[new String("protein_coding")] = "a00000";
	colors[new String("processed_transcript")] = "0000ff";
	colors[new String("pseudogene")] = "666666";
	colors[new String("miRNA")] = "8b668b";//TODO falta
	colors[new String("snRNA")] = "8b668b";
	colors[new String("snoRNA")] = "8b668b";//TODO falta
	colors[new String("lincRNA")] = "8b668b";
	
	colors[new String("other")] = "ffffff";
	return colors;
};

GeneFeatureFormatter.prototype._getColor = function(gene){
//	console.log(gene.biotype + " " + this.getBioTypeColors()[gene.biotype]);
	if (gene.biotype.indexOf("pseudogene") != -1){
		return this.getBioTypeColors()["pseudogene"];
	}
	
	if (this.getBioTypeColors()[gene.biotype] == null){
		return this.getBioTypeColors()["other"];
	}
	
	
	return this.getBioTypeColors()[gene.biotype];
};


TranscriptFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
TranscriptFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
TranscriptFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
TranscriptFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
TranscriptFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
TranscriptFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
TranscriptFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
TranscriptFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
TranscriptFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function TranscriptFeatureFormatter(transcript){
	this.feature = transcript;
	this.start = transcript.start;
	this.end =  transcript.end;
	this.label =  this.getLabel();
	
	this.exon = new Array();
	for ( var i = 0; i < transcript.exon.length; i++) {
		this.exon.push(new ExonFeatureFormatter(transcript.exon[i], transcript));
	}
	this.args = new Object();
	this.args.title = new Object();
	this.args.hidden = false;
	this.args.stroke = "black";//this.getBioTypeColors()[transcript.biotype.toUpperCase()];//"black";
	this.args.strokeWidth = 1;
	this.args.fill = this.getBioTypeColors()[transcript.biotype.toUpperCase()];//"black";
	this.args.size = 1;
	this.args.opacity = 0.5;
	this.args.fontSize = 10;
	this.args.fontColor = "#FFFFFF";
	
//	[["stroke-width", "0.5"], ["fill", "black"], ["stroke", "black"]]
	 
	//TODO doing
	this.showFeatureStableId = true;
	 
	FeatureFormatter.prototype.constructor.call(this, this.getId(), this.args);
};

TranscriptFeatureFormatter.prototype.getName = function(){
	return this.feature.stableId;
};

TranscriptFeatureFormatter.prototype.getId = function(){
	return this.feature.stableId + "_" + this.feature.start + "_" + this.feature.end;
};

TranscriptFeatureFormatter.prototype.getBioTypeColors = function(){
	var colors = new Object();
	colors[new String("protein_coding").toUpperCase()] = "21610B";
	colors[new String("pseudogene").toUpperCase()] = "ffcc00";
	colors[new String("snRNA").toUpperCase()] = "424242";
	colors[new String("lincRNA").toUpperCase()] = "8A0886";
	colors[new String("processed_transcript").toUpperCase()] = "ff9900";
	
	colors[new String("other").toUpperCase()] = "FFFFFF";
	return colors;
};

TranscriptFeatureFormatter.prototype.getLabel = function(){
	var label = this.feature.externalName;
//	if (GENOMEMAPS_CONFIG.showFeatureStableId != null){
//		if (GENOMEMAPS_CONFIG.showFeatureStableId == true){
//			label = this.feature.stableId;
//		}
//	}
//	if (this.showFeatureStableId == true){
//		label = this.feature.stableId;
//	}
//	
	
	if (this.feature.strand == -1){
		label = "< " + label;
	}
	
	if (this.feature.strand == 1){
		label = label + " >";
	}
	
	var name = this.feature.biotype.replace(/_/gi, " ");
	name = name.charAt(0).toUpperCase() + name.slice(1);
	label = label + " [" + name + "]" ;
	return label;
};


ExonFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
ExonFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
ExonFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
ExonFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
ExonFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
ExonFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
ExonFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
ExonFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
ExonFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function ExonFeatureFormatter(exon, transcript){
	this.feature = exon;
	this.start = exon.start;
	this.end =  exon.end;
	this.label = exon.stableId;
	this.args = new Object();
	this.args.title = new Object();
	this.args.hidden = false;
	this.args.opacity = 1;
	this.args.strokeOpacity = 1;
	this.args.fill = "#FF0033";
	this.args.stroke = "#3B0B0B";
	

	this.args.strokeWidth = 1;
	this.args.size = 1;
	this.args.fontSize = 10;
	this.args.fontColor = "#FFFFFF";
	FeatureFormatter.prototype.constructor.call(this, this.getId(), this.args);
};

ExonFeatureFormatter.prototype.getName = function(){
	return this.feature.stableId;
};

ExonFeatureFormatter.prototype.getId = function(){
	return this.feature.stableId + "_" + this.feature.start + "_" + this.feature.end;
};

SNPFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
SNPFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
SNPFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
SNPFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
SNPFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
SNPFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
SNPFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
SNPFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
SNPFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function SNPFeatureFormatter(snp){
//<<<<<<< HEAD
//	this.feature = snp;
//	this.start = snp.start;
//	this.end =  snp.end;
//	this.label = snp.name + " (" + snp.alleleString +")";// strand:" + snp.strand ;
//	this.base = snp.alleleString.split("/")[1]; // example:  "A/AT"  or  "ATTT/G"
//	
//	this.args = new Object();
//	this.args.stroke = "#000000";
//	this.args.strokeOpacity = 1;
//	this.args.strokeWidth = 1;
//	this.args.fill = "#FF3333";
//	//this.args.fill = "#000000";
//	this.args.opacity = 1;
//	
//	FeatureFormatter.prototype.constructor.call(this, snp.name, this.args);
//=======
	if (snp != null){
		this.feature = snp;
		this.start = snp.start;
		this.end =  snp.end;
		this.label = snp.name + " (" + snp.alleleString +")" ;
		this.base = snp.alleleString.split("/")[1]; // example:  "A/AT"  or  "ATTT/G"
		
		this.args = new Object();
		this.args.stroke = "#f55959";
		this.args.strokeOpacity = 1;
		this.args.strokeWidth = 1;
		this.args.fill = this._getColor(snp); //"#f55959";
		//this.args.fill = "#000000";
		this.args.opacity = 1;
		
		FeatureFormatter.prototype.constructor.call(this, snp.name, this.args);
	}
//>>>>>>> eb4c9a6c00ef8bad1669b8a0b362a1b9335ffac6
};

SNPFeatureFormatter.prototype.getName = function(){
	return this.feature.name;
};

SNPFeatureFormatter.prototype.getFeatureColor = function(base){
	if (base == "A") return "#90EE90";
	if (base == "T") return "#E066FF";
	if (base == "G") return "#FFEC8B";
	if (base == "C") return "#B0C4DE";
	return "#CC00CC";
};
SNPFeatureFormatter.prototype.getBioTypeColors = function(){
	//TODO
	var colors = new Object();
	colors[new String("2KB_upstream_variant")] = "a2b5cd";				//TODO done Upstream
	colors[new String("5KB_upstream_variant")] = "a2b5cd";				//TODO done Upstream
	colors[new String("500B_downstream_variant")] = "a2b5cd";			//TODO done Downstream
	colors[new String("5KB_downstream_variant")] = "a2b5cd";			//TODO done Downstream
	colors[new String("3_prime_UTR_variant")] = "7ac5cd";				//TODO done 3 prime UTR
	colors[new String("5_prime_UTR_variant")] = "7ac5cd";				//TODO done 5 prime UTR
	colors[new String("coding_sequence_variant")] = "458b00";			//TODO done Coding unknown
	colors[new String("complex_change_in_transcript")] = "00fa9a";		//TODO done Complex in/del
	colors[new String("frameshift_variant")] = "ff69b4";				//TODO done Frameshift coding
	colors[new String("incomplete_terminal_codon_variant")] = "ff00ff";	//TODO done Partial codon
	colors[new String("inframe_codon_gain")] = "ffd700";				//TODO done Non-synonymous coding
	colors[new String("inframe_codon_loss")] = "ffd700";				//TODO done Non-synonymous coding
	colors[new String("initiator_codon_change")] = "ffd700";			//TODO done Non-synonymous coding
	colors[new String("non_synonymous_codon")] = "ffd700";				//TODO done Non-synonymous coding
	colors[new String("intergenic_variant")] = "636363";				//TODO done Intergenic
	colors[new String("intron_variant")] = "02599c";					//TODO done Intronic
	colors[new String("mature_miRNA_variant")] = "458b00";				//TODO done Within mature miRNA
	colors[new String("nc_transcript_variant")] = "32cd32";				//TODO done Within non-coding gene
	colors[new String("splice_acceptor_variant")] = "ff7f50";			//TODO done Essential splice site
	colors[new String("splice_donor_variant")] = "ff7f50";				//TODO done Essential splice site
	colors[new String("splice_region_variant")] = "ff7f50";				//TODO done Splice site
	colors[new String("stop_gained")] = "ff0000";						//TODO done Stop gained
	colors[new String("stop_lost")] = "ff0000";							//TODO done Stop lost
	colors[new String("stop_retained_variant")] = "76ee00";				//TODO done Synonymous coding
	colors[new String("synonymous_codon")] = "76ee00";					//TODO done Synonymous coding
	
	colors[new String("other")] = "ffffff";
	return colors;
};

SNPFeatureFormatter.prototype._getColor = function(snp){
	return this.getBioTypeColors()[snp.displaySoConsequence];
};




SequenceFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
SequenceFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
SequenceFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
SequenceFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
SequenceFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
SequenceFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
SequenceFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
SequenceFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
SequenceFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function SequenceFormatter(sequence){
	this.start = sequence.start;
	this.end =  sequence.end;
	this.label = sequence.base;//exon.stableId;
	
	this.args = new Object();
	this.args.title = new Object();
	this.args.hidden = false;
	this.args.stroke = "#FFFFFF";
	this.args.strokeOpacity = 0.6;
	this.args.strokeWidth = 1;
	this.args.fill = this.getFeatureColor(sequence.base);
	this.args.size = 1;
	this.args.opacity = 0.6;
	this.args.fontSize = 10;
	this.args.fontColor = "#FFFFFF";
	
	FeatureFormatter.prototype.constructor.call(this, sequence.start, this.args);
};

SequenceFormatter.prototype.getName = function(){
	return this.label;
};

SequenceFormatter.prototype.getFeatureColor = function(base){
	if (base == "A") return "#90EE90";
	if (base == "T") return "#E066FF";
	if (base == "G") return "#FFEC8B";
	if (base == "C") return "#B0C4DE";
	return "#CC00CC";
};

VCFFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
VCFFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
VCFFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
VCFFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
VCFFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
VCFFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
VCFFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
VCFFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
VCFFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function VCFFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end-1;
        this.label = feature.label;//exon.stableId;
        this.base = feature.alt;
        
        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "#000000";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 0.1;
        this.args.fill = "purple";
        this.args.size = 1;
        this.args.opacity = 1;
        
        this.feature.samples = feature.all[9];
        
        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};

VCFFeatureFormatter.prototype.getName = function(){
	return this.feature.chromosome+":"+this.feature.start+"-"+this.feature.alt;
};

GFFFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
GFFFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
GFFFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
GFFFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
GFFFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
GFFFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
GFFFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
GFFFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
GFFFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function GFFFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = feature.label;//exon.stableId;

        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "blue";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 0.4;
        this.args.fill = "purple";
        this.args.size = 1;
        
        if (feature.score != null){
        	this.args.opacity = (1 * feature.score)/1000;
        }
        else{
        	this.args.opacity = 0.5;
        }
        
        this.args.fontColor = "blue";

        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};


GFFFeatureFormatter.prototype.getName = function(){
	return this.label;
};

BEDFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
BEDFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
BEDFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
BEDFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
BEDFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
BEDFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
BEDFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
BEDFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
BEDFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function BEDFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = feature.label;//exon.stableId;
        this.score = feature.score;
        if(this.score<0){this.score = 0;}
        if(this.score>1000){this.score = 1000;}
        var gray = Math.abs(Math.ceil(this.score*0.255)-255).toString(16);
        
        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 1;
        this.args.fill =  "#"+gray+gray+gray;
        this.args.stroke = '#000000';
        
        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};

BEDFeatureFormatter.prototype.getName = function(){
	return this.label;
};


CytobandFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
CytobandFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
CytobandFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
CytobandFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
CytobandFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
CytobandFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
CytobandFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
CytobandFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
CytobandFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function CytobandFeatureFormatter(cytoband){
		this.feature = cytoband;
        this.start = cytoband.start;
        this.end =  cytoband.end;
        this.label = cytoband.cytoband;//exon.stableId;

        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "#000000";
        this.args.strokeOpacity = 0.1;
        this.args.strokeWidth = 0.5;
        this.args.fill = this.getColor(cytoband);
        this.args.size = 1;
        this.args.opacity = 1;
    	this.args.fontSize = 10;
        this.args.fontColor = "blue";

        FeatureFormatter.prototype.constructor.call(this, cytoband.cytoband, this.args);
};

CytobandFeatureFormatter.prototype.getColor = function(feature) {
	if (feature.stain == ('gneg')){
		return "white";
	}
	if (feature.stain == ('stalk')){
		return "#666666";
	}
	if (feature.stain == ('gvar')){
		return "#CCCCCC";
	}
	
	if (feature.stain.indexOf('gpos') != -1){
		var value = feature.stain.replace("gpos", "");
		
		if (value == 25){
			return "silver";
		}
		if (value == 50){
			return "gray";
		}
		if (value == 75){
			return "darkgray";
		}
		if (value == 100){
			return "black";
		}
	}
	
	if (feature.stain=="acen"){
		return "blue";
	}
	return "purple";
};


MarkerRuleFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
MarkerRuleFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
MarkerRuleFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
MarkerRuleFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
MarkerRuleFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging; 
MarkerRuleFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId; 
MarkerRuleFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON; 
MarkerRuleFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON; 
MarkerRuleFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents; 

function MarkerRuleFeatureFormatter(marker){
	this.start = marker.start;
	this.end =  marker.end;
	this.label = this.start;//exon.stableId;
	
	this.isLabeled = false;
	
	this.args = new Object();
	this.args.title = new Object();
	this.args.hidden = false;
	this.args.stroke = "#FFFFFF";
	this.args.strokeOpacity = 0.6;
	this.args.strokeWidth = 1;
	this.args.fill = "black";
	this.args.size = 1;
	this.args.opacity = 0.1;
	if (marker.label){
		this.isLabeled = true;
		this.args.opacity = 0.2;
	}
	
	this.args.fontSize = 10;
	this.args.fontColor = "#FFFFFF";
	
	FeatureFormatter.prototype.constructor.call(this, marker.start, this.args);
};


DASFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
DASFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
DASFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
DASFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
DASFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
DASFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
DASFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
DASFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
DASFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function DASFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = feature.id;//exon.stableId;

        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "#FFFFFF";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 1;
        this.args.fill = "purple";
        this.args.size = 1;
        this.args.opacity = "1";
        this.args.fontSize = 10;
        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};


GenericFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
GenericFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
GenericFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
GenericFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
GenericFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
GenericFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
GenericFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
GenericFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
GenericFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function GenericFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = this.getLabel(feature);//exon.stableId;
        this.base = feature.alt;
        
        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "#000000";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 0.1;
        this.args.fill = "purple";
        this.args.size = 1;
        this.args.opacity = 1;

        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};

GenericFeatureFormatter.prototype.getLabel = function(feature) {
	if (feature.externalName != null){
		return feature.externalName;
	}
	
	if (feature.stableId != null){
		return feature.stableId;
	}
	
	if (feature.name != null){
		return feature.name;
	}
	
	if (feature.label != null){
		return feature.label;
	}
	
	return feature.chromosome + ":" + feature.start + "-" + feature.end;
	
};



TfbsFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
TfbsFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
TfbsFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
TfbsFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
TfbsFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
TfbsFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
TfbsFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
TfbsFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
TfbsFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function TfbsFeatureFormatter(feature){
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = this.getLabel(feature);//exon.stableId;
        this.base = feature.alt;
        this.args = new Object();
        this.args.stroke = "#000000";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 0.5;
        this.args.fill = this.getColors()[feature.cellType];
        this.args.opacity = 1;

        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};

TfbsFeatureFormatter.prototype.getName = function(){
	return this.feature.tfName;
};

TfbsFeatureFormatter.prototype.getLabel = function(feature) {
	return feature.tfName + " [" + feature.cellType + "]";
};

TfbsFeatureFormatter.prototype.getColors = function(){
	var colors = new Object();

	//TODO buscar los colores en ensembl!
	colors[new String("CD4")] = "38610B";
	colors[new String("GM06990")] = "4B8A08";
	colors[new String("GM12878")] = "5FB404";
	colors[new String("H1ESC")] = "74DF00";//TODO falta
	colors[new String("HeLa-S3")] = "80FF00";
	colors[new String("HepG2")] = "9AFE2E";//TODO falta
	colors[new String("HUVEC")] = "ACFA58";
	colors[new String("IMR90")] = "BEF781";//TODO falta
	colors[new String("K562")] = "E1F5A9";
	colors[new String("K562b")] = "ECF6CE";//TODO falta
	colors[new String("NHEK")] = "F1F8E0";
	
	colors[new String("other")] = "ffffff";
	return colors;
};

/** miRNA **/
MiRNAFeatureFormatter.prototype.setProperties = FeatureFormatter.prototype.setProperties;
MiRNAFeatureFormatter.prototype.getDefault = FeatureFormatter.prototype.getDefault;
MiRNAFeatureFormatter.prototype.getSelected = FeatureFormatter.prototype.getSelected;
MiRNAFeatureFormatter.prototype.getOver = FeatureFormatter.prototype.getOver;
MiRNAFeatureFormatter.prototype.getDragging = FeatureFormatter.prototype.getDragging;
MiRNAFeatureFormatter.prototype.getId = FeatureFormatter.prototype.getId;
MiRNAFeatureFormatter.prototype.toJSON = FeatureFormatter.prototype.toJSON;
MiRNAFeatureFormatter.prototype.loadFromJSON = FeatureFormatter.prototype.loadFromJSON;
MiRNAFeatureFormatter.prototype._setEvents = FeatureFormatter.prototype._setEvents;

function MiRNAFeatureFormatter(feature){
	console.log(feature);
		this.feature = feature;
        this.start = feature.start;
        this.end =  feature.end;
        this.label = this.getLabel(feature);//exon.stableId;
        this.base = feature.alt;
        
        this.args = new Object();
        this.args.title = new Object();
        this.args.hidden = false;
        this.args.stroke = "#000000";
        this.args.strokeOpacity = 1;
        this.args.strokeWidth = 0.1;
        this.args.fill = "purple";
        this.args.size = 1;
        this.args.opacity = 1;

        FeatureFormatter.prototype.constructor.call(this, feature.start, this.args);
};

MiRNAFeatureFormatter.prototype.getLabel = function(feature) {
	return feature.mirbaseId + "[" + feature.geneTargetName + "]";
	
};



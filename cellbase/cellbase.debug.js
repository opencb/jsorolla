CellBaseDataAdapter.prototype.toJSON = DataAdapter.prototype.toJSON;


function CellBaseDataAdapter(species){
//	console.log(species);
	DataAdapter.prototype.constructor.call(this);
	this.cellBaseManager = new CellBaseManager(species);
	this.successed = new Event();
	
};


CellBaseDataAdapter.prototype.getVersion = function(){
	return this.cellBaseManager.getVersion();
};


CellBaseDataAdapter.prototype.getSpecies = function(){
	return this.cellBaseManager.getSpecies();
};

CellBaseDataAdapter.prototype.setVersion = function(version){
	this.cellBaseManager.setVersion(version);
};

CellBaseDataAdapter.prototype.setSpecies = function(specie){
	this.cellBaseManager.setSpecies(specie);
};


CellBaseDataAdapter.prototype.fill = function(category, subcategory, query, resource, callbackFunction){
	this.cellBaseManager.get(category, subcategory, query, resource);
	var _this = this;
	this.cellBaseManager.successed.addEventListener(function (evt, data){
		_this.getFinished(data);
	});
};


CellBaseDataAdapter.prototype.getFinished = function(data){
	this.dataset.loadFromJSON(data);
	this.successed.notify();
};

CellBaseDataAdapter.prototype.arrayToString = function(array, separator){
	var str = new StringBuffer();
	for(var i = 0; i < array.length; i++){
		if(i != array.length-1)
			str.append(array[i]+separator);
		else
			str.append(array[i]);
	}
	return str.toString();
};











RegionCellBaseDataAdapter.prototype.setVersion = CellBaseDataAdapter.prototype.setVersion;
RegionCellBaseDataAdapter.prototype.setSpecies = CellBaseDataAdapter.prototype.setSpecies;
RegionCellBaseDataAdapter.prototype.toJSON = CellBaseDataAdapter.prototype.toJSON;

function RegionCellBaseDataAdapter(species, args){
	CellBaseDataAdapter.prototype.constructor.call(this, species);
	this.dataset = new FeatureDataSet();
	this.category = "genomic";
	this.subcategory = "region";
	this.resource = null;
	this.lockSuccessEventNotify = false;
	
	this.checkDuplicates = false;
	/** DataSet hashMaps **/
	this.datasets = new Object();
	this.autoFill = true;
	
	if (args != null){
		if (args.autoFill != null){
			this.autoFill = args.autoFill;
		}
		
//		if (args.checkDuplicates != null){
//			this.checkDuplicates = args.checkDuplicates;
//		}
		
		if (args.resource != null){
			this.resource = args.resource;
		}
	}
	this.preloadSuccess = new Event(this);
};

RegionCellBaseDataAdapter.prototype._getHashMapKey = function(chromosome, start, end){
	return chromosome + "-" + start + "-" + end;
//	return start;
};

RegionCellBaseDataAdapter.prototype.isRegionAvalaible = function(chromosome, start, end){
	return this.datasets[this._getHashMapKey(chromosome, start, end)] != null;
};

RegionCellBaseDataAdapter.prototype.fill = function(chromosome, start, end, resource, callbackFunction){
	var _this = this;
	this.resource = resource;
	if ((chromosome == null)|| (start == null) || (end == null)){
		throw "Missing value in a not optional parameter: chromosome, start or end";
	}
		if (!this.isRegionAvalaible(chromosome, start, end)){
//				console.log("Recovering " + resource+"  from server: " + chromosome + ":" + start + "-" + end);
				this.cellBaseManager.successed = new Event(this);
				this.cellBaseManager.successed.addEventListener(function (evt, data){
					if (!_this.lockSuccessEventNotify){
						_this.getFinished(data, chromosome, start, end);
					}
					else{
						_this.anticipateRegionRetrieved(data, chromosome, start, end);
					}
				});
				this.cellBaseManager.get(this.category, this.subcategory, chromosome + ":" + Math.ceil(start) + "-" + Math.ceil(end), resource);
		}else{
//				console.log("No need to go to the server: " + chromosome + ":" + start + "-" + end);
				this.lockSuccessEventNotify = false;
//				return this.datasets[this._getHashMapKey(chromosome, start, end)];
		}
};

RegionCellBaseDataAdapter.prototype.getFinished = function(data, chromosome, start, end){
//	debugger
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
	this.successed.notify();
};

RegionCellBaseDataAdapter.prototype.anticipateRegionRetrieved = function(data, chromosome, start, end){
	
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = data;
	this.lockSuccessEventNotify = false;
	this.preloadSuccess.notify();
};


RegionCellBaseDataAdapter.prototype.getFeaturesByPosition = function(position){
	var features =  new Array();
	var featuresKey = new Object();
	for (var dataset in this.datasets){
		var features = this.datasets[dataset].toJSON();
		for ( var g = 0; g < features.length; g++) {
			var feature = features[g];
			
			if ((feature.start <= position)&&(feature.end >= position)&&(featuresKey[feature.id]==null)){
				features.push(feature);
				featuresKey[feature.id] = true;
			}
		}
	}
	console.log(features.length);
	return features;
};


RegionCellBaseDataAdapter.prototype.setIntervalView = function(chromosome,  middleView){
	if (this.autoFill && !this.lockSuccessEventNotify){
		for ( var iterable_element in this.datasets) {
			var id = (iterable_element.split("-"));
			var chromosome = id[0];
			var start = id[1];
			var end = id[2];
			
			if ((start < middleView) && (middleView < end)){
				var tier = (end - start)/3;
				
				if (end - middleView <= tier){
					this.lockSuccessEventNotify = true;
					var newEnd = parseInt(end) + parseInt(end -start);
					this.fill(chromosome, end, newEnd , this.resource);
					return;
				}
				
				if(middleView - start <= tier){
					this.lockSuccessEventNotify = true;
					var newstart = parseInt(start) - parseInt(end -start);
					if (newstart < 0){ newstart = 1;}
					this.fill(chromosome, newstart, start, this.resource);
					return;
					
				}
				
			}
			
			
		}
	}
};



GeneRegionCellBaseDataAdapter.prototype.setVersion = RegionCellBaseDataAdapter.prototype.setVersion;
GeneRegionCellBaseDataAdapter.prototype.setSpecies = RegionCellBaseDataAdapter.prototype.setSpecies;
GeneRegionCellBaseDataAdapter.prototype.toJSON = RegionCellBaseDataAdapter.prototype.toJSON;
//GeneRegionCellBaseDataAdapter.prototype.anticipateRegionRetrieved = RegionCellBaseDataAdapter.prototype.anticipateRegionRetrieved;
GeneRegionCellBaseDataAdapter.prototype.setIntervalView = RegionCellBaseDataAdapter.prototype.setIntervalView;
GeneRegionCellBaseDataAdapter.prototype.getFinished = RegionCellBaseDataAdapter.prototype.getFinished;		
GeneRegionCellBaseDataAdapter.prototype._getHashMapKey = RegionCellBaseDataAdapter.prototype._getHashMapKey;
GeneRegionCellBaseDataAdapter.prototype.isRegionAvalaible = RegionCellBaseDataAdapter.prototype.isRegionAvalaible;

function GeneRegionCellBaseDataAdapter(species,args){
//	console.log(species);
	this.species = species;
	this.geneDataAdapter = new CellBaseManager(this.species);
	this.transcriptDataAdapter = null;//new CellBaseManager();
	this.exonDataAdapter = null;//new CellBaseManager();
	this.dataset = new FeatureDataSet();
	
	// 3 nothing retrieved yet and 0 everything retrieved lauch the event
	this.done = 3;
	this.geneData = null;
	
	
	this.obtainTranscripts = true;
	
	/** DataSet hashMaps **/
	this.datasets = new Object();
	this.autoFill = true;
	
	if (args != null){
		if (args.autoFill != null){
			this.autoFill = args.autoFill;
		}
		if (args.obtainTranscripts != null){
			this.obtainTranscripts = args.obtainTranscripts;
		}
	}
	
	this.lockSuccessEventNotify = false;
	this.preloadSuccess = new Event(this);
	this.successed = new Event();
};

GeneRegionCellBaseDataAdapter.prototype.partialRetrieveDone = function(type, data){
	this.done --;
	
	if (type == "transcript"){
		for ( var i = 0; i < this.geneData.length; i++) {
			this.geneData[i].transcript = new Array();
			this.geneData[i].transcript = data[i];
		}
	}

};


GeneRegionCellBaseDataAdapter.prototype.fill = function(chromosome, start, end, callbackFunction){
		var _this = this;
		this.chromosome = chromosome;
		start = Math.ceil(start);
		end = Math.ceil(end);
		this.start = start;
		this.end = end;

		this.geneDataAdapter = new CellBaseManager(this.species);
		
		if (!this.isRegionAvalaible(chromosome, start, end)){
					this.geneDataAdapter.successed = new Event(this);
					this.geneDataAdapter.successed.addEventListener(function (evt, data){
							_this.retrievedGene(data, chromosome, start, end);
					});
			
					this.geneDataAdapter.get("genomic", "region", chromosome + ":" + start + "-" + end, "gene");
			}
			else{
				this.lockSuccessEventNotify = false;
			}
};

GeneRegionCellBaseDataAdapter.prototype.retrieveExonInformation = function(query){
		this.exonDataAdapter = new CellBaseManager(this.species);
		var _this = this;
		
		if (query.length == 0) {
			if (!_this.lockSuccessEventNotify){
				_this.getFinished({}, this.chromosome, this.start, this.end );
			}
			else{
				_this.anticipateRegionRetrieved({},this.chromosome, this.start, this.end );
			}
			return;
		}
		
		this.exonDataAdapter.successed.addEventListener(function (evt, data){
				var index = 0;
				for ( var i = 0; i < _this.transcriptData.length; i++) {
					for ( var j = 0; j < _this.transcriptData[i].length; j++) {
						_this.transcriptData[i][j].exon = data[index];
						index ++;
					}
				}
				for ( var i = 0; i < _this.geneData.length; i++) {
					_this.geneData[i].transcript = _this.transcriptData[i];
				}
				if (!_this.lockSuccessEventNotify){
					_this.getFinished(_this.geneData, _this.chromosome, _this.start, _this.end );
				}
				else{
					_this.anticipateRegionRetrieved(_this.geneData,_this.chromosome, _this.start, _this.end );
				}
		});
		this.exonDataAdapter.get("feature", "transcript", query, "exon");
};

GeneRegionCellBaseDataAdapter.prototype.retrieveTranscriptInformation = function(query){
	this.transcriptDataAdapter = new CellBaseManager(this.species);
	
	var _this = this;
	if (query.length == 0) {
		_this.retrieveExonInformation(query);
		return;
	}
	
	this.transcriptDataAdapter.successed.addEventListener(function (evt, data){
		_this.transcriptData = data[0];
		for ( var i = 0; i < _this.geneData.length; i++) {
			_this.geneData[i].transcript = _this.transcriptData[i];
		}
		
		var query = "";
		var tCount = 0;
		
		for ( var i = 0; i < _this.geneData.length; i++) {
			if (_this.geneData[i].transcript != null){
				for ( var j = 0; j < _this.geneData[i].transcript.length; j++) {
					query = query + "," + _this.transcriptData[i][j].stableId ; 
					tCount ++;
				}
			}
		}
		query = query.substr(1, query.length );
		_this.retrieveExonInformation(query);
	});
	this.transcriptDataAdapter.get("feature", "gene", query, "transcript");
};

GeneRegionCellBaseDataAdapter.prototype.getFinished = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
	this.successed.notify();
};

GeneRegionCellBaseDataAdapter.prototype.anticipateRegionRetrieved = function(data, chromosome, start, end){
	this.dataset.loadFromJSON(data);
	this.datasets[this._getHashMapKey(chromosome, start, end)] = this.dataset;
	this.lockSuccessEventNotify = false;
	this.preloadSuccess.notify();
};

GeneRegionCellBaseDataAdapter.prototype.getFeaturesByPosition = function(position){
	var features =  new Array();
	var featuresKey = new Object();
	for (var dataset in this.datasets){
		var genes = this.datasets[dataset].toJSON();
		for ( var g = 0; g < genes.length; g++) {
			var gene = genes[g];
			
			if ((gene.start <= position)&&(gene.end >= position)&&(featuresKey[gene.id]==null)){
				features.push(gene);
				featuresKey[gene.id] = true;
				var transcripts = gene.transcript;
				if (transcripts != null){
					for ( var i = 0; i < transcripts.length; i++) {
						var transcript = transcripts[i];
						if ((transcript.start <= position)&&(transcript.end >= position)){
							features.push(transcript);
							var exons = transcript.exon;
							if (exons != null){
								for ( var j = 0; j < exons.length; j++) {
									var exon = exons[j];
									if ((exon.start <= position)&&(exon.end >= position)){
										features.push(exon);
									}
								}
							}
						}
					}
				}
			}
		}
	}
	return features;
};

GeneRegionCellBaseDataAdapter.prototype.retrievedGene = function(data, chromosome, start, end){
	this.geneData = data[0];
	var query = new String();
	for ( var i = 0; i < data[0].length; i++) {
		query = query + "," + data[0][i].stableId ; 
		
	}
	if (this.obtainTranscripts){
			this.retrieveTranscriptInformation(query.substr(1, query.length));
	}else{
		if (!this.lockSuccessEventNotify){
			this.getFinished(data[0], chromosome, start, end);
		}
		else{
			this.anticipateRegionRetrieved(data[0], chromosome, start, end);
		}
	}
};
KaryotypeCellBaseDataAdapter.prototype.setVersion = CellBaseDataAdapter.prototype.setVersion;
KaryotypeCellBaseDataAdapter.prototype.getVersion = CellBaseDataAdapter.prototype.getVersion;
KaryotypeCellBaseDataAdapter.prototype.getSpecies = CellBaseDataAdapter.prototype.getSpecies;
KaryotypeCellBaseDataAdapter.prototype.setSpecies = CellBaseDataAdapter.prototype.setSpecies;
KaryotypeCellBaseDataAdapter.prototype.getFinished = CellBaseDataAdapter.prototype.getFinished;
KaryotypeCellBaseDataAdapter.prototype.toJSON = CellBaseDataAdapter.prototype.toJSON;


function KaryotypeCellBaseDataAdapter(species) {
//	console.log(species);
	CellBaseDataAdapter.prototype.constructor.call(this, species);
	this.species = species;
	this.category = "feature";
	this.subcategory = "karyotype";
	this.resource = "chromosome";
	
	this.chromosomeNames = null;

};

KaryotypeCellBaseDataAdapter.prototype.fill = function( callbackFunction) {
	var _this = this;
//	console.log(this.species);
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function(evt, data) {
		_this.getCytobandsByChromosome(cellBaseDataAdapter.dataset.json);
	});
	cellBaseDataAdapter.fill("feature", "karyotype", "none", "chromosome");
};







KaryotypeCellBaseDataAdapter.prototype.sortfunction = function(a, b) {
	var ValidChars = "0123456789.";
	var IsNumber = true;
	var Char;

	for (i = 0; i < a.length && IsNumber == true; i++) {
		Char = a.charAt(i);
		if (ValidChars.indexOf(Char) == -1) {
			IsNumber = false;
		}
	}

	if (!IsNumber)
		return 1;
	return (a - b);
};

KaryotypeCellBaseDataAdapter.prototype.IsNumeric = function(sText) {
	var ValidChars = "0123456789.";
	var IsNumber = true;
	var Char;

	for (i = 0; i < sText.length && IsNumber == true; i++) {
		Char = sText.charAt(i);
		if (ValidChars.indexOf(Char) == -1) {
			IsNumber = false;
		}
	}
	return IsNumber;
};

KaryotypeCellBaseDataAdapter.prototype.getCytobandsByChromosome = function(chromosomeName) {
	var _this = this;
	
	var cellBaseDataAdapterChr = new CellBaseManager(this.species);
	cellBaseDataAdapterChr.successed.addEventListener(function(evt, data) {
		_this.getFinished(data);
	});
	chromosomeName.sort(this.sortfunction);
	this.chromosomeNames = chromosomeName;
	cellBaseDataAdapterChr.get("feature", "karyotype", chromosomeName.toString(), "cytoband");

};



XrefFeatureListCellBaseDataAdapter.prototype.setVersion = CellBaseDataAdapter.prototype.setVersion;
XrefFeatureListCellBaseDataAdapter.prototype.setSpecies = CellBaseDataAdapter.prototype.setSpecies;
XrefFeatureListCellBaseDataAdapter.prototype.getVersion = CellBaseDataAdapter.prototype.getVersion;
XrefFeatureListCellBaseDataAdapter.prototype.getSpecies = CellBaseDataAdapter.prototype.getSpecies;
XrefFeatureListCellBaseDataAdapter.prototype.getFinished = CellBaseDataAdapter.prototype.getFinished;
XrefFeatureListCellBaseDataAdapter.prototype.arrayToString = CellBaseDataAdapter.prototype.arrayToString;
XrefFeatureListCellBaseDataAdapter.prototype.toJSON = CellBaseDataAdapter.prototype.toJSON;
//manager1.get("feature","id",idSpecies, "dbname");
//manager2.get("feature","id",query, "xref?dbname="+arrayToString(_this.databases,","));
//managerGOs.get("annotation","go",gos, "info");
//manager.get("feature","gene",features, "info");
function XrefFeatureListCellBaseDataAdapter(species,args){
//	console.log(species);
	CellBaseDataAdapter.prototype.constructor.call(this,species);
	this.category = "feature";
	this.subcategory = "id";
	this.resource = "xref?dbname=";
	this.databases = new Array("go_cellular_component","go_molecular_function","go_biological_process","kegg","reactome","ensembl_gene","interpro","uniprot_swissprot_accession","jaspar");
};


XrefFeatureListCellBaseDataAdapter.prototype.fill = function(query, identifier/*, callbackFunction*/){
	
	this.resource += this.arrayToString(this.databases,",");
	//this.resource = this.resource+dbnames;
	if(identifier != null){
		query+="&identifier="+identifier;
	}
	this.cellBaseManager.get(this.category, this.subcategory, query, this.resource);
	var _this = this;
	this.cellBaseManager.successed.addEventListener(function (evt, data){
		_this.getFinished(data);
	});
};function InfoWidget(targetId, species, args){
	this.id = "InfoWidget_" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.species=species;
	
	this.title = null;
	this.featureId = null;
	this.width = 800;
	this.height = 400;
	
	if (targetId!= null){
		this.targetId = targetId;       
	}
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	switch (species){
	case "hsa": 
		this.ensemblSpecie = "Homo_sapiens"; 
		this.reactomeSpecie = "48887"; 
		this.wikipathwaysSpecie = "Homo+sapiens"; 
		this.omimSpecie = ""; 
		this.uniprotSpecie = ""; 
		this.intactSpecie = ""; 
		this.dbsnpSpecie = ""; 
		this.haphapSpecie = ""; 
//		this.Specie = ""; 
		break;
	case "mmu":
		this.ensemblSpecies = "Mus_musculus"; 
		this.reactomeSpecies = "48892";
		this.wikipathwaysSpecie = "Mus+musculus"; 
		this.omimSpecie = ""; 
		this.uniprotSpecie = ""; 
		this.intactSpecie = ""; 
		this.dbsnpSpecie = ""; 
		this.haphapSpecie = ""; 
//		this.Specie = ""; 
		break;
	case "dre":
		this.ensemblSpecie = "Danio_rerio"; 
		this.reactomeSpecie = "68323"; 
		this.wikipathwaysSpecie = "Danio+rerio"; 
		this.omimSpecie = ""; 
		this.uniprotSpecie = ""; 
		this.intactSpecie = ""; 
		this.dbsnpSpecie = ""; 
		this.haphapSpecie = ""; 
//		this.Specie = ""; 
		break;
	}
	
	
};

InfoWidget.prototype.draw = function (feature){
//	this.featureId = feature.id;
	this.feature = feature;
	console.log(feature.getName());
//	this.feature.getName = function(){return "a";};
	
	this.panel=Ext.getCmp(this.title +" "+ this.feature.getName());
	if (this.panel == null){
		//the order is important
		this.render();
		this.panel.show();
		this.getData();
	}else{
		this.panel.show();
	}
};

InfoWidget.prototype.render = function (){
		/**MAIN PANEL**/
		this.panel = Ext.create('Ext.ux.Window', {
		    title: this.title +" "+ this.feature.getName(),
		    id : this.title +" "+ this.feature.getName(),
		    resizable: false,
		    minimizable :true,
			constrain:true,
		    closable:true,
		    height:this.height,
		    width:this.width,
//		    modal:true,
//			layout: {type: 'table',columns: 2},
		    layout: { type: 'hbox',align: 'stretch'},
		    items: [this.getTreePanel()],
		    buttonAlign:'right',
//		    buttons:[],
		    listeners: {
			       scope: this,
			       minimize:function(){
			       		this.panel.hide();
			       },
			       destroy: function(){
			       		delete this.panel;
			       }
	        }
		});
};

InfoWidget.prototype.getTreePanel = function (){
		var dataTypes = this.getdataTypes();
	   	this.checkDataTypes(dataTypes);
	        
		var treeStore = Ext.create('Ext.data.TreeStore', {
		    root: {
		        expanded: true,
		        text: "Options",
		        children: dataTypes
		    }
		});
		
		var treePan = Ext.create('Ext.tree.Panel', {
		    title: 'Detailed information',
		    bodyPadding:10,
		    flex:1,
		   	border:false,
		    store: treeStore,
		    useArrows: true,
		    rootVisible: false,
		    listeners : {
			    	scope: this,
			    	itemclick : function (este,record){
			    		this.optionClick(record.data);
		    		}
			}
		});	
		return treePan;
};

InfoWidget.prototype.doGrid = function (columns,fields,modelName,groupField){
		var groupFeature = Ext.create('Ext.grid.feature.Grouping',{
			groupHeaderTpl: groupField+' ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
	    });
		var filters = [];
		for(var i=0; i<fields.length; i++){
			filters.push({type:'string', dataIndex:fields[i]});
		}
		var filters = {
				ftype: 'filters',
				local: true, // defaults to false (remote filtering)
				filters: filters
		};
	    Ext.define(modelName, {
		    extend: 'Ext.data.Model',
	    	fields:fields
		});
	   	var store = Ext.create('Ext.data.Store', {
			groupField: groupField,
			model:modelName
	    });
		var grid = Ext.create('Ext.grid.Panel', {
			id: this.id+modelName,
	        store: store,
	        title : modelName,
	        border:false,
	        cls:'panel-border-left',
			flex:3,        
	        features: [groupFeature,filters],
	        columns: columns,
	        bbar  : ['->', {
	            text:'Clear Grouping',
	            handler : function(){
	                groupFeature.disable();
	            }
	        }]
	    });
    return grid;
};


InfoWidget.prototype.checkDataTypes = function (dataTypes){
	for (var i = 0; i<dataTypes.length; i++){
		if(dataTypes[i]["children"]!=null){
			dataTypes[i]["iconCls"] ='icon-box';
			dataTypes[i]["expanded"] =true;
			this.checkDataTypes(dataTypes[i]["children"]);
		}else{
			dataTypes[i]["iconCls"] ='icon-blue-box';
			dataTypes[i]["leaf"]=true;
		}
	}
};

InfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return [];
};
InfoWidget.prototype.optionClick = function (){
	//Abstract method
};
InfoWidget.prototype.getData = function (){
	//Abstract method
};

InfoWidget.prototype.getGeneTemplate = function (){
	return  new Ext.XTemplate(
		    '<p><span class="panel-border-bottom"><span class="ssel s130">{externalName}</span> &nbsp; <span class="emph s120"> {stableId} </span></span>',
			' &nbsp; <a target="_blank" href="http://www.ensembl.org/Multi/Search/Results?species='+this.ensemblSpecie+';idx=;q={stableId}">Ensembl</a>',
		    '</p><br>',
		    '<p><span class="w75 dis s90">Location: </span> <span class="">{chromosome}:{start}-{end} </span><span style="margin-left:50px" class=" dis s90">Strand: </span> {strand}</p>',
		    '<p><span class="w75 dis s90">Biotype: </span> {biotype}</p>',
		    '<p><span class="w75 dis s90">Description: </span> <span><tpl if="description == &quot;&quot;">No description available</tpl>{description}</span></p>',
		    '<br>',
		    '<p><span class="w75 dis s90">Source: </span> <span class="s110">{source}</span></p>',
		    '<p><span class="w75 dis s90">External DB: </span> {externalDb}</p>',
		    '<p><span class="w75 dis s90">Status: </span> {status}</p>' // +  '<br>'+str
	);
};
InfoWidget.prototype.getTranscriptTemplate = function (){
	return new Ext.XTemplate(
		    '<p><span class="panel-border-bottom"><span class="ssel s130">{externalName}</span> &nbsp; <span class="emph s120"> {stableId} </span></span></p><br>',
		    '<p><span class="w100 dis s90">Location: </span> <span class="">{chromosome}:{start}-{end} </span><span style="margin-left:50px" class=" dis s90">Strand: </span> {strand}</p>',
		    '<p><span class="w100 dis s90">Biotype: </span> {biotype}</p>',
		    '<p><span class="w100 dis s90">Description: </span> <span><tpl if="description == &quot;&quot;">No description available</tpl>{description}</span></p>',
		    '<br>',
		    '<p><span class="w100 dis s90">CDS &nbsp; (start-end): </span> {codingRegionStart}-{codingRegionEnd} <span style="margin-left:50px" class="w100 dis s90">CDNA (start-end): </span> {cdnaCodingStart}-{cdnaCodingEnd}</p>',
		    '<br>',
		    '<p><span class="w100 dis s90">External DB: </span> {externalDb}</p>',
		    '<p><span class="w100 dis s90">Status: </span> {status}</p><br>'// +  '<br>'+str
		);
};
InfoWidget.prototype.getSnpTemplate = function (){
	return new Ext.XTemplate(
		    '<p><span class="panel-border-bottom"><span class="ssel s130">{name}</span></span></p><br>',
		    '<p><span class="w140 dis s90">Location: </span> <span class="">{chromosome}:{start}-{end} </span><span style="margin-left:50px" class=" dis s90">Strand: </span> {strand}</p>',
		    '<p><span class="w140 dis s90">Source: </span> <span class="s110">{source}</span></p>',
		    '<br>',
		    '<p><span class="w140 dis s90">Map weight: </span> {mapWeight}</p>',
		    '<p><span class="w140 dis s90">Allele string: </span> {alleleString}</p>',
		    '<p><span class="w140 dis s90">Ancestral allele: </span> {ancestralAllele}</p>',
		    '<p><span class="w140 dis s90">Display So consequence: </span> {displaySoConsequence}</p>',
		    '<p><span class="w140 dis s90">So consequence type: </span> {soConsequenceType}</p>',
		    '<p><span class="w140 dis s90">Display consequence: </span> {displayConsequence}</p>',
		    '<p><span class="w140 dis s90">Sequence: </span> {sequence}</p>' // +  '<br>'+str
		);
};

InfoWidget.prototype.getExonTemplate = function (){
	return new Ext.XTemplate(
			'<span><span class="panel-border-bottom"><span class="ssel s110">{stableId}</span></span></span>',
			'<span><span style="margin-left:30px" class="dis s90"> Location: </span> <span class="">{chromosome}:{start}-{end} </span></span>',
			'<span><span style="margin-left:30px" class="dis s90"> Strand: </span> {strand}</span>'
		);
};

InfoWidget.prototype.getVCFVariantTemplate = function (){
	return new Ext.XTemplate(
			'<p><span><span class="panel-border-bottom"><span class="ssel s130">{chromosome}:{start}-{alt}</span> &nbsp; <span class="emph s120"> {label} </span></span></span></p><br>',
			'<p><span class="w75 dis s90">Alt: </span> {alt}</p>',
			'<p><span class="w75 dis s90">Ref: </span> {ref}</p>',
			'<p><span class="w75 dis s90">Quality: </span> {quality}</p>',
			'<p><span class="w75 dis s90">Format: </span> {format}</p>',
			'<p><span class="w75 dis s90">Samples: </span> {samples}</p>',
			'<p><span class="w75 dis s90">Info: </span> {info}</p>'
		);
};GeneInfoWidget.prototype.draw = InfoWidget.prototype.draw;
GeneInfoWidget.prototype.render = InfoWidget.prototype.render;
GeneInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
GeneInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
GeneInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
GeneInfoWidget.prototype.getGeneTemplate = InfoWidget.prototype.getGeneTemplate;
GeneInfoWidget.prototype.getTranscriptTemplate = InfoWidget.prototype.getTranscriptTemplate;

function GeneInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Gene Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

GeneInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Genomic", children: [
	                { text: "Information"},
	                { text: "Transcripts"}
	            ] },
	            { text: "Functional information", children: [
	                { text: "GO"},
	                { text: "Reactome"},
	                { text: "Interpro"}
	            ] },
	            { text: "Regulatory", children: [
	                { text: "Jaspar"},
	                { text: "miRNA"}
	            ] },
	            {text: "3D protein"}
	        ];
};

GeneInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information": this.panel.add(this.getInfoPanel(this.data).show()); break;
			case "Transcripts": this.panel.add(this.getTranscriptGrid(this.data.transcripts).show());  break;
//			case "GO": this.panel.add(this.getGoGrid().show()); break;
			case "GO": this.panel.add(this.getXrefGrid(this.data.go, "GO").show());  break;
			case "Interpro": this.panel.add(this.getXrefGrid(this.data.interpro, "Interpro").show());  break;
			case "Reactome": this.panel.add(this.getXrefGrid(this.data.reactome, "Reactome").show());  break;
			case "Jaspar": break;
			case "miRNA": break;
			case "3D protein": this.panel.add(this.get3Dprotein(this.data.snps).show());  break;
		}
	}
};

GeneInfoWidget.prototype.getInfoPanel = function(data){
    if(this.infoPanel==null){
    	
    	var tpl = this.getGeneTemplate();
    	
		this.infoPanel = Ext.create('Ext.panel.Panel',{
			title:"Information",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:10,
			data:data,
			tpl:tpl
		});

    }
    return this.infoPanel;
};

GeneInfoWidget.prototype.getTranscriptGrid = function(data){
    if(this.transcriptGrid==null){
    	
    	var tpl = this.getTranscriptTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var transcriptPanel = Ext.create('Ext.panel.Panel',{
		        border:false,
				bodyPadding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(transcriptPanel);
    	}
		this.transcriptGrid = Ext.create('Ext.panel.Panel',{
			title:"Transcripts ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.transcriptGrid;
};


GeneInfoWidget.prototype.getXrefGrid = function(data, dbname){
    if(this[dbname+"Grid"]==null){
    	var groupField = '';
    	var modelName = dbname;
	    var fields = ['description','displayId'];
		var columns = [
		               	{header : 'Display Id',dataIndex: 'displayId',flex:1},
		               	{header : 'Description',dataIndex: 'description',flex:3}
		             ];
		this[dbname+"Grid"] = this.doGrid(columns,fields,modelName,groupField);
		this[dbname+"Grid"].store.loadData(data);
    }
    return this[dbname+"Grid"];
};

GeneInfoWidget.prototype.getGoGrid = function(){
    var _this = this;
    if(this.goGrid==null){
    	var groupField = 'namespace';
    	var modelName = 'GO';
	    var fields = ['id','name','description','level','directNumberOfGenes','namespace','parents','propagatedNumberOfGenes','score'];
		var columns = [ {header : 'Database id',dataIndex: 'id',flex:2},
						{header : 'Name',dataIndex: 'name',flex:1},
						{header : 'Description',dataIndex: 'description',flex:2},
		                {
		                	xtype: 'actioncolumn',
		                	header : '+info',
		                    flex:1,
		                    items: [{
		                        iconCls: 'icon-blue-box',  // Use a URL in the icon config
		                        tooltip: '+info',    
		                        handler: function(grid, rowIndex, colIndex) {
		                            var rec = _this.goStore.getAt(rowIndex);
		                            Ext.Msg.alert(rec.get('name'), rec.get('description'));
		                        }
		                    }]
		                 },
		                {header : 'Direct genes',dataIndex: 'directNumberOfGenes',flex:2},
						{header : 'Level',dataIndex: 'level',flex:1},
						{header : 'Namespace',dataIndex: 'namespace',flex:2},
						{header : 'Propagated genes',dataIndex: 'propagatedNumberOfGenes',flex:2.5}
		             ];
		this.goGrid = this.doGrid(columns,fields,modelName,groupField);
		
    }
    return this.goGrid;
};

GeneInfoWidget.prototype.get3Dprotein = function(data){
	var _this=this;
    if(this.p3dProtein==null){
    	//ws
//    	
      	this.p3dProtein = Ext.create('Ext.tab.Panel',{
      		title:"3D Protein Viewer",
      		border:false,
      		cls:'panel-border-left',
      		flex:3,
//    		bodyPadding:5,
      		autoScroll:true
//      		items:items
      	});
    	
//		$.get('http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/'+_this.feature.feature.stableId+'/xref?dbname=pdb', function(data){
    
    	var pdbs = [];
    	$.ajax({
//    		  url: 'http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb',
    		  url: 'http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/'+this.feature.feature.stableId+'/xref?dbname=pdb',
//    		  data: data,
//    		  dataType: dataType,
    		  async:false,
    		  success: function(data){
    			if(data!=""){
//      	    		console.log(data.trim());
      	    		pdbs = data.trim().split("\n");
//      	    		console.log(pdbs);
      	    		
      	    		for ( var i = 0; i < pdbs.length; i++) {
      	    			var pdb_name=pdbs[i].trim();
      	    			var pan = Ext.create('Ext.panel.Panel',{
      	    				title:pdb_name,
      	    				bodyCls:'background-black',
      	    				html:'<canvas class="ChemDoodleWebComponent" id="pdb_canvas_'+pdb_name+'" width="600" height="600" style="width: 600px; height: 600px; ">This browser does not support HTML5/Canvas.</canvas>',
      	    				listeners:{
      	    					afterrender:function(este){
      	    						// JavaScript Document
      	    						var pdb_name=este.title;
      	    						
      	    				    	ChemDoodle.default_backgroundColor = '#000000';
      	    				    	
      	    				    	var pdb = new ChemDoodle.TransformCanvas3D('pdb_canvas_'+pdb_name, 300, 300);
      	    				    	if(!pdb.gl){
      	    				    	  pdb.emptyMessage = 'Your browser does not support WebGL';
      	    				    	  pdb.displayMessage();
      	    				    	}else{
      	    					    	pdb.specs.set3DRepresentation('Ball and Stick');
      	    					    	pdb.specs.proteins_ribbonCartoonize = true;
      	    					    	pdb.handle = null;
      	    					    	pdb.timeout = 15;
      	    					    	pdb.startAnimation = ChemDoodle._AnimatorCanvas.prototype.startAnimation;
      	    					    	pdb.stopAnimation = ChemDoodle._AnimatorCanvas.prototype.stopAnimation;
      	    					    	pdb.isRunning = ChemDoodle._AnimatorCanvas.prototype.isRunning;
      	    					    	pdb.dblclick = ChemDoodle.RotatorCanvas.prototype.dblclick;
      	    					    	pdb.nextFrame = function(delta){
      	    					    		var matrix = [];
      	    					    		mat4.identity(matrix);
      	    					    		var change = delta/1000;
      	    					    	        var increment = Math.PI/15;
      	    					    		mat4.rotate(matrix, increment*change, [ 1, 0, 0 ]);
      	    					    		mat4.rotate(matrix, increment*change, [ 0, 1, 0 ]);
      	    					    		mat4.rotate(matrix, increment*change, [ 0, 0, 1 ]);
      	    					    		mat4.multiply(this.rotationMatrix, matrix);
      	    					    	};
      	    					    	
//      	    					    	http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb
//      	    				    	var mol = ChemDoodle.readPDB('HEADER    PLANT SEED PROTEIN                      30-APR-81   1CRN                                                                       \nDBREF  1CRN A    1    46  UNP    P01542   CRAM_CRAAB       1     46             \nSEQRES   1 A   46  THR THR CYS CYS PRO SER ILE VAL ALA ARG SER ASN PHE          \nSEQRES   2 A   46  ASN VAL CYS ARG LEU PRO GLY THR PRO GLU ALA ILE CYS          \nSEQRES   3 A   46  ALA THR TYR THR GLY CYS ILE ILE ILE PRO GLY ALA THR          \nSEQRES   4 A   46  CYS PRO GLY ASP TYR ALA ASN                                  \nHELIX    1  H1 ILE A    7  PRO A   19  13/10 CONFORMATION RES 17,19       13    \nHELIX    2  H2 GLU A   23  THR A   30  1DISTORTED 3/10 AT RES 30           8    \nSHEET    1  S1 2 THR A   1  CYS A   4  0                                        \nSHEET    2  S1 2 CYS A  32  ILE A  35 -1                                        \nSSBOND   1 CYS A    3    CYS A   40                          1555   1555  2.00  \nSSBOND   2 CYS A    4    CYS A   32                          1555   1555  2.04  \nSSBOND   3 CYS A   16    CYS A   26                          1555   1555  2.05  \nCRYST1   40.960   18.650   22.520  90.00  90.77  90.00 P 1 21 1      2          \nORIGX1      1.000000  0.000000  0.000000        0.00000                         \nORIGX2      0.000000  1.000000  0.000000        0.00000                         \nORIGX3      0.000000  0.000000  1.000000        0.00000                         \nSCALE1      0.024414  0.000000 -0.000328        0.00000                         \nSCALE2      0.000000  0.053619  0.000000        0.00000                         \nSCALE3      0.000000  0.000000  0.044409        0.00000                         \nATOM      1  N   THR A   1      17.047  14.099   3.625  1.00 13.79           N  \nATOM      2  CA  THR A   1      16.967  12.784   4.338  1.00 10.80           C  \nATOM      3  C   THR A   1      15.685  12.755   5.133  1.00  9.19           C  \nATOM      4  O   THR A   1      15.268  13.825   5.594  1.00  9.85           O  \nATOM      5  CB  THR A   1      18.170  12.703   5.337  1.00 13.02           C  \nATOM      6  OG1 THR A   1      19.334  12.829   4.463  1.00 15.06           O  \nATOM      7  CG2 THR A   1      18.150  11.546   6.304  1.00 14.23           C  \nATOM      8  N   THR A   2      15.115  11.555   5.265  1.00  7.81           N  \nATOM      9  CA  THR A   2      13.856  11.469   6.066  1.00  8.31           C  \nATOM     10  C   THR A   2      14.164  10.785   7.379  1.00  5.80           C  \nATOM     11  O   THR A   2      14.993   9.862   7.443  1.00  6.94           O  \nATOM     12  CB  THR A   2      12.732  10.711   5.261  1.00 10.32           C  \nATOM     13  OG1 THR A   2      13.308   9.439   4.926  1.00 12.81           O  \nATOM     14  CG2 THR A   2      12.484  11.442   3.895  1.00 11.90           C  \nATOM     15  N   CYS A   3      13.488  11.241   8.417  1.00  5.24           N  \nATOM     16  CA  CYS A   3      13.660  10.707   9.787  1.00  5.39           C  \nATOM     17  C   CYS A   3      12.269  10.431  10.323  1.00  4.45           C  \nATOM     18  O   CYS A   3      11.393  11.308  10.185  1.00  6.54           O  \nATOM     19  CB  CYS A   3      14.368  11.748  10.691  1.00  5.99           C  \nATOM     20  SG  CYS A   3      15.885  12.426  10.016  1.00  7.01           S  \nATOM     21  N   CYS A   4      12.019   9.272  10.928  1.00  3.90           N  \nATOM     22  CA  CYS A   4      10.646   8.991  11.408  1.00  4.24           C  \nATOM     23  C   CYS A   4      10.654   8.793  12.919  1.00  3.72           C  \nATOM     24  O   CYS A   4      11.659   8.296  13.491  1.00  5.30           O  \nATOM     25  CB  CYS A   4      10.057   7.752  10.682  1.00  4.41           C  \nATOM     26  SG  CYS A   4       9.837   8.018   8.904  1.00  4.72           S  \nATOM     27  N   PRO A   5       9.561   9.108  13.563  1.00  3.96           N  \nATOM     28  CA  PRO A   5       9.448   9.034  15.012  1.00  4.25           C  \nATOM     29  C   PRO A   5       9.288   7.670  15.606  1.00  4.96           C  \nATOM     30  O   PRO A   5       9.490   7.519  16.819  1.00  7.44           O  \nATOM     31  CB  PRO A   5       8.230   9.957  15.345  1.00  5.11           C  \nATOM     32  CG  PRO A   5       7.338   9.786  14.114  1.00  5.24           C  \nATOM     33  CD  PRO A   5       8.366   9.804  12.958  1.00  5.20           C  \nATOM     34  N   SER A   6       8.875   6.686  14.796  1.00  4.83           N  \nATOM     35  CA  SER A   6       8.673   5.314  15.279  1.00  4.45           C  \nATOM     36  C   SER A   6       8.753   4.376  14.083  1.00  4.99           C  \nATOM     37  O   SER A   6       8.726   4.858  12.923  1.00  4.61           O  \nATOM     38  CB  SER A   6       7.340   5.121  15.996  1.00  5.05           C  \nATOM     39  OG  SER A   6       6.274   5.220  15.031  1.00  6.39           O  \nATOM     40  N   ILE A   7       8.881   3.075  14.358  1.00  4.94           N  \nATOM     41  CA  ILE A   7       8.912   2.083  13.258  1.00  6.33           C  \nATOM     42  C   ILE A   7       7.581   2.090  12.506  1.00  5.32           C  \nATOM     43  O   ILE A   7       7.670   2.031  11.245  1.00  6.85           O  \nATOM     44  CB  ILE A   7       9.207   0.677  13.924  1.00  8.43           C  \nATOM     45  CG1 ILE A   7      10.714   0.702  14.312  1.00  9.78           C  \nATOM     46  CG2 ILE A   7       8.811  -0.477  12.969  1.00 11.70           C  \nATOM     47  CD1 ILE A   7      11.185  -0.516  15.142  1.00  9.92           C  \nATOM     48  N   VAL A   8       6.458   2.162  13.159  1.00  5.02           N  \nATOM     49  CA  VAL A   8       5.145   2.209  12.453  1.00  6.93           C  \nATOM     50  C   VAL A   8       5.115   3.379  11.461  1.00  5.39           C  \nATOM     51  O   VAL A   8       4.664   3.268  10.343  1.00  6.30           O  \nATOM     52  CB  VAL A   8       3.995   2.354  13.478  1.00  9.64           C  \nATOM     53  CG1 VAL A   8       2.716   2.891  12.869  1.00 13.85           C  \nATOM     54  CG2 VAL A   8       3.758   1.032  14.208  1.00 11.97           C  \nATOM     55  N   ALA A   9       5.606   4.546  11.941  1.00  3.73           N  \nATOM     56  CA  ALA A   9       5.598   5.767  11.082  1.00  3.56           C  \nATOM     57  C   ALA A   9       6.441   5.527   9.850  1.00  4.13           C  \nATOM     58  O   ALA A   9       6.052   5.933   8.744  1.00  4.36           O  \nATOM     59  CB  ALA A   9       6.022   6.977  11.891  1.00  4.80           C  \nATOM     60  N   ARG A  10       7.647   4.909  10.005  1.00  3.73           N  \nATOM     61  CA  ARG A  10       8.496   4.609   8.837  1.00  3.38           C  \nATOM     62  C   ARG A  10       7.798   3.609   7.876  1.00  3.47           C  \nATOM     63  O   ARG A  10       7.878   3.778   6.651  1.00  4.67           O  \nATOM     64  CB  ARG A  10       9.847   4.020   9.305  1.00  3.95           C  \nATOM     65  CG  ARG A  10      10.752   3.607   8.149  1.00  4.55           C  \nATOM     66  CD  ARG A  10      11.226   4.699   7.244  1.00  5.89           C  \nATOM     67  NE  ARG A  10      12.143   5.571   8.035  1.00  6.20           N  \nATOM     68  CZ  ARG A  10      12.758   6.609   7.443  1.00  7.52           C  \nATOM     69  NH1 ARG A  10      12.539   6.932   6.158  1.00 10.68           N  \nATOM     70  NH2 ARG A  10      13.601   7.322   8.202  1.00  9.48           N  \nATOM     71  N   SER A  11       7.186   2.582   8.445  1.00  5.19           N  \nATOM     72  CA  SER A  11       6.500   1.584   7.565  1.00  4.60           C  \nATOM     73  C   SER A  11       5.382   2.313   6.773  1.00  4.84           C  \nATOM     74  O   SER A  11       5.213   2.016   5.557  1.00  5.84           O  \nATOM     75  CB  SER A  11       5.908   0.462   8.400  1.00  5.91           C  \nATOM     76  OG  SER A  11       6.990  -0.272   9.012  1.00  8.38           O  \nATOM     77  N   ASN A  12       4.648   3.182   7.446  1.00  3.54           N  \nATOM     78  CA  ASN A  12       3.545   3.935   6.751  1.00  4.57           C  \nATOM     79  C   ASN A  12       4.107   4.851   5.691  1.00  4.14           C  \nATOM     80  O   ASN A  12       3.536   5.001   4.617  1.00  5.52           O  \nATOM     81  CB  ASN A  12       2.663   4.677   7.748  1.00  6.42           C  \nATOM     82  CG  ASN A  12       1.802   3.735   8.610  1.00  8.25           C  \nATOM     83  OD1 ASN A  12       1.567   2.613   8.165  1.00 12.72           O  \nATOM     84  ND2 ASN A  12       1.394   4.252   9.767  1.00  9.92           N  \nATOM     85  N   PHE A  13       5.259   5.498   6.005  1.00  3.43           N  \nATOM     86  CA  PHE A  13       5.929   6.358   5.055  1.00  3.49           C  \nATOM     87  C   PHE A  13       6.304   5.578   3.799  1.00  3.40           C  \nATOM     88  O   PHE A  13       6.136   6.072   2.653  1.00  4.07           O  \nATOM     89  CB  PHE A  13       7.183   6.994   5.754  1.00  5.48           C  \nATOM     90  CG  PHE A  13       7.884   8.006   4.883  1.00  5.57           C  \nATOM     91  CD1 PHE A  13       8.906   7.586   4.027  1.00  6.99           C  \nATOM     92  CD2 PHE A  13       7.532   9.373   4.983  1.00  6.52           C  \nATOM     93  CE1 PHE A  13       9.560   8.539   3.194  1.00  8.20           C  \nATOM     94  CE2 PHE A  13       8.176  10.281   4.145  1.00  6.34           C  \nATOM     95  CZ  PHE A  13       9.141   9.845   3.292  1.00  6.84           C  \nATOM     96  N   ASN A  14       6.900   4.390   3.989  1.00  3.64           N  \nATOM     97  CA  ASN A  14       7.331   3.607   2.791  1.00  4.31           C  \nATOM     98  C   ASN A  14       6.116   3.210   1.915  1.00  3.98           C  \nATOM     99  O   ASN A  14       6.240   3.144   0.684  1.00  6.22           O  \nATOM    100  CB  ASN A  14       8.145   2.404   3.240  1.00  5.81           C  \nATOM    101  CG  ASN A  14       9.555   2.856   3.730  1.00  6.82           C  \nATOM    102  OD1 ASN A  14      10.013   3.895   3.323  1.00  9.43           O  \nATOM    103  ND2 ASN A  14      10.120   1.956   4.539  1.00  8.21           N  \nATOM    104  N   VAL A  15       4.993   2.927   2.571  1.00  3.76           N  \nATOM    105  CA  VAL A  15       3.782   2.599   1.742  1.00  3.98           C  \nATOM    106  C   VAL A  15       3.296   3.871   1.004  1.00  3.80           C  \nATOM    107  O   VAL A  15       2.947   3.817  -0.189  1.00  4.85           O  \nATOM    108  CB  VAL A  15       2.698   1.953   2.608  1.00  4.71           C  \nATOM    109  CG1 VAL A  15       1.384   1.826   1.806  1.00  6.67           C  \nATOM    110  CG2 VAL A  15       3.174   0.533   3.005  1.00  6.26           C  \nATOM    111  N   CYS A  16       3.321   4.987   1.720  1.00  3.79           N  \nATOM    112  CA  CYS A  16       2.890   6.285   1.126  1.00  3.54           C  \nATOM    113  C   CYS A  16       3.687   6.597  -0.111  1.00  3.48           C  \nATOM    114  O   CYS A  16       3.200   7.147  -1.103  1.00  4.63           O  \nATOM    115  CB  CYS A  16       3.039   7.369   2.240  1.00  4.58           C  \nATOM    116  SG  CYS A  16       2.559   9.014   1.649  1.00  5.66           S  \nATOM    117  N   ARG A  17       4.997   6.227  -0.100  1.00  3.99           N  \nATOM    118  CA  ARG A  17       5.895   6.489  -1.213  1.00  3.83           C  \nATOM    119  C   ARG A  17       5.738   5.560  -2.409  1.00  3.79           C  \nATOM    120  O   ARG A  17       6.228   5.901  -3.507  1.00  5.39           O  \nATOM    121  CB  ARG A  17       7.370   6.507  -0.731  1.00  4.11           C  \nATOM    122  CG  ARG A  17       7.717   7.687   0.206  1.00  4.69           C  \nATOM    123  CD  ARG A  17       7.949   8.947  -0.615  1.00  5.10           C  \nATOM    124  NE  ARG A  17       9.212   8.856  -1.337  1.00  4.71           N  \nATOM    125  CZ  ARG A  17       9.537   9.533  -2.431  1.00  5.28           C  \nATOM    126  NH1 ARG A  17       8.659  10.350  -3.032  1.00  6.67           N  \nATOM    127  NH2 ARG A  17      10.793   9.491  -2.899  1.00  6.41           N  \nATOM    128  N   LEU A  18       5.051   4.411  -2.204  1.00  4.70           N  \nATOM    129  CA  LEU A  18       4.933   3.431  -3.326  1.00  5.46           C  \nATOM    130  C   LEU A  18       4.397   4.014  -4.620  1.00  5.13           C  \nATOM    131  O   LEU A  18       4.988   3.755  -5.687  1.00  5.55           O  \nATOM    132  CB  LEU A  18       4.196   2.184  -2.863  1.00  6.47           C  \nATOM    133  CG  LEU A  18       4.960   1.178  -1.991  1.00  7.43           C  \nATOM    134  CD1 LEU A  18       3.907   0.097  -1.634  1.00  8.70           C  \nATOM    135  CD2 LEU A  18       6.129   0.606  -2.768  1.00  9.39           C  \nATOM    136  N   PRO A  19       3.329   4.795  -4.543  1.00  4.28           N  \nATOM    137  CA  PRO A  19       2.792   5.376  -5.797  1.00  5.38           C  \nATOM    138  C   PRO A  19       3.573   6.540  -6.322  1.00  6.30           C  \nATOM    139  O   PRO A  19       3.260   7.045  -7.422  1.00  9.62           O  \nATOM    140  CB  PRO A  19       1.358   5.766  -5.472  1.00  5.87           C  \nATOM    141  CG  PRO A  19       1.223   5.694  -3.993  1.00  6.47           C  \nATOM    142  CD  PRO A  19       2.421   4.941  -3.408  1.00  6.45           C  \nATOM    143  N   GLY A  20       4.565   7.047  -5.559  1.00  4.94           N  \nATOM    144  CA  GLY A  20       5.366   8.191  -6.018  1.00  5.39           C  \nATOM    145  C   GLY A  20       5.007   9.481  -5.280  1.00  5.03           C  \nATOM    146  O   GLY A  20       5.535  10.510  -5.730  1.00  7.34           O  \nATOM    147  N   THR A  21       4.181   9.438  -4.262  1.00  4.10           N  \nATOM    148  CA  THR A  21       3.767  10.609  -3.513  1.00  3.94           C  \nATOM    149  C   THR A  21       5.017  11.397  -3.042  1.00  3.96           C  \nATOM    150  O   THR A  21       5.947  10.757  -2.523  1.00  5.82           O  \nATOM    151  CB  THR A  21       2.992  10.188  -2.225  1.00  4.13           C  \nATOM    152  OG1 THR A  21       2.051   9.144  -2.623  1.00  5.45           O  \nATOM    153  CG2 THR A  21       2.260  11.349  -1.551  1.00  5.41           C  \nATOM    154  N   PRO A  22       4.971  12.703  -3.176  1.00  5.04           N  \nATOM    155  CA  PRO A  22       6.143  13.513  -2.696  1.00  4.69           C  \nATOM    156  C   PRO A  22       6.400  13.233  -1.225  1.00  4.19           C  \nATOM    157  O   PRO A  22       5.485  13.061  -0.382  1.00  4.47           O  \nATOM    158  CB  PRO A  22       5.703  14.969  -2.920  1.00  7.12           C  \nATOM    159  CG  PRO A  22       4.676  14.893  -3.996  1.00  7.03           C  \nATOM    160  CD  PRO A  22       3.964  13.567  -3.811  1.00  4.90           C  \nATOM    161  N   GLU A  23       7.728  13.297  -0.921  1.00  5.16           N  \nATOM    162  CA  GLU A  23       8.114  13.103   0.500  1.00  5.31           C  \nATOM    163  C   GLU A  23       7.427  14.073   1.410  1.00  4.11           C  \nATOM    164  O   GLU A  23       7.036  13.682   2.540  1.00  5.11           O  \nATOM    165  CB  GLU A  23       9.648  13.285   0.660  1.00  6.16           C  \nATOM    166  CG  GLU A  23      10.440  12.093   0.063  1.00  7.48           C  \nATOM    167  CD  GLU A  23      11.941  12.170   0.391  1.00  9.40           C  \nATOM    168  OE1 GLU A  23      12.416  13.225   0.681  1.00 10.40           O  \nATOM    169  OE2 GLU A  23      12.539  11.070   0.292  1.00 13.32           O  \nATOM    170  N   ALA A  24       7.212  15.334   0.966  1.00  4.56           N  \nATOM    171  CA  ALA A  24       6.614  16.317   1.913  1.00  4.49           C  \nATOM    172  C   ALA A  24       5.212  15.936   2.350  1.00  4.10           C  \nATOM    173  O   ALA A  24       4.782  16.166   3.495  1.00  5.64           O  \nATOM    174  CB  ALA A  24       6.605  17.695   1.246  1.00  5.80           C  \nATOM    175  N   ILE A  25       4.445  15.318   1.405  1.00  4.37           N  \nATOM    176  CA  ILE A  25       3.074  14.894   1.756  1.00  5.44           C  \nATOM    177  C   ILE A  25       3.085  13.643   2.645  1.00  4.32           C  \nATOM    178  O   ILE A  25       2.315  13.523   3.578  1.00  4.72           O  \nATOM    179  CB  ILE A  25       2.204  14.637   0.462  1.00  6.42           C  \nATOM    180  CG1 ILE A  25       1.815  16.048  -0.129  1.00  7.50           C  \nATOM    181  CG2 ILE A  25       0.903  13.864   0.811  1.00  7.65           C  \nATOM    182  CD1 ILE A  25       0.756  16.761   0.757  1.00  7.80           C  \nATOM    183  N   CYS A  26       4.032  12.764   2.313  1.00  3.92           N  \nATOM    184  CA  CYS A  26       4.180  11.549   3.187  1.00  4.37           C  \nATOM    185  C   CYS A  26       4.632  11.944   4.596  1.00  3.95           C  \nATOM    186  O   CYS A  26       4.227  11.252   5.547  1.00  4.74           O  \nATOM    187  CB  CYS A  26       5.038  10.518   2.539  1.00  4.63           C  \nATOM    188  SG  CYS A  26       4.349   9.794   1.022  1.00  5.61           S  \nATOM    189  N   ALA A  27       5.408  13.012   4.694  1.00  3.89           N  \nATOM    190  CA  ALA A  27       5.879  13.502   6.026  1.00  4.43           C  \nATOM    191  C   ALA A  27       4.696  13.908   6.882  1.00  4.26           C  \nATOM    192  O   ALA A  27       4.528  13.422   8.025  1.00  5.44           O  \nATOM    193  CB  ALA A  27       6.880  14.615   5.830  1.00  5.36           C  \nATOM    194  N   THR A  28       3.827  14.802   6.358  1.00  4.53           N  \nATOM    195  CA  THR A  28       2.691  15.221   7.194  1.00  5.08           C  \nATOM    196  C   THR A  28       1.672  14.132   7.434  1.00  4.62           C  \nATOM    197  O   THR A  28       0.947  14.112   8.468  1.00  7.80           O  \nATOM    198  CB  THR A  28       1.986  16.520   6.614  1.00  6.03           C  \nATOM    199  OG1 THR A  28       1.664  16.221   5.230  1.00  7.19           O  \nATOM    200  CG2 THR A  28       2.914  17.739   6.700  1.00  7.34           C  \nATOM    201  N   TYR A  29       1.621  13.190   6.511  1.00  5.01           N  \nATOM    202  CA  TYR A  29       0.715  12.045   6.657  1.00  6.60           C  \nATOM    203  C   TYR A  29       1.125  11.125   7.815  1.00  4.92           C  \nATOM    204  O   TYR A  29       0.286  10.632   8.545  1.00  7.13           O  \nATOM    205  CB  TYR A  29       0.755  11.229   5.322  1.00  9.66           C  \nATOM    206  CG  TYR A  29      -0.203  10.044   5.354  1.00 11.56           C  \nATOM    207  CD1 TYR A  29      -1.547  10.337   5.645  1.00 12.85           C  \nATOM    208  CD2 TYR A  29       0.193   8.750   5.100  1.00 14.44           C  \nATOM    209  CE1 TYR A  29      -2.496   9.329   5.673  1.00 16.61           C  \nATOM    210  CE2 TYR A  29      -0.801   7.705   5.156  1.00 17.11           C  \nATOM    211  CZ  TYR A  29      -2.079   8.031   5.430  1.00 19.99           C  \nATOM    212  OH  TYR A  29      -3.097   7.057   5.458  1.00 28.98           O  \nATOM    213  N   THR A  30       2.470  10.984   7.995  1.00  5.31           N  \nATOM    214  CA  THR A  30       2.986   9.994   8.950  1.00  5.70           C  \nATOM    215  C   THR A  30       3.609  10.505  10.230  1.00  6.28           C  \nATOM    216  O   THR A  30       3.766   9.715  11.186  1.00  8.77           O  \nATOM    217  CB  THR A  30       4.076   9.103   8.225  1.00  6.55           C  \nATOM    218  OG1 THR A  30       5.125  10.027   7.824  1.00  6.57           O  \nATOM    219  CG2 THR A  30       3.493   8.324   7.035  1.00  7.29           C  \nATOM    220  N   GLY A  31       3.984  11.764  10.241  1.00  4.99           N  \nATOM    221  CA  GLY A  31       4.769  12.336  11.360  1.00  5.50           C  \nATOM    222  C   GLY A  31       6.255  12.243  11.106  1.00  4.19           C  \nATOM    223  O   GLY A  31       7.037  12.750  11.954  1.00  6.12           O  \nATOM    224  N   CYS A  32       6.710  11.631   9.992  1.00  4.30           N  \nATOM    225  CA  CYS A  32       8.140  11.694   9.635  1.00  4.89           C  \nATOM    226  C   CYS A  32       8.500  13.141   9.206  1.00  5.50           C  \nATOM    227  O   CYS A  32       7.581  13.949   8.944  1.00  5.82           O  \nATOM    228  CB  CYS A  32       8.504  10.686   8.530  1.00  4.66           C  \nATOM    229  SG  CYS A  32       8.048   8.987   8.881  1.00  5.33           S  \nATOM    230  N   ILE A  33       9.793  13.410   9.173  1.00  6.02           N  \nATOM    231  CA  ILE A  33      10.280  14.760   8.823  1.00  5.24           C  \nATOM    232  C   ILE A  33      11.346  14.658   7.743  1.00  5.16           C  \nATOM    233  O   ILE A  33      11.971  13.583   7.552  1.00  7.19           O  \nATOM    234  CB  ILE A  33      10.790  15.535  10.085  1.00  5.49           C  \nATOM    235  CG1 ILE A  33      12.059  14.803  10.671  1.00  6.85           C  \nATOM    236  CG2 ILE A  33       9.684  15.686  11.138  1.00  6.45           C  \nATOM    237  CD1 ILE A  33      12.733  15.676  11.781  1.00  8.94           C  \nATOM    238  N   ILE A  34      11.490  15.773   7.038  1.00  5.52           N  \nATOM    239  CA  ILE A  34      12.552  15.877   6.036  1.00  6.82           C  \nATOM    240  C   ILE A  34      13.590  16.917   6.560  1.00  6.92           C  \nATOM    241  O   ILE A  34      13.168  18.006   6.945  1.00  9.22           O  \nATOM    242  CB  ILE A  34      11.987  16.360   4.681  1.00  8.11           C  \nATOM    243  CG1 ILE A  34      10.914  15.338   4.163  1.00  9.59           C  \nATOM    244  CG2 ILE A  34      13.131  16.517   3.629  1.00  9.73           C  \nATOM    245  CD1 ILE A  34      10.151  16.024   2.938  1.00 13.41           C  \nATOM    246  N   ILE A  35      14.856  16.493   6.536  1.00  7.06           N  \nATOM    247  CA  ILE A  35      15.930  17.454   6.941  1.00  7.52           C  \nATOM    248  C   ILE A  35      16.913  17.550   5.819  1.00  6.63           C  \nATOM    249  O   ILE A  35      17.097  16.660   4.970  1.00  7.90           O  \nATOM    250  CB  ILE A  35      16.622  16.995   8.285  1.00  8.07           C  \nATOM    251  CG1 ILE A  35      17.360  15.651   8.067  1.00  9.41           C  \nATOM    252  CG2 ILE A  35      15.592  16.974   9.434  1.00  9.46           C  \nATOM    253  CD1 ILE A  35      18.298  15.206   9.219  1.00  9.85           C  \nATOM    254  N   PRO A  36      17.664  18.669   5.806  1.00  8.07           N  \nATOM    255  CA  PRO A  36      18.635  18.861   4.738  1.00  8.78           C  \nATOM    256  C   PRO A  36      19.925  18.042   4.949  1.00  8.31           C  \nATOM    257  O   PRO A  36      20.593  17.742   3.945  1.00  9.09           O  \nATOM    258  CB  PRO A  36      18.945  20.364   4.783  1.00  9.67           C  \nATOM    259  CG  PRO A  36      18.238  20.937   5.908  1.00 10.15           C  \nATOM    260  CD  PRO A  36      17.371  19.900   6.596  1.00  9.53           C  \nATOM    261  N   GLY A  37      20.172  17.730   6.217  1.00  8.48           N  \nATOM    262  CA  GLY A  37      21.452  16.969   6.513  1.00  9.20           C  \nATOM    263  C   GLY A  37      21.143  15.478   6.427  1.00 10.41           C  \nATOM    264  O   GLY A  37      20.138  15.023   5.878  1.00 12.06           O  \nATOM    265  N   ALA A  38      22.055  14.701   7.032  1.00  9.24           N  \nATOM    266  CA  ALA A  38      22.019  13.242   7.020  1.00  9.24           C  \nATOM    267  C   ALA A  38      21.944  12.628   8.396  1.00  9.60           C  \nATOM    268  O   ALA A  38      21.869  11.387   8.435  1.00 13.65           O  \nATOM    269  CB  ALA A  38      23.246  12.697   6.275  1.00 10.43           C  \nATOM    270  N   THR A  39      21.894  13.435   9.436  1.00  8.70           N  \nATOM    271  CA  THR A  39      21.936  12.911  10.809  1.00  9.46           C  \nATOM    272  C   THR A  39      20.615  13.191  11.521  1.00  8.32           C  \nATOM    273  O   THR A  39      20.357  14.317  11.948  1.00  9.89           O  \nATOM    274  CB  THR A  39      23.131  13.601  11.593  1.00 10.72           C  \nATOM    275  OG1 THR A  39      24.284  13.401  10.709  1.00 11.66           O  \nATOM    276  CG2 THR A  39      23.340  12.935  12.962  1.00 11.81           C  \nATOM    277  N   CYS A  40      19.827  12.110  11.642  1.00  7.64           N  \nATOM    278  CA  CYS A  40      18.504  12.312  12.298  1.00  8.05           C  \nATOM    279  C   CYS A  40      18.684  12.451  13.784  1.00  7.63           C  \nATOM    280  O   CYS A  40      19.533  11.718  14.362  1.00  9.64           O  \nATOM    281  CB  CYS A  40      17.582  11.117  11.996  1.00  7.80           C  \nATOM    282  SG  CYS A  40      17.199  10.929  10.237  1.00  7.30           S  \nATOM    283  N   PRO A  41      17.880  13.266  14.426  1.00  8.00           N  \nATOM    284  CA  PRO A  41      17.924  13.421  15.877  1.00  8.96           C  \nATOM    285  C   PRO A  41      17.392  12.206  16.594  1.00  9.06           C  \nATOM    286  O   PRO A  41      16.652  11.368  16.033  1.00  8.82           O  \nATOM    287  CB  PRO A  41      17.076  14.658  16.145  1.00 10.39           C  \nATOM    288  CG  PRO A  41      16.098  14.689  14.997  1.00 10.99           C  \nATOM    289  CD  PRO A  41      16.859  14.150  13.779  1.00 10.49           C  \nATOM    290  N   GLY A  42      17.728  12.124  17.884  1.00  7.55           N  \nATOM    291  CA  GLY A  42      17.334  10.956  18.691  1.00  8.00           C  \nATOM    292  C   GLY A  42      15.875  10.688  18.871  1.00  7.22           C  \nATOM    293  O   GLY A  42      15.434   9.550  19.166  1.00  8.41           O  \nATOM    294  N   ASP A  43      15.036  11.747  18.715  1.00  5.54           N  \nATOM    295  CA  ASP A  43      13.564  11.573  18.836  1.00  5.85           C  \nATOM    296  C   ASP A  43      12.936  11.227  17.470  1.00  5.87           C  \nATOM    297  O   ASP A  43      11.720  11.040  17.428  1.00  7.29           O  \nATOM    298  CB  ASP A  43      12.933  12.737  19.580  1.00  6.72           C  \nATOM    299  CG  ASP A  43      13.140  14.094  18.958  1.00  8.59           C  \nATOM    300  OD1 ASP A  43      14.109  14.303  18.212  1.00  9.59           O  \nATOM    301  OD2 ASP A  43      12.267  14.963  19.265  1.00 11.45           O  \nATOM    302  N   TYR A  44      13.725  11.174  16.425  1.00  5.22           N  \nATOM    303  CA  TYR A  44      13.257  10.745  15.081  1.00  5.56           C  \nATOM    304  C   TYR A  44      14.275   9.687  14.612  1.00  4.61           C  \nATOM    305  O   TYR A  44      14.930   9.862  13.568  1.00  6.04           O  \nATOM    306  CB  TYR A  44      13.200  11.914  14.071  1.00  5.41           C  \nATOM    307  CG  TYR A  44      12.000  12.819  14.399  1.00  5.34           C  \nATOM    308  CD1 TYR A  44      12.119  13.853  15.332  1.00  6.59           C  \nATOM    309  CD2 TYR A  44      10.775  12.617  13.762  1.00  5.94           C  \nATOM    310  CE1 TYR A  44      11.045  14.675  15.610  1.00  5.97           C  \nATOM    311  CE2 TYR A  44       9.676  13.433  14.048  1.00  5.17           C  \nATOM    312  CZ  TYR A  44       9.802  14.456  14.996  1.00  5.96           C  \nATOM    313  OH  TYR A  44       8.740  15.265  15.269  1.00  8.60           O  \nATOM    314  N   ALA A  45      14.342   8.640  15.422  1.00  4.76           N  \nATOM    315  CA  ALA A  45      15.445   7.667  15.246  1.00  5.89           C  \nATOM    316  C   ALA A  45      15.171   6.533  14.280  1.00  6.67           C  \nATOM    317  O   ALA A  45      16.093   5.705  14.039  1.00  7.56           O  \nATOM    318  CB  ALA A  45      15.680   7.099  16.682  1.00  6.82           C  \nATOM    319  N   ASN A  46      13.966   6.502  13.739  1.00  5.80           N  \nATOM    320  CA  ASN A  46      13.512   5.395  12.878  1.00  6.15           C  \nATOM    321  C   ASN A  46      13.311   5.853  11.455  1.00  6.61           C  \nATOM    322  O   ASN A  46      13.733   6.929  11.026  1.00  7.18           O  \nATOM    323  CB  ASN A  46      12.266   4.769  13.501  1.00  7.27           C  \nATOM    324  CG  ASN A  46      12.538   4.304  14.922  1.00  7.98           C  \nATOM    325  OD1 ASN A  46      11.982   4.849  15.886  1.00 11.00           O  \nATOM    326  ND2 ASN A  46      13.407   3.298  15.015  1.00 10.32           N  \nATOM    327  OXT ASN A  46      12.703   4.973  10.746  1.00  7.86           O  \nTER     328      ASN A  46                                                      \nCONECT   20  282                                                                \nCONECT   26  229                                                                \nCONECT  116  188                                                                \nCONECT  188  116                                                                \nCONECT  229   26                                                                \nCONECT  282   20                                                                \nMASTER      227    0    0    2    2    1    0    6  327    1    6    4          \nEND                                                                             \n', 1);
      						    		$.get('http://www.rcsb.org/pdb/files/'+pdb_name+'.pdb', function(data) {			
      						    			var mol = ChemDoodle.readPDB(data);
      						    			pdb.loadMolecule(mol);
      						    			pdb.startAnimation();
      						    		});
      	    				    	}
      	    					}
      	    				}
      	    			});
      	    			
      	    			_this.p3dProtein.add(pan);
      	    		}
    			}
    			else{
    				_this.p3dProtein.setTitle('No proteins found');
    			}


  	    	}
    	});
    	
//    	$.get('http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb', 
    	
    	
    	
    	
//    	http://www.rcsb.org/pdb/files/1A17.pdb
    	
//    	http://www.rcsb.org/pdb/files/AAAA.pdb
    	
//		var pan = Ext.create('Ext.panel.Panel',{
//			title:"3D Protein Viewer",
//	        border:false,
//	        cls:'panel-border-left',
//			flex:3,
//			bodyPadding:5,
//			autoScroll:true,
//			html:'<canvas class="ChemDoodleWebComponent" id="pdb_canvas_prueba" width="600" height="600" style="width: 600px; height: 600px; ">This browser does not support HTML5/Canvas.</canvas>',
//
//		});

    }
    return this.p3dProtein;

};


GeneInfoWidget.prototype.getEnsembleId = function (){

};


GeneInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function (evt){
		_this.dataReceived(JSON.parse(cellBaseDataAdapter.toJSON()));//TODO
	});
	cellBaseDataAdapter.fill("feature","gene", this.feature.feature.stableId, "fullinfo");
};
GeneInfoWidget.prototype.dataReceived = function (data){
	this.data=data[0];
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};ProteinInfoWidget.prototype.draw = InfoWidget.prototype.draw;
ProteinInfoWidget.prototype.render = InfoWidget.prototype.render;
ProteinInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
ProteinInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
ProteinInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;

function ProteinInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Protein Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

ProteinInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Sumary", children: [
	                { text: "Long"},
	                { text: "Seq"}
	            ] },
	            { text: "Functional information", children: [
	                { text: "GO"},
	                { text: "Reactome"},
	                { text: "Interpro"}
	            ] },
	            { text: "Interactions"},
	            { text: "Variations"}
	           
	        ];
};
ProteinInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "":  break;
			case "":  break;
//			case "GO": this.panel.add(this.getGoGrid().show()); break;
			case "Reactome": break;
			case "Interpro": break;
			case "": break;
			case "": break;
			case "": break;
		}
	}
};SnpInfoWidget.prototype.draw = InfoWidget.prototype.draw;
SnpInfoWidget.prototype.render = InfoWidget.prototype.render;
SnpInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
SnpInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
SnpInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
SnpInfoWidget.prototype.getSnpTemplate = InfoWidget.prototype.getSnpTemplate;

function SnpInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "SNP Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

SnpInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Genomic", children: [
	                { text: "Information"},
	                { text: "Gene"}
	            ] },
	            { text: "Consequence Type"},
	            { text: "Population"}
	           
	        ];
};
SnpInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information":  this.panel.add(this.getInfoPanel(this.data).show()); break;
			case "Consequence Type": break;
			case "Population": break;
		}
	}
};

SnpInfoWidget.prototype.getInfoPanel = function(data){
    if(this.infoPanel==null){

    	var tpl = this.getSnpTemplate();

		this.infoPanel = Ext.create('Ext.panel.Panel',{
			title:"Information",
	        border:false,
	        cls:'panel-border-left',
			flex:3,    
			bodyPadding:10,
			data:data,
			tpl:tpl
		});

    }
    return this.infoPanel;
};

SnpInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function (evt){
		_this.dataReceived(JSON.parse(cellBaseDataAdapter.toJSON()));//TODO
	});
	cellBaseDataAdapter.fill("feature","snp", this.feature.getName(), "fullinfo");
};
SnpInfoWidget.prototype.dataReceived = function (data){
	var mappedSnps = data[0];
	for ( var i = 0; i < mappedSnps.length; i++) {
		if (mappedSnps[i].chromosome == this.feature.feature.chromosome && mappedSnps[i].start == this.feature.start && mappedSnps[i].end == this.feature.end ){
			this.data=mappedSnps[i];
			console.log(mappedSnps[i]);
		}
	}
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};
TranscriptInfoWidget.prototype.draw = InfoWidget.prototype.draw;
TranscriptInfoWidget.prototype.render = InfoWidget.prototype.render;
TranscriptInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
TranscriptInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
TranscriptInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
TranscriptInfoWidget.prototype.getGeneTemplate = InfoWidget.prototype.getGeneTemplate;
TranscriptInfoWidget.prototype.getTranscriptTemplate = InfoWidget.prototype.getTranscriptTemplate;
TranscriptInfoWidget.prototype.getExonTemplate = InfoWidget.prototype.getExonTemplate;

function TranscriptInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Transcript";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

TranscriptInfoWidget.prototype.getdataTypes = function (){
	//Abstract method
	return dataTypes=[
	            { text: "Genomic", children: [
	                 { text: "Information"},
	                 { text: "Gene"},
	                 { text: "Exons"}
	            ] },
	            { text: "Functional information", children: [
	                  { text: "GO"},
	                  { text: "Interpro"},
	                  { text: "Reactome"}
	            ] },
	            { text: "Variation", children: [
	                  { text: "SNPs"},
	                  { text: "Mutations"}
	            ] },
	            { text: "Regulatory", children: [
	            ]},
	            {text:"3D protein"}
	            
	        ];
};
TranscriptInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information": this.panel.add(this.getInfoPanel(this.data).show()); break;
			case "Gene": this.panel.add(this.getGenePanel(this.data.gene).show());  break;
			case "Exons": this.panel.add(this.getExonsGrid(this.data.exons).show());  break;
			case "GO": this.panel.add(this.getXrefGrid(this.data.go, "GO").show());  break;
			case "Interpro": this.panel.add(this.getXrefGrid(this.data.interpro, "Interpro").show());  break;
			case "Reactome": this.panel.add(this.getXrefGrid(this.data.reactome, "Reactome").show());  break;
			case "SNPs": this.panel.add(this.getSnpsGrid(this.data.snps).show());  break;
			case "3D protein": this.panel.add(this.get3Dprotein(this.data.snps).show());  break;
		}
	}
};

TranscriptInfoWidget.prototype.getInfoPanel = function(data){
	if(this.infoPanel==null){
		
    	var tpl = this.getTranscriptTemplate();
    	
		this.infoPanel = Ext.create('Ext.panel.Panel',{
			title:"Information",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:10,
			autoScroll:true,
			data:data,//para el template
			tpl:tpl
		});
	}
	return this.infoPanel;
};

TranscriptInfoWidget.prototype.getGenePanel = function(data){
    if(this.genePanel==null){
    	
    	var tpl = this.getGeneTemplate();
    	
		this.genePanel = Ext.create('Ext.panel.Panel',{
			title:"Gene",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:10,
			data:data,
			tpl:tpl
		});
    }
    return this.genePanel;
};

TranscriptInfoWidget.prototype.getExonsGrid = function(data){
    if(this.exonsGrid==null){

    	var tpl = this.getExonTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var exonPanel = Ext.create('Ext.panel.Panel',{
		        border:false,
				bodyPadding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(exonPanel);
    	}
		this.exonsGrid = Ext.create('Ext.panel.Panel',{
			title:"Exons ("+i+")",
	        border:false,
	        cls:'panel-border-left',
			flex:3,
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.exonsGrid;
};

TranscriptInfoWidget.prototype.getXrefGrid = function(data, dbname){
    if(this[dbname+"Grid"]==null){
    	var groupField = '';
    	var modelName = dbname;
	    var fields = ['description','displayId'];
		var columns = [
		               	{header : 'Display Id',dataIndex: 'displayId',flex:1},
		               	{header : 'Description',dataIndex: 'description',flex:3}
		             ];
		this[dbname+"Grid"] = this.doGrid(columns,fields,modelName,groupField);
		this[dbname+"Grid"].store.loadData(data);
    }
    return this[dbname+"Grid"];
};


//TODO hay muchos y tarda
TranscriptInfoWidget.prototype.getSnpsGrid = function(data){
    if(this.snpsGrid==null){
    	var groupField = '';
    	var modelName = 'SNPs';
	    var fields = ['chromosome','start','end','name',"strand","sequence"];
		var columns = [
		               	{header : 'Name',dataIndex: 'name',flex:2},
		               	{header : 'Location', xtype:'templatecolumn', tpl:'{chromosome}:{start}-{end}',flex:2},
						{header : 'Strand',dataIndex: 'strand',flex:0.7},
						{header : 'Sequence',dataIndex: 'sequence',flex:2}
		             ];
		this.snpsGrid = this.doGrid(columns,fields,modelName,groupField);
		this.snpsGrid.store.loadData(data);
    }
    return this.snpsGrid;
};
TranscriptInfoWidget.prototype.get3Dprotein = function(data){
	var _this=this;
    if(this.p3dProtein==null){
    	//ws
//    	
      	this.p3dProtein = Ext.create('Ext.tab.Panel',{
      		title:"3D Protein Viewer",
      		border:false,
      		cls:'panel-border-left',
      		flex:3,
//    		bodyPadding:5,
      		autoScroll:true
//      		items:items
      	});
    	
//		$.get('http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/'+_this.feature.feature.stableId+'/xref?dbname=pdb', function(data){
    
    	var pdbs = [];
    	$.ajax({
//    		  url: 'http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb',
    		  url: 'http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/'+this.feature.feature.stableId+'/xref?dbname=pdb',
//    		  data: data,
//    		  dataType: dataType,
    		  async:false,
    		  success: function(data){
    			if(data!=""){
//      	    		console.log(data.trim());
      	    		pdbs = data.trim().split("\n");
//      	    		console.log(pdbs);
      	    		
      	    		for ( var i = 0; i < pdbs.length; i++) {
      	    			var pdb_name=pdbs[i].trim();
      	    			var pan = Ext.create('Ext.panel.Panel',{
      	    				title:pdb_name,
      	    				bodyCls:'background-black',
      	    				html:'<canvas class="ChemDoodleWebComponent" id="pdb_canvas_'+pdb_name+'" width="600" height="600" style="width: 600px; height: 600px; ">This browser does not support HTML5/Canvas.</canvas>',
      	    				listeners:{
      	    					afterrender:function(este){
      	    						// JavaScript Document
      	    						var pdb_name=este.title;
      	    						
      	    				    	ChemDoodle.default_backgroundColor = '#000000';
      	    				    	
      	    				    	var pdb = new ChemDoodle.TransformCanvas3D('pdb_canvas_'+pdb_name, 300, 300);
      	    				    	if(!pdb.gl){
      	    				    	  pdb.emptyMessage = 'Your browser does not support WebGL';
      	    				    	  pdb.displayMessage();
      	    				    	}else{
      	    					    	pdb.specs.set3DRepresentation('Ball and Stick');
      	    					    	pdb.specs.proteins_ribbonCartoonize = true;
      	    					    	pdb.handle = null;
      	    					    	pdb.timeout = 15;
      	    					    	pdb.startAnimation = ChemDoodle._AnimatorCanvas.prototype.startAnimation;
      	    					    	pdb.stopAnimation = ChemDoodle._AnimatorCanvas.prototype.stopAnimation;
      	    					    	pdb.isRunning = ChemDoodle._AnimatorCanvas.prototype.isRunning;
      	    					    	pdb.dblclick = ChemDoodle.RotatorCanvas.prototype.dblclick;
      	    					    	pdb.nextFrame = function(delta){
      	    					    		var matrix = [];
      	    					    		mat4.identity(matrix);
      	    					    		var change = delta/1000;
      	    					    	        var increment = Math.PI/15;
      	    					    		mat4.rotate(matrix, increment*change, [ 1, 0, 0 ]);
      	    					    		mat4.rotate(matrix, increment*change, [ 0, 1, 0 ]);
      	    					    		mat4.rotate(matrix, increment*change, [ 0, 0, 1 ]);
      	    					    		mat4.multiply(this.rotationMatrix, matrix);
      	    					    	};
      	    					    	
//      	    					    	http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb
//      	    				    	var mol = ChemDoodle.readPDB('HEADER    PLANT SEED PROTEIN                      30-APR-81   1CRN                                                                       \nDBREF  1CRN A    1    46  UNP    P01542   CRAM_CRAAB       1     46             \nSEQRES   1 A   46  THR THR CYS CYS PRO SER ILE VAL ALA ARG SER ASN PHE          \nSEQRES   2 A   46  ASN VAL CYS ARG LEU PRO GLY THR PRO GLU ALA ILE CYS          \nSEQRES   3 A   46  ALA THR TYR THR GLY CYS ILE ILE ILE PRO GLY ALA THR          \nSEQRES   4 A   46  CYS PRO GLY ASP TYR ALA ASN                                  \nHELIX    1  H1 ILE A    7  PRO A   19  13/10 CONFORMATION RES 17,19       13    \nHELIX    2  H2 GLU A   23  THR A   30  1DISTORTED 3/10 AT RES 30           8    \nSHEET    1  S1 2 THR A   1  CYS A   4  0                                        \nSHEET    2  S1 2 CYS A  32  ILE A  35 -1                                        \nSSBOND   1 CYS A    3    CYS A   40                          1555   1555  2.00  \nSSBOND   2 CYS A    4    CYS A   32                          1555   1555  2.04  \nSSBOND   3 CYS A   16    CYS A   26                          1555   1555  2.05  \nCRYST1   40.960   18.650   22.520  90.00  90.77  90.00 P 1 21 1      2          \nORIGX1      1.000000  0.000000  0.000000        0.00000                         \nORIGX2      0.000000  1.000000  0.000000        0.00000                         \nORIGX3      0.000000  0.000000  1.000000        0.00000                         \nSCALE1      0.024414  0.000000 -0.000328        0.00000                         \nSCALE2      0.000000  0.053619  0.000000        0.00000                         \nSCALE3      0.000000  0.000000  0.044409        0.00000                         \nATOM      1  N   THR A   1      17.047  14.099   3.625  1.00 13.79           N  \nATOM      2  CA  THR A   1      16.967  12.784   4.338  1.00 10.80           C  \nATOM      3  C   THR A   1      15.685  12.755   5.133  1.00  9.19           C  \nATOM      4  O   THR A   1      15.268  13.825   5.594  1.00  9.85           O  \nATOM      5  CB  THR A   1      18.170  12.703   5.337  1.00 13.02           C  \nATOM      6  OG1 THR A   1      19.334  12.829   4.463  1.00 15.06           O  \nATOM      7  CG2 THR A   1      18.150  11.546   6.304  1.00 14.23           C  \nATOM      8  N   THR A   2      15.115  11.555   5.265  1.00  7.81           N  \nATOM      9  CA  THR A   2      13.856  11.469   6.066  1.00  8.31           C  \nATOM     10  C   THR A   2      14.164  10.785   7.379  1.00  5.80           C  \nATOM     11  O   THR A   2      14.993   9.862   7.443  1.00  6.94           O  \nATOM     12  CB  THR A   2      12.732  10.711   5.261  1.00 10.32           C  \nATOM     13  OG1 THR A   2      13.308   9.439   4.926  1.00 12.81           O  \nATOM     14  CG2 THR A   2      12.484  11.442   3.895  1.00 11.90           C  \nATOM     15  N   CYS A   3      13.488  11.241   8.417  1.00  5.24           N  \nATOM     16  CA  CYS A   3      13.660  10.707   9.787  1.00  5.39           C  \nATOM     17  C   CYS A   3      12.269  10.431  10.323  1.00  4.45           C  \nATOM     18  O   CYS A   3      11.393  11.308  10.185  1.00  6.54           O  \nATOM     19  CB  CYS A   3      14.368  11.748  10.691  1.00  5.99           C  \nATOM     20  SG  CYS A   3      15.885  12.426  10.016  1.00  7.01           S  \nATOM     21  N   CYS A   4      12.019   9.272  10.928  1.00  3.90           N  \nATOM     22  CA  CYS A   4      10.646   8.991  11.408  1.00  4.24           C  \nATOM     23  C   CYS A   4      10.654   8.793  12.919  1.00  3.72           C  \nATOM     24  O   CYS A   4      11.659   8.296  13.491  1.00  5.30           O  \nATOM     25  CB  CYS A   4      10.057   7.752  10.682  1.00  4.41           C  \nATOM     26  SG  CYS A   4       9.837   8.018   8.904  1.00  4.72           S  \nATOM     27  N   PRO A   5       9.561   9.108  13.563  1.00  3.96           N  \nATOM     28  CA  PRO A   5       9.448   9.034  15.012  1.00  4.25           C  \nATOM     29  C   PRO A   5       9.288   7.670  15.606  1.00  4.96           C  \nATOM     30  O   PRO A   5       9.490   7.519  16.819  1.00  7.44           O  \nATOM     31  CB  PRO A   5       8.230   9.957  15.345  1.00  5.11           C  \nATOM     32  CG  PRO A   5       7.338   9.786  14.114  1.00  5.24           C  \nATOM     33  CD  PRO A   5       8.366   9.804  12.958  1.00  5.20           C  \nATOM     34  N   SER A   6       8.875   6.686  14.796  1.00  4.83           N  \nATOM     35  CA  SER A   6       8.673   5.314  15.279  1.00  4.45           C  \nATOM     36  C   SER A   6       8.753   4.376  14.083  1.00  4.99           C  \nATOM     37  O   SER A   6       8.726   4.858  12.923  1.00  4.61           O  \nATOM     38  CB  SER A   6       7.340   5.121  15.996  1.00  5.05           C  \nATOM     39  OG  SER A   6       6.274   5.220  15.031  1.00  6.39           O  \nATOM     40  N   ILE A   7       8.881   3.075  14.358  1.00  4.94           N  \nATOM     41  CA  ILE A   7       8.912   2.083  13.258  1.00  6.33           C  \nATOM     42  C   ILE A   7       7.581   2.090  12.506  1.00  5.32           C  \nATOM     43  O   ILE A   7       7.670   2.031  11.245  1.00  6.85           O  \nATOM     44  CB  ILE A   7       9.207   0.677  13.924  1.00  8.43           C  \nATOM     45  CG1 ILE A   7      10.714   0.702  14.312  1.00  9.78           C  \nATOM     46  CG2 ILE A   7       8.811  -0.477  12.969  1.00 11.70           C  \nATOM     47  CD1 ILE A   7      11.185  -0.516  15.142  1.00  9.92           C  \nATOM     48  N   VAL A   8       6.458   2.162  13.159  1.00  5.02           N  \nATOM     49  CA  VAL A   8       5.145   2.209  12.453  1.00  6.93           C  \nATOM     50  C   VAL A   8       5.115   3.379  11.461  1.00  5.39           C  \nATOM     51  O   VAL A   8       4.664   3.268  10.343  1.00  6.30           O  \nATOM     52  CB  VAL A   8       3.995   2.354  13.478  1.00  9.64           C  \nATOM     53  CG1 VAL A   8       2.716   2.891  12.869  1.00 13.85           C  \nATOM     54  CG2 VAL A   8       3.758   1.032  14.208  1.00 11.97           C  \nATOM     55  N   ALA A   9       5.606   4.546  11.941  1.00  3.73           N  \nATOM     56  CA  ALA A   9       5.598   5.767  11.082  1.00  3.56           C  \nATOM     57  C   ALA A   9       6.441   5.527   9.850  1.00  4.13           C  \nATOM     58  O   ALA A   9       6.052   5.933   8.744  1.00  4.36           O  \nATOM     59  CB  ALA A   9       6.022   6.977  11.891  1.00  4.80           C  \nATOM     60  N   ARG A  10       7.647   4.909  10.005  1.00  3.73           N  \nATOM     61  CA  ARG A  10       8.496   4.609   8.837  1.00  3.38           C  \nATOM     62  C   ARG A  10       7.798   3.609   7.876  1.00  3.47           C  \nATOM     63  O   ARG A  10       7.878   3.778   6.651  1.00  4.67           O  \nATOM     64  CB  ARG A  10       9.847   4.020   9.305  1.00  3.95           C  \nATOM     65  CG  ARG A  10      10.752   3.607   8.149  1.00  4.55           C  \nATOM     66  CD  ARG A  10      11.226   4.699   7.244  1.00  5.89           C  \nATOM     67  NE  ARG A  10      12.143   5.571   8.035  1.00  6.20           N  \nATOM     68  CZ  ARG A  10      12.758   6.609   7.443  1.00  7.52           C  \nATOM     69  NH1 ARG A  10      12.539   6.932   6.158  1.00 10.68           N  \nATOM     70  NH2 ARG A  10      13.601   7.322   8.202  1.00  9.48           N  \nATOM     71  N   SER A  11       7.186   2.582   8.445  1.00  5.19           N  \nATOM     72  CA  SER A  11       6.500   1.584   7.565  1.00  4.60           C  \nATOM     73  C   SER A  11       5.382   2.313   6.773  1.00  4.84           C  \nATOM     74  O   SER A  11       5.213   2.016   5.557  1.00  5.84           O  \nATOM     75  CB  SER A  11       5.908   0.462   8.400  1.00  5.91           C  \nATOM     76  OG  SER A  11       6.990  -0.272   9.012  1.00  8.38           O  \nATOM     77  N   ASN A  12       4.648   3.182   7.446  1.00  3.54           N  \nATOM     78  CA  ASN A  12       3.545   3.935   6.751  1.00  4.57           C  \nATOM     79  C   ASN A  12       4.107   4.851   5.691  1.00  4.14           C  \nATOM     80  O   ASN A  12       3.536   5.001   4.617  1.00  5.52           O  \nATOM     81  CB  ASN A  12       2.663   4.677   7.748  1.00  6.42           C  \nATOM     82  CG  ASN A  12       1.802   3.735   8.610  1.00  8.25           C  \nATOM     83  OD1 ASN A  12       1.567   2.613   8.165  1.00 12.72           O  \nATOM     84  ND2 ASN A  12       1.394   4.252   9.767  1.00  9.92           N  \nATOM     85  N   PHE A  13       5.259   5.498   6.005  1.00  3.43           N  \nATOM     86  CA  PHE A  13       5.929   6.358   5.055  1.00  3.49           C  \nATOM     87  C   PHE A  13       6.304   5.578   3.799  1.00  3.40           C  \nATOM     88  O   PHE A  13       6.136   6.072   2.653  1.00  4.07           O  \nATOM     89  CB  PHE A  13       7.183   6.994   5.754  1.00  5.48           C  \nATOM     90  CG  PHE A  13       7.884   8.006   4.883  1.00  5.57           C  \nATOM     91  CD1 PHE A  13       8.906   7.586   4.027  1.00  6.99           C  \nATOM     92  CD2 PHE A  13       7.532   9.373   4.983  1.00  6.52           C  \nATOM     93  CE1 PHE A  13       9.560   8.539   3.194  1.00  8.20           C  \nATOM     94  CE2 PHE A  13       8.176  10.281   4.145  1.00  6.34           C  \nATOM     95  CZ  PHE A  13       9.141   9.845   3.292  1.00  6.84           C  \nATOM     96  N   ASN A  14       6.900   4.390   3.989  1.00  3.64           N  \nATOM     97  CA  ASN A  14       7.331   3.607   2.791  1.00  4.31           C  \nATOM     98  C   ASN A  14       6.116   3.210   1.915  1.00  3.98           C  \nATOM     99  O   ASN A  14       6.240   3.144   0.684  1.00  6.22           O  \nATOM    100  CB  ASN A  14       8.145   2.404   3.240  1.00  5.81           C  \nATOM    101  CG  ASN A  14       9.555   2.856   3.730  1.00  6.82           C  \nATOM    102  OD1 ASN A  14      10.013   3.895   3.323  1.00  9.43           O  \nATOM    103  ND2 ASN A  14      10.120   1.956   4.539  1.00  8.21           N  \nATOM    104  N   VAL A  15       4.993   2.927   2.571  1.00  3.76           N  \nATOM    105  CA  VAL A  15       3.782   2.599   1.742  1.00  3.98           C  \nATOM    106  C   VAL A  15       3.296   3.871   1.004  1.00  3.80           C  \nATOM    107  O   VAL A  15       2.947   3.817  -0.189  1.00  4.85           O  \nATOM    108  CB  VAL A  15       2.698   1.953   2.608  1.00  4.71           C  \nATOM    109  CG1 VAL A  15       1.384   1.826   1.806  1.00  6.67           C  \nATOM    110  CG2 VAL A  15       3.174   0.533   3.005  1.00  6.26           C  \nATOM    111  N   CYS A  16       3.321   4.987   1.720  1.00  3.79           N  \nATOM    112  CA  CYS A  16       2.890   6.285   1.126  1.00  3.54           C  \nATOM    113  C   CYS A  16       3.687   6.597  -0.111  1.00  3.48           C  \nATOM    114  O   CYS A  16       3.200   7.147  -1.103  1.00  4.63           O  \nATOM    115  CB  CYS A  16       3.039   7.369   2.240  1.00  4.58           C  \nATOM    116  SG  CYS A  16       2.559   9.014   1.649  1.00  5.66           S  \nATOM    117  N   ARG A  17       4.997   6.227  -0.100  1.00  3.99           N  \nATOM    118  CA  ARG A  17       5.895   6.489  -1.213  1.00  3.83           C  \nATOM    119  C   ARG A  17       5.738   5.560  -2.409  1.00  3.79           C  \nATOM    120  O   ARG A  17       6.228   5.901  -3.507  1.00  5.39           O  \nATOM    121  CB  ARG A  17       7.370   6.507  -0.731  1.00  4.11           C  \nATOM    122  CG  ARG A  17       7.717   7.687   0.206  1.00  4.69           C  \nATOM    123  CD  ARG A  17       7.949   8.947  -0.615  1.00  5.10           C  \nATOM    124  NE  ARG A  17       9.212   8.856  -1.337  1.00  4.71           N  \nATOM    125  CZ  ARG A  17       9.537   9.533  -2.431  1.00  5.28           C  \nATOM    126  NH1 ARG A  17       8.659  10.350  -3.032  1.00  6.67           N  \nATOM    127  NH2 ARG A  17      10.793   9.491  -2.899  1.00  6.41           N  \nATOM    128  N   LEU A  18       5.051   4.411  -2.204  1.00  4.70           N  \nATOM    129  CA  LEU A  18       4.933   3.431  -3.326  1.00  5.46           C  \nATOM    130  C   LEU A  18       4.397   4.014  -4.620  1.00  5.13           C  \nATOM    131  O   LEU A  18       4.988   3.755  -5.687  1.00  5.55           O  \nATOM    132  CB  LEU A  18       4.196   2.184  -2.863  1.00  6.47           C  \nATOM    133  CG  LEU A  18       4.960   1.178  -1.991  1.00  7.43           C  \nATOM    134  CD1 LEU A  18       3.907   0.097  -1.634  1.00  8.70           C  \nATOM    135  CD2 LEU A  18       6.129   0.606  -2.768  1.00  9.39           C  \nATOM    136  N   PRO A  19       3.329   4.795  -4.543  1.00  4.28           N  \nATOM    137  CA  PRO A  19       2.792   5.376  -5.797  1.00  5.38           C  \nATOM    138  C   PRO A  19       3.573   6.540  -6.322  1.00  6.30           C  \nATOM    139  O   PRO A  19       3.260   7.045  -7.422  1.00  9.62           O  \nATOM    140  CB  PRO A  19       1.358   5.766  -5.472  1.00  5.87           C  \nATOM    141  CG  PRO A  19       1.223   5.694  -3.993  1.00  6.47           C  \nATOM    142  CD  PRO A  19       2.421   4.941  -3.408  1.00  6.45           C  \nATOM    143  N   GLY A  20       4.565   7.047  -5.559  1.00  4.94           N  \nATOM    144  CA  GLY A  20       5.366   8.191  -6.018  1.00  5.39           C  \nATOM    145  C   GLY A  20       5.007   9.481  -5.280  1.00  5.03           C  \nATOM    146  O   GLY A  20       5.535  10.510  -5.730  1.00  7.34           O  \nATOM    147  N   THR A  21       4.181   9.438  -4.262  1.00  4.10           N  \nATOM    148  CA  THR A  21       3.767  10.609  -3.513  1.00  3.94           C  \nATOM    149  C   THR A  21       5.017  11.397  -3.042  1.00  3.96           C  \nATOM    150  O   THR A  21       5.947  10.757  -2.523  1.00  5.82           O  \nATOM    151  CB  THR A  21       2.992  10.188  -2.225  1.00  4.13           C  \nATOM    152  OG1 THR A  21       2.051   9.144  -2.623  1.00  5.45           O  \nATOM    153  CG2 THR A  21       2.260  11.349  -1.551  1.00  5.41           C  \nATOM    154  N   PRO A  22       4.971  12.703  -3.176  1.00  5.04           N  \nATOM    155  CA  PRO A  22       6.143  13.513  -2.696  1.00  4.69           C  \nATOM    156  C   PRO A  22       6.400  13.233  -1.225  1.00  4.19           C  \nATOM    157  O   PRO A  22       5.485  13.061  -0.382  1.00  4.47           O  \nATOM    158  CB  PRO A  22       5.703  14.969  -2.920  1.00  7.12           C  \nATOM    159  CG  PRO A  22       4.676  14.893  -3.996  1.00  7.03           C  \nATOM    160  CD  PRO A  22       3.964  13.567  -3.811  1.00  4.90           C  \nATOM    161  N   GLU A  23       7.728  13.297  -0.921  1.00  5.16           N  \nATOM    162  CA  GLU A  23       8.114  13.103   0.500  1.00  5.31           C  \nATOM    163  C   GLU A  23       7.427  14.073   1.410  1.00  4.11           C  \nATOM    164  O   GLU A  23       7.036  13.682   2.540  1.00  5.11           O  \nATOM    165  CB  GLU A  23       9.648  13.285   0.660  1.00  6.16           C  \nATOM    166  CG  GLU A  23      10.440  12.093   0.063  1.00  7.48           C  \nATOM    167  CD  GLU A  23      11.941  12.170   0.391  1.00  9.40           C  \nATOM    168  OE1 GLU A  23      12.416  13.225   0.681  1.00 10.40           O  \nATOM    169  OE2 GLU A  23      12.539  11.070   0.292  1.00 13.32           O  \nATOM    170  N   ALA A  24       7.212  15.334   0.966  1.00  4.56           N  \nATOM    171  CA  ALA A  24       6.614  16.317   1.913  1.00  4.49           C  \nATOM    172  C   ALA A  24       5.212  15.936   2.350  1.00  4.10           C  \nATOM    173  O   ALA A  24       4.782  16.166   3.495  1.00  5.64           O  \nATOM    174  CB  ALA A  24       6.605  17.695   1.246  1.00  5.80           C  \nATOM    175  N   ILE A  25       4.445  15.318   1.405  1.00  4.37           N  \nATOM    176  CA  ILE A  25       3.074  14.894   1.756  1.00  5.44           C  \nATOM    177  C   ILE A  25       3.085  13.643   2.645  1.00  4.32           C  \nATOM    178  O   ILE A  25       2.315  13.523   3.578  1.00  4.72           O  \nATOM    179  CB  ILE A  25       2.204  14.637   0.462  1.00  6.42           C  \nATOM    180  CG1 ILE A  25       1.815  16.048  -0.129  1.00  7.50           C  \nATOM    181  CG2 ILE A  25       0.903  13.864   0.811  1.00  7.65           C  \nATOM    182  CD1 ILE A  25       0.756  16.761   0.757  1.00  7.80           C  \nATOM    183  N   CYS A  26       4.032  12.764   2.313  1.00  3.92           N  \nATOM    184  CA  CYS A  26       4.180  11.549   3.187  1.00  4.37           C  \nATOM    185  C   CYS A  26       4.632  11.944   4.596  1.00  3.95           C  \nATOM    186  O   CYS A  26       4.227  11.252   5.547  1.00  4.74           O  \nATOM    187  CB  CYS A  26       5.038  10.518   2.539  1.00  4.63           C  \nATOM    188  SG  CYS A  26       4.349   9.794   1.022  1.00  5.61           S  \nATOM    189  N   ALA A  27       5.408  13.012   4.694  1.00  3.89           N  \nATOM    190  CA  ALA A  27       5.879  13.502   6.026  1.00  4.43           C  \nATOM    191  C   ALA A  27       4.696  13.908   6.882  1.00  4.26           C  \nATOM    192  O   ALA A  27       4.528  13.422   8.025  1.00  5.44           O  \nATOM    193  CB  ALA A  27       6.880  14.615   5.830  1.00  5.36           C  \nATOM    194  N   THR A  28       3.827  14.802   6.358  1.00  4.53           N  \nATOM    195  CA  THR A  28       2.691  15.221   7.194  1.00  5.08           C  \nATOM    196  C   THR A  28       1.672  14.132   7.434  1.00  4.62           C  \nATOM    197  O   THR A  28       0.947  14.112   8.468  1.00  7.80           O  \nATOM    198  CB  THR A  28       1.986  16.520   6.614  1.00  6.03           C  \nATOM    199  OG1 THR A  28       1.664  16.221   5.230  1.00  7.19           O  \nATOM    200  CG2 THR A  28       2.914  17.739   6.700  1.00  7.34           C  \nATOM    201  N   TYR A  29       1.621  13.190   6.511  1.00  5.01           N  \nATOM    202  CA  TYR A  29       0.715  12.045   6.657  1.00  6.60           C  \nATOM    203  C   TYR A  29       1.125  11.125   7.815  1.00  4.92           C  \nATOM    204  O   TYR A  29       0.286  10.632   8.545  1.00  7.13           O  \nATOM    205  CB  TYR A  29       0.755  11.229   5.322  1.00  9.66           C  \nATOM    206  CG  TYR A  29      -0.203  10.044   5.354  1.00 11.56           C  \nATOM    207  CD1 TYR A  29      -1.547  10.337   5.645  1.00 12.85           C  \nATOM    208  CD2 TYR A  29       0.193   8.750   5.100  1.00 14.44           C  \nATOM    209  CE1 TYR A  29      -2.496   9.329   5.673  1.00 16.61           C  \nATOM    210  CE2 TYR A  29      -0.801   7.705   5.156  1.00 17.11           C  \nATOM    211  CZ  TYR A  29      -2.079   8.031   5.430  1.00 19.99           C  \nATOM    212  OH  TYR A  29      -3.097   7.057   5.458  1.00 28.98           O  \nATOM    213  N   THR A  30       2.470  10.984   7.995  1.00  5.31           N  \nATOM    214  CA  THR A  30       2.986   9.994   8.950  1.00  5.70           C  \nATOM    215  C   THR A  30       3.609  10.505  10.230  1.00  6.28           C  \nATOM    216  O   THR A  30       3.766   9.715  11.186  1.00  8.77           O  \nATOM    217  CB  THR A  30       4.076   9.103   8.225  1.00  6.55           C  \nATOM    218  OG1 THR A  30       5.125  10.027   7.824  1.00  6.57           O  \nATOM    219  CG2 THR A  30       3.493   8.324   7.035  1.00  7.29           C  \nATOM    220  N   GLY A  31       3.984  11.764  10.241  1.00  4.99           N  \nATOM    221  CA  GLY A  31       4.769  12.336  11.360  1.00  5.50           C  \nATOM    222  C   GLY A  31       6.255  12.243  11.106  1.00  4.19           C  \nATOM    223  O   GLY A  31       7.037  12.750  11.954  1.00  6.12           O  \nATOM    224  N   CYS A  32       6.710  11.631   9.992  1.00  4.30           N  \nATOM    225  CA  CYS A  32       8.140  11.694   9.635  1.00  4.89           C  \nATOM    226  C   CYS A  32       8.500  13.141   9.206  1.00  5.50           C  \nATOM    227  O   CYS A  32       7.581  13.949   8.944  1.00  5.82           O  \nATOM    228  CB  CYS A  32       8.504  10.686   8.530  1.00  4.66           C  \nATOM    229  SG  CYS A  32       8.048   8.987   8.881  1.00  5.33           S  \nATOM    230  N   ILE A  33       9.793  13.410   9.173  1.00  6.02           N  \nATOM    231  CA  ILE A  33      10.280  14.760   8.823  1.00  5.24           C  \nATOM    232  C   ILE A  33      11.346  14.658   7.743  1.00  5.16           C  \nATOM    233  O   ILE A  33      11.971  13.583   7.552  1.00  7.19           O  \nATOM    234  CB  ILE A  33      10.790  15.535  10.085  1.00  5.49           C  \nATOM    235  CG1 ILE A  33      12.059  14.803  10.671  1.00  6.85           C  \nATOM    236  CG2 ILE A  33       9.684  15.686  11.138  1.00  6.45           C  \nATOM    237  CD1 ILE A  33      12.733  15.676  11.781  1.00  8.94           C  \nATOM    238  N   ILE A  34      11.490  15.773   7.038  1.00  5.52           N  \nATOM    239  CA  ILE A  34      12.552  15.877   6.036  1.00  6.82           C  \nATOM    240  C   ILE A  34      13.590  16.917   6.560  1.00  6.92           C  \nATOM    241  O   ILE A  34      13.168  18.006   6.945  1.00  9.22           O  \nATOM    242  CB  ILE A  34      11.987  16.360   4.681  1.00  8.11           C  \nATOM    243  CG1 ILE A  34      10.914  15.338   4.163  1.00  9.59           C  \nATOM    244  CG2 ILE A  34      13.131  16.517   3.629  1.00  9.73           C  \nATOM    245  CD1 ILE A  34      10.151  16.024   2.938  1.00 13.41           C  \nATOM    246  N   ILE A  35      14.856  16.493   6.536  1.00  7.06           N  \nATOM    247  CA  ILE A  35      15.930  17.454   6.941  1.00  7.52           C  \nATOM    248  C   ILE A  35      16.913  17.550   5.819  1.00  6.63           C  \nATOM    249  O   ILE A  35      17.097  16.660   4.970  1.00  7.90           O  \nATOM    250  CB  ILE A  35      16.622  16.995   8.285  1.00  8.07           C  \nATOM    251  CG1 ILE A  35      17.360  15.651   8.067  1.00  9.41           C  \nATOM    252  CG2 ILE A  35      15.592  16.974   9.434  1.00  9.46           C  \nATOM    253  CD1 ILE A  35      18.298  15.206   9.219  1.00  9.85           C  \nATOM    254  N   PRO A  36      17.664  18.669   5.806  1.00  8.07           N  \nATOM    255  CA  PRO A  36      18.635  18.861   4.738  1.00  8.78           C  \nATOM    256  C   PRO A  36      19.925  18.042   4.949  1.00  8.31           C  \nATOM    257  O   PRO A  36      20.593  17.742   3.945  1.00  9.09           O  \nATOM    258  CB  PRO A  36      18.945  20.364   4.783  1.00  9.67           C  \nATOM    259  CG  PRO A  36      18.238  20.937   5.908  1.00 10.15           C  \nATOM    260  CD  PRO A  36      17.371  19.900   6.596  1.00  9.53           C  \nATOM    261  N   GLY A  37      20.172  17.730   6.217  1.00  8.48           N  \nATOM    262  CA  GLY A  37      21.452  16.969   6.513  1.00  9.20           C  \nATOM    263  C   GLY A  37      21.143  15.478   6.427  1.00 10.41           C  \nATOM    264  O   GLY A  37      20.138  15.023   5.878  1.00 12.06           O  \nATOM    265  N   ALA A  38      22.055  14.701   7.032  1.00  9.24           N  \nATOM    266  CA  ALA A  38      22.019  13.242   7.020  1.00  9.24           C  \nATOM    267  C   ALA A  38      21.944  12.628   8.396  1.00  9.60           C  \nATOM    268  O   ALA A  38      21.869  11.387   8.435  1.00 13.65           O  \nATOM    269  CB  ALA A  38      23.246  12.697   6.275  1.00 10.43           C  \nATOM    270  N   THR A  39      21.894  13.435   9.436  1.00  8.70           N  \nATOM    271  CA  THR A  39      21.936  12.911  10.809  1.00  9.46           C  \nATOM    272  C   THR A  39      20.615  13.191  11.521  1.00  8.32           C  \nATOM    273  O   THR A  39      20.357  14.317  11.948  1.00  9.89           O  \nATOM    274  CB  THR A  39      23.131  13.601  11.593  1.00 10.72           C  \nATOM    275  OG1 THR A  39      24.284  13.401  10.709  1.00 11.66           O  \nATOM    276  CG2 THR A  39      23.340  12.935  12.962  1.00 11.81           C  \nATOM    277  N   CYS A  40      19.827  12.110  11.642  1.00  7.64           N  \nATOM    278  CA  CYS A  40      18.504  12.312  12.298  1.00  8.05           C  \nATOM    279  C   CYS A  40      18.684  12.451  13.784  1.00  7.63           C  \nATOM    280  O   CYS A  40      19.533  11.718  14.362  1.00  9.64           O  \nATOM    281  CB  CYS A  40      17.582  11.117  11.996  1.00  7.80           C  \nATOM    282  SG  CYS A  40      17.199  10.929  10.237  1.00  7.30           S  \nATOM    283  N   PRO A  41      17.880  13.266  14.426  1.00  8.00           N  \nATOM    284  CA  PRO A  41      17.924  13.421  15.877  1.00  8.96           C  \nATOM    285  C   PRO A  41      17.392  12.206  16.594  1.00  9.06           C  \nATOM    286  O   PRO A  41      16.652  11.368  16.033  1.00  8.82           O  \nATOM    287  CB  PRO A  41      17.076  14.658  16.145  1.00 10.39           C  \nATOM    288  CG  PRO A  41      16.098  14.689  14.997  1.00 10.99           C  \nATOM    289  CD  PRO A  41      16.859  14.150  13.779  1.00 10.49           C  \nATOM    290  N   GLY A  42      17.728  12.124  17.884  1.00  7.55           N  \nATOM    291  CA  GLY A  42      17.334  10.956  18.691  1.00  8.00           C  \nATOM    292  C   GLY A  42      15.875  10.688  18.871  1.00  7.22           C  \nATOM    293  O   GLY A  42      15.434   9.550  19.166  1.00  8.41           O  \nATOM    294  N   ASP A  43      15.036  11.747  18.715  1.00  5.54           N  \nATOM    295  CA  ASP A  43      13.564  11.573  18.836  1.00  5.85           C  \nATOM    296  C   ASP A  43      12.936  11.227  17.470  1.00  5.87           C  \nATOM    297  O   ASP A  43      11.720  11.040  17.428  1.00  7.29           O  \nATOM    298  CB  ASP A  43      12.933  12.737  19.580  1.00  6.72           C  \nATOM    299  CG  ASP A  43      13.140  14.094  18.958  1.00  8.59           C  \nATOM    300  OD1 ASP A  43      14.109  14.303  18.212  1.00  9.59           O  \nATOM    301  OD2 ASP A  43      12.267  14.963  19.265  1.00 11.45           O  \nATOM    302  N   TYR A  44      13.725  11.174  16.425  1.00  5.22           N  \nATOM    303  CA  TYR A  44      13.257  10.745  15.081  1.00  5.56           C  \nATOM    304  C   TYR A  44      14.275   9.687  14.612  1.00  4.61           C  \nATOM    305  O   TYR A  44      14.930   9.862  13.568  1.00  6.04           O  \nATOM    306  CB  TYR A  44      13.200  11.914  14.071  1.00  5.41           C  \nATOM    307  CG  TYR A  44      12.000  12.819  14.399  1.00  5.34           C  \nATOM    308  CD1 TYR A  44      12.119  13.853  15.332  1.00  6.59           C  \nATOM    309  CD2 TYR A  44      10.775  12.617  13.762  1.00  5.94           C  \nATOM    310  CE1 TYR A  44      11.045  14.675  15.610  1.00  5.97           C  \nATOM    311  CE2 TYR A  44       9.676  13.433  14.048  1.00  5.17           C  \nATOM    312  CZ  TYR A  44       9.802  14.456  14.996  1.00  5.96           C  \nATOM    313  OH  TYR A  44       8.740  15.265  15.269  1.00  8.60           O  \nATOM    314  N   ALA A  45      14.342   8.640  15.422  1.00  4.76           N  \nATOM    315  CA  ALA A  45      15.445   7.667  15.246  1.00  5.89           C  \nATOM    316  C   ALA A  45      15.171   6.533  14.280  1.00  6.67           C  \nATOM    317  O   ALA A  45      16.093   5.705  14.039  1.00  7.56           O  \nATOM    318  CB  ALA A  45      15.680   7.099  16.682  1.00  6.82           C  \nATOM    319  N   ASN A  46      13.966   6.502  13.739  1.00  5.80           N  \nATOM    320  CA  ASN A  46      13.512   5.395  12.878  1.00  6.15           C  \nATOM    321  C   ASN A  46      13.311   5.853  11.455  1.00  6.61           C  \nATOM    322  O   ASN A  46      13.733   6.929  11.026  1.00  7.18           O  \nATOM    323  CB  ASN A  46      12.266   4.769  13.501  1.00  7.27           C  \nATOM    324  CG  ASN A  46      12.538   4.304  14.922  1.00  7.98           C  \nATOM    325  OD1 ASN A  46      11.982   4.849  15.886  1.00 11.00           O  \nATOM    326  ND2 ASN A  46      13.407   3.298  15.015  1.00 10.32           N  \nATOM    327  OXT ASN A  46      12.703   4.973  10.746  1.00  7.86           O  \nTER     328      ASN A  46                                                      \nCONECT   20  282                                                                \nCONECT   26  229                                                                \nCONECT  116  188                                                                \nCONECT  188  116                                                                \nCONECT  229   26                                                                \nCONECT  282   20                                                                \nMASTER      227    0    0    2    2    1    0    6  327    1    6    4          \nEND                                                                             \n', 1);
      						    		$.get('http://www.rcsb.org/pdb/files/'+pdb_name+'.pdb', function(data) {			
      						    			var mol = ChemDoodle.readPDB(data);
      						    			pdb.loadMolecule(mol);
      						    			pdb.startAnimation();
      						    		});
      	    				    	}
      	    					}
      	    				}
      	    			});
      	    			
      	    			_this.p3dProtein.add(pan);
      	    		}
    			}
    			else{
    				_this.p3dProtein.setTitle('No proteins found');
    			}


  	    	}
    	});
    	
//    	$.get('http://ws.bioinfo.cipf.es/celldb/rest/v1/hsa/feature/id/brca2/xref?dbname=pdb', 
    	
    	
    	
    	
//    	http://www.rcsb.org/pdb/files/1A17.pdb
    	
//    	http://www.rcsb.org/pdb/files/AAAA.pdb
    	
//		var pan = Ext.create('Ext.panel.Panel',{
//			title:"3D Protein Viewer",
//	        border:false,
//	        cls:'panel-border-left',
//			flex:3,
//			bodyPadding:5,
//			autoScroll:true,
//			html:'<canvas class="ChemDoodleWebComponent" id="pdb_canvas_prueba" width="600" height="600" style="width: 600px; height: 600px; ">This browser does not support HTML5/Canvas.</canvas>',
//
//		});

    }
    return this.p3dProtein;

};

TranscriptInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function (evt){
		_this.dataReceived(JSON.parse(cellBaseDataAdapter.toJSON()));//TODO
	});
	cellBaseDataAdapter.fill("feature","transcript", this.feature.feature.stableId, "fullinfo");
};
TranscriptInfoWidget.prototype.dataReceived = function (data){
	this.data=data[0];
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};



VCFVariantInfoWidget.prototype.draw = InfoWidget.prototype.draw;
VCFVariantInfoWidget.prototype.render = InfoWidget.prototype.render;
VCFVariantInfoWidget.prototype.getTreePanel = InfoWidget.prototype.getTreePanel;
VCFVariantInfoWidget.prototype.checkDataTypes = InfoWidget.prototype.checkDataTypes;
VCFVariantInfoWidget.prototype.doGrid = InfoWidget.prototype.doGrid;
VCFVariantInfoWidget.prototype.getVCFVariantTemplate = InfoWidget.prototype.getVCFVariantTemplate;

function VCFVariantInfoWidget(targetId, species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "VCF variant Info";
	InfoWidget.prototype.constructor.call(this, targetId, species, args);
};

VCFVariantInfoWidget.prototype.getdataTypes = function (){
	return dataTypes=[
	            { text: "Genomic", children: [
	                { text: "Information"}
	            ] }
	        ];
};
VCFVariantInfoWidget.prototype.optionClick = function (item){
	//Abstract method
	if (item.leaf){
		if(this.panel.getComponent(1)!=null){
			this.panel.getComponent(1).hide();
			this.panel.remove(1,false);
		}
		switch (item.text){
			case "Information":  this.panel.add(this.getInfoPanel(this.data).show()); break;
			case "Consequence Type": break;
			case "Population": break;
		}
	}
};

VCFVariantInfoWidget.prototype.getInfoPanel = function(data){
    if(this.infoPanel==null){

    	var tpl = this.getVCFVariantTemplate();

		this.infoPanel = Ext.create('Ext.panel.Panel',{
			title:"Information",
	        border:false,
	        cls:'panel-border-left',
			flex:3,    
			bodyPadding:10,
			data:data,
			tpl:tpl
		});

    }
    return this.infoPanel;
};

VCFVariantInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
	
	this.dataReceived(this.feature);
};

VCFVariantInfoWidget.prototype.dataReceived = function (data){
	this.data = data.feature;
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};
function CellBaseManager(species, args) {
//	console.log(species);

	// these 3 parameters can be modified 
//	this.host = "http://ws.bioinfo.cipf.es/celldb/rest";
	this.host = "http://ws.bioinfo.cipf.es/cellbase/rest";
	this.version = "v1";
	this.species = species;
	
//	if(args != null) {
//		
//	}
//		this.host = 'http://localhost:8080/celldb/rest';

	CELLBASEHOST=this.host;
	
	
	this.category = null;
	this.subcategory = null;

	// commons query params
	this.contentformat = "jsonp";
	this.fileformat = "";
	this.outputcompress = false;
	this.dataType = "script";

	this.query = "";
	this.resource = "";

	this.async = true;
	
	//Queue of queries
	this.maxQuery = 20;
	this.numberQueries = 0;
	this.results = new Array();
	this.resultsCount = new Array();
	this.batching = false;
	
	//Events
	this.completed = new Event();
	this.successed = new Event();
	this.batchSuccessed = new Event();
	this.error = new Event();

	this.setVersion = function(version){
		this.version = version;
	},
	
	this.setSpecies = function(specie){
		this.species = specie;
	},
	
	this.getVersion = function(){
		return this.version;
	},
	
	this.getSpecies = function(){
		return this.species;
	},
	
	
	
	/** Cross-domain requests and dataType: "jsonp" requests do not support synchronous operation. 
	 * Note that synchronous requests may temporarily lock the browser, disabling any actions while the request is active. **/
	this.setAsync = function(async){
		this.async = async;
	},

	this.getUrl = function() {
		if (this.query != null) {
		
			return this.host + "/" + this.version + "/" + this.species + "/"+ this.category + "/" + this.subcategory + "/" + this.query+ "/" + this.resource; // + "?contentformat=" + this.contentformat;
		} else {
			return this.host + "/" + this.version + "/" + this.species + "/"+ this.category + "/" + this.subcategory + "/"+ this.resource; // + "?contentformat=" +;
		}

	},

	this.get = function(category, subcategory, query, resource, callbackFunction) {
		if(query instanceof Array){
				this.batching = true;
				this.results= new Array();
				this.getMultiple(category, subcategory, query, resource);
		}
		else{
				query = new String(query);
				query = query.replace(/\s/g, "");
				var querySplitted = query.split(",");
				if (this.maxQuery <querySplitted.length){
					this.batching = true;
					this.getMultiple(category, subcategory, querySplitted, resource, callbackFunction);
				}
				else{
					this.batching = false;
					this.getSingle(category, subcategory, query, resource, callbackFunction);
				}
		}
	},
//	this.getAllSpecies = function() {
//		
//		//Este código todavía no funciona xq el this._callServer(url) cellBase no tiene una respuesta preparada para this._callServer(url)
//		//es decir, no devuelve jsonp, cuando este todo implementado ya merecerá la pena hacerlo bien
//		var url = this.host + "/" + this.version + "/species";
//		this._callServer(url);
//	},
	this._joinToResults = function(response){
		this.resultsCount.push(true);
		this.results[response.id] = response.data;
		if (this.numberQueries == this.resultsCount.length){
			var result = new Array();
			
			for (var i = 0; i< this.results.length; i++){
				for (var j = 0; j< this.results[i].length; j++){
					result.push(this.results[i][j]);
				}
			}
			this.successed.notify(result);
		}
	},
	
	this.getSingle = function(category, subcategory, query, resource, batchID, callbackFunction) {
		this.category = category;
		this.subcategory = subcategory;
		this.query = query;
		this.resource = resource;
		var url = this.getUrl();
		this._callServer(url, batchID, callbackFunction);
	},
	
	this.getMultiple = function(category, subcategory, queryArray, resource, callbackFunction) {
		var pieces = new Array();
		//Primero dividimos el queryArray en trocitos tratables
		if (queryArray.length > this.maxQuery){
			for (var i = 0; i < queryArray.length; i=i+this.maxQuery){
				pieces.push(queryArray.slice(i, i+(this.maxQuery)));
			}
		}
		
		this.numberQueries = pieces.length;
		var _this = this;
		
		this.batchSuccessed.addEventListener(function (evt, response){
			_this._joinToResults(response);
		});	
		
		for (var i = 0; i < pieces.length; i++){
		//	this.get(category, subcategory, pieces[i].toString(), resource);
			this.results.push(new Array());
			this.getSingle(category, subcategory, pieces[i].toString(), resource, i);
		}
	},


	this._callServer = function(url, batchID, callbackFunction) {
//		console.log(url+"?contentformat="+this.contentformat+"&outputcompress="+this.outputcompress+"&callbackParam=reponse");
		var _this = this;
		$.ajax( {
			url : url,
			type : "GET",
			async : this.async,
			data : {
				of : this.contentformat,
				outputcompress : this.outputcompress,
				callbackParam :  "response"
			},
			dataType : this.dataType,
			jsonp : "callback",
			success : function() {
				
				if( typeof( response ) != 'undefined'  ){
					if (callbackFunction!=null){
						callbackFunction(response);
					}
					
					if (_this.batching){
						_this.batchSuccessed.notify({data:response, id:batchID});
					}else{
						_this.successed.notify(response);
					}
				}
				else{
					_this.error.notify();
				}
				
			},
			complete : function() {
				_this.completed.notify();
				
			},
			error : function() {
				_this.error.notify();
				
			}
		});
	};
}

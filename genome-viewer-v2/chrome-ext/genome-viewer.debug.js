function InfoWidget(targetId, species, args){
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
	
	this.notFoundPanel = Ext.create('Ext.panel.Panel',{
		id:this.id+"notFoundPanel",
		cls:'panel-border-left',
		border:false,
		flex:3,
		bodyPadding:'40',
		html:'No results found'
	});
	
};

InfoWidget.prototype.draw = function (args){
	console.log(args);
//	this.featureId = feature.id;
	this.query = args.query;
	this.feature = args.feature;
//	if(feature.getName()==null){
//		console.log("getName not defined");
////		var feature = new Object();
////		feature.getName = function(){return feature;};
//	}	
	
//	console.log(feature.getName());
//	this.feature.getName = function(){return "a";};
	
	this.panel=Ext.getCmp(this.title +" "+ this.query);
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
		    title: this.title +" "+ this.query,
		    id : this.title +" "+ this.query,
//		    resizable: false,
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
			groupHeaderTpl: '{[values.name]} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})',
			startCollapsed: true
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
	        viewConfig: {
//	            stripeRows: true,
	            enableTextSelection: true
	        },
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
			' &nbsp; <a target="_blank" href="http://www.ensembl.org/'+this.ensemblSpecie+'/Location/View?g={stableId}">Ensembl</a>',
			' &nbsp; <a target="_blank" href="http://wikipathways.org//index.php?query={externalName}&species='+this.wikipathwaysSpecie+'&title=Special%3ASearchPathways&doSearch=1">Wikipathways</a>',
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
		    '<p><span class="panel-border-bottom"><span class="ssel s130">{externalName}</span> &nbsp; <span class="emph s120"> {stableId} </span></span>',
		    ' &nbsp; <a target="_blank" href="http://www.ensembl.org/'+this.ensemblSpecie+'/Transcript/Transcript?t={stableId}">Ensembl</a>',
		    ' &nbsp; <a target="_blank" href="http://wikipathways.org//index.php?query={externalName}&species='+this.wikipathwaysSpecie+'&title=Special%3ASearchPathways&doSearch=1">Wikipathways</a>',
		    '</p><br>',
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
		    '<p><span class="panel-border-bottom"><span class="ssel s130">{name}</span></span>',
		    ' &nbsp; <a target="_blank" href="http://www.ensembl.org/'+this.ensemblSpecie+'/Variation/Summary?v={name}">Ensembl</a>',
		    '</p><br>',
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

InfoWidget.prototype.getProteinTemplate = function (){
	return new Ext.XTemplate(
			 '<p><span class="panel-border-bottom"><span class="ssel s130">{name}</span> &nbsp; <span class="emph s120"> {primaryAccession} </span></span></p>',
			 '<br>',
			 '<p><span class="w100 dis s90">Full name: </span> <span class="">{fullName}</span></p>',
			 '<p><span class="w100 dis s90">Gene name: </span> <span class="">{geneName}</span></p>',
			 '<p><span class="w100 dis s90">Organism: </span> <span class="">{organism}</span></p>'
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
};

InfoWidget.prototype.getPWMTemplate = function (){
	return new Ext.XTemplate(
			 '<p><span class="panel-border-bottom"><span class="ssel s130">{accession}</span> &nbsp; <span class="emph s120"> {tfName} </span></span></p>',
			 '<br>',
			 '<p><span class="w100 dis s90">Type: </span> <span class="">{source}</span></p>',
			 '<p><span class="w100 dis s90">Source: </span> <span class="">{type}</span></p>',
			 '<p><span class="w100 dis s90">Description: </span> <span class="">{description}</span></p>',
			 '<p><span class="w100 dis s90">Length: </span> <span class="">{length}</span></p>',
			 '<p><span class="w100 dis s90">Frequencies: </span> <span class="">{[this.parseFrequencies(values.frequencies)]}</span></p>',
			 {
				 parseFrequencies: function(values){
					 return '<p>'+values.replace(/,/gi, '<br>')+"</p>";
				 }
			 }
		);
};

InfoWidget.prototype.getProteinXrefTemplate = function (){
	return new Ext.XTemplate(
			'<p><span class="w75 emph s100">{[values.source.toUpperCase()]}</span> &nbsp; <span class="emph w125 s100"> {[this.generateLink(values)]} <span class="info">&raquo;</span> </span></p>',
			{
				generateLink: function(values){
					if(values.source!=null){
						switch(values.source.toUpperCase()){
						case "GO": 	return 		'<a TARGET="_blank" href="http://amigo.geneontology.org/cgi-bin/amigo/term_details?term='+values.name+'">'+values.name+'</a>'; break;
						case "REACTOME": return '<a TARGET="_blank" href="http://www.reactome.org/cgi-bin/eventbrowser_st_id?ST_ID='+values.name+'">'+values.name+'</a>'; break;
						case "KEGG": return 	'<a TARGET="_blank" href="http://www.genome.jp/dbget-bin/www_bget?'+values.name+'">'+values.name+'</a>'; break;
						case "INTACT": return 	'<a TARGET="_blank" href="http://www.ebi.ac.uk/intact/pages/interactions/interactions.xhtml?query='+values.name+'">'+values.name+'</a>'; break;
						case "MINT": return 	'<a TARGET="_blank" href="http://mint.bio.uniroma2.it/mint/search/search.do?queryType=protein&interactorAc='+values.name+'">'+values.name+'</a>'; break;
						case "DIP": return 		'<a TARGET="_blank" href="http://dip.doe-mbi.ucla.edu/dip/Browse.cgi?ID='+values.name+'">'+values.name+'</a>'; break;
						case "STRING": return 	'<a TARGET="_blank" href="http://string-db.org/newstring_cgi/show_network_section.pl?identifier=P51587">'+values.name+'</a>'; break;
						case "MIM": return 		'<a TARGET="_blank" href="http://www.omim.org/entry/'+values.name+'">'+values.name+'</a>'; break;
						case "PHARMGKB": return '<a TARGET="_blank" href="http://www.pharmgkb.org/do/serve?objId='+values.name+'&objCls=Gene">'+values.name+'</a>'; break;
						case "ORPHANET": return '<a TARGET="_blank" href="http://www.orpha.net/consor/cgi-bin/OC_Exp.php?lng=EN&Expert='+values.name+'">'+values.name+'</a>'; break;
						}
					}
					else{
						return "";
					}
				}
			}
		);
};

InfoWidget.prototype.getSnpTranscriptTemplate = function (){
	return new Ext.XTemplate(
		    '<p><span class="panel-border-bottom"><span class="ssel s130">{[this.getStableId(values)]}</span> &nbsp; <span class="emph s120"> {stableId} </span></span>',
		    ' &nbsp; <a target="_blank" href="http://www.ensembl.org/'+this.ensemblSpecie+'/Transcript/Transcript?t={[this.getStableId(values)]}">Ensembl</a>',
		    '</p><br>',
		    '<p><span class="w140 dis s90">CDS &nbsp; (start : end): </span> {cdsStart} : {cdsEnd} <span style="margin-left:50px" class="w100 dis s90">cDNA (start : end): </span> {cdnaStart} : {cdnaEnd}</p>',
		    '<p><span class="w140 dis s90">Translation (start : end): </span> {translationStart} : {translationEnd}</p>',
		    '<p><span class="w140 dis s90">Peptide allele: </span> {peptideAlleleString}</p>',
		    '<p><span class="w140 dis s90">Alt. peptide allele: </span> {alternativePeptideAlleleString}</p>',
			'<p><span class="w140 dis s90">Codon: </span> {codon}</p>',
			'<p><span class="w140 dis s90">Reference codon: </span> {referenceCodon}</p>',
			'<p><span class="w140 dis s90">Polyphen prediction: </span> {polyphenPrediction}',
			'<span style="margin-left:50px" class="w140 dis s90">Polyphen score: </span> {polyphenScore}</p>',
			'<p><span class="w140 dis s90">Sift prediction: </span> {siftPrediction}',
			'<span style="margin-left:50px" class="w140 dis s90">Sift score: </span> {siftScore}</p>',
		    {
		    	getStableId: function(values){
		    		if(values.transcript!=""){
		    			return values.transcript.stableId;
		    		}
		    		return "Intergenic SNP";
		    	}
		    }
		);
};
InfoWidget.prototype.getConsequenceTypeTemplate = function (){
	return new Ext.XTemplate(
		    '<p><span class="panel-border-bottom"><span class="ssel s130">{transcript.stableId}</span> &nbsp; <span class="emph s120"> {consequenceType.description} </span></span><br><br>',
		    '<p><span class="w100 dis s90">SO accesion: </span> {consequenceType.soAccession}</p>',
		    '<p><span class="w100 dis s90">SO term: </span> {consequenceType.soTerm}</p>',
		    '<p><span class="w100 dis s90">Feature So term: </span> {consequenceType.featureSoTerm}</p>',
		    '<p><span class="w100 dis s90">NCBI term: </span> {consequenceType.ncbiTerm}</p>',
		    '<p><span class="w100 dis s90">Rank: </span> {consequenceType.rank}</p><br>'
		);
};


InfoWidget.prototype.getPhenotypeTemplate = function (){
	return new Ext.XTemplate(
		    '<p><span class="panel-border-bottom"><span class="ssel s130">{phenotypeDescription}</span> &nbsp; <span class="emph s120"> {source} </span></span><br><br>',
			'<p><span class="w150 dis s90">PValue: </span>{PValue}</p>',
			'<p><span class="w150 dis s90">Assoc. gene name: </span>{associatedGeneName}</p>',
			'<p><span class="w150 dis s90">Assoc. variant risk allele: </span>{associatedVariantRiskAllele}</p>',
			'<p><span class="w150 dis s90">Phenotype description: </span>{phenotypeDescription}</p>',
			'<p><span class="w150 dis s90">Phenotype name: </span>{phenotypeName}</p>',
			'<p><span class="w150 dis s90">Risk allele freq in controls: </span>{riskAlleleFrequencyInControls}</p>',
			'<p><span class="w150 dis s90">Source: </span>{source}</p>',
			'<p><span class="w150 dis s90">Study name: </span>{studyName}</p>',
			'<p><span class="w150 dis s90">Study type: </span>{studyType}</p>',
			'<p><span class="w150 dis s90">Study URL: </span>{studyUrl}</p>',
			'<p><span class="w150 dis s90">Study description: </span>{studyDescription}</p>'
		);
};

InfoWidget.prototype.getPopulationTemplate = function (){
	return new Ext.XTemplate(
		    '<p><span class="panel-border-bottom"><span class="ssel s130">{population}</span> &nbsp; <span class="emph s120"> {source} </span></span><br><br>',
		    '<p><span class="w140 dis s90">Ref allele:  </span>{refAllele} ({refAlleleFrequency})</p>',
		    '<p><span class="w140 dis s90">Other allele:  </span>{otherAllele} ({otherAlleleFrequency})</p>',
		    '<p><span class="w140 dis s90">Ref allele homozygote:  </span>{refAlleleHomozygote} ({refAlleleHomozygoteFrequency})</p>',
		    '<p><span class="w140 dis s90">Allele heterozygote:  </span>{alleleHeterozygote} ({alleleHeterozygoteFrequency})</p>',
			 '<p><span class="w140 dis s90">Other allele homozygote:  </span>{otherAlleleHomozygote} ({otherAlleleHeterozygoteFrequency})</p>',
//			 'TODO cuidado <p><span class="w140 dis s90">other allele heterozygote Frequency:  </span>{otherAlleleHeterozygoteFrequency}</p>',
			 '<p><span class="w140 dis s90">Source:  </span>{source}</p>',
			 '<p><span class="w140 dis s90">Population:  </span>{population}</p>'
		);
};

//not used
InfoWidget.prototype.getVariantEffectTemplate = function (){
		
	return new Ext.XTemplate(
		    '<p><span class="panel-border-bottom"><span class="ssel s130">{consequenceTypeObo}</span> &nbsp; <span class="emph s120"> {featureBiotype} </span></span><br><br>'
		);
};
GeneInfoWidget.prototype.draw = InfoWidget.prototype.draw;
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
//	            { text: "Regulatory", children: [
//	                { text: "Jaspar"},
//	                { text: "miRNA"}
//	            ] },
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
			case "Transcripts": this.panel.add(this.getTranscriptPanel(this.data.transcripts).show());  break;
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
	if(data==null){
		return this.notFoundPanel;
	}
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

GeneInfoWidget.prototype.getTranscriptPanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.transcriptGrid==null){
    	
    	var tpl = this.getTranscriptTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var transcriptPanel = Ext.create('Ext.container.Container',{
				padding:5,
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
	if(data.length<=0){
		return this.notFoundPanel;
	}
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

//GeneInfoWidget.prototype.getGoGrid = function(){
//    var _this = this;
//    if(this.goGrid==null){
//    	var groupField = 'namespace';
//    	var modelName = 'GO';
//	    var fields = ['id','name','description','level','directNumberOfGenes','namespace','parents','propagatedNumberOfGenes','score'];
//		var columns = [ {header : 'Database id',dataIndex: 'id',flex:2},
//						{header : 'Name',dataIndex: 'name',flex:1},
//						{header : 'Description',dataIndex: 'description',flex:2},
//		                {
//		                	xtype: 'actioncolumn',
//		                	header : '+info',
//		                    flex:1,
//		                    items: [{
//		                        iconCls: 'icon-blue-box',  // Use a URL in the icon config
//		                        tooltip: '+info',    
//		                        handler: function(grid, rowIndex, colIndex) {
//		                            var rec = _this.goStore.getAt(rowIndex);
//		                            Ext.Msg.alert(rec.get('name'), rec.get('description'));
//		                        }
//		                    }]
//		                 },
//		                {header : 'Direct genes',dataIndex: 'directNumberOfGenes',flex:2},
//						{header : 'Level',dataIndex: 'level',flex:1},
//						{header : 'Namespace',dataIndex: 'namespace',flex:2},
//						{header : 'Propagated genes',dataIndex: 'propagatedNumberOfGenes',flex:2.5}
//		             ];
//		this.goGrid = this.doGrid(columns,fields,modelName,groupField);
//		
//    }
//    return this.goGrid;
//};

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
    		  url: 'http://ws.bioinfo.cipf.es/cellbase/rest/v1/hsa/feature/id/'+this.query+'/xref?dbname=pdb',
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
      	    				html:'<center><canvas class="ChemDoodleWebComponent" id="pdb_canvas_'+pdb_name+'" width="600" height="600" style="width: 600px; height: 600px; ">This browser does not support HTML5/Canvas.</canvas></center>',
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
	var cellBaseManager = new CellBaseManager(this.species);
	cellBaseManager.success.addEventListener(function(sender,data){
		console.log(data)
		_this.dataReceived(JSON.parse(data.result));//TODO
	});
	cellBaseManager.get("feature","gene", this.query, "fullinfo");
};
GeneInfoWidget.prototype.dataReceived = function (data){
//	console.log(data);
	this.data=data[0][0];
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
SnpInfoWidget.prototype.getSnpTranscriptTemplate = InfoWidget.prototype.getSnpTranscriptTemplate;
SnpInfoWidget.prototype.getConsequenceTypeTemplate = InfoWidget.prototype.getConsequenceTypeTemplate;
SnpInfoWidget.prototype.getPhenotypeTemplate = InfoWidget.prototype.getPhenotypeTemplate;
SnpInfoWidget.prototype.getPopulationTemplate = InfoWidget.prototype.getPopulationTemplate;

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
	                { text: "Transcripts"}
	            ] },
	            { text: "Consequence type"},
	            { text: "Annotated phenotype"},
	            { text: "Population frequency"}
	           
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
			case "Transcripts": this.panel.add(this.getTranscriptPanel(this.data.snptotranscript).show()); break;
			case "Consequence type": this.panel.add(this.getConsequenceTypePanel(this.data.snptotranscript).show()); break;
			case "Annotated phenotype": this.panel.add(this.getPhenotypePanel(this.data.phenotype).show()); break;
			case "Population frequency": this.panel.add(this.getPopulationPanel(this.data.population).show()); break;
		}
	}
};

SnpInfoWidget.prototype.getInfoPanel = function(data){
	if(data==null){
		return this.notFoundPanel;
	}
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


SnpInfoWidget.prototype.getTranscriptPanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.transcriptGrid==null){
    	var tpl = this.getSnpTranscriptTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var transcriptPanel = Ext.create('Ext.container.Container',{
				padding:5,
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

SnpInfoWidget.prototype.getConsequenceTypePanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.consequencePanel==null){
    	var tpl = this.getConsequenceTypeTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var consPanel = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(consPanel);
    	}
		this.consequencePanel = Ext.create('Ext.panel.Panel',{
			title:"Consequence type ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.consequencePanel;
};


SnpInfoWidget.prototype.getPhenotypePanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.phenotypePanel==null){
    	var tpl = this.getPhenotypeTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var pan = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(pan);
    	}
		this.phenotypePanel = Ext.create('Ext.panel.Panel',{
			title:"Phenotype ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.phenotypePanel;
};



SnpInfoWidget.prototype.getPopulationPanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.populationPanel==null){
    	var tpl = this.getPopulationTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var pan = Ext.create('Ext.container.Container',{
				padding:5,
				data:data[i],
				tpl:tpl
			});
			panels.push(pan);
    	}
		this.populationPanel = Ext.create('Ext.panel.Panel',{
			title:"Population ("+i+")",
			border:false,
			cls:'panel-border-left',
			flex:3,    
			bodyPadding:5,
			autoScroll:true,
			items:panels
		});
    }
    return this.populationPanel;
};


SnpInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
//	category, subcategory, query, resource, callbackFunction
	var cellBaseManager = new CellBaseManager(this.species);
	cellBaseManager.success.addEventListener(function (sender,data){
		_this.dataReceived(JSON.parse(data.result));//TODO
	});
	cellBaseManager.get("feature","snp", this.query, "fullinfo");
};
SnpInfoWidget.prototype.dataReceived = function (data){
	var mappedSnps = data[0];
	for ( var i = 0; i < mappedSnps.length; i++) {
		if (mappedSnps[i].chromosome == this.feature.chromosome && mappedSnps[i].start == this.feature.start && mappedSnps[i].end == this.feature.end ){
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
	if(data==null){
		return this.notFoundPanel;
	}
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
	if(data==null){
		return this.notFoundPanel;
	}
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
	if(data.length<=0){
		return this.notFoundPanel;
	}
    if(this.exonsGrid==null){

    	var tpl = this.getExonTemplate();
    	
    	var panels = [];
    	for ( var i = 0; i < data.length; i++) {	
			var exonPanel = Ext.create('Ext.container.Container',{
				padding:5,
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
	if(data.length<=0){
		return this.notFoundPanel;
	}
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
	if(data.length<=0){
		return this.notFoundPanel;
	}
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
    		  url: 'http://ws.bioinfo.cipf.es/cellbase/rest/v1/hsa/feature/id/'+this.feature.feature.stableId+'/xref?dbname=pdb',
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
	
	var cellBaseManager = new CellBaseManager(this.species);
	cellBaseManager.success.addEventListener(function(sender,data){
		console.log(data)
		_this.dataReceived(JSON.parse(data.result));//TODO
	});
	cellBaseManager.get("feature","transcript", this.query, "fullinfo");
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
VCFVariantInfoWidget.prototype.getVariantEffectTemplate = InfoWidget.prototype.getVariantEffectTemplate;

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
	                { text: "Information"},
	                { text: "Variant effect"}
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
			case "Information":  this.panel.add(this.getInfoPanel(this.data.feature).show()); break;
			case "Variant effect":this.panel.add(this.getEffectPanel(this.data.consequenceType).show()); break;
			case "Population": break;
		}
	}
};

VCFVariantInfoWidget.prototype.getInfoPanel = function(data){
	if(data==null){
		return this.notFoundPanel;
	}
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

VCFVariantInfoWidget.prototype.getEffectPanel = function(data){
	if(data.length<=0){
		return this.notFoundPanel;
	}
	for ( var i = 0; i < data.length; i++) {
		data[i].consequence = data[i].consequenceType+" - "+data[i].consequenceTypeObo;
		if(data[i].featureName == ""){data[i].featureName="-";}
		if(data[i].geneId == ""){data[i].geneId="-";}
		if(data[i].transcriptId == ""){data[i].transcriptId="-";}
		if(data[i].featureBiotype == ""){data[i].featureBiotype="-";}
		if(data[i].aaPosition == ""){data[i].aaPosition="-";}
		if(data[i].aminoacidChange == ""){data[i].aminoacidChange="-";}

	}
	
    if(this.effectGrid==null){
    	var groupField = 'consequence';
    	var modelName = "effectGridModel";
    	var fields = ['featureName','geneId','transcriptId','featureBiotype','aaPosition','aminoacidChange','consequence'];
    	var columns = [
    	               {header : 'Feature',dataIndex: 'featureName',flex:1},
    	               {header : 'Gene Id',dataIndex: 'geneId',flex:1.5},
    	               {header : 'Transcript Id',dataIndex: 'transcriptId',flex:1.5},
    	               {header : 'Feat.Biotype',dataIndex: 'featureBiotype',flex:1},
    	               {header : 'aa Position',dataIndex: 'aaPosition',flex:1},
    	               {header : 'aa Change',dataIndex: 'aminoacidChange',flex:1}
    	               ];
    	this.effectGrid = this.doGrid(columns,fields,modelName,groupField);
    	this.effectGrid.store.loadData(data);
    }
    return this.effectGrid;
	
//    if(this.effectPanel==null){
//    	var tpl = this.getVariantEffectTemplate();
//    	//sort by consequenceTypeObo
//    	data.sort(function(a,b){
//    		if(a.consequenceTypeObo == b.consequenceTypeObo){return 0;}
//    		return (a.consequenceTypeObo < b.consequenceTypeObo) ? -1 : 1;
//    	});
//    	
//    	
//    	var panels = [];
//    	for ( var i = 0; i < data.length; i++) {
//			var transcriptPanel = Ext.create('Ext.container.Container',{
//				padding:5,
//				data:data[i],
//				tpl:tpl
//			});
//			panels.push(transcriptPanel);
//    	}
//		this.effectPanel = Ext.create('Ext.panel.Panel',{
//			title:"Effects ("+i+")",
//			border:false,
//			cls:'panel-border-left',
//			flex:3,    
//			bodyPadding:5,
//			autoScroll:true,
//			items:panels
//		});
//    }
//    return this.effectPanel;
};


VCFVariantInfoWidget.prototype.getData = function (){
	var _this = this;
	this.panel.disable();
	this.panel.setLoading("Getting information...");
	
	
	
	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
	cellBaseDataAdapter.successed.addEventListener(function (evt){
		console.log(cellBaseDataAdapter.toJSON());
		_this.dataReceived(cellBaseDataAdapter.toJSON());//TODO
	});
	console.log(this.feature.feature);
	var query = this.feature.feature.chromosome+":"+this.feature.feature.start+":"+this.feature.feature.ref+":"+this.feature.feature.alt;
	cellBaseDataAdapter.fill("genomic","variant", query, "consequence_type");
	
//	this.dataReceived(this.feature);
};

VCFVariantInfoWidget.prototype.dataReceived = function (data){
	this.data = new Object();
	this.data["feature"] = this.feature.feature;
	this.data["consequenceType"] = data;
	this.optionClick({"text":"Information","leaf":"true"});
	this.panel.enable();
	this.panel.setLoading(false);
};
function CellBaseManager(species, args) {
//	console.log(species);
	
	
	//This line never changes
	this.host = "http://ws.bioinfo.cipf.es/cellbase/rest";
	this.host = "http://ws-beta.bioinfo.cipf.es/cellbase/rest";
	if(window.location.host.indexOf("fsalavert")!=-1 ||
	   window.location.host.indexOf("rsanchez")!=-1 ||
	   window.location.host.indexOf("imedina")!=-1 ||
	   window.location.href.indexOf("http://bioinfo.cipf.es/apps-beta")!=-1
	){
//		this.host = "http://ralonso:8080/naranjoma-ws/rest";
		this.host = "http://ws-beta.bioinfo.cipf.es/cellbase/rest";
//		this.host = "http://fsalavert:8080/cellbase/rest";
//		this.host = "http://rsanchez:8080/cellbase/rest";
//		this.host = "http://imedina:8080/cellbase/rest";
	}
	
	var url = $.url();
	var prod = url.param('p');
	if(prod != null) {
		this.host = "http://ws.bioinfo.cipf.es/cellbase/rest";
	}
	
	if (args != null){
		if(args.host != null){
			this.host = args.host;
		}
	}
	
	this.version = "latest";
	this.species = species;
	
//		this.host = 'http://localhost:8080/celldb/rest';
	CELLBASEHOST=this.host;
	
	this.category = null;
	this.subcategory = null;

	// commons query params
	this.contentformat = "json";
	this.fileformat = "";
	this.outputcompress = false;
	this.dataType = "script";

	this.query = "";
	this.originalQuery = "";
	this.resource = "";

	this.params = {};
	
	this.async = true;
	
	//Queue of queries
	this.maxQuery = 30;
	this.numberQueries = 0;
	this.results = new Array();
	this.resultsCount = new Array();
	this.batching = false;
	
	//Events
	this.completed = new Event();
	this.success = new Event();
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
	};

	this.getUrl = function() {
		if (this.query != null) {
			
			return this.host + "/" + this.version + "/" + this.species + "/"+ this.category + "/" + this.subcategory + "/" + this.query+ "/" + this.resource; // + "?contentformat=" + this.contentformat;
		} else {
			return this.host + "/" + this.version + "/" + this.species + "/"+ this.category + "/" + this.subcategory + "/"+ this.resource; // + "?contentformat=" +;
		}

	};

	this.get = function(category, subcategory, query, resource, params, callbackFunction) {
		if(params!=null){
			this.params = params;
		}
		if(query instanceof Array){
				this.originalQuery = query;
				this.batching = true;
				this.results= new Array();
				this.getMultiple(category, subcategory, query, resource);
		}
		else{
				query = new String(query);
				query = query.replace(/\s/g, "");
				var querySplitted = query.split(",");
				this.originalQuery = querySplitted;
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
			var result = [];
			
			for (var i = 0; i< this.results.length; i++){
				for (var j = 0; j< this.results[i].length; j++){
					result.push(this.results[i][j]);
				}
			}
			this.success.notify({
				"result": result, 
				"category":  this.category, 
				"subcategory": this.subcategory, 
				"query": this.originalQuery, 
				"resource":this.resource, 
				"params":this.params, 
				"error": ''
			});
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
		}else{
			pieces.push(queryArray);
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
		var _this = this;
		
		this.params["of"] = this.contentformat;
//		this.params["outputcompress"] = this.outputcompress;//esto ya lo hace el servidor y el navegador por defecto

//			jQuery.support.cors = true;
			url = url + this.getQuery(this.params,url);
			$.ajax({
				type : "GET",
				url : url,
				async : this.async,
				success : function(data, textStatus, jqXHR) {
//					try{
						if(data==""){console.log("data is empty");data="[]";}
						var jsonResponse = JSON.parse(data);
//					console.log(jsonResponse);
						if (_this.batching){
							_this.batchSuccessed.notify({data:jsonResponse, id:batchID});
						}else{
							//TODO no siempre el resource coincide con el featureType, ejemplo: mirna es el featureType del resource mirna_targets
							_this.success.notify({
								"result": jsonResponse, 
								"category":  _this.category, 
								"subcategory": _this.subcategory, 
								"query": _this.originalQuery, 
								"resource":_this.resource, 
								"params":_this.params, 
								"error": ''
							});
						}
//					}
//					catch(e){
//						console.log("CellBaseManager: data returned was not json: "+url+" :");
//						console.log(data+" END");
//					}
					
				},
				complete : function() {
					_this.completed.notify();
					
				},
				error : function(jqXHR, textStatus, errorThrown) {
					console.log("CellBaseManager: Ajax call returned : "+errorThrown+'\t'+textStatus+'\t'+jqXHR.statusText+" END");
					_this.error.notify();
					
				}
			});
			
		
//		$.ajax({
//			type : "GET",
//			url : url,
//			async : this.async,
////			dataType : this.dataType,
//			data : params,
////			jsonp : "callback",
//			success : function() {
//				if( typeof( response ) != 'undefined'  ){
////					if (callbackFunction!=null){
////						callbackFunction(response);
////					}
//					
//					if (_this.batching){
//						_this.batchSuccessed.notify({data:response, id:batchID});
//					}else{
//						_this.successed.notify(response);
//					}
//				}
//				else{
//					_this.error.notify();
//				}
//			},
//			complete : function() {
//				_this.completed.notify();
//				
//			},
//			error : function() {
//				_this.error.notify();
//				
//			}
//		});
		
		console.log(url);
	};
}

CellBaseManager.prototype.getQuery = function(paramsWS,url){
	var chr = "?";
	if(url.indexOf("?")!=-1){
		chr = "&";
	}
	var query = "";
	for ( var key in paramsWS) {
		if(paramsWS[key]!=null)
			query+=key+"="+paramsWS[key]+"&";
	}
	if(query!="")
		query = chr+query.substring(0, query.length-1);
	return query;
};
	/*Nuevo tipo ventana*/
	Ext.define("Ext.ux.Window",{
		extend:"Ext.window.Window",
		minimizable:true,
		constrain:true,
		collapsible:true,
		initComponent: function () {
			this.callParent();
			if(this.taskbar!=null){//si no existe, las ventanas funcionan como hasta ahora
				this.zIndexManager = this.taskbar.winMgr;
				this.iconCls='icon-grid';
				this.button=Ext.create('Ext.button.Button', {
					text:this.title,
					window:this,
					iconCls : this.iconCls,
					handler:function(){
						if(this.window.zIndexManager.front==this.window){
							this.window.minimize();
						}else{
							this.window.show();
						}
					}
				});
				this.taskbar.add(this.button);
				
				
				this.contextMenu = new Ext.menu.Menu({
					items: [{
						text: 'Close',
						window:this,
						iconCls:'tools-icons x-tool-close',
						handler:function(){this.window.close();}
					}]
				});
				this.button.getEl().on('contextmenu', function(e){
													e.preventDefault();
													this.contextMenu.showAt(e.getX(),e.getY()-10-(this.contextMenu.items.length)*25);
													},this);
				
				this.button.on('destroy', function(){this.window.close();});
				
				//Taskbar button can be destroying
				this.on('destroy',function(){if(this.button.destroying!=true){this.button.destroy();}});
				
				this.on('minimize',function(){this.hide();});
				this.on('deactivate',function(){
					if(this.zIndexManager && this.zIndexManager.front.ghostPanel){
						this.zIndexManager.unregister(this.zIndexManager.front.ghostPanel);
					}
					this.button.toggle(false);
				});
				this.on('activate',function(){this.button.toggle(true);});
				
			}
		}
	});function ChartWidget(args) {
	var this_ = this;
	this.id = "ChartWidget_" + Math.round(Math.random() * 10000000);

	this.title = null;
	this.width = 750;
	this.height = 300;

	if (args != null) {
		if (args.title != null) {
			this.title = args.title;
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
	}
};

ChartWidget.prototype.getStore = function() {
	return this.store;
};

ChartWidget.prototype.getChart = function(fields) {
	
	Ext.define('ChromosomeChart', {
	    extend: 'Ext.data.Model',
	    fields: fields
	});
	
	this.store = Ext.create('Ext.data.Store', {
		 model: 'ChromosomeChart',
		 autoLoad : false
	});
	
	var dibujo = Ext.create('Ext.chart.Chart', {
		animate : true,
		shadow : true,
		store : this.store,
		width : this.width,
		height : this.height,
		axes : [{
					position : 'left',
					fields : [fields[0]],
					title : fields[0],
					grid:true,
					type : 'Numeric',
	                minimum: 0 //si no se pone, peta
				}, {
					title : fields[1],
					type : 'category',
					position : 'bottom',
					fields : [fields[1]],
//					width : 10,
					label : {
						rotate : {
							degrees : 270
						}
					}
				}],
		series : [{
					type : 'column',
					axis: 'left',
					gutter: 80,
					yField : fields[0],
					xField : fields[1],
	                style: {
	                    fill: '#38B8BF'
	                }
				}]
	});
	return dibujo;
};function TextWindowWidget(args){
	this.windows = new Array();
};

TextWindowWidget.prototype.draw = function(text){
//	this.windows.push( window.open(''+self.location,"Bioinformatics",config="height="+500+",width="+800+" ,font-size=8, resizable=yes, toolbar=1, menubar=1"));
//	this.windows[this.windows.length-1].document.write("<title>"+ "asdasda" +"</title>");
//	this.windows[this.windows.length-1].document.write(text);
//	this.windows[this.windows.length-1].document.close();
	
	
	myRef = window.open('data:text/csv,field1%2Cfield2%0Afoo%2Cbar%0Agoo%2Cgai%0A','mywin',
	'left=20,top=20,width=500,height=200');
	
	myRef.document.write(text);
};

function ClienSideDownloaderWindowWidget(args){
	this.windows = new Array();
};

ClienSideDownloaderWindowWidget.prototype.draw = function(text, content){
//	myRef = window.open('data:text/csv,field1%2Cfield2%0Afoo%2Cbar%0Agoo%2Cgai%0A','mywin', 'left=20,top=20,width=500,height=200');
	
	myRef = window.open('data:text/csv,' + content,'mywin', 'left=20,top=20,width=500,height=200');
//	myRef = window.open('data:image/svg+xml,' + content,'mywin', 'left=20,top=20,width=500,height=200');
	
	myRef.document.write(text);
};function InputListWidget(args) {
	this.id = "InputListWidget" + Math.round(Math.random()*10000000);
		
	this.title = "List";
	this.width = 500;
	this.height = 350;
	this.headerInfo = 'Write a list separated only by lines';
	
	this.args=args;
	
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
        if (args.headerInfo!= null){
        	this.headerInfo = args.headerInfo;       
        }
        if (args.viewer!= null){
        	this.viewer = args.viewer;       
        }
    }
	this.onOk = new Event(this);
};


InputListWidget.prototype.draw = function(text){
	var _this = this;
	
	if (text == null){
		text = new String();
	}
	
	if (this.panel == null){
		this.infobar = Ext.create('Ext.toolbar.Toolbar',{cls:"bio-border-false"});
		this.infoLabel = Ext.create('Ext.toolbar.TextItem', {
				text:this.headerInfo
		});
		this.infobar.add(this.infoLabel);
		this.editor = Ext.create('Ext.form.field.TextArea', {
				id:this.id + "genelist_preview",
	       	 	xtype: 'textarea',
	        	name: 'file',
	        	margin:"-1",
				width : this.width,
				height : this.height,
	        	enableKeyEvents:true,
	        	cls: 'dis',
	        	style:'normal 6px tahoma, arial, verdana, sans-serif',
	        	value: text,
	        	listeners: {
				       scope: this,
				       change: function(){
//				       			var re = /\n/g;
//				       			for( var i = 1; re.exec(this.editor.getValue()); ++i );
//				       			this.infoLabel.setText('<span class="ok">'+i+'</span> <span class="info"> Features detected</span>',false);
				       			this.validate();
				       }
				       
		        }
		});
		var form = Ext.create('Ext.panel.Panel', {
			border : false,
			items : [this.infobar,this.editor]
		});
		
		this.okButton = Ext.create('Ext.button.Button', {
			 text: 'Ok',
			 disabled:true,
			 listeners: {
			       scope: this,
			       click: function(){
			       			var geneNames = Ext.getCmp(this.id + "genelist_preview").getValue().split("\n");
							this.onOk.notify(geneNames);
							_this.panel.close();
			       		}
	        }
		});  
		
		this.panel = Ext.create('Ext.ux.Window', {
			title : this.title,
			taskbar:Ext.getCmp(this.viewer.id+'uxTaskbar'),
			layout: 'fit',
			resizable: false,
			collapsible:true,
			constrain:true,
			closable:true,
			items : [ form ],
			buttons : [ this.okButton, {text : 'Cancel',handler : function() {_this.panel.close();}} ],
			listeners: {
				       scope: this,
				       destroy: function(){
				       		delete this.panel;
				       }
		        }
		});
	}
	this.panel.show();
	
};

InputListWidget.prototype.validate = function (){
	if (this.editor.getValue()!="") {
		this.okButton.enable();
	}else{
		this.okButton.disable();
	}
};
function ListPanel(species, args) {
	this.targetId = null;
	this.id = "ListPanel" + Math.round(Math.random()*100000);
	this.species=species;
	
	this.args=args;
	
	this.title = "List of Genes";
	this.width = 1000;
	this.height = 500;
	this.borderCls='panel-border-bottom';
	
	this.gridFields = [ 'externalName', 'stableId', 'biotype','position', 'strand', 'description', 'chromosome', 'start', 'end'];
		
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
        if (args.gridFields != null){
        	this.gridFields = args.gridFields;
        }
        if (args.borderCls!= null){
        	this.borderCls = args.borderCls;       
        }
        if (args.viewer!= null){
        	this.viewer = args.viewer;       
        }
        if (args.featureType!= null){
        	this.featureType = args.featureType;       
        }
    }
	
	this.onSelected = new Event(this);
	this.onFilterResult = new Event(this);
	
	
};

ListPanel.prototype._getGeneGrid = function() {
	var _this = this;
//	if(this.grid==null){
		var fields = this.gridFields;
		
		var filters = [];
		var columns = new Array();
		
		for(var i=0; i<fields.length; i++){
			filters.push({type:'string', dataIndex:fields[i]});
			columns.push({header:this.gridFields[i], dataIndex:this.gridFields[i], flex:1});
		}
		
		this.store = Ext.create('Ext.data.Store', {
			fields : fields,
			groupField : 'biotype',
			autoload : false
		});

	
		var filters = {
	        ftype: 'filters',
	        local: true, // defaults to false (remote filtering)
	        filters: filters
	    };
		
	    this.infoToolBar = Ext.create('Ext.toolbar.Toolbar');
		this.infoLabelOk = Ext.create('Ext.toolbar.TextItem', {
			text : '&nbsp;'
		});
		this.infoLabelNotFound = Ext.create('Ext.toolbar.TextItem', {
			text : '&nbsp;'
		});
		this.clearFilter = Ext.create('Ext.button.Button', {
			 text: 'Clear filters',
			 listeners: {
			 	scope: this,
			 	click: function(){
			 		if(this.grid.filters!=null){
						this.grid.filters.clearFilters();
			 		}
				}
		    }
		});
		this.found = Ext.create('Ext.button.Button', {
			 text: 'Features found',
			 hidden:true,
			 listeners: {
			 	scope: this,
			 	click: function(){
			 		new InputListWidget({title:"Features found", headerInfo:"This features were found in the database",viewer:this.viewer}).draw(this.queriesFound.join('\n'));
				}
		    }
		});
		this.notFound = Ext.create('Ext.button.Button', {
			 text: 'Features not found',
			 hidden:true,
			 listeners: {
			 	scope: this,
			 	click: function(){
			 		new InputListWidget({title:"Features not found", headerInfo:"This features were not found in the database",viewer:this.viewer}).draw(this.queriesNotFound.join('\n'));
				}
		    }
		});
		this.exportButton = Ext.create('Ext.button.Button', {
			text : 'Export to Text',
			handler : function() {
    	 		new InputListWidget({width:1100, title:"VCS content", headerInfo:"Export results",viewer:_this.args.viewer}).draw(_this._getStoreContent());
     		}
		});
		this.localizeButton = Ext.create('Ext.button.Button', {
			text : 'Localize on karyotype',
			handler : function() { _this._localize();}
		});
		this.infoToolBar.add([ '->',this.exportButton,this.localizeButton,'-',this.found,this.notFound,this.clearFilter]);
	    
		
		this.grid = Ext.create('Ext.grid.Panel', {
			border:0,
			store : this.store,
			features: [filters],
			bbar:this.infoToolBar,
			columns : columns,
			selModel: {
                mode: 'SINGLE'
            }
		});		
	return this.grid;
};

ListPanel.prototype._localize = function() {
	var _this = this;
	
	var panel = Ext.create('Ext.window.Window', {
		id:this.id+"karyotypePanel",
		title:"Karyotype",
		width:1020,
		height:410,
		bodyStyle: 'background:#fff;',
		html:'<div id="' + this.id + "karyotypeDiv" +'" ><div>',
		buttons : [{text : 'Close', handler : function() {panel.close();}} ],
		listeners:{
			afterrender:function(){
				
				var div = $('#'+_this.id+"karyotypeDiv")[0];
				var karyotypeWidget = new KaryotypeWidget(div,{
					width:1000,
					height:340,
					species:_this.viewer.species,
					chromosome:_this.viewer.chromosome,
					position:_this.viewer.position
				});
				karyotypeWidget.onClick.addEventListener(function(sender,data){
					_this.viewer.onLocationChange.notify({position:data.position,chromosome:data.chromosome,sender:"KaryotypePanel"});
				});
				karyotypeWidget.drawKaryotype();

				for ( var i = 0; i < _this.features.length; i++) {
						var feature = _this.features[i];
						karyotypeWidget.addMark(feature);
				}
//				
			}
		}
	}).show();
};

ListPanel.prototype.setTextInfoBar = function(resultsCount, featuresCount, noFoundCount) {
	this.found.setText('<span class="dis">' + resultsCount + ' results found </span> ');
	this.found.show();
	if (noFoundCount > 0){
		this.notFound.setText('<span class="err">'  + noFoundCount +' features not found</span>');
		this.notFound.show();
	}
};

ListPanel.prototype._getStoreContent = function() {
	var text = new String();
		for ( var i = 0; i < this.store.data.items.length; i++) {
			var header = new String();
			if (i == 0){
				for ( var j = 0; j < this.gridFields.length; j++) {
					header = header + this.gridFields[j] + "\t";
				}
				header = header + "\n";
			}
			var row = header;
			for ( var j = 0; j < this.gridFields.length; j++) {
				row = row + this.store.data.items[i].data[ this.gridFields[j]] + "\t";
			}
				
			row = row + "\n";
			text = text + row;
		}
	return text;
};

ListPanel.prototype._render = function() {
	var _this = this;
	if(this.panel==null){
		this.panel = Ext.create('Ext.panel.Panel', {
		    height:240,
		    layout:'fit',
		    cls:this.borderCls,
			title : this.title,
			border:false
		});
	}
	this.panel.add(this._getGeneGrid());
};

ListPanel.prototype.draw = function(cbResponse, useAdapter) {
	this._render();
	
	this.queriesNotFound = [];
	this.queriesFound = [];
	this.features = [];
	

	if(useAdapter != false){
		this.adapter = new FeatureDataAdapter(null,{species:this.species});
		for ( var i = 0; i < cbResponse.result.length; i++) {

			//Check if is a single object
			if(cbResponse.result[i].constructor != Array){
				cbResponse.result[i] = [cbResponse.result[i]];
			}

			for ( var j = 0; j < cbResponse.result[i].length; j++) {
				var feature = cbResponse.result[i][j];
				feature.position = feature.chromosome + ":"+ feature.start + "-" + feature.end;
				feature.featureType = cbResponse.resource;
				this.features.push(feature);
			}


			if (cbResponse.result[i].length == 0){
				this.queriesNotFound.push(cbResponse.query[i]);
			}else{
				this.queriesFound.push(cbResponse.query[i]);
				this.adapter.addFeatures(cbResponse.result[i]);
			}
		}
	}else{// no adapter needed because no track will be created 
		for ( var i = 0; i < cbResponse.result.length; i++) {
			//Check if is a single object
			if(cbResponse.result[i].constructor != Array){
				cbResponse.result[i] = [cbResponse.result[i]];
			}
			for ( var j = 0; j < cbResponse.result[i].length; j++) {
				var feature = cbResponse.result[i][j];
				feature.position = feature.chromosome + ":"+ feature.start + "-" + feature.end;
				feature.featureType = cbResponse.resource;
				this.features.push(feature);
			}

			if (cbResponse.result[i].length == 0){
				this.queriesNotFound.push(cbResponse.query[i]);
			}else{
				this.queriesFound.push(cbResponse.query[i]);
			}
		}
	}

	
	this.store.loadData(this.features);//true = append;  to sencha store

	this.setTextInfoBar(this.queriesFound.length, this.queriesFound.length, this.queriesNotFound.length);
};function ListWidget(species, args) {
	this.targetId = null;
	this.id = "ListWidget" + Math.round(Math.random()*10000000);
	this.species=species;
	
	this.width = 1000;
	this.height = 500;
	this.action = 'localize';
	this.title='';
	
	this.args = args;
	
//	if (args == null){
//		args = {};
//	}
		
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
        if (args.action!= null){
        	this.action = args.action;       
        }
        if (args.viewer!= null){
        	this.viewer = args.viewer;
        }
    }
	

	this.listPanel = new ListPanel(this.species,{title:false,gridFields:args.gridFields,viewer:this.args.viewer});
	this.onSelected=this.listPanel.onSelected;
	this.onFilterResult=this.listPanel.onFilterResult;
	
};

ListWidget.prototype._render = function() {
	var _this = this;
	if(this.panel==null){
		this.localizeButton = Ext.create('Ext.button.Button', {
			minWidth : 80,
			text : 'OK',
			disabled:true,
			handler : function() {
					_this.listPanel.onSelected.notify(_this.listPanel.grid.getSelectionModel().getSelection()[0].data);
					_this.panel.hide();
			}
		});
		this.filterButton = Ext.create('Ext.button.Button', {
			minWidth : 80,
			text : 'OK',
			handler : function() {
					_this.listPanel.onFilterResult.notify(_this.listPanel.store.getRange());
					_this.panel.hide();
			}
		});
		
		this.panel = Ext.create('Ext.ux.Window', {
			title : this.title,
			taskbar:Ext.getCmp(this.viewer.id+'uxTaskbar'),
			resizable: false,
			constrain:true,
			closable:true,
			layout: 'fit',
			minimizable :true,
			width: this.width,
			height:this.height,
			items : [ this.listPanel.grid ],
			buttonAlign:'right',
			buttons:[
//			         {text:'aaa', handler: function(){},margin:"0 50 0 0 "},
			         this.getActionButton(this.action),
					{text:'Close', handler: function(){_this.panel.close();}}
			],
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
	}
};

ListWidget.prototype.draw = function(cbResponse, processData) {
	var _this = this;
	this.listPanel.draw(cbResponse, processData);
	this.listPanel.grid.getSelectionModel().on('selectionchange',function(){
		if(_this.listPanel.grid.getSelectionModel().hasSelection()){
			_this.localizeButton.enable();
		}else{
			_this.localizeButton.disable();
		}
	});
	this._render();
	this.panel.show();
};

ListWidget.prototype.getActionButton = function(action) {
	switch (action){
		case "localize": return this.localizeButton; break;
		case "filter": this.listPanel.localizeButton.disable().hide(); return this.filterButton; break;
	};
};//GenomicListWidget.prototype._render 				=       ListWidget.prototype._render;
GenomicListWidget.prototype.draw 				=       ListWidget.prototype.draw;
GenomicListWidget.prototype.getActionButton 			=       ListWidget.prototype.getActionButton;


function GenomicListWidget(species, args) {
	ListWidget.prototype.constructor.call(this, species, args);
//	this.listPanel = new GenomicListPanel({title:false,gridFields:args.gridFields,viewer:this.viewer});
	this.onSelected = this.listPanel.onSelected;
	this.onFilterResult = this.listPanel.onFilterResult;
	
	this.onTrackAddAction = new Event();
	
	
};



GenomicListWidget.prototype._render = function() {
	var _this = this;
	if(this.panel==null){
		this.localizeButton = Ext.create('Ext.button.Button', {
			minWidth : 80,
			text : 'OK',
			disabled:true,
			handler : function() {
					_this.listPanel.onSelected.notify(_this.listPanel.grid.getSelectionModel().getSelection()[0].data);
					_this.panel.hide();
			}
		});
		this.filterButton = Ext.create('Ext.button.Button', {
			minWidth : 80,
			text : 'OK',
			handler : function() {
					_this.listPanel.onFilterResult.notify(_this.listPanel.store.getRange());
					_this.panel.hide();
			}
		});
		var buttonRigthMargin = 375;
		
		
		this.panel = Ext.create('Ext.ux.Window', {
			title : this.title,
			taskbar:Ext.getCmp(this.viewer.id+'uxTaskbar'),
			resizable: false,
			constrain:true,
			closable:true,
			layout: 'fit',
			minimizable :true,
			width: this.width,
			height:this.height,
			items : [ this.listPanel.grid ],
			buttonAlign:'left',
			buttons:[
			         {
			        	 text:'Add Track', 
			        	 handler: function(){
			        		 var name = "Search "+Math.round(Math.random()*1000);
			        		 _this.onTrackAddAction.notify({"adapter":_this.listPanel.adapter,"fileName":name});
			        	 }
			         },
			         '->',
			         this.getActionButton(this.action),
			         {text:'Close', handler: function(){_this.panel.close();}}
			],
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
	}
};GenomicListPanel.prototype._getGeneGrid 				=       ListPanel.prototype._getGeneGrid;
GenomicListPanel.prototype._localize 				=       ListPanel.prototype._localize;
GenomicListPanel.prototype.setTextInfoBar 			=       ListPanel.prototype.setTextInfoBar;
GenomicListPanel.prototype._getStoreContent 			=       ListPanel.prototype._getStoreContent;
GenomicListPanel.prototype._render  					=       ListPanel.prototype._render;
GenomicListPanel.prototype.draw  					=       ListPanel.prototype.draw;

function GenomicListPanel(args) {
	ListPanel.prototype.constructor.call(this, args);
};


function FilterPanel(args){
	var this_=this;
	this.id = "FilterPanel_" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.title=null;
	this.width=null;
	this.height=null;
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
};
FilterPanel.prototype.draw = function (arr){
	var arr = ["manzanas","pera","meloconton","sandia","melon","naranja","manzanas","pera","meloconton","sandia","melon","naranja","manzanas","pera","meloconton","sandia","melon","naranja"];
	this.render(arr);
	
	if (this.targetId != null){
		this.panel.render(this.targetId);
	}
	
};
FilterPanel.prototype.render = function (arr){

	var items = [];
	for (var i = 0; i < arr.length; i++) {
		items.push({boxLabel:arr[i],checked:true});
	}
	
	if (this.panel == null){
		this.panel = Ext.create('Ext.panel.Panel', {
			title: this.title,
		    width: this.width,
		    height: this.height,
		    layout: 'vbox',
		    defaultType: 'checkboxfield',
		    items: items
		});
	}
};function AttributesWidget(args){
	this.id = "AttributesWidget_" + Math.random();
	this.title = "";
	this.width = 1025;
	this.height = 628;
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	this.attributesPanel = new AttributesPanel({borderCls:args.borderCls, height:325});
};

AttributesWidget.prototype.draw = function (){
	this.render();
};

AttributesWidget.prototype.getDetailPanel = function (){
	return {};
};

AttributesWidget.prototype.getButtons = function (){
	var _this=this;
	return [{text:'Close', handler: function(){_this.panel.close();}}];
};


AttributesWidget.prototype.render = function (){
	var _this = this;
	if (this.panel == null){
		this.panel  = Ext.create('Ext.ux.Window', {
			title : this.title,
			resizable: false,
			constrain:true,
			closable:true,
			collapsible:true,
			layout: { type: 'vbox',align: 'stretch'},
			items: [this.attributesPanel.getPanel(), this.getDetailPanel()],
			width: this.width,
		    height:this.height,
			buttonAlign:'right',
			buttons:this.getButtons(),
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
		this.panel.setLoading();
	}	
	this.panel.show();
};
GenotypeGenomicAttributesWidget.prototype.draw = GenomicAttributesWidget.prototype.draw;
GenotypeGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
GenotypeGenomicAttributesWidget.prototype.drawKaryotype = GenomicAttributesWidget.prototype.drawKaryotype;
GenotypeGenomicAttributesWidget.prototype.makeGrid = GenomicAttributesWidget.prototype.makeGrid;
GenotypeGenomicAttributesWidget.prototype.getKaryotypePanelId = GenomicAttributesWidget.prototype.getKaryotypePanelId;
GenotypeGenomicAttributesWidget.prototype.dataChange = GenomicAttributesWidget.prototype.dataChange;
GenotypeGenomicAttributesWidget.prototype.fill = GenomicAttributesWidget.prototype.fill;
GenotypeGenomicAttributesWidget.prototype.onAdditionalInformationClick = GenomicAttributesWidget.prototype.onAdditionalInformationClick;

function GenotypeGenomicAttributesWidget(species, args){
	if (args == null){
		args = new Object();
	}
	args.title = "Genotype";
	args.tags = ["genotype"];
	args.featureType = 'snp';
	args.listWidgetArgs = {title:'Filter',action:'filter', gridFields:["name", "variantAlleles", "ancestralAllele", "mapWeight",  "position", "sequence"]};
	GenomicAttributesWidget.prototype.constructor.call(this, species, args);
};


function AttributesPanel(args){
	var _this= this;
	this.targetId = null;
	this.id = "AttributesPanel_" + Math.round(Math.random()*10000000);
	
	this.title = null;
	this.width = 1023;
	this.height = 628;
	this.wum = true;
	this.tags = [];
	this.borderCls='panel-border-bottom';
	
	this.columnsCount = null;
	if (args != null){
		if (args.wum!= null){
        	this.wum = args.wum;       
        }
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
        if (args.columnsCount!= null){
        	this.columnsCount = args.columnsCount;       
        }
        if (args.borderCls!= null){
        	this.borderCls = args.borderCls;       
        }
        if (args.tags!= null){
        	this.tags = args.tags;       
        }
    }
        
	/** create widgets **/
	this.browserData = new BrowserDataWidget();
    
	
    /** Events i send **/
    this.onDataChange = new Event(this);
    this.onFileRead = new Event(this);
    
    /** Events i listen **/
    this.browserData.adapter.onReadData.addEventListener(function (sender, data){
    	var tabularDataAdapter = new TabularDataAdapter(new StringDataSource(data.data),{async:false});
    	var fileLines = tabularDataAdapter.getLines();
		_this.makeGrid(tabularDataAdapter);
		_this.uptadeTotalFilteredRowsInfo(fileLines.length);
		_this.uptadeTotalRowsInfo(fileLines.length);
		_this.fileName = data.filename;
		_this.fileNameLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
	});	
};

AttributesPanel.prototype.draw = function (){
	var panel = this.getPanel();
	
	if (this.targetId != null){
		panel.render(this.targetId);
	}
};

AttributesPanel.prototype.uptadeTotalRowsInfo = function (linesCount){
	this.infoLabel.setText('<span class="dis">Total rows: </span><span class="emph">' + linesCount + '</span>',false);
	
};

AttributesPanel.prototype.uptadeTotalFilteredRowsInfo = function (filteredCount){
	this.infoLabel2.setText('<span class="dis">Filtered rows: </span><span class="emph">' + filteredCount + '</span>',false);
};

AttributesPanel.prototype.sessionInitiated = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.enable();
	}
};

AttributesPanel.prototype.sessionFinished = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.disable();
	}
};

AttributesPanel.prototype.getPanel = function (){
	var _this=this;
	if (this.panel == null){
		this.expresionAnalysisUploadFieldFile = Ext.create('Ext.form.field.File', {
			msgTarget : 'side',
//			flex:1,
			width:75,
			emptyText: 'Choose a local file',
	        allowBlank: false,
			buttonText : 'Browse local',
			buttonOnly : true,
			listeners : {
				scope:this,
				change :function() {
						_this.panel.setLoading("Reading file");
						try{
							var dataAdapter = new TabularFileDataAdapter({comment:"#"});
							var file = document.getElementById(this.expresionAnalysisUploadFieldFile.fileInputEl.id).files[0];
							_this.fileName = file.name;
							_this.fileNameLabel.setText('<span class="emph">'+ file.name +'</span> <span class="info">(local)</span>',false);
							dataAdapter.loadFromFile(file);
							
							dataAdapter.onRead.addEventListener(function(sender, id) {
									_this.makeGrid(dataAdapter);
									_this.uptadeTotalFilteredRowsInfo(dataAdapter.lines.length);
									_this.uptadeTotalRowsInfo(dataAdapter.lines.length);
									_this.panel.setLoading(false);
									_this.onFileRead.notify();
							});
						}
						catch(e){
							alert(e);
							_this.panel.setLoading(false);
						}
					
				}
			}
		});
		this.barField = Ext.create('Ext.toolbar.Toolbar');
		this.barInfo = Ext.create('Ext.toolbar.Toolbar',{dock:'bottom'});
		this.barHelp = Ext.create('Ext.toolbar.Toolbar',{dock:'top'});
		
		
		this.clearFilter = Ext.create('Ext.button.Button', {
			 text: 'Clear filters',
			 disabled:true,
			 listeners: {
			       scope: this,
			       click: function(){
			       			if(this.grid.filters!=null){
			       				this.grid.filters.clearFilters();
			       				this.store.clearFilter();
			       			}
			       		}
	        }
		});
			
		
		this.helpLabel = Ext.create('Ext.toolbar.TextItem', {
			text:'<span class="dis">Click on the header down arrow to filter by column</span>'
		});
		this.fileNameLabel = Ext.create('Ext.toolbar.TextItem', {
			text:'<span class="emph">Select a <span class="info">local</span> file or a <span class="info">server</span> file from your account.</span>'
		});
		this.infoLabel = Ext.create('Ext.toolbar.TextItem', {
			text:'&nbsp;'
		});
		this.infoLabel2 = Ext.create('Ext.toolbar.TextItem', {
			text:'&nbsp;'//'<span class="info">No file selected</span>'
		});
		
		this.barField.add(this.expresionAnalysisUploadFieldFile);
		this.barInfo.add('->',this.infoLabel,this.infoLabel2);
		this.barHelp.add(this.fileNameLabel,'->',this.helpLabel);
		
		this.store = Ext.create('Ext.data.Store', {
			fields:["1","2"],
			data:[]
		});
		this.grid = Ext.create('Ext.grid.Panel', {
		    store: this.store,
		    disabled:true,
		    border:0,
		    columns:[{header:"Column 1",dataIndex:"1"},{header:"Column 2",dataIndex:"2"}]
		});
		
		this.panel  = Ext.create('Ext.panel.Panel', {
			title : this.title,
			border:false,
			layout: 'fit',
			cls:this.borderCls,
			items: [this.grid],
			tbar:this.barField,
			width: this.width,
		    height:this.height,
		    maxHeight:this.height,
			buttonAlign:'right',
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
		this.panel.addDocked(this.barInfo);
		this.panel.addDocked(this.barHelp );
		
	}	
	
	
	if(this.wum){
			this.btnBrowse = Ext.create('Ext.button.Button', {
		        text: 'Browse server',
		        disabled:true,
//		        iconCls:'icon-local',
//		        cls:'x-btn-default-small',
		        listeners: {
				       scope: this,
				       click: function (){
				    	   		this.browserData.draw($.cookie('bioinfo_sid'),this.tags);
				       		}
		        }
			});
			
			this.barField.add(this.btnBrowse);
			
			if($.cookie('bioinfo_sid') != null){
				this.sessionInitiated();
			}else{
				this.sessionFinished();
			}
	}
	this.barField.add('-',this.clearFilter);
	
	return this.panel;
};


AttributesPanel.prototype.getData = function (){
	return this.data;
};

AttributesPanel.prototype.makeGrid = function (dataAdapter){
		var _this = this;
		this.data = dataAdapter.getLines();
	
		var fields = [];
		var columns = [];
		var filtros = [];
		
		if (this.columnsCount == null){
			this.columnsCount = this.data[0].length;
		}
//		for(var i=0; i< data[0].length; i++){
		for(var i=0; i< this.columnsCount; i++){
			var type = dataAdapter.getHeuristicTypeByColumnIndex(i);
			fields.push({"name": i.toString(),type:type});
			columns.push({header: "Column "+i.toString(), dataIndex:i.toString(), flex:1,filterable: true,  filter: {type:type}});
			filtros.push({type:type, dataIndex:i.toString()});
		}
		this.store = Ext.create('Ext.data.Store', {
		    fields: fields,
		    data: this.data,
		    listeners:{
		    	scope:this,
		    	datachanged:function(store){
		    		var items = store.getRange();
		    		this.uptadeTotalFilteredRowsInfo(store.getRange().length);
		    		this.onDataChange.notify(store.getRange());
		    	}
		    }
		});
		
		var filters = {
        ftype: 'filters',
        local: true,
        filters: filtros
    	};
		
    	if(this.grid!=null){
			this.panel.remove(this.grid);
		}
    	
		this.grid = Ext.create('Ext.grid.Panel', {
		    store: this.store,
		    columns:columns,
//		    height:164,
//		    maxHeight:164,
//		    height:this.height,
//		    maxHeight:this.height,
		    border:0,
		    features: [filters]
		});
		this.panel.insert(0,this.grid);
		this.clearFilter.enable();
};function GenomicAttributesWidget(species, args){
	var _this=this;
	this.id = "GenomicAttributesWidget" + Math.round(Math.random()*10000);
	
	this.species=species;
	this.args=args;
	
	this.title = "None";
	this.featureType = "gene";
	
	this.columnsCount = null; /** El numero de columns que el attributes widget leera del fichero, si null lo leera entero **/
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.columnsCount!= null){
        	this.columnsCount = args.columnsCount;       
        }
        if (args.featureType!= null){
        	this.featureType = args.featureType;       
        }
        if (args.viewer!= null){
        	this.viewer = args.viewer;      
        	args.listWidgetArgs.viewer = args.viewer;
        }
    }
	
	this.listWidget = new ListWidget(this.species,args.listWidgetArgs);
	
	this.attributesPanel = new AttributesPanel({height: 240, columnsCount: this.columnsCount,wum:args.wum,tags:args.tags});
	
	/** Event **/
	this.onMarkerClicked = new Event(this);
	this.onTrackAddAction = new Event(this);
	
	
	/**Atach events i listen**/
	this.attributesPanel.onDataChange.addEventListener(function(sender,data){
		_this.dataChange(data);
	});
	
	
};

GenomicAttributesWidget.prototype.draw = function (){
	var _this=this;
	if (this.panel == null){
		
		this.karyotypePanel  = Ext.create('Ext.panel.Panel', {
			id:this.id+"karyotypePanel",
			height:350,
			maxHeight:350,
			border:0,
//			bodyPadding: 15,
			padding:'0 0 0 0',
			html:'<div id="' + this.id + "karyotypeDiv" +'" ><div>'
		});
		
		this.karyotypePanel.on("afterrender",function(){
			var div = $('#'+_this.id+"karyotypeDiv")[0];
			console.log(div);
			_this.karyotypeWidget = new KaryotypeWidget(div,{
				width:1000,
				height:340,
				species:_this.viewer.species,
				chromosome:_this.viewer.chromosome,
				position:_this.viewer.position
			});
			_this.karyotypeWidget.onClick.addEventListener(function(sender,data){
				_this.viewer.onLocationChange.notify({position:data.position,chromosome:data.chromosome,sender:"KaryotypePanel"});
			});
			_this.karyotypeWidget.drawKaryotype();
		});
		
		this.filtersButton = Ext.create('Ext.button.Button', {
			 text: 'Additional Filters',
			 disabled:true,
			 listeners: {
			       scope: this,
			       click: function(){this.onAdditionalInformationClick();}
	        }
		});
		
		this.addTrackButton = Ext.create('Ext.button.Button', {
			text:'Add Track',
			disabled:true,
			handler: function(){ 
				_this.onTrackAddAction.notify({"adapter":_this.adapter,"fileName":_this.attributesPanel.fileName});
				}
		});
		
		this.panel  = Ext.create('Ext.ux.Window', {
			title : this.title,
			resizable: false,
			minimizable :true,
			constrain:true,
			closable:true,
			bodyStyle: 'background:#fff;',
			taskbar:Ext.getCmp(this.args.viewer.id+'uxTaskbar'),
			items: [this.attributesPanel.getPanel(),this.karyotypePanel],
			width: 1035,
		    height: 653,
		    buttonAlign:'left',
			buttons:[this.addTrackButton,'->',
			         {text:'Close', handler: function(){_this.panel.close();}}],
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
		this.attributesPanel.barField.add(this.filtersButton);
		this.panel.setLoading();
	}	
	this.panel.show();
		
};

//GenomicAttributesWidget.prototype.getMainPanel = function (){
//	var _this=this;
//	if (this.panel == null){
//		
//		this.karyotypePanel  = Ext.create('Ext.panel.Panel', {
//			height:350,
//			maxHeight:350,
//			border:0,
//			bodyPadding: 15,
//			padding:'0 0 0 0',
//			html:'<div id="' + this.id + "karyotypeDiv" +'" ><div>'
//		});
//
//		this.filtersButton = Ext.create('Ext.button.Button', {
//			 text: 'Additional Filters',
//			 disabled:true,
//			 listeners: {
//			       scope: this,
//			       click: function(){this.onAdditionalInformationClick();}
//	        }
//		});
//		
//		this.addTrackButton = Ext.create('Ext.button.Button', {
//			text:'Add Track',
//			disabled:true,
//			handler: function(){ 
//				_this.onTrackAddAction.notify({"features":_this.features,"trackName":_this.attributesPanel.fileName});
//				}
//		});
//		
////		this.panel  = Ext.create('Ext.ux.Window', {
////			title : this.title,
////			resizable: false,
////			minimizable :true,
////			constrain:true,
////			closable:true,
////			items: [this.attributesPanel.getPanel(),this.karyotypePanel],
////			width: 1035,
////		    height: 653,
////		    buttonAlign:'left',
////			buttons:[this.addTrackButton,'->',
////			         {text:'Close', handler: function(){_this.panel.close();}}],
////	 		listeners: {
////		    	scope: this,
////		    	minimize:function(){
////					this.panel.hide();
////		       	},
////		      	destroy: function(){
////		       		delete this.panel;
////		      	}
////	    	}
////		});
//		this.attributesPanel.getPanel();
//		this.attributesPanel.barField.add(this.filtersButton);
////		this.panel.setLoading();
////		this.drawKaryotype();
//	}	
//	return [this.attributesPanel.getPanel(),this.karyotypePanel];
//		
//};

//GenomicAttributesWidget.prototype.fill = function (queryNames){
//	var _this = this;
//	var cellBaseDataAdapter = new CellBaseDataAdapter(this.species);
//	cellBaseDataAdapter.successed.addEventListener(function(sender){
//		_this.karyotypePanel.setLoading("Retrieving data");
//		for (var i = 0; i < cellBaseDataAdapter.dataset.toJSON().length; i++) {
//				_this.karyotypeWidget.mark(cellBaseDataAdapter.dataset.toJSON()[i]);
//				
//		}
//		_this.features=cellBaseDataAdapter.dataset.toJSON();
//		_this.query = {"dataset": cellBaseDataAdapter.dataset, "resource":queryNames }; 
//		_this.karyotypePanel.setLoading(false);
//		_this.filtersButton.enable();
//		_this.addTrackButton.enable();
//		
//	});
//	cellBaseDataAdapter.fill("feature", this.featureType, queryNames.toString(), "info");
//};

GenomicAttributesWidget.prototype.dataChange = function (items){
		try{
					var _this = this;
					
					this.karyotypePanel.setLoading("Connecting to Database");
					this.karyotypeWidget.unmark();
					var _this=this;
					var externalNames = [];
					
					for (var i = 0; i < items.length; i++) {
						externalNames.push(items[i].data[0]);
					}	
					if (items.length > 0){
						this.fill(externalNames);
					}
					else{
						this.karyotypePanel.setLoading(false);
					}
		}
		catch(e){
			alert(e);
			
		}
		finally{
			this.karyotypePanel.setLoading(false);
		}
};


GenomicAttributesWidget.prototype.onAdditionalInformationClick = function (){
	var _this=this;
	this.listWidget.draw(this.cbResponse, false);
	this.listWidget.onFilterResult.addEventListener(function(sender,data){
		debugger
			_this.karyotypeWidget.unmark();
			var items  = data;
			for (var i = 0; i < items.length; i++) {
				var feature = items[i].data;
				_this.karyotypeWidget.addMark(feature);
			}
		
		_this.attributesPanel.store.clearFilter();
		_this.attributesPanel.store.filter(function(item){
			return item.data.cellBase;
		});
	});
};
ExpressionGenomicAttributesWidget.prototype.draw = GenomicAttributesWidget.prototype.draw;
ExpressionGenomicAttributesWidget.prototype.getMainPanel = GenomicAttributesWidget.prototype.getMainPanel;
ExpressionGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
ExpressionGenomicAttributesWidget.prototype.drawKaryotype = GenomicAttributesWidget.prototype.drawKaryotype;
ExpressionGenomicAttributesWidget.prototype.makeGrid = GenomicAttributesWidget.prototype.makeGrid;
ExpressionGenomicAttributesWidget.prototype.getKaryotypePanelId = GenomicAttributesWidget.prototype.getKaryotypePanelId;
ExpressionGenomicAttributesWidget.prototype.onAdditionalInformationClick = GenomicAttributesWidget.prototype.onAdditionalInformationClick;


function ExpressionGenomicAttributesWidget(species, args){
	if (args == null){
		args = new Object();
	}
	args.columnsCount = 2;
	args.title = "Expression";
	args.tags = ["expression"];
	args.featureType = 'gene';
	args.listWidgetArgs = {title:"Filter",action:'filter'};
	GenomicAttributesWidget.prototype.constructor.call(this, species, args);
};

ExpressionGenomicAttributesWidget.prototype.fill = function (queryNames){
	var _this = this;
	
	var normalized = Normalizer.normalizeArray(values);
	var colors = [];
	for ( var i = 0; i < normalized.length; i++) {
		if (!isNaN(parseFloat(values[i]))){
			colors.push( Colors.getColorByScoreValue(normalized[i]).HexString());
		}
		else{
			colors.push( "#000000");
		}
	}
	
	if(this.cbResponse==null){
		var cellBaseManager = new CellBaseManager(this.species);
		var featureDataAdapter = new FeatureDataAdapter(null,{species:this.species});
		cellBaseManager.success.addEventListener(function(sender,data){
			_this.karyotypePanel.setLoading("Retrieving data");
			for (var i = 0; i < data.result.length; i++) {
				if(data.result[i].length>0){
					_this.attributesPanel.store.data.items[i].data.cellBase = true;
				}else{
					_this.attributesPanel.store.data.items[i].data.cellBase = false;
				}
				for (var j = 0; j < data.result[i].length; j++) {
					var feature = data.result[i][j];
					feature.featureType = "gene";
					_this.karyotypeWidget.addMark(feature,  colors[i]);
					featureDataAdapter.addFeatures(feature);
				}
			}

			_this.adapter = featureDataAdapter;
//			_this.query = {"dataset": cellBaseManager.dataset, "resource":queryNames }; 
//			_this.features=cellBaseManager.dataset.toJSON();
			_this.filtersButton.enable();
			_this.addTrackButton.enable();
			_this.karyotypePanel.setLoading(false);

			_this.cbResponse = data;
			_this.karyotypePanel.setLoading(false);
		});
		this.karyotypePanel.setLoading("Connecting to Database");
		cellBaseManager.get("feature", "gene", queryNames.toString(), "info");
		
	}
};

ExpressionGenomicAttributesWidget.prototype.dataChange = function (items){
	try{
				var _this = this;
				var externalNames = [];
				values = [];
				
				for (var i = 0; i < items.length; i++) {
					externalNames.push(items[i].data[0]);
					values.push(items[i].data[1]);
					
				}	
				
				if (items.length > 0){
					this.fill(externalNames, values);
				}
	}
	catch(e){
		alert(e);
		this.panel.setLoading(false);
	}
};NetworkAttributesWidget.prototype.render = AttributesWidget.prototype.render;
NetworkAttributesWidget.prototype.getButtons = AttributesWidget.prototype.getButtons;

function NetworkAttributesWidget(args){
	if(args == null){
		var args={};
	};
	var height = args.height*0.5;
	var width = args.width*0.5;
	args.borderCls="";
	args.tags = ["sif|json"];
//	AttributesWidget.prototype.constructor.call(this, {height:675, width:800, title:args.title});
	AttributesWidget.prototype.constructor.call(this, {height:height+325+75, width:width+24, title:args.title});
//	this.width=800;
//	this.height=675;
	this.networkHeigth = height;
	this.networkWidth = width;
	this.networkPanelId = "NetworkAttributesWidget_" + Math.ceil(Math.random()*1000);
};



NetworkAttributesWidget.prototype.getNetworkPanelId = function (){
	return this.networkPanelId;
};

NetworkAttributesWidget.prototype.getDetailPanel = function (){
//	return   Ext.create('Ext.panel.Panel', {
//		height:285,
////		maxHeight:350,
//		border:0,
////		bodyPadding: 15,
//		padding:'0 0 0 0',
//		html:'<div id="' + this.getNetworkPanelId() +'" ><div>'
//	});
	
	return Ext.create('Ext.container.Container', {
		padding:5,
		flex:1,
		height:this.networkHeigth,
		style:"background: #eee;",
		cls:'x-unselectable',
		html:'<div id="' + this.getNetworkPanelId() +'" style="border:1px solid #bbb;" ><div>'
	});
	
};

NetworkAttributesWidget.prototype.drawNetwork = function (targetId, dataset, formatter, layout){
	this.dataset =	dataset.clone();

	this.formatter = new NetworkDataSetFormatter({width:400, height:200});
	this.formatter.loadFromJSON(this.dataset, formatter.toJSON());
	
	var vertices = this.dataset.getVertices();
	for ( var vertex in vertices) {
		var size = this.formatter.getVertexById(vertex).getDefault().getSize();
		this.formatter.getVertexById(vertex).getDefault().setSize(size*0.3);
	}
	
	var edges = this.dataset.getEdges();
	for ( var edge in edges) {
		var size = this.formatter.getEdgeById(edge).getDefault().getStrokeWidth();
		this.formatter.getEdgeById(edge).getDefault().setStrokeWidth(size*0.3);
	}
	
	var dsLayout = new LayoutDataset();
	dsLayout.loadFromJSON(this.dataset, layout.toJSON());
	
	this.networkWidget = new NetworkWidget(null, {targetId: targetId, label:false});
	this.networkWidget.draw(this.dataset, this.formatter, dsLayout);
	this.networkWidget.getFormatter().resize(this.networkWidth, this.networkHeigth);
};

NetworkAttributesWidget.prototype.draw = function (graphDataset, formatter, layout){
	var _this=this;
	this.render();
	
	/** Data for search in attributes **/
	this.attributes = new Object();
	
	/** Events **/
	this.verticesSelected = new Event(this);

	this.graphDataset = graphDataset;
	
	this.found = Ext.create('Ext.button.Button', {
		 text: 'Nodes found',
		 hidden:true,
		 listeners: {
		 	scope: this,
		 	click: function(){
		 		new InputListWidget({title:"Features found", headerInfo:"This nodes were found in the Graph"}).draw(this.foundNodes.join('\n'));
			}
	    }
	});
	this.notFound = Ext.create('Ext.button.Button', {
		 text: 'nodes not found',
		 hidden:true,
		 listeners: {
		 	scope: this,
		 	click: function(){
		 		new InputListWidget({title:"Features not found", headerInfo:"This nodes were not found in the grpah"}).draw(this.notFoundNodes.join('\n'));
			}
	    }
	});
	
	this.attributesPanel.barInfo.insert(2, this.notFound);
	this.attributesPanel.barInfo.insert(2, this.found);
	
	this.attributesPanel.onDataChange.addEventListener(function (sender, data){
		_this.dataChanged(data);
	});	
	
	
	this.drawNetwork(this.getNetworkPanelId(), graphDataset, formatter, layout);
};

NetworkAttributesWidget.prototype.getVertexAttributesByName = function (name){
	var attributes = this.attributesPanel.getData();
	var results = new Array();
	if(attributes != null){
		for ( var i = 0; i < attributes.length; i++) {
			if (attributes[i][0] == name){
				results.push(attributes[i]);
			}
		}
		return results;
	}
	else{
		return name;
	}
};


NetworkAttributesWidget.prototype.dataChanged = function (data){
	this.foundNodes=[];
	this.notFoundNodes=[];
	for(var i=0; i< data.length; i++){
		var node = this.graphDataset.getVertexByName(data[i].data["0"]);
		if(node==null){
			this.notFoundNodes.push(data[i].data["0"]);
		}else{
			this.foundNodes.push(data[i].data["0"]);
		}
	}
	this.found.setText('<span class="dis">' + this.foundNodes.length + ' results found </span> ');
	this.found.show();
	if (this.notFoundNodes.length > 0){
		this.notFound.setText('<span class="err">'  + this.notFoundNodes.length +' features not found</span>');
		this.notFound.show();
	}
	
	this.onDataChanged(data);
	
};

NetworkAttributesWidget.prototype.onDataChanged = function (data){
	this.verticesSelected.notify(this.getFoundVertices());
	this.networkWidget.deselectNodes();
	this.networkWidget.selectVerticesByName(this.getFoundVertices());
};

NetworkAttributesWidget.prototype.getFoundVertices = function (){
	return this.foundNodes;
};
ExpressionNetworkAttributesWidget.prototype.draw = NetworkAttributesWidget.prototype.draw;
ExpressionNetworkAttributesWidget.prototype.render = NetworkAttributesWidget.prototype.render;
ExpressionNetworkAttributesWidget.prototype.render = NetworkAttributesWidget.prototype.render;
ExpressionNetworkAttributesWidget.prototype.makeGrid = NetworkAttributesWidget.prototype.makeGrid;

ExpressionNetworkAttributesWidget.prototype.getDetailPanel = NetworkAttributesWidget.prototype.getDetailPanel;
ExpressionNetworkAttributesWidget.prototype.getNetworkPanelId = NetworkAttributesWidget.prototype.getNetworkPanelId;
ExpressionNetworkAttributesWidget.prototype.drawNetwork = NetworkAttributesWidget.prototype.drawNetwork;
ExpressionNetworkAttributesWidget.prototype.dataChanged = NetworkAttributesWidget.prototype.dataChanged;
ExpressionNetworkAttributesWidget.prototype.getFoundVertices = NetworkAttributesWidget.prototype.getFoundVertices;
ExpressionNetworkAttributesWidget.prototype.getVertexAttributesByName = NetworkAttributesWidget.prototype.getVertexAttributesByName;
//ExpressionNetworkAttributesWidget.prototype.getButtons = NetworkAttributesWidget.prototype.getButtons;


function ExpressionNetworkAttributesWidget(args){
	if (args == null){
		args = new Object();
	}
	this.id = "ExpressionNetworkAttributes_" + Math.random();
	args.columnsCount = 2;
	args.title = "Expression";
	args.tags = ["expression"];
	NetworkAttributesWidget.prototype.constructor.call(this, args);
	
	/** EVENTS **/
	this.applyColors = new Event();
};

ExpressionNetworkAttributesWidget.prototype.getButtons = function (){
	var _this = this;
	

	this.rescaleCheckBox =  Ext.create('Ext.form.field.Checkbox', {
        boxLabel : 'Rescale',
        padding:'0 0 5 5',
        disabled:true,
        listeners: {
		       scope: this,
		       change: function(sender, newValue, oldValue){
		       			_this.onDataChanged(_this.attributesPanel.grid.store.getRange());
		       		}
     	}
	});
	
	this.attributesPanel.barInfo.insert(0,this.rescaleCheckBox);
	
	this.attributesPanel.onFileRead.addEventListener(function(){
		_this.rescaleCheckBox.enable();
	});
	
	return [
		    {text:'Apply Colors', handler: function(){_this.applyColors.notify(); _this.panel.close();}},
		    {text:'Close', handler: function(){_this.panel.close();}}];
	
};

ExpressionNetworkAttributesWidget.prototype.onDataChanged = function (data){

	var rescale = this.rescaleCheckBox.getValue();
	this.verticesSelected.notify(this.getFoundVertices());
	this.networkWidget.deselectNodes();
	this.networkWidget.selectVerticesByName(this.getFoundVertices());
	
	var values = new Array();
	var ids = new Array();
	for(var i=0; i< data.length; i++){
		var node = this.graphDataset.getVertexByName(data[i].data["0"]);
		var value = data[i].data["1"];
		if ((node != null)&& (!isNaN(parseFloat(value)))){
			if (rescale){
				if (parseFloat(value) < 0){
					value = Math.log(Math.abs(value))/Math.log(2)* -1;
				}
				else{
					value = Math.log(Math.abs(value))/Math.log(2);
				}
				values.push(value);
			}
			else{
				values.push(value);
			}
			ids.push(data[i].data["0"]);
		}
	}

//	console.log(values);
	
	
	var normalized = Normalizer.normalizeArray(values);
	
//	console.log(normalized);
	
	var colors = [];
	for ( var i = 0; i < normalized.length; i++) {
		if (!isNaN(parseFloat(values[i]))){
			colors.push( Colors.getColorByScoreValue(normalized[i]).HexString());
		}
		else{
			colors.push( "#000000");
		}
	}
	
	for ( var vertexId in ids) {
		var vertices = this.dataset.getVertexByName(ids[vertexId]);
		for ( var i = 0; i < vertices.length; i++) {
			this.formatter.getVertexById(vertices[i].getId()).getDefault().setFill(colors[vertexId]);
		}
		
	}
	
};ExpressionGenomicAttributesWidget.prototype.draw = GenomicAttributesWidget.prototype.draw;
ExpressionGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
ExpressionGenomicAttributesWidget.prototype.drawKaryotype = GenomicAttributesWidget.prototype.drawKaryotype;
ExpressionGenomicAttributesWidget.prototype.render = GenomicAttributesWidget.prototype.render;
ExpressionGenomicAttributesWidget.prototype.makeGrid = GenomicAttributesWidget.prototype.makeGrid;
ExpressionGenomicAttributesWidget.prototype.getKaryotypePanelId = GenomicAttributesWidget.prototype.getKaryotypePanelId;
ExpressionGenomicAttributesWidget.prototype.dataChange = GenomicAttributesWidget.prototype.dataChange;


function ExpressionGenomicAttributesWidget(targetId, widgetId, args){
	GenomicAttributesWidget.prototype.constructor.call(this, targetId, widgetId, args);
    this.karyotypeWidget = new KaryotypePanel(this.getKaryotypePanelId(), this.getKaryotypePanelId(), {"top":10, "width":1000, "height": 300, "trackWidth":15});
};


ExpressionGenomicAttributesWidget.prototype.dataChange = function (items){
	try{
				console.log(items);
				var _this = this;
				this.karyotypePanel.setLoading("Connecting to Database");
				this.karyotypeWidget.unmark();
				var _this=this;
				var externalNames = [];
				
				if (items.length > 0){
					for (var i = 0; i < items.length; i++) {
						externalNames.push(items[i].data[0]);
					}	
					
					
					var cellBaseDataAdapter = new CellBaseDataAdapter();
					cellBaseDataAdapter.successed.addEventListener(function(sender){		
						_this.karyotypePanel.setLoading("Retrieving data");
						for (var i = 0; i < cellBaseDataAdapter.dataset.toJSON().length; i++) {
								_this.karyotypeWidget.mark(cellBaseDataAdapter.dataset.toJSON()[i]);
						}
						_this.karyotypePanel.setLoading(false);
					});
					cellBaseDataAdapter.fill("feature", "gene", externalNames.toString(), "info");
				}
	}
	catch(e){
		alert(e);
		this.panel.setLoading(false);
	}
};



//****   EVENT INTERFACE ****//
/*var Event = function (sender) {
    this._sender = sender;
    this._listeners = [];
};*/

function Event(sender) {
    this._sender = sender;
    this._listeners = [];
};

 
Event.prototype = {
    addEventListener : function (listener) {
        return this._listeners.push(listener)-1; //return index of array
    },
    removeEventListener : function (index) {
    	this._listeners.splice(index,1);
    },
    notify : function (args) {
        for (var i = 0; i < this._listeners.length; i++) {
            this._listeners[i](this._sender, args);
        }
    }
};//Element.prototype.addChildSVG = function(elementName, attributes, index){
//	var el = document.createElementNS('http://www.w3.org/2000/svg', elementName);
//	for ( var key in attributes){
//		el.setAttribute(key, attributes[key]);
//	}
//	
//	// insert child at requested index, or as last child if index is too high or no index is specified
//    if ( null == index ) {
//      this.appendChild( el );
//    }
//    else {
//      var targetIndex = index + 1;
//      if ( 0 == index ) {
//        targetIndex = 0;
//      }
//      var targetEl = this.childNodes[ targetIndex ];
//      if ( targetEl ) {
//        this.insertBefore( el, targetEl ); 
//      }
//      else {
//        this.appendChild( el );
//      }
//    }
//    return el;
//};
//Element.prototype.initSVG = function(attributes){
//	return this.addChildSVG("svg", attributes);
//};

var SVG = {
	
	addChild : function (parent, elementName, attributes, index){
		var el = document.createElementNS('http://www.w3.org/2000/svg', elementName);
		for ( var key in attributes){
			el.setAttribute(key, attributes[key]);
		}
		return this._insert(parent, el, index);
	},
	
	addChildImage : function (parent, attributes, index){
		var el = document.createElementNS('http://www.w3.org/2000/svg', "image");
		for ( var key in attributes){
			if(key == "xlink:href"){
				el.setAttributeNS('http://www.w3.org/1999/xlink','href',attributes[key]);
			}
			el.setAttribute(key, attributes[key]);
		}
		return this._insert(parent, el, index);
	},
	
	_insert : function (parent, el, index){
		// insert child at requested index, or as last child if index is too high or no index is specified
	    if ( null == index ) {
	    	parent.appendChild( el );
	    }
	    else {
	      var targetIndex = index + 1;
	      if ( 0 == index ) {
	        targetIndex = 0;
	      }
	      var targetEl = parent.childNodes[ targetIndex ];
	      if ( targetEl ) {
	    	  parent.insertBefore( el, targetEl ); 
	      }
	      else {
	    	  parent.appendChild( el );
	      }
	    }
	    return el;
	},
	
	init : function (parent, attributes){
		return this.addChild(parent, "svg", attributes);
	}
};

//createSVG = function(elementName, attributes){
//	var el = document.createElementNS('http://www.w3.org/2000/svg', elementName);
//	for ( var key in attributes){
//		el.setAttribute(key, attributes[key]);
//	}
//	return el;
//};



//var SVG =
//{
//		svgns : 'http://www.w3.org/2000/svg',
//		xlinkns : "http://www.w3.org/1999/xlink",
//
////	createSVGCanvas: function(parentNode, attributes)
////	{
//////		attributes['xmlns'] = SVG.svgns;
//////		attributes['xmlns:xlink'] = SVG.xlinkns;
//////		attributes.push( ['xmlns', SVG.svgns], ['xmlns:xlink', 'http://www.w3.org/1999/xlink']);
////		var svg = document.createElementNS(SVG.svgns, "svg");
////		
////		for ( var key in attributes){
////			svg.setAttribute(key, attributes[key]);
////		}
////		
////		parentNode.appendChild(svg);
////		return svg;
////	}, 
//	
//	//Shape types : rect, circle, ellipse, line, polyline, polygon , path
//	createElement : function (svgNode, shapeName, attributes) {
//		try{
//			if(attributes.width < 0){
//				console.log("BIOINFO Warn: on SVG.createRectangle: width is negative, will be set to 0");
//				attributes.width=0;
//			}
//			if(attributes.height < 0){
//				console.log("BIOINFO Warn: on SVG.createRectangle: height is negative, will be set to 0");
//				attributes.height=0;
//			}
//			
//			var shape = document.createElementNS('http://www.w3.org/2000/svg', shapeName);
//			for ( var key in attributes){
//				shape.setAttribute(key, attributes[key]);
//			}
//			svgNode.appendChild(shape);
//		}
//		catch(e){
//			console.log("-------------------- ");
//			console.log("Error on drawRectangle " + e);
//			console.log(attributes);
//			console.log("-------------------- ");
//		}
//		return shape;
//	}
//};
//
//
//
//var CanvasToSVG = {
//		
//	convert: function(sourceCanvas, targetSVG, x, y, id, attributes) {
//		
//		var img = this._convert(sourceCanvas, targetSVG, x, y, id);
//		
//		for (var i=0; i< attributes.length; i++)
//		{
//			img.setAttribute(attributes[i][0], attributes[i][1]);
//		}
//	},
//	
//	_convert: function(sourceCanvas, targetSVG, x, y, id) {
//		var svgNS = "http://www.w3.org/2000/svg";
//		var xlinkNS = "http://www.w3.org/1999/xlink";
//		// get base64 encoded png from Canvas
//		var image = sourceCanvas.toDataURL();
//
//		// must be careful with the namespaces
//		var svgimg = document.createElementNS(svgNS, "image");
//
//		svgimg.setAttribute('id', id);
//	
//		//svgimg.setAttribute('class', class);
//		//svgimg.setAttribute('xlink:href', image);
//		svgimg.setAttributeNS(xlinkNS, 'xlink:href', image);
//		
//
//		svgimg.setAttribute('x', x ? x : 0);
//		svgimg.setAttribute('y', y ? y : 0);
//		svgimg.setAttribute('width', sourceCanvas.width);
//		svgimg.setAttribute('height', sourceCanvas.height);
//		//svgimg.setAttribute('cursor', 'pointer');
//		svgimg.imageData = image;
//	
//		targetSVG.appendChild(svgimg);
//		return svgimg;
//	},
//	
//	importSVG: function(sourceSVG, targetCanvas) {
//	    svg_xml = sourceSVG;//(new XMLSerializer()).serializeToString(sourceSVG);
//	    var ctx = targetCanvas.getContext('2d');
//
//	    var img = new Image();
//	    img.src = "data:image/svg+xml;base64," + btoa(svg_xml);
////	    img.onload = function() {
//	        ctx.drawImage(img, 0, 0);
////	    };
//	}
//	
//};
/*

Normalizacion de datos para dibujar colores
Issues:
		No sé como debería llamarse esta libreria
		No sé si ya existe una funciçon en javascript que lo haga


*/


var Normalizer = new function()
{
   this.normalizeArray = function (arrayData)
   {
	   
	   return this.standardizeArray(this.normal(arrayData));
	   
//	  var result = this._getMaxAndMin(arrayData);
//	  var min =result[0];
//	  var max = result[1];
//	
//
//	  //los hacemos todos positivos
//	  for (var i = 0; i< arrayData.length; i++)
//	  {
//		 arrayData[i]= Math.abs(min) + parseFloat(arrayData[i]);
//	  }
//	 
//	  var result = this._getMaxAndMin(arrayData);
//	  var min =result[0];
//	  var max = result[1];
//	  
//	  
//	  var resultArray = new Array();
//	  for (var i = 0; i< arrayData.length; i++)
//	  {
//		  resultArray.push(arrayData[i]*1/max);
//	  }
//	  return resultArray;
   };
   
   this.normal = function(arrayData){
		var mean = this._getMean(arrayData);
		var deviation = this._getStdDeviation(arrayData);
		var result = this._getMaxAndMin(arrayData);
		var min = result[0];
		var max = result[1];
		
		var resultArray = new Array();
	    for (var i = 0; i< arrayData.length; i++) {
	    	if (deviation!=0){
	    		resultArray.push((arrayData[i]-mean)/deviation);
	    	}else{
	    		resultArray.push(arrayData[i]);
	    	}
	    }
	    return resultArray;
   };

   this.standardizeArray = function(arrayData)
   {
		var result = this._getMaxAndMin(arrayData);
		var min = result[0];
		var max = result[1];
		
		var offset = ( min <= 0 ) ? Math.abs(min) : (-1 * min);
		var resultArray = new Array();
	    for (var i = 0; i< arrayData.length; i++) {
	    	if(max + offset!=0){
	    		resultArray.push((arrayData[i] + offset) / (max + offset));
	    	}else{
	    		resultArray.push(arrayData[i]+offset);
	    	}
	    }
	    return resultArray;
   };


   this._getMean = function(arrayData) {
		var sum = 0;
		for (var i = 0; i< arrayData.length; i++) {
			sum = sum + parseFloat(arrayData[i]);
		}
		return sum/arrayData.length;
	};
	
   this._getStdDeviation = function(arrayData) {
	   var mean = this._getMean(arrayData);
	   var acum = 0.0;
	   for(var i=0; i<arrayData.length; i++) {
		   acum += Math.pow(parseFloat(arrayData[i]) - mean, 2);
	   }
	   return Math.sqrt(acum/arrayData.length);
   };

   this._getMaxAndMin = function(arrayData){
	   var min = Number.MAX_VALUE;
	   var max = Number.MIN_VALUE;
	   
	   for (var i = 0; i< arrayData.length; i++){
		   if (arrayData[i] < min) min =  parseFloat(arrayData[i]);
		   
		   if (arrayData[i] > max) max =  parseFloat(arrayData[i]);
	   }
	   
	   return [min, max];
   };
};
var Colors = new function()
{
   this.hashColor = [];
   this.getColorByScoreArrayValue = function (arrayScore)
   {
	   var array = new Array();
	   
	   for (var i = 0; i< arrayScore.length; i++)
	   {
		
		   var color = this.getColorByScoreValue(arrayScore[i]);
		   array.push( color);
		
	   }
	   return array;  
   };
   
   this.getHexStringByScoreArrayValue = function (arrayScore)
   {
	   var arrayColor = this.getColorByScoreArrayValue(arrayScore); 
	   var arrayHex = new Array();
	   for (var i = 0; i< arrayColor.length; i++)
	   {
		   arrayHex.push( arrayColor[i].HexString());
	   }
	   return arrayHex;   
   };
  
   this.getColorByScoreValue = function (score)
   {

		var truncate = score.toString().substr(0,4);
		if (this.hashColor[truncate]!=null)
		{
			return this.hashColor[truncate];
		}


		if(isNaN(score)) {
			return Colors.ColorFromRGB(0,0,0);
		}
		var value;
	
		var from, to;
		if(score < 0.5) {
			from = Colors.ColorFromRGB(0,0,255);
			to = Colors.ColorFromRGB(255,255,255);
			value = (score * 2);
		} else {
			from = Colors.ColorFromRGB(255,255,255);
			to = Colors.ColorFromRGB(255,0,0);			
			value = (score * 2) - 1;
		}

		var x = value;
		var y = 1.0 - value;
		var color = Colors.ColorFromRGB(y * from.Red() + x * to.Red(), y * from.Green() + x * to.Green(), y * from.Blue() + x * to.Blue());

		this.hashColor[truncate] = color;

		return color;
	};
	
  this.ColorFromHSV = function(hue, sat, val)
  {
    var color = new Color();
    color.SetHSV(hue,sat,val);
    return color;
  };

  this.ColorFromRGB = function(r, g, b)
  {
    var color = new Color();
    color.SetRGB(r,g,b);
    return color;
  };

  this.ColorFromHex = function(hexStr)
  {
    var color = new Color();
    color.SetHexString(hexStr);
    return color;
  };

  function Color() {
    //Stored as values between 0 and 1
    var red = 0;
    var green = 0;
    var blue = 0;
    
    //Stored as values between 0 and 360
    var hue = 0;
    
    //Strored as values between 0 and 1
    var saturation = 0;
    var value = 0;
     
    this.SetRGB = function(r, g, b)
    {
      red = r/255.0;
      green = g/255.0;
      blue = b/255.0;
      calculateHSV();
    };
    
    this.Red = function() { return Math.round(red*255); };
    
    this.Green = function() { return Math.round(green*255); };
    
    this.Blue = function() { return Math.round(blue*255); };
    
    this.SetHSV = function(h, s, v)
    {
      hue = h;
      saturation = s;
      value = v;
      calculateRGB();
    };
      
    this.Hue = function()
    { return hue; };
      
    this.Saturation = function()
    { return saturation; };
      
    this.Value = function()
    { return value; };
     
    this.SetHexString = function(hexString)
    {
      if(hexString == null || typeof(hexString) != "string")
      {
        this.SetRGB(0,0,0);
        return;
      }
       
      if (hexString.substr(0, 1) == '#')
        hexString = hexString.substr(1);
        
      if(hexString.length != 6)
      {
        this.SetRGB(0,0,0);
        return;
      }
          
      var r = parseInt(hexString.substr(0, 2), 16);
      var g = parseInt(hexString.substr(2, 2), 16);
      var b = parseInt(hexString.substr(4, 2), 16);
      if (isNaN(r) || isNaN(g) || isNaN(b))
      {
        this.SetRGB(0,0,0);
        return;
      }
        
      this.SetRGB(r,g,b);  
    };
      
    this.HexString = function()
    {
    
      var rStr = this.Red().toString(16);
      if (rStr.length == 1)
        rStr = '0' + rStr;
      var gStr = this.Green().toString(16);
      if (gStr.length == 1)
        gStr = '0' + gStr;
      var bStr = this.Blue().toString(16);
      if (bStr.length == 1)
        bStr = '0' + bStr;
      return ('#' + rStr + gStr + bStr).toUpperCase();
    };
    
    this.Complement = function()
    {
      var newHue = (hue >= 180) ? hue - 180 : hue + 180;
      var newVal = (value * (saturation - 1) + 1);
      var newSat = (value*saturation) / newVal;
      var newColor = new Color();
      newColor.SetHSV(newHue, newSat, newVal);
      return newColor; 
    } ;
    
    function calculateHSV()
    {
      var max = Math.max(Math.max(red, green), blue);
      var min = Math.min(Math.min(red, green), blue);
      
      value = max;
      
      saturation = 0;
      if(max != 0)
        saturation = 1 - min/max;
        
      hue = 0;
      if(min == max)
        return;
      
      var delta = (max - min);
      if (red == max)
        hue = (green - blue) / delta;
      else if (green == max)
        hue = 2 + ((blue - red) / delta);
      else
        hue = 4 + ((red - green) / delta);
      hue = hue * 60;
      if(hue < 0)
        hue += 360;
    }
    
    function calculateRGB()
    {
      red = value;
      green = value;
      blue = value;
      
      if(value == 0 || saturation == 0)
        return;
      
      var tHue = (hue / 60);
      var i = Math.floor(tHue);
      var f = tHue - i;
      var p = value * (1 - saturation);
      var q = value * (1 - saturation * f);
      var t = value * (1 - saturation * (1 - f));
      switch(i)
      {
        case 0:
          red = value; green = t;       blue = p;
          break;
        case 1:
          red = q; green = value; blue = p;
          break;
        case 2:
          red = p; green = value; blue = t;
          break;
        case 3:
          red = p; green = q; blue = value;
          break;
        case 4:
          red = t; green = p;   blue = value;
          break;
        default:
          red = value; green = p;       blue = q;
          break;
      }
    }
  }
}
();function FileWidget(args){
	var _this=this;
	this.targetId = null;
	this.id = "FileWidget_" + Math.round(Math.random()*100000);
	this.wum = true;
	this.tags = [];
	
	this.args = args;
	
	if (args != null){
		if (args.targetId!= null){
			this.targetId = args.targetId;       
		}
		if (args.title!= null){
			this.title = args.title;    
			this.id = this.title+this.id;
		}
		if (args.wum!= null){
			this.wum = args.wum;    
		}
        if (args.tags!= null){
        	this.tags = args.tags;       
        }
        if (args.viewer!= null){
        	this.viewer = args.viewer;       
        }
        
	}
	
	this.dataAdapter = null;
	this.onOk = new Event(this);
	
	this.browserData = new BrowserDataWidget();
	/** Events i listen **/
	this.browserData.onSelect.addEventListener(function (sender, data){
		_this.trackNameField.setValue(data.filename);
		_this.fileNameLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
		_this.panel.setLoading();
	});	
    this.browserData.adapter.onReadData.addEventListener(function (sender, data){
    	console.log(data)
    	_this.trackNameField.setValue(data.filename);
    	_this.fileNameLabel.setText('<span class="emph">'+ data.filename +'</span> <span class="info">(server)</span>',false);
    	_this.loadFileFromServer(data);
    	_this.panel.setLoading(false);
	});	
};

FileWidget.prototype.getTitleName = function(){
	return this.trackNameField.getValue();
};


FileWidget.prototype.getFileFromServer = function(){
	//abstract method
};

FileWidget.prototype.loadFileFromLocal = function(){
	//abstract method
};

FileWidget.prototype.getChartItems = function(){
	//abstract method
	return [];
};

FileWidget.prototype.getFileUpload = function(){
	var _this = this;
	this.uploadField = Ext.create('Ext.form.field.File', {
		msgTarget : 'side',
//		flex:1,
		width:75,
		emptyText: 'Choose a local file',
        allowBlank: false,
		buttonText : 'Browse local',
		buttonOnly : true,
		listeners : {
			change : {
				fn : function() {
					_this.panel.setLoading();
					var file = document.getElementById(_this.uploadField.fileInputEl.id).files[0];
					_this.trackNameField.setValue(file.name);
					_this.fileNameLabel.setText('<span class="emph">'+ file.name +'</span> <span class="info">(local)</span>',false);
					_this.loadFileFromLocal(file);
					_this.panel.setLoading(false);

				}
			}
		}
	});
	return this.uploadField;
};


FileWidget.prototype.draw = function(){
	var _this = this;
	
	if (this.openDialog == null){
	
		/** Bar for the chart **/
		var featureCountBar = Ext.create('Ext.toolbar.Toolbar');
		this.featureCountLabel = Ext.create('Ext.toolbar.TextItem', {
			text:'<span class="dis">No file loaded</span>'
		});
		featureCountBar.add([this.featureCountLabel]);
		
		/** Bar for the file upload browser **/
		var browseBar = Ext.create('Ext.toolbar.Toolbar',{cls:'bio-border-false'});
		browseBar.add(this.getFileUpload());
		
		this.panel = Ext.create('Ext.panel.Panel', {
			border: false,
			cls:'panel-border-top panel-border-bottom',
	//		padding: "0 0 10 0",
			title: "Previsualization",
		    items : this.getChartItems(),
		    bbar:featureCountBar
		});
		
	//	var colorPicker = Ext.create('Ext.picker.Color', {
	//	    value: '993300',  // initial selected color
	//	    listeners: {
	//	        select: function(picker, selColor) {
	//	            alert(selColor);
	//	        }
	//	    }
	//	});
		this.trackNameField = Ext.create('Ext.form.field.Text',{
			name: 'file',
            fieldLabel: 'Track Name',
            allowBlank: false,
            value: 'New track from '+this.title+' file',
            emptyText: 'Choose a name',
            flex:1
		});
		
		var panelSettings = Ext.create('Ext.panel.Panel', {
			border: false,
			layout: 'hbox',
			bodyPadding: 10,
		    items : [this.trackNameField]	 
		});
		
		
		if(this.wum){
			this.btnBrowse = Ext.create('Ext.button.Button', {
		        text: 'Browse server',
		        disabled:true,
//		        iconCls:'icon-local',
//		        cls:'x-btn-default-small',
		        handler: function (){
	    	   		_this.browserData.draw($.cookie('bioinfo_sid'),_this.tags);
	       		}
			});
			
			browseBar.add(this.btnBrowse);
			
			if($.cookie('bioinfo_sid') != null){
				this.sessionInitiated();
			}else{
				this.sessionFinished();
			}
		}
		
		this.fileNameLabel = Ext.create('Ext.toolbar.TextItem', {
			text:'<span class="emph">Select a <span class="info">local</span> file or a <span class="info">server</span> file from your account.</span>'
		});
		browseBar.add(['->',this.fileNameLabel]);
		
		
		
		this.btnOk = Ext.create('Ext.button.Button', {
			text:'Ok',
			disabled:true,
			handler: function(){ 
				_this.onOk.notify({fileName:_this.file.name, adapter:_this.adapter});
				_this.openDialog.close();
			}
		});
		
		this.openDialog = Ext.create('Ext.ux.Window', {
			title : 'Open '+this.title+' file',
			taskbar:Ext.getCmp(this.args.viewer.id+'uxTaskbar'),
			width : 600,
	//		bodyPadding : 10,
			resizable:false,
			items : [browseBar, /*this.panel,*/ panelSettings],
			buttons:[this.btnOk, 
			         {text:'Cancel', handler: function(){_this.openDialog.close();}}],
			listeners: {
			    	scope: this,
			    	minimize:function(){
						this.openDialog.hide();
			       	},
			      	destroy: function(){
			       		delete this.openDialog;
			      	}
		    	}
		});
		
	}
	this.openDialog.show();
};

FileWidget.prototype.sessionInitiated = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.enable();
	}
};
FileWidget.prototype.sessionFinished = function (){
	if(this.btnBrowse!=null){
		this.btnBrowse.disable();
	}
};function LegendWidget(args){
	
	this.width = 300;
	this.height = 300;
	this.title = "Legend";
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	this.legendPanel = new LegendPanel();
	
};

LegendWidget.prototype.draw = function(legend){
	var _this = this;
	if(this.panel==null){
		
		var item = this.legendPanel.getPanel(legend);
	
		this.panel = Ext.create('Ext.ux.Window', {
			title : this.title,
			resizable: false,
			constrain:true,
			closable:true,
			width: item.width+10,
			height: item.height+70,
			items : [item],
			buttonAlign:'right',
			 layout: {
		        type: 'hbox',
		        align:'stretch' 
		    },
			buttons:[
					{text:'Close', handler: function(){_this.panel.close();}}
			]
		});
	}
	this.panel.show();
	
	
};function LegendPanel(args){
	this.width = 200;
	this.height = 250;
	
	if (args != null){
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	
};

LegendPanel.prototype.getColorItems = function(legend){
	panelsArray = new Array();
	
	for ( var item in legend) {
//		var color = legend[item].toString().replace("#", "");
//		var cp = new Ext.picker.Color();
//		cp.width = 20;
//		cp.colors = [color];
		var size=15;
		var color = Ext.create('Ext.draw.Component', {
        width: size,
        height: size,
        items:[{
				type: 'rect',
				fill: legend[item],
				x:0,y:0,
				width: size,
				height : size
				}]
		});
		
		//Remove "_" and UpperCase first letter
		var name = item.replace(/_/gi, " ");
		name = name.charAt(0).toUpperCase() + name.slice(1);
		
		var panel = Ext.create('Ext.panel.Panel', {
			height:size,
			border:false,
			flex:1,
			margin:"1 0 0 1",
		    layout: {type: 'hbox',align:'stretch' },
		    items: [color, {xtype: 'tbtext',text:name, margin:"1 0 0 3"} ]
		});
		
		panelsArray.push(panel);
	}
	
	return panelsArray;
};




LegendPanel.prototype.getPanel = function(legend){
	var _this=this;
	
	if (this.panel == null){
		
		var items = this.getColorItems(legend);
		
		this.panel  = Ext.create('Ext.panel.Panel', {
			bodyPadding:'0 0 0 2',
			border:false,
			layout: {
		        type: 'vbox',
		        align:'stretch' 
		    },
			items:items,
			width:this.width,
			height:items.length*20
		});		
	}	
	
	return this.panel;
};

LegendPanel.prototype.getButton = function(legend){
	var _this=this;
	
	if (this.button == null){
		
		this.button = Ext.create('Ext.button.Button', {
			text : this.title,
			menu : {
					items: [this.getPanel(legend)]
				}
		});
	}	
	return this.button;
	
};function UrlWidget(args){
	var _this=this;
	this.id = "UrlWidget_" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.title = "Custom url";
	this.width = 500;
	this.height = 400;
	
	if (args != null){
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
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
	
	this.onAdd = new Event(this);
};

UrlWidget.prototype.draw = function (){
	if(this.panel==null){
		this.render();
	}
	this.panel.show();
};

UrlWidget.prototype.render = function (){
	var _this=this;
	
    this.urlField = Ext.create('Ext.form.field.Text',{
    	margin:"0 2 2 0",
    	labelWidth : 30,
    	width:this.width-55,
    	fieldLabel : 'URL',
		emptyText: 'enter a valid url',
//		value : "http://das.sanger.ac.uk/das/grc_region_GRCh37/features",
		value : "http://www.ensembl.org/das/Homo_sapiens.GRCh37.gene/features",
		listeners : { change: {fn: function(){ var dasName = this.value.split('/das/')[1].split('/')[0];
											   _this.trackNameField.setValue(dasName); }}
		}
    });
    this.checkButton = Ext.create('Ext.button.Button',{
		text : 'Check',
		handler : function() {
			_this.form.setLoading();
//			var dasDataAdapter = new DasRegionDataAdapter({
//				url : _this.urlField.getValue()
//			});
//			dasDataAdapter.successed.addEventListener(function() {
//				_this.contentArea.setValue(dasDataAdapter.xml);
//				_this.form.setLoading(false);
//			});
//
//			dasDataAdapter.onError.addEventListener(function() {
//				_this.contentArea.setValue("XMLHttpRequest cannot load. This server is not allowed by Access-Control-Allow-Origin");
//				_this.form.setLoading(false);
//			});
//			dasDataAdapter.fill(1, 1, 1);
			
			var dasAdapter = new DasAdapter({
				url: _this.urlField.getValue(),
				featureCache:{
					gzip: false,
					chunkSize:10000
				}
			});
			
			dasAdapter.onCheckUrl.addEventListener(function(sender,event){
				console.log(event.data);
				_this.contentArea.setValue(event.data);
				_this.form.setLoading(false);
			});
			
			dasAdapter.onError.addEventListener(function() {
				_this.contentArea.setValue("XMLHttpRequest cannot load. This server is not allowed by Access-Control-Allow-Origin");
				_this.form.setLoading(false);
			});
				
			dasAdapter.checkUrl();
		}
    });
	this.trackNameField = Ext.create('Ext.form.field.Text',{
		name: 'file',
//        fieldLabel: 'Track name',
        allowBlank: false,
        value: _this.urlField.value.split('/das/')[1].split('/')[0],
        emptyText: 'Choose a name',
        flex:1
	});
	this.panelSettings = Ext.create('Ext.panel.Panel', {
		layout: 'hbox',
		border:false,
		title:'Track name',
		cls:"panel-border-top",
		bodyPadding: 10,
		width:this.width-2,
	    items : [this.trackNameField]	 
	});
	this.contentArea = Ext.create('Ext.form.field.TextArea',{
		margin:"-1",
		width : this.width,
		height : this.height
	});
	this.infobar = Ext.create('Ext.toolbar.Toolbar',{
		height:28,
		cls:"bio-border-false",
		items:[this.urlField,this.checkButton]
	});
	this.form = Ext.create('Ext.panel.Panel', {
		border : false,
		items : [this.infobar,this.contentArea,this.panelSettings]
	});
	
	this.panel = Ext.create('Ext.ux.Window', {
		title : this.title,
		layout: 'fit',
		resizable:false,
		items : [this.form],
		buttons : [{
			text : 'Add',
			handler : function() {
				_this.onAdd.notify({name:_this.trackNameField.getValue(),url:_this.urlField.getValue()});
				_this.panel.close();
			}
		},{text : 'Cancel',handler : function() {_this.panel.close();}}
		],
		listeners: {
	      	destroy: function(){
	       		delete _this.panel;
	      	}
    	}
	});
};GENE_BIOTYPE_COLORS = {
		//TODO buscar los colores en ensembl!
		"3prime_overlapping_ncrna":"Orange",
		"ambiguous_orf":"SlateBlue",
		"antisense":"SteelBlue",
		"disrupted_domain":"YellowGreen",
		"IG_C_gene":"#FF7F50",
		"IG_D_gene":"#FF7F50",
		"IG_J_gene":"#FF7F50",
		"IG_V_gene":"#FF7F50",
		"lincRNA":"#8b668b",
		"miRNA":"#8b668b",//TODO falta
		"misc_RNA":"#8b668b",
		"Mt_rRNA":"#8b668b",
		"Mt_tRNA":"#8b668b",
		"ncrna_host":"Fuchsia",
		"nonsense_mediated_decay":"Chartreuse",
		"non_coding":"orangered",
		"non_stop_decay":"aqua",
		"polymorphic_pseudogene":"#666666",
		"processed_pseudogene":"#666666",
		"processed_transcript":"#0000ff",
		"protein_coding":"#a00000",
		"pseudogene":"#666666",
		"retained_intron":"gold",
		"retrotransposed":"lightsalmon",
		"rRNA":"LawnGreen",
		"sense_intronic":"#20B2AA",
		"sense_overlapping":"#20B2AA",  
		"snoRNA":"#8b668b",//TODO falta
		"snRNA":"#8b668b",
		"transcribed_processed_pseudogene":"#666666",
		"transcribed_unprocessed_pseudogene":"#666666",
		"unitary_pseudogene":"#666666",
		"unprocessed_pseudogene":"#666666",
		"other":"#000000"
};



SNP_BIOTYPE_COLORS = {
	"2KB_upstream_variant":"#a2b5cd",				//TODO done Upstream
	"5KB_upstream_variant":"#a2b5cd",				//TODO done Upstream
	"500B_downstream_variant":"#a2b5cd",			//TODO done Downstream
	"5KB_downstream_variant":"#a2b5cd",			//TODO done Downstream
	"3_prime_UTR_variant":"#7ac5cd",				//TODO done 3 prime UTR
	"5_prime_UTR_variant":"#7ac5cd",				//TODO done 5 prime UTR
	"coding_sequence_variant":"#458b00",			//TODO done Coding unknown
	"complex_change_in_transcript":"#00fa9a",		//TODO done Complex in/del
	"frameshift_variant":"#ff69b4",				//TODO done Frameshift coding
	"incomplete_terminal_codon_variant":"#ff00ff",	//TODO done Partial codon
	"inframe_codon_gain":"#ffd700",				//TODO done Non-synonymous coding
	"inframe_codon_loss":"#ffd700",				//TODO done Non-synonymous coding
	"initiator_codon_change":"#ffd700",			//TODO done Non-synonymous coding
	"non_synonymous_codon":"#ffd700",				//TODO done Non-synonymous coding
	"intergenic_variant":"#636363",				//TODO done Intergenic
	"intron_variant":"#02599c",					//TODO done Intronic
	"mature_miRNA_variant":"#458b00",				//TODO done Within mature miRNA
	"nc_transcript_variant":"#32cd32",				//TODO done Within non-coding gene
	"splice_acceptor_variant":"#ff7f50",			//TODO done Essential splice site
	"splice_donor_variant":"#ff7f50",				//TODO done Essential splice site
	"splice_region_variant":"#ff7f50",				//TODO done Splice site
	"stop_gained":"#ff0000",						//TODO done Stop gained
	"stop_lost":"#ff0000",							//TODO done Stop lost
	"stop_retained_variant":"#76ee00",				//TODO done Synonymous coding
	"synonymous_codon":"#76ee00",					//TODO done Synonymous coding
	"other":"#000000"
};


SEQUENCE_COLORS = {A:"#009900", C:"#0000FF", G:"#857A00", T:"#aa0000", N:"#555555"}

FEATURE_TYPES = {
	
		
	sequence:{
		color: SEQUENCE_COLORS
	},
	undefined:{
		getLabel: function(f){
			var str = "";
			str+= f.chromosome + ":" + f.start + "-" + f.end;
			return str;
		},
		getColor: function(f){
			return "grey";
		},
//		infoWidgetId: "stableId",
		height:10
//		histogramColor:"lightblue"
	},
	gene:{
		getLabel: function(f){
			var str = "";
			str+= (f.strand < 0) ? "<" : "";
			str+= " "+f.externalName+" ";
			str+= (f.strand > 0) ? ">" : "";
			str+= " ["+f.biotype+"]";
			return str;
		},
		getColor: function(f){
			return GENE_BIOTYPE_COLORS[f.biotype];
		},
		infoWidgetId: "stableId",
		height:4,
		histogramColor:"lightblue"
	},
	transcript:{
		getLabel: function(f){
			var str = "";
			str+= (f.strand < 0) ? "<" : "";
			str+= " "+f.externalName+" ";
			str+= (f.strand > 0) ? ">" : "";
			str+= " ["+f.biotype+"]";
			return str;
		},
		getColor: function(f){
			return GENE_BIOTYPE_COLORS[f.biotype];
		},
		infoWidgetId: "stableId",
		height:4,
		histogramColor:"lightblue"
	},
	exon:{
		getLabel: function(f){
			var str = "";
			str+= f.stableId;
			return str;
		},
		getColor: function(f){
			return "black";
		},
		infoWidgetId: "stableId",
		height:4,
		histogramColor:"lightblue"
	},
	snp:{
		getLabel: function(f){
			var str = "";
			str+= f.name;
			return str;
		},
		getColor: function(f){
			return SNP_BIOTYPE_COLORS[f.displaySoConsequence];
		},
		infoWidgetId: "name",
		height:10,
		histogramColor:"orange"
	},
	mutation:{
		getLabel: function(f){
			var str = "";
			str+= f[Object.keys(f)[0]];
			return str;
		},
		getColor: function(f){
			return "Chartreuse";
		},
		infoWidgetId: "name",
		height:10,
		histogramColor:"Chartreuse"
	},
	cpg_island:{
		getLabel: function(f){
			var str = "";
			str+= f[Object.keys(f)[0]];
			return str;
		},
		getColor: function(f){
			return "Aquamarine";
		},
		infoWidgetId: "name",
		height:10,
		histogramColor:"Aquamarine"
	},
	structural_variation:{
		getLabel: function(f){
			var str = "";
			str+= f[Object.keys(f)[0]];
			return str;
		},
		getColor: function(f){
			return "indigo";
		},
		infoWidgetId: "name",
		height:10,
		histogramColor:"indigo"
	},
	mirna_targets:{
		getLabel: function(f){
			var str = "";
			str+= f[Object.keys(f)[0]];
			return str;
		},
		getColor: function(f){
			return "#8b668b";
		},
		infoWidgetId: "name",
		height:10,
		histogramColor:"#8b668b"
	},
	tfbs:{
		getLabel: function(f){
			var str = "";
			str+= f[Object.keys(f)[0]];
			return str;
		},
		getColor: function(f){
			return "blue";
		},
		infoWidgetId: "name",
		height:10,
		histogramColor:"blue"
	},
	conserved_region:{
		getLabel: function(f){
			var str = "";
			str+= f[Object.keys(f)[0]];
			return str;
		},
		getColor: function(f){
			return "DodgerBlue";
		},
		infoWidgetId: "name",
		height:10,
		histogramColor:"DodgerBlue"
	},
	file:{
		getLabel: function(f){
			var str = "";
			str+= f.label;
			return str;
		},
		getColor: function(f){
			return "black";
		},
		height:10,
		histogramColor:"orange"
	},
	bed:{
		getLabel: function(f){
			var str = "";
			str+= f.label;
			return str;
		},
		getColor: function(f){
			//XXX convert RGB to Hex
	        var rgbColor = new Array();
	        rgbColor = f.itemRgb.split(",");
	        var hex = function (x) {
	        	var hexDigits = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];
	            return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
	        };
	        var hexColor = hex(rgbColor[0])+ hex(rgbColor[1]) + hex(rgbColor[2]);
			return "#"+hexColor;
		},
		height:10,
		histogramColor:"orange"
	},
	das:{
		getLabel: function(f){
			var str = "";
			str+= f.id;
			return str;
		},
		getColor: function(f){
			return "black";
		},
		height:10,
		histogramColor:"orange"
	}
};

/*
 * Binary Search Tree implementation in JavaScript
 * Copyright (c) 2009 Nicholas C. Zakas
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * A binary search tree implementation in JavaScript. This implementation
 * does not allow duplicate values to be inserted into the tree, ensuring
 * that there is just one instance of each value.
 * @class BinarySearchTree
 * @constructor
 */
function FeatureBinarySearchTree() {
    
    /**
     * Pointer to root node in the tree.
     * @property _root
     * @type Object
     * @private
     */
    this._root = null;
}

FeatureBinarySearchTree.prototype = {

    //restore constructor
    constructor: FeatureBinarySearchTree,
    
    //-------------------------------------------------------------------------
    // Private members
    //-------------------------------------------------------------------------
    
    /**
     * Appends some data to the appropriate point in the tree. If there are no
     * nodes in the tree, the data becomes the root. If there are other nodes
     * in the tree, then the tree must be traversed to find the correct spot
     * for insertion. 
     * @param {variant} value The data to add to the list.
     * @return {Void}
     * @method add
     */
    add: function (v){
        //create a new item object, place data in
        var node = { 
                value: v, 
                left: null,
                right: null 
            },
            
            //used to traverse the structure
            current;
    
        //special case: no items in the tree yet
        if (this._root === null){
            this._root = node;
            return true;
        } 
        	//else
            current = this._root;
            
            while(true){
            
                //if the new value is less than this node's value, go left
                if (node.value.end < current.value.start){
                
                    //if there's no left, then the new node belongs there
                    if (current.left === null){
                        current.left = node;
                        return true;
//                        break;
                    } 
                    	//else                  
                        current = current.left;
                    
                //if the new value is greater than this node's value, go right
                } else if (node.value.start > current.value.end){
                
                    //if there's no right, then the new node belongs there
                    if (current.right === null){
                        current.right = node;
                        return true;
//                        break;
                    } 
                    	//else
                        current = current.right;
 
                //if the new value is equal to the current one, just ignore
                } else {
                	return false;
//                    break;
                }
            }        
        
    },
    
    contains: function (v){
        var node = { 
                value: v, 
                left: null,
                right: null 
            },
    	found = false,
    	current = this._root;
          
      //make sure there's a node to search
      while(!found && current){
      
          //if the value is less than the current node's, go left
          if (node.value.end < current.value.start){
              current = current.left;
              
          //if the value is greater than the current node's, go right
          } else if (node.value.start > current.value.end){
              current = current.right;
              
          //values are equal, found it!
          } else {
              found = true;
          }
      }
      
      //only proceed if the node was found
      return found;   
        
    }
};/*
 * $Id: rawdeflate.js,v 0.3 2009/03/01 19:05:05 dankogai Exp dankogai $
 *
 * Original:
 *   http://www.onicos.com/staff/iz/amuse/javascript/expert/deflate.txt
 */

(function(){
/* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0.1
 * LastModified: Dec 25 1999
 */

/* Interface:
 * data = zip_deflate(src);
 */

/* constant parameters */
var zip_WSIZE = 32768;		// Sliding Window size
var zip_STORED_BLOCK = 0;
var zip_STATIC_TREES = 1;
var zip_DYN_TREES    = 2;

/* for deflate */
var zip_DEFAULT_LEVEL = 6;
var zip_FULL_SEARCH = true;
var zip_INBUFSIZ = 32768;	// Input buffer size
var zip_INBUF_EXTRA = 64;	// Extra buffer
var zip_OUTBUFSIZ = 1024 * 8;
var zip_window_size = 2 * zip_WSIZE;
var zip_MIN_MATCH = 3;
var zip_MAX_MATCH = 258;
var zip_BITS = 16;
// for SMALL_MEM
var zip_LIT_BUFSIZE = 0x2000;
var zip_HASH_BITS = 13;
// for MEDIUM_MEM
// var zip_LIT_BUFSIZE = 0x4000;
// var zip_HASH_BITS = 14;
// for BIG_MEM
// var zip_LIT_BUFSIZE = 0x8000;
// var zip_HASH_BITS = 15;
if(zip_LIT_BUFSIZE > zip_INBUFSIZ)
    alert("error: zip_INBUFSIZ is too small");
if((zip_WSIZE<<1) > (1<<zip_BITS))
    alert("error: zip_WSIZE is too large");
if(zip_HASH_BITS > zip_BITS-1)
    alert("error: zip_HASH_BITS is too large");
if(zip_HASH_BITS < 8 || zip_MAX_MATCH != 258)
    alert("error: Code too clever");
var zip_DIST_BUFSIZE = zip_LIT_BUFSIZE;
var zip_HASH_SIZE = 1 << zip_HASH_BITS;
var zip_HASH_MASK = zip_HASH_SIZE - 1;
var zip_WMASK = zip_WSIZE - 1;
var zip_NIL = 0; // Tail of hash chains
var zip_TOO_FAR = 4096;
var zip_MIN_LOOKAHEAD = zip_MAX_MATCH + zip_MIN_MATCH + 1;
var zip_MAX_DIST = zip_WSIZE - zip_MIN_LOOKAHEAD;
var zip_SMALLEST = 1;
var zip_MAX_BITS = 15;
var zip_MAX_BL_BITS = 7;
var zip_LENGTH_CODES = 29;
var zip_LITERALS =256;
var zip_END_BLOCK = 256;
var zip_L_CODES = zip_LITERALS + 1 + zip_LENGTH_CODES;
var zip_D_CODES = 30;
var zip_BL_CODES = 19;
var zip_REP_3_6 = 16;
var zip_REPZ_3_10 = 17;
var zip_REPZ_11_138 = 18;
var zip_HEAP_SIZE = 2 * zip_L_CODES + 1;
var zip_H_SHIFT = parseInt((zip_HASH_BITS + zip_MIN_MATCH - 1) /
			   zip_MIN_MATCH);

/* variables */
var zip_free_queue;
var zip_qhead, zip_qtail;
var zip_initflag;
var zip_outbuf = null;
var zip_outcnt, zip_outoff;
var zip_complete;
var zip_window;
var zip_d_buf;
var zip_l_buf;
var zip_prev;
var zip_bi_buf;
var zip_bi_valid;
var zip_block_start;
var zip_ins_h;
var zip_hash_head;
var zip_prev_match;
var zip_match_available;
var zip_match_length;
var zip_prev_length;
var zip_strstart;
var zip_match_start;
var zip_eofile;
var zip_lookahead;
var zip_max_chain_length;
var zip_max_lazy_match;
var zip_compr_level;
var zip_good_match;
var zip_nice_match;
var zip_dyn_ltree;
var zip_dyn_dtree;
var zip_static_ltree;
var zip_static_dtree;
var zip_bl_tree;
var zip_l_desc;
var zip_d_desc;
var zip_bl_desc;
var zip_bl_count;
var zip_heap;
var zip_heap_len;
var zip_heap_max;
var zip_depth;
var zip_length_code;
var zip_dist_code;
var zip_base_length;
var zip_base_dist;
var zip_flag_buf;
var zip_last_lit;
var zip_last_dist;
var zip_last_flags;
var zip_flags;
var zip_flag_bit;
var zip_opt_len;
var zip_static_len;
var zip_deflate_data;
var zip_deflate_pos;

/* objects (deflate) */

var zip_DeflateCT = function() {
    this.fc = 0; // frequency count or bit string
    this.dl = 0; // father node in Huffman tree or length of bit string
}

var zip_DeflateTreeDesc = function() {
    this.dyn_tree = null;	// the dynamic tree
    this.static_tree = null;	// corresponding static tree or NULL
    this.extra_bits = null;	// extra bits for each code or NULL
    this.extra_base = 0;	// base index for extra_bits
    this.elems = 0;		// max number of elements in the tree
    this.max_length = 0;	// max bit length for the codes
    this.max_code = 0;		// largest code with non zero frequency
}

/* Values for max_lazy_match, good_match and max_chain_length, depending on
 * the desired pack level (0..9). The values given below have been tuned to
 * exclude worst case performance for pathological files. Better values may be
 * found for specific files.
 */
var zip_DeflateConfiguration = function(a, b, c, d) {
    this.good_length = a; // reduce lazy search above this match length
    this.max_lazy = b;    // do not perform lazy search above this match length
    this.nice_length = c; // quit search above this match length
    this.max_chain = d;
}

var zip_DeflateBuffer = function() {
    this.next = null;
    this.len = 0;
    this.ptr = new Array(zip_OUTBUFSIZ);
    this.off = 0;
}

/* constant tables */
var zip_extra_lbits = new Array(
    0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0);
var zip_extra_dbits = new Array(
    0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13);
var zip_extra_blbits = new Array(
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7);
var zip_bl_order = new Array(
    16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15);
var zip_configuration_table = new Array(
	new zip_DeflateConfiguration(0,    0,   0,    0),
	new zip_DeflateConfiguration(4,    4,   8,    4),
	new zip_DeflateConfiguration(4,    5,  16,    8),
	new zip_DeflateConfiguration(4,    6,  32,   32),
	new zip_DeflateConfiguration(4,    4,  16,   16),
	new zip_DeflateConfiguration(8,   16,  32,   32),
	new zip_DeflateConfiguration(8,   16, 128,  128),
	new zip_DeflateConfiguration(8,   32, 128,  256),
	new zip_DeflateConfiguration(32, 128, 258, 1024),
	new zip_DeflateConfiguration(32, 258, 258, 4096));


/* routines (deflate) */

var zip_deflate_start = function(level) {
    var i;

    if(!level)
	level = zip_DEFAULT_LEVEL;
    else if(level < 1)
	level = 1;
    else if(level > 9)
	level = 9;

    zip_compr_level = level;
    zip_initflag = false;
    zip_eofile = false;
    if(zip_outbuf != null)
	return;

    zip_free_queue = zip_qhead = zip_qtail = null;
    zip_outbuf = new Array(zip_OUTBUFSIZ);
    zip_window = new Array(zip_window_size);
    zip_d_buf = new Array(zip_DIST_BUFSIZE);
    zip_l_buf = new Array(zip_INBUFSIZ + zip_INBUF_EXTRA);
    zip_prev = new Array(1 << zip_BITS);
    zip_dyn_ltree = new Array(zip_HEAP_SIZE);
    for(i = 0; i < zip_HEAP_SIZE; i++)
	zip_dyn_ltree[i] = new zip_DeflateCT();
    zip_dyn_dtree = new Array(2*zip_D_CODES+1);
    for(i = 0; i < 2*zip_D_CODES+1; i++)
	zip_dyn_dtree[i] = new zip_DeflateCT();
    zip_static_ltree = new Array(zip_L_CODES+2);
    for(i = 0; i < zip_L_CODES+2; i++)
	zip_static_ltree[i] = new zip_DeflateCT();
    zip_static_dtree = new Array(zip_D_CODES);
    for(i = 0; i < zip_D_CODES; i++)
	zip_static_dtree[i] = new zip_DeflateCT();
    zip_bl_tree = new Array(2*zip_BL_CODES+1);
    for(i = 0; i < 2*zip_BL_CODES+1; i++)
	zip_bl_tree[i] = new zip_DeflateCT();
    zip_l_desc = new zip_DeflateTreeDesc();
    zip_d_desc = new zip_DeflateTreeDesc();
    zip_bl_desc = new zip_DeflateTreeDesc();
    zip_bl_count = new Array(zip_MAX_BITS+1);
    zip_heap = new Array(2*zip_L_CODES+1);
    zip_depth = new Array(2*zip_L_CODES+1);
    zip_length_code = new Array(zip_MAX_MATCH-zip_MIN_MATCH+1);
    zip_dist_code = new Array(512);
    zip_base_length = new Array(zip_LENGTH_CODES);
    zip_base_dist = new Array(zip_D_CODES);
    zip_flag_buf = new Array(parseInt(zip_LIT_BUFSIZE / 8));
}

var zip_deflate_end = function() {
    zip_free_queue = zip_qhead = zip_qtail = null;
    zip_outbuf = null;
    zip_window = null;
    zip_d_buf = null;
    zip_l_buf = null;
    zip_prev = null;
    zip_dyn_ltree = null;
    zip_dyn_dtree = null;
    zip_static_ltree = null;
    zip_static_dtree = null;
    zip_bl_tree = null;
    zip_l_desc = null;
    zip_d_desc = null;
    zip_bl_desc = null;
    zip_bl_count = null;
    zip_heap = null;
    zip_depth = null;
    zip_length_code = null;
    zip_dist_code = null;
    zip_base_length = null;
    zip_base_dist = null;
    zip_flag_buf = null;
}

var zip_reuse_queue = function(p) {
    p.next = zip_free_queue;
    zip_free_queue = p;
}

var zip_new_queue = function() {
    var p;

    if(zip_free_queue != null)
    {
	p = zip_free_queue;
	zip_free_queue = zip_free_queue.next;
    }
    else
	p = new zip_DeflateBuffer();
    p.next = null;
    p.len = p.off = 0;

    return p;
}

var zip_head1 = function(i) {
    return zip_prev[zip_WSIZE + i];
}

var zip_head2 = function(i, val) {
    return zip_prev[zip_WSIZE + i] = val;
}

/* put_byte is used for the compressed output, put_ubyte for the
 * uncompressed output. However unlzw() uses window for its
 * suffix table instead of its output buffer, so it does not use put_ubyte
 * (to be cleaned up).
 */
var zip_put_byte = function(c) {
    zip_outbuf[zip_outoff + zip_outcnt++] = c;
    if(zip_outoff + zip_outcnt == zip_OUTBUFSIZ)
	zip_qoutbuf();
}

/* Output a 16 bit value, lsb first */
var zip_put_short = function(w) {
    w &= 0xffff;
    if(zip_outoff + zip_outcnt < zip_OUTBUFSIZ - 2) {
	zip_outbuf[zip_outoff + zip_outcnt++] = (w & 0xff);
	zip_outbuf[zip_outoff + zip_outcnt++] = (w >>> 8);
    } else {
	zip_put_byte(w & 0xff);
	zip_put_byte(w >>> 8);
    }
}

/* ==========================================================================
 * Insert string s in the dictionary and set match_head to the previous head
 * of the hash chain (the most recent string with same hash key). Return
 * the previous length of the hash chain.
 * IN  assertion: all calls to to INSERT_STRING are made with consecutive
 *    input characters and the first MIN_MATCH bytes of s are valid
 *    (except for the last MIN_MATCH-1 bytes of the input file).
 */
var zip_INSERT_STRING = function() {
    zip_ins_h = ((zip_ins_h << zip_H_SHIFT)
		 ^ (zip_window[zip_strstart + zip_MIN_MATCH - 1] & 0xff))
	& zip_HASH_MASK;
    zip_hash_head = zip_head1(zip_ins_h);
    zip_prev[zip_strstart & zip_WMASK] = zip_hash_head;
    zip_head2(zip_ins_h, zip_strstart);
}

/* Send a code of the given tree. c and tree must not have side effects */
var zip_SEND_CODE = function(c, tree) {
    zip_send_bits(tree[c].fc, tree[c].dl);
}

/* Mapping from a distance to a distance code. dist is the distance - 1 and
 * must not have side effects. dist_code[256] and dist_code[257] are never
 * used.
 */
var zip_D_CODE = function(dist) {
    return (dist < 256 ? zip_dist_code[dist]
	    : zip_dist_code[256 + (dist>>7)]) & 0xff;
}

/* ==========================================================================
 * Compares to subtrees, using the tree depth as tie breaker when
 * the subtrees have equal frequency. This minimizes the worst case length.
 */
var zip_SMALLER = function(tree, n, m) {
    return tree[n].fc < tree[m].fc ||
      (tree[n].fc == tree[m].fc && zip_depth[n] <= zip_depth[m]);
}

/* ==========================================================================
 * read string data
 */
var zip_read_buff = function(buff, offset, n) {
    var i;
    for(i = 0; i < n && zip_deflate_pos < zip_deflate_data.length; i++)
	buff[offset + i] =
	    zip_deflate_data.charCodeAt(zip_deflate_pos++) & 0xff;
    return i;
}

/* ==========================================================================
 * Initialize the "longest match" routines for a new file
 */
var zip_lm_init = function() {
    var j;

    /* Initialize the hash table. */
    for(j = 0; j < zip_HASH_SIZE; j++)
//	zip_head2(j, zip_NIL);
	zip_prev[zip_WSIZE + j] = 0;
    /* prev will be initialized on the fly */

    /* Set the default configuration parameters:
     */
    zip_max_lazy_match = zip_configuration_table[zip_compr_level].max_lazy;
    zip_good_match     = zip_configuration_table[zip_compr_level].good_length;
    if(!zip_FULL_SEARCH)
	zip_nice_match = zip_configuration_table[zip_compr_level].nice_length;
    zip_max_chain_length = zip_configuration_table[zip_compr_level].max_chain;

    zip_strstart = 0;
    zip_block_start = 0;

    zip_lookahead = zip_read_buff(zip_window, 0, 2 * zip_WSIZE);
    if(zip_lookahead <= 0) {
	zip_eofile = true;
	zip_lookahead = 0;
	return;
    }
    zip_eofile = false;
    /* Make sure that we always have enough lookahead. This is important
     * if input comes from a device such as a tty.
     */
    while(zip_lookahead < zip_MIN_LOOKAHEAD && !zip_eofile)
	zip_fill_window();

    /* If lookahead < MIN_MATCH, ins_h is garbage, but this is
     * not important since only literal bytes will be emitted.
     */
    zip_ins_h = 0;
    for(j = 0; j < zip_MIN_MATCH - 1; j++) {
//      UPDATE_HASH(ins_h, window[j]);
	zip_ins_h = ((zip_ins_h << zip_H_SHIFT) ^ (zip_window[j] & 0xff)) & zip_HASH_MASK;
    }
}

/* ==========================================================================
 * Set match_start to the longest match starting at the given string and
 * return its length. Matches shorter or equal to prev_length are discarded,
 * in which case the result is equal to prev_length and match_start is
 * garbage.
 * IN assertions: cur_match is the head of the hash chain for the current
 *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
 */
var zip_longest_match = function(cur_match) {
    var chain_length = zip_max_chain_length; // max hash chain length
    var scanp = zip_strstart; // current string
    var matchp;		// matched string
    var len;		// length of current match
    var best_len = zip_prev_length;	// best match length so far

    /* Stop when cur_match becomes <= limit. To simplify the code,
     * we prevent matches with the string of window index 0.
     */
    var limit = (zip_strstart > zip_MAX_DIST ? zip_strstart - zip_MAX_DIST : zip_NIL);

    var strendp = zip_strstart + zip_MAX_MATCH;
    var scan_end1 = zip_window[scanp + best_len - 1];
    var scan_end  = zip_window[scanp + best_len];

    /* Do not waste too much time if we already have a good match: */
    if(zip_prev_length >= zip_good_match)
	chain_length >>= 2;

//  Assert(encoder->strstart <= window_size-MIN_LOOKAHEAD, "insufficient lookahead");

    do {
//    Assert(cur_match < encoder->strstart, "no future");
	matchp = cur_match;

	/* Skip to next match if the match length cannot increase
	    * or if the match length is less than 2:
	*/
	if(zip_window[matchp + best_len]	!= scan_end  ||
	   zip_window[matchp + best_len - 1]	!= scan_end1 ||
	   zip_window[matchp]			!= zip_window[scanp] ||
	   zip_window[++matchp]			!= zip_window[scanp + 1]) {
	    continue;
	}

	/* The check at best_len-1 can be removed because it will be made
         * again later. (This heuristic is not always a win.)
         * It is not necessary to compare scan[2] and match[2] since they
         * are always equal when the other bytes match, given that
         * the hash keys are equal and that HASH_BITS >= 8.
         */
	scanp += 2;
	matchp++;

	/* We check for insufficient lookahead only every 8th comparison;
         * the 256th check will be made at strstart+258.
         */
	do {
	} while(zip_window[++scanp] == zip_window[++matchp] &&
		zip_window[++scanp] == zip_window[++matchp] &&
		zip_window[++scanp] == zip_window[++matchp] &&
		zip_window[++scanp] == zip_window[++matchp] &&
		zip_window[++scanp] == zip_window[++matchp] &&
		zip_window[++scanp] == zip_window[++matchp] &&
		zip_window[++scanp] == zip_window[++matchp] &&
		zip_window[++scanp] == zip_window[++matchp] &&
		scanp < strendp);

      len = zip_MAX_MATCH - (strendp - scanp);
      scanp = strendp - zip_MAX_MATCH;

      if(len > best_len) {
	  zip_match_start = cur_match;
	  best_len = len;
	  if(zip_FULL_SEARCH) {
	      if(len >= zip_MAX_MATCH) break;
	  } else {
	      if(len >= zip_nice_match) break;
	  }

	  scan_end1  = zip_window[scanp + best_len-1];
	  scan_end   = zip_window[scanp + best_len];
      }
    } while((cur_match = zip_prev[cur_match & zip_WMASK]) > limit
	    && --chain_length != 0);

    return best_len;
}

/* ==========================================================================
 * Fill the window when the lookahead becomes insufficient.
 * Updates strstart and lookahead, and sets eofile if end of input file.
 * IN assertion: lookahead < MIN_LOOKAHEAD && strstart + lookahead > 0
 * OUT assertions: at least one byte has been read, or eofile is set;
 *    file reads are performed for at least two bytes (required for the
 *    translate_eol option).
 */
var zip_fill_window = function() {
    var n, m;

    // Amount of free space at the end of the window.
    var more = zip_window_size - zip_lookahead - zip_strstart;

    /* If the window is almost full and there is insufficient lookahead,
     * move the upper half to the lower one to make room in the upper half.
     */
    if(more == -1) {
	/* Very unlikely, but possible on 16 bit machine if strstart == 0
         * and lookahead == 1 (input done one byte at time)
         */
	more--;
    } else if(zip_strstart >= zip_WSIZE + zip_MAX_DIST) {
	/* By the IN assertion, the window is not empty so we can't confuse
         * more == 0 with more == 64K on a 16 bit machine.
         */
//	Assert(window_size == (ulg)2*WSIZE, "no sliding with BIG_MEM");

//	System.arraycopy(window, WSIZE, window, 0, WSIZE);
	for(n = 0; n < zip_WSIZE; n++)
	    zip_window[n] = zip_window[n + zip_WSIZE];
      
	zip_match_start -= zip_WSIZE;
	zip_strstart    -= zip_WSIZE; /* we now have strstart >= MAX_DIST: */
	zip_block_start -= zip_WSIZE;

	for(n = 0; n < zip_HASH_SIZE; n++) {
	    m = zip_head1(n);
	    zip_head2(n, m >= zip_WSIZE ? m - zip_WSIZE : zip_NIL);
	}
	for(n = 0; n < zip_WSIZE; n++) {
	    /* If n is not on any hash chain, prev[n] is garbage but
	     * its value will never be used.
	     */
	    m = zip_prev[n];
	    zip_prev[n] = (m >= zip_WSIZE ? m - zip_WSIZE : zip_NIL);
	}
	more += zip_WSIZE;
    }
    // At this point, more >= 2
    if(!zip_eofile) {
	n = zip_read_buff(zip_window, zip_strstart + zip_lookahead, more);
	if(n <= 0)
	    zip_eofile = true;
	else
	    zip_lookahead += n;
    }
}

/* ==========================================================================
 * Processes a new input file and return its compressed length. This
 * function does not perform lazy evaluationof matches and inserts
 * new strings in the dictionary only for unmatched strings or for short
 * matches. It is used only for the fast compression options.
 */
var zip_deflate_fast = function() {
    while(zip_lookahead != 0 && zip_qhead == null) {
	var flush; // set if current block must be flushed

	/* Insert the string window[strstart .. strstart+2] in the
	 * dictionary, and set hash_head to the head of the hash chain:
	 */
	zip_INSERT_STRING();

	/* Find the longest match, discarding those <= prev_length.
	 * At this point we have always match_length < MIN_MATCH
	 */
	if(zip_hash_head != zip_NIL &&
	   zip_strstart - zip_hash_head <= zip_MAX_DIST) {
	    /* To simplify the code, we prevent matches with the string
	     * of window index 0 (in particular we have to avoid a match
	     * of the string with itself at the start of the input file).
	     */
	    zip_match_length = zip_longest_match(zip_hash_head);
	    /* longest_match() sets match_start */
	    if(zip_match_length > zip_lookahead)
		zip_match_length = zip_lookahead;
	}
	if(zip_match_length >= zip_MIN_MATCH) {
//	    check_match(strstart, match_start, match_length);

	    flush = zip_ct_tally(zip_strstart - zip_match_start,
				 zip_match_length - zip_MIN_MATCH);
	    zip_lookahead -= zip_match_length;

	    /* Insert new strings in the hash table only if the match length
	     * is not too large. This saves time but degrades compression.
	     */
	    if(zip_match_length <= zip_max_lazy_match) {
		zip_match_length--; // string at strstart already in hash table
		do {
		    zip_strstart++;
		    zip_INSERT_STRING();
		    /* strstart never exceeds WSIZE-MAX_MATCH, so there are
		     * always MIN_MATCH bytes ahead. If lookahead < MIN_MATCH
		     * these bytes are garbage, but it does not matter since
		     * the next lookahead bytes will be emitted as literals.
		     */
		} while(--zip_match_length != 0);
		zip_strstart++;
	    } else {
		zip_strstart += zip_match_length;
		zip_match_length = 0;
		zip_ins_h = zip_window[zip_strstart] & 0xff;
//		UPDATE_HASH(ins_h, window[strstart + 1]);
		zip_ins_h = ((zip_ins_h<<zip_H_SHIFT) ^ (zip_window[zip_strstart + 1] & 0xff)) & zip_HASH_MASK;

//#if MIN_MATCH != 3
//		Call UPDATE_HASH() MIN_MATCH-3 more times
//#endif

	    }
	} else {
	    /* No match, output a literal byte */
	    flush = zip_ct_tally(0, zip_window[zip_strstart] & 0xff);
	    zip_lookahead--;
	    zip_strstart++;
	}
	if(flush) {
	    zip_flush_block(0);
	    zip_block_start = zip_strstart;
	}

	/* Make sure that we always have enough lookahead, except
	 * at the end of the input file. We need MAX_MATCH bytes
	 * for the next match, plus MIN_MATCH bytes to insert the
	 * string following the next match.
	 */
	while(zip_lookahead < zip_MIN_LOOKAHEAD && !zip_eofile)
	    zip_fill_window();
    }
}

var zip_deflate_better = function() {
    /* Process the input block. */
    while(zip_lookahead != 0 && zip_qhead == null) {
	/* Insert the string window[strstart .. strstart+2] in the
	 * dictionary, and set hash_head to the head of the hash chain:
	 */
	zip_INSERT_STRING();

	/* Find the longest match, discarding those <= prev_length.
	 */
	zip_prev_length = zip_match_length;
	zip_prev_match = zip_match_start;
	zip_match_length = zip_MIN_MATCH - 1;

	if(zip_hash_head != zip_NIL &&
	   zip_prev_length < zip_max_lazy_match &&
	   zip_strstart - zip_hash_head <= zip_MAX_DIST) {
	    /* To simplify the code, we prevent matches with the string
	     * of window index 0 (in particular we have to avoid a match
	     * of the string with itself at the start of the input file).
	     */
	    zip_match_length = zip_longest_match(zip_hash_head);
	    /* longest_match() sets match_start */
	    if(zip_match_length > zip_lookahead)
		zip_match_length = zip_lookahead;

	    /* Ignore a length 3 match if it is too distant: */
	    if(zip_match_length == zip_MIN_MATCH &&
	       zip_strstart - zip_match_start > zip_TOO_FAR) {
		/* If prev_match is also MIN_MATCH, match_start is garbage
		 * but we will ignore the current match anyway.
		 */
		zip_match_length--;
	    }
	}
	/* If there was a match at the previous step and the current
	 * match is not better, output the previous match:
	 */
	if(zip_prev_length >= zip_MIN_MATCH &&
	   zip_match_length <= zip_prev_length) {
	    var flush; // set if current block must be flushed

//	    check_match(strstart - 1, prev_match, prev_length);
	    flush = zip_ct_tally(zip_strstart - 1 - zip_prev_match,
				 zip_prev_length - zip_MIN_MATCH);

	    /* Insert in hash table all strings up to the end of the match.
	     * strstart-1 and strstart are already inserted.
	     */
	    zip_lookahead -= zip_prev_length - 1;
	    zip_prev_length -= 2;
	    do {
		zip_strstart++;
		zip_INSERT_STRING();
		/* strstart never exceeds WSIZE-MAX_MATCH, so there are
		 * always MIN_MATCH bytes ahead. If lookahead < MIN_MATCH
		 * these bytes are garbage, but it does not matter since the
		 * next lookahead bytes will always be emitted as literals.
		 */
	    } while(--zip_prev_length != 0);
	    zip_match_available = 0;
	    zip_match_length = zip_MIN_MATCH - 1;
	    zip_strstart++;
	    if(flush) {
		zip_flush_block(0);
		zip_block_start = zip_strstart;
	    }
	} else if(zip_match_available != 0) {
	    /* If there was no match at the previous position, output a
	     * single literal. If there was a match but the current match
	     * is longer, truncate the previous match to a single literal.
	     */
	    if(zip_ct_tally(0, zip_window[zip_strstart - 1] & 0xff)) {
		zip_flush_block(0);
		zip_block_start = zip_strstart;
	    }
	    zip_strstart++;
	    zip_lookahead--;
	} else {
	    /* There is no previous match to compare with, wait for
	     * the next step to decide.
	     */
	    zip_match_available = 1;
	    zip_strstart++;
	    zip_lookahead--;
	}

	/* Make sure that we always have enough lookahead, except
	 * at the end of the input file. We need MAX_MATCH bytes
	 * for the next match, plus MIN_MATCH bytes to insert the
	 * string following the next match.
	 */
	while(zip_lookahead < zip_MIN_LOOKAHEAD && !zip_eofile)
	    zip_fill_window();
    }
}

var zip_init_deflate = function() {
    if(zip_eofile)
	return;
    zip_bi_buf = 0;
    zip_bi_valid = 0;
    zip_ct_init();
    zip_lm_init();

    zip_qhead = null;
    zip_outcnt = 0;
    zip_outoff = 0;

    if(zip_compr_level <= 3)
    {
	zip_prev_length = zip_MIN_MATCH - 1;
	zip_match_length = 0;
    }
    else
    {
	zip_match_length = zip_MIN_MATCH - 1;
	zip_match_available = 0;
    }

    zip_complete = false;
}

/* ==========================================================================
 * Same as above, but achieves better compression. We use a lazy
 * evaluation for matches: a match is finally adopted only if there is
 * no better match at the next window position.
 */
var zip_deflate_internal = function(buff, off, buff_size) {
    var n;

    if(!zip_initflag)
    {
	zip_init_deflate();
	zip_initflag = true;
	if(zip_lookahead == 0) { // empty
	    zip_complete = true;
	    return 0;
	}
    }

    if((n = zip_qcopy(buff, off, buff_size)) == buff_size)
	return buff_size;

    if(zip_complete)
	return n;

    if(zip_compr_level <= 3) // optimized for speed
	zip_deflate_fast();
    else
	zip_deflate_better();
    if(zip_lookahead == 0) {
	if(zip_match_available != 0)
	    zip_ct_tally(0, zip_window[zip_strstart - 1] & 0xff);
	zip_flush_block(1);
	zip_complete = true;
    }
    return n + zip_qcopy(buff, n + off, buff_size - n);
}

var zip_qcopy = function(buff, off, buff_size) {
    var n, i, j;

    n = 0;
    while(zip_qhead != null && n < buff_size)
    {
	i = buff_size - n;
	if(i > zip_qhead.len)
	    i = zip_qhead.len;
//      System.arraycopy(qhead.ptr, qhead.off, buff, off + n, i);
	for(j = 0; j < i; j++)
	    buff[off + n + j] = zip_qhead.ptr[zip_qhead.off + j];
	
	zip_qhead.off += i;
	zip_qhead.len -= i;
	n += i;
	if(zip_qhead.len == 0) {
	    var p;
	    p = zip_qhead;
	    zip_qhead = zip_qhead.next;
	    zip_reuse_queue(p);
	}
    }

    if(n == buff_size)
	return n;

    if(zip_outoff < zip_outcnt) {
	i = buff_size - n;
	if(i > zip_outcnt - zip_outoff)
	    i = zip_outcnt - zip_outoff;
	// System.arraycopy(outbuf, outoff, buff, off + n, i);
	for(j = 0; j < i; j++)
	    buff[off + n + j] = zip_outbuf[zip_outoff + j];
	zip_outoff += i;
	n += i;
	if(zip_outcnt == zip_outoff)
	    zip_outcnt = zip_outoff = 0;
    }
    return n;
}

/* ==========================================================================
 * Allocate the match buffer, initialize the various tables and save the
 * location of the internal file attribute (ascii/binary) and method
 * (DEFLATE/STORE).
 */
var zip_ct_init = function() {
    var n;	// iterates over tree elements
    var bits;	// bit counter
    var length;	// length value
    var code;	// code value
    var dist;	// distance index

    if(zip_static_dtree[0].dl != 0) return; // ct_init already called

    zip_l_desc.dyn_tree		= zip_dyn_ltree;
    zip_l_desc.static_tree	= zip_static_ltree;
    zip_l_desc.extra_bits	= zip_extra_lbits;
    zip_l_desc.extra_base	= zip_LITERALS + 1;
    zip_l_desc.elems		= zip_L_CODES;
    zip_l_desc.max_length	= zip_MAX_BITS;
    zip_l_desc.max_code		= 0;

    zip_d_desc.dyn_tree		= zip_dyn_dtree;
    zip_d_desc.static_tree	= zip_static_dtree;
    zip_d_desc.extra_bits	= zip_extra_dbits;
    zip_d_desc.extra_base	= 0;
    zip_d_desc.elems		= zip_D_CODES;
    zip_d_desc.max_length	= zip_MAX_BITS;
    zip_d_desc.max_code		= 0;

    zip_bl_desc.dyn_tree	= zip_bl_tree;
    zip_bl_desc.static_tree	= null;
    zip_bl_desc.extra_bits	= zip_extra_blbits;
    zip_bl_desc.extra_base	= 0;
    zip_bl_desc.elems		= zip_BL_CODES;
    zip_bl_desc.max_length	= zip_MAX_BL_BITS;
    zip_bl_desc.max_code	= 0;

    // Initialize the mapping length (0..255) -> length code (0..28)
    length = 0;
    for(code = 0; code < zip_LENGTH_CODES-1; code++) {
	zip_base_length[code] = length;
	for(n = 0; n < (1<<zip_extra_lbits[code]); n++)
	    zip_length_code[length++] = code;
    }
    // Assert (length == 256, "ct_init: length != 256");

    /* Note that the length 255 (match length 258) can be represented
     * in two different ways: code 284 + 5 bits or code 285, so we
     * overwrite length_code[255] to use the best encoding:
     */
    zip_length_code[length-1] = code;

    /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
    dist = 0;
    for(code = 0 ; code < 16; code++) {
	zip_base_dist[code] = dist;
	for(n = 0; n < (1<<zip_extra_dbits[code]); n++) {
	    zip_dist_code[dist++] = code;
	}
    }
    // Assert (dist == 256, "ct_init: dist != 256");
    dist >>= 7; // from now on, all distances are divided by 128
    for( ; code < zip_D_CODES; code++) {
	zip_base_dist[code] = dist << 7;
	for(n = 0; n < (1<<(zip_extra_dbits[code]-7)); n++)
	    zip_dist_code[256 + dist++] = code;
    }
    // Assert (dist == 256, "ct_init: 256+dist != 512");

    // Construct the codes of the static literal tree
    for(bits = 0; bits <= zip_MAX_BITS; bits++)
	zip_bl_count[bits] = 0;
    n = 0;
    while(n <= 143) { zip_static_ltree[n++].dl = 8; zip_bl_count[8]++; }
    while(n <= 255) { zip_static_ltree[n++].dl = 9; zip_bl_count[9]++; }
    while(n <= 279) { zip_static_ltree[n++].dl = 7; zip_bl_count[7]++; }
    while(n <= 287) { zip_static_ltree[n++].dl = 8; zip_bl_count[8]++; }
    /* Codes 286 and 287 do not exist, but we must include them in the
     * tree construction to get a canonical Huffman tree (longest code
     * all ones)
     */
    zip_gen_codes(zip_static_ltree, zip_L_CODES + 1);

    /* The static distance tree is trivial: */
    for(n = 0; n < zip_D_CODES; n++) {
	zip_static_dtree[n].dl = 5;
	zip_static_dtree[n].fc = zip_bi_reverse(n, 5);
    }

    // Initialize the first block of the first file:
    zip_init_block();
}

/* ==========================================================================
 * Initialize a new block.
 */
var zip_init_block = function() {
    var n; // iterates over tree elements

    // Initialize the trees.
    for(n = 0; n < zip_L_CODES;  n++) zip_dyn_ltree[n].fc = 0;
    for(n = 0; n < zip_D_CODES;  n++) zip_dyn_dtree[n].fc = 0;
    for(n = 0; n < zip_BL_CODES; n++) zip_bl_tree[n].fc = 0;

    zip_dyn_ltree[zip_END_BLOCK].fc = 1;
    zip_opt_len = zip_static_len = 0;
    zip_last_lit = zip_last_dist = zip_last_flags = 0;
    zip_flags = 0;
    zip_flag_bit = 1;
}

/* ==========================================================================
 * Restore the heap property by moving down the tree starting at node k,
 * exchanging a node with the smallest of its two sons if necessary, stopping
 * when the heap property is re-established (each father smaller than its
 * two sons).
 */
var zip_pqdownheap = function(
    tree,	// the tree to restore
    k) {	// node to move down
    var v = zip_heap[k];
    var j = k << 1;	// left son of k

    while(j <= zip_heap_len) {
	// Set j to the smallest of the two sons:
	if(j < zip_heap_len &&
	   zip_SMALLER(tree, zip_heap[j + 1], zip_heap[j]))
	    j++;

	// Exit if v is smaller than both sons
	if(zip_SMALLER(tree, v, zip_heap[j]))
	    break;

	// Exchange v with the smallest son
	zip_heap[k] = zip_heap[j];
	k = j;

	// And continue down the tree, setting j to the left son of k
	j <<= 1;
    }
    zip_heap[k] = v;
}

/* ==========================================================================
 * Compute the optimal bit lengths for a tree and update the total bit length
 * for the current block.
 * IN assertion: the fields freq and dad are set, heap[heap_max] and
 *    above are the tree nodes sorted by increasing frequency.
 * OUT assertions: the field len is set to the optimal bit length, the
 *     array bl_count contains the frequencies for each bit length.
 *     The length opt_len is updated; static_len is also updated if stree is
 *     not null.
 */
var zip_gen_bitlen = function(desc) { // the tree descriptor
    var tree		= desc.dyn_tree;
    var extra		= desc.extra_bits;
    var base		= desc.extra_base;
    var max_code	= desc.max_code;
    var max_length	= desc.max_length;
    var stree		= desc.static_tree;
    var h;		// heap index
    var n, m;		// iterate over the tree elements
    var bits;		// bit length
    var xbits;		// extra bits
    var f;		// frequency
    var overflow = 0;	// number of elements with bit length too large

    for(bits = 0; bits <= zip_MAX_BITS; bits++)
	zip_bl_count[bits] = 0;

    /* In a first pass, compute the optimal bit lengths (which may
     * overflow in the case of the bit length tree).
     */
    tree[zip_heap[zip_heap_max]].dl = 0; // root of the heap

    for(h = zip_heap_max + 1; h < zip_HEAP_SIZE; h++) {
	n = zip_heap[h];
	bits = tree[tree[n].dl].dl + 1;
	if(bits > max_length) {
	    bits = max_length;
	    overflow++;
	}
	tree[n].dl = bits;
	// We overwrite tree[n].dl which is no longer needed

	if(n > max_code)
	    continue; // not a leaf node

	zip_bl_count[bits]++;
	xbits = 0;
	if(n >= base)
	    xbits = extra[n - base];
	f = tree[n].fc;
	zip_opt_len += f * (bits + xbits);
	if(stree != null)
	    zip_static_len += f * (stree[n].dl + xbits);
    }
    if(overflow == 0)
	return;

    // This happens for example on obj2 and pic of the Calgary corpus

    // Find the first bit length which could increase:
    do {
	bits = max_length - 1;
	while(zip_bl_count[bits] == 0)
	    bits--;
	zip_bl_count[bits]--;		// move one leaf down the tree
	zip_bl_count[bits + 1] += 2;	// move one overflow item as its brother
	zip_bl_count[max_length]--;
	/* The brother of the overflow item also moves one step up,
	 * but this does not affect bl_count[max_length]
	 */
	overflow -= 2;
    } while(overflow > 0);

    /* Now recompute all bit lengths, scanning in increasing frequency.
     * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
     * lengths instead of fixing only the wrong ones. This idea is taken
     * from 'ar' written by Haruhiko Okumura.)
     */
    for(bits = max_length; bits != 0; bits--) {
	n = zip_bl_count[bits];
	while(n != 0) {
	    m = zip_heap[--h];
	    if(m > max_code)
		continue;
	    if(tree[m].dl != bits) {
		zip_opt_len += (bits - tree[m].dl) * tree[m].fc;
		tree[m].fc = bits;
	    }
	    n--;
	}
    }
}

  /* ==========================================================================
   * Generate the codes for a given tree and bit counts (which need not be
   * optimal).
   * IN assertion: the array bl_count contains the bit length statistics for
   * the given tree and the field len is set for all tree elements.
   * OUT assertion: the field code is set for all tree elements of non
   *     zero code length.
   */
var zip_gen_codes = function(tree,	// the tree to decorate
		   max_code) {	// largest code with non zero frequency
    var next_code = new Array(zip_MAX_BITS+1); // next code value for each bit length
    var code = 0;		// running code value
    var bits;			// bit index
    var n;			// code index

    /* The distribution counts are first used to generate the code values
     * without bit reversal.
     */
    for(bits = 1; bits <= zip_MAX_BITS; bits++) {
	code = ((code + zip_bl_count[bits-1]) << 1);
	next_code[bits] = code;
    }

    /* Check that the bit counts in bl_count are consistent. The last code
     * must be all ones.
     */
//    Assert (code + encoder->bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
//	    "inconsistent bit counts");
//    Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

    for(n = 0; n <= max_code; n++) {
	var len = tree[n].dl;
	if(len == 0)
	    continue;
	// Now reverse the bits
	tree[n].fc = zip_bi_reverse(next_code[len]++, len);

//      Tracec(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
//	  n, (isgraph(n) ? n : ' '), len, tree[n].fc, next_code[len]-1));
    }
}

/* ==========================================================================
 * Construct one Huffman tree and assigns the code bit strings and lengths.
 * Update the total bit length for the current block.
 * IN assertion: the field freq is set for all tree elements.
 * OUT assertions: the fields len and code are set to the optimal bit length
 *     and corresponding code. The length opt_len is updated; static_len is
 *     also updated if stree is not null. The field max_code is set.
 */
var zip_build_tree = function(desc) { // the tree descriptor
    var tree	= desc.dyn_tree;
    var stree	= desc.static_tree;
    var elems	= desc.elems;
    var n, m;		// iterate over heap elements
    var max_code = -1;	// largest code with non zero frequency
    var node = elems;	// next internal node of the tree

    /* Construct the initial heap, with least frequent element in
     * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
     * heap[0] is not used.
     */
    zip_heap_len = 0;
    zip_heap_max = zip_HEAP_SIZE;

    for(n = 0; n < elems; n++) {
	if(tree[n].fc != 0) {
	    zip_heap[++zip_heap_len] = max_code = n;
	    zip_depth[n] = 0;
	} else
	    tree[n].dl = 0;
    }

    /* The pkzip format requires that at least one distance code exists,
     * and that at least one bit should be sent even if there is only one
     * possible code. So to avoid special checks later on we force at least
     * two codes of non zero frequency.
     */
    while(zip_heap_len < 2) {
	var xnew = zip_heap[++zip_heap_len] = (max_code < 2 ? ++max_code : 0);
	tree[xnew].fc = 1;
	zip_depth[xnew] = 0;
	zip_opt_len--;
	if(stree != null)
	    zip_static_len -= stree[xnew].dl;
	// new is 0 or 1 so it does not have extra bits
    }
    desc.max_code = max_code;

    /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
     * establish sub-heaps of increasing lengths:
     */
    for(n = zip_heap_len >> 1; n >= 1; n--)
	zip_pqdownheap(tree, n);

    /* Construct the Huffman tree by repeatedly combining the least two
     * frequent nodes.
     */
    do {
	n = zip_heap[zip_SMALLEST];
	zip_heap[zip_SMALLEST] = zip_heap[zip_heap_len--];
	zip_pqdownheap(tree, zip_SMALLEST);

	m = zip_heap[zip_SMALLEST];  // m = node of next least frequency

	// keep the nodes sorted by frequency
	zip_heap[--zip_heap_max] = n;
	zip_heap[--zip_heap_max] = m;

	// Create a new node father of n and m
	tree[node].fc = tree[n].fc + tree[m].fc;
//	depth[node] = (char)(MAX(depth[n], depth[m]) + 1);
	if(zip_depth[n] > zip_depth[m] + 1)
	    zip_depth[node] = zip_depth[n];
	else
	    zip_depth[node] = zip_depth[m] + 1;
	tree[n].dl = tree[m].dl = node;

	// and insert the new node in the heap
	zip_heap[zip_SMALLEST] = node++;
	zip_pqdownheap(tree, zip_SMALLEST);

    } while(zip_heap_len >= 2);

    zip_heap[--zip_heap_max] = zip_heap[zip_SMALLEST];

    /* At this point, the fields freq and dad are set. We can now
     * generate the bit lengths.
     */
    zip_gen_bitlen(desc);

    // The field len is now set, we can generate the bit codes
    zip_gen_codes(tree, max_code);
}

/* ==========================================================================
 * Scan a literal or distance tree to determine the frequencies of the codes
 * in the bit length tree. Updates opt_len to take into account the repeat
 * counts. (The contribution of the bit length codes will be added later
 * during the construction of bl_tree.)
 */
var zip_scan_tree = function(tree,// the tree to be scanned
		       max_code) {  // and its largest code of non zero frequency
    var n;			// iterates over all tree elements
    var prevlen = -1;		// last emitted length
    var curlen;			// length of current code
    var nextlen = tree[0].dl;	// length of next code
    var count = 0;		// repeat count of the current code
    var max_count = 7;		// max repeat count
    var min_count = 4;		// min repeat count

    if(nextlen == 0) {
	max_count = 138;
	min_count = 3;
    }
    tree[max_code + 1].dl = 0xffff; // guard

    for(n = 0; n <= max_code; n++) {
	curlen = nextlen;
	nextlen = tree[n + 1].dl;
	if(++count < max_count && curlen == nextlen)
	    continue;
	else if(count < min_count)
	    zip_bl_tree[curlen].fc += count;
	else if(curlen != 0) {
	    if(curlen != prevlen)
		zip_bl_tree[curlen].fc++;
	    zip_bl_tree[zip_REP_3_6].fc++;
	} else if(count <= 10)
	    zip_bl_tree[zip_REPZ_3_10].fc++;
	else
	    zip_bl_tree[zip_REPZ_11_138].fc++;
	count = 0; prevlen = curlen;
	if(nextlen == 0) {
	    max_count = 138;
	    min_count = 3;
	} else if(curlen == nextlen) {
	    max_count = 6;
	    min_count = 3;
	} else {
	    max_count = 7;
	    min_count = 4;
	}
    }
}

  /* ==========================================================================
   * Send a literal or distance tree in compressed form, using the codes in
   * bl_tree.
   */
var zip_send_tree = function(tree, // the tree to be scanned
		   max_code) { // and its largest code of non zero frequency
    var n;			// iterates over all tree elements
    var prevlen = -1;		// last emitted length
    var curlen;			// length of current code
    var nextlen = tree[0].dl;	// length of next code
    var count = 0;		// repeat count of the current code
    var max_count = 7;		// max repeat count
    var min_count = 4;		// min repeat count

    /* tree[max_code+1].dl = -1; */  /* guard already set */
    if(nextlen == 0) {
      max_count = 138;
      min_count = 3;
    }

    for(n = 0; n <= max_code; n++) {
	curlen = nextlen;
	nextlen = tree[n+1].dl;
	if(++count < max_count && curlen == nextlen) {
	    continue;
	} else if(count < min_count) {
	    do { zip_SEND_CODE(curlen, zip_bl_tree); } while(--count != 0);
	} else if(curlen != 0) {
	    if(curlen != prevlen) {
		zip_SEND_CODE(curlen, zip_bl_tree);
		count--;
	    }
	    // Assert(count >= 3 && count <= 6, " 3_6?");
	    zip_SEND_CODE(zip_REP_3_6, zip_bl_tree);
	    zip_send_bits(count - 3, 2);
	} else if(count <= 10) {
	    zip_SEND_CODE(zip_REPZ_3_10, zip_bl_tree);
	    zip_send_bits(count-3, 3);
	} else {
	    zip_SEND_CODE(zip_REPZ_11_138, zip_bl_tree);
	    zip_send_bits(count-11, 7);
	}
	count = 0;
	prevlen = curlen;
	if(nextlen == 0) {
	    max_count = 138;
	    min_count = 3;
	} else if(curlen == nextlen) {
	    max_count = 6;
	    min_count = 3;
	} else {
	    max_count = 7;
	    min_count = 4;
	}
    }
}

/* ==========================================================================
 * Construct the Huffman tree for the bit lengths and return the index in
 * bl_order of the last bit length code to send.
 */
var zip_build_bl_tree = function() {
    var max_blindex;  // index of last bit length code of non zero freq

    // Determine the bit length frequencies for literal and distance trees
    zip_scan_tree(zip_dyn_ltree, zip_l_desc.max_code);
    zip_scan_tree(zip_dyn_dtree, zip_d_desc.max_code);

    // Build the bit length tree:
    zip_build_tree(zip_bl_desc);
    /* opt_len now includes the length of the tree representations, except
     * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
     */

    /* Determine the number of bit length codes to send. The pkzip format
     * requires that at least 4 bit length codes be sent. (appnote.txt says
     * 3 but the actual value used is 4.)
     */
    for(max_blindex = zip_BL_CODES-1; max_blindex >= 3; max_blindex--) {
	if(zip_bl_tree[zip_bl_order[max_blindex]].dl != 0) break;
    }
    /* Update opt_len to include the bit length tree and counts */
    zip_opt_len += 3*(max_blindex+1) + 5+5+4;
//    Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
//	    encoder->opt_len, encoder->static_len));

    return max_blindex;
}

/* ==========================================================================
 * Send the header for a block using dynamic Huffman trees: the counts, the
 * lengths of the bit length codes, the literal tree and the distance tree.
 * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
 */
var zip_send_all_trees = function(lcodes, dcodes, blcodes) { // number of codes for each tree
    var rank; // index in bl_order

//    Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
//    Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
//	    "too many codes");
//    Tracev((stderr, "\nbl counts: "));
    zip_send_bits(lcodes-257, 5); // not +255 as stated in appnote.txt
    zip_send_bits(dcodes-1,   5);
    zip_send_bits(blcodes-4,  4); // not -3 as stated in appnote.txt
    for(rank = 0; rank < blcodes; rank++) {
//      Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
	zip_send_bits(zip_bl_tree[zip_bl_order[rank]].dl, 3);
    }

    // send the literal tree
    zip_send_tree(zip_dyn_ltree,lcodes-1);

    // send the distance tree
    zip_send_tree(zip_dyn_dtree,dcodes-1);
}

/* ==========================================================================
 * Determine the best encoding for the current block: dynamic trees, static
 * trees or store, and output the encoded block to the zip file.
 */
var zip_flush_block = function(eof) { // true if this is the last block for a file
    var opt_lenb, static_lenb; // opt_len and static_len in bytes
    var max_blindex;	// index of last bit length code of non zero freq
    var stored_len;	// length of input block

    stored_len = zip_strstart - zip_block_start;
    zip_flag_buf[zip_last_flags] = zip_flags; // Save the flags for the last 8 items

    // Construct the literal and distance trees
    zip_build_tree(zip_l_desc);
//    Tracev((stderr, "\nlit data: dyn %ld, stat %ld",
//	    encoder->opt_len, encoder->static_len));

    zip_build_tree(zip_d_desc);
//    Tracev((stderr, "\ndist data: dyn %ld, stat %ld",
//	    encoder->opt_len, encoder->static_len));
    /* At this point, opt_len and static_len are the total bit lengths of
     * the compressed block data, excluding the tree representations.
     */

    /* Build the bit length tree for the above two trees, and get the index
     * in bl_order of the last bit length code to send.
     */
    max_blindex = zip_build_bl_tree();

    // Determine the best encoding. Compute first the block length in bytes
    opt_lenb	= (zip_opt_len   +3+7)>>3;
    static_lenb = (zip_static_len+3+7)>>3;

//    Trace((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u dist %u ",
//	   opt_lenb, encoder->opt_len,
//	   static_lenb, encoder->static_len, stored_len,
//	   encoder->last_lit, encoder->last_dist));

    if(static_lenb <= opt_lenb)
	opt_lenb = static_lenb;
    if(stored_len + 4 <= opt_lenb // 4: two words for the lengths
       && zip_block_start >= 0) {
	var i;

	/* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
	 * Otherwise we can't have processed more than WSIZE input bytes since
	 * the last block flush, because compression would have been
	 * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
	 * transform a block into a stored block.
	 */
	zip_send_bits((zip_STORED_BLOCK<<1)+eof, 3);  /* send block type */
	zip_bi_windup();		 /* align on byte boundary */
	zip_put_short(stored_len);
	zip_put_short(~stored_len);

      // copy block
/*
      p = &window[block_start];
      for(i = 0; i < stored_len; i++)
	put_byte(p[i]);
*/
	for(i = 0; i < stored_len; i++)
	    zip_put_byte(zip_window[zip_block_start + i]);

    } else if(static_lenb == opt_lenb) {
	zip_send_bits((zip_STATIC_TREES<<1)+eof, 3);
	zip_compress_block(zip_static_ltree, zip_static_dtree);
    } else {
	zip_send_bits((zip_DYN_TREES<<1)+eof, 3);
	zip_send_all_trees(zip_l_desc.max_code+1,
			   zip_d_desc.max_code+1,
			   max_blindex+1);
	zip_compress_block(zip_dyn_ltree, zip_dyn_dtree);
    }

    zip_init_block();

    if(eof != 0)
	zip_bi_windup();
}

/* ==========================================================================
 * Save the match info and tally the frequency counts. Return true if
 * the current block must be flushed.
 */
var zip_ct_tally = function(
	dist, // distance of matched string
	lc) { // match length-MIN_MATCH or unmatched char (if dist==0)
    zip_l_buf[zip_last_lit++] = lc;
    if(dist == 0) {
	// lc is the unmatched char
	zip_dyn_ltree[lc].fc++;
    } else {
	// Here, lc is the match length - MIN_MATCH
	dist--;		    // dist = match distance - 1
//      Assert((ush)dist < (ush)MAX_DIST &&
//	     (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
//	     (ush)D_CODE(dist) < (ush)D_CODES,  "ct_tally: bad match");

	zip_dyn_ltree[zip_length_code[lc]+zip_LITERALS+1].fc++;
	zip_dyn_dtree[zip_D_CODE(dist)].fc++;

	zip_d_buf[zip_last_dist++] = dist;
	zip_flags |= zip_flag_bit;
    }
    zip_flag_bit <<= 1;

    // Output the flags if they fill a byte
    if((zip_last_lit & 7) == 0) {
	zip_flag_buf[zip_last_flags++] = zip_flags;
	zip_flags = 0;
	zip_flag_bit = 1;
    }
    // Try to guess if it is profitable to stop the current block here
    if(zip_compr_level > 2 && (zip_last_lit & 0xfff) == 0) {
	// Compute an upper bound for the compressed length
	var out_length = zip_last_lit * 8;
	var in_length = zip_strstart - zip_block_start;
	var dcode;

	for(dcode = 0; dcode < zip_D_CODES; dcode++) {
	    out_length += zip_dyn_dtree[dcode].fc * (5 + zip_extra_dbits[dcode]);
	}
	out_length >>= 3;
//      Trace((stderr,"\nlast_lit %u, last_dist %u, in %ld, out ~%ld(%ld%%) ",
//	     encoder->last_lit, encoder->last_dist, in_length, out_length,
//	     100L - out_length*100L/in_length));
	if(zip_last_dist < parseInt(zip_last_lit/2) &&
	   out_length < parseInt(in_length/2))
	    return true;
    }
    return (zip_last_lit == zip_LIT_BUFSIZE-1 ||
	    zip_last_dist == zip_DIST_BUFSIZE);
    /* We avoid equality with LIT_BUFSIZE because of wraparound at 64K
     * on 16 bit machines and because stored blocks are restricted to
     * 64K-1 bytes.
     */
}

  /* ==========================================================================
   * Send the block data compressed using the given Huffman trees
   */
var zip_compress_block = function(
	ltree,	// literal tree
	dtree) {	// distance tree
    var dist;		// distance of matched string
    var lc;		// match length or unmatched char (if dist == 0)
    var lx = 0;		// running index in l_buf
    var dx = 0;		// running index in d_buf
    var fx = 0;		// running index in flag_buf
    var flag = 0;	// current flags
    var code;		// the code to send
    var extra;		// number of extra bits to send

    if(zip_last_lit != 0) do {
	if((lx & 7) == 0)
	    flag = zip_flag_buf[fx++];
	lc = zip_l_buf[lx++] & 0xff;
	if((flag & 1) == 0) {
	    zip_SEND_CODE(lc, ltree); /* send a literal byte */
//	Tracecv(isgraph(lc), (stderr," '%c' ", lc));
	} else {
	    // Here, lc is the match length - MIN_MATCH
	    code = zip_length_code[lc];
	    zip_SEND_CODE(code+zip_LITERALS+1, ltree); // send the length code
	    extra = zip_extra_lbits[code];
	    if(extra != 0) {
		lc -= zip_base_length[code];
		zip_send_bits(lc, extra); // send the extra length bits
	    }
	    dist = zip_d_buf[dx++];
	    // Here, dist is the match distance - 1
	    code = zip_D_CODE(dist);
//	Assert (code < D_CODES, "bad d_code");

	    zip_SEND_CODE(code, dtree);	  // send the distance code
	    extra = zip_extra_dbits[code];
	    if(extra != 0) {
		dist -= zip_base_dist[code];
		zip_send_bits(dist, extra);   // send the extra distance bits
	    }
	} // literal or match pair ?
	flag >>= 1;
    } while(lx < zip_last_lit);

    zip_SEND_CODE(zip_END_BLOCK, ltree);
}

/* ==========================================================================
 * Send a value on a given number of bits.
 * IN assertion: length <= 16 and value fits in length bits.
 */
var zip_Buf_size = 16; // bit size of bi_buf
var zip_send_bits = function(
	value,	// value to send
	length) {	// number of bits
    /* If not enough room in bi_buf, use (valid) bits from bi_buf and
     * (16 - bi_valid) bits from value, leaving (width - (16-bi_valid))
     * unused bits in value.
     */
    if(zip_bi_valid > zip_Buf_size - length) {
	zip_bi_buf |= (value << zip_bi_valid);
	zip_put_short(zip_bi_buf);
	zip_bi_buf = (value >> (zip_Buf_size - zip_bi_valid));
	zip_bi_valid += length - zip_Buf_size;
    } else {
	zip_bi_buf |= value << zip_bi_valid;
	zip_bi_valid += length;
    }
}

/* ==========================================================================
 * Reverse the first len bits of a code, using straightforward code (a faster
 * method would use a table)
 * IN assertion: 1 <= len <= 15
 */
var zip_bi_reverse = function(
	code,	// the value to invert
	len) {	// its bit length
    var res = 0;
    do {
	res |= code & 1;
	code >>= 1;
	res <<= 1;
    } while(--len > 0);
    return res >> 1;
}

/* ==========================================================================
 * Write out any remaining bits in an incomplete byte.
 */
var zip_bi_windup = function() {
    if(zip_bi_valid > 8) {
	zip_put_short(zip_bi_buf);
    } else if(zip_bi_valid > 0) {
	zip_put_byte(zip_bi_buf);
    }
    zip_bi_buf = 0;
    zip_bi_valid = 0;
}

var zip_qoutbuf = function() {
    if(zip_outcnt != 0) {
	var q, i;
	q = zip_new_queue();
	if(zip_qhead == null)
	    zip_qhead = zip_qtail = q;
	else
	    zip_qtail = zip_qtail.next = q;
	q.len = zip_outcnt - zip_outoff;
//      System.arraycopy(zip_outbuf, zip_outoff, q.ptr, 0, q.len);
	for(i = 0; i < q.len; i++)
	    q.ptr[i] = zip_outbuf[zip_outoff + i];
	zip_outcnt = zip_outoff = 0;
    }
}

var zip_deflate = function(str, level) {
    var i, j;

    zip_deflate_data = str;
    zip_deflate_pos = 0;
    if(typeof level == "undefined")
	level = zip_DEFAULT_LEVEL;
    zip_deflate_start(level);

    var buff = new Array(1024);
    var aout = [];
    while((i = zip_deflate_internal(buff, 0, buff.length)) > 0) {
	var cbuf = new Array(i);
	for(j = 0; j < i; j++){
	    cbuf[j] = String.fromCharCode(buff[j]);
	}
	aout[aout.length] = cbuf.join("");
    }
    zip_deflate_data = null; // G.C.
    return aout.join("");
}

if (! window.RawDeflate) RawDeflate = {};
RawDeflate.deflate = zip_deflate;

})();


/*
 * $Id: rawinflate.js,v 0.2 2009/03/01 18:32:24 dankogai Exp $
 *
 * original:
 * http://www.onicos.com/staff/iz/amuse/javascript/expert/inflate.txt
 */

(function(){

/* Copyright (C) 1999 Masanao Izumo <iz@onicos.co.jp>
 * Version: 1.0.0.1
 * LastModified: Dec 25 1999
 */

/* Interface:
 * data = zip_inflate(src);
 */

/* constant parameters */
var zip_WSIZE = 32768;		// Sliding Window size
var zip_STORED_BLOCK = 0;
var zip_STATIC_TREES = 1;
var zip_DYN_TREES    = 2;

/* for inflate */
var zip_lbits = 9; 		// bits in base literal/length lookup table
var zip_dbits = 6; 		// bits in base distance lookup table
var zip_INBUFSIZ = 32768;	// Input buffer size
var zip_INBUF_EXTRA = 64;	// Extra buffer

/* variables (inflate) */
var zip_slide;
var zip_wp;			// current position in slide
var zip_fixed_tl = null;	// inflate static
var zip_fixed_td;		// inflate static
var zip_fixed_bl, fixed_bd;	// inflate static
var zip_bit_buf;		// bit buffer
var zip_bit_len;		// bits in bit buffer
var zip_method;
var zip_eof;
var zip_copy_leng;
var zip_copy_dist;
var zip_tl, zip_td;	// literal/length and distance decoder tables
var zip_bl, zip_bd;	// number of bits decoded by tl and td

var zip_inflate_data;
var zip_inflate_pos;


/* constant tables (inflate) */
var zip_MASK_BITS = new Array(
    0x0000,
    0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff,
    0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff, 0x3fff, 0x7fff, 0xffff);
// Tables for deflate from PKZIP's appnote.txt.
var zip_cplens = new Array( // Copy lengths for literal codes 257..285
    3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
    35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0);
/* note: see note #13 above about the 258 in this list. */
var zip_cplext = new Array( // Extra bits for literal codes 257..285
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
    3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99); // 99==invalid
var zip_cpdist = new Array( // Copy offsets for distance codes 0..29
    1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
    257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
    8193, 12289, 16385, 24577);
var zip_cpdext = new Array( // Extra bits for distance codes
    0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
    7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
    12, 12, 13, 13);
var zip_border = new Array(  // Order of the bit length code lengths
    16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15);
/* objects (inflate) */

var zip_HuftList = function() {
    this.next = null;
    this.list = null;
}

var zip_HuftNode = function() {
    this.e = 0; // number of extra bits or operation
    this.b = 0; // number of bits in this code or subcode

    // union
    this.n = 0; // literal, length base, or distance base
    this.t = null; // (zip_HuftNode) pointer to next level of table
}

var zip_HuftBuild = function(b,	// code lengths in bits (all assumed <= BMAX)
		       n,	// number of codes (assumed <= N_MAX)
		       s,	// number of simple-valued codes (0..s-1)
		       d,	// list of base values for non-simple codes
		       e,	// list of extra bits for non-simple codes
		       mm	// maximum lookup bits
		   ) {
    this.BMAX = 16;   // maximum bit length of any code
    this.N_MAX = 288; // maximum number of codes in any set
    this.status = 0;	// 0: success, 1: incomplete table, 2: bad input
    this.root = null;	// (zip_HuftList) starting table
    this.m = 0;		// maximum lookup bits, returns actual

/* Given a list of code lengths and a maximum table size, make a set of
   tables to decode that set of codes.	Return zero on success, one if
   the given code set is incomplete (the tables are still built in this
   case), two if the input is invalid (all zero length codes or an
   oversubscribed set of lengths), and three if not enough memory.
   The code with value 256 is special, and the tables are constructed
   so that no bits beyond that code are fetched when that code is
   decoded. */
    {
	var a;			// counter for codes of length k
	var c = new Array(this.BMAX+1);	// bit length count table
	var el;			// length of EOB code (value 256)
	var f;			// i repeats in table every f entries
	var g;			// maximum code length
	var h;			// table level
	var i;			// counter, current code
	var j;			// counter
	var k;			// number of bits in current code
	var lx = new Array(this.BMAX+1);	// stack of bits per table
	var p;			// pointer into c[], b[], or v[]
	var pidx;		// index of p
	var q;			// (zip_HuftNode) points to current table
	var r = new zip_HuftNode(); // table entry for structure assignment
	var u = new Array(this.BMAX); // zip_HuftNode[BMAX][]  table stack
	var v = new Array(this.N_MAX); // values in order of bit length
	var w;
	var x = new Array(this.BMAX+1);// bit offsets, then code stack
	var xp;			// pointer into x or c
	var y;			// number of dummy codes added
	var z;			// number of entries in current table
	var o;
	var tail;		// (zip_HuftList)

	tail = this.root = null;
	for(i = 0; i < c.length; i++)
	    c[i] = 0;
	for(i = 0; i < lx.length; i++)
	    lx[i] = 0;
	for(i = 0; i < u.length; i++)
	    u[i] = null;
	for(i = 0; i < v.length; i++)
	    v[i] = 0;
	for(i = 0; i < x.length; i++)
	    x[i] = 0;

	// Generate counts for each bit length
	el = n > 256 ? b[256] : this.BMAX; // set length of EOB code, if any
	p = b; pidx = 0;
	i = n;
	do {
	    c[p[pidx]]++;	// assume all entries <= BMAX
	    pidx++;
	} while(--i > 0);
	if(c[0] == n) {	// null input--all zero length codes
	    this.root = null;
	    this.m = 0;
	    this.status = 0;
	    return;
	}

	// Find minimum and maximum length, bound *m by those
	for(j = 1; j <= this.BMAX; j++)
	    if(c[j] != 0)
		break;
	k = j;			// minimum code length
	if(mm < j)
	    mm = j;
	for(i = this.BMAX; i != 0; i--)
	    if(c[i] != 0)
		break;
	g = i;			// maximum code length
	if(mm > i)
	    mm = i;

	// Adjust last length count to fill out codes, if needed
	for(y = 1 << j; j < i; j++, y <<= 1)
	    if((y -= c[j]) < 0) {
		this.status = 2;	// bad input: more codes than bits
		this.m = mm;
		return;
	    }
	if((y -= c[i]) < 0) {
	    this.status = 2;
	    this.m = mm;
	    return;
	}
	c[i] += y;

	// Generate starting offsets into the value table for each length
	x[1] = j = 0;
	p = c;
	pidx = 1;
	xp = 2;
	while(--i > 0)		// note that i == g from above
	    x[xp++] = (j += p[pidx++]);

	// Make a table of values in order of bit lengths
	p = b; pidx = 0;
	i = 0;
	do {
	    if((j = p[pidx++]) != 0)
		v[x[j]++] = i;
	} while(++i < n);
	n = x[g];			// set n to length of v

	// Generate the Huffman codes and for each, make the table entries
	x[0] = i = 0;		// first Huffman code is zero
	p = v; pidx = 0;		// grab values in bit order
	h = -1;			// no tables yet--level -1
	w = lx[0] = 0;		// no bits decoded yet
	q = null;			// ditto
	z = 0;			// ditto

	// go through the bit lengths (k already is bits in shortest code)
	for(; k <= g; k++) {
	    a = c[k];
	    while(a-- > 0) {
		// here i is the Huffman code of length k bits for value p[pidx]
		// make tables up to required level
		while(k > w + lx[1 + h]) {
		    w += lx[1 + h]; // add bits already decoded
		    h++;

		    // compute minimum size table less than or equal to *m bits
		    z = (z = g - w) > mm ? mm : z; // upper limit
		    if((f = 1 << (j = k - w)) > a + 1) { // try a k-w bit table
			// too few codes for k-w bit table
			f -= a + 1;	// deduct codes from patterns left
			xp = k;
			while(++j < z) { // try smaller tables up to z bits
			    if((f <<= 1) <= c[++xp])
				break;	// enough codes to use up j bits
			    f -= c[xp];	// else deduct codes from patterns
			}
		    }
		    if(w + j > el && w < el)
			j = el - w;	// make EOB code end at table
		    z = 1 << j;	// table entries for j-bit table
		    lx[1 + h] = j; // set table size in stack

		    // allocate and link in new table
		    q = new Array(z);
		    for(o = 0; o < z; o++) {
			q[o] = new zip_HuftNode();
		    }

		    if(tail == null)
			tail = this.root = new zip_HuftList();
		    else
			tail = tail.next = new zip_HuftList();
		    tail.next = null;
		    tail.list = q;
		    u[h] = q;	// table starts after link

		    /* connect to last table, if there is one */
		    if(h > 0) {
			x[h] = i;		// save pattern for backing up
			r.b = lx[h];	// bits to dump before this table
			r.e = 16 + j;	// bits in this table
			r.t = q;		// pointer to this table
			j = (i & ((1 << w) - 1)) >> (w - lx[h]);
			u[h-1][j].e = r.e;
			u[h-1][j].b = r.b;
			u[h-1][j].n = r.n;
			u[h-1][j].t = r.t;
		    }
		}

		// set up table entry in r
		r.b = k - w;
		if(pidx >= n)
		    r.e = 99;		// out of values--invalid code
		else if(p[pidx] < s) {
		    r.e = (p[pidx] < 256 ? 16 : 15); // 256 is end-of-block code
		    r.n = p[pidx++];	// simple code is just the value
		} else {
		    r.e = e[p[pidx] - s];	// non-simple--look up in lists
		    r.n = d[p[pidx++] - s];
		}

		// fill code-like entries with r //
		f = 1 << (k - w);
		for(j = i >> w; j < z; j += f) {
		    q[j].e = r.e;
		    q[j].b = r.b;
		    q[j].n = r.n;
		    q[j].t = r.t;
		}

		// backwards increment the k-bit code i
		for(j = 1 << (k - 1); (i & j) != 0; j >>= 1)
		    i ^= j;
		i ^= j;

		// backup over finished tables
		while((i & ((1 << w) - 1)) != x[h]) {
		    w -= lx[h];		// don't need to update q
		    h--;
		}
	    }
	}

	/* return actual size of base table */
	this.m = lx[1];

	/* Return true (1) if we were given an incomplete table */
	this.status = ((y != 0 && g != 1) ? 1 : 0);
    } /* end of constructor */
}


/* routines (inflate) */

var zip_GET_BYTE = function() {
    if(zip_inflate_data.length == zip_inflate_pos)
	return -1;
    return zip_inflate_data.charCodeAt(zip_inflate_pos++) & 0xff;
}

var zip_NEEDBITS = function(n) {
    while(zip_bit_len < n) {
	zip_bit_buf |= zip_GET_BYTE() << zip_bit_len;
	zip_bit_len += 8;
    }
}

var zip_GETBITS = function(n) {
    return zip_bit_buf & zip_MASK_BITS[n];
}

var zip_DUMPBITS = function(n) {
    zip_bit_buf >>= n;
    zip_bit_len -= n;
}

var zip_inflate_codes = function(buff, off, size) {
    /* inflate (decompress) the codes in a deflated (compressed) block.
       Return an error code or zero if it all goes ok. */
    var e;		// table entry flag/number of extra bits
    var t;		// (zip_HuftNode) pointer to table entry
    var n;

    if(size == 0)
      return 0;

    // inflate the coded data
    n = 0;
    for(;;) {			// do until end of block
	zip_NEEDBITS(zip_bl);
	t = zip_tl.list[zip_GETBITS(zip_bl)];
	e = t.e;
	while(e > 16) {
	    if(e == 99)
		return -1;
	    zip_DUMPBITS(t.b);
	    e -= 16;
	    zip_NEEDBITS(e);
	    t = t.t[zip_GETBITS(e)];
	    e = t.e;
	}
	zip_DUMPBITS(t.b);

	if(e == 16) {		// then it's a literal
	    zip_wp &= zip_WSIZE - 1;
	    buff[off + n++] = zip_slide[zip_wp++] = t.n;
	    if(n == size)
		return size;
	    continue;
	}

	// exit if end of block
	if(e == 15)
	    break;

	// it's an EOB or a length

	// get length of block to copy
	zip_NEEDBITS(e);
	zip_copy_leng = t.n + zip_GETBITS(e);
	zip_DUMPBITS(e);

	// decode distance of block to copy
	zip_NEEDBITS(zip_bd);
	t = zip_td.list[zip_GETBITS(zip_bd)];
	e = t.e;

	while(e > 16) {
	    if(e == 99)
		return -1;
	    zip_DUMPBITS(t.b);
	    e -= 16;
	    zip_NEEDBITS(e);
	    t = t.t[zip_GETBITS(e)];
	    e = t.e;
	}
	zip_DUMPBITS(t.b);
	zip_NEEDBITS(e);
	zip_copy_dist = zip_wp - t.n - zip_GETBITS(e);
	zip_DUMPBITS(e);

	// do the copy
	while(zip_copy_leng > 0 && n < size) {
	    zip_copy_leng--;
	    zip_copy_dist &= zip_WSIZE - 1;
	    zip_wp &= zip_WSIZE - 1;
	    buff[off + n++] = zip_slide[zip_wp++]
		= zip_slide[zip_copy_dist++];
	}

	if(n == size)
	    return size;
    }

    zip_method = -1; // done
    return n;
}

var zip_inflate_stored = function(buff, off, size) {
    /* "decompress" an inflated type 0 (stored) block. */
    var n;

    // go to byte boundary
    n = zip_bit_len & 7;
    zip_DUMPBITS(n);

    // get the length and its complement
    zip_NEEDBITS(16);
    n = zip_GETBITS(16);
    zip_DUMPBITS(16);
    zip_NEEDBITS(16);
    if(n != ((~zip_bit_buf) & 0xffff))
	return -1;			// error in compressed data
    zip_DUMPBITS(16);

    // read and output the compressed data
    zip_copy_leng = n;

    n = 0;
    while(zip_copy_leng > 0 && n < size) {
	zip_copy_leng--;
	zip_wp &= zip_WSIZE - 1;
	zip_NEEDBITS(8);
	buff[off + n++] = zip_slide[zip_wp++] =
	    zip_GETBITS(8);
	zip_DUMPBITS(8);
    }

    if(zip_copy_leng == 0)
      zip_method = -1; // done
    return n;
}

var zip_inflate_fixed = function(buff, off, size) {
    /* decompress an inflated type 1 (fixed Huffman codes) block.  We should
       either replace this with a custom decoder, or at least precompute the
       Huffman tables. */

    // if first time, set up tables for fixed blocks
    if(zip_fixed_tl == null) {
	var i;			// temporary variable
	var l = new Array(288);	// length list for huft_build
	var h;	// zip_HuftBuild

	// literal table
	for(i = 0; i < 144; i++)
	    l[i] = 8;
	for(; i < 256; i++)
	    l[i] = 9;
	for(; i < 280; i++)
	    l[i] = 7;
	for(; i < 288; i++)	// make a complete, but wrong code set
	    l[i] = 8;
	zip_fixed_bl = 7;

	h = new zip_HuftBuild(l, 288, 257, zip_cplens, zip_cplext,
			      zip_fixed_bl);
	if(h.status != 0) {
	    alert("HufBuild error: "+h.status);
	    return -1;
	}
	zip_fixed_tl = h.root;
	zip_fixed_bl = h.m;

	// distance table
	for(i = 0; i < 30; i++)	// make an incomplete code set
	    l[i] = 5;
	zip_fixed_bd = 5;

	h = new zip_HuftBuild(l, 30, 0, zip_cpdist, zip_cpdext, zip_fixed_bd);
	if(h.status > 1) {
	    zip_fixed_tl = null;
	    alert("HufBuild error: "+h.status);
	    return -1;
	}
	zip_fixed_td = h.root;
	zip_fixed_bd = h.m;
    }

    zip_tl = zip_fixed_tl;
    zip_td = zip_fixed_td;
    zip_bl = zip_fixed_bl;
    zip_bd = zip_fixed_bd;
    return zip_inflate_codes(buff, off, size);
}

var zip_inflate_dynamic = function(buff, off, size) {
    // decompress an inflated type 2 (dynamic Huffman codes) block.
    var i;		// temporary variables
    var j;
    var l;		// last length
    var n;		// number of lengths to get
    var t;		// (zip_HuftNode) literal/length code table
    var nb;		// number of bit length codes
    var nl;		// number of literal/length codes
    var nd;		// number of distance codes
    var ll = new Array(286+30); // literal/length and distance code lengths
    var h;		// (zip_HuftBuild)

    for(i = 0; i < ll.length; i++)
	ll[i] = 0;

    // read in table lengths
    zip_NEEDBITS(5);
    nl = 257 + zip_GETBITS(5);	// number of literal/length codes
    zip_DUMPBITS(5);
    zip_NEEDBITS(5);
    nd = 1 + zip_GETBITS(5);	// number of distance codes
    zip_DUMPBITS(5);
    zip_NEEDBITS(4);
    nb = 4 + zip_GETBITS(4);	// number of bit length codes
    zip_DUMPBITS(4);
    if(nl > 286 || nd > 30)
      return -1;		// bad lengths

    // read in bit-length-code lengths
    for(j = 0; j < nb; j++)
    {
	zip_NEEDBITS(3);
	ll[zip_border[j]] = zip_GETBITS(3);
	zip_DUMPBITS(3);
    }
    for(; j < 19; j++)
	ll[zip_border[j]] = 0;

    // build decoding table for trees--single level, 7 bit lookup
    zip_bl = 7;
    h = new zip_HuftBuild(ll, 19, 19, null, null, zip_bl);
    if(h.status != 0)
	return -1;	// incomplete code set

    zip_tl = h.root;
    zip_bl = h.m;

    // read in literal and distance code lengths
    n = nl + nd;
    i = l = 0;
    while(i < n) {
	zip_NEEDBITS(zip_bl);
	t = zip_tl.list[zip_GETBITS(zip_bl)];
	j = t.b;
	zip_DUMPBITS(j);
	j = t.n;
	if(j < 16)		// length of code in bits (0..15)
	    ll[i++] = l = j;	// save last length in l
	else if(j == 16) {	// repeat last length 3 to 6 times
	    zip_NEEDBITS(2);
	    j = 3 + zip_GETBITS(2);
	    zip_DUMPBITS(2);
	    if(i + j > n)
		return -1;
	    while(j-- > 0)
		ll[i++] = l;
	} else if(j == 17) {	// 3 to 10 zero length codes
	    zip_NEEDBITS(3);
	    j = 3 + zip_GETBITS(3);
	    zip_DUMPBITS(3);
	    if(i + j > n)
		return -1;
	    while(j-- > 0)
		ll[i++] = 0;
	    l = 0;
	} else {		// j == 18: 11 to 138 zero length codes
	    zip_NEEDBITS(7);
	    j = 11 + zip_GETBITS(7);
	    zip_DUMPBITS(7);
	    if(i + j > n)
		return -1;
	    while(j-- > 0)
		ll[i++] = 0;
	    l = 0;
	}
    }

    // build the decoding tables for literal/length and distance codes
    zip_bl = zip_lbits;
    h = new zip_HuftBuild(ll, nl, 257, zip_cplens, zip_cplext, zip_bl);
    if(zip_bl == 0)	// no literals or lengths
	h.status = 1;
    if(h.status != 0) {
	if(h.status == 1)
	    ;// **incomplete literal tree**
	return -1;		// incomplete code set
    }
    zip_tl = h.root;
    zip_bl = h.m;

    for(i = 0; i < nd; i++)
	ll[i] = ll[i + nl];
    zip_bd = zip_dbits;
    h = new zip_HuftBuild(ll, nd, 0, zip_cpdist, zip_cpdext, zip_bd);
    zip_td = h.root;
    zip_bd = h.m;

    if(zip_bd == 0 && nl > 257) {   // lengths but no distances
	// **incomplete distance tree**
	return -1;
    }

    if(h.status == 1) {
	;// **incomplete distance tree**
    }
    if(h.status != 0)
	return -1;

    // decompress until an end-of-block code
    return zip_inflate_codes(buff, off, size);
}

var zip_inflate_start = function() {
    var i;

    if(zip_slide == null)
	zip_slide = new Array(2 * zip_WSIZE);
    zip_wp = 0;
    zip_bit_buf = 0;
    zip_bit_len = 0;
    zip_method = -1;
    zip_eof = false;
    zip_copy_leng = zip_copy_dist = 0;
    zip_tl = null;
}

var zip_inflate_internal = function(buff, off, size) {
    // decompress an inflated entry
    var n, i;

    n = 0;
    while(n < size) {
	if(zip_eof && zip_method == -1)
	    return n;

	if(zip_copy_leng > 0) {
	    if(zip_method != zip_STORED_BLOCK) {
		// STATIC_TREES or DYN_TREES
		while(zip_copy_leng > 0 && n < size) {
		    zip_copy_leng--;
		    zip_copy_dist &= zip_WSIZE - 1;
		    zip_wp &= zip_WSIZE - 1;
		    buff[off + n++] = zip_slide[zip_wp++] =
			zip_slide[zip_copy_dist++];
		}
	    } else {
		while(zip_copy_leng > 0 && n < size) {
		    zip_copy_leng--;
		    zip_wp &= zip_WSIZE - 1;
		    zip_NEEDBITS(8);
		    buff[off + n++] = zip_slide[zip_wp++] = zip_GETBITS(8);
		    zip_DUMPBITS(8);
		}
		if(zip_copy_leng == 0)
		    zip_method = -1; // done
	    }
	    if(n == size)
		return n;
	}

	if(zip_method == -1) {
	    if(zip_eof)
		break;

	    // read in last block bit
	    zip_NEEDBITS(1);
	    if(zip_GETBITS(1) != 0)
		zip_eof = true;
	    zip_DUMPBITS(1);

	    // read in block type
	    zip_NEEDBITS(2);
	    zip_method = zip_GETBITS(2);
	    zip_DUMPBITS(2);
	    zip_tl = null;
	    zip_copy_leng = 0;
	}

	switch(zip_method) {
	  case 0: // zip_STORED_BLOCK
	    i = zip_inflate_stored(buff, off + n, size - n);
	    break;

	  case 1: // zip_STATIC_TREES
	    if(zip_tl != null)
		i = zip_inflate_codes(buff, off + n, size - n);
	    else
		i = zip_inflate_fixed(buff, off + n, size - n);
	    break;

	  case 2: // zip_DYN_TREES
	    if(zip_tl != null)
		i = zip_inflate_codes(buff, off + n, size - n);
	    else
		i = zip_inflate_dynamic(buff, off + n, size - n);
	    break;

	  default: // error
	    i = -1;
	    break;
	}

	if(i == -1) {
	    if(zip_eof)
		return 0;
	    return -1;
	}
	n += i;
    }
    return n;
}

var zip_inflate = function(str) {
    var i, j;

    zip_inflate_start();
    zip_inflate_data = str;
    zip_inflate_pos = 0;

    var buff = new Array(1024);
    var aout = [];
    while((i = zip_inflate_internal(buff, 0, buff.length)) > 0) {
	var cbuf = new Array(i);
	for(j = 0; j < i; j++){
	    cbuf[j] = String.fromCharCode(buff[j]);
	}
	aout[aout.length] = cbuf.join("");
    }
    zip_inflate_data = null; // G.C.
    return aout.join("");
}

if (! window.RawDeflate) RawDeflate = {};
RawDeflate.inflate = zip_inflate;

})();
function GenomeViewer(targetId, species, args) {
	var _this=this;
	this.id = "GenomeViewer"+ Math.round(Math.random()*10000);
	this.menuBar = null;
	
	// if not provided on instatiation
	this.width =  $(document).width();
	this.height = $(document).height();
	this.targetId=null;
	
	//Default values
	this.species="hsa";
	this.speciesName="Homo sapiens";
	this.increment = 5;
	this.zoom=100;
	
	//Setting paramaters
	if (targetId != null){
		this.targetId=targetId;
	}
	if (species != null) {
		this.species = species.species;
		this.speciesName = species.name;
		this.chromosome = species.chromosome;//this is a string
		this.position = parseInt(species.position);
	}
	if (args != null){
		if(args.toolbar != null){
			this.toolbar = args.toolbar;
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.availableSpecies != null) {
			this.setSpeciesMenu(args.availableSpecies);
		}
		if (args.chromosome != null) {
			this.chromosome = args.chromosome;
		}
		if (args.position != null) {//middle browser window
			this.position = parseInt(args.position);
		}
	}

	//Events i send
	this.onSpeciesChange = new Event();
	this.onLocationChange = new Event();
	this.afterLocationChange = new Event();
	this.afterRender = new Event();
	
	//Events i listen
	this.onLocationChange.addEventListener(function(sender,data){
		_this.setLoc(data);
	});

//	this.geneBioTypeColors = this.getGeneBioTypeColors();
//	this.snpBioTypeColors = this.getSnpBioTypeColors();
	
	// useful logs
	console.log(this.width+"x"+this.height);
	console.log(this.targetId);
	console.log(this.id);
	
};

GenomeViewer.prototype.draw = function(){
	//interface
	this.render();
//	this.getData();
};
GenomeViewer.prototype.render = function(){
	var _this = this;
//	var items = [];
//	if(this.toolbar!=null){
//		items.push(this.toolbar);
//	}
//	items.push(this._getNavigationBar());
//	//items.push(this._getKaryotypePanel().hide());
//	items.push(this._drawChromosomePanel());
//	items.push(this._drawKaryotypePanel().hide());
//	//items.push(this._getChromosomePanel());
//
////	items.push(this._getWindowSizePanel());
//	items.push(this._drawTracksPanel());
//	items.push(this._drawRegionPanel().hide());
//	items.push(this._getBottomBar());
	
	var container = Ext.create('Ext.container.Container', {
		id:this.id+"container",
		renderTo:this.targetId,
    	width:this.width,
    	height:this.height,
		cls:'x-unselectable',
		layout: { type: 'vbox',align: 'stretch'},
		region : 'center',
		margins : '0 0 0 0'
	});
	
	if(this.toolbar!=null){
		container.insert(0, this.toolbar);
	}
	
	//The last item is regionPanel
	//when all items are inserted afterRender is notified, tracks can be added now
	var regionPanel = this._drawRegionPanel();
	regionPanel.on("afterrender", function(){
		var div = $('#'+_this.id+"tracksSvg")[0];
		_this.trackSvgLayout = new TrackSvgLayout(div,{
			width:_this.width-18,
			position:_this.position,
			chromosome:_this.chromosome,
			zoom : _this.zoom
		});
		_this.trackSvgLayout.onMove.addEventListener(function(sender,data){
			_this.onLocationChange.notify({position:data,sender:"trackSvgLayout"});
		});
		
		var div = $('#'+_this.id+"regionSvg")[0];
		_this.trackSvgLayout2 = new TrackSvgLayout(div,{
			width:_this.width-18,
			position:_this.position,
			chromosome:_this.chromosome,
			zoom : _this.zoom,
			zoomOffset:40,
			parentLayout:_this.trackSvgLayout
		});
		
		_this.afterRender.notify();
	});
	
	
	container.insert(1, this._getNavigationBar());
	container.insert(2, this._drawKaryotypePanel().hide());
	container.insert(3, this._drawChromosomePanel());
	container.insert(4, this._drawTracksPanel());
	container.insert(5, this._getBottomBar());
	container.insert(3, regionPanel);//rendered after trackspanel but inserted with minor index
	
	Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
	Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.chromosome);
	Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
};

GenomeViewer.prototype.setSize = function(width,height) {
	Ext.getCmp(this.id+"container").setSize(width,height);
};

GenomeViewer.prototype.setLoc = function(data) {
	console.log(data.sender);
//	this.chromosomeFeatureTrack.select(data.position-1000, data.position+1000);

	switch(data.sender){
	case "setSpecies": 
		this.species = data.species;
		this.speciesName = data.name;
		this.position = data.position;
		this.chromosome = data.chromosome;
		Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
		Ext.getCmp(this.id+"speciesMenuButton").setText(this.speciesName);
		Ext.example.msg('Species', this.speciesName+' selected.');
		this._updateChrStore();
		this.trackSvgLayout.setLocation({chromosome:this.chromosome,species:this.species,position:this.position});
		this.trackSvgLayout2.setLocation({chromosome:this.chromosome,species:this.species,position:this.position});
		this.chromosomeWidget.setLocation({chromosome:this.chromosome,species:this.species,position:this.position});
		this.karyotypeWidget.setLocation({chromosome:this.chromosome,species:this.species,position:this.position});
		this.onSpeciesChange.notify();
		break;
	case "_getChromosomeMenu":
		if(this.chromosome!=data.chromosome){
			this.chromosome = data.chromosome;
			this.trackSvgLayout.setLocation({chromosome:this.chromosome});
			this.trackSvgLayout2.setLocation({chromosome:this.chromosome});
			this.chromosomeWidget.setLocation({chromosome:this.chromosome});
			this.karyotypeWidget.setLocation({chromosome:this.chromosome,position:this.position});
		}
		Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
		Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.chromosome);
		break;
	case "GoButton":
		var obj = {};
		if(data.position != null && this.position != data.position){
			this.position = data.position;
			obj.position = this.position;
		}
		if(data.chromosome != null && this.chromosome != data.chromosome){
			this.chromosome = data.chromosome;
			obj.chromosome = this.chromosome;
			Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
			Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.chromosome);
		}
		if(Object.keys(obj).length>0){ //if obj has change
			this.trackSvgLayout.setLocation(obj);
			this.trackSvgLayout2.setLocation(obj);
			this.chromosomeWidget.setLocation(obj);
			this.karyotypeWidget.setLocation(obj);
		}
		break;
	case "KaryotypePanel":
		var obj = {};
		if(data.position != null && this.position != data.position){
			this.position = data.position;
			obj.position = this.position;
		}
		if(data.chromosome != null && this.chromosome != data.chromosome){
			this.chromosome = data.chromosome;
			obj.chromosome = this.chromosome;
			Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
			Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.chromosome);
		}
		if(Object.keys(obj).length>0){ //if obj has changeç
			this.trackSvgLayout.setLocation(obj);
			this.trackSvgLayout2.setLocation(obj);
			this.chromosomeWidget.setLocation(obj);
			
			Ext.getCmp(this.id+'tbCoordinate').setValue(this.chromosome + ":" + Math.ceil(this.position));
			this.karyotypeWidget.updatePositionBox({chromosome:this.chromosome,position:this.position});
		}
		break;
	case "ChromosomeWidget":
		this.position = data.position;
		this.trackSvgLayout.setLocation({position:this.position});
		this.trackSvgLayout2.setLocation({position:this.position});
		this.karyotypeWidget.setLocation({position:this.position});
		Ext.getCmp(this.id+'tbCoordinate').setValue(this.chromosome + ":" + Math.ceil(this.position));
		break;
	case "trackSvgLayout":
		this.position -= data.position;
		Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
		this.chromosomeWidget.setLocation({position:this.position});
		this.karyotypeWidget.setLocation({position:this.position});
		break;
	default:
		var obj = {};
		if(data.species != null){
			this.species = data.species;
			obj.species = this.species;
			Ext.example.msg('Species', this.speciesName+' selected.');
			this.onSpeciesChange.notify();
		}
		if(data.name != null){
			this.speciesName = data.name;
			obj.speciesName = this.speciesName;
		}
		if(data.position != null){
			this.position = data.position;
			obj.position = this.position;
		}
		if(data.chromosome != null){
			this.chromosome = data.chromosome;
			obj.chromosome = this.chromosome;
		}
		Ext.getCmp(this.id+"chromosomeMenuButton").setText("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+"chromosomePanel").setTitle("Chromosome "+this.chromosome);
		Ext.getCmp(this.id+'tbCoordinate').setValue( this.chromosome + ":" + Math.ceil(this.position));
		Ext.getCmp(this.id+"speciesMenuButton").setText(this.speciesName);
		this._updateChrStore();
		this.trackSvgLayout.setLocation(obj);
		this.trackSvgLayout2.setLocation(obj);
		this.chromosomeWidget.setLocation(obj);
		this.karyotypeWidget.setLocation(obj);
		
	}
};


//XXX
//XXX
//XXX
//XXX
//XXX SENCHA ITEMS
//XXX
//XXX
//XXX
//XXX
//XXX

//NAVIGATION BAR
GenomeViewer.prototype._getNavigationBar = function() {
	var _this = this;

	var searchResults = Ext.create('Ext.data.Store', {
		fields: ["xrefId","displayId","description"]
	});
	
	var searchCombo = Ext.create('Ext.form.field.ComboBox', {
		id : this.id+'quickSearch',
		displayField: 'displayId',
		valueField: 'displayId',
		emptyText:'Quick search: gene, transcript',
		hideTrigger: true,
		width:200,
		store: searchResults,
		queryMode: 'local',
//		typeAhead:true,
		queryDelay: 500,
		listeners:{
			change:function(){
				var value = this.getValue();
				var min = 2;
				if(value && value.substring(0,3).toUpperCase() == "ENS"){
					min = 10;
				}
				if(value && value.length > min){
					$.ajax({
						url:new CellBaseManager().host+"/latest/"+_this.species+"/feature/id/"+this.getValue()+"/starts_with?of=json",
						success:function(data, textStatus, jqXHR){
							var d = JSON.parse(data);
							searchResults.loadData(d[0]);
						},
						error:function(jqXHR, textStatus, errorThrown){console.log(textStatus);}
					});
				}
			},
			select: function(field, e){
				_this._handleNavigationBar('GoToGene');
			}
		}
	});
	
	var navToolbar = Ext.create('Ext.toolbar.Toolbar', {
		id:this.id+"navToolbar",
		cls:"bio-toolbar",
		border:true,
		height:35,
		enableOverflow:true,//if the field is hidden getValue() reads "" because seems the hidden field is a different object
		items : [
		         {
		        	 id:this.id+"speciesMenuButton",
		        	 text : this.speciesName,
		        	 menu: this._getSpeciesMenu()			
		         },{
		        	 id: this.id + "chromosomeMenuButton",
		        	 text : 'Chromosome',
		        	 menu: this._getChromosomeMenu()			
		         },
		         '-',
		         {
		        	 id:this.id+"karyotypeButton",
		        	 text : 'Karyotype',
		        	 enableToggle:true,
		        	 pressed:false,
		        	 toggleHandler:function() {
		        		 if(this.pressed){
		        			 Ext.getCmp(_this.id+"karyotypePanel").show();
		        		 }else{
		        			 Ext.getCmp(_this.id+"karyotypePanel").hide();
		        		 }
		        	 }
		         },
		         {
		        	 id:this.id+"ChromosomeToggleButton",
		        	 text : 'Chromosome',
		        	 enableToggle:true,
		        	 pressed:true,
		        	 toggleHandler:function() {
		        		 if(this.pressed){
		        			 Ext.getCmp(_this.id+"chromosomePanel").show();
		        		 }else{
		        			 Ext.getCmp(_this.id+"chromosomePanel").hide();
		        		 }
		        	 }
		         },
		         {
		        	 id:this.id+"RegionToggleButton",
		        	 text : 'Region',
		        	 enableToggle:true,
		        	 pressed:true,
		        	 toggleHandler:function() {
		        		 if(this.pressed){
		        			 Ext.getCmp(_this.id+"regionPanel").show();
		        		 }else{
		        			 Ext.getCmp(_this.id+"regionPanel").hide();
		        		 }
		        	 }
		         },
		         '-',
//		         {
//		        	 id:this.id+"left1posButton",
//		        	 text : '<',
//		        	 margin : '0 0 0 15',
//		        	 handler : function() {
//		        		 _this._handleNavigationBar('<');
//		        	 }
//		         }, 
		         {
		        	 id:this.id+"zoomOutButton",
		        	 margin : '0 0 0 10',
		        	 iconCls:'icon-zoom-out',
		        	 listeners : {
		        		 click:{
		        			 fn :function() {
		        				 var current = Ext.getCmp(_this.id+'zoomSlider').getValue();
		        				 Ext.getCmp(_this.id+'zoomSlider').setValue(current-_this.increment);
		        			 }
//		        			 buffer : 300
		        		 }
		        	 }
		         }, 
		         this._getZoomSlider(), 
		         {
		        	 id:this.id+"zoomInButton",
		        	 margin:'0 5 0 0',
		        	 iconCls:'icon-zoom-in',
		        	 listeners : {
		        		 click:{
		        			 fn :function() {
		        				 var current = Ext.getCmp(_this.id+'zoomSlider').getValue();
		        				 Ext.getCmp(_this.id+'zoomSlider').setValue(current+_this.increment);
		        			 }
//		        			 buffer : 300
		        		 }
		        	 }
		         },'-',
//		         {
//		        	 id:this.id+"right1posButton",
//		        	 text : '>',
//		        	 handler : function() {
//		        		 _this._handleNavigationBar('>');
//		        	 }
//		         },
		         {
		        	 id:this.id+"positionLabel",
		        	 xtype : 'label',
		        	 text : 'Position:',
		        	 margins : '0 0 0 10'
		         },{
		        	 id : this.id+'tbCoordinate',
		        	 xtype : 'textfield',
		        	 width : 120,
		        	 text : this.chromosome + ":" + this.position,
		        	 listeners:{
		        		 specialkey: function(field, e){
		        			 if (e.getKey() == e.ENTER) {
		        				 _this._handleNavigationBar('Go');
		        			 }
		        		 }
		        	 }
		         },{
		        	 id : this.id+'GoButton',
		        	 text : 'Go',
		        	 handler : function() {
		        		 _this._handleNavigationBar('Go');
		        	 }
		         },'->',
//		         {
//		        	 id : this.id+'searchLabel',
//		        	 xtype : 'label',
//		        	 text : 'Quick search:',
//		        	 margins : '0 0 0 10'
//		         },
		         searchCombo,
//		         {
//		        	 id : this.id+'quickSearch',
//		        	 xtype : 'textfield',
//		        	 emptyText:'gene, protein, transcript',
//		        	 name : 'field1',
//		        	 listeners:{
//		        		 specialkey: function(field, e){
//		        			 if (e.getKey() == e.ENTER) {
//		        				 _this._handleNavigationBar('GoToGene');
//		        			 }
//		        		 },
//		        		 change: function(){
//		        			 	var str = this.getValue();
//		        			 	if(str.length > 3){
//		        			 		console.log(this.getValue());
//		        			 	}
//					     }
//		        	 }
//		         },
		         {
		        	 id : this.id+'GoToGeneButton',
		        	 iconCls:'icon-find',
		        	 handler : function() {
		        		 _this._handleNavigationBar('GoToGene');
		        	 }
		         }]
	});
	return navToolbar;
	

};

//Creates the species empty menu if not exist and returns it
GenomeViewer.prototype._getSpeciesMenu = function() {
	//items must be added by using  setSpeciesMenu()
	if(this._specieMenu == null){
		this._specieMenu = Ext.create('Ext.menu.Menu', {
			id:this.id+"_specieMenu",
			margin : '0 0 10 0',
			floating : true,
			items : []
		});
	}
	return this._specieMenu;
};
//Sets the species buttons in the menu
GenomeViewer.prototype.setSpeciesMenu = function(speciesObj) {
	var _this = this;
	//Auto generate menu items depending of AVAILABLE_SPECIES config
	var menu = this._getSpeciesMenu();
	menu.hide();//Hide the menu panel before remove
	menu.removeAll(); // Remove the old species
	for ( var i = 0; i < speciesObj.length; i++) {
		menu.add({	
					id:this.id+speciesObj[i].name,
					text:speciesObj[i].name,
					speciesObj:speciesObj[i],
					handler:function(este){
						//can't use the i from the FOR so i create the object again
						_this.setSpecies(este.speciesObj);
				}
		});
	};
};
//Sets the new specie and fires an event
GenomeViewer.prototype.setSpecies = function(data){
	data["sender"]="setSpecies";
	this.onLocationChange.notify(data);
};

GenomeViewer.prototype._getChromosomeMenu = function() {
	var _this = this;
	var chrStore = Ext.create('Ext.data.Store', {
		id:this.id+"chrStore",
		fields: ["name"],
		autoLoad:false
	});
	/*Chromolendar*/
 	var chrView = Ext.create('Ext.view.View', {
 		id:this.id+"chrView",
 		width:125,
 		style:'background-color:#fff',
 		store : chrStore,
 		selModel: {
 			mode: 'SINGLE',
 			listeners: {
 				selectionchange:function(este,selNodes){
 					if(selNodes.length>0){
 						_this.onLocationChange.notify({sender:"_getChromosomeMenu",chromosome:selNodes[0].data.name});
// 					_this.setChromosome(selNodes[0].data.name);
 					}
 					chromosomeMenu.hide();
 				}
 			}
 		},
 		cls: 'list',
 		trackOver: true,
 		overItemCls: 'list-item-hover',
 		itemSelector: '.chromosome-item', 
 		tpl: '<tpl for="."><div style="float:left" class="chromosome-item">{name}</div></tpl>'
//	        tpl: '<tpl for="."><div class="chromosome-item">chr {name}</div></tpl>'
 	});
	/*END chromolendar*/
 	
 	var chromosomeMenu = Ext.create('Ext.menu.Menu', {
 		id:this.id+"chromosomeMenu",
 		almacen :chrStore,
		items : [chrView]
	});
 	this._updateChrStore();
	return chromosomeMenu;
};

GenomeViewer.prototype._updateChrStore = function(){
	var _this = this;
	var chrStore = Ext.getStore(this.id+"chrStore");
	var chrView = Ext.getCmp(this.id+"chrView");
	var cellBaseManager = new CellBaseManager(this.species);
 	cellBaseManager.get("feature", "karyotype", "none", "chromosome");
 	cellBaseManager.success.addEventListener(function(sender,data){
 		var chromosomeData = [];
 		var sortfunction = function(a, b) {
 			var IsNumber = true;
 			for (var i = 0; i < a.length && IsNumber == true; i++) {
 				if (isNaN(a[i])) {
 					IsNumber = false;
 				}
 			}
 			if (!IsNumber) return 1;
 			return (a - b);
 		};
 		data.result.sort(sortfunction);
		for (var i = 0; i < data.result.length; i++) {
			chromosomeData.push({'name':data.result[i]});
		}
		chrStore.loadData(chromosomeData);
//		chrView.getSelectionModel().select(chrStore.find("name",_this.chromosome));
 	});
};

GenomeViewer.prototype._getZoomSlider = function() {
	var _this = this;
	if(this._zoomSlider==null){
		this._zoomSlider = Ext.create('Ext.slider.Single', {
			id : this.id+'zoomSlider',
			width : 200,
			minValue : 0,
			maxValue : 100,
			value : this.zoom,
			useTips : true,
			increment : this.increment,
			tipText : function(thumb) {
				return Ext.String.format('<b>{0}%</b>', thumb.value);
			}
		});
		
		this._zoomSlider.on({
			'change': {
				fn: function(slider, newValue) {
				 _this._handleNavigationBar("ZOOM", newValue);
   			 },
   			 buffer : 300
   			 }
		});
	}
	return this._zoomSlider;
};

GenomeViewer.prototype._disableZoomElements = function(){
	//disable sencha elements till render gets finished
	Ext.getCmp(this.id+'zoomSlider').disable();
	Ext.getCmp(this.id+"zoomOutButton").disable();
	Ext.getCmp(this.id+"zoomInButton").disable();
};
GenomeViewer.prototype._enableZoomElements = function(){
	Ext.getCmp(this.id+'zoomSlider').enable();
	Ext.getCmp(this.id+"zoomOutButton").enable();
	Ext.getCmp(this.id+"zoomInButton").enable();
};

GenomeViewer.prototype.setZoom = function(zoom) {
	var _this = this;
	
	this.zoom = zoom;
	this._getZoomSlider().setValue(zoom);
	if(this.trackSvgLayout!=null){
		this.trackSvgLayout.setZoom(zoom);
		this.trackSvgLayout2.setZoom(zoom);
	}
	this.chromosomeWidget.setZoom(zoom);
};

//Action for buttons located in the NavigationBar
GenomeViewer.prototype._handleNavigationBar = function(action, args) {
//	var _this = this;
    if (action == 'OptionMenuClick'){
            this.genomeWidget.showTranscripts = Ext.getCmp("showTranscriptCB").checked;
            this.genomeWidgetProperties.setShowTranscripts(Ext.getCmp("showTranscriptCB").checked);
            this.refreshMasterGenomeViewer();
    }
    if (action == 'ZOOM'){
    	this.setZoom(args);
    }
    if (action == 'GoToGene'){
        var geneName = Ext.getCmp(this.id+'quickSearch').getValue();
        this.openGeneListWidget(geneName);
    }
    if (action == '+'){
//  	var zoom = this.genomeWidgetProperties.getZoom();
    	var zoom = this.zoom;
    	if (zoom < 100){
    		this.setZoom(zoom + this.increment);
    	}
    }
    if (action == '-'){
//    	 var zoom = this.genomeWidgetProperties.getZoom();
    	 var zoom = this.zoom;
  	   if (zoom >= 5){
  		   this.setZoom(zoom - this.increment);
  	   }
    }
    
    if (action == 'Go'){
    	var value = Ext.getCmp(this.id+'tbCoordinate').getValue();
        var position = parseInt(value.split(":")[1]);
        var chromosome = value.split(":")[0];
        
        // Validate chromosome and position
        if(isNaN(position) || position < 0){
        	Ext.getCmp(this.id+'tbCoordinate').markInvalid("Position must be a positive number");
        }
        else if(Ext.getCmp(this.id+"chromosomeMenu").almacen.find("name", chromosome) == -1){
        	Ext.getCmp(this.id+'tbCoordinate').markInvalid("Invalid chromosome");
        }
        else{
        	this.onLocationChange.notify({chromosome:chromosome,position:position,sender:"GoButton"});
        }
        
    }
};


GenomeViewer.prototype._drawKaryotypePanel = function() {
	var _this = this;
	var panel =  Ext.create('Ext.panel.Panel', {
		id:this.id+"karyotypePanel",
		height : 200,
		title:'Karyotype',
		border:false,
		margin:'0 0 1 0',
		cls:'border-bot panel-border-top',
		html: '<div id="'+this.id+'karyotypeSvg" style="margin-top:2px"></div>',
		listeners:{
			afterrender:function(){
				var div = $('#'+_this.id+"karyotypeSvg")[0];
				_this.karyotypeWidget = new KaryotypeWidget(div,{
					width:_this.width,
					height:168,
					species:_this.species,
					chromosome:_this.chromosome,
					zoom:_this.zoom,
					position:_this.position
				});
				_this.karyotypeWidget.onClick.addEventListener(function(sender,data){
					_this.onLocationChange.notify({position:data.position,chromosome:data.chromosome,sender:"KaryotypePanel"});
				});
				_this.karyotypeWidget.drawKaryotype();
			}
		}
	});
	return panel;
};


GenomeViewer.prototype._drawChromosomePanel = function() {
	var _this = this;
	var panel =  Ext.create('Ext.panel.Panel', {
		id:this.id+"chromosomePanel",
		height : 95,
		title:'Chromosome',
		border:false,
		margin:'0 0 1 0',
		cls:'border-bot panel-border-top',
		html: '<div id="'+this.id+'chromosomeSvg" style="margin-top:2px"></div>',
		listeners:{
			afterrender:function(){
				var div = $('#'+_this.id+"chromosomeSvg")[0];
				_this.chromosomeWidget = new ChromosomeWidget(div,{
					width:_this.width,
					height:65,
					species:_this.species,
					chromosome:_this.chromosome,
					zoom:_this.zoom,
					position:_this.position
				});
				_this.chromosomeWidget.onClick.addEventListener(function(sender,data){
					_this.onLocationChange.notify({position:data,sender:"ChromosomeWidget"});
				});
				_this.chromosomeWidget.drawChromosome();
			}
		}
	});
	return panel;
};


GenomeViewer.prototype._drawRegionPanel = function() {
	var _this=this;
	var panel =  Ext.create('Ext.panel.Panel', {
		id:this.id+"regionPanel",
		height : 150,
		title:'Region',
		border:false,
		autoScroll:true,
		margin:'0 0 1 0',
		cls:'border-bot panel-border-top x-unselectable',
		html: '<div id="'+this.id+'regionSvg" style="margin-top:2px"></div>'
	});
	return panel;
};

GenomeViewer.prototype._drawTracksPanel = function() {
	var _this=this;
	var panel = Ext.create('Ext.panel.Panel', {
		id:this.id+"tracksPanel",
		title:'Detailed Information',
		autoScroll:true,
		cls:"x-unselectable",
		flex: 1,
		html:'<div id = "'+this.id+'tracksSvg"></div>'
	});
	return panel;
};

GenomeViewer.prototype.addTrack = function(trackData, args) {
	this.trackSvgLayout.addTrack(trackData, args);
};

GenomeViewer.prototype.removeTrack = function(trackId) {
	this.trackSvgLayout.removeTrack(trackId);
};

GenomeViewer.prototype.showTrack = function(trackId) {
	this.trackSvgLayout._showTrack(trackId);
};

GenomeViewer.prototype.hideTrack = function(trackId) {
	this.trackSvgLayout._hideTrack(trackId);
};

GenomeViewer.prototype.checkRenderedTrack = function(trackId) {
	if(this.trackSvgLayout.swapHash[trackId]){
		return true;
	}
	return false;
};


//XXX BOTTOM BAR

GenomeViewer.prototype._getBottomBar = function() {
	var geneLegendPanel = new LegendPanel({title:'Gene legend'});
	var snpLegendPanel = new LegendPanel({title:'SNP legend'});
	
//	var scaleLabel = Ext.create('Ext.draw.Component', {
//		id:this.id+"scaleLabel",
//        width: 100,
//        height: 20,
//        items:[
//            {type: 'text',text: 'Scale number',fill: '#000000',x: 10,y: 9,width: 5, height: 20},
//            {type: 'rect',fill: '#000000',x: 0,y: 0,width: 2, height: 20},
//			{type: 'rect',fill: '#000000',x: 2,y: 12, width: 100,height: 3},
//			{type: 'rect',fill: '#000000',x: 101,y: 0, width: 2,height: 20}
//		]
//	});
//	scale.surface.items.items[0].setAttributes({text:'num'},true);
	
	var versionLabel = Ext.create('Ext.toolbar.TextItem', {
		id:this.id+"versionLabel",
		text:''
	});
	
	var taskbar = Ext.create('Ext.toolbar.Toolbar', {
		id:this.id+'uxTaskbar',
		winMgr: new Ext.ZIndexManager(),
		enableOverflow:true,
		cls: 'bio-hiddenbar',
		height:28,
		flex:1
	});
	
	var legendBar = Ext.create('Ext.toolbar.Toolbar', {
		id:this.id+'legendBar',
		cls: 'bio-hiddenbar',
		width:220,
		height:28,
		items : [/*scaleLabel, */
		         '-',
		         geneLegendPanel.getButton(GENE_BIOTYPE_COLORS),
		         snpLegendPanel.getButton(SNP_BIOTYPE_COLORS),
		         '->',versionLabel]
	});
	
	var bottomBar = Ext.create('Ext.container.Container', {
		id:this.id+'bottomBar',
		layout:'hbox',
		cls:"bio-botbar x-unselectable",
		height:30,
		border:true,
		items : [taskbar,legendBar]
	});
	return bottomBar;
};
//BOTTOM BAR




GenomeViewer.prototype.openListWidget = function(args) {
	var _this = this;
	
	console.log(args.query)
	
	var cellBaseManager = new CellBaseManager(this.species);
	cellBaseManager.success.addEventListener(function(evt, data) {
		var genomicListWidget = new GenomicListWidget(_this.species,{title:args.title, gridFields:args.gridField,viewer:_this});
		
		genomicListWidget.draw(data);
		
		genomicListWidget.onSelected.addEventListener(function(evt, feature) {
//			console.log(feature);
			if (feature != null && feature.chromosome != null) {
				if(_this.chromosome!= feature.chromosome || _this.position != feature.start){
					_this.setLoc({sender:"",chromosome:feature.chromosome, position:feature.start});
				}
			}
		});
		
		genomicListWidget.onTrackAddAction.addEventListener(function(evt, event) {
				var track = new TrackData(event.fileName,{
					adapter: event.adapter
				});
				_this.trackSvgLayout.addTrack(track,{
					id:event.fileName,
					featuresRender:"MultiFeatureRender",
//					histogramZoom:80,
					height:150,
					visibleRange:{start:0,end:100},
					featureTypes:FEATURE_TYPES
				});
		});
	});
	cellBaseManager.get(args.category, args.subcategory, args.query, args.resource, args.params);
};
GenomeViewer.prototype.openGeneListWidget = function(name) {
	this.openListWidget({
		category:"feature",
		subcategory:"id",
		query:name.toString(),
		resource:"gene",
		title:"Gene List"
	});
};

GenomeViewer.prototype.openTranscriptListWidget = function(name) {
//	this.openListWidget({
//		category:"feature",
//		subcategory:"transcript",
//		query:name.toString(),
//		resource:"info",
//		title:"Transcript List",
//		gridField:["externalName","stableId", "biotype", "chromosome", "start", "end", "strand", "description"]
//	});
};

GenomeViewer.prototype.openExonListWidget = function(name) {
//	this.openListWidget({
//		category:"feature",
//		subcategory:"exon",
//		query:name.toString(),
//		resource:"info",
//		title:"Exon List",
//		gridField:["stableId", "chromosome","start", "end", "strand"]
//	});
};

GenomeViewer.prototype.openSNPListWidget = function(name) {
	this.openListWidget({
		category:"feature",
		subcategory:"id",
		query:name.toString(),
		resource:"snp",
		title:"SNP List",
		gridField:["name", "variantAlleles", "ancestralAllele", "mapWeight",  "position", "sequence"]
	});
};

GenomeViewer.prototype.openGOListWidget = function(name) {
	this.openListWidget({
		category:"feature",
		subcategory:"id",
		query:name.toString(),
		resource:"gene",
		title:"Gene List by GO"
	});
};
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
	console.time("Multirender");
//	console.log(featureList.length);
	
	var middle = this.width/2;
	
	var draw = function(feature, start, end){
		var width = (end-start)+1;
		console.log(width)
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
					style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'}
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
							style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'}
						});
						$([rect,text]).click(function(event){
							var query = this.getAttribute("widgetId");
							_this.showInfoWidget({query:query, /*feature:transcript,*/ featureType:transcript.featureType});
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
	console.timeEnd("Multirender");
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
					style: { width:true, classes: 'ui-tooltip-light ui-tooltip-shadow'}
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
	'length:&nbsp;<span class="info">'+(args.feature.end-args.feature.start+1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+'</span><br>';
	return str;
};

TrackSvg.prototype.formatTitleTip = function(args){
	var str="";
	
	//Remove "_" and UpperCase first letter
	var format = function (str){
		var s = str.replace(/_/gi, " ");
		s = s.charAt(0).toUpperCase() + s.slice(1);
		return s;
	};
	
	switch (args.feature.featureType) {
	case "snp":
		str += format(args.feature.featureType) +
		' - <span class="ok">'+args.feature.name+'</span>';
		break;
	case "gene":
		str += format(args.feature.featureType) +
		' - <span class="ok">'+args.feature.externalName+'</span>';
		break;
	case "transcript":
		str += format(args.feature.featureType) +
		' - <span class="ok">'+args.feature.externalName+'</span>';	
		break;
	case undefined:
		str += "Feature";
		break;
	default: str += format(args.feature.featureType); break;
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
function TrackSvgLayout(parent, args) {//parent is a DOM div element
	var _this = this;
	this.args = args;
	this.id = Math.round(Math.random()*10000000);
	
	this.trackDataList =  new Array();
	this.trackSvgList =  new Array();
	this.swapHash = new Object();
	this.zoomOffset = 0;//for region overview panel, that will keep zoom higher, 0 by default
	this.parentLayout = null;
	
	
	//default values
	this.height=25;
	
	if (args != null){
		if(args.width != null){
			this.width = args.width;
		}
		if(args.height != null){
			this.height = args.height;
		}
		if(args.position != null){
			this.position = args.position;
		}
		if(args.chromosome != null){
			this.chromosome = args.chromosome;
		}
		if(args.zoomOffset != null){
			this.zoomOffset = args.zoomOffset;
		}
		if(args.zoom != null){
			this.zoom = args.zoom-this.zoomOffset;
		}
		if(args.parentLayout != null){
			this.parentLayout = args.parentLayout;
		}
	}
	
	this._createPixelsbyBase();//create pixelByBase array
	this.pixelBase = this._getPixelsbyBase(this.zoom);
	this.halfVirtualBase = (this.width*3/2) / this.pixelBase;
	
	
	//SVG structure and events initialization
	this.onZoomChange = new Event();
	this.onChromosomeChange = new Event();
	this.onMove = new Event();
	
	
	
	//Flags 
	this.onFeaturesRendered = new Event(); //used when location or zoom is modified, to avoid repeated calls
	
	
	//Main SVG and his events
	this.svg = SVG.init(parent,{
		"width":this.width,
		"height":this.height
	});
	
	var patt = SVG.addChild(this.svg,"pattern",{
		"id":this.id+"gridPatt",
		"patternUnits":"userSpaceOnUse",
		"x":0,
		"y":0,
		"width":10,
		"height":2000
	});
	
	var grid = SVG.addChild(patt,"rect",{
		"x":0,
		"y":25,
		"width":1,
		"height":2000,
		"opacity":"0.1",
		"fill":"grey"
	});
	
	var grid2 = SVG.addChild(this.svg,"rect",{
		"width":this.width,
		"height":2000,
		"x":0,
		"fill":"url(#"+this.id+"gridPatt)"
	});
	
	var mid = this.width/2;
	this.positionText = SVG.addChild(this.svg,"text",{
		"x":mid-30,
		"y":22,
		"font-size":10,
		"fill":"green"
	});
	this.firstPositionText = SVG.addChild(this.svg,"text",{
		"x":0,
		"y":22,
		"font-size":10,
		"fill":"green"
	});
	this.lastPositionText = SVG.addChild(this.svg,"text",{
		"x":this.width-70,
		"y":22,
		"font-size":10,
		"fill":"green"
	});
	this._setTextPosition();
	
	
	this.viewNtsArrow = SVG.addChild(this.svg,"rect",{
		"x":16,
		"y":2,
		"width":this.width-32,
		"height":10,
		"opacity":"0.7",
		"fill":"grey"
	});
	this.viewNtsArrowLeft = SVG.addChild(this.svg,"polyline",{
		"points":"0,7 16,0 16,14",
		"opacity":"0.7",
		"fill":"grey"
	});
	this.viewNtsArrowRight = SVG.addChild(this.svg,"polyline",{
		"points":this.width+",7 "+(this.width-16)+",0 "+(this.width-16)+",14",
		"opacity":"0.7",
		"fill":"grey"
	});
	this.viewNtsText = SVG.addChild(this.svg,"text",{
		"x":mid-30,
		"y":11,
		"font-size":10,
		"fill":"white"
	});
	this.viewNtsText.textContent = "Viewing "+Math.ceil((this.width)/this.pixelBase).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+" nts";
	
	
	this.currentLine = SVG.addChild(this.svg,"rect",{
		"x":mid,
		"y":this.height,
		"width":this.pixelBase,
		"height":this.height,
		"stroke-width":"2",
		"stroke":"orangered",
		"opacity":"0.5",
		"fill":"orange"
	});

	if(this.parentLayout==null){
		//Main svg  movement events
//		this.svg.setAttribute("cursor", "move");
		$(this.svg).mousedown(function(event) {
			var downX = event.clientX;
			var lastX = 0;
			$(this).mousemove(function(event){
				var newX = (downX - event.clientX)/_this.pixelBase | 0;//truncate always towards zero
				if(newX!=lastX){
					var desp = lastX-newX;
					_this.position -= desp;
					_this._setTextPosition();
					_this.onMove.notify(desp);
					lastX = newX;
				}
			});
		});
		$(this.svg).mouseup(function(event) {
//			this.setAttribute("cursor", "default");
			$(this).off('mousemove');
//			$(this).focus();// without this, the keydown does not work
		});
		$(this.svg).mouseleave(function(event) {
//			this.setAttribute("cursor", "default");
			$(this).off('mousemove');
		});
		
		
		var enableKeys = function(){
			//keys
			$("body").keydown(function(e) {
				var desp = 0;
				switch (e.keyCode){
					case 37://left arrow
						if(e.ctrlKey){
							desp = 100/_this.pixelBase;
						}else{
							desp = 10/_this.pixelBase;
						}
					break;
					case 39://right arrow
						if(e.ctrlKey){
							desp = -100/_this.pixelBase;
						}else{
							desp = -10/_this.pixelBase;
						}
					break;
					case 109://minus key
						if(e.shiftKey){
							console.log("zoom out");
						}
					break;
					case 107://plus key
						if(e.shiftKey){
							console.log("zoom in");
						}
					break;
				}
				if(desp != 0){
					_this.position -= desp;
					_this._setTextPosition();
					_this.onMove.notify(desp);
				}
			});
		};
		
		
		
		$(this.svg).focusin(function(e) {
			enableKeys();
		});
		$(this.svg).click(function(e) {
			$("body").off('keydown');
			enableKeys();
		});
		$(this.svg).focusout(function(e) {
			$("body").off('keydown');
		});

		$(this.svg).focus();// without this, the keydown does not work
		
	}else{
		_this.parentLayout.onMove.addEventListener(function(sender,desp){
			_this.position -= desp;
			_this._setTextPosition();
			_this.onMove.notify(desp);
		});
	}
};

TrackSvgLayout.prototype.setHeight = function(height){
	this.height=height;
	this.svg.setAttribute("height",height);
	this.currentLine.setAttribute("height",parseInt(height)-25);//25 es el margen donde esta el texto de la posicion
};
TrackSvgLayout.prototype.setZoom = function(zoom){
	this.zoom=Math.max(zoom-this.zoomOffset, -5);
//	console.log(this.zoom);
//	console.log(this._getPixelsbyBase(this.zoom));
	this.pixelBase = this._getPixelsbyBase(this.zoom);
	this.halfVirtualBase = (this.width*3/2) / this.pixelBase;
	this.currentLine.setAttribute("width", this.pixelBase);
	this.viewNtsText.textContent = "Viewing "+Math.ceil((this.width)/this.pixelBase).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")+" nts";
	this._setTextPosition();
	this.onZoomChange.notify();
};
TrackSvgLayout.prototype.setLocation = function(item){//item.chromosome, item.position, item.species
	if(item.chromosome!=null){
		this.chromosome = item.chromosome;
	}
	if(item.position!=null){
		this.position = parseInt(item.position);//check int, must be a number
		this._setTextPosition();
	}
	if(item.species!=null){
		//check species and modify CellBaseAdapter, clean cache
		for(i in this.trackDataList){
			if(this.trackDataList[i].adapter instanceof CellBaseAdapter){
				this.trackDataList[i].adapter.species = item.species;
				this.trackDataList[i].adapter.featureCache.clear();
			}
		}
	}
	this.onChromosomeChange.notify();
};



TrackSvgLayout.prototype.addTrack = function(trackData, args){
	var _this = this;
	var visibleRange = args.visibleRange;
	
	args["position"] = this.position;
	args["trackData"] = trackData;
	args["zoom"] = this.zoom;
	args["pixelBase"] = this.pixelBase;
	args["width"] = this.width;
	
	var i = this.trackDataList.push(trackData);
	var trackSvg = new TrackSvg(this.svg,args);
	
	this.trackSvgList.push(trackSvg);
	this.swapHash[trackSvg.id] = {index:i-1,visible:true};
	trackSvg.setY(this.height);
	trackSvg.draw();
	this.setHeight(this.height + trackSvg.getHeight());
	
	
	
	
	//XXX help methods
	var callStart, callEnd, virtualStart, vitualEnd;
	var setCallRegion = function (){
		//needed call variables
		callStart = parseInt(_this.position - _this.halfVirtualBase*2);
		callEnd = parseInt(_this.position + _this.halfVirtualBase*2);
		virtualStart = parseInt(_this.position - _this.halfVirtualBase);//for now
		vitualEnd = parseInt(_this.position + _this.halfVirtualBase);//for now
	};
	var checkHistogramZoom = function(){
		if(_this.zoom <= trackSvg.histogramZoom){
			trackSvg.histogram = true;
			trackSvg.interval = Math.max(512, 5/_this.pixelBase);//server interval limit 512
//			console.log(trackData.adapter.featureCache);
		}else{
			trackSvg.histogram = null;
		}
	};
	var checkTranscriptZoom = function(){ //for genes only
		if(trackSvg.transcriptZoom != null && _this.zoom >= trackSvg.transcriptZoom){
			trackSvg.transcript=true;
		}else{
			trackSvg.transcript=null;
		}
	};
	var cleanSvgFeatures = function(){
		$(trackSvg.features).empty();
		trackData.adapter.featureCache.featuresAdded = {};
		trackSvg.renderedArea = {};
	};
	//END help methods
	
	
	
	//EventListeners
	//Watch out!!!
	//this event must be attached before any "trackData.retrieveData()" call
	trackSvg.onGetDataIdx = trackData.adapter.onGetData.addEventListener(function(sender,event){
		if(event.params.histogram == true){
			trackSvg.featuresRender = trackSvg.HistogramRender;
		}else{
			trackSvg.featuresRender = trackSvg.defaultRender;
		}
		
		console.timeEnd("insertCache");
		_this.setHeight(_this.height - trackSvg.getHeight());//modify height before redraw
		trackSvg.featuresRender(event.data);
//		console.log(trackData.adapter.featureCache);
		_this.setHeight(_this.height + trackSvg.getHeight());//modify height after redraw 
		_this._redraw();
	});
	
	
	//first load, get virtual window and retrieve data
	checkHistogramZoom();
	checkTranscriptZoom();//for genes only
	setCallRegion();
	trackData.retrieveData({chromosome:this.chromosome,start:virtualStart,end:vitualEnd, histogram:trackSvg.histogram, interval:trackSvg.interval, transcript:trackSvg.transcript});
	
	
	//on zoom change set new virtual window and update track values
	trackSvg.onZoomChangeIdx = this.onZoomChange.addEventListener(function(sender,data){
		trackSvg.zoom=_this.zoom;
		trackSvg.pixelBase=_this.pixelBase;
		
		checkHistogramZoom();
		checkTranscriptZoom();//for genes only
		cleanSvgFeatures();
		setCallRegion();
		
		// check if track is visible in this zoom
		if(_this.zoom >= visibleRange.start-_this.zoomOffset && _this.zoom <= visibleRange.end){
			trackData.retrieveData({chromosome:_this.chromosome,start:virtualStart,end:vitualEnd, histogram:trackSvg.histogram, interval:trackSvg.interval, transcript:trackSvg.transcript});
			trackSvg.invalidZoomText.setAttribute("visibility", "hidden");
		}else{
			trackSvg.invalidZoomText.setAttribute("visibility", "visible");
		}
	});

	
	//on chromosome change set new virtual window and update track values
	trackSvg.onChromosomeChangeIdx = this.onChromosomeChange.addEventListener(function(sender,data){
		trackSvg.position=_this.position;
		
		cleanSvgFeatures();
		setCallRegion();
		// check if track is visible in this zoom
		if(_this.zoom >= visibleRange.start-_this.zoomOffset && _this.zoom <= visibleRange.end){
			trackData.retrieveData({chromosome:_this.chromosome,start:virtualStart,end:vitualEnd, histogram:trackSvg.histogram, interval:trackSvg.interval, transcript:trackSvg.transcript});
		}
	});
	

	//movement listeners 
	trackSvg.onMoveIdx = this.onMove.addEventListener(function(sender,desp){
		trackSvg.position -= desp;
		var despBase = desp*_this.pixelBase;
		trackSvg.pixelPosition-=despBase;

		//parseFloat important 
		var move =  parseFloat(trackSvg.features.getAttribute("x")) + despBase;
		trackSvg.features.setAttribute("x",move);

		// check if track is visible in this zoom
		if(_this.zoom >= visibleRange.start && _this.zoom <= visibleRange.end){
			virtualStart = parseInt(trackSvg.position - _this.halfVirtualBase);
			virtualEnd = parseInt(trackSvg.position + _this.halfVirtualBase);

			if(desp<0 && virtualEnd > callEnd){
				trackData.retrieveData({chromosome:_this.chromosome,start:callEnd,end:parseInt(callEnd+_this.halfVirtualBase), histogram:trackSvg.histogram, interval:trackSvg.interval, transcript:trackSvg.transcript});
				callEnd = parseInt(callEnd+_this.halfVirtualBase);
//				$(trackSvg.features).empty();
//				console.log(callEnd);
			}

			if(desp>0 && virtualStart < callStart){
				trackData.retrieveData({chromosome:_this.chromosome,start:parseInt(callStart-_this.halfVirtualBase),end:callStart, histogram:trackSvg.histogram, interval:trackSvg.interval, transcript:trackSvg.transcript});
				callStart = parseInt(callStart-_this.halfVirtualBase);
//				$(trackSvg.features).empty();
//				console.log(callStart);
			}
		}
	});
	
	
	
	
	
	//track buttons
	//XXX se puede mover?
	$(trackSvg.upRect).bind("click",function(event){
		_this._reallocateAbove(this.parentNode.parentNode.id);//"this" is the svg element
	});
	$(trackSvg.downRect).bind("click",function(event){
		_this._reallocateUnder(this.parentNode.parentNode.id);//"this" is the svg element
	});
	$(trackSvg.hideRect).bind("click",function(event){
		_this._hideTrack(this.parentNode.parentNode.id);//"this" is the svg element
	});
	$(trackSvg.settingsRect).bind("click",function(event){
		console.log("settings click");//"this" is the svg element
	});
	

};

TrackSvgLayout.prototype.removeTrack = function(trackId){
	// first hide the track
	this._hideTrack(trackId);
	
	var position = this.swapHash[trackId].index;
	
	// delete listeners
	this.onZoomChange.removeEventListener(this.trackSvgList[position].onZoomChangeIdx);
	this.onChromosomeChange.removeEventListener(this.trackSvgList[position].onChromosomeChangeIdx);
	this.onMove.removeEventListener(this.trackSvgList[position].onMoveIdx);

	// delete data
	this.trackSvgList.splice(position, 1);
	this.trackDataList.splice(position, 1);
	delete this.swapHash[trackId];
	
};

TrackSvgLayout.prototype._redraw = function(){
	var _this = this;
	var trackSvg = null;
	var lastY = 25;
	for ( var i = 0; i < this.trackSvgList.length; i++) {
		trackSvg = this.trackSvgList[i];
		if(this.swapHash[trackSvg.id].visible){
			trackSvg.main.setAttribute("y",lastY);
			lastY += trackSvg.getHeight();
		}
	}
};

//This routine is called when track order modified
TrackSvgLayout.prototype._reallocateAbove = function(trackMainId){
	var i = this.swapHash[trackMainId].index;
	console.log(i+" quiere moverse 1 posicion arriba");
	if(i>0){
		var aboveTrack=this.trackSvgList[i-1];
		var underTrack=this.trackSvgList[i];
		
		var y = parseInt(aboveTrack.main.getAttribute("y"));
		var h = parseInt(underTrack.main.getAttribute("height"));
		aboveTrack.main.setAttribute("y",y+h);
		underTrack.main.setAttribute("y",y);
		
		this.trackSvgList[i] = aboveTrack;
		this.trackSvgList[i-1] = underTrack;
		this.swapHash[aboveTrack.id].index=i;
		this.swapHash[underTrack.id].index=i-1;
	}else{
		console.log("ya esta en la mas alta");
	}
};
//This routine is called when track order modified
TrackSvgLayout.prototype._reallocateUnder = function(trackMainId){
	var i = this.swapHash[trackMainId].index;
	console.log(i+" quiere moverse 1 posicion abajo");
	if(i+1<this.trackDataList.length){
		var aboveTrack=this.trackSvgList[i];
		var underTrack=this.trackSvgList[i+1];
		
		var y = parseInt(aboveTrack.main.getAttribute("y"));
		var h = parseInt(underTrack.main.getAttribute("height"));
		aboveTrack.main.setAttribute("y",y+h);
		underTrack.main.setAttribute("y",y);
		
		this.trackSvgList[i] = underTrack;
		this.trackSvgList[i+1] = aboveTrack;
		this.swapHash[underTrack.id].index=i;
		this.swapHash[aboveTrack.id].index=i+1;
		
	}else{
		console.log("abajo del todo");
	}
};

TrackSvgLayout.prototype._hideTrack = function(trackMainId){
	this.swapHash[trackMainId].visible=false;
	var i = this.swapHash[trackMainId].index;
	var track = this.trackSvgList[i];
	this.svg.removeChild(track.main);
	
	this.setHeight(this.height - track.getHeight());
	
	this._redraw();
	
	var _this= this;
//	setTimeout(function() {
//		_this._showTrack(trackMainId);
//	},2000);
};

TrackSvgLayout.prototype._showTrack = function(trackMainId){
	this.swapHash[trackMainId].visible=true;
	var i = this.swapHash[trackMainId].index;
	var track = this.trackSvgList[i];
	this.svg.appendChild(track.main);
	
	this.setHeight(this.height + track.getHeight());
	
	this._redraw();
};


TrackSvgLayout.prototype._getPixelsbyBase = function(zoom){
	return this.zoomLevels[zoom];
};

TrackSvgLayout.prototype._createPixelsbyBase = function(){
	this.zoomLevels = new Array();
	var pixelsByBase = 10;
	for ( var i = 100; i >= -40; i-=5) {
		this.zoomLevels[i] = pixelsByBase;
		pixelsByBase = pixelsByBase / 2;
	}
};

TrackSvgLayout.prototype._setTextPosition = function(){
	this.positionText.textContent = this.position.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
	var x = Math.floor((this.width)/this.pixelBase/2);
	this.firstPositionText.textContent = (this.position-x).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
	this.lastPositionText.textContent = (this.position+x-1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
};
function TrackData(id, args) {
	this.id = id;
	if (args != null){
		if(args.adapter != null){
			this.adapter = args.adapter;
//			console.log(this.adapter);
		}
		if(args.gzip != null){
			this.gzip = args.gzip;
		}
	}
};

TrackData.prototype.retrieveData = function(region){
	this.adapter.getData(region);
};
function FeatureCache(args) {
	this.args = args;
	this.id = Math.round(Math.random() * 10000000); // internal id for this class

	this.chunkSize = 50000;
	this.gzip = true;
	this.maxSize = 10*1024*1024;
	this.size = 0;
	
	if (args != null){
		if(args.chunkSize != null){
			this.chunkSize = args.chunkSize;
		}
		if(args.gzip != null){
			this.gzip = args.gzip;
		}
	}
	
	this.cache = {};
	this.featuresAdded = {};
	
	this.maxFeaturesInterval = 0;
};

FeatureCache.prototype._getChunk = function(position){
	return Math.floor(position/this.chunkSize);
};

FeatureCache.prototype.getChunkRegion = function(region){
	start = this._getChunk(region.start) * this.chunkSize;
	end = (this._getChunk(region.end) * this.chunkSize) + this.chunkSize-1;
	return {start:start,end:end};
};


FeatureCache.prototype.getFeaturesByChunk = function(key, dataType){
	var features =  [];
	var feature;
	
	if(this.cache[key] != null && this.cache[key][dataType] != null) {
		for ( var i = 0, len = this.cache[key][dataType].length; i < len; i++) {
			if(this.gzip) {
				feature = JSON.parse(RawDeflate.inflate(this.cache[key][dataType][i]));
			}else{
				feature = this.cache[key][dataType][i];
			}
			if(this.featuresAdded[feature.chromosome+":"+feature.start+"-"+feature.end]!=true){
				features.push(feature);
				this.featuresAdded[feature.chromosome+":"+feature.start+"-"+feature.end]=true;
			}
//			features.push(feature);
		}
		return features;
	}
	
	return null;
};


FeatureCache.prototype.putFeaturesByRegion = function(featureDataList, region, featureType, dataType){
	var key,firstChunk,lastChunk,feature;
	
	//initialize region
	firstChunk = this._getChunk(region.start);
	lastChunk = this._getChunk(region.end);
	for(var i=firstChunk; i<=lastChunk; i++){
		key = region.chromosome+":"+i;
		if(this.cache[key]==null){
			this.cache[key] = {};
		}
		if(this.cache[key][dataType]==null){
			this.cache[key][dataType] = [];
		}
	}
	
	//Check if is a single object
	if(featureDataList.constructor != Array){
		featureDataList = [featureDataList];
	}
	
	for(var index = 0, len = featureDataList.length; index<len; index++) {
		feature = featureDataList[index];
		feature.featureType = featureType;
		firstChunk = this._getChunk(feature.start);
		lastChunk = this._getChunk(feature.end);
		for(var i=firstChunk; i<=lastChunk; i++) {
			key = feature.chromosome+":"+i;
			/*XXX la feature no tiene chromosoma, una feature de histograma no tiene chromosoma, cojo el de la region para que vaya */
			if(feature.chromosome==null){
				key = region.chromosome+":"+i;
			}
			/*XXX*/
			if(this.cache[key] != null && this.cache[key][dataType] != null){
				if(this.gzip) {
					this.cache[key][dataType].push(RawDeflate.deflate(JSON.stringify(feature)));
				}else{
					this.cache[key][dataType].push(feature);
				}
			}
		}
	}
};


FeatureCache.prototype.getFeaturesByRegion = function(region, dataType){
	var firstChunk = this._getChunk(region.start);
	var lastChunk = this._getChunk(region.end);
	var features =  [];
	var feature, key;
	var returnNull = true;
	for(var i=firstChunk; i<=lastChunk; i++){
//		console.log("Chunk: "+i)
		key = region.chromosome+":"+i;
		// check if this key exists in cache (features from files)
		if(this.cache[key] != null && this.cache[key][dataType] != null){
			for ( var j = 0, len = this.cache[key][dataType].length; j < len; j++) {
				if(this.gzip) {
					feature = JSON.parse(RawDeflate.inflate(this.cache[key][dataType][j]));
				}else{
					feature = this.cache[key][dataType][j];
				}
				if(this.featuresAdded[feature.chromosome+":"+feature.start+"-"+feature.end]!=true){
					// we only get those features in the region
					if(feature.end > region.start && feature.start < region.end){
						features.push(feature);
						returnNull = false;
					}
					this.featuresAdded[feature.chromosome+":"+feature.start+"-"+feature.end]=true;
				}
			}
		}
	}
	if(returnNull){
		return null;
	}else{
		return features;
	}
};




FeatureCache.prototype.remove = function(region){
	var firstChunk = this._getChunk(region.start);
	var lastChunk = this._getChunk(region.end);
	for(var i=firstChunk; i<=lastChunk; i++){
		var key = region.chromosome+":"+i;
		this.cache[key] = null;
	}
};

FeatureCache.prototype.clear = function(){
		this.size = 0;		
		this.cache = {};
};

FeatureCache.prototype.clearType = function(dataType){
	this.cache[dataType] = null;
};







//XXX need revision
FeatureCache.prototype.putFeatures = function(featureDataList, dataType){
	var feature, key, firstChunk, lastChunk;

	//Check if is a single object
	if(featureDataList.constructor != Array){
		var featureData = featureDataList;
		featureDataList = [featureData];
	}

	for(var index = 0, len = featureDataList.length; index<len; index++) {
		feature = featureDataList[index];
		firstChunk = this._getChunk(feature.start);
		lastChunk = this._getChunk(feature.end);
		for(var i=firstChunk; i<=lastChunk; i++) {
			key = feature.chromosome+":"+i;
			if(this.cache[key]==null){
				this.cache[key] = [];
			}
			if(this.cache[key][dataType]==null){
				this.cache[key][dataType] = [];
			}
			if(this.gzip) {
				this.cache[key][dataType].push(RawDeflate.deflate(JSON.stringify(feature)));
			}else{
				this.cache[key][dataType].push(feature);
			}

		}
	}
};

FeatureCache.prototype.putChunk = function(featureDataList, chunkRegion, dataType){
	var feature, key, chunk;
	chunk = this._getChunk(chunkRegion.start);
	key = chunkRegion.chromosome+":"+chunk;

	if(this.cache[key]==null){
		this.cache[key] = [];
	}
	if(this.cache[key][dataType]==null){
		this.cache[key][dataType] = [];
	}

	if(featureDataList.constructor == Object){
		if(this.gzip) {
			this.cache[key][dataType].push(RawDeflate.deflate(JSON.stringify(featureDataList)));
		}else{
			this.cache[key][dataType].push(featureDataList);
		}
	}else{
		for(var index = 0, len = featureDataList.length; index<len; index++) {
			feature = featureDataList[index];
			if(this.gzip) {
				this.cache[key][dataType].push(RawDeflate.deflate(JSON.stringify(feature)));
			}else{
				this.cache[key][dataType].push(feature);
			}
		}
	}
	
};




//XXX not tested
FeatureCache.prototype.histogram = function(region, interval){

	var intervals = (region.end-region.start+1)/interval;
	var intervalList = [];
	
	for ( var i = 0; i < intervals; i++) {
		var featuresInterval = 0;
		
		var intervalStart = i*interval;//deberia empezar en 1...
		var intervalEnd = ((i+1)*interval)-1;
		
		var firstChunk = this._getChunk(intervalStart+region.start);
		var lastChunk = this._getChunk(intervalEnd+region.start);
		
		console.log(this.cache);
		for(var j=firstChunk; j<=lastChunk; j++){
			var key = region.chromosome+":"+j;
			console.log(key);
			console.log(this.cache[key]);
			for ( var k = 0, len = this.cache[key].length; k < len; k++) {
				if(this.gzip) {
					feature = JSON.parse(RawDeflate.inflate(this.cache[key][k]));
				}else{
					feature = this.cache[key][k];
				}
				if(feature.start > intervalStart && feature.start < intervalEnd);
				featuresInterval++;
			}
			
		}
		intervalList[i]=featuresInterval;
		
		if(this.maxFeaturesInterval<featuresInterval){
			this.maxFeaturesInterval = featuresInterval;
		}
	}
	
	for ( var inter in  intervalList) {
		intervalList[inter]=intervalList[inter]/this.maxFeaturesInterval;
	}
};function FeatureDataAdapter(dataSource, args){
	var _this = this;
	
	this.dataSource = dataSource;
	this.gzip = true;
	
	if (args != null){
		if(args.gzip != null){
			this.gzip = args.gzip;
		}
	}
	if(args.species != null){
		this.species = args.species;
	}
	
	this.featureCache =  new FeatureCache({chunkSize:10000, gzip:this.gzip});
	
	this.onLoad = new Event();	
	this.onGetData = new Event();
};

FeatureDataAdapter.prototype.getData = function(region){
	var dataType = "data";
	var itemList = this.featureCache.getFeaturesByRegion(region, dataType);
	if(itemList != null){
		this.onGetData.notify({data:itemList,cached:true});
	}
};


FeatureDataAdapter.prototype.addFeatures = function(features){
		this.featureCache.putFeatures(features, "data");
};
function ChromosomeWidget(parent, args) {
	
	this.id = Math.round(Math.random()*10000000);
	if(args != null){
		if(args.width != null){
			this.width = args.width;
		}
		if(args.height != null){
			this.height = args.height;
		}
		if(args.species != null){
			this.species = args.species;
		}
		if(args.chromosome != null){
			this.chromosome = args.chromosome;
		}
		if(args.zoom != null){
			this.zoom = args.zoom;
		}
		if(args.position != null){
			this.position = args.position;
		}
	}

	this._createPixelsbyBase();//create pixelByBase array
	this.tracksViewedRegion = this.width/this._getPixelsbyBase(this.zoom);
	
	this.onClick = new Event();
	
	this.svg = SVG.init(parent,{
		"width":this.width,
		"height":this.height
	});
	
	this.colors = {gneg:"white", stalk:"#666666", gvar:"#CCCCCC", gpos25:"silver", gpos33:"lightgrey", gpos50:"gray", gpos66:"dimgray", gpos75:"darkgray", gpos100:"black", gpos:"gray", acen:"blue"};
};

ChromosomeWidget.prototype.drawChromosome = function(){
	var _this = this;

	var cellBaseManager = new CellBaseManager(this.species);
 	cellBaseManager.success.addEventListener(function(sender,data){
 		_this.pixelBase = (_this.width -40) / data.result[0][data.result[0].length-1].end;
 		var x = 20;
 		var y = 10;
 		var firstCentromere = true;
 		
 		var offset = 20;
 		var pointerPosition = (_this.position * _this.pixelBase) + offset;
 		
 		var group = SVG.addChild(_this.svg,"g",{"cursor":"pointer"});
		$(group).click(function(event){
			var clickPosition = parseInt((event.clientX - offset)/_this.pixelBase);
			var positionBoxWidth = parseFloat(_this.positionBox.getAttribute("width"));
			
			_this.positionBox.setAttribute("x",event.clientX-(positionBoxWidth/2));
			_this.onClick.notify(clickPosition);
		});
		
		for (var i = 0; i < data.result[0].length; i++) {
			var width = _this.pixelBase * (data.result[0][i].end - data.result[0][i].start);
			var height = 18;
			var color = _this.colors[data.result[0][i].stain];
			if(color == null) color = "purple";
			var cytoband = data.result[0][i].cytoband;
			var middleX = x+width/2;
			var endY = y+height;
			
			if(data.result[0][i].stain == "acen"){
				var points = "";
				var middleY = y+height/2;
				var endX = x+width;
				if(firstCentromere){
					points = x+","+y+" "+middleX+","+y+" "+endX+","+middleY+" "+middleX+","+endY+" "+x+","+endY;
					firstCentromere = false;
				}else{
					points = x+","+middleY+" "+middleX+","+y+" "+endX+","+y+" "+endX+","+endY+" "+middleX+","+endY;
				}
				SVG.addChild(group,"polyline",{
					"points":points,
					"stroke":"black",
					"opacity":0.8,
					"fill":color
				});
			}else{
				SVG.addChild(group,"rect",{
					"x":x,
					"y":y,
					"width":width,
					"height":height,
					"stroke":"black",
					"opacity":0.8,
					"fill":color
				});
			}
			
			var textY = endY+2;
			var text = SVG.addChild(_this.svg,"text",{
				"x":middleX,
				"y":textY,
				"font-size":10,
				"transform": "rotate(90, "+middleX+", "+textY+")",
				"fill":"black"
			});
			text.textContent = cytoband;
			
			x = x + width;
		}
		
		var positionBoxWidth = _this.tracksViewedRegion*_this.pixelBase;
 		_this.positionBox = SVG.addChild(group,"rect",{
 			"x":pointerPosition-(positionBoxWidth/2),
			"y":2,
			"width":positionBoxWidth,
			"height":_this.height-2,
			"stroke":"orangered",
			"stroke-width":2,
			"opacity":0.5,
 			"fill":"orange"
 		});
 	});
 	cellBaseManager.get("genomic", "region", this.chromosome,"cytoband");
};

ChromosomeWidget.prototype.setLocation = function(item){//item.chromosome, item.position, item.species
	var needDraw = false;
	if(item.species!=null){
		this.species = item.species;
		needDraw = true;
	}
	if(item.chromosome!=null){
		this.chromosome = item.chromosome;
		needDraw = true;
	}
	if(item.position!=null){
		this.position = item.position;

		var pointerPosition = this.position*this.pixelBase+20;
		var positionBoxWidth = parseFloat(this.positionBox.getAttribute("width"));
		this.positionBox.setAttribute("x",pointerPosition-(positionBoxWidth/2));
	}
	if(needDraw){
		$(this.svg).empty();
		this.drawChromosome();
	}
};

ChromosomeWidget.prototype.setZoom = function(zoom){
	this.zoom=zoom;
	this.tracksViewedRegion = this.width/this._getPixelsbyBase(this.zoom);
	var width = this.tracksViewedRegion*this.pixelBase;
	this.positionBox.setAttribute("width",width);
	var pointerPosition = this.position*this.pixelBase+20;
	this.positionBox.setAttribute("x",pointerPosition-(width/2));
};

ChromosomeWidget.prototype._getPixelsbyBase = function(zoom){
	return this.zoomLevels[zoom];
};

ChromosomeWidget.prototype._createPixelsbyBase = function(){
	this.zoomLevels = new Array();
	var pixelsByBase = 10;
	for ( var i = 100; i >= -40; i-=5) {
		this.zoomLevels[i] = pixelsByBase;
		pixelsByBase = pixelsByBase / 2;
	}
};
function CircularChromosomeWidget(parent, args) {
	//variables globales, podremos utilizarlas en todo el metodo
	var _this = this; 

	//por si es nulo el valor que le pasamos, ponemos aqui unos valores por defecto
	//si hemos pasado los valores, se sobreescribiran
	this.coord_x = 400;
	this.coord_y = 250;	
	this.radius = 200;
	this.stroke_width = 20;
	
		if(args != null){
			if(args.coord_x != null){
				this.coord_x = args.coord_x;
				}
			if(args.coord_y != null){
				this.coord_y = args.coord_y;
				}
			if(args.radius != null){
				this.radius = args.radius;
				}
			if(args.stroke_width != null){
				this.stroke_width = args.stroke_width;
				}
		}
	
	//longitud del circulo
	this.circleLength = 2*Math.PI*this.radius;
	
	//variables que le daremos valor al cargar los datos
	this.d; //tendra todos los datos de la base de datos
	this.chroLength; //numero de elementos de la base de datos
	this.pixelRatio; //numero de elementos de la base de datos en cada pixel
	this.angle_click; //angulo del punto en el que vamos a clickar
	
	//coordenadas de la linea que indica donde hemos clickado
	this.x_point;
	this.y_point;
	this.x_point2;
	this.y_point2;

	//separacion de lo que marca donde hemos clikado con el circulo principal
	this.sep = 27;

	//angulo en el cual se ira separando la zona que indica donde hemos clickado
	this.angle_lines = Math.PI/6; //por defecto, ponemos 2 grados en radianes
	
	this.colors = {gneg:"white", stalk:"#666666", gvar:"#CCCCCC", gpos25:"silver", gpos33:"lightgrey", gpos50:"gray", gpos66:"dimgray", gpos75:"darkgray", gpos100:"black", gpos:"gray", acen:"blue"};
	this.mySvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");//Crea un elemento con el URI del espacio y el nombre de calificado.
	console.log(this.mySvg);
//	this.mySvg.setAttribute("version", "1.2"); // Añade una nueva aracteristica poniendo el nombre del atributo seleccionado y el valor
//	this.mySvg.setAttribute("baseProfile", "tiny");
	this.mySvg.setAttribute("width", "1000");
	this.mySvg.setAttribute("height", "600");
	parent.appendChild(this.mySvg); // Añade un nuevo nodo despues despues del ultimo nodo hijo
	    
	        
    //para decargarse los datos de la base de datos, de esta forma, copiamos todos los datos en data
    $.ajax({
	url: "http://ws-beta.bioinfo.cipf.es/cellbase/rest/latest/hsa/genomic/region/13/cytoband?of=json"
    }).done(function(data,b,c) {

  
    	_this.d = JSON.parse(data);
    	_this.chroLength = _this.d[0][_this.d[0].length-1].end; //numero de elementos
    	_this.pixelRatio  = _this.chroLength/ _this.circleLength;  //elementos en cada pixel
     
        $(_this.mySvg).click(function (event){ //event tiene una serie de parametros con informacion dle evento
    	 
 		var dist_max_x, dist_max_y; // contendra la distancia del borde del circulo por fuera
     	var dist_min_x, dist_min_y; //contendra la distancia del borde del circulo por dentro
     	var dist_max, dist_min; //la distancia maxima y minima del centro del circulo al borde por fuera y por dentro
     	var dist_click; //tendra la distancia desde donde clickamos al centro del circulo
     	
     	//el borde se encuentra la mitad fuera del circulo y la otra mitad dentro
     	//obtenenos las coordenadas de un punto en los bordes del borde del circulo
     	//como por referencia vamos a calcular la distancia del punto que se encuentra en el grado 180, la x es la misma
     	dist_max_x = _this.coord_x;
     	dist_max_y = _this.radius + _this.coord_y + (_this.stroke_width/2);

     	dist_min_x = _this.coord_x; 
     	dist_min_y = _this.radius + _this.coord_y - (_this.stroke_width/2);        	
     	
     	//calculamos las distancias del borde maxima y minima, como es un circulo, en cualquier punto sera la misma
     	dist_max = Math.sqrt(Math.pow((dist_max_x-_this.coord_x),2)+ (Math.pow((dist_max_y-_this.coord_y),2)));
     	dist_min = Math.sqrt(Math.pow((dist_min_x-_this.coord_x),2)+ (Math.pow((dist_min_y-_this.coord_y),2)));

     	//calculamos la distancia del punto donde clickamos al centro
     	//la posicion de la y esta desplazada 100 píxeles a la izquierda, por eso sumamos 100
     	dist_click =  Math.sqrt(Math.pow((event.clientX-_this.coord_x),2)+ Math.pow((event.clientY-_this.coord_y),2));
   	
     	var bb = false; //variable que hara que si nos encontremos dentro del circulo, mire en que elemento exacto
     	
	     	//si el punto donde hemos clickado se encuentra dentro del borde del circulo
	     	if (dist_click >= dist_min && dist_click <= dist_max)
	     		bb = true;

	     	if(bb)
	     	{
		        //ahora vamos a distinguir entre zonas del borde mediante el angulo 
		        _this.angle_click = 0; //tendra el angulo donde se encuentra el punto donde hemos clickado
		
		        	//segun donde se $(this.mySvg).click(function (event){ //event tiene una serie de parametros con informacion dle evento
		        	if(event.clientX > _this.coord_x &&  event.clientY < _this.coord_y)
		        		_this.angle_click = Math.atan((event.clientX - _this.coord_x)/(_this.coord_y - event.clientY));
		        	else if(event.clientX > _this.coord_x &&  event.clientY > _this.coord_y)
		        		_this.angle_click = (Math.PI/2) + Math.atan((event.clientY -_this.coord_y)/(event.clientX - _this.coord_x));
		        	else if(event.clientX < _this.coord_x &&  event.clientY > _this.coord_y)
		        		_this.angle_click = Math.PI + Math.atan((_this.coord_x - event.clientX)/(event.clientY - _this.coord_y));
		        	else if(event.clientX < _this.coord_x &&  event.clientY < _this.coord_y)	
		        		_this.angle_click = (3*Math.PI/2) + Math.atan((_this.coord_y - event.clientY)/(_this.coord_x - event.clientX));
		
		        var rad_360_grados = 2*Math.PI;//360 * Math.PI / 180;  //calculamos 360 grados en radianes
		        var pix_of_click; //el numero del pixel donde hemos pulsado
		            
		        //en rad_360_grados tenemos circleLength píxeles, con una regla de tres obtenemos cuantos pixeles tenemos en otro angulo en radianes
		        pix_of_click = (_this.angle_click * _this.circleLength) / rad_360_grados; 
		        var elem_pixel; //obtenmos el elemento que tenemos en ese pixel
		        elem_pixel = pix_of_click * _this.pixelRatio;
		        	
		        var ii = 0;
		        var b = true;
		        	
		        	//miramos en la base de datos cual es el objeto que contiene ese pixel
		        	while(ii < _this.d[0].length && b)  //para todos los datos que tenemos
		        		{
		        		  if (_this.d[0][ii].start <= elem_pixel &&  _this.d[0][ii].end >= elem_pixel)
		        			  	b = false;
		        	    ii++;
		        		}
		        	
		        //en i-1 tenemos el elemento donde hemos clickado
		        console.log(parseInt(elem_pixel));
		        	
		        //aqui damos las coordenadas a la recta para indicarle donde hemos clickado
		        _this.x_point = (_this.radius+_this.sep) * Math.cos(_this.angle_click)+ _this.coord_x;
		        _this.y_point = (_this.radius+_this.sep) * Math.sin(_this.angle_click)+ _this.coord_y;
		        _this.x_point2 = (_this.radius-_this.sep) * Math.cos(_this.angle_click)+ _this.coord_x;
		        _this.y_point2 = (_this.radius-_this.sep) * Math.sin(_this.angle_click)+ _this.coord_y;
		        	
		    	obj.setAttribute("x1", _this.x_point);
		    	obj.setAttribute("y1", _this.y_point);
		    	obj.setAttribute("x2", _this.x_point2);
		    	obj.setAttribute("y2", _this.y_point2);  
	
		    	//circulo que rodea donde hemos clickado
		    	var circle1 = [];   		
		    		
		    		//en el caso en el que el circulo se pinten en dos partes al situarse entre el principio y el final donde la funcion empieza a pintar
		    		if(_this.angle_click - _this.angle_lines < 0) //clickar despues del angulo cero
		    			{
		    			circle1.push((_this.angle_click + _this.angle_lines)* _this.circleLength / rad_360_grados); 
		    			circle1.push((rad_360_grados - (2*_this.angle_lines))*  _this.circleLength  / rad_360_grados); 
		    			circle1.push(((_this.angle_lines - _this.angle_click) *  _this.circleLength  / rad_360_grados)+2);
		    			}	
		    		else if(_this.angle_click + _this.angle_lines > rad_360_grados) //clickar antes del angulo 0
		    			{
		    				    			
		    			circle1.push((_this.angle_lines-(rad_360_grados-_this.angle_click))*  _this.circleLength  / rad_360_grados); 
		    			circle1.push((rad_360_grados - (2*_this.angle_lines))*  _this.circleLength  / rad_360_grados); 
		    			circle1.push(((_this.angle_lines + (rad_360_grados - _this.angle_click)) *  _this.circleLength  / rad_360_grados)+2);
		    			}
		    		else //caso normal
		    			{	
		    			circle1.push(0); 
			    		circle1.push(((_this.angle_click - _this.angle_lines) *  _this.circleLength ) / rad_360_grados); //pixels hasta la seleccion
			    		circle1.push(((_this.angle_lines * 2) *  _this.circleLength ) / rad_360_grados);  //pixels de la seleccion
			    		circle1.push((((rad_360_grados -(_this.angle_click - _this.angle_lines) + (_this.angle_lines * 2))) *  _this.circleLength ) / rad_360_grados);  //pixels de lo que sobra del circulo		
		    			}	
		    	c11.setAttribute ("cx", _this.coord_x);
		    	c11.setAttribute ("cy", _this.coord_y);
		    	c11.setAttribute ("r", _this.radius);
		    	c11.setAttribute("stroke-dasharray",circle1.toString());
	  		}
    });


    //creamos un indicador y lo situamos inicialmente en un punto
	var obj = document.createElementNS("http://www.w3.org/2000/svg", "line");
    obj.setAttribute("stroke", "red");
    obj.setAttribute("stroke-width", 1);
    obj.setAttribute("transform","rotate(-90,"+ _this.coord_x+","+_this.coord_y+")"); //lo rotamos para que empiece por arriba y lo desplazamos para verlo en la pantalla  
    _this.mySvg.appendChild (obj);
    
    //llamamos a la funcion aqui y no en el index para que os datos esten bien dargados antes de dibujar
    _this.drawChromosome();

    
    //circulo que rodea la seleccion
    var c11 = document.createElementNS ("http://www.w3.org/2000/svg", "circle");

    c11.setAttribute("fill", "transparent");
    c11.setAttribute("stroke", "orange");
    c11.setAttribute("opacity", "0.2");
    c11.setAttribute("stroke-width", 55);
    c11.setAttribute("transform","rotate(-90,"+ _this.coord_x+","+_this.coord_y+")"); //lo rotamos para que empiece por arriba y lo desplazamos para verlo en la pantalla

    _this.mySvg.appendChild (c11);
    

    
  });
};

CircularChromosomeWidget.prototype.drawChromosome = function(){
	var _this = this; //global
	_this.chroLength = _this.d[0][_this.d[0].length-1].end; //numero de elementos
	var dashArray = []; //contendra los numeros que le pasaremos a la funcion dasharray para que pite el circulo por partes
	var aux = 0; // numero de elementos que tiene cada grupo
	var colores = []; //array que contendra los diferentes colores e indicara los diferentes circulos a pintar
	var b = true;
	
	//damos valores al array colors mirando todos los colores diferentes que tenemos
	colores.push(_this.d[0][0].stain); //almacenamos el primero
	 
		 for(var j = 1; j<= _this.d[0].length-1; j++) //0 a 35
		 {
		     for(var w=0; w <= colores.length-1; w++)
		     {
		       if(colores[w] == _this.d[0][j].stain)  //si se encuentra ya en el vector, lo indicamos
		         b = false;
		     } 
		     if(b) //si ese color no esta en el array, se almacena
		      colores.push(_this.d[0][j].stain);
	
	     b = true;
		 }

    var indice=null; //esta variable se guardara el indice del anterior elementos que era del mismo color para calcular el hueco
	var bb = true; //variable que indicara cuando hay que dibujar el primero

	//llenamos el vector desharray
	for(var w = 0; w<colores.length;w++)   //los almacenamos por colores
	{
	   for(var i = 0; i< _this.d[0].length; i++)  //para todos los datos que tenemos
	   {  
	      
	      if(_this.d[0][i].stain == colores[w]) //miramos que sea del mismo color
	      {
		    if(bb)// en este sitio solo entramos la primera vez que vamos a pintar cada color
	  	    {  
		      //hay que diferenciar cuando se empieza pintando y cuando se empieza dejandolo en blanco en el primero de los datos
		      if(i==0 && _this.d[0][i].start==1)
		      {
			      //calculamos el numero de pixeles para pintar
				  aux = _this.d[0][i].end - _this.d[0][i].start;

				  aux = aux / _this.pixelRatio;
				  dashArray.push(aux);
		      }
		      else
		      {
				  dashArray.push(0); //cuando primero hay un blanco, ponemos 0 para que no pinte nada
				  //como ya tenemos el elemento, calculamos el espacio y el siguente a colorear
				  aux = _this.d[0][i].start - 1; // calculamos el espacio que hay desde ese elemento al inicio
				  aux = aux / _this.pixelRatio;

				  dashArray.push(aux); 
				  //calculamos el espacio a pintar
			          aux = _this.d[0][i].end - _this.d[0][i].start;
				  aux = aux / _this.pixelRatio;
				  dashArray.push(aux);	
		      }
		    indice = i; //nos guardamos la posicion del anterior elemento con el mismo color para calcular el hueco con el siguiente
		    bb= false; 
		  }
		 else
		   {  
		   //espacio transparente mirando el espacio que hay con el anterior
		    aux = _this.d[0][i].start - _this.d[0][indice].end;    //i-1 no es el anterior, sino otro
		    aux = aux / _this.pixelRatio;
		    
		    if( _this.colors[colores[w]]=="blue")
		      dashArray.push(2); // si es azul aunque este todo junto lo separamos un poco
		    else
		       dashArray.push(aux); 
		   
		    //espacio pintado
		    aux = _this.d[0][i].end -_this. d[0][i].start;
		    aux = aux / _this.pixelRatio;
		    dashArray.push(aux);			  
		    indice = i; //nos almacenamos el siguente elemento oara calcular el hueco al siguiente
		    }
	     }
	    }
	//cuando termina hay que indicarle que almacene el blanco (transparente) hasta el final
	aux = _this.chroLength - _this.d[0][indice].end;
	aux = aux / _this.pixelRatio;
	dashArray=dashArray +","+ aux;
	DrawCircles(dashArray, w, colores);
	dashArray = [];  //vaciamos para volver a llenar esta variable con los numeros de otro color
	bb = true;
	}	    

	function DrawCircles(dashArray, w, colores)
	{	
      var c1 = document.createElementNS ("http://www.w3.org/2000/svg", "circle");
      c1.setAttribute ("cx", _this.coord_x);
      c1.setAttribute ("cy", _this.coord_y);
      c1.setAttribute ("r", _this.radius);
      c1.setAttribute("fill", "transparent");
      c1.setAttribute("stroke", _this.colors[colores[w]]);
      c1.setAttribute("stroke-width", _this.stroke_width);
      //lo rotamos para que empiece por arriba y lo desplazamos para verlo en la pantalla
      c1.setAttribute("transform","rotate(-90,"+ _this.coord_x+","+_this.coord_y+")"); 
      c1.setAttribute("stroke-dasharray",dashArray.toString());
      _this.mySvg.appendChild (c1);
	}
};
function KaryotypeWidget(parent, args) {
	
	this.parent = parent;
	this.id = Math.round(Math.random()*10000000);
	if(args != null){
		if(args.width != null){
			this.width = args.width;
		}
		if(args.height != null){
			this.height = args.height;
		}
		if(args.species != null){
			this.species = args.species;
		}
		if(args.chromosome != null){
			this.chromosome = args.chromosome;
		}
		if(args.position != null){
			this.position = args.position;
		}
	}

	this.onClick = new Event();
	this.afterRender = new Event();
	
	this.rendered=false;
	
	this.svg = SVG.init(parent,{
		"width":this.width,
		"height":this.height
	});
	this.markGroup = SVG.addChild(this.svg,"g",{"cursor":"pointer"});
	
	this.colors = {gneg:"white", stalk:"#666666", gvar:"#CCCCCC", gpos25:"silver", gpos33:"lightgrey", gpos50:"gray", gpos66:"dimgray", gpos75:"darkgray", gpos100:"black", gpos:"gray", acen:"blue"};
};


KaryotypeWidget.prototype.drawKaryotype = function(){
	var _this = this;

	var sortfunction = function(a, b) {
		var IsNumber = true;
		for (var i = 0; i < a.length && IsNumber == true; i++) {
			if (isNaN(a[i])) {
				IsNumber = false;
			}
		}
		if (!IsNumber) return 1;
		return (a - b);
	};
	
	var cellBaseManager = new CellBaseManager(this.species);
 	cellBaseManager.success.addEventListener(function(sender,data){
 		var chromosomeList = data.result;
 		chromosomeList.sort(sortfunction);
 		var x = 20;
 		var xOffset = _this.width/chromosomeList.length;
 		var yMargin = 2;
 		
 		var cellBaseManager2 = new CellBaseManager(_this.species);
 		cellBaseManager2.success.addEventListener(function(sender,data2){
 			var biggerChr = 0;
 			for(var i=0, len=chromosomeList.length; i<len; i++){
 				var size = data2.result[i][data2.result[i].length-1].end;
 				if(size > biggerChr) biggerChr = size;
 			}
 			_this.pixelBase = (_this.height - 10) / biggerChr;
 			_this.chrOffsetY = {};
 			_this.chrOffsetX = {};
 			
 			for(var i=0, len=chromosomeList.length; i<len; i++){ //loop over chromosomes
 				var chr = data2.result[i][0].chromosome;
 				chrSize = data2.result[i][data2.result[i].length-1].end * _this.pixelBase;
 				var y = yMargin + (biggerChr * _this.pixelBase) - chrSize;
 				_this.chrOffsetY[chr] = y;
 		 		var firstCentromere = true;
 		 		var pointerPosition = (_this.position * _this.pixelBase);
 		 		
 				var group = SVG.addChild(_this.svg,"g",{"cursor":"pointer","chr":chromosomeList[i]});
 				$(group).click(function(event){
 					var chrClicked = this.getAttribute("chr");
// 					for ( var k=0, len=chromosomeList.length; k<len; k++) {
// 						 var offsetX = (event.pageX - $(_this.svg).offset().left);
//						if(offsetX > _this.chrOffsetX[chromosomeList[k]]) chrClicked = chromosomeList[k];
//					}
 					
 					var offsetY = (event.pageY - $(_this.svg).offset().top);
// 					var offsetY = event.originalEvent.layerY - 3;
 					
 					_this.positionBox.setAttribute("x1",_this.chrOffsetX[chrClicked]-10);
 					_this.positionBox.setAttribute("x2",_this.chrOffsetX[chrClicked]+23);
 					_this.positionBox.setAttribute("y1",offsetY);
 					_this.positionBox.setAttribute("y2",offsetY);
 					
 					var clickPosition = parseInt((offsetY - _this.chrOffsetY[chrClicked])/_this.pixelBase);
 					_this.chromosome = chrClicked;
 					_this.onClick.notify({chromosome:_this.chromosome, position:clickPosition});
 				});
 				
 				for ( var j=0, lenJ=data2.result[i].length; j<lenJ; j++){ //loop over chromosome objects
 					var height = _this.pixelBase * (data2.result[i][j].end - data2.result[i][j].start);
 					var width = 13;

 					var color = _this.colors[data2.result[i][j].stain];
 					if(color == null) color = "purple";
 					
 					if(data2.result[i][j].stain == "acen"){
 						var points = "";
 						var middleX = x+width/2;
 						var middleY = y+height/2;
 						var endX = x+width;
 						var endY = y+height;
 						if(firstCentromere){
 							points = x+","+y+" "+endX+","+y+" "+endX+","+middleY+" "+middleX+","+endY+" "+x+","+middleY;
 							firstCentromere = false;
 						}else{
 							points = x+","+endY+" "+x+","+middleY+" "+middleX+","+y+" "+endX+","+middleY+" "+endX+","+endY;
 						}
 						SVG.addChild(group,"polyline",{
 							"points":points,
 							"stroke":"black",
 							"opacity":0.8,
 							"fill":color
 						});
 					}else{
 						SVG.addChild(group,"rect",{
 	 						"x":x,
 	 						"y":y,
 	 						"width":width,
 	 						"height":height,
 	 						"stroke":"grey",
 	 						"opacity":0.8,
 	 						"fill":color
 	 					});
 					}

 					y += height;
 				}
 				var text = SVG.addChild(_this.svg,"text",{
 					"x":x+1,
 					"y":_this.height,
 					"font-size":9,
 					"fill":"black"
 				});
 				text.textContent = chr;

 				_this.chrOffsetX[chr] = x;
 				x += xOffset;
 			}
 			_this.positionBox = SVG.addChild(_this.svg,"line",{
 				"x1":_this.chrOffsetX[_this.chromosome]-10,
 				"y1":pointerPosition + _this.chrOffsetY[_this.chromosome],
 				"x2":_this.chrOffsetX[_this.chromosome]+23,
 				"y2":pointerPosition + _this.chrOffsetY[_this.chromosome],
 				"stroke":"orangered",
 				"stroke-width":2,
 				"opacity":0.5
 			});
 			
 			_this.rendered=true;
 			_this.afterRender.notify();
 		});
 		cellBaseManager2.get("genomic", "region", chromosomeList.toString(),"cytoband");
 	});
 	cellBaseManager.get("feature", "karyotype", "none", "chromosome");
	
};

KaryotypeWidget.prototype.setLocation = function(item){//item.chromosome, item.position, item.species
	var needDraw = false;
	if(item.species!=null){
		this.species = item.species;
		needDraw = true;
	}
	if(item.chromosome!=null){
		this.chromosome = item.chromosome;
		
		if(item.species==null){
			this.positionBox.setAttribute("x1",this.chrOffsetX[this.chromosome]-10);
			this.positionBox.setAttribute("x2",this.chrOffsetX[this.chromosome]+23);
		}
	}
	if(item.position!=null){
		this.position = item.position;
		
		if(item.species==null){
			var pointerPosition = this.position * this.pixelBase + this.chrOffsetY[this.chromosome];
			this.positionBox.setAttribute("y1",pointerPosition);
			this.positionBox.setAttribute("y2",pointerPosition);
		}
	}
	if(needDraw){
		$(this.svg).empty();
		this.drawKaryotype();
	}
};


KaryotypeWidget.prototype.updatePositionBox = function(item){
	this.chromosome = item.chromosome;
	this.position = item.position;
	this.positionBox.setAttribute("x1",this.chrOffsetX[this.chromosome]-10);
	this.positionBox.setAttribute("x2",this.chrOffsetX[this.chromosome]+23);
	var pointerPosition = this.position * this.pixelBase + this.chrOffsetY[this.chromosome];
	this.positionBox.setAttribute("y1",pointerPosition);
	this.positionBox.setAttribute("y2",pointerPosition);
};	
	
KaryotypeWidget.prototype.addMark = function(item){//item.chromosome, item.position
	var _this = this;
	
	var mark = function (){

		if(item.chromosome!=null && item.start!=null){
			if(_this.chrOffsetX[item.chromosome]!= null){
				var x1 = _this.chrOffsetX[item.chromosome]-10;
				var x2 = _this.chrOffsetX[item.chromosome];
				var y1 = (item.start * _this.pixelBase + _this.chrOffsetY[item.chromosome]) - 4;
				var y2 = item.start * _this.pixelBase + _this.chrOffsetY[item.chromosome];
				var y3 = (item.start * _this.pixelBase + _this.chrOffsetY[item.chromosome]) + 4;
				var points = x1+","+y1+" "+x2+","+y2+" "+x1+","+y3+" "+x1+","+y1;
				SVG.addChild(_this.markGroup,"polyline",{
					"points":points,
					"stroke":"black",
					"opacity":0.8,
					"fill":"#33FF33"
				});
			}
		}
	};
	
	if(this.rendered){
		mark();
	}else{
		this.afterRender.addEventListener(function(sender,data){
			mark();
		});
	}
};

KaryotypeWidget.prototype.unmark = function(){
	$(this.markGroup).empty();
};
function DataSource() {
	
};

DataSource.prototype.fetch = function(){

};
function CellBaseAdapter(args){
	this.host = null;
	this.gzip = true;
	
	this.params={};
	if (args != null){
		if(args.host != null){
			this.host = args.host;
		}
		if(args.species != null){
			this.species = args.species;
		}
		if(args.category != null){
			this.category = args.category;
		}
		if(args.subCategory != null){
			this.subCategory = args.subCategory;
		}
		if(args.resource != null){
			this.resource = args.resource;
		}
		if(args.featureCache != null){
			var argsFeatureCache = args.featureCache;
		}
		if(args.params != null){
			var params = args.params;
		}
	}
	this.featureCache =  new FeatureCache(argsFeatureCache);
	this.onGetData = new Event();
};

CellBaseAdapter.prototype.getData = function(args){
	var _this = this;
	//region check
	
	this.params["histogram"] = args.histogram;
	this.params["interval"] = args.interval;
	this.params["transcript"] = args.transcript;
	
	
	if(args.start<1){
		args.start=1;
	}
	if(args.end>300000000){
		args.end=300000000;
	}
	
	var type = "data";
	if(args.histogram){
		type = "histogram"+args.interval;
	}
	if(args.transcript){
		type = "withTranscripts";
	}
	
	var firstChunk = this.featureCache._getChunk(args.start);
	var lastChunk = this.featureCache._getChunk(args.end);
	var cellBaseManager = new CellBaseManager(this.species,{host: this.host});

	var chunks = [];
	var itemList = [];
	for(var i=firstChunk; i<=lastChunk; i++){
		var key = args.chromosome+":"+i;
		if(this.featureCache.cache[key] == null || this.featureCache.cache[key][type] == null) {
			chunks.push(i);
		}else{
			var items = this.featureCache.getFeaturesByChunk(key, type);
//			console.time("concat");
			itemList = itemList.concat(items);
//			console.timeEnd("concat");
		}
	}
//	//notify all chunks
	if(itemList.length>0){
		this.onGetData.notify({data:itemList, params:this.params, cached:true});
	}
	
	
	//CellBase data process
	cellBaseManager.success.addEventListener(function(sender,data){
		console.timeEnd("cellbase");
		console.time("insertCache");
		var type = "data";
		if(data.params.histogram){
			type = "histogram"+data.params.interval;
		}
		if(data.params.transcript){
			type = "withTranscripts";
		}
		
		//XXX quitar cuando este arreglado el ws
		if(data.params.histogram == true){
			data.result = [data.result];
		}
		//XXX
		
		var queryList = [];
//		console.log("query length "+data.query.length);
//		console.log("data length "+data.result.length);
//		console.log("data "+data.result);
		for(var i = 0; i < data.query.length; i++) {
			var splitDots = data.query[i].split(":");
			var splitDash = splitDots[1].split("-");
			queryList.push({chromosome:splitDots[0],start:splitDash[0],end:splitDash[1]});
		}
//		console.log(_this.featureCache.cache);

		
		for(var i = 0; i < data.result.length; i++) {
			
			//Check if is a single object
			if(data.result[i].constructor != Array){
				data.result[i] = [data.result[i]];
			}
			
			for ( var j = 0, lenj = data.result[i].length; j < lenj; j++) {
				if(data.resource == "gene" && data.result[i][j].transcripts!=null){
					for (var t = 0, lent = data.result[i][j].transcripts.length; t < lent; t++){
						data.result[i][j].transcripts[t].featureType = "transcript";
						//for de exones
						for (var e = 0, lene = data.result[i][j].transcripts[t].exonToTranscripts.length; e < lene; e++){
							data.result[i][j].transcripts[t].exonToTranscripts[e].exon.featureType = "exon";
						}
					}
				}
			}
			
			_this.featureCache.putFeaturesByRegion(data.result[i], queryList[i], data.resource, type);
			var items = _this.featureCache.getFeaturesByRegion(queryList[i], type);
			if(items != null){
				_this.onGetData.notify({data:items, params:_this.params, cached:false});
			}
		}
	});

	var querys = [];
	var updateStart = true;
	var updateEnd = true;
	if(chunks.length > 0){
//		console.log(chunks);
		
		for ( var i = 0; i < chunks.length; i++) {
			
			if(updateStart){
				var chunkStart = parseInt(chunks[i] * this.featureCache.chunkSize);
				updateStart = false;
			}
			if(updateEnd){
				var chunkEnd = parseInt((chunks[i] * this.featureCache.chunkSize) + this.featureCache.chunkSize-1);
				updateEnd = false;
			}
			
			if(chunks[i+1]!=null){
				if(chunks[i]+1==chunks[i+1]){
					updateEnd =true;
				}else{
					var query = args.chromosome+":"+chunkStart+"-"+chunkEnd;
					querys.push(query);
					updateStart = true;
					updateEnd = true;
				}
			}else{
				var query = args.chromosome+":"+chunkStart+"-"+chunkEnd;
				querys.push(query);
				updateStart = true;
				updateEnd = true;
			}
		}
//		console.log(querys);
		console.time("cellbase");
		cellBaseManager.get(this.category, this.subCategory, querys, this.resource, this.params);
	}
};

//XXX borrar?
//CellBaseAdapter.prototype.searchData = function(args){
//	var querys = args.queryList; 
//	cellBaseManager.success.addEventListener(function(sender,data){
//		for(var i = 0; i < data.result.length; i++) {
//			
//			//Check if is a single object
//			if(data.result[i].constructor != Array){
//				data.result[i] = [data.result[i]];
//			}
//			
//			for ( var j = 0, lenj = data.result[i].length; j < lenj; j++) {
//				if(data.resource == "gene" && data.result[i][j].transcripts!=null){
//					for (var t = 0, lent = data.result[i][j].transcripts.length; t < lent; t++){
//						data.result[i][j].transcripts[t].featureType = "transcript";
//						//for de exones
//						for (var e = 0, lene = data.result[i][j].transcripts[t].exonToTranscripts.length; e < lene; e++){
//							data.result[i][j].transcripts[t].exonToTranscripts[e].featureType = "exon";
//						}
//					}
//				}
//			}
//			
//			_this.featureCache.putFeaturesByRegion(data.result[i], queryList[i], data.resource, type);
//			var items = _this.featureCache.getFeaturesByRegion(queryList[i], type);
//			_this.onGetData.notify({data:items,cached:false});
//		}
//	});
//	
//	cellBaseManager.get(this.category, this.subCategory, querys, this.resource, this.params);
//};


//CellBaseAdapter.prototype.getDataOLD = function(region){
	//var _this = this;
	//
	//var features = _this.featureCache.get(region, true);
	//
	//if(features == null){
		//var cellBaseManager = new CellBaseManager(this.species,{host: this.host});
		//cellBaseManager.success.addEventListener(function(sender,data){
//			check if is an array of arrays or an array of objects
			//if(data.length > 0){
				//if(data[0].constructor == Object){ 
					//_this.featureCache.put(data,region);
				//}
				//else{
					//for(var i = 0; i < data.length; i++) {
						//_this.featureCache.put(data[i],region);
					//}
				//}
			//}else{
				//_this.featureCache.put(data,region);
			//}
			//_this.onGetData.notify(_this.featureCache.get(region, true));
		//});
//
//
		//var chunkRegion = this.featureCache.getChunkRegion(region);
		//var query = region.chromosome+":"+chunkRegion.start+"-"+chunkRegion.end;
//		var query = region.chromosome+":"+region.start+"-"+region.end;
		//cellBaseManager.get(this.category, this.subCategory, query, this.resource);
		//
	//}else{
//		_this.onGetData.notify(features);
	//}
//};
FileDataSource.prototype.fetch = DataSource.prototype.fetch;

function FileDataSource(file) {
	DataSource.prototype.constructor.call(this);
	
	this.file = file;
	this.success = new Event();
	this.error = new Event();
};

FileDataSource.prototype.error = function(){
	alert("File is too big. Max file size is 50 Mbytes.");
};

FileDataSource.prototype.fetch = function(async){
	var _this = this;
	if(this.file.size <= 52428800){
		if(async){
			var  reader = new FileReader();
			reader.onload = function(evt) {
				_this.success.notify(evt.target.result);
			};
			reader.readAsText(this.file, "UTF-8");
		}else{
			var reader = new FileReaderSync();
			return reader.readAsText(this.file, "UTF-8");
		}
	}else{
		_this.error();
		_this.error.notify();
	}
};
StringDataSource.prototype.fetch = DataSource.prototype.fetch;

function StringDataSource(str) {
	DataSource.prototype.constructor.call(this);
	
	this.str = str;
	this.success = new Event();
};

StringDataSource.prototype.fetch = function(async){
	if(async){
		this.success.notify(this.str);
	}else{
		return this.str;
	}
};
UrlDataSource.prototype.fetch = DataSource.prototype.fetch;

function UrlDataSource(url, args) {
	DataSource.prototype.constructor.call(this);
	
	this.url = url;
	this.proxy = "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v1/utils/proxy?url=";
	if(args != null){
		if(args.proxy != null){
			if(typeof(args.proxy) == "boolean"){
				if(args.proxy == false){
					this.proxy = false;
				}
				else{
					this.url = this.proxy + url;
				}
			}else if(typeof(args.proxy) == "string"){
				this.url = args.proxy + url;
			}
		}
	}
	this.success = new Event();
	this.error = new Event();
};

UrlDataSource.prototype.fetch = function(async){
	var _this = this;
	
	var datos = null;
	
	if(this.url){
		$.ajax({
			type : "GET",
			url : this.url,
			async : async,
			success : function(data, textStatus, jqXHR) {
				if(async){
					_this.success.notify(data);
				}else{
					datos = data;
				}
			},
			error : function(jqXHR, textStatus, errorThrown){
				console.log("URL Data source: Ajax call returned : "+errorThrown+'\t'+textStatus+'\t'+jqXHR.statusText+" END");
				_this.error.notify();
			}
		});
		
		return datos;
	}
};
VCFDataAdapter.prototype.getData = FeatureDataAdapter.prototype.getData;

function VCFDataAdapter(dataSource, args){
	FeatureDataAdapter.prototype.constructor.call(this, dataSource, args);
	var _this = this;
	
	this.async = true;

	if (args != null){
		if(args.async != null){
			this.async = args.async;
		}
	}
	if(this.async){
		this.dataSource.success.addEventListener(function(sender,data){
			_this.parse(data);
			_this.onLoad.notify();
		});
		this.dataSource.fetch(this.async);
	}else{
		var data = this.dataSource.fetch(this.async);
		this.parse(data);
	}
};

VCFDataAdapter.prototype.parse = function(data){
	var _this = this;
	var dataType = "data";
	var lines = data.split("\n");
//	console.log("creating objects");
	for (var i = 0; i < lines.length; i++){
		var line = lines[i].replace(/^\s+|\s+$/g,"");
		if ((line != null)&&(line.length > 0)){
			var fields = line.split("\t");
			if (fields[0].substr(0,1) != "#"){
//				_this.addQualityControl(fields[5]);

				var feature = {
						"chromosome": 	fields[0],
						"position": 	parseFloat(fields[1]), 
						"start": 		parseFloat(fields[1]), 
						"end": 			parseFloat(fields[1]),
						"id":  			fields[2],
						"ref": 			fields[3], 
						"alt": 			fields[4], 
						"quality": 		fields[5], 
						"filter": 		fields[6], 
						"info": 		fields[7], 
						"format": 		fields[8], 
						"record":		fields,
						"label": 		fields[2] + " " +fields[3] + "/" + fields[4] + " Q:" + fields[5],
						"featureType":	"file"
				};
				this.featureCache.putFeatures(feature, dataType);
			}
		}
	}
};
GFFDataAdapter.prototype.getData = FeatureDataAdapter.prototype.getData;

function GFFDataAdapter(dataSource, args){
	FeatureDataAdapter.prototype.constructor.call(this, dataSource, args);
	var _this = this;
	
	this.async = true;

	if (args != null){
		if(args.async != null){
			this.async = args.async;
		}
	}
	
	if(this.async){
		this.dataSource.success.addEventListener(function(sender,data){
			_this.parse(data);
			_this.onLoad.notify();
		});
		this.dataSource.fetch(this.async);
	}else{
		var data = this.dataSource.fetch(this.async);
		this.parse(data);
	}
};

GFFDataAdapter.prototype.parse = function(data){
	var _this = this;
	var dataType = "data";
	var lines = data.split("\n");
//	console.log("creating objects");
	for (var i = 0; i < lines.length; i++){
		var line = lines[i].replace(/^\s+|\s+$/g,"");
		if ((line != null)&&(line.length > 0)){
			var fields = line.split("\t");
			var chromosome = fields[0].replace("chr", "");

			//NAME  SOURCE  TYPE  START  END  SCORE  STRAND  FRAME  GROUP
			var feature = {
					"chromosome": chromosome, 
					"label": fields[2], 
					"start": parseFloat(fields[3]), 
					"end": parseFloat(fields[4]), 
					"score": parseFloat(fields[5]),
					"strand": fields[6], 
					"frame": fields[7],
					"group": fields[8],
					"featureType":	"file"
			} ;

			this.featureCache.putFeatures(feature, dataType);
		}
	}
};
BEDDataAdapter.prototype.getData = FeatureDataAdapter.prototype.getData;

function BEDDataAdapter(dataSource, args){
	FeatureDataAdapter.prototype.constructor.call(this, dataSource, args);
	var _this = this;
	
	this.async = true;

	if (args != null){
		if(args.async != null){
			this.async = args.async;
		}
	}
	
	if(this.async){
		this.dataSource.success.addEventListener(function(sender,data){
			_this.parse(data);
			_this.onLoad.notify();
		});
		this.dataSource.fetch(this.async);
	}else{
		var data = this.dataSource.fetch(this.async);
		this.parse(data);
	}
};

BEDDataAdapter.prototype.parse = function(data){
	var _this = this;
	var dataType = "data";
	var lines = data.split("\n");
//	console.log("creating objects");
	for (var i = 0; i < lines.length; i++){
		var line = lines[i].replace(/^\s+|\s+$/g,"");
		if ((line != null)&&(line.length > 0)){
			var fields = line.split("\t");

			var feature = {
					"label":fields[3],
					"chromosome": fields[0].replace("chr", ""), 
					"start": parseFloat(fields[1]), 
					"end": parseFloat(fields[2]), 
					"score":fields[4],
					"strand":fields[5],
					"thickStart":fields[6],
					"thickEnd":fields[7],
					"itemRgb":fields[8],
					"blockCount":fields[9],
					"blockSizes":fields[10],
					"blockStarts":fields[11],
					"featureType":	"bed"
			} ;

			this.featureCache.putFeatures(feature, dataType);
		}
	}
};
function TabularDataAdapter(dataSource, args){
	var _this = this;
	
	this.dataSource = dataSource;
	this.async = true;

	if (args != null){
		if(args.async != null){
			this.async = args.async;
		}
	}
	
	this.fileLines = [];
	
	if(this.async){
		this.dataSource.success.addEventListener(function(sender,data){
			_this.parse(data);
			_this.onLoad.notify();
		});
		this.dataSource.fetch(this.async);
	}else{
		var data = this.dataSource.fetch(this.async);
		this.parse(data);
	}
	
	this.onLoad = new Event();	
};

TabularDataAdapter.prototype.getLines = function(){
	return this.fileLines;
};

TabularDataAdapter.prototype.parse = function(data){
	var _this = this;
	var lines = data.split("\n");
//	console.log("creating objects");
	for (var i = 0; i < lines.length; i++){
		var line = lines[i].replace(/^\s+|\s+$/g,"");
		line = line.replace(/\//gi,"");//TODO DONE   /  is not allowed in the call
		if ((line != null)&&(line.length > 0) && line.charAt(0)!="#"){
			var fields = line.split("\t");
			this.fileLines.push(fields);
		}
	}
};

//
TabularDataAdapter.prototype.getLinesCount = function(){
	return this.fileLines.length;
};

TabularDataAdapter.prototype.getValuesByColumnIndex = function(columnIndex){
	var result = new Array();
	for (var i = 0; i < this.getLinesCount(); i++) {
		if (this.getLines()[i][columnIndex] != null){
			result.push(this.getLines()[i][columnIndex]);
		}
	}
	return result;
};

/** Returns: 'numeric' || 'string **/
TabularDataAdapter.prototype.getHeuristicTypeByColumnIndex = function(columnIndex){
	return this.getHeuristicTypeByValues(this.getValuesByColumnIndex(columnIndex));
};

TabularDataAdapter.prototype.getHeuristicTypeByValues = function(values){
	var regExp = /^[-+]?[0-9]*\.?[0-9]+$/;
	for (var i = 0; i < values.length; i++) {
		if(!regExp.test(new String(values[i]).replace(",", "."))){
			return 'string';
		}
	}
	return 'numeric';
};function DasAdapter(args){
	this.gzip = true;
	
	this.proxy = "http://ws-beta.bioinfo.cipf.es/cellbase/rest/v1/utils/proxy?url=";
	
	if (args != null){
		if (args.url != null){
			this.url = args.url;
		}
		if(args.species != null){
			this.species = args.species;
		}
		if(args.featureCache != null){
			var argsFeatureCache = args.featureCache;
		}
		if(args.params != null){
			var params = args.params;
		}
	}
	this.featureCache =  new FeatureCache(argsFeatureCache);
	this.onGetData = new Event();
	this.onCheckUrl = new Event();
	this.onError = new Event();
};

DasAdapter.prototype.getData = function(args){
	console.time("all");
	var _this = this;
	//region check
	if(args.start<1){
		args.start=1;
	}
	if(args.end>300000000){
		args.end=300000000;
	}
	
	var type = "data";
	if(args.histogram){
		type = "histogram"+args.interval;
	}
	
	var firstChunk = this.featureCache._getChunk(args.start);
	var lastChunk = this.featureCache._getChunk(args.end);

	var chunks = [];
	var itemList = [];
	for(var i=firstChunk; i<=lastChunk; i++){
		var key = args.chromosome+":"+i;
		if(this.featureCache.cache[key] == null || this.featureCache.cache[key][type] == null) {
			chunks.push(i);
		}else{
			var items = this.featureCache.getFeaturesByChunk(key, type);
//			console.time("concat");
			itemList = itemList.concat(items);
//			console.timeEnd("concat");
		}
	}
//	//notify all chunks
	if(itemList.length>0){
		this.onGetData.notify({data:itemList,cached:true});
	}
	
	
	//data process
	var updateStart = true;
	var updateEnd = true;
	if(chunks.length > 0){
//		console.log(chunks);
		
		for ( var i = 0; i < chunks.length; i++) {
			var query = null;
			
			if(updateStart){
				var chunkStart = parseInt(chunks[i] * this.featureCache.chunkSize);
				updateStart = false;
			}
			if(updateEnd){
				var chunkEnd = parseInt((chunks[i] * this.featureCache.chunkSize) + this.featureCache.chunkSize-1);
				updateEnd = false;
			}
			
			if(chunks[i+1]!=null){
				if(chunks[i]+1==chunks[i+1]){
					updateEnd =true;
				}else{
					query = args.chromosome+":"+chunkStart+","+chunkEnd;
					updateStart = true;
					updateEnd = true;
				}
			}else{
				query = args.chromosome+":"+chunkStart+","+chunkEnd;
				updateStart = true;
				updateEnd = true;
			}

			if(query){
				var fullURL = this.proxy + this.url + "?segment=" + query;
				console.log("fullURL: "+fullURL);

				$.ajax({
					url: fullURL,
					type: 'GET',
					dataType:"xml",
					error: function(){
						alert("error");
						_this.onError.notify("It is not allowed by Access-Control-Allow-Origin " );
					},

					success: function(data){
						_this.xml =   (new XMLSerializer()).serializeToString(data);
						var xmlStringified =  (new XMLSerializer()).serializeToString(data); //data.childNodes[2].nodeValue;
						var data = xml2json.parser(xmlStringified);
						var result = new Array();

						if (typeof(data.dasgff.gff.segment)  != 'undefined'){
							if (typeof(data.dasgff.gff.segment.feature)  != 'undefined'){	  
								result = data.dasgff.gff.segment.feature;	
							}
							else if (typeof(data.dasgff.gff.segment[0])  != 'undefined'){
								if (data.dasgff.gff.segment[0].feature != null){
									for ( var i = 0; i < data.dasgff.gff.segment.length; i++) {
										for ( var j = 0; j < data.dasgff.gff.segment[i].feature.length; j++) {
											data.dasgff.gff.segment[i].feature[j]["chromosome"] = args.chromosome;
											result.push(data.dasgff.gff.segment[i].feature[j]);
										}
									}
								}
								else{
									result.push([]);
								}
							}
						}
						var region = {chromosome:args.chromosome, start:chunkStart, end:chunkEnd};
						var resource = "das";
						_this.featureCache.putFeaturesByRegion(result, region, resource, type);
						console.log(_this.featureCache.cache);
						var items = _this.featureCache.getFeaturesByRegion(region, type);
						if(items != null){
							_this.onGetData.notify({data:items,cached:false});
						}
					}
				});
			}
		}
	}
};

DasAdapter.prototype.checkUrl = function(){
	var _this = this;
	var fullURL = this.proxy + this.url + "?segment=1:1,1";
	console.log("Checking URL: "+fullURL);

	$.ajax({
		url: fullURL,
		type: 'GET',
		dataType:"xml",
		error: function(){
			alert("error");
			_this.onError.notify("It is not allowed by Access-Control-Allow-Origin " );
		},
		success: function(data){
			_this.xml = (new XMLSerializer()).serializeToString(data);
			_this.onCheckUrl.notify({data:_this.xml});
		}
	});
};
function CellBaseAdapter(args){
	this.host = null;
	this.gzip = true;
	
	this.params={};
	if (args != null){
		if(args.host != null){
			this.host = args.host;
		}
		if(args.species != null){
			this.species = args.species;
		}
		if(args.category != null){
			this.category = args.category;
		}
		if(args.subCategory != null){
			this.subCategory = args.subCategory;
		}
		if(args.resource != null){
			this.resource = args.resource;
		}
		if(args.featureCache != null){
			var argsFeatureCache = args.featureCache;
		}
		if(args.params != null){
			var params = args.params;
		}
	}
	this.featureCache =  new FeatureCache(argsFeatureCache);
	this.onGetData = new Event();
};

CellBaseAdapter.prototype.getData = function(args){
	var _this = this;
	//region check
	
	this.params["histogram"] = args.histogram;
	this.params["interval"] = args.interval;
	this.params["transcript"] = args.transcript;
	
	
	if(args.start<1){
		args.start=1;
	}
	if(args.end>300000000){
		args.end=300000000;
	}
	
	var type = "data";
	if(args.histogram){
		type = "histogram"+args.interval;
	}
	if(args.transcript){
		type = "withTranscripts";
	}
	
	var firstChunk = this.featureCache._getChunk(args.start);
	var lastChunk = this.featureCache._getChunk(args.end);
	var cellBaseManager = new CellBaseManager(this.species,{host: this.host});

	var chunks = [];
	var itemList = [];
	for(var i=firstChunk; i<=lastChunk; i++){
		var key = args.chromosome+":"+i;
		if(this.featureCache.cache[key] == null || this.featureCache.cache[key][type] == null) {
			chunks.push(i);
		}else{
			var items = this.featureCache.getFeaturesByChunk(key, type);
//			console.time("concat");
			itemList = itemList.concat(items);
//			console.timeEnd("concat");
		}
	}
//	//notify all chunks
	if(itemList.length>0){
		this.onGetData.notify({data:itemList, params:this.params, cached:true});
	}
	
	
	//CellBase data process
	cellBaseManager.success.addEventListener(function(sender,data){
		console.timeEnd("cellbase");
		console.time("insertCache");
		var type = "data";
		if(data.params.histogram){
			type = "histogram"+data.params.interval;
		}
		if(data.params.transcript){
			type = "withTranscripts";
		}
		
		//XXX quitar cuando este arreglado el ws
		if(data.params.histogram == true){
			data.result = [data.result];
		}
		//XXX
		
		var queryList = [];
//		console.log("query length "+data.query.length);
//		console.log("data length "+data.result.length);
//		console.log("data "+data.result);
		for(var i = 0; i < data.query.length; i++) {
			var splitDots = data.query[i].split(":");
			var splitDash = splitDots[1].split("-");
			queryList.push({chromosome:splitDots[0],start:splitDash[0],end:splitDash[1]});
		}
//		console.log(_this.featureCache.cache);

		
		for(var i = 0; i < data.result.length; i++) {
			
			//Check if is a single object
			if(data.result[i].constructor != Array){
				data.result[i] = [data.result[i]];
			}
			
			for ( var j = 0, lenj = data.result[i].length; j < lenj; j++) {
				if(data.resource == "gene" && data.result[i][j].transcripts!=null){
					for (var t = 0, lent = data.result[i][j].transcripts.length; t < lent; t++){
						data.result[i][j].transcripts[t].featureType = "transcript";
						//for de exones
						for (var e = 0, lene = data.result[i][j].transcripts[t].exonToTranscripts.length; e < lene; e++){
							data.result[i][j].transcripts[t].exonToTranscripts[e].exon.featureType = "exon";
						}
					}
				}
			}
			
			_this.featureCache.putFeaturesByRegion(data.result[i], queryList[i], data.resource, type);
			var items = _this.featureCache.getFeaturesByRegion(queryList[i], type);
			if(items != null){
				_this.onGetData.notify({data:items, params:_this.params, cached:false});
			}
		}
	});

	var querys = [];
	var updateStart = true;
	var updateEnd = true;
	if(chunks.length > 0){
//		console.log(chunks);
		
		for ( var i = 0; i < chunks.length; i++) {
			
			if(updateStart){
				var chunkStart = parseInt(chunks[i] * this.featureCache.chunkSize);
				updateStart = false;
			}
			if(updateEnd){
				var chunkEnd = parseInt((chunks[i] * this.featureCache.chunkSize) + this.featureCache.chunkSize-1);
				updateEnd = false;
			}
			
			if(chunks[i+1]!=null){
				if(chunks[i]+1==chunks[i+1]){
					updateEnd =true;
				}else{
					var query = args.chromosome+":"+chunkStart+"-"+chunkEnd;
					querys.push(query);
					updateStart = true;
					updateEnd = true;
				}
			}else{
				var query = args.chromosome+":"+chunkStart+"-"+chunkEnd;
				querys.push(query);
				updateStart = true;
				updateEnd = true;
			}
		}
//		console.log(querys);
		console.time("cellbase");
		cellBaseManager.get(this.category, this.subCategory, querys, this.resource, this.params);
	}
};

//XXX borrar?
//CellBaseAdapter.prototype.searchData = function(args){
//	var querys = args.queryList; 
//	cellBaseManager.success.addEventListener(function(sender,data){
//		for(var i = 0; i < data.result.length; i++) {
//			
//			//Check if is a single object
//			if(data.result[i].constructor != Array){
//				data.result[i] = [data.result[i]];
//			}
//			
//			for ( var j = 0, lenj = data.result[i].length; j < lenj; j++) {
//				if(data.resource == "gene" && data.result[i][j].transcripts!=null){
//					for (var t = 0, lent = data.result[i][j].transcripts.length; t < lent; t++){
//						data.result[i][j].transcripts[t].featureType = "transcript";
//						//for de exones
//						for (var e = 0, lene = data.result[i][j].transcripts[t].exonToTranscripts.length; e < lene; e++){
//							data.result[i][j].transcripts[t].exonToTranscripts[e].featureType = "exon";
//						}
//					}
//				}
//			}
//			
//			_this.featureCache.putFeaturesByRegion(data.result[i], queryList[i], data.resource, type);
//			var items = _this.featureCache.getFeaturesByRegion(queryList[i], type);
//			_this.onGetData.notify({data:items,cached:false});
//		}
//	});
//	
//	cellBaseManager.get(this.category, this.subCategory, querys, this.resource, this.params);
//};


//CellBaseAdapter.prototype.getDataOLD = function(region){
	//var _this = this;
	//
	//var features = _this.featureCache.get(region, true);
	//
	//if(features == null){
		//var cellBaseManager = new CellBaseManager(this.species,{host: this.host});
		//cellBaseManager.success.addEventListener(function(sender,data){
//			check if is an array of arrays or an array of objects
			//if(data.length > 0){
				//if(data[0].constructor == Object){ 
					//_this.featureCache.put(data,region);
				//}
				//else{
					//for(var i = 0; i < data.length; i++) {
						//_this.featureCache.put(data[i],region);
					//}
				//}
			//}else{
				//_this.featureCache.put(data,region);
			//}
			//_this.onGetData.notify(_this.featureCache.get(region, true));
		//});
//
//
		//var chunkRegion = this.featureCache.getChunkRegion(region);
		//var query = region.chromosome+":"+chunkRegion.start+"-"+chunkRegion.end;
//		var query = region.chromosome+":"+region.start+"-"+region.end;
		//cellBaseManager.get(this.category, this.subCategory, query, this.resource);
		//
	//}else{
//		_this.onGetData.notify(features);
	//}
//};
VCFFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
VCFFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
VCFFileWidget.prototype.draw = FileWidget.prototype.draw;
VCFFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
VCFFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;

function VCFFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "VCF";
	args.tags = ["vcf"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
    this.chartWidgetQuality = new ChartWidget({height:300});
};

VCFFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"]),
	        this.chartWidgetQuality.getChart(["features","quality"])];
};


VCFFileWidget.prototype.loadFileFromLocal = function(file){
	var _this = this;
	this.file = file;
	this.adapter = new VCFDataAdapter(new FileDataSource(file),{species:this.viewer.species});
	this.adapter.onLoad.addEventListener(function(sender){
		_this.btnOk.enable();
	});
};


VCFFileWidget.prototype.loadFileFromServer = function(data){
	this.file = {name:data.filename};
	this.adapter = new VCFDataAdapter(new StringDataSource(data.data),{async:false,species:this.viewer.species});
	this.btnOk.enable();
};
GFFFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
GFFFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
GFFFileWidget.prototype.draw = FileWidget.prototype.draw;
GFFFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
GFFFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;

function GFFFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "GFF";
	args.tags = ["gff"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
    this.chartWidgetQuality = new ChartWidget({height:300});
};

GFFFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"])];
};



GFFFileWidget.prototype.loadFileFromLocal = function(file){
	var _this = this;
	this.file = file;
	this.adapter = new GFFDataAdapter(new FileDataSource(file),{species:this.viewer.species});
	this.adapter.onLoad.addEventListener(function(sender){
		_this.btnOk.enable();
	});
};


GFFFileWidget.prototype.loadFileFromServer = function(data){
	this.file = {name:data.filename};
	this.adapter = new GFFDataAdapter(new StringDataSource(data.data),{async:false,species:this.viewer.species});
	this.btnOk.enable();
};BEDFileWidget.prototype.getTitleName = FileWidget.prototype.getTitleName;
BEDFileWidget.prototype.getFileUpload = FileWidget.prototype.getFileUpload;
BEDFileWidget.prototype.draw = FileWidget.prototype.draw;
BEDFileWidget.prototype.sessionInitiated = FileWidget.prototype.sessionInitiated;
BEDFileWidget.prototype.sessionFinished = FileWidget.prototype.sessionFinished;

function BEDFileWidget(args){
	if (args == null){
		args = new Object();
	}
	args.title = "BED";
	args.tags = ["bed"];
	FileWidget.prototype.constructor.call(this, args);
	
    this.chartWidgetByChromosome = new ChartWidget();
    this.chartWidgetQuality = new ChartWidget({height:300});
};

BEDFileWidget.prototype.getChartItems = function(){
	return [this.chartWidgetByChromosome.getChart(["features","chromosome"])];
};



BEDFileWidget.prototype.loadFileFromLocal = function(file){
	var _this = this;
	this.file = file;
	this.adapter = new BEDDataAdapter(new FileDataSource(file),{species:this.viewer.species});
	this.adapter.onLoad.addEventListener(function(sender){
		_this.btnOk.enable();
	});
};


BEDFileWidget.prototype.loadFileFromServer = function(data){
	this.file = {name:data.filename};
	this.adapter = new BEDDataAdapter(new StringDataSource(data.data),{async:false,species:this.viewer.species});
	this.btnOk.enable();
};
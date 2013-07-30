/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

function InfoWidget(targetId, species, args){
	this.id = "InfoWidget_" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.species=species;
	
	this.title = null;
	this.featureId = null;
	this.width = 800;
	this.height = 460;
	
	this.feature = null;
	this.query = null;
	this.adapter = null;
	
	
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
	
	switch (Utils.getSpeciesCode(species.text)){
	case "hsapiens":
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
	case "mmusculus":
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
	case "drerio":
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
	this.adapter = args.adapter;
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
		this.panel = Ext.create('Ext.window.Window', {
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
		    '<div><span class="panel-border-bottom"><span class="ssel s130">{name}</span> &nbsp; <span class="emph s120"> {id} </span></span>',
			' &nbsp; <a target="_blank" href="http://www.ensembl.org/'+this.ensemblSpecie+'/Location/View?g={id}">Ensembl</a>',
			' &nbsp; <a target="_blank" href="http://wikipathways.org//index.php?query={externalName}&species='+this.wikipathwaysSpecie+'&title=Special%3ASearchPathways&doSearch=1">Wikipathways</a>',
			'</div><br>',
		    '<div><span class="w75 infokey s90">Location: </span> <span class="">{chromosome}:{start}-{end} </span><span style="margin-left:50px" class=" infokey s90">Strand: </span> {strand}</div>',
		    '<div><span class="w75 infokey s90">Biotype: </span> {biotype}</div>',
		    '<div><span class="w75 infokey s90">Description: </span> <span><tpl if="description == &quot;&quot;">No description available</tpl>{description}</span></div>',
		    '<div><span class="w75 infokey s90">Source: </span> <span class="s110">{source}</span></div>',
//		    '<div><span class="w75 infokey s90">External DB: </span> {externalDb}</div>',
		    '<div><span class="w75 infokey s90">Status: </span> {status}</div>' // +  '<br>'+str
	);
};
InfoWidget.prototype.getTranscriptTemplate = function (){
	return new Ext.XTemplate(
		    '<div><span class="panel-border-bottom"><span class="ssel s130">{name}</span> &nbsp; <span class="emph s120"> {id} </span></span>',
		    ' &nbsp; <a target="_blank" href="http://www.ensembl.org/'+this.ensemblSpecie+'/Transcript/Transcript?t={id}">Ensembl</a>',
		    ' &nbsp; <a target="_blank" href="http://wikipathways.org//index.php?query={externalName}&species='+this.wikipathwaysSpecie+'&title=Special%3ASearchPathways&doSearch=1">Wikipathways</a>',
		    '</div><br>',
		    '<div><span class="w100 infokey s90">Location: </span> <span class="">{chromosome}:{start}-{end} </span><span style="margin-left:50px" class=" infokey s90">Strand: </span> {strand}</div>',
		    '<div><span class="w100 infokey s90">Biotype: </span> {biotype}</div>',
		    '<div><span class="w100 infokey s90">Description: </span> <span><tpl if="description == &quot;&quot;">No description available</tpl>{description}</span></div>',
		    '',
		    '<div><span class="w100 infokey s90">CDS &nbsp; (start-end): </span> {genomicCodingStart}-{genomicCodingEnd} <span style="margin-left:50px" class="w100 infokey s90">CDNA (start-end): </span> {cdnaCodingStart}-{cdnaCodingEnd}</div>',
            '<div><span class="w100 infokey s90">Protein: </span> {proteinID}</div>',
		    '<div><span class="w100 infokey s90">External DB: </span> {externalDb}</div>',
		    '<div><span class="w100 infokey s90">Status: </span> {status}</div><br>'// +  '<br>'+str
		);
};
InfoWidget.prototype.getSnpTemplate = function (){

//
//    alleleString: "C/T"
//    alternate: "T"
//    assembly: ""
//    chromosome: "13"
//    end: 32889669
//    featureAlias: "featureAlias"
//    featureId: "featureId"
//    id: "rs55880202"
//    populationFrequencies: null
//    reference: "C"
//    samples: Array[0]
//    source: ""
//    species: ""
//    start: 32889669
//    strand: "1"
//    transcriptVariations: Array[6]
//    type: "SNV"
//    validationStatus: "freq,1000Genome"
//    variantFreq: "variantFreq"
//    version: ""
//    xrefs: Array[0]

	return new Ext.XTemplate(
		    '<div><span class="panel-border-bottom"><span class="ssel s130">{id}</span></span>',
		    ' &nbsp; <a target="_blank" href="http://www.ensembl.org/'+this.ensemblSpecie+'/Variation/Summary?v={id}">Ensembl</a>',
		    '</div><br>',
		    '<div><span class="w140 infokey s90">Location: </span> <span class="">{chromosome}:{start}-{end} </span><span style="margin-left:50px" class=" infokey s90">Strand: </span> {strand}</div>',
		    '<div><span class="w140 infokey s90">Source: </span> <span class="s110">{source}</span></div>',
		    '<div><span class="w140 infokey s90">Type: </span> <span class="s110">{type}</span></div>',
		    '<div><span class="w140 infokey s90">Allele string: </span> {alleleString}</div>',
		    '<div><span class="w140 infokey s90">Ancestral allele: </span> {ancestralAllele}</div>',
		    '<div><span class="w140 infokey s90">Display SO consequence type: </span> {displayConsequenceType}</div>',
		    '<div><span class="w140 infokey s90">SO consequence types: </span> {consequenceTypes}</div>'
//		    '<div><span class="w140 infokey s90">Xrefs: </span> {xrefs}</div>'
//		    '<div><span class="w140 infokey s90">Sequence: </span> {sequence}</div>' // +  '<br>'+str
		);
};

InfoWidget.prototype.getExonTemplate = function (){
	return new Ext.XTemplate(
			'<span><span class="panel-border-bottom"><span class="ssel s110">{id}</span></span></span><br><br>',
			'<span><span class="infokey s90"> Location: </span> <span class="">{chromosome}:{start}-{end} </span></span><br>',
			'<span><span class="infokey s90"> Genomic coding (start-end) : </span> <span class="">{genomicCodingStart}-{genomicCodingEnd} </span></span><br>',
			'<span><span class="infokey s90"> cDNA (start-end) : </span> <span class="">{cdnaCodingStart}-{cdnaCodingEnd} </span></span><br>',
			'<span><span class="infokey s90"> CDS (start-end) : </span> <span class="">{cdsStart}-{cdsEnd} </span></span><br>',
			'<span><span class="infokey s90"> Phase: </span> {phase}</span><br>'
		);
};

InfoWidget.prototype.getProteinTemplate = function (){
	return new Ext.XTemplate(
			 '<div><span class="panel-border-bottom"><span class="ssel s130">{name}</span> &nbsp; <span class="emph s120"> {primaryAccession} </span></span></div>',
			 '<br>',
			 '<div><span class="w100 infokey s90">Full name: </span> <span class="">{fullName}</span></div>',
			 '<div><span class="w100 infokey s90">Gene name: </span> <span class="">{geneName}</span></div>',
			 '<div><span class="w100 infokey s90">Organism: </span> <span class="">{organism}</span></div>'
		);
};


InfoWidget.prototype.getVCFVariantTemplate = function (){
	return new Ext.XTemplate(
			'<div><span><span class="panel-border-bottom"><span class="ssel s130">{chromosome}:{start}-{alternate}</span> &nbsp; <span class="emph s120"> {id} </span></span></span></div><br>',
			'<div><span class="w75 infokey s90">Alt: </span> {alternate}</div>',
			'<div><span class="w75 infokey s90">Ref: </span> {reference}</div>',
			'<div><span class="w75 infokey s90">Quality: </span> {quality}</div>',
			'<div><span class="w75 infokey s90">Format: </span> {format}</div>',
			'<div><span class="w75 infokey s90">Samples: </span> {samples}</div>',
			'<div><span class="w75 infokey s90">Info: <br></span> {info}</div>'
		);
};

InfoWidget.prototype.getPWMTemplate = function (){
	return new Ext.XTemplate(
			 '<div><span class="panel-border-bottom"><span class="ssel s130">{accession}</span> &nbsp; <span class="emph s120"> {tfName} </span></span></div>',
			 '<br>',
			 '<div><span class="w100 infokey s90">Type: </span> <span class="">{source}</span></div>',
			 '<div><span class="w100 infokey s90">Source: </span> <span class="">{type}</span></div>',
			 '<div><span class="w100 infokey s90">Description: </span> <span class="">{description}</span></div>',
			 '<div><span class="w100 infokey s90">Length: </span> <span class="">{length}</span></div>',
			 '<div><span class="w100 infokey s90">Frequencies: </span> <span class="">{[this.parseFrequencies(values.frequencies)]}</span></div>',
			 {
				 parseFrequencies: function(values){
					 return '<div>'+values.replace(/,/gi, '<br>')+"</div>";
				 }
			 }
		);
};

InfoWidget.prototype.getProteinXrefTemplate = function (){
	return new Ext.XTemplate(
			'<div><span class="w75 emph s100">{[values.source.toUpperCase()]}</span> &nbsp; <span class="emph w125 s100"> {[this.generateLink(values)]} <span class="info">&raquo;</span> </span></div>',
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
//    alleleString: "C/T"
//    cdnEnd: 0
//    cdnaStart: 0
//    cdsEnd: 0
//    cdsStart: 0
//    codonAlleleString: ""
//    consequenceTypes: Array[1]
//    distanceToTranscript: 188
//    hgvsGenomic: "13:g.32889669C>T"
//    hgvsProtein: ""
//    hgvsTranscript: ""
//    peptideAlleleString: ""
//    polyphenPrediction: ""
//    polyphenScore: 0
//    siftPrediction: ""
//    siftScore: 0
//    somatic: "0"
//    transcriptId: "ENST00000533490"
//    translationEnd: 0
//    translationStart: 0

	return new Ext.XTemplate(
		    '<div><span class="panel-border-bottom"><span class="ssel s130">{[this.getStableId(values)]}</span></span>',
		    ' &nbsp; <a target="_blank" href="http://www.ensembl.org/'+this.ensemblSpecie+'/Transcript/Transcript?t={[this.getStableId(values)]}">Ensembl</a>',
		    '</div><br>',
		    '<div><span class="w140 infokey s90">CDS &nbsp; (start - end): </span> {cdsStart} - {cdsEnd} <span style="margin-left:50px" class="w100 infokey s90">cDNA (start - end): </span> {cdnaStart} - {cdnaEnd}</div>',
		    '<div><span class="w140 infokey s90">Translation (start - end): </span> {translationStart} - {translationEnd}</div>',
		    '<div><span class="w140 infokey s90">Peptide allele: </span> {peptideAlleleString}</div>',
//		    '<div><span class="w140 infokey s90">Alt. peptide allele: </span> {alternativePeptideAlleleString}</div>',
			'<div><span class="w140 infokey s90">Codon: </span> {codonAlleleString}</div>',

            '<div><span class="w140 infokey s90">HGVS Genomic: </span> {hgvsGenomic}',
            '<div><span class="w140 infokey s90">HGVS Protein: </span> {hgvsProtein}',
            '<div><span class="w140 infokey s90">HGVS Transcript: </span> {hgvsTranscript}',

//			'<div><span class="w140 infokey s90">Reference codon: </span> {referenceCodon}</div>',
			'<div><span class="w140 infokey s90">Polyphen prediction: </span> {polyphenPrediction}',
			'<span style="margin-left:50px" class="w140 infokey s90">Polyphen score: </span> {polyphenScore}</div>',
			'<div><span class="w140 infokey s90">Sift prediction: </span> {siftPrediction}',
			'<span style="margin-left:50px" class="w140 infokey s90">Sift score: </span> {siftScore}</div>',
            '<div><span class="w140 infokey s90">SO consequence types: </span> {consequenceTypes}</div><br>',
		    {
		    	getStableId: function(values){
		    		if(values.transcriptId!=""){
		    			return values.transcriptId;
		    		}
		    		return "Intergenic SNP";
		    	}
		    }
		);
};


InfoWidget.prototype.getConsequenceTypeTemplate = function (){
	return new Ext.XTemplate(
		    '<div><span class="panel-border-bottom"><span class="ssel s130">{transcriptId}</span> &nbsp; </span></div><br>',
		    '<div><span class="w140 infokey s90">SO consequence types: </span> {consequenceTypes}</div><br>'
//		    '<div><span class="w100 infokey s90">SO term: </span> {consequenceType.soTerm}</div>',
//		    '<div><span class="w100 infokey s90">Feature So term: </span> {consequenceType.featureSoTerm}</div>',
//		    '<div><span class="w100 infokey s90">NCBI term: </span> {consequenceType.ncbiTerm}</div>',
//		    '<div><span class="w100 infokey s90">Rank: </span> {consequenceType.rank}</div><br>'
		);
};


InfoWidget.prototype.getPhenotypeTemplate = function (){
	return new Ext.XTemplate(
		    '<div><span class="panel-border-bottom"><span class="ssel s130">{phenotypeDescription}</span> &nbsp; <span class="emph s120"> {source} </span></span></div><br>',
			'<div><span class="w150 infokey s90">PValue: </span>{PValue}</div>',
			'<div><span class="w150 infokey s90">Assoc. gene name: </span>{associatedGeneName}</div>',
			'<div><span class="w150 infokey s90">Assoc. variant risk allele: </span>{associatedVariantRiskAllele}</div>',
			'<div><span class="w150 infokey s90">Phenotype description: </span>{phenotypeDescription}</div>',
			'<div><span class="w150 infokey s90">Phenotype name: </span>{phenotypeName}</div>',
			'<div><span class="w150 infokey s90">Risk allele freq in controls: </span>{riskAlleleFrequencyInControls}</div>',
			'<div><span class="w150 infokey s90">Source: </span>{source}</div>',
			'<div><span class="w150 infokey s90">Study name: </span>{studyName}</div>',
			'<div><span class="w150 infokey s90">Study type: </span>{studyType}</div>',
			'<div><span class="w150 infokey s90">Study URL: </span>{studyUrl}</div>',
			'<div><span class="w150 infokey s90">Study description: </span>{studyDescription}</div>'
		);
};

InfoWidget.prototype.getPopulationTemplate = function (){
	return new Ext.XTemplate(
		    '<div><span class="panel-border-bottom"><span class="ssel s130">{population}</span> &nbsp; <span class="emph s120"> {source} </span></span></div><br>',
		    '<div><span class="w140 infokey s90">Ref allele:  </span>{refAllele} ({refAlleleFrequency})</div>',
		    '<div><span class="w140 infokey s90">Other allele:  </span>{otherAllele} ({otherAlleleFrequency})</div>',
		    '<div><span class="w140 infokey s90">Ref allele homozygote:  </span>{refAlleleHomozygote} ({refAlleleHomozygoteFrequency})</div>',
		    '<div><span class="w140 infokey s90">Allele heterozygote:  </span>{alleleHeterozygote} ({alleleHeterozygoteFrequency})</div>',
			 '<div><span class="w140 infokey s90">Other allele homozygote:  </span>{otherAlleleHomozygote} ({otherAlleleHeterozygoteFrequency})</div>',
//			 'TODO cuidado <div><span class="w140 infokey s90">other allele heterozygote Frequency:  </span>{otherAlleleHeterozygoteFrequency}</div>',
			 '<div><span class="w140 infokey s90">Source:  </span>{source}</div>',
			 '<div><span class="w140 infokey s90">Population:  </span>{population}</div>'
		);
};

//not used
InfoWidget.prototype.getVariantEffectTemplate = function (){
		
	return new Ext.XTemplate(
		    '<div><span class="panel-border-bottom"><span class="ssel s130">{consequenceTypeObo}</span> &nbsp; <span class="emph s120"> {featureBiotype} </span></span></div><br>'
		);
};

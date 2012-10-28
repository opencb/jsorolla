/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
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
	this.height = 430;
	
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
			'<p><span class="w75 dis s90">Info: <br></span> {info}</p>'
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

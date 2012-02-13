function InfoWidget(targetId, species, args){
	this.id = "InfoWidget_" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.species=species;
	console.log(this.species);
	
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
};
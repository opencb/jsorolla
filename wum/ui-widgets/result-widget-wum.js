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

function ResultWidget(args){
	var _this = this;
	this.id = "ResultWidget"+ Math.round(Math.random()*10000);
	this.targetId = null;
	
	if (args != null){
		if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
		if (args.application!= null){
        	this.application = args.application;       
        }
		if (args.app!= null){
        	this.app = args.app;       
        }
    }
	
	this.adapter = new WumAdapter();
	
	this.adapter.onJobResult.addEventListener(function (sender, data){
//		console.log(data);
		_this.data = JSON.parse(data);
		Ext.getBody().unmask();
		_this.panel.setLoading(false);
		_this.render();
	});

	this.panelId=null;
	this.networkViewerId = null;
	this.genomeMapsId = null;
	
	this.resultTables = new Object();
	this.resultHistograms = new Object();
	this.resultGCharts = new Object();
	this.variantFiles = new Object();
	
//	this.onRendered = new Event();
	
	this.onViewRendered = new Event();
	this.onViewRendered.addEventListener(function (sender, targetId){
		_this.drawTables();
		_this.drawHistograms();
		_this.drawGCharts();
		_this.drawApplicationItems();
	});
};

ResultWidget.prototype.draw = function (sid, record){
//	console.log(record.data);
	this.record = record;
	this.jobId = this.record.data.jobId;
	this.id = this.jobId+this.id;
	this.panelId = "ResultWidget_"+this.jobId;
	this.networkViewerId = this.panelId+"_CellBrowserId";
	this.genomeMapsId = this.panelId+"_GenomeMapsId";
	
	
		this.panel = Ext.getCmp(this.panelId);
		if(this.panel==null){
			this.panel = Ext.create('Ext.panel.Panel', {
				id :this.panelId,
				border: 0,
			    title: this.record.data.name,
			    closable:true,
			    autoScroll:true
		//		html: this.tpl.applyTemplate(outputItems)
			});
			
			Ext.getCmp(this.targetId).add(this.panel);
			Ext.getCmp(this.targetId).setActiveTab(this.panel);
			this.panel.setLoading("Loading job info...");
			Ext.getBody().mask();
			this.adapter.jobResult(this.jobId, "json", sid);
		}else{
//			this.panel.setLoading(false);
			Ext.getCmp(this.targetId).setActiveTab(this.panel);
		}
};

ResultWidget.prototype.render = function (){
	var _this=this;
	
	console.log(this.application);

	
		if(this.data.outputItems.length != 0){
			
			var outputItems = this.data.inputItems.concat(this.data.outputItems);
			
			//obtener todos los grupos quitando los repetidos
			var obj = {};
			for(var i = 0; i < outputItems.length; i++){
				var group = outputItems[i].group;
				
				if(group != "" ){ //no meter items con grupo distinto a ""
					if(group.indexOf(".")!=-1){//comprobar si alguno tiene un subgrupo
						var parent_group = group.split(".")[0];
						var sub_group = group.split(".")[1];
						if(obj[parent_group]==null) {
							obj[parent_group]={};
						}
						if(obj[parent_group][sub_group]==null){
							obj[parent_group][sub_group]=[];
						}
						
						//ESTE if quita los resultados para los pvalue = 0.005, 0.01, 0.1, deja solo los 0.05
						if(this.checkPValue(outputItems[i].title)){
							obj[parent_group][sub_group].push(outputItems[i]);
						}
					}else {
						if(obj[group]==null){
							obj[group]={};
							obj[group]["items"]=[];
						}
						
						//QUITAR la cadena de texto ${pvalue} si existe y la sustituye por 0.05
						this.renamePValue(outputItems[i]);
						obj[group]["items"].push(outputItems[i]);			
					}
					

				}
			}
			
			obj["Interactive Results"]={items:[]};
			console.log(obj);
			
			var topLink = Ext.create('Ext.container.Container', {html:'<a name="'+this.jobId+'top"></a>'});
			var info = Ext.create('Ext.container.Container', {
				margin: "15 0 5 15",
				html:'<p >The job named <span class="info">'+this.record.data.name+' </span>'+
				'was launched on <span class="err">'+this.record.data.creationTime+' </span>'+
				'and has been visited <span class="dis">'+this.record.data.visites+' times</span></p>'+
				'You can download the job results by pressing the <b>download</b> button.'
			});
			
			var result = [];
			//Solo grupos juntos al principio
			var i=1;
			for (key in obj){
				var groupBox = Ext.create('Ext.container.Container', {
					padding:"0 0 2 15",
					html:'<p class="s110 emph">'+i+'. <a href="#'+key+'">'+key+'</a></p>'
				});
				result.push(groupBox);
				i++;
			}
			
			//Grupos con resultados a continuacion
			var i=1;
			for (key in obj){
				//Grupo
				var infoId = (this.jobId+key+"info").replace(/ /gi, "");
				var groupBox = Ext.create('Ext.container.Container', {
					infoId:infoId,
					groupName:key,
					padding:"60 15 5 15",
					html:'<p class="panel-border-bottom"><span class="s140 emph">'+i+'. <a name="'+key+'" href="#'+this.jobId+'top">'+key+'</a>'+
						' </span><span class="info" id="'+infoId+'"></span></p>',
					listeners:{
						afterrender:function(){
							var text = _this.getInfo(this.groupName);
							if(text!=""){
								$("#"+this.infoId).html("+info");
								var infoTip = Ext.create('Ext.tip.Tip',{
									html:text,
									listeners:{
										show:function(){
											var este = this;
											this.getEl().on("mouseleave",function(){
												este.hide();
											});
										}
									}
								});
								$("#"+this.infoId).mouseover(function(ev){
									$(this).css({cursor:"pointer"});
									infoTip.showAt(ev.clientX,ev.clientY);
								});
								$("#"+this.infoId).click(function(){
									infoTip.hide();
								});
							}
							
						}
					}
					
				});
				result.push(groupBox);
				
				//Resultados - se le pasa el array de items
				result.push(this.getResults(obj[key].items));
				
				//Comprobamos si tiene subgrupos 1 - nivel solo
				var c = 1;
				for(clave in obj[key]){
					if (clave != "items"){
						//Grupo
						var groupBox = Ext.create('Ext.container.Container', {
							padding:"15 15 5 30",
							cls:"inlineblock",
							html:'<p class="panel-border-bottom s120 emph">'+i+'.'+c+' '+clave+'</p>'
						});
						//si la clave es Your annotation tratarlo de otra manera... para mas adelante
//						console.log(clave)
						result.push(groupBox);
						
//						debugger
						//Resultados - se le pasa el array de items
						result.push(this.getResults(obj[key][clave]));
					c++;
					}
				}//subgrupos
				i++;
			}
			
			
			var downloadButton = Ext.create('Ext.button.Button', {
				 text: 'Download',
				 margin: "0 0 25 15",
				 handler: function (){
					 _this.adapter.download(_this.jobId, $.cookie('bioinfo_sid'));
				 }
			});
			

			var deleteJobButton = Ext.create('Ext.button.Button', {
				 text: 'Delete',
				 margin: "0 0 25 30",
				 handler: function (){
					 Ext.Msg.confirm("Delete job", "Are you sure you want to delete this job?", function (btnClicked){
//						 console.log(btnClicked);
						 if(btnClicked == "yes") {
							 _this.adapter.onDeleteJob.addEventListener(function (sender, data){
								 var msg = "";
								 if(data.response.indexOf("OK") != -1) {
									 Ext.getCmp(_this.targetId).getActiveTab().close();
									 msg = "The job has been succesfully deleted.";
								 }
								 else {
									 msg = "ERROR: could not delete job.";
								 }
								 Ext.Msg.alert("Delete job", msg);
							 });
//							 console.log("Job id: "+_this.jobId+" Cookie: "+$.cookie('bioinfo_sid'));
							 _this.adapter.deleteJob(_this.jobId, $.cookie('bioinfo_sid'));
						 }
					 });
				 }
			});


			this.panel.add(topLink);
			this.panel.add(info);
			this.panel.add(downloadButton);
			this.panel.add(deleteJobButton);
			this.panel.add(result);

			_this.onViewRendered.notify();			

		}//else
};


ResultWidget.prototype.getResults = function (items){
	//Resultados
	var boxes = [];
	for (var j = 0; j < items.length; j++){
		var item = items[j];
		
		//Obtener el container con el resultado
		var itemBox = this.showInfo(item);
		boxes.push(itemBox);
		
		//Añadir el container para resultados adicionales segun el type y el tag si procede
		var container = this.showTypeInfo(item);
		if(container){
			boxes.push(container);
		}
		var container = this.showTagInfo(item);
		if(container!=null){
			boxes.push(container);
		}
	}
	var itemsBox = Ext.create('Ext.container.Container', {
		layout: {type: 'table',columns: 1, tableAttrs: {style: {width: '100%'}}},					       
		items:boxes
	});
	return itemsBox;
};


ResultWidget.prototype.showInfo = function (item){
	var _this=this;
	
	
	var itemTpl = new Ext.XTemplate(
//			'<tpl for="tags">',
//			'<span class="ok">{.} </span>:: ',
//			'</tpl>',
//			'<span class="err">{type} </span>',
			'<span class="key">{title} </span>',
			'<span class="{[ this.setCSS(values) ]}">{value}</span><br>'
	,
	{
	 // XTemplate configuration:
	disableFormats: true,
    // member functions:
	setCSS: function(item){
    	switch(item.type){
    		case 'FILE':
			return 'file';
			break;
			case 'MESSAGE':
				//Setting species code 
				if (item.name == "species"){
					_this.species=item.value;
				}
			return 'message';
			break;
    	}
    }
    
	});
	//fin template
	
	return itemBox = Ext.create('Ext.container.Container', {
		data:item,
		datos:item,
		margin:"0 10 0 20",
		padding:5,
		tpl:itemTpl,
		cls:"inlineblock",
		listeners:{
			afterrender:function(){
				var datos = this.datos;
				if(this.datos.type == 'FILE'){
					this.getEl().addClsOnOver("encima");
					this.getEl().addCls("whiteborder");
					
	    			if(_this.application=="variant" && datos.title.toLowerCase().indexOf("filter")!=-1){
	    				_this.filteredVcfFile=datos.value;
	    			}
					
	    			this.getEl().on("click",function(){
	    				console.log(datos);
	    				var value = datos.value;
		    			_this.adapter.poll(_this.jobId, value, true, $.cookie('bioinfo_sid'));
	    			});
	    		}
			}
		}
	});
};


ResultWidget.prototype.showTypeInfo = function (item){
	var _this=this;
	var box = Ext.create('Ext.container.Container',{
		margin:"0 10 0 10",
		padding:5
	});
	switch(item.type){
		case 'IMAGE':
				/*width="400" height="200" */
			box.html =  '<div><img width="900" src="'+_this.adapter.pollurl(_this.jobId,item.value,$.cookie('bioinfo_sid'))+'"></div>';
			return box;
		break;
		default: return null;
	}
};

ResultWidget.prototype.showTagInfo = function (item){
	var _this=this;
	var box = Ext.create('Ext.container.Container',{
		margin:"0 10 0 10",
		flex:1,
		padding:5,
		html:""
	});
	for(var i = 0; i < item.tags.length ; i++){
    	switch(item.tags[i]){
    		case 'TABLE':
        		var id = _this.jobId+item.value+item.tags;
        		var value = item.value;
				_this.resultTables[id] =  new ResultTable (_this.jobId, value, item.tags,{targetId:'resultTable_'+id});
//							_this.resultTables[id].onRendered.
				box.html +=  '<div id="resultTable_'+id+'" style="padding:5px;"></div>';
				return box;
			break;
    		case 'HISTOGRAM':
    			var id = "histogram_"+_this.jobId+item.value+item.tags;
    			_this.resultHistograms[id] = item.value;
    			box.html =  '<div id="'+id+'" style="padding:5px;"></div>';
    			return box;
			break;
    		case 'GCHART':
    			var id = 'gchart_'+item.name;
    			_this.resultGCharts[id] = item.value;
    			box.html =  '<div id="'+id+'"></div>';
    			return box;
    		break;
    		case 'CONSEQUENCE_TYPE_VARIANTS':
    			this.variantFiles[item.name] = item.title;
    		break;
    	}
	}
	return null;
};

ResultWidget.prototype.drawTables = function (){
//	console.log(this.resultTables);
	for(id in this.resultTables){
		this.resultTables[id].draw();
	}	
};

ResultWidget.prototype.drawHistograms = function (){
	//se dibujan todas las tablas
//	console.log(this.resultHistograms);
	for(id in this.resultHistograms){
		
		var adapterPoll = new WumAdapter();
		adapterPoll.onPoll.addEventListener(function(sender,data){
			if(data!=""){
				var lines = data.split("\n");
				var fields=[];
				var names=[];
				var values=[];
				var normValues=[];
				var total = 0;
				for ( var i = 0; i < lines.length; i++) {
					fields.push(lines[i].split("\t"));
					if(fields[i][0]!=""){
						names.push(fields[i][0]);
					}
					if(fields[i][1]!=null){
						total = total + parseFloat(fields[i][1]);
						values.push(fields[i][1]);
					}
				}
				for ( var i = 0; i < values.length; i++) {
					normValues.push(Math.round(parseFloat(values[i])/total*100));
				}
				names = names.toString().replace(/,/gi,"|");
				var img = '<img src="https://chart.googleapis.com/chart?cht=p&chs=600x300&chd=t:'+normValues+'&chl='+names+'&chtt=Consequence+types&chts=000000,14.5">';
				document.getElementById(id).innerHTML=img;
			}
		});
		adapterPoll.poll(this.jobId,this.resultHistograms[id],false,$.cookie('bioinfo_sid'));
		
	}	
};
ResultWidget.prototype.drawGCharts = function (){
	for(id in this.resultGCharts){
		drawChart(id, this.resultGCharts[id]);
	}
};

ResultWidget.prototype.drawApplicationItems  = function (){
	var _this=this;
	var viewerContainer = Ext.create('Ext.container.Container', {
		id:this.application+this.id+"Container",
		border: true,
		margin:"50 50 0 50",
		html:'<div class="greyborder" id="'+this.id+'Container"></div><div style="height:40px"></div>'
	});
		
	switch (this.application){
	case "variant":
		viewerContainer.on("afterrender",function(){
			_this.createGenomeViewer(_this.id+"Container");
		});
		break;
	case "renato":
		//***********bar
		var pbar = Ext.create('Ext.ProgressBar', {id:this.id+'pbar',margin:"5 0 0 50",width: 500});
		// Wait for 5 seconds, then update the status el (progress bar will auto-reset)
		pbar.wait({
			interval: 500, //bar will move fast!
			duration: 50000,
			increment: 15,
			text: 'Getting database information and drawing the network, please wait...',
			scope: this,
			fn: function(){
				pbar.updateText('Done!');
			}
		});
		//Add de bar to the main panel
		this.panel.add(pbar);
		/*************************/
		viewerContainer.on("afterrender",function(){
			_this.createCellBrowser(_this.id+"Container");
		});
		break;
	
	default: return null;
	}
		
	this.panel.add(viewerContainer);
};


ResultWidget.prototype.createGenomeViewer = function (targetId){
	var _this = this;

	var width = Ext.getCmp(this.application+targetId).getWidth();
	var height = Ext.getCmp(this.application+targetId).getHeight();
		
	//var genomeViewer = new GenomeViewer(targetId, AVAILABLE_SPECIES[0],{
		//version:"",
		//zoom:75,
		//width:width-2,
		//height:height-2
	//});
	//genomeViewer.setMenuBar(this.getGenomeViewerResultBar(genomeViewer));
	

	genomeViewer = new GenomeViewer(targetId, DEFAULT_SPECIES,{
		sidePanelCollapsed:true,
		width:width-2,
		height:700-2
	});
	genomeViewer.afterRender.addEventListener(function(sender,event){
		_this.app.setTracks(genomeViewer);
		genomeViewer.addSidePanelItems();
		var variantFilterWidget = new VariantFilterWidget(_this.jobId,{
				width:width-2,
				targetId:_this.application+targetId,
				viewer:genomeViewer,
				fileNames:_this.variantFiles
		});
	});
	genomeViewer.draw();
	
	var adapter = new WumRestAdapter();
	adapter.onPoll.addEventListener(function(sender, data){
		var vcfDataAdapter = new VCFDataAdapter(new StringDataSource(data),{async:false,species:genomeViewer.species});
		var vcfTrack = new TrackData("VCF file",{
			adapter: vcfDataAdapter
		});
		genomeViewer.addTrack(vcfTrack,{
			id:"VCF file",
			featuresRender:"MultiFeatureRender",
			histogramZoom:50,
			height:150,
			visibleRange:{start:0,end:100},
			featureTypes:FEATURE_TYPES
		});
		//var feature = vcfDataAdapter.featureCache.getFirstFeature();
		//genomeViewer.region.load(feature);
		//genomeViewer.setRegion({sender:""});
//		genomeViewer.setZoom(75);
	});
	
	
//	console.log(this.filteredVcfFile)
	if(this.filteredVcfFile != null){
		adapter.poll(_this.jobId, this.filteredVcfFile, false, $.cookie('bioinfo_sid'));
	}else{
		console.log("No filtered VCF file.");
	}
};



var mostSignificativesFeatures = new Array();
ResultWidget.prototype.createCellBrowser = function (targetId){
	var _this = this;
	record = this.record;
	
	//hide network-viewer, all nodes mut be rendered before show
	Ext.getCmp(this.application+targetId).disable();
	
	var width = Ext.getCmp(this.application+targetId).getWidth();
	var height = Ext.getCmp(this.application+targetId).getHeight();
	
	//Pako creating cellBrowser
	this.networkViewer = new NetworkViewer(targetId,this.getSpeciesItem(this.species),{
		width:width-2,
		height:height-2
	});
//	this.networkViewer.setSpeciesMenu(AVAILABLE_SPECIES);
	this.networkViewer.draw();

	
	
	
	//setting a empty data and format, nodes will be draw later using the interface
	var dataset = new GraphDataset();
	var layout = new LayoutDataset();
	var formatter = new NetworkDataSetFormatter({
		"defaultFormat": {"type":"LineEdgeNetworkFormatter","opacity":1, "fill":"#000000", "radius":"5", "strokeWidth":"1", "stroke":"#000000", "size":"2", "title":{"fontSize":10, "fill":"#000000"}},
		"selected": {"opacity":0.9, "fill":"#FF0000", "radius":"5", "stroke":"#000000",  "size":"2"},
		"over": {"opacity":1, "fill":"#DF0101", "radius":"5", "stroke":"#000000",   "size":"2", "strokeWidth":"1"}
	}, 
	{
		"defaultFormat": {  "opacity":0.8,"stroke":"#000000", "strokeWidth":"1", "strokeOpacity":0.5, "title":{"fontSize":6, "fontColor":"#000000"}},
		"selected": {"stroke":"#DF0101", "fill":"#FF0000"},
		"over": { "stroke":"#DF0101","strokeOpacity":1, "strokeWidth":"4"}
	},
//		{ "labeled":false, "height":height,"width":this.width,"right":this.width,"backgroundColor":"#FFFFFF", "balanceNodes":false, "nodesMaxSize":4, "nodesMinSize":2});		
	{ "labeled":false, "backgroundColor":"#FFFFFF", "balanceNodes":false, "nodesMaxSize":4, "nodesMinSize":2});		
	formatter.dataBind(dataset);
	layout.dataBind(dataset);
	
	formatter.setHeight(height - 140);
	formatter.setWidth(width-2-13);
	this.networkViewer.drawNetwork(dataset, formatter, layout);
	
	
	
	//Getting significant_your_annotation_0.05.txt
	var adapter2 = new WumRestAdapter();
	adapter2.onPoll.addEventListener(function(sender, data){
		var lines = data.split("\n");
		var significativesFeatures = new Array();
		for ( var i = 1; i < lines.length; i++) {
			var column = 13;
			if(record.data.toolName == "fatiscan"){
				if(lines[i].split("\t").length==7){
					//we are in the case of logistic model
					column = 6;
				}
			}
			var significativeValue = lines[i].split("\t")[column];
			if(significativeValue < 1000000){
				significativesFeatures.push(lines[i].split("\t")[0]);
			} 
		}
		console.log('significativesFeatures.length: '+significativesFeatures.length);
		
		
		/** TFBS **/
		var adapter3 = new WumRestAdapter();
		adapter3.onPoll.addEventListener(function(sender, data){
			var genes = data.split("\n");
			/** Para elminar la linea en blanco: Gorrion Rules! **/
			genes.pop();
			console.log('genes.length: '+genes.length);
			_this.loadNetworkOnCellBrowser(genes, significativesFeatures, targetId);
		});

		var file = "clean_list1.txt";
		if(record.data.toolName == "fatiscan")
			file = "id_list.txt";
		adapter3.poll(_this.jobId, file, false, $.cookie('bioinfo_sid'));
	});
	adapter2.poll(this.jobId, "significant_your_annotation_0.05.txt", false, $.cookie('bioinfo_sid'));
	//END getting significant_your_annotation_0.05.txt
		
	
	
	
	// By Nacho
	// getting 50 most significant genes
	console.log('getting ranked_list...');
	var cleanListWumAdapater = new WumRestAdapter();
	cleanListWumAdapater.onPoll.addEventListener(function(sender, data) {
		var lines = data.split("\n");
		var numGenes = lines.length;
		var cont = 0;
		console.log('getting top clean_list...');
		for(var i = 0; cont < 50 && i < numGenes; i++) {
			if(lines[i].indexOf('#') < 0) {
//				console.log('getting top ranked_list... '+lines[i]);
//				console.log('getting top ranked_list... '+lines[i].split("\t")[0]);
				mostSignificativesFeatures[lines[i].split("\t")[0]] = true;
				cont++;
			}
		}
		cont = 0;
		console.log('getting bottom clean_list...');
		for(var i = numGenes-1; cont < 50 && i > 0; i--) {
			if(lines[i].indexOf('#') < 0) {
				mostSignificativesFeatures[lines[i].split("\t")[0]] = true;
				cont++;
			}
		}
	});
	cleanListWumAdapater.poll(this.jobId, "clean_list1.txt", false, $.cookie('bioinfo_sid'));
	// END getting 50 most significant genes
	
	
	
	
	// getting ranked_list
	console.log('getting ranked_list...');
	var rankedListWumAdapater = new WumRestAdapter();
	rankedListWumAdapater.onPoll.addEventListener(function(sender, data) {
		var lines = data.split("\n");
		var numGenes = lines.length;
		var cont = 0;
		console.log('getting top ranked_list...');
		for(var i = 0; cont < 50 && i < numGenes; i++) {
			if(lines[i].indexOf('#') < 0) {
				mostSignificativesFeatures[lines[i].split("\t")[0]] = true;
				cont++;
			}
		}
		cont = 0;
		console.log('getting bottom ranked_list...');
		for(var i = numGenes-1; cont < 50 && i > 0; i--) {
			if(lines[i].indexOf('#') < 0) {
				mostSignificativesFeatures[lines[i].split("\t")[0]] = true;
				cont++;
			}
		}
	});
	rankedListWumAdapater.poll(this.jobId, "ranked_list.txt", false, $.cookie('bioinfo_sid'));
	//END getting ranked_list	
		
};


ResultWidget.prototype.loadNetworkOnCellBrowser = function (genes, tfbs, targetId){
	var _this = this;

	//tfbs and mirna nodes are rendered
	//2 indicates that mirna and tfbs are done 
	var nodesRendered = 0;

	//Getting tfbs by gene
	var cellBaseManager = new CellBaseManager(this.networkViewer.species);
	cellBaseManager.success.addEventListener(function (evt, response){
		var data_tfbs = response.result;
		var tfbsByGene = new Object();
		for (var i = 0; i < data_tfbs.length; i++){
			for ( var j = 0; j < data_tfbs[i].length; j++) {
				if(tfbs.toString().indexOf(data_tfbs[i][j].tfName) != -1){
					if (tfbsByGene[data_tfbs[i][j].tfName] == null){
						tfbsByGene[data_tfbs[i][j].tfName] = new Object();
					}

					if(tfbsByGene[data_tfbs[i][j].tfName][genes[i]] == null){
						tfbsByGene[data_tfbs[i][j].tfName][genes[i]] = true;
					}
				}
			}
		}
		console.log(tfbsByGene);
		console.log(data_tfbs.length);
		console.log('contando TFBSs...');
		// check the number of elemts to be rendered
		// if there are more than 500 then select the most significant
		var numElements = 0;
		for ( var tf in tfbsByGene) {
			if(numElements > 500) {
				break;
			}
			for ( var gene in tfbsByGene[tf]) {
				numElements++;
			}
		}
		console.log('menos de 500: '+numElements);
		for ( var tf in tfbsByGene) {
			_this.networkViewer.networkWidget.getDataset().addNode(tf, {type:"tf"});
			var verticeId = _this.networkViewer.networkWidget.getDataset().getVerticesCount() - 1;
			_this.networkViewer.networkWidget.getFormatter().getVertexById(verticeId).getDefault().setFill("#DF0101");

//			console.log(tfbsByGene[tf]);
//			console.log(_this.networkViewer.networkWidget.getFormatter().getVertexById(verticeId));
			for ( var gene in tfbsByGene[tf]) {
				if(numElements < 500 || mostSignificativesFeatures[gene] == true) {
//					console.log(gene);
					/** Conecto los tfbs con sus genes **/
					if(_this.networkViewer.networkWidget.getDataset().getVertexByName(gene).length == 0){
						_this.networkViewer.networkWidget.getDataset().addNode(gene, {type:"gene"});
					}

//					console.log(_this.networkViewer.networkWidget.getDataset());
					// getVertexByName returns an array

					var vertexGeneId = _this.networkViewer.networkWidget.getDataset().getVertexByName(gene)[0].id;
					var vertexTfbsId = _this.networkViewer.networkWidget.getDataset().getVertexByName(tf)[0].id;
					_this.networkViewer.networkWidget.getDataset().addEdge("tfbs_" + vertexGeneId + "_" + vertexTfbsId, vertexTfbsId, vertexGeneId);
					_this.networkViewer.networkWidget.getFormatter().getVertexById(vertexGeneId).getDefault().setFill("#0000FF");
				}
			}
		}


		_this.networkViewer.networkWidget.getLayout().getLayout("neato");
		_this.networkViewer.networkWidget.getLayout().layoutDone.addEventListener(function (evt){
			nodesRendered++;
			if(nodesRendered==2){
				Ext.getCmp(_this.id+'pbar').destroy();
				Ext.getCmp(_this.application+targetId).enable();
			}
		});
	});
	if(genes.length>0){
		cellBaseManager.get("feature", "gene", genes, "tfbs");
	}
	//getting mirna target by gene
	var cellBaseManagerMirna = new CellBaseManager(this.networkViewer.species);
	cellBaseManagerMirna.success.addEventListener(function (evt, response){
		var data_tfbs = response.result;
		var tfbsByGene = new Object();
		for (var i = 0; i < data_tfbs.length; i++){
			for ( var j = 0; j < data_tfbs[i].length; j++) {

				if(tfbs.toString().indexOf(data_tfbs[i][j].mirbaseId) != -1){
					if (tfbsByGene[data_tfbs[i][j].mirbaseId] == null){
						tfbsByGene[data_tfbs[i][j].mirbaseId] = new Object();
					}

					if(tfbsByGene[data_tfbs[i][j].mirbaseId][genes[i]] == null){
						tfbsByGene[data_tfbs[i][j].mirbaseId][genes[i]] = true;
					}
				}
			}
		}
		console.log(tfbsByGene);
		console.log(data_tfbs.length);
		console.log('contando miRNAs...');
		// check the number of elemts to be rendered
		// if there are more than 500 then select the most significant
		var numElements = 0;
		for ( var tf in tfbsByGene) {
			if(numElements > 500) {
				break;
			}
			for ( var gene in tfbsByGene[tf]) {
				numElements++;
			}
		}
		console.log('menos de 500: '+numElements);
		for ( var mirna in tfbsByGene) {
			_this.networkViewer.networkWidget.getDataset().addNode(mirna, {type:"mirna"});
			var verticeId = _this.networkViewer.networkWidget.getDataset().getVerticesCount() - 1;
			_this.networkViewer.networkWidget.getFormatter().getVertexById(verticeId).getDefault().setFill("red");
			for ( var gene in tfbsByGene[mirna]) {
				if(numElements < 500 || mostSignificativesFeatures[gene] == true) {
//					console.log(gene);
					if(_this.networkViewer.networkWidget.getDataset().getVertexByName(gene).length == 0){
//						if(_this.networkViewer.networkWidget.getDataset().getVertexByName(gene) == null) {
						_this.networkViewer.networkWidget.getDataset().addNode(gene, {type:"gene"});
					}

					var vertexGeneId = _this.networkViewer.networkWidget.getDataset().getVertexByName(gene)[0].id;
					var vertexTfbsId = _this.networkViewer.networkWidget.getDataset().getVertexByName(mirna)[0].id;
					_this.networkViewer.networkWidget.getDataset().addEdge("tfbs_" + vertexGeneId + "_" + vertexTfbsId, vertexTfbsId, vertexGeneId);
					_this.networkViewer.networkWidget.getFormatter().getVertexById(vertexGeneId).getDefault().setFill("blue");

					var edgeId = _this.networkViewer.networkWidget.getDataset().getEdgesCount() - 1;


					_this.networkViewer.networkWidget.getFormatter().changeEdgeType(edgeId, "CutDirectedLineEdgeNetworkFormatter");
				}

			}
		}    


		_this.networkViewer.networkWidget.getLayout().getLayout("neato");
		_this.networkViewer.networkWidget.getLayout().layoutDone.addEventListener(function (evt){
			nodesRendered++;
			if(nodesRendered==2){
				Ext.getCmp(_this.id+'pbar').destroy();
				Ext.getCmp(_this.application+targetId).enable();
			}
		});

	});
	if(genes.length>0){
		cellBaseManagerMirna.get("feature", "gene", genes, "mirna_target");    
	}else{
		Ext.getCmp(_this.id+'pbar').destroy();
		Ext.getCmp(_this.application+targetId).enable();
	}
};



ResultWidget.prototype.getGenomeViewerResultBar = function(genomeViewer) {
	var _this=this;

	switch (this.application){
	case "variant":
		var toolbarMenu = Ext.create('Ext.container.Container', {
			cls:'bio-toolbar',
			defaults:{margin:'1 0 0 2'},
			layout:'vbox',
			height:27,
			items : [
				{xtype:'button',text:'<span class="info">Variant filter tool...</span>',handler:function(){
						var variantFilterWidget = new VariantFilterWidget(_this.jobId,{viewer:genomeViewer,fileNames:_this.variantFiles});
//						variantFilterWidget.draw();
//						variantFilterWidget.parseData(data);
//						var wumRestAdapter = new WumRestAdapter();
//						wumRestAdapter.onPoll.addEventListener(function(sender, data){
//						});
						
//						wumRestAdapter.poll(_this.jobId, "variant.txt", false, $.cookie('bioinfo_sid'));
					}
				}
			]
		});
		return toolbarMenu;
		break;
		
	
	default: return null;
	}
};


ResultWidget.prototype.getSpeciesItem = function(species) {
	//selecciona el objeto AVAILABLE_SPECIES segun el species code
	for ( var i = 0; i < AVAILABLE_SPECIES.length; i++) {
		if(AVAILABLE_SPECIES[i].species==species){
			return AVAILABLE_SPECIES[i];
		}
	}
};

//Quita los resultados para your annotation
ResultWidget.prototype.checkPValue = function(str) {
	//return false si es 0.005, 0.01 ó 0.1
	if(str.indexOf("pvalue<0.005")!= -1 ||
		str.indexOf("pvalue<0.01")!= -1 ||
		str.indexOf("pvalue<0.1")!= -1
	){
		return false;
	}
	return true;
};

//Quita los resultados para your annotation
ResultWidget.prototype.renamePValue = function(item) {
	//reemplaza la cadena ${pvalue} por 0.05
	if(item.value.indexOf("${pvalue}") != -1){
		item.value = item.value.replace(/\$\{pvalue\}/gi, "0.05");
	}
};

//XXX no se usa por ahora...Para mas adelante
ResultWidget.prototype.setPValue = function(value) {
	console.log(this.id);
	var divId="#pvalue"+this.id;
	$(divId).html(value);
};

//Quita los resultados para your annotation
ResultWidget.prototype.getInfo = function(groupName) {
	switch (this.application){
	case "renato":
		switch (groupName){
			case "Input data": return "This section is a reminder of the parameters or settings you have submitted to run the analysis.";
			case "Summary": return "<p>This section shows the number of genes annotated to each database in each list.</p><br><p>Gene list: contains three elements, the number of genes in your gene list annotated in the database over the total number of genes remaining in your gene list after the duplicates management, a percentage of genes in your gene list annotated in the database and the ratio of regulators per gene.<br> Genome: the same structure explained above but applied to the whole genome (TFBS or miRNA) or Your Annotations after the duplicates management.</p>";
			case "Significant Results":  return "<p>We consider a significant enrichment after correcting the results by a multiple testing correction method. Enrichment p-values are corrected applying the False discovery rate (FDR) method (Benjamini et al., 1995; Storey andTibshirani, 2003). The threshold of signification applied to the correction has been set to 0.05.</p><br><p>The table provided summarizes the information about the enrichment test for each of the significant regulatory elements that have an Adjusted p-value < 0.05. The table is originally sorted by adjusted p-value and can be sorted up and down by clicking in any of the other column headings. When the number of significant results in a table is higher than five, results are split into different pages. You can move forward or backward in the page list using the arrow buttons.</p>";
			case "All results": return "This section contains a downloadable individual text file containing all results for all significant and not significant regulators. This file follows the same structure described above.";
			case "Annotation files": return "<p>When significant results are obtained, we can suppose that there is one or several regulatory elements behaving different when comparing groups. The list of genes included in the analysis have pointed to a significantly over-represented set of common regulators to these genes. The interpretation of the results will be different in the case of TFs (transcription factors) and miRNAs given that (generally) the first are positive regulators and the latter are negative regulators.</p><br><p>TFs generally bind to the promoter region of their target genes to assist and promote the transcription. miRNAs, on the other hand, bind to transcript products preventing them from being translated. Significant TF and miRNAs can be pointed to be responsible for the differential expression of the genes observed in the list. We must take special care in the interpretation of over-expressed or under-expressed genes in a functional analysis. In the case of TFs, if we are working with the list of over-expressed genes, the significant results makes reference to active TFs in one condition with respect to the other; while significant results of under-expressed genes makes reference to inactive TFs. In miRNAs, significant results of over-expressed genes will point to inactive miRNAs, while significant results of under-expressed genes will point to active miRNAs when comparing conditions.</p>";
			default: return "";
		}
	break;
	case "variant":
		switch (groupName){
			case "Variants by Consequence Type": return "Click this link: <a class='ok' target='_blank' href='http://docs.bioinfo.cipf.es/projects/variant/wiki/Output_columns'>Output columns</a>";
			default: return "";
		}
	break;
	
	default: return "";
	}
};

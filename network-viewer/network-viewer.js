function NetworkViewer(targetId, species, args) {
	var _this = this;
	this.id = "NetworkViewer"+ Math.round(Math.random()*10000);
	
	this.menuBar = null;
	
	// if not provided on instatiation
	this.width =  $(document).width();
	this.height = $(document).height();
	this.targetId=null;
	
	//Default species
	this.species="hsa";
	this.speciesName="Homo sapiens";
	
	//Setting paramaters
	if (targetId != null){
		this.targetId=targetId;
	}
	if (species != null) {
		this.species = species.species;
		this.speciesName = species.name;
	}
	if (args != null){
		if(args.description != null){
			args.description = "beta";
		}
		if (args.width != null) {
			this.width = args.width;
		}
		if(args.menuBar != null){
			this.menuBar = args.menuBar;
		}
		if (args.height != null) {
			this.height = args.height;
		}
		if (args.pluginsMenu != null) {
			this.pluginsMenu = args.pluginsMenu;
		}
	}
	
	/** Network Data object **/
	this.networkData = new NetworkData();
	
	this.drawZoneWidth = this.width-12;
//	this.drawZoneHeight = this.height-148;
//	this.drawZoneHeight = this.height-140;//menu
	this.drawZoneHeight = this.height-112;//SBGN
	
	//Events i send
	this.onSpeciesChange = new Event();
	
	console.log(this.width+"x"+this.height);
	console.log(this.targetId);
	console.log(this.id);
	
	//Events i listen
	this.onSpeciesChange.addEventListener(function(sender,data){
		_this.species=data.species;
		_this.speciesName=data.name;
		Ext.getCmp(_this.id+"speciesMenuButton").setText(_this.speciesName);
		Ext.getCmp(_this.id+"specieInfoLabel").setText(data.species);
		Ext.example.msg('Species', _this.speciesName+' selected.');
		
		_this.networkMetaDataViewer.setSpecies(data.species);
		_this.networkWidget.setSpecies(data.species);
//		_this.pathwayTreeViewer.setSpecies(data.species);
	});
	
	
//	if (args != null){
//		if ((args.height == null) && (args.width == null)){
//			this.drawZoneWidth = window.innerWidth-13;
//			this.drawZoneHeight = window.innerHeight-241;
//		}
//		
//	}
	
	
//	this.networkBackgroundSettings.specieChanged.addEventListener(function(sender, specie){
//		_this.setSpecies(specie);
//	});
	
	
};

NetworkViewer.prototype.draw = function(){
	if(this.targetId!=null){
		this._getPanel(this.width,this.height);
	}
	this.render();
};

NetworkViewer.prototype.render = function(){
	var div = $('#'+this.getGraphCanvasId())[0];
	this.networkSvg = new NetworkSvg(div, this.networkData, {"width": this.drawZoneWidth, "height": this.drawZoneHeight});
	
	this.networkEditorBarWidget.setNetworkSvg(this.networkSvg);
};


//Gets the panel containing all genomeViewer
NetworkViewer.prototype._getPanel = function(width,height) {
	var _this=this;
	if(this._panel == null){
		
		
//		//TODO PARA TEST, esto debe ser llamado por cellbrowser
//		this.menuBar = this.getMenu();
		
		this.networkEditorBarWidget = new NetworkEditorBarWidget(this);
		var editorBar = this.networkEditorBarWidget.getBar();
		
		this.container = Ext.create('Ext.container.Container', {
//			id:this.getGraphCanvasId(),
			padding:5,
			flex:1,
			style:"background: whiteSmoke;",
//			id: this.getGraphCanvasId(),
			cls:'x-unselectable',
//			html:'<div class="x-unselectable" style="width:'+this.width+'px;height:800px;" id="'+this.getGraphCanvasId()+'"></div>'
			html:'<div id="'+this.getGraphCanvasId()+'" style="border:1px solid #bbb;"></div>'
//			listeners:{
//				resize: function ( cont, adjWidth, adjHeight){
////					console.log(adjWidth);
////					console.log(adjHeight);
//				}
//			}
		});
		
		var items = [];
		if(this.menuBar!=null){
			items.push(this.menuBar);
			this.drawZoneHeight = this.drawZoneHeight-28;
		}
		items.push(this.getOptionBar());
		items.push(editorBar);
		
		
		items.push(this.container);
		items.push(this.getInfoBar());
		
		
		this._panel = Ext.create('Ext.panel.Panel', {
			renderTo:this.targetId,
			border : false,
	    	width:width,
	    	height:height,
			cls:'x-unselectable',
			layout: { type: 'vbox',align: 'stretch'},
			region : 'center',
			margins : '0 0 0 0',
			items :items
		});
		
//		this._panel = Ext.create('Ext.container.Container', {
//			id:this.id+"container",
//			renderTo:this.targetId,
//			width:width,
//	    	height:height,
//			cls:'x-unselectable',
//			layout: { type: 'vbox',align: 'stretch'},
//			region : 'center',
//			margins : '0 0 0 0',
//			items :items
//		});
	}
	
	return this._panel;

	
};

//NetworkViewer.prototype.setSize = function(width,height) {
//	this.width=width;
//	this.height=height;
//	this._getPanel().setSize(width,height);
//	this.draw();
//};


//Creates the species empty menu if not exist and returns it
NetworkViewer.prototype._getSpeciesMenu = function() {
	//items must be added by using  setSpecieMenu()
	if(this._specieMenu == null){
		this._specieMenu = Ext.create('Ext.menu.Menu', {
			margin : '0 0 10 0',
			floating : true,
			items : []
		});
	}
	return this._specieMenu;
};
//Sets the species buttons in the menu
NetworkViewer.prototype.setSpeciesMenu = function(speciesObj) {
	var _this = this;
	//Auto generate menu items depending of AVAILABLE_SPECIES config
	var menu = this._getSpeciesMenu();
	menu.hide();//Hide the menu panel before remove
	menu.removeAll(); // Remove the old species
	for ( var i = 0; i < speciesObj.length; i++) {
		menu.add({
					text:speciesObj[i].name,
					species:speciesObj[i].species,
					handler:function(este){
						//can't use the i from the FOR so i create the object again
						_this.setSpecies({name: este.text, species: este.species});
				}
		});
	};
};
//Sets the new specie and fires an event
NetworkViewer.prototype.setSpecies = function(text){
	this.onSpeciesChange.notify(text);
};

/** For testing pathways **/
//function test(arg){
//	if (arg != null){
//		NetworkViewer.counter = arg;
//		NetworkViewer.pathwayTreeViewer.getData();
//	}
//	NetworkViewer.counter++;
//	NetworkViewer.testPathways();
//	setTimeout("test()",10000);
//}
//
//
//NetworkViewer.prototype.testPathways = function(){
//	try{
//		//this.counter++;
//		this.testPathway(this.pathwayTreeViewer.getPathways()[this.counter]);
//	}
//	catch(e){
//		console.log("ERROR en: " + this.pathwayTreeViewer.getPathways()[this.counter]);
//	}
//};
//NetworkViewer.prototype.testPathway = function(id){
//	console.log("[Testing Pathway] " + this.counter + " -->" + id);
//	Ext.example.msg("[Testing Pathway] " + this.counter + " -->" + id, "");
//	this.loadingImageWindow.show(); 
//	this.pathwayTreeViewer.getDot(id);
//	var _this = this;
//	var _id = id;
//	this.pathwayTreeViewer.rendered.addEventListener(function(){
//		_this.loadingImageWindow.hide(); 
//	});
//	_this.pathwayTreeViewer.selected.addEventListener(function(){
//		_this.loadingImageWindow.hide(); 
//		_this.draw(_this.pathwayTreeViewer.dataset, _this.pathwayTreeViewer.formatter, _this.pathwayTreeViewer.layout);
//	});
//};
/** En testing pathways **/	


//NetworkViewer.prototype.getSpecies = function(){
//	return this.networkMetaDataViewer.getSpecies();
//};

	
//NetworkViewer.prototype.drawUI = function(){
//	this.drawMenuBar(this.width, this.height);
//};
//
//
//NetworkViewer.prototype.drawNetwork = function(dataset, formatter, layout){
//	var _this = this;
//	
////	console.log(dataset);
////	console.log(formatter);
////	console.log(layout);
//	
//	this.networkMetaDataViewer.setDataset(dataset);
//	this.networkMetaDataViewer.setFormatter(formatter);
//	this.networkMetaDataViewer.setLayout(layout);
//	
//	this.networkMetaDataViewer.getMetaNetwork().dataBind(this.networkMetaDataViewer.getDataset());
//	
//	document.getElementById(this.getGraphCanvasId()).innerHTML ="";
//	
////	var newHeight = this.height - 27;//this.menuToolbar.getHeight();
//	
//	this.networkWidget = new NetworkWidget(this.species,{targetId: this.getGraphCanvasId()});
//	this.networkWidget.draw(this.networkMetaDataViewer.getDataset(), this.networkMetaDataViewer.getFormatter(), this.networkMetaDataViewer.getLayout());
//	
//	this.networkWidget.onVertexOver.addEventListener(function(sender, nodeID){
//		_this.setNodeInfoLabel(_this.networkWidget.getDataset().getVertexById(nodeID).getName());
//	});
//	
//	this.networkWidget.onVertexOut.addEventListener(function(sender, nodeID){
//		_this.setNodeInfoLabel("");
//	});
//	
//	
//	this.networkEditorBarWidget.setNetworkWidget(this.networkWidget.getGraphCanvas()); 
//	
//	
//	// With attach the two events and with this variable=false we say that we want to retrieve all the information from cellBase again
//	this.networkMetaDataViewer.getDataset().newVertex.addEventListener(function (sender, node){
//		_this.networkMetaDataViewer.getMetaNetwork().setInformationRetrieved(false);
//		_this.networkMetaDataViewer.getMetaNetwork().addNode(node);
//	});
//	this.networkMetaDataViewer.getDataset().vertexNameChanged.addEventListener(function (sender, args){
//		var item = args.item;
//		_this.networkMetaDataViewer.getMetaNetwork().getVertexById(item.id).setName(item.name);
//		_this.networkMetaDataViewer.getMetaNetwork().getVertexById(item.id).setFilled(false);
//		_this.networkMetaDataViewer.getMetaNetwork().setInformationRetrieved(false);
//	});
//};	



//NetworkViewer.prototype.loadDOT = function(networkData){
////	this.draw(dotAdapter.getDataset(), dotAdapter.getFormatter(this.width, this.height), dotAdapter.getLayout());
////	openInteractomeDOTDialog.hide();
////	this.draw(dotAdapter.dataset, dotAdapter.formatter, dotAdapter.layout);
//	
//	console.log(networkData);
//};




NetworkViewer.prototype.drawConvertPNGDialog = function(content, type){
	var html = new StringBuffer();

	html.append("<form id='"+this.id+"_topng_dialog' name='input' action='" + this.networkMetaDataViewer.servletPNGURL + "' method='post'>");
	html.append("	<input type='hidden' name='filename' value='image.'"+type+"/>");
	html.append("	<input type='hidden' name='content'  value = '" + content+"' />");
	html.append("	<input type='hidden' name='type' value='"+type+"' /> ");
	html.append("</form>");

	$("#"+this.networkWidget.id).append(html.toString());
	$("#"+this.id+"_topng_dialog").submit();
};


NetworkViewer.prototype.getGraphCanvasId = function(){
	return  this.id + "_graph";
};

//NetworkViewer.prototype.getAnnotationInfo = function(){
//	if(node!=null){
//		var _this = this;
//		var id = node.getId();
//		var metaNode = this.networkMetaDataViewer.getMetaNetwork().getVertexById(id);
//		if(!metaNode.isFilled()){
//			metaNode.fillXref();
//			metaNode.onInfoRetrieved.addEventListener(function (sender){
//				_this.annotationViewer.loadData(sender);
//				_this.annotationViewer.infoWindow.show();
//			});
//		}
//		else{
//			this.annotationViewer.loadData(metaNode);
//			this.annotationViewer.infoWindow.show();
//		}
//	}
//	else{
//		this.showTopMessage("No node selected","");
//	}
//	
//};
//
//NetworkViewer.prototype.loadMetaData = function(){
//	console.log(this.openViewer);
//	var _this = this;
//    if(!this.networkMetaDataViewer.getMetaNetwork().isInformationRetrieved()){
//    	this.networkMetaDataViewer.getMetaNetwork().loadData();
//    }
//    else{
//    	if(this.openViewer == "searcherViewer")
//    		this.showSearcherViewer();
//    	if(this.openViewer == "filter")
//        		this.showFilterViewer();
//    }
//};
//NetworkViewer.prototype.showSearcherViewer = function(){
//	var _this = this;
//	this.searcherViewer.setStore(this.networkMetaDataViewer.getMetaNetwork().store);
//	this.searcherViewer.render();
//};
//
//NetworkViewer.prototype.showTopMessage = function(text, opt){
//	Ext.example.msg(text, opt);
//};
//
//NetworkViewer.prototype.drawMenuBar = function(){
//	var menuItemWidth = 125;
//
//	var _this = this;
////		var sifUpload = Ext.create('Ext.form.field.File', {
////			labelWidth: 50,
////			msgTarget: 'side',
////			allowBlank: false,
////			anchor: '100%',
////			buttonText: 'Select a SIF ...',
////			listeners: {
////				change: {
////		            fn: function(){
////						var sifdataadapter = new InteractomeSIFFileDataAdapter();
////						
////						var file = document.getElementById(sifUpload.fileInputEl.id).files[0];
//////						var file = $("#"+sifUpload.fileInputEl.id).attr('files')[0];
////						sifdataadapter.loadFromFile(file);
////						sifdataadapter.onRead.addEventListener(function (sender, id){
////							_this.loadSif(sender);
////							openSIFDialog.hide();
////						}); 
////					}
////		        }
////			}  
////		});
//		
//		var DOTUpload = Ext.create('Ext.form.field.File', {
//			labelWidth: 50,
//			msgTarget: 'side',
//			allowBlank: false,
//			anchor: '100%',
//			buttonText: 'Select a DOT ...',
//			listeners: {
//				change: {
//		            fn: function(){
//						var  sifdataadapter= new BiopaxDotFileDataAdapter();
//						var file = $("#"+DOTUpload.fileInputEl.id).attr('files')[0];
//						sifdataadapter.loadFromFile(file);
//						sifdataadapter.onRead.addEventListener(function (sender, id){
//							
//							_this.graphEditorWidget = new GraphEditor(_this.graphEditorWidgetCanvasName, document.getElementById(_this.getGraphCanvasId()));
//							_this.draw(sender.getDataset(), sender.getFormatter(_this.width, _this.height), sender.getLayout());
//							openDOTDialog.hide();
//						}); 
//					}
//		        }
//			}  
//		});
//		var interactomeDOTUpload = Ext.create('Ext.form.field.File', {
//			labelWidth: 50,
//			msgTarget: 'side',
//			allowBlank: false,
//			anchor: '100%',
//			buttonText: 'Select an InteractomeDOT ...',
//			listeners: {
//				change: {
//		            fn: function(){
//						var adapter= new InteractomeDotFileDataAdapter();
//						var file = $("#"+interactomeDOTUpload.fileInputEl.id).attr('files')[0];
//						adapter.loadFromFile(file);
//						adapter.onRead.addEventListener(function (sender){
//							_this.draw(sender.getDataset(), sender.getFormatter(_this.width, _this.height), sender.getLayout());
//							openInteractomeDOTDialog.hide();
//						}); 
//					}
//		        }
//			}  
//		});
//		
//		var jsonUpload = Ext.create('Ext.form.field.File', {
//			labelWidth: 50,
//			msgTarget: 'side',
//			allowBlank: false,
//			anchor: '100%',
//			buttonText: 'Select a JSON ...',
//			listeners: {
//				change: {
//	            fn: function(){
//					var dataadapter = new FileDataAdapter();
//					var file = document.getElementById(jsonUpload.fileInputEl.id).files[0];
//					dataadapter.read(file);
//					dataadapter.onRead.addEventListener(function (sender, content){
//						_this.loadJSON(content.content);
//						openJsonDialog.hide();
//					});
//				}
//	        }
//		}  
//		});
//		
//		
//		/****************************************************************
//		 **********	FILE MENU declaration	*****************************
//		 ****************************************************************/
//		var openJsonDialog = Ext.create('Ext.window.Window', {
//		    title: 'Open',
//		    width: 400,
//		    bodyPadding: 10,
//		    layout: 'fit',
//		    closeAction: 'hide',
//		    items: jsonUpload
//		});
////		var openSIFDialog = Ext.create('Ext.window.Window', {
////		    title: 'Open a SIF file',
////		    width: 400,
////		    bodyPadding: 10,
////		    layout: 'fit',
////		    closeAction: 'hide',
////		    items: sifUpload
////		});
//		
//		var openDOTDialog = Ext.create('Ext.window.Window', {
//		    title: 'Open a DOT file',
//		    width: 400,
//		    bodyPadding: 10,
//		    layout: 'fit',
//		    closeAction: 'hide',
//		    items: DOTUpload
//		});
//		var openInteractomeDOTDialog = Ext.create('Ext.window.Window', {
//		    title: 'Open a InteractomeDOT file',
//		    width: 400,
//		    bodyPadding: 10,
//		    layout: 'fit',
//		    closeAction: 'hide',
//		    items: interactomeDOTUpload
//		});
//		/**
//		 * data for selecting node
//		 * 
//		 */
//		Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));
//
//	    
//
//		
//		
//		var ExportToMeu = Ext.create('Ext.menu.Menu', {
//
//			items :[
//			        {
//			        	text:"PNG", 
//			        	handler:function(){
//			        		var content = _this.networkWidget.getGraphCanvas().toHTML();
//			        		_this.drawConvertPNGDialog(content,"png");
//			        	}
//			        },{
//			        	text:"JPG", 
//			        	handler:function(){
//			        		var content = _this.networkWidget.getGraphCanvas().toHTML();
//			        		_this.drawConvertPNGDialog(content,"jpg");
//			        	}
//			        },
//
//			        {
//			        	text:"SVG (recommended)",
//			        	handler:function(){
//			        		var content = _this.networkWidget.getGraphCanvas().toHTML();
//			        		var clienSideDownloaderWindowWidget = new ClienSideDownloaderWindowWidget();
//			        		clienSideDownloaderWindowWidget.draw(content, content);
//			        	}
//
//
//			        }
//			        ]
//
//		});
//		
//		
////		var exportFileMenu = new Ext.create('Ext.menu.Menu',{
////			width: menuItemWidth,
////			floating: true,
////			items: [
////			{
////				text: 'To Image',
////				menu:ExportToMeu 
////			},
////			{
////				text: 'To SIF',
////				handler:function(){
////					var content = _this.graphEditorWidget.dataset.toSIF();
////					_this.save(content,"sif");
////			}	
////			},
////			{
////				text: 'To DOT',
////				handler:function(){
////				var content = _this.graphEditorWidget.dataset.toDOT();
////				_this.save(content,"dot");
////			}
////			}]
////		});
//		
//		var importFileMenu = new Ext.create('Ext.menu.Menu', {
//			//width: menuItemWidth,
//			floating: true,
//			items: [
//				 {
//			    	   text: 'Load remote network...',
//			    	   handler: function(){
//			    	   		_this.biopaxServerSelector.render();
//			    	   		//_this.biopaxServerSelector.getSource();
//						}
//			       },
//			       {
//			    	   text: 'Upload local network',
//			    	   menu: importLocalNetwork
//				}
//			]
//		});
//	
//		
//		
//		
//		/******************************************************************************
//		 ***************	END FILE MENU	******************************************* 
//		 ******************************************************************************/
//		
//		 _this.expressionStore = Ext.create('Ext.data.ArrayStore', {
//			 autoDestroy: true,
//		        fields: [
//		           {name: 'node'},
//		           {name: 'expression',      type: 'float'},
//		           {name: 'scaled',      type: 'float'},
//		           {name: 'color'}
//		         
//		        ]
//		    });
//		
//		 
//		 var expressionUpload = Ext.create('Ext.form.field.File', {
//				labelWidth: 50,
//				msgTarget: 'side',
//				allowBlank: false,
//				anchor: '100%',
//				buttonText: 'Select ...',
//				listeners: {
//					change: {
//			            fn: function(){
//							var dataAdapter = new TabularFileDataAdapter();
//							dataAdapter.loadFromFile($("#"+expressionUpload.fileInputEl.id).attr('files')[0]);
//							dataAdapter.onRead.addEventListener(function (sender, id){
//								
////								for ( var i = 0; i < sender.lines[0].length; i++) {
////									var split = sender.lines[0][i].split(",");
////									var name = split[0];
////									var expression = split[1];
//////									
////									
////									if (_this.networkMetaDataViewer.getDataset().getVertexByName(name)!= null){
////										_this.expressionValues[_this.networkMetaDataViewer.getDataset().getVertexByName(name).getId()] = expression;
////									}
////									else{
////										console.log(name + " not found");
////										//_this.expressionValues[_this.dataset.getVertexByName(name).getId()] = Math.infinity;
////									}
////								}
//								for ( var i = 0; i < sender.lines.length; i++) {
//									var split = sender.lines[i];
//									var name = split[0];
//									var expression = split[1];
////									
//									
//									if (_this.networkMetaDataViewer.getDataset().getVertexByName(name)!= null){
//										_this.expressionValues[_this.networkMetaDataViewer.getDataset().getVertexByName(name).getId()] = expression;
//									}
//									else{
//										console.log(name + " not found");
//										//_this.expressionValues[_this.dataset.getVertexByName(name).getId()] = Math.infinity;
//									}
//								}
//								
//								openUploadExpressionFile.hide();
//								
//								var data = _this.normalize();
//				        		_this.expressionStore.removeAll();
//				        		_this.expressionStore.loadData(data, true); //["2222",1111,1111,"color"], true);
//				       
//								openExpressionWindow.show();
//							});
//						}
//			        }
//				}  
//			});
//		 
//		   var openUploadExpressionFile = Ext.create('Ext.window.Window', {
//			    title: 'Open expression file',
//			    width: 400,
//			    bodyPadding: 10,
//			    layout: 'fit',
//			    closeAction: 'hide',
//			    items: expressionUpload
//			});
//			
//			
//		 gridExpression = Ext.create('Ext.grid.Panel', {
//		        store: _this.expressionStore,
//		        stateful: true,
//		        stateId: 'stateGrid',
//		        columns: [
//		            {
//		                text     : 'node',
//		                flex     : 1,
//		                width    : 75,
//		                sortable : true,
//		                dataIndex: 'node'
//		            },
//		            {
//		                text     : 'expression',
//		                width    : 75,
//		                sortable : true,
//		                dataIndex: 'expression'
//		            },
//		            {
//		                text     : 'scaled',
//		                width    : 75,
//		                sortable : true,
//		                dataIndex: 'normalized'
//		            },
//		            {
//		                text     : 'color',
//		                width    : 75,
//		                sortable : true,
//		                dataIndex: 'color'
//		            }],
//		     height: 350,
//		     width: 350,
//		     title: 'Array Grid',
//		     viewConfig: {
//		         stripeRows: true
//		     }
//		 });
//		 
//		 
//		 
////		var openExpressionWindow = Ext.create('Ext.window.Window', {
////		    title: 'Expression',
////		    width: 400,
////		    bodyPadding: 10,
////		    layout: 'fit',
////		    closeAction: 'hide',
////		    items: [
////		            gridExpression,
////		            {
////		            	   xtype: 'button',
////		                   text : 'Apply',
////		                   handler : function() {
////		            	
////					            	var colors = _this.expressionColors;
////					        		for ( var vertex in _this.expressionColors) {
////					        			_this.networkMetaDataViewer.getFormatter().getVertexById(vertex).getDefault().setFill(_this.expressionColors[vertex]);
////					        			_this.graphEditorWidget.zoomFormatter.getVertexById(vertex).getDefault().setFill(_this.expressionColors[vertex]);
////					        		}
////		   					}
////		            }]
////		});
//		
//	    
////		var expresionExtension = new Ext.create('Ext.menu.Menu', {
////			//width: menuItemWidth,
////			floating: true,
////			items: [{
////				text: 'Upload Expression File',
////				//xtype: 'menucheckitem',
////				handler : function() {
////						openUploadExpressionFile.show();
////				}
////			},
////			{
////				text: 'Manage expression',
////				handler : function() {
////			
////					var data = _this.normalize();
////	        		_this.expressionStore.removeAll();
////	        		_this.expressionStore.loadData(data, true); 
////					 openExpressionWindow.show();
////				}
////			}
////			]
////		});
//		
//		   
//		var networkAnalysis = new Ext.create('Ext.menu.Menu', {
//			width: menuItemWidth,
//			floating: true,
//			items: [{
//				text: 'View parameters'
//			},
//			{
//				text: 'Plot parameters'
//			},
//			'-',
//			{
//				text: 'Snow'
//			},
//			{
//				text: 'Network Miner'
//			}
//			]
//		});
//
////		var extensionsMenu = new Ext.create('Ext.menu.Menu', {
////			width: menuItemWidth,
////			floating: true,
////			text: "Extensions",
////			items: [ {
////			        	text: 'Expression',
////			        	menu: expresionExtension
////			        },
////			        {
////			        	text: 'Network',
////			        	menu: networkAnalysis
////			        }
////			        ]
////		});
//
//		
//		
//		var selectMenu = new Ext.create('Ext.menu.Menu',{
//			width: menuItemWidth,
//			floating: true,
//			items: [
////					{
////						text: "Select",
////						menu: [
//			        	       	{
//			        	       		text: 'Adjacent Vertices',
//			        	       		handler: function(){
//				        	       		_this.selectAdjacent();
//			        	       		}
//			        	       	},
//			        	       	{
//			        	       		text: 'Edges',
//			        	       		handler: function(){
//				        	       		_this.selectEdgesFromVertices();
//			        	       		}
//			        	       	},
//			        	       	{
//			        	       		text: 'Neighbourhood',
//			        	       		handler: function(){
//			        	       		
//			        	       			_this.selectEdgesFromVertices();
//			        	       			_this.selectAdjacent();
//				        	       			
//				        	       			
//			        	       		}
//			        	       	}
////			        	       	,"-",
////			        	       	{
////			        	       		text: 'Collapse',
////			        	       		handler: function(){
////			        	       			_this.collapse();
////			        	       		}
////			        	       	}
//						]
////					}]
//		});
//		
//
//};




/** Este código es necesario por un bug que hay en extjs: Cuando se utiliza el scopeResetCSS: true, necesario para que convivan las css de ExtJs con otras css(babelomics.css), 
 * los menus no tienen la posición correcta, con esto se soluciona. Tiene que estar en la config del menu floating:true. Pone que se arreglará en el extjs 4.0.5,
 * para hacer un seguimiento del error acudir a esta web:  http://www.sencha.com/forum/showthread.php?138131-Ext.menu.Menu-positioning-problem-while-scopeResetCSS-true&p=618051&viewfull=1&langid=4
 * by Ralonso **/

//NetworkViewer.prototype._doConstrain = function(scope){
//	if (scope.floating) {
//		parentEl = Ext.fly(scope.el.dom.parentNode);
//		if(scope.resetEl && scope.resetEl.dom == parentEl.dom) {
//			parentEl = Ext.getBody();
//		}
//	}
//};

/*****************************************************************************************************************************/
/*****************************************************************************************************************************/
/*****************************************************************************************************************************/
/***************************************************** VAMOS A VER ***********************************************************/
/*****************************************************************************************************************************/
/*****************************************************************************************************************************/
/*****************************************************************************************************************************/
/*****************************************************************************************************************************/




/** Options handler **/
NetworkViewer.prototype.handleActionMenu = function(action, args) {
	if (action == 'select'){
		this.networkSvg.setMode("select");
	}
	
//	if (action == 'drag'){
//		this.networkSvg.setMode("drag");
//	}
	
	if (action == 'add'){
		this.networkSvg.setMode("add");
	}

	if (action == 'join'){
		this.networkSvg.setMode("join");
	}
	
	if (action == 'delete'){
		this.networkSvg.setMode("delete");
	}

	if (action == 'ZOOM'){
		this.zoomLevel = 
			this.networkWidget.setScale((args/5) * 0.1);
	}

	if (action == 'GO'){
		var name = Ext.getCmp("tbSearch").getValue();
		this.networkWidget.deselectNodes();
		this.networkWidget.selectVertexByName(name);
	}
};

NetworkViewer.prototype.getInfoBar = function() {
	var taskbar = Ext.create('Ext.toolbar.Toolbar', {
		id:this.id+'uxTaskbar',
		winMgr: new Ext.ZIndexManager(),
		enableOverflow:true,
		cls: 'bio-hiddenbar',
		height:28,
		flex:1
	});
	this.nodeInfoLabel = Ext.create('Ext.toolbar.TextItem', {
		html:''
	});
	var specieInfoLabel = Ext.create('Ext.toolbar.TextItem', {
		id:this.id+"specieInfoLabel",
		html:'hsa'
	});
	var infobar = Ext.create('Ext.toolbar.Toolbar', {
		cls:'bio-hiddenbar',
		width:300,
		height:28,
		items:['-',this.nodeInfoLabel,'->','-',specieInfoLabel]
	});
	
	this.bottomBar = Ext.create('Ext.container.Container', {
		layout:'hbox',
		cls:"bio-botbar x-unselectable",
		height:30,
		items : [taskbar,infobar]
	});
	return this.bottomBar;
	
};
NetworkViewer.prototype.setNodeInfoLabel = function(text) {
	this.nodeInfoLabel.setText(text,false);
};

/** Option bar **/
NetworkViewer.prototype.getOptionBar = function() {
	var _this = this;

	this.slider = Ext.create('Ext.slider.Single', {
				id : this.id + '_zoomSlider',
				width : 200,
				minValue : 0,
				hideLabel : false,
//				padding: '0 0 0 20',
				maxValue : 100,
				value : 50,
				useTips : true,
				increment : 1,
				tipText : function(thumb) {
					return Ext.String.format('<b>{0}%</b>', thumb.value);
				}
			});

	this.slider.on("changecomplete", function(slider, newValue) {
				_this.handleActionMenu("ZOOM", newValue);
			});

	var optionBar = Ext.create('Ext.toolbar.Toolbar', {
		cls : "bio-toolbar",
		height : 35,
		border : true,
		items : [ 
		{
			id:this.id+"speciesMenuButton",
			text : this.speciesName,
			menu : this._getSpeciesMenu()
		},
		'-',
        this.networkEditorBarWidget.collapseButton,
        this.networkEditorBarWidget.layoutButton,
        this.networkEditorBarWidget.labelSizeButton,
        this.networkEditorBarWidget.selectButton,
        '-',
        this.networkEditorBarWidget.backgroundButton,
        '-',
		{
			xtype : 'button',
			iconCls : 'icon-zoom-out',
			listeners : {
				scope : this,
				'click' : function() {
					var zoom = _this.slider.getValue();
					if (zoom > 0){
						zoom = zoom -1 ;
						_this.slider.setValue(zoom);
						this.handleActionMenu('ZOOM', zoom);
					}
				}
			}
		},  
		this.slider,
		{
			xtype : 'button',
			iconCls : 'icon-zoom-in',
			listeners : {
				scope : this,
				'click' : function() {
					var zoom = _this.slider.getValue();
					if (zoom < 100){
						zoom = zoom +1;
						_this.slider.setValue(zoom);
						this.handleActionMenu('ZOOM', zoom);
					}
				}
			}
		},
		 '->',
		{
			xtype : 'label',
			text : 'Find:',
			margins : '0 15 0 5'
		}, {
			xtype : 'textfield',
			id : 'tbSearch',
			name : 'field1',
			listeners:{
				specialkey: function(field, e){
					if (e.getKey() == e.ENTER) {
						_this.handleActionMenu('GO');
					}
				}
			}
		}, {
			xtype : 'button',
			text : 'Go',
			listeners : {
				scope : this,
				'click' : function() {
					this.handleActionMenu('GO');
				}
			}
		} ]
	});
	return optionBar;
};


NetworkViewer.prototype.getGraphCanvas = function() {
	return this.mainGraphCanvas;
};


NetworkViewer.prototype.openGeneListWidget = function(geneName) {
	var _this = this;
	var cellBase = new CellBaseDataAdapter(this.species);
	cellBase.successed.addEventListener(function(evt, data) {
		var listWidget = new ListWidget(this.species,{gridFields:null,viewer:_this});
		listWidget.draw(cellBase.dataset.toJSON(), geneName );
		/** onOk **/
		listWidget.onSelected.addEventListener(function(evt, feature) {
//			debugger
			if (feature != null) {
				var array = new Array();
				array.push("BRCA2");
				_this.networkWidget.selectVerticesByName(array);
			}
		});
	});

	cellBase.fill("feature", "gene", geneName.toString(), "info");
};





/*******************/
NetworkViewer.prototype.getSBGNToolBar = function() {
/*SBGN*/
    this.entityNodeButton = Ext.create('Ext.button.Button',{
	text : 'Add Entity Node',
	menu: new Ext.menu.Menu({
		items: [
			{text: 'unspecified entity',disabled:true,iconCls:'icon-sbgn-en1',handler: function(button){/*call*/}},
			{text: 'simple chemical',disabled:true,iconCls:'icon-sbgn-en2',handler: function(button){/*call*/}},
			{text: 'macromolecule',disabled:true,iconCls:'icon-sbgn-en3',handler: function(button){/*call*/}},
			{text: 'nucleic acid feature',disabled:true,iconCls:'icon-sbgn-en4',handler: function(button){/*call*/}},
			{text: 'perturbing agent',disabled:true,iconCls:'icon-sbgn-en5',handler: function(button){/*call*/}},
			{text: 'source sink',disabled:true,iconCls:'icon-sbgn-en6',handler: function(button){/*call*/}}
			]
	})
    });
	
    this.processNodeButton = Ext.create('Ext.button.Button',{
    	    text : 'Add Process Node',
    	    menu: new Ext.menu.Menu({
		items: [
		        {text: 'process',disabled:true,iconCls:'icon-sbgn-pn1',handler: function(button){/*call*/}},
		        {text: 'omitted process',disabled:true,iconCls:'icon-sbgn-pn2',handler: function(button){/*call*/}},
		        {text: 'uncertain process',disabled:true,iconCls:'icon-sbgn-pn3',handler: function(button){/*call*/}},
		        {text: 'association',disabled:true,iconCls:'icon-sbgn-pn4',handler: function(button){/*call*/}},
		        {text: 'dissociation',disabled:true,iconCls:'icon-sbgn-pn5',handler: function(button){/*call*/}},
		        {text: 'phenotype',disabled:true,iconCls:'icon-sbgn-pn6',handler: function(button){/*call*/}}
		        ]
    	   })
    });

    this.connectingArcsButton = Ext.create('Ext.button.Button',{
    	    text : 'Connecting arcs',
    	    menu: new Ext.menu.Menu({
                items: [
                        {text: 'consumption',disabled:true,iconCls:'icon-sbgn-ca1',handler: function(button){/*call*/}},
                        {text: 'production',disabled:true,iconCls:'icon-sbgn-ca2',handler: function(button){/*call*/}},
                        {text: 'modulation',disabled:true,iconCls:'icon-sbgn-ca3',handler: function(button){/*call*/}},
                        {text: 'stimulation',disabled:true,iconCls:'icon-sbgn-ca4',handler: function(button){/*call*/}},
                   	{text: 'catalysis',disabled:true,iconCls:'icon-sbgn-ca5',handler: function(button){/*call*/}},
                   	{text: 'inhibition',disabled:true,iconCls:'icon-sbgn-ca6',handler: function(button){/*call*/}},
                   	{text: 'necessary stimulation',disabled:true,iconCls:'icon-sbgn-ca7',handler: function(button){/*call*/}}
                   	]
    	    })
    });
    
    var sbgnLink = Ext.create('Ext.button.Button', {
    	width:43,
    	height:20,
    	margin:'0 3 0 1',
    	cls:'img-sbgn-logo',
    	handler:function(){
    		window.open('http://www.sbgn.org/');
    	}
    });
	
    var bar = Ext.create('Ext.toolbar.Toolbar', {
        cls : "bio-toolbar-bot",
        height : this.height,
        border : 0,
        items : [sbgnLink, this.entityNodeButton, this.processNodeButton,this.connectingArcsButton]
        });
    return bar;

};

//NetworkViewer.prototype.expressionSelected = function() {
//	var _this=this;
//	var networkAttributesWidget = new ExpressionNetworkAttributesWidget({title:'Expression',wum:true,width:this.width,height:this.height});
//	networkAttributesWidget.draw(_this.networkWidget.getDataset(), _this.networkWidget.getFormatter(),_this.networkWidget.getLayout());
//	
//	networkAttributesWidget.verticesSelected.addEventListener(function(sender, vertices){
//		_this.networkWidget.deselectNodes();
//		_this.networkWidget.selectVerticesByName(vertices);
//	});
//	
//
//	networkAttributesWidget.applyColors.addEventListener(function(sender, vertices){
//		var vertices = networkAttributesWidget.dataset.getVertices();
//		for ( var vertex in vertices) {
//			var id = vertices[vertex].getId();
//			var color = networkAttributesWidget.formatter.getVertexById(id).getDefault().getFill();
//			_this.networkWidget.getFormatter().getVertexById(id).getDefault().setFill(color);
//		}
//		
//	});
//	
//	
//	_this.networkWidget.onVertexOver.addEventListener(function(sender, nodeId){
//		var name = _this.networkWidget.getDataset().getVertexById(nodeId).getName();
//		_this.setNodeInfoLabel(networkAttributesWidget.getVertexAttributesByName(name).toString());
//	});
//};
//
//NetworkViewer.prototype.reactomeSelected = function() {
//	pathwayTreeViewer = new PathwayTreeViewer(this.species);
//	pathwayTreeViewer.draw();
//};





/**** NETWORK VIEWER API *****/
NetworkViewer.prototype.loadNetwork = function(networkData){
	this.networkData = networkData;
	this.networkSvg.refresh(networkData);
	this.networkSvg.setLayout("Circle");
};

NetworkViewer.prototype.loadJSON = function(content){
	this.networkData.loadJSON(content);
	this.networkSvg.refresh(this.networkData);
};

NetworkViewer.prototype.getNetworkData = function(){
	return this.networkData;
};

NetworkViewer.prototype.setLayout = function(type){
	switch (type) {
	case "Circle":
		var count = this.networkData.getNodesCount();
		var vertexCoordinates = this.calculateLayoutVertex(type, count);
		var nodeList = this.networkData.getNodesList();
		var aux = 0;
		for(var i = 0; i < nodeList.length; i++) {
			var x = this.networkSvg.getWidth()*(0.05 + 0.85*vertexCoordinates[aux].x);
			var y = this.networkSvg.getHeight()*(0.05 + 0.85*vertexCoordinates[aux].y);
			this.networkSvg.moveNode(nodeList[i], x, y);
			aux++;
		}
		break;
	case "Square":
		var count = this.networkData.getNodesCount();
		var vertexCoordinates = this.calculateLayoutVertex(type, count);
		var nodeList = this.networkData.getNodesList();
		var aux = 0;
		for(var i = 0; i < nodeList.length; i++) {
			var x = this.networkSvg.getWidth()*(0.05 + 0.85*vertexCoordinates[aux].x);
			var y = this.networkSvg.getHeight()*(0.05 + 0.85*vertexCoordinates[aux].y);
			this.networkSvg.moveNode(nodeList[i], x, y);
			aux++;
		}
		break;
	case "Random":
		var nodeList = this.networkData.getNodesList();
		for(var i = 0; i < nodeList.length; i++) {
			var x = this.networkSvg.getWidth()*(0.05 + 0.85*vertexCoordinates[aux].x);
			var y = this.networkSvg.getHeight()*(0.05 + 0.85*vertexCoordinates[aux].y);
			this.networkSvg.moveNode(nodeList[i], x, y);
		}
		break;
	default:
		var dotText = this.networkData.toDot();
		var url = "http://bioinfo.cipf.es/utils/ws/rest/network/layout/"+type+".coords";
		var _this = this;
		
		$.ajax({
			async: true,
			type: "POST",
			url: url,
			dataType: "text",
			data: {
				dot: dotText
			},
			cache: false,
			success: function(data){ 
				var response = JSON.parse(data);
				for(var nodeId in response){
					var x = _this.networkSvg.getWidth()*(0.05 + 0.85*response[nodeId].x);
					var y = _this.networkSvg.getHeight()*(0.05 + 0.85*response[nodeId].y);
					_this.networkSvg.moveNode(nodeId, x, y);
				}
			}
		});
		break;
	}
};

NetworkViewer.prototype.calculateLayoutVertex = function(type, count){
	switch (type) {
	case "Circle":
		var radius = 0.4;
		var centerX = 0.5;
		var centerY = 0.5;
		var vertexCoordinates = new Array();
		for(var i = 0; i < count; i++){
			x = centerX + radius * Math.sin(i * 2 * Math.PI/count);
			y = centerY + radius * Math.cos(i * 2 * Math.PI/count);
			vertexCoordinates.push({'x':x,'y':y});
		}
		return vertexCoordinates;
		break;

	case "Square":
		var xMin = 0.1;
		var xMax = 0.9;
		var yMin = 0.1;
		var yMax = 0.9;
		var rows = Math.sqrt(count);
		var step = (xMax - xMin) / rows;
		var vertexCoordinates = new Array();
		for(var i = 0; i < rows; i ++){
			for ( var j = 0; j < rows; j++) {
				x = i * step + xMin;
				y = j * step + yMin;
				vertexCoordinates.push({'x':x,'y':y});
			}
		}
		return vertexCoordinates;
		break;
	}
};

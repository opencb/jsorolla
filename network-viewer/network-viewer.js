function NetworkViewer(targetId, species, args) {
	var _this = this;
	this.id = "NetworkViewer#"+ Math.round(Math.random()*10000) +"#";
	
	this.menuBar = null;
	
	// if not provided on instatiation
	this.width =  $(document).width();
	this.height = $(document).height();
	this.drawZoneWidth = this.width-12;
	this.drawZoneHeight = this.height-148;
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
	
	//Events i send
	this.onSpeciesChange = new Event();
	
	console.log(this.width+"x"+this.height);
	console.log(this.targetId);
	console.log(this.id);
	
	//Events i listen
	this.onSpeciesChange.addEventListener(function(sender,data){
		
	});
	
//	this.id = "canvasName"+args.targetId;
//	this.targetNode = document.getElementById("containerUI");
//	this.graphCanvasName = this.id +"_";
	
	
//	if (args != null){
//		if ((args.height == null) && (args.width == null)){
//			this.drawZoneWidth = window.innerWidth-13;
//			this.drawZoneHeight = window.innerHeight-241;
//		}
//		
//	}
	
	
	
	/** Persitencia del viewer **/
	this.metaNetworkViewer = new NetworkMetaDataViewer({"width":this.drawZoneWidth,"height":this.drawZoneHeight});
	
	this.settingsInteractomeViewer = new SettingsInteractomeViewer();
	this.settingsInteractomeViewer.specieChanged.addEventListener(function(sender, specie){
		_this.setSpecies(specie);
	});
	
	
//	if (this.wum){
//		var _this = this;
//		this.headerWidget.onLogin.addEventListener(function (sender){
//		});
//		
//		this.headerWidget.onLogout.addEventListener(function (sender){
//		});
//	}
	
	
	

};

NetworkViewer.prototype.draw = function(){
	if(this.targetId!=null){
		this._getPanel(this.width,this.height);
	}
	this.render();
};


NetworkViewer.prototype.render = function(){
	var _this = this;
	var dataset = new GraphDataset();
	var formatter = this.metaNetworkViewer.getFormatter();
	var layout = new LayoutDataset();
	
	formatter.dataBind(dataset);
	layout.dataBind(dataset);
	
	// Events
//	this.searcherViewer.onSelectedNodes.addEventListener(function (sender, idNodes){
//		_this.selectVertices(idNodes);
//	});
	this.metaNetworkViewer.getMetaNetwork().onInfoRetrieved.addEventListener(function (sender){
	    //	_this.onInfoRetrieved.notify();
	    	if(_this.openViewer == "searcherViewer")
	        	_this.showSearcherViewer();
	    	if(_this.openViewer == "filter")
	        	_this.showFilterViewer();
	});
	this.drawNetwork(dataset, formatter, layout);
};


//Gets the panel containing all genomeViewer
NetworkViewer.prototype._getPanel = function(width,height) {
	var _this=this;
	if(this._panel == null){
		

		this.networkEditorBarWidget = new NetworkEditorBarWidget();
		this.networkSBGNBarWidget = new NetworkSBGNBarWidget();
		
		
		this.container = Ext.create('Ext.container.Container', {
			id:this.id+"containerParaGraphCanvas",
			padding:5,
			flex:1,
			style:"background: whiteSmoke;",
//			id: this.getGraphCanvasId(),
			cls:'x-unselectable',
//			html:'<div class="x-unselectable" style="width:'+this.width+'px;height:800px;" id="'+this.getGraphCanvasId()+'"></div>'
			html:'<div id="'+this.getGraphCanvasId()+'" style="border:1px solid #bbb;"></div>',
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
		}
//		items.push(this.getMenu());
		items.push(this.getOptionBar());
		items.push(this.networkEditorBarWidget.getBar());
		items.push(this.networkSBGNBarWidget.getBar());
		items.push(this.container);
		items.push(this.getInfoBar());
		
		
		this._panel = Ext.create('Ext.panel.Panel', {
			renderTo:this.targetId,
	    	border:false,
	    	width:width,
	    	height:height,
			cls:'x-unselectable',
			layout: { type: 'vbox',align: 'stretch'},
			region : 'center',
			margins : '0 0 0 0',
			border : false,
			items :items
		});
	}
	
	return this._panel;

	
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


NetworkViewer.prototype.getSpecies = function(){
	return this.metaNetworkViewer.getSpecies();
};

NetworkViewer.prototype.setSpecies = function(specie){
	this.metaNetworkViewer.setSpecies(specie);
	this.pathwayTreeViewer.setSpecies(specie);
	this.setSpecieInfoLabel(this.metaNetworkViewer.getSpecies());
	this.showTopMessage("Working with " + specie, "");
};
	
NetworkViewer.prototype.drawUI = function(){
	this.drawMenuBar(this.width, this.height);
};


NetworkViewer.prototype.drawNetwork = function(dataset, formatter, layout){
	var _this = this;
	
	this.metaNetworkViewer.setDataset(dataset);
	this.metaNetworkViewer.setFormatter(formatter);
	this.metaNetworkViewer.setLayout(layout);
	
	this.metaNetworkViewer.getMetaNetwork().dataBind(this.metaNetworkViewer.getDataset());
	
	document.getElementById(this.getGraphCanvasId()).innerHTML ="";
	
	var newHeight = this.height - 27;//this.tbMenu.getHeight();
	
	this.networkWidget = new NetworkWidget({targetId: this.getGraphCanvasId()});
	this.networkWidget.draw(this.metaNetworkViewer.getDataset(), this.metaNetworkViewer.getFormatter(), this.metaNetworkViewer.getLayout());
	
	this.networkWidget.onVertexOver.addEventListener(function(sender, nodeID){
		_this.setNodeInfoLabel(_this.networkWidget.getDataset().getVertexById(nodeID).getName());
	});
	
	this.networkWidget.onVertexOut.addEventListener(function(sender, nodeID){
		_this.setNodeInfoLabel("");
	});
	
	
	this.networkEditorBarWidget.setNetworkWidget(this.networkWidget.getGraphCanvas()); 
	
	
	// With attach the two events and with this variable=false we say that we want to retrieve all the information from cellBase again
	this.metaNetworkViewer.getDataset().newVertex.addEventListener(function (sender, node){
		_this.metaNetworkViewer.getMetaNetwork().setInformationRetrieved(false);
		_this.metaNetworkViewer.getMetaNetwork().addNode(node);
	});
	this.metaNetworkViewer.getDataset().vertexNameChanged.addEventListener(function (sender, args){
		var item = args.item;
		_this.metaNetworkViewer.getMetaNetwork().getVertexById(item.id).setName(item.name);
		_this.metaNetworkViewer.getMetaNetwork().getVertexById(item.id).setFilled(false);
		_this.metaNetworkViewer.getMetaNetwork().setInformationRetrieved(false);
	});
};	

NetworkViewer.prototype.loadSif = function(sifdataadapter){
	this.metaNetworkViewer.loadSif(sifdataadapter);
	this.drawNetwork(this.metaNetworkViewer.getDataset(), this.metaNetworkViewer.getFormatter(), this.metaNetworkViewer.getLayout());
};


//NetworkViewer.prototype.loadDot = function(dotAdapter){
//	this.draw(dotAdapter.getDataset(), dotAdapter.getFormatter(this.width, this.height), dotAdapter.getLayout());
//	openInteractomeDOTDialog.hide();
//	this.draw(dotAdapter.dataset, dotAdapter.formatter, dotAdapter.layout);
//};

NetworkViewer.prototype.loadJSON = function(content){
	this.metaNetworkViewer.loadJSON(content);
	this.drawNetwork(this.metaNetworkViewer.getDataset(), this.metaNetworkViewer.getFormatter(), this.metaNetworkViewer.getLayout());
};


NetworkViewer.prototype.drawConvertPNGDialog = function(content, type){
	var html = new StringBuffer();

	html.append("<form id='"+this.graphCanvasName+"_topng_dialog' name='input' action='" + this.metaNetworkViewer.servletPNGURL + "' method='post'>");
	html.append("	<input type='hidden' name='filename' value='image.'"+type+"/>");
	html.append("	<input type='hidden' name='content'  value = '" + content+"' />");
	html.append("	<input type='hidden' name='type' value='"+type+"' /> ");
	html.append("</form>");

	$("#"+this.targetNode.id).append(html.toString());
	$("#"+this.graphCanvasName+"_topng_dialog").submit();
};


//NetworkViewer.prototype.getAnnotationInfo = function(){
//	if(node!=null){
//		var _this = this;
//		var id = node.getId();
//		var metaNode = this.metaNetworkViewer.getMetaNetwork().getVertexById(id);
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

NetworkViewer.prototype.loadMetaData = function(){
	var _this = this;
    if(!this.metaNetworkViewer.getMetaNetwork().isInformationRetrieved()){
    	this.metaNetworkViewer.getMetaNetwork().loadData();
    }
    else{
    	if(this.openViewer == "searcherViewer")
    		this.showSearcherViewer();
    	if(this.openViewer == "filter")
        		this.showFilterViewer();
    }
};
NetworkViewer.prototype.showSearcherViewer = function(){
	var _this = this;
	this.searcherViewer.setStore(this.metaNetworkViewer.getMetaNetwork().store);
	this.searcherViewer.render();
};

NetworkViewer.prototype.getGraphCanvasId = function(){
	return  this.id + "_graph";
};

NetworkViewer.prototype.showTopMessage = function(text, opt){
	Ext.example.msg(text, opt);
};

NetworkViewer.prototype.drawMenuBar = function(){
	var menuItemWidth = 125;

	var _this = this;
//		var sifUpload = Ext.create('Ext.form.field.File', {
//			labelWidth: 50,
//			msgTarget: 'side',
//			allowBlank: false,
//			anchor: '100%',
//			buttonText: 'Select a SIF ...',
//			listeners: {
//				change: {
//		            fn: function(){
//						var sifdataadapter = new InteractomeSIFFileDataAdapter();
//						
//						var file = document.getElementById(sifUpload.fileInputEl.id).files[0];
////						var file = $("#"+sifUpload.fileInputEl.id).attr('files')[0];
//						sifdataadapter.loadFromFile(file);
//						sifdataadapter.onRead.addEventListener(function (sender, id){
//							_this.loadSif(sender);
//							openSIFDialog.hide();
//						}); 
//					}
//		        }
//			}  
//		});
		
		var DOTUpload = Ext.create('Ext.form.field.File', {
			labelWidth: 50,
			msgTarget: 'side',
			allowBlank: false,
			anchor: '100%',
			buttonText: 'Select a DOT ...',
			listeners: {
				change: {
		            fn: function(){
						var  sifdataadapter= new BiopaxDotFileDataAdapter();
						var file = $("#"+DOTUpload.fileInputEl.id).attr('files')[0];
						sifdataadapter.loadFromFile(file);
						sifdataadapter.onRead.addEventListener(function (sender, id){
							
							_this.graphEditorWidget = new GraphEditor(_this.graphEditorWidgetCanvasName, document.getElementById(_this.getGraphCanvasId()));
							_this.draw(sender.getDataset(), sender.getFormatter(_this.width, _this.height), sender.getLayout());
							openDOTDialog.hide();
						}); 
					}
		        }
			}  
		});
		var interactomeDOTUpload = Ext.create('Ext.form.field.File', {
			labelWidth: 50,
			msgTarget: 'side',
			allowBlank: false,
			anchor: '100%',
			buttonText: 'Select an InteractomeDOT ...',
			listeners: {
				change: {
		            fn: function(){
						var adapter= new InteractomeDotFileDataAdapter();
						var file = $("#"+interactomeDOTUpload.fileInputEl.id).attr('files')[0];
						adapter.loadFromFile(file);
						adapter.onRead.addEventListener(function (sender){
							_this.draw(sender.getDataset(), sender.getFormatter(_this.width, _this.height), sender.getLayout());
							openInteractomeDOTDialog.hide();
						}); 
					}
		        }
			}  
		});
		
		var jsonUpload = Ext.create('Ext.form.field.File', {
			labelWidth: 50,
			msgTarget: 'side',
			allowBlank: false,
			anchor: '100%',
			buttonText: 'Select a JSON ...',
			listeners: {
				change: {
	            fn: function(){
					var dataadapter = new FileDataAdapter();
					var file = document.getElementById(jsonUpload.fileInputEl.id).files[0];
					dataadapter.read(file);
					dataadapter.onRead.addEventListener(function (sender, content){
						_this.loadJSON(content.content);
						openJsonDialog.hide();
					});
				}
	        }
		}  
		});
		
		
		/****************************************************************
		 **********	FILE MENU declaration	*****************************
		 ****************************************************************/
		var openJsonDialog = Ext.create('Ext.window.Window', {
		    title: 'Open',
		    width: 400,
		    bodyPadding: 10,
		    layout: 'fit',
		    closeAction: 'hide',
		    items: jsonUpload
		});
//		var openSIFDialog = Ext.create('Ext.window.Window', {
//		    title: 'Open a SIF file',
//		    width: 400,
//		    bodyPadding: 10,
//		    layout: 'fit',
//		    closeAction: 'hide',
//		    items: sifUpload
//		});
		
		var openDOTDialog = Ext.create('Ext.window.Window', {
		    title: 'Open a DOT file',
		    width: 400,
		    bodyPadding: 10,
		    layout: 'fit',
		    closeAction: 'hide',
		    items: DOTUpload
		});
		var openInteractomeDOTDialog = Ext.create('Ext.window.Window', {
		    title: 'Open a InteractomeDOT file',
		    width: 400,
		    bodyPadding: 10,
		    layout: 'fit',
		    closeAction: 'hide',
		    items: interactomeDOTUpload
		});
		/**
		 * data for selecting node
		 * 
		 */
		Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));

	    

		
		
		var ExportToMeu = Ext.create('Ext.menu.Menu', {
						
						items :[
										{
											text:"PNG", 
											handler:function(){
												var content = _this.networkWidget.getGraphCanvas().toHTML();
												_this.drawConvertPNGDialog(content,"png");
											}
										},{
											text:"JPG", 
											handler:function(){
												var content = _this.networkWidget.getGraphCanvas().toHTML();
												_this.drawConvertPNGDialog(content,"jpg");
											}
										},
										
										{
											text:"SVG (recommended)",
											handler:function(){
													var content = _this.networkWidget.getGraphCanvas().toHTML();
													var clienSideDownloaderWindowWidget = new ClienSideDownloaderWindowWidget();
													clienSideDownloaderWindowWidget.draw(content, content);
											}
											
											
										}
								]

		});
		
		
//		var exportFileMenu = new Ext.create('Ext.menu.Menu',{
//			width: menuItemWidth,
//			floating: true,
//			items: [
//			{
//				text: 'To Image',
//				menu:ExportToMeu 
//			},
//			{
//				text: 'To SIF',
//				handler:function(){
//					var content = _this.graphEditorWidget.dataset.toSIF();
//					_this.save(content,"sif");
//			}	
//			},
//			{
//				text: 'To DOT',
//				handler:function(){
//				var content = _this.graphEditorWidget.dataset.toDOT();
//				_this.save(content,"dot");
//			}
//			}]
//		});
		
		var importFileMenu = new Ext.create('Ext.menu.Menu', {
			//width: menuItemWidth,
			floating: true,
			items: [
				 {
			    	   text: 'Load remote network...',
			    	   handler: function(){
			    	   		_this.biopaxServerSelector.render();
			    	   		//_this.biopaxServerSelector.getSource();
						}
			       },
			       {
			    	   text: 'Upload local network',
			    	   menu: importLocalNetwork
				}
			]
		});
	
		
		
		
		/******************************************************************************
		 ***************	END FILE MENU	******************************************* 
		 ******************************************************************************/
		
		 _this.expressionStore = Ext.create('Ext.data.ArrayStore', {
			 autoDestroy: true,
		        fields: [
		           {name: 'node'},
		           {name: 'expression',      type: 'float'},
		           {name: 'scaled',      type: 'float'},
		           {name: 'color'}
		         
		        ]
		    });
		
		 
		 var expressionUpload = Ext.create('Ext.form.field.File', {
				labelWidth: 50,
				msgTarget: 'side',
				allowBlank: false,
				anchor: '100%',
				buttonText: 'Select ...',
				listeners: {
					change: {
			            fn: function(){
							var dataAdapter = new TabularFileDataAdapter();
							dataAdapter.loadFromFile($("#"+expressionUpload.fileInputEl.id).attr('files')[0]);
							dataAdapter.onRead.addEventListener(function (sender, id){
								
//								for ( var i = 0; i < sender.lines[0].length; i++) {
//									var split = sender.lines[0][i].split(",");
//									var name = split[0];
//									var expression = split[1];
////									
//									
//									if (_this.metaNetworkViewer.getDataset().getVertexByName(name)!= null){
//										_this.expressionValues[_this.metaNetworkViewer.getDataset().getVertexByName(name).getId()] = expression;
//									}
//									else{
//										console.log(name + " not found");
//										//_this.expressionValues[_this.dataset.getVertexByName(name).getId()] = Math.infinity;
//									}
//								}
								for ( var i = 0; i < sender.lines.length; i++) {
									var split = sender.lines[i];
									var name = split[0];
									var expression = split[1];
//									
									
									if (_this.metaNetworkViewer.getDataset().getVertexByName(name)!= null){
										_this.expressionValues[_this.metaNetworkViewer.getDataset().getVertexByName(name).getId()] = expression;
									}
									else{
										console.log(name + " not found");
										//_this.expressionValues[_this.dataset.getVertexByName(name).getId()] = Math.infinity;
									}
								}
								
								openUploadExpressionFile.hide();
								
								var data = _this.normalize();
				        		_this.expressionStore.removeAll();
				        		_this.expressionStore.loadData(data, true); //["2222",1111,1111,"color"], true);
				       
								openExpressionWindow.show();
							});
						}
			        }
				}  
			});
		 
		   var openUploadExpressionFile = Ext.create('Ext.window.Window', {
			    title: 'Open expression file',
			    width: 400,
			    bodyPadding: 10,
			    layout: 'fit',
			    closeAction: 'hide',
			    items: expressionUpload
			});
			
			
		 gridExpression = Ext.create('Ext.grid.Panel', {
		        store: _this.expressionStore,
		        stateful: true,
		        stateId: 'stateGrid',
		        columns: [
		            {
		                text     : 'node',
		                flex     : 1,
		                width    : 75,
		                sortable : true,
		                dataIndex: 'node'
		            },
		            {
		                text     : 'expression',
		                width    : 75,
		                sortable : true,
		                dataIndex: 'expression'
		            },
		            {
		                text     : 'scaled',
		                width    : 75,
		                sortable : true,
		                dataIndex: 'normalized'
		            },
		            {
		                text     : 'color',
		                width    : 75,
		                sortable : true,
		                dataIndex: 'color'
		            }],
		     height: 350,
		     width: 350,
		     title: 'Array Grid',
		     viewConfig: {
		         stripeRows: true
		     }
		 });
		 
		 
		 
//		var openExpressionWindow = Ext.create('Ext.window.Window', {
//		    title: 'Expression',
//		    width: 400,
//		    bodyPadding: 10,
//		    layout: 'fit',
//		    closeAction: 'hide',
//		    items: [
//		            gridExpression,
//		            {
//		            	   xtype: 'button',
//		                   text : 'Apply',
//		                   handler : function() {
//		            	
//					            	var colors = _this.expressionColors;
//					        		for ( var vertex in _this.expressionColors) {
//					        			_this.metaNetworkViewer.getFormatter().getVertexById(vertex).getDefault().setFill(_this.expressionColors[vertex]);
//					        			_this.graphEditorWidget.zoomFormatter.getVertexById(vertex).getDefault().setFill(_this.expressionColors[vertex]);
//					        		}
//		   					}
//		            }]
//		});
		
	    
//		var expresionExtension = new Ext.create('Ext.menu.Menu', {
//			//width: menuItemWidth,
//			floating: true,
//			items: [{
//				text: 'Upload Expression File',
//				//xtype: 'menucheckitem',
//				handler : function() {
//						openUploadExpressionFile.show();
//				}
//			},
//			{
//				text: 'Manage expression',
//				handler : function() {
//			
//					var data = _this.normalize();
//	        		_this.expressionStore.removeAll();
//	        		_this.expressionStore.loadData(data, true); 
//					 openExpressionWindow.show();
//				}
//			}
//			]
//		});
		
		   
		var networkAnalysis = new Ext.create('Ext.menu.Menu', {
			width: menuItemWidth,
			floating: true,
			items: [{
				text: 'View parameters'
			},
			{
				text: 'Plot parameters'
			},
			'-',
			{
				text: 'Snow'
			},
			{
				text: 'Network Miner'
			}
			]
		});

//		var extensionsMenu = new Ext.create('Ext.menu.Menu', {
//			width: menuItemWidth,
//			floating: true,
//			text: "Extensions",
//			items: [ {
//			        	text: 'Expression',
//			        	menu: expresionExtension
//			        },
//			        {
//			        	text: 'Network',
//			        	menu: networkAnalysis
//			        }
//			        ]
//		});

		
		
		var selectMenu = new Ext.create('Ext.menu.Menu',{
			width: menuItemWidth,
			floating: true,
			items: [
//					{
//						text: "Select",
//						menu: [
			        	       	{
			        	       		text: 'Adjacent Vertices',
			        	       		handler: function(){
				        	       		_this.selectAdjacent();
			        	       		}
			        	       	},
			        	       	{
			        	       		text: 'Edges',
			        	       		handler: function(){
				        	       		_this.selectEdgesFromVertices();
			        	       		}
			        	       	},
			        	       	{
			        	       		text: 'Neighbourhood',
			        	       		handler: function(){
			        	       		
			        	       			_this.selectEdgesFromVertices();
			        	       			_this.selectAdjacent();
				        	       			
				        	       			
			        	       		}
			        	       	},
			        	       	"-",
			        	       	{
			        	       		text: 'Collapse',
			        	       		handler: function(){
			        	       			_this.collapse();
			        	       		}
			        	       	}
						]
//					}]
		});
		

};

NetworkViewer.prototype.getMenu = function(){
	var _this = this;
	
	if (this.tbMenu == null){
		
		var ExportToMeu = Ext.create('Ext.menu.Menu', {
			
			items :[
							{
								text:"PNG",
								iconCls:'icon-blue-box',
								handler:function(){
									var content = _this.networkWidget.getGraphCanvas().toHTML();
									_this.drawConvertPNGDialog(content,"png");
								}
							},{
								text:"JPG", 
								iconCls:'icon-blue-box',
								handler:function(){
									var content = _this.networkWidget.getGraphCanvas().toHTML();
									_this.drawConvertPNGDialog(content,"jpg");
								}
							},
							{
								text:"SVG (recommended)",
								iconCls:'icon-blue-box',
								handler:function(){
										var content = _this.networkWidget.getGraphCanvas().toHTML();
										var clienSideDownloaderWindowWidget = new ClienSideDownloaderWindowWidget();
										clienSideDownloaderWindowWidget.draw(content, content);
								}
							}
					]

		});
		
//		var importLocalNetwork = new Ext.create('Ext.menu.Menu', {
//			floating: true,
//			items: [
//				{
//					text: 'SIF',
//					handler : function() {
//						openSIFDialog.show();
//					}
//				}
//			]
//		});
		var importLocalNetwork = new Ext.create('Ext.menu.Menu', {
			floating: true,
			items: [
				{
					text: 'SIF',
					handler : function() {
						var sifNetworkFileWidget =  new SIFNetworkFileWidget();
						sifNetworkFileWidget.draw();	
						sifNetworkFileWidget.onOk.addEventListener(function(sender,data){
							_this.loadSif(data);
						});
					}
				}
			]
		});
		
		
			var fileMenu = new Ext.create('Ext.menu.Menu', {
				floating: true,
//				width: menuItemWidth,
				items: [
	//			{
	//				text: 'New'
	//			},
				{
					text: 'Open...',
					handler: function() {
						var networkFileWidget =  new NetworkFileWidget();
						networkFileWidget.draw();	
						networkFileWidget.onOk.addEventListener(function(sender,data){
							_this.loadJSON(data);
						});
					}
				},
				{
					text: 'Save as',
					handler: function(){
						var content = JSON.stringify(_this.networkWidget.getGraphCanvas().toJSON());
						var clienSideDownloaderWindowWidget = new ClienSideDownloaderWindowWidget();
						clienSideDownloaderWindowWidget.draw(content, content);
					}
				}
				,'-',
				{
					text: 'Import',
					menu: importLocalNetwork
				},
				{
	//				text: 'Export',
					text : 'Download as',
					iconCls:'icon-box',
					menu: ExportToMeu//exportFileMenu
					
				}]
			});
		
			
			
		
			this.tbMenu = Ext.create('Ext.toolbar.Toolbar',{
				cls:'bio-menubar',
				height:27,
				padding:'0 0 0 10'
			});
			this.tbMenu.add({
				text:'File',
				menu: fileMenu  // assign menu by instance
			},{
				text:'Edit',
				menu: this.getEditMenu()
			},
			{
				text:'View',
				menu: _this.getViewMenu()
			},
			{
				text:'Search',
				menu: _this.getSearchMenu()
			},
			{
				text:'Attributes',
				handler: function(){
					var networkAttributesWidget = new NetworkAttributesWidget({title:'Attributes',wum:true,width:_this.width,height:_this.height});
					networkAttributesWidget.draw(_this.networkWidget.getDataset(), _this.networkWidget.getFormatter(),_this.networkWidget.getLayout());
					
					networkAttributesWidget.verticesSelected.addEventListener(function(sender, vertices){
						_this.networkWidget.deselectNodes();
						_this.networkWidget.selectVerticesByName(vertices);
					});
					
					
					_this.networkWidget.onVertexOver.addEventListener(function(sender, nodeId){
						var name = _this.networkWidget.getDataset().getVertexById(nodeId).getName();
						_this.setNodeInfoLabel(networkAttributesWidget.getVertexAttributesByName(name).toString());
					});
					
				}
			},
			{
				text:'Layout',
				menu: this.getLayoutViewMenu()
			},
			
			{
				text:'Analysis',
				menu:this.getAnalysisMenu()

			}
		//	{
		//		text:'Layout',
		//		menu: layoutViewMenu
		//	},{
		//		text:'Analysis',
		//		menu: extensionsMenu
		//	}
			);
	}
	 return _this.tbMenu;
};


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

//
//NetworkViewer.prototype.getPanel = function(){
//	var _this = this;
//	
//
//	if(this.panel==null){
//		this.networkEditorBarWidget = new NetworkEditorBarWidget();
//		this.networkSBGNBarWidget = new NetworkSBGNBarWidget();
//		this.container = Ext.create('Ext.container.Container', {
//			padding:5,
//			flex:1,
//			style:"background: whiteSmoke;",
////			id: this.getGraphCanvasId(),
//			cls:'x-unselectable',
////			html:'<div class="x-unselectable" style="width:'+this.width+'px;height:800px;" id="'+this.getGraphCanvasId()+'"></div>'
//			html:'<div id="'+this.getGraphCanvasId()+'" style="border:1px solid #bbb;"></div>',
//			listeners:{
//				resize: function ( cont, adjWidth, adjHeight){
////					console.log(adjWidth);
////					console.log(adjHeight);
//				}
//			}
//		});
//		
//		this.panel =  Ext.create('Ext.panel.Panel', {
//			border : false,
//			region: 'center',
//			layout: { type: 'vbox',align: 'stretch'},
//			items:[
//			       this.getOptionBar(),
//			       this.networkEditorBarWidget.getBar(),
////			       this.networkSBGNBarWidget.getBar(),
//			       this.container,
//			       this.getInfoBar()
//			      ]
//		});
//	}
//	return this.panel;
//};

//NetworkViewer.prototype.getMenu = function(){
//	return this.tbMenu;
//};



/** Options handler **/
NetworkViewer.prototype.handleActionMenu = function(action, args) {
	 if (action == 'add'){
		 	this.networkWidget.getGraphCanvas().getDataset().addNode("new Vertex");
	 }
	 
	 if (action == 'delete'){
		 	this.networkWidget.getGraphCanvas().removeSelected();
	 }
	 
	 if (action == 'select'){
			 this.networkWidget.getGraphCanvas().setLinking(false);
			 this.networkWidget.getGraphCanvas().setMultipleSelection(true);
			 this.networkWidget.getGraphCanvas().selecting = false;
	 }
	 
	 
	 if (action == 'join'){
		 	this.networkWidget.getGraphCanvas().setLinking(true);
	 }
	 
	 if (action == 'drag'){
			 this.networkWidget.getGraphCanvas().setLinking(false);
			 this.networkWidget.getGraphCanvas().setMultipleSelection(false);
			 this.networkWidget.getGraphCanvas().selecting = false;
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
		id:'uxTaskbar',
		winMgr: new Ext.ZIndexManager(),
		enableOverflow:true,
		cls: 'bio-hiddenbar',
		height:28,
		flex:1
	});
	this.nodeInfoLabel = Ext.create('Ext.toolbar.TextItem', {
		html:''
	});
	this.specieInfoLabel = Ext.create('Ext.toolbar.TextItem', {
		html:'hsa'
	});
	var infobar = Ext.create('Ext.toolbar.Toolbar', {
		cls:'bio-hiddenbar',
		width:300,
		height:28,
		items:['-',this.nodeInfoLabel,'->','-',this.specieInfoLabel]
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
NetworkViewer.prototype.setSpecieInfoLabel = function(text) {
	this.specieInfoLabel.setText(text,false);
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
		border : 0,
		items : [ 
		{
			xtype : 'button',
			iconCls : 'icon-select',
			text : 'Select',
			listeners : {
				scope : this,
				'click' : function() {
						_this.handleActionMenu("select");
				}
			}
		},
		{
			xtype : 'button',
			iconCls : 'icon-drag',
			text : 'Drag',
			listeners : {
				scope : this,
				'click' : function() {
						_this.handleActionMenu("drag");
				}
			}
		},'-',
		{
			xtype : 'button',
			iconCls : 'icon-add',
			text : 'Add',
			listeners : {
				scope : this,
				'click' : function() {
						_this.handleActionMenu("add");
				}
			}
		},
		{
			xtype : 'button',
			iconCls : 'icon-delete',
			text : 'Delete',
			listeners : {
				scope : this,
				'click' : function() {
						_this.handleActionMenu("delete");
				}
			}
		},'-',
		{
			xtype : 'button',
			iconCls : 'icon-link',
			text : 'Join',
			listeners : {
				scope : this,
				'click' : function() {
						_this.handleActionMenu("join");
				}
			}
		},
		{
			xtype : 'button',
			iconCls : 'icon-zoom-out',
			margins : '0 0 0 20',
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
			name : 'field1'
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



/** View Menu **/
NetworkViewer.prototype.getZoomMenu = function(chromosome, position) {
	var _this = this;
	var menu = Ext.create('Ext.menu.Menu', {
				margin : '0 0 10 0',
				floating : true,
				items : []
			});
	for ( var i = 0; i <= 100; i=i+10) {
		menu.add({text : i + '%', group : 'zoom', checked : false, handler : function() {
				var zoom = this.text.replace("%", "");
				_this.handleActionMenu("ZOOM", zoom);
				_this.slider.setValue(zoom);
			}
		});
	}
	
	return menu;

};

/** label Menu **/
NetworkViewer.prototype.getLabelMenu = function() {
	var _this = this;
	var menu = Ext.create('Ext.menu.Menu', {
				margin : '0 0 10 0',
				floating : true,
				items : [
				         {
				        	 text:'None',
				        	 handler : function() {
				        	 	_this.networkWidget.setVerticesFontSize(0);
				        	 	
				         	}
				         },
				         {
				        	 text:'Small',
				        	 handler : function() {
				        		_this.networkWidget.setVerticesFontSize(8);
					         	}
				         },
				         {
				        	 text:'Medium',
				        	 handler : function() {
				        		_this.networkWidget.setVerticesFontSize(10);
					         	}
				         },
				         {
				        	 text:'Large',
				        	 handler : function() {
				        		_this.networkWidget.setVerticesFontSize(12);
					         	}
				         },
				         {
				        	 text:'x-Large',
				        	 handler : function() {
				        		_this.networkWidget.setVerticesFontSize(16);
					         	}
				         }
				         ]
			});
	
	
	return menu;

};

NetworkViewer.prototype.getGraphCanvas = function() {
	return this.mainGraphCanvas;
};

NetworkViewer.prototype.getSearchMenu = function() {
	var _this = this;
	var viewMenu = Ext.create('Ext.menu.Menu', {
		margin : '0 0 10 0',
		floating : true,
		items : [{
					text : 'Xref',
					handler : function() {
						var inputListWidget = new InputListWidget();
						//var geneNames = "BRCA2";
						inputListWidget.onOk.addEventListener(function(evt, xref) {
							_this.openGeneListWidget(xref);
						});
						inputListWidget.draw();
					}
				}, 
				{
					text : 'ID'
//					menu : this.getLabelMenu()
				}, 
				{
					text : 'Functional term',
					handler: function(){
		        		_this.openViewer = "searcherViewer";
		        		_this.loadMetaData();
					}
				}
	
		]
	});
	return viewMenu;
};
NetworkViewer.prototype.openGeneListWidget = function(geneName) {
	var _this = this;
	var cellBase = new CellBaseDataAdapter();
	cellBase.successed.addEventListener(function(evt, data) {
		var listWidget = new ListWidget();
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
NetworkViewer.prototype.getViewMenu = function() {
		var viewMenu = Ext.create('Ext.menu.Menu', {
			margin : '0 0 10 0',
			floating : true,
			items : [{
						text : 'Zoom',
						menu : this.getZoomMenu()
					}, 
					{
						text : 'Label',
						menu : this.getLabelMenu()
					}
		
			]
		});
		return viewMenu;
};

/** EDIT MENU **/
NetworkViewer.prototype.getEditMenu = function() {
	var _this=this;
		var editMenu = new Ext.create('Ext.menu.Menu',{
			floating: true,
			items: [
			        {
			        	text: 'Select',
			        	menu:{
			        	 	items:[
		    	 	       {
					        	text: 'All Vertices',
					        	handler: function(){
					        		_this.networkWidget.selectAllNodes();
					        	}
					        },
					        {
					        	text: 'All Edges',
					        	handler: function(){
					        		_this.networkWidget.selectAllEdges();
					        	}
					        },
					        {
					        	text: 'Everything',
					        	handler: function(){
					        		_this.networkWidget.selectAll();
					        	}
					        },
					        '-',
					        {
					        	text: 'Adjacent Vertices',
					        	handler: function(){
					        		_this.networkWidget.selectAdjacent();
					        	}
					        },
					        {
					        	text: 'Neighbourhood',
					        	handler: function(){
					        		_this.networkWidget.selectNeighbourhood();
					        	
					        		
					        		
					        	}
					        },
					        {
					        	text: 'Connected Component',
					        	handler: function(){
					        		_this.networkWidget.selectConnectedComponent();
					        	}
					        }
					        
					        
					        ]
			        	}
			        },
			        {
			        	text: 'Collapse',
			        	handler: function(){
			        		_this.networkWidget.collapse();
			        	}
			        },
			        
			        '-'
			        ,
			        {
			        	text: 'Background',
			        	handler: function(){
			        		_this.settingsInteractomeViewer.draw(_this.metaNetworkViewer.getFormatter());
			        	}
			        }
			        ]
		});
		return editMenu;
};


/** LAYOUT MENU **/
NetworkViewer.prototype.getLayoutViewMenu = function() {
	var _this = this;
	var layoutViewMenu = new Ext.create('Ext.menu.Menu', {
		floating: true,
		items: [{
			text: 'Custom',
			//xtype: 'menucheckitem',
			  group: 'layout',
			  checked: true,
			handler : function() {
				_this.metaNetworkViewer.setLayout(new LayoutDataset());
				_this.graphEditorWidget.mainGraphCanvas.render();
			}
		},
		{
			text: 'dot',
			group: 'layout',
			checked: false,
			handler : function() {
				
				_this.metaNetworkViewer.getLayout().getLayout("dot");
			}
		},
		{
			text: 'neato',
			xtype: 'menucheckitem',
			group: 'layout',
			checked: false,
			handler : function() {
				_this.metaNetworkViewer.getLayout().getLayout("neato");
			}
		},
		{
			text: 'twopi',
			xtype: 'menucheckitem',
			group: 'layout',
			checked: false,
			handler : function() {
				_this.metaNetworkViewer.getLayout().getLayout("twopi");
				
			}
		},
		{
			text: 'circo',
			xtype: 'menucheckitem',
			group: 'layout',
			checked: false,
			handler : function() {
				_this.metaNetworkViewer.getLayout().getLayout("circo");
			}
		},
		{
			text: 'fdp',
			xtype: 'menucheckitem',
			group: 'layout',
			checked: false,
			handler : function() {
				_this.metaNetworkViewer.getLayout().getLayout("fdp");
			}
		},
		{
			text: 'sfdp',
			xtype: 'menucheckitem',
			group: 'layout',
			checked: false,
			handler : function() {
				_this.metaNetworkViewer.getLayout().getLayout("sfdp");
			}
		},
		"-",
		{
			text: 'random',
			xtype: 'menucheckitem',
			group: 'layout',
			checked: false,
			handler : function() {
				_this.metaNetworkViewer.getLayout().getLayout("RANDOM");
			}
		},
		{
			text: 'circle',
			xtype: 'menucheckitem',
			group: 'layout',
			checked: false,
			handler : function() {
				_this.metaNetworkViewer.getLayout().getLayout("CIRCLE");
			}
		},
		{
			text: 'square',
			xtype: 'menucheckitem',
			group: 'layout',
			checked: false,
			handler : function() {
				_this.metaNetworkViewer.getLayout().getLayout("SQUARE");
			}
		}
		]
	});
	return layoutViewMenu;
};

NetworkViewer.prototype.getAnalysisMenu = function() {
	var _this=this;
	var analysisMenu = Ext.create('Ext.menu.Menu', {
		margin : '0 0 10 0',
		floating : true,
		items : [{
					text : 'Expression',
					handler: function(){
						_this.expressionSelected();
					}
				}, 
				{
					text : 'Interactome browser',
					handler: function(){
					}
				},
				{
					text : 'Reactome browser',
					handler: function(){
						_this.reactomeSelected();
					}
				}
		]
	});
	return analysisMenu;
};

NetworkViewer.prototype.expressionSelected = function() {
	var _this=this;
	var networkAttributesWidget = new ExpressionNetworkAttributesWidget({title:'Expression',wum:true,width:this.width,height:this.height});
	networkAttributesWidget.draw(_this.networkWidget.getDataset(), _this.networkWidget.getFormatter(),_this.networkWidget.getLayout());
	
	networkAttributesWidget.verticesSelected.addEventListener(function(sender, vertices){
		_this.networkWidget.deselectNodes();
		_this.networkWidget.selectVerticesByName(vertices);
	});
	

	networkAttributesWidget.applyColors.addEventListener(function(sender, vertices){
		var vertices = networkAttributesWidget.dataset.getVertices();
		for ( var vertex in vertices) {
			var id = vertices[vertex].getId();
			var color = networkAttributesWidget.formatter.getVertexById(id).getDefault().getFill();
			_this.networkWidget.getFormatter().getVertexById(id).getDefault().setFill(color);
		}
		
	});
	
	
	_this.networkWidget.onVertexOver.addEventListener(function(sender, nodeId){
		var name = _this.networkWidget.getDataset().getVertexById(nodeId).getName();
		_this.setNodeInfoLabel(networkAttributesWidget.getVertexAttributesByName(name).toString());
	});
};

NetworkViewer.prototype.reactomeSelected = function() {
	pathwayTreeViewer = new PathwayTreeViewer();
	pathwayTreeViewer.draw();
};

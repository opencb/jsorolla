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

function GcsaBrowserWidget(args){
	var _this=this;
	if(typeof args != 'undefined'){
		this.targetId = args.targetId || this.targetId;
		this.title = args.title || this.title;
		this.width = args.width || this.width;
		this.height = args.height || this.height;
	};
    
    this.adapter = new GcsaManager();
	this.adapter.onCreateBucket.addEventListener(function (sender, data){
		if(data.indexOf("ERROR") != -1) {
			Ext.Msg.alert("Create project", "ERROR: could not create this project.");
		} else {
			_this.onNeedRefresh.notify();
		}
		_this.panel.setLoading(false);
		Ext.getBody().unmask();
	});

	this.uploadWidget = new UploadWidget({suiteId:args.suiteId});
    
    this.uploadWidget.adapter.onUploadDataToProject.addEventListener(function(sender,res){
		if(res.status == 'done'){
			_this.onNeedRefresh.notify();
		}
	});
	/**ID**/
	this.searchFieldId = this.id + "_searchField";
};

GcsaBrowserWidget.prototype = {
	/* Default properties */
	id : "GcsaBrowserWidget_" + Math.round(Math.random()*10000000),
	targetId:undefined,
	title:'Cloud data',
	onSelect : new Event(this),
	onNeedRefresh : new Event(this),
	width : 900,
	height : 600,
	rendered : false,
	
	/* Methods */
	draw : function (mode){
		//Ext.getBody().mask("Loading...");
		//this.adapter.getData(sessionID, -1);
		this.render(mode);
		this.rendered = true;
	},
	
	setAccountData : function (data){
		this.accountData = data;
		if(this.rendered){
			this._updateFolderTree();
		}
	},
	
	_updateFolderTree : function (){
		var _this=this;
		console.log("updating folder tree")
		var find = function(str, arr){
			for ( var i = 0; i< arr.length; i++){
				if(arr[i].text == str){
					return i;
				}
			}
			return -1;
		};
		
		if(this.accountData!=null && this.accountData.accountId!=null){
			this.folderStore.getRootNode().removeAll();
			this.allStore.getRootNode().removeAll();
			this.folderTree.getSelectionModel().deselectAll();
			for ( var i = 0; i < this.accountData.buckets.length; i++) {
				var folders = [];
				for ( var j = 0; j < this.accountData.buckets[i].objects.length; j++) {
					var data = this.accountData.buckets[i].objects[j];
					data["bucketId"]=this.accountData.buckets[i].id;
					//sencha uses id so need to rename to oid, update: sencha can use id but dosent like char '/' on the id string
					if(data.id != null){
						data["oid"] = data.id;
						delete data.id;
					}
					if(data.fileType == "dir"){
						var pathArr = data.oid.slice(0,-1).split("/");
						data["expanded"]=true;
						data["icon"]=Compbio.images.dir;
					}else{
						var pathArr = data.oid.split("/");
						data["leaf"]=true;
						data["icon"]=Compbio.images.r;
					}
					//console.log(pathArr)

					var current = folders;
					for ( var k = 0; k < pathArr.length; k++){
						var found = find(pathArr[k],current);
						if(found != -1){
							current = current[found].children;
						}else{
							var children = [];
							var idx = current.push({text:pathArr[k],children:children})-1;
							if(typeof pathArr[k+1] == 'undefined'){//isLast
								for(key in data){
									if(key != "children"){
										current[idx][key] = data[key];
									}
								}
							}
							current = children;
						}
					}
				}
				var folders = JSON.stringify(folders);
				this.allStore.getRootNode().appendChild({text:this.accountData.buckets[i].name, icon:Compbio.images.box, expanded:true, children:JSON.parse(folders)});
				this.folderStore.getRootNode().appendChild({text:this.accountData.buckets[i].name, icon:Compbio.images.box, expanded:true, children:JSON.parse(folders)});
			}
		}
		if(this.selectednodeOid!=null){ //devuelve el value y el field porque el bucket no tiene oid
			var lastNode = this.allStore.getRootNode().findChild(this.selectednodeOid.field,this.selectednodeOid.value,true);
			if(lastNode!=null){
				var childs = [];
				lastNode.eachChild(function(n){
					childs.push(n.raw);
				});
				_this.filesGrid.setTitle(lastNode.getPath("text"," / "));
				_this.filesStore.loadData(childs);
			}
		}
	}
	//endclass
};

GcsaBrowserWidget.prototype.render = function (mode){
	var _this=this;
	if (this.panel == null){
		
		this.folderStore = Ext.create('Ext.data.TreeStore',{
			fields:['text','oid'],
			root:{
				expanded: true,
				text:'Drive',
				children: []
			},
			listeners:{
				beforeappend:function(este, node){
					if(node.isLeaf()){
						console.log(node.raw.oid+ " is a file" );
						return false //cancel append because is leaf
					}
				}
			}
		});
		this.allStore = Ext.create('Ext.data.TreeStore',{
			fields:['text','oid'],
			root:{
				expanded: true,
				text:'Drive',
				children: []
			}
		});
		this.filesStore = Ext.create('Ext.data.Store', {
			fields:['oid', 'fileBioType', 'fileType', 'fileFormat', 'fileName','multiple','diskUsage','creationTime','responsible','organization','date','description','status','statusMessage','members'],
			data:[]
		});
		

		this.folderTree = Ext.create('Ext.tree.Panel', {
			//xtype:"treepanel",
			id:this.id+"activeTracksTree",
			title:"My WebDrive",
			bodyPadding:"5 0 0 0",
			margin:"-1 0 0 0",
			border:false,
			autoScroll:true,
			flex:4,
			useArrows:true,
			rootVisible: false,
			hideHeaders:true,
			selType: 'cellmodel',
			//plugins: [Ext.create('Ext.grid.plugin.CellEditing', {clicksToEdit: 2,listeners:{
						//edit:function(editor, e, eOpts){
							//var record = e.record; //en la vista del cliente
							/*todo, ahora q llame la servidor. y lo actualize*/
						//}
					//}})],
			columns: [{
				xtype: 'treecolumn',
				dataIndex: 'text',
				flex:1,
				editor: {xtype: 'textfield',allowBlank: false}
			}
			//{
				//xtype: 'actioncolumn',
				//menuDisabled: true,
				//align: 'center',
				//tooltip: 'Edit',
				//width:20,
				//icon: Compbio.images.edit,
				//handler: function(grid, rowIndex, colIndex, actionItem, event, record, row) {
					//event.stopEvent();
					//if(record.isLeaf()){
						//var id = record.data.trackId;
						//var track = _this.getTrackSvgById(id);
						//if(track != null){
							//var trackSettingsWidget = new TrackSettingsWidget({
								//trackSvg:track,
								//treeRecord:record
							//});
						//}
					//}
				//}
			//},
			//{
				//xtype: 'actioncolumn',
				//menuDisabled: true,
				//align: 'center',
				//tooltip: 'Remove',
				//width:30,
				//icon: Compbio.images.del,
				//handler: function(grid, rowIndex, colIndex, actionItem, event, record, row) {
					////this also fires itemclick event from tree panel
					//if(record.isLeaf()){
						//var id = record.data.trackId;
						//var checked = record.data.checked;
						//record.destroy();
						//if(checked){
							//_this.removeTrack(id);
						//}
					//}
				//}
			//}
			],
			viewConfig: {
				markDirty:false,
				plugins: {
					ptype: 'treeviewdragdrop'
				},
				listeners : {
					drop : function (node, data, overModel, dropPosition, eOpts){
						var record = data.records[0];
						//check if is leaf and if the record has a new index
						if(record.isLeaf() && record.data.index != record.removedFrom && record.data.checked){
							var id = record.data.trackId;
							_this.setTrackIndex(id, record.data.index);
						}
					}
				}
			},
			listeners : {
				itemclick : function (este, record, item, index, e, eOpts){
					var field, deep;
					if(record.raw.oid == null){//is a bucket
						field = 'text'; deep = false;
					}else{
						field = 'oid'; deep = true;
					}
					var node = _this.allStore.getRootNode().findChild(field, record.raw[field], deep);
					var childs = [];
					_this.selectednodeOid = {value:node.data[field],field:field};
					node.eachChild(function(n){
						childs.push(n.raw);
					});
					_this.filesGrid.setTitle(node.getPath("text"," / "));
					_this.filesStore.loadData(childs);
				},
				checkchange : function (node, checked){
					var type = node.data.trackType;
					var id = node.data.trackId;
					if(checked){
						var track = node.raw.track;
						_this.restoreTrack(track, node.data.index);
					}else{
						var track = _this.removeTrack(id);
						//save trackSvg pointer
						node.raw.track = track;
					}
				},
				itemmouseenter : function (este,record){
				},
				itemmouseleave : function (este,record){
				}
			},
			store: this.folderStore
		});
/*******************/
/*******************/
/*******************/
/*******************/
/*******************/
/*******************/
		/**ORIGIN FILTER**/
		//var origins = [{ suiteId: "all",name:"all"},{ suiteId: "Uploaded Data",name:"Uploaded Data"},{ suiteId: "Job Generated",name:"Job Generated"}];
		//
	 	//var stOrigin = Ext.create('Ext.data.Store', {
	 		//fields: ["suiteId","name"],
	 		//data : origins
		//});
		//this.viewOrigin = Ext.create('Ext.view.View', {
		    //store : stOrigin,
            //selModel: {
                //mode: 'SINGLE',
               // allowDeselect:true,
                //listeners: {
                    //selectionchange:function(){_this.setFilter();}
                //}
            //},
            //cls: 'list',
         	//trackOver: true,
            //overItemCls: 'list-item-hover',
            //itemSelector: '.list-item',
            //tpl: '<tpl for="."><div class="list-item">{name}</div></tpl>'
        //});
        //
        //var panOrigin = Ext.create('Ext.panel.Panel', {
        	//title:'Search by origin',
        	//border:0,
        	//bodyPadding:5,
        	//style: 'border-bottom:1px solid #99bce8;',
		    //items : [this.viewOrigin]
		//});
        
		
        /**SUITE FILTER**/
		//var parsedSuites = JSON.parse(this.suiteList);
		//var suites = [{name:"bam"},{name:"vcf"},{name:"gff"},{name:"gtf"},{name:"bed"}];
		// remove not available suites
		//for(var i = 0; i < parsedSuites.length; i++) {
			//if(this.notAvailableSuiteList.indexOf(parsedSuites[i].name)==-1){ // es que esta para quitar
				//suites.push(parsedSuites[i]);
			//}
		//}
		
        //var stSuite = Ext.create('Ext.data.Store', {
	 		//fields: ["suiteId","name","description"],
	 		//data : suites
		//});
		
		//this.viewSuite = Ext.create('Ext.view.View', {
		    //store : stSuite,
            //selModel: {
                //mode: 'SINGLE',
                ////allowDeselect:true,
                //listeners: {
                	//selectionchange:function(){_this.setFilter();}
                //}
            //},
            //cls: 'list',
         	//trackOver: true,
            //overItemCls: 'list-item-hover',
            //itemSelector: '.list-item',
            //tpl: '<tpl for="."><div class="list-item">{name}</div></tpl>'
        //});
         //
        //var panSuite = Ext.create('Ext.panel.Panel', {
        	//title:'Search by suite',
        	//border:0,
        	//bodyPadding:5,
		    //items : [this.viewSuite]
		//});

		
		/**TEXT SEARCH FILTER**/
        //this.searchField = Ext.create('Ext.form.field.Text',{
        	 //id:this.searchFieldId,
	         //flex:1,
			 //emptyText: 'enter search term',
			 //enableKeyEvents:true,
			 //listeners:{
			 	//scope:this,
			 	//change:this.setFilter
			 //}
        //});
        
        /**FILTER PANEL**/
         //var panFilter = Ext.create('Ext.panel.Panel', {
			//title:"Filtering",
		    //border:false,
		    //items : [panOrigin,panSuite],
		    //tbar : {items:this.searchField}
		//});

		/*MANAGE BUCKETS*/
		var newProjectButton = Ext.create('Ext.button.Button',{
        	text : 'OK',
        	handler : function() {
        		_this.createProject("newProject");
        		_this.folderTree.toggleCollapse();
        		//manageProjects.toggleCollapse();
        	}
        });
        var newProjectNameField = Ext.create('Ext.form.field.Text',{
        	id:this.id+"newProjectNameField",
        	width: 160,
        	emptyText: 'name',
        	allowBlank:false
        });
        var newProjectDescriptionField = Ext.create('Ext.form.field.TextArea',{
        	id:this.id+"newProjectDescriptionField",
        	width: 160,
        	emptyText: 'description'
        });
		var newProjectCont = Ext.create('Ext.container.Container', {
			flex:1,
			layout: { type: 'hbox',align: 'stretch'},
			items:[newProjectNameField,newProjectDescriptionField]
		});
		var manageProjects = Ext.create('Ext.panel.Panel', {
			title:"Create bucket",
			bodyPadding:5,
			border:false,
			items:[newProjectNameField,newProjectDescriptionField,newProjectButton]
		});
		/*END MANAGE PROJECTS*/

		/*TREE VIEW*/
		this.filesGrid = Ext.create('Ext.grid.Panel', {
			title:this.allStore.getRootNode().getPath("text"," / "),
			store:this.filesStore,
			flex:4,
			border:false,
			selModel: {
                mode: 'SINGLE',
                //allowDeselect:true,
                listeners: {
                	scope:this,
                    selectionchange: function (este,item){
						if(item.length>0){//se compr
							this.selectButton.enable();
							//this.selectedLabel.setText('<p>The selected file <span class="emph">'+item[0].data.fileName.substr(0,40)+'</span><span class="ok"> is allowed</span>.</p>',false);
							//TODO por defecto cojo el primero pero que pasa si el data contiene varios ficheros??
						}else{
							this.selectButton.disable();
						}
					}
				}
			},
			columns: [
				{ text: 'File type', xtype: 'actioncolumn', menuDisabled: true, align: 'center', width:54, icon:Compbio.images.bluebox,
					renderer: function(value, metaData, record){
						this.icon = Compbio.images[record.data.fileType];
						this.tooltip = record.data.fileType;
					}
				},
				{ text: 'Name',  dataIndex: 'fileName', flex:2 },
				{ text: 'Creation time', dataIndex: 'creationTime', flex:1 },
				{ xtype: 'actioncolumn', menuDisabled: true, align: 'center', tooltip: 'Delete data!', width:30, icon: Compbio.images.del,
					handler: function(grid, rowIndex, colIndex, actionItem, event, record, row) {
						//this also fires itemclick event from tree panel
						if(record != null){
							Ext.MessageBox.confirm('Confirm', 'Are you sure you want to delete this file?<p class="emph">'+record.data.fileName+'<p>', function(answer){
								if(answer == "yes"){
									console.log("deleting")
									var gcsaManager = new GcsaManager();
									gcsaManager.onDeleteDataFromProject.addEventListener(function (sender, response){
										if (response.indexOf("ERROR:") != -1){
											Ext.example.msg("Deleting",response);
										}else{
											//delete complete
											record.destroy();
											_this.onNeedRefresh.notify();
										}
									});
									gcsaManager.deleteDataFromProject($.cookie("bioinfo_account"), $.cookie("bioinfo_sid"), $.cookie('bioinfo_bucket'), record.data.oid);
								}
							});
						}
					}
				}
			]
		});
		/**/
		
		var panAccordion = Ext.create('Ext.panel.Panel', {
			minWidth: 125,
		    minHeight : 370,
			flex:1,
			cls:'panel-border-right',
		    border:false,
		    layout: 'accordion',
		    items : [this.folderTree, manageProjects /*, panFilter*/]
		});



		this.selectButton = Ext.create('Ext.button.Button', {
			 text: 'Ok',
			 disabled:true,
			 handler: function(){
	       			var item = _this.filesGrid.getSelectionModel().getSelection()[0];
	       			//if(_this.retrieveData==true){
	       				//_this.adapter.readData($.cookie('bioinfo_sid'),item.data.dataFiles[0].dataId,item.data.dataFiles[0].filename);	       				
	       			//}
	       			_this.onSelect.notify({id:item.raw.oid,bucketId:item.raw.bucketId});
	       			_this.panel.close();
	       	}
		});  
		/**MAIN PANEL**/
//		this.height=205+(26*suites.length);//segun el numero de suites

		var tbarObj = {items:[
			{text:'Upload object',handler:function(){_this.drawUploadWidget();}}
		]};
		switch(mode){
			case "full" : var item;
				item = {text:'New folder',handler:function(){_this.folderTree.expand();_this.createFolder();}};
				tbarObj.items.splice(0, 0, item);
				item = {text:'New bucket',handler:function(){manageProjects.expand();}};
				tbarObj.items.splice(0, 0, item);
			break;
		}
		this.panel = Ext.create('Ext.window.Window', {
		    title: 'WebDrive Browser',
		    resizable: false,
		    minimizable :true,
			constrain:true,
		    closable:true,
		    modal:true,
		    height:this.height,
		    width:this.width,
		    layout: { type: 'hbox',align: 'stretch'},
		    tbar:tbarObj,
		    items: [panAccordion,this.filesGrid],
		    buttonAlign:'right',
		    buttons:[
		             { text: 'Close', handler: function(){_this.panel.close();}},
		             this.selectButton
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
	}//if null

	this._updateFolderTree();
	this.panel.show();
};

GcsaBrowserWidget.prototype.setFilter = function (){
	var _this=this;
	var recordOrigin = this.viewOrigin.getSelectionModel().getSelection()[0];
	var recordSuite = this.viewSuite.getSelectionModel().getSelection()[0];
	
	this.folderStore.clearFilter();
	
	if(recordOrigin!=null){
		switch(recordOrigin.data.suiteId){
			case  "all": 			break;
			case  "Uploaded Data": 	this.folderStore.filter(function(item){return item.data.jobId < 0;}); break;
			case  "Job Generated": 	this.folderStore.filter(function(item){return item.data.jobId > 0;}); break;
		}
	}
	if(recordSuite!=null){
		switch(recordSuite.data.suiteId){
			case  1: 				break;
			default : 				this.folderStore.filter(function(item){return item.data.suiteId == recordSuite.data.suiteId;});
		}
	}
	
	this.folderStore.filter(function(item){
			var str = Ext.getCmp(_this.searchFieldId).getValue().toLowerCase();
			if(item.data.name.toLowerCase().indexOf(str)<0){
				return false;
			}
			return true;
		});
};

GcsaBrowserWidget.prototype.checkTags = function(tags){
	for(var i = 0; i < this.tags.length ; i++){
		if (this.tags[i].indexOf('|')>-1){
			var orTags = this.tags[i].split('|');
			var orMatch = false;
			for(var j = 0; j < orTags.length ; j++){
				if (tags.indexOf(orTags[j]) >-1){
					orMatch=true;
				}
			}
			if(!orMatch){
				return false;
			}
		}else{
			if (tags.indexOf(this.tags[i])==-1){
				return false;
			}
		}
	}
	return true;
	
};



GcsaBrowserWidget.prototype.createProject = function (){
	var _this = this;
	var name = Ext.getCmp(this.id+"newProjectNameField").getValue();
	var desc = Ext.getCmp(this.id+"newProjectDescriptionField").getValue();
	if(name!=""){
		Ext.getBody().mask();
		_this.panel.setLoading("Creating project");
		this.adapter.createBucket(name, desc, $.cookie("bioinfo_account"), $.cookie("bioinfo_sid"));
	}
};

GcsaBrowserWidget.prototype.drawUploadWidget = function (){
	var _this = this;
	var selectedBuckets = this.folderTree.getSelectionModel().getSelection();
	if(selectedBuckets.length < 1 ){
		Ext.example.msg('No folder selected', 'Please select a bucket or a folder.');
	}else{
		var record = selectedBuckets[0];
		var bucketName;
		var parent = "";
		if(record.raw.fileType != null && record.raw.fileType == "dir"){
			var path = record.getPath("text","/").substr(1);
			var pathArr =  path.split("/",2);
			var parent = path.replace(pathArr.join("/"),"").substr(1)+"/";
			bucketName = pathArr[1];
		}else{
			bucketName = record.raw.text;
		}
		_this.uploadWidget.draw({bucketId:bucketName,directory:parent});
	}
};

GcsaBrowserWidget.prototype.createFolder = function (){
	var _this = this;
	if(this.accountData.buckets.length < 1){
		Ext.MessageBox.alert('No buckets found', 'Please create and select a bucket.');
	}else{
		var selectedBuckets = this.folderTree.getSelectionModel().getSelection();
		if(selectedBuckets.length < 1 ){
			Ext.example.msg('No folder selected', 'Please select a bucket or a folder.');
			//Ext.MessageBox.alert('No bucket selected', 'Please select a bucket or a folder.');
		}else{

			var record = selectedBuckets[0];
			var bucketName;
			var parent = "";
			if(record.raw.fileType != null && record.raw.fileType == "dir"){
				var path = record.getPath("text","/").substr(1);
				var pathArr =  path.split("/",2);
				var parent = path.replace(pathArr.join("/"),"").substr(1)+"/";
				bucketName = pathArr[1];
			}else{
				bucketName = record.raw.text;
			}
			
			Ext.Msg.prompt('New folder', 'Please enter a name for the new folder:', function(btn, text){
				if (btn == 'ok'){
					text = text.replace(/[^a-z0-9\s-_.]/gi,'');
					text = text.trim()+"/";
					var gcsaManager = new GcsaManager();
					gcsaManager.onCreateDirectory.addEventListener(function(sender,res){
						Ext.example.msg('Create folder', '</span class="emph">'+ res+'</span>');
						if(res.indexOf("ERROR")!= -1){
							console.log(res);
						}else{
							_this.onNeedRefresh.notify();
						}
					});
					gcsaManager.createDirectory($.cookie("bioinfo_account"), $.cookie("bioinfo_sid"), bucketName , parent+text);
				}
			},null,null,"New Folder");
		}
	}
};

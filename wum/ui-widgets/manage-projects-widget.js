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

function ManageProjectsWidget(args){
	var _this=this;
	this.id = "ManageProjectsWidget_"+ Math.round(Math.random()*10000);
	this.targetId = null;

	this.title = null;
   	this.width = 880;
	this.height = 420;
	this.suiteId=-1;
	
	this.args = args;
	
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
        if (args.suiteId != null){
        	this.suiteId = args.suiteId;
        }
    }
	
	this.selectedItems = new Object();
	this.selectedProjectId = null;
	this.selectedProjectName = null;
	this.selectedProjectSuiteId = null;
	this.selectedProjectJobs = null;
	this.lastSelectedItem = null;
	
	this._storeProjects = Ext.create('Ext.data.Store', {
		fields: ["name","projectId","jobs","active"],
		data : []
	});
	
	//barrier while deleting
	this.deleting=false;
	
	this.onRefreshProjectList = new Event();
};

ManageProjectsWidget.prototype.draw = function (){
	var _this = this;
	this._render();
	this._panel.show();
	this.refreshListProject();
	this.interval = setInterval(function () {
			_this.refreshListProject();
	},4000);
		
};

ManageProjectsWidget.prototype.getPanel = function (div){
	this._render("panel",div);
	return this._panel;
};

ManageProjectsWidget.prototype._render = function (mode,targetId){
	var _this=this;
	if(this._panel==null){		
        var viewProject = Ext.create('Ext.view.View', {
			id:this.id+'viewProject',
		    store : this._storeProjects,
            selModel: {
                mode: 'SINGLE',
                listeners: {
                    selectionchange:function(este,sel){
                    	if(sel.length>0){//sometimes returns null
                    		if(sel[0].data.jobs == null){ sel[0].data.jobs=[]; }
                    		_this.optionProjectClick(sel[0].data);
                    	}
                    }
                }
            },
            cls: 'list',
         	trackOver: true,
            overItemCls: 'list-item-hover',
            itemSelector: '.list-item',
            tpl: '<tpl for="."><div class="list-item">{name}</div></tpl>'
        });
        

		
        var newProjectButton = Ext.create('Ext.button.Button',{
        	text : 'OK',
        	handler : function() {
        		_this.optionProjectClick("newProject");
        		newProjectPan.toggleCollapse();
        	}
        });
        var newProjectNameField = Ext.create('Ext.form.field.Text',{
        	id:this.id+"newProjectNameField",
        	width: 210,
        	emptyText: 'name',
        	allowBlank:false
        });
        var newProjectDescriptionField = Ext.create('Ext.form.field.TextArea',{
        	id:this.id+"newProjectDescriptionField",
        	width: 210,
        	emptyText: 'description'
        });
		var newProjectCont = Ext.create('Ext.container.Container', {
			flex:1,
			layout: { type: 'hbox',align: 'stretch'},
			items:[newProjectNameField,newProjectDescriptionField]
		});

		var newProjectPan = Ext.create('Ext.panel.Panel', {
			title:"Create Project",
			bodyPadding:5,
			border:false,
			items:[newProjectNameField,newProjectDescriptionField,newProjectButton]
		});
		/**TEXT SEARCH FILTER**/
		var searchField = Ext.create('Ext.form.field.Text',{
			flex:1,
			emptyText: 'search project',
			enableKeyEvents:true,
			listeners:{
				change:function(){
					var searchText = this.getValue().toLowerCase();
					_this._storeProjects.clearFilter();
					_this._storeProjects.filter(function(item){
						if(item.data.name.toLowerCase().indexOf(searchText)<0){
							return false;
						}
						return true;
					});
				}
			}
		});
		
		var renameButton = Ext.create('Ext.button.Button',{
			id: this.id+"rBtn",
        	iconCls: 'icon-rename-project',
        	tooltip: "Rename selected project",
        	margin: "0 0 0 2",
        	handler: function(){
//        		console.log("Renaming project: "+_this.selectedProjectId+" Name: "+_this.selectedProjectName);
        		_this.renameProject(_this.selectedProjectId, _this.selectedProjectName);
        	}
        });
        var deleteButton = Ext.create('Ext.button.Button',{
        	id: this.id+"dBtn",
        	iconCls: 'icon-project-delete',
        	tooltip: "Delete selected project",
        	margin: "0 0 0 2",
        	handler: function(){
//        		console.log("Deleting project: "+_this.selectedProjectId);
        		_this.deleteProject(_this.selectedProjectId, _this.selectedProjectSuiteId, _this.selectedProjectJobs);
        	}
        });
        var activeButton = Ext.create('Ext.button.Button',{
        	id: this.id+"aBtn",
        	iconCls: 'icon-change-project',
        	tooltip: "Active selected project",
        	margin: "0 0 0 2",
        	handler: function(){
        		_this.activeProject(_this.selectedProjectId, _this.selectedProjectName);
        	}
        });
		
		var searchProjectPanel = Ext.create('Ext.panel.Panel', {
        	layout: 'hbox',
        	flex: 1,
        	border: false,
			items: [searchField,renameButton,deleteButton,activeButton]
		});
        
        var panProjectList = Ext.create('Ext.panel.Panel', {
        	title:"Project list",
        	flex:1,
		    border:false,
			autoScroll:true,
			bodyPadding:5,
		    items:[searchProjectPanel,viewProject]
		});

		 var cont = Ext.create('Ext.panel.Panel', {
			    border:false,
			    minWidth:220,
				width:220,
				layout:'accordion',
			    items:[panProjectList,newProjectPan]
		});
        
        if(mode=='panel'){
			this._panel = Ext.create('Ext.panel.Panel', {
				title: 'Manage projects',
				renderTo:targetId,
				height:this.height,
				width:this.width,
				layout: { type: 'hbox',align: 'stretch'},
				items: cont
			});
		}
        else{
			this._panel = Ext.create('Ext.window.Window', { 
				title: 'Manage projects',
				iconCls:'icon-project-manager',
		    	resizable: false,
				minimizable: false,
				constrain: true,
				closable: true,
				modal: true,
				height: this.height,
				width: this.width,
				layout: { type: 'hbox',align: 'stretch'},
				items: cont,
				listeners: {
					 minimize: function(){
						 _this._panel.hide();
					 },
					 close: function(){
						 clearInterval(_this.interval);
						 if(_this._panel.getComponent(1)!=null){
							 _this._panel.getComponent(1).hide();
							 _this._panel.remove(1,false);
						 }
						 delete _this._panel;
					 }
				}
			});
		}
	}
};

//ManageProjectsWidget.prototype.parseData = function (data){	
////  load data
////	this._storeProjects.loadData(data);
////	console.log(this.selectedProjectName);
//	if(this[this.selectedProjectName+"Grid"] != null){
//		var months = {"01":"January","02":"February","03":"March","04":"April","05":"May","06":"June","07":"July","08":"August","09":"September","10":"October","11":"November","12":"December"};
//		var monthNum = null;
//		data = JSON.parse(data);
//		var projectData = new Array();
//		for(var i=0; i<data.length; i++){
//			if(data[i].projectId == this.selectedProjectId && data[i].visites >= 0){
//				monthNum = data[i].creationTime.substr(5,2);
//				data[i].creationMonth = data[i].creationTime.substr(0,4)+" - "+months[monthNum];
//				console.log(data[i].creationMonth);
//				projectData.push(data[i]);				
//			}
//		}
//		this[this.selectedProjectName+"Grid"].store.loadData(projectData);
//	}
//};

ManageProjectsWidget.prototype.optionProjectClick = function (dataRecord){
	this.selectedItems = new Object();
	var projectName = dataRecord.name;
	if(this.selectedProjectName != projectName){
		this.lastSelectedItem=null;
	}
	this.selectedProjectId = dataRecord.projectId;
	this.selectedProjectName = projectName;
	this.selectedProjectSuiteId = dataRecord.suiteId;
	this.selectedProjectJobs = dataRecord.jobs;
	if(this._panel.getComponent(1)!=null){
		this._panel.getComponent(1).hide();
		this._panel.remove(1,false);
	}
	switch (dataRecord){
		case "newProject": this.createProject(); break;
		default: this._panel.add(this.getByProjectGrid(dataRecord.jobs,projectName).show());
	}
};

ManageProjectsWidget.prototype.getByProjectGrid = function(data, name){
	var _this=this;
	var months = {"1":"January","2":"February","3":"March","4":"April","5":"May","6":"June","7":"July","8":"August","09":"September","10":"October","11":"November","12":"December"};
	var monthNum = null;
	var projectData = new Array();
	for(var i=0; i<data.length; i++){
		if(data[i].visites >= 0){
			monthNumStr = data[i].creationTime.substr(5,2); 
			monthNum = parseInt(monthNumStr);
			data[i].creationMonth = data[i].creationTime.substr(0,4)+" - "+monthNumStr+" ("+months[monthNum]+")";
			projectData.push(data[i]);
		}
	}
	
    if(this[name+"Grid"]==null){
    	var groupField = 'creationMonth';
    	var modelName = name;
    	var fields= ["name", "creationTime", "toolName", "creationMonth","jobId"];
    	var columns = [
		    		  {"header":"Name","dataIndex":"name",flex:1},
		    		  {"header":"Launched on","dataIndex":"creationTime",flex:0.7},
		    		  {"header":"Tool name","dataIndex":"toolName",flex:1}];    	
		this[name+"Grid"] = this.doGrid(columns,fields,modelName,groupField);
    }
//    console.log(this.lastSelectedItem);
    if(this.lastSelectedItem != null){
    	var jid = this.lastSelectedItem.data.jobId;
    }
    
    if(!this.deleting){
    	this[name+"Grid"].store.loadData(projectData);
    }
    
    
    if(this.lastSelectedItem != null){
    	this[name+"Grid"].getSelectionModel().select(this[name+"Grid"].store.find("jobId",jid));
    }
    return this[name+"Grid"];
};

ManageProjectsWidget.prototype.doGrid = function (columns,fields,modelName,groupField){
	var _this = this;
	
    Ext.define(modelName, {
	    extend: 'Ext.data.Model',
    	fields:fields
	});
   	var store = Ext.create('Ext.data.Store', {
		groupField: groupField,
		sorters: [{ property : 'creationMonth', direction: 'DESC'}, { property : 'creationTime', direction: 'DESC'}],
		model:modelName
    });
	var grid = Ext.create('Ext.grid.Panel', {
		id: this.id+modelName,
        store: store,
        title : "Jobs of project "+modelName,
        border: false,
        cls: 'panel-border-left',
		flex: 3,
		multiSelect: false,
		features: [{ftype:'grouping'}],
        columns: columns,
        listeners: {
            selectionchange:function(este,sel){
            	if(sel[0]!=null){//sometimes returns null
            		_this.selectedItems = new Object();
            		for(var i=0; i<sel.length; i++){
            			_this.selectedItems[sel[i].data.jobId]=sel[i];
            			_this.lastSelectedItem = sel[i];
            		}
//            		Ext.getCmp("deleteButton").enable();
            	}
            }
        },
        tbar: [{
        	id: "deleteButton",
        	text: 'Delete selected job',
        	iconCls: 'icon-delete',
//        	disabled: true,
        	handler : function(){
        		_this.deleteJob(modelName);
        	}
        }]
    });
	
return grid;
};

ManageProjectsWidget.prototype.deleteJob = function (modelName){
	var _this = this;

	this.deleting = true;
	Ext.Msg.confirm("Delete job", "Are you sure you want to delete the selected job(s)?", function (btnClicked){
		if(btnClicked == "yes") {
			_this[modelName+"Grid"].store.remove(_this.lastSelectedItem);
			var adapter = new WumAdapter();
			adapter.onDeleteJob.addEventListener(function (sender, data){
				console.log("back from delete "+data.response);
				if(data.response.indexOf("OK") != -1) {
					_this.deleting = false;
				}
				else {
					Ext.Msg.alert("Delete job", "ERROR: could not delete job.");
				}
			});
			adapter.deleteJob(_this.lastSelectedItem.data.jobId, $.cookie('bioinfo_sid'));
			_this.lastSelectedItem = null;
		}
	});
};

ManageProjectsWidget.prototype.createProject = function (){
	var _this = this;
	
	var name = Ext.getCmp(this.id+"newProjectNameField").getValue();
	var desc = Ext.getCmp(this.id+"newProjectDescriptionField").getValue();
	if(name!=""){
		var adapter = new WumAdapter();
		adapter.onCreateProject.addEventListener(function (sender, data){
			if(data.indexOf("ERROR") != -1) {
				Ext.Msg.alert("Create project", "ERROR: could not create this project.");
			}
			else {
				_this.refreshListProject();
			}
			_this._panel.setLoading(false);
			Ext.getBody().unmask();
		});
		Ext.getBody().mask();
		_this._panel.setLoading("Creating project");
		adapter.createProject(name, desc, $.cookie("bioinfo_sid"));
	}
};

ManageProjectsWidget.prototype.renameProject = function (projectId, projectName){
	var _this = this;
	var nameField = Ext.create('Ext.form.field.Text',{
		fieldLabel: 'New name',
		labelWidth: 70,
		width: 200,
		minWidth: 200,
		allowBlank: false
	});
	
	var labelInfo = Ext.create('Ext.toolbar.TextItem', {
		padding:3,
		text:'<span class="info">Type the new project name</span>'
	});
	
	this.pan = Ext.create('Ext.panel.Panel', {
		bodyPadding:20,
	    height:100,
	    border:false,
	    bbar:{items:[labelInfo]},
	    items: [nameField]
	});
	
	this.renameWindow = Ext.create('Ext.window.Window',{
		title: 'Rename project '+projectName,
		resizable: false,
		closable: true,
		constrain:true,
		modal: true,
		items: this.pan,
		buttons:['->',
		         {text:'Ok', handler: function(){
		        	 	var newProjectName = nameField.getValue();
		        		if(newProjectName!=""){
		        			var adapter = new WumAdapter();
		        			adapter.onRenameProject.addEventListener(function (sender, data){
		        				if(data.indexOf("OK") != -1) {
		        					Ext.getCmp(_this.id+_this.selectedProjectName).setTitle("Jobs of project "+newProjectName);
		        					_this.refreshListProject();
		        				}
		        				else {
		        					Ext.Msg.alert("Rename project", "ERROR: could not rename this project.");
		        				}
		        			});
		        			adapter.renameProject(projectId, newProjectName, $.cookie("bioinfo_sid"));
		        			_this.renameWindow.close();
		        		}
		        	 }
		         }
		]
	});
	this.renameWindow.show();
};

ManageProjectsWidget.prototype.deleteProject = function (projectId, projectSuiteId, projectJobs){
	var _this = this;

	Ext.Msg.confirm("Delete project", "Are you sure you want to delete this project?", function (btnClicked){
		if(btnClicked == "yes") {
			var adapter = new WumAdapter();
			adapter.onDeleteProject.addEventListener(function (sender, data){
				if(data.indexOf("OK") != -1) {
					_this.refreshListProject();
					if(_this._panel.getComponent(1)!=null){
						_this._panel.getComponent(1).hide();
						_this._panel.remove(1,false);
					}
				}
				else {
					Ext.Msg.alert("Delete project", "ERROR: could not delete this project. Project must not have jobs to be deleted.");
				}
				_this._panel.setLoading(false);
				Ext.getBody().unmask();
			});
			Ext.getBody().mask();
			_this._panel.setLoading("Deleting project");
			adapter.deleteProject(projectId, $.cookie("bioinfo_sid"), projectSuiteId);
		}
	});
};

ManageProjectsWidget.prototype.refreshListProject = function (){
	var _this = this;
	
	var adapter = new WumAdapter();
	adapter.onListProject.addEventListener(function(sender,data){
		var data = JSON.parse(data);
		_this._storeProjects.loadData(data);
		var activeProjectId = null;
		var projectList = new Array();
		for ( var i = 0; i < data.length; i++) {
			projectList.push({name:data[i].name,projectId:data[i].projectId});
			if(data[i].active){
				activeProjectId=data[i].projectId;
				_this.selectedProjectName = data[i].name;
//				console.log(_this.selectedProjectName);
			}
		}
		if(_this.selectedProjectId==null){
			_this.selectedProjectId=activeProjectId;
		}
			
		_this._panel.setTitle("Manage projects - "+'<b class="err">'+_this.selectedProjectName+'</b>');
		var activeRecord = _this._storeProjects.find("projectId", _this.selectedProjectId);
		Ext.getCmp(_this.id+"viewProject").getSelectionModel().select(activeRecord);
//		Ext.getCmp('UserBarWidget__spltbtnActiveProjectID').setText('<b class="emph">'+_this.selectedProjectName+'</b>');
		_this.onRefreshProjectList.notify(projectList);
	});
	adapter.listProject($.cookie("bioinfo_sid"),_this.suiteId);
};

ManageProjectsWidget.prototype.activeProject = function (projectId, projectName){
	var _this = this;
	
	var adapter = new WumAdapter();
	adapter.onActiveProject.addEventListener(function (sender, data){
		 if(data.indexOf("ERROR") != -1) {
			 Ext.Msg.alert("Create project", "ERROR: could not active this project.");
		 }
		 else {
			 Ext.getCmp('UserBarWidget__spltbtnActiveProjectID').setText('<b class="emph">'+projectName+'</b>');
			 _this._panel.setTitle("Manage projects - "+'<b class="err">'+projectName+'</b>');
		 }
		 _this._panel.setLoading(false);
		 Ext.getBody().unmask();
	});	
	Ext.getBody().mask();
	this._panel.setLoading("Loading project");
	adapter.activeProject(projectId, $.cookie('bioinfo_sid'));
};

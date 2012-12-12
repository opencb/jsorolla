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

function UserBarWidget(args){
	var _this=this;
	this.id = "UserBarWidget_";
	this.targetId = null;
	
	if (args != null){
		if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
    }
	
    /**ID**/
	this.spltbtnActiveProjectId = this.id + "_spltbtnActiveProjectID";
    
    this.adapter = new WumAdapter();
    
	/**Events i send**/
	this.onItemsReady = new Event(this);
	this.onProjectChange = new Event(this);
	
	/**Atach events i listen**/
	this.adapter.onGetUserInfo.addEventListener(function (sender, data){
		_this.responseGetUserInfo(data);
		
	});	
	this.adapter.onActiveProject.addEventListener(function (sender, data){
		_this.responseActiveProject();
	});
	
};
UserBarWidget.prototype.responseActiveProject = function(data){
	Ext.getBody().unmask();
	Ext.getCmp(this.spltbtnActiveProjectId).setText('<b class="emph">'+this.workingProject+'</b>');
	this.onProjectChange.notify();
};
UserBarWidget.prototype.responseGetUserInfo = function(data){
//	console.log(data);
	this.pdata = JSON.parse(data);
//	console.log(this.pdata);
	
	var a=(this.pdata.diskUsage/1024).toFixed(2);
	var b=(this.pdata.diskQuota/1024)/1024;
	var p=(this.pdata.diskUsage/this.pdata.diskQuota*100).toFixed(2);
	
//	this.projectNames = [];
	this.workingProject = '<b class="emph">'+this.pdata.activeProjectName+'</b>';
	
	
	this.createProjectMenuItems(this.pdata.ownedProjects);
	
	this.userInfo = '<b style="color:darkred">'+this.pdata.email+'</b>&nbsp;working&nbsp;on&nbsp;project';
	this.userInfo2 = ' using&nbsp;<b style="color:chocolate">'+a+'</b>&nbsp;MB&nbsp;of&nbsp;<b style="color:blue">'+b+'</b>&nbsp;GB&nbsp;(<b>'+p+'%</b>)&nbsp;';

	this.render();
	this.onItemsReady.notify();
};

UserBarWidget.prototype.draw = function (bar){
	this.clean(bar);
	this.adapter.getUserInfo($.cookie('bioinfo_sid'));
	
	
};
UserBarWidget.prototype.clean = function (bar){
	if (this.items != null){
		for(var i=0;i<this.items.length;i++){
			bar.remove(this.items[i]);
		}
		delete this.items;
	}
};

UserBarWidget.prototype.render = function (){
	var _this = this;
	if (this.items == null){
		this.projectMenu = Ext.create('Ext.menu.Menu',{
			plain:true,
			items: this.projects
		});
		var splitButton = Ext.create('Ext.button.Button',{
			id : this.spltbtnActiveProjectId,
		    text :this.workingProject,
		    menu: this.projectMenu
		});
		var infoLabel = Ext.create('Ext.container.Container', {
			html: this.userInfo
		});
		var infoLabel2 = Ext.create('Ext.container.Container', {
			html: this.userInfo2
		});
		this.items = [infoLabel, splitButton, infoLabel2];
	}
};

UserBarWidget.prototype.createProjectMenuItems = function (data){
	this.projects = new Array();
	for (var i = 0; i < data.length; i++){
		this.projects[i] = { text : data[i].name,
				index : i,
				iconCls: 'icon-change-project',
				listeners: {
					scope: this,
					click: function(button){
						Ext.getBody().mask('Changing project...');
						console.log('cliked on project id -> '+data[button.index].projectId);
						this.workingProject = data[button.index].name;
						this.workingProjectId = data[button.index].projectId;
						this.adapter.activeProject(data[button.index].projectId, $.cookie('bioinfo_sid'));
					}
				}
		};
//		this.projectNames.push({name:this.pdata.ownedProjects[i].name,jobs:this.pdata.ownedProjects[i].jobs, id:this.pdata.ownedProjects[i].projectId, suiteId:this.pdata.ownedProjects[i].suiteId});
	}
	
	if(this.projectMenu!=null){
		this.projectMenu.removeAll();
		this.projectMenu.add(this.projects);
	}
//	console.log(this.pdata.ownedProjects[0]);
};

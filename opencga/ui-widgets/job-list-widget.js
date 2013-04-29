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

JobListWidget.prototype.draw = UserListWidget.prototype.draw;
JobListWidget.prototype.getData = UserListWidget.prototype.getData;
JobListWidget.prototype.getCount = UserListWidget.prototype.getCount;

function JobListWidget (args){
	var _this = this;
	UserListWidget.prototype.constructor.call(this, args);
	this.counter = null;
	var jobstpl = [
					'<tpl for=".">',
					'<div class="joblist-item">',
						'<p style="color:'+
											'<tpl if="visites == 0">green</tpl>'+
											'<tpl if="visites &gt; 0">blue</tpl>'+
											'<tpl if="visites == -1">red</tpl>'+
											'<tpl if="visites == -2">Darkorange</tpl>'+
											'">{name}</p>',
						'<p style="color: #15428B"><i>{date}</i></p>',
						'<p style="color:steelblue"><i>{toolName}</i></p>',
						'<p style="color:grey"><i>',
//						'<tpl if="visites == 0">finished and unvisited</tpl>',
//						'<tpl if="visites &gt; 0">{visites} visites</tpl>',
//						'<tpl if="visites == -1">',
						//'<div style="height:10px;width:{percentage/100*180}px;background:url(\'http://jsapi.bioinfo.cipf.es/ext/sencha/4.0.2/resources/themes/images/default/progress/progress-default-bg.gif\') repeat-x;">&#160;</div>',
						//'{percentage}%',
//						'running, please wait...',
//						'</tpl>',
                        '{status}',
						'<tpl if="visites &gt; -1"> - {visites} views</tpl>',
//						'</i>  - {id}</p>',
					'</div>',
					'</tpl>'
					];

	var	jobsfields = ['commandLine','date','description','diskUsage','status','finishTime','inputData','jobId','message','name','outputData','ownerId','percentage','projectId','toolName','visites'];

	this.pagedViewList.storeFields = jobsfields;
	this.pagedViewList.template = jobstpl;
	
	if (args.pagedViewList != null){
        if (args.pagedViewList.storeFields != null){
        	this.pagedViewList.storeFields = args.pagedViewList.storeFields;       
        }
        if (args.pagedViewList.template != null){
        	this.pagedViewList.template = args.pagedViewList.template;       
        }
    }
	
	this.pagedListViewWidget = new PagedViewListWidget(this.pagedViewList);
	
	this.btnAllId = 	this.id + "_btnAll";
	this.btnActivePrjId = 	this.id + "_btnActivePrj";
	this.btnFinishedId =this.id + "_btnFinished";
	this.btnVisitedId = this.id + "_btnVisited";
	this.btnRunningId = this.id + "_btnRunning";
	this.btnQueuedId = 	this.id + "_btnQueued";
	
	this.projectFilterButton = Ext.create("Ext.button.Button",{
	    id : this.btnActivePrjId,
	    iconCls: 'icon-project-all',
	    tooltip:'Toggle jobs from all projects or active project',
	    enableToggle: true,
	    pressed: false,
	    listeners: {
	    	toggle:function(){
	    	//_this.selectProjectData();
			_this.render();
	    	}
	    }
	});
	
	
	
	this.bar = new Ext.create('Ext.toolbar.Toolbar', {
//		vertical : true,
		id:this.id+"jobsFilterBar",
		style : 'border : 0',
		dock : 'top',
		items :  [
                  //this.projectFilterButton,
                  {
                	  id : this.btnAllId,
                	  text: ' ',
                	  tooltip:'Total jobs'
                  },
                  {
                	  id : this.btnFinishedId,
                	  text: ' ',
                	  tooltip:'Finished jobs'
                  },
                  {
                	  id : this.btnVisitedId,
                	  text: ' ',
                	  tooltip:'Visited jobs'
                  },
                  {
                	  id : this.btnRunningId,
                	  text: ' ',
                	  tooltip:'Running jobs'
                  },
                  {
                	  id : this.btnQueuedId,
                	  text: ' ',
                	  tooltip:'Queued jobs'
                  }
		]
	});	
	
	Ext.getCmp(this.btnAllId).on('click', this.filter, this);
	Ext.getCmp(this.btnFinishedId).on('click', this.filter, this);
	Ext.getCmp(this.btnVisitedId).on('click', this.filter, this);
	Ext.getCmp(this.btnRunningId).on('click', this.filter, this);
	Ext.getCmp(this.btnQueuedId).on('click', this.filter, this);
	
	this.allData = [];


///*HARDCODED check job status*/
//	var checkJobsStatus = function(){
//		if(_this.accountData != null){
//			var opencgaManager = new OpencgaManager();
//			for ( var i = 0; i < _this.accountData.jobs.length; i++) {
//				if(_this.tools.indexOf(_this.accountData.jobs[i].toolName) != -1){
//					if(_this.accountData.jobs[i].visites<0){
//						opencgaManager.jobStatus($.cookie("bioinfo_account"), $.cookie("bioinfo_sid"), _this.accountData.jobs[i].id);
//					}
//				}
//			}
//		}
//	}
//
//	this.accountInfoInterval = setInterval(function(){checkJobsStatus();}, 4000);
//
///*HARDCODED check job status*/

	
};

//override
JobListWidget.prototype.draw = function (){
	
};

JobListWidget.prototype.clean =  function (){
	clearInterval(this.interval);
	if(this.bar.isDescendantOf(Ext.getCmp(this.pagedListViewWidget.panelId))==true){
		Ext.getCmp(this.pagedListViewWidget.panelId).removeDocked(this.bar,false);
	}
	this.pagedListViewWidget.clean();
};

//JobListWidget.prototype.getResponse = function (){
	//this.adapter.listProject($.cookie("bioinfo_sid"), this.suiteId);
//};

JobListWidget.prototype.setAccountData = function (data){

	this.accountData = data;
	console.log("joblistwidget");
	var jobs = [];
    var job;
	for ( var i = 0; i < this.accountData.projects.length; i++) {
        for ( var j = 0; j < this.accountData.projects[i].jobs.length; j++) {
            job = this.accountData.projects[i].jobs[j];
            if(this.tools.indexOf(job.toolName) != -1){
                job.date = Utils.parseDate(job.date);
                jobs.push(job);
            }
        }
	}
	this.data = jobs;
	this.render();
};


JobListWidget.prototype.render =  function (){
	this.pagedListViewWidget.draw(this.getData());
	if(this.bar.isDescendantOf(Ext.getCmp(this.pagedListViewWidget.panelId))==false){
		Ext.getCmp(this.pagedListViewWidget.panelId).addDocked(this.bar);
	}
	
	var jobcount = this.getJobCounter();

	if (jobcount.all == 0) {
		Ext.getCmp(this.btnAllId).hide();
	} else {
		Ext.getCmp(this.btnAllId).show();
	}
	if (jobcount.finished == 0) {
		Ext.getCmp(this.btnFinishedId).hide();
	} else {
		Ext.getCmp(this.btnFinishedId).show();
	}
	if (jobcount.visited == 0) {
		Ext.getCmp(this.btnVisitedId).hide();
	} else {
		Ext.getCmp(this.btnVisitedId).show();
	}
	if (jobcount.running == 0) {
		Ext.getCmp(this.btnRunningId).hide();
	} else {
		Ext.getCmp(this.btnRunningId).show();
	}
	if (jobcount.queued == 0) {
		Ext.getCmp(this.btnQueuedId).hide();
	} else {
		Ext.getCmp(this.btnQueuedId).show();
	}
	Ext.getCmp(this.btnAllId).setText('<b style="color:black;font-size: 1.3em;">'+jobcount.all+'</b>');
	Ext.getCmp(this.btnFinishedId).setText('<b style="color:green;font-size: 1.3em;">'+jobcount.finished+'</b>');
	Ext.getCmp(this.btnVisitedId).setText('<b style="color:blue;font-size: 1.3em;">'+jobcount.visited+'</b>');
	Ext.getCmp(this.btnRunningId).setText('<b style="color:red;font-size: 1.3em;">'+jobcount.running+'</b>');
	Ext.getCmp(this.btnQueuedId).setText('<b style="color:Darkorange;font-size: 1.3em;">'+jobcount.queued+'</b>');				
};


JobListWidget.prototype.getJobCounter = function() {
	var finished = 0;
	var visited = 0;
	var running = 0;
	var queued = 0;
	for (var i =0 ; i < this.getData().length; i++) {
		if (this.getData()[i].visites > 0){
			visited++;
		}else {
			if (this.getData()[i].visites == 0){
				finished++;
			}
			if (this.getData()[i].visites == -1){
				running++;
			}
			if (this.getData()[i].visites == -2){
				queued++;
			}
		}
	}
	return {"all":this.getData().length,"visited": visited, "finished": finished, "running": running, "queued": queued};
};

/**Filters**/
//var functionAssertion = function(item){return item.data.visites > 2;};

JobListWidget.prototype.filter = function (button){
	switch (button.id) {
		case this.btnFinishedId:
			this.pagedListViewWidget.setFilter(function(item){return item.data.visites == 0;});
			break;
		case this.btnVisitedId:
			this.pagedListViewWidget.setFilter(function(item){return item.data.visites > 0;});
			break;
		case this.btnRunningId:
			this.pagedListViewWidget.setFilter(function(item){return item.data.visites == -1;});
			break;
		case this.btnQueuedId:
			this.pagedListViewWidget.setFilter(function(item){return item.data.visites == -2;});
			break;
		default:
			this.pagedListViewWidget.setFilter(function(item){return true;});
			break;
	}
	this.pagedListViewWidget.draw(this.getData());
};

JobListWidget.prototype.selectProjectData = function (){
	if(!this.projectFilterButton.pressed){
		for ( var i = 0; i < this.allData.length; i++) {
			if(this.allData[i].active){
				this.data=this.allData[i].jobs;
				break;
			}
		}
	}else{
		var allJobs = new Array();
		for ( var i = 0; i < this.allData.length; i++) {
			if(this.allData[i].jobs!=null){
				for ( var j = 0; j < this.allData[i].jobs.length; j++) {
					
					//TODO care with date order
					allJobs.push(this.allData[i].jobs[j]);
				}
			}
		}
		this.data=allJobs;
	}
	if(this.data==null){
		this.data=[];
	}
	this.pagedListViewWidget.draw(this.getData());
};

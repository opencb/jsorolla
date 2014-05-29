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

function JobListWidget(args) {

    this.RUNING_COLOR = '#298c63';
    this.QUEUED_COLOR = 'Darkorange';
    this.FINISHED_COLOR = '#0068cc';
    this.ERROR_COLOR = '#b30000';

    var _this = this;
    UserListWidget.prototype.constructor.call(this, args);
    this.counter = null;
    var jobstpl = [
        '<tpl for=".">',
        '<div class="joblist-item bootstrap">',

        '<div style="color:#596F8F">{[ this.getNewIcon(values) ]} {name}</div>',
            '<div> ' +
            '<span class="{[ this.getClass(values) ]}">{toolName}{execution} </span> ' +
            '</div>',
            '<div>' +
            '<span style="color: {[ this.getStatusColor(values) ]};">{status}</span> ' +
            '<span style="color: dimgray;font-size:12px;"> &nbsp; &nbsp; {date} </span> ' +
            '</div>',

//        '<div style="color:grey">',

//            '<tpl if="visites == 0">#298c63</tpl>' +
//            '<tpl if="visites &gt; 0">#0068cc</tpl>' +
//            '<tpl if="visites == -1">#b30000</tpl>' +
//            '<tpl if="visites == -2">Darkorange</tpl>' +
////            '<tpl if="status == \'execution_error\'">red</tpl>' +


//        '<tpl if="visites &gt; -1"> - {visites} views</tpl>',
//                        '  - {id}' +
//        '</div>',

        '</div>',
        '</tpl>',
//        {
//            getBackColor: function (item) {
//                if (item.status.indexOf('error') !== -1) {
//                    return '#FDE5E5'
//                } else {
//
//                }
//            }
//        },
        {
//
            getStatusColor: function (item) {
                var color = '#000000';
                switch (item.status) {
                    case 'running':
                        color = _this.RUNING_COLOR;
                        break;
                    case 'finished':
                        color = _this.FINISHED_COLOR;
                        break;
                    case 'queued':
                        color = _this.QUEUED_COLOR;
                        break;
                    case 'execution_error':
                    case 'queue_error':
                        color = _this.ERROR_COLOR;
                        break;
                }
                return color;
            }
        },
        {
            getNewIcon: function (item) {
                var html = '';
                if (item.visites === 0) {
                    html += '<span style="color:' + _this.FINISHED_COLOR + '" class="glyphicon glyphicon-exclamation-sign"></span> ';
                }
                switch (item.status) {
                    case 'running':
                        html += '<span style="color:' + _this.RUNING_COLOR + '" class="glyphicon glyphicon-cog"></span>';
                        break;
                    case 'queued':
                        html += '<span style="color:' + _this.QUEUED_COLOR + '" class="glyphicon glyphicon-time"></span>';
                        break;
                    case 'finished':
                        html += '<span style="color:' + _this.FINISHED_COLOR + '" class="glyphicon glyphicon-ok-circle"></span>';
                        break;
                    case 'execution_error':
                    case 'queue_error':
                        html += '<span style="color:' + _this.ERROR_COLOR + '" class="glyphicon glyphicon-remove-circle"></span>';
                        break;
                }
                return html;
            }
        },
        {
            getClass: function (item) {
                return item.toolName.replace('.', '_');
            }
        }
    ];

    var jobsfields = ['commandLine', 'date', 'description', 'diskUsage', 'status', 'finishTime', 'inputData', 'jobId', 'message', 'name', 'outputData', 'ownerId', 'percentage', 'projectId', 'toolName', 'visites'];

    this.pagedViewList.storeFields = jobsfields;
    this.pagedViewList.template = jobstpl;


    if (args.pagedViewList != null) {
        if (args.pagedViewList.storeFields != null) {
            this.pagedViewList.storeFields = args.pagedViewList.storeFields;
        }
        if (args.pagedViewList.template != null) {
            this.pagedViewList.template = args.pagedViewList.template;
        }
    }

    this.pagedListViewWidget = new PagedViewListWidget(this.pagedViewList);

    this.pagedListViewWidget.on('item:contextmenu', function (event) {
        var record = event.record;
        var contextMenu = Ext.create('Ext.menu.Menu', {
            plain: true,
            items: [
                {
                    text: 'Delete Job',
                    icon: Utils.images.del,
                    handler: function (w, e) {
                        if (record) {
                            Ext.Msg.confirm("Delete job", "Are you sure you want to delete this job?", function (btnClicked) {
                                if (btnClicked == "yes") {
                                    OpencgaManager.deleteJob({
                                        accountId: $.cookie('bioinfo_account'),
                                        sessionId: $.cookie('bioinfo_sid'),
                                        jobId: record.data.id,
                                        success: function (response) {
                                            if (response.errorMsg === '') {
                                                Utils.msg('Delete job', '</span class="emph">' + response.result[0].msg + '</span>');
                                            } else {
                                                Ext.Msg.alert('Delete job, try again later.', response.errorMsg);
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }
                }
            ]
        });
        contextMenu.showAt(event.originalEvent.getXY());
    });


    this.btnAllId = this.id + "_btnAll";
    this.btnActivePrjId = this.id + "_btnActivePrj";
    this.btnFinishedId = this.id + "_btnFinished";
    this.btnVisitedId = this.id + "_btnVisited";
    this.btnRunningId = this.id + "_btnRunning";
    this.btnQueuedId = this.id + "_btnQueued";
    this.btnErrorId = this.id + "_btnError";

    this.projectFilterButton = Ext.create("Ext.button.Button", {
        id: this.btnActivePrjId,
        iconCls: 'icon-project-all',
        tooltip: 'Toggle jobs from all projects or active project',
        enableToggle: true,
        pressed: false,
        listeners: {
            toggle: function () {
                //_this.selectProjectData();
                _this.render();
            }
        }
    });


    this.bar = new Ext.create('Ext.toolbar.Toolbar', {
        id: this.id + "jobsFilterBar",
        docked: 'top',
        height: 39,
        cls: 'bootstrap',
        items: [
            //this.projectFilterButton,
            {
                id: this.btnAllId,
                text: ' ',
                tooltip: 'Total jobs'
            },
            {
                id: this.btnFinishedId,
                text: ' ',
                tooltip: 'Finished jobs'
            },
            {
                id: this.btnVisitedId,
                text: ' ',
                tooltip: 'Visited jobs'
            },
            {
                id: this.btnRunningId,
                text: ' ',
                tooltip: 'Running jobs'
            },
            {
                id: this.btnQueuedId,
                text: ' ',
                tooltip: 'Queued jobs'
            },
            {
                id: this.btnErrorId,
                text: ' ',
                tooltip: 'Error jobs'
            }
        ]
    });

    Ext.getCmp(this.btnAllId).on('click', this.filter, this);
    Ext.getCmp(this.btnFinishedId).on('click', this.filter, this);
    Ext.getCmp(this.btnVisitedId).on('click', this.filter, this);
    Ext.getCmp(this.btnRunningId).on('click', this.filter, this);
    Ext.getCmp(this.btnQueuedId).on('click', this.filter, this);
    Ext.getCmp(this.btnErrorId).on('click', this.filter, this);

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


}
;

JobListWidget.prototype.show = function () {
    this.pagedListViewWidget.show();
};
JobListWidget.prototype.hide = function () {
    this.pagedListViewWidget.hide();
};
JobListWidget.prototype.toggle = function () {
    this.pagedListViewWidget.toggle();
};


//override
JobListWidget.prototype.draw = function () {
    this.render();
//
};

JobListWidget.prototype.clean = function () {
    clearInterval(this.interval);
    if (this.bar.isDescendantOf(Ext.getCmp(this.pagedListViewWidget.panelId)) == true) {
        Ext.getCmp(this.pagedListViewWidget.panelId).removeDocked(this.bar, false);
    }
    this.pagedListViewWidget.clean();
};

JobListWidget.prototype.setAccountData = function (data) {
    this.accountData = data;
    var jobs = [];
    var job;
    for (var i = 0; i < this.accountData.projects.length; i++) {
        for (var j = 0; j < this.accountData.projects[i].jobs.length; j++) {
            job = this.accountData.projects[i].jobs[j];
            if (typeof this.tools[job.toolName] !== 'undefined') {
                job.date = Utils.parseDate(job.date);
                jobs.push(job);
            }

        }
    }
    this.data = jobs;
    this.render();
};


JobListWidget.prototype.render = function () {
    this.pagedListViewWidget.draw(this.getData());
    if (this.bar.isDescendantOf(Ext.getCmp(this.pagedListViewWidget.panelId)) == false) {
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
    if (jobcount.error == 0) {
        Ext.getCmp(this.btnErrorId).hide();
    } else {
        Ext.getCmp(this.btnErrorId).show();
    }
    Ext.getCmp(this.btnAllId).setText(jobcount.all);
    Ext.getCmp(this.btnFinishedId).setText('<span style="color:' + this.FINISHED_COLOR + '" class="glyphicon glyphicon-exclamation-sign"></span> ' + jobcount.finished);
    Ext.getCmp(this.btnVisitedId).setText('<span style="color:' + this.FINISHED_COLOR + '" class="glyphicon glyphicon-ok-circle"></span> ' + jobcount.visited);
    Ext.getCmp(this.btnRunningId).setText('<span style="color:' + this.RUNING_COLOR + '" class="glyphicon glyphicon-cog"></span> ' + jobcount.running);
    Ext.getCmp(this.btnQueuedId).setText('<span style="color:' + this.QUEUED_COLOR + '" class="glyphicon glyphicon-time"></span> ' + jobcount.queued);
    Ext.getCmp(this.btnErrorId).setText('<span style="color:' + this.ERROR_COLOR + '" class="glyphicon glyphicon-remove-circle"></span> ' + jobcount.error);
};


JobListWidget.prototype.getJobCounter = function () {
    var finished = 0;
    var visited = 0;
    var running = 0;
    var queued = 0;
    var error = 0;

    var data = this.getData();

    for (var i = 0; i < data.length; i++) {
        var job = data[i];
        if (job.visites > 0) {
            if (job.status.indexOf('error') != -1) {
                error++;
            } else {
                visited++;
            }
        } else {
            if (job.visites == 0) {
                if (job.status.indexOf('error') != -1) {
                    error++;
                } else {
                    finished++;
                }
            }
            if (job.visites == -1) {
                running++;
            }
            if (job.visites == -2) {
                queued++;
            }
        }
    }
    return {all: data.length, visited: visited, finished: finished, running: running, queued: queued, error: error};
};

/**Filters**/
//var functionAssertion = function(item){return item.data.visites > 2;};

JobListWidget.prototype.filter = function (button) {
    switch (button.id) {
        case this.btnFinishedId:
            this.pagedListViewWidget.setFilter(function (item) {
                return item.data.visites == 0;
            });
            break;
        case this.btnVisitedId:
            this.pagedListViewWidget.setFilter(function (item) {
                return item.data.visites > 0 && item.data.status.indexOf('error') === -1;
            });
            break;
        case this.btnRunningId:
            this.pagedListViewWidget.setFilter(function (item) {
                return item.data.visites == -1;
            });
            break;
        case this.btnQueuedId:
            this.pagedListViewWidget.setFilter(function (item) {
                return item.data.visites == -2;
            });
            break;
        case this.btnErrorId:
            this.pagedListViewWidget.setFilter(function (item) {
                return item.data.status.indexOf('error') != -1;
            });
            break;
        default:
            this.pagedListViewWidget.setFilter(function (item) {
                return true;
            });
            break;
    }
    this.pagedListViewWidget.draw(this.getData());
};

JobListWidget.prototype.selectProjectData = function () {
    if (!this.projectFilterButton.pressed) {
        for (var i = 0; i < this.allData.length; i++) {
            if (this.allData[i].active) {
                this.data = this.allData[i].jobs;
                break;
            }
        }
    } else {
        var allJobs = new Array();
        for (var i = 0; i < this.allData.length; i++) {
            if (this.allData[i].jobs != null) {
                for (var j = 0; j < this.allData[i].jobs.length; j++) {

                    //TODO care with date order
                    allJobs.push(this.allData[i].jobs[j]);
                }
            }
        }
        this.data = allJobs;
    }
    if (this.data == null) {
        this.data = [];
    }
    this.pagedListViewWidget.draw(this.getData());
};

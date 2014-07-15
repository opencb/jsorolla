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

function JobListWidget(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    this.id = Utils.genId("JobListWidget");

    this.target;
    this.autoRender = true;

    this.RUNING_COLOR = '#298c63';
    this.QUEUED_COLOR = 'Darkorange';
    this.FINISHED_COLOR = '#0068cc';
    this.ERROR_COLOR = '#b30000';

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.buttonFilterFunction = null;
    this.textFilterFunction = function (item) {
        var str = Ext.getCmp(_this.id + "searchField").getValue().toLowerCase();
        if (item.data.name.toLowerCase().indexOf(str) < 0) {
            return false;
        }
        return true;
    };

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};


JobListWidget.prototype = {
    render: function () {
        var _this = this;
        this.div = $('<div></div>')[0];

        this.panel = this._createPanel();

    },
    draw: function () {
        this.targetDiv = (this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);

        this.panel.render(this.div);
    },
    show: function () {
        this.panel.show()
    },
    hide: function () {
        this.panel.hide();
    },
    toggle: function () {
        if (this.panel.isVisible()) {
            this.panel.hide();
        } else {
            this.panel.show();
        }
    },
    setAccountData: function (data) {
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
        this.store.loadData(jobs);
        this._updateButtons(jobs);
    },
    _createPanel: function () {
        var _this = this;
        var tpl = new Ext.XTemplate([
            '<tpl for=".">',
            '<div class="ocb-job-list-widget-item">',

            '<div style="color:#596F8F">{[ this.getNewIcon(values) ]} {name}</div>',
                '<div> ' +
                '<span class="{[ this.getClass(values) ]}">{toolName}{execution} </span> ' +
                '</div>',
                '<div>' +
                '<span style="color: {[ this.getStatusColor(values) ]};">{status}</span> ' +
                '<span style="color: dimgray;font-size:12px;"> &nbsp; &nbsp; {date} </span> ' +
                '</div>',
            '</div>',
            '</tpl>',
            {
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
                        html += '<i style="color:' + _this.FINISHED_COLOR + '" class="fa fa-exclamation-circle"></i> ';
                    }
                    switch (item.status) {
                        case 'running':
                            html += '<i style="color:' + _this.RUNING_COLOR + '" class="fa fa-cog"></i>';
                            break;
                        case 'queued':
                            html += '<i style="color:' + _this.QUEUED_COLOR + '" class="fa fa-clock-o"></i>';
                            break;
                        case 'finished':
                            html += '<i style="color:' + _this.FINISHED_COLOR + '" class="fa fa-check-circle"></i>';
                            break;
                        case 'execution_error':
                        case 'queue_error':
                            html += '<i style="color:' + _this.ERROR_COLOR + '" class="fa fa-times-circle"></i>';
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
        ]);

        this.store = Ext.create('Ext.data.Store', {
            fields: ['commandLine', 'date', 'description', 'diskUsage', 'status', 'finishTime', 'inputData', 'jobId', 'message', 'name', 'outputData', 'ownerId', 'percentage', 'projectId', 'toolName', 'visites'],
            sorters: [
                { property: 'date', direction: 'DESC'}
            ],
            autoLoad: false
        });

        var view = Ext.create('Ext.view.View', {
            padding: 15,
            store: this.store,
            tpl: tpl,
            trackOver: true,
            autoScroll: true,
            overItemCls: 'ocb-job-list-widget-item-hover',
            itemSelector: '.ocb-job-list-widget-item',
            listeners: {
                itemclick: function (este, record) {
                    console.log(record.data);
                    console.log(record.data.id);
                    _this.trigger('item:click', {sender: _this, item: record});
                },
                itemcontextmenu: function (este, record, item, index, e) {
                    e.stopEvent();
                    var event = {sender: _this, record: record, originalEvent: e};
                    _this._itemContextMenuHandler(event);
                    _this.trigger('item:contextmenu', event);
                    return false;
                }
            }
        });

        /**TEXT SEARCH FILTER**/
        this.searchField = Ext.create('Ext.form.field.Text', {
            id: this.id + "searchField",
            emptyText: 'enter search term',
            enableKeyEvents: true,
            flex: 1,
            listeners: {
                change: function () {
                    _this._setFilters();
                }
            }
        });


        //    this.projectFilterButton = Ext.create("Ext.button.Button", {
//        id: this.btnActivePrjId,
//        iconCls: 'icon-project-all',
//        tooltip: 'Toggle jobs from all projects or active project',
//        enableToggle: true,
//        pressed: false,
//        listeners: {
//            toggle: function () {
//                //_this.selectProjectData();
//                _this.render();
//            }
//        }
//    });


        this.btnAllId = this.id + "_btnAll";
//        this.btnActivePrjId = this.id + "_btnActivePrj";
        this.btnFinishedId = this.id + "_btnFinished";
        this.btnVisitedId = this.id + "_btnVisited";
        this.btnRunningId = this.id + "_btnRunning";
        this.btnQueuedId = this.id + "_btnQueued";
        this.btnErrorId = this.id + "_btnError";

        var panel = Ext.create('Ext.panel.Panel', {
            height: this.height,
            width: this.width,
            layout: 'fit',
            items: [
                view
            ],
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    height: 39,
                    items: [
                        {
                            xtype: 'button',
                            id: this.id + 'btnSort',
                            tooltip: 'Change order',
                            margin: '0 15 0 0',
                            text: '<i class="fa fa-sort"></i>',
                            handler: function () {
                                if (_this.sort == "DESC") {
                                    _this.sort = "ASC";
                                    _this.store.sort('date', 'ASC');
                                }
                                else {
                                    _this.sort = "DESC";
                                    _this.store.sort('date', 'DESC');
                                }
                            }
                        },
                        this.searchField,
                        {
                            xtype: 'button',
                            id: this.id + 'btnClear',
//							    iconCls: 'icon-delete',
                            text: 'Clear',
                            tooltip: 'Clear search box',
                            handler: function () {
                                _this.searchField.reset();
                            }
                        }

                    ]
                },
                {
                    xtype: 'toolbar',
                    docked: 'top',
                    height: 39,
                    items: [
                        //this.projectFilterButton,
                        {
                            id: this.btnAllId,
                            text: ' ',
                            tooltip: 'Total jobs',
                            handler: function () {
                                _this._setButtonFilterFunction(this);
                            }
                        },
                        {
                            id: this.btnFinishedId,
                            text: ' ',
                            tooltip: 'Finished jobs',
                            handler: function () {
                                _this._setButtonFilterFunction(this);
                            }
                        },
                        {
                            id: this.btnVisitedId,
                            text: ' ',
                            tooltip: 'Visited jobs',
                            handler: function () {
                                _this._setButtonFilterFunction(this);
                            }
                        },
                        {
                            id: this.btnRunningId,
                            text: ' ',
                            tooltip: 'Running jobs',
                            handler: function () {
                                _this._setButtonFilterFunction(this);
                            }
                        },
                        {
                            id: this.btnQueuedId,
                            text: ' ',
                            tooltip: 'Queued jobs',
                            handler: function () {
                                _this._setButtonFilterFunction(this);
                            }
                        },
                        {
                            id: this.btnErrorId,
                            text: ' ',
                            tooltip: 'Error jobs',
                            handler: function () {
                                _this._setButtonFilterFunction(this);
                            }
                        }
                    ]
                }
            ]
        });

        return panel;
    },
    _setButtonFilterFunction: function (button) {
        switch (button.id) {
            case this.btnFinishedId:
                this.buttonFilterFunction = function (item) {
                    return item.data.visites == 0;
                };
                break;
            case this.btnVisitedId:
                this.buttonFilterFunction = function (item) {
                    return item.data.visites > 0 && item.data.status.indexOf('error') === -1;
                };
                break;
            case this.btnRunningId:
                this.buttonFilterFunction = function (item) {
                    return item.data.visites == -1;
                };
                break;
            case this.btnQueuedId:
                this.buttonFilterFunction = function (item) {
                    return item.data.visites == -2;
                };
                break;
            case this.btnErrorId:
                this.buttonFilterFunction = function (item) {
                    return item.data.status.indexOf('error') != -1;
                };
                break;
            default:
                this.buttonFilterFunction = null;
                break;
        }
        this._setFilters();
    },
    _setFilters: function () {
        this.store.clearFilter();
        if (typeof this.buttonFilterFunction === 'function') {
            this.store.addFilter([this.buttonFilterFunction, this.textFilterFunction]);
        } else {
            this.store.addFilter(this.textFilterFunction);
        }
    },
    _updateButtons: function (jobs) {
        var jobcount = this._getJobCounter(jobs);

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
        Ext.getCmp(this.btnFinishedId).setText('<i style="color:' + this.FINISHED_COLOR + '" class="fa fa-exclamation-circle"></i> ' + jobcount.finished);
        Ext.getCmp(this.btnVisitedId).setText('<i style="color:' + this.FINISHED_COLOR + '" class="fa fa-check-circle"></i> ' + jobcount.visited);
        Ext.getCmp(this.btnRunningId).setText('<i style="color:' + this.RUNING_COLOR + '" class="fa fa-cog"></i> ' + jobcount.running);
        Ext.getCmp(this.btnQueuedId).setText('<i style="color:' + this.QUEUED_COLOR + '" class="fa fa-clock-o"></i> ' + jobcount.queued);
        Ext.getCmp(this.btnErrorId).setText('<i style="color:' + this.ERROR_COLOR + '" class="fa fa-times-circle"></i> ' + jobcount.error);
    },
    _getJobCounter: function (jobs) {
        var finished = 0;
        var visited = 0;
        var running = 0;
        var queued = 0;
        var error = 0;

        for (var i = 0; i < jobs.length; i++) {
            var job = jobs[i];
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
        return {all: jobs.length, visited: visited, finished: finished, running: running, queued: queued, error: error};
    },
    _itemContextMenuHandler: function (e) {
        var record = e.record;
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
        contextMenu.showAt(e.originalEvent.getXY());
    }
};

/////*HARDCODED check job status*/
////	var checkJobsStatus = function(){
////		if(_this.accountData != null){
////			var opencgaManager = new OpencgaManager();
////			for ( var i = 0; i < _this.accountData.jobs.length; i++) {
////				if(_this.tools.indexOf(_this.accountData.jobs[i].toolName) != -1){
////					if(_this.accountData.jobs[i].visites<0){
////						opencgaManager.jobStatus($.cookie("bioinfo_account"), $.cookie("bioinfo_sid"), _this.accountData.jobs[i].id);
////					}
////				}
////			}
////		}
////	}
////
////	this.accountInfoInterval = setInterval(function(){checkJobsStatus();}, 4000);
////
/////*HARDCODED check job status*/


/**Filters**/
//var functionAssertion = function(item){return item.data.visites > 2;};

//JobListWidget.prototype.selectProjectData = function () {
//    if (!this.projectFilterButton.pressed) {
//        for (var i = 0; i < this.allData.length; i++) {
//            if (this.allData[i].active) {
//                this.data = this.allData[i].jobs;
//                break;
//            }
//        }
//    } else {
//        var allJobs = new Array();
//        for (var i = 0; i < this.allData.length; i++) {
//            if (this.allData[i].jobs != null) {
//                for (var j = 0; j < this.allData[i].jobs.length; j++) {
//
//                    //TODO care with date order
//                    allJobs.push(this.allData[i].jobs[j]);
//                }
//            }
//        }
//        this.data = allJobs;
//    }
//    if (this.data == null) {
//        this.data = [];
//    }
//    this.pagedListViewWidget.draw(this.getData());
//};

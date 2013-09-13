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

function ResultWidget(args) {
    var _this = this;

    if (typeof args != 'undefined') {
        this.targetId = args.targetId || this.targetId;
        this.application = args.application || this.application;
        this.app = args.app || this.app;
    }

    this.adapter = new OpencgaManager();

    this.panelId = null;
    this.networkViewerId = null;
    this.genomeMapsId = null;
}

ResultWidget.prototype = {
    id: "ResultWidget" + Math.round(Math.random() * 10000),
    draw: function (sid, record) {
        var _this = this;
        this.job = record.raw;
        this.jobId = this.job.id;
        this.id = this.jobId + this.id;
        this.panelId = "ResultWidget_" + this.jobId;

        this.panel = Ext.getCmp(this.panelId);
        if (this.panel == null) {
            this.panel = Ext.create('Ext.panel.Panel', {
                id: this.panelId,
                border: 0,
                title: this.job.name,
                closable: true,
                autoScroll: true
            });

            Ext.getCmp(this.targetId).add(this.panel);
            Ext.getCmp(this.targetId).setActiveTab(this.panel);
            this.panel.setLoading("Loading job info...");


            var url = this.adapter.jobResultUrl($.cookie("bioinfo_account"), sid, this.jobId, "json");
            console.log(url);
            $.getScript(url, function () {
                _this.panel.setLoading(false);
                var layout = RESULT[_this.job.toolName].layout;
                layout.outputItems = _this.job.outputData.sort(layout.sortOutputItems);
                _this.render(RESULT);
            });
        } else {
            Ext.getCmp(this.targetId).setActiveTab(this.panel);
        }
    },
    render: function (resultData) {
        var _this = this;
        console.log(this.application);

//        Ext.create('Ext.button.Button', {
//            text: 'Delete',
//            margin: "0 0 25 30",
//        });

        var getJobInfo = function () {
            var itemTpl = new Ext.XTemplate(
                '<p><span class="ssel border-bot s120">Information </span><span style="color:steelblue"> &nbsp; &nbsp; Job Id: <span><span style="color:slategrey">{id}</span></p><br>',
                '<p><span class="emph">{name}</span> - <span class="info"> {toolName} </span> - <span style="color:orangered"> {date}</span></p>',
                '<p class="tip emph">{description}</p>',
                '<p class="">{[ this.getInfo(values) ]}</p>', {
                    getInfo: function (item) {
                        switch (item.toolName) {
                            case 'pathiways':
                                var arr = item.commandLine.split(/ --/g);
                                console.log(arr)
                                var str = arr[1].replace(/ /g, ': ') + '<br>';
                                str += arr[2].replace(/ /g, ': ') + '<br>';
                                str += arr[3].replace(/ /g, ': ').replace('/httpd/bioinfo/opencga/analysis/pathiways/examples/', '').replace('/httpd/bioinfo/opencga/accounts/', '') + '<br>';
                                str += arr[4].replace(/ /g, ': ') + '<br>';
                                str += arr[5].replace(/ /g, ': ') + '<br>';
                                str += arr[6].replace(/ /g, ': ').replace('/httpd/bioinfo/opencga/analysis/pathiways/examples/', '').replace('/httpd/bioinfo/opencga/accounts/', '') + '<br>';
                                str += arr[7].replace(/ /g, ': ') + '<br>';
//                                str +=  arr[8].replace(/ /g,': ')+'<br>';
//                                str +=  arr[9].replace(/ /g,': ')+'<br>';
                                str += arr[10].replace(/ /g, ': ') + '<br>';
                                str += arr[12].replace(/ /g, ': ');
                                str += '<div style="width:400px">' + arr[11].replace(/ /g, ': ').replace(/,/g, ', ') + '</div>';
                                return str;
                            default :
                                return '';
                        }
                    }
                }
            );
            return Ext.create('Ext.container.Container', {
                margin: '15 0 15 15',
                items: [
                    {
                        xtype: 'box',
                        data: _this.job,
                        tpl: itemTpl
                    },
                    {
                        xtype: 'container', layout: 'hbox', margin: '10 0 0 0', defaults: {margin: '0 5 0 5'},
                        items: [
                            {
                                xtype: 'button',
                                text: 'download',
                                handler: function () {
                                    _this.adapter.downloadJob($.cookie('bioinfo_account'), $.cookie('bioinfo_sid'), _this.jobId);
                                }
                            },
                            {
                                xtype: 'button',
                                text: 'delete',
                                handler: function () {
                                    Ext.Msg.confirm("Delete job", "Are you sure you want to delete this job?", function (btnClicked) {
                                        if (btnClicked == "yes") {
                                            _this.adapter.onDeleteJob.addEventListener(function (sender, data) {
                                                var msg = "";
                                                if (data.indexOf("OK") != -1) {
                                                    Ext.getCmp(_this.targetId).getActiveTab().close();
                                                    msg = "The job has been succesfully deleted.";
                                                } else {
                                                    msg = "ERROR: could not delete job.";
                                                }
                                                Ext.Msg.alert("Delete job", msg);
                                            });
                                            _this.adapter.deleteJob($.cookie('bioinfo_account'), $.cookie('bioinfo_sid'), _this.jobId);
                                        }
                                    });
                                }
                            }
                        ]
                    }
                ]
            });
        };

        var getResultIndex = function (children) {
            var boxes = [
                {xtype: 'box', cls: 'inlineblock ssel border-bot s120', html: 'Index', margin: 15}
            ];
            for (var i = 0; i < children.length; i++) {
                boxes.push(Ext.create('Ext.Component', {
                    margin: "0 15 0 15",
                    cls: 'dedo emph',
                    overCls: 'err',
                    resultId: _this.jobId + children[i].title.replace(/ /g, ''),
                    html: children[i].title,
                    listeners: {
                        afterrender: function (este) {
                            this.getEl().on("click", function () {
                                var pos = $('#' + este.resultId).position();
                                if (typeof pos != 'undefined') {
                                    var top = pos.top;
                                    $(_this.panel.getEl().dom).children().scrollTop(top - 10);
                                }

                                var tab = Ext.getCmp(este.resultId);//for tab mode
                                var parent = tab.up();
                                if (parent.isXType('tabpanel')) {
                                    parent.setActiveTab(tab);
                                }
                            });
                        }
                    }
                }));
            }
            return Ext.create('Ext.container.Container', {
                margin: '0 0 20 0',
                items: boxes
            });
        };

        var itemTpl = new Ext.XTemplate(
            '<span class="s140 emph">{title}</span>',
            '<span class="ok"> {pathi} </span>',
            '<span class="info"> {date}</span><br>'
        );

        var processLeafItem = function (item) {
            var boxes = [];
            var itemBox;
            for (var j = 0; j < item.renderers.length; j++) {
                var renderer = item.renderers[j];
                switch (renderer.type) {
                    case 'file':
                        itemBox = Ext.create('Ext.Component', {
                            html: '<span class="key">' + item.title + '</span><span class="file">' + item.file + '</span>',
                            item: item,
                            padding: 3,
                            overCls: 'encima',
                            cls: 'inlineblock whiteborder',
                            listeners: {
                                afterrender: function () {
                                    var item = this.item;
                                    this.getEl().on("click", function () {
                                        console.log(item);
                                        _this.adapter.poll($.cookie('bioinfo_account'), $.cookie('bioinfo_sid'), _this.jobId, item.file, true);
                                    });
                                }
                            }
                        });
                        break;
                    case 'image':
                        itemBox = Ext.create('Ext.Component', {
                            html: '<div><img src="' + _this.adapter.pollurl($.cookie('bioinfo_account'), $.cookie('bioinfo_sid'), _this.jobId, item.file) + '"></div>'
                        });
                        break;
                    case 'grid':
                        var id = 'resultTable_' + _this.jobId + item.file;
                        var resultTable = new ResultTable(_this.jobId, item.file, item.tags, {targetId: id, tableLayout: renderer.tableLayout});
                        itemBox = Ext.create('Ext.Component', {
                            flex: 1,
                            resultTable: resultTable,
                            html: '<div id="' + id + '" style="padding:5px;"> </div>',
                            listeners: {
                                afterrender: function (este) {
                                    este.resultTable.draw();
                                }
                            }
                        });
                        break;
                    case 'table':
                        var url = _this.adapter.pollurl($.cookie('bioinfo_account'), $.cookie('bioinfo_sid'), _this.jobId, item.file);
                        $.ajax({
                            type: "GET",
                            async: false,
                            url: url,
                            success: function (data) {
                                var tableHtml = '<table cellspacing="0" style="border-collapse: collapse;border:1px solid #ccc;"><tbody>';
                                var lines = data.split('\n');
                                var numLines = 0;
                                for (var i = 0; i < lines.length; i++) {
                                    var line = lines[i];
                                    if (line.charAt(0) != '#' && line.trim() != '') {
                                        numLines++;
                                        if(renderer.header && numLines == 1){
                                            tableHtml += '<tr style="border-collapse: collapse;border:1px solid #ccc;font-weight:bold;">';
                                        }else{
                                            tableHtml += '<tr style="border-collapse: collapse;border:1px solid #ccc;">';
                                        }
                                        var fields = line.split('\t');
                                        for (var j = 0; j < fields.length; j++) {
                                            var field = fields[j];
                                            tableHtml += '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;">' + field + '</td>';
                                        }
                                        tableHtml += '</tr>';
                                    }
                                }
                                tableHtml += '</tbody></table>';

                                itemBox = Ext.create('Ext.Component', {
                                    flex: 1,
                                    html: tableHtml
                                });

                            }
                        });
                        break;

                }
                boxes.push(itemBox);
            }
            return Ext.create('Ext.container.Container', {
                title: item.title,
                margin: '0 0 15 0',
                items: boxes
            });
        };

        var getDetailsAsDocument = function (item, isRoot) {
            var boxes;
            if (typeof item.children != 'undefined') {
                if (typeof item.children == 'function') {
                    item.children = item.children();
                }
                boxes = [];
                for (var i = 0; i < item.children.length; i++) {
                    boxes.push(getDetailsAsDocument(item.children[i]));
                }
                if (isRoot == true) {
                    var detailsItemsContainer = {
                        xtype: 'container',
                        items: boxes
                    };
                    if (item.presentation == 'tabs') {
                        detailsItemsContainer = {
                            xtype: 'tabpanel',
                            padding: '0 30 15 15',
                            plain: true,
                            border: 0,
                            defaults: {
                                overflowX: 'scroll',
                                height: 2000,
                                padding: 10
                            },
                            items: boxes
                        };
                    }
                    return Ext.create('Ext.container.Container', {
                        title: item.title,
                        items: [
                            {
                                xtype: 'box',
                                cls: 'inlineblock ssel border-bot s120', margin: '15',
                                html: 'Details'
                            },
                            detailsItemsContainer
                        ]
                    });
                } else {
                    return Ext.create('Ext.container.Container', {
                        id: _this.jobId + item.title.replace(/ /g, ''),
                        title: item.title,
                        margin: '0 0 0 10',
                        items: [
                            {
                                xtype: 'box',
                                overCls: 'dedo',
                                cls: 'panel-border-bottom', margin: '0 0 10 0',
                                data: item, tpl: itemTpl,
                                listeners: {
                                    afterrender: function () {
                                        this.getEl().on("click", function () {
                                            $(_this.panel.getEl().dom).children().scrollTop(0);
                                        });
                                    }
                                }
                            },
                            {
                                xtype: 'container',
                                items: boxes
                            }
                        ]
                    });
                }
            } else {
                return processLeafItem(item);
            }
        };

        var detailedResutls = getDetailsAsDocument(resultData[this.job.toolName].layout, true);
        var indexResutl = getResultIndex(resultData[this.job.toolName].layout.children);
        this.panel.add(getJobInfo());
        this.panel.insert(indexResutl);
        this.panel.add(detailedResutls);

    }//end render
};
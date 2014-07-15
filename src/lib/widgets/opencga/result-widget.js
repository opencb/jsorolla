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

    //set default args
    this.extItems = [];

    this.collapseInformation = false;
    this.drawIndex = true;
    this.title = '';

    //set instantiation args, must be last
    _.extend(this, args);

    this.panelId = null;
    this.type;
    this.networkViewerId = null;
    this.genomeMapsId = null;
}

ResultWidget.prototype = {
    id: "ResultWidget" + Math.round(Math.random() * 10000),
    draw: function (sid, record) {
        var _this = this;
        this.job = record.data;

        this.job['command'] = Utils.parseJobCommand(this.job);

        this.jobId = this.job.id;
        this.id = this.jobId + this.id;
        this.panelId = "ResultWidget_" + this.jobId;

        this.panel = Ext.getCmp(this.panelId);

        var title = this.title;
        if (this.title === '') {
            title = this.job.name;
        } else {
            title = this.title + ' - ' + this.job.name
        }


        if (this.panel == null) {
            if (this.type == "window") {
                this.panel = Ext.create('Ext.window.Window', {
                    id: this.panelId,
                    bodyStyle: 'background:white;',
                    title: title,
                    closable: true,
                    autoScroll: true,
                    overflowY: 'auto',
                    maximizable: true,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    }
                });
            } else {
                this.panel = Ext.create('Ext.panel.Panel', {
                    id: this.panelId,
                    border: 0,
                    title: title,
                    closable: true,
                    autoScroll: true,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    }
                });
                Ext.getCmp(this.targetId).add(this.panel);
            }
            this.panel.setLoading("Loading job info...");


            /* Check job status before get result.js */
            if (this.job.status.indexOf('error') !== -1) {
                this.panel.add(this._getJobInfo());
                this.panel.add(this._getErrorInfo());

                OpencgaManager.jobInfo({
                    accountId: $.cookie("bioinfo_account"),
                    sessionId: sid,
                    jobId: this.jobId,
                    success: function (job) {

                    }
                });

                this.panel.setLoading(false);
            } else {
                /* Get result.js */
                var url = OpencgaManager.jobResultUrl({
                    accountId: $.cookie("bioinfo_account"),
                    sessionId: sid,
                    jobId: this.jobId,
                    format: "json"
                });
                console.log(url);
                $.getScript(url, function () {
                    _this.panel.setLoading(false);
                    _this.result = RESULT;
                    var layout = _this.result[_this.layoutName].layout;
                    layout.outputItems = _this.job.outputData.sort(layout.sortOutputItems);
                    layout.job = _this.job;

                    /**/
                    if (typeof layout.oldXML !== 'undefined') {
                        _this._parseOldXML(layout);
                    }
                    /**/

                    _this.render(_this.result);


                    if (_this.type == "window") {
                        _this.panel.show();
                    } else {
                        Ext.getCmp(_this.targetId).setActiveTab(_this.panel);
                    }
                });
            }

        } else {
            if (this.type == "window") {
                this.panel.show();
            } else {
                Ext.getCmp(this.targetId).setActiveTab(this.panel);
            }

        }
    },
    render: function (resultData) {
        var _this = this;
        console.log(this.application);

        var getResultIndex = function (children) {
            var boxes = [];
            for (var i = 0; i < children.length; i++) {
                boxes.push(Ext.create('Ext.Component', {
                    cls: 'ocb-pointer',
                    overCls: 'u err',
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
            return Ext.create('Ext.panel.Panel', {
                title: 'Result index',
                header: {
                    baseCls: 'ocb-panel-title'
                },
                border: false,
                collapsible: true,
                titleCollapse: true,
                margin: 10,
                bodyPadding: 10,
                items: boxes
            });
        };

        var itemTpl = new Ext.XTemplate(
            '<span class="s120">{title}</span>',
            '<span class="ok"> {pathi} </span>',
            '<span class="info"> {date}</span><br>'
        );

        var processLeafItem = function (item) {
            var boxes = [];
            var itemBox;
            for (var j = 0; j < item.renderers.length; j++) {
                var renderer = item.renderers[j];
                switch (renderer.type) {
                    case 'note':
                        itemBox = Ext.create('Ext.Component', {
                            html: renderer.html,
                            item: item,
//                            overCls: 'encima',
                            cls: 'inlineblock whiteborder'
                        });
                        break;
                    case 'message':
                        itemBox = Ext.create('Ext.Component', {
                            html: '<div class="alert alert-' + item.type + '" style="text-align: center;font-size: 20px">' + item.title + '</div>',
                            item: item,
                            padding: 3
                        });
                        break;
                    case 'text':
                        itemBox = Ext.create('Ext.Component', {
                            html: '<span class="key">' + item.title + ': </span> <span class="emph">' + item.file + '</span>',
                            item: item,
//                            overCls: 'encima',
                            cls: 'inlineblock whiteborder'
                        });
                        break;
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
                                        OpencgaManager.poll({
                                            accountId: $.cookie('bioinfo_account'),
                                            sessionId: $.cookie('bioinfo_sid'),
                                            jobId: _this.jobId,
                                            filename: item.file,
                                            zip: true
                                        });
                                    });
                                }
                            }
                        });
                        break;
                    case 'image':
                        var url = OpencgaManager.pollurl({
                            accountId: $.cookie('bioinfo_account'),
                            sessionId: $.cookie('bioinfo_sid'),
                            jobId: _this.jobId,
                            filename: item.file
                        });
                        itemBox = Ext.create('Ext.Img', {
                            src: url,
                            listeners: {
                                render: function (imgCmp) {
                                    this.mon(this.getEl(), 'load', function (e) {
                                        imgCmp.setWidth(this.getWidth());
                                        imgCmp.setHeight(this.getHeight());
                                    });
                                }
                            }
                        });
                        break;
                    case 'piechart':

                        var url = OpencgaManager.pollurl({
                            accountId: $.cookie('bioinfo_account'),
                            sessionId: $.cookie('bioinfo_sid'),
                            jobId: _this.jobId,
                            filename: item.file
                        });

                        var imgURL;
                        $.ajax({
                            type: "GET",
                            async: false,
                            url: url,
                            success: function (data) {
                                if (data != "") {
                                    var lines = data.split("\n");
                                    var fields = [];
                                    var names = [];
                                    var values = [];
                                    var normValues = [];
                                    var total = 0;
                                    for (var i = 0; i < lines.length; i++) {
                                        fields.push(lines[i].split("\t"));
                                        if (fields[i][0] != "") {
                                            names.push(fields[i][0]);
                                        }
                                        if (fields[i][1] != null) {
                                            total = total + parseFloat(fields[i][1]);
                                            values.push(fields[i][1]);
                                        }
                                    }
                                    for (var i = 0; i < values.length; i++) {
                                        normValues.push(Math.round(parseFloat(values[i]) / total * 100));
                                    }
                                    names = names.toString().replace(/,/gi, "|");
                                    imgURL = 'https://chart.googleapis.com/chart?cht=p&chs=600x300&chd=t:' + normValues + '&chl=' + names + '&chtt=Consequence+types&chts=000000,14.5';
                                }
                            }
                        });

//                        itemBox = Ext.create('Ext.Component', {
//                            html: '<div>' + img + '</div>',
//                        });

                        itemBox = Ext.create('Ext.Img', {
                            src: imgURL,
                            listeners: {
                                render: function (imgCmp) {
                                    this.mon(this.getEl(), 'load', function (e) {
                                        imgCmp.setWidth(this.getWidth());
                                        imgCmp.setHeight(this.getHeight());
                                    });
                                }
                            }
                        });
                        break;
                    case 'scatter':
                        var url = OpencgaManager.pollurl({
                            accountId: $.cookie('bioinfo_account'),
                            sessionId: $.cookie('bioinfo_sid'),
                            jobId: _this.jobId,
                            filename: item.file
                        });
                        var data = [];
                        $.ajax({
                            type: "GET",
                            async: false,
                            url: url,
                            success: function (d) {
                                var d = JSON.parse(d);
                                if (typeof renderer.processData === 'function') {
                                    data = renderer.processData(d);
                                } else {
                                    data = d;
                                }
                            }
                        });
                        var store = Ext.create('Ext.data.JsonStore', {
                            fields: renderer.fields,
                            data: data
                        });


                        var chart = Ext.create('Ext.chart.Chart', {
                            renderTo: Ext.getBody(),
                            width: 500,
                            height: 200,
                            animate: false,
//                            theme: 'Category1',
                            store: store,
                            axes: [
                                {
                                    type: 'Numeric',
                                    position: 'left',
                                    fields: renderer.y.fields,
                                    title: renderer.y.title,
                                    grid: true,
                                    maximum: renderer.y.max
                                },
                                {
                                    type: 'Numeric',
                                    position: 'bottom',
                                    fields: renderer.x.fields,
                                    title: renderer.x.title,
                                    grid: true
                                }
                            ],
                            series: [
                                {
                                    tips: {
                                        trackMouse: true,
                                        style: {
                                            backgroundColor: 'white'
                                        },
                                        renderer: function (este, item) {
                                            var xValue = item.storeItem.get(renderer.x.field);
                                            var yValue = item.storeItem.get(renderer.y.field);
                                            var html = '<div>' + renderer.x.field + ': <span style="font-weight: bold">' + xValue + '</span></div>' +
                                                '<div>' + renderer.y.field + ': <span style="font-weight: bold">' + yValue + '</span></div>';
                                            this.update(html);
                                        }
                                    },
                                    type: 'scatter',
                                    renderer: function (sprite, record, attributes, index, store) {
                                        if (typeof renderer.config !== 'undefined') {
                                            return Ext.apply(attributes, renderer.config(record.data));
                                        }
                                    },
                                    markerConfig: {
                                        type: 'circle',
                                        radius: 2,
                                        size: 5
                                    },
                                    axis: 'left',
                                    xField: renderer.x.field,
                                    yField: renderer.y.field
                                }
                            ]
                        });

                        itemBox = Ext.create('Ext.container.Container', {
                            margin: '10 0 0 0',
                            items: [
                                {
                                    xtype: 'box',
                                    html: '<span class="key s120">' + item.title + '</span>'
                                },
                                chart
                            ]
                        });
                        break;
                    case 'memory-grid':
                        //Renderer must provide a data function and a field function
                        var url = OpencgaManager.pollurl({
                            accountId: $.cookie('bioinfo_account'),
                            sessionId: $.cookie('bioinfo_sid'),
                            jobId: _this.jobId,
                            filename: item.file
                        });
                        var data = [];
                        var fields = [];
                        $.ajax({
                            type: "GET",
                            async: false,
                            url: url,
                            success: function (d) {
                                var d = JSON.parse(d);
                                data = renderer.data(d);
                                fields = renderer.fields(d);
                            }
                        });
                        var store = Ext.create('Ext.data.Store', {
                            pageSize: 50,
                            proxy: {
                                type: 'memory'
                            },
                            fields: ['0', '1', '2', "3"],
                            data: data
                        });
                        var columns = [];
                        for (var i = 0; i < fields.length; i++) {
                            columns.push({
                                "header": fields[i], "dataIndex": i, flex: 1
                            });
                        }
                        itemBox = Ext.create('Ext.grid.Panel', {
                            title: item.title,
                            flex: 1,
                            store: store,
                            height: 200,
                            width: 400,
                            loadMask: true,
                            plugins: ['bufferedrenderer'],
                            columns: columns
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
                    case 'vcf-grid':
                        var id = 'resultTable_' + _this.jobId + item.file;

                        var table = {
                            name: "Stats Samples Table",
                            colNames: ["CHROM", "POS", "ID", "REF", "ALT", "QUAL", "FILTER", "INFO", "FORMAT"],
                            colTypes: ["string", "int", "string", "string", "string", "string", "string", "string", "string"],
                            colVisibility: [1, 1, 1, 1, 1, 1, 1, 1, 1],
                            colOrder: [0, 1, 2, 3, , 4, 5, 6, 7, 8, 9]
                        };


                        var session_id = $.cookie('bioinfo_sid');
                        var accountId = $.cookie('bioinfo_account');

                        OpencgaManager.jobFileGrep({
                            pattern: "^#CHR.*",
                            ignoreCase: "true",
                            multi: false,
                            filename: item.file,
                            sessionId: session_id,
                            accountId: accountId,
                            jobId: _this.jobId,
                            async: false,
                            success: function (data, textStatus, jqXHR) {
                                var fields = data.trim().split("\t");

                                for (var i = 9; i < fields.length; i++) {
                                    table.colNames.push(fields[i]);
                                    table.colTypes.push("string");
                                    table.colVisibility.push(1);
                                    table.colOrder.push((fields[i - 1] + 1));
                                }

                                var resultTable = new ResultTable(_this.jobId, item.file, item.tags, {targetId: id, tableLayout: table});
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
                            }
                        });


                        break;
                    case 'table':
                        var url = OpencgaManager.pollurl({
                            accountId: $.cookie('bioinfo_account'),
                            sessionId: $.cookie('bioinfo_sid'),
                            jobId: _this.jobId,
                            filename: item.file
                        });
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
                                        if (renderer.header && numLines == 1) {
                                            tableHtml += '<tr style="border-collapse: collapse;border:1px solid #ccc;font-weight:bold;">';
                                        } else {
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
                    case 'genome-viewer':
                        var div = document.createElement('div');
                        $(div).css({
                            height: '1200px'
                        });
                        var gmDiv = document.createElement('div');
                        $(gmDiv).css({
                            width: '1500px',
                            marginTop:'10px',
                            border:'1px solid lightgray'
                        });
                        var vfwDiv = document.createElement('div');
                        $(vfwDiv).css({
                            width: '1500px',
                            height: '300px'
                        });
                        div.appendChild(vfwDiv);
                        div.appendChild(gmDiv);
//                        var gm_id = Utils.genId('gm');
//                        var vfw_id = Utils.genId('vfw');
//                        var html =
//                            '<div style="width:1500px;height:1200px;">' +
//                            '<div id="' + vfw_id + '" style="width:1500px;">' +
//                            '</div>' +
//                            '<div id="' + gm_id + '" style="width:1500px;height:800px;">' +
//                            '</div>' +
//                            '</div>';
                        itemBox = Ext.create('Ext.Component', {
                            flex: 1,
                            contentEl: div,
                            listeners: {
                                afterrender: function () {
                                    var gv = _this._createGenomeViewer(gmDiv);
                                    _this._createVariantFilterWidget(vfwDiv, gv, _this.result[_this.layoutName].layout.variantFilterFiles, renderer.tableLayout);
                                }
                            }
                        });
                        break;
                    case 'variant-stats-widget':
                        var height = 800;
                        itemBox = Ext.create('Ext.container.Container', {
                            height: height,
                            width: '95%',
                            style: {
                                position: 'relative'
                            },
                            listeners: {
                                afterrender: function () {
                                    var variantStatsWidget = new VariantStatsWidget({
                                        targetId: itemBox,
                                        height: height,
                                        closable: false,
                                        border: true,
//                                        title:  _this.job.name,
                                        job: _this.job,
                                        autoRender: true
                                    });
                                    variantStatsWidget.draw();
                                }
                            }
                        });

                        break;

                    case 'variant-widget':
                        var height = 800;
                        itemBox = Ext.create('Ext.container.Container', {
                            height: height,
                            width: '95%',
                            style: {
                                position: 'relative'
                            },
                            listeners: {
                                afterrender: function () {

                                    var url = OpencgaManager.getJobAnalysisUrl($.cookie("bioinfo_account"), _this.job.id) + '/variantsMongo';
                                    console.log("URL: " + url);

                                    var variantWidget = new VariantWidget({
                                        targetId: itemBox,
                                        height: height,
                                        closable: false,
                                        border: true,
                                        url: url,
//                                        title:  _this.job.name,
                                        job: _this.job,
                                        autoRender: true
                                    });
                                    variantWidget.draw();
                                }
                            }
                        });

                        break;
                }
                boxes.push(itemBox);
            }
            return Ext.create('Ext.container.Container', {
                title: item.title,
                margin: '0 0 5 0',
                items: boxes
            });
        };

        /* Process recursively the result structure */
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
                    var detailsItemsContainer;
                    if (item.presentation == 'tabs') {
                        detailsItemsContainer = Ext.create('Ext.tab.Panel', {
                            plain: true,
                            border: 0,
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            defaults: {
                                overflowX: 'scroll',
                                padding: 10
                            },
                            items: boxes,
//                            listeners:{
//                                tabchange:function(tabPanel, newTab){
//                                    newTab.getHeight();
//                                }
//                            }
                        });
                    } else {
                        detailsItemsContainer = Ext.create('Ext.container.Container', {
                            items: boxes
                        });
                    }
                    return Ext.create('Ext.panel.Panel', {
                        title: 'Result details',
//                        title: item.title,
                        header: {
                            baseCls: 'ocb-panel-title'
                        },
                        border: false,
                        collapsible: true,
                        titleCollapse: true,
                        margin: 10,
                        bodyPadding: 10,
                        items: [
                            detailsItemsContainer
                        ]
                    });
                } else {

                    if (_.isUndefined(item.title)) {

                        debugger
                    }

                    return Ext.create('Ext.container.Container', {
                        id: _this.jobId + item.title.replace(/ /g, ''),
                        title: item.title,
                        margin: '0 0 20 0',
                        items: [
                            {
                                xtype: 'box',
                                overCls: 'ocb-pointer',
                                cls: 'panel-border-bottom',
                                margin: '0 20 10 0',
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

        var detailedResutls = getDetailsAsDocument(resultData[this.layoutName].layout, true);
        this.panel.add(this._getJobInfo({items: this.args}));
        if (this.drawIndex === true) {
            var indexResutl = getResultIndex(resultData[this.layoutName].layout.children);
            this.panel.insert(indexResutl);
        }
        this.panel.add(detailedResutls);

    },//end render


    _getErrorInfo: function () {
        var container = Ext.create('Ext.container.Container', {
            margin: 10
        });

        $.ajax({
            type: "GET",
            async: false,
            url: OpencgaManager.pollurl({
                accountId: $.cookie('bioinfo_account'),
                sessionId: $.cookie('bioinfo_sid'),
                jobId: this.jobId,
                filename: 'sge_err.log'
            }),
            success: function (d) {
                container.add({
                    title: 'Error log',
                    bodyPadding: '0 10',
                    border: false,
                    header: {
                        baseCls: 'ocb-panel-title'
                    },
                    style: {
                        borderBottom: '1px solid lightgray'
                    },
                    maxHeight: 400,
                    overflowY: true,
                    html: '<pre>' + d + '</pre>'
                })
            }
        });
        $.ajax({
            type: "GET",
            async: false,
            url: OpencgaManager.pollurl({
                accountId: $.cookie('bioinfo_account'),
                sessionId: $.cookie('bioinfo_sid'),
                jobId: this.jobId,
                filename: 'sge_out.log'
            }),
            success: function (d) {
                container.add({
                    title: 'Out log',
                    bodyPadding: '0 10',
                    margin: '20 0 0 0',
                    border: false,
                    header: {
                        baseCls: 'ocb-panel-title'
                    },
                    style: {
                        borderBottom: '1px solid lightgray'
                    },
                    maxHeight: 400,
                    overflowY: true,
                    html: '<pre>' + d + '</pre>'
                })
            }
        });

        return container;
    },

    _getJobInfo: function (args) {
        var args = args || {};
        var itemTpl = new Ext.XTemplate(
            '<div class="s110">',
            '<div style="display:inline-block;color:steelblue;width: 45px;">Id: </div>{id}<br>',
            '<div style="display:inline-block;color:steelblue;width: 45px;">Name: </div>{name}<br>',
            '<div style="display:inline-block;color:steelblue;width: 45px;">Tool: </div>{toolName}<br>',
            '<div style="display:inline-block;color:steelblue;width: 45px;">Date: </div>{date}<br>',
            '</div>',
            '<p class="tip emph">{description}</p>',
            '<p class="">{command.html}</p>'
        );
        var container = Ext.create('Ext.panel.Panel', {
            title: 'Information',
            header: {
                baseCls: 'ocb-panel-title'
            },
            border: false,
            collapsible: true,
            titleCollapse: true,
            collapsed: this.collapseInformation,
            margin: 10,
            bodyPadding: 10,
            items: [
                {
                    xtype: 'box',
                    data: this.job,
                    tpl: itemTpl
                },
                {
                    xtype: 'container', layout: 'hbox', margin: '10 0 0 0', defaults: {margin: '0 5 0 5'},
                    items: [
                        {
                            xtype: 'button',
                            text: 'download',
                            handler: function () {
                                OpencgaManager.downloadJob({
                                    accountId: $.cookie('bioinfo_account'),
                                    sessionId: $.cookie('bioinfo_sid'),
                                    jobId: this.jobId
                                })
                            }
                        },
                        {
                            xtype: 'button',
                            text: 'delete',
                            handler: function () {
                                Ext.Msg.confirm("Delete job", "Are you sure you want to delete this job?", function (btnClicked) {
                                    if (btnClicked == "yes") {
                                        OpencgaManager.deleteJob({
                                            accountId: $.cookie('bioinfo_account'),
                                            sessionId: $.cookie('bioinfo_sid'),
                                            jobId: this.jobId,
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
                    ]
                }
            ]
        });
        if (typeof args.items != 'undefined') {
            container.child('container').add(args.items);
        }
        return container;
    },


    _createGenomeViewer: function (target) {
        var _this = this;
        var genomeViewer = new GenomeViewer({
            cellBaseHost: 'http://www.ebi.ac.uk/cellbase/webservices/rest',
            cellBaseVersion: 'v3',
            target: target,
            width: $(target).width(),
            region: new Region(DEFAULT_SPECIES.region),
            availableSpecies: AVAILABLE_SPECIES,
            species: DEFAULT_SPECIES,
            sidePanel: false,
            resizable: false,
//        quickSearchResultFn:quickSearchResultFn,
//        quickSearchDisplayKey:,
            karyotypePanelConfig: {
                collapsed: false,
                collapsible: true
            },
            chromosomePanelConfig: {
                collapsed: false,
                collapsible: true
            },
            navigationBarConfig: {
                componentsConfig: {
//                restoreDefaultRegionButton:false,
//                regionHistoryButton:false,
//                speciesButton:false,
//                chromosomesButton:false,
//                karyotypeButton:false,
//                chromosomeButton:false,
//                regionButton:false,
//                zoomControl:false,
//                windowSizeControl:false,
//                positionControl:false,
//                moveControl:false,
//                autoheightButton:false,
//                compactButton:false,
//                searchControl:false
                }
            },
            handlers: {
                'region:change': function (e) {
                    console.log(e)
                }
            }
//        chromosomeList:[]
//            trackListTitle: ''
//            drawNavigationBar = true;
//            drawKaryotypePanel: false,
//            drawChromosomePanel: false,
//            drawOverviewTrackListPanel: false

        }); //the div must exist

        var tracks = [];
        this.sequence = new SequenceTrack({
//        title: 'Sequence',
            height: 30,
            visibleRegionSize: 200,

            renderer: new SequenceRenderer(),

            dataAdapter: new SequenceAdapter({
                category: "genomic",
                subCategory: "region",
                resource: "sequence",
                species: genomeViewer.species
            })
        });

        tracks.push(this.sequence);

        this.gene = new GeneTrack({
            title: 'Gene',
            minHistogramRegionSize: 20000000,
            maxLabelRegionSize: 10000000,
            minTranscriptRegionSize: 200000,
            height: 140,

            renderer: new GeneRenderer(),

            dataAdapter: new CellBaseAdapter({
                category: "genomic",
                subCategory: "region",
                resource: "gene",
                species: genomeViewer.species,
                params: {
                    exclude: 'transcripts.tfbs,transcripts.xrefs,transcripts.exons.sequence'
                },
                cacheConfig: {
                    chunkSize: 100000
                }
            })
        });

        tracks.push(this.gene);


        var renderer = new FeatureRenderer(FEATURE_TYPES.gene);
        renderer.on({
            'feature:click': function (event) {
                // feature click event example
                console.log(event)
            }
        });
        var gene = new FeatureTrack({
//        title: 'Gene overview',
            minHistogramRegionSize: 20000000,
            maxLabelRegionSize: 10000000,
            height: 100,

            renderer: renderer,

            dataAdapter: new CellBaseAdapter({
                category: "genomic",
                subCategory: "region",
                resource: "gene",
                params: {
                    exclude: 'transcripts,chunkIds'
                },
                species: genomeViewer.species,
                cacheConfig: {
                    chunkSize: 100000
                }
            })
        });
        genomeViewer.addOverviewTrack(gene);

        this.snp = new FeatureTrack({
            title: 'SNP',
            featureType: 'SNP',
            minHistogramRegionSize: 10000,
            maxLabelRegionSize: 3000,
            height: 100,

            renderer: new FeatureRenderer(FEATURE_TYPES.snp),

            dataAdapter: new CellBaseAdapter({
                category: "genomic",
                subCategory: "region",
                resource: "snp",
                params: {
                    exclude: 'transcriptVariations,xrefs,samples'
                },
                species: genomeViewer.species,
                cacheConfig: {
                    chunkSize: 10000
                }
            })
        });

        tracks.push(this.snp);


        genomeViewer.addTrack(tracks);


        genomeViewer.draw();


//        var genomeViewer = new GenomeViewer({
//            handlers: {
//                'species:change': function (event) {
////            _this._setTracks();
////            _this.setTracksMenu();
//                    _this.species = event.species;
//                    var text = _this.species.text + ' <span style="color: #8396b2">' + _this.species.assembly + '</span>';
//                    _this.headerWidget.setDescription(text);
////                    _this._refreshInitialTracksConfig();
//                }
//            }
//        });


        genomeViewer.chromosomePanel.hide();
        genomeViewer.karyotypePanel.hide();


        var filteredFile = this.result[_this.layoutName].layout.filteredFile;
        if (!_.isUndefined(filteredFile)) {
            OpencgaManager.poll({
                accountId: $.cookie('bioinfo_account'),
                sessionId: $.cookie('bioinfo_sid'),
                jobId: _this.jobId,
                filename: filteredFile,
                zip: false,
                success: function (data) {
                    if (data.indexOf("ERROR") != -1) {
                        console.error(data);
                    }
                    var vcfDataAdapter = new VCFDataAdapter(new StringDataSource(data), {async: false, species: genomeViewer.species});

                    var fileTrack = new FeatureTrack({
                        targetId: null,
                        id: "VCF file",
                        title: filteredFile,
                        height: 150,
                        minHistogramRegionSize: 12000,
                        maxLabelRegionSize: 3000,
                        renderer: new FeatureRenderer(FEATURE_TYPES.vcf),
                        dataAdapter: vcfDataAdapter
                    });

                    genomeViewer.addTrack(fileTrack);
                }
            });
        } else {
            console.log("No filtered VCF file.");
        }

        return genomeViewer;
    },
    _createVariantFilterWidget: function (target, gv, variantFilterFiles, tableLayout) {
        var variantFilterWidget = new VariantFilterWidget(this.jobId, {
            width: $(target).width(),
            height: $(target).height(),
            targetId: target,
            viewer: gv,
//            fileNames:_this.variantFiles
            fileNames: variantFilterFiles,
            tableLayout: tableLayout
        });
        variantFilterWidget.getPanel(target);

        return variantFilterWidget;
    },


    /*************************************/
    /*************************************/
    /*************************************/
    _parseOldXML: function (layout) {

        OpencgaManager.poll({
            accountId: $.cookie('bioinfo_account'),
            sessionId: $.cookie('bioinfo_sid'),
            jobId: layout.job.id,
            filename: layout.oldXML,
            zip: false,
            async: false,
            success: function (data) {
                var xmlDoc = $.parseXML(data);
                layout.xml = $(xmlDoc);
            }
        });
    }

};

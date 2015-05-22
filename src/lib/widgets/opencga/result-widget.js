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
    this.drawInformation = true;
    this.title = '';
    this.height;
    this.width;

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
                    height: this.height,
                    width: this.width,
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
                itemBox = _this._processRenderer(item, renderer);
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
                                padding: 10
                            },
                            items: boxes
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

                    return Ext.create('Ext.panel.Panel', {
                        id: _this.jobId + item.title.replace(/ /g, ''),
                        title: item.title,
                        border: false,
                        header: {
                            baseCls: 'ocb-panel-title',
                        },
                        margin: '0 0 20 0',
                        bodyPadding: 5,
                        items: [
//                            {
//                                xtype: 'box',
//                                overCls: 'ocb-pointer',
//                                cls: 'panel-border-bottom',
//                                margin: '0 20 10 0',
//                                data: item, tpl: itemTpl,
//                                listeners: {
//                                    afterrender: function () {
//                                        this.getEl().on("click", function () {
//                                            $(_this.panel.getEl().dom).children().scrollTop(0);
//                                        });
//                                    }
//                                }
//                            },
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

        var detailedResutls;
        var root = resultData[this.layoutName].layout;
        if (root.presentation === 'custom') {
            if ('children' in root) {
                if (typeof root.children == 'function') {
                    root.children = root.children();
                    this._processCustomItem(root.children);
                    detailedResutls = root.children;
                }
            }
        } else {
            detailedResutls = getDetailsAsDocument(root, true);
        }
        if (this.drawInformation === true) {
            this.panel.add(this._getJobInfo());
        }
        this.panel.add(this._getJobActions({items: this.args}));
        if (this.drawIndex === true) {
            var indexResutl = getResultIndex(resultData[this.layoutName].layout.children);
            this.panel.insert(indexResutl);
        }
        this.panel.add(detailedResutls);

    },//end render


    _processRenderer: function (item, renderer) {
        var _this = this;
        var itemBox;
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
            case 'html':
                itemBox = Ext.create('Ext.Component', {
                    html: renderer.html
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
                    fields: fields,
                    data: data
                });
                var columns = [];
                for (var i = 0; i < fields.length; i++) {
                    columns.push({
                        "header": fields[i], "dataIndex": fields[i], flex: 1
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
            case 'file-paging-grid':
                var filteredFields = [];
                var filteredColumns = [];
                var fields = renderer.tableLayout.fields;
                var columns = renderer.tableLayout.columns;
                var visibility = renderer.tableLayout.visibility;
                var types = renderer.tableLayout.types;
                var order = renderer.tableLayout.order;
                for (var i = 0; i < fields.length; i++) {
                    if (visibility[i] == 1) {
                        var field = fields[i];
                        var column = columns[i];
                        column.width = (field.length * 10) + 30;
                        filteredFields.push({name: field, type: types[i]});
                        filteredColumns.push(column);

//                                filteredFields.push({header: fields[i], dataIndex: fields[i], width: ((fields[i].length * 10) + 30)});
//                                filteredColumns.push();
                    }
                }
                var url = OpencgaManager.tableurl({
                    accountId: $.cookie("bioinfo_account"),
                    sessionId: $.cookie('bioinfo_sid'),
                    jobId: _this.jobId,
                    filename: item.file
                });
                var store = Ext.create('Ext.data.Store', {
                    pageSize: 10,
                    fields: filteredFields,
                    remoteSort: true,
                    proxy: {
                        url: url,
                        type: 'ajax',
                        reader: {
                            root: 'items',
                            totalProperty: 'total',
                            transform: function (response) {
                                return response;
                            }
                        },
                        extraParams: {
                            colNames: fields.join(','),
                            colVisibility: visibility.join(',')
                        },
                        actionMethods: {create: 'GET', read: 'GET', update: 'GET', destroy: 'GET'}
                    }
                });
                store.load();

                var paging = Ext.create('Ext.PagingToolbar', {
                    store: store,
                    pageSize: 10,
                    displayInfo: true,
                    displayMsg: 'Rows {0} - {1} of {2}',
                    emptyMsg: "No rows to display"
                });
                itemBox = Ext.create('Ext.grid.Panel', {
                        title: item.title,
                        store: store,
                        border: true,
                        header: {
                            baseCls: 'ocb-panel-title'
                        },
                        loadMask: true,
                        columns: filteredColumns,
                        plugins: 'bufferedrenderer',
                        height: renderer.height,
                        width: renderer.width,
                        features: [
                            {ftype: 'summary'}
                        ],
                        viewConfig: {
                            emptyText: 'No records to display',
                            enableTextSelection: true
                        },
                        tbar: paging
                    }
                );
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
                        var tableHtml = '<table class="ocb-attributes-table"><tbody>';
                        var lines = data.split('\n');

                        try {
                            var firstLine = lines[0];
                            if (renderer.header && firstLine.charAt(0) === '#') {
                                firstLine = firstLine.substr(1);
                                var fields = firstLine.split('\t');
                                tableHtml += '<thead>';
                                for (var j = 0; j < fields.length; j++) {
                                    var field = fields[j];
                                    tableHtml += '<td class="header">' + field + '</td>';
                                }
                                tableHtml += '</thead>';
                            }
                        } catch (e) {

                        }

                        tableHtml += '<tbody>';
                        for (var i = 0; i < lines.length; i++) {
                            var line = lines[i];
                            if (line.charAt(0) != '#' && line.trim() != '') {
                                tableHtml += '<tr>';
                                var fields = line.split('\t');
                                for (var j = 0; j < fields.length; j++) {
                                    var field = fields[j];
                                    tableHtml += '<td>' + field + '</td>';
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
            case 'network-viewer':
                var div = _this._createNetworkViewer(item, renderer);
                itemBox = Ext.create("Ext.container.Container", {
                    contentEl: div
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
                    marginTop: '10px',
                    border: '1px solid lightgray'
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
        return itemBox;
    },
    _processCustomItem: function (item) {
        // Not ExtJS Component
        if ('renderers' in item) {
            var newItems = [];
            for (var j = 0; j < item.renderers.length; j++) {
                var renderer = item.renderers[j];
                newItems.push(this._processRenderer(item, renderer));
            }
            delete item.renderers;
            item.xtype = 'container';
            item.margin = 5;
            item.items = newItems;
        } else {
            if ('items' in item) {
                for (var j = 0; j < item.items.length; j++) {
                    this._processCustomItem(item.items[j]);
                }
            }
        }


    },

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

    _getJobInfo: function () {
        var _this = this;
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
                }
            ]
        });
        return container;
    },
    _getJobActions: function (args) {
        var _this = this;
        var args = args || {};
        var container = Ext.create('Ext.container.Container', {
            margin: 10,
            bodyPadding: 10,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            defaults: {margin: '0 5 0 5'},
            items: [
                {
                    xtype: 'button',
                    text: 'download',
                    handler: function () {
                        OpencgaManager.downloadJob({
                            accountId: $.cookie('bioinfo_account'),
                            sessionId: $.cookie('bioinfo_sid'),
                            jobId: _this.jobId
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
        });
        if (typeof args.items != 'undefined') {
            container.add(args.items);
        }
        return container;
    },

    _createGenomeViewer: function (target) {
        var _this = this;
        var genomeViewer = new GenomeViewer({
            cellBaseHost: 'http://bioinfo.hpc.cam.ac.uk/cellbase/webservices/rest',
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

    _createNetworkViewer: function (item, renderer) {
        var _this = this;
        var div = document.createElement('div');
        div.style.width = renderer.width + 2 + 'px';
        div.style.height = renderer.height + 2 + 'px';
        div.style.border = '1px solid lightgray';
        div.style.marginTop = '10px';

        var networkViewer = new NetworkViewer({
            target: div,
            autoRender: true,
            sidePanel: false,
            border: false,
            width: renderer.width,
            height: renderer.height,
            session: new NetworkSession(),
            handlers: {
                'select:vertices': function (e) {
//                    _this.vertexAttributeEditWidget.checkSelectedFilter();
                },
                'select:edges': function (e) {
//                    _this.edgeAttributeEditWidget.checkSelectedFilter();
                },
                'change:vertexAttributes': function (e) {
//                    _this.toolbar.setVertexAttributes(e.sender);
                },
                'change:edgeAttributes': function (e) {

                }
            }
        });
        networkViewer.draw();


        if('utils' in renderer){
            $.ajax({
                type: "POST",
                url: OpencgaManager.getUtilsUrl() + renderer.utils.name,
                data:  renderer.utils.params,
                dataType: 'json',
                success: function (data, textStatus, jqXHR) {
                    renderer.utils.success(data, networkViewer);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('error')
                }
            });
        }
        return div;
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

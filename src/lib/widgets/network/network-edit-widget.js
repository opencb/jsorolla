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

function NetworkEditWidget(args) {
    var _this = this;
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('NetworkEditWidget');

    this.window;
    this.grid;
    this.network;
    this.networkViewer;

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    if (this.autoRender) {
        this.render();
    }
};

NetworkEditWidget.prototype = {
    render: function () {
        var _this = this;
        this.store = Ext.create('Ext.data.Store', {
            id: this.id + 'store',
            pageSize: 50,
            proxy: {
                type: 'memory'
            },
            fields: [
                {name: 'relation', type: 'string'},
                {name: 'source.id', type: 'string'},
                {name: 'target.id', type: 'string'}
            ],
            data: this.getElements()
        });

        this.network.on('add:vertex add:edge remove:vertex remove:edge remove:vertices load:json clean draw batch:end', function () {
            _this.store.loadRawData(_this.getElements());
        });
    },
    draw: function () {
        var _this = this;


        this.sourceTextfield = Ext.create('Ext.form.field.Text', {
            xtype: 'textfield',
            vtype: 'alphanum',
            emptyText: 'Source id',
            flex: 1
        });

        this.relationTextfield = Ext.create('Ext.form.field.Text', {
            xtype: 'textfield',
            vtype: 'alphanum',
            emptyText: 'Relation',
            flex: 1
        });

        this.targetTextfield = Ext.create('Ext.form.field.Text', {
            xtype: 'textfield',
            vtype: 'alphanum',
            emptyText: 'Target id',
            flex: 1
        });

        this.grid = Ext.create('Ext.grid.Panel', {
            id: this.id + 'grid',
            store: this.store,
            columns: [
                {"header": "Source node", xtype: 'templatecolumn', tpl: '{source.id}', flex: 1, editor: {allowBlank: false}},
                {"header": "Relation", "dataIndex": "relation", flex: 1, editor: {allowBlank: false}},
                {"header": "Target node", xtype: 'templatecolumn', tpl: '{target.id}', flex: 1, editor: {allowBlank: false}}
            ],
            flex: 1,
            border: 0,
            loadMask: true,
            selModel: {
                selType: 'rowmodel',
                mode: 'MULTI'
            },
            plugins: ['bufferedrenderer',
//                Ext.create('Ext.grid.plugin.RowEditing', {
//                    clicksToMoveEditor: 1,
//                    autoCancel: false
//                })
//                Ext.create('Ext.grid.plugin.CellEditing', {
//                    double click to edit cell
//                    clicksToEdit: 2
//                })
            ],

            listeners: {
//                selectionchange: function (model, selected) {
//                    console.log('selection change')
//                    var vertexList = [];
//                    for (var i = 0; i < selected.length; i++) {
//                        vertexList.push(selected[i].getData().Id);
//                    }
//                }
            },
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'top',
                    items: [
                        {
                            xtype: 'button',
                            text: 'Remove selected interactions',
                            handler: function (bt, e) {
                                var grid = _this.grid;
                                var selectedRecords = _this.grid.getSelectionModel().getSelection();
                                _this.network.batchStart();
                                for (var i = 0; i < selectedRecords.length; i++) {
                                    var record = selectedRecords[i];
                                    var edgeId = record.data.id;
                                    if (typeof edgeId !== 'undefined') {
                                        var edge = _this.network.getEdgeById(record.data.id);
                                        _this.network.removeEdge(edge);
                                    } else {
                                        var vertex = _this.network.getVertexById(record.data.source.id);
                                        _this.network.removeVertex(vertex);
                                    }
                                }
                                var vertices = _this.network.graph.vertices;
                                for (var i = 0; i < vertices.length; i++) {
                                    var vertex = vertices[i];
                                    if (typeof vertex !== 'undefined') {
                                        if (vertex.edges.length == 0) {
                                            _this.network.removeVertex(vertex);
                                        }
                                    }
                                }
                                _this.network.batchEnd();
                            }
                        },
                        '->',
                        {
                            xtype: 'button',
                            text: 'Download as SIF file',
                            handler: function (bt, e) {
                                var a = bt.getEl();
                                var string = _this.network.graph.getAsSIF();
                                var blob = new Blob([string], {type: "data:text/tsv"});
                                var url = URL.createObjectURL(blob);
                                var link = document.createElement('a');
                                link.href = url;
                                link.download = "network.sif";
                                var event = new MouseEvent('click', {
                                    'view': window,
                                    'bubbles': true,
                                    'cancelable': true
                                });
                                link.dispatchEvent(event);
                            }
                        }
                    ]
                }
            ]
        });

        this.window = Ext.create('Ext.window.Window', {
            id: this.id + 'window',
            title: "Network editor",
            width: 800,
            height: 600,
            closable: false,
            minimizable: true,
            constrain: true,
            collapsible: true,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'panel',
                    title: 'Add interaction',
                    width: 200,
                    border: 0,
                    bodyPadding: 10,
                    style: {
                        borderRight: '1px solid lightgray'
                    },
                    defaults: {
                        width: '100%',
                        labelWidth: 55
                    },
                    items: [
                        this.sourceTextfield,
                        this.relationTextfield,
                        this.targetTextfield,
                        {
                            xtype: 'button',
                            text: 'Add interaction',
                            handler: function (bt, e) {
                                var sourceId = _this.sourceTextfield.getValue();
                                var targetId = _this.targetTextfield.getValue();
                                var relation = _this.relationTextfield.getValue();
                                if (sourceId !== '' && targetId !== '' && relation !== '') {
                                    var edgeId = sourceId + '_' + relation + '_' + targetId;

                                    var sourceVertex = _this.network.getVertexById(sourceId);
                                    if (typeof sourceVertex === 'undefined') {
                                        sourceVertex = new Vertex({
                                            id: sourceId
                                        });
                                        _this.network.addVertex({
                                            vertex: sourceVertex,
                                            vertexConfig: new VertexConfig({
                                                rendererConfig: _this.networkViewer.session.getVertexDefaults()
                                            })
                                        }, true);
                                    }
                                    var targetVertex = _this.network.getVertexById(targetId);
                                    if (typeof targetVertex === 'undefined') {
                                        targetVertex = new Vertex({
                                            id: targetId
                                        });
                                        _this.network.addVertex({
                                            vertex: targetVertex,
                                            vertexConfig: new VertexConfig({
                                                rendererConfig: _this.networkViewer.session.getVertexDefaults()
                                            })
                                        }, true);
                                    }
                                    var edge = new Edge({
                                        id: edgeId,
                                        relation: relation,
                                        source: sourceVertex,
                                        target: targetVertex,
                                        weight: 1,
                                        directed: true
                                    });
                                    _this.network.addEdge({
                                        edge: edge,
                                        edgeConfig: new EdgeConfig({
                                            rendererConfig: _this.networkViewer.session.getEdgeDefaults()
                                        })
                                    });

                                    _this.networkViewer.refreshNetwork();
                                }
                            }
                        }
                    ]
                },
                this.grid
            ],
            listeners: {
                minimize: function () {
                    this.hide();
                }
            }
        });
    },
    getElements: function () {
        var edges = this.network.graph.edges;
        var vertices = this.network.graph.vertices;
        var elements = [];
        var verticesHash = {};
        for (var i = 0, l = edges.length; i < l; i++) {
            var edge = edges[i];
            if (typeof edge !== 'undefined') {
                elements.push(edge);
                verticesHash[edge.source.id] = edge.source;
                verticesHash[edge.target.id] = edge.target;
            }
        }
        for (var i = 0; i < vertices.length; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                if (vertex.edges.length == 0 && typeof verticesHash[vertex.id] === 'undefined') {
                    elements.push({source: vertex});
                }
            }
        }
        return elements;
    },
    show: function () {
        this.window.show();
    },
    hide: function () {
        this.window.hide();
    }
}
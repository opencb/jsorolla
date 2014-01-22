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

SIFNetworkFileWidget.prototype.draw = NetworkFileWidget.prototype.draw;

function SIFNetworkFileWidget(args) {
    if (args == null) {
        var args = {};
    }
    else {
        this.networkData = args.networkData;
    }

    args.title = 'Import a Network SIF file';
    NetworkFileWidget.prototype.constructor.call(this, args);
};


SIFNetworkFileWidget.prototype.getFileUpload = function () {
    var _this = this;
    this.fileUpload = Ext.create('Ext.form.field.File', {
        msgTarget: 'side',
        allowBlank: false,
        emptyText: 'SIF network file',
        flex: 1,
        buttonText: 'Browse local',
        listeners: {
            change: function (f, v) {
                _this.panel.setLoading(true);
                var file = document.getElementById(_this.fileUpload.fileInputEl.id).files[0];
                var node = Ext.DomQuery.selectNode('input[id=' + f.getInputId() + ']');
                node.value = v.replace("C:\\fakepath\\", "");

                _this.dataAdapter = new SIFDataAdapter({
                    dataSource: new FileDataSource(file),
                    handlers: {
                        'data:load': function (event) {
                                _this.processData(event.network);
                        }
                    }
                });
            }
        }
    });

    return this.fileUpload;
};

SIFNetworkFileWidget.prototype.processData = function (network) {
    var _this = this;
    try {
        this.content = network; //para el onOK.notify event
        var verticesLength = network.graph.vertices.length;
        var edgesLength = network.graph.edges.length;

        var edges = network.graph.edges;
        var storeData = [];
        for (var i = 0; i < edges.length; i++) {
            var edge = edges[i];
            storeData.push([edge.source.id, edge.relation, edge.target.id]);
        }
        this.gridStore.loadData(storeData);

        this.infoLabel.setText('<span class="ok">File loaded sucessfully</span>', false);
        this.countLabel.setText('Vertices:<span class="info">' + verticesLength + '</span> edges:<span class="info">' + edgesLength + '</span>', false);

    } catch (e) {
        this.infoLabel.setText('<span class="err">File not valid </span>' + e, false);
    }
    this.panel.setLoading(false);
};
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

DOTNetworkFileWidget.prototype.draw = NetworkFileWidget.prototype.draw;

function DOTNetworkFileWidget(args) {
    args.title = 'Import a Network DOT file';
    NetworkFileWidget.prototype.constructor.call(this, args);
};


DOTNetworkFileWidget.prototype.getFileUpload = function () {
    var _this = this;
    this.fileUpload = Ext.create('Ext.form.field.File', {
        msgTarget: 'side',
        allowBlank: false,
        emptyText: 'DOT network file',
        flex: 1,
        buttonText: 'Browse local',
        listeners: {
            change: function (f,v) {
                _this.panel.setLoading(true);
                var file = document.getElementById(_this.fileUpload.fileInputEl.id).files[0];
                var node = Ext.DomQuery.selectNode('input[id='+f.getInputId()+']');
                node.value = v.replace("C:\\fakepath\\","");

                _this.dataAdapter = new DOTDataAdapter({
                    dataSource: new FileDataSource({file:file}),
                    handlers: {
                        'data:load': function (event) {
                            try {
                                var network = event.network;
                                _this.content = network; //para el onOK.notify event
                                var verticesLength = network.graph.vertices.length;
                                var edgesLength = network.graph.edges.length;

                                var edges = network.graph.edges;
                                for (var i = 0; i < edges.length; i++) {
                                    var edge = edges[i];
                                    var edgeConfig = network.getEdgeConfig(edge);
                                    var link = (edgeConfig.type = "directed") ? "->" : "--";

                                    _this.gridStore.loadData([
                                        [edge.source.name, link, edge.target.name]
                                    ], true);
                                }

                                _this.infoLabel.setText('<span class="ok">File loaded sucessfully</span>', false);
                                _this.countLabel.setText('Vertices:<span class="info">' + verticesLength + '</span> edges:<span class="info">' + edgesLength + '</span>', false);

                            } catch (e) {
                                _this.infoLabel.setText('<span class="err">File not valid </span>' + e, false);
                            }
                            _this.panel.setLoading(false);
                        }
                    }
                });
            }
        }
    });

    return this.fileUpload;
};

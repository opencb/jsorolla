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

JSONNetworkFileWidget.prototype = new NetworkFileWidget();

function JSONNetworkFileWidget(args) {
    NetworkFileWidget.prototype.constructor.call(this, args);

    this.title = 'Open a Network JSON file';
    this.id = Utils.genId('JSONNetworkFileWidget');
};

JSONNetworkFileWidget.prototype.getFileUpload = function () {
    var _this = this;
    this.fileUpload = Ext.create('Ext.form.field.File', {
        msgTarget: 'side',
        allowBlank: false,
        emptyText: 'JSON network file',
        flex: 1,
        buttonText: 'Browse local',
        listeners: {
            change: function () {
                _this.panel.setLoading(true);
                var file = document.getElementById(_this.fileUpload.fileInputEl.id).files[0];

                _this.dataAdapter = new JSONNetworkDataAdapter({
                    dataSource: new FileDataSource({file: file}),
                    handlers: {
                        'data:load': function (event) {
                            try {
                                var networkJSON = event.jsonObject;
                                _this.content = networkJSON;

                                var data = [];
                                for (var i = 0; i < networkJSON.graph.edges.length; i++) {
                                    var edge = networkJSON.graph.edges[i];
                                    data.push([edge.source.id, edge.relation, edge.target.id]);
                                }
                                _this.gridStore.loadData(data);


                                var verticesLength = networkJSON.graph.vertices.length;
                                var edgesLength = networkJSON.graph.edges.length;

                                _this.infoLabel.setText('<span class="ok">File loaded sucessfully</span>', false);
                                _this.countLabel.setText('Vertices:<span class="info">' + verticesLength + '</span>&nbsp;&nbsp; Edges:<span class="info">' + edgesLength + '</span>', false);

                            } catch (e) {
                                _this.infoLabel.setText('<span class="err">File not valid </span>' + e, false);
                            }
                            _this.panel.setLoading(false);
                        },
                        'error:parse': function (event) {
                            _this.infoLabel.setText('<span class="err">' + event.errorMsg + '</span>', false);
                            _this.panel.setLoading(false);
                        }
                    }
                });
            }
        }
    });

    return this.fileUpload;
};
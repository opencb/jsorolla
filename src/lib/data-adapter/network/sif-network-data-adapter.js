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
function SIFNetworkDataAdapter(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    this.dataSource;
    this.async = true;

    this.separator = "\t";
    this.graph = new Graph();


    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);


    if (this.async) {
        this.dataSource.on('success', function (data) {
            _this.parse(data);
        });
        this.dataSource.fetch(this.async);
    } else {
        var data = this.dataSource.fetch(this.async);
        this.parse(data);
    }

    this.addedVertex;
    this.addedEdges;

};

SIFNetworkDataAdapter.prototype.getGraph = function () {
    return this.graph;
};

SIFNetworkDataAdapter.prototype.parse = function (data) {
    var _this = this;

    try {
        console.time("SIFParse");
        data = data.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        var lines = data.split(/\n/);
        this.addedVertex = {};
        this.addedEdges = {};
//        console.log('SIFParse number lines: ' + lines.length);
//        console.log(lines);
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if ((line != null) && (line.length > 0)) {
                var fields = line.split(this.separator);
                for (var j = 0; j < fields.length; j++) {
                    fields[j] = fields[j].trim();
                }

                if (fields[0].substr(0, 1) != "#") {

                    var sourceName = fields[0];
                    var edgeName = fields[1];
                    var targetName;

                    /** create source vertex **/
                    if (typeof this.addedVertex[sourceName] === 'undefined') {
                        var sourceVertex = new Vertex({
                            id: sourceName
                        });
                        this.graph.addVertex(sourceVertex);
                        this.addedVertex[sourceName] = sourceVertex;
                    }

                    // multiple targets
                    for (var j = 2, len = fields.length; j < len; j++) {
                        targetName = fields[j];

                        /** create target vertex **/
                        if (typeof this.addedVertex[targetName] === 'undefined') {
                            var targetVertex = new Vertex({
                                id: targetName
                            });
                            this.graph.addVertex(targetVertex);
                            this.addedVertex[targetName] = targetVertex;
                        }

                        var edgeId = sourceName + '_' + edgeName + '_' + targetName;

                        /** create edge **/
                        if (typeof this.addedEdges[edgeId] === 'undefined') {
                            var edge = new Edge({
                                id: edgeId,
                                relation: edgeName,
                                source: this.addedVertex[sourceName],
                                target: this.addedVertex[targetName],
                                weight: 1,
                                directed: true
                            });
                            this.graph.addEdge(edge);
                            this.addedEdges[edgeId] = edge;
                        }
                    }
                }
            }
        }
        console.timeEnd("SIFParse");
        this.trigger('data:load', {graph: this.graph, sender: this});
    } catch (e) {
        console.log(e);
        this.trigger('error:parse', {errorMsg: 'Parse error', sender: this});
    }
};

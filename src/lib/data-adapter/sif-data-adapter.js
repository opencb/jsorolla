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

SIFDataAdapter.prototype.getNetwork = NetworkDataAdapter.prototype.getNetwork;

function SIFDataAdapter(args) {
    NetworkDataAdapter.prototype.constructor.call(this, args);

    this.addedVertex = {};
};

SIFDataAdapter.prototype.parse = function (data) {
    var _this = this;

    var lines = data.split("\n");
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].replace(/^\s+|\s+$/g, "");
        if ((line != null) && (line.length > 0)) {
            var fields = line.split("\t");
            if (fields[0].substr(0, 1) != "#") {

                var sourceName = fields[0];
                var edgeName = fields[1];
                var targetName;

                /** create source vertex **/
                if (typeof this.addedVertex[sourceName] === 'undefined') {
                    var sourceVertex = new Vertex({
                        name: sourceName
                    });
                    this.network.addVertex({
                        vertex: sourceVertex,
                        vertexConfig: new VertexConfig({
                            renderer: new DefaultVertexRenderer({})
                        })
                    });
                    this.addedVertex[sourceName] = sourceVertex;
                }

                // multiple targets
                for (var j = 2, len = fields.length; j < len; j++) {
                    targetName = fields[j];

                    /** create target vertex **/
                    if (typeof this.addedVertex[targetName] === 'undefined') {
                        var targetVertex = new Vertex({
                            name: targetName
                        });
                        this.network.addVertex({
                            vertex: targetVertex,
                            vertexConfig: new VertexConfig({
                                renderer: new DefaultVertexRenderer({})
                            })
                        });
                        this.addedVertex[targetName] = targetVertex;
                    }

                    /** create edge **/
                    var edge = new Edge({
                        name: edgeName,
                        source: this.addedVertex[sourceName],
                        target: this.addedVertex[targetName],
                        weight: 1,
                        directed: true
                    });
                    this.network.addEdge({
                        edge: edge,
                        edgeConfig: new EdgeConfig({
                            renderer: new DefaultEdgeRenderer()
                        })
                    });
                }
            }
        }
    }
};

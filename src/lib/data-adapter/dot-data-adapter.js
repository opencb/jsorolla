/*
 * Copyright (c) 2014 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2014 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2014 Ignacio Medina (ICM-CIPF)
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

NetworkDataAdapter.prototype.getNetwork = NetworkDataAdapter.prototype.getNetwork;

function DOTDataAdapter(args) {
    NetworkDataAdapter.prototype.constructor.call(this, args);

    this.vertexSubgraph = {};

    this.addedVertex = {};
};

DOTDataAdapter.prototype.parse = function (data) {
    var _this = this;
    var sourceName, targetName, relation, relationType, fields, attrList, attrFields, metainfo, graphMetainfo, allNodesMetainfo, allEdgesMetainfo;

    var lines = data.split("\n");
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].replace(/^\s+|\s+$/g, "");
        if (line.substr(0, 1) != "#" && line.substr(0, 2) != "/*" && line.substr(0, 2) != "//") {
            var lastChar = line.substr(line.length - 1, line.length);

            // start graph definition
            if ((line.indexOf("graph") != -1 || line.indexOf("digraph") != -1 || line.indexOf("subgraph") != -1) && lastChar == '{') {
                if (line.indexOf("digraph") != -1) {
                    this.graph.setType("directed");
                }
                for (var j = i; j < lines.length; j++) {
                    i++;
                    line = lines[j].replace(/^\s+|\s+$/g, "");
                    if (line.substr(0, 1) != "#" && line.substr(0, 2) != "/*" && line.substr(0, 2) != "//") {
                        // relation definition
                        if ((line.indexOf("->") != -1 || line.indexOf("--") != -1)) {
                            if (line.indexOf("->") != -1) {
                                relation = "->";
                                relationType = "directed";
                            }
                            else {
                                relation = "--";
                                relationType = "undirected";
                            }

                            metainfo = {};
                            // the relation has attributes
                            if (line.indexOf("[") != -1 && line.indexOf("]") != -1) {

                                // extract attributes
                                attrList = line.substring(line.indexOf("[") + 1, line.indexOf("]")).split(',');
                                for (var c = 0, lenA = attrList.length; c < lenA; c++) {
                                    attrFields = attrList[c].split("=");
                                    metainfo[attrFields[0].replace(/^\s+|\s+$/g, "")] = attrFields[1].replace(/^\s+|\s+$/g, "");
                                }
                                line = line.substring(0, line.indexOf("["));
                            }
                            // relation without attributes
                            else {
                                line = line.substring(0, line.indexOf(";"));
                            }

                            // loop over relations
                            fields = line.split(relation);
                            for (var k = 0, len = fields.length; k < len - 1; k++) {
                                sourceName = fields[k].replace(/^\s+|\s+$/g, "").replace(/"/g, "");
                                targetName = fields[k + 1].replace(/^\s+|\s+$/g, "").replace(/"/g, "");

                                // add nodes to network
                                if (typeof this.addedVertex[sourceName] === 'undefined') {
                                    var vertexSource = new Vertex({
                                        name: sourceName
                                    });
                                    this.network.addVertex({
                                        vertex: vertexSource,
                                        vertexConfig: new VertexConfig({
                                            renderer: new DefaultVertexRenderer({})
                                        })
                                    });
                                    this.addedVertex[sourceName] = vertexSource;
                                }
                                if (typeof this.addedVertex[targetName] === 'undefined') {
                                    var vertexTarget = new Vertex({
                                        name: targetName
                                    });
                                    this.network.addVertex({
                                        vertex: vertexTarget,
                                        vertexConfig: new VertexConfig({
                                            renderer: new DefaultVertexRenderer({})
                                        })
                                    });
                                    this.addedVertex[targetName] = vertexTarget;
                                }
                                // add edge to network
                                var edge = new Edge({
                                    source: this.addedVertex[sourceName],
                                    target: this.addedVertex[targetName]
                                });
                                this.network.addEdge({
                                    edge: edge,
                                    edgeConfig: new EdgeConfig({
                                        type:relationType,
                                        renderer: new DefaultEdgeRenderer({
                                            shape: relationType
                                        })
                                    })
                                });
                                //TODO attributes from dot

                            }
                        }
                        // has attributes and not is a relation definition
                        else if (line.indexOf("[") != -1 && line.indexOf("]") != -1) {
                            // extract attributes
                            attrList = line.substring(line.indexOf("[") + 1, line.indexOf("]")).split(',');
                            metainfo = {};
                            for (var c = 0, lenA = attrList.length; c < lenA; c++) {
                                attrFields = attrList[c].split("=");
                                metainfo[attrFields[0].replace(/^\s+|\s+$/g, "")] = attrFields[1].replace(/^\s+|\s+$/g, "").replace(/"/g, "").replace(/'/g, "");
                            }

                            // attributes for the graph
                            if (line.indexOf("graph") != -1) {
                                graphMetainfo = metainfo;
                            }

                            // attributes for all nodes
                            else if (line.indexOf("node ") != -1) {
                                allNodesMetainfo = metainfo;
                            }

                            // attributes for all edges
                            else if (line.indexOf("edge") != -1) {
                                allEdgesMetainfo = metainfo;
                            }

                            // attributes for specific node
                            else {
                                var node = line.split("[")[0].replace(/^\s+|\s+$/g, "").replace(/"/g, "");

                                // check and modify if necesary color names
                                if (metainfo.color && metainfo.color.slice(0, 1) != '#' && !isNaN(metainfo.color.slice(-1))) {
                                    metainfo.color = metainfo.color.slice(0, -1);
                                }
                                if (metainfo.fillcolor && metainfo.fillcolor.slice(0, 1) != '#' && !isNaN(metainfo.fillcolor.slice(-1))) {
                                    metainfo.fillcolor = metainfo.fillcolor.slice(0, -1);
                                }

                                if (typeof this.addedVertex[node] === 'undefined') {
                                    var vertex = new Vertex({
                                        name: node
                                    });
                                    this.network.addVertex({
                                        vertex: vertex,
                                        vertexConfig: new VertexConfig({
                                            renderer: new DefaultVertexRenderer({})
                                        })
                                    });
                                    this.addedVertex[node] = vertex;
                                }

                            }
                        }
                        else if (line.indexOf("subgraph") != -1) {
                            lines[j] = lines[j].replace("subgraph", "graph");
                            var subgraphName = lines[j].replace(/^\s+|\s+$/g, "").split(" ")[1];
                            var subgraphLines = "";
                            var splitter;
                            for (var n = j, lenN = lines.length; n < lenN; n++) {
                                subgraphLines += lines[n] + "\n";
                                var lineN = lines[j].replace(/^\s+|\s+$/g, "");
                                if (lineN.substr(0, 1) != "#" && lineN.substr(0, 2) != "/*" && lineN.substr(0, 2) != "//") {
                                    if ((lineN.indexOf("->") != -1 || lineN.indexOf("--") != -1)) {
                                        if (lineN.indexOf("->") != -1) {
                                            splitter = "->";
                                        }
                                        else {
                                            splitter = "--";
                                        }

                                        // loop over relations
                                        var fieldsN = lineN.replace(/;/g, "").split(splitter);
                                        for (var k = 0, len = fieldsN.length; k < len - 1; k++) {
                                            source = fieldsN[k].replace(/^\s+|\s+$/g, "").replace(/"/g, "");
                                            target = fieldsN[k + 1].replace(/^\s+|\s+$/g, "").replace(/"/g, "");

                                            this.nodeSubgraph[source] = subgraphName;
                                            this.nodeSubgraph[target] = subgraphName;
                                        }

                                    }
                                }
                                if (lines[n].indexOf("}") != -1) {
                                    this.parse(subgraphLines);
                                    break;
                                }
                                else {
                                    j++;
                                    i++;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

/*
 * Copyright 2015-2024 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//NetworkDataAdapter.prototype.getNetwork = NetworkDataAdapter.prototype.getNetwork;

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
                                        vertexConfig: new VertexConfig({})
                                    });
                                    this.addedVertex[sourceName] = vertexSource;
                                }
                                if (typeof this.addedVertex[targetName] === 'undefined') {
                                    var vertexTarget = new Vertex({
                                        name: targetName
                                    });
                                    this.network.addVertex({
                                        vertex: vertexTarget,
                                        vertexConfig: new VertexConfig({})
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
                                        vertexConfig: new VertexConfig({})
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

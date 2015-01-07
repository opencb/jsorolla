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
function TextNetworkDataAdapter(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    this.dataSource;
    this.async = true;

    this.separator = /\t/;
    this.graph = new Graph();


    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.rawData;

    if (this.async) {
        this.dataSource.on('success', function (data) {
            _this.rawData = data;
            _this.parse(data);
        });
        this.dataSource.fetch(this.async);
    } else {
        var data = this.dataSource.fetch(this.async);
        _this.rawData = data;
        this.parse(data);
    }

    this.columnLength;

    this.addedVertex;
    this.addedEdges;

};

TextNetworkDataAdapter.prototype.getGraph = function () {
    return this.graph;
};

TextNetworkDataAdapter.prototype.parse = function (data) {
    try {
        if (typeof data === 'undefined') {
            data = this.rawData;
        }
        data = data.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        var lines = data.split(/\n/);
        this.lines = [];
        this.columnLength = 0;
        var firstLineColumnLength = 0;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if ((line != null) && (line.length > 0)) {
                var fields = line.split(this.separator);
                if (fields[0].substr(0, 1) != "#") {
                    this.lines.push(fields);

                    if (firstLineColumnLength === 0) {
                        firstLineColumnLength = fields.length;
                        this.columnLength = firstLineColumnLength;
                    }

                    if (fields.length !== firstLineColumnLength) {
                        this.trigger('error:parse', {errorMsg: 'Different number of columns.', sender: this});
                    }
                }
            }
        }
        this.trigger('data:load', {graph: this.lines, sender: this});
    } catch (e) {
        console.log(e);
        this.trigger('error:parse', {errorMsg: 'Parse error', sender: this});
    }
};

TextNetworkDataAdapter.prototype.parseColumns = function (sourceIndex, targetIndex, relationIndex, relationDefaultName) {
    this.graph = new Graph();
    this.addedVertex = {};
    this.addedEdges = {};

    for (var i = 0; i < this.lines.length; i++) {
        var fields = this.lines[i];
        for (var j = 0; j < fields.length; j++) {
            fields[j] = fields[j].trim();
        }


        var sourceName = fields[sourceIndex];
        var targetName = fields[targetIndex];
        var edgeName;
        if(relationIndex < 0){
            edgeName = relationDefaultName;
        }else{
            edgeName = fields[relationIndex];
        }

        /** create source vertex **/
        if (typeof this.addedVertex[sourceName] === 'undefined') {
            var sourceVertex = new Vertex({
                id: sourceName
            });
            this.graph.addVertex(sourceVertex);
            this.addedVertex[sourceName] = sourceVertex;
        }

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

    return this.graph;
};
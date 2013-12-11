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

function NetworkConfig(args) {
    var _this = this;
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('NetworkConfig');

    //set instantiation args, must be last
    _.extend(this, args);


    this.layout = {}; // [{id:"one",x:1,y:2,z:3},...]
    this.displayVertices = {}; // [{id:"one",color:red,...},...]
    this.displayEdges = {};  // [{id:"one",color:red,...},...]
    this.general = {};

    this.on(this.handlers);
}

NetworkConfig.prototype = {
    setVertexLayout:function(vertexLayout){
        this.layout[vertexLayout.id] = vertexLayout;
    },
    setVertexDisplay:function(vertexDisplay){
        this.displayVertices[vertexDisplay.id] = vertexDisplay;
    },
    getVertexLayout:function(vertex){
        return this.layout[vertex.id];
    },
    getVertexDisplay:function(vertex){
        return this.displayVertices[vertex.id];
    },
    setEdgeDisplay:function(edgeDisplay){
        this.displayEdges[edgeDisplay.id] = edgeDisplay;
    },
    getEdgeDisplay:function(edge){
        return this.displayEdges[edge.id];
    }
}
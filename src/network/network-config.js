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


    this.vertices = {}; // [{id:"one",color:red,...},...]
    this.edges = {};  // [{id:"one",color:red,...},...]
    this.general = {};

    this.on(this.handlers);
}

NetworkConfig.prototype = {
    clean: function () {
        this.vertices = {};
        this.edges = {};
        this.general = {};
    },
    setVertexConfig:function(vertexConfig){
        this.vertices[vertexConfig.id] = vertexConfig;
    },
    getVertexConfig:function(vertex){
        return this.vertices[vertex.id];
    },
    setEdgeConfig:function(edgeConfig){
        this.edges[edgeConfig.id] = edgeConfig;
    },
    getEdgeConfig:function(edge){
        return this.edges[edge.id];
    },
    removeVertex:function(vertex){
        delete this.vertices[vertex.id];
    },
    removeEdge:function(edge){
        delete this.edges[edge.id];
    },
    toJSON:function(){
        return {
            vertices:this.vertices,
            edges:this.edges,
            general:this.general
        }
    }
}
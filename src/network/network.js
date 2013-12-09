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

function Network(args) {
    var _this = this;
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('Network');

    //set instantiation args, must be last
    _.extend(this, args);


    this.networkConfig = new NetworkConfig();
    this.attributes = new Attributes();
    this.graph = new Graph();

    this.on(this.handlers);
}

Network.prototype = {
    addVertex:function(args){
        var vertexLayout = args.vertexLayout;
        var vertexDisplay = args.vertexDisplay;
        var vertex = args.vertex;

        this.graph.addVertex(vertex);
        this.setVertexLayout(vertexLayout);
        this.setVertexDisplay(vertexDisplay);
    },
    setVertexLayout:function(vertexLayout){
        this.networkConfig.setVertexLayout(vertexLayout);
    },
    setVertexDisplay:function(vertexDisplay){
        this.networkConfig.setVertexDisplay(vertexDisplay);
    },
    getVertexLayout:function(vertex){
        return this.networkConfig.getVertexLayout(vertex);
    },
    getVertexDisplay:function(vertex){
       return this.networkConfig.getVertexDisplay(vertex);
    },
    getVertexById:function(vertexId){
        return this.graph.getVertexById(vertexId);
    }
}
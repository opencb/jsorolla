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

function Edge(args) {

    this.id = 'e' + Utils.genId();

    this.relation = '';
    this.source;
    this.target;
    this.weight;
    this.directed;
    this.overlapCount;

    this.renderer = new DefaultEdgeRenderer();
    //set instantiation args, must be last
    for (var prop in args) {
        if (hasOwnProperty.call(args, prop)) {
            this[prop] = args[prop];
        }
    }

    if (this.renderer) {
        this.renderer.edge = this;
    }
}

Edge.prototype = {
    getSource: function () {
        return this.source;
    },
    setSource: function (vertex) {
        this.source = vertex;
    },
    getTarget: function () {
        return this.target;
    },
    setTarget: function (vertex) {
        this.target = vertex;
    },
    render: function (args) {
        this.renderer.render(args)
    },
    setRenderer: function (renderer) {
        if (renderer) {
            this.renderer = renderer;
            this.renderer.edge = this;
        }
    },
    toJSON: function () {
        return {
            id: this.id,
            source: this.source,
            target: this.target,
            weight: this.weight,
            directed: this.directed,
            relation: this.relation,
            renderer: this.renderer
        }
    }
}
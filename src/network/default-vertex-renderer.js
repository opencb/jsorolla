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

function DefaultVertexRenderer(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    //defaults
    this.shape = 'circle';
    this.size = 20;
    this.color = '#9fc6e7';
    this.strokeSize = 1;
    this.strokeColor = '#9fc6e7';
    this.opacity = 0.8;
    this.labelSize = 12;
    this.labelColor = '#111111';
//    this.labelPositionX = 5;
//    this.labelPositionY = 45;
    this.labelText = '';

    this.el;
    this.vertexEl;
    this.targetEl;
    this.selectEl;
    this.groupEl;
    this.vertex;
    this.selected = false;
    //set instantiation args, must be last
    _.extend(this, args);

}

DefaultVertexRenderer.prototype = {
    get: function (attr) {
        return this[attr];
    },
    set: function (attr, value) {
        this[attr] = value;
        switch (attr) {
            case "color":
                this.vertexEl.setAttribute('fill', this.color);
                break;
            case "strokeColor":
                this.vertexEl.setAttribute('stroke', this.strokeColor);
                break;
            case "opacity":
                this.groupEl.setAttribute('opacity', this.opacity);
                break;
            case "labelSize":
                this.labelEl.setAttribute('font-size', this.labelSize);
                break;
            case "size":
            case "strokeSize":
                switch (this.shape) {
                    case "circle":
                        this._updateCircleSize();
                        break;
                    case "ellipse":
                        this._updateEllipseSize();
                        break;
                    case "square":
                        this._updateSquareSize();
                        break;
                    case "rectangle":
                        this._updateRectangleSize();
                        break;
                }
                break;
            default:
                console.log('update')
                this.update();
        }
    },
    render: function (args) {
        this.targetEl = args.target;
        this.vertex = args.vertex;
        this.coords = args.coords;
        this._render();
    },
    remove: function () {
        $(this.el).remove();
    },
    update: function () {
        this.remove();
        this._render();
    },
    select: function () {
        if (!this.selected) {
            this._renderSelect();
        }
    },
    deselect: function () {
        if (this.selected) {
            this._removeSelect();
        }
    },
    move: function (dispX, dispY) {
        var currentX = parseFloat(this.el.getAttribute('x'));
        var currentY = parseFloat(this.el.getAttribute('y'));
        this.el.setAttribute('x', currentX + dispX);
        this.el.setAttribute('y', currentY + dispY);
    },
    setLabelContent: function (text) {
        this.labelText = text;
        var vertexLabel = $(this.el).find('text[network-type="vertex-label"]')[0];
        if (typeof vertexLabel != 'undefined') {
            var label = '';
            if ($.type(this.labelText) === 'string' && this.labelText.length > 0) {
                label = this.labelText;
            }
            vertexLabel.textContent = label;
        }
    },
    getSize: function () {
        return this.size + this.strokeSize;
    },
    /* Private */
    _render: function () {
        switch (this.shape) {
            case "circle":
                this._drawCircleShape();
                break;
            case "ellipse":
                this._drawEllipseShape();
                break;
            case "square":
                this._drawSquareShape();
                break;
            case "rectangle":
                this._drawRectangleShape();
                break;
        }
        if (this.selected) {
            this._renderSelect();
        }
    },
    _renderSelect: function () {
        switch (this.shape) {
            case "circle":
                this._drawSelectCircleShape();
                break;
            case "ellipse":
                this._drawSelectEllipseShape();
                break;
            case "square":
                this._drawSelectSquareShape();
                break;
            case "rectangle":
                this._drawSelectRectangleShape();
                break;
        }
        this.selected = true;
    },
    _removeSelect: function () {
        $(this.el).find('[network-type="select-vertex"]').remove();
        this.selected = false;
    },


    _calculateOffset: function () {
        var size = this.size + this.strokeSize;
        var size = size + (size * 0.3);
        var midOffset = size / 2;
        return {size: size, midOffset: midOffset};
    },

    /** CIRCLE METHODS **/
    _drawCircleShape: function () {
        var o = this._calculateOffset();

        var vertexSvg = SVG.create("svg", {
            "id": this.vertex.id,
            "cursor": "pointer",
            x: this.coords.x - o.midOffset,
            y: this.coords.y - o.midOffset,
            'network-type': 'vertex-svg'
        });
        var groupSvg = SVG.addChild(vertexSvg, 'g', {
            opacity: this.opacity
        });
        var circle = SVG.addChild(groupSvg, 'circle', {
            cx: o.midOffset,
            cy: o.midOffset,
            r: this.size / 2,
            stroke: this.strokeColor,
            'stroke-width': this.strokeSize,
            fill: this.color,
            'network-type': 'vertex'
        });
        if (this.labelSize > 0) {
            var vertexText = SVG.addChild(vertexSvg, "text", {
                "x": 5,
                "y": this.labelSize + o.size,
                "font-size": this.labelSize,
                "fill": this.labelColor,
                'network-type': 'vertex-label'
            });
            var label = this.vertex.id;
            if ($.type(this.labelText) === 'string' && this.labelText.length > 0) {
                label = this.labelText;
            }
            vertexText.textContent = label;
        }
        this.el = vertexSvg;
        this.groupEl = groupSvg;
        this.vertexEl = circle;
        this.labelEl = vertexText;
        this.targetEl.appendChild(vertexSvg);
    },
    _updateCircleSize: function () {

        var o = this._calculateOffset();
        this.el.setAttribute('x', this.coords.x - o.midOffset);
        this.el.setAttribute('y', this.coords.y - o.midOffset);

        this.vertexEl.setAttribute('stroke-width', this.strokeSize);
        this.vertexEl.setAttribute('r', this.size / 2);
        this.vertexEl.setAttribute('cx', o.midOffset);
        this.vertexEl.setAttribute('cy', o.midOffset);

        if (this.labelSize > 0) {
            this.labelEl.setAttribute('y', this.labelSize + o.size);
        }
        if (this.selected) {
            this._updateSelectShapeSize(o);
        }
    },
    /* END CIRCLE METHODS */

    /** ELLIPSE METHODS **/
    _drawEllipseShape: function () {

        var o = this._calculateOffset();

        var vertexSvg = SVG.create("svg", {
            "id": this.vertex.id,
            "cursor": "pointer",
            x: this.coords.x - o.midOffset,
            y: this.coords.y - o.midOffset,
            'network-type': 'vertex-svg'
        });
        var groupSvg = SVG.addChild(vertexSvg, 'g', {
            opacity: this.opacity
        });
        var ellipse = SVG.addChild(groupSvg, 'ellipse', {
            cx: o.midOffset,
            cy: o.midOffset,
            rx: this.size / 1.7,
            ry: this.size / 2.5,
            stroke: this.strokeColor,
            'stroke-width': this.strokeSize,
            fill: this.color,
            'network-type': 'vertex'
        });
        if (this.labelSize > 0) {
            var vertexText = SVG.addChild(vertexSvg, "text", {
                "x": 5,
                "y": this.labelSize + o.size,
                "font-size": this.labelSize,
                "fill": this.labelColor,
                'network-type': 'vertex-label'
            });
            var label = this.vertex.id;
            if ($.type(this.labelText) === 'string' && this.labelText.length > 0) {
                label = this.labelText;
            }
            vertexText.textContent = label;
        }
        this.el = vertexSvg;
        this.groupEl = groupSvg;
        this.vertexEl = ellipse;
        this.labelEl = vertexText;
        this.targetEl.appendChild(vertexSvg);
    },
    _updateEllipseSize: function () {

        var o = this._calculateOffset();
        this.el.setAttribute('x', this.coords.x - o.midOffset);
        this.el.setAttribute('y', this.coords.y - o.midOffset);

        this.vertexEl.setAttribute('stroke-width', this.strokeSize);
        this.vertexEl.setAttribute('cx', o.midOffset);
        this.vertexEl.setAttribute('cy', o.midOffset);
        this.vertexEl.setAttribute('rx', this.size / 1.7);
        this.vertexEl.setAttribute('ry', this.size / 2.5);

        if (this.labelSize > 0) {
            this.labelEl.setAttribute('y', this.labelSize + o.size);
        }
        if (this.selected) {
            this._updateSelectShapeSize(o);
        }
    },
    /* END ELLIPSE METHODS */

    /** SQUARE METHODS **/
    _drawSquareShape: function () {

        var o = this._calculateOffset();

        var vertexSvg = SVG.create("svg", {
            "id": this.vertex.id,
            "cursor": "pointer",
            x: this.coords.x - o.midOffset,
            y: this.coords.y - o.midOffset,
            'network-type': 'vertex-svg'
        });
        var groupSvg = SVG.addChild(vertexSvg, 'g', {
            opacity: this.opacity
        });
        var rect = SVG.addChild(groupSvg, 'rect', {
            x: o.midOffset - this.size / 2,
            y: o.midOffset - this.size / 2,
            width: this.size,
            height: this.size,
            stroke: this.strokeColor,
            'stroke-width': this.strokeSize,
            fill: this.color,
            'network-type': 'vertex'
        });
        if (this.labelSize > 0) {
            var vertexText = SVG.addChild(vertexSvg, "text", {
                "x": 5,
                "y": this.labelSize + o.size,
                "font-size": this.labelSize,
                "fill": this.labelColor,
                'network-type': 'vertex-label'
            });
            var label = this.vertex.id;
            if ($.type(this.labelText) === 'string' && this.labelText.length > 0) {
                label = this.labelText;
            }
            vertexText.textContent = label;
        }
        this.el = vertexSvg;
        this.groupEl = groupSvg;
        this.vertexEl = rect;
        this.labelEl = vertexText;
        this.targetEl.appendChild(vertexSvg);
    },
    _updateSquareSize: function () {

        var o = this._calculateOffset();
        this.el.setAttribute('x', this.coords.x - o.midOffset);
        this.el.setAttribute('y', this.coords.y - o.midOffset);

        this.vertexEl.setAttribute('stroke-width', this.strokeSize);
        this.vertexEl.setAttribute('x', o.midOffset - this.size / 2);
        this.vertexEl.setAttribute('y', o.midOffset - this.size / 2);
        this.vertexEl.setAttribute('width', this.size);
        this.vertexEl.setAttribute('height', this.size);

        if (this.labelSize > 0) {
            this.labelEl.setAttribute('y', this.labelSize + o.size);
        }
        if (this.selected) {
            this._updateSelectShapeSize(o);
        }
    },
    /* END SQUARE METHODS */

    /** RECTANGLE METHODS **/
    _drawRectangleShape: function () {

        var size = this.size + this.strokeSize;
        var size = size + (size * 0.3);
        var midOffset = size / 2;

        var o = this._calculateOffset();

        var s1 = (this.size * 0.3);
        var s2 = s1 / 2;

        var vertexSvg = SVG.create("svg", {
            "id": this.vertex.id,
            "cursor": "pointer",
            x: this.coords.x - o.midOffset,
            y: this.coords.y - o.midOffset,
            'network-type': 'vertex-svg'
        });
        var groupSvg = SVG.addChild(vertexSvg, 'g', {
            opacity: this.opacity
        });
        var rect = SVG.addChild(groupSvg, 'rect', {
            x: o.midOffset - this.size / 2 - s2,
            y: o.midOffset - this.size / 2 + s2,
            width: this.size + s1,
            height: this.size - s1,
            stroke: this.strokeColor,
            'stroke-width': this.strokeSize,
            fill: this.color,
            'network-type': 'vertex'
        });
        if (this.labelSize > 0) {
            var vertexText = SVG.addChild(vertexSvg, "text", {
                "x": 5,
                "y": this.labelSize + o.size,
                "font-size": this.labelSize,
                "fill": this.labelColor,
                'network-type': 'vertex-label'
            });
            var label = this.vertex.id;
            if ($.type(this.labelText) === 'string' && this.labelText.length > 0) {
                label = this.labelText;
            }
            vertexText.textContent = label;
        }
        this.el = vertexSvg;
        this.groupEl = groupSvg;
        this.vertexEl = rect;
        this.labelEl = vertexText;
        this.targetEl.appendChild(vertexSvg);
    },
    _updateRectangleSize: function () {

        var o = this._calculateOffset();
        var s1 = (this.size * 0.3);
        var s2 = s1 / 2;

        this.el.setAttribute('x', this.coords.x - o.midOffset);
        this.el.setAttribute('y', this.coords.y - o.midOffset);

        this.vertexEl.setAttribute('stroke-width', this.strokeSize);
        this.vertexEl.setAttribute('x', o.midOffset - this.size / 2 - s2);
        this.vertexEl.setAttribute('y', o.midOffset - this.size / 2 + s2);
        this.vertexEl.setAttribute('width', this.size + s1);
        this.vertexEl.setAttribute('height', this.size - s1);

        if (this.labelSize > 0) {
            this.labelEl.setAttribute('y', this.labelSize + o.size);
        }
        if (this.selected) {
            this._updateSelectShapeSize(o);
        }
    },
    /* END RECTANGLE METHODS */

    _drawSelectCircleShape: function () {
        var attr = this._calculateOffset();
        this.selectEl = SVG.addChild(this.el, "circle", {
            r: attr.midOffset,
            cx: attr.midOffset,
            cy: attr.midOffset,
            opacity: '0.5',
            fill: '#555555',
            'network-type': 'select-vertex'
        }, 0);
    },
    _updateSelectShapeSize: function (o) {
        this.selectEl.setAttribute('r', o.midOffset);
        this.selectEl.setAttribute('cx', o.midOffset);
        this.selectEl.setAttribute('cy', o.midOffset);
    },
    _drawSelectEllipseShape: function () {
        //TODO
        this._drawSelectCircleShape();
    },
    _drawSelectSquareShape: function () {
        //TODO
        this._drawSelectCircleShape();
    },
    _drawSelectRectangleShape: function () {
        //TODO
        this._drawSelectCircleShape();
    },
    toJSON: function () {
        return {
            shape: this.shape,
            size: this.size,
            color: this.color,
            strokeSize: this.strokeSize,
            strokeColor: this.strokeColor,
            opacity: this.opacity,
            labelSize: this.labelSize,
            labelColor: this.labelColor,
            labelText :this.labelText
        };
    }
}
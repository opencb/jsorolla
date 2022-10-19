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

export const SVG = {
    create(elementName, attributes) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", elementName);
        Object.keys(attributes || {}).forEach(key => {
            el.setAttribute(key, attributes[key]);
        });
        return el;
    },

    addChild(parent, elementName, attributes, index) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", elementName);
        Object.keys(attributes || {}).forEach(key => {
            el.setAttribute(key, attributes[key]);
        });
        return this._insert(parent, el, index);
    },

    addChildText(parent, text, attributes) {
        const el = this.addChild(parent, "text", attributes);
        el.innerHTML = text;
        return el;
    },

    addChildImage(parent, attributes, index) {
        const el = document.createElementNS("http://www.w3.org/2000/svg", "image");
        Object.keys(attributes || {}).forEach(key => {
            if (key == "xlink:href") {
                el.setAttributeNS("http://www.w3.org/1999/xlink", "href", attributes[key]);
            } else {
                el.setAttribute(key, attributes[key]);
            }
        });
        return this._insert(parent, el, index);
    },

    _insert(parent, el, index) {
        // insert child at requested index, or as last child if index is too high or no index is specified
        if (typeof index !== "number") {
            parent.appendChild(el);
        } else {
            const targetIndex = index === 0 ? 0 : index + 1;
            const targetEl = parent.childNodes[targetIndex];
            if (targetEl) {
                parent.insertBefore(el, targetEl);
            } else {
                parent.appendChild(el);
            }
        }
        return el;
    },

    init(parent, attributes) {
        return this.addChild(parent, "svg", attributes);
    },

    //
    // Functions to generate arcs with PATH element
    //

    _polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians)),
        };
    },

    describeArc(x, y, radius, startAngle, endAngle) {
        const start = this._polarToCartesian(x, y, radius, endAngle);
        const end = this._polarToCartesian(x, y, radius, startAngle);

        const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
        const d = [
            "M", start.x, start.y,
            "A", radius, radius, 0, arcSweep, 0, end.x, end.y,
        ];

        return d.join(" ");
    },
};

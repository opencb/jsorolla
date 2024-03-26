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

    init(parent, attributes, index) {
        return this.addChild(parent, "svg", attributes, index);
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

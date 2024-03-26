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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";


export default class Pedigree2 extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            family: {
                type: Object
            },
            active: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sf-" + UtilsNew.randomString(6) + "_";
        this._results = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if ((changedProperties.has("family") || changedProperties.has("active") || changedProperties.has("opencgaSession")) /* && this.active*/) {
            this.pedigree();
        }
    }

    getNode(id) {
        return this.family.find(i => i.id === id);
    }

    getParents(node) {
        return node.father.id || node.mother.id ? [node.father.id, node.mother.id] : null;
    }

    getChildren(node) {
        const role = node.sex === "MALE" ? "father" : "mother";
        return this.family.filter(i => i[role].id === node.id);
    }

    getPartners(node) {
        const children = this.getChildren(node);
        const partnerRole = node.sex === "MALE" ? "mother" : "father";
        // .filter(Boolean) filters out undefined values: in case of `node` has children with unknown partner
        const partners = [...new Set(children.map(i => i[partnerRole].id).filter(Boolean))];
        if (partners.length > 1) console.warn(node.id, "has more than 1 partner!", partners);
        return partners.map(el => this.getNode(el));
    }

    hasParents(node) {
        return node.father.id && node.mother.id;
    }

    hasParentsInPool(node, array) {
        const [father, mother] = [array.find(i => i.id === node.father.id), array.find(i => i.id === node.mother.id)];
        return father || mother;
    }

    insertNode(element, index, array) {
        // NOTE this works fine in corner cases too (meaning, in case of index >= array.length).
        return [...array.slice(0, index), element, ...array.slice(index)];
    }

    removeNodes(ids, array) {
        return array.filter(el => !ids.includes(el.id));
    }

    im_sort(array, fn) {
        return [...array].sort(fn);
    }

    sortBySexAndAge(array) {
        return [...array].sort((a, b) => {
            if (a.sex === "MALE" && b.sex === "MALE") {
                // older first
                return b.age - a.age;
            }
            // MALE first and then FEMALE (on sex string length)
            return a.sex.length - b.sex.length;
        });
    }

    sortByAge(array) {
        // older first
        return [...array].sort((a, b) => b.age - a.age);
    }

    sortByPartner(array) {
        return [...array].sort((a, b) => {
            if (a.id === b?.partner?.id) {
                return a.sex === "MALE" ? -1 : 1;
            }
        });
    }

    /**
     * Counts the parents in common between the nodes a and b
     * @param a
     * @param b
     * @returns The number of common parents
     */
    haveSameParents(a, b) {
        // console.log([...new Set(getParents(a))], [...new Set(getParents(b))])
        const parentsA = this.getParents(a).filter(Boolean);
        const parentsB = this.getParents(b).filter(Boolean);
        const commonParents = parentsA.filter(n => ~parentsB.indexOf(n));
        return commonParents.length;
    }

    /**
     * Sort the array taking into account the order of the nodes in the previous generation.
     * It keeps consistent the order of the parents against their children.
     * It also move orphan nodes close to their first partner.
     * @param {Array} array
     * @param {Array} previousGeneration List of nodes in the previous generation
     * @returns {Array} sorted
     */
    sortChildren(array, previousGeneration) {
        if (!previousGeneration) return array; // root generation

        // criteria
        // - node with same parents close to each other
        // - partners close to each other
        // - node with common parents
        // - node with 1 parent in common
        // - age?

        // TODO NOTE not both parents are necessarily in the previous generation!

        // this is the children list taken from the previous generation.
        // It is flatten to replicate the order of the previous generation (the parents) to the current generation (the children).
        const childs = [...new Set(previousGeneration.individuals.flatMap(ind => ind.children.map(_ => _.id)))];

        // 1. sort by same parents
        let sorted = [...array].sort((a, b) => {
            const aPos = childs.indexOf(a.id);
            const bPos = childs.indexOf(b.id);
            if (aPos > 0 && bPos === -1) return -1;
            if (aPos === -1 && bPos > 0) return 1;
            if (aPos === -1 && bPos === -1) return 1;
            return aPos - bPos;
        });

        // 2. move partners close to each other
        const res = [];
        // NOTE it mutates `sorted` array while iterating over it.
        sorted.forEach(node => {
            const partners = this.getPartners(node);
            // looking for orphan nodes
            if (!this.hasParents(node) && partners.length) {
                // moving the orphan node after its FIRST partner
                const partnerIndex = sorted.findIndex(ind => ind.id === partners[0].id);
                // console.log(node, partnerIndex)
                sorted = this.removeNodes(node.id, sorted);
                sorted = this.insertNode(node, partnerIndex + 1, sorted);
            }
        });

        return sorted;
    }


    /**
     * Sort the array by partner (partners close to each other), then sex (male first) then age (older first)
     * @param {Array} array
     * @returns {Array} sorted
     */
    sortRootGeneration(array) {
        // criteria
        // 1. partners close to each other
        // 2. sort by sex
        // 3. sort by age
        let unsorted = this.sortByAge(array); // to make sure the first selected is the oldest here `const node = unsorted[0]`
        const sorted = [];
        while (unsorted.length) {
            const node = unsorted[0];
            // add to sorted array the node `node` and its partners, sorted by Sex and then Age
            sorted.push(...this.sortBySexAndAge([node, ...this.getPartners(node)]));
            // remove the nodes from the unsorted pool
            unsorted = this.removeNodes([node, ...this.getPartners(node)].map(node => node.id), unsorted);
        }
        return sorted;
    }

    /**
     * The following code builds the final data-structure.
     *  The algorithm follow a simple rule to assign a node to a generation:
     *  a node is in the root generation iff it and its partners have no parents.
     *  If we use a pool of individuals in which we delete nodes as soon as we add them in the final structure,
     *  the rule is valid for all generations.
     **/
    preprocess() {
        const generations = []; // init root level
        let generationCnt = 0;

        // sortRootGeneration() sorts by the root generation criterion only (older-male first).
        // We here preprocess the whole pool to make sure the root generation nodes are at the first positions, and they are already sorted.
        // This is also useful for the sorting of the subsequent generations, partners must be close to each other in any case.
        let individualsPool = this.sortRootGeneration(this.family);

        while (individualsPool.length) {
            // console.log("generationCnt", generationCnt)
            const generationNodes = [];
            for (let i = 0; i < individualsPool.length; i++) {
                const node = individualsPool[i];
                const partners = this.getPartners(node); // NOTE getPartners() search in the original family, not in the pool.
                const hasSomePartnerInPool = partners.some(n => this.hasParentsInPool(n, individualsPool));
                if (!this.hasParentsInPool(node, individualsPool) && (!partners.length || !hasSomePartnerInPool)) {
                    generationNodes.push({
                        ...node,
                        partners: partners.map(p => ({id: p.id})),
                        children: this.sortByAge(this.getChildren(node))
                    });
                }
            }
            generations[generationCnt] = {
                id: generationCnt,
                individuals: this.sortChildren(generationNodes, generations[generationCnt - 1])
            };
            generationCnt++;
            individualsPool = this.removeNodes(generationNodes.map(_ => _.id), individualsPool);
            // if (generationCnt == 2) break
        }

        console.log(generations);

        this.pedigree = generations;
    }

    pedigree() {
        this.preprocess();

        this.boardHeight = 500; // TODO temp value
        this._config.board.width = this._config.board.width || this.querySelector(`#${this._prefix}pedigree`).clientWidth;

        this.svg = SVG().addTo(`#${this._prefix}pedigree`).size(this._config.board.width, this.boardHeight).attr({style: "border: 1px solid #cacaca"});
        this.rect = this.svg.rect(this._config.board.width, this.boardHeight).attr({fill: "#fefefe", x: this._config.board.originX, y: this._config.board.originY});

        this.draw = this.svg.group();

        this.gridCols = Math.max(...this.pedigree.map(g => g.individuals.length));
        this.gridRows = this.pedigree.length;
        let col = 0;
        let row = 0;
        this.pedigree.forEach(generation => {
            col = 0;
            generation.individuals.forEach(individual => {
                const pos = this.dynamicGridToPx(row, col, generation.individuals.length);
                console.log(pos);
                this.drawNode(individual, pos);
                col++;
            });
            row++;
        });


    }

    drawNode(node, pos) {
        if (node.sex === "MALE") {
            this.draw.rect({id: "node" + node.id, width: this._config.nodeSize, height: this._config.nodeSize, fill: "#fff", stroke: "black", x: pos.x, y: pos.y});
        }
        if (node.sex === "FEMALE") {
            this.draw.circle({id: "node" + node.id, r: this._config.nodeSize / 2, fill: "#fff", stroke: "black", cx: pos.x + this._config.nodeSize / 2, cy: pos.y + this._config.nodeSize / 2});
        }
        this.draw.text(node.id).attr({dominantBaseline: "middle", textAnchor: "middle"}).dy(pos.y + this._config.nodeSize).dx(pos.x + this._config.nodeSize/2 * .8);
    }

    dynamicGridToPx(row, col, totalCols) {
        console.log(totalCols);
        const colWidth = this._config.board.width / totalCols;
        const x = this.rescale_linear(col, 0, totalCols, colWidth / 2, this._config.board.width);
        const y = this.rescale_linear(row, 0, this.gridRows, 0, this.boardHeight);
        return {x, y};
    }

    gridToPx(row, col) {
        const x = this.rescale_linear(col, 0, this.gridCols, 0, this._config.board.width);
        const y = this.rescale_linear(row, 0, this.gridRows, 0, this.boardHeight);
        return {x, y};
    }

    // min-max normalization
    rescale_linear(value, oldMin, oldMax, newMin, newMax) {
        const oldRange = oldMax - oldMin;
        const newRange = newMax - newMin;
        const rescaled = newMin + ((value - oldMin) * newRange / oldRange);
        return Math.round(rescaled);
    }

    getDefaultConfig() {
        return {
            lineHeight: 50,
            nodeSize: 50,
            edgeSize: 2,
            board: {
                width: 0, // it can a number (px) or "auto" (full width)
                height: 0, // height is dynamic on the number of tracks
                padding: 50,
                originX: 0,
                originY: 0
            }
        };
    }

    render() {
        return html`
        <div id="${this._prefix}pedigree">
        </div>
        `;
    }

}

customElements.define("pedigree-2", Pedigree2);

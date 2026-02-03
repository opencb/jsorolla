/*
 * Copyright 2015-2016 OpenCB
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

import UtilsNew from "../utils-new.js";
import {SVG} from "../svg.js";


export default class Pedigree {

    constructor(pedigree, settings) {
        this.pedigree = pedigree;
        this.settings = settings;

        // Interaction modes
        this._modes = {
            VIEW: "view",
            DRAG: "drag",
            ADD_MARRIAGE: "add_marriage",
            ADD_CHILD: "add_child"
        };
        this._currentMode = this._modes.VIEW;
        this._selectedIndividuals = [];
    }

    isDuo() {
        return (typeof this.pedigree.father !== "undefined" || typeof this.pedigree.mother !== "undefined")
            && typeof this.pedigree.children !== "undefined" && this.pedigree.children.length === 1;
    }

    isTrio() {
        return typeof this.pedigree.father !== "undefined" && typeof this.pedigree.mother !== "undefined"
            && typeof this.pedigree.children !== "undefined" && this.pedigree.children.length === 1;
    }

    isFamily() {
        return typeof this.pedigree.father !== "undefined" && typeof this.pedigree.mother !== "undefined"
            && typeof this.pedigree.children !== "undefined" && this.pedigree.children.length > 1;
    }

    render(settings) {
        return this._render(this.pedigree, settings);
    }

    renderPedigree(pedigree, settings = null) {
        // Use provided pedigree or fall back to instance pedigree
        return this._render(pedigree || this.pedigree, settings);
    }

    _render(ped, set) {
        // We merge user"s setting with default settings, by doing this users do not have to write al possible settings
        const settings = {...this.getDefaultSetting(), ...this.settings, ...set};

        const pedigree = this._preprocessFamily(ped);

        // Store processed pedigree for interactive features
        this.pedigree = pedigree;

        const svg = SVG.create("svg", {
            width: settings.width,
            height: settings.height,
            viewBox: "0 0 " + settings.width + " " + settings.height,
            style: "fill: white",
            xmlns: "http://www.w3.org/2000/svg"
        });

        if (settings.border) {
            SVG.addChild(svg, "rect", {width: settings.width, height: settings.height, style: "fill: white;stroke: black"});
        }

        svg.appendChild(this._createSvgDefs(pedigree, settings));

        const radius = settings.box / 2;

        // Assign generations and calculate layout
        const maxGeneration = this._assignGenerations(pedigree.members);
        this._calculateMultiGenerationLayout(pedigree.members, pedigree.marriages, settings);

        // Create a member map for quick lookup
        const memberMap = new Map();
        pedigree.members.forEach(m => memberMap.set(m.id, m));

        // Draw marriage lines
        pedigree.marriages.forEach(marriage => {
            const p1 = memberMap.get(marriage.partner1);
            const p2 = memberMap.get(marriage.partner2);

            if (p1 && p2 && p1.position && p2.position) {
                const x1 = p1.position.x;
                const y1 = p1.position.y + radius;
                const x2 = p2.position.x;
                const y2 = p2.position.y + radius;

                // Draw marriage line(s)
                if (marriage.consanguinity) {
                    const offset = 2;
                    SVG.addChild(svg, "line", {
                        x1: x1, y1: y1 - offset,
                        x2: x2, y2: y2 - offset,
                        style: "stroke: black;stroke-width: 2"
                    });
                    SVG.addChild(svg, "line", {
                        x1: x1, y1: y1 + offset,
                        x2: x2, y2: y2 + offset,
                        style: "stroke: black;stroke-width: 2"
                    });
                } else {
                    SVG.addChild(svg, "line", {
                        x1: x1, y1: y1,
                        x2: x2, y2: y2,
                        style: "stroke: black;stroke-width: 2"
                    });
                }

                // Draw vertical line to children if any
                if (marriage.children && marriage.children.length > 0) {
                    const marriageCenterX = (x1 + x2) / 2;
                    const marriageY = (y1 + y2) / 2;  // Use midpoint Y when partners at different heights

                    // If multiple children, draw horizontal bar
                    if (marriage.children.length > 1) {
                        const children = marriage.children.map(id => memberMap.get(id)).filter(c => c);
                        if (children.length > 1) {
                            // Check if all children are twins (same twinGroup)
                            const firstChild = children[0];
                            const allTwins = firstChild.twinGroup && children.every(c => c.twinGroup === firstChild.twinGroup);

                            // If they"re all twins, skip the sibship bar (twin connection will be drawn instead)
                            if (!allTwins) {
                                const childrenY = marriageY + (settings.verticalSpacing / 2);

                                // Vertical line from marriage to horizontal bar
                                SVG.addChild(svg, "line", {
                                    x1: marriageCenterX, y1: marriageY,
                                    x2: marriageCenterX, y2: childrenY,
                                    style: "stroke: black;stroke-width: 2"
                                });

                                const childrenX = children.map(c => c.position.x);
                                const minX = Math.min(...childrenX);
                                const maxX = Math.max(...childrenX);

                                // Horizontal bar connecting siblings
                                SVG.addChild(svg, "line", {
                                    x1: minX, y1: childrenY,
                                    x2: maxX, y2: childrenY,
                                    style: "stroke: black;stroke-width: 2"
                                });

                                // Vertical lines from bar to each child
                                children.forEach(child => {
                                    // Adjust endpoint to stop at stroke edge
                                    const lineEndY = child.position.y - 1;

                                    SVG.addChild(svg, "line", {
                                        x1: child.position.x, y1: childrenY,
                                        x2: child.position.x, y2: lineEndY,
                                        style: "stroke: black;stroke-width: 2"
                                    });
                                });
                            } else {
                                // All children are twins - draw direct line from marriage to twin connection point
                                // Twin connection point is at child.y - 15 and midpoint between twins" X positions (see _drawTwinConnection)
                                const twinConnectY = children[0].position.y - 15;
                                const twinMidX = (children[0].position.x + children[1].position.x) / 2;

                                SVG.addChild(svg, "line", {
                                    x1: twinMidX, y1: marriageY,
                                    x2: twinMidX, y2: twinConnectY,
                                    style: "stroke: black;stroke-width: 2"
                                });
                            }
                        }
                    } else if (marriage.children.length === 1) {
                        // For single child, draw direct line from marriage to child
                        const child = memberMap.get(marriage.children[0]);
                        if (child && child.position) {
                            // Adjust endpoint to stop at stroke edge (stroke-width is 2, so 1px on each side)
                            const lineEndY = child.position.y - 1;

                            // Draw line directly from marriage to top of child symbol
                            SVG.addChild(svg, "line", {
                                x1: marriageCenterX, y1: marriageY,
                                x2: child.position.x, y2: lineEndY,
                                style: "stroke: black;stroke-width: 2"
                            });
                        }
                    }
                }
            }
        });

        // Draw all family members
        pedigree.members.forEach(member => {
            this._addFamilyMember(member, member.position.x, member.position.y, settings.box, radius, settings.showNames, svg);
        });

        // Draw twin connections
        const twinGroups = new Map();
        pedigree.members.forEach(member => {
            if (member.twinGroup) {
                if (!twinGroups.has(member.twinGroup)) {
                    twinGroups.set(member.twinGroup, []);
                }
                twinGroups.get(member.twinGroup).push(member);
            }
        });

        twinGroups.forEach((twins, groupId) => {
            if (twins.length === 2) {
                const twinType = twins[0].twinType || "DIZYGOTIC";
                this._drawTwinConnection(twins[0], twins[1], twinType, svg, settings);
            }
        });

        // Store reference for potential updates
        this.currentSVG = svg;

        // Initialize interactivity if enabled
        this._initInteractivity(svg, settings);

        // Draw disorder legend if there are disorders
        if (pedigree.disorders && pedigree.disorders.length > 0) {
            this._drawDisorderLegend(pedigree, svg, settings);
        }

        return svg;
    }

    /**
     * Set interaction mode
     */
    setMode(mode) {
        this._currentMode = mode;
        this._clearSelection();

        // Update cursor styles based on mode
        if (this.currentSVG) {
            const elements = this.currentSVG.querySelectorAll("[data-individual-id]");
            elements.forEach(element => {
                if (mode === this._modes.ADD_MARRIAGE) {
                    element.style.cursor = "pointer";
                } else if (mode === this._modes.DRAG) {
                    element.style.cursor = "grab";
                } else {
                    element.style.cursor = "default";
                }
            });
        }

        // Emit mode changed event
        if (this.currentSVG) {
            const event = new CustomEvent("pedigree:modeChanged", {
                detail: { mode },
                bubbles: true
            });
            this.currentSVG.dispatchEvent(event);
        }
    }

    /**
     * Clear selection
     */
    _clearSelection() {
        this._selectedIndividuals = [];
        if (this.currentSVG) {
            const elements = this.currentSVG.querySelectorAll(".selected");
            elements.forEach(el => el.classList.remove("selected"));
        }
    }

    /**
     * Enable marriage creation workflow
     */
    _enableMarriageCreation(svg) {
        const elements = svg.querySelectorAll("[data-individual-id]");
        elements.forEach(element => {
            element.addEventListener("click", (e) => {
                if (this._currentMode !== this._modes.ADD_MARRIAGE) return;

                const individualId = element.getAttribute("data-individual-id");
                const individual = this.pedigree.members.find(m => m.id === individualId);

                if (!individual) return;

                // First selection
                if (this._selectedIndividuals.length === 0) {
                    this._selectedIndividuals.push(individual);
                    element.classList.add("selected");
                    element.style.opacity = "0.7";
                }

                // Second selection - create marriage
                else if (this._selectedIndividuals.length === 1) {
                    const partner1 = this._selectedIndividuals[0];
                    const partner2 = individual;

                    // Validate marriage
                    if (this._validateMarriage(partner1, partner2)) {
                        this._createMarriage(partner1.id, partner2.id, svg);
                        this._clearSelection();
                        // Reset mode after successful creation
                        this.setMode(this._modes.VIEW);
                    } else {
                        console.error("Invalid marriage: partners must be same generation, not parent-child, and not already married");
                        this._clearSelection();
                    }
                }
            });
        });
    }

    /**
     * Validate marriage between two individuals
     */
    _validateMarriage(p1, p2) {
        // Check same generation
        if (p1.generation !== p2.generation) {
            return false;
        }

        // Check not parent-child relationship
        // After preprocessing, father/mother are ID strings
        if (p1.father === p2.id || p1.mother === p2.id ||
            p2.father === p1.id || p2.mother === p1.id) {
            return false;
        }

        // Check not already married
        const existingMarriage = this.pedigree.marriages.find(m =>
            (m.partner1 === p1.id && m.partner2 === p2.id) ||
            (m.partner1 === p2.id && m.partner2 === p1.id)
        );

        return !existingMarriage;
    }

    /**
     * Create a new marriage
     */
    _createMarriage(partner1Id, partner2Id, svg) {
        const marriage = {
            id: `marriage-${this.pedigree.marriages.length + 1}`,
            partner1: partner1Id,
            partner2: partner2Id,
            consanguinity: false,
            separated: false,
            children: [],
            position: { x: 0, y: 0 }
        };

        this.pedigree.marriages.push(marriage);

        // Redraw marriage line
        const settings = {...this.getDefaultSetting(), ...this.settings};
        this._positionMarriages(this.pedigree.members, this.pedigree.marriages, settings);
        this._drawMarriageLine(marriage, svg, settings);

        // Emit data changed event
        this._emitDataChanged();
    }

    /**
     * Draw a marriage line
     */
    _drawMarriageLine(marriage, svg, settings) {
        const memberMap = new Map();
        this.pedigree.members.forEach(m => memberMap.set(m.id, m));

        const p1 = memberMap.get(marriage.partner1);
        const p2 = memberMap.get(marriage.partner2);

        if (p1 && p2 && p1.position && p2.position) {
            const radius = settings.box / 2;
            const x1 = p1.position.x;
            const y1 = p1.position.y + radius;
            const x2 = p2.position.x;
            const y2 = p2.position.y + radius;

            // Draw marriage line(s)
            if (marriage.consanguinity) {
                const offset = 2;
                SVG.addChild(svg, "line", {
                    x1: x1, y1: y1 - offset,
                    x2: x2, y2: y2 - offset,
                    style: "stroke: black;stroke-width: 2",
                    "data-marriage-id": marriage.id
                });
                SVG.addChild(svg, "line", {
                    x1: x1, y1: y1 + offset,
                    x2: x2, y2: y2 + offset,
                    style: "stroke: black;stroke-width: 2",
                    "data-marriage-id": marriage.id
                });
            } else {
                SVG.addChild(svg, "line", {
                    x1: x1, y1: y1,
                    x2: x2, y2: y2,
                    style: "stroke: black;stroke-width: 2",
                    "data-marriage-id": marriage.id
                });
            }
        }
    }

    /**
     * Emit data changed event
     */
    _emitDataChanged() {
        if (this.currentSVG) {
            const event = new CustomEvent("pedigree:dataChanged", {
                detail: { family: this.pedigree },
                bubbles: true
            });
            this.currentSVG.dispatchEvent(event);
        }
    }

    /**
     * Initialize interactivity for dragging individuals
     */
    _initInteractivity(svg, settings) {
        if (!settings.interactive) {
            return;
        }

        const elements = svg.querySelectorAll("[data-individual-id]");
        const handler = this._createMouseDownHandler(svg, settings);

        elements.forEach(element => {
            element.style.cursor = "grab";
            element.addEventListener("mousedown", handler);
        });

        // Enable marriage creation
        this._enableMarriageCreation(svg);
    }

    /**
     * Create mouse down handler for drag functionality
     */
    _createMouseDownHandler(svg, settings) {
        let draggedElement = null;
        let draggedIndividual = null;
        let offset = { x: 0, y: 0 };

        const handleMouseDown = (e) => {
            // Only handle drag in drag mode
            if (this._currentMode !== this._modes.DRAG) {
                return;
            }

            e.preventDefault();
            draggedElement = e.currentTarget;
            const individualId = draggedElement.getAttribute("data-individual-id");

            // Find the individual in the pedigree data
            draggedIndividual = this.pedigree.members.find(m => m.id === individualId);
            if (!draggedIndividual) return;

            // Get current transform
            const transform = draggedElement.getAttribute("transform");
            const match = transform.match(/translate\(([\d.]+),\s*([\d.]+)\)/);
            if (match) {
                const currentX = parseFloat(match[1]);
                const currentY = parseFloat(match[2]);
                offset.x = e.clientX - currentX;
                offset.y = e.clientY - currentY;
            }

            // Visual feedback
            draggedElement.style.cursor = "grabbing";

            // Show generation track guides
            this._showGenerationGuides(svg, settings);

            // Attach global listeners
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        };

        const handleMouseMove = (e) => {
            if (!draggedElement || !draggedIndividual) return;

            const newX = e.clientX - offset.x;
            const newY = e.clientY - offset.y;

            // Update position
            this._updateIndividualPosition(draggedElement, draggedIndividual, newX, newY, svg, settings);
        };

        const handleMouseUp = (e) => {
            if (!draggedElement || !draggedIndividual) return;

            // Restore visual state
            draggedElement.style.cursor = "grab";

            // Hide generation track guides
            this._hideGenerationGuides(svg);

            // Ensure position object exists
            if (!draggedIndividual.position) {
                draggedIndividual.position = { x: 0, y: 0, manuallyPositioned: false };
            }

            // Mark as manually positioned
            draggedIndividual.position.manuallyPositioned = true;

            // Emit position changed event
            this._emitPositionChanged(draggedIndividual);

            // Remove global listeners
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);

            draggedElement = null;
            draggedIndividual = null;
        };

        return handleMouseDown;
    }

    /**
     * Show generation track guide lines during dragging
     */
    _showGenerationGuides(svg, settings) {
        // Remove any existing guides first
        this._hideGenerationGuides(svg);

        const tracks = this._getGenerationTracks(settings);
        const guideGroup = SVG.addChild(svg, "g", {
            id: "generation-guides",
            class: "generation-guides"
        });

        tracks.forEach(track => {
            // Draw horizontal guide line
            SVG.addChild(guideGroup, "line", {
                x1: 0,
                y1: track.y,
                x2: settings.width,
                y2: track.y,
                style: "stroke: #2196F3; stroke-width: 1; stroke-dasharray: 5,5; opacity: 0.5"
            });

            // Draw generation label
            SVG.addChild(guideGroup, "text", {
                x: 10,
                y: track.y - 5,
                style: "fill: #2196F3; font-size: 12px; font-weight: bold"
            }).textContent = `Gen ${track.generation}`;
        });
    }

    /**
     * Hide generation track guide lines
     */
    _hideGenerationGuides(svg) {
        const guides = svg.querySelector("#generation-guides");
        if (guides) {
            guides.remove();
        }
    }

    /**
     * Calculate generation track Y positions
     */
    _getGenerationTracks(settings) {
        const maxGeneration = Math.max(...this.pedigree.members.map(m => m.generation || 0));
        const tracks = [];

        for (let gen = 0; gen <= maxGeneration; gen++) {
            tracks.push({
                generation: gen,
                y: settings.topMargin + (gen * settings.verticalSpacing)
            });
        }

        return tracks;
    }

    /**
     * Snap Y position to nearest generation track
     */
    _snapToGenerationTrack(y, settings) {
        const tracks = this._getGenerationTracks(settings);

        // Find nearest track
        let nearestTrack = tracks[0];
        let minDistance = Math.abs(y - tracks[0].y);

        tracks.forEach(track => {
            const distance = Math.abs(y - track.y);
            if (distance < minDistance) {
                minDistance = distance;
                nearestTrack = track;
            }
        });

        return nearestTrack;
    }

    /**
     * Update individual position in SVG
     */
    _updateIndividualPosition(element, individual, x, y, svg, settings) {
        // Ensure position object exists
        if (!individual.position) {
            individual.position = { x: 0, y: 0, manuallyPositioned: false };
        }

        // Snap Y to nearest generation track
        const track = this._snapToGenerationTrack(y, settings);
        const snappedY = track.y;

        // Update generation if moved to different track
        if (individual.generation !== track.generation) {
            console.log(`Moving ${individual.name || individual.id} from generation ${individual.generation} to ${track.generation}`);
            individual.generation = track.generation;
        }

        // Update data model (X is free, Y is snapped)
        individual.position.x = x;
        individual.position.y = snappedY;

        // Update SVG transform
        element.setAttribute("transform", `translate(${x}, ${snappedY})`);

        // Redraw connections
        this._redrawConnections(individual, svg, settings);
    }

    /**
     * Redraw connection lines for an individual
     */
    _redrawConnections(individual, svg, settings) {
        // Remove old connection lines and redraw
        // For now, we"ll do a full re-render of connections
        // A more efficient approach would be to selectively update lines

        // Find ONLY connection lines (not lines inside individual groups like deceased indicators)
        // Connection lines are direct children of SVG, not inside groups
        const lines = svg.querySelectorAll(":scope > line");
        lines.forEach(line => line.remove());

        // Redraw all connections using the updated positions
        const radius = settings.box / 2;
        const memberMap = new Map();
        this.pedigree.members.forEach(m => memberMap.set(m.id, m));

        // Redraw marriage lines
        this.pedigree.marriages.forEach(marriage => {
            const p1 = memberMap.get(marriage.partner1);
            const p2 = memberMap.get(marriage.partner2);

            if (p1 && p2 && p1.position && p2.position) {
                const x1 = p1.position.x;
                const y1 = p1.position.y + radius;
                const x2 = p2.position.x;
                const y2 = p2.position.y + radius;

                // Draw marriage line(s)
                if (marriage.consanguinity) {
                    const offset = 2;
                    SVG.addChild(svg, "line", {
                        x1: x1, y1: y1 - offset,
                        x2: x2, y2: y2 - offset,
                        style: "stroke: black;stroke-width: 2"
                    }, 0);
                    SVG.addChild(svg, "line", {
                        x1: x1, y1: y1 + offset,
                        x2: x2, y2: y2 + offset,
                        style: "stroke: black;stroke-width: 2"
                    }, 0);
                } else {
                    SVG.addChild(svg, "line", {
                        x1: x1, y1: y1,
                        x2: x2, y2: y2,
                        style: "stroke: black;stroke-width: 2"
                    }, 0);
                }

                // Draw vertical line to children if any
                if (marriage.children && marriage.children.length > 0) {
                    const marriageCenterX = (x1 + x2) / 2;
                    const marriageY = (y1 + y2) / 2;  // Use midpoint Y when partners at different heights

                    // If multiple children, draw horizontal bar
                    if (marriage.children.length > 1) {
                        const children = marriage.children.map(id => memberMap.get(id)).filter(c => c);
                        if (children.length > 1) {
                            // Check if all children are twins (same twinGroup)
                            const firstChild = children[0];
                            const allTwins = firstChild.twinGroup && children.every(c => c.twinGroup === firstChild.twinGroup);

                            // If they"re all twins, skip the sibship bar (twin connection will be drawn instead)
                            if (!allTwins) {
                                const childrenY = marriageY + (settings.verticalSpacing / 2);

                                // Vertical line from marriage to horizontal bar
                                SVG.addChild(svg, "line", {
                                    x1: marriageCenterX, y1: marriageY,
                                    x2: marriageCenterX, y2: childrenY,
                                    style: "stroke: black;stroke-width: 2"
                                }, 0);

                                const childrenX = children.map(c => c.position.x);
                                const minX = Math.min(...childrenX);
                                const maxX = Math.max(...childrenX);

                                // Horizontal bar connecting siblings
                                SVG.addChild(svg, "line", {
                                    x1: minX, y1: childrenY,
                                    x2: maxX, y2: childrenY,
                                    style: "stroke: black;stroke-width: 2"
                                }, 0);

                                // Vertical lines from bar to each child
                                children.forEach(child => {
                                    // Adjust endpoint to stop at stroke edge
                                    const lineEndY = child.position.y - 1;

                                    SVG.addChild(svg, "line", {
                                        x1: child.position.x, y1: childrenY,
                                        x2: child.position.x, y2: lineEndY,
                                        style: "stroke: black;stroke-width: 2"
                                    }, 0);
                                });
                            } else {
                                // All children are twins - draw direct line from marriage to twin connection point
                                // Twin connection point is at child.y - 15 and midpoint between twins" X positions (see _drawTwinConnection)
                                const twinConnectY = children[0].position.y - 15;
                                const twinMidX = (children[0].position.x + children[1].position.x) / 2;

                                SVG.addChild(svg, "line", {
                                    x1: twinMidX, y1: marriageY,
                                    x2: twinMidX, y2: twinConnectY,
                                    style: "stroke: black;stroke-width: 2"
                                }, 0);
                            }
                        }
                    } else if (marriage.children.length === 1) {
                        // For single child, draw direct line from marriage to child
                        const child = memberMap.get(marriage.children[0]);
                        if (child && child.position) {
                            // Adjust endpoint to stop at stroke edge (stroke-width is 2, so 1px on each side)
                            const lineEndY = child.position.y - 1;

                            SVG.addChild(svg, "line", {
                                x1: marriageCenterX, y1: marriageY,
                                x2: child.position.x, y2: lineEndY,
                                style: "stroke: black;stroke-width: 2"
                            }, 0);
                        }
                    }
                }
            }
        });

        // Redraw twin connections
        const twinGroups = new Map();
        this.pedigree.members.forEach(member => {
            if (member.twinGroup) {
                if (!twinGroups.has(member.twinGroup)) {
                    twinGroups.set(member.twinGroup, []);
                }
                twinGroups.get(member.twinGroup).push(member);
            }
        });

        twinGroups.forEach((twins, groupId) => {
            if (twins.length === 2) {
                const twinType = twins[0].twinType || "DIZYGOTIC";
                this._drawTwinConnection(twins[0], twins[1], twinType, svg, settings);
            }
        });
    }

    /**
     * Emit position changed event
     */
    _emitPositionChanged(individual) {
        if (this.currentSVG) {
            const event = new CustomEvent("pedigree:positionChanged", {
                detail: { individual },
                bubbles: true
            });
            this.currentSVG.dispatchEvent(event);
        }
    }

    /**
     * Draw twin connection lines above twin siblings
     */
    _drawTwinConnection(twin1, twin2, type, svg, settings) {
        const radius = settings.box / 2;
        const x1 = twin1.position.x;
        const y1 = twin1.position.y;
        const x2 = twin2.position.x;
        const y2 = twin2.position.y;

        // Calculate midpoint
        const midX = (x1 + x2) / 2;
        const connectY = y1 - 15; // Position above the symbols

        if (type === "MONOZYGOTIC") {
            // Monozygotic twins: converging lines to single point
            SVG.addChild(svg, "line", {
                x1: x1, y1: y1,
                x2: midX, y2: connectY,
                style: "stroke: black;stroke-width: 2"
            });
            SVG.addChild(svg, "line", {
                x1: x2, y1: y2,
                x2: midX, y2: connectY,
                style: "stroke: black;stroke-width: 2"
            });
        } else if (type === "DIZYGOTIC") {
            // Dizygotic twins: diverging lines
            const offset = 5;
            SVG.addChild(svg, "line", {
                x1: x1, y1: y1,
                x2: midX - offset, y2: connectY,
                style: "stroke: black;stroke-width: 2"
            });
            SVG.addChild(svg, "line", {
                x1: x2, y1: y2,
                x2: midX + offset, y2: connectY,
                style: "stroke: black;stroke-width: 2"
            });
        }
    }

    /**
     * Draw adoption brackets around symbol
     */
    _drawAdoptionBrackets(individual, group, radius, width) {
        const bracketWidth = 3;
        const offset = 5;

        // Left bracket
        SVG.addChild(group, "path", {
            d: `M ${-radius - offset} ${-offset} L ${-radius - offset - bracketWidth} ${-offset} L ${-radius - offset - bracketWidth} ${width + offset} L ${-radius - offset} ${width + offset}`,
            style: "stroke: black;stroke-width: 2;fill: none"
        });

        // Right bracket
        SVG.addChild(group, "path", {
            d: `M ${radius + offset} ${-offset} L ${radius + offset + bracketWidth} ${-offset} L ${radius + offset + bracketWidth} ${width + offset} L ${radius + offset} ${width + offset}`,
            style: "stroke: black;stroke-width: 2;fill: none"
        });
    }

    /**
     * Draw proband arrow pointing to symbol
     */
    _drawProbandArrow(individual, group, radius, width) {
        const arrowX = -radius - 20;
        const arrowY = radius;

        // Draw arrow line
        SVG.addChild(group, "line", {
            x1: arrowX, y1: arrowY,
            x2: -radius - 5, y2: arrowY,
            style: "stroke: black;stroke-width: 2"
        });

        // Draw arrowhead
        SVG.addChild(group, "path", {
            d: `M ${-radius - 5} ${arrowY} L ${-radius - 10} ${arrowY - 3} L ${-radius - 10} ${arrowY + 3} Z`,
            style: "fill: black"
        });
    }

    /**
     * Draw pregnancy symbol (P) inside symbol
     */
    _drawPregnancySymbol(individual, group, radius, width) {
        SVG.addChild(group, "text", {
            x: 0, y: radius + 5,
            style: "fill: black;font-size:16px;font-weight:bold;text-anchor:middle"
        }).textContent = "P";
    }

    /**
     * Draw disorder legend at bottom right of pedigree
     */
    _drawDisorderLegend(pedigree, svg, settings) {
        const legendWidth = 200;
        const legendItemHeight = 25;
        const legendPadding = 15;
        const boxSize = 16;

        const legendHeight = (pedigree.disorders.length * legendItemHeight) + (2 * legendPadding);
        const legendX = settings.width - legendWidth - 20;
        const legendY = settings.height - legendHeight - 20;

        // Create legend group
        const legendGroup = SVG.addChild(svg, "g", {
            transform: `translate(${legendX}, ${legendY})`
        });

        // Background box
        SVG.addChild(legendGroup, "rect", {
            x: 0, y: 0,
            width: legendWidth,
            height: legendHeight,
            style: "fill: white; stroke: #333; stroke-width: 1; rx: 5"
        });

        // Legend title
        SVG.addChild(legendGroup, "text", {
            x: legendPadding,
            y: legendPadding + 12,
            style: "fill: black; font-size: 13px; font-weight: bold"
        }).textContent = "Disorders";

        // Draw each disorder
        pedigree.disorders.forEach((disorder, index) => {
            const itemY = legendPadding + 20 + (index * legendItemHeight);
            const color = settings.colors[index] || "gray";

            // Color box
            SVG.addChild(legendGroup, "rect", {
                x: legendPadding,
                y: itemY,
                width: boxSize,
                height: boxSize,
                style: `fill: ${color}; stroke: black; stroke-width: 1`
            });

            // Disorder name
            SVG.addChild(legendGroup, "text", {
                x: legendPadding + boxSize + 8,
                y: itemY + 12,
                style: "fill: black; font-size: 11px"
            }).textContent = disorder.name || disorder.id;
        });
    }

    _addFamilyMember(object, x, y, width, radius, showSampleNames, svg) {
        // Create a group element to wrap the individual
        const group = SVG.addChild(svg, "g", {
            "data-individual-id": object.id,
            "transform": `translate(${x}, ${y})`
        });

        // No defined sex
        let memberSVG;
        if (typeof object.sex === "undefined" || object.sex === "undefined") {
            memberSVG = SVG.addChild(group, "rect", {
                x: -radius, y: 0,
                width: width * 0.8, height: width * 0.8,
                transform: `translate(${radius}) rotate(45 ${-radius} ${radius + (1.5 * width)})`,
                style: "fill: " + object.colorPattern + ";stroke: black;stroke-width: 2"
            });
        } else {
            // Member is a male
            if (object.sex === "male" || object.sex === "MALE") {
                memberSVG = SVG.addChild(group, "rect", {
                    x: -radius,
                    y: 0,
                    width: width,
                    height: width,
                    style: "fill: url(#" + object.colorPattern + ");stroke: black;stroke-width: 2"
                });
            } else {
                // Member is a female
                memberSVG = SVG.addChild(group, "circle", {
                    cx: 0, cy: radius,
                    r: radius,
                    style: "fill: url(#" + object.colorPattern + ");stroke: black;stroke-width: 2"
                });
            }
        }

        // Draw carrier indicator (small dot inside symbol)
        if (object.carrier) {
            SVG.addChild(group, "circle", {
                cx: 0, cy: radius,
                r: radius / 6,
                style: "fill: black"
            });
        }

        // Draw deceased indicator (diagonal line through center at (0, radius))
        if ((typeof object.lifeStatus !== "undefined" && object.lifeStatus !== null) && object.lifeStatus.toUpperCase() === "DECEASED") {
            SVG.addChild(group, "line", {
                x1: -radius - 5, y1: width + 5,
                x2: radius + 5, y2: -5,
                style: "stroke: black;stroke-width: 2"
            });
        }

        // Draw adoption brackets
        if (object.adopted) {
            this._drawAdoptionBrackets(object, group, radius, width);
        }

        // Draw proband arrow
        if (object.proband) {
            this._drawProbandArrow(object, group, radius, width);
        }

        // Draw pregnancy symbol
        if (object.pregnancy) {
            this._drawPregnancySymbol(object, group, radius, width);
        }

        if (showSampleNames && object.name) {
            // Truncate long names and add tooltip
            const maxLength = 12;
            const displayName = object.name.length > maxLength
                ? object.name.substring(0, maxLength) + "..."
                : object.name;

            let text = SVG.addChild(group, "text", {
                x: -radius + 2,
                y: width + 15,
                style: "fill: black;font-size:11px"
            });
            text.textContent = displayName;

            // Add SVG tooltip if name was truncated
            if (object.name.length > maxLength) {
                let title = SVG.addChild(text, "title");
                title.textContent = object.name;
            }
        }

        return group;

        // $(memberSVG).qtip({
        //     content: {text: "3:1000123:A:T: " + "<span style="font-weight: bold">0/1</span>", title: object.member.name},
        //     position: {target: "mouse", adjust: {x: 25, y: 15}, effect: false},
        //     // position: {viewport: $(window), target: "mouse", adjust: {x: 25, y: 15}},
        //     style: {width: true, classes: "ui-tooltip ui-tooltip-shadow"},
        //     show: {delay: 300},
        //     hide: {delay: 300}
        // });
    }

    _preprocessFamily(fam) {
        // Create, edit and return a deep copy of the user object, this prevents us of modifying user"s object
        let family = JSON.parse(JSON.stringify(fam));

        // Migrate data structure to v2.0 if needed
        family = this._migrateDataStructure(family);

        // refactored from pedigree-view
        if (family?.members?.length > 0) {
            family.members = family.members.map(member => {
                let father = null;
                let mother = null;
                if (member?.father?.id) {
                    const fatherMember = family.members.find(ind => {
                        return ind.id === member.father.id;
                    });
                    father = fatherMember ? fatherMember.id : null;
                }
                if (member?.mother?.id) {
                    const motherMember = family.members.find(ind => {
                        return ind.id === member.mother.id;
                    });
                    mother = motherMember ? motherMember.id : null;
                }
                const disorders = member?.disorders?.map(disorder => {
                    // Handle both object format {id: "x"} and string format "x"
                    return typeof disorder === "string" ? disorder : disorder?.id;
                }).filter(d => d); // Filter out undefined values

                return {
                    ...member,
                    father,
                    mother,
                    disorders: disorders || []
                };
            });
        }
        // /from pedigree-view

        let map = {};
        for (let m of family.members) {
            map[m.id] = m;
        }

        let colorMap = {};
        for (let idx in family.disorders) {
            colorMap[family.disorders[idx].id] = idx;
        }


        console.log(map);
        family.children = [];
        for (let m of family.members) {

            if (m.father || m.mother) {
                if (m.father && map[m.father]) {
                    map[m.father].partner = m.mother;
                    map[m.father].partnerConsaguinity = m.parentalConsanguinity;
                }

                if (m.mother && map[m.mother]) {
                    map[m.mother].partner = m.father;
                    map[m.mother].partnerConsaguinity = m.parentalConsanguinity;
                }

                if (m.father && map[m.father] && this._isOrphan(map[m.father])) {
                    family.father = map[m.father];
                }

                if (m.mother && map[m.mother] && this._isOrphan(map[m.mother])) {
                    family.mother = map[m.mother];
                }

                family.children.push(m);
            }

            // We save the corresponding disease color pattern for each sample
            if (m.disorders && m.disorders.length > 0) {
                let colorIdx = [];
                for (let c of m.disorders) {
                    colorIdx.push(colorMap[c]);
                }
                // Pattern suffix IDs must be sorted, eg. Pattern_01
                colorIdx = colorIdx.sort();
                m.colorPattern = "Pattern_" + colorIdx.join("");
            } else {
                m.colorPattern = "PatternWhite";
            }
        }
        return family;
    }

    // This function create the different color Patterns in a SVG "defs" section
    _createSvgDefs(family, settings) {
        let svgDefs = SVG.create("defs");

        // Default color pattern when no disease exist
        let pattern = SVG.create("pattern", {id: "PatternWhite", x: 0, y: 0, width: 1, height: 1});
        let rect = SVG.create("rect", {
            x: 0, y: 0,
            width: settings.box, height: settings.box,
            fill: "white"
        });
        pattern.appendChild(rect);
        svgDefs.appendChild(pattern);

        // We create all possible combination (incrementally with no reptition, eg. 0, 01, 02, 1, 12, ...)
        for (let i = 0; i < family.disorders.length; i++) {
            // Add the single disease color, eg. 0, 1, 2
            let pattern = SVG.create("pattern", {id: "Pattern_" + i, x: 0, y: 0, width: 1, height: 1});
            let rect = SVG.create("rect", {
                x: 0, y: 0,
                width: settings.box, height: settings.box,
                fill: settings.colors[i]
            });
            pattern.appendChild(rect);
            svgDefs.appendChild(pattern);

            // Add the double disease color, eg. 01, 02, 12, ...
            for (let j = i + 1; j < family.disorders.length; j++) {
                let pattern = SVG.create("pattern", {id: "Pattern_" + i + j, x: 0, y: 0, width: 1, height: 1});
                let rect1 = SVG.create("rect", {
                    x: 0, y: 0,
                    width: settings.box / 2, height: settings.box,
                    fill: settings.colors[i]
                });
                let rect2 = SVG.create("rect", {
                    x: settings.box / 2, y: 0,
                    width: settings.box / 2, height: settings.box,
                    fill: settings.colors[j]
                });
                pattern.appendChild(rect1);
                pattern.appendChild(rect2);
                svgDefs.appendChild(pattern);
            }
        }

        return svgDefs;
    }

    _isOrphan(member) {
        // After preprocessing, father/mother are ID strings, not objects
        return !member?.father && !member?.mother;
    }

    parseFamilyToPedigree(family) {
        let newMembers = family.members.map((member) => {
            let newMember = {};
            newMember.name = member.id;

            if (typeof member.disorders !== "undefined" && member.disorders.length > 0) {
                newMember.disorders = member.disorders.map((disorder) => {
                    return disorder.id;
                });
            }
            if (UtilsNew.isNotUndefinedOrNull(member.father) && UtilsNew.isUndefinedOrNull(member.father.id)) {
                newMember.father = member.father;
            }
            if (UtilsNew.isNotUndefinedOrNull(member.mother) && UtilsNew.isUndefinedOrNull(member.mother.id)) {
                newMember.mother = member.mother;
            }
            newMember.sex = member.sex;
            newMember.lifeStatus = member.lifeStatus;
            newMember.parentalConsanguinity = member.parentalConsanguinity;

            return newMember;
        });
        let pedigreFromFamily = {
            name: family.name,
            disorders: family.disorders,
            members: newMembers
        };

        this.pedigree = pedigreFromFamily;
    }

    /**
     * Migrate v1.0 data structure to v2.0 with enhanced metadata
     */
    _migrateDataStructure(family) {
        // Add version if not present
        if (!family.version) {
            family.version = "2.0";
        }

        // Ensure members array exists
        if (!family.members) {
            family.members = [];
        }

        // Add position metadata to all members if not present
        family.members = family.members.map(member => {
            if (!member.position) {
                member.position = {
                    x: 0,
                    y: 0,
                    manuallyPositioned: false
                };
            }
            return member;
        });

        // Auto-generate marriages array if missing
        if (!family.marriages) {
            family.marriages = [];
            const marriageMap = new Map();

            family.members.forEach(member => {
                if (member.father?.id && member.mother?.id) {
                    const key = [member.father.id, member.mother.id].sort().join("-");
                    if (!marriageMap.has(key)) {
                        marriageMap.set(key, {
                            id: `marriage-${marriageMap.size + 1}`,
                            partner1: member.father.id,
                            partner2: member.mother.id,
                            consanguinity: member.parentalConsanguinity || false,
                            separated: false,
                            children: [],
                            position: { x: 0, y: 0 }
                        });
                    }
                    marriageMap.get(key).children.push(member.id);
                }
            });

            family.marriages = Array.from(marriageMap.values());
        }

        // Set layout mode
        if (!family.layoutMode) {
            family.layoutMode = "AUTO";
        }

        return family;
    }

    /**
     * Assign generation levels using breadth-first traversal
     */
    _assignGenerations(members) {
        // Create a map for quick lookup
        const memberMap = new Map();
        members.forEach(m => memberMap.set(m.id, m));

        // Find all founders (no parents in dataset)
        const founders = members.filter(m => {
            // After preprocessing, father/mother are ID strings, not objects
            const hasFather = m.father && memberMap.has(m.father);
            const hasMother = m.mother && memberMap.has(m.mother);

            // Debug: log parent status
            if (!hasFather && !hasMother) {
                console.log(`Founder detected: ${m.id} (${m.name || "unnamed"}) - father: ${m.father}, mother: ${m.mother}`);
            }

            return !hasFather && !hasMother;
        });

        console.log(`Found ${founders.length} founders:`, founders.map(f => f.id || f.name));

        // Initialize all generations to -1
        members.forEach(m => m.generation = -1);

        // Assign generation 0 to founders
        founders.forEach(f => f.generation = 0);

        // Breadth-first assignment of generations
        let maxGeneration = 0;
        let changed = true;
        while (changed) {
            changed = false;
            members.forEach(m => {
                if (m.generation === -1) {
                    // father/mother are ID strings after preprocessing
                    const father = m.father ? memberMap.get(m.father) : null;
                    const mother = m.mother ? memberMap.get(m.mother) : null;

                    if ((father && father.generation >= 0) || (mother && mother.generation >= 0)) {
                        const fatherGen = father?.generation ?? -1;
                        const motherGen = mother?.generation ?? -1;
                        m.generation = Math.max(fatherGen, motherGen) + 1;
                        maxGeneration = Math.max(maxGeneration, m.generation);
                        changed = true;
                    }
                }
            });
        }

        // Second pass: Adjust generations based on partnerships
        // Partners should be in the same generation
        changed = true;
        let iterations = 0;
        while (changed && iterations < 10) {
            changed = false;
            iterations++;

            members.forEach(m => {
                if (m.partner && memberMap.has(m.partner)) {
                    const partner = memberMap.get(m.partner);

                    // If one partner has a higher generation (has defined parents)
                    // and the other is a "founder" (gen 0 with no parents), adjust
                    if (m.generation < partner.generation && !m.father && !m.mother) {
                        console.log(`Adjusting ${m.id} from gen ${m.generation} to ${partner.generation} (spouse of ${partner.id})`);
                        m.generation = partner.generation;
                        maxGeneration = Math.max(maxGeneration, m.generation);
                        changed = true;
                    } else if (partner.generation < m.generation && !partner.father && !partner.mother) {
                        console.log(`Adjusting ${partner.id} from gen ${partner.generation} to ${m.generation} (spouse of ${m.id})`);
                        partner.generation = m.generation;
                        maxGeneration = Math.max(maxGeneration, partner.generation);
                        changed = true;
                    }
                }
            });
        }

        console.log(`Generation assignment complete. Max generation: ${maxGeneration}`);
        return maxGeneration;
    }

    /**
     * Group members by generation level
     */
    _groupByGeneration(members) {
        const groups = new Map();
        members.forEach(m => {
            const gen = m.generation >= 0 ? m.generation : 0;
            if (!groups.has(gen)) {
                groups.set(gen, []);
            }
            groups.get(gen).push(m);
        });
        return groups;
    }

    /**
     * Group members by sibship (same parents)
     */
    _groupBySibship(members) {
        const groups = new Map();
        members.forEach(m => {
            // After preprocessing, father/mother are ID strings
            const fatherId = m.father || "none";
            const motherId = m.mother || "none";
            const key = `${fatherId}-${motherId}`;
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(m);
        });
        return groups;
    }

    /**
     * Calculate positions for marriages
     */
    _positionMarriages(members, marriages, settings) {
        const memberMap = new Map();
        members.forEach(m => memberMap.set(m.id, m));

        marriages.forEach(marriage => {
            const p1 = memberMap.get(marriage.partner1);
            const p2 = memberMap.get(marriage.partner2);

            if (p1 && p2 && p1.position && p2.position) {
                // Marriage line is positioned between partners
                marriage.position.x = (p1.position.x + p2.position.x) / 2;
                marriage.position.y = (p1.position.y + p2.position.y) / 2;
            }
        });
    }

    /**
     * Check if a member is a single child (no siblings)
     */
    _isSingleChild(member, memberMap, marriages) {
        // Must have both parents
        if (!member.father || !member.mother) {
            return false;
        }

        // Find the marriage between parents
        const marriage = marriages.find(m =>
            (m.partner1 === member.father && m.partner2 === member.mother) ||
            (m.partner1 === member.mother && m.partner2 === member.father)
        );

        // Check if this marriage has only one child
        if (marriage && marriage.children) {
            return marriage.children.length === 1;
        }

        // Fallback: count siblings with same parents
        const father = memberMap.get(member.father);
        const mother = memberMap.get(member.mother);

        if (!father || !mother) {
            return false;
        }

        // Count members with the same parents
        let siblingCount = 0;
        memberMap.forEach(m => {
            if (m.father === member.father && m.mother === member.mother) {
                siblingCount++;
            }
        });

        return siblingCount === 1;
    }

    /**
     * Reorganize members within a generation to group couples together
     */
    _groupCouples(genMembers, memberMap) {
        const organized = [];
        const processed = new Set();

        genMembers.forEach(member => {
            if (processed.has(member.id)) return;

            // If this member has a partner in the same generation, add them together
            if (member.partner && memberMap.has(member.partner)) {
                const partner = memberMap.get(member.partner);

                // Check if partner is in same generation
                if (partner.generation === member.generation) {
                    // Ensure conventional order: male on left, female on right
                    if (member.sex === "MALE" || member.sex === "male") {
                        organized.push(member);
                        organized.push(partner);
                    } else {
                        organized.push(partner);
                        organized.push(member);
                    }
                    processed.add(member.id);
                    processed.add(partner.id);
                    return;
                }
            }

            // No partner in same generation, add individually
            if (!processed.has(member.id)) {
                organized.push(member);
                processed.add(member.id);
            }
        });

        return organized;
    }

    /**
     * Calculate multi-generational layout positions
     */
    _calculateMultiGenerationLayout(members, marriages, settings) {
        const memberMap = new Map();
        members.forEach(m => memberMap.set(m.id, m));

        // Group by generation
        const generationGroups = this._groupByGeneration(members);
        const maxGeneration = Math.max(...generationGroups.keys());

        // Calculate positions generation by generation
        for (let gen = 0; gen <= maxGeneration; gen++) {
            let genMembers = generationGroups.get(gen) || [];
            const y = settings.topMargin + (gen * settings.verticalSpacing);

            // Reorganize to group couples together
            genMembers = this._groupCouples(genMembers, memberMap);

            // Calculate total width needed for this generation
            // Add extra spacing between couples
            const totalWidth = genMembers.length * settings.horizontalSpacing;

            // Position members left to right, centered in the canvas
            let currentX = (settings.width - totalWidth) / 2;
            const positioned = new Set(); // Track which members we"ve positioned

            genMembers.forEach((member, idx) => {
                // Skip if already positioned (e.g., as part of a couple)
                if (positioned.has(member.id)) {
                    return;
                }
                // Ensure position object exists
                if (!member.position) {
                    member.position = { x: 0, y: 0, manuallyPositioned: false };
                }

                if (!member.position.manuallyPositioned) {
                    // Check if this is a single child - if so, center under parents
                    const isSingleChild = this._isSingleChild(member, memberMap, marriages);

                    if (isSingleChild) {
                        // Single child - center under parents" marriage line
                        const father = member.father ? memberMap.get(member.father) : null;
                        const mother = member.mother ? memberMap.get(member.mother) : null;

                        if (father && mother && father.position && mother.position) {
                            // Center the CHILD under parents (vertical line)
                            const parentCenterX = (father.position.x + mother.position.x) / 2;
                            member.position.x = parentCenterX;
                            member.position.y = y;

                            // If child has a partner, check if partner is ALSO a single child
                            if (member.partner && memberMap.has(member.partner)) {
                                const partner = memberMap.get(member.partner);
                                const partnerIsSingleChild = this._isSingleChild(partner, memberMap, marriages);

                                // Only position partner here if they"re NOT a single child
                                // If partner IS a single child, they"ll be centered under their own parents when processed
                                if (partner && !partner.position.manuallyPositioned && !partnerIsSingleChild) {
                                    // Male on left, female on right (standard convention)
                                    if (member.sex === "MALE" || member.sex === "male") {
                                        // Child is male, partner goes to the right
                                        partner.position.x = parentCenterX + settings.horizontalSpacing;
                                        partner.position.y = y;
                                    } else {
                                        // Child is female, partner goes to the left
                                        partner.position.x = parentCenterX - settings.horizontalSpacing;
                                        partner.position.y = y;
                                    }
                                    positioned.add(partner.id);
                                }
                            }
                        } else {
                            // Fallback to normal positioning
                            member.position.x = currentX;
                            member.position.y = y;
                            currentX += settings.horizontalSpacing;
                        }
                        positioned.add(member.id);
                    } else {
                        // Normal left-to-right positioning for non-single-children
                        member.position.x = currentX;
                        member.position.y = y;
                        currentX += settings.horizontalSpacing;
                        positioned.add(member.id);
                    }
                }
            });
        }

        // Position marriages
        this._positionMarriages(members, marriages, settings);
    }

    getDefaultSetting() {
        return {
            width: 1200,          // Increased for 4 generations
            height: 600,          // Increased for vertical space
            box: 60,
            colors: ["black", "red", "blue"],
            topMargin: 50,
            horizontalSpacing: 120,
            verticalSpacing: 150,
            interactive: false,   // Toggle interactivity
            showNames: true,
            showGenerationLabels: false  // Optional labels
        };
    }

}

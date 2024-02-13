import UtilsNew from "../../core/utils-new.js";
import Region from "../../core/bioinfo/region.js";
import {SVG} from "../../core/svg.js";
import GenomeBrowserConstants from "../genome-browser-constants.js";
import GenomeBrowserUtils from "../genome-browser-utils.js";

export default class ChromosomePanel {

    constructor(target, config) {
        // eslint-disable-next-line no-undef
        Object.assign(this, Backbone.Events);

        this.target = target;
        this.config = {
            ...this.getDefaultConfig(),
            ...config,
        };

        this.#init();
    }

    #init() {
        this.prefix = UtilsNew.randomString(8);
        this.pixelBase = 0;
        this.width = this.config.width;
        this.height = this.config.height;
        this.collapsed = this.config.collapsed;
        this.hidden = this.config.hidden;

        this.region = new Region(this.config.region);

        this.chromosome = null;
        this.chromosomeLength = 0;
        this.status = "";

        this.regionChanging = false;
        this.rendered = false;

        this.#initDom();
        this.#initEvents();
    }

    #initDom() {
        const template = UtilsNew.renderHTML(`
            <div id="${this.prefix}" style="user-select:none;">
                <div style="display:flex;justify-content:space-between;">
                    <div id="${this.prefix}Title" style="font-weight:bold;cursor:pointer;" data-cy="gb-chromosome-title">
                        ${this.config?.title || ""}
                    </div>
                    <div id="${this.prefix}Collapse" style="cursor:pointer;" data-cy="gb-chromosome-toggle">
                        <span id="${this.prefix}CollapseIcon" class="fa fa-minus"></span>
                    </div>
                </div>
                <div id="${this.prefix}Content" style="display:block;margin-top:8px;" data-cy="gb-chromosome-content"></div>
            </div>
        `);

        this.div = template.querySelector(`div#${this.prefix}`);
        this.title = this.div.querySelector(`div#${this.prefix}Title`);
        this.collapse = this.div.querySelector(`div#${this.prefix}Collapse`);
        this.collapseIcon = this.div.querySelector(`span#${this.prefix}CollapseIcon`);

        // Main content
        this.content = this.div.querySelector(`div#${this.prefix}Content`);

        // Initialize SVG element
        this.svg = SVG.init(this.content, {
            "width": this.width,
            "height": this.height,
        });

        this.positionBox = null;
        this.selBox = null;

        this.target.append(this.div);
    }

    #initEvents() {
        const handleToggle = () => {
            this.collapsed ? this.showContent() : this.hideContent();
        };

        this.title.addEventListener("click", handleToggle);
        this.collapse.addEventListener("click", handleToggle);

        // Prevent browser context menu
        this.svg.addEventListener("contextmenu", event => {
            event.preventDefault();
        });

        let downY, downX, moveX, moveY, lastX;
        const handleMouseMove = event => {
            // using parent offset works well on firefox and chrome. Could be because it is a div instead of svg
            moveX = event.clientX - (this.div.getBoundingClientRect().left - window.scrollX);
            const increment = moveX - downX;
            let newWidth = 0;
            this.#recalculateResizeControls();

            switch (this.status) {
                case "resizePositionBoxLeft":
                    newWidth = parseInt(this.positionBox.getAttribute("width")) - increment;
                    if (newWidth > 0) {
                        this.positionBox.setAttribute("x", parseInt(this.positionBox.getAttribute("x")) + increment);
                        this.positionBox.setAttribute("width", newWidth);
                    }
                    downX = moveX;
                    break;
                case "resizePositionBoxRight":
                    newWidth = parseInt(this.positionBox.getAttribute("width")) + increment;
                    if (newWidth > 0) {
                        this.positionBox.setAttribute("width", newWidth);
                    }
                    downX = moveX;
                    break;
                case "movePositionBox":
                    this.positionBox.setAttribute("x", parseInt(this.positionBox.getAttribute("x")) + increment);
                    downX = moveX;
                    break;
                case "setRegion":
                case "selectingRegion":
                    this.status = "selectingRegion";
                    if (moveX < downX) {
                        this.selBox.setAttribute("x", moveX);
                    }
                    this.selBox.setAttribute("width", Math.abs(moveX - downX));
                    this.selBox.setAttribute("height", this.height - 3);
                    break;
            }
        };

        this.svg.addEventListener("mousedown", event => {
            // using parent offset works well on firefox and chrome. Could be because it is a div instead of svg
            downX = event.clientX - (this.div.getBoundingClientRect().left - window.scrollX);
            this.selBox.setAttribute("x", downX);
            lastX = this.positionBox.getAttribute("x");
            // if (this.status === "") {
            //     this.status = "setRegion";
            // }

            // this.#hideResizeControls();
            this.svg.addEventListener("mousemove", handleMouseMove);
        });

        this.svg.addEventListener("mouseup", () => {
            this.svg.removeEventListener("mousemove", handleMouseMove);

            // Update region if needed
            if (downX !== null) {
                switch (this.status) {
                    case "resizePositionBoxLeft":
                    case "resizePositionBoxRight":
                    case "movePositionBox":
                        if (moveX != null) {
                            const w = parseInt(this.positionBox.getAttribute("width"));
                            const x = parseInt(this.positionBox.getAttribute("x"));

                            this.#triggerRegionChange({
                                region: new Region({
                                    chromosome: this.region.chromosome,
                                    start: (x - this.config.offset) / this.pixelBase,
                                    end: (x + w - this.config.offset) / this.pixelBase,
                                }),
                                sender: this,
                            });
                        }
                        break;
                    case "setRegion":
                        if (downX > this.config.offset && downX < (this.width - this.config.offset)) {
                            const w = parseInt(this.positionBox.getAttribute("width"));

                            this.#triggerRegionChange({
                                region: new Region({
                                    chromosome: this.region.chromosome,
                                    start: (downX - (w / 2) - this.config.offset) / this.pixelBase,
                                    end: (downX + (w / 2) - this.config.offset) / this.pixelBase,
                                }),
                                sender: this,
                            });
                        }
                        break;
                    case "selectingRegion":
                        const start = (downX - this.config.offset) / this.pixelBase;
                        const end = (moveX - this.config.offset) / this.pixelBase;

                        this.selBox.setAttribute("width", 0);
                        this.selBox.setAttribute("height", 0);
                        this.#triggerRegionChange({
                            region: new Region({
                                chromosome: this.region.chromosome,
                                start: Math.min(start, end),
                                end: Math.max(start, end),
                            }),
                            sender: this,
                        });
                        break;
                }
                this.status = "setRegion";
            }

            downX = null;
            moveX = null;
            lastX = this.positionBox.getAttribute("x");
        });

        this.svg.addEventListener("mouseenter", () => {
            if (this.rendered) {
                this.#recalculateResizeControls();
                this.#showResizeControls();
            }
        });

        this.svg.addEventListener("mouseleave", () => {
            this.#hideResizeControls();
            this.svg.removeEventListener("mousemove", handleMouseMove);
            if (lastX != null) {
                this.positionBox.setAttribute("x", lastX);
            }
            this.selBox.setAttribute("width", 0);
            this.selBox.setAttribute("height", 0);

            downX = null;
            moveX = null;
            lastX = null;
            // let overPositionBox = false;
            // let movingPositionBox = false;
            // let selectingRegion = false;
        });
    }

    draw() {
        this.clean();

        // to prevent negative values, we require a width size of at least 500px for drawing the chromosome.
        if (this.width < this.config.minWidth) {
            return;
        }

        if (!this.chromosome || this.chromosome.name !== this.region.chromosome) {
            this.chromosome = this.config.chromosomes.find(chromosome => {
                return chromosome.name === this.region.chromosome;
            });
            this.chromosomeLength = this.chromosome.size;
            this.pixelBase = (this.width - 40) / this.chromosomeLength;
            this.setTitle(`Chromosome ${this.chromosome.name.replace("chr", "")}`);
        }

        const offset = this.config.offset;
        const group = SVG.addChild(this.svg, "g", {
            cursor: "pointer",
        });

        // Draw chromosome
        SVG.addChild(group, "rect", {
            x: offset,
            y: 39,
            width: this.width - 40 + 1,
            height: 22,
            fill: "#555555",
        });

        const cytobandsByStain = {};
        (this.chromosome.cytobands || []).forEach(rawCytoband => {
            const cytoband = {
                ...rawCytoband,
                pixelStart: rawCytoband.start * this.pixelBase,
                pixelEnd: rawCytoband.end * this.pixelBase,
                pixelSize: (rawCytoband.end - rawCytoband.start) * this.pixelBase,
            };

            if (!cytobandsByStain[cytoband.stain]) {
                cytobandsByStain[cytoband.stain] = [];
            }
            cytobandsByStain[cytoband.stain].push(cytoband);

            const textX = offset + ((cytoband.pixelStart + cytoband.pixelEnd) / 2);
            const textY = 35;
            const text = SVG.addChild(group, "text", {
                "data-cy": "gb-chromosome-cytoband-label",
                "data-chromosome-arm": cytoband.name[0],
                "x": textX,
                "y": textY,
                "font-size": 10,
                "transform": `rotate(-90, ${textX}, ${textY})`,
                "fill": "black",
            });
            text.textContent = cytoband.name;
        });

        Object.keys(cytobandsByStain).forEach(name => {
            if (name != "acen") {
                const paths = cytobandsByStain[name].map(cytoband => {
                    return `M${cytoband.pixelStart + offset + 1},50 L${cytoband.pixelEnd + offset},50 `;
                });

                SVG.addChild(group, "path", {
                    "data-cy": "gb-chromosome-cytoband-path",
                    "data-stain": name,
                    "d": paths.join(" "),
                    "stroke": GenomeBrowserConstants.CYTOBANDS_COLORS[name] || "",
                    "stroke-width": 20,
                    "fill": "none",
                });
            }
        });

        if (cytobandsByStain["acen"] && cytobandsByStain["acen"].length === 2) {
            const firstStain = cytobandsByStain["acen"][0];
            const lastStain = cytobandsByStain["acen"][1];

            // Append background rectangle
            SVG.addChild(group, "rect", {
                "x": (firstStain.pixelStart + offset + 1),
                "y": 39,
                "width": (lastStain.pixelEnd + offset) - (firstStain.pixelStart + offset + 1),
                "height": 22,
                "fill": "white",
            });

            const firstStainXStart = (firstStain.pixelStart + offset + 1);
            const firstStainXEnd = (firstStain.pixelEnd + offset);
            const lastStainXStart = (lastStain.pixelStart + offset + 1);
            const lastStainXEnd = (lastStain.pixelEnd + offset);

            // Append centromere triangles
            SVG.addChild(group, "path", {
                "data-cy": "gb-chromosome-cytoband-path",
                "data-stain": "acen",
                "d": `M${firstStainXStart},39 L${firstStainXEnd - 5},39 L${firstStainXEnd},50 L${firstStainXEnd - 5},61 L${firstStainXStart},61 z`,
                "fill": GenomeBrowserConstants.CYTOBANDS_COLORS["acen"] || "",
            });
            SVG.addChild(group, "path", {
                "data-cy": "gb-chromosome-cytoband-path",
                "data-stain": "acen",
                "d": `M${lastStainXStart},50 L${lastStainXStart + 5},39 L${lastStainXEnd},39 L${lastStainXEnd},61 L${lastStainXStart + 5},61 z`,
                "fill": GenomeBrowserConstants.CYTOBANDS_COLORS["acen"] || "",
            });
        }

        // Render features of interest
        this.config.featuresOfInterest.forEach(item => {
            if (item.display?.visible) {
                item.features.forEach(feature => {
                    if (feature.chromosome === this.chromosome.name) {
                        const featureWidth = Math.max(1, this.pixelBase * Math.abs(feature.end - feature.start));
                        const featureX = offset + Math.min(feature.start, feature.end) * this.pixelBase;

                        // Create a new group for this feature of interest
                        const featureGroup = SVG.addChild(group, "g", {
                            "data-cy": "gb-chromosome-feature-of-interest",
                            "data-feature-id": feature.id,
                            "data-feature-start": feature.start,
                            "data-feature-end": feature.end,
                        });

                        // Display region rectangle
                        SVG.addChild(featureGroup, "rect", {
                            x: featureX,
                            y: 39,
                            width: featureWidth,
                            height: 22,
                            fill: item.display?.color || "red",
                            opacity: 0.5,
                        });

                        // Display triangle at the right side of the chromosome
                        SVG.addChild(featureGroup, "path", {
                            d: `M${featureX + featureWidth / 2},62 l6,6 l-12,0 z`,
                            fill: item.display?.color || "red",
                            opacity: 0.6,
                        });
                    }
                });
            }
        });

        // Resize elements and events
        this.status = "setRegion";
        const centerPosition = this.region.center();
        const pointerPosition = (centerPosition * this.pixelBase) + offset;

        // selection box, will appear when selection is detected
        this.selBox = SVG.addChild(this.svg, "rect", {
            "x": 0,
            "y": 2,
            "stroke-width": "2",
            "stroke": "deepskyblue",
            "opacity": "0.5",
            "fill": "honeydew",
        });

        const positionBoxWidth = this.region.length() * this.pixelBase;
        const positionGroup = SVG.addChild(group, "g", {
            "data-cy": "gb-chromosome-position",
            "data-position": centerPosition,
        });
        this.positionBox = SVG.addChild(positionGroup, "rect", {
            "x": pointerPosition - (positionBoxWidth / 2),
            "y": 2,
            "width": positionBoxWidth,
            "height": this.height - 3,
            "stroke": "orangered",
            "stroke-width": 2,
            "opacity": 0.5,
            "fill": "navajowhite",
            "cursor": "move",
        });
        this.positionBox.addEventListener("mousedown", () => {
            this.status = "movePositionBox";
        });

        this.resizeLeft = SVG.addChild(positionGroup, "rect", {
            x: pointerPosition - (positionBoxWidth / 2),
            y: 2,
            width: 7,
            height: this.height - 3,
            opacity: 0.5,
            fill: "transparent",
            cursor: "ew-resize",
        });
        this.resizeLeft.addEventListener("mousedown", () => {
            this.status = "resizePositionBoxLeft";
        });

        this.resizeRight = SVG.addChild(positionGroup, "rect", {
            x: positionBoxWidth - 5,
            y: 2,
            width: 7,
            height: this.height - 3,
            opacity: 0.5,
            fill: "transparent",
            cursor: "ew-resize",
        });
        this.resizeRight.addEventListener("mousedown", () => {
            this.status = "resizePositionBoxRight";
        });

        this.rendered = true;
    }

    #triggerRegionChange(event) {
        if (!this.regionChanging) {
            this.regionChanging = true;

            this.#limitRegionToChromosome(event.region);
            this.trigger("region:change", event);

            setTimeout(() => {
                this.regionChanging = false;
            }, 700);
        } else {
            this.updateRegionControls();
        }
    }

    #recalculatePositionBox(region) {
        const genomicLength = region.length();
        const pixelWidth = genomicLength * this.pixelBase;
        const x = (region.start * this.pixelBase) + this.config.offset;
        this.positionBox.setAttribute("x", x);
        this.positionBox.setAttribute("width", pixelWidth);
    }

    #recalculateSelectionBox(region) {
        const genomicLength = region.length();
        const pixelWidth = genomicLength * this.pixelBase;
        const x = (region.start * this.pixelBase) + this.config.offset;
        this.selBox.setAttribute("x", x);
        this.selBox.setAttribute("width", pixelWidth);
    }

    #recalculateResizeControls() {
        const postionBoxX = parseInt(this.positionBox.getAttribute("x"));
        const postionBoxWidth = parseInt(this.positionBox.getAttribute("width"));
        this.resizeLeft.setAttribute("x", postionBoxX - 5);
        this.resizeRight.setAttribute("x", (postionBoxX + postionBoxWidth));
        // this.resizeLeft.style.cursor = "ew-resize";
        // this.resizeRight.style.cursor = "ew-resize";
    }

    #hideResizeControls() {
        // this.resizeLeft.style.visibility = "hidden";
        // this.resizeRight.style.visibility = "hidden";
        this.resizeLeft.style.fill = "transparent";
        this.resizeRight.style.fill = "transparent";
    }

    #showResizeControls() {
        // this.resizeLeft.style.visibility = "visible";
        // this.resizeRight.style.visibility = "visible";
        this.resizeLeft.style.fill = "orangered";
        this.resizeRight.style.fill = "orangered";
    }

    #limitRegionToChromosome(region) {
        // eslint-disable-next-line no-param-reassign
        region.start = Math.max(1, region.start);
        // eslint-disable-next-line no-param-reassign
        region.end = Math.min(region.end, this.chromosomeLength);
    }

    show() {
        this.target.style.display = "block";
        this.hidden = false;
    }

    hide() {
        this.target.style.display = "none";
        this.hidden = true;
    }

    setVisible(bool) {
        bool ? this.show() : this.hide();
    }

    showContent() {
        this.content.style.display = "block";
        this.collapse.classList.remove("active");
        this.collapseIcon.classList.remove("fa-plus");
        this.collapseIcon.classList.add("fa-minus");
        this.collapsed = false;
    }

    hideContent() {
        this.content.style.display = "none";
        this.collapse.classList.add("active");
        this.collapseIcon.classList.remove("fa-minus");
        this.collapseIcon.classList.add("fa-plus");
        this.collapsed = true;
    }

    setTitle(title) {
        this.title.textContent = title;
    }

    setWidth(width) {
        this.width = width;
        this.svg.setAttribute("width", width);
        this.draw();
    }

    setRegion(region) {
        this.region.load(region);

        if (!this.chromosome || this.chromosome.name != this.region.chromosome) {
            this.draw();
        }

        this.updateRegionControls();
    }

    clean() {
        GenomeBrowserUtils.cleanDOMElement(this.svg);
    }

    updateRegionControls() {
        this.selBox.setAttribute("width", 0);
        this.selBox.setAttribute("height", 0);
        this.#recalculatePositionBox(this.region);
        this.#recalculateResizeControls();
    }

    getDefaultConfig() {
        return {
            width: 600,
            minWidth: 500,
            height: 85,
            collapsible: true,
            collapsed: false,
            offset: 20, // Internally used
            chromosomes: [],
            featuresOfInterest: [],
        };
    }

}

import UtilsNew from "../../core/utilsNew.js";
import Region from "../../core/bioinfo/region.js";
import {SVG} from "../../core/svg.js";
import GenomeBrowserConstants from "../genome-browser-constants.js";

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
        this.species = this.config.species;
        this.width = this.config.width;
        this.height = this.config.height;
        this.collapsed = this.config.collapsed;
        this.hidden = this.config.hidden;

        this.region = new Region(this.config.region);

        this.lastChromosome = "";
        this.data = null;
        this.status = "";

        this.regionChanging = false;
        this.rendered = false;

        this.#initDom();
        this.#initEvents();
    }

    #initDom() {
        const template = UtilsNew.renderHTML(`
            <div id="${this.prefix}" class="unselectable">
                <div id="${this.prefix}Title" class="ocb-gv-panel-title unselectable">
                    <div id="${this.prefix}TitleText" class="ocb-gv-panel-text">
                        ${this.config?.title || ""}
                    </div>
                    <div id="${this.prefix}Collapse" class="ocb-gv-panel-collapse-control">
                        <span id="${this.prefix}CollapseIcon" class="fa fa-minus"></span>
                    </div>
                </div>
            </div>
        `);

        this.div = template.querySelector(`div#${this.prefix}`);
        this.titleDiv = this.div.querySelector(`div#${this.prefix}Title`);
        this.titleText = this.div.querySelector(`div#${this.prefix}TitleText`);
        this.collapseDiv = this.div.querySelector(`div#${this.prefix}Collapse`);
        this.collapseIcon = this.div.querySelector(`span#${this.prefix}CollapseIcon`);

        // Initialize SVG element
        this.svg = SVG.init(this.div, {
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

        this.titleDiv.addEventListener("click", handleToggle);

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

    show() {
        this.div.style.display = "block";
        this.hidden = false;
    }

    hide() {
        this.div.style.display = "none";
        this.hidden = true;
    }

    setVisible(bool) {
        bool ? this.show() : this.hide();
    }

    showContent() {
        this.svg.style.display = "inline";
        this.collapseDiv.classList.remove("active");
        this.collapseIcon.classList.remove("fa-plus");
        this.collapseIcon.classList.add("fa-minus");
        this.collapsed = false;
    }

    hideContent() {
        this.svg.style.display = "none";
        this.collapseDiv.classList.add("active");
        this.collapseIcon.classList.remove("fa-minus");
        this.collapseIcon.classList.add("fa-plus");
        this.collapsed = true;
    }

    setTitle(title) {
        this.titleText.textContent = title;
    }

    setWidth(width) {
        this.width = width;
        this.svg.setAttribute("width", width);


        if (this.data) {
            this.clean();
            this.#drawSvg(this.data);
        }
    }

    setSpecies(species) {
        this.lastSpecies = this.species;
        this.species = species;
    }

    clean() {
        // TODO: add dom utility to clear a DOM element
        $(this.svg).empty();
    }

    draw() {
        this.clean();
        this.rendered = false;

        this.config.cellBaseClient.get("genomic", "chromosome", this.region.chromosome, "info")
            .then(data => {
                this.data = data.response[0].result[0].chromosomes[0];
                this.data.cytobands.sort((a, b) => a.start - b.start);
                this.#drawSvg(this.data);
            });

        this.lastChromosome = this.region.chromosome;

        if (this.collapsed) {
            this.hideContent();
        }
    }

    #drawSvg(chromosome) {
        const offset = this.config.offset;
        const group = SVG.addChild(this.svg, "g", {
            cursor: "pointer",
        });
        this.chromosomeLength = chromosome.size;
        this.pixelBase = (this.width - 40) / this.chromosomeLength;

        // Draw chromosome
        const backrect = SVG.addChild(group, "rect", {
            x: offset,
            y: 39,
            width: this.width - 40 + 1,
            height: 22,
            fill: "#555555",
        });

        const cytobandsByStain = {};
        let textDrawingOffset = offset;
        (chromosome.cytobands || []).forEach(rawCytoband => {
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

            const middleX = textDrawingOffset + (cytoband.pixelSize / 2);
            const textY = 35;
            const text = SVG.addChild(group, "text", {
                "x": middleX,
                "y": textY,
                "font-size": 10,
                "transform": `rotate(-90, ${middleX}, ${textY})`,
                "fill": "black"
            });
            text.textContent = cytoband.name;
            textDrawingOffset += cytoband.pixelSize;
        });

        Object.keys(cytobandsByStain).forEach(name => {
            if (name != "acen") {
                const paths = cytobandsByStain[name].map(cytoband => {
                    return `M${cytoband.pixelStart + offset + 1},50 L${cytoband.pixelEnd + offset},50 `;
                });

                SVG.addChild(group, "path", {
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
                x: (firstStain.pixelStart + offset + 1),
                y: 39,
                width: (lastStain.pixelEnd + offset) - (firstStain.pixelStart + offset + 1),
                height: 22,
                fill: "white",
            });

            const firstStainXStart = (firstStain.pixelStart + offset + 1);
            const firstStainXEnd = (firstStain.pixelEnd + offset);
            const lastStainXStart = (lastStain.pixelStart + offset + 1);
            const lastStainXEnd = (lastStain.pixelEnd + offset);

            // Append centromere triangles
            SVG.addChild(group, "path", {
                d: `M${firstStainXStart},39 L${firstStainXEnd - 5},39 L${firstStainXEnd},50 L${firstStainXEnd - 5},61 L${firstStainXStart},61 z`,
                fill: GenomeBrowserConstants.CYTOBANDS_COLORS["acen"] || "",
            });
            SVG.addChild(group, "path", {
                d: `M${lastStainXStart},50 L${lastStainXStart + 5},39 L${lastStainXEnd},39 L${lastStainXEnd},61 L${lastStainXStart + 5},61 z`,
                fill: GenomeBrowserConstants.CYTOBANDS_COLORS["acen"] || "",
            });
        }

        // Resize elements and events
        // let status = "";
        this.status = "setRegion"; // Reset global status
        const centerPosition = this.region.center();
        const pointerPosition = (centerPosition * this.pixelBase) + offset;
        // this.svg.addEventListener("mousedown", () => {
        //     this.status = "setRegion";
        // });

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
        const positionGroup = SVG.addChild(group, "g", {});
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
            // visibility: "hidden",
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
            // visibility: "hidden",
        });
        this.resizeRight.addEventListener("mousedown", () => {
            this.status = "resizePositionBoxRight";
        });

        // $(this.positionBox).off('mouseenter');
        // $(this.positionBox).off('mouseleave');

        // positionGroup.addEventListener("mouseenter", () => {
        //     this.#recalculateResizeControls();
        //     this.#showResizeControls();
        // });
        // positionGroup.addEventListener("mouseleave", () => {
        //     this.#hideResizeControls();
        // });

        // Remove event listeners
        // $(this.svg).off('contextmenu');
        // $(this.svg).off('mousedown');
        // $(this.svg).off('mouseup');
        // $(this.svg).off('mousemove');
        // $(this.svg).off('mouseleave');

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
        region.start = (region.start < 1) ? 1 : region.start;
        // eslint-disable-next-line no-param-reassign
        region.end = (region.end > this.chromosomeLength) ? this.chromosomeLength : region.end;
    }

    updateRegionControls() {
        this.selBox.setAttribute("width", 0);
        this.selBox.setAttribute("height", 0);
        this.#recalculatePositionBox(this.region);
        this.#recalculateResizeControls();
    }

    setRegion(region) {
        // console.log('region modified chromosome')
        this.region.load(region);

        if (this.lastChromosome != this.region.chromosome) {
            this.draw();
        }

        this.updateRegionControls();
    }

    setCellBaseHost(host) {
        this.cellBaseHost = host;
    }

    getDefaultConfig() {
        return {
            width: 600,
            height: 75,
            hidden: false,
            collapsible: true,
            collapsed: false,
            offset: 20, // Internally used
        };
    }

}

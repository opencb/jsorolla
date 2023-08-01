import UtilsNew from "../../core/utils-new.js";
import Region from "../../core/bioinfo/region.js";
import {SVG} from "../../core/svg.js";
import GenomeBrowserConstants from "../genome-browser-constants.js";
import GenomeBrowserUtils from "../genome-browser-utils.js";


export default class KaryotypePanel {

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
        this.width = this.config.width;
        this.height = this.config.height;

        this.pixelBase = 0;
        this.collapsed = false;
        this.hidden = false;

        // set own region object
        this.region = new Region(this.config.region);

        this.regionChanging = false;
        this.rendered = false;

        this.elements = {};

        this.#initDom();
        this.#initEvents();

        this.setVisible(!this.hidden);
    }

    #initDom() {
        const template = UtilsNew.renderHTML(`
            <div id="${this.prefix}" style="user-select:none;">
                <div style="display:flex;justify-content:space-between;">
                    <div id="${this.prefix}Title" style="font-weight:bold;cursor:pointer;" data-cy="gb-karyotype-title">
                        ${this.config?.title || ""}
                    </div>
                    <div id="${this.prefix}Collapse" style="cursor:pointer;" data-cy="gb-karyotype-toggle">
                        <span id="${this.prefix}CollapseIcon" class="fa fa-minus"></span>
                    </div>
                </div>
                <div id="${this.prefix}Content" style="display:block;margin-top:8px;" data-cy="gb-karyotype-content"></div>
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

        // Mark group element
        this.markGroup = SVG.addChild(this.svg, "g", {
            cursor: "pointer",
        });

        this.positionBox = null;

        this.target.append(this.div);
    }

    #initEvents() {
        this.title.addEventListener("click", () => this.toggleContent());
        this.collapse.addEventListener("click", () => this.toggleContent());
    }

    draw() {
        this.clean();

        // to prevent negative values, we require a width size of at least 500px for drawing the karyotype.
        if (this.width < this.config.minWidth) {
            return;
        }

        let x = 20;
        const xOffset = this.width / this.config.chromosomes.length;
        const yMargin = 2;
        const biggerChr = this.config.chromosomes.reduce((maxSize, chromosome) => {
            return Math.max(maxSize, chromosome.size);
        }, 0);

        this.pixelBase = (this.height - 10) / biggerChr;
        this.chrOffsetY = {};
        this.chrOffsetX = {};

        this.config.chromosomes.forEach((chromosome, index) => {
            const chrSize = chromosome.size * this.pixelBase;
            let y = yMargin + (biggerChr * this.pixelBase) - chrSize;
            this.chrOffsetY[chromosome.name] = y;
            let firstCentromere = true;

            // Create group element to render the chromosome
            const group = SVG.addChild(this.svg, "g", {
                "cursor": "pointer",
                "data-chr-name": chromosome.name,
                "data-chr-index": index,
            });

            // Register click event listener
            group.addEventListener("click", event => {
                const offsetY = (event.pageY - $(this.svg).offset().top);
                const clickPosition = parseInt((offsetY - this.chrOffsetY[chromosome.name]) / this.pixelBase);

                this.#triggerRegionChange({
                    region: new Region({
                        chromosome: chromosome.name,
                        start: clickPosition,
                        end: clickPosition,
                    }),
                    sender: this,
                });
            });

            (chromosome.cytobands || []).forEach(cytoband => {
                const width = this.config.chromosomeWidth;
                const height = this.pixelBase * (cytoband.end - cytoband.start);
                // const color = this.colors[cytoband.stain] || "purple";
                const color = GenomeBrowserConstants.CYTOBANDS_COLORS[cytoband.stain] || "purple";

                if (cytoband.stain == "acen") {
                    let points = "";
                    const middleX = x + width / 2;
                    const middleY = y + height / 2;
                    const endX = x + width;
                    const endY = y + height;

                    if (firstCentromere) {
                        points = `${x},${y} ${endX},${y} ${endX},${middleY} ${middleX},${endY} ${x},${middleY}`;
                        firstCentromere = false;
                    } else {
                        points = `${x},${endY} ${x},${middleY} ${middleX},${y} ${endX},${middleY} ${endX},${endY}`;
                    }

                    SVG.addChild(group, "polyline", {
                        "points": points,
                        "stroke": "black",
                        "opacity": 0.8,
                        "fill": color
                    });
                } else {
                    SVG.addChild(group, "rect", {
                        "x": x,
                        "y": y,
                        "width": width,
                        "height": height,
                        "stroke": "grey",
                        "opacity": 0.8,
                        "fill": color
                    });
                }

                y += height;
            });

            // Display features of interest
            // const featuresGroup = SVG.addChild(group, "g", {});
            this.config.featuresOfInterest.forEach(item => {
                if (item.display?.visible) {
                    item.features.forEach(feature => {
                        if (feature.chromosome === chromosome.name) {
                            const featureHeight = Math.max(1, this.pixelBase * Math.abs(feature.end - feature.start));
                            const featureY = yMargin + (biggerChr * this.pixelBase) - chrSize + Math.min(feature.start, feature.end) * this.pixelBase;

                            // Display region rectangle
                            SVG.addChild(group, "rect", {
                                x: x,
                                y: featureY,
                                width: this.config.chromosomeWidth,
                                height: featureHeight,
                                fill: item.display?.color || "red",
                                opacity: 0.5,
                            });

                            // Display triangle at the right side of the chromosome
                            SVG.addChild(group, "path", {
                                d: `M${x + this.config.chromosomeWidth + 4},${featureY + featureHeight / 2} l5,-5 l0,10 z`,
                                fill: item.display?.color || "red",
                                opacity: 1.0,
                            });
                        }
                    });
                }
            });

            // Generate chromosome name
            const text = SVG.addChild(this.svg, "text", {
                "x": x + 1,
                "y": this.height,
                "font-size": 9,
                "fill": "black"
            });
            text.textContent = chromosome.name;

            this.chrOffsetX[chromosome.name] = x;
            x += xOffset;
        });


        this.positionBox = SVG.addChild(this.svg, "line", {
            "x1": 0,
            "y1": 0,
            "x2": 0,
            "y2": 0,
            "stroke": "orangered",
            "stroke-width": 2,
            "opacity": 0.5
        });
        this.#recalculatePositionBox(this.region);

        this.rendered = true;
        this.trigger("after:render", {
            sender: this,
        });
    }

    #triggerRegionChange(event) {
        if (!this.regionChanging) {
            this.regionChanging = true;
            this.trigger("region:change", event);

            setTimeout(() => {
                this.regionChanging = false;
            }, 700);
        } else {
            this.updateRegionControls();
        }
    }

    #recalculatePositionBox(region) {
        const centerPosition = region.center();
        const pointerPosition = centerPosition * this.pixelBase + this.chrOffsetY[region.chromosome];

        this.positionBox.setAttribute("x1", this.chrOffsetX[region.chromosome] - 10);
        this.positionBox.setAttribute("x2", this.chrOffsetX[region.chromosome] + 23);
        this.positionBox.setAttribute("y1", pointerPosition);
        this.positionBox.setAttribute("y2", pointerPosition);
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

    toggleContent() {
        this.collapsed ? this.showContent() : this.hideContent();
    }

    clean() {
        GenomeBrowserUtils.cleanDOMElement(this.svg);
    }

    setTitle(title) {
        this.title.textContent = title;
    }

    setWidth(width) {
        this.width = Math.max(0, width);
        this.svg.setAttribute("width", this.width);

        this.draw();
    }

    setRegion(region) {
        this.region.load(region);
        this.#recalculatePositionBox(this.region);
    }

    updateRegionControls() {
        this.#recalculatePositionBox(this.region);
    }

    addMark() {
        const mark = () => {
            if (this.region.chromosome != null && this.region.start != null) {
                if (this.chrOffsetX[this.region.chromosome] !== null) {
                    const x1 = this.chrOffsetX[this.region.chromosome] - 10;
                    const x2 = this.chrOffsetX[this.region.chromosome];
                    const y1 = (this.region.start * this.pixelBase + this.chrOffsetY[this.region.chromosome]) - 4;
                    const y2 = this.region.start * this.pixelBase + this.chrOffsetY[this.region.chromosome];
                    const y3 = (this.region.start * this.pixelBase + this.chrOffsetY[this.region.chromosome]) + 4;
                    const points = `${x1},${y1} ${x2},${y2} ${x1},${y3} ${x1},${y1}`;

                    SVG.addChild(this.markGroup, "polyline", {
                        "points": points,
                        "stroke": "black",
                        "opacity": 0.8,
                        "fill": "#33FF33"
                    });
                }
            }
        };

        if (this.rendered) {
            mark();
        } else {
            this.on("after:render", () => mark());
        }
    }

    unmark() {
        GenomeBrowserUtils.cleanDOMElement(this.markGroup);
    }

    // Get default configuration for karyotype panel
    getDefaultConfig() {
        return {
            width: 600,
            minWidth: 500,
            height: 75,
            collapsed: false,
            collapsible: true,
            region: null,
            title: "Karyotype",
            chromosomes: [],
            chromosomeWidth: 12,
            featuresOfInterest: [],
        };
    }

}

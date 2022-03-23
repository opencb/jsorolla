import UtilsNew from "../../core/utilsNew.js";
import Region from "../../core/bioinfo/region.js";
import {SVG} from "../../core/svg.js";
import GenomeBrowserConstants from "../genome-browser-constants.js";


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

        this.species = this.config.species;
        this.lastSpecies = this.config.species;

        this.chromosomeList = [];

        this.regionChanging = false;
        this.rendered = false;

        this.#initDom();
        this.#initEvents();

        this.setVisible(!this.hidden);
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
                <div id="${this.prefix}Content" style="display:block;"></div>
            </div>
        `);

        this.div = template.querySelector(`div#${this.prefix}`);
        this.titleDiv = this.div.querySelector(`div#${this.prefix}Title`);
        this.titleText = this.div.querySelector(`div#${this.prefix}TitleText`);
        this.collapseDiv = this.div.querySelector(`div#${this.prefix}Collapse`);
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
        this.titleDiv.addEventListener("click", () => {
            this.toggleContent();
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
        this.content.style.display = "inline";
        this.collapseDiv.classList.remove("active");
        this.collapseIcon.classList.remove("fa-plus");
        this.collapseIcon.classList.add("fa-minus");
        this.collapsed = false;
    }

    hideContent() {
        this.content.style.display = "none";
        this.collapseDiv.classList.add("active");
        this.collapseIcon.classList.remove("fa-minus");
        this.collapseIcon.classList.add("fa-plus");
        this.collapsed = true;
    }

    toggleContent() {
        this.collapsed ? this.showContent() : this.hideContent();
    }

    setTitle(title) {
        this.titleText.textContent = title;
    }

    setWidth(width) {
        this.width = width;
        this.svg.setAttribute("width", width);


        if (typeof this.chromosomeList !== "undefined") {
            this.clean();
            this.#drawSvg(this.chromosomeList, this.data2);
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

        // TODO: move to utils?
        const sortfunction = (a, b) => {
            let IsNumber = true;
            for (let i = 0; i < a.name.length && IsNumber == true; i++) {
                if (isNaN(a.name[i])) {
                    IsNumber = false;
                }
            }
            if (!IsNumber) return 1;
            return (a.name - b.name);
        };

        // Import chromosomes from cellbase
        this.config.cellBaseClient.get("genomic", "chromosome", undefined, "search")
            .then(data => {
                this.chromosomeList = UtilsNew.removeDuplicates(data.response[0].result[0].chromosomes, "name");
                this.chromosomeList.sort(sortfunction);
                this.#drawSvg(this.chromosomeList);
            });

        if (this.collapsed) {
            this.hideContent();
        }
    }

    #drawSvg(chromosomeList) {
        let x = 20;
        const xOffset = this.width / chromosomeList.length;
        const yMargin = 2;

        let biggerChr = 0;
        chromosomeList.forEach(chromosome => {
            if (chromosome.size > biggerChr) {
                biggerChr = chromosome.size;
            }
        });

        this.pixelBase = (this.height - 10) / biggerChr;
        this.chrOffsetY = {};
        this.chrOffsetX = {};

        chromosomeList.forEach((chromosome, index) => {
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
                // const chrClicked = this.getAttribute("chr");

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
                const width = 13;
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

    updateRegionControls() {
        this.#recalculatePositionBox(this.region);
    }

    setRegion(region) {
        this.region.load(region);
        let needDraw = false;

        if (this.lastSpecies != this.species) {
            needDraw = true;
            this.lastSpecies = this.species;
        }
        if (needDraw) {
            this.draw();
        }

        this.updateRegionControls();
    }


    // addMark(item) {
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
        $(this.markGroup).empty();
    }

    // Get default configuration for karyotype panel
    getDefaultConfig() {
        return {
            species: [],
            width: 600,
            height: 75,
            collapsed: false,
            collapsible: true,
            hidden: false,
            region: null,
            title: "Karyotype",
        };
    }

}

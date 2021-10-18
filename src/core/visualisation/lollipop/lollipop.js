

export default class Lollipop {

    constructor(div, tracks, config) {
        this.canvasWidth = document.querySelector(div).clientWidth;

        this.tracks = tracks;

        this.proteinLength = 8500;

        this.draw = new SVG().addTo(div).size(this.canvasWidth, 500);

        this.currentTrackOffset = 0; // temp solution

        tracks.forEach(track => {
            this.renderTrack(track);
        });

        document.addEventListener("mouseup", e => {
            /* console.log("mouseup");
            mouseDown = false;
            this.resizeVariant(this.bar, e);*/
            this.clearTooltips();

        });

    }

    renderTrack(track) {
        switch (track.id) {
            case "positionBar":
                this.draw.size(this.canvasWidth, this.currentTrackOffset + track.view.height);
                this.positionBarOrigin = this.currentTrackOffset;
                this.positionBar(track);
                break;
            case "variants":
                // circle and line can have different coordinates (due to collisions)
                this.draw.size(this.canvasWidth, this.currentTrackOffset + track.view.scaleHeight + track.view.variantAreaHeight);
                this.variantsOrigin = this.currentTrackOffset;
                this.variants(track);
                break;
            default:
                break;
        }
    }

    variants(track, proteinRange) {
        const height = track.view.scaleHeight + track.view.variantAreaHeight;

        if (this.variantsG) {
            this.variantsG.clear();
        } else {
            this.variantsG = this.draw.group().addClass("variants");
        }

        this.scaleG = this.variantsG.group().addClass("scale").transform({translateY: this.variantsOrigin});
        this.scaleG.rect(this.canvasWidth, track.view.scaleHeight).attr({fill: "#fff", stroke: "#000"});


        // if proteinRange is defined we only render the scale accordingly and only the variants within the position range are rendered
        const range = proteinRange ?? [0, this.proteinLength];
        this.drawTicks(this.scaleG, 10, track.view.scaleHeight, range[0], range[1]);


        const variantAreaG = this.variantsG.group().addClass("variants-lollipops").transform({translateY: this.variantsOrigin + track.view.scaleHeight});
        const rect = variantAreaG.rect(this.canvasWidth, height).attr({fill: "#fff", stroke: "#000"});

        const width = variantAreaG.width();
        track.variants.forEach(variant => {

            if (variant.pos >= range[0] && variant.pos <= range[1]) {
                const y = height/2; // TODO y coord is dynamic on collisions
                const size = 50; // size is proportional to the number of occurrences of the variant

                const x = this.rescaleLinear(variant.pos, range[0], range[1], 0, width); // starting x coord. it needs to handle collisions

                const v = variantAreaG.group()
                    .addClass("variant")
                    .attr({"text-anchor": "middle"})
                    .transform({translateX: x, translateY: y});
                this.edge(v, size, 0, y);
                v.circle(size).dx(-size/2).fill(variant.color).stroke({color: "#000", opacity: 0}).click(e => this.onClickVariant(e, v, variant));
                v.text(variant.id).dy(-5).font({size: "10px"});
            }

        });

        this.currentTrackOffset += height;
    }

    renderVariant() {
    }

    onClickVariant(e, parent, variantData) {
        console.log(e);
        console.log(parent);
        console.log(variantData);


        this.clearTooltips();

        parent.addClass("active");
        const tooltip = parent.group().addClass("tooltip");

        tooltip.text("Tooltip").font({size: "20px"});
        // tooltip.path("M 0 0 A 93 100 0 1 1 50 100").fill("none").stroke("#000")
        tooltip.circle(20).fill("none").stroke("#000");


        tooltip.animate({
            duration: 100,
            delay: 0,
            when: "now",
            swing: true,
            times: 1,
            wait: 200
        }).ease("<>").scale(2);


        // variantData.active = !variantData.active;

    }

    clearTooltips() {
        SVG.find(".tooltip").remove();
    }

    edge(parent, y1, x2, y2) {
        // x2 tunes the collision detection
        const hArea = 50;
        console.log(y1, x2, y2);
        parent.path(`m 50 ${y2} v -140 L ${x2} 100 V ${y1}`).fill("none").addClass("edge-animate").stroke("#3a3a3a");
    }

    /**
     * Draw the ticks of the progressBar track and the scale in Variants track
     * @param {SVGElement} g parent group
     * @param {Number} num Number of ticks
     * @param {Number} barHeight height of the bar
     * @param {Number} startPos Original start position
     * @param {Number} endPos Original end position
     * @returns void
     */
    drawTicks = (g, num, barHeight, startPos, endPos) => {
        // g.replace(this.draw.group().addClass("scale").transform({translateY: this.currentTrackOffset}))
        // document.querySelector(".scale")
        const tickHeight = barHeight * .2; // * 0.2;
        const w = g.width(); // protein length
        const tickSpace = w/num;
        const x = 0;
        const y = 0;
        for (let i = 1; i <= num; i++) {
            const group = g.group().addClass("tick").attr({"text-anchor": "middle"}).transform({translateX: tickSpace * i});
            group.line(0, barHeight - tickHeight, 0, barHeight).stroke({
                color: "#000",
                width: 1,
            }).attr({shapeRendering: "crispEdges", z: 120});
            const label = this.rescaleLinear(i, 0, num, startPos, endPos); // reverse normalisation
            group.text(label).dy(barHeight - tickHeight).font({size: "10px"}).attr({z: 120});
        }
    };

    positionBar(track) {
        if (this.bar) {
            this.bar.clear();
        } else {
            this.bar = this.draw.group().addClass("positionBar").transform({translateY: this.positionBarOrigin});
        }

        this.bar.rect(this.canvasWidth, track.view.height).attr({fill: "#e8e8e8", stroke: "black"});
        this.drawTicks(this.bar, 10, track.view.height, 0, this.proteinLength);

        const cursorStart = this.bar.line(0, 0, 0, track.view.height).stroke({
            color: "#000",
            width: 0.2,
        }).attr({shapeRendering: "crispEdges"});

        /* cursorStart.on('beforedrag', e => {
            console.log("cursorStart drag")
        })

        bar.on('beforedrag', e => {
            console.log("bar drag")
        })*/

        let mouseDown = false;
        const rangeBar = this.bar.rect(0, track.view.height).attr({"fill": "#a1a1a1", "stroke": "black", "fill-opacity": .4}).addClass("range");


        this.bar.mousemove(e => {
            cursorStart.show();
            const dim = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - dim.left - 5; // little offset to avoid browser dragging action
            if (mouseDown) {

                const start = cursorStart.x() <= mouseX ? cursorStart.x() : mouseX;
                const w = Math.abs(cursorStart.x() - mouseX);

                this.range = [start, start + w];
                rangeBar.show();
                rangeBar.size(Math.min(w, this.bar.width()), 50).move(start);
                // console.log(start);

            } else {
                cursorStart.move(mouseX, 0);
            }

            this.log(cursorStart.x(), rangeBar.width(), mouseX);
        });

        this.bar.mouseout(e => {
            cursorStart.hide();
        });

        this.bar.mousedown(e => {
            console.log(e);
            mouseDown = true;
        });

        this.bar.mouseup(e => {
            mouseDown = false;
            this.resizeVariant(this.bar, e);
        });

        this.bar.dblclick(e => {
            e.preventDefault();
            console.log("db click");
            cursorStart.hide();
            rangeBar.hide();
            this.range = [0, this.canvasWidth];
            // console.log("this.proteinLength", this.proteinLength)
            this.resizeVariant(this.bar, e);

        });


        this.currentTrackOffset += track.view.height;

    }

    resizeVariant(g, e) {
        console.log("resizeVariant"); // range is in screen pixels
        const minScreen = 0;
        const maxScreen = g.width();
        const minProtein = 0;
        const maxProtein = this.proteinLength;
        const minOldRange = this.range[0];
        const maxOldRange = this.range[1];
        const newMinRange = this.rescaleLinear(minOldRange, minScreen, maxScreen, minProtein, maxProtein);
        const newMaxRange = this.rescaleLinear(maxOldRange, minScreen, maxScreen, minProtein, maxProtein);

        this.variants(this.tracks.find(t => t.id === "variants"), [newMinRange, newMaxRange]); // TODO temp solution
    }

    variant(data) {

    }

    // min-max normalization
    rescaleLinear(value, oldMin, oldMax, newMin, newMax) {
        const oldRange = oldMax - oldMin;
        const newRange = newMax - newMin;
        const rescaled = newMin + ((value - oldMin) * newRange / oldRange);
        return Math.round(rescaled);
    }

    log(start, range, mouseX, mouseY) {
        document.querySelector("#console").innerHTML = `
            start:  ${start}
            mouseX (end): ${mouseX}
            range:  ${range}
            mouseY: ${mouseY}
        `;
    }

}

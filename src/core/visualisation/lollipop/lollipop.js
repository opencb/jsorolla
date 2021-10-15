

export default class Lollipop {

    constructor(div, tracks, config) {
        this.canvasWidth = document.querySelector(div).clientWidth;

        this.proteinLength = 8500;

        this.draw = new SVG().addTo(div).size(0, 500);

        this.currentTrackOffset = 0; // temp solution

        tracks.forEach(track => {
            this.renderTrack(track);
        });


    }

    renderTrack(track) {
        switch (track.id) {
            case "positionBar":
                this.positionBar(track);
                break;
            case "variants":
                this.variants(track);
                break;
            default:
                break;
        }
    }

    variants(track) {

        // circle and line can have different coordinates (due to collisions)
        const scaleHeight = 30;
        const variantAreaHeight = 500;
        const height = scaleHeight + variantAreaHeight; // 30 for the scale
        this.draw.size(null, this.currentTrackOffset + height);

        this.scaleG = this.draw.group().addClass("scale").transform({translateY: this.currentTrackOffset});
        this.scaleG.rect(this.canvasWidth, scaleHeight).attr({fill: "#fff", stroke: "#000"});

        this.drawTicks(this.scaleG, 10, scaleHeight, 0, this.proteinLength);

        const variantAreaG = this.draw.group().addClass(track.id).transform({translateY: this.currentTrackOffset + scaleHeight});
        const rect = variantAreaG.rect(this.canvasWidth, height).attr({fill: "#fff", stroke: "#000"});

        this.currentTrackOffset += height;

        const width = variantAreaG.width();
        track.variants.forEach(variant => {
            const y = height/2; // TODO y coord is dynamic on collisions
            const size = 50; // size is proportional to the number of occurrences of the variant

            const x = this.rescaleLinear(variant.pos, 0, this.proteinLength, 0, width); // starting x coord. it needs to handle collisions

            const v = variantAreaG.group()
                .addClass("variant")
                .attr({"text-anchor": "middle"})
                .transform({translateX: x, translateY: y});
            this.edge(v, size/2, 0, y);
            v.circle(size).dx(-size/2).fill(variant.color).stroke({color: "#000", opacity: 0}).click(e => this.onClickVariant(e, v, variant));
            v.text(variant.id).dy(-5).font({size: "10px"});
        });
    }

    renderVariant() {
    }

    onClickVariant(e, parent, variantData) {
        console.log(e);
        console.log(parent);
        console.log(variantData);

        if (variantData.active) {
            parent.removeClass("active");

        } else {
            parent.addClass("active");
            const tooltip = parent.group();

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
        }

        variantData.active = !variantData.active;

    }

    edge(parent, y1, x2, y2) {
        // x2 tunes the collision detection
        const hArea = 50;
        parent.path(`m 0 ${y1} v ${y1 + y1*2} L ${x2} 150 V ${y2}`).fill("none").stroke("#3a3a3a");
    }

    /**
     * Draw the ticks of the progressBar track and the scale in Variants track
     * @param {SVGElement} g parent group
     * @param {Number} num Number of ticks
     * @param {Number} barHeight height of the bar
     * @param {Number} startPos Original start position
     * @param {Number} endPos Original end position
     * @return void
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
        const height = 50;
        this.draw.size(null, this.currentTrackOffset + height);

        const originX = 0; // track origin x coordinate
        const originY = 0; // track origin y coordinate


        const bar = this.draw.group().addClass("positionBar").transform({translateY: this.currentTrackOffset});
        bar.rect(this.canvasWidth, height).attr({fill: "#e8e8e8", stroke: "black"});
        this.drawTicks(bar, 10, height, 0, this.proteinLength);

        this.currentTrackOffset += height;

        const cursorStart = bar.line(0, 0, 0, height).stroke({
            color: "#000",
            width: 0.2,
        }).attr({shapeRendering: "crispEdges"});
        const cursorEnd = bar.line(0, 0, 0, height).stroke({
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
        const rangeBar = bar.rect(0, height).attr({"fill": "#a1a1a1", "stroke": "black", "fill-opacity": .4}).addClass("range");


        bar.mousemove(e => {
            cursorStart.show();
            const dim = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - dim.left - 5; // little offset to avoid browser dragging action
            if (mouseDown) {


                cursorEnd.show();
                cursorEnd.move(cursorStart.x());

                const start = cursorStart.x() <= cursorEnd.x() ? cursorStart.x() : cursorEnd.x();
                const w = Math.abs(cursorStart.x() - cursorEnd.x());

                this.range = [start, start + w];
                rangeBar.show();
                cursorEnd.show();
                // console.log("s", start, "w", w);

                cursorEnd.move(Math.min(mouseX, bar.width()), 0);
                rangeBar.size(Math.min(w, bar.width()), 50).move(start);
                // console.log(start);

            } else {
                cursorStart.move(mouseX, 0);
            }

            this.log(cursorStart.x(), cursorEnd.x(), rangeBar.width(), mouseX);
        });

        bar.mouseout(e => {
            cursorStart.hide();
        });

        bar.mousedown(e => {
            console.log(e);
            mouseDown = true;
        });

        bar.mouseup(e => {
            mouseDown = false;
            /* cursorStart.hide();
            cursorEnd.hide();
            rangeBar.hide();*/
            this.resizeVariant(bar, e);
        });

        bar.dblclick(e => {
            console.log("db click");
            cursorStart.hide();
            cursorEnd.hide();
            rangeBar.hide();
        });

        document.addEventListener("mouseup", e => {
            console.log("mouseup");
            mouseDown = false;
            /* cursorStart.hide();
            cursorEnd.hide();
            rangeBar.hide();*/
            this.resizeVariant(bar, e);
        });
    }

    resizeVariant(g, e) {
        console.log(this.range);
        const minScreen = 0;
        const maxScreen = g.width();
        const minProtein = 0;
        const maxProtein = this.proteinLength;
        const minOldRange = this.range[0];
        const maxOldRange = this.range[0] + this.range[1];
        const newMinRange = this.rescaleLinear(minOldRange, minScreen, maxScreen, minProtein, maxProtein);
        const newMaxRange = this.rescaleLinear(maxOldRange, minScreen, maxScreen, minProtein, maxProtein);

        SVG.find("g.scale g.tick").remove(); // TODO temp solution
        this.drawTicks(this.scaleG, 10, 30, newMinRange, newMaxRange);
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

    log(start, end, range, mouseX, mouseY) {
        document.querySelector("#console").innerHTML = `
            start:  ${start}
            end:    ${end}
            range:  ${range}
            mouseX: ${mouseX}
            mouseY: ${mouseY}
        `;
    }

}

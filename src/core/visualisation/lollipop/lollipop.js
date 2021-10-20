

export default class Lollipop {

    constructor(div, tracks, config) {
        this.canvasPadding = 10;
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

    variants(track, viewFrame) {
        const height = track.view.scaleHeight + track.view.variantAreaHeight;

        if (this.variantsG) {
            this.variantsG.clear();
        } else {
            this.variantsG = this.draw.group().addClass("variants").transform({translateX: this.canvasPadding});
        }

        // this.variantsG.draggable();

        this.scaleG = this.variantsG.group().addClass("scale").transform({translateY: this.variantsOrigin});
        this.scaleG.rect(this.canvasWidth - this.canvasPadding * 2, track.view.scaleHeight).attr({fill: "#fff", stroke: "#9d9d9d"});


        // if proteinRange is defined we only render the scale accordingly. Only the variants within the position range are rendered
        this.viewFrame = viewFrame ?? [0, this.proteinLength];
        this.drawTicks(this.scaleG, 10, track.view.scaleHeight, this.viewFrame[0], this.viewFrame[1]);


        const variantAreaG = this.variantsG.group().addClass("variants-lollipops").transform({translateY: this.variantsOrigin + track.view.scaleHeight});
        const rect = variantAreaG.rect(this.canvasWidth - this.canvasPadding * 2, height).attr({fill: "#fff", stroke: "#9d9d9d"});

        const width = variantAreaG.width();


        this.circles = this.preProcessVariants(track);

        this.circles.forEach((variant, i) => {

            if (variant.pos >= this.viewFrame[0] && variant.pos <= this.viewFrame[1]) {
                const y = height/2; // TODO y coord is dynamic on collisions
                const size = track.view.circleSize; // size is proportional to the number of occurrences of the variant

                const x = this.rescaleLinear(variant.pos, this.viewFrame[0], this.viewFrame[1], 0, width); // starting x coord. it needs to handle collisions

                const v = variantAreaG.group()
                    .addClass("variant")
                    .attr({"text-anchor": "middle"})
                    .transform({translateX: x, translateY: height});
                v.delay(i * 100);
                v.animate({duration: 1000}).dy(-height/2).ease(">");

                this.edge(v, size, 0, y);

                v.circle(size)
                    .dx(-size/2)
                    .fill(variant.color ?? "#6872ff")
                    .stroke({color: "#000", opacity: 0})
                    .scale(1)
                    .click(e => this.onClickVariant(e, v, variant))
                    //.delay(i * 200)
                    //.animate()
                    //.size(size).dx(-size/2)*/;

                if (variant.type === "cluster") {
                    v.text(variant.variants.length).dy(size/2 + 5).font({size: variant.variants.length + 20 + "px"});
                } else {
                    // single variant
                    v.text(variant.id).dy(-5).font({size: "10px"});
                }
            }

        });

        this.currentTrackOffset += height;
    }

    positionBar(track) {
        if (this.bar) {
            this.bar.clear();
        } else {
            this.bar = this.draw.group().addClass("positionBar").transform({translateY: this.positionBarOrigin, translateX: this.canvasPadding});
        }

        this.bar.rect(this.canvasWidth - this.canvasPadding*2, track.view.height).attr({fill: "#e8e8e8", stroke: "#000"});

        // this.bar.draggable();

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
            const mouseX = e.clientX - dim.left;
            if (mouseDown) {

                const start = cursorStart.x() <= mouseX ? cursorStart.x() : mouseX;
                const w = Math.abs(cursorStart.x() - mouseX);

                this.viewFrame = [start, start + w];
                rangeBar.show();
                rangeBar.size(Math.min(w + 1, this.canvasWidth - this.canvasPadding*2), 50).move(start); // +1 is for avoid 0 range
                // console.log(start);

            } else {
                cursorStart.move(mouseX, 0);
            }

            this.log(cursorStart.x(), rangeBar.width(), mouseX, this.viewFrame);
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
            this.viewFrame = [0, this.canvasWidth];
            // console.log("this.proteinLength", this.proteinLength)
            this.resizeVariant(this.bar, e);

        });


        this.currentTrackOffset += track.view.height;

    }

    /*
     * return the object in the structure expected for the plot (either a single variant or a cluster)
    */
    preProcessVariants(track) {
        const addResult = pool => {
            if (pool.length > 1) {
                const id = pool[0].id + "_" + pool[pool.length-1].id;
                const poolPos = pool.reduce((acc, curr) => curr.pos + acc, 0) / pool.length; // (unweighted avg linkage)
                return {id: "cluster_" + id, pos: poolPos, variants: [...pool], type: "cluster"};
            } else {
                return {...pool[0], type: "variant"};
            }
        };


        const points = [];
        const _variants = [...track.variants].sort((a, b) => a.pos - b.pos);
        let pool = [];
        let poolViewFramePos = 0;
        // TODO collision algorithm in progress
        _variants.forEach(variant => {
            // 1. check and generate clusters (dynamic on current viewFrame). Collision detection to get what datapoint merge
            // 2. calculate x coordinate (keeping original and new). Collision detection to get where to render the circles

            // convert original gene position into viewFrame position
            const variantViewFramePos = this.rescaleLinear(variant.pos, this.viewFrame[0], this.viewFrame[1], 0, this.canvasWidth);

            if (!pool.length) {
                pool.push(variant);
                poolViewFramePos = variantViewFramePos;
            } else {
                if (variantViewFramePos < poolViewFramePos + track.view.circleSize) {
                    pool.push(variant);
                    poolViewFramePos = (poolViewFramePos + variantViewFramePos) / 2;
                } else {
                    points.push(addResult(pool));
                    pool = [variant];
                    poolViewFramePos = variantViewFramePos;

                }
            }
        });

        // TODO temp solution. there is still something in the pool
        if (pool.length) {
            points.push(addResult(pool));
        }


        return points;
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

        // path is drawn from bottom to top
        parent.path(`m 10 ${y2} v -140 L ${x2} 100 V ${y1}`).fill("none").addClass("edge-animate").stroke("#3a3a3a");
    }

    /*
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
        for (let i = 1; i < num; i++) {
            const group = g.group().addClass("tick").attr({"text-anchor": "middle"}).transform({translateX: tickSpace * i});
            group.line(0, barHeight - tickHeight, 0, barHeight).stroke({
                color: "#000",
                width: 1,
            }).attr({shapeRendering: "crispEdges", z: 120});
            const label = this.rescaleLinear(i, 0, num, startPos, endPos); // reverse normalisation
            group.text(label).dy(barHeight - tickHeight - 2).font({size: "10px"}).attr({z: 120});
        }
    };

    resizeVariant(g, e) {
        console.log("resizeVariant"); // range is in screen pixels
        const minScreen = 0;
        const maxScreen = g.width();
        const minProtein = 0;
        const maxProtein = this.proteinLength;
        const minOldRange = this.viewFrame[0];
        const maxOldRange = this.viewFrame[1];
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

    log(start, range, mouseX, viewFrame) {
        document.querySelector("#console").innerHTML = `
            start:  ${start}
            mouseX (end): ${mouseX}
            range:  ${range}
            viewFrame: ${viewFrame}
        `;
    }

}

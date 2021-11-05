

export default class Lollipop {

    constructor(div, tracks, config) {
        this.canvasPadding = 0;
        this.canvasWidth = document.querySelector(div).clientWidth;

        this.tracks = tracks;

        this.proteinStart = 0;
        this.proteinEnd = 8500;

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
                this.positionBarRender(track);
                break;
            case "variants":
                // circle and line can have different coordinates (due to collisions)
                this.draw.size(this.canvasWidth, this.currentTrackOffset + track.view.scaleHeight + track.view.variantAreaHeight);
                this.variantsOrigin = this.currentTrackOffset;
                this.variantsRender(track);
                break;
            default:
                break;
        }
    }

    variantsRender(track, viewRange) {
        const height = track.view.scaleHeight + track.view.variantAreaHeight;

        if (this.variantsG) {
            this.variantsG.draggable(false);
            this.variantsG.clear();
        } else {
            this.variantsG = this.draw.group().addClass("variants").transform({translateX: this.canvasPadding});
        }

        // this.variantsG.draggable();

        this.scaleG = this.variantsG.group().addClass("scale").transform({translateY: this.variantsOrigin});
        this.scaleG.rect(this.canvasWidth - this.canvasPadding, track.view.scaleHeight).attr({fill: "#fff", stroke: "#9d9d9d"});

        this.clusterFactor = .2; // cluster distance factor: merge 2 nodes if they overlap more than 80%

        // if proteinRange is defined we only render the scale accordingly. Only the variants within the position range are rendered
        this.viewRange = viewRange ?? [0, this.canvasWidth];
        // TODO review  viewRange and viewProteinRange on resize
        this.viewProteinRange = viewRange ?? [this.proteinStart, this.proteinEnd];

        this.drawTicks(this.scaleG, 10, track.view.scaleHeight, this.viewProteinRange[0], this.viewProteinRange[1]);


        const main = this.variantsG.group().addClass("variants-area-wrapper").transform({translateY: this.variantsOrigin + track.view.scaleHeight});

        const variantAreaWrapper = main.rect(this.canvasWidth - this.canvasPadding, height).attr({fill: "#fff" /* stroke: "#9d9d9d"*/});
        const variantArea = main.group().addClass("variant-area").transform({translateX: this.canvasPadding});
        const variantAreaBackground = variantArea.rect(this.canvasWidth - this.canvasPadding * 2, height).addClass("variant-area-background").attr({fill: "#fff"}).transform({translateX: this.canvasPadding});
        const width = variantAreaWrapper.width();

        this.resizedViewFrameBox = [];
        // enable horizontal drag in variantArea only if this.viewProteinRange is different that default
        if (this.viewProteinRange[0] !== this.proteinStart && this.viewProteinRange[1] !== this.proteinEnd) {
            this.variantsG.draggable();

            this.variantsG.on("dragstart", e => {
                this.resizedViewFrameBox[0] = e.detail.event.offsetX;
            });

            this.variantsG.on("dragend", e => {
                this.resizedViewFrameBox[1] = e.detail.event.offsetX;
            });

            this.variantsG.on("dragmove", e => {
                const {handler, box} = e.detail;
                e.preventDefault();
                handler.move(box.x, null);
            });
        } else {
            this.variantsG.draggable(false);
        }

        this.circles = this.prepareVariants(track); // add viewPos, size (default) and offset (0)
        this.clusterVariants(this.circles, track);


        // const path = variantArea.path('M 50 50 150 150').stroke("#000").animate({delay: 2000}).plot('M 50 50 50 0')


        this.edges = [];
        this.filterVisible(this.circles).forEach((variant, i) => {

            // console.log("variant", variant);
            const y = height/2 - variant.size; // TODO y coord is dynamic on collisions


            const v = variantArea.group()
                .addClass("variant")
                .attr({"text-anchor": "middle"});
            // .transform({translateX: variant.viewPos, translateY: y});

            v.transform({translateX: variant.viewPos, translateY: height + variant.size});
            v.delay(i * 100);
            v.animate({duration: 500}).transform({translateX: variant.viewPos, translateY: height/2}).ease(">");


            const edge = this.edge(v, variant, height/2, variant.viewPos, variant.offset);

            const circleWrapper = v.group();
            const circle = circleWrapper.circle(variant.size)
                .dx(-variant.size/2 + variant.offset)
                .dy(-variant.size/2)
                .fill(variant.color ?? "#6872ff")
                .stroke({color: "#000", opacity: 0})
                .scale(1);

            // .delay(i * 200)
            // .animate()
            // .size(size).dx(-size/2)*/;

            if (variant.type === "cluster") {
                circleWrapper.text(variant.variants.length).dy(5).dx(variant.offset).font({size: variant.size * .5 + "px"});
            } else {
                // single variant
                circleWrapper.text(variant.id).dy(-variant.size/2 - 5).dx(variant.offset).font({size: "10px"});
            }

            v.click(e => this.onClickVariantGroup(e, circle, variant));
            variant.domRef = circleWrapper;
            variant.domRefEdge = edge;


        });
        this.layoutVariants(this.circles, track);
        this.updateVariants(track);

        this.currentTrackOffset += height;
    }

    updateVariants(track) {
        const height = (track.view.scaleHeight + track.view.variantAreaHeight) /2;
        // TODO maybe use svg.js timeline
        const circles = this.filterVisible(this.circles);
        const delay = circles.length * 100;
        circles.forEach((variant, i) => {
            variant.domRef.animate({delay, duration: 1000}).dx(variant.offset).ease("<");
            variant.domRefEdge.animate({delay, duration: 1000}).plot(`M ${0} ${height} V ${height * .5} L ${variant.offset} ${height * .4} V ${variant.size/2 + 5}`);
        });
    }

    positionBarRender(track) {
        if (this.bar) {
            this.bar.clear();
        } else {
            this.bar = this.draw.group().addClass("positionBar").transform({translateY: this.positionBarOrigin, translateX: this.canvasPadding});
        }

        this.bar.rect(this.canvasWidth, track.view.height).attr({fill: "#e8e8e8", stroke: "#000"});

        // this.bar.draggable();

        this.drawTicks(this.bar, 10, track.view.height, this.proteinStart, this.proteinEnd);

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
            const mouseX = e.offsetX;
            if (mouseDown) {

                const start = cursorStart.x() <= mouseX ? cursorStart.x() : mouseX;
                const w = Math.abs(cursorStart.x() - mouseX);

                this.viewRange = [start, start + w];
                rangeBar.show();
                rangeBar.size(Math.min(w + 1, this.canvasWidth), track.view.height).move(start); // +1 is for avoid 0 range
                // console.log(start);
            } else {
                cursorStart.move(mouseX + 1, 0);
            }

            this.log(cursorStart.x(), rangeBar.width(), mouseX, this.viewRange);
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
            this.viewRange = [0, this.canvasWidth];
            this.resizeVariant(this.bar, e);

        });


        this.currentTrackOffset += track.view.height;

    }

    prepareVariants(track) {
        const _variants = [...track.variants].sort((a, b) => a.pos - b.pos);
        return _variants.map(variant => ({
            ...variant,
            size: track.view.circleSize,
            viewPos: this.rescaleLinear(variant.pos, this.viewProteinRange[0], this.viewProteinRange[1], 0, this.canvasWidth),
            offset: 0
        }));
    }

    filterVisible(variants) {
        return variants.filter(variant => variant.pos >= this.viewProteinRange[0] && variant.pos <= this.viewProteinRange[1]);
    }

    /*
     * return the object in the structure expected for the plot (either a single variant or a cluster)
    */
    clusterVariants(variants, track) {
        const addResult = (pool, offset) => {

            if (pool.length > 1) {
                const id = pool[0].id + "_" + pool[pool.length-1].id;
                const poolPos = pool.reduce((acc, curr) => curr.pos + acc, 0) / pool.length; // unweighted avg linkage
                const variantViewFramePos = this.rescaleLinear(poolPos, this.viewProteinRange[0], this.viewProteinRange[1], 0, this.canvasWidth);
                return {id: "cluster_" + id,
                    viewPos: variantViewFramePos,
                    pos: poolPos,
                    variants: [...pool],
                    type: "cluster",
                    size: Math.min((Math.log(pool.length) * 10) + track.view.circleSize, track.view.circleSize * 5), // max size is 3 times default
                    offset: 0
                };
            } else {
                return {...pool[0], type: "variant"};
            }
        };


        const points = [];
        const _variants = [...variants].sort((a, b) => a.pos - b.pos);
        let pool = [];
        let poolViewFramePos = 0;
        // TODO collision algorithm in progress
        _variants.forEach(variant => {
            // 1. check and generate clusters (dynamic on current viewFrame). Collision detection to get what datapoint merge
            // 2. calculate x coordinate (keeping original and new). Collision detection to get where to render the circles

            // convert original gene position into viewFrame position
            // const variantViewFramePos = this.rescaleLinear(variant.pos, this.viewFrame[0], this.viewFrame[1], 0, this.canvasWidth);

            const clusteringMaxDistance = poolViewFramePos + variant.size * this.clusterFactor;
            if (!pool.length) {
                pool.push(variant);
                poolViewFramePos = variant.viewPos;
            } else {
                if (variant.viewPos < clusteringMaxDistance) {
                    pool.push(variant);
                    poolViewFramePos = (poolViewFramePos + variant.viewPos) / 2;
                } else {
                    points.push(addResult(pool));
                    pool = [variant];
                    poolViewFramePos = variant.viewPos;

                }
            }
        });

        // TODO temp solution. there is still something in the pool
        if (pool.length) {
            points.push(addResult(pool));
        }


        this.circles = points;
    }


    /*
     * Very similar as the previous step (clusterVariants).
     * This time we don't cluster, we change the position of the circle, either of a single one or a whole group.
     *
     * NOTE: layoutVariants() have to be iterative, circles can be moved more than once (the offset can be negative and a circle can collide with the previous one)
     * // TODO in progress
     */
    layoutVariants(circles, track) {
        const i = 0;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            // console.log("it", i++);
            const state = this.moveIntersected(this.circles);
            if (state === -1) {
                // increase cluster distance
                console.error("no solution");
                break;
            }
            if (state === 0) {
                // console.log("collision solved")
                break;
            }
        }
    }

    // returns false until either collision are solved or there is no valid solution
    moveIntersected(arr = [], it = 0) {

        /**
         * TODO:
         * at the moment the case in which there is no space for all the nodes is not covered and it will result in an infinite recursion.
         * Next steps:
         * 1. DONE Turn recursion into iterative
         * 2. DONE implement a backtracking mechanism and increase the clustering max distance (in case of no valid solution available)
         * 3. DONE implement updatable edges
          */

        const boundaries = [0, 1000];

        const step = 1;
        const collisions = this.detectCollisions(arr);

        if (collisions.length < 1 /* || it > 30*/) {
            return 0;
        }

        const mostIntersected = collisions.sort((a, b) => a[1] - b[1])[0];

        const left = arr[Math.floor(mostIntersected[0])];
        const right = arr[Math.ceil(mostIntersected[0])];

        if (!this.mostIntersectedLeft) {
            this.mostIntersectedLeft = left.offset;
            this.mostIntersectedRight = right.offset;
        } else {
            // stored offset is the same as the prev iteration
            // console.error("increasing", this.mostIntersectedLeft, this.mostIntersectedRight, left.offset, right.offset)
            // TODO this exit condition is not correct. Find a safe way to get out of the loop in case of a solution doesnt exist.
            if (this.mostIntersectedLeft === left.offset && this.mostIntersectedRight === right.offset) {
                console.error("same offset");
                // return -1;
            }
        }

        // check left boundary
        // console.log(`${left.viewPos} ${left.offset} ${left.size}`);
        if ((left.viewPos + left.offset) - (left.size) - step >= boundaries[0]) {
            left.offset -= step;
        } else {
            right.offset += step * 2;
        }

        // check right boundary
        if ((right.viewPos + right.offset) + (right.size) + step <= boundaries[1]) {
            right.offset += step;
        } else {
            left.offset -= step * 2;
        }
        // this.moveIntersected(arr, it+1);
        return 1;


    }

    detectCollisions(arr = []) {
        const margin = 1; // margin between circles
        const result = [];
        for (let i = 0; i < arr.length - 1; i++) {

            const dist = ((arr[i + 1].viewPos + arr[i + 1].offset) - (arr[i + 1].size / 2)) - ((arr[i].viewPos + arr[i].offset) + (arr[i].size / 2));
            if (dist < margin) {
                result.push([i + 0.5, dist]);
            }
        }
        return result;
    }

    renderVariant() {
    }

    onClickVariantGroup(e, circle, variantData) {
        console.log(e);
        console.log(circle);
        console.log(variantData);


        // circle.animate().ease(SVG.easing.beziere(10,20,30,40)).scale(1.1);

        /* this.clearTooltips();
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
        }).ease("<>").scale(2);*/


        // variantData.active = !variantData.active;

    }

    clearTooltips() {
        SVG.find(".tooltip").remove();
    }

    edge(parent, circle, height, position, offset) {
        // path is drawn from bottom to top
        // last 30 is last point of the path


        return parent.path(`M ${0} ${height} V ${height * .5} L ${offset} ${height * .4} V ${circle.size/2 + 5}`)
            .fill("none")
            .addClass("edge-animate")
            .stroke(circle.color ?? "#000");
    }

    /*
     * Draw the ticks of the progressBar track and the scale in Variants track
     * @param {SVGElement} g parent group
     * @param {Number} num Number of major ticks
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
        for (let i = -num; i <= num * 2; i++) {
            const group = g.group().addClass("tick").attr({"text-anchor": "middle"}).transform({translateX: tickSpace * i});

            const position = this.rescaleLinear(i, 0, num, startPos, endPos); // reverse normalisation

            // skip position regative and > of the area of interest
            if (position < 0 || position > this.proteinEnd) {
                continue;
            }
            // not rendering the first and last major tick
            if (i !== 0 && i !== num) {
                group.line(0, barHeight - tickHeight, 0, barHeight).stroke({
                    color: "#000",
                    width: 1,
                }).attr({shapeRendering: "crispEdges", z: 120});

                group.text(position).dy(barHeight - tickHeight - 2).font({size: "10px"}).attr({z: 120});
            }

            // minor tick
            group.line(0, barHeight - tickHeight/2, 0, barHeight)
                .stroke({
                    color: "#000",
                    width: 1,
                })
                .attr({shapeRendering: "crispEdges", z: 120})
                .dx(-tickSpace/2);


        }
    };

    resizeVariant(g, e) {
        console.log("resize");
        const minScreen = 0;
        const maxScreen = this.canvasWidth;
        const minProtein = this.proteinStart;
        const maxProtein = this.proteinEnd;
        const minOldRange = this.viewProteinRange[0];
        const maxOldRange = this.viewProteinRange[1];
        const newMinRange = this.rescaleLinear(minOldRange, minScreen, maxScreen, minProtein, maxProtein);
        const newMaxRange = this.rescaleLinear(maxOldRange, minScreen, maxScreen, minProtein, maxProtein);

        console.log("newMinRange", newMinRange);
        this.variantsRender(this.tracks.find(t => t.id === "variants"), [newMinRange, newMaxRange]); // TODO temp solution
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

class Variant {

    constructor() {

    }

}

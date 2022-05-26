import Region from "../../core/bioinfo/region.js";
import UtilsNew from "../../core/utilsNew.js";
import SequenceRenderer from "../renderers/sequence-renderer.js";
import GenomeBrowserConstants from "../genome-browser-constants.js";

export default class TrackListPanel {

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
        this.collapsed = false;
        this.collapsible = false;
        this.hidden = false;

        this.tracks = [];
        this.tracksIndex = {};

        this.parentLayout;
        this.mousePosition;
        this.windowSize;

        // set new region object
        this.region = new Region(this.config.region);
        this.width = this.config.width;
        this.height = this.config.height;
        this.status;

        // this region is used to do not modify original region, and will be used by trackSvg
        this.visualRegion = new Region(this.config.region);

        this.#setPixelBase();

        this.regionChanging = false;

        this.#initDom();
        this.#initEvents();

        this.#setTextPosition();
        this.rendered = true;
    }

    #initDom() {
        const template = UtilsNew.renderHTML(`
            <div id="${this.prefix}" class="">
                <div id="${this.prefix}Title" style="display:flex;justify-content:space-between;">
                    <div id="${this.prefix}TitleText" style="font-weight:bold;width:150px;">
                        ${this.config?.title || ""}
                    </div>
                    <div id="${this.prefix}WindowSize" class="small text-muted" style="font-weight:bold;"></div>
                    <div id="${this.prefix}Collapse" align="right" style="width:150px;">
                        <span id="${this.prefix}CollapseIcon" class="fas fa-minus"></span>
                    </div>
                </div>
                <div id="${this.prefix}TLHeader" class="unselectable" style="margin-top:8px;">
                    <div id="${this.prefix}Position" class="small text-primary" style="display:flex;justify-content:space-between;">
                        <div id="${this.prefix}PositionLeft"></div>
                        <div id="${this.prefix}PositionCenter"></div>
                        <div id="${this.prefix}PositionRight"></div>
                    </div>
                </div>
                <div id="${this.prefix}TLPanel" style="position:relative;width:100%;">
                    <div id="${this.prefix}TLTracks" style="position:relative;z-index:3;"></div>
                    <div id="${this.prefix}CenterLine"></div>
                    <div id="${this.prefix}MouseLine"></div>
                    <div id="${this.prefix}SelBox"></div>
                    <div id="${this.prefix}RegionOverviewBoxLeft" style="display:none;"></div>
                    <div id="${this.prefix}RegionOverviewBoxRight" style="display:none;"></div>
                </div>
            </div>
        `);

        this.div = template.querySelector(`div#${this.prefix}`);

        this.windowSizeDiv = this.div.querySelector(`div#${this.prefix}WindowSize`);
        this.titleDiv = this.div.querySelector(`div#${this.prefix}Title`);
        this.titleText = this.div.querySelector(`div#${this.prefix}TitleText`);
        this.collapseDiv = this.div.querySelector(`div#${this.prefix}Collapse`);
        this.collapseIcon = this.div.querySelector(`span#${this.prefix}CollapseIcon`);

        this.tlHeaderDiv = this.div.querySelector(`div#${this.prefix}TLHeader`);
        this.tlPanelDiv = this.div.querySelector(`div#${this.prefix}TLPanel`);
        this.tlTracksDiv = this.div.querySelector(`div#${this.prefix}TLTracks`);

        this.positionLeftDiv = this.div.querySelector(`div#${this.prefix}PositionLeft`);
        this.positionMidPosDiv = this.div.querySelector(`div#${this.prefix}PositionCenter`);
        this.positionRightDiv = this.div.querySelector(`div#${this.prefix}PositionRight`);

        // Apply center line styles
        this.centerLine = this.div.querySelector(`div#${this.prefix}CenterLine`);
        this.centerLine.style.zIndex = 2;
        this.centerLine.style.position = "absolute";
        this.centerLine.style.left = `${this.width / 2}px`;
        this.centerLine.style.top = "0px";
        this.centerLine.style.width = `${Math.floor(this.pixelBase)}px`; // this.pixelBase + 1
        this.centerLine.style.height = "100%";
        this.centerLine.style.opacity = 0.5;
        this.centerLine.style.border = "1px solid orangered";
        this.centerLine.style.backgroundColor = "orange";

        // Apply mouse line styles
        this.mouseLine = this.div.querySelector(`div#${this.prefix}MouseLine`);
        this.mouseLine.style.zIndex = 1;
        this.mouseLine.style.position = "absolute";
        this.mouseLine.style.left = "0px";
        this.mouseLine.style.top = "0px";
        this.mouseLine.style.width = `${Math.floor(this.pixelBase)}px`;
        this.mouseLine.style.height = "100%";
        this.mouseLine.style.border = "1px solid gray";
        this.mouseLine.style.opacity = 0.7;
        this.mouseLine.style.visibility = "hidden";
        this.mouseLine.backgroundColor = "gainsboro";

        // Apply selection box style
        this.selBox = this.div.querySelector(`div#${this.prefix}SelBox`);
        this.selBox.style.zIndex = 0;
        this.selBox.style.position = "absolute";
        this.selBox.style.left = "0px";
        this.selBox.style.top = "0px";
        this.selBox.style.height = "100%";
        this.selBox.style.border = "2px solid deepskyblue";
        this.selBox.style.opacity = 0.5;
        this.selBox.style.visibility = "hidden";
        this.selBox.style.backgroundColor = "honeydew";

        this.regionOverviewBoxLeft = this.div.querySelector(`div#${this.prefix}RegionOverviewBoxLeft`);
        this.regionOverviewBoxRight = this.div.querySelector(`div#${this.prefix}RegionOverviewBoxRight`);

        if (this.config.showRegionOverviewBox) {
            const regionOverviewBoxWidth = this.region.length() * this.pixelBase;
            const regionOverviewDarkBoxWidth = (this.width - regionOverviewBoxWidth) / 2;

            // Apply left region styles
            this.regionOverviewBoxLeft.style.zIndex = 0;
            this.regionOverviewBoxLeft.style.position = "absolute";
            this.regionOverviewBoxLeft.style.left = "1px";
            this.regionOverviewBoxLeft.style.top = "0px";
            this.regionOverviewBoxLeft.style.width = `${regionOverviewDarkBoxWidth}px`;
            this.regionOverviewBoxLeft.style.height = "100%";
            this.regionOverviewBoxLeft.style.opacity = 0.5;
            this.regionOverviewBoxLeft.style.backgroundColor = "lightgray";
            this.regionOverviewBoxLeft.style.display = "block";

            // Apply right region styles
            this.regionOverviewBoxRight.style.zIndex = 0;
            this.regionOverviewBoxRight.style.position = "absolute";
            // this.regionOverviewBoxRight.style.left = `${regionOverviewDarkBoxWidth + regionOverviewBoxWidth}px`;
            this.regionOverviewBoxRight.style.right = "0px";
            this.regionOverviewBoxRight.style.top = "0px";
            this.regionOverviewBoxRight.style.width = `${regionOverviewDarkBoxWidth}px`;
            this.regionOverviewBoxRight.style.height = "100%";
            this.regionOverviewBoxRight.style.opacity = 0.5;
            this.regionOverviewBoxRight.style.backgroundColor = "lightgray";
            this.regionOverviewBoxRight.style.display = "block";
        }

        this.target.append(this.div);
    }

    // Register events
    #initEvents() {
        // Show or hide tracks list panel content
        this.titleDiv.addEventListener("click", () => this.toggleContent());

        this.div.addEventListener("mouseenter", () => {
            this.mouseLine.style.visibility = "visible";
        });

        this.div.addEventListener("mousemove", event => {
            const centerPosition = this.region.center();
            const mid = this.width / 2;
            const mouseLineOffset = this.pixelBase / 2;
            const offsetX = (event.clientX - this.tlTracksDiv.getBoundingClientRect().left);

            const cX = offsetX - mouseLineOffset;
            const rcX = (cX / this.pixelBase) | 0;
            const pos = (rcX * this.pixelBase) + (mid % this.pixelBase) - 1;

            const posOffset = (mid / this.pixelBase) | 0;

            this.mouseLine.style.left = `${pos}px`;
            this.mousePosition = centerPosition + rcX - posOffset;

            this.trigger("mousePosition:change", {
                mousePos: this.mousePosition,
                chromosome: this.region.chromosome,
                base: this.getMousePosition(this.mousePosition),
            });
        });

        this.div.addEventListener("mouseleave", () => {
            this.mouseLine.style.visibility = "hidden";
        });

        let downX, moveX;
        let lastX = 0;

        const handleTracksMouseMove = event => {
            const newX = (downX - event.clientX) / this.pixelBase | 0; // truncate always towards zero
            if (newX != lastX) {
                const disp = lastX - newX;
                const centerPosition = this.region.center();
                if (centerPosition > disp) { // avoid 0 and negative positions
                    this.region.start -= disp;
                    this.region.end -= disp;
                    this.#setTextPosition();
                    // _this.onMove.notify(disp);

                    this.trigger("region:move", {
                        region: this.region,
                        disp: disp,
                        sender: this,
                    });

                    this.trigger("trackRegion:move", {
                        region: this.region,
                        disp: disp,
                        sender: this,
                    });
                    lastX = newX;
                    // this.setNucleotidPosition(p);
                }
            }
        };

        this.tlTracksDiv.addEventListener("mousedown", event => {
            this.mouseLine.style.visibility = "hidden";

            let mouseState = event.which;
            if (event.ctrlKey) {
                mouseState = `ctrlKey${event.which}`;
            }

            // TODO: Do we need to listen to other buttons than left mouse?
            switch (mouseState) {
                case 1: // Left mouse button pressed
                    this.tlTracksDiv.style.cursor = "move";
                    downX = event.clientX;
                    lastX = 0; // Reset last
                    this.tlTracksDiv.addEventListener("mousemove", handleTracksMouseMove);
                    break;
                case 2: // Middle mouse button pressed
                case "ctrlKey1": // ctrlKey and left mouse button
                    this.selBox.style.visibility = "visible";
                    this.selBox.style.width = 0;

                    downX = (event.pageX - $(this.tlTracksDiv).offset().left);
                    this.selBox.style.left = downX;

                    // $(this).mousemove(function (event) {
                    //     moveX = (event.pageX - $(this.tlTracksDiv).offset().left);
                    //     if (moveX < downX) {
                    //         this.selBox.style.left = moveX;
                    //     }
                    //     this.selBox.style.width = Math.abs(moveX - downX);
                    // });
                    break;
                case 3: // Right mouse button pressed
                    break;
                default: // other button?
            }
        });

        this.tlTracksDiv.addEventListener("mouseup", event => {
            this.tlTracksDiv.style.cursor = "default";
            this.mouseLine.style.visibility = "visible";

            this.tlTracksDiv.removeEventListener("mousemove", handleTracksMouseMove);

            let mouseState = event.which;
            if (event.ctrlKey) {
                mouseState = `ctrlKey${event.which}`;
            }
            switch (mouseState) {
                case 1: // Left mouse button pressed

                    break;
                case 2: // Middle mouse button pressed
                case "ctrlKey1": // ctrlKey and left mouse button
                    this.selBox.style.visibility = "hidden";
                    // $(this.tlTracksDiv).off("mousemove");
                    if (downX != null && moveX != null) {
                        let ss = downX / this.pixelBase;
                        let ee = moveX / this.pixelBase;
                        ss += this.visualRegion.start;
                        ee += this.visualRegion.start;
                        this.region.start = parseInt(Math.min(ss, ee));
                        this.region.end = parseInt(Math.max(ss, ee));
                        this.trigger("region:change", {
                            region: this.region,
                            sender: this,
                        });
                        moveX = null;
                    } else if (downX != null && moveX == null) {
                        const mouseRegion = new Region({
                            chromosome: this.region.chromosome,
                            start: this.mousePosition,
                            end: this.mousePosition
                        });
                        this.trigger("region:change", {
                            region: mouseRegion,
                            sender: this,
                        });
                    }
                    break;
                case 3: // Right mouse button pressed
                    break;
                default: // other button?
            }

        });

        this.tlTracksDiv.addEventListener("mouseleave", () => {
            this.tlTracksDiv.style.cursor = "default";
            this.selBox.style.visibility = "hidden";

            this.tlTracksDiv.removeEventListener("mousemove", handleTracksMouseMove);

            downX = null;
            moveX = null;
        });

        // const enableKeys = () => {
        //     // keys
        //     $("body").bind("keydown.genomeViewer", function (e) {
        //         let disp = 0;
        //         switch (e.keyCode) {
        //             case 37: // left arrow
        //                 if (e.ctrlKey) {
        //                     disp = Math.round(100 / _this.pixelBase);
        //                 } else {
        //                     disp = Math.round(10 / _this.pixelBase);
        //                 }
        //                 break;
        //             case 39: // right arrow
        //                 if (e.ctrlKey) {
        //                     disp = Math.round(-100 / _this.pixelBase);
        //                 } else {
        //                     disp = Math.round(-10 / _this.pixelBase);
        //                 }
        //                 break;
        //         }
        //         if (disp != 0) {
        //             _this.region.start -= disp;
        //             _this.region.end -= disp;
        //             _this._setTextPosition();
        //             // _this.onMove.notify(disp);
        //             _this.trigger("region:move", {
        //                 region: _this.region,
        //                 disp: disp,
        //                 sender: _this
        //             });
        //             _this.trigger("trackRegion:move", {
        //                 region: _this.region,
        //                 disp: disp,
        //                 sender: _this
        //             });
        //         }
        //     });
        // };

        // $(this.tlTracksDiv).mouseenter(function (e) {
        //     //            $('.qtip').qtip('enable'); // To enable them again ;)
        //     $(_this.mouseLine).css({
        //         "visibility": "visible"
        //     });
        //     $("body").off("keydown.genomeViewer");
        //     enableKeys();
        // });

    }

    show() {
        this.target.style.display = "block";
        this.hidden = false;
    }

    hide() {
        this.target.style.display = "none";
        this.hidden = true;
    }

    setVisible(visible) {
        visible ? this.show() : this.hide();
    }

    setTitle(title) {
        this.titleText.textContent = title || "";
    }

    showContent() {
        this.tlHeaderDiv.style.display = "block";
        this.tlPanelDiv.style.display = "block";
        this.collapseDiv.classList.remove("active");
        this.collapseIcon.classList.remove("fa-plus");
        this.collapseIcon.classList.add("fa-minus");
        this.collapsed = false;
    }

    hideContent() {
        this.tlHeaderDiv.style.display = "none";
        this.tlPanelDiv.style.display = "none";
        this.collapseDiv.classList.add("active");
        this.collapseIcon.classList.add("fa-plus");
        this.collapseIcon.classList.remove("fa-minus");
        this.collapsed = true;
    }

    toggleContent() {
        this.collapsed ? this.showContent() : this.hideContent();
    }

    setWidth(width) {
        this.width = width;

        // Update track elements position
        this.centerLine.style.left = `${this.width / 2}px`;

        // Emit resize event
        this.trigger("resize", {
            width: this.width,
        });
    }

    highlight(event) {
        this.trigger("trackFeature:highlight", event);
    }

    moveRegion(event) {
        this.region.load(event.region);
        this.visualRegion.load(event.region);
        this.#setTextPosition();
        this.trigger("trackRegion:move", event);
    }

    setRegion(region) {
        const center = this.width / 2;
        this.region.load(region);
        this.visualRegion.load(region);
        this.#setPixelBase();

        this.centerLine.style.left = center - 1;
        this.centerLine.style.width = `${this.pixelBase}px`;
        this.mouseLine.style.width = `${this.pixelBase}px`;

        this.#setTextPosition();

        if (this.config.showRegionOverviewBox) {
            const regionOverviewBoxWidth = this.region.length() * this.pixelBase;
            const regionOverviewDarkBoxWidth = (this.width - regionOverviewBoxWidth) / 2;

            this.regionOverviewBoxLeft.style.width = `${regionOverviewDarkBoxWidth}px`;
            this.regionOverviewBoxRight.style.width = `${regionOverviewDarkBoxWidth}px`;
        }

        // Trigger events
        this.trigger("window:size", {
            windowSize: this.windowSize,
        });

        this.trigger("trackRegion:change", {
            region: this.visualRegion,
            sender: this,
        });

        this.status = "rendering";
    }

    draw() {
        this.trigger("track:draw", {
            sender: this,
        });
    }

    #checkAllTrackStatus(status) {
        return this.tracks.every(track => track.status === status);
    }

    checkTracksReady() {
        return this.#checkAllTrackStatus("ready");
    }

    addTrack(track) {
        // TODO: this should be removed, this method only accepts one track
        (Array.isArray(track) ? track : [track]).forEach(t => this.#registerTrack(t));
        // this.#registerTrack(track);
    }

    addTracks(tracks) {
        tracks.forEach(track => this.#registerTrack(track));
    }

    #registerTrack(track) {
        if (!this.rendered) {
            console.log(`${this.prefix} is not rendered yet`);
            return;
        }

        if (!track) {
            return false;
        }

        // Check if already exists
        if (this.containsTrack(track)) {
            return false;
        }

        const length = this.tracks.push(track);
        const insertPosition = length - 1;
        this.tracksIndex[track.prefix] = insertPosition;

        track.setPixelBase(this.pixelBase);
        track.setRegion(this.visualRegion);
        track.setWidth(this.width);

        // Track must be initialized after we have created
        // de DIV element in order to create the elements in the DOM
        if (!track.rendered) {
            track.render(this.tlTracksDiv);
        }

        // Track resize
        this.on("resize", event => track.setWidth(event.width));

        // Track region change listener
        this.on("trackRegion:change", event => {
            track.setWidth(this.width);
            track.setPixelBase(this.pixelBase);
            track.setRegion(event.region);
            track.draw();
        });

        // Track region move
        this.on("trackRegion:move", event => {
            track.setRegion(event.region);
            track.setPixelBase(this.pixelBase);
            track.move(event.disp);
        });

        // TODO: review this
        // // Track region highlight
        // this.on("trackFeature:highlight", event => {
        //     const attrName = event.attrName || "feature_id";
        //     if (event.attrValue) {
        //         const attrItems = Array.isArray(event.attrValue) ? event.attrValue : [event.attrValue];

        //         attrItems.forEach(key => {
        //             const queryStr = `${attrName}~=${event.attrValue[key]}`;
        //             const groups = track.svgdiv.querySelectorAll(`g[${queryStr}]`);

        //             Array.from(groups).forEach(item => {
        //                 let animation = $(this).find("animate");
        //                 if (animation.length == 0) {
        //                     animation = SVG.addChild(this, "animate", {
        //                         "attributeName": "opacity",
        //                         "attributeType": "XML",
        //                         // "begin": "indefinite",
        //                         "from": "0.0",
        //                         "to": "1",
        //                         "begin": "0s",
        //                         "dur": "0.5s",
        //                         "repeatCount": "5"
        //                     });
        //                 } else {
        //                     animation = animation[0];
        //                 }
        //                 let y = $(group).find("rect").attr("y");
        //                 $(track.svgdiv).scrollTop(y);
        //                 animation.beginElement();
        //             });
        //         });
        //     }
        // });

        track.on("track:close", event => this.removeTrack(event.sender));
        track.on("track:up", event => this.#reallocateAbove(event.sender));
        track.on("track:down", event => this.#reallocateUnder(event.sender));

        // Draw track
        this.on("track:draw", () => track.draw());

        // this.on('trackSpecies:change', track.get('trackSpecies:change'));
        // this.on("trackRegion:change", track.get("trackRegion:change"));
        // this.on("trackRegion:move", track.get("trackRegion:move"));
        // this.on("trackFeature:highlight", track.get("trackFeature:highlight"));
    }

    toggleAutoHeight(bool) {
        this.tracks.forEach(track => track.toggleAutoHeight(bool));
    }

    updateHeight() {
        this.tracks.forEach(track => track.updateHeight(true));
    }

    containsTrack(track) {
        return typeof this.tracksIndex[track.prefix] !== "undefined";
    }

    getTrackIndex(track) {
        return this.tracksIndex[track.prefix];
    }

    // update index with correct index after splice
    #updateTracksIndex() {
        this.tracks.forEach((track, index) => {
            this.tracksIndex[track.id] = index;
        });
    }

    refreshTracksDom() {
        this.tracks.forEach(track => {
            // TODO: do not use jquery
            $(track.div).detach();
            $(this.tlTracksDiv).append(track.div);
        });

        // Trigger tracks refresh event
        this.trigger("tracks:refresh", {
            sender: this,
        });
    }

    removeTrack(track) {
        if (!this.containsTrack(track)) {
            return false;
        }

        // first hide the track
        this.hideTrack(track);
        track.remove();

        const index = this.getTrackIndex(track);
        // remove track from list and hash data
        this.tracks.splice(index, 1)[0];
        delete this.tracksIndex[track.id];
        this.#updateTracksIndex();

        // eslint-disable-next-line no-param-reassign
        track.rendered = false;

        // delete listeners

        track.off("track:close");
        track.off("track:up");
        track.off("track:down");


        this.off("track:draw", track.get("track:draw"));
        // this.off('trackSpecies:change', track.get('trackSpecies:change'));
        this.off("trackRegion:change", track.get("trackRegion:change"));
        this.off("trackRegion:move", track.get("trackRegion:move"));
        // this.off('trackWidth:change', track.set('trackWidth:change'));
        this.off("trackFeature:highlight", track.get("trackFeature:highlight"));

        this.refreshTracksDom();
        return track;
    }

    restoreTrack(track, index) {
        if (this.containsTrack((track))) {
            return false;
        }

        this.addTrack(track);
        if (typeof index !== "undefined") {
            this.setTrackIndex(track, index);
        }
        track.show();
        this.refreshTracksDom();
    }


    // This routine is called when track order is modified
    #reallocateAbove(track) {
        if (!this.containsTrack((track))) {
            return false;
        }

        const index = this.getTrackIndex(track);
        // console.log(`${index} wants to move up`);
        if (index > 0) {
            const aboveTrack = this.tracks[index - 1];
            const underTrack = this.tracks[index];

            this.tracks[index] = aboveTrack;
            this.tracks[index - 1] = underTrack;
            this.tracksIndex[aboveTrack.id] = index;
            this.tracksIndex[underTrack.id] = index - 1;
            this.refreshTracksDom();
            // } else {
            //     console.log("is at top");
        }
    }

    // This routine is called when track order is modified
    #reallocateUnder(track) {
        if (!this.containsTrack((track))) {
            return false;
        }

        const index = this.getTrackIndex(track);
        // console.log(`${i} wants to move down`);
        if (index + 1 < this.tracks.length) {
            const aboveTrack = this.tracks[index];
            const underTrack = this.tracks[index + 1];

            this.tracks[index] = underTrack;
            this.tracks[index + 1] = aboveTrack;
            this.tracksIndex[underTrack.id] = index;
            this.tracksIndex[aboveTrack.id] = index + 1;
            this.refreshTracksDom();
            // } else {
            // console.log("is at bottom");
        }
    }

    setTrackIndex(track, newIndex) {
        if (!this.containsTrack((track))) {
            return false;
        }

        const oldIndex = this.getTrackIndex(track);

        // remove track from old index
        this.tracks.splice(oldIndex, 1)[0];

        // add track at new Index
        this.tracks.splice(newIndex, 0, track);

        this._updateTracksIndex();

        // update track div positions
        this.refreshTracksDom();
    }

    swapTracks(t1, t2) {
        if (!this.containsTrack(t1) || !this.containsTrack(t2)) {
            return false;
        }

        const oldIndex1 = this.getTrackIndex(t1);
        const oldIndex2 = this.getTrackIndex(t2);

        this.tracks[oldIndex1] = t2;
        this.tracks[oldIndex2] = t1;
        this.tracksIndex[t1.id] = oldIndex2;
        this.tracksIndex[t2.id] = oldIndex1;
        this.refreshTracksDom();
    }

    scrollToTrack(track) {
        if (!this.containsTrack((track))) {
            return false;
        }
    }

    hideTrack(track) {
        if (!this.containsTrack((track))) {
            return false;
        }
        track.hide();
        this.refreshTracksDom();
    }

    showTrack(track) {
        if (!this.containsTrack((track))) {
            return false;
        }
        track.show();
        this.refreshTracksDom();
    }

    #setPixelBase() {
        this.pixelBase = (this.width / this.region.length()) / this.config.zoomMultiplier;
    }

    #setTextPosition() {
        const centerPosition = this.region.center();
        const baseLength = parseInt(this.width / this.pixelBase); // for zoom 100
        const aux = Math.ceil((baseLength / 2) - 1);

        this.visualRegion.start = Math.floor(centerPosition - aux);
        this.visualRegion.end = Math.floor(centerPosition + aux);

        this.positionMidPosDiv.textContent = centerPosition;
        this.positionLeftDiv.textContent = this.visualRegion.start;
        this.positionRightDiv.textContent = this.visualRegion.end;
        this.windowSize = `Window size: ${this.visualRegion.length()} nts`;
        this.windowSizeDiv.textContent = this.windowSize;
    }

    getTrackById(trackId) {
        if (this.tracksIndex[trackId]) {
            const index = this.tracksIndex[trackId];
            return this.tracks[index];
        }

        return null;
    }

    getMousePosition(position) {
        return ""; // position > 0 ? this.getSequenceNucleotid(position) : "";
    }

    getDefaultConfig() {
        return {
            width: 0,
            height: 0,
            region: null,
            collapsed: false,
            collapsible: false,
            hidden: false,
            showRegionOverviewBox: false,
            zoomMultiplier: 1,
        };
    }

}

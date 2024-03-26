/*
 * Copyright 2015-2024 OpenCB
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

import Region from "../../core/bioinfo/region.js";
import UtilsNew from "../../core/utils-new.js";
import SequenceTrack from "../tracks/sequence-track.js";

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
        this.hidden = false;

        this.tracks = [];
        this.sequenceTrack = null;

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
            <div id="${this.prefix}" class="" data-cy="gb-tracklist">
                <div style="display:flex;justify-content:space-between;">
                    <div id="${this.prefix}Title" style="font-weight:bold;width:150px;cursor:pointer;" data-cy="gb-tracklist-title">
                        ${this.config?.title || ""}
                    </div>
                    <div id="${this.prefix}WindowSize" class="small text-muted" style="font-weight:bold;" data-cy="gb-tracklist-size"></div>
                    <div id="${this.prefix}Collapse" align="right" style="width:150px;cursor:pointer;">
                        <span id="${this.prefix}CollapseIcon" class="fas fa-minus"></span>
                    </div>
                </div>
                <div id="${this.prefix}TLHeader" class="unselectable" style="margin-top:8px;">
                    <div id="${this.prefix}Position" class="small text-primary" style="display:flex;justify-content:space-between;">
                        <div id="${this.prefix}PositionLeft" data-cy="gb-tracklist-position-left"></div>
                        <div id="${this.prefix}PositionCenter" data-cy="gb-tracklist-position-center"></div>
                        <div id="${this.prefix}PositionRight" data-cy="gb-tracklist-position-right"></div>
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
        this.title = this.div.querySelector(`div#${this.prefix}Title`);
        this.collapse = this.div.querySelector(`div#${this.prefix}Collapse`);
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
        this.title.addEventListener("click", () => this.toggleContent());
        this.collapse.addEventListener("click", () => this.toggleContent());

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
                base: this.#getSequenceNucleotid(this.mousePosition),
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

    draw() {
        this.trigger("track:draw", {
            sender: this,
        });
    }

    #checkAllTrackStatus(status) {
        return this.tracks.every(track => track.status === status);
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

    #getSequenceNucleotid(position) {
        if (position > 0 && this.sequenceTrack) {
            const el = this.sequenceTrack.svgCanvasFeatures.querySelector(`text[data-pos="${position}"]`);
            return el?.textContent || "";
        }

        return "";
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
        this.title.textContent = title || "";
    }

    showContent() {
        this.tlHeaderDiv.style.display = "block";
        this.tlPanelDiv.style.display = "block";
        this.collapse.classList.remove("active");
        this.collapseIcon.classList.remove("fa-plus");
        this.collapseIcon.classList.add("fa-minus");
        this.collapsed = false;
    }

    hideContent() {
        this.tlHeaderDiv.style.display = "none";
        this.tlPanelDiv.style.display = "none";
        this.collapse.classList.add("active");
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

        this.trigger("width:change", {
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

    checkTracksReady() {
        return this.#checkAllTrackStatus("ready");
    }

    addTrack(track) {
        if (!this.rendered) {
            console.log(`${this.prefix} is not rendered yet`);
            return;
        }

        // Check if this track already exists
        if (!track || this.containsTrack(track)) {
            return false;
        }

        this.tracks.push(track);

        track.setPixelBase(this.pixelBase);
        track.setRegion(this.visualRegion);
        track.setWidth(this.width);
        track.render(this.tlTracksDiv);

        // List to tracklist events
        this.on("width:change", event => track.setWidth(event.width));
        this.on("trackRegion:change", event => {
            track.setWidth(this.width);
            track.setPixelBase(this.pixelBase);
            track.setRegion(event.region);
            track.draw();
        });
        this.on("trackRegion:move", event => {
            track.setRegion(event.region);
            track.setPixelBase(this.pixelBase);
            track.move(event.disp);
        });
        // track.on("track:up", event => this.#reallocateAbove(event.sender));
        // track.on("track:down", event => this.#reallocateUnder(event.sender));

        // Draw track
        this.on("track:draw", () => track.draw());

        // Check if this track is an instance of the sequence track
        if (track instanceof SequenceTrack) {
            this.sequenceTrack = track; // Save reference to sequence track
        }
    }

    addTracks(tracks) {
        (tracks || []).forEach(track => this.addTrack(track));
    }

    removeTrack(track) {
        if (!this.containsTrack(track)) {
            return false;
        }

        // Remove from tracks list and from DOM
        this.tracks = this.tracks.filter(t => t.prefix !== track.prefix);
        this.tlTracksDiv.removeChild(this.tracks.div);

        // delete listeners
        track.off("track:up");
        track.off("track:down");
    }

    hideTrack(track) {
        track.hide();
    }

    showTrack(track) {
        track.show();
    }

    toggleTracksAutoHeight(bool) {
        this.tracks.forEach(track => track.toggleAutoHeight(bool));
    }

    updateTracksHeight() {
        this.tracks.forEach(track => track.updateHeight(true));
    }

    containsTrack(track) {
        return this.tracks.findIndex(t => t.prefix === track.prefix) !== -1;
    }

    getDefaultConfig() {
        return {
            width: 0,
            height: 0,
            title: "",
            region: null,
            collapsed: false,
            collapsible: false,
            hidden: false,
            showRegionOverviewBox: false,
            zoomMultiplier: 1,
        };
    }

}

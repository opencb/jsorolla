class TrackListPanel { //parent is a DOM div element
    constructor(args){
        let _this = this;

        Object.assign(this, Backbone.Events);

        this.cellBaseHost = "http://bioinfo.hpc.cam.ac.uk/cellbase";
        this.cellBaseVersion = "v4";

        //set default args
        this.target;
        this.autoRender = true;
        this.id = Utils.genId("TrackListPanel");
        this.collapsed = false;
        this.collapsible = false;
        this.hidden = false;

        this.tracks = [];
        this.tracksIndex = {};

        this.parentLayout;
        this.mousePosition;
        this.windowSize;

        this.zoomMultiplier = 1;
        this.showRegionOverviewBox = false;


        this.height = 0;

        //set instantiation args, must be last
        Object.assign(this, args);

        //set new region object
        this.region = new Region(this.region);
        this.width -= 18;


        this.status;

        //this region is used to do not modify original region, and will be used by trackSvg
        this.visualRegion = new Region(this.region);

        /********/
        this._setPixelBase();
        /********/

        this.on(this.handlers);

        this.regionChanging = false;

        this.rendered = false;
        if (this.autoRender) {
            this.render();
        }

    }

    show() {
        $(this.div).css({
            display: "block"
        });
        this.hidden = false;
    }

    hide() {
        $(this.div).css({
            display: "none"
        });
        this.hidden = true;
    }
    setVisible(bool) {
        if (bool) {
            this.show();
        } else {
            this.hide();
        }
    }
    setTitle(title) {
        if ("titleDiv" in this) {
            $(this.titleDiv).html(title);
        }
    }
    showContent() {
        $(this.tlHeaderDiv).css({
            display: "block"
        });
        $(this.panelDiv).css({
            display: "block"
        });
        this.collapsed = false;
        $(this.collapseDiv).removeClass("active");
        $(this.collapseDiv).children().first().removeClass("fa-plus");
        $(this.collapseDiv).children().first().addClass("fa-minus");
    }
    hideContent() {
        $(this.tlHeaderDiv).css({
            display: "none"
        });
        $(this.panelDiv).css({
            display: "none"
        });
        this.collapsed = true;
        $(this.collapseDiv).addClass("active");
        $(this.collapseDiv).children().first().removeClass("fa-minus");
        $(this.collapseDiv).children().first().addClass("fa-plus");
    }
    render() {
        let _this = this;

        this.div = document.createElement("div");
        this.div.classList.add("ocb-gv-tracklist");

        this.windowSizeDiv = document.createElement("div");
        this.windowSizeDiv.classList.add("ocb-gv-tracklist-windowsize");

        if ("title" in this && this.title !== "") {

            let titleDiv = document.createElement("div");
            titleDiv.classList.add("ocb-gv-panel-title", "unselectable");

            titleDiv.appendChild(this.windowSizeDiv);

            if (this.collapsible == true) {
                this.collapseDiv = document.createElement("div");
                this.collapseDiv.classList.add("ocb-gv-panel-collapse-control");

                let collapseSpan = document.createElement("span");
                collapseSpan.classList.add("fa", "fa-minus");

                this.collapseDiv.appendChild(collapseSpan);

                $(titleDiv).dblclick(function() {
                    if (_this.collapsed) {
                        _this.showContent();
                    } else {
                        _this.hideContent();
                    }
                });
                $(this.collapseDiv).click(function() {
                    if (_this.collapsed) {
                        _this.showContent();
                    } else {
                        _this.hideContent();
                    }
                });
                titleDiv.appendChild(this.collapseDiv);
            }

            let titleTextDiv = document.createElement("div");
            titleTextDiv.classList.add("ocb-gv-panel-text");
            titleTextDiv.textContent = this.title;
            titleDiv.appendChild(titleTextDiv);


            this.div.appendChild(titleDiv);
        }

        let tlHeaderDiv = $('<div id="tl-header" class="unselectable"></div>')[0];

        let panelDiv = $('<div id="tl-panel"></div>')[0];
        $(panelDiv).css({
            position: "relative",
            width: "100%"
        });


        this.tlTracksDiv = $('<div id="tl-tracks"></div>')[0];
        $(this.tlTracksDiv).css({
            position: "relative",
            "z-index": 3
        });


        $(this.div).append(tlHeaderDiv);
        $(this.div).append(panelDiv);

        $(panelDiv).append(this.tlTracksDiv);


        //Main SVG and its events

        //Position div
        this.positionDiv = document.createElement("div");
        this.positionDiv.classList.add("ocb-gv-tracklist-position");

        this.positionLeftDiv = document.createElement("div");
        this.positionLeftDiv.classList.add("ocb-gv-tracklist-position-left");
        this.positionNucleotidDiv = document.createElement("div");
        this.positionNucleotidDiv.classList.add("ocb-gv-tracklist-position-mid-nt");
        this.positionMidPosDiv = document.createElement("div");
        this.positionMidPosDiv.classList.add("ocb-gv-tracklist-position-mid-pos");
        this.positionMidDiv = document.createElement("div");
        this.positionMidDiv.classList.add("ocb-gv-tracklist-position-mid");
        this.positionRightDiv = document.createElement("div");
        this.positionRightDiv.classList.add("ocb-gv-tracklist-position-right");

        this.positionDiv.appendChild(this.positionLeftDiv);
        this.positionDiv.appendChild(this.positionNucleotidDiv);
        this.positionMidDiv.appendChild(this.positionNucleotidDiv);
        this.positionMidDiv.appendChild(this.positionMidPosDiv);
        this.positionDiv.appendChild(this.positionMidDiv);
        this.positionDiv.appendChild(this.positionRightDiv);
        tlHeaderDiv.appendChild(this.positionDiv);


        let mid = this.width / 2;
        this._setTextPosition();


        this.centerLine = $(`<div id="${this.id}centerLine"></div>`)[0];
        $(panelDiv).append(this.centerLine);
        $(this.centerLine).css({
            "z-index": 2,
            "position": "absolute",
            "left": mid - 1,
            "top": 0,
            "width": Math.floor(this.pixelBase), //this.pixelBase + 1,
            //            'height': '100%',
            "height": "calc(100% - 8px)",
            "opacity": 0.5,
            "border": "1px solid orangered",
            "background-color": "orange"
        });


        this.mouseLine = $(`<div id="${this.id}mouseLine"></div>`)[0];
        $(panelDiv).append(this.mouseLine);
        $(this.mouseLine).css({
            "z-index": 1,
            "position": "absolute",
            "left": -20.5,
            "top": 0,
            "width": Math.floor(this.pixelBase), //this.pixelBase + 2,
            "height": "calc(100% - 8px)",
            "border": "1px solid gray",
            "opacity": 0.7,
            "visibility": "hidden",
            "background-color": "gainsboro"
        });

        //allow selection in trackSvgLayoutOverview


        let selBox = $(`<div id="${this.id}selBox"></div>`)[0];
        $(panelDiv).append(selBox);
        $(selBox).css({
            "z-index": 0,
            "position": "absolute",
            "left": 0,
            "top": 0,
            "height": "100%",
            "border": "2px solid deepskyblue",
            "opacity": 0.5,
            "visibility": "hidden",
            "background-color": "honeydew"
        });

        if (this.showRegionOverviewBox) {
            let regionOverviewBoxLeft = $(`<div id="${this.id}regionOverviewBoxLeft"></div>`)[0];
            let regionOverviewBoxRight = $(`<div id="${this.id}regionOverviewBoxRight"></div>`)[0];
            $(panelDiv).append(regionOverviewBoxLeft);
            $(panelDiv).append(regionOverviewBoxRight);
            let regionOverviewBoxWidth = this.region.length() * this.pixelBase;
            let regionOverviewDarkBoxWidth = (this.width - regionOverviewBoxWidth) / 2;
            $(regionOverviewBoxLeft).css({
                "z-index": 0,
                "position": "absolute",
                "left": 1,
                "top": 0,
                "width": regionOverviewDarkBoxWidth,
                "height": "calc(100% - 8px)",
                //                'border': '1px solid gray',
                "opacity": 0.5,
                //            'visibility': 'hidden',
                "background-color": "lightgray"
            });
            $(regionOverviewBoxRight).css({
                "z-index": 0,
                "position": "absolute",
                "left": (regionOverviewDarkBoxWidth + regionOverviewBoxWidth),
                "top": 0,
                "width": regionOverviewDarkBoxWidth,
                "height": "calc(100% - 8px)",
                "opacity": 0.5,
                "background-color": "lightgray"
            });
            this.regionOverviewBoxLeft = regionOverviewBoxLeft;
            this.regionOverviewBoxRight = regionOverviewBoxRight;
        }


        $(this.div).mousemove(function(event) {
            let centerPosition = _this.region.center();
            let mid = _this.width / 2;
            let mouseLineOffset = _this.pixelBase / 2;
            let offsetX = (event.clientX - _this.tlTracksDiv.getBoundingClientRect().left);

            let cX = offsetX - mouseLineOffset;
            let rcX = (cX / _this.pixelBase) | 0;
            let pos = (rcX * _this.pixelBase) + (mid % _this.pixelBase) - 1;
            $(_this.mouseLine).css({
                "left": pos
            });
            //
            let posOffset = (mid / _this.pixelBase) | 0;
            _this.mousePosition = centerPosition + rcX - posOffset;
            _this.trigger("mousePosition:change", {
                mousePos: _this.mousePosition,
                chromosome: _this.region.chromosome,
                base: _this.getMousePosition(_this.mousePosition)
            });
        });

        $(this.tlTracksDiv).dblclick(function(event) {
            if (!_this.regionChanging) {
                _this.regionChanging = true;
                /**/
                /**/
                /**/
                let halfLength = _this.region.length() / 2;
                let mouseRegion = new Region({
                    chromosome: _this.region.chromosome,
                    start: _this.mousePosition - halfLength,
                    end: _this.mousePosition + halfLength
                });
                _this.trigger("region:change", {
                    region: mouseRegion,
                    sender: _this
                });
                /**/
                /**/
                /**/
                setTimeout(function() {
                    _this.regionChanging = false;
                }, 700);
            }
        });

        let downX, moveX;
        $(this.tlTracksDiv).mousedown(function(event) {
            $("html").addClass("unselectable");
            //                            $('.qtip').qtip('hide').qtip('disable'); // Hide AND disable all tooltips
            $(_this.mouseLine).css({
                "visibility": "hidden"
            });

            let mouseState = event.which;
            if (event.ctrlKey) {
                mouseState = `ctrlKey${event.which}`;
            }
            switch (mouseState) {
                case 1: //Left mouse button pressed
                    $(this).css({
                        "cursor": "move"
                    });
                    downX = event.clientX;
                    let lastX = 0;
                    $(this).mousemove(function(event) {
                        let newX = (downX - event.clientX) / _this.pixelBase | 0; //truncate always towards zero
                        if (newX != lastX) {
                            let disp = lastX - newX;
                            let centerPosition = _this.region.center();
                            let p = centerPosition - disp;
                            if (p > 0) { //avoid 0 and negative positions
                                _this.region.start -= disp;
                                _this.region.end -= disp;
                                _this._setTextPosition();
                                //						_this.onMove.notify(disp);
                                _this.trigger("region:move", {
                                    region: _this.region,
                                    disp: disp,
                                    sender: _this
                                });
                                _this.trigger("trackRegion:move", {
                                    region: _this.region,
                                    disp: disp,
                                    sender: _this
                                });
                                lastX = newX;
                                //_this.setNucleotidPosition(p);
                            }
                        }
                    });

                    break;
                case 2: //Middle mouse button pressed
                case "ctrlKey1": //ctrlKey and left mouse button
                    $(selBox).css({
                        "visibility": "visible"
                    });
                    $(selBox).css({
                        "width": 0
                    });
                    downX = (event.pageX - $(_this.tlTracksDiv).offset().left);
                    $(selBox).css({
                        "left": downX
                    });
                    $(this).mousemove(function(event) {
                        moveX = (event.pageX - $(_this.tlTracksDiv).offset().left);
                        if (moveX < downX) {
                            $(selBox).css({
                                "left": moveX
                            });
                        }
                        $(selBox).css({
                            "width": Math.abs(moveX - downX)
                        });
                    });


                    break;
                case 3: //Right mouse button pressed
                    break;
                default: // other button?
            }


        });

        $(this.tlTracksDiv).mouseup(function(event) {
            $("html").removeClass("unselectable");
            $(this).css({
                "cursor": "default"
            });
            $(_this.mouseLine).css({
                "visibility": "visible"
            });
            $(this).off("mousemove");

            let mouseState = event.which;
            if (event.ctrlKey) {
                mouseState = `ctrlKey${event.which}`;
            }
            switch (mouseState) {
                case 1: //Left mouse button pressed

                    break;
                case 2: //Middle mouse button pressed
                case "ctrlKey1": //ctrlKey and left mouse button
                    $(selBox).css({
                        "visibility": "hidden"
                    });
                    $(this).off("mousemove");
                    if (downX != null && moveX != null) {
                        let ss = downX / _this.pixelBase;
                        let ee = moveX / _this.pixelBase;
                        ss += _this.visualRegion.start;
                        ee += _this.visualRegion.start;
                        _this.region.start = parseInt(Math.min(ss, ee));
                        _this.region.end = parseInt(Math.max(ss, ee));
                        _this.trigger("region:change", {
                            region: _this.region,
                            sender: _this
                        });
                        moveX = null;
                    } else if (downX != null && moveX == null) {
                        let mouseRegion = new Region({
                            chromosome: _this.region.chromosome,
                            start: _this.mousePosition,
                            end: _this.mousePosition
                        });
                        _this.trigger("region:change", {
                            region: mouseRegion,
                            sender: _this
                        });
                    }
                    break;
                case 3: //Right mouse button pressed
                    break;
                default: // other button?
            }

        });

        $(this.tlTracksDiv).mouseleave(function(event) {
            $(this).css({
                "cursor": "default"
            });
            $(_this.mouseLine).css({
                "visibility": "hidden"
            });
            $(this).off("mousemove");
            $("body").off("keydown.genomeViewer");

            $(selBox).css({
                "visibility": "hidden"
            });
            downX = null;
            moveX = null;
        });

        $(this.tlTracksDiv).mouseenter(function(e) {
            //            $('.qtip').qtip('enable'); // To enable them again ;)
            $(_this.mouseLine).css({
                "visibility": "visible"
            });
            $("body").off("keydown.genomeViewer");
            enableKeys();
        });

        var enableKeys = function() {
            //keys
            $("body").bind("keydown.genomeViewer", function(e) {
                let disp = 0;
                switch (e.keyCode) {
                    case 37: //left arrow
                        if (e.ctrlKey) {
                            disp = Math.round(100 / _this.pixelBase);
                        } else {
                            disp = Math.round(10 / _this.pixelBase);
                        }
                        break;
                    case 39: //right arrow
                        if (e.ctrlKey) {
                            disp = Math.round(-100 / _this.pixelBase);
                        } else {
                            disp = Math.round(-10 / _this.pixelBase);
                        }
                        break;
                }
                if (disp != 0) {
                    _this.region.start -= disp;
                    _this.region.end -= disp;
                    _this._setTextPosition();
                    //					_this.onMove.notify(disp);
                    _this.trigger("region:move", {
                        region: _this.region,
                        disp: disp,
                        sender: _this
                    });
                    _this.trigger("trackRegion:move", {
                        region: _this.region,
                        disp: disp,
                        sender: _this
                    });
                }
            });
        };

        this.tlHeaderDiv = tlHeaderDiv;
        this.panelDiv = panelDiv;


        this.setVisible(!this.hidden);
        this.rendered = true;
    }

    setHeight(height) {
        //        this.height=Math.max(height,60);
        //        $(this.tlTracksDiv).css('height',height);
        //        //this.grid.setAttribute("height",height);
        //        //this.grid2.setAttribute("height",height);
        //        $(this.centerLine).css("height",parseInt(height));//25 es el margen donde esta el texto de la posicion
        //        $(this.mouseLine).css("height",parseInt(height));//25 es el margen donde esta el texto de la posicion
    }

    setWidth(width) {
        console.log(`trackListPanel setWidth ------> ${width}`);
        this.width = width - 18;
    }

    highlight(event) {
        this.trigger("trackFeature:highlight", event);
    }


    moveRegion(event) {
        this.region.load(event.region);
        this.visualRegion.load(event.region);
        this._setTextPosition();
        this.trigger("trackRegion:move", event);
    }

    setSpecies(species) {
        this.species = species;
        //        this.trigger('trackSpecies:change', {species: species, sender: this});

        for (let i = 0; i < this.tracks.length; i++) {
            let track = this.tracks[i];
            track.setSpecies(this.species);

        }
    }

    setRegion(region) { //item.chromosome, item.position, item.species
        console.log(`trackListPanel setRegion region ------> ${region}`);
        console.log(`trackListPanel setRegion width ------> ${this.width}`);
        let _this = this;
        let mid = this.width / 2;
        this.region.load(region);
        this.visualRegion.load(region);
        this._setPixelBase();
        //get pixelbase by Region


        $(this.centerLine).css({
            "left": mid - 1,
            "width": this.pixelBase
        });
        $(this.mouseLine).css({
            "width": this.pixelBase
        });

        this._setTextPosition();

        if (this.showRegionOverviewBox) {
            let regionOverviewBoxWidth = this.region.length() * this.pixelBase;
            let regionOverviewDarkBoxWidth = (this.width - regionOverviewBoxWidth) / 2;
            $(this.regionOverviewBoxLeft).css({
                "width": regionOverviewDarkBoxWidth
            });
            $(this.regionOverviewBoxRight).css({
                "left": (regionOverviewDarkBoxWidth + regionOverviewBoxWidth),
                "width": regionOverviewDarkBoxWidth
            });
        }


        this.trigger("window:size", {
            windowSize: this.windowSize
        });


        this.trigger("trackRegion:change", {
            region: this.visualRegion,
            sender: this
        });

        this.positionNucleotidDiv.textContent = ""; //remove base char, will be drawn later if needed

        this.status = "rendering";

    }

    draw() {
        let _this = this;
        this.targetDiv = (this.target instanceof HTMLElement) ? this.target : document.querySelector(`#${this.target}`);
        if (!this.targetDiv) {
            console.log("target not found");
            return;
        }
        this.targetDiv.appendChild(this.div);

        this.trigger("track:draw", {
            sender: this
        });
    }
    _checkAllTrackStatus(status) {
        for (let i = 0; i < this.tracks.length; i++) {
            let track = this.tracks[i];
            if (track.status != status) return false;
        }
        return true;
    }
    checkTracksReady() {
        return this._checkAllTrackStatus("ready");
    }
    addTrack(track) {
        if (_.isArray(track)) {
            for (let i in track) {
                this._addTrack(track[i]);
            }
        } else {
            this._addTrack(track);
        }
    }
    _addTrack(track) {
        if (!this.rendered) {
            console.info(`${this.id} is not rendered yet`);
            return;
        }
        let _this = this;

        if (track == null) {
            return false;
        }
        // Check if already exists
        if (this.containsTrack(track)) {
            return false;
        }


        let length = this.tracks.push(track);
        let insertPosition = length - 1;
        this.tracksIndex[track.id] = insertPosition;

        if (typeof track.dataAdapter.host === "undefined") {
            track.dataAdapter.host = this.cellBaseHost;
        }
        if (typeof track.dataAdapter.version === "undefined") {
            track.dataAdapter.version = this.cellBaseVersion;
        }
        track.set("pixelBase", this.pixelBase);
        track.set("region", this.visualRegion);
        track.set("width", this.width);
        track.setSpecies(this.species);

        track.set("trackListPanel", this);

        // Track must be initialized after we have created
        // de DIV element in order to create the elements in the DOM
        if (!track.rendered) {
            track.render(this.tlTracksDiv);
        }

        // Once tack has been initialize we can call draw() function
        track.draw();


        //trackEvents
        track.set("track:draw", function(event) {
            track.draw();
        });


        track.set("trackRegion:change", function(event) {
          console.log(`trackListPanel trackRegion:change region ------> ${event.region}`);
          console.log(`trackListPanel trackRegion:change width ------> ${_this.width}`);
            track.setWidth(_this.width);
            track.set("pixelBase", _this.pixelBase);
            track.set("region", event.region);
            track.draw();
        });


        track.set("trackRegion:move", function(event) {
            track.set("region", event.region);
            track.set("pixelBase", _this.pixelBase);
            track.move(event.disp);
        });


        track.set("trackFeature:highlight", function(event) {


            let attrName = event.attrName || "feature_id";
            if ("attrValue" in event) {
                event.attrValue = ($.isArray(event.attrValue)) ? event.attrValue : [event.attrValue];
                for (let key in event.attrValue) {
                    let queryStr = `${attrName}~=${event.attrValue[key]}`;
                    let group = $(track.svgdiv).find(`g[${queryStr}]`);
                    $(group).each(function() {
                        let animation = $(this).find("animate");
                        if (animation.length == 0) {
                            animation = SVG.addChild(this, "animate", {
                                "attributeName": "opacity",
                                "attributeType": "XML",
                                "begin": "indefinite",
                                "from": "0.0",
                                "to": "1",
                                "begin": "0s",
                                "dur": "0.5s",
                                "repeatCount": "5"
                            });
                        } else {
                            animation = animation[0];
                        }
                        let y = $(group).find("rect").attr("y");
                        $(track.svgdiv).scrollTop(y);
                        animation.beginElement();
                    });
                }
            }
        });

        track.on("track:close", function(event) {
            _this.removeTrack(event.sender);
        });
        track.on("track:up", function(event) {
            _this._reallocateAbove(event.sender);
        });
        track.on("track:down", function(event) {
            _this._reallocateUnder(event.sender);
        });

        this.on("track:draw", track.get("track:draw"));
        //        this.on('trackSpecies:change', track.get('trackSpecies:change'));
        this.on("trackRegion:change", track.get("trackRegion:change"));
        this.on("trackRegion:move", track.get("trackRegion:move"));
        this.on("trackFeature:highlight", track.get("trackFeature:highlight"));

    }
    toggleAutoHeight(bool) {
        for (let i = 0; i < this.tracks.length; i++) {
            let track = this.tracks[i];
            track.toggleAutoHeight(bool);
        }
    }
    updateHeight() {
        for (let i = 0; i < this.tracks.length; i++) {
            let track = this.tracks[i];
            track.updateHeight(true);
        }
    }

    containsTrack(track) {
        if (typeof this.tracksIndex[track.id] !== "undefined") {
            return true;
        } else {
            return false;
        }
    }
    getTrackIndex(track) {
        return this.tracksIndex[track.id];
    }
    _updateTracksIndex() {
        //update index with correct index after splice
        for (let i = 0; i < this.tracks.length; i++) {
            let track = this.tracks[i];
            this.tracksIndex[track.id] = i;
        }
    }
    refreshTracksDom() {
        for (let i = 0; i < this.tracks.length; i++) {
            let track = this.tracks[i];
            $(track.div).detach();
            $(this.tlTracksDiv).append(track.div);
        }
        this.trigger("tracks:refresh", {
            sender: this
        });
    }
    removeTrack(track) {
        if (!this.containsTrack(track)) {
            return false;
        }
        // first hide the track
        this.hideTrack(track);
        track.remove();

        let index = this.getTrackIndex(track);
        // remove track from list and hash data
        this.tracks.splice(index, 1)[0];
        delete this.tracksIndex[track.id];
        this._updateTracksIndex();

        // delete listeners

        track.off("track:close");
        track.off("track:up");
        track.off("track:down");


        this.off("track:draw", track.get("track:draw"));
        //        this.off('trackSpecies:change', track.get('trackSpecies:change'));
        this.off("trackRegion:change", track.get("trackRegion:change"));
        this.off("trackRegion:move", track.get("trackRegion:move"));
        //this.off('trackWidth:change', track.set('trackWidth:change'));
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


    //This routine is called when track order is modified
    _reallocateAbove(track) {
        if (!this.containsTrack((track))) {
            return false;
        }

        let i = this.getTrackIndex(track);
        console.log(`${i} wants to move up`);
        if (i > 0) {
            let aboveTrack = this.tracks[i - 1];
            let underTrack = this.tracks[i];

            this.tracks[i] = aboveTrack;
            this.tracks[i - 1] = underTrack;
            this.tracksIndex[aboveTrack.id] = i;
            this.tracksIndex[underTrack.id] = i - 1;
            this.refreshTracksDom();
        } else {
            console.log("is at top");
        }
    }

    //This routine is called when track order is modified
    _reallocateUnder(track) {
        if (!this.containsTrack((track))) {
            return false;
        }

        let i = this.getTrackIndex(track);
        console.log(`${i} wants to move down`);
        if (i + 1 < this.tracks.length) {
            let aboveTrack = this.tracks[i];
            let underTrack = this.tracks[i + 1];

            this.tracks[i] = underTrack;
            this.tracks[i + 1] = aboveTrack;
            this.tracksIndex[underTrack.id] = i;
            this.tracksIndex[aboveTrack.id] = i + 1;
            this.refreshTracksDom();
        } else {
            console.log("is at bottom");
        }
    }

    setTrackIndex(track, newIndex) {
        if (!this.containsTrack((track))) {
            return false;
        }

        let oldIndex = this.getTrackIndex(track);

        //remove track from old index
        this.tracks.splice(oldIndex, 1)[0];

        //add track at new Index
        this.tracks.splice(newIndex, 0, track);

        this._updateTracksIndex();

        //update track div positions
        this.refreshTracksDom();
    }
    swapTracks(t1, t2) {
        if (!this.containsTrack((t1))) {
            return false;
        }
        if (!this.containsTrack((t2))) {
            return false;
        }
        let oldIndex1 = this.getTrackIndex(t1);
        let oldIndex2 = this.getTrackIndex(t2);

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

        let y = $(track.div).position().top;
        $(this.tlTracksDiv).scrollTop(y);
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
    _setPixelBase() {
        this.pixelBase = this.width / this.region.length();
        this.pixelBase = this.pixelBase / this.zoomMultiplier;
        this.halfVirtualBase = (this.width * 3 / 2) / this.pixelBase;
    }

    _setTextPosition() {
        let centerPosition = this.region.center();
        let baseLength = parseInt(this.width / this.pixelBase); //for zoom 100
        let aux = Math.ceil((baseLength / 2) - 1);
        this.visualRegion.start = Math.floor(centerPosition - aux);
        this.visualRegion.end = Math.floor(centerPosition + aux);

        this.positionMidPosDiv.textContent = Utils.formatNumber(centerPosition);
        this.positionLeftDiv.textContent = Utils.formatNumber(this.visualRegion.start);
        this.positionRightDiv.textContent = Utils.formatNumber(this.visualRegion.end);


        this.windowSize = `Window size: ${Utils.formatNumber(this.visualRegion.length())} nts`;
        this.windowSizeDiv.innerHTML = this.windowSize;
    }

    getTrackById(trackId) {
        if (typeof this.tracksIndex[trackId] !== "undefined") {
            let i = this.tracksIndex[trackId];
            return this.tracks[i];
        }
    }
    getSequenceTrack() {
        //if multiple, returns the first found
        for (let i = 0; i < this.tracks.length; i++) {
            let track = this.tracks[i];
            if (track.renderer instanceof SequenceRenderer) {
                return track;
            }
        }
        return;
    }

    getMousePosition(position) {
        let base = "";
        if (position > 0) {
            base = this.getSequenceNucleotid(position);
        }
        return base;
    }

    getSequenceNucleotid(position) {
        let seqTrack = this.getSequenceTrack();
        if (seqTrack) {
            let el = seqTrack.svgCanvasFeatures.querySelector(`text[data-pos="${position}"]`);
            if (el) {
                return el.textContent;
            }
        }
        return "";
    }

    setNucleotidPosition(position) {
        let base = this.getSequenceNucleotid(position);
        this.positionNucleotidDiv.style.color = SEQUENCE_COLORS[base];
        this.positionNucleotidDiv.textContent = base;
    }

    setCellBaseHost(host) {
        this.cellBaseHost = host;
        for (let i = 0; i < this.tracks.length; i++) {
            let track = this.tracks[i];
            if (track.dataAdapter instanceof CellBaseAdapter) {
                track.dataAdapter.setHost(this.cellBaseHost);
            }
        }
    }
    deleteTracksCache(){
        for (let i = 0; i < this.tracks.length; i++) {
            let track = this.tracks[i];
            if(track.dataAdapter.deleteCache != null){
                track.dataAdapter.deleteCache();
            }
        }
    }

}

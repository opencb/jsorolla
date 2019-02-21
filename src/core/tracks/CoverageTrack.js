class LinearCoverageTrack extends LinearFeatureTrack {

    /*
    args = {
        name: ,          // Name to be displayed
        targetId: ,
        dataAdapter: ,   // Adapter to retrieve data
        data: ,          // Static data if no data adapter is passed (mainly for testing purposes)
        opencga: {
            client: ,    // OpenCGA client
            study: ,     // Study fqn,
            file: ,      // File
        }
        renderer:        // Renderer
        {configArgs}
    }
    */
    constructor(args) {
        super(args);

        if (UtilsNew.isUndefinedOrNull(this.renderer)) {
            this.renderer = new CoverageRenderer();
        }

        if (UtilsNew.isUndefinedOrNull(this.dataAdapter)) {
            if (UtilsNew.isNotUndefinedOrNull(this.opencga)) {
                this.dataAdapter = new OpencgaAdapter(this.opencga.client, "coverage", "", "", {
                    study: this.opencga.study,
                    fileId: this.opencga.file
                }, {});
            }
        }

        this.dataType = "coverage";
        this.init(this.targetId);
    }

    _checkAllParams(params) {
        if (UtilsNew.isEmpty(params.study)) {
            throw "Missing study parameter";
        }
        if (UtilsNew.isEmpty(params.fileId)) {
            throw "Missing fileId parameter";
        }
        if (UtilsNew.isUndefinedOrNull(params.region)) {
            throw "Missing region parameter";
        }
    }

    /**
     *
      * @param query: Object containing:
     *   {
     *       lowCoverageThreshold: ,
     *       regionOffset: ,
     *       study: ,
     *       fileId: ,
     *       region: ,
     *       data: ,
     *   }
     */
    draw(query) {
        let _this = Object.assign({}, this._getDefaultConfig(), this, query);

        this._checkAllParams(_this);

        let coverageConfiguration = {
            width: _this.width,
            height: _this.height,
            svgCanvas: _this.svgCanvasFeatures,
            scaleFactor: this._getScaleFactor(_this.width, _this.region.start, _this.region.end),
            start: _this.region.start,
            end: _this.region.end
        };

        this.clean();
        if (UtilsNew.isNotUndefinedOrNull(_this.data)) {
            this.renderer.render(_this.data, coverageConfiguration);
        } else {
            // We will obtain a region with an the offset defined
            let start = (_this.region.start - _this.regionOffset) < 0 ? 0 : _this.region.start - _this.regionOffset;
            let end = _this.region.end + _this.regionOffset;

            this.dataAdapter.getData({
                params: {
                    study: _this.study,
                    fileId: _this.fileId,
                    minCoverage: _this.lowCoverageThreshold
                },
                dataType: this.dataType,
                region: new Region(`${_this.region.chromosome}:${start}-${end}`),
                width: _this.width
            }).then(function(data) {
                _this.renderer.render(data, coverageConfiguration);
            })
        }
    }

    init(targetId) {
        this._initDomContainer(targetId);

        this.svgCanvasFeatures = SVG.addChild(this.contentDiv, "svg", {
            "class": "features",
            "width": this.width,
            "height": this.height,
            "style": "fill: white",
            "xmlns": "http://www.w3.org/2000/svg"
        });
    }

    setRegion(chromosome, start, end) {
        this.region = new Region(chromosome, start, end);
    }

    _initDomContainer(targetId) {
        let div = $(`<div id="${this.id}-div"></div>`)[0];
        div.classList.add("ocb-track");
        $(div).css({
            "padding": "5px 0px"
        });

        this.titleDiv = $(`<div class="ocb-track-title"></div>`)[0];
        this.contentDiv = $(`<div id="${this.id}-svg"></div>`)[0];

        $(this.contentDiv).css({
            "position": "relative",
            "box-sizing": "boder-box",
            "z-index": 3,
            "height": this.height,
            "overflow-y": "hidden",
            "overflow-x": "hidden"
        });

        $(`#${targetId}`).addClass("unselectable");
        $(`#${targetId}`).append(div);
        $(div).append(this.titleDiv);
        $(div).append(this.contentDiv);

        $(this.titleDiv).html(`<h5>${this.name}</h5>`);
    }

    _getScaleFactor(width, start, end) {
        return width / (end - start + 1);
    }

    _getDefaultConfig() {
        return Object.assign(super._getDefaultConfig(), {
            lowCoverageThreshold: 20,
            regionOffset: 500
        });
    }

}
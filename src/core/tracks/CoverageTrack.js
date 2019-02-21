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
            this.renderer = new CoverageRenderer(new CoverageRendererConfig(this.width, this.height));
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

    draw(minCoverage) {
        let _this = this;


        this.coverageConfiguration = new CoverageRendererConfig(this.width, this.height, this.svgCanvasFeatures, this._getScaleFactor(),
            this.region.start, this.region.end);


        this.clean();
        if (UtilsNew.isNotUndefinedOrNull(this.data)) {
            this.renderer.render(this.data, this.coverageConfiguration);
        } else {
            // We will obtain a region with an offset of 300 bps
            let start = (this.region.start - 300) < 0 ? 0 : this.region.start - 300;
            let end = this.region.end + 300;

            this.dataAdapter.getData({
                dataType: this.dataType,
                region: new Region(`${this.region.chromosome}:${start}-${end}`),
                width: this.width,
                minCoverage: minCoverage
            }).then(function(data) {
                _this.renderer.render(data, _this.coverageConfiguration);
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

    _getScaleFactor() {
        return this.width / (this.region.end - this.region.start + 1);
    }

    _getDefaultConfig() {
        return super._getDefaultConfig();
    }

}
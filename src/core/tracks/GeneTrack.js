class LinearGeneTrack extends LinearFeatureTrack {

    /*
    args = {
        name: ,          // Name to be displayed
        targetId: ,
        cellbase: {
            host:
            version:
            species:
        },
        dataAdapter: ,   // Adapter to retrieve data
        data: ,          // Static data if no data adapter is passed (mainly for testing purposes)
        renderer:,       // Renderer
        {configArgs}
    }
    */
    constructor(args, config) {
        super(args, config);

        if (UtilsNew.isUndefinedOrNull(this.renderer)) {
            // this.renderer = new GeneRenderer(new GeneRendererConfig(this.width, this.height));
            this.renderer = new GeneRenderer({});
        }

        if (UtilsNew.isUndefinedOrNull(this.dataAdapter)) {
            if (UtilsNew.isNotUndefinedOrNull(this.cellbase)) {
                let cellBaseConfig = new CellBaseClientConfig(this.cellbase.host, this.cellbase.version, this.cellbase.species);
                cellBaseConfig.cache.active = false;
                this.dataAdapter = new CellBaseAdapter(new CellBaseClient(cellBaseConfig), "genomic", "region", "gene", {},
                    { chunkSize: 100000 });
                // this.dataAdapter = new CellBaseAdapter(new CellBaseClient(cellBaseConfig), "feature", "gene", "info", {},
                //     { chunkSize: 100000 });
            }
        }

        if (UtilsNew.isNotUndefinedOrNull(this.data)) {
            this.data = this._extractMetaTranscript(this.data);
        }

        this.dataType = "gene";
        this.init(this.targetId);
    }

    /**
     *
     * @param args: Object containing:
     *   {
     *       data: {},
     *       query: {},
     *       config: {}
     *   }
     */
    draw(args) {
        let config = Object.assign({}, this.config, args.config);

        this.clean();

        if (UtilsNew.isUndefinedOrNull(args.query)) {
            let data = UtilsNew.isUndefinedOrNull(args.data) ? this.data : args.data;

            if (UtilsNew.isUndefinedOrNull(data)) {
                throw "Missing 'data' or 'query'";
            }

            $(this.titleDiv).html(`<h5>${data.name}</h5>`);

            this.rendererConfiguration = {
                svgCanvasFeatures: this.svgCanvasFeatures,
                pixelBase: this._getScaleFactor(data),
                width: config.width,
                position: ((data.end - data.start + 1) / 2) + data.start,
                regionSize: data.end - data.start + 1,
                pixelPosition: 0,
                renderedArea: {}
            };

            this.renderer.render([this._extractMetaTranscript(data)], this.rendererConfiguration);
        } else {
            // We will obtain a region with an offset of 300 bps
            let start = (args.query.region.start - 300) < 0 ? 0 : args.query.region.start - 300;
            let end = args.query.region.end + 300;

            this.dataAdapter.getData({
                dataType: this.dataType,
                region: new Region(`${args.query.region.chromosome}:${start}-${end}`),
                width: this.width,
                position: ((args.query.region.end - args.query.region.start + 1) / 2) + args.query.region.start,
                regionSize: args.query.region.end - args.query.region.start + 1,
                pixelPosition: 0,
                renderedArea: {}
            }).then(function(data) {
                $(_this.titleDiv).html(`<h5>${data.name}</h5>`);

                _this.rendererConfiguration = {
                    svgCanvasFeatures: _this.svgCanvasFeatures,
                    pixelBase: _this._getScaleFactor(data),
                    width: _this.width
                };

                _this.renderer.render(_this._extractMetaTranscript(data), _this.rendererConfiguration);
            })
        }
    }

    init(targetId) {
        this._initDomContainer(targetId);

        this.svgCanvasFeatures = SVG.addChild(this.contentDiv, "svg", {
            "class": "features",
            "width": this.config.width,
            "height": this.config.height,
            "style": "fill: white",
            "xmlns": "http://www.w3.org/2000/svg"
        });
    }

    _extractMetaTranscript(gene) {
        let exons = [];

        // We create a copy of all the exons from the first transcript
        for (let i = 0; i < gene.transcripts[0].exons.length; i++) {
            exons.push(Object.assign({}, gene.transcripts[0].exons[i]));
        }
        if (gene.transcripts.length === 1) {
            return exons;
        }

        // We need to modify the information we have to include the exons of each of the transcripts
        for (let i = 1; i < gene.transcripts.length; i++) {
            // lastIndex visited from the final list of exons to avoid looping again the first positions
            // if it is not necessary
            let lastIndex = 0;
            for (let j = 0; j < gene.transcripts[i].exons.length; j++) {
                let exon = gene.transcripts[i].exons[j];

                for (let w = lastIndex; w < exons.length; w++) {
                    // We check if the current exon is located before the first of the exons we have stored
                    if (exons[w].start > exon.end) {
                        exons.splice(lastIndex + w, 0, Object.assign({}, exon));
                        lastIndex += w + 1;
                        break;
                    }

                    let changed = false;
                    // Exon stored                   |---------|
                    // Exon analysed             |-------
                    if (exons.start < exons[w].start && exon.end >= exons[w].start) {
                        // We modify the start value of the stored exon
                        exons[w].start = exon.start;
                        changed = true;
                    }

                    // Exon stored                   |---------|
                    // Exon analysed                       -------|
                    if (exons.start >= exons[w].start && exon.end > exons[w].end) {
                        // We modify the end value of the stored exon
                        exons[w].end = exon.end;
                        changed = true;
                    }

                    if (changed) {
                        lastIndex = w;
                        break;
                    }
                }
            }
        }

        // Once we have merged all the exons, we need to remove any overlapping exon that might have resulted
        // from the previous merge
        let finalListOfExons = [];
        do {
            for (let i = 0; i < exons.length - 1; i++) {
                let exon = exons[i];
                finalListOfExons.push(exon);

                if (i === exons.length - 2) {
                    if (exons[i + 1].start <= exon.end) {
                        exon.end = Math.max(exon.end, exons[i + 1].end);
                        // We increment i to skip the next exon
                        i++;
                    } else {
                        finalListOfExons.push(exons[i + 1]);
                    }
                } else {
                    if (exons[i + 1].start <= exon.end) {
                        exon.end = Math.max(exon.end, exons[i + 1].end);
                        // We increment i to skip the next exon
                        i++;
                    }
                }
            }

            if (finalListOfExons.length !== exons.length) {
                // We copy finalListOfExons into exons (source) and empty finalListOfExons to do another iteration
                exons = finalListOfExons;
                finalListOfExons = [];
            }
        } while (finalListOfExons.length !== exons.length);

        let geneCopy = Object.assign({}, gene);
        geneCopy.transcripts = [geneCopy.transcripts[0]];
        geneCopy.transcripts[0].exons = finalListOfExons;

        return geneCopy;
    }

    _initDomContainer(targetId) {
        this.mainDiv = $(`<div id="${this.id}-div"></div>`)[0];
        this.mainDiv.classList.add("ocb-track");
        $(this.mainDiv).css({
            "padding": "5px 0px"
        });

        this.titleDiv = $(`<div class="ocb-track-title"></div>`)[0];
        this.contentDiv = $(`<div id="${this.id}-svg"></div>`)[0];

        $(this.contentDiv).css({
            "position": "relative",
            "box-sizing": "border-box",
            "z-index": 3,
            "height": this.height,
            "overflow-y": "hidden",
            "overflow-x": "hidden"
        });

        $(`#${targetId}`).addClass("unselectable");
        $(`#${targetId}`).append(this.mainDiv);
        $(this.mainDiv).append(this.titleDiv);
        $(this.mainDiv).append(this.contentDiv);
    }

    _getScaleFactor(data) {
        return this.config.width / (data.end - data.start + 1);
    }

    _getDefaultConfig() {
        return super._getDefaultConfig();
    }

}
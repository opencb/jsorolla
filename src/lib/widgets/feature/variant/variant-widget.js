function VariantWidget(args) {

    _.extend(this, Backbone.Events);

    this.id = Utils.genId("VariantWidget");

    //set default args
    this.target;
    this.width;
    this.autoRender = true;
    this.data = [];
    this.host;
    this.closable = true;
    this.filters = {
        segregation: true,
        maf: true,
        effect: true,
        region: true,
        gene: true
    };
    this.defaultToolConfig = {effect: true, genomeViewer: true, genotype: true, stats: true};
    this.tools = [];
    this.dataParser;


    _.extend(this.filters, args.filters);
    _.extend(this.defaultToolConfig, args.defaultToolConfig);

    delete args.filters;
    delete args.defaultToolConfig;

    //set instantiation args, must be last
    _.extend(this, args);

    this.selectedToolDiv;

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }

}

VariantWidget.prototype = {
    render: function () {
        var _this = this;

        //HTML skel
        this.div = document.createElement('div');
        this.div.setAttribute('id', this.id);

        this.variantBrowserGridDiv = document.createElement('div');
        this.variantBrowserGridDiv.setAttribute('class', 'ocb-variant-widget-grid');
        this.div.appendChild(this.variantBrowserGridDiv);

        this.variantBrowserGrid = this._createVariantBrowserGrid(this.variantBrowserGridDiv);

        this.tabPanelTitle = document.createElement('div');
        this.tabPanelTitle.setAttribute('class', 'eva-header-3 ocb-variant-tab-panel-title');
        this.tabPanelTitle.innerHTML = 'Variant Data';
        this.div.appendChild(this.tabPanelTitle);

        this.tabPanelDiv = document.createElement('div');
        this.tabPanelDiv.setAttribute('class', 'ocb-variant-tab-panel');
        this.div.appendChild(this.tabPanelDiv);

        this.toolTabPanel = Ext.create("Ext.tab.Panel", {
            border: 0,
            layout: 'fit',
            margin: '10 0 0 0',
            plain: true,
            animCollapse: false,
            collapseDirection: Ext.Component.DIRECTION_BOTTOM,
            titleCollapse: true,
            overlapHeader: true,
            defaults: {
                hideMode: 'offsets',
                autoShow: true
            },
            listeners: {
                tabchange: function (tabPanel, newTab, oldTab, eOpts) {
                    _this.selectedToolDiv = newTab.contentEl;
                    if (_this.lastVariant) {
                        _this.trigger('variant:change', {variant: _this.lastVariant, sender: _this});
                    }
                }
            }
        });

        var tabPanelItems = [];

        if (this.defaultToolConfig.stats) {
            this.variantStatsPanelDiv = document.createElement('div');
            this.variantStatsPanelDiv.setAttribute('class', 'ocb-variant-stats-panel');
            this.variantStatsPanel = this._createVariantStatsPanel(this.variantStatsPanelDiv);
            tabPanelItems.push({
                title: 'File and Stats',
                border: 0,
                contentEl: this.variantStatsPanelDiv,
                height: 500,
            });
        }

        if (this.defaultToolConfig.effect) {
            this.variantEffectGridDiv = document.createElement('div');
            this.variantEffectGridDiv.setAttribute('class', 'ocb-variant-effect-grid');
            this.variantEffectGrid = this._createVariantEffectGrid(this.variantEffectGridDiv);
            tabPanelItems.push({
                title: 'Effect and Annotation',
                contentEl: this.variantEffectGridDiv,
                height: 500,
            });
        }

        if (this.defaultToolConfig.genotype) {
            this.variantGenotypeGridDiv = document.createElement('div');
            this.variantGenotypeGridDiv.setAttribute('class', 'ocb-variant-genotype-grid');
            this.variantGenotypeGrid = this._createVariantGenotypeGrid(this.variantGenotypeGridDiv);
            tabPanelItems.push({
                title: 'Genotype',
                border: 0,
                contentEl: this.variantGenotypeGridDiv,
                height: 500,
            });
        }

        if (this.defaultToolConfig.genomeViewer) {
            this.genomeViewerDiv = document.createElement('div');
            this.genomeViewerDiv.setAttribute('class', 'ocb-gv');
            this.genomeViewer = this._createGenomeViewer(this.genomeViewerDiv);
            tabPanelItems.push({
                title: 'Genomic Context',
                contentEl: this.genomeViewerDiv,
            });
        }

        for (var i = 0; i < this.tools.length; i++) {
            var tool = this.tools[i];
            var toolDiv = document.createElement('div');
            toolDiv.setAttribute('class', 'ocb-gv');

            tool.tool.target = toolDiv;

            tabPanelItems.push({
                title: tool.title,
                contentEl: toolDiv,
                height: 500
            });
        }

        this.toolTabPanel.add(tabPanelItems);

        this.rendered = true;
    },
    draw: function () {
        var _this = this;
        this.targetDiv = (this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);

        this.variantBrowserGrid.draw();

        this.toolTabPanel.render(this.tabPanelDiv);


        for (var i = 0; i < this.toolTabPanel.items.items.length; i++) {
            this.toolTabPanel.setActiveTab(i);
        }

        if (this.defaultToolConfig.effect) {

            this.variantEffectGrid.draw();
        }


        if (this.defaultToolConfig.genotype) {

            this.variantGenotypeGrid.draw();
        }

        if (this.defaultToolConfig.genomeViewer) {
            this.genomeViewer.draw();
        }

        if (this.defaultToolConfig.stats) {
            this.variantStatsPanel.draw();
        }

        for (var i = 0; i < this.tools.length; i++) {
            var tool = this.tools[i];
            tool.tool.draw();
        }


        this.toolTabPanel.setActiveTab(0);
    },
    _createVariantBrowserGrid: function (target) {
        var _this = this;

        var columns = [
            {
                text: "SNP Id",
                dataIndex: 'id'
            },
            {
                text: "Chromosome",
                dataIndex: 'chromosome'
            },
            {
                text: 'Position',
                dataIndex: 'start'
            },
            //{
            //text: 'End',
            //dataIndex: 'end'
            //},
            {
                text: 'Aleles',
                xtype: "templatecolumn",
                tpl: "{reference}>{alternate}"
            },
            {
                text: 'Class',
                dataIndex: 'type'
            },
            {
                text: '1000G MAF',
                dataIndex: ''
            },
            {
                text: 'Consequence Type',
                dataIndex: 'ct'
            },
            {
                text: 'Gene',
                dataIndex: 'gene'
            },
            {
                text: 'HGVS Names',
                dataIndex: 'hgvs_name'
            },
            {
                text: 'View',
                //dataIndex: 'id',
                xtype: 'templatecolumn',
                tpl: '<tpl if="id"><a href="?variantID={id}" target="_blank"><img class="eva-grid-img" src="img/eva_logo.png"/></a>&nbsp;' +
                    '<a href="http://www.ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v={id}" target="_blank"><img alt="" src="http://static.ensembl.org/i/search/ensembl.gif"></a>' +
                    '&nbsp;<a href="http://www.ncbi.nlm.nih.gov/SNP/snp_ref.cgi?searchType=adhoc_search&type=rs&rs={id}" target="_blank"><span>dbSNP</span></a>' +
                    '<tpl else><a href="?variantID={chromosome}:{start}:{ref}:{alt}" target="_blank"><img class="eva-grid-img" src="img/eva_logo.png"/></a>&nbsp;<img alt="" class="in-active" src="http://static.ensembl.org/i/search/ensembl.gif">&nbsp;<span  style="opacity:0.2" class="in-active">dbSNP</span></tpl>'
            }

            //
        ];

        var attributes = [
            {name: 'id', type: 'string'},
            {name: "chromosome", type: "string"},
            {name: "start", type: "int"},
            {name: "end", type: "int"},
            {name: "type", type: "string"},
            {name: "ref", type: "string"},
            {name: "alt", type: "string"},
            {name: 'hgvs_name', type: 'string'},
        ];


        var variantBrowserGrid = new VariantBrowserGrid({
            target: target,
            data: this.data,
            dataParser: this.dataParser,
            attributes: attributes,
            columns: columns,
            handlers: {
                "variant:change": function (e) {
                    _this.lastVariant = e.args;
                    _this.trigger('variant:change', {variant: _this.lastVariant, sender: _this});
                },
                "variant:clear": function (e) {
                    //_this.lastVariant = e.args;
                    _this.trigger('variant:clear', {sender: _this});
                }
            }
        });
        return variantBrowserGrid;
    },

    _createVariantEffectGrid: function (target) {
        var _this = this;
        var variantEffectGrid = new VariantEffectGrid({
            target: target,
            gridConfig: {
                flex: 1,
                layout: {
                    align: 'stretch'
                }
            },
            handlers: {
                "load:finish": function (e) {
                }
            }
        });

        this.variantBrowserGrid.on("variant:clear", function (e) {
            variantEffectGrid.clear(true);
        });

        this.on("variant:change", function (e) {
            if (target === _this.selectedToolDiv) {
                var variant = e.variant;
                
                var effectData = _this._loadExampleData();

                variantEffectGrid.load(effectData);
            }

        });
        return variantEffectGrid;
    },
    _createVariantStatsPanel: function (target) {
        var _this = this;
        var variantStatsPanel = new VariantStatsPanel({
            target: target,
            handlers: {
                "load:finish": function (e) {
//                    _this.grid.setLoading(false);
                }
            }
        });

        this.variantBrowserGrid.on("variant:clear", function (e) {
            variantStatsPanel.clear(true);
        });

        this.on("variant:change", function (e) {
            if (target === _this.selectedToolDiv) {
                var variant = e.variant;
                if (variant.files) {
                    variantStatsPanel.load(variant.files);
                }
            }
        });
        return variantStatsPanel;
    },
    _createVariantGenotypeGrid: function (target) {
        var _this = this;
        var variantGenotypeGrid = new VariantGenotypeGrid({
            target: target,
            gridConfig: {
                flex: 1,
                layout: {
                    align: 'stretch'
                }
            },
            handlers: {
                "load:finish": function (e) {

                }
            }
        });

        this.variantBrowserGrid.on("variant:clear", function (e) {
            variantGenotypeGrid.clear(true);
        });

        _this.on("variant:change", function (e) {
            if (target === _this.selectedToolDiv) {
                var variant = e.variant;
                if (variant.files) {
                    variantGenotypeGrid.load(variant.files);
                }
            }
        });
        return variantGenotypeGrid;
    },


    _createGenomeViewer: function (target) {
        var _this = this;


        var region = new Region({
            chromosome: "13",
            start: 32889611,
            end: 32889611
        });

        var genomeViewer = new GenomeViewer({
            sidePanel: false,
            target: target,
            border: false,
            resizable: true,
            width: this.width,
            region: region,
            trackListTitle: '',
            drawNavigationBar: true,
            drawKaryotypePanel: false,
            drawChromosomePanel: false,
            drawRegionOverviewPanel: true,
            overviewZoomMultiplier: 50,
            navigationBarConfig: {
                componentsConfig: {
                    restoreDefaultRegionButton: false,
                    regionHistoryButton: false,
                    speciesButton: false,
                    chromosomesButton: false,
                    karyotypeButton: false,
                    chromosomeButton: false,
                    regionButton: false,
//                    zoomControl: false,
                    windowSizeControl: false,
//                    positionControl: false,
//                    moveControl: false,
//                    autoheightButton: false,
//                    compactButton: false,
//                    searchControl: false
                }
            },
        }); //the div must exist


        var renderer = new FeatureRenderer(FEATURE_TYPES.gene);
        renderer.on({
            'feature:click': function (event) {
                // feature click event example
                console.log(event)
            }
        });
        var geneOverview = new FeatureTrack({
            targetId: null,
            id: 2,
//        title: 'Gene overview',
            minHistogramRegionSize: 20000000,
            maxLabelRegionSize: 10000000,
            height: 100,

            renderer: renderer,

            dataAdapter: new CellBaseAdapter({
                category: "genomic",
                subCategory: "region",
                resource: "gene",
                params: {
                    exclude: 'transcripts,chunkIds'
                },
                species: genomeViewer.species,
                cacheConfig: {
                    chunkSize: 100000
                }
            })
        });


        var sequence = new SequenceTrack({
            targetId: null,
            id: 1,
//        title: 'Sequence',
            height: 30,
            visibleRegionSize: 200,

            renderer: new SequenceRenderer(),

            dataAdapter: new SequenceAdapter({
                category: "genomic",
                subCategory: "region",
                resource: "sequence",
                species: genomeViewer.species
            })
        });


        var gene = new GeneTrack({
            targetId: null,
            id: 2,
            title: 'Gene',
            minHistogramRegionSize: 20000000,
            maxLabelRegionSize: 10000000,
            minTranscriptRegionSize: 200000,
            height: 140,

            renderer: new GeneRenderer(),

            dataAdapter: new CellBaseAdapter({
                category: "genomic",
                subCategory: "region",
                resource: "gene",
                species: genomeViewer.species,
                params: {
                    exclude: 'transcripts.tfbs,transcripts.xrefs,transcripts.exons.sequence'
                },
                cacheConfig: {
                    chunkSize: 100000
                }
            })
        });

        var snp = new FeatureTrack({
            targetId: null,
            id: 4,
            title: 'SNP',
            featureType: 'SNP',
            minHistogramRegionSize: 10000,
            maxLabelRegionSize: 3000,
            height: 100,

            renderer: new FeatureRenderer(FEATURE_TYPES.snp),

            dataAdapter: new CellBaseAdapter({
                category: "genomic",
                subCategory: "region",
                resource: "snp",
                params: {
                    exclude: 'transcriptVariations,xrefs,samples'
                },
                species: genomeViewer.species,
                cacheConfig: {
                    chunkSize: 10000
                }
            })
        });

        genomeViewer.addOverviewTrack(geneOverview);
        genomeViewer.addTrack([sequence, gene, snp]);


        this.on("variant:change", function (e) {
            if (target === _this.selectedToolDiv) {
                var variant = e.variant;
                var region = new Region(variant);
                if (!_.isUndefined(genomeViewer)) {
                    genomeViewer.setRegion(region);
                }
            }
        });

        return genomeViewer;
    },
    retrieveData: function (baseUrl, filterParams) {
        this.variantBrowserGrid.loadUrl(baseUrl, filterParams);
    },
    setLoading: function (loading) {
        this.variantBrowserGrid.setLoading(loading);
    },
    _loadExampleData: function(){
        var data = {"chromosome":"1","start":10001,"end":10001,"referenceAllele":"T","genes":[],"effects":{"G":[{"allele":"G","geneId":"ENSG00000223972","geneName":"DDX11L1","geneNameSource":"HGNC","featureId":"ENST00000456328","featureType":"Transcript","featureBiotype":"processed_transcript","featureStrand":"1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1631],"canonical":true,"variantToTranscriptDistance":1868},{"allele":"G","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000488147","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":false,"variantToTranscriptDistance":4403},{"allele":"G","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000541675","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":false,"variantToTranscriptDistance":4362},{"allele":"G","geneId":"ENSG00000223972","geneName":"DDX11L1","geneNameSource":"HGNC","featureId":"ENST00000450305","featureType":"Transcript","featureBiotype":"transcribed_unprocessed_pseudogene","featureStrand":"1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1631],"canonical":false,"variantToTranscriptDistance":2009},{"allele":"G","geneId":"ENSG00000223972","geneName":"DDX11L1","geneNameSource":"HGNC","featureId":"ENST00000515242","featureType":"Transcript","featureBiotype":"transcribed_unprocessed_pseudogene","featureStrand":"1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1631],"canonical":false,"variantToTranscriptDistance":1871},{"allele":"G","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000538476","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":false,"variantToTranscriptDistance":4410},{"allele":"G","geneId":"ENSG00000223972","geneName":"DDX11L1","geneNameSource":"HGNC","featureId":"ENST00000518655","featureType":"Transcript","featureBiotype":"transcribed_unprocessed_pseudogene","featureStrand":"1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1631],"canonical":false,"variantToTranscriptDistance":1873},{"allele":"G","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000438504","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":true,"variantToTranscriptDistance":4362},{"allele":"G","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000423562","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":false,"variantToTranscriptDistance":4362},{"allele":"G","featureId":"ENSR00000668495","featureType":"RegulatoryFeature","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1566],"canonical":false,"variantToTranscriptDistance":-1}],"A":[{"allele":"A","geneId":"ENSG00000223972","geneName":"DDX11L1","geneNameSource":"HGNC","featureId":"ENST00000456328","featureType":"Transcript","featureBiotype":"processed_transcript","featureStrand":"1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1631],"canonical":true,"variantToTranscriptDistance":1868},{"allele":"A","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000488147","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":false,"variantToTranscriptDistance":4403},{"allele":"A","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000541675","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":false,"variantToTranscriptDistance":4362},{"allele":"A","geneId":"ENSG00000223972","geneName":"DDX11L1","geneNameSource":"HGNC","featureId":"ENST00000450305","featureType":"Transcript","featureBiotype":"transcribed_unprocessed_pseudogene","featureStrand":"1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1631],"canonical":false,"variantToTranscriptDistance":2009},{"allele":"A","geneId":"ENSG00000223972","geneName":"DDX11L1","geneNameSource":"HGNC","featureId":"ENST00000515242","featureType":"Transcript","featureBiotype":"transcribed_unprocessed_pseudogene","featureStrand":"1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1631],"canonical":false,"variantToTranscriptDistance":1871},{"allele":"A","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000538476","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":false,"variantToTranscriptDistance":4410},{"allele":"A","geneId":"ENSG00000223972","geneName":"DDX11L1","geneNameSource":"HGNC","featureId":"ENST00000518655","featureType":"Transcript","featureBiotype":"transcribed_unprocessed_pseudogene","featureStrand":"1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1631],"canonical":false,"variantToTranscriptDistance":1873},{"allele":"A","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000438504","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":true,"variantToTranscriptDistance":4362},{"allele":"A","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000423562","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":false,"variantToTranscriptDistance":4362},{"allele":"A","featureId":"ENSR00000668495","featureType":"RegulatoryFeature","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1566],"canonical":false,"variantToTranscriptDistance":-1}],"C":[{"allele":"C","geneId":"ENSG00000223972","geneName":"DDX11L1","geneNameSource":"HGNC","featureId":"ENST00000456328","featureType":"Transcript","featureBiotype":"processed_transcript","featureStrand":"1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1631],"canonical":true,"variantToTranscriptDistance":1868},{"allele":"C","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000488147","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":false,"variantToTranscriptDistance":4403},{"allele":"C","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000541675","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":false,"variantToTranscriptDistance":4362},{"allele":"C","geneId":"ENSG00000223972","geneName":"DDX11L1","geneNameSource":"HGNC","featureId":"ENST00000450305","featureType":"Transcript","featureBiotype":"transcribed_unprocessed_pseudogene","featureStrand":"1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1631],"canonical":false,"variantToTranscriptDistance":2009},{"allele":"C","geneId":"ENSG00000223972","geneName":"DDX11L1","geneNameSource":"HGNC","featureId":"ENST00000515242","featureType":"Transcript","featureBiotype":"transcribed_unprocessed_pseudogene","featureStrand":"1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1631],"canonical":false,"variantToTranscriptDistance":1871},{"allele":"C","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000538476","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":false,"variantToTranscriptDistance":4410},{"allele":"C","geneId":"ENSG00000223972","geneName":"DDX11L1","geneNameSource":"HGNC","featureId":"ENST00000518655","featureType":"Transcript","featureBiotype":"transcribed_unprocessed_pseudogene","featureStrand":"1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1631],"canonical":false,"variantToTranscriptDistance":1873},{"allele":"C","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000438504","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":true,"variantToTranscriptDistance":4362},{"allele":"C","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000423562","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":false,"variantToTranscriptDistance":4362},{"allele":"C","featureId":"ENSR00000668495","featureType":"RegulatoryFeature","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1566],"canonical":false,"variantToTranscriptDistance":-1}],"-":[{"allele":"-","geneId":"ENSG00000223972","geneName":"DDX11L1","geneNameSource":"HGNC","featureId":"ENST00000456328","featureType":"Transcript","featureBiotype":"processed_transcript","featureStrand":"1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1631],"canonical":true,"variantToTranscriptDistance":1868},{"allele":"-","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000488147","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":false,"variantToTranscriptDistance":4403},{"allele":"-","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000541675","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":false,"variantToTranscriptDistance":4362},{"allele":"-","geneId":"ENSG00000223972","geneName":"DDX11L1","geneNameSource":"HGNC","featureId":"ENST00000450305","featureType":"Transcript","featureBiotype":"transcribed_unprocessed_pseudogene","featureStrand":"1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1631],"canonical":false,"variantToTranscriptDistance":2009},{"allele":"-","geneId":"ENSG00000223972","geneName":"DDX11L1","geneNameSource":"HGNC","featureId":"ENST00000515242","featureType":"Transcript","featureBiotype":"transcribed_unprocessed_pseudogene","featureStrand":"1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1631],"canonical":false,"variantToTranscriptDistance":1871},{"allele":"-","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000538476","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":false,"variantToTranscriptDistance":4410},{"allele":"-","geneId":"ENSG00000223972","geneName":"DDX11L1","geneNameSource":"HGNC","featureId":"ENST00000518655","featureType":"Transcript","featureBiotype":"transcribed_unprocessed_pseudogene","featureStrand":"1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1631],"canonical":false,"variantToTranscriptDistance":1873},{"allele":"-","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000438504","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":true,"variantToTranscriptDistance":4362},{"allele":"-","geneId":"ENSG00000227232","geneName":"WASH7P","geneNameSource":"HGNC","featureId":"ENST00000423562","featureType":"Transcript","featureBiotype":"unprocessed_pseudogene","featureStrand":"-1","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1632],"canonical":false,"variantToTranscriptDistance":4362},{"allele":"-","featureId":"ENSR00000668495","featureType":"RegulatoryFeature","cDnaPosition":-1,"cdsPosition":-1,"proteinPosition":-1,"consequenceTypes":[1566],"canonical":false,"variantToTranscriptDistance":-1}]},"frequencies":{"maf1000G":0.6,"maf1000GAfrican":0.5,"maf1000GAmerican":0.4,"maf1000GAsian":0.3,"maf1000GEuropean":0.2,"mafNhlbiEspAfricanAmerican":0.1,"mafNhlbiEspEuropeanAmerican":0.2},"proteinSubstitutionScores":{"polyphenScore":-1.0,"siftScore":-1.0},"regulatoryEffect":{"motifPosition":0,"motifScoreChange":0.0,"highInformationPosition":false}}
        ;
    return data 
    }
};

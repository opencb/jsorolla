function VariantWidget(args) {

    _.extend(this, Backbone.Events);

    this.id = Utils.genId("VariantWidget");

    //set default args
    this.border = true;
    this.autoRender = true;
    this.width;
    this.height = '100%';
    this.closable = true;
    this.url = "";
    this.target;
    this.filters = {
        segregation: true,
        maf: true,
        effect: true,
        region: true,
        gene: true
    };


    _.extend(this.filters, args.filters);
    delete args.filters;

    //set instantiation args, must be last
    _.extend(this, args);

    this.panelId = "VariantWidget_" + this.job.id;

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
}

VariantWidget.prototype = {
    render: function (target) {
        var _this = this;
        this.target = (target) ? target : this.target;

        /* main panel */
        this.panel = this._createPanel(this.target);

        this.genomeViewerPanel = this._createGenomeViewer();

        this.variantEffectWidget = new VariantEffectPanelWidget({
            gridConfig: {
                flex: 1,
                layout: {
                    align: 'stretch'
                }
            },
            handlers: {
                "load:finish": function (e) {
                    _this.grid.setLoading(false);
                }
            }
        });

        this.toolsPanel = Ext.create("Ext.tab.Panel", {
            title: 'Tools',
            border: 0,
            layout: 'fit',
            margin: '10 0 0 0',
            collapsed: true,
            collapsible: true,
            animCollapse: false,
            collapseDirection: Ext.Component.DIRECTION_BOTTOM,
            titleCollapse: true,
            overlapHeader: true
        });

        this.rendered = true;

    },
    draw: function () {
        var _this = this;
        _this.target.add(this.panel);
        _this.target.setActiveTab(this.panel);


        OpencgaManager.variantInfoMongo({
            accountId: $.cookie("bioinfo_account"),
            sessionId: $.cookie("bioinfo_sid"),
            filename: this.dbName,
            jobId: this.job.id,
            success: function (data, textStatus, jqXHR) {
                _this.variantInfo = data.response.result[0];
                _this._draw();
            }
        });
    },
    _draw: function () {
        this.optValues = Ext.create('Ext.data.Store', {
            fields: ['value', 'name'],
            data: [
                {"value": "<", "name": "<"},
                {"value": "<=", "name": "<="},
                {"value": ">", "name": ">"},
                {"value": ">=", "name": ">="},
                {"value": "=", "name": "="},
                {"value": "!=", "name": "!="}
            ]
        });

        //        this.summaryPanel = this._createSummaryPanel(this.variantInfo);
        //this.panel.add(this.summaryPanel);

        this.variantPanel = this._createVariantPanel();
        this.panel.add(this.variantPanel);

        this.toolsPanel.add(this.variantEffectWidget.getPanel());
        this.toolsPanel.add(this.genomeViewerPanel);

        this.toolsPanel.setActiveTab(this.variantEffectWidget.getPanel());
        this._updateInfo();
    },
    _createPanel: function (target) {
        var panel = Ext.create('Ext.panel.Panel', {
            title: this.title,
            id: this.panelId,
            width: '100%',
            height: this.height,
            border: this.border,
            layout: 'hbox',
            closable: this.closable,
            items: []
        });
        return panel;
    },
    _createVariantPanel: function () {

        this.form = this._createForm();
        this.grid = this._createGrid();

        var panel = Ext.create('Ext.panel.Panel', {
            width: '100%',
            height: '100%',
            bodyPadding: 20,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                this.form,
                {
                    xtype: 'container',
                    flex: 1,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    defaults: {
                        flex: 1,
                        border: false
                    },
                    items: [
                        this.grid,
                        this.toolsPanel
                    ]
                }
            ]
        });

        return panel;
    },
    _updateInfo: function () {
        var _this = this;
        _this.panel.setLoading(true);

        if (_this.sampleNames != null) {

            _this.grid.getStore().removeAll();

            for (var i = 0; i < _this.sampleNames.length; i++) {
                _this._removeSampleColumn(_this.sampleNames[i]);
            }

            _this.grid.reconfigure(null, _this.columnsGrid);
        }

        _this.sampleNames = [];

        var sampleTableElems = [];
        sampleTableElems.push({html: ''});
        sampleTableElems.push({html: '0/0'});
        sampleTableElems.push({html: '0/1'});
        sampleTableElems.push({html: '1/1'});


        for (var i in this.variantInfo.samples) {
            var sName = this.variantInfo.samples[i];
            _this.sampleNames.push(sName);
            _this._addSampleColumn(sName);

            sampleTableElems.push({
                html: sName + ":",
                margin: '0 15 0 0'
            });

            sampleTableElems.push({
                xtype: 'checkbox',
                name: "sampleGT_" + sName,
                inputValue: '0/0,0|0'
            });
            sampleTableElems.push({
                xtype: 'checkbox',
                name: "sampleGT_" + sName,
                inputValue: '0/1,1/0, 0|1,1|0'
            });
            sampleTableElems.push({
                xtype: 'checkbox',
                name: "sampleGT_" + sName,
                inputValue: '1/1,1|1'
            });
        }

        _this.grid.reconfigure(null, _this.columnsGrid);

        if (_this.filters.effect) {
            var ctForm = Ext.getCmp(this.id + "conseq_type_panel");
            ctForm.removeAll();
            ctForm.add([
                {
                    xtype: 'tbtext', text: '<span class="info">Select one or multiple conseq. type</span>'
                },
                _this._createDynCombobox("conseq_type", "Consequence Type", this.variantInfo.consequenceTypes, "non_synonymous_codon")
            ]);
        }

        if (_this.filters.segregation) {
            var samples = Ext.getCmp(this.id + "samples_form_panel");
            samples.removeAll();
            samples.add(sampleTableElems);
        }
        _this.panel.setLoading(false);
    },
    _addSampleColumn: function (sampleName) {

        var _this = this;

        for (var i = 0; i < _this.attributes.length; i++) {
            if (_this.attributes[i].name == sampleName) {
                return false;
            }
        }

        _this.attributes.push({
            "name": sampleName,
            "type": "string"
        });

        for (var i = 0; i < _this.columnsGrid.length; i++) {
            var col = _this.columnsGrid[i];

            if (col['text'] == "Samples") {
                col["columns"].push({
                    "text": sampleName,
                    "dataIndex": sampleName,
                    "flex": 1,
                    "sortable": false
                });
            }
        }
        _this.st.setFields(_this.attributes);
    },
    _removeSampleColumn: function (sampleName) {

        var _this = this;
        for (var i = 0; i < _this.attributes.length; i++) {
            if (_this.attributes[i].name == sampleName) {
                _this.attributes.splice(i, 1);
                _this.model.setFields(_this.attributes);
            }
        }

        for (var i = 0; i < _this.columnsGrid.length; i++) {
            var col = _this.columnsGrid[i];
            if (col['text'] == "Samples") {
                var colSamples = col["columns"];
                for (var j = 0; j < colSamples.length; j++) {
                    if (colSamples[j].text == sampleName) {
                        colSamples.splice(j, 1);
                    }
                }
            }
        }
    },
    _createSummaryPanel: function (data) {
        var _this = this;

        var cts = [];
        var ss = [];

        for (var key in data.consequenceTypes) {
            cts.push({
                name: Utils.formatText(key, "_"),
                count: data.consequenceTypes[key]
            });
        }

        for (var key in data.sampleStats) {
            ss.push({
                sampleName: key,
                homozygotesNumber: data.sampleStats[key].homozygotesNumber,
                mendelianErrors: data.sampleStats[key].mendelianErrors,
                missingGenotypes: data.sampleStats[key].missingGenotypes
            });
        }

        _this.ctStore = Ext.create('Ext.data.Store', {
            fields: ['name', 'count'],
            data: cts

        });

        _this.ssStore = Ext.create('Ext.data.Store', {
            fields: ['sampleName', 'homozygotesNumber', 'mendelianErrors', 'missingGenotypes'],
            data: ss
        });

        //var chartCT = Ext.create('Ext.chart.Chart', {
        //xtype: 'chart',
        //width: 700,
        //height: 700,
        //store: _this.ctStore,
        //animate: true,
        //shadow: true,
        //legend: {
        //position: 'right'
        //},
        //theme: 'Base:gradients',
        //insetPadding: 60,
        //series: [
        //{
        //type: 'pie',
        //field: 'count',
        //showInLegend: true,
        //tips: {
        //trackMouse: true,
        //width: 200,
        //height: 28,
        //renderer: function (storeItem, item) {
        ////calculate percentage.
        //var total = 0;
        //_this.ctStore.each(function (rec) {
        //total += rec.get('count');
        //});
        //var name = Utils.formatText(storeItem.get('name'), "_");
        //this.setTitle(name + ': ' + Math.round(storeItem.get('count') / total * 100) + '%');
        //}
        //},
        //highlight: {
        //segment: {
        //margin: 20
        //}
        //},

        //label: {
        //field: 'name',
        //display: 'rotate',
        //contrast: true,
        //font: '10px Arial'
        //}

        //}
        //]
        //});
        //var chartSS = Ext.create('Ext.chart.Chart', {
        //xtype: 'chart',
        //width: 700,
        //height: 500,
        //animate: true,
        //shadow: true,
        //store: _this.ssStore,
        //legend: {
        //position: 'right'
        //},
        //axes: [
        //{
        //type: 'Numeric',
        //position: 'bottom',
        //fields: ['homozygotesNumber', 'mendelianErrors', 'missingGenotypes'],
        //title: false,
        //grid: true,
        //label: {
        //renderer: function (v) {
        //return String(v).replace(/000000$/, 'M');
        //}
        //},
        //roundToDecimal: false
        //},
        //{
        //type: 'Category',
        //position: 'left',
        //fields: ['sampleName'],
        //title: false
        //}
        //],
        //series: [
        //{
        //type: 'bar',
        //axis: 'bottom',
        //gutter: 80,
        //xField: 'sampleName',
        //yField: ['homozygotesNumber', 'mendelianErrors', 'missingGenotypes'],
        //tips: {
        //trackMouse: true,
        //width: 100,
        //height: 28,
        //renderer: function (storeItem, item) {
        //this.setTitle(String(item.value[1]));
        //}
        //}
        //}
        //]
        //});

        var itemTplSamples = new Ext.XTemplate(
            '<table cellspacing="0" style="max-width:400px;border-collapse: collapse;border:1px solid #ccc;"><thead>',
            '<th style="min-width:50px;border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;">Samples</th>',
            '</thead><tbody>',
            '<tpl for="samples">',
            '<tr style="border-collapse: collapse;border:1px solid #ccc;">',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;color:steelblue;font-weight:bold;white-space: nowrap;">{.}</td>',
            '</tr>',
            '</tpl>',
            '</tbody></table>'
        );

        var globalStats = new Ext.XTemplate(
            '<table cellspacing="0" style="max-width:400px;border-collapse: collapse;border:1px solid #ccc;"><thead>',
            '<th colspan="2" style="min-width:50px;border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;">Global Stats</th>',
            '</thead><tbody>',

            '<tr style="border-collapse: collapse;border:1px solid #ccc;">',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;color:steelblue;font-weight:bold;white-space: nowrap;">Num variants</td>',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;">{variantsCount}</td>',
            '</tr>',

            '<tr style="border-collapse: collapse;border:1px solid #ccc;">',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;color:steelblue;font-weight:bold;white-space: nowrap;">Num samples</td>',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;">{samplesCount}</td>',
            '</tr>',

            '<tr style="border-collapse: collapse;border:1px solid #ccc;">',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;color:steelblue;font-weight:bold;white-space: nowrap;">Num indels</td>',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;">{indelCount}</td>',
            '</tr>',

            //'<tr style="border-collapse: collapse;border:1px solid #ccc;">',
            //'<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;color:steelblue;font-weight:bold;white-space: nowrap;">Num snps</td>',
            //'<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;">{snpCount}</td>',
            //'</tr>',

            '<tr style="border-collapse: collapse;border:1px solid #ccc;">',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;color:steelblue;font-weight:bold;white-space: nowrap;">Num biallelic</td>',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;">{biallelicsCount}</td>',
            '</tr>',

            '<tr style="border-collapse: collapse;border:1px solid #ccc;">',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;color:steelblue;font-weight:bold;white-space: nowrap;">Num multiallelic</td>',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;">{multiallelicsCount}</td>',
            '</tr>',

            '<tr style="border-collapse: collapse;border:1px solid #ccc;">',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;color:steelblue;font-weight:bold;white-space: nowrap;">Num transitions</td>',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;">{transitionsCount}</td>',
            '</tr>',

            '<tr style="border-collapse: collapse;border:1px solid #ccc;">',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;color:steelblue;font-weight:bold;white-space: nowrap;">Num transversions</td>',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;">{transversionsCount}</td>',
            '</tr>',

            '<tr style="border-collapse: collapse;border:1px solid #ccc;">',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;color:steelblue;font-weight:bold;white-space: nowrap;">% PASS</td>',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;">{[this.pass(values)]}%</td>',
            '</tr>',

            '<tr style="border-collapse: collapse;border:1px solid #ccc;">',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;color:steelblue;font-weight:bold;white-space: nowrap;">Ti/Tv Ratio</td>',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;">{[this.titv(values)]}</td>',
            '</tr>',

            '<tr style="border-collapse: collapse;border:1px solid #ccc;">',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;color:steelblue;font-weight:bold;white-space: nowrap;">Avg. Quality</td>',
            '<td style="border-collapse: collapse;border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;">{[this.avgq(values)]}</td>',
            '</tr>',

            {

                pass: function (values) {
                    var res = values.passCount / values.variantsCount;
                    return res.toFixed(2);
                },
                titv: function (values) {
                    var res = values.transitionsCount / values.transversionsCount;
                    return res.toFixed(2);
                },
                avgq: function (values) {
                    var res = values.accumulatedQuality / values.variantsCount;
                    return res.toFixed(2);
                }
            }
        );


        var items = [
            {
                xtype: 'container',
                layout: 'vbox',
                flex: 1,
                items: [
                    {
                        xtype: 'box',
                        flex: 1,
                        margin: 10,
                        data: data,
                        tpl: itemTplSamples
                    },
                    {
                        xtype: 'box',
                        flex: 1,
                        margin: 10,
                        data: data.globalStats,
                        tpl: globalStats
                    }
                ]
            },
            {
                xtype: 'container',
                layout: 'vbox',
                flex: 3,
                items: [
                    {
                        xtype: 'box',
                        width: 700,
                        html: '<div style="border:1px solid #ccc;padding: 5px;background-color: whiteSmoke;font-weight: bold;">Consequence type</div>'

                    }
                    //chartCT
                ]
            }
        ];


        var panel = Ext.create('Ext.panel.Panel', {
            width: '100%',
            height: '100%',
            border: 0,
            layout: 'hbox',
            bodyPadding: 60,
            autoScroll: true,
            cls: 'ocb-border-top-lightgrey',
            items: items
        });

        return panel;
    },
    _createGenomeViewer: function () {
        var _this = this;

        var rendered = true;

        var gvpanel = Ext.create('Ext.panel.Panel', {
            title: 'Genome Viewer',
            flex: 8,
            height: '100%',
            border: 1,
            html: '<div id="' + this.id + 'genomeViewer" style="width:1200px;height:300px;position:relative;"></div>',
            listeners: {
                afterlayout: {
                    fn: function () {
                        //prevent fires multiple times
                        if (!rendered) {
                            return;
                        }
                        rendered = false;
                        var w = this.getWidth();
                        console.log(w);
                        $('#' + _this.id + 'genomeViewer').width(w);

                        var region = new Region({
                            chromosome: "13",
                            start: 32889611,
                            end: 32889611
                        });

                        var selection = _this.grid.getView().getSelectionModel().getSelection();
                        if (selection.length > 0) {
                            row = selection[0];
                            region = new Region({
                                chromosome: row.get("chromosome"),
                                start: row.get("position"),
                                end: row.get("position")
                            });

                        }

                        var genomeViewer = new GenomeViewer({
                            sidePanel: false,
                            targetId: _this.id + 'genomeViewer',
                            autoRender: true,
                            border: false,
                            resizable: true,
                            region: region,
                            trackListTitle: '',
                            drawNavigationBar: true,
                            drawKaryotypePanel: false,
                            drawChromosomePanel: false,
                            drawRegionOverviewPanel: true,
                            overviewZoomMultiplier: 50
                        }); //the div must exist

                        genomeViewer.draw();

                        this.sequence = new SequenceTrack({
                            targetId: null,
                            id: 1,
                            title: 'Sequence',
                            height: 30,
                            visibleRegionSize: 200,
                            histogramZoom: 20,
                            transcriptZoom: 50,


                            renderer: new SequenceRenderer(),

                            dataAdapter: new SequenceAdapter({
                                category: "genomic",
                                subCategory: "region",
                                resource: "sequence",
                                species: genomeViewer.species
                            })
                        });

                        this.gene = new GeneTrack({
                            targetId: null,
                            id: 2,
                            title: 'Gene',
                            height: 140,
                            minHistogramRegionSize: 20000000,
                            maxLabelRegionSize: 10000000,
                            minTranscriptRegionSize: 200000,
                            //featureTypes: FEATURE_TYPES,

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
                                    chunkSize: 50000
                                },
                                filters: {},
                                options: {},
                                featureConfig: FEATURE_CONFIG.gene
                            })
                        });

                        this.snp = new FeatureTrack({
                            targetId: null,
                            id: 4,
                            title: 'SNP',
                            minHistogramRegionSize: 12000,
                            maxLabelRegionSize: 3000,
                            height: 100,
                            //featureTypes: FEATURE_TYPES,

                            //renderer: new FeatureRenderer('snp'),
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
                                },
                                filters: {},
                                options: {},
                                featureConfig: FEATURE_CONFIG.snp
                            })
                        });


                        var renderer = new FeatureRenderer(FEATURE_TYPES.gene);
                        renderer.on({
                            'feature:click': function (event) {
                            }
                        });


                        var gene = new FeatureTrack({
                            targetId: null,
                            id: 2,
                            minHistogramRegionSize: 20000000,
                            maxLabelRegionSize: 10000000,
                            height: 100,

                            renderer: renderer,

                            dataAdapter: new CellBaseAdapter({
                                category: "genomic",
                                subCategory: "region",
                                resource: "gene",
                                params: {
                                    exclude: 'transcripts'
                                },
                                species: genomeViewer.species,
                                cacheConfig: {
                                    chunkSize: 100000
                                }
                            })
                        });
                        genomeViewer.addOverviewTrack(gene);


                        genomeViewer.addTrack(this.sequence);
                        genomeViewer.addTrack(this.gene);
                        genomeViewer.addTrack(this.snp);

                        _this.gv = genomeViewer;
                    }
                }
            }
        });
        return gvpanel;
    },
    _createForm: function () {

        var _this = this;

        var accordion = Ext.create('Ext.form.Panel', {
            border: 1,
            height: "100%",
            title: "Filters",
            width: 220,
            margin: '0 20 0 0',
            layout: {
                type: 'accordion',
                titleCollapse: true,
                fill: false,
                multi: true
            },
            autoScroll: true,
            tbar: {
                width: '100%',
                items: [
                    {
                        xtype: 'button',
                        width: 55,
                        text: '<span style="font-weight:bold">Reload</span>',
                        tooltip: 'Reload',
                        handler: function () {
                            Ext.example.msg('Reload', 'Sucessfully')
                            _this._reloadForm();
                        }
                    } ,
                    {
                        xtype: 'button',
                        flex: 46,
                        text: '<span style="font-weight:bold">Clear</span>',
                        tooltip: 'Clear',
                        handler: function () {
                            Ext.example.msg('Clear', 'Sucessfully');
                            _this._clearForm();
                            Ext.getCmp(_this.id + "region_list").setValue("");
                            Ext.getCmp(_this.id + "genes").setValue("");
                        }
                    },
                    '->',
                    {
                        xtype: 'button',
                        flex: 54,
                        text: '<span style="font-weight:bold">Search</span>',
                        tooltip: 'Search',
                        handler: function () {

                            if (_this._checkForm()) {
                                _this._getResult();
                            }
                        }
                    }
                ]
            }
        });

        if (_this.filters.segregation) {
            var segregation = this._getSegregation();
            var sampleContainer = Ext.create('Ext.form.FieldContainer', {
                width: '100%',
                border: false,
                layout: {
                    type: 'table',
                    columns: 4
                },
                defaults: {
                    border: false,
                    padding: 4
                },
                id: this.id + "samples_form_panel"
            });
            segregation.insert(0, sampleContainer);
            accordion.add(segregation);
        }

        if (_this.filters.maf) {
            var controls = this._getControls();
            accordion.add(controls);
        }

        if (_this.filters.effect) {
            var effect = this._getConsequenceType();
            accordion.add(effect);
        }

        if (_this.filters.region) {
            var region = this._getRegionList();
            accordion.add(region);
        }

        if (_this.filters.gene) {
            var genes = this._getGenes();
            accordion.add(genes);
        }
        return accordion;
    },
    _createGrid: function () {

        var _this = this;

        var xtmplPoly = new Ext.XTemplate(
            '{[this.parseEffect(values)]}',
            {
                parseEffect: function (value) {

                    if (value.polyphen_score == 0 && value.polyphen_effect == 0) {
                        return ".";
                    }

                    var score = value.polyphen_score;
                    var effect = "";
                    switch (value.polyphen_effect) {
                        case 0:
                            effect = "probably damaging";
                            break;
                        case 1:
                            effect = "possibly damaging";
                            break;
                        case 2:
                            effect = "benign";
                            break;
                        case 3:
                            effect = "unknown";
                            break;
                        default:
                            return ".";
                    }
                    return(score + " - (" + effect + ")");
                }
            }
        );
        var xtmplSift = new Ext.XTemplate(
            '{[this.parseEffect(values)]}',
            {
                parseEffect: function (value) {
                    if (value.sift_score == 0 && value.sift_effect == 0) {
                        return ".";
                    }

                    var score = value.sift_score;
                    var effect = "";
                    switch (value.sift_effect) {
                        case 0:
                            effect = "tolerated";
                            break;
                        case 1:
                            effect = "deleterious";
                            break;
                        default:
                            return ".";
                    }
                    return(score + " - (" + effect + ")");
                }
            }
        );

        parseMafControl = function (control) {
            var maf = control.maf;
            var res = maf.toFixed(3);
            if (control.allele != "") {
                res = res + " (" + control.allele + ")";
            }
            return res;
        };

        _this.columnsGrid = [
            {
                text: "Variant",
                dataIndex: 'chromosome',
                flex: 1,
                xtype: "templatecolumn",
                tpl: "{chromosome}:{position}"
            },
            {
                text: "Alleles",
                flex: 0.5,
                xtype: "templatecolumn",
                tpl: "{ref}>{alt}",
                sortable: false
            },
            {
                text: "Gene",
                dataIndex: 'genes',
                flex: 1,
                sortable: false
            },
            {
                text: 'Samples',
                flex: 1,
                sortable: false,
                columns: []
            },
            {
                text: "SNP Id",
                dataIndex: 'snpid',
                flex: 1,
                sortable: true
            },
            {
                flex: 1,
                text: "Controls (MAF)",
                defaults: {
                    width: 70
                },
                columns: [
                    {
                        text: "1000G",
                        renderer: function (val, meta, record) {
                            if (record.data.controls["1000G"]) {
                                return parseMafControl(record.data.controls["1000G"]);
                            } else {
                                return ".";
                            }
                        }
                    },
                    {
                        text: "1000G-AFR",
                        renderer: function (val, meta, record) {
                            if (record.data.controls["1000G-AFR"]) {
                                return parseMafControl(record.data.controls["1000G-AFR"]);
                            } else {
                                return ".";
                            }
                        }
                    },
                    {
                        text: "1000G-ASI",
                        renderer: function (val, meta, record) {
                            if (record.data.controls["1000G-ASI"]) {
                                return parseMafControl(record.data.controls["1000G-ASI"]);

                            } else {
                                return ".";
                            }
                        }
                    },
                    {
                        text: "1000G-AME",
                        renderer: function (val, meta, record) {
                            if (record.data.controls["1000G-AME"]) {
                                return parseMafControl(record.data.controls["1000G-AME"]);
                            } else {
                                return ".";
                            }
                        }
                    },
                    {
                        text: "1000G-EUR",
                        renderer: function (val, meta, record) {
                            if (record.data.controls["1000G-EUR"]) {
                                return parseMafControl(record.data.controls["1000G-EUR"]);
                            } else {
                                return ".";
                            }
                        }
                    },
                    {
                        text: "EVS",
                        renderer: function (val, meta, record) {
                            if (record.data.controls["EVS"]) {
                                return parseMafControl(record.data.controls["EVS"]);
                                //var maf = record.data.controls["EVS"].maf;
                                //return maf.toFixed(3) + " (" + record.data.controls["EVS"].allele + ")";
                            } else {
                                return ".";
                            }
                        }
                    }
                ]
            },

            {
                text: "Consq. Type",
                dataIndex: "consequence_types",
                flex: 1,
                sortable: false
            },
            {
                text: 'Polyphen',
                flex: 1,
                dataIndex: 'polyphen_score',
                xtype: 'templatecolumn',
                tpl: xtmplPoly,
                sortable: false
            },
            {
                text: 'SIFT',
                flex: 1,
                dataIndex: 'sift_score',
                xtype: "templatecolumn",
                tpl: xtmplSift,
                sortable: false
            },
            {
                text: 'Phenotype',
                dataIndex: 'phenotype',
                sortable: false
            },
            {
                text: "Is indel?",
                flex: 1,
                xtype: 'booleancolumn',
                trueText: 'Yes',
                falseText: 'No',
                dataIndex: 'stats_is_indel',
                sortable: true,
                hidden: true
            }
        ];
        _this.attributes = [
            {name: "chromosome", type: "string"},
            {name: "position", type: "int"},
            {name: "alt", type: "string"},
            {name: "ref", type: "string"},
            {name: 'stats_id_snp', type: 'string'},
            {name: 'stats_maf', type: 'number'},
            {name: 'stats_mgf', type: 'number'},
            {name: 'stats_miss_gt', type: 'int'},
            {name: 'stats_is_indel', type: 'boolean'},
            {name: 'gene_name', type: 'string'},
            {name: 'consequence_types', type: 'string'},
            {name: "controls", type: 'auto'},
            {name: "phenotype", type: "string"},
            {name: "polyphen_score", type: 'number'},
            {name: "polyphen_effect", type: 'int'},
            {name: "sift_score", type: 'number'},
            {name: "sift_effect", type: 'int'}
        ];
        _this.model = Ext.define('Variant', {
            extend: 'Ext.data.Model',
            fields: _this.attributes
        });

        _this.st = Ext.create('Ext.data.Store', {
            pageSize: 25,
            model: _this.model,
            data: [],
            remoteSort: true,
            storeId: 'gridStore',
            sorters: [
                {
                    property: 'chromosome',
                    direction: 'ASC'
                }
            ],
            proxy: {
                url: _this.url,
                type: 'ajax',
                reader: {
                    root: "response.result",
                    totalProperty: "response.numResults"
                },
                extraParams: {
                    myParam: "hola"
                },
                actionMethods: {create: 'GET', read: 'GET', update: 'GET', destroy: 'GET'}
            },
            listeners: {
                load: function (store, records, successful, operation, eOpts) {

                    _this.st.suspendEvents();
                    var aux;

                    for (var i = 0; i < records.length; i++) {
                        var v = records[i];
                        for (var key in v.data.sampleGenotypes) {

                            aux = v.data.sampleGenotypes[key];
                            aux = aux.replace(/-1/g, ".");
                            aux = aux.replace("|", "/");
                            v.set(key, aux);
                        }

                        v.set("snpid", v.data.snpid);
                        v.set("genes", v.data.genes.join(","));

                        v.commit();
                    }

                    _this._getPhenotypes(records);
                    _this.st.resumeEvents();
                    _this.st.fireEvent('refresh');
                },
                beforeload: function (store, operation, eOpts) {
                    _this.variantEffectWidget.clear(true);
                }
            }

        });
        _this.exportStore = Ext.create('Ext.data.Store', {
            model: _this.model,
            data: [],
            autoLoad: false,
            remoteSort: true,
            storeId: 'exportStore',
            sorters: [
                {
                    property: 'chromosome',
                    direction: 'ASC'
                }
            ],
            proxy: {
                model: _this.model,
                type: 'ajax',
                url: _this.url,
                reader: {
                    root: "response.result",
                    totalProperty: "response.numResults"
                },
                listeners: {
                    exception: function (proxy, response, operation, eOpts) {
                        Ext.MessageBox.show({
                            title: 'REMOTE EXCEPTION',
                            msg: operation.getError(),
                            icon: Ext.MessageBox.ERROR,
                            buttons: Ext.Msg.OK
                        });
                    },
                    success: function (response) {
                        console.log("Spiffing, everything worked");
                        console.log(response.success);
                        console.log(response.result);
                    },
                    failure: function (response) {
                        console.log(response);
                        Ext.Msg.alert('Error', 'Please try again.', Ext.emptyFn);
                    }
                }
            },
            listeners: {
                load: function (store, records, successful, operation, eOpts) {

                    _this.st.suspendEvents();
                    var aux;

                    for (var i = 0; i < records.length; i++) {
                        var v = records[i];
                        for (var key in v.data.sampleGenotypes) {

                            aux = v.data.sampleGenotypes[key];
                            aux = aux.replace(/-1/g, ".");
                            aux = aux.replace("|", "/");
                            v.set(key, aux);
                        }

                        v.set("snpid", v.data.snpid);
                        v.set("genes", v.data.genes.join(","));

                        v.commit();
                    }

                    _this.st.resumeEvents();
                    _this.st.fireEvent('refresh');
                }
            }

        });

        var paging = Ext.create('Ext.PagingToolbar', {
            store: _this.st,
            id: _this.id + "_pagingToolbar",
            pageSize: 25,
            displayInfo: true,
            displayMsg: 'Variants {0} - {1} of {2}',
            emptyMsg: "No variants to display"
        });

        paging.add({
                xtype: 'button',
                text: 'Export data...',
                handler: function () {

                    if (_this.st.getCount() == 0) {
                        Utils.msg('ERROR', 'You must apply some filters before or the result set is empty!!');
                        return;
                    }

                    if (!Ext.getCmp(_this.id + "exportWindow")) {
                        var cbgItems = [];
                        var attrList = _this._getColumnNames();

                        cbgItems.push({
                            boxLabel: attrList[0],
                            name: 'attr',
                            inputValue: attrList[0],
                            checked: true,
                            disabled: true
                        });

                        for (var i = 1; i < attrList.length; i++) {
                            cbgItems.push({
                                boxLabel: attrList[i],
                                name: 'attr',
                                inputValue: attrList[i],
                                checked: true
                            });
                        }
                        var progress = Ext.create('Ext.ProgressBar', {
                            text: 'Progress...',
                            border: 1,
                            flex: 1,
                            margin: '0 10 0 0',
                            id: _this.id + "_progressBarExport"
                        });

                        Ext.create('Ext.window.Window', {
                            id: _this.id + "exportWindow",
                            title: "Export attributes",
                            height: 250,
                            maxHeight: 250,
                            width: 400,
                            autoScroll: true,
                            layout: "vbox",
                            modal: true,
                            items: [
                                {
                                    xtype: 'checkboxgroup',
                                    id: _this.id + "cbgAttributes",
                                    layout: 'vbox',
                                    items: cbgItems
                                }
                            ],
                            buttons: [
                                progress,
                                {
                                    xtype: 'textfield',
                                    id: _this.id + "fileName",
                                    emptyText: "enter file name",
                                    flex: 1
                                },
                                {
                                    text: 'Download',
                                    href: "none",
                                    id: _this.id + "_downloadExport",
                                    handler: function () {
                                        Ext.getCmp(_this.id + "_progressBarExport").updateProgress(0.1, "Requesting data");

                                        this.disable();
                                        var fileName = Ext.getCmp(_this.id + "fileName").getValue();
                                        if (fileName == "") {
                                            fileName = "variants";
                                        }
                                        var columns = Ext.getCmp(_this.id + "cbgAttributes").getChecked();

                                        var content = _this._exportToTab(columns);

                                        this.getEl().set({
                                            href: 'data:text/csv,' + encodeURIComponent(content),
                                            download: fileName + ".csv"
                                        });


                                        Ext.getCmp(_this.id + "_progressBarExport").updateProgress(1, "Downloaded");
                                        Ext.getCmp(_this.id + "fileName").reset();

                                    }
                                }
                            ]
                        }).show();
                    } else {
                        Ext.getCmp(_this.id + "exportWindow").show();
                    }
                    Ext.getCmp(_this.id + "_progressBarExport").updateProgress(0, "Progress");
                    Ext.getCmp(_this.id + "_downloadExport").enable();
                }
            }
        );

        var grid = Ext.create('Ext.grid.Panel', {
                title: 'Variant Info',
                store: _this.st,
                loadMask: true,
                columns: this.columnsGrid,
                plugins: 'bufferedrenderer',
                loadMask: true,
                collapsible: true,
                titleCollapse: true,
                animCollapse: false,
                features: [
                    {ftype: 'summary'}
                ],
                viewConfig: {
                    emptyText: 'No records to display',
                    enableTextSelection: true
                },
                bbar: paging

            }
        );

        grid.getSelectionModel().on('selectionchange', function (sm, selectedRecord) {

            if (selectedRecord.length) {

                var row = selectedRecord[0].data;
                var chr = row.chromosome;
                var pos = row.position;
                var ref = row.ref;
                var alt = row.alt;

                var region = new Region({
                    chromosome: chr,
                    start: pos,
                    end: pos
                });


                _this.grid.setLoading(true);

                if (!_.isUndefined(_this.gv)) {
                    _this.gv.setRegion(region);
                }

                _this.variantEffectWidget.load(chr, pos, ref, alt);
            }
        });

        return grid;
    },
    _getSubColumn: function (colName) {
        var _this = this;
        var subCols = [];

        for (var i = 0; i < _this.columnsGrid.length; i++) {
            var col = _this.columnsGrid[i];

            if (col["text"] == colName && col["columns"] != null && col["columns"].length > 0) {
                var sub = col["columns"];
                for (var j = 0; j < sub.length; j++) {
                    var elem = sub[j];
                    subCols.push(elem["text"]);
                }
            }
        }
        return subCols;
    },
    _exportToTab: function (columns) {

        var _this = this;
        var colNames = [];

        var headerLine = "";
        for (var i = 0; i < columns.length; i++) {
            var col = columns[i];

            var subCols = _this._getSubColumn(col["boxLabel"]);
            if (subCols.length > 0) {
                for (var j = 0; j < subCols.length; j++) {
                    headerLine += subCols[j] + "\t";
                    colNames.push(subCols[j]);

                }
            } else {
                headerLine += col["boxLabel"] + "\t";
                colNames.push(col["boxLabel"]);
            }

            subCols.splice(0, subCols.length);

        }

        var output = "";
        output += "#" + headerLine + "\n";

        var lines = _this._getDataToExport();

        Ext.getCmp(_this.id + "_progressBarExport").updateProgress(0.6, "Preparing data");

        for (var i = 0; i < lines.length; i++) {
            var v = lines[i];
            for (var key in v.sampleGenotypes) {

                aux = v.sampleGenotypes[key];
                aux = aux.replace(/-1/g, ".");
                aux = aux.replace("|", "/");
                v[key] = aux;
                _this._getEffect(v);
                _this._getPolyphenSift(v);
            }

            v.genes = v.genes.join(",");
        }

        Ext.getCmp(_this.id + "_progressBarExport").updateProgress(0.9, "Creating File");


        for (var j = 0; j < lines.length; j++) {
            output += _this._processFileLine(lines[j], colNames);
            output += "\n";
        }

        return output;
    },
    _getDataToExport: function () {


        var _this = this;
        var totalData = _this.st.totalCount;

        var values = this.form.getForm().getValues();

        var formParams = {};
        for (var param in values) {
            if (formParams[param]) {
                var aux = [];
                aux.push(formParams[param]);
                aux.push(values[param]);
                formParams[param] = aux;
            } else {
                formParams[param] = values[param];
            }
        }
        formParams.limit = totalData;

        var data = [];
        $.ajax({
            url: _this.url,
            dataType: 'json',
            data: formParams,
            async: false,
            success: function (response, textStatus, jqXHR) {
                if (response.response && response.response.numResults > 0) {

                    data = response.response.result;
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('Error loading Effect');
                Ext.getCmp(_this.id + "_progressBarExport").updateProgress(0, "Error");
            }
        });
        return data;

    },
    _processFileLine: function (data, columns) {
        var line = "";
        for (var i = 0; i < columns.length; i++) {
            var col = columns[i];
            switch (col) {
                case "Variant":
                    line += data.chromosome + ":" + data.position;
                    break;
                case "Alleles":
                    line += data.ref + ">" + data.alt;
                    break;
                case "SNP Id":

                    line += this._getValueLine(data.stats_id_snp);
                    break;
                case "1000G":
                    if (data.controls["1000G"]) {
                        line += data.controls["1000G"].maf + "(" + data.controls["1000G"].allele + ")";

                    } else {
                        line += ".";
                    }
                    break;
                case "BIER":
                    if (data.controls["BIER"]) {

                        line += data.controls["BIER"].maf + "(" + data.controls["BIER"].allele + ")";
                    } else {
                        line += ".";
                    }
                    break;
                case "EVS":
                    if (data.controls["EVS"]) {
                        line += data.controls["EVS"].maf + "(" + data.controls["EVS"].allele + ")";
                    } else {
                        line += ".";
                    }
                    break;

                case "Gene":
                    line += this._getValueLine(data.genes)
                    break;
                case "Consq. Type":
                    line += this._getValueLine(data.consequence_types);
                    break;
                case "Polyphen":
                    //line += "-";
                    line += this._getValueLine(data.polyphen_score);
                    break;
                case "Phenotype":
                    //line += "-";
                    line += this._getValueLine(data.phenotype);
                    break;
                case "SIFT":
                    line += this._getValueLine(data.sift_score);
                    break;

                case "Is indel?":
                    line += this._getValueLine(data.stats_is_indel);
                    break;
                default:
                    line += this._getValueLine(data[col]);
            }
            line += "\t";
        }
        return line;
    },
    _getValueLine: function (value) {
        if (value == undefined || value == null) {
            return ".";
        } else if (value == "") {
            return ".";
        } else {
            return value;
        }
    },
    _getColumnNames: function () {
        var _this = this;

        var colNames = [];
        for (var i = 0; i < _this.columnsGrid.length; i++) {
            var col = _this.columnsGrid[i];
            colNames.push(col.text);
        }
        return colNames;
    },
    _getResult: function () {
        var _this = this;


        _this.variantEffectWidget.clear(true);
        // Clear store's extraParams
        _this.st.getProxy().extraParams = {};

        var values = this.form.getForm().getValues();

        console.log(values);

        var formParams = {};
        for (var param in values) {
            if (formParams[param]) {
                var aux = [];
                aux.push(formParams[param]);
                aux.push(values[param]);
                formParams[param] = aux;
            } else {
                formParams[param] = values[param];
            }
        }

        for (var param in formParams) {
            _this.st.getProxy().setExtraParam(param, formParams[param]);
        }
        _this.st.load();

    },
    _getRegionList: function () {
        var regionList = Ext.create('Ext.form.field.TextArea', {
            id: this.id + "region_list",
            name: "region_list",
            emptyText: '1:1-1000000,2:1-1000000',
            margin: '0 0 0 5',
            allowBlank: false,
            width: '100%'
        });

        return Ext.create('Ext.form.Panel', {
            bodyPadding: "5",
            margin: "0 0 5 0",
            buttonAlign: 'center',
            layout: 'vbox',
            title: "Region",
            border: false,
            collapsed: true,
            items: [
                {
                    xtype: 'tbtext', text: '<span class="info">Enter regions (comma separated)</span>'
                },
                regionList
            ]
        });
    },
    _getGenes: function () {
        var geneList = Ext.create('Ext.form.field.TextArea', {
            id: this.id + "genes",
            name: "genes",
            emptyText: 'BRCA2,PPL',
            margin: '0 0 0 5',
            allowBlank: false,
            width: '100%'
        });

        return Ext.create('Ext.form.Panel', {
            title: "Gene",
            bodyPadding: "5",
            border: false,
            buttonAlign: 'center',
            collapsed: true,
            layout: 'vbox',
            margin: "0 0 5 0",
            width: "100%",
            items: [
                {
                    xtype: 'tbtext', text: '<span class="info">Enter genes (comma separated)</span>'
                },
                geneList
            ]
        });
    },
    _getConsequenceType: function () {

        return Ext.create('Ext.form.Panel', {
            title: "Effect",
            collapsed: true,
            bodyPadding: "5",
            margin: "0 0 5 0",
            width: "100%",
            buttonAlign: 'center',
            layout: 'vbox',
            border: false,
            id: this.id + "conseq_type_panel",
            items: []
        });
    },
    _getSegregation: function () {

        var gt_text = Ext.create('Ext.form.field.Text', {
            id: this.id + "miss_gt",
            name: "miss_gt",
            margin: '0 0 0 5',
            allowBlank: false,
            //            width: 50,
            flex: 1,
            value: 0
        });

        var gt_opt = this._createCombobox("option_miss_gt", "", this.optValues, 4, 10, '0 0 0 5');
        gt_opt.width = 60;

        return Ext.create('Ext.form.Panel', {
            bodyPadding: "5",
            margin: "0 0 5 0",
            width: "100%",
            type: 'vbox',
            height: 300,
            border: false,
            title: 'Segregation',
            autoScroll: true,
            items: [
                {
                    xtype: 'fieldcontainer',
                    fieldLabel: '<span class="emph">Missings</span>',
                    labelWidth: 100,
                    labelAlign: 'top',
                    margin: "0 0 5 0",
                    layout: 'hbox',
                    border: false,
                    items: [gt_opt, gt_text]}
            ]
        });
    },
    _getControls: function () {
        return Ext.create('Ext.form.Panel', {
            bodyPadding: "5",
            margin: "0 0 5 0",
            width: "100%",
            buttonAlign: 'center',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            title: "MAF",
            collapsed: true,
            border: false,
            defaults: {
                labelWidth: 110,
                flex: 1
            },
            items: [
                {
                    xtype: 'textfield',
                    fieldLabel: '<span class="emph">1000G MAF <</span>',
                    name: 'maf_1000g_controls',
                    labelAlign: 'right'
                },
                {
                    xtype: 'textfield',
                    fieldLabel: '<span class="emph">EVS MAF   <</span>',
                    name: 'maf_evs_controls',
                    labelAlign: 'right'
                },
                {
                    xtype: 'tbtext',
                    margin: '20 0 5 0 ',
                    border: '0 0 1 0',
                    style: {
                        borderColor: 'black',
                        borderStyle: 'solid'
                    },
                    text: '<span>1000G Populations</span>'
                },
                {
                    xtype: 'textfield',
                    fieldLabel: '<span class="emph">African MAF <</span>',
                    name: 'maf_1000g_afr_controls',
                    labelAlign: 'right'
                },
                {
                    xtype: 'textfield',
                    fieldLabel: '<span class="emph">American MAF <</span>',
                    name: 'maf_1000g_ame_controls',
                    labelAlign: 'right'
                },
                {
                    xtype: 'textfield',
                    fieldLabel: '<span class="emph">Asian MAF <</span>',
                    name: 'maf_1000g_asi_controls',
                    labelAlign: 'right'
                },
                {
                    xtype: 'textfield',
                    fieldLabel: '<span class="emph">European MAF <</span>',
                    name: 'maf_1000g_eur_controls',
                    labelAlign: 'right'
                }
            ]
        });

    },
    _createCombobox: function (name, label, data, defaultValue, labelWidth, margin, width) {
        return Ext.create('Ext.form.field.ComboBox', {
            id: this.id + name,
            name: name,
            fieldLabel: label,
            store: data,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'value',
            value: data.getAt(defaultValue).get('value'),
            labelWidth: labelWidth,
            margin: margin,
            editable: false,
            allowBlank: false,
            width: width
        });
    },
    _createDynCombobox: function (name, label, data, defaultValue) {
        var dataAux = [];
        for (var key in data) {
            if (key != '.') {
                dataAux.push({
                    name: Utils.formatText(key, "_"),
                    value: key
                });
            }
        }
        var storeAux = Ext.create('Ext.data.Store', {
            fields: ['value', 'name'],
            data: dataAux
        });

        return Ext.create('Ext.form.field.ComboBox', {
            name: name,
            emptyText: label,
            store: storeAux,
            queryMode: 'local',
            displayField: 'name',
            valueField: 'value',
            multiSelect: true,
            delimiter: ",",
            editable: false,
            allowBlank: false,
            value: defaultValue,
            width: '100%'
        });
    },
    _clearForm: function () {
       _this.form.getForm().reset();
    },
    _reloadForm: function () {
        _this.form.getForm().reset();
    },
    _checkForm: function () {
        var reg = Ext.getCmp(this.id + "region_list");
        var genes = Ext.getCmp(this.id + "genes");

        return true;

    },
    _getEffect: function (record) {
        var req = record.chromosome + ":" + record.position + ":" + record.ref + ":" + record.alt[0];

        $.ajax({
            url: "http://ws.bioinfo.cipf.es/cellbase/rest/latest/hsa/genomic/variant/" + req + "/consequence_type?of=json",
            dataType: 'json',
            async: false,
            success: function (response, textStatus, jqXHR) {
                if (response) { // {&& response.response && response.response.length > 0) {
                    for (var j = 0; j < response.length; j++) {
                        var elem = response[j];
                        if (elem.aaPosition != -1 &&
                            elem.transcriptId != "" &&
                            elem.aminoacidChange.length >= 3
                            && record.transcriptId === undefined
                            && record.aaPos === undefined
                            && record.aaChange === undefined) {
                            record.transcript = elem.transcriptId;
                            record.aaPos = elem.aaPosition;
                            record.aaChange = elem.aminoacidChange;
                        }
                    }
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('Error loading Effect');
            }

        });
    },
    _getPolyphenSift: function (variant) {

        if (variant.aaPos != undefined && variant.aaPos >= 0) {
            var change = variant.aaChange.split("/")[1];
            var url = CELLBASE_HOST + "/v3/hsapiens/feature/transcript/" + variant.transcript + "/function_prediction?aaPosition=" + variant.aaPos + "&aaChange=" + change;
            $.ajax({
                url: url,
                dataType: 'json',
                async: false,
                success: function (response, textStatus, jqXHR) {
                    var res = response.response[0];
                    if (res.numResults > 0) {
                        if (res.result[0].aaPositions[variant.aaPos]) {

                            res = res.result[0].aaPositions[variant.aaPos][change];
                            if (res !== undefined) {
                                if (res.ps != null) {
                                    variant.polyphen_score = res.ps;
                                }
                                if (res.pe != null) {
                                    variant.polyphen_effect = res.pe;
                                }
                                if (res.ss != null) {
                                    variant.sift_score = res.ss;
                                }
                                if (res.se != null) {
                                    variant.sift_effect = res.se;
                                }
                            }
                        }
                    }

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Error loading PolyPhen/SIFT');
                }
            });
        }
    },
    _getPhenotypes: function (records) {

        var regs = [];
        for (var i = 0; i < records.length; i++) {

            var variant = records[i];

            var chr = variant.data.chromosome;
            var pos = variant.data.position;
            regs.push(chr + ":" + pos + "-" + pos);

        }
        if (regs.length > 0) {
            var url = CELLBASE_HOST + "/v3/hsapiens/genomic/region/" + regs.join(",") + "/phenotype?include=phenotype";

            $.ajax({
                url: url,
                dataType: 'json',
                async: false,
                success: function (response, textStatus, jqXHR) {

                    if (response != undefined && response.response.length > 0 && response.response.length == records.length) {
                        for (var i = 0; i < response.response.length; i++) {
                            var v = records[i];

                            var elem = response.response[i];
                            var phenotypes = [];

                            for (var k = 0; k < elem.numResults; k++) {
                                phenotypes.push(elem.result[k].phenotype);
                            }

                            v.set("phenotype", phenotypes.join(","));
                            v.commit();
                        }


                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('Error loading Phenotypes');
                }
            });
        }
    }
};
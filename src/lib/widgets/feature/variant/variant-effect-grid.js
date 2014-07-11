function VariantEffectGrid(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("VariantEffectGrid");

    this.target;
    this.autoRender = true;
    this.storeConfig = {};
    this.gridConfig = {};
    this.height = 500;

    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }

}

VariantEffectGrid.prototype = {
    render: function () {
        var _this = this;

        //HTML skel
        this.div = document.createElement('div');
        this.div.setAttribute('id', this.id);

        this.panel = this._createPanel();

    },
    draw: function () {
        this.targetDiv = (this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);
        this.panel.render(this.div);
    },

    clear: function () {
        this.store.removeAll();
    },
    load: function (data) {

        var _this = this;

        var effects = _this._prepareEffectData(data);
        var freqs = _this._prepareFrequencyData(data);

        _this.grid.setLoading(true);
        _this.clear();
        this.store.loadData(effects);
        this.freqStore.loadData(freqs);
        this.trigger("load:finish", {sender: _this})
        this.grid.setLoading(false);

    },
    _createPanel: function () {
        var _this = this;

        var storeArgs = {
            storeId: "EffectStore",
            groupField: 'featureId',
            pageSize: 10,
            fields: [
                {name: 'position', type: 'string'},
                { name: 'allele', type: 'string'},
                { name: 'cDnaPosition', type: 'int'},
                { name: 'canonical', type: 'boolean'},
                { name: 'cdsPosition', type: 'int'},
                { name: 'consequenceTypes', type: 'string'},
                { name: 'featureBiotype', type: 'string'},
                { name: 'featureId', type: 'string'},
                { name: 'featureStrand', type: 'string'},
                { name: 'featureType', type: 'string'},
                { name: 'geneId', type: 'string'},
                { name: 'geneName', type: 'string'},
                { name: 'geneNameSource', type: 'string'},
                { name: 'proteinPosition', type: 'int'},
                { name: 'variantToTranscriptDistance', type: 'int'},
                { name: 'polyphenScore', type: 'number'},
                { name: 'siftScore', type: 'number'}
            ],
            data: [],
            autoLoad: false,
            proxy: {type: 'memory'}
        }

        _.extend(storeArgs, this.storeConfig);

        this.store = Ext.create("Ext.data.Store", storeArgs);


        var gridArgs = {
            store: this.store,
            loadMask: true,
            border: false,
            //height: this.height,
            height: 200,
            viewConfig: {
                emptyText: 'No records to display',
                enableTextSelection: true
            },
            plugins: ["bufferedrenderer"],
            columns: [
                { text: "Location", dataIndex: "position", flex: 1},
                //{ text: "cDnaPosition"                , dataIndex: "cDnaPosition", flex: 1},
                //{ text: "canonical"                   , dataIndex: "canonical", flex: 1},
                //{ text: "cdsPosition"                 , dataIndex: "cdsPosition", flex: 1},
                { text: "Conseq. Types", dataIndex: "consequenceTypes", flex: 1},
                {text: "Feature", columns: [
                    { text: "Id", dataIndex: "featureId", flex: 1},
                    { text: "Strand", dataIndex: "featureStrand", flex: 1},
                    { text: "Biotype", dataIndex: "featureBiotype", flex: 1},
                    { text: "Type", dataIndex: "featureType", flex: 1}
                ]},
                {text: 'Genes',
                    columns: [
                        { text: "Id", dataIndex: "geneId", flex: 1},
                        { text: "Name", dataIndex: "geneName", flex: 1},
                        { text: "Source", dataIndex: "geneNameSource", flex: 1}
                    ]},
                { text: "Protein Position", dataIndex: "proteinPosition", flex: 1},
                { text: "Distance to Transcript", dataIndex: "variantToTranscriptDistance", flex: 1},
                { text: "Scores",
                    columns: [
                        { text: "Polyphen", dataIndex: "polyphenScore", flex: 1},
                        { text: "SIFT", dataIndex: "siftScore", flex: 1}
                    ]
                }
            ],
            viewConfig: {
                emptyText: 'No records to display'
            }
        }

        _.extend(gridArgs, this.gridConfig);

        this.grid = Ext.create('Ext.grid.Panel', gridArgs);

        this.freqStore = Ext.create('Ext.data.Store', {
            fields: ['maf', 'name'],
            autoLoad: false
        });
        var freqChart = Ext.create('Ext.chart.Chart', {
                    xtype: 'chart',
                    width: 200,
                    height: 200,
                    store: this.freqStore,
                    animate: true,
                    shadow: true,
                    margin: 10,
                    legend: {
                        position: 'right'
                    },
                    theme: 'Base:gradients',
                    axes: [
                        {
                            type: 'numeric',
                            position: 'bottom',
                            fields: ['maf'],
                            titleMargin: 20,
                            title: 'Minimum Allele Frequency',
                            minimum: 0,
                            maximum: 1
                        },
                        {
                            type: 'category',
                            position: 'left',
                            fields: ['name'],
                            title: 'Populations'
                        }
                    ],
                    series: [
                        {
                            type: 'bar',
                            axis: 'bottom',
                            xField: 'name',
                            yField: 'maf',
                            //style: {
                            //minGapWidth: 20
                            //},
                            highlight: {
                                strokeStyle: 'black',
                                fillStyle: '#c1e30d',
                                lineDash: [5, 3]
                            },
                            label: {
                                field: 'maf',
                                display: 'insideEnd',
                                renderer: function (value) {
                                    return value.toFixed(3);
                                }
                            }
                        }
                    ]
                }
            )
            ;

        var panel = Ext.create('Ext.container.Container', {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            overflowY: true,
            padding: 10,
            items: [
                {
                    xtype: 'box',
                    cls: 'ocb-header-4',
                    html: 'Effects',
                    margin: '5 0 10 10'
                },
                this.grid,
                {
                    xtype: 'box',
                    cls: 'ocb-header-4',
                    html: 'Population Frequencies',
                    margin: '20 0 10 10'
                },
                freqChart
            ],
            height: this.height
        });
        return panel;


    },
    _prepareEffectData: function (data) {

        var finalData = [];
        var chromosome = data.chromosome;
        var position = data.start;
        var reference = data.referenceAllele;

        console.log(data);
        for (var key in data.effects) {

            for (var i = 0, l = data.effects[key].length; i < l; i++) {
                var v = data.effects[key][i];
                v.position = chromosome + ":" + position + " " + reference + " > " + key;
                v.consequenceTypes = v.consequenceTypes.join(",");
                v.polyphenScore = data.proteinSubstitutionScores.polyphenScore;
                v.siftScore = data.proteinSubstitutionScores.siftScore;

                finalData.push(v);
            }

        }

        return finalData;
    },
    _prepareFrequencyData: function (data) {

        var finalData = [];

        finalData.push({ name: "maf1000G", maf: Math.random()});
        finalData.push({ name: "maf1000GAfrican", maf: Math.random()});
        finalData.push({ name: "maf1000GAmerican", maf: Math.random()});
        finalData.push({ name: "maf1000GAsian", maf: Math.random()});
        finalData.push({ name: "maf1000GEuropean", maf: Math.random()});
        finalData.push({ name: "mafNhlbiEspAfricanAmerican", maf: Math.random()});
        finalData.push({ name: "mafNhlbiEspEuropeanAmerican", maf: Math.random()});

        return finalData;
    }
}



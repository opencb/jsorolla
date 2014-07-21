/*
 * Copyright (c) 2014 Francisco Salavert (SGL-CIPF)
 * Copyright (c) 2014 Alejandro Alemán (SGL-CIPF)
 * Copyright (c) 2014 Ignacio Medina (EBI-EMBL)
 *
 * This file is part of JSorolla.
 *
 * JSorolla is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JSorolla is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JSorolla. If not, see <http://www.gnu.org/licenses/>.
 */
function VariantEffectGrid(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("VariantEffectGrid");

    this.target;
    this.autoRender = true;
    this.storeConfig = {};
    this.gridConfig = {};
    this.headerConfig;

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

        this.chartDiv = document.createElement('div');
        $(this.chartDiv).css({
            'height': '200px'
        });

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
        this._updateChart([], []);
    },
    load: function (data) {

        var _this = this;

        var effects = _this._prepareEffectData(data);

        _this.grid.setLoading(true);
        _this.clear();
        this.store.loadData(effects);


        var populations = [];
        var values = [];
        //TODO
//        for (key in data.controls) {
//            values.push(data.controls[key].maf);
//            populations.push(key);
//        }
        this._updateChart(populations, values);


        this.trigger("load:finish", {sender: _this})
        this.grid.setLoading(false);

    },
    _updateChart: function (populations, values) {
        var chart = $(this.chartDiv).highcharts();
        if (chart) {
            chart.xAxis[0].setCategories(populations, false);
            chart.series[0].setData(values, false);
            chart.redraw();
        }
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
            title: 'Effects',
            store: this.store,
            loadMask: true,
            border: true,
            //height: this.height,
            height: 200,
            header: this.headerConfig,
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

        $(this.chartDiv).highcharts({
            chart: {
                type: 'bar'
            },
            title: {
                text: null
            },
            xAxis: {
//                categories: populations,
//                categories: [],
                title: {
                    text: 'Populations',
                    align: 'high'
                }
            },
            yAxis: {
                min: 0,
                max: 1,
                title: {
                    text: 'Minimum Allele Frequency',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -40,
                y: 100,
                floating: true,
                borderWidth: 1,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor || '#FFFFFF'),
                shadow: true
            },
            credits: {
                enabled: false
            },
            series: [
                {
                    name: 'MAF',
//                    data: []
//                    data: data
                }
            ]
        });

        var panel = Ext.create('Ext.container.Container', {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            overflowY: true,
            padding: 10,
            items: [
                this.grid,
                {
                    xtype: 'panel',
                    margin: '10 0 0 0',
                    border: false,
                    title: 'Population Frequencies',
                    header: this.headerConfig,
                    contentEl: this.chartDiv
                }
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



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
function VariantGenotypeGrid(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("VariantGenotypeGrid");

    this.autoRender = true;
    this.storeConfig = {};
    this.gridConfig = {};
    this.height = 500;
    this.target;

    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;

    if (this.autoRender) {
        this.render(this.targetId);
    }
}

VariantGenotypeGrid.prototype = {
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
        this.studiesContainer.removeAll(true);
    },
    load: function (data) {
        this.clear();
        var panels = [];
        for (var key in data) {
            var study = data[key];
//            if (Object.keys(study.samplesData).length > 0) {
                panels.push(this._createStudyPanel(study));
//            }
        }
        this.studiesContainer.add(panels);

    },
    _createPanel: function () {
        this.studiesContainer = Ext.create('Ext.container.Container', {
            layout: {
                type: 'accordion',
                titleCollapse: true,
//                fill: false,
                multi: true
            }
        });

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
                    html: '<h4>Studies</h4s>',
                    margin: '5 0 10 10'
                },
                this.studiesContainer
            ],
            height: this.height
        });
        return panel;
    },
    _createStudyPanel: function (data) {
        var stats = (data.stats) ? data.stats : {};
        var samples = (data.samplesData) ? data.samplesData : {};

        var finalData = [];
        for (var key in samples) {
            var s = samples[key];
            finalData.push({
                sample: key,
                genotype: s.GT
            });
        }
        console.log(finalData);
        if(_.isEmpty(finalData)){
            var grid = {
                xtype: 'container',
                html: '<p>No Genotypes available</p>',
                margin: '5 0 10 10'
            }
        }else{
            var store = Ext.create("Ext.data.Store", {
                //storeId: "GenotypeStore",
                pageSize: 10,
                fields: [
                    {name: "sample", type: "string" },
                    {name: "genotype", type: "string"},
                    {name: "sex", type: "string"},
                    {name: "phenotype", type: "string"}
                ],
                data: finalData,
                proxy: {type: 'memory'}
            });

            var grid = Ext.create('Ext.grid.Panel', {
                store: store,
                loadMask: true,
                width: 400,
                height: 300,
                margin: 20,
                viewConfig: {
                    emptyText: 'No records to display',
                    enableTextSelection: true
                },
                plugins: ["bufferedrenderer"],
                columns: [
                    {
                        text: "Sample",
                        dataIndex: "sample",
                        flex: 1
                    },
                    {
                        text: "Genotype",
                        dataIndex: "genotype",
                        flex: 1
                    },
                    {
                        text: "Sex",
                        dataIndex: "sex",
                        flex: 1
                    },
                    {
                        text: "Phenotype",
                        dataIndex: "phenotype",
                        flex: 1
                    }
                ]
            });

            var gts = this._getGenotypeCount(stats.genotypesCount);

            var genotypeChart;
            if (gts.length > 0) {
                var store = Ext.create('Ext.data.Store', {
                    fields: ['genotype', 'count'],
                    data: gts
                });

//                genotypeChart = Ext.create('Ext.chart.Chart', {
//                    xtype: 'chart',
//                    width: 200,
//                    height: 130,
//                    store: store,
//                    animate: true,
//                    shadow: true,
//                    legend: {
//                        position: 'right'
//                    },
//                    theme: 'Base:gradients',
//                    //insetPadding: 60,
//                    series: [
//                        {
//                            type: 'pie',
//                            field: 'count',
//                            showInLegend: true,
//                            tips: {
//                                trackMouse: true,
//                                renderer: function (storeItem, item) {
//                                    var name = storeItem.get('genotype');
//                                    this.setTitle(name + ': ' + storeItem.get('count'));
//                                }
//                            },
//                            highlight: {
//                                segment: {
//                                    margin: 20
//                                }
//                            },
//                            label: {
//                                field: 'genotype',
//                                display: 'rotate',
//                                contrast: true,
//                                font: '10px Arial'
//                            }
//
//                        }
//                    ]
//                });
            }
        }





        var studyPanel = Ext.create('Ext.panel.Panel', {
            title: data.studyId,
            border: true,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                grid,
                genotypeChart
            ]
        });

        return studyPanel;

    },
    _getGenotypeCount: function (gc) {
        var res = [];
        for (var key in gc) {
            res.push({
                genotype: key,
                count: gc[key]
            })
        }
        return res;
    }
};

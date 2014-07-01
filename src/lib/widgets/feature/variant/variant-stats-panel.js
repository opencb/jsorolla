function VariantStatsPanel(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("VariantStatsPanel");

    this.target;
    this.title = "Stats";
    this.height = 800;
    this.autoRender = true;

    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;

    if (this.autoRender) {
        this.render();
    }
}

VariantStatsPanel.prototype = {
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
    load: function (data) {

        this.panel.removeAll(true);

        var panels = [];
        
        for(var key in data){
            var study = data[key];
            var studyPanel = this._createStudyPanel(study);
            panels.push(studyPanel);
        
        }

        this.panel.add(panels);
    },
    _createPanel: function () {
        var panel = Ext.create('Ext.panel.Panel', {
            title: "Studies",
            height: this.height
        });
        return panel;
    },
    _createStudyPanel: function (data) {

        var stats = (data.stats) ? data.stats : [];
        var attributes = (data.attributes) ? data.attributes : [];
        var statsTable = Utils.htmlTable(stats);
        var attrTable = Utils.htmlTable(attributes);

        var studyPanel = Ext.create('Ext.panel.Panel', {
            title: data.studyId,
            height: 250,
            layout: 'hbox',
            items: [
                {xtype: 'box', html: attrTable, margin: '5 5 5 10'},
                {xtype: 'box', html: statsTable, margin: '5 5 5 10'},
            ]
        });

        var gts = this._getGenotypeCount(stats.genotypesCount);

        if (gts.length > 0) {
            var store = Ext.create('Ext.data.Store', {
                fields: ['genotype', 'count'],
                data: gts
            });

            var genotypeChart = Ext.create('Ext.chart.Chart', {
                xtype: 'chart',
                width: 200,
                height: 130,
                store: store,
                animate: true,
                shadow: true,
                legend: {
                    position: 'right'
                },
                theme: 'Base:gradients',
                //insetPadding: 60,
                series: [
                    {
                        type: 'pie',
                        field: 'count',
                        showInLegend: true,
                        tips: {
                            trackMouse: true,
                            renderer: function (storeItem, item) {
                                var name = storeItem.get('genotype');
                                this.setTitle(name + ': ' + storeItem.get('count'));
                            }
                        },
                        highlight: {
                            segment: {
                                margin: 20
                            }
                        },
                        label: {
                            field: 'genotype',
                            display: 'rotate',
                            contrast: true,
                            font: '10px Arial'
                        }

                    }
                ]
            });
            studyPanel.add(genotypeChart);
        }

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

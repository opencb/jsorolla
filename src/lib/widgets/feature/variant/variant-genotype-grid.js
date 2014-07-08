function VariantGenotypeGrid(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("VariantGenotypeGrid");

    this.autoRender = true;
    this.storeConfig = {};
    this.gridConfig = {};
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

        this.panel.removeAll(true);
    },
    load: function (data) {

       this.clear(); 

        var panels = [];

        for (var key in data) {
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

        var samples = (data.samplesData) ? data.samplesData : [];

        var store = Ext.create("Ext.data.Store", {
            //storeId: "GenotypeStore",
            pageSize: 10,
            fields: [
                {name: "sample", type: "string" },
                {name: "genotype", type: "string"},
                {name: "sex", type: "string"},
                {name: "phenotype", type: "string"}
            ],
            data: [],
            autoLoad: false,
            proxy: {type: 'memory'}
        });

        var grid = Ext.create('Ext.grid.Panel',
            {
                store: store,
            title: data.studyId,
                border: false,
                loadMask: true,
                viewConfig: {
                    emptyText: 'No records to display',
                    enableTextSelection: true
                },
                plugins: ["bufferedrenderer"],
                columns: [
                    {xtype: 'rownumberer'},
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

            var finalData  = [];
        for (var key in samples) {
            var s = samples[key];
            finalData.push({
               sample: key,
               genotype: s.GT
            });
        }

        console.log(finalData);
        store.loadData(finalData);
        return grid;

    }
};

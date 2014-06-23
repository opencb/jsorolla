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
        this.store.removeAll();
    },
    load: function (data) {

        this.panel.setLoading(true);
        this.store.loadData(data);

        this.trigger("load:finish", {sender: this});
        this.panel.setLoading(false);
    },
    _createPanel: function () {
        var _this = this;
        var storeArgs = {
            storeId: "GenotypeStore",
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
        };

        _.extend(storeArgs, _this.storeConfig);

        this.store = Ext.create("Ext.data.Store", storeArgs);


        var gridArgs = {
            store: this.store,
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
        };
        _.extend(gridArgs, this.gridConfig);

        return Ext.create('Ext.grid.Panel', gridArgs);
    }
};

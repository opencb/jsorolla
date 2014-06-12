function GenotypeGridWidget(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("GenotypeGridWidget");

    this.autoRender = true;
    this.storeConfig = {};
    this.gridConfig = {};
    this.title = "Genotype";
    this.target;

    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;

    if (this.autoRender) {
        this.render(this.targetId);
    }
}

GenotypeGridWidget.prototype = {
    render: function (target) {
        var _this = this;

        _this.target = (target) ? target : this.target;

        var storeArgs = {
            storeId: "GenotypeStore",
            pageSize: 10,
            fields: [
                {name: "sample"    , type: "string" },
                {name: "genotype"  , type: "string"},
                {name: "sex"       , type: "string"},
                {name: "phenotype" , type: "string"},
            ],
            data: [],
            autoLoad: false,
            proxy: {type: 'memory'}
        }

        _.extend(storeArgs, _this.storeConfig);

        _this.store = Ext.create("Ext.data.Store", storeArgs);


        var gridArgs = {
            title: _this.title,
            renderTo: target,
            store: this.store,
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
                },
            ],
            viewConfig: {
                emptyText: 'No records to display'
            }
        }

        _.extend(gridArgs, _this.gridConfig);

        _this.grid = Ext.create('Ext.grid.Panel', gridArgs);

    },
    draw: function () {

    },
    getPanel: function () {
        return this.grid;
    },
    clear: function () {
        this.store.removeAll();
    },
    load: function (data) {

        this.grid.setLoading(true);
        this.store.loadData(data);

        this.trigger("load:finish", {sender: this})
        this.grid.setLoading(false);
    }
}

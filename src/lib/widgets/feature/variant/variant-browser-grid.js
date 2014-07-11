function VariantBrowserGrid(args) {
    _.extend(this, Backbone.Events);

    //set default args
    this.id = Utils.genId("Widget");
    this.target;
    this.data = [];
    this.dataParser;
    this.columns;
    this.attributes;
    this.type;
    this.pageSize = 15;
    this.title = "Variant Browser";
    this.autoRender = true;

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render(this.targetId);
    }

}

VariantBrowserGrid.prototype = {
    render: function () {
        var _this = this;
        console.log("Initializing " + this.id);

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
    _createPanel: function () {

        var _this = this;

        this.model = Ext.define('Variant', {
            extend: 'Ext.data.Model',
            idProperty: 'iid',
            fields: this.attributes
        });

        this.store = Ext.create('Ext.data.Store', {
                pageSize: this.pageSize,
                model: this.model,
                remoteSort: true,
                proxy: {
                    type: 'memory',
                    enablePaging: true
                },
                listeners: {
                    beforeload: function (store, operation, eOpts) {
                        _this.trigger("variant:clear", {sender: _this});
                    }
                }

            }
        );
        this.paging = Ext.create('Ext.PagingToolbar', {
            store: _this.store,
            id: _this.id + "_pagingToolbar",
            pageSize: _this.pageSize,
            displayInfo: true,
            displayMsg: 'Variants {0} - {1} of {2}',
            emptyMsg: "No variants to display"
        });

        var grid = Ext.create('Ext.grid.Panel', {
                store: this.store,
                loadMask: true,
                columns: this.columns,
                plugins: 'bufferedrenderer',
                animCollapse: false,
                height: 500,
                features: [
                    {ftype: 'summary'}
                ],
                viewConfig: {
                    emptyText: 'No records to display',
                    enableTextSelection: true
                },
                tbar: this.paging
            }
        );

        grid.getSelectionModel().on('selectionchange', function (sm, selectedRecord) {
            if (selectedRecord.length) {
                var row = selectedRecord[0].data;
                _this.trigger("variant:change", {sender: _this, args: row});
            }
        });

        this.grid = grid;

        var panel = Ext.create('Ext.container.Container', {
            border: false,
            items: [
                {
                    xtype: 'box',
                    cls: 'ocb-header-3',
                    margin: '0 0 10 0',
                    html: this.title
                },
                grid
            ]
        });
        return panel;
    },
    load: function (data) {
        var _this = this;
        this.store.destroy();

        if (typeof this.dataParser !== 'undefined') {
            this.dataParser(data)
        } else {
            this._parserFunction(data);

        }

        this.store = Ext.create('Ext.data.Store', {
            pageSize: this.pageSize,
            model: this.model,
            data: data,
            remoteSort: true,
            proxy: {
                type: 'memory',
                enablePaging: true

            },
            listeners: {
                beforeload: function (store, operation, eOpts) {
                    _this.trigger("variant:clear", {sender: _this});
                },
                load: function (store, records, successful, operation, eOpts) {
                    _this.setLoading(false);
                }
            }
        });
        this.grid.reconfigure(this.store, this.columnsGrid);
        this.paging.bindStore(this.store);
        this.paging.doRefresh();
    },
    loadUrl: function (baseUrl, filterParams) {
        var _this = this;
        this.store.destroy();

        console.log("filter");
        console.log(filterParams)

        this.store = Ext.create('Ext.data.Store', {
            pageSize: this.pageSize,
            model: this.model,
            remoteSort: true,
            proxy: {
                url: baseUrl,
                type: 'ajax',
                startParam: 'skip',
                reader: {
                    root: "response[0].result",
                    totalProperty: "response[0].numTotalResults",
                    transform: function (response) {

                        var data = (response.response[0].result) ? response.response[0].result : [];

                        if (typeof this.dataParser !== 'undefined') {
                            _this.dataParser(data);
                        } else {
                            _this._parserFunction(data);

                        }
                        return response;
                    }
                },
                extraParams: filterParams,
                actionMethods: {create: 'GET', read: 'GET', update: 'GET', destroy: 'GET'}
            },
            listeners: {
                load: function (store, records, successful, operation, eOpts) {

                    console.log(records);

                    if (typeof this.dataParser !== 'undefined') {
                        _this.dataParser(records);
                    } else {
                        _this._parserFunction(records);

                    }

                    console.log(records);

                    _this.setLoading(false);
                },
                beforeload: function (store, operation, eOpts) {
                    _this.trigger("variant:clear", {sender: _this});
                },
            }

        });

        this.grid.reconfigure(this.store, this.columnsGrid);
        this.paging.bindStore(this.store);
        this.store.load();

    },
    _parserFunction: function (data) {
        for (var i = 0; i < data.length; i++) {
            var variant = data[i];

            if (variant.hgvs && variant.hgvs.genomic && variant.hgvs.genomic.length > 0) {
                variant.hgvs_name = variant.hgvs.genomic[0];
            }
        }

    },
    setLoading: function (loading) {
        this.panel.setLoading(loading);
    }
};

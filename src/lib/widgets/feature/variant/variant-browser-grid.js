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
//                data: _this.data,
                remoteSort: true,
                proxy: {
                    type: 'memory',
                    enablePaging: true
                },
                listeners: {
                    beforeload: function (store, operation, eOpts) {
                        _this.trigger("VariantBrowserGrid:clear", {sender: _this});
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
                title: 'Variant Info',
                store: this.store,
                loadMask: true,
                columns: this.columns,
                plugins: 'bufferedrenderer',
                collapsible: true,
                titleCollapse: true,
                animCollapse: false,
                height: 500,
                features: [
                    {ftype: 'summary'}
                ],
                viewConfig: {
                    emptyText: 'No records to display',
                    enableTextSelection: true
                },
                bbar: this.paging
            }
        );

        grid.getSelectionModel().on('selectionchange', function (sm, selectedRecord) {
            if (selectedRecord.length) {
                var row = selectedRecord[0].data;
                _this.trigger("variant:change", {sender: _this, args: row});
            }
        });

        return grid;
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
                    _this.trigger("VariantBrowserGrid:clear", {sender: _this});
                }
            }
        });
        this.panel.reconfigure(this.store, this.columnsGrid);
        this.paging.bindStore(this.store);
        this.paging.doRefresh();
    },
    loadUrl:function(baseUrl, filterParams){
        var _this = this;
        this.store.destroy();

        this.store = Ext.create('Ext.data.Store', {
            pageSize: this.pageSize,
            model: this.model,
//            remoteSort: true,
//            sorters: [
//                {
//                    property: 'chromosome',
//                    direction: 'ASC'
//                }
//            ],
            proxy: {
                url: baseUrl,
                type: 'ajax',
                startParam:'skip',
                reader: {
                    root: "response[0].result",
                    totalProperty: "response[0].numTotalResults"
                },
                extraParams: filterParams,
                actionMethods: {create: 'GET', read: 'GET', update: 'GET', destroy: 'GET'}
            },
            listeners: {
                load: function (store, records, successful, operation, eOpts) {

                    console.log(records)
//                    debugger
//                    store.suspendEvents();
//                    var aux;
//
//                    for (var i = 0; i < records.length; i++) {
//                        var v = records[i];
//                        for (var key in v.data.sampleGenotypes) {
//
//                            aux = v.data.sampleGenotypes[key];
//                            aux = aux.replace(/-1/g, ".");
//                            aux = aux.replace("|", "/");
//                            v.set(key, aux);
//                        }
//
//                        v.set("snpid", v.data.snpid);
//                        v.set("genes", v.data.genes.join(","));
//
//                        v.commit();
//                    }
//
//                    _this._getPhenotypes(records);
//                    store.resumeEvents();
//                    store.fireEvent('refresh');
                },
                beforeload: function (store, operation, eOpts) {
                    _this.trigger("_grid:clear", {sender: _this});
                }
            }

        });

        this.panel.reconfigure(this.store, this.columnsGrid);
        this.paging.bindStore(this.store);
//        this.paging.doRefresh();
        this.store.load();

    },
    _parserFunction: function (data) {
        for (var i = 0; i < data.length; i++) {
            var variant = data[i];

            if (variant.hgvs && variant.hgvs.length > 0) {
                variant.hgvs_name = variant.hgvs[0].genomic;
            }
        }

    }
};

function VariantBrowserGrid(args) {
    _.extend(this, Backbone.Events);

    //set default args
    this.id = Utils.genId("Widget");
    this.target;
    this.data = [];
    this.pageSize = 10;
    this.autoRender = true;
    this.dataParser;

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

        _this.columnsGrid = [
            {
                text: "Id",
                dataIndex: 'id'
            },
            {
                text: "Chromosome",
                dataIndex: 'chromosome'
            },
            {
                text: 'Start',
                dataIndex: 'start'
            },
            {
                text: 'End',
                dataIndex: 'end'
            },
            {
                text: 'Type',
                dataIndex: 'type'
            },
            {
                text: 'Ref/Alt',
                xtype: "templatecolumn",
                tpl: "{reference}>{alternate}"
            },
            {
                text: 'HGVS Name',
                dataIndex: 'hgvs_name'
            },
            {
                text: 'View'
            }
//
        ];

        _this.attributes = [
            {name: 'id', type: 'string'},
            {name: "chromosome", type: "string"},
            {name: "start", type: "int"},
            {name: "end", type: "int"},
            {name: "type", type: "string"},
            {name: "ref", type: "string"},
            {name: "alt", type: "string"},
            {name: 'hgvs_name', type: 'string'},
        ];
        _this.model = Ext.define('Variant', {
            extend: 'Ext.data.Model',
            idProperty: 'iid',
            fields: _this.attributes
        });

        _this.store = Ext.create('Ext.data.Store', {
                pageSize: _this.pageSize,
                model: _this.model,
//                data: _this.data,
                storeId: 'gridStore',
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
                store: _this.store,
                loadMask: true,
                columns: this.columnsGrid,
                plugins: 'bufferedrenderer',
                loadMask: true,
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
            pageSize: _this.pageSize,
            model: _this.model,
            data: data,
            storeId: 'gridStore',
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
        console.log(data);
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

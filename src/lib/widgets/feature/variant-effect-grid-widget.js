function VariantEffectPanelWidget(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("VariantEffectPanelWidget");

    this.storeConfig = {};
    this.gridConfig = {};
    this.filterEffect = true;

    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;

    if (this.autoRender) {
        this.render(this.targetId);
    }
}

VariantEffectPanelWidget.prototype = {
    render: function (targetId) {
        var _this = this;

        _this.targetId = (targetId) ? targetId : this.targetId;

        var storeArgs = {
            storeId: "EffectStore",
            groupField: 'featureId',
            fields: [
                {name: "featureId"           , type: "String" },
                {name: "featureName"         , type: "String" },
                {name: "featureType"         , type: "String" },
                {name: "featureBiotype"      , type: "String" },
                {name: "featureChromosome"   , type: "String" },
                {name: "featureStart"        , type: "int"    },
                {name: "featureEnd"          , type: "int"    },
                {name: "featureStrand"       , type: "String" },
                {name: "snpId"               , type: "String" },
                {name: "ancestral"           , type: "String" },
                {name: "alternative"         , type: "String" },
                {name: "geneId"              , type: "String" },
                {name: "transcriptId"        , type: "String" },
                {name: "geneName"            , type: "String" },
                {name: "consequenceType"     , type: "String" },
                {name: "consequenceTypeObo"  , type: "String" },
                {name: "consequenceTypeDesc" , type: "String" },
                {name: "consequenceTypeType" , type: "String" },
                {name: "aaPosition"          , type: "int"    },
                {name: "aminoacidChange"     , type: "String" },
                {name: "codonChange"         , type: "String" },
                {name: "polyphenScore"       , type: "float"  },
                {name: "polyphenEfect"       , type: "float"  },
                {name: "siftScore"           , type: "float"  },
                {name: "siftEffect"          , type: "float"  },
            ],
            data: [],
            autoLoad: false,
            proxy: {type: 'memory'}
        }

        _.extend(storeArgs, _this.storeConfig);

        _this.store = Ext.create("Ext.data.Store", storeArgs);


        var gridArgs = {
            targetId: _this.targetId,
            title: "Variant Effect",
            width: '100%',
            flex: 2,
            store: this.store,
            loadMask: true,
            border: 1,
            margin: '0 5 5 5',
            columns: [
                {xtype: 'rownumberer'},
                {
                    text: "Position chr:start:end (strand)",
                    dataIndex: "featureChromosome",
                    xtype: "templatecolumn",
                    tpl: '{featureChromosome}:{featureStart}-{featureEnd} <tpl if="featureStrand == 1">(+)<tpl elseif="featureStrand == -1">(-)</tpl>',
                    flex: 1
                },
                {
                    text: "SNP Id",
                    dataIndex: "snpId",
                    flex: 1
                },
                {
                    text: "Conseq. Type",
                    dataIndex: "consequenceTypeObo",
                    xtype: "templatecolumn",
                    tpl: '{consequenceTypeObo} (<a href="http://www.sequenceontology.org/browser/current_svn/term/{consequenceType}" target="_blank">{consequenceType}</a>)',
                    flex: 1
                },
                {
                    text: "Aminoacid Change",
                    xtype: "templatecolumn",
                    tpl: '<tpl if="aminoacidChange">{aminoacidChange} - {codonChange} ({aaPosition}) <tpl else>.</tpl>  ',
                    flex: 1
                },
                {
                    text: "Gene (EnsemblId)",
                    dataIndex: "geneName",
                    xtype: 'templatecolumn',
                    tpl: '<tpl if="geneName">{geneName} (<a href="http://www.ensembl.org/Homo_sapiens/Location/View?g={geneId}" target="_blank">{geneId}</a>)<tpl else>.</tpl>',
                    flex: 1
                },
                {
                    text: "Transcript Id",
                    dataIndex: "transcriptId",
                    xtype: 'templatecolumn',
                    tpl: '<a href="http://www.ensembl.org/Homo_sapiens/Location/View?t={transcriptId}" target="_blank">{transcriptId}</a>',
                    flex: 1
                },
                {
                    text: "Feature Id",
                    dataIndex: "featureId",
                    flex: 1

                },
                {
                    text: "Feature Name",
                    dataIndex: "featureName",
                    flex: 1

                },
                {
                    text: "Feature Type",
                    dataIndex: "featureType",
                    flex: 1

                },
                {
                    text: "Feature Biotype",
                    dataIndex: "featureBiotype",
                    flex: 1

                },
                {
                    text: "Ancestral",
                    dataIndex: "ancestral",
                    hidden: true,
                    flex: 1
                },
                {
                    text: "Alternative",
                    dataIndex: "alternative",
                    hidden: true,
                    flex: 1
                }
            ],
            viewConfig: {
                emptyText: 'No records to display'
            },
            dockedItems: [
                {
                    xtype: 'toolbar',
                    dock: 'bottom',
                    items: [
                        {
                            xtype: 'tbtext',
                            id: _this.id + "numRowsLabelEffect"
                        }
                    ]
                }
            ]
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
    load: function (chr, pos, ref, alt) {

        var _this = this;
        var req = chr + ":" + pos + ":" + ref + ":" + alt;

        _this.grid.setLoading(true);
        _this.clear();

        CellbaseManager.get({
            species:'hsa',
            category: 'genomic',
            subCategory:'variant',
            query: req,
            resource: 'consequence_type',
            success: function(response){
                var data = (_this.filterEffect) ? _this._filterEffectData(response): response;

                _this.store.loadData(data);
                _this.grid.setTitle(_this.gridName + ' - <span class="info">' + chr + ':' + pos + ' ' + ref + '>' + alt + '</span>');
                Ext.getCmp(_this.id + "numRowsLabelEffect").setText(data.length + " effects");
        
                _this.grid.setLoading(true);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('Error loading Effect');
                _this.grid.setLoading(false);
            }
        });
    },
    _filterEffectData: function (data) {
        var _this = this;
        var res = [];

        var regulatory = {};

        for (var i = 0; i < data.length; i++) {
            var elem = data[i];
            if (elem.consequenceTypeObo == "coding_sequence_variant" || elem.consequenceTypeObo == "exon_variant" || elem.consequenceTypeObo == "intron_variant") {
                continue;
            } else if (elem.consequenceTypeObo == "regulatory_region_variant") {
                if (!(elem.featureId in regulatory)) {
                    regulatory[elem.featureId] = elem;
                }
                continue;
            }

            res.push(elem);
        }

        for (var elem in regulatory) {
            res.push(regulatory[elem]);
        }

        return res;
    }
}

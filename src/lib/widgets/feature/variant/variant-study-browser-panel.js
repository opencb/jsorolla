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
function VariantStudyBrowserPanel(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("VariantStudyBrowserPanel");

    this.target;
    this.title = "Study Browser";
    this.height = 800;
    this.autoRender = true;
//    this.studies = [];
    this.studiesStore;
    this.host;
    this.border = false;
    this.speciesList = [
        {
            assembly: "GRCh37.p7",
            common: "human",
            id: "extModel256-1",
            sciAsembly: "Homo sapiens (GRCh37.p7)",
            scientific: "Homo sapiens",
            species: "hsa"
        }
    ];

    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;

    if (this.autoRender) {
        this.render();
    }
}

VariantStudyBrowserPanel.prototype = {
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
    load: function (studies) {
        //TODO
    },
    _createPanel: function () {
        var _this = this;

        var speciesStore = Ext.create('Ext.data.Store', {
            autoLoad: true,
            fields: ['species', 'common', 'scientific', 'assembly', 'sciAsembly'],
            data: this.speciesList
        });

        var speciesCombo = Ext.create('Ext.form.field.ComboBox', {
            fieldLabel: 'Choose Species',
//            labelWidth: this.labelWidth,
            labelAlign: 'top',
            name: 'species',
            displayField: 'scientific',
            valueField: 'species',
            editable: false,
            allowBlank: false,
            store: speciesStore,
            listeners: {
                change: function () {
                    if (this.getValue()) {

                    }
                }
            }
        });

//        this.studiesStore = Ext.create('Ext.data.Store', {
//            pageSize: 50,
//            proxy: {
//                type: 'memory'
//            },
//            fields: [
//                {name: 'studyName', type: 'string'},
//                {name: 'studyId', type: 'string'}
//            ],
//            data: this.studies
//        });

        var studySearchField = Ext.create('Ext.form.field.Text', {
            fieldLabel: 'Name Search',
            labelAlign: 'top',
            emptyText: 'search',
            listeners: {
                change: function () {
                    var value = this.getValue();
                    if (value == "") {
                        _this.studiesStore.clearFilter();
                    } else {
                        var regex = new RegExp(value, "i");
                        _this.studiesStore.filterBy(function (e) {
                            return regex.test(e.get('studyName'));
                        });
                    }
                }
            }

        });

        this.grid = Ext.create('Ext.grid.Panel', {
                title: 'Studies',
                store: this.studiesStore,
                header: this.headerConfig,
                loadMask: true,
//                hideHeaders: true,
                plugins: 'bufferedrenderer',
                height: 500,
                features: [
                    {ftype: 'summary'}
                ],
                viewConfig: {
                    emptyText: 'No studies found',
                    enableTextSelection: true,
                    markDirty: false,
                    listeners: {
                        itemclick: function (este, record) {
//                            var url = _this.host + "v1/studies/" + record.get("projectId") + "/summary"
//                            $.ajax({
//                                url: url,
//                                dataType: 'json',
//                                async: false,
//                                success: function (response, textStatus, jqXHR) {
//                                    var data = (response !== undefined && response.response.length > 0 ) ? response.response[0].result[0] : [];
//
//                                    var studyPanel = _this._createStudyPanel(data);
//
//                                    $.ajax({
//                                        url: _this.host + "v1/studies/" + record.get("alias") + "/files",
//                                        dataType: 'json',
//                                        success: function (response, textStatus, jqXHR) {
//                                            var files = (response !== undefined && response.response.length > 0 && response.response[0].numResults > 0) ? response.response[0].result : [];
//
//                                            var filesPanel = _this._createFilesPanel(files);
//                                            _this.rightPanel.removeAll(true);
//                                            _this.rightPanel.add(studyPanel);
//                                            _this.rightPanel.add(filesPanel);
//
//                                        },
//                                        error: function (jqXHR, textStatus, errorThrown) {
//                                            console.log('Error loading studies');
//                                        }
//                                    });
//                                },
//                                error: function (jqXHR, textStatus, errorThrown) {
//                                    console.log('Error loading studies');
//                                }
//                            });
                        },
                        itemcontextmenu: function (este, record, item, index, e) {

                        }
                    }
                },
                selModel: {
                    listeners: {
                        'selectionchange': function (sm, selectedRecord) {
                            if (selectedRecord.length) {
                                var row = selectedRecord[0].data;
                                _this.trigger("variant:change", {sender: _this, args: row});
                            }
                        }
                    }
                },
                columns: [
                    {
                        text: 'Active',
                        xtype: 'checkcolumn',
                        dataIndex: 'uiactive',
                        flex: 1
                    },
                    {
                        text: "Name",
                        dataIndex: 'studyName',
                        flex: 10
                    },
                    {
                        text: "ID",
                        dataIndex: 'studyId',
                        flex: 3
                    }
                ],
//                tbar: {
//                    height: 40,
//                    items: [
//
//                    ]
//                }
            }
        );

        this.leftPanel = Ext.create('Ext.container.Container', {
            flex: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            defaults: {
                margin: 10
            },
            items: [
                speciesCombo,
                studySearchField
            ]
        });


        this.rightPanel = Ext.create('Ext.container.Container', {
            flex: 4,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            defaults: {
                margin: 10
            },
            items: [this.grid]
        });

        var panel = Ext.create('Ext.panel.Panel', {
            title: this.title,
            border: this.border,
            header: this.headerConfig,
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            defaults: {
                margin: 10
            },
            items: [
                this.leftPanel,
                this.rightPanel
            ]
        });

        return panel;
    },

    setLoading: function (loading) {
        this.panel.setLoading(loading);
    },

    update: function () {
        if(this.panel){
            this.panel.update();
        }
    }

//    _createStudyPanel: function (file) {
//
//        var filePanel = Ext.create('Ext.container.Container', {
//            layout: 'vbox',
//            items: [
//                {
//                    xtype: 'container',
//                    data: file,
//                    tpl: new Ext.XTemplate(
//                            '<table class="eva-stats-table">' +
//                            '<tr>' +
//                            '<td class="header">Species</td>' +
//                            '<td>{species}</td>' +
//                            '</tr>',
//                            '<tr>' +
//                            '<td class="header">Material</td>' +
//                            '<td>{material}</td>' +
//                            '</tr>',
//                            '<tr>' +
//                            '<td class="header">Scope</td>' +
//                            '<td>{scope}</td>' +
//                            '</tr>',
//                            '<tr>' +
//                            '<td class="header">Type</td>' +
//                            '<td>{type}</td>' +
//                            '</tr>',
//                            '<tr>' +
//                            '<td class="header">Sources</td>' +
//                            '<td>{sources}</td>' +
//                            '</tr>',
//                            '<tr>' +
//                            '<td class="header">Description</td>' +
//                            '<td>{description}</td>' +
//                            '</tr>',
//                        '</table>'
//                    ),
//                    margin: '5 5 5 10'
//                }
//
//            ]
//        });
//
//        return filePanel;
//
//    },
//
//
//    _createFilesPanel: function (files) {
//        var filePanels = [];
//        for (var i = 0; i < files.length; i++) {
//            var file = files[i];
//            filePanels.push(this._createFilePanel(file));
//        }
//
//        var filesContainer = Ext.create('Ext.container.Container', {
//            layout: {
//                type: 'vbox',
//                align: 'stretch'
//            },
//            overflowY: true,
//            padding: 10,
//            items: filePanels
//
//        });
//
//        var studyPanel = Ext.create('Ext.container.Container', {
//            items: [
//                filesContainer
//            ]
//        });
//        return studyPanel;
//
//    },
//    _createFilePanel: function (file) {
//
//        var filePanel = Ext.create('Ext.container.Container', {
//            layout: 'vbox',
//            items: [
//                {
//                    xtype: 'box',
//                    cls: 'eva-header-5',
//                    margin: '5 5 5 10',
//                    html: file.fileName
//                },
//                {
//                    xtype: 'container',
//                    layout: 'hbox',
//                    items: [
//                        {
//                            xtype: 'container',
//                            data: file.stats,
//                            tpl: new Ext.XTemplate(
//                                    '<table class="eva-stats-table">' +
//                                    '<tr>' +
//                                    '<td class="header">Variants count:</td>' +
//                                    '<td>{variantsCount}</td>' +
//                                    '</tr>',
//                                    '<tr>' +
//                                    '<td class="header">Samples count:</td>' +
//                                    '<td>{samplesCount}</td>' +
//                                    '</tr>',
//                                    '<tr>' +
//                                    '<td class="header">SNPs count:</td>' +
//                                    '<td>{snpsCount}</td>' +
//                                    '</tr>',
//                                    '<tr>' +
//                                    '<td class="header">Indels count:</td>' +
//                                    '<td>{indelsCount}</td>' +
//                                    '</tr>',
//                                    '<tr>' +
//                                    '<td class="header">Pass count:</td>' +
//                                    '<td>{passCount}</td>' +
//                                    '</tr>',
//                                    '<tr>' +
//                                    '<td class="header">Ti/Tv Ratio:</td>' +
//                                    '<td>{[this.titv(values)]}</td>' +
//                                    '</tr>',
//                                    '<tr>' +
//                                    '<td class="header">Mean quality:</td>' +
//                                    '<td>{meanQuality}</td>' +
//                                    '</tr>',
//                                '</table>', {
//                                    titv: function (values) {
//                                        var res = values.transitionsCount / values.transversionsCount;
//                                        return res.toFixed(2);
//                                    }
//                                }
//                            ),
//                            margin: '5 5 5 10'
//                        }
//                    ]
//                }
//
//            ]
//        });
//        return filePanel;
//    },

};

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
    this.studies = [];
    this.host;

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
        this.studiesStore = Ext.create('Ext.data.Store', {
            fields: ["projectId", "alias", "title"],
            data: this.studies
        });
        this.leftPanel = Ext.create('Ext.container.Container', {
            flex: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'box',
                    html: 'Species',
                    cls: 'ocb-header-3',
                    margin: '0 0 25 0'
                },
                {
                    xtype: 'box',
                    html: 'Studies',
                    cls: 'ocb-header-3'
                },
                Ext.create('Ext.view.View', {
                    padding: 15,
                    store: this.studiesStore,
                    tpl: new Ext.XTemplate([
                        '<tpl for=".">',
                            '<div class="ocb-job-list-widget-item">{title} </div> ' +
                            '</tpl>']),

                    trackOver: true,
                    autoScroll: true,
                    overItemCls: 'ocb-job-list-widget-item-hover',
                    itemSelector: '.ocb-job-list-widget-item',
                    listeners: {
                        itemclick: function (este, record) {
                            var url = _this.host + "v1/studies/" + record.get("projectId") + "/summary"
                            $.ajax({
                                url: url,
                                dataType: 'json',
                                async: false,
                                success: function (response, textStatus, jqXHR) {
                                    var data = (response !== undefined && response.response.length > 0 ) ? response.response[0].result[0] : [];

                                    var studyPanel = _this._createStudyPanel(data);

                                    $.ajax({
                                        url: _this.host + "v1/studies/" + record.get("alias") + "/files",
                                        dataType: 'json',
                                        success: function (response, textStatus, jqXHR) {
                                            var files = (response !== undefined && response.response.length > 0 && response.response[0].numResults > 0) ? response.response[0].result : [];

                                            var filesPanel = _this._createFilesPanel(files);
                                            _this.rightPanel.removeAll(true);
                                            _this.rightPanel.add(studyPanel);
                                            _this.rightPanel.add(filesPanel);

                                        },
                                        error: function (jqXHR, textStatus, errorThrown) {
                                            console.log('Error loading studies');
                                        }
                                    });
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    console.log('Error loading studies');
                                }
                            });
                        },
                        itemcontextmenu: function (este, record, item, index, e) {

                        }
                    }
                })
            ]
        });

        this.rightPanel = Ext.create('Ext.container.Container', {
            layout: {
                type: 'vbox',
                align: 'stretch'
            }
        });

        var panel = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                this.leftPanel,
                {
                    xtype: 'container',
                    flex: 4,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'box',
                            html: 'Information',
                            cls: 'ocb-header-3'
                        },
                        this.rightPanel
                    ]
                }

            ]
        });

        return panel;
    },
    _createStudyPanel: function (file) {

        var filePanel = Ext.create('Ext.container.Container', {
            layout: 'vbox',
            items: [
                {
                    xtype: 'container',
                    data: file,
                    tpl: new Ext.XTemplate(
                            '<table class="eva-stats-table">' +
                            '<tr>' +
                            '<td class="header">Species</td>' +
                            '<td>{species}</td>' +
                            '</tr>',
                            '<tr>' +
                            '<td class="header">Material</td>' +
                            '<td>{material}</td>' +
                            '</tr>',
                            '<tr>' +
                            '<td class="header">Scope</td>' +
                            '<td>{scope}</td>' +
                            '</tr>',
                            '<tr>' +
                            '<td class="header">Type</td>' +
                            '<td>{type}</td>' +
                            '</tr>',
                            '<tr>' +
                            '<td class="header">Sources</td>' +
                            '<td>{sources}</td>' +
                            '</tr>',
                            '<tr>' +
                            '<td class="header">Description</td>' +
                            '<td>{description}</td>' +
                            '</tr>',
                        '</table>'
                    ),
                    margin: '5 5 5 10'
                }

            ]
        });

        return filePanel;

    },


    _createFilesPanel: function (files) {
        var filePanels = [];
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            filePanels.push(this._createFilePanel(file));
        }

        var filesContainer = Ext.create('Ext.container.Container', {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            overflowY: true,
            padding: 10,
            items: filePanels

        });

        var studyPanel = Ext.create('Ext.container.Container', {
            items: [
                filesContainer
            ]
        });
        return studyPanel;

    },
    _createFilePanel: function (file) {

        var filePanel = Ext.create('Ext.container.Container', {
            layout: 'vbox',
            items: [
                {
                    xtype: 'box',
                    cls: 'eva-header-5',
                    margin: '5 5 5 10',
                    html: file.fileName
                },
                {
                    xtype: 'container',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'container',
                            data: file.stats,
                            tpl: new Ext.XTemplate(
                                    '<table class="eva-stats-table">' +
                                    '<tr>' +
                                    '<td class="header">Variants count:</td>' +
                                    '<td>{variantsCount}</td>' +
                                    '</tr>',
                                    '<tr>' +
                                    '<td class="header">Samples count:</td>' +
                                    '<td>{samplesCount}</td>' +
                                    '</tr>',
                                    '<tr>' +
                                    '<td class="header">SNPs count:</td>' +
                                    '<td>{snpsCount}</td>' +
                                    '</tr>',
                                    '<tr>' +
                                    '<td class="header">Indels count:</td>' +
                                    '<td>{indelsCount}</td>' +
                                    '</tr>',
                                    '<tr>' +
                                    '<td class="header">Pass count:</td>' +
                                    '<td>{passCount}</td>' +
                                    '</tr>',
                                    '<tr>' +
                                    '<td class="header">Ti/Tv Ratio:</td>' +
                                    '<td>{[this.titv(values)]}</td>' +
                                    '</tr>',
                                    '<tr>' +
                                    '<td class="header">Mean quality:</td>' +
                                    '<td>{meanQuality}</td>' +
                                    '</tr>',
                                '</table>', {
                                    titv: function (values) {
                                        var res = values.transitionsCount / values.transversionsCount;
                                        return res.toFixed(2);
                                    }
                                }
                            ),
                            margin: '5 5 5 10'
                        }
                    ]
                }

            ]
        });
        return filePanel;
    },
    setLoading: function (loading) {
        this.panel.setLoading(loading);
    }
};

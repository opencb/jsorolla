function VariantStudyBrowserPanel(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("VariantStudyBrowserPanel");

    this.target;
    this.title = "Study Browser";
    this.height = 800;
    this.autoRender = true;
    this.studies = [];

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
//        this.panel.removeAll(true);
//        var studiesPanels = [];
//        for (var i = 0; i < studies.length; i++) {
//            var study = studies[i];
//            studiesPanels.push(this._createStudyPanel(study));
//        }
//        this.panel.add(studiesPanels);
//        this.studiesStore.loadRawData(studies);

    },
    _createPanel: function () {
        var _this = this;
        this.studiesStore = Ext.create('Ext.data.Store', {
            fields: ["projectId", "alias", "title"],
            data: [
                {projectId: "PRJEB4019", alias: "1000g", title: "1000 Genomes"},
                {projectId: "PRJEB5439", alias: "evs", title: "Exome Variant Server NHLBI Exome Sequencing Project"},
                {projectId: "PRJEB5829", alias: "gonl", title: "Genome of the Netherlands (GoNL) Release 5"},
                {projectId: "PRJEB6040", alias: "uk10k", title: "UK10K"},
                {projectId: "PRJEB6042", alias: "geuvadis", title: "GEUVADIS Genetic European Variation in Disease"}
            ]
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
                    cls: 'eva-header-3',
                    margin: '0 0 25 0'
                },
                {
                    xtype: 'box',
                    html: 'Studies',
                    cls: 'eva-header-3',
//                    margin: '0 0 5 0'
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
                            var url = "http://wwwdev.ebi.ac.uk/eva/webservices/rest/v1/studies/" + record.get("projectId") + "/summary"
                            $.ajax({
                                url: url,
                                dataType: 'json',
                                async: false,
                                success: function (response, textStatus, jqXHR) {
                                    var data = (response !== undefined && response.response.length > 0 ) ? response.response[0].result[0] : [];

                                    var studyPanel = _this._createStudyPanel(data);

                                    $.ajax({
                                        url: "http://wwwdev.ebi.ac.uk/eva/webservices/rest/v1/studies/" + record.get("alias") + "/files",
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


//                                    for (var i = 0; i < data.length; i++) {
//                                        var proj = data[i];
//                                        res.push(proj);
//                                    }

                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    console.log('Error loading studies');
                                }
                            });
//                            console.log(record.data);
//                            console.log(record.data.id);
//                            _this.trigger('item:click', {sender: _this, item: record});
                        },
                        itemcontextmenu: function (este, record, item, index, e) {
//                            e.stopEvent();
//                            var event = {sender: _this, record: record, originalEvent: e};
//                            _this._itemContextMenuHandler(event);
//                            _this.trigger('item:contextmenu', event);
//                            return false;
                        }
                    }
                })
            ]
        });

        this.rightPanel = Ext.create('Ext.container.Container', {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [

            ]
        });

        var panel = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [
                this.leftPanel,
                {
                    xtype:'container',
                    flex: 4,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items:[
                        {
                            xtype: 'box',
                            html: 'Information',
                            cls: 'eva-header-3'
                        },
                        this.rightPanel
                    ]
                }

            ]
        });
//        if (this.studies.length > 0) {
//            this.load(this.studies);
//        }

        return panel;
    },
//    _createStudyPanel: function (study) {
//
//        var filePanels = [];
//        for (var i = 0; i < study.files.length; i++) {
//            var file = study.files[i];
//            filePanels.push(this._createStudyPanel(file));
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
//                {
//                    xtype: 'box',
//                    cls: 'eva-header-3 ocb-pointer',
//                    html: study.studyName,
//                    listeners: {
//                        afterrender: function () {
//                            this.getEl().on('click', function () {
//                                if (filesContainer.isHidden()) {
//                                    filesContainer.show();
//                                } else {
//                                    filesContainer.hide();
//                                }
//                            });
//                        }
//                    }
//                },
//                filesContainer
//            ]
//        });
//        return studyPanel;
//
//    },
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
//                {
//                    xtype: 'box',
//                    cls: 'eva-header-3',
//                    overCls:'eva-pointer eva-underline',
//                    html: file.studyId,
//                    listeners: {
//                        afterrender: function () {
//                            this.getEl().on('click', function () {
//                                if (filesContainer.isHidden()) {
//                                    filesContainer.show();
//                                } else {
//                                    filesContainer.hide();
//                                }
//                            });
//                        }
//                    }
//                },
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
//                        {
//                            xtype: 'container',
//                            data: file,
//                            tpl: new Ext.XTemplate(
//                                    '<table class="eva-stats-table">' +
//                                    '<tr>' +
//                                    '<td class="header">File name:</td>' +
//                                    '<td>{fileName}</td>' +
//                                    '</tr>',
//                                    '<tr>' +
//                                    '<td class="header">Study name:</td>' +
//                                    '<td>{studyName}</td>' +
//                                    '</tr>',
//                                '</table>'
//                            ),
//                            margin: '5 5 5 10'
//                        },
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
                        },
                    ]
                },

            ]
        });

        return filePanel;

    },

    setLoading: function (loading) {
        this.panel.setLoading(loading);
    }
};

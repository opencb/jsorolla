function VariantFileBrowserPanel(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("VariantFileBrowserPanel");

    this.target;
    this.title = "File Browser";
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

VariantFileBrowserPanel.prototype = {
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
        this.panel.removeAll(true);
        var studiesPanels = [];
        for (var i = 0; i < studies.length; i++) {
            var study = studies[i];
            studiesPanels.push(this._createStudyPanel(study));
        }
        this.panel.add(studiesPanels);
    },
    _createPanel: function () {
        var panel = Ext.create('Ext.container.Container', {
            layout: {
                type: 'vbox',
                align: 'stretch'
            }
        });
        if (this.studies.length > 0) {
            this.load(this.studies);
        }

        return panel;
    },
    _createStudyPanel: function (study) {


        var filePanels = [];
        for (var i = 0; i < study.files.length; i++) {
            var file = study.files[i];
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
                {
                    xtype: 'box',
                    cls: 'eva-header-3',
                    overCls:'eva-pointer eva-underline',
                    html: study.studyName,
                    listeners: {
                        afterrender: function () {
                            this.getEl().on('click', function () {
                                if (filesContainer.isHidden()) {
                                    filesContainer.show();
                                } else {
                                    filesContainer.hide();
                                }
                            });
                        }
                    }
                },
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
    setLoading: function(loading){
        this.panel.setLoading(loading);
    }
};

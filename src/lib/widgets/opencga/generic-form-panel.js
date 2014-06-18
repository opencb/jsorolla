/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

function GenericFormPanel(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    this.analysis;
    this.form = null;
    this.paramsWS = {};
    this.testing = false;
    this.closable = true;
    this.minimizable = true;
    this.labelWidth = 150;

    this.type;
    this.style;
    this.title;
    this.resizable;
    this.width = 500;
    this.height;
    this.border = true;
    this.formBorder = true;
    this.taskbar;
    this.bodyPadding;
    this.headerConfig;
    this.buttonConfig = {
        width: 200,
        height: 30
    };

    _.extend(this, args);


    this.runAnalysisSuccess = function (response) {
        if (response.errorMsg !== '') {
            Ext.Msg.show({
                title: "Error",
                msg: response.errorMsg,
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR
            });
        } else {
            Utils.msg('Job Launched', 'It will be listed soon');
            if (!_this.testing) {
                _this.clean();
            }
            console.log(response);
            if (_this.type == "window") {
                _this.panel.hide();
            }
        }
    };
    //events attachments
    this.on(this.handlers);

}

GenericFormPanel.prototype.draw = function () {
    var _this = this;
    if (this.panel == null) {
        if (this.type == "window") {
            this.panel = Ext.create('Ext.window.Window', {
                title: this.title,
                closable: this.closable,
                minimizable: this.minimizable,
                resizable: this.resizable,
//                bodyStyle: 'background:white;',
//                overflowY: 'auto',
//                taskbar: this.taskbar,
                layout: 'fit',
                items: {
                    border: 0,
                    items: [this.getForm()]
                },
                listeners: {
                    minimize: function () {
                        this.hide();
                    },
                    close: function () {
                        this.hide();
                    }
                }
            });
        }
        else {
            this.panel = Ext.create('Ext.panel.Panel', {
                title: this.title,
                closable: this.closable,
//                defaults: {margin: 30},
                style: this.style,
                overflowY: 'auto',
                items: [this.getForm()],
                border: this.border,
                bodyPadding: this.bodyPadding,
                header: this.headerConfig,
                listeners: {
                    beforeclose: function () {
                        _this.panel.up().remove(_this.panel, false);
                        console.log('closing');
                        return false;
                    }
                }
            });
        }
        this.panelId = this.panel.getId();
    }
    return this.panel;
};


GenericFormPanel.prototype.show = function () {
    if (typeof this.panel !== 'undefined') {
        this.panel.show();
    }
};

GenericFormPanel.prototype.hide = function () {
    if (typeof this.panel !== 'undefined') {
        this.panel.hide();
    }
};

GenericFormPanel.prototype.getForm = function () {
    if (this.form == null) {
        var items = this.getPanels();
        items.push(this.getJobPanel());

        this.form = Ext.create('Ext.form.Panel', {
            border: 0,
            width: this.width,
            trackResetOnLoad: true,
            padding: 5,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: items,
            bbar: {
                layout: {
                    pack: 'end'
                },
                items: [
                    this.getRunButton()
                ]
            }
        });
    }

    return this.form;
};

GenericFormPanel.prototype.getPanels = function () {
    // To be implemented in inner class
};

GenericFormPanel.prototype.getJobPanel = function () {
    var _this = this;
    this.jobNameField = Ext.create('Ext.form.field.Text', {
        id: this.id + "jobname",
        name: "jobname",
        fieldLabel: 'Name',
        labelWidth: this.labelWidth,
        emptyText: "Job name",
        allowBlank: false
    });

    this.jobDescriptionField = Ext.create('Ext.form.field.TextArea', {
        id: this.id + "jobdescription",
        name: "jobdescription",
        labelWidth: this.labelWidth,
        fieldLabel: 'Description',
        emptyText: "Description"
    });

//	var bucketList= Ext.create('Ext.data.Store', {
//		fields: ['value', 'name'],
//		data : [
//		        {"value":"default", "name":"Default"}
//		       ]
//	});
//	var jobDestinationBucket = this.createCombobox("jobdestinationbucket", "Destination bucket", bucketList, 0, 100);
    var jobFolder = this.createOpencgaBrowserCmp({
        id: Utils.genId('jobFolder'),
        fieldLabel: 'Folder',
        dataParamName: 'outdir',
        mode: 'folderSelection',
        defaultFileLabel: 'Default job folder',
        allowBlank: true
    });

    var jobPanel = Ext.create('Ext.panel.Panel', {
        title: 'Job information',
        header: this.headerFormConfig,
        border: this.formBorder,
        bodyPadding: 10,
        defaults: {margin: '5 0 0 0'},
        buttonAlign: 'center',
        items: [this.jobNameField, this.jobDescriptionField/*, jobFolder*/] //TODO Job folder is not fully supported,
    });

    return jobPanel;
};

GenericFormPanel.prototype.getRunButton = function () {
    var _this = this;
    return Ext.create('Ext.button.Button', {
        text: 'Run',
        width: this.buttonConfig.width,
        height: this.buttonConfig.height,
        disabled: true,
        cls: 'btn btn-default',
        formBind: true, // only enabled if the form is valid
        handler: function () {
            _this.paramsWS = {};
            var formParams = _this.getForm().getForm().getValues();
            for (var param in formParams) {
                _this.paramsWS[param] = formParams[param];
            }
            _this.beforeRun();
            _this.run();
        }
    });
};

GenericFormPanel.prototype.setAccountParams = function () {
    this.paramsWS["sessionid"] = $.cookie('bioinfo_sid');
    this.paramsWS["accountid"] = $.cookie('bioinfo_account');
};

GenericFormPanel.prototype.beforeRun = function () {
    // To be implemented in inner class

};

GenericFormPanel.prototype.run = function () {

    delete this.paramsWS['browseFieldLabel'];

    this.setAccountParams();

    if (this.paramsWS['outdir'] === '') {
        delete this.paramsWS['outdir']
    }

    if (!this.testing) {
        OpencgaManager.runAnalysis({
            analysis: this.analysis,
            paramsWS: this.paramsWS,
            success: this.runAnalysisSuccess
        });
        this.trigger('after:run', {sender: this});
    } else {
        console.log("@@ Watch out!!! testing flag is on, so job will not launched.")
    }
    //debug
    console.log("@@ Form paramsWS")
    console.log(this.paramsWS);

};

GenericFormPanel.prototype.clean = function () {
    var items = this.form.query('field');
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        item.reset();
    }
};


/////////////////////////////////////////
/////////////////////////////////////////
//Functions to create sencha components//
/////////////////////////////////////////
/////////////////////////////////////////
GenericFormPanel.prototype.createCombobox = function (name, label, data, defaultValue, labelWidth, margin) {
    return Ext.create('Ext.form.field.ComboBox', {
        id: name,
        name: name,
        fieldLabel: label,
        store: data,
        queryMode: 'local',
        displayField: 'name',
        valueField: 'value',
        value: data.getAt(defaultValue).get('value'),
        labelWidth: labelWidth,
        margin: margin,
        editable: false,
        allowBlank: false
    });
};

GenericFormPanel.prototype.createCheckBox = function (name, label, checked, margin, disabled, handler) {
    return Ext.create('Ext.form.field.Checkbox', {
        id: name,
        name: name,
        boxLabel: label,
        checked: (checked || false),
        disabled: disabled,
        margin: (margin || '0 0 0 0')
    });
};

GenericFormPanel.prototype.createRadio = function (name, group, checked, hidden) {
    var cb = Ext.create('Ext.form.field.Radio', {
        id: name + "_" + this.id,
        boxLabel: name,
        inputValue: name,
        checked: checked,
        name: group,
        hidden: hidden
    });
    return cb;
};

GenericFormPanel.prototype.createLabel = function (text, margin) {
    var label = Ext.create('Ext.form.Label', {
        id: text + "_" + this.id,
        margin: (margin || "15 0 0 0"),
        html: '<span class="emph">' + text + '</span>'
    });
    return label;
};
GenericFormPanel.prototype.createTextFields = function (name) {
    var tb = Ext.create('Ext.form.field.Text', {
        id: name + "_" + this.id,
        fieldLabel: name,
        name: name
//		allowBlank: false
    });
    return tb;
};


GenericFormPanel.prototype.createOpencgaBrowserCmp = function (args) {//fieldLabel, dataParamName, mode, btnMargin, defaultFileLabel
    var _this = this;

    var field = Ext.create('Ext.form.field.Text', {
        id: args.id,
        fieldLabel: args.fieldLabel,
        labelWidth: _this.labelWidth,
        editable: false,
        name: 'browseFieldLabel',
        value: args.defaultFileLabel || "browse file...",
        allowBlank: (args.allowBlank || false),
        listeners: {
            focus: function () {
                if (args.beforeClick != null) {
                    args.beforeClick(args);
                }
                _this.opencgaBrowserWidget.once('select', function (response) {
                    if (typeof response !== 'undefined') {
                        field.setValue(response.id);
                        hiddenField.setValue(response.pathQuery);//this is send to the ws
                        if (args.onSelect) {
                            args.onSelect(response);
                        }
                    }
                });
                _this.opencgaBrowserWidget.show({mode: args.mode, allowedTypes: args.allowedTypes});
            }
        }
    });

    //not shown, just for validation
    var hiddenField = Ext.create('Ext.form.field.Text', {
        id: args.id + 'hidden',
        editable: false,
        hidden: true,
        name: args.dataParamName,
        value: "",
        allowBlank: (args.allowBlank || false)
    });

    return Ext.create('Ext.form.FieldContainer', {
        hidden: args.hidden,
        items: [
            field,
            hiddenField
        ]
    });
};

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

function GenericFormPanel(analysis) {
    this.analysis = analysis;
    this.form = null;
    this.paramsWS = {};
    this.opencgaManager = new OpencgaManager();
    this.panelId = this.analysis + "-FormPanel";

    this.opencgaManager.onRunAnalysis.addEventListener(function (sender, response) {
        if (response.data.indexOf("ERROR") != -1) {
            Ext.Msg.show({
                title: "Error",
                msg: response.data,
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR
            });
        }
        else console.log(response.data);
    });
}

GenericFormPanel.prototype.draw = function (args) {
    if (args != null && args.type == "window") {
        Ext.create('Ext.ux.Window', {
            title: args.title || "",
            resizable: args.resizable || false,
            width: args.width || 500,
            height: args.height,
            overflowY: 'auto',
            taskbar: args.taskbar,
            items: this.getForm()
        }).show();
    }
    else {
        return Ext.create('Ext.container.Container', {
            id: this.panelId,
            title: args.title,
            closable: true,
            defaults: {margin: 30},
            autoScroll: true,
            items: this.getForm()
        });
    }
};

GenericFormPanel.prototype.getForm = function () {
    if (this.form == null) {
        var items = this.getPanels();
        items.push(this.getJobPanel());
        items.push(this.getRunButton());

        this.form = Ext.create('Ext.form.Panel', {
            border: false,
            bodyPadding: "5",
            layout: 'vbox',
            items: items
        });
    }

    return this.form;
};

GenericFormPanel.prototype.getPanels = function () {
    // To be implemented in inner class
};

GenericFormPanel.prototype.getJobPanel = function () {
    var _this = this;
    var jobNameField = Ext.create('Ext.form.field.Text', {
        id: "jobname",
        name: "jobname",
        fieldLabel: 'Name',
        emptyText: "Job name",
        allowBlank: false,
        margin: '5 0 0 5'
    });

    var jobDescriptionField = Ext.create('Ext.form.field.TextArea', {
        id: "jobdescription",
        name: "jobdescription",
        fieldLabel: 'Description',
        emptyText: "Description",
        margin: '5 0 0 5'
    });

//	var bucketList= Ext.create('Ext.data.Store', {
//		fields: ['value', 'name'],
//		data : [
//		        {"value":"default", "name":"Default"}
//		       ]
//	});
//	var jobDestinationBucket = this.createCombobox("jobdestinationbucket", "Destination bucket", bucketList, 0, 100);
    var jobFolder = this.createOpencgaBrowserCmp({
        fieldLabel: 'Folder:',
        dataParamName: 'outdir',
        mode: 'folderSelection',
        btnMargin: '0 0 0 66',
        defaultFileLabel: 'Default job folder',
        allowBlank: true
    });

    var jobPanel = Ext.create('Ext.panel.Panel', {
        title: 'Job',
        border: true,
        bodyPadding: "5",
        margin: "0 0 5 0",
        width: "99%",
        buttonAlign: 'center',
        items: [jobNameField, jobDescriptionField, jobFolder]
    });

    return jobPanel;
};

GenericFormPanel.prototype.getRunButton = function () {
    var _this = this;
    return Ext.create('Ext.button.Button', {
        text: 'Run',
        width: 300,
        height: 35,
        disabled: true,
        formBind: true, // only enabled if the form is valid
        handler: function () {
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
    this.setAccountParams();
    (this.paramsWS['outdir'] === '') ? delete this.paramsWS['outdir'] : console.log(this.paramsWS['outdir']);
    this.opencgaManager.runAnalysis(this.analysis, this.paramsWS);
    Ext.example.msg('Job Launched', 'It will be listed soon');
    //debug
    console.log(this.paramsWS);
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
    var btnBrowse = Ext.create('Ext.button.Button', {
        text: 'Browse...',
        margin: args.btnMargin || '0 0 0 10',
        handler: function () {
            _this.opencgaBrowserWidget.allowedTypes = args.allowedTypes;
            if(args.beforeClick != null){
                args.beforeClick();
            }
            var listenerIdx = _this.opencgaBrowserWidget.onSelect.addEventListener(function (sender, response) {
                fileSelectedLabel.setText('<span class="emph">' + response.bucketId + '/' + response.id + '</span>', false);
                hiddenField.setValue(response.bucketId + ':' + response.id.replace(/\//g, ":"));//this is send to the ws
                _this.opencgaBrowserWidget.onSelect.removeEventListener(listenerIdx);
            });
            _this.opencgaBrowserWidget.draw(args.mode);
        }
    });

    var fileSelectedLabel = Ext.create('Ext.form.Label', {
        id: args.dataParamName,
        text: args.defaultFileLabel || "No file selected",
        margin: '5 0 0 15'
    });

    //not shown, just for validation
    var hiddenField = Ext.create('Ext.form.field.Text', {
        id: args.dataParamName+'hidden',
        name: args.dataParamName,
        hidden: true,
        allowBlank: (args.allowBlank || false),
        margin: '5 0 0 15'
    });

    return Ext.create('Ext.container.Container', {
//		bodyPadding:10,
//		defaults:{margin:'5 0 0 5'},
        margin: '5 0 5 0',
        items: [
            {xtype: 'label', text: args.fieldLabel, margin: '5 0 0 5'},
            btnBrowse,
            fileSelectedLabel,
            hiddenField
        ]
    });
};

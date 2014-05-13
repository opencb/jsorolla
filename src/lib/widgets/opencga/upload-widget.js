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

function UploadWidget(args) {
    var _this = this;
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("uploadWidget");

    this.targetId = null;
    this.suiteId = null;
    this.chunkedUpload = false;
    this.enableTextMode = true;

    if (typeof args !== 'undefined') {
        this.targetId = args.targetId || this.targetId;
        this.suiteId = args.suiteId || this.suiteId;
        this.opencgaBrowserWidget = args.opencgaBrowserWidget || this.opencgaBrowserWidget;
        this.chunkedUpload = args.chunkedUpload || this.chunkedUpload;
    }
    this.uploadObjectToBucketSuccess = function (response) {
        if (response.errorMsg === '') {
            Utils.msg('Object upload', '</span class="emph">' + response.result[0].msg + '</span>');
            _this.uploadComplete(response.result[0].msg);
        } else {
            Ext.Msg.alert('Object upload', response.errorMsg);
            _this.uploadFailed(response.errorMsg);
        }
        _this.trigger('object:upload', {sender: _this, data: response.result[0].msg });
    };

    this.uploadButtonId = this.id + '_uploadButton';
    this.uploadFieldId = this.id + '_uploadField';

    this.selectedDataType = null;

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

}

//UploadWidget.prototype.getsdf = function(){
//	return this.id+'_uploadButton';
//};

UploadWidget.prototype = {
    getTypeValidation: function (types) {
        return function (filename) {
            var regex = new RegExp('^.*\\.(' + types + ')$', 'i');
            return regex.test(filename);
        }
    }
};


UploadWidget.prototype.draw = function (opencgaLocation) {
    this.opencgaLocation = opencgaLocation;
    var dataTypes = {
        "9": [
            { text: "ID List", children: [
                { text: "SNP", tag: "idlist:snp"},//el tag es para introducirlo en la base de datos al subir los datos
                { text: "Gene/Transcript", tag: "idlist:gene:transcript"}//si son varios van separados por ->  :
            ] },
            { text: "Feature", children: [
                { text: "VCF 4.0", tag: "vcf", validate: this.getTypeValidation('vcf')},
//		                { text: "Tabix index", tag:"tbi"},
                { text: "GFF2", tag: "gff2"},
                { text: "GFF3", tag: "gff3"},
                { text: "GTF", tag: "gtf"},
                { text: "BED", tag: "bed"},
                { text: "BAM", tag: "bam", validate: this.getTypeValidation('bam')},
                { text: "BAI", tag: "bai", validate: this.getTypeValidation('bai')},
                { text: "Expression", tag: "expression"}
            ] }
        ],
        "6": [
            { text: "Feature", children: [
                { text: "VCF 4.0", tag: "vcf"},
                { text: "GFF2", tag: "gff2"},
                { text: "GFF3", tag: "gff3"},
                { text: "GTF", tag: "gtf"},
                { text: "BED", tag: "bed"},
                { text: "PED", tag: "ped"}
            ] }
        ],
        "11": [
            {text: "Annotation", tag: "annotation"},
            {text: "ID List", children: [
                { text: "Gene", tag: "idlist:gene"    },
                { text: "Ranked", tag: "ranked"    }
            ]
            }
        ],
        "12": [
            {text: "Abundances", tag: "abundances"}
        ],
        "100": [
            {text: "Sequence", tag: "sequence"}
        ],
        "22": [
            {text: "Tabbed text file", tag: "txt", validate: this.getTypeValidation('txt|text')},
            {text: "CEL compressed file", tag: "cel", validate: this.getTypeValidation('zip|tar|tar.gz|tgz')}
        ],
        "85": [
            { text: "Feature", children: [
                { text: "VCF 4.0", tag: "vcf", validate: this.getTypeValidation('vcf')},
                { text: "PED", tag: "ped", validate: this.getTypeValidation('ped')}
            ] }
        ],
        "cellmaps": [
            { text: "Network", children: [
                { text: "SIF", tag: "sif", validate: this.getTypeValidation('sif')},
                { text: "Expresion matrix", tag: "txt", validate: this.getTypeValidation('txt')},
                { text: "Text", tag: "txt", validate: this.getTypeValidation('txt')}
            ] }
        ]
    };

    if (typeof dataTypes[this.suiteId] === 'undefined') {
        this.render([
            {text: "No data types defined"}
        ]);
    } else {
        this.checkDataTypes(dataTypes[this.suiteId]);
        this.render(dataTypes[this.suiteId]);
    }

//    switch (this.suiteId) {
//        case 9:
//            this.checkDataTypes(dataTypes["9"]);
//            this.render(dataTypes["9"]);
//            break;
//        case 6:
//            this.checkDataTypes(dataTypes["6"]);
//            this.render(dataTypes["6"]);
//            break;
//        case 11:
//            this.checkDataTypes(dataTypes["11"]);
//            this.render(dataTypes["11"]);
//            break;
//        case 12:
//            this.checkDataTypes(dataTypes["12"]);
//            this.render(dataTypes["12"]);
//            break;
//        case 22:
//            this.checkDataTypes(dataTypes["22"]);
//            this.render(dataTypes["22"]);
//            break;
//        case 85:
//            this.checkDataTypes(dataTypes["85"]);
//            this.render(dataTypes["85"]);
//            break;
//        case 100:
//            this.checkDataTypes(dataTypes["100"]);
//            this.render(dataTypes["100"]);
//            break;
//        case "cellmaps":
//            this.checkDataTypes(dataTypes["cellmaps"]);
//            this.render(dataTypes["cellmaps"]);
//            break;
//    }
};

UploadWidget.prototype.clean = function () {
    if (this.panel != null) {
        this.panel.destroy();
        delete this.panel;
        console.log(this.id + ' PANEL DELETED');
    }
};

UploadWidget.prototype.checkDataTypes = function (dataTypes) {
    for (var i = 0; i < dataTypes.length; i++) {
        if (dataTypes[i]["children"] != null) {
            dataTypes[i]["iconCls"] = 'icon-box';
            dataTypes[i]["expanded"] = true;
            this.checkDataTypes(dataTypes[i]["children"]);
        } else {
            dataTypes[i]["iconCls"] = 'icon-blue-box';
            dataTypes[i]["leaf"] = true;
        }
    }
};

UploadWidget.prototype.render = function (dataTypes) {
    var _this = this;
    if (this.panel == null) {
        var store = Ext.create('Ext.data.TreeStore', {
            root: {
                expanded: true,
                text: "Data type",
                children: dataTypes
            }
        });
//        var height = Object.keys(store.tree.nodeHash).length * 23;
//        if (height < 250) {
//            height = 250;
//        }

        var height = 400;

        var pan1Width = 250;
        var pan1 = Ext.create('Ext.tree.Panel', {
            title: 'Select your data type',
            bodyPadding: '10 0 0 0',
            height: height,
            border: false,
            cls: 'ocb-border-right-lightgrey',
            width: pan1Width,
            store: store,
            useArrows: true,
            rootVisible: false,
            listeners: {
                scope: this,
                itemclick: function (este, record) {
                    if (record.data.leaf) {
                        this.selectedDataType = record.data.tag;
                        this.selectedDataTypeObj = record.data;
                        this.dataTypeLabel.update('<span class="info">Type:</span><span class="ok"> OK </span>');
                    } else {
                        this.selectedDataType = undefined;
                        this.selectedDataTypeObj = undefined;
                        this.dataTypeLabel.update('<span class="info">Select a data type</span><span class="err"> !!!</span>');
                    }
                    this.validate();
                }
            }
        });

        this.nameField = Ext.create('Ext.form.field.Text', {
            name: 'datalabel',
            fieldLabel: 'Data name',
            labelWidth: 110,
            msgTarget: 'side',
            //allowBlank: false,
            enableKeyEvents: true,
            listeners: {
                scope: this,
                change: function (el) {
                    if (el.getValue() != "") {
                        this.dataNameLabel.update('<span class="info">Name:</span><span class="ok"> OK </span>');
                    } else {
                        this.dataNameLabel.update('<span class="info">Enter the data name</span><span class="err"> !!!</span>');
                    }
                    this.validate();
                }
            }
        });
        this.textArea = Ext.create('Ext.form.field.TextArea', {
            name: 'datadescription',
            fieldLabel: 'Data description',
            labelWidth: 110,
            msgTarget: 'side'
        });
        this.organizationField = Ext.create('Ext.form.field.Text', {
            name: 'organization',
            fieldLabel: 'Organization',
            labelWidth: 110,
            msgTarget: 'side'
        });
        this.responsableField = Ext.create('Ext.form.field.Text', {
            name: 'responsable',
            fieldLabel: 'Responsible',
            labelWidth: 110,
            msgTarget: 'side'
        });
        this.acquisitiondate = Ext.create('Ext.form.field.Text', {
            name: 'acquisitiondate',
            fieldLabel: 'Acquisition date',
            labelWidth: 110,
            msgTarget: 'side'
        });

        var pan2Width = 350;
        var pan2 = Ext.create('Ext.panel.Panel', {
            title: 'Some aditional data',
            width: pan2Width,
            border: false,
//            cls: 'panel-border-top',
            height: height,
            bodyPadding: 15,
            items: [this.nameField, this.textArea, this.organizationField, this.responsableField, this.acquisitiondate]

        });

        this.dataTypeLabel = Ext.create('Ext.Component', {
            html: '<span class="info">Select a data type</span>'
        });
        this.dataNameLabel = Ext.create('Ext.Component', {
            html: '<span class="info">Enter the data name</span>'
        });
        this.dataFieldLabel = Ext.create('Ext.Component', {
            html: '<span class="info">Select a data file</span>'
        });
        this.originCheck = Ext.create('Ext.form.field.Checkbox', {
            xtype: 'checkbox',
            hidden: !this.enableTextMode,
            boxLabel: 'Text mode',
            margin: '0 0 0 0',
            listeners: {
                scope: this,
                change: function () {
                    if (this.originCheck.getValue()) {
                        this.dataFieldLabel.update('<span class="ok">' + this.editor.getValue().length + '</span><span class="info"> chars</span>');
                        this.uploadField.hide();
                        this.editor.show();
                        this.uploadField.setRawValue(null);
                        this.pan3.setHeight(100);
                    } else {
                        this.dataFieldLabel.update('<span class="info">Select a data file</span>');
                        this.editor.hide();
                        this.uploadField.show();
                        this.editor.setRawValue(null);
                        this.pan3.setHeight(55);
                    }
                    this.validate();
                }
            }
        });
        var uploadButton = Ext.create('Ext.button.Button', {
            id: this.uploadButtonId,
            text: 'Upload',
            disabled: true,
            handler: function () {
//				_this.uploadMsg =  Ext.Msg.show({
//					 closable:false,
//				     title:'Uploading file',
//				     msg: 'Please wait...'
//				});
                if (_this.chunkedUpload) {
                    _this.uploadFile2();
                } else {
                    _this.uploadFile();
                }
            }
        });


        this.editor = Ext.create('Ext.form.field.TextArea', {
            xtype: 'textarea',
            width: 602,
            flex: 1,
            height: 100,
            emptyText: 'Paste or write your file directly',
            hidden: true,
            name: 'file',
            margin: "-1",
            enableKeyEvents: true,
            listeners: {
                scope: this,
                change: function () {
                    this.dataFieldLabel.update('<span class="ok">' + this.editor.getValue().length + '</span> <span class="info"> chars</span>');
                    this.validate();
                }

            }
        });


        this.pan3 = Ext.create('Ext.panel.Panel', {
//            title: 'File origin',
            colspan: 2,
            border: false,
            width: pan1Width + pan2Width,
            height: 55,
//		    bodyStyle:{"background-color":"#d3e1f1"},
            items: [this.editor]
        });
        this.createUploadField();

        this.panel = Ext.create('Ext.window.Window', {
            title: 'Upload a data file',// + ' -  <span class="err">ZIP files will be allowed shortly</span>',
            iconCls: 'icon-upload',
            resizable: false,
//		    minimizable :true,
            constrain: true,
            closable: false,
            modal: true,
            items: {
                border: 0,
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                items: [
                    this.pan3,
                    {
                        xtype: 'container',
                        layout: {
                            type: 'hbox',
                            align: 'stretch'
                        },
                        items: [pan1, pan2]
                    },
                ],
                dockedItems: [
                    {
                        xtype: 'toolbar',
                        dock: 'bottom',
                        layout: {
                            pack: 'end'
                        },
                        defaults: {
                            width: 100
                        },
                        items: [
                            {
                                text: "Close",
                                handler: function () {
                                    _this.panel.minimize();
                                }
                            },
                            uploadButton
                        ]
                    },
                    {
                        xtype: 'toolbar',
                        dock: 'bottom',
                        items: [this.originCheck, '->', this.dataTypeLabel, /*this.dataNameLabel,'-',*/this.dataFieldLabel, ]
                    },
                ]
            },
            listeners: {
                scope: this,
                minimize: function () {
                    this.panel.hide();
                    this.uploadField.setRawValue(null);
                    this.editor.setRawValue(null);
                    this.originCheck.setValue(false);
                }
            }
        });

    }
    this.panel.show();
};


UploadWidget.prototype.createUploadField = function () {
    this.uploadField = Ext.create('Ext.form.field.File', {
        id: this.uploadFieldId,
        xtype: 'filefield',
        name: 'file',
        msgTarget: 'side',
        emptyText: 'Choose a file',
        margin:'12 0 0 12',
        width: 500,
        allowBlank: false,
        buttonText: 'Upload local file...',
        buttonAlign: 'left',
        rtl: false,
        listeners: {
            scope: this,
            change: function () {
                this.fileSelected();
                this.validate();
            }
        }
    });
    this.pan3.add(this.uploadField);
};

UploadWidget.prototype.validate = function () {
//	console.log(this.selectedDataType != null);
//	console.log(this.nameField.getValue() !="");
//	console.log((this.uploadField.getRawValue()!="" || this.editor.getValue()!=""));

    var extensionValid = true;
    if (typeof this.selectedDataTypeObj !== 'undefined') {
        if (typeof this.selectedDataTypeObj.validate !== 'undefined') {
            extensionValid = this.selectedDataTypeObj.validate(Ext.getCmp(this.uploadFieldId).getValue());
        }
    }

    if (extensionValid && this.selectedDataType != null /*&& this.nameField.getValue() !=""*/ && (this.uploadField.getRawValue() != "" || this.editor.getValue() != "")) {
        Ext.getCmp(this.uploadButtonId).enable();
        this.dataTypeLabel.update('<span class="info">Type:</span><span class="ok"> OK </span>');
    } else {
        Ext.getCmp(this.uploadButtonId).disable();
        this.dataTypeLabel.update('<span class="info">Type:</span><span class="err"> Not valid </span>');
    }

    if (this.originCheck.getValue()) {
        if (this.nameField.getValue() == '') {
            Ext.getCmp(this.uploadButtonId).disable();
        } else {
            Ext.getCmp(this.uploadButtonId).enable();
        }
    }
};


UploadWidget.prototype.fileSelected = function () {
    var inputId = this.uploadField.fileInputEl.id;
    var file = document.getElementById(inputId).files[0];
    if (file) {
        var fileSize = 0;
        if (file.size > 1024 * 1024)
            fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
        else
            fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';


        this.dataFieldLabel.update('<span class="info">Size: </span><span class="ok">' + fileSize + '</span>');
//          document.getElementById('fileName').innerHTML = '<b>Name</b>: ' + file.name;
//          document.getElementById('fileSize').innerHTML = '<b>Size</b>: ' + fileSize;
//          document.getElementById('fileType').innerHTML = '<b>Type</b>: ' + file.type;
    }
};

UploadWidget.prototype.uploadFile = function () {
    var _this = this;
    Ext.getBody().mask('Uploading file...');
    this.panel.disable();

    var fd = new FormData();
    var inputFileName = null;
    if (this.originCheck.getValue()) {
        inputFileName = this.nameField.getValue();
        fd.append("file", this.editor.getValue());
    } else {
        var inputFile = document.getElementById(Ext.getCmp(this.uploadFieldId).fileInputEl.id).files[0];
        inputFileName = inputFile.name;
        fd.append("file", inputFile);
    }
    var sessionId = $.cookie('bioinfo_sid');
    var objectId = this.opencgaLocation.directory + inputFileName;
    objectId = objectId.replace(new RegExp("/", "gi"), ":");

    fd.append("name", this.nameField.getValue());
    fd.append("fileFormat", this.selectedDataType);
    fd.append("responsible", this.responsableField.getValue());
    fd.append("organization", this.organizationField.getValue());
    fd.append("date", this.acquisitiondate.getValue());
    fd.append("description", this.textArea.getValue());
    fd.append("objectid", objectId);
    fd.append("sessionid", sessionId);


    //TODO DELETE THIS
    this.objectID = this.opencgaLocation.bucketId + ":" + objectId;

    //accountid, sessionId, projectname, formData


    OpencgaManager.uploadObjectToBucket({
        accountId: $.cookie("bioinfo_account"),
        sessionId: sessionId,
        bucketId: this.opencgaLocation.bucketId,
        objectId: objectId,
        formData: fd,
        success: this.uploadObjectToBucketSuccess
    });

};

UploadWidget.prototype.uploadFile2 = function () {
    var _this = this;

    var inputFile = document.getElementById(Ext.getCmp(this.uploadFieldId).fileInputEl.id).files[0];

    var objectId = this.opencgaLocation.directory + inputFile.name;
    objectId = objectId.replace(new RegExp("/", "gi"), ":");

    var fileuploadWorker = new Worker(WORKERS_PATH + 'worker-fileupload.js');
    this.opencgaBrowserWidget.addUpload(inputFile, fileuploadWorker);
    fileuploadWorker.postMessage({
        'host': OPENCGA_HOST,
        'accountId': $.cookie("bioinfo_account"),
        'sessionId': $.cookie("bioinfo_sid"),
        'file': inputFile,
        'objectId': objectId,
        'fileFormat': this.selectedDataType,
        'bucketId': this.opencgaLocation.bucketId,
        'resume': true
    });
    this.panel.close();
};

//UploadWidget.prototype.uploadProgress = function(evt)  {
//	console.log("Progress...");
//    if (evt.lengthComputable) {
//      var percentComplete = Math.round(evt.loaded * 100 / evt.total);
//  		console.log(percentComplete);
////      document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
//    }
//    else {
//    	console.log('unable to compute');
////      document.getElementById('progressNumber').innerHTML = 'unable to compute';
//    }
//};

UploadWidget.prototype.uploadComplete = function (msg) {
    Ext.Msg.show({
        title: 'Upload status',
        msg: msg
    });
    this.panel.enable();
    Ext.getBody().unmask();
    this.panel.close();
};

UploadWidget.prototype.uploadFailed = function (response) {
    Ext.Msg.show({
        title: 'Upload status',
        msg: 'There was an error attempting to upload the file.'
    });
    this.panel.enable();
    Ext.getBody().unmask();
};
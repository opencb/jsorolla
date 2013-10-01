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

function OpencgaBrowserWidget(args) {
    var _this = this;

    _.extend(this, Backbone.Events);
    this.id = Utils.genId("uploadWidget");

    this.targetId;
    this.suiteId;
    this.chunkedUpload = false;
    this.width = 800;
    this.height = 575;
    this.title = 'Cloud data';

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render(this.targetId);
    }
}

OpencgaBrowserWidget.prototype = {
    show: function (args) {
        if (!_.isUndefined(args)) {
            this.mode = args.mode;
            this.allowedTypes = args.allowedTypes;
        }
        console.log(this.mode)
        console.log(this.allowedTypes)
        this.panel.show();
    },
    hide: function () {
        this.panel.hide();
    },
    render: function () {
        var _this = this;

        /**ID**/
        this.searchFieldId = this.id + "_searchField";

        this.createBucketSuccess = function (data) {
            if (data.indexOf("ERROR") != -1) {
                Ext.Msg.alert("Create project", "ERROR: could not create this project.");
            } else {
                _this.trigger('need:refresh', {sender: _this});
            }
            _this.panel.setLoading(false);
            Ext.getBody().unmask();
        };

        this.rendered = true;
    },
    draw: function () {
        var _this = this;
        if (!this.rendered) {
            console.info('Login Widget is not rendered yet');
            return;
        }

        /* Upload Widget */
        this.uploadWidget = this._createUploadWidget();

        /* Panel */
        this.panel = this._createPanel(this.targetId);
//        this.panel.show();
    },
    _createUploadWidget: function () {
        var _this = this;
        var uploadWidget = new UploadWidget({
            suiteId: this.suiteId,
            opencgaBrowserWidget: this,
            chunkedUpload: this.chunkedUpload,
            handlers: {
                'object:upload': function (e) {
                    if (e.data.status == 'done') {
                        _this.trigger('need:refresh', {sender: _this});
                    }
                }
            }
        });
        return uploadWidget;
    },
    _createPanel: function (targetId) {
        var _this = this;


        this.folderStore = Ext.create('Ext.data.TreeStore', {
            id: this.id + 'folderStore',
            fields: ['text', 'oid'],
            root: {
                expanded: true,
                text: 'Drive',
                children: []
            },
            listeners: {
                beforeappend: function (este, node) {
                    if (node.isLeaf()) {
//                        console.log(node.raw.oid + " is a file");
                        return false; //cancel append because is leaf
                    }
                }
            }
        });
        this.allStore = Ext.create('Ext.data.TreeStore', {
            id: this.id + 'allStore',
            fields: ['text', 'oid'],
            root: {
                expanded: true,
                text: 'Drive',
                children: []
            }
        });
        this.filesStore = Ext.create('Ext.data.Store', {
            fields: ['oid', 'fileBioType', 'fileType', 'fileFormat', 'fileName', 'multiple', 'diskUsage', 'creationTime', 'responsible', 'organization', 'date', 'description', 'status', 'statusMessage', 'members'],
            data: []
        });

        var refreshBucketAction = Ext.create('Ext.Action', {
            icon: Utils.images.refresh,
            text: 'Refresh bucket',
            handler: function (widget, event) {
                var record = _this.folderTree.getSelectionModel().getSelection()[0];
                if (record) {
                    if (record.raw.isBucket) {
                        OpencgaManager.refreshBucket({
                            accountId: $.cookie("bioinfo_account"),
                            bucketId: record.raw.text,
                            sessionId: $.cookie("bioinfo_sid"),
                            success: function (data) {
                                Ext.example.msg('Refresh Bucket', '</span class="emph">' + data + '</span>');
                                if (data.indexOf("ERROR") != -1) {
                                    console.log(data);
                                } else {
                                    _this.trigger('need:refresh', {sender: _this});
                                }
                            }
                        });

                    }
                }
            }
        });

        var renameBucketAction = Ext.create('Ext.Action', {
//            icon: Utils.images.refresh,
            text: 'Rename bucket',
            handler: function (widget, event) {
                var record = _this.folderTree.getSelectionModel().getSelection()[0];
                if (record) {
                    if (record.raw.isBucket) {
                        Ext.Msg.prompt('Rename bucket', 'Please enter a new name:', function (btn, text) {
                            if (btn == 'ok') {
                                text = text.replace(/[^a-z0-9-_.\/\s]/gi, '').trim();

                                opencgaManager.renameBucket({
                                    accountId: $.cookie("bioinfo_account"),
                                    bucketId: record.raw.bucketId,
                                    newBucketId: text,
                                    sessionId: $.cookie("bioinfo_sid"),
                                    success: function (data) {
                                        Ext.example.msg('Refresh Bucket', '</span class="emph">' + data + '</span>');
                                        if (data.indexOf("ERROR") != -1) {
                                            console.log(data);
                                        } else {
                                            _this.trigger('need:refresh', {sender: _this});
                                        }
                                    }
                                });
                            }
                        }, null, null, "new name");
                    }
                }
            }
        });

        this.folderTree = Ext.create('Ext.tree.Panel', {
            //xtype:"treepanel",
            id: this.id + "activeTracksTree",
            title: "Upload & Manage",
            bodyPadding: "5 0 0 0",
            margin: "-1 0 0 0",
            border: false,
            autoScroll: true,
            flex: 4,
            useArrows: true,
            rootVisible: false,
            hideHeaders: true,
//			selType: 'cellmodel',
            //plugins: [Ext.create('Ext.grid.plugin.CellEditing', {clicksToEdit: 2,listeners:{
            //edit:function(editor, e, eOpts){
            //var record = e.record; //en la vista del cliente
            /*todo, ahora q llame la servidor. y lo actualize*/
            //}
            //}})],
            columns: [
                {
                    xtype: 'treecolumn',
                    dataIndex: 'text',
                    flex: 1,
                    editor: {xtype: 'textfield', allowBlank: false}
                }
//                ,
//                {
//                    xtype: 'actioncolumn',
//                    menuDisabled: true,
//                    align: 'center',
//                    width: 30,
//                    renderer: function (value, metaData, record) {
//                        if (record.raw.isBucket) {
//                            this.icon = Utils.images.refresh;
//                            this.tooltip = 'Refresh bucket to find new files';
//                        } else {
//                            this.tooltip = null;
//                            this.icon = null;
//                        }
//                    },
//                    handler: function (grid, rowIndex, colIndex, actionItem, event, record, row) {
//                        if (record.raw.isBucket) {
//                            var opencgaManager = new OpencgaManager();
//                            opencgaManager.onRefreshBucket.addEventListener(function (sender, res) {
//                                Ext.example.msg('Refresh Bucket', '</span class="emph">' + res + '</span>');
//                                if (res.indexOf("ERROR") != -1) {
//                                    console.log(res);
//                                } else {
//                                    _this.trigger('need:refresh',{sender:_this});
//                                }
//                            });
//                            opencgaManager.refreshBucket($.cookie("bioinfo_account"), record.raw.text, $.cookie("bioinfo_sid"));
//                        }
//
//                    }
//                }
            ],
            viewConfig: {
                markDirty: false,
                plugins: {
                    ptype: 'treeviewdragdrop'
                },
                listeners: {
                    drop: function (node, data, overModel, dropPosition, eOpts) {
                        var record = data.records[0];
                        //check if is leaf and if the record has a new index
                        if (record.isLeaf() && record.data.index != record.removedFrom && record.data.checked) {
                            var id = record.data.trackId;
                            _this.setTrackIndex(id, record.data.index);
                        }
                    },
                    itemcontextmenu: function (este, record, item, index, e) {
                        e.stopEvent();
                        var items = [];
                        console.log(record)
                        if (record.raw.isBucket) {
                            items.push(refreshBucketAction);
                            items.push(renameBucketAction);
                            var contextMenu = Ext.create('Ext.menu.Menu', {
                                items: items
                            });
                            contextMenu.showAt(e.getXY());
                        }
                        return false;
                    }
                }
            },
            listeners: {
                selectionchange: function (este, selected, eOpts) {
                    var record = selected[0];
                    if (typeof record != 'undefined') {//avoid deselection
                        var field, deep;
                        if (record.raw.isBucket != null) {//is a bucket
                            field = 'text';
                            deep = false;
                        } else {
                            field = 'oid';
                            deep = true;
                        }
                        var node = _this.allStore.getRootNode().findChild(field, record.raw[field], deep);
                        var childs = [];
                        _this.selectedFolderNode = {value: node.data[field], field: field};
                        node.eachChild(function (n) {
                            childs.push(n.raw);
                        });
                        _this.filesGrid.setTitle(node.getPath("text", " / "));
                        _this.filesStore.loadData(childs);
                        if (_this.mode == "folderSelection") {
                            _this.selectedFileNode = node.raw;
                            _this.selectButton.enable();
                        }
                    }
                },
                viewready: function (este, eOpts) {//Fires when the grid view is available (use this for selecting a default row).
                    setTimeout(function () { // forced to do this because some ExtJS 4.2.0 event problem
                        var node = este.getRootNode().getChildAt(0);
                        if (typeof node != 'undefined') {
                            este.getSelectionModel().select(node);
                        }
                    }, 0);
                },
                checkchange: function (node, checked) {
                },
                itemmouseenter: function (este, record) {
                },
                itemmouseleave: function (este, record) {
                }
            },
            store: this.folderStore
        });


        /*MANAGE BUCKETS*/
        var newProjectButton = Ext.create('Ext.button.Button', {
            text: 'OK',
            handler: function () {
                _this.createProject();
                _this.folderTree.toggleCollapse();
                //manageProjects.toggleCollapse();
            }
        });
        var newProjectNameField = Ext.create('Ext.form.field.Text', {
            id: this.id + "newProjectNameField",
//        	width: 160,
            emptyText: 'name',
            allowBlank: false
        });
        var newProjectDescriptionField = Ext.create('Ext.form.field.TextArea', {
            id: this.id + "newProjectDescriptionField",
//        	width: 160,
            emptyText: 'description'
        });
        var newProjectCont = Ext.create('Ext.container.Container', {
            flex: 1,
            layout: { type: 'hbox', align: 'stretch'},
            items: [newProjectNameField, newProjectDescriptionField]
        });
        var manageProjects = Ext.create('Ext.panel.Panel', {
            title: "Create bucket",
            bodyPadding: 5,
            border: false,
            items: [newProjectNameField, newProjectDescriptionField, newProjectButton]
        });
        /*END MANAGE PROJECTS*/


        /*Files grid*/
        var indexAction = Ext.create('Ext.Action', {
            icon: Utils.images.info,  // Use a URL in the icon config
            text: 'Create index',
//            disabled: true,
            handler: function (widget, event) {
                var record = _this.filesGrid.getSelectionModel().getSelection()[0];
                if (record) {

                    OpencgaManager.indexer({
                        accountId: $.cookie("bioinfo_account"),
                        sessionId: $.cookie("bioinfo_sid"),
                        bucketId: record.raw.bucketId,
                        objectId: record.data.oid,
                        success: function (sender, response) {
                            console.log(response);
                            Ext.example.msg("indexer", response);
                            record.raw.indexerId = response;
//                                if (response.indexOf("ERROR:") != -1){
//                                }else{
//                                    //delete complete
////                                    record.destroy();
//                                    _this.trigger('need:refresh',{sender:_this});
//                                }
                        }
                    });


//                    console.log(record.raw.status);
//                    if (record.raw.status.indexOf('indexer') == -1) {
//                        opencgaManager.onIndexer.addEventListener(function (sender, response) {
//                            console.log(response)
//                            Ext.example.msg("indexer", response);
//                            record.raw.indexerId = response;
////                                if (response.indexOf("ERROR:") != -1){
////                                }else{
////                                    //delete complete
//////                                    record.destroy();
////                                    _this.trigger('need:refresh',{sender:_this});
////                                }
//                        });
//                        opencgaManager.indexer($.cookie("bioinfo_account"), $.cookie("bioinfo_sid"), record.raw.bucketId, record.data.oid);
//                    } else {
//                        Ext.example.msg('Indexer', 'The file is already being indexed');
//                        opencgaManager.onIndexerStatus.addEventListener(function (sender, response) {
//                            console.log(response)
//                            Ext.example.msg("indexer status", response);
////                                if (response.indexOf("ERROR:") != -1){
////                                }else{
////                                    //delete complete
//////                                    record.destroy();
////                                    _this.trigger('need:refresh',{sender:_this});
////                                }
//                        });
//                        opencgaManager.indexerStatus($.cookie("bioinfo_account"), $.cookie("bioinfo_sid"), record.raw.bucketId, record.data.oid, record.raw.status);
//                    }
                }
            }
        });
        var showName = Ext.create('Ext.Action', {
//            icon: Utils.images.info,
            text: 'Show name',
//            disabled: true,
            handler: function (widget, event) {
                var rec = _this.filesGrid.getSelectionModel().getSelection()[0];
                if (rec) {
                    Ext.example.msg('objectId', '' + rec.get('oid'));
                }
            }
        });

        var deleteAction = Ext.create('Ext.Action', {
            icon: Utils.images.del,
            text: 'Delete this file',
//            disabled: true,
            handler: function (widget, event) {
                var record = _this.filesGrid.getSelectionModel().getSelection()[0];
                if (record) {
                    Ext.MessageBox.confirm('Confirm', 'Are you sure you want to delete this file?<p class="emph">' + record.data.fileName + '<p>', function (answer) {
                        if (answer == "yes") {
                            console.log("deleting")

                            OpencgaManager.deleteObjectFromBucket({
                                accountId: $.cookie("bioinfo_account"),
                                sessionId: $.cookie("bioinfo_sid"),
                                bucketId: record.raw.bucketId,
                                objectId: record.data.oid,
                                success: function (data) {
                                    if (data.indexOf("ERROR:") != -1) {
                                        Ext.example.msg("Deleting", data);
                                    } else {
                                        //delete complete
                                        record.destroy();
                                        _this.trigger('need:refresh', {sender: _this});
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });

        this.filesGrid = Ext.create('Ext.grid.Panel', {
            title: this.allStore.getRootNode().getPath("text", " / "),
            store: this.filesStore,
            flex: 4,
            border: false,
            viewConfig: {
                stripeRows: true,
                listeners: {
                    itemcontextmenu: function (este, record, item, index, e) {
                        e.stopEvent();
                        var items = [showName];
                        console.log(record)
                        if (record.raw.fileFormat == 'bam' || record.raw.fileFormat == 'vcf') {
                            items.push(indexAction);
                        }
                        items.push(deleteAction);
                        var contextMenu = Ext.create('Ext.menu.Menu', {
                            items: items
                        });
                        contextMenu.showAt(e.getXY());
                        return false;
                    }
                }
            },
            selModel: {
                mode: 'SINGLE',
                //allowDeselect:true,
                listeners: {
                    selectionchange: function (este, item) {
                        if (item.length > 0) {//se compr
                            _this.selectedFileNode = item[0].raw;
                            var type = item[0].raw.fileType;
                            var fileFormat = item[0].raw.fileFormat;
                            if (_this.mode == "fileSelection" && type == "dir") {
                                return;
                            }
                            console.log(_this.allowedTypes)
                            if (typeof _this.allowedTypes != 'undefined' && _this.allowedTypes.indexOf(fileFormat) == -1) {
                                _this.selectButton.disable();
                                console.log('file format NOT allowed -' + fileFormat + '- ')
                                return;
                            }
                            console.log('file format allowed -' + fileFormat + '- ')
                            _this.selectButton.enable();
                            //this.selectedLabel.setText('<p>The selected file <span class="emph">'+item[0].data.fileName.substr(0,40)+'</span><span class="ok"> is allowed</span>.</p>',false);
                            //TODO por defecto cojo el primero pero que pasa si el data contiene varios ficheros??
                        } else {
                            _this.selectButton.disable();
                        }
                    }
                }
            },
            columns: [
                { text: 'File type', xtype: 'actioncolumn', menuDisabled: true, align: 'center', width: 54, icon: Utils.images.bluebox,
                    renderer: function (value, metaData, record) {
                        this.icon = Utils.images[record.data.fileType];
                        this.tooltip = record.data.fileType;
                    }
                },
                { text: 'Name', dataIndex: 'fileName', flex: 2 },
                { text: 'Creation time', dataIndex: 'creationTime', flex: 1 }
            ]
        });
        /**/

        this.panAccordion = Ext.create('Ext.panel.Panel', {
            minWidth: 125,
            minHeight: 250,
            flex: 1,
            cls: 'ocb-border-right-lightgrey',
            border: false,
            layout: 'accordion',
            items: [this.folderTree, manageProjects /*, panFilter*/]
        });

        this.selectButton = Ext.create('Ext.button.Button', {
            text: 'Ok',
            disabled: true,
            handler: function () {
                _this.trigger('select', {id: _this.selectedFileNode.oid, bucketId: _this.selectedFileNode.bucketId});
                _this.panel.close();
            }
        });

        this.activeUploadsCont = Ext.create('Ext.panel.Panel', {
            title: 'Active uploads',
            animCollapse: false,
            hidden: true,
            bodyPadding: '10 0 10 0',
            autoScroll: true,
            height: 125,
            border: 0,
            cls: 'ocb-border-top-lightgrey',
            items: []
        });


        /**MAIN PANEL**/
//		this.height=205+(26*suites.length);//segun el numero de suites

        var tbarObj = {items: []};
        switch (this.mode) {
            case "folderSelection" :
                var item;
                item = {text: 'New folder', handler: function () {
                    _this.folderTree.expand();
                    _this.createFolder();
                }};
                tbarObj.items.splice(0, 0, item);
                item = {text: 'New bucket', handler: function () {
                    manageProjects.expand();
                }};
                tbarObj.items.splice(0, 0, item);
                this.filesStore.filter("fileType", /dir/);
                break;
            case "manager" :
                var item;
                item = {text: 'Upload', handler: function () {
                    _this.drawUploadWidget();
                }};
                tbarObj.items.splice(0, 0, item);
                item = {text: 'New folder', handler: function () {
                    _this.folderTree.expand();
                    _this.createFolder();
                }};
                tbarObj.items.splice(0, 0, item);
                item = {text: 'New bucket', handler: function () {
                    manageProjects.expand();
                }};
                tbarObj.items.splice(0, 0, item);
                this.selectButton.hide();
                break;
            default :
                var item;
                item = {text: 'Upload', handler: function () {
                    _this.drawUploadWidget();
                }};
                tbarObj.items.splice(0, 0, item);
                item = {text: 'New folder', handler: function () {
                    _this.folderTree.expand();
                    _this.createFolder();
                }};
                tbarObj.items.splice(0, 0, item);
                item = {text: 'New bucket', handler: function () {
                    manageProjects.expand();
                }};
                tbarObj.items.splice(0, 0, item);
                break;
        }

        if (this.chunkedUpload == true) {
            tbarObj.items.push({
                id: this.id + 'activeUploadsButton',
                text: 'Active uploads',
                enableToggle: true,
                pressed: false,
                toggleHandler: function () {
                    if (this.pressed) {
                        _this.activeUploadsCont.show();
                        //                    _this.viewUploads();
                    } else {
                        _this.activeUploadsCont.hide();
                        //                    _this.viewBuckets();
                    }
                }
            });
        }
        var panel = Ext.create('Ext.window.Window', {
            title: 'Upload & Manage',
            resizable: false,
            minimizable: true,
            constrain: true,
            closable: false,
            modal: true,
            height: this.height,
            minHeight: this.height,
            width: this.width,
            minWidth: this.width,
            resizable: true,
            layout: { type: 'vbox', align: 'stretch'},
            tbar: tbarObj,
            items: [
                {
                    xtype: 'container',
                    flex: 3,
                    minWidth: 125,
                    layout: { type: 'hbox', align: 'stretch'},
                    items: [this.panAccordion, this.filesGrid]
                },
                this.activeUploadsCont
            ],
            buttonAlign: 'right',
            buttons: [
                {
                    text: 'Close', handler: function () {
                    _this.panel.hide();
                }},
                this.selectButton
            ],
            listeners: {
                scope: this,
                minimize: function () {
                    this.panel.hide();
                },
                destroy: function () {
                    delete this.panel;
                }
            }
        });

        this._updateFolderTree();
        return panel;
    },

    setAccountData: function (data) {
        this.accountData = data;
        if (this.rendered) {
            this._updateFolderTree();
        }
    },

    _updateFolderTree: function () {
        var _this = this;
        console.log("updating folder tree");
        var find = function (str, arr) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].text == str) {
                    return i;
                }
            }
            return -1;
        };

        if (this.accountData != null && this.accountData.accountId != null) {
            this.folderStore.getRootNode().removeAll();
            this.allStore.getRootNode().removeAll();
            this.filesStore.removeAll();
//            this.folderTree.getSelectionModel().deselectAll();
            for (var i = 0; i < this.accountData.buckets.length; i++) {
                var folders = [];
                for (var j = 0; j < this.accountData.buckets[i].objects.length; j++) {
                    var data = this.accountData.buckets[i].objects[j];
                    data["bucketId"] = this.accountData.buckets[i].id;
                    //sencha uses id so need to rename to oid, update: sencha can use id but dosent like char '/' on the id string

                    if (data.id != null) {
                        data["oid"] = data.id;
                        delete data.id;
                    }
                    var pathArr = data.oid.split("/");
                    if (data.fileType == "dir") {
                        data["expanded"] = true;
                        data["icon"] = Utils.images.dir;
                    } else {
                        data["leaf"] = true;
                        data["icon"] = Utils.images.r;
                    }
                    //console.log(pathArr)

                    var current = folders;
                    for (var k = 0; k < pathArr.length; k++) {
                        var found = find(pathArr[k], current);
                        if (found != -1) {
                            current = current[found].children;
                        } else {
                            var children = [];
                            var idx = current.push({text: pathArr[k], children: children}) - 1;
                            if (typeof pathArr[k + 1] == 'undefined') {//isLast
                                for (key in data) {
                                    if (key != "children") {
                                        current[idx][key] = data[key];
                                    }
                                }
                            }
                            current = children;
                        }
                    }
                }
                folders = JSON.stringify(folders);
                this.allStore.getRootNode().appendChild({text: this.accountData.buckets[i].name, bucketId: this.accountData.buckets[i].name, oid: "", icon: Utils.images.bucket, expanded: true, isBucket: true, children: JSON.parse(folders)});
                this.folderStore.getRootNode().appendChild({text: this.accountData.buckets[i].name, bucketId: this.accountData.buckets[i].name, oid: "", icon: Utils.images.bucket, expanded: true, isBucket: true, children: JSON.parse(folders)});
            }
        }

        //collapse and expand to update the view after append, possible ExtJS 4.2.0 bug
        this.folderStore.getRootNode().collapse();
        this.folderStore.getRootNode().expand();


        //reselect nodes after account update
        if (this.selectedFolderNode != null) { //devuelve el value y el field porque el bucket no tiene oid
            var lastNode = this.folderTree.getRootNode().findChild(this.selectedFolderNode.field, this.selectedFolderNode.value, true);
            if (lastNode != null) {
                this.folderTree.getSelectionModel().select(lastNode);
            }
        }
        if (this.selectedFileNode != null) { //devuelve el value y el field porque el bucket no tiene oid
            var index = this.filesGrid.getStore().findExact('oid', this.selectedFileNode.oid);
            if (index != -1) {
                this.filesGrid.getSelectionModel().select(index);
            }
        }
    },

    addUpload: function (file, fileuploadWorker) {
        var pbar = Ext.create('Ext.ProgressBar', {
            text: 'Ready',
            width: 250,
            margin: '4 6 0 6'
        });
        var nameBox = Ext.create('Ext.Component', {
            html: file.name.substr(0, 67),
            width: 430,
            margin: '7 6 0 6'
        });
//        #ffffd6  amarillete
        // #1155cc azulete
        var btn = Ext.create('Ext.Button', {
            text: '<span style="color:#1155cc">Cancel</span>',
            margin: '3 6 0 4',
            width: 50,
            handler: function () {
                fileuploadWorker.terminate();
                cont.destroy();
            }
        });
        var cont = Ext.create('Ext.container.Container', {
            padding: '3 6 0 6',
            layout: 'hbox',
            items: [nameBox, pbar, btn]
        });
        fileuploadWorker.onmessage = function (e) {
            var res = e.data;
            console.log("@@@@@@@@@@@@@@@@ WORKER event message");
            console.log(res);
            pbar.updateProgress((res.chunkId + 1) / res.total, 'uploading part ' + (res.chunkId + 1) + ' of ' + res.total, false);
            if (res.finished == true) {
                btn.setText('<span style="color:#1155cc">Done </span>');
            }
//            _this.adapter.onIndexer(function(data){
//                console.log(data);
//            });
//            _this.adapter.indexer($.cookie("bioinfo_account"),objectId);
        };
        this.activeUploadsCont.add(cont);
        Ext.getCmp(this.id + 'activeUploadsButton').toggle(true);
    },
    viewBuckets: function () {
        var _this = this;
        _this.panel.removeAll(false);
        _this.panel.add(_this.panAccordion);
        _this.panel.add(_this.filesGrid);

    },
    viewUploads: function () {
        var _this = this;
        _this.panel.removeAll(false);
        _this.panel.add(_this.activeUploadsCont);
    }
    //endclass
};


OpencgaBrowserWidget.prototype.setFilter = function () {
    var _this = this;
    var recordOrigin = this.viewOrigin.getSelectionModel().getSelection()[0];
    var recordSuite = this.viewSuite.getSelectionModel().getSelection()[0];

    this.folderStore.clearFilter();

    if (recordOrigin != null) {
        switch (recordOrigin.data.suiteId) {
            case  "all":
                break;
            case  "Uploaded Data":
                this.folderStore.filter(function (item) {
                    return item.data.jobId < 0;
                });
                break;
            case  "Job Generated":
                this.folderStore.filter(function (item) {
                    return item.data.jobId > 0;
                });
                break;
        }
    }
    if (recordSuite != null) {
        switch (recordSuite.data.suiteId) {
            case  1:
                break;
            default :
                this.folderStore.filter(function (item) {
                    return item.data.suiteId == recordSuite.data.suiteId;
                });
        }
    }

    this.folderStore.filter(function (item) {
        var str = Ext.getCmp(_this.searchFieldId).getValue().toLowerCase();
        if (item.data.name.toLowerCase().indexOf(str) < 0) {
            return false;
        }
        return true;
    });
};

OpencgaBrowserWidget.prototype.checkTags = function (tags) {
    for (var i = 0; i < this.tags.length; i++) {
        if (this.tags[i].indexOf('|') > -1) {
            var orTags = this.tags[i].split('|');
            var orMatch = false;
            for (var j = 0; j < orTags.length; j++) {
                if (tags.indexOf(orTags[j]) > -1) {
                    orMatch = true;
                }
            }
            if (!orMatch) {
                return false;
            }
        } else {
            if (tags.indexOf(this.tags[i]) == -1) {
                return false;
            }
        }
    }
    return true;

};


OpencgaBrowserWidget.prototype.createProject = function () {
    var _this = this;
    var name = Ext.getCmp(this.id + "newProjectNameField").getValue();
    var desc = Ext.getCmp(this.id + "newProjectDescriptionField").getValue();
    if (name != "") {
        Ext.getBody().mask();
        _this.panel.setLoading("Creating project");

        OpencgaManager.createBucket({
            bucketId: name,
            description: desc,
            accountId: $.cookie("bioinfo_account"),
            sessionId: $.cookie("bioinfo_sid"),
            success: this.createBucketSuccess
        });
    }
};

OpencgaBrowserWidget.prototype._getFolderTreeSelection = function () {
    var selectedBuckets = this.folderTree.getSelectionModel().getSelection();
    if (selectedBuckets.length < 1) {
        Ext.example.msg('No folder selected', 'Please select a bucket or a folder.');
        return null;
    } else {
        var record = selectedBuckets[0];
        var bucketName;
        var parent = '';
        if (record.raw.fileType != null && record.raw.fileType == "dir") {
            var path = record.getPath("text", "/").substr(1);
            var pathArr = path.split("/", 2);
            parent = path.replace(pathArr.join("/"), "").substr(1) + "/";
            bucketName = pathArr[1];
        } else {
            bucketName = record.raw.text;
        }
        return {bucketId: bucketName, directory: parent};
    }
};

OpencgaBrowserWidget.prototype.drawUploadWidget = function () {
    var _this = this;
    var folderSelection = this._getFolderTreeSelection();
    if (folderSelection != null) {
        _this.uploadWidget.draw(folderSelection);
    }
};

OpencgaBrowserWidget.prototype.createFolder = function () {
    var _this = this;
    if (this.accountData.buckets.length < 1) {
        Ext.MessageBox.alert('No buckets found', 'Please create and select a bucket.');
    } else {
        var folderSelection = this._getFolderTreeSelection();
        if (folderSelection != null) {
            Ext.Msg.prompt('New folder', 'Please enter a name for the new folder:', function (btn, text) {
                if (btn == 'ok') {
                    text = text.replace(/[^a-z0-9-_.\s]/gi, '');
                    text = text.trim() + "/";

                    OpencgaManager.createDirectory({
                        accountId: $.cookie("bioinfo_account"),
                        sessionId: $.cookie("bioinfo_sid"),
                        bucketId: folderSelection.bucketId,
                        objectId: folderSelection.directory + text,
                        success: function (data) {
                            Ext.example.msg('Create folder', '</span class="emph">' + data + '</span>');
                            if (data.indexOf("ERROR") != -1) {
                                console.log(data);
                            } else {
                                _this.trigger('need:refresh', {sender: _this});
                            }
                        }
                    });

                }
            }, null, null, "New Folder");
        }
    }
};

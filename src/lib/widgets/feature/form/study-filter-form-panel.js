function StudyFilterFormPanel(args) {
    _.extend(this, Backbone.Events);

    //set default args
    this.id = Utils.genId("StudyFilterFormPanel");
    this.target;
    this.autoRender = true;
    this.title = "Study";
    this.studies = [];
    this.urlStudies = "";

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

    if (this.studies.length == 0 && this.urlStudies != "") {
        this._loadStudies();
    }

    this.rendered = false;
    if (this.autoRender) {
        this.render(this.targetId);
    }

}

StudyFilterFormPanel.prototype = {
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

        var cbg = Ext.create('Ext.form.CheckboxGroup', {
//            layout: 'hbox',
            autoScroll: true,
            defaultType: 'checkboxfield'
        });

        var cbgItems = [];

        for (var i = 0; i < this.studies.length; i++) {
            var study = this.studies[i];
            cbgItems.push(Ext.create('Ext.form.field.Checkbox', {
                boxLabel: study.studyName,
                name: 'studies',
                inputValue: study.studyId,
                margin: '0 0 0 5',
                checked: false
            }));
        }

        cbg.add(cbgItems);

        return Ext.create('Ext.form.Panel', {
            bodyPadding: "5",
            margin: "0 0 5 0",
            buttonAlign: 'center',
            layout: 'vbox',
            title: this.title,
            border: false,
            items: cbgItems
        });

    },
    getPanel: function () {
        return this.panel;
    },
    getValues: function(){
        return this.panel.getValues();
    },
    clear: function(){
        this.panel.reset();
    },
    _loadStudies: function () {
        var _this = this;
        $.ajax({
            url: this.urlStudies,
            dataType: 'json',
            async: false,
            success: function (response, textStatus, jqXHR) {
                var data = (response !== undefined && response.response.length > 0 && response.response[0].numResults > 0)? response.response[0].result : [];

                for (var i = 0; i < data.length; i++) {
                    var study = data[i];
                    _this.studies.push(study);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('Error loading Phenotypes');
            }
        });
    },
}

/*
 * Copyright (c) 2012-2013 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012-2013 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012-2013 Ignacio Medina (ICM-CIPF)
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

function NetworkViewer(args) {
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('NetworkViewer');

    //set default args
    this.targetId;
    this.autoRender = false;
    this.sidePanel = false;
    this.overviewPanel = false;

    //set instantiation args, must be last
    _.extend(this, args);


    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
}

NetworkViewer.prototype = {

    render:function(targetId){
        if(targetId)this.targetId = targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="network-viewer" style="width:90%;border:1px solid lightgrey"></div>')[0];
        $(this.targetDiv).append(this.div);

        this.toolbarDiv = $('<div id="nv-toolbar"></div>')[0];
        this.editionbarDiv = $('<div id="nv-editionbar"></div>')[0];
        this.centerPanelDiv =  $('<div id="nv-centerpanel style="postion:relative;"></div>')[0];
        this.statusbarDiv = $('<div id="nv-statusbar"></div>')[0];

        $(this.div).append(this.toolbarDiv);
        $(this.div).append(this.editionbarDiv);
        $(this.div).append(this.centerPanelDiv);
        $(this.div).append(this.statusbarDiv);

        this.mainPanelDiv =  $('<div id="nv-mainpanel style=""></div>')[0];
        $(this.centerPanelDiv).append(this.mainPanelDiv);

        if(this.sidePanel){
            this.sidePanelDiv = $('<div id="nv-sidepanel style="postion:absolute;right:0px;height:100%;"></div>')[0];
            $(this.centerPanelDiv).append(this.sidePanelDiv);
        }

        if(this.overviewPanel){
            this.overviewPanelDiv = $('<div id="nv-overviewpanel style="postion:absolute;bottom:10px;left:10px"></div>')[0];
            $(this.centerPanelDiv).append(this.overviewPanelDiv);
        }

        this.rendered = true;
    },
    draw:function(){
        if (!this.rendered) {
            console.info('Genome Viewer is not rendered yet');
            return;
        }

        /* Toolbar Bar */
        this.toolBar = this._createToolBar($(this.toolbarDiv).attr('id'));

        /* edition Bar */
    },

    _createToolBar:function(targetId){
        this.toolBar = new ToolBar({
            targetId : targetId,
            autoRender: true,
            handlers:{
                'layout:change':function(event){
                    console.log(event.layout);
                    //todo
                }
            }
        });
    }
}
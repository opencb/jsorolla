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

function ResultWidget(args){
	var _this = this;

    if(typeof args != 'undefined'){
        this.targetId = args.targetId || this.targetId;
        this.application = args.application || this.application;
        this.app  = args.app  || this.app;
    }
	this.adapter = new GcsaManager();
	
//	this.adapter.onJobResult.addEventListener(function (sender, resultData){
//		console.log(resultData);
//        debugger
//		_this.data = JSON.parse(resultData);
//		Ext.getBody().unmask();
//		_this.panel.setLoading(false);
//		_this.render(resultData);
//	});

	this.panelId=null;
	this.networkViewerId = null;
	this.genomeMapsId = null;
}

ResultWidget.prototype = {
    id : "ResultWidget"+ Math.round(Math.random()*10000),
    draw : function(sid, record){
        var _this = this;
        //	console.log(record.data);
        this.job = record.raw;
        this.jobId = this.job.id;
        this.id = this.jobId+this.id;
        this.panelId = "ResultWidget_"+this.jobId;
//        this.networkViewerId = this.panelId+"_CellBrowserId";
//        this.genomeMapsId = this.panelId+"_GenomeMapsId";

        this.panel = Ext.getCmp(this.panelId);
        if(this.panel==null){
            this.panel = Ext.create('Ext.panel.Panel', {
                id :this.panelId,
                border: 0,
                title: this.job.name,
                closable:true,
                autoScroll:true
                //html: this.tpl.applyTemplate(outputItems)
            });

            Ext.getCmp(this.targetId).add(this.panel);
            Ext.getCmp(this.targetId).setActiveTab(this.panel);
            this.panel.setLoading("Loading job info...");
            Ext.getBody().mask();

            //this.adapter.jobResult(this.jobId, "json", sid);
            //accountId, sessionId, bucketname, jobId, format

            var url = this.adapter.jobResultUrl($.cookie("bioinfo_account"), sid, record.raw.toolName, this.jobId, "json");
            $.getScript(url,function(){
                Ext.getBody().unmask();
		        _this.panel.setLoading(false);
                RESULT[_this.job.toolName].layout.outputItems = ['Example1ALL.txt','Example1_hsa03320.txt','Example1_hsa03320.jpeg','Example1_hsa03320.PathwayResult.jpeg'];
//                RESULT[_this.job.toolName].layout.outputItems = _this.job.outputData;
		        _this.render(RESULT);
            });
            //this.adapter.jobResult(this.jobId, "json", sid);
        }else{
//			this.panel.setLoading(false);
            Ext.getCmp(this.targetId).setActiveTab(this.panel);
        }
    },
    render : function(resultData){
        var _this=this;
        console.log(this.application);
        var getJobInfo = function(){
            var itemTpl = new Ext.XTemplate(
                '<p class="ssel border-bot">Information</p><br>',
                '<p><span class="emph">{name}</span> - <span class="info"> {toolName} </span> - <span class="tip"> {date}</span></p><br>',
                '<p class="tip emph">{description}</p>'
            );
            return Ext.create('Ext.Component', {
                margin:'15 0 20 15',
                data:_this.job,
                tpl:itemTpl
            });
        };

        var getResultIndex = function(children){
            var boxes = [{xtype:'box',cls:'inlineblock ssel border-bot',html:'Index',margin:15}];
            for(var i = 0; i<children.length; i++){
                boxes.push(Ext.create('Ext.Component',{
                    margin:"0 15 0 15",
                    cls:'dedo emph u',
                    overCls:'err',
                    resultId:_this.jobId+children[i].title.replace(/ /g,''),
                    html:children[i].title,
                    listeners:{
                        afterrender:function(este){
                            this.getEl().on("click",function(){
                                var pos = $('#'+este.resultId).position().top;
                                $(_this.panel.getEl().dom).children().scrollTop(pos-10);
                            });
                        }
                    }
                }));
            }
            return Ext.create('Ext.container.Container', {
                margin:'0 0 20 0',
                items:boxes
            });
        };

        var iter = function(item, isRoot){
            var itemTpl = new Ext.XTemplate(
                '<span class="s140 emph">{title}</span>',
                '<span class="ok"> {pathi} </span>',
                '<span class="info"> {date}</span><br>'
            );
            var boxes;
            if(typeof item.children != 'undefined'){
                if(typeof item.children == 'function'){
                    item.children = item.children();
                }
                boxes = [];
                for(var i = 0; i<item.children.length; i++){
                    boxes.push(iter(item.children[i]));
                }
                if(item.presentation=='tabs'){
                    return Ext.create('Ext.container.Container', {
                        items:[{xtype:'box',data:item,tpl:itemTpl},{
                            xtype:'tabpanel',
                            items:boxes
                        }]

                    });
                }
                if(isRoot == true){
                    return Ext.create('Ext.container.Container', {
                        title:item.title,
                        items:[{
                            id:_this.jobId+item.title.replace(/ /g,''),
                            xtype:'box',
                            cls:'inlineblock ssel border-bot', margin:'15',
                            html:'Details'
                        },{
                            xtype:'container',
                            items:boxes
                        }]
                    });
                }else{
                    return Ext.create('Ext.container.Container', {
                        title:item.title,
                        margin:'0 0 0 10',
                        items:[{
                            id:_this.jobId+item.title.replace(/ /g,''),
                            xtype:'box',
                            overCls:'dedo',
                            cls:'panel-border-bottom', margin:'0 0 10 0',
                            data:item,tpl:itemTpl,
                            listeners:{
                                afterrender:function(){
                                    this.getEl().on("click",function(){
                                        $(_this.panel.getEl().dom).children().scrollTop(0);
                                    });
                                }
                            }
                        },{
                            xtype:'container',
                            items:boxes
                        }]
                    });
                }
            }else{
                boxes = [/*{xtype:'box',margin:'10 0 0 10',data:item,tpl:itemTpl}*/];
                var itemBox;
                for(var j = 0; j<item.renderers.length; j++){
                    var renderer = item.renderers[j];
                    switch(renderer.type){
                        case 'file':
                            itemBox = Ext.create('Ext.Component', {
//                                title:item.title,
                                html:'<span class="key">'+item.title+'</span><span class="file">'+item.file+'</span>',
                                item:item,
                                padding:3,
                                overCls:'encima',
                                cls:'inlineblock whiteborder',
                                listeners:{
                                    afterrender:function(){
                                        var item = this.item;
                                        this.getEl().on("click",function(){
                                            console.log(item);
                                            _this.adapter.poll($.cookie('bioinfo_account'),$.cookie('bioinfo_sid'), _this.jobId, item.file, true);
                                        });
                                    }
                                }
                            });
                            break;
                        case 'image':
                            itemBox = Ext.create('Ext.Component',{
                                html:'<div><img src="'+_this.adapter.pollurl($.cookie('bioinfo_account'),$.cookie('bioinfo_sid'), _this.jobId,item.file)+'"></div>'
                            });
                            break;
                        case 'grid':
                            var id = 'resultTable_'+_this.jobId+item.file;
                            var resultTable = new ResultTable (_this.jobId, item.file, item.tags,{targetId:id,tableLayout:renderer.tableLayout});
                            itemBox = Ext.create('Ext.Component',{
                                flex:1,
                                resultTable:resultTable,
                                html:'<div id="'+id+'" style="padding:5px;"> </div>',
                                listeners:{
                                    afterrender:function(este){
                                        este.resultTable.draw();
                                    }
                                }
                            });
                            break;
                    }
                    boxes.push(itemBox);
                }
                return Ext.create('Ext.container.Container', {
                    title:item.title,
                    margin:'0 0 15 0',
                    items : boxes
                });
            }
        };

        var detailedResutls = iter(resultData[this.job.toolName].layout,true);
        var indexResutl = getResultIndex(resultData[this.job.toolName].layout.children);
        this.panel.add(getJobInfo());
        this.panel.insert(indexResutl);
        this.panel.add(detailedResutls);

    }//end render
};
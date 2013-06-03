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

//any item with chromosome start end
FeatureRenderer.prototype = new Renderer({});

function FeatureRenderer(args){
    Renderer.call(this,args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args

    //set instantiation args
    _.extend(this, args);

    this.fontFamily = 'Source Sans Pro';
};


FeatureRenderer.prototype.render = function(features, args) {
    var _this = this;
    var draw = function(feature){
        var start = feature.start;
        var end = feature.end;
        var width = (end-start)+1;

        var middle = args.width/2;

        if(width<0){//snps can be negative
            width=Math.abs(width);
        }
        if(width==0){//snps with same start - end
            width=1;
        }

        //get type settings object
        var settings = args.featureTypes[feature.featureType];
        try {
            var color = settings.getColor(feature);
        } catch (e) {
            //Uncaught TypeError: Cannot call method 'getColor' of undefined
            console.log(e)
            debugger

        }


        //transform to pixel position
        width = width * args.pixelBase;
        var x = args.pixelPosition+middle-((args.position-start)*args.pixelBase);

        var textHeight = 9;
        if(args.zoom > args.labelZoom){
            try{
                var maxWidth = Math.max(width, settings.getLabel(feature).length*8); //XXX cuidado : text.getComputedTextLength()
            }catch(e){
                var maxWidth = 72;
            }
        }else{
            var maxWidth = Math.max(width,2);
            textHeight = 0;
        }


        var rowHeight = textHeight+10;
        var rowY = 0;
        var textY = textHeight+settings.height;

        while(true){
            if(args.renderedArea[rowY] == null){
                args.renderedArea[rowY] = new FeatureBinarySearchTree();
            }
            var enc = args.renderedArea[rowY].add({start: x, end: x+maxWidth-1});

            if(enc){
                var featureGroup = SVG.addChild(args.svgCanvasFeatures,"g");
                var rect = SVG.addChild(featureGroup,"rect",{
                    'x':x,
                    'y':rowY,
                    'width':width,
                    'height':settings.height,
                    'stroke': '#3B0B0B',
                    'stroke-width': 0.5,
                    'fill': color,
                    'cursor': 'pointer'
                });
                if(args.zoom > args.labelZoom){
                    var text = SVG.addChild(featureGroup,"text",{
                        'i':i,
                        'x':x,
                        'y':textY,
                        'font-size':12,
                        'font-family':_this.fontFamily,
                        'font-weight': 400,
                        'opacity':null,
                        'fill':'black',
                        'cursor': 'pointer'
                    });
                    text.textContent = settings.getLabel(feature);
                }

                $(featureGroup).qtip({
                    content: {text:settings.getTipText(feature), title:settings.getTipTitle(feature)},
                    position: {target:  "mouse", adjust: {x:15, y:0},  viewport: $(window), effect: false},
                    style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'}
                });

                $(featureGroup).click(function(event){
                    _this.trigger('feature:click',{query:feature[settings.infoWidgetId], feature:feature, featureType:feature.featureType})
                });
                break;
            }
            rowY += rowHeight;
            textY += rowHeight;
        }
    };

    //process features
    for ( var i = 0, leni = features.length; i < leni; i++) {
        draw(features[i]);
    }
};

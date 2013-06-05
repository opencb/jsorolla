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
GeneRenderer.prototype = new Renderer({});

function GeneRenderer(args){
    Renderer.call(this,args);
    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    //set default args

    //set instantiation args
    _.extend(this, args);

    this.fontFamily = 'Source Sans Pro';
};


GeneRenderer.prototype.render = function(features, args) {
    var _this = this;
    var draw = function(feature){
        var start = feature.start;
        var end = feature.end;
        var width = (end-start)+1;

        var middle = args.width/2;
        //get type settings object
        var settings = args.featureTypes[feature.featureType];
        var color = settings.getColor(feature);

        //transform to pixel position
        width = width * args.pixelBase;
        var x = args.pixelPosition+middle-((args.position-start)*args.pixelBase);

        try{
            var maxWidth = Math.max(width, settings.getLabel(feature).length*8); //XXX cuidado : text.getComputedTextLength()
        }catch(e){
            var maxWidth = 72;
        }

        var rowHeight = 20;
        var rowY = 0;
        var textY = 10+settings.height;


        while(true){
            if(args.renderedArea[rowY] == null){
                args.renderedArea[rowY] = new FeatureBinarySearchTree();
            }

            var enc;//if true, i can paint

            //check if transcripts can be painted
            var checkRowY = rowY;
            if(feature.transcripts!=null){
                for ( var i = 0, leni = feature.transcripts.length+1; i < leni; i++) {
                    if(args.renderedArea[checkRowY] == null){
                        args.renderedArea[checkRowY] = new FeatureBinarySearchTree();
                    }
                    enc = !args.renderedArea[checkRowY].contains({start: x, end: x+maxWidth-1});
                    if(enc == false){
                        break;
                    }
                    checkRowY += rowHeight;
                }
            }else{
                enc = args.renderedArea[rowY].add({start: x, end: x+maxWidth-1});
            }

            if(enc){//paint genes
                var rect = SVG.addChild(args.svgCanvasFeatures,'rect',{
                    'x':x,
                    'y':rowY,
                    'width':width,
                    'height':settings.height,
                    'stroke': '#3B0B0B',
                    'stroke-width': 0.5,
                    'fill': color,
                    'cursor': 'pointer'
                });

                var text = SVG.addChild(args.svgCanvasFeatures,'text',{
                    'i':i,
                    'x':x,
                    'y':textY,
                    'font-size':12,
                    'font-family':_this.fontFamily,
                    'opacity':null,
                    'fill':'black',
                    'cursor': 'pointer'
                });
                text.textContent = settings.getLabel(feature);

                $([rect,text]).qtip({
                    content: {text:settings.getTipText(feature), title:settings.getTipTitle(feature)},
                    position: {target:  "mouse", adjust: {x:15, y:0},  viewport: $(window), effect: false},
                    style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'}
                });

                $([rect,text]).click(function(event){
                    var settings = args.featureTypes[feature.featureType];
                    _this.trigger('feature:click',{query:feature[settings.infoWidgetId], feature:feature, featureType:feature.featureType});
                });


                //paint transcripts
                var checkRowY = rowY+rowHeight;
                var checkTextY = textY+rowHeight;
                if(feature.transcripts!=null){
                    for(var i = 0, leni = feature.transcripts.length; i < leni; i++){/*Loop over transcripts*/
                        if(args.renderedArea[checkRowY] == null){
                            args.renderedArea[checkRowY] = new FeatureBinarySearchTree();
                        }
                        var transcript = feature.transcripts[i];
                        var transcriptX = args.pixelPosition+middle-((args.position-transcript.start)*args.pixelBase);
                        var transcriptWidth = (transcript.end-transcript.start+1) * ( args.pixelBase);

                        //get type settings object
                        var settings = args.featureTypes[transcript.featureType];
                        var color = settings.getColor(transcript);

                        try{
                            //se resta el trozo del final del gen hasta el principio del transcrito y se le suma el texto del transcrito
                            var maxWidth = Math.max(width, width-((feature.end-transcript.start)* ( args.pixelBase))+settings.getLabel(transcript).length*7);
                        }catch(e){
                            var maxWidth = 72;
                        }

                        //add to the tree the transcripts size
                        args.renderedArea[checkRowY].add({start: x, end: x+maxWidth-1});


                        var transcriptGroup = SVG.addChild(args.svgCanvasFeatures,'g',{
                            "widgetId":transcript[settings.infoWidgetId]
                        });


                        var rect = SVG.addChild(transcriptGroup,'rect',{//this rect its like a line
                            'x':transcriptX,
                            'y':checkRowY+1,
                            'width':transcriptWidth,
                            'height':settings.height,
                            'fill': 'gray',
                            'cursor': 'pointer'
                        });
                        var text = SVG.addChild(transcriptGroup,'text',{
                            'x':transcriptX,
                            'y':checkTextY,
                            'font-size':12,
                            'font-family':_this.fontFamily,
                            'opacity':null,
                            'fill':'black',
                            'cursor': 'pointer'
                        });
                        text.textContent = settings.getLabel(transcript);


                        $(transcriptGroup).qtip({
                            content: {text:settings.getTipText(transcript), title:settings.getTipTitle(transcript)},
                            position: {target: 'mouse', adjust: {x:15, y:0}, viewport: $(window), effect: false},
                            style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'}
                        });
                        $(transcriptGroup).click(function(event){
                            var query = this.getAttribute("widgetId");
                            _this.trigger('feature:click',{query:query, feature:transcript, featureType:transcript.featureType});
                        });

                        //paint exons
                        for(var e = 0, lene = feature.transcripts[i].exons.length; e < lene; e++){/* loop over exons*/
                            var exon = feature.transcripts[i].exons[e];
                            var exonSettings = args.featureTypes[exon.featureType];
                            var exonStart = parseInt(exon.start);
                            var exonEnd =  parseInt(exon.end);

                            var exonX = args.pixelPosition+middle-((args.position-exonStart)*args.pixelBase);
                            var exonWidth = (exonEnd-exonStart+1) * ( args.pixelBase);

                            var exonGroup = SVG.addChild(args.svgCanvasFeatures,"g");

                            $(exonGroup).qtip({
                                content: {text:exonSettings.getTipText(exon,transcript), title:exonSettings.getTipTitle(exon)},
                                position: {target: 'mouse', adjust: {x:15, y:0}, viewport: $(window), effect: false},
                                style: { width:true, classes: 'ui-tooltip ui-tooltip-shadow'}
                            });

                            var eRect = SVG.addChild(exonGroup,"rect",{//paint exons in white without coding region
                                "i":i,
                                "x":exonX,
                                "y":checkRowY-1,
                                "width":exonWidth,
                                "height":exonSettings.height,
                                "stroke": "gray",
                                "stroke-width": 1,
                                "fill": "white",
                                "cursor": "pointer"
                            });
                            //XXX now paint coding region
                            var	codingStart = 0;
                            var codingEnd = 0;
                            // 5'-UTR
                            if(transcript.genomicCodingStart > exonStart && transcript.genomicCodingStart < exonEnd){
                                codingStart = parseInt(transcript.genomicCodingStart);
                                codingEnd = exonEnd;
                            }else {
                                // 3'-UTR
                                if(transcript.genomicCodingEnd > exonStart && transcript.genomicCodingEnd < exonEnd){
                                    codingStart = exonStart;
                                    codingEnd = parseInt(transcript.genomicCodingEnd);
                                }else
                                // all exon is transcribed
                                if(transcript.genomicCodingStart < exonStart && transcript.genomicCodingEnd > exonEnd){
                                    codingStart = exonStart;
                                    codingEnd = exonEnd;
                                }
//									else{
//										if(exonEnd < transcript.genomicCodingStart){
//
//									}
                            }
                            var coding = codingEnd-codingStart;
                            var codingX = args.pixelPosition+middle-((args.position-codingStart)*args.pixelBase);
                            var codingWidth = (coding+1) * ( args.pixelBase);

                            if(coding > 0 ){
                                var cRect = SVG.addChild(exonGroup,"rect",{
                                    "i":i,
                                    "x":codingX,
                                    "y":checkRowY-1,
                                    "width":codingWidth,
                                    "height":exonSettings.height,
                                    "stroke": color,
                                    "stroke-width": 1,
                                    "fill": color,
                                    "cursor": "pointer"
                                });
                                //XXX draw phase only at zoom 100, where this.pixelBase=10
                                for(var p = 0, lenp = 3 - exon.phase; p < lenp && Math.round(args.pixelBase)==10 && exon.phase!=-1; p++){//==10 for max zoom only
                                    SVG.addChild(exonGroup,"rect",{
                                        "i":i,
                                        "x":codingX+(p*10),
                                        "y":checkRowY-1,
                                        "width":args.pixelBase,
                                        "height":exonSettings.height,
                                        "stroke": color,
                                        "stroke-width": 1,
                                        "fill": 'white',
                                        "cursor": "pointer"
                                    });
                                }
                            }


                        }

                        checkRowY += rowHeight;
                        checkTextY += rowHeight;
                    }
                }// if transcrips != null
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

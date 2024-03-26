/*
 * Copyright 2015-2024 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function Genome(args) {
    _.extend(this, Backbone.Events);

    var _this = this;
    this.id = Utils.genId("CircularComponent");

    //set default args
    this.species;

    _.extend(this, args);

    this.renderedArea = {};

    this.trackList = [];
    this.swapHash = {};

    this.chromosomeGenes = {};

    //events attachments
    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }

}
Genome.prototype = {
    render: function () {

        this.rendered = true;
    },
    draw: function (args) {
        var _this = this;
        _.extend(this, args);

        /** Navigation Bar **/
        this.karyotype = this._createKaryotype(args);

        for (var i = 0; i < this.chromosomes.length; i++) {
            var chr = this.chromosomes[i];
            if (chr.visible != false) {
                this._getChromosomeGenes(chr);
            }
        }
    },
    _createKaryotype: function (args) {
        var _this = this;
        var karyotype = new CircularKaryotype({
            autoRender: true,
            species: this.species,
            angleSize: this.angleSize,
            angleStart: this.angleStart,
            targetId: args.targetId,
            radius: args.radius,
            arcWidth: args.arcWidth,
            chromosomes: this.chromosomes,
            x: args.x,
            y: args.y,
            handlers: {
                'chromosome:click': function (e) {
                    _this.trigger('region:change', e);
                }
            }
        });
        karyotype.draw();
    },
    drawFeatureTrack: function (features, offset, color) {
        var _this = this;
        var feature;
        var segment;
        var chromosome;
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            var chromosomeName = feature.chromosome;
            chromosome = this._getChromosome(chromosomeName);
            if (chromosome) {

                var coeff = chromosome.angleSize / chromosome.size;
                feature.angleStart = (feature.start * coeff) + chromosome.angleStart;
                feature.angleEnd = (feature.end * coeff) + chromosome.angleStart + 0.02;

                var rowY = offset;
                while (true) {
                    if (!(rowY in this.renderedArea)) {
                        this.renderedArea[rowY] = new FeatureBinarySearchTree();
                    }
                    var foundArea = this.renderedArea[rowY].add({start: feature.angleStart, end: feature.angleEnd});
                    if (foundArea) {

                        var curve = SVG.addChild(this.targetId, "path", {
                            "d": SVG.describeArc(this.x, this.y, this.radius + rowY, feature.angleStart, feature.angleEnd),
                            //                "stroke": 'lightblue',
                            "stroke": color,
                            "id": feature.id,
                            "stroke-width": 10,
                            "fill": "none"
                        });

                        $(curve).qtip({
                            content: {text: $(curve).attr("id"), title: ''},
                            //                        position: {target: "mouse", adjust: {x: 15, y: 0}, effect: false},
                            position: {target: "mouse", adjust: {x: 25, y: 15}},
                            style: { width: true, classes: _this.toolTipfontClass + ' ui-tooltip ui-tooltip-shadow'}
                        });
                        $(curve).click(function (event) {
                            console.log($(this).attr("id"));
                        });
                        break;
                    }
                    rowY += 14;
                }

            }
        }

    },
    drawHistogramTrack: function (features, offset, region, color) {
        var chromosome = this._getChromosome(region.chromosome);
//        var d = SVG.describeArc(this.x, this.y, this.radius+offset, chromosome.angleStart, chromosome.angleEnd)+' ';
        var d = '';
        var lastRadius = this.radius + offset;


        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            var coeff = chromosome.angleSize / chromosome.size;
            feature.angleStart = (feature.start * coeff) + chromosome.angleStart;
            feature.angleEnd = (feature.end * coeff) + chromosome.angleStart;

//            centerX, centerY, radius, angleInDegrees
            var count = (feature.features_count * 10);
            var coords1 = SVG._polarToCartesian(this.x, this.y, this.radius + offset, feature.angleStart);
            var coords2 = SVG._polarToCartesian(this.x, this.y, this.radius + offset + count, feature.angleStart);
            var coords3 = SVG._polarToCartesian(this.x, this.y, this.radius + offset + count, feature.angleEnd);
            var coords4 = SVG._polarToCartesian(this.x, this.y, this.radius + offset, feature.angleEnd);
            d += 'M' + coords1.x + ',' + coords1.y + ' ';
            d += 'L' + coords2.x + ',' + coords2.y + ' ';
            d += 'L' + coords3.x + ',' + coords3.y + ' ';
            d += 'L' + coords4.x + ',' + coords4.y + ' Z';
        }


        var curve = SVG.addChild(this.targetId, "path", {
            "d": d,
            "stroke": 'lightgray',
            "stroke-width": 2,
            "fill": color,
            "height":10
        });

    },
    drawSampleTrack: function (features, offset, region, color) {
        var chromosome = this._getChromosome(region.chromosome);
//        var d = SVG.describeArc(this.x, this.y, this.radius+offset, chromosome.angleStart, chromosome.angleEnd)+' ';
        var d = '';
        var lastRadius = this.radius + offset;


        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            var coeff = chromosome.angleSize / chromosome.size;
            feature.angleStart = (feature.start * coeff) + chromosome.angleStart;
            feature.angleEnd = (feature.end * coeff) + chromosome.angleStart;

//            centerX, centerY, radius, angleInDegrees
            var count = (feature.features_count * 10);
            var coords1 = SVG._polarToCartesian(this.x, this.y, this.radius + offset, feature.angleStart);
            var coords2 = SVG._polarToCartesian(this.x, this.y, this.radius + offset + count, feature.angleStart);
            var coords3 = SVG._polarToCartesian(this.x, this.y, this.radius + offset + count, feature.angleEnd);
            var coords4 = SVG._polarToCartesian(this.x, this.y, this.radius + offset, feature.angleEnd);
            d += 'M' + coords1.x + ',' + coords1.y + ' ';
            d += 'L' + coords2.x + ',' + coords2.y + ' ';
            d += 'L' + coords3.x + ',' + coords3.y + ' ';
            d += 'L' + coords4.x + ',' + coords4.y + ' Z';

        }

        var curve = SVG.addChild(this.targetId, "path", {
            "d": d,
            "stroke": 'red',
            "stroke-width": 2,
            "fill": color,
        });

    },

    _getChromosome: function (name) {
        for (var i = 0; i < this.chromosomes.length; i++) {
            if (this.chromosomes[i].name === name) {
                return this.chromosomes[i];
            }
        }
    },
    addTrack: function (track) {
        if (_.isArray(track)) {
            for (var i in track) {
                this._addTrack(track[i]);
            }
        } else {
            this._addTrack(track);
        }
    },
    _addTrack: function (track) {
        var i = this.trackList.push(track);
        this.swapHash[track.id] = {index: i - 1, visible: true};
        track.draw();
    },
    _getChromosomeGenes: function (chromosome) {
        var _this = this;
        var region = new Region(chromosome.name + ':1-' + chromosome.size);

        //Uncomment to activate, long time load !!!

//        if (_.isUndefined(this.chromosomeGenes[chromosome.name])) {
//            CellBaseManager.get({
//                species: this.species,
//                category: 'genomic',
//                subCategory: 'region',
//                resource: 'gene',
//                query: region.toString(),
//                params: {
//                    histogram: true,
//                    interval: 1000000
//                },
//                async: false,
//                success: function (data) {
//                    var features = data.response[0].result;
//                    _this.chromosomeGenes[chromosome.name] = features;
//                   // _this.drawHistogramTrack(features, 30, region, '#9493b1');
//                    _this.drawSampleTrack(features, -60, region, '#9493b1');
//
//                }
//            });
//        } else {
//            _this.drawSampleTrack(this.chromosomeGenes[chromosome.name], 30, region, '#9493b1');
//        }

//        var features = [];
//        var features2 = [];
//        CellBaseManager.get({
//            species: this.species,
//            category: 'genomic',
//            subCategory: 'region',
//            resource: 'gene',
//            query: '6:1-260000000',
//            params: {
//                exclude: 'transcripts',
//                biotype: 'protein_coding'
//            },
//            async: false,
//            success: function (data) {
//                features = data.response[0].result;
//            }
//        });
//        this.drawFeatureTrack(features, 100, 'darkred');

//        CellBaseManager.get({
//            species: this.species,
//            category: 'genomic',
//            subCategory: 'region',
//            resource: 'snp',
//            query: '6:1-1000000',
//            params: {
////                include:'chromosome,start,end',
//                consequence_type: 'non_coding_exon_variant'
//            },
//            async: false,
//            success: function (data) {
//                features2 = data.response[0].result;
//            }
//        });
//        this.drawFeatureTrack(features2, 50, 'darkblue');

    }
}

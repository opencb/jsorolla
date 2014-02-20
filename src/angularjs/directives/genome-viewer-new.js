/**
 * Created by imedina on 17/02/14.
 */

//'use strict';
//angular.module('jsorolla.directives', ['jsorolla.services']);

angular.module('jsorolla.directives').controller('jsorollaGenomeViewerController', ['$scope', '$rootScope', function ($scope, $rootScope) {

    $scope.$on('gv:test2', function(event, region) {
        console.log("Parent - on");
        $scope.$apply(function(){
            $scope.region = region;
        });
    });


    $scope.setRegion = function () {
        console.log("Button pressed");
        var reg = {
            chromosome: "1",
            start: 3288911,
            end: 3288961
        };
        $rootScope.$broadcast('gv:test3', reg);
    };

}]);

angular.module('jsorolla.directives').directive('jsorollaGenomeViewer', function () {
    return {
        restrict: 'E',
//        template: '<div id={{targetId}}></div>',
        replace: false,
        transclude: true,
//        templateUrl: './views/genes-gv.html',
        scope: {
            targetId: '@id',
            species: '=species',
            r: '=region'

        },

        link: function(scope, el, attr) {
            console.log(scope)
            scope.genomeViewer.render();
            scope.genomeViewer.draw();
            scope.genomeViewer.addOverviewTrack(scope.gene);
            scope.genomeViewer.addTrack(scope.tracks);

        },

        controller: function($scope, $rootScope, CellBaseService) {
            console.log('aaaa')
            CELLBASE_HOST = "http://ws-beta.bioinfo.cipf.es/cellbase/rest";
            CELLBASE_VERSION = "v3";


            $scope.broadcastRegion = true;

            $scope.$on('genesRegionToGV', function () {
//                $scope.genomeViewer.setRegion(new Region(mySharedService.genesRegionToGV));

//                if(mySharedService.genesSpecie.shortName == "hsapiens" || mySharedService.genesSpecie.shortName == "mmusculus"){
//
//                    $scope.broadcastRegion = false;
//                    $scope.genomeViewer.setRegion(new Region(mySharedService.genesRegionToGV));
//                    //                $scope.genomeViewer.setSpecies(mySharedService.genesSpecie.shortName);
//                }

            });

            $scope.$on($scope.targetId + ':test3', function(reg, mesg) {
                $scope.genomeViewer.setRegion(mesg);
            });

            /* region and species configuration */
            var region = new Region({
                chromosome: "13",
                start: 32889611,
                end: 32889611
            });

            var availableSpecies = {
                "text": "Species",
                "items": [{
                    "text": "Vertebrates",
                    "items": [{
                        "text": "Homo sapiens",
                        "assembly": "GRCh37.p10",
                        "region": {
                            "chromosome": "13",
                            "start": 32889611,
                            "end": 32889611
                        },
                        "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "X", "Y", "MT"],
                        "url": "ftp://ftp.ensembl.org/pub/release-71/"
                    }, {
                        "text": "Mus musculus",
                        "assembly": "GRCm38.p1",
                        "region": {
                            "chromosome": "1",
                            "start": 18422009,
                            "end": 18422009
                        },
                        "chromosomes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "X", "Y", "MT"],
                        "url": "ftp://ftp.ensembl.org/pub/release-71/"
                    }
                    ]
                }
                ]
            };
            var species = availableSpecies.items[0].items[0];

            $scope.genomeViewer = new GenomeViewer({
                targetId: $scope.targetId,
                region: region,
                availableSpecies: availableSpecies,
                species: species,
                sidePanel: false,
                autoRender: false,
                border: true,
                resizable: true,
                //        quickSearchResultFn:quickSearchResultFn,
                //        quickSearchDisplayKey:,
                karyotypePanelConfig: {
                    collapsed: false,
                    collapsible: true
                },
                chromosomePanelConfig: {
                    collapsed: false,
                    collapsible: true
                },
                handlers:{
                    'region:change':function(event){
//                        if(event.region.chromosome != region.chromosome && event.region.start != region.start && event.region.end != region.end) {
                        if(!(event.sender instanceof GenomeViewer)) {
                            $rootScope.$broadcast($scope.targetId + ':test2', event.region);
                        }
//                        $scope.$emit('test', region);
                        console.log("aaaaaaaaaaaaa")
//                        if(mySharedService.genesSpecie.shortName == "hsapiens" || mySharedService.genesSpecie.shortName == "mmusculus"){
//
//                            if($scope.broadcastRegion){
//                                mySharedService.broadcastGenesRegionGV(event.region.chromosome + ":" + event.region.start + "-" + event.region.end);
//                            }
//                            $scope.broadcastRegion = true;
//                        }
                    },
                    'region:move':function(event){

//                        if(mySharedService.genesSpecie.shortName == "hsapiens" || mySharedService.genesSpecie.shortName == "mmusculus"){
//                            mySharedService.broadcastGenesRegionGV(event.region.chromosome + ":" + event.region.start + "-" + event.region.end);
//                        }
                    },
//                    'chromosome-button:change':function(event){
//                    },
                    'species:change':function(event){
//                        mySharedService.broadcastGenesSpecieGV(event.species.text);
                    }
                }
                //        chromosomeList:[]
                //            trackListTitle: ''
//                            drawNavigationBar = true;
                //            drawKaryotypePanel: false,
//                            drawChromosomePanel: false,
                //            drawRegionOverviewPanel: false
            }); //the div must exist

            $scope.genomeViewer.draw();

            $scope.tracks = [];
            $scope.sequence = new SequenceTrack({
                targetId: null,
                id: 1,
                //        title: 'Sequence',
                height: 30,
                visibleRegionSize: 200,

                renderer: new SequenceRenderer(),

                dataAdapter: new SequenceAdapter({
                    category: "genomic",
                    subCategory: "region",
                    resource: "sequence",
                    species:  $scope.genomeViewer.species
                })
            });

            $scope.tracks.push($scope.sequence);

            $scope.gene = new GeneTrack({
                targetId: null,
                id: 2,
                title: 'Gene',
                minHistogramRegionSize: 20000000,
                maxLabelRegionSize: 10000000,
                minTranscriptRegionSize: 200000,
                height: 140,

                renderer: new GeneRenderer(),

                dataAdapter: new CellBaseAdapter({
                    category: "genomic",
                    subCategory: "region",
                    resource: "gene",
                    species:  $scope.genomeViewer.species,
                    params: {
                        exclude: 'transcripts.tfbs,transcripts.xrefs,transcripts.exons.sequence'
                    },
                    cacheConfig: {
                        chunkSize: 50000
                    }
                })
            });

            $scope.tracks.push($scope.gene);

            var renderer = new FeatureRenderer(FEATURE_TYPES.gene);
            renderer.on({
                'feature:click': function(event) {
                    // feature click event example
                    console.log(event)

                }
            });
            $scope.gene = new FeatureTrack({
                targetId: null,
                id: 2,
                //        title: 'Gene',
                minHistogramRegionSize: 20000000,
                maxLabelRegionSize: 10000000,
                height: 100,

                renderer: renderer,

                dataAdapter: new CellBaseAdapter({
                    category: "genomic",
                    subCategory: "region",
                    resource: "gene",
                    params: {
                        exclude: 'transcripts'
                    },
                    species:  $scope.genomeViewer.species,
                    cacheConfig: {
                        chunkSize: 50000
                    }
                })
            });
//            $scope.genomeViewer.addOverviewTrack(gene);

            $scope.snp = new FeatureTrack({
                targetId: null,
                id: 4,
                title: 'SNP',
                featureType: 'SNP',
                minHistogramRegionSize: 12000,
                maxLabelRegionSize: 3000,
                height: 100,

                renderer: new FeatureRenderer(FEATURE_TYPES.snp),

                dataAdapter: new CellBaseAdapter({
                    category: "genomic",
                    subCategory: "region",
                    resource: "snp",
                    params: {
                        exclude: 'transcriptVariations,xrefs,samples'
                    },
                    species:  $scope.genomeViewer.species,
                    cacheConfig: {
                        chunkSize: 10000
                    }
                })
            });
            $scope.tracks.push($scope.snp);


//            $scope.genomeViewer.addTrack(tracks);
        }





    }
});

/**
 * Created by imedina on 17/02/14.
 */

//'use strict';
//angular.module('jsorolla.directives', ['jsorolla.services']);

angular.module('jsorolla.directives').controller('jsorollaGenomeViewerController', ['$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.$on('test2', function(event, region) {
        console.log("Parent - on");
        $scope.$apply(function(){
            $scope.region = region;
        });
    });

//    $scope.region = {
//        chromosome: "1",
//        start: 3288911,
//        end: 3288961
//    };

    $scope.setRegion = function () {
        console.log("Button pressed");
        var reg = {
            chromosome: "1",
            start: 3288911,
            end: 3288961
        };
        $rootScope.$broadcast('test3', reg);
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
            species: '@species',
            region: '@region'

        },

        link: function($scope, el, $attr) {
            $scope.region = "13:32931615-32931801";
            $scope.species = "Homo sapiens";
            $scope.cellbaseHost = "http://www.ebi.ac.uk/cellbase/webservices/rest";
            $scope.cellbaseVersion = "v3";

            CELLBASE_HOST = $scope.cellbaseHost;
            CELLBASE_vesrion = $scope.cellbaseVersion;

///            _.extend($scope, $attr);
            $scope.species = $scope.availableSpecies.items[0].items[0];
            $scope.tracks = [];
            if($scope.species == undefined) {
                $scope.species = "Homo sapiens";
            }

            $scope.regionObj = new Region($attr.region);

            $scope.genomeViewer = new GenomeViewer({
                targetId: $scope.targetId,
                host: $scope.cellbaseHost,
                version: $scope.cellbaseversion,
                region: $scope.regionObj,
                availableSpecies: $scope.availableSpecies,
                species: $scope.species,
                sidePanel: false,
                autoRender: false,
                border: true,
                resizable: true,
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
                            $rootScope.$broadcast('test2', event.region);
                        }
                        console.log("aaaaaaaaaaaaa")
                    },
                    'region:move':function(event){

                    },
//                    'chromosome-button:change':function(event){
//                    },
                    'species:change':function(event){
//                        mySharedService.broadcastGenesSpecieGV(event.species.text);
                    }
                }
            }); //the div must exist

            $scope.sequence = new SequenceTrack({
                targetId: null,
                id: 1,
                //        title: 'Sequence',
                height: 30,
                visibleRegionSize: 200,

                renderer: new SequenceRenderer(),

                dataAdapter: new SequenceAdapter({
                    host: $scope.cellbaseHost,
                    version: $scope.cellbaseversion,
                    category: "genomic",
                    subCategory: "region",
                    resource: "sequence",
//                    species:  $$scope.genomeViewer.species
                    species:  $scope.species
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
                    host: $scope.cellbaseHost,
                    version: $scope.cellbaseversion,
                    category: "genomic",
                    subCategory: "region",
                    resource: "gene",
//                    species:  $$scope.genomeViewer.species,
                    species:  $scope.species,
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
                    host: $scope.cellbaseHost,
                    version: $scope.cellbaseversion,
                    category: "genomic",
                    subCategory: "region",
                    resource: "gene",
                    params: {
                        exclude: 'transcripts'
                    },
//                    species:  $$scope.genomeViewer.species,
                    species:  $scope.species,
                    cacheConfig: {
                        chunkSize: 50000
                    }
                })
            });
            $scope.genomeViewer.render();
            $scope.genomeViewer.draw();
            $scope.genomeViewer.addOverviewTrack($scope.gene);
            $scope.genomeViewer.addTrack($scope.tracks);

        },

        controller: function($scope, $rootScope, CellBaseService) {
//            CELLBASE_HOST = "http://ws-beta.bioinfo.cipf.es/cellbase/rest";
//            CELLBASE_HOST = "http://www.ebi.ac.uk/cellbase/webservices/rest";
//            CELLBASE_VERSION = "v3";

            $scope.$on('genesRegionToGV', function () {
//                $scope.genomeViewer.setRegion(new Region(mySharedService.genesRegionToGV));
            });

            $scope.$on('test3', function(reg, mesg) {
                $scope.genomeViewer.setRegion(mesg);
            });

            /* region and species configuration */
            $scope.region = new Region({
                chromosome: "13",
                start: 32889611,
                end: 32889611
            });

            $scope.availableSpecies = {
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
        }

    }
});
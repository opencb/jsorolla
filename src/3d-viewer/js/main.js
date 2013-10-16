window.torus = {};
var components;

function main() {


    //Montar components
    var cellbase = chrjson;
    components = fakeJSON(cellbase);

    var url = "http://ws-beta.bioinfo.cipf.es/cellbasebeta2/rest/v3/hsapiens/genomic/chromosome/all?of=json";
        url = "http://ws.bioinfo.cipf.es/cellbase/rest/latest/hsa/genomic/region/1/gene?histogram=true&interval=2000000&of=json";
    $.getJSON(url, function(res){addHisto(res);});


}

function initTorus(){
    var canvas = document.getElementById("application");

    window.torus = new Torus(components, canvas);
    torus.viewer.pause();
}


function addHisto (cellbase){

    components.commons.hsapiens.chromosomes[0].histograms = {};
    components.commons.hsapiens.chromosomes[0].histograms.genes = cellbase;

    initTorus();
}


function fakeJSON(cellbase){

    var numDisks = 15;
    components = {};
    components.commons = {};
    components.commons.hsapiens = {};
    components.commons.hsapiens.chromosomes = cellbase.result.result[0].chromosomes;
    components.commons.hsapiens.chromosomes.sort(function(a, b){
        var a2 = parseInt(a.name);
        var b2 = parseInt(b.name);
        if(a.name == 'X') {
            a2 = 23;
        }
        if(b.name == 'Y') {
            b2 = 24;
        }
        if(b.name == 'X') {
            b2 = 23;
        }
        if(a.name == 'Y') {
            a2 = 24;
        }
        if(a.name == 'MT') {
            a2 = 25;
        }
        if(b.name == 'MT') {
            b2 = 25;
        }

        return a2- b2;
//        return parseInt(a.name, 10)-parseInt(b.name, 10);
    });
    components.commons.hsapiens.chromosomes.pop();

    components.samples = new Array(numDisks);
    for (var i = 0; i < numDisks; i++){
        components.samples[i] = {};
        components.samples[i].species = 'hsapiens';
    }



    components.config = {
        type: "torus",  // cylinder, plane
        torusRadius: 4,
        diskRadius: 2,
        diskWidth: 1, // [0, 1]
        diskAperture: 0.1,  //[0,1]
        polygonPrecision: 50,
        texturePrecision: 5000,
        numLayers: 2,
        layerSeparation: [0, 0.02],
        pad:0.005,
        numDisk: numDisks,
        width:  window.innerWidth,
        height: window.innerHeight,
        doubleFigure: true
    };
    console.log(components);
    return components;
}

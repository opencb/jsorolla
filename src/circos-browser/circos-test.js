let CircosTest = {
    "buildHistogramData": function (chromosomes) {
        let binLength = 10000000;
        return chromosomes.map(function (chromosome) {
            let output = {
                "name": chromosome.name,
                "values": []
            };
            //Build the data
            for (let i = 0; i * binLength < chromosome.size; i++) {
                let position = i * binLength;
                output.values.push({
                    "start": position,
                    "end": Math.min(position + binLength, chromosome.size),
                    "value": Math.floor(Math.random() * 100) 
                });
            }
            //Return the data for this chromosome
            return output;
        });
    },
    "buildChordsData": function (chromosomes) {
        let getRandomChromosomePosition = function () {
            let index = Math.floor(Math.random() * chromosomes.length);
            let chr = chromosomes[index];
            let position = Math.floor(Math.random() * chr.size);
            return {
                "name": chr.name,
                "start": Math.max(chr.start, position - 2000000 - Math.floor(Math.random() * 1500000)),
                "end": Math.min(chr.end, position + 2000000 + Math.floor(Math.random() * 1500000)),
            };
        };
        let numberOfChords = 10 + Math.floor(Math.random() * 20);
        return Array(numberOfChords).fill().map(function () {
            return {
                "source": getRandomChromosomePosition(),
                "target": getRandomChromosomePosition()
            };
        });
    }
};


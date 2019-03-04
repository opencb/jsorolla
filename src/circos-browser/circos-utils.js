let CircosUtils = {
    "polarToCartesian": function (centerX, centerY, radius, angle) {
        return {
            "x": centerX + radius * Math.cos(angle),
            "y": centerY + radius * Math.sin(angle)
        };
    },
    "sortChromosomes": function (list) {
        list.sort(function (a, b) {
            let aInt = parseInt(a.name);
            let bInt = parseInt(b.name);
            if (isNaN(aInt) && isNaN(bInt)) {
                if (a.name === "MT") {
                    return 1;
                }
                else if (b.name === "MT") {
                    return -1;
                }
                else {
                    return (a.name < b.name) ? -1 : 1;
                }
            }
            else if (isNaN(aInt)) {
                return 1;
            }
            else if (isNaN(bInt)) {
                return -1;
            }
            else {
                return (aInt < bInt) ? -1 : 1;
            }
        });
    }
};


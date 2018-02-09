/*
 * This object provides basic SVG shapes to be displayed in NetworkBrowser tool
 * SVG paths tutorial: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
 */
let BasicNetworkSvgShapes = {
    "circle": function (size) {
        let path = [];
        path.push("M", 0, 0);
        path.push("m", - size / 2, 0);
        path.push("a", size / 2, size / 2, 0, 1, 0, size, 0);
        path.push("a", size / 2, size / 2, 0, 1, 0, -size, 0);
        path.push("Z");
        return path.join(" ");
    },
    "square": function (size) {
        let path = [];
        path.push("M", 0, 0);
        path.push("m", -size / 2, -size / 2);
        path.push("l", size, 0);
        path.push("l", 0, size);
        path.push("l", -size, 0);
        path.push("l", 0, -size);
        path.push("Z");
        return path.join(" ");
    }
};


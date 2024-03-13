export default {
    // @description convert hex color ('#000000') to RGB ('rgb(0, 0, 0)')
    // This is useful when checking the color of an element using .should('have.css', 'background-color', xxxx),
    // as it returns the color in RGB format instead of in HEX format
    hexToRgb: hexColor => {
        hexColor = hexColor.replace("#", "");
        const values = [
            parseInt(hexColor.substring(0, 2), 16),
            parseInt(hexColor.substring(2, 4), 16),
            parseInt(hexColor.substring(4), 16),
        ];
        return `rgb(${values.join(", ")})`;
    },

};

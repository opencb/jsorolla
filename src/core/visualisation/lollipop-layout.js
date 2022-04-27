export default class LollipopLayout {

    constructor(config) {
        this.config = {
            ...this.getDefaultConfig(),
            ...(config || {}),
        };
    }

    // Gelerate lollipop layout
    layout(features, region, width) {
        const length = region.length();
        return features.map(feature => {
            const position = (feature.end + feature.start) / 2;
            return width * (position - region.start) / length;
        });
    }

    getDefaultConfig() {
        return {
            minSeparation: 12,
        };
    }

}

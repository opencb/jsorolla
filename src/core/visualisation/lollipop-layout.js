export default {
    MIN_SEPARATION: 10,

    // Generate lollipop layout from features list
    fromFeaturesList(features, region, width, config) {
        const length = region.length();
        const initialPositions = features.map(feature => {
            let position = null;
            if (typeof feature.position === "number") {
                position = feature.position;
            } else {
                position = feature.start + Math.max(Math.abs(feature.end - feature.start + 1), 1) / 2;
            }
            return width * (position - region.start) / length;
        });

        return this.layout(initialPositions, {
            ...config,
            minSeparation: Math.min(config?.minSeparation ?? this.MIN_SEPARATION, width / features.length),
        });
    },

    // Layout generator
    layout(initialPositions, config) {
        const minSeparation = config?.minSeparation ?? this.MIN_SEPARATION;
        const positions = [];
        let i = 0;
        while (i < initialPositions.length) {
            let center = initialPositions[i];
            let centerSum = initialPositions[i];
            let centerWidth = minSeparation;
            let count = 1;
            // Right side of the current point
            let j = i + 1;
            while (j < initialPositions.length && (center + centerWidth / 2) > initialPositions[j] - minSeparation / 2) {
                centerWidth = centerWidth + minSeparation;
                centerSum = centerSum + initialPositions[j];
                count = count + 1;
                // center = Math.min(width - centerWidth / 2, centerSum / count);
                center = centerSum / count;
                j = j + 1;
            }
            // Left side of the current point
            let w = i - 1;
            while (w >= 0 && center - centerWidth / 2 < positions[w] + minSeparation / 2) {
                centerWidth = centerWidth + minSeparation;
                centerSum = centerSum + initialPositions[w];
                count = count + 1;
                center = Math.max(centerWidth / 2, centerSum / count);
                w = w - 1;
            }
            // Update the positions
            const start = Math.max(0, center - centerWidth / 2);
            for (let k = 0; k + w + 1 < j; k++) {
                positions[k + w + 1] = start + ((k + 0.5) * minSeparation);
            }
            // Update the i index
            i = j;
        }
        // Return processed positions
        return positions;
    },
};

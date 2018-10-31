class CatalogUIUtils {

    static parseVariableSetVariablesForDisplay(variables, tags, margin, config) {
        config = Object.assign({
            marginStep: 15,
            onlyAllowLeafSelection: true
        }, config);

        let displayVariables = [];

        for (let i in variables) {
            let variable = variables[i];

            if (variable.type !== "OBJECT") {

                // Add variable
                displayVariables.push({
                    id: variable.id,
                    name: UtilsNew.defaultString(variable.name, variable.id),
                    category: variable.category,
                    type: variable.type,
                    defaultValue: variable.defaultValue,
                    multiValue: variable.multiValue,
                    allowedValues: variable.allowedValues,
                    disabled: false,
                    margin: margin,
                    cursor: "pointer",

                    tags: tags.concat(variable.id).join(".")
                });
            } else {
                // Add variable
                displayVariables.push({
                    id: variable.id,
                    name: UtilsNew.defaultString(variable.name, variable.id),
                    category: variable.category,
                    type: variable.type,
                    defaultValue: variable.defaultValue,
                    multiValue: variable.multiValue,
                    allowedValues: variable.allowedValues,
                    disabled: config.onlyAllowLeafSelection,
                    margin: margin,
                    cursor: config.onlyAllowLeafSelection ? "default" : "pointer",

                    tags: tags.concat(variable.id).join(".")
                });

                displayVariables = displayVariables.concat(this.parseVariableSetVariablesForDisplay(variable.variableSet,
                    tags.concat(variable.id), margin + config.marginStep, config));
            }
        }

        return displayVariables;
    }

}
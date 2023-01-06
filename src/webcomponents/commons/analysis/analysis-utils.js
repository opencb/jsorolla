import {html} from "lit";
import NotificationUtils from "../utils/notification-utils";
import UtilsNew from "../../../core/utils-new";


export default class AnalysisUtils {

    // static check(status, message) {
    //     return {
    //         status: status,
    //         message: message
    //     };
    // }

    static submit(id, promise, context) {
        promise
            .then(response => {
                console.log(response);
                NotificationUtils.dispatch(context, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `${id} launched`,
                    message: `${id} has been launched successfully`,
                });
                // Call to analysis onClear() method
                context.onClear();
            })
            .catch(response => {
                console.log(response);
                NotificationUtils.dispatch(context, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    static fillJobParams(toolParams, prefix) {
        return {
            jobId: toolParams.jobId || `${prefix}-${UtilsNew.getDatetime()}`,
            jobTags: toolParams.jobTags || "",
            jobDescription: toolParams.jobDescription || "",
        };
    }

    static getVariantQueryConfiguration(prefix = "", ignoreList = [], opencgaSession, callback) {
        return [
            {
                title: "Gene",
                field: prefix + "gene",
                type: "input-text",
                display: {
                    visible: !ignoreList?.includes("gene")
                },
            },
            {
                title: "Biotype",
                field: prefix + "biotype",
                type: "select",
                allowedValues: BIOTYPES,
                display: {
                    visible: !ignoreList?.includes("biotype")
                },
            },
            {
                title: "Type",
                field: prefix + "type",
                type: "select",
                allowedValues: VARIANT_TYPES,
                display: {
                    visible: !ignoreList?.includes("type")
                },
            },
            {
                title: "Consequence Type",
                field: prefix + "ct",
                type: "custom",
                display: {
                    visible: !ignoreList?.includes("ct"),
                    render: (ct, dataFormFilterChange) => {
                        return html`
                            <consequence-type-select-filter
                                .ct="${ct}"
                                .config="${CONSEQUENCE_TYPES}"
                                @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                            </consequence-type-select-filter>
                        `;
                    }
                }
            },
            {
                title: "Disease Panel",
                field: prefix + "panel",
                type: "select",
                allowedValues: opencgaSession?.study?.panels?.map(panel => (
                    {
                        id: panel.id,
                        name: `${panel.name}
                        ${panel.source ? ` - ${panel.source.author || ""} ${panel.source.project} ${panel.source.version ? "v" + panel.source.version : ""}` : ""}
                        ${panel.stats ? ` (${panel.stats.numberOfGenes} genes, ${panel.stats.numberOfRegions} regions)` : ""}`}
                )) || [],
                display: {
                    visible: !ignoreList?.includes("panel")
                },
            },
        ];
    }

    static getAnalysisConfiguration(id, title, description, paramSections, check) {
        return {
            id: id,
            title: title,
            description: description,
            display: {
                // defaultLayout: "vertical"
            },
            sections: [
                {
                    display: {},
                    elements: [
                        {
                            type: "notification",
                            text: check?.message || "No message defined.",
                            display: {
                                // visible: () => check ? !check.status : false,
                                visible: () => !!check?.message,
                                notificationType: check?.notificationType || "warning",
                            },
                        },
                    ]
                },
                ...paramSections,
                {
                    title: "Job Info",
                    elements: [
                        {
                            title: "Job ID",
                            field: "jobId",
                            type: "input-text",
                            display: {
                                placeholder: `${id}-${UtilsNew.getDatetime()}`,
                                help: {
                                    text: "If empty then it is automatically initialized with the tool ID and current date"
                                }
                            },
                        },
                        {
                            title: "Tags",
                            field: "jobTags",
                            type: "input-text",
                            display: {
                                placeholder: "Add job tags...",
                            },
                        },
                        {
                            title: "Description",
                            field: "jobDescription",
                            type: "input-text",
                            display: {
                                rows: 2,
                                placeholder: "Add a job description...",
                            },
                        },
                    ]
                }
            ]
        };
    }

}

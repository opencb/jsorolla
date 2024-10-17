import {html} from "lit";
import NotificationUtils from "../utils/notification-utils";
import UtilsNew from "../../../core/utils-new";
import "../filters/feature-filter.js";
import "../filters/disease-panel-filter.js";
import LitUtils from "../utils/lit-utils";

export default class AnalysisUtils {

    // static check(status, message) {
    //     return {
    //         status: status,
    //         message: message
    //     };
    // }

    static submit(id, promise, context) {
        return promise
            .then(response => {
                console.log(response);
                NotificationUtils.dispatch(context, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `${id} launched`,
                    message: `${id} has been launched successfully`,
                });
                // Call to analysis onClear() method
                if (typeof context.onClear === "function") {
                    context.onClear();
                }
                return response;
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
                type: "custom",
                display: {
                    render: (genes, dataFormFilterChange) => html`
                        <feature-filter
                            .cellbaseClient="${opencgaSession.cellbaseClient}"
                            .query=${{gene: genes}}
                            @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                        </feature-filter>
                    `,
                    visible: !ignoreList?.includes("gene"),
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
                    render: (ct, dataFormFilterChange) => html`
                        <consequence-type-select-filter
                            .ct="${ct}"
                            .config="${CONSEQUENCE_TYPES}"
                            @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                        </consequence-type-select-filter>
                    `,
                }
            },
            {
                title: "Disease Panel",
                field: prefix + "panel",
                type: "custom",
                display: {
                    visible: !ignoreList?.includes("panel"),
                    render: (panel, dataFormFilterChange, updateParams) => html`
                        <disease-panel-filter
                            .opencgaSession="${opencgaSession}"
                            .diseasePanels="${opencgaSession.study?.panels || []}"
                            .panel="${panel}"
                            .showExtendedFilters="${false}"
                            .showSelectedPanels="${false}"
                            .multiple="${false}"
                            .classes="${updateParams?.panels ? "selection-updated" : ""}"
                            @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                        </disease-panel-filter>
                    `,
                },
            },
        ];
    }

    static getAnalysisConfiguration(id, title, description, paramSections, check, config = {}) {
        return {
            id: id,
            icon: config.icon || "",
            title: config.title || title,
            description: config.description || description,
            display: {
                // defaultLayout: "vertical"
                ...config?.display
            },
            buttons: config?.buttons || {},
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
                    display: {
                        visible: config.isJob !== undefined ? config.isJob : true,
                    },
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

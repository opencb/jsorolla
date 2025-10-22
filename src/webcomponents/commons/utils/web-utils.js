/*
 * Copyright 2015-present OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export default class WebUtils {

    static formatDisplayName(id, name, defaultValue = "-") {
        if (id && name && id !== name) {
            // First case: both id and name exists and are not empty
            return `${name} (${id})`;
        } else if (name) {
            // Second case: only name exists
            return name;
        } else if (id) {
            // Third case: only id exists
            return id;
        } else {
            // Fallback: neither id and name exists
            return defaultValue;
        }
    }

    // Note: this is an alias to 'formatDisplayName', where the argument is an object that contains 'id' and/or 'name'
    static getDisplayName(item, defaultValue) {
        return WebUtils.formatDisplayName(item?.id, item?.name, defaultValue);
    }

    static getPermissionID(resource, mode) {
        // Note 20240620 Vero: The permissions IDs have been retrieved from the following document:
        // https://github.com/opencb/opencga/blob/develop/docs/manual/data-management/sharing-and-permissions/permissions.md
        const mapResourcePermissionId = {
            "INDIVIDUAL": "INDIVIDUALS",
            "SAMPLE": "SAMPLES",
            "COHORT": "COHORTS",
            "FAMILY": "FAMILIES",
            "DISEASE_PANEL": "PANELS",
            "JOB": "JOBS",
            "FILE": "FILES",
            "CLINICAL_ANALYSIS": "CLINICAL_ANALYSIS",
            "CLINICAL_VARIANT": "CLINICAL_VARIANT",
            "VARIANT": "VARIANT",
            "PROJECT": "PROJECTS",
            "STUDY": "STUDIES",
            "USER": "USERS",
            "NOTE": "NOTE",
            "WORKFLOW": "WORKFLOWS",
        };
        return (resource && mapResourcePermissionId[resource] && mode) ? `${mode.toUpperCase()}_${mapResourcePermissionId[resource]}` : "";
    }

    static getLink(opencgaSession, app = null, tool = null, query = {}) {
        const hashItems = [
            app,
            tool,
            opencgaSession?.project?.id || "",
            opencgaSession?.study?.id || "",
        ];
        const queryStr = Object.keys(query || {}).length > 0 ? "?" + (new URLSearchParams(query)).toString() : "";

        return `#${hashItems.filter(Boolean).join("/")}${queryStr}`;
    }

    static getIVALink(opencgaSession, app, tool, query = {}) {
        const baseUrl = (new URL(window.location.pathname, window.location.origin));
        return baseUrl + WebUtils.getLink(opencgaSession, app, tool, query);
    }

    static getInterpreterLink(opencgaSession, query = {}) {
        return WebUtils.getLink(opencgaSession, "clinical", "interpreter", query);
    }

    static getClinicalAnalysisPriorityColour(rank) {
        const priorityRankToColor = {
            1: "bg-danger", // URGENT
            2: "bg-warning", // HIGH
            3: "bg-primary", // NORMAL
            4: "bg-info", // LOW
            5: "bg-light text-dark", // UNKNOWN
        };

        return priorityRankToColor[rank] ?? "";
    }

    static getResponseEvents(response) {
        return [...(response?.events || []), ...(response?.responses?.[0]?.events || [])].filter(event => {
            return event && !!event.message;
        });
    }

    /**
     * Apply line clamping to a container and attach a toggle
     * @param {HTMLElement} container - element containing the text
     * @param {number} [lines=2] - number of lines to clamp
     * @param {string} [toggleTextClass='text-primary'] - optional CSS class for the toggle
     */
    static clampText(container, lines = 2, toggleTextClass = "text-primary fw-semibold") {
        if (!(container instanceof HTMLElement)) {
            console.warn("clampText: container is not a valid HTMLElement", container);
            return;
        }

        // Add clamping CSS safely
        container.style.display = '-webkit-box';
        container.style.webkitBoxOrient = 'vertical';
        container.style.webkitLineClamp = String(lines);
        container.style.overflow = 'hidden';
        container.style.textOverflow = 'ellipsis';

        // Create toggle only if not already present
        let toggle = container.nextElementSibling;
        if (!toggle || !toggle.classList.contains("clamp-toggle")) {
            toggle = document.createElement("span");
            toggle.className = `clamp-toggle mb-2 ${toggleTextClass}`;
            toggle.style.cursor = "pointer";
            toggle.style.marginLeft = "";
            toggle.style.userSelect = "none";
            toggle.style.color = "indigo-700";
            toggle.textContent = "Read more";
            container.insertAdjacentElement("afterend", toggle);
        }

        // Hide toggle if text fits
        const isOverflowing = container.scrollHeight > container.clientHeight + 1;
        toggle.style.display = isOverflowing ? "inline" : "none";

        // Toggle click handler
        let expanded = false;
        toggle.onclick = () => {
            expanded = !expanded;
            container.style.webkitLineClamp = expanded ? "unset" : String(lines);
            container.style.overflow = expanded ? "visible" : "hidden";
            toggle.textContent = expanded ? "Read less" : "Read more";
        };
    }

}

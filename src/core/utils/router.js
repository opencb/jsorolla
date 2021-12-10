// Router utils class
export default class RouterUtils {

    // Add a leading slash to a path string
    static addLeadingSlash(path) {
        return path.charAt(0) === "/" ? path : "/" + path;
    }

    // Redirect to the specified url
    static goto(pathname, query) {
        window.location.hash = RouterUtils.buildUrl(pathname, query);
    }

    // Generate the url
    static buildUrl(pathname, query) {
        const queryString = query ? `?${new URLSearchParams(query).toString()}` : "";

        return "#!" + RouterUtils.addLeadingSlash(pathname) + queryString;
    }

    // Get the current URL object
    static getCurrentUrl() {
        return new URL(window.location.hash.substring(2) || "/", "https://jsorolla");
    }

    // Split a path by slashes
    static splitPath(path) {
        return path.trim().split("/").filter(p => p.length > 0);
    }

    // Check if a path matches the pattern
    static testPath(path, pattern, exact) {
        const params = {};
        const pathItems = RouterUtils.splitPath(path);
        const patternItems = RouterUtils.splitPath(pattern);

        // Check the number of path items
        if (exact === true && pathItems.length !== patternItems.length) {
            return null;
        }

        // Check all path items
        for (let i = 0; i < patternItems.length; i++) {
            // Check for dynamic parameter
            if (patternItems[i].charAt(0) === ":" && pathItems[i]) {
                const key = patternItems[i].substring(1);
                params[key] = pathItems[i]; // Save param value
            } else if (pathItems[i] !== patternItems[i]) {
                return null;
            }
        }

        // Paths matches
        return params;
    }

    static escape(str) {
        return window.encodeURIComponent(str);
    }

    static unescape(str) {
        return window.decodeURIComponent(str.replace(/\+/g, " "));
    }

}

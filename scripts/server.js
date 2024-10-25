/* eslint-disable no-undef */
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const mime = require("mime-types");

const PORT = process.env.PORT || 4000;

// send the provided file as a response
const sendFile = (request, response, filePath) => {
    const pathExists = fs.existsSync(filePath);
    const pathIsDirectory = pathExists && fs.statSync(filePath).isDirectory();
    // 1. File exists and is not a directory
    if (pathExists && !pathIsDirectory) {
        response.writeHead(200, {
            "Content-Type": mime.lookup(path.basename(filePath)),
        });
        return fs.createReadStream(filePath).pipe(response);
    }
    // 2. Path is a directory: redirect to the same url but adding the trailing '/'
    if (pathExists && pathIsDirectory) {
        response.writeHead(302, {location: request.url + "/"});
        return response.end();
    }
    // 3. Path does not exist: send a 404 message
    response.writeHead(404);
    response.end("Not found.");
};

const server = http.createServer((request, response) => {
    // Capture all requests to 'test-data' folder
    if (request.url.includes("test-data/")) {
        // Note: test-data folder is always on the root of the jsorolla project
        const testDataPath = path.join("../test-data", request.url.replace(/^[\w/\-_]*test-data\//, ""));
        return sendFile(request, response, path.resolve(__dirname, testDataPath));
    }
    // If request does not contain 'test-data', try to find the file inside 'build' folder
    // We will make sure that if request is a folder, the file 'index.html' file is served
    const paths = [process.cwd(), "build", request.url];
    if (request.url.endsWith("/")) {
        paths.push("index.html");
    }
    return sendFile(request, response, path.join(...paths));
});

// Launch server
server.listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);

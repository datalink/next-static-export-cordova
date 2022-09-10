#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var process = require("process");

/**
 * Reads a directory recorsively
 * @param dirPath
 * @param arrayOfFiles
 * @returns {*[]}
 */
const readDirRecursiveSync = function (dirPath, arrayOfFiles = null) {
    files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file)
            .isDirectory()) {
            arrayOfFiles = readDirRecursiveSync(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(dirPath + "/" + file);
        }
    });

    return arrayOfFiles;
};

// Search within the ./out directory
var outDirPath = "./out";

if (!fs.existsSync(outDirPath)) {
    console.log("No ./out directory exists - run 'next export' first");
    process.exit(1);
}

// Find "/_next/" and replace with "/next/" in the html files
console.log("Scanning directory " + outDirPath + " for html files");
var REGEX = /(\/_next\/)/gm;
var REPLACE = "/next/";
readDirRecursiveSync(outDirPath)
    .forEach((file) => {
        console.debug("Scanning " + file);
        let contents = fs.readFileSync(file)
            .toString();
        let i = 0;
        let loop = REGEX.test(contents);
        while (loop) {
            contents = contents.replace(REGEX, REPLACE);
            loop = REGEX.test(contents);
            i++;
        }
        if (i > 0) {
            console.log("Fixed " + file + "(" + i + " occurrances)");
            fs.writeFileSync(file, contents);
        }
    });

// Move the /_next directory to /next
if (fs.existsSync(outDirPath + "/_next")) {
    console.log("Renaming '/_next' to '/next'");
    fs.renameSync(outDirPath + "/_next", outDirPath + "/next");
}

// Move source map files
console.log("Checking for map files");
readDirRecursiveSync(outDirPath)
    .filter((file) => file.substr(file.length - 3) === ".js")
    .forEach((file) => {
        let inputMapFile = file.replace("./out/next", "./.next") + ".map";
        let outputMapFile = file + ".map";
        console.debug("Checking for map file " + inputMapFile);
        if (fs.existsSync(inputMapFile)) {
            console.log("Copying map file " + inputMapFile + " to " + outputMapFile);
            fs.copyFileSync(inputMapFile, outputMapFile);
        }
    });

console.log("Done");

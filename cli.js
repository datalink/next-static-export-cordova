#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const process = require("process");

/**
 * Reads a directory recursively
 *
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
const outDirPath = "./out";

if (!fs.existsSync(outDirPath)) {
    console.log("No ./out directory exists - run 'next export' first");
    process.exit(1);
}

// Find "/_next/" and replace with "/next/" in the html files
console.log("Scanning directory " + outDirPath + " for html files...");
const REGEX = /(\/_next\/)/gm;
const REPLACE = "/next/";

let numFilesScanned = 0;
let numFilesAffected = 0;
readDirRecursiveSync(outDirPath)
    .forEach((file) => {
        numFilesScanned++;
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
            fs.writeFileSync(file, contents);
            numFilesAffected++;
        }
    });
console.log(`> Scanned ${numFilesScanned} files, changed ${numFilesAffected} files`);

// Move the /_next directory to /next
if (fs.existsSync(outDirPath + "/_next")) {
    console.log("Renaming '/_next' to '/next'");
    fs.renameSync(outDirPath + "/_next", outDirPath + "/next");
}

// Move source map files
console.log("Checking for map files...");
numFilesScanned = 0;
numFilesAffected = 0;
readDirRecursiveSync(outDirPath)
    .filter((file) => file.substr(file.length - 3) === ".js")
    .forEach((file) => {
        numFilesScanned++;
        let inputMapFile = file.replace("./out/next", "./.next") + ".map";
        let outputMapFile = file + ".map";
        if (fs.existsSync(inputMapFile)) {
            fs.copyFileSync(inputMapFile, outputMapFile);
            numFilesAffected++;
        }
    });
console.log(`> Scanned ${numFilesScanned} files, changed ${numFilesAffected} files`);

console.log("Done");

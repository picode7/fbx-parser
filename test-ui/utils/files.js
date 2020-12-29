"use strict";
function downloadText(filename, text) {
    var blob = new Blob([text], { type: "text/plain" });
    if (filename.indexOf(".") === -1)
        filename += ".txt";
    download(blob, filename);
}
function download(blob, filename) {
    var el = document.createElement("a");
    var url = URL.createObjectURL(blob);
    el.setAttribute("href", url);
    el.setAttribute("download", filename);
    el.style.display = "none";
    document.body.appendChild(el);
    el.click();
    setTimeout(function () {
        URL.revokeObjectURL(url);
    }, 150);
    document.body.removeChild(el);
}
function openTextFile(callback, accept) {
    if (accept === void 0) { accept = "*"; }
    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = accept;
    fileInput.style.display = "none";
    fileInput.addEventListener("change", function (e) {
        var _a, _b;
        //@ts-ignore
        var files = (_b = (_a = e) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.files;
        if (files === null)
            return;
        var file = files[0];
        if (typeof file === "undefined")
            return;
        var reader = new FileReader();
        reader.addEventListener("load", function (eLoad) {
            var _a;
            var contents = (_a = eLoad.target) === null || _a === void 0 ? void 0 : _a.result;
            callback(file, contents);
            document.body.removeChild(fileInput);
        });
        reader.readAsText(file);
    });
    document.body.appendChild(fileInput);
    fileInput.click();
}
/**
 * Returns the file extension, case sensitive.
 * @param filename
 */
function getFileExtension(filename) {
    // prevent errors with null and undefined
    if (typeof filename !== "string")
        return "";
    var lastDot = filename.lastIndexOf(".");
    if (lastDot === -1) {
        return "";
    }
    return filename.slice(lastDot + 1);
}
/**
 * Returns the file base name without it's extention. Input expected without path.
 * @param filename filename without path.
 */
function getFileBaseName(filename) {
    // prevent errors with null and undefined
    if (typeof filename !== "string")
        return "";
    var lastDot = filename.lastIndexOf(".");
    if (lastDot === -1) {
        return "";
    }
    return filename.slice(0, lastDot);
}

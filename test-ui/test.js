"use strict";
function init() {
    var _a;
    (_a = document.querySelector("#open-button")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
        openTextFile(function (file, content) {
            console.log(content);
            var elInput = document.querySelector("#input");
            elInput.value = content;
            var elOutput = document.querySelector("#output");
            elOutput.value = JSON.stringify(parseFBX(content), null, "    ");
        }, "fbx");
    });
}

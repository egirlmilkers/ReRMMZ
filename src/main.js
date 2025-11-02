import {PluginManager, SceneManager} from "managers";
import {Scene_Boot} from "scenes";
import {$plugins} from "plugins";
import "@local/effekseer";


const effekseerWasmUrl = "@local/effekseer/effekseer.wasm";
let appError = null;

function showLoadingSpinner() {
    const loadingSpinner = document.createElement("div");
    const loadingSpinnerImage = document.createElement("div");
    loadingSpinner.id = "loadingSpinner";
    loadingSpinnerImage.id = "loadingSpinnerImage";
    loadingSpinner.appendChild(loadingSpinnerImage);
    document.body.appendChild(loadingSpinner);
}

function eraseLoadingSpinner() {
    const loadingSpinner = document.getElementById("loadingSpinner");
    if (loadingSpinner) {
        document.body.removeChild(loadingSpinner);
    }
}

function printError(name, message) {
    eraseLoadingSpinner();
    if (!document.getElementById("errorPrinter")) {
        const errorPrinter = document.createElement("div");
        errorPrinter.id = "errorPrinter";
        errorPrinter.innerHTML = makeErrorHtml(name, message);
        document.body.appendChild(errorPrinter);
    }
}

function makeErrorHtml(name, message) {
    const nameDiv = document.createElement("div");
    const messageDiv = document.createElement("div");
    nameDiv.id = "errorName";
    messageDiv.id = "errorMessage";
    nameDiv.innerHTML = name;
    messageDiv.innerHTML = message;
    return nameDiv.outerHTML + messageDiv.outerHTML;
}

function isPathRandomized() {
    // [Note] We cannot save the game properly when Gatekeeper Path
    //   Randomization is in effect.
    return (
        typeof process === "object" &&
        require.main?.filename.startsWith("/private/var")
    );
}

function main() {
    showLoadingSpinner();
    PluginManager.setup($plugins);

    window.addEventListener("error", (event) => {
        if (!appError) {
            appError = event.error;
        }
    });

    window.addEventListener("load", () => {
        if (isPathRandomized()) {
            printError("Error", "Please move the Game.app to a different folder.");
        } else if (appError) {
            printError(appError.name, appError.message);
        } else {
            // --- Init Effekseer Runtime (Inlined) ---

            // Start the Effekseer runtime (requires effekseer to be available)
            effekseer.initRuntime(effekseerWasmUrl, () => {
                eraseLoadingSpinner();
                SceneManager.run(Scene_Boot);
            }, () => {
                printError("Failed to load", effekseerWasmUrl);
            });
        }
    });
}

main();
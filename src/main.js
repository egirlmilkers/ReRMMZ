import {PluginManager} from "./managers/PluginManager.js";
import {SceneManager} from "./managers/SceneManager.js";

import {Scene_Boot} from "./scenes/Scene_Boot.js";

import {$plugins} from "./plugins.js";

const effekseerWasmUrl = "../lib/effekseer/effekseer.wasm";

class Main {
	run() {
		console.log("Running Main.run...");

		this.showLoadingSpinner();

		console.log("Setting up plugins...");
		PluginManager.setup($plugins);

		// Check for Gatekeeper Path Randomization on macOS
		if (typeof process === "object" && process.cwd().startsWith("/private/var")) {
			const message = "Please move the Game.app to a different folder.";
			console.error(message);
			this.printError("Error", message);
		} else {
			console.log("\nInitializing Effekseer runtime...");
			effekseer.initRuntime(effekseerWasmUrl, () => {
				console.log("Effekseer loaded successfully.\n");
				this.eraseLoadingSpinner();
				SceneManager.run(Scene_Boot);
			}, () => {
				console.error("Effekseer failed to load.\n");
				this.printError("Failed to load", effekseerWasmUrl);
			});
		}
	}

	showLoadingSpinner() {
		console.log("Running showLoadingSpinner...");
		const loadingSpinner = document.createElement("div");
		const loadingSpinnerImage = document.createElement("div");
		loadingSpinner.id = "loadingSpinner";
		loadingSpinnerImage.id = "loadingSpinnerImage";
		loadingSpinner.appendChild(loadingSpinnerImage);
		document.body.appendChild(loadingSpinner);
	}

	eraseLoadingSpinner() {
		console.log("Running eraseLoadingSpinner...");
		const loadingSpinner = document.getElementById("loadingSpinner");
		if (loadingSpinner) {
			document.body.removeChild(loadingSpinner);
		}
	}

	printError(name, message) {
		console.log(`Running printError -> name: ${name} ${message}`);
		this.eraseLoadingSpinner();
		if (!document.getElementById("errorPrinter")) {
			const errorPrinter = document.createElement("div");
			errorPrinter.id = "errorPrinter";
			errorPrinter.innerHTML = this.makeErrorHtml(name, message);
			document.body.appendChild(errorPrinter);
		}
	}

	makeErrorHtml(name, message) {
		console.log(`Running makeErrorHtml -> name: ${name}, message: ${message}...`,);
		const nameDiv = document.createElement("div");
		const messageDiv = document.createElement("div");
		nameDiv.id = "errorName";
		messageDiv.id = "errorMessage";
		nameDiv.innerHTML = name;
		messageDiv.innerHTML = message;
		return nameDiv.outerHTML + messageDiv.outerHTML;
	}
}

const main = new Main();
main.run();
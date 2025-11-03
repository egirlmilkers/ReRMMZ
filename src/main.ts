import { PluginManager, SceneManager } from "./managers";
import { $plugins } from "./plugins.js";
import { Scene_Boot } from "./scenes";

// import "../local_modules/effekseer-1.70e/effekseer.js";

const scriptUrls: string[] = [
	"js/libs/pixi.js",
	"js/libs/pako.min.js",
	"js/libs/localforage.min.js",
	"js/libs/effekseer.min.js",
	"js/libs/vorbisdecoder.js",
	"js/rmmz_core.js",
	"js/rmmz_managers.js",
	"js/rmmz_objects.js",
	"js/rmmz_scenes.js",
	"js/rmmz_sprites.js",
	"js/rmmz_windows.js",
	"js/plugins.js",
];
const effekseerWasmUrl: string =
	"../local_modules/effekseer-1.70e/effekseer.wasm";

class Main {
	xhrSucceeded: boolean = true;
	loadCount: number = 0;
	error: any = null;

	numScripts: number = scriptUrls.length;

	run(): void {
		console.log("Running Main.run...");
		this.showLoadingSpinner();
		this.testXhr();
		this.hookNwjsClose();
		this.loadMainScripts();
	}

	showLoadingSpinner(): void {
		console.log("Running showLoadingSpinner...");
		const loadingSpinner = document.createElement("div");
		const loadingSpinnerImage = document.createElement("div");
		loadingSpinner.id = "loadingSpinner";
		loadingSpinnerImage.id = "loadingSpinnerImage";
		loadingSpinner.appendChild(loadingSpinnerImage);
		document.body.appendChild(loadingSpinner);
	}

	eraseLoadingSpinner(): void {
		console.log("Running eraseLoadingSpinner...");
		const loadingSpinner = document.getElementById("loadingSpinner");
		if (loadingSpinner) {
			document.body.removeChild(loadingSpinner);
		}
	}

	testXhr(): void {
		console.log("Running testXhr...");
		const xhr = new XMLHttpRequest();
		xhr.open("GET", import.meta.url);
		xhr.onload = () => (this.xhrSucceeded = true);
		xhr.send();
	}

	hookNwjsClose(): void {
		console.log("Running hookNwjsClose...");
		// [Note] When closing the window, the NW.js process sometimes does
		//   not terminate properly. This code is a workaround for that.
		if (typeof nw === "object") {
			nw.Window.get().on("close", () => nw.App.quit());
		}
	}

	loadMainScripts(): void {
		console.log("Running loadMainScripts...");
		// for (const url of scriptUrls) {
		//     const script = document.createElement("script");
		//     script.type = "text/javascript";
		//     script.src = url;
		//     script.async = false;
		//     script.defer = true;
		//     script.onload = this.onScriptLoad.bind(this);
		//     script.onerror = this.onScriptError.bind(this);
		//     script._url = url;
		//     document.body.appendChild(script);
		// }
		// this.numScripts = scriptUrls.length;
		window.addEventListener("load", this.onWindowLoad.bind(this));
		window.addEventListener("error", this.onWindowError.bind(this));
	}

	onScriptLoad(): void {
		if (++this.loadCount === this.numScripts) {
			PluginManager.setup($plugins);
		}
	}

	onScriptError(e: { target: { _url: string } }): void {
		this.printError("Failed to load", e.target._url);
	}

	printError(name: string, message: string): void {
		console.log(`Running printError -> name: ${name} ${message}`);
		this.eraseLoadingSpinner();
		if (!document.getElementById("errorPrinter")) {
			const errorPrinter = document.createElement("div");
			errorPrinter.id = "errorPrinter";
			errorPrinter.innerHTML = this.makeErrorHtml(name, message);
			document.body.appendChild(errorPrinter);
		}
	}

	makeErrorHtml(name: string, message: string): string {
		console.log(
			`Running makeErrorHtml -> name: ${name}, message: ${message}...`,
		);
		const nameDiv = document.createElement("div");
		const messageDiv = document.createElement("div");
		nameDiv.id = "errorName";
		messageDiv.id = "errorMessage";
		nameDiv.innerHTML = name;
		messageDiv.innerHTML = message;
		return nameDiv.outerHTML + messageDiv.outerHTML;
	}

	onWindowLoad(): void {
		console.log("Running onWindowLoad...");
		if (!this.xhrSucceeded) {
			const message = "Your browser does not allow to read local files.";
			this.printError("Error", message);
		} else if (this.isPathRandomized()) {
			const message = "Please move the Game.app to a different folder.";
			this.printError("Error", message);
		} else if (this.error) {
			this.printError(this.error.name, this.error.message);
		} else {
			this.initEffekseerRuntime();
		}
	}

	onWindowError(event: { error: any }): void {
		console.log("onWindowError triggered:", event);
		if (!this.error) {
			this.error = event.error;
		}
	}

	isPathRandomized(): boolean {
		console.log("Checking for isPathRandomized...");
		// [Note] We cannot save the game properly when Gatekeeper Path
		//   Randomization is in effect.
		return (
			typeof process === "object" && process.cwd().startsWith("/private/var")
		);
	}

	initEffekseerRuntime(): void {
		console.log("Running initEffekseerRuntime...");
		const onLoad = this.onEffekseerLoad.bind(this);
		const onError = this.onEffekseerError.bind(this);
		effekseer.initRuntime(effekseerWasmUrl, onLoad, onError);
	}

	onEffekseerLoad(): void {
		console.log("Running onEffekseerLoad...");
		this.eraseLoadingSpinner();
		SceneManager.run(Scene_Boot);
	}

	onEffekseerError(): void {
		this.printError("Failed to load", effekseerWasmUrl);
	}
}

const main: Main = new Main();
main.run();

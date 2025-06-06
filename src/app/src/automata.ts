import { Parcel } from "../../core/src/parcel";
import { Reactive } from "../../core/src/reactivity";

// import { files as files_shadow } from "./files";
// import { apps_menu as app_menu_component } from "./apps-menu";

// singleton
class Automata extends HTMLBodyElement {
	constructor() {
		if (document.body.hasAttribute("is")) throw Error("automata is already registered. The automata is the app root, there can only be one instance of it in the dom tree at one time.");
		super();

		this.id = "app";
		this.setAttribute("is", "an-automata");
		document.body = this;
	}

	// private state: Map<string, ShadowContainer>;

	// custom element methods 
	// TODO May be able to incorporate this into the reacitivity logic 
	static observedAttributes = [];

	// WARN all installed plugins component functions must be imported to this file by compile time
	// use rolldown inject for this 
	// at the start of the release build step, momo_web_ui gh repo is cloned, 
	// build.rs checks install.toml core modules and plugins sections and adds an import statement injection for everything in there
	// meanwhile all plugins are also cloned and components dirs are put in src/ts/ of this repo
	// FIXME instead of src/ts src/css, I should break down the code by component; each component ts and css is paired in a single dir
	connectedCallback() {
		// first call to server needs to be one with user configs and session details
		// TODO once the automata is connected 
		// we build all the necessary core modules and plugins components
		// collect them into the automata state
		// then we render only what is needed at launch time into the dom 
	}

	reactive(id: String, reactive: Reactive) { }
}
customElements.define("an-automata", Automata, { extends: "body" });

const app = new Automata();

const parcel = new Parcel();

const main_menu = await main_menu_shadow(parcel);
main_menu.render(app);

// const tree = await files_tree_component(parcel);
// tree.render(app);

// const matrix = await files_meta_component(parcel);
// matrix.render(app);

// const files_menu = await files_menu_component(parcel);
// files_menu.render(app);

// const files = await files_shadow(parcel);
// files.render(app);

// import "../css/styles.css";
// import "../css/main-menu.css";

// import { ColorPalette } from "momotaro/components/primitives/color-palette"
// let plte = new ColorPalette();
// plte.render(app);

import { make, type _, type Maybe } from "momotaro/core/core"
const canvas = make("canvas", { "id": "color_palette" });
class ColorPalette {
	constructor(target: HTMLCanvasElement, width: number, height: number) {
		this.width = width;
		this.height = height;
		this.target = target;
		this.target.width = width;
		this.target.height = height;
		this.context = this.target.getContext("2d")!;
		this.cursor = { x: 10, y: 10, width: 7, height: 7 };
	}

	private target: HTMLCanvasElement;
	private width: number;
	private height: number;
	private context: CanvasRenderingContext2D;
	private cursor: { x: number, y: number, width: number, height: number };

	draw() { }

}

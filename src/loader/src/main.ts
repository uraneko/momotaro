// DOCS: when the page is requested of the server 
// first, the server checks for authorization
// if default then landing page is loaded with default values
// else user values are loaded and set
// meanwhile client only shows splash page until the above is done 
// splash load bar increments after user check, after fetching user configs and data and after setting everything up

import { make, State, Keep, DOMTree } from "../root";

const SVG = (data: string): SVGSVGElement | Error => {
	const svg = new DOMParser().parseFromString(data, "image/svg+xml").querySelector("svg");
	return svg === null ? new Error("failed to fetch svg data") : svg;
}

const build = (
	app_icons: Map<string, SVGSVGElement>,
	file_icons: Map<string, SVGSVGElement>,
	data: JSON,
	configs: JSON,
) => {
	// @ts-ignore
	self.state = new State(configs);
	// @ts-ignore
	self.keep = new Keep(app_icons, file_icons);
	// @ts-ignore
	self.tree = new DOMTree(data);
}

export class Loader {
	constructor() {
		this.dom = make("div", { "id": "splash-screen" }, [
			make("span",
				{ "id": "logo", "class": "from:splash-screen" },
				[
					make("img", { "src": "logo.svg?fs=false" })
				],
			)
		]);
		this.state = "Authenticating user login...";
		this.data = {} as JSON;
		this.configs = {} as JSON;
		this.icons = {} as any;

		this.render();
	}

	private dom: HTMLDivElement;
	private state: AuthState;
	private data: JSON;
	private configs: JSON;
	private icons: {
		app: Map<string, SVGSVGElement>,
		file: Map<string, SVGSVGElement>,
	};


	// first thing to do after page get 
	// ask for data and configs from server
	private async authenticate_user() {
		const res = await fetch("auth?tkn=??????", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			}
		});

		const json = res.json();
		// ... 
	}

	// TODO: move the icon fetching to this method
	private async load_data() {
		const res = await fetch("user-data?tkn=??????", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			}
		});

		const json = res.json();
		// ... 

		const res1 = await fetch("app-data?tkn=!!!!!!!", {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		});

		const json1 = res1.json();
		// ... 
		// fetch icons 
		this.icons.app = await (async (): Promise<Map<string, SVGSVGElement>> => {
			let app_icons = new Map();
			const res = await fetch("/icons", {
				method: "GET",
				headers: {
					"Content-Type": "text/xml+svg",
				}
			});

			const text = await res.text();
			const svgs = text.split("\r\n\r\n");

			for (const svg_ of svgs) {
				const svg = SVG(svg_);
				// console.log(svg.constructor.name);
				if (svg.constructor.name === "SVGSVGElement") {
					app_icons.set((svg as SVGSVGElement).id, svg as SVGSVGElement)
				}
			}

			return app_icons;
		})();

		this.icons.file = await (async (): Promise<Map<string, SVGSVGElement>> => {
			let file_icons = new Map();
			const res = await fetch("/file-icons", {
				method: "GET",
				headers: {
					"Content-Type": "text/xml+svg",
				}
			});

			const text = await res.text();
			const svgs = text.split("\r\n\r\n");

			for (const svg_ of svgs) {
				const svg = SVG(svg_);
				if (svg.constructor.name === "SVGSVGElement") {
					file_icons.set((svg as SVGSVGElement).id, svg as SVGSVGElement)
				}
			}

			return file_icons;
		})();
	}

	private async prepare_environment() {
		// fetch icons 
		this.icons.app = await (async (): Promise<Map<string, SVGSVGElement>> => {
			let app_icons = new Map();
			const res = await fetch("/icons", {
				method: "GET",
				headers: {
					"Content-Type": "text/xml+svg",
				}
			});

			const text = await res.text();
			const svgs = text.split("\r\n\r\n");

			for (const svg_ of svgs) {
				const svg = SVG(svg_);
				// console.log(svg.constructor.name);
				if (svg.constructor.name === "SVGSVGElement") {
					app_icons.set((svg as SVGSVGElement).id, svg as SVGSVGElement)
				}
			}

			return app_icons;
		})();

		this.icons.file = await (async (): Promise<Map<string, SVGSVGElement>> => {
			let file_icons = new Map();
			const res = await fetch("/file-icons", {
				method: "GET",
				headers: {
					"Content-Type": "text/xml+svg",
				}
			});

			const text = await res.text();
			const svgs = text.split("\r\n\r\n");

			for (const svg_ of svgs) {
				const svg = SVG(svg_);
				if (svg.constructor.name === "SVGSVGElement") {
					file_icons.set((svg as SVGSVGElement).id, svg as SVGSVGElement)
				}
			}

			return file_icons;
		})();
	}

	async progress() {
		switch (this.state) {
			case "Authenticating user login...":
				// this.authenticate_user();
				this.state = "Loading user data...";
			case "Loading user data...":
				// this.load_data();
				this.state = "Preparing user environment...";
			case "Preparing user environment...":
				await this.prepare_environment();
				this.state = "Welcome.";
			default:
				this.state = "Welcome.";
		}
	}

	render() {
		document.body.appendChild(this.dom);
	}

	omit() {
		this.dom.remove();
	}

	async load() {
		for (let counter = 0; counter < 3; counter++) {
			setTimeout(() => { }, 2000 * (counter + 1));
			await this.progress();
		}

		build(this.icons.app, this.icons.file, this.data, this.configs);
		this.omit();
	}
}

type AuthState = "Authenticating user login..." | "Loading user data..." | "Preparing user environment..." | "Welcome.";

import "./splash-screen.css" assert { type: "css" }

import { make, Component, MainContent, MainMenu, IconItem } from "momo_build/main";

export class State {
	constructor() {
		this.activity = "Active";
		this.entity = "landing-page";
		this.overlayed = false;
		this.language = "en";
	}

	// app activity 
	// changes to idle after user doesn't use app / website for a certain number of minutes
	private activity: "Idle" | "Active";
	// main content entity name 
	// floating entities override this too 
	private entity: string;
	// is a floating entity element being rendered on top of the fixed one 
	private overlayed: boolean;
	// language of the app / website
	private language: "en";

	// changes the global state indicating the main content active app 
	update(state: string) {
		this.entity = state;
		// @ts-ignore // NOTE: global variable tree
		tree.main_content(this.entity);
	}
}

export class DOMTree {
	constructor() {
		this.entities = new Map();
		this.dom = make("div", { "id": "app" });
	}

	// dom element that wraps around the whole app elements
	private dom: HTMLDivElement;
	// map of entities with dom representation that have been stored for later use
	private entities: Map<string, Component>;

	// map manipulation
	// find the entity in the entities map
	find(name: string) {
		return this.entities.has(name) ? this.entities.get(name) : undefined;
	}

	// you may wanna store a component for later use 
	// with/o appending it to dom
	push(name: string, entity: Component) {
		this.entities.set(name, entity);
	}

	// removes entity from map and returns it
	pop(name: string): Component | undefined {
		const comp = this.entities.get(name);
		this.entities.delete(name);

		return comp;
	}

	// dom manipuation 
	// query for an entity inside the dom 
	query(q: string, all: boolean) {
		return all ? this.dom.querySelectorAll(q) : this.dom.querySelector(q);
	}

	// rendering elements
	render<T extends Entity>(entity: T, q?: string) {
		entity.rendered(true);
		// @ts-ignore // NOTE: all classes extending Entity should have a dom property
		q == undefined ? this.dom.appendChild(entity.dom)
			// @ts-ignore // NOTE: all classes extending Entity should have a dom property
			: (this.query(q, false)! as Node).appendChild(entity.dom);
	}

	// unrendering elements
	omit<T extends Entity>(entity: T) {
		entity.rendered(false);
		// @ts-ignore // NOTE: all classes extending Entity should have a dom property
		entity.dom.remove();
	}

	setup() {
		// @ts-ignore // NOTE: global variable keep
		const menu = new MainMenu(keep.icon_list([
			"a:home:landing-page",
			"b:server-events:",
			"b:apps:app-menu",
			"b:configs:",
			"sep",
			"b:msg:messages",
			"b:bell:notifications"
		]), "main-menu", "main-menu icons");
		menu.setup();
		this.push("main-menu", menu);
		const content = new MainContent("main-content", "main-content container");
		content.setup();
		this.push("main-content", content);
	}

	launch() {
		this.render(<Entity>this.find("main-menu"));
		this.render(<Entity>this.find("main-content"));
		document.body.appendChild(this.dom);
	}

	main_content(ref: string) {
		const main = <MainContent>this.find("main-content");
		const entity = this.find(ref);

		if (entity == undefined) {
			console.log("main_content(): can't find entity with ref", ref, "in the tree cache");
			return;
		}

		// @ts-ignore // NOTE: all Entity subclasses have a dom property
		main == undefined ? console.log("main_content(): no such entity is cached in the tree") : main.update(entity.dom);
	}
}

export class Keep {
	constructor(app_icons: Map<string, SVGSVGElement>, file_icons: Map<string, SVGSVGElement>) {
		this.icons = {
			app: app_icons,
			file: file_icons,
		};

		const seprt = ((): HTMLSpanElement => {
			const separator = document.createElement("span");
			separator.className = "separator";
			const sep = document.createElement("span");
			sep.className = "sep";
			separator.appendChild(sep);

			return separator;
		})();

		const minim = ((): HTMLButtonElement => {
			const wrapper = document.createElement("button");
			wrapper.className = "iconsMinimizer";
			wrapper.appendChild(this.svg("3lines")!);

			return wrapper;
		})();

		// @ts-ignore
		this.separator = function(): HTMLSpanElement {
			return seprt.cloneNode(true) as HTMLSpanElement;
		};

		// @ts-ignore
		this.minimizer = function(): HTMLButtonElement {
			return minim.cloneNode(true) as HTMLButtonElement
		};

		this.cache = [];
	};

	private icons: {
		app: Map<string, SVGSVGElement>,
		file: Map<string, SVGSVGElement>,
	};

	private cache: [];

	// minimizer(): HTMLButtonElement {
	// 	return this.reusables.minimizer.cloneNode(true) as HTMLButtonElement;
	// }
	//
	// separator(): HTMLSpanElement {
	// 	return this.reusables.separator.cloneNode(true) as HTMLSpanElement;
	// }

	icon_list(coll: string[], minimizer: boolean): IconItem[] {
		const map = coll
			.map((name: string) =>
				// @ts-ignore
				name === "sep" ? this.separator() : this.icon(...name.split(":"))!)
			.filter((ii: IconItem) => ii !== undefined);
		// @ts-ignore
		if (minimizer) map.unshift(this.minimizer());

		return map;
	}

	// icon is given as: "bell:b" for the bell svg with the button wrapper
	icon(
		wrapper: string,
		name: string,
		ref: string
	): HTMLAnchorElement | HTMLButtonElement | undefined {
		return wrapper === 'b' ?
			make(
				"button",
				{ "class": "icon-button erased", "data-ref": ref == "" ? name : ref },
				[this.svg(name)!]
			) as any as HTMLButtonElement
			: wrapper === 'a' ?
				make(
					"a",
					{ "class": "icon-anchor erased", "data-ref": ref == "" ? name : ref },
					[this.svg(name)!]
				) as any as HTMLAnchorElement : undefined;
	}

	// get app svg element from the stored icons
	private svg(name: string): SVGSVGElement | undefined {
		return this.icons.app.get(name);
	}
}

export class Entity {
	constructor(guid: string, cuid: string) {
		this.guid = guid;
		this.cuid = cuid;
		this.is_rendered = false;
	}

	// unique instance id, e.g., c1
	guid: string;
	// entity type (categorically unique) id, e.g., calendar
	cuid: string;
	// is this entity dom appended to the page html
	is_rendered: boolean;

	// returns the html element identifying query representing this entity in the DOM
	by_id() {
		return `div.${this.cuid}#${this.guid}`;
	}

	// returns the query that identifies all instances 
	// of the class that inherits this method from Entity 
	by_class() {
		return `div.${this.cuid}`
	}

	rendered(ren: boolean) { this.is_rendered = ren; }
}

import { make, MonoContainer } from "momo_build/main";

export class Application {
	constructor(content: string) {
		this.dom = new AppElement(content);
		this.logs = new AppLogs();
		this.cache = new AppCache();
	}

	private logs: AppLogs;
	private dom: AppElement;
	private cache: AppCache;

	// use in correspondance with fetch/cache
	// log(url: string, log: boolean) {
	// 	this.fetch_log.set(url, log);
	// }

	// adds the appelement to the dom tree
	// effectively rendering it
	render() {
		document.body.appendChild(this.dom.element());
	}

	// make server request and get data, 
	// optionally cache it 
	async load(
		url: string,
		method: string,
		ctype: string,
		callback: (data: any) => any,
		cache: boolean
	) {
		const res = await fetch(url, {
			method: method,
			headers: {
				"Content-Type": ctype
			}
		});
		const svg = callback(res);

		let cached = false;
		if (cache) {
			this.cache.push(url, svg);
			cached = true;
		}
		this.logs.req(url, cached);

		return svg;
	}

	// update a part of the dom, either main or sub content 
	updater() {
		new MutationObserver(() => {
			const [signal_kind, signal_value] = this.dom.signal();
			const dom = this.cache.read_comp(signal_value) as HTMLElement;
			if (signal_kind == "main") {
				// TODO: FIXME
				this.dom.main(dom);
			} else if (signal_kind == "sub") {
				this.dom.sub(dom);
			}
		}).observe(this.dom.element(), {
			subtree: false,
			attributes: true,
			attributeOldValue: true,
			attributeFilter: ["data-signal"],
		});
	}
}

class AppElement {
	constructor(content: string) {
		this.dom = make("div", {
			"id": "application",
			"data-main-signal": "",
			"data-sub-signal": ""
		});
		this.main_content = new MonoContainer();
		this.sub_content = new MonoContainer();
		this.main_menu = new MonoContainer();
	}

	private dom: HTMLDivElement;
	private main_content: MonoContainer<HTMLElement>;
	private main_menu: MonoContainer<HTMLElement>;
	private sub_content: MonoContainer<HTMLElement>;
	private overlayed: boolean = false;

	element() { return this.dom }

	main<T extends HTMLElement>(dom: T) {
		this.disable_overlay();
		this.main_content.update(dom);
	}

	sub<T extends HTMLElement>(dom: T) {
		this.sub_content.update(dom);
		this.enable_overlay();
	}

	disable_overlay() { this.overlayed = false; }

	enable_overlay() { this.overlayed = true; }

	toggle_overlay() { this.overlayed = !this.overlayed; }

	overlay(ol: boolean) { this.overlayed = ol; }

	signal(): [string, string] {
		return this.dom.getAttribute("data-signal")!.split(':') as [string, string];
	}
}

const load_comp = async (res: any): Promise<ChildNode> => {
	const text = res.text();
	const comp = new DOMParser().parseFromString(await text, "text/html").firstChild!;

	return comp;
};

const load_comps = async (res: any): Promise<JSON> => {
	const json = await res.json();

	Object.entries(json).forEach((kv: any[]) => {
		json[kv[0]] = new DOMParser()
			.parseFromString(kv[1], "text/html").firstChild!;

	});

	return json;

}

const laod_icon = async (res: any): Promise<ChildNode> => {
	const text = res.text();
	const svg = new DOMParser().parseFromString(await text, "text/html").firstChild!;

	return svg;
};

const load_icons = async (res: any): Promise<JSON> => {
	const json = await res.json();

	Object.entries(json).forEach((kv: any[]) => {
		json[kv[0]] = new DOMParser()
			.parseFromString(kv[1], "image/svg+xml").firstChild!;

	});

	return json;
};


const load_json = async (res: any): Promise<JSON> => {
	const json = res.json();

	return await json;
};

class AppCache {
	constructor() {
	}

	private icons: Map<string, SVGSVGElement> = new Map();
	private comps: Map<string, Entity> = new Map();

	icon(url: string, data: SVGSVGElement) {
		this.icons.set(url, data);
	}

	comp(url: string, data: Entity) {
		this.comps.set(url, data);
	}

	contains_key(name: string, kind: "icon" | "comp"): boolean {
		return kind == "icon" ? this.icons.has(name) : this.comps.has(name);
	}

	contains_val(value: SVGSVGElement | Entity, kind: "icon" | "comp"): boolean {
		return kind == "icon" ?
			this.icons.values().some((val: SVGSVGElement) => val == value) :
			this.comps.values().some((val: Entity) => val == value);
	}

	push(url: string, data: SVGSVGElement | Entity) {
		if (data.constructor.name == "SVGSVGElement") {
			this.icon(url, data as SVGSVGElement);
		} else {
			this.comp(url, data as Entity)
		}
	}

	read_icon(name: string): Opt<SVGSVGElement> {
		return this.icons.get(name)
	}

	read_comp(name: string): Opt<Entity> {
		return this.comps.get(name)
	}
}

type Opt<T> = T | undefined;
type Res<T, E extends Error> = T | E;

class AppLogs {
	constructor() {
	}

	private errors: Map<string, Error> = new Map();
	private fetch: Map<string, boolean> = new Map();

	req(url: string, cached: boolean) {
		this.fetch.set(url, cached);
	}

	// NOTE: use this when you dont want to handle an error
	err(error: Error) {
		this.errors.set(error.name, error);
	}
}

class Entity { }

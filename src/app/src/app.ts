import { make, MonoContainer, Opt, Res } from "momo_build/src/main";
// import { Keys } from "momo_keys/src/main";
// import { Navigator } from "momo_navigator/src/main";

// NOTE clarifying the container <=> conponent relation 
// components usually have classes that represent their data/dom/logic parts 
// component dom part is represented by a container type: MonoContainer 

export class Application {
	constructor(...start_containers: MonoContainer[]) {
		this.dom = new AppElement(...start_containers);
		this.logs = new AppLogs();
		this.cache = new AppCache();
		this.watch_content();
	}

	private logs: AppLogs;
	private dom: AppElement;
	private cache: AppCache;
	private components: Map<string, any>;
	// private key_bindings: KeyBindings;
	// private navigator: Navigator;

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
			this.cache.cache(url, svg);
			cached = true;
		}
		this.logs.log(new LogRecord("fetch", { url: url, cached: cached, cat: "svg/icon" }));

		return svg;
	}

	// update a part of the dom app content, either main or sub content 
	watch_content() {
		new MutationObserver(() => {
			const [signal_kind, signal_value] = this.dom.signal("content");
			// FIXME: this probably should be: check if in cache 
			// if not found then fetch + cache and use 
			// else load from cache 
			// altho this logic should probably be in the cache read_comp method 
			const dom = this.cache.load(new CacheQuery({ resource: signal_value })) as HTMLElement;
			if (signal_kind == "main") {
				this.dom.main(dom);
			} else if (signal_kind == "sub") {
				this.dom.sub(dom);
			}
		}).observe(this.dom.element(), {
			subtree: false,
			attributes: true,
			attributeOldValue: true,
			attributeFilter: ["data-content-signal"],
		});
	}

	watch_plugins() {
		new MutationObserver(() => {
			const [signal_kind, signal_value] = this.dom.signal("content");
			if (signal_kind == "files") {
				// TODO: make the request and get the data either from fetch or cache 
				// TODO: on_click: if it's a file, show it in sub content 
				// if it's a dir show it in main 
				// if it's a file and user new tab opens it 
				// then show it in its own specialized app window 
				// something like what browsers do for pdf files
			}
		}).observe(this.dom.element(), {
			subtree: false,
			attributes: true,
			attributeOldValue: true,
			attributeFilter: ["data-plugins-signal"],
		});
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


// class App {
// 	private dom: ApplicationDOM;
// 	private logic: ApplicationLogic;
// }
// class System { }
// // possibly better app design
// class ApplicationLogic {
// 	private state: AppState;
// 	private nodes: Map<Node, System>;
// }
// class ApplicationDOM {
// 	private root: HTMLElement;
// 	private nodes: Map<Node, Element>;
// }

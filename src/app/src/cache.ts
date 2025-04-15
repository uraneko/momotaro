
// class AppCacheQueries { }

class AppCache /* extends AppCacheQueries */ {
	constructor(...cache: Array<[CacheId, CacheData]>) {
		this.store = cache.length == 0 ? new Map() : new Map(cache);
	}

	private store: Map<CacheId, CacheData>;

	// finds then returns data from the cache 
	// if data not there returns undefined
	load(query: CacheQuery): CacheData {
		if (query.has_url()) {
			return this.query_url(query.read_url()!).pairs()[0][1];
		}

		let res = this.clone();
		if (query.has_path()) {
			res = res.query_path(query.read_path()!);
		} if (query.has_resource()) {
			res = res.query_resource(query.read_resource()!);
		} if (query.has_params()) {
			res = res.query_params(...query.read_params()!)
		}

		return res.pairs()[0][1];
	}

	load_all(query: CacheQuery): Array<CacheData> {
		if (query.has_url()) {
			return this.query_url(query.read_url()!)
				.pairs()
				.map((p: [CacheId, CacheData]) => p[1]);
		}

		let res = this.clone();
		if (query.has_path()) {
			res = res.query_path(query.read_path()!);
		} if (query.has_resource()) {
			res = res.query_resource(query.read_resource()!);
		} if (query.has_params()) {
			res = res.query_params(...query.read_params()!)
		}

		return res
			.pairs()
			.map((p: [CacheId, CacheData]) => p[1]);
	}

	// finds then returns data from the cache 
	// if data not there then fetch it then cache it and returns it 
	// load_infallible(identifier: string | [string, string] | [string, string, string]) { }

	// cache given resource in this cache 
	cache(url: string, data: CacheData) {
		this.store.set(new CacheId(url), data);
	}

	// icon(url: string, data: SVGSVGElement) {
	// 	this.icons.set({ url: url, name: AppCache.parse_name_from_url(url) }, data);
	// }

	// comp(url: string, data: Entity) {
	// 	this.comps.set({ url: url, name: AppCache.parse_name_from_url(url) }, data);
	// }

	query_path(...path: string[]): AppCache {
		return new AppCache(...this.store
			.entries()
			.filter((kv: [CacheId, CacheData]) =>
				path.some((p: string) => kv[0].path_equals(p))
			));
	}

	query_resource(...res: string[]): AppCache {
		return new AppCache(...this.store
			.entries()
			.filter((kv: [CacheId, CacheData]) =>
				res.some((r: string) => kv[0].path_equals(r))
			));
	}

	query_params(...params: (string | [string, string])[]): AppCache {
		return new AppCache(...this.store
			.entries()
			.filter((kv: [CacheId, CacheData]) => {
				params.some((p: string | [string, string]) => {
					const type = p.constructor.name;
					if (type == "Array") {
						if (!kv[0].contains_param(p[0])) return false;
						kv[0].param_equals(p as [string, string]);
					} else {
						kv[0].contains_param(p as string);
					}
				})
			}));
	}

	query_params_all(...params: (string | [string, string])[]): AppCache {
		return new AppCache(...this.store
			.entries()
			.filter((kv: [CacheId, CacheData]) => {
				params.every((p: string | [string, string]) => {
					const type = p.constructor.name;
					if (type == "Array") {
						if (!kv[0].contains_param(p[0])) return false;
						kv[0].param_equals(p as [string, string]);
					} else {
						kv[0].contains_param(p as string);
					}
				})
			}));
	}

	query_url(...url: string[]): AppCache {
		return new AppCache(...this
			.store.entries().filter((kv: [CacheId, CacheData]) =>
				url.some((url: string) => kv[0].equals(url))
			)
		);
	}

	// SEAL: this one is too dangerous to be left uncommented
	// queries(...queries: ((query: any) => AppCache)[]): AppCache {
	// 	queries = queries.reverse()
	// 	let res = queries.pop()!();
	// 	while (queries.length > 0) {
	// 		res = res.queries.pop()()
	// 	}
	//
	// 	return res;
	// }

	clone(): AppCache {
		// clones this and returns value
		return structuredClone(this);

		// Object.create(this) would have allegedly made a shallow copy 
		// this could prove useful somewhere else 
	}

	pairs(): Array<[CacheId, CacheData]> {
		return new Array(...this.store.entries());
	}

	vals(): Array<CacheData> {
		return new Array(...this.store.values());
	}

	keys(): Array<CacheId> {
		return new Array(...this.store.keys());
	}

	// find_by_url(url: string, kind: "icon" | "comp"): Opt<{ url: string, name: string }> {
	// 	const items = kind == "icon" ? this.icons : this.comps;
	// 	// @ts-ignore
	// 	const search_item = items
	// 		.keys()
	// 		.filter(
	// 			(k: any) => k.url == url
	// 		);
	//
	// 	// @ts-ignore
	// 	return search_item.length != 1 ? undefined : search_item[0];
	// }

	// find_by_name(name: string, kind: "icon" | "comp"): Opt<{ url: string, name: string }> {
	// 	const items = kind == "icon" ? this.icons : this.comps;
	// 	// @ts-ignore
	// 	const search_item = items
	// 		.keys()
	// 		.filter(
	// 			(k: any) => k.name == name
	// 		);
	//
	// 	// @ts-ignore
	// 	return search_item.length != 1 ? undefined : search_item[0];
	// }

	// WRONG LOGIC
	// contains_url(...url: string[]): boolean {
	// 	return this
	// 		.store
	// 		.keys()
	// 		.some((k: CacheId) => url.some((url: string) => k.equals(url)))
	// }

	contains_url(...url: string[]): boolean {
		const ids = this.store.keys();
		return url.every((url: string) =>
			ids.some((id: CacheId) => id.equals(url))
		);
	}

	contains_path(...path: string[]): boolean {
		const ids = this.store.keys();
		return path.every((path: string) =>
			ids.some((id: CacheId) => id.path_equals(path))
		);
	}

	contains_resource(...resource: string[]): boolean {
		const ids = this.store.keys();
		return resource.every((resource: string) =>
			ids.some((id: CacheId) => id.resource_equals(resource))
		);
	}

	contains_params(...params: (string | [string, string])[]) {
		const ids = this.store.keys();

		return params.every((p: string | [string, string]) => {
			const type = p.constructor.name;

			ids.some((id: CacheId) => {
				if (type == "Array") {
					if (!id.contains_param(p[0])) return false;
					return id.param_equals(p as [string, string]);

				} else {
					return id.contains_param(p as string);
				}
			})
		});
	}

	// contains_key(name: string, kind: "icon" | "comp"): boolean {
	// 	return kind == "icon" ?
	// 		this.icons.has(this.find_by_name(name, kind)!) :
	// 		this.comps.has(this.find_by_name(name, kind)!);
	// }

	// contains_val(value: SVGSVGElement | Entity, kind: "icon" | "comp"): boolean {
	// 	return kind == "icon" ?
	// 		this.icons.values().some((val: SVGSVGElement) => val == value) :
	// 		this.comps.values().some((val: Entity) => val == value);
	// }

	// e.g., url: https://localhost:5232/content/files?saved_state=true&user_profile=3
	// returns files
	// this only works if I stick to naming all url endpoints like above
	// NOTE: this is fragile 
	// static parse_name_from_url(url: string): string {
	// 	return url.split('/')[1].split('?')[0];
	// }
}

type Kind = "SVGSVGElement" | "HTMLDivElement" | "JSON";

class CacheQuery {
	constructor(id: {
		url?: string,
		path?: Path,
		resource?: string,
		params?: Map<string, Opt<string>>,
		// kind?: Kind
	}) {
		this.url = id.url;
		this.path = id.path;
		this.resource = id.resource;
		this.params = id.params;
		// this.kind = kind;
	}

	private url?: string;
	private path?: Path;
	private resource?: string;
	private params?: Map<string, Opt<string>>;
	// private kind?: Kind;

	has_url(): boolean { return this.url != undefined; }

	has_resource(): boolean { return this.resource != undefined; }

	has_path(): boolean { return this.path != undefined; }

	has_params(): boolean { return this.params != undefined; }

	query_() { }

	read_url() { return this.url!; }

	read_path() { return this.path!; }

	read_resource() { return this.resource!; }

	// if value is undefined return only the key string 
	// else return the pair in an array of size 2 
	read_params(): Array<string | [string, string]> {
		return Array(...this.params!.entries().map((p: [string, Opt<string>]) =>
			p[1] == undefined ? p[0] as string : p as [string, string]
		));
	}
}

// type Id = { url?: string, path?: Path, resource?: string, params?: Map<string, Opt<string>> };

type Path = "content" | "icon" | "plugins";

// class PartialCacheId extends CacheId {}

class CacheId {
	constructor(url: string) {
		this.url = url;
		const [path, resource, params] = CacheId.parse_url(url);

		this.path = path as Path;
		this.resource = resource as string;
		this.params = params as Map<string, string>;
	}

	private url: string;
	private path: Path;
	private resource: string;
	private params: Map<string, string>;
	// TODO: add kind member, which is the types in CacheData strigified

	static parse_url(url: string) {
		const res = url.replace("https://", "").split('/')[1];
		const [path, resource] = res.split('/');
		const [rsrc, params] = resource.split('?');

		return [path, rsrc,
			// @ts-ignore
			new Map(params
				.split('&')
				.map((p: string) => p.split('=')))];
	}

	equals(other: string): boolean {
		return this.url == other;
	}

	// path() {}
	// resource() {}
	// params() {}

	path_equals(other: string): boolean {
		return this.path == other;
	}

	resource_equals(other: string): boolean {
		return this.resource == other;
	}

	params_equals(other: Map<string, string>): boolean {
		return this.params == other
	}

	// use this before read(record)_param methods to assure that 
	// param exists in this.params
	param_equals(param: [string, string]): boolean {
		if (!this.contains_param(param[0])) return false;
		return this.params.get(param[0]) === param[1];
	}

	read_param(key: string): Opt<string> {
		return this.params.get(key);
	}

	record_param(key: string): Opt<[string, string]> {
		const val = this.params.get(key);
		return val == undefined ? undefined : [key, val];
	}

	contains_param(param: string): boolean {
		return this.params.has(param);
	}

	read_url() { return this.url; }

	read_path() { return this.path; }

	read_resource() { return this.resource; }

	read_params() { return this.params; }
}

type CacheData = SVGSVGElement | HTMLDivElement | JSON;


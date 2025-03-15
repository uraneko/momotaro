import { type Opt, Clone } from "./core";


// const type_name = (type: string): Opt<string> => {
// 	return type == "application/json" ? "JSON" :
// 		type == "xml/img+svg" ? "SVGSVGElement" :
// 			type == "text/html" ? "HTMLElement" :
// 				type == "text/plain" ? "string" :
// 					undefined
// }

export class Parcel extends Clone {
	constructor(headers?: Headers) {
		super();

		this.headers = headers ?? new Headers();
		this.type_names = DEF_TYPE_NAMES;
		this._parsers = DEF_PARSERS;
	}

	private headers: Headers;
	private type_names: Map<string, string>;
	private _parsers: Map<string, (data: any) => any>;

	request(uri: string, data?: string): ParcelRequest {
		return new ParcelRequest(uri, this.headers, this.content_type(), data);
	}

	// TODO maybe better undefined handling 
	content_type(): string {
		return this.type_names.get(this.headers.get("Content-Type")!)!
	}

	parsers(): Map<string, (data: any) => any> {
		return this._parsers;
	}

	async get(uri: string) {
		const req = this.request(uri);
		const res = await req.get();

		return res.parse(this.parsers());
	}

	async post(uri: string) {
		const req = this.request(uri);
		const res = await req.post();


		return res.parse(this.parsers());

	}

	async put(uri: string) {
		const req = this.request(uri);
		const res = await req.put();

		return res.parse(this.parsers());
	}

	async delete(uri: string) {
		const req = this.request(uri);
		const res = await req.delete();

		return res.parse(this.parsers());
	}

	async patch(uri: string) {
		const req = this.request(uri);
		const res = await req.patch();

		return res.parse(this.parsers());
	}
}

class ParcelRequest extends Clone {
	constructor(uri: string, headers: Headers, type: string, payload?: string) {
		super();

		this.uri = uri;
		this.headers = headers;
		this.payload = payload;
		this.type = type;
	}

	private uri: string;
	private payload: Opt<string>;
	private headers: Headers;
	private type: string;

	// get req
	async get(): Promise<ParcelResponse> {
		return new ParcelResponse(await fetch(this.uri, {
			method: "GET",
			headers: this.headers,
		}), this.type);
	}

	// post req
	async post(): Promise<ParcelResponse> {
		return new ParcelResponse(await fetch(this.uri, {
			method: "POST",
			headers: this.headers,
			body: this.payload ?? "",
		}), this.type);
	}

	// put req; updates all fields of a record
	async put(): Promise<ParcelResponse> {
		return new ParcelResponse(await fetch(this.uri, {
			method: "PUT",
			headers: this.headers,
			body: this.payload ?? "",
		}), this.type);
	}

	// deletes a record
	async delete(): Promise<ParcelResponse> {
		return new ParcelResponse(await fetch(this.uri, {
			method: "DELETE",
			headers: this.headers,
			body: this.payload ?? "",
		}), this.type);
	}

	// updates specific fields of a record
	async patch(): Promise<ParcelResponse> {
		return new ParcelResponse(await fetch(this.uri, {
			method: "PATCH",
			headers: this.headers,
			body: this.payload ?? "",
		}), this.type);
	}

	parcel(): Parcel {
		return new Parcel(this.headers);
	}
}

class ParcelResponse extends Clone {
	constructor(resp: Response, type: string) {
		super();

		this.payload = resp;
		this.type = type;
	}

	private payload: Response;
	private type: string;

	is_json(): boolean { return this.type == "JSON"; }

	is_svg(): boolean { return this.type == "SVGSVGElement"; }

	is_html(): boolean { return this.type == "HTMLElement"; }

	is_text(): boolean { return this.type == "string"; }

	is_not(): boolean { return this.type === undefined; }

	// why is string allowed here as the type of data
	async parse(parsers: Map<string, (data: string) => any>): Promise<any> {
		const data = (() => {
			if (this.is_json()) {
				return this.payload.json();
			} else if (this.is_svg() || this.is_html() || this.is_text()) {
				return this.payload.text();
			}
		})();

		const parsed = parsers.get(this.type)!(await data);

		return parsed as TypeName<typeof parsed>;
	}
}

// TODO before parsing into anything 
// first validate the security of the response data 
const parse_json = (data: any): any => {
	// const json = data.json();
	// TODO
	// for (let [k, v] of Object.values(data as JSON)) {}

	return data;
}

const parse_str = (data: string): string => { return data; }

const parse_svg = (data: string): SVGSVGElement => {
	// const data = await resp.text();
	const parsed = new DOMParser().parseFromString(data, "image/svg+xml");
	const svg = parsed.querySelector("svg")!;

	return svg;
}

const parse_html = (data: string): HTMLElement => {
	// const data = await resp.text();
	const parsed = new DOMParser().parseFromString(data, "text/html");
	const html = parsed.body.children[0];

	return html as HTMLElement;
}


const DEF_TYPE_NAMES = new Map([
	["application/json", "JSON"],
	["image/svg+xml", "SVGSVGElement"],
	["text/html", "HTMLElement"],
	["text/plain", "string"]
]);

const DEF_PARSERS: Map<string, (data: any) => any> = new Map([
	["JSON", parse_json],
	["SVGSVGElement", parse_svg],
	["HTMLElement", parse_html],
	["string", parse_str]
]);

type TypeName<T> =
	T extends "SVGSVGElement " ? SVGSVGElement :
	T extends "HTMLElement" ? HTMLElement :
	T extends "string" ? string :
	T extends "Object" ? Object :
	T extends "undefined" ? undefined :
	any;

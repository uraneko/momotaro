import { type Maybe, Clone, is } from "./core";

export class Parcel extends Clone {
	constructor(headers?: Headers) {
		super();

		this.headers = headers ?? new Headers();
		this.type_names = INIT_TYPE_NAMES;
		this._parsers = INIT_PARSERS;
	}

	private headers: Headers;
	// TODO this is probably unneeded
	private type_names: Map<string, string>;
	private _parsers: Map<string, (data: Payload) => ParserOutput>;

	/// adds new header or updates header value if already there
	header(key: string, val: string) {
		this.headers.has(key) ? this.headers.set(key, val) : this.headers.append(key, val);
	}

	// removes header from parcel headers
	remove(key: string): Maybe<string> {
		if (!this.headers.has(key)) return undefined;

		const val = this.headers.get(key)!;
		this.headers.delete(key);

		return val;
	}

	// clears all headers
	clear() {
		this.headers = new Headers();
	}

	// generates new ParcelRequest from this parcel
	request(path: string, param: string, data?: string): ParcelRequest {
		param = param.replaceAll("/", "%2f");
		return new ParcelRequest(
			path + "/" + param,
			this.headers,
			this.content_type(),
			data
		);
	}

	parser(): (data: Payload) => ParserOutput {
		return this._parsers.get(this.content_type())!;
	}

	// TODO maybe better undefined handling 
	content_type(): string {
		return this.type_names.get(this.headers.get("Content-Type")!)!
	}

	parsers(): Map<string, (data: any) => any> {
		return this._parsers;
	}

	async get(path: string, param: string): Promise<ParserOutput> {
		const req = this.request(path, param);
		const res = await req.get();

		const payload = await res.data();

		// is data is string or data is json and not some simple k -> v (v dom parseable)
		// then return data unparsed
		if ((res.is_json() && !is_simple_json(payload as Jayson)) || res.is_text()) {
			return payload as ParserOutput;
		}

		const parser = this.parser();
		return res.parse(payload, parser);
	}

	async post(path: string, param: string, data: string) {
		const req = this.request(path, param, data);
		const res = await req.post();

		const payload = await res.data();
		let parser = undefined;
		if (!(res.is_json() && is_simple_json(payload as Jayson))) {
			parser = this.parser();
		}

		return res.parse(payload, parser);
	}

	async put(path: string, param: string, data: string) {
		const req = this.request(path, param, data);
		const res = await req.put();

		const payload = await res.data();
		let parser = undefined;
		if (!(res.is_json() && is_simple_json(payload as Jayson))) {
			parser = this.parser();
		}

		return res.parse(payload, parser);
	}

	async delete(path: string, param: string) {
		const req = this.request(path, param);
		const res = await req.delete();

		const payload = await res.data();
		let parser = undefined;
		if (!(res.is_json() && is_simple_json(payload as Jayson))) {
			parser = this.parser();
		}

		return res.parse(payload, parser);
	}

	async patch(path: string, param: string, data: string) {
		const req = this.request(path, param, data);
		const res = await req.patch();

		const payload = await res.data();
		let parser = undefined;
		if (!(res.is_json() && is_simple_json(payload as Jayson))) {
			parser = this.parser();
		}

		return res.parse(payload, parser);
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
	private payload: Maybe<string>;
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

	async data(): Promise<Payload> {
		if (this.is_json()) {
			return this.payload.json();
		} else if (this.is_svg() || this.is_html() || this.is_text()) {
			return this.payload.text();
		} else {
			throw new Error("unexpected response data type");
		}
	}

	async parse(
		data: Payload,
		parser: Maybe<(data: Payload) => ParserOutput>
	): Promise<ParserOutput> {
		// const data = await this.data();

		const output = is(parser) ? parser!(data) : data;
		return output as TypeName<typeof output>;
	}
}

// TODO before parsing into anything 
// first validate the security of the response data 
const parse_json = (data: Payload): ParserOutput => {
	data = data as Jayson;
	for (let [k, v] of Object.entries(data)) {
		if (is_svg(v)) {
			data[k] = parse_svg(v);
		} else if (is_html(v)) {
			data[k] = parse_html(v);
		}
	}

	return data as ParserOutput;
};

const parse_json_svg = (data: { [key: string]: any }): { [key: string]: any } => {
	// console.log(data);
	for (let [k, v] of Object.entries(data)) {
		data[k] = parse_svg(v);
	}

	return data;
}

const parse_json_html = (data: { [key: string]: any }): { [key: string]: any } => {
	// const json = data.json();
	console.log(data);
	for (let [k, v] of Object.entries(data)) {
		data[k] = parse_html(v);
	}

	return data;
}

const parse_str = (data: string): string => { return data; }

const parse_svg = (data: Payload): ParserOutput => {
	data = data as string;
	const parsed = new DOMParser().parseFromString(data, "image/svg+xml");
	const svg = parsed.querySelector("svg")!;

	return svg as SVGSVGElement;
}

const parse_html = (data: Payload): ParserOutput => {
	data = data as string;
	const parsed = new DOMParser().parseFromString(data, "text/html");
	const html = parsed.body.children[0];

	return html as HTMLElement;
}

const INIT_TYPE_NAMES = new Map([
	["application/json", "JSON"],
	["image/svg+xml", "SVGSVGElement"],
	["text/html", "HTMLElement"],
	["text/plain", "string"]
]);

type Jayson = Record<string, any>;
type Payload = Jayson | string;
type ParserOutput = JSON | string | HTMLElement | SVGSVGElement;

const INIT_PARSERS: Map<string, (data: Payload) => ParserOutput> = new Map([
	["JSON", parse_json],
	["SVGSVGElement", parse_svg],
	["HTMLElement", parse_html],
	// ["string", parse_str]
]);

type TypeName<T> =
	T extends "SVGSVGElement " ? SVGSVGElement :
	T extends "HTMLElement" ? HTMLElement :
	T extends "string" ? string :
	T extends "Object" ? Object :
	T extends "undefined" ? undefined :
	any;

const is_simple_json = (data: Jayson): boolean => {
	return Object.values(data).every((val: any) => val.constructor.name == "String")
}

const is_svg = (data: string): boolean => {
	return data.startsWith("<svg ") ||
		data.startsWith("<svg\n") ||
		data.startsWith("<?xml ") ||
		data.startsWith("<?xml\n");
};

const is_html = (data: string): boolean => {
	return data.startsWith("<a ") ||
		data.startsWith("<a\n") ||
		data.startsWith("<button ") ||
		data.startsWith("<button\n") ||
		data.startsWith("<span ") ||
		data.startsWith("<span\n") ||
		data.startsWith("<div ") ||
		data.startsWith("<div\n");
};

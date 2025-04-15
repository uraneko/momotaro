export class DataStore extends Array<DataTag> {
	constructor() {
		super();
	}
}

class DataTag extends Array<DataItem<any>> {
	constructor() { super(); }
}

class DataItem<T> {
	constructor(key: string, val: T) {
		this.type = typeof val as any;
		this.key = key;
		this.val = val;
		this.cached_on = new Date();
	}

	private key: string;
	private val: T;
	private cached_on: Date;
	private type: TypeName<T>;
}

type TypeName<T> =
	T extends HTMLElement ? "HTMLElement" :
	T extends SVGSVGElement ? "SVGSVGElement" :
	T extends JSON ? "JSON" :
	T extends string ? "string" :
	T extends number ? "number" :
	T extends boolean ? "boolean" :
	T extends undefined ? "undefined" :
	"Object";



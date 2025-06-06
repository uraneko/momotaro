import { type _, make, type Maybe, is } from "../../../core/src/core";

const NODISPLAY = "hidden";

type Wrapper = "a" | "button" | "span";
type Content = "main" | "sub" | "-";
type Callbacks = {
	click?: (e?: Event) => void,
	hold?: (e?: Event) => void,
	hover?: (e?: Event) => void,
};

export class Vec /* extends Map<string,Element> */ {
	constructor() {
		// super(Object.entries(nodes));

		this._id = "";
		this._direction = "row";
		this._nodes = new Map();
		this._is_frozen = false;
	}

	static from_json(
		id: string,
		nodes: JSON,
	) {
		const vec = new Vec();

		vec._id = id;
		vec._direction = "row";
		vec._nodes = nodes.constructor.name == "Map" ?
			nodes as _ as Map<_, _> :
			new Map(Object.entries(nodes)
				// .map((kv: [string, SVGSVGElement]) =>
				// [kv[0].slice(0, kv[0].length - 4), kv[1]])
			);
		vec._is_frozen = false;
	}


	static from_arr(id: string, ...nodes: string[]): Vec {
		const vec = new Vec();

		let idx = 0;
		const json = new Map(nodes.map((node: string) => {
			const kv = [idx,
				make("span", { "class": "vector-child " + idx, "p:textContent": node })];
			idx += 1;
			return kv;
		}) as Array<[number, Element]>);

		vec._id = id;
		vec._nodes = json as Object as JSON;

		return vec;
	}

	private _id: string;
	private _direction: "column" | "row";
	private _nodes: Map<string, Element>;
	private _is_frozen: boolean;

	// cocoon() {
	// 	const iter = this.nodes();
	// 	let next = iter.next();
	// 	while (next.done == false) {
	// 		this._nodes.set(next.value[0], vector_child(next.value, this._kind));
	// 		next = iter.next();
	// 	}
	// }

	update(name: string, e: Element) {
		if (!this.contains(name)) return undefined;

		this._nodes.set(name, e);
	}

	nodes(): MapIterator<[string, Element]> {
		return this._nodes.entries();
		// return new Map(this._nodes).entries()
	}

	id(): string { return this._id; }

	direction() { return this._direction; }

	/// inserts a new node right before the node with the given name 
	/// costly  
	insert(node: [string, Element], name: string) {
		const map = new Map();
		const iter = this.nodes();
		let next = iter.next();
		while (!next.done) {
			if (next.value[0] == name) {
				map.set(node[0], node[1]);
			}
			map.set(next.value[0], next.value[1]);
			next = iter.next();
		}
		this._nodes = map;
	}

	// reorders the nodes according to the key array given 
	// TODO better send a vec from the server rather than reorder the data at the front end side
	order(...order: string[]) {
		if (order.length == 0 ||
			this._nodes.size == 0
		) return false;

		console.log(0, this._nodes);
		order.filter((k: string) => this.contains(k));

		const map = new Map();
		const iter = order.values();
		let next = iter.next();
		console.log(next);
		while (!next.done) {
			map.set(next.value, this._nodes.get(next.value!));
			next = iter.next();
		}

		this._nodes = map;
		// console.log(1, this._nodes);

		return true;
	}

	// adds a new Node to the end of queue
	push(node: [string, Element]) {
		this._nodes.set(node[0], node[1]);
	}

	remove(name: string) {
		this._nodes.delete(name)
	}

	/// returns wether the vector contains 
	contains(name: string): boolean {
		return this._nodes.has(name);
	}

	read(name: string): Maybe<Element> {
		if (!this.contains(name)) return undefined;

		return this._nodes.get(name)!;
	}

	collect(): Array<Element> {
		return new Array(...this._nodes.values());
	}

	to_element(): VecElement {
		return new VecElement(this);
	}

	clone(): this {
		return structuredClone(this);
	}

	into_frozen(): this {
		this._is_frozen = true;

		return Object.freeze(this);
	}

	to_frozen(): this {
		return Object.freeze(this.clone());
	}

	is_frozen(): boolean {
		return this._is_frozen;
	}

	shallow(): this {
		return Object.create(this);
	}
}

export class VecElement extends HTMLElement {
	constructor(vector: Vec) {
		super();

		// NOTE every component, which this is one, must have an id 
		this.id = vector.id();
		this.className = "vector " + vector.direction();
		this.append(...vector.collect());
	}

	// render(parent?: Element, r?: boolean) {
	// 	is(r) ? r ? is(parent) ? parent!.appendChild(this) :
	// 		document.body.appendChild(this)
	// 		: this.remove() :
	// 		is(parent) ? parent!.appendChild(this) :
	// 			document.body.appendChild(this);
	// }

	cls(...cls: string[]) {
		this.classList.add(...cls)
	}

	render(parent: HTMLElement) {
		parent.appendChild(this);
	}

	is_rendered(): boolean {
		return is(document.querySelector(".vector#" + this.id));
	}

	display(d: boolean) {
		if (document.body.contains(this)) return;
		d ? this.classList.remove(NODISPLAY) : this.classList.add(NODISPLAY);
	}

	is_displayed(): boolean {
		return this.classList.contains(NODISPLAY);
	}

	direction(dir: "column" | "row" = "row") {
		if (this.classList.contains(dir)) return;

		const current = this.classList.contains("row") ? "row" : "column";
		this.classList.replace(current, dir);
	}

	is_row(): boolean {
		return this.classList.contains("row");
	}

	is_column(): boolean {
		return this.classList.contains("column");
	}
}
customElements.define("vector-coll", VecElement);

// NOTE: css should be modular? (not sure thats the word) but
// should write many varying css rules for the same element based on different class lists
// and then js code only changes the class list values 
// which effectively changes the css rules 

const vector_child = (n: [string, Element], kind: "button" | "div") => {
	const tag = n[1].tagName.toLowerCase();
	let node_kind;
	if (tag == "svg") {
		node_kind = "icon";
	} else if (tag == "span") {
		node_kind = "text";
	} else {
		// tag == "div"
		node_kind = "icon+text";
	}

	return make(
		kind,
		{ "class": n[0] + "-node-wrapper " + node_kind + " vector-child" },
		[n[1]]
	);
};

// TODO: click events are not set 

/*  "a:home:landing-page",
	"b:server-events:",
	"b:apps:app-menu",
	"b:configs:",
	"sep",
	"b:msg:messages",
	"b:bell:notifications" */

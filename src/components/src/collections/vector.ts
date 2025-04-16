import { type _, make, type Maybe, is, NODISPLAY } from "../../../core/src/core";

type Wrapper = "a" | "button" | "span";
type Content = "main" | "sub" | "-";
type Callbacks = {
	click?: (e?: Event) => void,
	hold?: (e?: Event) => void,
	hover?: (e?: Event) => void,
};

export class Vector /* extends Map<string,Element> */ {
	constructor(
		id: string,
		nodes: JSON,
	) {
		// super(Object.entries(nodes));

		this._id = id;
		this._direction = "row";
		this._nodes = nodes.constructor.name == "Map" ? nodes as _ as Map<_, _> : new Map(Object.entries(nodes));
		this._is_frozen = false;
		// this.cocoon();
	}

	static from_arr(id: string, ...nodes: string[]): Vector {
		let idx = 0;
		const json = new Map(nodes.map((node: string) => {
			const kv = [idx,
				make("span", { "class": "vector-child " + idx, "p:textContent": node })];
			idx += 1;
			return kv;
		}) as Array<[number, Element]>);

		return new Vector(id, json as Object as JSON);
	}

	_id: string;
	_direction: "column" | "row";
	_nodes: Map<string, Element>;
	_is_frozen: boolean;

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

		order.filter((k: string) => this.contains(k));

		const map = new Map();
		const iter = order.values();
		let next = iter.next();
		while (!next.done) {
			map.set(next.value, this._nodes.get(next.value!));
			next = iter.next();
		}

		this._nodes = map;

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

	to_element(): VectorElement {
		return new VectorElement(this);
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

export class VectorElement extends HTMLElement {
	constructor(vector: Vector) {
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
customElements.define("vector-coll", VectorElement);

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

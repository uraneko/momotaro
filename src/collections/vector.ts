import { make, type Opt, is, NODISPLAY } from "momo_core/core";

type Wrapper = "a" | "button" | "span";
type Content = "main" | "sub" | "-";
type Callbacks = {
	click?: (e?: Event) => void,
	hold?: (e?: Event) => void,
	hover?: (e?: Event) => void,
};

export class Vector /* extends Map<string,Element> */ {
	constructor(
		nodes: JSON,
		id: string,
		kind: "button" | "div" = "button",
		direction: "column" | "row" = "row"
	) {
		// super(Object.entries(nodes));

		this._id = id;
		this._kind = kind;
		this._direction = direction;
		this._nodes = new Map(Object.entries(nodes));
		this._is_frozen = false;
		this.cocoon();
	}

	_id: string;
	_kind: "button" | "div";
	_direction: "column" | "row";
	_nodes: Map<string, Element>;
	_is_frozen: boolean;

	cocoon() {
		const iter = this.nodes();
		let next = iter.next();
		while (next.done == false) {
			this._nodes.set(next.value[0], vector_child(next.value, this.kind()));
			next = iter.next();
		}
	}

	nodes(): MapIterator<[string, Element]> {
		return this._nodes.entries();
	}

	id(): string { return this._id; }

	kind(): "button" | "div" {
		return this._kind;
	}

	direction() { return this._direction; }

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

	event(name: string, kind: string, callback: (e?: Event) => void) {
		if (!this.contains(name)) return undefined;

		// TODO
		const node = this._nodes.get(name)!;
		node.addEventListener(kind, callback);
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

class VectorElement extends HTMLElement {
	constructor(vector: Vector) {
		super();

		// NOTE every component, which this is one, must have an id 
		this.id = vector.id();
		this.className = "vector " + vector.direction();
		this.append(...vector.collect());
	}

	render(parent?: Element, r?: boolean) {
		is(r) ? r ? is(parent) ? parent!.appendChild(this) :
			document.body.appendChild(this)
			: this.remove() :
			is(parent) ? parent!.appendChild(this) :
				document.body.appendChild(this);
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
	const node_kind = (() => {
		if (tag == "svg") {
			return "icon";
		} else if (tag == "span") {
			return "text";
		} else {
			// tag == "div"
			return "icon+text";
		}
	})();
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

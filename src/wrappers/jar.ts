type JarEvent = "key" | "link" | "none";

const parent_kind = (parent: string): string => {
	return parent == "vector-coll" ? "vector" : parent == "tree-coll" ? "tree" : "matrix";
}

export class Jar extends HTMLElement {
	constructor(parent: string, name: string, child: Element) {
		super();

		this._event = "none";
		const child_tag = child.tagName.toLowerCase();
		const kind = child_tag == "svg" ? "-icon" : child_tag == "span" ? "-text" : "-mixed";
		this.classList.add(name + kind + "-jar");
		this.classList.add(parent_kind(parent.toLowerCase()) + "-child");
		this.appendChild(child);
	}

	private _event: JarEvent;

	static observedAttributes = [];

	connectedCallback() { }

	event(event: string, callback: (e: Event) => void) {
		this.addEventListener(event, callback);
	}

	has_no_events() { return this._event == "none"; }

	make_key(callback: (e: Event) => void) {
		this._event = "key";
		this.setAttribute("tabIndex", String(0));
		this.classList.add("pointer");
		this.event("click", callback);
	}

	make_link(uri: string) {
		this._event = "link";
		this.setAttribute("tabIndex", String(0));
		this.setAttribute("href", uri);
		this.classList.add("pointer");
		this.event("click", link_event(uri));
	}

	is_key() { return this._event == "key"; }

	is_link() { return this._event == "link"; }

	contains_icon() {
		// @ts-ignore
		return this.childNodes[0].tagName.toLowerCase() == "svg";
		// return this.childNodes
		// 	.values()
		// 	// @ts-ignore
		// 	.some((node: Element) =>
		// 		node.tagName.toLowerCase() == "svg");
	}

	contains_text() {
		// @ts-ignore
		return this.childNodes[0].tagName.toLowerCase() == "span";
		// return this.childNodes
		// 	.values()
		// 	// @ts-ignore
		// 	.some((node: Element) =>
		// 		node.tagName.toLowerCase() == "span");
	}

	clone(): this {
		return structuredClone(this);
	}

	into_frozen(): this {
		return Object.freeze(this);
	}

	to_frozen(): this {
		return Object.freeze(this.clone());
	}
}
customElements.define("jar-vessel", Jar);

export const link_event = (uri: string): (e: Event) => void => {
	return (e: Event) => {
		const ke = <KeyboardEvent>e;
		if (ke.ctrlKey) {
			open(uri, "_blank");
		} else location.href = uri;
	}
}


import { make, type Maybe, type _ } from "../../../core/src/core";

export class ShadowContainer extends HTMLElement {
	constructor(id: string, ...nodes: Element[]) {
		super();

		this.id = id;
		this.className = "shadow-host";
		this._shadow = this.attachShadow({ mode: "open" });
		this._shadow.append(...nodes);
		this._state = new Map();
	}

	private _shadow: ShadowRoot;
	private _state: Map<string, _>;

	// pushs a new data entry or update existing one on the state
	// returns true in case of an update 
	// or false when pushing a new key val pair
	push(key: string, value: _): boolean {
		const updating = this._state.has(key);
		this._state.set(key, value);

		return updating;
	}

	// gets a data entry from the _state 
	read(key: string): Maybe<_> {
		this._state.has(key) ? this._state.get(key) : undefined;
	}

	// toggles a class on this container's class list
	cls(cls: string) {
		this.classList.toggle(cls)
	}

	static observedAttributes = [];

	connectedCallback() { }

	// adds a new external css stylesheet to the shadow dom of this container host 
	css(href: string) {
		const stl = make("link", { "rel": "stylesheet", "type": "text/css", "href": href });
		this._shadow.prepend(stl);
	}

	batch_css(...css: string[]) {
		css.forEach((css: string) => this.css(css));
	}

	// gets the shadow dom 
	shadow(): ShadowRoot {
		return this._shadow
	}

	// appends this container to the parent element 
	render(parent: Element) {
		parent.appendChild(this);
	}
}
customElements.define("shadow-container", ShadowContainer);

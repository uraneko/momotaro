export class Container extends HTMLDivElement {
	constructor(id: string, ...nodes: Element[]) {
		super();

		this.setAttribute("is", "shadow-container");
		this.className = "container";
		this._shadow = this.attachShadow({ mode: "open" });
		this.append(...nodes);
	}

	private _shadow: ShadowRoot;

	static observedAttributes = [];

	connectedCallback() { }

	shadow(): ShadowRoot {
		return this._shadow
	}

}
customElements.define("shadow-container", Container, { extends: "div" });

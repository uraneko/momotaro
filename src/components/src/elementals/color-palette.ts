import { make, Maybe, _ } from "momotaro_core/core";

export class ColorPalette extends HTMLCanvasElement {
	constructor() {
		super();

		this.setAttribute("width", "200");
		this.setAttribute("height", "200");

		this.getContext("2d");
	}

	render(parent: Element) {
		parent.appendChild(this);
	}
}
customElements.define("color-palette", ColorPalette, { extends: "canvas" });

export class ColorPicker extends HTMLElement {
	constructor() {
		super();

		const rgb_palette = new ColorPalette();
		const alpha_palette = new ColorPalette();

		this.append(rgb_palette, alpha_palette);
	}

	static observedAttributes = [];

	attributeChangedCallback(name: string, oldValue: string, newValue: string) { }

	private _state: [number, number, number, number];

	attach() {
		document.body.appendChild(this);
	}

	detach() {
		this.remove();
	}

	toggle() {
		document.body.contains(this) ? this.detach() : this.attach();
	}
}
customElements.define("color-picker", ColorPicker);

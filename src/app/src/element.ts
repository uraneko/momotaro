
class AppElement {
	constructor(...containers: MonoContainer[]) {
		this.dom = make("div", {
			"id": "application",
			"data-content-signal": "",
			"data-plugins-signal": "",
		});
		this.containers = new Map();
		this.containers = new Map(...containers.map((c: MonoContainer) => [c.id, c]));
		// this.containers.set("main-content", new MonoContainer("main-content", false));
		// this.containers.set("sub-content-first", new MonoContainer("sub-content-first", false, false));
		// this.containers.set("main-menu", new MonoContainer("main-menu"));

		this.dom.append(
			...this.containers.values().map((mc: MonoContainer) => mc.element())
		);
	}

	private dom: HTMLElement;
	// since there are 2 types of content in an app 
	// main(fixed/always there)  and sub(floating/togglable) 
	// this indicates if the sub content is being displayed
	private overlayed: boolean = false;
	private containers: Map<string, MonoContainer>;

	element() { return this.dom }

	// TODO: refactor/redesign the api 
	// main /sub content need to be gone 
	// contents member too 

	// updates the main content container with a new component child
	main<T extends HTMLElement>(dom: T) {
		this.disable_overlay();
		this.containers.get("main-content")!.update(dom);
	}

	sub<T extends HTMLElement>(dom: T) {
		this.containers.get("sub_content")!.update(dom);
		this.enable_overlay();
	}

	// returns an array of the floating containers in the app dom part
	query_floating(): Array<Element> {
		return new Array(
			...Object.values(this.dom.querySelectorAll("& > .container.floating"))
		);
	}

	// returns an array of the fixed containers in the app dom part
	query_fixed(): Array<Element> {
		return new Array(
			...Object.values(this.dom.querySelectorAll("& > .container.fixed"))
		);
	}

	query_static(): Array<Element> {
		return new Array(
			...Object.values(this.dom.querySelectorAll("& > .container.static"))
		);
	}

	query_dynamic(): Array<Element> {
		return new Array(
			...Object.values(this.dom.querySelectorAll("& > .container.dynamic"))
		);
	}

	query_floating_displayed(): Array<Element> {
		return new Array(
			...Object.values(this.dom.querySelectorAll("& > .container.floating.display"))
		);
	}

	query_floating_not_displayed(): Array<Element> {
		return new Array(
			...Object.values(this.dom.querySelectorAll("& > .container.floating"))
		).filter((e: Element) => !e.classList.contains("display"));
	}

	// updates a container with a new component, removing the old one 
	// this should be a method of Application
	// LOGIC BUG there has to be a separation of container and component
	// once that happens, this class can take a number of containers witheir class or id 
	// then components come and go in the containers
	update_container(name: string) { }

	// replaces a container with a new container, component and all 
	replace_container(old_container: string, container: MonoContainer) { }

	// removes all components that have floating class from the dom display
	// TODO
	private disable_overlay_all() {

		this.overlayed = false;
	}

	// adds all components that have floating and display classes to the dom display
	// TODO
	private enable_overlay_all() { this.overlayed = true; }

	// toggles between disabling and enabling the overlay
	private toggle_overlay_all() {
		this.overlayed ? this.disable_overlay_all() : this.enable_overlay_all();
	}

	// manually set overlay for all floating display components 
	private overlay_all(overlay: boolean) {
		overlay ? this.enable_overlay_all() : this.disable_overlay_all();
	}

	signal(kind: "content" | "plugins"): [string, string] {
		return this.dom.getAttribute("data-" + kind + "-signal")!.split(':') as [string, string];
	}
}


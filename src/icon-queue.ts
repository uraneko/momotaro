import { make, MonoContainer, Opt, Res } from "momo_build/main";

type IconItemConstructor = (
	name: string,
	icon: SVGSVGElement,
	wrapper: "button" | "a",
	on_click?: (e?: Event) => void,
	on_hover?: (e?: Event) => void,
	on_hold?: (e?: Event) => void) => IconItem;

class IconQueue {
	constructor(id?: string, ...icons: [IconItem]) {
		this.icons = icons;
		this.dom = make(
			"div",
			{ "class": "icon-queue", "id": id },
			icons.map((i: IconItem) => i.element())
		) as HTMLDivElement;
	}

	icons: Array<IconItem>;
	dom: HTMLDivElement;


	clear() {
		this.dom
			.querySelectorAll("> .icon-wrapper")!
			.forEach((iw: Element) => iw.remove());
	}

	// adds a new IconItem to the end of queue
	append(icon: IconItem) {
		this.icons.push(icon);
		this.dom.appendChild(icon.element());
	}

	prepend(icon: IconItem) {
		this.icons.unshift(icon);
		this.dom.prepend(icon.element());
	}


	// inserts a new IconItem at idx position in the queue
	insert(icon: IconItem, idx: number) {
		this.icons.splice(idx, 0, icon);
		this.dom.insertBefore(this.dom.childNodes[idx + 1], icon.element());
	}

	// removes an IconItem from the queue by its given name 
	remove_by_name(name: string) {
		this.icons = this.icons.filter((icon: IconItem) => {
			// condition
			const cndt = icon.ident() != name;
			// FIXME: this keeps checking the condition every time 
			// would like to stop after element is found 
			if (!cndt) icon.element().remove();

			return cndt;
		});
	}

	remove_by_idx(idx: number) {
		const rmed = this.icons.splice(idx, 1);
		rmed[0].element().remove();
	}

	// searchs for an icon item by either name or index
	lookup_by_idx(idx: number): IconItem {
		return this.icons[idx];
	}

	lookup_by_name(name: string): Opt<IconItem> {
		return this.icons.find((icon: IconItem) => icon.ident() == name);
	}
}

// NOTE: css should be modular? (not sure thats the word) but
// should write many varying css rules for the same element based on different class lists
// and then js code only changes the class list values 
// which effectively changes the css rules 

class IconItem {
	constructor(
		name: string,
		icon: SVGSVGElement,
		wrapper: "button" | "a",
		on_click?: (e?: Event) => void,
		on_hover?: (e?: Event) => void,
		on_hold?: (e?: Event) => void
	) {
		this.name = name;
		this.ref = this.refers_to(wrapper);
		this.dom = make(wrapper, {
			"class": this.class_name(on_click, on_hover, on_hold),
			"title": name,
			"id": name + "-wrapper",
			"e:click": on_click,
			"e:hover": on_hover,
			"e:hold": on_hold
		}, [icon]) as any as HTMLElement;

	}

	private dom: HTMLElement;
	private click_event: boolean = false;
	private hold_event: boolean = false;
	private hover_event: boolean = false;
	private name: string;
	private ref: "main" | "sub";

	ident(): string { return this.name; }

	element(): HTMLElement {
		return this.dom;
	}

	// generates a class name for the icon item based on it's creation arguments
	class_name(
		on_click?: (e?: Event) => void,
		on_hold?: (e?: Event) => void,
		on_hover?: (e?: Event) => void
	) {
		let class_name = "icon-wrapper " + this.name;
		if (on_click != undefined) { class_name += " click-event"; this.click_event = true; }
		if (on_hold != undefined) { class_name += " hold-event"; this.hold_event = true; }
		if (on_hover != undefined) { class_name += " hover-event"; this.hover_event = true; }

		return class_name;
	}

	refers_to(wrapper: "button" | "a"): "main" | "sub" {
		return wrapper == "a" ? "main" : "sub";
	}

	// replaces the old svg icon with a new one 
	replace(
		wrapper: "button" | "a",
		name: string,
		icon: SVGSVGElement,
		on_click?: (e?: Event) => void,
		on_hover?: (e?: Event) => void,
		on_hold?: (e?: Event) => void,
	) {
		this.name = name;
		this.ref = this.refers_to(wrapper);
		this.dom = make(wrapper, {
			"title": name, "class": this.class_name(on_click, on_hover, on_hold),
			"e:click": on_click, "e:hold": on_hold, "e:hover": on_hover
		}, [icon]
		) as any as HTMLElement;
	}

	// removes this icon element from the html dom tree
	remove() {
		this.dom.remove();
	}
}

// EXAMPLE: click event on random icon changes signal on app element
const click_event = (name: string, kind: "main" | "sub") => {
	const signal_keeper = document.body.firstChild! as HTMLElement;
	// NOTE: cant really pass name or kind to event function, this fn is just 
	// a placeholder example
	signal_keeper.setAttribute("data-signal", kind + ":" + name);
};
// NOTE: for now hover and hold events are ignored; neither set nor used

/*  "a:home:landing-page",
	"b:server-events:",
	"b:apps:app-menu",
	"b:configs:",
	"sep",
	"b:msg:messages",
	"b:bell:notifications" */



export class KeyBindings {
	constructor() {
		this.bindings = new Array();
	}

	private bindings: KeyBinding[];



	find_with_modifiers(...mods: string[]): KeyBinding[] {
		let bindings = new Array();
		while (mods.length > 0) {
			const mod = mods.pop()!;
			bindings.push(...this.bindings.filter((b: KeyBinding) => b.has_modifier(mod)));
		}

		return bindings;
	}

	find_with_all_modifiers(...mods: string[]): KeyBinding[] {
		return this.bindings.filter((b: KeyBinding) => b.has_modifiers(...mods));
	}


	find_with_key(key: string): KeyBinding[] {
		return this.bindings.filter((b: KeyBinding) => b.has_key(key));
	}

	push(kb: KeyBinding) {
		this.bindings.push(kb);
	}

	remove_by_idx(idx: number) {
		this.bindings.splice(idx, 1);
	}

	remove_by_val(value: KeyBinding) {
		this.bindings = this.bindings.filter((b: KeyBinding) => b != value);
	}
}

class KeyBinding {
	constructor(key: string, callback: (e?: Event) => void, ...modifiers: string[]) {
		this.modifiers = modifiers;
		this.key = key;
		this.callback = callback;
		this.elements = new Array();
	}

	private modifiers: string[];
	private key: string;
	private callback: (e?: Event) => void;
	private bound: boolean = false;
	private elements: Element[];

	// bind/unbind methods operate on all elements in the key binding elements member 
	// if minute/separate control of which elements to bind/unbind is required 
	// then make different bindings with the same callback, keys and modifiers but with different elements 
	bind() {
		this.elements.forEach((e: Element) => e.addEventListener("keydown", this.callback));
		this.bound = true;
	}

	unbind() {
		this.elements.forEach((e: Element) => e.removeEventListener("keydown", this.callback));
		this.bound = false;
	}

	has_modifier(mod: string): boolean { return this.modifiers.includes(mod); }

	has_modifiers(...mods: string[]): boolean {
		return this.modifiers.every((m: string) => mods.includes(m));
	}

	has_key(key: string): boolean {
		return this.key == key;
	}

	// NOTE not gonna add any other methods since the KeyBinding is not supposed to be rewriteable
}

// NOTE in firefox hyper & super are both os

// click generates a PointerEvent 
// keydown/up generate a KeyboardEvent
// events references can be found at "https://developer.mozilla.org/en-US/docs/Web/Events"
const records = new Array();
const timed = () => {
	function perform(e: Event) {
		if (e.constructor.name == "KeyboardEvent") {
			const ke = <KeyboardEvent>e;
			records.push({
				shift: ke.shiftKey,
				ctrl: ke.ctrlKey,
				alt: ke.altKey,
				key: ke.key,
				time: ke.timeStamp,
			});

			const last = records.at(-2);
			if (ke.shiftKey == last.shift &&
				ke.ctrlKey == last.ctrl &&
				ke.altKey == last.alt &&
				ke.key == last.key &&
				ke.timeStamp - last.time <= 1000) {
				console.log("double press detected");
			} else {
				console.log("this is a simple key down event");
			}
		}
	}

	document.addEventListener("keydown", perform);
}

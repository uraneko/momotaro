// this type alias is just that; an alias
// it doesnt have the functionality of an option type
export type Maybe<T> = T | undefined;

export type _ = any;

// export const NODISPLAY = "hidden";

// types that matches all functions 
export type Fn = (...args: any[]) => any;

/// checks if a value is not undefined
/// returns boolean 
export const is = <T>(val: Maybe<T>): boolean => {
	// NOTE can be used for both null and undefined 
	// since the expr type casts 
	return val != undefined;
}

// NOTE the generic is probably not needed
export const type_name = <T extends Object>(value: T):
	string => { return value.constructor.name; }

/// returns a new element with given tag name, attributes and children
/// passing no arguments will return a new div: <div></div>
/// attributes with undefined as their value are ignored 
export const make = <T extends Element>(
	// the element tag 
	tag: string = "div",
	/// the element attributes 
	/// includes 4 classes 
	/// p:<attrname>: <attrvalue>
	/// attributes passed in this form are set for the element directly: 
	/// e[attrname] = attrvalue
	/// s:<attrname>: <attrvalue>
	/// attributes passed in this form are set for the element style directly: 
	/// e.style[attrname] = attrvalue
	/// e:<attrname> = <attrvalue>
	/// these are events, they are set using:
	/// addEventListener(attrname, attrvalue) <- value is a function
	/// finally <attrname> = <attrvalue>
	/// these are set using e.setAttribute(attrname, attrvalue)
	attrs?: Object,
	/// the element children
	children?: Maybe<T>[]
): T => {
	const html = document.createElement(tag);
	if (children != undefined) {
		html.append(...children.filter((child: Maybe<T>) => child != undefined) as T[]);

	}
	if (attrs != undefined) {
		for (const [k, v] of Object.entries(attrs)) {
			if (v == undefined) { continue; }
			const prefix = k.slice(0, 2);
			if (prefix == "p:") {
				(html as any)[k.slice(2)] = v;

			} else if (prefix == "s:") {
				html.style[k.slice(2) as any] = v;

			} else if (prefix == "e:") {
				html.addEventListener(k.slice(2), v);

			} else {
				html.setAttribute(k, v);
			}
		}
	}

	return html as any as T;
}

// TEST: tests the make function
// currently not working since runtimes have no access to the dom apis (no window.document)

// batch appends ne w children to 
export const extend = (parent: Element, ...items: Element[]) => {
	const frag = document.createDocumentFragment();
	items.forEach((i: Element) => frag.appendChild(i));
	parent.appendChild(frag);
}

// inserts a new sibling node before the given index
export const put = (parent: Element, child: Element, idx: number) => {
	parent.insertBefore(parent.childNodes[idx + 1], child);
}

export class DocumentNode {
	constructor(e: Element) {
		this.e = e;
	}

	private e: Element;

	// makes a new docnode
	static make() { }

	// pushes dom element to this.e
	push() { }

	// puts dom element at idx pos in this.e children
	put() { }

	// extends dom element with many children
	extend(...items: Element[]) {
		const frag = document.createDocumentFragment();
		items.forEach((i: Element) => frag.appendChild(i));
		this.e.appendChild(frag);
	}

	// removes this.e from dom 
	drop() {
		this.e.remove();
	}

	// removes child element from this.e 
	remove() { }

	// swaps 2 child elements
	swap(child: Element, other: Element) {
		if (!this.e.contains(child)) { throw new Error("element is not child of this.e"); }
		child.replaceWith(other);
	}

	// removes all children dom nodes of this.e 
	clear() {
	}

	// toggles this.e's display on and off
	toggle_display() {
		this.e.classList.toggle("hidden");
	}

	// sets this.e display to passed value
	display(d: boolean) {
		d ? this.e.classList.add("hidden") : this.e.classList.remove("hidden");
	}

	// returns this.e 
	element() {
		return this.e;
	}
}

// the following classes are not to be inherited but they are simply here to record the 
// methods they provide 
// should a class need methods from one of them 
// that class should implement those methods on its own 
// the only exception to this is if a class:
// - does not already extend another 
// - does not seem to be going to need to extend another class for the forseeable future
// - only needs to extend one of the following classes (such as the Parcel class which extends Clone)
// ... Even then, it is better practice for the class to implement the desired methods on its own
//
// use this when you want a type to be cloneable  
// dont call the wrapped function directly
export class Clone {
	// clones the value 
	clone(): this {
		return structuredClone(this)
	}

}

// use this when you want your class to be able to pass around shallow copies to the owned 
// class instance 
// NOTE (calling this MutRef is for convieniece sake, this should be closer to rust Copy trait)
// this is a really bad/dangerous idea
// as it allows for basically concurrent multiple mutable bindings to the same object
export class ShallowCopy {
	// returns something that behaves like a mutable reference to the value 
	shallow() {
		return Object.create(this);
	}
}

// this is not really a ref 
// but a frozen clone 
export class Frozen {
	// returns a frozen clone of this, doesn't affect this
	to_frozen(): Readonly<this> {
		return Object.freeze(structuredClone(this));
	}

	// returns the object frozen; 
	// this and all properties can not be written to for the reminder of the program
	// can not be undone 
	into_frozen(): Readonly<this> {
		return Object.freeze(this);
	}

	// returns a boolean indicating the frozenability state of this object
	is_frozen(): boolean { return Object.isFrozen(this); }
}

// export class FrozenAndShallow extends Frozen {
// 	shallow(): this {
// 		return Object.create(this);
// 	}
// }

// TODO
const zip = <T extends Object>(...objs: T[]) => {
	// the keys check is needed since anything that implements eq can call the method
	// and js doesnt really care what type are being compared as long as they extend Eq
	// can be replaced with constructor name equality though
	return objs.map((o: T) => Object.entries(o).flat());
}

export class Equal {
	eq(other: this): boolean {
		// not sure what this is validating 
		// always gives false
		// return this == other;
		// return zip(this, other).every((arr: any[]) => new Set(arr).size == 1);
		const a = Object.entries(this).flat();
		const b = Object.entries(other).flat();

		return a.every((_, i) => a[i] == b[i]);
	}
}



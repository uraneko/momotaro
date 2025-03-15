// this type alias is just that; an alias
// it doesnt have the functionality of an option type
export type Opt<T> = T | undefined;

/// checks if a value is not undefined
/// returns boolean 
export const is = <T>(val: Opt<T>): boolean => {
	return val != undefined;
}

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
	children?: Opt<T>[]
): T => {
	const dom = document.createElement(tag);
	if (children != undefined) {
		dom.append(...children.filter((child: Opt<T>) => child != undefined) as T[]);

	}
	if (attrs != undefined) {
		for (const [k, v] of Object.entries(attrs)) {
			if (v == undefined) { continue; }
			const prefix = k.slice(0, 2);
			if (prefix == "p:") {
				(dom as any)[k.slice(2)] = v;

			} else if (prefix == "s:") {
				dom.style[k.slice(2) as any] = v;

			} else if (prefix == "e:") {
				dom.addEventListener(k.slice(2), v);

			} else {
				dom.setAttribute(k, v);
			}
		}
	}

	return dom as any as T;
}

// TEST: tests the make function
// currently not working since runtimes have no access to the dom apis (no window.document)

// export type Constructor<T> = { new(): T };

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



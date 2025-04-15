import { is, Maybe } from "../../core/src/core";

export class Router {
	constructor() {
		this.idx = history.length;
		this.init();
	}

	// @ts-ignore
	private stack: string[];
	private idx: number;

	// initializes the stack 
	private init() {
		if (this.idx == 0) {
			this.stack = [location.href];
		} else {
			const cached = this.load();
			// localstorage cleaned by user 
			// or any other reason why it's not there
			if (!is(cached)) {
				// error message here
				alert("History stack has been deleted. Page history out of sync.");
				// WARN idx and stack are not in sync here 
				// BUG FIXME
				this.stack = [location.href];
			} else {
				this.stack = cached;
			}
		}
	}

	// pushs new internal history state 
	private push() {

	}

	// pops some number of last entries in the history stack 
	private pop(count?: number) {
		this.stack = is(count) ? this.stack.slice(0, this.stack.length - count!)
			: this.stack.slice(0, this.stack.length - 2);
	}

	// syncs external history state 
	private merge() {
	}

	// stringifies stack array 
	private to_string(): string {
		return String(this.stack);
	}

	// cache stack before leaving to an external domain
	// FIXME cache stack in cookie not in localstorage 
	// then on leave send cookie to server 
	private cache() {
		localStorage.setItem("history_stack", this.to_string());
	}

	// load cached stack if any 
	private load(): Maybe<Array<string>> {
		const res = localStorage.getItem("history_stack");
		if (!is(res)) return undefined;

		return JSON.parse(res!);
	}

	// wrapper method for Router state logic 
	route() { }
}

// NOTE 'location.replace' method does NOT push to history stack 
// meanwhile 'location.href = <href>' && the 'location.assign' method do push to history stack 

export class InternalRoute { }

export class ExternalRoute { }

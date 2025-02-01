import { make, MonoContainer, Opt, Res } from "momo_build/main";

// NOTE: the T[] array syntax gets confusing with more complex types, use only in simple cases
class Node {
	constructor(value?: string, children?: Node[]) {
		this.value = value;
		if (children != undefined) this.children = children;
	}

	private value: Opt<string>;
	private children: Opt<Node[]>;

	node_class(is_root: boolean) {
		return "tree-node" +
			is_root ? " is-root" : " is-child" +
				this.children == undefined ? "" : " is-parent" +
					this.value == undefined ? "" : " has-value"
	}

	parse(is_root: boolean, title?: string): HTMLSpanElement {
		return make("span",
			{ "class": this.node_class(is_root), "p:textContent": this.value, "id": title },
			this.children == undefined ?
				<Array<HTMLSpanElement>>[] :
				this.children.map((node) => node.parse(false))
		);
	}

	has_value(): boolean { return this.value != undefined; }

	has_children(): boolean { return this.children != undefined; }

	count(): number {
		return this.has_children() ? this.children!.length : 0;
	}

	// idx is 0 indexed; just check before calling this method that children count != 0
	child(idx: number): Node {
		// this check is done through the 
		// is_valid_idx method 
		// if (this.count_children() >= idx) {
		return this.children![idx];
	}

	is_valid_idx(idx: number): boolean {
		const count = this.count();

		return count > 0 && count > idx && idx >= 0;
	}

	replace(node: Node, idx: number): Opt<Node> {
		if (this.is_valid_idx(idx)) {
			let old = this.children![idx];
			this.children![idx] = node;

			return old
		} else return undefined;
	}

	remove(idx: number): Opt<Node> {
		if (this.is_valid_idx(idx)) {
			this.children!.splice(idx, 1)[0];
			// FIXME: undefined is confusing and shrewd
			// once Res and Opt are written change all the undefined logic with them 
		} else return undefined;
	}

	// inserts the given node at the given index position 
	// if the index does not exist in array length 
	// or children is undefined then 
	// returns the given node and does nothing 
	insert(node: Node, idx: number): Opt<Node> {
		if (this.is_valid_idx(idx - 1)) {
			this.children!.splice(idx, 0, node);

		} else return node;
	}

	have_children() {
		if (!this.has_children()) {
			this.children = new Array();
		}
	}

	// declares a new value for this node 
	// doesn't care wether the value was set before or not (undefined)
	decl_value(value: string) {
		this.value = value;
	}
}


export class NodeTree {
	constructor(root: Node, title?: string) {
		this.tree = root;
		this.title = title;
		this.dom = this.tree.parse(true, this.title);
	}

	private dom: HTMLSpanElement;
	private tree: Node;
	private title: Opt<string>;

	element() { return this.dom; }

	is_valid_path(idx: number[]) {
		return idx.length > 0 && this.tree.has_children();
	}

	node(...idx: number[]): Opt<Node> {
		if (!this.is_valid_path(idx)) return undefined;

		idx = idx.reverse();
		let node = this.tree;
		while (idx.length > 0) {
			const next = idx.slice(-1)[0];
			if (node.is_valid_idx(next)) {
				node = node.child(next);
				idx.pop();
			}
		}

		return node;
	}

	replace(node: Node, ...idx: number[]): Opt<Node> {
		if (!this.is_valid_path(idx)) return undefined;

		const rplc = idx.pop()!;
		const parent = this.node(...idx);
		if (parent == undefined) return undefined;

		const res = parent.replace(node, rplc);
		if (res == undefined) return res;

		idx.push(rplc);
		const dom_node = this.dom_find_node(...idx);
		dom_node.replaceWith(node.parse(false))
	}

	remove(...idx: number[]): Opt<Node> {
		if (!this.is_valid_path(idx)) return undefined;

		const rm = idx.pop()!;
		const parent = this.node(...idx);
		if (parent == undefined) return undefined;

		const res = parent.remove(rm);
		if (res == undefined) return res

		idx.push(rm);
		const dom_node = this.dom_find_node(...idx);
		dom_node.remove();
	}

	insert(node: Node, ...idx: number[]): Opt<Node> {
		if (!this.is_valid_path(idx)) return undefined;

		const add = idx.pop()!;
		const parent = this.node(...idx);
		if (parent == undefined) return node;

		const res = parent.insert(node, add);
		if (res == node) return res;

		const dom_parent = this.dom_find_node(...idx);
		dom_parent.insertBefore(dom_parent.childNodes[add + 1], node.parse(false));
	}

	// no need to check validity of idx 
	// since the method calling this one does that already 
	dom_parse_idx(...idx: number[]): string {
		let query = "";
		idx = idx.reverse();
		while (idx.length > 0) {
			query += `span:nth-child(${idx.pop()! + 1}) `;
		}

		return query;
	}

	// TODO: this method needs to accompany the node operations methods above 
	// so that the dom is in sync with the node tree
	dom_find_node(...idx: number[]): HTMLSpanElement {
		return this.dom.querySelector(this.dom_parse_idx(...idx))!;
	}
}

class NodeTreeNavigator {
	constructor(tree: NodeTree) {
		this.tree = tree;
		this.anchor = []
	}

	private tree: NodeTree;
	private anchor: Array<number>;

	// moves the anchor to the next sibling in the tree 
	// if at last node of current children array then does nothing 
	next() {
		const parent = this.tree.node(...this.anchor.slice(0, -2))!;
		const curr = this.anchor.slice(-1)[0];
		// curr + 
		// 1 (since count() is 1 index based while curr is 0 based) + 
		// 1 (since we want to know if the next sibling exists)
		if (parent.count() < curr + 2) return undefined;
		this.anchor.splice(-1, 1, curr + 1);
	}

	// moves the anchor to the previous sibling in the tree
	// if at first node of current children array then does nothing and returns undefined 
	prev() {
		const curr = this.anchor.slice(-1)[0];
		if (curr == 0) return undefined;
		this.anchor.splice(-1, 1, curr - 1);
	}

	// moves the anchor to the next level in the tree - first child of current anchored node -
	// if anchor node has no children does nothing and returns undefined 
	forward() {
		const node = this.tree.node(...this.anchor)!;
		if (!node.has_children()) return undefined;

		this.anchor.push(0);
	}

	// moves the anchor to the next level in the tree - first child of current anchored node -
	// if anchor node has no children does nothing and returns undefined 
	backward() {
		if (this.anchor.length == 0) return undefined;

		this.anchor.pop();
	}

	// returns the index sequence of the anchor node
	position(): number[] { return this.anchor; }

	// TODO: 
	// next() method but jumps to first sibling if anchor node is the last one in array of children
	jumping_next() {
		const parent = this.tree.node(...this.anchor.slice(0, -2))!;
		const curr = this.anchor.slice(-1)[0];
		// curr + 
		// 1 (since count() is 1 index based while curr is 0 based) + 
		// 1 (since we want to know if the next sibling exists)
		if (parent.count() < curr + 2) {
			this.anchor.splice(-1, 1, 0);
		} else {
			this.anchor.splice(-1, 1, curr + 1);
		}
	}
	// prev() method but jumps to last sibling if anchor node is the first one in array of children
	jumping_prev() {
		const parent = this.tree.node(...this.anchor.slice(0, -2))!;
		const count = parent.count();
		const curr = this.anchor.slice(-1)[0];
		if (curr == 0) {
			this.anchor.splice(-1, 1, count - 1);
		} else {
			this.anchor.splice(-1, 1, curr - 1);
		}
	}
}

import { make, type Maybe } from "momo_core/core";
import { Jar } from "../wrappers/jar";

export class TreeElement extends HTMLElement {
	constructor(id: string, tree: JSON) {
		super();

		// @ts-ignore
		window.fs = tree;
		this.id = id;

		const name = Object.keys(tree)[0];
		const nodes = Object.values(tree)[0];

		this.appendChild(parse_dir("tree-coll", name, nodes));
	}

	cls(...cls: string[]) {
		this.classList.add(...cls)
	}

	render(parent: HTMLElement) {
		parent.appendChild(this);
	}
}
customElements.define("tree-coll", TreeElement);

const parse_dir = (parent: string, name: string, nodes: Array<Node>) => {
	const name_jar: Jar = new Jar("jar-vessel", name + " node-name ",
		make("span", { "class": "node-name", "p:textContent": name })
	);

	const nodes_jar = new Jar("jar-vessel", name + " node-children ");
	nodes.forEach((node: Node) => {
		if (is_str(node)) {
			nodes_jar.appendChild(dir_node(node as string));
		} else {
			const node_name = Object.keys(node)[0];
			const node_children = Object.values(node)[0];
			nodes_jar.appendChild(parse_dir("jar-vessel", node_name, node_children));
		}
	});

	return new Jar(parent, name + " node-jar ", name_jar, nodes_jar);
}

type Node = string | Record<string, Node[]>;

const dir_node = (node: string): HTMLSpanElement => {
	return make("span", { "class": "node-content", "p:textContent": node });
};

const is_str = (node: Node): boolean => {
	return node.constructor.name == "String";
}

const is_obj = (node: Node): boolean => {
	return node.constructor.name == "Object";
}

import { make, type Maybe } from "../../../core/src/core";
import { Jar } from "../wrappers/jar";
import { VectorElement, Vector } from "../collections/vector";

export class MatrixElement extends HTMLElement {
	constructor(id: string, ...cols: string[]) {
		super();

		this.id = id;
		this._cols = cols.length;
		this._size = 0;

		const cols_vec = Vector.from_arr("", ...cols);
		const vec = cols_vec.to_element();
		vec.cls("matrix-cols");
		this.appendChild(vec);
		const jar = new Jar();
		// make("jar-vessel", { "class": "matrix-rows" })
		this.appendChild(jar);

		this.style.setProperty("--meta-cols", String(this.len()));
		this.style.setProperty("--meta-rows", "0");
	}

	private _cols: number;
	private _size: number;

	// adds new classes to this element's classlist
	cls(...cls: string[]) {
		this.classList.add(...cls)
	}

	// count of matrix columns
	len() {
		return this._cols;
	}

	// count of matrix rows 
	// excluding the columns first row 
	size() {
		return this._size;
	}

	// removes a row from the matrix
	de_row(row: number) {
		if (this.size() < row) return;
		this.rows().querySelectorAll(".r" + row).forEach((cell: Element) => cell.remove());
	}

	// removes a col from the matrix
	de_col(col: number) {
		if (this.len() < col) return;
		this.rows().querySelectorAll(".c" + col).forEach((cell: Element) => cell.remove());
		this.cols().querySelector("." + col)!.remove()
	}

	rows(): Jar {
		return this.childNodes[1] as Jar;
	}

	cols(): VectorElement {
		return this.childNodes[0] as VectorElement;
	}

	// pushs a new vector(row) to this matrix 
	// if row entries count don't fit matrix columns count 
	// excessive values are discarded
	// an empty string is placed for unexisting values
	push(...nodes: string[]) {
		nodes = nodes.reverse();
		const rows = this.rows();

		const count = this.len();
		let offset = this.len();
		const size = this.size();

		let node = nodes.pop();
		while (offset > 0) {
			const cell = make("span", {
				"class": "matrix-cell " + " r" + size + " c" + (count - offset),
				"p:textContent": node,
			});
			rows.appendChild(cell);
			offset -= 1;
			node = nodes.pop() ?? "";
		}

		this._size += 1;
		this.style.setProperty("--meta-rows", String(this.size()));
	}

	// calls push on many new rows
	extend(...nodes: string[][]) {
		nodes.forEach((node_arr: string[]) => this.push(...node_arr))
	}

	render(parent: Element) {
		parent.appendChild(this);
	}
}
customElements.define("matrix-coll", MatrixElement);

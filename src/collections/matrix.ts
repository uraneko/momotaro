import { make, type Opt } from "momo_core/core";

type Lvl = 0 | 1 | 2 | 3;

export class Matrix {
	constructor(
		cols: number,
		rows: number,
		header_row?: Array<string>,
		header_col?: Array<string>,
		content?: Element[],
		id?: string,
	) {
		this.cols = cols;
		this.rows = rows;
		this.header_col = header_col;
		this.header_row = header_row;
		this.dom = make("div",
			{ "class": "matrix", "id": id },
			this.dom_build(content)
		) as HTMLDivElement;
	}

	private dom: HTMLDivElement;
	private cols: number;
	private rows: number;
	private header_col: Opt<Array<string>>;
	private header_row: Opt<Array<string>>;
	private mouse_ops: Lvl = 1;

	// returns the matrix cells in an array of empty (no content) HTMLSpanElements
	populate_new(): HTMLElement[] {
		const cells = new Array();
		for (let row = 1; row <= this.rows; row += 1) {
			for (let col = 1; col <= this.cols; col += 1) {
				cells.push(
					make("span",
						{ "class": "matrix-col-" + col + " matrix-row-" + row },
						[make("span", { "class": "matrix-cell-content" })]
					)
				)
			}
		}

		return cells;
	}

	// takes a number of optional element and returns the array of matrix cells
	// if a value in the middle should be empty, its value in the content array should be undefined
	// excess values are discarded, 
	// if there are less values than matrix cells count 
	// then the lacking cells will be handed as undefined, that is: empty cells
	populate_with(content: Opt<Element>[]): HTMLElement[] {
		content = content.reverse();
		const cells = new Array();
		for (let row = 1; row <= this.rows; row += 1) {
			for (let col = 1; col <= this.cols; col += 1) {
				cells.push(
					make("span",
						{ "class": "matrix-col-" + col + " matrix-row-" + row },
						[
							content.pop() ??
							make("span", { "class": "matrix-cell-content" })
						]
					)
				)
			}
		}

		return cells;
	}

	// returns the vertical headers column if any
	column_headers(): Opt<HTMLSpanElement> {
		if (this.header_col == undefined) return undefined;

		return make("span", { "class": "matrix-col-headers" },
			this.header_col!.map((s: string) =>
				make("span", { "class": "matrix-col-header", "p:textContent": s })
			)
		) as HTMLSpanElement;
	}

	// returns the horizontal headers row if any 
	row_headers(): Opt<HTMLSpanElement> {
		if (this.header_row == undefined) return undefined;

		return make("span", { "class": "matrix-row-headers" },
			this.header_row!.map((s: string) =>
				make("span", { "class": "matrix-row-header", "p:textContent": s })
			)
		) as HTMLSpanElement;
	}

	dom_build(content?: Element[]): [HTMLDivElement, Opt<HTMLSpanElement>, Opt<HTMLSpanElement>] {
		return [
			<HTMLDivElement>make("div", { "class": "matrix-content" },
				content == undefined ? this.populate_new()
					: this.populate_with(content!)
			),
			this.column_headers(),
			this.row_headers(),
		];

	}

	has_col(col: number): boolean {
		return this.cols >= col;
	}

	has_row(row: number): boolean {
		return this.rows >= row;
	}

	has_cell(...cell: [number, number]): boolean {
		return this.cols >= cell[0] && this.rows >= cell[1];
	}

	find_col(col: number): Opt<Element[]> {
		return this.has_col(col) ?
			new Array(...Object.values(this.dom.getElementsByClassName("matrix-col-" + col)))
			: undefined;
	}

	find_row(row: number): Opt<Element[]> {
		return this.has_row(row) ?
			new Array(...Object.values(this.dom.getElementsByClassName("matrix-row-" + row)))
			: undefined;
	}

	find_cell(...cell: [number, number]): Opt<Element> {
		return this.has_cell(...cell) ?
			this.dom.querySelector(".matrix-col-" + cell[0] + ".matrix-row-" + cell[1])!
			: undefined;
	}

	// if false is given then the column with the given number is hidden from display 
	col_display(col: number, display: boolean) {
		if (!this.has_col(col)) return undefined;
		const items = this.find_col(col)!;

		(<Element[]>items).forEach((e: Element) => display ?
			e.classList.remove("no-display") : e.classList.add("no-display")
		);
	}

	// if false is given then the row with the given number is hidden from display 
	row_display(row: number, display: boolean) {
		if (!this.has_row(row)) return undefined;
		const items = this.find_row(row)!;

		(<Element[]>items).forEach((e: Element) => display ?
			e.classList.remove("no-display") : e.classList.add("no-display")
		);
	}

	// apply a certain style to a col, e.g., gray out, all red background ...
	col_do(col: number, callback: (e: Element) => void) {
		if (!this.has_col(col)) return undefined;
		const items = this.find_col(col)!;


		(<Element[]>items).forEach((e: Element) => callback(e))
	}

	// apply a certain style to a row, e.g., gray out, all red background ...
	row_do(row: number, callback: (e: Element) => void) {
		if (!this.has_row(row)) return undefined;
		const items = this.find_row(row)!;

		(<Element[]>items).forEach((e: Element) => callback(e))
	}

	// same as make_row(col) but with a cell
	cell_do(callback: (e: Element) => void, ...cell: [number, number]) {
		if (!this.has_cell(cell[0], cell[1])) return undefined;
		const item = this.find_cell(...cell)!;

		callback(item);
	}

	// wether to turn mouse ops on or off 
	// level 0: mouse is not recognized 
	// 1: you can click on cells that have a click event
	// 2: you can resize cols/rows
	// 3: you can change content ordering by clicking on headers 
	use_mouse(lvl: Lvl) {
		this.mouse_ops = lvl;
	}
}

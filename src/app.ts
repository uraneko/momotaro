export class Application {
	constructor(content: string) {
		this.main_component = Application.launch();
		this.content = content;
		this.fetch_log = new Map();
	}

	private fetch_log: Map<URL, boolean>;
	private main_component: HTMLElement;
	private content: string;

	static launch() {
		return make("div", { "id": "application" }, []);
	}
}

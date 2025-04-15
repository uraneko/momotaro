// possibly better app design
class Application {
	private dom: ApplicationDOM;
	private logic: ApplicationLogic;
	private data: ApplicationData;
}
class ApplicationLogic {
	private app: System[];
	private nodes: Map<Node, System[];
}
class ApplicationDOM {
	private root: HTMLElement;
	private nodes: Map<Node, Element>;
}

class ApplicationData {
	private state: AppState;
	private nodes: Map<Node, Component[]>;
}

// EXAMPLE single system from one node 
(this: node, ...others: node[]) => X;

class System {
}

class Node {
	private name: string;
}

class AppState {
	private nodes: string[];
	private logs: Map<string, Log>;
	private cache: Map<string, any>;
}

class Component {
	private data: Object;
}

// NOTE the weak link is the Application class 
// should refactor that to have a dom masonry and nodes that fall somewhere in there 
// keep the classes, as they should fit better in js rather than an e-c-s-esque system 

class Log { }

// enum Logs {
// 	Fetch,
// 	Error,
// 	Plugin,
// 	Key,
// 	Navigation
// }

// enum AppLog {
// 	FetchLog,
// 	ErrorLog,
// 	KeyLog,
// 	NavigationLog
// }


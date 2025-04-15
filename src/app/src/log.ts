
class LogRecord {
	constructor(kind: string, opts: Object) {
		this.kind = kind;
		this.opts = opts;
		this.datetime = new Date();
	}

	// type of the operation being logged; e.g., fetch, error, navigator maneuver...
	private kind: string;
	// date and time the record was logged
	private datetime: Date;
	// additional record data
	private opts: Object;

	is_of_kind(kind: string): boolean {
		return this.kind == kind;
	}

	was_before(dt: Date): boolean {
		return this.datetime < dt;
	}

	was_after(dt: Date): boolean {
		return this.datetime > dt;
	}

	has_opts(opts: Object): boolean {
		return Object.entries(opts).every((kv) => {
			if (Object.hasOwn(this.opts, kv[0])) {
				if (kv[1] == undefined) {
					return true;
				} else if ((<any>this.opts)[kv[0]] == kv[1]) {
					return true
				} else { return false }
			} else { return false; }
		})
	}
}

class AppLogs {
	// TODO logs need date 
	constructor() {
	}

	private records: Array<LogRecord> = new Array();
	private errors: Map<string, Error> = new Map();
	private fetch: Map<string, boolean> = new Map();

	log(rec: LogRecord) {
		this.records.push(rec);
	}

	query_by_kind(kind: string): LogRecord[] {
		return this.records.filter((r: LogRecord) => r.is_of_kind(kind));
	}

	query_by_date(date: Date, before: boolean): LogRecord[] {
		return before ? this.records.filter((r: LogRecord) => r.was_before(date)) :
			this.records.filter((r: LogRecord) => r.was_after(date));

	}

	query_by_opts(opts: Object): LogRecord[] {
		return this.records.filter((r: LogRecord) => r.has_opts(opts))
	}

	// req(url: string, cached: boolean) {
	// 	this.fetch.set(url, cached);
	// }

	// NOTE: use this when you dont want to handle an error
	// err(error: Error) {
	// 	this.errors.set(error.name, error);
	// }
}

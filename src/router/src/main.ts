import {isNum, isEmpty} from "./dbg.js";
import {whatIs, isThere} from "./dbg.js";
import {returnMe} from "./unit.js";

// causality = actions -> results
//
// (trigger) click <a> change content // (coditions) history and sessionStorage equal // (result) change href + ui and content + update current page
// input url in address bar // possibility of prior foreign pages + sessionstorage behind history // update sessionstorage with the correct length and foreign pages then the current page
// click backward/forward //  // pushState changing only window href + update current page
// click <a> to new tab // _ // _
// restore tab/restore closed session // history intact + records null // restore sessionstorage from localstorage + update current page
//

interface State {
    now: Page,
    trigger: 0 | 1 | 2 | 3 | 4 | 5, // none | linkClick | historyNavigation | cleanPage | restoredPage | closingPage
    history: {
        headers: (key: 0 | 1 | 2) => Array<string>, //  0 all | 1 internal | 2 external
        records: (key: 0 | 1 | 2) => Map<string, string>,
    },
    navigation: {
        left: () => boolean,
        right: () => boolean,
    },
    state: {
        save: () => string,
        load: () => Array<Array<string>>,
    },
    merge: (href?: string) => void,
    watch: () => void,
}

interface Page {
    href: string,
    state: string,
    index: number,
}

// state = null -> only in case of cleanPage

function newState() { 
    const state: State = {
        now: {
            href: window.location.href,
            state: "_",
            index: 0,
        },
        trigger: 0,
        history: {
            headers: function(key: 0 | 1 | 2) {
                // 0 internal | 1 external
                if (key == 0) {
                    return Object.keys(sessionStorage).filter((k: string) => 
                        (k.includes("history::") && isNum(k.split("::")[1])) ||
                            (k.includes("history::f") && isNum(k.split("::f")[1]))
                    )
                }
                else if (key == 1) {
                    return Object.keys(sessionStorage).filter((k: string) => k.includes("history::") && isNum(k.split("::")[1]));
                } else { // k == 2
                    return Object.keys(sessionStorage).filter((k: string) => k.includes("history::f") && isNum(k.split("::f")[1]));
                }
            },
            records: function(key: 0 | 1 | 2) {
                const map = new Map();
                for (const record of state.history.headers(key)) {
                    map.set(record, sessionStorage.getItem(record));
                }

                return map;
            },
        },
        navigation: {
            left: function() {
                return state.now.state != "history::1";
                // navigation.canGoBack
            },
            right: function() {
                return state.now.index != history.length;
                // navigation.canGoForward
            },
        },
        state: {
            save: function() {
                const records = state.history.records(0);
                const vec = [];
                for (const entry of records.entries()) {
                    vec.push(entry);
                }
                const stringified = JSON.stringify(vec);
                localStorage.setItem("history", stringified);

                return stringified;
            },
            load: function() {
                const records = JSON.parse(isThere(localStorage.getItem("history"))) ?? new Error("localStorage has no `history` key");
                if (whatIs(records) == "Error") throw records;
                for (const record of records) {
                    sessionStorage.setItem(record[0], record[1]);
                }
                localStorage.removeItem("history");

                return records;
            }, 
        },
        merge: function(href?: string) {
            // happens right after trigger is changed
            // handles update logic
            if (this.trigger == 1) {
                // linkClick
                // is user triggered, everything else is browser triggered
                const state = "history::" + (this.now.index + 1);
                this.now.href = href!;
                this.now.state = state;
                this.now.index = this.now.index + 1;
                //
                const index = this.now.index;
                const lenIn = this.history.headers(1).length;
                if (lenIn > index) {
                    for (let i = index + 1; i < lenIn + 1; i++) {
                        console.log("a", i);
                        sessionStorage.removeItem("history::" + i);
                    }
                }
                // 
                sessionStorage.setItem(state, href!);
                history.pushState(state, "", href!);
                // localStorage.removeItem("history");
            } else if (this.trigger == 2) {
                // historyNavigation
                // do nothing since s.now has become live
                // update current page state.now
                this.now.href = window.location.href;
                // const index = history.state ? parseInt(history.state.split("::")[1]) : history.length == 1 ? 1 : Math.min(this.history.headers(1).length, history.length); 
                this.now.state = history.state;
                this.now.index = parseInt(history.state.split("::")[1]);
                // localStorage.removeItem("history");
            } else if (this.trigger == 3) {
                // cleanPage 
                // the following should be used before adding current page to state 
                // xxx and after loading state if restoredPage xxx
                const hlen = history.length;
                const slen = state.history.headers(0).length;
                if (hlen > slen && hlen != 1) { // for foreign pages!!
                    const lenDiff = hlen - slen;
                    const rootIndex = state.history.headers(2).length;
                    for (let i = 0; i < lenDiff - 1; i++) {
                        const newI = i + rootIndex + 1;
                        sessionStorage.setItem("history::f" + newI, "_");
                    }
                }
                // check history.length + h.state + headers(0 / 1 / 2).length + 
                //
                //
                const data = {
                    hlen: history.length,
                    slenAll: this.history.headers(0).length,
                    slenIn: this.history.headers(1).length,
                    slenEx: this.history.headers(2).length,
                };
                if (data.hlen == 1 && data.slenAll == 0) {
                    // state.now and history and sessionStorage
                    history.replaceState("history::1", window.location.href);
                    this.now.state = "history::1";
                    this.now.index = 1;
                    this.now.href = window.location.href;
                } else if (data.slenAll > data.hlen) {
                    throw new Error("slenAll " + data.slenAll + " longer than hlen " + data.hlen);
                } else if (data.hlen > 1 && data.slenAll > 1 && data.hlen > data.slenAll) {
                    history.replaceState("history::" + (data.slenIn + 1), window.location.href);
                    this.now.state = "history::" + (data.slenIn + 1);
                    this.now.href = window.location.href;
                    this.now.index = data.slenIn + 1;
                    // history?
                } /*else if (data.hlen > 1 && data.slenAll > 1 && data.hlen > data.slenAll) {
                    history.replaceState("history::" + (data.slenIn + 1), window.location.href);
                }*/ else {
                    throw new Error("unexpected!!");
                }
                //
                const index = this.now.index;
                const lenIn = this.history.headers(1).length;
                if (lenIn > index) {
                    for (let i = index + 1; i < lenIn + 1; i++) {
                        console.log("a", i);
                        sessionStorage.removeItem("history::" + i);
                    }
                }
                //
                sessionStorage.setItem(this.now.state, this.now.href);
                // localStorage.removeItem("history");

            } else if (this.trigger == 4) {
                // restoredPage
                this.state.load();
                this.now.href = window.location.href;
                this.now.state = history.state;
                this.now.index = parseInt(history.state.split("::")[1]);
                sessionStorage.setItem(this.now.state, this.now.href);
                localStorage.removeItem("history");

            } else if (this.trigger == 5){
                // closing page
                this.state.save();
            }/* else {
                // trigger = 0;
            }*/

            this.trigger = 0;
            // localStorage.removeItem("history");
        },
        watch: function() {
            linkClick();
            stackManeuver();
            newPage();
            closingPage();
        },
    };

    return state;
}

const s = newState();
s.watch();

function linkClick() {
    // document <a> click
    function listenr(e: Event) {
        const et = isThere(e.target);
        const ke = <KeyboardEvent> e;
        if (ke.ctrlKey || et.nodeName != "A" || 
            whatIs(returnMe(et, [0])) == "Error" ||
            // @ts-ignore
            !returnMe(et, [0]).includes("a.internal")) return;
        
        e.preventDefault();
        s.trigger = 1;
        s.merge(et.href);
    }

    function launch() {
        document.addEventListener("click", listenr);
    }

    launch();
}

function stackManeuver() {
    // window popstate
    // this is checked and happens at page load
    function listenr() {
        s.trigger = 2; // historyNavigation
        s.merge();
    }

    function launch() {
        window.addEventListener("popstate", listenr);
    }

    launch();
}

function newPage() {
    if (localStorage.getItem("history") && history.length > 1 && s.history.headers(0).length == 0) {
        // restored page -> localStorage load history
        s.trigger = 4; // restoredPage
        // fill in the missing foreign pages
        s.merge();
        
        return;
    }

    s.trigger = 3; // cleanPage
    s.merge();

    return;
}

function closingPage() {
    function listenr() {
        s.trigger = 5;
        s.merge();
    }
    
    function launch() {
        window.addEventListener("beforeunload", listenr);
    }

    launch();
}

// linkClick();
// stackManeuver();
// newPage();
// closingPage();


document.addEventListener("dblclick", () => {
    console.log(
        s.now.href, s.now.state, s.now.index,
        s.history.headers(0), 
        s.navigation.left(), s.navigation.right(),
        s.trigger,
    );
})

/// DOCS 
/// a web application is a js program that must absolutely have the following parts 
/// 1 data that directly defines the state of the application 
/// 2 logical structure, with many endpoints, each endpoint takes some of the data as input 
/// and changes the data in some way (add, remove or morph it)
/// 3 DOM items that are displayed and represent the live state of the application data
///
/// DOCS
/// Developing the vanilla app, as defined above, it doesnt take long to 
/// encounter a few issues; including
/// It is hard to keep track of all the logic used and keep it within a
/// well designed structure of code 
/// It is also cumbersome to create and edit a DOM element in vanilla js. A few are fine, but
/// the simplest of apps; one that does close to nothing, could easily require a dozen DOM elements
/// this cumbersomeness can also be observed on other parts of the app logic 
/// Some essentials are also not built into the standard library of the lang, an obvious 
/// example of this is navigation handling for an SPA
/// Consequently, frameworks exist for a reason... This is not a criticism of js. 
/// 
/// DOCS 
/// the objective of this package is to simplify the vanilla 
/// development experince with a small abstraction layer on top of js that shall be 
/// used to painlessly build a vanilla SPA; specifically through:
/// - painless (abstracted) DOM manipulation 
/// - a unified way of SPA navigation, keybindings support and theming 
/// - scaleable app logic and data management 
/// 
/// 2 main goals: 
/// - create painless abstractions layers over js std functionalities that gets used a lot 
/// like, document.createElement("elname")
/// - create structure for functionalities that don't exist fully (parts are there but no higher logic to bundle them into a feature), like an app loader or a router
/// 
/// NOTE some people call this reinventing the wheel, I call it software multipolarity.
/// 
/// #### Feature Table
/// | feature | package |
/// | 'make' function for easier element creation | core |
/// |	
/// 
/// #### Methodology
/// Before we get to the app itself, lets talk std
/// the vanilla js std has much logic that gets repeated ad infinitum in the process of app writing
/// 

// an Artefact is the result of a logic system being implemented on
// some of the app data at a well defined point in time; StatePoint
class Artefact<A> { }

// DOCS application of a logic system on some data 
//
//      logic_system<T>(data: StatePoint): Artefact<T> { }                                              
//                 _______|_______                                               
//                |       |       |                                 
//    StatePoint -|->  process   -|-> Artefact                              
//                |_______________|                                 
//                                                                 

// a StatePoint is the collection of input data sent to 
// a logic system at a certain point in time 
class StatePoint<D> { }

class Component { }

class Loader { }

class CoreUtils { }

class Plugins { }

///////////////////////////////////////////////////////////////////////////////////////////////////
import { DataStore } from "momo_core/src/data/data_store";

type LogicSystem = (...args: any[]) => any;
// an app struct 
class Automata {
	constructor() {
		this.data = new DataStore()
	}

	data: DataStore;
	containers: Map<string, Conatiners>;
}

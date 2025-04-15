# momo_app

### Discussion

#### The Vanilla App

##### What is it?
a web application is a js program that must absolutely have the following parts
1 data that directly defines the state of the application
2 logical structure, with many endpoints, each endpoint takes some of the data as input
and changes the data in some way (add, remove or morph it)
3 DOM items that are displayed and represent the live state of the application data

##### What's wrong with it?
The vanilla app, as abovely defined would quickly encounter a few issues; namely that
It is hard to keep track of all the logic used and keep it within a
well designed structure of code, i.e., vanilla is hard to scale
It is also cumbersome to create and edit a DOM element in vanilla js. A few are fine, but
the simplest of apps; one that does close to nothing, could easily require a dozen DOM elements
Some essentials are also not built into the standard library of the lang, an obvious
example of this is navigation handling for an SPA
Consequently, frameworks exist for a reason... This is not a criticism of js.

#### Goals
the objective of this package is to simplify the vanilla
development experince with a small abstraction layer on top of js that shall be
used to painlessly build a vanilla SPA; specifically through:
- painless (abstracted) DOM manipulation
- a unified way of SPA navigation, keybindings support and theming
- scaleable app logic and data management

> [!NOTE] some people call this reinventing the wheel, I call it software multipolarity.


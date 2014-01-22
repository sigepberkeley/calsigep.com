# Nav(igation) - Header & Footer

## Header Public

Files to edit to update (all files are relative to the `app/src` directory)

- `modules/services/nav/nav-config.js`
	- declare the navigation (header and footer) variables for each page here.
	- use the components in the `initComponents` function for re-use to keep things DRY
		- in this case, the defaults are declared in the `components.headerPublic` object and the associated `componets.headerPublicIndices` object
	- copy and extend the `components.publicNav` object, i.e.:
		```js
		//contact
		this.pages.contact =jrgArray.copy(this.components.publicNav);
		this.pages.contact.header.links[this.components.headerPublicIndices.contact].classes ={
			cont: 'selected'
		};
		```
- `modules/directives/nav/nav-header-public`
	- the public header is written in this directive
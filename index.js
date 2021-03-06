/**
 *
 */
let catalog = []
let library = []
let cart = []
let skipped = []

/**
 * @event initialize the page
 */
window.onload = () => {
	fetch("https://striveschool-api.herokuapp.com/books", {
		method: "GET",
	})
		.then((response) => response.json()) ///get the data in json format
		.then((body) => (catalog = body)) ///copy the body in the catalog
		.then(() => {
			loadLibrary(catalog) //print the whole catalog
			if (window.location.search !== "") {
				bigFunnyCard(window.location.search.substring(1)) //we got an asin! quick hide the other books and show the BIG FUNNY CARD
			}
			library = [...catalog] //copy the whole catalog into the library
		})
	document.querySelector("#search").addEventListener("keyup", search)
	document.querySelector("#cart").addEventListener("click", loadCart)
	document.querySelector("#library").addEventListener("click", reLoadLibrary)
	document.querySelector("#skipped").addEventListener("click", loadSkipped)
}
/**
 * @description fetches additional data from googleapis
 * @param {*} asin the asin to search for, since amazon started as a bookstore asin was developped to be totally compatible with ISBN
 * @returns it returns a promise of the volume info from googlebooks
 */
const searchData = (asin) =>
	fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${asin}`, {
		method: "GET",
	})
		.then((response) => response.json())
		.then((body) => body.items[0].volumeInfo)

/**
 * @description simply load the library and resets the ui it's meant to be invoked by other shelves that may or may not alter some top ui funcion
 */
const reLoadLibrary = () => {
	document.querySelector("#cart").removeEventListener("click", clearCart)
	document.querySelector("#cart").addEventListener("click", loadCart)
	document.querySelector("#cart").innerText = "Cart"
	loadLibrary(library)
}

/**
 * @description clears all elements from the cart array
 * @param {*} event the function caller
 */

const clearCart = (event) => {
	cart = []
	loadCart(event)
}

/**
 * @description shows the contents of the cart and toggles the function of it's caller to make it trigger the cart clearing
 * @param {*} event
 */
const loadCart = (event) => {
	event.target.innerText = "Clear Cart"
	event.target.removeEventListener("click", loadCart)
	event.target.addEventListener("click", clearCart)
	loadLibrary(cart)
}

/**
 *  shows the elements on the skipped list
 */
const loadSkipped = () => {
	document.querySelector("#cart").removeEventListener("click", clearCart)
	document.querySelector("#cart").addEventListener("click", loadCart)
	document.querySelector("#cart").innerText = "Cart"
	loadLibrary(skipped)
}

/**
 * @description shows the contents of a catalog of books in a grid of cards
 * @param {*} shelf an array of books
 */

const loadLibrary = (shelf) => {
	const template = document.querySelector("#cardTemplate") ///get the template
	//#region remove any card except the template
	document
		.querySelectorAll("#bookShelf>:not(#cardTemplate)")
		.forEach((card) => {
			card.remove()
		})
	//#endregion
	shelf.forEach((book) => {
		let card = template.cloneNode(true) //create a new card
		card.id = `isbn${book.asin}` //this is garbage but onestly this is not meant for production it's just an exercise the correct way wour be to store the asin/isbn in a custom parameter
		card.querySelector(".card-title").innerHTML = `<b>${book.title}</b>` //just because i was asked to put it here i've used some template literal for this, but there are better examples in this file
		card.querySelector(
			".book-category"
		).innerHTML = `category :<b>${book.category}</b>`
		card.querySelector(".book-price").innerHTML = `price:<b>${book.price}</b>`
		card.querySelector(".card-img-top").src = book.img
		card.querySelector(".btn-cart").addEventListener("click", toggleCartStatus) //when button is clicked add it to the cart or remove it if it's already there
		card.querySelector(".btn-skip").addEventListener("click", toggleSkip) //whe button is clicked remove the whole card
		//card.querySelector(".card-title").addEventListener("click", bigFunnyCard) //obsolete relic of the old implementation here for historic reasons
		card.querySelector(".book-title").href = `?${card.id}` //link the page to herself but with a searchvalue
		card.classList.remove("d-none") //now we can make the card visible
		template.parentElement.appendChild(card) //and append it to the row :) we do it by referencing the parent of template since all cards should be sibling of template
	})
}

/**
 * @description adds or removes a book from the cart
 * @param {*} event a listener inside a card
 */
const toggleCartStatus = (event) => {
	const card = event.target.closest(".card") //...get the closest ancestof with a class of card
	card.classList.toggle("in-cart") //toggles the in-cart class that manages the stile of the elements that are in the cart
	if (card.matches(".in-cart")) {
		cart.push(catalog.find((book) => book.asin === card.id.substring(4))) //1)scans the catalog to FIND an book whose ASIN equals the ID of the card minus the isbn prefix and then PUSHES it in CART
		card.querySelector(".btn-cart").innerText = "remove from cart" //2)toggles the text on the button to reflect it's current action
	} else {
		cart.splice(
			cart.findIndex((book) => book.asin === card.id.substring(4)), //same as 1) but removes from cart
			1
		)
		card.querySelector(".btn-cart").innerText = "add to cart" //same as 2
	}
}

/**
 * removes a book from the library and adds it to the skipped books
 * @param {*} event  a listener inside a card
 */

const toggleSkip = (event) => {
	const card = event.target.closest(".card") ///@description get the closest ancestor of event.target with a class of card
	card.remove() //remove the whole calling card from the DOM lmao obsolet, youll'see soon why
	skipped.push(catalog.find((book) => book.asin === card.id.substring(4))) //1)scans the catalog to FIND an book whose ASIN equals the ID of the card minus the isbn prefix and then PUSHES it in SKIPPED
	library.splice(
		library.findIndex((book) => book.asin === card.id.substring(4)), //same as1) but it removes the book from the library
		1
	)
	loadLibrary(library) //and now we redraw the whole funny library makink line 138 totally obsolete/redundant
}

/**
 * this filters the books of the library according to the contents of the searchbar
 * @param {*} event an onkeyup listener added to the search input
 */
const search = (event) => {
	let query = document.querySelector("#search").value
	if (query.length >= 3) {
		loadLibrary(
			library.filter(
				(book) => book.title.toLowerCase().includes(query.toLowerCase()) //searches should ALWAYS be case insensitive by default
			)
		)
	} else {
		if (
			document.querySelectorAll("#bookShelf>:not(#cardTemplate)").length < //if we have less then 3 character in the searchbar and are not showing the whole catalog we should redraw
			library.length
		) {
			loadLibrary(library)
		}
	}
}

/**
 * THE BIG FUNNY CARD simply shows a book in a single giant card, it adds the description retrieved from gogle APIs
 * @param {*} id -this is funny, an asin is a totally legal isbn value but not a legal HtmlElement.id value so i'm passing card id's via urlquery instead of asin's
 */

const bigFunnyCard = (id) => {
	const card = document.querySelector(`#${id}`)
	//	if (card.matches(".col-md-4")) {
	Array.from(document.querySelectorAll("#bookShelf>:not(#cardTemplate)"))
		.filter((book) => book.id !== card.id)
		.forEach((card) => {
			card.remove()
		})

	card.classList.toggle("col-md-4") //by removing the col-md-4 class we enable the single card to take all the space available
	searchData(card.id.substring(4)).then((response) => {
		//as soon as i receive the infos from google i create and append some stuff the the card
		const description = document.createElement("p")
		description.innerText = response.description
		card.querySelector(".book-description").appendChild(description)
	})
	/*} else {
		card.classList.toggle("col-md-4")
		loadLibrary(library)
	}*/
}

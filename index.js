let catalog = []
let library = []
let cart = []
let skipped = []

/**
 * initialize the page
 */
window.onload = () => {
	fetch("https://striveschool-api.herokuapp.com/books", {
		method: "GET",
	})
		.then((response) => response.json())
		.then((body) => (catalog = body))
		.then(() => {
			loadLibrary(catalog)
			if (window.location.search !== "") {
				bigFunnyCard(window.location.search.substring(1))
			}
			library = [...catalog]
		})

	document.querySelector("#cart").addEventListener("click", loadCart)
	document.querySelector("#library").addEventListener("click", reLoadLibrary)
	document.querySelector("#skipped").addEventListener("click", loadSkipped)
}

const searchData = (asin) =>
	fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${asin}`, {
		method: "GET",
	})
		.then((response) => response.json())
		.then((body) => body.items[0].volumeInfo)

const reLoadLibrary = () => {
	document.querySelector("#cart").removeEventListener("click", clearCart)
	document.querySelector("#cart").addEventListener("click", loadCart)
	document.querySelector("#cart").innerText = "Cart"
	loadLibrary(library)
}

const clearCart = (event) => {
	cart = []
	loadCart(event)
}

const loadCart = (event) => {
	event.target.innerText = "Clear Cart"
	event.target.removeEventListener("click", loadCart)
	event.target.addEventListener("click", clearCart)
	loadLibrary(cart)
}
const loadSkipped = () => {
	document.querySelector("#cart").removeEventListener("click", clearCart)
	document.querySelector("#cart").addEventListener("click", loadCart)
	document.querySelector("#cart").innerText = "Cart"
	loadLibrary(skipped)
}

const loadLibrary = (shelf) => {
	const template = document.querySelector("#cardTemplate")
	document.querySelector("#search").addEventListener("keyup", search)
	document
		.querySelectorAll("#bookShelf>:not(#cardTemplate)")
		.forEach((card) => {
			card.remove()
		})
	//console.log(shelf)
	shelf.forEach((book) => {
		let card = template.cloneNode(true)
		card.id = `isbn${book.asin}`
		card.querySelector(".card-title").innerHTML = `<b>${book.title}</b>`
		card.querySelector(
			".book-category"
		).innerHTML = `category :<b>${book.category}</b>`
		card.querySelector(".book-price").innerHTML = `price:<b>${book.price}</b>`
		card.querySelector(".card-img-top").src = book.img
		card.querySelector(".btn-cart").addEventListener("click", toggleCartStatus)
		card.querySelector(".btn-skip").addEventListener("click", toggleSkip)
		//card.querySelector(".card-title").addEventListener("click", bigFunnyCard)
		card.querySelector(".book-title").href = `?${card.id}`
		card.classList.remove("d-none")
		template.parentElement.appendChild(card)
	})
}

const toggleCartStatus = (event) => {
	const card = event.target.closest(".card")
	card.classList.toggle("in-cart")
	if (card.matches(".in-cart")) {
		cart.push(catalog.find((book) => book.asin === card.id.substring(4)))
		card.querySelector(".btn-cart").innerText = "remove from cart"
	} else {
		cart.splice(
			cart.findIndex((book) => book.asin === card.id.substring(4)),
			1
		)
		card.querySelector(".btn-cart").innerText = "add to cart"
	}
}

const toggleSkip = (event) => {
	const card = event.target.closest(".card")
	card.remove()
	skipped.push(catalog.find((book) => book.asin === card.id.substring(4)))
	library.splice(
		library.findIndex((book) => book.asin === card.id.substring(4)),
		1
	)
	loadLibrary(library)
}

const search = (event) => {
	let query = document.querySelector("#search").value
	if (query.length >= 3) {
		loadLibrary(
			library.filter((book) =>
				book.title.toLowerCase().includes(query.toLowerCase())
			)
		)
	} else {
		if (
			document.querySelectorAll("#bookShelf>:not(#cardTemplate)").length <
			library.length
		) {
			loadLibrary(library)
		}
	}
}

const bigFunnyCard = (id) => {
	const card = document.querySelector(`#${id}`)
	if (card.matches(".col-md-4")) {
		Array.from(document.querySelectorAll("#bookShelf>:not(#cardTemplate)"))
			.filter((book) => book.id !== card.id)
			.forEach((card) => {
				card.remove()
			})

		card.classList.toggle("col-md-4")
		searchData(card.id.substring(4)).then((response) => {
			const description = document.createElement("p")
			description.innerText = response.description
			card.querySelector(".book-description").appendChild(description)
		})
	} else {
		card.classList.toggle("col-md-4")
		loadLibrary(library)
	}
}

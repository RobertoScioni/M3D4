let reply = []
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
		.then((body) => (reply = body))
		.then(() => loadLibrary(reply))
}

const loadLibrary = (library) => {
	const template = document.querySelector("#cardTemplate")
	document.querySelector("#search").addEventListener("keyup", search)
	document
		.querySelectorAll("#bookShelf>:not(#cardTemplate)")
		.forEach((card) => {
			card.remove()
		})
	library.forEach((book) => {
		let card = template.cloneNode(true)
		card.id = book.asin
		card.querySelector(".card-title").innerHTML = `<b>${book.title}</b>`
		card.querySelector(
			".card-text"
		).innerHTML = `category :<b>${book.category}</b><br/>price:<b>${book.price}</b> `
		card.querySelector(".card-img-top").src = book.img
		card.querySelector(".btn-cart").addEventListener("click", toggleCartStatus)
		card.querySelector(".btn-skip").addEventListener("click", toggleSkip)
		card.classList.remove("d-none")
		template.parentElement.appendChild(card)
	})
}

const toggleCartStatus = (event) => {
	const card = event.target.closest(".card")
	card.classList.toggle("in-cart")
	if (card.matches(".in-cart")) {
		cart.push(reply.filter((book) => book.asin === card.id))
		card.querySelector(".btn-cart").innerText = "remove from cart"
	} else {
		cart.splice(
			cart.findIndex((book) => book.asin === card.id),
			1
		)
		card.querySelector(".btn-cart").innerText = "add to cart"
	}
}

const toggleSkip = (event) => {
	const card = event.target.closest(".card")
	card.remove()
}

const search = (event) => {
	let query = document.querySelector("#search").value
	if (query.length >= 3) {
		loadLibrary(
			reply.filter((book) =>
				book.title.toLowerCase().includes(query.toLowerCase())
			)
		)
	} else {
		if (
			document.querySelectorAll("#bookShelf>:not(#cardTemplate)").length <
			reply.length
		) {
			loadLibrary(reply)
		}
	}
}

import Trello from "./components/Trello"
const container = document.querySelector(".container")

document.addEventListener("DOMContentLoaded", () => {
    const trello = new Trello(container)
    trello.renderItemsToContainer()
})

// const API_URL = "https://music-library.app-root.dev:3000"
const API_URL = "http://localhost:3000"
const MAX_INTERVAL = 1000 * 60 * 10

let name = ""
chrome.storage.sync.get(["discordName"], (items) => {
    name = items.discordName
})

const iconUrl = chrome.runtime.getURL("images/icon.svg")
const config = chrome.runtime.getURL("images/icon.svg")

const buttonHtml = (className) => `
    <div data-mlfy="mlfy" class="mlfy-button ${className}"><img class="mlfy-button_icon" src="${iconUrl}" alt="再生"/></div>
`

const extractMovieId = (url) => {
    const urlQuery = url.substr(url.indexOf("?"))
    return new URLSearchParams(urlQuery).get("v")
}

const options = {
    method: "POST",
    mode: "cors",
    headers: {
        "Content-Type": "application/json",
    },
}

const postMovieId = async (movieId, name) => {
    console.log(
        JSON.stringify({
            query: movieId,
            name,
        })
    )
    await fetch(`${API_URL}/add`, {
        ...options,
        body: JSON.stringify({
            query: movieId,
            name,
        }),
    }).then((res) => {
        console.log(res.status)
    })
}

// for top page
const thumbnails = document.querySelectorAll("ytd-thumbnail")

for (const thumbnail of thumbnails) {
    console.log("OK")
    thumbnail.insertAdjacentHTML("beforeend", buttonHtml("mlfy-top-button"))

    const link = thumbnail.querySelector("#thumbnail")
    const movieUrl = link.getAttribute("href")

    if (!movieUrl) continue

    const movieId = extractMovieId(movieUrl)
    thumbnail.addEventListener(
        "click",
        async (e) => {
            if (e.target.currentTarget?.getAttribute("data-mlfy") !== "mlfy")
                await postMovieId(movieId, name)
        },
        false
    )
}

// for children page
const implementButton = (target) => {
    console.log(target)
    target.insertAdjacentHTML("afterbegin", buttonHtml("mlfy-indiv-button"))
    const movieId = extractMovieId(window.location.search)
    target.addEventListener(
        "click",
        async (e) => {
            console.log(e.target)
            if (e.target.currentTarget?.getAttribute("data-mlfy") !== "mlfy")
                await postMovieId(movieId, name)
        },
        false
    )
}

const setObserver = () => {
    let timerId
    let interval = 50
    console.log("setObserver")
    const checkElement = () => {
        console.log("cleckElement")
        interval += interval > MAX_INTERVAL ? 200 : 0
        const target = document.querySelector("#top-level-buttons-computed")
        if (target) {
            clearInterval(timerId)
            implementButton(target)
        }
    }
    timerId = setInterval(checkElement, interval)
}

window.addEventListener("load", setObserver, false)

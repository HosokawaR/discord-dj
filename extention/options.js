const saveOptions = () => {
    const discordName = document.getElementById("discord-name").value
    chrome.storage.sync.set(
        {
            discordName,
        },
        () => {
            const status = document.getElementById("status")
            status.textContent = "保存しました。"
            setTimeout(function () {
                status.textContent = ""
            }, 750)
        }
    )
}

const restoreOptions = () => {
    chrome.storage.sync.get(
        {
            discordName: "",
        },
        (items) => {
            document.getElementById("discord-name").value = items.discordName
        }
    )
}

document.addEventListener("DOMContentLoaded", restoreOptions)
document.getElementById("save").addEventListener("click", saveOptions)

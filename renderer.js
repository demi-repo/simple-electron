const {ipcRenderer} = require("electron")
const searchText = document.getElementById("searchText");
const searchButton = document.getElementById("searchButton");
const updateButton = document.getElementById("updateButton");
const searchResults = document.getElementById("searchResults");

searchText.addEventListener("change", (event) => {
    ipcRenderer.send("search", event.target.value);
    searchResults.innerHTML = "Loading...";
    searchButton.disabled = true;
});

searchButton.addEventListener("click", () => {
    ipcRenderer.send("search", searchText.value);
    searchResults.innerHTML = "Loading...";
    searchButton.disabled = true;
});

updateButton.addEventListener("click", () => {
    ipcRenderer.send("update");
    searchResults.innerHTML = "Updating...";
});

ipcRenderer.on("search-result", (event, results) => {
    try {
        searchButton.disabled = false;
        while(searchResults.firstChild) {
            searchResults.removeChild(searchResults.firstChild);
        }
        results.map((arg, index) => {
            let child = document.createElement("div");
            child.id = "search" + index;
            child.className = "search-result";
            let urlDiv = document.createElement("div");
            urlDiv.innerHTML = `<span style="color: #707070;">URL:&nbsp;</span>${arg.URL}`;
            urlDiv.className = "url";
            let CVEsDiv = document.createElement("div");
            CVEsDiv.innerHTML = `<span style="color: #707070;">CVEs:&nbsp;</span>`
            CVEsDiv.className = "cves";
            arg.CVEs.split(",").map(cve => {
                let cveDiv = document.createElement("span");
                cveDiv.innerHTML = cve;
                cveDiv.className = "cve";
                CVEsDiv.appendChild(cveDiv);
            })
            let providerDiv = document.createElement("div");
            providerDiv.innerHTML = `<span style="color: #707070;">Provider:&nbsp;</span>${arg.provider}`;
            providerDiv.className = "provider";
            let dtDiv = document.createElement("div");
            dtDiv.innerHTML = `<span style="color: #707070;">Date:&nbsp;</span>${arg.dt}`;
            dtDiv.className = "dt";
            let summaryDiv = document.createElement("div");
            summaryDiv.innerHTML = `<span style="color: #707070;">Summary:&nbsp;</span>${arg.summary}`;
            summaryDiv.className = "summary";
            child.appendChild(urlDiv);
            child.appendChild(CVEsDiv);
            child.appendChild(providerDiv);
            child.appendChild(dtDiv);
            child.appendChild(summaryDiv);
            urlDiv.addEventListener("click", () => {
                ipcRenderer.send("open-url", arg.URL);
            });
            searchResults.appendChild(child);
        });
        if(results.length === 0) {
            searchResults.innerHTML = "No results found.";
        }
    } catch (error) {
        console.error(error);
        searchResults.innerHTML="Something went wrong. Please try again later."
    };
});
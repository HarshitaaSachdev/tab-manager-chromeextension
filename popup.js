window.addEventListener("DOMContentLoaded", function () {
    let allTabs = [];
    const tabsContainer = document.querySelector("#ext_tabs");
    const favoritesContainer = document.querySelector("#favorites");
    const searchInput = document.querySelector("#search");

    // Load tabs and favorites from storage
    chrome.runtime.sendMessage({ type: "getTabs" }, function (response) {
        allTabs = response;
        renderTabs(allTabs);
    });

    chrome.storage.local.get(["favorites"], function (result) {
        const favorites = result.favorites || [];
        favorites.forEach((tab) => {
            const tabElement = createFavoriteTabElement(tab);
            favoritesContainer.appendChild(tabElement);
        });
    });
    

    // Function to create tab elements
    function createTabElement(tab, index) {
        const tabElement = document.createElement("li");
        const tabInfoContainer = document.createElement("div");
        const tabInfo = document.createElement("p");
        tabInfo.innerText = index + 1 + ") " + tab.title;
        tabInfoContainer.appendChild(tabInfo);

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

        const closeButton = document.createElement("button");
        closeButton.innerText = "Close Tab";
        closeButton.addEventListener("click", function () {
            chrome.tabs.remove(tab.id);
            tabElement.remove();
        });

        const favoriteButton = document.createElement("button");
        favoriteButton.innerText = "Add to Favorites";
        favoriteButton.addEventListener("click", function () {
            addToFavorites(tab);
        });

        tabInfo.addEventListener("click", function () {
            chrome.tabs.update(tab.id, { active: true });
        });

        buttonContainer.appendChild(closeButton);
        buttonContainer.appendChild(favoriteButton);

        tabElement.appendChild(tabInfoContainer);
        tabElement.appendChild(buttonContainer);

        return tabElement;
    }

    // Function to create favorite tab elements
    function createFavoriteTabElement(tab) {
        const tabElement = document.createElement("li");
        const tabInfoContainer = document.createElement("div");
        const tabInfo = document.createElement("p");
        tabInfo.innerText = tab.title;
        tabInfoContainer.appendChild(tabInfo);

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");

        const openButton = document.createElement("button");
        openButton.innerText = "Open Tab";
        openButton.addEventListener("click", function () {
            chrome.tabs.create({ url: tab.url });
        });

        const deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", function () {
            removeFromFavorites(tab);
            tabElement.remove();
        });

        buttonContainer.appendChild(openButton);
        buttonContainer.appendChild(deleteButton);

        tabElement.appendChild(tabInfoContainer);
        tabElement.appendChild(buttonContainer);

        return tabElement;
    }

    // Function to add tab to favorites
    function addToFavorites(tab) {
        chrome.storage.local.get(["favorites"], function (result) {
            const favorites = result.favorites || [];
            favorites.push({ title: tab.title, url: tab.url });
            chrome.storage.local.set({ favorites: favorites }, function () {
                const favoriteTabElement = createFavoriteTabElement(tab);
                favoritesContainer.appendChild(favoriteTabElement);
            });
        });
    }

    // Function to remove tab from favorites
    function removeFromFavorites(tab) {
        chrome.storage.local.get(["favorites"], function (result) {
            const favorites = result.favorites || [];
            const updatedFavorites = favorites.filter(fav => fav.url !== tab.url);
            chrome.storage.local.set({ favorites: updatedFavorites });
        });
    }

    // Function to render tabs
    function renderTabs(tabs) {
        tabsContainer.innerHTML = "";
        tabs.forEach((tab, index) => {
            const tabElement = createTabElement(tab, index);
            if (tab.active) {
                tabElement.classList.add("active");
            }
            tabsContainer.appendChild(tabElement);
        });
    }

    // Filter tabs based on search input
    searchInput.addEventListener("input", function () {
        const query = searchInput.value.toLowerCase();
        const filteredTabs = allTabs.filter(tab => tab.title.toLowerCase().includes(query));
        renderTabs(filteredTabs);
    });

    // Toggle dark mode functionality
    const toggleSwitch = document.querySelector("#theme-toggle");

    toggleSwitch.addEventListener("change", function () {
        const isChecked = toggleSwitch.checked;
        if (isChecked) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    });
});

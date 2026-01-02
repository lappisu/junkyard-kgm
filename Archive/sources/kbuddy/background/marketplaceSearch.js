const SEARCH_QUERIES = new Map();

createPage(
	"/marketplace/search*",
	// Liked Models page is smallest, but timing is not as consistent
	// New Models page is second smallest (+.3KB), but more consistent
	() => "/marketplace/model/?page=1&count=1",
	(details) => {
		// If user is not logged in, redirect back to main Marketplace page
		if (getClientID(details.url) === 0) return "/marketplace/";
		const searchURL = new URL(details.url);
		if (searchURL.pathname !== "/marketplace/search/") return "cancel";
		if (!searchURL.searchParams.has("q")) return false;
		if (searchURL.searchParams.get("q").length === 0) return "cancel";
		const searchPage = parseInt(searchURL.searchParams.get("page"), 10);
		const searchCount = parseInt(searchURL.searchParams.get("count"), 10);
		const searchCategory = (searchURL.searchParams.get("category") || "").toLowerCase();
		if (![ "model", "avatar" ].includes(searchCategory)) {
			searchURL.searchParams.set("category", "model");
		}
		if (isNaN(searchPage) || searchPage < 1) {
			searchURL.searchParams.set("page", "1");
		}
		if (isNaN(searchCount) || searchCount < 1) {
			searchURL.searchParams.set("count", "12");
		}
		searchURL.pathname = "/model/market/";
		const searchDetails = {
			query: decodeURIComponent(searchURL.searchParams.get("q")),
			category: searchCategory,
			response: fetch(searchURL.href)
		};
		SEARCH_QUERIES.set(details.requestId, searchDetails);
		return false;
	},
	async (body, details) => {
		const doc = domParser.parseFromString(body, "text/html");
		const pageLocale = /"locale": "(\w+)"/.exec(body)[1];
		// Retrieve elements
		const shopList = doc.querySelector("ul.shop-list");
		const paginator = doc.querySelector(".paginator");
		const breadcrumb = doc.querySelector("ul.breadcrumb > li:last-child > a");
		// Rename page
		breadcrumb.href = "/marketplace/search/";
		breadcrumb.firstElementChild.innerText = "Search";
		doc.title = "Marketplace Search - KoGaMa - Play, Create And Share Multiplayer Games";
		// Clear list and paging
		while (shopList.hasChildNodes()) shopList.removeChild(shopList.firstChild);
		while (paginator.hasChildNodes()) paginator.removeChild(paginator.firstChild);
		// Create search form
		const searchForm = createElement("form", {
			style: "width:480px;margin:0 auto 15px auto;"
		}, [
			createElement("select", { name: "category" }, [
				createElement("option", { value: "model" }, "Model"),
				createElement("option", { value: "avatar" }, "Avatar")
			]),
			createElement("input", {
				name: "q",
				input: "text",
				autocomplete: "off",
				placeholder: "Search for models and avatars",
				"max-length": 25,
				style: "width:260px;margin-left:5px;margin-right:5px;"
			}),
			createElement("input", {
				type: "submit",
				value: "Search"
			})
		]);
		doc.querySelector("section.content-shop").prepend(searchForm);
		// Insert search results
		if (SEARCH_QUERIES.has(details.requestId)) {
			const { response, category, query } = SEARCH_QUERIES.get(details.requestId);
			const responseData = await response.then(res => res.json());
			if (category === "avatar") {
				shopList.classList.replace("shop-list-model", "shop-list-avatar");
			}
			if (responseData.data.length === 0) {
				shopList.appendChild(createElement("div", { style: "text-align:center;" }, "No results"));
			} else {
				shopList.append(...responseData.data.map(createShopItem));
				if (responseData.paging.paging_links.length > 1) {
					if (responseData.paging.prev_url.length !== 0) {
						paginator.appendChild(
							createElement("li.prev", [
								createElement("a", {
									href: responseData.paging.prev_url.replace("/model/market/", "/marketplace/search/"),
									title: "prev"
								}, "< Previous")
							])
						);
					}
					paginator.append(...responseData.paging.paging_links.map(createPagingLink));
					if (responseData.paging.next_url.length !== 0) {
						paginator.appendChild(
							createElement("li.next", [
								createElement("a", {
									href: responseData.paging.next_url.replace("/model/market/", "/marketplace/search/"),
									title: "next"
								}, "Next >")
							])
						);
					}
				}
				searchForm.querySelector('input[name="q"]').setAttribute("value", query);
				searchForm.querySelector(`option[value="${category}"]`).setAttribute("selected", "selected");
			}
			SEARCH_QUERIES.delete(details.requestId);
		} else {
			shopList.classList.remove("shop-list-model");
		}
		// Return new page
		return "<!DOCTYPE html>" + doc.documentElement.outerHTML;
	}
);

const createShopItem = (item) => {
	return createElement("li.shop-item", [
		createElement("a", {
			href: `/marketplace/${item.category}/${item.product_id}/`,
			title: item.name
		}, [
			createElement("div.shop-image", {
				style: `background-image: url(${item.images.large})`
			}),
			createElement("div.shop-name", item.name),
			createElement("div.shop-price", [
				createElement("i.sprite.sprite-icon_gold_dark"),
				createElement("span.caption", item.price_gold.toString())
			])
		])
	]);
};

const createPagingLink = (paging) => {
	return createElement("li" + (paging.is_current ? ".current" : ''), [
		createElement("a", {
			href: paging.url.replace("/model/market/", "/marketplace/search/"),
			title: paging.title
		}, paging.title)
	]);
};
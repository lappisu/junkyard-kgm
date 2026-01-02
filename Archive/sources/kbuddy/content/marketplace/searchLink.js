if (clientID !== 0 && location.pathname === "/marketplace/") {
	document.querySelector("ul.submenu").appendChild(
		createElement("li.search", [
			createElement("a", { href: "/marketplace/search/" }, [
				createElement("i.icon-search"),
				" Search"
			])
		])
	);
}
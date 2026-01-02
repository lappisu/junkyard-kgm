console.log("[KoGaMaBuddy] Status loaded");

//	STATE: [ TOP, LEFT, RIGHT ]
const STATUS = {
	ONLINE  : [ "#e0ff13", "#61bd07", "#95db00" ],
	OFFLINE : [ "#d2d2d2", "#aaaaaa", "#bdbdbd" ],
	DND     : [ "#da8a87", "#7c3737", "#bf4f51" ]
};
const StatusLocaleStrings = [
	"General:Status:Online",
	"General:Status:DoNotDisturb",
	"General:Status:Offline",
	"General:Status:DoNotDisturbDescription",
	"General:Status:OfflineDescription"
];

const MN = document.getElementById("meta-nav");
const RPAI = document.getElementById("react-profile-avatar-image");

//	Start!
if (clientID !== 0) Promise.all([
	getStoredData(`${server}:${clientID}:status`, "ONLINE"),
	getLocaleStrings(pageData.locale, StatusLocaleStrings),
	waitForMutation(MN, { childList: true, subtree: true }),
	isClientProfile && !!RPAI ? waitForMutation(RPAI, { childList: true }) : Promise.resolve()
]).then(([storedStatus, statusStrings]) => {
	const statusContainer = document.createElement("LI");
	const statusIndicator = createIndicator(24, 24, storedStatus);
	const statusMenu = createMenu(statusStrings);

	//	Open / Close Status Menu
	statusIndicator.addEventListener("click", () => statusMenu.classList.toggle("open"));

	//	Status Selection
	statusMenu.addEventListener("click", async event => {
		//	Retrieve state
		const state = event.target.closest("li")._state;
		//	Save state
		await setStoredData(`${server}:${clientID}:status`, state);
		//	Close menu
		statusMenu.classList.remove("open");
		//	Display state
		editIndicator(statusIndicator, state);
		//	Edit profile status indicator
		if (isClientProfile) {
			editIndicator(RPAI.querySelector(".Hkdag"), state);
		}
	});

	//	Add status indicator to navbar
	statusContainer.classList.add("kb-status");
	statusContainer.append(statusIndicator, statusMenu);
	MN.insertBefore(statusContainer, MN.lastElementChild);

	//	Edit profile status indicator
	if (isClientProfile) {
		editIndicator(RPAI.querySelector(".Hkdag"), storedStatus);
	}
});

//	Helper Functions
function createIndicator(width=32, height=32, state="ONLINE") {
	const [ TOP, LEFT, RIGHT ] = STATUS[state];
	const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	const polyTop   = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
	const polyLeft  = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
	const polyRight = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

	container.classList.add("Hkdag");
	container.setAttribute("viewBox", "0 0 32 32");
	container.setAttribute("height", `${height}px`);
	container.setAttribute("width", `${width}px`);

	polyTop.setAttribute("points", "16 0, 30.5 8, 16 16, 1.5 8");
	polyTop.setAttribute("fill", TOP);

	polyLeft.setAttribute("points", "1.5 8, 16 16, 16 32, 1.5 24");
	polyLeft.setAttribute("fill", LEFT);

	polyRight.setAttribute("points", "30.5 8, 16 16, 16 32, 30.5 24");
	polyRight.setAttribute("fill", RIGHT);

	container.append(polyTop, polyLeft, polyRight);

	return container;
}

function editIndicator(vector, state) {
	const [ TOP, LEFT, RIGHT ] = STATUS[state];
	vector.childNodes[0].setAttribute("fill", TOP);
	vector.childNodes[1].setAttribute("fill", LEFT);
	vector.childNodes[2].setAttribute("fill", RIGHT);
}

function createMenu(strings) {
	const [ onlineLocale, dndLocale, offlineLocale, dndDescriptionLocale, offlineDescriptionLocale ] = strings;
	const container = document.createElement("UL");
	const onOption = document.createElement("LI");
	const dndOption = document.createElement("LI");
	const offOption = document.createElement("LI");
	const dndDescription = document.createElement("DIV");
	const offDescription = document.createElement("DIV");

	container.classList.add("kb-status-menu");
	onOption._state = "ONLINE";
	dndOption._state = "DND";
	offOption._state = "OFFLINE";
	dndDescription.appendChild(document.createTextNode(dndDescriptionLocale));
	offDescription.appendChild(document.createTextNode(offlineDescriptionLocale));
	onOption.append(createIndicator(16, 16, "ONLINE"), onlineLocale);
	dndOption.append(createIndicator(16, 16, "DND"), dndLocale, dndDescription);
	offOption.append(createIndicator(16, 16, "OFFLINE"), offlineLocale, offDescription);
	container.append(onOption, dndOption, offOption);

	return container;
}
console.log("[KoGaMaBuddy] AccountAge loaded");

const capitalize = str => str[0].toUpperCase() + str.slice(1);

if (/^\/profile\/\d+\/$/.test(location.pathname)) {
	// Timing Objects and Functions - Scoped to load only when necessary
	const TIME_UNITS = {
		years  : 31557600000,
		months : 2629800000,
		weeks  : 604800000,
		days   : 86400000,
		hours  : 3600000,
		minutes: 60000,
		seconds: 1000
	};
	const dateDifference = (date1, date2) => {
		let diff = Math.abs(date1 - date2);
		const res = {};
		for (const unit in TIME_UNITS) {
			res[unit] = Math.floor(diff / TIME_UNITS[unit]);
			diff -= res[unit] * TIME_UNITS[unit];
		}
		return res;
	};
	const timeStringsLocale = async (locale, timeObject, limit=2) => {
		let count = 0;
		const res = [];
		for (const unit in timeObject) {
			if (timeObject[unit] === 0) continue;
			if (++count > limit) break;
			const localeKey = timeObject[unit] === 1
				? `Time:Singular:${capitalize(unit.slice(0, -1))}`
				: `Time:Plural:${capitalize(unit)}`;
			const localeUnit = await getLocaleString(locale, localeKey);
			res.push(localeUnit.replace("{{time}}", timeObject[unit]));
		}
		return res;
	};
	// AccountAge and LastSeen Feature
	(async() => {
		const joinDateLabel = document.querySelector(".profile-created-date");
		
		const ageDifference = Math.abs(Date.now() - new Date(pageData.object.created).getTime());
		if (ageDifference < 60000) {
			const newAccountLocale = await getLocaleString(pageData.locale, "Profile:AccountAge:NewAccount");
			joinDateLabel.setAttribute("title", newAccountLocale);
		} else {
			const accountAge = dateDifference(ageDifference, 0);
			const [ unit_1, unit_2 ] = await timeStringsLocale(pageData.locale, accountAge, 2);
			const joinDateLocale = await getLocaleString(pageData.locale, "Profile:AccountAge:Created");
			joinDateLabel.setAttribute("title", joinDateLocale.replace("{{time_1}}", unit_1).replace("{{time_2}}", unit_2));
		}
		
		if (pageData.is_friend) {
			const profileID = pageData.object.id;
			const {data} = await fetchJSON(`/user/${clientID}/friend/chat/${profileID}/`);
			
			const pingDifference = Math.abs(Date.now() - new Date(data.last_ping).getTime());
			if (pingDifference < 60000) {
				const onlineLocale = await getLocaleString(pageData.locale, "Profile:AccountAge:CurrentlyOnline");
				joinDateLabel.innerText += " | " + onlineLocale;
			} else {
				const lastPing = dateDifference(pingDifference, 0);
				const [ unit_1, unit_2 ] = await timeStringsLocale(pageData.locale, lastPing, 2);
				const lastSeenLocale = await getLocaleString(pageData.locale, "Profile:AccountAge:LastSeen");
				joinDateLabel.innerText += " | " + lastSeenLocale.replace("{{time_1}}", unit_1).replace("{{time_2}}", unit_2);
			}
		}
	})()
}
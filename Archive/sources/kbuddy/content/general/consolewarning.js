console.log("[KoGaMaBuddy] ConsoleWarning loaded");
const ConsoleStyle = Object.freeze({
	HEADING: "background-color:#d25858;font-size:70px;font-weight:bold;color:white;",
	NORMAL : "font-size:20px;",
	URGENT : "font-size:25px;font-weight:bold;color:red;"
});

let isConsoleOpen = false;

async function detectConsole() {
	if ((window.outerHeight - window.innerHeight) > 100 || (window.outerWidth - window.innerWidth) > 100) {
		if (isConsoleOpen) return;
		isConsoleOpen = true;
		const [
			CW_Heading,
			CW_WarnScam,
			CW_WarnPaste,
			CW_AdviceClose,
			CW_AdviceReport
		] = await getLocaleStrings(pageData.locale, [
			"General:ConsoleWarning:Heading",
			"General:ConsoleWarning:WarnScam",
			"General:ConsoleWarning:WarnPaste",
			"General:ConsoleWarning:AdviceClose",
			"General:ConsoleWarning:AdviceReport"
		]);
		console.log(`%c ${CW_Heading} `,    ConsoleStyle.HEADING);
		console.log("%c" + CW_WarnScam,     ConsoleStyle.NORMAL);
		console.log("%c" + CW_WarnPaste,    ConsoleStyle.URGENT);
		console.log("%c" + CW_AdviceClose,  ConsoleStyle.NORMAL);
		console.log("%c" + CW_AdviceReport, ConsoleStyle.NORMAL);
	} else {
		isConsoleOpen = false;
	}
}

// Detect on resize
window.addEventListener("resize", debounce(detectConsole, 400));
// Detect on page load
detectConsole();
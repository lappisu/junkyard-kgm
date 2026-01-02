const SessionPath = "https://*.kgoma.com/v1/locator/*";
const ROOM_PATTERN = /^[a-z]{4}$/i;
const VALID_REGIONS = [
  "da_DK", "de_DE", "en_US", "en_GB", "es_ES",
  "fi", "fr_FR", "id_ID", "it_IT", "nb_NO",
  "nl_NL", "pl_PL", "pt", "ru_RU", "sv_SE",
  "tr_TR", "pt_BR"
];

function handleSessionRequests(details) {
  if (
    details.url.includes("ping")
    || details.url.includes("leave")
    || details.tabId < 0
    || !details.documentUrl.includes("games/play")
  ) return;
  const originUrl = new URL(details.originUrl);
  const sessionUrl = new URL(details.url);

  let sessionCode;
  if (originUrl.searchParams.has("room")) {
    sessionCode = originUrl.searchParams.get("room");
    // TODO: send tab a warning message
    if (!ROOM_PATTERN.test(sessionCode)) return false;
    sessionCode = `${sessionCode.slice(0,2).toLowerCase()}_${sessionCode.slice(2,4).toUpperCase()}`;
    sessionUrl.searchParams.set("type", "local-play");
    sessionUrl.searchParams.set("lang", sessionCode);
  } else if (originUrl.searchParams.has("locale")) {
    sessionCode = originUrl.searchParams.get("locale");
    // TODO: send tab a warning message
    if (!VALID_REGIONS.includes(sessionCode)) return false;
    sessionUrl.searchParams.set("type", "local-play");
    sessionUrl.searchParams.set("lang", sessionCode);
  }

  const filter = chrome.webRequest.filterResponseData(details.requestId);
  filter.onstop = async () => {
    const data = await fetch(sessionUrl.href).then(res => res.arrayBuffer());
    filter.write(data);
    filter.close();
  };
  return true;
}

chrome.webRequest.onBeforeRequest.addListener(
  handleSessionRequests,
  { urls: [ SessionPath ], types: [ "xmlhttprequest" ] },
  [ "blocking" ]
);
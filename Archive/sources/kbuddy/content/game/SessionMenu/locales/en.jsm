import LocalizationPot from "../dependencies/LocalizationPot.jsm";

const OPTIONS = {
	stringFallback: "LocalizationPot:UntranslatedString",
	valueFallback: "LocalizationPot:MissingValue",
	delimeter: ':'
};

const STRINGS = {
	"LocalizationPot:UntranslatedString": "Untranslated String",
	"LocalizationPot:MissingValue": "Missing Value",
	"HelpTab:TabName": "?",
	"LocalTab:TabName": "Local",
	"LocalTab:HelpHeader": "Local Sessions",
	"LocalTab:HelpContent": "Local game sessions allow users to play in special region-specific servers.\nThey are ideal for playing with friends in a semi-private environment.\nThis is a public KoGaMa feature.",
	"RoomsTab:TabName": "Rooms",
	"RoomsTab:TabExcerpt": "BETA",
	"RoomsTab:HelpHeader": "Room Sessions",
	"RoomsTab:HelpContent": "Rooms allow users to play in special code-based servers.\nThey are game-specific, meaning the same code will work on two different games.\nAnyone who uses the same code in the same game as you will be able to join you.\nRooms are ideal for playing with friends in a nearly-private environment without interruptions.\nRoom codes must be four characters in length and must consist only of letters (A-Z).\nThis feature is exclusive to KoGaMa Buddy.",
	"RoomsTab:CodeInputPlaceholder": "Room Code",
	"RoomsTab:JoinButton": "Join",
	"RoomsTab:FavoriteRooms": "Favorite Rooms",
	"RoomsTab:NoFavorites": "You haven't favorited any rooms yet",
	"RoomsTab:CodeTip": "To begin, input a four character code (A-Z only)"
};

export default new LocalizationPot(STRINGS, OPTIONS);
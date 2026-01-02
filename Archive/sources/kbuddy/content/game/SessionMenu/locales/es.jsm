import LocalizationPot from "../dependencies/LocalizationPot.jsm";

const OPTIONS = {
	stringFallback: "LocalizationPot:UntranslatedString",
	valueFallback: "LocalizationPot:MissingValue",
	delimeter: ':'
};

const STRINGS = {
	"LocalizationPot:UntranslatedString": "String sin traducir",
	"LocalizationPot:MissingValue": "Valor Faltante",
	"HelpTab:TabName": "?",
	"LocalTab:TabName": "Local",
	"LocalTab:HelpHeader": "Sesiones Locales",
	"LocalTab:HelpContent": "Las sesiones locales de juego permiten a usuarios jugar en servidores especiales de región específica.\nSon ideales para jugar con amigos en un ambiente semi-privado.\nEsta es una función pública de KoGaMa.",
	"RoomsTab:TabName": "Salas",
	"RoomsTab:TabExcerpt": "BETA",
	"RoomsTab:HelpHeader": "Sesiones de Sala",
	"RoomsTab:HelpContent": "Las salas permiten a los usuarios jugar en servidores especiales basados en un código.\nSon específicas por juego, significa que el mismo código funcionará en en dos juegos diferentes.\nAlguien que use el mismo código en el mismo juego que estés será capaz de unirse contigo.\nLas salas son ideales para jugar con amigos en un ambiente casi-privado sin interrupciones.\nLos códigos de salas deben tener cuatro caracteres de largo y consisten solamente de letras (A-Z).\nEsta función es exclusiva de KoGaMa Buddy.",
	"RoomsTab:CodeInputPlaceholder": "Código de Sala",
	"RoomsTab:JoinButton": "Unirse",
	"RoomsTab:FavoriteRooms": "Salas Favoritas",
	"RoomsTab:NoFavorites": "No has marcado a alguna sala como favorita",
	"RoomsTab:CodeTip": "Para empezar, escribe un código de cuatro caracteres (A-Z solamente)"
};

export default new LocalizationPot(STRINGS, OPTIONS);
import LocalizationPot from "../dependencies/LocalizationPot.jsm";

const OPTIONS = {
	stringFallback: "LocalizationPot:UntranslatedString",
	valueFallback: "LocalizationPot:MissingValue",
	delimeter: ':'
};

const STRINGS = {
	"LocalizationPot:UntranslatedString": "Chaîne non-Traduite",
	"LocalizationPot:MissingValue": "Valeur Manquante",
	"HelpTab:TabName": "?",
	"LocalTab:TabName": "Local",
	"LocalTab:HelpHeader": "Sessions en Local",
	"LocalTab:HelpContent": "Les Sessions en Local permettent aux utilisateurs de jouer dans des serveurs d'une région spécifique.\nElles sont parfaites pour jouer avec des amis dans un environnement semi-privé.\nC'est une fonctionnalité de KoGaMa publique.",
	"RoomsTab:TabExcerpt": "BÊTA",
	"RoomsTab:TabName": "Salons",
	"RoomsTab:HelpHeader": "Salon de Sessions",
	"RoomsTab:HelpContent": "Les Salons permettent aux utilisateurs de jouer dans un serveur spécial accessible par un code.\nIls sont spécifiques à un jeu, ce qui signifie que le même code fonctionnera dans deux jeux différents.\nN'importe qui utilisant le même code dans le même jeu que vous pourra vous rejoindre.\nLes Salons sont parfaits pour jouer avec des amis sans interruptions dans un environnement quasi-privé.\nLes codes des Salons doivent être constitués de 4 caractères et seulement de lettres (A-Z)\nCette fonctionnalité est exclusive à KoGaMa Buddy",
	"RoomsTab:CodeInputPlaceholder": "Code du Salon",
	"RoomsTab:JoinButton": "Rejoindre",
	"RoomsTab:FavoriteRooms": "Salons Favoris",
	"RoomsTab:NoFavorites": "Vous n'avez pas encore mis de salons en favoris",
	"RoomsTab:CodeTip": "Pour commencer, entrez un code de 4 caractères (A-Z seulement)",
};

export default new LocalizationPot(STRINGS, OPTIONS);
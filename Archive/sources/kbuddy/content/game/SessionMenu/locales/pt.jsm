import LocalizationPot from "../dependencies/LocalizationPot.jsm";

const OPTIONS = {
	stringFallback: "LocalizationPot:UntranslatedString",
	valueFallback: "LocalizationPot:MissingValue",
	delimeter: ':'
};

const STRINGS = {
	"LocalizationPot:UntranslatedString": "Texto Não Traduzido",
	"LocalizationPot:MissingValue": "Valor Não Encontrado",
	"HelpTab:TabName": "?",
	"LocalTab:TabName": "Local",
	"LocalTab:HelpHeader": "Sessões Locais",
	"LocalTab:HelpContent": "Sessões locais de jogo permitem que usuários joguem em servidores específicos de região especiais.\nElas são ideias para jogar com amigos em um ambiente semi-privado.\nEssa é uma mecânica do próprio KoGaMa",
	"RoomsTab:TabName": "Salas",
	"RoomsTab:TabExcerpt": "BETA",
	"RoomsTab:HelpHeader": "Sessões de Sala",
	"RoomsTab:HelpContent": "Salas permitem que usuários joguem em servidores especiais baseados em código.\nElas dependem do jogo, o que significa que o mesmo código funcionará em dois jogos diferentes.\nQualquer um que usar o mesmo código no mesmo jogo que você pode se juntar a você no jogo.\nSalas são ideais para jogar com amigos em um ambiente quase privado sem interrupções.\nOs códigos da sala devem ter apenas 4 carácteres e deve ser feito apenas de letras.\nEssa mecânica é exclusiva ao KoGaMa Buddy.",
	"RoomsTab:CodeInputPlaceholder": "Código de Sala",
	"RoomsTab:JoinButton": "Entrar",
	"RoomsTab:FavoriteRooms": "Salas Favoritas",
	"RoomsTab:NoFavorites": "Você  ainda não favoritou nenhuma sala",
	"RoomsTab:CodeTip": "Para começar, insira um código de quatro carácteres (apenas de A a Z)"
};

export default new LocalizationPot(STRINGS, OPTIONS);
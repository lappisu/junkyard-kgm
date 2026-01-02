import Vue from "./dependencies/vue.esm.browser.min@2.6.11.jsm";
import LocalizationPot from "./dependencies/LocalizationPot.jsm";
import SessionMenuButton from "./components/SessionMenuButton.jsm";
const SessionMenu = () => import("./components/SessionMenu.jsm");

Vue.use(LocalizationPot);

import(`./locales/${KB_NAK_LOCALE.slice(0,2)}.jsm`).then(module => {
  const translations = module.translations || module.default;
  window.KB_NAK_APP = new Vue({
    el: "#delta-nak",
    components: {
      SessionMenu,
      SessionMenuButton
    },
    data: () => ({
      isMenuOpen: false
    }),
    methods: {
      toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
      }
    },
    translations
  });
});
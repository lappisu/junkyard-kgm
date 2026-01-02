const template =
`<div class="kb-sm-local-tab" v-once>
  <div
    v-for="region in regions"
    :key="region.code"
  >
    <a :href="createLink(region.code)">
      <img
        :src="region.icon"
        :alt="region.name"
        :title="region.name"
        width="100"
        height="100"
      />
    </a>
  </div>
</div>`;

const LocalRegions = [{
  name: "Deutsch",
  code: "de_DE",
  icon: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><title>de_DE</title><g><path fill='#2d3436' d='M100,25v7H0V25A25.07,25.07,0,0,1,25,0H75A25.07,25.07,0,0,1,100,25Z'/><rect fill='#d62f30' y='32' width='100' height='36'/><path fill='#fecb6f' d='M100,68v7a25.07,25.07,0,0,1-25,25H25A25.07,25.07,0,0,1,0,75V68Z'/></g></svg>"
}, {
  name: "English (US)",
  code: "en_US",
  icon: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><title>en_US</title><g><path fill='#40739f' d='M44,0V40H0V25a24.23,24.23,0,0,1,.51-5A25.09,25.09,0,0,1,25,0Z'/><path fill='#c13a27' d='M99.49,20H44V0H75A25.09,25.09,0,0,1,99.49,20Z'/><path fill='#e4e8e9' d='M100,25V40H44V20H99.49A24.23,24.23,0,0,1,100,25Z'/><rect fill='#c13a27' y='40' width='100' height='20'/><path fill='#e4e8e9' d='M100,60V75a24.23,24.23,0,0,1-.51,5H.51A24.23,24.23,0,0,1,0,75V60Z'/><path fill='#c13a27' d='M99.49,80A25.09,25.09,0,0,1,75,100H25A25.09,25.09,0,0,1,.51,80Z'/></g></svg>"
}, {
  name: "Español",
  code: "es_ES",
  icon: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><title>es_ES</title><g><path fill='#d62f30' d='M100,25v2H0V25A25.07,25.07,0,0,1,25,0H75A25.07,25.07,0,0,1,100,25Z'/><rect fill='#f0c419' y='27' width='100' height='46'/><path fill='#d62f30' d='M100,73v2a25.07,25.07,0,0,1-25,25H25A25.07,25.07,0,0,1,0,75V73Z'/></g></svg>"
}, {
  name: "Français",
  code: "fr_FR",
  icon: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><title>fr_FR</title><g><path fill='#e64c3c' d='M75,100H68V0h7a25.07,25.07,0,0,1,25,25V75A25.07,25.07,0,0,1,75,100Z'/><rect fill='#edf0f1' x='32' width='36' height='100'/><path fill='#2880ba' d='M32,100H25A25.07,25.07,0,0,1,0,75V25A25.07,25.07,0,0,1,25,0h7Z'/></g></svg>"
}, {
  name: "Polski",
  code: "pl_PL",
  icon: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><title>pl_PL</title><g><path fill='#edf0f1' d='M100,25V50H0V25A25.07,25.07,0,0,1,25,0H75A25.07,25.07,0,0,1,100,25Z'/><path fill='#c03b2b' d='M100,50V75a25.07,25.07,0,0,1-25,25H25A25.07,25.07,0,0,1,0,75V50Z'/></g></svg>"
}, {
  name: "Português",
  code: "pt",
  icon: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><title>pt_BR</title><g><rect fill='#4eba6f' width='100' height='100' rx='25'/><polygon fill='#fecb6f' points='50 83.94 6.06 50 50 16.06 93.94 50 50 83.94'/><circle fill='#3b97d3' cx='50' cy='50' r='19.15'/></g></svg>"
}, {
  name: "Русский",
  code: "ru_RU",
  icon: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><title>ru_RU</title><g><path fill='#edf0f1' d='M100,25v7H0V25A25.07,25.07,0,0,1,25,0H75A25.07,25.07,0,0,1,100,25Z'/><rect fill='#2880ba' y='32' width='100' height='36'/><path fill='#e64c3c' d='M100,68v7a25.07,25.07,0,0,1-25,25H25A25.07,25.07,0,0,1,0,75V68Z'/></g></svg>"
}, {
  name: "Türkçe",
  code: "tr_TR",
  icon: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><title>tk_TK</title><g><rect fill='#c03b2b' width='100' height='100' rx='25'/><path fill='#edf0f1' d='M49.72,68.42A18.42,18.42,0,1,1,60.19,34.85a25.24,25.24,0,1,0,0,30.3A18.31,18.31,0,0,1,49.72,68.42Z'/><polygon fill='#edf0f1' points='58.24 50 65.32 46.5 66.46 38.69 71.97 44.34 79.76 43.01 76.08 50 79.76 56.99 71.97 55.66 66.46 61.31 65.32 53.5 58.24 50'/></g></svg>"
}];
Object.values(LocalRegions).forEach(r => r.icon = "data:image/svg+xml," + encodeURIComponent(r.icon));

export default {
  name: "LocalTab",
  data: () => ({
    regions: LocalRegions
  }),
  methods: {
    createLink(code) {
      const url = new URL(window.location.href);
      url.searchParams.set("locale", code);
      return url.toString();
    }
  },
  template
};
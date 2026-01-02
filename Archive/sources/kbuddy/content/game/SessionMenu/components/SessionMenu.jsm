const HelpTab  = () => import("./Tabs/HelpTab.jsm");
const LocalTab = () => import("./Tabs/LocalTab.jsm");
const RoomsTab = () => import("./Tabs/RoomsTab.jsm");

const template =
`<div class="kb-session-menu">
  <div class="kb-sm-header">
    <button
      v-for="(tab, index) in tabs"
      :key="tab"
      :class="['kb-sm-tab', { active: tabIndex === index }]"
      :disabled="tab.disabled"
      @click="switchTab(index)"
    >
      <strong v-translate="tab + ':TabName'" v-once></strong>
      <sup v-translate.blank="tab + ':TabExcerpt'" v-once></sup>
    </button>
  </div>
  <div class="kb-sm-content">
    <keep-alive :include="[ 'RoomsTab' ]" :max="1">
      <component :is="activeTab"></component>
    </keep-alive>
  </div>
</div>`;

export default {
  name: "SessionMenu",
  components: {
    HelpTab,
    LocalTab,
    RoomsTab
  },
  data: () => ({
    tabIndex: 1,
    tabs: [
      HelpTab.name,
      LocalTab.name,
      RoomsTab.name
    ]
  }),
  computed: {
    activeTab() {
      return this.tabs[this.tabIndex];
    }
  },
  methods: {
    switchTab(index) {
      if (this.tabIndex === index) return;
      this.tabIndex = index;
    }
  },
  template
};
const template =
`<div class="kb-sm-help-tab" v-once>
  <h1 v-translate="'LocalTab:HelpHeader'"></h1>
  <p v-translate="'LocalTab:HelpContent'"></p>
  <br/>
  <h1 v-translate="'RoomsTab:HelpHeader'"></h1>
  <p v-translate="'RoomsTab:HelpContent'"></p>
</div>`;

export default {
	name: "HelpTab",
	template
};
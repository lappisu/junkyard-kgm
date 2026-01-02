const template =
`<div class="kb-sm-rooms-tab">
  <div class="kb-sm-rt-input">
    <div class="kb-sm-rt-input-container">
      <i
        class="kb-sm-rt-input-fave"
        :class="[ isCurrentRoomFavorited ? 'rm-fave' : 'add-fave', { 'invalid-input': !isCurrentCodeValid } ]"
        @click="toggleFavoriteRoom"
      ></i>
      <input
        v-model="codeInput"
        v-translate:placeholder="'RoomsTab:CodeInputPlaceholder'"
        autocomplete="off"
        minlength="4"
        maxlength="4"
        pattern="[a-zA-Z]{4}"
      />
      <button
        v-translate="'RoomsTab:JoinButton'"
        class="kb-sm-rt-input-join"
        :disabled="!isCurrentCodeValid"
        @click="joinRoom"
      ></button>
    </div>
  </div>
  <div class="kb-sm-rt-saved">
    <h2 v-translate="'RoomsTab:FavoriteRooms'"></h2>
    <div v-if="favoriteRooms.length === 0">
      <p>
        <span v-translate="'RoomsTab:NoFavorites'"></span>
        <br/><br/>
        <span v-translate="'RoomsTab:CodeTip'"></span>
      </p>
    </div>
    <div v-else class="kb-sm-rt-room-grid">
      <div
        v-for="code in favoriteRooms"
        :key="code"
        class="kb-sm-rt-room-card"
        @click="selectRoom(code)"
      >
        <p>
          <strong v-text="code"></strong>
          <i
            class="remove-button"
            @click.stop="unfavoriteRoom(code)"
          ></i>
        </p>
      </div>
    </div>
  </div>
</div>`;

const CodePattern = /[a-z]{4}/i;

export default {
  name: "RoomsTab",
  data: () => ({
    codeInput: "",
    favoriteRooms: []
  }),
  computed: {
    currentCode() {
      return this.codeInput.toUpperCase();
    },
    isCurrentRoomFavorited() {
      return this.favoriteRooms.includes(this.currentCode);
    },
    isCurrentCodeValid() {
      return this.codeInput.length === 4 && CodePattern.test(this.codeInput);
    }
  },
  created() {
    const server = /www|friends|br/.exec(location.hostname)[0];
    const storedData = localStorage.getItem(`${server}:${KB_NAK_CLIENT_ID}:favorite_rooms`);
    this.favoriteRooms = storedData === null || storedData.length === 0 ? [] : storedData.split(',');
  },
  beforeDestroy() {
    const server = /www|friends|br/.exec(location.hostname)[0];
    const dataKey = `${server}:${KB_NAK_CLIENT_ID}:favorite_rooms`;
    if (!this.favoriteRooms.length && !localStorage.getItem(dataKey)) return;
    localStorage.setItem(dataKey, this.favoriteRooms.join(','));
  },
  methods: {
    selectRoom(code) {
      this.codeInput = code;
    },
    unfavoriteRoom(code) {
      this.favoriteRooms.splice(this.favoriteRooms.indexOf(code), 1);
    },
    toggleFavoriteRoom() {
      if (!this.isCurrentCodeValid) return;
      return this.isCurrentRoomFavorited
        ? this.unfavoriteRoom(this.currentCode)
        : this.favoriteRooms.push(this.currentCode);
    },
    joinRoom() {
      if (!this.isCurrentCodeValid) return;
      const search = new URLSearchParams(window.location.search);
      search.set("room", this.currentCode);
      window.location.search = search.toString();
    }
  },
  template
};
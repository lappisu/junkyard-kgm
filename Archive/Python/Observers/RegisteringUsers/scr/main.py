import os, re, time, json, unicodedata, requests
from pathlib import Path
from datetime import datetime, timezone

SRC_DIR = Path("src")
SRC_DIR.mkdir(exist_ok=True)

PATHS = {
    "config": SRC_DIR / "config.json",
    "flags": SRC_DIR / "flags.json",
    "failed": SRC_DIR / "failed_webhooks.json",
    "log": Path("flagged_log.txt")
}

BASE_URL = "https://www.kogama.com"
USER_FEED = f"{BASE_URL}/user/?page={{page}}&count=400"
PROFILE_URL = f"{BASE_URL}/profile/{{}}"
WEBHOOK_DELAY = 1.8

LEET_DICT = {
    '4': 'a', '@': 'a', '8': 'b', '(': 'c', '3': 'e', '9': 'g',
    '1': 'i', '!': 'i', '|': 'i', '0': 'o', '5': 's', '$': 's', '7': 't', '2': 'z'
}

class MonitorEngine:
    def __init__(self):
        self.config = self.load_json(PATHS["config"])
        self.flags = self.load_json(PATHS["flags"]).get("BLACKLIST", [])
        self.session = requests.Session()
        self.session.headers = {"User-Agent": "KoGaMa-Monitor/2.0"}
        self.history = []
        self.patterns = self._build_patterns()

    def load_json(self, path):
        if not path.exists():
            return {}
        return json.loads(path.read_text(encoding="utf-8"))

    def save_config(self):
        PATHS["config"].write_text(json.dumps(self.config, indent=2), encoding="utf-8")

    def _build_patterns(self):
        pats = []
        for group in self.flags:
            for word in group.values():
                if isinstance(word, list):
                    for w in word:
                        regex = r"[\W_]*".join(re.escape(c) for c in w)
                        pats.append((w, re.compile(regex, re.I)))
        return pats

    def normalize(self, text):
        text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
        text = text.lower()
        for leet, normal in LEET_DICT.items():
            text = text.replace(leet, normal)
        return text

    def check_user(self, username):
        norm = self.normalize(username)
        hits = [raw for raw, pat in self.patterns if pat.search(norm)]
        bot_reason = None
        m = re.match(r"(.+?)(\d+)$", norm)
        if m:
            base, num = m.groups()
            if any(
                h.startswith(base)
                and abs(int(re.search(r"\d+", h).group()) - int(num)) == 1
                for h in self.history[-10:]
            ):
                bot_reason = f"Sequential: {base}###"
        self.history = (self.history + [norm])[-30:]
        return hits, bot_reason

    def create_embed(self, user, hits, bot_reason):
        if bot_reason:
            status = "BOT"
            color = 0x4B4F7A
            reason = bot_reason
        elif hits:
            status = "FLAGGED"
            color = 0x7A3E3E
            reason = ", ".join(hits)
        else:
            status = "VALID"
            color = 0x3F5F4A
            reason = "None"

        return {
            "title": user["username"],
            "url": PROFILE_URL.format(user["id"]),
            "color": color,
            "fields": [
                {
                    "name": "Status",
                    "value": status,
                    "inline": False
                },
                {
                    "name": "Reason",
                    "value": reason,
                    "inline": False
                },
                {
                    "name": "User ID",
                    "value": str(user["id"]),
                    "inline": True
                },
                {
                    "name": "Timestamp",
                    "value": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
                    "inline": True
                }
            ]
        }


    def log_to_file(self, user, hits, bot_reason):
        tag = "[BOT]" if bot_reason else f"[SLUR: {', '.join(hits)}]"
        profile = PROFILE_URL.format(user["id"])
        line = (
            f"{datetime.now().isoformat()} | "
            f"{profile} | "
            f"{user['id']} | "
            f"{user['username']} | "
            f"{tag}\n"
        )
        with open(PATHS["log"], "a", encoding="utf-8") as f:
            f.write(line)


    def post_webhook(self, embed, is_filtered):
        url = self.config.get("WEBHOOK_FILTERED" if is_filtered else "WEBHOOK_VALID")
        if not url:
            return
        try:
            self.session.post(url, json={"embeds": [embed]}, timeout=10)
            time.sleep(WEBHOOK_DELAY)
        except:
            time.sleep(WEBHOOK_DELAY)


    def run(self):
        print(f"Monitoring started. Latest ID: {self.config.get('LATEST_ID')}")
        while True:
            try:
                resp = self.session.get(USER_FEED.format(page=1), timeout=10).json()
                entries = sorted(resp.get("data", []), key=lambda x: x["id"])
                for entry in entries:
                    uid = entry["id"]
                    if uid <= self.config.get("LATEST_ID", 0):
                        continue
                    hits, bot_reason = self.check_user(entry["username"])
                    embed = self.create_embed(entry, hits, bot_reason)
                    self.post_webhook(embed, bool(hits or bot_reason))
                    if hits or bot_reason:
                        self.log_to_file(entry, hits, bot_reason)
                    self.config["LATEST_ID"] = uid
                    self.save_config()
                time.sleep(15)
            except Exception as e:
                print(f"Error: {e}")
                time.sleep(20)

if __name__ == "__main__":
    MonitorEngine().run()

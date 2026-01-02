# Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Release 1.9.0 - 2020-03-31

It's been three long months, but the next version of KoGaMa Buddy is here!

### Added

* RichText Functional Links
> A small variety of links are now clickable in chat! Links are filtered for safety.
> The following KoGaMa-related domains are whitelisted. Any link from these sites is permitted.
> www.kogama.com, friends.kogama.com, kogama.com.br, www.support.kogama.com, kogama.freeforums.net, kogama.gamepedia.com, multiverseblog.weebly.com, multiverseaps.com
> The following non-KoGaMa-related links are whitelisted. These links must match exactly.
> https://twitter.com/KOGAMAGAME, https://www.facebook.com/Kogamians/, https://www.instagram.com/kogama_official/, https://www.linkedin.com/company/multiverse-aps/, https://www.youtube.com/user/KoGaMagamemaker, https://discord.com/invite/kogama, https://discordapp.com/invite/kogama, https://discord.gg/kogama, https://discord.gg/2P3jZd5, https://discord.gg/D9JAg2FAka
* Chat Emote Menu & KoGaMa emotes in Chat
> The KoGaMa emote menu is now available in chat! Use any KoGaMa emote or KoGaMa Buddy KoGaMote in your direct messages.
* Offline Friend Counter
> Know how many friends are online and offline now!
* Force Leave Project Button
> Ever been in a project you simply couldn't leave due to the leave button being missing? Have no fear! This patch is here to help!
> Whenever the extension detects the button is missing, it will add its own force leave button, allowing users to leave any project.
* Chat Newline Patch
> Whenever the enter button was hit, a newline was added to your message, sometimes displaying a space where you didn't want one.
> This has been fixed, and pressing the enter button will no longer add a newline to your message.
* Last Played Game Profile Section
> Turns out KoGaMa stores the last game you viewed or played, so why not use this for something? Easily return to a previous game!
* Profile Edit Description Entities Patch
> Whenever a user goes to edit their profile description, the text will have been modified, displaying HTML entities for certain characters.
> This will no longer happen, as the extension will parse the description and display its original value. This patch will be removed when the issue is officially fixed.
* Custom Profile Backgrounds (Experimental)
> This update includes early/experimental custom profile background support. Showcase a game or create some profile art for all to enjoy!
> To set a custom profile background, include the following format somewhere in your profile description: `Background: GAME_ID, filter: FILTER;`
> `GAME_ID` is the ID of a game on the current server. `FILTER` is one of `light`, `dark`, `blur`, or `none`. The format is not case-sensitive, and filter is optional with a default value of `light`.
> Due to this feature being experimental, the format may change in future updates, causing backgrounds to break in older versions.

### Changed

* Text-based features now available on profile edit page
> Features were originally restricted from running on the profile edit page due to it being a page with sensitive information (user password); however, due to KoGaMa's new login system being included in every page, there's no point in keeping this restriction.
> The restriction has been lifted, and all features are now available on the profile edit page. Restrictions have not been lifted from any other restricted page, such as the Elite or gold purchase page.
* Preview Panel displays KoGaMa emotes
> Due to RichText's emote parsing being reworked, KoGaMa emotes can now be displayed in the Preview Panel.
* Reset KoGaMa word break styling on chat
> Chat messages splitting off into multiple lines is fine, but having it split in the middle of a word is weird. This patch reverts KoGaMa's decision to do so.
* Character Counter enabled for chat
> Though still a bit buggy, the character counter is now available for chat. It will only work on specific pages, and will only appear once the input box is clicked twice. This will hopefully be fixed in the future.
* MoreMembers Expansion to 400
> This expansion increases the previous expanded amount of 105 to 400, the maximum.
* RichText Preview Panel will no longer appear when hovering over textarea
> Let's be honest: having the panel appear when hovering *even slightly* over a textarea was annoying. It will now only appear when the textarea is focused.

### Fixed

* RichText Preview Panel failed to appear in View Wall Mode (Reported by - HDB - KGM#1817)
> This issue was actually a larger issue, in which no text-based features worked in View Wall mode. This has been fixed, so you are able to use the Preview Panel, Character Counter, and style patches!
* RichText Preview Panel appears when using invalid emote (Reported by - HDB - KGM#1817)
> Using the emote format would make the Preview Panel appear, even if there was no valid emote. This has been fixed, and the Panel will only appear when using valid markdown or emotes.
* Chat messages error out when sending first message (Reported by - HDB - KGM#1817)
> Starting a new chat session would display messages as never being sent, despite the recipient actually receiving them. This has been fixed.
* Friends List Timestamp Patch updating friends list constantly
> This feature was supposed to update the friends list every 15 minutes to always have the correct timestamps, but it turns out it was updating it every 15 seconds instead.
* Friends List Updater did not work on Friends server
> I may or may not have accidentally hardcoded the WWW (Live) server into this feature, leaving poor Friends out. Rest assured, Friends has been invited to the party!
* Friends List / RichText Game Resolver non-functional due to KoGaMa update
> KoGaMa changed the way game information is retrieved, and it broke two resolvers. These have been fixed, so you can view game names again.
* Favorite Friends category failing to create category
> There was a chance the Favorite Friends Category feature failed to create its category, and would remain broken until page refresh. This fix will ensure it will always be created, even if delayed.
* Newlines were not displayed in wall posts
> Multi-line messages were not displayed properly in wall posts. This has been fixed.
* Fixed typo in English locale, incorrect key in Spanish locale
> Small localization changes, fixing a typo and incorrect key which led to a string return undefined.

---

## Release 1.8.0 - 2020-12-21

### Added

* Marketplace Search
> The long-awaited Marketplace Search page is now here! Easily search for models and avatars by name and find what you need!
> NOTE: This is using KoGaMa's own Marketplace search tool, and, as such, will require the item's exact name.
* Friends List Timestamp Patch (Suggested by Cora#4776)
> Tired of your friends list displaying the wrong time? This patch will force your friends list to stay updated every fifteen minutes.

### Changed

* High Quality Screenshot Button Expansion (Suggested by _Fernando#4958)
> Ever wish you could retrieve high quality images from the marketplace without having to visit the item's page, saving you a click? No? Oh. Well, now you can!
> The HQSB feature has also been added to the project invites and project search page.
* Items Per Page Expansion (Suggested by Cora#4776)
> This expansion allows the user to increase the amount of games displayed on a page.
* Automatic High Quality Screenshot Button
> The HQSB feature has been reworked to automatically add buttons after a dynamic change to the page.
* High Quality Screenshot Button defaults to a new tab
> Previously, clicking on the button would take you to the image, which was a bit annoying if you had wanted to stay on the same page. With this change, clicking on the button will open the image in a new tab.

### Fixed

* Text-based features did not run on Friends server
> The features were accidentally set to only work on WWW and BR. This has been fixed, and the features can now be used on Friends.
* Text-based features ran on Profile Edit page
> If you tried to edit your profile description and received a warning about unsaved changes, this was due to the features not being restricted from running on the Profile Edit page.
> This has been fixed, so you no longer have to worry about silly warnings.

### Removed

* Deprecated KoGaMotes have been removed
> Old un-prefixed KoGaMotes have been completely removed.

---

## Release 1.7.0 - 2020-11-08

It's been a while, hasn't it? This update is unfortunately not the rewrite with Chromium support, but it does include a few things you may enjoy! Thank you for your patience and understanding.

### Added

* NoChatLag Patch (Suggested by Daniloch#1234)
> Chat is an unoptimized mess. This patch allows you to type as quickly as you desire, and even use newlines by hitting the enter key while holding shift.
> Messages sent by this patch will have visible loading and error states, so you'll know if your message failed to send or not.
* KoGaMotes Added to Emotes Menu (Suggested by - HDB - KGM#1817)
> Easily see which KoGaMotes are available and add them to your messages from the emotes menu!
* RichText Preview Panel
> Whenever RichText markdown or KoGaMotes are detected, a preview panel will appear to give you an idea of what your final message will look like.
* Unsaved Changes Reminder
> Ever leave a page accidentally without sending that great message of yours? Worry not! This feature will prevent such occurences from happening ever again!

### Changed

* Session Menu Self-Destruct
> If the Session Menu icon is still visible while in a game, simply click on it and it shall self-destruct, allowing you to exit the in-game shop.
* Prefixed KoGaMotes
> All Blockboy and Sword Girl emotes have been renamed to include a prefix. The old emote names will be kept for a month but should no longer be used; to deter usage and warn users about the deprecation, they shall now be faded.
* TextLimit Now Detects Emotes
> TextLimit will now update its character counter whenever an emote is selected from the emote menu.
* Reattempt Client ID Retrieval
> The Client ID Retrieval System will now reattempt to retrieve the ID should it fail the first time. Three more attempts shall be made, after five (5), ten (10), and fifteen (15) seconds.

### Fixed

* MoreFriends Feature Causing Avatar Page to be Blank
> This issue occured whenever a user had over 300 friends. This has now been fixed and made future-proof. The view limit for friends has been increased from the extensions's 400 to all friends.
* SPAM Failing to Work on Avatar Pages and Build Invitations Page
> The Single Page Application Mode feature will now work on avatar pages as intended, and will not wipe the Build Invitations page.

### Removed

* MoreBadges Incresed View Limit
> The badge view limit has officially been increased on KoGaMa to 150, making this patch redundant.
* Wrapping Badge Rows
> This style patch has been officially implemented on the site, making the extension's patch redundant.

---

## Release 1.6.0 - 2020-05-24

### Added

* Play in Standalone Button (Suggested by Aligator#9999, INKnight#5643)
	> A button to launch a game or project using the Standalone client will now be available when using WebGL, allowing new and current Standalone users to switch with the click of a button.
* Desktop Chat Toggle (Suggestedt by INKnight#5643)
	> A toggle button will now be visible so users can hide their friends list/chat to more easily focus on games or the site.
* Token Self-Destruct
	> The user's authentication token will now be safely destroyed on each page. This will prevent account theft should the user ignore the Console Warning and paste malicious code into the browser console.
* Single Page Application Mode
	> This feature allows users to browse paginated pages (Games, Projects, Marketplace) without actually leaving the page, similarly to viewing one's Wall.
* RichText Code Blocks and Quotes
	> RichText now supports quotes using the Discord-like format (> QUOTE). Code blocks are also supported, though only when using chat. Syntax highlighting is not supported.

### Changed

* Implemented Logging for Client ID Retrieval
	> KoGaMa Buddy's Client ID Retrieval System will now be logging data to the extension console throughout the process. If the favorite friends, user blocking, or view wall features fail to work properly, please report the issue and provide the logged details.
* Split KoGaMa Buddy Stylesheet
	> The extension will now load the minimum amount of stylesheets necessary for features to display properly.
* Removed restriction on login/registration page
	> Since the login/registration page no longer exists, the extension will now longer include these restrictions.
* Increased Minimum Firefox Version Required (67.0)
	> Due to dynamic imports being used in the Session Menu to only provide the minimum amount of features required, the minimum Firefox version required has been increased to Firefox 67. This version was released May 21, 2019.
* Restructured Features [Internal]
	> Features have been re-organized internally to improve development. Users should not feel a difference.

### Fixed

* ES/FR Translations No Longer Display Variable (Reported by - HDB - KGM#1817)
	> Spanish and French translations for the Link Resolver will no longer display a variable. This was accidentally re-introduced in a previous update.
* WebGL XP Display No Longer Appears Above Session Menu (Reported by - HDB - KGM#1817)
	> WebGL's XP display will no longer appear in front of the Session Menu should the game fail to load.
* Session Menu No Longer Appears With Auto-Run Enabled (Reported by +-Lieuten-Ant-+#9400)
	> The Session Menu will no longer appear should the game be automatically launched using the `autoplay` parameter. This is to prevent conflicts with the in-game Shop's exit button.
* Session Menu BR Translations Available on BR Server
	> The Session Menu will now be fully localized when playing on the BR server.
/** English (base) — all keys must exist in every locale. */
export const en: Record<string, string> = {
  // Auth
  'auth.title': 'WordRealms',
  'auth.subtitle': 'Build your kingdom one word at a time',
  'auth.play_guest': 'Play as Guest',
  'auth.more_options': 'More login options coming soon',
  'auth.guest_disclaimer': "Guest mode saves progress locally when cloud sign-in isn't available.",

  // Onboarding
  'onboarding.slide1.title': 'Welcome to WordRealms',
  'onboarding.slide1.subtitle': 'Build your kingdom one word at a time',
  'onboarding.slide2.title': 'Swipe to Form Words',
  'onboarding.slide2.text': 'Connect letters by swiping. Longer words = more resources!',
  'onboarding.slide2.got_it': 'Got it →',
  'onboarding.slide2.rewards_title': 'Rewards',
  'onboarding.slide3.title': 'Earn Resources, Build Buildings',
  'onboarding.slide3.text': 'Use gold, wood and stone to construct your fantasy kingdom',
  'onboarding.slide3.amazing': 'Amazing →',
  'onboarding.slide4.title': 'Choose Your Language',
  'onboarding.slide4.text': 'Play in your language. More languages = more players!',
  'onboarding.slide4.start': 'Start Playing!',
  'onboarding.lets_go': "Let's Go →",
  'onboarding.skip': 'Skip',

  // Home
  'home.streak_start': 'Start your streak today!',
  'home.streak': '🔥 {n} day streak',
  'home.words_today': 'Words Found Today: {n}',
  'home.daily_progress': 'Daily progress ({n}/5 words)',
  'home.play_button': "Play Today's Puzzle",
  'home.your_world': 'Your World',
  'home.empty_slots': '+ {n} empty slots',
  'home.buildings': '{n} / 10 buildings',
  'home.kingdom_complete': 'Kingdom complete!',

  // Game
  'game.daily_puzzle': 'Daily Puzzle',
  'game.puzzle_number': 'Puzzle #{n}',
  'game.words_possible': '{n} words possible',
  'game.give_up': 'Give Up (hint)',
  'game.hint_button_aria': 'Show hint',
  'game.hint': 'Hint: try "{word}"',
  'game.find_words': 'Find at least {n} words to unlock completion.',
  'game.no_words': 'No words yet.',
  'game.words_found': 'Words Found',
  'game.complete_button': "Complete Today's Puzzle",
  'game.archive': '📜 Archive',
  'game.come_back': 'Come back tomorrow for Puzzle #{n}!',
  'game.not_valid': 'Not a valid word',
  'game.min_length': 'Word must be at least 3 letters',
  'game.letters_only': 'Use letters only',
  'game.already_found': 'Already found!',
  'game.excellent': 'EXCELLENT! 🌟',
  'game.loading_dict': 'Loading dictionary…',
  'game.archive_note': 'Archive — not ranked',
  'game.no_hints': 'No hints left.',
  'game.back_today': "← Back to today's puzzle",

  // World
  'world.title': 'Your Kingdom',
  'world.level': 'Kingdom Level {n}',
  'world.buildings_count': '{n} buildings',
  'world.resources_line': '[G] {g} · [W] {w} · [S] {s}',
  'world.watch_ad': 'Watch ad for +100 [G] (simulated)',
  'world.ad_playing': 'Ad playing…',
  'world.building_detail_close': 'Close',

  // Buildings (keys match buildingConfig type lowercased)
  'building.house.name': 'House',
  'building.house.desc': '+5 daily gold bonus',
  'building.sawmill.name': 'Sawmill',
  'building.sawmill.desc': 'Double wood rewards',
  'building.mine.name': 'Mine',
  'building.mine.desc': 'Unlock stone rewards',
  'building.market.name': 'Market',
  'building.market.desc': '+20% all rewards',
  'building.tower.name': 'Tower',
  'building.tower.desc': 'Unlock premium puzzles',
  'building.slot_build': 'Build',
  'building.slot_tooltip': 'Build Here',

  // Construction Modal
  'modal.build_title': 'Choose Building',
  'modal.build_heading': 'Build',
  'modal.choose_slot': 'Slot {n} — choose a building.',
  'modal.cost': 'Cost',
  'modal.confirm': 'Build',
  'modal.cancel': 'Cancel',
  'modal.cant_afford': 'Not enough resources.',
  'modal.close': 'Close',

  // League
  'league.title': "Today's Rankings",
  'league.be_first': "Be the first to complete today's puzzle!",
  'league.your_words': 'Your total words (local): {n}',
  'league.connect_supabase': 'Best rank ever: connect Supabase for live rankings.',
  'league.refresh': 'Refresh',
  'league.you': 'You',
  'league.words_short': '{n} words',
  'league.points_abbr': '{n} pts',

  // Settings
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.sound': 'Sound',
  'settings.sound_effects': 'Sound Effects',
  'settings.haptic': 'Haptic',
  'settings.haptic_feedback': 'Haptic Feedback',
  'settings.stats': 'Stats',
  'settings.total_words': 'Total words found (all time): {n}',
  'settings.total_buildings': 'Total buildings built: {n}',
  'settings.current_streak': 'Current streak: {n} days',
  'settings.puzzle_archive_days': 'Puzzle archive days played: {n}',
  'settings.built_emojis': 'Built: {list}',
  'settings.reset': 'Reset',
  'settings.reset_button': 'Reset All Progress',
  'settings.language_updated': 'Language updated!',
  'settings.reset_confirm': 'Delete all local progress? This cannot be undone.',
  'settings.reset_cancel': 'Cancel',
  'settings.reset_ok': 'Reset',
  'settings.back': 'Back',

  // Shop
  'shop.title': 'Premium',
  'shop.tagline': 'WordRealms Premium',
  'shop.benefit1': 'No ads (coming soon)',
  'shop.benefit2': '2× resources on every word',
  'shop.benefit3': 'Access to all puzzle history',
  'shop.benefit4': 'Premium badge in leaderboard',
  'shop.benefit5': 'Exclusive building skins (coming soon)',
  'shop.price': '9.99€ / month',
  'shop.go_premium': 'Go Premium 👑',
  'shop.restore': 'Restore Purchases',
  'shop.already_premium': "You're Premium! 👑",
  'shop.all_active': 'All benefits are active.',

  // Navigation
  'nav.home': 'Home',
  'nav.play': 'Play',
  'nav.world': 'World',
  'nav.league': 'League',

  // Puzzle Complete
  'complete.title': 'Puzzle Complete!',
  'complete.words_found': 'Words Found',
  'complete.points': 'Points Earned',
  'complete.streak': 'Day Streak',
  'complete.label_words': 'Words',
  'complete.label_resources': 'Gold / wood / stone (session)',
  'complete.label_streak': 'Streak',
  'complete.streak_days': '🔥 {n} days',
  'complete.build_world': 'Build Your World',
  'complete.keep_playing': 'Keep Playing',
  'complete.share': 'Share Result',

  // Archive
  'archive.title': '📜 Puzzle Archive',
  'archive.today': 'Today',
  'archive.locked': '🔒 Locked',
  'archive.not_ranked': 'Replays are not ranked',
  'archive.words_found': '{n} words found',
  'archive.loading': 'Loading…',
  'archive.hint_play': 'Not played yet — tap to play',
  'archive.footer': "Archive runs don't count toward league rankings.",
  'archive.note_badge': 'Archive — not ranked',

  // Loading
  'loading.building': 'Building your kingdom...',

  // Errors
  'error.something_wrong': 'Something went wrong',
  'error.restart': 'Restart App',

  // Offline
  'offline.banner': '📡 Playing offline — progress saved locally',
  'offline.dismiss': 'Dismiss',

  // Premium banner
  'premium.banner': 'Go Premium for 2× rewards 👑',
  'premium.dismiss': 'Dismiss',

  // Rewards (onboarding)
  'rewards.letters3': '3 letters → [G] 10',
  'rewards.letters4': '4 letters → [G] 20 + [W] 5',
  'rewards.letters5': '5+ → more wood & stone',

  // Share card
  'share.title': 'WordRealms',
  'share.play_at': 'Play at wordrealms.app',
  'share.copied': 'Copied result to clipboard!',
  'share.words_line': 'Words: {n}',
  'share.points_line': 'Points: {n}',
  'share.url': 'wordrealms.app',
};

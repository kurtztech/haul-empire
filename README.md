# 🚚 Haul Empire

A mobile-first trucking idle game where buying trucks isn't enough: they only earn on the road network you build.

**Play:** https://kurtztech.github.io/haul-empire/

## The twist: the Freight Network
Every region is a map of cities. Your fleet produces haul capacity, but trucks only earn on **lanes** you open between cities:

- **Open lanes** from any city with a hub. Short lanes between big cities carry lots of freight; long lanes pay more per truck.
- **Build hubs** to add a local depot and boost the pay of every lane touching that city.
- **Upgrade roads** (Dirt Track → … → Warp Lane) when they turn red. Congested roads waste trucks.
- The fleet spreads itself across your lanes optimally. The **Fleet in use** meter tells you whether to buy trucks or expand the network.
- **Freight surges** make a random lane pay ×3 for 90 seconds. Sometimes it's a lane you haven't opened yet.

## Also
- 13 vehicles and 10 regions, from Main Street to the Galactic Ring
- Tap combos, deliveries, rush orders, auto-drive
- Timed contracts, including network goals
- IPO prestige: shares boost income forever, and dividends buy Executive Board perks (automation included)
- 40 achievements, offline earnings, autosave, save export/import

## Code
No build step. `index.html` loads plain scripts from `js/`:
`data.js` (content and economy), `net.js` (map generation and the network solver), `art.js` (sound and drawing), `map.js` (map UI), `game.js` (everything else).

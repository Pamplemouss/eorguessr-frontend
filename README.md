# Eorguessr Frontend

## FFXIV GeoGuessr Game

A real-time multiplayer guessing game for Final Fantasy XIV locations using photospheres.

## Game Workflow

### Game Phases

1. **LOBBY**: Players join and wait for the game to start
2. **GUESSING**: Players explore maps and place their guesses
3. **RESULT**: Display scores for the current round  
4. **RECAP**: Show visual map with all player guesses and correct location

### Gameplay Features

- **Free Map Exploration**: Players can place pins on any map type (MAP, DUNGEON, REGION, WORLD_MAP)
- **Real-time Multiplayer**: Synchronized game state across all players
- **Visual Feedback**: Pin placement shows immediately with custom markers
- **Enhanced Recap**: Visual map showing:
  - Correct photosphere location (red marker)
  - All player guesses (blue markers with names)
  - Scoring radius circle (0.5 units)

### Scoring System

- **Perfect Score**: +2 points for guesses within 0.5 units of the correct location
- **Distance Based**: Linear scoring based on distance for farther guesses
- **Map Freedom**: No restrictions on which map to use for guessing

### Technical Features

- Next.js with TypeScript
- React-Leaflet for interactive maps
- Colyseus for real-time multiplayer
- FFXIV coordinate system integration
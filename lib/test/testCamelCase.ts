// Test file for camelCase conversion
import { toCamelCase } from '../utils/mapImageUtils';

// Test cases
console.log('Testing camelCase conversion:');
console.log('New Gridania ->', toCamelCase('New Gridania')); // Expected: newGridania
console.log('The Black Shroud ->', toCamelCase('The Black Shroud')); // Expected: theBlackShroud
console.log('Central Thanalan ->', toCamelCase('Central Thanalan')); // Expected: centralThanalan
console.log('Limsa Lominsa Upper Decks ->', toCamelCase('Limsa Lominsa Upper Decks')); // Expected: limsaLominsaUpperDecks
console.log('Old Gridania ->', toCamelCase('Old Gridania')); // Expected: oldGridania

export {};
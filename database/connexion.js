import * as SQLite from 'expo-sqlite';

// Garde la promesse d'ouverture pour n'ouvrir la base qu'une seule fois[cite: 43]
let dbPromise = null;

export const getDb = () => {
  if (!dbPromise) {
    // Ouvre ou crée le fichier SQLite local de la boutique d'or[cite: 43]
    dbPromise = SQLite.openDatabaseAsync('boutique_or.db');
  }
  return dbPromise;
};
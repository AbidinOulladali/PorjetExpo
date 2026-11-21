import { getDb } from './connexion';

// Image distante par défaut en cas d'absence d'URL ou d'échec de chargement
export const IMAGE_PAR_DEFAUT =
  'https://i.shgcdn.com/127d4978-0cb4-4dfa-9ab3-62486a3c18ca/-/format/auto/-/preview/3000x3000/-/quality/lighter/';

// Images distantes associées à chaque catégorie de bijoux en or
export const IMAGES_PAR_CATEGORIE = {
  Bagues:
    'https://image3.nihaojewelry.com/fit-in/800x800/product/2025/6/16/1934451893636042752/Retro-Geometric-Jewelry-Set-For-Women-In-201-Stainless-Steel-1-Set-Suitable-For-All-Seasons-0.jpg',
  Colliers:
    'https://image3.nihaojewelry.com/fit-in/800x800/product/2025/6/16/1934451893636042752/Retro-Geometric-Jewelry-Set-For-Women-In-201-Stainless-Steel-1-Set-Suitable-For-All-Seasons-0.jpg',
  Bracelets:
    'https://cdn.gemmyo.com/media/image/47/94/4913939de2cee516d5fea1925102.jpg',
  "Boucles d'oreilles":
    'https://cdn.gemmyo.com/media/image/47/94/4913939de2cee516d5fea1925102.jpg',
  'Parures / Lingots':
    'https://i.shgcdn.com/127d4978-0cb4-4dfa-9ab3-62486a3c18ca/-/format/auto/-/preview/3000x3000/-/quality/lighter/',
};

// 25 bijoux initiaux : [nom, categorie, carat, poids_grammes, prix, stock, image_url]
const BIJOUX_DE_DEPART = [
  ['Bague Solitaire Or 18K', 'Bagues', '18K', 3.4, 295, 6, IMAGES_PAR_CATEGORIE.Bagues],
  ['Alliance Classique Polie', 'Bagues', '18K', 2.8, 240, 10, IMAGES_PAR_CATEGORIE.Bagues],
  ['Bague Chevalière Royale', 'Bagues', '21K', 6.2, 560, 3, IMAGES_PAR_CATEGORIE.Bagues],
  ['Bague Tressée Orientale', 'Bagues', '21K', 4.5, 410, 0, IMAGES_PAR_CATEGORIE.Bagues],
  ['Bague Émeraude Sertie', 'Bagues', '18K', 3.9, 365, 4, IMAGES_PAR_CATEGORIE.Bagues],

  ['Collier Maille Forçat Fin', 'Colliers', '18K', 5.1, 435, 7, IMAGES_PAR_CATEGORIE.Colliers],
  ['Chaîne Grain de Café', 'Colliers', '18K', 8.4, 690, 2, IMAGES_PAR_CATEGORIE.Colliers],
  ['Pendentif Soleil d’Or', 'Colliers', '24K', 4.0, 420, 5, IMAGES_PAR_CATEGORIE.Colliers],
  ['Collier Plastron Artisanal', 'Colliers', '21K', 14.2, 1240, 0, IMAGES_PAR_CATEGORIE.Colliers],
  ['Sautoir Perles & Or', 'Colliers', '18K', 6.7, 575, 4, IMAGES_PAR_CATEGORIE.Colliers],

  ['Jonc Rigide Martelé', 'Bracelets', '18K', 9.5, 780, 5, IMAGES_PAR_CATEGORIE.Bracelets],
  ['Bracelet Gourmette Homme', 'Bracelets', '18K', 12.0, 960, 3, IMAGES_PAR_CATEGORIE.Bracelets],
  ['Bracelet Chaînette Cœurs', 'Bracelets', '18K', 3.2, 285, 8, IMAGES_PAR_CATEGORIE.Bracelets],
  ['Manchette Sculptée Or', 'Bracelets', '21K', 16.5, 1420, 1, IMAGES_PAR_CATEGORIE.Bracelets],
  ['Bracelet Jonc Souple', 'Bracelets', '18K', 7.1, 590, 0, IMAGES_PAR_CATEGORIE.Bracelets],

  ['Créoles Tubes 30mm', "Boucles d'oreilles", '18K', 3.8, 325, 9, IMAGES_PAR_CATEGORIE["Boucles d'oreilles"]],
  ['Puces Diamantées Or Jaune', "Boucles d'oreilles", '18K', 1.9, 210, 12, IMAGES_PAR_CATEGORIE["Boucles d'oreilles"]],
  ['Pendants Gouttes Ciselées', "Boucles d'oreilles", '21K', 4.6, 415, 4, IMAGES_PAR_CATEGORIE["Boucles d'oreilles"]],
  ['Créoles Torsadées', "Boucles d'oreilles", '18K', 2.7, 235, 0, IMAGES_PAR_CATEGORIE["Boucles d'oreilles"]],
  ['Puces Étoile d’Or', "Boucles d'oreilles", '24K', 2.2, 245, 6, IMAGES_PAR_CATEGORIE["Boucles d'oreilles"]],

  ['Parure Mariage Impériale', 'Parures / Lingots', '21K', 28.0, 2390, 2, IMAGES_PAR_CATEGORIE['Parures / Lingots']],
  ['Lingotin Certifié 5g', 'Parures / Lingots', '24K', 5.0, 510, 15, IMAGES_PAR_CATEGORIE['Parures / Lingots']],
  ['Lingotin Certifié 10g', 'Parures / Lingots', '24K', 10.0, 995, 8, IMAGES_PAR_CATEGORIE['Parures / Lingots']],
  ['Parure Élégance Satinée', 'Parures / Lingots', '18K', 15.4, 1280, 3, IMAGES_PAR_CATEGORIE['Parures / Lingots']],
  ['Pièce d’Or Investissement 2g', 'Parures / Lingots', '24K', 2.0, 215, 0, IMAGES_PAR_CATEGORIE['Parures / Lingots']],
];

// Garde la promesse d'initialisation en cours pour éviter les appels parallèles
let initBijouxPromise = null;

// Crée la table bijoux et insère les 25 articles uniquement si elle est vide
export const initBijoux = async () => {
  if (initBijouxPromise) {
    return initBijouxPromise;
  }

  initBijouxPromise = (async () => {
    const db = await getDb();

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS bijoux (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        categorie TEXT NOT NULL,
        carat TEXT NOT NULL DEFAULT '18K',
        poids_grammes REAL NOT NULL DEFAULT 3.0,
        prix REAL NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        image_url TEXT
      );
    `);

    // Ajoute la colonne image_url si la table existait déjà sans cette colonne
    try {
      await db.execAsync('ALTER TABLE bijoux ADD COLUMN image_url TEXT;');
    } catch {
      // Colonne déjà présente
    }

    const ligneCompte = await db.getFirstAsync('SELECT COUNT(*) AS n FROM bijoux');
    const n = ligneCompte?.n ?? 0;
    if (n > 0) return;

    // Insertion séquentielle sécurisée pour éviter les transactions imbriquées
    for (const [nom, categorie, carat, poids_grammes, prix, stock, image_url] of BIJOUX_DE_DEPART) {
      await db.runAsync(
        `INSERT INTO bijoux (nom, categorie, carat, poids_grammes, prix, stock, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nom, categorie, carat, poids_grammes, prix, stock, image_url]
      );
    }
  })().finally(() => {
    initBijouxPromise = null;
  });

  return initBijouxPromise;
};

// Filtre commun pour la liste paginée et le comptage total
const FILTRE = 'nom LIKE ? AND (? IS NULL OR categorie = ?)';
const parametresFiltre = (recherche, categorie) => [
  `%${recherche.trim()}%`,
  categorie,
  categorie,
];

// Récupère une page de bijoux avec recherche, filtre par catégorie et pagination
export const listerBijoux = async ({
  recherche = '',
  categorie = null,
  limite = -1,
  decalage = 0,
} = {}) => {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT id, nom, categorie, carat, poids_grammes, prix, stock, image_url
     FROM bijoux
     WHERE ${FILTRE}
     ORDER BY nom, id
     LIMIT ? OFFSET ?`,
    [...parametresFiltre(recherche, categorie), limite, decalage]
  );
};

// Compte le nombre total de bijoux correspondant aux filtres actifs
export const compterBijoux = async ({ recherche = '', categorie = null } = {}) => {
  const db = await getDb();
  const ligne = await db.getFirstAsync(
    `SELECT COUNT(*) AS n FROM bijoux WHERE ${FILTRE}`,
    parametresFiltre(recherche, categorie)
  );
  return ligne?.n ?? 0;
};

// Récupère la liste des catégories distinctes
export const listerCategories = async () => {
  const db = await getDb();
  const lignes = await db.getAllAsync('SELECT DISTINCT categorie FROM bijoux ORDER BY categorie');
  return lignes.map((ligne) => ligne.categorie);
};

// Ajoute un nouveau bijou dans la table bijoux
export const insererBijou = async ({
  nom,
  categorie,
  carat = '18K',
  poids_grammes = 3.5,
  prix,
  stock,
  image_url = '',
}) => {
  const db = await getDb();
  const lienPropre =
    (image_url || '').trim() ||
    IMAGES_PAR_CATEGORIE[categorie] ||
    IMAGE_PAR_DEFAUT;

  const resultat = await db.runAsync(
    `INSERT INTO bijoux (nom, categorie, carat, poids_grammes, prix, stock, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nom.trim(), categorie, carat, Number(poids_grammes), Number(prix), Number(stock), lienPropre]
  );
  return resultat.lastInsertRowId;
};

// Récupère uniquement les bijoux en rupture de stock (stock <= 0)
export const listerBijouxEnRupture = async () => {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT id, nom, categorie, carat, poids_grammes, prix, stock, image_url
     FROM bijoux
     WHERE stock <= 0
     ORDER BY nom, id`
  );
};

// Calcule les statistiques globales et par catégorie du catalogue
export const obtenirStatistiquesBijoux = async () => {
  const db = await getDb();
  const stats = await db.getFirstAsync(`
    SELECT
      COUNT(*) AS total_references,
      COALESCE(SUM(stock), 0) AS total_pieces,
      SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END) AS total_rupture,
      COALESCE(SUM(prix * stock), 0) AS valeur_stock
    FROM bijoux
  `);

  const parCategorie = await db.getAllAsync(`
    SELECT
      categorie,
      COUNT(*) AS references_count,
      COALESCE(SUM(stock), 0) AS pieces_count
    FROM bijoux
    GROUP BY categorie
    ORDER BY categorie
  `);

  return {
    totalReferences: stats?.total_references ?? 0,
    totalPieces: stats?.total_pieces ?? 0,
    totalRupture: stats?.total_rupture ?? 0,
    valeurStock: stats?.valeur_stock ?? 0,
    parCategorie,
  };
};

// Réinitialise la table bijoux et réinsère les 25 articles de départ
export const reinitialiserBijoux = async () => {
  const db = await getDb();
  await db.execAsync('DROP TABLE IF EXISTS bijoux;');
  await initBijoux();
};
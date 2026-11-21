// Point d'entrée unique pour accéder à la base depuis les écrans[cite: 11, 44]
export { initDb } from './schema';
export {
  insererUtilisateur,
  verifierConnexion,
  listerUtilisateurs,
} from './utilisateurs';
export {
  listerBijoux,
  compterBijoux,
  listerCategories,
  insererBijou,
  listerBijouxEnRupture,
  obtenirStatistiquesBijoux,
  reinitialiserBijoux,
  IMAGE_PAR_DEFAUT,
  IMAGES_PAR_CATEGORIE,
} from './bijoux';
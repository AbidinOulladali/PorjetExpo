// Expressions régulières pour vérifier l'email et le téléphone[cite: 41]
const REGEX_EMAIL = /^\S+@\S+\.\S+$/;
const REGEX_TELEPHONE = /^[0-9+]{8,15}$/;

// Chaque fonction renvoie un message d'erreur, ou null si la valeur est valide[cite: 41]
export const validerNom = (nom) =>
  String(nom || '').trim() ? null : 'Le nom est obligatoire.';

export const validerPrenom = (prenom) =>
  String(prenom || '').trim() ? null : 'Le prénom est obligatoire.';

export const validerEmail = (email) =>
  REGEX_EMAIL.test(String(email || '').trim()) ? null : 'Adresse email invalide.';

export const validerTelephone = (telephone) => {
  const tel = String(telephone || '').trim();
  // Le téléphone est facultatif : une chaîne vide est acceptée[cite: 39, 41]
  if (!tel) return null;
  return REGEX_TELEPHONE.test(tel) ? null : 'Téléphone invalide (8 à 15 caractères).';
};

export const validerMdp = (mdp) =>
  String(mdp || '').length >= 6 ? null : 'Le mot de passe doit contenir au moins 6 caractères.';

export const validerConfirmation = (mdp, confirmation) =>
  mdp === confirmation ? null : 'Les mots de passe ne correspondent pas.';

export const validerCgu = (cgu) =>
  cgu ? null : 'Vous devez accepter les CGU.';

// Valide tout le formulaire d'inscription et renvoie { valide, erreurs }[cite: 41]
export const validerFormulaire = (form, cgu) => {
  const resultats = {
    nom: validerNom(form.nom),
    prenom: validerPrenom(form.prenom),
    email: validerEmail(form.email),
    telephone: validerTelephone(form.telephone),
    mdp: validerMdp(form.mdp),
    confirmation: validerConfirmation(form.mdp, form.confirmation),
    cgu: validerCgu(cgu),
  };

  // On ne garde que les champs en erreur[cite: 41]
  const erreurs = Object.fromEntries(
    Object.entries(resultats).filter(([, message]) => message !== null)
  );

  return {
    valide: Object.keys(erreurs).length === 0,
    erreurs,
  };
};

// Validation pour l'écran de connexion[cite: 51]
export const validerMdpSaisi = (mdp) =>
  String(mdp || '').trim() ? null : 'Le mot de passe est obligatoire.';

export const validerFormulaireLogin = (form) => {
  const resultats = {
    email: validerEmail(form.email),
    mdp: validerMdpSaisi(form.mdp),
  };

  const erreurs = Object.fromEntries(
    Object.entries(resultats).filter(([, message]) => message !== null)
  );

  return {
    valide: Object.keys(erreurs).length === 0,
    erreurs,
  };
};

// Validation pour l'ajout d'un bijou dans la boutique d'or
export const validerFormulaireBijou = ({ nom, categorie, prix, stock, poids_grammes }) => {
  const erreurs = {};

  if (!String(nom || '').trim()) {
    erreurs.nom = 'Le nom du bijou est obligatoire.';
  }
  if (!String(categorie || '').trim()) {
    erreurs.categorie = 'La catégorie est obligatoire.';
  }

  const prixNum = Number(String(prix ?? '').replace(',', '.'));
  if (Number.isNaN(prixNum) || prixNum <= 0) {
    erreurs.prix = 'Entrez un prix supérieur à 0.';
  }

  const stockNum = Number(stock);
  if (!Number.isInteger(stockNum) || stockNum < 0) {
    erreurs.stock = 'Le stock doit être un entier supérieur ou égal à 0.';
  }

  const poidsNum = Number(String(poids_grammes ?? '').replace(',', '.'));
  if (Number.isNaN(poidsNum) || poidsNum <= 0) {
    erreurs.poids_grammes = 'Le poids en grammes doit être supérieur à 0.';
  }

  return {
    valide: Object.keys(erreurs).length === 0,
    erreurs,
  };
};
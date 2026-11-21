import { getDb } from './connexion';

// Insère un nouvel utilisateur dans la table utilisateurs[cite: 44]
export const insererUtilisateur = async ({
  nom,
  prenom,
  email,
  telephone,
  mdp,
  newsletter,
  cgu,
}) => {
  const db = await getDb();
  const nomPropre = String(nom || '').trim();
  const prenomPropre = String(prenom || '').trim();
  const emailPropre = String(email || '').trim().toLowerCase();
  const telPropre = String(telephone || '').trim() || null;

  try {
    // Requête paramétrée pour éviter l'injection SQL[cite: 44]
    const resultat = await db.runAsync(
      `INSERT INTO utilisateurs (nom, prenom, email, telephone, mdp, newsletter, cgu)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nomPropre,
        prenomPropre,
        emailPropre,
        telPropre,
        mdp,
        newsletter ? 1 : 0,
        cgu ? 1 : 0,
      ]
    );

    return {
      ok: true,
      utilisateur: {
        id: resultat.lastInsertRowId,
        nom: nomPropre,
        prenom: prenomPropre,
        email: emailPropre,
        telephone: telPropre || '',
        newsletter: newsletter ? 1 : 0,
        cgu: cgu ? 1 : 0,
      },
    };
  } catch (e) {
    const msg = String(e?.message || '');
    // Gère la contrainte UNIQUE sur l'adresse email[cite: 43, 45]
    if (msg.includes('UNIQUE')) {
      return { ok: false, erreur: 'Cet email est déjà utilisé.' };
    }
    return { ok: false, erreur: "Impossible d'enregistrer le compte." };
  }
};

// Vérifie l'email et le mot de passe sans renvoyer la colonne mdp[cite: 50]
export const verifierConnexion = async (email, mdp) => {
  const db = await getDb();
  const emailPropre = String(email || '').trim().toLowerCase();

  const utilisateur = await db.getFirstAsync(
    `SELECT id, nom, prenom, email, telephone, newsletter, cree_le
     FROM utilisateurs
     WHERE email = ? AND mdp = ?`,
    [emailPropre, mdp]
  );

  if (!utilisateur) {
    return { ok: false, erreur: 'Email ou mot de passe incorrect.' };
  }

  return { ok: true, utilisateur };
};

// Liste les utilisateurs (utile pour vérifier dans le terminal)[cite: 44, 46]
export const listerUtilisateurs = async () => {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT id, nom, prenom, email, telephone, newsletter, cree_le
     FROM utilisateurs
     ORDER BY id DESC`
  );
};
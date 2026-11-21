import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppStyles, COULEURS } from '../AppStyles';
import * as BijouxDb from '../database/bijoux';

// Catégories disponibles pour l'ajout d'un article
const CATEGORIES_ARTICLE = [
  { label: 'Snsla (Colliers)', valeur: 'Colliers' },
  { label: 'Bagues', valeur: 'Bagues' },
  { label: 'Bracelets', valeur: 'Bracelets' },
  { label: "Boucles d'oreilles", valeur: "Boucles d'oreilles" },
  { label: 'Parures / Lingots', valeur: 'Parures / Lingots' },
];

// Image par défaut selon la catégorie
const IMAGE_DE_SECOURS =
  'https://images.unsplash.com/photo-1617038220319-276d3f0a1432?auto=format&fit=crop&w=1200&q=80';

// Formate un prix en euros
const formaterPrix = (prix) =>
  `${Number(prix || 0).toFixed(2).replace('.', ',')} €`;

// Écran Dashboard Administrateur avec statistiques, commandes, reçus et ajout d'articles via modal
export default function AdminDashboardScreen({
  navigation,
  utilisateur,
  commandes = [],
  recus = [],
  articlesAjoutes = [],
  onAjouterArticle,
  onDeconnexion,
}) {
  // États du modal d'ajout d'article
  const [modalAjoutVisible, setModalAjoutVisible] = useState(false);
  const [nomArticle, setNomArticle] = useState('');
  const [categorieArticle, setCategorieArticle] = useState('Colliers');
  const [caratArticle, setCaratArticle] = useState('Or 21K');
  const [poidsArticle, setPoidsArticle] = useState('');
  const [prixArticle, setPrixArticle] = useState('');
  const [stockArticle, setStockArticle] = useState('');
  const [imageArticle, setImageArticle] = useState('');
  const [dernierAjoutInfo, setDernierAjoutInfo] = useState('');

  // Référence pour défiler facilement vers les statistiques ou les reçus
  const scrollAdminRef = useRef(null);

  // Vérifie si l'utilisateur courant a le rôle admin
  const estAdmin = utilisateur?.role === 'admin';

  useEffect(() => {
    if (dernierAjoutInfo) {
      scrollAdminRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [dernierAjoutInfo]);

  // Statistiques globales calculées avec useMemo
  const statistiques = useMemo(() => {
    const nbCommandes = commandes.length;
    const nbRecus = recus.length;

    const chiffreAffaires = recus.reduce(
      (somme, r) => somme + Number(r.totalMontant || 0),
      0
    );

    const poidsTotalVendu = recus.reduce(
      (somme, r) => somme + Number(r.poidsTotalGrammes || 0),
      0
    );

    const totalArticlesCatalogues = articlesAjoutes.length;

    return {
      nbCommandes,
      nbRecus,
      chiffreAffaires,
      poidsTotalVendu,
      totalArticlesCatalogues,
    };
  }, [articlesAjoutes.length, commandes.length, recus]);

  // Réinitialise les champs du formulaire modal
  const reinitialiserFormulaire = useCallback(() => {
    setNomArticle('');
    setCategorieArticle('Colliers');
    setCaratArticle('Or 21K');
    setPoidsArticle('');
    setPrixArticle('');
    setStockArticle('');
    setImageArticle('');
  }, []);

  // Enregistre le nouvel article dans SQLite (si disponible) et dans l'état partagé
  const enregistrerNouvelArticle = useCallback(async () => {
    const nomPropre = nomArticle.trim();
    const poidsNum = Number(String(poidsArticle).replace(',', '.'));
    const prixNum = Number(String(prixArticle).replace(',', '.'));
    const stockNum = parseInt(String(stockArticle), 10);

    if (!nomPropre || isNaN(poidsNum) || poidsNum <= 0 || isNaN(prixNum) || prixNum <= 0 || isNaN(stockNum) || stockNum < 0) {
      Alert.alert(
        'Informations incomplètes',
        'Veuillez saisir le nom, le poids (> 0), le prix (> 0) et le stock.'
      );
      return;
    }

    const imagesCat = BijouxDb.IMAGES_PAR_CATEGORIE || {};
    const urlFinale =
      imageArticle.trim() || imagesCat[categorieArticle] || IMAGE_DE_SECOURS;

    const nouvelArticle = {
      id: Date.now(),
      nom: nomPropre,
      categorie: categorieArticle,
      carat: caratArticle.trim() || 'Or 18K',
      poids_grammes: poidsNum,
      prix: prixNum,
      stock: stockNum,
      image_url: urlFinale,
    };

    try {
      const fnAjoutDb =
        BijouxDb.ajouterBijou ||
        BijouxDb.insererBijou ||
        BijouxDb.creerBijou;
      if (typeof fnAjoutDb === 'function') {
        await fnAjoutDb(nouvelArticle);
      }
    } catch (erreur) {
      console.log('Info ajout DB :', erreur);
    }

    if (onAjouterArticle) {
      onAjouterArticle(nouvelArticle);
    }

    setDernierAjoutInfo(`${nouvelArticle.nom} (${nouvelArticle.poids_grammes} g • ${formaterPrix(nouvelArticle.prix)})`);
    reinitialiserFormulaire();
    setModalAjoutVisible(false);
    Alert.alert('Article ajouté', `${nouvelArticle.nom} a été ajouté au catalogue.`);
  }, [
    caratArticle,
    categorieArticle,
    imageArticle,
    nomArticle,
    onAjouterArticle,
    poidsArticle,
    prixArticle,
    reinitialiserFormulaire,
    stockArticle,
  ]);

  if (!estAdmin) {
    return (
      <View style={AppStyles.conteneur}>
        <View style={styles.accesRefuse}>
          <Ionicons name="lock-closed-outline" size={42} color={COULEURS.orFonce} />
          <Text style={styles.titreRefuse}>Accès réservé à l'Administrateur</Text>
          <Text style={styles.texteRefuse}>
            Connectez-vous avec le compte administrateur pour accéder au tableau de bord.
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={styles.boutonActionDore}
          >
            <Ionicons name="log-in-outline" size={18} color="#1E1305" />
            <Text style={styles.texteBoutonDore}>Se connecter</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={AppStyles.conteneur}>
      <ScrollView
        ref={scrollAdminRef}
        contentContainerStyle={styles.contenu}
        showsVerticalScrollIndicator={false}
      >
        {/* Bannière Administrateur */}
        <View style={styles.banniereAdmin}>
          <View style={{ flex: 1 }}>
            <Text style={styles.badgeAdmin}>ESPACE ADMINISTRATEUR</Text>
            <Text style={styles.titreAdmin}>Tableau de Bord BoutiqueOr</Text>
            <Text style={styles.sousTitreAdmin}>
              Connecté : {utilisateur?.email}
            </Text>
          </View>

          <Pressable
            onPress={() => setModalAjoutVisible(true)}
            style={styles.boutonAjouterModal}
          >
            <Ionicons name="add-circle-outline" size={18} color="#1E1305" />
            <Text style={styles.texteAjouterModal}>Ajouter article</Text>
          </Pressable>
        </View>

        {/* Confirmation du dernier article ajouté */}
        {dernierAjoutInfo ? (
          <View style={styles.alerteAjout}>
            <Ionicons name="checkmark-circle" size={18} color={COULEURS.succes} />
            <Text style={styles.texteAlerteAjout} numberOfLines={2}>
              Dernier article ajouté : {dernierAjoutInfo}
            </Text>
          </View>
        ) : null}

        {/* Grille des statistiques principales */}
        <Text style={styles.titreSection}>Statistiques & Activité</Text>
        <View style={styles.grilleStats}>
          <View style={styles.carteStat}>
            <Ionicons name="receipt-outline" size={22} color={COULEURS.orFonce} />
            <Text style={styles.chiffreStat}>{statistiques.nbCommandes}</Text>
            <Text style={styles.labelStat}>Commandes</Text>
          </View>

          <View style={styles.carteStat}>
            <Ionicons name="document-text-outline" size={22} color={COULEURS.orFonce} />
            <Text style={styles.chiffreStat}>{statistiques.nbRecus}</Text>
            <Text style={styles.labelStat}>Reçus générés</Text>
          </View>

          <View style={styles.carteStat}>
            <Ionicons name="cash-outline" size={22} color={COULEURS.orFonce} />
            <Text style={styles.chiffreStat}>
              {formaterPrix(statistiques.chiffreAffaires)}
            </Text>
            <Text style={styles.labelStat}>Chiffre d'affaires</Text>
          </View>

          <View style={styles.carteStat}>
            <Ionicons name="scale-outline" size={22} color={COULEURS.orFonce} />
            <Text style={styles.chiffreStat}>
              {statistiques.poidsTotalVendu.toFixed(1)} g
            </Text>
            <Text style={styles.labelStat}>Or vendu (grammes)</Text>
          </View>
        </View>

        {/* Historique récent des reçus et commandes */}
        <View style={styles.carteHistorique}>
          <View style={styles.enteteHistorique}>
            <Text style={styles.titreSection}>Reçus récents ({recus.length})</Text>
            <Pressable onPress={() => navigation.navigate('Catalogue')}>
              <Text style={styles.lienCatalogue}>Voir catalogue</Text>
            </Pressable>
          </View>

          {recus.length === 0 ? (
            <Text style={styles.texteVide}>
              Aucune commande confirmée pour le moment. Les reçus apparaîtront ici dès
              qu'un client valide son panier.
            </Text>
          ) : (
            recus.map((recu) => (
              <View key={recu.reference} style={styles.ligneRecu}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.refRecu}>{recu.reference}</Text>
                  <Text style={styles.detailsRecu}>
                    {recu.clientNom} {recu.clientTelephone ? `• ${recu.clientTelephone}` : ''}
                  </Text>
                  <Text style={styles.dateRecu}>
                    {recu.dateHeure} • {recu.modePaiement} •{' '}
                    {Number(recu.poidsTotalGrammes || 0).toFixed(2)} g
                  </Text>
                </View>
                <Text style={styles.montantRecu}>
                  {formaterPrix(recu.totalMontant)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Bouton déconnexion administrateur */}
        <Pressable
          onPress={() => {
            if (onDeconnexion) onDeconnexion();
            navigation.navigate('Accueil');
          }}
          style={styles.boutonDeconnexion}
        >
          <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
          <Text style={styles.texteDeconnexion}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>

      {/* Modal d'ajout d'un nouvel article au catalogue */}
      <Modal
        visible={modalAjoutVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalAjoutVisible(false)}
      >
        <View style={styles.fondModal}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ width: '100%' }}
          >
            <View style={styles.carteModal}>
              <View style={styles.enteteModal}>
                <Text style={styles.titreModal}>Ajouter un nouvel article</Text>
                <Pressable
                  onPress={() => setModalAjoutVisible(false)}
                  style={styles.boutonFermerModal}
                >
                  <Ionicons name="close" size={20} color={COULEURS.texte} />
                </Pressable>
              </View>

              <ScrollView
                style={{ maxHeight: 430 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.labelChamp}>Nom du bijou</Text>
                <TextInput
                  value={nomArticle}
                  onChangeText={setNomArticle}
                  placeholder="Ex : Snsla Gourmette Or 21K"
                  placeholderTextColor={COULEURS.texteSecondaire}
                  style={AppStyles.input}
                />

                <Text style={[styles.labelChamp, { marginTop: 10 }]}>Catégorie</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
                >
                  {CATEGORIES_ARTICLE.map((cat) => {
                    const active = categorieArticle === cat.valeur;
                    return (
                      <Pressable
                        key={cat.valeur}
                        onPress={() => setCategorieArticle(cat.valeur)}
                        style={[
                          styles.puceCat,
                          active && styles.puceCatActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.textePuceCat,
                            active && styles.textePuceCatActive,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <View style={styles.ligneDeuxChamps}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.labelChamp, { marginTop: 10 }]}>Carat</Text>
                    <TextInput
                      value={caratArticle}
                      onChangeText={setCaratArticle}
                      placeholder="Or 21K"
                      placeholderTextColor={COULEURS.texteSecondaire}
                      style={AppStyles.input}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.labelChamp, { marginTop: 10 }]}>
                      Poids (grammes)
                    </Text>
                    <TextInput
                      value={poidsArticle}
                      onChangeText={setPoidsArticle}
                      placeholder="Ex : 7.5"
                      placeholderTextColor={COULEURS.texteSecondaire}
                      keyboardType="decimal-pad"
                      style={AppStyles.input}
                    />
                  </View>
                </View>

                <View style={styles.ligneDeuxChamps}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.labelChamp, { marginTop: 10 }]}>
                      Prix (€)
                    </Text>
                    <TextInput
                      value={prixArticle}
                      onChangeText={setPrixArticle}
                      placeholder="Ex : 540"
                      placeholderTextColor={COULEURS.texteSecondaire}
                      keyboardType="decimal-pad"
                      style={AppStyles.input}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.labelChamp, { marginTop: 10 }]}>Stock</Text>
                    <TextInput
                      value={stockArticle}
                      onChangeText={setStockArticle}
                      placeholder="Ex : 5"
                      placeholderTextColor={COULEURS.texteSecondaire}
                      keyboardType="number-pad"
                      style={AppStyles.input}
                    />
                  </View>
                </View>

                <Text style={[styles.labelChamp, { marginTop: 10 }]}>
                  URL de l'image (optionnel)
                </Text>
                <TextInput
                  value={imageArticle}
                  onChangeText={setImageArticle}
                  placeholder="https://..."
                  placeholderTextColor={COULEURS.texteSecondaire}
                  autoCapitalize="none"
                  style={AppStyles.input}
                />

                <Pressable
                  onPress={enregistrerNouvelArticle}
                  style={styles.boutonEnregistrerArticle}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color="#1E1305" />
                  <Text style={styles.texteEnregistrerArticle}>
                    Enregistrer dans le catalogue
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenu: {
    padding: 16,
    gap: 14,
    paddingBottom: 30,
  },
  banniereAdmin: {
    backgroundColor: '#2B1B07',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1,
    borderColor: '#F3C34F',
  },
  badgeAdmin: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F3C34F',
    letterSpacing: 0.8,
  },
  titreAdmin: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFDF7',
    marginTop: 2,
  },
  sousTitreAdmin: {
    fontSize: 12,
    color: '#F7E7BE',
    marginTop: 3,
  },
  boutonAjouterModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3C34F',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  texteAjouterModal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E1305',
  },
  alerteAjout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COULEURS.surface,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  texteAlerteAjout: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  titreSection: {
    fontSize: 15,
    fontWeight: '800',
    color: COULEURS.texte,
  },
  grilleStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  carteStat: {
    width: '48.4%',
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    padding: 14,
    gap: 4,
  },
  chiffreStat: {
    fontSize: 18,
    fontWeight: '800',
    color: COULEURS.texte,
    marginTop: 2,
  },
  labelStat: {
    fontSize: 12,
    color: COULEURS.texteSecondaire,
    fontWeight: '600',
  },
  carteHistorique: {
    backgroundColor: COULEURS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    padding: 14,
    gap: 10,
  },
  enteteHistorique: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lienCatalogue: {
    fontSize: 12,
    fontWeight: '800',
    color: COULEURS.orFonce,
  },
  texteVide: {
    fontSize: 13,
    color: COULEURS.texteSecondaire,
    lineHeight: 19,
  },
  ligneRecu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COULEURS.fond,
  },
  refRecu: {
    fontSize: 13,
    fontWeight: '800',
    color: COULEURS.texte,
  },
  detailsRecu: {
    fontSize: 12,
    color: COULEURS.texteSecondaire,
    marginTop: 2,
  },
  dateRecu: {
    fontSize: 11,
    color: COULEURS.orFonce,
    fontWeight: '700',
    marginTop: 2,
  },
  montantRecu: {
    fontSize: 14,
    fontWeight: '800',
    color: COULEURS.orFonce,
  },
  boutonDeconnexion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COULEURS.rupture || '#C62828',
    paddingVertical: 13,
    borderRadius: 14,
  },
  texteDeconnexion: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  accesRefuse: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 10,
  },
  titreRefuse: {
    fontSize: 18,
    fontWeight: '800',
    color: COULEURS.texte,
  },
  texteRefuse: {
    fontSize: 13,
    color: COULEURS.texteSecondaire,
    textAlign: 'center',
  },
  boutonActionDore: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3C34F',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  texteBoutonDore: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1305',
  },
  fondModal: {
    flex: 1,
    backgroundColor: 'rgba(18, 12, 4, 0.65)',
    justifyContent: 'flex-end',
  },
  carteModal: {
    backgroundColor: COULEURS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    borderTopWidth: 1,
    borderColor: COULEURS.bordure,
  },
  enteteModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COULEURS.bordure,
  },
  titreModal: {
    fontSize: 17,
    fontWeight: '800',
    color: COULEURS.texte,
  },
  boutonFermerModal: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COULEURS.fond,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  labelChamp: {
    fontSize: 12,
    fontWeight: '700',
    color: COULEURS.texte,
    marginBottom: 5,
  },
  puceCat: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: COULEURS.fond,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  puceCatActive: {
    backgroundColor: COULEURS.orFonce,
    borderColor: COULEURS.orFonce,
  },
  textePuceCat: {
    fontSize: 12,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  textePuceCatActive: {
    color: '#FFFFFF',
  },
  ligneDeuxChamps: {
    flexDirection: 'row',
    gap: 10,
  },
  boutonEnregistrerArticle: {
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F3C34F',
    paddingVertical: 13,
    borderRadius: 14,
  },
  texteEnregistrerArticle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1305',
  },
});
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
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

// Image de secours si l'URL du bijou est absente
const IMAGE_DE_SECOURS =
  'https://images.unsplash.com/photo-1617038220319-276d3f0a1432?auto=format&fit=crop&w=1200&q=80';

// Récupère les images par catégorie si elles sont exportées
const IMAGES_PAR_CATEGORIE = BijouxDb.IMAGES_PAR_CATEGORIE || {};

// Liste des catégories avec "Snsla" relié à "Colliers"
const CATEGORIES = [
  { label: 'Tout', valeur: null },
  { label: 'Snsla', valeur: 'Colliers' },
  { label: 'Bagues', valeur: 'Bagues' },
  { label: 'Bracelets', valeur: 'Bracelets' },
  { label: "Boucles d'oreilles", valeur: "Boucles d'oreilles" },
  { label: 'Parures / Lingots', valeur: 'Parures / Lingots' },
];

// Formate un prix en euros
const formaterPrix = (prix) => `${Number(prix || 0).toFixed(2).replace('.', ',')} €`;

// Initialise la base de données en toute sécurité selon les exports disponibles
async function executerInitDb() {
  const fnInit =
    BijouxDb.initDb ||
    BijouxDb.initialiserBase ||
    BijouxDb.initialiserDb ||
    BijouxDb.ouvrirBase;

  if (typeof fnInit === 'function') {
    await fnInit();
  }
}

// Charge les bijoux en toute sécurité selon les exports disponibles
async function executerListeBijoux({ categorie, recherche, limite = 50, decalage = 0 }) {
  const fnListe =
    BijouxDb.listerBijoux ||
    BijouxDb.recupererBijoux ||
    BijouxDb.getBijoux ||
    BijouxDb.lireBijoux;

  if (typeof fnListe === 'function') {
    const res = await fnListe({ categorie, recherche, limite, decalage });
    return Array.isArray(res) ? res : [];
  }

  // Repli local si aucune fonction de liste n'est exportée
  const baseSecours = [
    {
      id: 1,
      nom: 'Alliance Classique Polie',
      categorie: 'Bagues',
      carat: 'Or 18K',
      poids_grammes: 2.8,
      prix: 240,
      stock: 10,
      image_url: IMAGES_PAR_CATEGORIE.Bagues || IMAGE_DE_SECOURS,
    },
    {
      id: 2,
      nom: 'Snsla Maille Royale',
      categorie: 'Colliers',
      carat: 'Or 21K',
      poids_grammes: 8.5,
      prix: 680,
      stock: 5,
      image_url: IMAGES_PAR_CATEGORIE.Colliers || IMAGE_DE_SECOURS,
    },
    {
      id: 3,
      nom: 'Jonc Doré Cisélé',
      categorie: 'Bracelets',
      carat: 'Or 18K',
      poids_grammes: 6.1,
      prix: 490,
      stock: 4,
      image_url: IMAGES_PAR_CATEGORIE.Bracelets || IMAGE_DE_SECOURS,
    },
  ];

  return baseSecours.filter((item) => {
    const matchCat = !categorie || item.categorie === categorie;
    const q = (recherche || '').toLowerCase();
    const matchQ =
      !q ||
      item.nom.toLowerCase().includes(q) ||
      item.categorie.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
}

// Écran catalogue avec aperçu rapide du panier dans un modal en bas qu'on peut ouvrir et fermer
export default function CatalogueScreen({
  navigation,
  route,
  utilisateur,
  panier = [],
  categorieChoisie,
  onChoisirCategorie,
  onAjouterPanier,
  onModifierQuantite,
  onDemanderConnexion,
}) {
  const [bijoux, setBijoux] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [modalPanierVisible, setModalPanierVisible] = useState(false);
  const [categorieActive, setCategorieActive] = useState(
    categorieChoisie ?? route?.params?.categorie ?? null
  );

  // Synchronise la catégorie choisie depuis le menu ou l'accueil
  useEffect(() => {
    if (categorieChoisie !== undefined) {
      setCategorieActive(categorieChoisie);
    }
  }, [categorieChoisie]);

  useEffect(() => {
    if (route?.params && 'categorie' in route.params) {
      setCategorieActive(route.params.categorie ?? null);
    }
  }, [route?.params?.categorie]);

  // Charge les bijoux selon la catégorie et la recherche
  useEffect(() => {
    let actif = true;
    const charger = async () => {
      setChargement(true);
      try {
        await executerInitDb();
        const resultats = await executerListeBijoux({
          categorie: categorieActive,
          recherche: recherche.trim(),
          limite: 50,
          decalage: 0,
        });
        if (actif) setBijoux(resultats);
      } catch (e) {
        console.log('Erreur chargement catalogue :', e);
      } finally {
        if (actif) setChargement(false);
      }
    };
    charger();
    return () => {
      actif = false;
    };
  }, [categorieActive, recherche]);

  // Sélectionne une catégorie et met à jour l'état partagé
  const selectionnerCategorie = (valeur) => {
    setCategorieActive(valeur);
    if (onChoisirCategorie) onChoisirCategorie(valeur);
  };

  // Vérifie la connexion puis ajoute au panier et ouvre le modal du panier en bas
  const gererAjout = (bijou) => {
    if (Number(bijou.stock) <= 0) {
      Alert.alert('Rupture de stock', 'Ce bijou est actuellement indisponible.');
      return;
    }
    if (!utilisateur) {
      Alert.alert(
        'Connexion requise',
        'Connectez-vous pour ajouter des bijoux à votre panier.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Login',
            onPress: () =>
              onDemanderConnexion
                ? onDemanderConnexion('Catalogue')
                : navigation.navigate('Login'),
          },
        ]
      );
      return;
    }
    if (onAjouterPanier) {
      onAjouterPanier(bijou);
      setModalPanierVisible(true);
    }
  };

  // Calcule le nombre total d'articles et le montant total du panier
  const totalArticles = panier.reduce(
    (somme, item) => somme + Number(item.quantite || 0),
    0
  );
  const totalMontant = panier.reduce(
    (somme, item) => somme + Number(item.prix || 0) * Number(item.quantite || 0),
    0
  );

  // Affiche une carte produit dans le catalogue
  const renderBijou = ({ item }) => {
    const rupture = Number(item.stock) <= 0;
    const imageSecours =
      IMAGES_PAR_CATEGORIE[item.categorie] || IMAGE_DE_SECOURS;

    return (
      <View style={styles.carteBijou}>
        <Image
          source={{ uri: item.image_url || imageSecours }}
          style={styles.imageBijou}
          resizeMode="cover"
        />

        <View style={styles.infosBijou}>
          <Text style={styles.nomBijou} numberOfLines={1}>
            {item.nom}
          </Text>
          <Text style={styles.detailsBijou}>
            {item.categorie === 'Colliers' ? 'Snsla' : item.categorie} • {item.carat} •{' '}
            {item.poids_grammes}g
          </Text>

          <View style={styles.lignePrix}>
            <Text style={styles.prix}>{formaterPrix(item.prix)}</Text>
            <Text style={[styles.stock, rupture && styles.rupture]}>
              {rupture ? 'Rupture' : `Stock: ${item.stock}`}
            </Text>
          </View>

          <Pressable
            disabled={rupture}
            onPress={() => gererAjout(item)}
            style={({ pressed }) => [
              styles.boutonAjouter,
              rupture && styles.boutonDesactive,
              { opacity: pressed && !rupture ? 0.85 : 1 },
            ]}
          >
            <Ionicons name="cart-outline" size={16} color="#1E1305" />
            <Text style={styles.texteAjouter}>
              {rupture ? 'Rupture de stock' : 'Ajouter panier'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={AppStyles.conteneur}>
      {/* Barre de recherche et filtres par catégorie */}
      <View style={styles.zoneRecherche}>
        <View style={styles.champRecherche}>
          <Ionicons name="search-outline" size={18} color={COULEURS.texteSecondaire} />
          <TextInput
            value={recherche}
            onChangeText={setRecherche}
            placeholder="Rechercher un bijou..."
            placeholderTextColor={COULEURS.texteSecondaire}
            style={styles.inputRecherche}
          />
          {recherche.length > 0 && (
            <Pressable onPress={() => setRecherche('')}>
              <Ionicons name="close-circle" size={18} color={COULEURS.texteSecondaire} />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listeCategories}
        >
          {CATEGORIES.map((cat) => {
            const active = categorieActive === cat.valeur;
            return (
              <Pressable
                key={cat.label}
                onPress={() => selectionnerCategorie(cat.valeur)}
                style={[styles.puceCat, active && styles.puceCatActive]}
              >
                <Text style={[styles.texteCat, active && styles.texteCatActive]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Liste des bijoux */}
      {chargement ? (
        <ActivityIndicator
          size="large"
          color={COULEURS.orFonce}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={bijoux}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderBijou}
          contentContainerStyle={styles.listeContenu}
          ListEmptyComponent={
            <View style={styles.vide}>
              <Ionicons name="diamond-outline" size={40} color={COULEURS.orFonce} />
              <Text style={styles.texteVide}>Aucun bijou trouvé.</Text>
            </View>
          }
        />
      )}

      {/* Modal en bas pour voir le contenu du panier, modifier les quantités et le fermer */}
      <Modal
        visible={modalPanierVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalPanierVisible(false)}
      >
        <View style={styles.fondModal}>
          <Pressable
            style={styles.zoneFermerFond}
            onPress={() => setModalPanierVisible(false)}
          />

          <View style={styles.panneauBas}>
            <View style={styles.poigneeModal} />

            {/* En-tête du modal avec bouton fermer */}
            <View style={styles.enteteModal}>
              <View>
                <Text style={styles.titreModal}>Aperçu du Panier</Text>
                <Text style={styles.sousTitreModal}>
                  {totalArticles} article(s) • Total : {formaterPrix(totalMontant)}
                </Text>
              </View>

              <Pressable
                onPress={() => setModalPanierVisible(false)}
                style={styles.boutonFermerModal}
              >
                <Ionicons name="close" size={20} color={COULEURS.texte} />
              </Pressable>
            </View>

            {/* Liste des articles actuellement dans le panier */}
            <ScrollView
              style={styles.listeModal}
              showsVerticalScrollIndicator={false}
            >
              {panier.length === 0 ? (
                <Text style={styles.textePanierVide}>Votre panier est vide.</Text>
              ) : (
                panier.map((article) => (
                  <View key={article.id} style={styles.ligneArticleModal}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nomArticleModal} numberOfLines={1}>
                        {article.nom}
                      </Text>
                      <Text style={styles.prixArticleModal}>
                        {formaterPrix(Number(article.prix) * Number(article.quantite))}
                      </Text>
                    </View>

                    <View style={styles.controlesQte}>
                      <Pressable
                        onPress={() =>
                          onModifierQuantite && onModifierQuantite(article.id, -1)
                        }
                        style={styles.boutonQte}
                      >
                        <Ionicons name="remove" size={16} color={COULEURS.texte} />
                      </Pressable>

                      <Text style={styles.texteQte}>{article.quantite}</Text>

                      <Pressable
                        onPress={() =>
                          onModifierQuantite && onModifierQuantite(article.id, 1)
                        }
                        style={styles.boutonQte}
                      >
                        <Ionicons name="add" size={16} color={COULEURS.texte} />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Boutons en bas du modal : fermer ou ouvrir la page Panier */}
            <View style={styles.piedModal}>
              <Pressable
                onPress={() => setModalPanierVisible(false)}
                style={styles.boutonContinuer}
              >
                <Text style={styles.texteContinuer}>Fermer</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setModalPanierVisible(false);
                  navigation.navigate('Panier');
                }}
                style={styles.boutonAllerPanier}
              >
                <Text style={styles.texteAllerPanier}>Ouvrir le Panier</Text>
                <Ionicons name="arrow-forward" size={16} color="#1E1305" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  zoneRecherche: {
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: COULEURS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COULEURS.bordure,
  },
  champRecherche: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: COULEURS.fond,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  inputRecherche: {
    flex: 1,
    fontSize: 14,
    color: COULEURS.texte,
  },
  listeCategories: {
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  puceCat: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COULEURS.fond,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  puceCatActive: {
    backgroundColor: COULEURS.orFonce,
    borderColor: COULEURS.orFonce,
  },
  texteCat: {
    fontSize: 13,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  texteCatActive: {
    color: '#FFFFFF',
  },
  listeContenu: {
    padding: 14,
    gap: 12,
  },
  carteBijou: {
    flexDirection: 'row',
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    padding: 10,
    gap: 12,
    alignItems: 'center',
  },
  imageBijou: {
    width: 82,
    height: 82,
    borderRadius: 12,
    backgroundColor: COULEURS.orClair,
  },
  infosBijou: {
    flex: 1,
  },
  nomBijou: {
    fontSize: 15,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  detailsBijou: {
    fontSize: 12,
    color: COULEURS.texteSecondaire,
    marginTop: 2,
  },
  lignePrix: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  prix: {
    fontSize: 15,
    fontWeight: '800',
    color: COULEURS.orFonce,
  },
  stock: {
    fontSize: 12,
    fontWeight: '700',
    color: COULEURS.succes,
  },
  rupture: {
    color: COULEURS.rupture,
  },
  boutonAjouter: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F3C34F',
    paddingVertical: 8,
    borderRadius: 10,
  },
  boutonDesactive: {
    backgroundColor: '#D6CFC2',
  },
  texteAjouter: {
    color: '#1E1305',
    fontWeight: '800',
    fontSize: 13,
  },
  vide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  texteVide: {
    fontSize: 14,
    color: COULEURS.texteSecondaire,
    fontWeight: '600',
  },
  fondModal: {
    flex: 1,
    backgroundColor: 'rgba(18, 12, 4, 0.55)',
    justifyContent: 'flex-end',
  },
  zoneFermerFond: {
    flex: 1,
  },
  panneauBas: {
    backgroundColor: COULEURS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    maxHeight: '68%',
    borderTopWidth: 1,
    borderColor: COULEURS.bordure,
  },
  poigneeModal: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: COULEURS.bordure,
    marginBottom: 10,
  },
  enteteModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COULEURS.bordure,
  },
  titreModal: {
    fontSize: 17,
    fontWeight: '800',
    color: COULEURS.texte,
  },
  sousTitreModal: {
    fontSize: 12,
    color: COULEURS.orFonce,
    fontWeight: '700',
    marginTop: 2,
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
  listeModal: {
    marginVertical: 10,
  },
  textePanierVide: {
    textAlign: 'center',
    color: COULEURS.texteSecondaire,
    paddingVertical: 20,
  },
  ligneArticleModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COULEURS.fond,
    gap: 10,
  },
  nomArticleModal: {
    fontSize: 14,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  prixArticleModal: {
    fontSize: 12,
    fontWeight: '700',
    color: COULEURS.orFonce,
    marginTop: 2,
  },
  controlesQte: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  boutonQte: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COULEURS.orClair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texteQte: {
    fontSize: 14,
    fontWeight: '800',
    color: COULEURS.texte,
    minWidth: 18,
    textAlign: 'center',
  },
  piedModal: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  boutonContinuer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COULEURS.fond,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texteContinuer: {
    fontSize: 13,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  boutonAllerPanier: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3C34F',
  },
  texteAllerPanier: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1305',
  },
});
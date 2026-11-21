import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EcranAvecFond from '../components/EcranAvecFond';
import ImageBijouDistant from '../components/ImageBijouDistant';
import { AppStyles, COULEURS } from '../AppStyles';
import { BijouxStyles } from './BijouxStyles';
import { validerFormulaireBijou } from '../utils/validation';
import {
  compterBijoux,
  initDb,
  insererBijou,
  listerBijoux,
  listerCategories,
} from '../database';

// Nombre de bijoux chargés par page[cite: 29, 30]
const TAILLE_PAGE = 10;

// Formate un prix en euros avec deux décimales[cite: 16]
const formaterPrix = (prix) => `${Number(prix || 0).toFixed(2).replace('.', ',')} €`;

// Carte d'un bijou affichée dans la FlatList[cite: 16]
const CarteBijou = ({ bijou }) => {
  const estEnRupture = Number(bijou.stock) <= 0;

  return (
    <View style={BijouxStyles.carteBijou}>
      {/* Image distante du bijou avec repli automatique */}
      <ImageBijouDistant uri={bijou.image_url} style={BijouxStyles.imageBijou} />

      <View style={BijouxStyles.infosBijou}>
        <Text style={BijouxStyles.nomBijou} numberOfLines={1}>
          {bijou.nom}
        </Text>
        <Text style={BijouxStyles.metaBijou}>
          {bijou.categorie} • Or {bijou.carat} • {bijou.poids_grammes} g
        </Text>

        <View style={BijouxStyles.basCarte}>
          <Text style={BijouxStyles.prixBijou}>{formaterPrix(bijou.prix)}</Text>
          <View style={[BijouxStyles.badgeStock, estEnRupture && BijouxStyles.badgeRupture]}>
            <Text style={[BijouxStyles.texteStock, estEnRupture && BijouxStyles.texteRupture]}>
              {estEnRupture ? 'En rupture' : `Stock: ${bijou.stock}`}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Séparateur vertical entre deux cartes de la liste[cite: 16, 18]
const Separateur = () => <View style={BijouxStyles.separateur} />;

const FORMULAIRE_BIJOU_VIDE = {
  nom: '',
  categorie: 'Bagues',
  carat: '18K',
  poids_grammes: '3.5',
  prix: '',
  stock: '5',
  image_url: '',
};

export default function BijouxScreen({ utilisateur }) {
  // États de la liste, des filtres et de la pagination[cite: 23, 30]
  const [bijoux, setBijoux] = useState([]);
  const [categories, setCategories] = useState([null]);
  const [recherche, setRecherche] = useState('');
  const [categorie, setCategorie] = useState(null);
  const [version, setVersion] = useState(0);
  const [total, setTotal] = useState(0);

  // États d'affichage et de chargement[cite: 15, 20, 30]
  const [chargement, setChargement] = useState(true);
  const [rafraichissement, setRafraichissement] = useState(false);
  const [chargementPlus, setChargementPlus] = useState(false);
  const [erreur, setErreur] = useState(null);

  // États de la fenêtre modale d'ajout d'un bijou
  const [modalVisible, setModalVisible] = useState(false);
  const [formBijou, setFormBijou] = useState(FORMULAIRE_BIJOU_VIDE);
  const [erreursBijou, setErreursBijou] = useState({});
  const [enregistrement, setEnregistrement] = useState(false);

  // Compteur pour ignorer les réponses obsolètes lors d'un changement de filtre[cite: 30, 31]
  const generation = useRef(0);

  // Charge les catégories une seule fois au montage[cite: 23]
  useEffect(() => {
    initDb()
      .then(listerCategories)
      .then((liste) => setCategories([null, ...liste]))
      .catch((e) => console.log('Erreur catégories:', e));
  }, []);

  // Recharge la première page dès que la recherche, la catégorie ou version change[cite: 23, 30]
  useEffect(() => {
    let actuel = true;
    generation.current += 1;

    const lire = async () => {
      try {
        await initDb();
        const [lignes, nombre] = await Promise.all([
          listerBijoux({
            recherche,
            categorie,
            limite: TAILLE_PAGE,
            decalage: 0,
          }),
          compterBijoux({ recherche, categorie }),
        ]);

        if (actuel) {
          setBijoux(lignes);
          setTotal(nombre);
          setErreur(null);
        }
      } catch (e) {
        console.log(e);
        if (actuel) {
          setErreur('Impossible de charger les bijoux.');
        }
      } finally {
        if (actuel) {
          setChargement(false);
          setRafraichissement(false);
        }
      }
    };

    lire();
    return () => {
      actuel = false;
    };
  }, [recherche, categorie, version]);

  // Fonctions de rechargement et de rafraîchissement[cite: 20, 23]
  const recharger = () => setVersion((v) => v + 1);

  const reessayer = () => {
    setChargement(true);
    recharger();
  };

  const rafraichir = () => {
    setRafraichissement(true);
    recharger();
  };

  // Charge la page suivante lorsque l'utilisateur approche de la fin de la liste[cite: 31]
  const chargerPlus = async () => {
    if (chargementPlus || bijoux.length >= total) return;

    const lecture = generation.current;
    setChargementPlus(true);

    try {
      const suite = await listerBijoux({
        recherche,
        categorie,
        limite: TAILLE_PAGE,
        decalage: bijoux.length,
      });

      // Ignore la page si un nouveau filtre a été lancé entre-temps[cite: 31]
      if (lecture !== generation.current) return;

      setBijoux((actuels) => [...actuels, ...suite]);
    } catch (e) {
      console.log(e);
    } finally {
      setChargementPlus(false);
    }
  };

  // Met à jour un champ du formulaire d'ajout de bijou
  const majBijou = (champ, valeur) => {
    setFormBijou((prev) => ({ ...prev, [champ]: valeur }));
  };

  // Enregistre le nouveau bijou dans SQLite puis recharge la liste[cite: 20, 23]
  const enregistrerBijou = async () => {
    const check = validerFormulaireBijou(formBijou);
    setErreursBijou(check.erreurs);
    if (!check.valide) return;

    setEnregistrement(true);
    try {
      await insererBijou({
        ...formBijou,
        prix: Number(String(formBijou.prix).replace(',', '.')),
        stock: Number(formBijou.stock),
        poids_grammes: Number(String(formBijou.poids_grammes).replace(',', '.')),
      });

      setModalVisible(false);
      setFormBijou(FORMULAIRE_BIJOU_VIDE);
      setErreursBijou({});
      recharger();
      Alert.alert('Succès', 'Le bijou a été ajouté au catalogue.');
    } catch (e) {
      console.log(e);
      Alert.alert('Erreur', "Impossible d'ajouter ce bijou.");
    } finally {
      setEnregistrement(false);
    }
  };

  // État de chargement initial[cite: 15, 18]
  if (chargement) {
    return (
      <EcranAvecFond>
        <View style={BijouxStyles.centreEtat}>
          <ActivityIndicator size="large" color={COULEURS.orFonce} />
          <Text style={[AppStyles.sousTitre, { marginTop: 10 }]}>
            Chargement du catalogue d'or...
          </Text>
        </View>
      </EcranAvecFond>
    );
  }

  // État d'erreur avec bouton Réessayer[cite: 15, 18, 23]
  if (erreur) {
    return (
      <EcranAvecFond>
        <View style={BijouxStyles.centreEtat}>
          <Text style={[AppStyles.texteErreur, { fontSize: 14, textAlign: 'center' }]}>
            {erreur}
          </Text>
          <Pressable
            onPress={reessayer}
            style={({ pressed }) => [
              AppStyles.boutonPrimaire,
              { marginTop: 14, opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Text style={AppStyles.texteBoutonPrimaire}>Réessayer</Text>
          </Pressable>
        </View>
      </EcranAvecFond>
    );
  }

  const filtreActif = recherche.trim() !== '' || categorie !== null;

  return (
    <EcranAvecFond>
      {/* En-tête fixe avec compteur, utilisateur et barre de recherche[cite: 24, 31, 33] */}
      <View style={BijouxStyles.enteteFixe}>
        <View style={BijouxStyles.ligneTitre}>
          <View style={{ flex: 1 }}>
            <Text style={AppStyles.titrePrincipal}>Catalogue d'Or</Text>
            <Text style={AppStyles.sousTitre}>
              {bijoux.length} / {total} bijou(x)
              {utilisateur ? ` • ${utilisateur.prenom}` : ''}
            </Text>
          </View>

          <Pressable
            onPress={() => setModalVisible(true)}
            style={({ pressed }) => [
              AppStyles.boutonPrimaire,
              { paddingVertical: 10, paddingHorizontal: 12, opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={[AppStyles.texteBoutonPrimaire, { fontSize: 13 }]}>Ajouter</Text>
          </Pressable>
        </View>

        <View style={BijouxStyles.zoneRecherche}>
          <TextInput
            value={recherche}
            onChangeText={setRecherche}
            placeholder="Rechercher un bijou (ex: Bague, Collier...)"
            placeholderTextColor={COULEURS.texteSecondaire}
            autoCorrect={false}
            style={AppStyles.input}
          />
        </View>
      </View>

      {/* Liste horizontale des catégories[cite: 24] */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        extraData={categorie}
        keyExtractor={(c) => c ?? 'toutes'}
        style={BijouxStyles.listePuces}
        contentContainerStyle={BijouxStyles.conteneurPuces}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item: c }) => {
          const active = categorie === c;
          return (
            <Pressable
              onPress={() => setCategorie(c)}
              style={[BijouxStyles.puce, active && BijouxStyles.puceActive]}
            >
              <Text style={[BijouxStyles.textePuce, active && BijouxStyles.textePuceActive]}>
                {c ?? 'Toutes'}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Liste principale des bijoux avec pagination et tirer pour rafraîchir[cite: 20, 31] */}
      <FlatList
        data={bijoux}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <CarteBijou bijou={item} />}
        ItemSeparatorComponent={Separateur}
        contentContainerStyle={BijouxStyles.listeBijoux}
        refreshing={rafraichissement}
        onRefresh={rafraichir}
        onEndReached={chargerPlus}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={BijouxStyles.texteVide}>
            {filtreActif ? 'Aucun bijou ne correspond à votre filtre.' : 'Aucun bijou à afficher.'}
          </Text>
        }
        ListFooterComponent={
          chargementPlus ? (
            <View style={BijouxStyles.piedPagination}>
              <ActivityIndicator size="small" color={COULEURS.orFonce} />
            </View>
          ) : null
        }
      />

      {/* Fenêtre modale d'ajout d'un nouveau bijou */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={BijouxStyles.fondModal}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={BijouxStyles.carteModal}>
              <ScrollView keyboardShouldPersistTaps="handled">
                <Text style={AppStyles.titrePrincipal}>Ajouter un bijou</Text>
                <Text style={[AppStyles.sousTitre, { marginBottom: 12 }]}>
                  Nouvelle pièce dans la boutique d'or
                </Text>

                <View style={{ marginBottom: 10 }}>
                  <Text style={AppStyles.label}>Nom du bijou *</Text>
                  <TextInput
                    value={formBijou.nom}
                    onChangeText={(t) => majBijou('nom', t)}
                    placeholder="Ex: Bague Or 18K"
                    placeholderTextColor={COULEURS.texteSecondaire}
                    style={[AppStyles.input, erreursBijou.nom && AppStyles.inputErreur]}
                  />
                  {erreursBijou.nom ? (
                    <Text style={AppStyles.texteErreur}>{erreursBijou.nom}</Text>
                  ) : null}
                </View>

                <View style={{ marginBottom: 10 }}>
                  <Text style={AppStyles.label}>Catégorie *</Text>
                  <TextInput
                    value={formBijou.categorie}
                    onChangeText={(t) => majBijou('categorie', t)}
                    placeholder="Bagues, Colliers, Bracelets..."
                    placeholderTextColor={COULEURS.texteSecondaire}
                    style={[AppStyles.input, erreursBijou.categorie && AppStyles.inputErreur]}
                  />
                  {erreursBijou.categorie ? (
                    <Text style={AppStyles.texteErreur}>{erreursBijou.categorie}</Text>
                  ) : null}
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={AppStyles.label}>Carat</Text>
                    <TextInput
                      value={formBijou.carat}
                      onChangeText={(t) => majBijou('carat', t)}
                      placeholder="18K / 21K / 24K"
                      placeholderTextColor={COULEURS.texteSecondaire}
                      style={AppStyles.input}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={AppStyles.label}>Poids (g) *</Text>
                    <TextInput
                      value={formBijou.poids_grammes}
                      onChangeText={(t) => majBijou('poids_grammes', t)}
                      keyboardType="decimal-pad"
                      placeholder="3.5"
                      placeholderTextColor={COULEURS.texteSecondaire}
                      style={[
                        AppStyles.input,
                        erreursBijou.poids_grammes && AppStyles.inputErreur,
                      ]}
                    />
                  </View>
                </View>
                {erreursBijou.poids_grammes ? (
                  <Text style={AppStyles.texteErreur}>{erreursBijou.poids_grammes}</Text>
                ) : null}

                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={AppStyles.label}>Prix (€) *</Text>
                    <TextInput
                      value={formBijou.prix}
                      onChangeText={(t) => majBijou('prix', t)}
                      keyboardType="decimal-pad"
                      placeholder="295"
                      placeholderTextColor={COULEURS.texteSecondaire}
                      style={[AppStyles.input, erreursBijou.prix && AppStyles.inputErreur]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={AppStyles.label}>Stock *</Text>
                    <TextInput
                      value={formBijou.stock}
                      onChangeText={(t) => majBijou('stock', t)}
                      keyboardType="number-pad"
                      placeholder="5"
                      placeholderTextColor={COULEURS.texteSecondaire}
                      style={[AppStyles.input, erreursBijou.stock && AppStyles.inputErreur]}
                    />
                  </View>
                </View>
                {erreursBijou.prix ? (
                  <Text style={AppStyles.texteErreur}>{erreursBijou.prix}</Text>
                ) : null}
                {erreursBijou.stock ? (
                  <Text style={AppStyles.texteErreur}>{erreursBijou.stock}</Text>
                ) : null}

                <View style={{ marginBottom: 6 }}>
                  <Text style={AppStyles.label}>URL image à distance (optionnel)</Text>
                  <TextInput
                    value={formBijou.image_url}
                    onChangeText={(t) => majBijou('image_url', t)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder="https://..."
                    placeholderTextColor={COULEURS.texteSecondaire}
                    style={AppStyles.input}
                  />
                </View>

                <View style={BijouxStyles.ligneActionsModal}>
                  <Pressable
                    onPress={() => setModalVisible(false)}
                    style={[AppStyles.boutonSecondaire, { flex: 1 }]}
                  >
                    <Text style={AppStyles.texteBoutonSecondaire}>Annuler</Text>
                  </Pressable>
                  <Pressable
                    disabled={enregistrement}
                    onPress={enregistrerBijou}
                    style={[AppStyles.boutonPrimaire, { flex: 1 }]}
                  >
                    <Text style={AppStyles.texteBoutonPrimaire}>
                      {enregistrement ? 'Ajout...' : 'Enregistrer'}
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </EcranAvecFond>
  );
}
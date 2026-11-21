import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import EcranFondDistant from '../components/EcranFondDistant';
import ImageBijouDistant from '../components/ImageBijouDistant';
import { AppStyles, COULEURS } from '../AppStyles';
import { BijouxStyles } from './BijouxStyles';
import { initDb, listerBijouxEnRupture } from '../database';

// Formate un prix en euros
const formaterPrix = (prix) => `${Number(prix || 0).toFixed(2).replace('.', ',')} €`;

// Affiche les bijoux dont le stock est épuisé
export default function RuptureScreen() {
  const [bijoux, setBijoux] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [rafraichissement, setRafraichissement] = useState(false);

  const chargerRuptures = async (estRafraichissement = false) => {
    if (estRafraichissement) {
      setRafraichissement(true);
    } else {
      setChargement(true);
    }

    try {
      await initDb();
      const lignes = await listerBijouxEnRupture();
      setBijoux(lignes);
    } catch (e) {
      console.log('Erreur chargement ruptures :', e);
    } finally {
      setChargement(false);
      setRafraichissement(false);
    }
  };

  // Recharge la liste à chaque ouverture de l'écran
  useFocusEffect(
    useCallback(() => {
      chargerRuptures(false);
    }, [])
  );

  return (
    <EcranFondDistant>
      <View style={BijouxStyles.enteteFixe}>
        <Text style={AppStyles.titrePrincipal}>Rupture de stock</Text>
        <Text style={AppStyles.sousTitre}>
          {bijoux.length} bijou(x) actuellement épuisé(s)
        </Text>
      </View>

      {chargement ? (
        <View style={BijouxStyles.centreEtat}>
          <ActivityIndicator size="large" color={COULEURS.orFonce} />
        </View>
      ) : (
        <FlatList
          data={bijoux}
          keyExtractor={(item) => String(item.id)}
          ItemSeparatorComponent={() => <View style={BijouxStyles.separateur} />}
          contentContainerStyle={BijouxStyles.listeBijoux}
          refreshing={rafraichissement}
          onRefresh={() => chargerRuptures(true)}
          ListEmptyComponent={
            <Text style={BijouxStyles.texteVide}>
              Aucun bijou en rupture de stock pour le moment.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={BijouxStyles.carteBijou}>
              <ImageBijouDistant uri={item.image_url} style={BijouxStyles.imageBijou} />
              <View style={BijouxStyles.infosBijou}>
                <Text style={BijouxStyles.nomBijou} numberOfLines={1}>
                  {item.nom}
                </Text>
                <Text style={BijouxStyles.metaBijou}>
                  {item.categorie === 'Colliers' ? 'Snsla' : item.categorie} • Or {item.carat} •{' '}
                  {item.poids_grammes} g
                </Text>
                <View style={BijouxStyles.basCarte}>
                  <Text style={BijouxStyles.prixBijou}>{formaterPrix(item.prix)}</Text>
                  <View style={[BijouxStyles.badgeStock, BijouxStyles.badgeRupture]}>
                    <Text style={[BijouxStyles.texteStock, BijouxStyles.texteRupture]}>
                      En rupture
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </EcranFondDistant>
  );
}
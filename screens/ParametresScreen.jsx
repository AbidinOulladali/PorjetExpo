import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EcranFondDistant from '../components/EcranFondDistant';
import { AppStyles, COULEURS } from '../AppStyles';
import { initDb, reinitialiserBijoux } from '../database';

// Écran des paramètres : réinitialisation du catalogue et gestion de la session
export default function ParametresScreen({ utilisateur, onDeconnexion, navigation }) {
  const [reinitEnCours, setReinitEnCours] = useState(false);

  const confirmerReinitialisation = () => {
    Alert.alert(
      'Réinitialiser le catalogue',
      'Voulez-vous restaurer les 25 bijoux initiaux dans SQLite ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            setReinitEnCours(true);
            try {
              await initDb();
              await reinitialiserBijoux();
              Alert.alert('Catalogue mis à jour', 'Les 25 bijoux ont été restaurés.');
            } catch (e) {
              console.log('Erreur réinitialisation :', e);
              Alert.alert('Erreur', 'Impossible de réinitialiser le catalogue.');
            } finally {
              setReinitEnCours(false);
            }
          },
        },
      ]
    );
  };

  return (
    <EcranFondDistant>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <View style={AppStyles.carte}>
          <Text style={AppStyles.titrePrincipal}>Paramètres</Text>
          <Text style={AppStyles.sousTitre}>Configuration de Boutique d'Or</Text>
        </View>

        <View style={AppStyles.carte}>
          <Text style={[AppStyles.label, { fontSize: 15 }]}>Base de données SQLite</Text>
          <Text style={[AppStyles.sousTitre, { marginBottom: 12 }]}>
            Restaure la liste initiale de 25 bijoux en or avec leurs catégories et images.
          </Text>

          <Pressable
            disabled={reinitEnCours}
            onPress={confirmerReinitialisation}
            style={({ pressed }) => [
              AppStyles.boutonSecondaire,
              { opacity: pressed || reinitEnCours ? 0.75 : 1 },
            ]}
          >
            <Ionicons name="refresh" size={18} color={COULEURS.orFonce} />
            <Text style={AppStyles.texteBoutonSecondaire}>
              {reinitEnCours ? 'Réinitialisation...' : 'Réinitialiser les 25 bijoux'}
            </Text>
          </Pressable>
        </View>

        <View style={AppStyles.carte}>
          <Text style={[AppStyles.label, { fontSize: 15 }]}>Session</Text>
          <Text style={[AppStyles.sousTitre, { marginBottom: 12 }]}>
            {utilisateur
              ? `Connecté en tant que ${utilisateur.prenom} ${utilisateur.nom}`
              : 'Aucun utilisateur connecté.'}
          </Text>

          {utilisateur ? (
            <Pressable
              onPress={() => {
                if (onDeconnexion) onDeconnexion();
                if (navigation) navigation.navigate('Login');
              }}
              style={({ pressed }) => [
                AppStyles.boutonPrimaire,
                { backgroundColor: COULEURS.erreur, opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
              <Text style={AppStyles.texteBoutonPrimaire}>Se déconnecter</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => navigation && navigation.navigate('Login')}
              style={({ pressed }) => [
                AppStyles.boutonPrimaire,
                { opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
              <Text style={AppStyles.texteBoutonPrimaire}>Se connecter</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </EcranFondDistant>
  );
}
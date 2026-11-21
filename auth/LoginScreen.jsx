import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
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

// Image dorée en arrière-plan
const IMAGE_FOND_DOREE =
  'https://images.unsplash.com/photo-1617038220319-276d3f0a1432?auto=format&fit=crop&w=1200&q=80';

// Écran de connexion client et administrateur
export default function LoginScreen({ navigation, onConnexionReussie }) {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [afficherMdp, setAfficherMdp] = useState(false);

  // Vérifie les identifiants et connecte l'utilisateur (ou l'admin)
  const seConnecter = useCallback(() => {
    const emailPropre = email.trim().toLowerCase();
    const mdpPropre = motDePasse.trim();

    if (!emailPropre || !mdpPropre) {
      Alert.alert(
        'Champs requis',
        'Veuillez saisir votre adresse email et votre mot de passe.'
      );
      return;
    }

    const estAdmin =
      emailPropre === 'admin@gmail.com' && mdpPropre === 'admin123';

    const partieAvantArobase = emailPropre.split('@')[0] || 'Client';
    const prenomFormate = estAdmin
      ? 'Administrateur'
      : partieAvantArobase.charAt(0).toUpperCase() +
        partieAvantArobase.slice(1);

    const compte = {
      id: estAdmin ? 'ADMIN-01' : Date.now(),
      prenom: prenomFormate,
      nom: estAdmin ? 'BoutiqueOr' : 'Client',
      telephone: estAdmin ? '+212 6 00 00 00 00' : '',
      email: emailPropre,
      role: estAdmin ? 'admin' : 'client',
    };

    if (onConnexionReussie) {
      onConnexionReussie(compte);
    }
  }, [email, motDePasse, onConnexionReussie]);

  return (
    <View style={styles.conteneur}>
      <Image
        source={{ uri: IMAGE_FOND_DOREE }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      <View style={styles.voile}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.contenu}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.enTete}>
              <View style={styles.cercleIcone}>
                <Ionicons name="diamond" size={28} color="#1E1305" />
              </View>
              <Text style={styles.titre}>Connexion</Text>
              <Text style={styles.sousTitre}>
                Connectez-vous à votre espace BoutiqueOr.
              </Text>
            </View>

            <View style={styles.carteFormulaire}>
              <Text style={styles.label}>Adresse email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="exemple@email.com"
                placeholderTextColor={COULEURS.texteSecondaire}
                keyboardType="email-address"
                autoCapitalize="none"
                style={AppStyles.input}
              />

              <Text style={[styles.label, { marginTop: 14 }]}>Mot de passe</Text>
              <View style={styles.zoneMdp}>
                <TextInput
                  value={motDePasse}
                  onChangeText={setMotDePasse}
                  placeholder="••••••••"
                  placeholderTextColor={COULEURS.texteSecondaire}
                  secureTextEntry={!afficherMdp}
                  style={[AppStyles.input, { flex: 1 }]}
                />
                <Pressable
                  onPress={() => setAfficherMdp((v) => !v)}
                  style={styles.boutonOeil}
                >
                  <Ionicons
                    name={afficherMdp ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COULEURS.texteSecondaire}
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={seConnecter}
                style={({ pressed }) => [
                  styles.boutonValider,
                  { opacity: pressed ? 0.86 : 1 },
                ]}
              >
                <Ionicons name="log-in-outline" size={18} color="#1E1305" />
                <Text style={styles.texteValider}>Se connecter</Text>
              </Pressable>

              <View style={styles.piedLien}>
                <Text style={styles.texteGris}>Nouveau client ?</Text>
                <Pressable onPress={() => navigation.navigate('Inscription')}>
                  <Text style={styles.lienDore}>Créer un compte</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: '#241706',
  },
  voile: {
    flex: 1,
    backgroundColor: 'rgba(42, 26, 6, 0.62)',
  },
  contenu: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 18,
  },
  enTete: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 6,
  },
  cercleIcone: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F3C34F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  titre: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFDF7',
  },
  sousTitre: {
    fontSize: 13,
    color: '#FFF4DA',
    textAlign: 'center',
    lineHeight: 19,
  },
  carteFormulaire: {
    backgroundColor: COULEURS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COULEURS.texte,
    marginBottom: 6,
  },
  zoneMdp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  boutonOeil: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: COULEURS.fond,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  boutonValider: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F3C34F',
    paddingVertical: 13,
    borderRadius: 14,
  },
  texteValider: {
    color: '#1E1305',
    fontSize: 15,
    fontWeight: '800',
  },
  piedLien: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  texteGris: {
    fontSize: 13,
    color: COULEURS.texteSecondaire,
  },
  lienDore: {
    fontSize: 13,
    fontWeight: '800',
    color: COULEURS.orFonce,
  },
});
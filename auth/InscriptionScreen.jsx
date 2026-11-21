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

// Image dorée en arrière-plan pour l'écran d'inscription
const IMAGE_FOND_DOREE =
  'https://images.unsplash.com/photo-1617038220319-276d3f0a1432?auto=format&fit=crop&w=1200&q=80';

// Écran d'inscription client avec numéro de téléphone pour Boutique d'Or
export default function InscriptionScreen({ navigation, onConnexionReussie }) {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmationMdp, setConfirmationMdp] = useState('');
  const [afficherMdp, setAfficherMdp] = useState(false);

  // Valide les champs et connecte l'utilisateur après création du compte
  const sInscrire = useCallback(() => {
    const prenomPropre = prenom.trim();
    const nomPropre = nom.trim();
    const telephonePropre = telephone.trim();
    const emailPropre = email.trim().toLowerCase();

    if (!prenomPropre || !telephonePropre || !emailPropre || !motDePasse.trim()) {
      Alert.alert(
        'Champs requis',
        'Veuillez renseigner votre prénom, numéro de téléphone, email et mot de passe.'
      );
      return;
    }

    const chiffresTel = telephonePropre.replace(/\D/g, '');
    if (chiffresTel.length < 8) {
      Alert.alert(
        'Numéro invalide',
        'Veuillez saisir un numéro de téléphone valide (au moins 8 chiffres).'
      );
      return;
    }

    if (!emailPropre.includes('@')) {
      Alert.alert('Email invalide', 'Veuillez saisir une adresse email valide.');
      return;
    }

    if (motDePasse.length < 4) {
      Alert.alert(
        'Mot de passe trop court',
        'Le mot de passe doit contenir au moins 4 caractères.'
      );
      return;
    }

    if (confirmationMdp && motDePasse !== confirmationMdp) {
      Alert.alert(
        'Confirmation différente',
        'Les deux mots de passe ne correspondent pas.'
      );
      return;
    }

    const estAdmin =
      emailPropre === 'admin@gmail.com' && motDePasse === 'admin123';

    const nouveauCompte = {
      id: Date.now(),
      prenom: prenomPropre,
      nom: nomPropre || 'Client',
      telephone: telephonePropre,
      email: emailPropre,
      role: estAdmin ? 'admin' : 'client',
    };

    if (onConnexionReussie) {
      onConnexionReussie(nouveauCompte);
    }
  }, [
    confirmationMdp,
    email,
    motDePasse,
    nom,
    onConnexionReussie,
    prenom,
    telephone,
  ]);

  return (
    <View style={styles.conteneur}>
      {/* Image de fond dorée distante */}
      <Image
        source={{ uri: IMAGE_FOND_DOREE }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Voile ambré pour garder la lisibilité */}
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
            {/* En-tête */}
            <View style={styles.enTete}>
              <View style={styles.cercleIcone}>
                <Ionicons name="person-add" size={26} color="#1E1305" />
              </View>
              <Text style={styles.titre}>Créer un compte</Text>
              <Text style={styles.sousTitre}>
                Rejoignez Boutique d'Or pour commander et recevoir vos reçus.
              </Text>
            </View>

            {/* Formulaire d'inscription */}
            <View style={styles.carteFormulaire}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                value={prenom}
                onChangeText={setPrenom}
                placeholder="Ex : Youssef"
                placeholderTextColor={COULEURS.texteSecondaire}
                style={AppStyles.input}
              />

              <Text style={[styles.label, { marginTop: 12 }]}>Nom</Text>
              <TextInput
                value={nom}
                onChangeText={setNom}
                placeholder="Ex : Benali"
                placeholderTextColor={COULEURS.texteSecondaire}
                style={AppStyles.input}
              />

              <Text style={[styles.label, { marginTop: 12 }]}>
                Numéro de téléphone
              </Text>
              <TextInput
                value={telephone}
                onChangeText={setTelephone}
                placeholder="Ex : +212 6 00 00 00 00"
                placeholderTextColor={COULEURS.texteSecondaire}
                keyboardType="phone-pad"
                style={AppStyles.input}
              />

              <Text style={[styles.label, { marginTop: 12 }]}>Adresse email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="exemple@email.com"
                placeholderTextColor={COULEURS.texteSecondaire}
                keyboardType="email-address"
                autoCapitalize="none"
                style={AppStyles.input}
              />

              <Text style={[styles.label, { marginTop: 12 }]}>Mot de passe</Text>
              <View style={styles.zoneMdp}>
                <TextInput
                  value={motDePasse}
                  onChangeText={setMotDePasse}
                  placeholder="Minimum 4 caractères"
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

              <Text style={[styles.label, { marginTop: 12 }]}>
                Confirmer le mot de passe
              </Text>
              <TextInput
                value={confirmationMdp}
                onChangeText={setConfirmationMdp}
                placeholder="Répétez le mot de passe"
                placeholderTextColor={COULEURS.texteSecondaire}
                secureTextEntry={!afficherMdp}
                style={AppStyles.input}
              />

              <Pressable
                onPress={sInscrire}
                style={({ pressed }) => [
                  styles.boutonValider,
                  { opacity: pressed ? 0.86 : 1 },
                ]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#1E1305"
                />
                <Text style={styles.texteValider}>S'inscrire</Text>
              </Pressable>

              <View style={styles.piedLien}>
                <Text style={styles.texteGris}>Vous avez déjà un compte ?</Text>
                <Pressable onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.lienDore}>Se connecter</Text>
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
    marginBottom: 18,
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
    letterSpacing: 0.4,
  },
  sousTitre: {
    fontSize: 13,
    color: '#FFF4DA',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 10,
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
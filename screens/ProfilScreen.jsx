import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppStyles, COULEURS } from '../AppStyles';

// Écran Profil client et administrateur avec déconnexion et accès direct au Dashboard Admin
export default function ProfilScreen({
  navigation,
  utilisateur,
  onDeconnexion,
}) {
  const [modalConfirmVisible, setModalConfirmVisible] = useState(false);

  // Vérifie si l'utilisateur connecté possède le rôle administrateur
  const estAdmin = useMemo(
    () =>
      utilisateur?.role === 'admin' ||
      utilisateur?.email?.trim().toLowerCase() === 'admin@gmail.com',
    [utilisateur]
  );

  // Calcule les initiales, le nom complet et l'email du compte connecté
  const infosClient = useMemo(() => {
    if (!utilisateur) return null;
    const prenom = (utilisateur.prenom || '').trim();
    const nom = (utilisateur.nom || '').trim();
    const nomComplet = `${prenom} ${nom}`.trim() || 'Client BoutiqueOr';
    const initiales =
      `${prenom.charAt(0) || ''}${nom.charAt(0) || ''}`.toUpperCase() || 'BO';

    return {
      nomComplet,
      initiales,
      email: utilisateur.email || 'client@boutiqueor.fr',
      telephone: utilisateur.telephone || '',
    };
  }, [utilisateur]);

  // Exécute la déconnexion et redirige vers l'accueil
  const executerDeconnexion = useCallback(() => {
    setModalConfirmVisible(false);
    if (onDeconnexion) {
      onDeconnexion();
    }
    navigation.navigate('Accueil');
  }, [navigation, onDeconnexion]);

  // Ouvre la modale de confirmation de déconnexion
  const demanderDeconnexion = useCallback(() => {
    setModalConfirmVisible(true);
  }, []);

  return (
    <View style={AppStyles.conteneur}>
      <ScrollView
        contentContainerStyle={styles.contenu}
        showsVerticalScrollIndicator={false}
      >
        {infosClient ? (
          <>
            {/* Carte principale du profil connecté */}
            <View style={styles.carteProfil}>
              <View style={styles.avatarDore}>
                <Text style={styles.texteAvatar}>{infosClient.initiales}</Text>
              </View>

              <Text style={styles.nomClient}>{infosClient.nomComplet}</Text>
              <Text style={styles.emailClient}>{infosClient.email}</Text>

              {infosClient.telephone ? (
                <Text style={styles.telClient}>{infosClient.telephone}</Text>
              ) : null}

              <View style={styles.badgeStatut}>
                <Ionicons name="shield-checkmark" size={15} color={COULEURS.succes} />
                <Text style={styles.texteStatut}>
                  {estAdmin
                    ? 'Administrateur • BoutiqueOr'
                    : 'Compte actif • BoutiqueOr'}
                </Text>
              </View>
            </View>

            {/* Raccourcis utiles du compte */}
            <View style={styles.carteActions}>
              <Text style={styles.titreSection}>Mon espace</Text>

              {estAdmin && (
                <Pressable
                  onPress={() => navigation.navigate('DashboardAdmin')}
                  style={styles.ligneActionAdmin}
                >
                  <View style={styles.gaucheAction}>
                    <Ionicons
                      name="speedometer-outline"
                      size={20}
                      color="#1E1305"
                    />
                    <Text style={styles.texteActionAdmin}>
                      Ouvrir le Dashboard Admin
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#1E1305" />
                </Pressable>
              )}

              <Pressable
                onPress={() => navigation.navigate('Catalogue')}
                style={styles.ligneAction}
              >
                <View style={styles.gaucheAction}>
                  <Ionicons
                    name="diamond-outline"
                    size={20}
                    color={COULEURS.orFonce}
                  />
                  <Text style={styles.texteAction}>Explorer le catalogue</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COULEURS.texteSecondaire}
                />
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('Panier')}
                style={styles.ligneAction}
              >
                <View style={styles.gaucheAction}>
                  <Ionicons name="cart-outline" size={20} color={COULEURS.orFonce} />
                  <Text style={styles.texteAction}>Voir mon panier & reçus</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COULEURS.texteSecondaire}
                />
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('Parametres')}
                style={[styles.ligneAction, styles.derniereLigne]}
              >
                <View style={styles.gaucheAction}>
                  <Ionicons
                    name="settings-outline"
                    size={20}
                    color={COULEURS.orFonce}
                  />
                  <Text style={styles.texteAction}>
                    Paramètres de l'application
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COULEURS.texteSecondaire}
                />
              </Pressable>
            </View>

            {/* Bouton clair et visible de déconnexion */}
            <Pressable
              onPress={demanderDeconnexion}
              style={({ pressed }) => [
                styles.boutonDeconnexion,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.texteDeconnexion}>Se déconnecter</Text>
            </Pressable>
          </>
        ) : (
          /* État non connecté */
          <View style={styles.carteNonConnecte}>
            <View style={styles.cercleIcone}>
              <Ionicons name="person-outline" size={32} color="#1E1305" />
            </View>

            <Text style={styles.titreNonConnecte}>Vous n'êtes pas connecté</Text>
            <Text style={styles.sousTitreNonConnecte}>
              Connectez-vous à votre compte BoutiqueOr pour gérer votre panier et
              vos commandes.
            </Text>

            <Pressable
              onPress={() => navigation.navigate('Login')}
              style={styles.boutonPrincipal}
            >
              <Ionicons name="log-in-outline" size={18} color="#1E1305" />
              <Text style={styles.texteBoutonPrincipal}>Se connecter</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('Inscription')}
              style={styles.boutonSecondaire}
            >
              <Text style={styles.texteBoutonSecondaire}>Créer un compte</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Modale de confirmation de déconnexion */}
      <Modal
        visible={modalConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalConfirmVisible(false)}
      >
        <View style={styles.fondModal}>
          <View style={styles.carteModal}>
            <Ionicons name="log-out-outline" size={30} color={COULEURS.rupture} />
            <Text style={styles.titreModal}>Déconnexion</Text>
            <Text style={styles.texteModal}>
              Voulez-vous vraiment vous déconnecter de votre compte ?
            </Text>

            <View style={styles.boutonsModal}>
              <Pressable
                onPress={() => setModalConfirmVisible(false)}
                style={styles.boutonAnnulerModal}
              >
                <Text style={styles.texteAnnulerModal}>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={executerDeconnexion}
                style={styles.boutonConfirmerModal}
              >
                <Text style={styles.texteConfirmerModal}>Déconnecter</Text>
              </Pressable>
            </View>
          </View>
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
  carteProfil: {
    backgroundColor: COULEURS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  avatarDore: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3C34F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: COULEURS.orFonce,
  },
  texteAvatar: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E1305',
  },
  nomClient: {
    fontSize: 20,
    fontWeight: '800',
    color: COULEURS.texte,
  },
  emailClient: {
    fontSize: 13,
    color: COULEURS.texteSecondaire,
  },
  telClient: {
    fontSize: 12,
    fontWeight: '700',
    color: COULEURS.orFonce,
  },
  badgeStatut: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COULEURS.fond,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  texteStatut: {
    fontSize: 12,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  carteActions: {
    backgroundColor: COULEURS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  titreSection: {
    fontSize: 14,
    fontWeight: '800',
    color: COULEURS.texte,
    marginBottom: 8,
  },
  ligneActionAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F3C34F',
    marginBottom: 6,
  },
  texteActionAdmin: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1305',
  },
  ligneAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COULEURS.fond,
  },
  derniereLigne: {
    borderBottomWidth: 0,
  },
  gaucheAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  texteAction: {
    fontSize: 14,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  boutonDeconnexion: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COULEURS.rupture || '#C62828',
    paddingVertical: 14,
    borderRadius: 14,
  },
  texteDeconnexion: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  carteNonConnecte: {
    backgroundColor: COULEURS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  cercleIcone: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3C34F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titreNonConnecte: {
    fontSize: 18,
    fontWeight: '800',
    color: COULEURS.texte,
  },
  sousTitreNonConnecte: {
    fontSize: 13,
    color: COULEURS.texteSecondaire,
    textAlign: 'center',
    lineHeight: 19,
  },
  boutonPrincipal: {
    marginTop: 6,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F3C34F',
    paddingVertical: 13,
    borderRadius: 14,
  },
  texteBoutonPrincipal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1305',
  },
  boutonSecondaire: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COULEURS.fond,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  texteBoutonSecondaire: {
    fontSize: 14,
    fontWeight: '700',
    color: COULEURS.orFonce,
  },
  fondModal: {
    flex: 1,
    backgroundColor: 'rgba(18, 12, 4, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  carteModal: {
    backgroundColor: COULEURS.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  titreModal: {
    fontSize: 17,
    fontWeight: '800',
    color: COULEURS.texte,
  },
  texteModal: {
    fontSize: 13,
    color: COULEURS.texteSecondaire,
    textAlign: 'center',
    lineHeight: 19,
  },
  boutonsModal: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    width: '100%',
  },
  boutonAnnulerModal: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: COULEURS.fond,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    alignItems: 'center',
  },
  texteAnnulerModal: {
    fontSize: 13,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  boutonConfirmerModal: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: COULEURS.rupture || '#C62828',
    alignItems: 'center',
  },
  texteConfirmerModal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
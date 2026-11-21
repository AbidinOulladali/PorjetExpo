import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COULEURS } from '../AppStyles';

// Catégories rapides affichées dans le menu latéral
const CATEGORIES_MENU = [
  { label: 'Tout le catalogue', valeur: null },
  { label: 'Snsla (Colliers)', valeur: 'Colliers' },
  { label: 'Bagues', valeur: 'Bagues' },
  { label: 'Bracelets', valeur: 'Bracelets' },
  { label: "Boucles d'oreilles", valeur: "Boucles d'oreilles" },
  { label: 'Parures / Lingots', valeur: 'Parures / Lingots' },
];

// Menu latéral personnalisé (Drawer) avec accès dédié au Dashboard Admin
export default function MenuWa3rDrawer({
  navigation,
  state,
  utilisateur,
  nombreArticlesPanier = 0,
  nombreCommandes = 0,
  nombreRecus = 0,
  onChoisirCategorie,
}) {
  // Vérifie si l'utilisateur connecté est l'administrateur
  const estAdmin = useMemo(
    () =>
      utilisateur?.role === 'admin' ||
      utilisateur?.email?.trim().toLowerCase() === 'admin@gmail.com',
    [utilisateur]
  );

  // Nom de la route active actuelle
  const routeActive = state?.routes?.[state?.index]?.name || 'Accueil';

  // Navigue vers une route et ferme le drawer
  const allerVers = (nomRoute) => {
    navigation.navigate(nomRoute);
    navigation.closeDrawer();
  };

  // Sélectionne une catégorie puis ouvre le Catalogue
  const ouvrirCategorie = (valeurCat) => {
    if (onChoisirCategorie) {
      onChoisirCategorie(valeurCat);
    }
    navigation.navigate('Catalogue', { categorie: valeurCat });
    navigation.closeDrawer();
  };

  return (
    <View style={styles.conteneur}>
      {/* En-tête doré de la boutique et statut du compte */}
      <View style={styles.enTete}>
        <View style={styles.badgeMarque}>
          <Ionicons name="diamond" size={20} color="#1E1305" />
          <Text style={styles.titreMarque}>BoutiqueOr</Text>
        </View>

        {utilisateur ? (
          <View style={styles.infosCompte}>
            <Text style={styles.nomUtilisateur} numberOfLines={1}>
              {`${utilisateur.prenom || ''} ${utilisateur.nom || ''}`.trim() ||
                'Compte actif'}
            </Text>
            <Text style={styles.emailUtilisateur} numberOfLines={1}>
              {utilisateur.email}
            </Text>
            {estAdmin && (
              <View style={styles.puceRoleAdmin}>
                <Ionicons name="shield-checkmark" size={13} color="#1E1305" />
                <Text style={styles.texteRoleAdmin}>Administrateur</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.texteInvite}>Visiteur • Non connecté</Text>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.contenuScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Bloc spécial visible uniquement pour l'administrateur */}
        {estAdmin && (
          <View style={styles.blocAdmin}>
            <Text style={styles.titreBlocAdmin}>ADMINISTRATION</Text>

            <Pressable
              onPress={() => allerVers('DashboardAdmin')}
              style={({ pressed }) => [
                styles.boutonDashboardAdmin,
                routeActive === 'DashboardAdmin' && styles.boutonDashboardActif,
                { opacity: pressed ? 0.88 : 1 },
              ]}
            >
              <View style={styles.gaucheLigne}>
                <Ionicons name="speedometer-outline" size={20} color="#1E1305" />
                <View>
                  <Text style={styles.texteDashboardAdmin}>Dashboard Admin</Text>
                  <Text style={styles.sousTexteDashboard}>
                    {nombreCommandes} cmd • {nombreRecus} reçus • Ajout articles
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#1E1305" />
            </Pressable>
          </View>
        )}

        {/* Navigation principale */}
        <Text style={styles.titreSection}>Navigation</Text>

        <Pressable
          onPress={() => allerVers('Accueil')}
          style={[styles.ligneMenu, routeActive === 'Accueil' && styles.ligneActive]}
        >
          <View style={styles.gaucheLigne}>
            <Ionicons
              name="home-outline"
              size={19}
              color={routeActive === 'Accueil' ? COULEURS.orFonce : COULEURS.texte}
            />
            <Text
              style={[
                styles.texteMenu,
                routeActive === 'Accueil' && styles.texteMenuActif,
              ]}
            >
              Accueil
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => allerVers('Catalogue')}
          style={[styles.ligneMenu, routeActive === 'Catalogue' && styles.ligneActive]}
        >
          <View style={styles.gaucheLigne}>
            <Ionicons
              name="grid-outline"
              size={19}
              color={routeActive === 'Catalogue' ? COULEURS.orFonce : COULEURS.texte}
            />
            <Text
              style={[
                styles.texteMenu,
                routeActive === 'Catalogue' && styles.texteMenuActif,
              ]}
            >
              Catalogue
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => allerVers('Panier')}
          style={[styles.ligneMenu, routeActive === 'Panier' && styles.ligneActive]}
        >
          <View style={styles.gaucheLigne}>
            <Ionicons
              name="cart-outline"
              size={19}
              color={routeActive === 'Panier' ? COULEURS.orFonce : COULEURS.texte}
            />
            <Text
              style={[
                styles.texteMenu,
                routeActive === 'Panier' && styles.texteMenuActif,
              ]}
            >
              Panier
            </Text>
          </View>
          <View style={styles.badgeCompteur}>
            <Text style={styles.texteCompteur}>{nombreArticlesPanier}</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => allerVers('Rupture')}
          style={[styles.ligneMenu, routeActive === 'Rupture' && styles.ligneActive]}
        >
          <View style={styles.gaucheLigne}>
            <Ionicons
              name="alert-circle-outline"
              size={19}
              color={routeActive === 'Rupture' ? COULEURS.orFonce : COULEURS.texte}
            />
            <Text
              style={[
                styles.texteMenu,
                routeActive === 'Rupture' && styles.texteMenuActif,
              ]}
            >
              Rupture de stock
            </Text>
          </View>
        </Pressable>

        {/* Catégories rapides */}
        <Text style={[styles.titreSection, { marginTop: 14 }]}>Catégories</Text>
        <View style={styles.listeCats}>
          {CATEGORIES_MENU.map((cat) => (
            <Pressable
              key={cat.label}
              onPress={() => ouvrirCategorie(cat.valeur)}
              style={styles.puceCategorie}
            >
              <Text style={styles.texteCategorie}>{cat.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Compte & paramètres */}
        <Text style={[styles.titreSection, { marginTop: 14 }]}>Compte</Text>

        <Pressable
          onPress={() => allerVers('Profil')}
          style={[styles.ligneMenu, routeActive === 'Profil' && styles.ligneActive]}
        >
          <View style={styles.gaucheLigne}>
            <Ionicons
              name="person-outline"
              size={19}
              color={routeActive === 'Profil' ? COULEURS.orFonce : COULEURS.texte}
            />
            <Text
              style={[
                styles.texteMenu,
                routeActive === 'Profil' && styles.texteMenuActif,
              ]}
            >
              Profil
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => allerVers('Parametres')}
          style={[
            styles.ligneMenu,
            routeActive === 'Parametres' && styles.ligneActive,
          ]}
        >
          <View style={styles.gaucheLigne}>
            <Ionicons
              name="settings-outline"
              size={19}
              color={routeActive === 'Parametres' ? COULEURS.orFonce : COULEURS.texte}
            />
            <Text
              style={[
                styles.texteMenu,
                routeActive === 'Parametres' && styles.texteMenuActif,
              ]}
            >
              Paramètres
            </Text>
          </View>
        </Pressable>

        {!utilisateur && (
          <>
            <Pressable
              onPress={() => allerVers('Login')}
              style={styles.ligneMenu}
            >
              <View style={styles.gaucheLigne}>
                <Ionicons name="log-in-outline" size={19} color={COULEURS.texte} />
                <Text style={styles.texteMenu}>Login</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => allerVers('Inscription')}
              style={styles.ligneMenu}
            >
              <View style={styles.gaucheLigne}>
                <Ionicons
                  name="person-add-outline"
                  size={19}
                  color={COULEURS.texte}
                />
                <Text style={styles.texteMenu}>Inscription</Text>
              </View>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COULEURS.surface,
  },
  enTete: {
    backgroundColor: '#2B1B07',
    paddingTop: 44,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3C34F',
    gap: 8,
  },
  badgeMarque: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titreMarque: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFDF7',
  },
  infosCompte: {
    gap: 2,
  },
  nomUtilisateur: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F3C34F',
  },
  emailUtilisateur: {
    fontSize: 12,
    color: '#F7E7BE',
  },
  puceRoleAdmin: {
    marginTop: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3C34F',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  texteRoleAdmin: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E1305',
  },
  texteInvite: {
    fontSize: 12,
    color: '#F7E7BE',
  },
  contenuScroll: {
    padding: 14,
    paddingBottom: 30,
  },
  blocAdmin: {
    backgroundColor: COULEURS.orClair,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F3C34F',
    marginBottom: 14,
    gap: 8,
  },
  titreBlocAdmin: {
    fontSize: 11,
    fontWeight: '800',
    color: COULEURS.orFonce,
    letterSpacing: 0.7,
  },
  boutonDashboardAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3C34F',
    padding: 11,
    borderRadius: 12,
  },
  boutonDashboardActif: {
    borderWidth: 2,
    borderColor: '#2B1B07',
  },
  texteDashboardAdmin: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1305',
  },
  sousTexteDashboard: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3A2609',
    marginTop: 1,
  },
  titreSection: {
    fontSize: 12,
    fontWeight: '800',
    color: COULEURS.texteSecondaire,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  ligneMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 2,
  },
  ligneActive: {
    backgroundColor: COULEURS.orClair,
  },
  gaucheLigne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  texteMenu: {
    fontSize: 14,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  texteMenuActif: {
    color: COULEURS.orFonce,
    fontWeight: '800',
  },
  badgeCompteur: {
    backgroundColor: '#F3C34F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  texteCompteur: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E1305',
  },
  listeCats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  puceCategorie: {
    backgroundColor: COULEURS.fond,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  texteCategorie: {
    fontSize: 12,
    fontWeight: '700',
    color: COULEURS.texte,
  },
});
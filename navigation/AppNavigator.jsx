import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AccueilScreen from '../screens/AccueilScreen';
import CatalogueScreen from '../screens/CatalogueScreen';
import PanierScreen from '../screens/PanierScreen';
import RuptureScreen from '../screens/RuptureScreen';
import ProfilScreen from '../screens/ProfilScreen';
import ParametresScreen from '../screens/ParametresScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import { LoginScreen, InscriptionScreen } from '../auth';
import MenuWa3rDrawer from './MenuWa3rDrawer';
import { COULEURS } from '../AppStyles';
import { useTraduction } from '../i18n';

const Drawer = createDrawerNavigator();

// Langues disponibles dans la barre supérieure à côté du panier
const LANGUES_DISPO = [
  { code: 'fr', court: 'FR' },
  { code: 'en', court: 'EN' },
  { code: 'ar', court: 'AR' },
];

// Bloc supérieur droit : sélecteur de langue (FR / EN / AR) + bouton Panier
function ZoneDroiteHeader({
  navigation,
  nombreArticles,
  langue,
  onChangerLangue,
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginRight: 12,
      }}
    >
      {/* Sélecteur rapide de langue : Français, Anglais, Arabe */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COULEURS.fond,
          borderRadius: 16,
          padding: 2,
          borderWidth: 1,
          borderColor: COULEURS.bordure,
        }}
      >
        {LANGUES_DISPO.map((item) => {
          const active = langue === item.code;
          return (
            <Pressable
              key={item.code}
              onPress={() => onChangerLangue(item.code)}
              style={{
                paddingHorizontal: 7,
                paddingVertical: 3,
                borderRadius: 13,
                backgroundColor: active ? '#F3C34F' : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '800',
                  color: active ? '#1E1305' : COULEURS.texteSecondaire,
                }}
              >
                {item.court}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Bouton Panier à côté du sélecteur de langue */}
      <Pressable
        onPress={() => navigation.navigate('Panier')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 20,
          backgroundColor: COULEURS.orClair,
          borderWidth: 1,
          borderColor: COULEURS.bordure,
        }}
      >
        <Ionicons name="cart-outline" size={18} color={COULEURS.orFonce} />
        <Text style={{ fontWeight: '800', fontSize: 13, color: COULEURS.texte }}>
          {nombreArticles}
        </Text>
      </Pressable>
    </View>
  );
}

// Navigation Drawer principale avec changement de langue global (FR / EN / AR)
export default function AppNavigator({
  utilisateur,
  onConnexionReussie,
  onDeconnexion,
}) {
  const [langue, setLangue] = useState('fr');
  const [categorieChoisie, setCategorieChoisie] = useState(null);
  const [panier, setPanier] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [recus, setRecus] = useState([]);
  const [articlesAjoutes, setArticlesAjoutes] = useState([]);
  const [routeApresLogin, setRouteApresLogin] = useState(null);

  const { t } = useTraduction(langue);

  const estAdmin = useMemo(
    () =>
      utilisateur?.role === 'admin' ||
      utilisateur?.email?.trim().toLowerCase() === 'admin@gmail.com',
    [utilisateur]
  );

  const ajouterAuPanier = useCallback((bijou) => {
    setPanier((prev) => {
      const stockMax = Number(bijou.stock ?? 0);
      const existant = prev.find((item) => item.id === bijou.id);
      if (existant) {
        if (existant.quantite >= stockMax) return prev;
        return prev.map((item) =>
          item.id === bijou.id ? { ...item, quantite: item.quantite + 1 } : item
        );
      }
      if (stockMax <= 0) return prev;
      return [...prev, { ...bijou, quantite: 1 }];
    });
  }, []);

  const modifierQuantite = useCallback((id, delta) => {
    setPanier((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const stockMax = Number(item.stock ?? 99);
          return {
            ...item,
            quantite: Math.min(item.quantite + delta, stockMax),
          };
        })
        .filter((item) => item.quantite > 0)
    );
  }, []);

  const viderPanier = useCallback(() => {
    setPanier([]);
  }, []);

  const enregistrerCommandeEtRecu = useCallback((nouveauRecu) => {
    if (!nouveauRecu) return;
    setRecus((prev) => [nouveauRecu, ...prev]);
    setCommandes((prev) => [
      {
        id: nouveauRecu.reference,
        reference: nouveauRecu.reference,
        clientNom: nouveauRecu.clientNom,
        clientTelephone: nouveauRecu.clientTelephone || '',
        dateHeure: nouveauRecu.dateHeure,
        modePaiement: nouveauRecu.modePaiement,
        totalMontant: nouveauRecu.totalMontant,
      },
      ...prev,
    ]);
  }, []);

  const ajouterArticleAdmin = useCallback((nouvelArticle) => {
    if (!nouvelArticle) return;
    setArticlesAjoutes((prev) => [nouvelArticle, ...prev]);
  }, []);

  const finaliserConnexion = useCallback(
    (compte, navigation) => {
      try {
        if (onConnexionReussie) {
          onConnexionReussie(compte);
        }
        const adminConnecte =
          compte?.role === 'admin' ||
          compte?.email?.trim().toLowerCase() === 'admin@gmail.com';
        const destination = adminConnecte
          ? 'DashboardAdmin'
          : routeApresLogin || 'Accueil';
        setRouteApresLogin(null);
        navigation.navigate(destination);
      } catch (erreur) {
        console.log('Erreur après connexion :', erreur);
        Alert.alert(t.erreurTitre, t.erreurConnexion);
      }
    },
    [onConnexionReussie, routeApresLogin, t]
  );

  const nombreArticlesPanier = useMemo(
    () => panier.reduce((acc, item) => acc + Number(item.quantite || 0), 0),
    [panier]
  );

  return (
    <Drawer.Navigator
      initialRouteName="Accueil"
      drawerContent={(props) => (
        <MenuWa3rDrawer
          {...props}
          langue={langue}
          onChangerLangue={setLangue}
          utilisateur={utilisateur}
          nombreArticlesPanier={nombreArticlesPanier}
          nombreCommandes={commandes.length}
          nombreRecus={recus.length}
          onChoisirCategorie={setCategorieChoisie}
        />
      )}
      screenOptions={({ navigation }) => ({
        drawerStyle: { width: 290 },
        headerStyle: { backgroundColor: COULEURS.surface },
        headerTintColor: COULEURS.texte,
        headerTitleStyle: { fontWeight: '700', color: COULEURS.texte },
        headerRight: () => (
          <ZoneDroiteHeader
            navigation={navigation}
            nombreArticles={nombreArticlesPanier}
            langue={langue}
            onChangerLangue={setLangue}
          />
        ),
      })}
    >
      <Drawer.Screen name="Accueil" options={{ title: t.accueil }}>
        {(props) => (
          <AccueilScreen
            {...props}
            langue={langue}
            utilisateur={utilisateur}
            onChoisirCategorie={setCategorieChoisie}
            onAjouterPanier={ajouterAuPanier}
            onDemanderConnexion={(cible = 'Accueil') => {
              setRouteApresLogin(cible);
              props.navigation.navigate('Login');
            }}
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen name="Catalogue" options={{ title: t.catalogue }}>
        {(props) => (
          <CatalogueScreen
            {...props}
            langue={langue}
            utilisateur={utilisateur}
            panier={panier}
            articlesAjoutes={articlesAjoutes}
            categorieChoisie={categorieChoisie}
            onChoisirCategorie={setCategorieChoisie}
            onAjouterPanier={ajouterAuPanier}
            onModifierQuantite={modifierQuantite}
            onDemanderConnexion={(cible = 'Catalogue') => {
              setRouteApresLogin(cible);
              props.navigation.navigate('Login');
            }}
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen name="Panier" options={{ title: t.panier }}>
        {(props) => (
          <PanierScreen
            {...props}
            langue={langue}
            utilisateur={utilisateur}
            panier={panier}
            onModifierQuantite={modifierQuantite}
            onViderPanier={viderPanier}
            onRecuGenere={enregistrerCommandeEtRecu}
            onDemanderConnexion={() => {
              setRouteApresLogin('Panier');
              props.navigation.navigate('Login');
            }}
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen
        name="DashboardAdmin"
        options={{
          title: t.dashboardAdmin,
          drawerItemStyle: estAdmin ? undefined : { display: 'none' },
        }}
      >
        {(props) => (
          <AdminDashboardScreen
            {...props}
            langue={langue}
            utilisateur={utilisateur}
            commandes={commandes}
            recus={recus}
            articlesAjoutes={articlesAjoutes}
            onAjouterArticle={ajouterArticleAdmin}
            onDeconnexion={onDeconnexion}
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen name="Rupture" options={{ title: t.rupture }}>
        {(props) => <RuptureScreen {...props} langue={langue} />}
      </Drawer.Screen>

      <Drawer.Screen name="Profil" options={{ title: t.profil }}>
        {(props) => (
          <ProfilScreen
            {...props}
            langue={langue}
            utilisateur={utilisateur}
            onDeconnexion={onDeconnexion}
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen name="Parametres" options={{ title: t.parametres }}>
        {(props) => (
          <ParametresScreen
            {...props}
            langue={langue}
            onChangerLangue={setLangue}
            utilisateur={utilisateur}
            onDeconnexion={onDeconnexion}
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen name="Login" options={{ title: t.login }}>
        {(props) => (
          <LoginScreen
            {...props}
            langue={langue}
            onConnexionReussie={(compte) =>
              finaliserConnexion(compte, props.navigation)
            }
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen name="Inscription" options={{ title: t.inscription }}>
        {(props) => (
          <InscriptionScreen
            {...props}
            langue={langue}
            onConnexionReussie={(compte) =>
              finaliserConnexion(compte, props.navigation)
            }
          />
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}
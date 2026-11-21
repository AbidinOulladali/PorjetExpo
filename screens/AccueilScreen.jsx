import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COULEURS } from '../AppStyles';
import * as BijouxDb from '../database/bijoux';
import { useTraduction } from '../i18n';

// Largeur de l'écran pour dimensionner les grandes cartes horizontales
const LARGEUR_ECRAN = Dimensions.get('window').width;

// Image de fond dorée distante pour l'accueil
const IMAGE_FOND_DOREE =
  'https://images.unsplash.com/photo-1617038220319-276d3f0a1432?auto=format&fit=crop&w=1200&q=80';

// Images de secours par catégorie si ../database/bijoux n'exporte pas IMAGES_PAR_CATEGORIE
const IMAGES_SECOURS_CATEGORIE = {
  Colliers:
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80',
  Bagues:
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
  Bracelets:
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80',
  'Parures / Lingots': IMAGE_FOND_DOREE,
};

const IMAGES_PAR_CATEGORIE =
  BijouxDb.IMAGES_PAR_CATEGORIE || IMAGES_SECOURS_CATEGORIE;

// Police élégante pour les titres de la boutique
const POLICE_TITRE = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

// Tarifs indicatifs par gramme selon le carat (en euros)
const TARIF_GRAMME_CARAT = {
  '18K': 58,
  '21K': 68,
  '24K': 78,
};

// Formate un prix en euros
const formaterPrix = (prix) =>
  `${Number(prix || 0).toFixed(2).replace('.', ',')} €`;

// Écran d'accueil : fond doré, grand scroll horizontal, produits, simulateur or, conseils et pied de page
export default function AccueilScreen({
  navigation,
  langue = 'fr',
  utilisateur,
  onChoisirCategorie,
  onAjouterPanier,
  onDemanderConnexion,
}) {
  const { estArabe } = useTraduction(langue);

  const [produitsVedette, setProduitsVedette] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [caratChoisie, setCaratChoisie] = useState('21K');
  const [poidsSaisi, setPoidsSaisi] = useState('5');
  const scrollRef = useRef(null);

  // Textes localisés selon la langue active ('fr' | 'en' | 'ar')
  const textesAccueil = useMemo(() => {
    if (langue === 'en') {
      return {
        invite: 'Guest',
        badge: 'GOLD HOUSE • 18K • 21K • 24K',
        bienvenue: 'Welcome,',
        titreHero: 'The Art of Precious Gold',
        descHero:
          'Carefully selected creations. Scroll to explore our pieces and fill your cart.',
        explorerCatalogue: 'Explore Catalogue',
        snsla: 'Snsla',
        bagues: 'Rings',
        bracelets: 'Bracelets',
        lingots: 'Gold Bars',
        selectionBoutique: 'Boutique Selection',
        glisserCartes: 'Swipe across the large cards →',
        voirTout: 'See all →',
        decouvrirCollection: 'Discover the collection',
        piecesDisponibles: 'Pieces available in stock',
        stock: 'Stock',
        rupture: 'Out of stock',
        indisponible: 'Unavailable',
        ajouterPanier: 'Add to cart',
        pourquoiBoutique: "Why Boutique d'Or",
        simulateurTitre: 'Gold Price Estimator per Gram',
        simulateurDesc:
          'Estimate an amount quickly by carat and weight in grams.',
        poidsLabel: 'Weight (grams)',
        conseilsTitre: 'Care & Preservation Tips',
        conseil1Titre: 'Gentle cleaning',
        conseil1Desc: 'Use lukewarm water, mild soap and a soft cloth.',
        conseil2Titre: 'Separate storage',
        conseil2Desc: 'Keep each piece in a soft pouch to avoid scratches.',
        conseil3Titre: 'Avoid harsh chemicals',
        conseil3Desc:
          'Apply perfume and cosmetics before putting on jewellery.',
        boutiqueInfosTitre: 'Boutique & Concierge',
        boutiqueInfosDesc:
          'Open Mon–Sat • 10:00 AM – 7:30 PM • Official receipt included.',
        ruptureTitre: 'Out-of-stock items',
        ruptureDesc: 'Check sold-out pieces and restocking status.',
        remonterHaut: 'Back to top',
        accueil: 'Home',
        profil: 'Profile',
        login: 'Login',
        inscription: 'Sign Up',
        alerteRuptureTitre: 'Out of stock',
        alerteRuptureTexte: 'This piece is currently out of stock.',
        alerteConnexionTitre: 'Sign in required',
        alerteConnexionTexte:
          'Sign in to your account to add an item to your cart.',
        annuler: 'Cancel',
        seConnecter: 'Sign in',
        alerteAjoutTitre: 'Added to cart',
        alerteAjoutTexte: 'has been added to your cart.',
      };
    }

    if (langue === 'ar') {
      return {
        invite: 'زائر',
        badge: 'دار الذهب • 18K • 21K • 24K',
        bienvenue: 'مرحباً،',
        titreHero: 'فن الذهب الثمين',
        descHero: 'تصاميم مختارة بعناية. تصفح لاكتشاف قطعنا وملء سلتك.',
        explorerCatalogue: 'استكشف الكتالوج',
        snsla: 'سنسلة',
        bagues: 'خواتم',
        bracelets: 'أساور',
        lingots: 'سبائك',
        selectionBoutique: 'مختارات المتجر',
        glisserCartes: 'اسحب البطاقات الكبيرة ←',
        voirTout: 'عرض الكل ←',
        decouvrirCollection: 'اكتشف المجموعة',
        piecesDisponibles: 'القطع المتوفرة في المخزون',
        stock: 'المخزون',
        rupture: 'نفاد',
        indisponible: 'غير متوفر',
        ajouterPanier: 'أضف إلى السلة',
        pourquoiBoutique: 'لماذا متجر الذهب',
        simulateurTitre: 'حاسبة تقدير الذهب بالغرام',
        simulateurDesc:
          'احسب تقدير السعر بسرعة حسب العيار والوزن بالغرام.',
        poidsLabel: 'الوزن (غرام)',
        conseilsTitre: 'نصائح العناية وحفظ الذهب',
        conseil1Titre: 'تنظيف لطيف',
        conseil1Desc: 'استعمل ماءً فاتراً وصابوناً لطيفاً وقطعة قماش ناعمة.',
        conseil2Titre: 'حفظ منفصل',
        conseil2Desc: 'احفظ كل قطعة في كيس ناعم لتجنب الخدوش.',
        conseil3Titre: 'تجنب المواد الكيميائية',
        conseil3Desc: 'ضع العطر ومستحضرات التجميل قبل ارتداء المجوهرات.',
        boutiqueInfosTitre: 'المتجر وخدمة الزبناء',
        boutiqueInfosDesc:
          'مفتوح الإثنين–السبت • 10:00 – 19:30 • وصل رسمي مع كل طلب.',
        ruptureTitre: 'المنتجات غير المتوفرة',
        ruptureDesc: 'اطلع على القطع المنتهية ومواعيد توفرها.',
        remonterHaut: 'العودة إلى الأعلى',
        accueil: 'الرئيسية',
        profil: 'الملف الشخصي',
        login: 'دخول',
        inscription: 'حساب جديد',
        alerteRuptureTitre: 'نفاد المخزون',
        alerteRuptureTexte: 'هذه القطعة غير متوفرة حالياً.',
        alerteConnexionTitre: 'تسجيل الدخول مطلوب',
        alerteConnexionTexte:
          'سجل الدخول إلى حسابك لإضافة قطعة إلى السلة.',
        annuler: 'إلغاء',
        seConnecter: 'تسجيل الدخول',
        alerteAjoutTitre: 'تمت الإضافة إلى السلة',
        alerteAjoutTexte: 'تمت إضافته إلى سلتك.',
      };
    }

    return {
      invite: 'Invité',
      badge: "MAISON D'OR • 18K • 21K • 24K",
      bienvenue: 'Bienvenue,',
      titreHero: "L'Art de l'Or Précieux",
      descHero:
        'Créations choisies avec soin. Faites défiler pour explorer nos pièces et remplir votre panier.',
      explorerCatalogue: 'Explorer le Catalogue',
      snsla: 'Snsla',
      bagues: 'Bagues',
      bracelets: 'Bracelets',
      lingots: 'Lingots',
      selectionBoutique: 'Sélection de la Boutique',
      glisserCartes: 'Glissez sur les grandes cartes →',
      voirTout: 'Voir tout →',
      decouvrirCollection: 'Découvrir la collection',
      piecesDisponibles: 'Pièces disponibles en stock',
      stock: 'Stock',
      rupture: 'Rupture',
      indisponible: 'Indisponible',
      ajouterPanier: 'Ajouter panier',
      pourquoiBoutique: "Pourquoi Boutique d'Or",
      simulateurTitre: 'Estimation Or au Gramme',
      simulateurDesc:
        'Calculez une estimation rapide selon le carat et le poids en grammes.',
      poidsLabel: 'Poids (grammes)',
      conseilsTitre: "Conseils d'Entretien",
      conseil1Titre: 'Nettoyage doux',
      conseil1Desc:
        "Eau tiède, savon doux et chiffon microfibre pour préserver l'éclat.",
      conseil2Titre: 'Rangement séparé',
      conseil2Desc:
        'Rangez chaque bijou dans un écrin ou pochon pour éviter les rayures.',
      conseil3Titre: 'Précautions quotidiennes',
      conseil3Desc:
        'Appliquez parfum et crème avant de porter vos pièces en or.',
      boutiqueInfosTitre: 'Boutique & Reçu Officiel',
      boutiqueInfosDesc:
        'Ouvert Lun–Sam • 10h00 – 19h30 • Reçu détaillé généré à chaque commande.',
      ruptureTitre: 'Articles en rupture de stock',
      ruptureDesc: 'Consultez les modèles épuisés et leur réapprovisionnement.',
      remonterHaut: 'Remonter en haut',
      accueil: 'Accueil',
      profil: 'Profil',
      login: 'Login',
      inscription: 'Inscription',
      alerteRuptureTitre: 'Rupture de stock',
      alerteRuptureTexte: 'Ce bijou est épuisé pour le moment.',
      alerteConnexionTitre: 'Connexion requise',
      alerteConnexionTexte:
        'Connectez-vous à votre compte pour ajouter un bijou au panier.',
      annuler: 'Annuler',
      seConnecter: 'Se connecter',
      alerteAjoutTitre: 'Ajouté au panier',
      alerteAjoutTexte: 'a été ajouté à votre panier.',
    };
  }, [langue]);

  // Grandes cartes du carrousel horizontal traduites dynamiquement
  const grandesCartesScroll = useMemo(
    () => [
      {
        id: 'snsla',
        badge:
          langue === 'ar'
            ? 'مجموعة سنسلة'
            : langue === 'en'
            ? 'SNSLA COLLECTION'
            : 'COLLECTION SNSLA',
        titre:
          langue === 'ar'
            ? 'سلاسل وعقود ذهب'
            : langue === 'en'
            ? 'Gold Chains & Necklaces'
            : 'Chaînes & Colliers en Or',
        desc:
          langue === 'ar'
            ? 'جدائل متقنة وقلائد بعيار 18K و 21K.'
            : langue === 'en'
            ? 'Curb, figaro links and pendants in 18K & 21K.'
            : 'Mailles forçat, grain de café et pendentifs 18K & 21K.',
        categorie: 'Colliers',
        image: IMAGES_PAR_CATEGORIE.Colliers || IMAGES_SECOURS_CATEGORIE.Colliers,
      },
      {
        id: 'bagues',
        badge:
          langue === 'ar'
            ? 'بريق يومي'
            : langue === 'en'
            ? 'DAILY RADIANCE'
            : 'ÉCLAT QUOTIDIEN',
        titre:
          langue === 'ar'
            ? 'خواتم سوليتير ودبل'
            : langue === 'en'
            ? 'Solitaire Rings & Bands'
            : 'Bagues Solitaires & Alliances',
        desc:
          langue === 'ar'
            ? 'لمسات مصقولة ومرصعة لجميع المناسبات.'
            : langue === 'en'
            ? 'Polished and set finishes for every occasion.'
            : 'Finitions polies et serties pour toutes les occasions.',
        categorie: 'Bagues',
        image: IMAGES_PAR_CATEGORIE.Bagues || IMAGES_SECOURS_CATEGORIE.Bagues,
      },
      {
        id: 'lingots',
        badge:
          langue === 'ar'
            ? 'ذهب خالص 24K'
            : langue === 'en'
            ? 'PURE GOLD 24K'
            : 'OR PUR 24K',
        titre:
          langue === 'ar'
            ? 'سبائك وأطقم معتمدة'
            : langue === 'en'
            ? 'Certified Gold Bars & Sets'
            : 'Lingotins & Parures Certifiées',
        desc:
          langue === 'ar'
            ? 'قيمة آمنة وقطع استثمارية بعيار 24 قيراطاً.'
            : langue === 'en'
            ? 'Safe value and investment pieces in 24 karats.'
            : 'Valeur sûre et pièces d’investissement en or 24 carats.',
        categorie: 'Parures / Lingots',
        image:
          IMAGES_PAR_CATEGORIE['Parures / Lingots'] ||
          IMAGES_SECOURS_CATEGORIE['Parures / Lingots'],
      },
    ],
    [langue]
  );

  // Raccourcis rapides des catégories en haut
  const raccourcisCategories = useMemo(
    () => [
      { label: textesAccueil.snsla, categorie: 'Colliers', icone: 'sparkles' },
      { label: textesAccueil.bagues, categorie: 'Bagues', icone: 'diamond' },
      {
        label: textesAccueil.bracelets,
        categorie: 'Bracelets',
        icone: 'watch',
      },
      {
        label: textesAccueil.lingots,
        categorie: 'Parures / Lingots',
        icone: 'medal',
      },
    ],
    [textesAccueil]
  );

  // Points forts de la boutique
  const avantagesBoutique = useMemo(
    () => [
      {
        titre:
          langue === 'ar'
            ? 'ذهب معتمد'
            : langue === 'en'
            ? 'Certified Gold'
            : 'Or Certifié',
        desc:
          langue === 'ar'
            ? 'أعيرة 18K و 21K و 24K موثوقة.'
            : langue === 'en'
            ? 'Verified 18K, 21K and 24K hallmarks.'
            : 'Poinçons 18K, 21K et 24K vérifiés.',
        icone: 'shield-checkmark-outline',
      },
      {
        titre:
          langue === 'ar'
            ? 'السلة والدفع'
            : langue === 'en'
            ? 'Cart & Payment'
            : 'Panier & Paiement',
        desc:
          langue === 'ar'
            ? 'تأكيد واضح واختيار طريقة الدفع.'
            : langue === 'en'
            ? 'Clear confirmation and payment choice.'
            : 'Confirmation claire et choix du règlement.',
        icone: 'card-outline',
      },
      {
        titre:
          langue === 'ar'
            ? 'تتبع المخزون'
            : langue === 'en'
            ? 'Stock Tracking'
            : 'Suivi du Stock',
        desc:
          langue === 'ar'
            ? 'توفر فوري وتنبيهات نفاد المخزون.'
            : langue === 'en'
            ? 'Real availability and out-of-stock alerts.'
            : 'Disponibilité réelle et alertes rupture.',
        icone: 'layers-outline',
      },
    ],
    [langue]
  );

  // Conseils d'entretien ajoutés en bas de l'accueil
  const conseilsEntretien = useMemo(
    () => [
      {
        titre: textesAccueil.conseil1Titre,
        desc: textesAccueil.conseil1Desc,
        icone: 'water-outline',
      },
      {
        titre: textesAccueil.conseil2Titre,
        desc: textesAccueil.conseil2Desc,
        icone: 'cube-outline',
      },
      {
        titre: textesAccueil.conseil3Titre,
        desc: textesAccueil.conseil3Desc,
        icone: 'sparkles-outline',
      },
    ],
    [textesAccueil]
  );

  // Estimation mémorisée au gramme selon le carat choisi
  const estimationGramme = useMemo(() => {
    const poids = Math.max(
      0,
      Number(String(poidsSaisi).replace(',', '.')) || 0
    );
    const tarif = TARIF_GRAMME_CARAT[caratChoisie] || 68;
    return {
      poids,
      tarif,
      total: poids * tarif,
    };
  }, [caratChoisie, poidsSaisi]);

  // Charge les bijoux de manière sécurisée depuis SQLite
  useEffect(() => {
    let actif = true;
    const chargerProduits = async () => {
      try {
        if (typeof BijouxDb.initDb === 'function') {
          await BijouxDb.initDb();
        }
        const fnListe =
          typeof BijouxDb.listerBijoux === 'function'
            ? BijouxDb.listerBijoux
            : typeof BijouxDb.recupererBijoux === 'function'
            ? BijouxDb.recupererBijoux
            : typeof BijouxDb.obtenirBijoux === 'function'
            ? BijouxDb.obtenirBijoux
            : null;

        if (!fnListe) {
          if (actif) setProduitsVedette([]);
          return;
        }

        const liste = await fnListe({ limite: 10, decalage: 0 });
        if (actif) {
          setProduitsVedette(Array.isArray(liste) ? liste : []);
        }
      } catch (e) {
        console.log('Erreur chargement bijoux accueil :', e);
        if (actif) setProduitsVedette([]);
      } finally {
        if (actif) setChargement(false);
      }
    };
    chargerProduits();
    return () => {
      actif = false;
    };
  }, []);

  // Ouvre le catalogue avec la catégorie choisie
  const ouvrirCatalogue = useCallback(
    (categorie = null) => {
      if (onChoisirCategorie) onChoisirCategorie(categorie);
      navigation.navigate('Catalogue', { categorie });
    },
    [navigation, onChoisirCategorie]
  );

  // Remonte tout en haut de l'écran d'accueil
  const remonterEnHaut = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  // Vérifie que l'utilisateur est connecté avant d'ajouter au panier
  const gererAjoutPanier = useCallback(
    (bijou) => {
      if (Number(bijou.stock) <= 0) {
        Alert.alert(
          textesAccueil.alerteRuptureTitre,
          textesAccueil.alerteRuptureTexte
        );
        return;
      }
      if (!utilisateur) {
        Alert.alert(
          textesAccueil.alerteConnexionTitre,
          textesAccueil.alerteConnexionTexte,
          [
            { text: textesAccueil.annuler, style: 'cancel' },
            {
              text: textesAccueil.seConnecter,
              onPress: () =>
                onDemanderConnexion
                  ? onDemanderConnexion('Accueil')
                  : navigation.navigate('Login'),
            },
          ]
        );
        return;
      }
      if (onAjouterPanier) {
        onAjouterPanier(bijou);
        Alert.alert(
          textesAccueil.alerteAjoutTitre,
          `${bijou.nom} ${textesAccueil.alerteAjoutTexte}`
        );
      }
    },
    [navigation, onAjouterPanier, onDemanderConnexion, textesAccueil, utilisateur]
  );

  const nomClient = utilisateur?.prenom ? utilisateur.prenom : textesAccueil.invite;
  const largeurCarteGrande = LARGEUR_ECRAN - 48;
  const alignTexte = estArabe ? { textAlign: 'right' } : null;

  return (
    <View style={styles.conteneur}>
      {/* Image de fond dorée distante en plein écran */}
      <Image
        source={{ uri: IMAGE_FOND_DOREE }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Voile doré ambré léger pour garder l'éclat doré et la lisibilité */}
      <View style={styles.voileDore}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContenu}
          showsVerticalScrollIndicator={false}
        >
          {/* En-tête de bienvenue */}
          <View style={styles.blocBienvenue}>
            <View style={styles.badgeOr}>
              <Ionicons name="sparkles" size={13} color="#FFE08A" />
              <Text style={styles.texteBadgeOr}>{textesAccueil.badge}</Text>
            </View>

            <Text style={[styles.texteBienvenue, alignTexte]}>
              {textesAccueil.bienvenue} {nomClient}
            </Text>
            <Text style={[styles.titreHero, alignTexte]}>
              {textesAccueil.titreHero}
            </Text>
            <View style={styles.ligneDoree} />
            <Text style={[styles.descHero, alignTexte]}>
              {textesAccueil.descHero}
            </Text>

            {/* Boutons principaux */}
            <View style={styles.ligneBoutonsHero}>
              <Pressable
                onPress={() => ouvrirCatalogue(null)}
                style={({ pressed }) => [
                  styles.boutonDore,
                  { opacity: pressed ? 0.86 : 1 },
                ]}
              >
                <Ionicons name="diamond-outline" size={18} color="#1E1305" />
                <Text style={styles.texteBoutonDore}>
                  {textesAccueil.explorerCatalogue}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => ouvrirCatalogue('Colliers')}
                style={({ pressed }) => [
                  styles.boutonVerreDore,
                  { opacity: pressed ? 0.86 : 1 },
                ]}
              >
                <Text style={styles.texteVerreDore}>{textesAccueil.snsla}</Text>
              </Pressable>
            </View>

            {/* Raccourcis de catégories */}
            <View style={styles.grilleRaccourcis}>
              {raccourcisCategories.map((r) => (
                <Pressable
                  key={`${r.categorie}-${r.label}`}
                  onPress={() => ouvrirCatalogue(r.categorie)}
                  style={({ pressed }) => [
                    styles.carteRaccourci,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Ionicons name={r.icone} size={17} color="#FFD773" />
                  <Text style={styles.texteRaccourci} numberOfLines={1}>
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Section claire : grand scroll horizontal + produits + blocs bas de page */}
          <View style={styles.sectionClair}>
            <View style={styles.enteteSection}>
              <View>
                <Text style={[styles.titreSection, alignTexte]}>
                  {textesAccueil.selectionBoutique}
                </Text>
                <Text style={[styles.sousTitreSection, alignTexte]}>
                  {textesAccueil.glisserCartes}
                </Text>
              </View>
              <Pressable onPress={() => ouvrirCatalogue(null)}>
                <Text style={styles.voirTout}>{textesAccueil.voirTout}</Text>
              </Pressable>
            </View>

            {/* Grand ScrollView horizontal à grandes cartes */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollGrandesCartes}
            >
              {grandesCartesScroll.map((carte) => (
                <Pressable
                  key={carte.id}
                  onPress={() => ouvrirCatalogue(carte.categorie)}
                  style={({ pressed }) => [
                    styles.grandeCarte,
                    { width: largeurCarteGrande, opacity: pressed ? 0.92 : 1 },
                  ]}
                >
                  <Image
                    source={{ uri: carte.image }}
                    style={styles.grandeCarteImage}
                    resizeMode="cover"
                  />
                  <View style={styles.grandeCarteContenu}>
                    <Text style={[styles.grandeCarteBadge, alignTexte]}>
                      {carte.badge}
                    </Text>
                    <Text style={[styles.grandeCarteTitre, alignTexte]}>
                      {carte.titre}
                    </Text>
                    <Text
                      style={[styles.grandeCarteDesc, alignTexte]}
                      numberOfLines={2}
                    >
                      {carte.desc}
                    </Text>
                    <View style={styles.grandeCartePied}>
                      <Text style={styles.grandeCarteAction}>
                        {textesAccueil.decouvrirCollection}
                      </Text>
                      <Ionicons
                        name="arrow-forward-circle"
                        size={22}
                        color={COULEURS.orFonce}
                      />
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>

            {/* Liste des produits avec bouton "Ajouter panier" */}
            <Text
              style={[
                styles.titreSection,
                { marginTop: 18, marginBottom: 4 },
                alignTexte,
              ]}
            >
              {textesAccueil.piecesDisponibles}
            </Text>

            {chargement ? (
              <ActivityIndicator
                size="large"
                color={COULEURS.orFonce}
                style={{ marginVertical: 24 }}
              />
            ) : (
              produitsVedette.map((item) => {
                const rupture = Number(item.stock) <= 0;
                const imageSecours =
                  IMAGES_PAR_CATEGORIE[item.categorie] || IMAGE_FOND_DOREE;

                return (
                  <View key={item.id} style={styles.carteProduit}>
                    <Image
                      source={{ uri: item.image_url || imageSecours }}
                      style={styles.imageProduit}
                      resizeMode="cover"
                    />

                    <View style={styles.infosProduit}>
                      <Text
                        style={[styles.nomProduit, alignTexte]}
                        numberOfLines={1}
                      >
                        {item.nom}
                      </Text>
                      <Text style={[styles.metaProduit, alignTexte]}>
                        {item.categorie === 'Colliers'
                          ? textesAccueil.snsla
                          : item.categorie}{' '}
                        • {item.carat} • {item.poids_grammes}g
                      </Text>

                      <View style={styles.lignePrixStock}>
                        <Text style={styles.prixProduit}>
                          {formaterPrix(item.prix)}
                        </Text>
                        <Text
                          style={[
                            styles.stockTexte,
                            rupture && styles.ruptureTexte,
                          ]}
                        >
                          {rupture
                            ? textesAccueil.rupture
                            : `${textesAccueil.stock}: ${item.stock}`}
                        </Text>
                      </View>

                      <Pressable
                        disabled={rupture}
                        onPress={() => gererAjoutPanier(item)}
                        style={({ pressed }) => [
                          styles.boutonAjouter,
                          rupture && styles.boutonDesactive,
                          { opacity: pressed && !rupture ? 0.86 : 1 },
                        ]}
                      >
                        <Ionicons name="cart-outline" size={16} color="#1E1305" />
                        <Text style={styles.texteAjouter}>
                          {rupture
                            ? textesAccueil.indisponible
                            : textesAccueil.ajouterPanier}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}

            {/* Section points forts de la boutique */}
            <Text
              style={[
                styles.titreSection,
                { marginTop: 18, marginBottom: 4 },
                alignTexte,
              ]}
            >
              {textesAccueil.pourquoiBoutique}
            </Text>

            <View style={styles.listeAvantages}>
              {avantagesBoutique.map((adv) => (
                <View key={adv.titre} style={styles.carteAvantage}>
                  <View style={styles.iconeAvantage}>
                    <Ionicons
                      name={adv.icone}
                      size={20}
                      color={COULEURS.orFonce}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.titreAvantage, alignTexte]}>
                      {adv.titre}
                    </Text>
                    <Text style={[styles.descAvantage, alignTexte]}>
                      {adv.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Ajout bas de page 1 : Simulateur express au gramme */}
            <View style={styles.carteSimulateurBas}>
              <View style={styles.enteteSimulateur}>
                <Ionicons
                  name="calculator-outline"
                  size={20}
                  color={COULEURS.orFonce}
                />
                <Text style={[styles.titreSimulateur, alignTexte]}>
                  {textesAccueil.simulateurTitre}
                </Text>
              </View>
              <Text style={[styles.descSimulateur, alignTexte]}>
                {textesAccueil.simulateurDesc}
              </Text>

              <View style={styles.ligneCarats}>
                {Object.keys(TARIF_GRAMME_CARAT).map((c) => {
                  const actif = caratChoisie === c;
                  return (
                    <Pressable
                      key={c}
                      onPress={() => setCaratChoisie(c)}
                      style={[
                        styles.puceCarat,
                        actif && styles.puceCaratActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.texteCarat,
                          actif && styles.texteCaratActive,
                        ]}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.ligneCalcul}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.labelPoids, alignTexte]}>
                    {textesAccueil.poidsLabel}
                  </Text>
                  <TextInput
                    value={poidsSaisi}
                    onChangeText={setPoidsSaisi}
                    keyboardType="decimal-pad"
                    placeholder="5"
                    placeholderTextColor={COULEURS.texteSecondaire}
                    style={styles.inputPoids}
                  />
                </View>

                <View style={styles.boiteEstimation}>
                  <Text style={styles.metaEstimation}>
                    {estimationGramme.tarif} €/g • {estimationGramme.poids} g
                  </Text>
                  <Text style={styles.valeurEstimation}>
                    {formaterPrix(estimationGramme.total)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Ajout bas de page 2 : Conseils d'entretien */}
            <Text
              style={[
                styles.titreSection,
                { marginTop: 14, marginBottom: 4 },
                alignTexte,
              ]}
            >
              {textesAccueil.conseilsTitre}
            </Text>

            <View style={styles.listeAvantages}>
              {conseilsEntretien.map((cons) => (
                <View key={cons.titre} style={styles.carteConseil}>
                  <View style={styles.iconeConseil}>
                    <Ionicons name={cons.icone} size={19} color="#9C6B00" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.titreAvantage, alignTexte]}>
                      {cons.titre}
                    </Text>
                    <Text style={[styles.descAvantage, alignTexte]}>
                      {cons.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Ajout bas de page 3 : Bloc boutique & horaire */}
            <View style={styles.carteInfosBoutique}>
              <Ionicons
                name="storefront-outline"
                size={22}
                color={COULEURS.orFonce}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.titreAvantage, alignTexte]}>
                  {textesAccueil.boutiqueInfosTitre}
                </Text>
                <Text style={[styles.descAvantage, alignTexte]}>
                  {textesAccueil.boutiqueInfosDesc}
                </Text>
              </View>
            </View>

            {/* Carte accès rapide vers les articles en rupture de stock */}
            <Pressable
              onPress={() => navigation.navigate('Rupture')}
              style={({ pressed }) => [
                styles.carteRuptureBas,
                { opacity: pressed ? 0.88 : 1 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.titreRuptureBas, alignTexte]}>
                  {textesAccueil.ruptureTitre}
                </Text>
                <Text style={[styles.descRuptureBas, alignTexte]}>
                  {textesAccueil.ruptureDesc}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFE08A" />
            </Pressable>

            {/* Pied de page en bas de l'accueil avec bouton pour remonter */}
            <View style={styles.piedAccueil}>
              <Text style={styles.textePiedMarque}>
                BOUTIQUE D'OR • 18K • 21K • 24K
              </Text>
              <Pressable
                onPress={remonterEnHaut}
                style={({ pressed }) => [
                  styles.boutonRemonter,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Ionicons name="arrow-up" size={15} color="#1E1305" />
                <Text style={styles.texteRemonter}>
                  {textesAccueil.remonterHaut}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* Barre simple en bas avec Accueil et Login / Inscription ou Profil */}
        <View style={styles.barreBas}>
          <Pressable onPress={remonterEnHaut} style={styles.itemBarreBas}>
            <Ionicons name="home-outline" size={20} color="#FFD773" />
            <Text style={styles.labelBarreBas}>{textesAccueil.accueil}</Text>
          </Pressable>

          {utilisateur ? (
            <Pressable
              onPress={() => navigation.navigate('Profil')}
              style={styles.itemBarreBas}
            >
              <Ionicons
                name="person-circle-outline"
                size={22}
                color="#FFD773"
              />
              <Text style={styles.labelBarreBas}>{textesAccueil.profil}</Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={() => navigation.navigate('Login')}
                style={styles.itemBarreBas}
              >
                <Ionicons name="log-in-outline" size={21} color="#FFD773" />
                <Text style={styles.labelBarreBas}>{textesAccueil.login}</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate('Inscription')}
                style={styles.itemBarreBas}
              >
                <Ionicons name="person-add-outline" size={20} color="#FFD773" />
                <Text style={styles.labelBarreBas}>
                  {textesAccueil.inscription}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: '#241706',
  },
  voileDore: {
    flex: 1,
    backgroundColor: 'rgba(66, 41, 8, 0.42)',
    justifyContent: 'space-between',
  },
  scrollContenu: {
    paddingBottom: 24,
  },
  blocBienvenue: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 24,
  },
  badgeOr: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 21, 5, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 115, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  texteBadgeOr: {
    color: '#FFE08A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  texteBienvenue: {
    color: '#FFE08A',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  titreHero: {
    fontFamily: POLICE_TITRE,
    color: '#FFFDF7',
    fontSize: 31,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: 0.6,
  },
  ligneDoree: {
    width: 64,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FFD773',
    marginVertical: 12,
  },
  descHero: {
    color: '#FFF7E4',
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.25,
    marginBottom: 18,
  },
  ligneBoutonsHero: {
    flexDirection: 'row',
    gap: 10,
  },
  boutonDore: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F3C34F',
    paddingVertical: 13,
    borderRadius: 14,
  },
  texteBoutonDore: {
    color: '#1E1305',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  boutonVerreDore: {
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFE08A',
    backgroundColor: 'rgba(34, 21, 5, 0.68)',
  },
  texteVerreDore: {
    color: '#FFE08A',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  grilleRaccourcis: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  carteRaccourci: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 13,
    backgroundColor: 'rgba(34, 21, 5, 0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 115, 0.35)',
  },
  texteRaccourci: {
    color: '#FFF8E7',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionClair: {
    backgroundColor: COULEURS.fond,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 12,
  },
  enteteSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titreSection: {
    fontFamily: POLICE_TITRE,
    fontSize: 19,
    fontWeight: '700',
    color: COULEURS.texte,
    letterSpacing: 0.4,
  },
  sousTitreSection: {
    fontSize: 12,
    color: COULEURS.texteSecondaire,
    marginTop: 2,
  },
  voirTout: {
    fontSize: 13,
    fontWeight: '700',
    color: COULEURS.orFonce,
  },
  scrollGrandesCartes: {
    gap: 14,
    paddingVertical: 6,
    paddingRight: 8,
  },
  grandeCarte: {
    backgroundColor: COULEURS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  grandeCarteImage: {
    width: '100%',
    height: 175,
    backgroundColor: COULEURS.orClair,
  },
  grandeCarteContenu: {
    padding: 14,
  },
  grandeCarteBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: COULEURS.orFonce,
    letterSpacing: 0.8,
  },
  grandeCarteTitre: {
    fontFamily: POLICE_TITRE,
    fontSize: 18,
    fontWeight: '700',
    color: COULEURS.texte,
    marginTop: 4,
  },
  grandeCarteDesc: {
    fontSize: 13,
    color: COULEURS.texteSecondaire,
    lineHeight: 19,
    marginTop: 4,
  },
  grandeCartePied: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COULEURS.bordure,
  },
  grandeCarteAction: {
    fontSize: 13,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  carteProduit: {
    flexDirection: 'row',
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    padding: 10,
    gap: 12,
    alignItems: 'center',
  },
  imageProduit: {
    width: 78,
    height: 78,
    borderRadius: 12,
    backgroundColor: COULEURS.orClair,
  },
  infosProduit: {
    flex: 1,
  },
  nomProduit: {
    fontFamily: POLICE_TITRE,
    fontSize: 15,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  metaProduit: {
    fontSize: 12,
    color: COULEURS.texteSecondaire,
    marginTop: 2,
  },
  lignePrixStock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  prixProduit: {
    fontSize: 15,
    fontWeight: '800',
    color: COULEURS.orFonce,
  },
  stockTexte: {
    fontSize: 12,
    fontWeight: '700',
    color: COULEURS.succes,
  },
  ruptureTexte: {
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
  listeAvantages: {
    gap: 10,
  },
  carteAvantage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    padding: 12,
  },
  iconeAvantage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COULEURS.orClair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titreAvantage: {
    fontSize: 14,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  descAvantage: {
    fontSize: 12,
    color: COULEURS.texteSecondaire,
    marginTop: 2,
    lineHeight: 17,
  },
  carteSimulateurBas: {
    marginTop: 8,
    backgroundColor: COULEURS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    padding: 14,
    gap: 10,
  },
  enteteSimulateur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titreSimulateur: {
    fontFamily: POLICE_TITRE,
    fontSize: 16,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  descSimulateur: {
    fontSize: 12,
    color: COULEURS.texteSecondaire,
    lineHeight: 17,
  },
  ligneCarats: {
    flexDirection: 'row',
    gap: 8,
  },
  puceCarat: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COULEURS.fond,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    alignItems: 'center',
  },
  puceCaratActive: {
    backgroundColor: '#F3C34F',
    borderColor: COULEURS.orFonce,
  },
  texteCarat: {
    fontSize: 12,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  texteCaratActive: {
    fontWeight: '800',
    color: '#1E1305',
  },
  ligneCalcul: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  labelPoids: {
    fontSize: 12,
    fontWeight: '700',
    color: COULEURS.texteSecondaire,
    marginBottom: 4,
  },
  inputPoids: {
    backgroundColor: COULEURS.fond,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  boiteEstimation: {
    backgroundColor: COULEURS.orClair,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'flex-end',
    minWidth: 126,
  },
  metaEstimation: {
    fontSize: 11,
    fontWeight: '700',
    color: COULEURS.texteSecondaire,
  },
  valeurEstimation: {
    fontSize: 16,
    fontWeight: '800',
    color: COULEURS.orFonce,
    marginTop: 2,
  },
  carteConseil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COULEURS.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    padding: 11,
  },
  iconeConseil: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDF1CE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carteInfosBoutique: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COULEURS.orClair,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    padding: 13,
  },
  carteRuptureBas: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#2A1B08',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 115, 0.45)',
  },
  titreRuptureBas: {
    color: '#FFE08A',
    fontSize: 15,
    fontWeight: '800',
  },
  descRuptureBas: {
    color: '#FFF4DA',
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  piedAccueil: {
    marginTop: 10,
    paddingTop: 14,
    paddingBottom: 6,
    alignItems: 'center',
    gap: 10,
  },
  textePiedMarque: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: COULEURS.texteSecondaire,
  },
  boutonRemonter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3C34F',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  texteRemonter: {
    color: '#1E1305',
    fontSize: 12,
    fontWeight: '800',
  },
  barreBas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#1E1305',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 115, 0.3)',
  },
  itemBarreBas: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 10,
  },
  labelBarreBas: {
    color: '#FFD773',
    fontSize: 11,
    fontWeight: '700',
  },
});
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppStyles, COULEURS } from '../AppStyles';

// Image de secours si un article n'a pas d'image
const IMAGE_DE_SECOURS =
  'https://images.unsplash.com/photo-1617038220319-276d3f0a1432?auto=format&fit=crop&w=1200&q=80';

// Modes de paiement disponibles pour la commande
const MODES_PAIEMENT = [
  { id: 'carte', label: 'Carte Bancaire', icone: 'card-outline' },
  { id: 'especes', label: 'Espèces (Boutique)', icone: 'cash-outline' },
  { id: 'virement', label: 'Virement Doré', icone: 'swap-horizontal-outline' },
];

// Formate un prix en euros
const formaterPrix = (prix) =>
  `${Number(prix || 0).toFixed(2).replace('.', ',')} €`;

// Formate la date et l'heure actuelle pour le reçu
const formaterDateHeure = (dateObj = new Date()) => {
  const date = dateObj.toLocaleDateString('fr-FR');
  const heure = dateObj.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return `${date} à ${heure}`;
};

// Écran Panier avec validation de commande, reçu détaillé et téléchargement PDF
export default function PanierScreen({
  navigation,
  utilisateur,
  panier = [],
  onModifierQuantite,
  onViderPanier,
  onRecuGenere,
  onDemanderConnexion,
}) {
  // États locaux avec useState
  const [modePaiement, setModePaiement] = useState('carte');
  const [recuActuel, setRecuActuel] = useState(null);
  const [modalRecuVisible, setModalRecuVisible] = useState(false);
  const [telechargementEnCours, setTelechargementEnCours] = useState(false);

  // Références avec useRef (scroll vers le haut et compteur de reçus)
  const scrollRef = useRef(null);
  const nombreRecusRef = useRef(0);

  // Remonte en haut de l'écran lorsqu'un nouveau reçu est généré
  useEffect(() => {
    if (recuActuel) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [recuActuel]);

  // Calcul mémorisé du nombre d'articles, du poids total en grammes et du montant total
  const resumePanier = useMemo(() => {
    return panier.reduce(
      (acc, item) => {
        const qte = Number(item.quantite || 0);
        const prixUnitaire = Number(item.prix || 0);
        const poidsUnitaire = Number(item.poids_grammes || 0);
        return {
          totalArticles: acc.totalArticles + qte,
          poidsTotalGrammes: acc.poidsTotalGrammes + poidsUnitaire * qte,
          totalMontant: acc.totalMontant + prixUnitaire * qte,
        };
      },
      { totalArticles: 0, poidsTotalGrammes: 0, totalMontant: 0 }
    );
  }, [panier]);

  // Libellé du mode de paiement sélectionné
  const libellePaiement = useMemo(() => {
    const trouve = MODES_PAIEMENT.find((m) => m.id === modePaiement);
    return trouve ? trouve.label : 'Carte Bancaire';
  }, [modePaiement]);

  // Génère le HTML professionnel du reçu pour l'export PDF
  const construireHtmlRecu = useCallback((recu) => {
    const lignesHtml = recu.articles
      .map(
        (art) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eadcb8;">
            <img src="${art.image_url || IMAGE_DE_SECOURS}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;" />
          </td>
          <td style="padding:10px;border-bottom:1px solid #eadcb8;">
            <strong>${art.nom}</strong><br/>
            <span style="color:#6e5837;font-size:12px;">${art.categorie === 'Colliers' ? 'Snsla' : art.categorie} • ${art.carat || 'Or 18K'}</span>
          </td>
          <td style="padding:10px;border-bottom:1px solid #eadcb8;text-align:center;">${Number(art.poids_grammes || 0)} g</td>
          <td style="padding:10px;border-bottom:1px solid #eadcb8;text-align:center;">x${art.quantite}</td>
          <td style="padding:10px;border-bottom:1px solid #eadcb8;text-align:right;font-weight:bold;">${formaterPrix(Number(art.prix) * Number(art.quantite))}</td>
        </tr>`
      )
      .join('');

    return `
      <html>
        <body style="font-family:Arial,sans-serif;padding:24px;color:#231707;background:#fffdf7;">
          <div style="border:2px solid #d4a024;border-radius:14px;padding:20px;">
            <h1 style="margin:0;color:#9c6b00;">BoutiqueOr — Reçu Officiel</h1>
            <p style="margin:6px 0 0;color:#6e5837;">Référence : <strong>${recu.reference}</strong></p>
            <p style="margin:4px 0 0;color:#6e5837;">Date & Heure : <strong>${recu.dateHeure}</strong></p>
            <p style="margin:4px 0 0;color:#6e5837;">Client : <strong>${recu.clientNom}</strong>${recu.clientTelephone ? ` • ${recu.clientTelephone}` : ''}</p>
            <p style="margin:4px 0 16px;color:#6e5837;">Paiement : <strong>${recu.modePaiement}</strong></p>

            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr style="background:#fbf2d6;text-align:left;">
                  <th style="padding:8px;">Photo</th>
                  <th style="padding:8px;">Bijou</th>
                  <th style="padding:8px;text-align:center;">Poids</th>
                  <th style="padding:8px;text-align:center;">Qté</th>
                  <th style="padding:8px;text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>${lignesHtml}</tbody>
            </table>

            <div style="margin-top:18px;text-align:right;">
              <p style="margin:4px 0;">Poids total : <strong>${recu.poidsTotalGrammes.toFixed(2)} g</strong></p>
              <h2 style="margin:6px 0 0;color:#9c6b00;">Total payé : ${formaterPrix(recu.totalMontant)}</h2>
            </div>
          </div>
        </body>
      </html>
    `;
  }, []);

  // Télécharge ou partage le reçu (PDF via expo-print et expo-sharing si installés)
  const telechargerRecu = useCallback(async () => {
    if (!recuActuel) return;
    setTelechargementEnCours(true);
    try {
      let Print = null;
      let Sharing = null;
      try {
        Print = require('expo-print');
        Sharing = require('expo-sharing');
      } catch (_) {
        Print = null;
        Sharing = null;
      }

      if (Print && typeof Print.printToFileAsync === 'function') {
        const html = construireHtmlRecu(recuActuel);
        const fichier = await Print.printToFileAsync({ html });

        if (
          Sharing &&
          typeof Sharing.isAvailableAsync === 'function' &&
          (await Sharing.isAvailableAsync())
        ) {
          await Sharing.shareAsync(fichier.uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Reçu ${recuActuel.reference}`,
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert(
            'Reçu généré',
            `Votre reçu PDF a été enregistré : ${fichier.uri}`
          );
        }
      } else {
        Alert.alert(
          'Reçu prêt',
          `Réf : ${recuActuel.reference}\nDate : ${recuActuel.dateHeure}\nPaiement : ${recuActuel.modePaiement}\nPoids : ${recuActuel.poidsTotalGrammes.toFixed(2)} g\nTotal : ${formaterPrix(recuActuel.totalMontant)}`
        );
      }
    } catch (erreur) {
      console.log('Erreur téléchargement reçu :', erreur);
      Alert.alert('Erreur', 'Impossible de télécharger le reçu pour le moment.');
    } finally {
      setTelechargementEnCours(false);
    }
  }, [construireHtmlRecu, recuActuel]);

  // Confirme la commande, génère le reçu, notifie l'admin et vide le panier
  const confirmerCommande = useCallback(() => {
    if (!utilisateur) {
      Alert.alert(
        'Connexion requise',
        'Connectez-vous pour confirmer votre commande et obtenir votre reçu.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Login',
            onPress: () =>
              onDemanderConnexion
                ? onDemanderConnexion()
                : navigation.navigate('Login'),
          },
        ]
      );
      return;
    }

    if (panier.length === 0) {
      Alert.alert('Panier vide', 'Ajoutez au moins un bijou avant de confirmer.');
      return;
    }

    nombreRecusRef.current += 1;
    const maintenant = new Date();
    const nouveauRecu = {
      reference: `BO-${maintenant.getFullYear()}-${String(
        nombreRecusRef.current
      ).padStart(3, '0')}-${String(maintenant.getTime()).slice(-4)}`,
      dateHeure: formaterDateHeure(maintenant),
      modePaiement: libellePaiement,
      clientNom:
        `${utilisateur.prenom || ''} ${utilisateur.nom || ''}`.trim() || 'Client',
      clientTelephone: utilisateur.telephone || '',
      clientEmail: utilisateur.email || 'client@boutiqueor.fr',
      articles: panier.map((art) => ({ ...art })),
      totalArticles: resumePanier.totalArticles,
      poidsTotalGrammes: resumePanier.poidsTotalGrammes,
      totalMontant: resumePanier.totalMontant,
    };

    setRecuActuel(nouveauRecu);
    setModalRecuVisible(true);

    if (onRecuGenere) {
      onRecuGenere(nouveauRecu);
    }

    if (onViderPanier) {
      onViderPanier();
    }
  }, [
    libellePaiement,
    navigation,
    onDemanderConnexion,
    onRecuGenere,
    onViderPanier,
    panier,
    resumePanier,
    utilisateur,
  ]);

  return (
    <View style={AppStyles.conteneur}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.contenu}
        showsVerticalScrollIndicator={false}
      >
        {/* Bannière du dernier reçu si déjà généré */}
        {recuActuel && (
          <View style={styles.banniereRecu}>
            <View style={{ flex: 1 }}>
              <Text style={styles.titreBanniere}>
                Dernier reçu : {recuActuel.reference}
              </Text>
              <Text style={styles.texteBanniere}>
                {recuActuel.dateHeure} • {recuActuel.modePaiement} •{' '}
                {formaterPrix(recuActuel.totalMontant)}
              </Text>
            </View>
            <Pressable
              onPress={() => setModalRecuVisible(true)}
              style={styles.boutonVoirRecu}
            >
              <Ionicons name="receipt-outline" size={16} color="#1E1305" />
              <Text style={styles.texteVoirRecu}>Reçu</Text>
            </Pressable>
          </View>
        )}

        {/* Contenu du panier */}
        {panier.length === 0 ? (
          <View style={styles.carteVide}>
            <Ionicons name="cart-outline" size={44} color={COULEURS.orFonce} />
            <Text style={styles.titreVide}>Votre panier est vide</Text>
            <Text style={styles.sousTitreVide}>
              Ajoutez des bijoux depuis le catalogue pour passer commande.
            </Text>
            <Pressable
              onPress={() => navigation.navigate('Catalogue')}
              style={styles.boutonCatalogue}
            >
              <Ionicons name="diamond-outline" size={17} color="#1E1305" />
              <Text style={styles.texteCatalogue}>Voir le catalogue</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Liste des articles dans le panier */}
            {panier.map((item) => {
              const prixLigne = Number(item.prix || 0) * Number(item.quantite || 0);
              const poidsLigne =
                Number(item.poids_grammes || 0) * Number(item.quantite || 0);

              return (
                <View key={item.id} style={styles.carteArticle}>
                  <Image
                    source={{ uri: item.image_url || IMAGE_DE_SECOURS }}
                    style={styles.imageArticle}
                    resizeMode="cover"
                  />
                  <View style={styles.infosArticle}>
                    <Text style={styles.nomArticle} numberOfLines={1}>
                      {item.nom}
                    </Text>
                    <Text style={styles.metaArticle}>
                      {item.categorie === 'Colliers' ? 'Snsla' : item.categorie} •{' '}
                      {item.carat || 'Or 18K'} • {poidsLigne.toFixed(2)} g
                    </Text>
                    <Text style={styles.prixArticle}>{formaterPrix(prixLigne)}</Text>
                  </View>

                  <View style={styles.controlesQte}>
                    <Pressable
                      onPress={() =>
                        onModifierQuantite && onModifierQuantite(item.id, -1)
                      }
                      style={styles.boutonQte}
                    >
                      <Ionicons name="remove" size={16} color={COULEURS.texte} />
                    </Pressable>
                    <Text style={styles.texteQte}>{item.quantite}</Text>
                    <Pressable
                      onPress={() =>
                        onModifierQuantite && onModifierQuantite(item.id, 1)
                      }
                      style={styles.boutonQte}
                    >
                      <Ionicons name="add" size={16} color={COULEURS.texte} />
                    </Pressable>
                  </View>
                </View>
              );
            })}

            {/* Choix de la méthode de paiement */}
            <View style={styles.carteSection}>
              <Text style={styles.titreSection}>Méthode de paiement</Text>
              <View style={styles.listePaiement}>
                {MODES_PAIEMENT.map((mode) => {
                  const selectionne = modePaiement === mode.id;
                  return (
                    <Pressable
                      key={mode.id}
                      onPress={() => setModePaiement(mode.id)}
                      style={[
                        styles.pucePaiement,
                        selectionne && styles.pucePaiementActive,
                      ]}
                    >
                      <Ionicons
                        name={mode.icone}
                        size={17}
                        color={selectionne ? '#FFFFFF' : COULEURS.texte}
                      />
                      <Text
                        style={[
                          styles.textePaiement,
                          selectionne && styles.textePaiementActive,
                        ]}
                      >
                        {mode.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Résumé de la commande et bouton de confirmation */}
            <View style={styles.carteSection}>
              <View style={styles.ligneResume}>
                <Text style={styles.labelResume}>Articles</Text>
                <Text style={styles.valeurResume}>{resumePanier.totalArticles}</Text>
              </View>
              <View style={styles.ligneResume}>
                <Text style={styles.labelResume}>Poids total</Text>
                <Text style={styles.valeurResume}>
                  {resumePanier.poidsTotalGrammes.toFixed(2)} g
                </Text>
              </View>
              <View style={styles.ligneResume}>
                <Text style={styles.labelResume}>Paiement</Text>
                <Text style={styles.valeurResume}>{libellePaiement}</Text>
              </View>
              <View style={styles.separateur} />
              <View style={styles.ligneResume}>
                <Text style={styles.totalLabel}>Total à payer</Text>
                <Text style={styles.totalValeur}>
                  {formaterPrix(resumePanier.totalMontant)}
                </Text>
              </View>

              <Pressable
                onPress={confirmerCommande}
                style={({ pressed }) => [
                  styles.boutonConfirmer,
                  { opacity: pressed ? 0.86 : 1 },
                ]}
              >
                <Ionicons name="checkmark-done-outline" size={19} color="#1E1305" />
                <Text style={styles.texteConfirmer}>
                  Confirmer la commande & Générer le reçu
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal du reçu détaillé après confirmation */}
      <Modal
        visible={modalRecuVisible && !!recuActuel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalRecuVisible(false)}
      >
        <View style={styles.fondModal}>
          <View style={styles.carteRecu}>
            <View style={styles.enteteRecu}>
              <View>
                <Text style={styles.marqueRecu}>BoutiqueOr • Reçu</Text>
                <Text style={styles.refRecu}>{recuActuel?.reference}</Text>
              </View>
              <Pressable
                onPress={() => setModalRecuVisible(false)}
                style={styles.boutonFermer}
              >
                <Ionicons name="close" size={20} color={COULEURS.texte} />
              </Pressable>
            </View>

            <View style={styles.infosRecuBox}>
              <Text style={styles.ligneInfoRecu}>
                Date & Heure : <Text style={styles.gras}>{recuActuel?.dateHeure}</Text>
              </Text>
              <Text style={styles.ligneInfoRecu}>
                Mode de paiement :{' '}
                <Text style={styles.gras}>{recuActuel?.modePaiement}</Text>
              </Text>
              <Text style={styles.ligneInfoRecu}>
                Client : <Text style={styles.gras}>{recuActuel?.clientNom}</Text>
              </Text>
              {recuActuel?.clientTelephone ? (
                <Text style={styles.ligneInfoRecu}>
                  Téléphone :{' '}
                  <Text style={styles.gras}>{recuActuel.clientTelephone}</Text>
                </Text>
              ) : null}
              <Text style={styles.ligneInfoRecu}>
                Poids total :{' '}
                <Text style={styles.gras}>
                  {Number(recuActuel?.poidsTotalGrammes || 0).toFixed(2)} g
                </Text>
              </Text>
            </View>

            <ScrollView style={styles.listeRecu} showsVerticalScrollIndicator={false}>
              {(recuActuel?.articles || []).map((art) => (
                <View key={art.id} style={styles.ligneArticleRecu}>
                  <Image
                    source={{ uri: art.image_url || IMAGE_DE_SECOURS }}
                    style={styles.miniPhotoRecu}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nomRecu} numberOfLines={1}>
                      {art.nom}
                    </Text>
                    <Text style={styles.grammeRecu}>
                      {Number(art.poids_grammes || 0)} g • Qté : {art.quantite}
                    </Text>
                  </View>
                  <Text style={styles.prixRecu}>
                    {formaterPrix(Number(art.prix) * Number(art.quantite))}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.totalRecuLigne}>
              <Text style={styles.totalRecuLabel}>Total réglé</Text>
              <Text style={styles.totalRecuPrix}>
                {formaterPrix(recuActuel?.totalMontant)}
              </Text>
            </View>

            <View style={styles.actionsRecu}>
              <Pressable
                onPress={() => setModalRecuVisible(false)}
                style={styles.boutonFermerBas}
              >
                <Text style={styles.texteFermerBas}>Fermer</Text>
              </Pressable>

              <Pressable
                disabled={telechargementEnCours}
                onPress={telechargerRecu}
                style={({ pressed }) => [
                  styles.boutonTelecharger,
                  { opacity: pressed || telechargementEnCours ? 0.85 : 1 },
                ]}
              >
                <Ionicons name="download-outline" size={18} color="#1E1305" />
                <Text style={styles.texteTelecharger}>
                  {telechargementEnCours ? 'Préparation...' : 'Télécharger le reçu'}
                </Text>
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
    padding: 14,
    gap: 12,
    paddingBottom: 28,
  },
  banniereRecu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: COULEURS.orClair,
    borderWidth: 1,
    borderColor: COULEURS.orFonce,
    borderRadius: 14,
    padding: 12,
  },
  titreBanniere: {
    fontSize: 13,
    fontWeight: '800',
    color: COULEURS.texte,
  },
  texteBanniere: {
    fontSize: 12,
    color: COULEURS.texteSecondaire,
    marginTop: 2,
  },
  boutonVoirRecu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3C34F',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  texteVoirRecu: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E1305',
  },
  carteVide: {
    backgroundColor: COULEURS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  titreVide: {
    fontSize: 17,
    fontWeight: '800',
    color: COULEURS.texte,
  },
  sousTitreVide: {
    fontSize: 13,
    color: COULEURS.texteSecondaire,
    textAlign: 'center',
  },
  boutonCatalogue: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3C34F',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
  },
  texteCatalogue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1305',
  },
  carteArticle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    padding: 10,
  },
  imageArticle: {
    width: 66,
    height: 66,
    borderRadius: 12,
    backgroundColor: COULEURS.orClair,
  },
  infosArticle: {
    flex: 1,
  },
  nomArticle: {
    fontSize: 14,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  metaArticle: {
    fontSize: 12,
    color: COULEURS.texteSecondaire,
    marginTop: 2,
  },
  prixArticle: {
    fontSize: 14,
    fontWeight: '800',
    color: COULEURS.orFonce,
    marginTop: 4,
  },
  controlesQte: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  carteSection: {
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    padding: 14,
    gap: 10,
  },
  titreSection: {
    fontSize: 15,
    fontWeight: '800',
    color: COULEURS.texte,
  },
  listePaiement: {
    gap: 8,
  },
  pucePaiement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 11,
    borderRadius: 12,
    backgroundColor: COULEURS.fond,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  pucePaiementActive: {
    backgroundColor: COULEURS.orFonce,
    borderColor: COULEURS.orFonce,
  },
  textePaiement: {
    fontSize: 13,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  textePaiementActive: {
    color: '#FFFFFF',
  },
  ligneResume: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelResume: {
    fontSize: 13,
    color: COULEURS.texteSecondaire,
    fontWeight: '600',
  },
  valeurResume: {
    fontSize: 13,
    color: COULEURS.texte,
    fontWeight: '700',
  },
  separateur: {
    height: 1,
    backgroundColor: COULEURS.bordure,
    marginVertical: 2,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COULEURS.texte,
  },
  totalValeur: {
    fontSize: 17,
    fontWeight: '800',
    color: COULEURS.orFonce,
  },
  boutonConfirmer: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F3C34F',
    paddingVertical: 13,
    borderRadius: 14,
  },
  texteConfirmer: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1305',
  },
  fondModal: {
    flex: 1,
    backgroundColor: 'rgba(18, 12, 4, 0.65)',
    justifyContent: 'center',
    padding: 16,
  },
  carteRecu: {
    backgroundColor: COULEURS.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COULEURS.orFonce,
    maxHeight: '86%',
  },
  enteteRecu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COULEURS.bordure,
  },
  marqueRecu: {
    fontSize: 17,
    fontWeight: '800',
    color: COULEURS.orFonce,
  },
  refRecu: {
    fontSize: 12,
    fontWeight: '700',
    color: COULEURS.texteSecondaire,
    marginTop: 2,
  },
  boutonFermer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COULEURS.fond,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  infosRecuBox: {
    backgroundColor: COULEURS.fond,
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    gap: 3,
  },
  ligneInfoRecu: {
    fontSize: 12,
    color: COULEURS.texteSecondaire,
  },
  gras: {
    fontWeight: '800',
    color: COULEURS.texte,
  },
  listeRecu: {
    marginTop: 10,
    maxHeight: 210,
  },
  ligneArticleRecu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COULEURS.fond,
  },
  miniPhotoRecu: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COULEURS.orClair,
  },
  nomRecu: {
    fontSize: 13,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  grammeRecu: {
    fontSize: 11,
    color: COULEURS.texteSecondaire,
    marginTop: 2,
  },
  prixRecu: {
    fontSize: 13,
    fontWeight: '800',
    color: COULEURS.orFonce,
  },
  totalRecuLigne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: COULEURS.bordure,
  },
  totalRecuLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COULEURS.texte,
  },
  totalRecuPrix: {
    fontSize: 18,
    fontWeight: '800',
    color: COULEURS.orFonce,
  },
  actionsRecu: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  boutonFermerBas: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COULEURS.fond,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    justifyContent: 'center',
    alignItems: 'center',
  },
  texteFermerBas: {
    fontSize: 13,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  boutonTelecharger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#F3C34F',
    paddingVertical: 12,
    borderRadius: 12,
  },
  texteTelecharger: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E1305',
  },
});
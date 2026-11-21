import { StyleSheet } from 'react-native';
import { COULEURS } from '../AppStyles';

// Styles des écrans de liste de bijoux (Catalogue et Rupture)
export const BijouxStyles = StyleSheet.create({
  enteteFixe: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  zoneRecherche: {
    marginTop: 10,
  },
  listePuces: {
    flexGrow: 0,
  },
  conteneurPuces: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  puce: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  puceActive: {
    backgroundColor: COULEURS.orFonce,
    borderColor: COULEURS.orFonce,
  },
  textePuce: {
    fontSize: 13,
    fontWeight: '600',
    color: COULEURS.texte,
  },
  textePuceActive: {
    color: '#FFFFFF',
  },
  listeBijoux: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  separateur: {
    height: 10,
  },
  carteBijou: {
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageBijou: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: COULEURS.orClair,
  },
  infosBijou: {
    flex: 1,
  },
  nomBijou: {
    fontSize: 15,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  metaBijou: {
    fontSize: 12,
    color: COULEURS.texteSecondaire,
    marginTop: 3,
  },
  basCarte: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  prixBijou: {
    fontSize: 15,
    fontWeight: '800',
    color: COULEURS.orFonce,
  },
  badgeStock: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#E8F5EC',
  },
  badgeRupture: {
    backgroundColor: '#FEF3C7',
  },
  texteStock: {
    fontSize: 11,
    fontWeight: '700',
    color: COULEURS.succes,
  },
  texteRupture: {
    color: COULEURS.rupture,
  },
  centreEtat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  texteVide: {
    textAlign: 'center',
    color: COULEURS.texteSecondaire,
    fontSize: 15,
    marginTop: 32,
  },
  piedPagination: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
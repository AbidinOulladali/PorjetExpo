import { StyleSheet } from 'react-native';
import { COULEURS } from '../AppStyles';

// Styles du menu latéral en cartes et du sélecteur de types de bijoux
export const MenuWa3rStyles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COULEURS.fond,
  },
  scroll: {
    padding: 14,
    paddingBottom: 24,
  },
  enteteBoutique: {
    backgroundColor: COULEURS.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconeBoutique: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COULEURS.orClair,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titreBoutique: {
    fontSize: 16,
    fontWeight: '800',
    color: COULEURS.texte,
  },
  sousTitreBoutique: {
    fontSize: 12,
    color: COULEURS.texteSecondaire,
    marginTop: 2,
  },
  grilleCartes: {
    gap: 10,
  },
  carteMenu: {
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carteMenuActive: {
    borderColor: COULEURS.orFonce,
    backgroundColor: COULEURS.orClair,
  },
  gaucheCarte: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  titreCarte: {
    fontSize: 14,
    fontWeight: '700',
    color: COULEURS.texte,
  },
  descCarte: {
    fontSize: 11,
    color: COULEURS.texteSecondaire,
    marginTop: 2,
  },
  boutonTypes: {
    marginTop: 12,
    backgroundColor: COULEURS.orFonce,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  texteBoutonTypes: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  listeTypes: {
    marginTop: 8,
    backgroundColor: COULEURS.surface,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    gap: 6,
  },
  itemType: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  texteType: {
    fontSize: 13,
    fontWeight: '600',
    color: COULEURS.texte,
  },
});
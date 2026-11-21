import { Platform, StyleSheet } from 'react-native';

// Palette de couleurs dorées et luxueuses pour Boutique d'Or
export const COULEURS = {
  fond: '#FAF6EE',
  surface: '#FFFDF8',
  texte: '#1E150A',
  texteSecondaire: '#6B5A42',
  orFonce: '#B8841E',
  orClair: '#F5E7C4',
  orVif: '#E5B448',
  bordure: '#E2CFA3',
  succes: '#1F7A46',
  rupture: '#C2410C',
};

// Style de police élégant et aéré selon la plateforme
const POLICE_ELEGANTE = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

// Styles communs de l'application avec une typographie soignée
export const AppStyles = StyleSheet.create({
  conteneur: {
    flex: 1,
    backgroundColor: COULEURS.fond,
  },
  carte: {
    backgroundColor: COULEURS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
  },
  titrePrincipal: {
    fontFamily: POLICE_ELEGANTE,
    fontSize: 22,
    fontWeight: '700',
    color: COULEURS.texte,
    letterSpacing: 0.5,
  },
  sousTitre: {
    fontSize: 13,
    color: COULEURS.texteSecondaire,
    letterSpacing: 0.25,
    lineHeight: 19,
  },
  input: {
    backgroundColor: COULEURS.surface,
    borderWidth: 1,
    borderColor: COULEURS.bordure,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: COULEURS.texte,
    letterSpacing: 0.2,
  },
  boutonPrimaire: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COULEURS.orFonce,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  texteBoutonPrimaire: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  boutonSecondaire: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COULEURS.orClair,
    borderWidth: 1,
    borderColor: COULEURS.orFonce,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  texteBoutonSecondaire: {
    color: COULEURS.texte,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
import { StyleSheet } from 'react-native';
import { COULEURS } from '../AppStyles';

// Styles spécifiques aux écrans d'inscription et de connexion[cite: 9, 37]
export const InscriptionStyles = StyleSheet.create({
  conteneurScroll: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  champ: {
    marginBottom: 12,
  },
  ligneSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 12,
  },
  texteSwitch: {
    flex: 1,
    fontSize: 13,
    color: COULEURS.texte,
    fontWeight: '500',
  },
});
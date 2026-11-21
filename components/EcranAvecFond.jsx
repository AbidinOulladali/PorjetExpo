import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppStyles } from '../AppStyles';

// Wrapper bach koul écran ykoun 3ndo nfs l-fond o SafeArea[cite: 36, 38]
export default function EcranAvecFond({ children, style, edges = ['top', 'left', 'right'] }) {
  return (
    <View style={AppStyles.ecranRacine}>
      {/* pointerEvents="none" bach l-forme mat-bloquéch l-touch */}
      <View pointerEvents="none" style={AppStyles.cercleOrHautDroite} />
      <View pointerEvents="none" style={AppStyles.anneauOrBasGauche} />
      <SafeAreaView edges={edges} style={[AppStyles.contenuEcran, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
}
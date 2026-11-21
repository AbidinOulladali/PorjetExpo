import React from 'react';
import EcranAvecFond from './EcranAvecFond';

// Composant de fond commun pour les écrans
export default function EcranFondDistant({ children }) {
  return <EcranAvecFond>{children}</EcranAvecFond>;
}
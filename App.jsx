import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';

// Point d'entrée principal de l'application Boutique d'Or
export default function App() {
  // Stocke l'utilisateur connecté (null si mode invité)
  const [utilisateur, setUtilisateur] = useState(null);

  // Enregistre le compte après connexion ou inscription réussie
  const handleConnexionReussie = (compte) => {
    setUtilisateur(compte || null);
  };

  // Déconnecte l'utilisateur et repasse en mode invité
  const handleDeconnexion = () => {
    setUtilisateur(null);
  };

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <AppNavigator
        utilisateur={utilisateur}
        onConnexionReussie={handleConnexionReussie}
        onDeconnexion={handleDeconnexion}
      />
    </NavigationContainer>
  );
}
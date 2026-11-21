import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COULEURS } from '../AppStyles';
import { IMAGE_PAR_DEFAUT } from '../database';

// Composant kay-jib tsawer mn internet o ila t3ttlat kay-dir fallback
export default function ImageBijouDistant({ uri, style, iconSize = 22 }) {
  const urlInitiale = (uri && uri.trim()) || IMAGE_PAR_DEFAUT;
  const [sourceUri, setSourceUri] = useState(urlInitiale);
  const [echec, setEchec] = useState(false);

  // Ila tbdlat uri, n-ajouriw l-état
  useEffect(() => {
    setSourceUri((uri && uri.trim()) || IMAGE_PAR_DEFAUT);
    setEchec(false);
  }, [uri]);

  // Ila 7ta image par défaut ma-tchargatch, n-affichiw icône dyal diamond
  if (echec) {
    return (
      <View
        style={[
          {
            backgroundColor: COULEURS.orClair,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      >
        <Ionicons name="diamond" size={iconSize} color={COULEURS.orFonce} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: sourceUri }}
      style={style}
      resizeMode="cover"
      onError={() => {
        if (sourceUri !== IMAGE_PAR_DEFAUT) {
          setSourceUri(IMAGE_PAR_DEFAUT);
        } else {
          setEchec(true);
        }
      }}
    />
  );
}
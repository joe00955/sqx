import React from 'react';
import { Image, StyleProp, View, ViewStyle } from 'react-native';
import { avatarFor } from '../data/avatars';
import { colors } from '../theme';

interface Props {
  playerId: string;
  imageUrl?: string;
  size?: number;
  rotate?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Avatar({ playerId, imageUrl, size = 46, rotate = true, style }: Props) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          overflow: 'hidden',
          backgroundColor: colors.surfaceAlt,
          transform: rotate ? [{ rotate: '-4deg' }] : undefined,
        },
        style,
      ]}
    >
      <Image
        source={imageUrl ? { uri: imageUrl } : avatarFor(playerId)}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </View>
  );
}

import { ImageSourcePropType } from 'react-native';

const avatarSources: Record<string, ImageSourcePropType> = {
  me: require('../../assets/avatars/me.png'),
  priya: require('../../assets/avatars/priya.png'),
  tom: require('../../assets/avatars/tom.png'),
  sofia: require('../../assets/avatars/sofia.png'),
  dan: require('../../assets/avatars/dan.png'),
  layla: require('../../assets/avatars/layla.png'),
  marcus: require('../../assets/avatars/marcus.png'),
  grace: require('../../assets/avatars/grace.png'),
  owen: require('../../assets/avatars/owen.png'),
};

export function avatarFor(playerId: string): ImageSourcePropType {
  return avatarSources[playerId] ?? avatarSources.me;
}

import React from 'react';
import { Image } from 'react-native';

const IconProvider = (source) => ({
  toReactElement: ({ animation, ...style }) => (
    <Image style={style} source={source}/>
  ),
});

export const AssetIconsPack = {
  name: 'assets',
  icons: {
    'arrow-back': IconProvider(require('./assets/arrow-left.svg')),
    'car': IconProvider(require('./assets/car.svg')),
    'chevron-down': IconProvider(require('./assets/chevron-down.svg')),
    'clock': IconProvider(require('./assets/clock.svg')),
    'pin': IconProvider(require('./assets/pin.svg')),
    'logo': IconProvider(require('./assets/logo.svg')),
    'phone': IconProvider(require('./assets/phone-call.svg')),
    'whatsapp': IconProvider(require('./assets/whatsapp-fill.svg')),
  },
};
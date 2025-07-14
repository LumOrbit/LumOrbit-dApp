declare module 'react-native-round-flags' {
  import { ComponentType } from 'react';
  import { ViewStyle } from 'react-native';

  interface FlagProps {
    code: string;
    size?: number;
    style?: ViewStyle;
  }

  const Flag: ComponentType<FlagProps>;
  export default Flag;
} 
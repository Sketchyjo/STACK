import { StyleSheet, View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

const FinanceIcon = () => (
  <View style={styles.iconContainer}>
    <Svg height="100%" width="100%" viewBox="0 0 120 100">
      {/* Gradient Definition */}
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#A68BFF" stopOpacity="1" />
          <Stop offset="1" stopColor="#7A6AFF" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Main chat bubble with heart */}
      <Path
        d="M15,20 Q5,20 5,30 V60 Q5,70 15,70 H30 L40,85 L50,70 H60 Q70,70 70,60 V30 Q70,20 60,20 H15 Z"
        fill="none"
        stroke="url(#grad)"
        strokeWidth="3"
      />
      <Path
        d="M37.5,38 C31,34 25,37 25,43 C25,49 37.5,58 37.5,58 C37.5,58 50,49 50,43 C50,37 44,34 37.5,38 Z"
        fill="url(#grad)"
      />

      {/* Smaller overlapping chat bubble */}
      <Path
        d="M75,10 Q68,10 68,17 V38 Q68,45 75,45 H95 Q102,45 102,38 V17 Q102,10 95,10 H75 Z"
        fill="none"
        stroke="url(#grad)"
        strokeWidth="3"
      />
      <Circle cx="80" cy="27.5" r="2" fill="url(#grad)" />
      <Circle cx="89" cy="27.5" r="2" fill="url(#grad)" />
      <Circle cx="98" cy="27.5" r="2" fill="url(#grad)" />

      {/* Signature 'M' */}
      <Path
        d="M80,70 C85,60 90,60 95,70 C100,80 105,80 110,70"
        fill="none"
        stroke="url(#grad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  iconContainer: {
    width: 280,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FinanceIcon;

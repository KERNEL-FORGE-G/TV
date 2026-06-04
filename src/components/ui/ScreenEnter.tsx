import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { motion } from '../../theme';

interface ScreenEnterProps {
  children: React.ReactNode;
}

/** Fondu + léger glissement à chaque affichage d’onglet */
export const ScreenEnter: React.FC<ScreenEnterProps> = ({ children }) => {
  const focused = useIsFocused();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (focused) {
      opacity.setValue(0);
      translateY.setValue(10);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: motion.duration.normal,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          ...motion.spring.enter,
        }),
      ]).start();
    }
  }, [focused, opacity, translateY]);

  return (
    <Animated.View
      style={[styles.root, { opacity, transform: [{ translateY }] }]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

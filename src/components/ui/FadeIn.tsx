import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { motion } from '../../theme';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  /** Distance d’entrée verticale */
  offset?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  style,
  offset = 14,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(offset)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.duration.normal,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        ...motion.spring.enter,
      }),
    ]).start();
  }, [delay, opacity, translateY, offset]);

  return (
    <Animated.View
      style={[styles.wrap, style, { opacity, transform: [{ translateY }] }]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
});

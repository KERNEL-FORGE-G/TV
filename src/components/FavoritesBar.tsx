import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import type { FavoriteChannel } from '../core/remoteTypes';
import { SectionTitle } from './ui/SectionTitle';
import { colors, radius, spacing, typography } from '../theme';

interface FavoritesBarProps {
  favorites: FavoriteChannel[];
  onSelect: (command: string) => void;
  onAdd?: () => void;
}

export const FavoritesBar: React.FC<FavoritesBarProps> = ({
  favorites,
  onSelect,
  onAdd,
}) => {
  if (favorites.length === 0 && !onAdd) return null;

  return (
    <View>
      <View style={styles.titleRow}>
        <SectionTitle>Favoris</SectionTitle>
        {onAdd ? (
          <TouchableOpacity onPress={onAdd} style={styles.addBtn}>
            <Text style={styles.addText}>＋</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {favorites.map((fav) => (
          <TouchableOpacity
            key={fav.id}
            style={styles.chip}
            onPress={() => onSelect(fav.command)}
            activeOpacity={0.85}
          >
            <Text style={styles.chipIcon}>{fav.icon ?? '★'}</Text>
            <Text style={styles.chipText}>{fav.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.lg,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.accent.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -spacing.sm,
  },
  addText: {
    fontSize: 20,
    color: colors.accent.primary,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginRight: spacing.sm,
  },
  chipIcon: { fontSize: 14, marginRight: 6 },
  chipText: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
});

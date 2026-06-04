import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Device } from '../data/devices';
import { LAYOUTS_BY_TYPE } from '../data/remoteLayouts';
import { isCommandSupported } from '../services/DeviceControlService';
import { SectionTitle } from './ui/SectionTitle';
import { RemoteButton } from './RemoteButton';
import { colors, spacing, radius, typography, layout } from '../theme';

interface DynamicRemotePanelProps {
  device: Device;
  onCommand: (cmd: string) => void;
}

const BTN_GAP = spacing.sm;

export const DynamicRemotePanel: React.FC<DynamicRemotePanelProps> = ({
  device,
  onCommand,
}) => {
  const sections = (LAYOUTS_BY_TYPE[device.type] ?? [])
    .map((section) => ({
      ...section,
      buttons: section.buttons.filter((btn) =>
        isCommandSupported(device, btn.command),
      ),
    }))
    .filter((s) => s.buttons.length > 0);

  if (sections.length === 0) return null;

  return (
    <View>
      {sections.map((section) => (
        <View key={section.id}>
          {section.title ? (
            <SectionTitle>{section.title}</SectionTitle>
          ) : null}
          <View style={styles.panel}>
            <View style={styles.row}>
              {section.buttons.map((btn, i) => (
                <View
                  key={btn.command}
                  style={[
                    styles.cell,
                    i < section.buttons.length - 1 && { marginRight: BTN_GAP },
                  ]}
                >
                  <RemoteButton
                    label={btn.label}
                    onPress={() => onCommand(btn.command)}
                    variant={btn.variant ?? 'ghost'}
                    shape="pill"
                    style={styles.btn}
                    textStyle={styles.btnText}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: layout.screenPadding,
    marginBottom: spacing.sm,
    backgroundColor: colors.bg.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  cell: {
    flexGrow: 1,
    flexBasis: '22%',
    minWidth: 72,
    minHeight: 40,
    marginBottom: BTN_GAP,
  },
  btn: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: spacing.sm,
  },
  btnText: {
    fontSize: typography.size.sm,
  },
});

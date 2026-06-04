import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Card } from './ui/Card';
import { TextField } from './ui/TextField';
import { FormButton } from './ui/FormButton';
import { sendProntoCode } from '../services/IRService';
import { ensureIrPermissions } from '../utils/permissions';
import { isValidProntoCode } from '../services/ir/irValidation';
import { colors, spacing, typography, forms } from '../theme';

const IR_COMMANDS = [
  'power',
  'vol_up',
  'vol_down',
  'mute',
  'ch_up',
  'ch_down',
  'up',
  'down',
  'left',
  'right',
  'ok',
  'home',
  'back',
  'menu',
] as const;

interface IrCodeRegistrationProps {
  hasEmitter: boolean;
  activeDeviceId: string | null;
  activeDeviceName?: string;
  onSave: (command: string, prontoCode: string) => void;
}

export const IrCodeRegistration: React.FC<IrCodeRegistrationProps> = ({
  hasEmitter,
  activeDeviceId,
  activeDeviceName,
  onSave,
}) => {
  const [learnCommand, setLearnCommand] = useState<string>('power');
  const [prontoInput, setProntoInput] = useState('');
  const [testing, setTesting] = useState(false);

  const saveCode = () => {
    const code = prontoInput.trim();
    if (!code) {
      Alert.alert('Code vide', 'Collez un code Pronto hex (ex. 0000 006D …).');
      return;
    }
    if (!isValidProntoCode(code)) {
      Alert.alert(
        'Code invalide',
        'Format Pronto attendu : groupes hex à 4 caractères (ex. 0000 006D 0022 0002 …).',
      );
      return;
    }
    if (!activeDeviceId) {
      Alert.alert(
        'Aucun appareil',
        'Ajoutez et sélectionnez une TV dans l’onglet Appareils.',
      );
      return;
    }
    onSave(learnCommand, code);
    setProntoInput('');
    Alert.alert(
      'Code enregistré',
      `« ${learnCommand} » enregistré pour ${activeDeviceName ?? 'l’appareil'}.`,
    );
  };

  const testCode = async () => {
    const code = prontoInput.trim();
    if (!code) {
      Alert.alert('Code vide', 'Saisissez un code Pronto à tester.');
      return;
    }
    const irOk = await ensureIrPermissions();
    if (!irOk) return;

    setTesting(true);
    const result = await sendProntoCode(code);
    setTesting(false);
    if (result.success) {
      Alert.alert('Signal envoyé', 'Vérifiez si la TV a réagi.');
    } else {
      Alert.alert('Échec', result.error ?? 'Impossible d’émettre le signal.');
    }
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Codes IR (Pronto)</Text>
      <Text style={styles.cardSubtitle}>
        Android ne peut pas capturer l’IR depuis une télécommande physique. Collez
        un code Pronto (bases de données IR ou outils comme IRPlus / remotecentral).
      </Text>

      <Text style={styles.fieldLabel}>Touche à associer</Text>
      <View style={styles.cmdWrap}>
        {IR_COMMANDS.map((cmd) => (
          <TouchableOpacity
            key={cmd}
            style={[forms.chip, learnCommand === cmd && forms.chipActive]}
            onPress={() => setLearnCommand(cmd)}
          >
            <Text
              style={[
                forms.chipText,
                learnCommand === cmd && forms.chipTextActive,
              ]}
            >
              {cmd}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Code Pronto hex</Text>
      <TextField
        multiline
        value={prontoInput}
        onChangeText={setProntoInput}
        placeholder="0000 006D 0022 0002 015B …"
        autoCapitalize="characters"
        style={styles.prontoInput}
      />

      <View style={styles.actions}>
        <FormButton
          label="Tester l’émission"
          variant="outline"
          onPress={testCode}
          disabled={!hasEmitter}
          loading={testing}
        />
        <FormButton
          label="Enregistrer pour la TV"
          variant="primary"
          onPress={saveCode}
          disabled={!activeDeviceId}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 0 },
  cardTitle: {
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontWeight: typography.weight.semibold,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.caps,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
    fontWeight: typography.weight.semibold,
  },
  cmdWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prontoInput: {
    fontFamily: 'monospace',
    fontSize: typography.size.sm,
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});

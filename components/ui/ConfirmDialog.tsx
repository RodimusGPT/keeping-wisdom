import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Colors from '@/constants/Colors';
import { useTextSize } from '@/hooks/useTextSize';
import { useTranslation } from '@/hooks/useTranslation';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const textSizes = useTextSize();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={() => {}}>
          <Text style={[styles.title, { fontSize: textSizes.header }]}>
            {title}
          </Text>
          <Text style={[styles.message, { fontSize: textSizes.bodyLarge }]}>
            {message}
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.7}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={[styles.buttonText, styles.cancelText, { fontSize: textSizes.button }]}>
                {cancelText || t('cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.7}
              style={[
                styles.button,
                styles.confirmButton,
                destructive && styles.destructiveButton,
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  styles.confirmText,
                  { fontSize: textSizes.button },
                ]}
              >
                {confirmText || t('confirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 28,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  cancelButton: {
    backgroundColor: Colors.light.backgroundSecondary,
  },
  confirmButton: {
    backgroundColor: Colors.light.buttonPrimary,
  },
  destructiveButton: {
    backgroundColor: Colors.light.error,
  },
  buttonText: {
    fontWeight: '600',
  },
  cancelText: {
    color: Colors.light.text,
  },
  confirmText: {
    color: '#FFFFFF',
  },
});

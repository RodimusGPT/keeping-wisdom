import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useTextSize } from '@/hooks/useTextSize';
import { useAppStore } from '@/store/useAppStore';
import { Language, AppSettings } from '@/types';

interface SettingItemProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingItem({ icon, title, value, onPress, rightElement }: SettingItemProps) {
  const textSizes = useTextSize();

  const content = (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <FontAwesome name={icon} size={22} color={Colors.light.tint} />
        </View>
        <Text style={[styles.settingTitle, { fontSize: textSizes.body }]}>
          {title}
        </Text>
      </View>
      <View style={styles.settingRight}>
        {value && (
          <Text style={[styles.settingValue, { fontSize: textSizes.body }]}>
            {value}
          </Text>
        )}
        {rightElement}
        {onPress && (
          <FontAwesome
            name="chevron-right"
            size={16}
            color={Colors.light.textSecondary}
            style={styles.chevron}
          />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const textSizes = useTextSize();
  const {
    settings,
    setLanguage,
    setTextSize,
    setSoundFeedback,
    setHapticFeedback,
  } = useAppStore();

  const [showLanguageOptions, setShowLanguageOptions] = React.useState(false);
  const [showTextSizeOptions, setShowTextSizeOptions] = React.useState(false);

  const languageDisplay = settings.language === 'zh-TW' ? '繁體中文' : 'English';

  const getTextSizeDisplay = () => {
    switch (settings.textSize) {
      case 'extraLarge':
        return t('extraLargeSize');
      case 'large':
        return t('largeSize');
      default:
        return t('normalSize');
    }
  };

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageOptions(false);
  };

  const handleTextSizeSelect = (size: AppSettings['textSize']) => {
    setTextSize(size);
    setShowTextSizeOptions(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { fontSize: textSizes.headerLarge }]}>
            {t('settings')}
          </Text>
        </View>

        {/* Language Setting */}
        <View style={styles.section}>
          <SettingItem
            icon="globe"
            title={t('language')}
            value={languageDisplay}
            onPress={() => setShowLanguageOptions(!showLanguageOptions)}
          />
          {showLanguageOptions && (
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.option,
                  settings.language === 'zh-TW' && styles.optionSelected,
                ]}
                onPress={() => handleLanguageSelect('zh-TW')}
              >
                <Text style={[styles.optionText, { fontSize: textSizes.body }]}>
                  🇹🇼 繁體中文
                </Text>
                {settings.language === 'zh-TW' && (
                  <FontAwesome name="check" size={20} color={Colors.light.success} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.option,
                  settings.language === 'en' && styles.optionSelected,
                ]}
                onPress={() => handleLanguageSelect('en')}
              >
                <Text style={[styles.optionText, { fontSize: textSizes.body }]}>
                  🇺🇸 English
                </Text>
                {settings.language === 'en' && (
                  <FontAwesome name="check" size={20} color={Colors.light.success} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Text Size Setting */}
        <View style={styles.section}>
          <SettingItem
            icon="font"
            title={t('textSize')}
            value={getTextSizeDisplay()}
            onPress={() => setShowTextSizeOptions(!showTextSizeOptions)}
          />
          {showTextSizeOptions && (
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.option,
                  settings.textSize === 'normal' && styles.optionSelected,
                ]}
                onPress={() => handleTextSizeSelect('normal')}
              >
                <Text style={[styles.optionText, { fontSize: 18 }]}>
                  {t('normalSize')}
                </Text>
                {settings.textSize === 'normal' && (
                  <FontAwesome name="check" size={20} color={Colors.light.success} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.option,
                  settings.textSize === 'large' && styles.optionSelected,
                ]}
                onPress={() => handleTextSizeSelect('large')}
              >
                <Text style={[styles.optionText, { fontSize: 22 }]}>
                  {t('largeSize')}
                </Text>
                {settings.textSize === 'large' && (
                  <FontAwesome name="check" size={20} color={Colors.light.success} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.option,
                  settings.textSize === 'extraLarge' && styles.optionSelected,
                ]}
                onPress={() => handleTextSizeSelect('extraLarge')}
              >
                <Text style={[styles.optionText, { fontSize: 26 }]}>
                  {t('extraLargeSize')}
                </Text>
                {settings.textSize === 'extraLarge' && (
                  <FontAwesome name="check" size={20} color={Colors.light.success} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Feedback Settings */}
        <View style={styles.section}>
          <SettingItem
            icon="volume-up"
            title={t('soundFeedback')}
            rightElement={
              <Switch
                value={settings.soundFeedback}
                onValueChange={setSoundFeedback}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.tint,
                }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingItem
            icon="mobile"
            title={t('hapticFeedback')}
            rightElement={
              <Switch
                value={settings.hapticFeedback}
                onValueChange={setHapticFeedback}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.tint,
                }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <SettingItem icon="question-circle" title={t('help')} onPress={() => {}} />
          <SettingItem icon="info-circle" title={t('about')} onPress={() => {}} />
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { fontSize: textSizes.caption }]}>
            {t('appName')} v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontWeight: '700',
    color: Colors.light.text,
  },
  section: {
    backgroundColor: Colors.light.cardBackground,
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTitle: {
    fontWeight: '500',
    color: Colors.light.text,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    color: Colors.light.textSecondary,
    marginRight: 8,
  },
  chevron: {
    marginLeft: 4,
  },
  optionsContainer: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  optionSelected: {
    backgroundColor: 'rgba(211, 47, 47, 0.05)',
  },
  optionText: {
    color: Colors.light.text,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    color: Colors.light.textSecondary,
  },
});

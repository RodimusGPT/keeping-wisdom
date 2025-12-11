import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAppStore } from '@/store/useAppStore';
import { useTextSize } from '@/hooks/useTextSize';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui';
import { Language } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingStep = 'language' | 'welcome' | 'permission';

export default function OnboardingScreen() {
  const [step, setStep] = useState<OnboardingStep>('language');
  const [permissionGranted, setPermissionGranted] = useState(false);

  const router = useRouter();
  const textSizes = useTextSize();
  const { t } = useTranslation();
  const { setLanguage, setHasCompletedOnboarding, settings } = useAppStore();

  const handleLanguageSelect = (language: Language) => {
    setLanguage(language);
    setStep('welcome');
  };

  const handleWelcomeNext = () => {
    setStep('permission');
  };

  const handleRequestPermission = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      setPermissionGranted(granted);
      if (granted) {
        completeOnboarding();
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    router.replace('/(tabs)');
  };

  const renderLanguageStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { fontSize: textSizes.headerLarge }]}>
        Select Language
      </Text>
      <Text style={[styles.titleAlt, { fontSize: textSizes.headerLarge }]}>
        選擇語言
      </Text>

      <View style={styles.languageButtons}>
        <TouchableOpacity
          onPress={() => handleLanguageSelect('zh-TW')}
          activeOpacity={0.7}
          style={styles.languageButton}
        >
          <Text style={styles.flagEmoji}>🇹🇼</Text>
          <Text style={[styles.languageText, { fontSize: textSizes.button }]}>
            繁體中文
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleLanguageSelect('en')}
          activeOpacity={0.7}
          style={styles.languageButton}
        >
          <Text style={styles.flagEmoji}>🇺🇸</Text>
          <Text style={[styles.languageText, { fontSize: textSizes.button }]}>
            English
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <FontAwesome name="microphone" size={80} color={Colors.light.buttonPrimary} />
      </View>

      <Text style={[styles.title, { fontSize: textSizes.headerLarge }]}>
        {t('welcome')}
      </Text>

      <Text style={[styles.tagline, { fontSize: textSizes.bodyLarge }]}>
        {t('tagline')}
      </Text>

      <View style={styles.features}>
        <View style={styles.feature}>
          <FontAwesome name="circle" size={12} color={Colors.light.buttonPrimary} />
          <Text style={[styles.featureText, { fontSize: textSizes.body }]}>
            {settings.language === 'zh-TW' ? '一鍵錄音' : 'One-tap recording'}
          </Text>
        </View>
        <View style={styles.feature}>
          <FontAwesome name="circle" size={12} color={Colors.light.buttonPrimary} />
          <Text style={[styles.featureText, { fontSize: textSizes.body }]}>
            {settings.language === 'zh-TW' ? '自動做筆記' : 'Automatic notes'}
          </Text>
        </View>
        <View style={styles.feature}>
          <FontAwesome name="circle" size={12} color={Colors.light.buttonPrimary} />
          <Text style={[styles.featureText, { fontSize: textSizes.body }]}>
            {settings.language === 'zh-TW' ? '重點摘要' : 'Key point summaries'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={t('next')}
          onPress={handleWelcomeNext}
          size="extraLarge"
        />
      </View>
    </View>
  );

  const renderPermissionStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <FontAwesome name="microphone" size={80} color={Colors.light.buttonPrimary} />
      </View>

      <Text style={[styles.title, { fontSize: textSizes.headerLarge }]}>
        {t('microphonePermission')}
      </Text>

      <Text style={[styles.explanation, { fontSize: textSizes.bodyLarge }]}>
        {t('microphoneExplanation')}
      </Text>

      <View style={styles.buttonContainer}>
        {!permissionGranted ? (
          <Button
            title={t('allowMicrophone')}
            onPress={handleRequestPermission}
            size="extraLarge"
          />
        ) : (
          <Button
            title={t('getStarted')}
            onPress={completeOnboarding}
            size="extraLarge"
          />
        )}
      </View>

      {!permissionGranted && (
        <TouchableOpacity
          onPress={completeOnboarding}
          style={styles.skipButton}
        >
          <Text style={[styles.skipText, { fontSize: textSizes.body }]}>
            {settings.language === 'zh-TW' ? '稍後設定' : 'Set up later'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {step === 'language' && renderLanguageStep()}
      {step === 'welcome' && renderWelcomeStep()}
      {step === 'permission' && renderPermissionStep()}

      {/* Progress dots */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressDot,
            step === 'language' && styles.progressDotActive,
          ]}
        />
        <View
          style={[
            styles.progressDot,
            step === 'welcome' && styles.progressDotActive,
          ]}
        />
        <View
          style={[
            styles.progressDot,
            step === 'permission' && styles.progressDotActive,
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  titleAlt: {
    fontWeight: '700',
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  tagline: {
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  languageButtons: {
    width: '100%',
    gap: 16,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.cardBackground,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  flagEmoji: {
    fontSize: 48,
  },
  languageText: {
    fontWeight: '600',
    color: Colors.light.text,
  },
  features: {
    alignSelf: 'flex-start',
    gap: 16,
    marginBottom: 48,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureText: {
    color: Colors.light.text,
  },
  explanation: {
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 32,
  },
  buttonContainer: {
    width: '100%',
  },
  skipButton: {
    marginTop: 24,
    padding: 16,
  },
  skipText: {
    color: Colors.light.textSecondary,
    textDecorationLine: 'underline',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingBottom: 32,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.border,
  },
  progressDotActive: {
    backgroundColor: Colors.light.buttonPrimary,
    width: 24,
  },
});

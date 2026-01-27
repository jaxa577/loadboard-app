import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, changeLanguage } from '../i18n';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');

  useEffect(() => {
    // Sync state with i18n language
    const handleLanguageChanged = (lng: string) => {
      setSelectedLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      setSelectedLanguage(languageCode);
      await changeLanguage(languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
      // Revert to previous language on error
      setSelectedLanguage(i18n.language);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.container}>
        {LANGUAGES.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageButton,
              selectedLanguage === language.code && styles.activeLanguageButton,
            ]}
            onPress={() => handleLanguageChange(language.code)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.languageText,
                selectedLanguage === language.code && styles.activeLanguageText,
              ]}
            >
              {language.nativeName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    minWidth: 80,
    alignItems: 'center',
  },
  activeLanguageButton: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  languageText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activeLanguageText: {
    color: '#fff',
  },
});

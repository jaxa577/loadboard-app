import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, changeLanguage } from '../i18n';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
  };

  return (
    <View style={styles.container}>
      {LANGUAGES.map((language) => (
        <TouchableOpacity
          key={language.code}
          style={[
            styles.languageButton,
            currentLanguage === language.code && styles.activeLanguageButton,
          ]}
          onPress={() => handleLanguageChange(language.code)}
        >
          <Text
            style={[
              styles.languageText,
              currentLanguage === language.code && styles.activeLanguageText,
            ]}
          >
            {language.nativeName}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e5e5e5',
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

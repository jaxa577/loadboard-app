import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import MyLoadsScreen from './MyLoadsScreen';
import AvailableLoadsScreen from './AvailableLoadsScreen';

interface Props {
  navigation: any;
}

export default function BrokerLoadsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'MY_LOADS' | 'ALL_LOADS'>('MY_LOADS');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'MY_LOADS' && styles.activeTab]}
          onPress={() => setActiveTab('MY_LOADS')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'MY_LOADS' && styles.activeTabText,
            ]}
          >
            {t('nav.myLoads') || 'My Loads'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ALL_LOADS' && styles.activeTab]}
          onPress={() => setActiveTab('ALL_LOADS')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'ALL_LOADS' && styles.activeTabText,
            ]}
          >
            {t('nav.allLoads') || 'All Loads'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {activeTab === 'MY_LOADS' ? (
          <MyLoadsScreen navigation={navigation} />
        ) : (
          <AvailableLoadsScreen navigation={navigation} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#eff6ff', 
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#2563eb',
  },
  contentContainer: {
    flex: 1,
  },
});

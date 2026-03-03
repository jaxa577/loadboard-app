import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AvailableLoadsScreen from '../screens/AvailableLoadsScreen';
import LoadDetailsScreen from '../screens/LoadDetailsScreen';
import MyLoadsScreen from '../screens/MyLoadsScreen';
import JourneyControlsScreen from '../screens/JourneyControlsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ApplicationsScreen from '../screens/ApplicationsScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatConversationScreen from '../screens/ChatConversationScreen';
import LoadHistoryScreen from '../screens/LoadHistoryScreen';
import RatingsScreen from '../screens/RatingsScreen';
import VerificationScreen from '../screens/VerificationScreen';
import PostLoadScreen from '../screens/PostLoadScreen';
import ManageApplicationsScreen from '../screens/ManageApplicationsScreen';
import { useAuth } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isDriver = user?.role === 'DRIVER';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'AvailableLoads') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'MyLoads' || route.name === 'MyPostedLoads') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Applications' || route.name === 'ManageApplications') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'PostLoad') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      {isDriver ? (
        <>
          <Tab.Screen
            name="AvailableLoads"
            component={AvailableLoadsScreen}
            options={{ title: t('nav.availableLoads') }}
          />
          <Tab.Screen
            name="MyLoads"
            component={MyLoadsScreen}
            options={{ title: t('nav.myLoads') }}
          />
          <Tab.Screen
            name="Applications"
            component={ApplicationsScreen}
            options={{ title: t('nav.applications') }}
          />
        </>
      ) : (
        <>
          <Tab.Screen
            name="MyPostedLoads"
            component={MyLoadsScreen}
            options={{ title: t('nav.myPostedLoads') }}
          />
          <Tab.Screen
            name="PostLoad"
            component={PostLoadScreen}
            options={{ title: t('nav.createLoad') }}
          />
          <Tab.Screen
            name="ManageApplications"
            component={ManageApplicationsScreen}
            options={{ title: t('nav.manageApplications') }}
          />
        </>
      )}

      {/* Shared Tabs */}
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{ title: t('nav.messages') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('nav.profile') }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator>
      {!user ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: t('auth.registerTitle') }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LoadDetails"
            component={LoadDetailsScreen}
            options={{ title: t('load.loadDetails') }}
          />
          <Stack.Screen
            name="JourneyControls"
            component={JourneyControlsScreen}
            options={{ title: 'Journey Controls' }}
          />
          <Stack.Screen
            name="ChatConversation"
            component={ChatConversationScreen}
            options={({ route }: any) => ({
              title: route.params?.userName || 'Chat',
            })}
          />
          <Stack.Screen
            name="LoadHistory"
            component={LoadHistoryScreen}
          />
          <Stack.Screen
            name="Ratings"
            component={RatingsScreen}
            options={{ title: 'My Ratings' }}
          />
          <Stack.Screen
            name="Verification"
            component={VerificationScreen}
            options={{ title: 'Driver Verification' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

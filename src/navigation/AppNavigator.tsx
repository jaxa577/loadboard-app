import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

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
import { useAuth } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'AvailableLoads') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'MyLoads') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Applications') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="AvailableLoads"
        component={AvailableLoadsScreen}
        options={{ title: 'Available' }}
      />
      <Tab.Screen
        name="MyLoads"
        component={MyLoadsScreen}
        options={{ title: 'My Loads' }}
      />
      <Tab.Screen
        name="Applications"
        component={ApplicationsScreen}
        options={{ title: 'Applications' }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{ title: 'Messages' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

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
            options={{ title: 'Create Account' }}
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
            options={{ title: 'Load Details' }}
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
            options={{ title: 'Load History' }}
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

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import AvailableLoadsScreen from '../screens/AvailableLoadsScreen';
import LoadDetailsScreen from '../screens/LoadDetailsScreen';
import MyLoadsScreen from '../screens/MyLoadsScreen';
import JourneyControlsScreen from '../screens/JourneyControlsScreen';
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
        options={{ title: 'Available Loads' }}
      />
      <Tab.Screen
        name="MyLoads"
        component={MyLoadsScreen}
        options={{ title: 'My Loads' }}
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
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
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
        </>
      )}
    </Stack.Navigator>
  );
}

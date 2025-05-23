import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, AuthContext } from './context/AuthContext';
import * as Notifications from 'expo-notifications';
import { scheduleMealReminders } from './utils/notifications';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import SetGoalsScreen from './screens/SetGoalsScreen';
import HomeScreen from './screens/HomeScreen';
import MealDetailsScreen from './screens/MealDetailsScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';

import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tabs Navigator
const Tabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Home') iconName = 'home';
        else if (route.name === 'History') iconName = 'time';
        else if (route.name === 'Profile') iconName = 'person';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#009966',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="History" component={HistoryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNav = () => {
  const { userToken, userInfo, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!userToken ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : userInfo?.goals ? (
          <>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="MealDetails" component={MealDetailsScreen} />
            <Stack.Screen name="SetGoals" component={SetGoalsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="SetGoals" component={SetGoalsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('يرجى السماح بالإشعارات لتلقي تذكيرات الوجبات');
      } else {
        scheduleMealReminders();
      }
    };
    requestPermissions();
  }, []);

  return (
    <AuthProvider>
      <AppNav />
    </AuthProvider>
  );
}

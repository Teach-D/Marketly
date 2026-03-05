import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/auth.store';
import AuthNavigator from './AuthNavigator';
import type { RootStackParamList } from './types';
import { View, ActivityIndicator } from 'react-native';
import { useState } from 'react';

const Stack = createNativeStackNavigator<RootStackParamList>();

function MainPlaceholder() {
  return <View className="flex-1 bg-white" />;
}

export default function RootNavigator() {
  const { isAuthenticated, loadToken } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadToken().finally(() => setLoading(false));
  }, [loadToken]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainPlaceholder} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useLogin } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import type { AuthStackParamList } from '../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<Nav>();
  const setToken = useAuthStore((s) => s.setToken);
  const { mutate: login, isPending } = useLogin();

  const handleLogin = () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: '이메일과 비밀번호를 입력해주세요.' });
      return;
    }
    login(
      { email, password },
      {
        onSuccess: async (data) => {
          await setToken(data.accessToken);
        },
        onError: () => {
          Toast.show({ type: 'error', text1: '이메일 또는 비밀번호가 올바르지 않습니다.' });
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-2xl font-bold text-gray-900 mb-8">로그인</Text>

      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-900"
        placeholder="이메일"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-6 text-gray-900"
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="bg-blue-600 rounded-lg py-4 items-center mb-4"
        onPress={handleLogin}
        disabled={isPending}
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">로그인</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text className="text-center text-blue-600">계정이 없으신가요? 회원가입</Text>
      </TouchableOpacity>
    </View>
  );
}

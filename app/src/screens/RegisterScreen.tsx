import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useRegister } from '../api/auth.api';
import type { AuthStackParamList } from '../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<Nav>();
  const { mutate: register, isPending } = useRegister();

  const handleRegister = () => {
    if (!name || !email || !password) {
      Toast.show({ type: 'error', text1: '모든 항목을 입력해주세요.' });
      return;
    }
    register(
      { name, email, password },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: '회원가입 완료! 로그인해주세요.' });
          navigation.navigate('Login');
        },
        onError: () => {
          Toast.show({ type: 'error', text1: '이미 사용 중인 이메일입니다.' });
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-2xl font-bold text-gray-900 mb-8">회원가입</Text>

      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-900"
        placeholder="이름"
        value={name}
        onChangeText={setName}
      />

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
        onPress={handleRegister}
        disabled={isPending}
      >
        {isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">회원가입</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text className="text-center text-blue-600">이미 계정이 있으신가요? 로그인</Text>
      </TouchableOpacity>
    </View>
  );
}

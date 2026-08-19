import { Link } from 'expo-router';
import { View } from 'react-native';

export default function Index() {
  return (
    <View>
      <Link href="/login">Go to login</Link>
      <Link href="/signup">Go to signup</Link>
    </View>
  );
}

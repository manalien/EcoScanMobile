import { SafeAreaProvider } from 'react-native-safe-area-context';
import DashboardScreen from './app/screens/DashboardScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <DashboardScreen />
    </SafeAreaProvider>
  );
}
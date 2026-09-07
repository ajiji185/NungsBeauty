import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Image, View } from 'react-native';
import { EditorScreen } from './src/screens/EditorScreen';
import { HomeScreen } from './src/screens/HomeScreen';

type Photo = { uri: string; width: number; height: number };

export default function App() {
  const [photo, setPhoto] = useState<Photo | null>(null);

  const open = async (source: 'camera' | 'library') => {
    const perm =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permission needed',
        source === 'camera'
          ? 'Camera access is required to take a selfie.'
          : 'Photo library access is required to choose a picture.'
      );
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 1, allowsEditing: false })
        : await ImagePicker.launchImageLibraryAsync({ quality: 1, mediaTypes: ['images'] });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const uri = asset.uri;
    if (asset.width && asset.height) {
      setPhoto({ uri, width: asset.width, height: asset.height });
      return;
    }
    Image.getSize(uri, (width, height) => setPhoto({ uri, width, height }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#070608' }}>
      <StatusBar style="light" />
      {photo ? (
        <EditorScreen uri={photo.uri} imageSize={photo} onClose={() => setPhoto(null)} />
      ) : (
        <HomeScreen onCamera={() => open('camera')} onLibrary={() => open('library')} />
      )}
    </View>
  );
}

import { StatusBar } from 'expo-status-bar';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, View } from 'react-native';
import { EditorScreen } from './src/screens/EditorScreen';
import { HomeScreen } from './src/screens/HomeScreen';

type Photo = { uri: string; width: number; height: number };

async function toEditableJpeg(uri: string): Promise<Photo> {
  const out = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1600 } }],
    { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
  );
  return { uri: out.uri, width: out.width, height: out.height };
}

export default function App() {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(false);

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

    const pickerOptions: ImagePicker.ImagePickerOptions = {
      quality: 1,
      allowsEditing: false,
      exif: false,
      preferredAssetRepresentationMode:
        ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
    };

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync({
            ...pickerOptions,
            mediaTypes: ['images'],
          });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setLoading(true);
    try {
      const prepared = await toEditableJpeg(asset.uri);
      setPhoto(prepared);
    } catch (e) {
      const uri = asset.uri;
      if (asset.width && asset.height) {
        setPhoto({ uri, width: asset.width, height: asset.height });
      } else {
        Image.getSize(
          uri,
          (width, height) => setPhoto({ uri, width, height }),
          () => Alert.alert('Could not load photo', String(e))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#070608' }}>
      <StatusBar style="light" />
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#E8A0B0" size="large" />
        </View>
      ) : photo ? (
        <EditorScreen
          photo={photo}
          onClose={() => setPhoto(null)}
          onReplacePhoto={setPhoto}
        />
      ) : (
        <HomeScreen onCamera={() => open('camera')} onLibrary={() => open('library')} />
      )}
    </View>
  );
}

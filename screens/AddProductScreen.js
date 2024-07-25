import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import UUID from 'react-native-uuid';
import { connectToDatabase, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, doc, setDoc } from 'firebase/firestore';

export default function AddProductScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [backButtonEnabled, setBackButtonEnabled] = useState(true);

  const handleSelectImage = async () => {
    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!pickerResult.canceled) {
        console.log("Image selected:", pickerResult.assets[0].uri);
        setImageUri(pickerResult.assets[0].uri);
      }

    } catch (error) {
      console.error("Error selecting image:", error);
    }
  };

  const uploadImageAsync = async (uri) => {
    setUploadingImage(true);
    setBackButtonEnabled(false);

    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const fileName = `${UUID.v4()}.jpg`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, blob);

    blob.close();

    const downloadUrl = await getDownloadURL(storageRef);
    setImageUrl(downloadUrl);
    setUploadingImage(false);
    setImageUri(null);
    return downloadUrl;
  };

  const handleUploadImage = async () => {
    if (!imageUri) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    try {
      const url = await uploadImageAsync(imageUri);
      console.log("Image uploaded to:", url);
      Alert.alert("Success", "Image uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Error", error.message);
    }
  };

  const handleAddProduct = async () => {
    const db = connectToDatabase();
    if (!name || !color || !size || !imageUrl) {
      setError('Please enter all values and upload an image');
      return;
    }

    setError('');
    setLoading(true);
    setBackButtonEnabled(false);

    try {
      const productId = Date.now().toString();
      const productRef = doc(collection(db, "products"), productId);

      await setDoc(productRef, {
        name,
        color,
        size,
        imageUrl,
      });

      Alert.alert("Success", "Product added successfully");
      setName('');
      setColor('');
      setSize('');
      setImageUri('');
      setImageUrl('');
      setLoading(false);
      setBackButtonEnabled(true);
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert("Error", error.message);
      setLoading(false);
      setBackButtonEnabled(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Product</Text>
      </View>
      <View style={styles.content}>
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Product Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Color"
          value={color}
          onChangeText={setColor}
        />
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="Size"
          value={size}
          onChangeText={setSize}
        />
        <TouchableOpacity style={styles.selectImageButton} onPress={handleSelectImage}>
          <Text style={styles.selectImageText}>Select Image</Text>
        </TouchableOpacity>
        {imageUri && (
          <>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUploadImage}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.btnText}>Upload Image</Text>
              )}
            </TouchableOpacity>
          </>
        )}
        {imageUrl && !imageUri && (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <TouchableOpacity
            style={styles.btnAddProduct}
            onPress={handleAddProduct}
            disabled={loading}
          >
            <Text style={styles.btnText}>Add Product</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => navigation.replace('admin')}
          style={[styles.backButton, !backButtonEnabled && styles.backButtonDisabled]}
          disabled={!backButtonEnabled}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#6200ee",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "#ffffff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
    borderRadius: 5,
  },
  selectImageButton: {
    backgroundColor: "#6200ee",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  selectImageText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginVertical: 10,
  },
  uploadButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
    backgroundColor: '#4D9899',
    borderRadius: 5,
    margin: 10,
  },
  backButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputError: {
    borderColor: 'red',
  },
  btnAddProduct: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

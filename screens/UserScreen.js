import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
} from "react-native";
import { auth, connectToDatabase } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

export default function UserScreen({ navigation }) {
  const db = connectToDatabase();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productsCollection = collection(db, "products");
      const productSnapshot = await getDocs(productsCollection);
      const productList = productSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    } catch (error) {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSignOut = () => {
    setLoading(true);
    signOut(auth)
      .then(() => {
        setLoading(false);
        navigation.replace("Login");
      })
      .catch((error) => {
        setLoading(false);
        Alert.alert("Error", error.message);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Dashboard</Text>
      </View>
      <View style={styles.content}>
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Product Details...</Text>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                {item.imageUrl && (
                  <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                )}
                <Text style={styles.productText}>Name: {item.name}</Text>
                <Text style={styles.productText}>Color: {item.color}</Text>
                <Text style={styles.productText}>Size: {item.size}</Text>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
          />
        )}
        <TouchableOpacity
          style={styles.btnSignOut}
          onPress={handleSignOut}
        >
          <Text style={styles.btnText}>Sign Out</Text>
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
    width: '100%',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#0000ff",
  },
  btnSignOut: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#841584",
    padding: 10,
    borderRadius: 5,
  },
  btnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  productItem: {
    backgroundColor: "#ffffff",
    borderRadius: 5,
    padding: 15,
    marginVertical: 10,
    borderColor: 'gray',
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productText: {
    fontSize: 16,
    marginBottom: 5,
  },
  productImage: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    textAlign: "center",
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 100,
  },
});

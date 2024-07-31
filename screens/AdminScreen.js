import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
} from "react-native";
import { auth, connectToDatabase, storage } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

export default function AdminScreen({ navigation }) {
  const db = connectToDatabase();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [deletingProductId, setDeletingProductId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productsCollection = collection(db, "products");
      const productSnapshot = await getDocs(productsCollection);
      const productList = productSnapshot.docs.map((doc) => ({
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

  const handleDeleteProduct = async (id, imageUrl) => {
    setDeletingProductId(id);
    try {
      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }

      await deleteDoc(doc(db, "products", id));

      Alert.alert("Success", "Product deleted successfully");
      fetchProducts();
    } catch (error) {
      Alert.alert("Error", "Failed to delete product.");
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.replace("AddProduct")}
        >
          <Text style={styles.btnText}>+ Add Product</Text>
        </TouchableOpacity>
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
                <View style={styles.productItems}>
                  <View style={styles.Items}>
                    <Text style={styles.productText}>Name: {item.name}</Text>
                    <Text style={styles.productText}>Color: {item.color}</Text>
                    <Text style={styles.productText}>Size: {item.size}</Text>
                    <Text style={styles.productText}>GST: {item.gst}</Text>
                    <Text style={styles.productText}>Discount: {item.discount}</Text>
                    <Text style={styles.productText}>ID: {item.productId}</Text>
                    {item.barcode && (
                    <Text style={styles.productText}>Barcode: {item.barcode}</Text>)}
                    <Text style={styles.productText}>HSN Code: {item.hsncode}</Text>
                    <Text style={styles.productText}>Remarks: {item.remarks}</Text>
                  </View>
                  <View style={styles.productActions}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => navigation.replace("EditProduct", { productId: item.id })}
                    >
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteProduct(item.id, item.imageUrl)}
                      disabled={deletingProductId === item.id}
                    >
                      {deletingProductId === item.id ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.actionText}>Delete</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
          />
        )}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.btnUserDetails}
            onPress={() => navigation.replace("UserDetails")}
          >
            <Text style={styles.btnText}>View User Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSignOut}
            onPress={handleSignOut}
          >
            <Text style={styles.btnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    color: "#ffffff",
  },
  addBtn: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  btnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginBottom: 10,
    fontSize: 18,
    color: "#0000ff",
  },
  errorText: {
    color: 'red',
    textAlign: "center",
    fontSize: 16,
  },
  productItems: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  listContainer: {
    paddingBottom: 100,
  },
  productItem: {
    backgroundColor: "#ffffff",
    borderRadius: 5,
    padding: 15,
    flexDirection: "column",
    justifyContent: "space-between",
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
  productActions: {
    flexDirection: "column",
    justifyContent: "space-evenly"
  },
  editBtn: {
    backgroundColor: "#FFA500",
    padding: 5,
    paddingLeft:10,
    paddingRight:10,
    textAlign: "center",
    borderRadius: 5,
  },
  deleteBtn: {
    backgroundColor: "#FF0000",
    paddingLeft:10,
    padding: 5,
    paddingRight:10,
    borderRadius: 5,
  },
  actionText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btnUserDetails: {
    backgroundColor: "#4D9899",
    padding: 10,
    borderRadius: 5,
  },
  btnSignOut: {
    backgroundColor: "#841584",
    padding: 10,
    borderRadius: 5,
  },
});

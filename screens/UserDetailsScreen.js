import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { connectToDatabase } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function UserDetailsScreen({ navigation }) {
  const db = connectToDatabase();
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>
        {item.email} - {item.role}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Details</Text>
      </View>
      <View style={styles.content}>
        {isLoadingUsers ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading User Details...</Text>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <FlatList
            data={users}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
      <TouchableOpacity onPress={() => navigation.replace('admin')} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
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
    padding: 20,
  },
  backButton: {
    alignSelf: 'center',
    padding: 10,
    backgroundColor: '#4D9899',
    borderRadius: 5,
    margin: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 18,
    color: "#0000ff",
  },
  itemContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 5,
    padding: 15,
    marginVertical: 5,
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
  itemText: {
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 100,
  },
  welcome: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
});

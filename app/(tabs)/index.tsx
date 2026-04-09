import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  Alert,
} from 'react-native';

// Main App Component
export default function App() {
  // State variables
  const [task, setTask] = useState(''); // Current task being typed
  const [tasks, setTasks] = useState<{ id: string; text: string; completed: boolean }[]>([]); // List of all tasks

  // Function to add a new task
  const addTask = () => {
    if (task.trim().length === 0) {
      Alert.alert('Error', 'Please enter a task');
      return;
    }

    const newTask = {
      id: Date.now().toString(), // Unique ID for each task
      text: task,
      completed: false,
    };

    setTasks([...tasks, newTask]); // Add new task to the list
    setTask(''); // Clear the input field
    Keyboard.dismiss(); // Hide keyboard
  };

  // Function to delete a task
  const deleteTask = (id: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            const updatedTasks = tasks.filter((task) => task.id !== id);
            setTasks(updatedTasks);
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Function to toggle task completion
  const toggleComplete = (id: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  // Render each task item
  const renderTask = ({ item }: { item: { id: string; text: string; completed: boolean } }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity
        style={styles.taskLeft}
        onPress={() => toggleComplete(item.id)}
      >
        <View style={[styles.checkbox, item.completed && styles.checked]} />
        <Text style={[styles.taskText, item.completed && styles.completedText]}>
          {item.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTask(item.id)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📝 My To-Do List</Text>
        <Text style={styles.subtitle}>
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
        </Text>
      </View>

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a new task..."
          placeholderTextColor="#999"
          value={task}
          onChangeText={setTask}
          onSubmitEditing={addTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Task List */}
      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>✨</Text>
          <Text style={styles.emptyText}>No tasks yet!</Text>
          <Text style={styles.emptySubtext}>
            Add your first task using the input above
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
  },
  checked: {
    backgroundColor: '#007AFF',
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
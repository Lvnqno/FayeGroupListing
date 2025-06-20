import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { openDatabaseSync } from 'expo-sqlite';

const db = openDatabaseSync('peoplelist.db');

type Person = {
  id: number;
  name: string;
  age: number;
};

export default function PeopleList() {
  const [people, setPeople] = useState<Person[]>([]);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');

  useEffect(() => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS people (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER
      );
    `);
    loadPeople();
  }, []);

  const loadPeople = () => {
    const result = db.getAllSync('SELECT * FROM people ORDER BY name ASC;');
    const data: Person[] = result.map((row: any) => ({
      id: row.id,
      name: row.name,
      age: row.age,
    }));
    setPeople(data);
  };

  const addPerson = () => {
    const parsedAge = parseInt(age);
    if (!name.trim() || isNaN(parsedAge)) return;

    db.execSync(
      `INSERT INTO people (name, age) VALUES ('${name.trim().replace(/'/g, "''")}', ${parsedAge});`
    );
    setName('');
    setAge('');
    loadPeople();
  };

  const deletePerson = (id: number) => {
    db.execSync(`DELETE FROM people WHERE id = ${id};`);
    loadPeople();
  };

  const startEditing = (person: Person) => {
    setEditingId(person.id);
    setEditName(person.name);
    setEditAge(person.age.toString());
  };

  const saveEdit = (id: number) => {
    const parsedAge = parseInt(editAge);
    if (!editName.trim() || isNaN(parsedAge)) return;

    db.execSync(
      `UPDATE people SET name = '${editName.trim().replace(/'/g, "''")}', age = ${parsedAge} WHERE id = ${id};`
    );
    setEditingId(null);
    setEditName('');
    setEditAge('');
    loadPeople();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditAge('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>👥 People Listing</Text>
          <Text style={styles.total}>Total People: {people.length}</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Age"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
            <TouchableOpacity style={styles.addButton} onPress={addPerson}>
              <Text style={styles.addButtonText}>Add Person</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ width: '100%' }}>
            {people.map(person => (
              <View key={person.id} style={styles.itemBox}>
                {editingId === person.id ? (
                  <>
                    <TextInput
                      style={styles.editInput}
                      value={editName}
                      onChangeText={setEditName}
                    />
                    <TextInput
                      style={styles.editInput}
                      value={editAge}
                      onChangeText={setEditAge}
                      keyboardType="numeric"
                    />
                    <View style={styles.buttonRow}>
                      <TouchableOpacity style={styles.saveButton} onPress={() => saveEdit(person.id)}>
                        <Text style={styles.buttonText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.itemText}>{person.name} - Age: {person.age}</Text>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity style={styles.editButton} onPress={() => startEditing(person)}>
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.deleteButton} onPress={() => deletePerson(person.id)}>
                        <Text style={styles.buttonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9FF',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4B2991',
  },
  total: {
    fontSize: 20,
    marginBottom: 15,
    color: '#6C63FF',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    width: '90%',
    padding: 10,
    backgroundColor: '#fff',
    borderColor: '#999',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  itemBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 6,
    marginHorizontal: 10,
    borderLeftWidth: 6,
    borderLeftColor: '#6C63FF',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#2196F3',
    padding: 6,
    borderRadius: 6,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 6,
    borderRadius: 6,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 6,
    borderRadius: 6,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: '#999',
    padding: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';

export function FirstScreen() {
  useEffect(() => {
    document.title = "Первая";
  }, []);
  
  return (
    <View style={{
      width: '100%',
      display: 'flex', 
      justifyContent: 
      'center', 
      alignContent: 'center',
      }}>
        <Text>Hello React Module 1! This is an example component</Text>
    </View>
  );
}
import { useNotification } from '@client/core/services/providers/notificationProvider';
import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';

export function FirstScreen() {
  const {pushDialog, pushNotify} = useNotification();

  const tstDia = async () => {
    const ok = await pushDialog({
      type: 'confirm',
      message: 'tosto',
      onConfirm: () => {
        console.log('confo');
        return true;
      },
      onCancel: () => {
        console.log('canco');
        return true;
      },
    });

    alert(ok)
  }

  const tstDia2 = () => {
    pushNotify({
      type: 'info',
      message: String(Math.random() * 10000),
    });
  }

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
        <Button
          title='confi'
          onPress={tstDia}
        />
        <Button
          title='noto'
          onPress={tstDia2}
        />
    </View>
  );
}
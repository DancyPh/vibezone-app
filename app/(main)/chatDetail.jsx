import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getUserData } from '../../services/userService';
import { loadMessages } from '../../services/chatService';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header'

const ChatDetail = () => {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);

  const handleNewMessage = async (payload) => {
    console.log('get new message payload: ', payload); // Xem payload nhận được
    if (payload.eventType === 'INSERT' && payload?.new?.id) {
      const newMessage = { ...payload.new };
      let res = await getUserData(newMessage.senderId); // Sử dụng senderId thay vì userId
      newMessage.user = res.success ? res.data : {};
      // Thêm tin nhắn mới vào cuối danh sách
      setMessages(prevMessages => [...prevMessages, newMessage]);
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };
  
  // Fetch previous messages
  useEffect(() => {
    if (!params.userId || !user) {
      console.error('User or params.userId is missing');
      return;
    }

    fetchMessages();

    const messageChannel = supabase
    .channel('messages')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' }, //, filter: `senderId=eq.${user.id},receiverId=eq.${params.userId}`
      (payload) => handleNewMessage(payload)
    )
    .subscribe();

    return () => {
        supabase.removeChannel(messageChannel);
    };
  }, [params.userId, user.id]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          senderId: user.id,
          receiverId: params.userId,
          message: newMessage,
          created_at: new Date().toISOString(),
        }]);

      if (error) {
        console.log('Error sending message:', error);
      } else {
        setNewMessage(''); 
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }
  };

  const fetchMessages = async () => {
    let res = await loadMessages(user.id, params.userId);

    if (!res.success) {
      console.log('Error fetching messages:', res.error);
    } else {
      setMessages(res.data);
    }
  };

  if (!params.userId || !user.id) {
    return <Text>Loading...</Text>; 
  }

  return (
    <ScreenWrapper>
        <View style={styles.container}>
            <Header title={params.name}/>
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                <View style={item.senderId === user.id ? styles.sentMessage : styles.receivedMessage}>
                    <Text>{item.message}</Text>
                </View>
                )}
            />
            <View style={styles.inputContainer}>
                <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message"
                style={styles.input}
                />
                <Button title="Send" onPress={handleSendMessage} />
            </View>
        </View>

    </ScreenWrapper>
  );
};

export default ChatDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECECEC',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    padding: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    marginRight: 10,
  },
});

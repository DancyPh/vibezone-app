import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { fetchUsers } from '../../services/userService';
import ChatItem from '../../components/ChatItem';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useRouter } from 'expo-router';
import Header from '../../components/Header'

const Chat = () => {

  const [users, setUsers] = useState([]);

  const router = useRouter();
  useEffect(() => {
      const getUsers = async () => {
        const res = await fetchUsers();
        if(res.success){
          setUsers(res.data);
        }else {
          console.log(res.msg);
        }
      }

      getUsers();
  }, [])

  //console.log(users)
  
  const handleChatPress = async(user) => {
    router.push({
      pathname: "/(main)/chatDetail",
      params: {
        userId: user.id,  
        name: user.name,
        image: user.image
      }
    })
  }

  return (
    <ScreenWrapper>
        <View style={{ flex: 1, padding: 10 }}>
          <Header title="Chats"/>
          <FlatList
            style={{marginTop: 20}}
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleChatPress(item)}>
                  <ChatItem
                    item={item}
                  />
              </TouchableOpacity>
            )}
          />
      </View>
    </ScreenWrapper>
    
  );
}


export default Chat

const styles = StyleSheet.create({})
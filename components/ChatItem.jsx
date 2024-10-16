import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { theme } from '../constants/theme'
import { hp } from '../helper/common'
import Avatar from './Avatar'

const ChatItem = ({
    item, 
}) => {

    
  return (
    <View style={styles.container}>
        <Avatar 
            uri={item?.image}
        />
      <Text style={styles.text}>{item?.name}</Text>
      <Text>

      </Text>
    </View>
  )
}

export default ChatItem

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        gap: 7,
        marginBottom: 20
    },
    content: {
        backgroundColor: 'rgba(0,0,0,0.06)',
        flex: 1,
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: theme.radius.md,
        borderCurve: 'continuous'
    },
    highlight: {
        backgroundColor: 'white',
        shadowColor: theme.colors.dark,
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 10,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3
    },
    text: {
        fontSize: hp(1.6),
        fontWeight: theme.fonts.medium,
        colors: theme.colors.darkLight
    }
})
import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Icon from '../assets/icons'
import { theme } from '../constants/theme'

const BackButton = ({size=26, router, name, bgColor = false}) => {
  return (
    <Pressable onPress={()=> router.back()} style={[styles.button, bgColor && { backgroundColor: 'rgba(0,0,0,0.07)'}]}>
        <Icon name={name} strokeWidth={2.5} size={size} color={theme.colors.textLight}/>
    </Pressable>
  )
}

export default BackButton

const styles = StyleSheet.create({
    button: {
      alignSelf: 'flex-start',
      padding: 5, 
      borderRadius: theme.radius.sm,
    }
})
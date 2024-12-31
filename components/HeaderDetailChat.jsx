import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { hp } from '../helper/common'
import { theme } from '../constants/theme'
import BackButton from './BackButton'
import { useRouter } from 'expo-router'
import Avatar from './Avatar'

const HeaderDetailChat = ({
    title,
    uri,
    showBackButton = true,
    mb = 10
}) => {
    const router = useRouter()
  return (
    <View style={[styles.container, {marginBottom: mb}]}>
      {
        showBackButton && (
            <View style={styles.showBackButton}>
                <BackButton name="arrowLeft" router={router}/>
            </View>
        )
      }
      
      <Avatar uri={uri}/>
      <Text style={styles.title}> {title || ""}</Text>
    </View>
  )
}

export default HeaderDetailChat

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 7,
        gap: 10
    }, 
    title: {
        fontSize: hp(2.7),
        fontWeight: theme.fonts.semibold,
        color: theme.colors.dark
    },
    showBackButton: {
        flex: 0
    }
})
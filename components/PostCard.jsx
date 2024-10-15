import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import {theme} from '../constants/theme'
import {hp, stripHtmltags, wp} from '../helper/common'
import Avatar from '../components/Avatar'
import moment from 'moment'
import Icon from '../assets/icons'
import RenderHtml from 'react-native-render-html'
import { Image } from 'expo-image'
import { Video } from 'expo-av'
import { downLoadFile, getSupabaseFileUrl } from '../services/imgService'
import { createPostLike, removePostLike } from '../services/postService'
import * as Sharing from 'expo-sharing'
import Loading from '../components/Loading'

const textStyle = {
  color: theme.colors.dark,
  fontSize: hp(1.75)
}

const tagsStyles = {
  div: textStyle,
  p: textStyle,
  ol: textStyle,
  h1: {
    color: theme.colors.dark
  },
  h4: {
    color: theme.colors.dark
  }
}

const PostCard = ({
    item,
    currentUser,
    router,
    hashShadow = true,
    showMoreIcon = true,
    showDelete = false,
    onDelete=()=>{},
    onEdit =() => {}
}) => {
    //console.log('post item: ', item)
    const shadowStyles = {
        shadowOffset: {
            with: 0,
            height: 2
        },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 1
    }

    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
      if (item?.postLikes) {
        setLikes(item.postLikes);
      }
    }, [item]);
    //console.log(getSupabaseFileUrl(item?.file))

    // open detail post
    const openPostDetails = () => {
      if(!showMoreIcon) return null;
      router.push({pathname: 'postDetails', params: {postId: item?.id}})
    }


    // like post
    const onLike = async () => {
      if(liked){
        // remove like
        let updataLikes = likes.filter(like => like.userId != currentUser?.id);
        setLikes([...updataLikes]);
        let res = await removePostLike(item?.id, currentUser?.id);
        console.log('remove like: ', res);
        if(!res.success){
          Alert.alert('Post', 'Something went wrong!');
        }
      }else{
        // create like      
        let data = {
          userId: currentUser?.id,
          postId: item?.id
        };
      
        // Attempt to add the like
        const res = await createPostLike(data);
        console.log('added like: ', res);
      
        if (!res.success) {
          Alert.alert('Post', 'Something went wrong!');
        } else {
          // If successful, update the likes stater
          setLikes((prevLikes) => [...prevLikes, data]);
        }
      }
      
    };
    

    

    // share post
    const onShare = async () => {
      let content = { message: stripHtmltags(item?.body) };
      if (item?.file) {
        setLoading(true);
        let fileUri = await downLoadFile(getSupabaseFileUrl(item?.file).uri);
        setLoading(false);
    
        if (fileUri && await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Sharing not available or file download failed.');
        }
      } else {
        Share.share(content);
      }
    };

    const handlePostDelete = ()=>{
      Alert.alert('Confirm', "Are you sure you want to delete", [
        {
          text: 'Cancel',
          onPress: () => console.log("modal cancelled"),
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: () => onDelete(item),
          style: 'destructive'
        }
      ])
    }

    const liked = likes.filter(like => like.userId == currentUser?.id)[0]? true : false;
    const createdAt = moment(item?.created_at).format('MMM d');

  return (
    <View style={[styles.container, hashShadow && shadowStyles]}>
      <View style={styles.header}>
        {/* userInfor */}
        <View style={styles.userInfo}>
            <Avatar 
              size={hp(4.5)}
              uri={item?.user?.image}
              rounded={theme.radius.md}
            />
            <View style={{gap: 2}}>
                <Text style={styles.username}>{item?.user?.name}</Text>
                <Text style={styles.postTime}>{createdAt}</Text>
            </View>
        </View>
        {
          showMoreIcon && (
            <TouchableOpacity onPress={openPostDetails}>
              <Icon name="threeDotsHorizontal" size={hp(3.4)} strokeWidth={3} color={ theme.colors.textLight}/>
            </TouchableOpacity>
          )
        }

        {
          showDelete && currentUser.id == item?.userId && (
            <View style={styles.actions}>
              <TouchableOpacity onPress={()=>onEdit(item)}>
                <Icon name="edit" size={hp(2.4)} color={ theme.colors.textLight}/>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePostDelete}>
                <Icon name="delete" size={hp(2.4)} color={ theme.colors.rose}/>
              </TouchableOpacity>
            </View>
          )
        }
        
      </View> 
      {/* post body and media */}
      <View style={styles.content}>
          <View style ={ styles.postBody}>
              {
                item?.body && (
                  <RenderHtml 
                    contentWidth={wp(100)}
                    source={{html: item?.body}}
                    tagsStyles={tagsStyles}
                  />
                )
              }
          </View>
          {/* post image */}
          {
            item?.file && item?.file?.includes('postImages') && (
              <Image 
                source={getSupabaseFileUrl(item?.file)}
                transition={100}
                style={styles.postMedia}
                contentFit='cover'
              />
            )
          }
          {/* post videos */}
          {
            item?.file && item.file?.includes('postVidoes') && (
              <Video
                style={ [styles.postMedia, {height: hp(30)}]}
                source={getSupabaseFileUrl(item?.file)}
                useNativeControls
                resizeMode='cover'
                isLooping
              />
            )
          }
      </View>

      {/* Like, comment and share */}
      <View style={styles.footer}>
          <View style={styles.footerButton}>
            <TouchableOpacity onPress={onLike}>
              <Icon name="heart" size={24} fill={liked? theme.colors.rose: 'transparent'} color={liked? theme.colors.rose : theme.colors.textLight}/>
            </TouchableOpacity>
            <Text style={styles.count}>
              {
                likes?.length
              }
            </Text>
          </View>
          <View style={styles.footerButton}>
            <TouchableOpacity onPress={openPostDetails}>
              <Icon name="comment" size={24} color={theme.colors.textLight}/>
            </TouchableOpacity>
            <Text style={styles.count}>
              {
                item?.comments[0]?.count
              }
            </Text>
          </View>
          <View style={styles.footerButton}>
            {
              loading? (
                  <Loading size="small"/>
              ):(
                <TouchableOpacity onPress={onShare}>
                  <Icon name="share" size={24} color={theme.colors.textLight}/>
                </TouchableOpacity>
              )
            }
            
          </View>
      </View>

    </View>
  )
}

export default PostCard

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xxl*1.1,
    borderCurve:'continuous',
    padding: 10,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: theme.colors.darkLight
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  username: {
    fontSize: hp(1.7),
    color: theme.colors.dark,
    fontWeight: theme.fonts.medium
  },
  postTime: {
    fontSize: hp(1.4),
    color: theme.colors.darkLight,
    fontWeight: theme.fonts.medium
  },
  content: {
    gap: 10
  },
  postMedia: {
    height: hp(40),
    width: '100%',
    borderRadius: theme.radius.xl,
    borderCurve:'continuous'
  },
  postBody: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  footerButton: {
    marginLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18
  },
  count: {
    color: theme.colors.dark,
    fontSize: hp(1.8)
  }
})
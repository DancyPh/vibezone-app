import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import {useLocalSearchParams, useRouter} from 'expo-router'
import { createComment, fetchPostDetails, removeComment, removePost } from '../../services/postService';
import { hp, wp } from '../../helper/common';
import { theme } from '../../constants/theme';
import PostCard from '../../components/PostCard';
import {useAuth} from '../../contexts/AuthContext'
import ScreenWrapper from'../../components/ScreenWrapper'
import Loading from '../../components/Loading';
import Input from '../../components/Input'
import Icon from '../../assets/icons';
import CommentItem from '../../components/CommentItem';
import { supabase } from '../../lib/supabase';
import { getUserData } from '../../services/userService';
import { createNotification } from '../../services/notificationService';



const PostDetails = () => {
    const {postId, commentId} = useLocalSearchParams();
    const {user} = useAuth();
    const router = useRouter();
    const [startLoading, setStartLoading] = useState(true);
    const inputRef = useRef(null);
    const commentRef = useRef("");
    const [loading, setLoading] = useState(false);
    //console.log(postId);

    const [post, setPost] = useState(null); // luu tru bai dang

    //console.log('post detail item: ', post)

    const handleNewComment = async (payload) => {
        console.log('get new comment: ', payload.new);
        if(payload.new){
            let newComment = {...payload.new};
            let res = await getUserData(newComment.userId);
            newComment.user = res.success? res.data: {};
            setPost(prevPost => {
                return {
                    ...prevPost,
                    comments: [newComment, ...prevPost.comments]
                }
            })
        }
    }

    // fetch post detail
    useEffect(()=> {
        let commentChannel = supabase
        .channel('comments')
        .on('postgres_changes', 
          {event: '*', schema: 'public', table: 'comments', filter: `postId=eq.${postId}`},
          (payload) => handleNewComment(payload)
        )
        .subscribe();
        //getPosts();
        getPostDetails();

        return () => {
          supabase.removeChannel(commentChannel);
        }
      }, [])

    // post detail
    const getPostDetails= async()=> {
        let res = await fetchPostDetails(postId);
        if(res.success) setPost(res.data);
        setStartLoading(false);
    }


    // create new comment
    const onNewComment = async () => {
        if(!commentRef.current) return null;
        let data = {
            userId: user?.id,
            postId: post?.id,
            text: commentRef.current 
        }

        // create comment
        setLoading(true);
        let res = await createComment(data);
        setLoading(false);
        if(res.success){
            if(user.id != post.userId){
                let notify = {
                    senderId: user.id,
                    receiverId: post.userId,
                    title: 'Đã bình luận bài đăng của bạn',
                    data: JSON.stringify({
                        postId: post.id,
                        commentId: res?.data?.id
                    })
                }

                createNotification(notify);
            }
            inputRef?.current?.clear();
            commentRef.current = "";
        }else{
            Alert.alert('Comment', res.msg);
        }
    }

    // delete one comment
    const onDeleteComment = async (comment) => {
        //console.log('deleting comment: ', comment)
        let res = await removeComment(comment?.id);
        if(res.success){
            setPost(prevPost => {
                let updatePost = {...prevPost};
                updatePost.comments = updatePost.comments.filter(c => c.id != comment.id);
                return updatePost;
            })
        }else{
            Alert.alert('Comment', res.msg);
        }
    }

    // delete post
    const onDeletePost = async (item) => {
        let res = await removePost(post.id);
        if(res.success){
            router.back();
            console.log(res.data);
        }else{
            Alert.alert('Post', res.msg);
        }
    }

    // edit post
    const onEditPost = async (item) => {
        router.back();
        router.push({
            pathname: 'newPost',
            params: {
                ...item
            }
        })
    }

    if(startLoading){
        return (
            <View style={styles.center}>
                <Loading/>
            </View>
        )
    }
    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                    <PostCard
                        item={{...post, comments: [{count: post?.comments?.length}]}}
                        currentUser={user}
                        router={router}
                        hashShadow={false}
                        showMoreIcon={false}
                        showDelete={true}
                        onDelete={onDeletePost}
                        onEdit={onEditPost}
                    />

                    {/* comment input */}
                    <View style={styles.inputContainer}>
                        <Input
                            inputRef={inputRef}
                            placeholder="Comment..."
                            onChangeText = {value => commentRef.current = value}
                            placeholderTextColor={theme.colors.textLight}
                            containerStyles={{flex: 1, height: hp(6.2), borderRadius: theme.radius.xl}}
                        />
                        {
                            loading ? (
                                <View style={styles.loading}>
                                    <Loading size="small"/>
                                </View>
                            ): (
                                <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
                                    <Icon name="send" color={theme.colors.primary}/>
                                </TouchableOpacity>
                            )
                        }
                        
                    </View>

                    {/* comment list */}
                    <View style={{marginVertical: 15, gap: 17}}>
                        {
                            post?.comments?.map(comment => 
                                <CommentItem
                                    key={comment?.id?.toString()}
                                    item={comment}
                                    onDelete={onDeleteComment}
                                    highlight ={comment.id == commentId}
                                    canDelete={user.id == comment.userId || user.id == post.userId}
                                />
                            )
                        }
                        
                        {
                            post?.comments?.length == 0 && (
                                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                    <Text style={{color: theme.colors.dark}}>Be first the comment !</Text>
                                </View>
                            )
                        }
                    </View>
                </ScrollView>
            </View>
        </ScreenWrapper>
    )
}

export default PostDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingVertical: wp(7)
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    list: {
        paddingHorizontal: wp(4)
    },
    sendIcon: {
        alignItems:'center',
        justifyContent: 'center',
        borderWidth: 0.8,
        borderColor: theme.colors.primary,
        borderRadius: theme.radius.lg,
        borderCurve: 'continuous',
        height: hp(5.8),
        width: hp(5.8)
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    notFound: {
        fontSize: hp(2.5),
        color: theme.colors.dark,
        fontWeight: theme.fonts.medium
    },
    loading: {
        height: hp(5.8),
        width: hp(5.8),
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{scale: 1.3}]
    }
})
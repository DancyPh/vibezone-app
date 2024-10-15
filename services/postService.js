import { supabase } from "../lib/supabase";
import { uploadFile } from "./imgService";

export const createOrUpdatePost = async (post) => {
    try{
        // update img
        if(post.file && typeof post.file =='object'){
            let isImage = post?.file?.type == 'image';
            let folderName = isImage? 'postImages': 'postVidoes';
            let fileResult = await uploadFile(folderName, post?.file?.uri, isImage);
            if(fileResult.success) post.file = fileResult.data;
            else{
                return fileResult;
            }
        }

        const {data, error} = await supabase
        .from('posts')
        .upsert(post)
        .select()
        .single();

        if(error){
            console.log('create post error: ', error);
            return{ success: false, msg: 'Khoong the tao bai dang'}
        }

        return {success: true, data: data}
    }catch(e){
        console.log('create post error: ', e);
        return{ success: false, msg: 'Khoong the tao bai dang'}
    }
}


export const fetchPosts = async (limit=10, userId) => {
    try{
        if(userId){
            const {data, error} = await supabase
            .from('posts')
            .select(`
                    *,
                    user: users (id, name, image),
                    postLikes (*),
                    comments (count)
                `)
            .order('created_at', {ascending: false})
            .eq('userId', userId)
            .limit(limit);

            if(error){
                console.log('fetch post error: ', error);
                return{ success: false, msg: 'Khoong the tai bai dang'}
            }

            return {success: true, data: data};
        }else{
            const {data, error} = await supabase
            .from('posts')
            .select(`
                    *,
                    user: users (id, name, image),
                    postLikes (*),
                    comments (count)
                `)
            .order('created_at', {ascending: false})
            .limit(limit);

            if(error){
                console.log('fetch post error: ', error);
                return{ success: false, msg: 'Khoong the tai bai dang'}
            }

            return {success: true, data: data};
        }
    }catch(e){
        console.log('fetch post error: ', e);
        return{ success: false, msg: 'Khoong the tai bai dang'}
    }
}

export const createPostLike = async (postLike) => {
    try{
       
        const {data, error} = await supabase
        .from('postLikes')
        .insert(postLike)
        .select()
        .single();
        if(error){
            console.log('post like  error: ', error);
            return{ success: false, msg: 'Khoong the thich bai dang'}
        }

        return {success: true, data: data};
    }catch(e){
        console.log('post like  error: ', e);
        return{ success: false, msg: 'Khoong the thich bai dang'}
    }
}

export const removePostLike = async (postId, userId) => {
    try{
       
        const {data, error} = await supabase
        .from('postLikes')
        .delete()
        .eq('userId', userId)
        .eq('postId', postId)
        
        if(error){
            console.log('post like  error: ', error);
            return{ success: false, msg: 'Khoong the go bo thich bai dang'}
        }

        return {success: true};
    }catch(e){
        console.log('post like  error: ', e);
        return{ success: false, msg: 'Khoong the go bo thich bai dang'}
    }
}

// fetch post detail
export const fetchPostDetails = async (postId) => {
    try{
        const {data, error} = await supabase
        .from('posts')
        .select(`
                *,
                user: users (id, name, image),
                postLikes (*),
                comments(*, user: users(id, name, image))
            `)
        .eq('id', postId)
        .order("created_at", {ascending: false, foreignTable: 'comments'})
        .single();

        if(error){
            console.log('fetch post detail error: ', error);
            return{ success: false, msg: 'Khoong the tai bai dang'}
        }

        return {success: true, data: data};
    }catch(e){
        console.log('fetch post detail error: ', e);
        return{ success: false, msg: 'Khoong the tai bai dang'}
    }
}

// create new comment
export const createComment = async (comment) => {
    try{
       
        const {data, error} = await supabase
        .from('comments')
        .insert(comment)
        .select()
        .single();
        if(error){
            console.log('commnet  error: ', error);
            return{ success: false, msg: 'Khoong the thich bai dang'}
        }

        return {success: true, data: data};
    }catch(e){
        console.log('commnet  error: ', e);
        return{ success: false, msg: 'Khoong the thich bai dang'}
    }
}

export const removeComment = async (commentId) => {
    try{
       
        const {error} = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        
        if(error){
            console.log('delete comment  error: ', error);
            return{ success: false, msg: 'Khoong the go bo thich bai dang'}
        }

        return {success: true, data: {commentId}};
    }catch(e){
        console.log('delete comment  error: ', e);
        return{ success: false, msg: 'Khoong the go bo thich bai dang'}
    }
}

export const removePost = async (postId) => {
    try{
       
        const {error} = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        
        if(error){
            console.log('delete post  error: ', error);
            return{ success: false, msg: 'Khoong the go bo bai dang'}
        }

        return {success: true, data: {postId}};
    }catch(e){
        console.log('delete post  error: ', e);
        return{ success: false, msg: 'Khoong the go bo bai dang'}
    }
}
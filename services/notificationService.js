import { supabase } from "../lib/supabase";



export const createNotification = async (notification) => {
    try{
       
        const {data, error} = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();
        if(error){
            console.log('notification  error: ', error);
            return{ success: false, msg: 'Some thing went wrong !'}
        }

        return {success: true, data: data};
    }catch(e){
        console.log('notification  error: ', e);
        return{ success: false, msg: 'Some thing went wrong !'}
    }
}

export const fetchNotification = async (receiverId) => {
    try{
        const {data, error} = await supabase
        .from('notifications')
        .select(`
                *,
                sender: senderId(id, name, image)
            `)
        .eq('receiverId', receiverId)
        .order("created_at", {ascending: false});

        if(error){
            console.log('fetch notification error: ', error);
            return{ success: false, msg: 'Khoong the tai bai dang'}
        }

        return {success: true, data: data};
    }catch(e){
        console.log('fetch notification error: ', e);
        return{ success: false, msg: 'Khoong the tai bai dang'}
    }
}
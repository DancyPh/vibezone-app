import { supabase } from "../lib/supabase"

export const getUserData  = async (userId) => {
    try{
        const {data, error} = await supabase
        .from('users')
        .select()
        .eq('id', userId)
        .single();

        if(error){
            return{success: false, msg: error?.message}
        }
        return {success: true, data}
    }catch(e){
        console.log("error",e)
        return {success: false, msg: e.message}
    }
}

export const updateUser  = async (userId, data) => {
    try{
        const {error} = await supabase
        .from('users')
        .update(data)
        .eq('id', userId);

        if(error){
            return{success: false, msg: error?.message}
        }
        return {success: true, data}
    }catch(e){
        console.log("error",e)
        return {success: false, msg: e.message}
    }
}

export const fetchUsers = async() => {
    try{
        const {data, error} = await supabase
        .from('users')
        .select('id, name, image')

        if(error){
            return {success: false, msg: error?.message};
        }

        return {success: true, data: data};
    }catch(error){
        console.log("error: ", error)
        return{success: false, msg: error?.message};
    }
   
}
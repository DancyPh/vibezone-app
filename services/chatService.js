import { supabase } from "../lib/supabase";



export const loadMessages = async (userId, receiverId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(senderId.eq.${userId},receiverId.eq.${receiverId}),and(senderId.eq.${receiverId},receiverId.eq.${userId})`)
      .order('created_at', { ascending: true });
  
    if (error) {
      console.log('Error fetching messages:', error);
      return { success: false, error: error.msg }; // Trả về dữ liệu null và lỗi nếu có
    }
  
    return { success: true, data: data }; // Trả về dữ liệu và không có lỗi
  };
// import React, { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom' 
// import moment from 'moment'
// import { useAuth, useUser } from '@clerk/react'
// import toast from 'react-hot-toast'
// import api from '../api/axios'

// const RecentMessages = () => {
//     const [messages,setMessages]=useState([])
//     const {user} = useUser()
//     const {getToken} = useAuth()

//     const fetchRecentMessages= async () => {
//        try {
//          const token = await getToken()
//          const { data } = await api.get(`/api/message/recent-messages`,{
//           headers:{Authorization: `Bearer ${token}`}
//         })
//          if (data.success) {
//               // Group messages by sender and get the latest message for each sender
//               const groupedMessages = data.messages.reduce((acc, message) => {
//                  const senderId = message.from_user_id._id
//                  if (!acc[senderId] ||new Date(message.createdAt) > new Date(acc[senderId].createdAt)) {
//                    acc[senderId] = message
//                  }
//                  return acc
//               }, {})
//                  const  sortedMessages = Object.values(groupedMessages).sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
//                  setMessages(sortedMessages)
//           }else{
//             toast.error(data.message)
//           }
//        } catch (error) {
//           toast.error(error.message)
//        }
//     }

//     useEffect(()=>{
//       if(user){
//          fetchRecentMessages()
//          const interval = setInterval(fetchRecentMessages,30000)
//          return ()=>{clearInterval(interval)}
//       }
       
// },[user?.id])


//   return (
//     <div className='bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>
//           <h3 className='font-semibold text-slate-8 mb-4'>Recent Messages</h3>
//           <div className='flex flex-col max-h-56 overflow-y-scroll no-scrollbar '>
//             {
//               messages.map((message,index)=>(
//                 <Link to={`/messages/${message.from_user_id._id}`} key={index} className='flex items-start gap-2 py-2 hover:bg-slate-100' >
//                  <img src={message.from_user_id.profile_picture} alt="" className='w-8 h-8 rounded-full' />
//                  <div className='w-full'>
//                       <div className='flex justify-between'>
//                           <p className='font-medium'>{message.from_user_id.full_name}</p>
//                           <p className='text-[10px] text-slate-400'>{moment(message.createdAt).fromNow()}</p>
//                       </div>
//                       <div className='flex justify-between'>
//                         <p className='text-gray-500'>{message.text ?message.text :'media'}</p>
//                         {!message.seen && <p className='bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px]'>1</p>}
//                       </div>
//                  </div>
                 
//                 </Link>
//               ))
//             }

//           </div>
//     </div>
//   )
// }

// export default RecentMessages

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom' 
import moment from 'moment'
import { useAuth, useUser } from '@clerk/react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const RecentMessages = () => {
    const [messages,setMessages]=useState([])
    const {user} = useUser()
    const {getToken} = useAuth()

    const fetchRecentMessages= async () => {
       try {
         const token = await getToken()
         const { data } = await api.get(`/api/message/recent-messages`,{
          headers:{Authorization: `Bearer ${token}`}
        })
         if (data.success) {
              // Backend already sends latest message per conversation (sent + received)
              const sortedMessages = [...data.messages].sort(
                (a,b)=> new Date(b.createdAt) - new Date(a.createdAt)
              )
              setMessages(sortedMessages)
          }else{
            toast.error(data.message)
          }
       } catch (error) {
          toast.error(error.message)
       }
    }

    useEffect(()=>{
      if(user){
         fetchRecentMessages()
         const interval = setInterval(fetchRecentMessages,4000)
         return ()=>{clearInterval(interval)}
      }
    },[user?.id])


  return (
    <div className='bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>
          <h3 className='font-semibold text-slate-8 mb-4'>Recent Messages</h3>
          <div className='flex flex-col max-h-56 overflow-y-scroll no-scrollbar '>
            {
              messages.map((message)=>{
                const isSentByMe = message.from_user_id._id === user.id
                // Samne wala user (jisse chat ho rahi hai)
                const otherUser = isSentByMe ? message.to_user_id : message.from_user_id
                if (!otherUser) return null

                return (
                <Link to={`/messages/${otherUser._id}`} key={otherUser._id} className='flex items-start gap-2 py-2 hover:bg-slate-100' >
                 <img src={otherUser.profile_picture} alt="" className='w-8 h-8 rounded-full' />
                 <div className='w-full'>
                      <div className='flex justify-between'>
                          <p className='font-medium'>{otherUser.full_name}</p>
                          <p className='text-[10px] text-slate-400'>{moment(message.createdAt).fromNow()}</p>
                      </div>
                      <div className='flex justify-between'>
                        <p className='text-gray-500'>
                          {isSentByMe && 'You: '}{message.text ? message.text : 'media'}
                        </p>
                        {/* Unread badge sirf mile hue messages ke liye */}
                        {!isSentByMe && !message.seen && <p className='bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px]'>1</p>}
                      </div>
                 </div>
                </Link>
                )
              })
            }

          </div>
    </div>
  )
}

export default RecentMessages
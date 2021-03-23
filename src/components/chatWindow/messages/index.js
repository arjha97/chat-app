import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router';
import { Alert } from 'rsuite';
import { auth, database } from '../../../misc/firebase';
import { transformToArrayWithId } from '../../../misc/helpers';
import MessageItem from './MessageItem';

const Messages = () => {

    const [messages, setMessages] = useState(null);
    const {chatId} = useParams();

    const isChatEmpty = messages && messages.length === 0;

    const canShowMessages = messages && messages.length > 0;

    useEffect(() => {
        const messagesRef = database.ref('/messages')

        messagesRef.orderByChild('roomId').equalTo(chatId).on('value', (snap) => {
            const data = transformToArrayWithId(snap.val());

            setMessages(data);
        })

        return () => {
            messagesRef.off('value')
        }
    }, [chatId]);

    const handleAdmin = useCallback(async (uid) => {
        const adminsRef = database.ref(`/rooms/${chatId}/admins`);
         
        let alertMsg;
        await adminsRef.transaction(admins => {

            if(admins){
                if(admins[uid]){
                    admins[uid] = null;
                    alertMsg = 'admin permission removed';
                } else {
                    admins[uid] = true;
                    alertMsg = 'admin permission granted'; 
                }
            }

            return admins;
        });

        Alert.info(alertMsg, 4000);

    }, [chatId]);

    const handleLike = useCallback(async (msgId) => {
        const { uid } = auth.currentUser;
        const messagesRef = database.ref(`/messages/${msgId}`);
         
        let alertMsg;
        await messagesRef.transaction(msg => {

            if(msg){
                if(msg.likes && msg.likes[uid]){
                    msg.likeCount -= 1;
                    msg.likes[uid] = null;
                    alertMsg = 'Like removed';
                } else {
                    msg.likeCount += 1;

                    if(!msg.likes){
                        msg.likes = {};
                    }
                    msg.likes[uid] = true;
                    alertMsg = 'Like Added'; 
                }
            }

            return msg;
        });

        Alert.info(alertMsg, 2000);
    },[])

    return (
       <ul className="msg-list custom-scroll">
           {
               isChatEmpty && <li>No messages yet..</li>
           }
           {
               canShowMessages && messages.map(msg => <MessageItem key={msg.id} message={msg} handleAdmin={handleAdmin} handleLike={handleLike} />)
           }
       </ul>
    )
}

export default Messages;

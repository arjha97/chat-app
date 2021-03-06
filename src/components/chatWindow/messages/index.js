import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router';
import { Alert } from 'rsuite';
import { auth, database, storage } from '../../../misc/firebase';
import { groupBy, transformToArrayWithId } from '../../../misc/helpers';
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
    },[]);

    const handleDelete = useCallback( async (msgId, file) => {
        if(!window.confirm('Delete this message')){
            return;
        }

        const isLast = messages[messages.length -1].id === msgId;

        const updates = {};

        updates[`/messages/${msgId}`] = null;

        if(isLast && messages.length > 1){
            updates[`/rooms/${chatId}/lastMessage`] = {
                ...messages[messages.length - 2],
                msgId: messages[messages.length - 2].id
            }
        }

        if(isLast && messages.length === 1){
            updates[`/rooms/${chatId}/lastMessage`] = null;
        }

        try {
            await database.ref().update(updates);
            Alert.info('Message has been deleted', 3000);
        } catch (err) {
            return Alert.error(err.message, 3000);
        }

        if(file){
            
            try {
                const fileRef= await storage.refFromURL(file.url)
                await fileRef.delete()
            } catch (err) {
                Alert.error(err.message, 3000);
            }
        }
    }, [chatId, messages]);

    const rrenderMessages = () => {
        const groups = groupBy(messages, (item) => new Date(item.createdAt).toDateString());

        const items = [];

        Object.keys(groups).forEach((date) => {
            items.push(<li key={date} className="text-center mb-1 padded" >{date}</li>);

            const msgs = groups[date].map(msg => (
                <MessageItem key={msg.id} message={msg} handleAdmin={handleAdmin} handleLike={handleLike} handleDelete={handleDelete} />
            ));

            items.push(...msgs);
        })

        return items; 
    }

    return (
       <ul className="msg-list custom-scroll">
           {
               isChatEmpty && <li>No messages yet..</li>
           }
           {
               canShowMessages && rrenderMessages()
           }
       </ul>
    )
}

export default Messages;

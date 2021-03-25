import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { Alert, Icon, Input, InputGroup } from 'rsuite';
import firebase from 'firebase/app';

import { useProfile } from '../../../context/profile.context';

import { database } from '../../../misc/firebase';
import AttachmentBtnModal from './AttachmentBtnModal';

function assembleMessage(profile, chatId){
  return {
    roomId: chatId,
    author: {
      name: profile.name,
      uid: profile.uid,
      createdAt: profile.createdAt,
      ...(profile.avatar ? {avatar: profile.avatar} : {})
    },
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    likeCount: 0
  }
}

const Bottom = () => {

  const [input, setInput] = useState('');

  const {chatId} = useParams();
  const { profile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);

  const onInputChange = useCallback((value) => {
     setInput(value);
  }, []);

  const onSendClick = async () => {
   if(input.trim() === ''){
     return ;
   }

   const messageData = assembleMessage(profile, chatId);
   messageData.text = input;

   const updates = {};

   const messageId = database.ref('messages').push().key;

   updates[`/messages/${messageId}`] = messageData;
   updates[`/rooms/${chatId}/lastMessage`] = {
     ...messageData,
     messageData: messageId
   };
   
   setIsLoading(true);
   try {
     await database.ref().update(updates);
     setInput('');
     setIsLoading(false);

     Alert.info('Message has been sent', 3000);
    
   } catch (err) {
     setIsLoading(false);
     Alert.error(err.message, 3000)
   }

  }

  const onKeyDown = (e) => {
    if(e.keyCode === 13) {
      e.preventDefault();
      onSendClick();
    }
  }

  const afterUpload = useCallback(async (files) => {
    setIsLoading(true);

    const updates = {};

    files.forEach(file => {
      const messageData = assembleMessage(profile, chatId);
      messageData.file = file;

      const messageId = database.ref('messages').push().key;

      updates[`/messages/${messageId}`] = messageData;
    })

    const lastMsgId = Object.keys(updates).pop();
    updates[`/rooms/${chatId}/lastMessage`] = {
      ...updates[lastMsgId],
      messageData: lastMsgId
    };

    try {
      await database.ref().update(updates);
     
      setIsLoading(false);
 
      Alert.info('Message has been sent', 3000);
     
    } catch (err) {
      setIsLoading(false);
      Alert.error(err.message, 3000)
    }
  }, [chatId, profile])

    return (
        <div>
          <InputGroup>
           <AttachmentBtnModal afterUpload={afterUpload}/>
           <Input placeholder="Write a new msg here..." value={input} onChange={onInputChange} onKeyDown={onKeyDown} />

           <InputGroup.Button color="blue" appearance="primary" onClick={onSendClick} disabled={isLoading}>
             <Icon icon="send" />
           </InputGroup.Button>
          </InputGroup> 
        </div>
    )
}

export default Bottom

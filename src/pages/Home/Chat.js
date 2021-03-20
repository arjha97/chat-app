import React from 'react';
import { useParams } from 'react-router';
import { Loader } from 'rsuite';

import ChatTop from '../../components/chatWindow/top';
import Messages from '../../components/chatWindow/messages';
import ChatBottom from '../../components/chatWindow/bottom';

import { useRooms } from '../../context/rooms.context';
import { CurrentRoomProvider } from '../../context/current-room.context';
import { transformToArray } from '../../misc/helpers';
import { auth } from '../../misc/firebase';


const Chat = () => {

    const {chatId} = useParams();

    const rooms = useRooms();

    if(!rooms){
        return <Loader cenetr vertical size="md" content="loading" speed="normal" />

    }

    const currentRooms = rooms.find(room => room.id === chatId);

    if(!currentRooms){
        return <h6 className="text-center mt-page">Chat {chatId} not found</h6>
    }

    const {name, description} = currentRooms;

    const admins = transformToArray(currentRooms.admins)
    const isAdmin = admins.includes(auth.currentUser.uid);
    const currentRoomData = {
        name,
        description,
        admins,
        isAdmin
    }

    return (
        <CurrentRoomProvider data={currentRoomData}>
          <div className="chat-top">
             <ChatTop/> 
          </div>

          <div className="chat-middle">
             <Messages/> 
          </div>

          <div className="chat-bottom"> 
              <ChatBottom/>
          </div>
        </CurrentRoomProvider>
    )
}

export default Chat

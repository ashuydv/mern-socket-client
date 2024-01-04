import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components'
import { allUserRoute, host } from '../utils/APIRoutes';
import axios from 'axios';
import Contacts from '../components/contacts';
import Welcome from '../components/welcome';
import ChatContainer from '../components/chat-container';
import { io } from 'socket.io-client'

const Chat = () => {
    const socket = useRef();

    const [contacts, setContacts] = useState([])
    const [currentUser, setCurrentUser] = useState(undefined);
    const navigate = useNavigate()
    const [currentChat, setCurrentChat] = useState(undefined)
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('chat-app-user')) {
            navigate('/login')
        } else {
            setCurrentUser(JSON.parse(localStorage.getItem('chat-app-user')))
            setIsLoaded(true)
        }
    }, [])

    useEffect(() => {
        if (currentUser) {
            socket.current = io(host);
            socket.current.emit("add-user", currentUser._id);
        }
    }, [currentUser])

    useEffect(() => {
        const fetchData = async () => {
            if (currentUser) {
                if (currentUser.isAvatarImageSet) {
                    const data = await axios.get(`${allUserRoute}/${currentUser._id}`)
                    setContacts(data.data)
                } else {
                    navigate('/set-avatar')
                }
            }
        }
        fetchData()
    }, [currentUser, navigate])

    const handleChatChange = (chat) => {
        setCurrentChat(chat)
    }

    return (
        <>
            <Container>
                <div className="container">
                    <Contacts contacts={contacts} currentUser={currentUser} changeChat={handleChatChange} />
                    {isLoaded && currentChat === undefined ?
                        <Welcome currentUser={currentUser} /> :
                        <ChatContainer currentChat={currentChat} currentUser={currentUser} socket={socket} />
                    }
                </div>
            </Container>
        </>
    )
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;

export default Chat
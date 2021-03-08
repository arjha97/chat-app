import React, {useCallback} from 'react'
import { Alert, Button, Drawer, Icon } from 'rsuite'
import Dashboard from '.';
import { useMediaQuery, useModalState } from '../../misc/custom-hooks'
import { auth, database } from '../../misc/firebase';
import {isOfflineForDatabase} from '../../context/profile.context';

const DashboardToggle = () => {

    const { isOpen, close, open } = useModalState();
    const isMobile = useMediaQuery('(max-width: 992px )');

    const onSignOut = useCallback(() => {
        database.ref(`/status/${auth.currentUser.uid}`).set(isOfflineForDatabase).then(() => {
            auth.signOut();

            Alert.info('Signed out', 3000);
    
            close();   
        }).catch(err => {
            Alert.error(err.message, 3000)
        });
        
    }, [close])

    return (
        <>
           <Button block color="blue" onClick={open}>
               <Icon icon="dashboard"/>Dashboard
           </Button>
           <Drawer full={isMobile} show={isOpen} onHide={close} placement="left">
              <Dashboard onSignOut={onSignOut}/>
           </Drawer>
        </>
    )
}

export default DashboardToggle;

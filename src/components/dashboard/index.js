import React from 'react'
import { Alert, Button, Divider, Drawer } from 'rsuite'
import {  useProfile } from '../../context/profile.context';
import {getUserUpdates} from '../../misc/helpers';
import { database } from '../../misc/firebase';
import EditableInput from './EditableInput';
import ProviderBlock from './ProviderBlock';
import AvatarUploadBtn from './AvatarUploadBtn';

const Dashboard = ({onSignOut}) => {

    const {profile} = useProfile();

    const onSave = async newData => {

     try {

         const updates = await getUserUpdates(profile.uid, 'name', newData, database);

         database.ref().update(updates);

         Alert.success('Nickname has been changed', 4000)
     } catch (err) {
         Alert.error(err.message, 3000);
     }
    }

    return (
       <>
        <Drawer.Header>
         <Drawer.Title>
          DashBoard
         </Drawer.Title>
        </Drawer.Header>

        <Drawer.Body>
          <h3>Hey, {profile.name.toUpperCase()}</h3>
          <ProviderBlock />
          <Divider />
          <EditableInput
            name="nickname"
            initialValue ={profile.name}
            onSave={onSave}
            label={<h6 className="mb-2">Nickname</h6>}
           />
           <AvatarUploadBtn/>
        </Drawer.Body>

        <Drawer.Footer>
          <Button block color="red" onClick={onSignOut}>
              Sign Out
          </Button>
        </Drawer.Footer>
       </>
    )
}

export default Dashboard

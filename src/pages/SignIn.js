import React from 'react';
import firebase from 'firebase/app';
import { Button, Container, Grid, Icon, Panel, Col, Row, Alert } from 'rsuite'
import { auth, database } from '../misc/firebase'

const SignIn = () => {

   const signInWithProvider = async (provider) => {

    try {
        const {additionalUserInfo, user} = await auth.signInWithPopup(provider);

        if(additionalUserInfo.isNewUser){
            await database.ref(`/profiles/${user.uid}`).set({
                name: user.displayName,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            })
        }

        Alert.success('Signed In');
    }
     catch (err) {
        Alert.error(err.message, 3000)
    }

   } 

   const onFacebookSignIn = () => {
      signInWithProvider(new firebase.auth.FacebookAuthProvider()) 
   };

   const onGoogleSignIn = () => {
      signInWithProvider(new firebase.auth.GoogleAuthProvider()) 
   };


    return (
        <Container>
            <Grid className="mt-page">
                <Row>
                    <Col xs={24} md={12} mdOffset={6}>
                     <Panel>
                         <div className="text-center">
                             <h2>Welcome to Chat App</h2>
                             <p>Progressive chat platform for neophytes</p>
                         </div>

                         <div className='mt-3'>
                             <Button block color='green' onClick={onFacebookSignIn}>
                                 <Icon icon='facebook'>Continue with Facebook</Icon>
                             </Button>

                             <Button block color='cyan' onClick={onGoogleSignIn}>
                                 <Icon icon='google'>Continue with Google</Icon>
                             </Button>
                         </div>
                     </Panel>
                    </Col>
                </Row>
            </Grid>
        </Container>
    )
}

export default SignIn

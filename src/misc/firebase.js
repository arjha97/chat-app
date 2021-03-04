import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
    apiKey: "AIzaSyBXyGjsqOVtuk2O0JE0D_uj-UDSac8B1Kg",
    authDomain: "chat-web-app-21c5a.firebaseapp.com",
    databaseURL: "https://chat-web-app-21c5a-default-rtdb.firebaseio.com",
    projectId: "chat-web-app-21c5a",
    storageBucket: "chat-web-app-21c5a.appspot.com",
    messagingSenderId: "335975515229",
    appId: "1:335975515229:web:42a5fc51a4dd4754d6f9b4"
  };

  const app = firebase.initializeApp(config);
  export const auth = app.auth();
  export const database = app.database();

  
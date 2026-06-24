// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyCMUw8KwCeSNY41i5EmmqKexzLp5RRMNoY",
    authDomain: "daftar-absen-cc868.firebaseapp.com",
    databaseURL: "https://daftar-absen-cc868-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "daftar-absen-cc868",
    appId: "1:486404759637:web:120404fde3e0c1f1d0b4dc"
};

// Inisialisasi Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

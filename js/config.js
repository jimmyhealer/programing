var firebaseConfig = {
    apiKey: "AIzaSyAiAdgCYzufGBxZESJgGQGOFexQQMfW2G8",
    authDomain: "learn-programing-5e097.firebaseapp.com",
    databaseURL: "https://learn-programing-5e097.firebaseio.com",
    projectId: "learn-programing-5e097",
    storageBucket: "learn-programing-5e097.appspot.com",
    messagingSenderId: "164589283855",
    appId: "1:164589283855:web:f39761eb8c0c37262e917a",
    measurementId: "G-KE49GMQEMH"
};
firebase.initializeApp(firebaseConfig);

try {
    var fs = firebase.firestore();
    var storageRef = firebase.storage().ref();
} catch{ }
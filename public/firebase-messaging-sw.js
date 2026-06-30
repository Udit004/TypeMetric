importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Use the same environment variables (Note: In a real production build,
// these would be injected via your build process or hardcoded here
// because Service Workers run in a separate scope from your React app)
const firebaseConfig = {
    apiKey: "AIzaSyAdokZOWLcNxZknZF6EzOANJR5wLaC1qaI",
    authDomain: "typemetric-9320f.firebaseapp.com",
    projectId: "typemetric-9320f",
    storageBucket: "typemetric-9320f.firebasestorage.app",
    messagingSenderId: "980554186460",
    appId: "1:980554186460:web:22fd3acc7d097762b93e19",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// This listener handles background notifications
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body, icon: '/favicon.ico' // Or your preferred icon
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
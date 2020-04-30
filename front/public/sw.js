// Listen for install event, set callback
self.addEventListener('install', (event) => {
    console.log('INSTALLED');
});

self.addEventListener('notificationclick', (e) => {
    const notification = e.notification;
    const primaryKey = notification.data.primaryKey;
    const action = e.action;

    console.log('CLICK', action);

    if (action === 'close') {
        notification.close();
    } else {
        clients.openWindow('/app/home');
        notification.close();
    }
});
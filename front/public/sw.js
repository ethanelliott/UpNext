// Listen for install event, set callback
self.addEventListener('install', (event) => {
    console.log('INSTALLED');
});

self.addEventListener('notificationclick', (e) => {
    const notification = e.notification;
    const action = e.action;

    console.log('CLICK', action);

    switch (action) {
        case 'close':
            break;
        case 'explore':
            clients.openWindow('/app/home');
            break;
        default:
            console.log('JUST CLOSE');
            break;
    }
    notification.close();
});
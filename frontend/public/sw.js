// Basic service worker from Next.js PWA documentation

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png', // Default icon
      badge: '/badge.png', // Optional: Add a badge icon
      vibrate: [100, 50, 100], // Optional: Vibration pattern
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2', // Example data
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.')
  event.notification.close()
  // Replace with your actual website URL or desired path
  event.waitUntil(clients.openWindow('/'))
})

// Basic install/activate listeners (optional but good practice)
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  // Add caching logic here if needed
  // event.waitUntil(self.skipWaiting()); // Activate worker immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  // Clean up old caches here if needed
  // event.waitUntil(clients.claim()); // Take control of pages immediately
});

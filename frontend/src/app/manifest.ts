import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Audiobook App', // You can customize this
    short_name: 'AudiobookApp', // You can customize this
    description: 'Listen to your favorite audiobooks.', // You can customize this
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff', // You can customize this
    theme_color: '#000000', // You can customize this
    icons: [
      {
        src: '/icon-192x192.png', // Replace with your actual icon path
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png', // Replace with your actual icon path
        sizes: '512x512',
        type: 'image/png',
      },
      // Add more icons as needed, especially maskable icons
      // {
      //   src: '/icon-maskable-512x512.png',
      //   sizes: '512x512',
      //   type: 'image/png',
      //   purpose: 'maskable'
      // }
    ],
  }
}

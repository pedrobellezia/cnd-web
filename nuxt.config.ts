export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true,
  },

  css: [
    '~/assets/css/main.css',
  ],

  runtimeConfig: {
    apiKey: process.env.CND_API_KEY || '',
    mockApi: process.env.MOCK_API === 'true',
    public: {
      apiUrl: process.env.API_URL || 'http://localhost:3030',
    },
  },
})
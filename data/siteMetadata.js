/** @type {import("pliny/config").PlinyConfig } */
const siteMetadata = {
  title: 'NeuroHacks Lab — Quiet ADHD Systems & Tools', // 网站标题
  author: 'NeuroHacks Lab', // 作者名
  headerTitle: 'NeuroHacks Lab', // 顶部导航栏显示的文字
  description:
    'Quiet lab for neurodivergent minds. Evidence-based ADHD guides, discreet sensory tools, and compassionate workflows for work, school, and home routines.', // 网站描述（给 Google 看的）
  language: 'en-us',
  theme: 'light', // system, dark or light
  siteUrl: 'https://neurohackslab.com', // 你的域名
  siteRepo: 'https://github.com/yellowpeppers/neurohacks-lab',
  siteLogo: '/static/images/logo.svg', // 响应深浅色的徽标
  socialBanner: '/static/images/twitter-card.png',
  mastodon: '',
  email: 'contact@neurohackslab.com',
  github: '',
  x: '',
  facebook: '',
  youtube: '',
  linkedin: '',
  threads: '',
  instagram: '',
  medium: '',
  bluesky: '',
  locale: 'en-US',
  // set to true if you want a navbar fixed to the top
  stickyNav: false,
  analytics: {
    // NEXT_PUBLIC_GA_ID 可覆盖默认 GA4 测量 ID
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || 'G-SHQD9JY8DJ',
  },
  newsletter: {
    provider: '',
  },
  comments: {
    provider: '',
    giscusConfig: {
      repo: '',
      repositoryId: '',
      category: '',
      categoryId: '',
      mapping: 'pathname',
      reactions: '1',
      metadata: '0',
      theme: 'light',
      darkTheme: 'transparent_dark',
      themeURL: '',
      lang: 'en',
    },
  },
  search: {
    provider: 'kbar', // kbar or algolia
    kbarConfig: {
      searchDocumentsPath: `${process.env.BASE_PATH || ''}/search.json`, // path to load documents to search
    },
    // provider: 'algolia',
    // algoliaConfig: {
    //   // The application ID provided by Algolia
    //   appId: 'R2IYF7ETH7',
    //   // Public API key: it is safe to commit it
    //   apiKey: '599cec31baffa4868cae4e79f180729b',
    //   indexName: 'docsearch',
    // },
  },
}

module.exports = siteMetadata

export const MOCK_EVENTS = [
    {
        id: 'mock-1',
        title: 'Tech Innovation Summit 2025',
        slug: 'tech-innovation-summit-2025',
        description: 'Join industry leaders to discuss the latest trends in AI, blockchain, and cloud computing. Network with professionals and discover the future of technology.',
        banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80',
        category: 'conference',
        city: 'San Francisco',
        country: 'USA',
        start_date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
        status: 'published',
        ticket_types: [{ price: 299 }, { price: 499 }]
    },
    {
        id: 'mock-2',
        title: 'Summer Music Festival',
        slug: 'summer-music-festival',
        description: 'Experience 3 days of non-stop music featuring top artists from around the globe. Food, art, and good vibes guaranteed.',
        banner_url: 'https://images.unsplash.com/photo-1459749411177-0473ef48ee56?auto=format&fit=crop&q=80',
        category: 'concert',
        city: 'Austin',
        country: 'USA',
        start_date: new Date(Date.now() + 86400000 * 14).toISOString(), // 14 days from now
        status: 'published',
        ticket_types: [{ price: 89 }, { price: 150 }]
    },
    {
        id: 'mock-3',
        title: 'Digital Art Workshop',
        slug: 'digital-art-workshop',
        description: 'Learn the fundamentals of digital painting and illustration from renowned artists. Suitable for beginners and intermediates.',
        banner_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80',
        category: 'workshop',
        city: 'London',
        country: 'UK',
        start_date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
        status: 'published',
        ticket_types: [{ price: 45 }]
    },
    {
        id: 'mock-4',
        title: 'Startup Networking Night',
        slug: 'startup-networking-night',
        description: 'Connect with founders, investors, and talent in the local startup ecosystem. Pitch your ideas and find your next co-founder.',
        banner_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80',
        category: 'networking',
        city: 'New York',
        country: 'USA',
        start_date: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
        status: 'published',
        ticket_types: [{ price: 0 }] // Free event
    },
    {
        id: 'mock-5',
        title: 'Culinary Masterclass',
        slug: 'culinary-masterclass',
        description: 'Master the art of French cooking with Chef Pierre. Hands-on experience preparing a 3-course meal.',
        banner_url: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80',
        category: 'food',
        city: 'Paris',
        country: 'France',
        start_date: new Date(Date.now() + 86400000 * 20).toISOString(), // 20 days from now
        status: 'published',
        ticket_types: [{ price: 120 }]
    },
    {
        id: 'mock-6',
        title: 'Marathon for Charity',
        slug: 'marathon-for-charity',
        description: 'Run for a cause! Join thousands of participants in this annual charity marathon raising funds for local schools.',
        banner_url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&q=80',
        category: 'sports',
        city: 'Boston',
        country: 'USA',
        start_date: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
        status: 'published',
        ticket_types: [{ price: 25 }]
    }
]

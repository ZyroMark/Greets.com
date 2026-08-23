// Dashboard Data & Logic

// Mock Data (Fallback if API is down or User runs offline)
const MOCK_USERS = [
    {
        id: 1,
        name: 'Sarah Jessica',
        username: 'sarah_j',
        role: 'Greetie',
        profile_pic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 2,
        name: 'Mike Ross',
        username: 'mike_law',
        role: 'Greeter',
        profile_pic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 3,
        name: 'Emily Blunt',
        username: 'emily_b',
        role: 'Greetie',
        profile_pic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 4,
        name: 'David Beck',
        username: 'd_beck',
        role: 'Greeter',
        profile_pic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    },
    {
        id: 5,
        name: 'Ariana V',
        username: 'ari_grande_fan',
        role: 'Greetie',
        profile_pic: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80'
    }
];

let currentFilter = 'Greetie';

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers(currentFilter);
});

function setFilter(role) {
    currentFilter = role;

    // Update Tab UI
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'greetie', 'greeter');
    });

    const activeBtn = document.getElementById(role === 'Greetie' ? 'tab-greetie' : 'tab-greeter');
    activeBtn.classList.add('active');
    if (role === 'Greetie') activeBtn.classList.add('greetie');
    else activeBtn.classList.add('greeter');

    // Refresh Grid
    fetchUsers(role);
}

async function fetchUsers(role) {
    const grid = document.getElementById('user-grid');
    grid.innerHTML = '<div class="glass-card" style="grid-column: 1/-1; text-align: center;">Loading...</div>';

    let users = [];

    // Tries to fetch from local API first, falls back to MOCK_USERS
    try {
        // We set a short timeout so the UI doesn't hang if the server is off
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);

        const res = await fetch(`http://localhost:5000/api/users?role=${role}`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            users = await res.json();
            console.log('Loaded from API');
        } else {
            throw new Error('API Error');
        }
    } catch (err) {
        console.warn('API unavailable or offline. Using Mock Data.', err);
        // Filter mock data locally
        users = MOCK_USERS.filter(u => u.role === role);
    }

    renderUsers(users);
}

function renderUsers(users) {
    const grid = document.getElementById('user-grid');
    grid.innerHTML = '';

    if (users.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 3rem;">
                <h3>No users found.</h3>
                <p>Be the first to join as a ${currentFilter}!</p>
            </div>
        `;
        return;
    }

    users.forEach((user, index) => {
        const card = document.createElement('div');
        card.className = 'user-card';
        // Staggered animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.animation = `fadeUp 0.5s ease forwards ${index * 0.1}s`;

        card.innerHTML = `
            <div class="card-img">
                <img src="${user.profile_pic}" alt="${user.username}" onerror="this.src='https://via.placeholder.com/300x200/1f2937/ffffff?text=User'">
                <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);"></div>
            </div>
            <div class="card-content">
                <h3 style="font-size: 1.25rem; margin-bottom: 0.25rem;">${user.name}</h3>
                <p class="text-gradient" style="font-size: 0.9rem; margin-bottom: 1rem;">@${user.username}</p>
                
                <button class="btn btn-primary card-btn">
                    View Profile & Request
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Add keyframe for JS-injected styles if needed, though CSS handles most.
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes fadeUp {
    to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(styleSheet);

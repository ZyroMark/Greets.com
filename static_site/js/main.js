// Greets.com - Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// --- State & Data ---
let currentState = 'auth'; // auth, profile, edit
let selectedUserId = null;

// Mock Users Data
const users = [
    { id: 1, name: "Sarah Jenkins", country: "United Kingdom", role: "Greeter", bio: "Love to chat about travel and food.", image: "https://i.pravatar.cc/150?img=1" },
    { id: 2, name: "Michael Chen", country: "Singapore", role: "Greeter", bio: "Tech enthusiast and coffee lover.", image: "https://i.pravatar.cc/150?img=3" },
    { id: 3, name: "Amara Diop", country: "Senegal", role: "Greeter", bio: "Fashion designer and artist.", image: "https://i.pravatar.cc/150?img=5" },
    { id: 4, name: "Lucas Silva", country: "Brazil", role: "Greetie", bio: "Looking to practice English.", image: "https://i.pravatar.cc/150?img=8" },
    { id: 5, name: "Elena Rossi", country: "Italy", role: "Greeter", bio: "Chef and wine expert.", image: "https://i.pravatar.cc/150?img=9" },
    { id: 6, name: "David Kim", country: "South Korea", role: "Greeter", bio: "K-pop fan and dancer.", image: "https://i.pravatar.cc/150?img=11" },
    { id: 7, name: "Olivia Jones", country: "USA", role: "Greetie", bio: "Student traveling the world.", image: "https://i.pravatar.cc/150?img=20" },
    { id: 'me', name: "My Profile", country: "South Africa", role: "Greetie", bio: "New to Greets!", image: "https://i.pravatar.cc/150?img=12" } // Current user
];

// --- Initialization ---
function initApp() {
    renderNodes();
    updateSidebar();
    initCanvas();

    // Refresh button
    const refreshBtn = document.getElementById('refreshMapBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            renderNodes();
        });
    }

    window.addEventListener('resize', resizeCanvas);
}

// --- Map / Nodes Logic ---
function renderNodes() {
    const container = document.getElementById('nodes-container');
    if (!container) return;
    container.innerHTML = '';

    const containerRect = document.getElementById('mapView').getBoundingClientRect();
    const padding = 100;

    users.forEach(user => {
        if (user.id === 'me') return; // Don't show self on map

        const node = document.createElement('div');
        node.className = 'map-node';

        // Random Position with bounds check
        const x = Math.max(padding, Math.min(containerRect.width - padding, Math.random() * containerRect.width));
        const y = Math.max(padding, Math.min(containerRect.height - padding, Math.random() * containerRect.height));

        node.style.left = `${x}px`;
        node.style.top = `${y}px`;

        // Content
        node.innerHTML = `
            <img src="${user.image}" alt="${user.name}">
            <div class="node-info">
                <span class="node-name">${user.name}</span>
                <span class="node-country">${user.country}</span>
            </div>
        `;

        // Interaction
        node.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent map click
            selectUser(user.id);
        });

        container.appendChild(node);
        user._x = x; // Store for canvas drawing
        user._y = y;
    });

    drawConnections();
}

function selectUser(id) {
    selectedUserId = id;
    currentState = 'profile';
    updateSidebar();
}

// --- Sidebar Logic ---
const sidebarContent = document.getElementById('sidebarContent');

function updateSidebar() {
    if (!sidebarContent) return;
    sidebarContent.innerHTML = '';
    sidebarContent.style.opacity = '0';

    setTimeout(() => {
        if (currentState === 'auth') {
            renderAuth();
        } else if (currentState === 'profile') {
            renderSelectedProfile();
        } else if (currentState === 'edit') {
            renderEditProfile();
        }
        sidebarContent.style.opacity = '1';
    }, 200);
}

function renderAuth() {
    sidebarContent.innerHTML = `
        <div class="auth-tabs">
            <div class="auth-tab active" id="tabLogin">Sign In</div>
            <div class="auth-tab" id="tabRegister">Register</div>
        </div>

        <div id="authForm">
            <!-- Login Form -->
            <form id="loginForm">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" placeholder="you@example.com">
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" placeholder="••••••••">
                </div>
                <button type="button" class="btn btn-primary w-full" id="btnLogin">Sign In</button>
            </form>
        </div>
        
        <div style="margin-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
           <p style="color: #9ca3af; font-size: 0.9rem; margin-bottom: 1rem;">My Account</p>
           <button class="btn btn-secondary w-full" id="btnMyProfile" style="font-size: 0.9rem;">
                Go to My Profile (Demo)
           </button>
        </div>
    `;

    // Bind Events
    document.getElementById('tabLogin').addEventListener('click', (e) => toggleAuthTab(e, 'login'));
    document.getElementById('tabRegister').addEventListener('click', (e) => toggleAuthTab(e, 'register'));

    document.getElementById('btnLogin').addEventListener('click', () => {
        // Mock Login
        alert("Logged in successfully!");
        selectedUserId = 'me';
        currentState = 'profile';
        updateSidebar();
    });

    document.getElementById('btnMyProfile').addEventListener('click', () => {
        selectedUserId = 'me';
        currentState = 'profile';
        updateSidebar();
    });
}

function toggleAuthTab(e, type) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');

    // Simplified toggle for demo
    const formContainer = document.getElementById('authForm');
    if (type === 'register') {
        formContainer.innerHTML = `
            <form id="registerForm">
                <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input type="text" class="form-input" placeholder="John Doe">
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" placeholder="you@example.com">
                </div>
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" placeholder="Create a password">
                </div>
                <button type="button" id="btnRegisterSubmit" class="btn btn-primary w-full">Create Account</button>
            </form>
        `;
        // Bind register button
        document.getElementById('btnRegisterSubmit').addEventListener('click', () => {
            alert('Registered successfully! Please sign in.');
            renderAuth(); // Go back to login
        });
    } else {
        renderAuth(); // Reset to login
    }
}

function renderSelectedProfile() {
    const user = users.find(u => u.id === selectedUserId);
    if (!user) return;

    const isMe = user.id === 'me';

    sidebarContent.innerHTML = `
        <button class="nav-btn" id="backToMap" style="margin-bottom: 1rem;">← Back</button>
        
        <div class="profile-card">
            <div class="profile-cover">
                <img src="${user.image}" class="profile-avatar-large">
            </div>
            
            <div class="text-center">
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${user.name}</h3>
                <p style="color: var(--secondary-color); font-weight: 600;">${user.role}</p>
                <p style="color: #9ca3af; margin-top: 0.5rem;">📍 ${user.country}</p>
            </div>

            <div class="profile-stats">
                <div><span class="stat-value">24</span><span class="stat-label">Meets</span></div>
                <div><span class="stat-value">4.9</span><span class="stat-label">Rating</span></div>
                <div><span class="stat-value">100%</span><span class="stat-label">Response</span></div>
            </div>

            <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                <h4 style="font-size: 0.9rem; text-transform: uppercase; color: #6b7280; margin-bottom: 0.5rem;">About</h4>
                <p style="font-size: 0.95rem; line-height: 1.5; color: #d1d5db;">
                    ${user.bio}
                </p>
            </div>

            ${isMe ? `
                <button class="btn btn-secondary w-full" id="btnEditProfile">Edit My Profile</button>
                <button class="btn btn-secondary w-full" id="btnLogout" style="margin-top: 1rem; border-color: transparent; color: #ef4444;">Log Out</button>
            ` : `
                <button class="btn btn-primary w-full" id="btnRequestMeetup">Request Meetup</button>
                <button class="btn btn-secondary w-full" id="btnMessage" style="margin-top: 1rem;">Message</button>
            `}
        </div>
    `;

    // Always valid
    document.getElementById('backToMap').addEventListener('click', () => {
        currentState = 'auth';
        selectedUserId = null;
        updateSidebar();
    });

    if (isMe) {
        document.getElementById('btnEditProfile').addEventListener('click', () => {
            currentState = 'edit';
            updateSidebar();
        });
        document.getElementById('btnLogout').addEventListener('click', () => {
            alert('Logged Out');
            currentState = 'auth';
            selectedUserId = null;
            updateSidebar();
        });
    } else {
        // Events for other users
        document.getElementById('btnRequestMeetup').addEventListener('click', () => {
            alert(`Meetup request sent to ${user.name}!`);
        });
        document.getElementById('btnMessage').addEventListener('click', () => {
            alert(`Messaging ${user.name} is coming soon!`);
        });
    }
}

function renderEditProfile() {
    const user = users.find(u => u.id === 'me');

    sidebarContent.innerHTML = `
        <button class="nav-btn" id="cancelEdit" style="margin-bottom: 1rem;">← Cancel</button>
        <h2 style="margin-bottom: 1.5rem;">Edit Profile</h2>
        
        <form>
            <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" class="form-input" id="editName" value="${user.name}">
            </div>
            <div class="form-group">
                <label class="form-label">Country</label>
                <input type="text" class="form-input" id="editCountry" value="${user.country}">
            </div>
            <div class="form-group">
                <label class="form-label">Bio</label>
                <textarea class="form-input" id="editBio" rows="4" style="resize: none;">${user.bio}</textarea>
            </div>
            <button type="button" class="btn btn-primary w-full" id="btnSaveProfile">Save Changes</button>
        </form>
    `;

    document.getElementById('cancelEdit').addEventListener('click', () => {
        currentState = 'profile';
        updateSidebar();
    });

    document.getElementById('btnSaveProfile').addEventListener('click', () => {
        // Save changes
        user.name = document.getElementById('editName').value;
        user.country = document.getElementById('editCountry').value;
        user.bio = document.getElementById('editBio').value;

        alert('Profile Updated Successfully!');
        currentState = 'profile';
        updateSidebar();
    });
}


// --- Canvas Connections ---
// Simple implementation to draw lines between nearby nodes
function initCanvas() {
    const canvas = document.getElementById('connections-canvas');
    if (!canvas) return;
    resizeCanvas();
    // Animation loop if we want moving nodes, otherwise just draw once
    // For now, draw once after render
}

function resizeCanvas() {
    const canvas = document.getElementById('connections-canvas');
    const container = document.getElementById('mapView');
    if (!canvas || !container) return; // guard

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    drawConnections();
}

function drawConnections() {
    const canvas = document.getElementById('connections-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Draw lines between all nodes
    // Filter out 'me' if not on map
    const mapUsers = users.filter(u => u.id !== 'me');

    for (let i = 0; i < mapUsers.length; i++) {
        for (let j = i + 1; j < mapUsers.length; j++) {
            const u1 = mapUsers[i];
            const u2 = mapUsers[j];

            // Wait for render to set _x _y handles? We set them in renderNodes
            if (u1._x && u2._x) {
                // Calculate distance
                const dx = u1._x - u2._x;
                const dy = u1._y - u2._y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 400) { // Connect nearby nodes
                    ctx.beginPath();
                    ctx.moveTo(u1._x + 40, u1._y + 40); // Center of node (approx 80px width)
                    ctx.lineTo(u2._x + 40, u2._y + 40);
                    ctx.stroke();
                }
            }
        }
    }
}

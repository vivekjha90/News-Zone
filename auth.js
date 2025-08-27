// Authentication State Management with Real User Storage
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.registeredUsers = this.loadRegisteredUsers();
        this.init();
    }

    init() {
        // Check for existing session
        const savedUser = localStorage.getItem('newszone_user') || sessionStorage.getItem('newszone_user');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                // Verify user still exists in registered users
                if (this.isUserRegistered(user.email)) {
                    this.currentUser = user;
                    this.showMainApp();
                } else {
                    // User was deleted, clear session
                    this.clearUserSession();
                    this.showLandingPage();
                }
            } catch (error) {
                this.clearUserSession();
                this.showLandingPage();
            }
        } else {
            this.showLandingPage();
        }

        this.bindEvents();
    }

    // Load registered users from localStorage
    loadRegisteredUsers() {
        try {
            const users = localStorage.getItem('newszone_registered_users');
            return users ? JSON.parse(users) : [];
        } catch (error) {
            return [];
        }
    }

    // Save registered users to localStorage
    saveRegisteredUsers() {
        localStorage.setItem('newszone_registered_users', JSON.stringify(this.registeredUsers));
    }

    // Check if user is registered
    isUserRegistered(email) {
        return this.registeredUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
    }

    // Get user by email
    getUserByEmail(email) {
        return this.registeredUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
    }

    // Validate password
    validatePassword(email, password) {
        const user = this.getUserByEmail(email);
        return user && user.password === this.hashPassword(password);
    }

    // Simple password hashing (in production, use proper bcrypt)
    hashPassword(password) {
        // Simple hash - in production use proper hashing like bcrypt
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // Register new user
    registerUser(name, email, password) {
        if (this.isUserRegistered(email)) {
            throw new Error('User already exists with this email');
        }

        const newUser = {
            id: Date.now(),
            name: name,
            email: email.toLowerCase(),
            password: this.hashPassword(password),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0066ff&color=fff`,
            registrationDate: Date.now(),
            lastLogin: null
        };

        this.registeredUsers.push(newUser);
        this.saveRegisteredUsers();
        return newUser;
    }

    // Clear user session
    clearUserSession() {
        localStorage.removeItem('newszone_user');
        sessionStorage.removeItem('newszone_user');
    }

    showLandingPage() {
        document.getElementById('landing-page').classList.remove('hidden');
        document.getElementById('main-app').classList.remove('visible');
        document.getElementById('main-app').classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    showMainApp() {
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        document.getElementById('main-app').classList.add('visible');
        this.updateUI();
        
        // Load news content if needed
        if (typeof loadNews === 'function') {
            loadNews();
        }
    }

    bindEvents() {
        // Auth modal events
        const closeAuthBtn = document.getElementById('close-auth');
        if (closeAuthBtn) {
            closeAuthBtn.addEventListener('click', () => this.hideAuth());
        }
        
        // Form submissions
        document.getElementById('login-form-element').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('signup-form-element').addEventListener('submit', (e) => this.handleSignup(e));
        document.getElementById('forgot-password-form-element').addEventListener('submit', (e) => this.handleForgotPassword(e));
        
        // Password strength checker
        document.getElementById('signup-password').addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
        
        // Real-time email validation for signup
        document.getElementById('signup-email').addEventListener('blur', (e) => this.checkEmailAvailability(e.target.value));
        
        // Close modal on outside click
        document.getElementById('auth-modal').addEventListener('click', (e) => {
            if (e.target.id === 'auth-modal') {
                this.hideAuth();
            }
        });

        // User dropdown toggle
        document.addEventListener('click', (e) => {
            const userDropdown = document.getElementById('user-dropdown');
            const userAvatar = document.getElementById('user-avatar');
            
            if (userDropdown && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }

    // Check email availability in real-time
    checkEmailAvailability(email) {
        if (!email) return;
        
        const emailInput = document.getElementById('signup-email');
        const existingFeedback = emailInput.parentNode.querySelector('.email-feedback');
        
        // Remove existing feedback
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        if (this.isUserRegistered(email)) {
            const feedback = document.createElement('div');
            feedback.className = 'email-feedback error';
            feedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> This email is already registered';
            emailInput.parentNode.appendChild(feedback);
            emailInput.style.borderColor = '#e53e3e';
        } else if (this.isValidEmail(email)) {
            const feedback = document.createElement('div');
            feedback.className = 'email-feedback success';
            feedback.innerHTML = '<i class="fas fa-check-circle"></i> Email is available';
            emailInput.parentNode.appendChild(feedback);
            emailInput.style.borderColor = '#38a169';
        } else {
            emailInput.style.borderColor = '';
        }
    }

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Show authentication modal
    showAuth(type = 'login') {
        const modal = document.getElementById('auth-modal');
        modal.classList.add('active');
        
        // Hide all forms
        document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
        
        // Show specific form
        if (type === 'login') {
            document.getElementById('login-form').classList.remove('hidden');
        } else if (type === 'signup') {
            document.getElementById('signup-form').classList.remove('hidden');
        } else if (type === 'forgot') {
            document.getElementById('forgot-password-form').classList.remove('hidden');
        }
        
        document.body.style.overflow = 'hidden';
    }

    hideAuth() {
        const modal = document.getElementById('auth-modal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Clear forms and feedback
        document.querySelectorAll('.auth-form form').forEach(form => form.reset());
        document.querySelectorAll('.email-feedback').forEach(feedback => feedback.remove());
        
        // Reset input styles
        document.querySelectorAll('.input-group input').forEach(input => {
            input.style.borderColor = '';
        });
    }

    // Handle login with real validation
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        // Validate inputs
        if (!email || !password) {
            this.showToast('error', 'Invalid Input', 'Please enter both email and password');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showToast('error', 'Invalid Email', 'Please enter a valid email address');
            return;
        }
        
        this.showLoading();
        
        try {
            // Simulate network delay
            await this.simulateNetworkDelay();
            
            // Check if user is registered
            if (!this.isUserRegistered(email)) {
                throw new Error('No account found with this email address');
            }
            
            // Validate password
            if (!this.validatePassword(email, password)) {
                throw new Error('Invalid password');
            }
            
            // Get user data
            const userData = this.getUserByEmail(email);
            
            // Update last login
            userData.lastLogin = Date.now();
            this.saveRegisteredUsers();
            
            // Create session user object
            const user = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                avatar: userData.avatar,
                loginTime: Date.now(),
                rememberMe: rememberMe
            };
            
            this.setCurrentUser(user);
            this.hideAuth();
            this.hideLoading();
            this.showMainApp();
            this.showToast('success', 'Welcome back!', `Successfully signed in as ${user.name}`);
            
        } catch (error) {
            this.hideLoading();
            this.showToast('error', 'Login Failed', error.message);
        }
    }

    // Handle signup with real registration
    async handleSignup(e) {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const termsAgreed = document.getElementById('terms-agreement').checked;
        
        // Validation
        if (!name || !email || !password || !confirmPassword) {
            this.showToast('error', 'Incomplete Form', 'Please fill in all fields');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showToast('error', 'Invalid Email', 'Please enter a valid email address');
            return;
        }

        if (password !== confirmPassword) {
            this.showToast('error', 'Password Mismatch', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            this.showToast('error', 'Weak Password', 'Password must be at least 6 characters long');
            return;
        }
        
        if (!termsAgreed) {
            this.showToast('warning', 'Terms Required', 'Please agree to the terms of service');
            return;
        }
        
        this.showLoading();
        
        try {
            // Simulate network delay
            await this.simulateNetworkDelay();
            
            // Register the user
            const userData = this.registerUser(name, email, password);
            
            // Create session user object
            const user = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                avatar: userData.avatar,
                loginTime: Date.now(),
                rememberMe: false
            };
            
            this.setCurrentUser(user);
            this.hideAuth();
            this.hideLoading();
            this.showMainApp();
            this.showToast('success', 'Account Created!', `Welcome to News Zone, ${name}!`);
            
        } catch (error) {
            this.hideLoading();
            this.showToast('error', 'Registration Failed', error.message);
        }
    }

    // Handle forgot password
    async handleForgotPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('reset-email').value.trim();
        
        if (!email) {
            this.showToast('error', 'Email Required', 'Please enter your email address');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showToast('error', 'Invalid Email', 'Please enter a valid email address');
            return;
        }
        
        this.showLoading();
        
        try {
            await this.simulateNetworkDelay();
            
            if (!this.isUserRegistered(email)) {
                throw new Error('No account found with this email address');
            }
            
            this.hideLoading();
            this.showToast('success', 'Reset Link Sent', `Password reset instructions sent to ${email}`);
            this.showAuth('login');
        } catch (error) {
            this.hideLoading();
            this.showToast('error', 'Reset Failed', error.message);
        }
    }

    // Set current user and update UI
    setCurrentUser(user) {
        this.currentUser = user;
        if (user.rememberMe) {
            localStorage.setItem('newszone_user', JSON.stringify(user));
        } else {
            sessionStorage.setItem('newszone_user', JSON.stringify(user));
        }
    }

    // Update UI based on auth state
    updateUI() {
        const userDropdown = document.getElementById('user-dropdown');
        
        if (this.currentUser && userDropdown) {
            // Update user info
            const userNameElement = document.getElementById('user-name');
            const avatarImgElement = document.getElementById('avatar-img');
            const dropdownUserNameElement = document.getElementById('dropdown-user-name');
            const dropdownUserEmailElement = document.getElementById('dropdown-user-email');
            
            if (userNameElement) userNameElement.textContent = this.currentUser.name;
            if (avatarImgElement) avatarImgElement.src = this.currentUser.avatar;
            if (dropdownUserNameElement) dropdownUserNameElement.textContent = this.currentUser.name;
            if (dropdownUserEmailElement) dropdownUserEmailElement.textContent = this.currentUser.email;
            
            document.querySelectorAll('.dropdown-header img').forEach(img => {
                img.src = this.currentUser.avatar;
            });
        }
    }

    // Logout user
    logout() {
        this.currentUser = null;
        this.clearUserSession();
        
        this.showToast('success', 'Signed Out', 'You have been successfully signed out');
        
        // Close dropdown
        const userDropdown = document.getElementById('user-dropdown');
        if (userDropdown) {
            userDropdown.classList.remove('active');
        }
        
        // Show landing page
        this.showLandingPage();
    }

    // Check password strength
    checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthBar || !strengthText) return;
        
        let strength = 0;
        let text = 'Weak';
        let color = '#e53e3e';
        
        if (password.length >= 8) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 12.5;
        if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
        
        if (strength >= 75) {
            text = 'Strong';
            color = '#38a169';
        } else if (strength >= 50) {
            text = 'Medium';
            color = '#d69e2e';
        }
        
        strengthBar.style.width = `${strength}%`;
        strengthBar.style.background = color;
        strengthText.textContent = `Password strength: ${text}`;
        strengthText.style.color = color;
    }

    // Admin function to view registered users (for testing)
    getRegisteredUsers() {
        return this.registeredUsers.map(user => ({
            name: user.name,
            email: user.email,
            registrationDate: new Date(user.registrationDate).toLocaleString(),
            lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'
        }));
    }

    // Admin function to clear all users (for testing)
    clearAllUsers() {
        this.registeredUsers = [];
        this.saveRegisteredUsers();
        this.logout();
        this.showToast('info', 'Users Cleared', 'All registered users have been cleared');
    }

    // Utility functions
    simulateNetworkDelay() {
        return new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    }

    showLoading() {
        const loadingSpinner = document.getElementById('loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.classList.add('active');
        }
    }

    hideLoading() {
        const loadingSpinner = document.getElementById('loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.classList.remove('active');
        }
    }

    // Toast notifications
    showToast(type, title, message) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="toast-icon ${icons[type]}"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (toast.parentNode) {
                        container.removeChild(toast);
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Initialize authentication manager
const authManager = new AuthManager();

// Global functions for onclick handlers
function showAuth(type) {
    authManager.showAuth(type);
}

function showLogin() {
    authManager.showAuth('login');
}

function showSignup() {
    authManager.showAuth('signup');
}

function showForgotPassword() {
    authManager.showAuth('forgot');
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'far fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'far fa-eye';
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function logout() {
    authManager.logout();
}

function toggleBookmark(button) {
    if (authManager.currentUser) {
        button.classList.toggle('bookmarked');
        const icon = button.querySelector('i');
        
        if (button.classList.contains('bookmarked')) {
            icon.className = 'fas fa-bookmark';
            authManager.showToast('success', 'Bookmarked', 'Article saved to your bookmarks');
        } else {
            icon.className = 'far fa-bookmark';
            authManager.showToast('info', 'Removed', 'Article removed from bookmarks');
        }
    } else {
        authManager.showToast('warning', 'Sign In Required', 'Please sign in to bookmark articles');
        authManager.showAuth('login');
    }
}

function shareArticle(button) {
    if (navigator.share) {
        navigator.share({
            title: 'News Article',
            text: 'Check out this interesting article',
            url: window.location.href,
        });
    } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        authManager.showToast('success', 'Link Copied', 'Article link copied to clipboard');
    }
}

function showProfile() {
    authManager.showToast('info', 'Coming Soon', 'Profile settings will be available soon');
}

function showBookmarks() {
    authManager.showToast('info', 'Coming Soon', 'Saved articles will be available soon');
}

function showPreferences() {
    authManager.showToast('info', 'Coming Soon', 'Preferences will be available soon');
}

// Social login functions
function signInWithGoogle() {
    authManager.showToast('info', 'Coming Soon', 'Google Sign-In will be available soon');
}

function signInWithFacebook() {
    authManager.showToast('info', 'Coming Soon', 'Facebook Sign-In will be available soon');
}

// Function to reload/refresh news
function reload() {
    if (typeof loadNews === 'function') {
        loadNews();
    }
    authManager.showToast('info', 'Refreshing', 'Loading latest news...');
}

// Developer/Testing functions (accessible via browser console)
window.authManager = authManager;
window.viewUsers = () => console.table(authManager.getRegisteredUsers());
window.clearUsers = () => authManager.clearAllUsers();

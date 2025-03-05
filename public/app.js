//@ts-nocheck

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const publicBlogList = document.getElementById('public-blog-list');
const userBlogList = document.getElementById('user-blog-list');
const blogEditor = document.getElementById('blog-editor');
const blogTitle = document.getElementById('blog-title');
const blogContent = document.getElementById('blog-content');
const publishBtn = document.getElementById('publish-btn');
const bgColor = document.getElementById('bg-color');
const textColor = document.getElementById('text-color');
const frontPage = document.getElementById('front-page');
const loginContainer = document.getElementById('login-container');
const authTitle = document.getElementById('auth-title');
const authSubmit = document.getElementById('auth-submit');
const authMessage = document.getElementById('auth-message');
const username = document.getElementById('username');
const password = document.getElementById('password');
const closeBtn = document.getElementsByClassName('close')[0];
const lightThemeBtn = document.getElementById('light-theme');
const darkThemeBtn = document.getElementById('dark-theme');
const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');
const imageUpload = document.getElementById('imageUpload');

let currentUser = null;
let editingBlogId = null;

// Event Listeners
loginBtn.addEventListener('click', () => showAuthModal('Login'));
registerBtn.addEventListener('click', () => showAuthModal('Register'));
logoutBtn.addEventListener('click', logout);
publishBtn.addEventListener('click', publishBlog);
bgColor.addEventListener('change', updateTheme);
textColor.addEventListener('change', updateTheme);
authSubmit.addEventListener('click', handleAuth);
closeBtn.addEventListener('click', closeAuthModal);
lightThemeBtn.addEventListener('click', () => setTheme('light'));
darkThemeBtn.addEventListener('click', () => setTheme('dark'));
searchInput.addEventListener('input', handleSearch);
filterSelect.addEventListener('change', handleSearch);
imageUpload.addEventListener('change', handleImageUpload);

window.addEventListener('click', (event) => {
    if (event.target == loginContainer) {
        closeAuthModal();
    }
});

// Show authentication modal
function showAuthModal(type) {
    authTitle.textContent = type;
    authSubmit.textContent = type;
    loginContainer.style.display = 'block';
}

// Close authentication modal
function closeAuthModal() {
    loginContainer.style.display = 'none';
    username.value = '';
    password.value = '';
    authMessage.textContent = '';
}

// Handle authentication
function handleAuth() {
    const usernameValue = username.value;
    const passwordValue = password.value;

    if (!usernameValue || !passwordValue) {
        authMessage.textContent = 'Please enter both username and password.';
        return;
    }

    if (authTitle.textContent === 'Login') {
        login(usernameValue, passwordValue);
    } else {
        register(usernameValue, passwordValue);
    }
}

// Check if user is logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser') || null);
    
    if (user) {
        currentUser = user;
        updateUIForLoggedInUser();
        loadBlogs('user'); // Load user blogs
    } else {
        currentUser = null;
        updateUIForLoggedOutUser();
        loadBlogs('public'); // Load public blogs
    }
}



// Login function
function login(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = { username };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        closeAuthModal();
        updateUIForLoggedInUser(); // Update the UI immediately for the logged-in user
        loadBlogs('user');         // Load only user-specific blogs
    } else {
        authMessage.textContent = 'Invalid credentials';
    }
}




// Register function
function register(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.username === username)) {
        authMessage.textContent = 'Username already exists';
        return;
    }
    
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = { username };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    closeAuthModal();
    checkAuth();
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    blogEditor.style.display = 'none';
    userBlogList.style.display = 'none';
    loadBlogs('public');
}


// Publish or update a blog
function publishBlog() {
    const title = blogTitle.value;
    const content = blogContent.value;
    
    if (!title || !content) {
        alert('Please enter both title and content');
        return;
    }
    
    let blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    
    if (editingBlogId) {
        const index = blogs.findIndex(blog => blog.id === editingBlogId);
        if (index !== -1) {
            blogs[index] = { ...blogs[index], title, content, lastEdited: new Date().toISOString() };
        }
        editingBlogId = null;
        localStorage.setItem('blogs', JSON.stringify(blogs));
        loadBlogs('user');
    } else {
        const newBlog = { 
            id: Date.now(), 
            title, 
            content, 
            author: currentUser.username,
            timestamp: new Date().toISOString(),
            likes: 0,
            comments: []
        };
        blogs.push(newBlog);
        localStorage.setItem('blogs', JSON.stringify(blogs));
        loadBlogs(); // Reload all blogs after adding a new one
    }
    
    blogTitle.value = '';
    blogContent.value = '';
    publishBtn.textContent = 'Publish';
}


// Render blogs function
function renderBlogs(blogs, container) {
    container.innerHTML = '';
    
    blogs.forEach(blog => {
        const blogPost = document.createElement('div');
        blogPost.className = 'blog-post';
        
        const contentPreview = blog.content.length > 300 ? blog.content.slice(0, 300) + '...' : blog.content;
        
        blogPost.innerHTML = `
            <h2>${blog.title}</h2>
            <p class="author">By ${blog.author}</p>
            <div class="content">
                <div class="content-preview">${marked.marked(contentPreview)}</div>
                ${blog.content.length > 300 ? '<button class="read-more-btn">Read More</button>' : ''}
                <div class="content-full" style="display: none;">${marked.marked(blog.content)}</div>
            </div>
            <p class="timestamp">Published on ${new Date(blog.timestamp).toLocaleString()}</p>
            <div class="blog-actions">
                <button class="like-button" onclick="likeBlog(${blog.id})">
                    <i class="fas fa-heart"></i> ${blog.likes}
                </button>
                ${currentUser && blog.author === currentUser.username ? `
                    <button onclick="editBlog(${blog.id})">Edit</button>
                    <button onclick="deleteBlog(${blog.id})">Delete</button>
                ` : ''}
            </div>
            <div class="comments-section">
                <h3>Comments</h3>
                ${(blog.comments || []).map(comment => `
                    <div class="comment">
                        <p>${comment.text}</p>
                        <small>By ${comment.author} on ${new Date(comment.timestamp).toLocaleString()}</small>
                    </div>
                `).join('')}
                <form class="comment-form" onsubmit="addComment(event, ${blog.id})">
                    <input type="text" placeholder="Add a comment" required>
                    <button type="submit">Post</button>
                </form>
            </div>
        `;
        
        container.appendChild(blogPost);
        
        const readMoreBtn = blogPost.querySelector('.read-more-btn');
        if (readMoreBtn) {
            const contentPreviewElement = blogPost.querySelector('.content-preview');
            const contentFullElement = blogPost.querySelector('.content-full');

            readMoreBtn.addEventListener('click', () => {
                contentPreviewElement.style.display = 'none';
                contentFullElement.style.display = 'block';

                // Add "Read Less" button
                const readLessBtn = document.createElement('button');
                readLessBtn.className = 'read-less-btn';
                readLessBtn.textContent = 'Read Less';
                readLessBtn.style.marginLeft = '10px';

                readLessBtn.addEventListener('click', () => {
                    contentPreviewElement.style.display = 'block';
                    contentFullElement.style.display = 'none';
                    readMoreBtn.style.display = 'inline-block';
                    readLessBtn.remove();
                });

                readMoreBtn.style.display = 'none';
                readMoreBtn.insertAdjacentElement('afterend', readLessBtn);
            });
        }
    });
}


// Add comment function
function addComment(event, blogId) {
    event.preventDefault();
    const commentText = event.target.querySelector('input').value;
    let blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    const index = blogs.findIndex(b => b.id === blogId);
    
    if (index !== -1) {
        const newComment = {
            text: commentText,
            author: currentUser ? currentUser.username : 'Anonymous',
            timestamp: new Date().toISOString()
        };
        blogs[index].comments.push(newComment);
        localStorage.setItem('blogs', JSON.stringify(blogs));
        loadBlogs();
    }
    
    event.target.reset();
}

// Load blogs function
function loadBlogs(context = 'public') {
    // Clear previous content to avoid displaying mixed data
    publicBlogList.innerHTML = '';
    userBlogList.innerHTML = '';

    if (context === 'user' && currentUser) {
        loadUserBlogs();
        userBlogList.style.display = 'grid';
        publicBlogList.style.display = 'none';
    } else {
        loadPublicBlogs();
        publicBlogList.style.display = 'grid';
        userBlogList.style.display = 'none';
    }
}




// Load public blogs function
function loadPublicBlogs() {
    showLoadingSpinner(publicBlogList);
    setTimeout(() => {
        let blogs = JSON.parse(localStorage.getItem('blogs')) || [];
        renderBlogs(blogs, publicBlogList); // Only render in publicBlogList
    }, 1000); // Simulating network delay
}


// Load user blogs function
function loadUserBlogs() {
    showLoadingSpinner(userBlogList);
    setTimeout(() => {
        const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
        const userBlogs = blogs.filter(blog => blog.author === currentUser.username);
        renderBlogs(userBlogs, userBlogList); // Only render in userBlogList
    }, 1000); // Simulating network delay
}


function updateUIForLoggedInUser() {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    blogEditor.style.display = 'block';
    userBlogList.style.display = 'grid';
    publicBlogList.style.display = 'none';
}

function updateUIForLoggedOutUser() {
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    blogEditor.style.display = 'none';
    userBlogList.style.display = 'none';
    publicBlogList.style.display = 'grid';
}


// Edit blog function
function editBlog(id) {
    const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    const blog = blogs.find(b => b.id === id);
    
    if (blog && blog.author === currentUser.username) {
        blogTitle.value = blog.title;
        blogContent.value = blog.content;
        editingBlogId = id;
        publishBtn.textContent = 'Update';
        blogEditor.scrollIntoView({ behavior: 'smooth' });
    }
}

// Delete blog function
function deleteBlog(id) {
    let blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    const index = blogs.findIndex(b => b.id === id);
    
    if (index !== -1 && blogs[index].author === currentUser.username) {
        blogs.splice(index, 1);
        localStorage.setItem('blogs', JSON.stringify(blogs));
        loadBlogs();
    }
}

// Like blog function
function likeBlog(id) {
    let blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    const index = blogs.findIndex(b => b.id === id);
    
    if (index !== -1) {
        blogs[index].likes += 1;
        localStorage.setItem('blogs', JSON.stringify(blogs));
        loadBlogs();
    }
}

// Add comment function
function addComment(event, blogId) {
    event.preventDefault();
    const commentText = event.target.querySelector('input').value;
    let blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    const index = blogs.findIndex(b => b.id === blogId);
    
    if (index !== -1) {
        const newComment = {
            text: commentText,
            author: currentUser ? currentUser.username : 'Anonymous',
            timestamp: new Date().toISOString()
        };
        blogs[index].comments.push(newComment);
        localStorage.setItem('blogs', JSON.stringify(blogs));
        loadBlogs();
    }
    
    event.target.reset();
}

// Update theme function
function updateTheme() {
    document.body.style.setProperty('--background-color', bgColor.value);
    document.body.style.setProperty('--text-color', textColor.value);
    localStorage.setItem('theme', JSON.stringify({ bg: bgColor.value, text: textColor.value }));
}

// Load theme function
function loadTheme() {
    const theme = JSON.parse(localStorage.getItem('theme'));
    if (theme) {
        bgColor.value = theme.bg;
        textColor.value = theme.text;
        updateTheme();
    }
}

// Set theme function
function setTheme(theme) {
    const header = document.querySelector('header');
    const userActions = document.getElementById('user-actions');
    const modalContent = document.querySelectorAll('.modal-content');

    if (theme === 'dark') {
        // Apply dark mode styles
        document.body.classList.add('dark-mode');
        header.classList.add('dark-mode');
        userActions.classList.add('dark-mode');
        modalContent.forEach(modal => {
            modal.classList.add('dark-mode');
        });
        document.body.style.backgroundColor = ''; 
    } else {
        // Revert to light mode styles
        document.body.classList.remove('dark-mode');
        header.classList.remove('dark-mode');
        userActions.classList.remove('dark-mode');
        modalContent.forEach(modal => {
            modal.classList.remove('dark-mode');
        });

        // Ensure the light mode background is applied
        document.body.style.backgroundColor = '';
    }

    // Store the preferred theme in local storage
    localStorage.setItem('preferredTheme', theme);
}


// Handle search function
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterType = filterSelect.value;
    const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    
    const filteredBlogs = blogs.filter(blog => {
        if (filterType === 'all' || filterType === 'title') {
            if (blog.title.toLowerCase().includes(searchTerm)) return true;
        }
        if (filterType === 'all' || filterType === 'author') {
            if (blog.author.toLowerCase().includes(searchTerm)) return true;
        }
        if (filterType === 'all' || filterType === 'content') {
            if (blog.content.toLowerCase().includes(searchTerm)) return true;
        }
        return false;
    });
    
    renderBlogs(filteredBlogs, currentUser ? userBlogList : publicBlogList);
}

// Show loading spinner function
function showLoadingSpinner(container) {
    container.innerHTML = '<div class="loading-spinner"></div>';
}

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            blogContent.value += `\n![${file.name}](${img.src})`;
        }
        reader.readAsDataURL(file);
    }
}

// Initialize app
checkAuth();
window.onload = checkAuth;
// Load preferred theme
const preferredTheme = localStorage.getItem('preferredTheme');
if (preferredTheme) {
    setTheme(preferredTheme);
}


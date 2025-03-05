// @ts-nocheck

let users = [];
let blogs = [];

function createUser(username, password) {
    if (users.find(user => user.username === username)) {
        return null;
    }
    const user = { username, password };
    users.push(user);
    return user;
}

function getUser(username) {
    return users.find(user => user.username === username);
}

function createBlog(title, content, author) {
    const blog = { id: blogs.length + 1, title, content, author };
    blogs.push(blog);
    return blog;
}

function getAllBlogs() {
    return blogs;
}

module.exports = {
    createUser,
    getUser,
    createBlog,
    getAllBlogs
};


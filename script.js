const API_KEY = "41a4271770ba483bb90061fa0a7241b9";
const url = "https://newsapi.org/v2/everything?q=";

window.addEventListener("load", () => fetchNews("India"));

function reload() {
    window.location.reload();
}

async function fetchNews(query) {
    const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
    const data = await res.json();
    bindData(data.articles);
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    cardsContainer.innerHTML = "";

    articles.forEach((article) => {
        if (!article.urlToImage) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });

    newsSource.innerHTML = `${article.source.name} · ${date}`;

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

let curSelectedNav = null;
function onNavItemClick(id) {
    fetchNews(id);
    const navItem = document.getElementById(id);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = navItem;
    curSelectedNav.classList.add("active");
}

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
    const query = searchText.value;
    if (!query) return;
    fetchNews(query);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
});

// Mobile Menu Toggle Functionality
function toggleMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const body = document.body;
    
    // Toggle active classes
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    body.classList.toggle('menu-open');
    
    // Update hamburger animation
    if (hamburger.classList.contains('active')) {
        hamburger.setAttribute('aria-expanded', 'true');
    } else {
        hamburger.setAttribute('aria-expanded', 'false');
    }
}

// Close mobile menu when clicking on nav links
function closeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const body = document.body;
    
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    body.classList.remove('menu-open');
    hamburger.setAttribute('aria-expanded', 'false');
}

// Enhanced onNavItemClick function to close mobile menu
function onNavItemClick(itemId) {
    // Close mobile menu first
    closeMobileMenu();
    
    // Clear active states
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    // Add active state to clicked item
    const clickedLink = document.getElementById(itemId);
    if (clickedLink) clickedLink.classList.add('active');
    
    console.log('Navigation item clicked:', itemId);
    
    // Your existing news filtering logic here
    if (typeof filterNews === 'function') {
        filterNews(itemId);
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    // Check if click is outside hamburger and nav menu
    if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
        closeMobileMenu();
    }
});

// Close mobile menu with ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeMobileMenu();
    }
});

// Handle window resize - close menu on larger screens
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
});

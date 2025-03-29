// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'md:hidden p-2 text-gray-500 hover:text-gray-700';
    mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
    document.querySelector('nav > div').prepend(mobileMenuButton);
    
    const mobileMenu = document.getElementById('mobileMenu');
    let menuOpen = false;
    
    mobileMenuButton.addEventListener('click', () => {
        menuOpen = !menuOpen;
        if (menuOpen) {
            mobileMenu.classList.remove('hidden');
            mobileMenuButton.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            mobileMenu.classList.add('hidden');
            mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('nav') && menuOpen) {
            mobileMenu.classList.add('hidden');
            mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
            menuOpen = false;
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Demo functionality for sign-in buttons
    document.querySelectorAll('button').forEach(button => {
        if (button.textContent.includes('Sign in') || button.textContent.includes('Get started')) {
            button.addEventListener('click', () => {
                alert('This is a demo. Sign-in functionality would be implemented in a production version.');
            });
        }
    });
});
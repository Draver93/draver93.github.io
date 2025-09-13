// Tutorial Reader - Handles loading and displaying full tutorial content
class TutorialReader {
    constructor() {
        this.tutorials = [];
        this.links = {};
        this.currentTutorialIndex = 0;
        this.currentTutorial = null;
        this.init();
    }

    async init() {
        try {
            // Load tutorials data
            await this.loadTutorials();
            
            // Get tutorial ID from URL
            const tutorialId = this.getTutorialIdFromUrl();
            
            // Find and display tutorial
            if (tutorialId) {
                this.displayTutorial(tutorialId);
            } else {
                this.showError('No tutorial specified');
            }
            
            // Initialize navigation
            this.initNavigation();
            
            // Initialize progress bar
            this.initProgressBar();
            
        } catch (error) {
            console.error('Error initializing tutorial reader:', error);
            this.showError('Failed to load tutorial');
        }
    }

    async loadTutorials() {
        try {
            const [tutorialsResponse, linksResponse] = await Promise.all([
                fetch('content/tutorials.json'),
                fetch('content/links.json')
            ]);
            
            if (!tutorialsResponse.ok) throw new Error(`HTTP error! status: ${tutorialsResponse.status}`);
            if (!linksResponse.ok) throw new Error(`HTTP error! status: ${linksResponse.status}`);
            
            const tutorialsData = await tutorialsResponse.json();
            const linksData = await linksResponse.json();
            
            this.tutorials = tutorialsData.tutorials;
            this.links = linksData;
        } catch (error) {
            console.error('Error loading tutorials:', error);
            throw error;
        }
    }

    getTutorialIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    displayTutorial(tutorialId) {
        const tutorial = this.tutorials.find(t => t.id === tutorialId);
        if (!tutorial) {
            this.showError('Tutorial not found');
            return;
        }

        this.currentTutorial = tutorial;
        this.currentTutorialIndex = this.tutorials.findIndex(t => t.id === tutorialId);
        
        // Update page title
        document.title = `${tutorial.title} - FFStudio Tutorials`;
        
        // Display tutorial header
        this.displayTutorialHeader(tutorial);
        
        // Display tutorial body
        this.displayTutorialBody(tutorial);
        
        // Update navigation buttons
        this.updateNavigationButtons();
        
        // Scroll to top
        window.scrollTo(0, 0);
    }

    displayTutorialHeader(tutorial) {
        const header = document.getElementById('tutorial-header');
        
        header.innerHTML = `
            <h1>${tutorial.title}</h1>
            <div class="tutorial-meta">
                <span><i class="fas fa-clock"></i> ${tutorial.readTime}</span>
                <span><i class="fas fa-calendar"></i> ${tutorial.date}</span>
                <span><i class="fas fa-tag"></i> ${tutorial.category}</span>
            </div>
            <p class="tutorial-description">${tutorial.description}</p>
            <div class="tutorial-tags">
                ${tutorial.tags.map(tag => `<span class="tutorial-tag">${tag}</span>`).join('')}
            </div>
        `;
        
        // Update navigation links
        this.updateNavigationLinks();
    }

    displayTutorialBody(tutorial) {
        const body = document.getElementById('tutorial-body');
        
        let bodyContent = '';
        
        // Add table of contents if there are sections
        if (tutorial.sections && tutorial.sections.length > 0) {
            bodyContent += this.createTableOfContents(tutorial.sections);
        }
        
        // Add introduction
        if (tutorial.intro) {
            tutorial.intro = tutorial.intro.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            bodyContent += `
                <div class="tutorial-intro">
                    <h2>Introduction</h2>
                    <p>${tutorial.intro}</p>
                </div>
            `;
        }
        
        // Add sections
        if (tutorial.sections && tutorial.sections.length > 0) {
            tutorial.sections.forEach((section, index) => {
                bodyContent += this.createSectionContent(section, index);
            });
        }
        
        // Add conclusion
        if (tutorial.conclusion) {
            tutorial.conclusion = tutorial.conclusion.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
            bodyContent += `
                <div class="tutorial-conclusion">
                    <h3><i class="fas fa-check-circle"></i> Conclusion</h3>
                    <p>${tutorial.conclusion}</p>
                </div>
            `;
        }
        
        body.innerHTML = bodyContent;
        
        // Initialize section navigation
        this.initSectionNavigation();
    }

    createTableOfContents(sections) {
        let toc = '<div class="tutorial-toc"><h3><i class="fas fa-list"></i> Table of Contents</h3><ul class="toc-list">';
        
        sections.forEach((section, index) => {
            toc += `
                <li>
                    <a href="#section-${index}" class="toc-link">
                        <i class="fas fa-play"></i>
                        ${section.title}
                    </a>
                </li>
            `;
        });
        
        toc += '</ul></div>';
        return toc;
    }

    createSectionContent(section, index) {
        let formatted_content = "";
        const blocks = section.content.split(/\n/); // split by 2+ newlines (paragraphs)

        blocks.forEach(block => {
            block = block.trim().replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

            // Detect code block starting with ```bash
            const codeMatch = block.match(/^```(bash)?([\s\S]+?)```$/);
            if (codeMatch) {
                const codeContent = codeMatch[2];
                formatted_content += `<pre><code class="language-bash">${codeContent}</code></pre>`;
            } else {
                // Replace single newlines with <br> inside paragraphs
                const formatted = block.replace(/\n/g, '<br>');
                formatted_content += `<p>${formatted}</p>`;
            }
        });

        let sectionContent = `
            <div class="tutorial-section" id="section-${index}">
                <h3>${section.title}</h3>
                ${formatted_content}  <!-- don't wrap all content in <p> -->
            </div>
        `;
        
        // Add image if available
        if (section.image) {
            sectionContent += `
                <div class="tutorial-section-image">
                    <img 
                        src="assets/images/${section.image}" 
                        alt="${section.title}" 
                        class="zoomable-image"
                        onerror="this.style.display='none'"
                    >
                    <div class="image-caption">${section.title}</div>
                </div>
            `;
        }
        
        // Add YouTube video if available
        if (section.youtubeVideo) {
            sectionContent += `
                <div class="tutorial-video">
                    <div class="video-container">
                        <iframe src="${this.getEmbedUrl(section.youtubeVideo)}" 
                                title="${section.title}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                        </iframe>
                    </div>
                </div>
            `;
        }
        
        sectionContent += '</div>';
        return sectionContent;
    }

    getEmbedUrl(youtubeUrl) {
        // Convert YouTube URL to embed URL
        const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId[1]}`;
        }
        return youtubeUrl;
    }

    initSectionNavigation() {
        // Add smooth scrolling to table of contents links
        const tocLinks = document.querySelectorAll('.toc-link');
        tocLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    initNavigation() {
        const prevBtn = document.getElementById('prev-tutorial');
        const nextBtn = document.getElementById('next-tutorial');
        
        prevBtn.addEventListener('click', () => this.navigateToPrevious());
        nextBtn.addEventListener('click', () => this.navigateToNext());
    }

    navigateToPrevious() {
        if (this.currentTutorialIndex > 0) {
            const prevTutorial = this.tutorials[this.currentTutorialIndex - 1];
            this.navigateToTutorial(prevTutorial.id);
        }
    }

    navigateToNext() {
        if (this.currentTutorialIndex < this.tutorials.length - 1) {
            const nextTutorial = this.tutorials[this.currentTutorialIndex + 1];
            this.navigateToTutorial(nextTutorial.id);
        }
    }

    navigateToTutorial(tutorialId) {
        // Update URL without page reload
        const newUrl = `${window.location.pathname}?id=${tutorialId}`;
        window.history.pushState({ tutorialId }, '', newUrl);
        
        // Display the tutorial
        this.displayTutorial(tutorialId);
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-tutorial');
        const nextBtn = document.getElementById('next-tutorial');
        
        prevBtn.disabled = this.currentTutorialIndex === 0;
        nextBtn.disabled = this.currentTutorialIndex === this.tutorials.length - 1;
        
        // Update button text
        if (this.currentTutorialIndex === 0) {
            prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i> No Previous Tutorial';
        } else {
            prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i> Previous Tutorial';
        }
        
        if (this.currentTutorialIndex === this.tutorials.length - 1) {
            nextBtn.innerHTML = 'No Next Tutorial <i class="fas fa-chevron-right"></i>';
        } else {
            nextBtn.innerHTML = 'Next Tutorial <i class="fas fa-chevron-right"></i>';
        }
    }

    initProgressBar() {
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'tutorial-progress';
        progressBar.innerHTML = '<div class="tutorial-progress-bar"></div>';
        document.body.appendChild(progressBar);
        
        // Update progress on scroll
        window.addEventListener('scroll', () => {
            this.updateProgressBar();
        });
    }

    updateProgressBar() {
        const progressBar = document.querySelector('.tutorial-progress-bar');
        if (!progressBar) return;
        
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        progressBar.style.width = scrollPercent + '%';
    }

    showError(message) {
        const header = document.getElementById('tutorial-header');
        const body = document.getElementById('tutorial-body');
        
        header.innerHTML = `
            <div class="tutorial-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Tutorial</h3>
                <p>${message}</p>
                <a href="index.html#tutorials" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i> Back to Tutorials
                </a>
            </div>
        `;
        
        body.innerHTML = '';
    }

    showLoading() {
        const header = document.getElementById('tutorial-header');
        const body = document.getElementById('tutorial-body');
        
        header.innerHTML = `
            <div class="tutorial-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading tutorial...</p>
            </div>
        `;
        
        body.innerHTML = '';
    }
    
    updateNavigationLinks() {
        if (!this.links || !this.links.navigation) return;
        
        // Update navigation links if they exist
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes('#')) {
                const section = href.split('#')[1];
                if (this.links.navigation[section]) {
                    link.href = `index.html${this.links.navigation[section]}`;
                }
            }
        });
    }
}

// Initialize tutorial reader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TutorialReader();
});

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.tutorialId) {
        // Reload the page to show the correct tutorial
        window.location.reload();
    }
});

document.addEventListener("click", function(e) {
    if (e.target.classList.contains("zoomable-image")) {
        const src = e.target.src;

        // create overlay
        const overlay = document.createElement("div");
        overlay.style = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        overlay.addEventListener("click", () => overlay.remove());

        // create full-size image
        const img = document.createElement("img");
        img.src = src; 
        img.style = "max-width: 90%; max-height: 90%; border-radius: 8px; box-shadow: 0 0 20px #000;";
        overlay.appendChild(img);

        document.body.appendChild(overlay);
    }
});
// Content Loader - Automatically loads and displays content from JSON files
class ContentLoader {
    constructor() {
        this.contentCache = {};
        this.init();
    }

    async init() {
        try {
            // Load all content files
            await this.loadAllContent();
            
            // Populate the page with content
            this.populatePage();
            
            // Initialize dynamic features
            this.initDynamicFeatures();
            
        } catch (error) {
            console.error('Error loading content:', error);
            this.showFallbackContent();
        }
    }

    async loadAllContent() {
        const contentFiles = [
            'content/site-config.json',
            'content/features.json',
            'content/tutorials.json',
            'content/downloads.json',
            'content/links.json'
        ];

        const loadPromises = contentFiles.map(async (file) => {
            try {
                const response = await fetch(file);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                const key = file.split('/').pop().replace('.json', '');
                this.contentCache[key] = data;
            } catch (error) {
                console.warn(`Failed to load ${file}:`, error);
            }
        });

        await Promise.all(loadPromises);
    }

    populatePage() {
        // Populate site configuration
        if (this.contentCache['site-config']) {
            this.populateSiteConfig();
        }

        // Populate features
        if (this.contentCache['features']) {
            this.populateFeatures();
        }

        // Populate tutorials
        if (this.contentCache['tutorials']) {
            this.populateTutorials();
        }

        // Populate downloads
        if (this.contentCache['downloads']) {
            this.populateDownloads();
        }
    }

    populateSiteConfig() {
        const config = this.contentCache['site-config'];
        const links = this.contentCache['links'];
        
        // Update page title and meta
        document.title = config.site.title;
        
        // Update hero section
        const heroTitle = document.querySelector('.hero h1');
        const heroSubtitle = document.querySelector('.hero p');
        const primaryBtn = document.querySelector('.cta-buttons .btn-primary');
        const secondaryBtn = document.querySelector('.cta-buttons .btn-secondary');
        const patreonBtn = document.querySelector('.btn-patreon');
        if(links.external["patreon"]) patreonBtn.href = links.external["patreon"];
        else {
            patreonBtn.classList.add('btn-disabled');
            patreonBtn.removeAttribute('href');
        }

        if (heroTitle) heroTitle.textContent = config.hero.title;
        if (heroSubtitle) heroSubtitle.textContent = config.hero.subtitle;
        
        if (primaryBtn) {
            const primaryUrl = links.navigation[config.hero.primaryButton.url.replace('#', '')] || config.hero.primaryButton.url;
            const isPrimaryAvailable = primaryUrl && primaryUrl.trim() !== '' && primaryUrl !== '#';
            
            if (isPrimaryAvailable) {
                primaryBtn.innerHTML = `<i class="${config.hero.primaryButton.icon}"></i> ${config.hero.primaryButton.text}`;
                primaryBtn.href = primaryUrl;
                primaryBtn.classList.remove('btn-disabled');
            } else {
                primaryBtn.innerHTML = `<i class="${config.hero.primaryButton.icon}"></i> ${config.hero.primaryButton.text} (Coming Soon)`;
                primaryBtn.classList.add('btn-disabled');
                primaryBtn.removeAttribute('href');
            }
        }
        
        if (secondaryBtn) {
            const secondaryUrl = links.navigation[config.hero.secondaryButton.url.replace('#', '')] || config.hero.secondaryButton.url;
            const isSecondaryAvailable = secondaryUrl && secondaryUrl.trim() !== '' && secondaryUrl !== '#';
            
            if (isSecondaryAvailable) {
                secondaryBtn.innerHTML = `<i class="${config.hero.secondaryButton.icon}"></i> ${config.hero.secondaryButton.text}`;
                secondaryBtn.href = secondaryUrl;
                secondaryBtn.classList.remove('btn-disabled');
            } else {
                secondaryBtn.innerHTML = `<i class="${config.hero.secondaryButton.icon}"></i> ${config.hero.secondaryButton.text} (Coming Soon)`;
                secondaryBtn.classList.add('btn-disabled');
                secondaryBtn.removeAttribute('href');
            }
        }

        // Update navigation
        this.populateNavigation(config.navigation, links);
        
        // Update footer
        this.populateFooter(config.footer, links);
    }

    populateNavigation(navigation, links) {
        const navList = document.querySelector('nav ul');
        if (!navList) return;

        navList.innerHTML = navigation.map(item => {
            const url = item.url.startsWith('#') ? item.url : links.navigation[item.url] || item.url;
            const isAvailable = url && url.trim() !== '' && url !== '#';
            
            if (!isAvailable) {
                return `<li><span class="nav-link-disabled">${item.label}</span></li>`;
            }
            
            return `<li><a href="${url}">${item.label}</a></li>`;
        }).join('');
    }

    populateFooter(footer, links) {
        const footerContent = document.querySelector('.footer-content');
        const copyright = document.querySelector('.copyright p');
        
        if (footerContent) {
            footerContent.innerHTML = footer.columns.map(column => `
                <div class="footer-column">
                    <h3>${column.title}</h3>
                    ${column.description ? `<p>${column.description}</p>` : ''}
                    ${column.socialLinks ? this.renderSocialLinks(column.socialLinks, links) : ''}
                    ${column.links ? this.renderFooterLinks(column.links, links) : ''}
                </div>
            `).join('');
        }
        
        if (copyright) {
            copyright.innerHTML = footer.copyright;
        }
    }

    renderSocialLinks(socialLinks, links) {
        return `<div class="social-links">
            ${socialLinks.map(link => {
                const url = links.social[link.platform.toLowerCase()] || link.url;
                const isAvailable = url && url.trim() !== '' && url !== '#';
                
                if (!isAvailable) {
                    return `<span class="social-link-disabled" title="${link.platform} (Coming Soon)"><i class="${link.icon}"></i></span>`;
                }
                
                return `<a href="${url}" title="${link.platform}"><i class="${link.icon}"></i></a>`;
            }).join('')}
        </div>`;
    }

    renderFooterLinks(links, globalLinks) {
        return `<ul class="footer-links">
            ${links.map(link => {
                const url = globalLinks.external[link.text.toLowerCase().replace(/\s+/g, '')] || link.url;
                const isAvailable = url && url.trim() !== '' && url !== '#';
                
                if (!isAvailable) {
                    return `<li><span class="footer-link-disabled">${link.text}</span></li>`;
                }
                
                return `<li><a href="${url}">${link.text}</a></li>`;
            }).join('')}
        </ul>`;
    }

    populateFeatures() {
        const features = this.contentCache['features'];
        const featuresContainer = document.querySelector('.features');
        
        if (!featuresContainer) return;

        // Show only highlighted features by default
        const highlightedFeatures = features.features.filter(f => f.highlight);
        
        featuresContainer.innerHTML = highlightedFeatures.map(feature => `
            <div class="feature-card" data-category="${feature.category}">
                <div class="feature-icon">
                    <i class="${feature.icon}"></i>
                </div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
            </div>
        `).join('');

        // Add "Show More" button if there are more features
        if (features.features.length > highlightedFeatures.length) {
            const showMoreBtn = document.createElement('button');
            showMoreBtn.className = 'btn btn-secondary show-more-features';
            showMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Show More Features';
            showMoreBtn.onclick = () => this.showAllFeatures();
            
            const sectionTitle = document.querySelector('.section-title');
            if (sectionTitle) {
                sectionTitle.appendChild(showMoreBtn);
            }
        }
    }

    showAllFeatures() {
        const features = this.contentCache['features'];
        const featuresContainer = document.querySelector('.features');
        
        if (!featuresContainer) return;

        featuresContainer.innerHTML = features.features.map(feature => `
            <div class="feature-card" data-category="${feature.category}">
                <div class="feature-icon">
                    <i class="${feature.icon}"></i>
                </div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
            </div>
        `).join('');

        // Replace button with "Show Less"
        const showMoreBtn = document.querySelector('.show-more-features');
        if (showMoreBtn) {
            showMoreBtn.innerHTML = '<i class="fas fa-minus"></i> Show Less';
            showMoreBtn.onclick = () => this.showHighlightedFeatures();
        }
    }

    showHighlightedFeatures() {
        const features = this.contentCache['features'];
        const featuresContainer = document.querySelector('.features');
        
        if (!featuresContainer) return;

        const highlightedFeatures = features.features.filter(f => f.highlight);
        
        featuresContainer.innerHTML = highlightedFeatures.map(feature => `
            <div class="feature-card" data-category="${feature.category}">
                <div class="feature-icon">
                    <i class="${feature.icon}"></i>
                </div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
            </div>
        `).join('');

        // Replace button with "Show More"
        const showMoreBtn = document.querySelector('.show-more-features');
        if (showMoreBtn) {
            showMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Show More Features';
            showMoreBtn.onclick = () => this.showAllFeatures();
        }
    }

    populateTutorials() {
        const tutorials = this.contentCache['tutorials'];
        const tutorialGrid = document.querySelector('.tutorial-grid');
        const filterButtons = document.querySelector('.tutorial-filters');
        
        if (!tutorialGrid) return;

        // Populate filter buttons
        if (filterButtons) {
            filterButtons.innerHTML = tutorials.categories.map(category => 
                `<button class="filter-btn ${category === 'All Tutorials' ? 'active' : ''}" data-category="${category}">${category}</button>`
            ).join('');
        }

        // Show all tutorials initially
        this.renderTutorials(tutorials.tutorials);
    }

    renderTutorials(tutorialsToShow) {
        const tutorialGrid = document.querySelector('.tutorial-grid');
        if (!tutorialGrid) return;

        tutorialGrid.innerHTML = tutorialsToShow.map(tutorial => `
            <div class="tutorial-card" data-category="${tutorial.category}" data-tags="${tutorial.tags.join(',')}">
                <div class="tutorial-image ${tutorial.imageOptions ? this.getImageClasses(tutorial.imageOptions) : ''}">
                    ${tutorial.image ? 
                        `<img src="assets/images/${tutorial.image}" alt="${tutorial.title}" onerror="this.style.display='none'" ${tutorial.imageOptions ? this.getImageAttributes(tutorial.imageOptions) : ''}>` :
                        `<i class="${tutorial.icon}"></i>`
                    }
                </div>
                <div class="tutorial-content">
                    <h3>${tutorial.title}</h3>
                    <p>${tutorial.description}</p>
                    <div class="tutorial-meta">
                        <span><i class="far fa-clock"></i> ${tutorial.readTime}</span>
                        <span><i class="far fa-calendar"></i> ${tutorial.date}</span>
                    </div>
                    <a href="tutorial-reader.html?id=${tutorial.id}" class="read-more">Read Tutorial <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        `).join('');
    }

    populateDownloads() {
        const downloads = this.contentCache['downloads'];
        const links = this.contentCache['links'];
        const platformCards = document.querySelector('.platform-cards');
        const versionInfo = document.querySelector('.version-info p');
        
        if (!platformCards) return;

        platformCards.innerHTML = downloads.platforms.map(platform => {
            const downloadUrls = links.downloads[platform.id] || platform.downloadUrls;
            const isAvailable = downloadUrls && Object.keys(downloadUrls).length > 0;

            return `
                <div class="platform-card ${!isAvailable ? 'platform-unavailable' : ''} ${platform.id === 'windows' ? 'windows-card' : ''}" data-platform="${platform.id}">
                    ${platform.id === 'windows' ? 
                        `<div class="warning-bar">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span>Windows Defender may flag this download</span>
                        </div>` : ''
                    }
                    <div class="platform-icon">
                        <i class="${platform.icon}"></i>
                    </div>
                    <h3>${platform.name}</h3>
                    <p>${platform.description}</p>
                    ${isAvailable ? 
                        Object.entries(downloadUrls).map(([key, url]) => `<a href="${url}" class="download-btn ellipsis-start"">Download .${key}</a>`).join('') :
                        `<button class="download-btn ellipsis-start download-btn-disabled" disabled>Coming Soon</button>`
                    }
                </div>
            `;
        }).join('');

        if (versionInfo) {
            versionInfo.innerHTML = `Current version: ${downloads.currentVersion} | Released: ${downloads.releaseDate}`;
        }

        // Add click handlers for platform details
        this.initPlatformDetails();
    }

    initPlatformDetails() {
        const platformCards = document.querySelectorAll('.platform-card');
        platformCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't allow clicking on unavailable platforms
                if (card.classList.contains('platform-unavailable')) {
                    return;
                }
            });
        });
    }

    initDynamicFeatures() {
        // Initialize tutorial filtering
        this.initTutorialFiltering();
        
        // Initialize search functionality
        this.initSearch();
    }

    initTutorialFiltering() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Filter tutorials
                const category = button.dataset.category;
                this.filterTutorials(category);
            });
        });
    }

    filterTutorials(category) {
        const tutorials = this.contentCache['tutorials'];
        let tutorialsToShow = tutorials.tutorials;
        
        if (category !== 'All Tutorials') {
            tutorialsToShow = tutorials.tutorials.filter(tutorial => tutorial.category === category);
        }
        
        this.renderTutorials(tutorialsToShow);
    }

    initSearch() {
        // Add search input to tutorials section
        const tutorialsSection = document.querySelector('.tutorials .section-title');
        if (tutorialsSection) {
            const searchInput = document.createElement('div');
            searchInput.className = 'search-container';
            searchInput.innerHTML = `
                <input type="text" id="tutorial-search" placeholder="Search tutorials..." class="search-input">
                <i class="fas fa-search search-icon"></i>
            `;
            tutorialsSection.appendChild(searchInput);
            
            // Add search functionality
            const searchInputElement = document.getElementById('tutorial-search');
            searchInputElement.addEventListener('input', (e) => {
                this.searchTutorials(e.target.value);
            });
        }
    }

    searchTutorials(query) {
        const tutorials = this.contentCache['tutorials'];
        if (!query.trim()) {
            this.renderTutorials(tutorials.tutorials);
            return;
        }
        
        const filteredTutorials = tutorials.tutorials.filter(tutorial => 
            tutorial.title.toLowerCase().includes(query.toLowerCase()) ||
            tutorial.description.toLowerCase().includes(query.toLowerCase()) ||
            tutorial.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        
        this.renderTutorials(filteredTutorials);
    }

    showFallbackContent() {
        console.log('Using fallback content - content files could not be loaded');
        // The page will show the original HTML content if JSON loading fails
    }

    getImageClasses(imageOptions) {
        const classes = [];
        
        if (imageOptions.aspectRatio) {
            classes.push(`aspect-${imageOptions.aspectRatio}`);
        }
        
        if (imageOptions.containerClass) {
            classes.push(imageOptions.containerClass);
        }
        
        return classes.join(' ');
    }

    getImageAttributes(imageOptions) {
        const attributes = [];
        
        if (imageOptions.crop) {
            attributes.push(`class="crop-${imageOptions.crop}"`);
        }
        
        if (imageOptions.fit) {
            attributes.push(`class="fit-${imageOptions.fit}"`);
        }
        
        if (imageOptions.crop && imageOptions.fit) {
            attributes.push(`class="crop-${imageOptions.crop} fit-${imageOptions.fit}"`);
        }
        
        return attributes.join(' ');
    }
}

// Initialize content loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ContentLoader();
});

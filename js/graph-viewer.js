// Graph Library - Handles loading and displaying graph templates
class GraphLibrary {
    constructor() {
        this.entries = [];
        this.filteredEntries = [];
        this.currentPage = 1;
        this.entriesPerPage = 12;
        this.totalPages = 1;
        this.site_config = null;
        this.links = null;
        
        // DOM Elements
        this.container = null;
        this.searchInput = null;
        this.loadingMessage = null;
        this.errorMessage = null;
        this.resultsCount = null;
        this.firstPageBtn = null;
        this.prevPageBtn = null;
        this.nextPageBtn = null;
        this.lastPageBtn = null;
        this.pageNumbersContainer = null;
        this.pageSizeSelect = null;
        
        this.searchTimeout = null;
        
        this.init();
    }

    async init() {
        try {
            // Initialize DOM references
            this.initializeDOMElements();
            
            // Load configuration data
            await this.loadConfigData();
            
            // Load graph data
            await this.loadGraphData();
            
            // Initialize event listeners
            this.initEventListeners();
            
            // Initialize pagination
            this.updatePagination();
            this.updateResultsCount();
            
            // Populate navigation and footer
            this.populateNavigation();
            this.populateFooter();
            
        } catch (error) {
            console.error('Error initializing graph library:', error);
            this.showError('Failed to load graph library');
        }
    }

    initializeDOMElements() {
        this.container = document.getElementById('entries-container');
        this.searchInput = document.getElementById('search-input');
        this.loadingMessage = document.getElementById('loading-message');
        this.errorMessage = document.getElementById('error-message');
        this.resultsCount = document.getElementById('results-count');
        
        // Pagination elements
        this.firstPageBtn = document.getElementById('first-page');
        this.prevPageBtn = document.getElementById('prev-page');
        this.nextPageBtn = document.getElementById('next-page');
        this.lastPageBtn = document.getElementById('last-page');
        this.pageNumbersContainer = document.getElementById('page-numbers');
        this.pageSizeSelect = document.getElementById('page-size');
        
        if (!this.container) throw new Error('Entries container not found');
    }

    async loadConfigData() {
        try {
            const [siteConfigResponse, linksResponse] = await Promise.all([
                fetch('content/site-config.json'),
                fetch('content/links.json')
            ]);
            
            if (!siteConfigResponse.ok) throw new Error(`HTTP error! status: ${siteConfigResponse.status}`);
            if (!linksResponse.ok) throw new Error(`HTTP error! status: ${linksResponse.status}`);
            
            this.site_config = await siteConfigResponse.json();
            this.links = await linksResponse.json();
        } catch (error) {
            console.warn('Error loading config data:', error);
            // Continue without config data
        }
    }

    async loadGraphData() {
        this.showLoading();
        
        try {
            const response = await fetch('content/graphs/general.json');
            if (!response.ok) { throw new Error(`Failed to fetch graph list: ${response.status}`); }
            
            const data = await response.json();
            const graphNames = data.graphs;
            const entryPromises = graphNames.map(async (graphName) => {
                const generalResponse = await fetch(`content/graphs/${graphName}/general.json`);
                if (!generalResponse.ok) {
                    throw new Error(`HTTP error! status: ${generalResponse.status}`);
                }

                const generalData = await generalResponse.json();
                const versionPromises = generalData.graphs.map(async (graph) => {
                    const versionedResponse = await fetch(`content/graphs/${graphName}/ffmpeg_${graph.version}.json`);
                    if (!versionedResponse.ok) {
                        throw new Error(`HTTP error! status: ${versionedResponse.status}`);
                    }
                    const versionedData = await versionedResponse.text();
                    return {
                        version: graph.version,
                        graphData: versionedData
                    };
                });
                const versions = await Promise.all(versionPromises);

                return { ...generalData, versions };
            });

            this.entries = await Promise.all(entryPromises);
            this.filteredEntries = [...this.entries];
            this.entriesPerPage = parseInt(this.pageSizeSelect?.value || 12);
            
            this.hideLoading();
            this.renderEntries();
            
        } catch (error) {
            this.showError('Error loading graph templates: ' + error.message);
            console.error('Error loading graph data:', error);
        }
    }

    initEventListeners() {
        // Search functionality with debounce
        this.searchInput.addEventListener('input', () => {
            this.handleSearchInput();
        });

        // Clear search when pressing Escape
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.searchInput.value = '';
                this.handleSearchInput();
            }
        });

        // Pagination event handlers
        this.firstPageBtn?.addEventListener('click', () => this.goToPage(1));
        this.prevPageBtn?.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        this.nextPageBtn?.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        this.lastPageBtn?.addEventListener('click', () => this.goToPage(this.totalPages));

        // Page size change handler
        this.pageSizeSelect?.addEventListener('change', () => {
            this.handlePageSizeChange();
        });
    }

    handleSearchInput() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.performSearch();
        }, 300);
    }

    performSearch() {
        const query = this.searchInput.value.toLowerCase().trim();
        
        if (query === '') {
            this.filteredEntries = [...this.entries];
        } else {
            this.filteredEntries = this.entries.filter((entry) => {
                const inTitle = entry.title.toLowerCase().includes(query);
                const inDesc = entry.description.toLowerCase().includes(query);
                const inTags = entry.tags && entry.tags.some(tag => 
                    tag.toLowerCase().includes(query)
                );
                const inGraphData = JSON.stringify(entry.graphData).toLowerCase().includes(query);
                
                return inTitle || inDesc || inTags || inGraphData;
            });
        }
        
        this.currentPage = 1;
        this.renderEntries();
        this.updatePagination();
        this.updateResultsCount();
    }

    handlePageSizeChange() {
        this.entriesPerPage = parseInt(this.pageSizeSelect.value);
        this.currentPage = 1;
        this.renderEntries();
        this.updatePagination();
        this.updateResultsCount();
    }
    getCurrentPageEntries() {
        const startIndex = (this.currentPage - 1) * this.entriesPerPage;
        const endIndex = startIndex + this.entriesPerPage;
        return this.filteredEntries.slice(startIndex, endIndex);
    }

    renderEntries() {
        this.hideError();
        this.container.innerHTML = '';
        
        const pageEntries = this.getCurrentPageEntries();
        
        if (pageEntries.length === 0) {
            this.showNoResults();
            return;
        }

        pageEntries.forEach(entry => {
            const entryElement = this.createEntryElement(entry);
            this.container.appendChild(entryElement);
        });
    }

    createEntryElement(entry) {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'graph-entry';

        // Title
        const titleEl = document.createElement('h2');
        titleEl.textContent = entry.title;
        entryDiv.appendChild(titleEl);

        // Description
        const descEl = document.createElement('p');
        descEl.textContent = entry.description;
        entryDiv.appendChild(descEl);

        // Image (optional)
        if (entry.image) {
            const img = document.createElement('img');
            img.src = entry.image;
            img.alt = entry.title;
            img.loading = 'lazy';
            entryDiv.appendChild(img);
        }

        // Tags
        if (entry.tags && entry.tags.length > 0) {
            const tagsContainer = document.createElement('div');
            tagsContainer.className = 'tags-container';
            
            entry.tags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'tag';
                tagEl.textContent = tag;
                tagsContainer.appendChild(tagEl);
            });
            
            entryDiv.appendChild(tagsContainer);
        }

        // Version dropdown
        const versionSelect = document.createElement('select');
        versionSelect.className = 'version-select';
        entry.versions.forEach(version => {
            const option = document.createElement('option');
            option.value = version.version;
            option.textContent = `FFmpeg ${version.version}`;
            versionSelect.appendChild(option);
        });
        entryDiv.appendChild(versionSelect);

        // Graph input + copy button
        const graphContainer = this.createGraphInputContainer(entry, versionSelect);
        entryDiv.appendChild(graphContainer);

        return entryDiv;
    }

    createGraphInputContainer(entry, versionSelect) {
        const container = document.createElement('div');
        container.className = 'graph-text-container';

        const wrapper = document.createElement('div');
        wrapper.className = 'graph-input-wrapper';

        const input = document.createElement('input');
        input.type = 'text';
        input.readOnly = true;
        input.value = entry.versions[0].graphData; // Default to the first version
        input.className = 'graph-input';
        input.title = 'Click to select graph template data';

        // Auto-select text on click
        input.addEventListener('click', () => {
            input.select();
        });

        const copyBtn = this.createCopyButton(input.value);
        wrapper.appendChild(input);
        wrapper.appendChild(copyBtn);

        // Move the versionSelect dropdown into the wrapper
        container.appendChild(versionSelect);

        container.appendChild(wrapper);

        // Update input and copy button when version changes
        versionSelect.addEventListener('change', (e) => {
            const selectedVersion = e.target.value;
            const selectedGraph = entry.versions.find(v => v.version === selectedVersion);
            if (selectedGraph) {
                input.value = JSON.stringify(selectedGraph.graphData, null, 2);
                copyBtn.onclick = async () => {
                    await this.handleCopy(input.value, copyBtn);
                };
            }
        });

        return container;
    }

    createCopyButton(graphData) {
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.innerHTML = '<i class="fas fa-copy"></i>';
        btn.title = 'Copy template to clipboard';

        btn.addEventListener('click', async () => {
            await this.handleCopy(graphData, btn);
        });

        return btn;
    }

    async handleCopy(text, button) {
        try {
            await navigator.clipboard.writeText(text);
            this.showCopySuccess(button);
        } catch (err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            this.fallbackCopy(text, button);
        }
    }

    showCopySuccess(button) {
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.classList.add('success');
        
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-copy"></i>';
            button.classList.remove('success');
        }, 2000);
    }

    fallbackCopy(text, button) {
        // Create a temporary input element for fallback copy
        const tempInput = document.createElement('input');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        this.showCopySuccess(button);
    }

    updatePagination() {
        this.totalPages = Math.ceil(this.filteredEntries.length / this.entriesPerPage);
        this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages));
        
        this.updatePaginationButtons();
        this.updatePageNumbers();
    }

    updatePaginationButtons() {
        if (!this.firstPageBtn) return;
        
        this.firstPageBtn.disabled = this.currentPage === 1;
        this.prevPageBtn.disabled = this.currentPage === 1;
        this.nextPageBtn.disabled = this.currentPage === this.totalPages || this.totalPages === 0;
        this.lastPageBtn.disabled = this.currentPage === this.totalPages || this.totalPages === 0;
    }

    updatePageNumbers() {
        if (!this.pageNumbersContainer) return;
        
        this.pageNumbersContainer.innerHTML = '';
        
        if (this.totalPages === 0) {
            return;
        }
        
        // Show up to 5 page numbers
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(this.totalPages, this.currentPage + 2);
        
        // Adjust if we're near the start or end
        if (this.currentPage <= 3) {
            endPage = Math.min(5, this.totalPages);
        } else if (this.currentPage >= this.totalPages - 2) {
            startPage = Math.max(1, this.totalPages - 4);
        }
        
        // Add ellipsis at start if needed
        if (startPage > 1) {
            this.addEllipsis(this.pageNumbersContainer, true);
        }
        
        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            this.addPageNumber(i);
        }
        
        // Add ellipsis at end if needed
        if (endPage < this.totalPages) {
            this.addEllipsis(this.pageNumbersContainer, false);
        }
    }

    addPageNumber(pageNumber) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${pageNumber === this.currentPage ? 'active' : ''}`;
        pageBtn.textContent = pageNumber;
        pageBtn.addEventListener('click', () => this.goToPage(pageNumber));
        this.pageNumbersContainer.appendChild(pageBtn);
    }

    addEllipsis(container, isStart) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.padding = '0.7rem 0.5rem';
        ellipsis.style.color = 'var(--text-muted)';
        
        if (isStart) {
            container.appendChild(ellipsis);
        } else {
            container.appendChild(ellipsis);
        }
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderEntries();
        this.updatePagination();
        this.updateResultsCount();
        
        // Scroll to top of entries
        this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    updateResultsCount() {
        if (!this.resultsCount) return;
        
        const total = this.filteredEntries.length;
        const start = total === 0 ? 0 : (this.currentPage - 1) * this.entriesPerPage + 1;
        const end = Math.min(this.currentPage * this.entriesPerPage, total);
        
        this.resultsCount.textContent = total === 0 
            ? 'No templates found' 
            : `Showing ${start}-${end} of ${total} template${total !== 1 ? 's' : ''}`;
    }

    showLoading() {
        if (this.loadingMessage) {
            this.loadingMessage.style.display = 'block';
        }
        this.hideError();
    }

    hideLoading() {
        if (this.loadingMessage) {
            this.loadingMessage.style.display = 'none';
        }
    }

    showError(message) {
        this.hideLoading();
        
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.style.display = 'block';
        }
        
        this.container.innerHTML = '';
    }

    hideError() {
        if (this.errorMessage) {
            this.errorMessage.style.display = 'none';
        }
    }

    showNoResults() {
        this.container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No graph templates found</h3>
                <p>Try adjusting your search terms or browse all templates</p>
            </div>
        `;
    }

    populateNavigation() {
        if (!this.links || !this.site_config?.navigation) return;
        
        const navList = document.querySelector('nav ul');
        if (!navList) return;

        const navigation = this.site_config.navigation;
        
        navList.innerHTML = navigation.map(item => {
            const url = item.url.startsWith('#') ? item.url : this.links.navigation[item.url] || item.url;
            const isAvailable = url && url.trim() !== '' && url !== '#';
            
            if (!isAvailable) {
                return `<li><span class="nav-link-disabled">${item.label}</span></li>`;
            }
            
            const isActive = window.location.pathname.includes('graph-library.html') && item.label === 'Graph Library';
            const activeClass = isActive ? 'class="active"' : '';
            
            return `<li><a href="${item.url.startsWith('#') ? 'index.html' : ''}${url}" ${activeClass}>${item.label}</a></li>`;
        }).join('');
    }

    populateFooter() {
        if (!this.site_config?.footer?.copyright) return;
        
        const copyrightElement = document.querySelector('.copyright p');
        if (copyrightElement) {
            copyrightElement.innerHTML = this.site_config.footer.copyright;
        }
    }
}

// Initialize graph library when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GraphLibrary();
});
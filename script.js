class BookApp {
    constructor() {
        this.chapters = [];
        this.characters = [];
        this.loadFromLocalStorage();
        this.initializeEventListeners();
        this.renderChapters();
        this.renderCharacters();
    }

    initializeEventListeners() {
        document.getElementById('addChapter').addEventListener('click', () => this.addChapter());
        document.getElementById('downloadBook').addEventListener('click', () => this.downloadBook());
        document.getElementById('addCharacter').addEventListener('click', () => this.addCharacter());
    }

    loadFromLocalStorage() {
        const savedChapters = localStorage.getItem('bookChapters');
        const savedCharacters = localStorage.getItem('bookCharacters');
        this.chapters = savedChapters ? JSON.parse(savedChapters) : [];
        this.characters = savedCharacters ? JSON.parse(savedCharacters) : [];
    }

    saveToLocalStorage() {
        localStorage.setItem('bookChapters', JSON.stringify(this.chapters));
        localStorage.setItem('bookCharacters', JSON.stringify(this.characters));
    }

    addChapter() {
        const chapterNumber = this.chapters.length + 1;
        this.chapters.push({
            id: Date.now(),
            title: `Chapter ${chapterNumber}`,
            content: ''
        });
        this.saveToLocalStorage();
        this.renderChapters();
    }

    deleteChapter(id) {
        this.chapters = this.chapters.filter(chapter => chapter.id !== id);
        this.saveToLocalStorage();
        this.renderChapters();
    }

    updateChapterContent(id, content) {
        const chapter = this.chapters.find(chapter => chapter.id === id);
        if (chapter) {
            chapter.content = content;
            this.saveToLocalStorage();
            this.updateWordCount(id);
            this.updateTotalWordCount();
        }
    }

    updateChapterName(id, name) {
        const chapter = this.chapters.find(chapter => chapter.id === id);
        if (chapter) {
            chapter.title = name || `Chapter ${this.chapters.indexOf(chapter) + 1}`;
            this.saveToLocalStorage();
            this.updateChaptersDropdown();
        }
    }

    getWordCount(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    updateWordCount(id) {
        const wordCountElement = document.querySelector(`[data-word-count="${id}"]`);
        const chapter = this.chapters.find(chapter => chapter.id === id);
        if (wordCountElement && chapter) {
            const wordCount = this.getWordCount(chapter.content);
            wordCountElement.textContent = `${wordCount} words`;
        }
    }

    updateTotalWordCount() {
        const totalWords = this.chapters.reduce((total, chapter) => {
            return total + this.getWordCount(chapter.content);
        }, 0);
        document.getElementById('totalWordCount').textContent = totalWords;
    }

    downloadBook() {
        // Create a temporary div for PDF generation
        const tempDiv = document.createElement('div');
        tempDiv.className = 'pdf-content';
        tempDiv.style.padding = '20px';
        
        // Add book content
        this.chapters.forEach(chapter => {
            tempDiv.innerHTML += `
                <h2>${chapter.title}</h2>
                <div style="white-space: pre-wrap; margin-bottom: 20px;">
                    ${chapter.content}
                </div>
            `;
        });

        // PDF options
        const opt = {
            margin: 1,
            filename: 'my-book.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // Generate PDF
        html2pdf().set(opt).from(tempDiv).save();
    }

    updateChaptersDropdown() {
        const dropdownMenu = document.getElementById('chaptersMenu');
        dropdownMenu.innerHTML = '';

        this.chapters.forEach((chapter, index) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.className = 'dropdown-item';
            a.textContent = chapter.title || `Chapter ${index + 1}`;
            a.addEventListener('click', () => {
                document.querySelector(`[data-id="${chapter.id}"]`).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
            li.appendChild(a);
            dropdownMenu.appendChild(li);
        });
    }

    renderChapters() {
        const chaptersContainer = document.getElementById('chapters');
        chaptersContainer.innerHTML = '';

        this.chapters.forEach((chapter, index) => {
            const chapterElement = document.createElement('div');
            chapterElement.className = 'chapter';
            chapterElement.innerHTML = `
                <div class="chapter-header">
                    <div class="chapter-title-section">
                        <div class="chapter-number">Chapter ${index + 1}</div>
                        <input type="text" 
                            class="chapter-name-input" 
                            value="${chapter.title.replace(`Chapter ${index + 1}`, '')}" 
                            placeholder="Enter chapter name"
                            data-id="${chapter.id}">
                    </div>
                    <button class="btn btn-danger btn-sm" data-id="${chapter.id}">Delete Chapter</button>
                </div>
                <div class="chapter-stats">
                    Word count: <span data-word-count="${chapter.id}">0</span>
                </div>
                <textarea
                    class="form-control chapter-content"
                    data-id="${chapter.id}"
                    placeholder="Write your chapter content here..."
                >${chapter.content}</textarea>
            `;

            chaptersContainer.appendChild(chapterElement);
        });

        // Add event listeners
        document.querySelectorAll('[data-id]').forEach(element => {
            if (element.tagName === 'BUTTON') {
                element.addEventListener('click', (e) => {
                    this.deleteChapter(Number(e.target.dataset.id));
                });
            } else if (element.tagName === 'TEXTAREA') {
                element.addEventListener('input', (e) => {
                    this.updateChapterContent(Number(e.target.dataset.id), e.target.value);
                });
            } else if (element.tagName === 'INPUT') {
                element.addEventListener('input', (e) => {
                    this.updateChapterName(Number(e.target.dataset.id), e.target.value);
                });
            }
        });

        // Update word counts
        this.chapters.forEach(chapter => {
            this.updateWordCount(chapter.id);
        });
        this.updateTotalWordCount();

        // Update the chapters dropdown
        this.updateChaptersDropdown();
    }

    addCharacter() {
        const character = {
            id: Date.now(),
            name: 'New Character',
            description: '',
            traits: '',
            background: ''
        };
        this.characters.push(character);
        this.saveToLocalStorage();
        this.renderCharacters();
    }

    updateCharacter(id, field, value) {
        const character = this.characters.find(char => char.id === id);
        if (character) {
            character[field] = value;
            this.saveToLocalStorage();
        }
    }

    deleteCharacter(id) {
        this.characters = this.characters.filter(char => char.id !== id);
        this.saveToLocalStorage();
        this.renderCharacters();
    }

    showCharacterMetadata(characterId) {
        const character = this.characters.find(char => char.id === Number(characterId));
        if (character) {
            // Create or get modal for character info
            let modal = document.getElementById('characterInfoModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'characterInfoModal';
                modal.className = 'modal fade';
                modal.setAttribute('tabindex', '-1');
                document.body.appendChild(modal);
            }

            // Set modal content
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${character.name}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="character-info">
                                <div class="info-section">
                                    <h6>Description</h6>
                                    <p>${character.description || 'No description available'}</p>
                                </div>
                                <div class="info-section">
                                    <h6>Traits</h6>
                                    <p>${character.traits || 'No traits specified'}</p>
                                </div>
                                <div class="info-section">
                                    <h6>Background</h6>
                                    <p>${character.background || 'No background provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Show the modal
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    renderCharacters() {
        const charactersList = document.getElementById('charactersList');
        charactersList.innerHTML = '';

        this.characters.forEach(character => {
            const characterElement = document.createElement('div');
            characterElement.className = 'character-card';
            characterElement.innerHTML = `
                <div class="character-header">
                    <div class="d-flex align-items-center">
                        <h5 class="mb-0">${character.name}</h5>
                        <button class="btn btn-sm btn-outline-primary ms-2 character-info-btn"
                            data-character="${character.id}">
                            View Info
                        </button>
                        <button class="btn btn-sm btn-outline-success ms-2 character-insert-btn"
                            data-character="${character.id}">
                            Insert into Chapter
                        </button>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteCharacter(${character.id})">Delete</button>
                </div>
                <div class="character-details">
                    <div class="character-field">
                        <label>Name:</label>
                        <input type="text" value="${character.name}" 
                            onchange="app.updateCharacter(${character.id}, 'name', this.value)">
                    </div>
                    <div class="character-field">
                        <label>Description:</label>
                        <textarea onchange="app.updateCharacter(${character.id}, 'description', this.value)"
                            >${character.description}</textarea>
                    </div>
                    <div class="character-field">
                        <label>Traits:</label>
                        <textarea onchange="app.updateCharacter(${character.id}, 'traits', this.value)"
                            >${character.traits}</textarea>
                    </div>
                    <div class="character-field">
                        <label>Background:</label>
                        <textarea onchange="app.updateCharacter(${character.id}, 'background', this.value)"
                            >${character.background}</textarea>
                    </div>
                </div>
            `;
            charactersList.appendChild(characterElement);

            // Add click event for the info button
            const infoBtn = characterElement.querySelector('.character-info-btn');
            infoBtn.addEventListener('click', () => {
                this.showCharacterMetadata(character.id);
            });
        });
    }
}

// Initialize the app globally so we can access it from HTML
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BookApp();
}); 

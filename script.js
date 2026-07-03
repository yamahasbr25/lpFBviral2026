document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const keywordFromQuery = params.get('q') || '';
    
    // Clean URL parameter
    const cleanQuery = keywordFromQuery.replace(/-\d+$/, '');
    
    if (!cleanQuery) {
        runAGC('Trending News');
        return;
    }

    const targetHtml = cleanQuery + '.html';

    // Fetch override untuk memuat file statis (jika digenerate)
    fetch(targetHtml)
        .then(response => {
            if (response.ok) { return response.text(); }
            throw new Error('File not found');
        })
        .then(htmlData => {
            document.open();
            document.write(htmlData);
            document.close();
        })
        .catch(error => {
            // Jalankan AGC News jika statis 404
            const keyword = cleanQuery.replace(/-/g, ' ').trim();
            runAGC(keyword);
        });

    // ==========================================
    // FUNGSI UTAMA AGC (Auto Generated Content)
    // ==========================================
    function runAGC(keyword) {
        const detailTitle = document.getElementById('detail-title');
        const detailImageContainer = document.getElementById('detail-image-container');
        const detailBody = document.getElementById('detail-body');
        const relatedPostsContainer = document.getElementById('related-posts-container');
        
        const displayedKeywords = new Set();
        if (keyword) {
            displayedKeywords.add(keyword.toLowerCase());
        }
        
        function capitalizeEachWord(str) { 
            if (!str) return ''; 
            return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); 
        }
        
        // Hook News Edition
        function generateSeoTitle(baseKeyword) { 
            const hookWords = ['Breaking:', 'Trending:', 'Watch:', 'Exclusive:', 'Viral:', 'Latest Update:', 'Must Read:']; 
            const suffixWords = ['Revealed', 'Explained', 'Live Update', 'Caught on Camera', 'News'];
            const randomHook = hookWords[Math.floor(Math.random() * hookWords.length)]; 
            const randomSuffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];
            return `${randomHook} ${capitalizeEachWord(baseKeyword)} ${randomSuffix}`; 
        }

        // Spintax Deskripsi Berita
        function fallbackDescription(term) {
            const termCap = capitalizeEachWord(term);
            const templates = [
                `Stay informed with the latest breaking updates on <strong>${termCap}</strong>. Discover what is happening right now and why it's going viral across social media platforms.`,
                `Breaking news just in regarding <strong>${termCap}</strong>. Read the full story and watch the latest clips that have the entire internet buzzing today.`,
                `Here is everything you need to know about <strong>${termCap}</strong>. Don't miss out on today's most talked-about trending story as the situation develops.`
            ];
            const randomText = templates[Math.floor(Math.random() * templates.length)];
            if(detailBody) {
                detailBody.innerHTML = `<p>${randomText}</p><p>Bookmark this page for live updates and ongoing coverage. We are gathering more information from our sources, and this article will be continuously updated.</p>`;
            }
        }

        if (!keyword) { 
            if(detailTitle) detailTitle.textContent = 'News Not Found'; 
            if(detailBody) detailBody.innerHTML = '<p>Sorry, the requested news could not be found. Please return to the <a href="index.html">homepage</a>.</p>'; 
            if (relatedPostsContainer) { relatedPostsContainer.closest('.related-posts-section').style.display = 'none'; } 
            return; 
        }

        function populateMainContent(term) {
            const newTitle = generateSeoTitle(term);
            document.title = `${newTitle} | Nice News`; 
            if(detailTitle) detailTitle.textContent = newTitle; 
            
            // Gambar Utama Menjadi Link Image
            const queryImage = term + " breaking news"; 
            const mainImageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=800&h=450&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
            
            if(detailImageContainer) {
                detailImageContainer.innerHTML = `<a href="${mainImageUrl}" target="_blank" title="View Full Image of ${capitalizeEachWord(term)}"><img src="${mainImageUrl}" alt="${newTitle}"></a>`;
            }
            
            fallbackDescription(term);
        }

        function generateRelatedPosts(term) {
            const alphabet = 'abcdefghijklmnopqrstuvwxyz';
            let relatedCount = 0;
            
            function appendRandomKeywords() {
                if (relatedCount >= 8) return; 
                
                const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
                
                // Fetch suggestion dari Bing
                fetch(`https://api.bing.com/osjson.aspx?query=${encodeURIComponent(term + ' ' + randomChar)}`)
                    .then(res => res.json())
                    .then(data => {
                        const suggestions = data[1] || [];
                        processSuggestions(suggestions);
                    })
                    .catch(() => {
                        // Fallback kata kunci berita
                        const dummy = [term + " latest update", term + " today", term + " viral video", term + " breaking news"];
                        processSuggestions(dummy);
                    })
                    .finally(() => {
                        if (relatedCount < 8) {
                            setTimeout(appendRandomKeywords, 500); 
                        }
                    });
            }
            
            function processSuggestions(suggestions) {
                suggestions.forEach(relatedTerm => {
                    let cleanTerm = relatedTerm.replace(/news/gi, '').trim();
                    if (!cleanTerm) cleanTerm = relatedTerm;

                    const termLower = cleanTerm.toLowerCase();
                    if (!termLower || displayedKeywords.has(termLower) || relatedCount >= 8) return;
                    
                    displayedKeywords.add(termLower);
                    relatedCount++;
                    
                    const keywordForUrl = cleanTerm.replace(/\s/g, '-').toLowerCase();
                    const linkUrl = `index.html?q=${encodeURIComponent(keywordForUrl)}`;
                    
                    const queryImage = cleanTerm + " breaking news";
                    const imageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(queryImage)}&w=400&h=250&c=7&rs=1&p=0&dpr=1.5&pid=1.7`;
                    const newRelatedTitle = generateSeoTitle(cleanTerm);
                    
                    // KEYWORD MENJADI IMAGE THUMBNAIL LINK
                    const card = `
                    <article class="content-card">
                        <a href="${linkUrl}">
                            <img src="${imageUrl}" alt="${newRelatedTitle}" loading="lazy">
                            <div class="content-card-body">
                                <h3>${newRelatedTitle}</h3>
                            </div>
                        </a>
                    </article>`;
                    
                    if(relatedPostsContainer) relatedPostsContainer.innerHTML += card;
                });
            }
            
            appendRandomKeywords();
        };

        populateMainContent(keyword);
        generateRelatedPosts(keyword);
    }
});

let darkmode = localStorage.getItem('darkmode');

const themeSwitch = document.getElementById('themeSwitch');

function enableDarkmode() {
    document.body.classList.add('darkmode');
    localStorage.setItem('darkmode', 'active');
}
function disableDarkmode() {
    document.body.classList.remove('darkmode');
    localStorage.setItem('darkmode', null);
}

if(darkmode === 'active') enableDarkmode()

themeSwitch.addEventListener('click', () => {
    darkmode = localStorage.getItem('darkmode')
    darkmode !== 'active' ? enableDarkmode() : disableDarkmode();            
})




function getBookmarks() {
    return JSON.parse(localStorage.getItem('bookmarks') || '[]')
}
function saveBookmark(bookmarks) {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

function addBookmark() {

    const titleInput = document.getElementById('websiteTitle');
    const urlInput = document.getElementById('websiteURL');
    const tagsInput = document.getElementById('websiteTags');
    const bookmarks = getBookmarks();
    const dateAdded = Date.now();

    console.log(bookmarks);
    

    const tags = tagsInput.value.split(',').map(tag=> tag.trim()).filter(tag=>tag !== '');            

    const title = titleInput.value.trim();
    const url = urlInput.value.trim();        

    if(title === '' || url === '' || tags === '') {
        return;
    }
    
    function isValidURL(url) {
        return /^https?:\/\/([a-z0-9-]+\.)+[a-z]{2,}$/i.test(url);
    }
    let finalURL = url.trim();
    if(!/^https?:\/\//i.test(finalURL)) {
        finalURL = 'https://' + finalURL;
    }

    if (!isValidURL(finalURL)) {
        showToast('Invalide URL! Please check it again!', 'error')
        return;
    }

    const newBookmark = { id: getNextId(), title, url: finalURL, tags, dateAdded}
    
    
    bookmarks.push(newBookmark);

    saveBookmark(bookmarks);

    titleInput.value = '';
    urlInput.value = ''
    tagsInput.value = ''

    showToast('Bookmark successfully added!', 'success');
    renderBookmarks();
    renderTags();
}

function renderBookmarks(bookmarksList = getBookmarks()) {
    // const bookmarks = getBookmarks();
    const list = document.getElementById('bookmarksList');
    
    getAllTags();            

    list.innerHTML = ''

    bookmarksList.forEach((bookmark, index) => {
        const timeAgo = formatTimeAgo(bookmark.dateAdded)

        const card = document.createElement('div');
        card.className = 'card';
        
        const title = document.createElement('p');
        title.className = 'title'
        title.innerHTML = bookmark.title;
        
        const url = document.createElement('p');
        url.className = 'url'
        url.innerHTML = `<a href="${bookmark.url}">${bookmark.url}</a>`

        const tagsList = document.createElement('p');
        const tags = Array.isArray(bookmark.tags) ? bookmark.tags : [];
        tagsList.innerHTML = tags.map(tag => `#${tag}`).join(' ');
        
        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️'

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️'


        const dateAdded = document.createElement('div');
        dateAdded.className = 'added';
        dateAdded.textContent = `Added: ${timeAgo}`;


        let isEditing = false;

        const allBookmarks = getBookmarks();
        const realIndex = allBookmarks.findIndex(b => b.id === bookmark.id);
        

        editBtn.onclick = () => {
            if(!isEditing) {
                const titleInput = document.createElement('input');
                titleInput.type = 'text';
                titleInput.value = bookmark.title

                const urlInput = document.createElement('input');
                urlInput.type = 'text';
                urlInput.value = bookmark.url 

                const tagsInput = document.createElement('input');
                tagsInput.type = 'text';
                tagsInput.value = (Array.isArray(bookmark.tags) ? bookmark.tags : []).join(', ');

                card.replaceChild(titleInput, title);
                card.replaceChild(urlInput, url);
                card.replaceChild(tagsInput, tagsList);
                card.removeChild(deleteBtn)
                editBtn.textContent = '✔️'
                card.classList.add('edit');
                isEditing = true;
            } else {
                const inputs = card.querySelectorAll('input[type=text]');                        

                const titleInput = inputs[0];
                const urlInput = inputs[1];                        
                const tagsInput = inputs[2];                        

                const newTitle = titleInput.value.trim();
                const newUrl = urlInput.value.trim();
                const newTags = tagsInput.value.toLowerCase().trim().split(',').map(tag=>tag.trim());

                if(newTitle === '' || newUrl === '') return;

                showToast('Successfully edited the bookmark!', 'success')


                if (realIndex !== -1) {
                    let finalURL = newUrl;

                    if (!/^https?:\/\//i.test(newUrl)) {
                        finalURL = 'https://'+newUrl
                    }
                    allBookmarks[realIndex] = { title: newTitle, url: finalURL, tags: newTags };
                    updateAndRender(allBookmarks)
                    applyFilters();
                }
            }
        }

        deleteBtn.onclick = () => {

            if(realIndex !== -1) {
                allBookmarks.splice(realIndex, 1);
                showToast('Bookmark removed!', 'error');
                updateAndRender(allBookmarks);
                applyFilters();
            }

            
        }

        card.appendChild(title);
        card.appendChild(url);
        card.appendChild(tagsList);
        card.appendChild(editBtn);
        card.appendChild(deleteBtn);
        card.appendChild(dateAdded);

        list.appendChild(card)

    })

}
function formatTimeAgo(timestamp) {
    const diffMs = Date.now() - timestamp;
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if(seconds < 60) {
        return `${seconds} sec${seconds !== 1 ? 's':''} ago`;
    } else if(minutes < 60) {
        return `${minutes} min${minutes !== 1 ? 's':''} ago`;
    } else  {
        return `${hours} hr${hours !== 1 ? 's' : ''} ago`;
    }
}

function updateAndRender(bookmarks) {
    saveBookmark(bookmarks);
    applyFilters();
    renderTags();
}

function getAllTags() {
    const bookmarks = getBookmarks();

    const allTags = [...new Set(
        bookmarks.flatMap(bookmark => Array.isArray(bookmark.tags) ? bookmark.tags : [] )
    )]

    return allTags;
}
function renderTags() {
    const filterByTagElement = document.getElementById('filterByTag');
    filterByTagElement.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.innerText = 'Select Tag';
    defaultOption.value = '';
    filterByTagElement.appendChild(defaultOption)

    const allTags = getAllTags();
    allTags.forEach(tag => {

        const singleOption = document.createElement('option');
        singleOption.innerText = tag;
        singleOption.value = tag;

        filterByTagElement.appendChild(singleOption)                
    })
}

function debounce(callback, delay = 300) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            callback(...args)
        }, delay);
    }
}

const debouncedFilter = debounce(applyFilters, 300)

function applyFilters() {
    const selectedTag = document.getElementById('filterByTag').value;
    const searchResult = document.getElementById('searchInput').value.toLowerCase().trim();
    const sortedBy = document.getElementById('sortBy').value;
    
    let filtered = getBookmarks();
    
    
    if(selectedTag) {
        filtered = filtered.filter(bookmark =>
            Array.isArray(bookmark.tags) && bookmark.tags.includes(selectedTag)
        );
    }

    
    if(searchResult) {
        filtered = filtered.filter(bookmark => 
            bookmark.title.toLowerCase().includes(searchResult) || bookmark.url.toLowerCase().includes(searchResult)
        )
    }
    
    if(sortedBy === 'az') {
        filtered.sort((a,b) => a.title.localeCompare(b.title))
    } else if (sortedBy === 'za') {
        filtered.sort((a,b) => b.title.localeCompare(a.title))
    } else if (sortedBy === 'recent') {
        filtered.reverse();                           
    }

    renderBookmarks(filtered)
}

function getNextId() {
    const bookmarks = getBookmarks();

    const numericIds = bookmarks.map(bookmark => bookmark.id).filter(id=> typeof id === 'number' && !isNaN(id) )
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    return maxId + 1;
}

function showToast(message, type = 'success'){
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.innerHTML = type === 'success' ? '✅ ' + message : '❌ ' + message;

    const toastContaineiner = document.getElementById('toastContainer');
    toastContaineiner.appendChild(toast)


    setTimeout(()=>{
        toast.remove();
    }, 3000)
}

function checkIfThereIsDate() {
    const bookmarks = getBookmarks();

    try {
        if(bookmarks && bookmarks.length > 0) {
            console.log('data exists');
            return true;
        } else {
            console.log('no data exists');
            return false;
        }
    } catch (error) {
        console.log('Error parsing data or no data');
        return false;
    }
} 

document.getElementById('filterByTag').addEventListener('change', applyFilters);
document.getElementById('searchInput').addEventListener('input', debouncedFilter);
document.getElementById('sortBy').addEventListener('change', applyFilters);

checkIfThereIsDate()
renderTags()
renderBookmarks();
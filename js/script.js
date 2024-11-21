document.addEventListener('DOMContentLoaded', () => {
    // DOM元素
    const categoryList = document.getElementById('category-list');
    const contentDiv = document.getElementById('content');
    const nav = document.querySelector('nav');

    // 初始化所有事件监听器
    initEventListeners();

    // 从localStorage获取搜索历史
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');

    function initEventListeners() {
        // 分类列表点击事件
        if (categoryList) {
            categoryList.addEventListener('click', (event) => {
                const target = event.target.closest('li');
                if (target) {
                    handleItemClick(target);
                }
            });
        } else {
            console.error('Category list not found');
        }
    }

    function handleItemClick(target) {
        document.querySelectorAll('#category-list li').forEach(item => item.classList.remove('active'));
        target.classList.add('active');

        const fileName = target.getAttribute('data-file');
        fetch(`data/${fileName}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => displayContent(data))
            .catch(error => {
                console.error('Error loading data:', error);
                contentDiv.innerHTML = `<h2>无法加载数据，请检查文件路径和格式。</h2>`;
            });
    }

    function displayContent(data) {
        contentDiv.innerHTML = `<h2>${data.category}</h2>`;
        data.subcategories.forEach(subcategory => {
            const subcategoryDiv = document.createElement('div');
            subcategoryDiv.innerHTML = `
                <h3>${subcategory.name}</h3>
                <ul>${subcategory.items.map(item => `<li>${item}</li>`).join('')}</ul>
            `;
            contentDiv.appendChild(subcategoryDiv);
        });
    }
});

// 切换侧边栏显示和隐藏
function toggleSidebar() {
    const sidebar = document.querySelector('nav');
    if (sidebar) {
        sidebar.classList.toggle('expanded');
    } else {
        console.error('Sidebar element not found');
    }
}

function closeTab() {
    // 强制关闭当前标签页
    window.location.href = 'about:blank';
    window.close();
    // 如果上述方法无效,尝试其他方式关闭
    window.open('', '_self').close();
    window.open('', '_parent').close();
    window.open('', '_top').close();
}

// 归档查询
function displaySearchFeature() {
    const contentDiv = document.getElementById('content');
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    
    const historyHtml = searchHistory.length ? `
        <div id="searchHistoryContainer" class="search-history" style="
            margin-top: 20px;
            padding: 15px;
            background: linear-gradient(145deg, #f8f9fa, #ffffff);
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        ">
            <h3 style="
                color: #2d5f8b;
                margin-bottom: 15px;
                font-size: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <span>搜索历史</span>
                <button onclick="clearSearchHistory()" style="
                    background: none;
                    border: none;
                    color: #999;
                    cursor: pointer;
                    font-size: 14px;
                    padding: 5px 10px;
                    border-radius: 5px;
                    transition: all 0.3s ease;
                ">清空历史</button>
            </h3>
            <div style="
                display: flex;
                flex-wrap: wrap;         
            ">
                ${searchHistory.map((term, index) => `
                    <div style="
                        position: relative;
                        display: inline-flex;
                        align-items: center;
                        background: linear-gradient(145deg, #e6f0f9, #ffffff);
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 14px;
                        color: #2d5f8b;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    ">
                        <span onclick="useHistoryTerm('${term}')">${term}</span>
                        <span onclick="removeHistoryTerm(${index})" style="
                            margin-left: 8px;
                            color: #999;
                            font-size: 12px;
                            padding: 2px 6px;
                            border-radius: 50%;
                            transition: all 0.3s ease;
                        ">×</span>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    contentDiv.innerHTML = `
        <div style="padding: 20px;">
            <h2>归类查询</h2>
            <div style="
                margin: 20px 0;
                display: flex;
                align-items: center;
            ">
                <input type="text" id="searchInput" placeholder="请输入关键词" style="
                    padding: 10px 15px;
                    width: 300px;
                    border: 2px solid #2d5f8b;
                    border-radius: 25px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    outline: none;
                ">
                <button onclick="performSearch()" style="
                    padding: 10px 20px;
                    background: linear-gradient(145deg, #2d5f8b, #3774aa);
                    border: none;
                    border-radius: 25px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    margin-left: 15px;
                ">搜索</button>
            </div>
            ${historyHtml}
            <div id="searchResults"></div>
        </div>
    `;
    resetSidebar();

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
}

function useHistoryTerm(term) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = term;
    performSearch();
}

function removeHistoryTerm(index) {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    searchHistory.splice(index, 1);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    displaySearchFeature(); // 刷新显示
}

function clearSearchHistory() {
    localStorage.removeItem('searchHistory');
    displaySearchFeature(); // 刷新显示
}

function resetSidebar() {
    const sidebar = document.querySelector('nav');
    if (sidebar) {
        sidebar.classList.remove('expanded');
        document.querySelectorAll('nav li').forEach(item => item.classList.remove('active'));
    } else {
        console.error('Sidebar element not found');
    }
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchHistoryContainer = document.getElementById('searchHistoryContainer');
    const keyword = searchInput.value.trim().toLowerCase();

    if (!keyword) {
        searchResults.innerHTML = '<p>请输入搜索关键词</p>';
        return;
    }

    // 隐藏搜索历史
    if (searchHistoryContainer) {
        searchHistoryContainer.style.display = 'none';
    }

    // 保存搜索历史
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    if (!searchHistory.includes(keyword)) {
        searchHistory.unshift(keyword);
        if (searchHistory.length > 10) { // 限制历史记录数量
            searchHistory.pop();
        }
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }

    const promises = [];
    for (let i = 1; i <= 9; i++) {
        const fileName = `data/category${i}.json`;
        promises.push(fetch(fileName).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }));
    }

    Promise.all(promises)
        .then(dataArray => {
            const titleResults = [];
            const itemResults = [];
            dataArray.forEach((data, index) => {
                searchObject(data, `category${index + 1}`, titleResults, itemResults, keyword);
            });

            return Promise.all([
                generateResultsHtml(titleResults, '标题', keyword),
                generateResultsHtml(itemResults, '子项目', keyword)
            ]);
        })
        .then(([titleResultsHtml, itemResultsHtml]) => {
            searchResults.innerHTML = `
                <div class="tabs" style="display: flex; margin-bottom: 20px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
                    <button class="tab-button" onclick="showTab('allTabs')" style="
                        padding: 10px 20px;
                        border: none;
                        background: linear-gradient(145deg, #2d5f8b, #3774aa);
                        color: #fff;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    ">显示全部</button>
                    <button class="tab-button" onclick="showTab('titleTab')" style="
                        padding: 10px 20px;
                        border: none;
                        background: linear-gradient(145deg, #2d5f8b, #3774aa);
                        color: #fff;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    ">标题</button>
                    <button class="tab-button" onclick="showTab('itemTab')" style="
                        padding: 10px 20px;
                        border: none;
                        background: linear-gradient(145deg, #2d5f8b, #3774aa);
                        color: #fff;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.3s ease;
                    ">子项目</button>
                </div>
                <div id="titleTab" class="tab-content" style="
                    display: none;
                    padding: 20px;
                    transition: all 0.3s ease;
                ">${titleResultsHtml}</div>
                <div id="itemTab" class="tab-content" style="
                    display: none;
                    padding: 20px;
                    transition: all 0.3s ease;
                ">${itemResultsHtml}</div>
                <div id="allTabs" class="tab-content" style="
                    display: block;
                    padding: 20px;
                    transition: all 0.3s ease;
                ">${titleResultsHtml}${itemResultsHtml}</div>
            `;

            // 添加按钮悬停效果
            const buttons = document.querySelectorAll('.tab-button');
            buttons.forEach(button => {
                button.addEventListener('mouseover', () => {
                    button.style.transform = 'translateY(-2px)';
                    button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                });
                button.addEventListener('mouseout', () => {
                    button.style.transform = 'translateY(0)';
                    button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                });
            });
        })
        .catch(error => {
            console.error('搜索出错:', error);
            searchResults.innerHTML = '<p>搜索过程中发生错误</p>';
        });
}

function searchObject(obj, basePath, titleResults, itemResults, keyword) {
    for (let key in obj) {
        const value = obj[key];
        const currentPath = basePath ? `${basePath}.${key}` : key;

        if (typeof value === 'object' && value !== null) {
            searchObject(value, currentPath, titleResults, itemResults, keyword);
        } else {
            const stringValue = String(value).toLowerCase();
            if (stringValue.includes(keyword)) {
                if (currentPath.includes('name')) {
                    titleResults.push({
                        path: currentPath,
                        value: value
                    });
                } else if (currentPath.includes('items')) {
                    itemResults.push({
                        path: currentPath,
                        value: value
                    });
                }
            }
        }
    }
}

function generateResultsHtml(results, type, keyword) {
    if (results.length > 0) {
        const rows = results.map(async (result) => {
            const adjustedPath = await adjustPath(result.path);
            return `
                <tr style="border-bottom: 1px solid #e0e0e0; transition: background-color 0.3s ease;">
                    <td style="padding: 12px; word-wrap: break-word;">${adjustedPath}</td>
                    <td style="padding: 12px; word-wrap: break-word;">${highlightKeyword(result.value, keyword)}</td>
                </tr>
            `;
        });

        return Promise.all(rows).then(rowsHtml => `
            <table border="1" style="
                width: 80%;
                border-collapse: collapse;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                table-layout: auto;
            ">
                <thead>
                    <tr style="background: linear-gradient(145deg, #2d5f8b, #3774aa); color: white;">
                        <th style="padding: 12px; text-align: left; width: 60%;">路径</th>
                        <th style="padding: 12px; text-align: left; width: 40%;">${type}</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml.join('')}
                </tbody>
            </table>
        `);
    } else {
        return Promise.resolve(`<p style="text-align: center; color: #666; padding: 20px;">未找到匹配的${type}</p>`);
    }
}

function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');
    
    tabs.forEach(tab => {
        tab.style.display = 'none';
        tab.style.opacity = '0';
    });
    
    buttons.forEach(button => {
        button.style.opacity = '0.7';
        button.style.transform = 'translateY(0)';
    });
    
    const activeTab = document.getElementById(tabId);
    const activeButton = document.querySelector(`[onclick="showTab('${tabId}')"]`);
    
    activeTab.style.display = 'block';
    setTimeout(() => {
        activeTab.style.opacity = '1';
    }, 50);
    
    activeButton.style.opacity = '1';
    activeButton.style.transform = 'translateY(-2px)';
}

function highlightKeyword(value, keyword) {
    const regex = new RegExp(`(${keyword})`, 'gi');
    return String(value).replace(regex, '<span style="background-color: #fff3cd; padding: 2px 4px; border-radius: 3px; color: #856404;">$1</span>');
}

function adjustPath(path) {
    // 获取当前选中的分类数据
    const segments = path.split('.');
    const categoryIndex = parseInt(segments[0].replace('category', ''));
    const subcategoryIndex = parseInt(segments[2]);
    const itemIndex = parseInt(segments[4]);

    // 从服务器获取对应的分类数据
    return fetch(`data/category${categoryIndex}.json`)
        .then(response => response.json())
        .then(data => {
            const categoryName = data.category;
            const subcategoryName = data.subcategories[subcategoryIndex].name;
            let prefix = '';
            
            // 添加数字前缀
            if (categoryIndex >= 1 && categoryIndex <= 9) {
                prefix = `${categoryIndex}. `;
            }

            if (segments[3] === 'items') {
                const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
                const index = subcategoryIndex + 1;
                const chineseNumber = index <= 10 ? chineseNumbers[index - 1] : index;
                return `${prefix}<span style="background-color: #d1e7dd; padding: 2px 4px; border-radius: 3px; color: #0f5132;">${categoryName}</span> <span style="color: #000; font-weight: bold;">/</span> <span style="background-color: #cfe2f3; padding: 2px 4px; border-radius: 3px; color: #084298;">标题${chineseNumber}</span> <span style="color: #000; font-weight: bold;">：</span> <span style="background-color: #f8d7da; padding: 2px 4px; border-radius: 3px; color: #842029;">${data.subcategories[subcategoryIndex].items[itemIndex]}</span>`;
            } else if (segments[3] === 'name') {
                const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
                const index = subcategoryIndex + 1;
                const chineseNumber = index <= 10 ? chineseNumbers[index - 1] : index;
                return `${prefix}<span style="background-color: #d1e7dd; padding: 2px 4px; border-radius: 3px; color: #0f5132;">${categoryName}</span> <span style="color: #000; font-weight: bold;">/</span> <span style="background-color: #cfe2f3; padding: 2px 4px; border-radius: 3px; color: #084298;">标题${chineseNumber}</span> <span style="color: #000; font-weight: bold;">：</span> <span style="background-color: #f8d7da; padding: 2px 4px; border-radius: 3px; color: #842029;">${subcategoryName}</span>`;
            }

            return path;
        })
        .catch(error => {
            console.error('Error loading category data:', error);
            return path;
        });
}

// 本地文件查询
let selectedFiles = [];

function displayLocalFileSearch() {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = `
        <div style="padding: 20px;">
            <h2>本地文件查询</h2>
            <div style="
                margin: 20px 0;
                display: flex;
                align-items: center;
            ">
                <input type="text" id="localFileSearchInput" placeholder="请输入文件名" style="
                    padding: 10px 15px;
                    width: 300px;
                    border: 2px solid #2d5f8b;
                    border-radius: 25px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    outline: none;
                ">
                <button onclick="performLocalFileSearch()" style="
                    padding: 10px 20px;
                    background: linear-gradient(145deg, #2d5f8b, #3774aa);
                    border: none;
                    border-radius: 25px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    margin-left: 10px;
                ">本地搜索</button>
                <button onclick="resetFolderSelection()" style="
                    padding: 10px 20px;
                    background: linear-gradient(145deg, #d9534f, #c9302c);
                    border: none;
                    border-radius: 25px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    margin-left: 10px;
                ">重置文件夹</button>
                <button onclick="performVideoSearch()" style="
                    padding: 10px 20px;
                    background: linear-gradient(145deg, #5bc0de, #31b0d5);
                    border: none;
                    border-radius: 25px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    margin-left: 10px;
                ">视频搜索</button>
                <button onclick="performImageSearch()" style="
                    padding: 10px 20px;
                    background: linear-gradient(145deg, #5cb85c, #4cae4c);
                    border: none;
                    border-radius: 25px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    margin-left: 10px;
                ">图片搜索</button>
            </div>
            <div id="localFileSearchResults"></div>
        </div>
    `;

    const localFileSearchInput = document.getElementById('localFileSearchInput');
    localFileSearchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            performLocalFileSearch();
        }
    });

    if (selectedFiles.length === 0) {
        selectFolder();
    }
}

function selectFolder() {
    const folderInput = document.createElement('input');
    folderInput.type = 'file';
    folderInput.webkitdirectory = true; // 允许选择文件夹
    folderInput.style.display = 'none';
    document.body.appendChild(folderInput);

    folderInput.addEventListener('change', (event) => {
        selectedFiles = Array.from(event.target.files);
    });

    // 触发文件夹选择
    folderInput.click();
}

function resetFolderSelection() {
    selectedFiles = [];
    displayLocalFileSearch();
}

function performLocalFileSearch() {
    const searchInput = document.getElementById('localFileSearchInput');
    const searchResults = document.getElementById('localFileSearchResults');
    const keyword = searchInput.value.trim().toLowerCase();

    if (!keyword) {
        searchResults.innerHTML = '<p>请输入文件名</p>';
        return;
    }

    const matchedFiles = selectedFiles
        .map(file => file.webkitRelativePath)
        .filter(fileName => fileName.toLowerCase().includes(keyword));

    if (matchedFiles.length > 0) {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        const videoExtensions = ['mp4', 'webm', 'ogg'];
        const imageFiles = matchedFiles.filter(file => imageExtensions.some(ext => file.toLowerCase().endsWith(ext)));
        const videoFiles = matchedFiles.filter(file => videoExtensions.some(ext => file.toLowerCase().endsWith(ext)));
        const otherFiles = matchedFiles.filter(file => !imageExtensions.some(ext => file.toLowerCase().endsWith(ext)) && !videoExtensions.some(ext => file.toLowerCase().endsWith(ext)));

        let imageGallery = '';
        if (imageFiles.length > 0) {
            imageGallery = `
                <div class="images" style="column-count: 6; column-gap: 10px; margin-top: 20px;">
                    ${imageFiles.map(file => {
                        const fileObj = selectedFiles.find(f => f.webkitRelativePath === file);
                        const fileURL = URL.createObjectURL(fileObj);
                        return `
                            <div style="break-inside: avoid; margin-bottom: 10px;">
                                <img src="${fileURL}" style="width: 100%; height: auto; border-radius: 5px;">
                                <a href="${fileURL}" download="${fileObj.name}" style="display: block; color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px; text-align: center; margin-top: 5px;">下载</a>
                                <h4 style="color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px; text-align: center; margin-top: 5px;">${fileObj.name}</h4>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        let videoGallery = '';
        if (videoFiles.length > 0) {
            videoGallery = `
                <div style="display: flex; flex-wrap: wrap; row-gap: 40px;column-gap: 10px; margin-top: 20px;">
                    ${videoFiles.map(file => {
                        const fileObj = selectedFiles.find(f => f.webkitRelativePath === file);
                        const fileURL = URL.createObjectURL(fileObj);
                        return `
                            <div style="position: relative; margin-bottom: 30px; width: calc(16.66% - 10px);">
                                <video src="${fileURL}" preload="metadata" style="width: 100%; height: auto; border-radius: 5px; cursor: pointer;" controls></video>
                                <a href="${fileURL}" download="${fileObj.name}" style="position: absolute; top: 5px; right: 5px; color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px;">下载</a>
                                <h4 style="position: absolute; bottom: -70px; left: 0px; color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px;">${fileObj.name}</h4>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        let otherFilesList = '';
        if (otherFiles.length > 0) {
            otherFilesList = `
                <ul style="margin-top: 20px;">
                    ${otherFiles.map(file => `<li>${file}</li>`).join('')}
                </ul>
            `;
        }

        searchResults.innerHTML = imageGallery + videoGallery + otherFilesList;

        // 初始化 Viewer.js
        if (imageFiles.length > 0) {
            const gallery = document.querySelector('.images');
            const viewer = new Viewer(gallery, {
                navbar: true,
                toolbar: true
            });
        }
    } else {
        searchResults.innerHTML = '<p>未找到匹配的文件</p>';
    }
}

function performVideoSearch() {
    const searchResults = document.getElementById('localFileSearchResults');
    const videoExtensions = ['mp4', 'webm', 'ogg'];

    const matchedFiles = selectedFiles
        .map(file => file.webkitRelativePath)
        .filter(fileName => videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext)));

    if (matchedFiles.length > 0) {
        let videoGallery = `
            <div style="display: flex; flex-wrap: wrap; row-gap: 40px;column-gap: 10px; margin-top: 20px;">
                ${matchedFiles.map(file => {
                    const fileObj = selectedFiles.find(f => f.webkitRelativePath === file);
                    const fileURL = URL.createObjectURL(fileObj);
                    return `
                        <div style="position: relative; margin-bottom: 30px; width: calc(16.66% - 10px);">
                            <video src="${fileURL}" preload="metadata" style="width: 100%; height: auto; border-radius: 5px; cursor: pointer;" controls></video>
                            <a href="${fileURL}" download="${fileObj.name}" style="position: absolute; top: 5px; right: 5px; color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px;">下载</a>
                            <h4 style="position: absolute; bottom: -70px; left: 0px; color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px;">${fileObj.name}</h4>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        searchResults.innerHTML = videoGallery;
    } else {
        searchResults.innerHTML = '<p>未找到匹配的视频文件</p>';
    }
}

function performImageSearch() {
    const searchResults = document.getElementById('localFileSearchResults');
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    const matchedFiles = selectedFiles
        .map(file => file.webkitRelativePath)
        .filter(fileName => imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext)));

    if (matchedFiles.length > 0) {
        let imageGallery = `
            <div class="images" style="column-count: 6; column-gap: 10px; margin-top: 20px;">
                ${matchedFiles.map(file => {
                    const fileObj = selectedFiles.find(f => f.webkitRelativePath === file);
                    const fileURL = URL.createObjectURL(fileObj);
                    return `
                        <div style="break-inside: avoid; margin-bottom: 10px;">
                            <img src="${fileURL}" style="width: 100%; height: auto; border-radius: 5px;">
                            <a href="${fileURL}" download="${fileObj.name}" style="display: block; color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px; text-align: center; margin-top: 5px;">下载</a>
                            <h4 style="color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px; text-align: center; margin-top: 5px;">${fileObj.name}</h4>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        searchResults.innerHTML = imageGallery;

        // 初始化 Viewer.js
        const gallery = document.querySelector('.images');
        const viewer = new Viewer(gallery, {
            navbar: true,
            toolbar: true
        });
    } else {
        searchResults.innerHTML = '<p>未找到匹配的图片文件</p>';
    }
}
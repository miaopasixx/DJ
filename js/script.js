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
let currentPage = 1;
let itemsPerPage = 12; // 默认展示12个
let currentSearchType = 'local'; // 新增变量来记录当前的搜索类型
let currentKeyword = ''; // 新增变量来记录当前的搜索关键词

function displayLocalFileSearch() {
    const contentDiv = document.getElementById('content');
    const buttonStyle = `
        padding: 10px 20px;
        border: none;
        border-radius: 25px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        margin: 5px;
    `;
    const searchButtons = [
        { text: '本地搜索', action: 'showLocalSearchPopup', color: '#2d5f8b', gradient: '#3774aa' },
        { text: '重置文件夹', action: 'resetFolderSelection', color: '#d9534f', gradient: '#c9302c' },
        { text: '搜索视频', action: 'performVideoSearch', color: '#5bc0de', gradient: '#31b0d5' },
        { text: '搜索图片', action: 'performImageSearch', color: '#5cb85c', gradient: '#4cae4c' },
        { text: '搜索文档', action: 'performDocSearch', color: '#f0ad4e', gradient: '#ec971f' },
        { text: '搜索表格', action: 'performSheetSearch', color: '#d9534f', gradient: '#c9302c' },
        { text: '搜索演示文稿', action: 'performPptSearch', color: '#5bc0de', gradient: '#31b0d5' },
        { text: '搜索压缩文件', action: 'performArchiveSearch', color: '#6f42c1', gradient: '#563d7c' },
        { text: '搜索快捷方式', action: 'performLnkSearch', color: '#5cb85c', gradient: '#4cae4c' },
        { text: '搜索音频文件', action: 'performAudioSearch', color: '#5bc0de', gradient: '#31b0d5' },
        { text: '搜索其他类型文件', action: 'performOtherFileSearch', color: '#f0ad4e', gradient: '#ec971f' }
    ];

    contentDiv.innerHTML = `
        <div style="padding: 20px;">
            <h2>本地文件查询</h2>
            <div style="margin: 20px 0; display: flex; align-items: center; flex-wrap: wrap;">
                <div style="display: flex; flex-wrap: wrap; justify-content: center;">
                    ${searchButtons.map(button => `
                        <button onclick="${button.action}()" style="${buttonStyle} background: linear-gradient(145deg, ${button.color}, ${button.gradient});">${button.text}</button>
                    `).join('')}
                </div>
            </div>
            <div id="localFileSearchResults"></div>
            <div id="paginationControls" style="margin-top: 20px; text-align: center;"></div>
        </div>
    `;

    if (selectedFiles.length === 0) {
        selectFolder();
    }
}

function showLocalSearchPopup() {
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'white';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    popup.style.zIndex = '1001';

    popup.innerHTML = `
        <h3>本地搜索</h3>
        <textarea id="localFileSearchInputPopup" placeholder="请输入检索条件" style="
            padding: 10px;
            width: 570px;
            height: 100px;
            border: 2px solid #2d5f8b;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
            outline: none;
            margin-bottom: 15px;
            resize: both; /* 支持右下角拖拽放大缩小 */
            overflow: auto;
            white-space: pre-wrap; /* 允许文本换行 */
        "></textarea>
        <div style="text-align: right;">
            <button onclick="performLocalFileSearchFromPopup()" style="padding: 12px 20px; border: none; border-radius: 25px; background-color: #2d5f8b; color: white; cursor: pointer; transition: all 0.3s ease;">确认</button>
            <button onclick="closeLocalSearchPopup()" style="padding: 12px 20px; border: none; border-radius: 25px; background-color: #d9534f; color: white; cursor: pointer; transition: all 0.3s ease;">取消</button>
        </div>
    `;

    document.body.appendChild(popup);

    // 聚焦到文本区域
    const searchInput = document.getElementById('localFileSearchInputPopup');
    if (searchInput) {
        searchInput.focus();
        searchInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.ctrlKey) {
                event.preventDefault();
                performLocalFileSearchFromPopup();
            } else if (event.key === 'Enter' && event.ctrlKey) {
                event.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                this.value = this.value.substring(0, start) + '\n' + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 1;
            }
        });
    }
}

function closeLocalSearchPopup() {
    const popup = document.querySelector('div[style*="z-index: 1001"]');
    if (popup) {
        document.body.removeChild(popup);
    }
}

function performLocalFileSearchFromPopup() {
    currentSearchType = 'local'; // 设置当前搜索类型
    const searchInput = document.getElementById('localFileSearchInputPopup');
    const searchResults = document.getElementById('localFileSearchResults');
    const keyword = searchInput.value.trim().toLowerCase();
    currentKeyword = keyword; // 记录当前的搜索关键词

    closeLocalSearchPopup();

    if (!keyword) {
        searchResults.innerHTML = '<p>请输入文件名</p>';
        return;
    }

    // 修改匹配逻辑：使用正则表达式来匹配文件名
    const matchedFiles = selectedFiles
        .map(file => file.webkitRelativePath)
        .filter(fileName => {
            // 如果关键词是文件扩展名（如pdf、jpg等），则精确匹配扩展名
            if (keyword.startsWith('.') || /^[a-z0-9]+$/.test(keyword)) {
                const extension = fileName.split('.').pop().toLowerCase();
                return extension === keyword.replace('.', '');
            }
            // 否则在文件名中搜索关键词（不包括扩展名）
            const nameWithoutExtension = fileName.split('/').pop().split('.')[0].toLowerCase();
            return nameWithoutExtension.includes(keyword);
        });

    if (matchedFiles.length > 0) {
        displayFilesWithPagination(matchedFiles);
    } else {
        searchResults.innerHTML = '<p>未找到匹配的文件</p>';
    }
}

function selectFolder() {
    const folderInput = document.createElement('input');
    folderInput.type = 'file';
    folderInput.webkitdirectory = true; // 允许选择文件夹
    folderInput.style.display = 'none';
    document.body.appendChild(folderInput);

    folderInput.addEventListener('change', (event) => {
        selectedFiles = Array.from(event.target.files).filter(file => !file.name.startsWith('~$') && !file.name.toLowerCase().endsWith('.ini'));
    });

    // 触发文件夹选择
    folderInput.click();
}

function resetFolderSelection() {
    selectedFiles = [];
    displayLocalFileSearch();
}

function performLocalFileSearch() {
    currentSearchType = 'local'; // 设置当前搜索类型
    const searchInput = document.getElementById('localFileSearchInput');
    const searchResults = document.getElementById('localFileSearchResults');
    const keyword = currentKeyword || (searchInput ? searchInput.value.trim().toLowerCase() : ''); // 使用记录的关键词

    if (!keyword) {
        searchResults.innerHTML = '<p>请输入文件名</p>';
        return;
    }

    // 修改匹配逻辑：使用正则表达式来匹配文件名
    const matchedFiles = selectedFiles
        .map(file => file.webkitRelativePath)
        .filter(fileName => {
            // 如果关键词是文件扩展名（如pdf、jpg等），则精确匹配扩展名
            if (keyword.startsWith('.') || /^[a-z0-9]+$/.test(keyword)) {
                const extension = fileName.split('.').pop().toLowerCase();
                return extension === keyword.replace('.', '');
            }
            // 否则在文件名中搜索关键词（不包括扩展名）
            const nameWithoutExtension = fileName.split('/').pop().split('.')[0].toLowerCase();
            return nameWithoutExtension.includes(keyword);
        });

    if (matchedFiles.length > 0) {
        displayFilesWithPagination(matchedFiles);
    } else {
        searchResults.innerHTML = '<p>未找到匹配的文件</p>';
    }
}

function displayFilesWithPagination(files) {
    const totalPages = Math.ceil(files.length / itemsPerPage);
    const paginatedFiles = files.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
    const videoExtensions = ['mp4', 'webm', 'ogg'];
    const docExtensions = ['docx', 'doc', 'pdf','dotx','txt','wps'];
    const sheetExtensions = ['xlsx', 'xls'];
    const pptExtensions = ['ppt', 'pptx'];
    const lnkExtensions = ['lnk'];
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz']; 
    const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'aac']; // 新增音频文件扩展名
    const imageFiles = paginatedFiles.filter(file => imageExtensions.some(ext => file.toLowerCase().endsWith(ext)));
    const videoFiles = paginatedFiles.filter(file => videoExtensions.some(ext => file.toLowerCase().endsWith(ext)));
    const docFiles = paginatedFiles.filter(file => docExtensions.some(ext => file.toLowerCase().endsWith(ext)));
    const sheetFiles = paginatedFiles.filter(file => sheetExtensions.some(ext => file.toLowerCase().endsWith(ext)));
    const pptFiles = paginatedFiles.filter(file => pptExtensions.some(ext => file.toLowerCase().endsWith(ext)));
    const lnkFiles = paginatedFiles.filter(file => lnkExtensions.some(ext => file.toLowerCase().endsWith(ext)));
    const archiveFiles = paginatedFiles.filter(file => archiveExtensions.some(ext => file.toLowerCase().endsWith(ext))); // 新增压缩包文件过滤
    const audioFiles = paginatedFiles.filter(file => audioExtensions.some(ext => file.toLowerCase().endsWith(ext))); // 新增音频文件过滤
    const otherFiles = paginatedFiles.filter(file => !imageExtensions.some(ext => file.toLowerCase().endsWith(ext)) && !videoExtensions.some(ext => file.toLowerCase().endsWith(ext)) && !docExtensions.some(ext => file.toLowerCase().endsWith(ext)) && !sheetExtensions.some(ext => file.toLowerCase().endsWith(ext)) && !pptExtensions.some(ext => file.toLowerCase().endsWith(ext)) && !lnkExtensions.some(ext => file.toLowerCase().endsWith(ext)) && !archiveExtensions.some(ext => file.toLowerCase().endsWith(ext)) && !audioExtensions.some(ext => file.toLowerCase().endsWith(ext)) && !file.toLowerCase().endsWith('.ini')); // 修改其他文件过滤逻辑

    // 文档画廊
    let docGallery = '';
    if (docFiles.length > 0) {
        docGallery = `
            <div style="display: flex; flex-wrap: wrap; column-gap: 10px; margin-top: 20px;">
                ${docFiles.map(file => {
                    const fileObj = selectedFiles.find(f => f.webkitRelativePath === file);
                    const fileURL = URL.createObjectURL(fileObj);
                    return `
                        <div style="position: relative; margin-bottom: 30px; width: calc(16.66% - 10px);">
                            <iframe src="${fileURL}" style="width: 100%; height: 350px; border: none; margin-top: 5px;"></iframe>
                            <a href="${fileURL}" onclick="enlargePreview('${fileURL}'); return false;" download="${fileObj.name}" style="display: block; color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px; text-align: center; margin-top: 5px; text-decoration: none; width: 100%;">${fileObj.name}</a>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // 表格画廊
    let sheetGallery = '';
    if (sheetFiles.length > 0) {
        sheetGallery = `
            <div style="display: flex; flex-wrap: wrap; row-gap: 40px; column-gap: 10px; margin-top: 20px;">
                ${sheetFiles.map(file => {
                    const fileObj = selectedFiles.find(f => f.webkitRelativePath === file);
                    const fileURL = URL.createObjectURL(fileObj);
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        const html = XLSX.utils.sheet_to_html(worksheet);
                        document.getElementById(`sheet-${fileObj.name}`).innerHTML = html;
                    };
                    reader.readAsArrayBuffer(fileObj);
                    return `
                        <div style="position: relative; margin-bottom: 30px; width: calc(16.66% - 10px);">
                            <div id="sheet-${fileObj.name}" style="width: 100%; height: 297px; border: none; margin-top: 5px; overflow: hidden;"></div>
                            <button onclick="enlargePreview('${fileURL}')" style="display: block; color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px; text-align: center; margin-top: 5px; text-decoration: none; width: 100%;">放大预览</button>
                            <a href="${fileURL}" download="${fileObj.name}" style="display: block; color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px; text-align: center; margin-top: 5px; text-decoration: none; width: 100%;">${fileObj.name}</a>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // 演示文稿画廊
    let pptGallery = '';
    if (pptFiles.length > 0) {
        pptGallery = `
            <div style="display: flex; flex-wrap: wrap; column-gap: 10px; margin-top: 20px;">
                ${pptFiles.map(file => {
                    const fileObj = selectedFiles.find(f => f.webkitRelativePath === file);
                    const fileURL = URL.createObjectURL(fileObj);
                    return `
                        <div style="position: relative; margin-bottom: 30px; width: calc(16.66% - 10px);">
                            <iframe src="${fileURL}" style="width: 100%; height: 297px; border: none; margin-top: 5px;"></iframe>
                            <a href="${fileURL}" onclick="enlargePreview('${fileURL}'); return false;" download="${fileObj.name}" style="display: block; color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px; text-align: center; margin-top: 5px; text-decoration: none; width: 100%;">${fileObj.name}</a>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // 视频画廊
    let videoGallery = '';
    if (videoFiles.length > 0) {
        videoGallery = `
            <div style="display: flex; flex-wrap: wrap; row-gap: 40px;column-gap: 10px; margin-top: 20px;">
                ${videoFiles.map(file => {
                    const fileObj = selectedFiles.find(f => f.webkitRelativePath === file);
                    const fileURL = URL.createObjectURL(fileObj);

                    const folderPath = file.substring(0, file.lastIndexOf('/'));
                    const photoFolderPath = `${folderPath}/照片丨`;
                    const firstImageFile = selectedFiles.find(f => {
                        const filePath = f.webkitRelativePath;
                        return filePath.startsWith(photoFolderPath) && imageExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
                    });
                    const posterURL = firstImageFile ? URL.createObjectURL(firstImageFile) : '';

                    return `
                        <div style="position: relative; margin-bottom: 30px; width: calc(16.66% - 10px);">
                            <video src="${fileURL}" poster="${posterURL}" preload="none" style="width: 100%; height: auto; border-radius: 5px; cursor: pointer;" controls></video>
                            <a href="${fileURL}" download="${fileObj.name}" style="position: absolute; top: 5px; right: 5px; color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px;">下载</a>
                            <h4 style="position: absolute; bottom: -70px; left: 0px; color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px; text-decoration: none;">${fileObj.name}</h4>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // 图片画廊
    let imageGallery = '';
    if (imageFiles.length > 0) {
        imageGallery = `
            <div class="images" style="column-count: 6; column-gap: 10px; margin-top: 20px;">
                ${imageFiles.map(file => {
                    const fileObj = selectedFiles.find(f => f.webkitRelativePath === file);
                    const fileURL = URL.createObjectURL(fileObj);
                    return `
                        <div style="break-inside: avoid; margin-bottom: 10px;">
                            <img src="${fileURL}" loading="lazy" style="width: 100%; height: auto; border-radius: 5px;">
                            <a href="${fileURL}" download="${fileObj.name}" style="display: none;"></a>
                            <h4 onclick="downloadFile('${fileURL}', '${fileObj.name}')" style="color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px; text-align: center; margin-top: 5px; cursor: pointer; text-decoration: none;">${fileObj.name}</h4>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // 快捷方式画廊
    let lnkGallery = '';
    if (lnkFiles.length > 0) {
        lnkGallery = `
            <div style="display: flex; flex-wrap: wrap; row-gap: 40px; column-gap: 10px; margin-top: 20px;">
                ${lnkFiles.map(file => {
                    const fileObj = selectedFiles.find(f => f.webkitRelativePath === file);
                    const filePath = fileObj.webkitRelativePath;
                    return `
                        <div style="position: relative; margin-bottom: 30px; width: calc(16.66% - 10px); text-align: center;">
                            <img src="img/folder-icon.svg" style="width: 80%; height: auto; border-radius: 5px; display: block; margin: 0 auto;">
                            <h4 style="color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px; text-align: center; margin-top: 5px; cursor: pointer; text-decoration: none;" onclick="copyToClipboard('${filePath}')">${fileObj.name}</h4>
                            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0, 0, 0, 0.7); color: white; padding: 5px; border-radius: 3px; text-align: center; display: none;" class="file-path">${filePath}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // 压缩包画廊
    let archiveGallery = '';
    if (archiveFiles.length > 0) {
        archiveGallery = `
            <div style="display: flex; flex-wrap: wrap; row-gap: 40px; column-gap: 10px; margin-top: 20px;">
                ${archiveFiles.map(file => {
                    const fileObj = selectedFiles.find(f => f.webkitRelativePath === file);
                    const fileURL = URL.createObjectURL(fileObj);
                    return `
                        <div style="position: relative; margin-bottom: 30px; width: calc(16.66% - 10px); text-align: center;">
                            <img src="img/archive-icon.svg" style="width: 80%; height: auto; border-radius: 5px; display: block; margin: 0 auto;">
                            <a href="${fileURL}" download="${fileObj.name}" style="display: block; color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px; text-align: center; margin-top: 5px; text-decoration: none; width: 100%;">${fileObj.name}</a>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // 音频文件画廊
    let audioGallery = '';
    if (audioFiles.length > 0) {
        audioGallery = `
            <div style="display: flex; flex-wrap: wrap; row-gap: 40px; column-gap: 10px; margin-top: 20px;">
                ${audioFiles.map(file => {
                    const fileObj = selectedFiles.find(f => f.webkitRelativePath === file);
                    const fileURL = URL.createObjectURL(fileObj);
                    return `
                        <div style="position: relative; margin-bottom: 30px; width: calc(16.66% - 10px); text-align: center;">
                            <audio controls style="width: 100%; margin-top: 5px;">
                                <source src="${fileURL}" type="audio/${fileObj.name.split('.').pop().toLowerCase()}">
                                您的浏览器不支持音频元素。
                            </audio>
                            <a href="${fileURL}" download="${fileObj.name}" style="display: block; color: white; background: rgba(0, 0, 0, 0.5); padding: 2px 5px; border-radius: 3px; text-align: center; margin-top: 5px; text-decoration: none; width: 100%;">${fileObj.name}</a>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // 其他文件画廊
    let otherFilesList = '';
    if (otherFiles.length > 0) {
        otherFilesList = `
            <div style="display: flex; flex-wrap: wrap; row-gap: 40px; column-gap: 10px; margin-top: 20px;">
                ${otherFiles.map(file => {
                    const fileObj = selectedFiles.find(f => f.webkitRelativePath === file);
                    const fileURL = URL.createObjectURL(fileObj);
                    if (fileObj.name.split('.').pop().toLowerCase() === 'ico') {
                        return `
                            <div style="position: relative; margin-bottom: 30px; width: calc(16.66% - 10px); text-align: center; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
                                <img src="img/icon.svg" style="width: 80%; height: auto; display: block; margin: 0 auto; border-bottom: 1px solid #ddd; border-radius: 5px;">
                                <a href="${fileURL}" download="${fileObj.name}" style="display: block; color: white; background: rgba(0, 0, 0, 0.7); padding: 10px; text-align: center; text-decoration: none; width: 100%; font-size: 14px; font-weight: bold;">${fileObj.name}</a>
                            </div>
                        `;
                    } else {
                        return `<li>${file}</li>`;
                    }
                }).join('')}
            </div>
        `;
    }

    const searchResults = document.getElementById('localFileSearchResults');
    searchResults.innerHTML = docGallery + sheetGallery + pptGallery + videoGallery + imageGallery + lnkGallery + archiveGallery + audioGallery + otherFilesList; // 添加audioGallery

    if (imageFiles.length > 0) {
        const gallery = document.querySelector('.images');
        const viewer = new Viewer(gallery, {
            navbar: true,
            toolbar: true
        });
    }

    displayPaginationControls(totalPages, files.length);
}

// 分页控制
function displayPaginationControls(totalPages, totalItems) {
    const paginationControls = document.getElementById('paginationControls');
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    let paginationHTML = `
        <div style="margin: 50px;">
            【共${totalItems}条记录 当前第${currentPage}/${totalPages}页 每页${itemsPerPage}条】
            【<a href="javascript:void(0);" style="cursor: ${totalPages === 1 ? 'default' : 'pointer'}; margin: 0 5px; ${currentPage === 1 ? 'color: gray; text-decoration: none;' : 'text-decoration: none;'}" ${currentPage === 1 ? 'onclick="return false;"' : 'onclick="goToPage(1)"'}>首页</a> | 
            <a href="javascript:void(0);" onclick="goToPage(${currentPage - 1})" style="cursor: pointer; margin: 0 5px; ${currentPage === 1 || totalPages === 1 ? 'color: gray; text-decoration: none;' : 'text-decoration: none;'}" ${currentPage === 1 || totalPages === 1 ? 'onclick="return false;"' : ''}>上一页</a> | 
            <a href="javascript:void(0);" style="cursor: pointer; margin: 0 5px; ${currentPage === totalPages ? 'color: gray; text-decoration: none;' : 'text-decoration: none;'}" ${currentPage === totalPages ? 'onclick="return false;"' : 'onclick="goToPage(' + (currentPage + 1) + ')"'}>下一页</a> | 
            <a href="javascript:void(0);" style="cursor: pointer; margin: 0 5px; ${currentPage === totalPages ? 'color: gray; text-decoration: none;' : 'text-decoration: none;'}" ${currentPage === totalPages ? 'onclick="return false;"' : 'onclick="goToPage(' + totalPages + ')"'}>尾页</a> | 
            <a href="javascript:void(0);" onclick="jumpToPage()" style="cursor: pointer; margin: 0 5px; text-decoration: none;">跳转到指定页</a> <input type="number" id="jumpToPageInput" min="1" max="${totalPages}" value="${currentPage}" style="width: 50px; text-align: center; margin: 0 5px; display: inline-block;" oninput="if(this.value > ${totalPages}) this.value = ${totalPages};"> | 
            <a href="javascript:void(0);" onclick="setItemsPerPage()" style="cursor: pointer; margin: 0 5px; text-decoration: none;">设定每页记录数</a> <input type="number" id="itemsPerPageInput" min="1" value="${itemsPerPage}" style="width: 50px; text-align: center; margin: 0 5px; display: inline-block;">】 
        </div>
    `;

    paginationControls.innerHTML = paginationHTML;
}

// 跳转页面
function goToPage(page) {
    const totalPages = Math.ceil(selectedFiles.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    const searchFunctions = {
        local: performLocalFileSearch,
        video: performVideoSearch,
        image: performImageSearch,
        doc: performDocSearch,
        sheet: performSheetSearch,
        ppt: performPptSearch,
        lnk: performLnkSearch,
        archive: performArchiveSearch,
        audio: performAudioSearch,
        other: performOtherFileSearch,
    };
    const searchFunction = searchFunctions[currentSearchType];
    if (searchFunction) {
        searchFunction();
    } else {
        console.error('Unknown search type:', currentSearchType);
    }
}

function jumpToPage() {
    const pageInput = document.getElementById('jumpToPageInput');
    const page = parseInt(pageInput.value);
    goToPage(page);
}

// 设定每页记录数
function setItemsPerPage() {
    const itemsPerPageInput = document.getElementById('itemsPerPageInput');
    itemsPerPage = parseInt(itemsPerPageInput.value);
    currentPage = 1;
    const searchFunctions = {
        local: performLocalFileSearch,
        video: performVideoSearch,
        image: performImageSearch,
        doc: performDocSearch,
        sheet: performSheetSearch,
        ppt: performPptSearch,
        lnk: performLnkSearch,
        archive: performArchiveSearch,
        audio: performAudioSearch,
        other: performOtherFileSearch,
    };
    searchFunctions[currentSearchType]?.();
}


function performVideoSearch() {
    currentSearchType = 'video'; // 设置当前搜索类型
    const searchResults = document.getElementById('localFileSearchResults');
    const videoExtensions = ['mp4', 'webm', 'ogg'];

    const matchedFiles = selectedFiles
        .map(file => file.webkitRelativePath)
        .filter(fileName => videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext)));

    if (matchedFiles.length > 0) {
        displayFilesWithPagination(matchedFiles);
    } else {
        searchResults.innerHTML = '<p>未找到匹配的视频文件</p>';
    }
}


function performImageSearch() {
    currentSearchType = 'image'; // 设置当前搜索类型
    const searchResults = document.getElementById('localFileSearchResults');
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];

    const matchedFiles = selectedFiles
        .map(file => file.webkitRelativePath)
        .filter(fileName => imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext)));

    if (matchedFiles.length > 0) {
        displayFilesWithPagination(matchedFiles);
    } else {
        searchResults.innerHTML = '<p>未找到匹配的图片文件</p>';
    }
}

// 文档画廊
function performDocSearch() {
    currentSearchType = 'doc'; // 设置当前搜索类型
    const searchResults = document.getElementById('localFileSearchResults');
    const docExtensions = ['docx', 'doc', 'pdf', 'dotx', 'txt', 'wps'];

    const matchedFiles = selectedFiles
        .map(file => file.webkitRelativePath)
        .filter(fileName => docExtensions.some(ext => fileName.toLowerCase().endsWith(ext)));

    if (matchedFiles.length > 0) {
        displayFilesWithPagination(matchedFiles);
    } else {
        searchResults.innerHTML = '<p>未找到匹配的文档文件</p>';
    }
}

// 表格画廊
function performSheetSearch() {
    currentSearchType = 'sheet'; // 设置当前搜索类型
    const searchResults = document.getElementById('localFileSearchResults');
    const sheetExtensions = ['xlsx', 'xls'];

    const matchedFiles = selectedFiles
        .map(file => file.webkitRelativePath)
        .filter(fileName => sheetExtensions.some(ext => fileName.toLowerCase().endsWith(ext)));

    if (matchedFiles.length > 0) {
        displayFilesWithPagination(matchedFiles);
    } else {
        searchResults.innerHTML = '<p>未找到匹配的表格文件</p>';
    }
}

// 演示文稿画廊
function performPptSearch() {
    currentSearchType = 'ppt'; // 设置当前搜索类型
    const searchResults = document.getElementById('localFileSearchResults');
    const pptExtensions = ['ppt', 'pptx'];

    const matchedFiles = selectedFiles
        .map(file => file.webkitRelativePath)
        .filter(fileName => pptExtensions.some(ext => fileName.toLowerCase().endsWith(ext)));

    if (matchedFiles.length > 0) {
        displayFilesWithPagination(matchedFiles);
    } else {
        searchResults.innerHTML = '<p>未找到匹配的演示文稿文件</p>';
    }
}

// 快捷方式画廊
function performLnkSearch() {
    currentSearchType = 'lnk'; // 设置当前搜索类型
    const searchResults = document.getElementById('localFileSearchResults');
    const lnkExtensions = ['lnk'];

    const matchedFiles = selectedFiles
        .map(file => file.webkitRelativePath)
        .filter(fileName => lnkExtensions.some(ext => fileName.toLowerCase().endsWith(ext)));

    if (matchedFiles.length > 0) {
        displayFilesWithPagination(matchedFiles);
    } else {
        searchResults.innerHTML = '<p>未找到匹配的快捷方式文件</p>';
    }
}

// 压缩文件画廊
function performArchiveSearch() {
    currentSearchType = 'archive'; // 设置当前搜索类型
    const searchResults = document.getElementById('localFileSearchResults');
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'];

    const matchedFiles = selectedFiles
        .map(file => file.webkitRelativePath)
        .filter(fileName => archiveExtensions.some(ext => fileName.toLowerCase().endsWith(ext)));

    if (matchedFiles.length > 0) {
        displayFilesWithPagination(matchedFiles);
    } else {
        searchResults.innerHTML = '<p>未找到匹配的压缩文件</p>';
    }
}

// 音频文件画廊
function performAudioSearch() {
    currentSearchType = 'audio'; // 设置当前搜索类型
    const searchResults = document.getElementById('localFileSearchResults');
    const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'aac'];

    const matchedFiles = selectedFiles
        .map(file => file.webkitRelativePath)
        .filter(fileName => audioExtensions.some(ext => fileName.toLowerCase().endsWith(ext)));

    if (matchedFiles.length > 0) {
        const audioGallery = matchedFiles.map(file => {
            const fileObj = selectedFiles.find(f => f.webkitRelativePath === file);
            const fileURL = URL.createObjectURL(fileObj);
            return `
                <div style="position: relative; margin-bottom: 20px; width: calc(33.33% - 20px);">
                    <audio controls style="width: 100%; margin-top: 5px;">
                        <source src="${fileURL}" type="audio/${fileObj.name.split('.').pop().toLowerCase()}">
                        您的浏览器不支持音频元素。
                    </audio>
                    <a href="${fileURL}" download="${fileObj.name}" style="display: block; color: white; background: rgba(0, 0, 0, 0.5); padding: 8px 0; text-align: center; text-decoration: none; font-weight: normal; border-radius: 4px; margin-top: 5px;">${fileObj.name}</a>
                </div>
            `;
        }).join('');
        searchResults.innerHTML = `<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px;">${audioGallery}</div>`;
    } else {
        searchResults.innerHTML = '<p style="text-align: center; color: #999;">未找到匹配的音频文件</p>';
    }
}

// 其他文件画廊
function performOtherFileSearch() {
    currentSearchType = 'other'; // 设置当前搜索类型
    const searchResults = document.getElementById('localFileSearchResults');
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
    const videoExtensions = ['mp4', 'webm', 'ogg'];
    const docExtensions = ['docx', 'doc', 'pdf', 'dotx', 'txt', 'wps'];
    const sheetExtensions = ['xlsx', 'xls'];
    const pptExtensions = ['ppt', 'pptx'];
    const lnkExtensions = ['lnk'];
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz']; 
    const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'aac']; // 新增音频文件扩展名

    const matchedFiles = selectedFiles
        .map(file => file.webkitRelativePath)
        .filter(fileName => !imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext)) && !videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext)) && !docExtensions.some(ext => fileName.toLowerCase().endsWith(ext)) && !sheetExtensions.some(ext => fileName.toLowerCase().endsWith(ext)) && !pptExtensions.some(ext => fileName.toLowerCase().endsWith(ext)) && !lnkExtensions.some(ext => fileName.toLowerCase().endsWith(ext)) && !archiveExtensions.some(ext => fileName.toLowerCase().endsWith(ext)) && !audioExtensions.some(ext => fileName.toLowerCase().endsWith(ext)) && !fileName.toLowerCase().endsWith('.ini')); // 修改其他文件过滤逻辑

    if (matchedFiles.length > 0) {
        displayFilesWithPagination(matchedFiles);
    } else {
        searchResults.innerHTML = '<p>未找到匹配的其他文件</p>';
    }
}

// 下载文件的函数
function downloadFile(url, name) {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 放大预览文件的函数
function enlargePreview(fileURL) {
    const previewWindow = window.open(fileURL, '_blank');
    previewWindow.focus();
}

// 复制文本到剪贴板的函数
let notificationCount = 0; // 计数器初始化

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    let notification = document.querySelector(`.notification[data-text="${text}"]`);
    if (notification) {
        const countBadge = notification.querySelector('.count-badge');
        let count = parseInt(countBadge.innerText) + 1;
        countBadge.innerText = count;
        return;
    }

    notificationCount++;

    notification = document.createElement('div');
    notification.className = 'notification';
    notification.setAttribute('data-text', text);
    notification.innerText = `复制路径成功`;
    notification.style.position = 'fixed';
    notification.style.top = `${60 + (notificationCount - 1) * 60}px`;
    notification.style.right = '20px';
    notification.style.backgroundColor = getElegantColor();
    notification.style.color = 'white';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    notification.style.zIndex = '1000';
    notification.style.cursor = 'pointer';
    notification.style.fontSize = '14px';
    notification.style.fontWeight = 'bold';

    const countBadge = document.createElement('span');
    countBadge.className = 'count-badge';
    countBadge.innerText = `1`;
    countBadge.style.backgroundColor = 'red';
    countBadge.style.color = 'white';
    countBadge.style.borderRadius = '50%';
    countBadge.style.width = '20px';
    countBadge.style.height = '20px';
    countBadge.style.marginLeft = '10px';
    countBadge.style.fontSize = '12px';
    countBadge.style.fontWeight = 'bold';
    countBadge.style.display = 'inline-block';
    countBadge.style.textAlign = 'center';
    countBadge.style.lineHeight = '20px';

    notification.appendChild(countBadge);

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
            notificationCount--;
        }
    }, 5000);

    notification.addEventListener('click', () => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
            notificationCount--;
        }
    });
}

function getElegantColor() {
    const colors = ['#A9CCE3', '#AED6F1', '#D6EAF8', '#EBF5FB', '#F4F6F7', '#D5DBDB'];
    return colors[Math.floor(Math.random() * colors.length)];
}
document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    const fileCount = document.getElementById('fileCount');

    if (files.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }

        fetch('http://localhost:3001/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            loadFiles(); // Reload the file list after upload
        })
        .catch(error => console.error('Error uploading files:', error));
    }
});

document.getElementById('fileInput').addEventListener('change', function() {
    const fileCount = document.getElementById('fileCount');
    fileCount.textContent = `${this.files.length} files selected`;
});

// Function to load files from the server
function loadFiles() {
    fetch('http://localhost:3001/files')
    .then(response => response.json())
    .then(files => {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = ''; // Clear existing list
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'grid grid-cols-12 p-3 items-center';
            fileItem.innerHTML = `
                <div class="col-span-6">${file}</div>
                <div class="col-span-2">N/A</div>
                <div class="col-span-3">N/A</div>
                <div class="col-span-1">
                    <button class="text-red-600 hover:text-red-800" onclick="deleteFile('${file}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            fileList.appendChild(fileItem);
        });
    })
    .catch(error => console.error('Error loading files:', error));
}

// Function to delete a file
function deleteFile(filename) {
    // Implement delete functionality here
    console.log('Delete file:', filename);
}

// Local filesystem browser
function setupFileBrowser() {
    const browseBtn = document.createElement('button');
    browseBtn.className = 'bg-purple-600 text-white px-4 py-2 rounded ml-4';
    browseBtn.innerHTML = '<i class="fas fa-folder-open mr-2"></i>Browse Local Files';
    document.querySelector('.ml-64.p-8').prepend(browseBtn);

    browseBtn.addEventListener('click', () => {
        fetch('http://localhost:3001/browse')
        .then(response => response.json())
        .then(items => {
            const fileList = document.getElementById('fileList');
            fileList.innerHTML = '';
            items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'grid grid-cols-12 p-3 items-center hover:bg-gray-50';
                itemElement.innerHTML = `
                    <div class="col-span-6">
                        <i class="fas ${item.isDirectory ? 'fa-folder text-yellow-500' : 'fa-file text-blue-500'} mr-2"></i>
                        ${item.name}
                    </div>
                    <div class="col-span-2">${item.isDirectory ? '--' : formatSize(item.size)}</div>
                    <div class="col-span-3">${formatDate(item.modified)}</div>
                    <div class="col-span-1">
                        ${!item.isDirectory ? `
                        <button class="text-blue-600 hover:text-blue-800 mr-2" 
                                onclick="uploadLocalFile('${item.path}')">
                            <i class="fas fa-upload"></i>
                        </button>
                        ` : ''}
                    </div>
                `;
                if (item.isDirectory) {
                    itemElement.addEventListener('click', () => {
                        fetch(`http://localhost:3001/browse?path=${encodeURIComponent(item.path)}`)
                        .then(response => response.json())
                        .then(items => {
                            // Update the file list with directory contents
                            const fileList = document.getElementById('fileList');
                            fileList.innerHTML = '';
                            items.forEach(item => {
                                const itemElement = document.createElement('div');
                                itemElement.className = 'grid grid-cols-12 p-3 items-center hover:bg-gray-50';
                                itemElement.innerHTML = `
                                    <div class="col-span-6">
                                        <i class="fas ${item.isDirectory ? 'fa-folder text-yellow-500' : 'fa-file text-blue-500'} mr-2"></i>
                                        ${item.name}
                                    </div>
                                    <div class="col-span-2">${item.isDirectory ? '--' : formatSize(item.size)}</div>
                                    <div class="col-span-3">${formatDate(item.modified)}</div>
                                    <div class="col-span-1">
                                        ${!item.isDirectory ? `
                                        <button class="text-blue-600 hover:text-blue-800 mr-2" 
                                                onclick="uploadLocalFile('${item.path}')">
                                            <i class="fas fa-upload"></i>
                                        </button>
                                        ` : ''}
                                    </div>
                                `;
                                if (item.isDirectory) {
                                    itemElement.addEventListener('click', (e) => {
                                        e.stopPropagation();
                                        fetch(`http://localhost:3001/browse?path=${encodeURIComponent(item.path)}`)
                                        .then(response => response.json())
                                        .then(updateFileList);
                                    });
                                }
                                fileList.appendChild(itemElement);
                            });
                        });
                    });
                }
                fileList.appendChild(itemElement);
            });
        });
    });
}

function updateFileList(items) {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'grid grid-cols-12 p-3 items-center hover:bg-gray-50';
        itemElement.innerHTML = `
            <div class="col-span-6">
                <i class="fas ${item.isDirectory ? 'fa-folder text-yellow-500' : 'fa-file text-blue-500'} mr-2"></i>
                ${item.name}
            </div>
            <div class="col-span-2">${item.isDirectory ? '--' : formatSize(item.size)}</div>
            <div class="col-span-3">${formatDate(item.modified)}</div>
            <div class="col-span-1">
                ${!item.isDirectory ? `
                <button class="text-blue-600 hover:text-blue-800 mr-2" 
                        onclick="uploadLocalFile('${item.path}')">
                    <i class="fas fa-upload"></i>
                </button>
                ` : ''}
            </div>
        `;
        if (item.isDirectory) {
            itemElement.addEventListener('click', (e) => {
                e.stopPropagation();
                fetch(`http://localhost:3001/browse?path=${encodeURIComponent(item.path)}`)
                .then(response => response.json())
                .then(updateFileList);
            });
        }
        fileList.appendChild(itemElement);
    });
}

function uploadLocalFile(filePath) {
    fetch(filePath)
    .then(response => response.blob())
    .then(blob => {
        const formData = new FormData();
        formData.append('file', blob, path.basename(filePath));
        return fetch('http://localhost:3001/upload', {
            method: 'POST',
            body: formData
        });
    })
    .then(response => response.json())
    .then(data => {
        console.log('File uploaded:', data);
        loadFiles();
    })
    .catch(error => console.error('Error uploading file:', error));
}

// Load files on page load
document.addEventListener('DOMContentLoaded', () => {
    loadFiles();
    setupFileBrowser();
});

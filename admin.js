// Admin System - Portfolio Management
class AdminManager {
    constructor() {
        this.ADMIN_CODE = 'AMIT1X2';
        this.isAuthenticated = false;
        this.uploadedImages = {};
        this.contentData = {};
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.bindEvents();
        this.loadSavedData();
        this.displayUploadedImages();
    }

    checkAuthentication() {
        const authStatus = localStorage.getItem('admin_authenticated');
        if (authStatus === 'true') {
            this.showDashboard();
        } else {
            this.showAuthModal();
        }
    }

    bindEvents() {
        // Auth form
        const authForm = document.getElementById('auth-form');
        if (authForm) {
            authForm.addEventListener('submit', (e) => this.handleAuth(e));
        }

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // File uploads
        const fileInputs = document.querySelectorAll('.file-input');
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handleFileUpload(e));
        });

        // Upload areas (drag & drop)
        const uploadAreas = document.querySelectorAll('.upload-area');
        uploadAreas.forEach(area => {
            area.addEventListener('dragover', (e) => this.handleDragOver(e));
            area.addEventListener('drop', (e) => this.handleFileDrop(e));
            area.addEventListener('click', () => this.triggerFileInput(area));
        });

        // Content management
        const saveBtn = document.getElementById('save-content-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveContent());
        }

        const clearBtn = document.getElementById('clear-all-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllData());
        }

        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
    }

    handleAuth(e) {
        e.preventDefault();
        const codeInput = document.getElementById('admin-code');
        const enteredCode = codeInput.value.trim();

        if (enteredCode === this.ADMIN_CODE) {
            this.authenticate();
        } else {
            this.showNotification('קוד אדמין שגוי!', 'error');
            codeInput.value = '';
        }
    }

    authenticate() {
        this.isAuthenticated = true;
        localStorage.setItem('admin_authenticated', 'true');
        this.showNotification('התחברת בהצלחה!', 'success');
        this.showDashboard();
    }

    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('admin_authenticated');
        this.showAuthModal();
        this.showNotification('התנתקת בהצלחה', 'success');
    }

    showAuthModal() {
        const authModal = document.getElementById('auth-modal');
        const dashboard = document.getElementById('admin-dashboard');

        if (authModal) authModal.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
    }

    showDashboard() {
        const authModal = document.getElementById('auth-modal');
        const dashboard = document.getElementById('admin-dashboard');

        if (authModal) authModal.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        const type = e.target.dataset.type;

        if (file) {
            this.processFile(file, type);
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        const type = e.currentTarget.dataset.type;

        if (files.length > 0) {
            this.processFile(files[0], type);
        }
    }

    triggerFileInput(area) {
        const type = area.dataset.type;
        const input = document.querySelector(`.file-input[data-type="${type}"]`);
        if (input) {
            input.click();
        }
    }

    processFile(file, type) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showNotification('אנא בחר קובץ תמונה בלבד', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('גודל הקובץ חייב להיות קטן מ-5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            this.uploadedImages[type] = {
                data: imageData,
                name: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString()
            };

            this.saveImageToStorage(type);
            this.displayImagePreview(type, imageData);
            this.displayUploadedImages();
            this.showNotification('התמונה הועלתה בהצלחה!', 'success');
        };

        reader.readAsDataURL(file);
    }

    saveImageToStorage(type) {
        const imagesData = JSON.parse(localStorage.getItem('portfolio_images') || '{}');
        imagesData[type] = this.uploadedImages[type];
        localStorage.setItem('portfolio_images', JSON.stringify(imagesData));
    }

    loadSavedData() {
        // Load images
        const savedImages = localStorage.getItem('portfolio_images');
        if (savedImages) {
            this.uploadedImages = JSON.parse(savedImages);

            // Display previews
            Object.keys(this.uploadedImages).forEach(type => {
                const imageData = this.uploadedImages[type].data;
                this.displayImagePreview(type, imageData);
            });
        }

        // Load content
        const savedContent = localStorage.getItem('portfolio_content');
        if (savedContent) {
            this.contentData = JSON.parse(savedContent);
            this.populateContentFields();
        }
    }

    displayImagePreview(type, imageData) {
        const preview = document.querySelector(`.upload-preview[data-type="${type}"]`);
        if (preview) {
            preview.innerHTML = `
                <img src="${imageData}" alt="${type}" style="max-width: 100%; max-height: 150px; border-radius: 8px; margin-top: 10px;">
                <button class="btn btn-small btn-danger remove-image" data-type="${type}">
                    <i class="fas fa-trash"></i> הסר
                </button>
            `;

            // Bind remove button
            const removeBtn = preview.querySelector('.remove-image');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => this.removeImage(type));
            }
        }
    }

    removeImage(type) {
        delete this.uploadedImages[type];

        // Remove from storage
        const imagesData = JSON.parse(localStorage.getItem('portfolio_images') || '{}');
        delete imagesData[type];
        localStorage.setItem('portfolio_images', JSON.stringify(imagesData));

        // Clear preview
        const preview = document.querySelector(`.upload-preview[data-type="${type}"]`);
        if (preview) {
            preview.innerHTML = '';
        }

        this.displayUploadedImages();
        this.showNotification('התמונה הוסרה', 'success');
    }

    displayUploadedImages() {
        const container = document.getElementById('uploaded-images');
        if (!container) return;

        container.innerHTML = '';

        if (Object.keys(this.uploadedImages).length === 0) {
            container.innerHTML = '<p class="no-images">אין תמונות שהועלו עדיין</p>';
            return;
        }

        Object.entries(this.uploadedImages).forEach(([type, image]) => {
            const imageCard = document.createElement('div');
            imageCard.className = 'uploaded-image-card';
            imageCard.innerHTML = `
                <img src="${image.data}" alt="${type}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;">
                <div class="image-info">
                    <h4>${this.getTypeLabel(type)}</h4>
                    <p>${image.name}</p>
                    <small>${this.formatFileSize(image.size)}</small>
                    <button class="btn btn-small btn-danger remove-uploaded" data-type="${type}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            // Bind remove button
            const removeBtn = imageCard.querySelector('.remove-uploaded');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => this.removeImage(type));
            }

            container.appendChild(imageCard);
        });
    }

    getTypeLabel(type) {
        const labels = {
            profile: 'תמונת פרופיל',
            about: 'תמונה - אודות',
            project1: 'פרויקט 1',
            project2: 'פרויקט 2',
            project3: 'פרויקט 3'
        };
        return labels[type] || type;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    saveContent() {
        // Collect content data
        this.contentData = {
            name: document.getElementById('admin-name')?.value || '',
            subtitle: document.getElementById('admin-subtitle')?.value || '',
            description: document.getElementById('admin-description')?.value || '',
            email: document.getElementById('admin-email')?.value || '',
            phone: document.getElementById('admin-phone')?.value || '',
            location: document.getElementById('admin-location')?.value || '',
            projects: document.getElementById('admin-projects')?.value || '',
            experience: document.getElementById('admin-experience')?.value || '',
            satisfaction: document.getElementById('admin-satisfaction')?.value || ''
        };

        // Save to localStorage
        localStorage.setItem('portfolio_content', JSON.stringify(this.contentData));

        // Update main website
        this.updateMainWebsite();

        this.showNotification('התוכן נשמר בהצלחה!', 'success');
    }

    populateContentFields() {
        Object.entries(this.contentData).forEach(([key, value]) => {
            const element = document.getElementById(`admin-${key}`);
            if (element) {
                element.value = value;
            }
        });
    }

    updateMainWebsite() {
        // This would update the main portfolio website with new content
        // Since we're using localStorage, the main site can read from it
        console.log('Main website content updated');
    }

    clearAllData() {
        if (confirm('האם אתה בטוח שברצונך למחוק את כל הנתונים? פעולה זו אינה הפיכה!')) {
            localStorage.removeItem('portfolio_images');
            localStorage.removeItem('portfolio_content');
            this.uploadedImages = {};
            this.contentData = {};

            // Clear all previews
            document.querySelectorAll('.upload-preview').forEach(preview => {
                preview.innerHTML = '';
            });

            // Clear form fields
            document.querySelectorAll('input, textarea').forEach(field => {
                field.value = '';
            });

            this.displayUploadedImages();
            this.showNotification('כל הנתונים נמחקו', 'success');
        }
    }

    exportData() {
        const data = {
            images: this.uploadedImages,
            content: this.contentData,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('הנתונים יוצאו בהצלחה!', 'success');
    }

    showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add to DOM
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Hide notification after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
}

// Initialize Admin Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new AdminManager();
});

// Add CSS for admin panel
const adminStyles = `
    /* Admin Modal */
    .auth-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }

    .auth-container {
        background: white;
        padding: 40px;
        border-radius: 15px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        text-align: center;
    }

    .auth-header h2 {
        color: #2c3e50;
        margin-bottom: 10px;
        font-weight: 600;
    }

    .auth-header p {
        color: #666;
        margin-bottom: 30px;
    }

    .auth-form .form-group {
        margin-bottom: 20px;
        text-align: right;
    }

    .auth-form label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
    }

    .auth-form input {
        width: 100%;
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 16px;
    }

    .auth-form input:focus {
        border-color: #3498db;
        outline: none;
    }

    .btn-full {
        width: 100%;
        padding: 12px;
        font-size: 16px;
    }

    .auth-footer {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #eee;
    }

    .auth-footer p {
        color: #666;
        font-size: 14px;
    }

    /* Admin Dashboard */
    .admin-dashboard {
        min-height: 100vh;
        background: #f8f9fa;
    }

    .admin-nav {
        background: white;
        border-bottom: 1px solid #e0e0e0;
        padding: 20px 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .admin-nav-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .admin-nav h2 {
        color: #2c3e50;
        margin: 0;
    }

    .admin-nav-buttons {
        display: flex;
        gap: 10px;
    }

    .admin-content {
        padding: 40px 0;
    }

    .admin-section {
        background: white;
        margin-bottom: 30px;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    }

    .admin-section h3 {
        color: #2c3e50;
        margin-bottom: 25px;
        font-size: 1.5rem;
        font-weight: 600;
    }

    /* Upload Grid */
    .upload-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 25px;
    }

    .upload-item h4 {
        color: #333;
        margin-bottom: 15px;
        font-size: 1.1rem;
        font-weight: 500;
    }

    .upload-area {
        border: 2px dashed #ddd;
        border-radius: 10px;
        padding: 30px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: #fafafa;
    }

    .upload-area:hover,
    .upload-area.drag-over {
        border-color: #3498db;
        background: #f0f8ff;
    }

    .upload-placeholder i {
        font-size: 2rem;
        color: #ccc;
        margin-bottom: 10px;
    }

    .upload-placeholder p {
        color: #666;
        margin: 0;
        font-size: 0.9rem;
    }

    .file-input {
        display: none;
    }

    .upload-preview {
        margin-top: 15px;
        text-align: center;
    }

    .upload-preview img {
        border-radius: 8px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    }

    /* Content Management */
    .content-management {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
    }

    .content-item h4 {
        color: #2c3e50;
        margin-bottom: 20px;
        font-size: 1.2rem;
        font-weight: 600;
    }

    .content-item .form-group {
        margin-bottom: 15px;
    }

    .content-item label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #333;
    }

    .content-item input,
    .content-item textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-family: 'Rubik', sans-serif;
    }

    .content-item input:focus,
    .content-item textarea:focus {
        border-color: #3498db;
        outline: none;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 15px;
    }

    /* Actions */
    .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
    }

    .btn-large {
        padding: 15px 20px;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }

    .btn-danger {
        background: #e74c3c;
        color: white;
    }

    .btn-danger:hover {
        background: #c0392b;
    }

    /* Uploaded Images */
    .uploaded-images-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
    }

    .uploaded-image-card {
        background: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    }

    .uploaded-image-card img {
        width: 100%;
        height: 120px;
        object-fit: cover;
    }

    .image-info {
        padding: 15px;
        text-align: center;
    }

    .image-info h4 {
        color: #2c3e50;
        margin-bottom: 5px;
        font-size: 1rem;
    }

    .image-info p {
        color: #666;
        font-size: 0.8rem;
        margin-bottom: 5px;
    }

    .image-info small {
        color: #999;
        font-size: 0.7rem;
        display: block;
        margin-bottom: 10px;
    }

    .no-images {
        text-align: center;
        color: #666;
        font-style: italic;
        padding: 40px;
        grid-column: 1 / -1;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .upload-grid {
            grid-template-columns: 1fr;
        }

        .content-management {
            grid-template-columns: 1fr;
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }

        .actions-grid {
            grid-template-columns: 1fr;
        }

        .uploaded-images-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }

        .admin-nav-container {
            flex-direction: column;
            gap: 15px;
        }

        .admin-nav-buttons {
            width: 100%;
            justify-content: center;
        }
    }
`;

// Add admin styles to page
const styleElement = document.createElement('style');
styleElement.textContent = adminStyles;
document.head.appendChild(styleElement);

// HexNoir.AIM - Main JavaScript
// Free Fire Sensitivity Generator

class HexNoirAIM {
    constructor() {
        this.devicesData = null;
        this.currentDevice = null;
        this.searchHistory = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.populateDeviceList();
        this.loadHistory();
    }

    async loadData() {
        try {
            const response = await fetch('/data/devices.json');
            this.devicesData = await response.json();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('Không thể tải dữ liệu!', 'error');
        }
    }

    setupEventListeners() {
        // Search button
        document.getElementById('searchBtn').addEventListener('click', () => this.searchDevice());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchDevice();
        });

        // Brand filter
        document.getElementById('brandFilter').addEventListener('change', () => this.populateDeviceList());

        // Device search
        document.getElementById('deviceSearch').addEventListener('input', (e) => {
            this.filterDeviceList(e.target.value);
        });

        // Generate button
        document.getElementById('generateBtn').addEventListener('click', () => this.generateSensitivity());
    }

    populateDeviceList() {
        const brand = document.getElementById('brandFilter').value;
        let devices = [];

        if (brand === 'all') {
            devices = Object.keys(this.devicesData.devices);
        } else {
            devices = this.devicesData.brands[brand] || [];
        }

        const deviceList = document.getElementById('deviceList');
        deviceList.innerHTML = '';
        
        devices.sort().forEach(device => {
            const li = document.createElement('li');
            li.textContent = device;
            li.addEventListener('click', () => this.selectDevice(device));
            deviceList.appendChild(li);
        });

        this.deviceSearchList = devices;
    }

    filterDeviceList(searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const filtered = this.deviceSearchList.filter(device => 
            device.toLowerCase().includes(searchLower)
        );
        
        const deviceList = document.getElementById('deviceList');
        deviceList.innerHTML = '';
        
        filtered.forEach(device => {
            const li = document.createElement('li');
            li.textContent = device;
            li.addEventListener('click', () => this.selectDevice(device));
            deviceList.appendChild(li);
        });
    }

    selectDevice(device) {
        this.currentDevice = device;
        
        // Update UI
        document.querySelectorAll('#deviceList li').forEach(li => {
            li.classList.remove('selected');
            if (li.textContent === device) {
                li.classList.add('selected');
            }
        });
        
        document.getElementById('selectedDevice').textContent = `📱 ${device}`;
        document.getElementById('searchInput').value = device;
        
        this.showNotification(`Đã chọn: ${device}`, 'success');
    }

    searchDevice() {
        const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
        if (!keyword) {
            this.showNotification('Vui lòng nhập từ khóa tìm kiếm!', 'warning');
            return;
        }

        let found = null;
        for (const device of Object.keys(this.devicesData.devices)) {
            if (device.toLowerCase().includes(keyword)) {
                found = device;
                break;
            }
        }

        if (found) {
            this.selectDevice(found);
            // Scroll to device in list
            const deviceElement = Array.from(document.querySelectorAll('#deviceList li')).find(
                li => li.textContent === found
            );
            if (deviceElement) {
                deviceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            this.showNotification(`Không tìm thấy thiết bị "${keyword}"`, 'error');
        }
    }

    async generateSensitivity() {
        if (!this.currentDevice) {
            this.showNotification('Vui lòng chọn thiết bị trước!', 'warning');
            return;
        }

        // Animate progress
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        for (let i = 0; i <= 100; i++) {
            await this.sleep(10);
            progressBar.style.width = `${i}%`;
            progressText.textContent = `Đang tạo độ nhạy cho ${this.currentDevice}... ${i}%`;
        }

        // Get sensitivity data
        let sensitivity = this.devicesData.devices[this.currentDevice];
        
        if (!sensitivity) {
            sensitivity = this.autoGenerateSensitivity(this.currentDevice);
        }

        // Update UI with results
        this.updateSensitivityDisplay(sensitivity);
        
        progressText.textContent = `✅ Hoàn thành! Đã tạo độ nhạy cho ${this.currentDevice}`;
        
        // Add to history
        this.addToHistory(this.currentDevice);
        
        // Reset progress after 2 seconds
        setTimeout(() => {
            progressBar.style.width = '0%';
            progressText.textContent = 'Sẵn sàng tạo độ nhạy';
        }, 2000);
        
        this.showNotification(`Đã tạo độ nhạy cho ${this.currentDevice}!`, 'success');
    }

    autoGenerateSensitivity(deviceName) {
        const deviceLower = deviceName.toLowerCase();
        
        let baseSens = 80;
        
        if (deviceLower.includes('pro') || deviceLower.includes('ultra') || deviceLower.includes('plus')) {
            baseSens = 70;
        } else if (deviceLower.includes('note') || deviceLower.includes('a')) {
            baseSens = 85;
        }
        
        if (deviceLower.includes('iphone') || deviceLower.includes('ipad')) {
            baseSens = deviceLower.includes('pro') ? 70 : 80;
        }
        
        return {
            nhiem_xung_quanh: baseSens + Math.floor(Math.random() * 11) - 5,
            red_dot: baseSens - 5 + Math.floor(Math.random() * 11) - 5,
            scope_2x: baseSens - 10 + Math.floor(Math.random() * 11) - 5,
            scope_4x: baseSens - 15 + Math.floor(Math.random() * 11) - 5,
            nut_ban: baseSens - 35 + Math.floor(Math.random() * 11) - 5
        };
    }

    updateSensitivityDisplay(sensitivity) {
        document.getElementById('nhiemXungQuanh').textContent = sensitivity.nhiem_xung_quanh;
        document.getElementById('redDot').textContent = sensitivity.red_dot;
        document.getElementById('scope2x').textContent = sensitivity.scope_2x;
        document.getElementById('scope4x').textContent = sensitivity.scope_4x;
        document.getElementById('nutBan').textContent = sensitivity.nut_ban;
        
        // Add animation
        const values = document.querySelectorAll('.sensitivity-value');
        values.forEach(value => {
            value.style.animation = 'none';
            value.offsetHeight;
            value.style.animation = 'pulse 0.5s ease';
        });
    }

    addToHistory(device) {
        // Remove if exists
        const index = this.searchHistory.indexOf(device);
        if (index !== -1) {
            this.searchHistory.splice(index, 1);
        }
        
        // Add to beginning
        this.searchHistory.unshift(device);
        
        // Keep only last 5
        if (this.searchHistory.length > 5) {
            this.searchHistory.pop();
        }
        
        this.saveHistory();
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        
        if (this.searchHistory.length === 0) {
            historyList.innerHTML = '<li class="history-empty">Chưa có lịch sử</li>';
            return;
        }
        
        this.searchHistory.forEach(device => {
            const li = document.createElement('li');
            li.textContent = device;
            li.addEventListener('click', () => this.selectDevice(device));
            historyList.appendChild(li);
        });
    }

    saveHistory() {
        localStorage.setItem('hexnoir_history', JSON.stringify(this.searchHistory));
    }

    loadHistory() {
        const saved = localStorage.getItem('hexnoir_history');
        if (saved) {
            this.searchHistory = JSON.parse(saved);
            this.updateHistoryDisplay();
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#7c3aed'};
            color: white;
            border-radius: 12px;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HexNoirAIM();
});

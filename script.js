document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.querySelector('.upload-button');
    const comparisonContainer = document.getElementById('comparisonContainer');
    const originalImage = document.getElementById('originalImage');
    const compressedImage = document.getElementById('compressedImage');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const downloadButton = document.getElementById('downloadButton');

    let originalFile = null;

    // 处理文件拖放
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#007AFF';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ddd';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#ddd';
        const files = e.dataTransfer.files;
        handleFile(files[0]);
    });

    // 处理文件选择
    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

    // 处理质量滑块变化
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = `${e.target.value}%`;
        if (originalFile) {
            compressImage(originalFile, e.target.value / 100);
        }
    });

    // 处理文件
    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('请选择有效的图片文件！');
            return;
        }

        originalFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage.src = e.target.result;
            originalSize.textContent = formatFileSize(file.size);
            compressImage(file, qualitySlider.value / 100);
            comparisonContainer.style.display = 'grid';
        };
        reader.readAsDataURL(file);
    }

    // 压缩图片
    function compressImage(file, quality) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                
                // 计算新的尺寸，保持宽高比
                let width = img.width;
                let height = img.height;
                
                // 如果图片尺寸大于 2000px，按比例缩小
                const MAX_WIDTH = 2000;
                const MAX_HEIGHT = 2000;
                
                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height = Math.round((height * MAX_WIDTH) / width);
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width = Math.round((width * MAX_HEIGHT) / height);
                            height = MAX_HEIGHT;
                        }
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                // 使用双线性插值算法
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                
                // 根据文件类型选择合适的压缩格式
                let outputType = file.type;
                if (file.type === 'image/png' && quality < 1) {
                    outputType = 'image/jpeg'; // PNG转换为JPEG以获得更好的压缩效果
                }
                
                canvas.toBlob((blob) => {
                    if (!blob) {
                        alert('压缩失败，请尝试其他图片！');
                        return;
                    }
                    
                    // 如果压缩后的大小大于原图，则使用原图
                    if (blob.size >= file.size) {
                        compressedImage.src = URL.createObjectURL(file);
                        compressedSize.textContent = formatFileSize(file.size);
                        downloadButton.onclick = () => {
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(file);
                            link.download = file.name;
                            link.click();
                        };
                    } else {
                        compressedImage.src = URL.createObjectURL(blob);
                        compressedSize.textContent = formatFileSize(blob.size);
                        downloadButton.onclick = () => {
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(blob);
                            link.download = `compressed_${file.name.replace('.png', '.jpg')}`;
                            link.click();
                        };
                    }
                }, outputType, quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}); 
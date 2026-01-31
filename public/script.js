let currentSlides = [];
let currentSlideIndex = 0;

async function fetchData() {
    const url = document.getElementById('urlInput').value;
    const btn = document.getElementById('downloadBtn');
    const loader = document.getElementById('loader');
    const resultArea = document.getElementById('resultArea');
    const videoContainer = document.getElementById('videoContainer');
    const photoContainer = document.getElementById('photoContainer');

    if (!url) return alert('Please paste a TikTok link first!');

    // UI Loading State
    btn.classList.add('hidden');
    loader.classList.remove('hidden');
    resultArea.classList.add('hidden');

    try {
        const response = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (data.error) throw new Error(data.error);

        // Populate Data
        document.getElementById('resUsername').textContent = `@${data.username}`;
        document.getElementById('resViews').textContent = data.views;
        document.getElementById('resLikes').textContent = data.likes;

        resultArea.classList.remove('hidden');

        // Reset Displays
        videoContainer.classList.add('hidden');
        photoContainer.classList.add('hidden');

        if (data.type === 'video') {
            videoContainer.classList.remove('hidden');
            const videoUrl = data.downloads.nowm[0] || data.downloads.wm[0];
            const audioUrl = data.mp3[0];
            
            document.getElementById('videoPlayer').src = videoUrl;
            document.getElementById('btnVideoNowm').href = videoUrl;
            
            const btnAudio = document.getElementById('btnAudio');
            if(audioUrl) {
                btnAudio.href = audioUrl;
                btnAudio.style.display = 'block';
            } else {
                btnAudio.style.display = 'none';
            }

        } else if (data.type === 'photo') {
            photoContainer.classList.remove('hidden');
            setupSlider(data.slides);
        }

    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        btn.classList.remove('hidden');
        loader.classList.add('hidden');
    }
}

// --- Logic Slider Foto ---
function setupSlider(slides) {
    currentSlides = slides;
    currentSlideIndex = 0;
    
    const track = document.getElementById('sliderTrack');
    track.innerHTML = ''; // Clear previous

    slides.forEach(slide => {
        const img = document.createElement('img');
        img.src = slide.url;
        track.appendChild(img);
    });

    updateSlideUI();
}

function moveSlide(direction) {
    const total = currentSlides.length;
    currentSlideIndex += direction;

    if (currentSlideIndex < 0) currentSlideIndex = total - 1;
    if (currentSlideIndex >= total) currentSlideIndex = 0;

    updateSlideUI();
}

function updateSlideUI() {
    const track = document.getElementById('sliderTrack');
    const counter = document.getElementById('slideCounter');
    
    // Geser slider menggunakan CSS Transform
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    
    // Update text counter
    counter.textContent = `${currentSlideIndex + 1} / ${currentSlides.length}`;

    // Update tombol download untuk foto yang sedang aktif
    const currentUrl = currentSlides[currentSlideIndex].url;
    const btn = document.getElementById('btnDownloadCurrentSlide');
    
    // Event listener on click
    btn.onclick = () => {
        window.open(currentUrl, '_blank');
    };
    
    // Tombol Download All (Opsional: Butuh JSZIP untuk implementasi penuh, di sini hanya buka semua tab)
    document.getElementById('downloadAllBtn').onclick = () => {
        currentSlides.forEach(s => window.open(s.url, '_blank'));
    };
}

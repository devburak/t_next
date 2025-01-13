document.addEventListener('DOMContentLoaded', function () {
    console.log('Carousel script çalıştı');

    const container = document.getElementById('carousel-container');
    if (!container) return;

    const slidesWrapper = container.children[0];
    if (!slidesWrapper) return;

    const slides = slidesWrapper.children;
    const totalSlides = slides.length;

    let currentIndex = 0;

    function updateSlides() {
        Array.from(slides).forEach((slide, index) => {
            if (index === currentIndex) {
                slide.style.display = 'block';
                slide.style.opacity = '1';
                slide.style.zIndex = '1';
                slide.style.transform = 'translateX(0%)';
            } else {
                slide.style.display = 'none';
                slide.style.opacity = '0';
                slide.style.zIndex = '0';
                slide.style.transform = `translateX(${(index - currentIndex) * 100}%)`;
            }
        });
          // Dot'ların durumunu güncelle
          updateDots();
    }

    function moveToSlide(index) {
        currentIndex = index;
        updateSlides();
    }

    // Otomatik kaydırma
    setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        moveToSlide(currentIndex);
    }, 5000);

    const prevButton = document.getElementById('carousel-prev');
    const nextButton = document.getElementById('carousel-next');

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            moveToSlide(currentIndex);
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            moveToSlide(currentIndex);
        });
    }

    // Dot'ları ekle
    const dotsContainer = document.createElement('div');
    dotsContainer.id = 'carousel-dots-container';
    dotsContainer.style.width = '100%';
    dotsContainer.style.marginTop = '10px';
    dotsContainer.style.textAlign = 'center';

    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.dataset.index = i;
        dot.addEventListener('click', (e) => {
            const targetIndex = parseInt(e.target.dataset.index, 10);
            moveToSlide(targetIndex);
        });
        dotsContainer.appendChild(dot);
    }

    container.appendChild(dotsContainer);

    function updateDots() {
        const dots = dotsContainer.children;
        Array.from(dots).forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // İlk güncelleme
    updateSlides();
});

document.addEventListener('DOMContentLoaded', function () {
    const containers = Array.from(
        document.querySelectorAll('[data-carousel-container], #carousel-container')
    );
    if (!containers.length) return;

    containers.forEach((container) => {
        const slidesWrapper = container.querySelector('[data-carousel-slides]') || container.children[0];
        if (!slidesWrapper) return;

        const slides = Array.from(slidesWrapper.children || []);
        const totalSlides = slides.length;
        if (!totalSlides) return;

        let currentIndex = 0;

        const prevButton = container.querySelector('[data-carousel-prev], #carousel-prev');
        const nextButton = container.querySelector('[data-carousel-next], #carousel-next');

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel-dots-container';
        dotsContainer.style.width = '100%';
        dotsContainer.style.marginTop = '10px';
        dotsContainer.style.textAlign = 'center';

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

        function updateSlides() {
            slides.forEach((slide, index) => {
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
            updateDots();
        }

        function moveToSlide(index) {
            currentIndex = index;
            updateSlides();
        }

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

        const mountNode =
            container.closest('[data-carousel-root], #carousel-wrapper') || container;

        mountNode.appendChild(dotsContainer);

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

        setInterval(() => {
            currentIndex = (currentIndex + 1) % totalSlides;
            moveToSlide(currentIndex);
        }, 5000);

        updateSlides();
    });
});

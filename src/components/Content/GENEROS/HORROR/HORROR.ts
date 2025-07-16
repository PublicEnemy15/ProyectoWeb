interface SliderConfig {
    itemsPerPage: number;
    sliderSelector: string;
    itemSelector: string;
    nextBtnSelector: string;
    prevBtnSelector: string;
    bulletsSelector: string;
}

interface TouchState {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    isDragging: boolean;
    startTime: number;
    initialTransform: number;
    lastMoveTime: number;
    lastMoveX: number;
}

export class HORRORSlider {
    private currentPage: number;
    private readonly itemsPerPage: number;
    private slider: HTMLElement | null;
    private sliderWrapper: HTMLElement | null;
    private items: HTMLElement[];
    private totalItems: number;
    private totalPages: number;
    private nextBtn: HTMLButtonElement | null;
    private prevBtn: HTMLButtonElement | null;
    private nextWrapper: HTMLElement | null;
    private prevWrapper: HTMLElement | null;
    private bulletsContainer: HTMLElement | null;
    private bullets: NodeListOf<HTMLButtonElement> | null = null;
    private itemWidth: number;
    private gap: number;
    private slideDistance: number;
    private currentTransform: number;
    private touchState: TouchState;
    private isAnimating: boolean = false;

    constructor(config: SliderConfig) {
        this.currentPage = 1;
        this.itemsPerPage = config.itemsPerPage;
        
        this.slider = document.querySelector('.horror-slider .Slider-tape');
        this.sliderWrapper = document.querySelector('.horror-slider .KITHSlider-sliderWrapper');
        const allItems = document.querySelectorAll<HTMLElement>('.horror-slider .Slider-item');
        this.items = Array.from(allItems);
        this.totalItems = this.items.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        
        this.nextBtn = document.querySelector('.horror-slider .KITHSlider-btnWrapper.next button');
        this.prevBtn = document.querySelector('.horror-slider .KITHSlider-btnWrapper.prev button');
        this.nextWrapper = document.querySelector('.horror-slider .KITHSlider-btnWrapper.next');
        this.prevWrapper = document.querySelector('.horror-slider .KITHSlider-btnWrapper.prev');
        this.bulletsContainer = document.querySelector('.horror-slider .KITHSlider-bullets');
        
        this.itemWidth = this.items[0]?.offsetWidth || 0;
        this.gap = 15;
        this.slideDistance = 0;
        this.currentTransform = 0;
        
        this.touchState = {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            isDragging: false,
            startTime: 0,
            initialTransform: 0,
            lastMoveTime: 0,
            lastMoveX: 0
        };
        
        this.init();
    }

    private init(): void {
        this.waitForDimensions(() => {
            this.generateBullets();
            this.updateButtons();
            this.calculateDimensions();
            this.updateSlider();
            this.resizeButtonsToImageContainer();
            this.setupTouchEvents();
            
            // Event listeners para botones (solo desktop)
            this.nextBtn?.addEventListener('click', () => this.nextPage());
            this.prevBtn?.addEventListener('click', () => this.prevPage());

            window.addEventListener('resize', this.debounce(() => {
                this.handleResize();
            }, 100));
        });
    }

    private waitForDimensions(callback: () => void): void {
        const checkDimensions = () => {
            if (this.items.length > 0 && this.items[0].offsetWidth > 0) {
                callback();
            } else {
                requestAnimationFrame(checkDimensions);
            }
        };
        checkDimensions();
    }

    private setupTouchEvents(): void {
        if (!this.slider) return;

        // Remover eventos existentes
        this.slider.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        this.slider.removeEventListener('touchmove', this.handleTouchMove.bind(this));
        this.slider.removeEventListener('touchend', this.handleTouchEnd.bind(this));

        // Solo agregar eventos táctiles en móvil
        if (window.innerWidth < 768) {
            this.slider.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            this.slider.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            this.slider.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        }
    }

    private handleTouchStart(e: TouchEvent): void {
        if (this.isAnimating) return;
        
        const touch = e.touches[0];
        this.touchState.startX = touch.clientX;
        this.touchState.startY = touch.clientY;
        this.touchState.currentX = touch.clientX;
        this.touchState.currentY = touch.clientY;
        this.touchState.isDragging = true;
        this.touchState.startTime = Date.now();
        this.touchState.lastMoveTime = Date.now();
        this.touchState.lastMoveX = touch.clientX;
        
        // Obtener la transformación actual exacta
        this.touchState.initialTransform = this.currentTransform;
        
        // Remover transición durante el arrastre
        if (this.slider) {
            this.slider.style.transition = 'none';
        }
    }

    private handleTouchMove(e: TouchEvent): void {
        if (!this.touchState.isDragging || this.isAnimating) return;
        
        e.preventDefault();
        
        const touch = e.touches[0];
        this.touchState.currentX = touch.clientX;
        this.touchState.currentY = touch.clientY;
        
        const deltaX = this.touchState.currentX - this.touchState.startX;
        const deltaY = this.touchState.currentY - this.touchState.startY;
        
        // Solo procesar si el movimiento es más horizontal que vertical
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            const newTransform = this.touchState.initialTransform + deltaX;
            
            // Calcular límites más precisos para móvil
            const maxTransform = 0;
            const minTransform = this.getMinTransform();
            
            const clampedTransform = Math.max(minTransform, Math.min(maxTransform, newTransform));
            
            if (this.slider) {
                this.slider.style.transform = `translateX(${clampedTransform}px)`;
            }
            
            // Actualizar tracking para velocidad
            this.touchState.lastMoveTime = Date.now();
            this.touchState.lastMoveX = this.touchState.currentX;
        }
    }

    private handleTouchEnd(e: TouchEvent): void {
        if (!this.touchState.isDragging || this.isAnimating) return;
        
        this.touchState.isDragging = false;
        
        // Restaurar transición más suave
        if (this.slider) {
            this.slider.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }
        
        const deltaX = this.touchState.currentX - this.touchState.startX;
        const deltaTime = Date.now() - this.touchState.startTime;
        
        // Calcular velocidad más precisa
        const recentDeltaTime = Date.now() - this.touchState.lastMoveTime;
        const recentDeltaX = this.touchState.currentX - this.touchState.lastMoveX;
        const velocity = recentDeltaTime > 0 ? Math.abs(recentDeltaX) / recentDeltaTime : 0;
        
        // Ajustar thresholds para hacer el swipe menos sensible
        const threshold = this.itemWidth * 0.4;
        const velocityThreshold = 0.5;
        const shouldChangePage = Math.abs(deltaX) > threshold || velocity > velocityThreshold;
        
        if (shouldChangePage) {
            if (deltaX > 0) {
                // Swipe a la derecha - ir hacia atrás
                this.smoothPrevPage();
            } else {
                // Swipe a la izquierda - ir hacia adelante
                this.smoothNextPage();
            }
        } else {
            // Volver a la posición actual
            this.snapToCurrentPage();
        }
    }

    private getMinTransform(): number {
        if (window.innerWidth >= 768) {
            // Desktop: comportamiento original
            return -((this.totalPages - 1) * this.slideDistance * this.itemsPerPage);
        } else {
            // Móvil: calcular basado en el contenido total
            const totalWidth = this.totalItems * (this.itemWidth + this.gap) - this.gap;
            const containerWidth = this.sliderWrapper?.offsetWidth || window.innerWidth;
            return Math.min(0, -(totalWidth - containerWidth));
        }
    }

    private smoothNextPage(): void {
        if (window.innerWidth >= 768) {
            this.nextPage();
            return;
        }
        
        // Móvil: scroll continuo más suave
        const currentTransform = this.currentTransform;
        const moveDistance = this.itemWidth + this.gap;
        const newTransform = currentTransform - moveDistance;
        const minTransform = this.getMinTransform();
        
        this.currentTransform = Math.max(minTransform, newTransform);
        
        if (this.slider) {
            this.slider.style.transform = `translateX(${this.currentTransform}px)`;
        }
        
        this.updateMobilePagination();
    }

    private smoothPrevPage(): void {
        if (window.innerWidth >= 768) {
            this.prevPage();
            return;
        }
        
        // Móvil: scroll continuo más suave
        const currentTransform = this.currentTransform;
        const moveDistance = this.itemWidth + this.gap;
        const newTransform = currentTransform + moveDistance;
        
        this.currentTransform = Math.min(0, newTransform);
        
        if (this.slider) {
            this.slider.style.transform = `translateX(${this.currentTransform}px)`;
        }
        
        this.updateMobilePagination();
    }

    private snapToCurrentPage(): void {
        if (window.innerWidth >= 768) {
            this.updateSlider();
            return;
        }
        
        // Móvil: volver a la posición actual
        if (this.slider) {
            this.slider.style.transform = `translateX(${this.currentTransform}px)`;
        }
    }

    private updateMobilePagination(): void {
        // Actualizar la página actual basada en la posición del transform
        if (window.innerWidth < 768) {
            const itemsPerPage = this.getResponsiveItemsPerPage();
            const moveDistance = this.itemWidth + this.gap;
            const currentPageFloat = Math.abs(this.currentTransform) / moveDistance / itemsPerPage;
            this.currentPage = Math.max(1, Math.min(this.totalPages, Math.round(currentPageFloat) + 1));
        }
        
        this.updateButtons();
    }

    private getResponsiveItemsPerPage(): number {
        return window.innerWidth >= 768 ? this.itemsPerPage : 2.2;
    }

    private calculateDimensions(): void {
        if (this.items.length > 0) {
            const firstItem = this.items[0];
            
            if (firstItem.offsetWidth === 0) {
                const computedStyle = window.getComputedStyle(firstItem);
                if (computedStyle.width && computedStyle.width !== 'auto') {
                    this.itemWidth = parseFloat(computedStyle.width);
                }
            } else {
                this.itemWidth = firstItem.offsetWidth;
            }
            
            if (this.slider) {
                const computedGap = window.getComputedStyle(this.slider).gap;
                this.gap = parseInt(computedGap) || 15;
            }
            
            if (window.innerWidth >= 768) {
                // Desktop: comportamiento original
                this.slideDistance = (this.itemWidth + this.gap);
            } else {
                // Móvil: calcular basado en items individuales
                this.slideDistance = this.itemWidth + this.gap;
            }
        }
    }

    private handleResize(): void {
        this.calculateDimensions();
        
        const currentItemsPerPage = this.getResponsiveItemsPerPage();
        
        if (window.innerWidth >= 768) {
            // Desktop: comportamiento original
            this.totalPages = Math.ceil(this.totalItems / currentItemsPerPage);
            this.currentTransform = -((this.currentPage - 1) * this.slideDistance * this.itemsPerPage);
        } else {
            // Móvil: recalcular páginas basado en scroll continuo
            const totalWidth = this.totalItems * (this.itemWidth + this.gap) - this.gap;
            const containerWidth = this.sliderWrapper?.offsetWidth || window.innerWidth;
            const maxScroll = Math.max(0, totalWidth - containerWidth);
            this.totalPages = Math.ceil(maxScroll / this.slideDistance) || 1;
            
            // Ajustar transform actual si es necesario
            const minTransform = this.getMinTransform();
            this.currentTransform = Math.max(minTransform, this.currentTransform);
        }
        
        if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages);
        }
        
        this.generateBullets();
        this.updateSlider();
        this.resizeButtonsToImageContainer();
        this.setupTouchEvents();
    }

    private resizeButtonsToImageContainer(): void {
        if (this.items.length === 0 || window.innerWidth < 768) return;
        
        const firstItem = this.items[0];
        const imageContainer = firstItem.querySelector('.ui-series-poster-container') as HTMLElement;
        
        if (!imageContainer) return;
        
        const containerRect = imageContainer.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        if (this.prevWrapper) {
            this.prevWrapper.style.width = `${containerWidth}px`;
            this.prevWrapper.style.height = `${containerHeight}px`;
        }
        
        if (this.nextWrapper) {
            this.nextWrapper.style.width = `${containerWidth}px`;
            this.nextWrapper.style.height = `${containerHeight}px`;
        }
        
        this.adjustButtonVerticalPosition(imageContainer);
    }

    private adjustButtonVerticalPosition(imageContainer: HTMLElement): void {
        const containerRect = imageContainer.getBoundingClientRect();
        const sliderRect = this.slider?.getBoundingClientRect();
        
        if (!sliderRect) return;
        
        const verticalOffset = containerRect.top - sliderRect.top;
        
        if (this.prevWrapper) {
            this.prevWrapper.style.top = `${verticalOffset}px`;
        }
        
        if (this.nextWrapper) {
            this.nextWrapper.style.top = `${verticalOffset}px`;
        }
    }

    private updateSlider(): void {
        if (!this.slider) return;
        
        let offset: number;
        
        if (window.innerWidth >= 768) {
            // Desktop: comportamiento original
            offset = (this.currentPage - 1) * this.slideDistance * this.itemsPerPage;
            this.currentTransform = -offset;
        } else {
            // Móvil: usar transform actual
            offset = Math.abs(this.currentTransform);
        }
        
        this.slider.style.transform = `translateX(-${offset}px)`;
        
        // Actualizar visibilidad de items (solo para desktop)
        if (window.innerWidth >= 768) {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            
            this.items.forEach((item, index) => {
                const isVisible = index >= startIndex && index < endIndex;
                item.classList.toggle('Slider-item-hidden', !isVisible);
                item.classList.toggle('Slider-item-right', !isVisible);
            });
        }
        
        this.updateButtons();
    }

    private updateButtons(): void {
        // Solo mostrar botones en desktop
        if (window.innerWidth >= 768) {
            if (this.nextWrapper) {
                this.nextWrapper.classList.toggle('visible', 
                    this.currentPage < this.totalPages && this.totalPages > 1);
            }

            if (this.prevWrapper) {
                this.prevWrapper.classList.toggle('visible', 
                    this.currentPage > 1 && this.totalPages > 1);
            }
        }

        this.bullets?.forEach((bullet, index) => {
            bullet.classList.toggle('active', index + 1 === this.currentPage);
        });
    }

    private nextPage(): void {
        if (this.currentPage < this.totalPages && !this.isAnimating) {
            this.isAnimating = true;
            this.currentPage++;
            this.updateSlider();
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 500);
        }
    }

    private prevPage(): void {
        if (this.currentPage > 1 && !this.isAnimating) {
            this.isAnimating = true;
            this.currentPage--;
            this.updateSlider();
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 500);
        }
    }

    private goToPage(pageNumber: number): void {
        if (pageNumber >= 1 && pageNumber <= this.totalPages && !this.isAnimating) {
            this.isAnimating = true;
            this.currentPage = pageNumber;
            this.updateSlider();
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 500);
        }
    }

    private generateBullets(): void {
        if (!this.bulletsContainer) return;
        
        this.bulletsContainer.innerHTML = '';
        
        if (this.totalPages > 1) {
            for (let i = 0; i < this.totalPages; i++) {
                const bullet = document.createElement('button');
                bullet.type = 'button';
                bullet.title = `Página ${i + 1}`;
                bullet.className = i + 1 === this.currentPage ? 'active' : '';
                bullet.addEventListener('click', () => this.goToPage(i + 1));
                this.bulletsContainer.appendChild(bullet);
            }
        }
        
        this.bullets = this.bulletsContainer.querySelectorAll('button');
    }

    private debounce(func: Function, wait: number): (...args: any[]) => void {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}
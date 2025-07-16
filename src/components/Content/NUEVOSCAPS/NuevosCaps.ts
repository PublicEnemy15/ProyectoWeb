interface SliderProps {
    initialPage?: number;
    itemsPerPage?: number;
}

interface SliderState {
    currentPage: number;
    totalItems: number;
    totalPages: number;
    itemWidth: number;
    gap: number;
    slideDistance: number;
    currentTransform: number; // Nuevo: para tracking preciso del transform
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

class NuevosCapsSliderController {
    private state: SliderState;
    private touchState: TouchState;
    private items: HTMLElement[];
    private slider: HTMLElement | null;
    private sliderWrapper: HTMLElement | null;
    private nextBtn: HTMLButtonElement | null;
    private prevBtn: HTMLButtonElement | null;
    private nextWrapper: HTMLElement | null;
    private prevWrapper: HTMLElement | null;
    private bulletsContainer: HTMLElement | null;
    private bullets: NodeListOf<HTMLButtonElement> | null = null;
    private itemsPerPage: number;
    private isAnimating: boolean = false;

    constructor(props: SliderProps = {}) {
        const {
            initialPage = 1,
            itemsPerPage = 4
        } = props;

        this.itemsPerPage = itemsPerPage;

        this.state = {
            currentPage: initialPage,
            totalItems: 0,
            totalPages: 0,
            itemWidth: 0,
            gap: 15,
            slideDistance: 0,
            currentTransform: 0
        };

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

        // Initialize DOM elements
        this.slider = document.querySelector('.nuevoscaps-slider .Slider-tape');
        this.sliderWrapper = document.querySelector('.nuevoscaps-slider .KITHSlider-sliderWrapper');
        const allItems = document.querySelectorAll<HTMLElement>('.nuevoscaps-slider .Slider-item');
        this.items = Array.from(allItems);
        
        // Calculate initial state
        this.state.totalItems = this.items.length;
        this.state.totalPages = Math.ceil(this.state.totalItems / this.itemsPerPage);
        
        // Get control elements
        this.nextBtn = document.querySelector('.KITHSlider-btnWrapper.next button');
        this.prevBtn = document.querySelector('.KITHSlider-btnWrapper.prev button');
        this.nextWrapper = document.querySelector('.KITHSlider-btnWrapper.next');
        this.prevWrapper = document.querySelector('.KITHSlider-btnWrapper.prev');
        this.bulletsContainer = document.querySelector('.KITHSlider-bullets');
        
        this.init();
    }

    private init(): void {
        this.waitForDimensions(() => {
            this.generateBullets();
            this.calculateDimensions();
            this.updateButtons();
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
        this.touchState.initialTransform = this.state.currentTransform;
        
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
        const threshold = this.state.itemWidth * 0.4; // Aumentado de 0.3 a 0.4
        const velocityThreshold = 0.5; // Aumentado de 0.3 a 0.5
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
            return -((this.state.totalPages - 1) * this.state.slideDistance);
        } else {
            // Móvil: calcular basado en el contenido total
            const totalWidth = this.state.totalItems * (this.state.itemWidth + this.state.gap) - this.state.gap;
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
        const currentTransform = this.state.currentTransform;
        const moveDistance = this.state.itemWidth + this.state.gap;
        const newTransform = currentTransform - moveDistance;
        const minTransform = this.getMinTransform();
        
        this.state.currentTransform = Math.max(minTransform, newTransform);
        
        if (this.slider) {
            this.slider.style.transform = `translateX(${this.state.currentTransform}px)`;
        }
        
        this.updateMobilePagination();
    }

    private smoothPrevPage(): void {
        if (window.innerWidth >= 768) {
            this.prevPage();
            return;
        }
        
        // Móvil: scroll continuo más suave
        const currentTransform = this.state.currentTransform;
        const moveDistance = this.state.itemWidth + this.state.gap;
        const newTransform = currentTransform + moveDistance;
        
        this.state.currentTransform = Math.min(0, newTransform);
        
        if (this.slider) {
            this.slider.style.transform = `translateX(${this.state.currentTransform}px)`;
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
            this.slider.style.transform = `translateX(${this.state.currentTransform}px)`;
        }
    }

    private updateMobilePagination(): void {
        // Actualizar la página actual basada en la posición del transform
        if (window.innerWidth < 768) {
            const itemsPerPage = this.getResponsiveItemsPerPage();
            const moveDistance = this.state.itemWidth + this.state.gap;
            const currentPageFloat = Math.abs(this.state.currentTransform) / moveDistance / itemsPerPage;
            this.state.currentPage = Math.max(1, Math.min(this.state.totalPages, Math.round(currentPageFloat) + 1));
        }
        
        this.updateButtons();
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

    private generateBullets(): void {
        if (!this.bulletsContainer) return;
        
        this.bulletsContainer.innerHTML = '';
        
        if (this.state.totalPages > 1) {
            for (let i = 0; i < this.state.totalPages; i++) {
                const bullet = document.createElement('button');
                bullet.type = 'button';
                bullet.title = `Página ${i + 1}`;
                bullet.className = i + 1 === this.state.currentPage ? 'active' : '';
                bullet.addEventListener('click', () => this.goToPage(i + 1));
                this.bulletsContainer.appendChild(bullet);
            }
        }
        
        this.bullets = this.bulletsContainer.querySelectorAll('button');
    }

    private calculateDimensions(): void {
        if (this.items.length > 0) {
            const firstItem = this.items[0];
            
            if (firstItem.offsetWidth === 0) {
                const computedStyle = window.getComputedStyle(firstItem);
                if (computedStyle.width && computedStyle.width !== 'auto') {
                    this.state.itemWidth = parseFloat(computedStyle.width);
                }
            } else {
                this.state.itemWidth = firstItem.offsetWidth;
            }
            
            const sliderTape = document.querySelector('.Slider-tape');
            if (sliderTape) {
                const gapValue = window.getComputedStyle(sliderTape).gap;
                this.state.gap = parseInt(gapValue) || this.getResponsiveGap();
            }
            
            const currentItemsPerPage = this.getResponsiveItemsPerPage();
            
            if (window.innerWidth >= 768) {
                // Desktop: comportamiento original
                this.state.slideDistance = currentItemsPerPage * (this.state.itemWidth + this.state.gap);
            } else {
                // Móvil: calcular basado en items individuales
                this.state.slideDistance = this.state.itemWidth + this.state.gap;
            }
            
            console.log('Dimensiones calculadas:', {
                itemWidth: this.state.itemWidth,
                gap: this.state.gap,
                slideDistance: this.state.slideDistance,
                itemsPerPage: currentItemsPerPage,
                isMobile: window.innerWidth < 768
            });
        }
    }

    private getResponsiveItemsPerPage(): number {
        return window.innerWidth >= 768 ? 4 : 2.2;
    }

    private getResponsiveGap(): number {
        return window.innerWidth >= 768 ? 15 : 10;
    }

    private handleResize(): void {
        this.calculateDimensions();
        
        const currentItemsPerPage = this.getResponsiveItemsPerPage();
        
        if (window.innerWidth >= 768) {
            // Desktop: comportamiento original
            this.state.totalPages = Math.ceil(this.state.totalItems / currentItemsPerPage);
            this.state.currentTransform = -((this.state.currentPage - 1) * this.state.slideDistance);
        } else {
            // Móvil: recalcular páginas basado en scroll continuo
            const totalWidth = this.state.totalItems * (this.state.itemWidth + this.state.gap) - this.state.gap;
            const containerWidth = this.sliderWrapper?.offsetWidth || window.innerWidth;
            const maxScroll = Math.max(0, totalWidth - containerWidth);
            this.state.totalPages = Math.ceil(maxScroll / this.state.slideDistance) || 1;
            
            // Ajustar transform actual si es necesario
            const minTransform = this.getMinTransform();
            this.state.currentTransform = Math.max(minTransform, this.state.currentTransform);
        }
        
        if (this.state.currentPage > this.state.totalPages) {
            this.state.currentPage = Math.max(1, this.state.totalPages);
        }
        
        this.generateBullets();
        this.updateSlider();
        this.resizeButtonsToImageContainer();
        this.setupTouchEvents();
    }

    private updateButtons(): void {
        // Solo mostrar botones en desktop
        if (window.innerWidth >= 768) {
            if (this.nextWrapper) {
                this.nextWrapper.classList.toggle('visible', 
                    this.state.currentPage < this.state.totalPages && this.state.totalPages > 1);
            }

            if (this.prevWrapper) {
                this.prevWrapper.classList.toggle('visible', 
                    this.state.currentPage > 1 && this.state.totalPages > 1);
            }
        }

        this.bullets?.forEach((bullet, index) => {
            bullet.classList.toggle('active', index + 1 === this.state.currentPage);
        });
    }

    public nextPage(): void {
        if (this.state.currentPage < this.state.totalPages && !this.isAnimating) {
            this.isAnimating = true;
            this.state.currentPage++;
            this.updateSlider();
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 500);
        }
    }

    public prevPage(): void {
        if (this.state.currentPage > 1 && !this.isAnimating) {
            this.isAnimating = true;
            this.state.currentPage--;
            this.updateSlider();
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 500);
        }
    }

    public goToPage(pageNumber: number): void {
        if (pageNumber >= 1 && pageNumber <= this.state.totalPages && !this.isAnimating) {
            this.isAnimating = true;
            this.state.currentPage = pageNumber;
            this.updateSlider();
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 500);
        }
    }

    private updateSlider(): void {
        if (!this.slider) return;
        
        let offset: number;
        
        if (window.innerWidth >= 768) {
            // Desktop: comportamiento original
            offset = (this.state.currentPage - 1) * this.state.slideDistance;
            this.state.currentTransform = -offset;
        } else {
            // Móvil: usar transform actual
            offset = Math.abs(this.state.currentTransform);
        }
        
        this.slider.style.transform = `translateX(-${offset}px)`;
        
        // Actualizar visibilidad de items (solo para desktop)
        if (window.innerWidth >= 768) {
            const currentItemsPerPage = this.getResponsiveItemsPerPage();
            const startIndex = (this.state.currentPage - 1) * currentItemsPerPage;
            const endIndex = startIndex + currentItemsPerPage;
            
            this.items.forEach((item, index) => {
                const isVisible = index >= startIndex && index < endIndex;
                item.classList.toggle('Slider-item-hidden', !isVisible);
                item.classList.toggle('Slider-item-right', !isVisible);
            });
        }
        
        this.updateButtons();
    }

    public addNewItems(newItemsHTML: string): void {
        if (!this.slider) return;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newItemsHTML;
        const newItems = Array.from(tempDiv.querySelectorAll<HTMLElement>('.Slider-item'));
        
        newItems.forEach(item => {
            this.slider?.appendChild(item);
        });
        
        const allItems = document.querySelectorAll<HTMLElement>('.Slider-item');
        this.items = Array.from(allItems).filter(item => {
            const hasHiddenClass = item.classList.contains('Slider-item-hidden');
            const titleElement = item.querySelector('.CapsWheelItem-title');
            const isEmpty = !titleElement?.textContent?.trim();
            return !hasHiddenClass && !isEmpty;
        });
        
        this.state.totalItems = this.items.length;
        const currentItemsPerPage = this.getResponsiveItemsPerPage();
        this.state.totalPages = Math.max(1, Math.ceil(this.state.totalItems / currentItemsPerPage));
        
        this.generateBullets();
        this.calculateDimensions();
        this.updateSlider();
        this.resizeButtonsToImageContainer();
    }

    public recalculate(): void {
        this.handleResize();
    }

    private debounce(func: Function, wait: number): (...args: any[]) => void {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}

export default NuevosCapsSliderController;
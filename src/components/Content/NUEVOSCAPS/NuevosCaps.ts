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
}

interface TouchState {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    isDragging: boolean;
    startTime: number;
    initialTransform: number;
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
            slideDistance: 0
        };

        this.touchState = {
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            isDragging: false,
            startTime: 0,
            initialTransform: 0
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

    // NUEVO: Configurar eventos táctiles
    private setupTouchEvents(): void {
        if (!this.slider) return;

        // Solo agregar eventos táctiles en móvil
        if (window.innerWidth < 768) {
            this.slider.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            this.slider.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            this.slider.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        }
    }

    // NUEVO: Manejar inicio del toque
    private handleTouchStart(e: TouchEvent): void {
        if (this.isAnimating) return;
        
        const touch = e.touches[0];
        this.touchState.startX = touch.clientX;
        this.touchState.startY = touch.clientY;
        this.touchState.currentX = touch.clientX;
        this.touchState.currentY = touch.clientY;
        this.touchState.isDragging = true;
        this.touchState.startTime = Date.now();
        
        // Obtener la transformación actual
        const currentTransform = this.slider?.style.transform || 'translateX(0px)';
        const match = currentTransform.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
        this.touchState.initialTransform = match ? parseFloat(match[1]) : 0;
        
        // Remover transición durante el arrastre
        if (this.slider) {
            this.slider.style.transition = 'none';
        }
    }

    // NUEVO: Manejar movimiento del toque
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
            
            // Aplicar límites para evitar arrastrar demasiado
            const maxTransform = 0;
            const minTransform = -((this.state.totalPages - 1) * this.state.slideDistance);
            
            const clampedTransform = Math.max(minTransform, Math.min(maxTransform, newTransform));
            
            if (this.slider) {
                this.slider.style.transform = `translateX(${clampedTransform}px)`;
            }
        }
    }

    // NUEVO: Manejar fin del toque
    private handleTouchEnd(e: TouchEvent): void {
        if (!this.touchState.isDragging || this.isAnimating) return;
        
        this.touchState.isDragging = false;
        
        // Restaurar transición
        if (this.slider) {
            this.slider.style.transition = 'transform 0.5s ease-in-out';
        }
        
        const deltaX = this.touchState.currentX - this.touchState.startX;
        const deltaTime = Date.now() - this.touchState.startTime;
        const velocity = Math.abs(deltaX) / deltaTime;
        
        // CAMBIO: Umbral más pequeño para móvil (50px o velocidad > 0.3)
        const threshold = 50;
        const shouldChangePage = Math.abs(deltaX) > threshold || velocity > 0.3;
        
        if (shouldChangePage) {
            if (deltaX > 0 && this.state.currentPage > 1) {
                // Swipe a la derecha - página anterior
                this.prevPage();
            } else if (deltaX < 0 && this.state.currentPage < this.state.totalPages) {
                // Swipe a la izquierda - página siguiente
                this.nextPage();
            } else {
                // Volver a la posición actual
                this.updateSlider();
            }
        } else {
            // Volver a la posición actual
            this.updateSlider();
        }
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
            
            // CAMBIO: Para móvil, calcular distancia basada en 1 item completo + gap
            if (window.innerWidth < 768) {
                this.state.slideDistance = this.state.itemWidth + this.state.gap;
            } else {
                this.state.slideDistance = currentItemsPerPage * (this.state.itemWidth + this.state.gap);
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
        return window.innerWidth >= 768 ? 4 : 1;
    }

    private getResponsiveGap(): number {
        return window.innerWidth >= 768 ? 15 : 10;
    }

    private handleResize(): void {
        this.calculateDimensions();
        
        const currentItemsPerPage = this.getResponsiveItemsPerPage();
        this.state.totalPages = Math.ceil(this.state.totalItems / currentItemsPerPage);
        
        if (this.state.currentPage > this.state.totalPages) {
            this.state.currentPage = Math.max(1, this.state.totalPages);
        }
        
        this.generateBullets();
        this.updateSlider();
        this.resizeButtonsToImageContainer();
        
        // Reconfigurar eventos táctiles según el tamaño de pantalla
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
            
            // Resetear flag después de la animación
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
            
            // Resetear flag después de la animación
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
            
            // Resetear flag después de la animación
            setTimeout(() => {
                this.isAnimating = false;
            }, 500);
        }
    }

    private updateSlider(): void {
        if (!this.slider) return;
        
        const offset = (this.state.currentPage - 1) * this.state.slideDistance;
        this.slider.style.transform = `translateX(-${offset}px)`;
        
        const currentItemsPerPage = this.getResponsiveItemsPerPage();
        const startIndex = (this.state.currentPage - 1) * currentItemsPerPage;
        const endIndex = startIndex + currentItemsPerPage;
        
        this.items.forEach((item, index) => {
            const isVisible = index >= startIndex && index < endIndex;
            item.classList.toggle('Slider-item-hidden', !isVisible);
            item.classList.toggle('Slider-item-right', !isVisible);
        });
        
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
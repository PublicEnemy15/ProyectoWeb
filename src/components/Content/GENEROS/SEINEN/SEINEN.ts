interface SliderConfig {
    itemsPerPage: number;
    sliderSelector: string;
    itemSelector: string;
    nextBtnSelector: string;
    prevBtnSelector: string;
    bulletsSelector: string;
}

export class SEINENSlider {
    private currentPage: number;
    private readonly itemsPerPage: number;
    private slider: HTMLElement | null;
    private items: HTMLElement[];
    private totalItems: number;
    private totalPages: number;
    private nextBtn: HTMLButtonElement | null;
    private prevBtn: HTMLButtonElement | null;
    private bulletsContainer: HTMLElement | null;
    private bullets: NodeListOf<HTMLButtonElement> | null = null;
    private itemWidth: number;
    private gap: number;
    private slideDistance: number;

    constructor(config: SliderConfig) {
        this.currentPage = 1;
        this.itemsPerPage = config.itemsPerPage;
        
        // Modifica los selectores para incluir la clase única
        this.slider = document.querySelector('.seinen-slider .Slider-tape');
        const allItems = document.querySelectorAll<HTMLElement>('.seinen-slider .Slider-item');
        this.items = Array.from(allItems);
        this.totalItems = this.items.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        
        this.nextBtn = document.querySelector('.seinen-slider .KITHSlider-btnWrapper.next button');
        this.prevBtn = document.querySelector('.seinen-slider .KITHSlider-btnWrapper.prev button');
        this.bulletsContainer = document.querySelector('.seinen-slider .KITHSlider-bullets');
        
        this.itemWidth = this.items[0]?.offsetWidth || 0;
        this.gap = 15;
        this.slideDistance = 0;
        
        this.init();
    }

    private init(): void {
        this.waitForDimensions(() => {
            this.generateBullets();
            this.updateButtons();
            this.calculateDimensions();
            this.updateSlider();
            this.resizeButtonsToImageContainer(); // Nueva función
            
            // Event listeners
            this.nextBtn?.addEventListener('click', () => this.nextPage());
            this.prevBtn?.addEventListener('click', () => this.prevPage());

            window.addEventListener('resize', this.debounce(() => {
                this.calculateDimensions();
                this.updateSlider();
                this.resizeButtonsToImageContainer(); // Redimensionar en resize
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

    private calculateDimensions(): void {
        if (this.items.length > 0) {
            const firstItem = this.items[0];
            this.itemWidth = firstItem.offsetWidth;
            
            if (this.slider) {
                const computedGap = window.getComputedStyle(this.slider).gap;
                this.gap = parseInt(computedGap) || 15;
            }
            
            this.slideDistance = (this.itemWidth + this.gap);
        }
    }

    // Nueva función para redimensionar botones basándose en el contenedor de imagen
    private resizeButtonsToImageContainer(): void {
        if (this.items.length === 0) return;
        
        // Buscar el contenedor de imagen en el primer item
        const firstItem = this.items[0];
        const imageContainer = firstItem.querySelector('.ui-series-poster-container') as HTMLElement;
        
        if (!imageContainer) return;
        
        // Obtener dimensiones del contenedor de imagen
        const containerRect = imageContainer.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        // Aplicar dimensiones a los wrappers de botones
        const prevWrapper = document.querySelector('.seinen-slider .KITHSlider-btnWrapper.prev') as HTMLElement;
        const nextWrapper = document.querySelector('.seinen-slider .KITHSlider-btnWrapper.next') as HTMLElement;
        
        if (prevWrapper) {
            prevWrapper.style.width = `${containerWidth}px`;
            prevWrapper.style.height = `${containerHeight}px`;
        }
        
        if (nextWrapper) {
            nextWrapper.style.width = `${containerWidth}px`;
            nextWrapper.style.height = `${containerHeight}px`;
        }
        
        // Opcional: Ajustar posición vertical para centrar con el contenedor de imagen
        this.adjustButtonVerticalPosition(imageContainer);
    }

    // Función auxiliar para centrar verticalmente los botones con el contenedor de imagen
    private adjustButtonVerticalPosition(imageContainer: HTMLElement): void {
        const containerRect = imageContainer.getBoundingClientRect();
        const sliderRect = this.slider?.getBoundingClientRect();
        
        if (!sliderRect) return;
        
        // Calcular offset vertical relativo al slider
        const verticalOffset = containerRect.top - sliderRect.top;
        
        const prevWrapper = document.querySelector('.seinen-slider .KITHSlider-btnWrapper.prev') as HTMLElement;
        const nextWrapper = document.querySelector('.seinen-slider .KITHSlider-btnWrapper.next') as HTMLElement;
        
        if (prevWrapper) {
            prevWrapper.style.top = `${verticalOffset}px`;
        }
        
        if (nextWrapper) {
            nextWrapper.style.top = `${verticalOffset}px`;
        }
    }

    private updateSlider(): void {
        if (!this.slider) return;
        
        const offset = (this.currentPage - 1) * this.slideDistance * this.itemsPerPage;
        this.slider.style.transform = `translateX(-${offset}px)`;
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        
        this.items.forEach((item, index) => {
            if (index >= startIndex && index < endIndex) {
                item.classList.remove('Slider-item-hidden', 'Slider-item-right');
            } else {
                item.classList.add('Slider-item-hidden', 'Slider-item-right');
            }
        });
        
        this.updateButtons();
    }

    private updateButtons(): void {
        if (this.nextBtn) {
            const nextWrapper = this.nextBtn.parentElement;
            nextWrapper?.classList.toggle('visible', this.currentPage < this.totalPages);
        }

        if (this.prevBtn) {
            const prevWrapper = this.prevBtn.parentElement;
            prevWrapper?.classList.toggle('visible', this.currentPage > 1);
        }

        this.bullets?.forEach((bullet, index) => {
            bullet.classList.toggle('active', index + 1 === this.currentPage);
        });
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

    private nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updateSlider();
        }
    }

    private prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateSlider();
        }
    }

    private goToPage(pageNumber: number): void {
        if (pageNumber >= 1 && pageNumber <= this.totalPages) {
            this.currentPage = pageNumber;
            this.updateSlider();
        }
    }

    private debounce(func: Function, wait: number): (...args: any[]) => void {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}
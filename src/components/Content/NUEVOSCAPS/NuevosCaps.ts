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
    itemsPerView: number; // Nuevo: Cantidad de ítems visibles por vez
}

class NuevosCapsSliderController {
    private state: SliderState;
    private items: HTMLElement[];
    private slider: HTMLElement | null;
    private nextBtn: HTMLButtonElement | null;
    private prevBtn: HTMLButtonElement | null;
    private nextWrapper: HTMLElement | null;
    private prevWrapper: HTMLElement | null;
    private bulletsContainer: HTMLElement | null;
    private bullets: NodeListOf<HTMLButtonElement> | null = null;
    private desktopItemsPerPage: number; // Para mantener 4 en PC

    constructor(props: SliderProps = {}) {
        const {
            initialPage = 1,
            itemsPerPage = 4 // Valor predeterminado para PC
        } = props;

        this.desktopItemsPerPage = itemsPerPage; // Guardamos el valor de PC

        this.state = {
            currentPage: initialPage,
            totalItems: 0,
            totalPages: 0,
            itemWidth: 0,
            gap: 15,
            slideDistance: 0,
            itemsPerView: 0 // Se calculará dinámicamente
        };

        // Initialize DOM elements
        this.slider = document.querySelector('.nuevoscaps-slider .Slider-tape');
        const allItems = document.querySelectorAll<HTMLElement>('.nuevoscaps-slider .Slider-item');
        this.items = Array.from(allItems);
        
        this.state.totalItems = this.items.length;
        
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
            this.handleResize(); // Llama a handleResize al inicio para calcular todo
            this.generateBullets();
            this.updateButtons();
            this.updateSlider();
            this.resizeButtonsToImageContainer();
            
            // Event listeners
            this.nextBtn?.addEventListener('click', () => this.nextPage());
            this.prevBtn?.addEventListener('click', () => this.prevPage());

            window.addEventListener('resize', this.debounce(() => {
                this.handleResize();
            }, 100)); // Debounce para optimizar el resize
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

    private resizeButtonsToImageContainer(): void {
        if (this.items.length === 0) return;
        
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
                bullet.title = `Item ${i + 1}`;
                bullet.className = i + 1 === this.state.currentPage ? 'active' : '';
                bullet.addEventListener('click', () => this.goToPage(i + 1));
                this.bulletsContainer.appendChild(bullet);
            }
        }
        
        this.bullets = this.bulletsContainer.querySelectorAll('button');
    }

    private calculateDimensions(): void {
        if (this.items.length > 0 && this.slider) {
            const firstItem = this.items[0];
            
            this.state.itemWidth = firstItem.offsetWidth;
            
            const sliderTape = document.querySelector('.Slider-tape');
            if (sliderTape) {
                // Obtenemos el gap real del CSS
                const computedGap = window.getComputedStyle(sliderTape).gap;
                this.state.gap = parseInt(computedGap) || 0; // Usamos 0 si no se puede parsear
            }

            // Determinar itemsPerView y totalPages basado en el tamaño de la ventana
            const isMobile = window.innerWidth < 768;

            if (isMobile) {
                // En móvil, queremos que un "swipe" mueva un solo item
                this.state.itemsPerView = 1;
                // Calculamos totalPages para que el último item quede al final
                // Si cada página es 1 item, totalPages es totalItems
                this.state.totalPages = this.state.totalItems;
                this.state.slideDistance = this.state.itemWidth + this.state.gap;
                
            } else {
                // En PC, mantenemos los 4 items por página
                this.state.itemsPerView = this.desktopItemsPerPage;
                // Calculamos el número de páginas redondeando hacia arriba
                this.state.totalPages = Math.ceil(this.state.totalItems / this.state.itemsPerView);
                this.state.slideDistance = (this.state.itemWidth * this.state.itemsPerView) + (this.state.gap * (this.state.itemsPerView - 1));
            }
            
            console.log('Dimensiones calculadas:', {
                itemWidth: this.state.itemWidth,
                gap: this.state.gap,
                itemsPerView: this.state.itemsPerView,
                slideDistance: this.state.slideDistance,
                totalItems: this.state.totalItems,
                totalPages: this.state.totalPages,
                currentPage: this.state.currentPage
            });
        }
    }

    private handleResize(): void {
        this.calculateDimensions();
        
        // Ajustar página actual si es necesario (para evitar ir a una página que ya no existe)
        if (this.state.currentPage > this.state.totalPages) {
            this.state.currentPage = Math.max(1, this.state.totalPages);
        }
        
        this.generateBullets();
        this.updateSlider();
        this.resizeButtonsToImageContainer();
    }

    private updateButtons(): void {
        if (this.nextWrapper) {
            this.nextWrapper.classList.toggle('visible', 
                this.state.currentPage < this.state.totalPages && this.state.totalPages > 1);
        }

        if (this.prevWrapper) {
            this.prevWrapper.classList.toggle('visible', 
                this.state.currentPage > 1 && this.state.totalPages > 1);
        }

        this.bullets?.forEach((bullet, index) => {
            bullet.classList.toggle('active', index + 1 === this.state.currentPage);
        });
    }

    public nextPage(): void {
        if (this.state.currentPage < this.state.totalPages) {
            this.state.currentPage++;
            this.updateSlider();
        }
    }

    public prevPage(): void {
        if (this.state.currentPage > 1) {
            this.state.currentPage--;
            this.updateSlider();
        }
    }

    public goToPage(pageNumber: number): void {
        if (pageNumber >= 1 && pageNumber <= this.state.totalPages) {
            this.state.currentPage = pageNumber;
            this.updateSlider();
        }
    }

    private updateSlider(): void {
        if (!this.slider) return;

        let offset = 0;
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            // En móvil, la distancia es por un item individual para un swipe más suave
            offset = (this.state.currentPage - 1) * (this.state.itemWidth + this.state.gap);

            // Ajuste para el último elemento en móvil: asegurar que quede al final del contenedor
            // Si estamos en la última página, ajustamos el offset para que el último item
            // quede visible y no haya espacio extra.
            const totalWidthOfItems = this.state.totalItems * this.state.itemWidth + (this.state.totalItems - 1) * this.state.gap;
            const sliderContainerWidth = this.slider.parentElement?.offsetWidth || 0;

            if (this.state.currentPage === this.state.totalPages && totalWidthOfItems > sliderContainerWidth) {
                // Calculamos el offset máximo posible para que el último elemento sea visible
                offset = totalWidthOfItems - sliderContainerWidth;
                // Nos aseguramos de que el offset no sea negativo
                offset = Math.max(0, offset);
            }
            
        } else {
            // En PC, la distancia es por el grupo de items por página
            offset = (this.state.currentPage - 1) * this.state.slideDistance;
        }
        
        // Aplicar la transición CSS. Añadir `transition` aquí si no está en CSS
        // Considera añadir 'transition: transform 0.5s ease-in-out;' a .Slider-tape en tu CSS
        this.slider.style.transform = `translateX(-${offset}px)`;
        
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
        this.handleResize(); // Recalcular todo después de añadir nuevos ítems
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
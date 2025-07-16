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
    private itemsPerPage: number;

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

        // Initialize DOM elements
        this.slider = document.querySelector('.nuevoscaps-slider .Slider-tape');
        const allItems = document.querySelectorAll<HTMLElement>('.nuevoscaps-slider .Slider-item');
        this.items = Array.from(allItems);
        
        // Calculate initial state - ahora cada página es 1 item
        this.state.totalItems = this.items.length;
        this.state.totalPages = this.state.totalItems; // Cada item es una página
        
        // Get control elements
        this.nextBtn = document.querySelector('.KITHSlider-btnWrapper.next button');
        this.prevBtn = document.querySelector('.KITHSlider-btnWrapper.prev button');
        this.nextWrapper = document.querySelector('.KITHSlider-btnWrapper.next');
        this.prevWrapper = document.querySelector('.KITHSlider-btnWrapper.prev');
        this.bulletsContainer = document.querySelector('.KITHSlider-bullets');
        
        this.init();
    }

    private init(): void {
        // Esperar a que las dimensiones estén disponibles
        this.waitForDimensions(() => {
            this.generateBullets();
            this.calculateDimensions();
            this.updateButtons();
            this.updateSlider();
            this.resizeButtonsToImageContainer();
            
            // Event listeners
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
        if (this.prevWrapper) {
            this.prevWrapper.style.width = `${containerWidth}px`;
            this.prevWrapper.style.height = `${containerHeight}px`;
        }
        
        if (this.nextWrapper) {
            this.nextWrapper.style.width = `${containerWidth}px`;
            this.nextWrapper.style.height = `${containerHeight}px`;
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
        if (this.items.length > 0) {
            const firstItem = this.items[0];
            
            // Verificar que el elemento tenga dimensiones
            if (firstItem.offsetWidth === 0) {
                // Si no tiene dimensiones, intentar forzar el cálculo
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
            
            // CAMBIO PRINCIPAL: Ahora la distancia es solo 1 item + gap
            this.state.slideDistance = this.state.itemWidth + this.state.gap;
            
            console.log('Dimensiones calculadas:', {
                itemWidth: this.state.itemWidth,
                gap: this.state.gap,
                slideDistance: this.state.slideDistance,
                totalItems: this.state.totalItems
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
        // Recalcular dimensiones
        this.calculateDimensions();
        
        // CAMBIO: Ahora totalPages siempre es igual a totalItems
        this.state.totalPages = this.state.totalItems;
        
        // Ajustar página actual si es necesario
        if (this.state.currentPage > this.state.totalPages) {
            this.state.currentPage = Math.max(1, this.state.totalPages);
        }
        
        // Regenerar bullets para el nuevo número de páginas
        this.generateBullets();
        
        // Actualizar slider
        this.updateSlider();
        
        // Redimensionar botones en resize
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
        
        // CAMBIO PRINCIPAL: Ahora el offset es simplemente (currentPage - 1) * slideDistance
        // Esto mueve el slider exactamente 1 item por vez
        const offset = (this.state.currentPage - 1) * this.state.slideDistance;
        this.slider.style.transform = `translateX(-${offset}px)`;
        
        // Opcional: Mantener la lógica de visibilidad si quieres ocultar items que no están "activos"
        // Pero ahora solo 1 item estará "activo" por página
        this.items.forEach((item, index) => {
            const isActive = index === (this.state.currentPage - 1);
            item.classList.toggle('Slider-item-active', isActive);
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
        
        // Recalculate valid items
        const allItems = document.querySelectorAll<HTMLElement>('.Slider-item');
        this.items = Array.from(allItems).filter(item => {
            const hasHiddenClass = item.classList.contains('Slider-item-hidden');
            const titleElement = item.querySelector('.CapsWheelItem-title');
            const isEmpty = !titleElement?.textContent?.trim();
            return !hasHiddenClass && !isEmpty;
        });
        
        // Update state - CAMBIO: totalPages = totalItems
        this.state.totalItems = this.items.length;
        this.state.totalPages = this.state.totalItems;
        
        this.generateBullets();
        this.calculateDimensions();
        this.updateSlider();
        
        // Redimensionar botones después de agregar nuevos items
        this.resizeButtonsToImageContainer();
    }

    // Método público para forzar recalculo (útil para debugging)
    public recalculate(): void {
        this.handleResize();
    }

    // Función debounce para optimizar performance en resize
    private debounce(func: Function, wait: number): (...args: any[]) => void {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}

export default NuevosCapsSliderController;
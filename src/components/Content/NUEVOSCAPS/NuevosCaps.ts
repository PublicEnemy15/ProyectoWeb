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
        // Esperar a que las dimensiones estén disponibles
        this.waitForDimensions(() => {
            this.generateBullets();
            this.calculateDimensions();
            this.updateButtons();
            this.updateSlider();
            
            // Event listeners
            this.nextBtn?.addEventListener('click', () => this.nextPage());
            this.prevBtn?.addEventListener('click', () => this.prevPage());

            window.addEventListener('resize', () => {
                this.handleResize();
            });
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
            
            // Calcular distancia basada en items per page responsive
            const currentItemsPerPage = this.getResponsiveItemsPerPage();
            this.state.slideDistance = currentItemsPerPage * (this.state.itemWidth + this.state.gap);
            
            console.log('Dimensiones calculadas:', {
                itemWidth: this.state.itemWidth,
                gap: this.state.gap,
                slideDistance: this.state.slideDistance,
                itemsPerPage: currentItemsPerPage
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
        
        // Recalcular total de páginas basado en items responsive
        const currentItemsPerPage = this.getResponsiveItemsPerPage();
        this.state.totalPages = Math.ceil(this.state.totalItems / currentItemsPerPage);
        
        // Ajustar página actual si es necesario
        if (this.state.currentPage > this.state.totalPages) {
            this.state.currentPage = Math.max(1, this.state.totalPages);
        }
        
        // Regenerar bullets para el nuevo número de páginas
        this.generateBullets();
        
        // Actualizar slider
        this.updateSlider();
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
        
        // Recalculate valid items
        const allItems = document.querySelectorAll<HTMLElement>('.Slider-item');
        this.items = Array.from(allItems).filter(item => {
            const hasHiddenClass = item.classList.contains('Slider-item-hidden');
            const titleElement = item.querySelector('.CapsWheelItem-title');
            const isEmpty = !titleElement?.textContent?.trim();
            return !hasHiddenClass && !isEmpty;
        });
        
        // Update state
        this.state.totalItems = this.items.length;
        const currentItemsPerPage = this.getResponsiveItemsPerPage();
        this.state.totalPages = Math.max(1, Math.ceil(this.state.totalItems / currentItemsPerPage));
        
        this.generateBullets();
        this.calculateDimensions();
        this.updateSlider();
    }

    // Método público para forzar recalculo (útil para debugging)
    public recalculate(): void {
        this.handleResize();
    }
}

export default NuevosCapsSliderController;
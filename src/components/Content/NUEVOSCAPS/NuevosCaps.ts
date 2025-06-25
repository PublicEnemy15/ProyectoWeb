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
    private bulletsContainer: HTMLElement | null;
    private bullets: NodeListOf<HTMLButtonElement> | null = null;

    constructor(props: SliderProps = {}) {
        const {
            initialPage = 1,
            itemsPerPage = 4
        } = props;

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
        this.state.totalPages = Math.ceil(this.state.totalItems / itemsPerPage);
        
        // Get control elements
        this.nextBtn = document.querySelector('.KITHSlider-btnWrapper.next button');
        this.prevBtn = document.querySelector('.KITHSlider-btnWrapper.prev button');
        this.bulletsContainer = document.querySelector('.KITHSlider-bullets');
        
        // Initialize slider
        if (this.items[0]) {
            this.state.itemWidth = this.items[0].offsetWidth;
            this.state.slideDistance = itemsPerPage * (this.state.itemWidth + this.state.gap);
        }

        this.init();
    }

private init(): void {
    // Esperar a que las dimensiones estén disponibles
    this.waitForDimensions(() => {
        this.generateBullets();
        this.updateButtons();
        this.calculateDimensions();
        this.updateSlider();
        
        // Event listeners
        this.nextBtn?.addEventListener('click', () => this.nextPage());
        this.prevBtn?.addEventListener('click', () => this.prevPage());

        window.addEventListener('resize', () => {
            this.calculateDimensions();
            this.updateSlider();
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
            this.state.gap = parseInt(gapValue) || 15;
        }
        
        this.state.slideDistance = 4 * (this.state.itemWidth + this.state.gap);
        
        console.log('Dimensiones calculadas:', {
            itemWidth: this.state.itemWidth,
            gap: this.state.gap,
            slideDistance: this.state.slideDistance
        });
    }
}

    private updateButtons(): void {
        if (this.nextBtn) {
            const nextWrapper = this.nextBtn.parentElement;
            nextWrapper?.classList.toggle('visible', 
                this.state.currentPage < this.state.totalPages && this.state.totalPages > 1);
        }

        if (this.prevBtn) {
            const prevWrapper = this.prevBtn.parentElement;
            prevWrapper?.classList.toggle('visible', 
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
        
        const startIndex = (this.state.currentPage - 1) * 4;
        const endIndex = startIndex + 4;
        
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
        this.state.totalPages = Math.max(1, Math.ceil(this.state.totalItems / 4));
        
        this.generateBullets();
        this.updateSlider();
    }
}

export default NuevosCapsSliderController;
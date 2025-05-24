// Types
interface User {
  email: string;
  password: string;
}

interface PasswordValidation {
  minLength: boolean;
  hasSpecialChar: boolean;
  hasUpperCase: boolean;
}

// User Management
class UserManager {
  private users: User[] = [];

  constructor() {
    this.initializeUsers();
  }

  private initializeUsers(): void {
    const usersFromStorage = localStorage.getItem('users');
    if (usersFromStorage) {
      this.users = JSON.parse(usersFromStorage);
    } else {
      this.users = [{ email: 'test@test.com', password: '$Test123$' }];
      localStorage.setItem('users', JSON.stringify(this.users));
    }
  }

  userExists(email: string): boolean {
    return this.users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  addUser(email: string, password: string): void {
    this.users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(this.users));
    console.log('Usuario registrado:', { email, password });
    console.log('Base de datos actual:', this.users);
  }

  // FUNCIÓN CORREGIDA
  validateLogin(email: string, password: string): boolean {
    console.log('Intentando login con:', email, password);
    console.log('Usuarios en memoria:', this.users);
    
    return this.users.some(
      (user: User) =>
        user.email.toLowerCase().trim() === email.toLowerCase().trim() &&
        user.password === password
    );
  }
}

// Validation Utils
const ValidationUtils = {
  email: (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  
  password: (password: string): PasswordValidation => ({
    minLength: password.length >= 8,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasUpperCase: /[A-Z]/.test(password)
  }),

  isPasswordValid: (validation: PasswordValidation): boolean =>
    validation.minLength && validation.hasSpecialChar && validation.hasUpperCase
};

// DOM Utils
const DOMUtils = {
  getElement: <T extends HTMLElement>(id: string): T | null => 
    document.getElementById(id) as T,
  
  querySelector: <T extends HTMLElement>(selector: string): T | null => 
    document.querySelector(selector) as T,
  
  querySelectorAll: <T extends HTMLElement>(selector: string): NodeListOf<T> => 
    document.querySelectorAll(selector) as NodeListOf<T>,

  toggleClass: (element: HTMLElement | null, className: string, condition?: boolean): void => {
    if (!element) return;
    condition !== undefined 
      ? element.classList.toggle(className, condition)
      : element.classList.toggle(className);
  },

  setStyle: (element: HTMLElement | null, styles: Partial<CSSStyleDeclaration>): void => {
    if (!element) return;
    Object.assign(element.style, styles);
  }
};

// UI Manager
class UIManager {
  private userManager = new UserManager();
  
  private get phases(): { [key: number]: HTMLElement | null } {
    return Object.fromEntries(
      [1, 2, 3, 4].map(i => [i, DOMUtils.getElement(`login-phase-${i}`)])
    );
  }

  showPhase(phaseNumber: number): void {
    Object.values(this.phases).forEach(phase => {
      if (phase) phase.style.display = 'none';
    });
    
    const targetPhase = this.phases[phaseNumber];
    if (targetPhase) targetPhase.style.display = 'flex';
  }

  closeModal(): void {
    Object.values(this.phases).forEach(phase => {
      if (phase) phase.style.display = 'none';
    });
    this.clearAllInputs();
  }

  clearAllInputs(): void {
    const inputIds = [
      'email-input-phase1', 'email-input-phase2', 'login-email-input',
      'password-input-1', 'password-input-2', 'login-password-input'
    ];
    
    inputIds.forEach(id => this.resetInput(id));
    this.resetCheckboxes();
    this.clearErrors();
    this.resetPasswordRequirements();
    this.disableButtons();
  }

  private resetInput(inputId: string): void {
    const input = DOMUtils.getElement<HTMLInputElement>(inputId);
    if (!input) return;
    
    input.value = '';
    if (inputId.includes('password')) {
      input.type = 'password';
      this.resetPasswordToggleIcon(input);
    }
    input.style.borderBottom = '2px solid #fff';
  }

  private resetCheckboxes(): void {
    const newCheckbox = DOMUtils.querySelector<HTMLInputElement>('.ui-checkbox-container .checkbox-input');
    const oldCheckbox = DOMUtils.getElement<HTMLInputElement>('terms-checkbox');
    const checkmark = DOMUtils.querySelector('.ui-checkbox-container .checkmark');
    
    [newCheckbox, oldCheckbox].forEach(cb => {
      if (cb) cb.checked = false;
    });
    
    if (checkmark) checkmark.classList.remove('checked');
  }

  private clearErrors(): void {
    this.clearEmailError();
    DOMUtils.querySelectorAll('.password-error').forEach(error => error.remove());
  }

  private resetPasswordRequirements(): void {
    const requirements = DOMUtils.querySelectorAll('.signup-password-strength-list-item');
    requirements.forEach(req => {
      req.classList.add('signup-password-strength-list-item-red');
      DOMUtils.setStyle(req as HTMLElement, { color: '', textDecoration: 'none' });
    });
  }

  private disableButtons(): void {
    const buttons = [
      '#login-phase-1 .arrow-container',
      '#login-phase-2 .arrow-container'
    ];
    buttons.forEach(selector => {
      const button = DOMUtils.querySelector(selector);
      if (button) button.classList.add('disabled');
    });
  }

  private resetPasswordToggleIcon(input: HTMLInputElement): void {
    const toggleButton = input.parentElement?.querySelector('.password-toggle, .password-input__toggle-btn');
    const icon = toggleButton?.querySelector('svg');
    if (icon) {
      icon.innerHTML = '<path d="M0 0h24v24H0z" fill="none"></path><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>';
    }
  }

  // Email validation
  showEmailError(message: string): void {
    const emailWrapper = DOMUtils.querySelector('#login-phase-1 .kodansha-email-wrapper');
    if (!emailWrapper) return;
    
    const existingError = emailWrapper.querySelector('.error');
    existingError?.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    emailWrapper.appendChild(errorDiv);
    
    const emailInput = DOMUtils.getElement('email-input-phase1');
    if (emailInput) emailInput.style.borderBottom = '2px solid #f5333f';
  }

  clearEmailError(): void {
    const emailWrapper = DOMUtils.querySelector('#login-phase-1 .kodansha-email-wrapper');
    const existingError = emailWrapper?.querySelector('.error');
    existingError?.remove();
    
    const emailInput = DOMUtils.getElement('email-input-phase1');
    if (emailInput) emailInput.style.borderBottom = '2px solid #fff';
  }

  // Password validation UI
  updatePasswordStrength(password: string): boolean {
    const validation = ValidationUtils.password(password);
    const requirements = DOMUtils.querySelectorAll('.signup-password-strength-list-item');
    
    if (requirements.length >= 3) {
      [validation.minLength, validation.hasSpecialChar, validation.hasUpperCase]
        .forEach((isValid, index) => {
          const req = requirements[index] as HTMLElement;
          const color = isValid ? '#4CAF50' : '';
          const decoration = isValid ? 'line-through' : 'none';
          
          DOMUtils.toggleClass(req, 'signup-password-strength-list-item-red', !isValid);
          DOMUtils.setStyle(req, { color, textDecoration: decoration });
        });
    }
    
    return ValidationUtils.isPasswordValid(validation);
  }

  validatePasswordConfirmation(): boolean {
    const password1 = DOMUtils.getElement<HTMLInputElement>('password-input-1')?.value || '';
    const password2 = DOMUtils.getElement<HTMLInputElement>('password-input-2')?.value || '';
    const confirmWrapper = DOMUtils.getElement('password-input-2')?.parentElement?.parentElement;
    
    if (!confirmWrapper) return false;
    
    const existingError = confirmWrapper.querySelector('.password-error');
    existingError?.remove();
    
    if (password2 && password1 !== password2) {
      const errorDiv = document.createElement('div');
      Object.assign(errorDiv, {
        className: 'password-error',
        textContent: 'Las contraseñas no coinciden'
      });
      DOMUtils.setStyle(errorDiv, {
        color: '#f5333f',
        fontSize: '12px',
        marginTop: '5px'
      });
      confirmWrapper.appendChild(errorDiv);
      
      const input2 = DOMUtils.getElement('password-input-2');
      if (input2) input2.style.borderBottom = '2px solid #f5333f';
      return false;
    } else if (password2) {
      const input2 = DOMUtils.getElement('password-input-2');
      if (input2) input2.style.borderBottom = '2px solid #fff';
      return true;
    }
    
    return password2 === '';
  }

  // Button state management
  updateContinueButton(): void {
    const emailInput = DOMUtils.getElement<HTMLInputElement>('email-input-phase1');
    const continueButton = DOMUtils.querySelector('#login-phase-1 .arrow-container');
    
    if (!emailInput || !continueButton) return;
    
    const isValid = ValidationUtils.email(emailInput.value.trim());
    DOMUtils.toggleClass(continueButton, 'disabled', !isValid);
    
    if (isValid) this.clearEmailError();
  }

  updateSignUpButton(): void {
    const password1 = DOMUtils.getElement<HTMLInputElement>('password-input-1')?.value || '';
    const password2 = DOMUtils.getElement<HTMLInputElement>('password-input-2')?.value || '';
    const checkboxInput = DOMUtils.querySelector<HTMLInputElement>('.ui-checkbox-container .checkbox-input') || 
                         DOMUtils.getElement<HTMLInputElement>('terms-checkbox');
    const signUpButton = DOMUtils.querySelector('#login-phase-2 .arrow-container');
    
    if (!signUpButton) return;
    
    const isPasswordValid = this.updatePasswordStrength(password1);
    const isPasswordMatch = password1 === password2 && password2 !== '';
    const isTermsAccepted = checkboxInput?.checked || false;
    
    console.log('Estado del botón Sign Up:', {
      isPasswordValid, isPasswordMatch, isTermsAccepted,
      checkboxFound: checkboxInput ? 'sí' : 'no',
      checkboxChecked: checkboxInput?.checked || 'no encontrado'
    });
    
    DOMUtils.toggleClass(signUpButton, 'disabled', !(isPasswordValid && isPasswordMatch && isTermsAccepted));
  }

  updateLoginButton(): void {
    const emailInput = DOMUtils.getElement<HTMLInputElement>('login-email-input');
    const passwordInput = DOMUtils.getElement<HTMLInputElement>('login-password-input');
    const loginButton = DOMUtils.querySelector('#login-phase-4 .arrow-container');
    
    if (!emailInput || !passwordInput || !loginButton) return;
    
    const isValid = this.userManager.validateLogin(emailInput.value.trim(), passwordInput.value);
    DOMUtils.toggleClass(loginButton, 'disabled', !isValid);
  }

  // Navigation
  nextPhase(phaseNumber: number): void {
    console.log(`Intentando ir a la fase ${phaseNumber}`);
    
    switch (phaseNumber) {
      case 2:
        this.handlePhase2Navigation();
        break;
      case 3:
        this.handlePhase3Navigation();
        break;
      default:
        this.showPhase(phaseNumber);
    }
  }

  private handlePhase2Navigation(): void {
    const emailInput = DOMUtils.getElement<HTMLInputElement>('email-input-phase1');
    const email = emailInput?.value.trim() || '';
    
    console.log(`Email ingresado: ${email}`);
    
    if (!ValidationUtils.email(email)) {
      console.log('Email no válido');
      this.showEmailError('Por favor, ingrese un email válido');
      return;
    }
    
    console.log('Email válido, verificando si existe...');
    
    if (this.userManager.userExists(email)) {
      console.log('Usuario existe, yendo a fase 4');
      const loginEmailInput = DOMUtils.getElement<HTMLInputElement>('login-email-input');
      if (loginEmailInput) loginEmailInput.value = email;
      this.showPhase(4);
    } else {
      console.log('Usuario no existe, yendo a fase 2');
      const phase2EmailInput = DOMUtils.getElement<HTMLInputElement>('email-input-phase2');
      if (phase2EmailInput) phase2EmailInput.value = email;
      this.clearEmailError();
      this.showPhase(2);
    }
  }

  private handlePhase3Navigation(): void {
    const signUpButton = DOMUtils.querySelector('#login-phase-2 .arrow-container');
    if (signUpButton?.classList.contains('disabled')) return;
    
    const email = DOMUtils.getElement<HTMLInputElement>('email-input-phase2')?.value || '';
    const password = DOMUtils.getElement<HTMLInputElement>('password-input-1')?.value || '';
    
    this.userManager.addUser(email, password);
    
    const verificationEmail = DOMUtils.getElement('verification-email');
    if (verificationEmail) verificationEmail.textContent = email;
    
    this.showPhase(3);
  }

  previousPhase(currentPhase: number): void {
    if (currentPhase > 1) {
      this.clearAllInputs();
      this.showPhase(currentPhase - 1);
    }
  }

  // Password toggle
  togglePassword(inputId: string, button: HTMLElement): void {
    const input = DOMUtils.getElement<HTMLInputElement>(inputId);
    const icon = button.querySelector('svg');
    
    if (!input || !icon) return;
    
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    
    const iconHTML = isPassword 
      ? '<path d="M0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0z" fill="none"></path><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"></path>'
      : '<path d="M0 0h24v24H0z" fill="none"></path><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>';
    
    icon.innerHTML = iconHTML;
  }

  // User actions
  loginUser(): void {
    const emailInput = DOMUtils.getElement<HTMLInputElement>('login-email-input');
    const passwordInput = DOMUtils.getElement<HTMLInputElement>('login-password-input');
    
    const email = emailInput?.value.trim() || '';
    const password = passwordInput?.value || '';
    
    if (this.userManager.validateLogin(email, password)) {
      alert('¡Login exitoso! Bienvenido.');
      this.closeModal();
    } else {
      alert('Email o contraseña incorrectos. Intente nuevamente.');
    }
  }

  goToHome(): void {
    console.log('Volviendo a la página de inicio (fase 1)');
    this.clearAllInputs();
    this.showPhase(1);
  }

  toggleCustomCheckbox(checkboxInput: HTMLInputElement, checkmark: HTMLElement): void {
    checkboxInput.checked = !checkboxInput.checked;
    DOMUtils.toggleClass(checkmark, 'checked', checkboxInput.checked);
    console.log('Checkbox toggled:', checkboxInput.checked);
    this.updateSignUpButton();
  }
}

// Initialize and setup event listeners
const uiManager = new UIManager();

// Event listener setup with delegation pattern
document.addEventListener('DOMContentLoaded', () => {
  const eventHandlers = {
    // Main login button
    '#login-button': () => uiManager.showPhase(1),
    
    // Close buttons
    '.auth-close-wrapper': () => uiManager.closeModal(),
    
    // Phase 1 continue button
    '#login-phase-1 .arrow-container': (e: Event) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      if (!target.classList.contains('disabled')) {
        uiManager.nextPhase(2);
      }
    },
    
    // Phase 2 sign up button
    '#login-phase-2 .arrow-container': (e: Event) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      if (!target.classList.contains('disabled')) {
        uiManager.nextPhase(3);
      }
    },
    
    // Phase 4 login button
    '#login-phase-4 .arrow-container': (e: Event) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      if (!target.classList.contains('disabled')) {
        uiManager.loginUser();
      }
    }
  };

  // Setup click handlers
  Object.entries(eventHandlers).forEach(([selector, handler]) => {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches(selector) || target.closest(selector)) {
        handler(e);
      }
    });
  });

  // Input event listeners
  const inputHandlers = {
    'email-input-phase1': () => uiManager.updateContinueButton(),
    'password-input-1': () => uiManager.updateSignUpButton(),
    'password-input-2': () => {
      uiManager.validatePasswordConfirmation();
      uiManager.updateSignUpButton();
    },
    'login-email-input': () => uiManager.updateLoginButton(),
    'login-password-input': () => uiManager.updateLoginButton()
  };

  Object.entries(inputHandlers).forEach(([inputId, handler]) => {
    const input = DOMUtils.getElement(inputId);
    input?.addEventListener('input', handler);
  });

  // Enter key handlers
  const enterHandlers = {
    'email-input-phase1': () => {
      const continueButton = DOMUtils.querySelector('#login-phase-1 .arrow-container');
      if (continueButton && !continueButton.classList.contains('disabled')) {
        uiManager.nextPhase(2);
      }
    },
    'login-password-input': () => {
      const loginButton = DOMUtils.querySelector('#login-phase-4 .arrow-container');
      if (loginButton && !loginButton.classList.contains('disabled')) {
        uiManager.loginUser();
      }
    }
  };

  Object.entries(enterHandlers).forEach(([inputId, handler]) => {
    const input = DOMUtils.getElement(inputId);
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handler();
    });
  });

  // Checkbox handlers
  const setupCheckboxHandlers = () => {
    const customCheckboxContainer = DOMUtils.querySelector('.ui-checkbox-container');
    if (customCheckboxContainer) {
      const checkboxInput = customCheckboxContainer.querySelector('.checkbox-input') as HTMLInputElement;
      const checkmark = customCheckboxContainer.querySelector('.checkmark') as HTMLElement;
      
      if (checkboxInput && checkmark) {
        customCheckboxContainer.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          uiManager.toggleCustomCheckbox(checkboxInput, checkmark);
        });
      }
    }
    
    const oldCheckbox = DOMUtils.getElement<HTMLInputElement>('terms-checkbox');
    if (oldCheckbox && !customCheckboxContainer) {
      oldCheckbox.addEventListener('change', () => uiManager.updateSignUpButton());
    }
  };

  setupCheckboxHandlers();

  // Password toggle handlers
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const toggleButton = target.closest('.password-input__toggle-btn, .password-toggle') as HTMLElement;
    
    if (toggleButton) {
      e.preventDefault();
      const inputContainer = toggleButton.parentElement;
      const input = inputContainer?.querySelector('input[type="password"], input[type="text"]') as HTMLInputElement;
      if (input) {
        uiManager.togglePassword(input.id, toggleButton);
      }
    }
  });

  // Back button handlers
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('auth-modal-cancel-text')) {
      e.preventDefault();
      for (let i = 2; i <= 4; i++) {
        const phase = DOMUtils.getElement(`login-phase-${i}`);
        if (phase?.style.display === 'flex') {
          uiManager.previousPhase(i);
          break;
        }
      }
    }
    
    // Home button
    if (target.textContent?.includes('página de inicio')) {
      e.preventDefault();
      uiManager.goToHome();
    }
  });
});

// Expose global functions for backward compatibility
declare global {
  interface Window {
    showPhase: (phase: number) => void;
    closeModal: () => void;
    nextPhase: (phase: number) => void;
    previousPhase: (phase: number) => void;
    goToHome: () => void;
    loginUser: () => void;
  }
}

window.showPhase = (phase: number) => uiManager.showPhase(phase);
window.closeModal = () => uiManager.closeModal();
window.nextPhase = (phase: number) => uiManager.nextPhase(phase);
window.previousPhase = (phase: number) => uiManager.previousPhase(phase);
window.goToHome = () => uiManager.goToHome();
window.loginUser = () => uiManager.loginUser();

// Make this file an external module to allow global augmentation
export {};
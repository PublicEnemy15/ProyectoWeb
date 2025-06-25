// Base de datos de usuarios (simulada) - usando variables en memoria
let users = [];
const usersFromStorage = localStorage.getItem('users');
if (usersFromStorage) {
  users = JSON.parse(usersFromStorage);
} else {
  users = [
    {
      email: 'test@test.com',
      password: '$Test123$'
    }
  ];
  localStorage.setItem('users', JSON.stringify(users));
}

// Función para validar email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para verificar si el usuario ya existe
function userExists(email) {
  return users.some(user => user.email.toLowerCase() === email.toLowerCase());
}

// Funciones de validación de contraseña
function validatePassword(password) {
  return {
    minLength: password.length >= 8,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasUpperCase: /[A-Z]/.test(password)
  };
}

function updatePasswordStrength(password) {
  const validation = validatePassword(password);
  const requirements = document.querySelectorAll('.signup-password-strength-list-item');
  
  if (requirements.length >= 3) {
    // Mínimo 8 caracteres
    if (validation.minLength) {
      requirements[0].classList.remove('signup-password-strength-list-item-red');
      requirements[0].style.color = '#4CAF50';
      requirements[0].style.textDecoration = 'line-through';
    } else {
      requirements[0].classList.add('signup-password-strength-list-item-red');
      requirements[0].style.color = '';
      requirements[0].style.textDecoration = 'none';
    }
    
    // Carácter especial
    if (validation.hasSpecialChar) {
      requirements[1].classList.remove('signup-password-strength-list-item-red');
      requirements[1].style.color = '#4CAF50';
      requirements[1].style.textDecoration = 'line-through';
    } else {
      requirements[1].classList.add('signup-password-strength-list-item-red');
      requirements[1].style.color = '';
      requirements[1].style.textDecoration = 'none';
    }
    
    // Mayúscula
    if (validation.hasUpperCase) {
      requirements[2].classList.remove('signup-password-strength-list-item-red');
      requirements[2].style.color = '#4CAF50';
      requirements[2].style.textDecoration = 'line-through';
    } else {
      requirements[2].classList.add('signup-password-strength-list-item-red');
      requirements[2].style.color = '';
      requirements[2].style.textDecoration = 'none';
    }
  }
  
  return validation.minLength && validation.hasSpecialChar && validation.hasUpperCase;
}

function validatePasswordConfirmation() {
  const password1 = document.getElementById('password-input-1').value;
  const password2 = document.getElementById('password-input-2').value;
  const confirmWrapper = document.querySelector('#password-input-2').parentElement.parentElement;
  
  // Remover error previo
  const existingError = confirmWrapper.querySelector('.password-error');
  if (existingError) {
    existingError.remove();
  }
  
  if (password2 && password1 !== password2) {
    // Mostrar error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'password-error';
    errorDiv.textContent = 'Las contraseñas no coinciden';
    errorDiv.style.color = '#f5333f';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '5px';
    confirmWrapper.appendChild(errorDiv);
    
    // Cambiar borde a rojo
    document.getElementById('password-input-2').style.borderBottom = '2px solid #f5333f';
    return false;
  } else if (password2) {
    // Restaurar borde normal
    document.getElementById('password-input-2').style.borderBottom = '2px solid #fff';
    return true;
  }
  
  return password2 === '';
}

function updateSignUpButton() {
  const password1 = document.getElementById('password-input-1').value;
  const password2 = document.getElementById('password-input-2').value;
  
  // Buscar el checkbox usando la nueva estructura
  const checkboxInput = document.querySelector('.ui-checkbox-container .checkbox-input') || 
                       document.getElementById('terms-checkbox');
  const signUpButton = document.querySelector('#login-phase-2 .arrow-container');
  
  const isPasswordValid = updatePasswordStrength(password1);
  const isPasswordMatch = password1 === password2 && password2 !== '';
  const isTermsAccepted = checkboxInput && checkboxInput.checked;
  
  console.log('Estado del botón Sign Up:', {
    isPasswordValid,
    isPasswordMatch,
    isTermsAccepted,
    checkboxFound: checkboxInput ? 'sí' : 'no',
    checkboxChecked: checkboxInput ? checkboxInput.checked : 'no encontrado'
  });
  
  if (isPasswordValid && isPasswordMatch && isTermsAccepted) {
    signUpButton.classList.remove('disabled');
  } else {
    signUpButton.classList.add('disabled');
  }
}

// Función para mostrar una fase específica
export function showPhase(phaseNumber) {
  // Ocultar todas las fases
  for (let i = 1; i <= 4; i++) {
    const phase = document.getElementById(`login-phase-${i}`);
    if (phase) {
      phase.style.display = 'none';
    }
  }
  
  // Mostrar la fase solicitada
  const targetPhase = document.getElementById(`login-phase-${phaseNumber}`);
  if (targetPhase) {
    targetPhase.style.display = 'flex';
  }
}

// Función para cerrar el modal
function closeModal() {
  for (let i = 1; i <= 4; i++) {
    const phase = document.getElementById(`login-phase-${i}`);
    if (phase) {
      phase.style.display = 'none';
    }
  }
  
  // Limpiar todos los inputs al cerrar
  clearAllInputs();
}

// Función para limpiar todos los inputs
function clearAllInputs() {
  const inputs = [
    'email-input-phase1',
    'email-input-phase2', 
    'login-email-input',
    'password-input-1',
    'password-input-2',
    'login-password-input'
  ];
  
  inputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.value = '';
      // Restaurar tipo de input a password si es un campo de contraseña
      if (inputId.includes('password')) {
        input.type = 'password';
        // Restaurar iconos de mostrar/ocultar
        const toggleButton = input.parentElement.querySelector('.password-toggle, .password-input__toggle-btn');
        if (toggleButton) {
          const icon = toggleButton.querySelector('svg');
          if (icon) {
            icon.innerHTML = '<path d="M0 0h24v24H0z" fill="none"></path><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>';
          }
        }
      }
      // Restaurar bordes normales
      input.style.borderBottom = '2px solid #fff';
    }
  });
  
  // Limpiar ambos tipos de checkbox
  const newCheckbox = document.querySelector('.ui-checkbox-container .checkbox-input');
  const oldCheckbox = document.getElementById('terms-checkbox');
  
  if (newCheckbox) {
    newCheckbox.checked = false;
    // Remover clase checked del checkmark
    const checkmark = document.querySelector('.ui-checkbox-container .checkmark');
    if (checkmark) {
      checkmark.classList.remove('checked');
    }
  }
  if (oldCheckbox) {
    oldCheckbox.checked = false;
  }
  
  // Limpiar errores
  clearEmailError();
  clearPasswordErrors();
  
  // Resetear requisitos de contraseña
  const requirements = document.querySelectorAll('.signup-password-strength-list-item');
  requirements.forEach(req => {
    req.classList.add('signup-password-strength-list-item-red');
    req.style.color = '';
    req.style.textDecoration = 'none';
  });
  
  // Deshabilitar botones
  const continueButton = document.querySelector('#login-phase-1 .arrow-container');
  if (continueButton) {
    continueButton.classList.add('disabled');
  }
  
  const signUpButton = document.querySelector('#login-phase-2 .arrow-container');
  if (signUpButton) {
    signUpButton.classList.add('disabled');
  }
}

// Función para limpiar errores de contraseña
function clearPasswordErrors() {
  const passwordErrors = document.querySelectorAll('.password-error');
  passwordErrors.forEach(error => error.remove());
}

// Función para ir a la siguiente fase
function nextPhase(phaseNumber) {
  console.log(`Intentando ir a la fase ${phaseNumber}`);
  
  if (phaseNumber === 2) {
    // Validar email antes de ir a la fase 2
    const emailInput = document.getElementById('email-input-phase1');
    const email = emailInput.value.trim();
    
    console.log(`Email ingresado: ${email}`);
    
    if (!validateEmail(email)) {
      console.log('Email no válido');
      showEmailError('Por favor, ingrese un email válido');
      return;
    }
    
    console.log('Email válido, verificando si existe...');
    
    // Verificar si el usuario ya existe
    if (userExists(email)) {
      console.log('Usuario existe, yendo a fase 4');
      // Si existe, ir a la fase 4 (login)
      const loginEmailInput = document.getElementById('login-email-input');
      if (loginEmailInput) {
        loginEmailInput.value = email;
      }
      showPhase(4);
      return;
    }
    
    console.log('Usuario no existe, yendo a fase 2');
    // Si no existe, continuar a la fase 2 (registro)
    const phase2EmailInput = document.getElementById('email-input-phase2');
    if (phase2EmailInput) {
      phase2EmailInput.value = email;
    }
    clearEmailError();
    showPhase(2);
    return;
  }
  
  if (phaseNumber === 3) {
    // Validar antes de ir a la fase 3
    const signUpButton = document.querySelector('#login-phase-2 .arrow-container');
    if (signUpButton.classList.contains('disabled')) {
      return; // No permitir continuar si el botón está deshabilitado
    }
    
    // Registrar nuevo usuario
    const email = document.getElementById('email-input-phase2').value;
    const password = document.getElementById('password-input-1').value;
    
    // Agregar usuario a la lista
    users.push({ email, password });
    // Guardar en localStorage
    localStorage.setItem('users', JSON.stringify(users));

    
    console.log('Usuario registrado:', { email, password });
    console.log('Base de datos actual:', users);
    
    // Mostrar email en la fase de verificación
    const verificationEmail = document.getElementById('verification-email');
    if (verificationEmail) {
      verificationEmail.textContent = email;
    }
    
    showPhase(3);
    return;
  }
  
  // Para otras fases
  console.log(`Mostrando fase ${phaseNumber}`);
  showPhase(phaseNumber);
}

// Función para ir a la fase anterior con limpieza
function previousPhase(currentPhase) {
  if (currentPhase > 1) {
    clearAllInputs();

    // Si estamos en la fase 4 (login), volver directamente a la fase 1 (inicio)
    if (currentPhase === 4) {
      showPhase(1);
      return;
    }

    // Limpiar los campos específicos de la fase actual antes de volver
    if (currentPhase === 2) {
      // Limpiar campos de la fase 2 (registro)
      const inputs = ['password-input-1', 'password-input-2'];
      inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
          input.value = '';
          input.type = 'password';
          input.style.borderBottom = '2px solid #fff';
        }
      });

      // Limpiar ambos tipos de checkbox
      const newCheckbox = document.querySelector('.ui-checkbox-container .checkbox-input');
      const oldCheckbox = document.getElementById('terms-checkbox');

      if (newCheckbox) {
        newCheckbox.checked = false;
        const checkmark = document.querySelector('.ui-checkbox-container .checkmark');
        if (checkmark) {
          checkmark.classList.remove('checked');
        }
      }
      if (oldCheckbox) {
        oldCheckbox.checked = false;
      }

      // Limpiar errores de contraseña
      clearPasswordErrors();

      // Resetear requisitos de contraseña
      const requirements = document.querySelectorAll('.signup-password-strength-list-item');
      requirements.forEach(req => {
        req.classList.add('signup-password-strength-list-item-red');
        req.style.color = '';
        req.style.textDecoration = 'none';
      });

      // Resetear iconos de mostrar/ocultar contraseña
      const toggleButtons = document.querySelectorAll('#login-phase-2 .password-input__toggle-btn');
      toggleButtons.forEach(button => {
        const icon = button.querySelector('svg');
        if (icon) {
          icon.innerHTML = '<path d="M0 0h24v24H0z" fill="none"></path><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>';
        }
      });

      // Deshabilitar botón de sign up
      const signUpButton = document.querySelector('#login-phase-2 .arrow-container');
      if (signUpButton) {
        signUpButton.classList.add('disabled');
      }
    }

    // Para otras fases (excepto la 4), ir a la anterior
    showPhase(currentPhase - 1);
  }
}
// Función para mostrar error en el email
function showEmailError(message) {
  const emailWrapper = document.querySelector('#login-phase-1 .kodansha-email-wrapper');
  
  // Remover error anterior si existe
  const existingError = emailWrapper.querySelector('.error');
  if (existingError) {
    existingError.remove();
  }
  
  // Crear y mostrar nuevo error
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error';
  errorDiv.textContent = message;
  emailWrapper.appendChild(errorDiv);
  
  // Cambiar el borde del input a rojo
  const emailInput = document.getElementById('email-input-phase1');
  emailInput.style.borderBottom = '2px solid #f5333f';
}

// Función para limpiar errores de email
function clearEmailError() {
  const emailWrapper = document.querySelector('#login-phase-1 .kodansha-email-wrapper');
  if (emailWrapper) {
    const existingError = emailWrapper.querySelector('.error');
    if (existingError) {
      existingError.remove();
    }
  }
  
  // Restaurar el borde normal
  const emailInput = document.getElementById('email-input-phase1');
  if (emailInput) {
    emailInput.style.borderBottom = '2px solid #fff';
  }
}

// Función para habilitar/deshabilitar el botón de continuar
function updateContinueButton() {
  const emailInput = document.getElementById('email-input-phase1');
  const continueButton = document.querySelector('#login-phase-1 .arrow-container');
  const email = emailInput.value.trim();
  
  if (validateEmail(email)) {
    continueButton.classList.remove('disabled');
    clearEmailError();
  } else {
    continueButton.classList.add('disabled');
  }
}

// Función para toggle de contraseña mejorada
function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  const icon = button.querySelector('svg');
  
  if (!input || !icon) return;
  
  if (input.type === 'password') {
    input.type = 'text';
    // Cambiar icono a "ocultar" (ojo tachado)
    icon.innerHTML = '<path d="M0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0z" fill="none"></path><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"></path>';
  } else {
    input.type = 'password';
    // Cambiar icono a "mostrar" (ojo normal)
    icon.innerHTML = '<path d="M0 0h24v24H0z" fill="none"></path><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>';
  }
}

// Función para login del usuario
function loginUser() {
  const emailInput = document.getElementById('login-email-input');
  const passwordInput = document.getElementById('login-password-input');
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  
  if (user) {
    alert('¡Login exitoso! Bienvenido.');
    closeModal();

    // Cambiar el texto y el comportamiento del botón de login a "Mi KITH"
    const loginBtn = document.getElementById('login-button');
    if (loginBtn) {
      loginBtn.textContent = 'Mi KITH';
      // Remueve cualquier event listener anterior
      loginBtn.onclick = null;
      // Asigna el nuevo comportamiento
      loginBtn.onclick = function() {
        window.location.href = '/cuenta';
      };
    }
    // Guardar estado en localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedEmail', user.email); 
  } else {
    alert('Email o contraseña incorrectos. Intente nuevamente.');
  }
}

// Función para ir a la página de inicio (desde fase 3)
function goToHome() {
  console.log('Volviendo a la página de inicio (fase 1)');
  // Limpiar todos los campos para empezar de nuevo
  clearAllInputs();
  // Mostrar la fase 1
  showPhase(1);
}

// Función para manejar el checkbox personalizado
function toggleCustomCheckbox(checkboxInput, checkmark) {
  checkboxInput.checked = !checkboxInput.checked;
  
  if (checkboxInput.checked) {
    checkmark.classList.add('checked');
  } else {
    checkmark.classList.remove('checked');
  }
  
  console.log('Checkbox toggled:', checkboxInput.checked);
  updateSignUpButton();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Event listener para el botón de login principal
  const loginButton = document.getElementById('login-button');
  if (loginButton) {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      loginButton.textContent = 'Mi KITH';
      loginButton.onclick = function() {
        window.location.href = '/cuenta';
      };
    } else {
      loginButton.onclick = function() {
        showPhase(1);
      };
    }
  }
  
  // Event listeners para los botones de cerrar
  const closeButtons = document.querySelectorAll('.auth-close-wrapper');
  closeButtons.forEach(button => {
    button.addEventListener('click', closeModal);
  });
  
  // Event listener para el input de email en fase 1
  const emailInputPhase1 = document.getElementById('email-input-phase1');
  if (emailInputPhase1) {
    emailInputPhase1.addEventListener('input', updateContinueButton);
    emailInputPhase1.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const continueButton = document.querySelector('#login-phase-1 .arrow-container');
        if (!continueButton.classList.contains('disabled')) {
          nextPhase(2);
        }
      }
    });
  }
  
  // Event listener específico para el botón de continuar en fase 1
  const continueButtonPhase1 = document.querySelector('#login-phase-1 .arrow-container');
  if (continueButtonPhase1) {
    continueButtonPhase1.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Botón continuar clickeado');
      if (!this.classList.contains('disabled')) {
        console.log('Botón habilitado, ejecutando nextPhase(2)');
        nextPhase(2);
      } else {
        console.log('Botón deshabilitado');
      }
    });
  }
  
  // Event listeners para los inputs de contraseña en fase 2
  const passwordInput1 = document.getElementById('password-input-1');
  if (passwordInput1) {
    passwordInput1.addEventListener('input', function() {
      updatePasswordStrength(this.value);
      updateSignUpButton();
    });
  }
  
  const passwordInput2 = document.getElementById('password-input-2');
  if (passwordInput2) {
    passwordInput2.addEventListener('input', function() {
      validatePasswordConfirmation();
      updateSignUpButton();
    });
  }
  
  // Event listeners para checkbox - soporte para ambas estructuras
  
  // Nuevo checkbox personalizado
  const customCheckboxContainer = document.querySelector('.ui-checkbox-container');
  if (customCheckboxContainer) {
    const checkboxInput = customCheckboxContainer.querySelector('.checkbox-input');
    const checkmark = customCheckboxContainer.querySelector('.checkmark');
    const label = customCheckboxContainer.querySelector('.checkbox-label');
    
    if (checkboxInput && checkmark) {
      // Event listener para el checkmark
      checkmark.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleCustomCheckbox(checkboxInput, checkmark);
      });
      
      // Event listener para el label
      if (label) {
        label.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          toggleCustomCheckbox(checkboxInput, checkmark);
        });
      }
      
      // Event listener para el contenedor completo
      customCheckboxContainer.addEventListener('click', function(e) {
        if (e.target === this || e.target === label || e.target === checkmark) {
          e.preventDefault();
          e.stopPropagation();
          toggleCustomCheckbox(checkboxInput, checkmark);
        }
      });
      
      // Event listener directo en el input (por si acaso)
      checkboxInput.addEventListener('change', function() {
        if (this.checked) {
          checkmark.classList.add('checked');
        } else {
          checkmark.classList.remove('checked');
        }
        updateSignUpButton();
      });
    }
  }
  
  // Fallback para checkbox antiguo
  const oldCheckbox = document.getElementById('terms-checkbox');
  if (oldCheckbox && !customCheckboxContainer) {
    oldCheckbox.addEventListener('change', function() {
      console.log('Old checkbox changed:', this.checked);
      updateSignUpButton();
    });
    
    oldCheckbox.addEventListener('click', function(e) {
      console.log('Old checkbox clicked:', this.checked);
      setTimeout(() => {
        updateSignUpButton();
      }, 10);
    });
  }
  
  // Event listener para el botón de Sign Up en fase 2
  const signUpButton = document.querySelector('#login-phase-2 .arrow-container');
  if (signUpButton) {
    signUpButton.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Sign Up button clicked, disabled?', this.classList.contains('disabled'));
      if (!this.classList.contains('disabled')) {
        nextPhase(3);
      }
    });
  }
  
  // Event listeners para botones de toggle de contraseña
  const passwordToggleButtons = document.querySelectorAll('.password-input__toggle-btn, .password-toggle');
  passwordToggleButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const inputContainer = this.parentElement;
      const input = inputContainer.querySelector('input[type="password"], input[type="text"]');
      if (input) {
        togglePassword(input.id, this);
      }
    });
  });
  
    // Event listener para el input de email en login
    const loginEmailInput = document.getElementById('login-email-input');
    if (loginEmailInput) {
      loginEmailInput.addEventListener('input', updateLoginButton);
    }

    // Event listener para el input de contraseña en login
    const loginPasswordInput = document.getElementById('login-password-input');
    if (loginPasswordInput) {
      loginPasswordInput.addEventListener('input', updateLoginButton);
      loginPasswordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          const loginButton = document.querySelector('#login-phase-4 .arrow-container');
          if (loginButton && !loginButton.classList.contains('disabled')) {
            loginUser();
          }
        }
      });
    }
  
  // Event listeners para botones "ATRÁS" específicos
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('auth-modal-cancel-text')) {
      e.preventDefault();
      // Determinar la fase actual y ir a la anterior
      for (let i = 2; i <= 4; i++) {
        const phase = document.getElementById(`login-phase-${i}`);
        if (phase && phase.style.display === 'flex') {
          previousPhase(i);
          break;
        }
      }
    }
  });
  
  // Event listener para el botón de login en la fase 4
  const loginButtonPhase4 = document.querySelector('#login-phase-4 .arrow-container');
  if (loginButtonPhase4) {
    loginButtonPhase4.addEventListener('click', function(e) {
      e.preventDefault();
      if (!this.classList.contains('disabled')) {
        loginUser();
      }
    });
  }
  
  // Event listener para el botón "Ir a la página de inicio" en la fase 3
  const goHomeButton = document.querySelector('#login-phase-3 .home-button, #login-phase-3 [onclick*="goToHome"]');
  if (goHomeButton) {
    goHomeButton.addEventListener('click', function(e) {
      e.preventDefault();
      goToHome();
    });
  }
  
  // También manejar si el botón tiene un onclick inline (respaldo)
  document.addEventListener('click', function(e) {
    if (e.target.textContent && e.target.textContent.includes('página de inicio')) {
      e.preventDefault();
      goToHome();
    }
  });
});

function updateLoginButton() {
  const emailInput = document.getElementById('login-email-input');
  const passwordInput = document.getElementById('login-password-input');
  const loginButton = document.querySelector('#login-phase-4 .arrow-container');
  if (!emailInput || !passwordInput || !loginButton) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Verifica si existe un usuario con ese email y contraseña
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (user) {
    loginButton.classList.remove('disabled');
  } else {
    loginButton.classList.add('disabled');
  }
}
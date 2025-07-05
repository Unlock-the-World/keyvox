// === Initial Setup ===
document.addEventListener('DOMContentLoaded', () => {
    // Determine language from localStorage or browser settings, allowing URL override
    let currentLang = localStorage.getItem('lang') 
        || ((navigator.language || navigator.userLanguage).startsWith('en') ? 'en' : 'ja');
    const hash = window.location.hash.toLowerCase();
    if (hash === '#en') {
        currentLang = 'en';
    } else if (hash === '#jp' || hash === '#ja') {
        currentLang = 'ja';
    }

    // === DOM Element Selectors ===
    const loginView = document.getElementById('login-view');
    const signupView = document.getElementById('signup-view');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    const forgotPasswordModalContent = forgotPasswordModal.querySelector('div');
    const langSwitcher = document.getElementById('language-switcher');
    const langToggle = document.getElementById('language-toggle');
    const langDropdown = document.getElementById('language-dropdown');
    const phoneBtn = document.getElementById('login-method-phone');
    const accountBtn = document.getElementById('login-method-account');
    const fieldContainer = document.getElementById('login-field-container');

    // === Internationalization (i18n) ===
    const updateUI = (lang) => {
        document.documentElement.lang = lang;
        currentLang = lang;
        localStorage.setItem('lang', lang);

        if (typeof i18n === 'undefined') {
            console.error('i18n dictionary not loaded. Make sure dic-signup.js is included.');
            return;
        }

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (i18n[key] && i18n[key][lang]) {
                el.innerHTML = i18n[key][lang];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
             if (i18n[key] && i18n[key][lang]) {
                el.placeholder = i18n[key][lang];
            }
        });
    };
    
    // === Language Switcher Logic ===
    const toggleLangDropdown = (show) => {
        if (show) {
            langDropdown.classList.remove('hidden');
            setTimeout(() => langDropdown.classList.remove('opacity-0', 'scale-95'), 10);
        } else {
            langDropdown.classList.add('opacity-0', 'scale-95');
            setTimeout(() => langDropdown.classList.add('hidden'), 200);
        }
    };
    if (langToggle) {
        langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLangDropdown(langDropdown.classList.contains('hidden'));
        });
    }

    document.addEventListener('click', (e) => {
        if (!langSwitcher.contains(e.target)) toggleLangDropdown(false);
    });

    if (langDropdown) {
        langDropdown.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.closest('a');
            if (target && target.dataset.lang) {
                updateUI(target.dataset.lang);
                langDropdown.querySelectorAll('a[data-lang]').forEach(link => link.classList.remove('active'));
                target.classList.add('active');
                const currentMethod = document.querySelector('.tab-button.active').id === 'login-method-phone' ? 'phone' : 'account';
                switchLoginMethod(currentMethod);
                toggleLangDropdown(false);
            }
        });
    }

    // === Modal and View Logic ===
    const openModal = (modal, content) => {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
        }, 10);
    };

    const closeModal = (modal, content) => {
        modal.classList.add('opacity-0');
        content.classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    };

    const showView = (viewToShow) => {
        loginView.classList.add('hidden');
        signupView.classList.add('hidden');
        viewToShow.classList.remove('hidden');
        viewToShow.classList.add('flex');
    };

    // View and modal switch event listeners
    const goToSignupPage = document.getElementById('go-to-signup-page');
    if (goToSignupPage) {
        goToSignupPage.addEventListener('click', (e) => { e.preventDefault(); showView(signupView); });
    }
    const goToLogin = document.getElementById('go-to-login');
    if (goToLogin) {
        goToLogin.addEventListener('click', (e) => { e.preventDefault(); showView(loginView); });
    }
    const goToForgotPassword = document.getElementById('go-to-forgot-password');
    if (goToForgotPassword) {
        goToForgotPassword.addEventListener('click', (e) => { e.preventDefault(); openModal(forgotPasswordModal, forgotPasswordModalContent); });
    }
    const closeForgotPasswordModal = document.getElementById('close-forgot-password-modal');
    if (closeForgotPasswordModal) {
        closeForgotPasswordModal.addEventListener('click', () => closeModal(forgotPasswordModal, forgotPasswordModalContent));
    }
    if (forgotPasswordModal) {
        forgotPasswordModal.addEventListener('click', (e) => { if (e.target === forgotPasswordModal) closeModal(forgotPasswordModal, forgotPasswordModalContent); });
    }

    // === Login Method Switching ===
    function switchLoginMethod(method) {
        phoneBtn.classList.toggle('active', method === 'phone');
        accountBtn.classList.toggle('active', method !== 'phone');
        
        if (method === 'phone') {
            fieldContainer.innerHTML = `
                <div class="input-group">
                    <label for="login-identifier" class="block text-sm font-bold text-gray-700 mb-2" data-i18n="loginMethodPhone"></label>
                    <div class="flex">
                        <select id="login-phone-country" class="custom-select pl-3 pr-10 py-3 text-base bg-gray-50 border border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/25 transition">
                            <option data-i18n="countryJapan"></option><option data-i18n="countryUS"></option><option data-i18n="countryUK"></option>
                        </select>
                        <input type="tel" id="login-identifier" name="identifier" inputmode="numeric" class="w-full px-4 py-3 text-base border border-gray-300 rounded-r-md focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/25 transition" data-i18n-placeholder="phonePlaceholder">
                    </div>
                </div>
                <p class="text-xs text-gray-500 mt-2" data-i18n="phoneInputNote"></p>`;
        } else {
            fieldContainer.innerHTML = `
                <div class="input-group">
                    <label for="login-identifier" class="block text-sm font-bold text-gray-700 mb-2" data-i18n="loginMethodUsername"></label>
                    <input type="text" id="login-identifier" name="identifier" class="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/25 transition" data-i18n-placeholder="usernamePlaceholder">
                </div>`;
        }
        // Re-apply translations to the new elements
        updateUI(currentLang);
    }
    if (phoneBtn) {
        phoneBtn.addEventListener('click', () => switchLoginMethod('phone'));
    }
    if (accountBtn) {
        accountBtn.addEventListener('click', () => switchLoginMethod('account'));
    }
    
    // === Form Validation Logic ===
    function validateOnBlur(input, regex, errorMsgKey, errorElementId) {
        if (!input) return;
        input.addEventListener('blur', () => {
            const errorElement = document.getElementById(errorElementId);
            if(errorElement) errorElement.remove();

            if (!input.value.trim() || (regex && !regex.test(input.value.trim()))) {
                input.classList.add('border-pink-500');
                const langMsg = i18n[errorMsgKey][currentLang];
                input.closest('.input-group, div').insertAdjacentHTML('afterend', `<p id="${errorElementId}" class="mt-1 text-sm text-pink-600">${langMsg}</p>`);
            } else {
                input.classList.remove('border-pink-500');
            }
        });
    }
    
    // Validation for all relevant fields
    validateOnBlur(document.getElementById('login-identifier'), null, 'validationPhoneRequired', 'login-identifier-error');
    validateOnBlur(document.getElementById('login-password'), null, 'validationPasswordRequired', 'login-password-error');
    validateOnBlur(document.getElementById('signup-phone'), /^[0-9]+$/, 'validationPhoneNumeric', 'signup-phone-error');
    validateOnBlur(document.getElementById('signup-verify-code'), null, 'validationCodeRequired', 'signup-verify-code-error');
    validateOnBlur(document.getElementById('signup-password-field'), null, 'validationPasswordRequired', 'signup-password-error');
    validateOnBlur(document.getElementById('reset-phone'), /^[0-9]+$/, 'validationPhoneNumeric', 'reset-phone-error');
    validateOnBlur(document.getElementById('reset-verify-code'), null, 'validationCodeRequired', 'reset-verify-code-error');
    validateOnBlur(document.getElementById('password-reset-field'), null, 'validationPasswordRequired', 'reset-password-error');

    function validatePasswordMatch(pass1, pass2, errorElementId) {
        if (!pass2) return;
        pass2.addEventListener('blur', () => {
            const errorElement = document.getElementById(errorElementId);
            if(errorElement) errorElement.remove();

            if (pass2.value && pass1.value !== pass2.value) {
                pass2.classList.add('border-pink-500');
                const langMsg = i18n['validationPasswordMismatch'][currentLang];
                pass2.closest('div').insertAdjacentHTML('afterend', `<p id="${errorElementId}" class="mt-1 text-sm text-pink-600">${langMsg}</p>`);
            } else {
                pass2.classList.remove('border-pink-500');
            }
        });
    }
    validatePasswordMatch(document.getElementById('signup-password-field'), document.getElementById('signup-password-confirm'), 'signup-password-confirm-error');
    validatePasswordMatch(document.getElementById('password-reset-field'), document.getElementById('password-reset-confirm'), 'reset-password-confirm-error');

    // === Button State Logic ===
    function toggleButtonState(button, conditions) {
        const allConditionsMet = conditions.every(cond => cond());
        button.disabled = !allConditionsMet;
        button.classList.toggle('btn-enabled', allConditionsMet);
        button.classList.toggle('btn-disabled', !allConditionsMet);
    }
    
    // Enable/disable "Send Code" and "Submit" buttons
    const signupInputs = [document.getElementById('signup-phone'), document.getElementById('signup-recaptcha')];
    signupInputs.forEach(el => { if (el) el.addEventListener('input', () => toggleButtonState(document.getElementById('send-code-signup'), [() => /^[0-9]+$/.test(signupInputs[0].value), () => signupInputs[1].checked])); });
    
    const signupSubmitInputs = [document.getElementById('signup-verify-code'), document.getElementById('signup-password-field'), document.getElementById('signup-password-confirm')];
    signupSubmitInputs.forEach(el => { if (el) el.addEventListener('input', () => toggleButtonState(document.getElementById('submit-signup'), [() => signupSubmitInputs[0].value, () => signupSubmitInputs[1].value, () => signupSubmitInputs[1].value === signupSubmitInputs[2].value])); });

    const resetInputs = [document.getElementById('reset-phone'), document.getElementById('reset-recaptcha')];
    resetInputs.forEach(el => { if (el) el.addEventListener('input', () => toggleButtonState(document.getElementById('send-code-reset'), [() => /^[0-9]+$/.test(resetInputs[0].value), () => resetInputs[1].checked])); });

    const resetSubmitInputs = [document.getElementById('reset-verify-code'), document.getElementById('password-reset-field'), document.getElementById('password-reset-confirm')];
    resetSubmitInputs.forEach(el => { if (el) el.addEventListener('input', () => toggleButtonState(document.getElementById('submit-reset-password'), [() => resetSubmitInputs[0].value, () => resetSubmitInputs[1].value, () => resetSubmitInputs[1].value === resetSubmitInputs[2].value])); });

    // === Form Submission Logic ===
    function handleFormSubmit(formId, redirectUrl) {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                document.getElementById('loading-overlay').classList.remove('hidden');
                setTimeout(() => { window.location.href = redirectUrl; }, 1200);
            });
        }
    }
    handleFormSubmit('login-form', 'index.html');
    handleFormSubmit('signup-form', 'keyvox-ps.html#step3');

    // === Initialization ===
    updateUI(currentLang);
    const currentLangLink = document.querySelector(`#language-dropdown a[data-lang="${currentLang}"]`);
    if (currentLangLink) {
        currentLangLink.classList.add('active');
    }
    switchLoginMethod('phone'); 
    showView((window.location.hash.includes('signup')) ? signupView : loginView);

    // Initialize button states (all disabled initially)
    toggleButtonState(document.getElementById('send-code-signup'), [() => false]);
    toggleButtonState(document.getElementById('submit-signup'), [() => false]);
    toggleButtonState(document.getElementById('send-code-reset'), [() => false]);
    toggleButtonState(document.getElementById('submit-reset-password'), [() => false]);
});

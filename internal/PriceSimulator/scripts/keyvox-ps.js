/* ==========================================
   keyvox-ps.js – JS for Price Simulator
   Author: Ken Okamoto
   Last updated: 2025-07-05
   ========================================== */

// --- i18n & Global State ---
let currentLang = localStorage.getItem('lang') 
    || ((navigator.language || navigator.userLanguage).startsWith('en') ? 'en' : 'ja');
window.isTrialLater = false;
window.skipVerificationModal = false;
let lastTotal = 0;
let validateSignupForm; // Will be defined inside initializeApp

// --- Language Switcher Active State Handling ---
function updateLanguageSwitcherActive(lang) {
    const langOptions = document.querySelectorAll('#language-options button');
    langOptions.forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`#language-options button[data-lang-code="${lang}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

/**
 * Updates the UI with text from the dictionary for the selected language.
 * @param {string} lang - The language code ('ja' or 'en').
 */
function updateLanguage(lang) {
    // ADDED: Add dictionary entry for the new step if it doesn't exist
    if (window.dictionary) {
        if (window.dictionary.ja && !window.dictionary.ja.steps_signup) {
            window.dictionary.ja.steps_signup = '新規登録';
        }
        if (window.dictionary.en && !window.dictionary.en.steps_signup) {
            window.dictionary.en.steps_signup = 'Sign Up';
        }
    }

    if (!window.dictionary || !window.dictionary[lang]) {
        console.error(`Dictionary for language "${lang}" not found.`);
        return;
    }
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    
    updateLanguageSwitcherActive(lang); // Update the active language button style

    const dict = window.dictionary[lang];

    const translateElement = (el) => {
        const key = el.getAttribute('data-i18n');
        const htmlKey = el.getAttribute('data-i18n-html');
        const placeholderKey = el.getAttribute('data-i18n-placeholder');
        const titleKey = el.getAttribute('data-i18n-title');

        if (key && dict[key]) el.textContent = dict[key];
        if (htmlKey && dict[htmlKey]) el.innerHTML = dict[htmlKey];
        if (placeholderKey && dict[placeholderKey]) el.placeholder = dict[placeholderKey];
        if (titleKey && dict[titleKey]) document.title = dict[titleKey];
    };
    
    document.querySelectorAll('[data-i18n], [data-i18n-html], [data-i18n-placeholder], [data-i18n-title]').forEach(translateElement);
}

// --- Main Application Logic ---
function initializeApp() {
    
    // --- Language Switcher Logic (UPDATED FOR ANIMATION) ---
    const langSwitcher = document.getElementById('language-switcher');
    const langToggle = document.getElementById('language-switcher-toggle');
    const langMenu = document.getElementById('language-options');

    const toggleLangDropdown = (show) => {
        if (!langMenu) return;
        if (show) {
            langMenu.classList.remove('hidden');
            setTimeout(() => langMenu.classList.remove('opacity-0', 'scale-95'), 10);
        } else {
            langMenu.classList.add('opacity-0', 'scale-95');
            setTimeout(() => langMenu.classList.add('hidden'), 200);
        }
    };
    
    if(langToggle) {
        langToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLangDropdown(langMenu.classList.contains('hidden'));
        });
    }

    document.addEventListener('click', (e) => {
        if (langSwitcher && !langSwitcher.contains(e.target)) {
            toggleLangDropdown(false);
        }
    });

    if(langMenu) {
        langMenu.addEventListener('click', (e) => {
            const targetButton = e.target.closest('button[data-lang-code]');
            if (targetButton) {
                const newLang = targetButton.getAttribute('data-lang-code');
                updateLanguage(newLang);
                toggleLangDropdown(false); // Close dropdown after selection
            }
        });
    }

    // --- DOM Element References ---
    const stepContentContainer = document.getElementById('step-content');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const footerTotalContainer = document.getElementById('footer-total-container');
    const stepNavContainer = document.querySelector('nav[aria-label="Signup Steps"]');

    // --- Step Navigation HTML ---
    if(stepNavContainer) {
        stepNavContainer.innerHTML = `
            <span class="step-item active" data-step="1" data-i18n="steps_plan"></span>
            <span class="text-slate-400">&gt;</span>
            <span class="step-item" data-step="2" data-i18n="steps_signup"></span>
            <span class="text-slate-400">&gt;</span>
            <span class="step-item" data-step="3" data-i18n="steps_account"></span>
            <span class="text-slate-400">&gt;</span>
            <span class="step-item" data-step="4" data-i18n="steps_confirm"></span>
            <span class="text-slate-400">&gt;</span>
            <span class="step-item" data-step="5" data-i18n="steps_complete"></span>
        `;
    }

    // --- Step HTML Templates ---
    const stepTemplates = {
        1: `
            <div class="fade-in" id="plan-configurator">
                <div class="text-lg font-bold p-4 bg-sky-50 rounded-lg mb-6 text-slate-700" data-i18n="plan_base_price_info"></div>
                <div class="space-y-8">
                    <div>
                        <h2 class="text-xl font-semibold mb-4 text-slate-700" data-i18n="plan_step1_title"></h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label class="option-card p-4 rounded-lg cursor-pointer flex flex-col justify-between">
                                <input type="radio" name="serviceType" value="keyvox" class="hidden" checked>
                                <div>
                                    <span class="bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full" data-i18n="plan_free_trial_badge"></span>
                                    <h3 class="font-bold text-slate-800 mt-2" data-i18n="plan_service_keyvox_title"></h3>
                                    <p class="text-sm text-slate-600 mt-1" data-i18n="plan_service_keyvox_desc"></p>
                                </div>
                                <div class="text-2xl font-bold text-sky-500 mt-4"><span data-i18n="plan_service_keyvox_price"></span><span class="text-xs font-normal text-slate-500" data-i18n="plan_price_unit"></span></div>
                                <button onclick="openAIChat()" class="mt-3 w-auto px-4 text-xs font-semibold text-slate-600 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full py-2 shadow hover:shadow-md transform hover:-translate-y-0.5 transition duration-300 mx-auto block">
                                  <span data-i18n="ai_chat_button">🚀 AIと相談する</span>
                                </button>
                            </label>
                            <label class="option-card p-4 rounded-lg cursor-pointer flex flex-col justify-between">
                                <input type="radio" name="serviceType" value="api" class="hidden">
                                 <div>
                                    <span class="bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full" data-i18n="plan_free_trial_badge"></span>
                                    <h3 class="font-bold text-slate-800 mt-2" data-i18n="plan_service_api_title"></h3>
                                    <p class="text-sm text-slate-600 mt-1" data-i18n="plan_service_api_desc"></p>
                                </div>
                                <div class="text-2xl font-bold text-sky-500 mt-4"><span data-i18n="plan_service_api_price"></span><span class="text-xs font-normal text-slate-500" data-i18n="plan_price_unit"></span></div>
                                <button onclick="openAIChat()" class="mt-3 w-auto px-4 text-xs font-semibold text-slate-600 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full py-2 shadow hover:shadow-md transform hover:-translate-y-0.5 transition duration-300 mx-auto block">
                                  <span data-i18n="ai_chat_button">🚀 AIと相談する</span>
                                </button>
                            </label>
                        </div>
                        <div class="flex items-center justify-center gap-4 mt-6 p-4 bg-slate-50 rounded-lg">
                             <label for="quantity" class="font-bold" data-i18n="plan_lock_quantity"></label>
                             <div class="flex items-center">
                                <button type="button" id="quantity-minus" class="w-10 h-10 text-2xl font-bold text-sky-500 bg-white border-2 border-sky-500 rounded-full flex items-center justify-center hover:bg-sky-50">-</button>
                                <input type="number" id="quantity" value="1" min="1" class="w-20 text-center text-xl font-bold border-0 bg-transparent focus:ring-0">
                                <button type="button" id="quantity-plus" class="w-10 h-10 text-2xl font-bold text-sky-500 bg-white border-2 border-sky-500 rounded-full flex items-center justify-center hover:bg-sky-50">+</button>
                             </div>
                        </div>
                    </div>
                    <div id="pack-selection-container">
                        <h2 class="text-xl font-semibold mb-4 text-slate-700" data-i18n="plan_step2_title"></h2>
                        <div class="space-y-4">
                            <label class="option-card p-4 rounded-lg cursor-pointer flex items-start">
                                <input type="radio" name="pack" value="office" class="hidden">
                                <div class="flex-grow w-full">
                                    <div class="flex items-start justify-between w-full">
                                        <div>
                                            <span class="bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full" data-i18n="plan_free_trial_badge"></span>
                                            <h3 class="font-bold text-slate-800 mt-2" data-i18n="plan_pack_office_title"></h3>
                                            <ul class="features text-left text-xs text-slate-600 list-disc pl-5 space-y-1 mt-2">
                                                <li data-i18n="plan_pack_office_feature_1"></li>
                                                <li data-i18n="plan_pack_office_feature_2"></li>
                                                <li data-i18n="plan_pack_office_feature_3"></li>
                                                <li data-i18n="plan_pack_office_feature_4"></li>
                                                <li data-i18n="plan_pack_office_feature_5"></li>
                                            </ul>
                                        </div>
                                        <div class="flex flex-col items-center mt-4 ml-6">
                                            <div class="text-2xl font-bold text-sky-500" data-i18n="plan_pack_office_price"></div>
                                            <span class="text-xs font-normal text-slate-500" data-i18n="plan_pack_price_suffix"></span>
                                            <button onclick="openAIChat()" class="mt-3 w-auto px-4 text-xs font-semibold text-slate-600 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full py-2 shadow hover:shadow-md transform hover:-translate-y-0.5 transition duration-300">
                                              <span data-i18n="ai_chat_button">🚀 AIと相談する</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </label>
                            <label class="option-card p-4 rounded-lg cursor-pointer flex items-start">
                                <input type="radio" name="pack" value="hotel" class="hidden">
                                <div class="flex-grow w-full">
                                    <div class="flex items-start justify-between w-full">
                                        <div>
                                            <span class="bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full" data-i18n="plan_free_trial_badge"></span>
                                            <h3 class="font-bold text-slate-800 mt-2" data-i18n="plan_pack_hotel_title"></h3>
                                            <ul class="features text-left text-xs text-slate-600 list-disc pl-5 space-y-1 mt-2">
                                                <li data-i18n="plan_pack_hotel_feature_1"></li>
                                                <li data-i18n="plan_pack_hotel_feature_2"></li>
                                                <li data-i18n="plan_pack_hotel_feature_3"></li>
                                            </ul>
                                        </div>
                                        <div class="flex flex-col items-center mt-4 ml-6">
                                            <div class="text-2xl font-bold text-sky-500" data-i18n="plan_pack_hotel_price"></div>
                                            <span class="text-xs font-normal text-slate-500" data-i18n="plan_pack_price_suffix"></span>
                                            <button onclick="openAIChat()" class="mt-3 w-auto px-4 text-xs font-semibold text-slate-600 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full py-2 shadow hover:shadow-md transform hover:-translate-y-0.5 transition duration-300">
                                              <span data-i18n="ai_chat_button">🚀 AIと相談する</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </label>
                            <label class="option-card best-value relative p-4 rounded-lg cursor-pointer flex items-start">
                                <span class="best-value-badge" data-i18n="plan_best_value_badge"></span>
                                <input type="radio" name="pack" value="business" class="hidden">
                                <div class="flex-grow w-full pt-4">
                                    <div class="flex items-start justify-between w-full">
                                        <div>
                                            <span class="bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full" data-i18n="plan_free_trial_badge"></span>
                                            <h3 class="font-bold text-slate-800 mt-2" data-i18n="plan_pack_business_title"></h3>
                                            <ul class="features text-left text-xs text-slate-600 list-disc pl-5 space-y-1 mt-2">
                                                <li data-i18n="plan_pack_business_feature_1"></li>
                                                <li data-i18n="plan_pack_business_feature_2"></li>
                                                <li data-i18n="plan_pack_business_feature_3"></li>
                                                <li data-i18n="plan_pack_business_feature_4"></li>
                                                <li data-i18n="plan_pack_business_feature_5"></li>
                                            </ul>
                                        </div>
                                        <div class="flex flex-col items-center mt-4 ml-6">
                                            <div class="text-2xl font-bold text-sky-500" data-i18n="plan_pack_business_price"></div>
                                            <span class="text-xs font-normal text-slate-500" data-i18n="plan_pack_price_suffix"></span>
                                            <button onclick="openAIChat()" class="mt-3 w-auto px-4 text-xs font-semibold text-slate-600 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full py-2 shadow hover:shadow-md transform hover:-translate-y-0.5 transition duration-300">
                                              <span data-i18n="ai_chat_button">🚀 AIと相談する</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div class="mt-6 text-center">
                      <a href="#" id="trial-later-link" class="text-sky-500 font-semibold hover:text-sky-700" data-i18n="plan_trial_later_link"></a>
                    </div>
                </div>
            </div>
        `,
        2: `
            <div class="fade-in" id="method-select-view">
                <h1 class="text-2xl font-bold text-slate-800 tracking-tight" data-i18n="account_tab_login"></h1>
                <p class="mt-2 text-slate-600 text-sm mb-8" data-i18n="login_subtitle"></p>
                <div class="space-y-3 w-full max-w-xs mx-auto mt-20">
                    <button id="login-with-keyvox-btn" class="w-full flex items-center justify-center gap-3 py-4 px-4 rounded-lg shadow-sm btn-primary text-white">
                        <span class="font-semibold" data-i18n="login_with_keyvox"></span>
                    </button>
                    <div class="flex items-center justify-center gap-4 py-2 w-full">
                        <div class="flex-grow h-px bg-gray-200"></div>
                        <p class="text-xs text-slate-400" data-i18n="account_or"></p>
                        <div class="flex-grow h-px bg-gray-200"></div>
                    </div>
                    <button onclick="alert('Googleログインは現在開発中です。')" class="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-300 rounded-lg shadow-sm action-btn hover:bg-slate-50">
                        <img src="img/google-logo.png" alt="Google" class="w-5 h-5">
                        <span class="text-slate-700 font-semibold" data-i18n="login_with_google"></span>
                    </button>
                    <button onclick="alert('Appleでログインは現在開発中です。')" class="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-700 bg-black text-white rounded-lg shadow-sm action-btn hover:bg-gray-800">
                        <img src="img/apple-login.png" alt="Apple" class="w-5 h-5">
                        <span class="font-semibold" data-i18n="login_with_apple"></span>
                    </button>
                </div>
            </div>
        `,
        3: `
            <div class="fade-in" id="signup-view">
                <h1 class="text-2xl font-bold text-slate-800 tracking-tight" data-i18n="account_title"></h1>
                <p class="mt-1 text-slate-600 text-sm" data-i18n="account_subtitle"></p>
                <div class="mt-4">
                    <form id="signup-form" class="space-y-3">
                        <div>
                            <label for="signup-company" class="block text-xs font-medium text-slate-700" data-i18n="account_form_company">会社名</label>
                            <input type="text" id="signup-company" name="company" class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                        </div>
                        <div>
                            <label for="signup-name" class="block text-xs font-medium text-slate-700" data-i18n="account_form_name">ご担当者名</label>
                            <input type="text" id="signup-name" name="name" required class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                        </div>
                        <div>
                            <label for="signup-email" class="block text-xs font-medium text-slate-700" data-i18n="account_form_email">メールアドレス</label>
                            <input type="email" id="signup-email" name="email" required pattern="^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" data-i18n-placeholder="account_form_email_placeholder">
                            <div id="signup-email-error" class="hidden text-sm text-pink-600 mt-1" data-i18n="account_form_email_error"></div>
                        </div>
                        <div>
                            <label for="signup-famility" class="block text-xs font-medium text-slate-700" data-i18n="account_form_facility">ご利用施設名</label>
                            <input type="text" id="signup-facility" name="facility" class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                        </div>
                    </form>
                </div>
            </div>
        `,
        4: `
        <div class="fade-in p-6 bg-white rounded-lg shadow-md space-y-6" id="payment-step">
            <section class="bg-gray-50 p-4 rounded-lg">
            <h2 class="text-lg font-semibold mb-4" data-i18n="payment_title"></h2>
            <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
                <dt data-i18n="payment_company_name"></dt><dd class="font-medium">株式会社KEYVOX</dd>
                <dt data-i18n="payment_contact_name"></dt><dd class="font-medium">山田 太郎</dd>
                <dt data-i18n="payment_email"></dt><dd class="font-medium">taro.yamada@keyvox.co.jp</dd>
                <dt data-i18n="account_form_facility"></dt><dd class="font-medium">スノーホテル</dd>
                <div class="col-span-2 border-t border-gray-200 my-2"></div>
                <dt data-i18n="payment_plan"></dt><dd class="font-medium">空間ビジネス最強パック</dd>
                <dt data-i18n="payment_lock_quantity"></dt><dd class="font-medium">1台</dd>
            </dl>
            <div class="mt-4 border-t border-gray-200 pt-4 flex justify-between items-center">
                <span class="text-base font-semibold" data-i18n="payment_total_monthly_fee"></span>
                <span id="payment-total" class="text-2xl font-bold text-sky-500"></span>
            </div>
            </section>
            <div class="mt-2 text-right">
              <a href="#" id="estimate-link" class="text-sky-500 hover:underline text-sm" data-i18n="payment_quote_link"></a>
            </div>
            <div id="estimate-input" class="hidden mt-4">
              <div class="flex space-x-4">
                <div class="flex-1"></div>
                <div class="flex-1">
                  <label for="estimate-number" class="block text-sm font-medium text-gray-700 mb-1" data-i18n="payment_quote_number_label"></label>
                  <input type="text" id="estimate-number" class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" data-i18n-placeholder="payment_quote_number_placeholder"/>
                </div>
              </div>
            </div>
            <section id="credit-card-section">
            <h3 class="text-lg font-semibold mb-2" data-i18n="payment_card_info_title"></h3>
            <div class="space-y-4">
              <div class="flex space-x-4">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1" data-i18n="payment_card_name_label"></label>
                  <input type="text" class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" data-i18n-placeholder="payment_card_name_placeholder"/>
                </div>
                <div class="w-48">
                  <label class="block text-sm font-medium text-gray-700 mb-1" data-i18n="payment_card_expiry_label"></label>
                  <div class="flex space-x-2">
                    <select class="custom-select block w-1/2 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                      <option data-i18n="payment_card_expiry_month"></option>
                    </select>
                    <select class="custom-select block w-1/2 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                      <option data-i18n="payment_card_expiry_year"></option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="flex space-x-4 items-start mt-4">
                <div class="flex-1 space-y-1">
                  <label class="block text-sm font-medium text-gray-700" data-i18n="payment_card_number_label"></label>
                  <input type="text" class="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" data-i18n-placeholder="payment_card_number_placeholder"/>
                </div>
                <div class="w-24 space-y-1">
                  <label class="block text-sm font-medium text-gray-700" data-i18n="payment_card_cvc_label"></label>
                  <input type="text" maxlength="4" class="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" data-i18n-placeholder="payment_card_cvc_placeholder"/>
                </div>
              </div>
            </div>
            </section>
            <div class="mt-4">
              <div class="bg-gray-50 p-4 rounded-lg w-full max-w-full">
                <label class="flex items-center space-x-2 w-full">
                    <input type="checkbox" id="bank-transfer-checkbox" class="h-4 w-4 text-sky-500 border-gray-300 rounded focus:ring-sky-500">
                    <span class="text-gray-700 font-medium text-sm" data-i18n="payment_bank_transfer_checkbox"></span>
                </label>
              </div>
            </div>
        </div>
        `,
        5: `
          <div class="fade-in text-center">
            <div class="flex justify-center mb-6">
              <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-4" data-i18n="complete_title"></h2>
            <p class="text-sm text-gray-700 mb-2" data-i18n="complete_subtitle"></p>
            <p class="text-sm text-gray-700 mb-6" data-i18n="complete_email_notice"></p>
            <button id="go-to-dashboard-btn" class="mt-8 px-8 py-3 text-white font-semibold rounded-lg shadow-md bg-black hover:bg-gray-700" data-i18n="button_go_to_dashboard"></button>
          </div>
        `,
    };

    // --- State Management ---
    let currentStep = 1;

    // hashchangeイベントのリスナーを登録
    window.addEventListener('hashchange', handleHashNavigation);

    // Hash-based Step/Modal Navigation
    function handleHashNavigation() {
        console.log("🚀 HASH:", location.hash);
        if (location.hash === '#step2') {
            currentStep = 2;
            console.log("👉 step2 に遷移");
            updateUI();
        } else if (location.hash === '#step3') {
            currentStep = 3;
            console.log("👉 step3 に遷移");
            updateUI();
        } else if (location.hash === '#step4') {
            currentStep = 4;
            console.log("👉 step4 に遷移");
            updateUI();
        } else if (location.hash === '#step5') {
            currentStep = 5;
            console.log("👉 step5 に遷移");
            updateUI();
        } else if (location.hash === '#org') {
            console.log("👉 org モーダル表示");
            showOrgModal();
        }
    }
    
    const totalSteps = 5;

    /**
     * Main function to update the entire UI based on the current step and language.
     */
    const updateUI = () => {
         // MODIFIED: Step mapping for payment/trial confirmation
        if (currentStep === 4) {
            if (window.isTrialLater) {
                stepContentContainer.innerHTML = `
                    <div class="fade-in p-6 bg-white rounded-lg shadow-md space-y-6" id="trial-confirm-step">
                      <section class="bg-gray-50 p-4 rounded-lg">
                        <h2 class="text-lg font-bold mb-4 text-slate-800" data-i18n="trial_confirm_title"></h2>
                        <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
                          <dt data-i18n="payment_company_name"></dt><dd class="font-medium">株式会社KEYVOX</dd>
                          <dt data-i18n="payment_contact_name"></dt><dd class="font-medium">山田 太郎</dd>
                          <dt data-i18n="payment_email"></dt><dd class="font-medium">taro.yamada@keyvox.co.jp</dd>
                          <dt data-i18n="account_form_facility"></dt><dd class="font-medium">スノーホテル</dd>
                          <div class="col-span-2 border-t border-gray-200 my-2"></div>
                          <dt data-i18n="trial_confirm_plan_label"></dt><dd class="font-medium" data-i18n="trial_confirm_plan_value"></dd>
                          <dt data-i18n="trial_confirm_selected_plan_label"></dt><dd class="font-medium" data-i18n="trial_confirm_selected_plan_value"></dd>
                        </dl>
                        <div class="mt-4 border-t border-gray-200 pt-4 flex justify-between items-center">
                          <span class="text-base font-semibold" data-i18n="trial_confirm_payment_label"></span>
                          <span class="text-2xl font-bold text-sky-500">¥0</span>
                        </div>
                      </section>
                      <div class="p-4 mt-6 rounded-lg border border-yellow-400 bg-yellow-50 text-yellow-800 text-sm" data-i18n="trial_confirm_terms"></div>
                      <div class="bg-gray-50 p-4 rounded-lg w-full max-w-full flex justify-center mt-4">
                        <div class="flex items-center">
                          <input type="checkbox" id="trial-agree-checkbox" class="h-4 w-4 text-sky-500 border-gray-300 rounded focus:ring-sky-500">
                          <label for="trial-agree-checkbox" class="ml-2 text-gray-700 font-medium text-sm" data-i18n="trial_confirm_agree_checkbox"></label>
                        </div>
                      </div>
                    </div>`;
                nextBtn.disabled = true;
                document.getElementById('trial-agree-checkbox')?.addEventListener('change', (e) => {
                    nextBtn.disabled = !e.target.checked;
                });
            } else {
                stepContentContainer.innerHTML = stepTemplates[4]; // Use new template index
                document.getElementById('payment-total').textContent = '¥' + lastTotal.toLocaleString();
                nextBtn.disabled = false;
                initPaymentStep();
            }
        } else {
            stepContentContainer.innerHTML = stepTemplates[currentStep] || '';
        }
        
        updateNavigationUI();
        updateLanguage(currentLang);

        // MODIFIED: Init functions calls for new step structure
        if (currentStep === 1) initPlanConfigurator();
        if (currentStep === 2) initAccountMethodStep();
        if (currentStep === 3) initSignupStep();
        if (currentStep === 5) initCompletionStep(); // This is the final step now
    };
    
    /**
     * Updates the step indicators, buttons, and footer visibility.
     */
    const updateNavigationUI = () => {
        if (!window.dictionary || !window.dictionary[currentLang]) return;
        const dict = window.dictionary[currentLang];
        
        document.querySelectorAll('.step-item').forEach((item, index) => {
            item.classList.toggle('active', index + 1 === currentStep);
            item.classList.toggle('completed', index + 1 < currentStep);
        });

        // MODIFIED: Show total on steps 1, 2, and 3
        footerTotalContainer.classList.toggle('hidden', ![1, 2, 3].includes(currentStep));
        
        // MODIFIED: Show/hide prev button based on new step count
        prevBtn.classList.toggle('hidden', currentStep === 1 || currentStep === 5);
        
        // MODIFIED: Hide next button on final step
        if (currentStep === 5) {
             nextBtn.classList.add('hidden');
             return;
        }

        // MODIFIED: Hide next button on step 2 (method selection)
        if (currentStep === 2) {
            nextBtn.classList.add('hidden');
            return;
        }

        nextBtn.className = 'px-8 py-3 text-white font-semibold rounded-lg btn-primary action-btn';
        nextBtn.classList.remove('hidden');
        
        // MODIFIED: Update next button text based on new steps
        if (currentStep === 3) { // Signup step
            nextBtn.textContent = dict.button_send_auth_code;
        } else { // Plan, Payment steps
            nextBtn.textContent = dict.button_next;
        }
    };

    const initPlanConfigurator = () => {
        const container = document.getElementById('plan-configurator');
        if (!container) return;

        const serviceTypeRadios = container.querySelectorAll('input[name="serviceType"]');
        const packRadios = container.querySelectorAll('input[name="pack"]');
        const quantityInput = document.getElementById('quantity');
        const packSelectionContainer = document.getElementById('pack-selection-container');
        const totalPriceElement = document.getElementById('total-price');
        
        serviceTypeRadios[0].checked = true;
        packRadios.forEach(radio => { radio.checked = false; });
        nextBtn.disabled = true;

        const PRICES = { baseAccount: 2500, service: { keyvox: 2500, api: 1650 }, pack: { office: 3000, hotel: 5000, business: 7000 } };

        const updateAndCalculate = () => {
            const selectedServiceType = container.querySelector('input[name="serviceType"]:checked')?.value;
            const isApiMode = selectedServiceType === 'api';
            
            packSelectionContainer.classList.toggle('opacity-50', isApiMode);
            packSelectionContainer.classList.toggle('pointer-events-none', isApiMode);
            packRadios.forEach(radio => {
                radio.disabled = isApiMode;
                if (isApiMode) radio.checked = false;
            });
            quantityInput.min = isApiMode ? "1" : "0";
            if (isApiMode && parseInt(quantityInput.value) < 1) quantityInput.value = "1";

            document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
            container.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
                radio.closest('.option-card')?.classList.add('selected');
            });

            const selectedPack = container.querySelector('input[name="pack"]:checked');
            const quantity = parseInt(quantityInput.value, 10);
            
            const isNextEnabled = (selectedServiceType === 'keyvox' && selectedPack && !isNaN(quantity) && quantity >= 0) ||
                                  (isApiMode && !isNaN(quantity) && quantity > 0);
            nextBtn.disabled = !isNextEnabled;

            if (isNaN(quantity) || quantity < 0) {
                totalPriceElement.textContent = dictionary[currentLang]['plan_quantity_error'];
                return;
            }
            const servicePrice = PRICES.service[selectedServiceType] || 0;
            const packPrice = (isApiMode || !selectedPack) ? 0 : (PRICES.pack[selectedPack.value] || 0);
            const total = PRICES.baseAccount + (servicePrice * quantity) + packPrice;
            totalPriceElement.textContent = `¥${total.toLocaleString()}`;
            lastTotal = total;
        };

        container.addEventListener('change', updateAndCalculate);
        container.querySelector('#quantity-minus').addEventListener('click', () => {
            if (quantityInput.value > quantityInput.min) quantityInput.value--;
            quantityInput.dispatchEvent(new Event('change'));
            updateAndCalculate();
        });
        container.querySelector('#quantity-plus').addEventListener('click', () => {
            quantityInput.value++;
            quantityInput.dispatchEvent(new Event('change'));
            updateAndCalculate();
        });
        // MODIFIED: Trial later link jumps to step 4
        container.querySelector('#trial-later-link').addEventListener('click', (e) => { e.preventDefault(); window.isTrialLater = true; currentStep = 4; updateUI(); });
        
        updateAndCalculate();
    };
    
    validateSignupForm = () => {
        const form = document.querySelector('#signup-form');
        if (!form) return;
        const inputs = form.querySelectorAll('input[required]');
        const email = form.querySelector('#signup-email');
        const pwd = form.querySelector('#signup-password');
        const pwdConfirm = form.querySelector('#signup-password-confirm');
        const emailError = form.querySelector('#signup-email-error');
        const pwdError = form.querySelector('#signup-password-confirm-error');
        let pwdInvalidError = form.querySelector('#signup-password-invalid-error');

        if (!pwdInvalidError) {
            pwdInvalidError = document.createElement('div');
            pwdInvalidError.id = 'signup-password-invalid-error';
            pwdInvalidError.className = 'hidden text-sm text-pink-600 mt-1';
            pwd.parentElement.appendChild(pwdInvalidError);
        }
        pwdInvalidError.textContent = dictionary[currentLang]['account_form_password_invalid_error'];

        const pwdPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
        const isEmailValid = email.checkValidity();
        const isPwdValid = pwdPattern.test(pwd.value);
        const doPasswordsMatch = pwd.value === pwdConfirm.value;

        if (!email._touched) {
            email.addEventListener('blur', () => { email._touched = true; validateSignupForm(); });
        }
        if (!pwd._touched) {
            pwd.addEventListener('blur', () => { pwd._touched = true; validateSignupForm(); });
        }

        if (email._touched) {
            email.style.borderColor = (!isEmailValid && email.value !== "") ? '#f87171' : '';
            emailError.classList.toggle('hidden', isEmailValid || email.value === '');
        } else {
            email.style.borderColor = '';
            emailError.classList.add('hidden');
        }

        if (pwd._touched) {
            pwd.style.borderColor = (!isPwdValid && pwd.value !== "") ? '#f87171' : '';
            pwdInvalidError.classList.toggle('hidden', isPwdValid || pwd.value === "");
        } else {
            pwd.style.borderColor = '';
            pwdInvalidError.classList.add('hidden');
        }

        pwdConfirm.style.borderColor = (!doPasswordsMatch && pwdConfirm.value !== "") ? '#f87171' : '';
        pwdError.classList.toggle('hidden', doPasswordsMatch || pwdConfirm.value === '');

        const areAllFieldsFilled = [...inputs].every(i => i.value.trim() !== '');
        nextBtn.disabled = !(areAllFieldsFilled && isEmailValid && doPasswordsMatch && isPwdValid);
    };

    // NEW: Handles events for step 2 (method selection)
    const initAccountMethodStep = () => {
        const loginBtn = document.getElementById('login-with-keyvox-btn');
        loginBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            showOrgModal();
        });
    };
// --- Org Select Modal Logic ---
const showOrgModal = () => {
    const modal = document.getElementById('org-select-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};
const closeOrgModal = () => {
    const modal = document.getElementById('org-select-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
};
window.closeOrgModal = closeOrgModal;

// Add X close button and overlay click close for org-select-modal
document.addEventListener('DOMContentLoaded', function() {
  const orgModal = document.getElementById('org-select-modal');
  const closeBtn = document.getElementById('org-select-close-btn');
  if (orgModal && closeBtn) {
    // Overlay click (only if clicked directly on overlay)
    orgModal.addEventListener('click', function(e) {
      if (e.target === orgModal) closeOrgModal();
    });
    // X button click
    closeBtn.addEventListener('click', closeOrgModal);
  }
});

let orgSelectErrorTimeout;

const confirmOrgSelection = () => {
    const select = document.querySelector('#org-select-modal select');
    const errorMsg = document.getElementById('org-select-error');
    if (!select.value) {
        errorMsg.classList.remove('hidden');
        clearTimeout(orgSelectErrorTimeout);
        orgSelectErrorTimeout = setTimeout(() => {
            errorMsg.classList.add('hidden');
        }, 4000);
        return;
    } else {
        errorMsg.classList.add('hidden');
        clearTimeout(orgSelectErrorTimeout);
    }
    closeOrgModal();
    currentStep++;
    updateUI();
};
window.confirmOrgSelection = confirmOrgSelection;

    // NEW: Handles events for step 3 (signup form)
    const initSignupStep = () => {
        const form = document.getElementById('signup-form');
        if (!form) return;
        // Remove previous listener if any
        form.removeEventListener('input', validateSignupForm);
        // Custom validation for signup fields (会社名, 担当者名, メールアドレス, 施設名)
        const companyInput = form.querySelector('#signup-company');
        const nameInput = form.querySelector('#signup-name');
        const emailInput = form.querySelector('#signup-email');
        // Use facilityInput instead of phoneInput
        const facilityInput = form.querySelector('#signup-facility');
        const nextBtn = document.getElementById('nextBtn');
        function validateFields() {
            const allFilled = [companyInput, nameInput, emailInput, facilityInput].every(
                inp => inp && inp.value.trim() !== ''
            );
            const isEmailValid = emailInput && emailInput.checkValidity();
            if (allFilled && isEmailValid) {
                nextBtn.disabled = false;
                nextBtn.classList.add('btn-enabled');
                nextBtn.classList.remove('btn-disabled');
            } else {
                nextBtn.disabled = true;
                nextBtn.classList.add('btn-disabled');
                nextBtn.classList.remove('btn-enabled');
            }
        }
        form.addEventListener('input', validateFields);
        // Run once on init
        validateFields();

        // --- Email Field Validation UX Enhancement ---
        const emailError = form.querySelector('#signup-email-error');
        let emailHasBeenBlurred = false;

        function validateEmailField() {
            const isValid = emailInput.checkValidity();
            if (!isValid) {
                emailInput.classList.add('border-pink-500', 'focus:border-pink-500');
                emailError.textContent = dictionary[currentLang]['account_form_email_error'];
                emailError.classList.remove('hidden');
            } else {
                emailInput.classList.remove('border-pink-500', 'focus:border-pink-500');
                emailError.classList.add('hidden');
            }
        }

        emailInput.addEventListener('blur', () => {
            emailHasBeenBlurred = true;
            validateEmailField();
        });
        emailInput.addEventListener('input', () => {
            if (emailHasBeenBlurred) {
                validateEmailField();
            }
        });
    };
    
    // MODIFIED: Handles events for step 5 (completion)
    const initCompletionStep = () => {
        launchConfetti();
        const goToDashboardBtn = document.getElementById('go-to-dashboard-btn');
        if (goToDashboardBtn) {
            goToDashboardBtn.onclick = () => {
                window.location.href = 'https://eco.blockchainlock.io/bacs-web/index.html#/user/login';
            };
        }
    };

    const openPasswordResetModal = () => {
        const modal = document.getElementById('password-reset-modal');
        const modalContent = modal.querySelector('div');
        modalContent.innerHTML = `
            <button id="close-forgot-password-modal" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-6" data-i18n="pw_reset_modal_title"></h2>
            <div id="reset-success-message" class="hidden p-3 mb-4 rounded-md bg-green-100 text-green-800 text-center font-bold" data-i18n="pw_reset_success_sent"></div>
            <div id="reset-error-message" class="hidden p-3 mb-4 rounded-md bg-pink-100 text-pink-700 text-center font-bold"></div>
            <form id="forgot-password-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2" data-i18n="pw_reset_phone_label"></label>
                    <div class="flex">
                        <select class="custom-select pl-3 pr-10 py-3 text-base bg-gray-50 border border-r-0 border-gray-300 rounded-l-md"><option data-i18n="pw_reset_phone_country_jp"></option><option data-i18n="pw_reset_phone_country_us"></option><option data-i18n="pw_reset_phone_country_uk"></option></select>
                        <input type="tel" id="reset-phone" required class="w-full px-4 py-3 text-base border border-gray-300 rounded-r-md" data-i18n-placeholder="account_form_phone_placeholder">
                    </div>
                    <p class="text-xs text-gray-500 mt-1" data-i18n="pw_reset_phone_hint"></p>
                </div>
                <div class="flex items-center justify-center p-3 border border-gray-200 rounded-md bg-gray-50"><div class="flex items-center space-x-4"><input type="checkbox" id="reset-recaptcha" class="h-6 w-6 rounded border-gray-300 text-sky-500"><span class="text-sm text-gray-700" data-i18n="pw_reset_recaptcha"></span><img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA Logo" class="w-8 h-8"></div></div>
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2" data-i18n="pw_reset_code_label"></label>
                    <div class="flex gap-2">
                        <input type="text" id="reset-verify-code" required class="w-full px-4 py-3 text-base border border-gray-300 rounded-md" data-i18n-placeholder="pw_reset_code_placeholder">
                        <button type="button" id="send-code-reset" class="whitespace-nowrap flex-shrink-0 font-bold py-3 px-4 rounded-lg btn-disabled" disabled data-i18n="pw_reset_send_code_button"></button>
                    </div>
                </div>
                <div><label class="block text-sm font-bold text-gray-700 mb-2" data-i18n="pw_reset_new_password_label"></label><input type="password" id="password-reset-field" required class="w-full px-4 py-3 text-base border border-gray-300 rounded-md" data-i18n-placeholder="pw_reset_new_password_placeholder"></div>
                <div><label class="block text-sm font-bold text-gray-700 mb-2" data-i18n="pw_reset_new_password_confirm_label"></label><input type="password" id="password-reset-confirm" required class="w-full px-4 py-3 text-base border border-gray-300 rounded-md" data-i18n-placeholder="pw_reset_new_password_confirm_placeholder"></div>
                <button type="submit" id="submit-reset-password" class="w-full font-bold py-3 px-4 rounded-lg btn-disabled" disabled data-i18n="pw_reset_submit_button"></button>
            </form>
        `;
        updateLanguage(currentLang);
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        const closeModal = () => { modal.classList.add('hidden'); document.body.style.overflow = ''; };
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        modalContent.querySelector('#close-forgot-password-modal').addEventListener('click', closeModal);
        
        const form = modalContent.querySelector('#forgot-password-form');
        const sendCodeBtn = modalContent.querySelector('#send-code-reset');
        const submitBtn = modalContent.querySelector('#submit-reset-password');
        const phoneInput = modalContent.querySelector('#reset-phone');
        const recaptcha = modalContent.querySelector('#reset-recaptcha');
        
        form.addEventListener('input', () => {
            const canSendCode = phoneInput.value.trim() !== '' && recaptcha.checked;
            sendCodeBtn.disabled = !canSendCode;
            sendCodeBtn.classList.toggle('btn-enabled', canSendCode);
            sendCodeBtn.classList.toggle('btn-disabled', !canSendCode);
            
            const canSubmit = [...form.querySelectorAll('input[required]')].every(i => i.value.trim() !== '');
            submitBtn.disabled = !canSubmit;
            submitBtn.classList.toggle('btn-enabled', canSubmit);
            submitBtn.classList.toggle('btn-disabled', !canSubmit);
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const pwd = modalContent.querySelector('#password-reset-field').value;
            const pwdConfirm = modalContent.querySelector('#password-reset-confirm').value;
            if (pwd !== pwdConfirm) {
                const errorDiv = modalContent.querySelector('#reset-error-message');
                errorDiv.textContent = dictionary[currentLang]['pw_reset_error_mismatch'];
                errorDiv.classList.remove('hidden');
                return;
            }
            modalContent.innerHTML = `
              <div class="flex flex-col items-center p-8 space-y-4">
                <div class="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-4"><div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center"><svg class="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg></div></div>
                <h2 class="text-2xl font-bold text-gray-900" data-i18n="pw_reset_success_final_title"></h2>
                <p class="text-gray-600" data-i18n="pw_reset_success_final_subtitle"></p>
                <button id="success-close-btn" class="mt-6 w-full py-3 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300" data-i18n="pw_reset_success_final_close_button"></button>
              </div>`;
            updateLanguage(currentLang);
            modalContent.querySelector('#success-close-btn').addEventListener('click', closeModal);
        });
    };
    
    const initPaymentStep = () => {
        const checkbox = document.getElementById('bank-transfer-checkbox');
        const modal = document.getElementById('bank-transfer-modal');
        if (!checkbox || !modal) return;

        const submitButton = nextBtn;
        const toggleModal = (show) => {
            modal.classList.toggle('hidden', !show);
            document.body.style.overflow = show ? 'hidden' : '';
            const creditCardSection = document.getElementById('credit-card-section');
            if (creditCardSection) {
                creditCardSection.style.display = checkbox.checked ? 'none' : '';
            }
            if (checkbox.checked) {
                submitButton.disabled = false;
                submitButton.classList.add('btn-enabled');
                submitButton.classList.remove('btn-disabled');
            } else {
                validatePaymentForm();
            }
        };

        checkbox.addEventListener('change', () => toggleModal(checkbox.checked));
        modal.querySelector('#bank-transfer-close').addEventListener('click', () => { checkbox.checked = false; toggleModal(false); });
        modal.querySelector('#bank-transfer-cancel').addEventListener('click', () => { checkbox.checked = false; toggleModal(false); });
        modal.querySelector('#bank-transfer-confirm').addEventListener('click', () => toggleModal(false));

        document.getElementById('estimate-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('estimate-input')?.classList.toggle('hidden');
        });

        const paymentStep = document.getElementById('payment-step');
        let cardNumberInput = null;
        let cvcInput = null;
        if (paymentStep) {
            const expirySelects = paymentStep.querySelectorAll('select');
            if (expirySelects.length >= 2) {
                const mmSelect = expirySelects[0];
                const yySelect = expirySelects[1];
                mmSelect.innerHTML = '<option data-i18n="payment_card_expiry_month"></option>';
                for (let i = 1; i <= 12; ++i) {
                    const mm = i.toString().padStart(2, '0');
                    const opt = document.createElement('option');
                    opt.value = mm;
                    opt.textContent = mm;
                    mmSelect.appendChild(opt);
                }
                yySelect.innerHTML = '<option data-i18n="payment_card_expiry_year"></option>';
                const nowYear = new Date().getFullYear();
                for (let i = 0; i < 10; ++i) {
                    const y = (nowYear + i).toString();
                    const opt = document.createElement('option');
                    opt.value = y;
                    opt.textContent = y;
                    yySelect.appendChild(opt);
                }
            }
            
            const labelNodes = paymentStep.querySelectorAll('label');
            labelNodes.forEach(label => {
                if (label.getAttribute('data-i18n') === 'payment_card_number_label') {
                    cardNumberInput = label.parentElement.querySelector('input');
                }
                if (label.getAttribute('data-i18n') === 'payment_card_cvc_label') {
                    cvcInput = label.parentElement.querySelector('input');
                }
            });
            if (cardNumberInput) {
                cardNumberInput.setAttribute('maxlength', '19');
                cardNumberInput.setAttribute('inputmode', 'numeric');
                cardNumberInput.setAttribute('pattern', '\\d*');
            }
            if (cvcInput) {
                cvcInput.setAttribute('inputmode', 'numeric');
                cvcInput.setAttribute('pattern', '\\d*');
            }
        }

        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '').substring(0, 16);
                let formatted = value.match(/.{1,4}/g);
                e.target.value = formatted ? formatted.join(' ') : '';
                if (value.length === 16 && cvcInput) {
                    cvcInput.focus();
                }
            });
        }

        const cardInputsAll = document.querySelectorAll('#payment-step input, #payment-step select');
        let mmSelect = null, yySelect = null;
        if (paymentStep) {
          const expirySelects = paymentStep.querySelectorAll('select');
          if (expirySelects.length >= 2) {
            mmSelect = expirySelects[0];
            yySelect = expirySelects[1];
          }
        }
        const validatePaymentForm = () => {
          const cardNameInput = paymentStep ? paymentStep.querySelector('input[data-i18n-placeholder="payment_card_name_placeholder"]') : null;
          const cardNumberInputLocal = paymentStep ? paymentStep.querySelector('label[data-i18n="payment_card_number_label"]')?.parentElement.querySelector('input') : null;
          const cvcInputLocal = paymentStep ? paymentStep.querySelector('label[data-i18n="payment_card_cvc_label"]')?.parentElement.querySelector('input') : null;

          const isCardNameFilled = cardNameInput && cardNameInput.value.trim() !== '';
          const isCardNumberValid = cardNumberInputLocal && cardNumberInputLocal.value.replace(/\D/g, '').length === 16;
          const isCvcFilled = cvcInputLocal && cvcInputLocal.value.trim() !== '';
          const isMMSelected = mmSelect && mmSelect.value !== '';
          const isYYSelected = yySelect && yySelect.value !== '';

          const allFilled = isCardNameFilled && isCardNumberValid && isMMSelected && isYYSelected && isCvcFilled;
          submitButton.disabled = !allFilled;
          submitButton.classList.toggle('btn-enabled', allFilled);
          submitButton.classList.toggle('btn-disabled', !allFilled);
        };
        cardInputsAll.forEach(input => input.addEventListener('input', validatePaymentForm));
        if (mmSelect) mmSelect.addEventListener('change', validatePaymentForm);
        if (yySelect) yySelect.addEventListener('change', validatePaymentForm);
        validatePaymentForm();
    };
    
    const launchConfetti = () => {
        let canvas = document.getElementById('confetti-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'confetti-canvas';
            canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;';
            document.body.appendChild(canvas);
        }
        const myConfetti = confetti.create(canvas, { resize: true });
        const endTime = Date.now() + 5000;
        const interval = setInterval(() => {
            if (Date.now() > endTime) return clearInterval(interval);
            myConfetti({ particleCount: 75, startVelocity: 10, spread: 360, gravity: 0.5, origin: { x: Math.random(), y: 0 } });
        }, 200);
    };
    
    // --- Event Listeners ---
    nextBtn.addEventListener('click', () => {
        // MODIFIED: Verification modal shown on step 3 (signup form)
        if (currentStep === 3) {
             if (!window.skipVerificationModal) {
                document.getElementById('verification-modal').classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                return;
            }
        }

        window.skipVerificationModal = false;
        if (currentStep < totalSteps) {
            currentStep++;
            updateUI();
        }
    });

    // MODIFIED: Simplified prev button logic
    prevBtn.addEventListener('click', () => { 
        if (currentStep > 1) {
            // For trial later, going back from step 4 should reset the flag
            if (currentStep === 4 && window.isTrialLater) {
                window.isTrialLater = false;
            }
            currentStep--; 
            updateUI(); 
        } 
    });
    
    // --- Verification Modal Initialization ---
    const verificationModal = document.getElementById('verification-modal');
    verificationModal.addEventListener('click', (e) => {
        if (
            e.target.closest('#verification-close-btn') ||
            e.target.id === 'back-to-account'
        ) {
            verificationModal.classList.add('hidden');
            document.body.style.overflow = '';
        } else if (e.target.id === 'verify-next' && !e.target.disabled) {
            verificationModal.classList.add('hidden');
            document.body.style.overflow = '';
            window.skipVerificationModal = true;
            nextBtn.click();
        }
    });
    const codeInputs = [...verificationModal.querySelectorAll('input[type="text"]')];
    verificationModal.addEventListener('input', (e) => {
        const target = e.target;
        if (codeInputs.includes(target)) {
            if (target.value.length === 1) {
                const nextInput = codeInputs[codeInputs.indexOf(target) + 1];
                if (nextInput) nextInput.focus();
            } else if (target.value.length === 0) {
                const prevInput = codeInputs[codeInputs.indexOf(target) - 1];
                if (prevInput) prevInput.focus();
            }
            const filledCount = codeInputs.filter(i => i.value.trim().length === 1).length;
            verificationModal.querySelector('#verify-next').disabled = filledCount !== 6;
        }
    });
    const resendBtn = document.getElementById('resend-code-btn');
    if (resendBtn) {
        resendBtn.addEventListener('click', function () {
            var msg = document.getElementById('resend-success-message');
            if (msg) {
                msg.classList.remove('hidden');
                msg.style.display = 'block';
            }
            setTimeout(() => {
              if (msg) {
                msg.classList.add('hidden');
                msg.style.display = 'none';
              }
            }, 4000);
        });
    }

    // --- Initial Call ---
    updateUI();
    
    // ページ読み込み時のハッシュを処理
    handleHashNavigation();
}

function openAIChat() {
    const overlay = document.getElementById('aiChatOverlay');
    overlay.innerHTML = `
        <div class="bg-gradient-to-br from-white via-purple-50 to-pink-50 w-full max-w-md rounded-3xl shadow-2xl p-6 relative flex flex-col h-96 border border-gray-200">
        <button onclick="closeAIChat()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
        <div class="flex-1 overflow-y-auto mb-4 p-2 border rounded bg-white shadow-inner">
            <div class="text-left mb-2">
            <span class="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm shadow" data-i18n="ai_chat_greeting">こんにちは！何かお手伝いしますか？</span>
            </div>
        </div>
        <div class="flex">
            <input type="text" placeholder="" data-i18n-placeholder="ai_chat_input_placeholder" class="flex-1 border rounded-l-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            <button class="bg-purple-500 text-white px-6 rounded-r-full hover:bg-purple-600 transition"><span data-i18n="ai_chat_send_button">送信</span></button>
        </div>
        </div>
    `;
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    updateLanguage(currentLang);
}
function closeAIChat() {
    document.getElementById('aiChatOverlay').classList.add('hidden');
    document.body.style.overflow = '';
}

// DOMContentLoadedを起点にアプリケーションを初期化する
document.addEventListener('DOMContentLoaded', initializeApp);
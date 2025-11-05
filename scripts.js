
// Function to receive data from Flutter
function receiveFromFlutter(data) {
    console.log('📥 Received from Flutter:', data);

    if (data.type === 'toggleKioskLock') {
        toggleKioskLock(data.value);
    } else if (data.type === 'togglePoweredBy') {
        togglePoweredBy(data.value);
    } else if (data.type === 'toggleCustomerDetails') {
        // Pass the customer data object (if available) or null
        toggleCustomerDetails(data.customerData !== undefined ? data.customerData : data.value);
    } else if (data.type === 'toggleRegistrationMode') {
        toggleRegistrationMode(data.value);
    } else if (data.type === 'showError') {
        showError(data.error);
    }
}

// Function to send data to Flutter
function sendToFlutter(data) {
    try {
        if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('FlutterChannel', JSON.stringify(data));
            console.log('📤 Sent to Flutter:', data);
        }
    } catch (error) {
        console.error('❌ Error sending to Flutter:', error);
    }
}

// Check-in functions
function checkInWithQR() {
    console.log('🔍 QR Code check-in initiated');

    // show modal
    const modal = document.getElementById('qrModal');
    if (modal) {
        modal.classList.add('visible');
        modal.setAttribute('aria-hidden', 'false');

        // clear previous timeout if any
        if (window.__qrModalTimeout) {
            clearTimeout(window.__qrModalTimeout);
        }

        // auto-close after 5 seconds
        window.__qrModalTimeout = setTimeout(() => {
            modal.classList.remove('visible');
            modal.setAttribute('aria-hidden', 'true');
        }, 3000);
    }

    sendToFlutter({
        type: 'checkInQR',
        timestamp: new Date().toISOString()
    });
}

function checkInWithSearch() {
    console.log('🔍 Search check-in initiated');
    sendToFlutter({
        type: 'checkInSearch',
        timestamp: new Date().toISOString()
    });
}


function openDrawer() {
    console.log('✅ open drawer');
    sendToFlutter({
        type: 'openDrawer',
        timestamp: new Date().toISOString()
    });
}

// // Self registration action
// function selfRegister(extraData) {
//     const payload = {
//         type: 'selfRegister',
//         timestamp: new Date().toISOString()
//     };
//     if (extraData && typeof extraData === 'object') {
//         payload.data = extraData;
//     }
//     console.log('📝 Self registration triggered');
//     sendToFlutter(payload);
// }

// Registration mode state
let isRegistrationMode = false;

function toggleRegistrationMode(value) {

    closeRegistrationForm();
    // If value is provided (true/false), use it; otherwise toggle
    isRegistrationMode = value !== undefined ? value : !isRegistrationMode;

    const lockIcon = document.getElementById('lockIcon');
    const drawerBtn = document.querySelector('.drawer-btn');
    const selfRegistrationButton = document.querySelector('.checkin-buttons .checkin-btn[onclick="openRegistrationForm()"]');
    const qrCodeButton = document.querySelector('.checkin-buttons .checkin-btn[onclick="checkInWithQR()"]');
    const searchButton = document.querySelector('.checkin-buttons .checkin-btn[onclick="checkInWithSearch()"]');

    if (isRegistrationMode) {
        // Registration mode: show unlock button, hide drawer button, hide first 2 buttons, show Self Registration button
        if (lockIcon) {
            lockIcon.style.visibility = 'visible';
        }
        if (drawerBtn) {
            drawerBtn.classList.add('hidden');
        }
        if (qrCodeButton) {
            qrCodeButton.classList.add('hidden');
        }
        if (searchButton) {
            searchButton.classList.add('hidden');
        }
        if (selfRegistrationButton) {
            selfRegistrationButton.classList.remove('hidden');
        }
    } else {
        // Normal mode: hide unlock button (unless kiosk is locked), show drawer button, show first 2 buttons, hide Self Registration button
        if (lockIcon) {
            // Only show the unlock if kiosk is locked; otherwise hide it
            lockIcon.style.visibility = isKioskLocked ? 'visible' : 'hidden';
        }
        if (drawerBtn) {
            drawerBtn.classList.remove('hidden');
        }
        if (qrCodeButton) {
            qrCodeButton.classList.remove('hidden');
        }
        if (searchButton) {
            searchButton.classList.remove('hidden');
        }
        if (selfRegistrationButton) {
            selfRegistrationButton.classList.add('hidden');
        }
    }

    sendToFlutter({
        type: 'toggleRegistrationMode',
        value: isRegistrationMode,
        timestamp: new Date().toISOString(),
    });
}

// Kiosk lock state
let isKioskLocked = false;

function toggleKioskLock(value) {
    // If value is provided (true/false), use it; otherwise toggle
    isKioskLocked = value !== undefined ? value : !isKioskLocked;

    const mainContent = document.getElementById('mainContent');
    const drawerBtn = document.querySelector('.drawer-btn');
    const footer = document.querySelector('.footer');
    const lockIcon = document.getElementById('lockIcon');

    if (isKioskLocked) {
        // Lock the kiosk
        mainContent.classList.add('hidden');
        drawerBtn.classList.add('hidden');
        // lockIcon.textContent = '🔓'; // Show unlock icon
        lockIcon.style.visibility = 'visible';
        console.log('🔒 Kiosk locked');
    } else {
        // Unlock the kiosk
        mainContent.classList.remove('hidden');
        drawerBtn.classList.remove('hidden');
        // lockIcon.textContent = '🔒'; // Show lock icon
        // change the lock icon visiblity hidden
        lockIcon.style.visibility = 'hidden';
        console.log('🔓 Kiosk unlocked');
    }
    sendToFlutter({
        type: 'toggleKioskLock',
        value: isKioskLocked,
        timestamp: new Date().toISOString(),
    });
}

// Powered-by visibility state
let isPoweredByVisible = true;

function togglePoweredBy(value) {
    // If value is provided (true/false), use it; otherwise toggle
    isPoweredByVisible = value !== undefined ? value : !isPoweredByVisible;

    const footer = document.querySelector('.footer');

    if (isPoweredByVisible) {
        // Show powered-by logo
        footer.classList.remove('hidden');
        console.log('👁️ Powered-by logo visible');
    } else {
        // Hide powered-by logo
        footer.classList.add('hidden');
        console.log('🙈 Powered-by logo hidden');
    }
    sendToFlutter({
        type: 'togglePoweredBy',
        value: isPoweredByVisible,
        timestamp: new Date().toISOString(),
    });
}

function unlockKioskLock() {
    console.log('✅ unlock kiosk');
    sendToFlutter({
        type: 'unlockKioskLock',
        timestamp: new Date().toISOString()
    });
}

function hideDummyControlls() {
    const dummyControls = document.getElementById('dummyControls');
    if (dummyControls) {
        dummyControls.classList.add('hidden');
        console.log('🙈 Dummy controls hidden');
    }
}

function showWelcome(userData) {
    console.log('👋 Welcome message shown', userData);

    // Close the registration form
    closeRegistrationForm();

    // Update welcome message with user data
    if (userData) {
        // Extract the name from userData
        const firstName = userData.firstname || '';
        const lastName = userData.lastname || '';
        const fullName = firstName ? `${firstName} ${lastName}`.trim() : 'Visitor';

        // Update the welcome message content
        const welcomeName = document.getElementById('welcome-name');
        if (welcomeName) {
            welcomeName.textContent = fullName;
        }
    } else {
        // Default message if no data provided
        const welcomeName = document.getElementById('welcome-name');
        if (welcomeName) {
            welcomeName.textContent = '';
        }
    }

    // Show the welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.classList.remove('hidden');

        // Hide the message after 5 seconds
        setTimeout(() => {
            welcomeMessage.classList.add('hidden');
            console.log('🙈 Welcome message hidden');
        }, 5000);
    }

    sendToFlutter({
        type: 'showWelcome',
        data: userData,
        timestamp: new Date().toISOString()
    });
}

function showDummyControlls() {
    const dummyControls = document.getElementById('dummyControls');
    if (dummyControls) {
        dummyControls.classList.remove('hidden');
        console.log('👁️ Dummy controls visible');
    }
}

// Registration Form Functions
let registrationFormAutoCloseTimeout = null;

function openRegistrationForm() {
    console.log('📝 Opening registration form');
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.classList.remove('hidden');
        console.log('👁️ Registration form visible');
    }

    // Clear any previous errors when opening the form
    clearErrors();

    // Hide loading state when opening form
    hideRegistrationLoading();

    // Setup field error clearing (in case form was loaded dynamically)
    setTimeout(() => {
        setupFieldErrorClearing();
    }, 100);

    // Focus on first name field after 1 second
    setTimeout(() => {
        const firstNameField = document.getElementById('reg-firstname');
        if (firstNameField) {
            firstNameField.focus();
        }
    }, 100);

    sendToFlutter({
        type: 'openRegistrationForm',
        timestamp: new Date().toISOString()
    });
}

function closeRegistrationForm() {
    console.log('❌ Closing registration form');
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.classList.add('hidden');
        console.log('🙈 Registration form hidden');
    }

    // Clear auto-close timeout if it exists
    if (registrationFormAutoCloseTimeout) {
        clearTimeout(registrationFormAutoCloseTimeout);
        registrationFormAutoCloseTimeout = null;
    }

    // Hide loading state when closing form
    hideRegistrationLoading();

    sendToFlutter({
        type: 'closeRegistrationForm',
        timestamp: new Date().toISOString()
    });
}

function showRegistrationLoading() {
    const loadingOverlay = document.getElementById('registrationLoadingOverlay');
    const submitBtn = document.getElementById('registration-submit-btn');

    if (loadingOverlay) {
        loadingOverlay.classList.add('visible');
    }

    if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
    }
}

function hideRegistrationLoading() {
    const loadingOverlay = document.getElementById('registrationLoadingOverlay');
    const submitBtn = document.getElementById('registration-submit-btn');

    // Clear auto-close timeout if it exists
    if (registrationFormAutoCloseTimeout) {
        clearTimeout(registrationFormAutoCloseTimeout);
        registrationFormAutoCloseTimeout = null;
    }

    if (loadingOverlay) {
        loadingOverlay.classList.remove('visible');
    }

    if (submitBtn) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Registration';
    }
}

function handleRegistrationSubmit(event) {
    event.preventDefault();
    console.log('📝 Registration form submitted');

    // Clear previous errors
    clearErrors();
    // Show loading state
    showRegistrationLoading();

    // Get form data
    const formData = new FormData(event.target);
    const countryCode = formData.get('country_code') || '+971';
    const phoneNumber = formData.get('mobile') || '';
    const mobile = phoneNumber ? `${countryCode}${phoneNumber}` : '';

    const registrationData = {
        firstname: formData.get('firstname'),
        lastname: formData.get('lastname'),
        email: formData.get('email'),
        mobile: mobile,
        company_name: formData.get('company'),
        designation: formData.get('designation'),
        nationality: formData.get('nationality'),
        country_of_residence: formData.get('country_of_residence'),
        ticket: 176,
    };

    console.log('📋 Registration data:', registrationData);

    // Send to Flutter
    sendToFlutter({
        type: 'registrationSubmit',
        data: registrationData,
        timestamp: new Date().toISOString()
    });

    // Auto-close form after 10 seconds if no errors occur
    // Clear any existing timeout first
    if (registrationFormAutoCloseTimeout) {
        clearTimeout(registrationFormAutoCloseTimeout);
    }

    registrationFormAutoCloseTimeout = setTimeout(() => {
        console.log('⏰ Auto-closing registration form after 10 seconds');
        closeRegistrationForm();
        registrationFormAutoCloseTimeout = null;
    }, 10000);

    // Note: Loading will be hidden when form closes or errors are shown
    // closeRegistrationForm();

    // Optionally show success message or welcome message
    // showWelcome(registrationData);
}

// Field mapping from API field names to form field IDs
const registrationFieldMap = {
    'firstname': 'reg-firstname',
    'lastname': 'reg-lastname',
    'email': 'reg-email',
    'mobile': 'reg-mobile',
    'company_name': 'reg-company',
    'company': 'reg-company', // Also support 'company' directly
    'designation': 'reg-designation',
    'nationality': 'reg-nationality',
    'ticket': 'reg-ticket',
    'country_of_residence': 'reg-country-of-residence'
};

// Function to show validation errors
function showError(errorData) {
    console.log('❌ Showing registration errors:', errorData);

    // Hide loading state when showing errors
    hideRegistrationLoading();

    // Clear previous errors first
    clearErrors();

    // Handle error structure: { detail: { field: [error messages] } }
    let errors = null;
    if (errorData && errorData.detail) {
        errors = errorData.detail;
    } else if (errorData && typeof errorData === 'object') {
        errors = errorData;
    }

    if (!errors) {
        console.warn('⚠️ Invalid error format');
        return;
    }

    // Iterate through each error field
    Object.keys(errors).forEach(fieldName => {
        const fieldId = registrationFieldMap[fieldName];

        // Skip if field doesn't exist in form
        if (!fieldId) {
            console.warn(`⚠️ Field "${fieldName}" not found in form`);
            return;
        }

        const fieldElement = document.getElementById(fieldId);
        if (!fieldElement) {
            console.warn(`⚠️ Element with ID "${fieldId}" not found`);
            return;
        }

        // Get error messages (could be array or single string)
        const errorMessages = Array.isArray(errors[fieldName])
            ? errors[fieldName]
            : [errors[fieldName]];

        // Display first error message
        const errorMessage = errorMessages[0];

        // Add error class to input/select
        fieldElement.classList.add('error');

        // If it's a mobile field error, also highlight the country code selector
        if (fieldId === 'reg-mobile') {
            const countryCodeSelect = document.getElementById('reg-country-code');
            if (countryCodeSelect) {
                countryCodeSelect.classList.add('error');
            }
        }

        // Find the parent registration-field div
        const fieldContainer = fieldElement.closest('.registration-field');
        if (fieldContainer) {
            // Remove existing error message if any
            const existingError = fieldContainer.querySelector('.registration-field-error');
            if (existingError) {
                existingError.remove();
            }

            // Create and append error message
            const errorElement = document.createElement('span');
            errorElement.className = 'registration-field-error';
            errorElement.textContent = errorMessage;
            fieldContainer.appendChild(errorElement);
        }
    });
}

// Function to clear all validation errors
function clearErrors() {
    // Remove error class from all fields (including country code select)
    const errorFields = document.querySelectorAll('.registration-field input.error, .registration-field select.error, .phone-input-container select.error, .phone-input-container input.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });

    // Remove all error messages
    const errorMessages = document.querySelectorAll('.registration-field-error');
    errorMessages.forEach(error => {
        error.remove();
    });
}

// Customer details data
let customerData = null;
let isCustomerDetailsVisible = false;

function toggleCustomerDetails(data) {

    const detailsPanel = document.getElementById('customerDetailsPanel');

    // If data is provided, use it
    if (data !== undefined && data !== null) {
        // Store customer data
        customerData = data;
        isCustomerDetailsVisible = true;

        // Populate the fields with customer data
        updateCustomerDetailsDisplay(data);

        // Show the panel
        if (detailsPanel) {
            detailsPanel.classList.remove('hidden');
            console.log('👁️ Customer details visible with data:', data);
        }
    } else if (data === null) {
        // Hide the panel
        isCustomerDetailsVisible = false;
        customerData = null;
        if (detailsPanel) {
            detailsPanel.classList.add('hidden');
            console.log('🙈 Customer details hidden');
        }
    }

    sendToFlutter({
        type: 'toggleCustomerDetails',
        value: isCustomerDetailsVisible,
        data: customerData,
        timestamp: new Date().toISOString(),
    });
}

function updateCustomerDetailsDisplay(data) {
    // Update each field with the customer data from Flutter model
    updateField('customer-field-firstname', data.firstname || '');
    updateField('customer-field-lastname', data.lastname || '');
    updateField('customer-field-email', data.email || '');
    updateField('customer-field-phone', data.mobile || '');
    updateField('customer-field-company', data.company || '');
    updateField('customer-field-job', data.designation || '');
    updateField('customer-field-nationality', data.nationality || '');
    // Ticket info (ticket object with nested properties)
    const ticketInfo = data.ticket ? (data.ticket.ticket_display_name || data.ticket.name || '') : '';
    updateField('customer-field-ticket', ticketInfo);
}

function updateField(id, value) {
    const field = document.getElementById(id);
    if (field) {
        field.textContent = value;
    }
}

// Function called from Flutter to update user details form
function updateUserDetailsForm(userData) {

    sendToFlutter({
        type: 'log',
        timestamp: new Date().toISOString()
    });

    if (userData && Object.keys(userData).length > 0) {
        // Show and populate customer details
        toggleCustomerDetails(userData);
    } else {
        // Hide customer details if no data
        toggleCustomerDetails(null);
    }
}

// Clear field error when user starts typing
function setupFieldErrorClearing() {
    const registrationForm = document.getElementById('registrationFormElement');
    if (registrationForm) {
        const fields = registrationForm.querySelectorAll('input, select');
        fields.forEach(field => {
            // Handle input events for text fields
            field.addEventListener('input', function () {
                // Clear error for this specific field
                this.classList.remove('error');
                const fieldContainer = this.closest('.registration-field');
                if (fieldContainer) {
                    const errorElement = fieldContainer.querySelector('.registration-field-error');
                    if (errorElement) {
                        errorElement.remove();
                    }
                }
            });

            // Handle change events for select dropdowns
            if (field.tagName === 'SELECT') {
                field.addEventListener('change', function () {
                    // Clear error for this specific field
                    this.classList.remove('error');
                    const fieldContainer = this.closest('.registration-field');
                    if (fieldContainer) {
                        const errorElement = fieldContainer.querySelector('.registration-field-error');
                        if (errorElement) {
                            errorElement.remove();
                        }
                    }
                });
            }
        });

        // Setup phone number field to only accept numbers
        const phoneNumberField = document.getElementById('reg-mobile');
        if (phoneNumberField) {
            phoneNumberField.addEventListener('input', function (e) {
                // Remove any non-numeric characters
                this.value = this.value.replace(/[^0-9]/g, '');
            });

            phoneNumberField.addEventListener('paste', function (e) {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                const numbersOnly = paste.replace(/[^0-9]/g, '');
                this.value = numbersOnly;
            });
        }
    }
}

// Notify Flutter that page is loaded
window.addEventListener('load', function () {
    console.log('✅ Event Check-In page loaded');

    // Setup field error clearing on input
    setupFieldErrorClearing();

    sendToFlutter({
        type: 'pageLoaded',
        timestamp: new Date().toISOString()
    });
});
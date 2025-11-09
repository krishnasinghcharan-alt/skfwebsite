document.addEventListener('DOMContentLoaded', function() {
    // This will hold the data from products.json
    let productData = {};

    // Centralized mapping for different loan types to specific WhatsApp numbers
    const teamMemberMapping = {
        'Home Loan': { name: 'Krishna Singh', number: '918118838772' },
        'LAP': { name: 'Krishna Singh', number: '918118838772' },
        'Personal Loan': { name: 'Saroj Choudhary', number: '918118822628' },
        'Business Loan': { name: 'Sona Mulani', number: '919352358494' },
        'Vehicle Loan': { name: 'Mannu Choudhary', number: '919358973156' },
        'Insurance': { name: 'Rajendra Singh', number: '919214104963' },
        'fallback': { name: 'Rajendra Singh', number: '919214104963' } // Default number
    };

    // Data for team member modals
    const teamMemberDetails = {
        'rajendra-singh': { name: 'राजेंद्र सिंह', title: 'Founder', img: 'https://res.cloudinary.com/dugvqluo2/image/upload/v1758028732/image_2025-09-16_184847409_n0ga13.png', bio: 'जब हमने श्री करणी कृपा एसोसिएट्स शुरू किया, तो हमारा एक ही सपना था - यह सुनिश्चित करना कि हमारे क्षेत्र में किसी को भी वित्तीय सहायता की आवश्यकता होने पर अकेला या गुमराह महसूस न हो। हम सिर्फ ऋण प्रदान नहीं करते; हम रिश्ते बनाते हैं और सपनों को साकार करने में मदद करते हैं। आपका विश्वास हमारी सबसे बड़ी संपत्ति है।', social: { whatsapp: '919214104963' } },
        'krishna-singh': { name: 'Krishna Singh', title: 'Marketing Head', img: 'https://res.cloudinary.com/dhme90fr1/image/upload/v1756629459/PHOTO-2025-08-28-13-18-32_h8oozl.jpg', bio: 'Krishna leads our marketing efforts, connecting with clients across Rajasthan to provide them with the best financial solutions. His expertise lies in Home and LAP loans.', social: { whatsapp: '918118838772' } },
        'sona-mulani': { name: 'Sona Mulani', title: 'Branch Manager', img: 'https://res.cloudinary.com/dhme90fr1/image/upload/v1756628063/PHOTO-2025-08-28-13-05-09_oqhbv6.jpg', bio: 'Sona manages our branch operations, ensuring a smooth process for every client. She specializes in handling Business Loan applications with precision.', social: { whatsapp: '919352358494' } },
        'saroj-choudhary': { name: 'Saroj Choudhary', title: 'Team Leader', img: 'https://res.cloudinary.com/dhme90fr1/image/upload/v1756991306/WhatsApp_Image_2025-08-28_at_11.52.11_AM_mffbbw.jpg', bio: 'As a Team Leader, Saroj guides her team to achieve targets and provide excellent customer service, with a focus on Personal Loans.', social: { whatsapp: '918118822628' } },
        'mannu-choudhary': { name: 'Mannu Choudhary', title: 'Team Leader', img: 'https://res.cloudinary.com/dhme90fr1/image/upload/v1756628064/PHOTO-2025-08-28-13-18-11_b5qpie.jpg', bio: 'Mannu is an expert in Vehicle Loans, leading her team to help clients purchase their dream cars and bikes with ease.', social: { whatsapp: '919358973156' } }
        // You can add more members here following the same structure
    };

    // Select all necessary elements from the DOM
    const mainContentContainer = document.getElementById('main-content-container');
    const loanTemplatePage = document.getElementById('loan-page-template');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mainNav = document.getElementById('main-nav');
    const pages = document.querySelectorAll('.page');

    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const emiCalculatorPage = document.getElementById('emi-calculator-page');

    // --- 1. SETUP UI THAT DOESN'T NEED PRODUCT DATA ---
    function initializeStaticUI() {
        setupAnimations();
        generateNavigation();
        setupCounters();
        setupThankYouModal();
        setupForms();
        initializeCarousels();
        // renderRightSidebar(); // Removed as per request
        setupTeamMemberModal();
        setupPrivacyBanner();
        setupBasicEventListeners();
    }

    // --- 2. FETCH DATA AND RENDER DYNAMIC CONTENT ---
    async function initializeDynamicContent() {
        try {
            const response = await fetch('products.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            productData = await response.json(); // Correctly assign fetched data
            setupChatbot(); // Re-enabled as per request.
            generateNavigation(); // Regenerate nav with product data for the dropdown
            
            let initialHash = window.location.hash.substring(1) || 'home';
            showPage(initialHash); // This will now correctly show the initial page on load

        } catch (error) {
            console.error('Failed to load product data:', error);
            if(mainContentContainer) mainContentContainer.innerHTML = `<p class="text-red-500 text-center">Error: Could not load product information. Please try again later.</p>`;
        }
    }

    async function sendDataToGoogleSheet(data) {
        const scriptURL = 'https://script.google.com/macros/s/AKfycbycYpHtM0fkSToYUDR4Xq41cZ0V7zuY3qr1vExI4sM6MQXuSnSDjecO2P4Z2eJyqjwU/exec';
        const payload = {
            full_name: data.name || data.fullName || "",
            mobile_number: data.mobile || data.mobileNumber || "",
            city: data.city || "",
            pincode: data.pincode || "",
            employment_type: data.employmentType || "",
            income: data.monthlySalary || data.monthlyIncome || "",
            running_loan: data.runningLoan || "",
            running_loan_details: data.runningLoanDetails || data.message || "",
            required_amount: data.requiredLoanAmount || "",
            loan_type: (data.product === 'Insurance' ? `${data.insuranceType} Insurance` : data.product) || data.loanType || data.subject || "",
            tenure: data.tenure || "",
            emi_estimate: data.emi || "",
            roi: data.roi || ""
        };

        try {
            await fetch(scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(payload),
                 headers: { "Content-Type": "text/plain;charset=utf-8" }
            });
            console.log('Data submission to Google Sheet initiated.');
        } catch (error) {
            console.error('Error submitting data to Google Sheet:', error);
        }
    }

    function setupBasicEventListeners() {
        addLinkListeners(document);
        window.addEventListener('hashchange', () => {
            let hash = window.location.hash.substring(1) || 'home';
            showPage(hash);
        });

        mobileMenuButton.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('is-open');
            mobileMenuButton.classList.toggle('is-active', isOpen);
        });

        // Back to Top Button Logic
        const backToTopBtn = document.getElementById('back-to-top-btn');
        if (backToTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    backToTopBtn.classList.remove('hidden');
                } else {
                    backToTopBtn.classList.add('hidden');
                }
            });

            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    function setupAnimations() {
        // This function is now handled by CSS animations and can be left empty or removed.
    }
    
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        const pageMappings = {
            'join-dsa': 'join-us-page',
            'join-connector': 'join-us-page',
            'careers': 'careers-page', // Added for the new careers page
            'contact': 'contact-page',
            'loans-for-government-employees': 'govt-employees-loan-page',
            'financial-advisory-services': 'financial-advisory-page',
            'privacy-policy': 'privacy-policy-page'
        };

        const [basePageId, queryParams] = pageId.split('?');
        const params = new URLSearchParams(queryParams);

        const isProductPage = productData && Object.keys(productData).length > 0 && Object.keys(productData).some(key => pageId.startsWith(key));

        const targetPageId = pageMappings[basePageId] || (isProductPage ? 'loan-page-template' : `${basePageId}-page`);

        // Dynamically update navigation based on the current page
        generateNavigation(); // Reverted to static navigation
        
        const targetPage = document.getElementById(targetPageId) || document.getElementById('home-page');

        if(targetPage) {
            targetPage.classList.add('active');

            if (pageId === 'emi-calculator') renderEmiCalculator();
            if (isProductPage) renderLoanPage(pageId);

            // Render static pages if they are requested based on the original hash
            if (pageId === 'home') renderHomePage();
            if (pageId === 'about') renderAboutPage();
            if (pageId === 'contact') renderContactPage();
            if (pageId === 'join-dsa' || pageId === 'join-connector') renderJoinUsPage();
            if (pageId === 'careers') renderCareersPage(); // Render the new careers page
            if (pageId === 'loans-for-government-employees') renderGovtEmployeeLoanPage();
            if (pageId === 'financial-advisory-services') renderFinancialAdvisoryPage();
            if (basePageId === 'eligibility-form') renderEligibilityFormPage(params.get('product'));

            if (['join-dsa', 'join-connector', 'our-services'].includes(pageId)) {
                setTimeout(() => {
                    const element = document.getElementById(pageId);
                    if (element) {
                         element.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            } else if (basePageId === 'home' && params.has('scroll')) {
                // Special handling for scrolling to a section on the home page
                const sectionId = params.get('scroll');
                setTimeout(() => {
                    const element = document.getElementById(sectionId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            } else {
                window.scrollTo(0, 0);
            }
        }

        // Close mobile menu on page change
        if (mainNav.classList.contains('is-open')) {
            mainNav.classList.remove('is-open');
            mobileMenuButton.classList.remove('is-active');
        }
        // addTiltEffectToNavLinks(); // Removed to prevent button visibility issues
    }
    
    function updateMetaTags(pageId) {
        const titleEl = document.getElementById('meta-title');
        const descriptionEl = document.getElementById('meta-description');
        
        // ये डिफ़ॉल्ट टैग्स हैं (होमपेज के लिए)
        let title = 'Loan & Insurance Services in Rajasthan | Shree Karni Kripa Associates, Ajmer';
        let description = 'SKF Ajmer provides Home, Personal, & Business Loans across all of Rajasthan. Get expert financial advice and quick insurance solutions in Jaipur, Jodhpur, Udaipur & more.';
    
        // हर पेज के लिए विशेष (Specific) टैग्स
        switch (pageId) {
            // मुख्य लोन पेज
            case 'home-loan':
                title = 'Best Home Loan in Rajasthan - Low Interest Rates | SKF Ajmer';
                description = 'Need a Home Loan in Rajasthan? SKF Associates offers expert guidance & compares 90+ banks for new homes, construction, or balance transfers in Ajmer, Jaipur & more.';
                break;
            case 'business-loan':
                title = 'Business Loan in Rajasthan for MSME & Startups | SKF Ajmer';
                description = 'Need a Business Loan in Rajasthan? SKF Associates offers fast approval on Working Capital, Term Loans & more for MSMEs in Ajmer, Jaipur & Jodhpur.';
                break;
            case 'personal-loan':
                title = 'Instant Personal Loan in Rajasthan - Quick Approval | SKF Ajmer';
                description = 'Need a fast Personal Loan in Rajasthan? SKF Associates offers quick approval for medical needs, weddings, or travel. Low interest rates. Apply now!';
                break;
            case 'vehicle-loan':
                title = 'Car Loan in Rajasthan (New & Used) - Low EMI | SKF Ajmer';
                description = 'Get the best Car Loan in Rajasthan with SKF Associates. We offer low interest rates & fast approval for New Cars, Used Cars, and Two-Wheeler Loans.';
                break;
            case 'lap-loan':
                title = 'Loan Against Property (LAP) in Rajasthan @ Low Interest | SKF Ajmer';
                description = 'Unlock the value of your property in Rajasthan. SKF Associates offers Loan Against Property (LAP) for business, personal needs, or debt consolidation.';
                break;
    
            // मुख्य बीमा पेज
            case 'health-insurance':
                title = 'Best Health Insurance Plans in Rajasthan | Compare Policies | SKF Ajmer';
                description = 'Compare & buy the best health insurance plans in Rajasthan. SKF Associates helps you choose the perfect family floater, personal, or top-up plan. Get quote!';
                break;
            case 'life-insurance':
                title = 'Best Life Insurance & Term Plans in Rajasthan | SKF Associates';
                description = 'Secure your family\'s future. Compare the best Life Insurance, Term Plans, and Guaranteed Income Plans in Rajasthan with expert advice from SKF Associates.';
                break;
            case 'vehicle-insurance':
                title = 'Car & Bike Insurance in Rajasthan | (Renew Online) | SKF Ajmer';
                description = 'Get the best Car & Bike insurance in Rajasthan. Compare policies, renew online, & get the right add-ons (Zero Dep, RTI). Free quotes from SKF Associates.';
                break;
    
            // अन्य मुख्य पेज
            case 'about':
                title = 'About Shree Karni Kripa Associates | Trusted Loan & Insurance Advisor in Ajmer';
                description = 'Learn the story of SKF Ajmer. Discover our mission to provide honest financial advice and meet the expert team serving Rajasthan for all your loan and insurance needs.';
                break;
            case 'contact':
                title = 'Contact Us | Shree Karni Kripa Associates | Ajmer, Rajasthan';
                description = 'Get in touch with SKF Associates for expert loan & insurance advice. Call us at 9214104963 or visit our office in Ajmer, Rajasthan.';
                break;
            case 'emi-calculator':
                title = 'EMI Calculator for Home, Car, Personal Loan | SKF Associates';
                description = 'Calculate your EMI for Home, Car, or Personal Loans with our easy-to-use EMI calculator. Plan your finances with SKF Associates, Rajasthan.';
                break;
            case 'join-us': // यह 'join-dsa' और 'join-connector' दोनों के लिए काम करेगा
            case 'join-dsa':
            case 'join-connector':
                title = 'Financial Franchise & Partner Opportunity in Rajasthan | Join SKF Associates';
                description = 'Start your finance business in Rajasthan! Partner with SKF Associates via our franchise model or join as a loan advisor. Earn unlimited income with best payouts & support.';
                break;
            case 'careers':
                title = 'Job: Relationship Manager (Loan Sales) - Ajmer/Rajasthan | SKF Associates';
                description = 'Hiring Relationship Manager at SKF Ajmer! Source loan files (Home, Business, Personal) in Ajmer (Salary) or Rajasthan (Incentives). Best payouts. Apply now!';
                break;
            case 'loans-for-government-employees':
                title = 'Special Loan Offers for Government Employees in Rajasthan | SKF Ajmer';
                description = 'Special low-interest Personal, Home, & Car Loans for Government Employees in Rajasthan. SKF Associates offers fast approval & minimal documents. Apply now!';
                break;
            case 'financial-advisory-services':
                title = 'Holistic Financial Advisory in Rajasthan | SKF Associates';
                description = 'We offer more than loans! SKF Associates provides expert guidance on Life Insurance (Term Plans), Property Verification, and connects you to trusted partners.';
                break;
        }
    
        // टाइटल और डिस्क्रिप्शन को सेट करें
        document.title = title;
        if (titleEl) titleEl.textContent = title;
        if (descriptionEl) descriptionEl.setAttribute('content', description);
    }

    function renderLoanPage(pageId) {
        const parts = pageId.split('-');
        let mainCategoryKey = '';
        let subTypeKey = null;

        // Find the correct main category key by checking against productData
        for (const key in productData) {
            if (pageId.startsWith(key)) {
                mainCategoryKey = key;
                subTypeKey = pageId.substring(key.length + 1) || null;
                break;
            }
        }
        
        const mainCategory = productData[mainCategoryKey];
        if (!mainCategory) { console.error('Category not found for', pageId); return; }

        updateMetaTags(pageId); // Update meta tags for product pages if needed in future
        
        const subtype = subTypeKey ? mainCategory.subtypes[subTypeKey] : null;
        const contentData = subtype || mainCategory;
        const isInsurance = pageId.includes('insurance');

        // If the template page isn't active, we can't find these elements.
        // So we'll find them inside the template page itself.
        if (!loanTemplatePage) return;
        
        const loanPageContentContainer = loanTemplatePage.querySelector('#loan-page-content');
        const images = (subtype && subtype.images && subtype.images.length > 0) ? subtype.images : mainCategory.images || [];

        let breadcrumbHtml = `<a href="#home" class="page-link hover:text-orange-600">Home</a> <span class="mx-2">/</span> <a href="#${mainCategoryKey}" class="page-link hover:text-orange-600">${mainCategory.name}</a>`;
        if (subtype) {
             breadcrumbHtml += ` <span class="mx-2">/</span> <span class="font-semibold text-gray-800">${subtype.name}</span>`;
        } else {
             breadcrumbHtml += ` <span class="mx-2">/</span> <span class="font-semibold text-gray-800">Overview</span>`;
        }
        loanTemplatePage.querySelector('#breadcrumbs').innerHTML = breadcrumbHtml;
        addLinkListeners(loanTemplatePage.querySelector('#breadcrumbs'));

        // --- DESKTOP SIDEBAR ---
        const sidebarContainer = loanTemplatePage.querySelector('#loan-sidebar');
        let sidebarHtml = `<h3 class="text-xl font-bold mb-4">${mainCategory.name}</h3><ul>`;
        const baseKey = mainCategoryKey; // e.g., "home-loan"
        const overviewText = !mainCategory.subtypes || Object.keys(mainCategory.subtypes).length === 0 ? mainCategory.name : 'Overview';
        sidebarHtml += `<li><a href="#${baseKey}" class="sidebar-link page-link ${!subTypeKey ? 'active' : ''}">${overviewText}</a></li>`;
        for (const key in mainCategory.subtypes) {
            if (mainCategory.subtypes.hasOwnProperty(key)) {
                // Skip the special 'overview' subtype if it exists
                if (key === 'overview') continue;

                sidebarHtml += `<li><a href="#${baseKey}-${key}" class="sidebar-link page-link ${subTypeKey === key ? 'active' : ''}">${mainCategory.subtypes[key].name}</a></li>`;
            }
        }
        sidebarHtml += `</ul>`;
        if(sidebarContainer) sidebarContainer.innerHTML = sidebarHtml;
        if (sidebarContainer) {
            sidebarContainer.querySelector(`.sidebar-link[href="#${pageId}"]`)?.classList.add('active');
        }
        let infoGridHtml = '';
        if (isInsurance) {
             infoGridHtml = `<div class="bg-blue-50 p-4 rounded-lg"><p class="text-sm text-gray-600">Policy Tenure</p><p class="text-xl font-bold text-blue-700">${contentData.tenure}</p></div>`;
        } else {
             infoGridHtml = `
                <div class="bg-blue-50 p-4 rounded-lg"><p class="text-sm text-gray-600">Starting ROI</p><p class="text-xl font-bold text-blue-700">${contentData.roi}*</p></div>
                <div class="bg-blue-50 p-4 rounded-lg"><p class="text-sm text-gray-600">Max Tenure</p><p class="text-xl font-bold text-blue-700">${contentData.tenure}</p></div>`;
        }

        let calculatorHtml = '';
        if (!isInsurance) {
            calculatorHtml = `
                <div>
                    <h2 class="text-2xl font-bold mt-8 mb-4">EMI Calculator</h2>
                    <div class="bg-gray-50 p-6 rounded-lg border">
                        <form class="emi-calculator-form grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                            <div><label class="block font-medium">Loan Amount (₹)</label><input type="number" class="loan-amount w-full mt-1 p-2 border rounded" value="1000000" required></div>
                            <div><label class="block font-medium">Interest Rate (% p.a.)</label><input type="number" step="0.01" class="loan-rate w-full mt-1 p-2 border rounded" value="${parseFloat(contentData.roi) || 10}" required></div>
                            <div><label class="block font-medium">Loan Tenure (Years)</label><input type="number" class="loan-tenure w-full mt-1 p-2 border rounded" value="${parseInt(contentData.tenure) || 10}" required></div>
                            <button type="submit" class="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 w-full">Calculate</button>
                        </form>
                        <div class="mt-4 text-center"><p class="text-lg">Your Monthly EMI is:</p><p class="emi-result text-3xl font-bold text-blue-600 mt-1">₹0</p></div>
                        <div class="mt-6 border-t pt-4">
                            <h3 class="font-bold text-md mb-3 text-center">Download Schedule & Set Reminders</h3>
                            <div class="flex flex-col sm:flex-row gap-2 mb-4">
                                <button class="loan-page-download-btn w-full bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-black text-sm" disabled>Download PDF</button>
                                <button class="loan-page-gcal-btn w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 text-sm" disabled>Google Calendar</button>
                                <button class="loan-page-wa-btn w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 text-sm" disabled>WhatsApp</button>
                            </div>
                            <a href="#eligibility-form?product=${mainCategoryKey}" class="page-link btn-highlight block w-full bg-gray-200 text-black font-bold py-3 px-4 rounded-lg hover:bg-gray-300 text-center transition-all">Apply for this Loan Now</a>
                        </div>
                    </div>
                </div>`;
        }
        
        const imageCarouselHtml = `
            <div class="swiper-container loan-image-carousel rounded-lg overflow-hidden">
                <div class="swiper-wrapper">
                    ${images.map(img => `<div class="swiper-slide" style="background-color: #e9ecef; background-image: url('https://res.cloudinary.com/diqo7qmnw/image/upload/e_grayscale,o_10/v1754217266/logo1_lt1w3w.png'); background-repeat: no-repeat; background-position: center; background-size: 50%;"><img src="${img.replace('/upload/', '/upload/w_1200,q_auto:good,f_auto/')}" alt="${mainCategory.name}" class="w-full h-96 object-contain" loading="lazy" decoding="async"></div>`).join('')}
                </div>
                <div class="swiper-button-next text-white"></div>
                <div class="swiper-button-prev text-white"></div>
            </div>`;


        // --- SUBTYPE LISTING FOR OVERVIEW PAGE ---
        let subtypeListingHtml = '';
        if (!subtype && mainCategory.subtypes && Object.keys(mainCategory.subtypes).length > 0) {
            subtypeListingHtml = `
                <div class="border-t pt-8">
                    <h2 class="text-2xl font-bold mb-6 text-slate-800">Explore ${mainCategory.name} Options</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            `;
            for (const key in mainCategory.subtypes) {
                if (mainCategory.subtypes.hasOwnProperty(key) && key !== 'overview') {
                    const sub = mainCategory.subtypes[key];
                    subtypeListingHtml += `
                        <a href="#${baseKey}-${key}" class="page-link block bg-slate-50 p-6 rounded-lg shadow-sm hover:shadow-lg hover:bg-blue-50 border-l-4 border-slate-200 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1">
                            <h3 class="text-xl font-bold text-primary-color">${sub.name}</h3>
                            <p class="text-gray-600 mt-2 text-sm">${sub.description || ''}</p>
                            <span class="text-blue-600 font-semibold mt-4 inline-block">Learn More &rarr;</span>
                        </a>`;
                }
            }
            subtypeListingHtml += `</div></div>`;
        }


        let mainContentHtml = `
            <div class="bg-white p-8 rounded-lg shadow-md space-y-8">
                <div>
                    <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">${contentData.name}</h1>
                    <p class="text-lg text-gray-600">${subtype ? contentData.eligibility : contentData.overview}</p>
                </div>

                ${imageCarouselHtml}

                ${subtypeListingHtml}
                
                <div class="grid md:grid-cols-3 gap-4 text-center">
                    ${infoGridHtml}
                    <div class="bg-green-100 p-4 rounded-lg"><p class="text-sm text-gray-600">${isInsurance ? 'Coverage' : 'Loan Amount'}</p><p class="text-xl font-bold text-green-800">As per Profile</p></div>
                </div>

                <div class="border-t pt-8">
                    <div class="grid md:grid-cols-2 gap-x-12 gap-y-8">
                        <div>
                            <h3 class="text-2xl font-bold mb-4 text-slate-800">Features & Benefits</h3>
                            <div class="space-y-4">
                                ${(contentData.features || []).map(f => `
                                    <div class="flex items-start">
                                        <svg class="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <span class="text-gray-700">${f}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold mb-4 text-slate-800">Documents Required</h3>
                             <div class="space-y-4">
                                ${(contentData.documents || []).map(d => `
                                    <div class="flex items-start">
                                        <svg class="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        <span class="text-gray-700">${d}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                 <div class="border-t pt-8">
                    <h3 class="text-2xl font-bold mb-6 text-slate-800">Frequently Asked Questions (FAQ)</h3>
                    <div class="space-y-4">${(contentData.faq || []).map(f => `
                        <div class="border border-gray-200 rounded-lg">
                            <div class="faq-question flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50">
                                <h4 class="font-semibold text-gray-800">${f.q}</h4>
                                <svg class="w-5 h-5 text-gray-500 transition-transform transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                            <div class="faq-answer px-4 pb-4 text-gray-600"><p>${f.a}</p></div>
                        </div>`).join('')}
                    </div>
                </div>
                ${calculatorHtml}                
                <div class="text-center border-t pt-8 mt-8"><a href="#eligibility-form?product=${mainCategoryKey}" class="page-link btn-highlight inline-block bg-primary-color text-white font-bold py-4 px-12 rounded-lg hover:bg-blue-700 transition-all text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1">${isInsurance ? 'Get a Quote' : 'Apply Now'}</a></div>
            </div>
        `;
        loanTemplatePage.querySelector('#loan-page-content').innerHTML = mainContentHtml;
        addLinkListeners(loanTemplatePage.querySelector('#loan-page-content'));

        new Swiper('.loan-image-carousel', {
            loop: true,
            autoplay: { delay: 3000, disableOnInteraction: false },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        });
        
        if (!isInsurance) {
            loanPageContentContainer.querySelector('.emi-calculator-form').addEventListener('submit', handleEmiCalculation);
        }

        loanPageContentContainer.querySelectorAll('.faq-question').forEach(q => q.addEventListener('click', () => {
            const answer = q.nextElementSibling;
            const icon = q.querySelector('svg');
            if(answer.style.maxHeight) {
                answer.style.maxHeight = null;
                icon.style.transform = 'rotate(0deg)';
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
                icon.style.transform = 'rotate(180deg)';
            }
        }));
    }

    function handleCareerFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Map form data to what Google Sheet function expects
        // This part sends the data to your Google Sheet
        const sheetData = {
            fullName: data.fullName,
            mobile: data.mobile,
            city: data.city,
            message: `Email: ${data.email}\nExperience: ${data.experience}`,
            loanType: 'Career Application: Relationship Manager' // To identify in the sheet
        };
        sendDataToGoogleSheet(sheetData);
        
        // This part sends the data to your WhatsApp number
        const whatsappNumber = '918118838772'; // Your WhatsApp number
        const message = `*New Career Application*\n\n*Name:* ${data.fullName}\n*Mobile:* ${data.mobile}\n*Email:* ${data.email}\n*City:* ${data.city}\n*Experience:* ${data.experience || 'None'}`;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        // Show a thank you message and then redirect
        form.innerHTML = `<div class="text-center py-10 bg-green-50 rounded-lg border border-green-200"><h3 class="text-2xl font-bold text-green-700">Thank You!</h3><p class="mt-2 text-gray-600">Your application has been received. We will get in touch with you shortly.</p><p class="text-sm text-gray-500 mt-4">Redirecting you to WhatsApp...</p></div>`;

        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 2000); // 2-second delay before opening WhatsApp
    }

    function handleEmiCalculation(e) {
        e.preventDefault();
        const form = e.target;
        const amount = parseFloat(form.querySelector('.loan-amount').value);
        const rate = parseFloat(form.querySelector('.loan-rate').value);
        const tenure = parseFloat(form.querySelector('.loan-tenure').value);
        const resultContainer = form.nextElementSibling.querySelector('.emi-result');
        const downloadBtn = form.parentElement.querySelector('.loan-page-download-btn');
        const gcalBtn = form.parentElement.querySelector('.loan-page-gcal-btn');
        const waBtn = form.parentElement.querySelector('.loan-page-wa-btn');

        if (amount > 0 && rate > 0 && tenure > 0) {
            const monthlyRate = rate / (12 * 100);
            const n = tenure * 12;
            const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
            resultContainer.textContent = `₹${Math.round(emi).toLocaleString('en-IN')}`;
            [downloadBtn, gcalBtn, waBtn].forEach(btn => btn.disabled = false);
        } else {
            resultContainer.textContent = '₹0';
        }
    }

    function renderEmiCalculator() {
        if(emiCalculatorPage) emiCalculatorPage.innerHTML = `
            <!-- This is the content for the EMI Calculator Page -->
            <!-- It was missing from the script -->
            <div class="bg-gray-100">
                <div class="container mx-auto px-6 py-12">
                    <div class="text-center mb-12">
                        <h1 class="text-4xl font-bold text-slate-800">Smart EMI Calculator</h1>
                        <p class="text-gray-600 mt-2 max-w-2xl mx-auto">Plan your finances with our easy-to-use EMI calculator and get all the loan details you need in one place.</p>
                    </div>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div class="lg:col-span-3 bg-white p-8 rounded-lg shadow-lg">
                            <h2 class="text-2xl font-bold mb-6">Calculate Your EMI</h2>
                            <form id="main-emi-form" class="space-y-4">
                                <div>
                                    <label for="loan-type" class="block font-medium">Loan Type</label>
                                    <select id="loan-type" class="w-full mt-1 p-3 border rounded-lg bg-white">
                                        <option value="8.50" data-loan-key="home-loan">Home Loan</option>
                                        <option value="10.25" data-loan-key="personal-loan">Personal Loan</option>
                                        <option value="10.50" data-loan-key="business-loan">Business Loan</option>
                                        <option value="9.00" data-loan-key="vehicle-loan">Vehicle Loan</option>
                                        <option value="9.50" data-loan-key="lap-loan">Loan Against Property</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="emi-amount" class="block font-medium">Loan Amount (₹)</label>
                                    <input type="number" id="emi-amount" class="w-full mt-1 p-3 border rounded-lg" value="2500000" required>
                                </div>
                                <div>
                                    <label for="emi-rate" class="block font-medium">Interest Rate (% p.a.)</label>
                                    <input type="number" step="0.01" id="emi-rate" class="w-full mt-1 p-3 border rounded-lg" value="8.50" required>
                                </div>
                                <div>
                                    <label for="emi-tenure" class="block font-medium">Loan Tenure (Years)</label>
                                    <input type="number" id="emi-tenure" class="w-full mt-1 p-3 border rounded-lg" value="20" required>
                                </div>
                                 <div>
                                    <label for="bank-preference" class="block font-medium">Bank Preference (Optional)</label>
                                    <input type="text" id="bank-preference" class="w-full mt-1 p-3 border rounded-lg" placeholder="e.g., HDFC, SBI, ICICI">
                                </div>
                                <button type="submit" class="w-full bg-primary-color text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">Calculate</button>
                            </form>
                            <div id="emi-main-result" class="mt-6 text-center bg-gray-50 p-6 rounded-lg">
                                <!-- Result displayed here -->
                            </div>
                        </div>

                        <div class="lg:col-span-2 space-y-6">
                            <div class="bg-white p-6 rounded-lg shadow-lg">
                                <h3 class="font-bold text-lg mb-3">💡 Smart Suggestions</h3>
                                <div id="ai-suggestions" class="text-sm text-gray-700 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                    <p>Enter your loan details to get personalized suggestions for saving money.</p>
                                </div>
                            </div>
                            <div class="bg-white p-6 rounded-lg shadow-lg">
                                <h3 class="font-bold text-lg mb-3">📑 Download EMI Calendar</h3>
                                <p class="text-sm text-gray-600 mb-4">Get a detailed amortization schedule for your loan.</p>
                                <div class="flex gap-2">
                                    <button id="download-schedule-btn" class="w-full bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-black" disabled>Download PDF</button>
                                </div>
                                 <h3 class="font-bold text-lg mt-4 mb-2">Set Reminders</h3>
                                <div class="flex gap-2">
                                     <button id="gcal-reminder-btn" class="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600" disabled>Google Calendar</button>
                                     <button id="wa-reminder-btn" class="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600" disabled>WhatsApp</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        const form = document.getElementById('main-emi-form');
        const loanTypeSelect = document.getElementById('loan-type');
        const rateInput = document.getElementById('emi-rate');

        loanTypeSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            rateInput.value = selectedOption.value;
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            calculateAndDisplayMainEmi();
        });

        document.getElementById('download-schedule-btn').addEventListener('click', generatePdf);
        document.getElementById('gcal-reminder-btn').addEventListener('click', setGoogleCalendarReminder);
        document.getElementById('wa-reminder-btn').addEventListener('click', setWhatsAppReminder);

        calculateAndDisplayMainEmi(); // Initial calculation
    }

    function calculateAndDisplayMainEmi() {
        if (!document.getElementById('main-emi-form')) return; // Guard clause
        const amount = parseFloat(document.getElementById('emi-amount').value);
        const rate = parseFloat(document.getElementById('emi-rate').value);
        const tenure = parseFloat(document.getElementById('emi-tenure').value);
        const resultContainer = document.getElementById('emi-main-result');
        const suggestionsContainer = document.getElementById('ai-suggestions');
        const downloadBtn = document.getElementById('download-schedule-btn');
        const gcalBtn = document.getElementById('gcal-reminder-btn');
        const waBtn = document.getElementById('wa-reminder-btn');

        if (amount > 0 && rate > 0 && tenure > 0) {
            const monthlyRate = rate / (12 * 100);
            const n = tenure * 12;
            const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
            const totalPayment = emi * n;
            const totalInterest = totalPayment - amount;

            resultContainer.innerHTML = `
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><p class="text-sm text-gray-500">Monthly EMI</p><p class="text-2xl font-bold text-primary-color">₹${Math.round(emi).toLocaleString('en-IN')}</p></div>
                    <div><p class="text-sm text-gray-500">Total Interest</p><p class="text-2xl font-bold">₹${Math.round(totalInterest).toLocaleString('en-IN')}</p></div>
                    <div><p class="text-sm text-gray-500">Total Payment</p><p class="text-2xl font-bold">₹${Math.round(totalPayment).toLocaleString('en-IN')}</p></div>
                </div>`;
            
            let suggestion = "Consider a shorter tenure to save on interest. ";
            if (tenure > 5) {
                const shorterTenure = tenure > 10 ? tenure - 5 : Math.ceil(tenure/2);
                const shorter_n = shorterTenure * 12;
                const shorter_emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, shorter_n)) / (Math.pow(1 + monthlyRate, shorter_n) - 1);
                const shorter_totalPayment = shorter_emi * shorter_n;
                const savedInterest = totalPayment - shorter_totalPayment;
                if (savedInterest > 0) {
                    suggestion += `By choosing a ${shorterTenure}-year tenure, you could save <strong class="text-green-600">₹${Math.round(savedInterest).toLocaleString('en-IN')}</strong> in interest! Your new EMI would be ₹${Math.round(shorter_emi).toLocaleString('en-IN')}.`;
                }
            } else {
                 suggestion = "This looks like a good plan. A shorter tenure generally saves you more in interest payments over time."
            }
            suggestionsContainer.innerHTML = `<p>${suggestion}</p>`;

            [downloadBtn, gcalBtn, waBtn].forEach(btn => btn.disabled = false);
        } else {
             resultContainer.innerHTML = '<p>Please enter valid loan details.</p>';
             suggestionsContainer.innerHTML = '<p>Enter loan details to get suggestions.</p>';
             [downloadBtn, gcalBtn, waBtn].forEach(btn => btn.disabled = true);
        }
    }

    function generatePdf() {
        if (!document.getElementById('main-emi-form')) return; // Guard clause
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const amount = parseFloat(document.getElementById('emi-amount').value);
        const rate = parseFloat(document.getElementById('emi-rate').value);
        const tenure = parseFloat(document.getElementById('emi-tenure').value);

        if (!(amount > 0 && rate > 0 && tenure > 0)) {
            alert("Please calculate a valid EMI before downloading the schedule.");
            return;
        }

        // --- PDF Header ---
        const img = new Image();
        img.src = 'https://res.cloudinary.com/diqo7qmnw/image/upload/v1754217266/logo1_lt1w3w.png';
        
        const addContentToPdf = () => {
            doc.addImage(img, 'PNG', 14, 10, 20, 20);
            doc.setFontSize(16);
            doc.text("Shree Karni Kripa Associates", 105, 18, { align: 'center'});
            doc.setFontSize(10);
            doc.text("EMI Amortization Schedule", 105, 24, { align: 'center'});
            doc.setDrawColor(200);
            doc.line(14, 32, 196, 32);

            doc.autoTable({
                startY: 40,
                head: [['Loan Details', 'Value']],
                body: [
                    ['Loan Amount', `Rs. ${amount.toLocaleString('en-IN')}`],
                    ['Interest Rate', `${rate}% p.a.`],
                    ['Loan Tenure', `${tenure} Years`],
                ],
                theme: 'striped'
            });

            const monthlyRate = rate / 12 / 100;
            const numPayments = tenure * 12;
            const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

            let balance = amount;
            const tableData = [];
            for (let i = 1; i <= numPayments; i++) {
                const interest = balance * monthlyRate;
                const principal = emi - interest;
                balance -= principal;
                tableData.push([
                    i,
                    `Rs. ${Math.round(principal).toLocaleString('en-IN')}`,
                    `Rs. ${Math.round(interest).toLocaleString('en-IN')}`,
                    `Rs. ${Math.round(balance > 0 ? balance : 0).toLocaleString('en-IN')}`,
                ]);
            }

            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 10,
                head: [['#', 'Principal', 'Interest', 'Balance']],
                body: tableData,
                theme: 'grid'
            });

            doc.save('EMI_Schedule_SKF_Ajmer.pdf');
        };

        // Ensure image is loaded before generating PDF
        if (img.complete) {
            addContentToPdf();
        } else {
            img.onload = addContentToPdf;
        }
    }

    function setGoogleCalendarReminder() {
        if (!document.getElementById('main-emi-form')) return; // Guard clause
        const emi = document.querySelector('#emi-main-result .text-primary-color')?.textContent || 'your EMI';
        const eventTitle = `Pay Loan EMI of ${emi}`;
        const eventDetails = `Don't forget to pay your loan EMI. For any queries, contact Shree Karni Kripa Associates.`;
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 5, 10, 0, 0);
        const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, '');
        const startDate = formatDate(nextMonth);
        const endDate = formatDate(new Date(nextMonth.getTime() + 60 * 60 * 1000));
        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(eventDetails)}&recur=RRULE:FREQ=MONTHLY`;
        window.open(url, '_blank');
    }

    function setWhatsAppReminder(){
        if (!document.getElementById('main-emi-form')) return; // Guard clause
        const emi = document.querySelector('#emi-main-result .text-primary-color')?.textContent || 'your EMI';
        const phone = '919214104963'; 
        const message = `Hello SKF Ajmer, please set a monthly reminder for my loan EMI of ${emi}.`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    }

    function handleLinkClick(e) {
        const sidebarContainer = document.getElementById('loan-sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        const href = e.currentTarget.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            window.location.hash = href;
        }
        if (sidebarContainer && sidebarContainer.classList.contains('open')) {
            sidebarContainer.classList.remove('open');
            sidebarOverlay.classList.remove('open');
        }
        // Close mobile menu on link click
        if (mainNav && mainNav.classList.contains('is-open')) {
            mainNav.classList.remove('is-open');
            mobileMenuButton.classList.remove('is-active');
        }
    }
    
    function addLinkListeners(container){
        if(container) {
            container.querySelectorAll('.page-link').forEach(link => {
                link.removeEventListener('click', handleLinkClick); // Prevent duplicates
                link.addEventListener('click', handleLinkClick);
            });
        }
    }
    
    function generateNavigation() {
        // Reverted to static navigation as requested
        const productLinks = `
                <li><a href="#home-loan" class="page-link">Home Loan</a></li>
                <li><a href="#business-loan" class="page-link">Business Loan</a></li>
                <li><a href="#personal-loan" class="page-link">Personal Loan</a></li>
                <li><a href="#vehicle-loan" class="page-link">Vehicle Loan</a></li>
                <li><a href="#lap-loan" class="page-link">Loan Against Property</a></li>
                <li><a href="#health-insurance" class="page-link">Insurance</a></li>
            `;
        
        const navItems = [
            // This button is for the mobile menu
            { href: '#eligibility-form', text: 'Apply Now', isApplyNow: true, visibility: 'lg:hidden' },
            { href: '#home', text: 'Home' },
            { 
                href: '#our-services', 
                text: 'Products', 
                dropdown: productLinks
            },
            { href: '#about', text: 'About Us' },
            { href: 'https://karni-kripa.blogspot.com', text: 'Blog', target: '_blank' },
            { href: '#emi-calculator', text: 'EMI Calculator' },
            { href: '#join-dsa', text: 'Join Us' },
            { href: '#contact', text: 'Contact Us' },
            // This button is for the desktop menu
            { href: '#eligibility-form', text: 'Apply Now', isApplyNow: true, visibility: 'hidden lg:block' },
        ];

        const desktopNavUl = document.getElementById('desktop-nav-ul');
        const footerQuickLinksUl = document.getElementById('footer-quick-links');
        const footerAllLinksUl = document.getElementById('footer-all-links');

        if (desktopNavUl) {
            desktopNavUl.innerHTML = navItems.map(item => {
                let liClasses = item.visibility || '';
                if (item.dropdown) {
                    liClasses += ' nav-item-with-dropdown'; // Add the dropdown class
                    return `
                        <li class="${liClasses.trim()}">
                            <a href="${item.href}" class="nav-link page-link">${item.text}</a>
                            <ul class="nav-dropdown">${item.dropdown}</ul>
                        </li>`;
                }
                // Only set target="_blank" for external links
                const isExternal = item.href.startsWith('http');
                return `<li class="${liClasses}"><a href="${item.href}" class="nav-link page-link ${item.isApplyNow ? 'apply-now btn-highlight' : ''}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}>${item.text}</a></li>`;
            }).join('');
        }
        
        if (footerAllLinksUl) {
             footerAllLinksUl.innerHTML = navItems.filter(item => !item.isApplyNow).map(item => `
                <li><a href="${item.href}" class="page-link">${item.text}</a></li>
            `).join('');
        }
        addLinkListeners(footerAllLinksUl);
        addLinkListeners(desktopNavUl);
    }

    function handleEligibilityFormSubmit(e) {
        e.preventDefault();
        const form = e.target; // The form element
        const submitButton = form.querySelector('button[type="submit"]');

        // Disable the button and show a loading state
        submitButton.disabled = true;
        submitButton.innerHTML = 'Submitting...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        sendDataToGoogleSheet(data);

        const teamMember = teamMemberMapping[data.loanType] || teamMemberMapping['fallback'];

        // Redirect to WhatsApp after a short delay
        setTimeout(() => {
            const message = `New Eligibility Lead:\nName: ${data.fullName}\nMobile: ${data.mobile}\nCity: ${data.city}\nLoan Type: ${data.loanType}\nEmployment: ${data.employmentType}\nIncome: ₹${data.monthlyIncome}`;
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${teamMember.number}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');

            // Show a thank you message on the page
            const formContainer = form.parentElement;
            formContainer.innerHTML = `
                <div class="text-center py-10">
                    <h2 class="text-3xl font-bold text-green-600 mb-4">Thank You!</h2>
                    <p class="text-gray-700">We have received your details and will contact you soon.</p>
                    <p class="text-sm text-gray-500 mt-2">If you were not redirected, <a href="${whatsappUrl}" target="_blank" class="text-blue-600 underline">click here</a>.</p>
                </div>
            `;
        }, 1500); // 1.5-second delay
    }

    function handleContactFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.subject = "Contact Us Inquiry"; // Add subject for sheet
        
        sendDataToGoogleSheet(data);
        showThankYouModal(teamMemberMapping.fallback.number, `New Contact Inquiry:\nName: ${data.fullName}\nMobile: ${data.mobile}`);
        form.reset();
    }

    function handleJoinFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const userName = data.fullName || 'Partner';
        data.loanType = `Join Us: ${form.dataset.role || 'DSA'}`;

        // 1. Send data to Google Sheet
        sendDataToGoogleSheet(data);

        // 2. Replace form with a personalized thank you message and WhatsApp button
        const formContainer = form.parentElement;
        const whatsappNumber = '919214104963'; // Rajendra Singh's number
        const message = `Hello Rajendra Singh, I have just applied to join SKF as a partner. My name is ${userName}.`;
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        formContainer.innerHTML = `
            <div class="text-center py-10 px-4">
                <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h3 class="text-2xl font-bold text-green-600 mt-4">Thank You, ${userName}!</h3>
                <p class="text-gray-600 mt-2">Your application has been submitted successfully. Our team will get in touch with you shortly.</p>
                <div class="mt-8">
                    <a href="${whatsappUrl}" target="_blank" class="inline-block w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors">Chat with Rajendra Singh</a>
                </div>
            </div>
        `;
    }

    function setupForms() {
        // This function will be called, but the forms are inside dynamic content.
        // We add listeners to the document and delegate events.
        document.addEventListener('submit', function(e) {
            if (e.target.id === 'smart-eligibility-form') handleEligibilityFormSubmit(e);
            if (e.target.id === 'contact-us-form') handleContactFormSubmit(e);
            // if (e.target.id === 'right-sidebar-form') handleContactFormSubmit(e); // Use same handler for sidebar form
            if (e.target.id === 'dsa-form') handleJoinFormSubmit(e);
            if (e.target.id === 'career-application-form') handleCareerFormSubmit(e);
        });
    }
    
    function setupChatbot() {
        const chatContainer = document.getElementById('chat-container');
        chatContainer.innerHTML = `
            <div id="chat-backdrop" class="hidden"></div>
            <div id="proactive-bubble-container"></div>
            <div id="chat-window" class="flex">
                <div id="chat-header">
                    <div id="chat-header-info">
                        <img src="https://res.cloudinary.com/dugvqluo2/image/upload/v1758032910/163-br_lat6cu.svg" alt="AI Maaru">
                        <div><h3>AI MAARU MITRA</h3><p>Your SKF Assistant</p></div>
                    </div>
                    <div class="chat-handle"></div>
                    <button id="chat-close-btn" aria-label="Close chat">&times;</button>
                </div>
                <div id="chat-messages"></div>
                <div id="chat-quick-replies" class="p-3 bg-white border-t border-gray-200"></div>
                <div id="chat-input-container">
                    <input type="text" id="chat-input" placeholder="Type your message...">
                    <button id="chat-send-btn">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                    </button>
                </div>
            </div> 
            <button id="chat-main-close-btn" class="hidden" aria-label="Close chat window">&times;</button>
            <button id="chat-toggle-button"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/v1758032910/163-br_lat6cu.svg" alt="Chat with AI Maaru"></button>`;
            
        const chatWindow = document.getElementById('chat-window');
        const chatToggleBtn = document.getElementById('chat-toggle-button');
        const chatCloseBtn = document.getElementById('chat-close-btn');
        const chatMessages = document.getElementById('chat-messages');
        const chatInput = document.getElementById('chat-input');
        const chatSendBtn = document.getElementById('chat-send-btn');
        const chatQuickReplies = document.getElementById('chat-quick-replies');
        const chatInputContainer = document.getElementById('chat-input-container');
        const confettiContainer = document.getElementById('confetti-container');
        const chatMainCloseBtn = document.getElementById('chat-main-close-btn');
        const chatBackdrop = document.getElementById('chat-backdrop');

        let state = 'AWAITING_PRODUCT';
        let userData = { purpose: null, product: null };
        let clarificationAttempts = 0;
            // --- OpenAI GPT Integration ---
            async function getAIResponse(message) {
                const apiKey = 'YOUR_OPENAI_API_KEY'; // Replace with your OpenAI API key
                if (apiKey === 'YOUR_OPENAI_API_KEY') {
                    console.error("OpenAI API Key is not set. Chatbot will not function.");
                    return 'माफ़ कीजिए, मैं अभी आपकी मदद नहीं कर सकता क्योंकि मेरा सेटअप पूरा नहीं हुआ है।';
                }

                const endpoint = 'https://api.openai.com/v1/chat/completions';
                const payload = {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are AI Maaru, a helpful assistant for loans and insurance.' },
                        { role: 'user', content: message }
                    ],
                    max_tokens: 150
                };
                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify(payload)
                    });
                    const data = await response.json();
                    return data.choices && data.choices[0] && data.choices[0].message.content ? data.choices[0].message.content : 'Sorry, AI Maaru could not understand.';
                } catch (error) {
                    return 'AI Maaru se connect nahi ho paaya. Kripya dobara koshish karein.';
                }
            }

        const teamNumbers = {
            'Home Loan': '918118838772',
            'Loan Against Property': '918118838772',
            'Personal Loan': '918118822628',
            'Business Loan': '919352358494',
            'Vehicle Loan': '919358973156',
            'Insurance': '919214104963',
            'fallback': '919214104963'
        };

        const toggleChatWindow = (forceOpen = false) => {
            const isCurrentlyOpen = chatWindow.classList.contains('is-open');
            const shouldOpen = forceOpen ? true : !isCurrentlyOpen;

            chatWindow.classList.toggle('is-open', shouldOpen);
            chatBackdrop.classList.toggle('is-open', shouldOpen);
            // Toggle visibility of the main icon and the new close button
            chatBackdrop.classList.toggle('hidden', !shouldOpen);
            chatToggleBtn.classList.toggle('hidden', shouldOpen);
            chatMainCloseBtn.classList.toggle('hidden', !shouldOpen);

            if (shouldOpen && !isCurrentlyOpen) { // Only run if opening for the first time
                if (typeof hideProactiveBubble === 'function') {
                    hideProactiveBubble();
                }
                chatMessages.innerHTML = '';
                chatQuickReplies.innerHTML = '';
                startConversation();
            }
        };
        
        chatToggleBtn.addEventListener('click', () => toggleChatWindow());
        chatCloseBtn.addEventListener('click', () => toggleChatWindow());
        chatBackdrop.addEventListener('click', () => toggleChatWindow()); // Close on backdrop click
        chatMainCloseBtn.addEventListener('click', () => toggleChatWindow());
        document.addEventListener('open-chat', () => toggleChatWindow(true));

        function addBotMessage(message, delay = 500) {
            setTimeout(() => {
                const messageEl = document.createElement('div');
                messageEl.className = 'ai-bubble chat-bubble';
                messageEl.innerHTML = message;
                chatMessages.appendChild(messageEl);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, delay);
        }

        function addUserMessage(message) {
            const messageEl = document.createElement('div');
            messageEl.className = 'user-bubble chat-bubble';
            messageEl.innerHTML = message;
            chatMessages.appendChild(messageEl);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            chatInput.value = '';
        }
        
        function showQuickReplies(replies) {
            chatQuickReplies.innerHTML = '';
            chatInputContainer.style.display = 'none';
            const container = document.createElement('div');
            container.className = 'flex flex-wrap justify-center gap-2';
            
            replies.forEach(reply => {
                const button = document.createElement('button');
                button.innerText = reply.label;
                button.className = 'px-4 py-2 bg-orange-100 text-orange-700 font-semibold rounded-full hover:bg-orange-200 transition';
                button.onclick = () => {
                    addUserMessage(reply.label);
                    handleUserInput(reply.value);
                    chatQuickReplies.innerHTML = '';
                    chatInputContainer.style.display = 'flex';
                    chatInput.focus();
                };
                container.appendChild(button);
            });
            chatQuickReplies.appendChild(container);
        }
        
        function showFinalButtons(buttons) {
            chatQuickReplies.innerHTML = '';
            chatInputContainer.style.display = 'none';
            const container = document.createElement('div');
            container.className = 'flex flex-wrap justify-center gap-3 p-2';

            buttons.forEach(buttonInfo => {
                const button = document.createElement('button');
                button.innerText = buttonInfo.label;
                button.className = buttonInfo.class;
                button.onclick = buttonInfo.action;
                container.appendChild(button);
            });
            chatQuickReplies.appendChild(container);
        }

        // --- NEW LOGIC ---
        function startConversation() {
            addBotMessage("🙏 जय माता जी — मैं SKF से आपका मददगार हूँ।");
            setTimeout(() => showProductSelection(), 600);
        }

        function showProductSelection() {
            addBotMessage("कृपया अपना product चुनें:");
            chatQuickReplies.innerHTML = '';
            chatInputContainer.style.display = 'none';
            const products = [
                { label: '🏡 Home Loan', value: 'Home Loan' },
                { label: '💼 Business Loan', value: 'Business Loan' },
                { label: '👤 Personal Loan', value: 'Personal Loan' },
                { label: '🚗 Vehicle Loan', value: 'Vehicle Loan' },
                { label: '💰 LAP', value: 'Loan Against Property' },
                { label: '🛡️ Insurance', value: 'Insurance' }
            ];
            const container = document.createElement('div');
            container.className = 'flex flex-wrap justify-center gap-2';
            products.forEach(product => {
                const button = document.createElement('button');
                button.innerText = product.label;
                button.className = 'px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-full hover:bg-blue-200 transition';
                button.onclick = () => {
                    addUserMessage(product.label);
                    userData = { product: product.value };
                    chatQuickReplies.innerHTML = '';
                    chatInputContainer.style.display = 'flex';
                    state = 'AWAITING_NAME';
                    askName();
                };
                container.appendChild(button);
            });
            chatQuickReplies.appendChild(container);
        }

        function askName() {
            addBotMessage('अपना नाम बताएं:');
            chatInput.placeholder = 'अपना नाम लिखें';
        }

        function askMobile() {
            addBotMessage('अपना मोबाइल नंबर लिखें:');
            chatInput.placeholder = 'मोबाइल नंबर';
        }

        function askCity() {
            addBotMessage('आपका शहर बताएं:');
            chatInput.placeholder = 'शहर';
        }

        function askPincode() {
            addBotMessage('पिनकोड लिखें:');
            chatInput.placeholder = 'पिनकोड';
        }

        function askOccupation() {
            addBotMessage('आपका occupation चुनें:');
            showQuickReplies([
                { label: 'Job', value: 'Job' },
                { label: 'Business', value: 'Business' },
                { label: 'Other', value: 'Other' }
            ]);
        }

        function askIncome() {
            addBotMessage('मासिक आय (Monthly Income) लिखें:');
            chatInput.placeholder = 'Income';
        }

        function askRunningLoan() {
            addBotMessage('क्या आपके ऊपर कोई Loan चल रहा है?');
            showQuickReplies([
                { label: 'Yes', value: 'Yes' },
                { label: 'No', value: 'No' }
            ]);
        }

        function askExistingLoanDetails() {
            addBotMessage('कृपया Existing Loan Details लिखें (Loan Type, EMI, Pending Amount):');
            chatInput.placeholder = 'Loan Details';
        }

        function askLoanAmount() {
            addBotMessage('आपको कितने का Loan चाहिए?');
            chatInput.placeholder = 'Loan Amount';
        }

        function askTenure() {
            addBotMessage('Loan Tenure चुनें:');
            chatQuickReplies.innerHTML = '';
            chatInputContainer.style.display = 'none';
            const tenures = [
                { label: '1 Year', value: 1 },
                { label: '2 Years', value: 2 },
                { label: '5 Years', value: 5 },
                { label: '10 Years', value: 10 }
            ];
            const container = document.createElement('div');
            container.className = 'flex flex-wrap justify-center gap-2';
            tenures.forEach(t => {
                const button = document.createElement('button');
                button.innerText = t.label;
                button.className = 'px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-full hover:bg-blue-200 transition';
                button.onclick = () => {
                    addUserMessage(t.label);
                    userData.tenure = t.value;
                    chatQuickReplies.innerHTML = '';
                    chatInputContainer.style.display = 'flex';
                    showEMIResult();
                };
                container.appendChild(button);
            });
            chatQuickReplies.appendChild(container);
        }

        function showEMIResult() {
            // Simple EMI calculation
            const P = parseFloat(userData.loanAmount) || 0;
            const N = parseInt(userData.tenure) * 12 || 12;
            const R = 0.12 / 12; // 12% annual interest
            const emi = P && N ? Math.round((P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1)) : 0;
            const totalPayment = emi * N;
            const totalInterest = totalPayment - P;
            addBotMessage(`<b>EMI Result:</b><br>EMI: ₹${emi}<br>Total Interest: ₹${totalInterest}<br>Total Payment: ₹${totalPayment}`);
            showFinalStep();
        }

        function showFinalStep() {
            addBotMessage('Lead submit करने के लिए नीचे क्लिक करें:');
            chatQuickReplies.innerHTML = '';
            chatInputContainer.style.display = 'none';
            const button = document.createElement('button');
            button.innerText = 'Continue with Experts';
            button.className = 'px-4 py-2 bg-green-500 text-white font-bold rounded hover:bg-green-600';
            button.onclick = () => {
                addBotMessage('Lead submit ho gayi! Team aapko contact karegi.');
                // Yahan Google Sheet/WhatsApp integration call kar sakte hain
            };
            chatQuickReplies.appendChild(button);
        }

        function handleUserInput(input) { // This is the main handler
            clarificationAttempts = 0; // Reset on valid input
            switch (state) {
                    case 'AWAITING_PURPOSE': processPurpose(input); break;
                    case 'AWAITING_NAME': processName(input); break;
                    case 'AWAITING_MOBILE': processMobile(input); break;
                    case 'AWAITING_CITY': processCity(input); break;
                    case 'AWAITING_PINCODE': processPincode(input); break;
                    case 'AWAITING_EMPLOYMENT': processEmployment(input); break;
                    case 'AWAITING_INCOME': processIncome(input); break;
                    case 'AWAITING_RUNNING_LOAN': processRunningLoan(input); break;
                    case 'AWAITING_LOAN_DETAILS': processLoanDetails(input); break;
                    case 'AWAITING_LOAN_AMOUNT': processLoanAmount(input); break;
                    case 'AWAITING_TENURE': processTenure(input); break;
                    case 'AWAITING_INSURANCE_TYPE': processInsuranceType(input); break;
                    default:
                        // For any other input, use AI response
                        addBotMessage('AI Maaru soch raha hai...');
                        getAIResponse(input).then(aiReply => {
                            addBotMessage(aiReply);
                        });
            }
        }

        function processPurpose(text) {
            const p = text.toLowerCase();
            if (p.includes('home') || p.includes('house') || p.includes('flat')) userData.product = 'Home Loan';
            else if (p.includes('personal')) userData.product = 'Personal Loan';
            else if (p.includes('business') || p.includes('shop')) userData.product = 'Business Loan';
            else if (p.includes('car') || p.includes('bike') || p.includes('vehicle')) userData.product = 'Vehicle Loan';
            else if (p.includes('property') || p.includes('lap')) userData.product = 'Loan Against Property';
            else if (p.includes('insurance')) {
                userData.product = 'Insurance';
                askInsuranceType();
                return;
            } else {
                handleUnclearInput("माफ़ कीजिए, मैं समझ नहीं पाया। क्या आप Home Loan, Personal Loan, Business Loan, Vehicle Loan, LAP या Insurance में से कुछ ढूंढ रहे हैं?");
                return;
            }
            userData.purpose = text;
            addBotMessage(`Great! ${userData.product} के लिए, मुझे आपसे कुछ details चाहिए होंगी।`);
            askName();
        }
        
        function askInsuranceType() {
            state = 'AWAITING_INSURANCE_TYPE';
            addBotMessage("ज़रूर, आप किस तरह का insurance करवाना चाहते हैं?");
            showQuickReplies([
                {label: 'Health Insurance', value: 'Health'},
                {label: 'Life Insurance', value: 'Life'},
                {label: 'Vehicle Insurance', value: 'Vehicle'}
            ]);
        }

        function processInsuranceType(type) {
            userData.insuranceType = type;
            addBotMessage(`ठीक है, ${type} Insurance के लिए, मुझे कुछ जानकारी चाहिए।`);
            askName();
        }

        function askName() { state = 'AWAITING_NAME'; addBotMessage("आपका पूरा नाम क्या है?"); }
        function processName(name) {
            if (name.trim().length < 3) { handleUnclearInput("Please अपना पूरा नाम बताएं।"); return; }
            userData.name = name.trim();
            askMobile();
        }
        
        function askMobile() { state = 'AWAITING_MOBILE'; addBotMessage("आपका 10-digit mobile number दीजिए।"); }
        function processMobile(mobile) {
            if (!/^[6-9]\d{9}$/.test(mobile.trim())) { handleUnclearInput("यह एक valid mobile number नहीं लग रहा। कृपया 10-digit number दें जो 6, 7, 8, या 9 से शुरू हो।"); return; }
            userData.mobile = mobile.trim();
            askCity();
        }

        function askCity() { state = 'AWAITING_CITY'; addBotMessage("आप किस शहर से हैं?"); }
        function processCity(city) {
            if(city.trim().length < 2) { handleUnclearInput("Please अपने शहर का नाम बताएं।"); return; }
            userData.city = city.trim();
            askPincode();
        }

        function askPincode() { state = 'AWAITING_PINCODE'; addBotMessage("आपके area का 6-digit pincode क्या है?"); }
        function processPincode(pincode) {
            if(!/^\d{6}$/.test(pincode.trim())) { handleUnclearInput("Pincode 6 digits का होना चाहिए। Please सही pincode बताएं।"); return; }
            userData.pincode = pincode.trim();
            askEmployment();
        }

        function askEmployment() {
            state = 'AWAITING_EMPLOYMENT';
            addBotMessage("आप Job करते हैं, Business करते हैं या कुछ और?");
            showQuickReplies([ {label: 'Job', value: 'Job'}, {label: 'Business', value: 'Business'}, {label: 'Other', value: 'Other'} ]);
        }
        function processEmployment(type) { userData.employment = type; askIncome(type); }
        
        function askIncome(type) {
            state = 'AWAITING_INCOME';
            addBotMessage(`आपकी ${type === 'Job' ? 'monthly salary' : 'monthly income'} कितनी है? (जैसे: 50000)`);
        }

        function processIncome(income) {
            const incomeNum = parseInt(income.replace(/,/g, ''), 10);
            if (isNaN(incomeNum) || incomeNum <= 0) { handleUnclearInput("Please एक valid amount बताएं।"); return; }
            userData.income = incomeNum;
            if (userData.product === 'Insurance') showSummary(); else askRunningLoan();
        }

        function askRunningLoan() {
            state = 'AWAITING_RUNNING_LOAN';
            addBotMessage("क्या आपकी कोई और loan EMI चल रही है?");
            showQuickReplies([ {label: 'Yes', value: 'Yes'}, {label: 'No', value: 'No'} ]);
        }
        
        function processRunningLoan(answer) {
            userData.runningLoan = answer;
            if (answer === 'Yes') {
                state = 'AWAITING_LOAN_DETAILS';
                addBotMessage("Please अपनी running loan की EMI, outstanding amount, और overdue status बताएं।");
            } else { askLoanAmount(); }
        }

        function processLoanDetails(details) { userData.runningLoanDetails = details; askLoanAmount(); }
        function askLoanAmount() { state = 'AWAITING_LOAN_AMOUNT'; addBotMessage("आपको कितना loan amount चाहिए? (जैसे: 500000)"); }
        function processLoanAmount(amount) {
            const amountNum = parseInt(amount.replace(/,/g, ''), 10);
            if (isNaN(amountNum) || amountNum <= 0) { handleUnclearInput("Please एक valid loan amount बताएं।"); return; }
            userData.loanAmount = amountNum;
            askTenure();
        }

        function askTenure() { state = 'AWAITING_TENURE'; addBotMessage("आप कितने साल के लिए loan चाहते हैं? (जैसे: 5)"); }
        function processTenure(tenure) {
            const tenureNum = parseInt(tenure, 10);
            if (isNaN(tenureNum) || tenureNum <= 0 || tenureNum > 30) { handleUnclearInput("Please 1 से 30 साल के बीच का valid tenure बताएं।"); return; }
            userData.tenure = tenureNum;
            showSummary();
        }

        function showSummary() {
            addBotMessage("✅ Thank you for sharing details!");
            if (userData.product !== 'Insurance') {
                const { emi, totalInterest, totalPayment, rate } = calculateEMI();
                userData.emi = Math.round(emi);
                userData.roi = rate;
                let summaryHtml = `
                    <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 class="text-lg font-bold text-blue-800 mb-3">EMI Summary</h3>
                        <p><strong>Loan Amount:</strong> ₹${userData.loanAmount.toLocaleString('en-IN')}</p>
                        <p><strong>Tenure:</strong> ${userData.tenure} Years</p>
                        <p class="mt-4 text-2xl font-bold text-primary-color">Monthly EMI: ₹${userData.emi.toLocaleString('en-IN')}</p>
                        <p class="text-sm text-gray-600">(Estimated at ${rate}% ROI)</p>
                        <p class="mt-4 text-xs text-gray-500 italic">*Disclaimer: यह एक अनुमान है। अंतिम ब्याज दर आपकी प्रोफ़ाइल और बैंक की पॉलिसी के आधार पर भिन्न हो सकती है।</p>
                    </div>`;
                addBotMessage(summaryHtml);
            }
            
            // Map and send data to Google Sheet as soon as summary is shown
            userData.fullName = userData.name;
            userData.employmentType = userData.employment;
            userData.monthlyIncome = userData.income;
            userData.requiredLoanAmount = userData.loanAmount;
            sendDataToGoogleSheet(userData);

            setTimeout(askForConsent, 1000); // Ask for consent after showing summary and sending data
        }

        function askForConsent() {
            state = 'AWAITING_CONSENT';
            addBotMessage("क्या आप चाहते हैं कि मैं आपकी enquiry टीम experts को forward करूँ?");
            showFinalButtons([
                { 
                    label: '✅ Yes, Continue with Experts', 
                    class: 'w-full sm:w-auto text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-gradient-to-r from-green-500 to-teal-500', 
                    action: forwardToTeam 
                },
                { 
                    label: '❌ No, Cancel', 
                    class: 'w-full sm:w-auto bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition', 
                    action: cancelProcess 
                }
            ]);
        }
        
        function cancelProcess() {
            addBotMessage("कोई बात नहीं। अगर आपको भविष्य में हमारी ज़रूरत पड़े, तो हम यहीं हैं। SKF से संपर्क करने के लिए धन्यवाद!");
            chatQuickReplies.innerHTML = '';
            chatInputContainer.style.display = 'flex';
            state = 'AWAITING_PURPOSE';
        }

        function forwardToTeam() {
            // Data is already sent to Google Sheet in showSummary().
            // This function now only handles the WhatsApp redirection.
            
            const message = generateWhatsappMessage();
            const encodedMessage = encodeURIComponent(message);
            const teamMember = teamMemberMapping[userData.product] || teamMemberMapping['fallback'];
            const whatsappUrl = `https://wa.me/${teamMember.number}?text=${encodedMessage}`;

            showConfetti();
            addBotMessage("🙏 Thank you! आपकी enquiry हमारी SKF टीम तक पहुंच गई है। Experts जल्द ही आपसे संपर्क करेंगे।");
            addBotMessage("आपको WhatsApp पर redirect किया जा रहा है...");
            chatQuickReplies.innerHTML = ''; // Clear any buttons
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
            }, 2000); // 2-second delay for user to read the message
        }

        function calculateEMI() {
            let rate;
            switch (userData.product) {
                case 'Home Loan': rate = 8.5; break;
                case 'Loan Against Property': rate = 11.0; break;
                case 'Personal Loan': rate = 9.99; break;
                case 'Business Loan': rate = 12.0; break;
                case 'Vehicle Loan': rate = 9.0; break;
                default: rate = 10.0;
            }
            const p = userData.loanAmount, r = rate / 1200, n = userData.tenure * 12;
            const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            const totalPayment = emi * n;
            const totalInterest = totalPayment - p;
            return { emi, totalInterest, totalPayment, rate };
        }

        function generateWhatsappMessage() {
            let msg = `📩 *New Enquiry (SKF)* 📩\n\n`;
            msg += `*Product:* ${userData.product === 'Insurance' ? `${userData.insuranceType} Insurance` : userData.product}\n`;
            msg += `*Name:* ${userData.name}\n`;
            msg += `*Mobile:* ${userData.mobile}\n`;
            msg += `*City/Pincode:* ${userData.city} / ${userData.pincode}\n`;
            msg += `*Employment:* ${userData.employment} – Income: ₹${userData.income.toLocaleString('en-IN')}\n`;
            if (userData.product !== 'Insurance') {
                msg += `*Running Loan:* ${userData.runningLoan}${userData.runningLoan === 'Yes' ? ` (${userData.runningLoanDetails || 'Details provided'})` : ''}\n`;
                msg += `*Required Amount:* ₹${userData.loanAmount.toLocaleString('en-IN')}\n`;
                msg += `*Tenure:* ${userData.tenure} Years\n`;
                msg += `*EMI Estimate:* ₹${userData.emi.toLocaleString('en-IN')}\n`;
            }
            msg += `*Source:* Website Chatbot`;
            return msg;
        }

        function handleUnclearInput(fallbackMessage) {
            clarificationAttempts++;
            if (clarificationAttempts >= 3) {
                addBotMessage("लगता है कुछ confusion हो रहा है। आप चाहें तो सीधे हमारे expert से बात कर सकते हैं।");
                const fallbackUrl = `https://wa.me/${teamNumbers['fallback']}?text=${encodeURIComponent('Hi, I need assistance from the website.')}`;
                showFinalButtons([ { label: 'Connect with Human Expert', class: 'px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition w-full', action: () => window.open(fallbackUrl, '_blank') } ]);
                clarificationAttempts = 0;
                state = 'ENDED';
            } else {
                addBotMessage(fallbackMessage);
            }
        }
        
        function showConfetti() {
            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                const colors = ['blue', 'green', 'pink', 'purple'];
                confetti.className = 'confetti-piece ' + colors[Math.floor(Math.random() * colors.length)];
                confettiContainer.appendChild(confetti);
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.animation = `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s forwards`;
                confetti.addEventListener('animationend', () => confetti.remove());
            }
        }

        const sendBtnAction = () => {
            const text = chatInput.value.trim();
            if (text) { addUserMessage(text); handleUserInput(text); }
        };
        
        chatSendBtn.addEventListener('click', sendBtnAction);
        chatInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendBtnAction());
    }

    function setupCounters() {
        const counters = document.querySelectorAll('.counter');
        const speed = 200; // The lower the slower

        const animateCounter = (counter) => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(() => animateCounter(counter), 1);
            } else {
                counter.innerText = target;
            }
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }
    function setupThankYouModal() { /* ... */ }
    function setInputState(enabled, type = 'text', placeholder = 'Type your message...') {
        const chatInput = document.getElementById('chat-input');
        const chatSendBtn = document.getElementById('chat-send-btn');
        const chatQuickReplies = document.getElementById('chat-quick-replies');

        chatInput.disabled = !enabled;
        chatSendBtn.disabled = !enabled;
        chatInput.type = type;
        chatInput.placeholder = placeholder;

        if (enabled) {
            chatQuickReplies.innerHTML = '';
            chatInput.focus();
        }
    }

    function renderHomePage() {
        const homePage = document.getElementById('home-page');
        if (!homePage) return;
        homePage.innerHTML = `
            <section class="relative w-full h-full text-white overflow-hidden">
                 <div class="hero-section-background" style="background-image: url('https://res.cloudinary.com/dugvqluo2/image/upload/w_1920,q_auto:good,f_auto/v1757947648/IMG_7817_pgkm5f.jpg');"></div>
                 <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                 <div class="hero-content container mx-auto px-6 py-24 md:py-36 text-center relative z-10" style="padding-top: clamp(6rem, 12vw, 9rem); padding-bottom: clamp(6rem, 12vw, 9rem);">
                     <h1 class="font-extrabold leading-tight mb-4" style="font-size: clamp(2.25rem, 1.5rem + 3.75vw, 4.5rem); animation: textFadeInUp 1s ease-out;">Your Trusted Loan & Insurance Advisors</h1>
                     <p class="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto mb-8" style="animation: textFadeInUp 1s ease-out 0.3s; animation-fill-mode: backwards;">"Sapne aap dekho, poore hum karenge." Get the Best Financial Solutions in Rajasthan.</p>
                     <div class="flex flex-col sm:flex-row justify-center items-center gap-4" style="animation: textFadeInUp 1s ease-out 0.6s; animation-fill-mode: backwards;">
                         <a href="#eligibility-form" class="page-link btn-highlight bg-[#0056b3] hover:bg-[#004a80] text-white py-3 px-8 rounded-lg transition-colors w-full sm:w-auto btn-text-style">Apply Now</a>
                         <a href="#home?scroll=our-services" class="page-link bg-white hover:bg-[#0056b3] text-[#0056b3] hover:text-white border-2 border-[#0056b3] py-3 px-8 rounded-lg transition-colors w-full sm:w-auto btn-text-style">Explore Services</a>
                     </div>
                 </div>
            </section>
    
            <section class="py-16 md:py-20 bg-gray-100 overflow-hidden">
                <div class="container mx-auto px-6">
                    <h2 class="font-bold mb-12 text-center text-gray-800" style="font-size: clamp(1.875rem, 1.5rem + 1.88vw, 2.5rem);">Our Gallery & Motivation</h2>
                    <div class="swiper-container gallery-carousel relative">
                        <div class="swiper-wrapper">
                            <div class="swiper-slide"><a href="#home?scroll=our-services" class="page-link block"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_800,q_auto:good,f_auto/v1758030488/linkconnect_1758029887796_nxonu1.png" alt="Gallery Image" class="rounded-lg shadow-lg object-contain h-64 w-full bg-white" loading="lazy" decoding="async"></a></div>
                            <div class="swiper-slide"><a href="#home?scroll=our-services" class="page-link block"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_800,q_auto:good,f_auto/v1758030487/linkconnect_1758029910745_nercgv.png" alt="Gallery Image" class="rounded-lg shadow-lg object-contain h-64 w-full bg-white" loading="lazy" decoding="async"></a></div>
                            <div class="swiper-slide"><a href="#home?scroll=our-services" class="page-link block"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_800,q_auto:good,f_auto/v1758030471/linkconnect_1758030023899_gmxd9t.png" alt="Gallery Image" class="rounded-lg shadow-lg object-contain h-64 w-full bg-white" loading="lazy" decoding="async"></a></div>
                            <div class="swiper-slide"><a href="#home?scroll=our-services" class="page-link block"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_800,q_auto:good,f_auto/v1758030471/linkconnect_1758030081550_y9hbzs.png" alt="Gallery Image" class="rounded-lg shadow-lg object-contain h-64 w-full bg-white" loading="lazy" decoding="async"></a></div>
                            <div class="swiper-slide"><a href="#home?scroll=our-services" class="page-link block"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_800,q_auto:good,f_auto/v1758030471/linkconnect_1758030067320_mjrghs.png" alt="Gallery Image" class="rounded-lg shadow-lg object-contain h-64 w-full bg-white" loading="lazy" decoding="async"></a></div>
                            <div class="swiper-slide"><a href="#home?scroll=our-services" class="page-link block"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_800,q_auto:good,f_auto/v1758030471/linkconnect_1758029972266_htzhcz.png" alt="Gallery Image" class="rounded-lg shadow-lg object-contain h-64 w-full bg-white" loading="lazy" decoding="async"></a></div>
                            <div class="swiper-slide"><a href="#home?scroll=our-services" class="page-link block"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_800,q_auto:good,f_auto/v1758030471/linkconnect_1758029992963_jif7fu.png" alt="Gallery Image" class="rounded-lg shadow-lg object-contain h-64 w-full bg-white" loading="lazy" decoding="async"></a></div>
                            <div class="swiper-slide"><a href="#home?scroll=our-services" class="page-link block"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_800,q_auto:good,f_auto/v1758030470/linkconnect_1758030043952_qpwesp.png" alt="Gallery Image" class="rounded-lg shadow-lg object-contain h-64 w-full bg-white" loading="lazy" decoding="async"></a></div>
                            <div class="swiper-slide"><a href="#home?scroll=our-services" class="page-link block"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_800,q_auto:good,f_auto/v1758030469/linkconnect_1758030145517_q1ehnh.png" alt="Gallery Image" class="rounded-lg shadow-lg object-contain h-64 w-full bg-white" loading="lazy" decoding="async"></a></div>
                            <div class="swiper-slide"><a href="#home?scroll=our-services" class="page-link block"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_800,q_auto:good,f_auto/v1758030469/linkconnect_1758030387720_lxdc3r.png" alt="Gallery Image" class="rounded-lg shadow-lg object-contain h-64 w-full bg-white" loading="lazy" decoding="async"></a></div>
                            <div class="swiper-slide"><a href="#home?scroll=our-services" class="page-link block"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_800,q_auto:good,f_auto/v1758030469/linkconnect_1758030169400_mapkbe.png" alt="Gallery Image" class="rounded-lg shadow-lg object-contain h-64 w-full bg-white" loading="lazy" decoding="async"></a></div>
                            <div class="swiper-slide"><a href="#home?scroll=our-services" class="page-link block"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_800,q_auto:good,f_auto/v1758030469/linkconnect_1758030268017_uoew8e.png" alt="Gallery Image" class="rounded-lg shadow-lg object-contain h-64 w-full bg-white" loading="lazy" decoding="async"></a></div>
                            <div class="swiper-slide"><a href="#home?scroll=our-services" class="page-link block"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_800,q_auto:good,f_auto/v1758030468/linkconnect_1758030218956_uzuv49.png" alt="Gallery Image" class="rounded-lg shadow-lg object-contain h-64 w-full bg-white" loading="lazy" decoding="async"></a></div>
                            <div class="swiper-slide"><a href="#home?scroll=our-services" class="page-link block"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_800,q_auto:good,f_auto/v1758030468/linkconnect_1758030246325_a7sfga.png" alt="Gallery Image" class="rounded-lg shadow-lg object-contain h-64 w-full bg-white" loading="lazy" decoding="async"></a></div>
                            <div class="swiper-slide"><a href="#home?scroll=our-services" class="page-link block"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_800,q_auto:good,f_auto/v1758030468/linkconnect_1758030406784_tusczt.png" alt="Gallery Image" class="rounded-lg shadow-lg object-contain h-64 w-full bg-white" loading="lazy" decoding="async"></a></div>
                            <div class="swiper-slide"><a href="#home?scroll=our-services" class="page-link block"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_800,q_auto:good,f_auto/v1758030468/linkconnect_1758030191922_zmny3v.png" alt="Gallery Image" class="rounded-lg shadow-lg object-contain h-64 w-full bg-white" loading="lazy" decoding="async"></a></div>
                        </div>
                    </div>
                </div>
            </section>
    
            <section id="our-services" class="py-16 md:py-24 bg-white">
                <div class="container mx-auto px-6 text-center">
                    <h2 class="font-bold mb-12 text-gray-800" style="font-size: clamp(1.875rem, 1.5rem + 1.88vw, 2.5rem);">Our Loan & Insurance Services</h2>
                    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        <a href="#home-loan" class="page-link group block rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/w_600,q_auto:good,f_auto/v1757241971/WhatsApp_Image_2025-09-07_at_3.20.38_PM_lqp1dy.jpg" alt="Home Loan" class="w-full h-auto" loading="lazy" decoding="async"><div class="p-4 md:p-6 bg-gray-50"><h3 class="text-lg md:text-xl font-bold text-gray-800">Home Loan</h3></div></a>
                        <a href="#business-loan" class="page-link group block rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/w_600,q_auto:good,f_auto/v1757239663/PHOTO-2025-09-07-15-20-36_b8guao.jpg" alt="Business Loan" class="w-full h-auto" loading="lazy" decoding="async"><div class="p-4 md:p-6 bg-gray-50"><h3 class="text-lg md:text-xl font-bold text-gray-800">Business Loan</h3></div></a>
                        <a href="#personal-loan" class="page-link group block rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/w_600,q_auto:good,f_auto/v1757239663/PHOTO-2025-09-07-15-20-34_q09kn6.jpg" alt="Personal Loan" class="w-full h-auto" loading="lazy" decoding="async"><div class="p-4 md:p-6 bg-gray-50"><h3 class="text-lg md:text-xl font-bold text-gray-800">Personal Loan</h3></div></a>
                        <a href="#vehicle-loan" class="page-link group block rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300"><img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_600,q_auto:good,f_auto/v1758037256/linkconnect_1758037092966_b4yejx.png" alt="Vehicle Loan" class="w-full h-auto" loading="lazy" decoding="async"><div class="p-4 md:p-6 bg-gray-50"><h3 class="text-lg md:text-xl font-bold text-gray-800">Vehicle Loan</h3></div></a>
                        <a href="#lap-loan" class="page-link group block rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/w_600,q_auto:good,f_auto/v1757240471/WhatsApp_Image_2025-09-07_at_3.20.41_PM_yunya8.jpg" alt="Loan Against Property" class="w-full h-auto" loading="lazy" decoding="async"><div class="p-4 md:p-6 bg-gray-50"><h3 class="text-lg md:text-xl font-bold text-gray-800">Loan Against Property</h3></div></a>
                        <a href="#health-insurance" class="page-link group block rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/w_600,q_auto:good,f_auto/v1757387616/PHOTO-2025-09-09-08-37-27_csvkbm.jpg" alt="Health Insurance" class="w-full h-auto" loading="lazy" decoding="async"><div class="p-4 md:p-6 bg-gray-50"><h3 class="text-lg md:text-xl font-bold text-gray-800">Health Insurance</h3></div></a>
                    </div>
                </div>
            </section>

            <section id="why-choose-us" class="py-16 md:py-24 bg-white overflow-hidden">
                <div class="container mx-auto px-6 text-center">
                    <h2 class="font-bold text-slate-800 mb-4" style="font-size: clamp(1.875rem, 1.5rem + 1.88vw, 2.5rem);">Why Choose SKF Ajmer?</h2>
                    <p class="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">Because trust, transparency, and results matter. We are committed to finding the best financial solutions for you.</p>
                    <div class="swiper-container why-us-carousel max-w-6xl mx-auto">
                        <div class="swiper-wrapper pb-12">
                            <!-- Card 1: Loan Disbursed -->
                            <div class="swiper-slide h-auto">
                                <div class="group bg-surface-color p-8 rounded-xl shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 h-full">
                                    <div class="bg-blue-100 rounded-full p-4 mb-4 inline-block icon-bounce">
                                        <svg class="h-10 w-10 text-primary-color" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75" /></svg>
                                    </div>
                                    <div class="flex justify-center items-baseline"><h3 class="counter text-4xl font-extrabold text-slate-800" data-target="100">0</h3><span class="text-3xl font-extrabold text-slate-800">&nbsp;Cr+</span></div>
                                    <p class="mt-2 text-gray-600 font-semibold">Loan Disbursed</p>
                                </div>
                            </div>
                            <!-- Card 2: Happy Customers -->
                            <div class="swiper-slide h-auto">
                                <div class="group bg-surface-color p-8 rounded-xl shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 h-full">
                                    <div class="bg-blue-100 rounded-full p-4 mb-4 inline-block icon-bounce">
                                        <svg class="h-10 w-10 text-primary-color" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.284-2.72a3 3 0 0 0-4.682 2.72 9.094 9.094 0 0 0 3.741.479m7.284-2.72a3 3 0 0 1 2.246 1.125 3 3 0 0 1-8.772 0 3 3 0 0 1 2.246-1.125M12 14.25a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 14.25a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7.5 7.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm15 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>
                                    </div>
                                    <div class="flex justify-center items-baseline"><h3 class="counter text-4xl font-extrabold text-slate-800" data-target="10000">0</h3><span class="text-3xl font-extrabold text-slate-800">+</span></div>
                                    <p class="mt-2 text-gray-600 font-semibold">Happy Customers</p>
                                </div>
                            </div>
                            <!-- Card 3: Bank & NBFC Tie-ups -->
                            <div class="swiper-slide h-auto">
                                <div class="group bg-surface-color p-8 rounded-xl shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 h-full">
                                    <div class="bg-blue-100 rounded-full p-4 mb-4 inline-block icon-bounce">
                                        <svg class="h-10 w-10 text-primary-color" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6m-6 4.5h6M6.75 21v-2.25a2.25 2.25 0 0 1 2.25-2.25h3a2.25 2.25 0 0 1 2.25 2.25V21M6.75 3v2.25A2.25 2.25 0 0 0 9 7.5h6a2.25 2.25 0 0 0 2.25-2.25V3" /></svg>
                                    </div>
                                    <div class="flex justify-center items-baseline"><h3 class="counter text-4xl font-extrabold text-slate-800" data-target="120">0</h3><span class="text-3xl font-extrabold text-slate-800">+</span></div>
                                    <p class="mt-2 text-gray-600 font-semibold">Network with 120+ Banks & NBFC</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <section class="py-16 md:py-24 bg-white overflow-hidden">
                <div class="container mx-auto px-6 text-center">
                    <h2 class="font-bold mb-12 text-gray-800" style="font-size: clamp(1.875rem, 1.5rem + 1.88vw, 2.5rem);">Brands We Trust</h2>
                    <div class="marquee" x-data>
                        <div class="marquee-content">
                            <!-- Logos are duplicated for a seamless loop -->
                            <img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621450/imgi_85_hdfc-2_dzzdra.png" alt="HDFC Bank" loading="lazy" decoding="async"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621416/imgi_76_YES-BANK_zgemo9.png" alt="YES Bank" loading="lazy" decoding="async"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621188/imgi_41_SBI_psonew.png" alt="SBI Bank" loading="lazy" decoding="async"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621186/imgi_28_IDFC-FIRST_wljvii.png" alt="IDFC First Bank" loading="lazy" decoding="async"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621186/imgi_44_BHFL_Logo-min3723_m9hprx.png" alt="Bajaj Housing Finance" loading="lazy" decoding="async"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756622692/imgi_118_AU-Logo-unit-2_prhzvg.png" alt="AU Small Finance Bank" loading="lazy" decoding="async"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/ICICI_Bank_Logo.svg/2560px-ICICI_Bank_Logo.svg.png" alt="ICICI Bank" loading="lazy" decoding="async" style="height:48px"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621451/imgi_30_tata-capital-housing-updated_t0xydb.png" alt="Tata Capital" loading="lazy" decoding="async"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621451/imgi_88_aditya-upodated_ihx4kj.png" alt="Aditya Birla Capital" loading="lazy" decoding="async"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621369/imgi_63_punawala3739_tljctp.png" alt="Poonawalla Fincorp" loading="lazy" decoding="async"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621450/imgi_82_file_sua6c1.png" alt="Lendingkart" loading="lazy" decoding="async">
                            <img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621450/imgi_85_hdfc-2_dzzdra.png" alt="HDFC Bank" loading="lazy" decoding="async"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621416/imgi_76_YES-BANK_zgemo9.png" alt="YES Bank" loading="lazy" decoding="async"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621188/imgi_41_SBI_psonew.png" alt="SBI Bank" loading="lazy" decoding="async"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621186/imgi_28_IDFC-FIRST_wljvii.png" alt="IDFC First Bank" loading="lazy" decoding="async"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621186/imgi_44_BHFL_Logo-min3723_m9hprx.png" alt="Bajaj Housing Finance" loading="lazy" decoding="async"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756622692/imgi_118_AU-Logo-unit-2_prhzvg.png" alt="AU Small Finance Bank" loading="lazy" decoding="async"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/ICICI_Bank_Logo.svg/2560px-ICICI_Bank_Logo.svg.png" alt="ICICI Bank" loading="lazy" decoding="async" style="height:48px"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621451/imgi_30_tata-capital-housing-updated_t0xydb.png" alt="Tata Capital" loading="lazy" decoding="async"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621451/imgi_88_aditya-upodated_ihx4kj.png" alt="Aditya Birla Capital" loading="lazy" decoding="async"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621369/i_63_punawala3739_tljctp.png" alt="Poonawalla Fincorp" loading="lazy" decoding="async"><img src="https://res.cloudinary.com/dhme90fr1/image/upload/h_48,c_limit,q_auto,f_auto/v1756621450/imgi_82_file_sua6c1.png" alt="Lendingkart" loading="lazy" decoding="async">
                        </div>
                    </div>
                </div>
            </section>
    
            <section class="py-16 md:py-24 bg-gray-100 overflow-hidden">
                <div class="container mx-auto px-6">
                    <h2 class="font-bold text-center mb-12 text-gray-800" style="font-size: clamp(1.875rem, 1.5rem + 1.88vw, 2.5rem);">What Our Happy Customers Say</h2>
                    <div class="swiper-container testimonials-carousel">
                        <div class="swiper-wrapper pb-12" id="testimonials-wrapper">
                            <!-- Reviews will be dynamically injected here by script.js -->
                        </div>
                    </div>
                     <div class="text-center mt-8">
                        <a href="https://share.google/iP4kfRcWyfTKfowBs" target="_blank" rel="noopener noreferrer" class="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                            Read All Our Reviews on Google
                        </a>
                    </div>
                </div>
            </section>
        `;
        populateTestimonials();
        initializeCarousels();
        setupCounters();
        addLinkListeners(homePage); // Add listeners for any new links
    }

    function populateTestimonials() {
        const reviews = [
            { name: 'Priya M.', location: 'Ajmer', text: 'I was looking for sales executive jobs in Ajmer and found a great opportunity at SKF. The high incentive jobs structure is the best in Jaipur and the growth is amazing. A great place to work with SKF Ajmer.' },
            { name: 'Amit G.', location: 'Kota', text: 'SKF Associates careers offer real growth. I started as a connector and now I\'m a team leader. The company truly invests in its people. Best finance jobs in Rajasthan.' },
            { name: 'Sunil Sharma', location: 'Ajmer', text: 'SKF Ajmer se home loan lena bahut aasan tha. Rajendra sir aur unki team ne poora process smooth bana diya. Ajmer mein best home loan service!' },
            { name: 'Priya Jain', location: 'Jaipur', text: 'Mujhe apne business ke liye turant fund chahiye the. <strong>Shree Karni Kripa Associates</strong> ne Rajasthan mein sabse fast business loan approve karwaya. Highly recommended.' },
            { name: 'Amit Kumar', location: 'Kishangarh', text: 'Car loan ke liye sabse accha anubhav. Paperwork minimal tha aur Sona mam ne har step par guide kiya. Thank you for the easy car loan process!' },
            { name: 'Kavita Singh', location: 'Beawar', text: 'Medical emergency ke liye personal loan ki zaroorat thi. Inki team ne samjha aur jaldi se loan dilwaya. Bahut hi supportive staff hai.' },
            { name: 'Vikas Meena', location: 'Jaipur', text: 'Apni property ke against loan lena chahta tha. SKF Ajmer ne best interest rate dilwaya. Unka kaam bilkul transparent hai.' }
        ];

        const testimonialsWrapper = document.getElementById('testimonials-wrapper');
        if (!testimonialsWrapper) return;

        testimonialsWrapper.innerHTML = reviews.map(review => `
            <div class="swiper-slide h-auto">
                <div class="bg-white p-6 md:p-8 rounded-lg shadow-lg text-left h-full flex flex-col justify-between testimonial-card">
                    <div>
                        <p class="text-gray-600 mb-6 italic" style="font-size: inherit;">"${review.text}"</p>
                    </div>
                    <p class="font-bold text-gray-800 mt-auto pt-4">- ${review.name}, ${review.location}</p>
                </div>
            </div>
        `).join('');
    }

    function setupTeamMemberModal() {
        const modal = document.getElementById('team-member-modal');
        const overlay = document.getElementById('team-member-modal-overlay');
        const closeBtn = document.getElementById('team-member-modal-close');

        if (!modal || !overlay || !closeBtn) return;

        const closeModal = () => {
            modal.classList.add('hidden');
            overlay.classList.add('hidden');
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        // Use event delegation on the document to handle clicks on team cards
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.team-member-card');
            if (card && card.dataset.memberId) {
                const memberId = card.dataset.memberId;
                const member = teamMemberDetails[memberId];
                if (member) {
                    // Populate and show the modal
                    document.getElementById('modal-member-img').src = member.img;
                    document.getElementById('modal-member-name').textContent = member.name;
                    document.getElementById('modal-member-title').textContent = member.title;
                    document.getElementById('modal-member-bio').textContent = member.bio;
                    modal.classList.remove('hidden');
                    overlay.classList.remove('hidden');
                }
            }
        });
    }

    function renderAboutPage() {
        const aboutPage = document.getElementById('about-page');
        if (!aboutPage) return;
        aboutPage.innerHTML = `
            <div class="container mx-auto px-6 py-12">
                <div class="about-layout-container">
                    <!-- Main Content Area (75%) -->
                    <div class="main-content-area">
                        <div class="space-y-16">
                            <!-- Mission & Vision Section -->
                            <section>
                                <div class="text-center mb-12">
                                    <h1 class="text-4xl md:text-5xl font-extrabold text-slate-800">About Shree Karni Kripa Associates</h1>
                                    <p class="text-gray-500 mt-2 text-lg">Your Trusted Financial Partner in Rajasthan</p>
                                </div>
                                <div class="grid md:grid-cols-2 gap-8">
                                    <div class="bg-blue-50 border-l-4 border-blue-500 p-8 rounded-lg shadow-lg transform hover:-translate-y-2 transition-all duration-300">
                                        <h3 class="text-2xl font-bold text-blue-800 mb-3">Our Mission</h3>
                                        <p class="text-gray-700 text-lg">To provide our customers with the best, fastest, and most transparent solutions for their financial needs, and to guide them as a trusted partner throughout the entire process.</p>
                                    </div>
                                    <div class="bg-green-50 border-l-4 border-green-500 p-8 rounded-lg shadow-lg transform hover:-translate-y-2 transition-all duration-300">
                                        <h3 class="text-2xl font-bold text-green-800 mb-3">Our Vision</h3>
                                        <p class="text-gray-700 text-lg">To become the most respected and trusted name in financial services in Rajasthan, known for our integrity and expertise.</p>
                                    </div>
                                </div>
                            </section>

                            <!-- Founder's Message Section -->
                            <section class="bg-slate-800 text-white rounded-xl p-8 md:p-12">
                                <div class="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
                                    <div class="flex-shrink-0">
                                        <img src="https://res.cloudinary.com/dugvqluo2/image/upload/w_200,h_240,c_fill,g_face,q_auto:good,f_auto/v1758028732/image_2025-09-16_184847409_n0ga13.png" alt="राजेंद्र सिंह" class="w-48 h-60 rounded-xl object-cover border-4 border-orange-400 shadow-lg">
                                    </div>
                                    <div class="flex-grow">
                                        <h2 class="text-3xl font-bold mb-4">Founder's Message</h2>
                                        <blockquote class="relative text-lg md:text-xl italic text-gray-200 p-6 border-l-4 border-orange-400 bg-slate-700 rounded-r-lg">
                                            <p>"When we started Shree Karni Kripa Associates, we had one dream - to ensure that no one in our region feels alone or misguided when they need financial assistance. We don't just provide loans; we build relationships and help make dreams come true. Your trust is our greatest asset."</p>
                                        </blockquote>
                                        <p class="mt-4 text-right font-semibold text-lg">राजेंद्र सिंह, <span class="text-orange-400">Founder</span></p>
                                    </div>
                                </div>
                            </section>

                            <!-- Team Section -->
                            <section>
                                <div class="text-center mb-12">
                                    <h2 class="text-3xl md:text-4xl font-bold text-slate-800">Meet Our Expert Team</h2>
                                </div>
                                <div id="team-members-grid" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-center">
                                    <figure class="team-member-card text-center bg-slate-50 p-6 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-2 transition-transform duration-300 cursor-pointer" data-member-id="krishna-singh">
                                        <img class="w-24 h-32 rounded-lg mx-auto object-cover ring-4 ring-white" src="https://res.cloudinary.com/dhme90fr1/image/upload/w_192,h_256,c_fill,g_face,q_auto:good,f_auto/v1756629459/PHOTO-2025-08-28-13-18-32_h8oozl.jpg" alt="Krishna Singh" loading="lazy" decoding="async" width="96" height="128">
                                        <figcaption class="mt-4"><h3 class="text-xl font-bold text-slate-800">Krishna Singh</h3><p class="text-blue-600 font-semibold">Marketing Head</p></figcaption>
                                    </figure>
                                    <figure class="team-member-card text-center bg-slate-50 p-6 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-2 transition-transform duration-300 cursor-pointer" data-member-id="sona-mulani">
                                        <img class="w-24 h-32 rounded-lg mx-auto object-cover ring-4 ring-white" src="https://res.cloudinary.com/dhme90fr1/image/upload/w_192,h_256,c_fill,g_face,q_auto:good,f_auto/v1756628063/PHOTO-2025-08-28-13-05-09_oqhbv6.jpg" alt="Sona Mulani" loading="lazy" decoding="async" width="96" height="128">
                                        <figcaption class="mt-4"><h3 class="text-xl font-bold text-slate-800">Sona Mulani</h3><p class="text-blue-600 font-semibold">Branch Manager</p></figcaption>
                                    </figure>
                                    <figure class="team-member-card text-center bg-slate-50 p-6 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-2 transition-transform duration-300 cursor-pointer" data-member-id="mohammad-sharif">
                                        <img class="w-24 h-32 rounded-lg mx-auto object-cover ring-4 ring-white" src="https://res.cloudinary.com/dhme90fr1/image/upload/w_192,h_256,c_fill,g_face,q_auto:good,f_auto/v1756628069/PHOTO-2025-08-28-13-00-15_gb2ei3.jpg" alt="Mohammad Sharif" loading="lazy" decoding="async" width="96" height="128">
                                        <figcaption class="mt-4"><h3 class="text-xl font-bold text-slate-800">Mohammad Sharif</h3><p class="text-blue-600 font-semibold">Operations Head</p></figcaption>
                                    </figure>
                                    <figure class="team-member-card text-center bg-slate-50 p-6 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-2 transition-transform duration-300 cursor-pointer" data-member-id="saroj-choudhary">
                                        <img class="w-24 h-32 rounded-lg mx-auto object-cover ring-4 ring-white" src="https://res.cloudinary.com/dhme90fr1/image/upload/w_192,h_256,c_fill,g_face,q_auto:good,f_auto/v1756991306/WhatsApp_Image_2025-08-28_at_11.52.11_AM_mffbbw.jpg" alt="Saroj Choudhary" loading="lazy" decoding="async" width="96" height="128">
                                        <figcaption class="mt-4"><h3 class="text-xl font-bold text-slate-800">Saroj Choudhary</h3><p class="text-blue-600 font-semibold">Team Leader</p></figcaption>
                                    </figure>
                                </div>
                                <div class="text-center mt-12">
                                    <a href="#careers" class="page-link inline-block bg-white text-slate-800 border-2 border-slate-800 font-bold py-3 px-10 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">Join Our Team</a>
                                </div>
                            </section>
                        </div>
                    </div>

                    <!-- Right Sidebar (25%) -->
                    <aside class="right-sidebar">
                        <div class="sidebar-loan-list">
                            <h3>Our Products</h3>
                            <ul>
                                ${Object.keys(productData).map(key => `
                                    <li>
                                        <a href="#${key}" class="page-link sidebar-loan-link">
                                            ${productData[key].name}
                                        </a>
                                    </li>
                                `).join('')}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        `;

        // The "Meet All Members" button logic is removed as it's no longer needed.
    }

    function renderGovtEmployeeLoanPage() {
        const page = document.getElementById('govt-employees-loan-page');
        if (!page) return;
        updateMetaTags('loans-for-government-employees');
        page.innerHTML = `
            <div class="container mx-auto px-6 py-12">
                <div class="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-lg">
                    <div class="text-center mb-12">
                        <h1 class="text-4xl md:text-5xl font-extrabold text-slate-800">राजस्थान के सरकारी कर्मचारियों के लिए विशेष लोन ऑफर्स</h1>
                        <p class="text-gray-600 mt-4 text-lg">एक सरकारी कर्मचारी (Government Employee) होना गर्व की बात है, और यह आपकी वित्तीय स्थिरता (financial stability) को भी दर्शाता है। बैंक आपकी नौकरी की सुरक्षा और स्थिर आय के कारण आपको एक "प्रीमियम ग्राहक" मानते हैं।</p>
                    </div>

                    <p class="text-center text-lg text-gray-700 mb-12"><strong>श्री करणी कृपा एसोसिएट्स (SKF अजमेर)</strong> में, हम यह सुनिश्चित करते हैं कि आपको वह विशेष लाभ मिलें जिसके आप हक़दार हैं। हम 90+ बैंकों के साथ काम करते हैं और जानते हैं कि कौन सा बैंक सरकारी कर्मचारियों को सबसे अच्छी डील दे रहा है।</p>

                    <div class="bg-blue-50 p-8 rounded-xl border-t-4 border-blue-500 mb-12">
                        <h2 class="text-2xl font-bold text-slate-800 mb-4 text-center">सरकारी कर्मचारियों को मिलने वाले विशेष लाभ</h2>
                        <div class="grid md:grid-cols-2 gap-6 text-gray-700">
                            <div class="flex items-start"><span class="text-2xl mr-3">📉</span><div><h3 class="font-bold">सबसे कम ब्याज दरें (Lowest ROI)</h3><p class="text-sm">आपकी स्थिर आय के कारण बैंक आपको पर्सनल लोन और कार लोन पर दूसरों की तुलना में कम ब्याज दर ऑफर करते हैं।</p></div></div>
                            <div class="flex items-start"><span class="text-2xl mr-3">💰</span><div><h3 class="font-bold">ज़्यादा लोन राशि (Higher Eligibility)</h3><p class="text-sm">आपकी नौकरी की सुरक्षा को देखते हुए, बैंक आपको ज़्यादा लोन राशि (higher loan amount) के लिए योग्य मानते हैं।</p></div></div>
                            <div class="flex items-start"><span class="text-2xl mr-3">📄</span><div><h3 class="font-bold">न्यूनतम दस्तावेज़ (Minimal Documents)</h3><p class="text-sm">प्रक्रिया बहुत तेज़ होती है, अक्सर सिर्फ आपकी सैलरी स्लिप और ID प्रूफ पर लोन मिल जाता है।</p></div></div>
                            <div class="flex items-start"><span class="text-2xl mr-3">✨</span><div><h3 class="font-bold">लचीली शर्तें (Flexible Terms)</h3><p class="text-sm">आपको अक्सर लंबी अवधि और ज़ीरो प्रोसेसिंग फीस जैसे ऑफर भी मिलते हैं।</p></div></div>
                        </div>
                    </div>

                    <div>
                        <h2 class="text-3xl font-bold text-slate-800 mb-6 text-center">हमारी विशेष सेवाएँ (Our Special Offers for You)</h2>
                        <div class="space-y-6">
                            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 class="text-xl font-bold text-primary-color">1. इंस्टेंट पर्सनल लोन (Instant Personal Loan)</h3>
                                <p class="text-gray-600 mt-2">अपनी किसी भी ज़रूरत (शादी, मेडिकल, शिक्षा) के लिए 48 घंटों में तुरंत लोन पाएं, वह भी सबसे कम ब्याज दरों पर।</p>
                            </div>
                            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 class="text-xl font-bold text-primary-color">2. होम लोन (Home Loan)</h3>
                                <p class="text-gray-600 mt-2">हम आपको ज़्यादा लोन राशि और कम प्रोसेसिंग फीस पर होम लोन दिलाते हैं, ताकि आप अपनी पसंद का घर खरीद सकें।</p>
                            </div>
                            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <h3 class="text-xl font-bold text-primary-color">3. कार लोन (Car Loan)</h3>
                                <p class="text-gray-600 mt-2">नई या पुरानी कार के लिए 100% तक ऑन-रोड फाइनेंसिंग और विशेष ब्याज दरों का लाभ उठाएं।</p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-12 text-center bg-gray-100 p-6 rounded-lg">
                        <h2 class="text-2xl font-bold text-slate-800">SKF एसोसिएट्स ही क्यों चुनें?</h2>
                        <p class="text-gray-700 mt-2 max-w-2xl mx-auto">आपको सरकारी बैंकों (जैसे SBI, BoB) से तो अच्छे ऑफर मिल ही सकते हैं, लेकिन प्राइवेट बैंक (जैसे HDFC, ICICI) भी सरकारी कर्मचारियों के लिए विशेष स्कीमें चलाते हैं। हम इन सभी की तुलना आपके लिए करते हैं और आपको वह डील दिलाते हैं जो सच में आपके लिए सबसे अच्छी हो।</p>
                        <p class="font-bold mt-4">अपनी नौकरी के विशेष लाभों का फायदा उठाएँ!</p>
                    </div>
                </div>
            </div>
        `;
    }

    function renderCareersPage() {
        const careersPage = document.getElementById('careers-page');
        if (!careersPage) return;
        careersPage.innerHTML = `
            <div class="bg-gray-50 py-12 md:py-20">
                <div class="container mx-auto px-6">
                    <div class="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-lg">
                        <div class="text-center mb-8">
                            <h1 class="text-3xl md:text-4xl font-extrabold text-slate-800">Job: Relationship Manager (Loan Sales)</h1>
                            <p class="text-gray-500 mt-2">Ajmer (Salary-based) & Pan-Rajasthan (Incentive-based)</p>
                        </div>
                        <div class="text-gray-700 space-y-8">
                            <p class="text-lg"><strong>Shree Karni Kripa Associates (SKF Ajmer)</strong> is a leading financial services advisory firm in Rajasthan. We provide our clients with the best loan and insurance solutions tailored to their needs. We are expanding our team and invite ambitious professionals to join us.</p>

                            <div>
                                <h2 class="text-2xl font-bold text-slate-800 border-b pb-2 mb-4">Role Overview</h2>
                                <p>We are looking for dynamic and result-oriented <strong>Relationship Managers</strong> to help us grow our loan business. Your primary responsibility will be to connect with new clients, understand their loan requirements, and source loan files for login.</p>
                            </div>

                            <div>
                                <h2 class="text-2xl font-bold text-slate-800 border-b pb-2 mb-4">Key Responsibilities</h2>
                                <ul class="list-disc pl-6 space-y-2">
                                    <li>Identify and establish contact with new clients (Individuals & Businesses).</li>
                                    <li>Understand clients' financial needs and advise them on the right loan products (Home, Business, Personal, Vehicle, LAP).</li>
                                    <li>Assist clients in collecting the necessary documents for the loan application (Loan File Sourcing).</li>
                                    <li>Process loan applications with the right bank or NBFC (Loan File Login).</li>
                                    <li>Build and maintain strong relationships with clients.</li>
                                    <li>Meet sales targets.</li>
                                </ul>
                            </div>

                            <div>
                                <h2 class="text-2xl font-bold text-slate-800 border-b pb-2 mb-4">Location & Compensation</h2>
                                <p>We have two types of opportunities:</p>
                                <ol class="list-decimal pl-6 space-y-2 mt-2">
                                    <li><strong>For Ajmer Office:</strong> This is a permanent, <strong>fixed salary-based</strong> role. You will be required to work from our Ajmer office.</li>
                                    <li><strong>For Pan-Rajasthan (Outside Ajmer):</strong> This is a flexible, <strong>purely incentive-based</strong> role. You can work from anywhere in Rajasthan. Your earnings will be directly linked to the business you generate (unlimited earning potential).</li>
                                </ol>
                            </div>

                            <div>
                                <h2 class="text-2xl font-bold text-slate-800 border-b pb-2 mb-4">Who We Are Looking For</h2>
                                <ul class="list-disc pl-6 space-y-2">
                                    <li>Experience in sales or business development is preferred (especially in loans, insurance, finance, banking, NBFC, or DSA sectors).</li>
                                    <li>Excellent communication, negotiation, and relationship-building skills.</li>
                                    <li>A personal motorcycle is mandatory for fieldwork.</li>
                                    <li>Freshers with a strong desire to learn and a passion for sales are also welcome to apply.</li>
                                    <li>Candidates from any city/district in Rajasthan can apply.</li>
                                </ul>
                            </div>

                            <div>
                                <h2 class="text-2xl font-bold text-slate-800 border-b pb-2 mb-4">Why Join SKF Associates?</h2>
                                <ul class="list-disc pl-6 space-y-2">
                                    <li>Best-in-industry incentive and payout structure.</li>
                                    <li>Unlimited earning opportunity (especially for the Pan-Rajasthan role).</li>
                                    <li>Flexible working hours.</li>
                                    <li>Complete training on products and processes with continuous support.</li>
                                    <li>Career growth opportunities with a reputable and fast-growing company in Rajasthan.</li>
                                </ul>
                            </div>

                            <!-- Application Form Section -->
                            <div id="apply-form-section" class="bg-blue-50 border-t-4 border-blue-500 p-6 md:p-8 rounded-b-lg mt-12">
                                <h2 class="text-2xl font-bold text-slate-800 text-center mb-6">Apply for this Position</h2>
                                <form id="career-application-form" class="max-w-xl mx-auto space-y-5">
                                    <div><label for="career-name" class="block font-medium text-gray-700">Full Name</label><input type="text" id="career-name" name="fullName" class="w-full mt-1 p-3 border rounded-lg" required></div>
                                    <div class="grid sm:grid-cols-2 gap-5">
                                        <div><label for="career-mobile" class="block font-medium text-gray-700">Mobile Number</label><input type="tel" id="career-mobile" name="mobile" class="w-full mt-1 p-3 border rounded-lg" required></div>
                                        <div><label for="career-email" class="block font-medium text-gray-700">Email Address</label><input type="email" id="career-email" name="email" class="w-full mt-1 p-3 border rounded-lg" required></div>
                                    </div>
                                    <div><label for="career-city" class="block font-medium text-gray-700">Current City</label><input type="text" id="career-city" name="city" class="w-full mt-1 p-3 border rounded-lg" required></div>
                                    <div><label for="career-experience" class="block font-medium text-gray-700">Summarize your experience (if any)</label><textarea id="career-experience" name="experience" rows="3" class="w-full mt-1 p-3 border rounded-lg" placeholder="e.g., 2 years experience in personal loan sales at HDFC Bank..."></textarea></div>
                                    <div class="pt-2">
                                        <button type="submit" class="w-full bg-primary-color text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg">Submit Application</button>
                                    </div>
                                </form>
                            </div>

                            <div class="text-center text-gray-600 pt-6">
                                <p>Alternatively, you can contact us directly at:</p>
                                <p class="font-bold mt-2">📞 <a href="tel:9214104963" class="hover:underline">9214104963</a> | <a href="tel:9352358494" class="hover:underline">9352358494</a></p>
                            </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderFinancialAdvisoryPage() {
        const page = document.getElementById('financial-advisory-page');
        if (!page) return;
        updateMetaTags('financial-advisory-services');
        page.innerHTML = `
            <div class="container mx-auto px-6 py-12">
                <div class="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-lg">
                    <div class="text-center mb-12">
                        <h1 class="text-4xl md:text-5xl font-extrabold text-slate-800">सिर्फ लोन नहीं, संपूर्ण वित्तीय सलाह</h1>
                        <p class="text-gray-600 mt-4 text-lg"><strong>श्री करणी कृपा एसोसिएट्स</strong> में हमारा लक्ष्य सिर्फ आपको लोन दिलाना नहीं है, बल्कि आपके पूरे वित्तीय जीवन को सुरक्षित और समृद्ध बनाने में मदद करना है। हम मानते हैं कि सही सलाह ही सबसे बड़ी सेवा है।</p>
                    </div>

                    <div>
                        <h2 class="text-3xl font-bold text-slate-800 mb-6 text-center">हमारी विशेषज्ञ सलाहकार सेवाएँ</h2>
                        <div class="space-y-8">
                            <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                                <h3 class="text-xl font-bold text-blue-800">1. जीवन बीमा (Life Insurance)</h3>
                                <ul class="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                                    <li><strong>टर्म इंश्योरेंस:</strong> आपके परिवार की सुरक्षा के लिए सबसे ज़रूरी पॉलिसी।</li>
                                    <li><strong>गारंटीड इनकम प्लान:</strong> आपके रिटायरमेंट या बच्चों की पढ़ाई के लिए।</li>
                                    <li>हम आपको आपकी ज़रूरत के हिसाब से सही लाइफ इंश्योरेंस प्लान चुनने में मदद करते हैं।</li>
                                </ul>
                            </div>
                            <div class="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
                                <h3 class="text-xl font-bold text-green-800">2. प्रॉपर्टी पेपर्स की जाँच (Property Document Verification)</h3>
                                <p class="text-gray-700 mt-2">लोन लेने से पहले, यह ज़रूरी है कि आपकी प्रॉपर्टी के कागज़ात (Title Deeds) बिल्कुल साफ़ हों। हमारी टीम लोन फाइल लॉगिन करने से पहले ही आपके कागज़ातों की जाँच करती है ताकि बाद में कोई कानूनी अड़चन न आए।</p>
                            </div>
                            <div class="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
                                <h3 class="text-xl font-bold text-yellow-800">3. अन्य वित्तीय उत्पाद (Other Financial Products)</h3>
                                <p class="text-gray-700 mt-2"><strong>हम क्या नहीं करते:</strong> हम सीधे तौर पर स्टॉक मार्केट या म्यूचुअल फंड (Mutual Funds) में निवेश नहीं करवाते, क्योंकि हम SEBI-रजिस्टर्ड नहीं हैं।<br><strong>हम कैसे मदद करते हैं:</strong> हम समझते हैं कि ये आपकी वित्तीय योजना का हिस्सा हैं। हम आपको राजस्थान के सबसे भरोसेमंद और रजिस्टर्ड इन्वेस्टमेंट एडवाइज़र्स और चार्टर्ड अकाउंटेंट्स (CAs) के साथ जोड़ सकते हैं।</p>
                            </div>
                        </div>
                    </div>

                    <div class="mt-12 text-center bg-gray-100 p-6 rounded-lg">
                        <h2 class="text-2xl font-bold text-slate-800">आपका एक-स्टॉप फाइनेंसियल पार्टनर</h2>
                        <p class="text-gray-700 mt-2 max-w-2xl mx-auto">पैसे से जुड़ा कोई भी सवाल हो, <strong>SKF एसोसिएट्स</strong> के पास उसका सही और ईमानदार जवाब है।</p>
                    </div>
                </div>
            </div>
        `;
    }

    function renderContactPage() {
        const contactPage = document.getElementById('contact-page');
        if (!contactPage) return;
        contactPage.innerHTML = `
            <div class="bg-slate-800 text-white" style="background-image: url('https://res.cloudinary.com/dhme90fr1/image/upload/v1757387616/PHOTO-2025-09-09-08-37-28_dlonup.jpg'); background-size: cover; background-position: center; position: relative;">
                <div class="absolute inset-0 bg-slate-800/70 backdrop-blur-sm"></div>
                <div class="container mx-auto px-6 py-16 text-center relative z-10">
                    <h1 class="text-4xl md:text-5xl font-extrabold">Contact Us – Shree Karni Kripa Associates</h1>
                    <p class="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">We're here to help you with all your financial needs. Reach out to us for expert advice and quick solutions.</p>
                </div>
            </div>
            <div class="py-16 md:py-24 bg-gray-50">
                <div class="container mx-auto px-6">
                    <div class="grid lg:grid-cols-2 gap-12">
                        <!-- Left Column: Contact Info -->
                        <div class="space-y-8 text-gray-800">
                            <h2 class="text-3xl font-bold">Get in Touch</h2>
                            <div class="space-y-6">
                                <!-- Address -->
                                <div class="flex items-start"><svg class="w-6 h-6 mr-4 mt-1 text-primary-color flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg><div><h3 class="font-semibold text-lg">Our Office</h3><p class="text-gray-600">2nd Floor, Bhansali Complex, Kayad Road, Ajmer – 305001</p></div></div>
                                <!-- Phone -->
                                <div class="flex items-start"><svg class="w-6 h-6 mr-4 mt-1 text-primary-color flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg><div><h3 class="font-semibold text-lg">Call Us</h3><p class="text-gray-600"><a href="tel:9214104963" class="hover:text-primary-color">9214104963</a> | <a href="tel:9352358494" class="hover:text-primary-color">9352358494</a> | <a href="tel:8118838772" class="hover:text-primary-color">8118838772</a></p></div></div>
                                <!-- Email -->
                                <div class="flex items-start"><svg class="w-6 h-6 mr-4 mt-1 text-primary-color flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg><div><h3 class="font-semibold text-lg">Email Us</h3><p class="text-gray-600"><a href="mailto:insurancesolution2018@gmail.com" class="hover:text-primary-color">insurancesolution2018@gmail.com</a></p></div></div>
                            </div>
                            <!-- Social Media -->
                            <div class="border-t pt-6">
                                <h3 class="font-semibold text-lg mb-4">Follow Us</h3>
                                <div class="flex space-x-4">
                                    <a href="https://www.facebook.com/share/19hmuoJW8a/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-blue-600 transition-colors" aria-label="Facebook"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg></a>
                                    <a href="https://www.instagram.com/skf_associate" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-pink-500 transition-colors" aria-label="Instagram"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.441c-3.117 0-3.483.011-4.71.068-2.818.128-3.946 1.258-4.073 4.073-.057 1.227-.068 1.593-.068 4.71s.011 3.483.068 4.71c.127 2.815 1.255 3.946 4.073 4.073 1.227.057 1.593.068 4.71.068s3.483-.011 4.71-.068c2.818-.128 3.946-1.258 4.073-4.073.057-1.227.068-1.593.068-4.71s-.011-3.483-.068-4.71c-.127-2.815-1.255-3.946-4.073-4.073-1.227-.057-1.593-.068-4.71-.068zM12 6.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm5.338-9.87a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"/></svg></a>
                                    <a href="https://x.com/skf_ajmer?s=21" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-black transition-colors" aria-label="X/Twitter"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
                                    <a href="https://chat.whatsapp.com/JPUFjLhZAzb5wFNcNvRCy1?mode=ems_copy_t" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-green-500 transition-colors" aria-label="WhatsApp"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2m.01 1.66c4.56 0 8.26 3.7 8.26 8.26 0 4.56-3.7 8.26-8.26 8.26-1.55 0-3.04-.43-4.34-1.21l-.3-.18-3.22.84.86-3.14-.2-.32a8.18 8.18 0 0 1-1.26-4.49c0-4.56 3.7-8.26 8.26-8.26m4.52 6.13c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-.99-.36-1.89-1.16-.7-.62-1.17-1.38-1.31-1.62-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42s-.54-1.3-.74-1.78c-.2-.48-.4-.42-.55-.42-.14 0-.3 0-.46 0s-.42.06-.64.3c-.22.24-.86.84-1.06 2.04-.2 1.2.1 2.38.22 2.54.12.16 1.41 2.18 3.42 3.02.47.2 1.03.31 1.39.4.52.12.99.1.14-.06.2-.06.62-.26.84-.5.22-.24.22-.44.16-.5Z"/></svg></a>
                                </div>
                            </div>
                        </div>
                        <!-- Right Column: Form -->
                        <div class="bg-white p-8 rounded-lg shadow-lg">
                            <h2 class="text-3xl font-bold text-gray-800 mb-6">Send Your Query</h2>
                            <form id="contact-us-form" class="space-y-6">
                                <div><label for="contact-name" class="block font-medium text-gray-700">Full Name</label><input type="text" id="contact-name" name="fullName" class="w-full mt-1 p-3 border rounded-lg" required></div>
                                <div class="grid sm:grid-cols-2 gap-6">
                                    <div><label for="contact-mobile" class="block font-medium text-gray-700">Mobile Number</label><input type="tel" id="contact-mobile" name="mobile" class="w-full mt-1 p-3 border rounded-lg" required></div>
                                    <div><label for="contact-email" class="block font-medium text-gray-700">Email Address</label><input type="email" id="contact-email" name="email" class="w-full mt-1 p-3 border rounded-lg"></div>
                                </div>
                                <button type="submit" class="w-full bg-primary-color text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg">Send Message</button>
                            </form>
                        </div>
                    </div>
                    <!-- Google Map Section -->
                    <div class="mt-16">
                        <h2 class="text-3xl font-bold text-center mb-8">Find Us on the Map</h2>
                        <div class="rounded-lg overflow-hidden shadow-xl border-4 border-white">
                            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3575.485108990158!2d74.6810283751025!3d26.51459997680281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396be7c181525e9f%3A0xe60d96d2906d7e9f!2sShree%20Karni%20Kripa%20Associates%20(SKF%20Ajmer)!5e0!3m2!1sen!2sin!4v1757400454504!5m2!1sen!2sin" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderJoinUsPage() {
        const joinUsPage = document.getElementById('join-us-page');
        if (!joinUsPage) return;
        updateMetaTags('join-us');

        joinUsPage.innerHTML = `
            <div class="bg-slate-800 text-white" style="background-image: url('https://res.cloudinary.com/dugvqluo2/image/upload/e_blur:300/v1758173989/WhatsApp_Image_2025-09-11_at_3.44.21_PM_j8xhmh.jpg'); background-size: cover; background-position: center;">
                <div class="container mx-auto px-4 py-16 md:py-24 text-center bg-slate-800/60">
                    <h1 class="text-3xl md:text-5xl font-extrabold text-white">Start Your Financial Business in Rajasthan</h1>
                    <p class="mt-4 text-lg text-gray-200 max-w-3xl mx-auto">Partner with SKF Associates and unlock unlimited earning potential through our proven franchise and partner models.</p>
                </div>
            </div>
            <div class="py-16 md:py-24 bg-gray-50">
                <div class="container mx-auto px-4 grid lg:grid-cols-3 gap-8 lg:gap-12">
                    <!-- Left Column: Information -->
                    <div class="lg:col-span-2 space-y-12">
                        <div>
                            <h2 class="text-2xl md:text-3xl font-bold text-slate-800">Why Partner with Us?</h2>
                            <p class="mt-2 text-gray-600">We're not just looking for employees; we're looking for partners to grow with. Here’s what you get when you join our network:</p>
                            <div class="grid sm:grid-cols-2 gap-6 mt-6">
                                <div class="flex items-start"><span class="text-2xl mr-3">💰</span><div><h3 class="font-bold">Unlimited Earning</h3><p class="text-sm text-gray-600">Our industry-best incentive structure means your income has no limits.</p></div></div>
                                <div class="flex items-start"><span class="text-2xl mr-3">⏰</span><div><h3 class="font-bold">Total Flexibility</h3><p class="text-sm text-gray-600">Be your own boss. Work from anywhere in Rajasthan, on your own schedule.</p></div></div>
                                <div class="flex items-start"><span class="text-2xl mr-3">📚</span><div><h3 class="font-bold">Expert Training</h3><p class="text-sm text-gray-600">We provide complete product training and continuous support to ensure your success.</p></div></div>
                                <div class="flex items-start"><span class="text-2xl mr-3">🤝</span><div><h3 class="font-bold">Trusted Brand</h3><p class="text-sm text-gray-600">Leverage the SKF Associates brand, a symbol of trust and quality in Rajasthan.</p></div></div>
                                <div class="flex items-start"><span class="text-2xl mr-3">📊</span><div><h3 class="font-bold">Wide Product Range</h3><p class="text-sm text-gray-600">Offer a diverse portfolio of loans and insurance from over 30+ financial institutions.</p></div></div>
                                <div class="flex items-start"><span class="text-2xl mr-3">🚀</span><div><h3 class="font-bold">Growing Network</h3><p class="text-sm text-gray-600">Become part of a fast-growing network that is setting new benchmarks for success.</p></div></div>
                            </div>
                        </div>

                        <div>
                            <h2 class="text-2xl md:text-3xl font-bold text-slate-800">Our Business Model Explained</h2>
                            <p class="mt-2 text-gray-600">Our model is simple and effective. We act as a bridge between customers and financial institutions.</p>
                            <ol class="list-decimal pl-5 space-y-2 mt-4 text-gray-700">
                                <li><strong>Understand Client Needs:</strong> We meet with clients to understand their financial goals.</li>
                                <li><strong>Find the Best Solution:</strong> We compare offers from 30+ banks to find the perfect product.</li>
                                <li><strong>Assist in Process:</strong> We help clients from documentation (File Sourcing) to disbursal (File Login).</li>
                                <li><strong>Your Role as a Partner:</strong> You bring in new clients, understand their needs, and work with our team to provide solutions. You earn an attractive commission on every successful deal.</li>
                            </ol>
                        </div>

                        <div>
                            <h2 class="text-2xl md:text-3xl font-bold text-slate-800">The Partnership Opportunity</h2>
                            <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 mt-4">
                                <h3 class="font-bold text-lg text-blue-800">Franchise / Business Partner Model (Pan-Rajasthan)</h3>
                                <p class="mt-2 text-gray-600">This model is for entrepreneurs who want to establish their own business under the SKF brand. You will operate independently, with our full backing in training, branding, and support. Your earnings are 100% commission-based, offering unlimited potential.</p>
                            </div>
                        </div>

                        <div>
                            <h2 class="text-2xl md:text-3xl font-bold text-slate-800">Who We Are Looking For</h2>
                            <ul class="list-disc pl-5 space-y-2 mt-4 text-gray-700">
                                <li><strong>Ambitious Individuals:</strong> A passion to grow and earn.</li>
                                <li><strong>Excellent Communicators:</strong> Ability to build relationships with ease.</li>
                                <li><strong>Honest & Hardworking:</strong> A commitment to providing genuine advice.</li>
                                <li><strong>Local Network (A Plus):</strong> Good local contacts are beneficial but not mandatory.</li>
                                <li><strong>Experience (Optional):</strong> Background in sales, finance, or insurance is a plus, but motivated freshers are welcome.</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Right Column: Application Form -->
                    <div class="lg:col-span-1">
                        <div class="bg-white p-6 md:p-8 rounded-2xl shadow-xl lg:sticky top-28">
                           <h3 class="text-2xl font-bold mb-2 text-center text-gray-800">Take the Next Step</h3>
                           <p class="text-center text-gray-600 mb-6">Ready to start your journey? Fill out the form below or contact us directly.</p>
                           <form id="dsa-form" class="space-y-5" data-role="Partner/Franchise">
                               <div><label for="dsa-name" class="block text-sm font-medium text-gray-600">Full Name</label><input id="dsa-name" name="fullName" type="text" placeholder="Your Full Name" class="w-full mt-1 p-3 border rounded-lg" required></div>
                               <div><label for="dsa-mobile" class="block text-sm font-medium text-gray-600">Mobile Number</label><input id="dsa-mobile" name="mobile" type="tel" placeholder="Your Mobile Number" class="w-full mt-1 p-3 border rounded-lg" required></div>
                               <div><label for="dsa-city" class="block text-sm font-medium text-gray-600">City</label><input id="dsa-city" name="city" type="text" placeholder="Your City" class="w-full mt-1 p-3 border rounded-lg" required></div>
                               <div class="pt-2">
                                   <button type="submit" class="w-full bg-white text-slate-800 border-2 border-slate-800 font-bold py-3 px-6 rounded-lg hover:bg-slate-800 hover:text-white transition-all duration-300 text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1">
                                       Become a Partner
                                   </button>
                               </div>
                           </form>
                           <div class="text-center mt-6">
                                <p class="text-sm text-gray-500">Or contact us directly:</p>
                                <p class="font-semibold text-primary-color mt-1">📞 <a href="tel:9214104963">9214104963</a> | <a href="tel:9352358494">9352358494</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderEligibilityFormPage(selectedProduct) {
        const eligibilityPage = document.getElementById('eligibility-form-page');
        if (!eligibilityPage) return;
        eligibilityPage.innerHTML = `
            <div class="bg-gray-100 py-12 md:py-20">
                <div class="container mx-auto px-6">
                    <div class="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-2xl">
                        <div class="text-center mb-8">
                            <h1 class="text-3xl md:text-4xl font-extrabold text-slate-800">Check Your Loan Eligibility</h1>
                            <p class="text-gray-600 mt-2">Fill the form below to get a quick eligibility check from our experts.</p>
                        </div>
                        <form id="smart-eligibility-form" class="space-y-6">
                            <input type="hidden" name="formType" value="Eligibility Check">
                            
                            <fieldset class="border-t-2 border-primary-color pt-4">
                                <legend class="text-lg font-semibold text-primary-color px-2">Personal Details</legend>
                                <div class="grid sm:grid-cols-2 gap-6 mt-4">
                                    <div><label for="eligibility-name" class="block font-medium text-gray-700">Full Name</label><input type="text" id="eligibility-name" name="fullName" class="w-full mt-1 p-3 border rounded-lg" required></div>
                                    <div><label for="eligibility-mobile" class="block font-medium text-gray-700">Mobile Number</label><input type="tel" id="eligibility-mobile" name="mobile" class="w-full mt-1 p-3 border rounded-lg" required></div>
                                    <div><label for="eligibility-city" class="block font-medium text-gray-700">City</label><input type="text" id="eligibility-city" name="city" class="w-full mt-1 p-3 border rounded-lg" required></div>
                                    <div><label for="eligibility-pincode" class="block font-medium text-gray-700">Pincode</label><input type="number" id="eligibility-pincode" name="pincode" class="w-full mt-1 p-3 border rounded-lg" required></div>
                                </div>
                            </fieldset>

                            <fieldset class="border-t-2 border-accent-color pt-4">
                                <legend class="text-lg font-semibold text-accent-color px-2">Loan & Income</legend>
                                <div class="grid sm:grid-cols-2 gap-6 mt-4">
                                    <div>
                                        <label for="eligibility-loan-type" class="block font-medium text-gray-700">Loan Type</label>
                                        <select id="eligibility-loan-type" name="loanType" class="w-full mt-1 p-3 border rounded-lg bg-white"><option value="Home Loan">Home Loan</option><option value="Personal Loan">Personal Loan</option><option value="Business Loan">Business Loan</option><option value="Car Loan">Car Loan</option><option value="Loan Against Property">Loan Against Property</option><option value="Insurance">Insurance</option></select>
                                    </div>
                                    <div><label for="eligibility-amount" class="block font-medium text-gray-700">Required Loan Amount (₹)</label><input type="number" id="eligibility-amount" name="requiredLoanAmount" class="w-full mt-1 p-3 border rounded-lg" required></div>
                                    <div><label for="eligibility-employment" class="block font-medium text-gray-700">Employment Type</label><select id="eligibility-employment" name="employmentType" class="w-full mt-1 p-3 border rounded-lg bg-white"><option>Salaried</option><option>Self-Employed</option></select></div>
                                    <div><label for="eligibility-income" class="block font-medium text-gray-700">Monthly Income (₹)</label><input type="number" id="eligibility-income" name="monthlyIncome" class="w-full mt-1 p-3 border rounded-lg" required></div>
                                </div>
                            </fieldset>

                            <div>
                                <label class="block font-medium text-gray-700">Any Running Loan?</label>
                                <div class="mt-2 flex gap-6">
                                    <label class="flex items-center"><input type="radio" name="runningLoan" value="Yes" class="mr-2 h-4 w-4 text-primary-color focus:ring-primary-color"> Yes</label>
                                    <label class="flex items-center"><input type="radio" name="runningLoan" value="No" class="mr-2 h-4 w-4 text-primary-color focus:ring-primary-color" checked> No</label>
                                </div>
                            </div>
                            <div id="running-loan-details-container" class="hidden">
                                <label for="running-loan-details" class="block font-medium text-gray-700">Running Loan Details</label>
                                <textarea id="running-loan-details" name="runningLoanDetails" class="w-full mt-1 p-3 border rounded-lg" placeholder="e.g., Car Loan, EMI: 5000, Pending: 2 Lakhs"></textarea>
                            </div>
                            <div class="pt-6">
                                <button type="submit" class="w-full bg-primary-color text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                    Submit & Check Eligibility                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Add event listener to show/hide the running loan details field
        const form = eligibilityPage.querySelector('#smart-eligibility-form');
        if (form) {
            const runningLoanRadios = form.querySelectorAll('input[name="runningLoan"]');
            const runningLoanDetailsContainer = form.querySelector('#running-loan-details-container');

            runningLoanRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    runningLoanDetailsContainer.classList.toggle('hidden', e.target.value !== 'Yes');
                });
            });
        }
    }
    
    // Helper to find the option value from the display text
    function findOptionValueByText(selectElement, text) {
        return Array.from(selectElement.options).find(opt => opt.text === text)?.value;
    }

    function launchConfetti() { /* ... */ }
    function initializeCarousels(){
        new Swiper('.gallery-carousel', {
            loop: true,
            slidesPerView: 4,
            spaceBetween: 30,
            autoplay: {
                delay: 2000, // 2-second delay
                disableOnInteraction: false,
            },
            breakpoints: {
                // when window width is >= 0px
                0: { slidesPerView: 2, spaceBetween: 20 },
                // when window width is >= 600px
                600: { slidesPerView: 2, spaceBetween: 20 },
                // when window width is >= 992px
                992: { slidesPerView: 3, spaceBetween: 30 },
            }
        });

        new Swiper('.why-us-carousel', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 30,
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
            },
            breakpoints: {
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
            }
        });

        new Swiper('.testimonials-carousel', {
            // Standard slider with autoplay and breakpoints
            loop: true,
            slidesPerView: 1, // Default for mobile
            spaceBetween: 30,
            autoplay: {
                delay: 3000, // Set to 3 seconds
                disableOnInteraction: false,
            },
            breakpoints: {
                768: { slidesPerView: 2 }, // 2 slides for tablets
                1024: { slidesPerView: 3 }, // 3 slides for desktops
            }
        });
    }

    function setupPrivacyBanner() {
        const modalOverlay = document.getElementById('privacy-modal-overlay');
        const acceptBtn = document.getElementById('privacy-accept-btn');

        if (!modalOverlay || !acceptBtn) return;

        // Check if the user has already accepted
        if (localStorage.getItem('privacyAccepted') === 'true') {
            modalOverlay.remove(); // Remove modal from DOM if already accepted
            return;
        }

        // Show the modal if not accepted
        modalOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Disable scrolling
        setTimeout(() => modalOverlay.classList.add('is-visible'), 50); // Fade in for smooth transition
        
        // Handle accept button click
        acceptBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('is-visible');
            localStorage.setItem('privacyAccepted', 'true');
            document.body.style.overflow = ''; // Re-enable scrolling
            setTimeout(() => {
                modalOverlay.remove();
            }, 300); // Remove after fade out transition
        });
    }

    // The addTiltEffectToNavLinks function has been removed to fix button visibility bugs.

    // --- START THE APP ---
    initializeStaticUI();
    initializeDynamicContent();
})

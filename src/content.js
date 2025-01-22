window.addEventListener('load', function() {
    const selectors = {
        personName: '.teaching-record-person-name',
        phoneNumber: '//*[@id="clickable-phone-field-0"]/div/tc-clickable-phone/div',
        address: '/html/body/app-root/app-container/div/div/tc-unity-view/div/div[2]/tc-teaching-record/div/tc-teaching-record-profile/div/tc-profile-location-info/div/div[2]/div[1]/div[1]/div[1]',
        areaName: '/html/body/app-root/app-container/div/div/tc-unity-view/div/div[2]/tc-teaching-record/div/tc-teaching-record-profile/div/tc-profile-assignment-info/div/tc-suggested-assignment/form/div/div[4]/div[1]/div/select/option',
        areaPhoneNumber: '/html/body/app-root/app-container/div/div/tc-unity-view/div/div[2]/tc-teaching-record/div/tc-teaching-record-profile/div/tc-profile-assignment-info/div/tc-suggested-assignment/form/div/div[4]/div[2]/tc-area-missionaries/div[2]/tc-clickable-phone/div/text()',
        request: '/html/body/app-root/app-container/div/div/tc-unity-view/div/div[2]/tc-teaching-record/div/tc-teaching-record-profile/div/tc-profile-offers-info/div/div[2]/div[2]/div[1]',
        startTime: '/html/body/app-root/app-container/div/div/tc-unity-view/div/div[2]/tc-event-form-container/form/div[1]/tc-event-form/fieldset[1]/div/div[1]/div[2]/div[1]/tc-timepicker/div/input',
        endTime: '/html/body/app-root/app-container/div/div/tc-unity-view/div/div[2]/tc-event-form-container/form/div[1]/tc-event-form/fieldset[1]/div/div[1]/div[2]/div[2]/tc-timepicker/div/input',
        contactType: '/html/body/app-root/app-container/div/div/tc-unity-view/div/div[2]/tc-event-form-container/form/div[1]/tc-event-form/fieldset[1]/div/div[1]/div[4]/select'
    };

    const cidadesUba = [
        "Adrianopolis", "Arapoti", "Barbosa Ferraz", "Cerro Azul", "Curiúva", "Figueira", "Grandes Rios", "Ibaiti", "Iretama", "Ivaí", "Ivaiporã", "Jaboti", "Jaguariaíva", "Jardim Alegre", "Lidianópolis", "Manoel", "Ortigueira", "Pinhalão", "Piraí Do Sul", "São João do Ivaí", "Teixeira Soares", "Tunas de Paraná", "Irati", "Morretes", "Faxinal", "Siqueira Campos", "São José Da Boa Vista", "Arapuã", "Reserva", "Ventania", "Grandes Rios", "Ipiranga", "Imbituva"
    ];

    let whatsappOpened = false;

    let currentUrl = window.location.href;
    let isPersonPage = /\/person\//.test(currentUrl);
    let isMissionPage = /\/persons\/mission/.test(currentUrl);
    let isEditPage = /\/edit/.test(currentUrl);

    function getElementText(selector, isXPath = false) {
        if (isXPath) {
            const result = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            const element = result.singleNodeValue;
            return element ? element.textContent.trim() : null;
        } else {
            const element = document.querySelector(selector);
            return element ? element.textContent.trim() : null;
        }
    }

    function checkAllElementsFound() {
        const personName = getElementText(selectors.personName);
        const phoneNumber = getElementText(selectors.phoneNumber, true);
        const address = getElementText(selectors.address, true);
        const areaName = getElementText(selectors.areaName, true);
        const areaPhoneNumber = getElementText(selectors.areaPhoneNumber, true);
        const request = getElementText(selectors.request, true);

        const missingData = [];
        if (!personName) missingData.push('Nome da pessoa');
        if (!phoneNumber) missingData.push('Número de telefone');
        if (!address) missingData.push('Endereço');
        if (!areaName) missingData.push('Nome da área');
        if (!areaPhoneNumber) missingData.push('Telefone da área');
        if (!request) missingData.push('Telefone da área');

        if(isPersonPage){
            chrome.storage.sync.get(['savedPhoneNumber'], (result) => {
                if (!result.savedPhoneNumber) {
                    showNoSavedPhoneNumberAlert();
                } else {
                    updateButton(missingData, personName, phoneNumber, areaName, areaPhoneNumber, request, address);
                }
            });
        }
    }

    function createButton() {
        let button = document.getElementById('enviar-referencia-button');
        if (!button) {
            button = document.createElement('button');
            button.id = 'enviar-referencia-button';
            button.style.position = 'fixed';
            button.style.bottom = '10px';
            button.style.right = '10px';
            button.style.zIndex = '1000';
            button.style.padding = '10px 20px';
            button.style.color = '#fff';
            button.style.border = 'none';
            button.style.borderRadius = '5px';
            button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            document.body.appendChild(button);
        }
        return button;
    }

    function createAlertDiv() {
        let alertDiv = document.getElementById('uba-alert');
        if (!alertDiv) {
            alertDiv = document.createElement('div');
            alertDiv.id = 'uba-alert';
            alertDiv.style.position = 'fixed';
            alertDiv.style.bottom = '50px';
            alertDiv.style.right = '10px';
            alertDiv.style.zIndex = '1000';
            alertDiv.style.padding = '10px 20px';
            alertDiv.style.color = '#fff';
            alertDiv.style.backgroundColor = '#ffc107';
            alertDiv.style.border = 'none';
            alertDiv.style.borderRadius = '5px';
            alertDiv.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            alertDiv.style.display = 'none';
            alertDiv.style.fontSize = '16px';
            document.body.appendChild(alertDiv);
        }
        return alertDiv;
    }

    function updateButton(missingData, personName, phoneNumber, areaName, areaPhoneNumber, request, address) {
        const button = createButton();
        const alertDiv = createAlertDiv();

        button.textContent = missingData.length > 0 ? 'Dados incompletos: ' + missingData.join(', ') : 'Enviar Referência';
        button.style.backgroundColor = missingData.length > 0 ? '#dc3545' : '#007bff';

        request = findRequest(request);

        const isUba = cidadesUba.some(city => address.includes(city));
        alertDiv.style.display = isUba ? 'block' : 'none';
        alertDiv.textContent = isUba ? 'A referência pode ser UBA' : '';

        if (!whatsappOpened) {
            button.onclick = function() {
                if (!whatsappOpened) {
                    whatsappOpened = true;
                    chrome.storage.sync.get(['savedPhoneNumber'], (result) => {
                        const savedPhoneNumber = result.savedPhoneNumber;

                        let message = "";

                        if(missingData.length === 0){
                            message = `@${areaPhoneNumber}\n*${areaName}*\nEnviamos uma referência para vocês pelo Pregar Meu Evangelho!\n*${personName} - ${request}*\nNúmero: ${phoneNumber}\nAdicionamos uma tarefa como observação!🎮💻\n${address}`;
                        }else{
                            message = `Enviamos uma referência para vocês pelo Pregar Meu Evangelho!\n*${personName} - ${request}*\nNúmero: ${phoneNumber}\nAdicionamos uma tarefa como observação!🎮💻\n${address}\n\n*Atenção: Dados de área faltando*`;
                        }
    
                        const encodedMessage = encodeURIComponent(message);
                        const whatsappUrl = `https://api.whatsapp.com/send?phone=+55${savedPhoneNumber}&text=${encodedMessage}`;
                 
                        window.open(whatsappUrl, '_blank');
                    });
                }
            };
        }
    }

    function observeElements() {
        const observer = new MutationObserver(checkAllElementsFound);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function reset() {
        const button = document.getElementById('enviar-referencia-button');
        if (button) button.remove();
        observeElements();
        whatsappOpened = false;
    }

    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') reset();
    });

    function checkUrlAndButton() {
        currentUrl = window.location.href;
        isPersonPage = /\/person\//.test(currentUrl);
        isMissionPage = /\/persons\/mission/.test(currentUrl);
        isEditPage = /\/edit/.test(currentUrl);

        const alertDiv = document.getElementById('uba-alert');
        if (alertDiv) {
            alertDiv.style.display = isPersonPage && cidadesUba.some(city => getElementText(selectors.address, true)?.includes(city)) ? 'block' : 'none';
        }
    
        if (isPersonPage) {
            if (!getElementText(selectors.personName) || 
                !getElementText(selectors.phoneNumber, true) || 
                !getElementText(selectors.address, true) || 
                !getElementText(selectors.areaName, true) || 
                !getElementText(selectors.areaPhoneNumber, true)) {
                observeElements();
            } else {
                checkAllElementsFound();
            }
        } else {
            const button = document.getElementById('enviar-referencia-button');
            if (button) button.remove();
        }
    
        if(isEditPage){
            editPage();
        }
    }

    function formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    function editPage() {
        const now = new Date();

        const startTime = new Date(now.getTime() - 3 * 60 * 1000);
        const endTime = new Date(now.getTime() - 1 * 60 * 1000);

        const formattedStartTime = formatTime(startTime);
        const formattedEndTime = formatTime(endTime);

        const startTimeInput = document.evaluate(
            selectors.startTime,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        const endTimeInput = document.evaluate(
            selectors.endTime,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        const contactTypeSelect = document.evaluate(
            selectors.contactType,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;

        if (startTimeInput) {
            startTimeInput.value = formattedStartTime;
            startTimeInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (endTimeInput) {
            endTimeInput.value = formattedEndTime;
            endTimeInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (contactTypeSelect) {
            contactTypeSelect.value = "1: 20";
            contactTypeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    function observePageLoad() {
        let lastUrl = window.location.href;
        const observer = new MutationObserver(() => {
            const currentUrl = window.location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                if (/\/edit/.test(currentUrl)) {
                    setTimeout(editPage, 1000);
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    observePageLoad();

    function observeUrlChanges() {
        let lastUrl = window.location.href;
        const observer = new MutationObserver(() => {
            const currentUrl = window.location.href;
            if (currentUrl !== lastUrl) {
                lastUrl = currentUrl;
                checkUrlAndButton();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    window.addEventListener('popstate', checkUrlAndButton);
    checkUrlAndButton();
    observeUrlChanges();

    function findRequest(request){
        request = request.toLowerCase();
        if(request.includes("baptism") || request.includes("batismo") || request.includes("baptismo")){
            return "Batismo";
        } else if(request.includes("lesson") || request.includes("lição")){
            return "Lição";
        } else if(request.includes("fellowship") || request.includes("companionship")){
            return "Companheirismo";
        } else if(request.includes("temple") || request.includes("templo")){
            return "Templo";
        } else if(request.includes("family") || request.includes("familysearch") || request.includes("history")){
            return "História da Família";
        } else if(request.includes("missionary visit") || request.includes("mission-specific offer")){
            return "Visita";
        } else if(request.includes("church")){
            return "Igreja";
        } else if(request.includes("book") || request.includes("mormon")){
            return "Livro de Mórmon";
        } else {
            return "Visita";
        }
    }

    function showNoSavedPhoneNumberAlert() {
        let alertDiv = document.getElementById('no-saved-phone-alert');
        if (!alertDiv) {
            alertDiv = document.createElement('div');
            alertDiv.id = 'no-saved-phone-alert';
            alertDiv.style.position = 'fixed';
            alertDiv.style.bottom = '50px';
            alertDiv.style.right = '10px';
            alertDiv.style.zIndex = '1000';
            alertDiv.style.padding = '10px 20px';
            alertDiv.style.color = '#fff';
            alertDiv.style.backgroundColor = '#f44336'; // Cor vermelha para erro
            alertDiv.style.border = 'none';
            alertDiv.style.borderRadius = '5px';
            alertDiv.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            alertDiv.style.fontSize = '16px';
            alertDiv.textContent = 'Não há número salvo para enviar a referência!';
    
            // Adicionando botão de fechar
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Fechar';
            closeButton.style.backgroundColor = '#ff6f61';
            closeButton.style.border = 'none';
            closeButton.style.color = 'white';
            closeButton.style.padding = '5px 10px';
            closeButton.style.marginLeft = '10px';
            closeButton.style.borderRadius = '5px';
            closeButton.onclick = function() {
                alertDiv.style.display = 'none';
            };
            alertDiv.appendChild(closeButton);
    
            document.body.appendChild(alertDiv);
        }
    
        alertDiv.style.display = 'block'; // Mostra o alerta
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'reloadPage') {
            location.reload();
        }
    });
});

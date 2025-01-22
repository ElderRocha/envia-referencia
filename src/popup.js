const phoneInput = document.getElementById('phone');
const saveButton = document.getElementById('saveButton');
const popupMessage = document.getElementById('popupMessage');

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['savedPhoneNumber'], (result) => {
        if (result.savedPhoneNumber) {
            let phoneNumber = result.savedPhoneNumber;

            phoneNumber = phoneNumber.replace(/[^\d]/g, '');

            if (phoneNumber.length === 11) {
                phoneNumber = `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7)}`;
            }

            phoneInput.value = phoneNumber;
        }
    });
});


phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        value = value.substring(0, 11);
        value = value.replace(/^(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    }
    e.target.value = value;
});

const isValidPhone = (value) => /^\(\d{2}\) \d{5}-\d{4}$/.test(value);

const showPopupMessage = (message, isError = false) => {
    popupMessage.textContent = message;
    popupMessage.style.backgroundColor = isError ? '#ff4d4d' : '#4caf50';
    popupMessage.classList.add('show');
    setTimeout(() => {
        popupMessage.classList.remove('show');
    }, 2000);
};

saveButton.addEventListener('click', () => {
    const phoneValue = phoneInput.value;
    if (!isValidPhone(phoneValue)) {
        phoneInput.classList.add('error');
        phoneInput.style.animation = 'shake 0.2s';
        setTimeout(() => (phoneInput.style.animation = ''), 200);
        showPopupMessage('Número inválido! Use o formato (99) 99999-9999.', true);
        return;
    }

    phoneInput.classList.remove('error');

    let cleanedPhone = phoneValue.replace(/[^\d]/g, '');

    chrome.storage.sync.set({ savedPhoneNumber: cleanedPhone }, () => {
        showPopupMessage('Número salvo com sucesso!');

        // Envia a mensagem para o content.js
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (currentTab) {
                chrome.tabs.sendMessage(currentTab.id, { action: 'reloadPage' });
            }
        });
    });
});

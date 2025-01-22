chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log('onUpdated event fired', changeInfo, tab);
    // Verifica se a página foi completamente carregada
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        console.log("Página carregada completamente!", tab.url);
        // Aqui você pode injetar o seu código ou fazer algo com a página
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['src/content.js'] // Exemplo de injeção de script
        }).then(() => {
            console.log('Script injetado com sucesso');
        }).catch((error) => {
            console.error('Erro ao injetar o script:', error);
        });
    }
});
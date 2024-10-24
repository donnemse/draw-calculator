fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        const token = '1857364491:AAFGgMoMhWWZOaT1Pd4bwnIi4NEWDNl5NSY'
        const chatId = -1001593340003
        const message = 'Hello from JavaScript!';

        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: data.ip + " - " + navigator.userAgent + " - " + document.referrer,
            }),
        })
        .then(response => response.json())
        .catch(error => document.getElementById('errorMsg').textContent = error);
})
.catch(error => {
        const errorMsg = `
            Message: ${error.message}
            Name: ${error.name}
            Stack: ${error.stack}
        `;
        document.getElementById('errorMsg').textContent = errorMsg;
    });

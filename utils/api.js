const fetch = require('node-fetch');

class Api {
    constructor(baseUrl) {
        this._baseUrl = baseUrl;
    }

    setData(data) {
        return fetch(`${this._baseUrl}/data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data) 
        })
            .then(this._handleResponse);
    }

    _handleResponse(res) {
        if (!res.ok) {
          return Promise.reject(`Error: ${res.status}`);
        }
        return res.json();
      }
}

const api = new Api('http://localhost:3000');

module.exports = api
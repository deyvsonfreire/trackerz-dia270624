export class Utils {
    constructor(config) {
        this.config = config;
        this.WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        this.MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    }

    get(key) {
        // Verifica se o cookie existe
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [cookieKey, cookieValue] = cookie.trim().split('=');
            if (cookieKey === key) {
                return cookieValue;
            }
        }

        // Se não encontrar no cookie, tenta buscar no localStorage
        const localStorageValue = localStorage.getItem(key);
        return localStorageValue;
    }

    set(cookies) {
        const domain = this.get('tkz_domain');
        const expirationTime = 15552000 * 1000; // 180 dias em milissegundos
        const expires = new Date(Date.now() + expirationTime).toUTCString();

        // Define os cookies
        for (const key in cookies) {
            const value = cookies[key];
            if (value && value !== 'undefined') {
                document.cookie = `${key}=${value}; SameSite=None; Secure; expires=${expires}; path=/; domain=.${domain}`;
                localStorage.setItem(key, value);
            }
        }
    }

    getTimestampUtc() {
        const date = new Date();
        const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        return Math.floor(utc / 1000);
    }

    search_params_url_cookie(...params) {
        // Verifica os Cookies
        for (const param of params) {
            const cookieName = param;
            const cookieValue = this.get(cookieName);
            if (cookieValue) {
                return cookieValue;
            }
        }

        // Verifica a URL
        const urlSearchParams = new URLSearchParams(window.location.search);
        for (const param of params) {
            if (urlSearchParams.has(param)) {
                return urlSearchParams.get(param);
            }
        }

        // Se não encontrado em nenhum lugar, retorne em branco
        return '';
    }

    async load_script(url) {
        return new Promise((resolve, reject) => {
            const tag = document.createElement('script');
            tag.src = url;
            tag.onload = resolve;
            tag.onerror = reject;
            document.head.appendChild(tag);
        });
    }

    check_domain() {
        if (!this.config.page_url.includes(this.config.domain) && !this.config.domain.includes(this.config.page_url)) {
            console.log("Página fora do domínio de origem", this.config.domain);
            return false;
        }

        return true;
    }

    uuid() {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            // Se o navegador suportar crypto.randomUUID(), use-a para gerar o UUID
            return crypto.randomUUID();
        } else {
            // Se não, use uma implementação alternativa para gerar um UUID pseudoaleatório
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    }

    randomInt(min = 1000000000, max = 9999999999) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async hash_value(value) {
        if (!value || !value.length) {
            return null;
        }

        // Verifica se o navegador suporta a API de Criptografia Web
        if (crypto && crypto.subtle) {
            // Converte a string para ArrayBuffer
            const encoder = new TextEncoder();
            const data = encoder.encode(value);

            // Calcula o hash usando o algoritmo SHA-256
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);

            // Converte o ArrayBuffer para uma string hexadecimal
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

            return hashHex;
        } else {
            if (!sha256) {
                await this.load_script('https://cdn.jsdelivr.net/npm/js-sha256/src/sha256.min.js');
            }

            return sha256(value);
        }
    }

    check_is_visible(element) {
        // Verifica se o elemento está oculto por causa do estilo
        if (element.style?.display === 'none') {
            return false;
        }

        // Verifica se o elemento está oculto por causa de um pai
        let parent = element.parentNode;
        while (parent) {
            if (parent.style?.display === 'none') {
                return false;
            }
            parent = parent.parentNode;
        }

        // O elemento está visível
        return true;
    }

    parameters_load(lead_info = false) {
        const urlParams = new URLSearchParams(window.location.search);

        if (this.config.lead_id && !urlParams.has('external_id')) {
            urlParams.append('external_id', this.config.lead_id)
        }

        if (lead_info) {
            if (this.config.lead_name && !urlParams.has('name')) {
                urlParams.append('name', this.config.lead_name)
            }

            if (this.config.lead_email && !urlParams.has('email')) {
                urlParams.append('email', this.config.lead_email)
            }

            if (this.config.lead_phone && !urlParams.has('phone')) {
                urlParams.append('phone', this.config.lead_phone)
            }

            if (this.config.geolocation?.tkz_lead_ip && !urlParams.has('ip')) {
                urlParams.append('ip', this.config.geolocation?.tkz_lead_ip)
            }
        }

        // Facebook
        if (this.config.fb_fbc && !urlParams.has('fbclid')) {
            urlParams.append('fbclid', this.config.fb_fbc)
        }

        if (this.config.fb_fbp && !urlParams.has('fbp')) {
            urlParams.append('fbp', this.config.fb_fbp)
        }

        // UTMs
        if (this.config.utm_source && !urlParams.has('utm_source')) {
            urlParams.append('utm_source', this.config.utm_source)
        }

        if (this.config.utm_medium && !urlParams.has('utm_medium')) {
            urlParams.append('utm_medium', this.config.utm_medium)
        }

        if (this.config.utm_campaign && !urlParams.has('utm_campaign')) {
            urlParams.append('utm_campaign', this.config.utm_campaign)
        }

        if (this.config.utm_content && !urlParams.has('utm_content')) {
            urlParams.append('utm_content', this.config.utm_content)
        }

        if (this.config.utm_term && !urlParams.has('utm_term')) {
            urlParams.append('utm_term', this.config.utm_term)
        }

        // SRC e SCK
        if (this.config.src && !urlParams.has('src')) {
            urlParams.append('src', this.config.src)
        }

        if (!urlParams.has('sck')) {
            urlParams.append('sck', this.config.sck || this.config.lead_id)
        }

        const aTags = document.querySelectorAll('a[href^="http"]');

        aTags.forEach(link => {
            if (!link.href.includes("#") && !link.href.includes(window.location.origin)) {
                link.href += link.href.includes('?') ? `&${urlParams.toString()}` : `?${urlParams.toString()}`
            }
        });
    }
}
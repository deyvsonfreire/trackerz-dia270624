export class Geo {
    constructor(config) {
        this.config = config;
    }

    async get_ip() {
        try {
            const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
            const data = await response.text();
            const lines = data.split('\n');

            for (const line of lines) {
                const parts = line.split('=');
                if (parts[0] === 'ip') {
                    return parts[1];
                }
            }

            return null;
        } catch (error) {
            console.error('Erro ao obter o IP:', error);
            return null;
        }
    }

    async get_geolocation() {
        const ip = this.get('tkz_lead_ip') || await this.get_ip();
        let key_ip = 'tkz_geo_location';

        if (ip) {
            key_ip = 'tkz_geo_location_' + ip.replaceAll('.', '_').replaceAll(':', '_');
        }

        const geolocation = localStorage.getItem(key_ip);

        // Check localStorage first for cached data
        if (geolocation) {
            return JSON.parse(geolocation);
        }

        let response, values;

        try {
            if (ip) {
                response = await fetch('https://pro.ip-api.com/json/' + ip + '?key=TOLoWxdNIA0zIZm');
            } else {
                response = await fetch('https://pro.ip-api.com/json/?key=TOLoWxdNIA0zIZm');
            }

            if (response.ok) {
                response = await response.json();

                values = {
                    tkz_lead_ip: response?.query,
                    tkz_lead_city: response?.city?.toLowerCase(),
                    tkz_lead_region: response?.regionName?.toLowerCase(),
                    tkz_lead_region_code: response?.region?.toLowerCase(),
                    tkz_lead_country: response?.country?.toLowerCase(),
                    tkz_lead_country_code: response?.countryCode?.toLowerCase(),
                    tkz_lead_currency: response?.currency,
                    tkz_lead_zipcode: response?.zip,
                };
            } else {
                if (ip) {
                    response = await fetch('https://ipapi.co/json/' + ip);
                } else {
                    response = await fetch('https://ipapi.co/json/');
                }

                if (response.ok) {
                    response = await response.json();

                    values = {
                        tkz_lead_ip: response?.ip,
                        tkz_lead_city: response?.city?.toLowerCase(),
                        tkz_lead_region: response?.region?.toLowerCase(),
                        tkz_lead_region_code: response?.region_code?.toLowerCase(),
                        tkz_lead_country: response?.country_name?.toLowerCase(),
                        tkz_lead_country_code: response?.country_code?.toLowerCase(),
                        tkz_lead_currency: response?.currency,
                        tkz_lead_zipcode: response?.postal,
                    };
                } else {
                    if (ip) {
                        response = await fetch('https://json.geoiplookup.io/' + ip);
                    } else {
                        response = await fetch('https://json.geoiplookup.io/');
                    }

                    if (response.ok) {
                        response = await response.json();

                        values = {
                            tkz_lead_ip: response?.ip,
                            tkz_lead_city: response?.city?.toLowerCase(),
                            tkz_lead_region: response?.region?.toLowerCase(),
                            // tkz_lead_region_code: response?.region_code?.toLowerCase(),
                            tkz_lead_country: response?.country_name?.toLowerCase(),
                            tkz_lead_country_code: response?.country_code?.toLowerCase(),
                            tkz_lead_currency: response?.currency_code,
                            tkz_lead_zipcode: response?.postal_code,
                        };
                    }
                }
            }

            this.set(this.remove_accents(values));
            localStorage.setItem(key_ip, JSON.stringify(values));

            return values;
        } catch (error) {
            console.error('Erro ao obter a geolocalização:', error);
            return null;
        }
    }

    remove_accents(object) {
        const newObject = {};

        for (const key in object) {
            const value = object[key];
            const newKey = key?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            if (typeof value === 'object') {
                newObject[newKey] = this.remove_accents(value);
            } else {
                newObject[newKey] = value?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            }
        }

        return newObject;
    }

    get(key) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [cookieKey, cookieValue] = cookie.trim().split('=');
            if (cookieKey === key) {
                return cookieValue;
            }
        }

        const localStorageValue = localStorage.getItem(key);
        return localStorageValue;
    }

    set(cookies) {
        const domain = this.get('tkz_domain');
        const expirationTime = 15552000 * 1000;
        const expires = new Date(Date.now() + expirationTime).toUTCString();

        // Set Cookies
        for (let key in cookies) {
            const value = cookies[key];
            if (value && value !== 'undefined') {
                document.cookie = `${key}=${value}; SameSite=None; Secure; expires=${expires}; path=/; domain=.${domain}`;
                localStorage.setItem(key, value);
            }
        }
    }
}
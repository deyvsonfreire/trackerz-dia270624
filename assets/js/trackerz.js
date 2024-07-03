import * as Geo from './modules/geo.js';
import * as Forms from './modules/forms.js';
import * as Facebook from './modules/facebook.js';
import * as Utils from './modules/utils.js';

class Trackerz {
    constructor(config) {
        this.config = config;
        this.geo = new Geo.Geo(config);
        this.forms = new Forms.Forms(config);
        this.facebook = new Facebook.Facebook(config);
        this.utils = new Utils.Utils(config);
        this.data = {};
    }

    async init() {
        try {
            // Variáveis do Sistema
            this.data.domain = this.config.domain;
            this.data.page_url = window.location.href;
            this.utils.set({ tkz_domain: this.data.domain });

            if (!this.utils.check_domain()) {
                return;
            }

            // Variáveis da Página
            this.data.page_title = document.title;
            this.data.traffic_source = document.referrer;
            this.data.utm_source = this.utils.search_params_url_cookie('utm_source');
            this.data.utm_medium = this.utils.search_params_url_cookie('utm_medium');
            this.data.utm_campaign = this.utils.search_params_url_cookie('utm_campaign');
            this.data.utm_id = this.utils.search_params_url_cookie('utm_id');
            this.data.utm_term = this.utils.search_params_url_cookie('utm_term');
            this.data.utm_content = this.utils.search_params_url_cookie('utm_content');
            this.data.src = this.utils.search_params_url_cookie('src');
            this.data.sck = this.utils.search_params_url_cookie('sck');

            // Variáveis do Evento
            const tkz_day_of_week = new Date().getDay();
            const tkz_month = new Date().getMonth();
            const tkz_hour_start = new Date().getHours();
            this.data.event_day_in_month = new Date().getDate();
            this.data.event_day = this.utils.WEEK_DAYS[tkz_day_of_week];
            this.data.event_month = this.utils.MONTHS[tkz_month];
            this.data.event_time_interval = `${tkz_hour_start}-${tkz_hour_start + 1}`;

            // Variáveis do Lead
            this.data.lead_id = this.utils.get('tkz_lead_id');
            this.data.lead_name = this.utils.search_params_url_cookie('full_name', 'lead_name') || this.utils.get('tkz_lead_name');
            this.data.lead_fname = this.utils.search_params_url_cookie('fname', 'first-name', 'first_name', 'first name') || this.utils.get('tkz_lead_fname');
            this.data.lead_lname = this.utils.search_params_url_cookie('lname', 'last-name', 'last_name', 'last name') || this.utils.get('tkz_lead_lname');
            this.data.lead_email = this.utils.search_params_url_cookie('email', 'lead_email') || this.utils.get('tkz_lead_email');
            this.data.lead_phone = this.utils.search_params_url_cookie('phone', 'tel', 'whatsapp', 'ph', 'fone', 'lead_phone') || this.utils.get('tkz_lead_phone');

            // Geo Location
            this.data.geolocation = await this.geo.get_geolocation();
            this.data.user_agent = navigator.userAgent;

            // Variáveis do Facebook
            this.data.fb_fbc = this.utils.search_params_url_cookie('_fbc', 'fbclid');
            this.data.fb_fbp = this.utils.search_params_url_cookie('_fbp', 'fbp')
                || 'fb.1.' + this.utils.getTimestampUtc() + '.' + this.utils.randomInt(1000000000, 9999999999);

            // Send and Set Lead Data
            await this.send_lead_data();

            // Monitor Submit Forms
            const monitorFormsAndMaskLoad = async () => {
                this.forms.monitor_forms();
                await this.forms.mask_load();
                await this.forms.mask_load_inter();
            };

            // Monitor Submit Forms e carregar máscara inicialmente
            await monitorFormsAndMaskLoad();

            // Monitorar eventos de abertura de popup do Elementor
            await this.elementor_function(monitorFormsAndMaskLoad)

            // Monitorar cliques em links de ação do Elementor
            document.querySelectorAll('a[href*="elementor-action"]').forEach((el) => {
                el.addEventListener('click', async () => {
                    setTimeout(async () => {
                        await monitorFormsAndMaskLoad();
                    });
                });
            });

            // Load
            await this.facebook.facebook_load_pixel();
        } catch (error) {
            console.error('Erro na inicialização do Trackerz:', error);
        }
    }

    async elementor_function(functionRun) {
        // Verifica se a função interna é uma função
        if (typeof functionRun === 'function') {
            if (window.jQuery) {
                setTimeout(() => {
                    jQuery(document).on('elementor/popup/show', async () => {
                        await functionRun();
                    });
                }, 500);
            }

            document.addEventListener('elementor/popup/show', async () => {
                await functionRun();
            });
        }
    }

    getDataLayer() {
        const dataLayer = {
            // Dados do Lead
            'lead_id': this.utils.get('tkz_lead_id'),
            'lead_name': this.utils.get('tkz_lead_name'),
            'lead_fname': this.utils.get('tkz_lead_fname'),
            'lead_lname': this.utils.get('tkz_lead_lname'),
            'lead_email': this.utils.get('tkz_lead_email'),
            'lead_phone': this.utils.get('tkz_lead_phone'),

            // Geolocalização
            'ip': this.geo.get('tkz_lead_ip'),
            'city': this.geo.get('tkz_lead_city'),
            'region': this.geo.get('tkz_lead_region'),
            'country_name': this.geo.get('tkz_lead_country'),
            'country_code': this.geo.get('tkz_lead_country_code'),
            'zipcode': this.geo.get('tkz_lead_zipcode'),
            'currency': this.geo.get('tkz_lead_currency'),

            // Facebook
            'fb_fbc': this.utils.get('_fbc'),
            'fb_fbp': this.utils.get('_fbp'),

            // ... outras variáveis relevantes
        };

        return dataLayer;
    }

    /**
     * Methods
     */
    async send_event(data) {
        if (!this.utils.check_domain() || !data?.event_name) {
            return;
        }

        data = {
            ...data,
            event_id: data?.event_id || this.utils.uuid(),
        }

        await this.facebook.facebook_send_event(data);
    }

    async send_lead_data() {
        try {
            const response = await fetch(this.config.api_lead, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    // Info
                    lead_id: this.data.lead_id,
                    lead_name: this.data.lead_name,
                    lead_fname: this.data.lead_fname,
                    lead_lname: this.data.lead_lname,
                    lead_email: this.data.lead_email,
                    lead_phone: this.data.lead_phone,

                    // Geolocation
                    ip: this.data.geolocation?.tkz_lead_ip,
                    device: this.data.user_agent,
                    adress_city: this.data.geolocation?.tkz_lead_city,
                    adress_state: this.data.geolocation?.tkz_lead_region,
                    adress_zipcode: this.data.geolocation?.tkz_lead_zipcode,
                    adress_country_name: this.data.geolocation?.tkz_lead_country,
                    adress_country: this.data.geolocation?.tkz_lead_country_code,

                    // Facebook
                    fbc: this.data.fb_fbc,
                    fbp: this.data.fb_fbp,
                })
            });

            if (response.ok) {
                const leadData = await response.json();
                this.updateLeadData(leadData.data);
                this.utils.set({
                    tkz_lead_id: this.data.lead_id,
                    tkz_lead_name: this.data.lead_name,
                    tkz_lead_fname: this.data.lead_fname,
                    tkz_lead_lname: this.data.lead_lname,
                    tkz_lead_email: this.data.lead_email,
                    tkz_lead_phone: this.data.lead_phone,
                    _fbc: this.data.fb_fbc,
                    _fbp: this.data.fb_fbp,
                });
                return leadData;
            } else {
                console.error('Erro ao enviar dados do lead:', response.status);
                return {};
            }
        } catch (error) {
            console.error('Erro na requisição AJAX:', error);
            return {};
        }
    }

    updateLeadData(leadData) {
        this.data.lead_id = leadData.id || this.data.lead_id;
        this.data.lead_name = leadData?.name || this.data.lead_name;
        this.data.lead_fname = leadData?.fname || this.data.lead_fname;
        this.data.lead_lname = leadData?.lname || this.data.lead_lname;
        this.data.lead_email = leadData?.email || this.data.lead_email;
        this.data.lead_phone = leadData?.phone || this.data.lead_phone;

        this.data.geolocation.tkz_lead_ip = leadData?.ip || this.data.geolocation?.tkz_lead_ip;
        this.data.geolocation.tkz_lead_city = leadData?.adress_city || this.data.geolocation?.tkz_lead_city;
        this.data.geolocation.tkz_lead_region = leadData?.adress_state || this.data.geolocation?.tkz_lead_region;
        this.data.geolocation.tkz_lead_zipcode = leadData?.adress_zipcode || this.data.geolocation?.tkz_lead_zipcode;
        this.data.geolocation.tkz_lead_country = leadData?.adress_country_name || this.data.geolocation?.tkz_lead_country;
        this.data.geolocation.tkz_lead_country_code = leadData?.adress_country || this.data.geolocation?.tkz_lead_country_code;

        this.data.fb_fbc = leadData?.fbc || this.data.fb_fbc;
        this.data.fb_fbp = leadData?.fbp || this.data.fb_fbp;
    }
}

// Inicia o Trackerz após o carregamento da página
window.addEventListener('load', () => {
    const trackerz = new Trackerz(tkz_config); // Passar as configurações
    trackerz.init();
});
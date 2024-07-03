export class Facebook {
    constructor(config) {
        this.config = config;
    }

    async facebook_send_event(data) {
        if (!this.config.fb_pixel) {
            return;
        }

        let content_ids = data?.content_ids || null;

        if (typeof content_ids === 'string') {
            content_ids = content_ids.split(',');
        }

        const fb_data = {
            event_id: data?.event_id,
            event_time: this.getTimestampUtc(),
            event_name: data?.event_name,
            content_ids: content_ids,
            product_id: data?.product_id,
            product_name: data?.product_name,
            content_name: data?.content_name || data?.product_name,
            value: data?.product_value,
            currency: data?.currency,
            page_title: this.config?.page_title,
            page_id: this.config?.page_id,
        };

        if (this.config.web_priority) {
            await this.facebook_web(fb_data);
            this.facebook_api(fb_data);
        } else {
            this.facebook_api(fb_data);
            await this.facebook_web(fb_data);
        }
    }

    async facebook_load_pixel() {
        if (typeof fbq === 'undefined') {
            ! function(f, b, e, v, n, t, s) {
				if (f.fbq) return;
				n = f.fbq = function() {
					n.callMethod ?
						n.callMethod.apply(n, arguments) : n.queue.push(arguments)
				};
				if (!f._fbq) f._fbq = n;
				n.push = n;
				n.loaded = !0;
				n.version = '2.0';
				n.queue = [];
				t = b.createElement(e);
				t.async = !0;
				t.src = v;
				s = b.getElementsByTagName(e)[0];
				s.parentNode.insertBefore(t, s)
			}(window, document, 'script', this.data.fb_js);

            let pixels = this.config.fb_pixel.split(',');

            for (let pixel of pixels) {
                fbq('init', pixel);
            }
        }
    }

    async facebook_web(data) {
        await this.facebook_load_pixel();

        let type = data?.event_custom == true ? 'trackCustom' : 'track';
        let event_name = data?.event_name || "PageView";
        let event_id = data?.event_id || this.config?.event_id;

        const params = {
            // Lead
            external_id: this.config?.lead_id,
            nm: await this.hash_value(this.config?.lead_name),
            fn: await this.hash_value(this.config?.lead_fname || this.config?.lead_name),
            ln: await this.hash_value(this.config?.lead_lname),
            em: await this.hash_value(this.config?.lead_email),
            ph: await this.hash_value(this.config?.lead_phone),

            // FBC e FBP
            fbc: this.config.fbc,
            fbp: this.config.fbp,

            // Product
            currency: data?.currency || this.config.geolocation?.tkz_lead_currency,
            content_type: 'product',
            content_ids: data?.content_ids,
            product_id: data?.product_id,
            product_name: data?.product_name,
            content_name: data?.content_name,
            value: data?.value,

            // Geolocation
            client_user_agent: this.config.user_agent,
            client_ip_address: this.config.geolocation?.tkz_lead_ip,
            ct: await this.hash_value(this.config.geolocation?.tkz_lead_city),
            st: await this.hash_value(this.config.geolocation?.tkz_lead_region),
            zp: await this.hash_value(this.config.geolocation?.tkz_lead_zipcode),
            country: await this.hash_value(this.config.geolocation?.tkz_lead_country_code),

            // Event
            event_time: data?.event_time,
            event_day: this.config.event_day,
            event_day_in_month: this.config.event_day_in_month,
            event_month: this.config.event_month,
            event_time_interval: this.config.event_time_interval,
            event_url: this.config.page_url,
            event_source_url: this.config.page_url,
            traffic_source: this.config.traffic_source,

            // Page
            page_id: this.config?.page_id,
            page_title: this.config?.page_title,

            // App
            plugin: 'Trackerz',
            plugin_info: 'https://trackerz.app',
        };

        fbq(type, event_name, params, {
            eventID: event_id,
        });
    }

    facebook_api(data) {
        fetch(this.config.api_event, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...this.config,
                ...data
            })
        });
    }

    getTimestampUtc() {
        var date = new Date();
        var utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
        return Math.floor(utc / 1000);
    }

    async hash_value(value) {
        if (!value || !value.length) {
            return null;
        }

        if (crypto && crypto.subtle) {
            const encoder = new TextEncoder();
            const data = encoder.encode(value);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        } else {
            if (!sha256) {
                await this.load_script('https://cdn.jsdelivr.net/npm/js-sha256/src/sha256.min.js');
            }
            return sha256(value);
        }
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
}
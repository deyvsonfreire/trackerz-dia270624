export class Forms {
    constructor(config) {
        this.config = config;
    }

    // Verifica o Nome do Campo
    input_has_phone(name) {
        const names = [
            'tel',
            'phone',
            'ph',
            'cel',
            'mobile',
            'fone',
            'whats',
        ];
        const variables = names.concat(
            this.config?.input_custom_phone?.split(',')
        );
        let result = false;

        for (const variable of variables) {
            if (variable && name.includes(variable)) {
                result = true;
                break;
            }
        }

        return result;
    }

    input_has_mail(name) {
        const names = [
            'mail',
            'email',
        ];
        const variables = names.concat(
            this.config?.input_custom_email?.split(',')
        );
        let result = false;

        for (const variable of variables) {
            if (variable && name.includes(variable)) {
                result = true;
                break;
            }
        }

        return result;
    }

    input_has_name(name) {
        const names = [
            'nome',
            'name'
        ];
        const variables = names.concat(
            this.config?.input_custom_name?.split(',')
        );
        let result = false;

        for (const variable of variables) {
            if (variable && name.includes(variable)) {
                result = true;
                break;
            }
        }

        return result;
    }

    check_values(form) {
        let checked = true;

        // Obtém todos os campos do formulário
        const fields = form.querySelectorAll('[name]');

        // Percorre cada campo
        for (const field of fields) {
            const fieldName = field.name.toLowerCase(); // Converte o nome do campo para minúsculo

            // Verifica se o nome do campo está na lista de campos obrigatórios
            if (
                this.input_has_phone(fieldName) ||
                this.input_has_mail(fieldName) ||
                this.input_has_name(fieldName)
            ) {
                // Verifica se o campo possui valor
                if (!field.value.trim()) {
                    checked = false; // Se o campo não tiver valor, define checked como false
                    break; // Sai do loop se encontrar um campo vazio
                }
            }
        }

        return checked;
    }

    async mask_load() {
        // Verifique se as configurações estão presentes
        if (!this.config?.phone_mask || !this.config.phone_mask_js) {
            return;
        }

        if (typeof IMask === 'undefined') {
            await this.load_script(this.config.phone_mask_js)
        }

        await this.mask();
    }

    async mask() {
        // Selecione elementos que precisam da máscara
        const elements = document.querySelectorAll(".tkz_mask_phone, #tkz_mask_phone");

        // Aplique a máscara nos elementos encontrados
        elements.forEach((el) => {
            if (el.tagName === "INPUT" && this.input_has_phone(el.name)) {
                el.type = "text";
                el.removeAttribute('pattern');

                IMask(el, {
                    mask: this.config?.phone_mask,
                });
            } else {
                // Encontre campos de input descendentes
                const inputs = el.querySelectorAll("input");
                inputs.forEach((subel) => {
                    if (this.input_has_phone(subel.name)) {
                        subel.type = "text";
                        el.pattern = "";
                        IMask(subel, {
                            mask: this.config?.phone_mask,
                        });
                    }
                });
            }
        });
    }

    async mask_load_inter() {
        // Verifique se as configurações estão presentes
        if (!this.config?.phone_mask_inter) {
            return;
        }

        if (typeof intlTelInput == 'undefined') {
            await this.load_style(this.config.phone_mask_inter_css || 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/21.0.5/css/intlTelInput.css');
            await this.add_style(`
                .iti, .iti--allow-dropdown{
                    width: 100% !important;
                    z-index: 9999 !important;
                }
            `);
            await this.load_script(this.config.phone_mask_inter_js || 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/21.0.5/js/intlTelInput.min.js');
        }

        await this.mask_inter();
    }

    async mask_inter() {
        // Selecione elementos que precisam da máscara
        const elements = document.querySelectorAll(".tkz_mask_phone_inter, #tkz_mask_phone_inter");

        const intlTel = (el) => {
            el.type = "tel";
            el.removeAttribute('pattern');
            el.classList.add("tkz_mask_phone_inter_active");

            let input_phone = window.intlTelInput(el, {
                utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/21.0.5/js/utils.min.js",
                initialCountry: this.config.geolocation?.tkz_lead_country_code || "br",
                placeholderNumberType: 'MOBILE',
                showSelectedDialCode: true
            });

            el.addEventListener('blur', async () => {
                var full_number = input_phone.getNumber(intlTelInputUtils.numberFormat.E164);
                this.config.lead_phone = full_number;
                this.set({ tkz_lead_phone: full_number });
                await this.send_lead_data();
            });

            el.closest('form').addEventListener('submit', () => {
                var full_number = input_phone.getNumber(intlTelInputUtils.numberFormat.E164);
                el.value = full_number;
            });
        }

        // Aplique a máscara nos elementos encontrados
        elements.forEach((el) => {
            if (el.tagName === "INPUT" && this.input_has_phone(el.name)) {
                intlTel(el);
            } else {
                // Encontre campos de input descendentes
                const inputs = el.querySelectorAll("input");
                inputs.forEach((subel) => {
                    if (this.input_has_phone(subel.name)) {
                        intlTel(subel);
                    }
                });
            }
        });
    }

    monitor_forms() {
        // Seleciona todos os campos do formulário
        document.querySelectorAll('input').forEach(field => {
            this.input_monitor(field.name || field.id);

            // Email
            if (this.config?.lead_email && this.input_has_mail(field.name)) {
                field.value = this.config?.lead_email;
            }

            // Name
            if (
                this.input_has_name(field.name)
                && (this.config?.lead_name || this.config?.lead_fname || this.config?.lead_lname)
            ) {
                if (field.name.includes('first')) { // First
                    field.value = this.config?.lead_fname || this.config?.lead_name;
                } else if (field.name.includes('last')) { // Last
                    field.value = this.config?.lead_lname;
                } else if (!field.name.includes('last')) { // Full
                    field.value = this.config?.lead_name || this.config?.lead_fname;
                }
            }

            // Phone
            if (this.config?.lead_phone) {
                if (
                    this.input_has_phone(field.name)
                    && !field.name.includes('ddi')
                    && !field.name.includes('ddd')
                ) {
                    field.value = this.config?.lead_phone;
                }
            }
        });
    }

    async input_monitor(name) {
        const formFields = document.querySelectorAll(`[name*="${name}"]`);
        formFields.forEach((field) => {
            field.addEventListener('input', async (event) => {
                await this.input_save(event.target.name, event.target.value);
            });
            field.addEventListener('blur', async (event) => {
                if (!event.target.classList.contains("tkz_mask_phone_inter_active")) {
                    await this.input_save(event.target.name, event.target.value, field);
                    await this.send_lead_data();
                }
            });
        });
    }

    async input_save(name, value, field = undefined) {
        // Email
        if (this.input_has_mail(name)) {
            this.set({ tkz_lead_email: value });
            this.config.lead_email = value;
        }

        // Phone
        if (
            this.input_has_phone(name)
            && !name.includes('ddi')
            && !name.includes('ddd')
        ) {
            if (this.config?.phone_valid) {
                value = this.phone_valid(value, this.config?.phone_country);

                if (field && this.config?.phone_update) {
                    field.value = value;
                }
            }

            this.set({ tkz_lead_phone: value });
            this.config.lead_phone = value;
        }

        // Name
        if (this.input_has_name(name)) {
            let full_name = this.config.lead_name,
                fname = this.config.lead_fname,
                lname = this.config.lead_lname;

            if (name.includes('first')) {
                fname = value.substring(0, value.indexOf(' '));
                lname = value.substring(value.indexOf(' ') + 1);
                full_name = [fname, lname].join(' ')
            } else if (name.includes('last')) {
                lname = value;
                full_name = [fname, lname].join(' ')
            } else if (!name.includes('last')) {
                full_name = value;
                fname = value.substring(0, value.indexOf(' '));
                lname = value.substring(value.indexOf(' ') + 1) || this.config.lead_lname;
            }

            this.set({
                tkz_lead_name: full_name,
                tkz_lead_fname: fname,
                tkz_lead_lname: lname,
            });

            this.config.lead_name = full_name;
            this.config.lead_fname = fname;
            this.config.lead_lname = lname;
        }
    }

    phone_valid(phone, country = '55') {
        // Limpa todos os caracteres que não são números
        phone = phone.replace(/[^0-9]/g, '');

        if (country === '55') {
            // Remove todos os 0 do começo do telefone, se houver
            if (phone.startsWith('00')) {
                phone = phone.substring(2);
            } else if (phone.startsWith('0')) {
                phone = phone.substring(1);
            }

            // Valida se o telefone tem 10 dígitos
            if (phone.length === 10) {
                // Adiciona o nono dígito no telefone, após o DDD, 2 números iniciais do telefone
                phone = `55${phone.substring(0, 2)}9${phone.substring(2)}`;
            }

            // Valida se o telefone tem 12 dígitos e começa com 55
            else if (phone.length === 12 && phone.startsWith('55')) {
                // Insere o nono dígito do telefone, após o DDI e DDD, os 4 números iniciais
                phone = `55${phone.substring(0, 4)}9${phone.substring(4)}`;
            }
        }

        // Verifica se o país já está incluído no início do telefone
        if (!phone.startsWith(country)) {
            phone = `${country}${phone}`;
        }

        return `+${phone}`;
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

    async load_style(url) {
        return new Promise((resolve, reject) => {
            let tag = document.createElement('link');
            tag.href = url;
            tag.rel = 'stylesheet';
            tag.type = 'text/css';
            tag.onload = resolve;
            tag.onerror = reject;
            document.head.appendChild(tag);
        });
    }

    async add_style(content) {
        return new Promise((resolve, reject) => {
            const tag = document.createElement('style');
            tag.textContent = content;
            tag.onload = resolve;
            tag.onerror = reject;
            document.head.appendChild(tag);
        });
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
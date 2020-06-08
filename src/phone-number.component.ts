import {
    Component,
    ElementRef,
    forwardRef,
    HostListener,
    Input,
    OnInit,
    Output,
    EventEmitter,
    ViewChild
} from '@angular/core';
import {
    ControlValueAccessor,
    FormControl,
    Validator,
    ValidationErrors,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR
} from '@angular/forms';
import * as glibphone from 'google-libphonenumber';
import { Country } from './country.model';
import { CountryService } from './country.service';

const PLUS = '+';

const COUNTER_CONTROL_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PhoneNumberComponent),
    multi: true
};

const VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => PhoneNumberComponent),
    multi: true
};

@Component({
    selector: 'international-phone-number2',
    templateUrl: './phone-number.component.html',
    styleUrls: ['./phone-number.component.scss', './assets/css/flags.min.css'],
    host: {
        '(document:click)': 'hideDropdown($event)'
    },
    providers: [COUNTER_CONTROL_ACCESSOR, VALIDATOR]
})
export class PhoneNumberComponent
    implements OnInit, ControlValueAccessor, Validator {
    // input
    @Input() placeholder = 'Enter phone number'; // default
    @Input() maxlength = 12; // default

    @Input() defaultCountry: string;
    @Input() required: boolean = false;
    @Input() allowDropdown = true;
    @Input() type = 'text';

    @Input() allowedCountries: Country[];

    // only doing masking for US and Canadian numbers. Other countries can have different patterns, Finland even allows numbers from 5 to 12 digits. Rely on Google-libphonenumber
    // masking = [/\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];

    // optionally format output model with a space between country code and phone number
    @Input() countryCodeSpace: boolean = true;
    
    // optionally suppress the +1 for US phones
    @Input() noUSCountryCode: boolean = false;

    // Set true if you want the model touched upon any change, rather than just when valid or blurred.
    @Input() autoTouch: boolean = false;
    
    @Output() onCountryCodeChanged: EventEmitter<any> = new EventEmitter();

    // ELEMENT REF
    phoneComponent: ElementRef;

    // CONTROL VALUE ACCESSOR FUNCTIONS
    onTouch: Function;
    onModelChange: Function;

    countries: Country[];
    selectedCountry: Country;
    countryFilter: string;
    showDropdown = false;
    phoneNumber = '';
    phoneNumberOnly = ''; //separating the phone from the country dial code
    hasAreaCodeParenthesis = false; // try to format output as before
    hasDashes = false; // try to format output as before

    value = '';

    // the country's dial code displayed as read-only
    dialCode;

    @ViewChild('phoneNumberInput') phoneNumberInput: ElementRef;

    /**
     * Util function to check if given text starts with plus sign
     * @param text
     */
    private static startsWithPlus(text: string): boolean {
        return text.startsWith(PLUS);
    }

    /**
     * Reduced the prefixes
     * @param foundPrefixes
     */
    private static reducePrefixes(foundPrefixes: Country[]) {
        const reducedPrefixes = foundPrefixes.reduce((first: Country, second: Country) =>
            first.dialCode.length > second.dialCode.length ? first : second
        );
        return reducedPrefixes;
    }

    constructor(
        private countryService: CountryService,
        phoneComponent: ElementRef
    ) {
        this.phoneComponent = phoneComponent;
    }

    ngOnInit(): void {
        if (this.allowedCountries && this.allowedCountries.length) {
            this.countries = this.countryService.getCountriesByISO(this.allowedCountries);
        } else {
            this.countries = this.countryService.getCountries();
        }
        this.orderCountriesByName();
        if(this.defaultCountry)
            this.setDefault();
        if(!this.selectedCountry)
            this.findPrefix(this.defaultCountry);
    }

    /**
     * Return true if not US or Canada. Eliminates masking and relies solely on Google-libphonenumber for validation
     */
    isForeign(){
        return this.selectedCountry;
    }

    /**
     * Moves default country to top of the list to avoid having to scroll
     */
    setDefault(){
        let temp;
        this.countries.forEach((country) =>{
            if(country.countryCode == this.defaultCountry){
                temp = country;
            }
        });
        // a puzzling yet pleasant side-effect of this change is Canadian numbers with +1 now showing as Canadian and not US
        this.countries = this.countries.filter(item => item !== temp);
        this.countries.unshift(temp);
    }

    /**
     * Opens the country selection dropdown
     */
    displayDropDown() {
        if (this.allowDropdown) {
            this.showDropdown = !this.showDropdown;
            this.countryFilter = '';
        }
    }

    /**
     * Hides the country selection dropdown
     * @param event
     */
    hideDropdown(event: Event) {
        if (!this.phoneComponent.nativeElement.contains(event.target)) {
            this.showDropdown = false;
        }
    }

    /**
     * Sets the selected country code to given country
     * @param event
     * @param countryCode
     */
    updateSelectedCountry(event: Event, countryCode: string) {
        event.preventDefault();
        this.updatePhoneInput(countryCode);
        this.onCountryCodeChanged.emit(countryCode);
        this.updateValue();
        // focus on phone number input field
        setTimeout(() => this.phoneNumberInput.nativeElement.focus());
    }

    /**
     * Updates the phone number
     * @param event
     */
    updatePhoneNumber(event: Event) {
        if (PhoneNumberComponent.startsWithPlus((''+event))) {
            this.findPrefix((''+event).split(PLUS)[1]);
        } else {
            // this.selectedCountry = null; // why were they setting this to null?
        }

        this.updateValue();
    }

    /**
     * shows the dropdown with keyboard event
     * @param event
     */
    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (this.showDropdown) {
            this.countryFilter = `${this.countryFilter}${event.key}`;
        }
    }

    /**
     * @param prefix
     */
    private findPrefix(prefix: string) {
        let foundPrefixes: Country[] = this.countries.filter((country: Country) =>
            prefix.startsWith(country.dialCode)
        );
        if (foundPrefixes && foundPrefixes.length) {
            this.selectedCountry = PhoneNumberComponent.reducePrefixes(foundPrefixes);
        } else {
            this.selectedCountry = null;
        }
        var defaultCountryUS = {name: "United States", dialCode: "1", countryCode: "us"};
        if(this.selectedCountry)
            this.dialCode = this.selectedCountry.dialCode;
    }

    /**
     * Sort countries by name
     */
    private orderCountriesByName() {
        this.countries = this.countries.sort(function (a, b) {
            return a['name'] > b['name'] ? 1 : b['name'] > a['name'] ? -1 : 0;
        });
    }

    /**
     *
     * @param fn
     */
    registerOnTouched(fn: Function) {
        this.onTouch = fn;
    }

    /**
     *
     * @param fn
     */
    registerOnChange(fn: Function) {
        this.onModelChange = fn;
    }

    /**
     * Touch the model for validation when input is blurred. This allows for validation errors only after
     * user has entered a value and left the element, rather than as soon as typing begins
     */
    blur(){
        this.onTouch();
    }

    /**
     *
     * @param value
     */
    writeValue(value: string) {
        this.value = value || '';
        this.phoneNumber = this.value;

        if (PhoneNumberComponent.startsWithPlus(this.value)) {
            this.findPrefix(this.value.split(PLUS)[1]);
            if (this.selectedCountry) {
                this.updatePhoneInput(this.selectedCountry.countryCode);
            }
        }

        if (!this.phoneNumber && this.defaultCountry) {
            this.updatePhoneInput(this.defaultCountry);
        }
        this.getPhoneOnly();
    }

    // strips country dial code from phone for display
    getPhoneOnly(){
        // if country code, read the number after the country code and space
        if (PhoneNumberComponent.startsWithPlus(this.phoneNumber)){
            let space = this.phoneNumber.indexOf(' ');
            this.phoneNumberOnly = this.phoneNumber.substring(space, this.phoneNumber.length);
            this.phoneNumberOnly = this.phoneNumberOnly.replace(/\D/g, "");
        }
        // otherwise read the 10 digit domestic phone
        else {
            this.phoneNumberOnly = this.phoneNumber.replace(/\D/g, "");
            this.phoneNumberOnly = this.phoneNumberOnly.substring(this.phoneNumberOnly.length - 10, this.phoneNumberOnly.length);
        }
    }

    /**
     * Validation
     * @param c
     */
    validate(c: FormControl): ValidationErrors | null {
        let value = c.value;
        // let selectedDialCode = this.getSelectedCountryDialCode();
        var validationError = {
            phoneEmptyError: {
                valid: false // maintaining this to be backward compatible with prior versions
            },
            required: this.formattedPhone().replace(/\D/g, "").length < 1, // this is a more standard error flag
            pattern: false
        };

        // strip out stuff like (,),-
        let digits;
        if(value)
            digits = value.replace(/\D/g, "");
        if (this.formattedPhone().replace(/\D/g, "").length < 1) {
            if(this.required){
                validationError.phoneEmptyError.valid = true;
                validationError.required = true;
                return validationError;
            }
            return null;
        }

        if (value) {
            // validating number using the google's lib phone
            const phoneUtil = glibphone.PhoneNumberUtil.getInstance();
            try {
                // add country code to US to test validation, not for model update or display
                if(this.selectedCountry.countryCode=='us' && this.noUSCountryCode)
                    value = '+1 '+this.phoneNumberOnly;
                let phoneNumber = phoneUtil.parse(value);
                let isValidNumber = phoneUtil.isValidNumber(phoneNumber);
                // touch model if valid, to avoid setting untouched before finishing entering value and potentially impacting parent's error display
                if(isValidNumber)
                    this.onTouch();
                else
                    validationError.pattern = true;
                return isValidNumber ? null : validationError;
            } catch (ex) {
                validationError.pattern = true;
                return validationError;
            }
        }
        return null;
    }

    /**
     * Updates the value and trigger changes
     * Updates model to '+' + dialCode + phone. US phones are not prefixed.
     */
    private updateValue() {
        let temp;
        let dialCode;
        dialCode = '+'+this.dialCode;    
        if(this.countryCodeSpace)
            temp = dialCode+' '+this.formattedPhone();
        else
            temp = dialCode+this.formattedPhone();
        
        this.onModelChange(temp);
        if(this.autoTouch)
            this.onTouch();
    }

    formattedPhone(){
        let formatted;
        let temp = this.phoneNumberOnly.replace(/\D/g, "");        
        if(!this.selectedCountry || !this.isForeign())
            formatted = '(' + temp.substring(0, 3) + ') ' + temp.substring(3, 6) + '-' + temp.substring(6, temp.length);
        else
            formatted = temp;  
        return formatted; 
    }

    /**
     * Updates the country dial code
     * @param countryCode
     */
    private updatePhoneInput(countryCode: string) {
        this.showDropdown = false;

        this.selectedCountry = this.countries.find(
            (country: Country) => country.countryCode === countryCode
        );
        if (this.selectedCountry) {
            if(this.selectedCountry.countryCode != 'us' || !this.noUSCountryCode)
                this.dialCode = this.selectedCountry.dialCode;
            else
                this.dialCode = null; 
        }
    }

    /**
     * Returns the selected country's dialcode
     */
    public getSelectedCountryDialCode(): string {
        if (this.selectedCountry) { return PLUS + this.selectedCountry.dialCode; };
        return null;
    }
}

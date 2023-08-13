import croppie from 'croppie';
import action from '@cocreate/actions';

const CocreateCroppie = {

    debug: true,
    selector_element: '[editor="croppie"]',
    selector_croppie: '.croppie',
    croppieElements: [],
    croppieObjs: [],

    displayErrors: function (msg) {
        if (this.debug)
            console.error(msg)
    },

    init: function () {
        this.croppieElements = document.querySelectorAll(this.selector_element);
        for (let i = 0; i < this.croppieElements.length; i++) {
            this.initCroppie(this.croppieElements[i]);
        }
    },

    initCroppie: function (el) {
        let cropieInit = (el.tagName != 'IMG') ? el.querySelector(this.selector_croppie) : el;
        let fileInput = el.querySelector("input[type='file']");
        let objCroppie = {}

        if (!cropieInit) {
            this.displayErrors("No genero Croppie = " + cropieInit)
            return false
        }

        let resizer = new croppie(cropieInit, {
            boundary: { width: 300, height: 300 },
            viewport: { width: 200, height: 200 },
            showZoomer: true,
            // enableResize: true,
            enableOrientation: true,
            enableZoom: true,
            mouseWheelZoom: 'ctrl'
        });

        objCroppie = { 'croppie': el, 'resizer': resizer }

        el.getValue = async () => {
            let obj = this.croppieObjs.find((obj) => obj.croppie === elCroppie);
            let base64 = (elCroppie.tagName == 'IMG') ? await this.getCropResult(obj.resizer) : (obj.fileInput.files.length) ? await this.getCropResult(obj.resizer) : null
            return base64
        }

        if (fileInput) {
            objCroppie["fileInput"] = fileInput
            fileInput.addEventListener('change', function (e) {
                if (this.files.length == 0) return;
                let file = this.files[0];
                let reader = new FileReader();
                reader.onload = function (e) {
                    resizer.bind({
                        url: e.target.result
                    })
                };
                reader.readAsDataURL(file);
            })
        }

        this.croppieObjs.push(objCroppie);
    },

    save: async function (elCroppie) {
        elCroppie.save()
    },

    __croppieUploadImageAction: function (btn) {
        let croppie = btn.closest(this.selector_element);
        if (!croppie) {
            console.error("It needs to be inside an element " + this.selector_element + "")
            return false
        }
        let fileInput = croppie.querySelector("input[type='file']");
        if (!fileInput) {
            console.error("You need in input file inside " + this.selector_element + "")
            return false
        }
        fileInput.click();
        document.dispatchEvent(new CustomEvent('CroppieUploadImage', {
            detail: {}
        }))
    },

    __croppieSaveAction: function (btn) {

        let croppie = btn.closest(this.selector_element);
        let executeMultiple = false;
        if (!croppie) {
            //btn It is not within the parent tag
            executeMultiple = true
            let that = this;
            let form = btn.closest('form');
            let croppies = form.querySelectorAll(this.selector_element);
            croppies.forEach(function (croppie) {
                that.save(croppie);
            });
        }

        if (executeMultiple == false)
            this.save(croppie)

        document.dispatchEvent(new CustomEvent('CroppieSave', {
            detail: {}
        }))
    },

    readFile: function (file = {}, method = 'readAsText') {
        const reader = new FileReader()
        return new Promise((resolve, reject) => {
            reader[method](file)
            reader.onload = () => {
                resolve(reader)
            }
            reader.onerror = (error) => reject(error)
        })
    },

    getCropResult: function (resizer) {
        return new Promise((resolve, reject) => {
            resizer.result('base64').then(function (base64) {

                resolve(base64);

            }).onerror = (error) => reject(error);
        });
    }

}//end class CocreateCroppie

action.init({
    name: "CroppieUploadImage",
    endEvent: "CroppieUploadImage",
    callback: (data) => {
        CocreateCroppie.__croppieUploadImageAction(data.element);
    }
});


action.init({
    name: "CroppieSave",
    endEvent: "CroppieSave",
    callback: (data) => {
        CocreateCroppie.__croppieSaveAction(data.element);
    },
});

CocreateCroppie.init();

export default CocreateCroppie;
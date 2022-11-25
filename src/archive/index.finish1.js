import croppie from 'croppie';
import crud from '@cocreate/crud-client';
import action from '@cocreate/actions';

const CocreateCroppie = {
  
   debug : true,
   selector_element : '[editor="croppie"]',
   selector_croppie : '.croppie',
   croppieElements : [],
   croppieObjs : [],
    
    displayErrors : function(msg) {
      if (this.debug)
        console.error(msg)
    },
    
    init : function() {
        this.croppieElements = document.querySelectorAll(this.selector_element);
        for (let i=0; i < this.croppieElements.length; i++) {
          this.initCroppie(this.croppieElements[i]);
        }
    },
    
    initCroppie : function(el){
        let cropieInit = el.querySelector(this.selector_croppie);
        let fileInput = el.querySelector("input[type='file']");
        if (!cropieInit || !fileInput ){
          this.displayErrors("No genero Croppie = "+cropieInit+" FileInput = "+fileInput)
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
        
        fileInput.addEventListener('change', function(e) {
          if (this.files.length == 0) return;
          let file = this.files[0];
          let reader = new FileReader();
          reader.onload = function(e) {
            resizer.bind({
              url: e.target.result
            })
          };
          reader.readAsDataURL(file);
        })
  
        this.croppieObjs.push({'croppie':el,'resizer':resizer,'fileInput':fileInput});
    },
    
    saveCroppieCrud: async function(elCroppie) {
      let name = elCroppie.getAttribute('name');
      let data = elCroppie.dataset;
      
       if (typeof name === 'undefined' || name === '' || name ==null){
        console.error("you need add attr [name] ");
        return
      }
      
      if (typeof data["collection"] === 'undefined' || data["collection"] === ''){
        console.error("you need add attr [data-collection] ");
        return
      }
      
      let obj = this.croppieObjs.find((obj) => obj.croppie === elCroppie);
      let base64 = (obj.fileInput.files.length) ? await this.getCropResult(obj.resizer) : null
      if (base64){
        crud.createDocument({
           collection:data["collection"],
           document: {[name]:base64},
         });
      }else{
        console.error("it is Empty, not save croppie in crud")
      }
      
    },
    
  	__croppieUploadImageAction: function(btn) {
  	  let croppie = btn.closest(this.selector_element);
  	  if (!croppie ){
          console.error("It needs to be inside an element "+this.selector_element+"")
          return false
        }
      let fileInput = croppie.querySelector("input[type='file']");
      if (!fileInput ){
          console.error("You need in input file inside "+this.selector_element+"")
          return false
        }
      fileInput.click();
  	  document.dispatchEvent(new CustomEvent('CroppieUploadImage', {
  				detail: {}
  			}))
  	},
  	
    __croppieSaveAction: function(btn) {
      
      let croppie = btn.closest(this.selector_element);
      let executeMultiple = false;
  	  if (!croppie ){
  	    //btn It is not within the parent tag
  	    executeMultiple = true
  	    let that = this;
  	    let form = btn.closest('form');
  	    let croppies = form.querySelectorAll(this.selector_element);
  	    croppies.forEach(function(croppie) {
          that.saveCroppieCrud(croppie);
        });
  	  }
  	  
  	  if (executeMultiple == false)
  	    this.saveCroppieCrud(croppie)
  	 
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
  
  getCropResult : function(resizer) {
    return new Promise((resolve, reject) => {
      resizer.result('base64').then(function(base64) {
      
        resolve(base64);
        
      }).onerror = (error) => reject(error);
   });
  }
  
}//end class CocreateCroppie

CocreateCroppie.init();


action.init({
	name: "CroppieUploadImage",
	endEvent: "CroppieUploadImage",
	callback: (btn, data) => {
		CocreateCroppie.__croppieUploadImageAction(btn)
	},
})


action.init({
	name: "CroppieSave",
	endEvent: "CroppieSave",
	callback: (btn, data) => {
	  console.log("Log save")
		CocreateCroppie.__croppieSaveAction(btn)
	},
})

export default CocreateCroppie;
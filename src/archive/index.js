import observer from '@cocreate/observer';
import croppie from 'croppie';
import crud from '@cocreate/crud-client';
import form from '@cocreate/form';
import action from '@cocreate/actions';


// let awsOption = {
//   region: 'us-east-1',
//   accessKeyId: 'AKIAZKETJ5PSTFJ54J7O',
//   secretAccessKey: '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',
// }

// var s3 = new AWS.S3(awsOption);

// function uploadFile(file, name, callback) {
//   let params = {
//     Bucket: 'cocreate-test',
//     Key: name,
//     Body: file,
//     ACL: 'public-read-write'
//   }
  
//   s3.upload(params, function(error, data) {
//     callback(error, data);
//   })
// }

// function uploadImageData(data, name, callback) {
  
//   var file = dataURLtoFile(data, name);
  
//   let params = {
//     Bucket: 'cocreate-test',
//     Key: name,
//     Body: file,
//     ACL: 'public-read-write'
//   }
  
//   s3.upload(params, function(error, data) {
//     callback(error, data);
//   })
// }


function dataURLtoFile(dataurl, filename) {
 
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), 
    n = bstr.length, 
    u8arr = new Uint8Array(n);
      
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, {type:mime});
}

var imageUploaders = [];



function ImageUploder(el) {
  let eId = el.id;
  let croppie = el.querySelector('.croppie');
  let fileTag = el.querySelector("input[type='file']");
  
  if (!eId || !croppie) return false;
  
  let resizer = new Croppie(el, {
    boundary: { width: 300, height: 300 },
    viewport: { width: 200, height: 200 },
    showZoomer: true,
    // enableResize: true,
    enableOrientation: true,
    enableZoom: true,
    mouseWheelZoom: 'ctrl'
  });
  
  if (fileTag) {
    fileTag.addEventListener('change', function(e) {
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
  }
  
  el.addEventListener('uploadImage', function(e) {
    let url = e.detail.url;
    
    console.log(url);
    
    let id = this.id;
    
    let imageInputs = document.querySelectorAll("[data-uploader_id='" + id  + "'].imageInput");
    
    for (let i=0; i<imageInputs.length; i++) {
      let imageInput = imageInputs[i];
      
      imageInput.value = url;
    }
  })

  return {
    eId: eId,
    croppie: croppie,
    fileTag: fileTag,
    el: el,
    resizer: resizer,
    bind: null
  }
}

function getCropResult(uploader, callback) {
  uploader.resizer.result('base64').then(function(base64) {
    
    callback(base64);
    
  });
}

function initImageuploaders() {
  let uploaderElements = document.querySelectorAll('.image-uploader');
  
  for (let i=0; i < uploaderElements.length; i++) {
    let uploaderElement = uploaderElements[i];;
    
    initImageUploader(uploaderElement);
  }
}

function initImageUploader(uploaderElement) {
  let uploader = ImageUploder(uploaderElement);
  
  if (uploader) imageUploaders.push(uploader);
}

function bindImageToUploader(uploader, file) {
  
}

function triggerBindToUploader(uploader) {
  let fileTag = uploader.fileTag;
  
  if (fileTag) fileTag.click();
}

function getUploaderById(eId) {
  for (let i=0; i < imageUploaders.length; i++) {
    if (imageUploaders[i].eId == eId) return imageUploaders[i]
  }
  
  return false;
}

function initUploaderButtons() {
  let uploadBtns = document.querySelectorAll('.imageUpload');
  
  for (let i = 0; i < uploadBtns.length; i++) {
    let uploadBtn = uploadBtns[i];
    
    uploadBtn.addEventListener('click', function(e) {
      let uploaderId = this.getAttribute('data-uploader_id');
      
      let uploader = getUploaderById(uploaderId);
      
      if (uploader) {
        
        triggerBindToUploader(uploader);
        
      }
    })
  }
  
  
  let saveBtns = document.querySelectorAll('.imageSave');
  
  for (let i=0; i < saveBtns.length; i++) {
    let saveBtn = saveBtns[i];
    
    saveBtn.addEventListener('click', function(e) {
      let mybtn = this;
      let uploaderId = this.getAttribute('data-uploader_id');
      
      let uploader = getUploaderById(uploaderId);

      
      if (uploader) {
        getCropResult(uploader, function(resultbase64) {
          console.log(mybtn)
          let file_data =  {
  				"name": 'name',
  				"type": 'type',
  				"size": 'size',
  				"content": resultbase64,
  			};
           crud.createDocument({
             collection:'files2',
             data: file_data,
           });
         /* 
          let name = getRandomImageName(20);
          
          uploadImageData(result, name, function(err, res) {
            if (res) {
              let url = res.Location;
              
              let evt = new CustomEvent('uploadImage', {detail: {url: url}});
              uploader.el.dispatchEvent(evt);
            }
          })*/
          
        })
      }
    })
  }
  
}

function getRandomImageName(length) {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  let charactersLength = characters.length;
  
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result + '.jpg';
}



initImageuploaders();
initUploaderButtons();



action.init({
	name: "saveCroppie",
	endEvent: "saveCroppieComplete",
	callback: (btn, data) => {
		CoCreateCroppie.savebtnt(btn)
	},
})
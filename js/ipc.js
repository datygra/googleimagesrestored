document.body.insertAdjacentHTML("afterbegin", `
  <div id="gisipcwindowcontext" style="display:none">${JSON.stringify({gisipcblobid:0, gisipcblobfullsize:""})}</div>
`)

// gisipcprocess(391, "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRwoVCofjadFKP2kZYbTTMtiaHE1Ts-N_J-NQXullw0dwg_dZR1")

function gisipcprocess(gisipcblobid, gisipcblobdata) {
  
  // new method via jscontrol (for firefox since ff throws permission error when converting circular json to string)
  
  var fullsize = ""  
  var realfullsizeimage = null
  // initial images 
  try {
    var tarlength = document.querySelectorAll(`c-wiz.P3Xfjc`)[0].__jscontroller.o.H[0].Cf.j[0].j[3].length
    for (let i=0;i<tarlength;i++) {
      try {
        let reqei = gisipcblobdata
        let basei = document.querySelectorAll(`c-wiz.P3Xfjc`)[0].__jscontroller.o.H[0].Cf.j[0].j[3][i]
        var subasei = basei.j[2].j[3].H[0]
        if (subasei === reqei) {
          try {
            realfullsizeimage = basei.j[2].j[4].H[0]
          }
          catch(e) {
            
          }
          break
        }
      }
      catch(e) {
        // console.error(e)  
      }
    }
  }
  catch(e) {
    console.error("primary fullsize method not found.. onward")
  }
  
  if (realfullsizeimage !== null) {
    // console.log("jscontrolmethod ok")
    fullsize = realfullsizeimage
    document.getElementById("gisipcwindowcontext").innerText = JSON.stringify({gisipcblobid:gisipcblobid, gisipcblobfullsize:fullsize})
    return
  }  

  try {
    
    var dogpile = () => {
      return 
    }
    
    var getCircularReplacer = () => {
      const seen = new WeakSet()
      return (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return
          }
          seen.add(value)
        }
        return value
      }
    }
    
    // text string of full window object
    let AgisXp = JSON.stringify(window, getCircularReplacer())

    // search for full size url based on thumbnail url
    try {
      var Xfindenc = gisipcblobdata
      var pstart = AgisXp.indexOf(Xfindenc)
      if (pstart === -1) {
        throw new Error("less than one")
      }
      AgisXp = AgisXp.slice(pstart + Xfindenc.length)
      var Xrealurlstart = AgisXp.indexOf(`"http`)
      AgisXp = AgisXp.slice(Xrealurlstart + 1)
      var Xendquote = AgisXp.indexOf(`"`)
      if (Xendquote === -1) {
        throw new Error("less than one")
      }
      AgisXp = AgisXp.substring(0,Xendquote)
      // update the DOM with full size url accessible from content script
      document.getElementById("gisipcwindowcontext").innerText = JSON.stringify({gisipcblobid:gisipcblobid, gisipcblobfullsize:AgisXp})
      // console.log("updated")
      // console.log(document.getElementById("gisipcwindowcontext").innerText)
      return
    }
    catch(e) {
      console.error(e)
      // console.log("couldnt find the real url with this scheme.. try the other scheme")
      throw new Error(e)
    }

  }
  catch(e) {
    // console.error(e)
    // console.log("cross origin blocked trying workaround")
    var startlogging = false
    var fullsizematch = "0"
    try {
      var getCircularReplacer = () => {
        var seen = new WeakSet()
        return (key, value) => {
          if (startlogging && typeof value === "string" && value.startsWith("http")) {
            // console.log(value)
            fullsizematch = value
            // absurd workaround
            throw new Error("got what we needed")
          }
          if (value === gisipcblobdata) {
            startlogging = true
          }
          if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
              return
            }
            seen.add(value)
          }
          return value
        }
      }
      JSON.stringify(window, getCircularReplacer())
    }
    catch(e) {
      // console.log("finished normally")
      // console.log(fullsizematch)
      document.getElementById("gisipcwindowcontext").innerText = JSON.stringify({gisipcblobid:gisipcblobid, gisipcblobfullsize:fullsizematch})
    }    
  }
}

function gisipcreceivemessage(e) {
  try {
    if (e && e.data) {
      let blob = JSON.parse(e.data)
      if (blob.gisipcblob) {
        // console.log("IPC BLOB")
        // console.log(blob.gisipcblob)
        // {
        //   gisipcblob: {
        //     id: int, // random number, used as uuid
        //     data: string // http://encrypted.googleetc/thumbnailurl
        //   }
        // }
        gisipcprocess(blob.gisipcblob.id, blob.gisipcblob.data)
        return
      }
    }
  }
  catch(e) {
    
  }
}

window.addEventListener("message", gisipcreceivemessage, false);

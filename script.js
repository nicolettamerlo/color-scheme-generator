import tinycolor from "https://esm.sh/tinycolor2";

// DOM VARIABLES
const schemeGenerator = document.querySelector("#schemeGenerator");
const main = schemeGenerator.querySelector(".main");
const colorIndicator = schemeGenerator.querySelector(".indicator");
const colorInput = schemeGenerator.querySelector("#colorInput");
const paletteSwatches = schemeGenerator.querySelector(".palette-swatches");
const paletteFooter = schemeGenerator.querySelector(".palette-footer");
const paletteFooterText = paletteFooter.querySelector("span");
const paletteValues = schemeGenerator.querySelector(".modal-values").querySelector(".values-list");
const skinsList = schemeGenerator.querySelector(".skins-list")
const swatchbookList = schemeGenerator.querySelector(".swatchbook-list");
const typeBtns = Array.from(schemeGenerator.querySelectorAll(".btn-radio"));
const btns = Array.from(schemeGenerator.querySelectorAll(".btn"));
const separators = Array.from(schemeGenerator.querySelectorAll(".separator"));
const modals = Array.from(schemeGenerator.querySelectorAll(".modal-container"));


const baseColor = {
    code:tinycolor("#3A9DDA"),
    format:0,
    getCode(){return this.code},
    setCode(value, source="tool"){
        this.code = value
        this.domUpdate(source)
        controller.init()
    },
    setFormat(value){
        this.format = value
        /* update input with new format */
        colorInput.value = getFormattedColor(this.code, this.format);
    },
    changeFromTool(trg){
        if(trg.id==="saturate") this.setCode(this.code.saturate(5))
        else if(trg.id==="desaturate") this.setCode(this.code.desaturate(5))
        else if(trg.id==="lighten") this.setCode(this.code.lighten(5))
        else if(trg.id==="darken") this.setCode(this.code.darken(5))
        else if(trg.id==="random") this.setCode(tinycolor.random())
    },
    changeFromInput(trg){
        const color = tinycolor(trg.value)
        if (color.isValid()) this.setCode(color, "input")
    },
    domUpdate(source){
        colorIndicator.style.backgroundColor = this.code
        if(source !== "input") colorInput.value = getFormattedColor(this.code, this.format);
        
    }
}
const schemeType = {
    type: "monochromatic",
    getType(){return this.type},
    setType(value){
        this.type = value
        controller.init()
    }
}
const mainScheme = {
    format:0,
    scheme:[],
    setFormat(value){
        this.format = value
        // update values
        const values = Array.from(schemeGenerator.querySelectorAll(".value-code"));
        values.map((value, index) => {
            const color = getFormattedColor(this.scheme[index], this.format) 
            value.innerHTML = color
        })
    },
    setScheme(color, type){
        this.scheme = createScheme(color, type)
        paletteFooterText.innerHTML = type;
    },
    insertSwatches(){
        // remove existing swatches and values
        const swatches = Array.from(paletteSwatches.querySelectorAll(".swatch"))
        const values = Array.from(paletteValues.querySelectorAll(".values-list-item"))
        swatches.map(swatch => {swatch.remove()})
        values.map(value => {value.remove()})
        // remove existing swatches and values
        this.scheme.map(el => {
            const color = getFormattedColor(el, this.format) 
            paletteSwatches.insertAdjacentHTML("beforeend", schemeSwatch(color))
            paletteValues.insertAdjacentHTML("beforeend", schemeValue(color))
        })
    }
}
const swatchbook = {
    maxSchemes:24,
    palettePlaceholders(){
        for (let index = 0; index < this.maxSchemes; index++) {
            swatchbookList.insertAdjacentHTML("beforeend", swatchBtn("transparent", "swatch-custom-disabled"))
        }
    },
    savePalette(){
        const type = schemeType.getType()
        const color = tinycolor(baseColor.getCode()).toHexString()
        const swatches = swatchbookList.querySelectorAll('.swatch-btn')
        /*remove last swatch and add the new one*/
        swatches[this.maxSchemes - 1].remove()
        swatchbookList.insertAdjacentHTML("afterbegin", swatchBtn(color, "swatch-custom"))
        const swatch = swatchbookList.querySelector(".swatch-custom")
        swatch.dataset.type = type
        swatch.dataset.color = color 
        this.savedAlert()
    },
    savedAlert(){
        const container = schemeGenerator.querySelector("#savedAlert")
        container.insertAdjacentHTML("afterbegin", savedMessage())      
    }
};
const skins = {
    primary: "#ddddf7",
    secondary: "#ffffff",
    text:"#ddddf7",

    black:"#171718",
    white:"#ffffff",
    grayLight:"#ddddf7",
    gray:"#b0b0ce",
    grayMedium:"#65657d",
    grayDark:"#42454c",

    setSkin(trg){
        main.style.backgroundColor = trg.dataset.hex;
        const btns = Array.from(schemeGenerator.querySelectorAll(".swatch-skin"))
        btns.map(btn => {
            btn.classList.remove("swatch-btn-selected")
            if(btn===trg) btn.classList.add("swatch-btn-selected")
        })
        this.setColors(trg.dataset.name)
        this.setFeatures(trg.dataset.name)
        this.setModals(trg.dataset.name)
    },
    setColors(name){
        name === "grayLight" || name === "gray" ? this.primary =  "#ffffff" : this.primary = "#ddddf7"
        name === "grayLight" ? this.secondary =  "#ddddf7" : this.secondary = "#ffffff"
        name === "black" || name === "grayDark" || name === "grayMedium" ? this.text = "#ddddf7" : this.text = "#171718"
    },
    setFeatures(){
        main.style.color = this.text
        const backgrounds = [...btns, ...typeBtns, paletteFooter, colorInput]; 
        const borders = [...btns, ...typeBtns, colorInput, colorIndicator, main, ...separators]; 
        backgrounds.map(background => {
            background.style.backgroundColor = this.primary;
        });
        borders.map(border => {
            border.style.borderColor = this.primary;
        });
    },
    setModals(name){
        modals.map(modal => {
            name==="grayLight" ? modal.style.backgroundColor = "#ffffff" : modal.style.backgroundColor = "#ddddf7"
        });
        const disabledSwatches = Array.from(schemeGenerator.querySelectorAll(".swatch-custom-disabled"))
        const color = name === "grayLight" ? this.grayLight : this.white
        disabledSwatches.map(el => el.style.borderColor = color)
    },
    insertBtns(){
        const names = ["white", "grayLight", "gray", "grayMedium", "grayDark", "black"]
        const colors = [this.white, this.grayLight, this.gray, this.grayMedium, this.grayDark, this.black]
        colors.map((clr, index) => {
            skinsList.insertAdjacentHTML("afterbegin", swatchBtn(clr, "swatch-skin"))
            const btn = skinsList.querySelector(".swatch-skin")
            btn.dataset.name = names[index]
            btn.dataset.hex = clr
            if(names[index]==="black") btn.classList.add("swatch-btn-selected")
        })
        // [].map((clr, index) => {
        //     skinsList.insertAdjacentHTML("afterbegin", swatchBtn(clr, "swatch-skin"))
        //     const btn = skinsList.querySelector(".swatch-skin")
        //     btn.dataset.name = names[index]
        //     btn.dataset.hex = clr
        //     if(clr.name==="black") btn.classList.add("swatch-btn-selected")
        // })
    },
};

const controller = {
    loadSwatchbookPalette(trg){
        if(trg.dataset.type !== schemeType.getType()) {
            schemeType.setType(trg.dataset.type) 
            typeBtns.map(btn => {
                btn.value === schemeType.getType() ? btn.checked = true : btn.checked = false
            });
        }       
        baseColor.setCode(tinycolor(trg.dataset.color)); 
    },
    init(){
        mainScheme.setScheme(baseColor.getCode(), schemeType.getType());
        mainScheme.insertSwatches();
    },
    modalToggle(trg){
        const modal = schemeGenerator.querySelector(`.${trg.dataset.target}`)
        modal.classList.toggle("d-none")
    }
}
/*helpers*/
const getFormattedColor = (color, format) => {
    if(format === 0) return color.toHexString()
    else if(format === 1) return color.toRgbString()
    else if(format === 2) return color.toHslString() 
}
const changeColorFormat = (trg) => {
    const formats = ["hex", "rgb", "hsl"]
    const target = trg.dataset.target
    let format = parseInt(trg.dataset.format)
    format < formats.length - 1 ? format++ : format = 0 
    target === "colorInput" ? baseColor.setFormat(format) : mainScheme.setFormat(format)
    // update btn format
    trg.dataset.format = format;
    trg.innerHTML = formats[format].toUpperCase()
}
const createScheme = (color, type) => {
    let scheme = []
    if(type==="monochromatic") scheme = color.monochromatic(5)
    else if(type==="analogous") scheme = color.analogous(5)
    else if(type==="splitcomplement") scheme = color.splitcomplement()
    else if(type==="triad") scheme = color.triad()  
    else if(type==="tetrad") scheme = color.tetrad() 
    return scheme;
}
/*html components */
const schemeValue = (color) => {
   return `<div class="values-list-item">
            <div class="value-indicator" style="background-color: ${color};"></div>
            <span class="value-code">${color}</span>
         </div>`
}
const schemeSwatch = (color) => {
    return `<li class="swatch" style="background-color: ${color};"></li>`
}
const swatchBtn = (color, cls) => {
    return `<button class="swatch-btn ${cls}" style="background-color: ${color};"></button>`;
}
const savedMessage = () => { 
    return `<div class="savedMessage ">added to swatchbook!</div>`
}
// EVENTS
schemeGenerator.addEventListener("click", (e) => {
    const trg = e.target;
    const cls = trg.classList;
    if(cls.contains("tool")) baseColor.changeFromTool(trg)
    else if(cls.contains("btn-format")) changeColorFormat(trg)
    else if(cls.contains("btn-modal")) controller.modalToggle(trg)
    else if(cls.contains("swatchbook-menu-item")) swatchbook.selectMenu(trg)
    else if(cls.contains("swatch-skin")) skins.setSkin(trg)
    else if(cls.contains("swatch-custom")) controller.loadSwatchbookPalette(trg)
    else if(trg.id==="saveSwatch") swatchbook.savePalette()
})
schemeGenerator.addEventListener("change", (e) => {
    const trg = e.target
    const cls = trg.classList
    if (cls.contains("btn-radio")) schemeType.setType(trg.value)
})
colorInput.addEventListener("keyup", (e) => {
    baseColor.changeFromInput(e.target)
})

/*INIT*/
baseColor.setCode(tinycolor("#3A9DDA"))
skins.insertBtns()
swatchbook.palettePlaceholders()

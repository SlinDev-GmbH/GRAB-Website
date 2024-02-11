import { GetColor, LinearToGamma } from "./helper.js"
export function createPreviewButton(item, activeCosmetics, owned_products, type) {

  const previewButton = document.createElement("button")
  previewButton.style.height = "2em"
  previewButton.style.width = "70%"
  console.log(type);
  previewButton.innerHTML = owned_products.includes(item)?"equip":"preview"
  previewButton.style.zIndex = 999
  previewButton.classList.add("previewButton", `${type}`)
  previewButton.id = item
 console.log(activeCosmetics[type],activeCosmetics)
  if(activeCosmetics[type]==item){
    previewButton.classList.toggle("toggled")
    
      previewButton.innerHTML = "Un-equip";
    previewButton.style.backgroundColor = "#FF0000";
  }
  return previewButton
}

export const createContainer = (
  w,
  picker,
  handleContainerClick,
  handleContainerMouseOut
) => {
  const container = document.createElement("div")
  const lastWholeDigitNum = w % 10
  const firstWholeDigitNum = Math.floor(w / 10)

  container.onclick = (e) => handleContainerClick(e, [Math.floor(
    LinearToGamma(GetColor(firstWholeDigitNum, lastWholeDigitNum)).r * 255
  ), Math.floor(
    LinearToGamma(GetColor(firstWholeDigitNum, lastWholeDigitNum)).g * 255
  ), Math.floor(
    LinearToGamma(GetColor(firstWholeDigitNum, lastWholeDigitNum)).b * 255
  )])
  container.onmouseout = handleContainerMouseOut

container.setAttribute('data-grab_color', `[${GetColor(firstWholeDigitNum, lastWholeDigitNum).r},${GetColor(firstWholeDigitNum, lastWholeDigitNum).g},${GetColor(firstWholeDigitNum, lastWholeDigitNum).b}]`)
  container.style.backgroundColor = `rgb(${Math.floor(
    LinearToGamma(GetColor(firstWholeDigitNum, lastWholeDigitNum)).r * 255
  )}, ${Math.floor(
    LinearToGamma(GetColor(firstWholeDigitNum, lastWholeDigitNum)).g * 255
  )}, ${Math.floor(
    LinearToGamma(GetColor(firstWholeDigitNum, lastWholeDigitNum)).b * 255
  )})`
  picker.appendChild(container)
}

export function displayCategoryList(
  a,
  backTracker,
  selectedPrimaryDiv,
  selectedSecondaryDiv,
  categoryState
) {
  let categoriesContent = document.getElementById("categories-content")
  let children = categoriesContent.children
  if (a == 0) {
    //front page
    backTracker = 0
    for (let i = 0; i < children.length; i++) {
      children[i].style.display = "none"
    }

    if (selectedPrimaryDiv) selectedPrimaryDiv.style.outline = "none"
    if (selectedSecondaryDiv) selectedSecondaryDiv.style.outline = "none"
    document.getElementById("categories-content").style.display = "grid"
    document.getElementById("cosmetics").style.display = "block"
    document.getElementById("primary").style.display = "block"
    document.getElementById("secondary").style.display = "block"
    document.getElementById("back-btn").style.display = "none"
    document.getElementById("categories-content").style.height = "372px"
  }
  if (a == 1) {
    //cosmetics clicked
    backTracker = 0
    for (let i = 0; i < children.length; i++) {
      children[i].style.display = "none"
    }
    var contentChildren = document.getElementById("content").childNodes
    for (var i = contentChildren.length - 1; i >= 0; i--) {
      var child = contentChildren[i]
      document.getElementById("content").removeChild(child)
    }
    categoryState = false
    document.getElementById("categories-content").style.display = "grid"
    document.getElementById("Head").style.display = "block"
    document.getElementById("Body").style.display = "block"
    document.getElementById("Hands").style.display = "block"
    document.getElementById("Grapples").style.display = "block"
    document.getElementById("Checkpoints").style.display = "block"
    document.getElementById("back-btn").style.display = "block"
    document.getElementById("categories-content").style.height = "300px"
    document.getElementById("content").style.height = ""
    document.getElementById("back-btn").style.marginTop = "0em"
  }

  if (a == 2) {
    //color picker
    backTracker = 0
    for (let i = 0; i < children.length; i++) {
      children[i].style.display = "none"
    }
    document.getElementById("categories-content").style.display = "block"
    document
      .querySelectorAll("#categories-content div")
      .forEach((e) => (e.style.display = "inline-block"))
    document.getElementById("back-btn").style.display = "block"
    document.getElementById("categories-content").style.height = "400px"
  }
  if (a == 3) {
    //show head accessories categories
    backTracker = 1
    categoryState = true
    for (let i = 0; i < children.length; i++) {
      children[i].style.display = "none"
    }
    document.getElementById("Heads").style.display = "block"
    document.getElementById("Hats").style.display = "block"
    document.getElementById("Facewear").style.display = "block"
    document.getElementById("categories-content").style.height = "150px"
    document.getElementById("content").style.height = ""
    document.getElementById("back-btn").style.marginTop = "0em"
    var contentChildren = document.getElementById("content").childNodes
    for (var i = contentChildren.length - 1; i >= 0; i--) {
      var child = contentChildren[i]
      document.getElementById("content").removeChild(child)
    }
    document.getElementById("categories-content").style.display = "grid"
  }
  if (a == 4) {
    //finals when clicked
    if (categoryState == true) {
      backTracker = 3
    } else {
      backTracker = 1
    }
    for (let i = 0; i < children.length; i++) {
      children[i].style.display = "none"
    }
    document.getElementById("content").style.height = "100%"
    document.getElementById("categories-content").style.height = "372px"
    document.getElementById("back-btn").style.marginTop = "1.5em"

    //categories will dissappear btw
  }
  return backTracker
}

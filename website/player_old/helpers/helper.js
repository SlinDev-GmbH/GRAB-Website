export const LinearToGamma = (color) => {
  let r = color.r
  let g = color.g
  let b = color.b

  if(r <= 0.0031308)
  {
      r = r * 12.92
  }
  else
  {
      r = 1.055 * Math.pow(r, 1.0/2.4) - 0.055
  }
  
  if(g <= 0.0031308)
  {
      g = g * 12.92
  }
  else
  {
      g = 1.055 * Math.pow(g, 1.0/2.4) - 0.055
  }
  
  if(b <= 0.0031308)
  {
      b = b * 12.92
  }
  else
  {
      b = 1.055 * Math.pow(b, 1.0/2.4) - 0.055
  }
  
  return {r: r, g: g, b: b, a: color.a}
}

export const ConvertHSVToRGB = (h, s, v, alpha) => {
  let hi = h * 3.0 / Math.PI
    const f  = hi - Math.floor(hi)
    if(hi >= 3.0)
        hi -= 6.0
    if(hi < -3.0)
        hi += 6.0
    
    let r = Math.max(v, 0.0)
    let g = Math.max(v - s * v, 0.0)
    let b = Math.max(v - s * f * v, 0.0)
    let a = Math.max(v - s * (1.0 - f) * v, 0.0)
    
    if(hi < -2.0)
    {
        return {r: r, g: a, b: g, a: alpha}
    }
    else if(hi < -1.0)
    {
        return {r: b, g: r, b: g, a: alpha}
    }
    else if(hi < 0.0)
    {
        return {r: g, g: r, b: a, a: alpha}
    }
    else if(hi < 1.0)
    {
        return {r: g, g: b, b: r, a: alpha}
    }
    else if(hi < 2.0)
    {
        return {r: a, g: g, b: r, a: alpha}
    }
    else
    {
        return {r: r, g: g, b: b, a: alpha}
    }
}

export const GetColor = (row, column) => {
  let color
  if(row ==0){
      return (color = ConvertHSVToRGB(0.0, 0.0, 1.0 - column / 10.0))
}
if(row <= 5&&row!=0)
  {
      return (color = ConvertHSVToRGB(2.0 * Math.PI * column/10.0, 1.0, row/(10.0 - 4.0)))
  }
  else
  {
    return (color = ConvertHSVToRGB(2.0 * Math.PI * column/10.0, 1.0 - (row - 5.0)/(10.0 - 5.0), 1.0))
  }
}


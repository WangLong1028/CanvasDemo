var width = window.innerWidth
var height = width * 0.618
var canvas = document.getElementById('mountain_canvas')
var c = canvas.getContext('2d')
var layers = []
var time = 0

// 山
class Mountain {
    constructor(topX, topY, length, angle, color1, color2) {
        this.topX = topX
        this.topY = topY
        this.length = length
        this.angle = angle
        this.color1 = color1
        this.color2 = color2

        this.bottom = topY + length * Math.cos(angle / 2)
        this.left = topX - length * Math.sin(angle / 2)
        this.right = topX + length * Math.sin(angle / 2)
    }

    draw() {
        var linear = c.createLinearGradient(this.topX, this.topY, this.topX, this.bottom)
        linear.addColorStop(0, this.color1)
        linear.addColorStop(1, this.color2)
        c.fillStyle = linear
        c.beginPath()
        c.moveTo(this.topX, this.topY)
        c.lineTo(this.right, this.bottom)
        c.lineTo(this.left, this.bottom)
        c.lineTo(this.topX, this.topY)
        c.fill()
        c.closePath()
    }
}

// 绘制山层
class MountainLayer {

    constructor() {
        this.firstLayer = []
        this.secondLayer = []
        this.mainMountains = []

        var color1 = "#4A8C7D"
        var color2 = "#A5C5B5"
        var color3 = "#85B9A0"
        for (var i = 0; i < 3; i++) {
            var curX = (i * 0.33 + 0.165) * width
            this.firstLayer.push(new Mountain(curX, height * 0.40, height * 0.8, Math.PI / 3 * 2, color1, color2))
        }
        for (var i = 0; i < 4; i++) {
            var curX = i * 0.33 * width
            this.secondLayer.push(new Mountain(curX, height * 0.36, height * 0.8, Math.PI / 3 * 2, color1, color2))
        }
        this.mainMountains.push(new Mountain(0.50 * width, height * 0.18, height * 0.8, Math.PI / 1.8, color3, color2))
        this.mainMountains.push(new Mountain(0.38 * width, height * 0.28, height * 0.8, Math.PI / 1.8, color3, color2))
        this.mainMountains.push(new Mountain(0.62 * width, height * 0.28, height * 0.8, Math.PI / 1.8, color3, color2))
    }

    draw() {
        this.mainMountains.forEach(mountain => {
            mountain.draw()
        })
        this.secondLayer.forEach(mountain => {
            mountain.draw()
        })

        var bottom = 0
        this.firstLayer.forEach(mountain => {
            mountain.draw()
            bottom = mountain.bottom
        })
        c.fillStyle = "#A5C5B5"
        c.fillRect(0, bottom - 10, width, height - bottom + 10)
    }

    update() {
        this.draw()
    }
}

class Color {
    constructor(red, green, blue) {
        this.red = red
        this.green = green
        this.blue = blue
    }
}

// 天空层
class SkyLayer {

    getProgreessColor(color1, color2, progress) {
        var ans = new Color()
        ans.red = color1.red + (color2.red - color1.red) * progress
        ans.green = color1.green + (color2.green - color1.green) * progress
        ans.blue = color1.blue + (color2.blue - color1.blue) * progress
        return ans
    }

    draw() {
        var color1 = new Color(233, 80, 0)
        var color2 = new Color(0, 0, 0)
        var color3 = new Color(255, 255, 255)
        if (time > 0.10 && time <= 0.20) {
            var curColor = this.getProgreessColor(color1, color3, (time - 0.10) * 10)
            c.fillStyle = `rgb(${curColor.red}, ${curColor.green}, ${curColor.blue})`
            c.globalAlpha = 0.20
        } else if (time >= 0.20 && time < 0.30) {
            var curColor = color3
            c.fillStyle = `rgb(${curColor.red}, ${curColor.green}, ${curColor.blue})`
            c.globalAlpha = 0.20
        } else if (time >= 0.30 && time < 0.40) {
            var curColor = this.getProgreessColor(color3, color1, (time - 0.30) * 10)
            c.fillStyle = `rgb(${curColor.red}, ${curColor.green}, ${curColor.blue})`
            c.globalAlpha = 0.20
        } else if (time >= 0.40 && time < 0.50) {
            var curColor = this.getProgreessColor(color1, color2, (time - 0.40) * 10)
            c.fillStyle = `rgb(${curColor.red}, ${curColor.green}, ${curColor.blue})`
            c.globalAlpha = 0.20 + (time - 0.40) * 10 * 0.20
        } else if (time >= 0.50 && time <= 1.00) {
            var curColor = color2
            c.fillStyle = `rgb(${curColor.red}, ${curColor.green}, ${curColor.blue})`
            c.globalAlpha = 0.40
        } else {
            var curColor = this.getProgreessColor(color2, color1, time * 10)
            c.fillStyle = `rgb(${curColor.red}, ${curColor.green}, ${curColor.blue})`
            c.globalAlpha = 0.40 - time * 10 * 0.20
        }
        c.fillRect(0, 0, width, height)
        c.globalAlpha = 1
    }

    update() {
        this.draw()
    }
}

// 太阳层
class SunLayer {

    draw() {
        var sunX = width / 2 - width / 2 * Math.cos(time * 2 * Math.PI)
        var sunY = height - width / 2 * Math.sin(time * 2 * Math.PI)
        var radial = c.createRadialGradient(sunX, sunY, 0, sunX, sunY, width)
        radial.addColorStop(0, "#ffffd4")
        radial.addColorStop(1, "#A5C5B5")
        c.beginPath()
        c.arc(sunX, sunY, width, 0, Math.PI * 2)
        c.fillStyle = radial
        c.fill()
        c.closePath()

        c.beginPath()
        c.arc(sunX, sunY, height * 0.08, 0, Math.PI * 2)
        c.fillStyle = "#ffffd4"
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
    }
}

class Star {
    constructor(color, radiusPercent, startDrgree) {
        this.defaultRadius = height * 2
        this.radius = this.defaultRadius * radiusPercent
        this.color = color
        this.degree = startDrgree
    }

    draw() {
        c.alpha = 1
        c.beginPath()
        c.arc(this.x, this.y, width / 960, 0, Math.PI * 2, false)
        c.arc(this.x2, this.y2, width / 960, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.shadowColor = this.color
        this.shadowBlur = 15
        c.fill()
        c.closePath()
        c.globalAlpha = 1
    }

    update(curDegree) {
        var theta = Math.asin(width / 2 / this.defaultRadius)
        var centerY = height * 0.18 + this.defaultRadius
        this.x = width / 2 + this.radius * Math.sin(this.degree + curDegree - theta)
        this.y = centerY - this.radius * Math.cos(this.degree + curDegree - theta)
        this.x2 = width / 2 + this.radius * Math.sin(this.degree + curDegree - theta * 3);
        this.y2 = centerY - this.radius * Math.cos(this.degree + curDegree - theta * 3);

        if (time < 0.1) {
            this.alpha = 1 - 1 * time * 10
        } else if (time >= 0.4 && time <= 0.5) {
            this.alpha = (time - 0.4) * 10 * 1
        } else if (time < 0.5) {
            this.alpha = 0
        } else {
            this.alpha = 1
        }

        this.draw()
    }
}

// 星星层
class StarLayer {

    constructor() {
        this.curDegree = 0
        this.stars = []
        const starCount = 100
        var color1 = new Color(232, 172, 207)
        var color2 = new Color(255, 255, 255)
        for (var i = 0; i < starCount; i++) {
            var curColor = this.getRandomColor(color1, color2)
            this.stars.push(new Star(`rgb(${curColor.red}, ${curColor.green}, ${curColor.blue})`, 0.16 * Math.random() + 1.01, Math.PI * Math.random()))
        }
    }

    getRandomColor(color1, color2) {
        var ans = new Color()
        ans.red = color1.red + (color2.red - color1.red) * Math.random()
        ans.green = color1.green + (color2.green - color1.green) * Math.random()
        ans.blue = color1.blue + (color2.blue - color1.blue) * Math.random()
        return ans
    }

    draw() {

    }

    update() {
        this.draw()
        this.stars.forEach(star => {
            if (star.degree != undefined) {
                star.update(this.curDegree)
            }
        })
        this.curDegree += 0.00001
        var theta = Math.asin(width / 2 / this.defaultRadius)
        if (this.curDegree >= 2 * theta) {
            this.curDegree = 0
        }
    }
}


// 孔明灯
class Lantern {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    draw(baseX, baseY) {
        var color1 = "#FFF0A1"

        var x = this.x + baseX
        var y = this.y + baseY
        var graphHeight = height / 10
        var up = graphHeight / 6 * 5
        var down = graphHeight / 3 * 2

        var top = y - 0.72 * graphHeight
        var bottom = y + 0.28 * graphHeight
        var topLeft = x - up / 2
        var topRight = x + up / 2
        var bottomLeft = x - down / 2
        var bottomRight = x + down / 2

        this.right = topRight
        this.bottom = bottom

        if(time < 0.10){
            c.globalAlpha = 0.5 - 0.5 * time * 10
        }else if(time < 0.40){
            c.globalAlpha = 0
        }else if(time < 0.50){
            c.globalAlpha = 0.5 * (time - 0.40) * 10
        }else{
            c.globalAlpha = 0.5
        }
        c.beginPath()
        c.moveTo(topLeft, top)
        c.lineTo(topRight, top)
        c.lineTo(bottomRight, bottom)
        c.lineTo(bottomLeft, bottom)
        c.lineTo(topLeft, top)
        c.fillStyle = color1
        c.shadowColor = color1
        c.strokeStyle = "#5D4037"
        c.shadowBlur = 12
        c.fill()
        c.stroke()
        c.closePath()
        c.shadowBlur = 0

        if(time < 0.10){
            c.globalAlpha = 1 - 1 * time * 10
        }else if(time < 0.40){
            c.globalAlpha = 0
        }else if(time < 0.50){
            c.globalAlpha = 1 * (time - 0.40) * 10
        }else{
            c.globalAlpha = 1
        }
        c.beginPath()
        c.arc(x, y, graphHeight / 12, 0, Math.PI * 2, false)
        c.fillStyle = color1
        c.fill()
        c.closePath()

        c.globalAlpha = 1
    }

    update(baseX, baseY) {
        // 第一屏
        this.draw(baseX, baseY)
        // 第二屏
        this.draw(baseX + width, baseY + height)
    }
}

// 孔明灯层
class LanternLayer {
    constructor(speed) {
        const lanternCount = 3
        this.lanterns = []
        this.x = 0
        this.y = 0
        this.speed = speed
        for (var i = 0; i < lanternCount; i++) {
            this.lanterns.push(new Lantern(width / lanternCount * i, height * Math.random()))
        }
    }

    draw() {
    }

    update() {
        this.x -= this.speed
        this.y -= this.speed / width * height
        this.draw()
        for (var i = 0; i < this.lanterns.length; i++) {
            this.lanterns[i].update(this.x, this.y)
        }

        if(this.x <= -width) this.x =  this.x + width
        if(this.y <= -height) this.y = this.y + height
    }
}

class Comet {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.speed = width / 100
        this.angle = Math.PI / 6
    }

    draw() {
        var defaultStrokeSize = c.lineWidth
        var x = this.x
        var y = this.y
        var length = height / 6
        var angle = this.angle
        var x2 = x - Math.cos(angle) * length
        var y2 = y - Math.sin(angle) * length
        var color = '#ffffff'

        this.left = x2
        this.top = y2

        var linear = c.createLinearGradient(x, y, x2, y2)
        linear.addColorStop(0, color)
        linear.addColorStop(1, 'rgba(255, 255, 255, 0)')
        c.lineWidth = height / 100
        c.strokeStyle = linear
        c.beginPath()
        c.moveTo(x, y)
        c.lineTo(x2, y2)
        c.stroke()
        c.closePath()

        c.beginPath()
        c.arc(x, y, c.lineWidth / 2, 0, Math.PI * 2, false)
        c.fillStyle = color
        c.shadowColor = color
        c.shadowBlur = c.lineWidth
        c.fill()
        c.closePath()
        c.shadowBlur = 0

        c.lineWidth = defaultStrokeSize
    }

    update() {
        this.draw()
        this.x += this.speed * Math.cos(this.angle)
        this.y += this.speed * Math.sin(this.angle)
    }
}

// 流星层
class CometLayer {
    constructor() {
        this.comet = new Comet(-width * 0.5 - width * Math.random() * 0.5, -height * 0.5 - height * Math.random() * 0.5)
    }

    draw() {

    }

    update() {
        if (time < 0.50 && time > 0.10) return
        this.draw()
        this.comet.update()
        if (this.comet.left > width && this.comet.top > height) {
            this.comet.x = -width * 0.5 - width * Math.random() * 0.5
            this.comet.y = -height * 0.5 - height * Math.random() * 0.5
        }
    }
}

function init() {
    canvas.width = width
    canvas.height = height

    layers.push(new SunLayer())
    layers.push(new CometLayer())
    layers.push(new MountainLayer())
    layers.push(new SkyLayer())
    layers.push(new StarLayer())
    layers.push(new LanternLayer(width / 1000 * (1 + Math.random() * 0.2)))
    layers.push(new LanternLayer(width / 1000 * (1 + Math.random() * 0.2)))
}

function progressChange(value) {
    time = parseFloat(value / 100)
    console.log(time)
}

function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = "#A5C5B5"
    c.fillRect(0, 0, width, height)
    for (var i = 0; i < layers.length; i++) {
        layers[i].update()
    }
}

init()
animate()

addEventListener('resize', () => {
    width = Window.innerWidth
    height = width * 0.618
    init()
})

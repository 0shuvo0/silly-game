function $(selector, parent = document) {
  return parent.querySelector(selector)
}

const gameBoard = $('.game-board')
const playersDiv = $('.players')

const players = [
    {id: 1},
    {id: 2},
    {id: 3},
    {id: 4},
    {id: 5}
]
const objects = [
    {
        type: 'Math',
        left: {
            type: 'Add',
            value: 5
        },
        right: {
            type: 'Subtract',
            value: 3,
            isNegative: true
        }
    },

]


let PLAYERS_MID = 50
let SPAN_X = 30
const OBJECT_HEIGHT = 100
const playersHeight = playersDiv.clientHeight
const boardHeight = gameBoard.clientHeight
let gameOver = false

//sounds
const spawnSound = new Audio('sounds/spawn.wav')
const removeSound = new Audio('sounds/remove.wav')
const endSound = new Audio('sounds/end.wav')
const bgm = new Audio('sounds/bgm.mp3')
bgm.loop = true
bgm.play()

function renderPlayers(players){
    playersDiv.innerHTML = ''
    players.forEach((player) => {
        const playerDiv = document.createElement('div')
        playerDiv.classList.add('player')
        playerDiv.style.left = `calc(${PLAYERS_MID}% + ${player.x}px)`
        playerDiv.style.top = `calc(50% + ${player.y}px)`
        playersDiv.appendChild(playerDiv)
    })
}

function setPlayerPositions(players){
    players.forEach(setPlayerPosition)
}
function setPlayerPosition(player){
    const x = ((Math.random() * SPAN_X) * (Math.random() > 0.5 ? 1 : -1)).toFixed(2)
    const y = ((Math.random() * 45) * (Math.random() > 0.5 ? 1 : -1)).toFixed(2)
    player.x = x
    player.y = y
}

function setObjectsPositions(objects){
    objects.forEach(setObjectPosition)  
}
function setObjectPosition(object, index){
    const y = (index * OBJECT_HEIGHT) - (index * 100)
    object.y = y
}

function renderObjects(objects){
    objects.forEach((object) => {
        if(!object.div){
            object.div = document.createElement('div')
            object.div.classList.add('object')
            object.div.style.height = `${OBJECT_HEIGHT}px`
            
            if(object.type === 'Math'){
                object.div.classList.add('math-object')

                const left = document.createElement('div')
                left.classList.add('math-element', 'left')
                const symbol = object.left.type === 'Add' ? '+' : object.left.type === 'Subtract' ? '-' : object.left.type === 'Multiply' ? 'x' : object.left.type === 'Divide' ? '&divide;' : ''
                left.innerHTML = `${symbol}${object.left.value}`
                if(object.left.isNegative) left.classList.add('negative')
                object.div.appendChild(left)

                const right = document.createElement('div')
                right.classList.add('math-element', 'right')
                const symbol2 = object.right.type === 'Add' ? '+' : object.right.type === 'Subtract' ? '-' : object.right.type === 'Multiply' ? 'x' : object.right.type === 'Divide' ? '&divide;' : ''
                right.innerHTML = `${symbol2}${object.right.value}`
                if(object.right.isNegative) right.classList.add('negative')
                object.div.appendChild(right)
            }
            else if(object.type === 'Enemy'){
                object.div.classList.add('enemy-object')
                const enemy = document.createElement('div')
                enemy.classList.add('enemy')
                enemy.innerHTML = object.value
                enemy.style.setProperty('--size', `${object.value * 5}px`)
               object.div.appendChild(enemy)
            }


            object.div.style.top = `${object.y}px`
            gameBoard.appendChild(object.div)
        }
    })
}

function updateObjectsPositions(objects){
    objects.forEach((object) => {
        object.y += 3
        object.div.style.top = `${object.y}px`
    })
}

function addPlayer(){
    players.push({id: players.length + 1})
    setPlayerPosition(players[players.length - 1])
    renderPlayers(players)
    SPAN_X = players.length + 50
    spawnSound.play()
}

const leftBtn = $('.control.left')
const rightBtn = $('.control.right')

function initKeysListeners(){
    window.addEventListener('keydown', (e) => {
        if(e.key === 'ArrowLeft'){
            PLAYERS_MID -= 2
        }else if(e.key === 'ArrowRight'){
            PLAYERS_MID += 2
        }
        renderPlayers(players)
    })
    leftBtn.addEventListener('click', () => {
        PLAYERS_MID -= 10
        renderPlayers(players)
    })
    rightBtn.addEventListener('click', () => {
        PLAYERS_MID += 10
        renderPlayers(players)
    })
    window.addEventListener('resize', () => {
        setTimeout(() => {
            window.location.reload()
        }, 500)
    })
}

let counter = 0

function delectCollision(){
    //get the bottom object
    const bottomObject = objects[0]
    if(!bottomObject) return

    //check if object need to be deleted
    if(bottomObject.y + (playersHeight * 2 - 30) >= boardHeight){
        objects.shift()
        bottomObject.div.remove()
        counter++
        if(counter % 3 === 0){
            const object = {
                type: 'Enemy',
                value: Math.floor(Math.random() * 7) + 7
            }
            objects.push(object)
            setObjectPosition(object, objects.length - 1)
        }else{
            const object = {
                type: 'Math',
            }
            if(Math.random() > 0.5){
                const side1 = (Math.random() * 10) + 5
                const side2 = (Math.random() * 10) + 5
                const first = Math.random() > 0.5 ? 'Add' : 'Subtract'
                const second = first === 'Add' ? 'Subtract' : 'Add'
                object.left = {
                    type: first,
                    value: parseInt(side1),
                    isNegative: first === 'Subtract'
                }
                object.right = {
                    type: second,
                    value: parseInt(side2),
                    isNegative: second === 'Subtract'
                }
            }else{
                const side1 = (Math.random() * 3) + 1
                const side2 = (Math.random() * 2) + 2
                const first = Math.random() > 0.5 ? 'Multiply' : 'Divide'
                const second = first === 'Multiply' ? 'Divide' : 'Multiply'
                object.left = {
                    type: first,
                    value: parseInt(side1),
                    isNegative: first === 'Divide'
                }
                object.right = {
                    type: second,
                    value: parseInt(side2),
                    isNegative: second === 'Divide'
                }
            }
            objects.push(object)
            console.log(object);
            setObjectPosition(object, objects.length - 1)
        }

        //check if object is Math
        if(bottomObject.type === 'Math'){
            const side = PLAYERS_MID < 50 ? 'left' : 'right'
            const currentPlayersCount = players.length
            let finalPlayersCount = 0
            if(bottomObject[side].type === 'Add'){
                finalPlayersCount = currentPlayersCount + bottomObject[side].value
            }else if(bottomObject[side].type === 'Subtract'){
                finalPlayersCount = currentPlayersCount - bottomObject[side].value
            }else if(bottomObject[side].type === 'Multiply'){
                finalPlayersCount = currentPlayersCount * bottomObject[side].value
            }else if(bottomObject[side].type === 'Divide'){
                finalPlayersCount = currentPlayersCount / bottomObject[side].value
            };
            if(finalPlayersCount <= 0){
                gameOver = true
                bgm.pause()
                endSound.play()
                alert('Game Over')
                location.reload()
                return
            }

            //add or remove players
            if(finalPlayersCount > currentPlayersCount){
                for(let i = currentPlayersCount; i < finalPlayersCount; i++){
                    addPlayer()
                }
            }else{
                players.splice(finalPlayersCount)
                renderPlayers(players)
                removeSound.play()
            }
        }else if(bottomObject.type === 'Enemy'){
            const currentPlayersCount = players.length
            const finalPlayersCount = currentPlayersCount - bottomObject.value
            if(finalPlayersCount <= 0){
                gameOver = true
                bgm.pause()
                endSound.play()
                alert('Game Over')
                location.reload()
                return
            }
            players.splice(finalPlayersCount)
            renderPlayers(players)
            removeSound.play()
        }

    }
}


function animate(){
    renderObjects(objects)
    updateObjectsPositions(objects)
    delectCollision()
    if(!gameOver) requestAnimationFrame(animate)
}

function start(){
    setPlayerPositions(players)
    setObjectsPositions(objects)
    renderPlayers(players)
    initKeysListeners()
    animate()
}

start()
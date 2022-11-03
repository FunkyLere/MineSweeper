class Cell{
    static cellsRevealed = 0
    static colors = {1: "blue", 2: "green", 3: "yellow", 4: "#0800A1", 5:"#DB0066", 6:"#30B0B3", 7:"purple", 8:"grey"}
    static cellsExplored = {}
    constructor(xPos, yPos, grid){
        this.xPos = xPos;
        this.yPos = yPos;
        this.grid = grid;
        // Square states: mines, marked, (explored) replaced by mineCount
        this.mine = false;
        this.marked = false;
        this.mineCount = false;
        // Div creation and insertion in the DOM
        this.div = document.createElement("div");
        const body = document.querySelector("body");
        body.insertAdjacentElement("beforeend", this.div)
        this.div.style.left = `${this.xPos*27}px`
        this.div.style.top = `${this.yPos*27}px`
        this.div.addEventListener("mousedown", this.logButtons)
    }
    get getMine(){
        return this.mine;
    }
    set setMine(boolean){
        this.mine = boolean;
    }
    // get getMinesFound(){
    //     return this.minesFound;
    // }
    // set setMinesFound(int){
    //     return this.minesFound = int;
    // }
    logButtons = (e) =>{
        this.div.data = e.buttons
        if(this.div.data === 1){
            this.explore();
        }
        else if(this.div.data === 2){ 
            this.mark();
        }
        else if(this.div.data === 3){
            this.exploreAround()
        }
    }
    explore = () =>{
        if(this.marked === false){
            if(this.getMine === true){
                this.div.style.backgroundColor = "red";
                this.lose()
            }else{
                if(this.mineCount === false){
                    this.div.style.backgroundColor = "#D9D9D9";
                    Cell.cellsRevealed += 1;
                    this.mineCount = 0;
                    // For loops to explore the cells in the range -1/+1 of the cell
                    // in the x and y axis.
                    for(let y = -1; y < 2; y+=1){
                        for(let x = -1; x < 2; x+=1){
                            // If clause for preventing the cell that invokes the function to be checked
                            if(x !== 0 || y !== 0){
                                var tempX = this.xPos+x;
                                var tempY = this.yPos+y;
                                // Clause to not explore cells outside the grid
                                if((tempX >= 0 && tempY >= 0)&&(tempX < this.grid.width && tempY < this.grid.height)){
                                    var temp = this.grid.cellRegister[`${tempX}, ${tempY}`];
                                    if(temp.getMine === true){
                                        this.mineCount += 1
                                    }
                                }
                            }
                        }
                    }
                    if(this.mineCount > 0){
                        this.div.innerText = `${this.mineCount}`;
                        this.div.style.color = Cell.colors[`${this.mineCount}`]
                    }
                }
            }    
        }
        this.checkWin()
    }
    mark = () =>{
        if(this.marked === false && this.mineCount === false){
            this.div.style.backgroundColor = "orange";
            this.marked = true;
        }else if(this.mineCount === false){
            this.div.style.backgroundColor = "grey";
            this.marked = false;
        }  
    }
    exploreAround = () =>{
        // Function for exploring all the cells with no mines around surronding this cell.
        for(let y = -1; y < 2; y+=1){
            // For loops to explore the 8 adjacents cells.
            for(let x = -1; x < 2; x+=1){
                var tempX = this.xPos+x;
                var tempY = this.yPos+y;
                // If clause to prevent from exploring the cell where the method has been called and outside the grid.
                if((x !== 0 || y !== 0)&&(tempX >= 0 && tempY >= 0) && 
                (tempX < this.grid.width && tempY < this.grid.height)){
                    this.grid.cellRegister[`${tempX}, ${tempY}`].explore()
                    // If clause to prevent the recursive call to be exploring the same cells infinitely
                    // by adding the cells explored to a class variable and preventing the function to reexploring them.
                    if(this.grid.cellRegister[`${tempX}, ${tempY}`].mineCount === 0 && 
                    !(Cell.cellsExplored[`${tempX}, ${tempY}`]===true)){
                        Cell.cellsExplored[`${tempX}, ${tempY}`] = true;
                        this.grid.cellRegister[`${tempX}, ${tempY}`].exploreAround()
                    }
                }
            }
        }
    }
    checkWin = () =>{
        if(Cell.cellsRevealed === this.grid.goal){
            // logic gor ending the game winning
            alert("The field is clear, you won!")
        }
    }
    lose = () =>{
        // Logic for ending the game losing
        // Reveal all mines
        for(var y = 0; y < this.grid.height; y +=1){
            for(var x = 0; x < this.grid.width; x +=1){
                if(this.grid.cellRegister[`${x}, ${y}`].getMine=== true){
                    this.grid.cellRegister[`${x}, ${y}`].div.style.backgroundColor = "red";
                }
            }
        }
        // alert("You lost")
    }
}
class Grid{
    constructor(width, height, numMines){
        this.width = width;
        this.height = height;
        this.numMines = numMines;
        this.cellRegister = new Object();
        this.squaresArray = [];
        this.minesArray = [];
        this.goal = this.width * this.height - this.numMines
    }
    get getNumMines(){
        return this.numMines;
    }
    get getSquaresArray(){
        return this.squaresArray;
    } 
    set setSquaresArray(array){
        this.squaresArray = array;
    }
    get getMinesArray(){
        return this.minesArray;
    }
    set setMinesArray(array){
        this.minesArray = array;
    }
    addGrid = (grid) => {
        this.grid = grid
    }
    // Function necesary for sorting numerics arrays
    compareNumbers = (a,b) =>{
        return a - b;
    }
    seedMines = () =>{
        // Here we build two arrays to randomly select {numMines} squares to be mined
        // First we create an array with a number corresponding with every square
        for(let i = 0; i < this.height*this.width; i++){
            this.squaresArray.push(i)
            // temp = this.getSquaresArray;
            // temp.push(i);
            // this.setSquaresArray = temp;
        }
        // We select as many squares as mines are from the squares array
        // and we remove them from the squares array.
        for(let i = 0; i < this.getNumMines; ++i){
            var selected = Math.floor(Math.random()*this.squaresArray.length);
            var temp = this.squaresArray.splice(selected,1)
            // We add them to the minesArray
            this.minesArray.push(temp.pop());            
        }
        this.minesArray.sort(this.compareNumbers)
    }
    drawGrid = ()=> {
        var counter = 0
        for(let y = 0; y < this.height; y++){
            for(let x = 0; x < this.width; x++){
                this.cellRegister[`${x}, ${y}`] = new Cell(x, y, this.grid)
                if(counter === this.minesArray[0]){
                    this.cellRegister[`${x}, ${y}`].setMine = true;
                    counter +=1;
                    this.minesArray.shift()
                }else{
                    counter +=1;
                }
            }
        }
    }
}
createButtons = () =>{

    const body = document.querySelector("body");
    var header = document.createElement("header");
    body.insertAdjacentElement("afterbegin", header)

    var easy = document.createElement("button");
    easy.className = "easyButton";
    easy.innerText = "Easy";
    easy.addEventListener("click", startEasy);
    header.insertAdjacentElement("beforeend", easy);

    var medium = document.createElement("button");
    medium.className = "mediumButton";
    medium.innerText = "Medium";
    medium.addEventListener("click", startMedium);
    header.insertAdjacentElement("beforeend", medium);

    var hard = document.createElement("button");
    hard.className = "hardButton";
    hard.innerText = "Hard";
    hard.addEventListener("click", startHard);
    header.insertAdjacentElement("beforeend", hard);
}
startGame = (width, height, mines) =>{
    var field = new Grid(width, height, mines);
    field.addGrid(field);
    field.seedMines();
    field.drawGrid();
}
resetGame = () =>{
    // Remove all the div and create buttons again
    document.body.innerHTML = ""
    createButtons()
    // Reset Cell.cellRevealed and Cell.cellExplored.
    Cell.cellsExplored = {}
    Cell.cellsRevealed = 0
}
startEasy = () =>{
    resetGame();
    startGame(8, 8, 8);
}
startMedium = () =>{
    resetGame();
    startGame(14, 10, 26);
}
startHard = () =>{
    resetGame();
    startGame(18, 12, 48);
}
window.onload = function init(){

createButtons()

}
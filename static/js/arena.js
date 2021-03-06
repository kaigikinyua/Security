const baseURL="https://antonytictac.herokuapp.com/"

var socket=io.connect(baseURL)

//board-data
const board=document.getElementById('board')
var char=localStorage.getItem("pawn")
var played=[]

setUpBoard()

//setting up board
function setUpBoard(){
    for(var i=9;i>0;i--){
        var button=document.createElement("button")
        button.classList.add("box")
        button.dataset.btnum=i
        button.id=i
        button.addEventListener("click",(e)=>{
            //console.log(e.target.dataset.btnum)
            play(e.target.dataset.btnum)
        })
        board.appendChild(button)
    }
    socket.emit("joinarena",{"id":localStorage.getItem("matchid"),"userid":localStorage.getItem("id"),"username":localStorage.getItem("username")})
    if(localStorage.getItem("matchid")==localStorage.getItem("id")){
        setUpData(localStorage.getItem("oponentname"),localStorage.getItem("oponentid"))
        myTurn()
    }else{
        oponentTurn()
        setUpData(localStorage.getItem("oponentname"),localStorage.getItem("oponentid"))
    }
}

function setUpData(oponentname,oponentid){
    var oponent_name=document.getElementById("oponentname")
    var username_dom=document.getElementById("username")
    var handle_name=document.getElementById("handle")
    handle_name.innerHTML=oponentname
    oponent_name.innerHTML=oponentname
    username_dom.innerHTML=localStorage.getItem("username")
}



function play(number){
    var button=document.getElementById(number)
    button.innerHTML=char
    button.disabled=true
    played.push(number)
    socket.emit("play",{"id":localStorage.getItem("matchid"),"boxnum":number})
    oponentTurn()
    matchEnded()
}
//receiving oponents move
socket.on("oponent",(data)=>{
        played.push(data.played);
        var antiChar=""
        if(char=="x"){antiChar="o"}
        else{antiChar="x"}
        var btn=document.getElementById(data.played)
        btn.innerHTML=antiChar
        myTurn()
        matchEnded()
    }
);
socket.on("arenadata",(data)=>{
    //localStorage.setItem("oponentname",data.oponentname)
    //localStorage.setItem("oponentid",data.oponentid)
    setUpData(data.oponentname,data.oponentid)
    console.log(data)
})

function myTurn(){
    var buttons=document.querySelectorAll(".box")
    buttons.forEach(button=>{
        button.disabled=false
        played.forEach(p=>{
            if(p==button.id){
                button.disabled=true
            }
        })
    })
}
function oponentTurn(){
    var buttons=document.querySelectorAll(".box")
    buttons.forEach(button=>{
        button.disabled=true
    })
}

function endGame(message,mode){
    var message_board=document.createElement("div")
    var image=document.createElement("img")
    image.classList.add("image")
    message_board.classList.add("endGame")
    message_board.innerHTML=message
    var color="";
    switch (mode) {
        case 0:
            color="lightgreen"
            image.src="/static/images/winner.svg"
            break;
        case 1:
            color="cyan"
            image.src="/static/images/looser.svg"
            break;
        case 2:
            color="lightseagreen"
            break;
    }
    message_board.style.color=color
    message_board.appendChild(image)
    board.appendChild(message_board)
}

function  matchEnded() {
    var match_ended=checkBoard()
    console.log(match_ended)
    if(match_ended!=false){
        console.log("Match__ended")
        oponentTurn()
        switch (match_ended) {
            case "Tie":
                endGame("Game Tied",2)
                break;
            case "Won":
                endGame("You won!!!",0)
                break;
            case "Lost":
                endGame("You lost",1)
                break;
        }
        return true;
    }
    return false;
}

function checkBoard(){
    var vert=verticalCheck()
    var hor=horizontalCheck()
    var diag=diagonal()
    var check=[vert,hor,diag]
    console.log(check)

    if(vert!=false || hor!=false || diag!=false){
        console.log("one side won")
        var vert=verticalCheck()
        var hor=horizontalCheck()
        var diag=diagonal()
        var check=[vert,hor,diag]
        var side_won="";
        check.forEach(c=>{
            if(c!=false){
                console.log(c)
                side_won=c
            }
        })
        return side_won;
    }else{
        if(played.length==9){
            return "Tie";
        }
    }
    return false;
}
//cheking if player has won
function verticalCheck(){
    var buttons=document.querySelectorAll(".box")
    var col1=tick_tack_toe(buttons[8],buttons[5],buttons[2])
    var col2=tick_tack_toe(buttons[7],buttons[4],buttons[1])
    var col3=tick_tack_toe(buttons[6],buttons[3],buttons[0])
    var colums=[col1,col2,col3]
    var end=false
    colums.forEach(col=>{
        if(col!=false){
            console.log(col+" vertical")
            end=col
        }
    })
    return end;
}

function horizontalCheck(){
    var buttons=document.querySelectorAll(".box")
    var col1=tick_tack_toe(buttons[8],buttons[7],buttons[6])
    var col2=tick_tack_toe(buttons[5],buttons[4],buttons[3])
    var col3=tick_tack_toe(buttons[2],buttons[1],buttons[0])
    var colums=[col1,col2,col3]
    var end=false
    colums.forEach(col=>{
        if(col!=false){
            console.log(col+" horizontal")
            end=col
        }
    })
    return end;
}

function diagonal(){
    var buttons=document.querySelectorAll(".box")
    var col1=tick_tack_toe(buttons[8],buttons[4],buttons[0])
    var col2=tick_tack_toe(buttons[6],buttons[4],buttons[2])
    var colums=[col1,col2]
    var end=false
    colums.forEach(col=>{
        if(col!=false){
            console.log(col+" diagonal")
            end=col
        }
    })
    return end;
}

function tick_tack_toe(one,two,three){
    var arr=[one,two,three]
    arr.forEach(elem=>{
        if(elem.innerHTML.length==0 && elem.innerHTML==undefined){
            return false;
        }
    })
    var antiChar="";
    if(char=="x"){
        antiChar="o"
    }else{
        antiChar="x"
    }
    if(one.innerHTML==char && two.innerHTML==char && three.innerHTML==char){
        return "Won";
    }else if(one.innerHTML==antiChar && two.innerHTML==antiChar && three.innerHTML==antiChar){
        return "Lost";
    }else{
        return false;
    }
}



//messaging
var input=document.getElementById("input")
input.addEventListener('keydown',(e)=>{
    socket.emit("typing",{"id":localStorage.getItem("matchid"),"username":localStorage.getItem("username")})
})

socket.on("typing",(data)=>{
    var status=document.getElementById("status")
    status.innerHTML=data.username+" is typing"
})

function sendMessage(){
    var message=document.getElementById("input").value;
    if(message.length>0){
        socket.emit("sendmessage",{"id":localStorage.getItem("matchid"),"message":message})
        var messages=document.getElementById("messages")
        var newMessage=document.createElement("div")
        newMessage.classList.add("message")
        newMessage.classList.add("m_right")
        newMessage.innerHTML="<p class='text_bubble right'>"+message+"</p>"
        messages.appendChild(newMessage)
        message.innerHTML=""
    }
}
socket.on("message",(data)=>{
    var messages=document.getElementById("messages")
    var newMessage=document.createElement("div")
    newMessage.classList.add("message")
    newMessage.classList.add("m_left")
    newMessage.innerHTML="<p class='text_bubble left'>"+data.message+"</p>"
    messages.appendChild(newMessage)
    var status=document.getElementById("status")
    status.innerHTML=""
})
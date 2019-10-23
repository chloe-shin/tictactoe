import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, FormControl, Form, Button, Nav, Container, Row, Col, Jumbotron } from 'react-bootstrap'
import FacebookLogin from 'react-facebook-login'

function App() {

  const [board, setBoard] = useState(new Array(9).fill(null))
  const [isOver, setIsOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [topScores, setTopScores] = useState ([]);

  const resetGame = () => {
    setBoard(new Array(9).fill(null))
    setIsOver(false)
    setWinner(null)
  }


  useEffect (() => {
  getData()
  }, [] )

  const responseFromFB = (resp) => {
    console.log('resp element i got from FacebookLogin() is', resp)
    setCurrentUser ({
      name: resp.name,
      email: resp.email
    })
  }

  
  const getData = async() => {
    const url = `https://ftw-highscores.herokuapp.com/tictactoe-dev`
    const response = await fetch(url)
    const data = await response.json()
    setTopScores(data.items) 
    console.log ('this is data', data)
    console.log ('this is topscores', topScores)
  }

  const postScore = async() => {

    let data = new URLSearchParams();
    data.append("player", currentUser.name );
    data.append("score", -Infinity);
    console.log ('data', data)
    console.log ('data.string', data.toString())
    
    const url = `https://ftw-highscores.herokuapp.com/tictactoe-dev`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: data.toString()
      // json: true
    });
    console.log('hhh', response) // raw response from api
    const resp = await response.json()  //parsed version of res
    console.log ('this is the resp=await.response.json', resp);
    if (resp.success===true)
    getData() // get updaTED Data
  }




  return (
    <div className="App">
 
      <Navbar bg="#F2EBD3" variant="dark" className="nav"> 
        <Navbar.Brand href="#home">TIC TAC TOE</Navbar.Brand>
        <Nav className="mr-auto">
          <Nav.Link href="#home">Home</Nav.Link>
          <Nav.Link href="#features">Features</Nav.Link>
        </Nav>
        <Form inline>
          <FormControl type="text" placeholder="User ID" className="mr-sm-2 userName" />
          <Button variant="outline-info" className="login">Log In</Button>
        </Form>
      </Navbar>


      <Container Fluid>
        <Row className="justify-content-md-center">
          <Col md={12} className="gameCol">
            <div className="game">
              { !currentUser ? 
              <FacebookLogin
                autoLoad={false}
                appId="2779398485412282" //I should get my id
                fields="name,email,picture"
                callback={(resp) => responseFromFB(resp)}
              />
              : 
              <>
              <p className="title"> Welcome {currentUser.name}! <br />Let's start game  </p>
              <span> {board.filter((el) => !el).length % 2 ? "X" : "O"} Turn </span>
              <Board
                board={board}
                setBoard={setBoard}
                isOver={isOver}
                setIsOver={setIsOver}
                winner={winner}
                setWinner={setWinner}
                postScore = {postScore} />

              <div className="outCome">
                {isOver ? 
                
                  <span>
                  {winner ? <span> GAME IS OVER <br /> {winner}  wins! </span>
                          : <span> GAME IS OVER <br /> Draw! </span>} 

                  <div className = "TopScore"> <h6> TOP SCORES </h6>
                  {topScores.map ((el)=> <li> {el.player}, {el.score} </li>)} 
                  </div>  
                          
                  </span>
                         
                  : ''}

              </div>
              <Button className="reset" variant="outline-info" onClick={() => resetGame()}> RESET GAME </Button>   
                           
              </>
              }

             
            </div>
          </Col>
        </Row>
      </Container>

    </div>
  );
}

function Board(props) {
  const handleClick = (idx) => {
    if (props.isOver) return
    let board = props.board.slice() //Slice means copy board array to use this in this function.
    let check = board.filter((el) => !el) //=== el is null (el값이 null인값을 필터하라)). //즉, check는 클릭 되지 않은, null값을 가진 element들.

    console.log("let board", board)//board는 복사된 board array
    console.log("let check", check) //check는 변환되지 않은 null값의 나머지 element들

    if (board[idx]) return
    board[idx] = check.length % 2 ? "X" : "O" //board array의 id번째 element를 x 혹은 o로 변환하라. //if even number = 'X', if odd number = 'O' 로 변환하라.

    //id === props.id (onClick에 지정) 
    //[id] 는 유저가 square 를 클릭할때 값이 지정됨. 유저가 클릭한 square 의 index값임. 
    //[id] is equal to "props.id" which we set as index of the board
    //[id] 는 board 배열의 인덱스값임. 

    if (board.filter((el) => el === null).length === 0)//board 배열중 null값 배열만 필터 => null 배열의 length가 0이면. 즉, array에 null값이 없고 모든값이 다 차면.
    {
      props.setIsOver(true)
    } //배열에 값이 다 찼을때 isOver의 값(초기값 false)을 true로 지정하라.

    props.setBoard(board) //board배열에 결과를 반영, 셋업. setBoard는 board 배열을 셋업하는 function. 

    if (decideOutcome(board) != null) // 만약 decideOutcome function이 true면.
    // if decideOutcome(board) = X or O then (decideOutcome(board)) is truethy , if decideOutcome(board) = null , then it is false.

    {
      props.setWinner(decideOutcome(board)) //winner에 dicideOutcome의 return값을 업데이트 하라. 
      props.setIsOver(true)
      props.postScore()
    } //게임이끝나도록 하라.

  }

  return (
    <div className="board">
      {props.board.map((el, idx) => { return <Square value={el} id={idx} handleClick={handleClick} /> })}
    </div>
  )
}

const decideOutcome = (board) => {
  //set winning cases
  const winningCases = [ //이길 수 있는 경우의 배열을 지정.
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [2, 4, 6],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8]
  ]
  //For구문을 이용하여 Compare the value of board to each of the cases
  for (let i = 0; i < winningCases.length; i++) {
    //index 0부터 index winningCases 배열의.length 개수(8)까지 계속해서 비교하라. 
    //예) i==index가 0일때 [a,b,c]를 winningCases[0]== [0,1,2]과 비교하라. 즉. winningCases의 전체배열과 계속해서 비교하라.
    let [a, b, c] = winningCases[i] //[a,b,c]배열의 값을 winningCases[i]의 배열이 되도록 하라.
    //a= winningCases[i][0] / b= winningCases[i][1] / c= winningCases[i][2]
    console.log('board is', board)
    console.log('winningCases is', winningCases)
    console.log('[a,b,c] is', [a, b, c])
    console.log('board[a] is', board[a], 'it means board[winningCases[i][0]]', board[winningCases[i][0]])
    console.log('board[b] is', board[b], 'it means board[winningCases[i][1]]', board[winningCases[i][1]])
    console.log('board[c] is', board[c], 'it means board[winningCases[i][2]]', board[winningCases[i][2]])
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      //a는 WinningCases 배열 중 i번째의 index[0]값. board[a]는 board배열의 a번째 값.
      //b는 WinningCases 배열 중 i번째의 index[0]값. board[b]는 board배열의 b번째 값.
      //c는 WinningCases 배열 중 i번째의 index[0]값. board[c]는 board배열의 c번째 값.
      return board[a]
  }
  return null
}


//**Tic Tac Toe index 배열
//0 1 2 
//3 4 5
//6 7 8


function Square(props) {
  return (
    <div className="square" onClick={() => props.handleClick(props.id)}>
      <div className={props.value}> {props.value} </div>
    </div>
  )
}



export default App;

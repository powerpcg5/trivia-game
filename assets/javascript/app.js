 //////////////////////////////////////////////////////////////////////////////
 // trivia-game/assets/javascript/app.js
 // Trivia game using JavaScript timers (and Open Trivia Database API)
 //
 // 2339 Thursday, 14 March 2019 (EDT) [17969]
 //
 // University of Richmond Coding Boot Camp run by Trilogy Education Services
 // Austin Kim
 //
 // Modified:
 //   0006 Friday, 15 March 2019 (EDT) [17970]
 //   0325 Saturday, 16 March 2019 (EDT) [17971]
 //   0601 Sunday, 17 March 2019 (EDT) [17972]
 //   2353 Monday, 18 March 2019 (EDT) [17973]
 //   0128 Tuesday, 19 March 2019 (EDT) [17974]
 //////////////////////////////////////////////////////////////////////////////

 // GLOBAL PARAMETERS, VARIABLES, AND OBJECTS

 // Game parameters (initialized to defaults)
var questions = 10                       // Number of questions per game
var category = 0                         // Question category (0 for none)
var difficulty = ''                      // Level of difficulty (empty for none)
var type = ''                            // Question type (empty for none)
var timeout = 30                         // Question timeout (in seconds)
var delay = 5000                         // Delay (in ms) before next question

 // Player names
var player1, player2

 // Player scores
var score = {
  p1: 0,
  p2: 0}

 // Which player went first in the most recent game
var whoWentFirst = 0                     // 0 = no one (this is the first game)
                                         // 1 = player 1; 2 = player 2
// Is game over (or not started)
var gameOver = true

 // JavaScript timers
var intervalTimer                        // Timer for question interval timer
var timeoutTimer                         // Timer for delay between questions

 // Flag for case where _Instructions_ or _Settings_ is clicked during delay
var InstructionsOrSettingsClicked = false

 // GAME OBJECT STATES:
 //   Not started/game over:   gameOver = true
 //   Running:                 gameOver = false, countdown != 0, paused = false
 //   Paused:                  gameOver = false, countdown != 0, paused = true
 //   Delay between questions: gameOver = false, countdown = 0
var game = {
   // Game-wide member variables
  p1points: 0,                           // Player 1's points
  p2points: 0,                           // Player 2's points
  turn: 0,                               // Player turn (1 = pl. 1, 2 = pl. 2)
  results: [],                           // Trivia questions for game
  question: 0,                           // Question no.
  countdown: 0,                          // Seconds left to answer question
  paused: false,                         // Game is paused

   // Per-question variables
  categoryName: '',                      // Category name
  pQuestion: '',                         // Trivia question
  numAnswers: 0,                         // The number of possible answers
  pAnswer0: '',                          // Answer (A.)
  pAnswer1: '',                          // Answer (B.)
  pAnswer2: '',                          // Answer (C.)
  pAnswer3: '',                          // Answer (D.)
  pCorrect: 0,                           // Correct answer (0=A, 1=B, 2=C, 3=D)

 // init() method:  Initialize game
  init() {
   // Reset player points for this game
    this.p2points = this.p1points = 0
    this.updatePoints()
   // Initialize player turn
     // If this be the first game, toss a coin
    if (whoWentFirst === 0) this.turn = Math.floor(2 * Math.random()) + 1
     // Otherwise, alternate
      else this.turn = 3 - whoWentFirst
    whoWentFirst = this.turn
   // Get trivia questions for game
    var queryURL = `https://opentdb.com/api.php?amount=${questions}`
    if (category !== 0) queryURL += `&category=${category}`
    if (difficulty !== '') queryURL += `&difficulty=${difficulty}`
    if (type !== '') queryURL += `&type=${type}`
   // Debug
    console.log(`queryURL:  ${queryURL}`)
   // API call
    $.ajax({url: queryURL, method: 'GET'}).then(function(response) {
      if (response.response_code !== 0) {
        $('#category').text(`Error: response_code = ${response.response_code}`)
        gameOver = true}
        else {
          game.results = response.results
         // Get first question
          game.question = 0              // Reset question no.
          game.getQuestion()
         // Transition to running state
          gameOver = false
          game.countdown = timeout       // game.countdown === timeout tells
          game.displayProgress()         //   displayProgress() to create p. bar
          game.paused = false
         // Start interval timer
          intervalTimer = setInterval(countdownFunction, 1000)}
      })
    return},

 // updatePoints() method:  Update players' points on page
  updatePoints() {
    $('#p1points').text(this.p1points)
    $('#p2points').text(this.p2points)
    return},

 // getQuestion() method:  Get next trivia question
  getQuestion() {
    var result = this.results[this.question]
    this.categoryName = result.category
    this.pQuestion = result.question
    if (result.type === 'boolean') {
      this.numAnswers = 2
      this.pAnswer0 = 'True'
      this.pAnswer1 = 'False'
      if (result.correct_answer === 'True') this.pCorrect = 0
        else this.pCorrect = 1}
      else {
        this.numAnswers = 1 + result.incorrect_answers.length
        var answerArray = [{answer: result.correct_answer, correct: true}]
        for (var i = 0; i !== result.incorrect_answers.length; ++i)
          answerArray.push({answer: result.incorrect_answers[i],
            correct: false})
        var index
       // Set answer (A.)
        index = Math.floor(answerArray.length * Math.random())
        this.pAnswer0 = answerArray[index].answer
        if (answerArray[index].correct) this.pCorrect = 0
        this.numAnswers = 1
        answerArray.splice(index, 1)
       // Set answer (B.)
        index = Math.floor(answerArray.length * Math.random())
        this.pAnswer1 = answerArray[index].answer
        if (answerArray[index].correct) this.pCorrect = 1
        this.numAnswers = 2
        answerArray.splice(index, 1)
       // Set answer (C.)
        if (answerArray.length >= 1) {
          index = Math.floor(answerArray.length * Math.random())
          this.pAnswer2 = answerArray[index].answer
          if (answerArray[index].correct) this.pCorrect = 2
          ++this.numAnswers
          answerArray.splice(index, 1)
       // Set answer (D.)
          if (answerArray.length >= 1) {
            index = Math.floor(answerArray.length * Math.random())
            this.pAnswer3 = answerArray[index].answer
            if (answerArray[index].correct) this.pCorrect = 3
            ++this.numAnswers
            answerArray.splice(index, 1)}
          }
        }
    this.displayQuestion()
    return},

 // displayQuestion() method:  Display trivia question
  displayQuestion() {
    $('#category').text(`Category:  ${this.categoryName}`)
    if (this.turn === 1) {
      $('#p1question').html(this.pQuestion)
      $('#p1answer0').html(`(A.)  ${this.pAnswer0}`)
      $('#p1answer0').removeClass('incorrect correct')
      $('#p1answer1').html(`(B.)  ${this.pAnswer1}`)
      $('#p1answer1').removeClass('incorrect correct')
      if (this.numAnswers >= 3) {
        $('#p1answer2').html(`(C.)  ${this.pAnswer2}`)
        $('#p1answer2').removeClass('incorrect correct')}
        else $('#p1answer2').empty()
      if (this.numAnswers >= 4) {
        $('#p1answer3').html(`(D.)  ${this.pAnswer3}`)
        $('#p1answer3').removeClass('incorrect correct')}
        else $('#p1answer3').empty()
      $('#p2question').empty()
      $('#p2answer0').empty()
      $('#p2answer1').empty()
      $('#p2answer2').empty()
      $('#p2answer3').empty()}
      else {
        $('#p2question').html(this.pQuestion)
        $('#p2answer0').html(`(A.)  ${this.pAnswer0}`)
        $('#p2answer0').removeClass('incorrect correct')
        $('#p2answer1').html(`(B.)  ${this.pAnswer1}`)
        $('#p2answer1').removeClass('incorrect correct')
        if (this.numAnswers >= 3) {
          $('#p2answer2').html(`(C.)  ${this.pAnswer2}`)
          $('#p2answer2').removeClass('incorrect correct')}
          else $('#p2answer2').empty()
        if (this.numAnswers >= 4) {
          $('#p2answer3').html(`(D.)  ${this.pAnswer3}`)
          $('#p2answer3').removeClass('incorrect correct')}
          else $('#p2answer3').empty()
        $('#p1question').empty()
        $('#p1answer0').empty()
        $('#p1answer1').empty()
        $('#p1answer2').empty()
        $('#p1answer3').empty()}
    return},

 // displayProgress():   Display countdown progress bar
 //   If game.countdown === timeout, we need to (re)create a new progress bar;
 //     otherwise, the progress bar should already be present
  displayProgress() {
    var progress, progressBar
    if (this.countdown === timeout) {
      $('#p1status').empty()
      $('#p2status').empty()
      progress = $('<div>')
      progress.addClass('progress')
      progressBar = $('<div>')
      progressBar.addClass('progress-bar progress-bar-striped')
      progressBar.addClass('progress-bar-animated')
      progressBar.attr('role', 'progressbar')
      progressBar.attr('aria-valuemin', '0')
      progressBar.attr('aria-valuemax', '100')
      progress.append(progressBar)
      if (this.turn === 1) $('#p1status').append(progress)
        else $('#p2status').append(progress)}
    var percent = Math.round(100 * this.countdown / timeout)
    $('.progress-bar').attr('aria-valuenow', percent.toString())
    $('.progress-bar').css('width', `${percent}%`)
    $('.progress-bar').text(`${this.countdown} sec.`)
    return}

  } // game object

 // GLOBAL FUNCTIONS

 // Global resetAll() function (called at beginning and when button is pressed)
function resetAll() {
  gameOver = true
   // Set player 1 name
  var playername = document.getElementById('player1name')
  var player = document.getElementById('player1')
  if (playername.value  === '') player1 = 'Player 1'
    else player1 = playername.value
  player.textContent = player1
   // Set player 2 name
  playername = document.getElementById('player2name')
  player = document.getElementById('player2')
  if (playername.value === '') player2 = 'Player 2'
    else player2 = playername.value
  player.textContent = player2
   // Reset scores
  score.p2 = score.p1 = 0
  var scorediv = document.getElementById('p1score')
  scorediv.textContent = score.p1
  scorediv = document.getElementById('p2score')
  scorediv.textContent = score.p2
   // Initialize game
  game.init()
  return}

 // Global updateScore() function to update players' scores on page
function updateScore() {
  var element = document.getElementById('p1score')
  element.textContent = score.p1.toString()
  element = document.getElementById('p2score')
  element.textContent = score.p2.toString()
  return}

 // Global countdownFunction() called every second by the interval timer
function countdownFunction() {
  if (--game.countdown === 0) {
    clearInterval(intervalTimer)
    if (game.turn === 1) {
      $('#p1status').empty()
      $('#p1status').removeClass('correct')
      $('#p1status').text('Time')
      $('#p1status').addClass('incorrect')}
      else {
        $('#p2status').empty()
        $('#p2status').removeClass('correct')
        $('#p2status').text('Time')
        $('#p2status').addClass('incorrect')}
    switch (game.pCorrect) {
      case 0:
        game.turn === 1 ? $('#p1answer0').addClass('correct')
                        : $('#p2answer0').addClass('correct')
        break
      case 1:
        game.turn === 1 ? $('#p1answer1').addClass('correct')
                        : $('#p2answer1').addClass('correct')
        break
      case 2:
        game.turn === 1 ? $('#p1answer2').addClass('correct')
                        : $('#p2answer2').addClass('correct')
        break
      case 3:
        game.turn === 1 ? $('#p1answer3').addClass('correct')
                        : $('#p2answer3').addClass('correct')
        }
   // Delay before advancing to next question
    timeoutTimer = setTimeout(timeoutFunction, delay)}
    else game.displayProgress()
  return}

 // Global timeoutFunction() called by setTimeout() after the delay
function timeoutFunction() {
  clearTimeout(timeoutTimer)
  if (++game.question === questions) {
    if (game.p1points > game.p2points) {
      $('#p1status').removeClass('incorrect')
      $('#p1status').text('You win')
      $('#p1status').addClass('correct')
      $('#p2status').empty()
      ++score.p1}
      else if (game.p2points > game.p1points) {
        $('#p2status').removeClass('incorrect')
        $('#p2status').text('You win')
        $('#p2status').addClass('correct')
        $('#p1status').empty()
        ++score.p2}
        else {
          $('#p1status').removeClass('incorrect correct')
          $('#p1status').text('You tie')
          $('#p2status').removeClass('incorrect correct')
          $('#p2status').text('You tie')
          score.p1 += 0.5
          score.p2 += 0.5}
    updateScore()
    gameOver = true}
    else {
     // Unhighlight all answers
      if (game.turn === 1) {
        $('#p1answer0').removeClass('correct incorrect')
        $('#p1answer1').removeClass('correct incorrect')
        $('#p1answer2').removeClass('correct incorrect')
        $('#p1answer3').removeClass('correct incorrect')
        $('#p1status').empty()}
        else {
          $('#p2answer0').removeClass('correct incorrect')
          $('#p2answer1').removeClass('correct incorrect')
          $('#p2answer2').removeClass('correct incorrect')
          $('#p2answer3').removeClass('correct incorrect')
          $('#p2status').empty()}
      game.turn = 3 - game.turn
     // Get next question
      game.getQuestion()
     // Transition to running state
      game.countdown = timeout           // game.countdown === timeout tells
      game.displayProgress()             //   displayProgress() to create p. bar
     // Handle case where _Instructinos_ or _Settings_ was clicked during delay
      if (InstructionsOrSettingsClicked) {
       // Pause game
        $('#pause').removeClass('btn-outline-warning')
        $('#pause').text('Unpause Game')
        $('#pause').addClass('btn-warning')
        game.paused = true}
        else {
         // Start interval timer
          intervalTimer = setInterval(countdownFunction, 1000)
          game.paused = false}
      }
  InstructionsOrSettingsClicked = false
  return}

 // MODAL CALLBACK FUNCTIONS

 // If _Reset All_ be clicked, stop any currently playing game
$('#resetAll').click(function() {
   // Clear all timers
  clearInterval(intervalTimer)
  clearTimeout(timeoutTimer)
   // Unpause game if paused
  $('#pause').removeClass('btn-warning')
  $('#pause').text('Pause Game')
  $('#pause').addClass('btn-outline-warning')
   // Remove any progress bars
  $('#p1status').empty()
  $('#p2status').empty()
   // Stop game
  gameOver = true
  return}
  )

 // Likewise, if _New Game_ be clicked, stop any currently playing game
$('#newGame').click(function() {
   // Clear all timers
  clearInterval(intervalTimer)
  clearTimeout(timeoutTimer)
   // Unpause game if paused
  $('#pause').removeClass('btn-warning')
  $('#pause').text('Pause Game')
  $('#pause').addClass('btn-outline-warning')
   // Remove any progress bars
  $('#p1status').empty()
  $('#p2status').empty()
   // Stop game
  gameOver = true
   // Initialize game
  game.init()
  return}
  )

 // If _Pause Game_ be clicked, toggle game.paused and suspend/reactivate timers
$('#pause').click(function() {
   // _Pause Game_ has no effect during the delay between questions
  if (!gameOver && game.countdown !== 0) {
    if (!game.paused) {
     // Pause game
      clearInterval(intervalTimer)
      $('.progress-bar').removeClass('progress-bar-animated')
      $('#pause').removeClass('btn-outline-warning')
      $('#pause').text('Unpause Game')
      $('#pause').addClass('btn-warning')
      game.paused = true}
      else {
     // Unpause game
        $('#pause').removeClass('btn-warning')
        $('#pause').text('Pause Game')
        $('#pause').addClass('btn-outline-warning')
        $('.progress-bar').addClass('progress-bar-animated')
        intervalTimer = setInterval(countdownFunction, 1000)
        game.paused = false}
    }
  return}
  )

 // If _Instructions_ be clicked, also pause the game (if running)
 // If _Instructions_ be clicked during the delay between questions, raise the
 //   _InstructionsOrSettingsClicked_ flag, which will pause after the timeout
$('#instructions').click(function() {
  if (!gameOver && game.countdown !== 0 && !game.paused) {
   // Pause game
    clearInterval(intervalTimer)
    $('.progress-bar').removeClass('progress-bar-animated')
    $('#pause').removeClass('btn-outline-warning')
    $('#pause').text('Unpause Game')
    $('#pause').addClass('btn-warning')
    game.paused = true}
    else if (!gameOver && game.countdown === 0)
      InstructionsOrSettingsClicked = true
  return}
  )

 // If _Settings_ be clicked, also pause the game (if running)
 // If _Settings_ be clicked during the delay between questions, raise the
 //   _InstructionsOrSettingsClicked_ flag, which will pause after the timeout
$('#settings').click(function() {
  if (!gameOver && game.countdown !== 0 && !game.paused) {
   // Pause game
    clearInterval(intervalTimer)
    $('.progress-bar').removeClass('progress-bar-animated')
    $('#pause').removeClass('btn-outline-warning')
    $('#pause').text('Unpause Game')
    $('#pause').addClass('btn-warning')
    game.paused = true}
    else if (!gameOver && game.countdown === 0)
      InstructionsOrSettingsClicked = true
  return}
  )

 // When the reset modal is activated, autofocus on the player name input field
$('#resetModal').on('shown.bs.modal', function() {
  $('#player1name').trigger('focus')
  return}
  )

 // This callback function is called when a user clicks on _OK_ in the player-
 //   name-setting reset modal, which will start the game
$('#resetModalOK').click(function() {
  resetAll()
  return}
  )

 // When the settings modal is activated, autofocus on the first input field
$('#settingsModal').on('shown.bs.modal', function() {
  $('#questions').trigger('focus')
  return}
  )

 // This function is called when a user clicks on _OK_ in the settings modal
$('#settingsModalOK').click(function() {
   // String and number variables for validation
  var value, number
   // Get number of questions per game
  value = $('#questions').val()
  if (value === '') number = questions
    else number = parseInt(value)
   // Validate number of questions
  if (isNaN(number)) $('#invalidQuestionsModal').modal('show')
    else if (number < 2 || number > 50 || number % 2 !== 0)
      $('#invalidQuestionsModal').modal('show')
      else {
        questions = number
   // Get question category
        value = $('#questionCategory').val()
        if (value === '') number = 0
          else number = parseInt(value)
   // Validate question category
        if (isNaN(number)) number = 0
          else if (number < 9 || number > 32) number = 0
            else category = number
   // Get difficulty level
        value = $('#difficulty').val()
        if (value === 'easy' || value === 'medium' || value === 'hard')
          difficulty = value
          else difficulty = ''
   // Get question type
        value = $('#type').val()
        if (value === 'multiple' || value === 'boolean') type = value
          else type = ''
   // Get timeout duration for each question in seconds
        value = $('#timeout').val()
        if (value === '') number = timeout
          else number = parseInt(value)
   // Validate timeout duration for each question
        if (isNaN(number)) $('#invalidTimeoutModal').modal('show')
          else if (number < 1) $('#invalidTimeoutModal').modal('show')
            else {
              timeout = number
   // Finally, update the instructions with these new numbers
              var instructions = 'Enter your player names (or click on ' +
                'Cancel to accept the defaults); then take turns answering ' +
                'the timed questions using either your mouse (or other ' +
                'pointing device), or using your keyboard (type ' +
                '<code>A</code>&mdash;<code>D</code> to select answers ' +
                'A.&mdash;D., respectively).  You have ' + timeout.toString() +
                (timeout === 1 ? ' second ' : ' seconds ') +
                'to answer each question.  Every correctly answered ' +
                'question awards one point; whoever finishes the game with ' +
                'the most points wins the game.'
              $('#instructionsText').html(instructions)}
        }
  return}
  )

 // This function is called when a user clicks on _OK_ in the invalid questions
 //   modal
$('#invalidQuestionsOK').click(function() {
   // Return to settings modal
  $('#settingsModal').modal('show')
  return}
  )

 // This function is called when a user clicks on _OK_ in the invalid timeout
 //   modal
$('#invalidTimeoutOK').click(function() {
   // Return to settings modal
  $('#settingsModal').modal('show')
  return}
  )

 // These functions are called when a user clicks on the corresponding answer
 //   fields
$('#p1answer0').click(function() {
  selectAnswer(1, 0)
  return}
  )
$('#p1answer1').click(function() {
  selectAnswer(1, 1)
  return}
  )
$('#p1answer2').click(function() {
  selectAnswer(1, 2)
  return}
  )
$('#p1answer3').click(function() {
  selectAnswer(1, 3)
  return}
  )
$('#p2answer0').click(function() {
  selectAnswer(2, 0)
  return}
  )
$('#p2answer1').click(function() {
  selectAnswer(2, 1)
  return}
  )
$('#p2answer2').click(function() {
  selectAnswer(2, 2)
  return}
  )
$('#p2answer3').click(function() {
  selectAnswer(2, 3)
  return}
  )

 // This function is called when a key is pressed
$(document).keyup(function(event) {
  var key = event.key.toUpperCase()
  if (key.length === 1 && key >= 'A' && key <= 'D')
    selectAnswer(game.turn, key.charCodeAt(0) - 65)
  return}
  )

 // This main function is called when a user has attempted to select an answer
 //   (and the game is in progress and not paused)
function selectAnswer(turn, option) {
  if (!gameOver && game.countdown !== 0 && !game.paused &&
    option < game.numAnswers) {
    game.countdown = 0                   // Lock out further mouse/key input
    clearInterval(intervalTimer)
   // Highlight correct answer in green
    switch (game.pCorrect) {
      case 0:
        turn === 1 ? $('#p1answer0').addClass('correct')
                   : $('#p2answer0').addClass('correct')
        break
      case 1:
        turn === 1 ? $('#p1answer1').addClass('correct')
                   : $('#p2answer1').addClass('correct')
        break
      case 2:
        turn === 1 ? $('#p1answer2').addClass('correct')
                   : $('#p2answer2').addClass('correct')
        break
      case 3:
        turn === 1 ? $('#p1answer3').addClass('correct')
                   : $('#p2answer3').addClass('correct')
        }
   // If answer be incorrect, highlight incorrect answer in red
    if (option !== game.pCorrect) {
      switch (option) {
        case 0:
          turn === 1 ? $('#p1answer0').addClass('incorrect')
                     : $('#p2answer0').addClass('incorrect')
          break
        case 1:
          turn === 1 ? $('#p1answer1').addClass('incorrect')
                   : $('#p2answer1').addClass('incorrect')
          break
        case 2:
          turn === 1 ? $('#p1answer2').addClass('incorrect')
                     : $('#p2answer2').addClass('incorrect')
          break
        case 3:
          turn === 1 ? $('#p1answer3').addClass('incorrect')
                     : $('#p2answer3').addClass('incorrect')
          }
      if (turn === 1) {
        $('#p1status').removeClass('correct')
        $('#p1status').text('Incorrect')
        $('#p1status').addClass('incorrect')}
        else {
          $('#p2status').removeClass('correct')
          $('#p2status').text('Incorrect')
          $('#p2status').addClass('incorrect')}
      }
      else {
        if (turn === 1) {
          $('#p1status').removeClass('incorrect')
          $('#p1status').text('Correct')
          $('#p1status').addClass('correct')}
          else {
            $('#p2status').removeClass('incorrect')
            $('#p2status').text('Correct')
            $('#p2status').addClass('correct')}
        if (turn === 1) ++game.p1points
          else ++game.p2points
        game.updatePoints()}
   // Delay before advancing to next question
    timeoutTimer = setTimeout(timeoutFunction, delay)}
  return}

 // Show reset modal to start it all
$(document).ready(function() {
  $('#resetModal').modal('show')
  return}
  )

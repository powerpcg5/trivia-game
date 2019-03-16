 //////////////////////////////////////////////////////////////////////////////
 // trivia-game/assets/javascript/app.js
 // Trivia game using JavaScript timers
 //
 // 2339 Thursday, 14 March 2019 (EDT) [17969]
 //
 // University of Richmond Coding Boot Camp run by Trilogy Education Services
 // Austin Kim
 //
 // Modified:
 //   0006 Friday, 15 March 2019 (EDT) [17970]
 //   0325 Saturday, 16 March 2019 (EDT) [17971]
 //////////////////////////////////////////////////////////////////////////////

 // GLOBAL PARAMETERS, VARIABLES, AND OBJECTS

 // Game parameters (initialized to defaults)
var questions = 20                       // Number of questions per game
var category = 0                         // Question category (0 for none)
var difficulty = ''                      // Level of difficulty (empty for none)
var type = ''                            // Question type (empty for none)
var timeout = 30                         // Question timeout (in seconds)
var delay = 5                            // Delay before next trivia question

 // Player names
var player1, player2

 // Player scores
var score = {
  p1: 0,
  p2: 0}

 // Which player went first in the most recent game
 //   (0 = no one; 1 = player 1; 2 = player 2)
var whoWentFirst = 0

 // Game over status
var gameOver = true

 // JavaScript timers
var intervalTimer                        // Timer for question interval timer
var timeoutTimer                         // Timer for delay between questions

 // GAME OBJECT
var game = {
   // Game-wide member variables
  p1points: 0,                           // Player 1's points
  p2points: 0,                           // Player 2's points
  turn: 0,                               // Player turn (1 = pl. 1, 2 = pl. 2)
  results: [],                           // Trivia questions for game
  question: 0,                           // Question no.
  countdown: 0,                          // Seconds left to answer question
  pause: true,                           // Game paused (ignore click/keyboard)

   // Per-question variables
  categoryName = '',                     // Category name
  pQuestion = '',                        // Trivia question
  numAnswers = 0,                        // The number of possible answers
  pAnswer0 = '',                         // Answer (A.)
  pAnswer1 = '',                         // Answer (B.)
  pAnswer2 = '',                         // Answer (C.)
  pAnswer3 = '',                         // Answer (D.)
  pCorrect = 0,                          // Correct answer (0=A, 1=B, 2=C, 3=D)

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
    if (this.category !== 0) queryURL += `&category=${this.category}`
    if (this.difficulty !== '') queryURL += `&difficulty=${this.difficulty}`
    if (this.type !== '') queryURL += `&type=${this.type}`
    $.ajax({url: queryURL, method: 'GET'}).then(function(response) {
      if (response.response_code !== 0)
        $('#category').text(`Error: response_code = ${response.response_code}`)
        else {
          this.results = response.results
         // Get first question
          this.getQuestion()
         // Start a new game
          gameOver = false
         // Start interval timer
          this.countdown = timeout
          this.displayProgress()
          this.pause = false
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
        if (answerArray.length >= 0) {
          index = Math.floor(answerArray.length * Math.random())
          this.pAnswer2 = answerArray[index].answer
          if (answerArray[index].correct) this.pCorrect = 2
          ++this.numAnswers
          answerArray.splice(index, 1)}
       // Set answer (D.)
        if (answerArray.length >= 0) {
          index = Math.floor(answerArray.length * Math.random())
          this.pAnswer3 = answerArray[index].answer
          if (answerArray[index].correct) this.pCorrect = 3
          ++this.numAnswers
          answerArray.splice(index, 1)}
        }
    this.displayQuestion()
    return},

 // displayQuestion() method:  Display trivia question
  displayQuestion() {
    $('#category').text(`Category:  ${this.categoryName}`)
    if (this.turn === 0) {
      $('#p1question').text(this.pQuestion)
      $('#p1answer0').text(`(A.)  ${this.pAnswer0}`)
      $('#p1answer1').text(`(B.)  ${this.pAnswer1}`)
      if (this.numAnswers >= 3) $('#p1answer2').text(`(C.)  ${this.pAnswer2}`)
        else $('#p1answer2').empty()
      if (this.numAnswers >= 4) $('#p1answer3').text(`(D.)  ${this.pAnswer3}`)
        else $('#p1answer3').empty()
      $('#p2question').empty()
      $('#p2answer0').empty()
      $('#p2answer1').empty()
      $('#p2answer2').empty()
      $('#p2answer3').empty()}
      else {
        $('#p2question').text(this.pQuestion)
        $('#p2answer0').text(`(A.)  ${this.pAnswer0}`)
        $('#p2answer1').text(`(B.)  ${this.pAnswer1}`)
        if (this.numAnswers >= 3) $('#p2answer2').text(`(C.)  ${this.pAnswer2}`)
          else $('#p2answer2').empty()
        if (this.numAnswers >= 4) $('#p2answer3').text(`(D.)  ${this.pAnswer3}`)
          else $('#p2answer3').empty()
        $('#p1question').empty()
        $('#p1answer0').empty()
        $('#p1answer1').empty()
        $('#p1answer2').empty()
        $('#p1answer3').empty()}
    return},

 // displayProgress():   Display countdown progress bar
 //   Assumes that if this.pause === false, progress bar is already present
 //   Otherwise, if this.pause === true, needs to recreate the progress bar
  displayProgress() {
    var progress, progressBar
    if (this.pause) {
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
    $('.progress-bar').text(`${percent}%`)
    return}

 // updateTurn():  Update player turn on page
  updateTurn() {
   // Update player 1 turn field
    var element = document.getElementById('p1turn')
    if (this.turn === 1) element.textContent = 'Your turn'
      else element.textContent = this.p1pass ? 'Pass' : ''
   // Update player 2 turn field
    element = document.getElementById('p2turn')
    if (this.turn === 2) element.textContent = 'Your turn'
      else element.textContent = this.p2pass ? 'Pass' : ''
    return}
  }

 // GLOBAL FUNCTIONS

 // Global resetAll() function (called at beginning and when button is pressed)
function resetAll() {
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
    game.pause = true
    if (game.turn === 1) {
      $('#p1status').empty()
      $('#p1status').text('Time')
      switch (game.pCorrect) {
        case 0:
          $('#p1answer0').addClass('correct')
          break
        case 1:
          $('#p1answer1').addClass('correct')
          break
        case 2:
          $('#p1answer2').addClass('correct')
          break
        case 3:
          $('#p1answer3').addClass('correct')
          }
      }
      else {
        $('#p2status').empty()
        $('#p2status').text('Time')
        switch (game.pCorrect) {
          case 0:
            $('#p2answer0').addClass('correct')
            break
          case 1:
            $('#p2answer1').addClass('correct')
            break
          case 2:
            $('#p2answer2').addClass('correct')
            break
          case 3:
            $('#p2answer3').addClass('correct')
            }
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
      $('#p1status').text('You win')
      $('#p2status').empty()
      ++score.p1}
      else if (game.p2points > game.p1points) {
        $('#p2status').text('You win')
        $('#p1status').empty()
        ++score.p2}
        else {
          $('#p1status').text('You tie')
          $('#p2status').text('You tie')
          score.p1 += 0.5
          score.p2 += 0.5}
    updateScore()
    gameOver = true}
    else {
      $('#p1status').empty()
      $('#p2status').empty()
      game.turn = 3 - game.turn
     // Get next question
      game.getQuestion()
     // Start interval timer
      game.countdown = timeout
      game.displayProgress()
      game.pause = false
      intervalTimer = setInterval(countdownFunction, 1000)
  return}

 // MODAL CALLBACK FUNCTIONS

 // If _Reset All_ be clicked, stop any currently playing game
$('#resetAll').click(function() {
   // Clear all timers
  clearInterval(intervalTimer)
  clearTimeout(timeoutTimer)
  gameOver = true
  return}
  )

 // Likewise, if _New Game_ be clicked, stop any currently playing game
$('#newGame').click(function() {
   // Clear all timers
  clearInterval(intervalTimer)
  clearTimeout(timeoutTimer)
  gameOver = true
   // Initialize game
  game.init()
  return}
  )

 // If _Pause Game_ be clicked, toggle game.pause and suspend/reactivate timers
$('#pauseGame').click(function() {
   // Pause game
  if (game.pause === false) {
    game.pause = true
     // Clear interval timer
    clearInterval(intervalTimer)
    $('#pause').removeClass('btn-outline-warning')
    $('#pause').text('Unpause Game')
    $('#pause').addClass('btn-warning')}
   // Unpause game
    else {
      $('#pause').removeClass('btn-warning')
      $('#pause').text('Pause Game')
      $('#pause').addClass('btn-outline-warning')
      if (game.countdown > 0) {
        intervalTimer = setInterval(countdownFunction, 1000)
        game.pause = false}
      }
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
  $('#goalRangeLower').trigger('focus')
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
    else if (number > 50 || number % 2 !== 0)
      $('#invalidQuestionsModal').modal('show')
      else {
        questions = number
   // Get question category
        value = $('#category').val()
        if (value === '') number = 0
          else number = parseInt(value)
   // Validate question category
////GOT HERE
        if (isNaN(number)) number = 0
          else if (number < 9 || number >= 33) number = 0
            else {
              category = number
   // Get crystal point range lower limit
              element = document.getElementById('crystalRangeLower')
              value = element.value
              if (value === '') number = crystalRangeLower
                else number = parseInt(value)
   // Validate crystal point range lower limit
              if (isNaN(number)) $('#invalidCrystalPointModal').modal('show')
                else if (number < 1)
                  $('#invalidCrystalPointModal').modal('show')
                  else {
                    crystalRangeLower = number
   // Get crystal point range upper limit
                    element = document.getElementById('crystalRangeUpper')
                    value = element.value
                    if (value === '') number = crystalRangeUpper
                      else number = parseInt(value)
   // Validate crystal point range upper limit
                    if (isNaN(number))
                      $('#invalidCrystalPointModal').modal('show')
                      else if (number < crystalRangeLower ||
                       goalRangeUpper < number)
                        $('#invalidCrystalPointModal').modal('show')
                        else {
                          crystalRangeUpper = number
   // Finally, update the instructions with these new numbers
                          element = document.getElementById('instructionsText')
                          var instructions = 'Enter your player names (or ' +
                            'click on Cancel to accept the defaults); then ' +
                            'take turns collecting (clicking on) crystals ' +
                            'to add them to your collection.  Each crystal ' +
                            'has a random point value from ' +
                            crystalRangeLower.toString() +
                            (crystalRangeLower === 1 ? ' point ' : ' points ') +
                            'to ' + crystalRangeUpper.toString() +
                            (crystalRangeUpper === 1 ? ' point ' : ' points ') +
                            '(which is fixed for the duration of the game).  ' +
                            'Your goal is to collect crystals in order to ' +
                            'accumulate points up to, but not exceeding, ' +
                            'the point goal, which is a random number from ' +
                            goalRangeLower.toString() + ' to ' +
                            goalRangeUpper.toString() +
                            (goalRangeUpper === 1 ? ' point ' : ' points ') +
                            '(also fixed for the duration of the game).'
                          element.textContent = instructions}
                    }
              }
        }
  })

 // This function is called when a user clicks on _OK_ in the invalid goal
 //   range modal
$('#invalidGoalRangeOK').click(function() {
   // Return to settings modal
  $('#settingsModal').modal('show')}
  )

 // This function is called when a user clicks on _OK_ in the invalid crystal
 //   point range modal
$('#invalidCrystalPointOK').click(function() {
   // Return to settings modal
  $('#settingsModal').modal('show')}
  )

 // These functions are called when a user clicks on the corresponding crystals
 //   or on the Pass button
$('#pass').click(function() {
  addCrystal(-1)}
  )
$('#crystal0').click(function() {
  addCrystal(0)}
  )
$('#crystal1').click(function() {
  addCrystal(1)}
  )
$('#crystal2').click(function() {
  addCrystal(2)}
  )
$('#crystal3').click(function() {
  addCrystal(3)}
  )

 // This main function is called when a user has clicked on a crystal (or Pass)
function addCrystal(crystal) {
  var element                            // DOM element pointer
  if (gameOver) return
  switch (crystal) {
   // Case -1:  User has clicked on the Pass button
    case -1:
      if (game.turn === 1 && game.p2pass || game.turn === 2 && game.p1pass) {
        else {
          if (game.turn === 1) game.p1pass = true
            else               game.p2pass = true
          game.turn = 3 - game.turn
          game.updateTurn()}
      return
   // Cases 0--3:  User has clicked on the corresponding crystal
    case 0:
      if (game.turn === 1) game.p1points += game.crystal0
        else               game.p2points += game.crystal0
      break
    case 1:
      if (game.turn === 1) game.p1points += game.crystal1
        else               game.p2points += game.crystal1
      break
    case 2:
      if (game.turn === 1) game.p1points += game.crystal2
        else               game.p2points += game.crystal2
      break
    case 3:
      if (game.turn === 1) game.p1points += game.crystal3
        else               game.p2points += game.crystal3
      }
  if (game.turn === 1) game.p1pass = false
    else               game.p2pass = false
  game.addCrystal(crystal)
  updatePoints()
  if (game.p1points === game.goal) {
    element = document.getElementById('p1turn')
    element.textContent = 'You win'
    ++score.p1
    updateScore()
    gameOver = true}
    else if (game.p2points === game.goal) {
      element = document.getElementById('p2turn')
      element.textContent = 'You win'
      ++score.p2
      updateScore()
      gameOver = true}
      else if (game.p1points > game.goal) {
        element = document.getElementById('p1turn')
        element.textContent = 'Bust'
        element = document.getElementById('p2turn')
        element.textContent = 'You win'
        ++score.p2
        updateScore()
        gameOver = true}
        else if (game.p2points > game.goal) {
          element = document.getElementById('p2turn')
          element.textContent = 'Bust'
          element = document.getElementById('p1turn')
          element.textContent = 'You win'
          ++score.p1
          updateScore()
          gameOver = true}
          else {
            game.updateTurn()}
  return}

 // Show reset modal to start it all
$(document).ready(function() {
  $('#resetModal').modal('show')}
  )